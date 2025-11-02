# Fathom Proxy Environment Setup Guide

## Overview

ValuDock uses a deployed Supabase Edge Function to fetch meetings from the Fathom API. This guide explains how to configure the frontend to use the deployed proxy.

---

## Environment Variables Required

Create or update your `.env.local` file in the project root with the following variables:

```bash
# Fathom Integration Mode
VITE_FATHOM_MODE=proxy

# Fathom Proxy URL (deployed Supabase Edge Function)
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy

# Supabase Project Reference
VITE_SUPABASE_PROJECT_REF=hpnxaentcrlditokrpyo
```

---

## Configuration Options

### Option 1: Proxy Mode (Recommended for Active Fetching)

**When to use:**
- You want to actively fetch meetings from Fathom API
- You have deployed the fathom-proxy edge function
- You need real-time meeting data on demand

**Configuration:**
```bash
VITE_FATHOM_MODE=proxy
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
```

**How it works:**
1. Frontend calls the deployed proxy with POST requests
2. Proxy authenticates with Fathom API using server-side credentials
3. Results are paginated automatically (up to 20 pages)
4. Meetings are filtered by domain and email addresses

---

### Option 2: Webhook Mode (Alternative)

**When to use:**
- Proxy is not deployed or unreachable
- You prefer passive webhook integration
- Fathom sends completed meeting data directly to your backend

**Configuration:**
```bash
# Either leave VITE_FATHOM_PROXY_URL unset, or set to empty string
VITE_FATHOM_MODE=webhook
```

**How it works:**
1. Frontend detects proxy is unavailable
2. Gracefully falls back to webhook mode
3. Meetings are received passively when Fathom webhooks fire
4. No active API calls to Fathom

---

## Testing Your Configuration

### 1. Verify Environment Variables are Loaded

Open browser console and check:

```javascript
console.log('FATHOM_MODE:', import.meta.env.VITE_FATHOM_MODE);
console.log('PROXY_URL:', import.meta.env.VITE_FATHOM_PROXY_URL);
```

You should see:
```
FATHOM_MODE: proxy
PROXY_URL: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
```

---

### 2. Test Proxy Deployment

Run this in your browser console:

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
.then(data => console.log('✅ Proxy works!', data))
.catch(err => console.error('❌ Proxy error:', err));
```

**Expected responses:**

✅ **Success (200):**
```json
{
  "items": [...],
  "next_cursor": "..." // or null if no more pages
}
```

⚠️ **No results (200 with empty items):**
```json
{
  "items": [],
  "next_cursor": null
}
```
This is normal if no meetings match the filters.

❌ **Proxy not deployed (404):**
```
Failed to fetch / 404 Not Found
```
If you see this, the proxy is not deployed. Use webhook mode instead.

---

### 3. Check Meetings Panel

1. Navigate to the **Meetings** tab in ValuDock
2. Watch the browser console for logs

**Proxy mode logs:**
```
[fetchFathomMeetings] 📞 Starting fetch: { orgId: "...", emailCount: 3, ... }
[fetchFathomMeetings] 🔧 Configuration: { mode: "proxy", proxyUrl: "https://..." }
[fetchFathomMeetings] ℹ️ Fathom API integration: Using proxy mode
[fetchFathomMeetingsProxyMode] 📞 Starting proxy fetch: { ... }
[fetchFathomMeetingsProxyMode] 📄 Fetching page 1 { domain: "acme.com", ... }
[fetchFathomMeetingsProxyMode] ✅ Page 1 fetched: 15 items
[fetchFathomMeetingsProxyMode] ✅ Total fetched: 15
```

**Webhook mode logs (fallback):**
```
[fetchFathomMeetings] ℹ️ No VITE_FATHOM_PROXY_URL configured - webhook mode assumed
[fetchFathomMeetings] 💡 Meetings will be synced via webhook when they complete in Fathom
```

---

## Troubleshooting

### Problem: "0 meetings found" but proxy returns data

**Cause:** Domain mismatch or email filtering too strict

**Solution:**
1. Check organization domain is set correctly in Admin → Organizations
2. Verify users have email addresses matching the domain
3. Check console logs for actual domain being queried

---

### Problem: "Proxy not deployed" message

**Cause:** VITE_FATHOM_PROXY_URL is incorrect or proxy is not deployed

**Solution:**
1. Verify the proxy URL is correct in `.env.local`
2. Test the proxy URL directly (see "Test Proxy Deployment" above)
3. If proxy is not deployed, use webhook mode instead

---

### Problem: Infinite "Loading meetings..."

**Cause:** Network error or CORS issue

**Solution:**
1. Check browser console for errors
2. Verify Supabase project ID in URL is correct
3. Check if you're behind a corporate firewall blocking Supabase

---

### Problem: Variables not updating after .env.local change

**Cause:** Vite dev server caches environment variables

**Solution:**
Restart the dev server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

---

## Required Fathom API Parameters

The proxy expects these parameters in the POST body:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | ✅ Yes | Organization domain (e.g., "acme.com") |
| `from` | string | ✅ Yes | ISO date for start of range |
| `to` | string | ✅ Yes | ISO date for end of range |
| `emails` | string[] | ⚠️ Optional | Filter by specific user emails |
| `cursor` | string | ⚠️ Optional | Pagination cursor for next page |

---

## Architecture Diagram

```
┌─────────────────┐
│  ValuDock UI    │
│  (Frontend)     │
└────────┬────────┘
         │ POST /functions/v1/fathom-proxy
         │ { domain, from, to, emails, cursor }
         ▼
┌─────────────────────────────┐
│  Supabase Edge Function     │
│  fathom-proxy               │
│  (Server-side)              │
└────────┬────────────────────┘
         │ GET /calls
         │ ?domain=...&from=...&to=...
         │ Authorization: Bearer <FATHOM_API_KEY>
         ▼
┌─────────────────┐
│   Fathom API    │
│   (External)    │
└─────────────────┘
```

---

## Quick Reference Card

**✅ Proxy Mode (Active):**
```bash
VITE_FATHOM_MODE=proxy
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
```

**⚠️ Webhook Mode (Passive):**
```bash
VITE_FATHOM_MODE=webhook
# VITE_FATHOM_PROXY_URL not set or empty
```

**🔄 After changing .env.local:**
```bash
pnpm dev  # Restart dev server
```

**🧪 Test in console:**
```javascript
console.log(import.meta.env.VITE_FATHOM_PROXY_URL);
```

---

## Next Steps

1. ✅ Set environment variables in `.env.local`
2. ✅ Restart dev server
3. ✅ Test proxy with console fetch
4. ✅ Navigate to Meetings tab
5. ✅ Check console logs for confirmation
6. ✅ Verify meetings appear in UI

---

**Need Help?**

Check `/MEETINGS_RELIABILITY_KIT_README.md` for comprehensive troubleshooting.
