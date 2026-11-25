const DAY_MS = 86_400_000;

function toCents(value, field, allowNegative = false) {
  if (!Number.isFinite(value) || (!allowNegative && value < 0)) throw new RangeError(`${field} must be a finite, ${allowNegative ? '' : 'non-negative '}amount.`);
  return Math.round((value + Number.EPSILON) * 100);
}

function parseDate(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${field} must be an ISO date in YYYY-MM-DD format.`);
  }
  const time = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) {
    throw new RangeError(`${field} is not a valid calendar date.`);
  }
  return time;
}

function fromDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

function addMonthlyFromAnchor(anchor, occurrence) {
  const source = new Date(parseDate(anchor, 'incomeSchedule.nextPayday'));
  const monthIndex = source.getUTCFullYear() * 12 + source.getUTCMonth() + occurrence;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return fromDate(Date.UTC(year, month, Math.min(source.getUTCDate(), lastDay)));
}

function recurringPaydays(schedule, start, end) {
  if (!schedule) return [];
  if (!['Weekly', 'Biweekly', 'Monthly', 'Irregular'].includes(schedule.frequency)) throw new TypeError('Unsupported income frequency.');
  const amount = toCents(schedule.amount, 'incomeSchedule.amount');
  if (schedule.frequency === 'Irregular' || amount === 0) return [];
  const anchor = parseDate(schedule.nextPayday, 'incomeSchedule.nextPayday');
  const dates = [];
  if (schedule.frequency === 'Weekly' || schedule.frequency === 'Biweekly') {
    const interval = (schedule.frequency === 'Weekly' ? 7 : 14) * DAY_MS;
    let date = anchor;
    if (date < start) date += Math.ceil((start - date) / interval) * interval;
    for (; date <= end; date += interval) dates.push({ date: fromDate(date), amount, direction: 'in', source: 'planned-income', label: 'Expected income' });
    return dates;
  }
  if (schedule.frequency === 'Monthly') {
    const anchorDate = new Date(anchor);
    let monthOffset = (new Date(start).getUTCFullYear() - anchorDate.getUTCFullYear()) * 12 +
      new Date(start).getUTCMonth() - anchorDate.getUTCMonth();
    monthOffset = Math.max(0, monthOffset - 1);
    for (let i = monthOffset; i < 600; i += 1) {
      const date = addMonthlyFromAnchor(schedule.nextPayday, i);
      const time = parseDate(date, 'generated payday');
      if (time > end) break;
      if (time >= start) dates.push({ date, amount, direction: 'in', source: 'planned-income', label: 'Expected income' });
    }
  }
  return dates;
}

function normalizeTitle(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

/**
 * Produce a transparent daily cash-flow projection.
 * openingBalance must be the user's actual balance on asOfDate.
 * All amounts are in the selected currency's major unit.
 */
export function projectCashFlow(input) {
  if (!input || typeof input !== 'object') throw new TypeError('A projection input is required.');
  const start = parseDate(input.asOfDate, 'asOfDate');
  const opening = toCents(input.openingBalance, 'openingBalance', true);
  if (!Number.isInteger(input.horizonDays) || input.horizonDays < 1 || input.horizonDays > 366) {
    throw new RangeError('horizonDays must be an integer from 1 to 366.');
  }
  const end = start + input.horizonDays * DAY_MS;
  const events = [];
  const addEvent = (date, amount, direction, source, label) => {
    const time = parseDate(date, 'event.date');
    if (time < start || time > end) return;
    events.push({ date, amount: toCents(amount, 'event.amount'), direction, source, label: String(label || 'Planned item') });
  };

  for (const tx of input.transactions || []) {
    if (tx.type !== 'income' && tx.type !== 'expense') throw new TypeError('Each transaction type must be income or expense.');
    addEvent(tx.date, tx.amount, tx.type === 'income' ? 'in' : 'out', 'recorded-transaction', tx.title);
  }

  for (const bill of input.bills || []) {
    if (bill.paid) continue;
    const duplicate = (input.transactions || []).some((tx) =>
      tx.type === 'expense' && tx.date === bill.dueDate &&
      Math.round(tx.amount * 100) === Math.round(bill.amount * 100) &&
      normalizeTitle(tx.title) === normalizeTitle(bill.title)
    );
    if (!duplicate) addEvent(bill.dueDate, bill.amount, 'out', 'unpaid-bill', bill.title);
  }

  const explicitIncomeDates = new Set((input.transactions || [])
    .filter((tx) => tx.type === 'income')
    .map((tx) => tx.date));
  for (const payday of recurringPaydays(input.incomeSchedule, start, end)) {
    // A dated income transaction takes precedence over the recurring estimate on that date.
    if (!explicitIncomeDates.has(payday.date)) {
      events.push({ ...payday, label: input.incomeSchedule.label || payday.label });
    }
  }

  for (const adjustment of input.adjustments || []) {
    if (adjustment.direction !== 'in' && adjustment.direction !== 'out') {
      throw new TypeError('Each scenario adjustment direction must be in or out.');
    }
    addEvent(adjustment.date, adjustment.amount, adjustment.direction, 'scenario-adjustment', adjustment.label || 'What-if adjustment');
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.source.localeCompare(b.source));
  const byDate = new Map();
  for (const event of events) {
    if (!byDate.has(event.date)) byDate.set(event.date, []);
    byDate.get(event.date).push(event);
  }

  let balance = opening;
  let totalIncome = 0;
  let totalOutflows = 0;
  let lowestBalance = opening;
  let firstShortfallDate = null;
  let daysBelowZero = 0;
  const timeline = [];

  for (let day = 0; day <= input.horizonDays; day += 1) {
    const date = fromDate(start + day * DAY_MS);
    const dayEvents = byDate.get(date) || [];
    let dayIncome = 0;
    let dayOutflow = 0;
    for (const event of dayEvents) {
      if (event.direction === 'in') {
        balance += event.amount;
        dayIncome += event.amount;
        totalIncome += event.amount;
      } else {
        balance -= event.amount;
        dayOutflow += event.amount;
        totalOutflows += event.amount;
      }
    }
    if (balance < lowestBalance) lowestBalance = balance;
    if (balance < 0) {
      daysBelowZero += 1;
      if (!firstShortfallDate) firstShortfallDate = date;
    }
    timeline.push({
      date,
      openingBalance: day === 0 ? opening / 100 : timeline[day - 1].closingBalance,
      income: dayIncome / 100,
      outflows: dayOutflow / 100,
      closingBalance: balance / 100,
      events: dayEvents.map((event) => ({
        date: event.date,
        amount: event.amount / 100,
        direction: event.direction,
        source: event.source,
        label: event.label,
      })),
    });
  }

  return {
    asOfDate: input.asOfDate,
    throughDate: fromDate(end),
    horizonDays: input.horizonDays,
    openingBalance: opening / 100,
    totalIncome: totalIncome / 100,
    totalOutflows: totalOutflows / 100,
    endingBalance: balance / 100,
    lowestBalance: lowestBalance / 100,
    firstShortfallDate,
    daysBelowZero,
    timeline,
    assumptions: [
      'The opening balance is the amount supplied by the user for the projection start date.',
      'Recurring income is projected from the next payday using the selected frequency.',
      'A dated income transaction replaces the recurring income estimate on the same date.',
      'Only unpaid bills are included; a matching dated expense transaction prevents the same bill being counted twice.',
      'Recurring bills are represented by the bill occurrences currently recorded in Soma. The engine does not invent future bill occurrences.',
      'Scenario adjustments are hypothetical and are kept separate from recorded transactions.',
      'The projection uses entered information and does not connect to bank accounts or verify balances.',
    ],
  };
}

/** Run the same projection with hypothetical dated cash-flow changes. */
export function simulateCashFlow(input, adjustments) {
  return projectCashFlow({ ...input, adjustments: [...(input.adjustments || []), ...adjustments] });
}
