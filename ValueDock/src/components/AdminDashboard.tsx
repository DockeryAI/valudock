/**
 * AdminDashboard - Multi-tenant administration system
 * 
 * HIERARCHY:
 * - Tenants: Tenant partners (e.g., consulting firms, MSPs)
 * - Organizations: Client companies under tenants (e.g., Acme Corp, XYZ Inc)
 * - Users: Individual users belonging to organizations
 * 
 * PERMISSIONS:
 * - master_admin (Global Admin): Can add/edit/delete ANY tenant, organization, or user
 * - tenant_admin (Tenant Admin): Can add/edit/delete ANY organization or user WITHIN their tenant
 * - org_admin (Organization Admin): Can add/edit/delete ANY user WITHIN their organization
 * - user (Regular User): Can only view and use the ROI calculator
 * 
 * DOMAIN VALIDATION:
 * - Both tenants and organizations require valid domain names (e.g., company.com)
 * - Domain format: alphanumeric with hyphens, must have valid TLD
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Checkbox } from './ui/checkbox';
import { Users, UserPlus, Building2, Shield, Trash2, Edit, AlertCircle, FileText, Link, Database, DollarSign, Webhook, PlayCircle, BarChart3 } from 'lucide-react';
import { UserProfile, apiCall, hasRole } from '../utils/auth';
import { toast } from 'sonner';
// No-op toast stubs to avoid errors (commented out - using real toast now)
// const toast = {
//   info: (...args: any[]) => {},
//   success: (...args: any[]) => {},
//   error: (...args: any[]) => {},
//   warning: (...args: any[]) => {},
// };
import { DocumentationViewer } from './DocumentationViewer';
import { isValidDomain } from '../utils/domainValidation';
import { UserManagementTree } from './UserManagementTree';
import { TenantOrgMobileView } from './TenantOrgMobileView';
import { EnhancedUserDialogV2 } from './EnhancedUserDialogV2';
import { AdminUserSelector } from './AdminUserSelector';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { RestoreBackupDialog } from './RestoreBackupDialog';
import { OrganizationDocuments } from './OrganizationDocuments';
import { AdminRoleFixer } from './AdminRoleFixer';
import { AdminSystemInfo } from './AdminSystemInfo';
import { useIsMobile } from './ui/use-mobile';
import { CostClassificationTreeView } from './CostClassificationTreeView';
import { FathomWebhookAdmin } from './FathomWebhookAdmin';
import { EffortAnchorsAdmin } from './EffortAnchorsAdmin';
import { ProposalAgentConnections } from './ProposalAgentConnections';
import { ProposalAgentRunner } from './ProposalAgentRunner';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { BackendConnectionVerifier } from './BackendConnectionVerifier';

interface AdminDashboardProps {
  currentUser: UserProfile;
  globalDefaults?: any;
  onSaveGlobalDefaults?: (newDefaults: any) => Promise<void>;
  selectedContextOrgId?: string | null;
}

export function AdminDashboard({ currentUser, globalDefaults, onSaveGlobalDefaults, selectedContextOrgId }: AdminDashboardProps) {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showNewTenantDialog, setShowNewTenantDialog] = useState(false);
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [showEditOrgDialog, setShowEditOrgDialog] = useState(false);
  const [showEditTenantDialog, setShowEditTenantDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  
  // Bulk selection states
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Admin user assignment for tenant/org creation
  const [tenantAdminUserId, setTenantAdminUserId] = useState<string | null>(null);
  const [tenantAdminUserData, setTenantAdminUserData] = useState<any | null>(null);
  const [orgAdminUserId, setOrgAdminUserId] = useState<string | null>(null);
  const [orgAdminUserData, setOrgAdminUserData] = useState<any | null>(null);

  // Delete confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState<{
    type: 'tenant' | 'tenants' | 'organization' | 'organizations' | 'user' | 'users';
    entityName?: string;
    count?: number;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Restore backup dialog
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  // New user form
  // Global admins don't have a default tenant - it must be selected
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
    tenantId: currentUser.tenantId || '',
    organizationId: ''
  });

  // New tenant form
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    settings: {
      brandName: '',
      primaryColor: '#0ea5e9',
      logoUrl: ''
    }
  });

  // New organization form
  // Global admins don't have a default tenant - it must be selected
  const [newOrg, setNewOrg] = useState({
    name: '',
    companyName: '',
    domain: '',
    tenantId: currentUser.tenantId || '',
    description: ''
  });

  // Listen for quick create organization event from UserManagementTree
  useEffect(() => {
    const handleCreateOrg = (event: any) => {
      console.log('[AdminDashboard] create-organization event received:', event.detail);
      const { tenantId } = event.detail;
      setNewOrg(prev => ({ ...prev, tenantId }));
      setShowNewOrgDialog(true);
      console.log('[AdminDashboard] Opening new org dialog with tenantId:', tenantId);
    };

    window.addEventListener('create-organization', handleCreateOrg as EventListener);
    console.log('[AdminDashboard] Event listener registered for create-organization');
    return () => window.removeEventListener('create-organization', handleCreateOrg as EventListener);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Domain validation helper
  const isValidDomain = (domain: string): boolean => {
    // Basic domain validation: alphanumeric, hyphens, dots
    // Must have at least one dot and valid TLD
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load users
      const usersData = await apiCall('/admin/users');
      setUsers(usersData.users || []);

      // Load tenants if global admin
      if (currentUser.role === 'master_admin') {
        const tenantsData = await apiCall('/admin/tenants');
        setTenants(tenantsData.tenants || []);
      }

      // Load organizations
      if (['master_admin', 'tenant_admin', 'org_admin'].includes(currentUser.role)) {
        const orgsData = await apiCall('/admin/organizations');
        setOrganizations(orgsData.organizations || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData?: any) => {
    try {
      const userToCreate = userData || newUser;

      
      // Validate required fields
      if (!userToCreate.email || !userToCreate.password || !userToCreate.name) {
        setError('Please fill in all required fields');

        return;
      }

      // Validate tenant exists (except for creating another global admin)
      if (currentUser.role === 'master_admin' && !userToCreate.tenantId && userToCreate.role !== 'master_admin') {
        setError('Please select a tenant (or set role to Global Admin)');

        return;
      }

      // Validate organization if selected
      if (userToCreate.organizationId && organizations.length > 0) {
        const orgExists = organizations.some(o => o.id === userToCreate.organizationId);
        if (!orgExists) {
          setError('Selected organization does not exist');

          return;
        }
      }

      console.log('Creating user with data:', userToCreate);


      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: userToCreate
      });

      console.log('User created successfully:', response);
      toast.success(`✅ User "${userToCreate.email}" created successfully!`, { duration: 4000 });

      setShowNewUserDialog(false);
      setNewUser({
        email: '',
        password: '',
        name: '',
        role: 'user',
        tenantId: currentUser.tenantId,
        organizationId: ''
      });
      setError('');
      
      toast.info('🔄 Reloading data...', { duration: 2000 });
      await loadData();
      toast.success('✅ Data refreshed!', { duration: 2000 });
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMsg = err.message || 'Failed to create user';
      setError(errorMsg);
    }
  };

  const handleCreateTenant = async () => {
    try {
      console.log('Creating tenant with data:', newTenant);
      
      if (!newTenant.name || !newTenant.domain) {
        const errorMsg = 'Please fill in tenant name and domain';
        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
        return;
      }

      // Validate domain format
      if (!isValidDomain(newTenant.domain)) {
        const errorMsg = 'Please enter a valid domain name (e.g., example.com)';
        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
        return;
      }


      
      const response = await apiCall('/admin/tenants', {
        method: 'POST',
        body: newTenant
      });
      
      console.log('Tenant created successfully:', response);
      const createdTenantId = response.tenant.id;
      toast.success(`✅ Tenant "${newTenant.name}" created successfully!`, { duration: 4000 });

      // Handle admin user assignment
      if (tenantAdminUserData) {

        const adminUserPayload = {
          ...tenantAdminUserData,
          tenantId: createdTenantId,
          role: 'tenant_admin'
        };
        await apiCall('/auth/signup', {
          method: 'POST',
          body: adminUserPayload
        });
        toast.success(`✅ Tenant admin "${tenantAdminUserData.email}" created!`, { duration: 4000 });
      } else if (tenantAdminUserId && tenantAdminUserId !== '__none__') {

        await apiCall(`/admin/users/${tenantAdminUserId}`, {
          method: 'PUT',
          body: { 
            role: 'tenant_admin',
            tenantId: createdTenantId
          }
        });

      }

      setShowNewTenantDialog(false);
      setNewTenant({
        name: '',
        domain: '',
        settings: {
          brandName: '',
          primaryColor: '#0ea5e9',
          logoUrl: ''
        }
      });
      setTenantAdminUserId(null);
      setTenantAdminUserData(null);
      setError('');
      
      toast.info('🔄 Reloading data...', { duration: 2000 });
      await loadData();
      toast.success('✅ Data refreshed!', { duration: 2000 });
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      const errorMsg = err.message || 'Failed to create tenant';
      setError(errorMsg);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      console.log('Creating organization with data:', newOrg);
      toast.info('🚀 Starting organization creation...', { duration: 2000 });
      
      if (!newOrg.name || !newOrg.companyName || !newOrg.domain || !newOrg.tenantId) {
        const errorMsg = 'Please fill in all required fields: name, company name, domain, and tenant';
        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
        return;
      }

      // Validate domain format
      if (!isValidDomain(newOrg.domain)) {
        const errorMsg = 'Please enter a valid domain name (e.g., company.com)';
        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
        return;
      }

      toast.info(`📤 Sending request for: ${newOrg.name}`, { duration: 2000 });
      
      const response = await apiCall('/admin/organizations', {
        method: 'POST',
        body: newOrg
      });

      console.log('Organization created successfully:', response);
      const createdOrgId = response.organization.id;
      toast.success(`✅ Organization "${newOrg.name}" created successfully!`, { duration: 4000 });

      // Handle admin user assignment
      if (orgAdminUserData) {
        toast.info('👤 Creating organization admin user...', { duration: 2000 });
        const adminUserPayload = {
          ...orgAdminUserData,
          tenantId: newOrg.tenantId,
          organizationId: createdOrgId,
          role: 'org_admin'
        };
        await apiCall('/auth/signup', {
          method: 'POST',
          body: adminUserPayload
        });
        toast.success(`✅ Organization admin "${orgAdminUserData.email}" created!`, { duration: 4000 });
      } else if (orgAdminUserId && orgAdminUserId !== '__none__') {
        toast.info('👤 Assigning organization admin...', { duration: 2000 });
        await apiCall(`/admin/users/${orgAdminUserId}`, {
          method: 'PUT',
          body: { 
            role: 'org_admin',
            organizationId: createdOrgId
          }
        });
        toast.success(`✅ Organization admin assigned!`, { duration: 4000 });
      }

      setShowNewOrgDialog(false);
      setNewOrg({
        name: '',
        companyName: '',
        domain: '',
        tenantId: currentUser.tenantId,
        description: ''
      });
      setOrgAdminUserId(null);
      setOrgAdminUserData(null);
      setError('');
      
      toast.info('🔄 Reloading data...', { duration: 2000 });
      await loadData();
      toast.success('✅ Data refreshed!', { duration: 2000 });
    } catch (err: any) {
      console.error('Error creating organization:', err);
      const errorMsg = err.message || 'Failed to create organization';
      setError(errorMsg);
      toast.error(`❌ Error: ${errorMsg}`, { duration: 8000 });
      toast.error(`🐛 Debug data: ${JSON.stringify(newOrg)}`, { duration: 8000 });
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrganization) return;

    try {
      console.log('Updating organization:', selectedOrganization);
      
      if (!selectedOrganization.name || !selectedOrganization.companyName || !selectedOrganization.domain) {
        const errorMsg = 'Please fill in all required fields: name, company name, and domain';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate domain format
      if (!isValidDomain(selectedOrganization.domain)) {
        const errorMsg = 'Please enter a valid domain name (e.g., company.com)';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const response = await apiCall(`/admin/organizations/${selectedOrganization.id}`, {
        method: 'PUT',
        body: {
          name: selectedOrganization.name,
          companyName: selectedOrganization.companyName,
          domain: selectedOrganization.domain,
          description: selectedOrganization.description
        }
      });

      console.log('Organization updated successfully:', response);

      setShowEditOrgDialog(false);
      setSelectedOrganization(null);
      setError('');
      toast.success('Organization updated successfully');
      loadData();
    } catch (err: any) {
      console.error('Error updating organization:', err);
      const errorMsg = err.message || 'Failed to update organization';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    
    setDeleteDialogConfig({
      type: 'organization',
      entityName: org?.name || orgId,
      onConfirm: async () => {
        try {
          await apiCall(`/admin/organizations/${orgId}`, {
            method: 'DELETE'
          });
          setError('');
          toast.success('Organization deleted and backed up successfully');
          loadData();
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to delete organization';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    });
    setDeleteDialogOpen(true);
  };

  const openEditOrgDialog = (org: any) => {
    setSelectedOrganization({ ...org });
    setShowEditOrgDialog(true);
  };

  const openEditTenantDialog = (tenant: any) => {
    setSelectedTenant({ ...tenant });
    setShowEditTenantDialog(true);
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;

    try {
      console.log('Updating tenant:', selectedTenant);
      
      if (!selectedTenant.name || !selectedTenant.domain) {
        const errorMsg = 'Please fill in tenant name and domain';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate domain format
      if (!isValidDomain(selectedTenant.domain)) {
        const errorMsg = 'Please enter a valid domain name (e.g., example.com)';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const response = await apiCall(`/admin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        body: {
          name: selectedTenant.name,
          domain: selectedTenant.domain,
          settings: selectedTenant.settings
        }
      });

      console.log('Tenant updated successfully:', response);
      setShowEditTenantDialog(false);
      setSelectedTenant(null);
      setError('');
      toast.success('Tenant updated successfully');
      loadData();
    } catch (err: any) {
      console.error('Error updating tenant:', err);
      const errorMsg = err.message || 'Failed to update tenant';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    
    setDeleteDialogConfig({
      type: 'tenant',
      entityName: tenant?.name || tenantId,
      onConfirm: async () => {
        try {
          await apiCall(`/admin/tenants/${tenantId}`, {
            method: 'DELETE'
          });
          setError('');
          toast.success('Tenant deleted and backed up successfully');
          loadData();
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to delete tenant';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    });
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteTenants = async () => {
    if (selectedTenantIds.size === 0) return;
    
    const count = selectedTenantIds.size;
    
    setDeleteDialogConfig({
      type: 'tenants',
      count,
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedTenantIds).map(tenantId =>
            apiCall(`/admin/tenants/${tenantId}`, { method: 'DELETE' })
          );
          
          await Promise.all(deletePromises);
          setSelectedTenantIds(new Set());
          setError('');
          toast.success(`${count} tenant(s) deleted and backed up successfully`);
          loadData();
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to delete tenants';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    });
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteOrgs = async () => {
    if (selectedOrgIds.size === 0) return;
    
    const count = selectedOrgIds.size;
    
    setDeleteDialogConfig({
      type: 'organizations',
      count,
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedOrgIds).map(orgId =>
            apiCall(`/admin/organizations/${orgId}`, { method: 'DELETE' })
          );
          
          await Promise.all(deletePromises);
          setSelectedOrgIds(new Set());
          setError('');
          toast.success(`${count} organization(s) deleted and backed up successfully`);
          loadData();
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to delete organizations';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    });
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} user(s)? This action cannot be undone.`)) return;

    try {
      const deletePromises = Array.from(selectedUserIds).map(userId =>
        apiCall(`/admin/users/${userId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setSelectedUserIds(new Set());
      setError('');
      toast.success(`${selectedUserIds.size} user(s) deleted successfully`);
      loadData();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete users';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const toggleTenantSelection = (tenantId: string) => {
    const newSelection = new Set(selectedTenantIds);
    if (newSelection.has(tenantId)) {
      newSelection.delete(tenantId);
    } else {
      newSelection.add(tenantId);
    }
    setSelectedTenantIds(newSelection);
  };

  const toggleAllTenants = () => {
    if (selectedTenantIds.size === tenants.length) {
      setSelectedTenantIds(new Set());
    } else {
      setSelectedTenantIds(new Set(tenants.map(t => t.id)));
    }
  };

  const toggleOrgSelection = (orgId: string) => {
    const newSelection = new Set(selectedOrgIds);
    if (newSelection.has(orgId)) {
      newSelection.delete(orgId);
    } else {
      newSelection.add(orgId);
    }
    setSelectedOrgIds(newSelection);
  };

  const toggleAllOrgs = () => {
    if (selectedOrgIds.size === organizations.length) {
      setSelectedOrgIds(new Set());
    } else {
      setSelectedOrgIds(new Set(organizations.map(o => o.id)));
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      setError('');
      toast.success('User deleted successfully');
      loadData();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete user';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setError('');
      toast.success('User role updated successfully');
      loadData();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update user role';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'default';
      case 'tenant_admin': return 'secondary';
      case 'org_admin': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'master_admin': return 'Global Admin';
      case 'tenant_admin': return 'Tenant Admin';
      case 'org_admin': return 'Org Admin';
      case 'user': return 'User';
      default: return role.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage users, tenants, and system settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Restore Backups Button */}
          {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowRestoreDialog(true)}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Restore Backups</span>
            </Button>
          )}
          <Badge variant={getRoleBadgeVariant(currentUser.role)} className="text-xs md:text-sm w-fit">
            <Shield className="h-3 w-3 mr-1" />
            {getRoleDisplayName(currentUser.role).toUpperCase()}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="relative">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="pr-8">{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => setError('')}
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users in the system
            </p>
          </CardContent>
        </Card>
        
        {hasRole(currentUser, ['master_admin']) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">
                Tenant partners
              </p>
            </CardContent>
          </Card>
        )}
        
        {hasRole(currentUser, ['master_admin', 'tenant_admin']) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                Client companies
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="users" className="w-full" onValueChange={() => setError('')}>
        <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${
          1 + // Users (always)
          (hasRole(currentUser, ['master_admin']) ? 1 : 0) + // Tenants
          (hasRole(currentUser, ['master_admin', 'tenant_admin']) ? 1 : 0) + // Organizations
          (hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) ? 1 : 0) + // Cost Classification
          (hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) ? 1 : 0) + // Proposal Agent
          (hasRole(currentUser, ['master_admin']) ? 1 : 0) + // Analytics (master_admin only)
          2 // API/Webhooks + Documents (always)
        }, minmax(0, 1fr))` }}>
          <TabsTrigger value="users" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs md:text-sm">Users</span>
          </TabsTrigger>
          {hasRole(currentUser, ['master_admin']) && (
            <TabsTrigger value="tenants" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">Tenants</span>
            </TabsTrigger>
          )}
          {hasRole(currentUser, ['master_admin', 'tenant_admin']) && (
            <TabsTrigger value="organizations" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">Orgs</span>
            </TabsTrigger>
          )}
          {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
            <TabsTrigger value="costs" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">Costs</span>
            </TabsTrigger>
          )}
          {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
            <TabsTrigger value="proposal-agent" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
              <PlayCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm whitespace-nowrap">Agent</span>
            </TabsTrigger>
          )}
          {hasRole(currentUser, ['master_admin']) && (
            <TabsTrigger value="analytics" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm whitespace-nowrap">Analytics</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="integrations" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
            <Webhook className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs md:text-sm whitespace-nowrap">API / Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs md:text-sm">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* System Info - Shows current role distribution */}
          <AdminSystemInfo users={users} tenants={tenants} organizations={organizations} />
          
          {/* Role Fixer - Shows warning if any users have incorrect roles */}
          <AdminRoleFixer users={users} onRefresh={loadData} />
          
          <UserManagementTree
            currentUser={currentUser}
            tenants={tenants}
            organizations={organizations}
            users={users}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={(userId, userData) => handleUpdateUserRole(userId, userData.role)}
            selectedUserIds={selectedUserIds}
            onToggleUserSelection={toggleUserSelection}
            onToggleAllUsers={toggleAllUsers}
            onBulkDeleteUsers={handleBulkDeleteUsers}
            onRefreshData={loadData}
          />
        </TabsContent>

        {/* Tenants Tab */}
        {hasRole(currentUser, ['master_admin']) && (
          <TabsContent value="tenants" className="space-y-4">
            {isMobile ? (
              <TenantOrgMobileView
                tenants={tenants}
                organizations={organizations}
                users={users}
                onCreateTenant={async (data) => {
                  console.log('Mobile (Tenants): Creating tenant with data:', data);
                  toast.info('🚀 Starting tenant creation...', { duration: 2000 });
                  try {
                    toast.info(`📤 Sending request: ${data.name}`, { duration: 2000 });
                    const response = await apiCall('/admin/tenants', {
                      method: 'POST',
                      body: data
                    });
                    console.log('Mobile (Tenants): Tenant created successfully:', response);
                    toast.success(`✅ Tenant "${data.name}" created!`, { duration: 4000 });
                    toast.info('🔄 Reloading data...', { duration: 2000 });
                    await loadData();
                    toast.success('✅ Data refreshed!', { duration: 2000 });
                  } catch (error: any) {
                    console.error('Mobile (Tenants): Error creating tenant:', error);
                    toast.error(`❌ Error: ${error.message}`, { duration: 8000 });
                    toast.error(`🐛 Debug: ${JSON.stringify(data)}`, { duration: 8000 });
                    throw error;
                  }
                }}
                onUpdateTenant={async (id, data) => {
                  console.log('Mobile (Tenants): Updating tenant:', id, data);
                  try {
                    const response = await apiCall(`/admin/tenants/${id}`, {
                      method: 'PUT',
                      body: data
                    });
                    console.log('Mobile (Tenants): Tenant updated successfully:', response);
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Tenants): Error updating tenant:', error);
                    throw error;
                  }
                }}
                onDeleteTenant={async (id) => {
                  console.log('Mobile (Tenants): Deleting tenant:', id);
                  try {
                    await apiCall(`/admin/tenants/${id}`, {
                      method: 'DELETE'
                    });
                    console.log('Mobile (Tenants): Tenant deleted successfully');
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Tenants): Error deleting tenant:', error);
                    throw error;
                  }
                }}
                onCreateOrg={async (data) => {
                  console.log('Mobile (Tenants): Creating organization with data:', data);
                  try {
                    const response = await apiCall('/admin/organizations', {
                      method: 'POST',
                      body: data
                    });
                    console.log('Mobile (Tenants): Organization created successfully:', response);
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Tenants): Error creating organization:', error);
                    throw error;
                  }
                }}
                onUpdateOrg={async (id, data) => {
                  console.log('Mobile (Tenants): Updating organization:', id, data);
                  try {
                    const response = await apiCall(`/admin/organizations/${id}`, {
                      method: 'PUT',
                      body: data
                    });
                    console.log('Mobile (Tenants): Organization updated successfully:', response);
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Tenants): Error updating organization:', error);
                    throw error;
                  }
                }}
                onDeleteOrg={async (id) => {
                  console.log('Mobile (Tenants): Deleting organization:', id);
                  try {
                    await apiCall(`/admin/organizations/${id}`, {
                      method: 'DELETE'
                    });
                    console.log('Mobile (Tenants): Organization deleted successfully');
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Tenants): Error deleting organization:', error);
                    throw error;
                  }
                }}
                currentUserRole={currentUser.role}
                currentTenantId={currentUser.tenantId}
              />
            ) : (
              <>
                {tenants.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Getting Started:</strong> Tenants are the top-level organizations in the system. 
                      Create a tenant first, then you can create organizations within it, and finally add users to those organizations.
                    </AlertDescription>
                  </Alert>
                )}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tenant Management</CardTitle>
                        <CardDescription>Manage tenant partners who can have multiple client companies</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTenantIds.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDeleteTenants}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete {selectedTenantIds.size} Selected
                          </Button>
                        )}
                        <Dialog open={showNewTenantDialog} onOpenChange={(open) => {
                          setShowNewTenantDialog(open);
                          if (!open) {
                            setTenantAdminUserId(null);
                            setTenantAdminUserData(null);
                          }
                        }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Building2 className="h-4 w-4 mr-2" />
                        Add Tenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newTenant.name.trim()) {
                        e.preventDefault();
                        handleCreateTenant();
                      }
                    }}>
                      <DialogHeader>
                        <DialogTitle>Create New Tenant</DialogTitle>
                        <DialogDescription>Add a new tenant partner</DialogDescription>
                      </DialogHeader>
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenant-name">Name</Label>
                          <Input
                            id="tenant-name"
                            value={newTenant.name}
                            onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                            placeholder="Acme Corporation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenant-domain">Domain</Label>
                          <Input
                            id="tenant-domain"
                            value={newTenant.domain}
                            onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                            placeholder="acme.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenant-brand">Brand Name</Label>
                          <Input
                            id="tenant-brand"
                            value={newTenant.settings.brandName}
                            onChange={(e) => setNewTenant({
                              ...newTenant,
                              settings: { ...newTenant.settings, brandName: e.target.value }
                            })}
                            placeholder="Acme ValuDock"
                          />
                        </div>
                        
                        <AdminUserSelector
                          mode="tenant"
                          existingUsers={users}
                          tenantId={undefined}
                          onAdminUserSelected={setTenantAdminUserId}
                          onNewAdminUserData={setTenantAdminUserData}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewTenantDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTenant}>Create Tenant</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          {/* Individual selection only - no "Select All" for tenants */}
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Brand Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {tenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No tenants found. Create a tenant to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTenantIds.has(tenant.id)}
                              onCheckedChange={() => toggleTenantSelection(tenant.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{tenant.name}</TableCell>
                          <TableCell>{tenant.domain}</TableCell>
                          <TableCell>{tenant.settings?.brandName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={tenant.active ? 'default' : 'secondary'}>
                              {tenant.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditTenantDialog(tenant);
                                }}
                                className="hover:bg-accent cursor-pointer"
                                title="Edit tenant"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTenant(tenant.id);
                                }}
                                className="hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                                title="Delete tenant"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
                {tenants.length === 0 && (
                  <div className="px-6 pb-6">
                    <p className="text-center text-muted-foreground text-sm">
                      No tenants found. Create a tenant to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>
        )}

        {/* Organizations Tab */}
        {hasRole(currentUser, ['master_admin', 'tenant_admin']) && (
          <TabsContent value="organizations" className="space-y-4">
            {isMobile ? (
              <TenantOrgMobileView
                tenants={tenants}
                organizations={organizations}
                users={users}
                onCreateTenant={async (data) => {
                  console.log('Mobile (Orgs): Creating tenant with data:', data);
                  toast.info('🚀 Starting tenant creation...', { duration: 2000 });
                  try {
                    toast.info(`📤 Sending request: ${data.name}`, { duration: 2000 });
                    const response = await apiCall('/admin/tenants', {
                      method: 'POST',
                      body: data
                    });
                    console.log('Mobile (Orgs): Tenant created successfully:', response);
                    toast.success(`✅ Tenant "${data.name}" created!`, { duration: 4000 });
                    toast.info('🔄 Reloading data...', { duration: 2000 });
                    await loadData();
                    toast.success('✅ Data refreshed!', { duration: 2000 });
                  } catch (error: any) {
                    console.error('Mobile (Orgs): Error creating tenant:', error);
                    toast.error(`❌ Error: ${error.message}`, { duration: 8000 });
                    toast.error(`🐛 Debug: ${JSON.stringify(data)}`, { duration: 8000 });
                    throw error;
                  }
                }}
                onUpdateTenant={async (id, data) => {
                  console.log('Mobile (Orgs): Updating tenant:', id, data);
                  try {
                    const response = await apiCall(`/admin/tenants/${id}`, {
                      method: 'PUT',
                      body: data
                    });
                    console.log('Mobile (Orgs): Tenant updated successfully:', response);
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Orgs): Error updating tenant:', error);
                    throw error;
                  }
                }}
                onDeleteTenant={async (id) => {
                  console.log('Mobile (Orgs): Deleting tenant:', id);
                  try {
                    await apiCall(`/admin/tenants/${id}`, {
                      method: 'DELETE'
                    });
                    console.log('Mobile (Orgs): Tenant deleted successfully');
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Orgs): Error deleting tenant:', error);
                    throw error;
                  }
                }}
                onCreateOrg={async (data) => {
                  console.log('Mobile (Orgs): Creating organization with data:', data);
                  toast.info('🚀 Starting organization creation...', { duration: 2000 });
                  try {
                    toast.info(`📤 Sending request: ${data.name}`, { duration: 2000 });
                    const response = await apiCall('/admin/organizations', {
                      method: 'POST',
                      body: data
                    });
                    console.log('Mobile (Orgs): Organization created successfully:', response);
                    toast.success(`✅ Organization "${data.name}" created!`, { duration: 4000 });
                    toast.info('🔄 Reloading data...', { duration: 2000 });
                    await loadData();
                    toast.success('✅ Data refreshed!', { duration: 2000 });
                  } catch (error: any) {
                    console.error('Mobile (Orgs): Error creating organization:', error);
                    toast.error(`❌ Error: ${error.message}`, { duration: 8000 });
                    toast.error(`🐛 Debug: ${JSON.stringify(data)}`, { duration: 8000 });
                    throw error;
                  }
                }}
                onUpdateOrg={async (id, data) => {
                  console.log('Mobile (Orgs): Updating organization:', id, data);
                  try {
                    const response = await apiCall(`/admin/organizations/${id}`, {
                      method: 'PUT',
                      body: data
                    });
                    console.log('Mobile (Orgs): Organization updated successfully:', response);
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Orgs): Error updating organization:', error);
                    throw error;
                  }
                }}
                onDeleteOrg={async (id) => {
                  console.log('Mobile (Orgs): Deleting organization:', id);
                  try {
                    await apiCall(`/admin/organizations/${id}`, {
                      method: 'DELETE'
                    });
                    console.log('Mobile (Orgs): Organization deleted successfully');
                    await loadData();
                  } catch (error) {
                    console.error('Mobile (Orgs): Error deleting organization:', error);
                    throw error;
                  }
                }}
                currentUserRole={currentUser.role}
                currentTenantId={currentUser.tenantId}
              />
            ) : (
              <>
                {hasRole(currentUser, ['master_admin']) && tenants.length === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must create at least one tenant before creating organizations (client companies). Go to the Tenants tab to create one.
                    </AlertDescription>
                  </Alert>
                )}
                {organizations.length === 0 && tenants.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Next Step:</strong> Organizations are the client companies managed by your tenants. 
                      Create an organization to start managing client users.
                    </AlertDescription>
                  </Alert>
                )}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Organization Management</CardTitle>
                        <CardDescription>Manage client companies under tenants</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedOrgIds.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDeleteOrgs}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete {selectedOrgIds.size} Selected
                          </Button>
                        )}
                        <Dialog open={showNewOrgDialog} onOpenChange={(open) => {
                          setShowNewOrgDialog(open);
                          if (!open) {
                            setOrgAdminUserId(null);
                            setOrgAdminUserData(null);
                          }
                        }}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={hasRole(currentUser, ['master_admin']) && tenants.length === 0}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Organization (Company)</DialogTitle>
                        <DialogDescription>Add a new company/organization to manage under a tenant</DialogDescription>
                      </DialogHeader>
                      {hasRole(currentUser, ['master_admin']) && tenants.length === 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You must create at least one tenant before creating organizations (client companies). Go to the Tenants tab to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="org-name">Short Name *</Label>
                          <Input
                            id="org-name"
                            value={newOrg.name}
                            onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                            placeholder="acme-corp"
                          />
                          <p className="text-xs text-muted-foreground">
                            Short identifier for the organization
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="org-company-name">Company Name *</Label>
                          <Input
                            id="org-company-name"
                            value={newOrg.companyName}
                            onChange={(e) => setNewOrg({ ...newOrg, companyName: e.target.value })}
                            placeholder="Acme Corporation"
                          />
                          <p className="text-xs text-muted-foreground">
                            Full legal company name
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="org-domain">Domain *</Label>
                          <Input
                            id="org-domain"
                            value={newOrg.domain}
                            onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                            placeholder="acme.com"
                          />
                          <p className="text-xs text-muted-foreground">
                            Company domain name (e.g., company.com)
                          </p>
                        </div>
                        {hasRole(currentUser, ['master_admin']) && (
                          <div className="space-y-2">
                            <Label htmlFor="org-tenant">Tenant *</Label>
                            <Select value={newOrg.tenantId} onValueChange={(value) => setNewOrg({ ...newOrg, tenantId: value })}>
                              <SelectTrigger id="org-tenant">
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                {tenants.map((tenant) => (
                                  <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {tenants.length === 0 && (
                              <p className="text-sm text-destructive">
                                No tenants available. Please create a tenant first.
                              </p>
                            )}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="org-description">Description</Label>
                          <Input
                            id="org-description"
                            value={newOrg.description}
                            onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                            placeholder="Additional notes about this organization"
                          />
                        </div>
                        
                        <AdminUserSelector
                          mode="organization"
                          existingUsers={users}
                          tenantId={newOrg.tenantId}
                          onAdminUserSelected={setOrgAdminUserId}
                          onNewAdminUserData={setOrgAdminUserData}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewOrgDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateOrganization}
                          disabled={hasRole(currentUser, ['master_admin']) && tenants.length === 0}
                        >
                          Create Organization
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => {
                    const tenantOrgs = organizations.filter(org => org.tenantId === tenant.id);
                    const isExpanded = expandedTenantId === tenant.id;
                    
                    return (
                      <Card key={tenant.id}>
                        <div
                          className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between border-b"
                          onClick={() => setExpandedTenantId(isExpanded ? null : tenant.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{tenant.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {tenantOrgs.length} {tenantOrgs.length === 1 ? 'organization' : 'organizations'}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {isExpanded ? 'Expanded' : 'Collapsed'}
                          </Badge>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4">
                            {tenantOrgs.length === 0 ? (
                              <div className="text-center text-muted-foreground py-8">
                                No organizations in this tenant yet.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">
                                        {/* Individual selection */}
                                      </TableHead>
                                      <TableHead>Company Name</TableHead>
                                      <TableHead>Domain</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tenantOrgs.map((org) => (
                                      <TableRow key={org.id}>
                                        <TableCell>
                                          <Checkbox
                                            checked={selectedOrgIds.has(org.id)}
                                            onCheckedChange={() => toggleOrgSelection(org.id)}
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{org.companyName || org.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{org.domain || '-'}</TableCell>
                                        <TableCell className="text-sm">{org.description || '-'}</TableCell>
                                        <TableCell>
                                          <Badge variant={org.active ? 'default' : 'secondary'}>
                                            {org.active ? 'Active' : 'Inactive'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => openEditOrgDialog(org)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteOrganization(org.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                  
                  {organizations.length === 0 && tenants.length > 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No organizations found. Create one to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>
        )}

        {/* Cost Classification Tab */}
        {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
          <TabsContent value="costs" className="space-y-4">
            {/* Effort Anchors Configuration */}
            <EffortAnchorsAdmin
              currentUser={currentUser}
              globalDefaults={globalDefaults || {}}
              onSave={async (anchors) => {
                if (!onSaveGlobalDefaults) {
                  throw new Error('Save function not available');
                }
                
                // Merge the new anchors with existing global defaults
                const updatedDefaults = {
                  ...globalDefaults,
                  effortAnchors: anchors
                };
                
                await onSaveGlobalDefaults(updatedDefaults);
              }}
            />
            
            {/* Cost Classification */}
            <CostClassificationTreeView
              currentUser={currentUser}
              tenants={tenants}
              organizations={organizations}
            />
          </TabsContent>
        )}

        {/* Proposal Agent Tab */}
        {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
          <TabsContent value="proposal-agent" className="space-y-4">
            <ProposalAgentRunner 
              currentUser={currentUser}
              organizations={organizations}
              selectedContextOrgId={selectedContextOrgId}
            />
          </TabsContent>
        )}

        {/* API / Webhooks Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Alert>
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              <strong>API & Webhook Integration:</strong> Configure external services and API connections for AI-powered features.
              All integrations support the Proposal Agent and meeting analysis capabilities.
            </AlertDescription>
          </Alert>

          {/* Backend Connection Verifier */}
          <BackendConnectionVerifier />

          {/* Proposal Agent Connections */}
          <div className="border-t pt-6">
            <ProposalAgentConnections />
          </div>

          {/* Fathom Webhook Configuration */}
          {hasRole(currentUser, ['master_admin', 'tenant_admin', 'org_admin']) && (
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Fathom Webhook Configuration
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Configure Fathom to automatically send meeting transcripts to ValuDock for AI analysis
                </p>
              </div>
              <FathomWebhookAdmin />
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab (global admin only) */}
        {hasRole(currentUser, ['master_admin']) && (
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard userRole={currentUser.role} />
          </TabsContent>
        )}

        {/* Documents Tab (includes Dictionary and Organization Documents) */}
        <TabsContent value="documents" className="space-y-4">
          <OrganizationDocuments userProfile={currentUser} />
          <DocumentationViewer />
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <Dialog open={showEditOrgDialog} onOpenChange={setShowEditOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details</DialogDescription>
          </DialogHeader>
          {selectedOrganization && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-org-name">Short Name *</Label>
                <Input
                  id="edit-org-name"
                  value={selectedOrganization.name}
                  onChange={(e) => setSelectedOrganization({ 
                    ...selectedOrganization, 
                    name: e.target.value 
                  })}
                  placeholder="acme-corp"
                />
                <p className="text-xs text-muted-foreground">
                  Short identifier for the organization
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org-company-name">Company Name *</Label>
                <Input
                  id="edit-org-company-name"
                  value={selectedOrganization.companyName || selectedOrganization.name}
                  onChange={(e) => setSelectedOrganization({ 
                    ...selectedOrganization, 
                    companyName: e.target.value 
                  })}
                  placeholder="Acme Corporation"
                />
                <p className="text-xs text-muted-foreground">
                  Full legal company name
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org-domain">Domain *</Label>
                <Input
                  id="edit-org-domain"
                  value={selectedOrganization.domain || ''}
                  onChange={(e) => setSelectedOrganization({ 
                    ...selectedOrganization, 
                    domain: e.target.value 
                  })}
                  placeholder="acme.com"
                />
                <p className="text-xs text-muted-foreground">
                  Company domain name (e.g., company.com)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org-tenant">Tenant</Label>
                <Input
                  id="edit-org-tenant"
                  value={tenants.find(t => t.id === selectedOrganization.tenantId)?.name || selectedOrganization.tenantId}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Organization tenant cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org-description">Description</Label>
                <Input
                  id="edit-org-description"
                  value={selectedOrganization.description || ''}
                  onChange={(e) => setSelectedOrganization({ 
                    ...selectedOrganization, 
                    description: e.target.value 
                  })}
                  placeholder="Organization description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditOrgDialog(false);
              setSelectedOrganization(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={showEditTenantDialog} onOpenChange={setShowEditTenantDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>Update tenant details and branding</DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 py-4">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-tenant-name">Tenant Name *</Label>
                  <Input
                    id="edit-tenant-name"
                    value={selectedTenant.name}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      name: e.target.value 
                    })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tenant-domain">Domain *</Label>
                  <Input
                    id="edit-tenant-domain"
                    value={selectedTenant.domain}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      domain: e.target.value 
                    })}
                    placeholder="acme.com"
                  />
                </div>
              </div>

              {/* Branding Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">Branding & White-Label Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-tenant-brand">Brand Name</Label>
                  <Input
                    id="edit-tenant-brand"
                    value={selectedTenant.settings?.brandName || ''}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      settings: { ...selectedTenant.settings, brandName: e.target.value }
                    })}
                    placeholder="Your Company ValuDock"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tenant-primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-tenant-primary"
                        type="color"
                        value={selectedTenant.settings?.primaryColor || '#0ea5e9'}
                        onChange={(e) => setSelectedTenant({ 
                          ...selectedTenant, 
                          settings: { ...selectedTenant.settings, primaryColor: e.target.value }
                        })}
                        className="w-20"
                      />
                      <Input
                        value={selectedTenant.settings?.primaryColor || '#0ea5e9'}
                        onChange={(e) => setSelectedTenant({ 
                          ...selectedTenant, 
                          settings: { ...selectedTenant.settings, primaryColor: e.target.value }
                        })}
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tenant-secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-tenant-secondary"
                        type="color"
                        value={selectedTenant.settings?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => setSelectedTenant({ 
                          ...selectedTenant, 
                          settings: { ...selectedTenant.settings, secondaryColor: e.target.value }
                        })}
                        className="w-20"
                      />
                      <Input
                        value={selectedTenant.settings?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => setSelectedTenant({ 
                          ...selectedTenant, 
                          settings: { ...selectedTenant.settings, secondaryColor: e.target.value }
                        })}
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tenant-logo">Logo URL</Label>
                  <Input
                    id="edit-tenant-logo"
                    value={selectedTenant.settings?.logoUrl || ''}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      settings: { ...selectedTenant.settings, logoUrl: e.target.value }
                    })}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL to your company logo (PNG or SVG recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tenant-favicon">Favicon URL</Label>
                  <Input
                    id="edit-tenant-favicon"
                    value={selectedTenant.settings?.faviconUrl || ''}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      settings: { ...selectedTenant.settings, faviconUrl: e.target.value }
                    })}
                    placeholder="https://example.com/favicon.ico"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL to your favicon (ICO or PNG format)
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditTenantDialog(false);
              setSelectedTenant(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTenant}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteDialogConfig && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={deleteDialogConfig.onConfirm}
          entityType={deleteDialogConfig.type}
          entityName={deleteDialogConfig.entityName}
          count={deleteDialogConfig.count}
        />
      )}

      {/* Restore Backup Dialog */}
      <RestoreBackupDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onRestoreSuccess={loadData}
      />
    </div>
  );
}