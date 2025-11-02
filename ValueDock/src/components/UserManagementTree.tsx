import React, { useState, Fragment } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { ChevronRight, ChevronDown, Building2, Users, User, UserPlus, Trash2, Shield, Mail, Pencil } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { UserProfile } from '../utils/auth';
import { EnhancedUserDialogV2 } from './EnhancedUserDialogV2';
import { EditUserDialog } from './EditUserDialog';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useIsMobile } from './ui/use-mobile';

interface UserManagementTreeProps {
  currentUser: UserProfile;
  tenants: any[];
  organizations: any[];
  users: any[];
  onCreateUser: (userData: any) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onUpdateUser: (userId: string, userData: any) => Promise<void>;
  selectedUserIds: Set<string>;
  onToggleUserSelection: (userId: string) => void;
  onToggleAllUsers: () => void;
  onBulkDeleteUsers: () => void;
  onRefreshData?: () => Promise<void>;
}

export function UserManagementTree({
  currentUser,
  tenants,
  organizations,
  users,
  onCreateUser,
  onDeleteUser,
  onUpdateUser,
  selectedUserIds,
  onToggleUserSelection,
  onToggleAllUsers,
  onBulkDeleteUsers,
  onRefreshData,
}: UserManagementTreeProps) {
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [preselectedTenantId, setPreselectedTenantId] = useState<string | undefined>(undefined);
  const [preselectedOrgId, setPreselectedOrgId] = useState<string | undefined>(undefined);
  
  // Hook must be called at component level
  const isMobile = useIsMobile();

  const toggleTenant = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenants(newExpanded);
  };

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const openUserDialog = (user: any) => {
    console.log('[UserManagementTree] 🔵 openUserDialog called for user:', user.name);
    console.log('[UserManagementTree] User details:', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      tenantId: user.tenantId,
      groupIds: user.groupIds
    }, null, 2));
    console.log('[UserManagementTree] Current showEditUserDialog state BEFORE:', showEditUserDialog);
    setSelectedUser(user);
    setShowEditUserDialog(true);
    console.log('[UserManagementTree] ✅ Dialog state set to TRUE (requested)');
    
    // Verify state actually updated
    setTimeout(() => {
      console.log('[UserManagementTree] 🔍 State check after 100ms - showEditUserDialog:', showEditUserDialog);
    }, 100);
  };

  const openNewUserDialog = (tenantId?: string, orgId?: string) => {
    setPreselectedTenantId(tenantId);
    setPreselectedOrgId(orgId);
    setShowNewUserDialog(true);
  };

  const handleUserCreationSuccess = async () => {
    if (onRefreshData) {
      await onRefreshData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await onDeleteUser(userId);
        setShowUserDialog(false);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'tenant_admin': return 'default';
      case 'org_admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'master_admin': return 'Global Admin';
      case 'tenant_admin': return 'Tenant Admin';
      case 'org_admin': return 'Org Admin';
      default: return 'User';
    }
  };

  const getUserGroups = (user: any) => {
    if (!user.groupIds || user.groupIds.length === 0) return 'None';
    return user.groupIds.join(', ');
  };

  const getUserPermissions = (user: any) => {
    const permissions: string[] = [];
    const tenant = tenants.find(t => t.id === user.tenantId);
    const org = organizations.find(o => o.id === user.organizationId);

    if (user.role === 'master_admin') {
      permissions.push('Full system access');
    } else if (user.role === 'tenant_admin') {
      permissions.push(`Tenant Admin: ${tenant?.name || 'N/A'}`);
    } else if (user.role === 'org_admin') {
      permissions.push(`Org Admin: ${org?.name || 'N/A'}`);
    }

    // Check if user is also an org admin for specific org
    if (user.role === 'tenant_admin' && user.organizationId) {
      const adminOrg = organizations.find(o => o.id === user.organizationId);
      permissions.push(`Org Admin: ${adminOrg?.name || 'N/A'}`);
    }

    return permissions;
  };

  const getUserTooltipContent = (user: any, customContext?: string) => {
    const userTenants = tenants.filter(t => t.id === user.tenantId);
    const userOrgs = organizations.filter(o => o.id === user.organizationId);
    
    console.log('[UserTooltip]', user.name, 'customContext:', customContext);
    
    return (
      <div className="space-y-2 text-xs">
        {customContext && (
          <div>
            <div className="font-medium mb-1">Admin Roles:</div>
            {customContext.split(' | ').map((role, idx) => (
              <div key={idx} className="flex items-center gap-1 mb-1">
                <Shield className="h-3 w-3 text-blue-600" />
                <span>{role}</span>
              </div>
            ))}
          </div>
        )}
        
        <div>
          <div className="font-medium mb-1">Assigned To:</div>
          {userTenants.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Building2 className="h-3 w-3 text-blue-600" />
              <span>Tenant: {userTenants[0].name}</span>
            </div>
          )}
          {userOrgs.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-green-600" />
              <span>Org: {userOrgs[0].name}</span>
            </div>
          )}
          {userTenants.length === 0 && userOrgs.length === 0 && (
            <span className="text-muted-foreground">No assignments</span>
          )}
        </div>
        
        {!customContext && (
          <div>
            <div className="font-medium mb-1">Permissions:</div>
            {getUserPermissions(user).map((perm, idx) => (
              <div key={idx} className="flex items-center gap-1 mb-1">
                <Shield className="h-3 w-3 text-blue-600" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile Card-based User Row
  const UserRowMobile = ({ user, level = 0, context }: { user: any; level?: number; context?: string }) => {
    const isSelected = selectedUserIds.has(user.id);
    
    return (
      <Card className={`mb-2 ${level > 0 ? `ml-${Math.min(level * 4, 8)}` : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                const newSet = new Set(selectedUserIds);
                if (checked) {
                  newSet.add(user.id);
                } else {
                  newSet.delete(user.id);
                }
                onToggleUserSelection(user.id);
              }}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{user.name || 'Unnamed User'}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
                {context && (
                  <div className="text-xs text-muted-foreground mt-1">{context}</div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  openUserDialog(user);
                }}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(user.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserRow = ({ user, level = 0, showTenantOrg = true, context = '' }: { user: any; level?: number; showTenantOrg?: boolean; context?: string }) => {
    const isExpanded = expandedUsers.has(user.id);
    const tenant = tenants.find(t => t.id === user.tenantId);
    const org = organizations.find(o => o.id === user.organizationId);
    const paddingLeft = level * 24 + 8;
    const isGlobalAdmin = user.tenantId === null && user.organizationId === null;
    const permissions = getUserPermissions(user);

    const UserNameCell = () => (
      <div className="flex items-center gap-2">
        {!isGlobalAdmin && (
          <Checkbox
            checked={selectedUserIds.has(user.id)}
            onCheckedChange={() => onToggleUserSelection(user.id)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => toggleUser(user.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        {isGlobalAdmin ? (
          <Shield className="h-3 w-3 text-destructive" />
        ) : (
          <User className="h-3 w-3 text-muted-foreground" />
        )}
        
        {!isGlobalAdmin ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="font-medium text-sm cursor-pointer">{user.name}</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              {getUserTooltipContent(user, context)}
            </HoverCardContent>
          </HoverCard>
        ) : (
          <span className="font-medium text-sm">{user.name}</span>
        )}
      </div>
    );

    return (
      <>
        <TableRow className="hover:bg-muted/50">
          <TableCell style={{ paddingLeft: `${paddingLeft}px` }} className="py-2">
            <UserNameCell />
          </TableCell>
          <TableCell className="py-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </TableCell>
          <TableCell className="py-2">
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {getRoleLabel(user.role)}
            </Badge>
          </TableCell>
          {showTenantOrg && (
            <>
              <TableCell className="py-2 text-xs">
                {tenant ? (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-blue-600" />
                    {tenant.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-2 text-xs">
                {org ? (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-600" />
                    {org.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </>
          )}
          <TableCell className="py-2 text-xs text-muted-foreground">
            {getUserGroups(user)}
          </TableCell>
          <TableCell className="py-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={(e) => {
                  console.log('[UserManagementTree] 🖱️ EDIT BUTTON CLICKED for user:', user.email);
                  e.stopPropagation();
                  openUserDialog(user);
                }}
                title="Edit user profile"
              >
                <Pencil className="h-3 w-3 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => handleDeleteUser(user.id)}
                title="Delete user"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow className="bg-muted/30">
            <TableCell colSpan={showTenantOrg ? 7 : 5} style={{ paddingLeft: `${paddingLeft + 40}px` }} className="py-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-muted-foreground mb-1">User Details</div>
                  <div className="space-y-1">
                    <div><span className="font-medium">ID:</span> {user.id}</div>
                    <div><span className="font-medium">Created:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground mb-1">Permissions & Access</div>
                  <div className="space-y-1">
                    {permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-600" />
                        {perm}
                      </div>
                    ))}
                    {permissions.length === 0 && (
                      <div className="text-muted-foreground">Standard user access</div>
                    )}
                  </div>
                </div>
                {user.groupIds && user.groupIds.length > 0 && (
                  <div className="col-span-2">
                    <div className="font-medium text-muted-foreground mb-1">Group Memberships</div>
                    <div className="flex flex-wrap gap-1">
                      {user.groupIds.map((groupId: string) => (
                        <Badge key={groupId} variant="outline" className="text-xs">
                          {groupId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  // Global Admin View: Tenants → Orgs → Users
  if (currentUser.role === 'master_admin') {
    const globalAdmins = users.filter(u => u.tenantId === null && u.organizationId === null);

    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-medium">User Management</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedUserIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDeleteUsers}
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete {selectedUserIds.size}</span>
                <span className="sm:hidden">{selectedUserIds.size}</span>
              </Button>
            )}
            <Button size="sm" onClick={() => openNewUserDialog()}>
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Global Admins Section - Compact */}
        {globalAdmins.length > 0 && (
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">System Administrators</span>
                <Badge variant="secondary" className="text-xs">{globalAdmins.length}</Badge>
              </div>
            </div>
            {isMobile ? (
              <div className="p-2">
                {globalAdmins.map(user => (
                  <UserRowMobile key={user.id} user={user} level={0} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    {globalAdmins.map(user => (
                      <UserRow key={user.id} user={user} level={0} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Tenants Section */}
        {tenants.map((tenant) => {
          const tenantOrgs = organizations.filter(o => o.tenantId === tenant.id);
          const tenantAdmins = users.filter(u => u.tenantId === tenant.id && u.role === 'tenant_admin');
          const isExpanded = expandedTenants.has(tenant.id);
          
          // Debug logging
          console.log(`[UserManagementTree] Tenant: ${tenant.name} (ID: ${tenant.id})`);
          console.log(`[UserManagementTree] All users in tenant:`, users.filter(u => u.tenantId === tenant.id));
          console.log(`[UserManagementTree] Tenant admins found:`, tenantAdmins);
          
          // Count all users in this tenant (including org users)
          const allTenantUsers = users.filter(u => u.tenantId === tenant.id);

          return (
            <Card key={tenant.id}>
              <div
                className="p-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between border-b"
                onClick={() => toggleTenant(tenant.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{tenant.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {allTenantUsers.length} users
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tenantOrgs.length} orgs
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('[UserManagementTree] Quick add org button clicked for tenant:', tenant.name, tenant.id);
                    // Trigger org creation dialog with this tenant pre-selected
                    window.dispatchEvent(new CustomEvent('create-organization', { detail: { tenantId: tenant.id } }));
                    console.log('[UserManagementTree] create-organization event dispatched');
                  }}
                  title="Add Organization"
                >
                  <Users className="h-3.5 w-3.5" />
                </Button>
              </div>

              {isExpanded && (
                isMobile ? (
                  <div className="p-2 space-y-2">
                    {/* Tenant Admins - Show First as Individual Rows */}
                    {tenantAdmins.map(user => {
                      const userOrg = user.organizationId ? organizations.find(o => o.id === user.organizationId) : null;
                      let roleContext = '';
                      if (user.role === 'tenant_admin' && userOrg) {
                        roleContext = `Tenant Admin: ${tenant.name} | Org Admin: ${userOrg.name}`;
                      } else if (user.role === 'tenant_admin') {
                        roleContext = `Tenant Admin: ${tenant.name}`;
                      }
                      
                      return (
                        <UserRowMobile 
                          key={`tenant-admin-${user.id}`} 
                          user={user} 
                          level={1}
                          context={roleContext}
                        />
                      );
                    })}

                    {/* Organizations - Mobile Card View */}
                    {tenantOrgs.map((org) => {
                      const isOrgExpanded = expandedOrgs.has(org.id);
                      
                      // Get org admins (excluding tenant_admin role, but including users with org_admin role)
                      const orgAdmins = users.filter(u => 
                        u.organizationId === org.id && 
                        u.role === 'org_admin' &&
                        u.role !== 'tenant_admin'
                      );
                      
                      // Get regular users (not org admins, not tenant admins)
                      const regularOrgUsers = users.filter(u => 
                        u.organizationId === org.id && 
                        u.role === 'user'
                      );
                      
                      // Sort regular users alphabetically by name
                      const sortedRegularUsers = [...regularOrgUsers].sort((a, b) => 
                        (a.name || '').localeCompare(b.name || '')
                      );
                      
                      // Check if any tenant admins are also assigned to this org
                      const tenantAdminsInOrg = tenantAdmins.filter(admin => admin.organizationId === org.id);
                      
                      const totalOrgUsers = orgAdmins.length + sortedRegularUsers.length + tenantAdminsInOrg.length;

                      return (
                        <div key={org.id} className="mb-3">
                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div 
                                  className="flex items-center gap-2 cursor-pointer flex-1"
                                  onClick={() => toggleOrg(org.id)}
                                >
                                  {isOrgExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Users className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-sm">{org.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {totalOrgUsers}
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openNewUserDialog(tenant.id, org.id);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </div>

                              {isOrgExpanded && (
                                <div className="space-y-2 mt-3">
                                  {/* Tenant admins who are also assigned to this org - show first */}
                                  {tenantAdminsInOrg.map(user => (
                                    <UserRowMobile 
                                      key={`org-tenant-admin-${user.id}`} 
                                      user={user} 
                                      level={1}
                                      context={`Tenant Admin: ${tenant.name} | Org Admin: ${org.name}`}
                                    />
                                  ))}
                                  
                                  {/* Org admins - show second */}
                                  {orgAdmins.map(user => (
                                    <UserRowMobile 
                                      key={user.id} 
                                      user={user} 
                                      level={1}
                                      context={`Org Admin: ${org.name}`}
                                    />
                                  ))}
                                  
                                  {/* Regular users - show last, alphabetically */}
                                  {sortedRegularUsers.map(user => (
                                    <UserRowMobile key={user.id} user={user} level={1} />
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                      {/* Tenant Admins - Show First as Individual Rows */}
                      {tenantAdmins.map(user => {
                        const userOrg = user.organizationId ? organizations.find(o => o.id === user.organizationId) : null;
                        let roleContext = '';
                        if (user.role === 'tenant_admin' && userOrg) {
                          roleContext = `Tenant Admin: ${tenant.name} | Org Admin: ${userOrg.name}`;
                        } else if (user.role === 'tenant_admin') {
                          roleContext = `Tenant Admin: ${tenant.name}`;
                        }
                        
                        return (
                          <UserRow 
                            key={`tenant-admin-${user.id}`} 
                            user={user} 
                            level={1}
                            context={roleContext}
                          />
                        );
                      })}

                      {/* Organizations - Show After Tenant Admins */}
                      {tenantOrgs.map((org) => {
                        const isOrgExpanded = expandedOrgs.has(org.id);
                        
                        // Get org admins (excluding tenant_admin role, but including users with org_admin role)
                        const orgAdmins = users.filter(u => 
                          u.organizationId === org.id && 
                          u.role === 'org_admin' &&
                          u.role !== 'tenant_admin'
                        );
                        
                        // Get regular users (not org admins, not tenant admins)
                        const regularOrgUsers = users.filter(u => 
                          u.organizationId === org.id && 
                          u.role === 'user'
                        );
                        
                        // Sort regular users alphabetically by name
                        const sortedRegularUsers = [...regularOrgUsers].sort((a, b) => 
                          (a.name || '').localeCompare(b.name || '')
                        );
                        
                        // Check if any tenant admins are also assigned to this org
                        const tenantAdminsInOrg = tenantAdmins.filter(admin => admin.organizationId === org.id);
                        
                        const totalOrgUsers = orgAdmins.length + sortedRegularUsers.length + tenantAdminsInOrg.length;

                        return (
                          <React.Fragment key={org.id}>
                            <TableRow className="hover:bg-muted/30">
                              <TableCell colSpan={6} className="py-2 pl-12">
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="flex items-center gap-2 cursor-pointer flex-1"
                                    onClick={() => toggleOrg(org.id)}
                                  >
                                    {isOrgExpanded ? (
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <Users className="h-3 w-3 text-green-600" />
                                    <span className="text-sm font-medium">{org.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {totalOrgUsers} users
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openNewUserDialog(tenant.id, org.id);
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {isOrgExpanded && (
                              <>
                                {/* Tenant admins who are also assigned to this org - show first */}
                                {tenantAdminsInOrg.map(user => (
                                  <UserRow 
                                    key={`org-tenant-admin-${user.id}`} 
                                    user={user} 
                                    level={3}
                                    context={`Tenant Admin: ${tenant.name} | Org Admin: ${org.name}`}
                                  />
                                ))}
                                
                                {/* Org admins - show second */}
                                {orgAdmins.map(user => (
                                  <UserRow 
                                    key={user.id} 
                                    user={user} 
                                    level={3}
                                    context={`Org Admin: ${org.name}`}
                                  />
                                ))}
                                
                                {/* Regular users - show last, alphabetically */}
                                {sortedRegularUsers.map(user => (
                                  <UserRow key={user.id} user={user} level={3} />
                                ))}
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </Card>
          );
        })}

        {/* User Detail Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Organization</Label>
                  <p>{organizations.find(o => o.id === selectedUser.organizationId)?.name || 'None'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tenant</Label>
                  <p>{tenants.find(t => t.id === selectedUser.tenantId)?.name || 'None'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced User Dialog */}
        <EnhancedUserDialogV2
          open={showNewUserDialog}
          onOpenChange={setShowNewUserDialog}
          currentUser={currentUser}
          tenants={tenants}
          organizations={organizations}
          onSuccess={handleUserCreationSuccess}
          preselectedTenantId={preselectedTenantId}
          preselectedOrgId={preselectedOrgId}
        />
        
        {/* Edit User Dialog */}
        <EditUserDialog
          open={showEditUserDialog}
          onOpenChange={setShowEditUserDialog}
          user={selectedUser}
          currentUser={currentUser}
          tenants={tenants}
          organizations={organizations}
          onSuccess={handleUserCreationSuccess}
        />
      </div>
    );
  }

  // Tenant Admin View: Orgs → Users
  if (currentUser.role === 'tenant_admin') {
    const tenantOrgs = organizations.filter(o => o.tenantId === currentUser.tenantId);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">User Management</h3>
          <Button size="sm" onClick={() => openNewUserDialog()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {tenantOrgs.map((org) => {
          const orgUsers = users
            .filter(u => u.organizationId === org.id)
            .sort((a, b) => {
              // Sort by role: org_admin first, then users
              if (a.role === 'org_admin' && b.role !== 'org_admin') return -1;
              if (a.role !== 'org_admin' && b.role === 'org_admin') return 1;
              // Then by name
              return (a.name || '').localeCompare(b.name || '');
            });
          const isExpanded = expandedOrgs.has(org.id);

          return (
            <Card key={org.id}>
              <div
                className="p-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between border-b"
                onClick={() => toggleOrg(org.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{org.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {orgUsers.length} users
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNewUserDialog(currentUser.tenantId, org.id);
                  }}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
              </div>

              {isExpanded && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-8 text-xs">Name</TableHead>
                      <TableHead className="h-8 text-xs">Email</TableHead>
                      <TableHead className="h-8 text-xs">Role</TableHead>
                      <TableHead className="h-8 text-xs">Groups</TableHead>
                      <TableHead className="h-8 text-xs w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgUsers.map(user => (
                      <UserRow key={user.id} user={user} level={0} showTenantOrg={false} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          );
        })}

        {/* User Detail Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Organization</Label>
                  <p>{organizations.find(o => o.id === selectedUser.organizationId)?.name || 'None'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced User Dialog V2 */}
        <EnhancedUserDialogV2
          open={showNewUserDialog}
          onOpenChange={setShowNewUserDialog}
          currentUser={currentUser}
          tenants={tenants}
          organizations={organizations}
          onSuccess={handleUserCreationSuccess}
          preselectedTenantId={preselectedTenantId}
          preselectedOrgId={preselectedOrgId}
        />
        
        {/* Edit User Dialog */}
        <EditUserDialog
          open={showEditUserDialog}
          onOpenChange={setShowEditUserDialog}
          user={selectedUser}
          currentUser={currentUser}
          tenants={tenants}
          organizations={organizations}
          onSuccess={handleUserCreationSuccess}
        />
      </div>
    );
  }

  // Org Admin View: Users only
  const orgUsers = users
    .filter(u => u.organizationId === currentUser.organizationId)
    .sort((a, b) => {
      // Sort by role: org_admin first, then users  
      if (a.role === 'org_admin' && b.role !== 'org_admin') return -1;
      if (a.role !== 'org_admin' && b.role === 'org_admin') return 1;
      // Then by name
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">User Management</h3>
        <Button size="sm" onClick={() => openNewUserDialog()}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-8 text-xs">Name</TableHead>
              <TableHead className="h-8 text-xs">Email</TableHead>
              <TableHead className="h-8 text-xs">Role</TableHead>
              <TableHead className="h-8 text-xs">Groups</TableHead>
              <TableHead className="h-8 text-xs w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No users in your organization</p>
                </TableCell>
              </TableRow>
            ) : (
              orgUsers.map(user => (
                <UserRow key={user.id} user={user} level={0} showTenantOrg={false} />
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {getRoleLabel(selectedUser.role)}
                  </Badge>
                  </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced User Dialog V2 */}
      <EnhancedUserDialogV2
        open={showNewUserDialog}
        onOpenChange={setShowNewUserDialog}
        currentUser={currentUser}
        tenants={tenants}
        organizations={organizations}
        onSuccess={handleUserCreationSuccess}
        preselectedTenantId={preselectedTenantId}
        preselectedOrgId={preselectedOrgId}
      />
      
      {/* Edit User Dialog */}
      <EditUserDialog
        open={showEditUserDialog}
        onOpenChange={setShowEditUserDialog}
        user={selectedUser}
        currentUser={currentUser}
        tenants={tenants}
        organizations={organizations}
        onSuccess={handleUserCreationSuccess}
      />
    </div>
  );
}
