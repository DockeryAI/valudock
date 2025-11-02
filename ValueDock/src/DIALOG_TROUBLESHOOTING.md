# EnhancedUserDialogV2 Troubleshooting Guide

## Issue: Cannot Create New Orgs/Tenants When Adding Users

### What Should You See?

When you click "Add User" button, the EnhancedUserDialogV2 should open with:

1. **Basic User Information Section** (Always visible)
   - Full Name field
   - Email field  
   - Password field

2. **Admin Rights Assignment Section** (Always visible)
   - Dropdown with options:
     - "Regular User (No Admin Rights)"
     - "Organization Admin"
     - "Tenant Admin" (for master_admin and tenant_admin only)
     - "Global Admin (Full System Access)" (for master_admin only)

### Expected Behavior Based on Selection:

#### Option 1: "Regular User (No Admin Rights)"
- Shows: Organization assignment section
- You must select an organization
- No tabs - just a dropdown to select existing organization

#### Option 2: "Organization Admin"
- Shows: TWO TABS
  - **Tab 1**: "Existing Organization" - Select from dropdown
  - **Tab 2**: "Create New Organization" - Form to create new org
- You can switch between tabs
- For "Create New Organization" tab:
  - Master Admin: Must select a tenant first, then fill org details
  - Tenant Admin: Sees message "This organization will be created in your tenant: [Tenant Name]", fills org details

#### Option 3: "Tenant Admin" (master_admin or tenant_admin only)
- Shows: ONE or TWO TABS (depending on your role)
  - **Tab 1**: "Existing Tenant" - Select from dropdown
  - **Tab 2**: "Create New Tenant" - Form to create new tenant (MASTER ADMIN ONLY)
- For "Create New Tenant" tab (master_admin only):
  - Tenant Name field
  - Tenant Domain field
  - Brand Name field (optional)

#### Option 4: "Global Admin" (master_admin only)
- Shows: Purple alert box
- Message: "Global Admin - Full System Access"
- No tenant/org selection needed

---

## Diagnostic Steps

### Step 1: Check Browser Console
Open browser console (F12) and look for:
- Any JavaScript errors
- React warnings
- Network errors

### Step 2: Verify Dialog is Opening
When you click "Add User":
1. Does a dialog/modal appear?
2. Can you see the user form (Name, Email, Password)?
3. Can you see the "Admin Rights Assignment" dropdown?

### Step 3: Check Admin Rights Dropdown
1. Click the dropdown under "Admin Rights Assignment"
2. How many options do you see?
3. What are the options?

**Expected for master_admin:**
- Regular User (No Admin Rights)
- Organization Admin
- Tenant Admin
- Global Admin (Full System Access)

**Expected for tenant_admin:**
- Regular User (No Admin Rights)
- Organization Admin
- Tenant Admin

**Expected for org_admin:**
- Regular User (No Admin Rights)
- Organization Admin

### Step 4: Select "Organization Admin"
1. Select "Organization Admin" from the dropdown
2. Do you see a green/colored box appear below?
3. Do you see TWO tabs: "Existing Organization" and "Create New Organization"?
4. Can you click on the "Create New Organization" tab?

### Step 5: Check Tab Content
If you see tabs:
1. Click "Create New Organization" tab
2. What do you see?
   - Should see fields for: Organization Name, Company Name, Domain, Description
   - If you're master_admin: Should also see "Select Tenant for New Organization" dropdown
   - If you're tenant_admin: Should see alert saying "This organization will be created in your tenant: [Name]"

---

## Common Issues & Solutions

### Issue 1: Don't See Any Tabs
**Symptoms:**
- Select "Organization Admin" but no tabs appear
- Just see a single dropdown or form

**Possible Causes:**
1. Wrong dialog component is being used (old version)
2. JavaScript error preventing render
3. CSS issue hiding the tabs

**Solution:**
Check browser console for errors. If no errors, verify file:
```bash
/components/EnhancedUserDialogV2.tsx
```
Line 576-580 should show:
```tsx
<TabsList className="grid w-full grid-cols-2">
  <TabsTrigger value="existing">Existing Organization</TabsTrigger>
  <TabsTrigger value="new">Create New Organization</TabsTrigger>
</TabsList>
```

---

### Issue 2: Tabs Are Visible But Empty
**Symptoms:**
- Can see tab buttons
- Clicking tabs does nothing or shows blank content

**Possible Causes:**
1. TabsContent not rendering
2. Missing form fields
3. State management issue

**Solution:**
Verify line 644-708 in `/components/EnhancedUserDialogV2.tsx` contains:
- Alert description
- Organization Name input
- Company Name input
- Domain input
- Description input (optional)

---

### Issue 3: "Create New Tenant" Tab Not Visible
**Symptoms:**
- Select "Tenant Admin"
- Only see one tab: "Existing Tenant"
- Don't see "Create New Tenant" option

**Expected Behavior:**
- This is CORRECT for tenant_admin users
- Only master_admin (Global Admin) can create new tenants
- Tenant admins can only assign users to existing tenants

**Solution:**
- If you're a tenant_admin: You cannot create new tenants, only manage existing ones
- If you're master_admin: Should see both tabs. Check lines 492-498 in EnhancedUserDialogV2.tsx

---

### Issue 4: Form Submits But Nothing Happens
**Symptoms:**
- Fill in all fields
- Click "Create User"
- No success/error message
- User not created

**Debugging:**
1. Check browser Network tab (F12 → Network)
2. Click "Create User"
3. Look for POST requests to `/make-server-888f4514/admin/users`
4. Check the request payload and response

**Common Causes:**
- Missing required fields
- Validation error
- Backend API error
- Network timeout

---

## Manual Testing Checklist

### As Master Admin:
- [ ] Can open Add User dialog
- [ ] Can select "Regular User" - shows org dropdown
- [ ] Can select "Organization Admin" - shows 2 tabs
- [ ] Can click "Existing Organization" tab - shows org dropdown
- [ ] Can click "Create New Organization" tab - shows org form with tenant selector
- [ ] Can select "Tenant Admin" - shows 2 tabs
- [ ] Can click "Existing Tenant" tab - shows tenant dropdown
- [ ] Can click "Create New Tenant" tab - shows tenant form
- [ ] Can select "Global Admin" - shows purple alert
- [ ] Can submit form and create user successfully

### As Tenant Admin:
- [ ] Can open Add User dialog
- [ ] Can select "Regular User" - shows org dropdown (filtered to my tenant)
- [ ] Can select "Organization Admin" - shows 2 tabs
- [ ] Can click "Existing Organization" tab - shows org dropdown (filtered to my tenant)
- [ ] Can click "Create New Organization" tab - shows org form (no tenant selector, auto-uses my tenant)
- [ ] Can select "Tenant Admin" - shows 1 tab only
- [ ] Can click "Existing Tenant" tab - shows tenant dropdown
- [ ] Cannot see "Create New Tenant" tab (correct behavior)
- [ ] Can submit form and create user successfully

### As Org Admin:
- [ ] Can open Add User dialog
- [ ] Can select "Regular User" - shows org dropdown (filtered to my org)
- [ ] Can select "Organization Admin" - shows 2 tabs
- [ ] Cannot see "Tenant Admin" option (correct behavior)
- [ ] Cannot see "Global Admin" option (correct behavior)
- [ ] Can submit form and create user successfully

---

## Debug Mode

### Enable Console Logging

Add this to the EnhancedUserDialogV2 component to see what's happening:

```tsx
// Add inside the component, after useState declarations
useEffect(() => {
  console.log('=== EnhancedUserDialogV2 State ===');
  console.log('Dialog open:', open);
  console.log('Current user:', currentUser);
  console.log('Admin mode:', adminMode);
  console.log('Admin target mode:', adminTargetMode);
  console.log('Tenants:', tenants);
  console.log('Organizations:', organizations);
}, [open, adminMode, adminTargetMode, currentUser, tenants, organizations]);
```

---

## Quick Fixes

### Reset Dialog State
If dialog seems stuck, try:
1. Close dialog
2. Refresh page
3. Open dialog again

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Check Data Loading
Ensure tenants and organizations are loaded:
1. Open browser console
2. Type: `localStorage.getItem('admin_tenants')`
3. Type: `localStorage.getItem('admin_organizations')`
4. Should see JSON arrays

---

## Contact Support Data

If issue persists, provide:

1. **Your User Role**: (master_admin / tenant_admin / org_admin / user)
2. **What You See**: Screenshot of the dialog
3. **What You Selected**: Which option from Admin Rights dropdown
4. **Browser Console**: Copy any error messages (F12 → Console)
5. **Network Tab**: Screenshot of failed requests (F12 → Network)
6. **Expected vs Actual**: Describe what you expected vs what you got

---

## Expected UI Screenshots

### Organization Admin - Create New Organization Tab

**For Master Admin:**
```
┌────────────────────────────────────────┐
│  Organization Admin Configuration     │
├────────────────────────────────────────┤
│  [Existing Organization] [Create New]  │ ← Two tabs
├────────────────────────────────────────┤
│  ℹ Create a new organization...       │
│                                        │
│  Select Tenant for New Organization *  │
│  [Select tenant ▼]                     │
│                                        │
│  Organization Name *                   │
│  [Acme Corp Division          ]        │
│                                        │
│  Company Name *                        │
│  [Acme Corporation            ]        │
│                                        │
│  Domain *                              │
│  [acme.com                    ]        │
│                                        │
│  Description (Optional)                │
│  [Brief description           ]        │
└────────────────────────────────────────┘
```

**For Tenant Admin:**
```
┌────────────────────────────────────────┐
│  Organization Admin Configuration     │
├────────────────────────────────────────┤
│  [Existing Organization] [Create New]  │ ← Two tabs
├────────────────────────────────────────┤
│  ℹ This organization will be created  │
│    in your tenant: Acme Consulting     │
│                                        │
│  Organization Name *                   │
│  [Acme Corp Division          ]        │
│                                        │
│  Company Name *                        │
│  [Acme Corporation            ]        │
│                                        │
│  Domain *                              │
│  [acme.com                    ]        │
│                                        │
│  Description (Optional)                │
│  [Brief description           ]        │
└────────────────────────────────────────┘
```

### Tenant Admin - Create New Tenant Tab

**For Master Admin Only:**
```
┌────────────────────────────────────────┐
│  Tenant Admin Configuration           │
├────────────────────────────────────────┤
│  [Existing Tenant] [Create New Tenant] │ ← Two tabs
├────────────────────────────────────────┤
│  ℹ Create a new tenant and assign...  │
│                                        │
│  Tenant Name *                         │
│  [Acme Consulting LLC         ]        │
│                                        │
│  Tenant Domain *                       │
│  [acmeconsulting.com          ]        │
│                                        │
│  Brand Name (Optional)                 │
│  [Acme ValueDock®             ]        │
└────────────────────────────────────────┘
```

**For Tenant Admin: (only ONE tab)**
```
┌────────────────────────────────────────┐
│  Tenant Admin Configuration           │
├────────────────────────────────────────┤
│  [Existing Tenant]                     │ ← Only one tab
├────────────────────────────────────────┤
│  Select Tenant to Administer *         │
│  [Select a tenant ▼]                   │
│                                        │
│  ℹ This user will manage all orgs...  │
└────────────────────────────────────────┘
```

---

## Verify Installation

The following file should exist and be up-to-date:
- `/components/EnhancedUserDialogV2.tsx` - Version with tabs for org/tenant creation

If you see different content or missing features, the file may not have been updated correctly.

## Last Updated
Refer to `/ENHANCED_USER_DIALOG_FIX.md` for the latest implementation details.
