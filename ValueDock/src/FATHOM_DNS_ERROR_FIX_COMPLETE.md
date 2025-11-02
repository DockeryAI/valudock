# Fathom DNS Error Fix - Complete

## Problem Summary
The engagement summary feature was failing with DNS errors when trying to call the Fathom API directly:
```
[AGGREGATE-MEETINGS] Error: dns error: failed to lookup address information: Name or service not known
[PROCESS-ENGAGEMENT] Error: error sending request for url (https://api.fathom.video/v1/meetings)
```

## Root Cause
The `processEngagementSummary` function in `/supabase/functions/server/index.tsx` was attempting to directly call the Fathom API at `https://api.fathom.video/v1/meetings`, which fails due to DNS restrictions in Supabase Edge Functions.

## Solution Applied
Updated the `processEngagementSummary` function to use the Fathom proxy (deployed at VD_URL) instead of calling the Fathom API directly.

### Before
```typescript
// Direct API call - FAILS with DNS error
const fathomResponse = await fetch('https://api.fathom.video/v1/meetings', {
  headers: {
    'Authorization': `Bearer ${fathomApiKey}`,
    'Content-Type': 'application/json',
  },
});
```

### After
```typescript
// Proxy call - WORKS
const vdUrl = Deno.env.get('VALUEDOCK_SUPABASE_URL') || Deno.env.get('VD_URL');
const vdServiceKey = Deno.env.get('VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('VD_SERVICE_ROLE_KEY');

const proxyUrl = `${vdUrl}/functions/v1/fathom-proxy`;

const fathomResponse = await fetch(proxyUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${vdServiceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    domain: domain,
    fathomApiKey: fathomApiKey
  })
});
```

## Environment Variables Required
Ensure these environment variables are configured in your Supabase project:

1. **FATHOM_API_KEY** - Your Fathom API key
2. **OPENAI_API_KEY** - Your OpenAI API key  
3. **VALUEDOCK_SUPABASE_URL** (or **VD_URL**) - External Supabase project URL where the proxy is deployed
   - Example: `https://your-external-project.supabase.co`
4. **VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY** (or **VD_SERVICE_ROLE_KEY**) - Service role key for the external project

## Changes Made

### File: `/supabase/functions/server/index.tsx`
- **Function**: `processEngagementSummary` (lines ~7638-7840)
- **Change**: Updated Fathom API call to use proxy instead of direct API call
- **Benefits**:
  - No more DNS errors
  - Consistent with the `aggregate-meetings` endpoint implementation
  - Proxy handles domain filtering automatically
  - Better error handling and logging

## Testing

### Test the Engagement Summary Feature:
1. Go to the **Presentation** screen
2. Fill in the **Company Website** field in the Executive Summary section
   - Example: `acme.com` (just the domain, no `https://` or `www.`)
3. Click the **"Generate from Fathom Meetings"** button
4. Check the Debug Console for logs:
   - Should see: `[PROCESS-ENGAGEMENT] ✓ Using VD proxy: https://...`
   - Should see: `[PROCESS-ENGAGEMENT] ✅ Meetings from proxy for domain: X`
   - Should NOT see any DNS errors

### Expected Debug Output (Success):
```
[ENGAGEMENT-SUMMARY] Starting aggregation for domain: acme.com
[ENGAGEMENT-SUMMARY] Initial record stored in KV at: engagement:acme.com:<uuid>
[PROCESS-ENGAGEMENT] Starting for domain: acme.com run_id: <uuid>
[PROCESS-ENGAGEMENT] ✓ Using VD proxy: https://xyz.supabase.co
[PROCESS-ENGAGEMENT] Calling Fathom proxy for domain: acme.com
[PROCESS-ENGAGEMENT] ✅ Meetings from proxy for domain: 5
[PROCESS-ENGAGEMENT] Calling OpenAI for analysis...
[PROCESS-ENGAGEMENT] Analysis complete, updating KV store...
[PROCESS-ENGAGEMENT] ✓ Complete for run_id: <uuid>
```

### If You Still Get Errors:

#### Error: "Fathom proxy not configured"
- **Solution**: Set the `VALUEDOCK_SUPABASE_URL` and `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY` environment variables

#### Error: "Fathom proxy error (401)"
- **Solution**: Check that your `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY` is correct

#### Error: "Fathom proxy error (500)"
- **Solution**: Check that the Fathom proxy is deployed and the `FATHOM_API_KEY` is valid in the external project

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ ValuDock App (PresentationScreen.tsx)                           │
│ - User enters domain: "acme.com"                                │
│ - Clicks "Generate from Fathom Meetings"                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ValuDock Edge Function (server/index.tsx)                       │
│ POST /make-server-888f4514/engagement-summary                   │
│ - Stores initial "processing" status in KV store                │
│ - Launches background job: processEngagementSummary()           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ processEngagementSummary() - Background Job                     │
│ - Calls Fathom Proxy (VD_URL/functions/v1/fathom-proxy)        │
│ - Gets filtered meetings for domain                             │
│ - Sends transcripts to OpenAI for analysis                      │
│ - Updates KV store with results                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ External Supabase Project (VD_URL)                              │
│ fathom-proxy edge function                                      │
│ - Calls Fathom API (https://us.fathom.video/api/v1/meetings)   │
│ - Filters meetings by domain                                    │
│ - Returns filtered results                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Fathom API (https://us.fathom.video)                            │
│ - Returns all meetings for the API key                          │
└─────────────────────────────────────────────────────────────────┘
```

## KV Store Keys
The engagement summary data is stored in the KV store with this pattern:
- **Key**: `engagement:{domain}:{run_id}`
- **Example**: `engagement:acme.com:550e8400-e29b-41d4-a716-446655440000`

## Polling Flow
1. Frontend calls `/make-server-888f4514/engagement-summary` (POST) to start the job
2. Backend returns immediately with `{ ok: true, run_id, status: 'processing' }`
3. Frontend polls `/make-server-888f4514/engagement-status?domain=X&run_id=Y` every 2 seconds
4. When `status` changes to `'complete'`, the `summary` field contains the results
5. Frontend displays the results in the Meeting Summaries panel

## Related Files
- `/supabase/functions/server/index.tsx` - Main server with engagement summary endpoints
- `/supabase/functions/fathom-proxy/index.ts` - Proxy deployed to external Supabase project
- `/components/PresentationScreen.tsx` - Frontend that triggers the aggregation
- `/utils/fathomClient.ts` - Fathom client utilities (not used by engagement summary)

## Status
✅ **COMPLETE** - DNS errors fixed by routing all Fathom API calls through the proxy
