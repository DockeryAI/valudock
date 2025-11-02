import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface AdminSystemInfoProps {
  users: any[];
  tenants: any[];
  organizations: any[];
}

export function AdminSystemInfo({ users, tenants, organizations }: AdminSystemInfoProps) {
  // Count users by role
  const masterAdmins = users.filter(u => u.role === 'master_admin');
  const tenantAdmins = users.filter(u => u.role === 'tenant_admin');
  const orgAdmins = users.filter(u => u.role === 'org_admin');
  const regularUsers = users.filter(u => u.role === 'user');

  // Find users who might be misconfigured
  const orgAdminsWithoutOrg = orgAdmins.filter(u => !u.organizationId);
  const tenantAdminsWithOrg = tenantAdmins.filter(u => u.organizationId);

  const hasIssues = orgAdminsWithoutOrg.length > 0 || tenantAdminsWithOrg.length > 0;

  if (!hasIssues) {
    return null;
  }

  return (
    <Alert className="border-blue-600 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold text-blue-900">System Status:</p>
          <div className="text-sm text-blue-800 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{masterAdmins.length}</Badge>
              <span>Global Admin{masterAdmins.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tenantAdmins.length}</Badge>
              <span>Tenant Admin{tenantAdmins.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{orgAdmins.length}</Badge>
              <span>Organization Admin{orgAdmins.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{regularUsers.length}</Badge>
              <span>Regular User{regularUsers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {orgAdminsWithoutOrg.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-300">
              <p className="text-xs text-blue-700">
                ⚠️ {orgAdminsWithoutOrg.length} Organization Admin{orgAdminsWithoutOrg.length !== 1 ? 's are' : ' is'} not assigned to any organization
              </p>
            </div>
          )}
          
          {tenantAdminsWithOrg.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-300">
              <p className="text-xs text-blue-700">
                ℹ️ {tenantAdminsWithOrg.length} Tenant Admin{tenantAdminsWithOrg.length !== 1 ? 's are' : ' is'} also assigned to organization{tenantAdminsWithOrg.length !== 1 ? 's' : ''} (they will appear in both places)
              </p>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
