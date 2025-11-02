/**
 * Safe merge (no empty overwrite) + normalizers
 * 
 * Critical: NEVER overwrite non-empty arrays with empty arrays.
 * This prevents race conditions from losing valid meeting data.
 */

/**
 * Safely extract array from various API response formats
 */
export function ensureArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (v?.data && Array.isArray(v.data)) return v.data;
  if (v?.items && Array.isArray(v.items)) return v.items;
  return [];
}

/**
 * Normalize meetings to consistent format
 */
export function normalizeMeetings(raw: any[], source: string) {
  return ensureArray<any>(raw).map((m: any) => ({
    id: String(
      m.id ?? 
      m.meetingId ?? 
      (m.sourceId ? `${source}:${m.sourceId}` : `${source}:${Math.random().toString(36).slice(2)}`)
    ),
    title: m.title ?? m.topic ?? m.subject ?? 'Untitled meeting',
    start: m.start ?? m.start_time ?? m.startedAt,
    end: m.end ?? m.end_time ?? m.endedAt,
    attendees: m.attendees ?? m.participants ?? [],
    source,
    raw: m
  })).filter((x: any) => !!x.start);
}

/**
 * Safe merge - NEVER overwrite non-empty with empty
 * 
 * This is the CRITICAL guard that prevents race conditions:
 * - If current has data and incoming is empty → keep current (sticky)
 * - If both have data → merge and deduplicate
 * - If current is empty → use incoming
 */
export function safeMerge(current: any[], incoming: any[]): any[] {
  const inc = incoming ?? [];
  
  // 💡 STICKY GUARD: Never lose data
  if (current?.length && (!inc?.length)) {
    console.log('[safeMerge] 🛡️ BLOCKED empty overwrite:', {
      currentCount: current.length,
      incomingCount: 0,
    });
    return current;
  }
  
  // If incoming is empty, return current (whether empty or not)
  if (!inc?.length) return current ?? [];
  
  // Merge and deduplicate by ID
  const map = new Map<string, any>();
  [...(current ?? []), ...inc].forEach(m => map.set(m.id, m));
  
  // Sort by start time (most recent first)
  const merged = Array.from(map.values()).sort((a, b) => 
    String(b.start).localeCompare(String(a.start))
  );
  
  console.log('[safeMerge] ✅ Merged:', {
    currentCount: current?.length ?? 0,
    incomingCount: inc.length,
    mergedCount: merged.length,
  });
  
  return merged;
}
