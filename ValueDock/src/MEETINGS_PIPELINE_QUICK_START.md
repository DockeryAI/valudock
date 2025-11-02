# Meetings Pipeline - Quick Start Guide

## 🚀 3-Minute Integration

### Step 1: Import the Component

```typescript
// At top of your file
import { MeetingsPanel } from './components/MeetingsPanel';
```

### Step 2: Add to Your UI

#### Option A: As a Main Tab (Recommended)

In `App.tsx`:

```typescript
// Add to TabsList
<TabsTrigger value="meetings" className="gap-1 md:gap-2 px-3 md:px-4">
  <Calendar className="h-4 w-4 flex-shrink-0" />
  <span className="hidden sm:inline whitespace-nowrap">Meetings</span>
</TabsTrigger>

// Add TabsContent
<TabsContent value="meetings" className="mt-0">
  {dataLoading ? (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    </div>
  ) : (
    <MeetingsPanel 
      orgId={selectedContextOrgId || userProfile?.organizationId}
      autoLoad={true}
    />
  )}
</TabsContent>
```

#### Option B: In Admin Dashboard

In `AdminDashboard.tsx`:

```typescript
// Add to admin tabs
<Tabs defaultValue="meetings">
  <TabsList>
    <TabsTrigger value="meetings">Meetings</TabsTrigger>
    <TabsTrigger value="users">Users</TabsTrigger>
    {/* other tabs */}
  </TabsList>
  
  <TabsContent value="meetings">
    <MeetingsPanel 
      orgId={currentUser.organizationId}
      autoLoad={true}
    />
  </TabsContent>
</Tabs>
```

#### Option C: Embedded in Existing Screen

In any component:

```typescript
<div className="space-y-6">
  {/* Your existing content */}
  
  <div className="border-t pt-6">
    <h2 className="text-lg font-semibold mb-4">Recent Meetings</h2>
    <MeetingsPanel 
      orgId={selectedOrgId}
      autoLoad={true}
    />
  </div>
</div>
```

### Step 3: Test It

1. **Select an organization** (use context switcher)
2. **Navigate to Meetings tab/section**
3. **Verify**:
   - ✅ Meetings load automatically
   - ✅ Shows count from each source
   - ✅ If empty, shows diagnostic info

That's it! The pipeline handles everything else.

---

## 🧪 Quick Tests

### Test 1: Basic Load
```
1. Login as org admin
2. Go to Meetings tab
3. Should see: "Showing N meetings..."
```

### Test 2: Master Admin
```
1. Login as master_admin
2. Don't select org
3. Should see: "No Organization Selected"
4. Select org from context switcher
5. Should load meetings for that org
```

### Test 3: Empty State
```
1. Select org with no meetings
2. Should see diagnostic:
   - Reason code
   - Source counts (all 0)
   - Date window
   - Email list
   - Suggestions
```

### Test 4: Refresh
```
1. Click "Refresh" button
2. Should reload from sources
3. Should maintain data during load
```

---

## 🎛️ Component Props

```typescript
interface MeetingsPanelProps {
  orgId: string | null;    // Organization ID (required)
  autoLoad?: boolean;      // Auto-load on mount (default: true)
}
```

### Examples

```typescript
// Auto-load when org changes
<MeetingsPanel 
  orgId={selectedOrgId} 
  autoLoad={true}
/>

// Manual load only (user clicks button)
<MeetingsPanel 
  orgId={selectedOrgId} 
  autoLoad={false}
/>

// No org (shows diagnostic)
<MeetingsPanel 
  orgId={null} 
  autoLoad={true}
/>
```

---

## 📊 What You'll See

### When Meetings Exist

```
┌──────────────────────────────────────────────┐
│ Meetings                                     │
│ Showing 15 meetings from 10 Fathom + 5      │
│ Summary                                      │
│ Jul 23, 12:00 AM → Oct 21, 11:59 PM [Refresh]│
├──────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐  │
│ │ Team Standup             [fathom]      │  │
│ │ 📅 Oct 21, 2025, 9:00 AM  ⏱️ 30 min    │  │
│ │ 👥 alice@org.com, bob@org.com          │  │
│ │ Weekly team sync meeting               │  │
│ │                          [Recording] ▶ │  │
│ └────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────┐  │
│ │ Client Call              [summary]     │  │
│ │ 📅 Oct 20, 2025, 2:00 PM  ⏱️ 60 min    │  │
│ │ 👥 client@external.com                 │  │
│ └────────────────────────────────────────┘  │
│ ... (more meetings)                          │
└──────────────────────────────────────────────┘
```

### When Empty

```
┌──────────────────────────────────────────────┐
│ ⚠️ No Meetings Found                         │
│ No meetings were found in any source for the │
│ selected time period.                        │
├──────────────────────────────────────────────┤
│ Diagnostic Information                       │
│                                              │
│ Reason: no_source_results                    │
│ Sources: Fathom: 0, Summary: 0, Merged: 0    │
│ Window: Jul 23 → Oct 21 (America/Chicago)   │
│ Emails: user1@org.com, user2@org.com        │
├──────────────────────────────────────────────┤
│ Suggestions                                  │
│ • Try extending date range to 180 days      │
│ • Check Fathom is connected to emails       │
│ • Verify organization domain is correct     │
│ • Ensure timezone is set correctly          │
├──────────────────────────────────────────────┤
│ [Retry (90d, local TZ)]                     │
└──────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: "No meetings" but I know there are meetings

**Check:**
1. ✅ Organization selected correctly?
2. ✅ User emails match Fathom connected emails?
3. ✅ Meetings within last 90 days?
4. ✅ Timezone correct (America/Chicago)?

**Debug:**
- Click "Retry" to reload
- Check diagnostic "Emails" list matches expected
- Try console: `window.DevFSM?.diagnose()` to see app state

### Issue: Component not rendering

**Check:**
1. ✅ Imported MeetingsPanel?
2. ✅ Passed orgId prop?
3. ✅ No TypeScript errors?

**Debug:**
```typescript
// Add console log
console.log('MeetingsPanel props:', { orgId, autoLoad });
```

### Issue: Meetings load but disappear

**Cause:** Empty overwrite (should be prevented by safeMerge)

**Debug:**
- Check console for: `🛡️ BLOCKED: Prevented empty overwrite`
- If not appearing, file bug report

### Issue: Slow loading

**Normal:** 500-1000ms (parallel API calls)

**Slow (>3s):**
- Check network tab for backend response time
- May be backend performance issue
- Check Fathom API rate limits

---

## 🎯 Expected Behavior

### Scenario 1: Fresh Page Load
```
1. User lands on page
2. Auto-login restores session
3. Organization context loaded
4. Meetings tab selected
5. Pipeline runs:
   IDLE → RESOLVING_CONTEXT → FETCHING → MERGED
6. Meetings displayed
```

### Scenario 2: Org Switch
```
1. User switches org in context switcher
2. Pipeline detects change (via useEffect)
3. Runs pipeline for new org:
   MERGED → RESOLVING_CONTEXT → FETCHING → MERGED
4. Old meetings replaced with new org's meetings
```

### Scenario 3: Manual Refresh
```
1. User clicks "Refresh" button
2. Pipeline re-runs for same org
3. Fetches latest data from sources
4. Merges with existing (deduplicated)
5. UI updates
```

---

## 📈 Performance Tips

### Tip 1: Use autoLoad Wisely

```typescript
// Good: Auto-load in main tab
<TabsContent value="meetings">
  <MeetingsPanel orgId={orgId} autoLoad={true} />
</TabsContent>

// Better: Conditional auto-load
<TabsContent value="meetings">
  <MeetingsPanel 
    orgId={orgId} 
    autoLoad={currentTab === 'meetings'} 
  />
</TabsContent>
```

### Tip 2: Memoize orgId

```typescript
const memoizedOrgId = useMemo(
  () => selectedContextOrgId || userProfile?.organizationId,
  [selectedContextOrgId, userProfile?.organizationId]
);

<MeetingsPanel orgId={memoizedOrgId} />
```

### Tip 3: Lazy Load

```typescript
// Only load component when tab is active
{currentTab === 'meetings' && (
  <MeetingsPanel orgId={orgId} autoLoad={true} />
)}
```

---

## 🎨 Customization

### Custom Date Range

```typescript
// Modify pipeline.ts computeWindow call
const { fromISO, toISO } = computeWindow('America/Chicago', 180); // 180 days
```

### Custom Timezone

```typescript
// Modify pipeline.ts timezone
const { fromISO, toISO } = computeWindow('America/New_York', 90);
```

### Hide Diagnostics

```typescript
// In EmptyState component, comment out diagnostic section
{/* <div className="border-t pt-4">...</div> */}
```

---

## ✅ Checklist

Before deploying:

- [ ] Component imported and rendered
- [ ] orgId prop passed correctly
- [ ] Tested with org that has meetings
- [ ] Tested with org that has no meetings
- [ ] Tested as master_admin (no org)
- [ ] Tested rapid org switching
- [ ] Refresh button works
- [ ] Recording links open (if available)
- [ ] Diagnostics show expected info
- [ ] No console errors

---

## 🚀 You're Done!

The Meetings Pipeline is now integrated and ready to use. It will:
- ✅ Always show meetings when they exist
- ✅ Never lose data due to race conditions
- ✅ Provide clear diagnostics when empty
- ✅ Handle timezone differences correctly
- ✅ Aggregate from multiple sources

**Next:** Use it for real meetings data and enjoy zero "zero meetings" bugs! 🎉
