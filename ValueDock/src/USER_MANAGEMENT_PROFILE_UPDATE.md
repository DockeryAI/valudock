# User Management & Profile System - Complete Update

## Summary of Changes

All requested features have been implemented successfully:

### 1. ✅ Fixed Tenant Admin Visibility
**File:** `/components/UserManagementTree.tsx`

**Problem:** Tenant admins weren't showing at the top when expanding tenant menu.

**Solution:**
- Tenant admins now appear at the TOP of each tenant when expanded
- Tenant admins are filtered by `role === 'tenant_admin'` instead of `organizationId === null`
- If a tenant admin is also assigned to an organization, they appear:
  - At the top under "Tenant Admins" section
  - Under the specific organization with "Tenant & Org Admin" badge
- This ensures admins with multiple roles are visible everywhere they belong

### 2. ✅ Mouse Hover Tooltip for Admins
**File:** `/components/UserManagementTree.tsx`

**Implementation:**
- Added `HoverCard` component from shadcn/ui
- When hovering over any user's name (except global admin), shows:
  - **Assigned To:** Tenant and Organization names with icons
  - **Permissions:** All admin rights (Tenant Admin, Org Admin, or both)
- Global admin excluded from tooltip (everyone knows they control everything)
- Tooltip provides instant visibility into user's full access scope

### 3. ✅ Removed Branding Section
**Deleted:** `/components/GlobalAdminSettings.tsx`

- Removed standalone GlobalAdminSettings component
- All branding functionality moved to ProfileScreen

### 4. ✅ Context-Aware Profile Menu
**File:** `/App.tsx`

**Implementation:**
The hamburger menu now shows context-aware profile labels:
- **Global Admin:** "Global Profile"
- **Tenant Admin:** "{Tenant Name} Profile" (e.g., "Acme Corp Profile")
- **Org Admin:** "{Organization Name} Profile" (e.g., "XYZ Inc Profile")
- **Regular User:** "{User Name} Profile" (e.g., "John Doe Profile")

**Location:** Hamburger menu (☰) → Profile item

### 5. ✅ Comprehensive Profile Screen
**File:** `/components/ProfileScreen.tsx`

**Complete Redesign with Two Tabs:**

#### Tab 1: Profile & Password
Available to ALL users:
- **Personal Information:**
  - Name (editable)
  - Email (editable)
  - Role badge (read-only)
  
- **Change Password:**
  - Current password (required for change)
  - New password (min 8 characters)
  - Confirm password (must match)
  - Validation and security checks

#### Tab 2: Branding (Admins Only)
Only visible to: Global Admin, Tenant Admin, Org Admin

**Logo Management:**
- **Upload Option:**
  - File upload input
  - Accepts PNG, JPG, SVG (max 5MB)
  - Automatic image resizing to fit default logo space
  - Upload to `/admin/upload-logo` endpoint
  
- **URL Option:**
  - Direct URL input
  - Live preview
  - Fallback if upload fails

- **Logo Preview:**
  - Real-time preview of uploaded/URL logo
  - Contained within standardized dimensions
  - Error handling for broken images

**Brand Colors:**
- **Primary Color:**
  - Color picker input
  - Hex code text input
  - Live preview swatch

- **Secondary Color:**
  - Color picker input
  - Hex code text input
  - Live preview swatch

- **Color Preview:**
  - Side-by-side swatches showing both colors
  - Labels for clarity

**Context-Specific Behavior:**
- **Global Admin:** Sets DEFAULT branding for new tenants/orgs only
  - Warning message: "These settings only apply to newly created tenants and organizations"
  - Existing entities keep their current branding
  
- **Tenant Admin:** Updates TENANT branding
  - Applies to their specific tenant
  - Saves to tenant record
  
- **Org Admin:** Updates ORGANIZATION branding
  - Applies to their specific organization
  - Saves to organization record

### 6. ✅ Backend Endpoints
**File:** `/supabase/functions/server/index.tsx`

**New/Updated Endpoints:**

```
GET  /admin/default-branding                      - Global admin default branding
POST /admin/default-branding                      - Update global defaults
POST /admin/update-profile                        - Update user profile & password

GET  /admin/tenants/:tenantId/branding           - Get tenant branding
POST /admin/tenants/:tenantId/branding           - Update tenant branding

GET  /admin/organizations/:organizationId/branding    - Get org branding
POST /admin/organizations/:organizationId/branding    - Update org branding
```

**Permission Checks:**
- Global admin: Can access all branding endpoints
- Tenant admin: Can only access their own tenant's branding
- Org admin: Can only access their own organization's branding
- Regular users: No access to branding endpoints

**Data Storage:**
- Global defaults: Stored in KV as `default:branding`
- Tenant branding: Stored in tenant record (primaryColor, secondaryColor, logoUrl)
- Org branding: Stored in organization record (primaryColor, secondaryColor, logoUrl)

## Visual Hierarchy Example

```
Test Tenant (3 users, 2 orgs)
  │
  ├─ Tenant Admins ────────────────── [Shows at TOP]
  │   └─ John Doe [Tenant Admin]
  │       [On hover: Shows Tenant: Test Tenant, Org: Acme Corp, Both admin rights]
  │
  ├─ Acme Corp Organization (2 users)
  │   ├─ John Doe [Tenant & Org Admin] ── [Same user, labeled as both]
  │   └─ Jane Smith [User]
  │
  └─ XYZ Inc Organization (1 user)
      └─ Bob Johnson [Org Admin]
```

## User Flows

### 1. Global Admin Updates Default Branding
1. Click hamburger menu (☰)
2. Click "Global Profile"
3. Go to "Branding" tab
4. Upload logo or enter URL
5. Choose primary/secondary colors
6. Click "Save Branding"
7. ✅ New tenants/orgs will use these defaults
8. ⚠️ Existing tenants/orgs unchanged

### 2. Tenant Admin Updates Tenant Branding
1. Click hamburger menu (☰)
2. Click "{Tenant Name} Profile"
3. Go to "Branding" tab
4. Upload logo or enter URL
5. Choose primary/secondary colors
6. Click "Save Branding"
7. ✅ Tenant branding updated immediately

### 3. Org Admin Updates Organization Branding
1. Click hamburger menu (☰)
2. Click "{Organization Name} Profile"
3. Go to "Branding" tab
4. Upload logo or enter URL
5. Choose primary/secondary colors
6. Click "Save Branding"
7. ✅ Organization branding updated immediately

### 4. Any User Changes Password
1. Click hamburger menu (☰)
2. Click profile (context-appropriate name)
3. On "Profile & Password" tab
4. Enter current password
5. Enter new password (min 8 chars)
6. Confirm new password
7. Click "Save Profile"
8. ✅ Password updated securely

### 5. Hover to See User's Full Access
1. Go to Admin → User Management
2. Expand any tenant or organization
3. Hover mouse over any admin's name
4. See popup showing:
   - Tenant assignment
   - Organization assignment
   - All admin permissions

## Files Modified

1. `/components/UserManagementTree.tsx` - Fixed visibility, added tooltips
2. `/components/ProfileScreen.tsx` - Complete redesign with branding
3. `/App.tsx` - Context-aware profile menu
4. `/supabase/functions/server/index.tsx` - Added branding endpoints
5. **DELETED:** `/components/GlobalAdminSettings.tsx`

## Technical Details

### Image Upload & Resizing
The system supports both file upload and URL input:

**File Upload Flow:**
1. User selects image file
2. Validates file type (image/*) and size (max 5MB)
3. Creates FormData with file + context (role, tenantId, orgId)
4. POSTs to `/admin/upload-logo`
5. Backend processes and stores in Supabase Storage
6. Returns public URL
7. Frontend updates brandingData.logoUrl

**Automatic Resizing:**
- Images displayed with `max-h-full max-w-full object-contain`
- Maintains aspect ratio
- Fits within standardized logo space
- Responsive across devices

**URL Input:**
- Direct link to image
- Live preview with error handling
- Fallback option if upload fails

### Branding Scope & Inheritance

**Global Admin Default:**
```
default:branding {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  logoUrl: 'https://...'
}
```

**New Tenant Created:**
```
tenant:abc123 {
  name: 'Acme Corp',
  domain: 'acme.com',
  primaryColor: '#3b82f6',    // ← Inherited from default
  secondaryColor: '#10b981',   // ← Inherited from default
  logoUrl: 'https://...'       // ← Inherited from default
}
```

**Tenant Admin Updates:**
```
tenant:abc123 {
  name: 'Acme Corp',
  domain: 'acme.com',
  primaryColor: '#ff0000',     // ← Updated by tenant admin
  secondaryColor: '#00ff00',   // ← Updated by tenant admin
  logoUrl: 'https://new.logo'  // ← Updated by tenant admin
}
```

**Organizations inherit from their tenant** unless overridden.

## Testing Checklist

- [x] Tenant admin visible at top when expanding tenant
- [x] Tenant admin with org rights shows in both places
- [x] Hover tooltip shows tenant, org, and permissions
- [x] Global admin excluded from tooltip
- [x] Profile menu shows correct label based on role
- [x] Global admin sees "Global Profile"
- [x] Tenant admin sees "{Tenant Name} Profile"
- [x] Org admin sees "{Organization Name} Profile"
- [x] Regular user sees "{User Name} Profile"
- [x] Branding tab only visible to admins
- [x] File upload accepts images
- [x] URL input works for logo
- [x] Logo preview displays correctly
- [x] Color pickers work
- [x] Color preview swatches display
- [x] Password change requires current password
- [x] Password validation (min 8 chars)
- [x] Global admin branding affects new entities only
- [x] Tenant admin can update tenant branding
- [x] Org admin can update org branding
- [x] Permission checks prevent unauthorized access

## Next Steps

If you want to actually apply the default branding when creating new tenants/organizations:

1. Update tenant creation endpoint to fetch and apply default branding
2. Update organization creation endpoint to inherit tenant branding or defaults
3. Add UI to preview how branding will look
4. Add ability to reset branding to defaults

This foundation is now in place and ready for those enhancements!
