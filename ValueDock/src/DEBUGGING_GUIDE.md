# Debugging Guide - Groups Loading and Hover Tooltip Issues

## Issue 1: Groups Not Loading in Edit User Dialog

### What's Expected:
When you click the edit button on "Test Executive User", if they have an organizationId, the dialog should load all groups for that organization and allow you to select which groups they belong to.

### What to Check:

1. **Open your browser's Developer Console** (F12)
2. **Clear the console** (click the 🚫 icon)
3. **Click the edit (pencil) icon** next to "Test Executive User"
4. **Look for these log messages** in the console:

```
[EditUserDialog] Opening for user: Test Executive User
  - This shows: organizationId, tenantId, role, groupIds
  
[EditUserDialog] User has organizationId, loading groups...
  OR
[EditUserDialog] User has NO organizationId, skipping groups load
```

5. **If the user HAS an organizationId**, you should see:
```
========== API CALL ==========
Endpoint: /groups/{organizationId}
Method: GET
...
[EditUserDialog] Groups response: { groups: [...], organizationId: "..." }
```

6. **Check the server logs** for:
```
[GROUPS GET] Request details:
  - userId: ...
  - organizationId: ...
  - profileRole: ...
  - profileTenantId: ...
  - profileOrgId: ...
```

### Common Problems:

**A) User has NO organizationId:**
- Log will show: `[EditUserDialog] User has NO organizationId, skipping groups load`
- **Solution:** The "Test Executive User" needs to be assigned to an organization. Edit the user and select an organization.

**B) Permission Error:**
- Server logs show: `[GROUPS GET] ERROR: Org tenant mismatch`
- **Solution:** The organization doesn't belong to the tenant admin's tenant. This shouldn't happen if the data is set up correctly.

**C) No Groups Created:**
- Log shows: `[GROUPS GET] Groups found: 0`
- **Solution:** No groups have been created in that specific organization yet. Go to the Admin Dashboard → Groups tab and create groups for that organization.

**D) Wrong Organization:**
- The user is assigned to "Organization A" but groups were created in "Organization B"
- **Solution:** Either assign the user to the correct organization, or create groups in the user's current organization.

---

## Issue 2: Hover Tooltip Not Showing Admin Roles

### What's Expected:
When you hover over an admin user's name (like "Test Admin User"), the tooltip should show:

```
Admin Roles:
🛡 Tenant Admin: Test Tenant
🛡 Org Admin: Test Organization

Assigned To:
🏢 Tenant: Test Tenant
👥 Org: Test Organization
```

### What to Check:

1. **Open your browser's Developer Console** (F12)
2. **Hover over a tenant admin's name** in the user management tree
3. **Look for this log message**:
```
[UserTooltip] Test Admin User customContext: Tenant Admin: Test Tenant | Org Admin: Test Organization
```

### Common Problems:

**A) Context is empty/undefined:**
- Log shows: `[UserTooltip] Test Admin User customContext: undefined`
- This means the context isn't being passed from the UserRow component
- **Check:** Is the user displayed under the tenant section, or under an organization?
  - Under tenant: Should show `Tenant Admin: {tenant.name}` or `Tenant Admin: {tenant.name} | Org Admin: {org.name}`
  - Under org: Should show the same admin roles

**B) Context is being shown but not in the tooltip:**
- This would be a rendering issue
- The customContext section should appear BEFORE the "Assigned To" section

**C) User is not actually a tenant_admin:**
- Check the user's role in the database
- Log will show the raw user data when you hover

---

## How to Verify the Fixes Are Working:

### Test 1: Tenant Admin Can Load Groups
1. Log in as a **Tenant Admin**
2. Go to Admin Dashboard → Users tab
3. Find a user who is assigned to an organization within your tenant
4. Click the edit (pencil) icon
5. **Expected:** You should see a "Groups (Optional)" section with checkboxes for all groups in that organization
6. **Check console:** Should see `[GROUPS GET] Tenant admin access granted` and `[GROUPS GET] Groups found: X`

### Test 2: Hover Tooltip Shows Admin Roles
1. Go to Admin Dashboard → Users tab
2. Expand a tenant
3. Hover over a tenant admin user's name
4. **Expected:** Tooltip shows "Admin Roles:" section at the top
5. **Check console:** Should see `[UserTooltip] {user name} customContext: Tenant Admin: ...`

---

## Debug Data Needed

If the issues persist, please provide:

1. **Console logs** from opening the Edit User Dialog:
   - All logs starting with `[EditUserDialog]`
   - All logs starting with `[GROUPS GET]`
   - Any error messages

2. **Test Executive User data:**
   - What is their organizationId?
   - What is their tenantId?
   - What is their role?

3. **Groups data:**
   - Which organization are the 3 groups created in?
   - What are their IDs?

4. **Your current user (the one logged in):**
   - What is your role?
   - What is your tenantId?
   - What is your organizationId?

You can get this data by running this in the console after logging in:
```javascript
// Get current user
const session = await supabase.auth.getSession();
console.log('Current user session:', session.data.session);

// Decode the JWT to see your profile
const token = session.data.session.access_token;
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(atob(base64));
console.log('JWT payload:', payload);
```
