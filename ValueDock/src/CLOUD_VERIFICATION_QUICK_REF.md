# Cloud Function Verification - Quick Reference

## 🎯 One-Minute Guide

### Run Verification
1. Admin → Proposal Agent
2. Toggle "Run in Cloud" ON
3. Expand "Cloud Run Console"
4. Click **"Verify Cloud Function"**

### Read Results
- 🟢 **Green "Connected"** = Edge function working
- 🔴 **Red "Not Connected"** = Edge function issue
- ✅ **Green checkmarks** = Secret loaded
- ❌ **Red X marks** = Secret missing
- 🟡 **Yellow badge** = Some secrets missing

---

## 📋 5 Required Secrets

| # | Secret Name | Purpose |
|---|-------------|---------|
| 1 | OpenAI | AI generation |
| 2 | Supabase URL | Database |
| 3 | Supabase Service Role | Admin access |
| 4 | Gamma | Presentations |
| 5 | Fathom | Meeting transcripts |

---

## 🔧 Fix Missing Secrets

1. Note which are red ❌
2. Click **"Fix in Admin"**
3. Admin → Secrets tab
4. Add missing keys
5. Return and verify again

---

## 💡 Quick Tips

- ✅ Verify before first run
- ✅ Verify after adding secrets
- ✅ Verify weekly for health check
- ✅ Use verification for debugging

---

## 🐛 Common Issues

**All Red X:**
→ Add secrets in Admin → Secrets

**Not Connected:**
→ Click "Deploy Edge Function" first

**Some Missing:**
→ Click "Fix in Admin" button

---

## 📊 Status Badges

```
[Connected ✓]          = All good!
[Not Connected]        = Fix edge function
[Missing Secrets]      = Add API keys
```

---

**Full Guide:** `CLOUD_FUNCTION_VERIFICATION_GUIDE.md`
