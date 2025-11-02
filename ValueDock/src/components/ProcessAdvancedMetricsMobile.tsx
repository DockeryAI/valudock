import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { ProcessData } from './utils/calculations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';

interface ProcessAdvancedMetricsMobileProps {
  process: ProcessData;
  globalDefaults?: any;
  onChange: (process: ProcessData) => void;
  onBack: () => void;
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

export function ProcessAdvancedMetricsMobile({ process, globalDefaults, onChange, onBack }: ProcessAdvancedMetricsMobileProps) {
  const updateField = (field: keyof ProcessData, value: any) => {
    onChange({ ...process, [field]: value });
  };

  const updateSeasonalPattern = (field: string, value: any) => {
    onChange({ 
      ...process, 
      seasonalPattern: { 
        peakMultiplier: 1,
        peakMonths: [],
        ...process.seasonalPattern, 
        [field]: value 
      }
    });
  };

  const updateSLARequirements = (field: string, value: any) => {
    onChange({ 
      ...process, 
      slaRequirements: { 
        hasSLA: false,
        slaTarget: '',
        costOfMissing: 0,
        costUnit: 'per-month',
        averageMissesPerMonth: 0,
        ...process.slaRequirements, 
        [field]: value 
      }
    });
  };

  const updateOverheadCosts = (field: string, value: any) => {
    onChange({ 
      ...process, 
      overheadCosts: { 
        useDefault: true,
        defaultPercentage: 30,
        benefits: 0,
        payrollTaxes: 0,
        paidTimeOff: 0,
        trainingOnboarding: 0,
        overheadGA: 0,
        ...process.overheadCosts, 
        [field]: value 
      }
    });
  };

  const calculateTotalOverhead = () => {
    if (!process.overheadCosts) {
      return 0;
    }
    if (process.overheadCosts.useDefault) {
      return process.overheadCosts.defaultPercentage || 0;
    }
    return (process.overheadCosts.benefits || 0) + (process.overheadCosts.payrollTaxes || 0) + 
           (process.overheadCosts.paidTimeOff || 0) + (process.overheadCosts.trainingOnboarding || 0) + 
           (process.overheadCosts.overheadGA || 0);
  };

  // Handle form submit (Enter key) - save and go back
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBack(); // Save and return to previous screen
  };

  return (
    <form onSubmit={handleFormSubmit} className="h-full flex flex-col">
    <div className="space-y-4 overflow-y-auto flex-1 max-h-[70vh] pb-4">
      <Accordion type="multiple" className="w-full space-y-2" defaultValue={['task', 'sla', 'overhead', 'seasonal']}>
        {/* Task Configuration */}
        <AccordionItem value="task" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">Task Configuration</h4>
              <Badge variant="outline" className="text-xs">Required</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 space-y-4">
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

              {/* Seasonal Pattern */}
              {process.taskType === 'seasonal' && (
                <div className="space-y-4 p-3 bg-muted/50 rounded-lg mt-4">
                  <h5 className="font-medium text-sm">Seasonal Pattern</h5>
                  
                  <div className="space-y-2">
                    <Label>Peak Season Multiplier</Label>
                    <div className="px-2">
                      <Slider
                        value={[process.seasonalPattern?.peakMultiplier ?? 1]}
                        onValueChange={(value) => updateSeasonalPattern('peakMultiplier', value[0])}
                        min={1}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>1x</span>
                        <span className="font-medium">{(process.seasonalPattern?.peakMultiplier ?? 1).toFixed(1)}x</span>
                        <span>5x</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Peak Months</Label>
                    <Input
                      value={(process.seasonalPattern?.peakMonths ?? []).map(m => monthNames[m - 1]).join(', ')}
                      placeholder="e.g., Jan, Mar-May"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">Edit on desktop for custom ranges</p>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Overhead Costs */}
        <AccordionItem value="overhead" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 flex-1 justify-between pr-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">Overhead Costs</h4>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {calculateTotalOverhead().toFixed(1)}%
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${process.id}-overhead-default`}
                  checked={process.overheadCosts?.useDefault ?? true}
                  onCheckedChange={(checked) => updateOverheadCosts('useDefault', checked)}
                />
                <Label htmlFor={`${process.id}-overhead-default`} className="text-sm">Use default rate</Label>
              </div>

              {(process.overheadCosts?.useDefault ?? true) ? (
                <InputField
                  label="Default Overhead %"
                  value={process.overheadCosts?.defaultPercentage ?? 30}
                  onChange={(value) => updateOverheadCosts('defaultPercentage', value)}
                  suffix="%"
                  tooltip="Total overhead as percentage of base salary (default 40%)"
                />
              ) : (
                <div className="space-y-4">
                  <InputField
                    label="Benefits"
                    value={process.overheadCosts?.benefits ?? 0}
                    onChange={(value) => updateOverheadCosts('benefits', value)}
                    suffix="%"
                    tooltip="Health, dental, vision insurance, retirement (typically 20-30%)"
                  />
                  
                  <InputField
                    label="Payroll Taxes"
                    value={process.overheadCosts?.payrollTaxes ?? 0}
                    onChange={(value) => updateOverheadCosts('payrollTaxes', value)}
                    suffix="%"
                    tooltip="Social Security, Medicare, unemployment insurance (typically 8-12%)"
                  />
                  
                  <InputField
                    label="Paid Time Off"
                    value={process.overheadCosts?.paidTimeOff ?? 0}
                    onChange={(value) => updateOverheadCosts('paidTimeOff', value)}
                    suffix="%"
                    tooltip="Vacation, sick leave, holidays (typically 5-10%)"
                  />
                  
                  <InputField
                    label="Training & Onboarding"
                    value={process.overheadCosts?.trainingOnboarding ?? 0}
                    onChange={(value) => updateOverheadCosts('trainingOnboarding', value)}
                    suffix="%"
                    tooltip="Training costs spread over tenure (typically 2-5%)"
                  />
                  
                  <InputField
                    label="General & Administrative"
                    value={process.overheadCosts?.overheadGA ?? 0}
                    onChange={(value) => updateOverheadCosts('overheadGA', value)}
                    suffix="%"
                    tooltip="Office space, IT equipment, HR support (typically 10-20%)"
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SLA Requirements */}
        <AccordionItem value="sla" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">SLA Requirements</h4>
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${process.id}-sla-enabled`}
                  checked={process.slaRequirements?.hasSLA ?? false}
                  onCheckedChange={(checked) => updateSLARequirements('hasSLA', checked)}
                />
                <Label htmlFor={`${process.id}-sla-enabled`} className="text-sm">Has SLA requirements</Label>
              </div>

              {(process.slaRequirements?.hasSLA ?? false) && (
                <div className="space-y-4 p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label>SLA Target</Label>
                    <Input
                      value={process.slaRequirements?.slaTarget ?? ''}
                      onChange={(e) => updateSLARequirements('slaTarget', e.target.value)}
                      placeholder="e.g., 2 hours, 99.9% uptime"
                    />
                  </div>
                  
                  <InputField
                    label="Cost of Missing SLA"
                    value={process.slaRequirements?.costOfMissing ?? 0}
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

      {/* Save Button */}
      <div className="pt-2 sticky bottom-0 bg-background pb-4">
        <Button onClick={onBack} className="w-full">
          Save & Return
        </Button>
      </div>
    </div>
    </form>
  );
}
