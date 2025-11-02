# Authentication & Admin System Setup

## Overview

This ROI Calculator application now includes a comprehensive Supabase-based authentication system with multi-tenant support, role-based access control, and white-label customization capabilities.

## User Roles

1. **Master Admin** (admin@dockeryai.com)
   - Full system access
   - Can create and manage tenants
   - Can create and manage all users
   - Can configure white-label settings for any tenant

2. **Tenant Admin**
   - Manages users within their tenant
   - Can configure white-label settings for their tenant
   - Cannot access other tenants

3. **Organization Admin**
   - Manages users within their organization
   - Limited to their organization's scope

4. **Regular User**
   - Access to ROI Calculator features
   - No admin capabilities

## Default Credentials

**Master Admin:**
- Email: admin@dockeryai.com
- Password: admin123

⚠️ **IMPORTANT:** Change the master admin password immediately after first login!

## Features

### Authentication
- Secure login/logout
- Session management
- Password-based authentication
- Auto-initialization of master admin account

### User Management
- Create, update, and delete users
- Role assignment
- Tenant/organization assignment
- User activity status

### Multi-Tenant Support
- Isolated tenant environments
- Custom domain support
- Tenant-specific settings
- Data segregation by tenant

### White-Label Customization
- Custom brand name
- Primary and secondary colors
- Logo and favicon URLs
- Custom CSS injection
- Per-tenant branding

### Role-Based Access Control
- Master admin can manage all tenants and users
- Tenant admins can only manage users in their tenant
- Organization admins limited to their organization
- Users have no admin access

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile

### Admin
- `GET /admin/users` - List users (filtered by role)
- `PUT /admin/users/:userId` - Update user
- `DELETE /admin/users/:userId` - Delete user

### Tenants
- `POST /admin/tenants` - Create tenant (master admin only)
- `GET /admin/tenants` - List tenants (master admin only)
- `PUT /admin/tenants/:tenantId` - Update tenant settings
- `GET /tenants/:identifier` - Get tenant by ID or domain

### White-Label
- `GET /whitelabel` - Get white-label settings for current tenant

### System
- `POST /init` - Initialize master admin (idempotent)

## Security Considerations

1. The master admin is auto-created on first run
2. All admin operations require authentication
3. Tenant admins cannot access other tenants' data
4. Service role key is kept server-side only
5. Password should be changed from default immediately

## Usage

### First Time Setup

1. The application will automatically initialize the master admin account
2. Log in with the default credentials
3. Navigate to the Admin tab
4. Create tenants and users as needed

### Creating a Tenant

1. Log in as master admin
2. Go to Admin > Tenants
3. Click "Add Tenant"
4. Fill in tenant details
5. Configure white-label settings

### Managing Users

1. Log in with appropriate admin credentials
2. Go to Admin > Users
3. Create, edit, or delete users
4. Assign roles and tenant/org membership

### White-Label Customization

1. Log in as master or tenant admin
2. Go to Admin > Tenants (or White-Label tab)
3. Edit tenant to customize:
   - Brand name
   - Primary/secondary colors
   - Logo and favicon
   - Custom CSS

## Technical Details

- **Frontend:** React + TypeScript
- **Backend:** Supabase Edge Functions (Hono)
- **Database:** Supabase Postgres + KV Store
- **Auth:** Supabase Auth
- **Session Management:** JWT tokens

## Development Notes

- User profiles stored in KV store with prefix `user:`
- Tenant data stored with prefix `tenant:`
- Email lookup stored with prefix `user:email:`
- All API calls use Bearer token authentication
- Master admin initialization is idempotent