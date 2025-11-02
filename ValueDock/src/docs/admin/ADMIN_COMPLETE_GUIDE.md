# ValueDock® Admin Panel - Complete Guide

**Last Updated**: January 2025  
**Version**: 1.0.0 (Production Ready)

## Overview

The ValueDock® Admin Panel provides comprehensive management of the multi-tenant system with role-based access control, user management, cost classifications, and system monitoring.

## Table of Contents

1. [Access Levels & Permissions](#access-levels--permissions)
2. [Admin Panel Layout](#admin-panel-layout)
3. [User Management](#user-management)
4. [Tenant & Organization Management](#tenant--organization-management)
5. [Cost Classification System](#cost-classification-system)
6. [Context Switching](#context-switching)
7. [Data Management](#data-management)
8. [Troubleshooting](#troubleshooting)

---

## Access Levels & Permissions

### Master Admin (Global Admin)
**Full System Access**
- ✅ Create/Edit/Delete any tenant
- ✅ Create/Edit/Delete any organization
- ✅ Create/Edit/Delete any user (except other master admins)
- ✅ Assign users to any tenant/organization
- ✅ Access all ROI calculations across all organizations
- ✅ Manage global cost classifications
- ✅ View system-wide analytics

### Tenant Admin
**Tenant-Wide Access**
- ✅ Create/Edit/Delete organizations within their tenant
- ✅ Create/Edit/Delete users within their tenant
- ✅ Assign users to organizations within their tenant
- ✅ Can also be assigned as Org Admin for specific organization
- ✅ Access ROI calculations within their tenant
- ✅ Manage cost classifications for their tenant
- ❌ Cannot access other tenants
- ❌ Cannot modify master admins

### Organization Admin
**Organization-Level Access**
- ✅ Create/Edit/Delete users within their organization
- ✅ Access ROI calculations for their organization
- ✅ Manage groups within their organization
- ✅ View organization analytics
- ❌ Cannot access other organizations
- ❌ Cannot create/delete organizations
- ❌ Cannot manage tenant-level settings

### User
**Organization ROI Access**
- ✅ Create/Edit/Delete ROI calculations in their organization
- ✅ View their own profile
- ✅ Access groups they're assigned to
- ❌ No admin panel access
- ❌ Cannot manage users
- ❌ Cannot access other organizations

---

## Admin Panel Layout

### Main Navigation Tabs

1. **Users** - User management tree with hierarchy view
2. **Tenants** - Tenant creation and management
3. **Organizations** - Organization creation and management
4. **Cost Classifications** - Cost category management
5. **System Info** - System diagnostics and monitoring

### Mobile vs Desktop Views

**Desktop View**
- Hierarchical table layout
- Expandable/collapsible sections
- Inline editing capabilities
- Bulk selection and operations

**Mobile View**
- Card-based layout
- Touch-friendly interactions
- Optimized for smaller screens
- No horizontal scrolling

---

## User Management

### Creating a New User

**Desktop:**
1. Click **Admin Panel** button (top-right)
2. Navigate to **Users** tab
3. Click **Add User** button
4. Fill in user details:
   - Name (required)
   - Email (required, must be valid format)
   - Password (min 8 characters)
   - Role (Master Admin, Tenant Admin, Org Admin, User)
   - Tenant assignment (if applicable)
   - Organization assignment (if applicable)
5. Click **Create User**

**Mobile:**
1. Tap **Admin Panel** icon
2. Tap **Users** tab
3. Tap **Add** button
4. Complete form in card view
5. Tap **Create User**

### User Hierarchy Display

```
System Administrators (Master Admins)
└── Tenant: Acme Corp
    ├── Tenant Admins
    │   └── John Doe (also Org Admin for Finance)
    └── Organization: Finance Dept
        ├── Org Admins
        │   └── Jane Smith
        └── Users
            ├── Bob Johnson
            └── Alice Williams
```

### Editing Users

1. Locate user in hierarchy
2. Click/Tap **Edit** (pencil icon)
3. Modify desired fields
4. **Save Changes**

**Editable Fields:**
- Name
- Email
- Password (optional)
- Role
- Tenant assignment
- Organization assignment
- Groups

### Deleting Users

**Single User:**
1. Select user checkbox
2. Click **Delete** (trash icon)
3. Confirm deletion in dialog

**Bulk Delete:**
1. Select multiple user checkboxes
2. Click **Delete X** button (appears when users selected)
3. Confirm bulk deletion

**Safety Features:**
- Cannot delete master admins
- Cannot delete yourself
- Confirmation dialog prevents accidental deletion
- Deleted users are removed from all groups

### Assigning Roles

**Master Admin Assignment:**
- Only creatable during initial setup
- Cannot be created through UI after system initialization
- Must have `tenantId: null` and `organizationId: null`

**Tenant Admin Assignment:**
```typescript
{
  role: 'tenant_admin',
  tenantId: 'tenant-uuid',
  organizationId: null (or specific org UUID if dual-role)
}
```

**Organization Admin Assignment:**
```typescript
{
  role: 'org_admin',
  tenantId: 'tenant-uuid',
  organizationId: 'org-uuid'
}
```

**User Assignment:**
```typescript
{
  role: 'user',
  tenantId: 'tenant-uuid',
  organizationId: 'org-uuid'
}
```

---

## Tenant & Organization Management

### Creating a Tenant

1. Navigate to **Tenants** tab
2. Click **Add Tenant**
3. Enter tenant details:
   - Name (required)
   - Description (optional)
4. Click **Create**

**Post-Creation:**
- Automatically creates default organization
- Can now assign tenant admins
- Ready for organization creation

### Creating an Organization

1. Navigate to **Organizations** tab
2. Click **Add Organization**
3. Fill in details:
   - Name (required)
   - Tenant (select from dropdown)
   - Description (optional)
4. Click **Create**

**Post-Creation:**
- Organization receives unique UUID
- Isolated data storage initialized
- Ready for user assignment
- Can create ROI calculations

### Organization Data Isolation

Each organization has:
- **Separate processes** - No cross-org visibility
- **Separate groups** - Independent group structures
- **Separate calculations** - Complete ROI isolation
- **Separate cost data** - Independent cost classifications

---

## Cost Classification System

### Overview

The Cost Classification Manager allows defining categories for organizing and tracking costs within ROI calculations.

### Default Classifications

1. **Hard Costs** - Direct, tangible expenses
   - Software licenses
   - Hardware purchases
   - External services

2. **Soft Costs** - Indirect, intangible expenses
   - Internal labor
   - Opportunity costs
   - Training time

### Creating Custom Classifications

1. Navigate to **Cost Classifications** tab
2. Click **Add Classification**
3. Configure:
   - Name (e.g., "Infrastructure Costs")
   - Color code (for visual differentiation)
   - Description
   - Default assignment rules
4. Click **Save**

### Managing Classifications

**Edit:**
- Click classification name
- Modify properties
- Save changes

**Delete:**
- Click delete icon
- Confirm (only if not in use)

**Reorder:**
- Drag and drop to rearrange
- Order affects display in dropdowns

### Using Classifications in Calculations

When creating/editing processes:
1. Expand **Advanced Metrics**
2. Select **Cost Classification**
3. Choose from available categories
4. Cost automatically categorized in results

### Hard Costs Only NPV

Special toggle in Results screen:
- When enabled: NPV calculation uses only hard costs
- When disabled: NPV uses all costs
- Tooltip explains the difference
- Useful for conservative ROI estimates

---

## Context Switching

### Two-Level Navigation

**Purpose**: Access different organization's ROI data

**Structure:**
```
Tenant Level → Organization Level → ROI Data
```

### How to Switch Context

**For Master Admins:**
1. Click **Global View** menu
2. Select **Tenant** from list
3. Select **Organization** under that tenant
4. ROI data loads for selected organization

**For Tenant Admins:**
1. Click **Global View** menu
2. Select **Organization** (within their tenant)
3. ROI data loads for selected organization

**For Org Admins:**
- Cannot switch organizations
- Fixed to their assigned organization
- No Global View menu visible

**For Users:**
- Cannot switch organizations
- Fixed to their assigned organization
- No Global View menu visible

### Context Indicator

Active context shown in:
- Header breadcrumb: `Tenant Name > Org Name`
- Organization badge on main screens
- Color-coded visual indicators

---

## Data Management

### Auto-Save System

**Client-Side (localStorage):**
- Auto-saves every 30 seconds
- Persists during session
- Cleared on explicit delete

**Server-Side (Supabase):**
- Manual save via **Save** button
- Stored in KV store with org UUID prefix
- Permanent until deleted

### Data Storage Keys

```typescript
// Format: org-{orgId}-{dataType}
org-abc123-calculator-data
org-abc123-implementation
org-abc123-groups
```

### Backup & Restore

**Creating Backup:**
1. Save current data to server
2. Data automatically versioned
3. Timestamp recorded

**Restoring Data:**
1. Open **Restore Backup** dialog
2. Select version/timestamp
3. Confirm restoration
4. Data loaded into calculator

### Bulk Operations

**Delete All Data:**
- Available in Admin Panel → System Info
- Removes all calculation data for organization
- Keeps user/tenant/org structure
- Requires confirmation

---

## Troubleshooting

### Common Issues

#### Users Not Appearing in List
**Cause**: Filter or hierarchy collapse  
**Solution**:
1. Expand tenant/organization sections
2. Check filter settings
3. Refresh data using refresh button

#### Cannot Create User
**Cause**: Missing required fields or invalid email  
**Solution**:
1. Verify email format (must include @)
2. Check password length (min 8 chars)
3. Ensure tenant/org selected (if not master admin)

#### Context Switch Not Working
**Cause**: Permissions or missing organizations  
**Solution**:
1. Verify user has access to multiple orgs
2. Check tenant admin has organizations created
3. Refresh browser if stale data

#### ROI Data Not Saving
**Cause**: Organization context not selected  
**Solution**:
1. Use Global View to select organization
2. Verify org badge appears in header
3. Try manual save via Save button

#### Cost Classifications Not Showing
**Cause**: Not created or tenant-specific  
**Solution**:
1. Create classifications in Admin Panel
2. Verify tenant scope matches
3. Refresh calculator screen

### Debug Mode

Enable debug console:
1. Admin Panel → System Info
2. Toggle **Debug Mode**
3. Console appears with real-time logs
4. Shows API calls, data flow, errors

### Data Reset

**Reset Calculator Data:**
```javascript
// In browser console
localStorage.clear();
window.location.reload();
```

**Reset User Session:**
1. Log out
2. Clear browser cache
3. Log in again

---

## Best Practices

### User Management
- ✅ Use descriptive names
- ✅ Assign users to correct organizations
- ✅ Regularly audit user list
- ✅ Remove inactive users
- ❌ Don't create duplicate accounts
- ❌ Don't share credentials

### Organization Structure
- ✅ Create logical tenant groupings
- ✅ Use clear organization names
- ✅ Document org purposes
- ✅ Review data isolation regularly
- ❌ Don't nest too deeply
- ❌ Don't create unnecessary orgs

### Cost Classifications
- ✅ Use consistent naming
- ✅ Define clear boundaries
- ✅ Document classification rules
- ✅ Review usage patterns
- ❌ Don't create too many categories
- ❌ Don't overlap definitions

### Data Management
- ✅ Save data regularly
- ✅ Test restorations periodically
- ✅ Document backup schedule
- ✅ Monitor storage usage
- ❌ Don't rely only on auto-save
- ❌ Don't delete without confirmation

---

## Quick Reference

### Keyboard Shortcuts (Desktop)

- `Ctrl/Cmd + S` - Save data
- `Ctrl/Cmd + K` - Open command palette
- `Esc` - Close dialogs
- `Tab` - Navigate fields
- `Enter` - Submit forms

### Status Indicators

- 🟢 Green badge - Active/Enabled
- 🔵 Blue badge - Info/Count
- 🟡 Yellow badge - Warning
- 🔴 Red badge - Error/Alert

### Role Badges

- 🛡️ Master Admin - Red shield
- 🏢 Tenant Admin - Blue building
- 👥 Org Admin - Green users
- 👤 User - Gray user icon

---

## Support Resources

- **Quick Start**: See `QUICK_START.md`
- **First Time Setup**: See `FIRST_TIME_SETUP.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **API Documentation**: See `docs/api-contracts.md`
- **Permissions Matrix**: See `docs/permissions-matrix.md`

---

**For additional assistance, refer to the comprehensive documentation in the `/docs` folder.**
