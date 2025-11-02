# How to Create New Organizations and Tenants While Adding Users

## Quick Guide: Adding Users with New Organizations or Tenants

The **EnhancedUserDialogV2** allows you to create new organizations and tenants while creating users. Here's exactly how to do it:

---

## Method 1: Create User + New Organization

### Step-by-Step Instructions:

1. **Open the Add User Dialog**
   - Go to Admin Dashboard
   - Click the **Users** tab
   - Click the **"Add User"** button (or **"+"** icon)

2. **Fill in Basic User Information**
   - **Full Name**: Enter user's name (e.g., "John Smith")
   - **Email**: Enter user's email (e.g., "john@newcompany.com")
   - **Password**: Enter a secure password

3. **Select Admin Rights**
   - Under "Admin Rights Assignment" section
   - Click the dropdown menu
   - **Select: "Organization Admin"**
   
   ⚠️ **IMPORTANT**: You MUST select "Organization Admin" - not "Regular User"

4. **Switch to "Create New Organization" Tab**
   - You should now see a green box appear
   - Inside the box, you'll see TWO tabs:
     - "Existing Organization"
     - "Create New Organization"  ← **CLICK THIS TAB**

5. **Fill in New Organization Details**
   
   **If you're a Master Admin (Global Admin):**
   - **Select Tenant**: Choose which tenant this org belongs to
   - **Organization Name**: e.g., "Acme Corp Division"
   - **Company Name**: e.g., "Acme Corporation"
   - **Domain**: e.g., "acme.com"
   - **Description** (optional): e.g., "Western division"

   **If you're a Tenant Admin:**
   - You'll see a message: "This organization will be created in your tenant: [Your Tenant Name]"
   - **Organization Name**: e.g., "Client Company"
   - **Company Name**: e.g., "Client Company LLC"
   - **Domain**: e.g., "clientco.com"
   - **Description** (optional): e.g., "New client"
   
6. **Click "Create User"**
   - The system will:
     - Create the new organization
     - Create the user as an admin of that organization
     - Show success messages for both operations

### Result:
✅ New organization created  
✅ New user created as organization admin  
✅ User can manage that organization

---

## Method 2: Create User + New Tenant (Master Admin Only)

### Step-by-Step Instructions:

1. **Open the Add User Dialog**
   - Go to Admin Dashboard
   - Click the **Users** tab
   - Click the **"Add User"** button

2. **Fill in Basic User Information**
   - **Full Name**: Enter user's name
   - **Email**: Enter user's email
   - **Password**: Enter a secure password

3. **Select Admin Rights**
   - Under "Admin Rights Assignment" section
   - Click the dropdown menu
   - **Select: "Tenant Admin"**
   
   ⚠️ **NOTE**: This option is only available to Master Admins (Global Admins)

4. **Switch to "Create New Tenant" Tab**
   - You should now see a blue box appear
   - Inside the box, you'll see TWO tabs:
     - "Existing Tenant"
     - "Create New Tenant"  ← **CLICK THIS TAB**

5. **Fill in New Tenant Details**
   - **Tenant Name**: e.g., "Acme Consulting LLC"
   - **Tenant Domain**: e.g., "acmeconsulting.com"
   - **Brand Name** (optional): e.g., "Acme ValueDock®"

6. **Click "Create User"**
   - The system will:
     - Create the new tenant
     - Create the user as an admin of that tenant
     - Show success messages for both operations

### Result:
✅ New tenant created  
✅ New user created as tenant admin  
✅ User can manage that tenant and all its organizations

---

## Visual Guide

### What You Should See - Organization Admin Mode

```
┌─────────────────────────────────────────────────────────┐
│ Create New User                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Information                                       │
│ ────────────────────────────────────────────────────   │
│ Full Name *                    Email *                  │
│ [John Smith            ]       [john@company.com    ]   │
│                                                         │
│ Password *                                              │
│ [••••••••              ]                                │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ 🛡️ Admin Rights Assignment                             │
│ Choose what level of access...                         │
│                                                         │
│ [Organization Admin              ▼]  ← SELECT THIS     │
│                                                         │
│ ╔═══════════════════════════════════════════════════╗   │
│ ║ 🏢 Organization Admin Configuration              ║   │
│ ╠═══════════════════════════════════════════════════╣   │
│ ║                                                   ║   │
│ ║  [Existing Organization] [Create New Organization]║   │
│ ║                           ↑                       ║   │
│ ║                     CLICK THIS TAB                ║   │
│ ║                                                   ║   │
│ ║  ℹ Create a new organization and assign...       ║   │
│ ║                                                   ║   │
│ ║  Organization Name *                              ║   │
│ ║  [Acme Corp Division                    ]         ║   │
│ ║                                                   ║   │
│ ║  Company Name *                                   ║   │
│ ║  [Acme Corporation                      ]         ║   │
│ ║                                                   ║   │
│ ║  Domain *                                         ║   │
│ ║  [acme.com                              ]         ║   │
│ ║                                                   ║   │
│ ║  Description (Optional)                           ║   │
│ ║  [Brief description                     ]         ║   │
│ ║                                                   ║   │
│ ╚═══════════════════════════════════════════════════╝   │
│                                                         │
│                           [Cancel] [Create User]        │
└─────────────────────────────────────────────────────────┘
```

### What You Should See - Tenant Admin Mode (Master Admin)

```
┌─────────────────────────────────────────────────────────┐
│ Create New User                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Information                                       │
│ ────────────────────────────────────────────────────   │
│ Full Name *                    Email *                  │
│ [Jane Doe              ]       [jane@partner.com    ]   │
│                                                         │
│ Password *                                              │
│ [••••••••              ]                                │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ 🛡️ Admin Rights Assignment                             │
│ Choose what level of access...                         │
│                                                         │
│ [Tenant Admin                    ▼]  ← SELECT THIS     │
│                                                         │
│ ╔═══════════════════════════════════════════════════╗   │
│ ║ 🛡️ Tenant Admin Configuration                    ║   │
│ ╠═══════════════════════════════════════════════════╣   │
│ ║                                                   ║   │
│ ║  [Existing Tenant] [Create New Tenant]            ║   │
│ ║                     ↑                             ║   │
│ ║               CLICK THIS TAB                      ║   │
│ ║                                                   ║   │
│ ║  ℹ Create a new tenant and assign this user...   ║   │
│ ║                                                   ║   │
│ ║  Tenant Name *                                    ║   │
│ ║  [Acme Consulting LLC                   ]         ║   │
│ ║                                                   ║   │
│ ║  Tenant Domain *                                  ║   │
│ ║  [acmeconsulting.com                    ]         ║   │
│ ║                                                   ║   │
│ ║  Brand Name (Optional)                            ║   │
│ ║  [Acme ValueDock®                       ]         ║   │
│ ║                                                   ║   │
│ ╚═══════════════════════════════════════════════════╝   │
│                                                         │
│                           [Cancel] [Create User]        │
└─────────────────────────────────────────────────────────┘
```

---

## Common Mistakes

### ❌ Mistake 1: Selecting "Regular User"
If you select "Regular User (No Admin Rights)", you will NOT see options to create new orgs/tenants.

**Why**: Regular users must be assigned to existing organizations.

**Solution**: Select "Organization Admin" or "Tenant Admin" instead.

---

### ❌ Mistake 2: Staying on "Existing Organization" Tab
If you stay on the "Existing Organization" tab, you'll only see a dropdown to select existing orgs.

**Why**: That tab is for assigning users to existing organizations.

**Solution**: Click the "Create New Organization" tab to create a new one.

---

### ❌ Mistake 3: Not Seeing the Tabs
If you don't see any tabs after selecting "Organization Admin" or "Tenant Admin":

**Possible Causes**:
1. Browser cache issue - try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. JavaScript error - check browser console (F12)
3. Wrong dialog version - verify file `/components/EnhancedUserDialogV2.tsx` exists

**Solution**: 
- Refresh the page
- Check browser console for errors
- Verify you're using the latest version of the app

---

### ❌ Mistake 4: Tenant Admin Can't Create Tenants
If you're a Tenant Admin and don't see the "Create New Tenant" option:

**Why**: This is correct! Only Master Admins (Global Admins) can create new tenants.

**What You CAN Do**: 
- Create new organizations within your tenant
- Create users within your tenant
- Manage existing organizations in your tenant

---

## Permission Matrix

| User Role      | Can Create Tenants? | Can Create Organizations? | Scope                          |
|----------------|---------------------|---------------------------|--------------------------------|
| Master Admin   | ✅ Yes              | ✅ Yes (any tenant)       | All tenants/orgs               |
| Tenant Admin   | ❌ No               | ✅ Yes (own tenant only)  | Organizations in their tenant  |
| Org Admin      | ❌ No               | ❌ No                     | Users in their org only        |
| Regular User   | ❌ No               | ❌ No                     | No admin access                |

---

## Workflow Examples

### Example 1: Onboarding a New Partner Company

**Scenario**: You're a Master Admin and want to onboard "XYZ Consulting" as a new partner.

**Steps**:
1. Open Admin Dashboard → Users tab
2. Click "Add User"
3. Fill in: Name="Partner Admin", Email="admin@xyzconsulting.com", Password="..."
4. Select: "Tenant Admin"
5. Click: "Create New Tenant" tab
6. Fill in: Tenant Name="XYZ Consulting LLC", Domain="xyzconsulting.com"
7. Click "Create User"

**Result**: XYZ Consulting tenant created with an admin who can now create organizations and users.

---

### Example 2: Adding a Client Organization

**Scenario**: You're a Tenant Admin and want to add a new client "Acme Corp".

**Steps**:
1. Open Admin Dashboard → Users tab
2. Click "Add User"
3. Fill in: Name="Acme Admin", Email="admin@acme.com", Password="..."
4. Select: "Organization Admin"
5. Click: "Create New Organization" tab
6. Fill in: Name="Acme Corporation", Company="Acme Corp", Domain="acme.com"
7. Click "Create User"

**Result**: Acme Corp organization created under your tenant with an admin who can manage users.

---

### Example 3: Adding Multiple Users to New Organization

**Scenario**: You want to create a new organization and add several users to it.

**Steps**:
1. Create the organization admin user (follow Example 2)
2. Wait for confirmation
3. Click "Add User" again
4. Fill in new user details
5. Select: "Regular User (No Admin Rights)"
6. Select: The newly created organization from dropdown
7. Click "Create User"
8. Repeat for additional users

**Result**: New organization with one admin and multiple regular users.

---

## Troubleshooting

### Problem: "Please select a tenant" Error

**When**: Creating organization admin with new organization

**Cause**: 
- If you're a Master Admin: You forgot to select which tenant the org belongs to
- If you're a Tenant Admin: Your user account doesn't have a tenantId assigned

**Solution**:
- Master Admin: Select a tenant from the dropdown in the "Create New Organization" form
- Tenant Admin: Contact your system admin to verify your account

---

### Problem: "Please enter a valid domain" Error

**When**: Trying to create tenant or organization

**Cause**: Domain format is invalid

**Valid Formats**:
- ✅ `company.com`
- ✅ `acme-corp.com`
- ✅ `xyz123.consulting`
- ❌ `www.company.com` (no www)
- ❌ `http://company.com` (no protocol)
- ❌ `company` (must have TLD)

**Solution**: Use format: `domain.tld` (e.g., `acme.com`)

---

### Problem: Organization Not Showing Up After Creation

**Cause**: Page hasn't refreshed

**Solution**:
- The list should auto-refresh
- If not, manually refresh the page
- Check the Organizations tab to verify creation

---

## Need Help?

If you're still having trouble:

1. **Check Browser Console**: Press F12 and look for errors
2. **Try Different Browser**: Test in Chrome/Firefox/Safari
3. **Clear Cache**: Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Verify Permissions**: Ensure your user role has the required permissions
5. **Review Docs**: See `/DIALOG_TROUBLESHOOTING.md` for detailed diagnostics

---

## Summary

✅ To create **New Organization** + User:
   - Select "Organization Admin"
   - Click "Create New Organization" tab
   - Fill in org details
   
✅ To create **New Tenant** + User (Master Admin only):
   - Select "Tenant Admin"
   - Click "Create New Tenant" tab
   - Fill in tenant details

✅ To create **Regular User** in existing org:
   - Select "Regular User (No Admin Rights)"
   - Choose organization from dropdown

The key is understanding that the tabs appear AFTER you select the admin type!
