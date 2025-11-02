# Loveable Import Preparation Checklist

## Pre-Migration Tasks (Do Before Importing)

### ✅ 1. Backup Everything

- [ ] Export full project from Figma Make as ZIP
- [ ] Extract ZIP to local folder
- [ ] Create Git repository
- [ ] Push to GitHub as backup
- [ ] Verify all files are present (108 files total)

### ✅ 2. Document Current State

- [ ] Take screenshots of working application
- [ ] Note all working features
- [ ] Document test login credentials
- [ ] List all environment variables needed
- [ ] Export sample data if any

### ✅ 3. Clean Up Project

Remove files NOT needed in Loveable:

```bash
# Navigate to your extracted project
cd ~/Projects/ValueDock

# Remove documentation markdown files (keep only essential ones)
# Keep: README.md, QUICK_START.md, TROUBLESHOOTING.md
# Remove all others or move to /docs folder

# Create docs archive folder
mkdir -p docs/archive

# Move non-essential docs
mv ADMIN_*.md docs/archive/
mv AUTH_*.md docs/archive/
mv COST_*.md docs/archive/
mv *_GUIDE.md docs/archive/
mv *_SUMMARY.md docs/archive/
mv *_FIX*.md docs/archive/
mv *_IMPLEMENTATION*.md docs/archive/

# Keep these in root:
# - README.md
# - QUICK_START.md  
# - TROUBLESHOOTING.md
# - LOGIN_CREDENTIALS.md
```

### ✅ 4. Verify Dependencies

Check `package.json` exists and has all dependencies:

**Required Core Dependencies:**
- react
- react-dom
- @supabase/supabase-js
- recharts (for charts)
- lucide-react (for icons)
- date-fns (date utilities)
- sonner (toast notifications)
- class-variance-authority
- clsx
- tailwind-merge

### ✅ 5. Prepare Environment Variables

Create `.env.example` file:

```bash
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Custom Configuration
# Add any other environment variables your app needs
EOF
```

**Important**: Do NOT commit actual `.env` with real keys!

### ✅ 6. Test Locally First

Before migrating, ensure it runs locally:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Verify in browser
open http://localhost:5173

# Test key features:
# - Login works
# - Navigation works  
# - Data persists
# - Calculations correct
# - Admin panel accessible
```

### ✅ 7. Create Import Manifest

List critical files that MUST be migrated:

**Priority 1 - Core (Must Have):**
- App.tsx
- /utils/supabase/info.tsx
- /utils/auth.ts
- /components/ui/* (all shadcn components)
- /styles/globals.css

**Priority 2 - Essential Components:**
- LoginScreen.tsx
- ProcessEditor.tsx
- InputsScreen.tsx
- ResultsScreen.tsx
- CFOSummaryDashboard.tsx

**Priority 3 - Admin & Management:**
- AdminDashboard.tsx
- TenantOrgContextSwitcher.tsx
- UserManagementTree.tsx

**Priority 4 - Backend:**
- /supabase/functions/server/index.tsx

---

## GitHub Preparation (Recommended Path)

### Step 1: Initialize Repository

```bash
cd ~/Projects/ValueDock

# Initialize git
git init

# Add .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
*.log
.DS_Store
dist/
build/
.cache/
EOF

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: ValueDock for Loveable migration"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `valuedock-roi-calculator`
3. Description: "ValueDock ROI Calculator - Migrated from Figma Make to Loveable"
4. Choose **Private** (recommended)
5. **Do NOT initialize** with README/gitignore (you already have them)
6. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/valuedock-roi-calculator.git

# Push to main
git branch -M main
git push -u origin main
```

### Step 4: Verify on GitHub

- Go to your repository URL
- Check all files are visible
- Verify `.env` is NOT there (should be in .gitignore)
- Check components folder has all files

---

## Loveable Import Methods

### Method A: Import from GitHub (Recommended)

**Advantages:**
- ✅ Cleanest migration path
- ✅ Loveable can analyze entire codebase
- ✅ Version control built-in
- ✅ Easy rollback if needed
- ✅ Team collaboration enabled

**Steps:**
1. Go to https://loveable.dev
2. Sign in/create account
3. Click "New Project"
4. Select "Import from GitHub"
5. Authorize Loveable to access your repos
6. Select `valuedock-roi-calculator`
7. Click "Import"
8. Wait for Loveable to index (2-5 minutes)

### Method B: Manual File Upload

**Use this if GitHub import doesn't work**

**Advantages:**
- ✅ Direct control over what's uploaded
- ✅ Can upload incrementally
- ✅ No GitHub required

**Disadvantages:**
- ⚠️ More time consuming
- ⚠️ No version control unless you set it up separately
- ⚠️ Harder to track changes

**Steps:**
1. Create new blank project in Loveable
2. Use Loveable's file upload feature
3. Upload files one by one or in batches
4. Follow the migration script phases

### Method C: Start Fresh with AI Guidance

**Advantages:**
- ✅ Can optimize during recreation
- ✅ Loveable AI helps rebuild
- ✅ Potentially cleaner code

**Disadvantages:**
- ⚠️ Most time consuming
- ⚠️ Risk of missing features
- ⚠️ Need to re-test everything

**Steps:**
1. Create new project in Loveable
2. Describe your app to Loveable AI
3. Share your codebase as reference
4. Let AI rebuild with your guidance

**Prompt Example:**
```
I have a multi-tenant ROI calculator with 7 screens, 
admin system with role-based permissions, Supabase backend,
and mobile optimization. Here's the current App.tsx...
Please help me recreate this in Loveable.
```

---

## After Import: Verification Checklist

### ✅ Immediate Checks (First 5 minutes)

- [ ] Project loads without errors
- [ ] File structure is intact
- [ ] Can see main App.tsx
- [ ] Components folder present
- [ ] UI components available

### ✅ Environment Setup (Next 10 minutes)

- [ ] Add Supabase environment variables in Loveable
- [ ] Test Supabase connection
- [ ] Verify auth system can connect
- [ ] Check database access

### ✅ Build & Run (Next 15 minutes)

- [ ] Project builds successfully
- [ ] Dev server starts
- [ ] Application loads in preview
- [ ] No console errors
- [ ] Styles load correctly

### ✅ Feature Testing (Next 30 minutes)

Test each major feature:

1. **Authentication**
   - [ ] Login screen displays
   - [ ] Can log in with test credentials
   - [ ] Auth persists on refresh
   - [ ] Logout works

2. **Navigation**
   - [ ] Can navigate between screens
   - [ ] Mobile navigation works
   - [ ] Tenant/org switching works

3. **Data Operations**
   - [ ] Can create new processes
   - [ ] Can edit existing data
   - [ ] Data persists to Supabase
   - [ ] Can retrieve saved data

4. **Calculations**
   - [ ] ROI calculations work
   - [ ] Charts display correctly
   - [ ] CFO dashboard shows data
   - [ ] Export functionality works

5. **Admin Features**
   - [ ] Admin panel accessible
   - [ ] Can create users/orgs/tenants
   - [ ] Permissions enforced
   - [ ] User management works

### ✅ Mobile Testing (Next 15 minutes)

- [ ] Responsive on mobile viewport
- [ ] Touch interactions work
- [ ] Mobile-specific components load
- [ ] No layout breakage

### ✅ Performance (Next 10 minutes)

- [ ] Pages load quickly
- [ ] No memory leaks
- [ ] Charts render smoothly
- [ ] No excessive re-renders

---

## Common Import Issues & Solutions

### Issue 1: Missing Dependencies

**Symptom**: Build errors about missing packages

**Solution**:
```bash
# In Loveable terminal or ask AI:
"Install missing dependencies: recharts, lucide-react, date-fns, sonner"
```

### Issue 2: Import Path Errors

**Symptom**: "Cannot find module" errors

**Solution**:
```typescript
// Update imports from relative to absolute paths
// From: import { Button } from "./components/ui/button"
// To: import { Button } from "@/components/ui/button"
```

Or configure path aliases in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 3: Environment Variables Not Working

**Symptom**: Supabase connection fails, undefined env vars

**Solution in Loveable**:
1. Go to Project Settings
2. Find Environment Variables section
3. Add each variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`
4. Restart dev server

### Issue 4: Styles Not Loading

**Symptom**: App looks unstyled, no Tailwind

**Solution**:
1. Verify `globals.css` is imported in App.tsx
2. Check Tailwind config exists
3. Ensure PostCSS is configured
4. Ask Loveable AI: "Tailwind styles aren't loading, please fix"

### Issue 5: Supabase Functions Not Working

**Symptom**: API calls fail, backend errors

**Solution**:
1. Check if Loveable supports Edge Functions
2. May need to reconfigure backend
3. Test direct Supabase client calls first
4. Consider moving logic to client-side temporarily

### Issue 6: TypeScript Errors

**Symptom**: Red squiggly lines, type errors

**Solution**:
1. Update `tsconfig.json` with proper settings
2. Install missing type definitions
3. Add `// @ts-ignore` temporarily for quick fixes
4. Ask Loveable AI to fix type errors

---

## Pro Migration Tips

### 1. Migrate in Phases
Don't try to migrate everything at once. Do it in phases:
- Phase 1: Core structure + login
- Phase 2: Main screens
- Phase 3: Admin features
- Phase 4: Polish & optimize

### 2. Use Loveable's AI Effectively

**Good prompts:**
```
"The ProcessEditor component is not saving data correctly. 
Here's the current code: [paste code]. 
It should save to Supabase when user clicks Save button."

"Add loading states to all data fetching operations"

"Make the admin dashboard responsive for mobile devices"
```

**Bad prompts:**
```
"Fix it"
"It's broken"
"Make it better"
```

### 3. Test Incrementally
After importing each component, test it immediately:
```bash
# After adding ProcessEditor:
"Does the ProcessEditor component render correctly?"
"Can I create a new process?"
"Does it save to the database?"
```

### 4. Keep Figma Make Version Running
Don't delete your Figma Make project until:
- Loveable version is fully working
- All features tested
- Deployed to production
- Team has used it for a week

### 5. Document Differences
Keep notes on what's different:
```markdown
# Differences from Figma Make

1. Import paths changed to use @/ alias
2. Environment variables now in Loveable settings
3. Backend functions refactored to [new approach]
4. [Component X] simplified using Loveable's built-in features
```

---

## Success Criteria

Your migration is successful when:

- [x] All screens accessible and functional
- [x] User authentication works perfectly
- [x] Data persists correctly to Supabase
- [x] Calculations produce correct results
- [x] Charts and visualizations display properly
- [x] Admin panel fully functional
- [x] Tenant/org switching works
- [x] Mobile responsive on all devices
- [x] No console errors or warnings
- [x] Performance is acceptable
- [x] Team can use it successfully

---

## Final Checklist Before Going Live

### Code Quality
- [ ] No console.log statements (or use proper logging)
- [ ] No commented-out code
- [ ] All TypeScript errors resolved
- [ ] Proper error handling throughout

### Security
- [ ] No API keys in code
- [ ] Environment variables properly secured
- [ ] Authentication properly enforced
- [ ] Admin functions protected

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading where appropriate
- [ ] No unnecessary re-renders

### Documentation
- [ ] README updated with Loveable-specific instructions
- [ ] Environment setup documented
- [ ] Deployment instructions added
- [ ] Team trained on new platform

### Backup
- [ ] Original Figma Make version archived
- [ ] GitHub repository set up
- [ ] Database backed up
- [ ] Rollback plan documented

---

## Need Help?

If you get stuck:

1. **Loveable Documentation**: https://docs.loveable.dev
2. **Loveable Discord**: Join their community
3. **Supabase Docs**: https://supabase.com/docs
4. **This Project's Docs**: Check TROUBLESHOOTING.md

Remember: Migration takes time. Be patient, test thoroughly, and don't rush! 🚀

Good luck with your migration to Loveable!
