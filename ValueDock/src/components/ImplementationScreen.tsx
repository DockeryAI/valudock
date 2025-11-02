import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { InputData, GlobalDefaults, ProcessData } from './utils/calculations';
import { Settings, DollarSign, Calendar, Info, ChevronDown, ChevronRight, Zap, Clock, Save } from 'lucide-react';
import { GlobalSettingsWarningDialog } from './GlobalSettingsWarningDialog';

interface ImplementationScreenProps {
  data: InputData;
  onChange: (data: InputData) => void;
}

export function ImplementationScreen({ data, onChange }: ImplementationScreenProps) {
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['ungrouped']));
  const [pendingGlobalSettings, setPendingGlobalSettings] = useState<GlobalDefaults | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    field: string | null;
    value: any;
    affectedProcesses: string[];
    settingName: string;
  }>({
    open: false,
    field: null,
    value: null,
    affectedProcesses: [],
    settingName: '',
  });

  // Reset pending changes when data changes from outside
  useEffect(() => {
    setPendingGlobalSettings(null);
    setHasUnsavedChanges(false);
  }, [data.globalDefaults]);

  const toggleProcessExpansion = (processId: string) => {
    const newExpanded = new Set(expandedProcesses);
    if (newExpanded.has(processId)) {
      newExpanded.delete(processId);
    } else {
      newExpanded.add(processId);
    }
    setExpandedProcesses(newExpanded);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const updateProcess = (processId: string, updatedProcess: any) => {
    const updatedProcesses = data.processes.map(p => 
      p.id === processId ? updatedProcess : p
    );
    onChange({ ...data, processes: updatedProcesses });
  };

  // Update pending global settings without saving
  const updatePendingGlobalSettings = (field: string, value: any) => {
    const currentSettings = pendingGlobalSettings || data.globalDefaults;
    setPendingGlobalSettings({ ...currentSettings, [field]: value });
    setHasUnsavedChanges(true);
  };

  // Field name map for user-friendly display
  const fieldDisplayNames: Record<string, string> = {
    softwareCost: 'Software Cost',
    automationCoverage: 'Automation Coverage',
    implementationTimelineMonths: 'Implementation Timeline',
    upfrontCosts: 'Upfront Costs',
    trainingCosts: 'Training Costs',
    consultingCosts: 'Consulting Costs',
  };

  // Map of global default fields to their corresponding process implementation fields
  const globalToProcessFieldMap: Record<string, keyof ProcessData['implementationCosts']> = {
    softwareCost: 'softwareCost',
    automationCoverage: 'automationCoverage',
    implementationTimelineMonths: 'implementationTimelineMonths',
    upfrontCosts: 'upfrontCosts',
    trainingCosts: 'trainingCosts',
    consultingCosts: 'consultingCosts',
  };

  // Check if any processes have individual settings that differ from new global value
  const getProcessesWithIndividualSettings = (newSettings: GlobalDefaults): { field: string; processes: string[] }[] => {
    const conflicts: { field: string; processes: string[] }[] = [];
    
    Object.keys(globalToProcessFieldMap).forEach(field => {
      const processField = globalToProcessFieldMap[field];
      const newValue = (newSettings as any)[field];
      
      const affectedProcesses = data.processes
        .filter(process => {
          // Only check processes that are not using global settings
          if (process.implementationCosts.useGlobalSettings) return false;
          
          // Check if the individual value differs from the new global value
          const currentValue = process.implementationCosts[processField];
          return currentValue !== newValue;
        })
        .map(process => process.name);
      
      if (affectedProcesses.length > 0) {
        conflicts.push({ field, processes: affectedProcesses });
      }
    });
    
    return conflicts;
  };

  // Apply global settings with or without overriding individual settings
  const applyGlobalSettings = (applyToAll: boolean) => {
    if (!pendingGlobalSettings) return;

    const updatedGlobalDefaults = pendingGlobalSettings;
    let updatedProcesses = data.processes;

    // If user chose to apply to all processes, update all processes
    if (applyToAll) {
      updatedProcesses = data.processes.map(process => {
        const updatedImplementationCosts = { ...process.implementationCosts };
        
        Object.keys(globalToProcessFieldMap).forEach(field => {
          const processField = globalToProcessFieldMap[field];
          updatedImplementationCosts[processField] = (updatedGlobalDefaults as any)[field];
        });
        
        return {
          ...process,
          implementationCosts: updatedImplementationCosts
        };
      });
    } else {
      // Only update processes that use global settings
      updatedProcesses = data.processes.map(process => {
        if (process.implementationCosts.useGlobalSettings) {
          const updatedImplementationCosts = { ...process.implementationCosts };
          
          Object.keys(globalToProcessFieldMap).forEach(field => {
            const processField = globalToProcessFieldMap[field];
            updatedImplementationCosts[processField] = (updatedGlobalDefaults as any)[field];
          });
          
          return {
            ...process,
            implementationCosts: updatedImplementationCosts
          };
        }
        return process;
      });
    }

    onChange({
      ...data,
      processes: updatedProcesses,
      globalDefaults: updatedGlobalDefaults
    });

    // Clear pending changes
    setPendingGlobalSettings(null);
    setHasUnsavedChanges(false);
  };

  // Handle save button click
  const handleSaveGlobalSettings = () => {
    if (!pendingGlobalSettings) return;

    // Check for conflicts
    const conflicts = getProcessesWithIndividualSettings(pendingGlobalSettings);
    
    if (conflicts.length > 0) {
      // Show warning dialog with all affected processes
      const allAffectedProcesses = conflicts.flatMap(c => c.processes);
      const uniqueProcesses = Array.from(new Set(allAffectedProcesses));
      
      setWarningDialog({
        open: true,
        field: 'multiple',
        value: pendingGlobalSettings,
        affectedProcesses: uniqueProcesses,
        settingName: 'Global Implementation Settings',
      });
    } else {
      // No conflicts, apply immediately
      applyGlobalSettings(false);
    }
  };

  const handleWarningConfirm = () => {
    applyGlobalSettings(true);
    setWarningDialog({ open: false, field: null, value: null, affectedProcesses: [], settingName: '' });
  };

  const handleWarningCancel = () => {
    applyGlobalSettings(false);
    setWarningDialog({ open: false, field: null, value: null, affectedProcesses: [], settingName: '' });
  };

  // Get the current display values (pending or saved)
  const displaySettings = pendingGlobalSettings || data.globalDefaults;

  const totalMonthlySoftwareCosts = data.processes.reduce((sum, process) => {
    return sum + process.implementationCosts.softwareCost;
  }, 0);

  const totalUpfrontCosts = data.processes.reduce((sum, process) => {
    return sum + process.implementationCosts.upfrontCosts + 
           process.implementationCosts.trainingCosts + 
           process.implementationCosts.consultingCosts;
  }, 0);

  const groupedProcesses = React.useMemo(() => {
    const grouped: { [key: string]: ProcessData[] } = {};
    
    data.processes.forEach(process => {
      const groupId = process.group || 'ungrouped';
      if (!grouped[groupId]) {
        grouped[groupId] = [];
      }
      grouped[groupId].push(process);
    });
    
    return grouped;
  }, [data.processes]);

  const getGroupName = (groupId: string) => {
    if (groupId === 'ungrouped') return 'Ungrouped Processes';
    const group = data.groups.find(g => g.id === groupId);
    return group?.name || groupId;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl">Implementation Costs & Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure software costs, implementation timeline, and setup expenses for each automation process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Monthly Software</p>
              <p className="text-xl font-semibold">${Math.ceil(totalMonthlySoftwareCosts).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Upfront Costs</p>
              <p className="text-xl font-semibold">${Math.ceil(totalUpfrontCosts).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Active Processes</p>
              <p className="text-xl font-semibold">{data.processes.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg">
              <Settings className="h-4 w-4" />
              Global Implementation Settings
            </div>
            {hasUnsavedChanges && (
              <Button
                onClick={handleSaveGlobalSettings}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Global Settings
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="py-2">
            <Info className="h-3 w-3" />
            <AlertDescription className="text-xs">
              These settings will be used as defaults for processes that have &quot;Use global implementation settings&quot; enabled.
              {hasUnsavedChanges && <span className="text-orange-600 font-medium ml-2">• Unsaved changes</span>}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Software Cost (Monthly)</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none z-10">$</span>
                <input
                  type="number"
                  className={`w-full pl-6 pr-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                  value={displaySettings.softwareCost === 0 ? '' : displaySettings.softwareCost}
                  onChange={(e) => updatePendingGlobalSettings('softwareCost', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Automation %</label>
              <input
                type="number"
                className={`w-full px-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                value={displaySettings.automationCoverage === 0 ? '' : displaySettings.automationCoverage}
                onChange={(e) => updatePendingGlobalSettings('automationCoverage', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Timeline (weeks)</label>
              <input
                type="number"
                className={`w-full px-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                value={displaySettings.implementationTimelineMonths === 0 ? '' : displaySettings.implementationTimelineMonths}
                onChange={(e) => updatePendingGlobalSettings('implementationTimelineMonths', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Upfront Setup</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                <input
                  type="number"
                  className={`w-full pl-6 px-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                  value={displaySettings.upfrontCosts === 0 ? '' : displaySettings.upfrontCosts}
                  onChange={(e) => updatePendingGlobalSettings('upfrontCosts', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Training Costs</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                <input
                  type="number"
                  className={`w-full pl-6 px-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                  value={displaySettings.trainingCosts === 0 ? '' : displaySettings.trainingCosts}
                  onChange={(e) => updatePendingGlobalSettings('trainingCosts', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Consulting Costs</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                <input
                  type="number"
                  className={`w-full pl-6 px-2 py-1.5 border rounded-md text-xs ${hasUnsavedChanges ? 'border-orange-400 bg-orange-50' : ''}`}
                  value={displaySettings.consultingCosts === 0 ? '' : displaySettings.consultingCosts}
                  onChange={(e) => updatePendingGlobalSettings('consultingCosts', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <GlobalSettingsWarningDialog
        open={warningDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setWarningDialog({ open: false, field: null, value: null, affectedProcesses: [], settingName: '' });
          }
        }}
        affectedProcesses={warningDialog.affectedProcesses}
        settingName={warningDialog.settingName}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Process Automation Details</h2>
          <Badge variant="outline" className="text-xs">
            {data.processes.length} Processes
          </Badge>
        </div>

        {Object.entries(groupedProcesses).map(([groupId, processes]) => (
          <Card key={groupId} className="overflow-hidden">
            <Collapsible
              open={expandedGroups.has(groupId)}
              onOpenChange={() => toggleGroupExpansion(groupId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedGroups.has(groupId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-base">{getGroupName(groupId)}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {processes.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  {processes.map((process) => (
                    <CompactProcessEditor
                      key={process.id}
                      process={process}
                      globalDefaults={data.globalDefaults}
                      onChange={(updatedProcess) => updateProcess(process.id, updatedProcess)}
                      isExpanded={expandedProcesses.has(process.id)}
                      onToggleExpansion={() => toggleProcessExpansion(process.id)}
                    />
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {data.processes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Processes Configured</h3>
              <p className="text-muted-foreground mb-4">
                You need to configure your business processes first before setting up implementation costs.
              </p>
              <Button variant="outline">
                Go to Process Inputs
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface CompactProcessEditorProps {
  process: ProcessData;
  globalDefaults: GlobalDefaults;
  onChange: (process: ProcessData) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

function CompactProcessEditor({ 
  process, 
  globalDefaults, 
  onChange, 
  isExpanded, 
  onToggleExpansion 
}: CompactProcessEditorProps) {
  
  React.useEffect(() => {
    const expectedITHours = Math.ceil(process.fteCount * 2);
    if (process.implementationCosts.itSupportHoursPerMonth !== expectedITHours) {
      onChange({ 
        ...process, 
        implementationCosts: { 
          ...process.implementationCosts, 
          itSupportHoursPerMonth: expectedITHours 
        }
      });
    }
  }, [process.fteCount]);
  
  const updateImplementationCosts = (field: string, value: any) => {
    onChange({ 
      ...process, 
      implementationCosts: { ...process.implementationCosts, [field]: value }
    });
  };

  const totalUpfrontCosts = process.implementationCosts.upfrontCosts + 
    process.implementationCosts.trainingCosts + 
    process.implementationCosts.consultingCosts;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: process.implementationCosts.useGlobalSettings ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-2 px-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{process.name}</span>
                {process.implementationCosts.useGlobalSettings && (
                  <Badge variant="outline" className="text-xs px-1 py-0">Global</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs flex-shrink-0">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-medium">${Math.ceil(process.implementationCosts.softwareCost)}/mo</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{process.implementationCosts.automationCoverage}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{process.implementationCosts.implementationTimelineMonths}w</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-3 py-3 space-y-3 border-t">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <Label className="text-xs font-medium">Use Global Settings</Label>
              <Checkbox
                checked={process.implementationCosts.useGlobalSettings}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange({
                      ...process,
                      implementationCosts: {
                        ...process.implementationCosts,
                        useGlobalSettings: true,
                        softwareCost: globalDefaults.softwareCost,
                        automationCoverage: globalDefaults.automationCoverage,
                        implementationTimelineMonths: globalDefaults.implementationTimelineMonths,
                        upfrontCosts: globalDefaults.upfrontCosts,
                        trainingCosts: globalDefaults.trainingCosts,
                        consultingCosts: globalDefaults.consultingCosts
                      }
                    });
                  } else {
                    updateImplementationCosts('useGlobalSettings', false);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold">Automation Strategy</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Coverage %</label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded text-xs"
                    value={process.implementationCosts.automationCoverage === 0 ? '' : process.implementationCosts.automationCoverage}
                    onChange={(e) => updateImplementationCosts('automationCoverage', parseFloat(e.target.value) || 0)}
                    disabled={process.implementationCosts.useGlobalSettings}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Software Cost (Monthly)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-2 py-1 border rounded text-xs"
                      value={process.implementationCosts.softwareCost === 0 ? '' : process.implementationCosts.softwareCost}
                      onChange={(e) => updateImplementationCosts('softwareCost', parseFloat(e.target.value) || 0)}
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <h4 className="text-xs font-semibold">One-time Costs (Total: ${Math.ceil(totalUpfrontCosts).toLocaleString()})</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Setup</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-1 py-1 border rounded text-xs"
                      value={process.implementationCosts.upfrontCosts === 0 ? '' : process.implementationCosts.upfrontCosts}
                      onChange={(e) => updateImplementationCosts('upfrontCosts', parseFloat(e.target.value) || 0)}
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Training</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-1 py-1 border rounded text-xs"
                      value={process.implementationCosts.trainingCosts === 0 ? '' : process.implementationCosts.trainingCosts}
                      onChange={(e) => updateImplementationCosts('trainingCosts', parseFloat(e.target.value) || 0)}
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Consulting</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-1 py-1 border rounded text-xs"
                      value={process.implementationCosts.consultingCosts === 0 ? '' : process.implementationCosts.consultingCosts}
                      onChange={(e) => updateImplementationCosts('consultingCosts', parseFloat(e.target.value) || 0)}
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <h4 className="text-xs font-semibold">System Integration</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">API Licensing</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-1 py-1 border rounded text-xs"
                      value={process.implementationCosts.apiLicensing === 0 ? '' : process.implementationCosts.apiLicensing}
                      onChange={(e) => updateImplementationCosts('apiLicensing', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">IT Support (hrs/mo)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded text-xs bg-muted/50"
                    value={parseFloat((process.implementationCosts.itSupportHoursPerMonth * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1))}
                    disabled={true}
                    title={`Auto-calculated: ${process.implementationCosts.itSupportHoursPerMonth} hrs × (1 - ${process.implementationCosts.automationCoverage}%)`}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">IT Hourly Rate</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <input
                      type="number"
                      className="w-full pl-6 pr-1 py-1 border rounded text-xs"
                      value={process.implementationCosts.itHourlyRate === 0 ? '' : process.implementationCosts.itHourlyRate}
                      onChange={(e) => updateImplementationCosts('itHourlyRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <h4 className="text-xs font-semibold">Implementation Timeline</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Timeline (weeks)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded text-xs"
                    value={process.implementationCosts.implementationTimelineMonths === 0 ? '' : process.implementationCosts.implementationTimelineMonths}
                    onChange={(e) => updateImplementationCosts('implementationTimelineMonths', parseFloat(e.target.value) || 0)}
                    disabled={process.implementationCosts.useGlobalSettings}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Start Week</label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded text-xs"
                    value={process.implementationCosts.startMonth === 0 ? '' : process.implementationCosts.startMonth}
                    onChange={(e) => updateImplementationCosts('startMonth', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
