/**
 * Meetings Pipeline (end-to-end) with zero-state diagnostics
 * 
 * Features:
 * 1. Demo mode detection
 * 2. Identity resolution (org → emails + domain)
 * 3. Pagination loop (no single-page reads)
 * 4. Safe merge (never overwrite non-empty with empty)
 * 5. Zero-state diagnostics
 */

import { computeWindow } from './window';
import { resolveOrgIdentity } from './identity';
import { fetchFathomMeetingsViaProxy, fetchSummaryMeetings } from './sources';
import { normalizeMeetings, safeMerge } from './merge';
import { shouldUseDemo } from './demoGuard';

// Global state placeholder - in real app, this would be from Zustand/Redux
let meetingsState: any = { phase: 'IDLE', list: [], diagnostics: { counts: {}, params: {} }, reason: null };

/**
 * Get current meetings state
 */
export function getMeetingsState() {
  return meetingsState;
}

/**
 * Set meetings state
 */
export function setMeetingsState(newState: any) {
  meetingsState = { ...meetingsState, ...newState };
}

/**
 * Run the complete meetings pipeline
 */
export async function runMeetingsPipeline(app: { orgId: string | null }) {
  console.log('[runMeetingsPipeline] 🚀 Starting pipeline for org:', app.orgId);
  
  if (!app.orgId) {
    setMeetingsState({
      phase: 'EMPTY',
      reason: 'no_org',
      list: [],
      diagnostics: { counts: {}, params: {} },
    });
    console.log('[runMeetingsPipeline] ⚠️ No org ID - aborting');
    return;
  }

  try {
    // Compute window
    const { tz, fromISO, toISO } = computeWindow('America/Chicago', 180);
    
    console.log('[runMeetingsPipeline] 📅 Window:', {
      tz,
      fromISO: fromISO.slice(0, 10),
      toISO: toISO.slice(0, 10),
    });
    
    // Resolve identity
    const { org, emails, domain, domainEmails } = await resolveOrgIdentity(app);
    const demo = shouldUseDemo(org);

    const diagnostics: any = {
      params: {
        orgId: app.orgId,
        domain,
        tz,
        fromISO,
        toISO,
        emailsSample: emails.slice(0, 5),
      },
      counts: { fathom: 0, summaries: 0, merged: 0 },
      demo,
    };

    console.log('[runMeetingsPipeline] 🔍 Identity resolved, demo mode:', demo);

    // If demo mode → show banner but STILL try real data
    // (If you need to block real data fetches in demo mode, early-return here)

    let merged: any[] = [];
    let fathomError: any = null;

    // Fetch from Fathom proxy (no webhooks)
    let fathom: any[] = [];
    try {
      fathom = await fetchFathomMeetingsViaProxy(
        { orgId: app.orgId, domainEmails },
        { fromISO, toISO }
      );
    } catch (err) {
      fathomError = err;
      const errStr = String(err);
      
      // Only log as error if it's NOT a configuration issue
      if (errStr.includes('VITE_FATHOM_PROXY_URL')) {
        console.log('[runMeetingsPipeline] ℹ️ Fathom proxy not configured - skipping Fathom integration');
      } else {
        console.error('[runMeetingsPipeline] ❌ Fathom proxy error:', err);
      }
    }

    // Fetch summary meetings (parallel if needed later)
    const summariesData = await fetchSummaryMeetings({ orgId: app.orgId, fromISO, toISO }).catch(() => []);

    // Normalize
    const fathomN = normalizeMeetings(fathom, 'fathom');
    const summariesN = normalizeMeetings(summariesData, 'summary');
    
    // Safe merge (sticky - never overwrite non-empty with empty)
    merged = safeMerge(merged, fathomN);
    merged = safeMerge(merged, summariesN);

    diagnostics.counts = {
      fathom: fathomN.length,
      summaries: summariesN.length,
      merged: merged.length,
    };
    
    // Store fathom error for diagnostics
    if (fathomError) {
      diagnostics.fathomError = String(fathomError);
    }

    // Determine reason
    let reason = 'ok';
    
    if (merged.length === 0) {
      if (fathomError) {
        const errStr = String(fathomError);
        if (errStr.includes('VITE_FATHOM_PROXY_URL')) {
          reason = 'proxy_not_configured';
        } else if (errStr.includes('dns') || errStr.includes('network')) {
          reason = 'network_error';
        } else {
          reason = 'proxy_error';
        }
      } else if (domainEmails.length === 0 || !domain) {
        reason = 'no_org_domain';
      } else {
        reason = 'no_source_results';
      }
    }

    setMeetingsState({
      phase: merged.length ? 'MERGED' : 'EMPTY',
      list: merged,
      diagnostics,
      reason,
    });

    console.log('[runMeetingsPipeline] ✅ Complete:', {
      phase: merged.length ? 'MERGED' : 'EMPTY',
      count: merged.length,
      reason,
    });
  } catch (error: any) {
    const errorString = String(error);
    const isEnvError = errorString.includes('VITE_FATHOM_PROXY_URL') || 
                      errorString.includes('Missing VITE_FATHOM');
    
    if (isEnvError) {
      console.error('[runMeetingsPipeline] ❌ Proxy not configured');
      console.log('[runMeetingsPipeline] 💡 Set VITE_FATHOM_PROXY_URL in .env.local and restart dev server');
    } else {
      console.error('[runMeetingsPipeline] ❌ Pipeline error:', error);
    }
    
    setMeetingsState({
      phase: 'EMPTY',
      reason: isEnvError ? 'proxy_not_configured' : 'error',
      list: [],
      diagnostics: {
        counts: {},
        params: { error: errorString },
      },
    });
  }
}


