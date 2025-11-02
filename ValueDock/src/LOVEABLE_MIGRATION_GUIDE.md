# ValueDock® Migration to Loveable - Complete Guide

**Last Updated**: January 2025  
**Estimated Time**: 2-4 hours  
**Difficulty**: Intermediate

## Overview

This guide walks you through migrating ValueDock® from Figma Make to Loveable platform with Builder.io visual editing capabilities.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Migration Preparation](#pre-migration-preparation)
3. [Loveable Setup](#loveable-setup)
4. [Code Migration](#code-migration)
5. [Supabase Integration](#supabase-integration)
6. [Builder.io Configuration](#builderio-configuration)
7. [Testing & Validation](#testing--validation)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- ✅ GitHub account (already have: https://github.com/dockeryai/valuedock)
- ✅ Supabase account (already configured)
- ⬜ Loveable account (create at loveable.dev)
- ⬜ Builder.io account (optional, for advanced customization)

### Required Tools

- Git (for pushing code to GitHub)
- Modern web browser
- Code editor (VS Code recommended)

### Current Setup Checklist

- ✅ All code files in project
- ✅ Supabase backend configured
- ✅ Edge function deployed
- ✅ Environment variables documented
- ✅ GitHub repository created

---

## Step 1: Pre-Migration Preparation

### 1.1 Download All Files from Figma Make

**Option A: Individual Files**
1. Go to each file in Figma Make
2. Copy content
3. Paste into local files

**Option B: Bulk Export** (if available)
1. Use Figma Make export feature
2. Download as ZIP
3. Extract to local folder

### 1.2 Organize Local Project Structure

Create this folder structure on your computer:

```
valuedock/
├── .env.example                 # Create this
├── .gitignore                   # Already created
├── README.md                    # Already created
├── package.json                 # Create this
├── tsconfig.json                # Create this
├── vite.config.ts              # Create this
├── index.html                   # Create this
├── App.tsx                      # Copy from Figma Make
├── components/                  # Copy all from Figma Make
├── utils/                       # Copy all from Figma Make
├── styles/                      # Copy all from Figma Make
├── supabase/                    # Copy all from Figma Make
├── docs/                        # Copy all from Figma Make
└── guidelines/                  # Copy all from Figma Make
```

### 1.3 Create Missing Configuration Files

**Create package.json:**

```json
{
  "name": "valuedock",
  "version": "1.0.0",
  "description": "Enterprise ROI Calculator with Multi-tenant Architecture",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "recharts": "^2.10.0",
    "lucide-react": "latest",
    "react-hook-form": "^7.55.0",
    "sonner": "^2.0.3",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
```

**Create tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Create tsconfig.node.json:**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Create vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

**Create index.html:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ValueDock® - Enterprise ROI Calculator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

**Create main.tsx:**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Create .env.example:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Builder.io (Optional)
VITE_BUILDER_PUBLIC_KEY=your_builder_public_key

# Application
VITE_APP_NAME=ValueDock®
VITE_APP_VERSION=1.0.0
```

### 1.4 Update Environment Variable References

**Update utils/supabase/info.tsx:**

```typescript
// Change from import.meta.env to VITE_ prefix
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

**Search and replace in ALL files:**
- Find: `import.meta.env.SUPABASE_URL`
- Replace: `import.meta.env.VITE_SUPABASE_URL`

- Find: `import.meta.env.SUPABASE_ANON_KEY`
- Replace: `import.meta.env.VITE_SUPABASE_ANON_KEY`

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository

```bash
# Navigate to your project folder
cd /path/to/valuedock

# Initialize git
git init

# Add remote (your repo)
git remote add origin https://github.com/dockeryai/valuedock.git

# Pull existing files (README, .gitignore)
git pull origin main --allow-unrelated-histories
```

### 2.2 Stage and Commit All Files

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "feat: Complete ValueDock® implementation ready for Loveable migration

- 7 main calculation screens with CFO-grade financial modeling
- Multi-tenant architecture with organization-scoped data isolation
- Role-based access control (Master/Tenant/Org Admin, User)
- Full mobile optimization with touch-friendly interface
- Supabase backend integration with Edge Functions
- Comprehensive admin panel with user/tenant/org management
- Cost classification system with hard/soft cost tracking
- Auto-save with localStorage and cloud persistence
- Export functionality (PDF, CSV, Excel)
- Builder.io optimization complete"

# Push to GitHub
git push -u origin main
```

### 2.3 Verify GitHub Repository

1. Go to https://github.com/dockeryai/valuedock
2. Verify all files are present
3. Check that .env file is NOT committed (should be in .gitignore)

---

## Step 3: Create Loveable Account & Project

### 3.1 Sign Up for Loveable

1. Go to https://loveable.dev
2. Click **Sign Up**
3. Use GitHub authentication (recommended)
4. Complete profile setup

### 3.2 Create New Project in Loveable

1. Click **New Project**
2. Select **Import from GitHub**
3. Authorize Loveable to access your GitHub
4. Select repository: `dockeryai/valuedock`
5. Select branch: `main`
6. Click **Import Project**

### 3.3 Initial Project Configuration

**Framework Detection:**
- Loveable should auto-detect: React + TypeScript + Vite
- If not, manually select: **React with TypeScript**

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

---

## Step 4: Configure Environment Variables in Loveable

### 4.1 Add Supabase Credentials

1. In Loveable dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:

```
VITE_SUPABASE_URL = https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY = [your-anon-key]
VITE_SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
```

**⚠️ IMPORTANT**: 
- Use `VITE_` prefix (required for Vite)
- Mark `SERVICE_ROLE_KEY` as **secret/encrypted**
- Never expose service role key in client-side code

### 4.2 Verify Supabase Connection

Loveable should have a **Test Connection** button:
1. Click **Test Supabase Connection**
2. Verify green checkmark
3. If failed, double-check URLs and keys

---

## Step 5: Deploy Supabase Edge Function

### 5.1 Install Supabase CLI (if not installed)

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 5.2 Login to Supabase

```bash
supabase login
```

### 5.3 Link Your Project

```bash
# Get your project reference ID from Supabase dashboard
supabase link --project-ref [your-project-ref]
```

### 5.4 Deploy Edge Function

```bash
# From project root
cd supabase/functions

# Deploy the server function
supabase functions deploy server

# Verify deployment
supabase functions list
```

### 5.5 Set Edge Function Secrets

```bash
# These are for the edge function's use
supabase secrets set SUPABASE_URL=[your-url]
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
```

---

## Step 6: First Build & Deploy in Loveable

### 6.1 Trigger Initial Build

1. In Loveable dashboard, click **Deploy**
2. Loveable will:
   - Pull code from GitHub
   - Install dependencies
   - Run build process
   - Deploy to Loveable CDN

### 6.2 Monitor Build Process

Watch the build logs for any errors:

**Common Issues:**
- Missing dependencies → Add to package.json
- Import errors → Check file paths
- TypeScript errors → Fix type definitions
- Environment variables → Verify VITE_ prefix

### 6.3 Access Deployed App

Once build completes:
1. Click **View Live App**
2. You'll get a URL: `https://[project-name].loveable.app`
3. Test login and basic functionality

---

## Step 7: Configure Builder.io (Optional)

### 7.1 Create Builder.io Account

1. Go to https://builder.io
2. Sign up with GitHub
3. Create new space: "ValueDock"

### 7.2 Get Builder.io API Keys

1. Go to **Account** → **Space Settings**
2. Copy **Public API Key**
3. Add to Loveable environment variables:
   ```
   VITE_BUILDER_PUBLIC_KEY=[your-builder-key]
   ```

### 7.3 Install Builder.io SDK

Add to package.json dependencies:
```json
{
  "dependencies": {
    "@builder.io/react": "^3.0.0",
    "@builder.io/sdk": "^2.0.0"
  }
}
```

Push to GitHub and Loveable will rebuild.

### 7.4 Register Components with Builder.io

Create file: `/builders/registerComponents.ts`

```typescript
import { Builder } from '@builder.io/react';
import { InputsScreen } from '../components/InputsScreen';
import { ResultsScreen } from '../components/ResultsScreen';
import { PresentationScreen } from '../components/PresentationScreen';
import { AdminDashboard } from '../components/AdminDashboard';

export const registerAllComponents = () => {
  Builder.registerComponent(InputsScreen, {
    name: 'Inputs Screen',
    inputs: [
      { name: 'data', type: 'object', required: true },
      { name: 'onChange', type: 'function', required: true },
      { name: 'onSave', type: 'function' }
    ]
  });

  Builder.registerComponent(ResultsScreen, {
    name: 'Results Screen',
    inputs: [
      { name: 'data', type: 'object', required: true },
      { name: 'implementation', type: 'object', required: true }
    ]
  });

  Builder.registerComponent(PresentationScreen, {
    name: 'Presentation Screen',
    inputs: [
      { name: 'data', type: 'object', required: true }
    ]
  });

  Builder.registerComponent(AdminDashboard, {
    name: 'Admin Dashboard',
    inputs: [
      { name: 'user', type: 'object', required: true }
    ]
  });

  // Add remaining components...
};
```

Call this in your main App.tsx:

```typescript
import { useEffect } from 'react';
import { registerAllComponents } from './builders/registerComponents';

function App() {
  useEffect(() => {
    registerAllComponents();
  }, []);

  // Rest of your app...
}
```

### 7.5 Enable Visual Editing in Builder.io

1. In Builder.io dashboard, go to **Content**
2. Click **New Entry** → **Page**
3. Drag ValueDock® components from left panel
4. Edit visually
5. Publish changes

---

## Step 8: Testing & Validation

### 8.1 Functionality Checklist

Test each feature in Loveable deployment:

**Authentication:**
- [ ] Login with existing user works
- [ ] Logout works
- [ ] Session persistence works
- [ ] Password reset (if implemented)

**Main Screens:**
- [ ] Inputs Screen loads
- [ ] Can create/edit processes
- [ ] Results Screen calculates correctly
- [ ] Presentation Screen displays charts
- [ ] Scenario Screen works
- [ ] Timeline Screen displays
- [ ] Export functions work

**Admin Panel:**
- [ ] Admin panel opens
- [ ] Can create users
- [ ] Can create tenants
- [ ] Can create organizations
- [ ] User hierarchy displays correctly
- [ ] Cost classifications work

**Mobile:**
- [ ] All screens responsive
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] Process reordering works
- [ ] Advanced metrics scrollable

**Data Persistence:**
- [ ] Auto-save works (localStorage)
- [ ] Manual save to Supabase works
- [ ] Data loads on refresh
- [ ] Context switching preserves data

### 8.2 Performance Testing

Use Lighthouse (in Chrome DevTools):
1. Open deployed app in Chrome
2. F12 → Lighthouse tab
3. Run audit
4. Target scores:
   - Performance: >80
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >80

### 8.3 Cross-Browser Testing

Test in:
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

---

## Step 9: Custom Domain (Optional)

### 9.1 Purchase Domain

1. Buy domain (e.g., valuedock.com)
2. Go to domain registrar's DNS settings

### 9.2 Configure DNS

Add these records:
```
Type: CNAME
Name: www
Value: [your-loveable-url].loveable.app

Type: A
Name: @
Value: [Loveable IP - get from docs]
```

### 9.3 Add Domain in Loveable

1. Loveable dashboard → **Settings** → **Domains**
2. Click **Add Custom Domain**
3. Enter: `valuedock.com`
4. Follow verification steps
5. Enable SSL (automatic)

---

## Step 10: Continuous Deployment Setup

### 10.1 Configure Auto-Deploy

In Loveable:
1. Settings → **Git Integration**
2. Enable **Auto-deploy on push to main**
3. Optionally: Enable preview deployments for branches

### 10.2 Deployment Workflow

Now when you push to GitHub:
```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
```

Loveable automatically:
1. Detects push
2. Pulls latest code
3. Runs build
4. Deploys to production
5. Sends notification

---

## Step 11: Monitoring & Analytics (Optional)

### 11.1 Add Error Tracking

**Option 1: Sentry**
```bash
npm install @sentry/react
```

```typescript
// In main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

**Option 2: LogRocket**
```bash
npm install logrocket
```

### 11.2 Add Analytics

**Google Analytics:**
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Step 12: Post-Migration Checklist

### ✅ Essential Tasks

- [ ] All code pushed to GitHub
- [ ] Loveable project created and linked
- [ ] Environment variables configured
- [ ] Supabase Edge Function deployed
- [ ] Initial build successful
- [ ] Live app accessible
- [ ] Authentication working
- [ ] All screens functional
- [ ] Mobile optimization verified
- [ ] Data persistence working

### ✅ Recommended Tasks

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Auto-deploy enabled
- [ ] Error tracking setup
- [ ] Analytics configured
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team access granted

### ✅ Optional Tasks

- [ ] Builder.io integrated
- [ ] Visual editing enabled
- [ ] White-label customization
- [ ] Advanced monitoring
- [ ] Backup strategy implemented

---

## Troubleshooting

### Issue: Build Fails in Loveable

**Solution:**
1. Check build logs for specific error
2. Common fixes:
   - Add missing dependencies to package.json
   - Fix TypeScript errors
   - Update import paths
   - Verify environment variables have VITE_ prefix

### Issue: Environment Variables Not Working

**Solution:**
1. Verify VITE_ prefix is used
2. Rebuild app after adding variables
3. Check that variables are marked as "Build-time" not "Runtime"

### Issue: Supabase Connection Fails

**Solution:**
1. Verify Edge Function is deployed: `supabase functions list`
2. Check Edge Function logs: `supabase functions logs server`
3. Verify CORS is enabled in Edge Function
4. Test API endpoint directly in browser

### Issue: Components Not Rendering

**Solution:**
1. Check browser console for errors
2. Verify all imports use correct paths
3. Check that Tailwind CSS is loading (styles/globals.css)
4. Clear browser cache and hard reload

### Issue: Mobile View Broken

**Solution:**
1. Verify viewport meta tag in index.html
2. Check that useIsMobile hook is working
3. Test breakpoints in browser DevTools
4. Verify Tailwind responsive classes

### Issue: Authentication Not Persisting

**Solution:**
1. Check localStorage is enabled
2. Verify Supabase auth cookies
3. Check CORS settings
4. Verify session timeout settings

---

## Migration Timeline

### Phase 1: Preparation (30 min)
- Download files from Figma Make
- Create local project structure
- Create configuration files

### Phase 2: GitHub Setup (15 min)
- Initialize git repository
- Push all code to GitHub
- Verify files uploaded

### Phase 3: Loveable Setup (20 min)
- Create Loveable account
- Import GitHub repository
- Configure environment variables

### Phase 4: Deployment (30 min)
- Deploy Supabase Edge Function
- Trigger initial Loveable build
- Fix any build errors

### Phase 5: Testing (45 min)
- Test all functionality
- Verify mobile optimization
- Check data persistence
- Performance testing

### Phase 6: Optional Enhancements (60 min)
- Builder.io integration
- Custom domain setup
- Analytics configuration

**Total: 2-4 hours depending on issues encountered**

---

## Support Resources

### Documentation
- Loveable Docs: https://docs.loveable.dev
- Builder.io Docs: https://www.builder.io/c/docs
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev

### Community
- Loveable Discord: https://loveable.dev/discord
- Builder.io Discord: https://www.builder.io/c/community

### ValueDock® Specific
- Quick Start: `/QUICK_START.md`
- Troubleshooting: `/TROUBLESHOOTING.md`
- Admin Guide: `/docs/admin/ADMIN_COMPLETE_GUIDE.md`
- API Contracts: `/docs/api-contracts.md`

---

## Next Steps After Migration

1. **Train Your Team** - Share access to Loveable dashboard
2. **Document Changes** - Update internal wiki with Loveable URLs
3. **Set Up Monitoring** - Configure alerts for errors
4. **Plan Iterations** - Use Builder.io for rapid design changes
5. **Scale** - Add more features using visual editor

---

**Congratulations! You've successfully migrated ValueDock® to Loveable!** 🎉

For ongoing support, refer to the comprehensive documentation in the `/docs` folder.
