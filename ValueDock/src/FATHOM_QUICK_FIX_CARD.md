# Fathom Not Working? Quick Fix Card

## 🚨 What You're Seeing

❌ "Failed to fetch meetings" or similar generic error

## ✅ What Changed (Just Now)

I improved error messages so you now see **exactly** why Fathom isn't working.

Try again and you should see a detailed error like:

```
❌ Fathom Configuration Error:

Missing configuration: VD_URL, VD_SERVICE_ROLE_KEY

Tier 1 (External Proxy): Not configured
Tier 2 (Direct API): Failed - DNS restriction

Solution: Deploy fathom-proxy to external system...
```

---

## 🔧 Quick Diagnosis

### Check #1: Are Environment Variables Set?

Run this in your main project:
```bash
supabase secrets list
```

You should see:
- ✅ `FATHOM_API_KEY`
- ✅ `VD_URL` 
- ✅ `VD_SERVICE_ROLE_KEY`

If any are missing → Set them

### Check #2: Is External Proxy Deployed?

Test the proxy directly:
```bash
curl -X POST https://YOUR_VD_URL/functions/v1/fathom-proxy \
  -H "Authorization: Bearer YOUR_VD_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain":"dockeryai.com","fathomApiKey":"YOUR_FATHOM_KEY"}'
```

**Expected**: JSON array of meetings  
**If 404**: Proxy not deployed → Deploy it  
**If error**: Check proxy logs

### Check #3: Is Fathom API Key Valid?

Test Fathom API directly:
```bash
curl https://us.fathom.video/api/v1/meetings \
  -H "Authorization: Bearer YOUR_FATHOM_API_KEY"
```

**Expected**: JSON with meetings  
**If 401**: API key invalid → Get new one from Fathom

---

## 🎯 Most Likely Fix

**90% chance it's one of these:**

### Option A: Proxy Not Deployed

```bash
# On your EXTERNAL Supabase project (not main project)
cd /path/to/external-project
mkdir -p supabase/functions/fathom-proxy

# Copy the proxy code
# See /supabase/functions/fathom-proxy/index.ts

# Deploy
supabase functions deploy fathom-proxy

# Test
curl -X POST https://YOUR_EXTERNAL_PROJECT.supabase.co/functions/v1/fathom-proxy ...
```

### Option B: Environment Variables Wrong

```bash
# Main project
supabase secrets set VD_URL=https://YOUR_EXTERNAL_PROJECT.supabase.co
supabase secrets set VD_SERVICE_ROLE_KEY=your_external_service_role_key
supabase secrets set FATHOM_API_KEY=your_fathom_api_key

# Redeploy main function
supabase functions deploy make-server-888f4514
```

### Option C: Fathom API Key Expired

1. Go to Fathom dashboard
2. Generate new API key
3. Update environment variable:
   ```bash
   supabase secrets set FATHOM_API_KEY=new_key
   ```

---

## 📊 How It Works

```
Your Frontend
  ↓
Calls: /api/fathom/meetings?domain=acme.com
  ↓
Backend tries:

  [TIER 1] External Proxy (VD_URL)
    → POST to external system
    → External system calls Fathom
    → ✅ Returns meetings (if deployed)
    → ❌ Falls to Tier 2 (if not deployed)
    
  [TIER 2] Direct Fathom API
    → GET https://us.fathom.video
    → ❌ ALWAYS FAILS (DNS restriction)
    
  [ERROR] HTTP 503 with details
    → Error object explains what failed
    → Frontend shows this to you NOW ✅
```

---

## 🧪 Test It

1. **Open ValuDock Presentation Screen**
2. **Enter domain**: `dockeryai.com`
3. **Click** "Generate from Fathom" (Meeting History)
4. **Read the error message** - it will tell you EXACTLY what's wrong

---

## 📚 Full Documentation

- `/FATHOM_FIX_SUMMARY_OCT_18.md` - What I just fixed
- `/FATHOM_ARCHITECTURE_AND_FIX_COMPREHENSIVE.md` - Complete technical details
- `/FATHOM_API_COMPREHENSIVE_GUIDE.md` - Full setup guide
- `/supabase/functions/fathom-proxy/index.ts` - Proxy source code

---

## 💡 Key Insight

**The fix I just made:**  
Error messages now show you tier-by-tier status, so you know if it's:
- Tier 1 issue (proxy not deployed/configured)
- Tier 2 issue (DNS error - expected)
- API key issue
- etc.

**Before**: "Failed to fetch meetings" 😕  
**Now**: "Tier 1 (External Proxy): Not configured. Solution: Deploy fathom-proxy..." 🎯

---

**Last Updated**: October 18, 2024  
**Status**: Error handling fixed - you should now see why it's not working!
