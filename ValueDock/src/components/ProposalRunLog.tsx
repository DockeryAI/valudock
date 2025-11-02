import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { apiCall } from '../utils/auth';

interface RunLogEntry {
  timestamp: string;
  phase: 'Discovery' | 'ROI' | 'Solution' | 'Export';
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number; // in milliseconds
  notes?: string;
}

interface ProposalRunLogProps {
  tenantId?: string;
  orgId?: string;
  dealId?: string;
  runId?: string;
}

const PHASES = ['Discovery', 'ROI', 'Solution', 'Export'] as const;

export function ProposalRunLog({ 
  tenantId, 
  orgId, 
  dealId, 
  runId 
}: ProposalRunLogProps) {
  const [logs, setLogs] = useState<RunLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<typeof PHASES[number] | null>(null);
  const [filterRunId, setFilterRunId] = useState(runId || '');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Calculate progress percentage based on completed phases
  const getProgressPercentage = () => {
    if (!currentPhase) return 0;
    const phaseIndex = PHASES.indexOf(currentPhase);
    return ((phaseIndex + 1) / PHASES.length) * 100;
  };

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (tenantId) params.append('tenant_id', tenantId);
      if (orgId) params.append('org_id', orgId);
      if (dealId) params.append('deal_id', dealId);
      if (filterRunId) params.append('run_id', filterRunId);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/proposal-logs?${queryString}` : '/proposal-logs';
      
      const data = await apiCall(endpoint, { method: 'GET' });
      
      if (data.success && data.logs) {
        setLogs(data.logs || []);
        
        // Determine current phase from most recent log
        if (data.logs && data.logs.length > 0) {
          const mostRecentLog = data.logs[0];
          setCurrentPhase(mostRecentLog.phase);
        }
      } else {
        console.error('Failed to fetch logs:', data.error || 'Unknown error');
      }
    } catch (error: any) {
      // Check if it's a network error (server not reachable)
      const isNetworkError = String(error).includes('Failed to fetch') || 
                            String(error).includes('Network request failed') ||
                            String(error).includes('Authentication required');
      
      if (isNetworkError) {
        // Silently fail for network errors - this is expected when server isn't deployed
        console.log('[ProposalRunLog] ℹ️ Server not reachable - logs unavailable');
      } else {
        // Log genuine errors
        console.error('[ProposalRunLog] ❌ Unexpected error fetching logs:', error);
        toast.error('Failed to fetch logs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (autoRefresh) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, tenantId, orgId, dealId, filterRunId]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [tenantId, orgId, dealId]);

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get status badge
  const getStatusBadge = (status: RunLogEntry['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Run Log</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {PHASES.map((phase, index) => (
              <React.Fragment key={phase}>
                <span className={currentPhase === phase ? 'text-primary font-medium' : ''}>
                  {phase}
                </span>
                {index < PHASES.length - 1 && (
                  <ArrowRight className="h-3 w-3 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Filters */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by Run ID..."
              value={filterRunId}
              onChange={(e) => setFilterRunId(e.target.value)}
              className="text-sm h-8"
            />
          </div>
          {(tenantId || orgId || dealId) && (
            <div className="flex flex-wrap gap-1 text-xs">
              {tenantId && (
                <Badge variant="outline" className="text-xs">
                  Tenant: {tenantId}
                </Badge>
              )}
              {orgId && (
                <Badge variant="outline" className="text-xs">
                  Org: {orgId}
                </Badge>
              )}
              {dealId && (
                <Badge variant="outline" className="text-xs">
                  Deal: {dealId}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Log Table */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No logs found</p>
              <p className="text-xs mt-1">
                {loading ? 'Loading...' : 'Run an agent to see logs here'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.phase}
                        </Badge>
                        {getStatusBadge(log.status)}
                      </div>
                      <p className="text-sm font-medium truncate">{log.step}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(log.duration)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground">{log.notes}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{logs.length} log {logs.length === 1 ? 'entry' : 'entries'}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
        </div>
      </div>
    </Card>
  );
}
