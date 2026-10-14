# RestoSync — Smart Restaurant Management & POS System

RestoSync adalah platform ekosistem restoran modern dan terintegrasi yang menghubungkan tiga entitas utama secara *real-time*:
1. **📱 Modul Pembeli (Customer Mobile Web):** Pemesanan mandiri dari meja berbasis QR Token (*Zero-Login*), kustomisasi varian menu, pelacak status progres masak (*live stepper*), dan tombol panggil pelayan.
2. **💻 Modul Kasir (POS Terminal):** Terminal transaksi cepat ramah layar sentuh, manajemen buka/tutup shift kasir (*cash drawer*) dengan rekonsiliasi selisih kas, denah visual meja (*Table Map*), proteksi pembatalan (*Void*) dengan PIN Supervisor, dan cetak struk thermal instan (Struk Pelanggan & Tiket Dapur ESC/POS 58mm/80mm).
3. **📊 Modul Admin (Back-Office):** Pengendalian master data menu, generator QR Code beresolusi cetak (300 DPI PNG), manajemen bahan baku dengan pemotongan stok otomatis berbasis resep saat pesanan dikonfirmasi, analitik performa finansial (Pendapatan & Laba Kotor), serta ekspor laporan ke Excel (`.xlsx`).

---

## 🚀 Panduan Menjalankan di Lokal (Development)

Proyek ini telah dibangun menggunakan **Fullstack Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Prisma ORM**.

### 1. Jalankan Server Development:
```bash
npm run dev
```
Buka browser pada: [http://localhost:3000](http://localhost:3000)

### 2. URL Akses Modul:
- **Portal Navigasi Utama:** [http://localhost:3000](http://localhost:3000)
- **Modul Pembeli (Contoh Meja 01):** [http://localhost:3000/table/resto-qr-tbl-01-secure](http://localhost:3000/table/resto-qr-tbl-01-secure)
- **Modul Kasir POS:** [http://localhost:3000/pos](http://localhost:3000/pos)
- **Modul Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

> **Supervisor PIN Default untuk Void:** `123456`

---

## ☁️ Panduan Deploy 100% Gratis ke Vercel

Karena dibangun menggunakan **Next.js Fullstack**, proses deployment ke Vercel sangat mudah (*zero-config*):

### Langkah 1: Push Proyek ke GitHub
```bash
git init
git add .
git commit -m "feat: initial commit RestoSync fullstack"
# Hubungkan ke repository GitHub Anda:
git remote add origin https://github.com/USERNAME/restosync.git
git branch -M main
git push -u origin main
```

### Langkah 2: Setup Database Serverless Gratis (Supabase / Neon)
Karena filesystem Vercel bersifat *serverless/read-only*, gunakan database PostgreSQL cloud gratis:
1. Buat database gratis di **[Neon.tech](https://neon.tech)** atau **[Supabase.com](https://supabase.com)** (Free Tier selamanya).
2. Salin *Connection String* PostgreSQL, contoh:
   `postgresql://neondb_owner:password@ep-cool-server.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Langkah 3: Deploy di Vercel
1. Buka **[vercel.com](https://vercel.com)** dan klik **"Add New Project"**.
2. Pilih repositori GitHub Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: Isi dengan connection string PostgreSQL dari Neon / Supabase.
   - `SUPERVISOR_PIN`: `123456`
   - `NEXT_PUBLIC_APP_URL`: URL deployment Anda (misal: `https://restosync.vercel.app`)
4. Klik **Deploy**! Vercel akan otomatis melakukan build dan aplikasi Anda langsung aktif di seluruh dunia.

---

## 📋 Fitur yang Telah Diimplementasikan Sesuai PRD

### 1. Modul Pembeli (`/table/[token]`)
- [x] **Zero-Login QR Token:** Autentikasi meja otomatis via signed token.
- [x] **Katalog Menu Interaktif:** Filter kategori, pencarian fuzzy, status ketersediaan (*Ready* / *Sold Out*).
- [x] **Modal Kustomisasi:** Single-choice modifier (Level pedas, pilihan nasi, suhu), multiple-choice modifier (extra topping), dan kolom catatan khusus.
- [x] **Keranjang Belanja Persisten:** Penyimpanan state di browser via Zustand & Local Storage.
- [x] **Live Order Tracking Stepper:** Status progres real-time (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `SERVED` ➔ `COMPLETED`).
- [x] **Panggil Pelayan (*Call Waiter*):** Mengirim alert instan ke layar kasir.

### 2. Modul Kasir POS (`/pos`)
- [x] **Manajemen Shift & Cash Drawer:** Input modal awal (*Starting Cash*), hitung kas fisik akhir (*Ending Cash*), kalkulasi otomatis ekspektasi kas dan selisih (*variance*).
- [x] **POS Terminal Touch-Friendly:** Grid menu cepat, penanganan Dine-In dan Takeaway, shortcut keyboard (`F2` Cari, `F4` Bayar, `ESC` Batal).
- [x] **Table Map Dashboard:** Status visual 4 warna: Hijau (Kosong), Kuning (Menunggu Bayar), Merah (Aktif/Masak), Ungu (Reserved).
- [x] **Fitur Pindah Meja (*Move Table*):** Otomatis memindahkan tagihan ke meja baru.
- [x] **Cetak Struk Thermal Direct (ESC/POS 58mm/80mm):**
  - Struk Pelanggan: Rincian item, PPN 10%, service 5%, nama kasir, kembalian.
  - Tiket Dapur / Bar: Hanya menu dan catatan khusus tanpa nominal harga.
- [x] **Proteksi Void:** Pembatalan item/pesanan wajib otorisasi PIN Supervisor (`123456`) dan alasan pembatalan.

### 3. Modul Admin Back-Office (`/admin`)
- [x] **Analitik Finansial:** Metrik pendapatan kotor, estimasi gross profit, jumlah pesanan, dan average order value.
- [x] **Rekapitulasi Pembayaran:** Pembagian transaksi Tunai vs QRIS vs Kartu Debit.
- [x] **Ranking Menu:** Menu terlaris (*Top Selling*) dan pemantauan *Dead Stock*.
- [x] **Ekspor Excel (.xlsx):** Unduh rekapitulasi penjualan ke format Excel.
- [x] **Master Data Menu:** Tambah/edit menu, foto produk, harga, dan tombol buka/tutup ketersediaan.
- [x] **Generator QR Code Dinamis:** Cetak standee meja dan unduh PNG resolusi tinggi dengan branding RestoSync.
- [x] **Bahan Baku & Resep Otomatis:** Master stok bahan baku (gram, ml, pcs), warning stok menipis, restock modal, dan **pemotongan stok otomatis** saat pesanan berstatus `CONFIRMED`.
- [x] **Audit Shift & Log:** Riwayat buka/tutup kasir dengan selisih kas serta 50 audit log aktivitas sistem terakhir.

---

## 🛠️ Struktur Direktori Proyek

```
Restaurant/
├── prisma/
│   ├── schema.prisma       # Skema database SQLite & PostgreSQL
│   ├── seed.js             # Seeder data menu, meja, resep, dan shift
│   └── dev.db              # Database SQLite lokal
├── src/
│   ├── app/
│   │   ├── admin/          # Modul Admin Back-Office
│   │   ├── pos/            # Modul Kasir POS Terminal
│   │   ├── table/[token]/  # Modul Pembeli Mobile Web
│   │   ├── api/v1/         # Backend REST API Handlers
│   │   ├── globals.css     # Tailwind & Thermal Print CSS
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Portal RestoSync
│   └── lib/
│       ├── cart-store.ts   # Zustand persist store untuk keranjang pembeli
│       ├── prisma.ts       # Singleton Prisma Client
│       └── utils.ts        # Helper IDR currency & formatters
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
