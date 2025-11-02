# Quick Loveable Migration Guide (30 Minutes)

This is the fastest path to get ValueDock running in Loveable.

---

## Prerequisites (5 minutes)

✅ **You need:**
- A GitHub account
- Access to your Figma Make project
- Your Supabase credentials ready

---

## Step 1: Export from Figma Make (5 minutes)

1. **In Figma Make:**
   - Look for the menu (☰) or Export button
   - Click "Export Project" or "Download"
   - Select "Download as ZIP"
   - Save to Downloads folder

2. **Extract the ZIP:**
   ```bash
   # On Mac/Linux
   cd ~/Downloads
   unzip valuedock*.zip -d ~/Projects/ValueDock
   
   # On Windows
   # Right-click ZIP → Extract All → Choose destination
   ```

---

## Step 2: Push to GitHub (10 minutes)

Open Terminal/Command Prompt and run:

```bash
# Navigate to extracted folder
cd ~/Projects/ValueDock

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
*.log
.DS_Store
dist/
build/
.cache/
.supabase/
EOF

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: ValueDock for Loveable"

# Create repo on GitHub (go to github.com/new)
# Name it: valuedock-roi-calculator
# Keep it Private
# Don't initialize with anything
# Click Create

# Back in terminal, connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/valuedock-roi-calculator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Stuck? Use GitHub Desktop:**
1. Download GitHub Desktop: https://desktop.github.com/
2. Open it, sign in
3. File → Add Local Repository → Choose your ValueDock folder
4. Click "Publish repository"
5. Set name to `valuedock-roi-calculator`
6. Check "Keep this code private"
7. Click "Publish repository"

---

## Step 3: Import to Loveable (5 minutes)

1. **Go to Loveable:**
   - Visit https://loveable.dev
   - Sign in (or create account with GitHub)

2. **Create New Project:**
   - Click "New Project" or "+" button
   - Select "Import from GitHub"

3. **Authorize GitHub:**
   - Click "Connect to GitHub"
   - Authorize Loveable to access your repos
   - Select "Only select repositories"
   - Choose `valuedock-roi-calculator`
   - Click "Install & Authorize"

4. **Import the Repository:**
   - Find `valuedock-roi-calculator` in the list
   - Click "Import"
   - Wait 2-5 minutes while Loveable analyzes your code

---

## Step 4: Configure Environment (5 minutes)

Once imported:

1. **Add Supabase Credentials:**
   - In Loveable, look for Settings/Environment Variables
   - Click "Add Environment Variable"
   - Add these three variables:

   ```
   Variable Name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   
   Variable Name: VITE_SUPABASE_ANON_KEY
   Value: your-anon-key-here
   
   Variable Name: VITE_SUPABASE_SERVICE_ROLE_KEY
   Value: your-service-role-key-here
   ```

2. **Restart the Preview:**
   - Look for "Restart" or "Rebuild" button
   - Or close and reopen the project

---

## Step 5: Test & Verify (5 minutes)

### Quick Test Checklist:

1. **Preview loads?**
   - ✅ You should see the login screen
   - ❌ If not, check console for errors

2. **Can you log in?**
   - Use credentials from LOGIN_CREDENTIALS.md
   - ✅ Should navigate to main app
   - ❌ If not, verify Supabase credentials

3. **Can you navigate?**
   - Click through different screens
   - ✅ All screens should load
   - ❌ If errors, note which screens break

4. **Does data persist?**
   - Create a test process
   - Refresh the page
   - ✅ Data should still be there
   - ❌ If not, check Supabase connection

---

## Troubleshooting Common Issues

### Issue: "Cannot find module '@/components/...'"

**Fix with Loveable AI:**
```
"I'm getting import errors. Please update all imports to use correct paths for this project structure."
```

### Issue: "Supabase is not defined"

**Fix:**
1. Double-check environment variables are set
2. Look for `/utils/supabase/info.tsx`
3. Make sure it's using environment variables correctly:
   ```typescript
   export const projectId = import.meta.env.VITE_SUPABASE_URL
   export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   ```

### Issue: Styles look broken

**Fix with Loveable AI:**
```
"Tailwind styles aren't loading correctly. Please ensure globals.css is imported and Tailwind is configured."
```

### Issue: TypeScript errors everywhere

**Fix with Loveable AI:**
```
"There are TypeScript errors throughout the project. Please fix the type definitions and tsconfig settings."
```

---

## After Migration: Next Steps

### Immediate (Today):
1. Test all critical features
2. Note any issues in a document
3. Share with team for testing

### This Week:
1. Fix any bugs discovered
2. Optimize performance
3. Update documentation for Loveable-specific setup

### This Month:
1. Deploy to production (Vercel/Netlify)
2. Train team on Loveable platform
3. Archive Figma Make version

---

## Using Loveable AI Effectively

Now that you're in Loveable, you can use AI to improve your app:

### Example Prompts:

**Bug Fixes:**
```
"The Save button in ProcessEditor isn't saving data to Supabase. 
Please check the onClick handler and fix the database call."
```

**New Features:**
```
"Add a dark mode toggle to the app. Use system preference as default 
and store user's choice in localStorage."
```

**Improvements:**
```
"The CFO Dashboard loads slowly. Please add a loading skeleton 
and optimize the data fetching."
```

**Refactoring:**
```
"The App.tsx file is too large. Please split it into smaller 
components and organize them in a logical structure."
```

---

## Success! What Now?

Your ValueDock app is now in Loveable! 🎉

**You can now:**
- ✅ Edit code with AI assistance
- ✅ Collaborate with team in real-time
- ✅ Deploy with one click
- ✅ Get automated testing
- ✅ Track changes with Git
- ✅ Preview changes instantly

**Keep in mind:**
- Your original Figma Make version is still intact
- GitHub has a complete backup
- You can always roll back if needed
- Loveable commits changes to GitHub automatically

---

## Support Resources

- **Loveable Docs**: https://docs.loveable.dev
- **Loveable Discord**: Join for community help
- **Your GitHub Repo**: Reference your code anytime
- **Figma Make**: Keep as backup until fully migrated

---

## Migration Checklist

Use this to track your progress:

- [ ] Exported from Figma Make ✓
- [ ] Pushed to GitHub ✓
- [ ] Imported to Loveable ✓
- [ ] Environment variables configured ✓
- [ ] Login works ✓
- [ ] Navigation works ✓
- [ ] Data persists ✓
- [ ] Calculations correct ✓
- [ ] Charts display ✓
- [ ] Admin panel works ✓
- [ ] Mobile responsive ✓
- [ ] Team tested ✓
- [ ] Documentation updated ✓
- [ ] Deployed to production ✓

---

**Total Time: ~30 minutes** (not including testing)

Good luck! 🚀

---

## Need More Help?

If this quick guide doesn't work:

1. Read `LOVEABLE_IMPORT_PREPARATION.md` for detailed steps
2. Check `LOVEABLE_MIGRATION_SCRIPT.md` for phase-by-phase migration
3. Review `TROUBLESHOOTING.md` for common issues
4. Ask Loveable AI for help directly in the platform
