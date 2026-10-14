# 🚀 Panduan Hosting SAVORIA Restaurant di Vercel (100% Gratis & Permanen)

Panduan lengkap untuk mendeploy sistem restoran **SAVORIA** ke **Vercel** dengan database Cloud PostgreSQL (**Neon** / **Supabase**) agar seluruh transaksi, pesanan, dan menu tersimpan secara permanen.

---

## 📌 Mengapa Menggunakan PostgreSQL Cloud?
Vercel adalah platform *Serverless*. File lokal seperti SQLite (`dev.db`) bersifat *read-only* dan akan terhapus saat server istirahat. Dengan menghubungkan ke database cloud PostgreSQL gratis (**Neon** bawaan Vercel atau **Supabase**), seluruh data pesanan, reservasi, dan shift kasir Anda akan **tersimpan abadi** dan dapat diakses dari mana saja.

---

## 🛠️ Langkah-Langkah Deployment (Hanya 3 Menit)

### Langkah 1: Hubungkan Repositori ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** di pojok kanan atas, lalu pilih **"Project"**.
3. Cari dan pilih repositori Anda: **`bagasdwisss/restaurant-platform`**.
4. Klik tombol **"Import"**.

---

### Langkah 2: Buat Database Cloud (Pilih Salah Satu)

#### Pilihan A: Neon Postgres (Bawaan Vercel - Sangat Mudah 1 Klik)
1. Di Dashboard Vercel project Anda, buka tab **Storage**.
2. Klik **Connect Store** > Pilih **Postgres (Neon)** > Klik **Continue**.
3. Beri nama database (misal: `savoria-db`), pilih region terdekat (misal: `Singapore (sin1)`), lalu klik **Create**.
4. Vercel akan **secara otomatis** memasukkan variabel `DATABASE_URL` ke dalam Environment Variables proyek Anda tanpa perlu copy-paste manual!

#### Pilihan B: Supabase (Alternatif Populer)
1. Buka [https://supabase.com](https://supabase.com) dan buat project baru gratis.
2. Masuk ke **Project Settings** > **Database** > cari bagian **Connection string** (URI).
3. Salin connection string tersebut, lalu masukkan ke Vercel Environment Variables dengan nama `DATABASE_URL`.

---

### Langkah 3: Konfigurasi Environment Variables di Vercel
Pada halaman konfigurasi proyek Vercel (atau di menu **Settings > Environment Variables**), pastikan variabel berikut terisi:

| Key | Value Contoh | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | *(Otomatis terisi jika pakai Neon di Vercel Storage)* |
| `NEXT_PUBLIC_APP_URL` | `https://restaurant-platform-bagas.vercel.app` | URL domain Vercel Anda |
| `SUPERVISOR_PIN` | `123456` | PIN supervisor untuk void pesanan & buka laci kasir |

---

### Langkah 4: Build & Deployment Setting
Karena database Neon sudah langsung terhubung lewat tab **Storage** Vercel (`Connected Projects: restaurant-platform`), Vercel sudah otomatis memiliki variabel `DATABASE_URL`!
- Pada menu **Settings** > **General** > **Build & Development Settings**, gunakan Build Command default atau:
  ```bash
  npm run build
  ```
- File `prisma/seed.js` kini bersifat **Safe Non-Destructive**, sehingga data akun baru, transaksi pesanan, shift kasir, dan audit log tidak akan pernah terhapus saat build/update dijalankan.

---

### Langkah 5: Deploy!
1. Buka tab **Deployments** lalu klik tombol **"Redeploy"** (atau push commit baru ke branch `main`).
2. Tunggu proses build selesai (~1-2 menit).
3. Selamat! Sistem restoran Anda sekarang sudah aktif dan dapat diakses publik dengan domain `https://restaurant-platform-xxx.vercel.app` 🎉

---

## 🔑 Akses Akun Bawaan (Setelah Deploy)
* **Admin Portal (`/admin`)**:
  * Username / Key: `admin` / Unique Key: `ROYALE-ADMIN-SECRET-KEY`
* **Kasir & Waiter POS (`/pos`)**:
  * Username / Key: `kasir` / Unique Key: `ROYALE-CASHIER-ACCESS-KEY`
* **VIP Member Customer (`/user`)**:
  * Username / Key: `user` / Unique Key: `ROYALE-VIP-CUSTOMER-KEY`
* **Customer Table QR**:
  * Format URL meja: `/table/qr-table-01` sampai `/table/qr-table-08`
