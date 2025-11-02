# ValuDock - Local Development Setup Guide

**Complete guide for setting up ValuDock on your local machine**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup Instructions](#detailed-setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Supabase Setup](#supabase-setup)
6. [Edge Functions Deployment](#edge-functions-deployment)
7. [Running the Application](#running-the-application)
8. [Optional Integrations](#optional-integrations)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

### Required

- **Node.js** v18.0.0 or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** v9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`

- **Git**
  - Download from: https://git-scm.com/
  - Verify: `git --version`

- **Supabase Account**
  - Sign up at: https://supabase.com/
  - Free tier is sufficient for development

### Recommended

- **Supabase CLI** (for edge function deployment)
  ```bash
  npm install -g supabase
  ```
  - Verify: `supabase --version`

- **VS Code** or your preferred code editor
  - Recommended extensions:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features

---

## Quick Start

If you're already familiar with React/Supabase development:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd valuedock

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Edit .env.local with your Supabase credentials
# (Get these from your Supabase dashboard)

# 5. Deploy edge functions
supabase functions deploy server

# 6. Start development server
npm run dev
```

Then navigate to `http://localhost:5173` (or the port shown in terminal).

---

## Detailed Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository to your local machine
git clone <your-repo-url>

# Navigate into the project directory
cd valuedock
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install
```

This will install:
- React 18+ and React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS 4.0
- Shadcn/ui components
- Recharts (for charts)
- Lucide React (for icons)
- Supabase JavaScript client
- And all other dependencies

**Expected output:**
```
added 1234 packages in 30s
```

### Step 3: Set Up Environment Variables

ValuDock requires several environment variables to connect to your Supabase backend.

#### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

> **Note**: `.env.local` is gitignored and will not be committed to version control.

#### Edit `.env.local`

Open `.env.local` in your text editor and fill in your values:

```env
# ============================================
# REQUIRED - Supabase Configuration
# ============================================
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================
# OPTIONAL - AI Integrations
# ============================================

# OpenAI (for AI features like meeting summaries)
VITE_OPENAI_API_KEY=sk-...

# Gamma.ai (for presentation generation)
VITE_GAMMA_API_KEY=your-gamma-api-key

# Fathom (for meeting transcripts - requires separate fathom-server deployment)
VITE_FATHOM_PROXY_URL=https://your-project-id.supabase.co/functions/v1/fathom-server

# ============================================
# INTERNAL - Do not modify
# ============================================
VITE_APP_NAME=ValuDock
```

> **Where to find Supabase credentials:**
> 1. Go to https://app.supabase.com/
> 2. Select your project (or create a new one)
> 3. Go to Settings → API
> 4. Copy "Project URL" and "anon public" key

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Anonymous/public key | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` |

### Optional Variables (for AI features)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI-powered features | https://platform.openai.com/api-keys |
| `VITE_GAMMA_API_KEY` | Gamma.ai API key for presentation generation | https://gamma.ai/ (contact for API access) |
| `VITE_FATHOM_PROXY_URL` | Fathom meeting proxy endpoint | Deploy `fathom-server` edge function first |

### Supabase Secret Variables (server-side only)

These are **NOT** stored in `.env.local`. They are set directly in Supabase:

| Variable | Description | How to Set |
|----------|-------------|------------|
| `SUPABASE_URL` | Auto-set by Supabase | N/A (automatic) |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase | N/A (automatic) |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase | N/A (automatic) |
| `OPENAI_API_KEY` | OpenAI key (server-side) | Supabase Dashboard → Edge Functions → Secrets |
| `FATHOM_API_KEY` | Fathom API key (server-side) | Supabase Dashboard → Edge Functions → Secrets |
| `GAMMA_API_KEY` | Gamma API key (server-side) | Supabase Dashboard → Edge Functions → Secrets |

**To set Supabase secrets:**
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set FATHOM_API_KEY=your-fathom-key
supabase secrets set GAMMA_API_KEY=your-gamma-key
```

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to https://app.supabase.com/
2. Click "New project"
3. Fill in:
   - **Project name**: `valuedock-dev` (or your preferred name)
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing plan**: Free (sufficient for development)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### Step 2: Get Your Credentials

1. After project is created, go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon public key**: This is your `VITE_SUPABASE_ANON_KEY`
   - **service_role secret**: You'll need this for edge functions
3. Paste these into your `.env.local` file

### Step 3: Set Up Authentication

ValuDock uses Supabase Auth for user management.

**No additional setup required!** 

Supabase Auth is enabled by default. The app will automatically:
- Create users via edge function (`/make-server-888f4514/signup`)
- Handle login/logout
- Manage sessions

### Step 4: Database Table

ValuDock uses a **key-value store** table that is automatically created by the edge function on first run.

**No manual SQL required!**

The `kv_store_888f4514` table will be created automatically when you deploy the edge function.

---

## Edge Functions Deployment

ValuDock requires a Supabase Edge Function to handle backend logic.

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser for authentication.

### Step 3: Link to Your Project

```bash
# Get your project reference ID from the Supabase dashboard URL:
# https://app.supabase.com/project/YOUR_PROJECT_ID
supabase link --project-ref YOUR_PROJECT_ID
```

Enter your database password when prompted.

### Step 4: Deploy the Main Server Function

```bash
supabase functions deploy server
```

Expected output:
```
Deploying function server
Function server deployed successfully
URL: https://your-project-id.supabase.co/functions/v1/make-server-888f4514
```

### Step 5: (Optional) Deploy Fathom Server Function

If you plan to use Fathom meeting integration:

```bash
# Note: This requires a separate fathom-server repository/function
# Contact the development team for the fathom-server code
supabase functions deploy fathom-server
```

Set the URL in your `.env.local`:
```env
VITE_FATHOM_PROXY_URL=https://your-project-id.supabase.co/functions/v1/fathom-server
```

### Step 6: Set Edge Function Secrets

Set server-side API keys:

```bash
# OpenAI (if using AI features)
supabase secrets set OPENAI_API_KEY=sk-your-openai-key

# Fathom (if using meeting integration)
supabase secrets set FATHOM_API_KEY=your-fathom-key

# Gamma (if using presentation generation)
supabase secrets set GAMMA_API_KEY=your-gamma-key
```

Verify secrets:
```bash
supabase secrets list
```

---

## Running the Application

### Development Mode

Start the Vite development server:

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser to `http://localhost:5173`

### Production Build

Build the app for production:

```bash
npm run build
```

Output will be in the `dist/` folder.

Preview the production build:

```bash
npm run preview
```

---

## Optional Integrations

### OpenAI Integration

For AI-powered features (meeting summaries, challenge extraction, etc.):

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to `.env.local`:
   ```env
   VITE_OPENAI_API_KEY=sk-...
   ```
3. Set server-side secret:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
4. Restart dev server

### Gamma.ai Integration

For one-click presentation generation:

1. Contact Gamma.ai for API access
2. Add to `.env.local`:
   ```env
   VITE_GAMMA_API_KEY=your-gamma-key
   ```
3. Set server-side secret:
   ```bash
   supabase secrets set GAMMA_API_KEY=your-gamma-key
   ```

### Fathom Meeting Integration

For automatic meeting transcript ingestion:

1. **Prerequisites:**
   - Fathom account with API access
   - Deployed `fathom-server` edge function (separate repository)

2. **Setup:**
   ```bash
   # Deploy fathom-server (requires separate code)
   supabase functions deploy fathom-server
   
   # Set Fathom API key
   supabase secrets set FATHOM_API_KEY=your-fathom-key
   ```

3. **Configure in app:**
   ```env
   VITE_FATHOM_PROXY_URL=https://your-project-id.supabase.co/functions/v1/fathom-server
   ```

4. **Usage:**
   - Go to Meetings panel in the app
   - Click "Refresh" to sync meetings from Fathom
   - Meeting data is filtered by organization domain

---

## Troubleshooting

### Issue: `npm install` Fails

**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 5173 Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Kill the process using port 5173
# On macOS/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- --port 3000
```

### Issue: "SUPABASE_URL is not defined"

**Error**: Build fails with environment variable errors

**Solution**:
1. Verify `.env.local` exists in project root
2. Verify variables start with `VITE_` prefix (required for Vite)
3. Restart dev server after adding variables

### Issue: Login Fails with "Invalid Credentials"

**Problem**: Can't log in with default credentials

**Solution**:
1. Check that edge function is deployed:
   ```bash
   curl https://your-project-id.supabase.co/functions/v1/make-server-888f4514/health
   ```
2. Initialize the system:
   - The app auto-initializes on first access
   - Or call: `POST /make-server-888f4514/init`
3. Use default credentials:
   - Email: `admin@dockery.ai`
   - Password: `admin123`

### Issue: Edge Function Deployment Fails

**Error**: `Failed to deploy function`

**Solution**:
```bash
# Ensure you're logged in
supabase login

# Ensure project is linked
supabase link --project-ref YOUR_PROJECT_ID

# Check function syntax
cd supabase/functions/server
deno check index.tsx

# Deploy with verbose logging
supabase functions deploy server --debug
```

### Issue: CORS Errors in Browser Console

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
- Edge function already has CORS enabled
- Verify edge function URL is correct
- Check that request includes `Authorization` header
- Redeploy edge function: `supabase functions deploy server`

### Issue: "No organization found" After Login

**Problem**: Logged in but see error about missing organization

**Solution**:
1. You need to create a tenant and organization first
2. Follow the [First Time Setup Guide](./FIRST_TIME_SETUP.md)
3. As global admin:
   - Menu → Admin → Tenants → Add Tenant
   - Menu → Admin → Organizations → Add Organization
   - Assign yourself to the organization

---

## Development Workflow

### Typical Development Session

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Make changes to code
# - Files auto-reload via Vite HMR (Hot Module Replacement)

# 5. Test changes in browser at http://localhost:5173

# 6. Build for production (optional)
npm run build
```

### Working with Edge Functions

When you modify edge function code:

```bash
# 1. Make changes to files in /supabase/functions/server/

# 2. Test locally (optional, requires Docker)
supabase start
supabase functions serve server

# 3. Deploy to Supabase
supabase functions deploy server

# 4. Test in the app
# No need to restart dev server - just refresh browser
```

### Project Structure Reference

```
valuedock/
├── .env.local              # Local environment variables (create this)
├── .env.example            # Environment template (committed to git)
├── index.html              # HTML entry point
├── App.tsx                 # Main React component
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration (if exists)
├── tsconfig.json           # TypeScript configuration (if exists)
│
├── components/             # React components
│   ├── AdminDashboard.tsx
│   ├── InputsScreen.tsx
│   ├── ResultsScreen.tsx
│   └── ui/                 # Shadcn components
│
├── screens/                # Screen-level components
│   └── MeetingsPanel/
│
├── services/               # Business logic
│   ├── roi.ts
│   ├── roiFacade.ts
│   └── roiInternal.ts
│
├── utils/                  # Utility functions
│   ├── auth.ts
│   ├── roiController.ts
│   └── supabase/
│
├── fsm/                    # Finite State Machine
│   ├── appMachine.ts
│   └── commandQueue.ts
│
├── supabase/               # Backend
│   └── functions/
│       └── server/         # Edge function
│           ├── index.tsx
│           └── kv_store.tsx
│
└── styles/
    └── globals.css         # Global styles
```

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub/GitLab
```

---

## Next Steps

After completing this setup:

1. ✅ **Read** [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md) to create your first tenant, organization, and users
2. ✅ **Review** [README.md](./README.md) for feature documentation
3. ✅ **Explore** the app interface and create test processes
4. ✅ **Configure** optional integrations (OpenAI, Gamma, Fathom) if needed
5. ✅ **Join** the development team communication channel

---

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant updates without full page reload:
- Edit React components → changes appear instantly
- Edit CSS → styles update without refresh
- TypeScript errors appear in terminal and browser

### Debugging

**Browser DevTools:**
- Press `F12` to open DevTools
- Check Console tab for errors
- Network tab shows API calls
- React DevTools extension recommended

**VS Code Debugging:**
1. Install "Debugger for Chrome" extension
2. Set breakpoints in code
3. Press `F5` to start debugging

**Edge Function Logs:**
```bash
# View real-time logs
supabase functions logs server

# Or in Supabase Dashboard:
# Go to Edge Functions → server → Logs
```

### Common Commands Quick Reference

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy edge function
supabase functions deploy server

# View edge function logs
supabase functions logs server

# Set secret
supabase secrets set KEY=value

# List secrets
supabase secrets list
```

---

## Getting Help

- **Documentation**: Check the `/docs` folder and `.md` files in the root
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **First-Time Setup**: See [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)
- **Feature Guides**: Check specific feature `.md` files (e.g., `FATHOM_INTEGRATION_GUIDE.md`)

---

## Success Checklist

Before you start developing, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Supabase project created
- [ ] `.env.local` created with Supabase credentials
- [ ] Edge function deployed (`supabase functions deploy server`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] App loads in browser at `http://localhost:5173`
- [ ] Can log in with `admin@dockery.ai` / `admin123`
- [ ] Admin dashboard accessible

---

**🎉 Congratulations! You're ready to develop ValuDock locally.**

For questions or issues, refer to the documentation or contact the development team.

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0
