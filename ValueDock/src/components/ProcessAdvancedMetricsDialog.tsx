import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import * as TooltipPrimitive from '@radix-ui/react-tooltip@1.1.8';
import { HelpCircle, Workflow } from 'lucide-react';
import { ProcessData, normalizeInputsScore, normalizeStepsScore, normalizeDependenciesScore, calculateComplexityIndex, mapComplexityToRisk } from './utils/calculations';
import { cn } from './ui/utils';
import { StandaloneWorkflow } from './workflow-module';
import type { SavedWorkflow } from './workflow-module/types';

interface ProcessAdvancedMetricsDialogProps {
  process: ProcessData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (field: string, value: any) => void;
  organizationId?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper component for labels with tooltips
const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-2">
    <label className="text-sm font-medium">{label}</label>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <button type="button" className="inline-flex items-center">
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content 
          side="right" 
          className={cn(
            "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 max-w-xs rounded-md px-3 py-1.5 text-xs"
          )}
          sideOffset={5}
        >
          {tooltip}
          <TooltipPrimitive.Arrow className="fill-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </div>
);

// Helper component for tab triggers with tooltips
const TabTriggerWithTooltip = ({ value, children, tooltip }: { value: string; children: React.ReactNode; tooltip: string }) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>
      <span>
        <TabsTrigger value={value} className="text-xs md:text-sm whitespace-nowrap px-3 md:px-4">
          {children}
        </TabsTrigger>
      </span>
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content 
        side="top" 
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 max-w-xs rounded-md px-3 py-1.5 text-xs"
        )}
        sideOffset={5}
      >
        {tooltip}
        <TooltipPrimitive.Arrow className="fill-primary" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
);

// Component for monthly dates input with proper range handling
const MonthlyDatesInput = ({ value, onChange }: { value: number[]; onChange: (dates: number[]) => void }) => {
  const [displayValue, setDisplayValue] = useState(value.join(', '));

  React.useEffect(() => {
    // Update display value when external value changes
    setDisplayValue(value.join(', '));
  }, [value]);

  const parseInput = (input: string) => {
    const dates: number[] = [];
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(t => parseInt(t.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && start <= 31 && end >= 1 && end <= 31) {
          for (let d = start; d <= end; d++) {
            if (!dates.includes(d)) dates.push(d);
          }
        }
      } else {
        const date = parseInt(part);
        if (!isNaN(date) && date >= 1 && date <= 31 && !dates.includes(date)) {
          dates.push(date);
        }
      }
    }
    
    return dates.sort((a, b) => a - b);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Peak Dates of Month</label>
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setDisplayValue(newValue);
          
          // Only parse and update if the input looks complete (doesn't end with a dash)
          if (!newValue.endsWith('-')) {
            const parsed = parseInput(newValue);
            if (parsed.length > 0 || newValue === '') {
              onChange(parsed);
            }
          }
        }}
        onBlur={() => {
          // On blur, ensure the display matches the parsed value
          const parsed = parseInput(displayValue);
          onChange(parsed);
          setDisplayValue(parsed.join(', '));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // Parse, save, and close the dialog
            const parsed = parseInput(displayValue);
            onChange(parsed);
            setDisplayValue(parsed.join(', '));
            // Blur to trigger the save
            e.currentTarget.blur();
            // Close the parent dialog by finding and triggering close
            const dialog = e.currentTarget.closest('[role="dialog"]');
            const closeButton = dialog?.querySelector('[aria-label="Close"]') as HTMLElement;
            if (closeButton) closeButton.click();
          }
        }}
        placeholder="1, 15, 25-31"
      />
      <p className="text-xs text-muted-foreground">Enter specific dates or ranges (e.g., 1, 15, 25-31)</p>
    </div>
  );
};

// Component for hourly peak hours input with proper range handling
const HourlyPeakHoursInput = ({ value, onChange }: { value: number[]; onChange: (hours: number[]) => void }) => {
  const [displayValue, setDisplayValue] = useState(
    (value || []).map(h => {
      const hourStr = h.toString().padStart(2, '0');
      return `${hourStr}:00`;
    }).join(', ')
  );
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    // Only update display value when not actively editing
    if (!isEditing) {
      setDisplayValue(
        (value || []).map(h => {
          const hourStr = h.toString().padStart(2, '0');
          return `${hourStr}:00`;
        }).join(', ')
      );
    }
  }, [value, isEditing]);

  const parseTime = (timeStr: string): number => {
    const cleaned = timeStr.trim().replace(/[:\s]/g, ''); // Remove colons and spaces
    
    if (cleaned.length === 0) return NaN;
    
    // Parse as a number
    const num = parseInt(cleaned);
    if (isNaN(num)) return NaN;
    
    // If it's 4 digits like 1000 or 1600, extract the hour (first 2 digits)
    if (cleaned.length === 4) {
      return Math.floor(num / 100);
    }
    
    // If it's 3 digits like 900, it's hour 9
    if (cleaned.length === 3) {
      return Math.floor(num / 100);
    }
    
    // Otherwise it's already the hour number (1-2 digits)
    return num;
  };

  const parseInput = (input: string) => {
    const hours: number[] = [];
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(t => t.trim());
        const startHour = parseTime(start);
        const endHour = parseTime(end);
        
        if (!isNaN(startHour) && !isNaN(endHour) && startHour >= 0 && startHour <= 23 && endHour >= 0 && endHour <= 23) {
          for (let h = startHour; h <= endHour; h++) {
            if (!hours.includes(h)) {
              hours.push(h);
            }
          }
        }
      } else {
        const hour = parseTime(part);
        if (!isNaN(hour) && hour >= 0 && hour <= 23 && !hours.includes(hour)) {
          hours.push(hour);
        }
      }
    }
    
    return hours.sort((a, b) => a - b);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Parse the input and format it
    const parsed = parseInput(displayValue);
    onChange(parsed);
    setDisplayValue(
      parsed.map(h => {
        const hourStr = h.toString().padStart(2, '0');
        return `${hourStr}:00`;
      }).join(', ')
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Peak Hours (24hr format)</label>
      <Input
        type="text"
        value={displayValue}
        onFocus={() => {
          setIsEditing(true);
        }}
        onChange={(e) => {
          const newValue = e.target.value;
          setDisplayValue(newValue);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
            e.currentTarget.blur();
          }
        }}
        onBlur={handleSave}
        placeholder="e.g., 7-9, 1000, 13-16:00"
      />
      <p className="text-xs text-muted-foreground">Supports mixed formats: 7-9, 1000, 13-16:00, or individual hours</p>
    </div>
  );
};

export function ProcessAdvancedMetricsDialog({ process, open, onOpenChange, onUpdate, organizationId = 'default' }: ProcessAdvancedMetricsDialogProps) {
  const [workflowOpen, setWorkflowOpen] = useState(false);
  
  const togglePeakMonth = (monthIndex: number) => {
    const currentPeakMonths = process.seasonalPattern?.peakMonths || [];
    const newPeakMonths = currentPeakMonths.includes(monthIndex)
      ? currentPeakMonths.filter(m => m !== monthIndex)
      : [...currentPeakMonths, monthIndex].sort((a, b) => a - b);
    
    onUpdate('seasonalPattern', {
      ...process.seasonalPattern,
      peakMonths: newPeakMonths
    });
  };

  // Handle workflow save - store the workflow ID in the process
  const handleWorkflowSave = (workflow: SavedWorkflow) => {
    console.log('[ProcessAdvancedMetrics] Workflow saved:', workflow.id);
    onUpdate('workflowId', workflow.id);
  };

  // Handle complexity updates from workflow builder
  const handleComplexityUpdate = (metrics: {
    inputsCount: number;
    stepsCount: number;
    dependenciesCount: number;
    inputsScore: number;
    stepsScore: number;
    dependenciesScore: number;
  }) => {
    console.log('[ProcessAdvancedMetrics] Complexity update from workflow:', metrics);
    
    const currentMetrics = process.complexityMetrics || {
      autoGatherFromWorkflow: true,
      inputsCount: 0,
      stepsCount: 0,
      dependenciesCount: 0,
      inputsScore: 1,
      stepsScore: 1,
      dependenciesScore: 1
    };
    
    // Only update if auto-gather is enabled
    if (currentMetrics.autoGatherFromWorkflow) {
      const updatedMetrics = {
        ...currentMetrics,
        inputsCount: metrics.inputsCount,
        stepsCount: metrics.stepsCount,
        dependenciesCount: metrics.dependenciesCount,
        inputsScore: metrics.inputsScore,
        stepsScore: metrics.stepsScore,
        dependenciesScore: metrics.dependenciesScore
      };
      
      const complexityIndex = calculateComplexityIndex(updatedMetrics);
      const { category, riskValue } = mapComplexityToRisk(complexityIndex);
      
      onUpdate('complexityMetrics', {
        ...updatedMetrics,
        complexityIndex,
        riskCategory: category,
        riskValue
      });
    }
  };

  // Handle form submit (Enter key) - save and close dialog
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false); // Close the dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto w-[95vw] md:w-full"
        onKeyDown={(e) => {
          // Handle Enter key globally in the dialog
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
            e.stopPropagation();
            (e.target as HTMLInputElement).blur(); // Blur to trigger onChange
            setTimeout(() => {
              onOpenChange(false); // Close dialog after blur completes
            }, 0);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">Advanced Metrics: {process.name}</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Configure cyclical patterns, SLA requirements, task types, errors, compliance, and revenue impact
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
        <TooltipPrimitive.Provider delayDuration={200}>
        <Tabs defaultValue="tasktype" className="w-full">
          {/* Process Characteristics Group */}
          <div className="mb-1 text-xs text-muted-foreground px-1">Process Characteristics</div>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-3">
            <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-3 min-w-max md:min-w-0">
              <TabTriggerWithTooltip value="tasktype" tooltip="Configure whether this is a batch process, real-time process, or seasonal process. This affects overtime calculations and resource planning.">
                Task Type
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="cyclical" tooltip="Define hourly, daily, or monthly volume patterns. Use this to model peak periods like lunch rush, Monday spikes, or month-end surges.">
                Cyclical
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="sla" tooltip="Set Service Level Agreement requirements and costs of SLA violations. Important for processes with contractual commitments.">
                SLA
              </TabTriggerWithTooltip>
            </TabsList>
          </div>

          {/* Risk Metrics Group */}
          <div className="mb-1 text-xs text-muted-foreground px-1">Risk Metrics</div>
          <div className="space-y-2 mb-3">
            {/* Row 1: Process Complexity and Errors */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-2 min-w-max md:min-w-0">
                <TabTriggerWithTooltip value="complexity" tooltip="Capture process complexity metrics including inputs, steps, dependencies, and implementation risk factors.">
                  Process Complexity
                </TabTriggerWithTooltip>
                <TabTriggerWithTooltip value="errors" tooltip="Enter error rates and rework costs. Automation reduces errors proportionally to coverage percentage.">
                  Errors
                </TabTriggerWithTooltip>
              </TabsList>
            </div>
            {/* Row 2: Compliance and Risk Mitigation */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-2 min-w-max md:min-w-0">
                <TabTriggerWithTooltip value="compliance" tooltip="Specify annual compliance risk and penalty exposure. Automation reduces risk based on coverage percentage.">
                  Compliance
                </TabTriggerWithTooltip>
                <TabTriggerWithTooltip value="riskmitigation" tooltip="Additional risk mitigation and compliance-related cost savings from automation.">
                  Risk Mitigation
                </TabTriggerWithTooltip>
              </TabsList>
            </div>
          </div>

          {/* Internal Cost Savings Group */}
          <div className="mb-1 text-xs text-muted-foreground px-1">Internal Cost Savings</div>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-3">
            <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-3 min-w-max md:min-w-0">
              <TabTriggerWithTooltip value="labor" tooltip="Training, onboarding, overtime premiums, and shadow system costs as % of total process cost.">
                Labor
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="it" tooltip="Software licensing, infrastructure, and IT support costs as % of total process cost.">
                IT/Ops
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="opportunity" tooltip="Decision delays, capacity drag, and customer impact costs as % of total process cost.">
                Opportunity
              </TabTriggerWithTooltip>
            </TabsList>
          </div>

          {/* Business Impact Group */}
          <div className="mb-1 text-xs text-muted-foreground px-1">Business Impact</div>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-3 min-w-max md:min-w-0">
              <TabTriggerWithTooltip value="revenue" tooltip="Revenue uplift from automation improvements (speed, quality, capacity).">
                Revenue Impact
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="fteutilization" tooltip="Configure how freed FTEs are utilized: redeployed to higher-value work, eliminated, or mixed approach.">
                FTE Utilization
              </TabTriggerWithTooltip>
              <TabTriggerWithTooltip value="promptpayment" tooltip="Capture early payment discounts through faster invoice processing enabled by automation.">
                Prompt Payment
              </TabTriggerWithTooltip>
            </TabsList>
          </div>

          {/* Cyclical Volume Pattern Tab */}
          <TabsContent value="cyclical" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Cyclical Volume Pattern</h3>
              
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Pattern Type" 
                  tooltip="None: Volume is consistent throughout the period. Hourly: Volume spikes during specific hours (e.g., lunch rush). Daily: Volume varies by day of week (e.g., Monday heavy). Monthly: Volume peaks on certain dates (e.g., month-end)."
                />
                <Select
                  value={process.cyclicalPattern?.type || 'none'}
                  onValueChange={(value: any) => onUpdate('cyclicalPattern', {
                    ...process.cyclicalPattern,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {process.cyclicalPattern?.type === 'hourly' && (
                <HourlyPeakHoursInput 
                  value={process.cyclicalPattern?.peakHours || []}
                  onChange={(hours) => onUpdate('cyclicalPattern', {
                    ...process.cyclicalPattern,
                    peakHours: hours
                  })}
                />
              )}

              {process.cyclicalPattern?.type === 'daily' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Peak Days of Week</label>
                  <Input
                    type="text"
                    value={(process.cyclicalPattern?.peakDays || []).map(d => {
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return dayNames[d];
                    }).join(', ')}
                    onChange={(e) => {
                      const input = e.target.value;
                      const days: number[] = [];
                      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                      
                      // Split by comma
                      const parts = input.split(',').map(p => p.trim().toLowerCase());
                      
                      for (const part of parts) {
                        // Check if it's a range (e.g., "mon-wed" or "Mon-Fri")
                        if (part.includes('-')) {
                          const [start, end] = part.split('-').map(t => t.trim());
                          const startIdx = dayNames.indexOf(start);
                          const endIdx = dayNames.indexOf(end);
                          
                          if (startIdx !== -1 && endIdx !== -1) {
                            // Add all days in range
                            for (let d = startIdx; d <= endIdx; d++) {
                              if (!days.includes(d)) {
                                days.push(d);
                              }
                            }
                          }
                        } else {
                          // Single day entry
                          const dayIdx = dayNames.indexOf(part);
                          if (dayIdx !== -1 && !days.includes(dayIdx)) {
                            days.push(dayIdx);
                          }
                        }
                      }
                      
                      onUpdate('cyclicalPattern', {
                        ...process.cyclicalPattern,
                        peakDays: days.sort((a, b) => a - b)
                      });
                    }}
                    placeholder="Mon, Wed, Fri or Mon-Fri"
                  />
                  <p className="text-xs text-muted-foreground">Use abbreviated days (Sun, Mon, Tue, etc.) or ranges (Mon-Fri)</p>
                </div>
              )}

              {process.cyclicalPattern?.type === 'monthly' && (
                <MonthlyDatesInput 
                  value={process.cyclicalPattern?.peakDatesOfMonth || []}
                  onChange={(dates) => onUpdate('cyclicalPattern', {
                    ...process.cyclicalPattern,
                    peakDatesOfMonth: dates
                  })}
                />
              )}

              {process.cyclicalPattern?.type !== 'none' && (
                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Peak Multiplier" 
                    tooltip="How much volume increases during peak periods. For example, 2.0 means volume doubles during peaks compared to baseline."
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={process.cyclicalPattern?.multiplier === 0 ? '' : (process.cyclicalPattern?.multiplier || '')}
                    onChange={(e) => onUpdate('cyclicalPattern', {
                      ...process.cyclicalPattern,
                      multiplier: parseFloat(e.target.value) || 0
                    })}
                    onFocus={(e) => e.target.select()}
                    placeholder="1.5"
                  />
                  <p className="text-xs text-muted-foreground">Volume multiplier during peak periods</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* SLA Requirements Tab */}
          <TabsContent value="sla" className="space-y-4">
            <div className="space-y-2">
              <LabelWithTooltip 
                label="SLA Target" 
                tooltip="Service Level Agreement target. Examples: '2 hours response time', '99.9% uptime', '24 hour turnaround'. This defines the performance commitment for this process."
              />
              <Input
                type="text"
                value={process.slaRequirements?.slaTarget || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdate('slaRequirements', {
                    ...process.slaRequirements,
                    slaTarget: value,
                    hasSLA: value.length > 0 || (process.slaRequirements?.costOfMissing || 0) > 0
                  });
                }}
                placeholder="e.g., 2 hours, 99.9% uptime"
              />
              <p className="text-xs text-muted-foreground">Leave empty if not applicable</p>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Cost of Missing SLA" 
                tooltip="Financial penalty per SLA violation. This could include contractual penalties, customer credits, or calculated business impact from missed commitments."
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={process.slaRequirements?.costOfMissing === 0 ? '' : (process.slaRequirements?.costOfMissing || '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onUpdate('slaRequirements', {
                      ...process.slaRequirements,
                      costOfMissing: value,
                      hasSLA: value > 0 || (process.slaRequirements?.slaTarget?.length || 0) > 0
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="pl-8"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cost Unit</label>
              <Select
                value={process.slaRequirements?.costUnit || 'per-month'}
                onValueChange={(value: any) => onUpdate('slaRequirements', {
                  ...process.slaRequirements,
                  costUnit: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-minute">Per Minute</SelectItem>
                  <SelectItem value="per-hour">Per Hour</SelectItem>
                  <SelectItem value="per-day">Per Day</SelectItem>
                  <SelectItem value="per-week">Per Week</SelectItem>
                  <SelectItem value="per-month">Per Month</SelectItem>
                  <SelectItem value="per-year">Per Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {process.slaRequirements?.costUnit === 'per-minute' && 'Average Misses Per Hour'}
                {process.slaRequirements?.costUnit === 'per-hour' && 'Average Misses Per Day'}
                {process.slaRequirements?.costUnit === 'per-day' && 'Average Misses Per Week'}
                {process.slaRequirements?.costUnit === 'per-week' && 'Average Misses Per Month'}
                {process.slaRequirements?.costUnit === 'per-month' && 'Average Misses Per Year'}
                {process.slaRequirements?.costUnit === 'per-year' && 'Average Misses Per Year'}
                {!process.slaRequirements?.costUnit && 'Average Misses Per Year'}
              </label>
              <Input
                type="number"
                value={process.slaRequirements?.averageMissesPerMonth === 0 ? '' : (process.slaRequirements?.averageMissesPerMonth || '')}
                onChange={(e) => onUpdate('slaRequirements', {
                  ...process.slaRequirements,
                  averageMissesPerMonth: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="1"
              />
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This metric will be included in reports only if values are entered.
              </p>
            </div>
          </TabsContent>

          {/* Task Type & Time of Day Tab */}
          <TabsContent value="tasktype" className="space-y-4">
            <div className="space-y-2">
              <LabelWithTooltip 
                label="Task Type" 
                tooltip="Batch: Tasks run periodically in groups (e.g., nightly reports). Real-Time: Tasks processed immediately as they arrive. Seasonal: Tasks with predictable peak periods during specific months."
              />
              <Select
                value={process.taskType || 'real-time'}
                onValueChange={(value: any) => onUpdate('taskType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="real-time">Real-Time</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Batch: Run periodically | Real-Time: Continuous | Seasonal: Varies by season
              </p>
            </div>

            {process.taskType === 'seasonal' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Seasonal Pattern (Peak Months)</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Peak Months</label>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTH_NAMES.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => togglePeakMonth(index)}
                        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                          (process.seasonalPattern?.peakMonths || []).includes(index)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-accent'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Peak Season Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={process.seasonalPattern?.peakMultiplier === 0 ? '' : (process.seasonalPattern?.peakMultiplier || '')}
                    onChange={(e) => onUpdate('seasonalPattern', {
                      ...process.seasonalPattern,
                      peakMultiplier: parseFloat(e.target.value) || 0
                    })}
                    onFocus={(e) => e.target.select()}
                    placeholder="2.0"
                  />
                  <p className="text-xs text-muted-foreground">Volume multiplier during peak months</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Time of Day" 
                tooltip="Business Hours: Standard 9-5 workday. Off Hours: Evening/weekend work requiring overtime pay. Any Time: Tasks that can occur at any time without premium costs."
              />
              <Select
                value={process.timeOfDay || 'business-hours'}
                onValueChange={(value: any) => onUpdate('timeOfDay', value)}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Overtime Multiplier</label>
                <Input
                  type="number"
                  step="0.1"
                  value={process.overtimeMultiplier === 0 ? '' : (process.overtimeMultiplier || '')}
                  onChange={(e) => onUpdate('overtimeMultiplier', parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="1.5"
                />
                <p className="text-xs text-muted-foreground">Multiplier for off-hours labor costs</p>
              </div>
            )}
          </TabsContent>

          {/* Process Complexity Tab */}
          <TabsContent value="complexity" className="space-y-4">
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/10 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Process Complexity Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Capture complexity factors to calculate implementation risk. Metrics can be entered manually or auto-gathered from your workflow.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setWorkflowOpen(true)}
                  variant="outline"
                  className="shrink-0"
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  {process.workflowId ? 'Edit Workflow' : 'Build Workflow'}
                </Button>
              </div>
            </div>

            {/* Auto-Gather Toggle */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-gather-toggle"
                  checked={process.complexityMetrics?.autoGatherFromWorkflow ?? true}
                  onCheckedChange={(checked) => {
                    const currentMetrics = process.complexityMetrics || {
                      autoGatherFromWorkflow: true,
                      inputsCount: 0,
                      stepsCount: 0,
                      dependenciesCount: 0,
                      inputsScore: 1,
                      stepsScore: 1,
                      dependenciesScore: 1
                    };
                    
                    onUpdate('complexityMetrics', {
                      ...currentMetrics,
                      autoGatherFromWorkflow: checked as boolean
                    });
                  }}
                />
                <label htmlFor="auto-gather-toggle" className="text-sm font-medium cursor-pointer">
                  Auto-Gather from Workflow Editor
                </label>
              </div>
              <Badge variant={process.complexityMetrics?.autoGatherFromWorkflow ? "default" : "secondary"}>
                {process.complexityMetrics?.autoGatherFromWorkflow ? "ON" : "OFF"}
              </Badge>
            </div>

            {!process.complexityMetrics?.autoGatherFromWorkflow && (
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <strong>Manual Entry Mode:</strong> You must enter counts manually below. Turn on auto-gather to pull from your workflow automatically.
              </div>
            )}

            {process.complexityMetrics?.autoGatherFromWorkflow && (
              <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <strong>Auto-Gather Mode (Default):</strong> Counts auto-populate from your workflow. Build your workflow and mark input nodes and teams. 
                <strong> Manual entries below will override auto-gathered values.</strong>
              </div>
            )}

            {/* Raw Counts Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Workflow Structure Counts</h4>
              
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Inputs Count" 
                  tooltip="Number of distinct systems, APIs, or data sources feeding this workflow. Higher input counts indicate more integration complexity."
                />
                <Input
                  type="number"
                  min="0"
                  value={process.complexityMetrics?.inputsCount === 0 ? '' : (process.complexityMetrics?.inputsCount || '')}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const normalized = normalizeInputsScore(count);
                    const currentMetrics = process.complexityMetrics || {
                      autoGatherFromWorkflow: true,
                      inputsCount: 0,
                      stepsCount: 0,
                      dependenciesCount: 0,
                      inputsScore: 1,
                      stepsScore: 1,
                      dependenciesScore: 1
                    };
                    
                    const updatedMetrics = {
                      ...currentMetrics,
                      inputsCount: count,
                      inputsScore: normalized,
                      manualInputsOverride: true
                    };
                    
                    const complexityIndex = calculateComplexityIndex(updatedMetrics);
                    const { category, riskValue } = mapComplexityToRisk(complexityIndex);
                    
                    onUpdate('complexityMetrics', {
                      ...updatedMetrics,
                      complexityIndex,
                      riskCategory: category,
                      riskValue
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Distinct systems/APIs/data sources</span>
                  <Badge variant="outline">Score: {process.complexityMetrics?.inputsScore?.toFixed(1) || '1.0'}</Badge>
                  {process.complexityMetrics?.manualInputsOverride && (
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Steps Count" 
                  tooltip="Number of tasks or nodes in the workflow. More steps mean longer implementation and more potential failure points."
                />
                <Input
                  type="number"
                  min="0"
                  value={process.complexityMetrics?.stepsCount === 0 ? '' : (process.complexityMetrics?.stepsCount || '')}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const normalized = normalizeStepsScore(count);
                    const currentMetrics = process.complexityMetrics || {
                      autoGatherFromWorkflow: true,
                      inputsCount: 0,
                      stepsCount: 0,
                      dependenciesCount: 0,
                      inputsScore: 1,
                      stepsScore: 1,
                      dependenciesScore: 1
                    };
                    
                    const updatedMetrics = {
                      ...currentMetrics,
                      stepsCount: count,
                      stepsScore: normalized,
                      manualStepsOverride: true
                    };
                    
                    const complexityIndex = calculateComplexityIndex(updatedMetrics);
                    const { category, riskValue } = mapComplexityToRisk(complexityIndex);
                    
                    onUpdate('complexityMetrics', {
                      ...updatedMetrics,
                      complexityIndex,
                      riskCategory: category,
                      riskValue
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tasks or nodes in workflow</span>
                  <Badge variant="outline">Score: {process.complexityMetrics?.stepsScore?.toFixed(1) || '1.0'}</Badge>
                  {process.complexityMetrics?.manualStepsOverride && (
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Dependencies Count" 
                  tooltip="Number of distinct teams or roles involved in this workflow. More teams require more coordination and change management."
                />
                <Input
                  type="number"
                  min="0"
                  value={process.complexityMetrics?.dependenciesCount === 0 ? '' : (process.complexityMetrics?.dependenciesCount || '')}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const normalized = normalizeDependenciesScore(count);
                    const currentMetrics = process.complexityMetrics || {
                      autoGatherFromWorkflow: true,
                      inputsCount: 0,
                      stepsCount: 0,
                      dependenciesCount: 0,
                      inputsScore: 1,
                      stepsScore: 1,
                      dependenciesScore: 1
                    };
                    
                    const updatedMetrics = {
                      ...currentMetrics,
                      dependenciesCount: count,
                      dependenciesScore: normalized,
                      manualDependenciesOverride: true
                    };
                    
                    const complexityIndex = calculateComplexityIndex(updatedMetrics);
                    const { category, riskValue } = mapComplexityToRisk(complexityIndex);
                    
                    onUpdate('complexityMetrics', {
                      ...updatedMetrics,
                      complexityIndex,
                      riskCategory: category,
                      riskValue
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Distinct teams or roles involved</span>
                  <Badge variant="outline">Score: {process.complexityMetrics?.dependenciesScore?.toFixed(1) || '1.0'}</Badge>
                  {process.complexityMetrics?.manualDependenciesOverride && (
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  )}
                </div>
              </div>

              {/* Scoring Thresholds Info */}
              <div className="rounded-lg border p-3 bg-muted/30 text-xs space-y-1">
                <p className="font-medium">Normalization Thresholds (0-10 scale):</p>
                <p><strong>Inputs:</strong> 0-2 → 1-3, 3-5 → 4-6, 6+ → 7-10</p>
                <p><strong>Steps:</strong> 1-5 → 1-3, 6-15 → 4-6, 16+ → 7-10</p>
                <p><strong>Dependencies:</strong> 0-1 → 1-3, 2-3 → 4-6, 4+ → 7-10</p>
              </div>
            </div>

            {/* Complexity Index & Risk Category */}
            {process.complexityMetrics && (
              <div className="rounded-lg border-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Complexity Index</p>
                    <p className="text-xs text-muted-foreground mt-1">Formula: (0.4 × Inputs) + (0.4 × Steps) + (0.2 × Dependencies)</p>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {(process.complexityMetrics.complexityIndex ?? 0).toFixed(1)}
                    <span className="text-lg text-muted-foreground">/10</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Category</p>
                    <p className="text-xs text-muted-foreground mt-1">Used in CFO Score calculation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        process.complexityMetrics.riskCategory === 'Simple' ? 'default' :
                        process.complexityMetrics.riskCategory === 'Moderate' ? 'secondary' :
                        'destructive'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {process.complexityMetrics.riskCategory || 'Moderate'}
                    </Badge>
                    <div className="text-2xl font-bold">
                      Risk Value: {process.complexityMetrics.riskValue || 5}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Error Rates & Rework Tab */}
          <TabsContent value="errors" className="space-y-4">
            <div className="space-y-2">
              <LabelWithTooltip 
                label="Error Rate (%)" 
                tooltip="Percentage of tasks that contain errors requiring rework. Example: If 5% of invoices have errors that need correction, enter 5. Automation typically reduces error rates significantly."
              />
              <Input
                type="number"
                value={process.errorReworkCosts?.errorRate === 0 ? '' : (process.errorReworkCosts?.errorRate || '')}
                onChange={(e) => onUpdate('errorReworkCosts', {
                  ...process.errorReworkCosts,
                  errorRate: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">% of tasks requiring rework</p>
            </div>
            <div className="space-y-2">
              <LabelWithTooltip 
                label="Cost Per Error (% of Task Cost)" 
                tooltip="The rework cost per error as a percentage of the cost to perform one task. For example, if a task costs $10 and fixing an error costs $5, enter 50%. This scales automatically with your wage and time inputs."
              />
              <div className="relative">
                <Input
                  type="number"
                  value={process.errorReworkCosts?.reworkCostPercentage === 0 ? '' : (process.errorReworkCosts?.reworkCostPercentage || '')}
                  onChange={(e) => onUpdate('errorReworkCosts', {
                    ...process.errorReworkCosts,
                    reworkCostPercentage: parseFloat(e.target.value) || 0
                  })}
                  onFocus={(e) => e.target.select()}
                  placeholder="50"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">% of task labor cost to fix each error</p>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Error reduction is automatically calculated based on your automation coverage percentage in the Implementation section.
              </p>
            </div>
          </TabsContent>

          {/* Compliance Risk Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/10 mb-4">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Compliance Fine Assumptions</h4>
              <p className="text-sm text-muted-foreground">
                Configure detailed fine structures to calculate probability-weighted compliance cost avoidance from automation.
              </p>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Fine Type" 
                tooltip="Select how fines are calculated: Daily (per day of non-compliance), Per Incident (flat amount per occurrence), Per Record (amount × # of records), or % of Revenue (percentage of revenue at risk)."
              />
              <Select
                value={process.complianceRisk?.fineType || 'none'}
                onValueChange={(value: any) => onUpdate('complianceRisk', {
                  ...process.complianceRisk,
                  fineType: value === 'none' ? undefined : value,
                  hasComplianceRisk: value !== 'none'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fine type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No compliance risk</SelectItem>
                  <SelectItem value="daily">Daily Fine (per day of non-compliance)</SelectItem>
                  <SelectItem value="per-incident">Per Incident Fine (flat amount)</SelectItem>
                  <SelectItem value="per-record">Per Record Fine (amount × records)</SelectItem>
                  <SelectItem value="percent-revenue">% of Revenue Fine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Daily Fine Fields */}
            {process.complianceRisk?.fineType === 'daily' && (
              <>
                <div className="space-y-2 pt-2">
                  <LabelWithTooltip 
                    label="Amount Per Day" 
                    tooltip="The fine amount charged per day of non-compliance."
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={process.complianceRisk?.amountPerDay === 0 ? '' : (process.complianceRisk?.amountPerDay || '')}
                      onChange={(e) => onUpdate('complianceRisk', {
                        ...process.complianceRisk,
                        amountPerDay: parseFloat(e.target.value) || 0
                      })}
                      onFocus={(e) => e.target.select()}
                      className="pl-8"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Expected Duration (Days)" 
                    tooltip="Average number of days a compliance violation would persist."
                  />
                  <Input
                    type="number"
                    value={process.complianceRisk?.expectedDurationDays === 0 ? '' : (process.complianceRisk?.expectedDurationDays || '')}
                    onChange={(e) => onUpdate('complianceRisk', {
                      ...process.complianceRisk,
                      expectedDurationDays: parseFloat(e.target.value) || 0
                    })}
                    onFocus={(e) => e.target.select()}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total exposure: ${((process.complianceRisk?.amountPerDay || 0) * (process.complianceRisk?.expectedDurationDays || 0)).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {/* Per Incident Fine Fields */}
            {process.complianceRisk?.fineType === 'per-incident' && (
              <>
                <div className="space-y-2 pt-2">
                  <LabelWithTooltip 
                    label="Amount Per Incident" 
                    tooltip="The flat fine amount charged per compliance incident."
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={process.complianceRisk?.amountPerIncident === 0 ? '' : (process.complianceRisk?.amountPerIncident || '')}
                      onChange={(e) => onUpdate('complianceRisk', {
                        ...process.complianceRisk,
                        amountPerIncident: parseFloat(e.target.value) || 0
                      })}
                      onFocus={(e) => e.target.select()}
                      className="pl-8"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Expected Incidents Per Year" 
                    tooltip="Estimated number of compliance incidents that could occur annually."
                  />
                  <Input
                    type="number"
                    value={process.complianceRisk?.expectedIncidentsPerYear === 0 ? '' : (process.complianceRisk?.expectedIncidentsPerYear || '')}
                    onChange={(e) => onUpdate('complianceRisk', {
                      ...process.complianceRisk,
                      expectedIncidentsPerYear: parseFloat(e.target.value) || 0
                    })}
                    onFocus={(e) => e.target.select()}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total exposure: ${((process.complianceRisk?.amountPerIncident || 0) * (process.complianceRisk?.expectedIncidentsPerYear || 0)).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {/* Per Record Fine Fields */}
            {process.complianceRisk?.fineType === 'per-record' && (
              <>
                <div className="space-y-2 pt-2">
                  <LabelWithTooltip 
                    label="Amount Per Record" 
                    tooltip="The fine amount charged per non-compliant record (e.g., GDPR violations, data breaches)."
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={process.complianceRisk?.amountPerRecord === 0 ? '' : (process.complianceRisk?.amountPerRecord || '')}
                      onChange={(e) => onUpdate('complianceRisk', {
                        ...process.complianceRisk,
                        amountPerRecord: parseFloat(e.target.value) || 0
                      })}
                      onFocus={(e) => e.target.select()}
                      className="pl-8"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Records At Risk" 
                    tooltip="Number of records that could be subject to fines (e.g., customer records, transactions)."
                  />
                  <Input
                    type="number"
                    value={process.complianceRisk?.recordsAtRisk === 0 ? '' : (process.complianceRisk?.recordsAtRisk || '')}
                    onChange={(e) => onUpdate('complianceRisk', {
                      ...process.complianceRisk,
                      recordsAtRisk: parseFloat(e.target.value) || 0
                    })}
                    onFocus={(e) => e.target.select()}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total exposure: ${((process.complianceRisk?.amountPerRecord || 0) * (process.complianceRisk?.recordsAtRisk || 0)).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {/* Percent of Revenue Fine Fields */}
            {process.complianceRisk?.fineType === 'percent-revenue' && (
              <>
                <div className="space-y-2 pt-2">
                  <LabelWithTooltip 
                    label="Percentage Rate" 
                    tooltip="The percentage of revenue at risk (e.g., GDPR fines can be up to 4% of global revenue)."
                  />
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={process.complianceRisk?.percentageRate === 0 ? '' : (process.complianceRisk?.percentageRate || '')}
                      onChange={(e) => onUpdate('complianceRisk', {
                        ...process.complianceRisk,
                        percentageRate: parseFloat(e.target.value) || 0
                      })}
                      onFocus={(e) => e.target.select()}
                      placeholder="4.0"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Revenue At Risk" 
                    tooltip="The revenue base that the percentage applies to (global, business unit, or product line)."
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={process.complianceRisk?.revenueAtRisk === 0 ? '' : (process.complianceRisk?.revenueAtRisk || '')}
                      onChange={(e) => onUpdate('complianceRisk', {
                        ...process.complianceRisk,
                        revenueAtRisk: parseFloat(e.target.value) || 0
                      })}
                      onFocus={(e) => e.target.select()}
                      className="pl-8"
                      placeholder="10000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total exposure: ${((process.complianceRisk?.revenueAtRisk || 0) * ((process.complianceRisk?.percentageRate || 0) / 100)).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {/* Probability and Note - shown for all fine types except 'none' */}
            {process.complianceRisk?.fineType && process.complianceRisk.fineType !== 'none' && (
              <>
                <div className="space-y-2 border-t pt-4">
                  <LabelWithTooltip 
                    label="Probability of Occurrence (%)" 
                    tooltip="Likelihood that this compliance risk would materialize without automation. This creates a conservative, probability-weighted estimate."
                  />
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={process.complianceRisk?.probabilityOfOccurrence === 0 ? '' : (process.complianceRisk?.probabilityOfOccurrence || '')}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        onUpdate('complianceRisk', {
                          ...process.complianceRisk,
                          probabilityOfOccurrence: value
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="25"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Typical range: 5-50% depending on current controls and risk exposure
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Compliance Cost Avoided Formula:</strong><br />
                    (Fine Value × Probability × Automation Coverage %)<br /><br />
                    <strong>Note:</strong> Based on probability-weighted expected fines avoided, adjusted for % automation. Conservative estimates used. Risk reduction is automatically calculated based on your automation coverage percentage in the Implementation section.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Revenue Impact Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits of Automating (Select all that apply)</label>
              <div className="space-y-3 border rounded-md p-4">
                {[
                  { value: 'speed', label: 'Speed to Market' },
                  { value: 'quality', label: 'Quality Improvement' },
                  { value: 'capacity', label: 'Capacity Increase' },
                  { value: 'customer-satisfaction', label: 'Customer Satisfaction' }
                ].map((benefit) => (
                  <div key={benefit.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`benefit-${benefit.value}`}
                      checked={(process.revenueImpact?.revenueTypes || []).includes(benefit.value as any)}
                      onCheckedChange={(checked) => {
                        const currentTypes = process.revenueImpact?.revenueTypes || [];
                        const newTypes = checked
                          ? [...currentTypes, benefit.value as any]
                          : currentTypes.filter(t => t !== benefit.value);
                        
                        onUpdate('revenueImpact', {
                          ...process.revenueImpact,
                          revenueTypes: newTypes
                        });
                      }}
                    />
                    <label
                      htmlFor={`benefit-${benefit.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {benefit.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select all benefits that apply to this process</p>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Annual Process Revenue ($)" 
                tooltip="Total annual revenue directly generated by this process. For example, an order processing system might handle $10M in annual orders. Leave empty if not revenue-generating."
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={process.revenueImpact?.annualProcessRevenue === 0 ? '' : (process.revenueImpact?.annualProcessRevenue || '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onUpdate('revenueImpact', {
                      ...process.revenueImpact,
                      annualProcessRevenue: value,
                      hasRevenueImpact: value > 0 || (process.revenueImpact?.upliftPercentageIf100Automated || 0) > 0 || (process.revenueImpact?.revenueTypes || []).length > 0
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="pl-8"
                  placeholder="100000"
                />
              </div>
              <p className="text-xs text-muted-foreground">Total annual revenue this process produces. Leave empty if not applicable.</p>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Additional Uplift if 100% Automated (%)" 
                tooltip="Expected % increase in revenue if this process were fully automated. For example, faster processing might enable 10% more throughput. This is weighted by your actual automation coverage percentage."
              />
              <Input
                type="number"
                value={process.revenueImpact?.upliftPercentageIf100Automated === 0 ? '' : (process.revenueImpact?.upliftPercentageIf100Automated || '')}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  onUpdate('revenueImpact', {
                    ...process.revenueImpact,
                    upliftPercentageIf100Automated: value,
                    hasRevenueImpact: value > 0 || (process.revenueImpact?.annualProcessRevenue || 0) > 0 || (process.revenueImpact?.revenueTypes || []).length > 0
                  });
                }}
                onFocus={(e) => e.target.select()}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                % increase in revenue if process is 100% automated
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Final revenue uplift is automatically weighted by your automation coverage percentage in the Implementation section. This metric will be included in reports only if values are entered.
              </p>
            </div>
          </TabsContent>

          {/* Prompt Payment Tab */}
          <TabsContent value="promptpayment" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                Capture the financial benefit of early payment discounts (e.g., 2/10 Net 30 terms) made possible by faster invoice processing through automation. This calculates the savings from supplier discounts on accounts payable.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Annual Invoice Processing Volume ($)" 
                  tooltip="The total annual spend on invoices processed (accounts payable). This is the total dollar amount of supplier invoices you pay annually, not your revenue. Example: If you process 10,000 invoices/year averaging $5,000 each, enter $50,000,000."
                />
                <Input
                  type="number"
                  step="1000"
                  value={process.revenueImpact?.annualInvoiceProcessingVolume === 0 ? '' : (process.revenueImpact?.annualInvoiceProcessingVolume || '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onUpdate('revenueImpact', {
                      ...process.revenueImpact,
                      annualInvoiceProcessingVolume: value
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="50000000"
                  className={process.revenueImpact?.annualInvoiceProcessingVolume && process.revenueImpact.annualInvoiceProcessingVolume > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Total dollar amount of supplier invoices paid annually
                  {process.taskVolume > 0 && (() => {
                    // Calculate annual task count based on taskVolumeUnit
                    const multipliers: Record<string, number> = {
                      'day': 250, // ~250 business days/year
                      'week': 52,
                      'month': 12,
                      'quarter': 4,
                      'year': 1
                    };
                    const annualTaskCount = process.taskVolume * (multipliers[process.taskVolumeUnit] || 1);
                    return (
                      <span className="block mt-1 text-blue-600 dark:text-blue-400">
                        💡 Based on your task volume: ~{annualTaskCount.toLocaleString()} invoices/year. Multiply by average invoice amount.
                      </span>
                    );
                  })()}
                </p>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Discount Percentage (%)" 
                  tooltip="The discount percentage offered by suppliers for early payment. Average is 2%. For example, 2/10 Net 30 terms offer a 2% discount. This benefit is weighted by automation coverage."
                />
                <Input
                  type="number"
                  step="0.1"
                  value={process.revenueImpact?.promptPaymentDiscountPercentage === 0 ? '' : (process.revenueImpact?.promptPaymentDiscountPercentage || '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onUpdate('revenueImpact', {
                      ...process.revenueImpact,
                      promptPaymentDiscountPercentage: value
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="2"
                  className={process.revenueImpact?.promptPaymentDiscountPercentage && process.revenueImpact.promptPaymentDiscountPercentage > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700' : ''}
                />
                <p className="text-xs text-muted-foreground">Average is 2%</p>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Discount Window (Days)" 
                  tooltip="The payment window in days to qualify for the discount. Average is 10 days. For example, 2/10 Net 30 terms require payment within 10 days."
                />
                <Input
                  type="number"
                  value={process.revenueImpact?.promptPaymentWindowDays === 0 ? '' : (process.revenueImpact?.promptPaymentWindowDays || '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onUpdate('revenueImpact', {
                      ...process.revenueImpact,
                      promptPaymentWindowDays: value
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="10"
                  className={process.revenueImpact?.promptPaymentWindowDays && process.revenueImpact.promptPaymentWindowDays > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700' : ''}
                />
                <p className="text-xs text-muted-foreground">Average is 10 days</p>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Prompt payment discount benefits are automatically weighted by your automation coverage percentage in the Implementation section. The benefit is calculated as: <strong>Annual Invoice Volume × Discount % × Automation Coverage</strong>.
              </p>
              {(() => {
                const hasDiscountPercentage = (process.revenueImpact?.promptPaymentDiscountPercentage || 0) > 0;
                const hasDiscountWindow = (process.revenueImpact?.promptPaymentWindowDays || 0) > 0;
                const hasInvoiceVolume = (process.revenueImpact?.annualInvoiceProcessingVolume || 0) > 0;
                
                if (hasDiscountPercentage && hasDiscountWindow && hasInvoiceVolume) {
                  const automationCoverage = (process.implementation?.automationCoveragePercentage || 0) / 100;
                  const benefit = process.revenueImpact!.annualInvoiceProcessingVolume! * (process.revenueImpact!.promptPaymentDiscountPercentage! / 100) * automationCoverage;
                  return (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      💰 Estimated Annual Benefit: ${benefit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      <br />
                      <span className="text-xs">
                        ${process.revenueImpact!.annualInvoiceProcessingVolume!.toLocaleString()} × {process.revenueImpact!.promptPaymentDiscountPercentage}% × {((process.implementation?.automationCoveragePercentage || 0))}% automation
                      </span>
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </TabsContent>

          {/* Labor & Workforce Internal Costs Tab */}
          <TabsContent value="labor" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Labor & Workforce Costs:</strong> Enter each cost as a percentage of the total annual process cost. These costs will be reduced proportionally to your automation coverage.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Training & Onboarding Costs (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.trainingOnboardingCosts === 0 ? '' : (process.internalCosts?.trainingOnboardingCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  trainingOnboardingCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">% of process cost spent on training/onboarding new hires</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Overtime Premiums (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.overtimePremiums === 0 ? '' : (process.internalCosts?.overtimePremiums || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  overtimePremiums: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">% of process cost from overtime tied to cyclical demand/SLA emergencies</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shadow Systems/Workarounds (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.shadowSystemsCosts === 0 ? '' : (process.internalCosts?.shadowSystemsCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  shadowSystemsCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">% of process cost from Excel macros, Access DBs, manual trackers</p>
            </div>
          </TabsContent>

          {/* IT & Operations Internal Costs Tab */}
          <TabsContent value="it" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>IT & Operations Costs:</strong> Enter each cost as a percentage of the total annual process cost. Automation will reduce these legacy system and support costs.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Software Licensing/Subscriptions (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.softwareLicensing === 0 ? '' : (process.internalCosts?.softwareLicensing || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  softwareLicensing: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="12"
              />
              <p className="text-xs text-muted-foreground">% of process cost from legacy tools and software subscriptions</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Infrastructure Costs (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.infrastructureCosts === 0 ? '' : (process.internalCosts?.infrastructureCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  infrastructureCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="7"
              />
              <p className="text-xs text-muted-foreground">% of process cost from servers, storage, cloud resources</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">IT Support Hours Per Month</label>
              <Input
                type="number"
                step="1"
                value={process.implementationCosts?.itSupportHoursPerMonth === 0 ? '' : (process.implementationCosts?.itSupportHoursPerMonth || '')}
                onChange={(e) => onUpdate('implementationCosts', {
                  ...process.implementationCosts,
                  itSupportHoursPerMonth: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="20"
              />
              <p className="text-xs text-muted-foreground">Hours of IT support needed monthly (before automation)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">IT Hourly Rate ($)</label>
              <Input
                type="number"
                step="1"
                value={process.implementationCosts?.itHourlyRate === 0 ? '' : (process.implementationCosts?.itHourlyRate || '')}
                onChange={(e) => onUpdate('implementationCosts', {
                  ...process.implementationCosts,
                  itHourlyRate: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="75"
              />
              <p className="text-xs text-muted-foreground">Hourly rate for IT support staff</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">IT Support & Maintenance (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.itSupportMaintenance === 0 ? '' : (process.internalCosts?.itSupportMaintenance || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  itSupportMaintenance: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="6"
              />
              <p className="text-xs text-muted-foreground">% of process cost from IT support hours (patching, troubleshooting, upgrades)</p>
            </div>
          </TabsContent>

          {/* Risk Mitigation Internal Costs Tab - Moved to Risk Metrics section */}
          <TabsContent value="riskmitigation" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Risk Mitigation Costs:</strong> Enter each cost as a percentage of the total annual process cost. Automation helps reduce errors, audit burden, and downtime.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Error Remediation/Rework (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.errorRemediationCosts === 0 ? '' : (process.internalCosts?.errorRemediationCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  errorRemediationCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="9"
              />
              <p className="text-xs text-muted-foreground">% of process cost spent on error correction and rework</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Audit & Compliance Preparation (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.auditComplianceCosts === 0 ? '' : (process.internalCosts?.auditComplianceCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  auditComplianceCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">% of process cost for audit preparation and compliance reporting</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Business Continuity/Downtime (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.downtimeCosts === 0 ? '' : (process.internalCosts?.downtimeCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  downtimeCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">% of process cost from lost productivity during outages</p>
            </div>
          </TabsContent>

          {/* Opportunity Costs Tab */}
          <TabsContent value="opportunity" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Opportunity Costs:</strong> Enter each cost as a percentage of the total annual process cost. These represent the "soft dollar" value lost due to manual processes.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Decision-Making Delays (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.decisionDelays === 0 ? '' : (process.internalCosts?.decisionDelays || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  decisionDelays: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">% cost of time lag between task execution and usable insights</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Satisfaction Impact (%)</label>
              <Input
                type="number"
                step="0.1"
                value={process.internalCosts?.customerImpactCosts === 0 ? '' : (process.internalCosts?.customerImpactCosts || '')}
                onChange={(e) => onUpdate('internalCosts', {
                  ...process.internalCosts,
                  customerImpactCosts: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">% cost from SLA breaches and slow turnaround impacting customer retention</p>
            </div>
          </TabsContent>

          {/* FTE Utilization Tab */}
          <TabsContent value="fteutilization" className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>FTE Utilization:</strong> When automation frees up FTEs, they can be redeployed to higher-value work. Configure the redeployment value as a percentage of this process's annual compensation.
              </p>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip 
                label="Redeployment Value (% of Annual Salary)" 
                tooltip="Annual value created when freed FTEs are redeployed, as a percentage of their salary. 100% assumes full salary equivalent in new value. Lower percentages account for partial productivity or ramp-up time."
              />
              <Input
                type="number"
                value={process.utilizationImpact?.redeploymentValuePercentage === 0 ? '' : (process.utilizationImpact?.redeploymentValuePercentage || '')}
                onChange={(e) => onUpdate('utilizationImpact', {
                  ...process.utilizationImpact,
                  redeploymentValuePercentage: parseFloat(e.target.value) || 0
                })}
                onFocus={(e) => e.target.select()}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Annual value if redeployed, as % of this process's annual compensation (salary or hourly wage × 2,080 hours). Default 100% assumes full redeployment value.
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> FTE productivity uplift is calculated automatically based on FTEs freed and the redeployment value percentage applied to this process's annual compensation. This represents the additional business value created when employees are redeployed to higher-value work.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        </TooltipPrimitive.Provider>
        </form>
      </DialogContent>
      
      {/* Workflow Builder Modal */}
      {workflowOpen && (
        <StandaloneWorkflow
          processId={process.id}
          processName={process.name}
          organizationId={organizationId}
          onClose={() => setWorkflowOpen(false)}
          onSave={handleWorkflowSave}
          onComplexityUpdate={handleComplexityUpdate}
        />
      )}
    </Dialog>
  );
}
