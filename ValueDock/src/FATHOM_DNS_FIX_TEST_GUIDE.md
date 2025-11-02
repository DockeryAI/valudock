# Test Guide: Fathom DNS Fix Verification

## Quick Test (2 minutes)

### Step 1: Navigate to Meeting History
1. Open ValuDock application
2. Go to **Create Presentation** tab
3. Scroll to **Meeting History** section

### Step 2: Test Aggregate Meetings
1. Enter a company domain in the input field
   - Example: `acme.com`
   - Use a domain that has Fathom meetings
2. Click **"Aggregate Meetings"** button

### Expected Results ✅

**BEFORE FIX (Old Behavior):**
```
❌ Error: DNS lookup failed
❌ "error sending request for url (https://us.fathom.video/api/v1/meetings)"
❌ "Name or service not known"
```

**AFTER FIX (New Behavior):**
```
✅ Loading indicator shows
✅ Console log: "[AGGREGATE-MEETINGS] Using VD proxy: [your VD_URL]"
✅ Console log: "[AGGREGATE-MEETINGS] Successfully fetched via VD proxy"
✅ AI summary appears in the text editor
✅ Business Goals section populates
✅ Challenges section populates
```

## Console Log Check

Open browser DevTools Console and look for these logs:

### Success Path (Using Proxy) ✅
```
[AGGREGATE-MEETINGS] Fetching meetings for domain: acme.com
[AGGREGATE-MEETINGS] Fetching from Fathom via proxy...
[AGGREGATE-MEETINGS] Using VD proxy: https://your-vd-instance.supabase.co
[AGGREGATE-MEETINGS] Successfully fetched via VD proxy
[AGGREGATE-MEETINGS] Found X meetings for domain
[AGGREGATE-MEETINGS] Aggregated X transcripts
[AGGREGATE-MEETINGS] Generating AI summary with OpenAI...
[AGGREGATE-MEETINGS] Successfully generated summary
```

### Fallback Path (No Proxy Configured) ℹ️
```
[AGGREGATE-MEETINGS] VD proxy not configured, attempting direct call...
[AGGREGATE-MEETINGS] Note: This may fail due to DNS restrictions
❌ [AGGREGATE-MEETINGS] API integration error: DNS Error...
→ Error message: "DNS Error: Cannot reach Fathom API directly. 
   Please configure VD_URL and VD_SERVICE_ROLE_KEY environment variables."
```

## Environment Variable Verification

### Check Current Values
In your Supabase Edge Function environment, verify:

```bash
# These should already be set (you mentioned they are):
VD_URL=https://[your-production-valuedock].supabase.co
VD_SERVICE_ROLE_KEY=eyJ[your-service-role-key]...
FATHOM_API_KEY=[your-fathom-api-key]
OPENAI_API_KEY=sk-[your-openai-key]
```

### How to Check (if needed)
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Project Settings → Edge Functions**
4. Check **Environment Variables** section
5. Confirm `VD_URL` and `VD_SERVICE_ROLE_KEY` are present

## Test Scenarios

### Scenario 1: Happy Path ✅
- **Setup:** VD proxy configured (already done)
- **Action:** Aggregate meetings for a domain
- **Expected:** Success via proxy, AI summary generated

### Scenario 2: No Meetings Found ℹ️
- **Setup:** Use a domain with no Fathom meetings
- **Action:** Aggregate meetings
- **Expected:** Message "No meetings found for domain: [domain]"

### Scenario 3: Invalid Domain ⚠️
- **Setup:** Use an empty or invalid domain
- **Action:** Aggregate meetings
- **Expected:** Error message "Domain is required"

### Scenario 4: Proxy Not Configured (Hypothetical)
- **Setup:** VD_URL or VD_SERVICE_ROLE_KEY missing
- **Action:** Aggregate meetings
- **Expected:** Helpful error message guiding to configure proxy

## Debug Panel Check

The ValuDock app has a debug console. Check for:

1. **Open Debug Console** (should be visible at bottom of screen)
2. **Look for Fathom-related logs**
3. **Verify proxy URL is being used**

## Network Tab Check (Advanced)

For detailed verification:

1. Open **Browser DevTools → Network Tab**
2. Filter by "fetch" or "XHR"
3. Trigger aggregate meetings
4. Look for requests to:
   - ✅ `${VD_URL}/functions/v1/fathom-proxy` (proxy call)
   - ✅ `https://api.openai.com/v1/chat/completions` (OpenAI call)
5. Check request/response:
   - Request should include `domain` and `fathomApiKey` in body
   - Response should contain array of meetings

## Success Indicators

### Visual Indicators ✅
- [ ] No error messages appear
- [ ] Loading state shows and completes
- [ ] AI summary text appears in editor
- [ ] Business Goals list populates (if meetings have goals)
- [ ] Challenges list populates (if meetings have challenges)
- [ ] Meeting count shows in debug logs

### Technical Indicators ✅
- [ ] Console shows "Using VD proxy" message
- [ ] Console shows "Successfully fetched via VD proxy"
- [ ] Console shows "Successfully generated summary"
- [ ] No DNS or network errors in console
- [ ] Network tab shows successful POST to fathom-proxy endpoint

## Troubleshooting

### If you still see DNS errors:

1. **Check Environment Variables**
   ```bash
   # In Supabase Dashboard → Edge Functions → Environment Variables
   VD_URL=https://[correct-url].supabase.co  # No trailing slash
   VD_SERVICE_ROLE_KEY=[valid-service-role-key]
   ```

2. **Verify Proxy Endpoint Exists**
   - The external Supabase project should have `fathom-proxy` function deployed
   - Test manually: `POST ${VD_URL}/functions/v1/fathom-proxy`

3. **Check Console Logs**
   - Look for "[AGGREGATE-MEETINGS] VD proxy failed" messages
   - These will include specific error details

4. **Test Proxy Independently**
   ```bash
   curl -X POST "${VD_URL}/functions/v1/fathom-proxy" \
     -H "Authorization: Bearer ${VD_SERVICE_ROLE_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"domain":"acme.com","fathomApiKey":"your-key"}'
   ```

### If you see "Proxy connection failed":

This means the VD proxy endpoint is not responding. Check:
- [ ] VD_URL is correct and accessible
- [ ] VD_SERVICE_ROLE_KEY is valid
- [ ] The external Supabase project has `fathom-proxy` function deployed
- [ ] The external project doesn't have the same DNS restrictions

## Expected Timeline

- **Before Fix:** DNS error every time → Feature unusable
- **After Fix:** 2-5 seconds to fetch and aggregate → Feature works perfectly

## Success Criteria ✅

The fix is successful if:
1. ✅ No DNS errors appear
2. ✅ Meetings are fetched via VD proxy
3. ✅ AI summary is generated
4. ✅ Business Goals and Challenges populate
5. ✅ Feature works consistently across multiple tests

---

**Ready to Test!** The fix is deployed and should work immediately since your environment variables are already configured.
