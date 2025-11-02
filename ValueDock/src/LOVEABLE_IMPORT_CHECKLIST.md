# Loveable Migration - Quick Checklist

**Print this page and check off each step as you complete it.**

---

## ☐ Phase 1: Local Setup (30 minutes)

### File Preparation
- [ ] Download all files from Figma Make
- [ ] Create local `valuedock` folder
- [ ] Copy all components to `/components`
- [ ] Copy all utils to `/utils`
- [ ] Copy all styles to `/styles`
- [ ] Copy supabase functions to `/supabase/functions`
- [ ] Copy all documentation to `/docs`

### Configuration Files
- [ ] Create `package.json` (copy from LOVEABLE_MIGRATION_GUIDE.md)
- [ ] Create `tsconfig.json` (copy from guide)
- [ ] Create `tsconfig.node.json` (copy from guide)
- [ ] Create `vite.config.ts` (copy from guide)
- [ ] Create `index.html` (copy from guide)
- [ ] Create `main.tsx` (copy from guide)
- [ ] Create `.env.example` (copy from guide)
- [ ] Verify `.gitignore` is present

### Environment Variable Updates
- [ ] Find & replace: `import.meta.env.SUPABASE_URL` → `import.meta.env.VITE_SUPABASE_URL`
- [ ] Find & replace: `import.meta.env.SUPABASE_ANON_KEY` → `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [ ] Update `utils/supabase/info.tsx` with VITE_ prefix
- [ ] Double-check NO hardcoded API keys in code

---

## ☐ Phase 2: GitHub (15 minutes)

### Repository Setup
- [ ] Open terminal/command prompt
- [ ] Navigate to project folder: `cd /path/to/valuedock`
- [ ] Run: `git init`
- [ ] Run: `git remote add origin https://github.com/dockeryai/valuedock.git`
- [ ] Run: `git pull origin main --allow-unrelated-histories`

### Commit & Push
- [ ] Run: `git add .`
- [ ] Run: `git status` (verify files)
- [ ] Run: `git commit -m "feat: Complete ValueDock implementation"`
- [ ] Run: `git push -u origin main`
- [ ] Open https://github.com/dockeryai/valuedock
- [ ] Verify all files are visible on GitHub

---

## ☐ Phase 3: Supabase Edge Function (20 minutes)

### Supabase CLI
- [ ] Install Supabase CLI (if needed)
  - macOS: `brew install supabase/tap/supabase`
  - Windows: `scoop install supabase`
- [ ] Run: `supabase login`
- [ ] Get project reference from Supabase dashboard
- [ ] Run: `supabase link --project-ref [your-ref]`

### Deploy Function
- [ ] Run: `cd supabase/functions`
- [ ] Run: `supabase functions deploy server`
- [ ] Verify deployment: `supabase functions list`
- [ ] Set secrets: `supabase secrets set SUPABASE_URL=[url]`
- [ ] Set secrets: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[key]`
- [ ] Test function: Open `https://[project].supabase.co/functions/v1/make-server-888f4514/health`

---

## ☐ Phase 4: Loveable Account (10 minutes)

### Account Creation
- [ ] Go to https://loveable.dev
- [ ] Click **Sign Up**
- [ ] Choose **Sign up with GitHub**
- [ ] Authorize Loveable
- [ ] Complete profile

### Project Import
- [ ] Click **New Project**
- [ ] Select **Import from GitHub**
- [ ] Authorize GitHub access
- [ ] Select `dockeryai/valuedock` repository
- [ ] Select `main` branch
- [ ] Click **Import Project**
- [ ] Wait for import confirmation

---

## ☐ Phase 5: Loveable Configuration (15 minutes)

### Framework Settings
- [ ] Verify auto-detected: **React + TypeScript + Vite**
- [ ] If not, manually select: React with TypeScript
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Environment Variables
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add: `VITE_SUPABASE_URL` = `https://[project].supabase.co`
- [ ] Add: `VITE_SUPABASE_ANON_KEY` = `[your-anon-key]`
- [ ] Add: `VITE_SUPABASE_SERVICE_ROLE_KEY` = `[your-service-key]`
- [ ] Mark `SERVICE_ROLE_KEY` as **secret**
- [ ] Click **Save**

---

## ☐ Phase 6: First Deployment (20 minutes)

### Build Process
- [ ] Click **Deploy** button
- [ ] Watch build logs
- [ ] Wait for "Build successful" message
- [ ] Note any errors (fix and redeploy if needed)

### Verify Deployment
- [ ] Click **View Live App**
- [ ] Note your URL: `https://[name].loveable.app`
- [ ] App loads without errors
- [ ] Login screen appears

---

## ☐ Phase 7: Testing (30 minutes)

### Authentication
- [ ] Login with existing credentials
- [ ] Session persists on refresh
- [ ] Logout works
- [ ] Login again

### Main Features
- [ ] Inputs Screen loads
- [ ] Can create a new process
- [ ] Results Screen displays
- [ ] Charts render correctly
- [ ] Presentation Screen works
- [ ] Export function works

### Admin Panel
- [ ] Admin Panel opens
- [ ] User list displays
- [ ] Can create test user
- [ ] Tenant management works
- [ ] Organization management works

### Mobile Testing
- [ ] Open on mobile device or DevTools mobile view
- [ ] All screens responsive
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] Process reordering buttons work

### Data Persistence
- [ ] Create test data
- [ ] Click Save
- [ ] Refresh browser
- [ ] Data persists
- [ ] Context switching works

---

## ☐ Phase 8: Optional Enhancements

### Custom Domain (Optional)
- [ ] Purchase domain
- [ ] Configure DNS records
- [ ] Add domain in Loveable
- [ ] Enable SSL
- [ ] Verify domain works

### Builder.io (Optional)
- [ ] Create Builder.io account
- [ ] Get public API key
- [ ] Add to Loveable env vars
- [ ] Install Builder.io SDK
- [ ] Register components
- [ ] Test visual editing

### Monitoring (Optional)
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Add Google Analytics
- [ ] Configure alerts
- [ ] Test error reporting

### Continuous Deployment (Recommended)
- [ ] Enable auto-deploy in Loveable
- [ ] Test: Make change, push to GitHub
- [ ] Verify automatic deployment
- [ ] Check deployment notifications

---

## ☐ Phase 9: Documentation & Handoff

### Update Documentation
- [ ] Update README with Loveable URL
- [ ] Document deployment process
- [ ] Update environment variable guide
- [ ] Add team access instructions

### Team Setup
- [ ] Invite team members to Loveable
- [ ] Set permissions (viewer/editor/admin)
- [ ] Share deployment URL
- [ ] Provide login credentials for test accounts

### Final Verification
- [ ] All features working in production
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Mobile experience smooth
- [ ] No console errors
- [ ] SSL certificate active
- [ ] Backups configured

---

## ✅ Migration Complete!

### Your ValueDock® URLs:
- **Production App**: `https://[name].loveable.app`
- **GitHub Repo**: `https://github.com/dockeryai/valuedock`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/[id]`
- **Loveable Dashboard**: `https://loveable.dev/projects/[id]`

### Next Steps:
1. Share URLs with team
2. Set up regular backups
3. Monitor usage and performance
4. Plan next features
5. Use Builder.io for rapid iterations

---

## Troubleshooting Quick Reference

### Build Fails
→ Check build logs for specific error  
→ Verify all dependencies in package.json  
→ Check TypeScript errors  
→ Ensure VITE_ prefix on env vars

### Can't Login
→ Verify Supabase Edge Function deployed  
→ Check Edge Function logs  
→ Verify environment variables  
→ Check browser console for errors

### Data Not Saving
→ Verify organization context selected  
→ Check Supabase connection  
→ Test Edge Function endpoint  
→ Check browser localStorage

### Mobile Issues
→ Clear browser cache  
→ Check viewport meta tag  
→ Verify useIsMobile hook  
→ Test in multiple browsers

---

**Need help? Check `/LOVEABLE_MIGRATION_GUIDE.md` for detailed steps.**

**Questions? Refer to `/TROUBLESHOOTING.md` or `/docs` folder.**
