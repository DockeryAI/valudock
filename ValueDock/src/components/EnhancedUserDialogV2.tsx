/**
 * EnhancedUserDialogV2 - Advanced user creation with admin rights assignment
 * 
 * Features:
 * - Intuitive admin rights assignment workflow
 * - Create admins for existing OR new tenants/organizations
 * - Auto-role assignment based on admin type
 * - Hierarchical tenant > organization selection
 * - Multi-select group assignment
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
import { AlertCircle, Building2, Users, Plus, X, Shield, Globe } from 'lucide-react';
import { UserProfile, apiCall } from '../utils/auth';
import { toast } from 'sonner@2.0.3';
import { isValidDomain } from '../utils/domainValidation';

interface EnhancedUserDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserProfile;
  tenants: any[];
  organizations: any[];
  onSuccess: () => void;
  preselectedTenantId?: string;
  preselectedOrgId?: string;
}

interface NewGroup {
  id: string;
  name: string;
  description?: string;
  averageHourlyWage?: number;
  annualSalary?: number;
}

export function EnhancedUserDialogV2({
  open,
  onOpenChange,
  currentUser,
  tenants,
  organizations,
  onSuccess,
  preselectedTenantId,
  preselectedOrgId
}: EnhancedUserDialogV2Props) {
  // User basic info
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'user' | 'org_admin' | 'tenant_admin' | 'master_admin',
    tenantId: currentUser.tenantId || '',
    organizationId: '',
    readOnly: false
  });

  // Email autocomplete state
  const [emailSuggestion, setEmailSuggestion] = useState('');

  // Admin assignment mode
  const [adminMode, setAdminMode] = useState<'none' | 'tenant_admin' | 'org_admin' | 'global_admin'>('none');
  const [adminTargetMode, setAdminTargetMode] = useState<'existing' | 'new'>('existing');

  // New tenant/org data
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

  // Group management
  const [availableGroups, setAvailableGroups] = useState<NewGroup[]>([]);
  const [initialGroupIds, setInitialGroupIds] = useState<Set<string>>(new Set()); // Track which groups existed before
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

  // Filtered organizations
  const filteredOrganizations = userData.tenantId
    ? organizations.filter(org => org.tenantId === userData.tenantId)
    : organizations;

  // Sync role with admin mode
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

  // Load groups when organization is selected
  useEffect(() => {
    if (userData.organizationId && adminMode === 'none') {
      console.log('[EnhancedUserDialogV2] Loading groups for organization:', userData.organizationId);
      loadGroups(userData.organizationId);
    } else {
      setAvailableGroups([]);
      setInitialGroupIds(new Set());
    }
  }, [userData.organizationId, adminMode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Set preselected values when dialog opens
  useEffect(() => {
    if (open && (preselectedTenantId || preselectedOrgId)) {
      setUserData(prev => ({
        ...prev,
        tenantId: preselectedTenantId || prev.tenantId,
        organizationId: preselectedOrgId || prev.organizationId
      }));
    }
  }, [open, preselectedTenantId, preselectedOrgId]);

  const loadGroups = async (organizationId: string) => {
    try {
      const response = await apiCall(`/groups/${organizationId}`);
      const existingGroups = response.groups || [];
      setAvailableGroups(existingGroups);
      // Track which groups existed before user started creating new ones
      setInitialGroupIds(new Set(existingGroups.map((g: any) => g.id)));
      console.log('[EnhancedUserDialogV2] Loaded existing groups:', existingGroups.map((g: any) => g.id));
    } catch (err: any) {
      console.error('Failed to load groups:', err);
      setAvailableGroups([]);
      setInitialGroupIds(new Set());
    }
  };

  // Handle email input with autocomplete
  const handleEmailChange = (value: string) => {
    setUserData({ ...userData, email: value });
    
    // Check if user just typed @
    if (value.includes('@') && !value.endsWith('@')) {
      // Clear suggestion if user has typed past the @
      setEmailSuggestion('');
    } else if (value.endsWith('@')) {
      // User just typed @, show domain suggestion
      const org = organizations.find(o => o.id === userData.organizationId);
      if (org && org.domain) {
        setEmailSuggestion(value + org.domain);
      }
    } else {
      setEmailSuggestion('');
    }
  };

  // Handle keyboard events for autocomplete
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && emailSuggestion && emailSuggestion !== userData.email) {
      e.preventDefault();
      setUserData({ ...userData, email: emailSuggestion });
      setEmailSuggestion('');
    } else if (e.key === 'Escape') {
      setEmailSuggestion('');
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
    setAdminTargetMode('existing');
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
    setInitialGroupIds(new Set());
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
    console.log('[EnhancedUserDialogV2] 🟢 Add Group button clicked!');
    console.log('[EnhancedUserDialogV2] Current newGroup state:', JSON.stringify(newGroup, null, 2));
    console.log('[EnhancedUserDialogV2] Current availableGroups:', JSON.stringify(availableGroups, null, 2));
    
    if (!newGroup.name.trim()) {
      console.log('[EnhancedUserDialogV2] ❌ Validation FAILED - name is empty');
      setError('Group name is required');
      return;
    }
    
    console.log('[EnhancedUserDialogV2] ✅ Validation PASSED - creating group...');

    const group: NewGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description,
      averageHourlyWage: newGroup.averageHourlyWage,
      annualSalary: newGroup.annualSalary
    };

    console.log('[EnhancedUserDialogV2] ✅ Group object created:', JSON.stringify(group, null, 2));
    const updatedGroups = [...availableGroups, group];
    console.log('[EnhancedUserDialogV2] ✅ Updated groups array:', JSON.stringify(updatedGroups, null, 2));
    
    setAvailableGroups(updatedGroups);
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

      // Handle tenant admin assignment
      if (adminMode === 'tenant_admin') {
        if (adminTargetMode === 'new') {
          // Create new tenant
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
        } else {
          // Use existing tenant
          if (!userData.tenantId) {
            throw new Error('Please select a tenant');
          }
        }
        // Tenant admin doesn't need an organization
        finalOrgId = null;
      }

      // Handle organization admin assignment
      else if (adminMode === 'org_admin') {
        if (adminTargetMode === 'new') {
          // Create new organization
          if (!newOrg.name || !newOrg.companyName || !newOrg.domain) {
            throw new Error('Organization name, company name, and domain are required');
          }
          if (!isValidDomain(newOrg.domain)) {
            throw new Error('Please enter a valid organization domain');
          }
          
          // Determine which tenant to use
          let tenantIdForOrg = userData.tenantId;
          
          // If user is not master_admin, use their own tenantId
          if (currentUser.role !== 'master_admin') {
            tenantIdForOrg = currentUser.tenantId;
          }
          
          if (!tenantIdForOrg) {
            throw new Error('Please select a tenant for the new organization');
          }

          toast.info('Creating new organization...');
          const orgResponse = await apiCall('/admin/organizations', {
            method: 'POST',
            body: { ...newOrg, tenantId: tenantIdForOrg }
          });
          finalOrgId = orgResponse.organization.id;
          finalTenantId = tenantIdForOrg;
          toast.success(`Organization "${newOrg.name}" created`);
        } else {
          // Use existing organization
          if (!userData.organizationId) {
            throw new Error('Please select an organization');
          }
          // Get the tenant ID from the selected organization
          const selectedOrg = organizations.find(o => o.id === userData.organizationId);
          if (selectedOrg) {
            finalTenantId = selectedOrg.tenantId;
          }
        }
      }

      // Handle global admin
      else if (adminMode === 'global_admin') {
        finalTenantId = null;
        finalOrgId = null;
      }

      // Handle regular user
      else {
        if (!userData.tenantId && currentUser.role === 'master_admin') {
          throw new Error('Please select a tenant');
        }
        if (!userData.organizationId) {
          throw new Error('Please select an organization');
        }
        
        // Get tenant and org IDs from selected organization
        const selectedOrg = organizations.find(o => o.id === userData.organizationId);
        if (selectedOrg) {
          finalTenantId = selectedOrg.tenantId;
          finalOrgId = selectedOrg.id;
        } else {
          // Fallback to userData values
          finalTenantId = userData.tenantId || currentUser.tenantId;
          finalOrgId = userData.organizationId;
        }
      }

      // AUTO-SAVE: If the new group form is filled but not yet added, auto-add it now
      if (showNewGroupForm && newGroup.name.trim()) {
        console.log('[EnhancedUserDialogV2] 🔶 AUTO-SAVE: New group form is filled but not added yet');
        console.log('[EnhancedUserDialogV2] 🔶 AUTO-SAVE: Auto-adding group:', newGroup.name);
        
        const autoGroup: NewGroup = {
          id: `group-${Date.now()}`,
          name: newGroup.name,
          description: newGroup.description,
          averageHourlyWage: newGroup.averageHourlyWage,
          annualSalary: newGroup.annualSalary
        };
        
        // Add to availableGroups and select it
        availableGroups.push(autoGroup);
        selectedGroupIds.add(autoGroup.id);
        
        console.log('[EnhancedUserDialogV2] 🔶 AUTO-SAVE: Group auto-added:', autoGroup);
        toast.info(`Auto-saved group "${autoGroup.name}"`);
      }
      
      // Save NEW groups to organization data if any new ones were created
      // New groups are those NOT in the initial set (i.e., created during this dialog session)
      const newGroups = availableGroups.filter(g => !initialGroupIds.has(g.id));
      console.log('[EnhancedUserDialogV2] Initial group IDs:', Array.from(initialGroupIds));
      console.log('[EnhancedUserDialogV2] All available groups:', availableGroups.map(g => ({id: g.id, name: g.name})));
      console.log('[EnhancedUserDialogV2] New groups to save:', newGroups.map(g => ({id: g.id, name: g.name})));
      console.log('[EnhancedUserDialogV2] Final org ID:', finalOrgId);
      
      if (newGroups.length > 0 && finalOrgId) {
        toast.info(`Saving ${newGroups.length} new group(s) to organization...`);
        try {
          // Load existing organization data
          console.log('[EnhancedUserDialogV2] Loading org data for:', finalOrgId);
          const loadResponse = await apiCall(`/data/load?organizationId=${finalOrgId}`);
          console.log('[EnhancedUserDialogV2] Load response:', loadResponse);
          const existingData = loadResponse.data || { groups: [], processes: [], globalDefaults: {} };
          console.log('[EnhancedUserDialogV2] Existing groups:', existingData.groups);
          
          // Merge new groups with existing groups (avoid duplicates by name)
          const existingGroupNames = new Set(existingData.groups?.map((g: any) => g.name) || []);
          const groupsToAdd = newGroups.filter(g => !existingGroupNames.has(g.name));
          console.log('[EnhancedUserDialogV2] Groups to add after dedup:', groupsToAdd);
          
          if (groupsToAdd.length > 0) {
            const updatedData = {
              ...existingData,
              groups: [...(existingData.groups || []), ...groupsToAdd],
              _meta: {
                organizationId: finalOrgId,
                savedAt: new Date().toISOString()
              }
            };
            
            console.log('[EnhancedUserDialogV2] Saving updated data:', {
              totalGroups: updatedData.groups.length,
              newGroups: groupsToAdd.length,
              groups: updatedData.groups
            });
            
            // Save back to organization data
            const saveResponse = await apiCall('/data/save', {
              method: 'POST',
              body: updatedData
            });
            console.log('[EnhancedUserDialogV2] Save response:', saveResponse);
            
            toast.success(`✅ ${groupsToAdd.length} new group(s) added to ${organizations.find(o => o.id === finalOrgId)?.name || 'organization'}`);
          }
        } catch (err: any) {
          console.error('Error saving groups to organization:', err);
          toast.error('Failed to save groups to organization data');
        }
      }

      // Create user
      const userPayload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        tenantId: finalTenantId,
        organizationId: finalOrgId,
        groupIds: Array.from(selectedGroupIds),
        readOnly: userData.readOnly
      };

      toast.info('Creating user...');
      await apiCall('/auth/signup', {
        method: 'POST',
        body: userPayload
      });

      const roleLabel = 
        adminMode === 'global_admin' ? 'Global Admin' :
        adminMode === 'tenant_admin' ? 'Tenant Admin' :
        adminMode === 'org_admin' ? 'Organization Admin' :
        'User';

      toast.success(`${roleLabel} "${userData.email}" created successfully!`);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user with optional admin rights over tenants or organizations
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
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Information
            </h3>
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
                <div className="relative">
                  {emailSuggestion && (
                    <div className="absolute inset-0 pointer-events-none flex items-center px-3">
                      <span className="text-muted-foreground opacity-50">{emailSuggestion}</span>
                    </div>
                  )}
                  <Input
                    id="user-email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="john@company.com"
                    className="relative z-10 bg-transparent"
                  />
                </div>
                {emailSuggestion && (
                  <p className="text-xs text-muted-foreground mt-1">Press Tab to accept domain suggestion</p>
                )}
              </div>
            </div>
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
          </div>

          <Separator />

          {/* Read-Only Access (for regular users only) */}
          {adminMode === 'none' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="create-readonly">Read-Only Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent this user from editing data (view-only mode)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="create-readonly"
                      checked={userData.readOnly}
                      onChange={(e) => setUserData({ ...userData, readOnly: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Badge variant={userData.readOnly ? "secondary" : "outline"}>
                      {userData.readOnly ? 'View Only' : 'Can Edit'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Admin Rights Assignment */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                Admin Rights Assignment
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose what level of access and management permissions this user should have
              </p>
            </div>

            <Select value={adminMode} onValueChange={(value: any) => setAdminMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Regular User (No Admin Rights)</span>
                  </div>
                </SelectItem>
                <SelectItem value="org_admin">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Organization Admin</span>
                  </div>
                </SelectItem>
                {(currentUser.role === 'master_admin' || currentUser.role === 'tenant_admin') && (
                  <SelectItem value="tenant_admin">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Tenant Admin</span>
                    </div>
                  </SelectItem>
                )}
                {currentUser.role === 'master_admin' && (
                  <SelectItem value="global_admin">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Global Admin (Full System Access)</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Tenant Admin Configuration */}
            {adminMode === 'tenant_admin' && (
              <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg space-y-4 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Tenant Admin Configuration</h4>
                </div>
                
                <Tabs value={adminTargetMode} onValueChange={(v: any) => setAdminTargetMode(v)}>
                  <TabsList className={`grid w-full ${currentUser.role === 'master_admin' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="existing">Existing Tenant</TabsTrigger>
                    {currentUser.role === 'master_admin' && (
                      <TabsTrigger value="new">Create New Tenant</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="existing" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label>Select Tenant to Administer *</Label>
                      <Select
                        value={userData.tenantId}
                        onValueChange={(value) => setUserData({ ...userData, tenantId: value })}
                      >
                        <SelectTrigger>
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
                    <Alert className="bg-blue-50 dark:bg-blue-950/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        This user will manage all organizations and users within this tenant
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  {currentUser.role === 'master_admin' && (
                    <TabsContent value="new" className="space-y-3 mt-4">
                      <Alert className="bg-blue-50 dark:bg-blue-950/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Create a new tenant and assign this user as its administrator
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label>Tenant Name *</Label>
                        <Input
                          value={newTenant.name}
                          onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                          placeholder="Acme Consulting LLC"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tenant Domain *</Label>
                        <Input
                          value={newTenant.domain}
                          onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                          placeholder="acmeconsulting.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand Name (Optional)</Label>
                        <Input
                          value={newTenant.settings.brandName}
                          onChange={(e) => setNewTenant({
                            ...newTenant,
                            settings: { ...newTenant.settings, brandName: e.target.value }
                          })}
                          placeholder="Acme ValueDock®"
                        />
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}

            {/* Organization Admin Configuration */}
            {adminMode === 'org_admin' && (
              <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg space-y-4 bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Organization Admin Configuration</h4>
                </div>

                <Tabs value={adminTargetMode} onValueChange={(v: any) => setAdminTargetMode(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Existing Organization</TabsTrigger>
                    <TabsTrigger value="new">Create New Organization</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-3 mt-4">
                    {currentUser.role === 'master_admin' && (
                      <div className="space-y-2">
                        <Label>Tenant *</Label>
                        <Select
                          value={userData.tenantId}
                          onValueChange={(value) => setUserData({ ...userData, tenantId: value, organizationId: '' })}
                        >
                          <SelectTrigger>
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
                    {currentUser.role === 'tenant_admin' && (
                      <Alert className="bg-blue-50 dark:bg-blue-950/30 mb-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Showing organizations from your tenant: {tenants.find(t => t.id === currentUser.tenantId)?.name}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label>Select Organization to Administer *</Label>
                      <Select
                        value={userData.organizationId}
                        onValueChange={(value) => setUserData({ ...userData, organizationId: value })}
                        disabled={!userData.tenantId || filteredOrganizations.length === 0}
                      >
                        <SelectTrigger>
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
                    <Alert className="bg-green-50 dark:bg-green-950/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        This user will manage users within this organization
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="new" className="space-y-3 mt-4">
                    <Alert className="bg-green-50 dark:bg-green-950/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Create a new organization and assign this user as its administrator
                        {currentUser.role === 'tenant_admin' && (
                          <span className="block mt-1 font-medium">
                            This organization will be created in your tenant: {tenants.find(t => t.id === currentUser.tenantId)?.name}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                    {currentUser.role === 'master_admin' && (
                      <div className="space-y-2">
                        <Label>Select Tenant for New Organization *</Label>
                        <Select
                          value={userData.tenantId}
                          onValueChange={(value) => setUserData({ ...userData, tenantId: value })}
                        >
                          <SelectTrigger>
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
                      <Label>Organization Name *</Label>
                      <Input
                        value={newOrg.name}
                        onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        placeholder="Acme Corp Division"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        value={newOrg.companyName}
                        onChange={(e) => setNewOrg({ ...newOrg, companyName: e.target.value })}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain *</Label>
                      <Input
                        value={newOrg.domain}
                        onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                        placeholder="acme.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        value={newOrg.description}
                        onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Global Admin Notice */}
            {adminMode === 'global_admin' && (
              <Alert className="bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800">
                <Globe className="h-5 w-5 text-purple-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Global Admin - Full System Access</p>
                    <p className="text-sm">
                      This user will have unrestricted access to all tenants, organizations, and users.
                      No tenant or organization assignment is needed.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Regular User - Organization Selection */}
            {adminMode === 'none' && (
              <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <h4 className="font-medium text-sm">Organization Assignment (Required for Regular Users)</h4>
                {currentUser.role === 'master_admin' && (
                  <div className="space-y-2">
                    <Label>Tenant *</Label>
                    <Select
                      value={userData.tenantId}
                      onValueChange={(value) => setUserData({ ...userData, tenantId: value, organizationId: '' })}
                    >
                      <SelectTrigger>
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
                {(currentUser.role === 'tenant_admin' || currentUser.role === 'org_admin') && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/30 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {currentUser.role === 'tenant_admin' 
                        ? `Showing organizations from your tenant: ${tenants.find(t => t.id === currentUser.tenantId)?.name}`
                        : `This user will be added to your organization`
                      }
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Organization *</Label>
                  <Select
                    value={userData.organizationId}
                    onValueChange={(value) => setUserData({ ...userData, organizationId: value })}
                    disabled={!userData.tenantId || filteredOrganizations.length === 0}
                  >
                    <SelectTrigger>
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
              </div>
            )}
          </div>

          {/* Group Assignment - Only for regular users and org admins */}
          {(adminMode === 'none' || adminMode === 'org_admin') && userData.organizationId && adminTargetMode === 'existing' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Group Assignment (Optional)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('[EnhancedUserDialogV2] 🔵 New Group button clicked, current state:', showNewGroupForm);
                      setShowNewGroupForm(!showNewGroupForm);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showNewGroupForm ? 'Cancel' : 'New Group'}
                  </Button>
                </div>

                {showNewGroupForm && (
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Create New Group</h4>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Auto-saves
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Group Name *</Label>
                      <Input
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="Finance Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="Finance department processes"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Average Hourly Wage (Optional)</Label>
                        <Input
                          type="number"
                          value={newGroup.averageHourlyWage || ''}
                          onChange={(e) => setNewGroup({ 
                            ...newGroup, 
                            averageHourlyWage: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          placeholder="50.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Salary (Optional)</Label>
                        <Input
                          type="number"
                          value={newGroup.annualSalary || ''}
                          onChange={(e) => setNewGroup({ 
                            ...newGroup, 
                            annualSalary: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          placeholder="80000"
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-800">
                        This group will be automatically saved when you click "Create User" below.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {availableGroups.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Groups</Label>
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
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
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
