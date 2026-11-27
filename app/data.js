// Seed data for DompetKeluarga: a realistic Indonesian household in November 2026.
// All figures are rupiah. The store loads a copy of this seed on first run; later runs
// read the family's own edits from localStorage instead.

export const MONTH = 'November 2026';
export const MONTH_KEY = '2026-11';
export const PREVIOUS_MONTH = 'Oktober 2026';

export const CATEGORIES = [
  { id: 'belanja', name: 'Belanja Harian', color: '#1e7a4c' },
  { id: 'makan', name: 'Makan di Luar', color: '#b7791f' },
  { id: 'transport', name: 'Transportasi', color: '#2b6cb0' },
  { id: 'tagihan', name: 'Tagihan & Utilitas', color: '#6b46c1' },
  { id: 'sekolah', name: 'Sekolah Anak', color: '#c53030' },
  { id: 'hiburan', name: 'Hiburan', color: '#dd6b20' },
  { id: 'kesehatan', name: 'Kesehatan', color: '#319795' },
  { id: 'lainnya', name: 'Lainnya', color: '#718096' },
];

export const MONTHLY_BUDGETS = {
  belanja: 3500000,
  makan: 1200000,
  transport: 1500000,
  tagihan: 2200000,
  sekolah: 1800000,
  hiburan: 600000,
  kesehatan: 500000,
  lainnya: 400000,
};

export const MONTHLY_INCOME = 12500000;

export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', kind: 'income', category: 'gaji', note: 'Gaji bulanan — Ayah', amount: 9500000 },
  { id: 't02', date: '2026-11-01', kind: 'income', category: 'gaji', note: 'Gaji bulanan — Ibu', amount: 3000000 },
  { id: 't03', date: '2026-11-02', kind: 'expense', category: 'tagihan', note: 'Listrik PLN', amount: 685000 },
  { id: 't04', date: '2026-11-02', kind: 'expense', category: 'tagihan', note: 'Internet rumah', amount: 350000 },
  { id: 't05', date: '2026-11-03', kind: 'expense', category: 'belanja', note: 'Belanja mingguan pasar', amount: 520000 },
  { id: 't06', date: '2026-11-04', kind: 'expense', category: 'sekolah', note: 'SPP anak pertama', amount: 950000 },
  { id: 't07', date: '2026-11-05', kind: 'expense', category: 'transport', note: 'Bensin motor', amount: 150000 },
  { id: 't08', date: '2026-11-06', kind: 'expense', category: 'makan', note: 'Makan malam keluarga', amount: 285000 },
  { id: 't09', date: '2026-11-07', kind: 'expense', category: 'belanja', note: 'Sembako & kebutuhan dapur', amount: 640000 },
  { id: 't10', date: '2026-11-08', kind: 'expense', category: 'hiburan', note: 'Bioskop akhir pekan', amount: 210000 },
  { id: 't11', date: '2026-11-09', kind: 'expense', category: 'transport', note: 'Ojek online', amount: 98000 },
  { id: 't12', date: '2026-11-10', kind: 'expense', category: 'belanja', note: 'Belanja mingguan pasar', amount: 485000 },
  { id: 't13', date: '2026-11-11', kind: 'expense', category: 'kesehatan', note: 'Vitamin & obat flu', amount: 175000 },
  { id: 't14', date: '2026-11-12', kind: 'expense', category: 'tagihan', note: 'Air PDAM', amount: 210000 },
  { id: 't15', date: '2026-11-13', kind: 'expense', category: 'makan', note: 'Jajan siang anak', amount: 120000 },
  { id: 't16', date: '2026-11-14', kind: 'expense', category: 'belanja', note: 'Belanja mingguan pasar', amount: 510000 },
  { id: 't17', date: '2026-11-15', kind: 'expense', category: 'sekolah', note: 'Buku & alat tulis', amount: 320000 },
  { id: 't18', date: '2026-11-16', kind: 'expense', category: 'transport', note: 'Bensin mobil', amount: 300000 },
  { id: 't19', date: '2026-11-17', kind: 'expense', category: 'makan', note: 'Makan siang kantor', amount: 145000 },
  { id: 't20', date: '2026-11-18', kind: 'expense', category: 'hiburan', note: 'Langganan streaming', amount: 149000 },
  { id: 't21', date: '2026-11-19', kind: 'expense', category: 'belanja', note: 'Belanja mingguan pasar', amount: 465000 },
  { id: 't22', date: '2026-11-20', kind: 'expense', category: 'lainnya', note: 'Servis AC', amount: 250000 },
  { id: 't23', date: '2026-11-21', kind: 'expense', category: 'transport', note: 'Tol & parkir', amount: 86000 },
  { id: 't24', date: '2026-11-22', kind: 'expense', category: 'makan', note: 'Makan malam keluarga', amount: 310000 },
  { id: 't25', date: '2026-11-23', kind: 'expense', category: 'belanja', note: 'Belanja mingguan pasar', amount: 498000 },
  { id: 't26', date: '2026-11-24', kind: 'expense', category: 'tagihan', note: 'Pulsa & paket data', amount: 180000 },
  { id: 't27', date: '2026-11-25', kind: 'expense', category: 'kesehatan', note: 'Periksa gigi anak', amount: 220000 },
];

// Spending in October 2026, per category, for the month-on-month comparison on the report page.
export const PREVIOUS_MONTH_SPENDING = {
  belanja: 3350000,
  makan: 1420000,
  transport: 1280000,
  tagihan: 2050000,
  sekolah: 1650000,
  hiburan: 720000,
  kesehatan: 310000,
  lainnya: 540000,
};

export const SEED_GOALS = [
  { id: 'g1', name: 'Dana darurat', target: 15000000, saved: 9800000, note: 'Enam bulan biaya hidup, disimpan di rekening terpisah.' },
  { id: 'g2', name: 'Liburan keluarga ke Yogyakarta', target: 6000000, saved: 3750000, note: 'Berangkat saat libur sekolah Desember.' },
  { id: 'g3', name: 'Laptop baru untuk anak', target: 8000000, saved: 2100000, note: 'Untuk tugas sekolah dan belajar coding.' },
  { id: 'g4', name: 'Renovasi dapur', target: 12000000, saved: 1400000, note: 'Ganti kabinet dan meja dapur.' },
];
