# 📘 Product Requirement Document (PRD)

**Produk:** WA Blast App
**Teknologi:** React + Shadcn UI + Node.js (Baileys) + PostgreSQL (Neon) + Prisma
**Tujuan:** Memungkinkan pengguna mengirim pesan WhatsApp massal (teks, gambar, file, video) secara otomatis dengan tampilan UI modern dan sistem yang stabil.

---

## 🧩 1. Tujuan Produk

Aplikasi WA Blast ini dirancang untuk membantu pengguna (bisnis, komunitas, dan organisasi) mengirim pesan WhatsApp ke banyak kontak secara cepat, efisien, dan aman, tanpa perlu multi-device support atau dashboard admin.

---

## 👥 2. Target Pengguna

* Pemilik bisnis kecil/menengah (UMKM)
* Tim marketing / customer service
* Komunitas dan organisasi

---

## ⚙️ 3. Fitur Utama

### 3.1 Autentikasi & Manajemen Akun

* **Register / Login / Logout**

  * Menggunakan email & password.
  * Login menghasilkan JWT token (Access & Refresh Token).
* **Lupa Password / Reset Password**

  * Mengirim link reset via email.
* **Profil pengguna**

  * Ubah nama, email, dan password.
* **API Key pribadi**

  * Dihasilkan otomatis saat registrasi.
  * Dapat di-regenerate dari halaman *Settings*.
* **Limitasi penggunaan**

  * Menentukan jumlah pesan harian berdasarkan plan.

---

### 3.2 Pengelolaan Pesan Blast

* **Kirim pesan massal**

  * Import dari CSV/XLSX (kolom: nomor, nama, pesan khusus).
  * Kirim pesan teks, gambar, video, dan file dokumen.
* **Template pesan**

  * Menyimpan format pesan dinamis (misal: “Halo {{nama}}!”).
* **Preview pesan**

  * Menampilkan hasil pesan dengan data asli sebelum dikirim.
* **Progress & Status**

  * Tampilkan status real-time: Pending / Success / Failed.
* **Riwayat kampanye**

  * Menyimpan catatan blast sebelumnya (nama kampanye, tanggal, jumlah pesan, hasil kirim).

---

### 3.3 Manajemen Kontak

* Tambah kontak manual.
* Import kontak dari CSV.
* Kelompokkan dalam **grup / label** (misal: pelanggan, reseller, komunitas).
* Cari dan filter kontak.
* Ekspor kontak ke CSV (opsional).

---

### 3.4 Integrasi WhatsApp (Baileys)

* **Scan QR Code**

  * Pengguna memindai QR untuk konek ke akun WA mereka.
* **Status koneksi**

  * Menampilkan koneksi aktif/nonaktif.
* **Auto reconnect**

  * Menyambungkan kembali sesi yang terputus.
* **Penyimpanan sesi**

  * Data sesi disimpan terenkripsi di PostgreSQL (Neon).

---

### 3.5 Dashboard & Monitoring

* Statistik penggunaan:

  * Total pesan terkirim
  * Pesan gagal
  * Jumlah kontak aktif
* Riwayat aktivitas:

  * Nomor tujuan, isi pesan, waktu kirim, dan status.
* Tampilan grafik sederhana (menggunakan Chart.js atau Recharts).

---

### 3.6 Settings

* **API Base URL**
  Ditampilkan untuk integrasi API eksternal.
* **API Key Management**
  Tampilkan API key dan tombol *Regenerate*.
* **Webhook URL (opsional)**
  Untuk menerima notifikasi status pengiriman.
* **Tampilan UI**

  * Switch **Dark / Light Mode** (via Shadcn).
  * Bahasa UI (Indonesia/English) opsional.

---

## 🧱 4. Struktur Database (Prisma + PostgreSQL)

Tabel utama yang digunakan:

### `users`

| Kolom       | Tipe     | Deskripsi            |
| ----------- | -------- | -------------------- |
| id          | UUID     | Primary key          |
| name        | String   | Nama pengguna        |
| email       | String   | Unik                 |
| password    | String   | Password terenkripsi |
| api_key     | String   | Kunci API unik       |
| quota_limit | Int      | Batas pesan per hari |
| created_at  | DateTime | Tanggal registrasi   |
| updated_at  | DateTime | Update terakhir      |

### `contacts`

| Kolom      | Tipe     | Deskripsi           |
| ---------- | -------- | ------------------- |
| id         | UUID     | Primary key         |
| user_id    | UUID     | Relasi ke user      |
| name       | String   | Nama kontak         |
| phone      | String   | Nomor WA            |
| group      | String   | Label/grup kontak   |
| created_at | DateTime | Tanggal ditambahkan |

### `messages`

| Kolom      | Tipe                                | Deskripsi         |
| ---------- | ----------------------------------- | ----------------- |
| id         | UUID                                | Primary key       |
| user_id    | UUID                                | Relasi ke user    |
| contact_id | UUID                                | Relasi ke kontak  |
| content    | Text                                | Isi pesan         |
| type       | Enum("text","image","video","file") | Jenis pesan       |
| status     | Enum("pending","success","failed")  | Status pengiriman |
| sent_at    | DateTime                            | Waktu kirim       |

### `campaigns`

| Kolom            | Tipe     | Deskripsi            |
| ---------------- | -------- | -------------------- |
| id               | UUID     | Primary key          |
| user_id          | UUID     | Relasi ke user       |
| name             | String   | Nama kampanye        |
| message_template | Text     | Template pesan       |
| total_sent       | Int      | Jumlah pesan dikirim |
| created_at       | DateTime | Waktu dibuat         |

### `sessions`

| Kolom        | Tipe     | Deskripsi                     |
| ------------ | -------- | ----------------------------- |
| id           | UUID     | Primary key                   |
| user_id      | UUID     | Relasi ke user                |
| session_data | JSON     | Data sesi Baileys terenkripsi |
| status       | String   | Connected / Disconnected      |
| updated_at   | DateTime | Update terakhir               |

---

## 🎨 5. Desain UI (Shadcn Components)

Komponen utama yang digunakan:

* **Button**, **Input**, **Label**, **Dialog**, **Table**, **Card**
* **Tabs** → untuk Dashboard / Blast / Contacts / Settings
* **Progress Bar** → status pengiriman
* **Alert & Toast** → notifikasi
* **Sheet / Sidebar** → navigasi utama
* **Dark Mode Switch**
* **Form validation** (React Hook Form + Zod)

---

## 🔁 6. Alur Pengguna (User Flow)

### 1️⃣ Registrasi

1. User membuka halaman register.
2. Isi form → name, email, password.
3. Sistem menyimpan user baru + membuat API key otomatis.

### 2️⃣ Login & Koneksi WhatsApp

1. Login → masuk dashboard.
2. Scan QR Code untuk menghubungkan akun WhatsApp.
3. Status berubah menjadi “Connected”.

### 3️⃣ Tambah Kontak & Template

1. Tambahkan kontak manual atau import CSV.
2. Buat template pesan dengan variabel.

### 4️⃣ Kirim Blast

1. Pilih kontak/grup.
2. Pilih template pesan.
3. Klik “Kirim Sekarang”.
4. Pesan dikirim via Baileys, tampil progress real-time.
5. Riwayat tersimpan otomatis.

### 5️⃣ Monitoring

* Lihat statistik pesan, status kirim, dan histori blast.

---

## 🧠 7. Integrasi Eksternal

* **Baileys:** library untuk koneksi WhatsApp Web.
* **Prisma:** ORM untuk PostgreSQL.
* **Neon.tech:** database PostgreSQL cloud.
* **JWT:** autentikasi backend.
* **Chart.js/Recharts:** visualisasi data di dashboard.

---

## 🚀 8. Deployment Plan

| Komponen                | Platform                     | Catatan            |
| ----------------------- | ---------------------------- | ------------------ |
| Frontend                | Vercel / Netlify             | Build React (Vite) |
| Backend                 | ClawCloud / Render / Railway | Node.js + Baileys  |
| Database                | Neon.tech                    | PostgreSQL         |
| File Storage (optional) | Cloudinary / S3              | Untuk media pesan  |

---

## 📆 9. Roadmap (Milestone)

| Fase | Fitur                             | Estimasi |
| ---- | --------------------------------- | -------- |
| 1    | Autentikasi & Profil              | 1 minggu |
| 2    | Koneksi WA (Baileys) + QR         | 1 minggu |
| 3    | Blast Message + Progress          | 2 minggu |
| 4    | Dashboard & Riwayat               | 1 minggu |
| 5    | Kontak + Template                 | 1 minggu |
| 6    | UI Polishing (Shadcn + Dark Mode) | 1 minggu |

---

## ✅ 10. Tujuan Akhir

Aplikasi WA Blast yang:

* Aman dan mudah digunakan.
* UI clean dan profesional (Shadcn).
* Bisa kirim pesan massal tanpa banned.
* Siap dikembangkan menjadi SaaS di masa depan.
