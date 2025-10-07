# 🚀 Quick Start Guide - WA Blast App

Panduan cepat untuk menjalankan aplikasi dalam 5 menit.

## ⚡ Super Quick Start

```bash
# 1. Install semua dependencies
npm run install:all

# 2. Setup Backend
cd backend
cp .env.example .env
# Edit .env dan tambahkan DATABASE_URL Anda

# 3. Setup Database
npm run prisma:migrate
npm run prisma:generate

# 4. Setup Frontend
cd ../frontend
cp .env.example .env
# Edit .env jika perlu (default sudah OK)

# 5. Run Development
cd ..
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 📋 Step-by-Step Guide

### 1. Prerequisites
Pastikan sudah terinstall:
- Node.js 18+ ✅
- npm atau yarn ✅
- PostgreSQL database (lokal atau Neon) ✅

### 2. Clone & Install
```bash
cd wa-blast-react
npm run install:all
```

### 3. Setup Database

**Option A: Gunakan Neon.tech (Recommended - Gratis)**
1. Buka https://neon.tech
2. Create project baru
3. Copy connection string
4. Paste ke `backend/.env`:
```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

**Option B: PostgreSQL Lokal**
```bash
# Install PostgreSQL
# Buat database
createdb wa_blast

# Set di .env
DATABASE_URL="postgresql://localhost:5432/wa_blast"
```

### 4. Configure Backend

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://..." # dari step 3
JWT_SECRET="random-string-min-32-karakter-change-this"
JWT_REFRESH_SECRET="another-random-string-change-this"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

💡 **Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Migrations
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 6. Configure Frontend

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 7. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Atau gunakan 1 terminal:**
```bash
# Di root folder
npm run dev
```

---

## 🎯 First Time Usage

### 1. Register Account
- Buka http://localhost:5173/register
- Isi form registrasi
- Login dengan akun baru

### 2. Connect WhatsApp
- Klik menu **WhatsApp**
- Klik **Connect WhatsApp**
- Scan QR code dengan WhatsApp di HP
- Tunggu status berubah jadi "Connected" ✅

### 3. Add Contacts
- Klik menu **Contacts**
- Klik **Add Contact** untuk manual, atau
- Klik **Import CSV** untuk bulk import
  - Gunakan `sample-contacts.csv` sebagai contoh

### 4. Send First Blast
- Klik menu **Blast Message**
- Isi nama campaign
- Tulis pesan (gunakan `{{nama}}` untuk personalisasi)
- Pilih contacts
- Klik **Send Blast** 🚀

### 5. Monitor Results
- Lihat Dashboard untuk statistik
- Cek Campaigns untuk riwayat
- Monitor progress real-time

---

## 🐛 Common Issues

### Port already in use
```bash
# Backend port 3001
lsof -ti:3001 | xargs kill -9

# Frontend port 5173
lsof -ti:5173 | xargs kill -9
```

### Database connection failed
- Cek DATABASE_URL di `.env`
- Pastikan PostgreSQL running
- Test connection:
```bash
cd backend
npx prisma studio
```

### QR Code tidak muncul
- Restart backend
- Clear browser cache
- Tunggu 5-10 detik setelah klik Connect

### Module not found
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

---

## 📱 Test Data

### Sample CSV Import
Gunakan file `sample-contacts.csv`:
```csv
name,phone,group
John Doe,628123456789,Customer
Jane Smith,628987654321,Reseller
```

### Sample Message Template
```
Halo {{nama}}! 👋

Kami ada promo spesial untuk Anda:
✨ Diskon 50% untuk semua produk
🎁 Gratis ongkir se-Indonesia

Promo terbatas hingga akhir bulan!

Klik link: https://example.com/promo

Salam,
Tim Marketing
```

---

## 🔍 Verification Checklist

Setelah setup, cek:
- [ ] Backend running di port 3001
- [ ] Frontend running di port 5173
- [ ] Database migrations applied
- [ ] Can register new user
- [ ] Can login
- [ ] Can view dashboard
- [ ] Can connect WhatsApp
- [ ] Can add contacts
- [ ] Can send test message

---

## 🆘 Need Help?

1. **Check logs:**
   - Backend: Terminal yang run backend
   - Frontend: Browser console (F12)
   - Database: `npm run prisma:studio`

2. **Read documentation:**
   - README.md - Full documentation
   - DEPLOYMENT.md - Production guide
   - CONTRIBUTING.md - Development guide

3. **Common commands:**
```bash
# Reset database
cd backend
npx prisma migrate reset

# View database
npx prisma studio

# Check API health
curl http://localhost:3001/api/health

# View all routes
cd backend && npm run dev | grep "Route"
```

---

## 🎉 You're Ready!

Aplikasi sudah siap digunakan! 

**Next Steps:**
- Explore semua fitur
- Customize UI/UX
- Deploy ke production (lihat DEPLOYMENT.md)
- Contribute (lihat CONTRIBUTING.md)

**Happy Blasting! 🚀📱**
