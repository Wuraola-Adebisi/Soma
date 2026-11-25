import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSharedBalances } from '../src/lib/shared-money-calculations.js';

const members = [{ id: 'ada', name: 'Ada' }, { id: 'bola', name: 'Bola' }];
const expense = { payer: 'ada', amount: 100, splits: [{ member: 'ada', amount: 50 }, { member: 'bola', amount: 50 }] };

test('calculates the initial expense balances', () => {
  assert.deepEqual(calculateSharedBalances(members, [expense], []), [
    { ...members[0], balance: 50 }, { ...members[1], balance: -50 },
  ]);
});

test('a partial settlement reduces the debtor balance and creditor balance', () => {
  assert.deepEqual(calculateSharedBalances(members, [expense], [
    { from: 'bola', to: 'ada', amount: 20 },
  ]), [
    { ...members[0], balance: 30 }, { ...members[1], balance: -30 },
  ]);
});

test('a full settlement brings both members to zero', () => {
  assert.deepEqual(calculateSharedBalances(members, [expense], [
    { from: 'bola', to: 'ada', amount: 50 },
  ]), [
    { ...members[0], balance: 0 }, { ...members[1], balance: 0 },
  ]);
});

test('settlements in the reverse direction reduce the recipient credit', () => {
  const reverseExpense = { payer: 'bola', amount: 100, splits: [
    { member: 'ada', amount: 50 }, { member: 'bola', amount: 50 },
  ] };
  assert.deepEqual(calculateSharedBalances(members, [reverseExpense], [
    { from: 'ada', to: 'bola', amount: 15 },
  ]), [
    { ...members[0], balance: -35 }, { ...members[1], balance: 35 },
  ]);
});

test('preserves cent precision in split calculations', () => {
  const three = [...members, { id: 'cy', name: 'Cy' }];
  const divided = { payer: 'ada', amount: 10, splits: [
    { member: 'ada', amount: 3.33 }, { member: 'bola', amount: 3.33 }, { member: 'cy', amount: 3.34 },
  ] };
  assert.deepEqual(calculateSharedBalances(three, [divided], []), [
    { ...members[0], balance: 6.67 }, { ...members[1], balance: -3.33 }, { id: 'cy', name: 'Cy', balance: -3.34 },
  ]);
});
