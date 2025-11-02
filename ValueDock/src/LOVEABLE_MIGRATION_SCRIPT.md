# Loveable Migration Script for ValueDock

## Phase 1: Core Infrastructure (Do First)

### 1. Create Package Configuration

In Loveable, create/update `package.json`:

```json
{
  "name": "valuedock-roi-calculator",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.0",
    "lucide-react": "latest",
    "date-fns": "^2.30.0",
    "@supabase/supabase-js": "^2.39.0",
    "sonner": "^1.3.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2. Create Environment Variables Template

Create `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Copy Utility Files (Order Matters)

Copy these files IN ORDER:

1. `/utils/supabase/info.tsx` - Supabase configuration
2. `/utils/auth.ts` - Authentication utilities
3. `/utils/domainValidation.ts` - Domain validation
4. `/components/utils/calculations.ts` - Core calculations
5. `/components/utils/exportUtils.ts` - Export utilities

### 4. Copy UI Components (Foundation)

Copy entire `/components/ui/` directory:
- These are shadcn components
- Must be copied first before custom components
- Loveable supports shadcn out of the box

### 5. Copy Styles

Copy `/styles/globals.css` - Contains Tailwind configuration and custom styles

---

## Phase 2: Core Components (Second Priority)

Copy in this order (dependencies matter):

1. **Shared Components**
   - `/components/figma/ImageWithFallback.tsx`

2. **Utility Components**
   - `/components/DebugConsole.tsx`
   - `/components/DeleteConfirmationDialog.tsx`
   - `/components/GlobalSettingsWarningDialog.tsx`
   - `/components/RestoreBackupDialog.tsx`

3. **Data Components**
   - `/components/CostClassificationManager.tsx`
   - `/components/CostClassificationTreeView.tsx`
   - `/components/DataDictionary.tsx`

4. **Chart Components**
   - `/components/FTEImpactChart.tsx`
   - `/components/WaterfallChart.tsx`
   - `/components/LandscapeChartWrapper.tsx`
   - `/components/SensitivityAnalysis.tsx`

---

## Phase 3: Screen Components (Third Priority)

Copy main screen components:

1. `/components/LoginScreen.tsx`
2. `/components/ProcessEditor.tsx`
3. `/components/ProcessEditorMobile.tsx`
4. `/components/InputsScreen.tsx`
5. `/components/InputsScreenTable.tsx`
6. `/components/ResultsScreen.tsx`
7. `/components/CFOSummaryDashboard.tsx`
8. `/components/PresentationScreen.tsx`
9. `/components/TimelineScreen.tsx`
10. `/components/ExportScreen.tsx`
11. `/components/ScenarioScreen.tsx`
12. `/components/ImplementationScreen.tsx`

---

## Phase 4: Admin Components (Fourth Priority)

Copy admin-related components:

1. `/components/AdminDashboard.tsx`
2. `/components/AdminSystemInfo.tsx`
3. `/components/AdminUserSelector.tsx`
4. `/components/AdminRoleFixer.tsx`
5. `/components/EnhancedUserDialogV2.tsx`
6. `/components/EditUserDialog.tsx`
7. `/components/UserManagementTree.tsx`
8. `/components/TenantOrgContextSwitcher.tsx`
9. `/components/TenantOrgMobileView.tsx`

---

## Phase 5: Backend (Supabase Functions)

Copy Supabase Edge Functions:

1. `/supabase/functions/server/index.tsx` - Main server
2. **DO NOT COPY** `/supabase/functions/server/kv_store.tsx` (protected file)

Note: Loveable may have different backend setup. You might need to adapt.

---

## Phase 6: Main App Component

Finally, copy `/App.tsx` - the main application component

---

## Phase 7: Documentation (Optional)

Copy essential docs:
- `README.md`
- `QUICK_START.md`
- `LOGIN_CREDENTIALS.md`
- `TROUBLESHOOTING.md`

---

## Testing Checklist After Migration

### ✅ Phase 1 Testing
- [ ] Project builds without errors
- [ ] Tailwind styles load correctly
- [ ] Environment variables accessible

### ✅ Phase 2 Testing
- [ ] Login screen appears
- [ ] Can authenticate with test credentials
- [ ] Navigation between screens works

### ✅ Phase 3 Testing
- [ ] Can create/edit processes
- [ ] Calculations work correctly
- [ ] Charts render properly
- [ ] Data persists to Supabase

### ✅ Phase 4 Testing
- [ ] Admin panel accessible
- [ ] User management functions work
- [ ] Tenant/org switching works
- [ ] Permissions enforced correctly

### ✅ Phase 5 Testing
- [ ] All screens responsive on mobile
- [ ] Export functionality works
- [ ] Presentation mode functions
- [ ] CFO dashboard displays correctly

---

## Common Migration Issues

### Issue 1: Import Path Differences

**Problem**: Import paths may differ between Figma Make and Loveable

**Solution**: Update imports to use correct paths
```typescript
// May need to change from:
import { Button } from "./components/ui/button"

// To:
import { Button } from "@/components/ui/button"
```

### Issue 2: Supabase Configuration

**Problem**: Supabase URLs/keys need to be reconfigured

**Solution**: 
1. Create new `.env` file in Loveable
2. Add your Supabase credentials
3. Test connection

### Issue 3: Build Errors

**Problem**: TypeScript errors or missing dependencies

**Solution**:
1. Check all dependencies are in package.json
2. Run type checking: `npm run build`
3. Fix type errors one by one

### Issue 4: Backend Edge Functions

**Problem**: Loveable might not support Supabase Edge Functions the same way

**Solution**:
1. Test if existing functions work
2. If not, may need to refactor to Loveable's backend approach
3. Or keep using Supabase directly (should work)

---

## Optimization for Loveable

Once migrated, optimize for Loveable's features:

### 1. Use Loveable's AI Chat
```
"Add a loading spinner to the login screen"
"Improve the mobile responsive layout for ProcessEditor"
"Add error handling to the API calls"
```

### 2. Leverage Loveable's Components
- Loveable has built-in components
- May be able to replace some custom components
- Ask Loveable AI: "Can you simplify this component using built-in features?"

### 3. Enable Loveable Features
- Real-time collaboration
- Automated testing
- Deploy previews
- GitHub integration

---

## Migration Timeline Estimate

- **Phase 1**: 30 minutes
- **Phase 2**: 1 hour
- **Phase 3**: 2 hours
- **Phase 4**: 1 hour
- **Phase 5**: 1 hour
- **Phase 6**: 30 minutes
- **Testing & Fixes**: 2-4 hours

**Total: 8-10 hours** (with breaks)

---

## Need Help?

If you encounter issues during migration:

1. **Check Loveable Docs**: https://docs.loveable.dev
2. **Ask Loveable AI**: Describe your error in the chat
3. **Check Supabase Connection**: Verify credentials
4. **Incremental Testing**: Test after each phase

---

## Pro Tips

1. **Don't rush**: Migrate phase by phase
2. **Test frequently**: After each phase, verify it works
3. **Keep Figma Make open**: Reference original during migration
4. **Use Git**: Commit after each successful phase
5. **Document changes**: Note any modifications needed

---

## After Successful Migration

1. **Update documentation** with Loveable-specific instructions
2. **Share with team** if collaborative
3. **Set up deployment** (Vercel/Netlify)
4. **Archive Figma Make version** as backup

---

## Rollback Plan

If migration fails:
1. Your original Figma Make project is unchanged
2. Your GitHub repo has the exported version
3. You can always return to Figma Make
4. No data loss if you followed the steps

Good luck with your migration! 🚀
