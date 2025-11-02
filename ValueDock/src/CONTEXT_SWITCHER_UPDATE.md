# Context Switcher Navigation Update

## Overview
Updated the TenantOrgContextSwitcher to implement a **two-level hierarchical navigation** where users must select a tenant first, then select an organization under that tenant. Removed the "All Tenants" and "All Organizations" view options since you can only view one organization's instance at a time.

---

## New Navigation Flow

### For Global Admins

#### **Step 1: Select Tenant**
When you first open the context switcher (or click "← Back to Tenants"):

```
┌─────────────────────────────────────┐
│ 🔍 Search tenants...                │
├─────────────────────────────────────┤
│ Select Tenant                       │
├─────────────────────────────────────┤
│ 🏢 DockeryAI, LLC                   │
│    2 organizations                  │
├─────────────────────────────────────┤
│ 🏢 Test Tenant                      │
│    3 organizations                  │
├─────────────────────────────────────┤
│ 🏢 Acme Partners                    │
│    1 organization                   │
└─────────────────────────────────────┘
```

- Click on any tenant to view its organizations
- Search filters the tenant list
- Shows organization count under each tenant

#### **Step 2: Select Organization**
After clicking a tenant (e.g., "DockeryAI, LLC"):

```
┌─────────────────────────────────────┐
│ 🔍 Search organizations...          │
├─────────────────────────────────────┤
│ Organizations                       │
├─────────────────────────────────────┤
│ 🏢 ← Back to Tenants                │
├─────────────────────────────────────┤
│ 👥 Sandbox Organization         ✓   │
├─────────────────────────────────────┤
│ 👥 Production Instance              │
└─────────────────────────────────────┘
```

- Click "← Back to Tenants" to go back to tenant list
- Click on any organization to switch to its instance
- Checkmark shows currently selected organization
- Menu closes after selecting an organization

#### **Current Context Display**
When an organization is selected, the bottom shows:

```
┌─────────────────────────────────────┐
│ ─────────────────────────────────── │
│ 👥 Sandbox Organization  in  🏢 ... │
│    DockeryAI, LLC                   │
└─────────────────────────────────────┘
```

---

### For Tenant Admins

Tenant admins only see organizations within their tenant:

```
┌─────────────────────────────────────┐
│ 🔍 Search organizations...          │
├─────────────────────────────────────┤
│ Select Organization                 │
├─────────────────────────────────────┤
│ 👥 Acme Corp                    ✓   │
├─────────────────────────────────────┤
│ 👥 XYZ Inc                          │
├─────────────────────────────────────┤
│ 👥 Beta Test Org                    │
└─────────────────────────────────────┘
```

- No tenant selection needed (locked to their tenant)
- Direct list of organizations
- Click to switch between organizations

---

### For Org Admins & Regular Users

**No switcher displayed** - they are locked to their organization:

```
┌─────────────────────────────────────┐
│ 🏢 Acme Corp                        │
│    Test Tenant                      │
└─────────────────────────────────────┘
```

Static display showing their org and tenant (no dropdown).

---

## Button Display States

### No Selection
```
[ 🌐 Select Organization ▼ ]
```

### Tenant Selected, No Org
```
[ 🏢 DockeryAI, LLC ▼ ]
     Select organization
```

### Organization Selected
```
[ 👥 Sandbox Organization ▼ ]
     DockeryAI, LLC
```

Icon changes based on state:
- 🌐 Globe = No selection
- 🏢 Building = Tenant selected
- 👥 Users = Organization selected (with primary color)

---

## Code Changes

### File Modified
`/components/TenantOrgContextSwitcher.tsx`

### Key Updates

#### 1. Removed "All Tenants" Option
**Before:**
```tsx
<CommandGroup heading="Global View">
  <CommandItem onSelect={() => handleSelectTenant(null)}>
    <Globe className="mr-2 h-4 w-4" />
    <span>All Tenants</span>
  </CommandItem>
</CommandGroup>
```

**After:** ❌ Removed completely

#### 2. Two-Level Navigation
**Before:** Nested tree in single view

**After:** Two separate views:
```tsx
{!selectedTenantId && availableTenants.map((tenant) => (
  // Show tenant list
))}

{selectedTenantId && (
  <>
    {/* Back button */}
    <CommandItem onSelect={() => handleSelectTenant(null)}>
      ← Back to Tenants
    </CommandItem>
    
    {/* Show orgs */}
    {availableOrgs.map((org) => (...))}
  </>
)}
```

#### 3. Updated Display Text
```tsx
const getDisplayText = () => {
  if (selectedOrg && selectedTenant) {
    return (
      <div className="flex flex-col min-w-0">
        <span className="text-sm truncate">{selectedOrg.name}</span>
        <span className="text-xs text-muted-foreground truncate">
          {selectedTenant.name}
        </span>
      </div>
    );
  }
  if (selectedTenant && !selectedOrgId) {
    return (
      <div className="flex flex-col min-w-0">
        <span className="text-sm truncate">{selectedTenant.name}</span>
        <span className="text-xs text-muted-foreground">
          Select organization
        </span>
      </div>
    );
  }
  return <span className="text-sm">Select Organization</span>;
};
```

#### 4. Dynamic Search Placeholder
```tsx
<CommandInput 
  placeholder={
    selectedTenantId 
      ? "Search organizations..." 
      : "Search tenants..."
  } 
/>
```

#### 5. Context-Aware Icon
```tsx
{selectedOrgId ? (
  <Users className="h-4 w-4 text-primary flex-shrink-0" />
) : selectedTenantId ? (
  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
) : (
  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
)}
```

---

## User Experience Flow

### Scenario: Navigate to "Sandbox Organization" under "DockeryAI, LLC"

1. **Initial State**
   - Button shows: "Select Organization" with globe icon
   - Click button to open menu

2. **Select Tenant**
   - Menu shows list of all tenants
   - User sees "DockeryAI, LLC - 2 organizations"
   - Click on "DockeryAI, LLC"
   
3. **Select Organization**
   - Menu now shows organizations under DockeryAI, LLC
   - User sees "Sandbox Organization" and "Production Instance"
   - Click on "Sandbox Organization"

4. **Result**
   - Menu closes
   - Button updates to show:
     ```
     👥 Sandbox Organization
        DockeryAI, LLC
     ```
   - App switches to Sandbox Organization's instance
   - All ROI data loads for that organization
   - User can now work within that organization's data

5. **Switching to Different Org**
   - Click button again
   - Menu shows organizations under DockeryAI, LLC (current tenant)
   - Can click "← Back to Tenants" to choose a different tenant
   - Or click another org under same tenant to switch

---

## Data Isolation

Each organization operates as a completely separate instance:

- ✅ **Processes** - Unique per organization
- ✅ **Groups** - Unique per organization  
- ✅ **ROI Calculations** - Unique per organization
- ✅ **Implementation Plans** - Unique per organization
- ✅ **Users** - Can belong to different orgs
- ✅ **Admins** - Can manage multiple orgs

When you switch organizations:
1. Context state updates (`selectedOrgId` changes)
2. Data fetches from backend with org filter
3. UI re-renders with new org's data
4. No data leakage between organizations

---

## Search Functionality

### Tenant Search (Step 1)
Search matches against:
- Tenant name: "DockeryAI, LLC"
- Tenant domain: "dockery.ai"

Example:
- Search "docker" → Shows "DockeryAI, LLC"
- Search "acme" → Shows "Acme Partners"

### Organization Search (Step 2)
Search matches against:
- Organization name: "Sandbox Organization"
- Company name: "Sandbox Corp"

Example:
- Search "sandbox" → Shows "Sandbox Organization"
- Search "prod" → Shows "Production Instance"

---

## Edge Cases Handled

### No Organizations in Tenant
```
┌─────────────────────────────────────┐
│ Organizations                       │
├─────────────────────────────────────┤
│ 🏢 ← Back to Tenants                │
├─────────────────────────────────────┤
│                                     │
│   No organizations in this tenant   │
│                                     │
└─────────────────────────────────────┘
```

### Tenant Admin with No Orgs
- Switcher shows but list is empty
- Admin should create organizations first

### Regular User
- No switcher shown
- Displays current org/tenant as static text

---

## Testing Checklist

### ✅ Global Admin Flow
- [ ] Open context switcher → See tenant list
- [ ] Click tenant → See organization list
- [ ] Click "← Back to Tenants" → Return to tenant list
- [ ] Click organization → Menu closes, org selected
- [ ] Verify data loads for selected org
- [ ] Switch to different org in same tenant
- [ ] Switch to org in different tenant
- [ ] Verify no "All Tenants" or "All Organizations" options

### ✅ Tenant Admin Flow  
- [ ] Open context switcher → See organization list
- [ ] Click organization → Switch to that org
- [ ] Verify can only see orgs in their tenant

### ✅ Search Functionality
- [ ] Step 1: Search filters tenant list
- [ ] Step 2: Search filters organization list
- [ ] Placeholder updates based on context

### ✅ Visual States
- [ ] Icon changes: Globe → Building → Users
- [ ] Button text updates correctly
- [ ] Current context badge shows at bottom

### ✅ Data Isolation
- [ ] Each org shows only its own processes
- [ ] Each org shows only its own groups
- [ ] Switching orgs clears old data
- [ ] No data leakage between orgs

---

## Benefits of This Approach

### 1. **Clear Navigation Path**
   - Two distinct steps: Choose tenant → Choose org
   - No confusion about "view all" vs "select specific"
   
### 2. **Better Organization**
   - Tenants and orgs are clearly separated
   - Easy to see which orgs belong to which tenant
   
### 3. **Reduced Clutter**
   - Only shows relevant options at each step
   - Back button provides clear escape route
   
### 4. **Data Isolation**
   - Forces selection of specific org
   - Prevents accidental cross-org data mixing
   
### 5. **Scalability**
   - Works well with many tenants
   - Works well with many orgs per tenant
   - Search keeps it fast

---

## Future Enhancements

Potential improvements for later:

1. **Recent Organizations**
   - Show 3-5 most recently accessed orgs at top
   - Quick access without navigating through tenants

2. **Favorites**
   - Star/favorite specific organizations
   - Show favorites in separate section

3. **Keyboard Shortcuts**
   - Cmd+K to open switcher
   - Arrow keys to navigate
   - Enter to select

4. **Organization Icons**
   - Show custom logos for each org
   - Better visual identification

5. **Breadcrumb Display**
   - Show full path: DockeryAI > Sandbox > Processes
   - Click any level to navigate

---

## Summary

The context switcher now implements a clean two-level navigation system:

1. ✅ **No "All Tenants" view** - Must select specific org
2. ✅ **No "All Organizations" view** - Forces single org context
3. ✅ **Step 1: Choose Tenant** - See all available tenants
4. ✅ **Step 2: Choose Organization** - See orgs in selected tenant
5. ✅ **Back button** - Return to tenant list anytime
6. ✅ **Context-aware** - Icon and text reflect current state
7. ✅ **Search updates** - Placeholder changes per step
8. ✅ **Data isolated** - Each org is separate instance

This creates a clear, intuitive navigation flow that prevents confusion and ensures proper data isolation between organizations.
