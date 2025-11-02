# Authentication Troubleshooting Guide

**For fixing "Invalid login credentials" and other auth errors**

---

## Quick Fix: Initialize Database

### Option 1: Use the Login Screen (Easiest)

1. Go to the login screen
2. Click **"Initialize Database & Create Test Accounts"** button
3. Wait for success message
4. Credentials will be auto-filled:
   - **Admin**: admin@valuedock.com / admin123
   - **User**: finance@testorganization.com / Test123!
5. Click **Sign In**

### Option 2: Call API Directly

Open browser console and run:

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

Replace `[PROJECT_ID]` with your actual Supabase project ID.

---

## Common Authentication Errors

### Error: "Invalid login credentials"

**Cause**: User doesn't exist in Supabase Auth or password is incorrect

**Solutions**:

1. **Initialize the database first** (see Quick Fix above)
2. **Check credentials**:
   - Default admin: admin@valuedock.com / admin123
   - Default user: finance@testorganization.com / Test123!
3. **Verify Supabase project is set up**:
   - Go to Supabase dashboard
   - Check that Auth is enabled
   - Verify users exist in Authentication > Users

### Error: "No session returned"

**Cause**: Supabase Auth succeeded but didn't return a session

**Solutions**:

1. Check that email confirmation is disabled (it's auto-confirmed in init)
2. Verify Supabase project URL is correct
3. Check browser console for detailed error logs

### Error: "Failed to fetch profile"

**Cause**: Edge Function is not deployed or not accessible

**Solutions**:

1. **Deploy Edge Function**:
   ```bash
   supabase functions deploy server
   ```

2. **Verify deployment**:
   ```bash
   supabase functions list
   ```

3. **Test health endpoint**:
   ```
   https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/health
   ```

4. **Check Edge Function logs**:
   ```bash
   supabase functions logs server
   ```

### Error: "Unauthorized" (401)

**Cause**: JWT token is invalid or expired

**Solutions**:

1. **Log out and log in again**
2. **Clear browser cache and localStorage**:
   ```javascript
   localStorage.clear();
   window.location.reload();
   ```
3. **Check token expiration** (tokens expire after 1 hour by default)

### Error: "CORS error"

**Cause**: Edge Function CORS headers not properly configured

**Solutions**:

1. Verify CORS is enabled in `supabase/functions/server/index.tsx`:
   ```typescript
   app.use("/*", cors({
     origin: "*",
     allowHeaders: ["Content-Type", "Authorization"],
     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
   }));
   ```

2. Redeploy Edge Function:
   ```bash
   supabase functions deploy server
   ```

---

## Verifying Your Setup

### 1. Check Supabase Project

```bash
# Test health endpoint
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/health

# Expected response:
{"status":"ok"}
```

### 2. Check Database Status

Open browser console on login page:

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/status')
  .then(r => r.json())
  .then(d => console.log('Status:', d))
  .catch(e => console.error('Error:', e));
```

Expected response should show:
- Test tenant exists
- Test organization exists
- Admin user exists
- Finance user exists

### 3. Check Environment Variables

Verify these are set correctly:

**In Figma Make** (or your environment):
- `SUPABASE_URL` = https://[project-id].supabase.co
- `SUPABASE_ANON_KEY` = your anon key
- `SUPABASE_SERVICE_ROLE_KEY` = your service role key (server-side only)

**In Supabase Edge Function**:
```bash
supabase secrets list
```

Should show:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

### 4. Test User Creation

Try creating a test user manually:

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User',
    role: 'user',
    tenantId: 'tenant_test_001',
    organizationId: 'org_test_001'
  })
})
.then(r => r.json())
.then(d => console.log('Signup result:', d))
.catch(e => console.error('Error:', e));
```

---

## Step-by-Step Debugging

### Step 1: Verify Supabase Connection

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Note your project ID (in URL: `project/[PROJECT_ID]`)
4. Go to Settings → API
5. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

### Step 2: Check Edge Function Deployment

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref [PROJECT_ID]

# Check if function is deployed
supabase functions list

# If not deployed, deploy it
cd supabase/functions
supabase functions deploy server

# View logs
supabase functions logs server --tail
```

### Step 3: Initialize Database

**Option A - From Login Screen**:
Click "Initialize Database" button

**Option B - From Browser Console**:
```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init', {
  method: 'POST'
}).then(r => r.json()).then(console.log);
```

**Option C - From Terminal**:
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init
```

### Step 4: Verify Users Exist

**In Supabase Dashboard**:
1. Go to Authentication → Users
2. Should see:
   - admin@valuedock.com
   - finance@testorganization.com

**Via API**:
```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/status')
  .then(r => r.json())
  .then(console.log);
```

### Step 5: Try Logging In

1. Email: admin@valuedock.com
2. Password: admin123
3. Click Sign In

**Still not working?** Check browser console for errors.

---

## Advanced Debugging

### Enable Verbose Logging

The auth system already logs extensively. To see logs:

1. **Browser Console** (F12):
   - All auth attempts logged
   - Profile fetch attempts logged
   - API calls logged

2. **Edge Function Logs**:
   ```bash
   supabase functions logs server --tail
   ```

3. **Check Network Tab** (F12 → Network):
   - Look for failed requests
   - Check response bodies
   - Verify request headers

### Check KV Store

Verify data is being stored:

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/keys')
  .then(r => r.json())
  .then(console.log);
```

Should show:
- tenant: entries
- organization: entries
- user: entries

### Test KV Store Directly

```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/test-kv')
  .then(r => r.json())
  .then(console.log);
```

Expected: `{ success: true, message: "KV store is working!" }`

### Reset Everything

If all else fails, reset the database:

```javascript
// 1. Get all users
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/keys')
  .then(r => r.json())
  .then(data => {
    // 2. Manually delete from Supabase Dashboard > Authentication > Users
    // 3. Re-initialize
    return fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init', {
      method: 'POST'
    });
  })
  .then(r => r.json())
  .then(console.log);
```

---

## Common Setup Mistakes

### ❌ Wrong Project ID
**Check**: URL should be `https://[PROJECT_ID].supabase.co`  
**Fix**: Copy correct ID from Supabase dashboard URL

### ❌ Wrong API Keys
**Check**: Anon key and service role key are different  
**Fix**: Get correct keys from Settings → API in Supabase dashboard

### ❌ Edge Function Not Deployed
**Check**: Run `supabase functions list`  
**Fix**: Deploy with `supabase functions deploy server`

### ❌ Missing Environment Variables
**Check**: Edge Function needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY  
**Fix**: 
```bash
supabase secrets set SUPABASE_URL=[URL]
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[KEY]
```

### ❌ Users Not Initialized
**Check**: Authentication > Users in Supabase dashboard is empty  
**Fix**: Click "Initialize Database" on login screen

### ❌ Email Confirmation Required
**Check**: Supabase Auth settings  
**Fix**: The init endpoint auto-confirms emails with `email_confirm: true`

---

## Production Setup Checklist

Before deploying to production:

- [ ] Supabase project created
- [ ] Edge Function deployed
- [ ] Environment variables set (frontend)
- [ ] Edge Function secrets set (backend)
- [ ] Database initialized (users, tenant, org created)
- [ ] Test login works
- [ ] Admin panel accessible
- [ ] Profile fetching works
- [ ] Session persistence works
- [ ] CORS properly configured

---

## Getting Help

### Check Logs First

1. **Browser Console** (F12)
2. **Edge Function Logs**: `supabase functions logs server`
3. **Network Tab** (F12 → Network)

### Useful Debug Endpoints

```bash
# Health check
GET /make-server-888f4514/health

# Database status
GET /make-server-888f4514/debug/status

# List all keys
GET /make-server-888f4514/debug/keys

# Test KV store
GET /make-server-888f4514/debug/test-kv

# Initialize database
POST /make-server-888f4514/init
```

### Error Patterns

| Error | Likely Cause | Quick Fix |
|-------|-------------|-----------|
| Invalid login credentials | User not created | Initialize database |
| No session returned | Auth config issue | Check Supabase settings |
| Failed to fetch profile | Edge Function issue | Redeploy function |
| Unauthorized (401) | Token expired | Log out and back in |
| CORS error | Missing headers | Redeploy function |
| Network error | Wrong project ID | Verify project ID |

---

## Contact Support

If you've tried everything:

1. **Document the error**:
   - Screenshot of error message
   - Browser console logs
   - Edge Function logs
   - Network tab response

2. **Check documentation**:
   - TROUBLESHOOTING.md
   - QUICK_START.md
   - AUTH_SETUP.md

3. **Review recent changes**:
   - Did you update environment variables?
   - Did you redeploy Edge Function?
   - Did you change Supabase project?

---

**Last Updated**: January 2025  
**Version**: 1.0.0
