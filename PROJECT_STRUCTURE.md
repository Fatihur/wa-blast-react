# 📁 Project Structure - WA Blast App

Dokumentasi lengkap struktur folder dan file dalam project.

## 🏗️ Overview

```
wa-blast-react/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite Frontend
├── docs/            # Documentation files
└── config files     # Root configuration
```

---

## 📂 Root Directory

```
wa-blast-react/
├── README.md              # Main documentation
├── QUICKSTART.md          # Quick setup guide
├── DEPLOYMENT.md          # Production deployment guide
├── CONTRIBUTING.md        # Contribution guidelines
├── CHANGELOG.md           # Version history
├── LICENSE                # MIT License
├── PROJECT_STRUCTURE.md   # This file
├── package.json           # Root package with scripts
├── .gitignore            # Git ignore rules
├── sample-contacts.csv   # Sample data for testing
└── prd.md                # Product requirement document
```

---

## 🖥️ Backend Structure

```
backend/
├── src/                        # Source code
│   ├── index.ts               # Entry point
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Auth endpoints (login, register)
│   │   ├── user.ts            # User profile & settings
│   │   ├── contacts.ts        # Contact management
│   │   ├── messages.ts        # Message history
│   │   ├── campaigns.ts       # Campaign management
│   │   └── whatsapp.ts        # WhatsApp connection
│   └── services/
│       └── whatsapp.ts        # Baileys WhatsApp service
├── prisma/
│   └── schema.prisma          # Database schema
├── auth_sessions/             # WhatsApp session storage (git ignored)
├── dist/                      # Compiled JavaScript (git ignored)
├── node_modules/              # Dependencies (git ignored)
├── .env                       # Environment variables (git ignored)
├── .env.example               # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies & scripts
└── tsconfig.json             # TypeScript configuration
```

### Backend Routes

**Authentication (`/api/auth`)**
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token

**User (`/api/user`)**
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password
- `POST /regenerate-api-key` - Generate new API key
- `GET /stats` - Get user statistics

**Contacts (`/api/contacts`)**
- `GET /` - Get all contacts
- `POST /` - Create new contact
- `POST /import` - Import from CSV/XLSX
- `PUT /:id` - Update contact
- `DELETE /:id` - Delete contact
- `GET /groups` - Get all groups

**Messages (`/api/messages`)**
- `GET /` - Get message history
- `GET /:id` - Get message details
- `DELETE /:id` - Delete message

**Campaigns (`/api/campaigns`)**
- `GET /` - Get all campaigns
- `POST /` - Create & start campaign
- `GET /:id` - Get campaign details
- `DELETE /:id` - Delete campaign

**WhatsApp (`/api/whatsapp`)**
- `GET /qr` - Generate QR code
- `GET /status` - Get connection status
- `POST /disconnect` - Disconnect WhatsApp

---

## 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component with routing
│   ├── index.css                   # Global styles (Tailwind)
│   ├── components/
│   │   ├── Layout.tsx              # Main layout with sidebar
│   │   └── ui/                     # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── label.tsx
│   │       └── table.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx           # Login page
│   │   ├── RegisterPage.tsx        # Registration page
│   │   ├── DashboardPage.tsx       # Dashboard with stats
│   │   ├── ContactsPage.tsx        # Contact management
│   │   ├── BlastPage.tsx           # Send blast messages
│   │   ├── CampaignsPage.tsx       # Campaign history
│   │   ├── WhatsAppPage.tsx        # WhatsApp connection
│   │   └── SettingsPage.tsx        # User settings
│   ├── store/
│   │   └── authStore.ts            # Zustand auth state
│   └── lib/
│       ├── api.ts                  # Axios instance
│       └── utils.ts                # Utility functions
├── public/                         # Static assets
├── node_modules/                   # Dependencies (git ignored)
├── dist/                          # Build output (git ignored)
├── .env                           # Environment variables (git ignored)
├── .env.example                   # Environment template
├── .gitignore                    # Git ignore rules
├── index.html                    # HTML template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── tsconfig.node.json            # TypeScript for Vite
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
└── postcss.config.js             # PostCSS config
```

### Frontend Pages & Features

**LoginPage**
- Email & password authentication
- Form validation with Zod
- JWT token storage
- Redirect to dashboard

**RegisterPage**
- User registration form
- Auto API key generation
- Auto login after register

**DashboardPage**
- Statistics cards (contacts, messages, success, failed)
- Bar chart visualization
- Recent messages list
- Real-time data with React Query

**ContactsPage**
- Contact list with search
- Add contact form
- Import CSV/XLSX
- Delete contacts
- Group filtering

**BlastPage**
- Campaign form
- Message template with variables
- Contact selection
- Group filtering
- Bulk send functionality

**CampaignsPage**
- Campaign history table
- Success/failed stats
- Date & time info

**WhatsAppPage**
- QR code display
- Connection status
- Connect/disconnect buttons
- Real-time status updates

**SettingsPage**
- User profile info
- API key display & regeneration
- Dark mode toggle
- API base URL

---

## 🗄️ Database Schema (Prisma)

### Models

**User**
- Authentication & profile
- API key management
- Quota limits
- Relations: contacts, messages, campaigns, sessions

**Contact**
- Contact information
- Phone numbers (international format)
- Grouping/labeling
- Relations: messages

**Message**
- Message content
- Type: text, image, video, file
- Status: pending, success, failed
- Timestamp
- Relations: user, contact

**Campaign**
- Campaign details
- Message template
- Statistics (sent, success, failed)
- Relations: user

**Session**
- WhatsApp session data
- Connection status
- Session persistence
- Relations: user

---

## 🎨 UI Components (Shadcn)

### Core Components
- **Button** - Various variants (default, destructive, outline, ghost)
- **Input** - Text inputs with validation
- **Label** - Form labels
- **Card** - Content containers
- **Table** - Data tables with sorting

### Planned Components
- Dialog/Modal
- Alert
- Tabs
- Progress
- Badge
- Avatar
- Dropdown Menu

---

## 🔧 Configuration Files

### Backend
- `tsconfig.json` - TypeScript compiler options
- `.env` - Environment variables
- `prisma/schema.prisma` - Database schema

### Frontend
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Vite bundler config
- `tailwind.config.js` - Tailwind CSS config
- `postcss.config.js` - PostCSS plugins

### Root
- `package.json` - Monorepo scripts
- `.gitignore` - Git ignore patterns

---

## 📦 Dependencies

### Backend Main Dependencies
- express - Web framework
- @whiskeysockets/baileys - WhatsApp Web API
- @prisma/client - Database ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- multer - File uploads
- zod - Schema validation
- xlsx - Excel file parsing
- qrcode - QR code generation

### Frontend Main Dependencies
- react - UI library
- react-router-dom - Routing
- @tanstack/react-query - Data fetching
- axios - HTTP client
- zustand - State management
- react-hook-form - Form handling
- zod - Validation
- recharts - Charts
- lucide-react - Icons
- tailwindcss - CSS framework
- shadcn/ui - Component library

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET           # JWT token secret
JWT_REFRESH_SECRET   # Refresh token secret
PORT                 # Server port (default: 3001)
NODE_ENV            # development/production
FRONTEND_URL        # CORS origin
```

### Frontend (.env)
```env
VITE_API_URL        # Backend API URL
```

---

## 🚀 NPM Scripts

### Root
- `install:all` - Install all dependencies
- `dev` - Start both backend & frontend
- `build` - Build both projects
- `start:backend` - Start backend in production
- `start:frontend` - Start frontend preview

### Backend
- `dev` - Start development server
- `build` - Compile TypeScript
- `start` - Run production server
- `prisma:generate` - Generate Prisma client
- `prisma:migrate` - Run database migrations
- `prisma:studio` - Open Prisma Studio

### Frontend
- `dev` - Start Vite dev server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint

---

## 📝 Key Features by File

### Authentication Flow
- `backend/src/routes/auth.ts` - Register, login, JWT
- `backend/src/middleware/auth.ts` - Protected routes
- `frontend/src/store/authStore.ts` - Auth state
- `frontend/src/pages/LoginPage.tsx` - Login UI
- `frontend/src/pages/RegisterPage.tsx` - Register UI

### WhatsApp Integration
- `backend/src/services/whatsapp.ts` - Baileys integration
- `backend/src/routes/whatsapp.ts` - WhatsApp endpoints
- `frontend/src/pages/WhatsAppPage.tsx` - QR code UI

### Blast Messaging
- `backend/src/services/whatsapp.ts` - Bulk sending logic
- `backend/src/routes/campaigns.ts` - Campaign endpoints
- `frontend/src/pages/BlastPage.tsx` - Blast UI

### Contact Management
- `backend/src/routes/contacts.ts` - CRUD + Import
- `frontend/src/pages/ContactsPage.tsx` - Contact UI

---

## 🔍 Important Notes

1. **Security**
   - Never commit `.env` files
   - JWT secrets must be strong & random
   - Use HTTPS in production
   - Validate all user inputs

2. **WhatsApp Sessions**
   - Stored in `backend/auth_sessions/`
   - Automatically backed up to database
   - Git ignored for security

3. **Database**
   - Uses Prisma ORM
   - Migrations tracked in `prisma/migrations/`
   - Use Neon.tech for production

4. **File Uploads**
   - CSV/XLSX import for contacts
   - Multer handles multipart forms
   - Files processed in-memory

5. **State Management**
   - Zustand for auth state (persisted)
   - React Query for server state
   - Local state with useState

---

## 📚 Further Reading

- **API Documentation**: See route files for endpoint details
- **Component Documentation**: See Shadcn UI docs
- **Database Schema**: See `prisma/schema.prisma`
- **Deployment**: See `DEPLOYMENT.md`
- **Contributing**: See `CONTRIBUTING.md`

---

**Last Updated**: 2024-01-10
