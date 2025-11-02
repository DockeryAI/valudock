# Quick Test: Production Fathom Server Integration

## ⚡ Instant Verification

### 1. Test with Curl (1 minute)

```bash
curl -X POST https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "thephoenixinsurance.com",
    "action": "sync"
  }'
```

**Expected Output:**
```json
{
  "summary": "We conducted X meetings with thephoenixinsurance.com...",
  "meetingCount": 3,
  "goals": ["Goal 1", "Goal 2"],
  "challenges": ["Challenge 1", "Challenge 2"],
  "people": [
    {"name": "John Doe", "title": "CEO"}
  ]
}
```

### 2. Test in ValuDock UI (2 minutes)

1. **Login to ValuDock**
2. **Navigate to:** Create Presentation tab
3. **Enter Company Website:** `https://thephoenixinsurance.com`
4. **Scroll to:** Meeting History section
5. **Click:** "Aggregate Meetings" button
6. **Watch for:** Success toast notification
7. **Verify:** Summary appears in text editor

### 3. Check Database (30 seconds)

```sql
-- Verify the sync wrote to database
SELECT 
  domain,
  meeting_count,
  LENGTH(summary) as summary_length,
  created_at
FROM public.meeting_summaries
WHERE domain = 'thephoenixinsurance.com'
ORDER BY created_at DESC
LIMIT 1;
```

## 🎯 What to Look For

### ✅ Success Indicators
- Toast shows: "Aggregated X meetings"
- Summary text appears in WYSIWYG editor
- Goals auto-populate in Business Goals section
- Challenges auto-populate in Challenges section
- Console shows: `[AGGREGATE-MEETINGS] Using production Supabase Edge Function`

### ❌ Failure Indicators
- Toast shows: "Failed to fetch aggregated meetings"
- Console shows HTTP error status
- No data appears in editor
- Check: FATHOM_API_KEY and OPENAI_API_KEY in production function

## 🔧 Quick Fixes

### Issue: 500 Error
**Fix:** Check production function has required env vars:
```bash
# In Supabase Dashboard → Edge Functions → fathom-server → Settings
FATHOM_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SUPABASE_URL=https://hpnxaentcrlditokrpyo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Issue: 404 Error
**Fix:** Deploy the fathom-server function:
```bash
supabase functions deploy fathom-server
```

### Issue: Empty Response
**Fix:** Check Fathom API has meetings for the domain

### Issue: CORS Error
**Fix:** Add CORS headers in production function

## 📊 Monitoring

Check Edge Function logs in real-time:
```
Supabase Dashboard → Edge Functions → fathom-server → Logs
```

Look for these log messages:
- `Fetching meetings for domain: thephoenixinsurance.com`
- `Found X meetings from Fathom API`
- `Generating summary with OpenAI`
- `Writing to public.meeting_summaries`
- `Sync complete`

## 🚀 Performance Expectations

- **Request time:** 5-15 seconds (depends on # of meetings and OpenAI API)
- **Meeting limit:** 20 most recent meetings
- **Summary length:** 2-3 paragraphs
- **Goals extracted:** 3-5 items
- **Challenges extracted:** 3-5 items

---

**Quick Status Check:** Run the curl command above. If you get a valid JSON response with a summary, the integration is working! ✅
