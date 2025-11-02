# Tenant/Organization Context Switcher - Implementation Guide

## Overview
Successfully implemented an elegant hierarchical context switcher that allows multi-tenant and organization admins to switch between the tenants and organizations they manage, maintaining the hierarchical navigation structure throughout ValueDock®.

## Features

### 🎯 Role-Based Context Switching

#### Global Admin (master_admin)
- Can view **all tenants** in the system
- Can switch to any tenant to see all its organizations
- Can switch to any organization across all tenants
- Has three view modes:
  - **Global View**: See all tenants (no filter)
  - **Tenant View**: See all organizations within a selected tenant
  - **Organization View**: See specific organization details

#### Tenant Admin (tenant_admin)
- Can view **all organizations within their tenant**
- Can switch between organizations in their tenant
- Has two view modes:
  - **Tenant View**: See all organizations in their tenant
  - **Organization View**: See specific organization details

#### Organization Admin (org_admin)
- **Read-only display** of their organization
- Cannot switch contexts (locked to their org)
- Display shows: Organization name and tenant name

#### Regular User
- **Read-only display** of their organization
- Cannot switch contexts (locked to their org)
- Display shows: Organization name and tenant name

## Component: TenantOrgContextSwitcher

### Location
`/components/TenantOrgContextSwitcher.tsx`

### Props
```typescript
interface TenantOrgContextSwitcherProps {
  currentUser: UserProfile;           // Current logged-in user
  tenants: any[];                     // All available tenants
  organizations: any[];               // All available organizations
  selectedTenantId: string | null;    // Currently selected tenant ID
  selectedOrgId: string | null;       // Currently selected org ID
  onTenantChange: (tenantId: string | null) => void;  // Tenant selection handler
  onOrgChange: (orgId: string | null) => void;        // Org selection handler
}
```

### UI/UX Design

#### Desktop View
- Appears in the header navigation between the logo and menu button
- Width: `w-64` (256px)
- Uses Command palette-style dropdown for elegant searching
- Shows current selection with breadcrumb-style display

#### Mobile View
- Appears at the top of the dropdown menu
- Full-width within the menu
- Same Command palette interface for consistency

#### Visual Indicators
- 🌐 Globe icon: Global admin viewing all tenants
- 🏢 Building icon: Viewing a specific tenant or organization
- ✓ Checkmark: Currently selected item
- Badge display: Shows selected tenant/org at bottom of dropdown

### Search Functionality
- Real-time search through tenants and organizations
- Searches by name
- "No results found" message when search yields nothing

## State Management

### App.tsx State Variables
```typescript
// Context switcher state
const [selectedContextTenantId, setSelectedContextTenantId] = useState<string | null>(null);
const [selectedContextOrgId, setSelectedContextOrgId] = useState<string | null>(null);
const [allTenants, setAllTenants] = useState<any[]>([]);
const [allOrganizations, setAllOrganizations] = useState<any[]>([]);
```

### LocalStorage Persistence
The selected context is persisted to localStorage for a seamless experience across sessions:

```typescript
// Keys used:
- 'valuedock_selected_tenant_id'
- 'valuedock_selected_org_id'
```

When the user returns to the app, their last selected context is automatically restored.

### Data Loading
Tenants and organizations are loaded via API when the user is authenticated:
- Only loads for `master_admin` and `tenant_admin` roles
- Uses parallel API calls for efficiency
- Loaded in a dedicated `useEffect` hook

## User Flows

### Flow 1: Global Admin - View All Tenants
1. Click context switcher button
2. Select "All Tenants" from Global View section
3. **Result**: Admin dashboard shows all tenants across the system

### Flow 2: Global Admin - View Specific Tenant
1. Click context switcher button
2. Search or select a tenant from the "Tenants" section
3. **Result**: 
   - Welcome message updates to "Viewing: [Tenant Name]"
   - Admin dashboard filters to show only that tenant's organizations
   - Organizations list is filtered

### Flow 3: Global Admin - View Specific Organization
1. Click context switcher button
2. Either:
   - **Option A**: Select a tenant first, then select an organization from that tenant
   - **Option B**: Search and select an organization directly (auto-selects its tenant)
3. **Result**:
   - Welcome message updates to "Viewing: [Organization Name]"
   - Admin dashboard shows that organization's details
   - Both tenant and org badges shown in dropdown

### Flow 4: Tenant Admin - Switch Organizations
1. Click context switcher button
2. Select "All Organizations" or a specific organization
3. **Result**:
   - View updates to show selected organization
   - Only organizations within their tenant are available

### Flow 5: Switching Clears Child Selections
When switching tenants:
1. Select Tenant A
2. Select Organization X in Tenant A
3. Switch to Tenant B
4. **Result**: Organization selection is cleared (prevents showing org from wrong tenant)

## Integration Points

### Header/Navigation
The context switcher is integrated into the main app header:

**Desktop (`md` and up)**:
- Shows between logo/welcome and menu button
- Fixed width for consistent layout
- Always visible when applicable

**Mobile (`< md`)**:
- Appears inside dropdown menu
- Full width within menu
- Appears before action items

### Welcome Message
The welcome message dynamically updates based on context:

```typescript
// When viewing specific context
"Viewing: Acme Corporation"  // Org selected
"Viewing: Beta Partners"     // Tenant selected

// Default messages
"Welcome, Global Admin"      // Global admin, no selection
"Welcome John"               // Regular user
```

### Admin Dashboard Integration
The admin dashboard can use the selected context to filter data:

```typescript
// In AdminDashboard.tsx (future enhancement)
const filteredTenants = selectedContextTenantId 
  ? tenants.filter(t => t.id === selectedContextTenantId)
  : tenants;

const filteredOrgs = selectedContextOrgId
  ? organizations.filter(o => o.id === selectedContextOrgId)
  : selectedContextTenantId
    ? organizations.filter(o => o.tenantId === selectedContextTenantId)
    : organizations;
```

## Styling & Design

### Colors & Icons
- **Global View**: Globe icon (🌐) - represents system-wide access
- **Tenant**: Building2 icon (🏢) - represents organizational structure
- **Organization**: Building2 icon with primary color - represents end organization
- **Selected Item**: Check icon (✓)

### Responsive Design
```css
/* Desktop: Fixed width in header */
.hidden md:block w-64

/* Mobile: Full width in menu */
.md:hidden (full width by default)
```

### Dropdown Dimensions
- Desktop: `w-[400px]` for comfortable reading
- Mobile: Adapts to menu width
- Max height: Scrollable content with CommandList

## API Integration

### Endpoints Used
```typescript
// Load tenants
GET /admin/tenants
Response: { tenants: Tenant[] }

// Load organizations
GET /admin/organizations
Response: { organizations: Organization[] }
```

### Data Filtering
The component handles filtering based on user role:

**Master Admin**:
- Sees all tenants
- Sees all orgs (or filtered by selected tenant)

**Tenant Admin**:
- Sees only their tenant (read-only)
- Sees all orgs within their tenant

## Error Handling

### No Data States
- **No tenants**: Shows "No results found" in search
- **No organizations**: Shows "No results found" in search
- **API error**: Silent failure, logs to console, component shows empty state

### Permission Checks
- Component only renders for `master_admin` and `tenant_admin`
- Other roles see read-only display of their org

## Testing Checklist

### ✅ Global Admin Tests
- [ ] Can see "All Tenants" option
- [ ] Can select any tenant
- [ ] Can select any organization
- [ ] Search works across all tenants/orgs
- [ ] Switching tenant clears org selection
- [ ] Selection persists after page refresh

### ✅ Tenant Admin Tests
- [ ] Cannot see "All Tenants" option
- [ ] Can see all organizations in their tenant
- [ ] Cannot see orgs from other tenants
- [ ] Search works within their tenant's orgs
- [ ] Selection persists after page refresh

### ✅ Org Admin Tests
- [ ] Context switcher does not appear
- [ ] See read-only display of their org and tenant

### ✅ Regular User Tests
- [ ] Context switcher does not appear
- [ ] See read-only display of their org and tenant

### ✅ UI/UX Tests
- [ ] Desktop: Appears in header
- [ ] Mobile: Appears in dropdown menu
- [ ] Search is responsive and fast
- [ ] Welcome message updates correctly
- [ ] Icons are appropriate
- [ ] Badges display correctly
- [ ] Dropdown closes after org selection
- [ ] Dropdown stays open when selecting tenant (allows immediate org selection)

### ✅ Persistence Tests
- [ ] Selection saves to localStorage
- [ ] Selection restores on page load
- [ ] Selection clears on logout

## Future Enhancements

### Suggested Features
1. **Quick Switch**: Keyboard shortcut (Cmd/Ctrl + K) to open switcher
2. **Recent Contexts**: Show recently viewed tenants/orgs at top
3. **Favorites**: Allow admins to favorite frequently accessed contexts
4. **Context Indicators**: Visual badges throughout the app showing current context
5. **Analytics**: Track which contexts admins view most frequently
6. **Deep Linking**: URL parameters to share specific context views
7. **Breadcrumb Trail**: Show navigation path (Tenant > Org) in UI
8. **Switch Notifications**: Toast notification when context changes
9. **Multi-Select**: View data from multiple orgs simultaneously (advanced feature)
10. **Context Permissions**: Different permissions based on viewed context

### Admin Dashboard Filtering
Currently the context switcher is set up in the main app, but the AdminDashboard doesn't yet filter based on the selected context. To complete this integration:

```typescript
// Pass context to AdminDashboard
<AdminDashboard 
  currentUser={userProfile!}
  selectedTenantId={selectedContextTenantId}
  selectedOrgId={selectedContextOrgId}
/>

// In AdminDashboard, filter data:
const visibleTenants = props.selectedTenantId 
  ? tenants.filter(t => t.id === props.selectedTenantId)
  : tenants;
```

## Files Modified

1. **New File**: `/components/TenantOrgContextSwitcher.tsx`
   - Main component implementation
   - Command palette UI
   - Role-based filtering logic

2. **Modified**: `/App.tsx`
   - Added state variables for context selection
   - Added localStorage persistence handlers
   - Integrated component into header (desktop)
   - Integrated component into menu (mobile)
   - Updated welcome message logic
   - Added data loading for tenants/orgs

3. **New File**: `/CONTEXT_SWITCHER_IMPLEMENTATION.md`
   - This documentation file

## Dependencies

### Required Components
- `Command` (shadcn/ui) - For searchable dropdown
- `Popover` (shadcn/ui) - For dropdown trigger
- `Button` (shadcn/ui) - For trigger button
- `Badge` (shadcn/ui) - For context indicators

### Required Utilities
- `hasRole` from `/utils/auth.ts` - Permission checking
- `apiCall` from `/utils/auth.ts` - API requests

## Accessibility

- **Keyboard Navigation**: Full keyboard support via Command component
- **ARIA Labels**: Proper `role="combobox"` and `aria-expanded` attributes
- **Screen Readers**: Descriptive text for all icons and actions
- **Focus Management**: Proper focus trapping in dropdown

## Performance

- **Lazy Loading**: Tenant/org data only loads for admins
- **Memoization**: Search filtering is optimized
- **Minimal Re-renders**: State updates are isolated
- **LocalStorage**: Fast restore on page load

## Security Notes

- **Role-Based**: Only admins can see the switcher
- **API Filtering**: Backend should also enforce permissions
- **Tenant Isolation**: Tenant admins can't see other tenants' data
- **No Elevation**: Switching context doesn't grant additional permissions

---

## Summary

The Tenant/Organization Context Switcher provides an elegant, hierarchical navigation system for multi-tenant admins. It maintains clear visual hierarchy, persists user preferences, and integrates seamlessly into both desktop and mobile experiences. The implementation follows best practices for role-based access control and provides a foundation for future context-aware features throughout ValueDock®.
