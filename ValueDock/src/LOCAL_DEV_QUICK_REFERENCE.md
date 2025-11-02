# ValuDock - Local Development Quick Reference

**Quick commands and tips for daily development**

---

## 🚀 Daily Development Commands

### Start Development

```bash
# Start the dev server
npm run dev

# App will be available at http://localhost:5173
```

### Build & Preview

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type check (without building)
npm run type-check
```

### Edge Functions

```bash
# Deploy main server function
supabase functions deploy server

# View real-time logs
supabase functions logs server --tail

# List all deployed functions
supabase functions list

# Set a secret
supabase secrets set KEY_NAME=value

# List all secrets
supabase secrets list
```

### Maintenance

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install

# Update Supabase CLI
npm install -g supabase@latest
```

---

## 🔑 Default Login Credentials

**Master Admin:**
- Email: `admin@dockery.ai`
- Password: `admin123`

⚠️ **Change this immediately in production!**

---

## 🔧 Environment Variables

### Frontend (.env.local)

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_OPENAI_API_KEY=sk-...
VITE_GAMMA_API_KEY=...
VITE_FATHOM_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-server
```

### Backend (Supabase Secrets)

```bash
# Set server-side secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set FATHOM_API_KEY=...
supabase secrets set GAMMA_API_KEY=...
```

---

## 📁 Key File Locations

### Configuration Files

- `.env.local` - Local environment variables (DO NOT COMMIT)
- `.env.example` - Environment template
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS/Tailwind config

### Application Code

- `App.tsx` - Main application entry point
- `components/` - React components
- `screens/` - Screen-level components
- `services/` - Business logic (ROI calculations, etc.)
- `utils/` - Utility functions
- `fsm/` - Finite State Machine (event-driven architecture)
- `styles/globals.css` - Global styles and Tailwind config

### Backend Code

- `supabase/functions/server/` - Edge function (main API)
- `supabase/functions/server/index.tsx` - API routes
- `supabase/functions/server/kv_store.tsx` - Database utilities (DO NOT EDIT)

---

## 🐛 Common Issues & Quick Fixes

### Port Already in Use

```bash
# Kill process on port 5173 (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Environment Variables Not Loading

```bash
# 1. Verify .env.local exists
ls -la .env.local

# 2. Verify variables have VITE_ prefix
cat .env.local

# 3. Restart dev server
# Press Ctrl+C then:
npm run dev
```

### Edge Function Not Deploying

```bash
# Ensure you're logged in
supabase login

# Ensure linked to correct project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy with debug output
supabase functions deploy server --debug
```

### TypeScript Errors

```bash
# Check for errors
npm run type-check

# If errors persist, try:
rm -rf node_modules
npm install
```

### CORS Errors

```bash
# Redeploy edge function (CORS is configured in code)
supabase functions deploy server

# Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (macOS)
```

---

## 🔍 Debugging

### Browser DevTools

```bash
# Press F12 to open DevTools

# Useful tabs:
# - Console: Error messages and logs
# - Network: API requests/responses
# - Application: localStorage data
# - Sources: Breakpoints and debugging
```

### Edge Function Logs

```bash
# Real-time logs
supabase functions logs server --tail

# Or view in Supabase Dashboard:
# Edge Functions → server → Logs
```

### Clear All Local Data

```javascript
// Run in browser console (F12)
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## 📊 Database Access

ValuDock uses a **key-value store** (`kv_store_888f4514` table).

### View Data in Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Table Editor**
4. Find `kv_store_888f4514` table
5. Browse data

### Query Data via API

```typescript
// In edge function code:
import * as kv from './kv_store.tsx'

// Get a value
const value = await kv.get('key-name')

// Set a value
await kv.set('key-name', { data: 'value' })

// Get multiple values
const values = await kv.mget(['key1', 'key2'])

// Get by prefix
const orgData = await kv.getByPrefix('org-123:')

// Delete a value
await kv.del('key-name')
```

---

## 🧪 Testing Scenarios

### Test Multi-Tenant Hierarchy

```
1. Login as admin@dockery.ai
2. Menu → Admin → Tenants → Add Tenant
3. Create "Test Tenant"
4. Menu → Admin → Organizations → Add Organization
5. Assign to "Test Tenant"
6. Menu → Admin → Users → Add User
7. Assign to organization
8. Logout
9. Login as new user
10. Verify isolated data
```

### Test ROI Calculations

```
1. Login as any user
2. Go to Inputs screen
3. Add a process with FTE savings
4. Go to Results screen
5. Verify NPV, ROI, and charts appear
6. Change global settings (discount rate)
7. Verify Results update
```

---

## 🏗️ Project Structure Quick Map

```
valuedock/
├── App.tsx                    # Main app
├── index.html                 # HTML entry
├── package.json               # Dependencies
├── vite.config.ts             # Build config
├── .env.local                 # Local env vars (create this!)
│
├── components/                # UI components
│   ├── AdminDashboard.tsx    # Admin panel
│   ├── InputsScreen.tsx      # Process input
│   ├── ResultsScreen.tsx     # ROI results
│   ├── PresentationScreen.tsx # AI-powered presentation
│   └── ui/                    # Shadcn components
│
├── screens/                   # Screen components
│   └── MeetingsPanel/        # Fathom meetings
│
├── services/                  # Business logic
│   ├── roiFacade.ts          # ROI calculations
│   └── roiInternal.ts        # Internal ROI logic
│
├── utils/                     # Utilities
│   ├── roiController.ts      # ROI state management
│   ├── auth.ts               # Auth helpers
│   └── supabase/info.tsx     # Supabase config
│
├── fsm/                       # State machine
│   ├── appMachine.ts         # Main state machine
│   └── commandQueue.ts       # Command queue
│
└── supabase/functions/        # Backend
    └── server/               # Edge function
        ├── index.tsx         # API routes
        └── kv_store.tsx      # DB utilities
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Use strong passwords for all users
- [ ] Keep `.env.local` in `.gitignore`
- [ ] Never commit `SUPABASE_SERVICE_ROLE_KEY` to frontend code
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` as Supabase secret only
- [ ] Use HTTPS in production (automatic with Vercel/Netlify)
- [ ] Review Supabase security rules
- [ ] Enable rate limiting on edge functions
- [ ] Audit admin user list regularly

---

## 📦 Deployment Quick Guide

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Settings → Environment Variables
# Add: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify Dashboard
# Site settings → Environment variables
```

### Deploy Edge Functions

```bash
# Already covered above, but for reference:
supabase functions deploy server
```

---

## 📚 Documentation Quick Links

- **Setup Guides:**
  - [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) - Detailed local setup
  - [DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md) - Setup checklist
  - [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md) - First-time configuration

- **Feature Documentation:**
  - [README.md](./README.md) - Main documentation
  - [FATHOM_INTEGRATION_GUIDE.md](./FATHOM_INTEGRATION_GUIDE.md) - Fathom setup
  - [GAMMA_INTEGRATION_GUIDE.md](./GAMMA_INTEGRATION_GUIDE.md) - Gamma setup
  - [OPENAI_INTEGRATION_GUIDE.md](./OPENAI_INTEGRATION_GUIDE.md) - OpenAI setup

- **Technical Documentation:**
  - [docs/architecture-schema.md](./docs/architecture-schema.md) - Architecture
  - [docs/api-contracts.md](./docs/api-contracts.md) - API documentation
  - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

## 💡 Development Tips

### Hot Module Replacement (HMR)

Vite automatically reloads changes:
- Edit `.tsx` files → Instant update
- Edit `.css` files → Instant style update
- No need to manually refresh browser

### React DevTools

Install browser extension:
- Chrome: https://chrome.google.com/webstore (search "React Developer Tools")
- Firefox: https://addons.mozilla.org (search "React Developer Tools")

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Error Lens (shows errors inline)
- GitLens (Git integration)

### Keyboard Shortcuts

```
Ctrl+C          Stop dev server
Ctrl+Shift+R    Hard refresh browser
F12             Open browser DevTools
Ctrl+Shift+I    Open browser DevTools (alternative)
```

---

## 🆘 Getting Help

1. **Check browser console** (F12) for error messages
2. **Check edge function logs**: `supabase functions logs server`
3. **Review documentation** in `/docs` and `.md` files
4. **Search existing issues** in project repository
5. **Contact development team** via your communication channel

---

## ✅ Pre-Development Checklist

Before starting each development session:

- [ ] `git pull origin main` (get latest changes)
- [ ] `npm install` (update dependencies if needed)
- [ ] `.env.local` is configured
- [ ] Edge function is deployed
- [ ] `npm run dev` starts successfully
- [ ] Can login to app
- [ ] No errors in browser console

---

**Happy Coding! 🚀**

For detailed setup instructions, see [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)

---

**Last Updated**: November 2, 2025
