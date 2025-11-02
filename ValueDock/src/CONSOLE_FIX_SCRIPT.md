# 🛠️ Console Fix Script - Fix Global Admin Role

## Quick Fix for "admin@dockery.ai" User

If the AdminRoleFixer button isn't working, you can run this script directly in the browser console:

### Step 1: Open Browser Console
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Click the **Console** tab
3. Paste the script below

### Step 2: Run This Script

```javascript
// Fix Global Admin Role
(async function fixGlobalAdmin() {
  console.log('🔧 Starting Global Admin role fix...');
  
  // Get auth token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No auth token found. Please log in first.');
    return;
  }
  
  console.log('✅ Auth token found');
  
  // First, find the Global Admin user
  console.log('📡 Fetching users...');
  const usersResponse = await fetch(
    'https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/admin/users',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const usersData = await usersResponse.json();
  console.log('📦 Users data:', usersData);
  
  // Find admin@dockery.ai
  const globalAdmin = usersData.users?.find(u => u.email === 'admin@dockery.ai');
  
  if (!globalAdmin) {
    console.error('❌ Could not find admin@dockery.ai user');
    return;
  }
  
  console.log('👤 Found Global Admin:', {
    id: globalAdmin.id,
    name: globalAdmin.name,
    currentRole: globalAdmin.role,
    currentTenantId: globalAdmin.tenantId,
    currentOrgId: globalAdmin.organizationId
  });
  
  // Check if already correct
  if (globalAdmin.role === 'master_admin' && !globalAdmin.tenantId && !globalAdmin.organizationId) {
    console.log('✅ Global Admin already has correct role!');
    return;
  }
  
  // Fix the role
  console.log('🔧 Updating Global Admin role to master_admin...');
  const updateResponse = await fetch(
    `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/admin/users/${globalAdmin.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'master_admin',
        tenantId: null,
        organizationId: null
      })
    }
  );
  
  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    console.error('❌ Update failed:', error);
    return;
  }
  
  const updateData = await updateResponse.json();
  console.log('✅ Update successful!', updateData);
  
  console.log('');
  console.log('🎉 DONE! Global Admin role has been fixed.');
  console.log('👉 Please refresh the page (F5) to see the changes.');
  
})();
```

### Step 3: Refresh Page
After the script completes, refresh the page to see the changes.

---

## Expected Output

If successful, you should see:
```
🔧 Starting Global Admin role fix...
✅ Auth token found
📡 Fetching users...
📦 Users data: {...}
👤 Found Global Admin: { id: "...", name: "Global Admin", currentRole: "org_admin", ... }
🔧 Updating Global Admin role to master_admin...
✅ Update successful! {...}

🎉 DONE! Global Admin role has been fixed.
👉 Please refresh the page (F5) to see the changes.
```

---

## Alternative: Fix All Incorrect Roles

If you want to fix ALL users with incorrect roles:

```javascript
// Fix All Incorrect Roles
(async function fixAllRoles() {
  console.log('🔧 Starting role fixes...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No auth token found');
    return;
  }
  
  // Get users
  const response = await fetch(
    'https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/admin/users',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await response.json();
  const users = data.users || [];
  
  console.log(`📊 Found ${users.length} total users`);
  
  // Find users to fix
  const toFix = [];
  
  // Check Global Admin
  const globalAdmin = users.find(u => u.email === 'admin@dockery.ai');
  if (globalAdmin && globalAdmin.role !== 'master_admin') {
    toFix.push({
      user: globalAdmin,
      updates: { role: 'master_admin', tenantId: null, organizationId: null },
      reason: 'Global Admin should be master_admin'
    });
  }
  
  // Check for org_admins without organizations
  users.forEach(u => {
    if (u.role === 'org_admin' && u.tenantId && !u.organizationId) {
      toFix.push({
        user: u,
        updates: { role: 'tenant_admin' },
        reason: 'Has tenant but no org - should be tenant_admin'
      });
    }
  });
  
  if (toFix.length === 0) {
    console.log('✅ All roles are correct!');
    return;
  }
  
  console.log(`🔧 Found ${toFix.length} user(s) to fix:`);
  toFix.forEach((fix, i) => {
    console.log(`  ${i + 1}. ${fix.user.name} (${fix.user.email})`);
    console.log(`     ${fix.reason}`);
    console.log(`     Current: ${fix.user.role}, Update: ${fix.updates.role || fix.user.role}`);
  });
  
  // Fix each user
  for (const fix of toFix) {
    console.log(`\n🔧 Fixing ${fix.user.name}...`);
    const response = await fetch(
      `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/admin/users/${fix.user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fix.updates)
      }
    );
    
    if (response.ok) {
      console.log(`✅ ${fix.user.name} updated successfully`);
    } else {
      const error = await response.json();
      console.error(`❌ ${fix.user.name} failed:`, error);
    }
  }
  
  console.log('\n🎉 DONE! All fixes applied.');
  console.log('👉 Please refresh the page (F5) to see the changes.');
})();
```

---

## Troubleshooting

### "No auth token found"
- You need to be logged in
- Try logging out and logging back in
- Check that you can see the Admin Dashboard

### "Unauthorized" or 401 error
- Your session may have expired
- Log out and log back in
- Try again

### Changes don't appear
- Make sure you refreshed the page (F5 or Cmd+R)
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache if needed

---

## What These Scripts Do

1. **Get your auth token** from localStorage
2. **Fetch all users** from the backend
3. **Identify incorrect roles**:
   - Global Admin should be `master_admin` (not `org_admin`)
   - Users with tenantId but no organizationId should be `tenant_admin` (not `org_admin`)
4. **Update the roles** via the backend API
5. **Refresh the data** so you can see the changes

These scripts use the exact same backend endpoints as the AdminRoleFixer component!
