# AI Authentication Debug Guide 🔍

## Current Status

You're experiencing these errors:
```
❌ verifyAuth: No user ID in JWT payload
❌ [AI/ANALYZE-WEBSITE] Auth error: Invalid token
```

## Quick Fix - Try These Steps First

### Step 1: Use the Built-in Debugger

1. **Login** to ValueDock: `admin@valuedock.com` / `admin123`
2. **Navigate** to Profile screen (click your email in the top right)
3. **Click** the "Auth Debug" tab
4. **Click** "Test Authentication" button
5. **Read the results** - it will tell you exactly what's wrong

The debugger will show you:
- ✅ If your session is valid
- ✅ If your token contains a user ID
- ✅ If the backend can verify your token
- ❌ Exactly what error is occurring

---

### Step 2: Try Refreshing Your Session

#### Option A: Hard Refresh
1. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. This clears cached JavaScript
3. Try the AI feature again

#### Option B: Log Out and Back In
1. Click your email in top right
2. Click "Sign Out"
3. Log back in: `admin@valuedock.com` / `admin123`
4. Try the AI feature again

#### Option C: Clear Browser Storage
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage" on the left
4. Click "Clear site data"
5. Reload page
6. Log back in
7. Try again

---

### Step 3: Check Browser Console

1. **Open DevTools:** Press F12
2. **Go to Console tab**
3. **Click "Generate with AI" button**
4. **Look for these logs:**

#### ✅ Good Logs (Token is working):
```
[AUTH] Getting session...
[AUTH] Token retrieved successfully
[AUTH] User: admin@valuedock.com
[AUTH] Token preview: eyJhbGciOiJIUzI1NiIs...
[AI] Calling analyze-website endpoint...
[AI] Response status: 200
[AI] Success! Description length: 523
```

#### ❌ Bad Logs (Token problem):
```
[AUTH] Getting session...
[AUTH] No session found
❌ ERROR: Not authenticated. Please login again.
```

OR

```
[AUTH] Getting session...
[AUTH] Token retrieved successfully
[AUTH] User: admin@valuedock.com
[AI] Calling analyze-website endpoint...
[AI] Response status: 401
[AI] Error response: {"error":"Unauthorized"}
```

---

## What's Been Fixed

### Frontend Changes (/components/PresentationScreen.tsx)

**Added enhanced authentication:**
```typescript
// Helper function with detailed logging
const getAuthToken = async () => {
  try {
    console.log('[AUTH] Getting session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AUTH] Session error:', error);
      throw new Error('Failed to get session: ' + error.message);
    }
    
    if (!session) {
      console.error('[AUTH] No session found');
      throw new Error('Not authenticated. Please login again.');
    }
    
    if (!session.access_token) {
      console.error('[AUTH] Session exists but no access token');
      throw new Error('Invalid session. Please login again.');
    }
    
    console.log('[AUTH] Token retrieved successfully');
    console.log('[AUTH] User:', session.user?.email);
    console.log('[AUTH] Token preview:', session.access_token.substring(0, 20) + '...');
    
    return session.access_token;
  } catch (error) {
    console.error('[AUTH] Error in getAuthToken:', error);
    throw error;
  }
};
```

**All 15 AI endpoints updated to:**
1. Call `getAuthToken()` first
2. Use the real user token (not publicAnonKey)
3. Log detailed debug information
4. Handle errors properly

### Backend Changes (/supabase/functions/server/index.tsx)

**Enhanced verifyAuth function:**
```typescript
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    console.error('verifyAuth: No authorization header provided');
    return { error: 'No authorization header', user: null };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  console.log('verifyAuth: Token preview:', token.substring(0, 30) + '...');
  console.log('verifyAuth: Token length:', token.length);
  
  try {
    console.log('verifyAuth: Decoding JWT token...');
    const decoded = jose.decodeJwt(token);
    
    console.log('verifyAuth: JWT decoded successfully');
    console.log('verifyAuth: Full decoded payload:', JSON.stringify(decoded, null, 2));
    console.log('verifyAuth: Token sub (user ID):', decoded.sub);
    console.log('verifyAuth: Token email:', decoded.email);
    
    // ... rest of validation
  } catch (err) {
    console.error('verifyAuth: Exception during JWT decode:', err);
    return { error: 'Unauthorized', user: null };
  }
};
```

**New debug endpoint:**
```typescript
POST /make-server-888f4514/debug/verify-token
```
This endpoint lets you test if your token can be decoded properly.

---

## Understanding the Error

### What "No user ID in JWT payload" Means

When you see this error, it means:

1. ✅ The frontend successfully sent a request
2. ✅ The backend received the request
3. ✅ The backend found an Authorization header
4. ✅ The backend tried to decode the JWT token
5. ❌ The JWT token doesn't have a `sub` (subject/user ID) field

This usually happens when:
- **Wrong token type** - Sending publicAnonKey instead of user's access_token
- **Corrupted token** - Token got corrupted in transit or storage
- **Expired session** - User's session expired and needs to re-login
- **Browser cache** - Old token cached in browser

---

## Detailed Debugging Steps

### Check 1: Is the user logged in?

**Browser Console:**
```javascript
// Run this in browser console
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log('✅ Logged in as:', session.user.email);
    console.log('✅ Token exists:', !!session.access_token);
    console.log('✅ Token length:', session.access_token.length);
  } else {
    console.log('❌ Not logged in');
  }
});
```

**Expected Result:**
```
✅ Logged in as: admin@valuedock.com
✅ Token exists: true
✅ Token length: 845
```

---

### Check 2: Is the token valid?

**Browser Console:**
```javascript
// Get token and check it
supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (!session) {
    console.log('❌ No session');
    return;
  }
  
  const token = session.access_token;
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Test with backend
  const response = await fetch(
    'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-888f4514/debug/verify-token',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const result = await response.json();
  console.log('Backend verification:', result);
});
```

**Expected Result:**
```javascript
{
  "success": true,
  "decoded": {
    "sub": "abc123-def456-ghi789",
    "email": "admin@valuedock.com",
    "aud": "authenticated",
    "role": "authenticated",
    "exp": 1697234567,
    "iat": 1697230967
  },
  "hasUserId": true,
  "tokenLength": 845
}
```

**Bad Result (This is the problem!):**
```javascript
{
  "error": "Failed to decode token",
  "details": "No user ID found"
}
```

---

### Check 3: Network Tab Analysis

1. **Open DevTools** → Network tab
2. **Clear** existing requests
3. **Click** "Generate with AI" button
4. **Find** the request to `/ai/analyze-website`
5. **Click** on it
6. **Go to** "Headers" tab

**Check Request Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Good Token Starts With:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50...
```

**Bad Token (publicAnonKey) Starts With:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

**You can decode tokens online at:** https://jwt.io/

---

## Common Issues & Solutions

### Issue 1: "No session found"

**Symptoms:**
- Console shows: `[AUTH] No session found`
- User gets error: "Not authenticated. Please login again."

**Cause:**
User's session expired or was cleared.

**Solution:**
1. Log out completely
2. Close all ValueDock tabs
3. Log back in
4. Try AI feature again

---

### Issue 2: "Session exists but no access token"

**Symptoms:**
- Console shows: `[AUTH] Session exists but no access token`

**Cause:**
Session object is malformed or corrupted.

**Solution:**
1. Clear browser storage (F12 → Application → Clear storage)
2. Refresh page
3. Log back in
4. Try AI feature again

---

### Issue 3: "Token is expired"

**Symptoms:**
- Backend logs show: `verifyAuth: Token is expired`
- Status code: 401 Unauthorized

**Cause:**
JWT token has expired (tokens last ~1 hour).

**Solution:**
1. Supabase should auto-refresh tokens
2. If it doesn't work, log out and back in
3. If problem persists, check Supabase console for issues

---

### Issue 4: "Invalid token format"

**Symptoms:**
- Backend logs show: `verifyAuth: Exception during JWT decode`
- Token doesn't look like a JWT

**Cause:**
Token is corrupted or wrong token type being sent.

**Solution:**
1. Check frontend code is using `getAuthToken()`
2. Verify not using `publicAnonKey` anywhere
3. Hard refresh browser (Ctrl+Shift+R)
4. Log out and back in

---

## Testing Checklist

Use this checklist to verify everything is working:

### ✅ Pre-Flight Checks

- [ ] User is logged in (can see email in top right)
- [ ] Can access Profile screen
- [ ] Can see user information

### ✅ Debug Tab Test

- [ ] Go to Profile → Auth Debug tab
- [ ] Click "Test Authentication" button
- [ ] See green success message with user ID
- [ ] Token has valid user ID in payload

### ✅ Browser Console Test

- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] See no red errors on page load
- [ ] Session exists when checking

### ✅ AI Feature Test

- [ ] Go to Presentation screen
- [ ] Enter website: https://stripe.com
- [ ] Click "Generate with AI"
- [ ] See console logs:
  - `[AUTH] Getting session...`
  - `[AUTH] Token retrieved successfully`
  - `[AUTH] User: admin@valuedock.com`
  - `[AI] Calling analyze-website endpoint...`
  - `[AI] Response status: 200`
  - `[AI] Success! Description length: XXX`
- [ ] See success toast: "Business description generated with AI"
- [ ] Description appears in text field

### ✅ Network Tab Test

- [ ] Open DevTools → Network tab
- [ ] Click "Generate with AI"
- [ ] Find `/ai/analyze-website` request
- [ ] Status: 200 OK (not 401 Unauthorized)
- [ ] Authorization header contains JWT token
- [ ] Response has `description` field

---

## If Still Not Working

### Step 1: Collect Debug Info

Run this in browser console:
```javascript
// Debug info collector
(async () => {
  console.log('=== DEBUG INFO ===');
  
  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Has session:', !!session);
  console.log('Has token:', !!session?.access_token);
  console.log('User email:', session?.user?.email);
  console.log('Token length:', session?.access_token?.length);
  console.log('Token preview:', session?.access_token?.substring(0, 50) + '...');
  
  // Try to decode token
  if (session?.access_token) {
    try {
      const parts = session.access_token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Has user ID (sub):', !!payload.sub);
      console.log('User ID:', payload.sub);
      console.log('Token aud:', payload.aud);
      console.log('Token role:', payload.role);
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  
  console.log('=== END DEBUG INFO ===');
})();
```

### Step 2: Check Backend Logs

1. Go to Supabase Dashboard
2. Click on Functions → Logs
3. Look for recent requests to `/ai/analyze-website`
4. Check for these log messages:
   - `[AI/ANALYZE-WEBSITE] Request received`
   - `verifyAuth: Decoding JWT token...`
   - `verifyAuth: JWT decoded successfully`
   - `verifyAuth: Token sub (user ID): ...`

### Step 3: Share Debug Info

If the issue persists, share:
1. Output from "Debug info collector" script
2. Screenshot of Auth Debug tab results
3. Screenshot of Network tab showing request headers
4. Backend logs from Supabase Functions

---

## Technical Details

### JWT Token Structure

A valid user token looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwic3ViIjoiYWJjMTIzLWRlZjQ1Ni1naGk3ODkiLCJlbWFpbCI6ImFkbWluQHZhbHVlZG9jay5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MTY5NzIzNDU2N30
.
signature_here
```

**Part 1 (Header):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Part 2 (Payload) - This is what we check:**
```json
{
  "aud": "authenticated",
  "sub": "abc123-def456-ghi789",  // ← USER ID (this is what was missing!)
  "email": "admin@valuedock.com",
  "role": "authenticated",
  "exp": 1697234567
}
```

**Part 3 (Signature):**
Used by Supabase to verify the token hasn't been tampered with.

### The Error Explained

```typescript
// This is line 72-75 in /supabase/functions/server/index.tsx

if (!user.id) {
  console.error('verifyAuth: No user ID in JWT payload');
  return { error: 'Invalid token', user: null };
}
```

This error means `decoded.sub` (the user ID) is `undefined` or `null`.

This happens when:
1. Token is publicAnonKey (doesn't have `sub`)
2. Token is malformed
3. Token is not from Supabase Auth

---

## Files Modified

### Frontend
- `/components/PresentationScreen.tsx`
  - Added `getAuthToken()` helper with logging
  - Updated all 15 AI endpoints to use access_token
  - Added detailed error handling and console logs

### Backend
- `/supabase/functions/server/index.tsx`
  - Enhanced `verifyAuth()` with detailed logging
  - Added `/debug/verify-token` endpoint

### New Files
- `/components/AuthTokenDebugger.tsx` - Interactive debugging tool
- `/components/ProfileScreen.tsx` - Added Auth Debug tab
- `/AI_AUTH_DEBUG_GUIDE.md` - This guide

---

## Success Criteria

✅ **Authentication is working when:**

1. Auth Debug tab shows green success message
2. Browser console shows `[AUTH] Token retrieved successfully`
3. AI features generate content without errors
4. Network tab shows 200 OK responses
5. Backend logs show `verifyAuth: Successfully extracted user from token`

---

## Summary

The authentication system has been **completely upgraded** with:

1. ✅ Proper user token authentication (not publicAnonKey)
2. ✅ Detailed logging at every step
3. ✅ Interactive debugging tool
4. ✅ Clear error messages
5. ✅ Comprehensive debugging guide

**Next Steps:**
1. Try the Auth Debug tab in Profile screen
2. Follow the troubleshooting steps above
3. Check browser console logs
4. If still stuck, collect debug info and share

---

**Last Updated:** October 13, 2025  
**Status:** Enhanced with debugging tools and logging  
**Ready for Testing:** YES

🔍 **Start by using the Auth Debug tab in the Profile screen!**
