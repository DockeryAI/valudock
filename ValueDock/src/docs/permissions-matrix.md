# ValueDock® Permissions Matrix (RBAC)

## Role Definitions

ValueDock® implements a hierarchical role-based access control (RBAC) system with four distinct roles:

| Role | Internal Name | Display Name | Scope | User Count |
|---|---|---|---|---|
| **Global Administrator** | `master_admin` | Global Admin | Entire system | 1 (default) |
| **Tenant Administrator** | `tenant_admin` | Tenant Admin | Single tenant | Multiple per tenant |
| **Organization Administrator** | `org_admin` | Org Admin | Single organization | Multiple per org |
| **Regular User** | `user` | User | Tenant-scoped | Unlimited |

---

## Permission Matrix

### Legend
- ✅ **Full Access**: Can perform action on all resources
- 🔒 **Scoped Access**: Can perform action only within their scope (tenant/org)
- ❌ **No Access**: Cannot perform this action
- ⚠️ **Restricted**: Can perform with limitations (see notes)

---

## 1. User Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **View all users** | ✅ | 🔒 Tenant only | 🔒 Org only | ❌ |
| **Create user** | ✅ | 🔒 Tenant only | 🔒 Org only | ❌ |
| **Update user profile** | ✅ | 🔒 Tenant only | 🔒 Org only | ⚠️ Own profile |
| **Change user role** | ✅ | ⚠️ No Global Admin | ❌ | ❌ |
| **Delete user** | ✅ | 🔒 Tenant only | 🔒 Org only | ❌ |
| **Deactivate user** | ✅ | 🔒 Tenant only | 🔒 Org only | ❌ |
| **View user details** | ✅ | 🔒 Tenant only | 🔒 Org only | ⚠️ Own profile |

**Notes**:
- Tenant Admin cannot assign `master_admin` role
- Users cannot delete themselves
- Org Admin can only manage users within their organization
- Changing organization requires user to remain in same tenant

**API Endpoints**:
- `GET /admin/users` - List users (filtered by role)
- `POST /auth/signup` - Create user
- `PUT /admin/users/:userId` - Update user
- `DELETE /admin/users/:userId` - Delete user

---

## 2. Tenant Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **View all tenants** | ✅ | ❌ | ❌ | ❌ |
| **View own tenant** | ✅ | ✅ | ✅ | ✅ |
| **Create tenant** | ✅ | ❌ | ❌ | ❌ |
| **Update tenant settings** | ✅ | 🔒 Own tenant | ❌ | ❌ |
| **Delete tenant** | ✅ | ❌ | ❌ | ❌ |
| **Configure white-label** | ✅ | 🔒 Own tenant | ❌ | ❌ |

**White-Label Settings**:
- Brand name
- Primary color
- Logo URL
- Favicon URL

**API Endpoints**:
- `GET /admin/tenants` - List all tenants (Global Admin only)
- `POST /admin/tenants` - Create tenant (Global Admin only)
- `PUT /admin/tenants/:tenantId` - Update settings
- `DELETE /admin/tenants/:tenantId` - Delete tenant (Global Admin only)

---

## 3. Organization Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **View all organizations** | ✅ | 🔒 Tenant only | ❌ | ❌ |
| **View own organization** | ✅ | ✅ | ✅ | ✅ |
| **Create organization** | ✅ | 🔒 Tenant only | ❌ | ❌ |
| **Update organization** | ✅ | 🔒 Tenant only | 🔒 Own org | ❌ |
| **Delete organization** | ✅ | 🔒 Tenant only | ❌ | ❌ |
| **Create sub-organization** | ✅ | 🔒 Tenant only | ❌ | ❌ |

**Notes**:
- Organizations must belong to a tenant
- Parent organization must be in same tenant
- Deleting an organization affects all child orgs

**API Endpoints**:
- `GET /admin/organizations` - List organizations
- `POST /admin/organizations` - Create organization
- `PUT /admin/organizations/:orgId` - Update organization
- `DELETE /admin/organizations/:orgId` - Delete organization

---

## 4. ROI Calculator Features

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **View Inputs screen** | ✅ | ✅ | ✅ | ✅ |
| **Edit inputs** | ✅ | ✅ | ✅ | ✅ |
| **View Results** | ✅ | ✅ | ✅ | ✅ |
| **Run calculations** | ✅ | ✅ | ✅ | ✅ |
| **Create scenarios** | ✅ | ✅ | ✅ | ✅ |
| **Export to PDF** | ✅ | ✅ | ✅ | ✅ |
| **Share via link** | ✅ | ✅ | ✅ | ✅ |
| **View timeline** | ✅ | ✅ | ✅ | ✅ |

**Notes**:
- All authenticated users have full access to calculator features
- Data is stored client-side (no server persistence yet)
- Future: Project-based permissions for saved calculations

---

## 5. Admin Dashboard Access

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **Access Admin tab** | ✅ | ✅ | ✅ | ❌ |
| **View Overview tab** | ✅ | ✅ | ✅ | ❌ |
| **View Users tab** | ✅ | ✅ | ✅ | ❌ |
| **View Tenants tab** | ✅ | ❌ | ❌ | ❌ |
| **View Organizations tab** | ✅ | ✅ | ❌ | ❌ |
| **View White-Label tab** | ✅ | ✅ | ❌ | ❌ |
| **View Documents tab** | ✅ | ✅ | ✅ | ❌ |
| **View Data Dictionary** | ✅ | ✅ | ✅ | ❌ |

---

## 6. System Administration

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| **Initialize system** | ✅ Public | ❌ | ❌ | ❌ |
| **View system logs** | ✅ | ❌ | ❌ | ❌ |
| **View all data** | ✅ | 🔒 Tenant only | 🔒 Org only | 🔒 Own data |
| **Delete any data** | ✅ | 🔒 Tenant only | 🔒 Org only | ❌ |
| **Change own password** | ✅ | ✅ | ✅ | ✅ |

**Special Permissions**:
- Global Admin account (`admin@dockeryai.com`) is created automatically on system initialization
- Default password: `admin123` (⚠️ Must be changed immediately)

---

## Role Hierarchy

```
┌──────────────────────────────────────────┐
│         Global Admin (master_admin)      │
│  • Full system access                    │
│  • Manage all tenants                    │
│  • Create tenant admins                  │
│  • View all data                         │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│       Tenant Admin (tenant_admin)        │
│  • Manage tenant settings                │
│  • Create/manage organizations           │
│  • Create org admins & users             │
│  • Configure white-label branding        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Org Admin (org_admin)            │
│  • Manage own organization users         │
│  • View organization data                │
│  • Edit organization details             │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│              User (user)                 │
│  • Access ROI calculator                 │
│  • Create/edit own calculations          │
│  • Export & share results                │
└──────────────────────────────────────────┘
```

---

## Authorization Logic

### Backend Authorization Check (Server-Side)

```typescript
// Example: Create User endpoint
async function createUser(profile: UserProfile, newUser: UserData) {
  // Check if requester has admin role
  if (!['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
    throw new Error('Only admins can create users');
  }
  
  // Tenant admin can only create users in their tenant
  if (profile.role === 'tenant_admin' && newUser.tenantId !== profile.tenantId) {
    throw new Error('Cannot create users outside your tenant');
  }
  
  // Org admin can only create users in their org
  if (profile.role === 'org_admin' && newUser.organizationId !== profile.organizationId) {
    throw new Error('Cannot create users outside your organization');
  }
  
  // Tenant admin cannot assign master_admin role
  if (profile.role === 'tenant_admin' && newUser.role === 'master_admin') {
    throw new Error('Cannot assign Global Admin role');
  }
  
  // Proceed with user creation
  return await createUserInDatabase(newUser);
}
```

### Frontend Authorization Check (Client-Side)

```typescript
// Example: Show/hide Admin tab
function hasRole(profile: UserProfile, roles: string[]): boolean {
  return roles.includes(profile.role);
}

// Usage:
{hasRole(userProfile, ['master_admin', 'tenant_admin', 'org_admin']) && (
  <Button onClick={() => setCurrentTab('admin')}>Admin</Button>
)}
```

---

## Data Isolation Rules

### Tenant Isolation

All data is scoped by `tenantId`:

```typescript
// Global Admin: No filter
const users = await kv.getByPrefix('user:');

// Tenant Admin: Filter by tenantId
const users = (await kv.getByPrefix('user:')).filter(
  u => u.tenantId === profile.tenantId
);

// Org Admin: Filter by organizationId
const users = (await kv.getByPrefix('user:')).filter(
  u => u.organizationId === profile.organizationId
);
```

### Cross-Tenant Access Prevention

```typescript
// Example: Update User endpoint
async function updateUser(profile: UserProfile, userId: string, updates: Partial<User>) {
  const user = await kv.get(`user:${userId}`);
  
  // Global Admin can edit any user
  if (profile.role === 'master_admin') {
    return await updateUserInDatabase(userId, updates);
  }
  
  // Tenant Admin can only edit users in their tenant
  if (profile.role === 'tenant_admin') {
    if (user.tenantId !== profile.tenantId) {
      throw new Error('Cannot modify users outside your tenant');
    }
  }
  
  // Org Admin can only edit users in their org
  if (profile.role === 'org_admin') {
    if (user.organizationId !== profile.organizationId) {
      throw new Error('Cannot modify users outside your organization');
    }
  }
  
  return await updateUserInDatabase(userId, updates);
}
```

---

## Special Cases

### 1. Self-Service Actions
Users can always:
- Update their own name
- Change their own password (via Supabase Auth)
- View their own profile

Users cannot:
- Change their own role
- Delete themselves
- Change their own tenant/organization

### 2. Global Admin Restrictions
Even Global Admin cannot:
- Delete themselves
- Change their own role to a lower permission level (requires another Global Admin)

### 3. Cascading Deletes
- Deleting a tenant → Deletes all organizations and users in that tenant
- Deleting an organization → Deletes all users in that organization
- Deleting a user → Only deletes the user (no cascade)

---

## Future Enhancements

### Planned Permission Extensions

1. **Project-Level Permissions**
   - Owner: Full control
   - Editor: Can edit inputs
   - Viewer: Read-only access
   - Share with specific users or organizations

2. **Feature Flags per Role**
   - Advanced calculations (Tenant Admin+)
   - Bulk exports (Org Admin+)
   - API access (Tenant Admin+)

3. **Resource Quotas**
   - User limits per tenant
   - Storage limits per tenant
   - Calculation complexity limits

4. **Audit Trail**
   - Track all admin actions
   - View change history
   - Compliance reporting

---

## Testing Role-Based Access

### Test Cases

1. **Global Admin**
   - ✅ Can create tenant
   - ✅ Can view all users across tenants
   - ✅ Can delete any user

2. **Tenant Admin**
   - ✅ Can create organization in own tenant
   - ❌ Cannot view users in other tenants
   - ❌ Cannot create Global Admin users

3. **Org Admin**
   - ✅ Can create users in own organization
   - ❌ Cannot create users in other organizations
   - ❌ Cannot delete organization

4. **Regular User**
   - ✅ Can access calculator features
   - ❌ Cannot access Admin tab
   - ❌ Cannot view other users
