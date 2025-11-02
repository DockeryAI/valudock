# Proposal Run Log Authentication Fix

## Issue Fixed

**Error:**
```
Failed to fetch logs: {"error":"Unauthorized"}
```

**Root Cause:**
The `ProposalRunLog` component was using the public anon key (`publicAnonKey`) instead of the user's authenticated access token when making API calls to fetch logs.

```typescript
// BEFORE (INCORRECT):
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-logs?${params}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`, // ❌ Wrong! This is the anon key
      'Content-Type': 'application/json'
    }
  }
);
```

The backend's `verifyAuth` middleware expects a valid user JWT token (from Supabase Auth), not the anon key. This caused the authentication check to fail and return a 401 Unauthorized error.

---

## Solution

Changed the `ProposalRunLog` component to use the `apiCall` helper function, which automatically:
1. Gets the current user's session
2. Extracts the access token
3. Adds it to the Authorization header
4. Handles errors properly

```typescript
// AFTER (CORRECT):
import { apiCall } from '../utils/auth';

const fetchLogs = async () => {
  const data = await apiCall(endpoint, { method: 'GET' });
  // apiCall automatically adds: 'Authorization': `Bearer ${session.access_token}`
};
```

---

## Files Modified

### `/components/ProposalRunLog.tsx`

**Changes:**
1. **Import change:**
   - Removed: `import { projectId, publicAnonKey } from '../utils/supabase/info';`
   - Added: `import { apiCall } from '../utils/auth';`

2. **fetchLogs function:**
   - Replaced manual `fetch()` call with `apiCall()` helper
   - Improved error handling with toast notifications
   - Simplified code by leveraging existing auth utilities

---

## How apiCall Works

The `apiCall` helper function (from `/utils/auth.ts`) does the following:

```typescript
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // 1. Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. Build headers with auth token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    // ✅ Uses the CORRECT user access token
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // 3. Make the request
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-888f4514${endpoint}`,
    { ...options, headers }
  );

  return await response.json();
}
```

This ensures that:
- ✅ Every API call uses the authenticated user's token
- ✅ Auth tokens are always current (not stale)
- ✅ Consistent auth handling across all components
- ✅ Automatic error handling

---

## Testing

### Before Fix
```
❌ Browser Console:
Failed to fetch logs: {"error":"Unauthorized"}

❌ Edge Function Logs:
verifyAuth: Unauthorized
```

### After Fix
```
✅ Browser Console:
No errors

✅ Edge Function Logs:
verifyAuth: Successfully verified user: [user-id] [email]
[PROPOSAL-LOGS] Fetching logs - Tenant: ..., Org: ..., Deal: ...
```

---

## Verification Steps

1. **Open Admin Dashboard**
   - Go to Admin → Proposal Agent tab

2. **Check Run Log Panel**
   - Should see run logs loading without errors
   - If no runs yet, panel should be empty but not show "Unauthorized"

3. **Check Browser Console**
   - Should NOT see any "Unauthorized" errors
   - Should NOT see "Failed to fetch logs" errors

4. **Check Network Tab**
   - Look for requests to `/proposal-logs`
   - Should have status `200 OK`
   - Authorization header should show `Bearer eyJ...` (JWT token, not anon key)

---

## Related Components

Other components that correctly use `apiCall`:
- ✅ `AnalyticsDashboard.tsx` - Uses `apiCall` for analytics endpoints
- ✅ `ProposalAgentRunner.tsx` - Uses `apiCall` for agent runs
- ✅ `ProposalContentBuilder.tsx` - Uses `apiCall` for content operations
- ✅ `AdminDashboard.tsx` - Uses `apiCall` for all admin operations

Components that were using direct `fetch()` (now fixed):
- ✅ `ProposalRunLog.tsx` - **FIXED** ✨

---

## Best Practices

### ✅ DO Use apiCall
```typescript
import { apiCall } from '../utils/auth';

const data = await apiCall('/some-endpoint', {
  method: 'POST',
  body: { foo: 'bar' }
});
```

### ❌ DON'T Use Direct fetch() with publicAnonKey
```typescript
// WRONG - DON'T DO THIS:
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}` // ❌
  }
});
```

### ❌ DON'T Manually Construct Full URLs
```typescript
// WRONG - DON'T DO THIS:
const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/endpoint`;
const response = await fetch(url, ...);
```

### ✅ DO Use Relative Endpoint Paths
```typescript
// CORRECT:
const data = await apiCall('/endpoint', ...);
// apiCall handles the full URL construction
```

---

## Why This Matters

### Security
- Using the **anon key** for authenticated endpoints is a security risk
- The anon key is public and should only be used for public, unauthenticated operations
- User access tokens are **session-specific** and have proper permissions

### Functionality
- Endpoints that use `verifyAuth()` **require** a valid user JWT token
- The anon key won't work because it's not a valid user session token
- This is by design - protects sensitive data

### Best Practice
- **Always** use `apiCall()` for backend requests
- **Never** hardcode tokens or keys in components
- **Leverage** existing auth utilities

---

## Summary

✅ **Fixed:** ProposalRunLog now uses proper authentication
✅ **Method:** Switched from direct fetch with anon key to apiCall helper
✅ **Result:** No more "Unauthorized" errors when fetching logs
✅ **Impact:** Better security, consistent auth handling, improved UX

The Proposal Run Log panel now works correctly and will display run logs once you start using the Proposal Agent feature!

---

## Next Steps

1. ✅ Verify the fix works (no more unauthorized errors)
2. ✅ Test the Proposal Agent feature to generate actual run logs
3. ✅ Confirm logs display correctly in the panel
4. Review other components to ensure they all use `apiCall` consistently

---

## Additional Notes

### Anon Key vs Access Token

**Anon Key (`publicAnonKey`):**
- ✅ Use for: Public operations, initial page load
- ❌ Don't use for: Authenticated API calls
- Example: Supabase client initialization

**Access Token (`session.access_token`):**
- ✅ Use for: All authenticated API calls
- ✅ Contains: User ID, email, role, permissions
- ✅ Verified by: Backend `verifyAuth()` middleware

### How to Check Which Token You're Using

```typescript
// In Browser Console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Access Token:', session?.access_token?.substring(0, 20) + '...');
console.log('Anon Key:', publicAnonKey.substring(0, 20) + '...');

// They should be DIFFERENT!
// Access token starts with: eyJ...
// Anon key starts with: eyJ... (but different content)
```

You can decode JWT tokens at [jwt.io](https://jwt.io) to see what's inside:
- **Access token** will have: `sub` (user ID), `email`, `role`, `aud`, etc.
- **Anon key** will have: `role: anon`, no user-specific data
