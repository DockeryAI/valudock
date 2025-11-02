# Edge Function Direct Test - Complete Guide

## 🎯 Overview

The "Test Edge Function" feature allows you to perform a direct HTTP POST to the Supabase edge function URL with demo data, showing the raw HTTP status code and JSON response to quickly diagnose deployment or connectivity issues.

---

## 🆚 Test vs Verify vs Deploy

### **Test Edge Function** 🧪
- **Purpose:** Direct HTTP connectivity test
- **Method:** Raw `fetch()` call to hardcoded URL
- **Shows:** HTTP status code + raw JSON response
- **Use When:** Debugging connection or deployment issues
- **Speed:** < 2 seconds

### **Verify Secrets** ✅
- **Purpose:** Check environment variables
- **Method:** POST via API wrapper
- **Shows:** Secrets checklist (5 API keys)
- **Use When:** Validating configuration
- **Speed:** < 1 second

### **Deploy Edge Function** 🔧
- **Purpose:** Deploy and verify deployment
- **Method:** Deployment + test call
- **Shows:** Deployment logs + verification
- **Use When:** Initial setup or after code changes
- **Speed:** 5-10 seconds

---

## 📍 Hardcoded URL

```
https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run
```

This URL is **hardcoded** in the test function to ensure we're testing the exact production endpoint, not a dynamic one that might be misconfigured.

---

## 🔍 What Gets Tested

### Request Details

**Method:** `POST`

**Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <jwt_token>'
}
```

**Demo Payload:**
```json
{
  "tenant_id": "test-tenant-1729123456789",
  "org_id": "test-org-1729123456789",
  "deal_id": "TEST-EDGE-1729123456789",
  "customer_url": "https://example.com",
  "fathom_window": {
    "start": "2025-09-16",
    "end": "2025-10-16"
  }
}
```

---

## 📊 Reading Test Results

### ✅ Success (200-299)

**HTTP Status:**
```
200 - Success
```

**Response Example:**
```json
{
  "status": "accepted",
  "request_id": "proposal-run-1729123456789-abc123",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "Proposal agent run request accepted and queued. ✅ All secrets loaded successfully",
  "secretsStatus": {
    "openai": true,
    "supabaseUrl": true,
    "supabaseServiceRole": true,
    "gamma": true,
    "fathom": true
  },
  "allSecretsLoaded": true
}
```

**What This Means:**
- ✅ Edge function is deployed
- ✅ Edge function is responding
- ✅ Authentication is working
- ✅ Request format is correct
- ✅ All secrets are loaded

---

### ⚠️ Client Error (400-499)

**HTTP Status:**
```
400 - Client Error
401 - Unauthorized
```

**Response Example (400):**
```json
{
  "error": "Missing required fields",
  "required": [
    "tenant_id",
    "org_id",
    "deal_id",
    "customer_url",
    "fathom_window"
  ]
}
```

**Response Example (401):**
```json
{
  "error": "Unauthorized"
}
```

**What This Means:**
- ⚠️ Edge function is deployed and running
- ❌ Request has a problem:
  - 401: Authentication token is invalid/missing
  - 400: Request format is wrong
  - 403: Forbidden (permissions issue)

**How to Fix:**
- **401:** Log out and log back in
- **400:** Check the demo payload format
- **403:** Verify user has admin permissions

---

### ❌ Server Error (500-599)

**HTTP Status:**
```
500 - Server Error
```

**Response Example:**
```json
{
  "status": "error",
  "error": "Internal server error",
  "timestamp": "2025-10-16T14:30:00.000Z"
}
```

**What This Means:**
- ⚠️ Edge function is deployed
- ❌ Edge function crashed or encountered an error
- Possible causes:
  - Code bug in edge function
  - Database connection failed
  - Environment variable missing
  - Dependency error

**How to Fix:**
1. Check edge function logs in Supabase dashboard
2. Click "Deploy Edge Function" to redeploy
3. Verify all environment variables are set
4. Check backend code for errors

---

### 🔴 Network Error

**Error Message:**
```
Request Failed: Failed to fetch
```

**What This Means:**
- ❌ Request couldn't reach the server
- Possible causes:
  - Edge function not deployed
  - Network connectivity issue
  - CORS policy blocking request
  - Wrong URL

**How to Fix:**
1. Click "Deploy Edge Function" first
2. Check internet connection
3. Verify URL is correct (hardcoded)
4. Check browser console for CORS errors

---

## 🎨 Visual Guide

### Step 1: Click Test Edge Function

```
┌──────────────────────────────────────────────────────────────┐
│ 🔧 Cloud Run Console                                    ⌃   │
│ Deploy and test the Edge Function                           │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │🧪 Test Edge  │  │✓ Verify      │  │🔧 Deploy     │       │
│ │  Function    │  │  Secrets     │  │  Edge Func   │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│        ▲                                                     │
│        └─ Click here first                                  │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 2: Watch Progress

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────┐                                             │
│ │⟳ Testing...  │                                             │
│ └──────────────┘                                             │
│                                                              │
│ 🧪 Testing edge function with direct HTTP POST...           │
│ 📍 URL: https://hpnxaentcrlditokrpyo.supabase.co/...        │
│                                                              │
│ 📤 Request Payload:                                          │
│ {                                                            │
│   "tenant_id": "test-tenant-1729123456789",                 │
│   "org_id": "test-org-1729123456789",                       │
│   ...                                                        │
│ }                                                            │
│                                                              │
│ 🔐 Auth token: Present ✓                                    │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 3: View Results - SUCCESS ✅

```
┌──────────────────────────────────────────────────────────────┐
│ Direct Test Results                                          │
│                                                              │
│ HTTP Status: [200 - Success ✓]                              │
│                                                              │
│ Raw Response JSON:                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ {                                                      │  │
│ │   "status": "accepted",                                │  │
│ │   "request_id": "proposal-run-...",                    │  │
│ │   "message": "✅ All secrets loaded successfully",     │  │
│ │   "secretsStatus": {                                   │  │
│ │     "openai": true,                                    │  │
│ │     "supabaseUrl": true,                               │  │
│ │     "supabaseServiceRole": true,                       │  │
│ │     "gamma": true,                                     │  │
│ │     "fathom": true                                     │  │
│ │   },                                                   │  │
│ │   "allSecretsLoaded": true                             │  │
│ │ }                                                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 📊 HTTP Status: 200 ✓                                       │
│ 📤 Sending verification request...                          │
│ 📥 Response received:                                        │
│ ✅ SUCCESS - Edge function is responding!                   │
└──────────────────────────────────────────────────────────────┘

         ↓ Toast notification ↓

┌──────────────────────────────────────────────────────────────┐
│ ✅ Edge function test passed! (200)                          │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 3: View Results - CLIENT ERROR ⚠️

```
┌──────────────────────────────────────────────────────────────┐
│ Direct Test Results                                          │
│                                                              │
│ HTTP Status: [401 - Client Error ⚠️]                        │
│                                                              │
│ Raw Response JSON:                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ {                                                      │  │
│ │   "error": "Unauthorized"                              │  │
│ │ }                                                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ⚠️ Error: Unauthorized                                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 📊 HTTP Status: 401 Unauthorized                            │
│ ⚠️ CLIENT ERROR (401) - Check authentication                │
└──────────────────────────────────────────────────────────────┘

         ↓ Toast notification ↓

┌──────────────────────────────────────────────────────────────┐
│ ❌ Test failed with 401 - Unauthorized                       │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 3: View Results - SERVER ERROR ❌

```
┌──────────────────────────────────────────────────────────────┐
│ Direct Test Results                                          │
│                                                              │
│ HTTP Status: [500 - Server Error ❌]                        │
│                                                              │
│ Raw Response JSON:                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ {                                                      │  │
│ │   "status": "error",                                   │  │
│ │   "error": "Internal server error",                    │  │
│ │   "timestamp": "2025-10-16T14:30:00.000Z"              │  │
│ │ }                                                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ⚠️ Error: Internal server error                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 📊 HTTP Status: 500 Internal Server Error                   │
│ ❌ SERVER ERROR (500) - Edge function may have crashed      │
└──────────────────────────────────────────────────────────────┘

         ↓ Toast notification ↓

┌──────────────────────────────────────────────────────────────┐
│ ❌ Test failed with 500 - Server error                       │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 3: View Results - NETWORK ERROR 🔴

```
┌──────────────────────────────────────────────────────────────┐
│ 🧪 Testing edge function with direct HTTP POST...           │
│ 📍 URL: https://hpnxaentcrlditokrpyo.supabase.co/...        │
│ ...                                                          │
│                                                              │
│ ❌ Request Failed: Failed to fetch                          │
│                                                              │
│ 🔍 This usually means:                                      │
│   • Edge function is not deployed                           │
│   • Network connectivity issue                              │
│   • CORS policy blocking the request                        │
└──────────────────────────────────────────────────────────────┘

         ↓ Toast notification ↓

┌──────────────────────────────────────────────────────────────┐
│ ❌ Test error: Failed to fetch                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### Scenario 1: Fresh Deployment

**Steps:**
1. Deploy edge function (may not exist yet)
2. Click "Test Edge Function"
3. Expect either:
   - ✅ 200 Success (if deployment worked)
   - 🔴 Network error (if deployment failed)

**What to Look For:**
- If network error → Click "Deploy Edge Function" first
- If 200 → Deployment successful!

---

### Scenario 2: Authentication Issue

**Steps:**
1. Log in as admin
2. Click "Test Edge Function"
3. If you get 401 → Token expired or invalid

**Fix:**
1. Sign out
2. Sign back in
3. Test again

---

### Scenario 3: Missing Secrets

**Steps:**
1. Click "Test Edge Function"
2. Get 200 Success
3. Look at `secretsStatus` in response

**What to Check:**
```json
{
  "secretsStatus": {
    "openai": false,     // ❌ Missing!
    "gamma": false,      // ❌ Missing!
    "fathom": true       // ✅ Present
  }
}
```

**Fix:**
1. Navigate to Admin → Secrets
2. Add missing API keys
3. Redeploy edge function
4. Test again

---

### Scenario 4: Server Crash

**Steps:**
1. Click "Test Edge Function"
2. Get 500 Server Error

**Response:**
```json
{
  "status": "error",
  "error": "Cannot read property 'get' of undefined"
}
```

**What This Means:**
- Code bug in edge function
- Backend threw an exception

**Fix:**
1. Check Supabase edge function logs
2. Fix code issue
3. Redeploy via "Deploy Edge Function"
4. Test again

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch"

**Symptoms:**
- Test button completes
- Shows network error in log
- No HTTP status displayed

**Causes:**
1. Edge function not deployed
2. Network connectivity issue
3. CORS blocking (unlikely with proper setup)
4. Wrong URL (should be hardcoded correctly)

**Solution:**
```
1. Click "Deploy Edge Function"
2. Wait for "Deployment Verified" badge
3. Click "Test Edge Function" again
```

---

### Issue: "401 Unauthorized"

**Symptoms:**
- HTTP Status: 401
- Response: `{ "error": "Unauthorized" }`

**Causes:**
1. JWT token expired
2. JWT token invalid
3. User not authenticated

**Solution:**
```
1. Sign out (menu → Sign Out)
2. Sign back in
3. Test again
```

---

### Issue: "500 Server Error"

**Symptoms:**
- HTTP Status: 500
- Response includes error message

**Causes:**
1. Backend code crashed
2. Database connection failed
3. Environment variable missing
4. Dependency error

**Solution:**
```
1. Open Supabase Dashboard
2. Go to Edge Functions → Logs
3. Find the error in logs
4. Fix the code issue
5. Redeploy via "Deploy Edge Function"
6. Test again
```

---

### Issue: Test succeeds but "Verify Secrets" shows missing

**Symptoms:**
- Test shows 200 Success
- Secrets checklist shows some ❌

**Explanation:**
- Edge function is running
- But some integrations won't work (Gamma, Fathom, etc.)

**Solution:**
```
1. Note which secrets are missing
2. Admin → Secrets tab
3. Add missing API keys
4. No need to redeploy (env vars reload automatically)
5. Test again to confirm
```

---

## 💡 Pro Tips

### 1. Test First, Then Verify
```
✅ Workflow:
1. Test Edge Function (connectivity)
2. Verify Secrets (configuration)
3. Deploy if needed (fixes)
```

### 2. Check HTTP Status First
```
200-299 = ✅ Good
400-499 = ⚠️ Request problem
500-599 = ❌ Server problem
Network = 🔴 Deployment problem
```

### 3. Read the Raw JSON
The raw JSON shows:
- Exact error messages
- Secret status details
- Request ID for tracking
- Timestamps for debugging

### 4. Use Logs for Debugging
The deployment log shows:
- Request payload sent
- Auth token status
- HTTP status code
- Response body
- Success/error analysis

### 5. Compare with Verify
```
Test Edge Function:
- Tests HTTP connectivity
- Shows raw response

Verify Secrets:
- Tests configuration
- Shows secrets checklist

Both complement each other!
```

---

## 📋 Quick Reference

### Button Location
```
Admin → Proposal Agent → Cloud Run Console → Test Edge Function
```

### What It Tests
```
✓ Edge function is deployed
✓ Edge function is responding
✓ Authentication works
✓ Request format is correct
✓ Secrets are loaded (in response)
```

### Status Codes
```
200 = Success ✅
401 = Unauthorized ⚠️
400 = Bad Request ⚠️
500 = Server Error ❌
Network = Not Deployed 🔴
```

### Response Contains
```
• HTTP status code
• Raw JSON response
• Error message (if any)
• Secrets status (if success)
```

---

## 🎯 When to Use

### Use "Test Edge Function" When:
- ✅ First time setting up
- ✅ Edge function might not be deployed
- ✅ Getting unexpected errors
- ✅ Want to see raw HTTP response
- ✅ Debugging network issues
- ✅ Verifying authentication
- ✅ Need proof of connectivity

### Use "Verify Secrets" When:
- ✅ Checking configuration
- ✅ Added new API keys
- ✅ Want secrets checklist
- ✅ Confirming all integrations work
- ✅ Quick validation

### Use "Deploy Edge Function" When:
- ✅ Initial setup
- ✅ Code changes made
- ✅ Test shows network error
- ✅ Server returning 500 errors
- ✅ Need fresh deployment

---

## 🔐 Security Note

The test uses your current **JWT authentication token** from your session. If you see:
```
🔐 Auth token: Present ✓
```

You're authenticated correctly. If you see:
```
🔐 Auth token: Missing ✗
```

You're not logged in properly - sign out and back in.

---

## 📊 Success Criteria

**Successful Test Shows:**
```
✅ HTTP Status: 200
✅ Response has "status": "accepted" or "verified"
✅ No error field in response
✅ secretsStatus present
✅ Toast: "Edge function test passed! (200)"
```

**Failed Test Shows:**
```
❌ HTTP Status: 4xx or 5xx
❌ Response has "error" field
❌ Toast: "Test failed with <status>"
```

**Network Failure Shows:**
```
🔴 No HTTP status displayed
🔴 "Request Failed: Failed to fetch"
🔴 Suggestions to deploy first
```

---

## 🎓 Summary

The "Test Edge Function" button performs a **direct, low-level HTTP test** of the Supabase edge function to verify:
1. **Deployment** - Function is live
2. **Connectivity** - Network can reach it
3. **Authentication** - JWT tokens work
4. **Response** - Function returns valid data

It's the **first diagnostic tool** to use when troubleshooting edge function issues because it shows the **raw HTTP status and JSON** with no abstractions.

---

**Pro Tip:** Run this test first whenever the Proposal Agent isn't working - it will immediately tell you if the problem is deployment, authentication, or server-side.

---

**Last Updated:** 2025-10-16  
**Version:** 1.0  
**Related Docs:**
- CLOUD_FUNCTION_VERIFICATION_GUIDE.md
- CLOUD_RUN_ENHANCED_GUIDE.md
- PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md
