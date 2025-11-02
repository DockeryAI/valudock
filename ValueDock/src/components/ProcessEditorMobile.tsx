import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, Settings, BarChart3, Trash2 } from 'lucide-react';
import { ProcessData, GlobalDefaults } from './utils/calculations';
import { ProcessStandardMetrics } from './ProcessStandardMetrics';
import { ProcessAdvancedMetricsMobile } from './ProcessAdvancedMetricsMobile';

interface ProcessEditorMobileProps {
  process: ProcessData;
  globalDefaults: GlobalDefaults;
  onChange: (process: ProcessData) => void;
  onDelete?: () => void;
}

type MobileView = 'list' | 'standard' | 'advanced';

export function ProcessEditorMobile({ process, globalDefaults, onChange, onDelete }: ProcessEditorMobileProps) {
  const [currentView, setCurrentView] = useState<MobileView>('list');

  const updateField = (field: keyof ProcessData, value: any) => {
    onChange({ ...process, [field]: value });
  };

  // List view - shows process name and buttons
  if (currentView === 'list') {
    return (
      <Card className="w-full border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Input
              value={process.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="text-base font-medium bg-transparent border-none p-0 h-auto focus-visible:ring-0 flex-1"
              placeholder="Process Name"
            />
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 text-left whitespace-normal"
            onClick={() => setCurrentView('standard')}
          >
            <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base">Standard Metrics</div>
              <div className="text-sm text-muted-foreground">Name, tasks, time, FTE, wage</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 text-left whitespace-normal"
            onClick={() => setCurrentView('advanced')}
          >
            <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base">Advanced Metrics</div>
              <div className="text-sm text-muted-foreground">Task type, SLA, overhead, seasonal</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Standard metrics view
  if (currentView === 'standard') {
    return (
      <Card className="w-full max-h-[85vh] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('list')}
              className="p-0 h-auto flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-medium text-sm truncate">{process.name} - Standard</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-1 overflow-y-auto">
          <ProcessStandardMetrics
            process={process}
            globalDefaults={globalDefaults}
            onChange={onChange}
            onBack={() => setCurrentView('list')}
          />
        </CardContent>
      </Card>
    );
  }

  // Advanced metrics view
  if (currentView === 'advanced') {
    return (
      <Card className="w-full max-h-[85vh] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('list')}
              className="p-0 h-auto flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-medium text-sm truncate">{process.name} - Advanced</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-1 overflow-y-auto">
          <ProcessAdvancedMetricsMobile
            process={process}
            globalDefaults={globalDefaults}
            onChange={onChange}
            onBack={() => setCurrentView('list')}
          />
        </CardContent>
      </Card>
    );
  }

  return null;
}
