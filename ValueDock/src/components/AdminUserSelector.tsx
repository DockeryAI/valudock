/**
 * AdminUserSelector - Component for selecting or creating an admin user for tenants/organizations
 * 
 * Features:
 * - Select existing user from the system
 * - Create new admin user inline
 * - Auto-assigns appropriate admin role (tenant_admin or org_admin)
 */

import React, { useState } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { UserPlus, User } from 'lucide-react';

interface AdminUserSelectorProps {
  mode: 'tenant' | 'organization';
  existingUsers: any[];
  tenantId?: string;
  organizationId?: string;
  onAdminUserSelected: (adminUserId: string | null) => void;
  onNewAdminUserData: (userData: any | null) => void;
}

export function AdminUserSelector({
  mode,
  existingUsers,
  tenantId,
  organizationId,
  onAdminUserSelected,
  onNewAdminUserData
}: AdminUserSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    name: '',
    role: mode === 'tenant' ? 'tenant_admin' : 'org_admin'
  });

  // Filter users based on mode
  const filteredUsers = mode === 'tenant' 
    ? existingUsers.filter(u => 
        u.role === 'master_admin' || // Always show global admins
        u.role === 'tenant_admin' || // Show all tenant admins
        (!u.tenantId && !u.organizationId) // Show unassigned users
      )
    : existingUsers.filter(u => 
        u.role === 'master_admin' || // Always show global admins
        u.role === 'tenant_admin' || // Show tenant admins
        (organizationId && u.organizationId === organizationId) || 
        (tenantId && u.tenantId === tenantId)
      );
  
  // Debug logging
  console.log('[AdminUserSelector] Mode:', mode);
  console.log('[AdminUserSelector] All existing users:', existingUsers);
  console.log('[AdminUserSelector] Filtered users:', filteredUsers);
  console.log('[AdminUserSelector] Tenant admins in system:', existingUsers.filter(u => u.role === 'tenant_admin'));

  const handleModeChange = (mode: 'existing' | 'new') => {
    setSelectionMode(mode);
    if (mode === 'existing') {
      onNewAdminUserData(null);
      onAdminUserSelected(selectedUserId || null);
    } else {
      onAdminUserSelected(null);
      onNewAdminUserData(newUserData.email ? newUserData : null);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    onAdminUserSelected(userId);
  };

  const handleNewUserChange = (field: string, value: string) => {
    const updated = { ...newUserData, [field]: value };
    setNewUserData(updated);
    onNewAdminUserData(updated.email && updated.name && updated.password ? updated : null);
  };

  const adminLabel = mode === 'tenant' ? 'Tenant Admin' : 'Organization Admin';

  return (
    <Card className="p-4 space-y-4 bg-muted/30">
      <div>
        <h4 className="font-medium mb-2">
          Assign {adminLabel} (Optional)
        </h4>
        <p className="text-sm text-muted-foreground">
          Select an existing user or create a new admin for this {mode}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={selectionMode === 'existing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('existing')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Select Existing
        </Button>
        <Button
          type="button"
          variant={selectionMode === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('new')}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <Separator />

      {selectionMode === 'existing' ? (
        <div className="space-y-2">
          <Label htmlFor="admin-select">Select {adminLabel}</Label>
          <Select value={selectedUserId} onValueChange={handleUserSelect}>
            <SelectTrigger id="admin-select">
              <SelectValue placeholder={
                filteredUsers.length === 0 
                  ? "No existing users available" 
                  : "Select a user to assign as admin"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <span className="text-muted-foreground italic">No admin (assign later)</span>
              </SelectItem>
              {filteredUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">({user.email})</span>
                    <Badge variant="outline" className="text-xs">
                      {user.role === 'master_admin' ? 'Global Admin' :
                       user.role === 'tenant_admin' ? 'Tenant Admin' :
                       user.role === 'org_admin' ? 'Org Admin' : 'User'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredUsers.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No existing users available. Create a new admin user or skip this step.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-admin-name">Full Name *</Label>
            <Input
              id="new-admin-name"
              value={newUserData.name}
              onChange={(e) => handleNewUserChange('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-admin-email">Email *</Label>
            <Input
              id="new-admin-email"
              type="email"
              value={newUserData.email}
              onChange={(e) => handleNewUserChange('email', e.target.value)}
              placeholder="john@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-admin-password">Password *</Label>
            <Input
              id="new-admin-password"
              type="password"
              value={newUserData.password}
              onChange={(e) => handleNewUserChange('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
            <p>
              <strong>Role:</strong> This user will be created as a <Badge variant="secondary">{adminLabel}</Badge>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
