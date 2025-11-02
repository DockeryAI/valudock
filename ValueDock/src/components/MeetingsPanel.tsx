/**
 * Meetings Panel - Display meetings with zero-state diagnostics
 * 
 * Shows meetings from multiple sources with detailed diagnostics
 * when no meetings are found, helping debug why meetings are zero.
 */

import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, Calendar, Clock, Users, Video, RefreshCw } from 'lucide-react';
import { 
  MeetingsContext, 
  MeetingsPhase, 
  defaultMeetingsCtx,
  getZeroStateMessage,
} from '../meetings/fsm';
import { runMeetingsPipeline } from '../meetings/pipeline';
import { formatLocalDate } from '../meetings/window';

interface MeetingsPanelProps {
  orgId: string | null;
  autoLoad?: boolean;
}

export function MeetingsPanel({ orgId, autoLoad = true }: MeetingsPanelProps) {
  const [phase, setPhase] = useState<MeetingsPhase>('IDLE');
  const [context, setContext] = useState<MeetingsContext>(defaultMeetingsCtx);
  const [loading, setLoading] = useState(false);

  // Auto-load meetings when org changes
  useEffect(() => {
    if (autoLoad && orgId) {
      loadMeetings();
    }
  }, [orgId, autoLoad]);

  const loadMeetings = async () => {
    setLoading(true);
    
    try {
      await runMeetingsPipeline(
        orgId,
        (newPhase) => {
          setPhase(newPhase);
        },
        (newContext) => {
          setContext(newContext);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Show empty state if no meetings
  if (phase === 'EMPTY' || phase === 'IDLE') {
    return (
      <EmptyState 
        context={context} 
        loading={loading}
        onRetry={loadMeetings}
      />
    );
  }

  // Show loading state
  if (loading || phase === 'RESOLVING_CONTEXT' || phase === 'FETCHING') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {phase === 'RESOLVING_CONTEXT' && 'Resolving organization context...'}
              {phase === 'FETCHING' && 'Loading meetings from sources...'}
              {loading && 'Loading meetings...'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show meetings
  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Meetings</h3>
            <p className="text-sm text-muted-foreground">
              Showing {context.merged.length} meetings from {context.diagnostics.counts.fathom} Fathom + {context.diagnostics.counts.summaries} Summary
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {context.diagnostics.params.fromLocal?.slice(0, 12)} → {context.diagnostics.params.toLocal?.slice(0, 12)}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadMeetings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Meetings list */}
      <div className="space-y-3">
        {context.merged.map((meeting) => (
          <MeetingCard 
            key={meeting.id} 
            meeting={meeting} 
            tz={context.tz}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Single meeting card
 */
function MeetingCard({ meeting, tz }: { meeting: any; tz: string }) {
  const startLocal = formatLocalDate(meeting.start, tz);
  const endLocal = meeting.end ? formatLocalDate(meeting.end, tz) : null;
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and source */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium truncate">{meeting.title}</h4>
            <Badge variant="secondary" className="flex-shrink-0">
              {meeting.source}
            </Badge>
          </div>
          
          {/* Date/time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{startLocal}</span>
            </div>
            {meeting.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{meeting.duration} min</span>
              </div>
            )}
          </div>
          
          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Users className="h-3 w-3" />
              <span className="truncate">
                {meeting.attendees.slice(0, 3).join(', ')}
                {meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3} more`}
              </span>
            </div>
          )}
          
          {/* Summary (if available) */}
          {meeting.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meeting.summary}
            </p>
          )}
        </div>
        
        {/* Recording link */}
        {meeting.recordingUrl && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(meeting.recordingUrl, '_blank')}
          >
            <Video className="h-4 w-4 mr-2" />
            Recording
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * Empty state with diagnostics
 */
function EmptyState({ 
  context, 
  loading,
  onRetry,
}: { 
  context: MeetingsContext; 
  loading: boolean;
  onRetry: () => void;
}) {
  const reason = context.diagnostics.reason || 'unknown';
  const { title, message, suggestions } = getZeroStateMessage(reason);
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Icon and title */}
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        
        {/* Diagnostics */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium">Diagnostic Information</h4>
          
          {/* Reason code */}
          <div className="text-sm">
            <span className="text-muted-foreground">Reason: </span>
            <code className="px-2 py-1 bg-muted rounded text-xs">{reason}</code>
          </div>
          
          {/* Source counts */}
          <div className="text-sm">
            <span className="text-muted-foreground">Sources: </span>
            <span>
              Fathom: {context.diagnostics.counts.fathom ?? 0}, 
              {' '}Summary: {context.diagnostics.counts.summaries ?? 0}, 
              {' '}Merged: {context.diagnostics.counts.merged ?? 0}
            </span>
          </div>
          
          {/* Date window */}
          {context.diagnostics.params.fromLocal && (
            <div className="text-sm">
              <span className="text-muted-foreground">Window: </span>
              <span>
                {context.diagnostics.params.fromLocal?.slice(0, 12)} → {context.diagnostics.params.toLocal?.slice(0, 12)}
                {' '}({context.diagnostics.params.tz})
              </span>
            </div>
          )}
          
          {/* Email sample */}
          {context.diagnostics.params.emails && context.diagnostics.params.emails.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Emails (sample): </span>
              <span className="text-xs truncate">
                {context.diagnostics.params.emails.join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {/* Suggestions */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium">Suggestions</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 border-t pt-4">
          <Button 
            onClick={onRetry}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry (90d, local TZ)
          </Button>
        </div>
      </div>
    </Card>
  );
}
