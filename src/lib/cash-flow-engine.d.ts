export type CashFlowFrequency = 'Weekly' | 'Biweekly' | 'Monthly' | 'Irregular';
export interface CashFlowTransaction {
  id?: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}
export interface CashFlowBill {
  id?: string;
  title: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}
export interface CashFlowIncomeSchedule {
  amount: number;
  frequency: CashFlowFrequency;
  nextPayday: string;
  label?: string;
}
export interface CashFlowAdjustment {
  id?: string;
  date: string;
  amount: number;
  direction: 'in' | 'out';
  label?: string;
}
export interface CashFlowProjectionInput {
  asOfDate: string;
  openingBalance: number;
  horizonDays: number;
  incomeSchedule?: CashFlowIncomeSchedule;
  transactions?: CashFlowTransaction[];
  bills?: CashFlowBill[];
  adjustments?: CashFlowAdjustment[];
}
export interface CashFlowEvent {
  date: string;
  amount: number;
  direction: 'in' | 'out';
  source: 'recorded-transaction' | 'unpaid-bill' | 'planned-income' | 'scenario-adjustment';
  label: string;
}
export interface CashFlowDay {
  date: string;
  openingBalance: number;
  income: number;
  outflows: number;
  closingBalance: number;
  events: CashFlowEvent[];
}
export interface CashFlowProjection {
  asOfDate: string;
  throughDate: string;
  horizonDays: number;
  openingBalance: number;
  totalIncome: number;
  totalOutflows: number;
  endingBalance: number;
  lowestBalance: number;
  firstShortfallDate: string | null;
  daysBelowZero: number;
  timeline: CashFlowDay[];
  assumptions: string[];
}
export function projectCashFlow(input: CashFlowProjectionInput): CashFlowProjection;
export function simulateCashFlow(input: CashFlowProjectionInput, adjustments: CashFlowAdjustment[]): CashFlowProjection;
