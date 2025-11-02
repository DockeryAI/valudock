# Global Admin - System Architecture & Behavior

## Overview
The Global Admin (master_admin) exists **outside** the tenant/organization hierarchy and has unrestricted access to all entities in the system without needing to be assigned to any specific tenant or organization.

## Core Concept

### Traditional Admin Hierarchy
```
❌ OLD APPROACH (incorrect):
Tenant A
  ├── Tenant Admin (must belong to Tenant A)
  └── Organization 1
      └── Org Admin (must belong to Org 1)
```

### ValueDock® Global Admin Approach
```
✅ CORRECT APPROACH:
🌐 Global Admin (admin@dockery.ai)
   ├── tenantId: null
   ├── organizationId: null
   └── Access: ALL tenants, orgs, and users

Tenant A
  ├── Tenant Admin (belongs to Tenant A)
  └── Organization 1
      └── Org Admin (belongs to Org 1)

Tenant B
  ├── Tenant Admin (belongs to Tenant B)
  └── Organization 2
      └── Org Admin (belongs to Org 2)
```

## Global Admin Credentials

### Default Account
- **Email**: `admin@dockery.ai`
- **Password**: `admin123` (change in production!)
- **Role**: `master_admin`
- **Tenant ID**: `null` (not assigned to any tenant)
- **Organization ID**: `null` (not assigned to any org)

### How It's Created
The global admin is created during system initialization via the `/init` endpoint:

```typescript
// Backend initialization
const masterProfile = {
  id: data.user.id,
  email: 'admin@dockery.ai',
  name: 'Global Admin',
  role: 'master_admin',
  tenantId: null,  // ← No tenant assignment
  organizationId: null,  // ← No organization assignment
  createdAt: new Date().toISOString(),
  active: true
};
```

## Access Control

### What Global Admin Can Do

#### ✅ Full System Access
- **View all tenants** across the entire system
- **View all organizations** across all tenants
- **View all users** regardless of tenant/org
- **Create/edit/delete** any tenant
- **Create/edit/delete** any organization
- **Create/edit/delete** any user

#### ✅ Context Switching
- Switch to view any tenant's data
- Switch to view any organization's data
- View aggregate data across all tenants
- No restrictions on navigation

#### ✅ Administrative Tasks
- Initialize the system
- Create the first tenant
- Create the first organizations
- Assign tenant and organization admins
- Manage white-label settings for any tenant
- Clear all system data (with confirmation)

### Permission Checks

The system validates global admin access as follows:

```typescript
// Frontend check
if (hasRole(userProfile, ['master_admin'])) {
  // Grant full access
}

// Backend check
if (profile.role === 'master_admin') {
  // No tenant/org filtering required
  // Allow access to all data
}
```

## Data Filtering Behavior

### Global Admin Data Access

#### Tenants
```typescript
// Global admin sees ALL tenants
const availableTenants = isMasterAdmin 
  ? tenants  // ← No filtering
  : tenants.filter(t => t.id === currentUser.tenantId);
```

#### Organizations
```typescript
// Global admin sees ALL organizations (optionally filtered by selected tenant)
const availableOrgs = isMasterAdmin
  ? (selectedTenantId 
      ? organizations.filter(org => org.tenantId === selectedTenantId) 
      : organizations)  // ← All orgs
  : organizations.filter(org => org.tenantId === currentUser.tenantId);
```

#### Users
```typescript
// Global admin sees ALL users
// Backend handles filtering based on role
```

### Backend Filtering

The backend **does NOT filter** data for global admins:

```typescript
// Example: Get organizations endpoint
app.get("/admin/organizations", async (c) => {
  const profile = await kv.get(`user:${user.id}`);
  
  if (profile.role === 'master_admin') {
    // Return ALL organizations
    return c.json({ organizations: allOrgs });
  } else if (profile.role === 'tenant_admin') {
    // Return only organizations in their tenant
    return c.json({ 
      organizations: allOrgs.filter(o => o.tenantId === profile.tenantId) 
    });
  }
  // ... etc
});
```

## Context Switcher Behavior

### Global Admin in Context Switcher

The TenantOrgContextSwitcher component provides special behavior for global admins:

#### Display Options
1. **All Tenants** (default view)
   - Shows all tenants in the system
   - Welcome message: "Welcome, Global Admin"

2. **Specific Tenant** (filtered view)
   - Shows only organizations in that tenant
   - Welcome message: "Viewing: [Tenant Name]"

3. **Specific Organization** (focused view)
   - Shows that organization's details
   - Welcome message: "Viewing: [Organization Name]"

#### Navigation Flow
```
Global Admin opens context switcher
  ↓
Option A: Select "All Tenants" → See all tenants
Option B: Select a specific tenant → See that tenant's orgs
Option C: Select a specific org → See that org's data
  ↓
Selection persists via localStorage
  ↓
Admin can switch anytime
```

### Visual Indicators
- **Icon**: 🌐 Globe icon (indicates system-wide access)
- **Badge**: None shown (not restricted to any entity)
- **Welcome Message**: Updates based on selected context

## Creating Entities as Global Admin

### Creating a Tenant

Global admin is the **only role** that can create tenants:

```typescript
// AdminDashboard.tsx
{currentUser.role === 'master_admin' && (
  <Button onClick={() => setShowNewTenantDialog(true)}>
    Add Tenant
  </Button>
)}
```

**Steps**:
1. Click "Add Tenant" in Admin Dashboard
2. Fill in tenant details (name, domain, branding)
3. Optionally assign a tenant admin:
   - **Option A**: Select existing user
   - **Option B**: Create new tenant admin
   - **Option C**: Skip (assign later)
4. Submit

**Result**: New tenant is created, global admin can now create organizations under it.

### Creating an Organization

Global admin can create organizations under **any tenant**:

```typescript
// Must select a tenant
const [newOrg, setNewOrg] = useState({
  name: '',
  companyName: '',
  domain: '',
  tenantId: '', // ← Global admin must select
  description: ''
});
```

**Steps**:
1. Click "Add Organization" in Admin Dashboard
2. Fill in organization details
3. **Select tenant** from dropdown
4. Optionally assign an organization admin
5. Submit

**Result**: New organization is created under the selected tenant.

### Creating a User

Global admin can create users in **any organization**:

#### Creating Regular Users
```typescript
// Must select tenant and organization
const userToCreate = {
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  role: 'user',
  tenantId: 'selected-tenant-id',  // ← Required
  organizationId: 'selected-org-id'  // ← Required
};
```

#### Creating Another Global Admin
```typescript
// No tenant/org required for global admin
const globalAdminToCreate = {
  email: 'admin2@example.com',
  password: 'password123',
  name: 'Second Global Admin',
  role: 'master_admin',
  tenantId: null,  // ← Automatically set to null
  organizationId: null  // ← Automatically set to null
};
```

**Validation Logic**:
```typescript
// In handleCreateUser
if (currentUser.role === 'master_admin' && 
    !userToCreate.tenantId && 
    userToCreate.role !== 'master_admin') {
  // Error: Must select tenant (unless creating another global admin)
}
```

## Comparison: Global Admin vs Other Roles

| Feature | Global Admin | Tenant Admin | Org Admin | User |
|---------|-------------|--------------|-----------|------|
| **Tenant ID** | `null` | Assigned | Assigned | Assigned |
| **Org ID** | `null` | `null` or assigned | Assigned | Assigned |
| **View All Tenants** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Create Tenants** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Create Orgs** | ✅ Any tenant | ✅ Own tenant | ❌ No | ❌ No |
| **Create Users** | ✅ Any org | ✅ Own tenant | ✅ Own org | ❌ No |
| **Switch Context** | ✅ Yes | ✅ Within tenant | ❌ No | ❌ No |
| **Delete Any Entity** | ✅ Yes | ⚠️ Own tenant only | ⚠️ Own org only | ❌ No |

## Database Schema

### User Record for Global Admin
```json
{
  "id": "uuid-here",
  "email": "admin@dockery.ai",
  "name": "Global Admin",
  "role": "master_admin",
  "tenantId": null,  // ← Key difference
  "organizationId": null,  // ← Key difference
  "groupIds": [],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "active": true
}
```

### User Record for Tenant Admin
```json
{
  "id": "uuid-here",
  "email": "admin@acme.com",
  "name": "Acme Admin",
  "role": "tenant_admin",
  "tenantId": "tenant-acme-uuid",  // ← Assigned
  "organizationId": null,
  "groupIds": [],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "active": true
}
```

## Security Considerations

### Best Practices

#### ✅ DO
- Change default global admin password immediately
- Create a unique, strong password for production
- Limit the number of global admins (ideally 1-2)
- Use global admin only for system-level tasks
- Create tenant/org admins for day-to-day management
- Regularly audit global admin activity

#### ❌ DON'T
- Share global admin credentials
- Use global admin for regular tasks
- Assign global admin to a tenant (defeats the purpose)
- Delete the last global admin
- Use weak passwords for global admin

### Password Security

**Development**:
```typescript
// Current (for development/testing)
email: 'admin@dockery.ai'
password: 'admin123'
```

**Production**:
```typescript
// Recommended for production
email: 'admin@yourcompany.com'
password: 'Complex!Pass@123$%^&*()_+SecureRandom'
```

### Access Logging (Future Enhancement)

Consider implementing audit logs for global admin actions:

```typescript
// Example audit log entry
{
  userId: 'global-admin-id',
  action: 'delete_tenant',
  targetId: 'tenant-xyz',
  timestamp: '2025-01-01T12:00:00.000Z',
  details: { tenantName: 'Acme Corp' }
}
```

## Frontend Implementation

### App.tsx - Welcome Message
```typescript
const getWelcomeMessage = () => {
  if (!userProfile) return 'Welcome';
  
  // Show selected context
  const selectedTenant = allTenants.find(t => t.id === selectedContextTenantId);
  const selectedOrg = allOrganizations.find(o => o.id === selectedContextOrgId);
  
  if (selectedOrg && hasRole(userProfile, ['master_admin', 'tenant_admin'])) {
    return `Viewing: ${selectedOrg.name}`;
  }
  if (selectedTenant && hasRole(userProfile, ['master_admin'])) {
    return `Viewing: ${selectedTenant.name}`;
  }
  
  // Default for global admin (no context selected)
  if (userProfile.role === 'master_admin') {
    return 'Welcome, Global Admin';  // ← Shows when no tenant/org selected
  }
  
  // ... other roles
};
```

### AdminDashboard.tsx - Tenant Selector
```typescript
// Tenant selector only shown to global admin
{currentUser.role === 'master_admin' && (
  <Select
    value={newOrg.tenantId}
    onValueChange={(value) => setNewOrg({ ...newOrg, tenantId: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select tenant" />
    </SelectTrigger>
    <SelectContent>
      {tenants.map((tenant) => (
        <SelectItem key={tenant.id} value={tenant.id}>
          {tenant.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}

// Tenant admins see their tenant only (read-only)
{currentUser.role === 'tenant_admin' && currentUser.tenantId && (
  <div className="p-2 bg-muted rounded-md">
    <span className="text-sm">
      Tenant: {tenants.find(t => t.id === currentUser.tenantId)?.name}
    </span>
  </div>
)}
```

## Backend Implementation

### Initialization Endpoint

```typescript
app.post("/make-server-888f4514/init", async (c) => {
  const masterAdminEmail = 'admin@dockery.ai';
  const masterAdminPassword = 'admin123';
  
  // Create global admin with NO tenant/org
  const masterProfile = {
    id: data.user.id,
    email: masterAdminEmail,
    name: 'Global Admin',
    role: 'master_admin',
    tenantId: null,  // ← Critical
    organizationId: null,  // ← Critical
    createdAt: new Date().toISOString(),
    active: true
  };
  
  await kv.set(`user:${data.user.id}`, masterProfile);
  await kv.set(`user:email:${masterAdminEmail}`, data.user.id);
  
  return c.json({ success: true });
});
```

### Signup Endpoint

```typescript
app.post("/make-server-888f4514/auth/signup", async (c) => {
  const { email, password, name, role, tenantId, organizationId } = requestBody;
  
  // Global admins don't get assigned to tenant/org
  const userProfile = {
    id: data.user.id,
    email,
    name,
    role,
    tenantId: role === 'master_admin' ? null : (tenantId || null),
    organizationId: role === 'master_admin' ? null : (organizationId || null),
    // ... rest
  };
  
  await kv.set(`user:${data.user.id}`, userProfile);
  return c.json({ success: true });
});
```

## Common Scenarios

### Scenario 1: Initial System Setup

**Goal**: Set up ValueDock® from scratch

**Steps**:
1. System initializes → Global admin created automatically
2. Global admin logs in: `admin@dockery.ai` / `admin123`
3. Global admin creates first tenant: "Acme Reseller"
4. Global admin creates organization under Acme: "Acme Corp"
5. Global admin creates tenant admin for Acme Reseller
6. Global admin creates org admin for Acme Corp
7. Tenant admin takes over day-to-day Acme management
8. Global admin moves on to create next tenant

### Scenario 2: Emergency Access

**Goal**: Troubleshoot issue in a specific organization

**Steps**:
1. Support ticket received about "XYZ Manufacturing"
2. Global admin logs in
3. Uses context switcher to navigate to "XYZ Manufacturing"
4. Reviews organization data
5. Identifies and fixes issue
6. Switches back to global view

### Scenario 3: Cross-Tenant Analytics

**Goal**: Generate report across all tenants

**Steps**:
1. Global admin logs in
2. Selects "All Tenants" in context switcher
3. Admin dashboard shows aggregate data
4. Global admin analyzes cross-tenant metrics
5. Makes strategic decisions

## Testing the Global Admin

### Test Checklist

#### ✅ Account Creation
- [ ] Global admin created during initialization
- [ ] Email: `admin@dockery.ai`
- [ ] Password: `admin123`
- [ ] Role: `master_admin`
- [ ] Tenant ID: `null`
- [ ] Organization ID: `null`

#### ✅ Login & Access
- [ ] Can log in successfully
- [ ] Welcome message: "Welcome, Global Admin"
- [ ] Context switcher shows "All Tenants" option
- [ ] Can view Admin Dashboard
- [ ] Can access all screens

#### ✅ Tenant Management
- [ ] Can create tenants
- [ ] Can edit any tenant
- [ ] Can delete any tenant
- [ ] Can view all tenants

#### ✅ Organization Management
- [ ] Can create orgs in any tenant
- [ ] Can edit any organization
- [ ] Can delete any organization
- [ ] Can view all organizations

#### ✅ User Management
- [ ] Can create users in any org
- [ ] Can create tenant admins
- [ ] Can create org admins
- [ ] Can create other global admins
- [ ] Can edit any user
- [ ] Can delete any user

#### ✅ Context Switching
- [ ] Can select "All Tenants"
- [ ] Can select specific tenant
- [ ] Can select specific organization
- [ ] Selection persists after refresh
- [ ] Welcome message updates correctly

#### ✅ Permissions
- [ ] Has no tenant-based restrictions
- [ ] Has no org-based restrictions
- [ ] Can access all data
- [ ] Backend doesn't filter data

## Troubleshooting

### Issue: Global Admin Can't Create Tenant

**Symptom**: "Add Tenant" button not visible

**Cause**: User is not truly a global admin

**Solution**:
1. Check user profile: `role` should be `master_admin`
2. Check backend: Verify role in KV store
3. Re-initialize if needed: Call `/init` endpoint

### Issue: Global Admin Assigned to Tenant

**Symptom**: Global admin appears under a tenant in user list

**Cause**: `tenantId` is not `null`

**Solution**:
1. Update user profile in KV store
2. Set `tenantId` to `null`
3. Set `organizationId` to `null`
4. Refresh user session

### Issue: Can't Create Organization

**Symptom**: "Please select a tenant" error

**Cause**: No tenant selected in the form

**Solution**:
1. Global admins must explicitly select a tenant
2. Choose tenant from dropdown
3. Then submit the form

### Issue: Context Switcher Not Showing

**Symptom**: No context switcher in header

**Cause**: User is not master_admin or tenant_admin

**Solution**:
1. Verify user role
2. Only master_admin and tenant_admin see the switcher
3. Org admins and users see read-only display

## Summary

The Global Admin in ValueDock® is a **superuser** that exists outside the tenant/organization hierarchy. Key characteristics:

- **Email**: `admin@dockery.ai`
- **Role**: `master_admin`
- **Tenant**: `null` (no tenant assignment)
- **Organization**: `null` (no org assignment)
- **Access**: All tenants, orgs, and users
- **Context**: Can switch to view any entity
- **Purpose**: System-level administration and setup

This design provides maximum flexibility for multi-tenant management while maintaining clear security boundaries for other admin roles.
