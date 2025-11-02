# Meetings Pipeline - Troubleshooting Guide

## 🐛 Common Issues & Solutions

### Issue 1: "No Organization Selected" Despite Being Logged In

**Symptoms:**
- Logged in as regular user
- Meetings panel shows "No Organization Selected"
- Other tabs work fine

**Cause:**
- User profile missing `organizationId`
- Context switcher not set
- Wrong org context

**Solution:**
```javascript
// Check in browser console:
window.DevFSM?.getState()
// Look for: orgId, selectedContextOrgId

// Fix 1: Ensure profile has orgId
// In Admin → Users, verify user is assigned to org

// Fix 2: Use context switcher
// Top-right dropdown → Select organization

// Fix 3: Pass correct orgId prop
<MeetingsPanel 
  orgId={selectedContextOrgId || userProfile?.organizationId}
  autoLoad={true}
/>
```

---

### Issue 2: Meetings Show Zero But You Know They Exist

**Symptoms:**
- Empty state with "no_source_results"
- Diagnostic shows: Fathom: 0, Summary: 0

**Diagnostic Checklist:**

#### Step 1: Check Date Window
```javascript
// In diagnostics, check:
Window: Jul 23 → Oct 21 (America/Chicago)

// Question: Are your meetings within this range?
// If meetings are older than 90 days → Extend range
```

**Fix:**
```typescript
// In pipeline.ts, line ~40:
const { fromISO, toISO } = computeWindow('America/Chicago', 180); // Change 90 to 180
```

#### Step 2: Check Timezone
```javascript
// In diagnostics, check:
Window: ... (America/Chicago)

// Question: Are your meetings in a different timezone?
// If meetings are in UTC or another TZ → Adjust timezone
```

**Fix:**
```typescript
// In pipeline.ts, line ~40:
const { fromISO, toISO } = computeWindow('UTC', 90); // Change to your timezone
```

#### Step 3: Check Email Matching
```javascript
// In diagnostics, check:
Emails: user1@org.com, user2@org.com

// Question: Do these emails match Fathom connected emails?
// Fathom only returns meetings for connected accounts
```

**Fix:**
```typescript
// Option 1: Connect Fathom to organization emails
// In Fathom → Settings → Integrations

// Option 2: Manually add emails to filter
// In Admin → Users → Add users with Fathom emails
```

#### Step 4: Check Organization Domain
```javascript
// Question: Is org domain set correctly?
// Some Fathom queries filter by domain
```

**Fix:**
```typescript
// In Admin → Organizations
// Verify "Domain" field matches email domain
// e.g., users @acme.com → domain: acme.com
```

#### Step 5: Check Backend Endpoints
```javascript
// Test backend directly in console:
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/meetings/fathom?orgId=your-org-id`,
  { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
);
const data = await response.json();
console.log('Fathom response:', data);

// Should return meetings array (or empty array with explanation)
```

**Expected Response:**
```json
{
  "success": true,
  "meetings": [...],
  "count": 10
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No Fathom integration found"
}
```

---

### Issue 3: Meetings Load Then Disappear

**Symptoms:**
- Meetings briefly appear
- Then screen goes blank
- Console shows: `[safeMerge] 🛡️ BLOCKED: Prevented empty overwrite`

**Cause:**
- Late-arriving empty API response
- safeMerge correctly blocks the overwrite (✅ working as designed)
- But UI doesn't show the blocked data

**Solution:**
This should NOT happen if using MeetingsPanel component correctly.

**Debug:**
```javascript
// Check component state in React DevTools
// Look for: context.merged array
// Should contain meetings even after "BLOCKED" log
```

**Fix:**
If meetings disappear despite block:
```typescript
// Add defensive check in MeetingsPanel
if (phase === 'MERGED' && context.merged.length === 0) {
  // Force retry
  loadMeetings();
}
```

---

### Issue 4: Duplicate Meetings Showing

**Symptoms:**
- Same meeting appears 2+ times
- Different sources but same meeting

**Cause:**
- Meeting ID not being deduplicated correctly
- Fathom and Summary have different IDs for same meeting

**Debug:**
```javascript
// Check meeting IDs in console
context.merged.forEach(m => {
  console.log(m.id, m.title, m.source);
});

// Look for: same title but different IDs
```

**Solution:**
```typescript
// In normalize.ts, enhance ID generation
function normalizeMeeting(raw: any, source: string): any {
  // Generate deterministic ID from meeting data
  const deterministicId = `${raw.title}-${raw.start}-${raw.attendees?.[0]}`;
  const id = raw.id ?? deterministicId;
  
  return { id, ... };
}
```

---

### Issue 5: Wrong Timezone Showing in UI

**Symptoms:**
- Meeting times are off by several hours
- "9am meeting" shows as "3pm"

**Cause:**
- Timezone conversion issue
- Browser timezone vs server timezone mismatch

**Debug:**
```javascript
// Check browser timezone
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
// e.g., "America/New_York"

// Check pipeline timezone
console.log(context.diagnostics.params.tz);
// Should be: "America/Chicago"
```

**Solution:**
```typescript
// Option 1: Match pipeline to user's browser timezone
const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const { fromISO, toISO } = computeWindow(userTz, 90);

// Option 2: Display times in user's local timezone
const startLocal = new Date(meeting.start).toLocaleString('en-US', {
  timeZone: userTz,
  // ... format options
});
```

---

### Issue 6: Slow Loading (>3 seconds)

**Symptoms:**
- FETCHING phase takes forever
- Network requests timeout
- Users complain about speed

**Debug:**
```javascript
// Time the pipeline
const start = performance.now();
await runMeetingsPipeline(orgId);
const end = performance.now();
console.log(`Pipeline took ${end - start}ms`);

// Check network tab for slow requests
// Look for: /meetings/fathom, /meetings/summary
```

**Causes & Fixes:**

#### Cause 1: Backend Timeout
```bash
# Check backend logs
# Look for: "Fathom API timeout"
```

**Fix:**
```typescript
// Add timeout to API calls
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

const response = await fetch(url, {
  signal: controller.signal,
  // ...
});

clearTimeout(timeout);
```

#### Cause 2: Too Many Meetings
```bash
# Query returns 1000+ meetings
# Slow to normalize and merge
```

**Fix:**
```typescript
// Add pagination
const PAGE_SIZE = 50;
const meetings = response.meetings.slice(0, PAGE_SIZE);

// Or add server-side pagination
const response = await apiCall(
  `/meetings/fathom?orgId=${orgId}&limit=50&offset=0`
);
```

#### Cause 3: Network Latency
```bash
# User on slow connection
# API calls take 2-3 seconds each
```

**Fix:**
```typescript
// Add loading skeleton
{loading && (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
)}
```

---

### Issue 7: Empty Overwrite Still Happening

**Symptoms:**
- Meetings load successfully
- Then suddenly become empty
- Console does NOT show "BLOCKED" message

**Cause:**
- Not using safeMerge
- Direct state update bypassing pipeline

**Debug:**
```bash
# Search codebase for:
setMeetings([])
setContext({ merged: [] })

# These should NEVER be called directly
```

**Solution:**
```typescript
// ❌ NEVER do this:
setContext({ merged: [] });

// ✅ ALWAYS use safeMerge:
const newMerged = safeMerge(context.merged, newData);
setContext({ merged: newMerged });

// ✅ OR use pipeline:
await runMeetingsPipeline(orgId);
```

---

### Issue 8: "Error" Reason in Diagnostic

**Symptoms:**
- Empty state shows "unknown error"
- Reason: "error"
- No detailed message

**Debug:**
```javascript
// Check diagnostic params
console.log(context.diagnostics.params.error);

// Check browser console for actual error
// Look for: [Meetings Pipeline] ❌ Error:
```

**Common Errors:**

#### Error 1: Network Error
```
TypeError: Failed to fetch
```

**Fix:**
- Check internet connection
- Verify backend is running
- Check CORS settings

#### Error 2: Auth Error
```
401 Unauthorized
```

**Fix:**
- User not logged in
- Session expired → refresh page
- Invalid API key

#### Error 3: Backend Error
```
500 Internal Server Error
```

**Fix:**
- Check backend logs
- Verify environment variables
- Check database connection

---

## 🧪 Diagnostic Commands

### Check Current State
```javascript
// Get full pipeline state
const state = window.DevFSM?.getState();
console.log('Meetings State:', {
  orgId: state.orgId,
  meetingsCount: state.meetingsCtx?.merged?.length ?? 0,
  phase: state.meetingsPhase,
});
```

### Test Pipeline Manually
```typescript
import { runMeetingsPipeline } from './meetings/pipeline';

// Run pipeline and log results
const context = await runMeetingsPipeline(
  'org-123',
  (phase) => console.log('Phase:', phase),
  (ctx) => console.log('Context:', ctx)
);

console.log('Final result:', context);
```

### Test Date Window
```typescript
import { computeWindow } from './meetings/window';

const window = computeWindow('America/Chicago', 90);
console.log('Date Window:', window);
// Check: fromLocal, toLocal match expected range
```

### Test Normalization
```typescript
import { normalizeMeetings, safeMerge } from './meetings/normalize';

const rawMeetings = [/* your raw data */];
const normalized = normalizeMeetings(rawMeetings, 'test');
console.log('Normalized:', normalized);

// Test merge
const merged = safeMerge([], normalized);
console.log('Merged:', merged);
```

---

## 📊 Expected Console Logs

### Successful Load
```
[Meetings Pipeline] 📅 Date window computed
[Meetings Pipeline] 👥 Organization context resolved
[Meetings Pipeline] 📞 Fetching from Fathom...
[Meetings Pipeline] ✅ Fathom fetch complete: 10
[Meetings Pipeline] 📞 Fetching from summaries...
[Meetings Pipeline] ✅ Summary fetch complete: 5
[Meetings Pipeline] 📡 Source fetch complete
[safeMerge] ✅ Merged meetings
[Meetings Pipeline] ✅ Success
```

### Empty (No Meetings)
```
[Meetings Pipeline] 📅 Date window computed
[Meetings Pipeline] 👥 Organization context resolved
[Meetings Pipeline] 📞 Fetching from Fathom...
[Meetings Pipeline] ✅ Fathom fetch complete: 0
[Meetings Pipeline] 📞 Fetching from summaries...
[Meetings Pipeline] ✅ Summary fetch complete: 0
[Meetings Pipeline] 📡 Source fetch complete
[safeMerge] ✅ Merged meetings
[Meetings Pipeline] ⚠️ No meetings found
```

### Error
```
[Meetings Pipeline] 📅 Date window computed
[Meetings Pipeline] 👥 Organization context resolved
[Meetings Pipeline] 📞 Fetching from Fathom...
[Meetings Pipeline] ❌ Fathom fetch error: TypeError: Failed to fetch
[Meetings Pipeline] ❌ Error: TypeError: Failed to fetch
```

---

## 🆘 Still Stuck?

### 1. Check Documentation
- `MEETINGS_PIPELINE_IMPLEMENTATION.md` - Architecture
- `MEETINGS_PIPELINE_QUICK_START.md` - Integration
- `MEETINGS_PIPELINE_VISUAL_GUIDE.md` - Diagrams

### 2. Enable Debug Mode
```typescript
// Add to pipeline.ts
const DEBUG = true;

if (DEBUG) {
  console.log('[DEBUG] Full context:', context);
  console.log('[DEBUG] API response:', response);
  console.log('[DEBUG] Normalized data:', normalized);
}
```

### 3. File Bug Report
Include:
- ✅ Console logs (full pipeline output)
- ✅ Diagnostic information from UI
- ✅ Organization ID
- ✅ User role
- ✅ Steps to reproduce
- ✅ Expected vs actual behavior

### 4. Emergency Fallback
```typescript
// Temporarily disable pipeline, show all meetings
<div>
  {/* Bypass pipeline for debugging */}
  {rawMeetings.map(m => (
    <div key={m.id}>{m.title}</div>
  ))}
</div>
```

---

**Remember:** The pipeline is designed to NEVER lose data. If you see empty meetings, check diagnostics first - they'll tell you exactly why!
