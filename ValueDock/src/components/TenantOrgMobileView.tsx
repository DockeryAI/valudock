import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Building2, Users, User, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { isValidDomain } from '../utils/domainValidation';

interface TenantOrgMobileViewProps {
  tenants: any[];
  organizations: any[];
  users: any[];
  onCreateTenant: (data: any) => Promise<void>;
  onUpdateTenant: (id: string, data: any) => Promise<void>;
  onDeleteTenant: (id: string) => Promise<void>;
  onCreateOrg: (data: any) => Promise<void>;
  onUpdateOrg: (id: string, data: any) => Promise<void>;
  onDeleteOrg: (id: string) => Promise<void>;
  currentUserRole: string;
  currentTenantId?: string;
}

export function TenantOrgMobileView({
  tenants,
  organizations,
  users,
  onCreateTenant,
  onUpdateTenant,
  onDeleteTenant,
  onCreateOrg,
  onUpdateOrg,
  onDeleteOrg,
  currentUserRole,
  currentTenantId,
}: TenantOrgMobileViewProps) {
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [showNewTenantDialog, setShowNewTenantDialog] = useState(false);
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    domain: '',
    settings: { brandName: '', primaryColor: '#0ea5e9', logoUrl: '' }
  });
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    companyName: '',
    domain: '',
    description: '',
    tenantId: currentTenantId || ''
  });

  const getTenantOrgCount = (tenantId: string) => {
    return organizations.filter(o => o.tenantId === tenantId).length;
  };

  const getTenantUserCount = (tenantId: string) => {
    return users.filter(u => u.tenantId === tenantId).length;
  };

  const getOrgUserCount = (orgId: string) => {
    return users.filter(u => u.organizationId === orgId).length;
  };

  const handleCreateTenant = async () => {
    try {
      if (!newTenantData.name || !newTenantData.domain) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (!isValidDomain(newTenantData.domain)) {
        toast.error('Please enter a valid domain name (e.g., tenant.com)');
        return;
      }
      
      await onCreateTenant(newTenantData);
      setShowNewTenantDialog(false);
      setNewTenantData({
        name: '',
        domain: '',
        settings: { brandName: '', primaryColor: '#0ea5e9', logoUrl: '' }
      });
      toast.success('Tenant created successfully');
    } catch (error) {
      toast.error('Failed to create tenant');
    }
  };

  // Domain validation helper
  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const handleCreateOrg = async () => {
    try {
      if (!newOrgData.name || !newOrgData.companyName || !newOrgData.domain) {
        toast.error('Please fill in all required fields: name, company name, and domain');
        return;
      }
      
      if (!isValidDomain(newOrgData.domain)) {
        toast.error('Please enter a valid domain name (e.g., company.com)');
        return;
      }
      
      await onCreateOrg(newOrgData);
      setShowNewOrgDialog(false);
      setNewOrgData({
        name: '',
        companyName: '',
        domain: '',
        description: '',
        tenantId: currentTenantId || ''
      });
      toast.success('Organization created successfully');
    } catch (error) {
      toast.error('Failed to create organization');
    }
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    try {
      await onUpdateTenant(selectedTenant.id, selectedTenant);
      setShowTenantDialog(false);
      toast.success('Tenant updated successfully');
    } catch (error) {
      toast.error('Failed to update tenant');
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will also delete all associated organizations and users. This action cannot be undone.')) return;
    
    try {
      await onDeleteTenant(id);
      setShowTenantDialog(false);
      toast.success('Tenant deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tenant');
    }
  };

  const handleUpdateOrg = async () => {
    if (!selectedOrg) return;
    try {
      await onUpdateOrg(selectedOrg.id, selectedOrg);
      setShowOrgDialog(false);
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error('Failed to update organization');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This will also delete all associated users. This action cannot be undone.')) return;
    
    try {
      await onDeleteOrg(id);
      setShowOrgDialog(false);
      toast.success('Organization deleted successfully');
    } catch (error) {
      toast.error('Failed to delete organization');
    }
  };

  // Tenant Management View (for master_admin)
  if (currentUserRole === 'master_admin') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Tenants</h3>
          <Button size="sm" onClick={() => setShowNewTenantDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {tenants.map((tenant) => (
          <Card 
            key={tenant.id} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => {
              setSelectedTenant(tenant);
              setShowTenantDialog(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div className="font-medium">{tenant.name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {tenant.domain}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{getTenantOrgCount(tenant.id)} orgs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{getTenantUserCount(tenant.id)} users</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}

        {tenants.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tenants yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}

        {/* New Tenant Dialog */}
        <Dialog open={showNewTenantDialog} onOpenChange={setShowNewTenantDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>Add a new tenant partner</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tenant Name *</Label>
                <Input
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <Label>Domain *</Label>
                <Input
                  value={newTenantData.domain}
                  onChange={(e) => setNewTenantData({ ...newTenantData, domain: e.target.value })}
                  placeholder="acme.com"
                />
              </div>
              <div>
                <Label>Brand Name</Label>
                <Input
                  value={newTenantData.settings.brandName}
                  onChange={(e) => setNewTenantData({ 
                    ...newTenantData, 
                    settings: { ...newTenantData.settings, brandName: e.target.value }
                  })}
                  placeholder="Acme ValueDock"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTenantDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTenant}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tenant Details Dialog */}
        <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tenant Details</DialogTitle>
            </DialogHeader>
            {selectedTenant && (
              <div className="space-y-4">
                <div>
                  <Label>Tenant Name</Label>
                  <Input
                    value={selectedTenant.name}
                    onChange={(e) => setSelectedTenant({ ...selectedTenant, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Domain</Label>
                  <Input
                    value={selectedTenant.domain}
                    onChange={(e) => setSelectedTenant({ ...selectedTenant, domain: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={selectedTenant.settings?.brandName || ''}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      settings: { ...selectedTenant.settings, brandName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={selectedTenant.settings?.primaryColor || '#0ea5e9'}
                    onChange={(e) => setSelectedTenant({ 
                      ...selectedTenant, 
                      settings: { ...selectedTenant.settings, primaryColor: e.target.value }
                    })}
                  />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{getTenantOrgCount(selectedTenant.id)} organizations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{getTenantUserCount(selectedTenant.id)} users</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTenantDialog(false)}>
                Close
              </Button>
              <Button onClick={handleUpdateTenant}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Organization Management View (for tenant_admin and org_admin)
  const filteredOrgs = currentUserRole === 'tenant_admin' 
    ? organizations.filter(o => o.tenantId === currentTenantId)
    : organizations;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Organizations</h3>
        {currentUserRole === 'tenant_admin' && (
          <Button size="sm" onClick={() => setShowNewOrgDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>

      {filteredOrgs.map((org) => (
        <Card 
          key={org.id} 
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => {
            setSelectedOrg(org);
            setShowOrgDialog(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div className="font-medium">{org.companyName || org.name}</div>
                </div>
                {org.domain && (
                  <div className="text-sm text-muted-foreground mb-1">
                    {org.domain}
                  </div>
                )}
                {org.description && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {org.description}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{getOrgUserCount(org.id)} users</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredOrgs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No organizations yet. Create one to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* New Org Dialog */}
      <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>Add a new client company</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Short Name *</Label>
              <Input
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                placeholder="acme-corp"
              />
              <p className="text-xs text-muted-foreground mt-1">Short identifier</p>
            </div>
            <div>
              <Label>Company Name *</Label>
              <Input
                value={newOrgData.companyName}
                onChange={(e) => setNewOrgData({ ...newOrgData, companyName: e.target.value })}
                placeholder="Acme Corporation"
              />
              <p className="text-xs text-muted-foreground mt-1">Full company name</p>
            </div>
            <div>
              <Label>Domain *</Label>
              <Input
                value={newOrgData.domain}
                onChange={(e) => setNewOrgData({ ...newOrgData, domain: e.target.value })}
                placeholder="acme.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Company domain</p>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newOrgData.description}
                onChange={(e) => setNewOrgData({ ...newOrgData, description: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewOrgDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Org Details Dialog */}
      <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div>
                <Label>Short Name</Label>
                <Input
                  value={selectedOrg.name}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={selectedOrg.companyName || selectedOrg.name}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label>Domain</Label>
                <Input
                  value={selectedOrg.domain || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, domain: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={selectedOrg.description || ''}
                  onChange={(e) => setSelectedOrg({ ...selectedOrg, description: e.target.value })}
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{getOrgUserCount(selectedOrg.id)} users</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {currentUserRole === 'tenant_admin' && (
              <Button 
                variant="destructive" 
                onClick={() => selectedOrg && handleDeleteOrg(selectedOrg.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowOrgDialog(false)}>
              Close
            </Button>
            {currentUserRole === 'tenant_admin' && (
              <Button onClick={handleUpdateOrg}>Save Changes</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
