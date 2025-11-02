# Fathom Proxy Rebuild - Test Guide

## ✅ What Was Changed

Complete removal of all webhook/polling code and replacement with clean HTTP proxy architecture.

### Deleted Files
- ❌ `/utils/fathomWebhook.ts` - Webhook listener
- ❌ `/utils/fathomClient.ts` - Old proxy client
- ❌ `/utils/valuedockFathomClient.ts` - ValueDock-specific client
- ❌ `/meetings/fetchProxy.ts` - Old fetch proxy

### New Files
- ✅ `/src/env.ts` - Safe environment variable access for Figma runtime
- ✅ `/src/integrations/fathom/client.ts` - Clean HTTP client (GET read, POST full_sync)

### Modified Files
- ✅ `/meetings/sources.ts` - Now uses `FathomClient` directly
- ✅ `/meetings/pipeline.ts` - Removed webhook fallback logic
- ✅ `/screens/MeetingsPanel/index.tsx` - Removed polling timer, added manual refresh

---

## 🔧 Environment Setup

### 1. Create `.env.local`

```bash
# Fathom proxy URL (required)
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server
```

### 2. Restart Dev Server

```bash
# Stop server (Ctrl+C)
pnpm dev
```

---

## 🧪 Testing Steps

### Step 1: Verify Environment Loading

Open browser console:

```javascript
// Should work now with safe access
import('/src/env').then(m => console.log('Proxy URL:', m.FATHOM_PROXY_BASE));
```

Expected:
```
Proxy URL: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server
```

---

### Step 2: Navigate to Meetings Tab

1. Log in to ValuDock
2. Click **Meetings** tab
3. Watch console logs

**Expected logs:**
```
[MeetingsPanel] Running pipeline for org: org_abc123
[fetchFathomMeetings] 🚀 Using HTTP proxy (no webhooks): { orgId: "...", domainEmails: ["*@testorganization.com"], window: "2024-07-25 → 2024-10-22" }
[FathomClient] POST full_sync: { orgId: "...", emails: 1, fromISO: "...", toISO: "..." }
[FathomClient] ✅ full_sync complete
[FathomClient] GET read: { mode: "read", orgId: "...", domainEmails: ["*@testorganization.com"], pageToken: undefined }
[FathomClient] ✅ read response: { meetingsCount: 15, hasNextPage: false }
[fetchFathomMeetings] ✅ Total fetched: 15
[runMeetingsPipeline] ✅ Complete: { phase: "MERGED", count: 15, reason: "ok" }
```

---

### Step 3: Verify Meetings Display

**If meetings exist:**
- ✅ Meeting cards appear
- ✅ Shows title, date, attendees
- ✅ Header shows counts: "15 meetings · Fathom: 15, Summary: 0"

**If no meetings:**
- ✅ Shows zero-state message
- ✅ Reason code displayed
- ✅ No alarming errors

---

### Step 4: Test Manual Refresh

Click the **Refresh** button in the header.

**Expected:**
- Button shows "Refreshing..."
- Console shows pipeline re-run
- Meetings update (if any changes)
- Button returns to "Refresh"

---

## 🔍 Key Differences from Old Code

### ❌ OLD (Webhooks)
```typescript
// Polling timer
setInterval(() => {
  setState(getMeetingsState());
}, 500);

// Webhook fallback
if (!proxyUrl) {
  console.log('webhook mode assumed');
  return [];
}
```

### ✅ NEW (HTTP Proxy Only)
```typescript
// No polling - manual refresh only
const handleRefresh = () => {
  runMeetingsPipeline({ orgId });
};

// Direct HTTP calls
const client = new FathomClient();
await client.fullSync(...);
const { meetings } = await client.read(...);
```

---

## 📊 Architecture Flow

### Old (Removed)
```
Frontend → Check env vars → If missing → Fall back to webhook mode
         → Poll every 500ms → Check for webhook data
```

### New (Current)
```
Frontend → Load env vars (safe access)
         → POST /full_sync (warm cache)
         → GET ?mode=read (with pagination)
         → Display results
         → Manual refresh button
```

---

## 🐛 Troubleshooting

### Problem: "Missing VITE_FATHOM_PROXY_URL"

**Cause:** Environment variable not set or dev server not restarted.

**Fix:**
1. Check `.env.local` exists in project root
2. Verify variable is set correctly
3. Restart dev server

---

### Problem: No meetings found

**Cause:** 
- Proxy is working but no meetings match filters
- Organization domain not set
- No users in organization

**Debug:**
```
Check logs for:
[FathomClient] ✅ read response: { meetingsCount: 0, hasNextPage: false }
```

**Fix:**
1. Verify organization has domain set
2. Verify domain matches Fathom meeting participants
3. Check date window includes meetings

---

### Problem: Network errors

**Cause:** Proxy endpoint not deployed or wrong URL.

**Fix:**
1. Test proxy directly:
   ```bash
   curl -X POST https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server/full_sync \
     -H "Content-Type: application/json" \
     -d '{"orgId":"test","emails":[],"fromISO":"2024-01-01","toISO":"2024-12-31"}'
   ```

2. Verify URL in `.env.local` matches deployed function

---

## ✅ Success Criteria

After implementing these changes, you should see:

1. ✅ No webhook references in code
2. ✅ No polling timers (no setInterval)
3. ✅ Clean HTTP POST/GET flow
4. ✅ Manual refresh button works
5. ✅ Console logs show "Using HTTP proxy (no webhooks)"
6. ✅ Meetings load successfully (if they exist in Fathom)
7. ✅ Environment errors are clear and actionable

---

## 📚 Code Structure

```
/src/
  env.ts                          # Safe env var access
  integrations/
    fathom/
      client.ts                   # HTTP client (POST full_sync, GET read)

/meetings/
  sources.ts                      # fetchFathomMeetingsViaProxy (uses client)
  pipeline.ts                     # runMeetingsPipeline (no webhook logic)

/screens/
  MeetingsPanel/
    index.tsx                     # UI (manual refresh, no polling)
```

---

## 🎯 Next Steps

1. Set `VITE_FATHOM_PROXY_URL` in `.env.local`
2. Restart dev server
3. Test meetings tab
4. Verify console logs
5. Click refresh button
6. Confirm no webhook references

**The system now uses only HTTP proxy calls - no webhooks, no polling, no fallbacks.**
