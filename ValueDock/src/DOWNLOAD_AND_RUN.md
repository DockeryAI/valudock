# 🚀 ValuDock - Download and Run Guide

**Get ValuDock running on your local machine in 10 minutes**

---

## ⚡ Quick Start (For Experienced Developers)

```bash
# 1. Clone and install
git clone <repo-url>
cd valuedock
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Deploy edge function
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase functions deploy server

# 4. Run
npm run dev
```

Open `http://localhost:5173` and login with `admin@dockery.ai` / `admin123`

---

## 📋 Step-by-Step Guide

### Step 1: Prerequisites

Install these before proceeding:

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version` (should show v18.0.0 or higher)

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **Supabase Account**
   - Sign up: https://supabase.com/ (free tier is fine)

### Step 2: Download the Project

**Option A: Clone from Git**
```bash
git clone <your-repository-url>
cd valuedock
```

**Option B: Download ZIP**
1. Download ZIP file
2. Extract to desired location
3. `cd` into the folder

### Step 3: Install Dependencies

```bash
npm install
```

Wait for installation to complete (30-60 seconds).

### Step 4: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New project"
3. Fill in:
   - Name: `valuedock-dev`
   - Database Password: (create strong password, **save it!**)
   - Region: (choose closest to you)
   - Plan: Free
4. Click "Create new project"
5. **Wait 2-3 minutes** for provisioning

### Step 5: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 6: Configure Environment

```bash
# Copy the template
cp .env.example .env.local

# Edit with your favorite text editor
nano .env.local  # or use: code .env.local (VS Code)
```

Fill in these **required** values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Leave optional values blank for now.

**Save and close the file.**

### Step 7: Deploy Backend (Edge Function)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
# Find YOUR_PROJECT_ID in dashboard URL: app.supabase.com/project/YOUR_PROJECT_ID
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the server function
supabase functions deploy server
```

**Expected output:**
```
Deploying function server
Function server deployed successfully
URL: https://your-project-id.supabase.co/functions/v1/make-server-888f4514
```

### Step 8: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 9: Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the ValuDock login screen

### Step 10: Login

**Use default credentials:**
- **Email**: `admin@dockery.ai`
- **Password**: `admin123`

Click "Sign In"

**Success!** You should see the ValuDock dashboard.

---

## ✅ Verification Checklist

After setup, confirm:

- [ ] Dev server started without errors
- [ ] Browser shows login screen at `http://localhost:5173`
- [ ] Can login with `admin@dockery.ai` / `admin123`
- [ ] See "Welcome, Global Admin" message
- [ ] Admin menu appears in navigation
- [ ] Can navigate between screens (Inputs, Results, etc.)
- [ ] Browser console (F12) shows no red errors

---

## 🎯 Next Steps

### 1. Create Your First Data

Follow [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md) to:
- Create tenants
- Create organizations
- Create users
- Set up your hierarchy

### 2. (Optional) Enable AI Features

If you want AI-powered features:

#### OpenAI Integration

```bash
# Get API key from https://platform.openai.com/api-keys
# Add to .env.local
echo 'VITE_OPENAI_API_KEY=sk-your-key-here' >> .env.local

# Set server secret
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

#### Fathom Integration

```bash
# Requires separate fathom-server function (contact dev team)
# Add to .env.local
echo 'VITE_FATHOM_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-server' >> .env.local

# Set server secret
supabase secrets set FATHOM_API_KEY=your-fathom-key

# Deploy fathom-server function (requires code)
supabase functions deploy fathom-server
```

### 3. Start Developing

- Edit files in `components/`, `services/`, etc.
- Changes auto-reload via Vite HMR
- Check browser console for errors
- View edge function logs: `supabase functions logs server`

---

## 🔧 Customization

### Change Branding

Edit `styles/globals.css`:
```css
:root {
  --primary: #your-brand-color;
  --secondary: #your-secondary-color;
}
```

### Add Custom Features

1. Create components in `components/`
2. Add routes in `App.tsx`
3. Add API endpoints in `supabase/functions/server/index.tsx`

---

## 🐛 Troubleshooting

### Dev server won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port 5173 already in use

```bash
# Use different port
npm run dev -- --port 3000

# Or kill existing process (macOS/Linux)
lsof -ti:5173 | xargs kill -9
```

### Can't login

1. Verify edge function deployed: `supabase functions deploy server`
2. Check `.env.local` has correct credentials
3. Try exact credentials: `admin@dockery.ai` / `admin123`
4. Check browser console (F12) for errors

### Environment variables not loading

1. Verify `.env.local` exists: `ls -la .env.local`
2. Verify variables have `VITE_` prefix
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Edge function errors

```bash
# View logs
supabase functions logs server

# Redeploy
supabase functions deploy server --debug
```

For more solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Documentation

- **[LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)** - Detailed setup instructions
- **[DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md)** - Step-by-step checklist
- **[FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)** - Create tenants & orgs
- **[LOCAL_DEV_QUICK_REFERENCE.md](./LOCAL_DEV_QUICK_REFERENCE.md)** - Quick commands
- **[README.md](./README.md)** - Main documentation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues

---

## 🏗️ Project Structure

```
valuedock/
├── .env.local              # Your local config (create this!)
├── .env.example            # Template
├── package.json            # Dependencies
├── vite.config.ts          # Build config
├── App.tsx                 # Main app
├── index.html              # HTML entry
│
├── components/             # React components
├── screens/                # Screen components
├── services/               # Business logic
├── utils/                  # Utilities
├── fsm/                    # State machine
├── styles/                 # CSS
│
└── supabase/functions/     # Backend
    └── server/            # Edge function API
```

---

## 🔑 Important Notes

### Default Credentials

- Email: `admin@dockery.ai`
- Password: `admin123`

**⚠️ CHANGE THIS IMMEDIATELY IN PRODUCTION!**

### Security

- **Never** commit `.env.local` to version control
- `.env.local` is already in `.gitignore`
- Use strong passwords for production
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only

### Environment Variables

**Frontend** (in `.env.local`):
- Must start with `VITE_` prefix
- Example: `VITE_SUPABASE_URL`

**Backend** (set via Supabase CLI):
- No `VITE_` prefix
- Example: `supabase secrets set OPENAI_API_KEY=...`

---

## 📞 Getting Help

1. **Check documentation** in `/docs` and `.md` files
2. **Check browser console** (F12) for errors
3. **Check edge function logs**: `supabase functions logs server`
4. **Review troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
5. **Contact development team** via your communication channel

---

## ✨ Features Overview

Once running, ValuDock provides:

- **7 Main Screens**: Inputs, Implementation, Results, Presentation, Scenario, Timeline, Export
- **Multi-Tenant Architecture**: Isolate data by organization
- **Role-Based Access**: Master Admin, Tenant Admin, Org Admin, User
- **CFO-Grade Calculations**: NPV, IRR, Payback Period, Cash Flow
- **AI-Powered Features**: Meeting summaries, challenge extraction, presentations
- **Mobile-Optimized**: Touch-friendly interface
- **Professional Reports**: Export to PDF, CSV, Excel
- **White-Label Ready**: Customize branding per tenant

---

## 🚀 You're Ready!

If the dev server is running and you can login, **you're all set!**

**Next steps:**
1. Read [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)
2. Create your first tenant and organization
3. Start building ROI calculators!

**Happy developing! 🎉**

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0
