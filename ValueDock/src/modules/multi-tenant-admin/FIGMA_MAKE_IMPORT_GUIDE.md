# Import Multi-Tenant Admin Module into Another Figma Make Project

This guide shows you how to copy the multi-tenant admin module from ValueDock into any other Figma Make project.

## Overview

You'll copy:
1. **Module files** - The module itself
2. **Component dependencies** - Admin components from ValueDock
3. **Backend routes** - Server-side code
4. **Utilities** - Helper functions

## Step-by-Step Instructions

### Step 1: Copy the Module Core (Required)

Copy these files from ValueDock to your new project:

```bash
# In your NEW Figma Make project, create the modules directory:

/modules/
  └── multi-tenant-admin/
      ├── README.md
      ├── QUICK_START.md
      ├── INTEGRATION_GUIDE.md
      ├── REFERENCE_TO_VALUEDOCK.md
      ├── MODULE_MANIFEST.md
      ├── VISUAL_GUIDE.md
      ├── EXAMPLE_USAGE.tsx
      ├── FIGMA_MAKE_IMPORT_GUIDE.md  (this file)
      ├── index.ts
      ├── package.json
      ├── types.ts
      ├── utils/
      │   ├── auth.ts
      │   └── validation.ts
      └── backend/
          └── BACKEND_SETUP.md
```

**How to copy in Figma Make:**
1. In ValueDock project: Select all files in `/modules/multi-tenant-admin/`
2. Copy the content of each file
3. In new project: Create the same file structure
4. Paste the content into each file

### Step 2: Copy Admin Components (Required)

Copy these components from ValueDock's `/components/` to your new project's `/components/`:

```bash
# Essential admin components:
/components/
  ├── AdminDashboard.tsx              # Main admin panel
  ├── UserManagementTree.tsx          # User tree view
  ├── TenantOrgContextSwitcher.tsx    # Context switching
  ├── EnhancedUserDialogV2.tsx        # User creation
  ├── EditUserDialog.tsx              # User editing
  ├── DeleteConfirmationDialog.tsx    # Delete confirmation
  ├── RestoreBackupDialog.tsx         # Backup restore
  ├── AdminUserSelector.tsx           # User selection
  ├── TenantOrgMobileView.tsx         # Mobile view
  └── DocumentationViewer.tsx         # Docs viewer (optional)
```

**How to copy:**
1. In ValueDock: View each file
2. Copy the entire file content
3. In new project: Create file with same name in `/components/`
4. Paste the content

### Step 3: Copy Utility Files (Required)

Copy these from `/utils/` to your new project's `/utils/`:

```bash
/utils/
  ├── auth.ts                  # Authentication utilities
  └── domainValidation.ts      # Domain validation
```

**Note:** If your new project already has `auth.ts`, you may need to merge the code or rename one of them.

### Step 4: Copy Backend Routes (Required)

In your new project's `/supabase/functions/server/index.tsx`, add the admin routes.

**From ValueDock's** `/supabase/functions/server/index.tsx`, copy these sections:

#### A. Auth Middleware (around line 34-93)
```typescript
// Copy the verifyAuth function
const verifyAuth = async (authHeader: string | null) => {
  // ... entire function
};
```

#### B. Auth Endpoints (around lines 750-850)
```typescript
// Copy these routes:
app.post("/make-server-888f4514/auth/signup", async (c) => { ... });
app.get("/make-server-888f4514/auth/profile", async (c) => { ... });
app.put("/make-server-888f4514/auth/profile", async (c) => { ... });
```

#### C. Admin Endpoints (around lines 856-1500)
```typescript
// Copy all these routes:
app.get("/make-server-888f4514/admin/users", async (c) => { ... });
app.put("/make-server-888f4514/admin/users/:userId", async (c) => { ... });
app.delete("/make-server-888f4514/admin/users/:userId", async (c) => { ... });
app.get("/make-server-888f4514/admin/tenants", async (c) => { ... });
app.post("/make-server-888f4514/admin/tenants", async (c) => { ... });
app.put("/make-server-888f4514/admin/tenants/:tenantId", async (c) => { ... });
app.delete("/make-server-888f4514/admin/tenants/:tenantId", async (c) => { ... });
app.get("/make-server-888f4514/admin/organizations", async (c) => { ... });
app.post("/make-server-888f4514/admin/organizations", async (c) => { ... });
app.put("/make-server-888f4514/admin/organizations/:orgId", async (c) => { ... });
app.delete("/make-server-888f4514/admin/organizations/:orgId", async (c) => { ... });
app.get("/make-server-888f4514/admin/backups", async (c) => { ... });
app.post("/make-server-888f4514/admin/restore/:backupId", async (c) => { ... });
```

**Tip:** Search for `"/make-server-888f4514/admin/"` in ValueDock's index.tsx to find all admin routes.

### Step 5: Copy shadcn/ui Components (If Needed)

If your new project doesn't have these shadcn/ui components, copy them from ValueDock's `/components/ui/`:

```bash
# Check if you need these:
- dialog.tsx
- card.tsx
- button.tsx
- input.tsx
- select.tsx
- table.tsx
- badge.tsx
- alert.tsx
- tabs.tsx
- checkbox.tsx
- tooltip.tsx
- hover-card.tsx
- command.tsx
```

**Most Figma Make projects already have these**, so you likely won't need to copy them.

### Step 6: Initialize in Your New App

In your new project's `/App.tsx`, add initialization:

```tsx
import { useEffect, useState } from 'react';
import { getSession, type UserProfile } from './utils/auth';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getSession().then(({ profile }) => {
      setCurrentUser(profile);
      setLoading(false);
    });
  }, []);

  // Your app code...
}
```

### Step 7: Add Admin Route

Add the admin panel to your app:

```tsx
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  // ... existing code

  // Add admin route or tab
  if (showAdmin) {
    return <AdminDashboard currentUser={currentUser} />;
  }

  // Your normal app
}
```

### Step 8: Create First Admin User

In your new project's Supabase dashboard:

1. Go to **Authentication** → **Users**
2. Create a user (note the UUID)
3. Go to **SQL Editor**
4. Run this query:

```sql
-- Replace YOUR_USER_ID with the UUID from step 2
INSERT INTO kv_store_888f4514 (key, value)
VALUES (
  'user:YOUR_USER_ID',
  '{
    "id": "YOUR_USER_ID",
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

### Step 9: Test It

1. **Log in** to your new app with the admin user
2. **Navigate** to admin panel
3. **Create** a tenant
4. **Create** an organization
5. **Create** a user
6. **Test** permissions

## Quick Checklist

- [ ] Copy `/modules/multi-tenant-admin/` folder
- [ ] Copy admin components from `/components/`
- [ ] Copy `/utils/auth.ts` and `/utils/domainValidation.ts`
- [ ] Copy backend routes to `/supabase/functions/server/index.tsx`
- [ ] Copy shadcn/ui components (if needed)
- [ ] Initialize in `App.tsx`
- [ ] Add admin route/tab
- [ ] Create first admin user in Supabase
- [ ] Test login and admin functions

## File Copy Summary

### Minimum Required Files (Core Module)

```
NEW_PROJECT/
├── modules/
│   └── multi-tenant-admin/
│       ├── types.ts
│       ├── index.ts
│       └── utils/
│           ├── auth.ts
│           └── validation.ts
├── components/
│   ├── AdminDashboard.tsx
│   ├── UserManagementTree.tsx
│   ├── TenantOrgContextSwitcher.tsx
│   ├── EnhancedUserDialogV2.tsx
│   ├── EditUserDialog.tsx
│   └── DeleteConfirmationDialog.tsx
├── utils/
│   ├── auth.ts
│   └── domainValidation.ts
└── supabase/functions/server/
    └── index.tsx  (add admin routes)
```

### Optional Files (Enhanced Features)

```
├── components/
│   ├── RestoreBackupDialog.tsx
│   ├── AdminUserSelector.tsx
│   ├── TenantOrgMobileView.tsx
│   └── DocumentationViewer.tsx
└── modules/multi-tenant-admin/
    ├── README.md
    ├── QUICK_START.md
    └── ... (all documentation)
```

## Troubleshooting

### Issue: Import Errors

**Problem:** `Cannot find module './modules/multi-tenant-admin'`

**Solution:** Make sure you created the `/modules/multi-tenant-admin/` folder and copied all files.

### Issue: Missing shadcn Components

**Problem:** `Cannot find module './components/ui/dialog'`

**Solution:** Copy the missing UI components from ValueDock's `/components/ui/` folder.

### Issue: Backend Routes Not Working

**Problem:** API calls return 404

**Solution:** 
1. Check you copied all backend routes
2. Verify the route prefix is correct (`/make-server-888f4514`)
3. Check Supabase Edge Function deployed successfully

### Issue: Auth Errors

**Problem:** "Unauthorized" or "No user profile"

**Solution:**
1. Check you created the admin user in KV store
2. Verify the user ID matches the Supabase Auth user ID
3. Check the auth token is being sent in requests

### Issue: TypeScript Errors

**Problem:** Type errors in components

**Solution:**
1. Make sure you copied `types.ts` from the module
2. Check all imports are correct
3. Verify `/utils/auth.ts` exports `UserProfile` type

## What If I Don't Want All Features?

You can selectively import parts of the module:

### Minimal Setup (Users Only)

Copy only:
- `UserManagementTree.tsx`
- `EnhancedUserDialogV2.tsx`
- `EditUserDialog.tsx`
- User-related backend routes

### Without Tenants

Copy all except:
- Tenant management routes
- Tenant-related UI components
- Set all users with `tenantId: 'default'`

### Custom UI

Copy only:
- `/modules/multi-tenant-admin/types.ts`
- `/modules/multi-tenant-admin/utils/auth.ts`
- Backend routes
- Build your own UI components

## Next Steps After Import

1. **Customize branding** - Update colors, logos in UI components
2. **Add features** - Extend the module for your needs
3. **Configure permissions** - Adjust role-based access rules
4. **Add validation** - Custom domain/email validation
5. **Integrate** - Connect to your app's features

## Need Help?

1. Read `/modules/multi-tenant-admin/QUICK_START.md`
2. Check `/modules/multi-tenant-admin/INTEGRATION_GUIDE.md`
3. Review ValueDock source code for reference
4. Test in a fresh Figma Make project first

## Pro Tips

### Tip 1: Test in Fresh Project First

Before importing to your main app, test in a fresh Figma Make project to ensure everything works.

### Tip 2: Use Git Branches

If your project uses Git, create a branch before importing:
```bash
git checkout -b add-admin-module
```

### Tip 3: Keep Documentation

Copy all the documentation files - they're helpful references.

### Tip 4: Version Control

Keep track of which version of the module you imported in case you need to update later.

### Tip 5: Customize Gradually

Get the basic version working first, then customize.

## Success! 🎉

Once you've completed all steps:

1. ✅ Module is copied
2. ✅ Backend routes work
3. ✅ Admin user can log in
4. ✅ Can create tenants/orgs/users
5. ✅ Permissions work correctly

You now have a fully functional multi-tenant admin system in your new Figma Make project!

---

**Total Import Time:** ~30-60 minutes depending on your familiarity with the code.

**Difficulty:** Intermediate (requires understanding of file structure and imports)

**Support:** Refer to ValueDock source code if anything is unclear.
