/**
 * Meetings FSM - State machine for meeting data lifecycle
 * 
 * This ensures meetings are loaded in the right order with proper context resolution,
 * preventing race conditions and empty overwrites.
 */

export type MeetingsPhase = 
  | 'IDLE'               // No meetings loaded yet
  | 'RESOLVING_CONTEXT'  // Determining org/domain/emails
  | 'FETCHING'           // Loading from sources
  | 'MERGED'             // Successfully loaded and merged
  | 'EMPTY';             // No meetings found (with diagnostics)

export type MeetingsContext = {
  // Organization context
  orgId: string | null;
  orgDomain?: string | null;     // e.g., testorganization.com
  userEmails?: string[];         // loaded from /admin/users for this org
  
  // Time window (timezone-aware)
  tz: string;                    // 'America/Chicago'
  fromISO: string;               // start window (inclusive)
  toISO: string;                 // end window (exclusive)
  
  // Source data (raw)
  fathom: any[];                 // raw items from Fathom API
  summaries: any[];              // from meeting_summaries cache
  
  // Merged normalized meetings
  merged: any[];                 // final normalized meetings
  
  // Diagnostics for zero-state debugging
  diagnostics: {
    reason?: string;             // Why meetings are empty
    counts: Record<string, number>; // {fathom: n, summaries: m, merged: k}
    params: Record<string, any>;    // Query params used
  };
};

/**
 * Default empty meetings context
 */
export const defaultMeetingsCtx: MeetingsContext = {
  orgId: null,
  tz: 'America/Chicago',
  fromISO: '',
  toISO: '',
  fathom: [],
  summaries: [],
  merged: [],
  diagnostics: { 
    counts: {}, 
    params: {} 
  },
};

/**
 * Detect why meetings are empty (for diagnostics)
 */
export function detectZeroReason(
  diag: MeetingsContext['diagnostics'],
  app: { orgId: string | null }
): string {
  if (!app.orgId) return 'no_org';
  
  const fathomCount = diag?.counts?.fathom ?? 0;
  const summariesCount = diag?.counts?.summaries ?? 0;
  
  if (fathomCount === 0 && summariesCount === 0) {
    return 'no_source_results';
  }
  
  if (diag?.params?.fromISO && diag?.params?.toISO) {
    return 'date_window_miss';
  }
  
  return 'unknown';
}

/**
 * Get user-friendly error message for zero state
 */
export function getZeroStateMessage(reason: string): {
  title: string;
  message: string;
  suggestions: string[];
} {
  switch (reason) {
    case 'no_org':
      return {
        title: 'No Organization Selected',
        message: 'Please select an organization to view meetings.',
        suggestions: [
          'Use the context switcher to select an organization',
          'Ensure your account is assigned to an organization',
        ],
      };
    
    case 'no_source_results':
      return {
        title: 'No Meetings Found',
        message: 'No meetings were found in any source for the selected time period.',
        suggestions: [
          'Try extending the date range to 180 days',
          'Check if Fathom is connected to the correct email addresses',
          'Verify the organization domain is correct',
          'Ensure timezone is set correctly (currently America/Chicago)',
        ],
      };
    
    case 'date_window_miss':
      return {
        title: 'No Meetings in Date Range',
        message: 'No meetings found in the selected date range.',
        suggestions: [
          'Try extending the date range',
          'Check if meetings occurred in a different timezone',
          'Verify the date range includes expected meeting dates',
        ],
      };
    
    default:
      return {
        title: 'Unknown Error',
        message: 'Unable to load meetings due to an unknown error.',
        suggestions: [
          'Try refreshing the page',
          'Check browser console for errors',
          'Contact support if the issue persists',
        ],
      };
  }
}
