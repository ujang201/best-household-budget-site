// The household's own ledger: loads the seed data on first run, then keeps every change
// in localStorage on this device. Nothing leaves the browser.

import {
  CATEGORIES,
  MONTHLY_BUDGETS,
  MONTHLY_INCOME,
  PREVIOUS_MONTH_SPENDING,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data.js';

const STORAGE_KEY = 'dompetkeluarga-v1';

function freshState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...MONTHLY_BUDGETS },
    goals: SEED_GOALS.map((g) => ({ ...g })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !parsed.budgets || !Array.isArray(parsed.goals)) {
      return freshState();
    }
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return freshState();
}

export function categoryName(id) {
  if (id === 'gaji') return 'Pemasukan';
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function categoryColor(id) {
  return CATEGORIES.find((c) => c.id === id)?.color ?? '#718096';
}

export function formatRupiah(amount) {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function totalIncome(state) {
  return state.transactions
    .filter((t) => t.kind === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalSpending(state) {
  return state.transactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function spendingByCategory(state) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  for (const t of state.transactions) {
    if (t.kind === 'expense' && totals[t.category] !== undefined) totals[t.category] += t.amount;
  }
  return totals;
}

export function monthlyIncomeTarget() {
  return MONTHLY_INCOME;
}

export function previousMonthSpending() {
  return PREVIOUS_MONTH_SPENDING;
}

export function addTransaction(state, entry) {
  const id = 't' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
  const transaction = { id, ...entry };
  state.transactions.push(transaction);
  state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  saveState(state);
  return transaction;
}

export function updateTransaction(state, id, patch) {
  const found = state.transactions.find((t) => t.id === id);
  if (!found) return false;
  Object.assign(found, patch);
  state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  saveState(state);
  return true;
}

export function deleteTransaction(state, id) {
  const index = state.transactions.findIndex((t) => t.id === id);
  if (index === -1) return false;
  state.transactions.splice(index, 1);
  saveState(state);
  return true;
}

export function setBudget(state, categoryId, limit) {
  state.budgets[categoryId] = limit;
  saveState(state);
}

export function addToGoal(state, goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return false;
  goal.saved = Math.min(goal.target, goal.saved + amount);
  saveState(state);
  return true;
}
