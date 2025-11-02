# How to Import Multi-Tenant Admin Module into Another Figma Make Project

## Quick Answer

**Time Required:** 1-2 hours  
**Difficulty:** Intermediate  
**Files to Copy:** ~20 files  

Follow this 3-step process:

1. **Copy module files** → `/modules/multi-tenant-admin/`
2. **Copy components & backend** → Admin components + API routes
3. **Create admin user** → In Supabase

## Step-by-Step Guide

### 📋 Step 1: Copy the Module (10 minutes)

In your **NEW** Figma Make project, create this structure:

```
/modules/multi-tenant-admin/
├── types.ts                  ← Copy from ValueDock
├── index.ts                  ← Copy from ValueDock
└── utils/
    ├── auth.ts              ← Copy from ValueDock
    └── validation.ts        ← Copy from ValueDock
```

**How to do it in Figma Make:**
1. In ValueDock: View `/modules/multi-tenant-admin/types.ts`
2. Copy all the content
3. In new project: Create `/modules/multi-tenant-admin/types.ts`
4. Paste the content
5. Repeat for other files

---

### 🎨 Step 2: Copy Admin Components (15 minutes)

Copy these 6 essential files from ValueDock's `/components/` to your new project's `/components/`:

```
/components/
├── AdminDashboard.tsx              ← Main admin panel
├── UserManagementTree.tsx          ← User tree view
├── TenantOrgContextSwitcher.tsx    ← Context switching
├── EnhancedUserDialogV2.tsx        ← User creation
├── EditUserDialog.tsx              ← User editing
└── DeleteConfirmationDialog.tsx    ← Delete confirmation
```

**Optional but recommended:**
```
├── RestoreBackupDialog.tsx
├── AdminUserSelector.tsx
└── TenantOrgMobileView.tsx
```

---

### 🔧 Step 3: Copy Utilities (5 minutes)

Copy these 2 files from ValueDock's `/utils/` to your new project's `/utils/`:

```
/utils/
├── auth.ts                ← Copy from ValueDock
└── domainValidation.ts    ← Copy from ValueDock
```

⚠️ **Note:** If your new project already has `auth.ts`, you'll need to merge the code or rename one.

---

### 🖥️ Step 4: Copy Backend Routes (20 minutes)

This is the most important step. In your new project's `/supabase/functions/server/index.tsx`:

#### Find and copy these from ValueDock's index.tsx:

1. **Auth middleware** (around line 34):
   ```typescript
   const verifyAuth = async (authHeader: string | null) => {
     // ... copy entire function
   };
   ```

2. **Auth routes** (around line 750):
   - `POST /auth/signup`
   - `GET /auth/profile`
   - `PUT /auth/profile`

3. **Admin routes** (around line 856):
   - All `/admin/users` routes
   - All `/admin/tenants` routes
   - All `/admin/organizations` routes
   - All `/admin/backups` routes

**Tip:** Search for `"/make-server-888f4514/admin/` in ValueDock to find all admin routes.

---

### 👤 Step 5: Create First Admin User (5 minutes)

In your new project's **Supabase Dashboard**:

1. **Create auth user:**
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `admin@yourapp.com`
   - Create password
   - **Copy the UUID** (you'll need it)

2. **Add profile to database:**
   - Go to SQL Editor
   - Run this query (replace `YOUR_UUID`):

```sql
INSERT INTO kv_store_888f4514 (key, value)
VALUES (
  'user:YOUR_UUID_FROM_STEP_1',
  '{
    "id": "YOUR_UUID_FROM_STEP_1",
    "email": "admin@yourapp.com",
    "name": "Admin User",
    "role": "master_admin",
    "tenantId": null,
    "organizationId": null,
    "groupIds": [],
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }'::jsonb
);
```

---

### ✅ Step 6: Test It (10 minutes)

1. **Log in** with your admin user
2. **Navigate** to admin panel (add to your App.tsx)
3. **Create** a tenant
4. **Create** an organization  
5. **Create** a user
6. **Verify** permissions work

---

## Files to Copy - Quick Reference

### Minimum Required (Core Module)

| File | Source | Destination |
|------|--------|-------------|
| `types.ts` | `/modules/multi-tenant-admin/` | Same |
| `index.ts` | `/modules/multi-tenant-admin/` | Same |
| `utils/auth.ts` | `/modules/multi-tenant-admin/utils/` | Same |
| `utils/validation.ts` | `/modules/multi-tenant-admin/utils/` | Same |
| `AdminDashboard.tsx` | `/components/` | Same |
| `UserManagementTree.tsx` | `/components/` | Same |
| `TenantOrgContextSwitcher.tsx` | `/components/` | Same |
| `EnhancedUserDialogV2.tsx` | `/components/` | Same |
| `EditUserDialog.tsx` | `/components/` | Same |
| `DeleteConfirmationDialog.tsx` | `/components/` | Same |
| `auth.ts` | `/utils/` | Same |
| `domainValidation.ts` | `/utils/` | Same |
| Backend routes | `/supabase/functions/server/index.tsx` | Merge into same |

### Optional (Documentation & Extras)

Copy all the `.md` files from `/modules/multi-tenant-admin/` for reference:
- `README.md`
- `QUICK_START.md`
- `INTEGRATION_GUIDE.md`
- `FIGMA_MAKE_IMPORT_GUIDE.md`
- `IMPORT_CHECKLIST.md`

---

## Integration in Your App

After copying files, add to your `/App.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { getSession, type UserProfile } from './utils/auth';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getSession().then(({ profile }) => {
      setCurrentUser(profile);
    });
  }, []);

  // Add admin route
  const showAdmin = currentUser && ['master_admin', 'tenant_admin', 'org_admin'].includes(currentUser.role);

  if (showAdmin) {
    return <AdminDashboard currentUser={currentUser} />;
  }

  // Your normal app
  return <YourApp />;
}
```

---

## Troubleshooting

### "Cannot find module" errors

**Fix:** Make sure you created the `/modules/multi-tenant-admin/` folder and copied all files with correct paths.

### Backend routes not working

**Fix:** 
1. Check you copied all routes from ValueDock
2. Verify route prefix is `/make-server-888f4514`
3. Deploy your Edge Function

### "Unauthorized" errors

**Fix:**
1. Verify admin user exists in KV store
2. Check UUID matches Supabase Auth user
3. Test login credentials

### TypeScript errors

**Fix:**
1. Make sure you copied `types.ts`
2. Check all imports use correct paths
3. Verify shadcn/ui components exist

---

## Complete File Checklist

Use `/modules/multi-tenant-admin/IMPORT_CHECKLIST.md` for a detailed step-by-step checklist with checkboxes.

---

## Detailed Documentation

For more details, see:

1. **`/modules/multi-tenant-admin/FIGMA_MAKE_IMPORT_GUIDE.md`**  
   Complete guide with troubleshooting

2. **`/modules/multi-tenant-admin/IMPORT_CHECKLIST.md`**  
   Printable checklist with checkboxes

3. **`/modules/multi-tenant-admin/QUICK_START.md`**  
   Quick setup after import

4. **`/modules/multi-tenant-admin/INTEGRATION_GUIDE.md`**  
   Advanced integration patterns

---

## Success Criteria

You're done when:

- ✅ Can log in as admin user
- ✅ Can see admin dashboard
- ✅ Can create tenants
- ✅ Can create organizations
- ✅ Can create users
- ✅ Permissions correctly restrict access
- ✅ No console errors
- ✅ Mobile view works

---

## Time Estimate

- **Minimum setup:** 1 hour
- **Full setup with testing:** 2 hours
- **With customization:** 3+ hours

---

## Need Help?

1. Check `/modules/multi-tenant-admin/FIGMA_MAKE_IMPORT_GUIDE.md` for detailed instructions
2. Use `/modules/multi-tenant-admin/IMPORT_CHECKLIST.md` to track progress
3. Review ValueDock source code if unclear
4. Test in fresh project first before importing to production

---

## Next Steps After Import

Once successfully imported:

1. ✅ Customize branding (colors, logos)
2. ✅ Add custom validation rules
3. ✅ Integrate with your app features
4. ✅ Configure email domains
5. ✅ Set up additional admin users
6. ✅ Test all permission levels
7. ✅ Deploy to production

---

**🚀 Ready to Start?**

Go to `/modules/multi-tenant-admin/FIGMA_MAKE_IMPORT_GUIDE.md` for the complete step-by-step guide.

Or use `/modules/multi-tenant-admin/IMPORT_CHECKLIST.md` for a printable checklist.

**Total Time: ~1-2 hours**

Happy building! 🎉
