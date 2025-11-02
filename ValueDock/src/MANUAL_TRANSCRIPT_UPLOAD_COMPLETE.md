# 📝 Manual Transcript Upload Feature - Complete Implementation

## ✅ Implementation Summary

Added a comprehensive "Upload Notes/Transcript" fallback feature to the Challenges & Goals panel with:

1. **Toggle Switch** - Enable/disable manual transcript mode
2. **Textarea Input** - Paste meeting notes or transcripts
3. **Dual Mode Support** - Switch between Fathom API and manual input
4. **Agent Tool Reference** - Updated UI documentation
5. **Auto-extraction** - AI extracts challenges/goals from manual text

---

## 🎯 Feature Overview

### Location
**Admin → Proposal Agent → Edit Content → Challenges & Goals Tab**

### Purpose
Provides a **fallback option** when:
- Fathom API is unavailable
- Meetings aren't in Fathom
- Working with external transcripts/notes
- Testing challenge extraction

---

## 🎨 Visual Design

### Complete UI Flow

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 Challenges & Goals                                    │
│    Client pain points and objectives                     │
│                                                          │
│                    [🎤 Fetch from Fathom] [Reset]       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ✨ AI Prompt: Based on Fathom meeting transcripts...    │
│                                                          │
│    Agent Tool: Agent prefers the tool fathom_fetch for   │
│    pulling call transcripts and extracting challenges/   │
│    goals via our Edge Function.                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 📝 Upload Notes/Transcript            [Fallback]         │
│    Manually paste meeting notes or transcripts...        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Use manual transcript            [Toggle OFF/ON]   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  When OFF (API Mode):                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🎤 API mode enabled. Click "Fetch from Fathom"    │ │
│  │    to fetch from Fathom meetings (last 30 days).   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  When ON (Manual Mode):                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Transcript Text                                     │ │
│  │ ┌────────────────────────────────────────────────┐ │ │
│  │ │ Paste meeting notes or transcript here...      │ │ │
│  │ │                                                │ │ │
│  │ │ Separate different sections with blank lines.  │ │ │
│  │ │ The AI will extract challenges and goals...    │ │ │
│  │ └────────────────────────────────────────────────┘ │ │
│  │ 3 section(s) detected                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ℹ️ Manual mode enabled. Click "Fetch from Fathom"  │ │
│  │    to process your transcript.                     │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Dual Mode System

### Mode 1: Fathom API (Default)
- **Toggle**: OFF
- **Icon**: 🎤 Mic
- **Action**: Fetches from Fathom API (last 30 days)
- **Payload**: `{tenant_id, org_id, deal_id, start, end, tags}`

### Mode 2: Manual Transcript
- **Toggle**: ON
- **Icon**: 📝 Upload
- **Action**: Processes manually pasted text
- **Payload**: `{tenant_id, org_id, deal_id, transcripts_text}`

---

## 📡 API Integration

### Endpoint
```
POST /functions/v1/fathom-fetch
```

### Request Payload (Manual Mode)

```json
{
  "tenant_id": "tenant-uuid",
  "org_id": "org-uuid",
  "deal_id": "DEAL-2025-001",
  "transcripts_text": [
    "First section of transcript...",
    "Second section of transcript...",
    "Third section of transcript..."
  ]
}
```

### Request Payload (API Mode)

```json
{
  "tenant_id": "tenant-uuid",
  "org_id": "org-uuid",
  "deal_id": "DEAL-2025-001",
  "start": "2025-09-16",
  "end": "2025-10-16",
  "tags": ""
}
```

### Expected Response

```json
{
  "success": true,
  "challenges": [
    "Manual processes consuming excessive time",
    "High error rates in data entry",
    "Limited visibility into workflows"
  ],
  "goals": [
    "Reduce operational costs by 30%",
    "Improve accuracy to 99%+",
    "Enable real-time reporting"
  ]
}
```

---

## 💻 Implementation Details

### State Management

```typescript
const [useManualTranscript, setUseManualTranscript] = useState(false);
const [manualTranscriptText, setManualTranscriptText] = useState('');
const [isFetchingFromFathom, setIsFetchingFromFathom] = useState(false);
```

### Handler Logic

```typescript
const handleFetchFromFathom = async () => {
  try {
    setIsFetchingFromFathom(true);
    
    if (useManualTranscript) {
      // Manual mode
      if (!manualTranscriptText.trim()) {
        toast.error('Please enter transcript text');
        return;
      }
      
      toast.info('Processing manual transcript...');
      
      // Split by blank lines to create array
      const transcripts_text = manualTranscriptText
        .split(/\n\n+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const payload = {
        tenant_id: tenantId,
        org_id: organizationId,
        deal_id: dealId,
        transcripts_text
      };
      
      const response = await apiCall('/fathom-fetch', {
        method: 'POST',
        body: payload
      });
      
      if (response.success) {
        await loadSections();
        toast.success('Challenges extracted from manual transcript!');
        setManualTranscriptText(''); // Clear after success
      }
    } else {
      // API mode (existing logic)
      toast.info('Fetching challenges from Fathom meetings...');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const payload = {
        tenant_id: tenantId,
        org_id: organizationId,
        deal_id: dealId,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        tags: ''
      };
      
      const response = await apiCall('/fathom-fetch', {
        method: 'POST',
        body: payload
      });
      
      if (response.success) {
        await loadSections();
        toast.success('Challenges updated from Fathom meetings!');
      }
    }
  } catch (error: any) {
    console.error('Error fetching from Fathom:', error);
    toast.error('Failed to fetch from Fathom');
  } finally {
    setIsFetchingFromFathom(false);
  }
};
```

### Text Parsing

Manual transcript is split by **double newlines** (`\n\n`) to create sections:

```javascript
const transcripts_text = manualTranscriptText
  .split(/\n\n+/)           // Split by 2+ newlines
  .map(t => t.trim())       // Trim whitespace
  .filter(t => t.length > 0); // Remove empty sections
```

**Example Input**:
```
Client mentioned they're struggling with manual invoice processing.
Takes 2-3 days per batch of 100 invoices.

They want to reduce this to under 1 day.
Also want to improve accuracy from 95% to 99%.

Budget constraint: $50K for implementation.
Timeline: Must go live by Q2 2025.
```

**Parsed Output**:
```json
[
  "Client mentioned they're struggling with manual invoice processing.\nTakes 2-3 days per batch of 100 invoices.",
  "They want to reduce this to under 1 day.\nAlso want to improve accuracy from 95% to 99%.",
  "Budget constraint: $50K for implementation.\nTimeline: Must go live by Q2 2025."
]
```

---

## 🎯 User Workflow

### Workflow 1: Using Manual Transcript

```
1. Navigate to Challenges & Goals tab
2. Toggle "Use manual transcript" to ON
3. Textarea appears with placeholder
4. Paste meeting notes/transcript
5. See section count update (e.g., "3 section(s) detected")
6. Click "Fetch from Fathom" button
7. Loading state shows spinner
8. Success toast: "Challenges extracted from manual transcript!"
9. Content in textarea refreshes with extracted challenges
10. Manual text is cleared (ready for next use)
```

### Workflow 2: Using Fathom API (Default)

```
1. Navigate to Challenges & Goals tab
2. Toggle remains OFF (default)
3. API mode indicator shows
4. Click "Fetch from Fathom" button
5. Loading state shows spinner
6. Success toast: "Challenges updated from Fathom meetings!"
7. Content refreshes with extracted challenges
```

---

## 🎨 UI Components Breakdown

### 1. Card Container
```tsx
<Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950">
```
- **Border**: Purple (distinguishes from Fathom API card)
- **Background**: Light purple tint
- **Dark mode**: Purple-950 background

### 2. Card Header
```tsx
<CardTitle>
  <Upload className="h-5 w-5 text-purple-600" />
  Upload Notes/Transcript
  <Badge>Fallback</Badge>
</CardTitle>
```
- **Icon**: Upload (📝)
- **Badge**: "Fallback" label
- **Description**: Clear purpose statement

### 3. Toggle Switch
```tsx
<Switch
  id="manual-transcript-toggle"
  checked={useManualTranscript}
  onCheckedChange={setUseManualTranscript}
/>
```
- **Label**: "Use manual transcript"
- **Tooltip**: Explains fathom_fetch tool behavior
- **Default**: OFF (API mode)

### 4. Textarea (Conditional)
```tsx
{useManualTranscript && (
  <Textarea
    id="manual-transcript"
    value={manualTranscriptText}
    onChange={(e) => setManualTranscriptText(e.target.value)}
    placeholder="Paste meeting notes or transcript here..."
    className="min-h-[200px] font-mono text-sm"
    disabled={isFetchingFromFathom}
  />
)}
```
- **Min height**: 200px
- **Font**: Monospace (easier to read)
- **Placeholder**: Multi-line instructions
- **Disabled**: During fetch operation

### 5. Section Counter
```tsx
<p className="text-xs text-muted-foreground">
  {manualTranscriptText.trim() 
    ? `${manualTranscriptText.trim().split(/\n\n+/).length} section(s) detected` 
    : 'Paste your transcript above'}
</p>
```
- **Dynamic count**: Updates as user types
- **Empty state**: Prompts user to paste

### 6. Status Alerts
```tsx
{useManualTranscript ? (
  <Alert>Manual mode enabled...</Alert>
) : (
  <Alert>API mode enabled...</Alert>
)}
```
- **Manual mode**: Purple info alert
- **API mode**: Blue info alert
- **Clear instructions**: What will happen on click

---

## 📚 Agent Tool Documentation

### Updated AI Prompt Reference

**In Challenges & Goals section**, the AI Prompt now includes:

```
AI Prompt: Based on Fathom meeting transcripts and website analysis, 
extract and structure: 1) Top 3-5 key challenges the client faces, 
2) Their stated goals and objectives, 3) How these align with automation 
opportunities. Use bullet points and clear headers.

Agent Tool: Agent prefers the tool fathom_fetch for pulling call 
transcripts and extracting challenges/goals via our Edge Function.
```

### Tool Behavior

- **Tool Name**: `fathom_fetch`
- **Purpose**: Extract challenges and goals from transcripts
- **Input**: Either API params OR manual transcripts_text
- **Output**: Structured challenges and goals saved to Supabase

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] Card appears in Challenges & Goals tab
- [ ] Purple border and background visible
- [ ] Upload icon displays
- [ ] "Fallback" badge shows
- [ ] Toggle switch renders
- [ ] Tooltip appears on hover
- [ ] Textarea shows when toggle ON
- [ ] Textarea hides when toggle OFF
- [ ] Section counter updates
- [ ] Status alerts switch correctly

### Functional Testing
- [ ] Toggle switches between modes
- [ ] Textarea accepts input
- [ ] Section count updates dynamically
- [ ] "Fetch from Fathom" button works in both modes
- [ ] Loading state shows spinner
- [ ] Success toast appears (manual mode)
- [ ] Success toast appears (API mode)
- [ ] Content refreshes after success
- [ ] Manual text clears after success
- [ ] Error handling works (empty textarea)
- [ ] Disabled state during fetch

### API Testing
- [ ] Manual mode sends transcripts_text array
- [ ] API mode sends date range
- [ ] Correct tenant_id, org_id, deal_id
- [ ] Response parsed correctly
- [ ] Sections reload after success
- [ ] Error responses handled

### Edge Cases
- [ ] Empty textarea in manual mode
- [ ] Very long transcript (>10,000 chars)
- [ ] Single line transcript (no double newlines)
- [ ] Multiple consecutive newlines
- [ ] Special characters in transcript
- [ ] Network errors
- [ ] Backend timeout

---

## 🎯 Usage Examples

### Example 1: Simple Meeting Notes

**Input**:
```
Customer mentioned they process 500 invoices per month manually.
Takes 3 FTEs working full-time.

Goal: Reduce to 1 FTE and improve accuracy.

Budget: $75K implementation, $10K/year maintenance.
```

**Sections Detected**: 3

**Expected Extraction**:
- **Challenge**: Manual invoice processing consuming 3 FTEs
- **Goal**: Reduce to 1 FTE, improve accuracy
- **Constraint**: $75K budget

### Example 2: Detailed Transcript

**Input**:
```
[00:05] Customer: We're overwhelmed with manual data entry.
Our team spends 40% of their time just copying data between systems.

[00:12] Customer: Error rate is about 5%, which causes rework.
We estimate errors cost us $200K annually.

[00:18] Us: What's your ideal state?
Customer: Cut data entry time by 50%, reduce errors to under 1%.

[00:25] Customer: We need this done by end of Q2.
Budget is flexible but prefer under $100K.
```

**Sections Detected**: 4

**Expected Extraction**:
- **Challenges**: 
  - 40% time on manual data entry
  - 5% error rate
  - $200K annual cost from errors
- **Goals**:
  - 50% reduction in data entry time
  - Under 1% error rate
  - Launch by end of Q2
- **Constraints**:
  - Budget: Under $100K preferred

### Example 3: Unstructured Notes

**Input**:
```
Meeting with Acme Corp CFO

Pain points discussed:
- Reconciliation takes 2 weeks every month
- Can't close books until day 20
- Manual Excel process error-prone
- No visibility until reconciliation complete

Their wish list:
- Real-time reconciliation
- Close books by day 5
- Automated exception handling
- Executive dashboard

Next steps:
- Send proposal by Friday
- Demo scheduled for next week
- Decision by month-end
```

**Sections Detected**: 4

**Expected Extraction**:
- **Challenges**:
  - 2-week reconciliation cycle
  - Late book closing (day 20)
  - Error-prone manual Excel process
  - Lack of visibility
- **Goals**:
  - Real-time reconciliation
  - Close books by day 5
  - Automated exception handling
  - Executive dashboard
- **Timeline**:
  - Proposal due Friday
  - Demo next week
  - Decision by month-end

---

## 🔧 Backend Requirements

### Endpoint Implementation

```typescript
app.post('/fathom-fetch', async (c) => {
  const { 
    tenant_id, 
    org_id, 
    deal_id, 
    transcripts_text,  // <-- New: Manual transcripts array
    start,             // <-- Existing: API mode
    end,               // <-- Existing: API mode
    tags               // <-- Existing: API mode
  } = await c.req.json();
  
  let meetings = [];
  
  if (transcripts_text && Array.isArray(transcripts_text)) {
    // Manual mode: Use provided transcripts
    meetings = transcripts_text.map((text, index) => ({
      id: `manual-${Date.now()}-${index}`,
      title: `Manual Transcript Section ${index + 1}`,
      transcript: text,
      source: 'manual'
    }));
  } else {
    // API mode: Fetch from Fathom
    const fathomApiKey = Deno.env.get('FATHOM_API_KEY');
    const response = await fetch('https://api.fathom.video/v1/meetings', {
      headers: { 'Authorization': `Bearer ${fathomApiKey}` }
    });
    const data = await response.json();
    meetings = data.meetings.filter(m => 
      m.date >= start && m.date <= end
    );
  }
  
  // Extract challenges and goals using AI
  const challenges = await extractChallenges(meetings);
  const goals = await extractGoals(meetings);
  
  // Save to Supabase challenges section
  await saveChallenges(deal_id, org_id, { challenges, goals });
  
  return c.json({
    success: true,
    challenges,
    goals,
    source: transcripts_text ? 'manual' : 'fathom_api'
  });
});
```

---

## 📊 Comparison Table

| Feature | Fathom API Mode | Manual Transcript Mode |
|---------|-----------------|------------------------|
| **Toggle State** | OFF (default) | ON |
| **Data Source** | Fathom API | User paste |
| **Date Range** | Last 30 days | N/A |
| **Tag Filter** | Optional | N/A |
| **Input Required** | None (auto-fetch) | Paste text |
| **Section Detection** | N/A | Dynamic count |
| **Validation** | None | Check non-empty |
| **Success Message** | "...from Fathom meetings!" | "...from manual transcript!" |
| **Clear After** | N/A | Yes (auto-clear) |
| **Payload Key** | `start`, `end`, `tags` | `transcripts_text` |
| **Use Case** | Automated fetch | Fallback/testing |

---

## 🎓 Best Practices

### For Users

1. **Separate Sections Clearly**
   - Use blank lines between topics
   - Each section = one semantic chunk
   - More sections = better extraction

2. **Include Context**
   - Who said what
   - Timestamps (if available)
   - Specific numbers and dates

3. **Keep It Organized**
   - Group related points together
   - Use bullet points or paragraphs
   - Avoid mixing challenges and goals

4. **Test First**
   - Start with small transcript
   - Check extraction quality
   - Iterate and refine

### For Developers

1. **Validate Input**
   - Check for empty strings
   - Limit max length (prevent abuse)
   - Sanitize special characters

2. **Handle Edge Cases**
   - Single-line transcripts
   - Very long texts
   - No double newlines

3. **Provide Feedback**
   - Show section count
   - Display character count
   - Warn if too short/long

4. **Optimize Parsing**
   - Cache split results
   - Debounce count updates
   - Use memo for expensive ops

---

## ✅ Implementation Checklist

### Frontend Changes
- [x] Add state for `useManualTranscript`
- [x] Add state for `manualTranscriptText`
- [x] Import Switch and Upload components
- [x] Add toggle UI
- [x] Add textarea UI
- [x] Add section counter
- [x] Add status alerts
- [x] Update handler logic
- [x] Add text parsing logic
- [x] Add validation
- [x] Add toast notifications
- [x] Update AI Prompt Reference
- [x] Add agent tool documentation

### Backend Requirements (Pending)
- [ ] Update `/fathom-fetch` endpoint
- [ ] Add `transcripts_text` parameter handling
- [ ] Implement manual mode detection
- [ ] Add AI extraction for manual transcripts
- [ ] Save challenges to Supabase
- [ ] Return structured response
- [ ] Add error handling

---

## 🚀 Next Steps

### Immediate
1. Test manual mode with sample transcripts
2. Verify section parsing logic
3. Check UI responsiveness
4. Test dark mode appearance

### Short-term
1. Implement backend endpoint changes
2. Add character/section limits
3. Add export/import of transcripts
4. Add template examples

### Long-term
1. Add AI-powered formatting suggestions
2. Support file upload (.txt, .docx)
3. Add transcript history
4. Multi-language support

---

**Status**: ✅ Frontend Complete (Backend Integration Pending)  
**Location**: `/components/ProposalContentBuilder.tsx`  
**Lines Added**: ~120 lines  
**Version**: 1.0  
**Date**: 2025-10-16
