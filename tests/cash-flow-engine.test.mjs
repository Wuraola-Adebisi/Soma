import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCashFlow, simulateCashFlow } from '../src/lib/cash-flow-engine.js';

const base = {
  asOfDate: '2026-11-25',
  openingBalance: 1000,
  horizonDays: 30,
  incomeSchedule: { amount: 2000, frequency: 'Monthly', nextPayday: '2026-12-01' },
};

test('projects dated transactions and unpaid bills day by day', () => {
  const result = projectCashFlow({
    ...base,
    transactions: [{ title: 'Food', amount: 120, date: '2026-11-26', type: 'expense' }],
    bills: [{ title: 'Rent', amount: 500, dueDate: '2026-11-28', paid: false }],
  });
  assert.equal(result.timeline.length, 31);
  assert.equal(result.timeline[1].closingBalance, 880);
  assert.equal(result.timeline[3].closingBalance, 380);
  assert.equal(result.endingBalance, 2380);
  assert.equal(result.totalIncome, 2000);
  assert.equal(result.totalOutflows, 620);
});

test('paid bills are excluded', () => {
  const result = projectCashFlow({ ...base, bills: [{ title: 'Rent', amount: 500, dueDate: '2026-11-28', paid: true }] });
  assert.equal(result.totalOutflows, 0);
});

test('matching future expense and bill are not double-counted', () => {
  const result = projectCashFlow({
    ...base,
    transactions: [{ title: 'Rent', amount: 500, date: '2026-11-28', type: 'expense' }],
    bills: [{ title: ' rent ', amount: 500, dueDate: '2026-11-28', paid: false }],
  });
  assert.equal(result.totalOutflows, 500);
});

test('weekly and biweekly income schedules recur at the correct intervals', () => {
  const weekly = projectCashFlow({ ...base, incomeSchedule: { amount: 100, frequency: 'Weekly', nextPayday: '2026-11-27' } });
  assert.equal(weekly.totalIncome, 500);
  const biweekly = projectCashFlow({ ...base, incomeSchedule: { amount: 100, frequency: 'Biweekly', nextPayday: '2026-11-27' } });
  assert.equal(biweekly.totalIncome, 300);
});

test('monthly income keeps its original day when February is shorter', () => {
  const result = projectCashFlow({
    asOfDate: '2027-01-30', openingBalance: 0, horizonDays: 60,
    incomeSchedule: { amount: 100, frequency: 'Monthly', nextPayday: '2027-01-31' },
  });
  assert.deepEqual(result.timeline.filter(day => day.income > 0).map(day => day.date), ['2027-01-31', '2027-02-28', '2027-03-31']);
});

test('a dated income record replaces recurring income on the same payday', () => {
  const result = projectCashFlow({
    ...base,
    transactions: [{ title: 'Salary received', amount: 1800, date: '2026-12-01', type: 'income' }],
  });
  assert.equal(result.totalIncome, 1800);
});

test('records dated before the projection start are not counted again', () => {
  const result = projectCashFlow({
    ...base,
    transactions: [{ title: 'Old purchase', amount: 80, date: '2026-11-24', type: 'expense' }],
  });
  assert.equal(result.totalOutflows, 0);
});

test('reports the first projected cash shortfall and days below zero', () => {
  const result = projectCashFlow({
    asOfDate: '2026-11-25', openingBalance: 50, horizonDays: 5,
    bills: [{ title: 'Power', amount: 80, dueDate: '2026-11-27', paid: false }],
  });
  assert.equal(result.firstShortfallDate, '2026-11-27');
  assert.equal(result.lowestBalance, -30);
  assert.equal(result.daysBelowZero, 4);
});

test('what-if adjustments change the projection without mutating the baseline', () => {
  const input = { ...base, bills: [{ title: 'Rent', amount: 500, dueDate: '2026-11-28', paid: false }] };
  const baseline = projectCashFlow(input);
  const scenario = simulateCashFlow(input, [{ date: '2026-11-29', amount: 250, direction: 'out', label: 'Extra repair' }]);
  assert.equal(baseline.endingBalance, 2500);
  assert.equal(scenario.endingBalance, 2250);
  assert.equal(baseline.totalOutflows, 500);
  assert.equal(scenario.totalOutflows, 750);
});

test('rejects invalid dates, negative amounts and unsupported horizons', () => {
  assert.throws(() => projectCashFlow({ ...base, asOfDate: '2026-02-30' }), /valid calendar date/);
  assert.equal(projectCashFlow({ ...base, openingBalance: -1 }).openingBalance, -1);
  assert.throws(() => projectCashFlow({ ...base, horizonDays: 400 }), /1 to 366/);
});

test('irregular income is not projected without dated income records', () => {
  const result = projectCashFlow({ ...base, incomeSchedule: { amount: 1000, frequency: 'Irregular', nextPayday: '2026-12-01' } });
  assert.equal(result.totalIncome, 0);
});

test('overdue unpaid bills are included on the projection start date', () => {
  const result = projectCashFlow({
    asOfDate: '2026-11-25', openingBalance: 500, horizonDays: 10,
    bills: [{ title: 'Power', amount: 100, dueDate: '2026-11-20', paid: false }],
  });
  assert.equal(result.timeline[0].outflows, 100);
  assert.equal(result.endingBalance, 400);
});

test('recurring unpaid bills project future monthly occurrences', () => {
  const result = projectCashFlow({
    asOfDate: '2026-11-25', openingBalance: 1000, horizonDays: 70,
    bills: [{ title: 'Internet', amount: 50, dueDate: '2026-11-30', paid: false, recurring: true }],
  });
  assert.equal(result.totalOutflows, 150);
  assert.deepEqual(result.timeline.filter(day => day.outflows > 0).map(day => day.date), ['2026-11-30', '2026-12-30', '2027-01-30']);
});

test('an already recorded payment prevents an overdue bill from being counted again', () => {
  const result = projectCashFlow({
    asOfDate: '2026-11-25', openingBalance: 500, horizonDays: 10,
    transactions: [{ title: 'Power', amount: 100, date: '2026-11-24', type: 'expense' }],
    bills: [{ title: 'Power', amount: 100, dueDate: '2026-11-20', paid: false }],
  });
  assert.equal(result.totalOutflows, 0);
});

test('an already negative starting balance is reported from the projection date', () => {
  const result = projectCashFlow({
    asOfDate: '2026-11-25', openingBalance: -20, horizonDays: 3,
  });
  assert.equal(result.firstShortfallDate, '2026-11-25');
  assert.equal(result.lowestBalance, -20);
});
