# Fathom Proxy - Quick Start Card

## 🚀 Setup (30 seconds)

### 1. Create `.env.local` in project root

```bash
VITE_FATHOM_MODE=proxy
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy
VITE_SUPABASE_PROJECT_REF=hpnxaentcrlditokrpyo
```

### 2. Restart dev server

```bash
pnpm dev
```

### 3. Verify

Browser console:
```javascript
console.log(import.meta.env.VITE_FATHOM_PROXY_URL);
```

Should output: `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy`

---

## ✅ Expected Console Logs

```
[fetchFathomMeetings] ℹ️ Fathom API integration: Using proxy mode
[fetchFathomMeetingsProxyMode] ✅ Page 1 fetched: 15 items
[runMeetingsPipeline] ✅ Complete: { phase: "MERGED", count: 15 }
```

---

## 🧪 Quick Test

Run in browser console:

```javascript
fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'testorganization.com',
    from: '2024-01-01T00:00:00.000Z',
    to: '2024-12-31T23:59:59.999Z',
    emails: []
  })
})
.then(r => r.json())
.then(d => console.log('✅ Proxy works!', d));
```

---

## 🐛 Troubleshooting

### Problem: "Proxy not deployed"

**Fix:** Check `.env.local` exists and dev server restarted

### Problem: "0 meetings"

**Fix:** Check organization has:
- ✅ Valid domain set
- ✅ Users with emails
- ✅ Meetings in Fathom matching domain

### Problem: Variables show `undefined`

**Fix:** Restart dev server (Vite caches env vars)

---

## 📁 Files Changed

- ✅ `/meetings/fetchProxy.ts` (NEW)
- ✅ `/meetings/sources.ts` (MODIFIED)

---

## 📚 Full Guides

- `/FATHOM_PROXY_FIX_TEST_GUIDE.md` - Step-by-step testing
- `/FATHOM_PROXY_ENV_SETUP.md` - Environment setup
- `/FATHOM_PROXY_REBUILD_COMPLETE.md` - Complete summary
