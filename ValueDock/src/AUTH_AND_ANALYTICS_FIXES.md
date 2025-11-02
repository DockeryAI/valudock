# Authentication and Analytics Dashboard Fixes

## Issues Fixed

### 1. **JWT Authentication Verification Errors**

**Problem:**
```
verifyAuth: No user ID in JWT payload
verifyAuth: decoded.sub was: undefined
verifyAuth: typeof decoded.sub: undefined
```

**Root Cause:**
The backend was using `jose.decodeJwt()` to decode JWT tokens without verification. This method doesn't properly handle Supabase's JWT structure, which can lead to missing fields like `sub`.

**Solution:**
Changed the `verifyAuth()` function to use Supabase's own client to verify tokens:

```typescript
// OLD: Manual JWT decoding
const decoded = jose.decodeJwt(token);
const user = {
  id: decoded.sub as string,
  // ...
};

// NEW: Use Supabase client
const supabase = getSupabaseClient(false);
const { data: { user }, error: authError } = await supabase.auth.getUser(token);
```

This ensures proper token validation and extracts user information correctly.

---

### 2. **Analytics Dashboard Unauthorized Error**

**Problem:**
```
Failed to fetch logs: {"error":"Unauthorized"}
```

**Root Cause:**
The `verifyAuth()` function was failing (see issue #1 above), causing all API calls to return 401 Unauthorized.

**Solution:**
Fixed by improving the auth verification method. The analytics endpoints at `/make-server-888f4514/analytics/dashboard` and `/make-server-888f4514/analytics/run-details/:runId` now work correctly.

---

### 3. **OpenAI API Key Not Configured**

**Problem:**
```
[AI] Error response: {"error":"OpenAI API key not configured"}
AI generation error: Error: OpenAI API key not configured
```

**Root Cause:**
The `OPENAI_API_KEY` environment variable might not be properly set in the Supabase Edge Function environment, or wasn't being read correctly.

**Solution:**
Added comprehensive environment variable logging at server startup:

```typescript
console.log('========== EDGE FUNCTION STARTUP ==========');
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? '✓ Set' : '✗ NOT SET');
console.log('SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? '✓ Set' : '✗ NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✓ Set' : '✗ NOT SET');
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? '✓ Set' : '✗ NOT SET');
console.log('FATHOM_API_KEY:', Deno.env.get('FATHOM_API_KEY') ? '✓ Set' : '✗ NOT SET');
console.log('GAMMA_API_KEY:', Deno.env.get('GAMMA_API_KEY') ? '✓ Set' : '✗ NOT SET');
console.log('===========================================');
```

**Action Required:**
Check the Supabase Edge Function logs to see if `OPENAI_API_KEY` shows as "✓ Set" or "✗ NOT SET". If it shows as NOT SET, you need to:

1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add or verify `OPENAI_API_KEY` is set correctly
3. Restart the Edge Function

---

### 4. **Analytics Tab Added to AdminDashboard**

**Problem:**
The Analytics Dashboard component existed but wasn't accessible in the UI.

**Solution:**
Added the Analytics tab to the AdminDashboard:

1. **Added TabsTrigger** (for master_admin only):
```tsx
{hasRole(currentUser, ['master_admin']) && (
  <TabsTrigger value="analytics">
    <BarChart3 className="h-4 w-4" />
    <span>Analytics</span>
  </TabsTrigger>
)}
```

2. **Added TabsContent**:
```tsx
{hasRole(currentUser, ['master_admin']) && (
  <TabsContent value="analytics">
    <AnalyticsDashboard userRole={currentUser.role} />
  </TabsContent>
)}
```

3. **Updated TabsList grid calculation** to include the Analytics tab count.

---

## Testing Instructions

### 1. Test Authentication
1. Sign in to ValuDock
2. Navigate to any screen that calls the backend (e.g., Admin → Users)
3. Check browser console - should NOT see "Unauthorized" errors
4. Check Supabase Edge Function logs - should see successful auth verification

### 2. Test Analytics Dashboard
**Prerequisite:** Must be logged in as `master_admin`

1. Go to Admin Dashboard
2. Click on "Analytics" tab (should be visible between "Agent" and "API/Webhooks")
3. You should see:
   - KPI cards (Runs Today, Success Rate, Avg Duration, Total Cost)
   - Trend charts (Runs per Day, Cost per Day, Duration per Day)
   - Phase breakdown charts (Cost by Phase, Tokens by Phase)
   - Success/Fail pie chart
   - Recent Runs table
   - (Optional) Current run progress if a run is in progress

### 3. Test OpenAI API Key
1. Check Supabase Edge Function logs for startup messages
2. Look for the line: `OPENAI_API_KEY: ✓ Set` or `✗ NOT SET`
3. If NOT SET:
   - Go to Supabase Dashboard → Edge Functions → Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key (starts with `sk-`)
   - Redeploy the Edge Function
   - Check logs again

### 4. Test AI Features
Once OPENAI_API_KEY is confirmed set:

1. Go to Presentation screen
2. Try using AI generation features:
   - Business Description generator
   - Solution Summary generator
3. Should work without "OpenAI API key not configured" errors

---

## Files Modified

### Backend
- `/supabase/functions/server/index.tsx`
  - Improved `verifyAuth()` function
  - Added environment variable logging at startup

### Frontend
- `/components/AdminDashboard.tsx`
  - Added Analytics tab to TabsList
  - Added Analytics TabsContent
  - Updated tab count calculation
  - (Import for AnalyticsDashboard was already present)

---

## Important Notes

### Analytics Data
The analytics endpoints currently return **mock data** for demonstration purposes. The actual implementation would need to:

1. Store run logs in the KV store or database
2. Aggregate cost/token data from actual runs
3. Track real-time execution status

The mock data provides a realistic preview of what the analytics dashboard will show once integrated with actual proposal agent runs.

### Master Admin Only
The Analytics tab is **only visible to global administrators** (master_admin role). This is by design as it shows system-wide metrics across all tenants and organizations.

### Environment Variables
All required environment variables are already listed in the user's secrets. Make sure they're also set in the Supabase Edge Function environment:
- ✅ OPENAI_API_KEY
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ FATHOM_API_KEY
- ✅ GAMMA_API_KEY

---

## Next Steps

1. **Verify Environment Variables:** Check Edge Function logs to ensure all required env vars are set
2. **Test Authentication:** Ensure no more "Unauthorized" errors
3. **Test Analytics Access:** Verify global admin can see Analytics tab
4. **Integrate Real Data:** Connect analytics endpoints to actual run logs and cost tracking

---

## Debugging Tips

### If Authentication Still Fails
1. Check browser Network tab for failed requests
2. Look at the Authorization header - should be `Bearer eyJ...`
3. Check Edge Function logs for detailed error messages
4. Verify user has a valid session in Supabase Auth

### If Analytics Shows Unauthorized
1. Confirm logged in user has `master_admin` role
2. Check that role is correctly set in KV store: `user:{userId}`
3. Verify the user profile is being fetched correctly

### If OpenAI Key Still Not Working
1. Verify the key is valid (test it with a curl request to OpenAI API)
2. Ensure it starts with `sk-`
3. Check for any whitespace or special characters in the env var
4. Restart the Edge Function after setting the env var

---

## Related Documentation
- `ANALYTICS_DASHBOARD_IMPLEMENTATION.md` (to be created)
- `AUTH_SETUP.md`
- `OPENAI_INTEGRATION_GUIDE.md`
