# Test Scenarios - Admin User Assignment

## Scenario 1: Create Tenant with New Admin User
1. Navigate to Admin Dashboard → Tenants tab
2. Click "Add Tenant"
3. Fill in:
   - Name: "Acme Reseller"
   - Domain: "acmereseller.com"
   - Brand Name: "Acme ValueDock"
4. In Admin User section:
   - Select "Create New" tab
   - Fill in:
     - Full Name: "Jane Admin"
     - Email: "jane@acmereseller.com"
     - Password: "SecurePass123!"
5. Click "Create Tenant"
6. **Expected Result:**
   - Toast: "✅ Tenant 'Acme Reseller' created successfully!"
   - Toast: "👤 Creating tenant admin user..."
   - Toast: "✅ Tenant admin 'jane@acmereseller.com' created!"
   - Toast: "🔄 Reloading data..."
   - Toast: "✅ Data refreshed!"
   - Dialog closes
   - Tenant appears in table
   - New user "Jane Admin" appears in Users tab with "Tenant Admin" badge

## Scenario 2: Create Tenant with Existing User
1. Navigate to Admin Dashboard → Tenants tab
2. Click "Add Tenant"
3. Fill in tenant details:
   - Name: "Beta Partners"
   - Domain: "betapartners.com"
4. In Admin User section:
   - Select "Select Existing" tab
   - Choose existing user from dropdown
5. Click "Create Tenant"
6. **Expected Result:**
   - Tenant created successfully
   - Selected user's role updated to "tenant_admin"
   - User's tenantId updated
   - User shows in Users tab with updated role

## Scenario 3: Create Tenant Without Admin
1. Navigate to Admin Dashboard → Tenants tab
2. Click "Add Tenant"
3. Fill in tenant details
4. In Admin User section:
   - Select "Select Existing" tab
   - Choose "No admin (assign later)"
5. Click "Create Tenant"
6. **Expected Result:**
   - Tenant created successfully
   - No admin user assigned
   - Can assign admin later through user management

## Scenario 4: Create Organization with New Admin
1. Navigate to Admin Dashboard → Organizations tab
2. Click "Add Organization"
3. Fill in:
   - Short Name: "acme-corp"
   - Company Name: "Acme Corporation"
   - Domain: "acme.com"
   - Tenant: Select from dropdown
4. In Admin User section:
   - Select "Create New" tab
   - Fill in:
     - Full Name: "John OrgAdmin"
     - Email: "john@acme.com"
     - Password: "OrgPass123!"
5. Click "Create Organization"
6. **Expected Result:**
   - Organization created
   - New user created with "org_admin" role
   - User assigned to organization and tenant
   - User appears in Users tab

## Scenario 5: Create Organization with Existing User
1. Navigate to Admin Dashboard → Organizations tab  
2. Click "Add Organization"
3. Fill in organization details
4. Select tenant that has existing users
5. In Admin User section:
   - Select "Select Existing" tab
   - Dropdown shows users from selected tenant
   - Choose a user
6. Click "Create Organization"
7. **Expected Result:**
   - Organization created
   - User promoted to "org_admin"
   - User's organizationId updated
   - User maintains tenantId

## Scenario 6: Dialog State Reset
1. Open "Add Tenant" dialog
2. Fill in some fields
3. In Admin User section, select "Create New" and fill in name
4. Click "Cancel"
5. Re-open "Add Tenant" dialog
6. **Expected Result:**
   - All fields are empty/reset
   - Admin User section is back to default state
   - No stale data from previous attempt

## Scenario 7: Add User Button (Fixed Issue)
1. Navigate to Admin Dashboard → Users tab
2. Click "Add User" button at top
3. **Expected Result:**
   - EnhancedUserDialog opens
   - All fields are accessible
   - Can create user with tenant/org/group selection

## Scenario 8: Mobile Responsiveness
1. Open Admin Dashboard on mobile device (or resize browser to mobile width)
2. Click "Add Tenant"
3. **Expected Result:**
   - Dialog is scrollable
   - All fields are accessible
   - AdminUserSelector component is readable
   - Can complete full tenant creation flow

## Scenario 9: Validation - Missing Fields
1. Open "Add Tenant" dialog
2. Fill in Name but leave Domain empty
3. In Admin User section, select "Create New" and fill in user details
4. Click "Create Tenant"
5. **Expected Result:**
   - Error toast: "Please enter a valid domain name"
   - Dialog stays open
   - User can fix and retry

## Scenario 10: User Filtering
1. Create a tenant "Tenant A"
2. Create organization "Org 1" under "Tenant A"
3. Create user "User 1" in "Org 1"
4. Create tenant "Tenant B"
5. Open "Add Organization" for "Tenant B"
6. Select "Tenant B" as tenant
7. In Admin User section, select "Select Existing"
8. **Expected Result:**
   - Dropdown should NOT show "User 1" (belongs to different tenant)
   - Dropdown should only show users in "Tenant B" or unassigned users

## Success Criteria

✅ All 10 scenarios pass without errors
✅ Toast notifications appear correctly
✅ Data refreshes automatically after creation
✅ Admin users have correct roles and assignments
✅ Dialog states reset properly
✅ Mobile experience is smooth
✅ User filtering works correctly
✅ Add User button works in all admin views
