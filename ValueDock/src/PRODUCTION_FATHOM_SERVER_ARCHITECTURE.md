# Production Fathom Server - Architecture Diagram

## Before: Internal Wrapper Architecture ❌

```
┌──────────────────────────────────────────────────────────────┐
│                    ValuDock Frontend                          │
│                  PresentationScreen.tsx                       │
│                                                               │
│  User clicks "Aggregate Meetings"                            │
│         ↓                                                     │
│  fetchAggregatedMeetings()                                   │
│         ↓                                                     │
│  apiCall('/fathom-meeting-history', { domain })             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ POST /make-server-888f4514/fathom-meeting-history
                        ↓
┌──────────────────────────────────────────────────────────────┐
│            Internal Make Server Wrapper                       │
│        (Supabase Edge Function - server/index.tsx)           │
│                                                               │
│  1. Receives domain                                          │
│  2. Validates FATHOM_API_KEY and OPENAI_API_KEY             │
│  3. Checks for VD_URL (external proxy)                      │
│  4. Calls external proxy OR returns sample data             │
│         ↓                                                     │
│  fetch(proxyUrl + '/fathom-proxy', { domain })              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ POST to external proxy
                        ↓
┌──────────────────────────────────────────────────────────────┐
│              External Fathom Proxy                            │
│      (Different Supabase project - VD_URL)                   │
│                                                               │
│  1. Receives domain and FATHOM_API_KEY                       │
│  2. Calls Fathom API                                         │
│  3. Returns meeting data                                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ Returns meeting data
                        ↓
┌──────────────────────────────────────────────────────────────┐
│            Internal Make Server Wrapper                       │
│                                                               │
│  4. Receives meeting data from proxy                         │
│  5. Calls OpenAI to generate summary                         │
│  6. Returns aggregated response                              │
│  ❌ Does NOT write to database                               │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ Returns JSON response
                        ↓
┌──────────────────────────────────────────────────────────────┐
│                    ValuDock Frontend                          │
│                  PresentationScreen.tsx                       │
│                                                               │
│  Displays summary in WYSIWYG editor                          │
└──────────────────────────────────────────────────────────────┘
```

**Issues with this approach:**
- ❌ Multiple hops (frontend → wrapper → proxy → Fathom)
- ❌ No database persistence
- ❌ Depends on external proxy (VD_URL)
- ❌ Complex error handling across layers
- ❌ Slower response time

---

## After: Direct Production Integration ✅

```
┌──────────────────────────────────────────────────────────────┐
│                    ValuDock Frontend                          │
│                  PresentationScreen.tsx                       │
│                                                               │
│  User clicks "Aggregate Meetings"                            │
│         ↓                                                     │
│  fetchAggregatedMeetings()                                   │
│         ↓                                                     │
│  fetch('https://hpnxaentcrlditokrpyo.supabase.co/           │
│         functions/v1/fathom-server',                         │
│         { method: 'POST', body: { domain, action: 'sync' } })│
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ POST /fathom-server
                        │ { domain: "example.com", action: "sync" }
                        ↓
┌──────────────────────────────────────────────────────────────┐
│          Production Supabase Edge Function                    │
│                  fathom-server                                │
│         (Project: hpnxaentcrlditokrpyo)                      │
│                                                               │
│  1. Receives domain and action                               │
│  2. Validates environment variables                          │
│  3. Fetches meetings from Fathom API ────────────┐           │
│                                                   │           │
│  4. Calls OpenAI for summarization ───────┐      │           │
│                                             │     │           │
│  5. Extracts goals and challenges          │     │           │
│                                             │     │           │
│  6. Syncs to public.meeting_summaries ─────┼─────┼───┐       │
│                                             │     │   │       │
│  7. Returns aggregated response             │     │   │       │
└─────────────────────────┬───────────────────┼─────┼───┼───────┘
                          │                   │     │   │
                          │                   ↓     ↓   ↓
                          │              ┌─────────────────────┐
                          │              │   External APIs     │
                          │              ├─────────────────────┤
                          │              │ • Fathom API        │
                          │              │ • OpenAI API        │
                          │              └─────────────────────┘
                          │                   
                          │              ┌─────────────────────┐
                          │              │  Supabase Database  │
                          │              ├─────────────────────┤
                          │              │ public.             │
                          │              │ meeting_summaries   │
                          │              │                     │
                          │              │ ✅ Persisted Data   │
                          │              └─────────────────────┘
                          │
                          │ Returns JSON response
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                    ValuDock Frontend                          │
│                  PresentationScreen.tsx                       │
│                                                               │
│  Displays summary in WYSIWYG editor                          │
│  Auto-fills goals in Business Goals section                  │
│  Auto-fills challenges in Challenges section                 │
└──────────────────────────────────────────────────────────────┘
```

**Benefits of this approach:**
- ✅ Direct connection (frontend → production function)
- ✅ Database persistence in `public.meeting_summaries`
- ✅ Self-contained function (no external dependencies)
- ✅ Simplified error handling
- ✅ Faster response time
- ✅ Single source of truth for meeting data

---

## Data Flow Comparison

### Before (3-tier with proxy)
```
Frontend 
  → Make Server Wrapper 
    → External Proxy (VD_URL) 
      → Fathom API
    ← External Proxy
  ← Make Server Wrapper
← Frontend

Total hops: 6
Database writes: 0
Response time: 10-20 seconds
```

### After (Direct integration)
```
Frontend 
  → Production Function 
    → Fathom API + OpenAI + Database
  ← Production Function
← Frontend

Total hops: 2
Database writes: 1 (meeting_summaries table)
Response time: 5-15 seconds
```

---

## Environment Variables

### Production Function Requires:

| Variable | Purpose | Example |
|----------|---------|---------|
| `FATHOM_API_KEY` | Authenticate with Fathom API | `fathom_xxxxx` |
| `OPENAI_API_KEY` | Generate AI summaries | `sk-xxxxx` |
| `SUPABASE_URL` | Database connection | `https://hpnxaentcrlditokrpyo.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Write to database | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## Database Schema

```sql
CREATE TABLE public.meeting_summaries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Domain identifier
  domain TEXT NOT NULL,
  
  -- Aggregated data from Fathom + OpenAI
  summary TEXT,
  meeting_count INTEGER,
  attendees JSONB,
  meeting_dates JSONB,
  goals JSONB,
  challenges JSONB,
  people JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by domain
CREATE INDEX idx_meeting_summaries_domain 
ON public.meeting_summaries(domain);

-- Index for recent summaries
CREATE INDEX idx_meeting_summaries_created 
ON public.meeting_summaries(created_at DESC);
```

---

## Request/Response Formats

### Request to Production Function

```json
POST https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server

Headers:
{
  "Content-Type": "application/json"
}

Body:
{
  "domain": "thephoenixinsurance.com",
  "action": "sync"
}
```

### Response from Production Function

```json
{
  "summary": "We conducted 3 meetings with thephoenixinsurance.com's leadership team between December 1, 2024 and January 15, 2025. Key participants included John Doe (CEO), Jane Smith (CFO), and Bob Johnson (COO).\n\nDiscussions focused on digital transformation initiatives, process automation opportunities, and ROI expectations. The team expressed strong interest in automating invoice processing and customer onboarding workflows.\n\nFinance and Operations teams identified significant time spent on manual data entry and reconciliation tasks. The organization is seeking to improve efficiency and reduce operational costs through intelligent automation.",
  
  "meetingCount": 3,
  
  "attendees": [
    "John Doe",
    "Jane Smith", 
    "Bob Johnson"
  ],
  
  "meetingDates": [
    "January 15, 2025",
    "December 20, 2024",
    "December 1, 2024"
  ],
  
  "domain": "thephoenixinsurance.com",
  
  "goals": [
    "Improve operational efficiency by 30%",
    "Reduce manual processing time by 50%",
    "Achieve ROI within 12 months"
  ],
  
  "challenges": [
    "High volume of manual invoice processing (500+ invoices/month)",
    "Inconsistent customer onboarding process",
    "Limited visibility into operational bottlenecks"
  ],
  
  "people": [
    {
      "name": "John Doe",
      "title": "CEO",
      "email": "john.doe@thephoenixinsurance.com"
    },
    {
      "name": "Jane Smith",
      "title": "CFO",
      "email": "jane.smith@thephoenixinsurance.com"
    },
    {
      "name": "Bob Johnson",
      "title": "COO",
      "email": "bob.johnson@thephoenixinsurance.com"
    }
  ]
}
```

---

## Frontend Integration Points

### Button Location
```
App.tsx 
  → PresentationScreen 
    → Executive Summary Tab 
      → Meeting History Section 
        → "Aggregate Meetings" Button
```

### Code Location
**File:** `/components/PresentationScreen.tsx`  
**Function:** `fetchAggregatedMeetings()` (line ~1362)

### Auto-Fill Behavior
When aggregated data is received:
1. **Summary** → Populates Meeting History text editor (WYSIWYG)
2. **Goals** → Auto-creates entries in Business Goals section
3. **Challenges** → Auto-creates entries in Challenges section
4. **People** → Stored in state for reference

---

## Success Metrics

After clicking "Aggregate Meetings":

✅ **Frontend Success:**
- Toast notification shows meeting count
- Summary appears in WYSIWYG editor
- Goals section populated
- Challenges section populated

✅ **Backend Success:**
- Edge Function logs show successful API calls
- Database row created in `meeting_summaries`
- Response time < 15 seconds

✅ **Data Quality:**
- Summary is coherent and professional
- Goals are specific and measurable
- Challenges are actionable
- People list includes names and titles

---

**Status:** ✅ **Production Integration Active**  
**Last Updated:** January 20, 2025  
**Version:** 2.0 (Direct Production Integration)
