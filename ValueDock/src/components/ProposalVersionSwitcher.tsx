/**
 * ProposalVersionSwitcher - Version management for proposals
 * 
 * Displays:
 * - Current version badge
 * - Dropdown list of versions with metadata
 * - Create New Version button
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { 
  ChevronDown, 
  Plus, 
  Check, 
  Clock, 
  User,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface ProposalVersion {
  id: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  lastModified?: string;
  tenantId?: string;
  organizationId?: string;
  dealId?: string;
}

interface ProposalVersionSwitcherProps {
  currentVersion: ProposalVersion;
  versions: ProposalVersion[];
  onVersionChange: (version: ProposalVersion) => void;
  onCreateVersion: () => Promise<void>;
  isCreating?: boolean;
}

export function ProposalVersionSwitcher({
  currentVersion,
  versions,
  onVersionChange,
  onCreateVersion,
  isCreating = false
}: ProposalVersionSwitcherProps) {
  
  const getStatusColor = (status: ProposalVersion['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'review':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'archived':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: ProposalVersion['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort versions by version number descending (latest first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="flex items-center gap-2">
      {/* Current Version Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Version {currentVersion.version}</span>
        <Badge 
          variant="outline" 
          className={`text-xs ${getStatusColor(currentVersion.status)}`}
        >
          {getStatusLabel(currentVersion.status)}
        </Badge>
      </div>

      {/* Version Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <ChevronDown className="h-4 w-4 mr-1" />
            Switch Version
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
            All Versions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="max-h-80 overflow-y-auto">
            {sortedVersions.map((version) => {
              const isCurrent = version.id === currentVersion.id;
              
              return (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => !isCurrent && onVersionChange(version)}
                  disabled={isCurrent}
                  className="flex-col items-start p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      {isCurrent && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(version.status)}`}
                    >
                      {getStatusLabel(version.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground w-full">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{version.createdByName || version.createdBy}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
          
          {versions.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No versions available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create New Version Button */}
      <Button 
        size="sm" 
        onClick={onCreateVersion}
        disabled={isCreating}
        className="h-9"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            New Version
          </>
        )}
      </Button>
    </div>
  );
}
