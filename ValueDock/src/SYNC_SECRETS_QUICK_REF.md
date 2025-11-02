# Sync Cloud Secrets - Quick Reference

## 🎯 One-Click Guide

### Run Sync
1. Admin → Proposal Agent
2. Toggle "Run in Cloud" ON
3. Click **"Sync Secrets"** (blue button)
4. Wait 3-5 seconds
5. Check for ✅ green checks

---

## 🔑 5 Secrets Synced

| # | Name | Variable |
|---|------|----------|
| 1 | OpenAI | `OPENAI_API_KEY` |
| 2 | Supabase URL (ValueDock) | `VALUEDOCK_SUPABASE_URL` |
| 3 | Supabase Service Role (ValueDock) | `VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY` |
| 4 | Gamma | `GAMMA_API_KEY` |
| 5 | Fathom | `FATHOM_API_KEY` |

---

## ✅ Success Indicators

**Sync Results:**
- ✅ "All secrets synced successfully"
- ✅ Green "All Synced ✓" badge
- ✅ All 5 checkmarks green

**Auto-Verification:**
- ✅ "Verification successful!"
- ✅ All 5 "Secrets Loaded" green
- ✅ Toast: "All secrets verified! ✅"

---

## ⚠️ Partial Sync

**If Some Missing:**
1. Note which are ❌
2. Go to Admin → Secrets
3. Add missing keys
4. Click "Sync Secrets" again
5. Now all should be ✅

---

## 🔧 What It Does

```
Sync → Verify → Display
```

1. **Syncs** all 5 secrets to cloud
2. **Auto-verifies** they're loaded
3. **Shows** green ✅ for each

---

## 📊 Two Result Panels

**Sync Results:**
- What you sent to cloud
- Shows synced secrets

**Secrets Loaded:**
- What edge function sees
- Auto-verification results

Both should match ✅

---

## 🚀 Quick Troubleshooting

**Some secrets ❌:**
→ Add in Admin → Secrets → Sync again

**Sync failed:**
→ Check you're admin → Try "Test Edge Function"

**All synced but verify fails:**
→ Wait 30 seconds → Click "Verify Secrets"

---

## 💡 Pro Tips

✅ Sync after adding secrets  
✅ Sync after updating secrets  
✅ Watch the auto-verification  
✅ Check deployment log for details  
✅ Both panels should match  

---

**Full Guide:** `SYNC_CLOUD_SECRETS_GUIDE.md`
