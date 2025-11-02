# Group Creation with Salary Fields - FIXED

## Problem Identified

When creating a new user in the Admin Dashboard and trying to assign them to a new group, the "Create New Group" form was **missing salary fields**. It only had:
- Group Name
- Description (Optional)

But groups created in the InputsScreen had additional fields:
- `averageHourlyWage`
- `annualSalary`

This caused two issues:
1. **No salary data**: Groups created in user dialog had no wage/salary information
2. **Incomplete groups**: These groups couldn't be used properly for ROI calculations that depend on labor costs

## Root Cause

The `EnhancedUserDialogV2.tsx` component had a simplified group creation form (lines 880-907) that only collected basic information. The full group schema includes:

```typescript
interface NewGroup {
  id: string;
  name: string;
  description: string;
  averageHourlyWage?: number;  // ← Missing in form
  annualSalary?: number;       // ← Missing in form
}
```

## Solution Implemented

### Added Salary Fields to Group Creation Form

Updated the "Create New Group" form in `EnhancedUserDialogV2.tsx` to include both wage and salary inputs:

```tsx
{showNewGroupForm && (
  <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
    <h4 className="font-medium text-sm">Create New Group</h4>
    
    {/* Group Name */}
    <div className="space-y-2">
      <Label>Group Name *</Label>
      <Input
        value={newGroup.name}
        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
        placeholder="Finance Team"
      />
    </div>
    
    {/* Description */}
    <div className="space-y-2">
      <Label>Description (Optional)</Label>
      <Input
        value={newGroup.description}
        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
        placeholder="Finance department processes"
      />
    </div>
    
    {/* NEW: Salary Fields */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Average Hourly Wage (Optional)</Label>
        <Input
          type="number"
          value={newGroup.averageHourlyWage || ''}
          onChange={(e) => setNewGroup({ 
            ...newGroup, 
            averageHourlyWage: e.target.value ? parseFloat(e.target.value) : undefined 
          })}
          placeholder="50.00"
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Annual Salary (Optional)</Label>
        <Input
          type="number"
          value={newGroup.annualSalary || ''}
          onChange={(e) => setNewGroup({ 
            ...newGroup, 
            annualSalary: e.target.value ? parseFloat(e.target.value) : undefined 
          })}
          placeholder="80000"
          min="0"
          step="1000"
        />
      </div>
    </div>
    
    <Button type="button" onClick={handleAddGroup} className="w-full" variant="secondary">
      Add Group
    </Button>
  </div>
)}
```

### Key Features

1. **Two-Column Layout**: Wage and salary fields are side-by-side to save space
2. **Optional Fields**: Both are optional - you can provide one, both, or neither
3. **Number Input**: Proper `type="number"` with validation
4. **Min/Step Values**: 
   - Hourly wage: min=0, step=0.01 (for cents)
   - Annual salary: min=0, step=1000 (for thousands)
5. **Placeholders**: Show example values ($50/hr, $80k/year)
6. **Proper Parsing**: Converts string input to float, handles empty values as undefined

---

## How to Use

### Creating a User with a New Group (NOW COMPLETE)

1. **Open Admin Dashboard**
   - Navigate to Users tab
   - Click "Add User"

2. **Fill in User Details**
   - Name: "Test Finance User"
   - Email: "finance@testorganization.com"  
   - Password: "Test123!"
   - Admin Rights: "Regular User (No Admin Rights)"

3. **Select Organization**
   - Tenant: "Test Tenant" (if master admin)
   - Organization: "Test Organization"

4. **Create New Group** ✅ NOW WITH SALARY FIELDS
   - Click "New Group" button
   - Group Name: "Finance" *
   - Description: "Finance department members" (optional)
   - Average Hourly Wage: 48.50 (optional)
   - Annual Salary: 100000 (optional)
   - Click "Add Group"

5. **Verify Group Added**
   - Group should appear in "Select Groups" section below
   - Should be automatically checked/selected
   - Badge shows "Selected"

6. **Create User**
   - Click "Create User" button
   - **Console should show**:
     ```
     [EnhancedUserDialogV2] Loading groups for organization: org_xxx
     [EnhancedUserDialogV2] Loaded existing groups: []
     [EnhancedUserDialogV2] Initial group IDs: []
     [EnhancedUserDialogV2] All available groups: [
       {id: 'group-1704902400000', name: 'Finance'}
     ]
     [EnhancedUserDialogV2] New groups to save: [
       {id: 'group-1704902400000', name: 'Finance'}
     ]
     [EnhancedUserDialogV2] Loading org data for: org_xxx
     [EnhancedUserDialogV2] Saving updated data: {
       totalGroups: 1, 
       newGroups: 1, 
       groups: [{
         id: 'group-1704902400000',
         name: 'Finance',
         description: 'Finance department members',
         averageHourlyWage: 48.50,
         annualSalary: 100000
       }]
     }
     [EnhancedUserDialogV2] Save response: {success: true}
     ```
   
7. **Success Messages**
   - Toast: "✅ 1 new group(s) added to Test Organization"
   - Toast: "User 'finance@testorganization.com' created successfully!"

8. **Verify in Organization Instance**
   - Global View → Test Tenant → Test Organization
   - Go to Inputs tab
   - **"Finance" group should appear** with salary data! ✅

---

## Complete Test Scenario

### Test Case: Create User with Fully Populated Group

**Prerequisites:** None (fresh organization)

**Steps:**

1. Log in as admin@dockeryai.com (master admin)

2. Admin Dashboard → Users → Add User

3. Fill in:
   ```
   Name: Test Finance User
   Email: finance@testorganization.com
   Password: Test123!
   Admin Rights: Regular User (No Admin Rights)
   Tenant: Test Tenant
   Organization: Test Organization
   ```

4. Click "New Group"

5. Fill in group details:
   ```
   Group Name: Finance
   Description: Finance department employees
   Average Hourly Wage: 48.50
   Annual Salary: 100,000
   ```

6. Click "Add Group"
   - Group appears in list below
   - Checkbox is checked
   - Badge shows "Selected"

7. Click "Create User"

8. **Expected Console Logs:**
   ```
   [EnhancedUserDialogV2] Loading groups for organization: org_1760123846858_02zmwx74j
   [EnhancedUserDialogV2] Loaded existing groups: []
   [EnhancedUserDialogV2] Initial group IDs: []
   [EnhancedUserDialogV2] All available groups: [
     {
       id: "group-1704902400000",
       name: "Finance"
     }
   ]
   [EnhancedUserDialogV2] New groups to save: [
     {
       id: "group-1704902400000",
       name: "Finance"
     }
   ]
   [EnhancedUserDialogV2] Final org ID: org_1760123846858_02zmwx74j
   [EnhancedUserDialogV2] Loading org data for: org_1760123846858_02zmwx74j
   [EnhancedUserDialogV2] Load response: {success: true, data: null}
   [EnhancedUserDialogV2] Existing groups: []
   [EnhancedUserDialogV2] Groups to add after dedup: [
     {
       id: "group-1704902400000",
       name: "Finance",
       description: "Finance department employees",
       averageHourlyWage: 48.5,
       annualSalary: 100000
     }
   ]
   [EnhancedUserDialogV2] Saving updated data: {
     totalGroups: 1,
     newGroups: 1,
     groups: [...]
   }
   [EnhancedUserDialogV2] Save response: {success: true}
   ```

9. **Expected Success Toasts:**
   - ✅ 1 new group(s) added to Test Organization
   - User "finance@testorganization.com" created successfully!

10. **Verify User Created:**
    - User Management Tree shows new user under Test Organization
    - groupIds: ["group-1704902400000"]

11. **Verify Group in Organization:**
    - Global View → Test Tenant → Test Organization
    - Inputs tab
    - Groups section shows "Finance"
    - **Verify salary data saved:**
      ```javascript
      // In browser console:
      const orgId = 'org_1760123846858_02zmwx74j';
      const response = await fetch(
        `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/data/load?organizationId=${orgId}`,
        {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
          }
        }
      );
      const data = await response.json();
      console.log('Finance group:', data.data.groups.find(g => g.name === 'Finance'));
      ```
      
      **Expected Output:**
      ```javascript
      {
        id: "group-1704902400000",
        name: "Finance",
        description: "Finance department employees",
        averageHourlyWage: 48.5,
        annualSalary: 100000
      }
      ```

---

## UI Screenshot Guide

### Before Fix

```
┌─────────────────────────────────────────┐
│ Create New Group                        │
├─────────────────────────────────────────┤
│ Group Name *                            │
│ ┌─────────────────────────────────────┐ │
│ │ Finance Team                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Description (Optional)                  │
│ ┌─────────────────────────────────────┐ │
│ │ Finance department processes        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚠️ NO SALARY FIELDS                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         Add Group                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### After Fix

```
┌─────────────────────────────────────────┐
│ Create New Group                        │
├─────────────────────────────────────────┤
│ Group Name *                            │
│ ┌─────────────────────────────────────┐ │
│ │ Finance Team                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Description (Optional)                  │
│ ┌─────────────────────────────────────┐ │
│ │ Finance department processes        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ✅ NEW: Salary Fields                  │
│ ┌──────────────────┬──────────────────┐ │
│ │ Avg Hourly Wage  │ Annual Salary    │ │
│ │ ┌──────────────┐ │ ┌──────────────┐ │ │
│ │ │ 50.00        │ │ │ 80000        │ │ │
│ │ └──────────────┘ │ └──────────────┘ │ │
│ └──────────────────┴──────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         Add Group                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Data Flow (Complete)

```
1. User fills in group form
   ├── Name: "Finance"
   ├── Description: "Finance department"
   ├── Hourly Wage: 48.50
   └── Annual Salary: 100,000

2. Click "Add Group"
   └── handleAddGroup() creates:
       {
         id: "group-1704902400000",
         name: "Finance",
         description: "Finance department",
         averageHourlyWage: 48.50,
         annualSalary: 100000
       }

3. Group added to availableGroups state
   └── Also added to selectedGroupIds (auto-selected)

4. Click "Create User"
   └── Submit handler identifies new groups:
       newGroups = availableGroups.filter(g => !initialGroupIds.has(g.id))
       = [Finance group]  ← Has salary data!

5. Save groups to organization data
   ├── Load existing: GET /data/load?organizationId=org_xxx
   ├── Merge: [...existingGroups, ...newGroups]
   └── Save: POST /data/save with full group object

6. Create user with groupIds
   └── POST /auth/signup
       {
         email: "finance@testorganization.com",
         groupIds: ["group-1704902400000"],
         ...
       }

7. Data persisted in Supabase KV
   ├── orgdata:org_xxx → {groups: [{...Finance group with salary...}]}
   └── user:user_xxx → {groupIds: ["group-1704902400000"]}

8. User logs in
   └── Sees only Finance group data (filtered)
   └── Can create processes using Finance group's salary data
```

---

## Why This Matters

### Before: Incomplete Groups
```javascript
{
  id: "group-123",
  name: "Finance",
  description: "Finance team"
  // ❌ No salary data!
}
```

**Problems:**
- Can't calculate labor costs for processes in this group
- Can't use group-level defaults for hourly wages
- Have to manually enter salary for every process
- Inconsistent data across processes

### After: Complete Groups
```javascript
{
  id: "group-123",
  name: "Finance",
  description: "Finance team",
  averageHourlyWage: 48.50,
  annualSalary: 100000
}
```

**Benefits:**
- ✅ Can use as default for processes in this group
- ✅ Consistent labor cost calculations
- ✅ Group-level salary tracking
- ✅ Better ROI accuracy
- ✅ Matches InputsScreen group structure

---

## Summary of Changes

### Files Modified

**`/components/EnhancedUserDialogV2.tsx`**
- Added `averageHourlyWage` input field (number, optional)
- Added `annualSalary` input field (number, optional)
- Two-column grid layout for wage/salary
- Proper number parsing with undefined for empty values

### New Capabilities

✅ **Create groups with salary data** in the user dialog
✅ **Complete group objects** saved to organization data
✅ **Salary defaults** available for processes in that group
✅ **Consistent data structure** with InputsScreen groups
✅ **Full ROI calculation support** for group-level costs

---

## Next Steps

1. **Test the new form:**
   - Create a user with a new group
   - Fill in salary fields
   - Verify group appears in Inputs with salary data

2. **Use in ROI calculations:**
   - Create a process in the Finance group
   - Should inherit Finance group's default salary
   - Calculate ROI with accurate labor costs

3. **Group management:**
   - Groups can now be created either:
     - In User Dialog (when creating/editing users)
     - In Inputs Screen (when adding processes)
   - Both methods now support full group schema

🎉 **Group creation is now complete with salary support!**
