# 🧪 Test Guide - Edit User Groups Feature

## Quick Test Steps

### Step 1: Open Admin Dashboard
1. Log in as `admin@dockery.ai` (Global Admin)
2. Click on "Admin" in the top navigation
3. Go to the **Users** tab

### Step 2: Locate Test Executive User
1. Expand "Test Tenant"
2. Expand "Test Organization"  
3. Find "Test Executive User" (email: executive@testorganization.com)

### Step 3: Click Edit
1. Click the **pencil icon** (✏️) next to "Test Executive User"
2. The Edit User Dialog should open

### Step 4: Verify Groups Are Showing
You should see a "Groups (Optional)" section with three checkboxes:
- ☐ Finance (Finance Team)
- ☐ Operations (Operations)
- ☐ Sales (Sales Team)

### Step 5: Select Groups
1. Check one or more groups (e.g., Finance and Sales)
2. Click **"Save Changes"**
3. Verify the success message

### Step 6: Verify Groups Were Saved
1. Click the pencil icon again to re-open the edit dialog
2. The groups you selected should now be checked ✅
3. The badge should show "2 selected" (or however many you chose)

## Expected Behavior

### ✅ SUCCESS - What You Should See

**When Opening Edit Dialog:**
- Dialog title: "Edit User Profile"
- User's name and email are pre-filled
- Organization is pre-selected: "Test Organization"
- **Groups section is visible** with 3 groups
- Previously selected groups are checked

**Console Logs (Success):**
```
[EditUserDialog] ========== DIALOG OPEN EFFECT ==========
[EditUserDialog] ✅ Opening for user: Test Executive User
[EditUserDialog] ✅ User HAS organizationId: org_1760123846858_02zmwx74j
[EditUserDialog] 🔄 Calling loadGroups...
[EditUserDialog] 🔄 Loading groups for org: org_1760123846858_02zmwx74j
========== API CALL ==========
Endpoint: /groups/org_1760123846858_02zmwx74j
Success response: {groups: Array(3), organizationId: "org_1760123846858_02zmwx74j"}
[EditUserDialog] ✅ Groups response received: {groupCount: 3, groups: [...]}
[EditUserDialog] availableGroups state updated with 3 groups
[EditUserDialog] Rendering groups section. availableGroups.length: 3
```

### ❌ FAILURE - What to Check If Groups Don't Show

**If you see "No groups have been created for this organization yet":**

1. **Check Console for Errors**
   ```
   Look for:
   - [EditUserDialog] ❌ Failed to load groups
   - Error response: Unauthorized
   - 403 Forbidden
   ```

2. **Verify Organization Has Groups**
   - Open browser console
   - Run: 
   ```javascript
   fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/groups/org_1760123846858_02zmwx74j', {
     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
   }).then(r => r.json()).then(console.log)
   ```
   - Should return: `{groups: [{id: "...", name: "Finance"}, ...], organizationId: "..."}`

3. **Check User Object**
   - User MUST have `organizationId` property
   - Run in console after opening dialog:
   ```javascript
   // The selectedUser should have organizationId
   console.log('User org:', selectedUser?.organizationId);
   ```

4. **Check Dialog State**
   - Look for: `[EditUserDialog] Dialog is not open, skipping group load`
   - If you see this, the dialog `open` prop might not be set correctly

## Testing Different Scenarios

### Test 1: User with No Groups Assigned
- Edit "Test Executive User" (initially has empty groupIds)
- All groups should be unchecked
- Message: "No groups selected - user will see ALL processes and groups in their organization"

### Test 2: User with Some Groups Assigned
- Select Finance and Operations groups
- Save
- Re-open dialog
- Finance and Operations should be checked ✅

### Test 3: Admin User (org_admin)
- Edit "Test Admin User" in Test2 Organization
- Groups section should show if groups exist
- Message: "No groups selected - admin has full access regardless"

### Test 4: Change Organization
- Edit any user
- Change their organization to a different one
- Groups should reload for the new organization

### Test 5: Tenant Admin View
- Log out as Global Admin
- Log in as a Tenant Admin
- Edit a user in their tenant
- Groups should load normally

## Debugging Commands

### Check Current Auth
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token:', token?.substring(0, 50) + '...');
```

### Manually Load Groups
```javascript
// In browser console (replace with actual org ID)
const orgId = 'org_1760123846858_02zmwx74j';
const token = localStorage.getItem('token');

fetch(`https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/groups/${orgId}`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Groups:', data.groups);
  console.log('Group count:', data.groups?.length);
})
.catch(err => console.error('Error:', err));
```

### Check User Profile
```javascript
// In browser console
fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/profile', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(profile => {
  console.log('Current user:', profile);
  console.log('Role:', profile.role);
  console.log('Org ID:', profile.organizationId);
  console.log('Tenant ID:', profile.tenantId);
});
```

## Known Limitations

1. **Groups are organization-specific** - Changing a user's organization will show different groups
2. **Admin group assignment is informational only** - Admins have access to all groups regardless
3. **New organizations start with no groups** - Groups must be created via the Inputs screen or user creation flow
4. **Groups must have unique names** within an organization

## Success Criteria

- ✅ Groups section is visible when editing users with organizationId
- ✅ Groups load from backend via API call
- ✅ Previously selected groups are pre-checked
- ✅ Group selection can be changed and saved
- ✅ Console shows successful API calls and state updates
- ✅ No "No groups" message when groups exist

## Rollback Plan

If the fix doesn't work, you can:
1. Check the git history for previous version of EditUserDialog
2. Verify the backend `/groups/{orgId}` endpoint is working
3. Test with the console scripts above to isolate the issue
