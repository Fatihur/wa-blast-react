# 🚀 Setup & Test New Features

Panduan cepat untuk setup dan testing fitur-fitur baru WA Blast v1.1.0

---

## 📦 Installation

```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Install backend dependencies (jika ada yang missing)
cd ../backend
npm install

# 3. Start development
cd ..
npm run dev
```

**New packages yang akan terinstall:**
- Radix UI components (dialog, tabs, progress)
- Tiptap rich text editor
- Recharts tambahan (PieChart)

---

## ✨ Testing New Features

### 1. Enhanced UI/Layout

**What to check:**
- Sidebar lebih lebar dengan gradient background
- Logo badge dengan icon
- Menu items dengan hover animation
- User avatar dengan initial
- Gradient backgrounds di main content

**How to test:**
```
1. Login ke aplikasi
2. Lihat sidebar - harus lebih modern
3. Hover menu items - harus ada scale & shadow effect
4. Check active menu - harus ada gradient background
```

---

### 2. Menu "Koneksi"

**What changed:**
- Menu "WhatsApp" → "Koneksi"
- Posisi pindah ke urutan ke-2 (di bawah Dashboard)

**How to test:**
```
1. Buka aplikasi
2. Sidebar menu harus urutan:
   - Dashboard
   - Koneksi ← INI YANG BERUBAH
   - Contacts
   - Blast Message
   - Campaigns
   - Settings
```

---

### 3. Contact Management Modal

**What to test:**

**Add Contact:**
```
1. Go to /contacts
2. Click "Add Contact" button
3. Modal terbuka
4. Fill form:
   - Name: Test User
   - Phone: 628123456789
   - Group: Test Group
5. Click "Save Contact"
6. Modal close, contact muncul di table
```

**Edit Contact:**
```
1. Click edit icon (pencil) pada contact
2. Modal terbuka dengan data existing
3. Edit nama atau group
4. Click "Update Contact"
5. Changes saved
```

**Group Tabs:**
```
1. Import contacts dengan groups berbeda
2. Tabs muncul otomatis per group
3. Click tab untuk filter
4. Badge menampilkan jumlah per group
```

---

### 4. Rich Text Editor

**What to test:**

**Basic Formatting:**
```
1. Go to /blast
2. Type message di editor
3. Select text, click Bold → text bold
4. Select text, click Italic → text italic
5. Click list icons → create lists
```

**Variable Insertion:**
```
1. Click "#nama" button
2. {{nama}} inserted otomatis
3. Variable akan diganti dengan nama contact saat kirim
```

**Visual Check:**
- Toolbar harus muncul di atas editor
- Active buttons harus highlight dengan warna primary
- Placeholder text muncul saat kosong
- Footer hint tentang {{nama}}

---

### 5. File Upload Support

**What to test:**

**Upload Image:**
```
1. Go to /blast
2. Click "Image" button
3. Upload button muncul
4. Click "Upload image"
5. Select image file (JPG/PNG)
6. Preview muncul dengan filename & size
7. Type caption di editor
8. Select contacts & send
9. Image harus terkirim dengan caption
```

**Upload Video:**
```
1. Click "Video" button
2. Upload video file (MP4)
3. Same process as image
```

**Upload Document:**
```
1. Click "File" button
2. Upload PDF/DOC/etc
3. Add caption & send
```

**Visual Check:**
- Message type buttons harus toggle (only 1 active)
- Upload input muncul saat type != text
- Remove button (X) muncul setelah select file
- File info (name & size) ditampilkan

---

### 6. Real-time Progress Bar

**What to test:**

```
1. Go to /blast
2. Create campaign dengan 5-10 contacts
3. Click "Send to X Contacts"
4. Progress card muncul otomatis
5. Progress bar bergerak setiap 2 detik
6. Stats update (success/failed/total)
7. Percentage bertambah
8. Card hilang saat 100%
```

**Visual Check:**
- Progress bar dengan gradient animation
- Badge menampilkan percentage
- Icons color-coded (green=success, red=failed, yellow=pending)
- Smooth updates tanpa flicker

---

### 7. Enhanced Dashboard

**What to test:**

**Stats Cards:**
```
1. Go to dashboard
2. 4 cards harus muncul:
   - Total Contacts (blue)
   - Total Messages (blue)
   - Success Rate % (green)
   - Failed (red)
3. Hover cards - harus ada shadow lift
4. Border left dengan accent color
```

**Charts:**
```
1. Bar chart harus muncul dengan colored bars
2. Pie chart harus show distribution
3. Hover chart - tooltip muncul
4. Colors: green=success, red=failed, yellow=pending
```

**Recent Messages:**
```
1. List messages dengan avatar
2. Badge status color-coded
3. Hover row - background highlight
4. Empty state jika belum ada messages
```

---

## 🐛 Common Issues

### Issue: Modal tidak muncul
**Fix:**
```bash
cd frontend
npm install @radix-ui/react-dialog
npm run dev
```

### Issue: Rich editor tidak muncul
**Fix:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm run dev
```

### Issue: Progress bar tidak update
**Fix:**
- Check backend running
- Check campaign ID saved
- Check browser console untuk errors

### Issue: File upload error
**Fix:**
- Check `backend/uploads/` folder exists
- Check file size < 50MB
- Check backend logs

---

## 📝 Quick Test Script

Copy-paste ini untuk cepat test semua fitur:

```bash
# 1. Start apps
npm run dev

# 2. Browser tests:
# - Login/register
# - Check sidebar UI (gradient, animations)
# - Go to Contacts
#   - Click "Add Contact"
#   - Fill form & save
#   - Click edit icon
#   - Update & save
#   - Click group tabs
# - Go to Blast Message
#   - Type message in editor
#   - Try bold, italic, lists
#   - Click "#nama" button
#   - Select "Image" type
#   - Upload image
#   - Select contacts
#   - Click "Send"
#   - Watch progress bar
# - Go to Dashboard
#   - Check stats cards
#   - Check charts
#   - Check recent messages
```

---

## 🎉 Success Criteria

Semua fitur dianggap berhasil jika:

- ✅ UI terlihat modern dengan gradient & shadows
- ✅ Modal contact bisa add/edit/delete
- ✅ Tabs menampilkan contacts by group
- ✅ Rich editor bisa format text
- ✅ File upload berfungsi untuk image/video/document
- ✅ Progress bar update real-time
- ✅ Dashboard charts render dengan baik
- ✅ No console errors
- ✅ Responsive di mobile

---

## 🆘 Need Help?

**Check logs:**
```bash
# Backend logs
cd backend && npm run dev

# Frontend console
Browser → F12 → Console
```

**Documentation:**
- `UI_IMPROVEMENTS.md` - Detailed improvements
- `TROUBLESHOOTING.md` - Common issues & fixes
- `README.md` - Full documentation

---

**Happy testing! 🚀**
