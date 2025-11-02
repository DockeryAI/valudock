# Cloud Function Verification Feature - Complete Guide

## 🎯 Overview

The Cloud Function Verification feature allows admins to quickly test the Proposal Agent edge function and validate that all required API secrets are properly configured.

### Key Features
- **One-Click Verification** - Test edge function connectivity with a single button
- **Secrets Checklist** - Visual status for all 5 required API keys
- **Connection Badge** - Green "Connected" or Red "Not Connected" status
- **Missing Secrets Warning** - Yellow badge with quick link to Admin → Secrets
- **Detailed Logging** - Full request/response JSON for debugging

---

## 📋 Secrets Checklist

The verification checks these 5 critical API secrets:

| Secret | Purpose | Required For |
|--------|---------|--------------|
| **OpenAI** | GPT-4 API access | AI proposal generation |
| **Supabase URL (ValueDock)** | Database connection | Data persistence |
| **Supabase Service Role (ValueDock)** | Admin database access | Secure operations |
| **Gamma** | Presentation creation | Gamma.app integration |
| **Fathom** | Meeting transcript access | Fathom API calls |

---

## 🚀 Quick Start

### Step 1: Access Cloud Run Console

1. Navigate to **Admin → Proposal Agent**
2. Toggle **"Run in Cloud"** to ON
3. Click **"Cloud Run Console"** header to expand

### Step 2: Verify Connection

1. Click **"Verify Cloud Function"** button
2. Wait 2-3 seconds for verification
3. Check results:
   - **Green "Connected" badge** = All good!
   - **Red "Not Connected" badge** = Edge function issue

### Step 3: Check Secrets Status

After verification, you'll see:
- ✅ Green checkmarks for loaded secrets
- ❌ Red X marks for missing secrets
- 🟡 Yellow "Missing Secrets" badge if any are missing

### Step 4: Fix Missing Secrets (if needed)

1. Click **"Fix in Admin"** button
2. Navigate to Admin → Secrets tab
3. Add missing API keys
4. Return and click **"Verify Cloud Function"** again

---

## 📊 Visual Guide

### Verification Button

```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Cloud Run Console                             ⌄          │
│ Deploy and test the Edge Function                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐  ┌─────────────────────────┐  │
│ │ ✓ Verify Cloud Function │  │ 🔧 Deploy Edge Function │  │
│ └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Connection Status - Success

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Edge Function: Connected              [Connected ✓]     │
└─────────────────────────────────────────────────────────────┘
```

### Connection Status - Failure

```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Edge Function: Not Connected          [Not Connected]   │
└─────────────────────────────────────────────────────────────┘
```

### Secrets Checklist - All Loaded

```
┌─────────────────────────────────────────────────────────────┐
│ Secrets Loaded                                              │
├─────────────────────────────────────────────────────────────┤
│ OpenAI                                                  ✅  │
│ Supabase URL (ValueDock)                                ✅  │
│ Supabase Service Role (ValueDock)                       ✅  │
│ Gamma                                                   ✅  │
│ Fathom                                                  ✅  │
└─────────────────────────────────────────────────────────────┘
```

### Secrets Checklist - Some Missing

```
┌─────────────────────────────────────────────────────────────┐
│ Secrets Loaded                      [⚠ Fix in Admin]       │
├─────────────────────────────────────────────────────────────┤
│ OpenAI                                                  ✅  │
│ Supabase URL (ValueDock)                                ✅  │
│ Supabase Service Role (ValueDock)                       ✅  │
│ Gamma                                                   ❌  │
│ Fathom                                                  ❌  │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Some secrets are missing          [Missing Secrets]     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 How It Works

### Backend Verification Flow

```
1. User clicks "Verify Cloud Function"
   ↓
2. Frontend sends POST to /proposal-agent-run
   with deal_id: "TEST-VERIFY-<timestamp>"
   ↓
3. Backend detects TEST-VERIFY prefix
   ↓
4. Backend checks all environment variables:
   - OPENAI_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - GAMMA_API_KEY
   - FATHOM_API_KEY
   ↓
5. Backend returns JSON with:
   - status: "verified"
   - edgeFunctionStatus: "connected"
   - secretsStatus: { openai: true, ... }
   - allSecretsLoaded: true/false
   - message: "✅ All secrets loaded successfully"
   ↓
6. Frontend displays results:
   - Connection badge
   - Secrets checklist
   - Warning if any missing
```

### Special Handling

**TEST-VERIFY Prefix:**
- Any `deal_id` starting with `TEST-VERIFY-` triggers verification mode
- No actual proposal generation occurs
- Quick response (< 1 second)
- Safe to run anytime

---

## 📡 API Contract

### Request

**Endpoint:** `POST /make-server-888f4514/proposal-agent-run`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "tenant_id": "uuid-or-test",
  "org_id": "uuid-or-test",
  "deal_id": "TEST-VERIFY-1729123456789",
  "customer_url": "https://example.com",
  "fathom_window": {
    "start": "2025-09-16",
    "end": "2025-10-16"
  }
}
```

### Response - Success (All Secrets)

```json
{
  "status": "verified",
  "request_id": "verification-1729123456789",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "✅ All secrets loaded successfully",
  "secretsStatus": {
    "openai": true,
    "supabaseUrl": true,
    "supabaseServiceRole": true,
    "gamma": true,
    "fathom": true
  },
  "allSecretsLoaded": true,
  "edgeFunctionStatus": "connected",
  "data": {
    "tenant_id": "uuid-or-test",
    "org_id": "uuid-or-test",
    "deal_id": "TEST-VERIFY-1729123456789",
    "customer_url": "https://example.com",
    "fathom_window": {
      "start": "2025-09-16",
      "end": "2025-10-16"
    }
  }
}
```

### Response - Success (Some Missing)

```json
{
  "status": "verified",
  "request_id": "verification-1729123456789",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "⚠️ Some secrets are missing",
  "secretsStatus": {
    "openai": true,
    "supabaseUrl": true,
    "supabaseServiceRole": true,
    "gamma": false,
    "fathom": false
  },
  "allSecretsLoaded": false,
  "edgeFunctionStatus": "connected",
  "data": { ... }
}
```

### Response - Error

```json
{
  "error": "Unauthorized",
  "status": 401
}
```

---

## 🎨 UI Components

### Connection Status Alert

**Connected (Green):**
```tsx
<Alert className="border-green-500 bg-green-50">
  <CheckCircle2 className="h-4 w-4 text-green-600" />
  <span>Edge Function: Connected</span>
  <Badge className="bg-green-500">Connected</Badge>
</Alert>
```

**Not Connected (Red):**
```tsx
<Alert className="border-red-500 bg-red-50">
  <XCircle className="h-4 w-4 text-red-600" />
  <span>Edge Function: Not Connected</span>
  <Badge variant="destructive">Not Connected</Badge>
</Alert>
```

### Secrets Checklist Item

**Loaded (Green):**
```tsx
<div className="flex items-center justify-between">
  <span>OpenAI</span>
  <CheckCircle2 className="h-4 w-4 text-green-600" />
</div>
```

**Missing (Red):**
```tsx
<div className="flex items-center justify-between">
  <span>OpenAI</span>
  <XCircle className="h-4 w-4 text-red-600" />
</div>
```

### Missing Secrets Warning

```tsx
<Alert className="border-yellow-500 bg-yellow-50">
  <AlertCircle className="h-4 w-4 text-yellow-600" />
  <span>Some secrets are missing</span>
  <Badge className="border-yellow-500">Missing Secrets</Badge>
</Alert>
```

---

## 🧪 Testing Checklist

### Test 1: All Secrets Configured

**Setup:**
- Ensure all 5 secrets are set in environment

**Steps:**
1. Click "Verify Cloud Function"
2. Wait for response

**Expected:**
- ✅ Green "Connected" badge
- ✅ All 5 checkmarks green
- ✅ No warning badge
- ✅ Toast: "Edge Function connected - all secrets loaded!"

---

### Test 2: Some Secrets Missing

**Setup:**
- Remove Gamma and Fathom secrets

**Steps:**
1. Click "Verify Cloud Function"
2. Wait for response

**Expected:**
- ✅ Green "Connected" badge (edge function still works)
- ✅ OpenAI, Supabase URL, Supabase Service Role green
- ❌ Gamma and Fathom red
- 🟡 Yellow "Missing Secrets" badge
- ⚠️ Toast: "Edge Function connected but some secrets are missing"
- ✅ "Fix in Admin" button visible

---

### Test 3: Edge Function Not Responding

**Setup:**
- Edge function not deployed or crashed

**Steps:**
1. Click "Verify Cloud Function"
2. Wait for timeout/error

**Expected:**
- ❌ Red "Not Connected" badge
- ❌ Error in deployment log
- 🔴 Toast: "Verification error: <message>"

---

### Test 4: Fix Missing Secrets

**Setup:**
- Start with missing secrets

**Steps:**
1. Verify (see missing secrets)
2. Click "Fix in Admin"
3. Navigate to Admin → Secrets
4. Add missing keys
5. Return to Proposal Agent
6. Click "Verify Cloud Function" again

**Expected:**
- ✅ All checkmarks now green
- ✅ Yellow badge disappears
- ✅ Toast: "Edge Function connected - all secrets loaded!"

---

## 🔐 Security Considerations

### What's Safe
- ✅ Checking if secrets exist (boolean)
- ✅ Displaying secret names
- ✅ Verification requests with test data

### What's Protected
- ❌ Never returns actual secret values
- ❌ Never logs secret values
- ❌ Backend checks `!!secretValue` not the value itself
- ❌ Frontend only receives true/false status

### Authentication
- All verification requests require valid JWT
- User must be authenticated admin
- Unauthorized requests return 401

---

## 🐛 Troubleshooting

### Issue: "Edge Function: Not Connected"

**Possible Causes:**
1. Edge function not deployed
2. Network/CORS issue
3. Backend server down
4. Invalid endpoint URL

**Solutions:**
1. Click "Deploy Edge Function" first
2. Check browser console for errors
3. Verify SUPABASE_URL is correct
4. Try again in 30 seconds

---

### Issue: All Secrets Show Red X

**Possible Causes:**
1. Environment variables not set
2. Wrong environment (dev vs prod)
3. Deployment not picked up new secrets

**Solutions:**
1. Navigate to Admin → Secrets
2. Add all required API keys
3. Redeploy edge function
4. Restart backend server (if local)

---

### Issue: "Fix in Admin" Button Does Nothing

**Explanation:**
- Button shows a toast notification
- You must manually navigate to Admin tab
- This is intentional (no auto-navigation)

**Solution:**
1. Note which secrets are missing
2. Click main menu → Admin
3. Go to Secrets tab
4. Add missing keys
5. Return to Proposal Agent tab

---

## 💡 Pro Tips

### 1. Verify Before First Run
Always click "Verify Cloud Function" before running a proposal agent:
- Saves time catching config issues
- Prevents failed runs due to missing secrets
- Gives confidence everything is set up

### 2. Check After Secret Changes
Anytime you add/update secrets:
- Redeploy edge function
- Click "Verify Cloud Function"
- Confirm all checkmarks are green

### 3. Use Verification in Onboarding
When setting up a new tenant/org:
1. Add secrets
2. Verify immediately
3. Document which secrets are configured
4. Share status with team

### 4. Monitor for Degradation
Periodically verify (weekly):
- Secrets may expire
- API keys may be revoked
- Catch issues before users report them

---

## 📚 Related Documentation

- **CLOUD_RUN_ENHANCED_GUIDE.md** - Cloud Run features
- **CLOUD_RUN_ENHANCED_QUICK_START.md** - Getting started
- **PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md** - Full runner docs
- **Admin Secrets Guide** - (TBD) How to manage API keys

---

## 🎯 Summary

### What You Get
- ✅ **Quick verification** of edge function connectivity
- ✅ **Visual checklist** of all 5 required secrets
- ✅ **Connection badge** for at-a-glance status
- ✅ **Missing secrets warning** with admin link
- ✅ **Detailed logging** for debugging

### When to Use
- 🔧 Initial setup and configuration
- 🔑 After adding/updating API keys
- 🐛 Debugging proposal agent issues
- 📋 Onboarding new tenants/orgs
- 🔍 Periodic health checks

### How It Helps
- ⚡ **Faster troubleshooting** - Know which secrets are missing
- 💡 **Clearer errors** - Understand why agent isn't working
- 🎯 **Guided fixes** - "Fix in Admin" button points to solution
- 🔐 **Security** - Never exposes actual secret values
- 📊 **Transparency** - Full request/response in logs

---

**Version:** 1.0  
**Last Updated:** 2025-10-16  
**Status:** ✅ Complete and Ready
