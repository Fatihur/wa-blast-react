# 📱 WA Blast App

Aplikasi WhatsApp Blast untuk mengirim pesan massal dengan tampilan modern menggunakan React, Shadcn UI, Node.js (Baileys), PostgreSQL (Neon), dan Prisma.

## 🚀 Fitur Utama

- ✅ **Autentikasi & Manajemen Akun** (Register, Login, Profile, API Key)
- ✅ **WhatsApp Integration** (QR Code Connection, Auto Reconnect)
- ✅ **Manajemen Kontak** (Add, Import CSV, Group, Search)
- ✅ **Blast Message** (Kirim pesan massal dengan template)
- ✅ **Campaign Management** (Riwayat kampanye, statistik)
- ✅ **Dashboard** (Statistik real-time, grafik)
- ✅ **Settings** (API Key, Dark Mode)

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- Baileys (WhatsApp Web API)
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Bcrypt

### Frontend
- React + TypeScript
- Vite
- Shadcn UI
- TailwindCSS
- React Query
- Zustand
- React Hook Form + Zod
- Recharts

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm atau yarn

## 🔧 Installation

### 1. Clone Repository
```bash
cd wa-blast-react
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/wa_blast?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-change-this"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Setup database dengan Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

Jalankan backend:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

Jalankan frontend:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📖 Cara Penggunaan

### 1. Register & Login
- Buka `http://localhost:5173/register`
- Daftar dengan nama, email, dan password
- Login dengan kredensial yang sudah dibuat

### 2. Hubungkan WhatsApp
- Pergi ke halaman **WhatsApp**
- Klik tombol **Connect WhatsApp**
- Scan QR Code dengan WhatsApp di HP:
  - Buka WhatsApp → Settings → Linked Devices → Link a Device
  - Scan QR code yang muncul
  - Tunggu sampai status berubah menjadi "Connected"

### 3. Tambah Kontak
- Pergi ke halaman **Contacts**
- Klik **Add Contact** untuk menambah manual
- Atau **Import CSV** dengan format:
  ```csv
  name,phone,group
  John Doe,628123456789,Customer
  Jane Smith,628987654321,Reseller
  ```

### 4. Kirim Blast Message
- Pergi ke halaman **Blast Message**
- Isi nama campaign
- Tulis pesan (gunakan `{{nama}}` untuk personalisasi)
- Pilih kontak atau group
- Klik **Send Blast**
- Pesan akan dikirim secara otomatis

### 5. Monitor Campaign
- Pergi ke halaman **Campaigns** untuk melihat riwayat
- Pergi ke halaman **Dashboard** untuk melihat statistik

## 📊 Database Schema

### Users
- id, name, email, password, apiKey, quotaLimit, createdAt, updatedAt

### Contacts
- id, userId, name, phone, group, createdAt

### Messages
- id, userId, contactId, content, type, status, sentAt, createdAt

### Campaigns
- id, userId, name, messageTemplate, totalSent, totalSuccess, totalFailed, createdAt

### Sessions
- id, userId, sessionData, status, updatedAt

## 🎨 Shadcn UI Components

Aplikasi menggunakan komponen berikut:
- Button, Input, Label, Card, Table
- Dialog, Alert, Toast
- Form dengan React Hook Form
- Dark Mode Support

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/change-password` - Change password
- `POST /api/user/regenerate-api-key` - Generate API key baru
- `GET /api/user/stats` - Get statistik

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `POST /api/contacts/import` - Import dari CSV
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/groups` - Get all groups

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get message by ID
- `DELETE /api/messages/:id` - Delete message

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create & start campaign
- `GET /api/campaigns/:id` - Get campaign details
- `DELETE /api/campaigns/:id` - Delete campaign

### WhatsApp
- `GET /api/whatsapp/qr` - Get QR code
- `GET /api/whatsapp/status` - Get connection status
- `POST /api/whatsapp/disconnect` - Disconnect WhatsApp

## 🚢 Deployment

### Backend
Deploy ke **Railway**, **Render**, atau **ClawCloud**:
1. Setup environment variables
2. Jalankan `npm run build`
3. Set start command: `npm start`

### Frontend
Deploy ke **Vercel** atau **Netlify**:
1. Set environment variable `VITE_API_URL`
2. Build command: `npm run build`
3. Output directory: `dist`

### Database
Gunakan **Neon.tech** untuk PostgreSQL gratis:
1. Buat database di neon.tech
2. Copy connection string
3. Paste ke `DATABASE_URL` di backend

## ⚠️ Important Notes

- **WhatsApp Ban Prevention**: 
  - Tambahkan delay 2-4 detik antar pesan
  - Jangan kirim lebih dari 1000 pesan/hari
  - Gunakan pesan yang personal (pakai template)
  - Jangan kirim spam atau konten ilegal

- **Security**:
  - Jangan commit file `.env`
  - Ganti JWT_SECRET dengan string random yang kuat
  - Enable HTTPS di production

## 🐛 Troubleshooting

### Blast Message Tidak Berhasil?

**Checklist:**
1. ✅ WhatsApp status = "Connected" (cek di halaman WhatsApp)
2. ✅ Format nomor = `628xxx` (bukan `08xxx`)
3. ✅ Backend running & tidak ada error di logs
4. ✅ WhatsApp di HP masih aktif & online
5. ✅ Contacts sudah dipilih di halaman Blast

**Quick Fix:**
```bash
# 1. Restart backend
cd backend
npm run dev

# 2. Di browser, buka halaman WhatsApp
# 3. Klik "Restore Session"
# 4. Jika gagal, klik "Connect WhatsApp" dan scan QR lagi
# 5. Coba blast lagi
```

**Lihat Dokumentasi Lengkap:**
📖 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Panduan lengkap untuk semua masalah

### Format Nomor yang Benar

✅ **BENAR:**
- `628123456789`
- `628987654321`

❌ **SALAH:**
- `08123456789` (pakai 0)
- `8123456789` (tanpa 62)
- `+62 812 345 6789` (pakai spasi)

### QR Code tidak muncul
- Restart backend
- Clear browser cache
- Tunggu 5-10 detik setelah klik Connect
- Cek backend logs untuk error

### Database error
- Pastikan DATABASE_URL benar
- Jalankan `npm run prisma:migrate`
- Test dengan `npm run prisma:studio`

## 📝 License

MIT License

## 👨‍💻 Author

Created with ❤️ for efficient WhatsApp broadcasting

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**⚡ Happy Blasting! 🚀**
