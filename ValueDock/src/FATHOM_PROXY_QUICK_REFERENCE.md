# Fathom Proxy - Quick Reference Card

## ⚡ Setup (30 seconds)

### 1. Environment
```bash
# .env.local
VITE_FATHOM_PROXY_URL=https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server
```

### 2. Restart
```bash
pnpm dev
```

### 3. Test
Navigate to **Meetings** tab → Click **Refresh**

---

## 🔌 API Endpoints

### POST /full_sync (Warm cache)
```typescript
await client.fullSync(orgId, emails, fromISO, toISO);
```

### GET ?mode=read (Read meetings)
```typescript
const { meetings, nextPageToken } = await client.read({
  orgId,
  domainEmails: ["*@testorg.com"],
  fromISO,
  toISO,
  pageToken
});
```

---

## 📦 Key Files

| File | Purpose |
|------|---------|
| `/src/env.ts` | Safe env var access |
| `/src/integrations/fathom/client.ts` | HTTP client |
| `/meetings/sources.ts` | Fetch logic |
| `/meetings/pipeline.ts` | Orchestration |
| `/screens/MeetingsPanel/index.tsx` | UI + Refresh button |

---

## ✅ Success Logs

```
[FathomClient] POST full_sync: { orgId: "...", emails: 1, ... }
[FathomClient] ✅ full_sync complete
[FathomClient] GET read: { mode: "read", orgId: "...", ... }
[FathomClient] ✅ read response: { meetingsCount: 15, hasNextPage: false }
[fetchFathomMeetings] ✅ Total fetched: 15
```

---

## ❌ Removed

- Webhooks
- Polling timers
- setInterval
- "Fallback to webhook mode"
- Auto-refresh every 500ms

---

## ✅ Added

- Manual "Refresh" button
- Clean HTTP proxy calls
- Safe environment access
- Pagination support
- Clear error messages

---

## 🐛 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| "Missing VITE_FATHOM_PROXY_URL" | Set in `.env.local` and restart |
| No meetings shown | Check domain, users, date range |
| Network error | Verify proxy URL and deployment |

---

## 🎯 Expected Behavior

**On load:**
1. POST /full_sync (warm cache)
2. GET ?mode=read (fetch meetings)
3. Display in UI

**On refresh:**
1. Click "Refresh" button
2. Repeat steps above
3. Update display

**No auto-polling** - User controls when to refresh!

---

## 📊 Architecture

```
Frontend
  ↓ Load env vars (safe)
  ↓ Create FathomClient
  ↓ POST /full_sync
  ↓ GET ?mode=read (loop pages)
  ↓ Display meetings
```

---

## 💡 Key Concept

**Old:** Poll every 500ms for webhook data  
**New:** HTTP calls on-demand with manual refresh

**Result:** Better performance, clearer control, simpler code
