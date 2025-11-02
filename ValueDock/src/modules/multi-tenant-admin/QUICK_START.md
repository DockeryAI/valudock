# Multi-Tenant Admin Module - Quick Start

Get up and running with the multi-tenant admin system in 5 minutes.

## What You Get

A complete admin system with:
- ✅ User management with 4 permission levels
- ✅ Tenant and organization hierarchy
- ✅ Role-based access control
- ✅ Context switching for multi-tenant admins
- ✅ Backup & restore functionality
- ✅ Mobile-responsive UI
- ✅ Group management for users

## 5-Minute Setup

### 1. Copy Module Files (30 seconds)

```bash
# From your ValueDock project
cp -r /modules/multi-tenant-admin /your-new-project/modules/
```

### 2. Initialize in Your App (1 minute)

```tsx
// In your App.tsx or main entry file
import { initializeAuth } from './modules/multi-tenant-admin';

function App() {
  useEffect(() => {
    initializeAuth({
      projectId: 'your-supabase-project-id', // From Supabase dashboard
      apiEndpoint: '/make-server-888f4514',   // Your API route prefix
      enableBackups: true,
      enableGroupManagement: true,
    });
  }, []);

  return <YourApp />;
}
```

### 3. Set Up Backend (2 minutes)

Copy the backend code from `/modules/multi-tenant-admin/backend/` into your Supabase Edge Function:

```bash
# Copy the routes
cp /modules/multi-tenant-admin/backend/backend-routes.tsx \
   /your-project/supabase/functions/server/multi-tenant-routes.tsx

# Then import in your index.tsx
```

### 4. Add Admin Panel (1 minute)

```tsx
import { MultiTenantAdminPanel } from './modules/multi-tenant-admin';

function AdminPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <MultiTenantAdminPanel currentUser={currentUser} />;
}
```

### 5. Create Your First Admin User (30 seconds)

In Supabase SQL editor:

```sql
-- Create a global admin user in KV store
-- (Replace USER_ID_FROM_AUTH with actual Supabase Auth user ID)

INSERT INTO kv_store_888f4514 (key, value)
VALUES (
  'user:YOUR_USER_ID_FROM_AUTH',
  '{
    "id": "YOUR_USER_ID_FROM_AUTH",
    "email": "admin@yourcompany.com",
    "name": "Global Admin",
    "role": "master_admin",
    "tenantId": null,
    "organizationId": null,
    "groupIds": [],
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }'::jsonb
);
```

## Done! 🎉

You now have a fully functional multi-tenant admin system.

## What to Do Next

### Create Your First Tenant

1. Log in as global admin
2. Go to Admin Dashboard → Tenants tab
3. Click "Add Tenant"
4. Fill in:
   - **Name**: e.g., "Acme Consulting"
   - **Domain**: e.g., "acme.com"
5. Optionally assign a tenant admin
6. Click "Create Tenant"

### Create Your First Organization

1. Go to Organizations tab
2. Click "Add Organization"
3. Fill in:
   - **Name**: e.g., "Acme Corp Client"
   - **Company Name**: e.g., "Acme Corporation"
   - **Domain**: e.g., "acmecorp.com"
   - **Tenant**: Select from dropdown
4. Optionally assign an org admin
5. Click "Create Organization"

### Create Your First User

1. Go to Users tab (or use the tree view)
2. Click "Add User"
3. Fill in:
   - **Email**: user@example.com
   - **Password**: (minimum 8 characters)
   - **Name**: User Name
   - **Role**: Select user role
   - **Tenant**: Select tenant (if not global admin)
   - **Organization**: Select organization
4. Optionally assign to groups
5. Click "Create User"

## Usage Examples

### Example 1: Multi-Tenant SaaS

```
Your SaaS Company (Global Admin)
├── Tenant: Consulting Firm A
│   ├── Org: Client Company 1
│   │   ├── User: john@client1.com (user)
│   │   └── User: jane@client1.com (org_admin)
│   └── Org: Client Company 2
│       └── User: bob@client2.com (user)
└── Tenant: Consulting Firm B
    └── Org: Client Company 3
        └── User: alice@client3.com (user)
```

### Example 2: Enterprise with Departments

```
Your Company (Global Admin)
├── Tenant: Your Company
    ├── Org: Sales Department
    │   ├── User: sales1@company.com
    │   └── User: sales2@company.com
    ├── Org: Engineering Department
    │   ├── User: eng1@company.com
    │   └── User: eng2@company.com
    └── Org: Marketing Department
        └── User: marketing1@company.com
```

## Understanding Roles

### Global Admin (master_admin)
- Can do EVERYTHING
- Manages all tenants, organizations, and users
- Typically your company's super admin

### Tenant Admin (tenant_admin)
- Manages all organizations within their tenant
- Manages all users within their tenant
- Cannot manage other tenants
- Typical use: Partner/MSP admin

### Organization Admin (org_admin)
- Manages users within their organization only
- Cannot manage other organizations
- Typical use: Client company admin

### User (user)
- Can use the app
- Cannot manage anything
- Typical use: End users

## Common Workflows

### Workflow 1: Add a New Partner

1. Create tenant (e.g., "Partner XYZ")
2. Create tenant admin user
3. Tenant admin logs in and creates their client organizations
4. Tenant admin adds users to each client org

### Workflow 2: Add a New Client Organization

1. Tenant admin creates organization
2. Assigns org admin (optional)
3. Org admin adds users
4. Users can now access the app

### Workflow 3: Context Switching

Global and Tenant Admins can switch context:

1. Click the context switcher in top navigation
2. Select a tenant (global admin only)
3. Select an organization within that tenant
4. Data now scoped to that context

## Customization Quick Tips

### Custom Fields

Add custom fields to user profiles:

```typescript
// Extend UserProfile type
interface CustomUserProfile extends UserProfile {
  department?: string;
  phoneNumber?: string;
}
```

### Custom Validation

Add custom email domain validation:

```typescript
initializeAuth({
  // ... other config
  customValidation: {
    email: (email) => {
      // Only allow company emails
      return email.endsWith('@yourcompany.com');
    },
  },
});
```

### Custom Styling

Override default styles in your CSS:

```css
/* Custom admin panel colors */
[data-admin-panel] {
  --primary: your-color;
  --accent: your-accent-color;
}
```

## Troubleshooting Quick Fixes

### "Auth not initialized"
```tsx
// Make sure you call initializeAuth before rendering components
useEffect(() => {
  initializeAuth({ /* config */ });
}, []);
```

### "No users showing"
```bash
# Check KV store has data
curl https://your-project.supabase.co/functions/v1/make-server-888f4514/debug/keys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### "Permission denied"
```sql
-- Verify user role in database
SELECT value->>'role' FROM kv_store_888f4514 WHERE key = 'user:YOUR_USER_ID';
```

## Next Steps

- [ ] Read the full [Integration Guide](./INTEGRATION_GUIDE.md)
- [ ] Review [Backend Setup](./backend/BACKEND_SETUP.md)
- [ ] Check out the [Example Apps](./examples/)
- [ ] Customize for your use case
- [ ] Deploy to production!

## Support

Need help?
1. Check the [README](./README.md) for features and overview
2. Review [Integration Guide](./INTEGRATION_GUIDE.md) for detailed setup
3. See [Backend Setup](./backend/BACKEND_SETUP.md) for server configuration

## You're Ready! 🚀

The multi-tenant admin module is now ready to use in any of your applications. It's a complete, production-ready system that you can customize and extend as needed.

Happy building!
