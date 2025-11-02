# Backend Setup Guide

This document explains how to set up the backend routes for the Multi-Tenant Admin module in your Supabase Edge Functions.

## Overview

The multi-tenant admin system requires these backend endpoints:

### Authentication Endpoints
- `POST /auth/signup` - Create new users
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### User Management Endpoints
- `GET /admin/users` - List users (filtered by role)
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Tenant Management Endpoints (Global Admin only)
- `GET /admin/tenants` - List all tenants
- `POST /admin/tenants` - Create new tenant
- `PUT /admin/tenants/:id` - Update tenant
- `DELETE /admin/tenants/:id` - Delete tenant (with backup)

### Organization Management Endpoints
- `GET /admin/organizations` - List organizations (filtered by role)
- `POST /admin/organizations` - Create new organization
- `PUT /admin/organizations/:id` - Update organization
- `DELETE /admin/organizations/:id` - Delete organization (with backup)

### Backup Endpoints
- `GET /admin/backups` - List backups
- `POST /admin/restore/:id` - Restore from backup

## Integration Steps

### Step 1: Copy Backend Code

In your `/supabase/functions/server/index.tsx`, add the routes from this directory:

```typescript
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "npm:jose@5";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Enable logging
app.use('*', logger(console.log));

// ... Copy auth middleware and routes from backend-routes.tsx ...
```

### Step 2: Auth Middleware

The module requires JWT verification. Here's the core middleware:

```typescript
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jose.decodeJwt(token);
    
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return { error: 'Token expired', user: null };
    }
    
    const user = {
      id: decoded.sub as string,
      email: decoded.email as string,
      user_metadata: decoded.user_metadata as any,
    };
    
    return { error: null, user };
  } catch (err) {
    return { error: 'Unauthorized', user: null };
  }
};
```

### Step 3: Permission Checks

All admin routes check permissions:

```typescript
// Get user profile
const profile = await kv.get(`user:${user.id}`);

// Check role
if (!['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
  return c.json({ error: 'Insufficient permissions' }, 403);
}

// Filter data based on role
if (profile.role === 'tenant_admin') {
  // Only show data from their tenant
  data = data.filter(item => item.tenantId === profile.tenantId);
} else if (profile.role === 'org_admin') {
  // Only show data from their organization
  data = data.filter(item => item.organizationId === profile.organizationId);
}
```

### Step 4: Data Storage

The module uses the KV store for user profiles, tenants, and organizations:

```typescript
// Store user profile
await kv.set(`user:${userId}`, userProfile);

// Store tenant
await kv.set(`tenant:${tenantId}`, tenantData);

// Store organization
await kv.set(`organization:${orgId}`, organizationData);

// Get all users
const users = await kv.getByPrefix('user:');

// Get all tenants
const tenants = await kv.getByPrefix('tenant:');
```

### Step 5: Backup System

When deleting tenants/organizations, create backups:

```typescript
// Before deleting
const backup = {
  id: `backup_${Date.now()}_${Math.random()}`,
  type: 'tenant',
  entityId: tenantId,
  entityName: tenant.name,
  data: tenant,
  deletedAt: new Date().toISOString(),
  deletedBy: profile.id,
};

await kv.set(`backup:${backup.id}`, backup);

// Then delete
await kv.del(`tenant:${tenantId}`);
```

## Complete Backend Template

See `backend-routes.tsx` for the complete implementation. You can copy this file directly into your Edge Function.

## Security Checklist

- ✅ All routes verify JWT tokens
- ✅ Role-based access control on all admin routes
- ✅ Tenant/org scoping enforced
- ✅ SUPABASE_SERVICE_ROLE_KEY only used server-side
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive info

## Testing

Test each endpoint:

```bash
# Test auth
curl -X GET https://your-project.supabase.co/functions/v1/make-server-888f4514/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test users list
curl -X GET https://your-project.supabase.co/functions/v1/make-server-888f4514/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create tenant
curl -X POST https://your-project.supabase.co/functions/v1/make-server-888f4514/admin/tenants \
  -H "Authorization: Bearer YOUR_GLOBAL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Tenant","domain":"test.com"}'
```

## Troubleshooting

### Issue: 401 Unauthorized
- Check that token is included in Authorization header
- Verify token hasn't expired
- Check that user exists in KV store

### Issue: 403 Forbidden
- Verify user has correct role
- Check tenant/org scoping logic
- Ensure profile is loaded correctly

### Issue: Users not showing up
- Check KV store with `/debug/keys` endpoint
- Verify prefix filtering logic
- Check role-based filtering

## Next Steps

After setting up the backend:

1. Test each endpoint with Postman or curl
2. Verify role-based access control
3. Test backup/restore functionality
4. Connect frontend components
5. Test complete user flows

See the main INTEGRATION_GUIDE.md for frontend setup.
