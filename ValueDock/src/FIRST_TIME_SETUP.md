# ValueDock® - First Time Setup Guide

## Welcome to ValueDock®!

This guide will walk you through setting up your ValueDock® system for the first time.

---

## Step 1: System Initialization

When you first access ValueDock®, the system needs to be initialized with a global administrator account.

### How to Initialize

**The system should automatically initialize on first access.** If not, you may need to call the initialization endpoint manually.

### What Gets Created

During initialization, the system creates:

- **Global Admin Account**
  - Email: `admin@dockery.ai`
  - Password: `admin123`
  - Role: Global Administrator (master_admin)
  - Access: Full system access

⚠️ **IMPORTANT**: Change this password immediately after first login in a production environment!

---

## Step 2: First Login

1. Open ValueDock® in your browser
2. You'll see the login screen
3. Enter the credentials:
   - **Email**: `admin@dockery.ai`
   - **Password**: `admin123`
4. Click **Sign In**

You should now see:
- Welcome message: "Welcome, Global Admin"
- Full access to all features
- Admin Dashboard available in the menu

---

## Step 3: Create Your First Tenant

A **tenant** represents a reseller partner, consulting firm, MSP, or any organization that will have multiple client organizations.

### Example Tenants
- "Acme Consulting" (consulting firm)
- "CloudCorp MSP" (managed service provider)
- "Beta Partners" (reseller)

### How to Create a Tenant

1. Click the **menu icon** (☰) in the top right
2. Select **Admin**
3. Click the **Tenants** tab
4. Click **Add Tenant** button

5. Fill in the tenant information:
   - **Tenant Name**: e.g., "Acme Consulting"
   - **Domain**: e.g., "acmeconsulting.com"
   - **Brand Name** (optional): e.g., "Acme ValueDock"
   - **Primary Color** (optional): Choose a brand color
   - **Logo URL** (optional): Link to logo image

6. **Assign Tenant Admin** (recommended):
   
   **Option A - Create New Admin User**:
   - Select "Create new user"
   - Fill in:
     - Name: "Jane Smith"
     - Email: "jane@acmeconsulting.com"
     - Password: "securepassword123"
   
   **Option B - Select Existing User**:
   - Select "Select existing user"
   - Choose from dropdown
   
   **Option C - Skip**:
   - Select "No admin assigned yet"
   - You can assign later

7. Click **Create Tenant**

✅ **Success!** Your first tenant is created.

---

## Step 4: Create Organizations

An **organization** represents a client company or department that will use ValueDock®.

### Example Organizations
- "Acme Corporation" (manufacturing company)
- "Beta Industries" (logistics company)
- "Gamma LLC" (finance company)

### How to Create an Organization

1. In **Admin Dashboard**, click the **Organizations** tab
2. Click **Add Organization** button

3. Fill in the organization information:
   - **Short Name**: e.g., "acme-corp" (used in URLs)
   - **Company Name**: e.g., "Acme Corporation"
   - **Domain**: e.g., "acmecorp.com"
   - **Tenant**: Select "Acme Consulting" (from dropdown)
   - **Description** (optional): "Manufacturing client"

4. **Assign Organization Admin** (recommended):
   
   **Option A - Create New Admin User**:
   - Select "Create new user"
   - Fill in:
     - Name: "John Doe"
     - Email: "john@acmecorp.com"
     - Password: "securepassword123"
   
   **Option B - Select Existing User**:
   - Select "Select existing user"
   - Choose from dropdown
   
   **Option C - Skip**:
   - Select "No admin assigned yet"
   - You can assign later

5. Click **Create Organization**

✅ **Success!** Your first organization is created.

---

## Step 5: Create Users

**Users** are individual people who will use the ROI calculator within an organization.

### User Roles

- **master_admin** (Global Admin): Full system access
- **tenant_admin** (Tenant Admin): Manage all orgs within their tenant
- **org_admin** (Organization Admin): Manage users within their org
- **user** (Regular User): Use the ROI calculator

### How to Create a User

1. In **Admin Dashboard**, click the **Users** tab
2. Click **Add User** button

3. Fill in the user information:
   - **Full Name**: e.g., "Alice Johnson"
   - **Email**: e.g., "alice@acmecorp.com"
   - **Password**: e.g., "userpassword123"
   - **Role**: Select "Regular User"
   - **Tenant**: Select "Acme Consulting"
   - **Organization**: Select "Acme Corporation"
   - **Group** (optional): For organizing users

4. Click **Create User**

✅ **Success!** The user can now log in and use ValueDock®.

---

## Step 6: Understanding the Hierarchy

Your system now has a complete hierarchy:

```
🌐 Global Admin (admin@dockery.ai)
   └── You have access to everything below
   
🏢 Tenant: Acme Consulting
   ├── Tenant Admin: jane@acmeconsulting.com
   └── Organization: Acme Corporation
       ├── Organization Admin: john@acmecorp.com
       └── Users:
           └── alice@acmecorp.com (Regular User)
```

---

## Step 7: Using the Context Switcher (For Admins)

As the global admin, you can switch between different tenants and organizations to manage them.

### How to Switch Context

**Desktop**:
1. Look for the **context switcher** in the header (between logo and menu)
2. Click the dropdown
3. Select a tenant or organization
4. Your view updates to show only that entity's data

**Mobile**:
1. Tap the **menu icon** (☰)
2. Context switcher appears at the top
3. Select your desired tenant/organization

### Context Options

- **All Tenants**: See everything across all tenants
- **Specific Tenant**: See all organizations within that tenant
- **Specific Organization**: See that organization's data only

---

## Step 8: Testing the Setup

Let's verify everything works:

### Test 1: Login as Different Users

1. **Log out** from global admin
2. **Log in as tenant admin**: `jane@acmeconsulting.com`
   - ✅ Should see organizations in Acme Consulting only
   - ✅ Should be able to create new organizations
   - ✅ Should be able to manage users

3. **Log in as org admin**: `john@acmecorp.com`
   - ✅ Should see Acme Corporation only
   - ✅ Should be able to create users in Acme Corp
   - ✅ Should be able to use the ROI calculator

4. **Log in as regular user**: `alice@acmecorp.com`
   - ✅ Should see ROI calculator
   - ✅ Should NOT see Admin Dashboard
   - ✅ Should be able to create processes

### Test 2: Create a Process

1. Log in as a user
2. Go to **Inputs** screen
3. Click **Add Process**
4. Fill in process details
5. Click **Save**
6. ✅ Process should appear in the table

### Test 3: View ROI Results

1. After creating processes, go to **Results** screen
2. ✅ Should see calculated ROI metrics
3. ✅ Should see charts and graphs
4. ✅ Should see savings breakdown

---

## Common First-Time Setup Scenarios

### Scenario A: Single Organization (Simple)

**Use Case**: You're a single company using ValueDock® internally.

**Setup**:
1. Create one tenant (your company)
2. Create one organization (your company or department)
3. Create users for your team

**Example**:
- Tenant: "Acme Corp"
- Organization: "Acme IT Department"
- Users: Your team members

### Scenario B: Consulting Firm (Medium)

**Use Case**: You're a consulting firm with multiple clients.

**Setup**:
1. Create one tenant (your consulting firm)
2. Create multiple organizations (one per client)
3. Create users for each client org

**Example**:
- Tenant: "Acme Consulting"
- Organizations: "Client A", "Client B", "Client C"
- Users: People at each client company

### Scenario C: MSP/Reseller (Complex)

**Use Case**: You're an MSP or reseller managing multiple partners, each with their own clients.

**Setup**:
1. Create multiple tenants (one per partner)
2. Create multiple organizations per tenant (partner's clients)
3. Create users for each organization

**Example**:
- Tenant 1: "Partner A" → Orgs: "Client A1", "Client A2"
- Tenant 2: "Partner B" → Orgs: "Client B1", "Client B2"
- Users: People at each client

---

## Security Best Practices

### ✅ Immediately After Setup

1. **Change global admin password**
   - Go to Admin Dashboard > Users
   - Edit the admin@dockery.ai user
   - Set a strong, unique password

2. **Create unique admin accounts**
   - Don't share the global admin account
   - Create separate tenant/org admins
   - Give each person their own account

3. **Use strong passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No common words or patterns

4. **Limit admin accounts**
   - Only give admin access to those who need it
   - Most users should be "Regular User" role
   - Review admin list regularly

### ⚠️ Production Recommendations

- **Change default credentials immediately**
- **Use HTTPS only** (handled by deployment platform)
- **Enable MFA** (future enhancement)
- **Regular backups** (handled by Supabase)
- **Audit logs** (future enhancement)
- **Access reviews** (quarterly recommended)

---

## Next Steps

After completing this setup, you can:

### For Admins
- ✅ Create more tenants, organizations, and users
- ✅ Configure white-label branding
- ✅ Manage permissions
- ✅ Use context switcher to navigate

### For Users
- ✅ Create processes in the Inputs screen
- ✅ Configure implementation timeline
- ✅ View ROI calculations in Results screen
- ✅ Export data and share with stakeholders
- ✅ Use Presentation screen for client meetings

### Advanced Features
- 📊 Scenario analysis (compare multiple options)
- 📅 Timeline planning (rollout schedule)
- 📈 Advanced metrics (NPV, IRR, Payback Period)
- 🎨 White-label customization (branding per tenant)
- 💾 Snapshots (save/restore configurations)

---

## Troubleshooting First-Time Setup

### Issue: Can't Log In

**Problem**: "Invalid credentials" error

**Solutions**:
- Verify email: `admin@dockery.ai` (exactly)
- Verify password: `admin123` (case-sensitive)
- Check if initialization ran (should happen automatically)
- Try calling `/init` endpoint manually if needed

### Issue: "Add Tenant" Button Missing

**Problem**: Can't create tenants

**Solutions**:
- Verify you're logged in as global admin
- Check role is `master_admin`
- Refresh the page
- Log out and log back in

### Issue: Can't Select Tenant for Organization

**Problem**: Tenant dropdown is empty

**Solutions**:
- Create a tenant first
- Refresh the page to reload tenants
- Check that you're a global admin (only they can create tenants)

### Issue: Context Switcher Not Showing

**Problem**: Can't switch between tenants/orgs

**Solutions**:
- Only master_admin and tenant_admin see the switcher
- Org admins and users see read-only display
- Check your role in Admin Dashboard > Users

---

## Getting Help

### Documentation
- **Quick Reference**: `/QUICK_REFERENCE.md`
- **Global Admin Guide**: `/GLOBAL_ADMIN_DOCUMENTATION.md`
- **Full Implementation**: `/IMPLEMENTATION_SUMMARY.md`

### In-App Help
- Menu > Documentation (embedded viewer)
- Tooltips throughout the interface
- Error messages explain what to fix

### Support
- Contact your system administrator
- If you're the admin, review documentation
- Check troubleshooting sections

---

## Congratulations! 🎉

You've successfully set up ValueDock®!

Your system is now ready for users to:
- Calculate ROI for automation projects
- Analyze multiple scenarios
- Export professional reports
- Present findings to stakeholders

**What's Next?**
- Invite your team to start using the calculator
- Customize white-label branding for your tenants
- Explore advanced features like scenario analysis
- Set up regular data backups

Welcome to ValueDock® - your comprehensive ROI calculator platform!
