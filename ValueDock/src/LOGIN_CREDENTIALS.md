# ValueDock® Login Credentials

**Quick reference for test accounts**

---

## Default Test Accounts

After initializing the database, use these credentials:

### Master Admin (Full System Access)
```
Email:    admin@valuedock.com
Password: admin123
```

**Permissions:**
- Full system access
- Manage all tenants, organizations, and users
- Access all ROI calculations
- System administration

---

### Regular User (Organization Access)
```
Email:    finance@testorganization.com
Password: Test123!
```

**Permissions:**
- Access Test Organization's ROI calculators
- Create and edit processes
- View results and presentations
- No admin panel access

---

## First Time Setup

### If you see "Invalid login credentials"

1. **Click "Initialize Database" button** on login screen
2. Wait for green success message
3. Credentials will be auto-filled
4. Click "Sign In"

### Manual Initialization (if button doesn't work)

Open browser console (F12) and run:

```javascript
fetch('https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => {
  console.log('✅ Initialization complete!');
  console.log('Admin:', d.credentials.admin);
  console.log('User:', d.credentials.finance);
})
.catch(e => console.error('❌ Error:', e));
```

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID.

---

## What Gets Created

When you initialize:

✅ **Test Tenant** (tenant_test_001)
- Name: Test Tenant
- Domain: testtenant.com

✅ **Test Organization** (org_test_001)
- Name: Test Organization
- Parent Tenant: Test Tenant
- Domain: testorg.com

✅ **Admin User**
- Email: admin@valuedock.com
- Role: Master Admin (Global)
- Access: All tenants and organizations

✅ **Finance User**
- Email: finance@testorganization.com
- Role: User
- Access: Test Organization only
- Tenant: Test Tenant
- Organization: Test Organization

---

## Creating Your Own Users

### From Admin Panel (After Login)

1. Log in as admin
2. Click **Admin Panel** (top right)
3. Go to **Users** tab
4. Click **Add User**
5. Fill in details:
   - Name
   - Email
   - Password (min 8 characters)
   - Role (Master Admin, Tenant Admin, Org Admin, User)
   - Assign to Tenant/Organization
6. Click **Create User**

### Via API (Advanced)

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/auth/signup', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [YOUR_ACCESS_TOKEN]'
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    name: 'New User',
    role: 'user',
    tenantId: 'tenant_test_001',
    organizationId: 'org_test_001'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## User Roles Explained

### Master Admin (Global)
- Access everything across all tenants
- Create/edit/delete tenants, organizations, users
- System-wide administration
- No tenant/organization restriction

### Tenant Admin
- Manage organizations within their tenant
- Create/edit/delete users in their tenant
- Can be assigned as Org Admin simultaneously
- Tenant-wide access

### Organization Admin
- Manage users within their organization
- Create/edit processes for their org
- Organization-level administration
- Single org access

### User
- Create/edit ROI calculations
- View their organization's data
- No admin capabilities
- Single org access

---

## Password Requirements

When creating users:

- ✅ Minimum 8 characters
- ✅ At least one letter
- ✅ At least one number
- ✅ Special characters allowed
- ❌ No spaces
- ❌ Case sensitive

**Good passwords:**
- Admin123!
- Test123!
- MyPass2024
- Secure#99

**Bad passwords:**
- 12345678 (no letters)
- password (too common)
- test (too short)
- my pass (has space)

---

## Troubleshooting

### Can't log in with default credentials

**Problem:** "Invalid login credentials" error

**Solution:**
1. Database not initialized
2. Click "Initialize Database" button
3. Try again

### Forgot custom user password

**Problem:** Created a user but forgot their password

**Solution (Admin only):**
1. Log in as admin
2. Go to Admin Panel → Users
3. Find the user
4. Click Edit
5. Set new password
6. Save

### Need to reset everything

**Problem:** Want to start fresh

**Solution:**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Delete all users manually
4. Return to login screen
5. Click "Initialize Database"
6. Fresh start with default accounts

---

## Security Notes

### For Development/Testing

The default passwords (admin123, Test123!) are **only for testing**.

### For Production

⚠️ **IMPORTANT**: Before production:

1. **Change all default passwords**
2. **Delete test accounts** (admin@valuedock.com, finance@testorganization.com)
3. **Create production admin** with strong password
4. **Enable email confirmation** in Supabase settings
5. **Set up proper user management** workflows
6. **Use environment variables** for sensitive data
7. **Enable row-level security** in Supabase

### Password Management

- Never share passwords via email or chat
- Use a password manager
- Rotate passwords regularly
- Use unique passwords for each account
- Enable 2FA when available (future feature)

---

## Quick Commands

### Check Database Status

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/status')
  .then(r => r.json())
  .then(d => console.table(d));
```

### List All Users

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/keys')
  .then(r => r.json())
  .then(d => console.table(d['user:']));
```

### Test Health

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/health')
  .then(r => r.json())
  .then(console.log);
```

---

## Getting Help

### Documentation

- **Full auth guide**: [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md)
- **General issues**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Quick start**: [QUICK_START.md](./QUICK_START.md)
- **Admin guide**: [docs/admin/ADMIN_COMPLETE_GUIDE.md](./docs/admin/ADMIN_COMPLETE_GUIDE.md)

### Common Questions

**Q: Can I change the default email addresses?**
A: Yes, but you'll need to modify the `/init` endpoint in `supabase/functions/server/index.tsx`

**Q: How do I add more test organizations?**
A: Log in as admin, go to Admin Panel → Organizations → Add Organization

**Q: Can users belong to multiple organizations?**
A: Not currently. Each user belongs to one tenant and one organization.

**Q: What's the difference between Tenant Admin and Org Admin?**
A: Tenant Admins manage multiple organizations within a tenant. Org Admins only manage one organization.

---

**Last Updated**: January 2025  
**Version**: 1.0.0

**Need immediate help?** See [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md)
