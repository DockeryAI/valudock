# Fathom Error - Quick Fix Guide 🚀

## ⚡ 3-Step Fix

### 1️⃣ Test Your Connection
```
Admin Dashboard → Integrations Tab → Click "Test Fathom Connection"
```
**Expected:** ✅ "Fathom connected! Found X meetings"

### 2️⃣ Check Your API Key
If test fails with 401 error:
1. Go to: https://app.fathom.video/settings/integrations
2. Copy your API key (or generate new one)
3. Add as FATHOM_API_KEY environment variable

### 3️⃣ Try Again
1. Go to Presentation Screen
2. Enter company website: `https://www.acme.com`
3. Click ✨ next to "Meeting History"

## 🔍 Still Getting Errors?

### Check Browser Console (F12)
Look for lines starting with `[FATHOM-FRONTEND]`

**Success looks like:**
```
[FATHOM-FRONTEND] Response status: 200
[FATHOM-FRONTEND] Meeting count: 4
✅ Generated meeting history from 4 Fathom meetings
```

**Error looks like:**
```
[FATHOM-FRONTEND] Response status: 401
❌ Invalid or missing Fathom API key
```

## 🎯 Common Issues

| You See | Fix |
|---------|-----|
| "API key not configured" | Add FATHOM_API_KEY environment variable |
| "Invalid Fathom API key (401)" | Check/regenerate key at fathom.video |
| "No meetings found for domain" | Make sure Fathom has meetings with @domain emails |
| "API key lacks permissions (403)" | Regenerate key with read access |

## 📞 Debug Checklist

- [ ] API key added to environment variables
- [ ] Test button shows success
- [ ] Fathom account has recorded meetings  
- [ ] Meetings have attendees with @company-domain emails
- [ ] Company website entered correctly
- [ ] Browser console shows status 200

## 📖 Full Guides

- **Detailed Fix Guide:** `/FATHOM_ERROR_FIX_GUIDE.md`
- **Complete Integration Guide:** `/FATHOM_INTEGRATION_COMPLETE.md`
- **Fix Summary:** `/FATHOM_FIX_SUMMARY.md`

## 🆘 Getting Help

1. **Test endpoint:** Check connection status first
2. **Browser console:** Look for `[FATHOM-FRONTEND]` logs
3. **Server logs:** Supabase → Edge Functions → Logs
4. **Fathom status:** https://status.fathom.video

---

**Bottom line:** Click "Test Fathom Connection" in Admin Dashboard. If it works, you're good to go. If not, the error message will tell you exactly what to fix!
