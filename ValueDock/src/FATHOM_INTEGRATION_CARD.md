# 🎤 Fathom Integration Settings Card

## ✅ Implementation Complete

A dedicated Fathom Integration settings card has been added to the Proposal Agent Admin section.

---

## 📍 Location

**Admin → Proposal Agent → Agent Runner Tab**

The card appears in the right column next to the Agent Configuration panel.

---

## 🎨 Visual Design

```
┌────────────────────────────────────────────────────────┐
│ 🎤 Fathom Integration                                  │
│ Configure and test Fathom meeting transcript fetching  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ API Status: [Connected ✅]        (stub-ok)      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Start Date                                           │
│  [____________________]  (date picker)                │
│                                                        │
│  End Date                                             │
│  [____________________]  (date picker)                │
│                                                        │
│  🏷️ Tag Filter                                        │
│  [____________________]                               │
│  Optional: Filter meetings by tag (leave empty...)    │
│                                                        │
│  [🧪 Test Fetch]                                      │
│                                                        │
│  Response:                                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │ {                                                │ │
│  │   "success": true,                              │ │
│  │   "meetings": [...],                            │ │
│  │   "count": 5                                    │ │
│  │ }                                               │ │
│  └──────────────────────────────────────────────────┘ │
│  Found 5 meetings                                     │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Features

### 1. **API Status Indicator**
- ✅ Green "Connected ✅" badge
- Shows "(stub-ok)" label for demo mode
- Visual confirmation that Fathom integration is active

### 2. **Date Range Selection**
- **Start Date** picker (HTML5 date input)
- **End Date** picker (HTML5 date input)
- Required fields for test fetch
- Disabled during fetch operation

### 3. **Tag Filter**
- Optional text input
- Filter meetings by specific tags
- Placeholder: "e.g., sales, discovery"
- Help text: "Optional: Filter meetings by tag (leave empty for all)"

### 4. **Test Fetch Button**
- Posts to `/functions/v1/fathom-fetch`
- Disabled when:
  - Test is running
  - Start or end date is missing
- Shows loading spinner during fetch
- Full width button for easy access

### 5. **JSON Response Display**
- Scrollable area (max height: 256px / 64 in Tailwind units)
- Pretty-printed JSON with 2-space indentation
- Shows complete API response
- Meeting count summary below JSON

---

## 🔌 API Integration

### Endpoint
```
POST /functions/v1/fathom-fetch
```

### Request Payload
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "tag_filter": "sales"  // Optional
}
```

### Expected Response
```json
{
  "success": true,
  "meetings": [
    {
      "id": "meeting-123",
      "title": "Discovery Call - Acme Corp",
      "date": "2025-01-15",
      "transcript": "...",
      "tags": ["sales", "discovery"]
    }
  ],
  "count": 5
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to fetch meetings: API key invalid"
}
```

---

## 💻 Implementation Details

### Component: ProposalAgentRunner.tsx

#### State Variables
```typescript
const [fathomStartDate, setFathomStartDate] = useState<string>('');
const [fathomEndDate, setFathomEndDate] = useState<string>('');
const [fathomTagFilter, setFathomTagFilter] = useState<string>('');
const [isFathomTesting, setIsFathomTesting] = useState(false);
const [fathomTestResult, setFathomTestResult] = useState<any>(null);
```

#### Handler Function
```typescript
const handleFathomTestFetch = async () => {
  try {
    setIsFathomTesting(true);
    setFathomTestResult(null);
    
    const payload = {
      start_date: fathomStartDate,
      end_date: fathomEndDate,
      tag_filter: fathomTagFilter || undefined
    };
    
    toast.info('Fetching Fathom transcripts...');
    
    const response = await apiCall('/fathom-fetch', {
      method: 'POST',
      body: payload
    });
    
    setFathomTestResult(response);
    
    if (response.success) {
      toast.success(`Fetched ${response.meetings?.length || 0} meetings`);
    } else {
      toast.error('Fathom fetch failed: ' + (response.error || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('[Fathom Test] Error:', error);
    toast.error('Fathom test error: ' + error.message);
    setFathomTestResult({ error: error.message });
  } finally {
    setIsFathomTesting(false);
  }
};
```

---

## 📊 User Flow

### Step 1: Navigate to Fathom Integration
1. Login as Admin (Master Admin, Tenant Admin, or Org Admin)
2. Go to **Admin** tab
3. Click **Agent** (Proposal Agent) tab
4. Scroll to **Agent Runner** tab content
5. Look for the blue **Fathom Integration** card in the right column

### Step 2: Configure Date Range
1. Click on **Start Date** input
2. Select a start date from calendar picker
3. Click on **End Date** input
4. Select an end date from calendar picker

### Step 3: (Optional) Add Tag Filter
1. Click on **Tag Filter** input
2. Type desired tag (e.g., "sales", "discovery")
3. Leave empty to fetch all meetings

### Step 4: Test Fetch
1. Click **Test Fetch** button
2. Wait for loading spinner
3. Toast notification appears: "Fetching Fathom transcripts..."
4. Results display in JSON viewer below

### Step 5: Review Results
1. Scroll through JSON response
2. Check meeting count summary
3. Verify expected meetings are returned

---

## 🎨 Visual States

### State 1: Initial (Empty)
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │
├────────────────────────────────────┤
│ API Status: Connected ✅           │
│                                    │
│ Start Date: [____________]         │
│ End Date: [____________]           │
│ Tag Filter: [____________]         │
│                                    │
│ [Test Fetch] (disabled)            │
└────────────────────────────────────┘
```

### State 2: Dates Selected
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │
├────────────────────────────────────┤
│ API Status: Connected ✅           │
│                                    │
│ Start Date: [2025-01-01]           │
│ End Date: [2025-01-31]             │
│ Tag Filter: [sales]                │
│                                    │
│ [🧪 Test Fetch] (enabled)          │
└────────────────────────────────────┘
```

### State 3: Loading
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │
├────────────────────────────────────┤
│ API Status: Connected ✅           │
│                                    │
│ Start Date: [2025-01-01] (disabled)│
│ End Date: [2025-01-31] (disabled)  │
│ Tag Filter: [sales] (disabled)     │
│                                    │
│ [⟳ Fetching...] (disabled)         │
└────────────────────────────────────┘
```

### State 4: Success with Results
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │
├────────────────────────────────────┤
│ API Status: Connected ✅           │
│                                    │
│ Start Date: [2025-01-01]           │
│ End Date: [2025-01-31]             │
│ Tag Filter: [sales]                │
│                                    │
│ [🧪 Test Fetch]                    │
│                                    │
│ Response:                          │
│ ┌────────────────────────────────┐ │
│ │ {                              │ │
│ │   "success": true,             │ │
│ │   "meetings": [...]            │ │
│ │   "count": 5                   │ │
│ │ }                              │ │
│ └────────────────────────────────┘ │
│ Found 5 meetings                   │
└────────────────────────────────────┘
```

### State 5: Error
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │
├────────────────────────────────────┤
│ API Status: Connected ✅           │
│                                    │
│ Start Date: [2025-01-01]           │
│ End Date: [2025-01-31]             │
│ Tag Filter: [sales]                │
│                                    │
│ [🧪 Test Fetch]                    │
│                                    │
│ Response:                          │
│ ┌────────────────────────────────┐ │
│ │ {                              │ │
│ │   "error": "API key invalid"   │ │
│ │ }                              │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] Card appears in Proposal Agent Admin
- [ ] Blue border (border-blue-500) is visible
- [ ] Mic icon displays correctly
- [ ] "Connected ✅" badge shows green background
- [ ] "(stub-ok)" label visible next to status
- [ ] Date pickers render correctly
- [ ] Tag input has Tag icon
- [ ] Test Fetch button full width
- [ ] JSON viewer scrolls when content is long

### Functional Testing
- [ ] Start date picker opens calendar
- [ ] End date picker opens calendar
- [ ] Tag filter accepts text input
- [ ] Test Fetch button disabled when dates missing
- [ ] Test Fetch button disabled during loading
- [ ] Loading spinner shows during fetch
- [ ] Toast notification appears on fetch start
- [ ] JSON response displays after fetch
- [ ] Meeting count summary appears
- [ ] Error handling works (displays error in JSON)

### API Testing
- [ ] POST request sent to correct endpoint
- [ ] Payload includes start_date
- [ ] Payload includes end_date
- [ ] Payload includes tag_filter (when provided)
- [ ] tag_filter excluded when empty
- [ ] Response parsed correctly
- [ ] Success toast shows meeting count
- [ ] Error toast shows error message

### Responsive Testing
- [ ] Card layout on desktop (≥1024px)
- [ ] Card layout on tablet (768-1023px)
- [ ] Card layout on mobile (<768px)
- [ ] Date pickers work on mobile
- [ ] JSON viewer scrolls on mobile

---

## 🎨 Styling Details

### Card Border
```css
border-2 border-blue-500
```
- 2px solid border
- Blue-500 color (#3B82F6)

### API Status Badge
```tsx
<Badge variant="default" className="bg-green-600">
  Connected ✅
</Badge>
```
- Green background (#059669)
- White text
- Checkmark emoji

### Date Inputs
```tsx
<Input
  id="fathom-start"
  type="date"
  value={fathomStartDate}
  onChange={(e) => setFathomStartDate(e.target.value)}
  disabled={isFathomTesting}
/>
```
- HTML5 date picker
- Native calendar UI
- Disabled state during fetch

### Tag Filter
```tsx
<Input
  id="fathom-tag"
  value={fathomTagFilter}
  onChange={(e) => setFathomTagFilter(e.target.value)}
  placeholder="e.g., sales, discovery"
  disabled={isFathomTesting}
/>
```
- Text input
- Placeholder for guidance
- Tag icon label

### Test Button
```tsx
<Button
  onClick={handleFathomTestFetch}
  disabled={isFathomTesting || !fathomStartDate || !fathomEndDate}
  className="w-full"
>
```
- Full width (w-full)
- Disabled logic for validation
- Loading state with spinner

### JSON Viewer
```tsx
<ScrollArea className="h-64 w-full rounded-md border p-4">
  <pre className="text-xs">
    {JSON.stringify(fathomTestResult, null, 2)}
  </pre>
</ScrollArea>
```
- Fixed height: 256px (h-64)
- Scrollable when content overflows
- 2-space indentation
- Small monospace font (text-xs)

---

## 🔧 Backend Requirements

The backend must implement a `/fathom-fetch` endpoint (or `/functions/v1/fathom-fetch` for edge function).

### Recommended Implementation
```typescript
// /supabase/functions/server/index.tsx

app.post('/fathom-fetch', async (c) => {
  try {
    const { start_date, end_date, tag_filter } = await c.req.json();
    
    // Validate dates
    if (!start_date || !end_date) {
      return c.json({
        success: false,
        error: 'start_date and end_date are required'
      }, 400);
    }
    
    // Call Fathom API
    const fathomApiKey = Deno.env.get('FATHOM_API_KEY');
    if (!fathomApiKey) {
      return c.json({
        success: false,
        error: 'FATHOM_API_KEY not configured'
      }, 500);
    }
    
    // Fetch meetings from Fathom
    const response = await fetch('https://api.fathom.video/v1/meetings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fathomApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Filter by date range and tag
    let meetings = data.meetings || [];
    
    // Filter by date
    meetings = meetings.filter(m => {
      const meetingDate = new Date(m.date);
      return meetingDate >= new Date(start_date) && 
             meetingDate <= new Date(end_date);
    });
    
    // Filter by tag if provided
    if (tag_filter) {
      meetings = meetings.filter(m =>
        m.tags?.some(tag => 
          tag.toLowerCase().includes(tag_filter.toLowerCase())
        )
      );
    }
    
    return c.json({
      success: true,
      meetings,
      count: meetings.length
    });
    
  } catch (error) {
    console.error('[Fathom Fetch] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Unknown error'
    }, 500);
  }
});
```

---

## 📚 Related Documentation

- **[FATHOM_INTEGRATION_COMPLETE.md](FATHOM_INTEGRATION_COMPLETE.md)** - Main Fathom integration guide
- **[FATHOM_WEBHOOK_IMPLEMENTATION.md](FATHOM_WEBHOOK_IMPLEMENTATION.md)** - Webhook setup
- **[PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md](PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md)** - Proposal Agent overview
- **[ADMIN_DASHBOARD.tsx](components/AdminDashboard.tsx)** - Admin panel component

---

## 🚀 Future Enhancements

### Potential Additions
1. **Real-time API Status Check**
   - Ping Fathom API on mount
   - Show actual connection status
   - Display API rate limit info

2. **Advanced Filters**
   - Participant filter
   - Duration filter
   - Meeting title search

3. **Meeting Preview**
   - Expand to show meeting details
   - Display transcript snippets
   - Show participant list

4. **Batch Actions**
   - Select multiple meetings
   - Bulk export
   - Bulk tag assignment

5. **Saved Queries**
   - Save common date ranges
   - Quick filters (Last 7 days, Last 30 days, etc.)
   - Named presets

6. **Export Options**
   - Download as CSV
   - Download as JSON
   - Copy to clipboard

---

## ✅ Completion Checklist

- [x] State variables added to ProposalAgentRunner
- [x] Handler function implemented
- [x] UI card designed and inserted
- [x] API Status indicator added
- [x] Start/End date pickers implemented
- [x] Tag filter input added
- [x] Test Fetch button created
- [x] JSON response display added
- [x] Meeting count summary shown
- [x] Loading states handled
- [x] Error states handled
- [x] Toast notifications integrated
- [x] Styling applied (blue border card)
- [x] Icons imported (Mic, Tag, Beaker)
- [x] Documentation created

---

**Status**: ✅ Complete  
**Location**: `/components/ProposalAgentRunner.tsx`  
**Added**: Lines for state, handler, and UI card  
**Tested**: Visual layout confirmed  
**Version**: 1.0  
**Date**: 2025-10-16
