# Dokumentasi Arsitektur & Spesifikasi GoodWaste

**GoodWaste** adalah platform aplikasi web fungsional dengan filosofi *clean utility* (anti-AI slop) untuk membantu masyarakat Indonesia mengelola sampah rumah tangga, mempraktikkan daur ulang kreatif (DIY Upcycling), mendapatkan insentif *Eco Points*, dan menyalurkan sampah ke titik Bank Sampah / TPS 3R terdekat.

---

## 1. Tech Stack

- **Frontend**: Next.js 14 (App Router, Tailwind CSS, Lucide React Icons, Canvas Confetti)
- **Backend**: NestJS (TypeScript, Prisma ORM, Multer, Bcrypt)
- **Database**: PostgreSQL 18 (Service lokal aktif di port `5432`, nama DB: `goodwaste`)
- **Integrasi**: 
  - Google Gemini API (`@google/generative-ai` model `gemini-1.5-flash` dengan fallback deteksi cerdas)
  - Google Maps JavaScript API (dengan fallback peta interaktif ramah kuota & visual bersih)

---

## 2. Arsitektur Halaman & Fitur Utama

### A. Sistem Akun Pengguna (`/login`, `/register`)
- Autentikasi email & kata sandi dengan enkripsi `bcryptjs`.
- Nilai awal pengguna baru:
  - `eco_points = 0`
  - `co2_saved_kg = 0.0`
- Disediakan akun demo 1-klik (`budi@goodwaste.id` / `password123`) untuk kemudahan eksplorasi.

### B. Halaman Scan & Aksi (`/`)
- **Header Ringkas**: Menampilkan Saldo Poin pengguna dan Total Reduksi Emisi Karbon (`kg CO₂e`).
- **Area Kamera / Upload**:
  - Mendukung jepretan kamera langsung (`capture="environment"`) & berkas galeri.
  - Tersedia 4 tombol sampel uji 1-klik (*Botol Plastik PET*, *Kaleng Minuman*, *Kardus Paket*, *Gelas Kopi*).
- **Deteksi Cerdas (Gemini Vision)**:
  - Mengidentifikasi Nama Barang & Kategori Sampah.
  - Menghitung perkiraan reduksi emisi karbon gas rumah kaca (kg CO₂e).
  - Memberikan 1 rekomendasi kerajinan tangan sederhana (DIY) beserta langkah ringkas bernomor.
- **2 Tombol Aksi Nyata**:
  - **Aksi 1: "Selesai Bikin Kerajinan"** -> Menambah **+30 Eco Points** ke akun & memperbarui saldo emisi karbon.
  - **Aksi 2: "Sudah Dibuang ke Titik Sampah"** -> Menambah **+15 Eco Points** ke akun & memperbarui saldo emisi karbon.

### C. Halaman Peta Titik Buang (`/map`)
- Tampilan peta interaktif yang memuat pin titik Bank Sampah & TPS 3R lokal.
- Indikator jarak real-time dari posisi pengguna (dihitung menggunakan rumus Haversine).
- Filter kategori (*Semua*, *Bank Sampah*, *TPS 3R*) dan kolom pencarian alamat/material.
- Panel rincian informasi: jam operasional, nomor telepon, jenis sampah yang diterima, dan tombol *"Buka Rute di Google Maps"*.

### D. Halaman Tukar Hadiah (`/rewards`)
- Menampilkan saldo poin aktif pengguna.
- Kartu katalog hadiah resmi:
  1. **Pulsa Rp 5.000** (100 Poin)
  2. **Totebag Belanja Ramah Lingkungan** (250 Poin)
  3. **Donasi 1 Bibit Pohon** (500 Poin)
- Tombol *"Tukar Poin Sekarang"* hanya aktif apabila saldo pengguna mencukupi (menampilkan status "Butuh X Poin Lagi" jika kurang).
- Modal pop-up sukses menampilkan kode voucher unik anti-duplikasi (contoh: `GW-PLS-1301-LYY37`) dengan tombol salin 1-klik.

### E. Halaman Riwayat Aktivitas & Voucher (`/riwayat`)
- Tab **Aksi Lingkungan**: Mencatat seluruh jejak kerajinan DIY dan penyetoran sampah lengkap dengan tanggal, perolehan poin, dan nilai CO₂e.
- Tab **Voucher Saya**: Mengarsipkan semua kode voucher yang pernah ditukarkan agar tidak hilang.

---

## 3. Skema Basis Data PostgreSQL (Prisma)

- `users`: `id`, `name`, `email`, `password`, `eco_points` (default 0), `co2_saved_kg` (default 0.0).
- `action_logs`: `id`, `user_id`, `action_type` (CRAFT / DISPOSAL), `action_title`, `item_name`, `waste_category`, `co2_amount`, `points_earned`, `craft_title`.
- `rewards`: `id`, `title`, `points_cost`, `description`, `category`, `icon`, `stock`.
- `user_vouchers`: `id`, `user_id`, `reward_id`, `voucher_code`, `points_spent`, `status`, `redeemed_at`.
- `drop_points`: `id`, `name`, `address`, `latitude`, `longitude`, `phone`, `operational_hours`, `accepted_waste`, `type`.

---

## 4. Cara Menjalankan Aplikasi

1. **Backend (NestJS)**:
   ```bash
   cd backend
   # Port 3001
   node dist/src/main.js
   ```

2. **Frontend (Next.js)**:
   ```bash
   cd frontend
   # Port 3000
   npm run start
   ```
