/**
 * Fathom HTTP Proxy Client
 * 
 * Direct HTTP calls to deployed fathom-server edge function.
 * No webhooks, no polling, no timers.
 */

import { FATHOM_PROXY_BASE } from '../../env';

export type DateISO = string;

export interface ReadParams {
  orgId: string;
  domainEmails: string[]; // e.g., ["*@testorganization.com"]
  fromISO: DateISO;       // inclusive (YYYY-MM-DD or ISO)
  toISO: DateISO;         // inclusive
  pageToken?: string;
}

export interface FathomMeeting {
  id: string;
  startedAt: string;
  endedAt?: string;
  title?: string;
  participants?: string[];
  transcriptAvailable?: boolean;
  // ...extend as needed
}

export interface ReadResponse {
  meetings: FathomMeeting[];
  nextPageToken?: string | null;
}

export class FathomClient {
  private base: string | undefined;

  constructor() {
    // Don't throw here - let individual methods handle missing config gracefully
    this.base = FATHOM_PROXY_BASE;
    
    if (!this.base) {
      console.warn('[FathomClient] ⚠️ VITE_FATHOM_PROXY_URL not configured - Fathom integration will be unavailable');
    }
  }
  
  /**
   * Check if the Fathom proxy is configured
   */
  static isConfigured(): boolean {
    return !!FATHOM_PROXY_BASE;
  }
  
  /**
   * Check if this instance is configured
   */
  isReady(): boolean {
    return !!this.base;
  }
  
  private assertConfigured(): void {
    if (!this.base) {
      throw new Error('[Fathom] Missing VITE_FATHOM_PROXY_URL (or FATHOM_PROXY_URL). Configure .env.local and rebuild.');
    }
  }

  /**
   * POST /full_sync - Trigger server to fetch and cache recent meetings
   */
  async fullSync(orgId: string, emails: string[], fromISO: DateISO, toISO: DateISO): Promise<{ ok: boolean }> {
    this.assertConfigured();
    
    const url = `${this.base}/full_sync`;
    
    console.log('[FathomClient] POST full_sync:', { orgId, emails: emails.length, fromISO, toISO });
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orgId, emails, fromISO, toISO })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[Fathom full_sync] ${res.status} ${text}`);
    }
    
    console.log('[FathomClient] ✅ full_sync complete');
    return { ok: true };
  }

  /**
   * GET ?mode=read - Read meetings from server cache with pagination
   */
  async read(params: ReadParams): Promise<ReadResponse> {
    this.assertConfigured();
    
    const q = new URLSearchParams({
      mode: 'read',
      orgId: params.orgId,
      from: params.fromISO,
      to: params.toISO,
      ...(params.pageToken ? { pageToken: params.pageToken } : {})
    });

    // Allow multiple domainEmails
    params.domainEmails.forEach((e) => q.append('email', e));

    const url = `${this.base}?${q.toString()}`;
    
    console.log('[FathomClient] GET read:', { 
      mode: 'read',
      orgId: params.orgId,
      domainEmails: params.domainEmails,
      pageToken: params.pageToken ? '(has token)' : undefined
    });
    
    const res = await fetch(url, { method: 'GET' });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[Fathom read] ${res.status} ${text}`);
    }
    
    const data = await res.json() as ReadResponse;
    
    console.log('[FathomClient] ✅ read response:', {
      meetingsCount: data.meetings?.length || 0,
      hasNextPage: !!data.nextPageToken
    });
    
    return data;
  }
}
