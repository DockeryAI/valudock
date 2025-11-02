import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { ProcessData, GlobalDefaults } from './utils/calculations';

interface ProcessStandardMetricsProps {
  process: ProcessData;
  globalDefaults: GlobalDefaults;
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

export function ProcessStandardMetrics({ process, globalDefaults, onChange, onBack }: ProcessStandardMetricsProps) {
  const updateField = (field: keyof ProcessData, value: any) => {
    onChange({ ...process, [field]: value });
  };

  // Safety check for globalDefaults
  if (!globalDefaults) {
    return (
      <div className="space-y-4 p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-red-600 font-medium">Error: Global defaults not loaded</p>
        <p className="text-sm text-red-500">Please refresh the page or contact support if this issue persists.</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Process Name */}
      <div className="space-y-2">
        <Label>Process Name</Label>
        <Input
          value={process.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter process name"
        />
      </div>

      {/* Average Hourly Wage */}
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

      {/* Task Volume */}
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
        <div className="space-y-2">
          <Input
            type="number"
            value={process.taskVolume === 0 ? '' : (process.taskVolume || '')}
            onChange={(e) => updateField('taskVolume', parseFloat(e.target.value) || 0)}
            min={0}
            placeholder="Number of tasks"
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

      {/* Time per Task */}
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
        <div className="space-y-2">
          <Input
            type="number"
            value={process.timePerTask === 0 ? '' : (process.timePerTask || '')}
            onChange={(e) => updateField('timePerTask', parseFloat(e.target.value) || 0)}
            min={0}
            placeholder="Time value"
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

      {/* Automation Coverage */}
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

      {/* Save Button */}
      <div className="pt-4">
        <Button onClick={onBack} className="w-full">
          Save & Return
        </Button>
      </div>
    </div>
  );
}
