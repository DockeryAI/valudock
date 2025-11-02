# 📸 Visual Guide - New Features

## 1. Organization Admins at Top

### BEFORE
```
Test Organization
├── 📧 Test Executive User (user)
├── 📧 Test Sales User (user)
├── 👤 Test Admin User (org_admin)     ← Mixed with regular users
└── 📧 Test Operations User (user)
```

### AFTER
```
Test Organization
├── 👤 Test Admin User (org_admin)      ← Admins always first!
├── 📧 Test Executive User (user)
├── 📧 Test Operations User (user)
└── 📧 Test Sales User (user)
```

---

## 2. Bulk Delete Groups

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Current State Process Details                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗑️ Delete 3 Groups  ← RED BUTTON APPEARS WHEN SELECTED  │
│                                                             │
│  ☑️ Finance              [100 processes]  [➕] [✏️] [🗑️]  │
│  ☑️ Operations           [50 processes]   [➕] [✏️] [🗑️]  │
│  ☑️ Sales                [75 processes]   [➕] [✏️] [🗑️]  │
│  ☐ Marketing             [25 processes]   [➕] [✏️] [🗑️]  │
│  ☐ Ungrouped             [10 processes]   [➕]            │
│                         ↑ Can't select ungrouped          │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation Dialog
```
┌────────────────────────────────────────────┐
│  ⚠️  Are you sure?                        │
│                                            │
│  Delete 3 groups and 225 processes?       │
│                                            │
│  This action cannot be undone.            │
│                                            │
│          [Cancel]    [Delete]             │
└────────────────────────────────────────────┘
```

---

## 3. Read-Only User Option

### Create User Dialog - Regular User Selected

```
┌──────────────────────────────────────────────────┐
│  Create New User                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Name:         John Viewer                       │
│  Email:        john.viewer@company.com           │
│  Password:     ••••••••                          │
│                                                  │
│  ──────────────────────────────────────────────  │
│                                                  │
│  Read-Only Access                                │
│  Prevent this user from editing data            │
│  (view-only mode)                                │
│                                                  │
│  ☑️ Read-Only          [View Only]  ← Badge     │
│                                                  │
│  ──────────────────────────────────────────────  │
│                                                  │
│  Admin Rights Assignment                         │
│  [Regular User (No Admin Rights) ▼]             │
│                                                  │
│          [Cancel]         [Create User]          │
└──────────────────────────────────────────────────┘
```

### What Each Badge Means

| Badge | Meaning | Permissions |
|-------|---------|-------------|
| `Can Edit` | Default | View + Edit all data |
| `View Only` | Read-only enabled | View data only, no edits |

### When Is This Shown?

| Admin Mode | Read-Only Option |
|------------|------------------|
| Regular User (No Admin Rights) | ✅ **Shown** |
| Organization Admin | ❌ Hidden (admins can edit) |
| Tenant Admin | ❌ Hidden (admins can edit) |
| Global Admin | ❌ Hidden (admins can edit) |

---

## 4. Groups in Edit User Dialog

### BEFORE (Broken)
```
┌──────────────────────────────────────────────┐
│  Edit User Profile                           │
├──────────────────────────────────────────────┤
│  Name:           Test Executive User         │
│  Email:          executive@test.com          │
│  Role:           Regular User                │
│  Organization:   Test Organization           │
│                                              │
│  ⚠️ No groups have been created for this    │
│     organization yet.                        │
│                                              │
│          [Cancel]         [Save Changes]     │
└──────────────────────────────────────────────┘
```

### AFTER (Fixed!)
```
┌──────────────────────────────────────────────┐
│  Edit User Profile                           │
├──────────────────────────────────────────────┤
│  Name:           Test Executive User         │
│  Email:          executive@test.com          │
│  Role:           Regular User                │
│  Organization:   Test Organization           │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Groups (Optional)             [2 selected]  │
│                                              │
│  ☑️ Finance      Finance Team                │
│  ☑️ Operations   Operations                  │
│  ☐ Sales         Sales Team                  │
│                                              │
│  No groups selected - user will see ALL      │
│  processes and groups in their organization  │
│                                              │
│          [Cancel]         [Save Changes]     │
└──────────────────────────────────────────────┘
```

---

## 5. Console Logs - Success Indicators

### ✅ Successful Group Loading
```
[EditUserDialog] ========== DIALOG OPEN EFFECT ==========
[EditUserDialog] open: true
[EditUserDialog] ✅ Opening for user: Test Executive User
[EditUserDialog] ✅ User HAS organizationId: org_1760123846858_02zmwx74j
[EditUserDialog] 🔄 Calling loadGroups...
========== API CALL ==========
Endpoint: /groups/org_1760123846858_02zmwx74j
Success response: {groups: Array(3), organizationId: "org_xxx"}
[EditUserDialog] ✅ Groups response received: {groupCount: 3}
[EditUserDialog] availableGroups state updated with 3 groups
```

### ✅ Successful Bulk Delete
```
[InputsScreenTable] handleGroupSelection: Finance, checked: true
[InputsScreenTable] handleGroupSelection: Operations, checked: true
[InputsScreenTable] Selected groups: Set(2) {"Finance", "Operations"}
User clicked Delete button
Confirmation: Delete 2 groups and 150 processes?
User confirmed
Groups deleted successfully
```

### ✅ Successful User Creation with Read-Only
```
[EnhancedUserDialogV2] Creating user with payload:
{
  name: "John Viewer",
  email: "john.viewer@company.com",
  role: "user",
  organizationId: "org_xxx",
  readOnly: true,
  groupIds: []
}
User created successfully
```

---

## Quick Reference - Where to Find Each Feature

| Feature | Location | Action |
|---------|----------|--------|
| **Org Admins First** | Admin Dashboard → Users Tab | Expand any organization |
| **Bulk Delete Groups** | Inputs Screen | Check multiple group checkboxes |
| **Read-Only Option** | Admin Dashboard → Users Tab | Click "Add User", select "Regular User" |
| **Edit User Groups** | Admin Dashboard → Users Tab | Click pencil icon next to any user |

---

## Keyboard Shortcuts & Tips

### Bulk Delete Groups
- **Select/Deselect**: Click checkbox next to group name
- **Clear Selection**: Click "Delete X Groups" then Cancel
- **Quick Delete Single**: Use trash icon next to individual group

### Edit User Dialog
- **Save**: Click "Save Changes" or press Enter (when focused on text field)
- **Cancel**: Click "Cancel" or press Escape
- **Navigate Groups**: Tab through checkboxes

### Read-Only Toggle
- **Toggle**: Click checkbox or label
- **Keyboard**: Tab to checkbox, press Space

---

## Color Coding

| Element | Color | Meaning |
|---------|-------|---------|
| 🔴 Red Button | Destructive | "Delete X Groups" bulk action |
| 🟢 Green Badge | Success | Active/Confirmed state |
| 🟡 Yellow Badge | Warning | Pending/Modified state |
| 🔵 Blue Badge | Info | Count indicators (e.g., "2 selected") |
| ⚫ Gray Badge | Neutral | "View Only", "Can Edit" status |

---

## Common Use Cases

### Use Case 1: Create a View-Only Finance User
1. Admin Dashboard → Users → Add User
2. Name: "Finance Viewer"
3. Email: "viewer@finance.com"
4. Password: (set password)
5. ✅ Check "Read-Only Access"
6. Admin Rights: "Regular User"
7. Organization: "Finance Dept"
8. Groups: Select "Finance" group
9. Click "Create User"

### Use Case 2: Reorganize Groups (Bulk Delete)
1. Inputs Screen
2. Check boxes next to old groups (e.g., "Legacy", "Deprecated")
3. Click red "Delete 2 Groups" button
4. Confirm deletion
5. Groups and their processes removed
6. Create new groups with better names

### Use Case 3: Assign Multiple Users to Groups
1. Admin Dashboard → Users
2. For each user:
   - Click pencil (edit) icon
   - Check appropriate groups
   - Save
3. Users now see only their assigned groups in calculator

---

All visual features are now live and ready to use!
