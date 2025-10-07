# 🔧 Troubleshooting Guide - WA Blast App

Panduan lengkap untuk mengatasi masalah umum dalam aplikasi WA Blast.

---

## 📱 WhatsApp Connection Issues

### ❌ QR Code Tidak Muncul

**Gejala:**
- Halaman WhatsApp tidak menampilkan QR code
- Loading terus menerus
- Error "Failed to generate QR code"

**Solusi:**

1. **Cek Backend Logs**
```bash
cd backend
npm run dev
# Lihat logs untuk error
```

2. **Restart Backend**
```bash
# Ctrl+C untuk stop
npm run dev
```

3. **Clear Browser Cache**
- Tekan `Ctrl + Shift + Delete`
- Clear cache dan cookies
- Refresh halaman

4. **Cek Port Backend**
```bash
# Pastikan port 3001 tidak terpakai
lsof -ti:3001 | xargs kill -9
cd backend && npm run dev
```

5. **Tunggu Lebih Lama**
- QR code butuh 3-5 detik untuk generate
- Tunggu sampai proses selesai

---

### ❌ Blast Message Gagal Terkirim

**Gejala:**
- Campaign started tapi messages status "failed"
- Error "WhatsApp not connected"
- Pesan tidak sampai ke penerima

**Solusi:**

#### 1. **Cek Koneksi WhatsApp**

**Di Halaman WhatsApp:**
- Status harus "Connected" ✅
- Jika "Disconnected", klik **Connect WhatsApp**
- Scan QR code dengan HP

**Test Manual:**
```bash
# Via API
curl http://localhost:3001/api/whatsapp/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. **Restore Session**

Jika koneksi terputus setelah restart:

1. Buka halaman **WhatsApp**
2. Klik tombol **Restore Session**
3. Tunggu proses selesai
4. Jika gagal, scan QR code lagi

**Via API:**
```bash
curl -X POST http://localhost:3001/api/whatsapp/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. **Cek Format Nomor**

Nomor harus format internasional:

✅ **BENAR:**
- `628123456789`
- `628987654321`
- `62811222333`

❌ **SALAH:**
- `08123456789` (pakai 0)
- `8123456789` (tanpa kode negara)
- `+62 812 345 6789` (pakai spasi/simbol)

**Perbaikan:**
```csv
# File CSV yang benar
name,phone,group
John Doe,628123456789,Customer
Jane Smith,628987654321,Reseller
```

#### 4. **Cek Logs Backend**

```bash
cd backend
npm run dev
```

Perhatikan logs saat campaign dimulai:
```
Starting bulk send for campaign xxx: 5 contacts
Sending to John Doe (628123456789@s.whatsapp.net)...
✅ Sent to John Doe
Sending to Jane Smith (628987654321@s.whatsapp.net)...
✅ Sent to Jane Smith
```

Jika ada error:
```
❌ Failed to send to John Doe: <error message>
```

#### 5. **WhatsApp Masih Login di HP**

Pastikan:
- WhatsApp di HP masih aktif
- HP terhubung internet
- Tidak logout dari linked devices
- Battery saver tidak mematikan WhatsApp

**Cek di HP:**
1. Buka WhatsApp → Settings → Linked Devices
2. Pastikan ada device "WA Blast"
3. Status harus "Active now"

#### 6. **Rate Limiting**

WhatsApp punya batasan:
- Max ~1000 pesan/hari
- Jika lebih, akun bisa di-ban sementara

**Cek campaign:**
```sql
-- Via Prisma Studio
npm run prisma:studio
-- Lihat table campaigns, cek totalSent hari ini
```

**Solusi:**
- Tunggu 24 jam
- Kirim lebih sedikit pesan
- Gunakan delay lebih lama (sudah default 3-6 detik)

---

### ❌ Session Hilang Setelah Restart

**Gejala:**
- Setelah restart backend, WhatsApp disconnect
- Harus scan QR code lagi

**Solusi:**

#### 1. **Cek Folder auth_sessions**

```bash
cd backend
ls -la auth_sessions/
# Harus ada folder dengan user ID
```

Jika kosong/tidak ada:
```bash
mkdir -p auth_sessions
chmod 755 auth_sessions
```

#### 2. **Cek Database Session**

```bash
npm run prisma:studio
# Buka table sessions
# Cek status = 'connected'
```

#### 3. **Auto Restore on Startup**

Edit `backend/src/index.ts`, tambahkan:
```typescript
import { restoreSession } from './services/whatsapp';

// After app.listen
setTimeout(async () => {
  const users = await prisma.user.findMany();
  for (const user of users) {
    try {
      await restoreSession(user.id);
      console.log(`Restored session for: ${user.email}`);
    } catch (error) {
      console.log(`No session to restore for: ${user.email}`);
    }
  }
}, 5000);
```

---

## 🗄️ Database Issues

### ❌ Connection Error

**Gejala:**
```
Error: Can't reach database server
```

**Solusi:**

1. **Cek DATABASE_URL**
```bash
cd backend
cat .env | grep DATABASE_URL
```

2. **Test Connection**
```bash
npm run prisma:studio
# Jika error, connection string salah
```

3. **Neon Database**
- Login ke neon.tech
- Cek database aktif
- Copy connection string baru
- Update `.env`

4. **Run Migrations Lagi**
```bash
npm run prisma:migrate
npm run prisma:generate
```

---

### ❌ Migration Errors

**Gejala:**
```
Error: Migration failed
```

**Solusi:**

1. **Reset Database**
```bash
cd backend
npx prisma migrate reset --force
npm run prisma:generate
```

2. **Manual Migration**
```bash
npx prisma db push
npm run prisma:generate
```

---

## 🔐 Authentication Issues

### ❌ Token Expired

**Gejala:**
- Redirect ke login terus
- Error "Invalid or expired token"

**Solusi:**

1. **Logout dan Login Lagi**
2. **Clear LocalStorage**
```javascript
// Browser console
localStorage.clear()
// Refresh page
```

3. **Cek JWT_SECRET**
```bash
# Backend .env
cat backend/.env | grep JWT_SECRET
# Harus ada dan konsisten
```

---

## 📤 Contact Import Issues

### ❌ Import CSV Gagal

**Gejala:**
- Error "Failed to import contacts"
- File uploaded tapi tidak ada data

**Solusi:**

1. **Cek Format CSV**

File harus seperti ini:
```csv
name,phone,group
John Doe,628123456789,Customer
Jane Smith,628987654321,Reseller
```

**PENTING:**
- Header harus: `name,phone,group`
- Tidak ada spasi di header
- Phone tanpa simbol `+` atau spasi
- Encoding: UTF-8

2. **Test dengan Sample**
```bash
# Gunakan sample-contacts.csv yang sudah ada
```

3. **Cek Backend Logs**
```bash
cd backend
npm run dev
# Upload file, lihat error di logs
```

---

## 🔍 Common Error Messages

### "WhatsApp not connected. Please scan QR code first."

**Artinya:** Session WhatsApp tidak aktif

**Solusi:**
1. Buka halaman WhatsApp
2. Klik "Connect WhatsApp"
3. Scan QR code
4. Tunggu status "Connected"
5. Coba blast lagi

---

### "Contact IDs are required"

**Artinya:** Tidak ada contact yang dipilih

**Solusi:**
1. Buka halaman Blast
2. Pilih minimal 1 contact
3. Atau pilih group
4. Coba kirim lagi

---

### "Message template is required"

**Artinya:** Pesan kosong

**Solusi:**
1. Isi message template
2. Boleh pakai variabel `{{nama}}`
3. Minimal 1 karakter
4. Tidak boleh hanya spasi

---

### "Failed to fetch campaigns"

**Artinya:** Backend tidak jalan atau database error

**Solusi:**
1. Cek backend running di port 3001
2. Test: `curl http://localhost:3001/api/health`
3. Cek database connection
4. Restart backend

---

## 📊 Performance Issues

### ⚠️ Blast Terlalu Lambat

**Normal Speed:**
- 3-6 detik per pesan
- 10-20 pesan per menit
- 100 pesan = ~10 menit

**Jika lebih lambat:**

1. **Cek Koneksi Internet**
- Backend perlu internet stabil
- HP perlu internet stabil

2. **Cek CPU/RAM**
```bash
# Check resource usage
top
# Jika tinggi, restart backend
```

3. **Kurangi Delay (Risiko Ban)**
```typescript
// backend/src/services/whatsapp.ts
// Line ~198
const delay = 2000 + Math.random() * 2000; // Original: 3000 + 3000
```

**⚠️ WARNING:** Delay terlalu cepat = risiko banned!

---

### ⚠️ Frontend Lambat

**Solusi:**

1. **Build Production**
```bash
cd frontend
npm run build
npm run preview
```

2. **Clear Cache**
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🐛 Debug Tools

### 1. Backend Logs

```bash
cd backend
npm run dev
# Lihat semua logs
```

### 2. Prisma Studio

```bash
cd backend
npm run prisma:studio
# Open http://localhost:5555
# View all tables
```

### 3. API Testing

**Postman/curl:**
```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Get status
curl http://localhost:3001/api/whatsapp/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Browser DevTools

```javascript
// F12 → Console
// Check errors
console.log(localStorage.getItem('wa-blast-auth'))
```

---

## 🆘 Still Not Working?

### Langkah Terakhir:

1. **Full Reset:**
```bash
# Backend
cd backend
rm -rf node_modules auth_sessions dist
npm install
npm run prisma:migrate
npm run dev

# Frontend (terminal baru)
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

2. **Cek Semua Requirements:**
- [ ] Node.js 18+ installed
- [ ] PostgreSQL/Neon database aktif
- [ ] Port 3001 & 5173 tidak terpakai
- [ ] .env files configured
- [ ] WhatsApp di HP aktif
- [ ] Internet connection stabil

3. **Create Fresh Database:**
```bash
# Neon.tech
# Delete old database
# Create new database
# Update DATABASE_URL
cd backend
npm run prisma:migrate
```

4. **Test Step by Step:**
```bash
# 1. Backend health
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}

# 2. Register
# Via frontend /register

# 3. Connect WhatsApp
# Via frontend /whatsapp

# 4. Add 1 contact
# Via frontend /contacts

# 5. Send test blast
# Via frontend /blast
```

---

## 📞 Getting Help

Jika masih error:

1. **Collect Information:**
   - Error message lengkap
   - Backend logs
   - Browser console logs
   - Steps to reproduce
   - Environment (OS, Node version)

2. **Check Documentation:**
   - README.md
   - QUICKSTART.md
   - DEPLOYMENT.md

3. **Common Patterns:**
   - 90% masalah = WhatsApp not connected
   - 5% masalah = Format nomor salah
   - 5% masalah = Database/config

---

**💡 Pro Tips:**

- Always check backend logs first
- Test with 1 contact before bulk send
- Use correct phone format (628xxx)
- Don't send too many messages (max 1000/day)
- Keep WhatsApp on phone active
- Use stable internet connection

**Good luck! 🚀**
