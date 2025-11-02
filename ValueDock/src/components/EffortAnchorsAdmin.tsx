import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info, Save, RotateCcw, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile, hasRole, apiCall } from '../utils/auth';
import { toast } from 'sonner';

interface EffortAnchorsAdminProps {
  currentUser: UserProfile;
  globalDefaults: any;
  onSave: (anchors: { costTarget: number; timeTarget: number }) => void;
}

interface Organization {
  id: string;
  name: string;
  companyName?: string;
  tenantId: string;
}

export function EffortAnchorsAdmin({ currentUser, globalDefaults, onSave }: EffortAnchorsAdminProps) {
  const [costTarget, setCostTarget] = useState<number>(200000); // Updated default: $200K
  const [timeTarget, setTimeTarget] = useState<number>(12); // Updated default: 12 months
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Organization selection for master_admin and tenant_admin only
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(''); // No default selection
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Check if user can select organization - ONLY master_admin and tenant_admin
  const isMasterAdmin = hasRole(currentUser, ['master_admin']);
  const isTenantAdmin = hasRole(currentUser, ['tenant_admin']);
  const isOrgAdmin = hasRole(currentUser, ['org_admin']);
  const canManageEffortAnchors = isMasterAdmin || isTenantAdmin;

  // Hide this section completely for org admins
  if (isOrgAdmin) {
    return null;
  }

  // Load organizations for master_admin and tenant_admin
  useEffect(() => {
    const loadOrganizations = async () => {
      if (!canManageEffortAnchors) return;

      setLoadingOrgs(true);
      try {
        const data = await apiCall('/admin/organizations');
        const orgs = data.organizations || [];
        
        // Filter by tenant if tenant_admin
        const filteredOrgs = isTenantAdmin
          ? orgs.filter((org: Organization) => org.tenantId === currentUser.tenantId)
          : orgs;
        
        setOrganizations(filteredOrgs);
        
        // NO auto-selection - require explicit selection
        setSelectedOrgId('');
      } catch (error) {
        console.error('[EffortAnchorsAdmin] Failed to load organizations:', error);
        toast.error('Failed to load organizations');
      } finally {
        setLoadingOrgs(false);
      }
    };

    loadOrganizations();
  }, [currentUser, canManageEffortAnchors, isTenantAdmin]);

  // Load initial values from globalDefaults when organization is selected
  useEffect(() => {
    if (globalDefaults?.effortAnchors && selectedOrgId) {
      setCostTarget(globalDefaults.effortAnchors.costTarget || 200000);
      setTimeTarget(globalDefaults.effortAnchors.timeTarget || 12);
    }
  }, [globalDefaults, selectedOrgId]);

  const handleCostChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCostTarget(numValue);
    setHasChanges(true);
  };

  const handleTimeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setTimeTarget(numValue);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedOrgId) {
      toast.error('Please select an organization first');
      return;
    }

    if (!costTarget || costTarget <= 0) {
      toast.error('Cost target must be greater than 0');
      return;
    }
    if (!timeTarget || timeTarget <= 0) {
      toast.error('Time target must be greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      console.log('[EffortAnchorsAdmin] 💾 Saving effort anchors for org:', selectedOrgId, { costTarget, timeTarget });
      await onSave({ costTarget, timeTarget });
      setHasChanges(false);
      console.log('[EffortAnchorsAdmin] ✅ Effort anchors saved successfully');
      toast.success('Effort anchors updated successfully');
    } catch (error: any) {
      console.error('[EffortAnchorsAdmin] ❌ Failed to save effort anchors:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCostTarget(200000); // Updated default: $200K
    setTimeTarget(12); // Updated default: 12 months
    setHasChanges(true);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  Effort Calculation Anchors
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These anchors define what constitutes a "moderate effort" project for each organization.
                          Projects are scored relative to these benchmarks, not to each other.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure organization-level effort benchmarks
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Organization Selector - PROMINENT and MANDATORY */}
            <div className="space-y-2 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
              <Label htmlFor="orgSelect" className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                Select Organization *
              </Label>
              <Select
                value={selectedOrgId}
                onValueChange={setSelectedOrgId}
                disabled={loadingOrgs}
              >
                <SelectTrigger id="orgSelect" className="h-10 text-base">
                  <SelectValue placeholder={loadingOrgs ? "Loading organizations..." : "Choose an organization..."} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.companyName || org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isMasterAdmin 
                  ? '⚠️ You must select an organization before setting targets'
                  : '⚠️ Select an organization in your tenant to configure anchors'
                }
              </p>
            </div>

            {/* Warning if no organization selected */}
            {!selectedOrgId && (
              <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertDescription className="text-amber-900 dark:text-amber-100">
                  ⚠️ Please select an organization above to configure effort anchors.
                </AlertDescription>
              </Alert>
            )}

            {/* Effort Targets - Space Efficient Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Cost Target */}
              <div className="space-y-1.5">
                <Label htmlFor="costTarget" className="text-sm flex items-center gap-1">
                  Cost Target (USD)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Implementation cost for a "moderate effort" project. Default: $200,000
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="costTarget"
                  type="number"
                  value={costTarget}
                  onChange={(e) => handleCostChange(e.target.value)}
                  disabled={!selectedOrgId}
                  className={!selectedOrgId ? 'bg-muted cursor-not-allowed' : ''}
                  placeholder="200000"
                />
              </div>

              {/* Time Target */}
              <div className="space-y-1.5">
                <Label htmlFor="timeTarget" className="text-sm flex items-center gap-1">
                  Time Target (Months)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Implementation time for a "moderate effort" project. Default: 12 months
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="timeTarget"
                  type="number"
                  value={timeTarget}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!selectedOrgId}
                  className={!selectedOrgId ? 'bg-muted cursor-not-allowed' : ''}
                  placeholder="12"
                />
                <p className="text-xs text-muted-foreground">≈ {(timeTarget * 4.33).toFixed(0)} weeks</p>
              </div>
            </div>

            {/* Quadrant Thresholds Info - Compact */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs font-semibold mb-2">Quadrant Classification:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-300 dark:border-green-800">
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    🟩 Quick Wins
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    ROI ≥ 100% and Effort ≤ 40%
                  </div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded border border-blue-300 dark:border-blue-800">
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    🟦 Strategic Bets
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    ROI ≥ 100% and Effort &gt; 40%
                  </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded border border-yellow-300 dark:border-yellow-800">
                  <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                    🟨 Nice to Have
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    ROI &lt; 100% and Effort ≤ 40%
                  </div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-300 dark:border-red-800">
                  <div className="font-semibold text-red-900 dark:text-red-100">
                    🟥 Deprioritize
                  </div>
                  <div className="text-red-700 dark:text-red-300">
                    ROI &lt; 100% and Effort &gt; 40%
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!selectedOrgId}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving || !selectedOrgId}
                size="sm"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
