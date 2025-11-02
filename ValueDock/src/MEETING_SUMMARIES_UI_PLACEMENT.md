# Meeting Summaries UI Placement Guide

## Exact Location in File

**File:** `/components/PresentationScreen.tsx`

**Insert After:** Line ~2558 (after the Meeting History section closes)

**Insert Before:** The "Meeting Notes for AI" section

## Code to Add

Insert this complete section at line ~2559:

```tsx
              {/* Meeting Summaries from Database */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Meeting Summaries</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recent summaries synced from Fathom
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchMeetingSummaries}
                      disabled={isLoadingSummaries}
                    >
                      {isLoadingSummaries ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={syncMeetingsFromFathom}
                      disabled={isSyncingMeetings}
                    >
                      {isSyncingMeetings ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Sync from Fathom
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {isLoadingSummaries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : meetingSummaries.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No meeting summaries found. Click "Sync from Fathom" to import meetings.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {meetingSummaries.map((summary) => (
                      <Card key={summary.recording_id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">{summary.title}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {new Date(summary.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          {summary.summary_md && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {summary.summary_md}
                            </p>
                          )}
                          {summary.source_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => window.open(summary.source_url, '_blank')}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Recording
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
```

## Visual Layout

```
┌─────────────────────────────────────────────────────┐
│ Executive Summary Tab                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Company Domain: [________________]                   │
│                                                      │
│ Business Description: [_______________]              │
│ [Generate with AI]                                  │
│                                                      │
│ ┌───────────────────────────────────────────────┐   │
│ │ Meeting History                                │   │
│ │ [Generate Meeting Summary]                     │   │
│ │ (existing section)                             │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
│ ┌───────────────────────────────────────────────┐   │
│ │ Meeting Summaries                   [Refresh]  │   │  ← NEW SECTION
│ │ Recent summaries synced from Fathom            │   │
│ │                        [Sync from Fathom]      │   │
│ ├───────────────────────────────────────────────┤   │
│ │                                                │   │
│ │ ┌─────────────────────────────────────────┐   │   │
│ │ │ Q4 Planning Meeting         Jan 15, 2025│   │   │
│ │ │ Discussed automation priorities...       │   │   │
│ │ │ [View Recording]                        │   │   │
│ │ └─────────────────────────────────────────┘   │   │
│ │                                                │   │
│ │ ┌─────────────────────────────────────────┐   │   │
│ │ │ Customer Discovery Call     Jan 12, 2025│   │   │
│ │ │ Identified key pain points in...        │   │   │
│ │ │ [View Recording]                        │   │   │
│ │ └─────────────────────────────────────────┘   │   │
│ │                                                │   │
│ │ (scrollable list, max 20 summaries)           │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
│ Meeting Notes (for AI Analysis): [_____________]     │
│ (existing section)                                   │
│                                                      │
│ Business Goals:                                      │
│ (existing section)                                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Button Behavior

### Refresh Button (Outline)
- **Action:** Fetches summaries from database
- **Loading state:** Shows spinner + "Loading..."
- **No database write:** Just reads existing data
- **Use case:** Quick refresh without re-syncing

### Sync from Fathom Button (Primary)
- **Action:** Triggers full sync from Fathom API
- **Loading state:** Shows spinner + "Syncing..."
- **Process:**
  1. Calls production fathom-server function
  2. Function fetches from Fathom API
  3. Function writes to meeting_summaries table
  4. Auto-refreshes list when complete
- **Use case:** Import new meetings from Fathom

## Summary Card Structure

Each meeting summary card displays:
- **Title** (left) - Bold, 14px font
- **Date** (right) - Badge with formatted date
- **Snippet** (below) - First 2 lines of summary (line-clamp-2)
- **Link** (button) - Opens Fathom recording in new tab

## States

### Loading State
```
┌──────────────────────┐
│   [spinner icon]     │
│   Loading...         │
└──────────────────────┘
```

### Empty State
```
┌──────────────────────────────────────┐
│ ℹ️ No meeting summaries found.       │
│    Click "Sync from Fathom" to       │
│    import meetings.                  │
└──────────────────────────────────────┘
```

### Populated State
```
┌──────────────────────────────────────┐
│ Meeting Title 1      Jan 15, 2025    │
│ Summary text here...                 │
│ [View Recording]                     │
├──────────────────────────────────────┤
│ Meeting Title 2      Jan 12, 2025    │
│ Summary text here...                 │
│ [View Recording]                     │
├──────────────────────────────────────┤
│ (more summaries...)                  │
└──────────────────────────────────────┘
```

## Styling Notes

- **Container:** Light gray background (`bg-muted/20`), rounded border
- **Max height:** 400px with scroll (`max-h-[400px] overflow-y-auto`)
- **Spacing:** 3-unit gap between cards (`space-y-3`)
- **Typography:**
  - Title: `font-medium text-sm`
  - Snippet: `text-xs text-muted-foreground`
  - Date badge: `text-xs`
- **Button sizes:**
  - Header buttons: `size="sm"`
  - View Recording: `size="sm" h-7 px-2 text-xs`

## Responsive Behavior

- Buttons stack on mobile (<640px)
- Card layout remains single column
- Horizontal scroll prevented
- Touch-friendly button sizes

---

**Location:** After line 2558 in `/components/PresentationScreen.tsx`  
**Section:** Executive Summary → Meeting History → **NEW: Meeting Summaries**
