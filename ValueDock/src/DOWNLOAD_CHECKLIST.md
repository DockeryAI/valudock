# ValuDock - Download and Setup Checklist

**Complete checklist for setting up ValuDock on a new machine**

---

## ✅ Pre-Download Checklist

Before downloading, ensure you have:

- [ ] **Node.js 18+** installed
  - Download: https://nodejs.org/
  - Verify: `node --version`
  - Should show: v18.0.0 or higher

- [ ] **npm 9+** installed (comes with Node.js)
  - Verify: `npm --version`
  - Should show: 9.0.0 or higher

- [ ] **Git** installed
  - Download: https://git-scm.com/
  - Verify: `git --version`

- [ ] **Supabase Account** created
  - Sign up: https://supabase.com/
  - Free tier is fine for development

- [ ] **Text Editor** installed
  - Recommended: VS Code (https://code.visualstudio.com/)
  - Or any editor you prefer

---

## 📥 Download Instructions

### Option 1: Clone from Git Repository

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to directory
cd valuedock

# Verify files
ls -la
```

### Option 2: Download ZIP

1. Download the ZIP file from your repository
2. Extract to your desired location
3. Navigate to the extracted folder:
   ```bash
   cd valuedock
   ```

---

## 🔧 Post-Download Setup

### Step 1: Install Dependencies

```bash
# Install all npm packages
npm install
```

**Expected output:**
```
added 1234 packages in 30s
```

**Troubleshooting:**
- If this fails, try: `npm cache clean --force` then retry
- If you get permission errors on macOS/Linux, don't use `sudo`

### Step 2: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New project"
3. Fill in:
   - Name: `valuedock-dev`
   - Database Password: (create strong password, save it!)
   - Region: (choose nearest to you)
   - Plan: Free
4. Click "Create new project"
5. **Wait 2-3 minutes** for project to provision

### Step 3: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Keep these handy for next step

### Step 4: Create Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 5: Edit Environment File

Open `.env.local` in your text editor and fill in:

```env
# REQUIRED - Get these from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OPTIONAL - Leave blank for now, add later if needed
VITE_OPENAI_API_KEY=
VITE_GAMMA_API_KEY=
VITE_FATHOM_PROXY_URL=
```

**Save the file.**

### Step 6: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

**Expected output:**
```
1.x.x
```

### Step 7: Login to Supabase CLI

```bash
supabase login
```

This will open your browser for authentication. Follow the prompts.

### Step 8: Link to Your Project

```bash
# Replace YOUR_PROJECT_ID with your actual project ID
# Find it in your Supabase Dashboard URL:
# https://app.supabase.com/project/YOUR_PROJECT_ID
supabase link --project-ref YOUR_PROJECT_ID
```

Enter your **database password** when prompted (the one you created in Step 2).

### Step 9: Deploy Edge Function

```bash
# Deploy the main server function
supabase functions deploy server
```

**Expected output:**
```
Deploying function server
Function server deployed successfully
URL: https://your-project-id.supabase.co/functions/v1/make-server-888f4514
```

If you see this, ✅ **deployment successful!**

### Step 10: Start Development Server

```bash
# Start the app
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 11: Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the ValuDock login screen

### Step 12: First Login

**Use default credentials:**
- Email: `admin@dockery.ai`
- Password: `admin123`

Click "Sign In"

**If successful, you should see:**
- Welcome message: "Welcome, Global Admin"
- Admin menu available
- Full dashboard access

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Dev server starts without errors
- [ ] Browser opens to login screen
- [ ] Can log in with `admin@dockery.ai` / `admin123`
- [ ] See "Welcome, Global Admin" message
- [ ] Admin menu appears in navigation
- [ ] Can navigate to different screens (Inputs, Results, etc.)
- [ ] No console errors in browser DevTools (F12)
- [ ] Edge function responds (check Network tab in DevTools)

---

## 🚨 Common Issues and Quick Fixes

### Issue: `npm install` fails

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Port 5173 already in use

**Fix:**
```bash
# On macOS/Linux
lsof -ti:5173 | xargs kill -9

# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### Issue: "VITE_SUPABASE_URL is not defined"

**Fix:**
1. Verify `.env.local` exists in project root
2. Verify variables start with `VITE_` prefix
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: Login fails with "Invalid credentials"

**Fix:**
1. Verify edge function deployed: `supabase functions deploy server`
2. Check Supabase project is active (not paused)
3. Try exact credentials:
   - Email: `admin@dockery.ai`
   - Password: `admin123`
4. Check browser console for errors (F12)

### Issue: Edge function deployment fails

**Fix:**
```bash
# Ensure you're logged in
supabase login

# Ensure linked to correct project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy with verbose output
supabase functions deploy server --debug
```

### Issue: CORS errors in browser

**Fix:**
- Edge function already has CORS enabled
- Verify you deployed the function: `supabase functions deploy server`
- Check `.env.local` has correct `VITE_SUPABASE_URL`
- Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## 📚 Next Steps

Once setup is complete:

1. **Read Documentation:**
   - [ ] [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md) - Create tenants and organizations
   - [ ] [README.md](./README.md) - Learn about features
   - [ ] [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) - Detailed development guide

2. **Create Your First Data:**
   - [ ] Create a tenant (Menu → Admin → Tenants → Add Tenant)
   - [ ] Create an organization (Menu → Admin → Organizations → Add Organization)
   - [ ] Create users (Menu → Admin → Users → Add User)

3. **Test Core Features:**
   - [ ] Add a process in Inputs screen
   - [ ] View calculated ROI in Results screen
   - [ ] Try the Presentation screen
   - [ ] Export data

4. **Optional: Configure AI Features**
   - [ ] Get OpenAI API key from https://platform.openai.com/
   - [ ] Add to `.env.local`: `VITE_OPENAI_API_KEY=sk-...`
   - [ ] Set server secret: `supabase secrets set OPENAI_API_KEY=sk-...`
   - [ ] Restart dev server

---

## 📞 Getting Help

If you encounter issues:

1. **Check Documentation:**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)
   - [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)

2. **Check Browser Console:**
   - Press F12
   - Look for red error messages
   - Check Network tab for failed requests

3. **Check Edge Function Logs:**
   ```bash
   supabase functions logs server
   ```
   Or in Supabase Dashboard → Edge Functions → server → Logs

4. **Common Solutions:**
   - Restart dev server: `Ctrl+C` then `npm run dev`
   - Clear browser cache: `Ctrl+Shift+Delete`
   - Redeploy function: `supabase functions deploy server`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 🎯 Final Verification

Before you start developing, confirm:

```bash
# 1. Check Node version
node --version  # Should be 18.0.0 or higher

# 2. Check npm version
npm --version  # Should be 9.0.0 or higher

# 3. Check Supabase CLI
supabase --version  # Should show version number

# 4. Verify environment file exists
cat .env.local  # Should show your Supabase credentials

# 5. Verify edge function is deployed
curl https://your-project-id.supabase.co/functions/v1/make-server-888f4514/health

# 6. Start dev server
npm run dev  # Should start without errors

# 7. Test in browser
# Open http://localhost:5173 and log in
```

---

## ✅ Setup Complete!

If all steps passed, you're ready to develop! 🎉

**Default Login:**
- Email: `admin@dockery.ai`
- Password: `admin123`

**Change this password immediately** in Admin → Users after first login!

---

**Questions?** See [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) for detailed instructions.

**Last Updated**: November 2, 2025
