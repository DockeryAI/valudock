# ValueDock® Domain Model & Entity Relationship Diagram

## Overview

ValueDock® uses a simple key-value store architecture with a three-tier entity hierarchy: **Tenants → Organizations → Users**. All data is stored in a single PostgreSQL table (`kv_store_888f4514`) with prefixed keys for logical separation.

---

## Core Entities

### 1. User

**Description**: Represents an individual user account with authentication credentials and role-based permissions.

**Storage Key**: `user:{userId}`  
**Email Index Key**: `user:email:{email}`

**Attributes**:
```typescript
{
  id: string;                    // UUID (Primary Key)
  email: string;                 // Unique, indexed
  name: string;                  // Display name
  role: UserRole;                // Enum: master_admin, tenant_admin, org_admin, user
  tenantId: string;              // Foreign Key → Tenant
  organizationId?: string;       // Optional Foreign Key → Organization
  active: boolean;               // Soft delete flag
  createdAt: string;             // ISO 8601 timestamp
}
```

**Role Types**:
- `master_admin` - Global system administrator (displayed as "Global Admin")
- `tenant_admin` - Tenant-level administrator
- `org_admin` - Organization-level administrator
- `user` - Regular user with read/write access

**Constraints**:
- Email must be unique across entire system
- `tenantId` is required (all users belong to a tenant)
- `organizationId` is optional (users can be tenant-wide or org-specific)
- Cannot delete yourself
- Tenant admins cannot assign `master_admin` role

**Relationships**:
- Belongs to one Tenant (many-to-one)
- Optionally belongs to one Organization (many-to-one)
- Has one authentication record in Supabase Auth (one-to-one)

---

### 2. Tenant

**Description**: Top-level organizational unit representing a client company. Supports white-label customization and complete data isolation.

**Storage Key**: `tenant:{tenantId}`  
**Domain Index Key**: `tenant:domain:{domain}`

**Attributes**:
```typescript
{
  id: string;                    // UUID (Primary Key)
  name: string;                  // Company name
  domain: string;                // Unique subdomain identifier
  settings: TenantSettings;      // White-label configuration
  active: boolean;               // Soft delete flag
  createdAt: string;             // ISO 8601 timestamp
}
```

**TenantSettings** (nested object):
```typescript
{
  brandName?: string;            // Custom application name (e.g., "Acme ROI Tool")
  primaryColor?: string;         // Hex color code (e.g., "#0ea5e9")
  logoUrl?: string;              // URL to custom logo image
  faviconUrl?: string;           // URL to custom favicon
}
```

**Constraints**:
- Domain must be unique
- Domain must be URL-safe (lowercase alphanumeric, hyphens only)
- Only Global Admin can create/delete tenants
- Cascading delete: deleting a tenant deletes all child organizations and users

**Relationships**:
- Has many Users (one-to-many)
- Has many Organizations (one-to-many)

---

### 3. Organization

**Description**: Sub-unit within a tenant, representing departments, teams, or business units. Supports hierarchical structure with parent-child relationships.

**Storage Key**: `org:{organizationId}`

**Attributes**:
```typescript
{
  id: string;                    // UUID (Primary Key)
  name: string;                  // Organization name
  tenantId: string;              // Foreign Key → Tenant (required)
  parentOrgId?: string;          // Foreign Key → Organization (self-referential)
  settings: object;              // Extensible metadata (currently unused)
  createdAt: string;             // ISO 8601 timestamp
}
```

**Constraints**:
- Must belong to a tenant
- Parent organization (if specified) must be in the same tenant
- Cannot create circular parent-child relationships
- Global Admin and Tenant Admin can create organizations
- Org Admin can only edit their own organization

**Relationships**:
- Belongs to one Tenant (many-to-one)
- Has many Users (one-to-many)
- Has many child Organizations (one-to-many, self-referential)
- Optionally has one parent Organization (many-to-one, self-referential)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        TENANT                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PK: id (UUID)                                        │  │
│  │ UK: domain (string)                                  │  │
│  │     name (string)                                    │  │
│  │     settings (TenantSettings)                        │  │
│  │     active (boolean)                                 │  │
│  │     createdAt (timestamp)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ 1
                      │
                      │ has many
                      │
         ┌────────────┴────────────┐
         │ N                       │ N
         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   ORGANIZATION      │   │        USER         │
│  ┌──────────────┐  │   │  ┌──────────────┐  │
│  │ PK: id       │  │   │  │ PK: id       │  │
│  │ FK: tenantId │──┼───┼──│ FK: tenantId │  │
│  │ FK: parentId │◄─┼─┐ │  │ FK: orgId?   │──┼─┐
│  │     name     │  │ │ │  │ UK: email    │  │ │
│  │     settings │  │ │ │  │     name     │  │ │
│  │     created  │  │ │ │  │     role     │  │ │
│  └──────────────┘  │ │ │  │     active   │  │ │
└─────────────────────┘ │ │  │     created  │  │ │
         │              │ │  └──────────────┘  │ │
         └──────────────┘ └─────────────────────┘ │
         self-referential        belongs to        │
         (parent-child)          (optional)        │
                                                   │
                                 ┌─────────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   SUPABASE AUTH      │
                      │  (External Service)  │
                      │  ┌───────────────┐   │
                      │  │ PK: id (UUID) │   │
                      │  │     email     │   │
                      │  │     password  │   │
                      │  │     session   │   │
                      │  └───────────────┘   │
                      └──────────────────────┘
```

---

## Cardinality Summary

| Relationship | Cardinality | Notes |
|---|---|---|
| Tenant → User | 1:N | A tenant has many users |
| Tenant → Organization | 1:N | A tenant has many organizations |
| Organization → User | 1:N | An organization has many users (optional) |
| Organization → Organization | 1:N | Self-referential parent-child hierarchy |
| User → Supabase Auth | 1:1 | User profile links to auth record |

---

## Key-Value Store Schema

All entities are stored in a single table: `kv_store_888f4514`

```sql
CREATE TABLE kv_store_888f4514 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Patterns**:
- Users: `user:{userId}`, `user:email:{email}`
- Tenants: `tenant:{tenantId}`, `tenant:domain:{domain}`
- Organizations: `org:{organizationId}`

**Indexing Strategy**:
- Primary lookups by ID: `user:{userId}`
- Email-based auth: `user:email:{email}`
- Domain-based tenant resolution: `tenant:domain:{domain}`

---

## Data Access Patterns

### 1. User Login Flow
```
1. Frontend → Supabase Auth (email/password)
2. Get access token
3. Backend → Get user profile: kv.get(`user:email:${email}`)
4. Return user object with role, tenantId, organizationId
```

### 2. Tenant Isolation
```
- Global Admin: Access all tenants (no filter)
- Tenant Admin: Filter by `profile.tenantId === tenant.id`
- Org Admin: Filter by `profile.organizationId === org.id`
- Regular User: Read/write within their tenant scope
```

### 3. Organization Hierarchy
```
- Parent lookup: kv.get(`org:${parentOrgId}`)
- Child lookup: kv.getByPrefix(`org:`) → filter by parentOrgId
- Validation: Ensure parent.tenantId === child.tenantId
```

---

## Calculated Fields

### User Display Name
```typescript
function getUserDisplayName(user: User): string {
  const firstName = user.name?.split(' ')[0];
  return firstName || user.name || user.email;
}
```

### Role Display Name
```typescript
function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'master_admin': return 'Global Admin';
    case 'tenant_admin': return 'Tenant Admin';
    case 'org_admin': return 'Org Admin';
    case 'user': return 'User';
    default: return role.replace('_', ' ');
  }
}
```

---

## Future Extensions

### Potential New Entities

1. **Project**: ROI calculation workspace
   - Belongs to User
   - Stores inputData, results, scenarios
   - Shareable via URL or export

2. **Scenario**: Saved what-if analysis
   - Belongs to Project
   - Stores alternate input parameters

3. **Audit Log**: User activity tracking
   - Tracks create/update/delete operations
   - Retention policy: 90 days

4. **Subscription**: Tenant billing and plan limits
   - Belongs to Tenant
   - Defines user limits, storage quotas, feature flags

---

## Data Migration Considerations

If moving from KV store to relational tables:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('master_admin', 'tenant_admin', 'org_admin', 'user')),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orgs_tenant ON organizations(tenant_id);
CREATE INDEX idx_orgs_parent ON organizations(parent_org_id);
```
