/**
 * EnhancedUserDialog - Advanced user creation with hierarchical org selection and group management
 * 
 * Features:
 * - Hierarchical tenant > organization selection
 * - Inline tenant/org creation
 * - Multi-select group assignment
 * - Create new groups on-the-fly
 * - Groups sync with InputData for process filtering
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, Building2, Users, Plus, X } from 'lucide-react';
import { UserProfile, apiCall } from '../utils/auth';
import { toast } from 'sonner@2.0.3';
import { isValidDomain } from '../utils/domainValidation';

interface EnhancedUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserProfile;
  tenants: any[];
  organizations: any[];
  onSuccess: () => void;
}

interface NewGroup {
  id: string;
  name: string;
  description?: string;
  averageHourlyWage?: number;
  annualSalary?: number;
}

export function EnhancedUserDialog({
  open,
  onOpenChange,
  currentUser,
  tenants,
  organizations,
  onSuccess
}: EnhancedUserDialogProps) {
  // User form state
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'user' | 'org_admin' | 'tenant_admin' | 'master_admin',
    tenantId: currentUser.tenantId || '',
    organizationId: ''
  });

  // Admin assignment mode: 'none' | 'tenant_admin' | 'org_admin' | 'global_admin'
  const [adminMode, setAdminMode] = useState<'none' | 'tenant_admin' | 'org_admin' | 'global_admin'>('none');
  const [adminTenantMode, setAdminTenantMode] = useState<'existing' | 'new'>('existing');
  const [adminOrgMode, setAdminOrgMode] = useState<'existing' | 'new'>('existing');

  // Creation mode: 'select' | 'new-tenant' | 'new-org'
  const [creationMode, setCreationMode] = useState<'select' | 'new-tenant' | 'new-org'>('select');

  // Sync admin mode with role
  useEffect(() => {
    if (adminMode === 'tenant_admin') {
      setUserData(prev => ({ ...prev, role: 'tenant_admin' }));
    } else if (adminMode === 'org_admin') {
      setUserData(prev => ({ ...prev, role: 'org_admin' }));
    } else if (adminMode === 'global_admin') {
      setUserData(prev => ({ ...prev, role: 'master_admin' }));
    } else {
      setUserData(prev => ({ ...prev, role: 'user' }));
    }
  }, [adminMode]);

  // New tenant/org data for inline creation
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    settings: {
      brandName: '',
      primaryColor: '#0ea5e9',
      logoUrl: ''
    }
  });

  const [newOrg, setNewOrg] = useState({
    name: '',
    companyName: '',
    domain: '',
    description: ''
  });

  // Group management state
  const [availableGroups, setAvailableGroups] = useState<NewGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    id: '',
    name: '',
    description: '',
    averageHourlyWage: undefined,
    annualSalary: undefined
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtered organizations based on selected tenant
  const filteredOrganizations = userData.tenantId
    ? organizations.filter(org => org.tenantId === userData.tenantId)
    : organizations;

  // Load groups when organization is selected
  useEffect(() => {
    if (userData.organizationId && creationMode === 'select') {
      loadGroups(userData.organizationId);
    } else {
      setAvailableGroups([]);
    }
  }, [userData.organizationId, creationMode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const loadGroups = async (organizationId: string) => {
    try {
      const response = await apiCall(`/groups/${organizationId}`);
      setAvailableGroups(response.groups || []);
    } catch (err: any) {
      console.error('Failed to load groups:', err);
      // Don't show error - groups may not exist yet
      setAvailableGroups([]);
    }
  };

  const resetForm = () => {
    setUserData({
      email: '',
      password: '',
      name: '',
      role: 'user',
      tenantId: currentUser.tenantId || '',
      organizationId: ''
    });
    setAdminMode('none');
    setAdminTenantMode('existing');
    setAdminOrgMode('existing');
    setCreationMode('select');
    setNewTenant({
      name: '',
      domain: '',
      settings: { brandName: '', primaryColor: '#0ea5e9', logoUrl: '' }
    });
    setNewOrg({
      name: '',
      companyName: '',
      domain: '',
      description: ''
    });
    setSelectedGroupIds(new Set());
    setAvailableGroups([]);
    setShowNewGroupForm(false);
    setNewGroup({
      id: '',
      name: '',
      description: '',
      averageHourlyWage: undefined,
      annualSalary: undefined
    });
    setError('');
  };

  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      setError('Group name is required');
      return;
    }

    const group: NewGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description,
      averageHourlyWage: newGroup.averageHourlyWage,
      annualSalary: newGroup.annualSalary
    };

    setAvailableGroups([...availableGroups, group]);
    setSelectedGroupIds(new Set([...selectedGroupIds, group.id]));
    setShowNewGroupForm(false);
    setNewGroup({
      id: '',
      name: '',
      description: '',
      averageHourlyWage: undefined,
      annualSalary: undefined
    });
    toast.success(`Group "${group.name}" created`);
  };

  const toggleGroupSelection = (groupId: string) => {
    const newSelection = new Set(selectedGroupIds);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroupIds(newSelection);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate basic fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Please fill in all required fields');
      }

      let finalTenantId = userData.tenantId;
      let finalOrgId = userData.organizationId;

      // Handle tenant creation if needed
      if (creationMode === 'new-tenant') {
        if (!newTenant.name || !newTenant.domain) {
          throw new Error('Tenant name and domain are required');
        }
        if (!isValidDomain(newTenant.domain)) {
          throw new Error('Please enter a valid domain name (e.g., example.com)');
        }

        toast.info('Creating new tenant...');
        const tenantResponse = await apiCall('/admin/tenants', {
          method: 'POST',
          body: newTenant
        });
        finalTenantId = tenantResponse.tenant.id;
        toast.success(`Tenant "${newTenant.name}" created`);

        // Create org within new tenant
        if (!newOrg.name || !newOrg.companyName || !newOrg.domain) {
          throw new Error('Organization name, company name, and domain are required');
        }
        if (!isValidDomain(newOrg.domain)) {
          throw new Error('Please enter a valid organization domain (e.g., company.com)');
        }

        toast.info('Creating new organization...');
        const orgResponse = await apiCall('/admin/organizations', {
          method: 'POST',
          body: { ...newOrg, tenantId: finalTenantId }
        });
        finalOrgId = orgResponse.organization.id;
        toast.success(`Organization "${newOrg.name}" created`);
      } 
      // Handle org creation within existing tenant
      else if (creationMode === 'new-org') {
        if (!newOrg.name || !newOrg.companyName || !newOrg.domain) {
          throw new Error('Organization name, company name, and domain are required');
        }
        if (!isValidDomain(newOrg.domain)) {
          throw new Error('Please enter a valid organization domain (e.g., company.com)');
        }

        toast.info('Creating new organization...');
        const orgResponse = await apiCall('/admin/organizations', {
          method: 'POST',
          body: { ...newOrg, tenantId: finalTenantId }
        });
        finalOrgId = orgResponse.organization.id;
        toast.success(`Organization "${newOrg.name}" created`);
      }

      // Save groups if any exist (new or selected)
      if (availableGroups.length > 0 && finalOrgId) {
        toast.info('Saving groups...');
        await apiCall(`/groups/${finalOrgId}`, {
          method: 'POST',
          body: { groups: availableGroups }
        });
        toast.success('Groups saved to organization');
      }

      // Create user with group assignments
      const userPayload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        tenantId: finalTenantId,
        organizationId: finalOrgId || null,
        groupIds: Array.from(selectedGroupIds)
      };

      toast.info('Creating user...');
      await apiCall('/auth/signup', {
        method: 'POST',
        body: userPayload
      });

      toast.success(`User "${userData.email}" created successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create user';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user with tenant, organization, and group assignments
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* User Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select value={userData.role} onValueChange={(value: any) => setUserData({ ...userData, role: value })}>
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="org_admin">Organization Admin</SelectItem>
                    {currentUser.role === 'master_admin' && (
                      <>
                        <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                        <SelectItem value="master_admin">Global Admin</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Organization Selection Mode */}
          <div className="space-y-4">
            <h3 className="font-medium">Organization Assignment</h3>
            
            <Tabs value={creationMode} onValueChange={(v: any) => setCreationMode(v)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="select">
                  <Users className="h-4 w-4 mr-2" />
                  Select Existing
                </TabsTrigger>
                <TabsTrigger value="new-org">
                  <Building2 className="h-4 w-4 mr-2" />
                  New Org
                </TabsTrigger>
                {currentUser.role === 'master_admin' && (
                  <TabsTrigger value="new-tenant">
                    <Plus className="h-4 w-4 mr-2" />
                    New Tenant + Org
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Select Existing */}
              <TabsContent value="select" className="space-y-4">
                {currentUser.role === 'master_admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="select-tenant">Tenant *</Label>
                    <Select
                      value={userData.tenantId}
                      onValueChange={(value) => setUserData({ ...userData, tenantId: value, organizationId: '' })}
                    >
                      <SelectTrigger id="select-tenant">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name} ({tenant.domain})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="select-org">Organization {userData.role !== 'tenant_admin' && '*'}</Label>
                  <Select
                    value={userData.organizationId}
                    onValueChange={(value) => setUserData({ ...userData, organizationId: value })}
                    disabled={!userData.tenantId || filteredOrganizations.length === 0}
                  >
                    <SelectTrigger id="select-org">
                      <SelectValue placeholder={
                        !userData.tenantId 
                          ? "Select a tenant first" 
                          : filteredOrganizations.length === 0
                          ? "No organizations available"
                          : "Select an organization"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredOrganizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.domain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Create New Organization within existing tenant */}
              <TabsContent value="new-org" className="space-y-4">
                {currentUser.role === 'master_admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="neworg-tenant">Select Tenant for New Organization *</Label>
                    <Select
                      value={userData.tenantId}
                      onValueChange={(value) => setUserData({ ...userData, tenantId: value })}
                    >
                      <SelectTrigger id="neworg-tenant">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="neworg-name">Organization Name *</Label>
                  <Input
                    id="neworg-name"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    placeholder="Acme Corp Division"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neworg-company">Company Name *</Label>
                  <Input
                    id="neworg-company"
                    value={newOrg.companyName}
                    onChange={(e) => setNewOrg({ ...newOrg, companyName: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neworg-domain">Domain *</Label>
                  <Input
                    id="neworg-domain"
                    value={newOrg.domain}
                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                    placeholder="acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neworg-desc">Description (Optional)</Label>
                  <Input
                    id="neworg-desc"
                    value={newOrg.description}
                    onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
              </TabsContent>

              {/* Create New Tenant + Organization */}
              {currentUser.role === 'master_admin' && (
                <TabsContent value="new-tenant" className="space-y-4">
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">New Tenant Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-name">Tenant Name *</Label>
                      <Input
                        id="newtenant-name"
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                        placeholder="Acme Reseller LLC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-domain">Tenant Domain *</Label>
                      <Input
                        id="newtenant-domain"
                        value={newTenant.domain}
                        onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                        placeholder="acmereseller.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-brand">Brand Name (Optional)</Label>
                      <Input
                        id="newtenant-brand"
                        value={newTenant.settings.brandName}
                        onChange={(e) => setNewTenant({
                          ...newTenant,
                          settings: { ...newTenant.settings, brandName: e.target.value }
                        })}
                        placeholder="Acme ValueDock®"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">First Organization in Tenant</h4>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-org-name">Organization Name *</Label>
                      <Input
                        id="newtenant-org-name"
                        value={newOrg.name}
                        onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-org-company">Company Name *</Label>
                      <Input
                        id="newtenant-org-company"
                        value={newOrg.companyName}
                        onChange={(e) => setNewOrg({ ...newOrg, companyName: e.target.value })}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newtenant-org-domain">Organization Domain *</Label>
                      <Input
                        id="newtenant-org-domain"
                        value={newOrg.domain}
                        onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                        placeholder="acme.com"
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <Separator />

          {/* Group Assignment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Group Assignment (Optional)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewGroupForm(!showNewGroupForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showNewGroupForm ? 'Cancel' : 'New Group'}
              </Button>
            </div>

            {showNewGroupForm && (
              <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <h4 className="font-medium text-sm">Create New Group</h4>
                <div className="space-y-2">
                  <Label htmlFor="newgroup-name">Group Name *</Label>
                  <Input
                    id="newgroup-name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Finance Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newgroup-desc">Description (Optional)</Label>
                  <Input
                    id="newgroup-desc"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Finance department processes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newgroup-wage">Avg Hourly Wage (Optional)</Label>
                    <Input
                      id="newgroup-wage"
                      type="number"
                      value={newGroup.averageHourlyWage || ''}
                      onChange={(e) => setNewGroup({ 
                        ...newGroup, 
                        averageHourlyWage: parseFloat(e.target.value) || undefined 
                      })}
                      placeholder="45.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newgroup-salary">Annual Salary (Optional)</Label>
                    <Input
                      id="newgroup-salary"
                      type="number"
                      value={newGroup.annualSalary || ''}
                      onChange={(e) => setNewGroup({ 
                        ...newGroup, 
                        annualSalary: parseFloat(e.target.value) || undefined 
                      })}
                      placeholder="85000"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddGroup}
                  className="w-full"
                  variant="secondary"
                >
                  Add Group
                </Button>
              </div>
            )}

            {availableGroups.length > 0 && (
              <div className="space-y-2">
                <Label>Select Groups (user can only see processes in assigned groups)</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {availableGroups.map(group => (
                    <div key={group.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedGroupIds.has(group.id)}
                          onCheckedChange={() => toggleGroupSelection(group.id)}
                        />
                        <div>
                          <p className="font-medium text-sm">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-muted-foreground">{group.description}</p>
                          )}
                        </div>
                      </div>
                      {selectedGroupIds.has(group.id) && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {selectedGroupIds.size > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedGroupIds.size} group{selectedGroupIds.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {creationMode === 'select' && !userData.organizationId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select an organization to assign groups
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
