# Reference: Mapping to ValueDock Components

This document maps the module files to the original ValueDock® implementation.

## Component Mapping

### Core Admin Components

| Module File | Original ValueDock File | Description |
|------------|------------------------|-------------|
| `components/MultiTenantAdminPanel.tsx` | `/components/AdminDashboard.tsx` | Main admin panel |
| `components/UserManagement.tsx` | `/components/UserManagementTree.tsx` | User management tree view |
| `components/ContextSwitcher.tsx` | `/components/TenantOrgContextSwitcher.tsx` | Context switching |
| `components/CreateUserDialog.tsx` | `/components/EnhancedUserDialogV2.tsx` | User creation dialog |
| `components/EditUserDialog.tsx` | `/components/EditUserDialog.tsx` | User editing dialog |
| `components/DeleteConfirmationDialog.tsx` | `/components/DeleteConfirmationDialog.tsx` | Delete confirmation |

### Utilities

| Module File | Original ValueDock File | Description |
|------------|------------------------|-------------|
| `utils/auth.ts` | `/utils/auth.ts` | Authentication utilities |
| `utils/validation.ts` | `/utils/domainValidation.ts` | Validation functions |

### Backend

| Module File | Original ValueDock File | Description |
|------------|------------------------|-------------|
| `backend/routes.tsx` | `/supabase/functions/server/index.tsx` | All admin routes (lines 800-1500) |

## Key Differences from ValueDock

### 1. **Configuration System**

**ValueDock:**
```tsx
// Hard-coded values
const projectId = 'xyz';
```

**Module:**
```tsx
// Configurable
initializeAuth({
  projectId: 'xyz',
  apiEndpoint: '/api',
});
```

### 2. **Import Paths**

**ValueDock:**
```tsx
import { AdminDashboard } from './components/AdminDashboard';
import { apiCall } from '../utils/auth';
```

**Module:**
```tsx
import { MultiTenantAdminPanel, apiCall } from './modules/multi-tenant-admin';
```

### 3. **Self-Contained**

**ValueDock:**
- Depends on app-specific components
- Uses app's route structure
- Coupled with ROI calculator features

**Module:**
- Zero dependencies on host app
- Bring your own routing
- Pure multi-tenant functionality

### 4. **Backend Organization**

**ValueDock:**
- All routes in single `index.tsx` file
- Mixed with app-specific routes
- 3000+ lines of code

**Module:**
- Clean separation of concerns
- Modular route files
- Easy to integrate

## What Was Extracted

### Included in Module ✅

- ✅ Complete user management system
- ✅ Tenant management (Global Admin)
- ✅ Organization management
- ✅ Role-based permissions (4 levels)
- ✅ Context switching
- ✅ Group assignment
- ✅ Backup & restore
- ✅ Delete confirmations
- ✅ Mobile responsive UI
- ✅ Authentication flows
- ✅ All backend CRUD routes
- ✅ Permission validation
- ✅ Domain validation

### Not Included (App-Specific) ❌

- ❌ ROI calculator features
- ❌ Process management
- ❌ Scenario planning
- ❌ Timeline features
- ❌ Results/export screens
- ❌ Fathom integration
- ❌ OpenAI integration
- ❌ Gamma presentation
- ❌ Cost classification
- ❌ Global settings management

## How to Migrate from ValueDock

If you want to use this module in an existing ValueDock instance:

### Option 1: Keep Using Original (No Changes)

Continue using the components in `/components/` - they work fine.

### Option 2: Gradual Migration

1. Install module alongside existing code
2. Keep both implementations
3. Gradually switch imports from old to new
4. Test thoroughly
5. Remove old code when ready

### Option 3: New Projects Only

Use the module for NEW projects only, keep ValueDock as-is.

## Files to Reference

When customizing the module, refer to these ValueDock files:

### For UI/UX Examples
- `/components/AdminDashboard.tsx` - Full-featured admin panel
- `/components/UserManagementTree.tsx` - Tree view implementation
- `/components/TenantOrgMobileView.tsx` - Mobile optimization

### For Backend Logic
- `/supabase/functions/server/index.tsx` (lines 800-1500)
  - User CRUD operations
  - Tenant management
  - Organization management
  - Permission checks
  - Backup system

### For Utilities
- `/utils/auth.ts` - Authentication patterns
- `/utils/domainValidation.ts` - Validation logic

### For Documentation
- `/docs/admin/ADMIN_COMPLETE_GUIDE.md`
- `/ADMIN_PANEL_REORGANIZATION.md`
- `/ORGANIZATION_SCOPED_DATA_IMPLEMENTATION.md`

## Extending the Module

To add features from ValueDock to the module:

### Example: Add Global Settings

1. Create new type in `types.ts`:
```typescript
export interface GlobalSettings {
  /* ... */
}
```

2. Add component in `components/GlobalSettingsPanel.tsx`

3. Add backend route in `backend/settings.tsx`

4. Export from `index.ts`

## Support & Questions

If you need to:
- **Understand a feature**: Check the original ValueDock implementation
- **Add a feature**: Reference the ValueDock file structure
- **Fix a bug**: Compare with ValueDock's working implementation
- **Customize**: Use ValueDock as a reference implementation

The module is a clean extraction - everything works the same way, just organized differently for reusability.
