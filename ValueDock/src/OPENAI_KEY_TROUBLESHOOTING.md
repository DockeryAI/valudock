# OpenAI API Key Troubleshooting Guide

**Issue:** Getting "OpenAI API key not configured" errors despite uploading the key via `create_supabase_secret`.

---

## 🔍 Root Cause

When you upload a secret via the Figma Make interface using `create_supabase_secret`, the secret is stored in Supabase, but **the Edge Function does not automatically pick up the new environment variable**. The function needs to be redeployed to access updated secrets.

---

## ✅ Solution: Redeploy the Edge Function

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Navigate to your project: `hpnxaentcrlditokrpyo`

2. **Navigate to Edge Functions**
   - Left sidebar → "Edge Functions"
   - Find function: `make-server-888f4514` or `server`

3. **Redeploy the Function**
   - Click on the function
   - Click "Deploy" or "Redeploy" button
   - Wait for deployment to complete (usually 10-30 seconds)

4. **Verify Deployment**
   - Check deployment status shows "Success"
   - Look for latest deployment timestamp

### Option 2: Via Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref hpnxaentcrlditokrpyo

# Redeploy the function
supabase functions deploy make-server-888f4514
# OR
supabase functions deploy server
```

---

## 🧪 Verify the Fix

### Test 1: Check Environment Status (No Auth Required)

```bash
curl -s "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/ping" | jq
```

**Expected Output:**
```json
{
  "ok": true,
  "message": "ValuDock Edge Function is running",
  "timestamp": "2025-10-17T...",
  "environment": {
    "openai": "✓",     // ← Should show ✓ after redeployment
    "fathom": "✓",
    "gamma": "✓"
  }
}
```

### Test 2: Use Backend Connection Verifier

1. Sign in to ValuDock
2. Go to **Admin** tab
3. Click **API / Webhooks** sub-tab
4. Click **Run Tests** button
5. Check results for AI endpoints:
   - "AI Generate" should show ✅ Success
   - "AI Analyze Website" should show ✅ Success
   - "Proposal Agent Run" should show ✅ Success

### Test 3: Test AI Generation Directly

```bash
# Replace YOUR_ACCESS_TOKEN with your actual token
curl -s -X POST "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/ai/generate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","maxTokens":10}' | jq
```

**Expected Output (After Fix):**
```json
{
  "ok": true,
  "generated_text": "...",
  "tokens_used": 10
}
```

**Before Fix (Error):**
```json
{
  "ok": false,
  "error": "OPENAI_API_KEY not configured in Edge Function environment",
  "message": "Please configure the OPENAI_API_KEY secret and redeploy the Edge Function"
}
```

---

## 🔧 Additional Checks

### Verify Secret Exists in Supabase

1. **Via Dashboard:**
   - Settings → Edge Functions → Secrets
   - Look for `OPENAI_API_KEY` in the list
   - Should show as "Set" or masked value

2. **Via CLI:**
   ```bash
   supabase secrets list
   ```
   
   Expected output should include:
   ```
   OPENAI_API_KEY
   FATHOM_API_KEY
   GAMMA_API_KEY
   ```

### Check Edge Function Logs

1. **Via Dashboard:**
   - Edge Functions → `make-server-888f4514` → Logs
   - Look for startup message:
     ```
     ========== EDGE FUNCTION STARTUP ==========
     OPENAI_API_KEY: ✓ Set
     FATHOM_API_KEY: ✓ Set
     GAMMA_API_KEY: ✓ Set
     ===========================================
     ```

2. **Via CLI:**
   ```bash
   supabase functions logs make-server-888f4514 --follow
   ```

---

## 📋 Complete Step-by-Step Fix

1. **Verify secret is uploaded**
   ```bash
   supabase secrets list
   ```
   
2. **If OPENAI_API_KEY is missing, set it:**
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Redeploy the function:**
   ```bash
   supabase functions deploy make-server-888f4514
   ```

4. **Wait for deployment (10-30 seconds)**

5. **Test the ping endpoint:**
   ```bash
   curl -s "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/ping" | jq
   ```

6. **Verify `"openai": "✓"` in response**

7. **Test AI generation in the app**

---

## 🚨 If Still Not Working

### Check 1: Correct Project

Make sure you're deploying to the correct Supabase project:

```bash
supabase projects list
```

Look for project ref: `hpnxaentcrlditokrpyo`

### Check 2: Correct Function Name

List all functions:

```bash
supabase functions list
```

Common function names:
- `make-server-888f4514`
- `server`

### Check 3: Secret Format

Ensure the OpenAI API key:
- Starts with `sk-`
- Has no extra spaces or quotes
- Is a valid, active key

Test the key directly:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key-here"
```

### Check 4: Code is Reading the Variable Correctly

In `/supabase/functions/server/index.tsx`, line ~16:

```typescript
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? '✓ Set' : '✗ NOT SET');
```

This should log on function startup. Check the logs!

---

## 🎯 Quick Test Commands

```bash
# 1. Check secrets
supabase secrets list

# 2. Set OPENAI key (if missing)
supabase secrets set OPENAI_API_KEY=sk-your-key

# 3. Redeploy
supabase functions deploy make-server-888f4514

# 4. Test ping
curl -s "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/ping" | jq '.environment'

# 5. Check logs
supabase functions logs make-server-888f4514 --tail 20
```

---

## 📞 Need Help?

If you're still experiencing issues after redeployment:

1. **Check Edge Function logs** for detailed error messages
2. **Verify the function deployed successfully** (no build errors)
3. **Confirm you're testing the right endpoint** (correct project ID)
4. **Try a hard refresh** of the ValuDock app (Ctrl+Shift+R)

---

**Last Updated:** October 17, 2025  
**Next Step:** After redeployment, use the Backend Connection Verifier in Admin → API/Webhooks to verify all endpoints.
