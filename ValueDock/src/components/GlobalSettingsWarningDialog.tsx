import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';

interface GlobalSettingsWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  affectedProcesses: string[];
  settingName: string;
}

export function GlobalSettingsWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  affectedProcesses,
  settingName,
}: GlobalSettingsWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <AlertDialogTitle>Apply Global Setting to Processes?</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You're about to change <span className="font-semibold text-foreground">"{settingName}"</span> in the global settings.
            </p>
            <p className="text-sm text-muted-foreground">
              The following {affectedProcesses.length} {affectedProcesses.length === 1 ? 'process has' : 'processes have'} individual cost settings that differ from the global defaults:
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {affectedProcesses.map((processName, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {processName}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-orange-900">
              Do you want to apply this change to all processes?
            </p>
            <ul className="text-sm text-orange-800 space-y-1 ml-4 list-disc">
              <li>
                <strong>Yes, apply globally:</strong> All processes will use the new global setting value
              </li>
              <li>
                <strong>No, keep individual settings:</strong> Only new processes will use this global value
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: You can always adjust individual process settings later in the Advanced Metrics section of each process.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Keep Individual Settings
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700">
            Apply to All Processes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
