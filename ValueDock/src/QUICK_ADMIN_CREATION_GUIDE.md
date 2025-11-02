# Quick Admin Creation Guide

## TL;DR - Create Users with Admin Rights

### 🎯 Quick Decision Tree

```
Need to create a user?
│
├─ Should they manage other users?
│  │
│  ├─ YES → Continue to admin assignment
│  │  │
│  │  ├─ Manage entire system?
│  │  │  └─ Create GLOBAL ADMIN ⭐
│  │  │
│  │  ├─ Manage all orgs in a tenant?
│  │  │  └─ Create TENANT ADMIN 🏢
│  │  │
│  │  └─ Manage one organization?
│  │     └─ Create ORGANIZATION ADMIN 🏛️
│  │
│  └─ NO → Create REGULAR USER 👤
```

---

## 🚀 Quick Start Steps

### 1. Open User Creation Dialog

Click **"Add User"** button in Admin Dashboard → User Management section

### 2. Enter Basic Info

```
✓ Full Name
✓ Email Address
✓ Password
```

### 3. Choose Admin Rights Level

Select from dropdown:
- 👤 **Regular User** - No admin access
- 🏛️ **Organization Admin** - Manages one organization
- 🏢 **Tenant Admin** - Manages tenant + all orgs
- ⭐ **Global Admin** - Full system access

### 4. Configure Based on Selection

See quick guides below ⬇️

---

## 📋 Quick Guides by User Type

### 👤 Regular User (No Admin Rights)

**When to use**: Standard employees, team members

```
1. Select "Regular User (No Admin Rights)"
2. Choose Tenant (if you're Global Admin)
3. Choose Organization ✓ REQUIRED
4. Optional: Assign to Groups
5. Click "Create User"
```

**Result**: User can access ROI tools within their organization

---

### 🏛️ Organization Admin - Existing Organization

**When to use**: Make someone admin of existing department/division

```
1. Select "Organization Admin"
2. Tab: "Existing Organization"
3. Choose Tenant (if you're Global Admin)
4. Choose Organization to administer
5. Optional: Assign to Groups
6. Click "Create User"
```

**Result**: User can manage all users in that organization

---

### 🏛️ Organization Admin - New Organization

**When to use**: Creating new department and its admin simultaneously

```
1. Select "Organization Admin"
2. Tab: "Create New Organization"
3. Choose Tenant (if you're Global Admin)
4. Enter:
   • Organization Name
   • Company Name
   • Domain (e.g., dept.company.com)
   • Description (optional)
5. Click "Create User"
```

**Result**: New organization created + user is its admin

---

### 🏢 Tenant Admin - Existing Tenant

**When to use**: Delegate tenant management to partner/reseller

```
1. Select "Tenant Admin"
2. Tab: "Existing Tenant"
3. Choose Tenant to administer
4. Click "Create User"
```

**Result**: User can manage all orgs/users in that tenant

---

### 🏢 Tenant Admin - New Tenant

**When to use**: Onboarding new reseller/partner

```
1. Select "Tenant Admin"
2. Tab: "Create New Tenant"
3. Enter:
   • Tenant Name
   • Tenant Domain
   • Brand Name (optional)
4. Click "Create User"
```

**Result**: New tenant created + user is its admin

---

### ⭐ Global Admin

**When to use**: Creating system administrators (use sparingly!)

```
1. Select "Global Admin (Full System Access)"
2. Read the warning notice
3. Click "Create User"
```

**Result**: User has unrestricted access to everything

---

## 🎨 Visual Indicators

When creating users, look for these visual cues:

| Admin Type | Color | Icon | Permission Scope |
|------------|-------|------|------------------|
| Global Admin | 🟣 Purple | 🌐 Globe | Entire system |
| Tenant Admin | 🔵 Blue | 🛡️ Shield | One tenant + all orgs |
| Org Admin | 🟢 Green | 🏛️ Building | One organization |
| Regular User | ⚪ Gray | 👤 User | Limited to org/groups |

---

## ⚡ Common Scenarios

### Scenario 1: New Employee Joins Sales Team

```
Admin Rights: Regular User
Organization: Sales Division
Groups: ✓ Select "Sales Operations"
```

### Scenario 2: Promote Sarah to Department Manager

```
Admin Rights: Organization Admin
Choose: Existing Organization → "Marketing Department"
```

### Scenario 3: New Reseller Partner "Acme Corp"

```
Admin Rights: Tenant Admin
Choose: Create New Tenant
Name: "Acme Corp"
Domain: "acmecorp.com"
```

### Scenario 4: Create New Product Division with Manager

```
Admin Rights: Organization Admin
Choose: Create New Organization
Name: "Product Division"
Company: "TechCo Product Team"
Domain: "product.techco.com"
```

---

## ✅ Validation Checklist

Before clicking "Create User":

- [ ] Email address is valid and unique
- [ ] Password meets security requirements
- [ ] Admin level matches intended permissions
- [ ] Tenant/Organization correctly selected
- [ ] (If creating new entity) Domain is valid format
- [ ] (For regular users) Groups assigned if needed

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T

- Create Global Admins unnecessarily
- Use invalid domain formats (e.g., "http://company.com")
- Forget to assign groups for regular users
- Skip organization selection for non-global users

### ✅ DO

- Grant minimum necessary permissions
- Use descriptive names for new entities
- Verify user email before creating admin accounts
- Document why admin rights were granted

---

## 🔐 Security Best Practices

1. **Strong Passwords**: Minimum 8 characters, mixed case, numbers
2. **Verify Identity**: Confirm user identity before granting admin rights
3. **Principle of Least Privilege**: Grant only necessary permissions
4. **Regular Reviews**: Audit admin assignments quarterly
5. **Document Changes**: Keep track of who has admin rights and why

---

## 🆘 Quick Troubleshooting

| Error Message | Quick Fix |
|---------------|-----------|
| "Please select a tenant" | Select a tenant from dropdown first |
| "Invalid domain format" | Use format: `company.com` (no http://) |
| "No organizations available" | Create an organization first |
| "Unauthorized" | You don't have permission for this action |

---

## 📱 Mobile Quick Tips

When creating users on mobile:

- Tap sections to expand them
- Scroll to see all options
- Use landscape mode for easier form filling
- Double-check selections before submitting

---

## 🔄 What Happens After Creation?

1. ✅ User account is created
2. 📧 User receives login credentials (if email configured)
3. 🔐 User can log in immediately
4. 👥 User appears in User Management table
5. 🎯 Permissions take effect instantly

---

## 📞 Need Help?

- **Documentation**: See [ADMIN_RIGHTS_ASSIGNMENT.md](ADMIN_RIGHTS_ASSIGNMENT.md)
- **Permissions**: See [docs/permissions-matrix.md](docs/permissions-matrix.md)
- **Global Admin**: See [GLOBAL_ADMIN_DOCUMENTATION.md](GLOBAL_ADMIN_DOCUMENTATION.md)
- **First Time Setup**: See [FIRST_TIME_SETUP.md](FIRST_TIME_SETUP.md)

---

**Quick Reference Version**: 2.0  
**Last Updated**: October 10, 2025  
**Print-Friendly**: ✓ Yes
