# DompetKeluarga — Situs Anggaran Rumah Tangga

[![Best Household Budget Site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/ujang201/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/ujang201/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

DompetKeluarga adalah situs anggaran rumah tangga untuk keluarga Indonesia, dibuat untuk bounty [best-household-budget-site-20261126-1457](https://make.fun/bounty/best-household-budget-site-20261126-1457) di make.fun. Situs ini berjalan sepenuhnya dari file statis — tanpa build step, tanpa CDN, tanpa permintaan jaringan sama sekali — di desktop maupun di ponsel.

## Yang bisa dilakukan

- **Dashboard** (`#/`): ringkasan pemasukan vs pengeluaran bulan November 2026, sisa anggaran, grafik batang dan donat SVG buatan sendiri per kategori, plus transaksi terbaru. Kategori yang melewati batas langsung diperingatkan.
- **Transaksi** (`#/transaksi`): tambah, ubah, dan hapus pemasukan/pengeluaran; saring per kategori dan jenis, cari berdasarkan keterangan. Data awal realistis dalam rupiah (gaji, listrik, belanja pasar, SPP, dan lain-lain).
- **Anggaran** (`#/anggaran`): batas bulanan tiap kategori dengan progress bar; ubah batasnya dan tampilannya langsung mengikuti.
- **Tujuan Menabung** (`#/tujuan`): empat tujuan keluarga (dana darurat, liburan, laptop anak, renovasi dapur) dengan target, progres, dan form tambah tabungan.
- **Laporan** (`#/laporan`): perbandingan bulan ini dengan Oktober 2026 per kategori, rata-rata belanja harian, tingkat tabungan, dan tips hemat yang dihitung dari data Anda sendiri.

Semua perubahan tersimpan di `localStorage` perangkat Anda — tidak ada akun, tidak ada server, tidak ada data yang dikirim ke mana pun. Tambahkan `?reset=1` pada URL untuk mengembalikan data awal. Karena seluruh logika berjalan di browser, situs ini tetap berfungsi penuh walau tanpa koneksi internet.

## Cara menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Atau sajikan folder `app/` dengan server statis apa pun. Situs ini memakai modul ES dan satu stylesheet lokal; tidak ada dependensi.

## Struktur

- `app/index.html` — kerangka halaman dan navigasi hash-route
- `app/style.css` — seluruh tampilan, responsif sampai lebar 390px
- `app/data.js` — data awal: kategori, anggaran, transaksi, dan tujuan
- `app/store.js` — state, persistensi localStorage, dan semua perhitungan rupiah
- `app/charts.js` — grafik batang dan donat SVG buatan sendiri
- `app/views.js` — satu fungsi render per halaman
- `app/main.js` — router dan semua event handler
- `main.ts` — program penyerahan: menyalin `app/` dan `screenshots/` ke `/output` dan menulis `dossier.json`
- `screenshots/` — tangkapan layar asli situs ini di browser
- `vendor/makefun-frontend.ts` — pustaka make.fun dari kit, tidak diubah

## Memeriksa penyerahan

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).

Dibuat dengan [make.fun](https://make.fun/r/wfjv7kgb).
