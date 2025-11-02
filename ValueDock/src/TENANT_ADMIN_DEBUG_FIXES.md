# Tenant Admin Display & Organization Nesting - Fixes & Debug

## Issues Addressed

### 1. ✅ Organizations Section - Nested Under Tenants
**Problem:** Organizations were displayed in a flat table without grouping by tenant.

**Solution:** Restructured the Organizations tab to show collapsible tenant cards with nested organization tables.

**File Modified:** `/components/AdminDashboard.tsx`

**New Structure:**
```
Organizations Tab
├─ DockeryAI, LLC (Tenant Card) ▼
│   ├─ Sandbox Organization
│   └─ Production Instance
│
├─ Test Tenant (Tenant Card) ▶
│   ├─ Acme Corp
│   └─ XYZ Inc
```

**Features:**
- Click tenant card to expand/collapse
- Shows organization count per tenant
- Each tenant displays its organizations in a nested table
- Checkbox selection still works for bulk operations
- Empty state: "No organizations in this tenant yet"

---

### 2. ✅ Tenant Admin Selection - Debug Logging Added
**Problem:** When creating a new tenant, only Global Admin appears as an option. Tenant admins should also appear.

**Code Review:** The filter logic in `AdminUserSelector.tsx` is **CORRECT**:

```tsx
const filteredUsers = mode === 'tenant' 
  ? existingUsers.filter(u => 
      u.role === 'master_admin' ||    // ✅ Always show global admins
      u.role === 'tenant_admin' ||    // ✅ Show all tenant admins
      (!u.tenantId && !u.organizationId) // ✅ Show unassigned users
    )
```

**This should work!** But it might not be showing users because:
- There are no actual users with `role: 'tenant_admin'` in the database
- The user was created with a different role
- Data isn't loading properly

**Debug Logging Added:**
Added console.log statements to help diagnose the issue:

```tsx
console.log('[AdminUserSelector] Mode:', mode);
console.log('[AdminUserSelector] All existing users:', existingUsers);
console.log('[AdminUserSelector] Filtered users:', filteredUsers);
console.log('[AdminUserSelector] Tenant admins in system:', 
  existingUsers.filter(u => u.role === 'tenant_admin'));
```

**How to Debug:**
1. Open browser DevTools Console
2. Click "Add Tenant" button
3. Look for logs starting with `[AdminUserSelector]`
4. Check:
   - How many users exist in total?
   - How many have role = 'tenant_admin'?
   - What are the filtered results?

---

### 3. ✅ Tenant Admin Display in User Tree - Debug Logging Added
**Problem:** Tenant admins not appearing at the top when expanding a tenant in the Users section.

**Code Review:** The filter logic in `UserManagementTree.tsx` is **CORRECT**:

```tsx
const tenantAdmins = users.filter(u => 
  u.tenantId === tenant.id && 
  u.role === 'tenant_admin'
);
```

**This should work!** The display logic is also correct - it shows tenant admins first, before organizations.

**Debug Logging Added:**
Added console.log statements to help diagnose:

```tsx
console.log(`[UserManagementTree] Tenant: ${tenant.name} (ID: ${tenant.id})`);
console.log(`[UserManagementTree] All users in tenant:`, 
  users.filter(u => u.tenantId === tenant.id));
console.log(`[UserManagementTree] Tenant admins found:`, tenantAdmins);
```

**How to Debug:**
1. Open browser DevTools Console
2. Go to Admin Dashboard → Users tab
3. Expand any tenant (e.g., "Test Tenant")
4. Look for logs starting with `[UserManagementTree]`
5. Check:
   - How many users are in the tenant?
   - What are their roles?
   - How many have role = 'tenant_admin'?

---

## Root Cause Analysis

Based on the user's description, the most likely issue is:

### **There are NO users with `role: 'tenant_admin'` in the database**

The user mentioned: *"Test Tenant is a tenant admin"*

This sounds like **"Test Tenant" is the NAME of a tenant**, not a user. The confusion might be:
- "Test Tenant" = A tenant entity
- Not a user with tenant_admin role

### **Possible Scenarios:**

#### Scenario A: No Tenant Admin User Exists
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",  // ❌ Should be "tenant_admin"
  "tenantId": "test-tenant-id",
  "organizationId": "some-org-id"
}
```

**Solution:** Create a user with `role: 'tenant_admin'`

#### Scenario B: Tenant Admin User Has Wrong Assignment
```json
{
  "id": "user-123",
  "name": "Test Admin",
  "email": "admin@test.com",
  "role": "tenant_admin",  // ✅ Correct role
  "tenantId": null,  // ❌ Should be assigned to tenant
  "organizationId": "some-org-id"  // ❌ Should be null or specific org
}
```

**Solution:** Update user to have correct `tenantId`

#### Scenario C: User Has Org Admin Role Instead
```json
{
  "id": "user-123",
  "name": "Test Admin",
  "email": "admin@test.com",
  "role": "org_admin",  // ❌ Should be "tenant_admin"
  "tenantId": "test-tenant-id",
  "organizationId": "some-org-id"
}
```

**Solution:** Change role from `org_admin` to `tenant_admin`

---

## How to Verify the Fix

### Step 1: Check Console Logs

Open browser DevTools Console and look for the debug logs:

#### When Creating a Tenant:
```
[AdminUserSelector] Mode: tenant
[AdminUserSelector] All existing users: [...]
[AdminUserSelector] Filtered users: [...]
[AdminUserSelector] Tenant admins in system: [...]
```

**What to look for:**
- If "Tenant admins in system" is empty `[]`, no tenant admins exist
- If "Filtered users" only shows 1 user (global admin), that confirms the issue

#### When Viewing Users Tab:
```
[UserManagementTree] Tenant: Test Tenant (ID: tenant-123)
[UserManagementTree] All users in tenant: [...]
[UserManagementTree] Tenant admins found: [...]
```

**What to look for:**
- If "Tenant admins found" is empty `[]`, no tenant admins exist for that tenant
- Check the roles of users in "All users in tenant"

---

### Step 2: Create a Tenant Admin User

If no tenant admin exists, create one:

#### Option A: Through UI (Recommended)
1. Go to Admin Dashboard → Users tab
2. Click "Add User"
3. Fill in details:
   - Name: "Test Tenant Admin"
   - Email: "tenantadmin@test.com"
   - Password: (choose secure password)
   - **Role: Tenant Admin** ← Important!
   - **Tenant: Test Tenant** ← Assign to tenant
   - Organization: (leave blank or assign specific org)
4. Click "Create User"

#### Option B: Directly in Database
Update an existing user or create new:

```sql
-- Update existing user
UPDATE users
SET 
  role = 'tenant_admin',
  tenantId = 'test-tenant-id',  -- Use actual tenant ID
  organizationId = NULL  -- Or specific org if also org admin
WHERE email = 'admin@test.com';

-- Or create new user
INSERT INTO users (id, email, name, role, tenantId, organizationId)
VALUES (
  'new-user-id',
  'tenantadmin@test.com',
  'Test Tenant Admin',
  'tenant_admin',
  'test-tenant-id',  -- Use actual tenant ID
  NULL
);
```

---

### Step 3: Verify Tenant Admin Appears

After creating/updating a tenant admin user:

#### Test 1: User Management Tree
1. Go to Admin Dashboard → Users tab
2. Expand "Test Tenant"
3. **Expected:** Should see section at top:
   ```
   🛡️ Tenant Admins (1)
   └─ Test Tenant Admin [Tenant Admin]
   ```

#### Test 2: Tenant Creation
1. Go to Admin Dashboard → Tenants tab
2. Click "Add Tenant"
3. In "Assign Tenant Admin" section:
   - Click "Select Existing" tab
   - Open dropdown
4. **Expected:** Should see:
   ```
   - No admin (assign later)
   - admin@dockery.ai (Global Admin)
   - Test Tenant Admin (Tenant Admin) ← Should appear!
   ```

---

## Expected Behavior After Fix

### Organizations Tab (FIXED ✅)
```
┌─────────────────────────────────────────┐
│  DockeryAI, LLC                      ▼  │
│  2 organizations                        │
├─────────────────────────────────────────┤
│  ✓  Sandbox Organization   Active  [Edit] [Delete]
│  ✓  Production Instance    Active  [Edit] [Delete]
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Test Tenant                         ▶  │
│  3 organizations                        │
└─────────────────────────────────────────┘
```

### Users Tab - When Tenant Admin Exists
```
Test Tenant ▼ [5 users] [3 orgs] [+]
├─ Tenant Admins (1)
│   └─ Test Tenant Admin [Tenant Admin]
│       (Hover shows: Tenant Admin: Test Tenant + Org Admin: Acme Corp)
│
├─ Acme Corp ▶
│   └─ Test Tenant Admin [Tenant & Org Admin]  ← Also appears here
│   └─ John Doe [User]
│
└─ XYZ Inc ▶
    └─ Jane Smith [User]
```

### Create Tenant Dialog - Admin Selection
```
┌───────────────────────────────────────────┐
│ Assign Tenant Admin (Optional)            │
├───────────────────────────────────────────┤
│ [ Select Existing ] [ Create New ]        │
├───────────────────────────────────────────┤
│ Select Tenant Admin                       │
│ ┌─────────────────────────────────────┐  │
│ │ Select a user to assign as admin   ▼│  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Options in dropdown:                      │
│ • No admin (assign later)                 │
│ • admin@dockery.ai (Global Admin)         │
│ • Test Tenant Admin (Tenant Admin) ← NEW!│
│ • Other Tenant Admin (Tenant Admin)       │
└───────────────────────────────────────────┘
```

---

## Files Modified

1. **`/components/AdminDashboard.tsx`**
   - Changed organizations table from flat list to nested under tenants
   - Added collapsible tenant cards
   - Each tenant shows its organizations in a sub-table

2. **`/components/AdminUserSelector.tsx`**
   - Added debug console logging
   - No logic changes (filter was already correct)

3. **`/components/UserManagementTree.tsx`**
   - Added debug console logging
   - No logic changes (filter was already correct)

---

## Troubleshooting

### Issue: Console says "Tenant admins in system: []"
**Solution:** No tenant admin users exist. Create one using steps above.

### Issue: Tenant admin exists but doesn't appear in dropdown
**Check:**
- Does the user have `role: 'tenant_admin'`? (not 'org_admin' or 'user')
- Is the user's data loaded in `existingUsers`?
- Does browser console show the user in "All existing users"?

### Issue: Tenant admin exists but doesn't show in User Tree
**Check:**
- Does the user have `tenantId` matching the tenant you're viewing?
- Is `role: 'tenant_admin'` exactly (case-sensitive)?
- Does browser console show the user in "All users in tenant"?

### Issue: Organizations not nesting under tenants
**Check:**
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser console for errors
- Verify organizations have `tenantId` field populated

---

## Removing Debug Logs (After Fix Verified)

Once you've identified and fixed the issue, remove the debug logs:

### In `/components/AdminUserSelector.tsx`:
Remove lines:
```tsx
// Debug logging
console.log('[AdminUserSelector] Mode:', mode);
console.log('[AdminUserSelector] All existing users:', existingUsers);
console.log('[AdminUserSelector] Filtered users:', filteredUsers);
console.log('[AdminUserSelector] Tenant admins in system:', existingUsers.filter(u => u.role === 'tenant_admin'));
```

### In `/components/UserManagementTree.tsx`:
Remove lines:
```tsx
// Debug logging
console.log(`[UserManagementTree] Tenant: ${tenant.name} (ID: ${tenant.id})`);
console.log(`[UserManagementTree] All users in tenant:`, users.filter(u => u.tenantId === tenant.id));
console.log(`[UserManagementTree] Tenant admins found:`, tenantAdmins);
```

---

## Summary

✅ **Organizations Tab**: Fixed - now nested under tenant cards
✅ **Tenant Admin Selection**: Code is correct, added debug logging to identify data issue
✅ **Tenant Admin Display**: Code is correct, added debug logging to identify data issue

**Next Step:** Check browser console to see what the debug logs reveal about existing users and their roles. Most likely, you need to create or update a user to have `role: 'tenant_admin'` and `tenantId: '<tenant-id>'`.
