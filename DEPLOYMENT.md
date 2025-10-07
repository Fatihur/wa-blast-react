# 🚀 Deployment Guide - WA Blast App

Panduan lengkap untuk deploy aplikasi WA Blast ke production.

## 📦 Prerequisites

- Account Neon.tech (Database PostgreSQL gratis)
- Account Vercel/Netlify (Frontend hosting)
- Account Railway/Render/ClawCloud (Backend hosting)

---

## 1️⃣ Setup Database di Neon.tech

### Step 1: Create Database
1. Buka [neon.tech](https://neon.tech) dan sign up
2. Klik **Create Project**
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Beri nama project: `wa-blast-db`
5. Copy **Connection String** yang diberikan

Format connection string:
```
postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

### Step 2: Run Migrations
```bash
cd backend
export DATABASE_URL="postgresql://..." # paste connection string
npm run prisma:migrate
npm run prisma:generate
```

---

## 2️⃣ Deploy Backend ke Railway

### Step 1: Prepare Backend
1. Pastikan semua file backend sudah di-commit ke git
2. Hapus folder `auth_sessions` dari git (sudah ada di .gitignore)

### Step 2: Deploy di Railway
1. Buka [railway.app](https://railway.app) dan login
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repository ini
4. Railway akan detect Node.js app

### Step 3: Set Environment Variables
Di Railway dashboard, tambahkan variables:
```env
DATABASE_URL=postgresql://... # dari Neon
JWT_SECRET=your-super-secret-change-this-random-string
JWT_REFRESH_SECRET=your-refresh-secret-random-string
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 4: Set Root Directory
- Klik **Settings**
- Set **Root Directory**: `backend`
- Set **Build Command**: `npm install && npm run build`
- Set **Start Command**: `npm start`

### Step 5: Deploy
- Klik **Deploy**
- Tunggu sampai deployment selesai
- Copy URL backend: `https://your-app.railway.app`

---

## 3️⃣ Deploy Frontend ke Vercel

### Step 1: Build Configuration
1. Buka [vercel.com](https://vercel.com) dan login
2. Klik **Add New Project**
3. Import repository dari GitHub

### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Set Environment Variables
```env
VITE_API_URL=https://your-backend.railway.app/api
```

### Step 4: Deploy
- Klik **Deploy**
- Tunggu sampai deployment selesai
- Copy URL frontend: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
Update `FRONTEND_URL` di Railway:
```env
FRONTEND_URL=https://your-app.vercel.app
```
Redeploy backend.

---

## 4️⃣ Alternative: Deploy Backend ke Render

### Step 1: Create Web Service
1. Buka [render.com](https://render.com)
2. Klik **New** → **Web Service**
3. Connect GitHub repository

### Step 2: Configure
- **Name**: wa-blast-backend
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

### Step 3: Environment Variables
Tambahkan semua env vars seperti di Railway.

### Step 4: Deploy
Klik **Create Web Service** dan tunggu deployment.

---

## 5️⃣ Alternative: Deploy Frontend ke Netlify

### Step 1: Create Site
1. Buka [netlify.com](https://netlify.com)
2. Klik **Add new site** → **Import from Git**
3. Pilih repository

### Step 2: Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### Step 3: Environment Variables
```env
VITE_API_URL=https://your-backend.railway.app/api
```

### Step 4: Deploy
Klik **Deploy site**.

---

## 6️⃣ Verifikasi Deployment

### Test Backend
```bash
curl https://your-backend.railway.app/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "WA Blast API is running"
}
```

### Test Frontend
1. Buka `https://your-app.vercel.app`
2. Register account baru
3. Login
4. Test koneksi WhatsApp

---

## 7️⃣ Setup Custom Domain (Optional)

### Vercel (Frontend)
1. Buka project di Vercel
2. Klik **Settings** → **Domains**
3. Tambahkan domain (e.g., `app.yourdomain.com`)
4. Update DNS records:
   - Type: CNAME
   - Name: app
   - Value: cname.vercel-dns.com

### Railway (Backend)
1. Buka project di Railway
2. Klik **Settings** → **Domains**
3. Klik **Generate Domain** atau tambah custom domain
4. Update DNS:
   - Type: CNAME
   - Name: api
   - Value: your-app.up.railway.app

---

## 8️⃣ Monitoring & Maintenance

### Check Logs
**Railway:**
- Klik **Deployments** → View logs

**Vercel:**
- Klik **Deployments** → Function logs

**Neon:**
- Dashboard → Monitoring

### Common Issues

**1. WhatsApp QR tidak muncul**
- Cek logs backend
- Pastikan folder `auth_sessions` bisa ditulis
- Railway: set persistent volume

**2. CORS Error**
- Update `FRONTEND_URL` di backend env vars
- Restart backend

**3. Database connection error**
- Verify `DATABASE_URL` di env vars
- Cek apakah Neon database aktif
- Run migrations lagi

**4. Build failed**
- Cek Node.js version (use 18+)
- Clear cache dan rebuild
- Cek logs untuk error spesifik

---

## 9️⃣ Production Checklist

- [ ] Database deployed di Neon
- [ ] Backend deployed (Railway/Render)
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Environment variables set dengan benar
- [ ] CORS configured
- [ ] JWT secrets diganti dengan random string kuat
- [ ] Custom domains configured (optional)
- [ ] Test registrasi & login
- [ ] Test WhatsApp connection
- [ ] Test send blast message
- [ ] Monitor logs untuk errors

---

## 🔒 Security Tips

1. **Jangan expose `.env` files**
2. **Gunakan HTTPS** (otomatis di Vercel/Railway)
3. **Set strong JWT secrets** (minimal 32 karakter random)
4. **Enable rate limiting** di production
5. **Monitor logs** untuk suspicious activity
6. **Backup database** secara berkala

---

## 📊 Performance Optimization

1. **Database:**
   - Add indexes di Prisma schema
   - Enable connection pooling

2. **Backend:**
   - Enable compression
   - Add caching (Redis)

3. **Frontend:**
   - Enable lazy loading
   - Optimize images
   - Use code splitting

---

## 💰 Cost Estimation

**Free Tier:**
- Neon PostgreSQL: Gratis (up to 3 projects)
- Railway: $5 free credit/month
- Vercel: Unlimited hobby projects

**Paid (Optional):**
- Railway Pro: $20/month
- Neon Pro: $19/month
- Vercel Pro: $20/month

---

## 🆘 Support

Jika ada masalah:
1. Cek logs di platform masing-masing
2. Verify environment variables
3. Test API endpoints dengan curl/Postman
4. Create issue di GitHub repository

---

**🎉 Selamat! Aplikasi WA Blast sudah live di production!**
