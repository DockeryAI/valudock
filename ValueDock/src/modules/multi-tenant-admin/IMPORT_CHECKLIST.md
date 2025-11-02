# Multi-Tenant Admin Module - Import Checklist

Use this checklist when importing the module into a new Figma Make project.

## Pre-Import

- [ ] Open ValueDock project (source)
- [ ] Open your new project (destination)
- [ ] Have Supabase dashboard open for new project
- [ ] Backup your new project (optional but recommended)

---

## Step 1: Copy Module Core (10 minutes)

Create `/modules/multi-tenant-admin/` folder and copy:

- [ ] `README.md`
- [ ] `QUICK_START.md`
- [ ] `INTEGRATION_GUIDE.md`
- [ ] `FIGMA_MAKE_IMPORT_GUIDE.md`
- [ ] `index.ts`
- [ ] `types.ts`
- [ ] `package.json`
- [ ] `utils/auth.ts`
- [ ] `utils/validation.ts`
- [ ] `backend/BACKEND_SETUP.md`

**Test:** Can you `import { UserProfile } from './modules/multi-tenant-admin/types'` without errors?

---

## Step 2: Copy Components (15 minutes)

Copy to `/components/`:

### Essential Components
- [ ] `AdminDashboard.tsx`
- [ ] `UserManagementTree.tsx`
- [ ] `TenantOrgContextSwitcher.tsx`
- [ ] `EnhancedUserDialogV2.tsx`
- [ ] `EditUserDialog.tsx`
- [ ] `DeleteConfirmationDialog.tsx`

### Optional Components
- [ ] `RestoreBackupDialog.tsx`
- [ ] `AdminUserSelector.tsx`
- [ ] `TenantOrgMobileView.tsx`
- [ ] `DocumentationViewer.tsx`

**Test:** Do all component files show without import errors?

---

## Step 3: Copy Utilities (5 minutes)

Copy to `/utils/`:

- [ ] `auth.ts` (copy whole file or merge if exists)
- [ ] `domainValidation.ts`

**Note:** If `auth.ts` already exists, merge the functions carefully.

**Test:** Can you import functions from these files?

---

## Step 4: Copy Backend Routes (20 minutes)

In `/supabase/functions/server/index.tsx`, copy from ValueDock:

### Auth Middleware
- [ ] `verifyAuth` function (lines ~34-93)

### Auth Routes
- [ ] `POST /auth/signup`
- [ ] `GET /auth/profile`
- [ ] `PUT /auth/profile`

### Admin Routes
- [ ] `GET /admin/users`
- [ ] `PUT /admin/users/:userId`
- [ ] `DELETE /admin/users/:userId`
- [ ] `GET /admin/tenants`
- [ ] `POST /admin/tenants`
- [ ] `PUT /admin/tenants/:tenantId`
- [ ] `DELETE /admin/tenants/:tenantId`
- [ ] `GET /admin/organizations`
- [ ] `POST /admin/organizations`
- [ ] `PUT /admin/organizations/:orgId`
- [ ] `DELETE /admin/organizations/:orgId`
- [ ] `GET /admin/backups`
- [ ] `POST /admin/restore/:backupId`

**Test:** Deploy Edge Function and check for errors.

---

## Step 5: Check shadcn/ui Components (5 minutes)

Verify your project has these in `/components/ui/`:

- [ ] `dialog.tsx`
- [ ] `card.tsx`
- [ ] `button.tsx`
- [ ] `input.tsx`
- [ ] `select.tsx`
- [ ] `table.tsx`
- [ ] `badge.tsx`
- [ ] `alert.tsx`
- [ ] `tabs.tsx`
- [ ] `checkbox.tsx`

**If missing:** Copy from ValueDock's `/components/ui/`

**Test:** Import one of these components successfully.

---

## Step 6: Update App.tsx (10 minutes)

In your `/App.tsx`:

- [ ] Import `getSession` and `UserProfile`
- [ ] Add state for `currentUser`
- [ ] Add `useEffect` to check session
- [ ] Add admin route/tab
- [ ] Pass `currentUser` to admin components

**Code to add:**
```tsx
import { getSession, type UserProfile } from './utils/auth';

const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

useEffect(() => {
  getSession().then(({ profile }) => {
    setCurrentUser(profile);
  });
}, []);
```

**Test:** App compiles without errors.

---

## Step 7: Create First Admin User (5 minutes)

### In Supabase Dashboard:

1. **Create Auth User**
   - [ ] Go to Authentication → Users
   - [ ] Click "Add user"
   - [ ] Email: `admin@yourapp.com`
   - [ ] Password: Create secure password
   - [ ] Copy the user UUID

2. **Create KV Profile**
   - [ ] Go to SQL Editor
   - [ ] Run this SQL (replace UUID):
   
   ```sql
   INSERT INTO kv_store_888f4514 (key, value)
   VALUES (
     'user:YOUR_UUID_HERE',
     '{
       "id": "YOUR_UUID_HERE",
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
   - [ ] Execute query successfully

**Test:** Query runs without errors.

---

## Step 8: Test Login (5 minutes)

- [ ] Go to your app login page
- [ ] Enter admin email and password
- [ ] Successfully log in
- [ ] See current user profile loaded
- [ ] Can navigate to admin panel

**Test:** Can log in and see admin interface.

---

## Step 9: Test Admin Features (10 minutes)

### Test Tenant Management
- [ ] Click "Add Tenant"
- [ ] Fill in name and domain
- [ ] Create tenant successfully
- [ ] See tenant in list

### Test Organization Management
- [ ] Click "Add Organization"
- [ ] Select tenant
- [ ] Fill in details
- [ ] Create organization successfully
- [ ] See org in list

### Test User Management
- [ ] Click "Add User"
- [ ] Fill in details
- [ ] Assign to organization
- [ ] Create user successfully
- [ ] See user in tree view

**Test:** All CRUD operations work.

---

## Step 10: Test Permissions (5 minutes)

- [ ] Create a regular user (role: "user")
- [ ] Log in as that user
- [ ] Verify they cannot access admin panel
- [ ] Create an org admin
- [ ] Verify they can only manage their org
- [ ] Create a tenant admin
- [ ] Verify they can only manage their tenant

**Test:** Permissions correctly restrict access.

---

## Post-Import Verification

- [ ] No console errors
- [ ] All admin functions work
- [ ] Can create tenants/orgs/users
- [ ] Permissions work correctly
- [ ] Backend routes respond
- [ ] Mobile view works (test on phone)
- [ ] Context switcher works (for admins)
- [ ] Backup/restore works (try deleting)

---

## Cleanup (Optional)

- [ ] Remove ValueDock-specific documentation (if you don't need it)
- [ ] Customize colors/branding
- [ ] Update welcome text
- [ ] Add your logo
- [ ] Customize email domains

---

## Troubleshooting

If something doesn't work:

1. **Import Errors**
   - [ ] Check file paths are correct
   - [ ] Verify all files were copied
   - [ ] Check case sensitivity in imports

2. **Backend Errors**
   - [ ] Check Edge Function deployed
   - [ ] Verify routes are correct
   - [ ] Check console logs

3. **Auth Errors**
   - [ ] Verify admin user in KV store
   - [ ] Check UUID matches
   - [ ] Test auth token generation

4. **Permission Errors**
   - [ ] Check user role in database
   - [ ] Verify permission logic copied
   - [ ] Test with different roles

---

## Completion Time

- **Minimum (basic setup):** ~1 hour
- **Full (with testing):** ~2 hours
- **Advanced (with customization):** ~3 hours

---

## Success Criteria ✅

You're done when:

- [ ] ✅ Can log in as admin
- [ ] ✅ Can create tenants
- [ ] ✅ Can create organizations
- [ ] ✅ Can create users
- [ ] ✅ Permissions work
- [ ] ✅ No console errors
- [ ] ✅ Mobile works
- [ ] ✅ Context switching works

---

## Next Steps After Import

1. [ ] Customize UI for your brand
2. [ ] Add custom validation rules
3. [ ] Integrate with your app features
4. [ ] Add more custom fields
5. [ ] Configure email domains
6. [ ] Set up production environment
7. [ ] Add monitoring/logging
8. [ ] Document your customizations

---

## Notes

Use this space to track issues or customizations:

```
Date: _______________
Project: _______________

Issues encountered:
- 

Customizations made:
- 

Time taken: _______________

```

---

**🎉 Congratulations!** 

Once all boxes are checked, you have successfully imported the multi-tenant admin module into your new Figma Make project!
