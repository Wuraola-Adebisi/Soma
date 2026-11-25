import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CalendarDays, RefreshCw, Wallet } from 'lucide-react';
import { projectCashFlow, simulateCashFlow } from './lib/cash-flow-engine.js';
import type { CashFlowAdjustment, CashFlowProjectionInput } from './lib/cash-flow-engine.js';
import './cash-flow-outlook.css';

type Transaction = { id: string; title: string; amount: number; date: string; type: 'income' | 'expense' };
type Bill = { id: string; title: string; amount: number; dueDate: string; paid: boolean };
type Props = {
  currency: string; income: number; frequency: 'Monthly' | 'Weekly' | 'Biweekly' | 'Irregular';
  nextPayday: string; transactions: Transaction[]; bills: Bill[];
  cashBalance?: number; cashBalanceDate?: string;
  onSaveBalance: (amount: number, date: string) => void;
};
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const plusDays = (s: string, n: number) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export default function CashFlowOutlook(props: Props) {
  const today = todayISO();
  const [draft, setDraft] = useState(props.cashBalance === undefined ? '' : String(props.cashBalance));
  const [error, setError] = useState('');
  const [days, setDays] = useState<30 | 60 | 90>(30);
  const [scenarioDate, setScenarioDate] = useState(plusDays(today, 7));
  const [scenarioAmount, setScenarioAmount] = useState('');
  const [scenarioDirection, setScenarioDirection] = useState<'in' | 'out'>('out');
  const [scenarioLabel, setScenarioLabel] = useState('');
  const [scenario, setScenario] = useState<CashFlowAdjustment | null>(null);
  const fresh = props.cashBalance !== undefined && props.cashBalanceDate === today;
  const input = useMemo<CashFlowProjectionInput | null>(() => fresh ? ({
    asOfDate: today, openingBalance: props.cashBalance!, horizonDays: days,
    incomeSchedule: { amount: props.income, frequency: props.frequency, nextPayday: props.nextPayday },
    transactions: props.transactions, bills: props.bills,
  }) : null, [fresh, today, days, props.cashBalance, props.income, props.frequency, props.nextPayday, props.transactions, props.bills]);
  const baseline = useMemo(() => input ? projectCashFlow(input) : null, [input]);
  const result = useMemo(() => input && scenario ? simulateCashFlow(input, [scenario]) : baseline, [input, scenario, baseline]);
  const money = (n: number) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: props.currency, maximumFractionDigits: 2 }).format(n); } catch { return n.toFixed(2) + ' ' + props.currency; } };
  const save = (e: FormEvent) => {
    e.preventDefault(); const n = Number(draft);
    if (!draft.trim() || !Number.isFinite(n)) { setError('Enter a valid balance. Use a minus sign if the account is overdrawn.'); return; }
    props.onSaveBalance(Math.round((n + Number.EPSILON) * 100) / 100, today); setError('');
  };
  const addScenario = (e: FormEvent) => {
    e.preventDefault(); const n = Number(scenarioAmount);
    if (!scenarioLabel.trim() || !Number.isFinite(n) || n <= 0 || scenarioDate < today) return;
    setScenario({ date: scenarioDate, amount: Math.round(n * 100) / 100, direction: scenarioDirection, label: scenarioLabel.trim() });
  };
  const events = baseline?.timeline.flatMap(day => day.events.map(event => ({ ...event }))) || [];

  return <section className="cash-outlook" aria-labelledby="cash-outlook-title">
    <header className="cash-outlook-head">
      <div><span className="cash-outlook-eyebrow"><Wallet size={14}/> Planning tool</span><h2 id="cash-outlook-title">Cash flow outlook</h2><p>See how your plans and upcoming commitments could affect your balance.</p></div>
      {baseline && <div className="cash-outlook-horizons" aria-label="Projection period">{([30,60,90] as const).map(n => <button type="button" key={n} className={days===n?'active':''} onClick={()=>setDays(n)}>{n} days</button>)}</div>}
    </header>
    {!fresh ? <div className="cash-outlook-start">
      {props.cashBalance !== undefined && <div className="cash-outlook-stale" role="status"><AlertTriangle size={17}/> Your saved balance is from {props.cashBalanceDate || 'an earlier date'}. Update it to project from today.</div>}
      <div className="cash-outlook-start-copy"><div className="cash-outlook-wallet"><Wallet size={20}/></div><div><h3>Start with your current balance</h3><p>Enter the amount currently available in the account or cash you want to plan. This is a manual starting figure, not a bank connection.</p></div></div>
      <form className="cash-outlook-balance-form" onSubmit={save}><label htmlFor="cash-current-balance">Current balance ({props.currency})</label><input id="cash-current-balance" inputMode="decimal" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="e.g. 250000 or -12000"/><p>You can enter a negative amount if you are overdrawn. Update it when your real balance changes.</p>{error&&<p className="cash-outlook-error" role="alert">{error}</p>}<button className="primary" type="submit">Save current balance</button></form>
    </div> : baseline && result && <>
      <div className="cash-outlook-metrics">
        <article className="cash-outlook-metric cash-outlook-metric-primary"><span>Projected balance</span><strong>{money(result.endingBalance)}</strong><small>At the end of {days} days</small></article>
        <article className="cash-outlook-metric"><span>Lowest projected balance</span><strong>{money(result.lowestBalance)}</strong><small>Lowest point in this period</small></article>
        <article className="cash-outlook-metric"><span>Expected money in</span><strong>{money(result.totalIncome)}</strong><small>Recorded and scheduled income</small></article>
        <article className="cash-outlook-metric"><span>Planned money out</span><strong>{money(result.totalOutflows)}</strong><small>Transactions and unpaid bills</small></article>
      </div>
      {result.firstShortfallDate ? <div className="cash-outlook-alert" role="status"><AlertTriangle size={18}/><span>Based on these entries, the projected balance falls below zero on <strong>{result.firstShortfallDate}</strong>. This is an estimate, not a confirmed future shortfall.</span></div> : <div className="cash-outlook-positive" role="status">No below-zero balance is projected in this period using the information entered.</div>}
      <div className="cash-outlook-lower">
        <div className="cash-outlook-panel"><div className="cash-outlook-panel-heading"><div><h3>Upcoming cash flow</h3><p>Items included in the baseline projection.</p></div><CalendarDays size={18}/></div>
          {events.length ? <div className="cash-outlook-events">{events.slice(0,10).map((event,i)=><div className="cash-outlook-event" key={event.date+event.label+i}><span className={'cash-outlook-event-icon '+event.direction}>{event.direction==='in'?<ArrowDownLeft size={16}/>:<ArrowUpRight size={16}/>}</span><span className="cash-outlook-event-main"><strong>{event.label}</strong><small>{event.date} · {event.source==='planned-income'?'Expected income':event.source==='unpaid-bill'?'Unpaid bill':'Recorded transaction'}</small></span><strong className={event.direction==='in'?'money-in':'money-out'}>{event.direction==='in'?'+':'−'}{money(event.amount)}</strong></div>)}</div> : <p className="cash-outlook-empty">No dated income, expenses or unpaid bills fall within this period.</p>}
          <details className="cash-outlook-assumptions"><summary>How this projection is calculated</summary><ul>{baseline.assumptions.map(item=><li key={item}>{item}</li>)}</ul></details>
        </div>
        <div className="cash-outlook-panel cash-outlook-scenario"><div className="cash-outlook-panel-heading"><div><h3>Try a what-if change</h3><p>Test a possible expense or extra income without changing your records.</p></div><RefreshCw size={18}/></div>
          <form onSubmit={addScenario}><label>What are you changing?<input value={scenarioLabel} onChange={e=>setScenarioLabel(e.target.value)} placeholder="e.g. Replace my laptop" required/></label><div className="cash-outlook-scenario-row"><label>Amount<input type="number" min="0.01" step="0.01" value={scenarioAmount} onChange={e=>setScenarioAmount(e.target.value)} placeholder="0.00" required/></label><label>Date<input type="date" min={today} value={scenarioDate} onChange={e=>setScenarioDate(e.target.value)} required/></label></div><label>Money movement<select value={scenarioDirection} onChange={e=>setScenarioDirection(e.target.value as 'in'|'out')}><option value="out">Money going out</option><option value="in">Money coming in</option></select></label><button className="primary" type="submit">Compare this scenario</button></form>
          {scenario&&<div className="cash-outlook-scenario-result"><p><strong>{scenario.label}</strong> is included as a hypothetical {scenario.direction==='in'?'inflow':'outflow'} on {scenario.date}.</p><div><span>Baseline ending balance</span><strong>{money(baseline.endingBalance)}</strong></div><div><span>With this change</span><strong>{money(result.endingBalance)}</strong></div><button type="button" className="cash-outlook-clear" onClick={()=>setScenario(null)}>Remove scenario</button></div>}
        </div>
      </div>
    </>}
  </section>;
}
