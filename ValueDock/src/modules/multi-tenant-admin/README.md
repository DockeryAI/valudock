# Multi-Tenant Admin Module

A complete multi-tenant administration system with role-based access control, user management, and organization hierarchy.

## Features

- **Multi-Tenant Architecture**: Support for tenants, organizations, and users
- **Role-Based Access Control**: 4 permission levels (Global Admin, Tenant Admin, Org Admin, User)
- **User Management**: Create, edit, delete users with group assignments
- **Hierarchical Organization**: Tenants → Organizations → Users
- **Context Switching**: Switch between tenants/organizations you manage
- **Backup & Restore**: Built-in deletion safety with backup system
- **Mobile Responsive**: Works on all devices

## Installation

### 1. Copy the module to your project

```bash
cp -r /modules/multi-tenant-admin /your-project/modules/
```

### 2. Install required dependencies

The module requires the following packages (already available in Figma Make):
- React
- @supabase/supabase-js
- Tailwind CSS
- shadcn/ui components
- lucide-react (icons)
- sonner (toast notifications)

### 3. Set up the backend

Copy the backend routes from `/modules/multi-tenant-admin/backend/routes.tsx` into your Supabase Edge Function.

### 4. Configure your app

```tsx
import { MultiTenantAdmin } from './modules/multi-tenant-admin';
import { UserProfile } from './modules/multi-tenant-admin/types';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  return (
    <MultiTenantAdmin
      currentUser={currentUser}
      projectId="your-supabase-project-id"
      apiEndpoint="/make-server-888f4514"
    />
  );
}
```

## Permissions Matrix

| Role | Manage Tenants | Manage Orgs | Manage Users | Scope |
|------|---------------|-------------|--------------|-------|
| **Global Admin** (master_admin) | ✅ All | ✅ All | ✅ All | System-wide |
| **Tenant Admin** (tenant_admin) | ❌ | ✅ Own Tenant | ✅ Own Tenant | Tenant-scoped |
| **Org Admin** (org_admin) | ❌ | ❌ | ✅ Own Org | Org-scoped |
| **User** (user) | ❌ | ❌ | ❌ | Read-only |

## Data Model

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'master_admin' | 'tenant_admin' | 'org_admin' | 'user';
  tenantId: string | null;
  organizationId: string | null;
  groupIds?: string[];
  readOnly?: boolean;
  active: boolean;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings?: {
    brandName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  companyName: string;
  domain: string;
  tenantId: string;
  description?: string;
  createdAt: string;
}
```

## Usage Examples

### Basic Integration

```tsx
import { MultiTenantAdmin } from './modules/multi-tenant-admin';

<MultiTenantAdmin currentUser={currentUser} />
```

### Custom Styling

The module uses Tailwind CSS and respects your app's existing design system. Customize through your `globals.css` file.

### Accessing User Data

```tsx
import { useMultiTenant } from './modules/multi-tenant-admin/hooks';

function MyComponent() {
  const { currentUser, tenants, organizations, users } = useMultiTenant();
  
  // Your component logic
}
```

## API Endpoints Required

The module requires the following backend endpoints:

- `POST /auth/signup` - Create new user
- `GET /auth/profile` - Get user profile
- `GET /admin/users` - List users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/tenants` - List tenants (Global Admin only)
- `POST /admin/tenants` - Create tenant (Global Admin only)
- `PUT /admin/tenants/:id` - Update tenant (Global Admin only)
- `DELETE /admin/tenants/:id` - Delete tenant (Global Admin only)
- `GET /admin/organizations` - List organizations
- `POST /admin/organizations` - Create organization
- `PUT /admin/organizations/:id` - Update organization
- `DELETE /admin/organizations/:id` - Delete organization
- `GET /admin/backups` - List backups
- `POST /admin/restore/:id` - Restore from backup

## Backend Setup

See `/modules/multi-tenant-admin/backend/` for complete backend implementation that you can copy into your Supabase Edge Functions.

## Customization

### Custom Roles

Add new roles by extending the `UserProfile` type and updating the permission checks.

### Custom Fields

Add custom fields to tenants/organizations by modifying the data models and forms.

### Custom Validation

Add custom validation rules in the form components.

## Security Notes

⚠️ **IMPORTANT**: 
- The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the frontend
- All admin operations must go through authenticated backend endpoints
- Always validate user permissions server-side
- Domain validation prevents typos and ensures data integrity

## Support

For issues or questions:
1. Check the documentation in `/modules/multi-tenant-admin/docs/`
2. Review the example implementation
3. Check the troubleshooting guide

## License

This module is part of your ValueDock® application and can be reused in your projects.
