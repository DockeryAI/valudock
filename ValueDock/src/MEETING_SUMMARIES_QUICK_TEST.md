# Meeting Summaries Quick Test Guide

## ⚡ 3-Minute Verification

### Step 1: Check Component Mount (10 seconds)

1. Open ValuDock app
2. Navigate to "Create Presentation" tab
3. Open browser console (F12)
4. Look for log:
```
[MEETING-SUMMARIES] Fetching summaries from database for user: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
```

**Expected:** Component auto-loads summaries on mount ✅

---

### Step 2: Verify UI Exists (15 seconds)

Scroll down in Create Presentation tab to find:

```
┌─────────────────────────────────────────┐
│ Meeting Summaries         [Refresh]     │
│ Recent summaries synced   [Sync from    │
│ from Fathom                Fathom]      │
└─────────────────────────────────────────┘
```

**Expected:** Two buttons visible ✅

---

### Step 3: Test Refresh Button (20 seconds)

1. Click **"Refresh"** button
2. Watch console for:
```
[MEETING-SUMMARIES] Fetching summaries from database for user: 1c89cea9...
[MEETING-SUMMARIES] Fetched summaries: X
```
3. Button shows spinner during load
4. Summaries display in cards OR empty state shows

**Expected:** Database query executed ✅

---

### Step 4: Test Sync Button (30 seconds)

1. Click **"Sync from Fathom"** button
2. Watch console for:
```
[MEETING-SYNC] Triggering live sync from Fathom...
[MEETING-SYNC] ✅ Live meeting sync triggered successfully
```
3. Button shows "Syncing..." with spinner
4. Toast notification appears: "Meeting sync complete!"
5. List auto-refreshes

**Expected:** Production function called + database updated ✅

---

### Step 5: Verify Database (1 minute)

Run this query in Supabase SQL Editor:

```sql
SELECT 
  recording_id,
  title,
  LEFT(summary_md, 50) as snippet,
  created_at,
  user_id
FROM public.meeting_summaries
WHERE user_id = '1c89cea9-d2ac-4b36-bad8-e228ac79e4e0'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Records exist with user_id matching ✅

---

### Step 6: Test Card Interactions (30 seconds)

If summaries are displayed:

1. Verify each card shows:
   - Title (bold)
   - Date badge (right side)
   - Summary snippet (2 lines)
   - "View Recording" button

2. Click "View Recording" button
   - Should open Fathom recording in new tab

**Expected:** All card elements functional ✅

---

## Common Issues & Fixes

### Issue: "No meeting summaries found"

**Cause:** Empty database table

**Fix:**
1. Click "Sync from Fathom" button
2. Wait for sync to complete
3. Check if Edge Function is deployed
4. Verify Fathom API key is configured

---

### Issue: Console error "Failed to load meeting summaries"

**Cause:** Database connection issue or table doesn't exist

**Fix:**
```sql
-- Create table if missing
CREATE TABLE IF NOT EXISTS public.meeting_summaries (
  recording_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  summary_md TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_url TEXT
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_user_id 
  ON public.meeting_summaries(user_id);
```

---

### Issue: Sync button does nothing

**Cause:** Edge Function not deployed or URL incorrect

**Fix:**
1. Verify endpoint: `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server`
2. Check Edge Function logs in Supabase Dashboard
3. Test with curl:
```bash
curl -X POST \
  'https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server?user_id=1c89cea9-d2ac-4b36-bad8-e228ac79e4e0&full_sync=true' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

### Issue: Cards not displaying properly

**Cause:** CSS not loading or missing line-clamp utility

**Fix:**
- Ensure Tailwind CSS is processing the file
- Check `line-clamp-2` utility is available in Tailwind v4
- Verify Card component from shadcn/ui is imported

---

## Quick Checklist

Before marking as complete, verify:

- [ ] Console logs show fetch on mount
- [ ] "Meeting Summaries" section visible in UI
- [ ] Refresh button fetches from database
- [ ] Sync button triggers Edge Function
- [ ] Toast notifications appear
- [ ] Summaries display in scrollable cards
- [ ] Date formatting works correctly
- [ ] View Recording buttons open links
- [ ] Empty state shows info alert
- [ ] Loading spinners appear during async ops
- [ ] Database records exist for user_id
- [ ] No console errors during normal operation

---

## Performance Check

**Expected timings:**
- Initial load (mount): < 1 second
- Refresh: < 500ms
- Sync: 5-15 seconds (depends on Fathom API)
- Card render: < 100ms

**Console timing:**
```javascript
// Check these in browser console
console.time('fetch-summaries');
// ... fetch operation ...
console.timeEnd('fetch-summaries');
```

---

## Success Criteria

✅ **Auto-load works** - Summaries fetch on component mount  
✅ **UI renders** - Section visible with 2 buttons  
✅ **Refresh works** - Database query executes  
✅ **Sync works** - Edge Function called + database updated  
✅ **Cards display** - Title, date, snippet, link all visible  
✅ **Links work** - View Recording opens Fathom  
✅ **Loading states** - Spinners show during async ops  
✅ **Error handling** - Toast errors on failures  
✅ **Database verified** - Records exist in meeting_summaries  

---

## Debug Mode

Enable verbose logging:

```javascript
// Add to browser console
localStorage.setItem('DEBUG_MEETING_SUMMARIES', 'true');

// Then refresh page
// Extra logs will appear with [MEETING-SUMMARIES-DEBUG] prefix
```

---

## Production Readiness

Before going live:

1. ✅ Test with real Fathom data
2. ✅ Verify user_id filtering works correctly
3. ✅ Test with 20+ summaries (scroll behavior)
4. ✅ Test on mobile viewport
5. ✅ Verify Edge Function has proper error handling
6. ✅ Check database indexes are optimized
7. ✅ Monitor Edge Function logs during sync

---

**Last Updated:** January 20, 2025  
**Status:** ✅ Ready for Testing
