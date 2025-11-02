# Meeting Summaries - Final UI Code Insertion

## ⚡ Quick Action Required

The backend code is complete. Only the UI needs to be manually inserted.

---

## Exact Insertion Point

**File:** `/components/PresentationScreen.tsx`

**Line:** ~2559 (after Meeting History section closes)

**Look for this closing:**
```tsx
                  </div>
                )}
              </div>

              {/* Meeting Notes for AI */}    ← INSERT NEW CODE HERE
              <div>
```

---

## Code to Insert

Copy this entire block and insert it between the closing `</div>` of Meeting History and the start of Meeting Notes:

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

---

## After Insertion

The structure should look like this:

```tsx
              {/* Meeting History - Aggregated Summary */}
              <div className="border rounded-lg p-4 bg-muted/20">
                {/* ...existing Meeting History code... */}
              </div>

              {/* Meeting Summaries from Database */}    ← NEW SECTION
              <div className="border rounded-lg p-4 bg-muted/20">
                {/* ...new Meeting Summaries code... */}
              </div>

              {/* Meeting Notes for AI */}
              <div>
                {/* ...existing Meeting Notes code... */}
              </div>
```

---

## Verify Insertion

After adding the code:

1. **Check for errors** - No TypeScript or syntax errors
2. **Save file** - File should save without issues
3. **Reload app** - Page should load without console errors
4. **Navigate to tab** - Go to Create Presentation tab
5. **Scroll down** - See the new "Meeting Summaries" section
6. **Check console** - Should see: `[MEETING-SUMMARIES] Fetching summaries...`

---

## If You Get Errors

### Error: "Cannot find name 'fetchMeetingSummaries'"
**Fix:** The function definitions were added earlier - they should be around line 1546

### Error: "Cannot find name 'meetingSummaries'"
**Fix:** The state variables were added earlier - they should be around line 303

### Error: "line-clamp-2 not working"
**Fix:** Ensure Tailwind is configured for line-clamp utilities

### Error: "Card is not defined"
**Fix:** Check imports at top of file - Card should be imported from './ui/card'

---

## Success Indicators

After insertion, you should see:

✅ No TypeScript errors  
✅ No console errors  
✅ "Meeting Summaries" section visible in UI  
✅ Two buttons: "Refresh" and "Sync from Fathom"  
✅ Console log: `[MEETING-SUMMARIES] Fetching summaries...`  
✅ Either summaries display OR empty state message shows  

---

## Quick Test After Insertion

```bash
# 1. Open browser console
# 2. Navigate to Create Presentation tab
# 3. Scroll to Meeting Summaries section
# 4. Click "Refresh" button
# 5. Check console for:
[MEETING-SUMMARIES] Fetching summaries from database for user: 1c89cea9...
[MEETING-SUMMARIES] Fetched summaries: 0

# 6. Click "Sync from Fathom" button
# 7. Check console for:
[MEETING-SYNC] Triggering live sync from Fathom...
```

---

## What Happens When Complete

When you complete this insertion:

1. ✅ **Component mounts** → Auto-fetches summaries
2. ✅ **Refresh button** → Queries database
3. ✅ **Sync button** → Calls Edge Function + updates database
4. ✅ **Cards display** → Shows meeting data
5. ✅ **Links work** → Opens Fathom recordings

---

## Support

If you need help:

1. Check console for error messages
2. Review MEETING_SUMMARIES_QUICK_TEST.md for troubleshooting
3. Verify all imports are correct
4. Ensure functions and state were added successfully
5. Check database table exists

---

**Action Required:** Insert UI code at line 2559  
**Time Estimate:** 2 minutes  
**Risk:** Low (isolated section, no dependencies changed)  
**Rollback:** Simply remove the inserted block if needed
