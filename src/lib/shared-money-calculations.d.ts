export interface SharedMoneyMember { id: string; }
export interface SharedMoneyExpense { payer: string; amount: number; splits: { member: string; amount: number }[]; }
export interface SharedMoneySettlement { from: string; to: string; amount: number; }
export type SharedMoneyBalance<T extends SharedMoneyMember = SharedMoneyMember> = T & { balance: number };
export function calculateSharedBalances<T extends SharedMoneyMember>(members: T[], expenses: SharedMoneyExpense[], settlements: SharedMoneySettlement[]): SharedMoneyBalance<T>[];
