import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner@2.0.3';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Plus, 
  Trash2, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Info,
  InfoIcon,
  Calculator,
  Copy,
  HelpCircle,
  Clock,
  Calendar as CalendarIcon,
  BarChart3,
  Edit,
  Pencil,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronUp
} from 'lucide-react';
import { InputData, ProcessData, ProcessGroup, createDefaultProcess, OverheadCosts } from './utils/calculations';
import { ProcessAdvancedMetricsDialog } from './ProcessAdvancedMetricsDialog';
import { useIsMobile } from './ui/use-mobile';
import { ProcessEditorMobile } from './ProcessEditorMobile';
import { GlobalSettingsWarningDialog } from './GlobalSettingsWarningDialog';
import { mustArray } from '../utils/arrayHelpers';

const DND_ITEM_TYPE = 'PROCESS';
const DND_GROUP_TYPE = 'GROUP';

interface InputsScreenTableProps {
  data: InputData;
  onChange: (data: InputData) => void;
  onWorkflowClick?: (processId: string, processName: string) => void;
  organizationId?: string;
}

interface DraggableProcessRowProps {
  process: ProcessData;
  children: React.ReactNode;
  onDrop: (processId: string, targetProcessId: string, position: 'before' | 'after') => void;
  groupName: string;
}

const DraggableProcessRow = ({ process, children, onDrop, groupName }: DraggableProcessRowProps) => {
  const rowRef = React.useRef<HTMLTableRowElement>(null);
  const [dropPosition, setDropPosition] = React.useState<'top' | 'bottom' | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DND_ITEM_TYPE,
    item: { id: process.id, name: process.name, groupName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [process.id, groupName]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DND_ITEM_TYPE,
    hover: (item: { id: string; name: string; groupName: string }, monitor) => {
      if (item.id === process.id) {
        setDropPosition(null);
        return;
      }

      const hoverBoundingRect = rowRef.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Determine if cursor is in top half or bottom half
      if (hoverClientY < hoverMiddleY) {
        setDropPosition('top');
      } else {
        setDropPosition('bottom');
      }
    },
    drop: (item: { id: string; name: string; groupName: string }, monitor) => {
      if (item.id === process.id) return;

      const hoverBoundingRect = rowRef.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Drop before if in top half, after if in bottom half
      const position = hoverClientY < hoverMiddleY ? 'before' : 'after';
      onDrop(item.id, process.id, position);
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [process.id, onDrop]);

  // Clear drop position when not hovering
  React.useEffect(() => {
    if (!isOver) {
      setDropPosition(null);
    }
  }, [isOver]);

  // Combine drag and drop refs with row ref
  const combinedRef = (node: HTMLTableRowElement | null) => {
    rowRef.current = node;
    drop(node);
  };

  const isActive = isOver && canDrop && dropPosition !== null;
  
  // Add border styling based on drop position
  const borderClass = isActive && dropPosition === 'top' 
    ? 'border-t-4 border-t-primary bg-primary/10' 
    : isActive && dropPosition === 'bottom'
    ? 'border-b-4 border-b-primary bg-primary/10'
    : '';

  return (
    <tr 
      ref={combinedRef}
      className={`border-b hover:bg-muted/25 relative transition-all ${isDragging ? 'opacity-50' : ''} ${borderClass}`}
    >
      <td className="p-2 border-r border-border relative" ref={drag}>
        <div className="cursor-move flex items-center justify-center">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* Visual indicator arrow - positioned in the middle of the row */}
        {isActive && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ 
            zIndex: 50
          }}>
            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
              {dropPosition === 'top' ? (
                <ArrowUp className="h-6 w-6" />
              ) : (
                <ArrowDown className="h-6 w-6" />
              )}
            </div>
          </div>
        )}
      </td>
      {children}
    </tr>
  );
};

interface DroppableGroupContainerProps {
  groupName: string;
  onDrop: (processId: string, targetGroup: string) => void;
  children: React.ReactNode;
  isEmpty: boolean;
}

const DroppableGroupContainer = ({ groupName, onDrop, children, isEmpty }: DroppableGroupContainerProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DND_ITEM_TYPE,
    drop: (item: { id: string; name: string; groupName: string }, monitor) => {
      // Only handle drop if it wasn't handled by a specific row (e.g., dropped in empty space)
      if (!monitor.didDrop()) {
        onDrop(item.id, groupName);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [groupName, onDrop]);

  const isActive = canDrop && isOver;
  
  return (
    <div 
      ref={drop}
      className={`border rounded-lg overflow-hidden transition-all ${
        isActive ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${canDrop ? 'border-primary' : ''} ${isEmpty ? 'min-h-[100px] flex items-center justify-center' : ''}`}
    >
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">Drag processes here</p>
      ) : (
        children
      )}
    </div>
  );
};

interface DraggableGroupSectionProps {
  groupName: string;
  isUngrouped: boolean;
  onReorder: (draggedGroup: string, targetGroup: string, position: 'before' | 'after') => void;
  children: (dragHandleRef: (node: HTMLDivElement | null) => void) => React.ReactNode;
}

const DraggableGroupSection = ({ groupName, isUngrouped, onReorder, children }: DraggableGroupSectionProps) => {
  const dragRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: DND_GROUP_TYPE,
    item: { groupName },
    canDrag: !isUngrouped, // Can't drag the ungrouped section
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [groupName, isUngrouped]);

  const [{ isOverBefore }, dropBefore] = useDrop(() => ({
    accept: DND_GROUP_TYPE,
    drop: (item: { groupName: string }) => {
      if (item.groupName !== groupName) {
        onReorder(item.groupName, groupName, 'before');
      }
    },
    collect: (monitor) => ({
      isOverBefore: monitor.isOver() && monitor.canDrop(),
    }),
  }), [groupName, onReorder]);

  const [{ isOverAfter }, dropAfter] = useDrop(() => ({
    accept: DND_GROUP_TYPE,
    drop: (item: { groupName: string }) => {
      if (item.groupName !== groupName) {
        onReorder(item.groupName, groupName, 'after');
      }
    },
    collect: (monitor) => ({
      isOverAfter: monitor.isOver() && monitor.canDrop(),
    }),
  }), [groupName, onReorder]);
  
  // Connect the drag ref
  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef);
    }
  }, [drag]);

  return (
    <div className={`relative ${isDragging ? 'opacity-50' : ''}`}>
      {/* Drop zone before the group - always visible with minimal height, expands on hover */}
      {!isUngrouped && (
        <div 
          ref={dropBefore} 
          className={`transition-all ${isOverBefore ? 'h-8 bg-primary/20 border-2 border-dashed border-primary rounded mb-2 flex items-center justify-center' : 'h-2'}`}
        >
          {isOverBefore && <span className="text-xs text-primary font-medium">Drop here</span>}
        </div>
      )}
      
      <div ref={dragPreview}>
        {children((node) => {
          if (node) {
            dragRef.current = node;
            drag(node);
          }
        })}
      </div>
      
      {/* Drop zone after the group - always visible with minimal height, expands on hover */}
      {!isUngrouped && (
        <div 
          ref={dropAfter} 
          className={`transition-all ${isOverAfter ? 'h-8 bg-primary/20 border-2 border-dashed border-primary rounded mt-2 flex items-center justify-center' : 'h-2'}`}
        >
          {isOverAfter && <span className="text-xs text-primary font-medium">Drop here</span>}
        </div>
      )}
    </div>
  );
};

const TableHeader = ({ children, tooltip }: { children: React.ReactNode, tooltip?: string }) => (
  <th className="p-3 text-left border-r border-border bg-muted/50 sticky top-0 z-10">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{children}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  </th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <td className={`p-2 border-r border-border ${className}`}>
    {children}
  </td>
);

const NumberInput = ({ 
  value, 
  onChange, 
  prefix = "",
  suffix = "",
  placeholder = "0",
  className = "",
  isPrepopulated = false
}: {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  isPrepopulated?: boolean;
}) => (
  <div className="relative inline-flex items-center">
    {prefix && <span className="absolute left-3 text-muted-foreground pointer-events-none">{prefix}</span>}
    <Input
      type="number"
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      onFocus={(e) => e.target.select()}
      className={`w-20 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${isPrepopulated && value > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700' : ''} ${className}`}
      placeholder={placeholder}
    />
    {suffix && <span className="absolute right-3 text-muted-foreground pointer-events-none">{suffix}</span>}
  </div>
);

// Peak Months Input Component with auto-recognition
const PeakMonthsInput = ({ 
  value, 
  onChange 
}: { 
  value: number[]; 
  onChange: (months: number[]) => void; 
}) => {
  const [inputValue, setInputValue] = useState('');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formatMonthsDisplay = (months: number[]) => {
    if (months.length === 0) return '';
    const sortedMonths = [...months].sort((a, b) => a - b);
    return sortedMonths.map(m => monthNames[m]).join(', ');
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
          startMonth = monthNames.findIndex(m => m.toLowerCase().startsWith(start));
        } else {
          startMonth -= 1; // Convert 1-based to 0-based
        }
        
        if (isNaN(endMonth)) {
          endMonth = monthNames.findIndex(m => m.toLowerCase().startsWith(end));
        } else {
          endMonth -= 1; // Convert 1-based to 0-based
        }
        
        if (startMonth >= 0 && endMonth >= 0 && startMonth <= 11 && endMonth <= 11) {
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
          monthNum = monthNames.findIndex(m => m.toLowerCase().startsWith(part));
        } else {
          monthNum -= 1; // Convert 1-based to 0-based
        }
        
        if (monthNum >= 0 && monthNum <= 11 && !monthNumbers.includes(monthNum)) {
          monthNumbers.push(monthNum);
        }
      }
    }
    
    return monthNumbers;
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="e.g., jan-mar, jul, dec"
        className="w-32 text-xs"
        onBlur={() => {
          const months = parseMonthsInput(inputValue);
          onChange(months);
          setInputValue('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const months = parseMonthsInput(inputValue);
            onChange(months);
            setInputValue('');
          }
        }}
      />
      {value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {formatMonthsDisplay(value)} ({value.length} month{value.length !== 1 ? 's' : ''})
        </div>
      )}
    </div>
  );
};



// SLA Checkbox with Tooltip
const SLACheckboxWithTooltip = ({ 
  process, 
  onUpdate 
}: { 
  process: ProcessData; 
  onUpdate: (sla: any) => void; 
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      // Enable SLA and show dialog
      onUpdate({
        ...process.slaRequirements,
        hasSLA: true
      });
      setShowDialog(true);
    } else {
      onUpdate({
        ...process.slaRequirements,
        hasSLA: false
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={process.slaRequirements.hasSLA}
                onCheckedChange={handleCheckboxChange}
              />
              {process.slaRequirements.hasSLA && (
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </TooltipTrigger>
          {process.slaRequirements.hasSLA && (
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div><strong>Target:</strong> {process.slaRequirements.slaTarget}</div>
                <div><strong>Cost:</strong> ${Math.ceil(process.slaRequirements.costOfMissing)} {process.slaRequirements.costUnit}</div>
                <div><strong>Avg Misses:</strong> {process.slaRequirements.averageMissesPerMonth}/month</div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {process.slaRequirements.hasSLA && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
              Setup
            </Button>
          </DialogTrigger>
          <DialogContent onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setShowDialog(false);
            }
          }}>
            <DialogHeader>
              <DialogTitle>SLA Configuration</DialogTitle>
              <DialogDescription>
                Configure Service Level Agreement requirements and compliance costs for this process.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SLA Target (%)</label>
                <Input
                  value={process.slaRequirements.slaTarget}
                  onChange={(e) => onUpdate({...process.slaRequirements, slaTarget: e.target.value})}
                  placeholder="e.g., 2 hours, 99.9% uptime"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost of Missing SLA</label>
                <div className="flex gap-2">
                  <div className="relative inline-flex items-center">
                    <span className="absolute left-3 text-muted-foreground pointer-events-none">$</span>
                    <Input
                      type="number"
                      value={process.slaRequirements.costOfMissing === 0 ? '' : (process.slaRequirements.costOfMissing || '')}
                      onChange={(e) => onUpdate({...process.slaRequirements, costOfMissing: parseFloat(e.target.value) || 0})}
                      className="pl-8 w-32"
                    />
                  </div>
                  <Select
                    value={process.slaRequirements.costUnit}
                    onValueChange={(value) => onUpdate({...process.slaRequirements, costUnit: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-minute">Per Minute</SelectItem>
                      <SelectItem value="per-hour">Per Hour</SelectItem>
                      <SelectItem value="per-day">Per Day</SelectItem>
                      <SelectItem value="per-month">Per Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Average SLAs Not Met (per month)</label>
                <Input
                  type="number"
                  value={process.slaRequirements.averageMissesPerMonth === 0 ? '' : (process.slaRequirements.averageMissesPerMonth || '')}
                  onChange={(e) => onUpdate({...process.slaRequirements, averageMissesPerMonth: parseFloat(e.target.value) || 0})}
                  className="w-20"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={() => setShowDialog(false)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Helper functions for parsing hour ranges
const parseHourRanges = (input: string): number[] => {
  const parts = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const hours: number[] = [];
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Handle ranges like "13:00-15:00" or "9-12"
      const [start, end] = part.split('-').map(s => s.trim());
      let startHour = parseTimeString(start);
      let endHour = parseTimeString(end);
      
      if (startHour !== null && endHour !== null && startHour >= 0 && endHour >= 0 && startHour <= 23 && endHour <= 23) {
        // Handle ranges that span midnight
        if (startHour <= endHour) {
          for (let i = startHour; i <= endHour; i++) {
            if (!hours.includes(i)) hours.push(i);
          }
        } else {
          // Range spans midnight (e.g., 22-02)
          for (let i = startHour; i <= 23; i++) {
            if (!hours.includes(i)) hours.push(i);
          }
          for (let i = 0; i <= endHour; i++) {
            if (!hours.includes(i)) hours.push(i);
          }
        }
      }
    } else {
      // Handle individual hours like "14" or "13:30"
      const hour = parseTimeString(part);
      if (hour !== null && hour >= 0 && hour <= 23 && !hours.includes(hour)) {
        hours.push(hour);
      }
    }
  }
  
  return hours.sort((a, b) => a - b);
};

const parseTimeString = (timeStr: string): number | null => {
  // Handle format like "13:30" or "9" or "14"
  if (timeStr.includes(':')) {
    const [hourStr] = timeStr.split(':');
    const hour = parseInt(hourStr);
    return (hour >= 0 && hour <= 23) ? hour : null;
  } else {
    const hour = parseInt(timeStr);
    return (hour >= 0 && hour <= 23) ? hour : null;
  }
};

const formatHoursDisplay = (hours: number[]): string => {
  if (hours.length === 0) return '';
  
  // Group consecutive hours into ranges
  const sorted = [...hours].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(start.toString());
      } else if (end === start + 1) {
        ranges.push(`${start},${end}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    }
  }
  
  return ranges.join(', ');
};

// Cyclical Volume Input Component
const CyclicalVolumeInput = ({ 
  cyclicalPattern, 
  onChange 
}: { 
  cyclicalPattern: any; 
  onChange: (pattern: any) => void; 
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleTypeChange = (type: 'none' | 'hourly' | 'daily' | 'monthly') => {
    onChange({
      ...cyclicalPattern,
      type,
      peakHours: type === 'hourly' ? cyclicalPattern.peakHours : [],
      peakDays: type === 'daily' ? cyclicalPattern.peakDays : [],
      peakDatesOfMonth: type === 'monthly' ? cyclicalPattern.peakDatesOfMonth : []
    });
  };

  const formatCyclicalDisplay = () => {
    if (cyclicalPattern.type === 'none') return 'None';
    if (cyclicalPattern.type === 'hourly' && cyclicalPattern.peakHours.length > 0) {
      return `Peak Hours: ${cyclicalPattern.peakHours.map((h: number) => `${h}:00`).join(', ')}`;
    }
    if (cyclicalPattern.type === 'daily' && cyclicalPattern.peakDays.length > 0) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Peak Days: ${cyclicalPattern.peakDays.map((d: number) => days[d]).join(', ')}`;
    }
    if (cyclicalPattern.type === 'monthly' && cyclicalPattern.peakDatesOfMonth.length > 0) {
      const dates = [...cyclicalPattern.peakDatesOfMonth].sort((a, b) => a - b);
      // Format as ranges
      const ranges: string[] = [];
      let rangeStart = dates[0];
      let rangeEnd = dates[0];
      
      for (let i = 1; i < dates.length; i++) {
        if (dates[i] === rangeEnd + 1) {
          rangeEnd = dates[i];
        } else {
          ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
          rangeStart = dates[i];
          rangeEnd = dates[i];
        }
      }
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
      
      return `Peak Dates: ${ranges.join(', ')} monthly`;
    }
    return cyclicalPattern.type;
  };

  return (
    <div className="space-y-2">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full text-xs h-6">
            {formatCyclicalDisplay()}
          </Button>
        </DialogTrigger>
        <DialogContent onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setShowDialog(false);
          }
        }}>
          <DialogHeader>
            <DialogTitle>Cyclical Volume Patterns</DialogTitle>
            <DialogDescription>
              Define recurring patterns of high-volume periods that affect labor costs and capacity requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pattern Type</label>
              <Select
                value={cyclicalPattern.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Pattern</SelectItem>
                  <SelectItem value="hourly">Peak Hours of Day</SelectItem>
                  <SelectItem value="daily">Peak Days of Week</SelectItem>
                  <SelectItem value="monthly">Peak Days of Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {cyclicalPattern.type === 'hourly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Peak Hours (24 Hour Format)</label>
                <Input
                  placeholder="e.g., 9,10,14-16,20 or 13:00-15:00,18:30"
                  onChange={(e) => {
                    const hours = parseHourRanges(e.target.value);
                    onChange({...cyclicalPattern, peakHours: hours});
                  }}
                  value={formatHoursDisplay(cyclicalPattern.peakHours)}
                />
                <p className="text-xs text-muted-foreground">Supports ranges (13:00-15:00) and individual hours (9,14,20)</p>
              </div>
            )}
            
            {cyclicalPattern.type === 'daily' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Peak Days (0=Sunday, 6=Saturday)</label>
                <Input
                  placeholder="e.g., 1,2,3,4,5 (weekdays)"
                  onChange={(e) => {
                    const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 0 && d <= 6);
                    onChange({...cyclicalPattern, peakDays: days});
                  }}
                  value={cyclicalPattern.peakDays.join(', ')}
                />
                <p className="text-xs text-muted-foreground">Weekend/holiday premiums apply</p>
              </div>
            )}
            
            {cyclicalPattern.type === 'monthly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Peak Dates of Month (1-31)</label>
                <Input
                  placeholder="e.g., 1,15,30 (month-end processing)"
                  onChange={(e) => {
                    const dates = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 1 && d <= 31);
                    onChange({...cyclicalPattern, peakDatesOfMonth: dates});
                  }}
                  value={cyclicalPattern.peakDatesOfMonth.join(', ')}
                />
                <p className="text-xs text-muted-foreground">Higher volumes on specific dates</p>
              </div>
            )}
            
            {cyclicalPattern.type !== 'none' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume Multiplier</label>
                <NumberInput
                  value={cyclicalPattern.multiplier}
                  onChange={(value) => onChange({...cyclicalPattern, multiplier: value})}
                  suffix="x"
                  className="w-20"
                />
                <p className="text-xs text-muted-foreground">Multiplier for peak periods</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Group Management Dialog Components
const GroupManagementDialog = ({ 
  groups, 
  processes, 
  onAddGroup, 
  onEditGroup, 
  onDeleteGroup,
  onMoveProcessesToGroup,
  globalDefaults
}: { 
  groups: ProcessGroup[];
  processes: ProcessData[];
  onAddGroup: (group: ProcessGroup) => void;
  onEditGroup: (group: ProcessGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onMoveProcessesToGroup: (processIds: string[], groupName: string) => void;
  globalDefaults: any;
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProcessGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupEngine, setGroupEngine] = useState<'Value Creation' | 'Marketing and Sales' | 'Value Delivery' | 'Finance'>('Value Delivery');
  const [groupHourlyWage, setGroupHourlyWage] = useState<number | ''>('');
  const [groupAnnualSalary, setGroupAnnualSalary] = useState<number | ''>('');
  const [selectedProcessIds, setSelectedProcessIds] = useState<Set<string>>(new Set());
  const [debugClickCount, setDebugClickCount] = useState(0);

  const handleAddGroup = () => {
    setDebugClickCount(prev => prev + 1);
    console.log('🆕 handleAddGroup called with:', { newGroupName, newGroupDescription, clickCount: debugClickCount + 1 });
    
    if (!newGroupName.trim()) {
      console.log('⚠️ Group name is empty, not adding group');
      // toast.error('Please enter a group name');
      return;
    }
    
    // Generate unique ID with timestamp to prevent duplicates
    const baseId = newGroupName.toLowerCase().replace(/\s+/g, '-');
    const uniqueId = `${baseId}-${Date.now()}`;
    
    const newGroup = {
      id: uniqueId,
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      engine: groupEngine,
      averageHourlyWage: groupHourlyWage === '' ? undefined : groupHourlyWage,
      annualSalary: groupAnnualSalary === '' ? undefined : groupAnnualSalary
    };
    
    console.log('✅ Adding group:', newGroup);
    onAddGroup(newGroup);
    
    // Move selected processes to the new group
    if (selectedProcessIds.size > 0) {
      console.log('📦 Moving processes to new group:', Array.from(selectedProcessIds));
      onMoveProcessesToGroup(Array.from(selectedProcessIds), newGroupName.trim());
    }
    
    // Reset form and close dialog
    setNewGroupName('');
    setNewGroupDescription('');
    setGroupEngine('Value Delivery');
    setGroupHourlyWage('');
    setGroupAnnualSalary('');
    setSelectedProcessIds(new Set());
    setShowAddDialog(false);
    console.log('✅ Group added successfully, dialog closed');
  };

  const toggleProcessSelection = (processId: string) => {
    const newSelection = new Set(selectedProcessIds);
    if (newSelection.has(processId)) {
      newSelection.delete(processId);
    } else {
      newSelection.add(processId);
    }
    setSelectedProcessIds(newSelection);
  };

  const handleEditGroup = (group: ProcessGroup) => {
    if (newGroupName.trim()) {
      onEditGroup({
        ...group,
        name: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      setEditingGroup(null);
      setNewGroupName('');
      setNewGroupDescription('');
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const processCount = processes.filter(p => p.group === groupId).length;
    if (processCount > 0) {
      if (confirm(`This will delete ${processCount} processes in this group. Are you sure?`)) {
        onDeleteGroup(groupId);
      }
    } else {
      onDeleteGroup(groupId);
    }
  };

  return (
    <>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Group
          </Button>
        </DialogTrigger>
        <DialogContent onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && newGroupName.trim()) {
            e.preventDefault();
            handleAddGroup();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new process group to organize and categorize your business processes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGroup();
                  }
                }}
                placeholder="e.g., Operations"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGroup();
                  }
                }}
                placeholder="e.g., Operational processes and workflows"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Engine</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium text-xs">{groupEngine}</p>
                        <p className="text-xs">
                          {groupEngine === 'Value Creation' && 'Foundation of business: What you offer and problems you solve'}
                          {groupEngine === 'Marketing and Sales' && 'Generating demand and converting prospects into customers'}
                          {groupEngine === 'Value Delivery' && 'Operations: Ensuring customers get what they were promised'}
                          {groupEngine === 'Finance' && 'The fuel: Cash flow, profit, and financial health'}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={groupEngine} onValueChange={(value: any) => setGroupEngine(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Value Creation">Value Creation</SelectItem>
                  <SelectItem value="Marketing and Sales">Marketing and Sales</SelectItem>
                  <SelectItem value="Value Delivery">Value Delivery</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-md space-y-3 border border-border">
              <p className="text-xs text-muted-foreground">
                Optional: Set default compensation for processes in this group
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hourly Wage (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={groupHourlyWage}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setGroupHourlyWage(value);
                      if (typeof value === 'number' && value > 0) {
                        setGroupAnnualSalary(Math.round(value * 2080));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGroup();
                      }
                    }}
                    placeholder={`${globalDefaults.averageHourlyWage || 20}`}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Salary (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={groupAnnualSalary}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setGroupAnnualSalary(value);
                      if (typeof value === 'number' && value > 0) {
                        setGroupHourlyWage(Math.ceil((value / 2080) * 100) / 100);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGroup();
                      }
                    }}
                    placeholder={`${globalDefaults.annualSalary || 41600}`}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            
            {processes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Existing Processes (Optional)</label>
                <p className="text-xs text-muted-foreground">Select processes to move into this group</p>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {processes.map(process => (
                    <div key={process.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedProcessIds.has(process.id)}
                        onCheckedChange={() => toggleProcessSelection(process.id)}
                      />
                      <span className="text-sm">{process.name}</span>
                      {process.group && (
                        <Badge variant="outline" className="text-xs">
                          Currently in: {process.group}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setNewGroupName('');
                setNewGroupDescription('');
                setGroupEngine('Value Delivery');
                setGroupHourlyWage('');
                setGroupAnnualSalary('');
                setSelectedProcessIds(new Set());
              }}>Cancel</Button>
              <Button onClick={handleAddGroup}>Add Group</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Add Process Dialog Component
const AddProcessDialog = ({ 
  groups,
  onAddProcess,
  trigger,
  externalOpen,
  onExternalOpenChange,
  globalDefaults
}: { 
  groups: ProcessGroup[];
  onAddProcess: (groupSelection: 'none' | 'existing' | 'new', groupName?: string, newGroupDescription?: string, processName?: string, hourlyWage?: number, annualSalary?: number) => void;
  trigger?: React.ReactNode;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  globalDefaults: GlobalDefaults;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [processName, setProcessName] = useState('');
  const [groupOption, setGroupOption] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupHourlyWage, setGroupHourlyWage] = useState<number | ''>('');
  const [groupAnnualSalary, setGroupAnnualSalary] = useState<number | ''>('');

  // Use external state if provided, otherwise use internal state
  const showDialog = externalOpen !== undefined ? externalOpen : internalOpen;
  const setShowDialog = onExternalOpenChange || setInternalOpen;

  const handleAddProcess = () => {
    if (groupOption === 'new' && !newGroupName.trim()) {
      return; // Don't allow empty group name
    }
    
    if (groupOption === 'existing' && !selectedGroup) {
      return; // Don't allow without selecting a group
    }

    const groupName = groupOption === 'new' ? newGroupName.trim() : 
                     groupOption === 'existing' ? selectedGroup : undefined;

    const hourlyWage = groupHourlyWage === '' ? undefined : Number(groupHourlyWage);
    const annualSalary = groupAnnualSalary === '' ? undefined : Number(groupAnnualSalary);

    onAddProcess(groupOption, groupName, newGroupDescription.trim(), processName.trim(), hourlyWage, annualSalary);
    
    // Reset state
    setProcessName('');
    setGroupOption('none');
    setSelectedGroup('');
    setNewGroupName('');
    setNewGroupDescription('');
    setGroupHourlyWage('');
    setGroupAnnualSalary('');
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent onKeyDown={(e) => {
        if (e.key === 'Enter' && 
            !((groupOption === 'new' && !newGroupName.trim()) || 
              (groupOption === 'existing' && !selectedGroup))) {
          e.preventDefault();
          handleAddProcess();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Add New Process</DialogTitle>
          <DialogDescription>
            Add a new process and optionally assign it to a group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Process Name</label>
            <Input
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="e.g., Invoice Processing"
              autoFocus
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Group Assignment</label>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="no-group"
                checked={groupOption === 'none'}
                onChange={() => setGroupOption('none')}
                className="h-4 w-4"
              />
              <label htmlFor="no-group" className="text-sm cursor-pointer">
                Leave ungrouped
              </label>
            </div>

            {groups.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing-group"
                    checked={groupOption === 'existing'}
                    onChange={() => setGroupOption('existing')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="existing-group" className="text-sm cursor-pointer">
                    Add to existing group
                  </label>
                </div>
                
                {groupOption === 'existing' && (
                  <div className="ml-6">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group, index) => (
                          <SelectItem key={`${group.id}-${index}`} value={group.name}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-group"
                  checked={groupOption === 'new'}
                  onChange={() => setGroupOption('new')}
                  className="h-4 w-4"
                />
                <label htmlFor="new-group" className="text-sm cursor-pointer">
                  Create new group for this process
                </label>
              </div>
              
              {groupOption === 'new' && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Group Name</label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Operations"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="e.g., Operational processes"
                    />
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md space-y-3 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Optional: Set default compensation for processes in this group
                    </p>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hourly Wage (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={groupHourlyWage}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                            setGroupHourlyWage(value);
                            if (typeof value === 'number' && value > 0) {
                              setGroupAnnualSalary(Math.round(value * 2080));
                            }
                          }}
                          placeholder={`${globalDefaults.averageHourlyWage || 20}`}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Salary (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={groupAnnualSalary}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                            setGroupAnnualSalary(value);
                            if (typeof value === 'number' && value > 0) {
                              setGroupHourlyWage(Math.ceil((value / 2080) * 100) / 100);
                            }
                          }}
                          placeholder={`${globalDefaults.annualSalary || 41600}`}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowDialog(false);
              setGroupOption('none');
              setSelectedGroup('');
              setNewGroupName('');
              setNewGroupDescription('');
              setGroupHourlyWage('');
              setGroupAnnualSalary('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddProcess}
              disabled={
                (groupOption === 'new' && !newGroupName.trim()) ||
                (groupOption === 'existing' && !selectedGroup)
              }
            >
              Add Process
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function InputsScreenTable({ data, onChange, onWorkflowClick, organizationId }: InputsScreenTableProps) {
  // ✅ CRITICAL: Validate all array props at component boundary - THROWS on error
  const safeProcesses = mustArray('InputsScreenTable.data.processes', data.processes);
  const safeGroups = mustArray('InputsScreenTable.data.groups', data.groups);
  
  // Use safe arrays for all internal operations
  const safeData = {
    ...data,
    processes: safeProcesses,
    groups: safeGroups,
  };
  
  const [expandedOverhead, setExpandedOverhead] = useState(false);
  const [expandedCompensation, setExpandedCompensation] = useState(false);
  const [expandedBusinessHours, setExpandedBusinessHours] = useState(false);
  const [salaryMode, setSalaryMode] = useState(safeData.globalDefaults.salaryMode || false);
  const [editingGroup, setEditingGroup] = useState<ProcessGroup | null>(null);
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
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [editingCFOFields, setEditingCFOFields] = useState<string | null>(null);
  const [showAddProcessDialog, setShowAddProcessDialog] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [tempGroupName, setTempGroupName] = useState<string>('');
  const [editingProcessName, setEditingProcessName] = useState<string | null>(null);
  const [tempProcessName, setTempProcessName] = useState<string>('');
  const isMobile = useIsMobile();
  
  // Debug: Log when data.groups changes
  const [lastRenderTime, setLastRenderTime] = useState(new Date().toISOString());
  
  useEffect(() => {
    setLastRenderTime(new Date().toISOString());
    console.log('🔄 InputsScreenTable received data update:', {
      groupCount: safeGroups.length,
      groups: safeGroups
    });
  }, [safeGroups]);
  
  // Handle Enter key to open Add Process dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Enter is pressed and not in an input, textarea, or other dialog
      if (e.key === 'Enter' && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement) &&
          !document.querySelector('[role="dialog"]')) {
        e.preventDefault();
        setShowAddProcessDialog(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper function to get advanced metrics summary
  const getAdvancedMetricsSummary = (process: ProcessData): { label: string; value: string }[] => {
    const metrics: { label: string; value: string }[] = [];
    
    // Cyclical pattern
    if (process.cyclicalPattern?.type && process.cyclicalPattern.type !== 'none') {
      metrics.push({ label: 'Cyclical', value: process.cyclicalPattern.type });
      
      // Show peak hours if hourly cyclical pattern
      if (process.cyclicalPattern.type === 'hourly' && process.cyclicalPattern.peakHours && process.cyclicalPattern.peakHours.length > 0) {
        const hours = process.cyclicalPattern.peakHours;
        const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
        
        // If it's a continuous range, show as "09:00-17:00"
        if (hours.length > 1) {
          const ranges: string[] = [];
          let rangeStart = hours[0];
          let rangeEnd = hours[0];
          
          for (let i = 1; i < hours.length; i++) {
            if (hours[i] === rangeEnd + 1) {
              rangeEnd = hours[i];
            } else {
              ranges.push(rangeStart === rangeEnd ? formatHour(rangeStart) : `${formatHour(rangeStart)}-${formatHour(rangeEnd)}`);
              rangeStart = hours[i];
              rangeEnd = hours[i];
            }
          }
          ranges.push(rangeStart === rangeEnd ? formatHour(rangeStart) : `${formatHour(rangeStart)}-${formatHour(rangeEnd)}`);
          
          metrics.push({ label: 'Peak Hours', value: ranges.join(', ') });
        } else {
          metrics.push({ label: 'Peak Hours', value: formatHour(hours[0]) });
        }
      }
    }
    
    // SLA
    if (process.slaRequirements?.slaTarget) {
      metrics.push({ label: 'SLA Target', value: process.slaRequirements.slaTarget });
    }
    if (process.slaRequirements?.costOfMissing && process.slaRequirements.costOfMissing > 0) {
      metrics.push({ label: 'SLA Cost', value: `${process.slaRequirements.costOfMissing}/${process.slaRequirements.costUnit || 'month'}` });
    }
    
    // Task Type
    if (process.taskType && process.taskType !== 'standard') {
      metrics.push({ label: 'Task Type', value: process.taskType });
    }
    
    // Seasonal Pattern
    if (process.seasonalPattern?.peakMonths && process.seasonalPattern.peakMonths.length > 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const months = process.seasonalPattern.peakMonths.map(m => monthNames[m]).join(', ');
      metrics.push({ label: 'Peak Months', value: months });
    }
    
    // Error Costs
    if (process.errorReworkCosts?.errorRate && process.errorReworkCosts.errorRate > 0) {
      metrics.push({ label: 'Error Rate', value: `${process.errorReworkCosts.errorRate}%` });
    }
    if (process.errorReworkCosts?.reworkCostPercentage && process.errorReworkCosts.reworkCostPercentage > 0) {
      metrics.push({ label: 'Rework Cost', value: `${process.errorReworkCosts.reworkCostPercentage}% of task cost` });
    } else if (process.errorReworkCosts?.reworkCostPerError && process.errorReworkCosts.reworkCostPerError > 0) {
      // Fallback for backward compatibility
      metrics.push({ label: 'Rework Cost', value: `${process.errorReworkCosts.reworkCostPerError}` });
    }
    
    // Compliance
    if (process.complianceRisk?.hasComplianceRisk) {
      // New detailed fine structure
      if (process.complianceRisk.fineType) {
        metrics.push({ label: 'Fine Type', value: process.complianceRisk.fineType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) });
        
        // Show fine-specific details
        switch (process.complianceRisk.fineType) {
          case 'daily':
            if (process.complianceRisk.amountPerDay && process.complianceRisk.expectedDurationDays) {
              const totalExposure = process.complianceRisk.amountPerDay * process.complianceRisk.expectedDurationDays;
              metrics.push({ label: 'Daily Fine', value: `${process.complianceRisk.amountPerDay.toLocaleString()}/day × ${process.complianceRisk.expectedDurationDays} days` });
              metrics.push({ label: 'Total Exposure', value: `${totalExposure.toLocaleString()}` });
            }
            break;
          case 'per-incident':
            if (process.complianceRisk.amountPerIncident && process.complianceRisk.expectedIncidentsPerYear) {
              const totalExposure = process.complianceRisk.amountPerIncident * process.complianceRisk.expectedIncidentsPerYear;
              metrics.push({ label: 'Per Incident', value: `${process.complianceRisk.amountPerIncident.toLocaleString()} × ${process.complianceRisk.expectedIncidentsPerYear}/yr` });
              metrics.push({ label: 'Total Exposure', value: `${totalExposure.toLocaleString()}` });
            }
            break;
          case 'per-record':
            if (process.complianceRisk.amountPerRecord && process.complianceRisk.recordsAtRisk) {
              const totalExposure = process.complianceRisk.amountPerRecord * process.complianceRisk.recordsAtRisk;
              metrics.push({ label: 'Per Record', value: `${process.complianceRisk.amountPerRecord.toLocaleString()} × ${process.complianceRisk.recordsAtRisk.toLocaleString()} records` });
              metrics.push({ label: 'Total Exposure', value: `${totalExposure.toLocaleString()}` });
            }
            break;
          case 'percent-revenue':
            if (process.complianceRisk.percentageRate && process.complianceRisk.revenueAtRisk) {
              const totalExposure = (process.complianceRisk.revenueAtRisk * process.complianceRisk.percentageRate) / 100;
              metrics.push({ label: '% of Revenue', value: `${process.complianceRisk.percentageRate}% of ${process.complianceRisk.revenueAtRisk.toLocaleString()}` });
              metrics.push({ label: 'Total Exposure', value: `${totalExposure.toLocaleString()}` });
            }
            break;
        }
        
        // Show probability
        if (process.complianceRisk.probabilityOfOccurrence !== undefined && process.complianceRisk.probabilityOfOccurrence > 0) {
          metrics.push({ label: 'Probability', value: `${process.complianceRisk.probabilityOfOccurrence}%` });
        }
      } else if (process.complianceRisk.annualPenaltyRisk && process.complianceRisk.annualPenaltyRisk > 0) {
        // Backward compatibility: show legacy field
        metrics.push({ label: 'Compliance Risk', value: `${Math.ceil(process.complianceRisk.annualPenaltyRisk).toLocaleString()}` });
      }
    }
    
    // Revenue Impact
    if (process.revenueImpact?.annualProcessRevenue && process.revenueImpact.annualProcessRevenue > 0) {
      metrics.push({ label: 'Process Revenue', value: `${Math.ceil(process.revenueImpact.annualProcessRevenue).toLocaleString()}` });
    }
    if (process.revenueImpact?.upliftPercentageIf100Automated && process.revenueImpact.upliftPercentageIf100Automated > 0) {
      metrics.push({ label: 'Revenue Uplift', value: `${process.revenueImpact.upliftPercentageIf100Automated}%` });
    }
    if (process.revenueImpact?.annualInvoiceProcessingVolume && process.revenueImpact.annualInvoiceProcessingVolume > 0) {
      metrics.push({ label: 'Invoice Volume', value: `${Math.ceil(process.revenueImpact.annualInvoiceProcessingVolume).toLocaleString()}` });
    }
    if (process.revenueImpact?.promptPaymentDiscountPercentage && process.revenueImpact.promptPaymentDiscountPercentage > 0 && 
        process.revenueImpact?.promptPaymentWindowDays && process.revenueImpact.promptPaymentWindowDays > 0) {
      metrics.push({ label: 'Prompt Payment', value: `${process.revenueImpact.promptPaymentDiscountPercentage}% in ${process.revenueImpact.promptPaymentWindowDays} days` });
    }
    if (process.revenueImpact?.revenueTypes && process.revenueImpact.revenueTypes.length > 0) {
      const typeLabels: Record<string, string> = {
        'speed': 'Speed to Market',
        'quality': 'Quality',
        'capacity': 'Capacity',
        'customer-satisfaction': 'Cust. Satisfaction'
      };
      const benefitLabels = process.revenueImpact.revenueTypes.map(type => typeLabels[type] || type).join(', ');
      metrics.push({ label: 'Benefits', value: benefitLabels });
    }
    
    // Internal Costs - Show individual values
    const ic = process.internalCosts;
    if (ic) {
      // Labor & Workforce
      if (ic.trainingOnboardingCosts > 0) {
        metrics.push({ label: 'Training/Onboarding', value: `${ic.trainingOnboardingCosts}%` });
      }
      if (ic.overtimePremiums > 0) {
        metrics.push({ label: 'Overtime Premiums', value: `${ic.overtimePremiums}%` });
      }
      if (ic.shadowSystemsCosts > 0) {
        metrics.push({ label: 'Shadow Systems', value: `${ic.shadowSystemsCosts}%` });
      }
      
      // IT & Operations
      if (ic.softwareLicensing > 0) {
        metrics.push({ label: 'Software Licensing', value: `${ic.softwareLicensing}%` });
      }
      if (ic.infrastructureCosts > 0) {
        metrics.push({ label: 'Infrastructure', value: `${ic.infrastructureCosts}%` });
      }
      if (ic.itSupportMaintenance > 0) {
        metrics.push({ label: 'IT Support', value: `${ic.itSupportMaintenance}%` });
      }
      
      // Risk Mitigation
      if (ic.errorRemediationCosts > 0) {
        metrics.push({ label: 'Error Remediation', value: `${ic.errorRemediationCosts}%` });
      }
      if (ic.auditComplianceCosts > 0) {
        metrics.push({ label: 'Audit/Compliance', value: `${ic.auditComplianceCosts}%` });
      }
      if (ic.downtimeCosts > 0) {
        metrics.push({ label: 'Downtime', value: `${ic.downtimeCosts}%` });
      }
      
      // Opportunity
      if (ic.decisionDelays > 0) {
        metrics.push({ label: 'Decision Delays', value: `${ic.decisionDelays}%` });
      }
      if (ic.customerImpactCosts > 0) {
        metrics.push({ label: 'Customer Impact', value: `${ic.customerImpactCosts}%` });
      }
    }
    
    // IT Support Hours (from implementation costs)
    if (process.implementationCosts?.itSupportHoursPerMonth && process.implementationCosts.itSupportHoursPerMonth > 0) {
      const reducedHours = parseFloat((process.implementationCosts.itSupportHoursPerMonth * (1 - (process.implementationCosts.automationCoverage / 100))).toFixed(1));
      metrics.push({ label: 'IT Support (Reduced)', value: `${reducedHours} hrs/mo` });
    }
    
    return metrics;
  };

  const handleGroupSelection = (groupName: string, checked: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (checked) {
      newSelected.add(groupName);
    } else {
      newSelected.delete(groupName);
    }
    setSelectedGroups(newSelected);
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
  const getProcessesWithIndividualSettings = (field: string, newValue: any): string[] => {
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

  const applyGlobalDefaultChange = (field: string, value: any, applyToAll: boolean) => {
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

  const updateGlobalDefaults = (field: string, value: any) => {
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

  const handleAddGroup = (group: ProcessGroup) => {
    console.log('📝 Parent handleAddGroup called with group:', group);
    console.log('📝 Current groups before add:', data.groups);
    
    // Check for duplicate IDs (shouldn't happen with timestamp, but safety check)
    const isDuplicate = data.groups.some(g => g.id === group.id);
    if (isDuplicate) {
      console.error('Duplicate group ID:', group.id);
      // toast.error(`Duplicate group ID detected: ${group.id}`);
      return;
    }
    
    const updatedData = {
      ...data,
      groups: [...data.groups, group]
    };
    
    console.log('📝 Updated groups after add:', updatedData.groups);
    console.log('🚀 CALLING onChange NOW...');
    onChange(updatedData);
    console.log('✅ onChange completed');
    
    // toast.success(`Group "${group.name}" added successfully!`, { duration: 3000 });
  };

  const handleEditGroup = (updatedGroup: ProcessGroup) => {
    // Find the old group to get its name
    const oldGroup = data.groups.find(g => g.id === updatedGroup.id);
    
    // Update all processes in this group with the new default wage/salary
    const updatedProcesses = data.processes.map(process => {
      if (process.group === oldGroup?.name) {
        const updates: any = { group: updatedGroup.name }; // Update group name in case it changed
        
        // Update wage or salary based on what's set in the group
        if (updatedGroup.averageHourlyWage !== undefined && updatedGroup.averageHourlyWage > 0) {
          updates.averageHourlyWage = updatedGroup.averageHourlyWage;
        }
        if (updatedGroup.annualSalary !== undefined && updatedGroup.annualSalary > 0) {
          updates.annualSalary = updatedGroup.annualSalary;
        }
        
        return { ...process, ...updates };
      }
      return process;
    });
    
    onChange({
      ...data,
      groups: data.groups.map(g => g.id === updatedGroup.id ? updatedGroup : g),
      processes: updatedProcesses
    });
    
    const processCount = data.processes.filter(p => p.group === oldGroup?.name).length;
    // toast.success(`Group "${updatedGroup.name}" and ${processCount} process${processCount !== 1 ? 'es' : ''} updated successfully!`);
  };

  const handleDeleteGroup = (groupId: string) => {
    onChange({
      ...data,
      groups: data.groups.filter(g => g.id !== groupId),
      processes: data.processes.filter(p => p.group !== groupId)
    });
  };

  const handleSaveGroupName = (oldGroupName: string, newGroupName: string) => {
    if (!newGroupName.trim() || newGroupName === oldGroupName) {
      setEditingGroupName(null);
      setTempGroupName('');
      return;
    }

    const group = data.groups.find(g => g.name === oldGroupName);
    if (!group) {
      setEditingGroupName(null);
      setTempGroupName('');
      return;
    }

    // Update the group name and all processes that reference it
    const updatedGroup = { ...group, name: newGroupName.trim() };
    const updatedProcesses = data.processes.map(p => 
      p.group === oldGroupName ? { ...p, group: newGroupName.trim() } : p
    );

    onChange({
      ...data,
      groups: data.groups.map(g => g.id === group.id ? updatedGroup : g),
      processes: updatedProcesses
    });

    setEditingGroupName(null);
    setTempGroupName('');
  };

  const handleSaveProcessName = (processId: string, newProcessName: string) => {
    if (!newProcessName.trim()) {
      setEditingProcessName(null);
      setTempProcessName('');
      return;
    }

    onChange({
      ...data,
      processes: data.processes.map(p => 
        p.id === processId ? { ...p, name: newProcessName.trim() } : p
      )
    });

    setEditingProcessName(null);
    setTempProcessName('');
  };

  const updateOverheadCost = (field: keyof OverheadCosts, value: number) => {
    onChange({
      ...data,
      globalDefaults: {
        ...data.globalDefaults,
        overheadCosts: {
          ...data.globalDefaults.overheadCosts,
          [field]: value
        }
      }
    });
  };

  const updateTotalOverheadCost = (totalPercentage: number) => {
    // Use weighted distribution based on industry standards
    const weightedRatios = {
      benefits: 0.50,        // 50% of total overhead
      payrollTaxes: 0.20,    // 20% of total overhead  
      paidTimeOff: 0.125,    // 12.5% of total overhead
      trainingOnboarding: 0.05,  // 5% of total overhead
      overheadGA: 0.125      // 12.5% of total overhead
    };
    
    onChange({
      ...data,
      globalDefaults: {
        ...data.globalDefaults,
        overheadCosts: {
          benefits: totalPercentage * weightedRatios.benefits,
          payrollTaxes: totalPercentage * weightedRatios.payrollTaxes,
          paidTimeOff: totalPercentage * weightedRatios.paidTimeOff,
          trainingOnboarding: totalPercentage * weightedRatios.trainingOnboarding,
          overheadGA: totalPercentage * weightedRatios.overheadGA
        }
      }
    });
  };

  const updateProcess = (processId: string, field: string, value: any) => {
    onChange({
      ...data,
      processes: data.processes.map(p => 
        p.id === processId ? { ...p, [field]: value } : p
      )
    });
  };

  const addProcess = (groupOption: 'none' | 'existing' | 'new', groupName?: string, newGroupDescription?: string, processName?: string, hourlyWage?: number, annualSalary?: number) => {
    let finalGroupName = '';
    let newGroups = [...data.groups];
    let groupDefaults = { ...data.globalDefaults };
    
    // If creating a new group, add it to the groups array
    if (groupOption === 'new' && groupName) {
      const newGroup: ProcessGroup = {
        id: groupName.toLowerCase().replace(/\s+/g, '-'),
        name: groupName,
        description: newGroupDescription || '',
        averageHourlyWage: hourlyWage,
        annualSalary: annualSalary
      };
      newGroups = [...data.groups, newGroup];
      finalGroupName = groupName;
      
      // If group has custom wage/salary, use those for the new process
      if (hourlyWage !== undefined) {
        groupDefaults.averageHourlyWage = hourlyWage;
      }
      if (annualSalary !== undefined) {
        groupDefaults.annualSalary = annualSalary;
      }
    } else if (groupOption === 'existing' && groupName) {
      finalGroupName = groupName;
      
      // Look up group defaults if the group exists
      const existingGroup = data.groups.find(g => g.name === groupName);
      if (existingGroup) {
        if (existingGroup.averageHourlyWage !== undefined) {
          groupDefaults.averageHourlyWage = existingGroup.averageHourlyWage;
        }
        if (existingGroup.annualSalary !== undefined) {
          groupDefaults.annualSalary = existingGroup.annualSalary;
        }
      }
    }
    
    // Create the new process with custom name if provided
    const defaultName = processName && processName.trim() ? processName.trim() : `New Process ${data.processes.length + 1}`;
    const newProcess = createDefaultProcess(
      `proc-${Date.now()}`,
      defaultName,
      1,
      finalGroupName,
      groupDefaults
    );
    
    onChange({
      ...data,
      groups: newGroups,
      processes: [...data.processes, newProcess]
    });
  };

  // Quick add process directly to a group without dialog
  const quickAddProcess = (groupName: string) => {
    let groupDefaults = { ...data.globalDefaults };
    
    // Look up group defaults if the group exists
    if (groupName && groupName !== 'Ungrouped') {
      const existingGroup = data.groups.find(g => g.name === groupName);
      if (existingGroup) {
        if (existingGroup.averageHourlyWage !== undefined) {
          groupDefaults.averageHourlyWage = existingGroup.averageHourlyWage;
        }
        if (existingGroup.annualSalary !== undefined) {
          groupDefaults.annualSalary = existingGroup.annualSalary;
        }
      }
    }
    
    const newProcess = createDefaultProcess(
      `proc-${Date.now()}`,
      `New Process ${data.processes.length + 1}`,
      1,
      groupName === 'Ungrouped' ? '' : groupName,
      groupDefaults
    );
    
    onChange({
      ...data,
      processes: [...data.processes, newProcess]
    });
  };

  const removeProcess = (processId: string) => {
    onChange({
      ...data,
      processes: data.processes.filter(p => p.id !== processId)
    });
  };

  const duplicateProcess = (processId: string) => {
    const process = data.processes.find(p => p.id === processId);
    if (process) {
      const duplicated = {
        ...process,
        id: `proc-${Date.now()}`,
        name: `${process.name} (Copy)`
      };
      onChange({
        ...data,
        processes: [...data.processes, duplicated]
      });
    }
  };

  const deleteSelectedProcesses = () => {
    const selectedIds = data.processes.filter(p => p.selected).map(p => p.id);
    if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} selected process${selectedIds.length > 1 ? 'es' : ''}?`)) {
      onChange({
        ...data,
        processes: data.processes.filter(p => !p.selected)
      });
    }
  };

  // Group processes by their group, with support for ungrouped processes
  // Start with all defined groups (including empty ones)
  const groupedProcesses: Record<string, ProcessData[]> = {};
  
  // Initialize all defined groups with empty arrays
  data.groups.forEach(group => {
    groupedProcesses[group.name] = [];
  });
  
  // Add ungrouped if there are any processes without groups
  const ungroupedProcesses = data.processes.filter(p => !p.group);
  if (ungroupedProcesses.length > 0) {
    groupedProcesses['Ungrouped'] = ungroupedProcesses;
  }
  
  // Distribute processes to their groups
  data.processes.forEach(process => {
    if (process.group) {
      if (!groupedProcesses[process.group]) {
        groupedProcesses[process.group] = [];
      }
      groupedProcesses[process.group].push(process);
    }
  });

  // Sort groups by the order in data.groups array, then Ungrouped last
  const sortedGroupEntries = Object.entries(groupedProcesses).sort(([a], [b]) => {
    if (a === 'Ungrouped') return 1;
    if (b === 'Ungrouped') return -1;
    
    // Find indices in the groups array
    const indexA = data.groups.findIndex(g => g.name === a);
    const indexB = data.groups.findIndex(g => g.name === b);
    
    // If both groups are in the array, sort by their index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only one is in the array, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Fallback to alphabetical if neither is in the array (shouldn't happen)
    return a.localeCompare(b);
  });

  // Move process to a different group
  const moveProcessToGroup = (processId: string, targetGroup: string) => {
    // If moving to Ungrouped, set group to empty string
    const newGroup = targetGroup === 'Ungrouped' ? '' : targetGroup;
    onChange({
      ...data,
      processes: data.processes.map(p =>
        p.id === processId ? { ...p, group: newGroup } : p
      )
    });
  };

  // Reorder process within or between groups
  const reorderProcess = (draggedId: string, targetId: string, position: 'before' | 'after') => {
    const draggedProcess = data.processes.find(p => p.id === draggedId);
    const targetProcess = data.processes.find(p => p.id === targetId);
    
    if (!draggedProcess || !targetProcess) return;
    
    // Remove the dragged process from the array
    let newProcesses = data.processes.filter(p => p.id !== draggedId);
    
    // Find the index of the target process
    const targetIndex = newProcesses.findIndex(p => p.id === targetId);
    
    if (targetIndex === -1) return;
    
    // Update the dragged process's group to match the target's group
    const updatedDraggedProcess = {
      ...draggedProcess,
      group: targetProcess.group
    };
    
    // Insert the dragged process at the appropriate position
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    newProcesses.splice(insertIndex, 0, updatedDraggedProcess);
    
    onChange({
      ...data,
      processes: newProcesses
    });
  };

  // Reorder groups
  const reorderGroup = (draggedGroupName: string, targetGroupName: string, position: 'before' | 'after') => {
    const newGroups = [...data.groups];
    const draggedIndex = newGroups.findIndex(g => g.name === draggedGroupName);
    const targetIndex = newGroups.findIndex(g => g.name === targetGroupName);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }
    
    // Remove the dragged group
    const [draggedGroup] = newGroups.splice(draggedIndex, 1);
    
    // Calculate new target index (in case it shifted after removal)
    const newTargetIndex = newGroups.findIndex(g => g.name === targetGroupName);
    
    // Insert at the appropriate position
    const insertIndex = position === 'before' ? newTargetIndex : newTargetIndex + 1;
    newGroups.splice(insertIndex, 0, draggedGroup);
    
    onChange({
      ...data,
      groups: newGroups
    });
  };

  const selectedProcesses = data.processes.filter(p => p.selected);

  // Check if any process has seasonal type to show/hide peak months column
  const hasSeasonalProcesses = data.processes.some(p => p.taskType === 'seasonal');
  
  // Check if any process doesn't have hourly cyclical pattern to show/hide time of day column
  const hasProcessesWithoutHourlyCyclical = data.processes.some(p => p.cyclicalPattern?.type !== 'hourly');

  const totalOverheadPercentage = (
    data.globalDefaults.overheadCosts.benefits +
    data.globalDefaults.overheadCosts.payrollTaxes +
    data.globalDefaults.overheadCosts.paidTimeOff +
    data.globalDefaults.overheadCosts.trainingOnboarding +
    data.globalDefaults.overheadCosts.overheadGA
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Global Settings - Now on the left and stretched */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Settings
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Keyboard shortcuts: Use ← → arrows to collapse/expand sections</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedProcesses.length} of {data.processes.length} processes selected
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Compensation */}
            <div className="space-y-4">
              <Collapsible open={expandedCompensation} onOpenChange={setExpandedCompensation}>
                <CollapsibleTrigger 
                  className="flex items-center gap-2 w-full p-0 [&[data-state=open]>svg]:rotate-90"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && !expandedCompensation) {
                      e.preventDefault();
                      setExpandedCompensation(true);
                    } else if (e.key === 'ArrowLeft' && expandedCompensation) {
                      e.preventDefault();
                      setExpandedCompensation(false);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4 transition-transform flex-shrink-0" />
                  <h3 className="font-medium">Compensation</h3>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hourly Wage</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={data.globalDefaults.averageHourlyWage === 0 ? '' : (data.globalDefaults.averageHourlyWage || '')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const hourly = value === '' ? 0 : parseFloat(value) || 0;
                            onChange({
                              ...data,
                              globalDefaults: {
                                ...data.globalDefaults,
                                averageHourlyWage: hourly,
                                annualSalary: hourly * 2080
                              }
                            });
                          }}
                          className="pl-8 h-10"
                          placeholder="20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Salary</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={data.globalDefaults.annualSalary === 0 ? '' : (data.globalDefaults.annualSalary || '')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const salary = value === '' ? 0 : parseFloat(value) || 0;
                            // Round hourly wage UP to 2 decimal places
                            const hourlyWage = salary > 0 ? Math.ceil((salary / 2080) * 100) / 100 : 0;
                            onChange({
                              ...data,
                              globalDefaults: {
                                ...data.globalDefaults,
                                annualSalary: salary,
                                averageHourlyWage: hourlyWage
                              }
                            });
                          }}
                          className="pl-8 h-10"
                          placeholder="41600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Overtime Multiplier</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.overtimeMultiplier === 0 ? '' : (data.globalDefaults.overtimeMultiplier || '')}
                        onChange={(e) => updateGlobalDefaults('overtimeMultiplier', parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Business Hours */}
            <div className="space-y-4">
              <Collapsible open={expandedBusinessHours} onOpenChange={setExpandedBusinessHours}>
                <CollapsibleTrigger 
                  className="flex items-center gap-2 w-full p-0 [&[data-state=open]>svg]:rotate-90"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && !expandedBusinessHours) {
                      e.preventDefault();
                      setExpandedBusinessHours(true);
                    } else if (e.key === 'ArrowLeft' && expandedBusinessHours) {
                      e.preventDefault();
                      setExpandedBusinessHours(false);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4 transition-transform" />
                  <h3 className="font-medium">Business Hours</h3>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start</label>
                        <Input
                          type="time"
                          value={data.globalDefaults.businessHours.start}
                          onChange={(e) => updateGlobalDefaults('businessHours', {
                            ...data.globalDefaults.businessHours,
                            start: e.target.value
                          })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End</label>
                        <Input
                          type="time"
                          value={data.globalDefaults.businessHours.end}
                          onChange={(e) => updateGlobalDefaults('businessHours', {
                            ...data.globalDefaults.businessHours,
                            end: e.target.value
                          })}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Select
                        value={data.globalDefaults.businessHours.timezone}
                        onValueChange={(value) => updateGlobalDefaults('businessHours', {
                          ...data.globalDefaults.businessHours,
                          timezone: value
                        })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern</SelectItem>
                          <SelectItem value="America/Chicago">Central</SelectItem>
                          <SelectItem value="America/Denver">Mountain</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Overhead Costs */}
            <div className="space-y-4">
              <Collapsible open={expandedOverhead} onOpenChange={setExpandedOverhead}>
                <CollapsibleTrigger 
                  className="flex items-start gap-2 w-full p-0 [&[data-state=open]>svg]:rotate-90"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && !expandedOverhead) {
                      e.preventDefault();
                      setExpandedOverhead(true);
                    } else if (e.key === 'ArrowLeft' && expandedOverhead) {
                      e.preventDefault();
                      setExpandedOverhead(false);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4 transition-transform mt-0.5" />
                  <div className="flex flex-col items-start">
                    <h3 className="font-medium">Overhead Costs</h3>
                    <div className="text-sm text-muted-foreground">Total: {totalOverheadPercentage.toFixed(1)}%</div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total Percentage</label>
                      <NumberInput
                        value={totalOverheadPercentage}
                        onChange={updateTotalOverheadCost}
                        className="w-full h-10"
                      />
                    </div>
                    <Separator />
                    <TooltipProvider>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">Benefits (~20%)</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-64">
                                <p className="font-medium mb-1">Benefits</p>
                                <ul className="text-sm space-y-1">
                                  <li>• Health, dental, vision insurance</li>
                                  <li>• Retirement contributions (401k, pensions)</li>
                                  <li>• Life/disability insurance</li>
                                  <li>• Wellness perks</li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-2">About half of total overhead in many U.S. companies</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <NumberInput
                            value={data.globalDefaults.overheadCosts.benefits}
                            onChange={(value) => updateOverheadCost('benefits', value)}
                            className="w-full h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">Payroll Taxes (~8%)</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-64">
                                <p className="font-medium mb-1">Payroll Taxes</p>
                                <ul className="text-sm space-y-1">
                                  <li>• Employer Social Security + Medicare (~7.65% US baseline)</li>
                                  <li>• Unemployment insurance</li>
                                  <li>• Workers' compensation</li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-2">This portion is fairly consistent/legal minimums drive it</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <NumberInput
                            value={data.globalDefaults.overheadCosts.payrollTaxes}
                            onChange={(value) => updateOverheadCost('payrollTaxes', value)}
                            className="w-full h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">PTO (~5%)</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-64">
                                <p className="font-medium mb-1">Paid Time Off (PTO)</p>
                                <ul className="text-sm space-y-1">
                                  <li>• Vacation, holidays, sick leave</li>
                                  <li>• Cost of paying wages during nonproductive time</li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-2">About 2–3 weeks per year is typical, so ~5% of base cost</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <NumberInput
                            value={data.globalDefaults.overheadCosts.paidTimeOff}
                            onChange={(value) => updateOverheadCost('paidTimeOff', value)}
                            className="w-full h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">Training (~2%)</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-64">
                                <p className="font-medium mb-1">Training & Onboarding</p>
                                <ul className="text-sm space-y-1">
                                  <li>• Initial onboarding, ongoing skills development</li>
                                  <li>• Spread across employee tenure</li>
                                </ul>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <NumberInput
                            value={data.globalDefaults.overheadCosts.trainingOnboarding}
                            onChange={(value) => updateOverheadCost('trainingOnboarding', value)}
                            className="w-full h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">G&A (~5%)</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-64">
                                <p className="font-medium mb-1">General & Administrative (G&A)</p>
                                <ul className="text-sm space-y-1">
                                  <li>• Facilities, IT equipment/software</li>
                                  <li>• HR, finance, legal overhead</li>
                                  <li>• Allocated per headcount</li>
                                </ul>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <NumberInput
                            value={data.globalDefaults.overheadCosts.overheadGA}
                            onChange={(value) => updateOverheadCost('overheadGA', value)}
                            className="w-full h-9"
                          />
                        </div>
                      </div>
                    </TooltipProvider>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Attrition / Turnover Costs */}
            <div className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex items-start gap-2 w-full p-0 [&[data-state=open]>svg]:rotate-90">
                  <ChevronRight className="h-4 w-4 transition-transform mt-0.5" />
                  <h3 className="font-medium">Attrition & Turnover</h3>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Turnover Rate (%)</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.attritionCosts?.annualTurnoverRate === 0 ? '' : (data.globalDefaults.attritionCosts?.annualTurnoverRate || '')}
                        onChange={(e) => updateGlobalDefaults('attritionCosts', {
                          ...data.globalDefaults.attritionCosts,
                          annualTurnoverRate: parseFloat(e.target.value) || 0
                        })}
                        className="h-10"
                        placeholder="15"
                      />
                      <p className="text-xs text-muted-foreground">% of employees who leave annually</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cost to Replace Employee (% of Annual Salary)</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.attritionCosts?.costToReplacePercentage === 0 ? '' : (data.globalDefaults.attritionCosts?.costToReplacePercentage || '')}
                        onChange={(e) => updateGlobalDefaults('attritionCosts', {
                          ...data.globalDefaults.attritionCosts,
                          costToReplacePercentage: parseFloat(e.target.value) || 0
                        })}
                        className="h-10"
                        placeholder="60"
                      />
                      <p className="text-xs text-muted-foreground">
                        Typical hiring and training costs as a percentage of annual compensation (salary or hourly wage × 2,080 hours)
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> Attrition savings are automatically calculated based on FTE savings for each process. 
                        The replacement cost percentage is applied to each process's actual annual compensation (salary or hourly wage × 2,080 hours).
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Financial Assumptions */}
            <div className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex items-start gap-2 w-full p-0 [&[data-state=open]>svg]:rotate-90">
                  <ChevronRight className="h-4 w-4 transition-transform mt-0.5" />
                  <h3 className="font-medium">Financial Assumptions</h3>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Rate (%)</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.financialAssumptions?.discountRate === 0 ? '' : (data.globalDefaults.financialAssumptions?.discountRate || '')}
                        onChange={(e) => updateGlobalDefaults('financialAssumptions', {
                          ...data.globalDefaults.financialAssumptions,
                          discountRate: parseFloat(e.target.value) || 0
                        })}
                        className="h-10"
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">Cost of capital for NPV calculation</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Inflation Rate (%)</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.financialAssumptions?.inflationRate === 0 ? '' : (data.globalDefaults.financialAssumptions?.inflationRate || '')}
                        onChange={(e) => updateGlobalDefaults('financialAssumptions', {
                          ...data.globalDefaults.financialAssumptions,
                          inflationRate: parseFloat(e.target.value) || 0
                        })}
                        className="h-10"
                        placeholder="3"
                      />
                      <p className="text-xs text-muted-foreground">Annual inflation rate</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Corporate Tax Rate (%)</label>
                      <Input
                        type="number"
                        value={data.globalDefaults.financialAssumptions?.taxRate === 0 ? '' : (data.globalDefaults.financialAssumptions?.taxRate || '')}
                        onChange={(e) => updateGlobalDefaults('financialAssumptions', {
                          ...data.globalDefaults.financialAssumptions,
                          taxRate: parseFloat(e.target.value) || 0
                        })}
                        className="h-10"
                        placeholder="25"
                      />
                      <p className="text-xs text-muted-foreground">For EBITDA calculations</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        Global Risk Factor Override (0-10)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                <strong>Optional:</strong> Set a global risk factor (0-10 scale) that overrides individual process complexity scores for ROI risk adjustment.
                                <br/><br/>
                                • <strong>Leave empty</strong> to use each process's own complexity score<br/>
                                • <strong>Set value</strong> to apply the same risk factor to all processes<br/>
                                • Higher values = more risk adjustment (up to 50% ROI reduction at 10/10)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={data.globalDefaults.financialAssumptions?.globalRiskFactor === undefined ? '' : data.globalDefaults.financialAssumptions.globalRiskFactor}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          const oldVal = data.globalDefaults.financialAssumptions?.globalRiskFactor;
                          
                          // 🚨 LOUD CONSOLE LOGGING
                          console.log('═══════════════════════════════════════════════════');
                          console.log('🔔 GLOBAL RISK FACTOR CHANGED!');
                          console.log('   OLD VALUE:', oldVal);
                          console.log('   NEW VALUE:', val);
                          console.log('   Input field value:', e.target.value);
                          console.log('═══════════════════════════════════════════════════');
                          
                          updateGlobalDefaults('financialAssumptions', {
                            ...data.globalDefaults.financialAssumptions,
                            globalRiskFactor: val
                          });
                          
                          // Log after update too
                          setTimeout(() => {
                            console.log('✅ Global risk factor update COMPLETE');
                            console.log('   New state should now reflect: ', val);
                          }, 100);
                        }}
                        className="h-10"
                        placeholder="Leave empty to use process complexity"
                      />
                      <p className="text-xs text-muted-foreground">
                        {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined 
                          ? `🔒 All processes will use risk factor: ${data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10`
                          : '🔓 Each process will use its own complexity score'
                        }
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div>
        <h1>Current State Process Details</h1>
      </div>

      {/* Process Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {selectedGroups.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const groupIds = Array.from(selectedGroups)
                      .map(name => data.groups.find(g => g.name === name)?.id)
                      .filter(Boolean) as string[];
                    
                    const totalProcesses = groupIds.reduce((sum, id) => {
                      return sum + data.processes.filter(p => p.group === data.groups.find(g => g.id === id)?.name).length;
                    }, 0);
                    
                    if (confirm(`Delete ${groupIds.length} group${groupIds.length > 1 ? 's' : ''} and ${totalProcesses} process${totalProcesses !== 1 ? 'es' : ''}?`)) {
                      onChange({
                        ...data,
                        groups: data.groups.filter(g => !groupIds.includes(g.id)),
                        processes: data.processes.filter(p => !groupIds.some(id => p.group === data.groups.find(g => g.id === id)?.name))
                      });
                      setSelectedGroups(new Set());
                    }
                  }}
                  className="h-8"
                  title={`Delete ${selectedGroups.size} selected group${selectedGroups.size > 1 ? 's' : ''}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedGroups.size} Group{selectedGroups.size > 1 ? 's' : ''}
                </Button>
              )}
              {selectedProcesses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteSelectedProcesses}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  title={`Delete ${selectedProcesses.length} selected process${selectedProcesses.length > 1 ? 'es' : ''}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <GroupManagementDialog
                groups={data.groups}
                processes={data.processes}
                onAddGroup={handleAddGroup}
                onEditGroup={handleEditGroup}
                onDeleteGroup={handleDeleteGroup}
                globalDefaults={data.globalDefaults}
                onMoveProcessesToGroup={(processIds, groupName) => {
                  onChange({
                    ...data,
                    processes: data.processes.map(p =>
                      processIds.includes(p.id) ? { ...p, group: groupName } : p
                    )
                  });
                }}
              />
              
              {/* Separate Edit Dialog for in-table editing */}
              <Dialog 
                open={editingGroup !== null} 
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingGroup(null);
                  }
                }}
              >
                <DialogContent 
                  className="max-h-[90vh] overflow-y-auto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && editingGroup?.name.trim()) {
                      e.preventDefault();
                      handleEditGroup(editingGroup);
                      setEditingGroup(null);
                    }
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                    <DialogDescription>
                      Modify the name, description, and default compensation for this process group.
                    </DialogDescription>
                  </DialogHeader>
                  {editingGroup && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Group Name</label>
                        <Input
                          value={editingGroup.name}
                          onChange={(e) => setEditingGroup({
                            ...editingGroup,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Input
                          value={editingGroup.description || ''}
                          onChange={(e) => setEditingGroup({
                            ...editingGroup,
                            description: e.target.value
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Engine</label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-medium text-xs">{editingGroup.engine || 'Value Delivery'}</p>
                                  <p className="text-xs">
                                    {(editingGroup.engine === 'Value Creation' || (!editingGroup.engine && 'Value Delivery' === 'Value Creation')) && 'Foundation of business: What you offer and problems you solve'}
                                    {(editingGroup.engine === 'Marketing and Sales' || (!editingGroup.engine && 'Value Delivery' === 'Marketing and Sales')) && 'Generating demand and converting prospects into customers'}
                                    {(editingGroup.engine === 'Value Delivery' || (!editingGroup.engine && 'Value Delivery' === 'Value Delivery')) && 'Operations: Ensuring customers get what they were promised'}
                                    {(editingGroup.engine === 'Finance' || (!editingGroup.engine && 'Value Delivery' === 'Finance')) && 'The fuel: Cash flow, profit, and financial health'}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select 
                          value={editingGroup.engine || 'Value Delivery'} 
                          onValueChange={(value: any) => setEditingGroup({
                            ...editingGroup,
                            engine: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select engine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Value Creation">Value Creation</SelectItem>
                            <SelectItem value="Marketing and Sales">Marketing and Sales</SelectItem>
                            <SelectItem value="Value Delivery">Value Delivery</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="text-sm font-medium">Default Compensation</h4>
                        <p className="text-xs text-muted-foreground">
                          Set default compensation values. Both fields auto-calculate each other (2,080 hours/year).
                        </p>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Annual Salary ($)</label>
                          <NumberInput
                            value={editingGroup.annualSalary || 0}
                            onChange={(value) => {
                              const newSalary = value || 0;
                              const calculatedWage = newSalary > 0 ? Number((newSalary / 2080).toFixed(2)) : 0;
                              setEditingGroup({
                                ...editingGroup,
                                annualSalary: newSalary || undefined,
                                averageHourlyWage: calculatedWage || undefined
                              });
                            }}
                            prefix="$"
                            placeholder="Use global default"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Average Hourly Wage ($)</label>
                          <NumberInput
                            value={editingGroup.averageHourlyWage || 0}
                            onChange={(value) => {
                              const newWage = value || 0;
                              const calculatedSalary = newWage > 0 ? Number((newWage * 2080).toFixed(2)) : 0;
                              setEditingGroup({
                                ...editingGroup,
                                averageHourlyWage: newWage || undefined,
                                annualSalary: calculatedSalary || undefined
                              });
                            }}
                            prefix="$"
                            placeholder="Use global default"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
                          <strong>Auto-Calculation:</strong> These values update each other automatically based on 2,080 working hours per year (40 hours/week × 52 weeks).
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditingGroup(null)}>Cancel</Button>
                        <Button onClick={() => {
                          if (editingGroup.name.trim()) {
                            handleEditGroup(editingGroup);
                            setEditingGroup(null);
                          }
                        }}>Save Changes</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <AddProcessDialog
                groups={data.groups}
                onAddProcess={addProcess}
                globalDefaults={data.globalDefaults}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Process
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {data.processes.length === 0 && sortedGroupEntries.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-lg text-muted-foreground mb-2">No processes yet</p>
                <p className="text-sm text-muted-foreground mb-4">Get started by adding your first process</p>
                <AddProcessDialog
                  groups={data.groups}
                  onAddProcess={addProcess}
                  globalDefaults={data.globalDefaults}
                  trigger={
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Process
                    </Button>
                  }
                />
              </div>
            ) : (
              sortedGroupEntries.map(([groupName, processes], groupIndex) => {
              const group = data.groups.find(g => g.name === groupName);
              const isSelected = selectedGroups.has(groupName);
              const isUngrouped = groupName === 'Ungrouped';
              const hasNoGroups = data.groups.length === 0;
              
              // Determine the label to show
              const groupLabel = isUngrouped && hasNoGroups ? 'Select All' : groupName;
              const shouldShowUngroupedHint = isUngrouped && !hasNoGroups;
              
              return (
                <DraggableGroupSection
                  key={`${groupName}-${groupIndex}`}
                  groupName={groupName}
                  isUngrouped={isUngrouped}
                  onReorder={reorderGroup}
                >
                  {(dragHandleRef) => (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        {!isUngrouped && (
                          <div ref={dragHandleRef} className="cursor-move mr-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleGroupSelection(groupName, !!checked)}
                          disabled={isUngrouped}
                          title={isUngrouped ? "Cannot select ungrouped processes" : "Select group for bulk operations"}
                        />
                        {editingGroupName === groupName && !isUngrouped ? (
                          <Input
                            value={tempGroupName}
                            onChange={(e) => setTempGroupName(e.target.value)}
                            onBlur={() => handleSaveGroupName(groupName, tempGroupName)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              } else if (e.key === 'Escape') {
                                setEditingGroupName(null);
                                setTempGroupName('');
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                            className="w-48 h-8 text-sm font-medium"
                          />
                        ) : (
                          <h4 
                            className={`font-medium ${isUngrouped ? 'text-muted-foreground' : 'cursor-pointer hover:text-primary'}`}
                            onClick={() => {
                              if (!isUngrouped) {
                                setEditingGroupName(groupName);
                                setTempGroupName(groupName);
                              }
                            }}
                            title={isUngrouped ? '' : 'Click to edit group name'}
                          >
                            {groupLabel}
                            {shouldShowUngroupedHint && <span className="text-xs ml-2">(Drag processes here or assign to groups)</span>}
                          </h4>
                        )}
                        <Badge variant={isUngrouped ? 'outline' : 'secondary'}>{processes.length}</Badge>
                        {group?.engine && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex">
                                  <Badge variant="outline" className="text-xs cursor-help">
                                    {group.engine}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-medium">{group.engine}</p>
                                  {group.engine === 'Value Creation' && (
                                    <p className="text-xs">
                                      This engine is the foundation of any business and answers the question: "What do you offer?". 
                                      The product or service: Discovering or creating something that people need, want, or can be encouraged to want. 
                                      Solving a problem: Successful products or services often address a specific gap or a problem that customers are facing in the market.
                                    </p>
                                  )}
                                  {group.engine === 'Marketing and Sales' && (
                                    <p className="text-xs">
                                      This engine is responsible for generating demand and converting prospects into customers. 
                                      Marketing: The process of attracting attention and building interest in your product or service. It involves communicating your value proposition to potential customers. 
                                      Sales: The process of turning prospective customers into paying customers by completing a transaction. Without sales, no revenue is generated.
                                    </p>
                                  )}
                                  {group.engine === 'Value Delivery' && (
                                    <p className="text-xs">
                                      This engine focuses on the "how" of the business—the processes that ensure customers get what they were promised. 
                                      Operations management: Overseeing the entire production and delivery process to meet customer demand. This includes managing the supply chain, production, and distribution. 
                                      Customer satisfaction: Ensuring that customers are satisfied with the product and their overall experience. Excellent customer service helps drive recurring business and referrals.
                                    </p>
                                  )}
                                  {group.engine === 'Finance' && (
                                    <p className="text-xs">
                                      This engine is the "fuel" that powers the entire business and ensures its ongoing viability. 
                                      Cash flow: The flow of money in and out of the business. A steady cash flow is essential to maintain operations and plan for growth. 
                                      Profit: The net income after all expenses are paid. Profitability determines the business's long-term potential for growth and sustainability. 
                                      Financial reporting: Measuring and managing the financial health of the business. Key reports like the profit-and-loss statement and cash flow statements act as a dashboard to monitor performance.
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => quickAddProcess(groupName)}
                          className="h-6 w-6 p-0"
                          title="Add Process to Group"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        {group && isSelected && !isUngrouped && (
                          <div className="flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const groupToEdit = data.groups.find(g => g.name === groupName);
                                if (groupToEdit) {
                                  setEditingGroup(groupToEdit);
                                }
                              }}
                              className="h-6 w-6 p-0"
                              title="Edit Group"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              title="Delete Group"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <DroppableGroupContainer groupName={groupName} onDrop={moveProcessToGroup} isEmpty={processes.length === 0}>
                    {processes.length > 0 && (
                      isMobile ? (
                        // Mobile View: Use ProcessEditorMobile for each process with reordering buttons
                        <div className="space-y-4">
                          {processes.map((process, index) => (
                            <div key={process.id} className="relative pl-10">
                              {processes.length > 1 && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                                  {index > 0 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 bg-background border shadow-sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const currentIndex = data.processes.findIndex(p => p.id === process.id);
                                        if (currentIndex > 0) {
                                          const newProcesses = [...data.processes];
                                          [newProcesses[currentIndex - 1], newProcesses[currentIndex]] = 
                                          [newProcesses[currentIndex], newProcesses[currentIndex - 1]];
                                          onChange({ ...data, processes: newProcesses });
                                        }
                                      }}
                                      onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const currentIndex = data.processes.findIndex(p => p.id === process.id);
                                        if (currentIndex > 0) {
                                          const newProcesses = [...data.processes];
                                          [newProcesses[currentIndex - 1], newProcesses[currentIndex]] = 
                                          [newProcesses[currentIndex], newProcesses[currentIndex - 1]];
                                          onChange({ ...data, processes: newProcesses });
                                        }
                                      }}
                                      title="Move Up"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {index < processes.length - 1 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 bg-background border shadow-sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const currentIndex = data.processes.findIndex(p => p.id === process.id);
                                        if (currentIndex < data.processes.length - 1) {
                                          const newProcesses = [...data.processes];
                                          [newProcesses[currentIndex], newProcesses[currentIndex + 1]] = 
                                          [newProcesses[currentIndex + 1], newProcesses[currentIndex]];
                                          onChange({ ...data, processes: newProcesses });
                                        }
                                      }}
                                      onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const currentIndex = data.processes.findIndex(p => p.id === process.id);
                                        if (currentIndex < data.processes.length - 1) {
                                          const newProcesses = [...data.processes];
                                          [newProcesses[currentIndex], newProcesses[currentIndex + 1]] = 
                                          [newProcesses[currentIndex + 1], newProcesses[currentIndex]];
                                          onChange({ ...data, processes: newProcesses });
                                        }
                                      }}
                                      title="Move Down"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                              <ProcessEditorMobile
                                process={process}
                                globalDefaults={data.globalDefaults}
                                onChange={(updatedProcess) => {
                                  onChange({
                                    ...data,
                                    processes: data.processes.map(p => 
                                      p.id === process.id ? updatedProcess : p
                                    )
                                  });
                                }}
                                onDelete={data.processes.length > 1 ? () => {
                                  onChange({
                                    ...data,
                                    processes: data.processes.filter(p => p.id !== process.id)
                                  });
                                } : undefined}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Desktop View: Use table
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <TableHeader tooltip="Drag to reorder or move to another group">
                              <span className="text-xs">Drag</span>
                            </TableHeader>
                            <TableHeader>Select</TableHeader>
                            <TableHeader>Process Name</TableHeader>
                            <TableHeader tooltip="Number of tasks per selected time period">Tasks</TableHeader>
                            <TableHeader tooltip="Time required to complete each task">Time</TableHeader>
                            <TableHeader tooltip="Number of full-time equivalents working on this process">FTE</TableHeader>
                            <TableHeader>Hourly Wage</TableHeader>
                            <TableHeader>Actions</TableHeader>
                          </tr>
                        </thead>
                        <tbody>
                          {processes.map((process) => (
                            <DraggableProcessRow
                              key={process.id}
                              process={process}
                              groupName={groupName}
                              onDrop={reorderProcess}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={process.selected}
                                  onCheckedChange={(checked) => updateProcess(process.id, 'selected', !!checked)}
                                />
                              </TableCell>
                              <TableCell>
                                {editingProcessName === process.id ? (
                                  <Input
                                    value={tempProcessName}
                                    onChange={(e) => setTempProcessName(e.target.value)}
                                    onBlur={() => handleSaveProcessName(process.id, tempProcessName)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                      } else if (e.key === 'Escape') {
                                        setEditingProcessName(null);
                                        setTempProcessName('');
                                      }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    autoFocus
                                    className="w-40 h-8 text-xs"
                                  />
                                ) : (
                                  <div
                                    className="w-40 h-8 px-2 flex items-center cursor-pointer hover:bg-muted/50 rounded text-xs truncate"
                                    onClick={() => {
                                      setEditingProcessName(process.id);
                                      setTempProcessName(process.name);
                                    }}
                                    title={process.name.length > 20 ? process.name : 'Click to edit'}
                                  >
                                    {process.name}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <NumberInput
                                    value={process.taskVolume}
                                    onChange={(value) => updateProcess(process.id, 'taskVolume', value)}
                                    className="w-16"
                                  />
                                  <Select
                                    value={process.taskVolumeUnit}
                                    onValueChange={(value) => updateProcess(process.id, 'taskVolumeUnit', value)}
                                  >
                                    <SelectTrigger className="h-8 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="day">Day</SelectItem>
                                      <SelectItem value="week">Week</SelectItem>
                                      <SelectItem value="month">Month</SelectItem>
                                      <SelectItem value="quarter">Quarter</SelectItem>
                                      <SelectItem value="year">Year</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <NumberInput
                                    value={process.timePerTask}
                                    onChange={(value) => updateProcess(process.id, 'timePerTask', value)}
                                    className="w-16"
                                  />
                                  <Select
                                    value={process.timeUnit}
                                    onValueChange={(value) => updateProcess(process.id, 'timeUnit', value)}
                                  >
                                    <SelectTrigger className="h-8 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="minutes">Min</SelectItem>
                                      <SelectItem value="hours">Hrs</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <NumberInput
                                  value={process.fteCount || 0}
                                  onChange={(value) => updateProcess(process.id, 'fteCount', value)}
                                  className="w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <NumberInput
                                  value={process.averageHourlyWage}
                                  onChange={(value) => updateProcess(process.id, 'averageHourlyWage', value)}
                                  prefix="$"
                                  isPrepopulated={(() => {
                                    // Check if this matches global defaults or group defaults
                                    if (process.group) {
                                      const group = data.groups.find(g => g.name === process.group);
                                      if (group?.averageHourlyWage && process.averageHourlyWage === group.averageHourlyWage) {
                                        return true;
                                      }
                                    }
                                    return process.averageHourlyWage === data.globalDefaults.averageHourlyWage;
                                  })()}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingCFOFields(process.id)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Settings className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        {(() => {
                                          const metrics = getAdvancedMetricsSummary(process);
                                          if (metrics.length === 0) {
                                            return <p className="text-xs font-medium">Advanced Metrics</p>;
                                          }
                                          return (
                                            <div className="space-y-1">
                                              <p className="font-medium text-xs mb-1">Advanced Metrics</p>
                                              {metrics.map((metric, idx) => (
                                                <div key={idx} className="text-xs flex justify-between gap-2">
                                                  <span className="text-muted-foreground">{metric.label}:</span>
                                                  <span className="font-medium">{metric.value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => duplicateProcess(process.id)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Duplicate Process</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {onWorkflowClick && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onWorkflowClick(process.id, process.name)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect x="3" y="3" width="7" height="7" />
                                              <rect x="14" y="3" width="7" height="7" />
                                              <rect x="14" y="14" width="7" height="7" />
                                              <rect x="3" y="14" width="7" height="7" />
                                              <line x1="10" y1="6.5" x2="14" y2="6.5" />
                                              <line x1="10" y1="17.5" x2="14" y2="17.5" />
                                              <line x1="6.5" y1="10" x2="6.5" y2="14" />
                                              <line x1="17.5" y1="10" x2="17.5" y2="14" />
                                            </svg>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">Workflow</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeProcess(process.id)}
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Delete Process</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </DraggableProcessRow>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      )
                    )}
                  </DroppableGroupContainer>
                    </>
                  )}
                </DraggableGroupSection>
              );
            }))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics Dialog */}
      {editingCFOFields && (() => {
        const process = data.processes.find(p => p.id === editingCFOFields);
        if (!process) return null;
        return (
          <ProcessAdvancedMetricsDialog
            process={process}
            open={!!editingCFOFields}
            onOpenChange={(open) => !open && setEditingCFOFields(null)}
            onUpdate={(field, value) => updateProcess(editingCFOFields, field, value)}
            organizationId={organizationId}
          />
        );
      })()}
      
      {/* Keyboard-controlled Add Process Dialog (triggered by Enter key) */}
      <AddProcessDialog
        groups={data.groups}
        onAddProcess={addProcess}
        globalDefaults={data.globalDefaults}
        externalOpen={showAddProcessDialog}
        onExternalOpenChange={setShowAddProcessDialog}
      />

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
    </DndProvider>
  );
}