/**
 * Source adapters - HTTP proxy only (no webhooks)
 * 
 * Fetches meetings from deployed fathom-server proxy
 */

import { FathomClient } from '../src/integrations/fathom/client';
import type { DateISO } from '../src/integrations/fathom/client';

export interface OrgIdentity {
  orgId: string;
  domainEmails: string[]; // e.g., ["*@testorganization.com"]
}

export interface DateWindow {
  fromISO: DateISO;
  toISO: DateISO;
}

/**
 * Fetch Fathom meetings via HTTP proxy (no webhooks)
 * 
 * Flow:
 * 1. Check if proxy is configured
 * 2. POST /full_sync to warm cache
 * 3. GET ?mode=read with pagination
 */
export async function fetchFathomMeetingsViaProxy(identity: OrgIdentity, window: DateWindow) {
  // Check if Fathom proxy is configured before attempting to use it
  if (!FathomClient.isConfigured()) {
    // Quietly skip if not configured - this is expected for many installations
    throw new Error('[Fathom] Missing VITE_FATHOM_PROXY_URL (or FATHOM_PROXY_URL). Configure .env.local and rebuild.');
  }
  
  console.log('[fetchFathomMeetings] 🚀 Using HTTP proxy (no webhooks):', {
    orgId: identity.orgId,
    domainEmails: identity.domainEmails,
    window: `${window.fromISO.slice(0, 10)} → ${window.toISO.slice(0, 10)}`
  });
  
  const client = new FathomClient();

  // Step 1: Trigger full sync (warm cache)
  try {
    await client.fullSync(identity.orgId, identity.domainEmails, window.fromISO, window.toISO);
  } catch (err) {
    console.warn('[fetchFathomMeetings] ⚠️ full_sync failed (non-fatal):', err);
    // Continue anyway - read might still work from existing cache
  }

  // Step 2: Read meetings with pagination
  const all: any[] = [];
  let pageToken: string | undefined;

  do {
    const { meetings, nextPageToken } = await client.read({
      orgId: identity.orgId,
      domainEmails: identity.domainEmails,
      fromISO: window.fromISO,
      toISO: window.toISO,
      pageToken
    });
    
    all.push(...(meetings || []));
    pageToken = nextPageToken || undefined;
  } while (pageToken);

  console.log('[fetchFathomMeetings] ✅ Total fetched:', all.length);
  return all;
}

/**
 * Fetch meetings from summary cache
 * 
 * Single call (no pagination for now, can be added later)
 */
export async function fetchSummaryMeetings({
  orgId,
  fromISO,
  toISO
}: {
  orgId: string;
  fromISO: string;
  toISO: string;
}) {
  console.log('[fetchSummaryMeetings] 📞 Starting fetch:', {
    orgId,
    dateRange: `${fromISO.slice(0, 10)} to ${toISO.slice(0, 10)}`,
  });
  
  const url = withStdParams('/meetings/summary', {
    orgId,
    from: fromISO,
    to: toISO,
  });
  
  try {
    const res = await apiCall(url, { method: 'GET' });
    const items = ensureArray<any>(res?.items ?? res);
    
    console.log('[fetchSummaryMeetings] ✅ Fetched:', items.length, 'items');
    return items;
  } catch (error) {
    console.error('[fetchSummaryMeetings] ❌ Error:', error);
    return [];
  }
}
