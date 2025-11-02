import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon, Plus } from 'lucide-react';
import { InputData, ProcessData, createDefaultProcess, GlobalDefaults } from './utils/calculations';
import { ProcessEditor } from './ProcessEditor';
import { GlobalSettingsWarningDialog } from './GlobalSettingsWarningDialog';

interface InputsScreenProps {
  data: InputData;
  onChange: (data: InputData) => void;
  onCalculate: () => void;
}

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "number", 
  prefix = "", 
  suffix = "", 
  tooltip,
  min = 0
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  tooltip: string;
  min?: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <Input
        type={type}
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-16' : 'pr-3'}`}
        min={min}
      />
      {suffix && (
        <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10 whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export function InputsScreen({ data, onChange, onCalculate }: InputsScreenProps) {
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    field: keyof GlobalDefaults | null;
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

  // Map of global default fields to their corresponding process implementation fields
  const globalToProcessFieldMap: Record<string, keyof ProcessData['implementationCosts']> = {
    softwareCost: 'softwareCost',
    automationCoverage: 'automationCoverage',
    implementationTimelineMonths: 'implementationTimelineMonths',
    upfrontCosts: 'upfrontCosts',
    trainingCosts: 'trainingCosts',
    consultingCosts: 'consultingCosts',
  };

  // Field name map for user-friendly display
  const fieldDisplayNames: Record<string, string> = {
    averageHourlyWage: 'Average Hourly Wage',
    automationCoverage: 'Automation Coverage',
    overtimeMultiplier: 'Overtime Multiplier',
    softwareCost: 'Software Cost',
    implementationTimelineMonths: 'Implementation Timeline',
    upfrontCosts: 'Upfront Costs',
    trainingCosts: 'Training Costs',
    consultingCosts: 'Consulting Costs',
    tempStaffCostPerHour: 'Temp Staff Hourly Rate',
    overtimeRate: 'Overtime Rate',
  };

  // Check if any processes have individual settings that differ from global
  const getProcessesWithIndividualSettings = (field: keyof GlobalDefaults, newValue: any): string[] => {
    const processField = globalToProcessFieldMap[field];
    if (!processField) return [];

    return data.processes
      .filter(process => {
        // Only check processes that are not using global settings
        if (process.implementationCosts.useGlobalSettings) return false;
        
        // Check if the individual value differs from the new global value
        const currentValue = process.implementationCosts[processField];
        return currentValue !== newValue;
      })
      .map(process => process.name);
  };

  // Check if there are processes with any individual cost settings (not using global)
  const hasProcessesWithIndividualCosts = (): boolean => {
    return data.processes.some(process => !process.implementationCosts.useGlobalSettings);
  };

  const updateGlobalDefaults = (field: keyof GlobalDefaults, value: any) => {
    // Check if this field affects process costs and if there are processes with individual settings
    const affectedProcesses = getProcessesWithIndividualSettings(field, value);
    
    if (affectedProcesses.length > 0) {
      // Show warning dialog
      setWarningDialog({
        open: true,
        field,
        value,
        affectedProcesses,
        settingName: fieldDisplayNames[field] || field,
      });
    } else {
      // No affected processes, apply change immediately
      applyGlobalDefaultChange(field, value, false);
    }
  };

  const applyGlobalDefaultChange = (field: keyof GlobalDefaults, value: any, applyToAll: boolean) => {
    const newData = { 
      ...data, 
      globalDefaults: { ...data.globalDefaults, [field]: value }
    };

    // If user chose to apply to all processes
    if (applyToAll && globalToProcessFieldMap[field]) {
      const processField = globalToProcessFieldMap[field];
      newData.processes = data.processes.map(process => ({
        ...process,
        implementationCosts: {
          ...process.implementationCosts,
          [processField]: value,
        }
      }));
    }

    onChange(newData);
  };

  const handleWarningConfirm = () => {
    if (warningDialog.field && warningDialog.value !== null) {
      applyGlobalDefaultChange(warningDialog.field, warningDialog.value, true);
    }
    setWarningDialog({ open: false, field: null, value: null, affectedProcesses: [], settingName: '' });
  };

  const handleWarningCancel = () => {
    if (warningDialog.field && warningDialog.value !== null) {
      applyGlobalDefaultChange(warningDialog.field, warningDialog.value, false);
    }
    setWarningDialog({ open: false, field: null, value: null, affectedProcesses: [], settingName: '' });
  };

  const updateProcess = (processId: string, updatedProcess: ProcessData) => {
    const updatedProcesses = data.processes.map(process =>
      process.id === processId ? updatedProcess : process
    );
    onChange({ ...data, processes: updatedProcesses });
  };

  const addProcess = () => {
    // Calculate next start month based on existing processes
    const lastEndMonth = Math.max(...data.processes.map(p => p.implementationCosts.startMonth + 
      p.implementationCosts.implementationTimelineMonths), 0);
    
    const newProcess = createDefaultProcess(
      `proc-${Date.now()}`,
      `Process ${data.processes.length + 1}`,
      lastEndMonth + 1,
      '',
      data.globalDefaults
    );
    onChange({ ...data, processes: [...data.processes, newProcess] });
  };

  const deleteProcess = (processId: string) => {
    if (data.processes.length > 1) {
      const updatedProcesses = data.processes.filter(process => process.id !== processId);
      onChange({ ...data, processes: updatedProcesses });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1>Advanced ValuDock</h1>
        <p className="text-muted-foreground">
          Configure detailed parameters to calculate comprehensive automation ROI including seasonal patterns and task types
        </p>
      </div>

      {/* Global Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Default Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            These settings serve as defaults for new processes. Individual processes can override these values.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Process Defaults */}
          <div>
            <h3 className="mb-4 text-sm sm:text-base">Process Defaults</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <InputField
                label="Average Hourly Wage"
                value={data.globalDefaults.averageHourlyWage}
                onChange={(value) => updateGlobalDefaults('averageHourlyWage', value)}
                prefix="$"
                tooltip="Default hourly wage for employees working on processes"
              />

              <InputField
                label="Automation Coverage"
                value={data.globalDefaults.automationCoverage}
                onChange={(value) => updateGlobalDefaults('automationCoverage', value)}

                tooltip="Default percentage of tasks that can be automated"
              />

              <InputField
                label="Overtime Multiplier"
                value={data.globalDefaults.overtimeMultiplier}
                onChange={(value) => updateGlobalDefaults('overtimeMultiplier', value)}
                tooltip="Default multiplier for overtime rates"
              />
            </div>
          </div>

          {/* Implementation Defaults */}
          <div>
            <h3 className="mb-4 text-sm sm:text-base">Implementation Defaults</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              <InputField
                label="Software Cost"
                value={data.globalDefaults.softwareCost}
                onChange={(value) => updateGlobalDefaults('softwareCost', value)}
                prefix="$"

                tooltip="Default monthly cost of automation software per process"
              />

              <InputField
                label="Implementation Timeline"
                value={data.globalDefaults.implementationTimelineMonths}
                onChange={(value) => updateGlobalDefaults('implementationTimelineMonths', value)}

                tooltip="Default time to implement automation for a process"
              />

              <InputField
                label="Upfront Costs"
                value={data.globalDefaults.upfrontCosts}
                onChange={(value) => updateGlobalDefaults('upfrontCosts', value)}
                prefix="$"
                tooltip="Default one-time setup and configuration costs"
              />

              <InputField
                label="Training Costs"
                value={data.globalDefaults.trainingCosts}
                onChange={(value) => updateGlobalDefaults('trainingCosts', value)}
                prefix="$"
                tooltip="Default cost to train staff on new automated processes"
              />

              <InputField
                label="Consulting Costs"
                value={data.globalDefaults.consultingCosts}
                onChange={(value) => updateGlobalDefaults('consultingCosts', value)}
                prefix="$"
                tooltip="Default cost for external consulting and implementation support"
              />
            </div>
          </div>

          {/* Other Global Settings */}
          <div>
            <h3 className="mb-4">Other Global Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Temp Staff Hourly Rate"
                value={data.globalDefaults.tempStaffCostPerHour}
                onChange={(value) => updateGlobalDefaults('tempStaffCostPerHour', value)}
                prefix="$"
                tooltip="Cost per hour for temporary staff during peak periods"
              />

              <InputField
                label="Overtime Rate"
                value={data.globalDefaults.overtimeRate}
                onChange={(value) => updateGlobalDefaults('overtimeRate', value)}
                prefix="$"
                tooltip="Hourly rate paid for overtime work, typically 1.5x regular rate"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Processes</h2>
          <Button onClick={addProcess} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Process
          </Button>
        </div>

        <div className="space-y-4">
          {data.processes.map((process) => (
            <ProcessEditor
              key={process.id}
              process={process}
              globalDefaults={data.globalDefaults}
              onChange={(updatedProcess) => updateProcess(process.id, updatedProcess)}
              onDelete={data.processes.length > 1 ? () => deleteProcess(process.id) : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onCalculate}
          size="lg"
          className="min-w-48"
        >
          Calculate Advanced ROI
        </Button>
      </div>

      {/* Warning Dialog for Global Settings */}
      <GlobalSettingsWarningDialog
        open={warningDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            handleWarningCancel();
          }
        }}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        affectedProcesses={warningDialog.affectedProcesses}
        settingName={warningDialog.settingName}
      />
    </div>
  );
}