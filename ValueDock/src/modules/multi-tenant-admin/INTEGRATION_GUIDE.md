# Multi-Tenant Admin Module - Integration Guide

This guide shows you how to integrate the Multi-Tenant Admin module into any existing application.

## Quick Start

### Option 1: Use the Complete Admin Panel (Recommended)

```tsx
import { MultiTenantAdminPanel } from './modules/multi-tenant-admin';
import { initializeAuth } from './modules/multi-tenant-admin';

// In your app initialization
initializeAuth({
  projectId: 'your-supabase-project-id',
  apiEndpoint: '/make-server-888f4514', // Your API prefix
  enableBackups: true,
  enableGroupManagement: true,
});

// In your admin route
function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  
  return (
    <MultiTenantAdminPanel currentUser={currentUser} />
  );
}
```

### Option 2: Use Individual Components

```tsx
import { UserManagement, TenantManagement } from './modules/multi-tenant-admin';

function CustomAdminPage() {
  return (
    <div>
      <TenantManagement currentUser={currentUser} />
      <UserManagement currentUser={currentUser} />
    </div>
  );
}
```

### Option 3: Use Hooks Only (Build Your Own UI)

```tsx
import { useMultiTenant, usePermissions } from './modules/multi-tenant-admin';

function MyCustomAdmin() {
  const { users, tenants, organizations, loading, refresh } = useMultiTenant();
  const permissions = usePermissions(currentUser);
  
  if (!permissions.canManageUsers) {
    return <div>Access Denied</div>;
  }
  
  // Build your own UI using the data
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Step-by-Step Integration

### Step 1: Copy Files

Copy the `/modules/multi-tenant-admin` folder into your project:

```bash
your-project/
├── modules/
│   └── multi-tenant-admin/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── backend/
│       ├── types.ts
│       └── index.ts
```

### Step 2: Install Dependencies

The module uses these packages (already in most React/Supabase projects):

```json
{
  "dependencies": {
    "react": "^18.x",
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "latest",
    "sonner": "^2.0.3"
  }
}
```

Plus shadcn/ui components (copy from your existing project):
- Button, Input, Select, Dialog, Card, Badge, Alert, etc.

### Step 3: Set Up Backend Routes

Copy the backend routes from `/modules/multi-tenant-admin/backend/routes.tsx` into your Supabase Edge Function:

```tsx
// In your /supabase/functions/server/index.tsx
import { adminRoutes } from './multi-tenant-admin-routes';

// Add to your Hono app
app.route('/make-server-888f4514/admin', adminRoutes);
app.route('/make-server-888f4514/auth', authRoutes);
```

### Step 4: Initialize in Your App

```tsx
// In your App.tsx or main entry point
import { initializeAuth } from './modules/multi-tenant-admin';

function App() {
  useEffect(() => {
    initializeAuth({
      projectId: 'your-project-id',
      apiEndpoint: '/make-server-888f4514',
      enableBackups: true,
      enableGroupManagement: true,
    });
  }, []);
  
  return <YourApp />;
}
```

### Step 5: Add Admin Route

```tsx
import { MultiTenantAdminPanel } from './modules/multi-tenant-admin';

function AdminRoute() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <LoginScreen />;
  }
  
  // Check if user has admin access
  if (!['master_admin', 'tenant_admin', 'org_admin'].includes(currentUser.role)) {
    return <div>Access Denied</div>;
  }
  
  return <MultiTenantAdminPanel currentUser={currentUser} />;
}
```

## File Structure Reference

```
modules/multi-tenant-admin/
├── README.md                          # Module overview
├── INTEGRATION_GUIDE.md               # This file
├── index.ts                           # Main exports
├── types.ts                           # TypeScript types
├── components/
│   ├── MultiTenantAdminPanel.tsx     # Main admin panel
│   ├── UserManagement.tsx            # User management UI
│   ├── TenantManagement.tsx          # Tenant management UI
│   ├── OrganizationManagement.tsx    # Organization management UI
│   ├── ContextSwitcher.tsx           # Tenant/Org switcher
│   ├── CreateUserDialog.tsx          # User creation dialog
│   ├── EditUserDialog.tsx            # User editing dialog
│   └── DeleteConfirmationDialog.tsx  # Delete confirmation
├── hooks/
│   ├── useMultiTenant.ts             # Main data hook
│   ├── usePermissions.ts             # Permission checks
│   └── useAuth.ts                    # Authentication hook
├── utils/
│   ├── auth.ts                       # Auth utilities
│   └── validation.ts                 # Validation functions
└── backend/
    ├── routes.tsx                    # Backend routes
    ├── auth.tsx                      # Auth endpoints
    ├── users.tsx                     # User CRUD
    ├── tenants.tsx                   # Tenant CRUD
    └── organizations.tsx             # Organization CRUD
```

## Customization Options

### Custom Roles

Add custom roles by extending the `UserRole` type:

```tsx
// In your app
import { UserProfile } from './modules/multi-tenant-admin';

interface CustomUserProfile extends UserProfile {
  role: 'master_admin' | 'tenant_admin' | 'org_admin' | 'user' | 'custom_role';
  customField?: string;
}
```

### Custom Validation

Pass custom validation functions:

```tsx
initializeAuth({
  projectId: 'your-project',
  apiEndpoint: '/api',
  customValidation: {
    email: (email) => email.endsWith('@yourcompany.com'),
    domain: (domain) => domain !== 'blocked-domain.com',
  },
});
```

### Custom Styling

The module uses Tailwind CSS classes. Override in your `globals.css`:

```css
/* Custom admin panel styling */
.multi-tenant-admin {
  /* Your custom styles */
}
```

## Common Integration Patterns

### Pattern 1: Embed in Existing Admin

```tsx
function YourExistingAdmin() {
  return (
    <div>
      <YourNavigation />
      <YourDashboard />
      
      {/* Add tenant management as a tab */}
      <Tabs>
        <TabsContent value="settings">
          <YourSettings />
        </TabsContent>
        <TabsContent value="users">
          <MultiTenantAdminPanel currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Pattern 2: Standalone Admin Portal

```tsx
function AdminPortal() {
  return (
    <MultiTenantAdminPanel 
      currentUser={currentUser}
      onLogout={() => handleLogout()}
    />
  );
}
```

### Pattern 3: Custom UI with Module Hooks

```tsx
import { useMultiTenant, usePermissions } from './modules/multi-tenant-admin';

function CustomUserList() {
  const { users, deleteUser, updateUser } = useMultiTenant();
  const permissions = usePermissions(currentUser);
  
  return (
    <YourCustomTable
      data={users}
      onDelete={permissions.canManageUsers ? deleteUser : undefined}
      onEdit={permissions.canManageUsers ? updateUser : undefined}
    />
  );
}
```

## Migration from ValueDock

If you're migrating from ValueDock® to use this module in a new app:

1. **Copy the module**: The module is already extracted from ValueDock
2. **Update imports**: Change imports from `./components/AdminDashboard` to `./modules/multi-tenant-admin`
3. **Update API endpoints**: Make sure your backend routes match
4. **Test permissions**: Verify role-based access works correctly

## Troubleshooting

### Issue: "Auth not initialized"

**Solution**: Call `initializeAuth()` before using any components:

```tsx
useEffect(() => {
  initializeAuth({ projectId: 'xxx', apiEndpoint: '/api' });
}, []);
```

### Issue: "No users showing up"

**Solution**: Check backend routes are set up and CORS is enabled:

```tsx
app.use('/*', cors({ origin: '*' }));
```

### Issue: "Permission denied"

**Solution**: Verify the user's role in the database and check permission logic.

## Support Files

- See `/modules/multi-tenant-admin/README.md` for feature overview
- See `/modules/multi-tenant-admin/backend/` for backend setup
- See example apps in `/modules/multi-tenant-admin/examples/`

## Next Steps

1. ✅ Copy module files
2. ✅ Set up backend routes  
3. ✅ Initialize auth
4. ✅ Add to your app
5. ✅ Test with different user roles
6. ✅ Customize as needed

Happy building! 🚀
