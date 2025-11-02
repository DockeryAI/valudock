import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { UserProfile } from '../utils/auth';
import { CostClassificationManager } from './CostClassificationManager';

interface CostClassificationTreeViewProps {
  currentUser: UserProfile;
  tenants: any[];
  organizations: any[];
}

export function CostClassificationTreeView({ 
  currentUser, 
  tenants, 
  organizations 
}: CostClassificationTreeViewProps) {
  const [expandedTenantIds, setExpandedTenantIds] = useState<Set<string>>(new Set());
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Org admins can only see their organization
  if (currentUser.role === 'org_admin') {
    const orgId = currentUser.organizationId;
    const org = organizations.find(o => o.id === orgId);
    
    if (!org) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No organization assigned to your account. Please contact your administrator.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <CostClassificationManager
        key={org.id}
        organizationId={org.id}
        organizationName={org.name}
      />
    );
  }

  // Tenant admins can only see organizations in their tenant
  const visibleTenants = currentUser.role === 'tenant_admin'
    ? tenants.filter(t => t.id === currentUser.tenantId)
    : tenants;

  const visibleOrganizations = currentUser.role === 'tenant_admin'
    ? organizations.filter(o => o.tenantId === currentUser.tenantId)
    : organizations;

  const toggleTenant = (tenantId: string) => {
    const newExpanded = new Set(expandedTenantIds);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
      // Deselect org if it was under this tenant
      const orgUnderTenant = visibleOrganizations.find(
        o => o.tenantId === tenantId && o.id === selectedOrgId
      );
      if (orgUnderTenant) {
        setSelectedOrgId(null);
      }
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenantIds(newExpanded);
  };

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  const selectedOrg = selectedOrgId 
    ? visibleOrganizations.find(o => o.id === selectedOrgId)
    : null;

  if (visibleTenants.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tenants available. Please create a tenant first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Panel: Tenant/Organization Tree */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Select Organization
            </CardTitle>
            <CardDescription>
              Choose an organization to manage its cost classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleTenants.map((tenant) => {
              const tenantOrgs = visibleOrganizations.filter(
                o => o.tenantId === tenant.id
              );
              const isExpanded = expandedTenantIds.has(tenant.id);

              return (
                <Collapsible
                  key={tenant.id}
                  open={isExpanded}
                  onOpenChange={() => toggleTenant(tenant.id)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 h-auto"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        )}
                        <Building2 className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{tenant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tenantOrgs.length} {tenantOrgs.length === 1 ? 'org' : 'orgs'}
                          </div>
                        </div>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="pl-6 pr-3 pb-2 space-y-1">
                        {tenantOrgs.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            No organizations
                          </p>
                        ) : (
                          tenantOrgs.map((org) => (
                            <Button
                              key={org.id}
                              variant={selectedOrgId === org.id ? 'secondary' : 'ghost'}
                              className="w-full justify-start px-3 py-2 h-auto"
                              onClick={() => handleOrgSelect(org.id)}
                            >
                              <Building2 className="h-3 w-3 mr-2 flex-shrink-0 text-green-600" />
                              <div className="flex-1 text-left">
                                <div className="text-sm">{org.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {org.domain}
                                </div>
                              </div>
                              {selectedOrgId === org.id && (
                                <DollarSign className="h-3 w-3 text-green-600" />
                              )}
                            </Button>
                          ))
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Cost Classification Manager */}
      <div className="lg:col-span-2">
        {selectedOrg ? (
          <CostClassificationManager
            key={selectedOrg.id}
            organizationId={selectedOrg.id}
            organizationName={selectedOrg.name}
          />
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">No Organization Selected</p>
                <p className="text-sm">
                  Select an organization from the left panel to manage cost classifications
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
