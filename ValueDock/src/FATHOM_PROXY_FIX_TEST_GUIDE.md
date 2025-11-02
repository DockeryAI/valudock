# Fathom Proxy Fix - Testing Guide

## ✅ What Was Fixed

The app was showing **"Proxy not deployed" / "0 meetings found"** even though the Fathom proxy is live at:
```
https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
```

**Root Cause:**
- Frontend was calling non-existent local routes (`/meetings/fathom`, `/fathom-proxy-raw`)
- Not using environment variables
- Not following Fathom API parameter requirements (domain, from, to, emails)
- Not implementing pagination with `next_cursor`

**Solution:**
- ✅ Created new `/meetings/fetchProxy.ts` with POST-based pagination
- ✅ Updated `/meetings/sources.ts` to use env var `VITE_FATHOM_PROXY_URL`
- ✅ Implemented proper Fathom API parameters
- ✅ Added pagination loop with `next_cursor`
- ✅ Graceful fallback to webhook mode if proxy unavailable

---

## 🧪 Testing Steps

### Step 1: Set Environment Variables

Create or update `.env.local` in project root:

```bash
VITE_FATHOM_MODE=proxy
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
VITE_SUPABASE_PROJECT_REF=hpnxaentcrlditokrpyo
```

---

### Step 2: Restart Dev Server

**IMPORTANT:** Vite caches environment variables!

```bash
# Stop current server (Ctrl+C)
pnpm dev
```

---

### Step 3: Verify Environment Loaded

Open browser console and run:

```javascript
console.log('Mode:', import.meta.env.VITE_FATHOM_MODE);
console.log('Proxy URL:', import.meta.env.VITE_FATHOM_PROXY_URL);
```

**Expected output:**
```
Mode: proxy
Proxy URL: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
```

❌ **If you see `undefined`:**
- Your `.env.local` file is not in the project root
- You forgot to restart the dev server
- Variable names are misspelled

---

### Step 4: Test Proxy Directly

Run this fetch test in browser console:

```javascript
fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'testorganization.com',
    emails: [],
    from: '2024-01-01T00:00:00.000Z',
    to: '2024-12-31T23:59:59.999Z'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Proxy response:', data);
  console.log('Items count:', data?.items?.length || 0);
  console.log('Has next page:', !!data?.next_cursor);
})
.catch(err => console.error('❌ Proxy error:', err));
```

**Expected responses:**

✅ **Success (proxy is deployed):**
```json
{
  "items": [...],  // Array of meetings (may be empty)
  "next_cursor": "abc123..."  // Or null if no more pages
}
```

✅ **No meetings (but proxy works):**
```json
{
  "items": [],
  "next_cursor": null
}
```
This is normal if no meetings match the domain/date filter.

❌ **Proxy not deployed:**
```
TypeError: Failed to fetch
```
or
```
404 Not Found
```

---

### Step 5: Navigate to Meetings Tab

1. Log in to ValuDock
2. Click **Meetings** tab
3. Open browser console (F12)
4. Watch for log messages

---

### Step 6: Verify Console Logs

**✅ CORRECT (Proxy Mode):**
```
[fetchFathomMeetings] 📞 Starting fetch: { orgId: "org123", emailCount: 3, ... }
[fetchFathomMeetings] 🔧 Configuration: { mode: "proxy", proxyUrl: "https://..." }
[fetchFathomMeetings] ℹ️ Fathom API integration: Using proxy mode
[fetchFathomMeetings] 🌐 Domain: testorganization.com
[fetchFathomMeetingsProxyMode] 📞 Starting proxy fetch: { ... }
[fetchFathomMeetingsProxyMode] 📄 Fetching page 1
[fetchFathomMeetingsProxyMode] ✅ Page 1 fetched: 15 items
[fetchFathomMeetingsProxyMode] ✅ Total fetched: 15
[runMeetingsPipeline] ✅ Complete: { phase: "MERGED", count: 15 }
```

**⚠️ Fallback to Webhook Mode:**
```
[fetchFathomMeetings] ℹ️ No VITE_FATHOM_PROXY_URL configured - webhook mode assumed
[fetchFathomMeetings] 💡 Meetings will be synced via webhook when they complete in Fathom
```
This means env vars are not loaded or proxy URL is missing.

**❌ OLD BEHAVIOR (Bug - should not see this):**
```
[fetchFathomMeetings] Calling /meetings/fathom...
Error: Failed to fetch
```
If you see this, the old code is still running. Clear cache and hard refresh.

---

### Step 7: Verify UI Shows Meetings

After a few seconds, you should see:

**✅ Success:**
- Meeting cards appear in the Meetings panel
- Each card shows title, date, participants
- No error messages

**⚠️ Zero Results (Normal):**
- Message: "No meetings found for the selected time range"
- This is normal if:
  - Organization has no meetings in Fathom
  - Domain filter doesn't match any meetings
  - Time window is outside meeting dates

**❌ Error (Needs Investigation):**
- "Proxy not deployed" message
- Check Step 4 (proxy deployment test)

---

## 🔍 Debugging Checklist

### Problem: Still seeing "Proxy not deployed"

**Checklist:**
- [ ] `.env.local` file exists in project root
- [ ] `VITE_FATHOM_PROXY_URL` is set correctly
- [ ] Dev server was restarted after env change
- [ ] Browser console shows correct env var values
- [ ] Direct fetch test (Step 4) returns 200 OK

---

### Problem: "0 meetings found" but proxy works

**Checklist:**
- [ ] Organization has a valid domain set (Admin → Organizations)
- [ ] Domain matches meetings in Fathom (e.g., participants have @domain.com emails)
- [ ] Time window includes meeting dates (default is last 180 days)
- [ ] Users exist in the organization with emails

**Debug in console:**
```javascript
// Check what domain is being queried
// Look for this in the console logs:
[fetchFathomMeetings] 🌐 Domain: ???
```

---

### Problem: Infinite spinner / no response

**Checklist:**
- [ ] Network tab shows POST to proxy URL
- [ ] Response status is 200 (not 404, 500, etc.)
- [ ] No CORS errors in console
- [ ] Not behind corporate firewall blocking Supabase

---

### Problem: Pagination not working

**Checklist:**
- [ ] Console shows multiple "Fetching page X" messages
- [ ] Each page fetches items
- [ ] Loop stops when `next_cursor` is null

**Expected behavior:**
```
[fetchFathomMeetingsProxyMode] 📄 Fetching page 1
[fetchFathomMeetingsProxyMode] ✅ Page 1 fetched: 50 items
[fetchFathomMeetingsProxyMode] 📄 Fetching page 2
[fetchFathomMeetingsProxyMode] ✅ Page 2 fetched: 50 items
[fetchFathomMeetingsProxyMode] 📄 Fetching page 3
[fetchFathomMeetingsProxyMode] ✅ Page 3 fetched: 23 items
[fetchFathomMeetingsProxyMode] ✅ No more pages
[fetchFathomMeetingsProxyMode] ✅ Total fetched: 123
```

---

## 📊 Before vs After

### ❌ BEFORE (Bug)

**Code:**
```typescript
// Called non-existent route
const url = '/meetings/fathom';
const res = await apiCall(url, { method: 'GET' });
```

**Console:**
```
Error: Failed to fetch /meetings/fathom
Proxy not deployed
0 meetings found
```

**UI:**
```
⚠️ Fathom API not configured
0 meetings found
```

---

### ✅ AFTER (Fixed)

**Code:**
```typescript
// Calls deployed proxy with proper params
const proxyUrl = import.meta.env.VITE_FATHOM_PROXY_URL;
const res = await fetch(proxyUrl, {
  method: 'POST',
  body: JSON.stringify({ domain, from, to, emails, cursor })
});
```

**Console:**
```
[fetchFathomMeetings] ℹ️ Fathom API integration: Using proxy mode
[fetchFathomMeetingsProxyMode] ✅ Page 1 fetched: 15 items
[runMeetingsPipeline] ✅ Complete: { phase: "MERGED", count: 15 }
```

**UI:**
```
✅ 15 meetings loaded
[Meeting cards displayed]
```

---

## 🎯 Success Criteria

You've successfully fixed the issue when you see:

✅ Environment variables loaded correctly  
✅ Console shows "Using proxy mode"  
✅ Console shows "Starting proxy fetch"  
✅ Console shows "Page X fetched: N items"  
✅ Console shows "Total fetched: N"  
✅ No "proxy not deployed" errors  
✅ Meeting cards appear in UI (if meetings exist)  

---

## 📚 Related Documentation

- `/FATHOM_PROXY_ENV_SETUP.md` - Detailed environment setup
- `/MEETINGS_RELIABILITY_KIT_README.md` - Comprehensive meetings guide
- `/FATHOM_INTEGRATION_COMPLETE.md` - Full integration overview

---

## 🆘 Still Having Issues?

If tests are failing:

1. **Share console logs** - Copy all logs from `[fetchFathomMeetings]` onwards
2. **Test proxy directly** - Share response from Step 4 fetch test
3. **Verify env vars** - Share output from Step 3 console check
4. **Check organization setup** - Verify org has domain and users

The issue is either:
- Environment not configured (missing `.env.local`)
- Proxy actually not deployed (test with curl/Postman)
- Domain mismatch (org domain doesn't match Fathom data)
