# Quick Fix Verification Guide

## ✅ What Was Fixed

1. **JWT Authentication** - Now uses Supabase client for proper token verification
2. **Analytics Dashboard** - Added as a tab in Admin Dashboard (master_admin only)
3. **Environment Variable Logging** - Shows which API keys are set at Edge Function startup
4. **Auth Error Handling** - Better error messages and logging

---

## 🔍 Quick Checks

### 1. Check Edge Function Logs (CRITICAL)

Open Supabase Dashboard → Edge Functions → Logs and look for:

```
========== EDGE FUNCTION STARTUP ==========
SUPABASE_URL: ✓ Set
SUPABASE_ANON_KEY: ✓ Set
SUPABASE_SERVICE_ROLE_KEY: ✓ Set
OPENAI_API_KEY: ✓ Set     ← Should be ✓, not ✗
FATHOM_API_KEY: ✓ Set
GAMMA_API_KEY: ✓ Set
===========================================
```

**If OPENAI_API_KEY shows ✗ NOT SET:**
1. Go to Supabase Dashboard → Edge Functions → Environment Variables
2. Add `OPENAI_API_KEY` = `sk-...your-key...`
3. Redeploy the function
4. Check logs again

---

### 2. Test Authentication

**Before Fix:** Would see errors like:
```
verifyAuth: No user ID in JWT payload
verifyAuth: decoded.sub was: undefined
```

**After Fix:** Should see:
```
verifyAuth: Successfully verified user: [user-id] [email]
```

**To Test:**
1. Sign in to ValuDock
2. Open browser DevTools → Console
3. Navigate to Admin Dashboard
4. Should NOT see "Unauthorized" errors

---

### 3. Test Analytics Tab

**As master_admin:**
1. Go to Admin Dashboard
2. You should see tabs in this order:
   - Users
   - Tenants
   - Orgs
   - Costs
   - Agent
   - **Analytics** ← NEW!
   - API / Webhooks
   - Docs

3. Click "Analytics" tab
4. Should see:
   - KPI cards with metrics
   - Charts showing trends
   - Recent runs table
   - No "Unauthorized" error

**As non-master_admin (tenant_admin, org_admin, user):**
- Analytics tab should NOT be visible

---

### 4. Test AI Features

**Before Fix:** Would see:
```
Error: OpenAI API key not configured
```

**After Fix:** Should work without errors

**To Test:**
1. Go to Presentation screen
2. Try generating AI content (business description, solution summary)
3. Should see loading spinner, then generated content
4. Check browser console - should NOT see API key errors

---

## 🚨 If Still Seeing Errors

### "Unauthorized" Errors

**Check:**
1. User has valid session (try signing out and back in)
2. Edge Function is running (check Supabase dashboard)
3. Browser console for actual error messages

**Fix:**
- Clear browser cache and cookies
- Try incognito/private browsing window
- Check Edge Function logs for details

---

### "OpenAI API key not configured"

**Check:**
1. Edge Function startup logs (see above)
2. Environment variable is actually set in Supabase
3. Key is valid (starts with `sk-`)

**Fix:**
1. Supabase Dashboard → Edge Functions → Environment Variables
2. Add/update `OPENAI_API_KEY`
3. Redeploy function
4. Wait 30 seconds
5. Refresh ValuDock page

---

### Analytics Tab Not Showing

**Check:**
1. Current user role: `currentUser.role === 'master_admin'`
2. Browser console for React errors

**Fix:**
- Only master_admin can see Analytics tab
- Verify user role in Admin → Users
- If role is wrong, update in backend KV store

---

## 📊 Expected Analytics Data

Currently showing **mock data** for demonstration:

- **KPIs:** Random but realistic numbers
- **Charts:** Generated time-series data
- **Recent Runs:** 10 fake runs with realistic timestamps
- **Status:** Success/Failed ratio ~94% success rate

This is intentional! Real data will come from actual proposal agent runs once that feature is used.

---

## 🎯 Success Criteria

✅ **Authentication Working** if:
- No "Unauthorized" errors in console
- Can access all admin features
- Edge Function logs show successful verification

✅ **Analytics Working** if:
- Tab visible to master_admin
- Dashboard loads without errors
- Mock data displays correctly
- Charts render properly

✅ **OpenAI Working** if:
- Startup logs show "✓ Set" for OPENAI_API_KEY
- AI generation features work
- No API key errors in console

---

## 📝 Quick Test Script

Run this in browser console to check current state:

```javascript
// Check if user is authenticated
const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session:', session ? '✓ Active' : '✗ None');
  console.log('User ID:', session?.user?.id);
  console.log('Email:', session?.user?.email);
};

// Check if analytics endpoint works
const checkAnalytics = async () => {
  try {
    const response = await fetch(
      'https://[project-id].supabase.co/functions/v1/make-server-888f4514/analytics/dashboard?days=30',
      {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`
        }
      }
    );
    const data = await response.json();
    console.log('Analytics API:', response.ok ? '✓ Working' : '✗ Failed');
    console.log('Response:', data);
  } catch (err) {
    console.error('Analytics API Error:', err);
  }
};

await checkAuth();
await checkAnalytics();
```

---

## 🔗 Related Docs

- `AUTH_AND_ANALYTICS_FIXES.md` - Full technical details
- `AUTH_SETUP.md` - Authentication system overview
- `OPENAI_INTEGRATION_GUIDE.md` - AI features setup
- `ADMIN_COMPLETE_GUIDE.md` - Admin dashboard guide
