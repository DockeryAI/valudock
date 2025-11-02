/**
 * Multi-Tenant Admin Module - Type Definitions
 * 
 * Core types for the multi-tenant administration system
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'master_admin' | 'tenant_admin' | 'org_admin' | 'user';
  tenantId: string | null;
  organizationId: string | null;
  groupIds?: string[];
  readOnly?: boolean;
  active: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings?: {
    brandName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  companyName: string;
  domain: string;
  tenantId: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  averageHourlyWage?: number;
  annualSalary?: number;
  organizationId?: string;
  tenantId?: string;
}

export interface Backup {
  id: string;
  type: 'tenant' | 'organization' | 'user';
  entityId: string;
  entityName: string;
  data: any;
  deletedAt: string;
  deletedBy: string;
}

export interface MultiTenantConfig {
  projectId: string;
  apiEndpoint: string;
  enableBackups?: boolean;
  enableGroupManagement?: boolean;
  customRoles?: string[];
  customValidation?: {
    email?: (email: string) => boolean;
    domain?: (domain: string) => boolean;
  };
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
}

export type UserRole = 'master_admin' | 'tenant_admin' | 'org_admin' | 'user';

export interface PermissionCheck {
  canManageTenants: boolean;
  canManageOrganizations: boolean;
  canManageUsers: boolean;
  canViewBackups: boolean;
  canSwitchContext: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  tenantId?: string | null;
  organizationId?: string | null;
  groupIds?: string[];
  readOnly?: boolean;
}

export interface CreateTenantPayload {
  name: string;
  domain: string;
  settings?: {
    brandName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
}

export interface CreateOrganizationPayload {
  name: string;
  companyName: string;
  domain: string;
  tenantId: string;
  description?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  tenantId?: string | null;
  organizationId?: string | null;
  groupIds?: string[];
  readOnly?: boolean;
  active?: boolean;
}

export interface UpdateTenantPayload {
  name?: string;
  domain?: string;
  settings?: {
    brandName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
}

export interface UpdateOrganizationPayload {
  name?: string;
  companyName?: string;
  domain?: string;
  description?: string;
}
