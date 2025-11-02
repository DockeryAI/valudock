# Changelog

All notable changes to ValueDock® will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-12 - Production Ready Release

### 🎉 Major Release - Loveable Migration Ready

This release marks ValueDock® as production-ready with complete Builder.io optimization and Loveable platform compatibility.

### Added

#### Core Features
- ✅ Seven main calculation screens (Inputs, Implementation, Results, Presentation, Scenario, Timeline, Export)
- ✅ Multi-tenant architecture with complete data isolation per organization
- ✅ Role-based access control (Master Admin, Tenant Admin, Org Admin, User)
- ✅ CFO-grade financial calculations (NPV, IRR, Payback Period, Sensitivity Analysis)
- ✅ Organization-scoped data storage with localStorage and Supabase backend
- ✅ Auto-save functionality with 30-second interval
- ✅ Manual save to cloud with POST/GET/DELETE endpoints

#### Admin Panel
- ✅ Comprehensive user management with hierarchical tree view
- ✅ Tenant and organization creation/management
- ✅ Cost classification system with hard/soft cost tracking
- ✅ Two-level context switching (Tenant → Organization)
- ✅ Bulk user operations with safety confirmations
- ✅ System diagnostics and monitoring tools
- ✅ Debug console for troubleshooting

#### Mobile Optimization
- ✅ Card-based layout for user management (no horizontal scroll)
- ✅ Touch-friendly process reordering with up/down arrow buttons
- ✅ Scrollable advanced metrics screens with all fields visible
- ✅ Responsive design across all breakpoints
- ✅ Mobile-first approach with dedicated components

#### Data Management
- ✅ Group-based filtering and organization
- ✅ Cost classification with custom categories
- ✅ Hard Costs Only NPV toggle for conservative estimates
- ✅ Backup and restore functionality
- ✅ Data export in multiple formats (PDF, CSV, Excel)

#### Builder.io Optimization
- ✅ All components functional and TypeScript-typed
- ✅ Clear prop interfaces for visual editing
- ✅ Tailwind CSS 4.0 with theme tokens
- ✅ Centralized state management ready for context
- ✅ API integration stateless and Builder.io compatible
- ✅ Performance optimized with lazy loading
- ✅ SSR-compatible (no window dependencies)

### Changed

#### Architecture
- Moved from per-user to per-organization data storage
- Implemented two-level navigation for multi-tenant access
- Separated tenant admin and organization admin roles clearly
- Optimized component structure for Builder.io registration

#### UI/UX
- Redesigned user management from tables to cards on mobile
- Added process reordering buttons for touch devices
- Made advanced metrics screens fully scrollable
- Improved context switcher with better visual hierarchy
- Enhanced cost classification UI with tree view

#### Performance
- Implemented lazy loading for images
- Added memoization for complex calculations
- Optimized re-renders with React best practices
- Reduced bundle size with code splitting

### Fixed

#### Critical Fixes
- Fixed admin panel crash from Fragment import issues
- Resolved process reordering buttons opening wrong menu
- Fixed advanced metrics not visible on mobile (scrolling issue)
- Corrected isMobile hook placement causing reference errors
- Fixed Fragment tag mismatches in UserManagementTree

#### Data Persistence
- Fixed localStorage data loss on context switch
- Corrected organization-scoped data isolation
- Fixed auto-save not triggering for global defaults
- Resolved cost classification save issues

#### Admin Panel
- Fixed user creation validation errors
- Corrected tenant admin dual-role assignment
- Fixed organization admin permissions scope
- Resolved user deletion safety issues

#### Mobile Issues
- Eliminated all horizontal scroll bars
- Fixed touch event propagation on reorder buttons
- Corrected viewport height issues on iOS
- Fixed card layout overflow on small screens

### Security

- Implemented role-based permission checks at all levels
- Added data isolation verification per organization
- Secured service role key (never exposed to frontend)
- Added input validation on all user inputs
- Implemented CSRF protection via Supabase auth

### Documentation

#### New Documentation
- `/docs/admin/ADMIN_COMPLETE_GUIDE.md` - Comprehensive admin manual
- `/BUILDER_IO_OPTIMIZATION_COMPLETE.md` - Builder.io integration guide
- `/LOVEABLE_MIGRATION_GUIDE.md` - Step-by-step Loveable migration
- `/LOVEABLE_IMPORT_CHECKLIST.md` - Quick reference checklist

#### Updated Documentation
- `README.md` - Complete project overview
- `QUICK_START.md` - Updated with current features
- `TROUBLESHOOTING.md` - Added latest fixes
- `/docs/api-contracts.md` - Updated API endpoints
- `/docs/permissions-matrix.md` - Current role structure

### Migration Notes

This version is optimized for migration to Loveable platform:

1. All environment variables use `VITE_` prefix
2. Configuration files ready (package.json, tsconfig.json, vite.config.ts)
3. Components registered for Builder.io
4. Supabase Edge Function deployment tested
5. Mobile optimization complete

See `/LOVEABLE_MIGRATION_GUIDE.md` for complete migration instructions.

---

## [0.9.0] - 2025-01-10 - Mobile Optimization Complete

### Added
- Mobile-responsive user management with card layout
- Touch-friendly process reordering
- Scrollable advanced metrics screens
- Mobile context switcher

### Fixed
- Horizontal scroll issues on all screens
- Touch event handling for mobile devices
- Viewport height calculations for iOS
- Card overflow on small screens

---

## [0.8.0] - 2025-01-08 - Organization-Scoped Data

### Added
- Complete data isolation per organization
- Two-level context switching (Tenant → Org)
- Organization selector in Global View
- Automatic data loading on context switch

### Changed
- Migrated from user-scoped to org-scoped storage
- Updated all API endpoints to use organization UUID
- Modified data keys to include org prefix

---

## [0.7.0] - 2025-01-05 - Admin Panel Enhancement

### Added
- Hierarchical user management tree
- Tenant and organization creation
- Cost classification manager
- System diagnostics panel
- Debug console

### Fixed
- User creation validation
- Tenant admin assignment logic
- Organization admin permissions
- Bulk delete confirmation

---

## [0.6.0] - 2025-01-03 - Backend Integration

### Added
- Supabase Edge Function deployment
- POST/GET/DELETE endpoints for data
- Authentication via Supabase Auth
- Cloud data persistence

### Changed
- Migrated from localStorage-only to hybrid storage
- Added server-side data validation
- Implemented API error handling

---

## [0.5.0] - 2025-01-01 - Cost Classification System

### Added
- Custom cost categories
- Hard/soft cost distinction
- Cost classification manager UI
- NPV calculation with hard costs only option

### Fixed
- Cost save persistence issues
- Classification dropdown empty values
- Default classification assignment

---

## [0.4.0] - 2024-12-28 - Group Filtering

### Added
- Group creation and management
- Group-based process filtering
- Auto-create default group
- Group assignment to users

### Fixed
- Group storage key mismatch
- Auto-save for group changes
- Group filtering logic

---

## [0.3.0] - 2024-12-25 - Implementation Screen

### Added
- Implementation timeline editor
- Timeline visualization
- Phase-based deployment planning
- Timeline export

---

## [0.2.0] - 2024-12-20 - Financial Calculations

### Added
- NPV calculation with custom discount rate
- IRR calculation
- Payback period analysis
- Sensitivity analysis
- FTE impact calculations

---

## [0.1.0] - 2024-12-15 - Initial Release

### Added
- Basic calculator structure
- Inputs screen with process editor
- Results screen with charts
- Presentation screen
- LocalStorage persistence

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

---

## Upcoming Features

### [1.1.0] - Planned
- [ ] AI-powered insights integration
- [ ] Advanced export templates
- [ ] Multi-currency support
- [ ] Audit logging
- [ ] Webhook integration

### [1.2.0] - Future
- [ ] Real-time collaboration
- [ ] Advanced reporting dashboard
- [ ] Custom calculation formulas
- [ ] Integration with external tools

---

**For detailed migration instructions, see `/LOVEABLE_MIGRATION_GUIDE.md`**

**For Builder.io integration, see `/BUILDER_IO_OPTIMIZATION_COMPLETE.md`**
