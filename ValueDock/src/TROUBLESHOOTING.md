# Troubleshooting Guide

## 🔐 Authentication Issues (UPDATED)

### "Invalid login credentials" Error

**This is the most common issue on first login.**

**Quick Fix:**
1. On the login screen, click **"Initialize Database & Create Test Accounts"**
2. Wait for green success message
3. Credentials will be auto-filled:
   - Admin: admin@valuedock.com / admin123
   - User: finance@testorganization.com / Test123!
4. Click **Sign In**

**Detailed Guide:** See [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md)

---

## Common Issues and Solutions

### "Cannot read properties of undefined (reading 'startsWith')" Error

This error occurred when fetching users from the KV store and has been fixed by adding proper null checks. The error was caused by:
- Some KV entries not having a `key` property
- Invalid data structures in the KV store

**Fix Applied:**
- Added comprehensive null checks when filtering KV results
- Added validation for key types before calling string methods
- Improved error logging to catch invalid data

If you still see this error, it may indicate corrupted data in the KV store. Try:
1. Check server logs for "Invalid KV entry" warnings
2. Clear and reinitialize the system

### "Missing authorization header" (401 Error)

This error occurs during system initialization and has been fixed by including the Supabase anon key in the initialization request. If you still see this error:

1. Verify your Supabase project is properly connected
2. Check that the anon key is valid in `/utils/supabase/info.tsx`
3. Ensure the Edge Function is deployed and accessible

### "No session returned" Error

This means Supabase Auth succeeded but didn't create a session.

**Solutions:**
1. Check Supabase dashboard → Authentication settings
2. Verify email confirmation is disabled or auto-confirmed
3. Redeploy Edge Function:
   ```bash
   supabase functions deploy server
   ```

### "Failed to fetch profile" Error

This means the Edge Function isn't responding.

**Solutions:**
1. Verify Edge Function is deployed:
   ```bash
   supabase functions list
   ```
2. Test health endpoint:
   ```
   https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/health
   ```
3. Check Edge Function logs:
   ```bash
   supabase functions logs server
   ```

### Initialization Process

The system goes through these steps:

1. **Check if master admin exists** in the key-value store
2. **Verify the user exists** in Supabase Auth
3. **Create the user** if it doesn't exist:
   - Email: admin@dockeryai.com
   - Password: admin123
   - Email is auto-confirmed (no email verification needed)
4. **Store user profile** in the key-value store with master_admin role

### Debug Logs

To troubleshoot, check the browser console for these log messages:

**Successful initialization:**
```
Initializing master admin...
Init response: {success: true, message: "..."}
Master admin ready. Credentials: {...}
```

**Successful sign in:**
```
Attempting sign in with: admin@dockeryai.com
Attempting Supabase auth sign in...
Successfully signed in to Supabase, fetching profile...
Profile fetched successfully: admin@dockeryai.com
```

**Error patterns:**
- "Init response not OK" - Server initialization failed
- "Supabase auth error" - Authentication service error
- "No session returned" - Authentication succeeded but no session created
- "Failed to fetch profile" - User authenticated but profile not found

### Manual Fixes

If initialization continues to fail:

1. **Clear browser cache and local storage**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Verify Supabase connection**
   - Check that SUPABASE_URL is set correctly
   - Verify SUPABASE_SERVICE_ROLE_KEY has admin permissions
   - Ensure SUPABASE_ANON_KEY is valid

3. **Check server logs**
   - Look for errors in the Supabase Edge Function logs
   - Verify the /init endpoint is accessible
   - Check for CORS errors

### Security Notes

⚠️ **IMPORTANT**: After successful login, immediately change the master admin password!

1. Log in with admin@dockeryai.com / admin123
2. Go to Admin tab
3. Update your user profile with a secure password

### Still Having Issues?

If problems persist:

1. Click "Initialize System" multiple times (it's idempotent)
2. Check Network tab in browser DevTools for failed requests
3. Verify all Supabase environment variables are set
4. Try in an incognito/private browser window
5. Check that the Edge Function is deployed and running

### Technical Details

**Initialization Endpoint:**
```
POST https://{projectId}.supabase.co/functions/v1/make-server-888f4514/init
```

**Returns:**
- Success: `{success: true, message: "...", credentials: {...}}`
- Already exists: `{message: "Master admin already exists", credentials: {...}}`
- Error: `{error: "error message"}`

**Login Process:**
1. Supabase Auth validates credentials
2. Returns access token if valid
3. Backend fetches user profile from KV store
4. Creates default profile if none exists
5. Returns session with user profile to frontend