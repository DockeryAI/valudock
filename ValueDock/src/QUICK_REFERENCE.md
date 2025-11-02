# ValueDock® - Quick Reference Guide

## For Admins: How to Use the Context Switcher

### Desktop Users
1. Look for the **context switcher** in the header (between logo and menu)
2. Click the dropdown button
3. Search or select tenant/organization
4. Your view updates automatically

### Mobile Users
1. Tap the **menu icon** (☰) in the top right
2. Context switcher appears at the top of the menu
3. Select your desired tenant/organization
4. Menu closes and view updates

### Context Switcher Shortcuts
- **Type to search**: Start typing tenant or org name
- **Clear selection**: Choose "All Tenants" or "All Organizations"
- **Quick access**: Your last selection is remembered

---

## Role-Based Quick Actions

### Global Admin (master_admin)
```
📧 Default Account: admin@dockery.ai / admin123
🌐 Access Level: Full system access (no tenant/org restrictions)
⚡ Special Status: Exists OUTSIDE tenant/org hierarchy

✅ Can Do:
- Switch to any tenant or organization
- Create/edit/delete tenants
- Create/edit/delete organizations
- Create/edit/delete users anywhere
- View all data across the system

🎯 Quick Actions:
1. View all tenants: Select "All Tenants"
2. View specific tenant: Select tenant from dropdown
3. View specific org: Select org from dropdown
4. Create new tenant: Admin Dashboard > Tenants > Add Tenant
5. Assign admin during creation: Use AdminUserSelector in dialog

⚠️ Important Notes:
- Global admin does NOT belong to any tenant or organization
- When creating users (except other global admins), you MUST select a tenant
- When creating organizations, you MUST select which tenant it belongs to
```

### Tenant Admin (tenant_admin)
```
✅ Can Do:
- Switch between organizations in your tenant
- Create/edit/delete organizations in your tenant
- Create/edit/delete users in your tenant
- View all data in your tenant

🎯 Quick Actions:
1. View all orgs: Select "All Organizations"
2. View specific org: Select org from dropdown
3. Create new org: Admin Dashboard > Organizations > Add Organization
4. Assign admin during creation: Use AdminUserSelector in dialog
```

### Organization Admin (org_admin)
```
✅ Can Do:
- Create/edit/delete users in your organization
- Manage your organization's data
- Use all calculator features

🎯 Quick Actions:
1. Add user: Admin Dashboard > Users > Add User
2. Manage processes: Inputs Screen > Add Process
3. View ROI: Results Screen
```

### Regular User
```
✅ Can Do:
- Use ROI calculator
- Create/edit processes
- View results and presentations

🎯 Quick Actions:
1. Add process: Inputs Screen > Add Process
2. View savings: Results Screen
3. Export data: Export Screen
```

---

## Common Workflows

### Creating a New Tenant (Global Admin Only)
1. Navigate to **Admin Dashboard**
2. Click **Tenants** tab
3. Click **Add Tenant** button
4. Fill in:
   - Name (e.g., "Acme Reseller")
   - Domain (e.g., "acmereseller.com")
   - Brand Name (e.g., "Acme ValueDock")
   - Primary Color (optional)
5. **Assign Admin** (optional):
   - **Option A**: Select existing user
   - **Option B**: Create new admin user
   - **Option C**: Skip (assign later)
6. Click **Create Tenant**
7. ✅ Success! Tenant appears in list

### Creating a New Organization
1. Navigate to **Admin Dashboard**
2. Click **Organizations** tab
3. Click **Add Organization** button
4. Fill in:
   - Short Name (e.g., "acme-corp")
   - Company Name (e.g., "Acme Corporation")
   - Domain (e.g., "acme.com")
   - Tenant (select from dropdown)
   - Description (optional)
5. **Assign Admin** (optional):
   - **Option A**: Select existing user
   - **Option B**: Create new admin user
   - **Option C**: Skip (assign later)
6. Click **Create Organization**
7. ✅ Success! Organization appears in list

### Adding a User
1. Navigate to **Admin Dashboard**
2. Click **Users** tab
3. Click **Add User** button
4. Fill in:
   - Full Name
   - Email
   - Password
   - Role (user, org_admin, tenant_admin, master_admin)
   - Tenant (if applicable)
   - Organization (if applicable)
   - Group (optional)
5. Click **Create User**
6. ✅ Success! User appears in list

### Switching Context (Admins)
1. Click **context switcher** (desktop) or **menu** (mobile)
2. **To view all**: Select "All Tenants" or "All Organizations"
3. **To view specific**: Select tenant or organization
4. **To search**: Type in search box
5. ✅ View updates! Welcome message shows current context

### Bulk Deleting Entities
1. Navigate to **Admin Dashboard**
2. Select entity tab (Tenants/Organizations/Users)
3. Check boxes next to items to delete
4. Click **Delete X Selected** button
5. Confirm deletion
6. ✅ Success! Items removed

---

## Data Management

### Saving Your Work
- **Auto-save**: Happens automatically every 2 seconds
- **Manual save**: Use menu > Save Snapshot
- **Where saved**: Supabase (cloud) + localStorage (browser backup)

### Restoring Data
- **Admin only**: Menu > Restore Snapshot
- Restores most recent saved snapshot
- Useful for recovering from mistakes

### Clearing All Data
- **Admin only**: Menu > Clear All Data
- Type "delete" to confirm
- ⚠️ **Warning**: Cannot be undone!

---

## Navigation Quick Tips

### Keyboard Shortcuts
- **Tab**: Navigate through form fields
- **Enter**: Submit forms (in dialogs)
- **Escape**: Close dialogs
- **Shift + Tab**: Navigate backwards

### Screen Navigation
| Screen | Purpose | Access |
|--------|---------|--------|
| **Inputs** | Add/edit processes | Main tabs |
| **Implementation** | Configure setup | Main tabs |
| **Results** | View ROI calculations | Main tabs |
| **Timeline** | See rollout schedule | Main tabs |
| **Scenarios** | Compare options | Main tabs |
| **Export** | Download data | Main tabs |
| **Presentation** | Client-facing view | Main tabs |
| **Admin** | Manage entities | Admin menu |
| **Profile** | User settings | User menu |

### Mobile Navigation
- **Swipe**: Navigate between tabs
- **Tap menu**: Access all features
- **Scroll**: View full content
- **Pinch zoom**: Enlarge charts (if needed)

---

## Troubleshooting

### Context Switcher Issues

**Problem**: Context switcher not showing
- **Solution**: Check your role - must be master_admin or tenant_admin

**Problem**: Organizations not showing in dropdown
- **Solution**: Make sure you've selected the correct tenant first

**Problem**: Can't switch to certain org
- **Solution**: You may not have permission - contact your admin

### Admin User Assignment Issues

**Problem**: Can't create new admin user
- **Solution**: Check all required fields (name, email, password)

**Problem**: Existing user not in dropdown
- **Solution**: User might belong to different tenant - check tenant selection

**Problem**: Admin assignment didn't work
- **Solution**: Check user list - role should be updated

### Data Issues

**Problem**: Changes not saving
- **Solution**: Check internet connection - data saves to cloud

**Problem**: Data disappeared
- **Solution**: Use "Restore Snapshot" from menu (admin only)

**Problem**: Wrong organization data showing
- **Solution**: Use context switcher to select correct organization

### Login Issues

**Problem**: Can't log in
- **Solution**: Check email and password - contact admin if forgotten

**Problem**: "Unauthorized" error
- **Solution**: Your session expired - log in again

**Problem**: Can't access certain features
- **Solution**: You may not have permission - contact your admin

---

## Best Practices

### For All Users
✅ Save regularly (though auto-save handles this)
✅ Use descriptive names for processes
✅ Group related processes together
✅ Review results before presenting to clients

### For Admins
✅ Create organizations before creating users
✅ Assign appropriate roles to users
✅ Use context switcher to verify you're in correct org
✅ Take snapshots before major changes
✅ Assign admin users during tenant/org creation

### For Global Admins
✅ Regularly review all tenants
✅ Monitor cross-tenant metrics
✅ Set up white-label branding for each tenant
✅ Use "All Tenants" view for system-wide oversight

---

## Support & Help

### In-App Documentation
- **Menu > Documentation**: View full documentation
- **Tooltips**: Hover over ? icons for help
- **Error messages**: Read carefully - they explain what to fix

### Getting Help
1. Check this Quick Reference
2. Review in-app Documentation
3. Contact your organization admin
4. If you're the admin, contact tenant admin
5. If you're the tenant admin, contact global admin

---

## Keyboard Shortcuts Reference

### General
- `Ctrl/Cmd + S`: Save snapshot (if admin)
- `Tab`: Next field
- `Shift + Tab`: Previous field
- `Enter`: Submit form
- `Escape`: Close dialog/modal

### Navigation
- Click tabs to switch screens
- Click menu for more options
- Use context switcher for tenant/org navigation

---

## Feature Checklist

### Using the ROI Calculator
- [ ] Create processes in Inputs screen
- [ ] Set implementation timeline
- [ ] Review calculated savings in Results
- [ ] Check timeline for rollout plan
- [ ] Export data or share link

### Managing Your Organization (Admins)
- [ ] Add users to your organization
- [ ] Assign appropriate roles
- [ ] Configure organization settings
- [ ] Monitor user activity
- [ ] Take regular snapshots

### Managing Multiple Entities (Tenant/Global Admins)
- [ ] Use context switcher to navigate
- [ ] Create tenants (global admin)
- [ ] Create organizations
- [ ] Assign admin users during creation
- [ ] Review cross-entity analytics
- [ ] Configure white-label branding

---

## Quick Tips

💡 **Tip 1**: Your last selected context is remembered - no need to re-select every time

💡 **Tip 2**: Use search in context switcher to quickly find organizations

💡 **Tip 3**: Check the welcome message to confirm which context you're viewing

💡 **Tip 4**: Bulk operations save time - select multiple items before deleting

💡 **Tip 5**: Assign admin users during tenant/org creation to streamline setup

💡 **Tip 6**: Mobile users can access everything - context switcher is in the menu

💡 **Tip 7**: Global admins can view aggregate data by selecting "All Tenants"

💡 **Tip 8**: Use snapshots before making major changes - easy to restore

💡 **Tip 9**: Auto-save happens every 2 seconds - don't worry about losing work

💡 **Tip 10**: Read error messages - they tell you exactly what to fix

---

## Version Information

- **Application**: ValueDock®
- **Version**: 2.0.0
- **Last Updated**: Current session
- **Features**: Multi-tenant, Context Switching, Admin Management, ROI Calculator

---

**Need more help?** Check the full documentation in Menu > Documentation
