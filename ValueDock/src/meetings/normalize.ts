/**
 * Meeting Normalizers and Safe Merge
 * 
 * Ensures consistent meeting data structure across different sources
 * and prevents empty arrays from overwriting non-empty data.
 */

/**
 * Safely extract array from various API response formats
 */
export function ensureArray<T>(v: any): T[] {
  // Already an array - return as-is
  if (Array.isArray(v)) return v as T[];
  
  // Wrapped in data field
  if (v?.data && Array.isArray(v.data)) return v.data as T[];
  
  // Wrapped in items field
  if (v?.items && Array.isArray(v.items)) return v.items as T[];
  
  // Wrapped in meetings field (Fathom specific)
  if (v?.meetings && Array.isArray(v.meetings)) return v.meetings as T[];
  
  // Not an array - return empty
  return [];
}

/**
 * Generate a unique ID for meetings without one
 */
function generateMeetingId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Normalize a single meeting to consistent format
 */
function normalizeMeeting(raw: any, source: string): any | null {
  // Extract ID (try multiple fields)
  const id = String(
    raw.id ?? 
    raw.meetingId ?? 
    raw.meeting_id ?? 
    raw.fathomMeetingId ?? 
    generateMeetingId()
  );
  
  // Extract title (try multiple fields)
  const title = 
    raw.title ?? 
    raw.topic ?? 
    raw.subject ?? 
    raw.name ?? 
    'Untitled Meeting';
  
  // Extract start time (required field)
  const start = 
    raw.start_time ?? 
    raw.start ?? 
    raw.startedAt ?? 
    raw.started_at ??
    raw.createdAt;
  
  // Skip meetings without a start time
  if (!start) return null;
  
  // Extract end time
  const end = 
    raw.end_time ?? 
    raw.end ?? 
    raw.endedAt ?? 
    raw.ended_at;
  
  // Extract attendees
  const attendees = ensureArray(
    raw.attendees ?? 
    raw.participants ?? 
    raw.emails ?? 
    []
  );
  
  // Extract duration (if available)
  const duration = 
    raw.duration ?? 
    raw.duration_minutes ??
    (end && start ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000) : null);
  
  // Extract recording URL
  const recordingUrl = 
    raw.recording_url ?? 
    raw.recordingUrl ?? 
    raw.video_url ?? 
    raw.videoUrl;
  
  // Extract summary
  const summary = 
    raw.summary ?? 
    raw.description ?? 
    raw.notes;
  
  return {
    id,
    title,
    start,
    end,
    duration,
    attendees,
    recordingUrl,
    summary,
    source,
    raw, // Keep raw data for debugging
  };
}

/**
 * Normalize an array of meetings
 */
export function normalizeMeetings(raw: any[], source: string = 'unknown'): any[] {
  const meetings = ensureArray<any>(raw);
  
  return meetings
    .map(m => normalizeMeeting(m, source))
    .filter((m): m is NonNullable<typeof m> => m !== null);
}

/**
 * Safe merge - NEVER overwrite non-empty with empty
 * 
 * This is critical to prevent race conditions where a late-arriving
 * empty response overwrites valid meeting data.
 */
export function safeMerge(current: any[], incoming: any[]): any[] {
  const incomingNormalized = ensureArray(incoming);
  
  // GUARD: Never overwrite non-empty with empty
  if (current.length > 0 && incomingNormalized.length === 0) {
    console.log('[safeMerge] 🛡️ BLOCKED: Prevented empty overwrite', {
      currentCount: current.length,
      incomingCount: 0,
    });
    return current;
  }
  
  // If incoming is empty, return current (whether empty or not)
  if (incomingNormalized.length === 0) {
    return current;
  }
  
  // Deduplicate by ID (incoming takes precedence for conflicts)
  const map = new Map<string, any>();
  
  // Add current meetings
  for (const meeting of current) {
    map.set(meeting.id, meeting);
  }
  
  // Add/overwrite with incoming meetings
  for (const meeting of incomingNormalized) {
    map.set(meeting.id, meeting);
  }
  
  // Sort by start time (most recent first)
  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const dateA = new Date(a.start).getTime();
    const dateB = new Date(b.start).getTime();
    return dateB - dateA; // Descending order
  });
  
  console.log('[safeMerge] ✅ Merged meetings', {
    currentCount: current.length,
    incomingCount: incomingNormalized.length,
    mergedCount: merged.length,
  });
  
  return merged;
}

/**
 * Merge multiple sources into a single array
 */
export function mergeSources(...sources: any[][]): any[] {
  let merged: any[] = [];
  
  for (const source of sources) {
    merged = safeMerge(merged, source);
  }
  
  return merged;
}

/**
 * Filter meetings by date range
 */
export function filterByDateRange(
  meetings: any[],
  fromISO: string,
  toISO: string
): any[] {
  const from = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  
  return meetings.filter(m => {
    const start = new Date(m.start).getTime();
    return start >= from && start <= to;
  });
}

/**
 * Group meetings by source
 */
export function groupBySource(meetings: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  for (const meeting of meetings) {
    const source = meeting.source || 'unknown';
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(meeting);
  }
  
  return groups;
}
