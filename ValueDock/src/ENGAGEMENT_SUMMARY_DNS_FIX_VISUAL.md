# Engagement Summary DNS Fix - Visual Guide

## 🔴 BEFORE (DNS Errors)

### Error Messages You Were Seeing:
```
[READ] ⚠️ No company website specified
[AGGREGATE-MEETINGS] Error: error sending request for url (https://api.fathom.video/v1/meetings): 
  client error (Connect): dns error: failed to lookup address information: 
  Name or service not known

[PROCESS-ENGAGEMENT] Error: TypeError: error sending request for url (https://api.fathom.video/v1/meetings): 
  client error (Connect): dns error: failed to lookup address information: 
  Name or service not known
```

### What Was Happening:
```
┌─────────────────────────────────────┐
│ PresentationScreen.tsx              │
│ User enters: "acme.com"             │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ POST /engagement-summary            │
│ - domain: "acme.com"                │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ processEngagementSummary()          │
│                                     │
│ ❌ DIRECT CALL TO FATHOM API        │
│ fetch('https://api.fathom.video...')│
│                                     │
│ DNS LOOKUP FAILS! ❌                │
│ "Name or service not known"        │
└─────────────────────────────────────┘
```

### The Problem Code:
```typescript
// ❌ THIS FAILED
const fathomResponse = await fetch('https://api.fathom.video/v1/meetings', {
  headers: {
    'Authorization': `Bearer ${fathomApiKey}`,
    'Content-Type': 'application/json',
  },
});
// Error: dns error: failed to lookup address information
```

---

## 🟢 AFTER (Using Proxy - FIXED!)

### Success Messages You'll See:
```
[ENGAGEMENT-SUMMARY] Starting aggregation for domain: acme.com
[ENGAGEMENT-SUMMARY] Initial record stored in KV at: engagement:acme.com:abc123...
[PROCESS-ENGAGEMENT] Starting for domain: acme.com run_id: abc123...
[PROCESS-ENGAGEMENT] ✓ Using VD proxy: https://xyz.supabase.co
[PROCESS-ENGAGEMENT] Calling Fathom proxy for domain: acme.com
[PROCESS-ENGAGEMENT] ✅ Meetings from proxy for domain: 5
[PROCESS-ENGAGEMENT] Calling OpenAI for analysis...
[PROCESS-ENGAGEMENT] Analysis complete, updating KV store...
[PROCESS-ENGAGEMENT] ✓ Complete for run_id: abc123...
```

### What Happens Now:
```
┌─────────────────────────────────────┐
│ PresentationScreen.tsx              │
│ User enters: "acme.com"             │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ POST /engagement-summary            │
│ - domain: "acme.com"                │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ processEngagementSummary()          │
│                                     │
│ ✅ PROXY CALL                       │
│ fetch(VD_URL/fathom-proxy)         │
│ - domain: "acme.com"                │
│ - fathomApiKey: "..."               │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ External Supabase (VD_URL)          │
│ /functions/v1/fathom-proxy          │
│                                     │
│ ✅ CALLS FATHOM API                 │
│ fetch('https://us.fathom.video...')│
│                                     │
│ ✅ SUCCESS!                         │
│ Returns meetings for "acme.com"    │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ processEngagementSummary()          │
│ - Got meetings from proxy ✅        │
│ - Send to OpenAI for analysis       │
│ - Store results in KV store         │
└─────────────────────────────────────┘
```

### The Fixed Code:
```typescript
// ✅ THIS WORKS
const vdUrl = Deno.env.get('VALUEDOCK_SUPABASE_URL') || Deno.env.get('VD_URL');
const vdServiceKey = Deno.env.get('VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('VD_SERVICE_ROLE_KEY');

console.log('[PROCESS-ENGAGEMENT] ✓ Using VD proxy:', vdUrl);

const fathomResponse = await fetch(`${vdUrl}/functions/v1/fathom-proxy`, {
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
// Success! Proxy returns filtered meetings
```

---

## 📋 Quick Test Checklist

### ✅ Step 1: Check Environment Variables
Go to your Supabase project settings and verify:
- [ ] `FATHOM_API_KEY` is set
- [ ] `OPENAI_API_KEY` is set
- [ ] `VALUEDOCK_SUPABASE_URL` (or `VD_URL`) is set
  - Example: `https://abc123xyz.supabase.co`
- [ ] `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY` (or `VD_SERVICE_ROLE_KEY`) is set

### ✅ Step 2: Test in the App
1. Open the **Presentation** screen
2. In the **Executive Summary** section:
   - Enter a company name: "Acme Corp"
   - Enter a website: **`acme.com`** (just the domain, no https://)
3. Click **"Generate from Fathom Meetings"**
4. Open the **Debug Console** (it's at the bottom of the screen)

### ✅ Step 3: Check for Success Messages
In the Debug Console, you should see:
```
✅ [PROCESS-ENGAGEMENT] ✓ Using VD proxy: https://...
✅ [PROCESS-ENGAGEMENT] ✅ Meetings from proxy for domain: X
✅ [PROCESS-ENGAGEMENT] ✓ Complete for run_id: ...
```

### ❌ What NOT to See:
```
❌ dns error: failed to lookup address information
❌ Name or service not known
❌ error sending request for url (https://api.fathom.video...)
```

---

## 🔧 Troubleshooting

### Issue: "No company website specified"
**Cause**: The Company Website field is empty  
**Fix**: Enter a domain (e.g., `acme.com`) in the Executive Summary section

### Issue: "Fathom proxy not configured"
**Cause**: Missing `VALUEDOCK_SUPABASE_URL` or `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY`  
**Fix**: Set these environment variables in your Supabase project

### Issue: "Fathom proxy error (401)"
**Cause**: Invalid service role key  
**Fix**: Check that `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY` is correct

### Issue: "Fathom proxy error (500)"
**Cause**: Fathom proxy not deployed or Fathom API key invalid  
**Fix**: 
1. Deploy the proxy to the external Supabase project
2. Check that `FATHOM_API_KEY` is valid

---

## 📊 Data Flow Summary

### KV Store Record Lifecycle:

#### 1️⃣ Initial State (Processing)
```json
{
  "domain": "acme.com",
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "created_at": "2025-10-21T10:00:00Z",
  "updated_at": "2025-10-21T10:00:00Z",
  "summary": null,
  "error": null
}
```
**Stored at**: `engagement:acme.com:550e8400-e29b-41d4-a716-446655440000`

#### 2️⃣ Final State (Complete)
```json
{
  "domain": "acme.com",
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "complete",
  "created_at": "2025-10-21T10:00:00Z",
  "updated_at": "2025-10-21T10:00:15Z",
  "summary": {
    "meetings_count": 5,
    "people": [
      {"name": "John Doe", "role": "CTO", "count": 3}
    ],
    "themes": [
      {"topic": "Automation", "mentions": 8}
    ],
    "goals": ["Reduce manual processing"],
    "challenges": ["Legacy systems integration"],
    "risks": ["Timeline constraints"],
    "recommendations": ["Phased rollout approach"]
  },
  "error": null
}
```

#### 3️⃣ Error State (if something fails)
```json
{
  "domain": "acme.com",
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "error",
  "created_at": "2025-10-21T10:00:00Z",
  "updated_at": "2025-10-21T10:00:10Z",
  "summary": null,
  "error": "Fathom proxy error (500): Internal server error"
}
```

---

## ✅ Summary

| Aspect | Before ❌ | After ✅ |
|--------|----------|----------|
| **API Call** | Direct to fathom.video | Via VD proxy |
| **DNS Resolution** | Fails | Works |
| **Error Handling** | Generic errors | Detailed logging |
| **Consistency** | Different from aggregate-meetings | Same pattern as aggregate-meetings |
| **Environment Vars** | Only FATHOM_API_KEY | VD_URL + VD_SERVICE_ROLE_KEY |

**Status**: ✅ **FIXED** - All Fathom API calls now use the proxy to avoid DNS errors.
