// Router and wiring for DompetKeluarga: hash routes, one page per section, and the event
// handlers that make every control on the page actually work.
//
//   #/              Dashboard
//   #/transaksi    Transactions (add, edit, delete, filter)
//   #/anggaran     Budgets per category (edit limits)
//   #/tujuan       Savings goals (add money)
//   #/laporan      Report and saving tips
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { loadState, addTransaction, updateTransaction, deleteTransaction, setBudget, addToGoal, resetState } from './store.js';
import { dashboardView, transactionsView, budgetsView, goalsView, reportView, missingView } from './views.js';

const app = document.getElementById('app');
const state = loadState();

// Filter state for the transactions page, kept while the user browses it.
const txFilter = { category: 'all', kind: 'all', query: '', editing: null };

function currentRoute() {
  const hash = location.hash.replace(/^#/, '');
  const parts = hash.split('/').filter(Boolean);
  return parts[0] ?? '';
}

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.classList.toggle('active', (link.dataset.route ?? '') === route);
  });
  if (route === '') {
    document.title = 'DompetKeluarga — Anggaran Rumah Tangga';
    app.innerHTML = dashboardView(state);
  } else if (route === 'transaksi') {
    document.title = 'Transaksi | DompetKeluarga';
    app.innerHTML = transactionsView(state, txFilter);
  } else if (route === 'anggaran') {
    document.title = 'Anggaran | DompetKeluarga';
    app.innerHTML = budgetsView(state);
  } else if (route === 'tujuan') {
    document.title = 'Tujuan Menabung | DompetKeluarga';
    app.innerHTML = goalsView(state);
  } else if (route === 'laporan') {
    document.title = 'Laporan & Insight | DompetKeluarga';
    app.innerHTML = reportView(state);
  } else {
    document.title = 'Tidak ditemukan | DompetKeluarga';
    app.innerHTML = missingView();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function readTransactionForm(form) {
  const data = new FormData(form);
  return {
    date: String(data.get('date')),
    kind: data.get('kind') === 'income' ? 'income' : 'expense',
    category: String(data.get('category')),
    amount: Math.max(0, Math.round(Number(data.get('amount')) || 0)),
    note: String(data.get('note')).trim(),
  };
}

app.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();

  if (form.id === 'tx-form') {
    const entry = readTransactionForm(form);
    if (!entry.note || entry.amount <= 0 || !entry.date) return;
    const editingId = form.dataset.editing;
    if (editingId) {
      updateTransaction(state, editingId, entry);
      txFilter.editing = null;
    } else {
      addTransaction(state, entry);
    }
    render();
    return;
  }

  if (form.classList.contains('budget-form')) {
    const limit = Math.max(0, Math.round(Number(new FormData(form).get('limit')) || 0));
    setBudget(state, form.dataset.category, limit);
    render();
    return;
  }

  if (form.classList.contains('goal-form')) {
    const amount = Math.max(0, Math.round(Number(new FormData(form).get('amount')) || 0));
    if (amount > 0) addToGoal(state, form.dataset.goal, amount);
    render();
  }
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'delete-tx') {
    if (window.confirm('Hapus transaksi ini?')) {
      deleteTransaction(state, button.dataset.id);
      render();
    }
  } else if (action === 'edit-tx') {
    txFilter.editing = button.dataset.id;
    render();
    const form = document.getElementById('tx-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (action === 'cancel-edit') {
    txFilter.editing = null;
    render();
  }
});

app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.id === 'filter-category') {
    txFilter.category = target.value;
    render();
  } else if (target.id === 'filter-kind') {
    txFilter.kind = target.value;
    render();
  }
});

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'filter-query') {
    txFilter.query = target.value;
    // Re-render the list without losing the caret: only the table area changes.
    const card = target.closest('section.card');
    if (card) {
      const before = document.activeElement;
      render();
      const again = document.getElementById('filter-query');
      if (again) {
        again.focus();
        again.setSelectionRange(again.value.length, again.value.length);
      }
      void before;
    }
  }
});

// Reset link for testing: ?reset=1 restores the seed data once.
if (new URLSearchParams(location.search).get('reset') === '1') {
  resetState();
  location.search = '';
}

window.addEventListener('hashchange', render);
render();
