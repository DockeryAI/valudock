import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { InfoIcon, Trash2 } from 'lucide-react';
import { ProcessData, GlobalDefaults } from './utils/calculations';
import { useIsMobile } from './ui/use-mobile';
import { ProcessEditorMobile } from './ProcessEditorMobile';

interface ProcessEditorProps {
  process: ProcessData;
  globalDefaults: GlobalDefaults;
  onChange: (process: ProcessData) => void;
  onDelete?: () => void;
}

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "number", 
  prefix = "", 
  suffix = "", 
  tooltip,
  min = 0,
  hideLabel = false
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  tooltip: string;
  min?: number;
  hideLabel?: boolean;
}) => (
  <div className="space-y-2">
    {!hideLabel && (
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
    )}
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <Input
        type={type}
        value={value}
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

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PeakMonthsInput = ({ 
  value, 
  onChange, 
  processId 
}: {
  value: number[];
  onChange: (value: number[]) => void;
  processId: string;
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const formatMonthsDisplay = (months: number[]) => {
    if (months.length === 0) return '';
    return months.map(m => monthNames[m - 1]).join(', ');
  };
  
  const parseMonthsInput = (input: string) => {
    const parts = input.toLowerCase().split(',').map(s => s.trim());
    const monthNumbers: number[] = [];
    
    for (const part of parts) {
      // Handle ranges like "jan-mar" or "1-3"
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => s.trim());
        let startMonth = parseInt(start);
        let endMonth = parseInt(end);
        
        // Convert month names to numbers
        if (isNaN(startMonth)) {
          startMonth = monthNames.findIndex(m => m.toLowerCase().startsWith(start)) + 1;
        }
        
        if (isNaN(endMonth)) {
          endMonth = monthNames.findIndex(m => m.toLowerCase().startsWith(end)) + 1;
        }
        
        if (startMonth >= 1 && endMonth >= 1 && startMonth <= 12 && endMonth <= 12) {
          for (let i = startMonth; i <= endMonth; i++) {
            if (!monthNumbers.includes(i)) {
              monthNumbers.push(i);
            }
          }
        }
      } else {
        // Handle individual months
        let monthNum = parseInt(part);
        if (isNaN(monthNum)) {
          monthNum = monthNames.findIndex(m => m.toLowerCase().startsWith(part)) + 1;
        }
        
        if (monthNum >= 1 && monthNum <= 12 && !monthNumbers.includes(monthNum)) {
          monthNumbers.push(monthNum);
        }
      }
    }
    
    return monthNumbers.sort((a, b) => a - b);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '') {
      onChange([]);
    } else {
      const parsed = parseMonthsInput(newValue);
      onChange(parsed);
    }
  };
  
  return (
    <Input
      value={inputValue || formatMonthsDisplay(value)}
      onChange={handleInputChange}
      onFocus={() => setInputValue(formatMonthsDisplay(value))}
      onBlur={() => setInputValue('')}
      placeholder="e.g., Jan, Mar-May, 1-3"
      className="text-sm"
    />
  );
};

export function ProcessEditor({ process, globalDefaults, onChange, onDelete }: ProcessEditorProps) {
  const updateField = (field: keyof ProcessData, value: any) => {
    onChange({ ...process, [field]: value });
  };

  const updateSeasonalPattern = (field: string, value: any) => {
    onChange({ 
      ...process, 
      seasonalPattern: { ...process.seasonalPattern, [field]: value }
    });
  };

  const updateSLARequirements = (field: string, value: any) => {
    onChange({ 
      ...process, 
      slaRequirements: { ...process.slaRequirements, [field]: value }
    });
  };

  const updateOverheadCosts = (field: string, value: any) => {
    onChange({ 
      ...process, 
      overheadCosts: { ...process.overheadCosts, [field]: value }
    });
  };

  const calculateTotalOverhead = () => {
    if (process.overheadCosts.useDefault) {
      return process.overheadCosts.defaultPercentage;
    }
    return process.overheadCosts.benefits + process.overheadCosts.payrollTaxes + 
           process.overheadCosts.paidTimeOff + process.overheadCosts.trainingOnboarding + 
           process.overheadCosts.overheadGA;
  };

  const isMobile = useIsMobile();

  // Use mobile version on mobile devices
  if (isMobile) {
    return (
      <ProcessEditorMobile
        process={process}
        globalDefaults={globalDefaults}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  // Desktop version
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={process.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="text-base sm:text-lg font-medium bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Process Name"
            />
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive self-end sm:self-auto flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        <Accordion type="multiple" className="w-full space-y-2" defaultValue={['basic', 'task']}>
          {/* Basic Configuration */}
          <AccordionItem value="basic" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Basic Configuration</h4>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Average Hourly Wage</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Base hourly wage before overhead costs and benefits</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10">
                        $
                      </span>
                      <Input
                        type="number"
                        value={process.averageHourlyWage === 0 ? "" : process.averageHourlyWage}
                        onChange={(e) => updateField('averageHourlyWage', parseFloat(e.target.value) || 0)}
                        className={`pl-8 ${process.averageHourlyWage === globalDefaults.averageHourlyWage && process.averageHourlyWage > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700' : ''}`}
                        min={0}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Task Volume</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of tasks processed in the selected time period</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={process.taskVolume === 0 ? '' : (process.taskVolume || '')}
                        onChange={(e) => updateField('taskVolume', parseFloat(e.target.value) || 0)}
                        min={0}
                      />
                      <Select
                        value={process.taskVolumeUnit}
                        onValueChange={(value) => updateField('taskVolumeUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="week">Per Week</SelectItem>
                          <SelectItem value="month">Per Month</SelectItem>
                          <SelectItem value="quarter">Per Quarter</SelectItem>
                          <SelectItem value="year">Per Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Time per Task</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Average time to complete one task</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={process.timePerTask === 0 ? '' : (process.timePerTask || '')}
                        onChange={(e) => updateField('timePerTask', parseFloat(e.target.value) || 0)}
                        min={0}
                      />
                      <Select
                        value={process.timeUnit}
                        onValueChange={(value) => updateField('timeUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Automation Coverage</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Percentage of tasks that can be successfully automated
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={[process.automationCoverage]}
                        onValueChange={(value) => updateField('automationCoverage', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>0%</span>
                        <span className="font-medium">{process.automationCoverage}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Task Configuration */}
          <AccordionItem value="task" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Task Configuration</h4>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <Select
                      value={process.taskType}
                      onValueChange={(value: 'batch' | 'real-time' | 'seasonal') => updateField('taskType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="batch">Batch Jobs</SelectItem>
                        <SelectItem value="real-time">Real-Time Tasks</SelectItem>
                        <SelectItem value="seasonal">Seasonal Process</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time of Day</Label>
                    <Select
                      value={process.timeOfDay}
                      onValueChange={(value) => updateField('timeOfDay', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business-hours">Business Hours</SelectItem>
                        <SelectItem value="off-hours">Off Hours</SelectItem>
                        <SelectItem value="any">Any Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {process.timeOfDay === 'off-hours' && (
                    <InputField
                      label="Overtime Multiplier"
                      value={process.overtimeMultiplier}
                      onChange={(value) => updateField('overtimeMultiplier', value)}
                      tooltip="Multiplier for off-hours work costs (typically 1.5 for overtime)"
                    />
                  )}

                  {/* Seasonal Pattern Configuration */}
                  {process.taskType === 'seasonal' && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium">Seasonal Pattern</h5>
                      
                      <div className="space-y-2">
                        <Label>Peak Season Multiplier</Label>
                        <div className="px-2">
                          <Slider
                            value={[process.seasonalPattern.peakMultiplier]}
                            onValueChange={(value) => updateSeasonalPattern('peakMultiplier', value[0])}
                            min={1}
                            max={5}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>1x</span>
                            <span className="font-medium">{process.seasonalPattern.peakMultiplier.toFixed(1)}x</span>
                            <span>5x</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Peak Months</Label>
                        <PeakMonthsInput
                          value={process.seasonalPattern.peakMonths}
                          onChange={(value) => updateSeasonalPattern('peakMonths', value)}
                          processId={process.id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Overhead Costs */}
          <AccordionItem value="overhead" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 flex-1 justify-between pr-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Overhead Costs</h4>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {calculateTotalOverhead().toFixed(1)}%
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${process.id}-overhead-default`}
                    checked={process.overheadCosts.useDefault}
                    onCheckedChange={(checked) => updateOverheadCosts('useDefault', checked)}
                  />
                  <Label htmlFor={`${process.id}-overhead-default`}>Use default overhead rate</Label>
                </div>

                {process.overheadCosts.useDefault ? (
                  <InputField
                    label="Default Overhead Percentage"
                    value={process.overheadCosts.defaultPercentage}
                    onChange={(value) => updateOverheadCosts('defaultPercentage', value)}
                    suffix="%"
                    tooltip="Total overhead as percentage of base salary (default 40%)"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <InputField
                        label="Benefits"
                        value={process.overheadCosts.benefits}
                        onChange={(value) => updateOverheadCosts('benefits', value)}
                        suffix="%"
                        tooltip="Health, dental, vision insurance, retirement (typically 20-30%)"
                      />
                      
                      <InputField
                        label="Payroll Taxes"
                        value={process.overheadCosts.payrollTaxes}
                        onChange={(value) => updateOverheadCosts('payrollTaxes', value)}
                        suffix="%"
                        tooltip="Social Security, Medicare, unemployment insurance (typically 8-12%)"
                      />
                      
                      <InputField
                        label="Paid Time Off"
                        value={process.overheadCosts.paidTimeOff}
                        onChange={(value) => updateOverheadCosts('paidTimeOff', value)}
                        suffix="%"
                        tooltip="Vacation, sick leave, holidays (typically 5-10%)"
                      />
                      
                      <InputField
                        label="Training & Onboarding"
                        value={process.overheadCosts.trainingOnboarding}
                        onChange={(value) => updateOverheadCosts('trainingOnboarding', value)}
                        suffix="%"
                        tooltip="Training costs spread over tenure (typically 2-5%)"
                      />
                      
                      <InputField
                        label="General & Administrative"
                        value={process.overheadCosts.overheadGA}
                        onChange={(value) => updateOverheadCosts('overheadGA', value)}
                        suffix="%"
                        tooltip="Office space, IT equipment, HR support (typically 10-20%)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SLA Requirements */}
          <AccordionItem value="sla" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">SLA Requirements</h4>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${process.id}-sla-enabled`}
                    checked={process.slaRequirements.hasSLA}
                    onCheckedChange={(checked) => updateSLARequirements('hasSLA', checked)}
                  />
                  <Label htmlFor={`${process.id}-sla-enabled`}>This process has SLA requirements</Label>
                </div>

                {process.slaRequirements.hasSLA && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label>SLA Target</Label>
                      <Input
                        value={process.slaRequirements.slaTarget}
                        onChange={(e) => updateSLARequirements('slaTarget', e.target.value)}
                        placeholder="e.g., 2 hours, 99.9% uptime"
                      />
                    </div>
                    
                    <InputField
                      label="Cost of Missing SLA"
                      value={process.slaRequirements.costOfMissing}
                      onChange={(value) => updateSLARequirements('costOfMissing', value)}
                      prefix="$"
                      tooltip="Monthly cost or penalty when SLA targets are not met"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
