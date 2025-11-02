# ValueDock® API Contracts

Base URL: `https://{projectId}.supabase.co/functions/v1/make-server-888f4514`

All endpoints require authentication unless specified. Include `Authorization: Bearer {accessToken}` header.

---

## Authentication Endpoints

### POST /init
**Description**: Initialize the Global Admin account (idempotent)  
**Authentication**: Public (uses anon key in Authorization header)  
**Request Body**: None

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Global admin created successfully",
  "credentials": {
    "email": "admin@dockeryai.com",
    "password": "admin123"
  }
}
```

**Already Exists Response (200 OK)**:
```json
{
  "message": "Global admin already exists",
  "credentials": {
    "email": "admin@dockeryai.com",
    "info": "Use existing credentials"
  }
}
```

**Error Response (500)**:
```json
{
  "error": "Failed to initialize global admin: {error message}"
}
```

---

### POST /auth/signup
**Description**: Create a new user account  
**Required Roles**: `master_admin`, `tenant_admin`, `org_admin`  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "user",
  "tenantId": "tenant-uuid",
  "organizationId": "org-uuid" // optional
}
```

**Validation Rules**:
- Email must be valid format
- Password minimum 8 characters
- Role must be one of: `master_admin`, `tenant_admin`, `org_admin`, `user`
- Tenant must exist
- Organization must exist (if provided)

**Success Response (201 Created)**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "tenantId": "tenant-uuid",
    "organizationId": "org-uuid",
    "active": true,
    "createdAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Validation error
{
  "error": "Invalid email format"
}

// 403 Forbidden - Insufficient permissions
{
  "error": "Only master admin or tenant admin can create users"
}

// 409 Conflict - Duplicate email
{
  "error": "User with this email already exists"
}
```

---

### GET /auth/profile
**Description**: Get current user's profile  
**Required Roles**: Any authenticated user  
**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "profile": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "tenantId": "tenant-uuid",
    "organizationId": "org-uuid",
    "active": true,
    "createdAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "error": "User not authenticated"
}
```

---

## User Management Endpoints

### GET /admin/users
**Description**: List users (filtered by role)  
**Required Roles**: `master_admin`, `tenant_admin`, `org_admin`  
**Query Parameters**: None  
**Filtering**:
- Global Admin: Returns ALL users
- Tenant Admin: Returns users in same tenant
- Org Admin: Returns users in same organization

**Success Response (200 OK)**:
```json
{
  "users": [
    {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "name": "Jane Smith",
      "role": "user",
      "tenantId": "tenant-uuid",
      "organizationId": "org-uuid",
      "active": true,
      "createdAt": "2025-10-08T12:00:00.000Z"
    },
    {
      "id": "user-uuid-2",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "tenant_admin",
      "tenantId": "tenant-uuid",
      "organizationId": null,
      "active": true,
      "createdAt": "2025-10-07T09:30:00.000Z"
    }
  ]
}
```

---

### PUT /admin/users/:userId
**Description**: Update user profile or role  
**Required Roles**: `master_admin`, `tenant_admin`, `org_admin`  
**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "role": "tenant_admin",
  "organizationId": "new-org-uuid",
  "active": false
}
```

**Validation Rules**:
- Cannot change own role
- Tenant admins cannot assign `master_admin` role
- Organization must be in same tenant

**Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "Updated Name",
    "role": "tenant_admin",
    "tenantId": "tenant-uuid",
    "organizationId": "new-org-uuid",
    "active": false,
    "createdAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Error Response (403 Forbidden)**:
```json
{
  "error": "Cannot modify users outside your tenant"
}
```

---

### DELETE /admin/users/:userId
**Description**: Delete a user  
**Required Roles**: `master_admin`, `tenant_admin`, `org_admin`  
**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:
```json
// 403 Forbidden
{
  "error": "Cannot delete users outside your tenant"
}

// 404 Not Found
{
  "error": "User not found"
}

// 409 Conflict
{
  "error": "Cannot delete yourself"
}
```

---

## Tenant Management Endpoints

### GET /admin/tenants
**Description**: List all tenants  
**Required Roles**: `master_admin`  
**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "tenants": [
    {
      "id": "tenant-uuid-1",
      "name": "Acme Corporation",
      "domain": "acme",
      "settings": {
        "brandName": "Acme ROI Calculator",
        "primaryColor": "#ff6b35",
        "logoUrl": null,
        "faviconUrl": null
      },
      "active": true,
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ]
}
```

---

### POST /admin/tenants
**Description**: Create a new tenant  
**Required Roles**: `master_admin`  
**Request Body**:
```json
{
  "name": "New Company Inc",
  "domain": "newcompany",
  "settings": {
    "brandName": "NewCo ValueDock",
    "primaryColor": "#0ea5e9",
    "logoUrl": "https://example.com/logo.png",
    "faviconUrl": "https://example.com/favicon.ico"
  }
}
```

**Validation Rules**:
- Domain must be unique
- Domain must be URL-safe (alphanumeric, hyphens)
- Primary color must be valid hex code

**Success Response (201 Created)**:
```json
{
  "success": true,
  "tenant": {
    "id": "new-tenant-uuid",
    "name": "New Company Inc",
    "domain": "newcompany",
    "settings": {
      "brandName": "NewCo ValueDock",
      "primaryColor": "#0ea5e9",
      "logoUrl": "https://example.com/logo.png",
      "faviconUrl": "https://example.com/favicon.ico"
    },
    "active": true,
    "createdAt": "2025-10-08T14:30:00.000Z"
  }
}
```

**Error Response (409 Conflict)**:
```json
{
  "error": "Tenant with domain 'newcompany' already exists"
}
```

---

### PUT /admin/tenants/:tenantId
**Description**: Update tenant settings (white-label configuration)  
**Required Roles**: `master_admin`, `tenant_admin` (own tenant only)  
**Request Body**:
```json
{
  "settings": {
    "brandName": "Updated Brand Name",
    "primaryColor": "#ff0000",
    "logoUrl": "https://example.com/new-logo.png",
    "faviconUrl": "https://example.com/new-favicon.ico"
  }
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "tenant": {
    "id": "tenant-uuid",
    "name": "Acme Corporation",
    "domain": "acme",
    "settings": {
      "brandName": "Updated Brand Name",
      "primaryColor": "#ff0000",
      "logoUrl": "https://example.com/new-logo.png",
      "faviconUrl": "https://example.com/new-favicon.ico"
    },
    "active": true,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

### DELETE /admin/tenants/:tenantId
**Description**: Delete a tenant (cascades to users and organizations)  
**Required Roles**: `master_admin`  
**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Tenant deleted successfully"
}
```

**Error Response (409 Conflict)**:
```json
{
  "error": "Cannot delete tenant with active users"
}
```

---

## Organization Management Endpoints

### GET /admin/organizations
**Description**: List organizations (filtered by role)  
**Required Roles**: `master_admin`, `tenant_admin`  
**Filtering**:
- Global Admin: Returns ALL organizations
- Tenant Admin: Returns organizations in same tenant

**Success Response (200 OK)**:
```json
{
  "organizations": [
    {
      "id": "org-uuid-1",
      "name": "Engineering",
      "tenantId": "tenant-uuid",
      "parentOrgId": null,
      "settings": {},
      "createdAt": "2025-10-02T11:00:00.000Z"
    },
    {
      "id": "org-uuid-2",
      "name": "Backend Team",
      "tenantId": "tenant-uuid",
      "parentOrgId": "org-uuid-1",
      "settings": {},
      "createdAt": "2025-10-02T11:30:00.000Z"
    }
  ]
}
```

---

### POST /admin/organizations
**Description**: Create a new organization  
**Required Roles**: `master_admin`, `tenant_admin`  
**Request Body**:
```json
{
  "name": "Sales Department",
  "tenantId": "tenant-uuid",
  "parentOrgId": null,
  "settings": {}
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "organization": {
    "id": "new-org-uuid",
    "name": "Sales Department",
    "tenantId": "tenant-uuid",
    "parentOrgId": null,
    "settings": {},
    "createdAt": "2025-10-08T15:00:00.000Z"
  }
}
```

---

### PUT /admin/organizations/:orgId
**Description**: Update organization details  
**Required Roles**: `master_admin`, `tenant_admin`, `org_admin` (own org only)  
**Request Body**:
```json
{
  "name": "Updated Department Name",
  "parentOrgId": "parent-org-uuid"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "organization": {
    "id": "org-uuid",
    "name": "Updated Department Name",
    "tenantId": "tenant-uuid",
    "parentOrgId": "parent-org-uuid",
    "settings": {},
    "createdAt": "2025-10-02T11:00:00.000Z"
  }
}
```

---

### DELETE /admin/organizations/:orgId
**Description**: Delete an organization  
**Required Roles**: `master_admin`, `tenant_admin`  
**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

- **200 OK**: Success (GET, PUT, DELETE)
- **201 Created**: Success (POST)
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource or constraint violation
- **500 Internal Server Error**: Server-side error

---

## Authentication Flow

1. **Sign In** (Supabase SDK):
   ```javascript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   ```

2. **Get Access Token**:
   ```javascript
   const accessToken = data.session.access_token;
   ```

3. **Call API**:
   ```javascript
   const response = await fetch(
     'https://{projectId}.supabase.co/functions/v1/make-server-888f4514/auth/profile',
     {
       headers: {
         'Authorization': `Bearer ${accessToken}`
       }
     }
   );
   ```

---

## Rate Limiting

Currently not implemented. Future consideration:
- 100 requests/minute per user
- 1000 requests/minute per tenant
- Burst allowance: 200 requests/10 seconds
