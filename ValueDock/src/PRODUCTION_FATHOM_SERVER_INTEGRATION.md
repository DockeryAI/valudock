# Production Fathom Server Integration ✅

## Overview
The "Aggregate Meetings" button in the Presentation screen now calls the **production Supabase Edge Function** directly instead of routing through the internal make-server wrapper.

## What Changed

### Before
```typescript
// Called internal wrapper
const response = await apiCall('/fathom-meeting-history', {
  method: 'POST',
  body: { domain }
});
```

### After
```typescript
// Calls production Edge Function directly
const productionUrl = 'https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server';

const fetchResponse = await fetch(productionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    domain,
    action: 'sync' // Request to sync meetings into database
  })
});
```

## Production Endpoint Details

**URL:** `https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server`

**Method:** `POST`

**Request Body:**
```json
{
  "domain": "example.com",
  "action": "sync"
}
```

**Expected Response:**
```json
{
  "summary": "Executive summary of meetings...",
  "meetingCount": 5,
  "attendees": ["John Doe", "Jane Smith"],
  "meetingDates": ["January 15, 2025", "January 22, 2025"],
  "domain": "example.com",
  "goals": ["Improve efficiency", "Reduce costs"],
  "challenges": ["Manual processes", "Data silos"],
  "people": [
    { "name": "John Doe", "title": "CEO" },
    { "name": "Jane Smith", "title": "CFO" }
  ]
}
```

## Required Environment Variables

The production `fathom-server` Edge Function needs these environment variables configured:

1. **FATHOM_API_KEY** - Your Fathom API key
2. **OPENAI_API_KEY** - Your OpenAI API key for summarization
3. **SUPABASE_URL** - Supabase project URL (for database writes)
4. **SUPABASE_SERVICE_ROLE_KEY** - Service role key (for database writes)

## How It Works

1. **User clicks "Aggregate Meetings"** in Presentation → Meeting History section
2. **Frontend extracts domain** from the Company Website field
3. **POST request sent** to production fathom-server function
4. **Function executes:**
   - Fetches meetings from Fathom API filtered by domain
   - Generates AI summary using OpenAI
   - Extracts goals and challenges
   - **Syncs data to `public.meeting_summaries` table**
5. **Response returned** with summary, goals, challenges, and people
6. **Frontend displays** the aggregated data with WYSIWYG editor

## Database Schema

The production function should write to this table:

```sql
CREATE TABLE public.meeting_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  summary TEXT,
  meeting_count INTEGER,
  attendees JSONB,
  meeting_dates JSONB,
  goals JSONB,
  challenges JSONB,
  people JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast domain lookups
CREATE INDEX idx_meeting_summaries_domain ON public.meeting_summaries(domain);
```

## Testing the Integration

### 1. Test with Sample Domain
```bash
# Use curl to test the endpoint
curl -X POST https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server \
  -H "Content-Type: application/json" \
  -d '{"domain": "thephoenixinsurance.com", "action": "sync"}'
```

### 2. Expected Success Response
```json
{
  "success": true,
  "summary": "We conducted 3 meetings with thephoenixinsurance.com...",
  "meetingCount": 3,
  "goals": [...],
  "challenges": [...],
  "people": [...]
}
```

### 3. Check Database
```sql
-- Verify data was written to meeting_summaries
SELECT * FROM public.meeting_summaries 
WHERE domain = 'thephoenixinsurance.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Frontend Flow

```
┌─────────────────────────────────────┐
│  PresentationScreen.tsx             │
│  Meeting History Section            │
└──────────────┬──────────────────────┘
               │
               │ User clicks "Aggregate Meetings"
               ▼
┌─────────────────────────────────────┐
│  fetchAggregatedMeetings()          │
│  - Extract domain from website      │
│  - Validate domain exists           │
└──────────────┬──────────────────────┘
               │
               │ POST request
               ▼
┌─────────────────────────────────────┐
│  Production Supabase Edge Function  │
│  https://hpnxaentcrlditokrpyo       │
│  .supabase.co/functions/v1/         │
│  fathom-server                      │
└──────────────┬──────────────────────┘
               │
               │ 1. Fetch from Fathom API
               │ 2. Summarize with OpenAI
               │ 3. Write to public.meeting_summaries
               │ 4. Return aggregated data
               ▼
┌─────────────────────────────────────┐
│  Response Handler                   │
│  - Parse summary, goals, challenges │
│  - Display in WYSIWYG editor        │
│  - Auto-fill goals/challenges       │
└─────────────────────────────────────┘
```

## Error Handling

The frontend handles these scenarios:

1. **No domain entered** → Toast error: "Please enter a company domain first"
2. **API error** → Toast error with details
3. **No meetings found** → Info message with meeting count of 0
4. **Network error** → Toast error: "Failed to fetch from production endpoint"

## Benefits of Direct Integration

✅ **No middleware overhead** - Direct connection to production function  
✅ **Database persistence** - Meetings synced to public.meeting_summaries  
✅ **Real-time data** - Always fetches latest from Fathom  
✅ **Simplified architecture** - Removes make-server dependency for this feature  
✅ **Better error visibility** - Direct error messages from production function  

## Code Location

**File:** `/components/PresentationScreen.tsx`

**Function:** `fetchAggregatedMeetings()` (around line 1362)

**Button location:** Meeting History section in Executive Summary tab

## Next Steps

1. ✅ **Update complete** - Button now calls production endpoint
2. ⏳ **Deploy fathom-server** - Ensure production function is deployed with required env vars
3. ⏳ **Test integration** - Use curl or frontend to test domain aggregation
4. ⏳ **Verify database writes** - Check public.meeting_summaries table
5. ⏳ **Monitor logs** - Watch Supabase Edge Function logs for errors

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Verify environment variables are set
3. Test with curl command above
4. Check database table exists and has proper permissions
5. Ensure CORS is configured if needed

---

**Last Updated:** January 20, 2025  
**Status:** ✅ Production Integration Complete
