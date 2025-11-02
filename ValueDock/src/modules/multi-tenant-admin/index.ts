/**
 * Multi-Tenant Admin Module - Main Export
 *
 * A complete multi-tenant administration system that can be imported into any app.
 */

// Type exports
export type {
  UserProfile,
  Tenant,
  Organization,
  UserGroup,
  Backup,
  MultiTenantConfig,
  AuthState,
  UserRole,
  PermissionCheck,
  CreateUserPayload,
  CreateTenantPayload,
  CreateOrganizationPayload,
  UpdateUserPayload,
  UpdateTenantPayload,
  UpdateOrganizationPayload,
} from "./types";

// Utility exports
export {
  initializeAuth,
  signIn,
  signOut,
  getSession,
  hasRole,
  getUserPermissions,
  apiCall,
} from "./utils/auth";

export {
  isValidDomain,
  isValidEmail,
  isValidPassword,
  isValidName,
  extractDomainFromEmail,
  suggestEmailCompletion,
  sanitizeInput,
  isValidRole,
  isValidUUID,
} from "./utils/validation";

// Component exports (these would need to be created)
export { MultiTenantAdminPanel } from "./components/MultiTenantAdminPanel";
export { UserManagement } from "./components/UserManagement";
export { TenantManagement } from "./components/TenantManagement";
export { OrganizationManagement } from "./components/OrganizationManagement";
export { ContextSwitcher } from "./components/ContextSwitcher";

// Hook exports
export { useMultiTenant } from "./hooks/useMultiTenant";
export { usePermissions } from "./hooks/usePermissions";
export { useAuth } from "./hooks/useAuth";