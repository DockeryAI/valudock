import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  DollarSign, 
  Calendar,
  InfoIcon,
  Clock,
  Users,
  Wrench
} from 'lucide-react';
import { ProcessData, GlobalDefaults } from './utils/calculations';

interface ImplementationEditorProps {
  process: ProcessData;
  globalDefaults: GlobalDefaults;
  onChange: (process: ProcessData) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
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
  disabled = false
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  tooltip: string;
  min?: number;
  disabled?: boolean;
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
        disabled={disabled}
      />
      {suffix && (
        <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10 whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export function ImplementationEditor({ 
  process, 
  globalDefaults, 
  onChange, 
  isExpanded, 
  onToggleExpansion 
}: ImplementationEditorProps) {
  
  // NOTE: IT Support Hours should NOT be auto-populated
  // Users must manually add advanced metrics in the Advanced Metrics dialog
  
  const updateImplementationCosts = (field: string, value: any) => {
    onChange({ 
      ...process, 
      implementationCosts: { ...process.implementationCosts, [field]: value }
    });
  };

  const totalUpfrontCosts = process.implementationCosts.upfrontCosts + 
    process.implementationCosts.trainingCosts + 
    process.implementationCosts.consultingCosts;

  const monthlySoftwareCost = process.implementationCosts.softwareCost;

  const implementationMonths = process.implementationCosts.implementationTimelineMonths;

  const automationCoverage = process.implementationCosts.automationCoverage;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="p-0 h-auto flex-shrink-0 mt-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">{process.name}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Implementation costs and timeline configuration
              </p>
            </div>
          </div>
          
          <div className="text-left sm:text-right text-xs sm:text-sm pl-9 sm:pl-0">
            <div className="font-medium">${Math.ceil(monthlySoftwareCost)}/mo • {automationCoverage}%</div>
            <div className="text-muted-foreground">{implementationMonths} months</div>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Use Global Settings Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Use Global Implementation Settings</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, this process will automatically use the global default values. Disable to customize.
                </p>
              </div>
              <Checkbox
                checked={process.implementationCosts.useGlobalSettings}
                onCheckedChange={(checked) => {
                  // When enabling global settings, copy global defaults to this process
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
                    // Just disable global settings, keep current values
                    updateImplementationCosts('useGlobalSettings', false);
                  }
                }}
              />
            </div>

            {/* Implementation Settings */}
              <div className="space-y-6">
                {/* Automation Strategy */}
                <div className="space-y-4">
                  <h4>Automation Strategy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Automation Coverage (%)"
                      value={process.implementationCosts.automationCoverage}
                      onChange={(value) => updateImplementationCosts('automationCoverage', value)}
                      suffix=""
                      tooltip="Percentage of tasks that can be automated for this specific process"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                    <InputField
                      label="Software Cost"
                      value={process.implementationCosts.softwareCost}
                      onChange={(value) => updateImplementationCosts('softwareCost', value)}
                      prefix="$"
                      tooltip="Monthly subscription or licensing costs for automation software specific to this process"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>

                <Separator />

                {/* One-time Implementation Costs */}
                <div className="space-y-4">
                  <h4>One-time Implementation Costs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="Upfront Setup Costs"
                      value={process.implementationCosts.upfrontCosts}
                      onChange={(value) => updateImplementationCosts('upfrontCosts', value)}
                      prefix="$"
                      tooltip="Initial setup fees, integration costs, hardware requirements for this process"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                    
                    <InputField
                      label="Training Costs"
                      value={process.implementationCosts.trainingCosts}
                      onChange={(value) => updateImplementationCosts('trainingCosts', value)}
                      prefix="$"
                      tooltip="Staff training and onboarding costs specific to this automation"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                    
                    <InputField
                      label="Consulting Costs"
                      value={process.implementationCosts.consultingCosts}
                      onChange={(value) => updateImplementationCosts('consultingCosts', value)}
                      prefix="$"
                      tooltip="External consultant or implementation partner costs for this process"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                  </div>
                </div>

                <Separator />

                {/* System Integration Costs */}
                <div className="space-y-4">
                  <h4>System Integration Costs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="API Licensing (Annual)"
                      value={process.implementationCosts.apiLicensing}
                      onChange={(value) => updateImplementationCosts('apiLicensing', value)}
                      prefix="$"
                      tooltip="Annual costs for API licenses and integrations required for this process"
                    />
                    
                    <InputField
                      label="IT Support (Hours/Month)"
                      value={parseFloat((process.implementationCosts.itSupportHoursPerMonth * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1))}
                      onChange={(value) => {}}
                      tooltip={`Auto-populated from Advanced Metrics (IT/Ops section) and reduced by ${process.implementationCosts.automationCoverage}% automation coverage. Original: ${process.implementationCosts.itSupportHoursPerMonth} hours/month → Reduced: ${(process.implementationCosts.itSupportHoursPerMonth * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1)} hours/month`}
                      disabled={true}
                    />
                    
                    <InputField
                      label="IT Hourly Rate"
                      value={process.implementationCosts.itHourlyRate}
                      onChange={(value) => updateImplementationCosts('itHourlyRate', value)}
                      prefix="$"
                      tooltip="Hourly rate for IT support staff"
                    />
                  </div>
                </div>

                <Separator />

                {/* Implementation Risk Factors */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4>Implementation Risk Factors</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            These factors contribute to the CFO Risk Score calculation. Rate each on a scale of 1-10, where higher values indicate greater complexity/risk.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Technology Novelty (1-10)"
                      value={process.complexityMetrics?.technologyNovelty || 5}
                      onChange={(value) => {
                        const currentMetrics = process.complexityMetrics || {
                          autoGatherFromWorkflow: false,
                          inputsCount: 0,
                          stepsCount: 0,
                          dependenciesCount: 0,
                          inputsScore: 1,
                          stepsScore: 1,
                          dependenciesScore: 1,
                          technologyNovelty: 5,
                          changeScope: 5
                        };
                        const clampedValue = Math.max(1, Math.min(10, value));
                        const updatedMetrics = {
                          ...currentMetrics,
                          technologyNovelty: clampedValue
                        };
                        onChange({
                          ...process,
                          complexityMetrics: {
                            ...updatedMetrics,
                            overallComplexityScore: (updatedMetrics.inputsScore + updatedMetrics.stepsScore + updatedMetrics.dependenciesScore + updatedMetrics.technologyNovelty + updatedMetrics.changeScope) / 5
                          }
                        });
                      }}
                      tooltip="How new or unfamiliar is the technology? (1=Familiar/proven, 10=Cutting-edge/experimental)"
                      min={1}
                    />
                    
                    <InputField
                      label="Change Scope (1-10)"
                      value={process.complexityMetrics?.changeScope || 5}
                      onChange={(value) => {
                        const currentMetrics = process.complexityMetrics || {
                          autoGatherFromWorkflow: false,
                          inputsCount: 0,
                          stepsCount: 0,
                          dependenciesCount: 0,
                          inputsScore: 1,
                          stepsScore: 1,
                          dependenciesScore: 1,
                          technologyNovelty: 5,
                          changeScope: 5
                        };
                        const clampedValue = Math.max(1, Math.min(10, value));
                        const updatedMetrics = {
                          ...currentMetrics,
                          changeScope: clampedValue
                        };
                        onChange({
                          ...process,
                          complexityMetrics: {
                            ...updatedMetrics,
                            overallComplexityScore: (updatedMetrics.inputsScore + updatedMetrics.stepsScore + updatedMetrics.dependenciesScore + updatedMetrics.technologyNovelty + updatedMetrics.changeScope) / 5
                          }
                        });
                      }}
                      tooltip="How extensive is the organizational change? (1=Minor adjustments, 10=Major transformation)"
                      min={1}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <strong>Note:</strong> These values feed into the Overall Complexity Score in Advanced Metrics → Process Complexity. They are weighted equally with workflow structure metrics (inputs, steps, dependencies).
                  </p>
                </div>

                <Separator />

                {/* Ongoing Costs After Automation */}
                {((process.internalCosts?.trainingOnboardingCosts || 0) > 0 || 
                  (process.internalCosts?.overtimePremiums || 0) > 0 || 
                  (process.internalCosts?.shadowSystemsCosts || 0) > 0 || 
                  (process.implementationCosts.itSupportHoursPerMonth > 0)) && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4>Ongoing Costs After Automation</h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                These are ongoing costs that will still be incurred after automation (reduced by automation coverage %).
                                These values come from Advanced Metrics and are weighted by the automation percentage for this process.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {(process.implementationCosts.itSupportHoursPerMonth > 0) && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">IT Support (Reduced):</span>
                              <span className="font-medium text-orange-700 dark:text-orange-400">
                                ${((process.implementationCosts.itSupportHoursPerMonth * (1 - (process.implementationCosts.automationCoverage / 100))) * 
                                  12 * process.implementationCosts.itHourlyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year
                              </span>
                            </div>
                          )}
                          {(process.internalCosts?.trainingOnboardingCosts || 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Training (Reduced):</span>
                              <span className="font-medium text-orange-700 dark:text-orange-400">
                                {((process.internalCosts?.trainingOnboardingCosts || 0) * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1)}% of process cost
                              </span>
                            </div>
                          )}
                          {(process.internalCosts?.overtimePremiums || 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Overtime (Reduced):</span>
                              <span className="font-medium text-orange-700 dark:text-orange-400">
                                {((process.internalCosts?.overtimePremiums || 0) * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1)}% of process cost
                              </span>
                            </div>
                          )}
                          {(process.internalCosts?.shadowSystemsCosts || 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Shadow Systems (Reduced):</span>
                              <span className="font-medium text-orange-700 dark:text-orange-400">
                                {((process.internalCosts?.shadowSystemsCosts || 0) * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1)}% of process cost
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Implementation Timeline */}
                <div className="space-y-4">
                  <h4>Implementation Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Implementation Duration (Weeks)"
                      value={process.implementationCosts.implementationTimelineMonths}
                      onChange={(value) => updateImplementationCosts('implementationTimelineMonths', value)}
                      tooltip="How many months it will take to fully implement this automation process"
                      disabled={process.implementationCosts.useGlobalSettings}
                    />
                    
                    <InputField
                      label="Start Week"
                      value={process.implementationCosts.startMonth}
                      onChange={(value) => updateImplementationCosts('startMonth', value)}
                      tooltip="Which week to begin implementation (1 = start immediately, 2 = start in week 2, etc.)"
                      min={1}
                    />
                  </div>
                </div>
              </div>

            {/* Cost Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h5 className="font-medium mb-3 text-sm sm:text-base">
                Cost Summary for {process.name}
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <div className="text-muted-foreground">Automation Coverage</div>
                  <div className="font-medium">{automationCoverage}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monthly Software</div>
                  <div className="font-medium">${Math.ceil(monthlySoftwareCost).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Upfront</div>
                  <div className="font-medium">${Math.ceil(totalUpfrontCosts).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Implementation</div>
                  <div className="font-medium">{implementationMonths} weeks</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Start Week</div>
                  <div className="font-medium">
                    Week {process.implementationCosts.startMonth}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}