/**
 * EditUserDialog - Dialog for editing existing user profiles
 * 
 * Features:
 * - Edit user name, email, role
 * - Change tenant/organization assignment
 * - Update group memberships
 * - Admin-only access with permission checks
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
import { AlertCircle, Building2, Users, Shield, Save, UserCog } from 'lucide-react';
import { UserProfile, apiCall, hasRole } from '../utils/auth';
import { toast } from 'sonner@2.0.3';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // The user being edited
  currentUser: UserProfile; // The logged-in admin user
  tenants: any[];
  organizations: any[];
  onSuccess: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  currentUser,
  tenants,
  organizations,
  onSuccess
}: EditUserDialogProps) {
  console.log('[EditUserDialog] ============ RENDER ============');
  console.log('[EditUserDialog] Component rendered with props:', { 
    open, 
    hasUser: !!user,
    userName: user?.name,
    userEmail: user?.email,
    userOrgId: user?.organizationId,
    currentUserRole: currentUser?.role 
  });
  console.log('[EditUserDialog] ================================');
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'org_admin' | 'tenant_admin' | 'master_admin',
    tenantId: '',
    organizationId: '',
    readOnly: false
  });

  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtered organizations based on selected tenant
  const filteredOrganizations = userData.tenantId
    ? organizations.filter(org => org.tenantId === userData.tenantId)
    : organizations;

  // Load user data when dialog opens
  useEffect(() => {
    console.log('[EditUserDialog] ========== DIALOG OPEN EFFECT ==========');
    console.log('[EditUserDialog] open:', open);
    console.log('[EditUserDialog] user:', user);
    
    if (open && user) {
      console.log('[EditUserDialog] ✅ Opening for user:', user.name);
      console.log('[EditUserDialog] User data:', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        tenantId: user.tenantId,
        role: user.role,
        groupIds: user.groupIds
      }, null, 2));
      
      setUserData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        tenantId: user.tenantId || '',
        organizationId: user.organizationId || '',
        readOnly: user.readOnly || false
      });
      
      // Load groups if user has an organization
      if (user.organizationId) {
        console.log('[EditUserDialog] ✅ User HAS organizationId:', user.organizationId);
        console.log('[EditUserDialog] 🔄 Calling loadGroups...');
        loadGroups(user.organizationId);
      } else {
        console.log('[EditUserDialog] ❌ User has NO organizationId, skipping groups load');
      }
      
      // Set current group selections
      if (user.groupIds && Array.isArray(user.groupIds)) {
        console.log('[EditUserDialog] Setting initial group selections:', user.groupIds);
        setSelectedGroupIds(new Set(user.groupIds));
      } else {
        console.log('[EditUserDialog] No groupIds to set');
        setSelectedGroupIds(new Set());
      }
    } else {
      console.log('[EditUserDialog] Dialog closed or no user - skipping setup');
    }
    console.log('[EditUserDialog] ========== END DIALOG OPEN EFFECT ==========');
  }, [open, user]);

  // Load groups when organization changes
  useEffect(() => {
    console.log('[EditUserDialog] ========== ORG CHANGE EFFECT ==========');
    console.log('[EditUserDialog] userData.organizationId:', userData.organizationId);
    console.log('[EditUserDialog] open:', open);
    
    // Only load groups if dialog is open
    if (!open) {
      console.log('[EditUserDialog] Dialog is not open, skipping group load');
      console.log('[EditUserDialog] ========== END ORG CHANGE EFFECT ==========');
      return;
    }
    
    if (userData.organizationId) {
      console.log('[EditUserDialog] ✅ Loading groups for org:', userData.organizationId);
      loadGroups(userData.organizationId);
    } else {
      console.log('[EditUserDialog] ❌ No org selected, clearing groups');
      setAvailableGroups([]);
      setSelectedGroupIds(new Set());
    }
    console.log('[EditUserDialog] ========== END ORG CHANGE EFFECT ==========');
  }, [userData.organizationId, open]);

  const loadGroups = async (organizationId: string) => {
    try {
      console.log('[EditUserDialog] ========== LOAD GROUPS START ==========');
      console.log('[EditUserDialog] 🔄 Loading groups for org:', organizationId);
      console.log('[EditUserDialog] Full API endpoint: /groups/' + organizationId);
      console.log('[EditUserDialog] Current availableGroups before call:', availableGroups.length);
      
      const response = await apiCall(`/groups/${organizationId}`);
      
      console.log('[EditUserDialog] ✅ Groups API response received:');
      console.log('[EditUserDialog] Response type:', typeof response);
      console.log('[EditUserDialog] Response keys:', Object.keys(response || {}));
      console.log('[EditUserDialog] Response.groups type:', typeof response.groups);
      console.log('[EditUserDialog] Response.groups is Array:', Array.isArray(response.groups));
      console.log('[EditUserDialog] Groups count:', response.groups?.length || 0);
      
      if (response.groups && response.groups.length > 0) {
        console.log('[EditUserDialog] ✅✅✅ GROUPS FOUND! Count:', response.groups.length);
        console.log('[EditUserDialog] Group names:', response.groups.map((g: any) => g.name).join(', '));
        console.log('[EditUserDialog] Full groups data:', JSON.stringify(response.groups, null, 2));
      } else {
        console.log('[EditUserDialog] ⚠️⚠️⚠️ NO GROUPS in response');
        console.log('[EditUserDialog] Full response:', JSON.stringify(response, null, 2));
      }
      
      setAvailableGroups(response.groups || []);
      console.log('[EditUserDialog] availableGroups state updated with', response.groups?.length || 0, 'groups');
      console.log('[EditUserDialog] ========== LOAD GROUPS END ==========');
    } catch (err: any) {
      console.error('[EditUserDialog] ========== LOAD GROUPS ERROR ==========');
      console.error('[EditUserDialog] ❌ Failed to load groups');
      console.error('[EditUserDialog] Error type:', typeof err);
      console.error('[EditUserDialog] Error:', err);
      console.error('[EditUserDialog] Error message:', err?.message);
      console.error('[EditUserDialog] Error status:', err?.status);
      console.error('[EditUserDialog] Error stack:', err?.stack);
      console.error('[EditUserDialog] ========================================');
      setAvailableGroups([]);
      // Set error message for UI
      setError(`Failed to load groups: ${err.message || 'Unknown error'}`);
    }
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

  const canEditRole = () => {
    // Global admin can edit any role
    if (currentUser.role === 'master_admin') return true;
    
    // Tenant admin can edit roles within their tenant (except master_admin)
    if (currentUser.role === 'tenant_admin' && user.tenantId === currentUser.tenantId) {
      return user.role !== 'master_admin';
    }
    
    // Org admin can edit users within their org (only 'user' role)
    if (currentUser.role === 'org_admin' && user.organizationId === currentUser.organizationId) {
      return user.role === 'user';
    }
    
    return false;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!userData.name || !userData.email) {
        throw new Error('Name and email are required');
      }

      // Prepare update payload
      const updatePayload: any = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        tenantId: userData.tenantId || null,
        organizationId: userData.organizationId || null,
        groupIds: Array.from(selectedGroupIds),
        readOnly: userData.readOnly
      };

      // Call update endpoint
      await apiCall(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: updatePayload
      });

      console.log(`User "${userData.name}" updated successfully`);
      // toast.success(`User "${userData.name}" updated successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update user';
      console.error('Error updating user:', errorMsg);
      setError(errorMsg);
      // toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Log render state
  console.log('[EditUserDialog] ========== RENDER STATE ==========');
  console.log('[EditUserDialog] Rendering with:');
  console.log('[EditUserDialog]   - open:', open);
  console.log('[EditUserDialog]   - user:', user?.name || 'none');
  console.log('[EditUserDialog]   - userData.organizationId:', userData.organizationId);
  console.log('[EditUserDialog]   - availableGroups.length:', availableGroups.length);
  console.log('[EditUserDialog]   - selectedGroupIds.size:', selectedGroupIds.size);
  if (availableGroups.length > 0) {
    console.log('[EditUserDialog]   - ✅ Groups available:', availableGroups.map((g: any) => g.name).join(', '));
  } else {
    console.log('[EditUserDialog]   - ⚠️ NO groups available');
  }
  console.log('[EditUserDialog]   - Will show "No groups" message:', !!(userData.organizationId && availableGroups.length === 0));
  console.log('[EditUserDialog] =====================================');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>
            {user ? `Update ${user.name || user.email}'s information, role, permissions, and group assignments` : 'Loading user data...'}
          </DialogDescription>
        </DialogHeader>

        {!user && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Loading user information...</p>
          </div>
        )}
        
        {user && (<>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <Separator />

          {/* Role Selection */}
          {canEditRole() && (
            <div className="space-y-2">
              <Label htmlFor="edit-role">User Role & Permissions</Label>
              <Select
                value={userData.role}
                onValueChange={(value: any) => setUserData({ ...userData, role: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span>Regular User</span>
                        <span className="text-xs text-muted-foreground">View and edit ROI calculations</span>
                      </div>
                    </div>
                  </SelectItem>
                  
                  {hasRole(currentUser, ['master_admin', 'tenant_admin']) && (
                    <SelectItem value="org_admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span>Organization Admin</span>
                          <span className="text-xs text-muted-foreground">Manage users and groups in org</span>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                  
                  {hasRole(currentUser, ['master_admin']) && (
                    <>
                      <SelectItem value="tenant_admin">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span>Tenant Admin</span>
                            <span className="text-xs text-muted-foreground">Manage all orgs in tenant</span>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="master_admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-destructive" />
                          <div className="flex flex-col items-start">
                            <span>Global Admin</span>
                            <span className="text-xs text-muted-foreground">Full system access</span>
                          </div>
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {userData.role === 'user' && 'Regular users can only view/edit data in their organization'}
                {userData.role === 'org_admin' && 'Organization admins can create users and groups within their organization'}
                {userData.role === 'tenant_admin' && 'Tenant admins can manage all organizations within their tenant'}
                {userData.role === 'master_admin' && 'Global admins have unrestricted access to all system functions'}
              </p>
            </div>
          )}
          
          {/* Read-only role display if can't edit */}
          {!canEditRole() && (
            <div className="space-y-2">
              <Label>User Role & Permissions</Label>
              <div className="px-3 py-2 border rounded-md bg-muted">
                <div className="flex items-center gap-2">
                  {userData.role === 'user' && <Users className="h-4 w-4" />}
                  {userData.role === 'org_admin' && <Shield className="h-4 w-4" />}
                  {userData.role === 'tenant_admin' && <Building2 className="h-4 w-4" />}
                  {userData.role === 'master_admin' && <Shield className="h-4 w-4 text-destructive" />}
                  <span className="capitalize">{userData.role.replace('_', ' ')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                You don't have permission to change this user's role
              </p>
            </div>
          )}

          <Separator />

          {/* Read-Only Access Toggle */}
          {userData.role === 'user' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-readonly">Read-Only Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent this user from editing data (view-only mode)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-readonly"
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
          )}

          <Separator />

          {/* Tenant Selection */}
          {hasRole(currentUser, ['master_admin']) && (
            <div className="space-y-2">
              <Label htmlFor="edit-tenant">Tenant</Label>
              <Select
                value={userData.tenantId || '__NONE__'}
                onValueChange={(value) => {
                  const newTenantId = value === '__NONE__' ? '' : value;
                  setUserData({ ...userData, tenantId: newTenantId, organizationId: '' });
                }}
              >
                <SelectTrigger id="edit-tenant">
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">
                    <span className="text-muted-foreground italic">No tenant</span>
                  </SelectItem>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Organization Selection */}
          <div className="space-y-2">
            <Label htmlFor="edit-organization">Organization</Label>
            <Select
              value={userData.organizationId || '__NONE__'}
              onValueChange={(value) => {
                const newOrgId = value === '__NONE__' ? '' : value;
                setUserData({ ...userData, organizationId: newOrgId });
              }}
            >
              <SelectTrigger id="edit-organization">
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">
                  <span className="text-muted-foreground italic">No organization</span>
                </SelectItem>
                {filteredOrganizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.companyName || org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups Selection */}
          {console.log('[EditUserDialog] Rendering groups section. availableGroups.length:', availableGroups.length, 'groups:', availableGroups)}
          {availableGroups.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Groups (Optional)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userData.role === 'user' 
                        ? 'Regular users can be assigned to specific groups to limit their data visibility' 
                        : 'Admins typically have access to all groups'}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {selectedGroupIds.size} selected
                  </Badge>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableGroups.map(group => (
                    <div key={group.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-group-${group.id}`}
                        checked={selectedGroupIds.has(group.id)}
                        onCheckedChange={() => toggleGroupSelection(group.id)}
                      />
                      <Label
                        htmlFor={`edit-group-${group.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span>{group.name}</span>
                          {group.description && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {group.description}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedGroupIds.size === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    {userData.role === 'user'
                      ? 'No groups selected - user will see ALL processes and groups in their organization'
                      : 'No groups selected - admin has full access regardless'}
                  </p>
                )}
              </div>
            </>
          )}
          
          {/* No Groups Message */}
          {userData.organizationId && availableGroups.length === 0 && (
            <>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No groups have been created for this organization yet. Create groups in the Admin Dashboard to assign users to specific teams or departments.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
