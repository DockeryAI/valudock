# User Creation Testing Guide

## Quick Test Scenarios for Enhanced User Dialog V2

### Prerequisites
- Log in as different user types to test each scenario
- Ensure you have at least one tenant and organization set up

---

## Test 1: Master Admin Creates Tenant Admin with NEW Tenant

**Login as**: `admin@dockery.ai` (Global Admin)

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `John Smith`
   - Email: `john@newcompany.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Tenant Admin**
5. In the Tabs, select: **Create New Tenant**
6. Fill in tenant details:
   - Tenant Name: `New Consulting LLC`
   - Tenant Domain: `newconsulting.com`
   - Brand Name (optional): `New Consulting ValueDock`
7. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating new tenant..."
- Toast: "Tenant 'New Consulting LLC' created"
- Toast: "Creating user..."
- Toast: "Tenant Admin 'john@newcompany.com' created successfully!"
- User appears in the user list as Tenant Admin
- New tenant appears in Tenants tab

---

## Test 2: Master Admin Creates Org Admin with NEW Organization

**Login as**: `admin@dockery.ai` (Global Admin)

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Jane Doe`
   - Email: `jane@acmecorp.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Organization Admin**
5. In the Tabs, select: **Create New Organization**
6. Select a tenant from the dropdown (e.g., "Acme Consulting")
7. Fill in organization details:
   - Organization Name: `Acme Corp Division`
   - Company Name: `Acme Corporation`
   - Domain: `acme.com`
   - Description (optional): `Western division`
8. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating new organization..."
- Toast: "Organization 'Acme Corp Division' created"
- Toast: "Creating user..."
- Toast: "Organization Admin 'jane@acmecorp.com' created successfully!"
- User appears as Organization Admin
- New organization appears under the selected tenant

---

## Test 3: Tenant Admin Creates Org Admin with NEW Organization

**Login as**: A tenant admin user (e.g., user with `tenant_admin` role)

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Bob Johnson`
   - Email: `bob@clientco.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Organization Admin**
5. In the Tabs, select: **Create New Organization**
6. **Note**: You should see an alert: "This organization will be created in your tenant: [Your Tenant Name]"
7. Fill in organization details (NO tenant selector should appear):
   - Organization Name: `Client Co`
   - Company Name: `Client Company LLC`
   - Domain: `clientco.com`
   - Description (optional): `New client organization`
8. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating new organization..."
- Toast: "Organization 'Client Co' created"
- Toast: "Creating user..."
- Toast: "Organization Admin 'bob@clientco.com' created successfully!"
- New organization is created **within your tenant** (not in another tenant)
- User appears as Organization Admin of the new organization

**Critical Check**: The organization should be created in the tenant admin's tenant, NOT in a different tenant.

---

## Test 4: Tenant Admin Creates Org Admin with EXISTING Organization

**Login as**: A tenant admin user

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Alice Cooper`
   - Email: `alice@existing.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Organization Admin**
5. In the Tabs, select: **Existing Organization**
6. **Note**: You should see an alert: "Showing organizations from your tenant: [Your Tenant Name]"
7. Select an organization from the dropdown (only orgs in your tenant should appear)
8. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating user..."
- Toast: "Organization Admin 'alice@existing.com' created successfully!"
- User appears as Organization Admin of the selected organization
- User can only manage that specific organization

---

## Test 5: Tenant Admin Creates Regular User

**Login as**: A tenant admin user

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Charlie Brown`
   - Email: `charlie@myorg.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Regular User (No Admin Rights)**
5. **Note**: You should see an alert: "Showing organizations from your tenant: [Your Tenant Name]"
6. Select an organization from the dropdown
7. Optionally assign groups
8. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating user..."
- Toast: "User 'charlie@myorg.com' created successfully!"
- User appears as a regular user in the selected organization
- User has no admin privileges

---

## Test 6: Org Admin Creates Regular User

**Login as**: An organization admin user

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Diana Prince`
   - Email: `diana@myorg.com`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Regular User (No Admin Rights)**
5. **Note**: You should see an alert: "This user will be added to your organization"
6. Organization should be pre-selected or limited to your organization
7. Optionally assign groups
8. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating user..."
- Toast: "User 'diana@myorg.com' created successfully!"
- User appears as a regular user in the org admin's organization
- User has no admin privileges

---

## Test 7: Master Admin Creates Global Admin

**Login as**: `admin@dockery.ai` (Global Admin)

**Steps**:
1. Go to Admin Dashboard → Users tab
2. Click "Add User" button
3. Fill in user details:
   - Name: `Super Admin`
   - Email: `superadmin@dockery.ai`
   - Password: `password123`
4. Under "Admin Rights Assignment", select: **Global Admin (Full System Access)**
5. **Note**: You should see a purple alert explaining that no tenant/org is needed
6. Click "Create User"

**Expected Result**: ✅
- Toast: "Creating user..."
- Toast: "Global Admin 'superadmin@dockery.ai' created successfully!"
- User appears with master_admin role
- User has `tenantId: null` and `organizationId: null`
- User can manage all tenants, organizations, and users

---

## Common Issues to Check

### Issue 1: "Please select a tenant" error when creating org
**Symptom**: Getting an error when trying to create a new organization as tenant admin

**Check**:
- Ensure you're logged in as a tenant admin (not regular user)
- Verify the tenant admin has a valid `tenantId`
- Check that `currentUser.tenantId` is not null

**Fix**: The dialog should automatically use `currentUser.tenantId` for tenant admins

---

### Issue 2: Can't see "Create New Organization" tab
**Symptom**: Only seeing "Existing Organization" tab

**Check**:
- This is correct for regular users (org_admin)
- Tenant admins and master admins should see both tabs

**Expected Behavior**:
- Master Admin: Sees both tabs, can create in any tenant
- Tenant Admin: Sees both tabs, can only create in their tenant
- Org Admin: Cannot create organizations, only sees existing

---

### Issue 3: Wrong tenant selected for new organization
**Symptom**: Organization created in wrong tenant

**Check**:
- If you're a tenant admin, the organization should ALWAYS be created in your tenant
- If you're a master admin, it should use the tenant you selected

**Debug**:
```javascript
// Check the tenant ID being used
console.log('Current User Tenant ID:', currentUser.tenantId);
console.log('Selected Tenant ID:', userData.tenantId);
```

---

## Validation Checklist

After each test, verify:

- ✅ User was created successfully
- ✅ User has correct role assigned
- ✅ User is associated with correct tenant (if applicable)
- ✅ User is associated with correct organization (if applicable)
- ✅ New tenant/organization was created (if applicable)
- ✅ Backend permissions are correctly enforced
- ✅ User can log in with created credentials
- ✅ User has appropriate access level

---

## Backend Logs to Monitor

Check server logs in Supabase Edge Function for:

```
========== CREATE ORGANIZATION REQUEST RECEIVED ==========
User authenticated: [user_id]
User profile: {...}
Request body received: {...}
Creating organization: {...}
Organization saved to KV store successfully
```

Or for tenant creation:

```
========== CREATE TENANT REQUEST RECEIVED ==========
User authenticated: [user_id]
Creating tenant: {...}
Tenant saved to KV store successfully
```

---

## Expected Permissions Matrix

| User Role       | Can Create Tenants | Can Create Organizations | Can Create Users | Scope                    |
|-----------------|-------------------|-------------------------|-----------------|-------------------------|
| master_admin    | ✅ Yes            | ✅ Yes (any tenant)     | ✅ Yes (any)    | All tenants/orgs        |
| tenant_admin    | ❌ No             | ✅ Yes (own tenant)     | ✅ Yes (own)    | Within their tenant     |
| org_admin       | ❌ No             | ❌ No                   | ✅ Yes (own)    | Within their org        |
| user            | ❌ No             | ❌ No                   | ❌ No           | No admin access         |

---

## Quick Commands for Testing

### Check user in backend:
```javascript
// In browser console (when logged in)
const response = await fetch('https://[your-project].supabase.co/functions/v1/make-server-888f4514/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
  }
});
console.log(await response.json());
```

### Check all tenants (master admin only):
```javascript
const response = await fetch('https://[your-project].supabase.co/functions/v1/make-server-888f4514/admin/tenants', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
  }
});
console.log(await response.json());
```

---

## Success Criteria

All tests should:
1. Complete without errors
2. Show appropriate toast notifications
3. Create entities in correct hierarchy
4. Enforce role-based permissions
5. Display helpful context messages
6. Save data successfully to backend
7. Allow created users to log in
