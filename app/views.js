// One render function per page. Each returns an HTML string; main.js drops it into #app
// and wires the page's controls. All figures come from the store, never from hard-coded text.

import { CATEGORIES, MONTH, MONTH_KEY, PREVIOUS_MONTH } from './data.js';
import {
  categoryColor,
  categoryName,
  formatDate,
  formatRupiah,
  monthlyIncomeTarget,
  previousMonthSpending,
  spendingByCategory,
  totalIncome,
  totalSpending,
} from './store.js';
import { barChart, donutChart } from './charts.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortRupiah(amount) {
  if (amount >= 1000000) return 'Rp ' + (amount / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (amount >= 1000) return 'Rp ' + Math.round(amount / 1000) + ' rb';
  return formatRupiah(amount);
}

function budgetStatus(spent, limit) {
  if (spent > limit) return { label: 'Melewati batas', pill: 'over', fill: 'over' };
  if (spent / limit >= 0.8) return { label: 'Hampir habis', pill: 'warn', fill: 'warn' };
  return { label: 'Aman', pill: '', fill: '' };
}

function transactionRows(transactions) {
  return transactions
    .map((t) => {
      const sign = t.kind === 'income' ? '+' : '−';
      const cls = t.kind === 'income' ? 'income' : 'expense';
      return `<tr>
        <td>${formatDate(t.date)}</td>
        <td>${escapeHtml(t.note)}</td>
        <td class="hide-phone">${escapeHtml(categoryName(t.category))}</td>
        <td class="num ${cls}">${sign} ${formatRupiah(t.amount)}</td>
        <td>
          <button class="small secondary" type="button" data-action="edit-tx" data-id="${t.id}">Ubah</button>
          <button class="small danger" type="button" data-action="delete-tx" data-id="${t.id}">Hapus</button>
        </td>
      </tr>`;
    })
    .join('');
}

export function dashboardView(state) {
  const income = totalIncome(state);
  const spent = totalSpending(state);
  const remaining = income - spent;
  const byCategory = spendingByCategory(state);
  const totalBudget = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const budgetUsed = Math.min(100, Math.round((spent / totalBudget) * 100));
  const savedSoFar = state.goals.reduce((sum, g) => sum + g.saved, 0);

  const sorted = CATEGORIES.map((c) => ({
    label: c.name,
    value: byCategory[c.id],
    valueLabel: shortRupiah(byCategory[c.id]),
    color: c.color,
  })).sort((a, b) => b.value - a.value);

  const recent = [...state.transactions].slice(0, 6);
  const overBudget = CATEGORIES.filter((c) => byCategory[c.id] > state.budgets[c.id]);

  return `
  <div class="page-head">
    <h1>Dashboard — ${MONTH}</h1>
    <p>Ringkasan keuangan keluarga bulan ini, dihitung langsung dari transaksi yang tercatat.</p>
  </div>
  ${overBudget.length ? `<div class="notice bad"><strong>Perhatian:</strong> kategori ${overBudget.map((c) => escapeHtml(c.name)).join(', ')} sudah melewati batas anggarannya bulan ini.</div>` : `<div class="notice good"><strong>Semua kategori masih dalam batas anggaran.</strong> Sisa bulan ini Rp ${formatRupiah(remaining)} bisa ditabung atau dipakai darurat.</div>`}
  <section class="cards" aria-label="Ringkasan bulan ini">
    <div class="card"><h2>Pemasukan</h2><div class="big good">${formatRupiah(income)}</div><div class="sub">Target ${formatRupiah(monthlyIncomeTarget())}</div></div>
    <div class="card"><h2>Pengeluaran</h2><div class="big bad">${formatRupiah(spent)}</div><div class="sub">${budgetUsed}% dari total anggaran ${formatRupiah(totalBudget)}</div></div>
    <div class="card"><h2>Sisa Anggaran</h2><div class="big">${formatRupiah(remaining)}</div><div class="sub">${income ? Math.round((remaining / income) * 100) : 0}% pemasukan belum terpakai</div></div>
    <div class="card"><h2>Total Tabungan Tujuan</h2><div class="big">${formatRupiah(savedSoFar)}</div><div class="sub">${state.goals.length} tujuan menabung aktif</div></div>
  </section>
  <section class="grid-2">
    <div class="card">
      <h2>Pengeluaran per kategori</h2>
      ${barChart(sorted)}
    </div>
    <div class="card">
      <h2>Pembagian pengeluaran</h2>
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        ${donutChart(sorted, { centerLabel: shortRupiah(spent) })}
        <div class="legend">${sorted.map((r) => `<span><i style="background:${r.color}"></i>${escapeHtml(r.label)}</span>`).join('')}</div>
      </div>
    </div>
  </section>
  <section class="card">
    <h2>Transaksi terbaru</h2>
    <table>
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="hide-phone">Kategori</th><th class="num">Jumlah</th><th></th></tr></thead>
      <tbody>${transactionRows(recent)}</tbody>
    </table>
    <p class="mt"><a href="#/transaksi">Lihat semua transaksi &rarr;</a></p>
  </section>`;
}

export function transactionsView(state, filter) {
  let list = [...state.transactions];
  if (filter.category !== 'all') list = list.filter((t) => t.category === filter.category);
  if (filter.kind !== 'all') list = list.filter((t) => t.kind === filter.kind);
  if (filter.query) {
    const q = filter.query.toLowerCase();
    list = list.filter((t) => t.note.toLowerCase().includes(q));
  }
  const shownSpent = list.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
  const shownIncome = list.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amount, 0);
  const editing = filter.editing ? state.transactions.find((t) => t.id === filter.editing) : null;

  const categoryOptions = ['all', ...CATEGORIES.map((c) => c.id), 'gaji']
    .map((id) => `<option value="${id}" ${filter.category === id ? 'selected' : ''}>${id === 'all' ? 'Semua kategori' : escapeHtml(categoryName(id))}</option>`)
    .join('');

  return `
  <div class="page-head">
    <h1>Transaksi — ${MONTH}</h1>
    <p>${state.transactions.length} transaksi tercatat. Tambah, ubah, atau hapus — semuanya langsung tersimpan di perangkat ini.</p>
  </div>
  <section class="card" style="margin-bottom:14px">
    <h2>${editing ? 'Ubah transaksi' : 'Tambah transaksi baru'}</h2>
    <form id="tx-form" data-editing="${editing ? editing.id : ''}">
      <div class="toolbar" style="margin-bottom:0">
        <label>Tanggal <input type="date" name="date" required value="${editing ? editing.date : MONTH_KEY + '-26'}"></label>
        <label>Jenis
          <select name="kind">
            <option value="expense" ${editing?.kind === 'expense' || !editing ? 'selected' : ''}>Pengeluaran</option>
            <option value="income" ${editing?.kind === 'income' ? 'selected' : ''}>Pemasukan</option>
          </select>
        </label>
        <label>Kategori
          <select name="category">
            ${CATEGORIES.map((c) => `<option value="${c.id}" ${editing?.category === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
            <option value="gaji" ${editing?.category === 'gaji' ? 'selected' : ''}>Pemasukan</option>
          </select>
        </label>
        <label>Jumlah (Rp) <input type="number" name="amount" min="1000" step="1000" required value="${editing ? editing.amount : ''}" placeholder="250000"></label>
        <label>Keterangan <input type="text" name="note" maxlength="80" required value="${editing ? escapeHtml(editing.note) : ''}" placeholder="Contoh: Belanja mingguan pasar"></label>
      </div>
      <div>
        <button type="submit">${editing ? 'Simpan perubahan' : 'Tambah transaksi'}</button>
        ${editing ? '<button type="button" class="secondary" data-action="cancel-edit">Batal</button>' : ''}
      </div>
    </form>
  </section>
  <section class="card">
    <div class="toolbar">
      <label>Kategori <select id="filter-category">${categoryOptions}</select></label>
      <label>Jenis
        <select id="filter-kind">
          <option value="all" ${filter.kind === 'all' ? 'selected' : ''}>Semua</option>
          <option value="expense" ${filter.kind === 'expense' ? 'selected' : ''}>Pengeluaran</option>
          <option value="income" ${filter.kind === 'income' ? 'selected' : ''}>Pemasukan</option>
        </select>
      </label>
      <label>Cari keterangan <input type="search" id="filter-query" value="${escapeHtml(filter.query)}" placeholder="mis. pasar, listrik"></label>
    </div>
    <p class="muted small">Menampilkan ${list.length} transaksi — pemasukan ${formatRupiah(shownIncome)}, pengeluaran ${formatRupiah(shownSpent)}.</p>
    ${list.length ? `<table>
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="hide-phone">Kategori</th><th class="num">Jumlah</th><th></th></tr></thead>
      <tbody>${transactionRows(list)}</tbody>
    </table>` : '<p class="muted">Tidak ada transaksi yang cocok dengan filter ini.</p>'}
  </section>`;
}

export function budgetsView(state) {
  const byCategory = spendingByCategory(state);
  const rows = CATEGORIES.map((c) => {
    const spent = byCategory[c.id];
    const limit = state.budgets[c.id];
    const pct = Math.min(100, Math.round((spent / limit) * 100));
    const status = budgetStatus(spent, limit);
    return `<div class="goal">
      <div class="goal-head">
        <strong>${escapeHtml(c.name)}</strong>
        <span class="pill ${status.pill}">${status.label} — ${pct}%</span>
      </div>
      <p class="goal-meta">${formatRupiah(spent)} dari ${formatRupiah(limit)} &middot; sisa ${formatRupiah(Math.max(0, limit - spent))}</p>
      <div class="progress"><span class="${status.fill}" style="width:${pct}%"></span></div>
      <form class="budget-form" data-category="${c.id}" style="margin-top:8px;grid-template-columns:1fr auto;grid-template-rows:none;display:grid;gap:8px;max-width:420px">
        <label class="small">Ubah batas bulanan (Rp)
          <input type="number" name="limit" min="0" step="50000" value="${limit}" required>
        </label>
        <button type="submit" class="secondary small" style="align-self:end">Simpan batas</button>
      </form>
    </div>`;
  }).join('');

  const totalSpent = totalSpending(state);
  const totalLimit = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  return `
  <div class="page-head">
    <h1>Anggaran per Kategori — ${MONTH}</h1>
    <p>Setiap kategori punya batas bulanan. Ubah batasnya kapan pun — progress bar langsung mengikuti.</p>
  </div>
  <section class="cards">
    <div class="card"><h2>Total Anggaran</h2><div class="big">${formatRupiah(totalLimit)}</div><div class="sub">Untuk ${CATEGORIES.length} kategori</div></div>
    <div class="card"><h2>Terpakai</h2><div class="big bad">${formatRupiah(totalSpent)}</div><div class="sub">${Math.round((totalSpent / totalLimit) * 100)}% dari total anggaran</div></div>
    <div class="card"><h2>Sisa Anggaran</h2><div class="big">${formatRupiah(Math.max(0, totalLimit - totalSpent))}</div><div class="sub">${totalSpent > totalLimit ? 'Total pengeluaran sudah melewati anggaran.' : 'Masih dalam batas total.'}</div></div>
  </section>
  <section class="card">${rows}</section>`;
}

export function goalsView(state) {
  const rows = state.goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const left = g.target - g.saved;
    return `<div class="goal">
      <div class="goal-head">
        <strong>${escapeHtml(g.name)}</strong>
        <span class="pill ${pct >= 100 ? '' : pct >= 75 ? 'warn' : ''}">${pct}% tercapai</span>
      </div>
      <p class="goal-meta">${formatRupiah(g.saved)} dari target ${formatRupiah(g.target)} &middot; ${left > 0 ? 'kurang ' + formatRupiah(left) : 'target tercapai!'}</p>
      <div class="progress"><span class="${pct >= 100 ? '' : pct >= 75 ? 'warn' : ''}" style="width:${pct}%"></span></div>
      <p class="small muted">${escapeHtml(g.note)}</p>
      ${left > 0 ? `<form class="goal-form" data-goal="${g.id}" style="grid-template-columns:1fr auto;grid-template-rows:none;display:grid;gap:8px;max-width:420px">
        <label class="small">Tambah tabungan (Rp)
          <input type="number" name="amount" min="1000" step="10000" required placeholder="100000">
        </label>
        <button type="submit" class="secondary small" style="align-self:end">Tambah</button>
      </form>` : '<p class="small"><strong>Selamat, target tercapai!</strong></p>'}
    </div>`;
  }).join('');

  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <div class="page-head">
    <h1>Tujuan Menabung</h1>
    <p>Empat tujuan keluarga. Setiap rupiah yang ditambahkan langsung menggerakkan progress bar.</p>
  </div>
  <section class="cards">
    <div class="card"><h2>Total Terkumpul</h2><div class="big">${formatRupiah(totalSaved)}</div><div class="sub">dari target ${formatRupiah(totalTarget)}</div></div>
    <div class="card"><h2>Rata-rata Tercapai</h2><div class="big">${Math.round((totalSaved / totalTarget) * 100)}%</div><div class="sub">${state.goals.filter((g) => g.saved >= g.target).length} dari ${state.goals.length} tujuan sudah tercapai</div></div>
  </section>
  <section class="card">${rows}</section>`;
}

export function reportView(state) {
  const byCategory = spendingByCategory(state);
  const prev = previousMonthSpending();
  const spent = totalSpending(state);
  const income = totalIncome(state);
  const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
  const change = spent - prevTotal;
  const changePct = prevTotal ? Math.round((change / prevTotal) * 100) : 0;

  const rows = CATEGORIES.map((c) => {
    const now = byCategory[c.id];
    const then = prev[c.id];
    const diff = now - then;
    const pct = then ? Math.round((diff / then) * 100) : 0;
    return { name: c.name, now, then, diff, pct, color: c.color };
  }).sort((a, b) => b.diff - a.diff);

  const biggest = rows[0];
  const biggestSaver = rows[rows.length - 1];
  const overBudget = CATEGORIES.filter((c) => byCategory[c.id] > state.budgets[c.id]);
  const dailyAverage = Math.round(spent / 26);
  const savingsRate = income ? Math.round(((income - spent) / income) * 100) : 0;

  const tips = [];
  if (overBudget.length) {
    tips.push({
      title: 'Kategori melewati batas: ' + overBudget.map((c) => c.name).join(', '),
      body: `Pengeluaran di kategori ini sudah di atas batas bulanannya. Cek transaksi terbesarnya di halaman Transaksi dan geser sebagian ke bulan depan, atau naikkan batasnya di halaman Anggaran kalau memang kebutuhan.`,
    });
  }
  if (biggest.diff > 0) {
    tips.push({
      title: `${biggest.name} naik paling besar dibanding ${PREVIOUS_MONTH}`,
      body: `${biggest.name} naik ${formatRupiah(biggest.diff)} (${biggest.pct}%) dibanding bulan lalu. Kalau kenaikan ini bukan kebutuhan sekali saja, sisihkan anggaran bulan depan dari kategori yang turun.`,
    });
  }
  if (biggestSaver.diff < 0) {
    tips.push({
      title: `${biggestSaver.name} berhasil dihemat`,
      body: `${biggestSaver.name} turun ${formatRupiah(-biggestSaver.diff)} dibanding bulan lalu. Pertahankan kebiasaan ini dan alihkan selisihnya ke tujuan menabung.`,
    });
  }
  tips.push({
    title: `Rata-rata belanja harian ${formatRupiah(dailyAverage)}`,
    body: `Dengan 4 hari tersisa di bulan ini, menjaga belanja harian di bawah ${formatRupiah(dailyAverage)} membuat total pengeluaran tetap di bawah pemasukan.`,
  });
  tips.push({
    title: `Tingkat tabungan ${savingsRate}% dari pemasukan`,
    body: savingsRate >= 20
      ? 'Tingkat tabungan sudah sehat (di atas 20%). Salurkan sisa anggaran ke dana darurat.'
      : 'Tingkat tabungan di bawah 20%. Coba potong satu langganan atau satu kali makan di luar per minggu — selisihnya langsung terasa.',
  });

  return `
  <div class="page-head">
    <h1>Laporan &amp; Insight — ${MONTH}</h1>
    <p>Bulan ini dibanding ${PREVIOUS_MONTH}, dihitung dari transaksi yang tercatat.</p>
  </div>
  <section class="cards">
    <div class="card"><h2>Pengeluaran Bulan Ini</h2><div class="big bad">${formatRupiah(spent)}</div><div class="sub">${change >= 0 ? 'Naik' : 'Turun'} ${formatRupiah(Math.abs(change))} (${Math.abs(changePct)}%) dari ${PREVIOUS_MONTH}</div></div>
    <div class="card"><h2>Pemasukan</h2><div class="big good">${formatRupiah(income)}</div><div class="sub">Selisih pemasukan − pengeluaran: ${formatRupiah(income - spent)}</div></div>
    <div class="card"><h2>Rata-rata Harian</h2><div class="big">${formatRupiah(dailyAverage)}</div><div class="sub">26 hari tercatat bulan ini</div></div>
    <div class="card"><h2>Tingkat Tabungan</h2><div class="big">${savingsRate}%</div><div class="sub">dari pemasukan bulan ini</div></div>
  </section>
  <section class="card" style="margin-bottom:14px">
    <h2>Perbandingan per kategori dengan ${PREVIOUS_MONTH}</h2>
    <table>
      <thead><tr><th>Kategori</th><th class="num">${PREVIOUS_MONTH}</th><th class="num">${MONTH}</th><th class="num">Selisih</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${r.color};margin-right:6px"></i>${escapeHtml(r.name)}</td>
        <td class="num">${formatRupiah(r.then)}</td>
        <td class="num">${formatRupiah(r.now)}</td>
        <td class="num ${r.diff > 0 ? 'expense' : 'income'}">${r.diff > 0 ? '+' : '−'} ${formatRupiah(Math.abs(r.diff))} (${r.pct > 0 ? '+' : ''}${r.pct}%)</td>
      </tr>`).join('')}</tbody>
    </table>
  </section>
  <section class="card">
    <h2>Tips hemat berdasarkan data Anda</h2>
    ${tips.map((t) => `<div class="tip"><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.body)}</p></div>`).join('')}
  </section>`;
}

export function missingView() {
  return `
  <div class="page-head">
    <h1>Halaman tidak ditemukan</h1>
    <p>Halaman yang Anda cari tidak ada. Kembali ke <a href="#/">Dashboard</a> atau pilih halaman lain dari navigasi di atas.</p>
  </div>`;
}
