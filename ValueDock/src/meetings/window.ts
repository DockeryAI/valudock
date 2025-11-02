/**
 * Meetings Time Window Calculator
 * 
 * Deterministic TZ window (180d default, end-of-day) + params echo
 */

/**
 * Compute a timezone-aware date window for meeting queries
 * 
 * @param tz - IANA timezone (e.g., 'America/Chicago')
 * @param days - Number of days to look back (default 180)
 * @returns ISO date strings for start and end of window
 */
export function computeWindow(
  tz: string = 'America/Chicago',
  days: number = 180
): {
  fromISO: string;
  toISO: string;
  tz: string;
} {
  const nowLocal = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const end = new Date(nowLocal);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  // convert to ISO with UTC offset applied
  const toISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  
  return {
    tz,
    fromISO: toISO(start),
    toISO: toISO(end),
  };
}

/**
 * Add standard query params with cache buster
 */
export function withStdParams(base: string, params: Record<string, any>): string {
  const u = new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => 
    u.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  );
  // cache buster
  u.searchParams.set('_', String(Date.now()));
  return u.toString().replace(window.location.origin, '');
}
