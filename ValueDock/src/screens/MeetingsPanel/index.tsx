/**
 * Meetings Panel + Zero-state reasons
 * 
 * Displays meetings with comprehensive zero-state diagnostics when empty.
 */

import React, { useEffect } from 'react';
import { runMeetingsPipeline, getMeetingsState } from '../../meetings/pipeline';

interface MeetingsPanelProps {
  orgId: string | null;
}

export default function MeetingsPanel({ orgId }: MeetingsPanelProps) {
  const [state, setState] = React.useState(getMeetingsState());
  const [loading, setLoading] = React.useState(false);

  // Trigger pipeline when org changes (no polling)
  useEffect(() => {
    if (orgId) {
      console.log('[MeetingsPanel] Running pipeline for org:', orgId);
      setLoading(true);
      runMeetingsPipeline({ orgId })
        .then(() => {
          setState(getMeetingsState());
        })
        .catch(err => {
          console.error('[MeetingsPanel] Pipeline error:', err);
          setState(getMeetingsState());
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orgId]);

  const m = state;

  if (!m || m.phase !== 'MERGED') {
    return <ZeroMeetings diagnostics={m?.diagnostics} reason={m?.reason} orgId={orgId} />;
  }

  const handleRefresh = () => {
    if (orgId) {
      console.log('[MeetingsPanel] Manual refresh triggered');
      setLoading(true);
      runMeetingsPipeline({ orgId })
        .then(() => setState(getMeetingsState()))
        .catch(err => {
          console.error('[MeetingsPanel] Refresh error:', err);
          setState(getMeetingsState());
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="space-y-2">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-70">
          {m.list.length} meetings · Fathom: {m.diagnostics.counts.fathom}, Summary: {m.diagnostics.counts.summaries}
          {' · '}Window {m.diagnostics.params.fromISO?.slice(0, 10)} → {m.diagnostics.params.toISO?.slice(0, 10)} ({m.diagnostics.params.tz})
          {m.diagnostics.demo && (
            <span className="text-orange-600 font-medium"> · DEMO MODE DOMAIN</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border hover:bg-muted disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Demo banner */}
      {m.diagnostics.demo && (
        <div className="rounded-md border border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700 p-2 text-xs">
          ⚠️ Demo data is enabled for this organization (domain: {m.diagnostics.params.domain}). 
          Toggle off in settings to view real meetings.
        </div>
      )}

      {/* Meetings list */}
      <ul className="divide-y rounded border">
        {m.list.map((x: any) => (
          <li key={x.id} className="p-3">
            <div className="flex justify-between">
              <div className="font-medium">{x.title}</div>
              <div className="text-xs opacity-60">{x.source}</div>
            </div>
            <div className="text-sm opacity-80">
              {new Date(x.start).toLocaleString()}
              {x.end && ` → ${new Date(x.end).toLocaleString()}`}
            </div>
            {!!x.attendees?.length && (
              <div className="text-xs opacity-60 truncate">
                {x.attendees.join(', ')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Zero-state component with diagnostics
 */
function ZeroMeetings({
  diagnostics,
  reason,
  orgId,
}: {
  diagnostics?: any;
  reason?: any;
  orgId: string | null;
}) {
  const p = diagnostics?.params ?? {};
  const c = diagnostics?.counts ?? {};

  const handleRetry = () => {
    if (orgId) {
      console.log('[ZeroMeetings] Retrying pipeline...');
      runMeetingsPipeline({ orgId });
    }
  };

  const handleShowDiagnostics = () => {
    alert(JSON.stringify({ diagnostics }, null, 2));
  };

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="font-semibold">No meetings</div>
      
      <div className="text-xs opacity-70">
        Reason: <code className="px-1 py-0.5 bg-muted rounded">{reason ?? 'unknown'}</code>
      </div>
      
      <div className="text-xs opacity-70">
        Source counts — Fathom: {c.fathom ?? 0}, Summary: {c.summaries ?? 0}
      </div>
      
      <div className="text-xs opacity-70">
        Window: {p.fromISO?.slice(0, 10)} → {p.toISO?.slice(0, 10)} ({p.tz})
      </div>
      
      <div className="text-xs opacity-70">
        Emails (sample): {(p.emailsSample ?? []).join(', ') || '(none)'}
        {diagnostics?.demo && <span className="text-orange-600 font-medium"> · DEMO DOMAIN</span>}
      </div>

      {/* Suggestions based on reason */}
      {reason === 'no_org' && (
        <div className="text-xs opacity-70 border-t pt-2">
          <strong>Suggestion:</strong> Select an organization using the context switcher
        </div>
      )}
      {reason === 'no_emails_for_org' && (
        <div className="text-xs opacity-70 border-t pt-2">
          <strong>Suggestion:</strong> Add users with email addresses to this organization in Admin → Users
        </div>
      )}
      {reason === 'no_org_domain' && (
        <div className="text-xs opacity-70 border-t pt-2">
          <strong>Suggestion:</strong> Set organization domain in Admin → Organizations
        </div>
      )}
      {reason === 'proxy_not_configured' && (
        <div className="text-xs border-t pt-2 bg-blue-50 dark:bg-blue-950/20 -mx-3 -mb-2 p-3 rounded-b">
          <strong className="text-blue-700 dark:text-blue-400">⚙️ Fathom Proxy Not Configured</strong>
          <p className="mt-1 opacity-90">
            Set VITE_FATHOM_PROXY_URL in .env.local and restart dev server.
          </p>
          
          <div className="mt-3 bg-white dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <code className="text-xs">VITE_FATHOM_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-server</code>
          </div>
        </div>
      )}
      {reason === 'dns_error' && (
        <div className="text-xs border-t pt-2 bg-orange-50 dark:bg-orange-950/20 -mx-3 -mb-2 p-3 rounded-b">
          <strong className="text-orange-700 dark:text-orange-400">Network Restriction Detected</strong>
          <p className="mt-1 opacity-90">
            The Fathom API cannot be reached due to network restrictions in the hosting environment.
          </p>
          <p className="mt-2 opacity-90">
            <strong>Solutions:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 opacity-80">
            <li>Use the <strong>Fathom Webhook</strong> integration instead (Admin → Integrations)</li>
            <li>Deploy the proxy to a non-Supabase environment (Cloudflare Worker, AWS Lambda)</li>
            <li>Contact support for alternative API access methods</li>
          </ul>
        </div>
      )}
      {reason === 'no_source_results' && (
        <div className="text-xs opacity-70 border-t pt-2">
          <strong>Suggestions:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>Verify Fathom is connected to the organization's email addresses</li>
            <li>Check if meetings occurred in the 180-day window</li>
            <li>Ensure organization domain is correct</li>
            <li>Consider using Fathom Webhook integration (Admin → Integrations)</li>
          </ul>
        </div>
      )}
      
      <div className="flex gap-2 pt-1">
        <button
          className="px-3 py-1 rounded border hover:bg-accent"
          onClick={handleRetry}
          disabled={!orgId}
        >
          Retry 180d
        </button>
        <button
          className="px-3 py-1 rounded border hover:bg-accent"
          onClick={handleShowDiagnostics}
        >
          Show diagnostics
        </button>
      </div>
    </div>
  );
}
