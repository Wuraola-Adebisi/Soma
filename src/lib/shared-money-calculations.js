export function calculateSharedBalances(members, expenses, settlements) {
  const balances = new Map(members.map((member) => [member.id, 0]));
  for (const expense of expenses) {
    balances.set(expense.payer, (balances.get(expense.payer) ?? 0) + expense.amount);
    for (const split of expense.splits) balances.set(split.member, (balances.get(split.member) ?? 0) - split.amount);
  }
  for (const settlement of settlements) {
    balances.set(settlement.from, (balances.get(settlement.from) ?? 0) + settlement.amount);
    balances.set(settlement.to, (balances.get(settlement.to) ?? 0) - settlement.amount);
  }
  return members.map((member) => ({ ...member, balance: Math.round(((balances.get(member.id) ?? 0) + Number.EPSILON) * 100) / 100 }));
}
