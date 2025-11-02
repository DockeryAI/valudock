import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { apiCall } from '../utils/auth';

interface AdminRoleFixerProps {
  users: any[];
  onRefresh: () => Promise<void>;
}

export function AdminRoleFixer({ users, onRefresh }: AdminRoleFixerProps) {
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Find users with incorrect roles
  const incorrectRoles = users.filter(u => {
    // Check if user should be master_admin but isn't
    if (u.email === 'admin@dockery.ai' && u.role !== 'master_admin') {
      return true;
    }
    // Check if user should be tenant_admin but is org_admin
    // (Has tenantId but NO organizationId, and has org_admin role)
    if (u.role === 'org_admin' && u.tenantId && !u.organizationId) {
      return true;
    }
    return false;
  });

  const fixRoles = async () => {
    setFixing(true);
    setResults([]);
    const newResults: string[] = [];

    try {
      for (const user of incorrectRoles) {
        try {
          let newRole = user.role;
          let updates: any = {};

          // Fix Global Admin
          if (user.email === 'admin@dockery.ai') {
            newRole = 'master_admin';
            updates = {
              role: 'master_admin',
              tenantId: null,
              organizationId: null
            };
            newResults.push(`🔧 Fixing ${user.name}: ${user.role} → master_admin`);
          }
          // Fix Tenant Admin (has tenantId but is org_admin with no org)
          else if (user.role === 'org_admin' && user.tenantId && !user.organizationId) {
            newRole = 'tenant_admin';
            updates = {
              role: 'tenant_admin'
            };
            newResults.push(`🔧 Fixing ${user.name}: org_admin → tenant_admin`);
          }

          setResults([...newResults]);

          const response = await apiCall(`/admin/users/${user.id}`, {
            method: 'PUT',
            body: updates
          });

          newResults.push(`✅ ${user.name} updated successfully!`);
          setResults([...newResults]);
        } catch (err: any) {
          newResults.push(`❌ ${user.name} error: ${err.message}`);
          setResults([...newResults]);
        }
      }

      newResults.push('');
      newResults.push('🔄 Refreshing user list...');
      setResults([...newResults]);

      // Refresh the data
      await onRefresh();

      newResults.push('✅ Refresh complete!');
      setResults([...newResults]);

    } catch (err: any) {
      newResults.push(`❌ Error: ${err.message}`);
      setResults([...newResults]);
    } finally {
      setFixing(false);
    }
  };

  if (incorrectRoles.length === 0) {
    // Don't show anything if all roles are correct
    return null;
  }

  return (
    <Card className="p-4 border-orange-600 bg-orange-50">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">🔧 Role Assignment Issue Detected</h3>
            <p className="text-sm text-orange-800 mt-1">
              {incorrectRoles.length} user{incorrectRoles.length > 1 ? 's have' : ' has'} incorrect role{incorrectRoles.length > 1 ? 's' : ''} and need{incorrectRoles.length > 1 ? '' : 's'} to be fixed:
            </p>
          </div>
        </div>

        <div className="space-y-2 pl-7">
          {incorrectRoles.map(user => {
            let expectedRole = user.role;
            if (user.email === 'admin@dockery.ai') {
              expectedRole = 'master_admin';
            } else if (user.role === 'org_admin' && user.tenantId && !user.organizationId) {
              expectedRole = 'tenant_admin';
            }

            return (
              <div key={user.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="bg-white">
                  Current: {user.role}
                </Badge>
                <span>→</span>
                <Badge variant="secondary">
                  Should be: {expectedRole}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="pl-7">
          <Button
            onClick={fixRoles}
            disabled={fixing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            {fixing ? 'Fixing Roles...' : 'Fix All Roles Now'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="pl-7 space-y-1">
            {results.map((result, idx) => (
              <p key={idx} className="text-sm font-mono">
                {result}
              </p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
