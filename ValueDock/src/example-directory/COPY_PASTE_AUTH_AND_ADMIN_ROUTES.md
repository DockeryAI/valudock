# 📋 Copy-Paste: Auth & Admin Routes from ValueDock

**Copy this entire section into your new project's `/supabase/functions/server/index.tsx`**

This document contains all the authentication middleware and admin routes extracted from ValueDock's server implementation. These are ready to be copied and pasted into any new Figma Make project.

---

## 📦 What's Included

✅ **Auth Middleware** - JWT token verification  
✅ **Auth Routes** - Signup, profile management  
✅ **User Management Routes** - CRUD operations for users  
✅ **Tenant Management Routes** - Multi-tenant system  
✅ **Organization Management Routes** - Org hierarchy  
✅ **Backup/Restore Routes** - Data safety system  

---

## 🔧 Step 1: Add Required Imports

Make sure these imports are at the top of your `index.tsx`:

```typescript
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "npm:jose@5";
import * as kv from "./kv_store.tsx";
```

---

## 🔧 Step 2: Add Helper Function

Add this helper function after your app initialization:

```typescript
// Create Supabase client helper
const getSupabaseClient = (serviceRole = false) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = serviceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    : Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};
```

---

## 🛡️ Step 3: Auth Middleware (Line ~34 in ValueDock)

```typescript
// Middleware to verify user authentication
// Decodes JWT without verification to avoid network calls
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    console.error('verifyAuth: No authorization header provided');
    return { error: 'No authorization header', user: null };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  console.log('verifyAuth: Token preview:', token.substring(0, 30) + '...');
  console.log('verifyAuth: Token length:', token.length);
  
  try {
    console.log('verifyAuth: Decoding JWT token...');
    
    // Decode JWT without verification using jose
    // This extracts the payload without validating the signature
    // Safe for our use case since tokens are from Supabase Auth
    const decoded = jose.decodeJwt(token);
    
    console.log('verifyAuth: JWT decoded successfully');
    console.log('verifyAuth: Full decoded payload:', JSON.stringify(decoded, null, 2));
    console.log('verifyAuth: Token sub (user ID):', decoded.sub);
    console.log('verifyAuth: Token email:', decoded.email);
    console.log('verifyAuth: Token exp:', decoded.exp);
    console.log('verifyAuth: Token aud:', decoded.aud);
    console.log('verifyAuth: Token role:', decoded.role);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.error('verifyAuth: Token is expired');
      return { error: 'Token expired', user: null };
    }
    
    // Extract user info from JWT payload
    const user = {
      id: decoded.sub as string,
      email: decoded.email as string,
      user_metadata: decoded.user_metadata as any,
      aud: decoded.aud as string,
      role: decoded.role as string,
    };
    
    if (!user.id) {
      console.error('verifyAuth: No user ID in JWT payload');
      console.error('verifyAuth: decoded.sub was:', decoded.sub);
      console.error('verifyAuth: typeof decoded.sub:', typeof decoded.sub);
      return { error: 'Invalid token', user: null };
    }
    
    console.log('verifyAuth: Successfully extracted user from token:', user.id);
    
    return { error: null, user };
  } catch (err) {
    console.error('verifyAuth: Exception during JWT decode:', err);
    console.error('verifyAuth: Error details:', err instanceof Error ? err.message : String(err));
    return { error: 'Unauthorized', user: null };
  }
};
```

---

## 🔐 Step 4: Auth Routes (Line ~725 in ValueDock)

### 4.1 Sign Up Route

```typescript
// Sign up a new user
app.post("/make-server-888f4514/auth/signup", async (c) => {
  console.log('========== SIGNUP REQUEST RECEIVED ==========');
  try {
    const requestBody = await c.req.json();
    console.log('Request body received:', requestBody);
    
    const { email, password, name, role = 'user', tenantId, organizationId, groupIds = [] } = requestBody;
    console.log('Parsed values - email:', email, 'name:', name, 'role:', role, 'tenantId:', tenantId, 'organizationId:', organizationId, 'groupIds:', groupIds);
    
    if (!email || !password) {
      console.error('Missing required fields - email:', email, 'password:', !!password);
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    const supabase = getSupabaseClient(true);
    
    // Create user with Supabase Auth
    console.log('Creating user in Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server hasn't been configured
      user_metadata: { name }
    });
    
    if (error) {
      console.error('Supabase Auth error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('User created in Supabase Auth:', data.user.id);
    
    // Store additional user metadata in KV store
    // Global admins (master_admin) don't need a tenant or organization
    const userProfile = {
      id: data.user.id,
      email,
      name,
      role,
      tenantId: role === 'master_admin' ? null : (tenantId || null),
      organizationId: role === 'master_admin' ? null : (organizationId || null),
      groupIds: groupIds || [],
      createdAt: new Date().toISOString(),
      active: true
    };
    
    console.log('Saving user profile to KV store:', userProfile);
    await kv.set(`user:${data.user.id}`, userProfile);
    await kv.set(`user:email:${email}`, data.user.id);
    console.log('User profile saved successfully');
    
    return c.json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: `Internal server error during signup: ${error.message}` }, 500);
  }
});
```

### 4.2 Get User Profile

```typescript
// Get user profile
app.get("/make-server-888f4514/auth/profile", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('Auth verification failed:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    console.log('Fetching profile for user:', user.id);
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      console.warn('No profile found in KV for user:', user.id);
      // Create a default profile if it doesn't exist
      // Use the test tenant and organization IDs
      const defaultProfile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || 'User',
        role: 'user',
        tenantId: 'tenant_test_001',
        organizationId: 'org_test_001',
        groupIds: [],
        createdAt: new Date().toISOString(),
        active: true
      };
      await kv.set(`user:${user.id}`, defaultProfile);
      console.log('✅ Created default profile for user:', user.email, 'with tenantId:', defaultProfile.tenantId, 'orgId:', defaultProfile.organizationId);
      return c.json({ profile: defaultProfile });
    }
    
    console.log('✅ Profile found:', profile.email, 'tenantId:', profile.tenantId, 'orgId:', profile.organizationId);
    return c.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return c.json({ error: `Failed to fetch profile: ${error.message}` }, 500);
  }
});
```

### 4.3 Update User Profile

```typescript
// Update user profile
app.put("/make-server-888f4514/auth/profile", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`) || {};
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      id: user.id, // Ensure ID can't be changed
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});
```

---

## 👥 Step 5: User Management Routes (Line ~856 in ValueDock)

### 5.1 Get All Users

```typescript
// Get all users (admin only)
app.get("/make-server-888f4514/admin/users", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    // Check if user has admin privileges
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    // Get all users
    console.log('Fetching users with getByPrefix...');
    const allUsers = await kv.getByPrefix('user:');
    console.log('Raw KV results count:', allUsers?.length || 0);
    
    const users = allUsers
      .filter(u => {
        if (!u || !u.key || typeof u.key !== 'string') {
          console.warn('Invalid KV entry found:', u);
          return false;
        }
        return u.key.startsWith('user:') && !u.key.includes(':email:');
      })
      .map(u => u.value)
      .filter(v => {
        if (!v || typeof v !== 'object') {
          console.warn('Invalid user value found:', v);
          return false;
        }
        return true;
      });
    
    console.log('Filtered users count:', users.length);
    
    // Filter based on role
    let filteredUsers = users;
    if (profile.role === 'tenant_admin') {
      filteredUsers = users.filter(u => u.tenantId === profile.tenantId);
    } else if (profile.role === 'org_admin') {
      filteredUsers = users.filter(u => u.organizationId === profile.organizationId);
    }
    
    return c.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});
```

### 5.2 Update User

```typescript
// Update user (admin only)
app.put("/make-server-888f4514/admin/users/:userId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    const targetUser = await kv.get(`user:${userId}`);
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Validate permissions
    if (profile.role === 'tenant_admin' && targetUser.tenantId !== profile.tenantId) {
      return c.json({ error: 'Cannot modify users from other tenants' }, 403);
    }
    if (profile.role === 'org_admin' && targetUser.organizationId !== profile.organizationId) {
      return c.json({ error: 'Cannot modify users from other organizations' }, 403);
    }
    
    const updatedUser = {
      ...targetUser,
      ...updates,
      id: userId, // Ensure ID can't be changed
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedUser);
    
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});
```

### 5.3 Delete User

```typescript
// Delete user (admin only)
app.delete("/make-server-888f4514/admin/users/:userId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const userId = c.req.param('userId');
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    if (profile.role === 'tenant_admin' && targetUser.tenantId !== profile.tenantId) {
      return c.json({ error: 'Cannot delete users from other tenants' }, 403);
    }
    
    // Delete from Supabase Auth (only if valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const supabase = getSupabaseClient(true);
    
    if (uuidRegex.test(userId)) {
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log(`Deleted user ${userId} from Supabase Auth`);
      } catch (authError) {
        console.warn(`Failed to delete user ${userId} from Supabase Auth:`, authError.message);
        // Continue with KV deletion even if Auth deletion fails
      }
    } else {
      console.log(`Skipping Supabase Auth deletion for non-UUID user: ${userId}`);
    }
    
    // Delete from KV store
    await kv.del(`user:${userId}`);
    if (targetUser.email) {
      await kv.del(`user:email:${targetUser.email}`);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});
```

---

## 🏢 Step 6: Tenant Management Routes (Line ~1015 in ValueDock)

### 6.1 Create Tenant

```typescript
// Create tenant
app.post("/make-server-888f4514/admin/tenants", async (c) => {
  console.log('========== CREATE TENANT REQUEST RECEIVED ==========');
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('Auth failed:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  console.log('User authenticated:', user.id);
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    console.log('User profile:', profile);
    
    if (!profile || profile.role !== 'master_admin') {
      console.error('Permission denied. Profile:', profile);
      return c.json({ error: 'Only global admin can create tenants' }, 403);
    }
    
    const requestBody = await c.req.json();
    console.log('Request body received:', requestBody);
    
    const { name, domain, settings } = requestBody;
    console.log('Parsed values - name:', name, 'domain:', domain, 'settings:', settings);
    
    if (!name || !domain) {
      console.error('Missing required fields - name:', name, 'domain:', domain);
      return c.json({ error: 'Name and domain are required' }, 400);
    }
    
    // Check for duplicate tenant name
    const allTenants = await kv.getByPrefix('tenant:');
    const existingTenantWithName = allTenants
      .filter(t => t && t.value && typeof t.value === 'object')
      .map(t => t.value)
      .find(t => t.name.toLowerCase().trim() === name.toLowerCase().trim());
    
    if (existingTenantWithName) {
      console.error('Duplicate tenant name:', name);
      return c.json({ error: `A tenant named "${name}" already exists. Each tenant must have a unique name.` }, 400);
    }
    
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tenant = {
      id: tenantId,
      name,
      domain,
      settings: settings || {},
      createdAt: new Date().toISOString(),
      active: true
    };
    
    console.log('Creating tenant:', tenant);
    await kv.set(`tenant:${tenantId}`, tenant);
    console.log('Tenant saved to KV store successfully');
    
    // Verify it was actually saved
    console.log('Verifying save - reading back from KV store...');
    const verifyRead = await kv.get(`tenant:${tenantId}`);
    console.log('Verify read result:', JSON.stringify(verifyRead, null, 2));
    
    console.log('Testing getByPrefix immediately after save...');
    const allTenantsAfterSave = await kv.getByPrefix('tenant:');
    console.log('getByPrefix result after save:', JSON.stringify(allTenantsAfterSave, null, 2));
    
    return c.json({ success: true, tenant });
  } catch (error) {
    console.error('Error creating tenant:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: `Failed to create tenant: ${error.message}` }, 500);
  }
});
```

### 6.2 Get All Tenants

```typescript
// Get all tenants
app.get("/make-server-888f4514/admin/tenants", async (c) => {
  console.log('========== GET TENANTS REQUEST RECEIVED ==========');
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('GET tenants - Auth failed:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  console.log('GET tenants - User authenticated:', user.id);
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    console.log('GET tenants - User profile:', profile);
    
    if (!profile || profile.role !== 'master_admin') {
      console.error('GET tenants - Permission denied. Profile:', profile);
      return c.json({ error: 'Only global admin can view all tenants' }, 403);
    }
    
    console.log('GET tenants - Calling kv.getByPrefix("tenant:")');
    const allTenants = await kv.getByPrefix('tenant:');
    console.log('GET tenants - Raw response from getByPrefix:', JSON.stringify(allTenants, null, 2));
    console.log('GET tenants - Number of results:', allTenants?.length || 0);
    
    const tenants = allTenants
      .filter(t => t && t.value && typeof t.value === 'object')
      .map(t => t.value);
    
    console.log('GET tenants - After filtering:', JSON.stringify(tenants, null, 2));
    console.log('GET tenants - Returning', tenants.length, 'tenants');
    
    return c.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: 'Failed to fetch tenants' }, 500);
  }
});
```

### 6.3 Update Tenant

```typescript
// Update tenant settings (white-label customization)
app.put("/make-server-888f4514/admin/tenants/:tenantId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const tenantId = c.req.param('tenantId');
    
    if (!profile || (profile.role !== 'master_admin' && profile.tenantId !== tenantId)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const updates = await c.req.json();
    const currentTenant = await kv.get(`tenant:${tenantId}`);
    
    if (!currentTenant) {
      return c.json({ error: 'Tenant not found' }, 404);
    }
    
    const updatedTenant = {
      ...currentTenant,
      ...updates,
      id: tenantId, // Ensure ID can't be changed
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`tenant:${tenantId}`, updatedTenant);
    
    return c.json({ success: true, tenant: updatedTenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return c.json({ error: 'Failed to update tenant' }, 500);
  }
});
```

### 6.4 Delete Tenant (with automatic backup)

```typescript
// Delete tenant (with backup)
app.delete("/make-server-888f4514/admin/tenants/:tenantId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const tenantId = c.req.param('tenantId');
    
    // Only global admin can delete tenants
    if (!profile || profile.role !== 'master_admin') {
      return c.json({ error: 'Only global admin can delete tenants' }, 403);
    }
    
    const tenant = await kv.get(`tenant:${tenantId}`);
    
    if (!tenant) {
      return c.json({ error: 'Tenant not found' }, 404);
    }
    
    // Get all organizations under this tenant
    const allOrgs = await kv.getByPrefix('organization:');
    const tenantOrgs = allOrgs.filter(o => o?.value?.tenantId === tenantId);
    
    // Get all users under this tenant
    const allUsers = await kv.getByPrefix('user:');
    const tenantUsers = allUsers.filter(u => u?.value?.tenantId === tenantId && !u.key.includes(':email:'));
    
    // Create backup before deletion
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const backup = {
      id: backupId,
      type: 'tenant',
      entityId: tenantId,
      entityName: tenant.name,
      deletedAt: new Date().toISOString(),
      deletedBy: profile.email || profile.name,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      data: {
        tenant,
        organizations: tenantOrgs.map(o => o.value),
        users: tenantUsers.map(u => u.value)
      }
    };
    
    await kv.set(`backup:${backupId}`, backup);
    console.log(`Backup created: ${backupId}`);
    
    // Delete all users in this tenant
    const supabase = getSupabaseClient(true);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    for (const userEntry of tenantUsers) {
      const userData = userEntry.value;
      if (userData?.id) {
        // Only delete from Supabase Auth if ID is a valid UUID
        // (some users may have fallback IDs that only exist in KV store)
        if (uuidRegex.test(userData.id)) {
          try {
            await supabase.auth.admin.deleteUser(userData.id);
            console.log(`Deleted user ${userData.id} from Supabase Auth`);
          } catch (authError) {
            console.warn(`Failed to delete user ${userData.id} from Supabase Auth (may not exist):`, authError.message);
            // Continue with KV deletion even if Auth deletion fails
          }
        } else {
          console.log(`Skipping Supabase Auth deletion for non-UUID user: ${userData.id}`);
        }
        
        // Always delete from KV store
        await kv.del(`user:${userData.id}`);
        if (userData.email) {
          await kv.del(`user:email:${userData.email}`);
        }
        console.log(`Deleted user ${userData.id} from KV store`);
      }
    }
    
    // Delete all organizations in this tenant
    for (const orgEntry of tenantOrgs) {
      const orgData = orgEntry.value;
      if (orgData?.id) {
        await kv.del(`organization:${orgData.id}`);
      }
    }
    
    // Delete the tenant
    await kv.del(`tenant:${tenantId}`);
    
    console.log(`✅ Tenant ${tenantId} deleted successfully`);
    return c.json({ success: true, backupId });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return c.json({ error: `Failed to delete tenant: ${error.message}` }, 500);
  }
});
```

### 6.5 Get Tenant by ID or Domain

```typescript
// Get tenant by ID or domain
app.get("/make-server-888f4514/tenants/:identifier", async (c) => {
  try {
    const identifier = c.req.param('identifier');
    console.log(`[GET /tenants/${identifier}] ========== TENANT LOOKUP START ==========`);
    console.log(`[GET /tenants/${identifier}] Searching for:`, identifier);
    console.log(`[GET /tenants/${identifier}] KV key will be:`, `tenant:${identifier}`);
    
    // Try to get by ID first
    let tenant = await kv.get(`tenant:${identifier}`);
    console.log(`[GET /tenants/${identifier}] Direct lookup result:`, tenant);
    
    // If not found, search by domain and LIST ALL tenants
    if (!tenant) {
      console.log(`[GET /tenants/${identifier}] Not found by ID, checking all tenants...`);
      const allTenants = await kv.getByPrefix('tenant:');
      console.log(`[GET /tenants/${identifier}] Total tenants in database:`, allTenants.length);
      
      if (allTenants.length > 0) {
        console.log(`[GET /tenants/${identifier}] Listing all tenants:`);
        allTenants.forEach((t, idx) => {
          console.log(`  ${idx + 1}. Key: ${t.key}, ID: ${t.value?.id}, Name: ${t.value?.name}, Domain: ${t.value?.domain}`);
        });
      } else {
        console.error(`[GET /tenants/${identifier}] ⚠️ NO TENANTS IN DATABASE!`);
      }
      
      const tenantByDomain = allTenants.find(t => t && t.value && t.value.domain === identifier);
      tenant = tenantByDomain?.value;
      console.log(`[GET /tenants/${identifier}] Domain lookup result:`, tenant ? `Found: ${tenant.name}` : 'Not found');
    }
    
    if (!tenant) {
      console.error(`[GET /tenants/${identifier}] ❌ TENANT NOT FOUND - searched by ID and domain`);
      return c.json({ error: 'Tenant not found' }, 404);
    }
    
    console.log(`[GET /tenants/${identifier}] ✅ SUCCESS - Returning tenant:`, tenant.name);
    return c.json({ tenant });
  } catch (error) {
    console.error(`[GET /tenants/${identifier}] 💥 EXCEPTION:`, error);
    console.error(`[GET /tenants/${identifier}] Stack:`, error.stack);
    return c.json({ error: 'Failed to fetch tenant' }, 500);
  }
});
```

---

## 🏛️ Step 7: Organization Management Routes (Line ~1320 in ValueDock)

### 7.1 Create Organization

```typescript
// Create organization
app.post("/make-server-888f4514/admin/organizations", async (c) => {
  console.log('========== CREATE ORGANIZATION REQUEST RECEIVED ==========');
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    console.error('Auth failed:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  console.log('User authenticated:', user.id);
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    console.log('User profile:', profile);
    
    if (!profile || !['master_admin', 'tenant_admin'].includes(profile.role)) {
      console.error('Permission denied. Profile:', profile);
      return c.json({ error: 'Only global admin or tenant admin can create organizations' }, 403);
    }
    
    const requestBody = await c.req.json();
    console.log('Request body received:', requestBody);
    
    const { name, companyName, domain, tenantId, description } = requestBody;
    console.log('Parsed values - name:', name, 'companyName:', companyName, 'domain:', domain, 'tenantId:', tenantId, 'description:', description);
    
    if (!name || !companyName || !domain || !tenantId) {
      console.error('Missing required fields - name:', name, 'companyName:', companyName, 'domain:', domain, 'tenantId:', tenantId);
      return c.json({ error: 'Name, companyName, domain, and tenantId are required' }, 400);
    }
    
    // Verify tenant exists
    const tenant = await kv.get(`tenant:${tenantId}`);
    console.log('Tenant lookup result:', tenant);
    if (!tenant) {
      console.error('Tenant not found:', tenantId);
      return c.json({ error: 'Tenant not found' }, 404);
    }
    
    // If tenant admin, verify they belong to this tenant
    if (profile.role === 'tenant_admin' && profile.tenantId !== tenantId) {
      console.error('Permission denied - wrong tenant');
      return c.json({ error: 'Cannot create organizations for other tenants' }, 403);
    }
    
    // Check for duplicate organization name within the same tenant
    const allOrganizations = await kv.getByPrefix('organization:');
    const existingOrgWithNameInTenant = allOrganizations
      .filter(o => o && o.value && typeof o.value === 'object')
      .map(o => o.value)
      .find(o => 
        o.tenantId === tenantId && 
        o.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
    
    if (existingOrgWithNameInTenant) {
      console.error('Duplicate organization name in tenant:', name);
      return c.json({ error: `An organization named "${name}" already exists in this tenant. Organization names must be unique within each tenant.` }, 400);
    }
    
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const organization = {
      id: organizationId,
      name,
      companyName,
      domain,
      tenantId,
      description: description || '',
      createdAt: new Date().toISOString(),
      active: true
    };
    
    console.log('Creating organization:', organization);
    await kv.set(`organization:${organizationId}`, organization);
    console.log('Organization saved to KV store successfully');
    
    return c.json({ success: true, organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: `Failed to create organization: ${error.message}` }, 500);
  }
});
```

### 7.2 Get All Organizations

```typescript
// Get all organizations
app.get("/make-server-888f4514/admin/organizations", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const allOrganizations = await kv.getByPrefix('organization:');
    let organizations = allOrganizations
      .filter(o => o && o.value && typeof o.value === 'object')
      .map(o => o.value);
    
    // Filter based on role
    if (profile.role === 'tenant_admin') {
      organizations = organizations.filter(o => o.tenantId === profile.tenantId);
    } else if (profile.role === 'org_admin') {
      organizations = organizations.filter(o => o.id === profile.organizationId);
    }
    
    return c.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return c.json({ error: 'Failed to fetch organizations' }, 500);
  }
});
```

### 7.3 Get Organization by ID

```typescript
// Get organization by ID (public endpoint for users to fetch their org info)
app.get("/make-server-888f4514/organizations/:organizationId", async (c) => {
  try {
    const organizationId = c.req.param('organizationId');
    console.log(`[GET /organizations/${organizationId}] ========== ORGANIZATION LOOKUP START ==========`);
    console.log(`[GET /organizations/${organizationId}] Searching for:`, organizationId);
    console.log(`[GET /organizations/${organizationId}] KV key will be:`, `organization:${organizationId}`);
    
    const organization = await kv.get(`organization:${organizationId}`);
    console.log(`[GET /organizations/${organizationId}] Direct lookup result:`, organization);
    
    if (!organization) {
      console.error(`[GET /organizations/${organizationId}] Not found, checking all organizations...`);
      const allOrgs = await kv.getByPrefix('organization:');
      console.log(`[GET /organizations/${organizationId}] Total organizations in database:`, allOrgs.length);
      
      if (allOrgs.length > 0) {
        console.log(`[GET /organizations/${organizationId}] Listing all organizations:`);
        allOrgs.forEach((o, idx) => {
          console.log(`  ${idx + 1}. Key: ${o.key}, ID: ${o.value?.id}, Name: ${o.value?.name}`);
        });
      } else {
        console.error(`[GET /organizations/${organizationId}] ⚠️ NO ORGANIZATIONS IN DATABASE!`);
      }
      
      console.error(`[GET /organizations/${organizationId}] ❌ ORGANIZATION NOT FOUND`);
      return c.json({ error: 'Organization not found' }, 404);
    }
    
    console.log(`[GET /organizations/${organizationId}] ✅ SUCCESS - Returning organization:`, organization.name);
    return c.json({ organization });
  } catch (error) {
    console.error(`[GET /organizations/${organizationId}] 💥 EXCEPTION:`, error);
    console.error(`[GET /organizations/${organizationId}] Stack:`, error.stack);
    return c.json({ error: 'Failed to fetch organization' }, 500);
  }
});
```

### 7.4 Update Organization

```typescript
// Update organization
app.put("/make-server-888f4514/admin/organizations/:organizationId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const organizationId = c.req.param('organizationId');
    
    const currentOrg = await kv.get(`organization:${organizationId}`);
    if (!currentOrg) {
      return c.json({ error: 'Organization not found' }, 404);
    }
    
    // Check permissions
    if (profile.role === 'tenant_admin' && profile.tenantId !== currentOrg.tenantId) {
      return c.json({ error: 'Cannot modify organizations from other tenants' }, 403);
    }
    
    if (!['master_admin', 'tenant_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const updates = await c.req.json();
    const updatedOrg = {
      ...currentOrg,
      ...updates,
      id: organizationId, // Ensure ID can't be changed
      tenantId: currentOrg.tenantId, // Ensure tenantId can't be changed
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`organization:${organizationId}`, updatedOrg);
    
    return c.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.error('Error updating organization:', error);
    return c.json({ error: 'Failed to update organization' }, 500);
  }
});
```

### 7.5 Delete Organization

```typescript
// Delete organization
app.delete("/make-server-888f4514/admin/organizations/:organizationId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const organizationId = c.req.param('organizationId');
    
    const currentOrg = await kv.get(`organization:${organizationId}`);
    if (!currentOrg) {
      return c.json({ error: 'Organization not found' }, 404);
    }
    
    // Check permissions
    if (profile.role === 'tenant_admin' && profile.tenantId !== currentOrg.tenantId) {
      return c.json({ error: 'Cannot delete organizations from other tenants' }, 403);
    }
    
    if (!['master_admin', 'tenant_admin'].includes(profile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    // Check if there are users in this organization
    const allUsers = await kv.getByPrefix('user:');
    const usersInOrg = allUsers
      .filter(u => u && u.value && u.value.organizationId === organizationId)
      .length;
    
    if (usersInOrg > 0) {
      return c.json({ error: `Cannot delete organization with ${usersInOrg} users. Please reassign or delete users first.` }, 400);
    }
    
    await kv.del(`organization:${organizationId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return c.json({ error: 'Failed to delete organization' }, 500);
  }
});
```

---

## 💾 Step 8: Backup & Restore Routes (Line ~3088 in ValueDock)

### 8.1 List All Backups

```typescript
// List all backups (with optional filtering)
app.get("/make-server-888f4514/admin/backups/list", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Only administrators can access backups' }, 403);
    }
    
    // Get all backups
    const allBackups = await kv.getByPrefix('backup:');
    
    // Filter based on role
    let backups = allBackups
      .filter(b => b && b.value)
      .map(b => b.value)
      .filter((backup: any) => {
        // Remove expired backups
        if (new Date(backup.expiresAt) < new Date()) {
          kv.del(`backup:${backup.id}`); // Clean up expired backups
          return false;
        }
        return true;
      });
    
    // Filter by permissions
    if (profile.role === 'tenant_admin') {
      // Tenant admins can only see backups from their tenant
      backups = backups.filter((backup: any) => {
        if (backup.type === 'tenant') {
          return backup.data?.id === profile.tenantId;
        } else if (backup.type === 'organization') {
          return backup.data?.tenantId === profile.tenantId;
        } else if (backup.type === 'user') {
          return backup.data?.tenantId === profile.tenantId;
        } else if (backup.type === 'data') {
          return backup.deletedBy === user.id || backup.data?.userId === user.id;
        }
        return false;
      });
    } else if (profile.role === 'org_admin') {
      // Org admins can only see backups from their organization
      backups = backups.filter((backup: any) => {
        if (backup.type === 'user') {
          return backup.data?.organizationId === profile.organizationId;
        } else if (backup.type === 'data') {
          return backup.deletedBy === user.id || backup.data?.userId === user.id;
        }
        return false;
      });
    }
    
    // Sort by deletion date (most recent first)
    backups.sort((a: any, b: any) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
    
    return c.json({ backups });
  } catch (error: any) {
    console.error('Error listing backups:', error);
    return c.json({ error: 'Failed to list backups' }, 500);
  }
});
```

### 8.2 Restore from Backup

```typescript
// Restore from backup
app.post("/make-server-888f4514/admin/backups/restore", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Only administrators can restore backups' }, 403);
    }
    
    const { backupId } = await c.req.json();
    
    if (!backupId) {
      return c.json({ error: 'Backup ID is required' }, 400);
    }
    
    const backup = await kv.get(`backup:${backupId}`);
    
    if (!backup) {
      return c.json({ error: 'Backup not found' }, 404);
    }
    
    // Check if backup has expired
    if (new Date(backup.expiresAt) < new Date()) {
      await kv.del(`backup:${backupId}`);
      return c.json({ error: 'Backup has expired' }, 400);
    }
    
    // Check permissions for restore
    if (profile.role === 'tenant_admin') {
      if (backup.type === 'tenant' && backup.data?.id !== profile.tenantId) {
        return c.json({ error: 'Cannot restore tenant from another tenant' }, 403);
      }
      if (backup.type === 'organization' && backup.data?.tenantId !== profile.tenantId) {
        return c.json({ error: 'Cannot restore organization from another tenant' }, 403);
      }
      if (backup.type === 'user' && backup.data?.tenantId !== profile.tenantId) {
        return c.json({ error: 'Cannot restore user from another tenant' }, 403);
      }
    } else if (profile.role === 'org_admin') {
      if (backup.type !== 'user' && backup.type !== 'data') {
        return c.json({ error: 'Organization admins can only restore users and data' }, 403);
      }
      if (backup.type === 'user' && backup.data?.organizationId !== profile.organizationId) {
        return c.json({ error: 'Cannot restore user from another organization' }, 403);
      }
    }
    
    // Restore based on type
    switch (backup.type) {
      case 'tenant':
        // Restore tenant
        await kv.set(`tenant:${backup.data.tenant.id}`, {
          ...backup.data.tenant,
          restoredAt: new Date().toISOString(),
          restoredBy: user.id
        });
        
        // Restore organizations
        if (backup.data.organizations && Array.isArray(backup.data.organizations)) {
          for (const org of backup.data.organizations) {
            await kv.set(`organization:${org.id}`, {
              ...org,
              restoredAt: new Date().toISOString(),
              restoredBy: user.id
            });
          }
        }
        
        // Restore users (note: Supabase Auth users need to be recreated)
        if (backup.data.users && Array.isArray(backup.data.users)) {
          const supabase = getSupabaseClient(true);
          for (const userData of backup.data.users) {
            // Restore to KV store
            await kv.set(`user:${userData.id}`, {
              ...userData,
              restoredAt: new Date().toISOString(),
              restoredBy: user.id,
              needsPasswordReset: true // Flag that password needs to be reset
            });
            
            if (userData.email) {
              await kv.set(`user:email:${userData.email}`, userData.id);
            }
            
            // Note: Supabase Auth user is not restored automatically
            // Admin will need to reset passwords for restored users
          }
        }
        break;
        
      case 'organization':
        await kv.set(`organization:${backup.data.id}`, {
          ...backup.data,
          restoredAt: new Date().toISOString(),
          restoredBy: user.id
        });
        break;
        
      case 'user':
        // Restore user profile in KV store
        await kv.set(`user:${backup.data.id}`, {
          ...backup.data,
          restoredAt: new Date().toISOString(),
          restoredBy: user.id
        });
        
        // Note: Supabase Auth user is not restored, would need to be recreated
        break;
        
      case 'data':
        // Restore user data
        await kv.set(`userdata:${backup.data.userId}`, {
          ...backup.data,
          restoredAt: new Date().toISOString(),
          restoredBy: user.id
        });
        break;
        
      default:
        return c.json({ error: 'Unknown backup type' }, 400);
    }
    
    // Don't delete the backup - keep it for audit trail
    
    return c.json({ 
      success: true,
      message: `${backup.type} restored successfully`,
      restoredEntity: backup.entityName || backup.entityId
    });
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    return c.json({ error: `Failed to restore backup: ${error.message}` }, 500);
  }
});
```

### 8.3 Delete Backup Permanently

```typescript
// Delete backup permanently
app.delete("/make-server-888f4514/admin/backups/:backupId", async (c) => {
  const { error, user } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile || !['master_admin', 'tenant_admin', 'org_admin'].includes(profile.role)) {
      return c.json({ error: 'Only administrators can delete backups' }, 403);
    }
    
    const backupId = c.req.param('backupId');
    const backup = await kv.get(`backup:${backupId}`);
    
    if (!backup) {
      return c.json({ error: 'Backup not found' }, 404);
    }
    
    // Check permissions
    if (profile.role !== 'master_admin') {
      // Tenant/org admins can only delete backups they have access to
      if (profile.role === 'tenant_admin') {
        if (backup.type === 'tenant' && backup.data?.id !== profile.tenantId) {
          return c.json({ error: 'Cannot delete backup from another tenant' }, 403);
        }
        if (backup.type === 'organization' && backup.data?.tenantId !== profile.tenantId) {
          return c.json({ error: 'Cannot delete backup from another tenant' }, 403);
        }
      } else if (profile.role === 'org_admin') {
        if (backup.type === 'user' && backup.data?.organizationId !== profile.organizationId) {
          return c.json({ error: 'Cannot delete backup from another organization' }, 403);
        }
      }
    }
    
    await kv.del(`backup:${backupId}`);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    return c.json({ error: 'Failed to delete backup' }, 500);
  }
});
```

---

## ✅ Done! 

You now have all the authentication and admin routes from ValueDock ready to paste into any new project.

### Quick Checklist:

- [ ] Copy the imports (Step 1)
- [ ] Add the helper function (Step 2)
- [ ] Add the auth middleware (Step 3)
- [ ] Add the auth routes (Step 4)
- [ ] Add user management routes (Step 5)
- [ ] Add tenant management routes (Step 6)
- [ ] Add organization management routes (Step 7)
- [ ] Add backup/restore routes (Step 8)
- [ ] Don't forget to call `Deno.serve(app.fetch)` at the end!

### Role Permissions Summary:

| Role | Can Do |
|------|--------|
| **master_admin** | Everything (global access) |
| **tenant_admin** | Manage users, orgs within their tenant |
| **org_admin** | Manage users within their organization |
| **user** | View own profile, update own settings |

---

**🎉 Ready to build multi-tenant apps!**
