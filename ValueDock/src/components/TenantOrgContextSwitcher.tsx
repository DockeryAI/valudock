/**
 * TenantOrgContextSwitcher - Hierarchical context switching for multi-tenant admins
 * 
 * Allows admins to switch between tenants/organizations they manage:
 * - Global Admin: Can switch to any tenant → any org
 * - Tenant Admin: Can switch to any org within their tenant
 * - Org Admin: Shows current org only (no switching)
 * - Regular User: Shows current org only (no switching)
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Check, ChevronsUpDown, Building2, Users, Globe } from 'lucide-react';
import { cn } from './ui/utils';
import { UserProfile, hasRole } from '../utils/auth';

interface TenantOrgContextSwitcherProps {
  currentUser: UserProfile;
  tenants: any[];
  organizations: any[];
  selectedTenantId: string | null;
  selectedOrgId: string | null;
  onTenantChange: (tenantId: string | null) => void;
  onOrgChange: (orgId: string | null) => void;
}

export function TenantOrgContextSwitcher({
  currentUser,
  tenants,
  organizations,
  selectedTenantId,
  selectedOrgId,
  onTenantChange,
  onOrgChange
}: TenantOrgContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isMasterAdmin = hasRole(currentUser, ['master_admin']);
  const isTenantAdmin = hasRole(currentUser, ['tenant_admin']);
  const isOrgAdmin = hasRole(currentUser, ['org_admin']);

  // For regular users and org admins, no switching is allowed
  if (!isMasterAdmin && !isTenantAdmin) {
    const userOrg = organizations.find(org => org.id === currentUser.organizationId);
    const userTenant = tenants.find(t => t.id === currentUser.tenantId);
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm truncate">{userOrg?.name || 'No Organization'}</span>
          {userTenant && (
            <span className="text-xs text-muted-foreground truncate">
              {userTenant.name}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Get available tenants for the user
  const availableTenants = isMasterAdmin 
    ? tenants 
    : tenants.filter(t => t.id === currentUser.tenantId);

  // Get available organizations for the user
  const availableOrgs = isMasterAdmin
    ? (selectedTenantId ? organizations.filter(org => org.tenantId === selectedTenantId) : organizations)
    : organizations.filter(org => org.tenantId === currentUser.tenantId);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  // Generate display text
  const getDisplayText = () => {
    if (selectedOrg && selectedTenant) {
      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm truncate">{selectedOrg.name}</span>
          <span className="text-xs text-muted-foreground truncate">{selectedTenant.name}</span>
        </div>
      );
    }
    if (selectedTenant && !selectedOrgId) {
      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm truncate">{selectedTenant.name}</span>
          <span className="text-xs text-muted-foreground">Select organization</span>
        </div>
      );
    }
    return <span className="text-sm">Select Organization</span>;
  };

  const handleSelectTenant = (tenantId: string | null) => {
    onTenantChange(tenantId);
    // Clear org selection when changing tenant
    if (tenantId !== selectedTenantId) {
      onOrgChange(null);
    }
  };

  const handleSelectOrg = (orgId: string | null) => {
    onOrgChange(orgId);
    // If selecting an org, also set its tenant
    if (orgId) {
      const org = organizations.find(o => o.id === orgId);
      if (org && org.tenantId !== selectedTenantId) {
        onTenantChange(org.tenantId);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedOrgId ? (
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
            ) : selectedTenantId ? (
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            {getDisplayText()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={selectedTenantId ? "Search organizations..." : "Search tenants..."} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Two-Level Navigation: Tenants → Organizations */}
            {isMasterAdmin && availableTenants.length > 0 && (
              <>
                <CommandGroup heading={selectedTenantId ? "Organizations" : "Select Tenant"}>
                  {/* If no tenant selected, show tenant list */}
                  {!selectedTenantId && availableTenants.map((tenant) => {
                    const tenantOrgs = organizations.filter(o => o.tenantId === tenant.id);
                    return (
                      <CommandItem
                        key={tenant.id}
                        value={`tenant ${tenant.name} ${tenant.domain || ''}`}
                        onSelect={() => {
                          handleSelectTenant(tenant.id);
                          // Don't close - let user select org next
                        }}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <div className="flex flex-col flex-1">
                          <span>{tenant.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {tenantOrgs.length} {tenantOrgs.length === 1 ? 'organization' : 'organizations'}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}

                  {/* If tenant is selected, show its organizations */}
                  {selectedTenantId && (
                    <>
                      {/* Back button to go back to tenant list */}
                      <CommandItem
                        value="back to tenants"
                        onSelect={() => {
                          handleSelectTenant(null);
                        }}
                        className="text-muted-foreground"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>← Back to Tenants</span>
                      </CommandItem>
                      
                      <CommandSeparator />
                      
                      {/* Show organizations under selected tenant */}
                      {availableOrgs.map((org) => (
                        <CommandItem
                          key={org.id}
                          value={`org ${org.name} ${org.companyName || ''}`}
                          onSelect={() => {
                            handleSelectOrg(org.id);
                            setOpen(false);
                          }}
                        >
                          <Users className="mr-2 h-4 w-4 text-primary" />
                          <span>{org.name}</span>
                          {selectedOrgId === org.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                      
                      {availableOrgs.length === 0 && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No organizations in this tenant
                        </div>
                      )}
                    </>
                  )}
                </CommandGroup>
              </>
            )}

            {/* Organization Selection for Tenant Admins */}
            {!isMasterAdmin && availableOrgs.length > 0 && (
              <>
                <CommandGroup heading="Select Organization">
                  {availableOrgs.map((org) => {
                    return (
                      <CommandItem
                        key={org.id}
                        value={`org ${org.name} ${org.companyName || ''}`}
                        onSelect={() => {
                          handleSelectOrg(org.id);
                          setOpen(false);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        <span>{org.name}</span>
                        {selectedOrgId === org.id && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {/* Show current context */}
            {selectedOrgId && selectedTenantId && (
              <>
                <CommandSeparator />
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{selectedOrg?.name}</span>
                    </div>
                    <span className="text-muted-foreground">in</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded">
                      <Building2 className="h-3 w-3" />
                      <span className="font-medium">{selectedTenant?.name}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
