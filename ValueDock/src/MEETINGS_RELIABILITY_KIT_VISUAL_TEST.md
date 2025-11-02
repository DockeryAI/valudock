# Meetings Reliability Kit - Visual Test Guide 🧪

**Quick visual walkthrough to verify the Meetings Reliability Kit is working correctly.**

---

## ✅ Test 1: Happy Path (Meetings Load Successfully)

### Steps:
1. Log in as a user with an organization
2. Navigate to the **Meetings** tab (new tab with Users icon)
3. Wait for data to load

### Expected Result:
```
┌─────────────────────────────────────────────────────────────┐
│ 42 meetings · Fathom: 35, Summary: 7                        │
│ · Window 2025-04-24 → 2025-10-21 (America/Chicago)          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Weekly Sync                                   fathom    │ │
│ │ 10/21/2025, 2:00:00 PM → 10/21/2025, 3:00:00 PM        │ │
│ │ alice@acme.com, bob@acme.com, carol@acme.com           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Q4 Planning                                   summary   │ │
│ │ 10/20/2025, 10:00:00 AM → 10/20/2025, 11:30:00 AM      │ │
│ │ dave@acme.com, eve@acme.com                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ... more meetings ...                                       │
└─────────────────────────────────────────────────────────────┘
```

### Console Logs (Expected):
```
[runMeetingsPipeline] 🚀 Starting pipeline for org: org_123
[resolveOrgIdentity] ✅ Identity resolved: { orgId, orgName, domain, emailCount: 15 }
[fetchFathomMeetings] ✅ Total fetched: 35
[fetchSummaryMeetings] ✅ Fetched: 7 items
[safeMerge] ✅ Merged: { currentCount: 0, incomingCount: 35, mergedCount: 35 }
[safeMerge] ✅ Merged: { currentCount: 35, incomingCount: 7, mergedCount: 42 }
[runMeetingsPipeline] ✅ Complete: { phase: 'MERGED', count: 42, reason: 'ok' }
```

---

## ⚠️ Test 2: Demo Mode Banner

### Steps:
1. Set environment variable: `VITE_DEMO_DOMAINS=phoenixinsurance.com`
2. Select organization with domain `phoenixinsurance.com`
3. Navigate to **Meetings** tab

### Expected Result:
```
┌─────────────────────────────────────────────────────────────┐
│ 15 meetings · Fathom: 12, Summary: 3 · DEMO MODE DOMAIN    │
│ · Window 2025-04-24 → 2025-10-21 (America/Chicago)          │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ⚠️ Demo data is enabled for this organization         │   │
│ │ (domain: phoenixinsurance.com). Toggle off in         │   │
│ │ settings to view real meetings.                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [Meeting list appears below...]                             │
└─────────────────────────────────────────────────────────────┘
```

### Console Logs (Expected):
```
[runMeetingsPipeline] 🔍 Identity resolved, demo mode: true
```

---

## 🚫 Test 3: Zero State - No Organization

### Steps:
1. Log in as `master_admin` (no default org)
2. Do NOT select an organization in context switcher
3. Navigate to **Meetings** tab

### Expected Result:
```
┌─────────────────────────────────────────────────────────────┐
│ No meetings                                                 │
│                                                             │
│ Reason: no_org                                              │
│ Source counts — Fathom: 0, Summary: 0                       │
│ Window: undefined → undefined (undefined)                   │
│ Emails (sample): (none)                                     │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Suggestion: Select an organization using the          │   │
│ │ context switcher                                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [ Retry 180d ]  [ Show diagnostics ]                        │
└─────────────────────────────────────────────────────────────┘
```

### Console Logs (Expected):
```
[runMeetingsPipeline] 🚀 Starting pipeline for org: null
[runMeetingsPipeline] ⚠️ No org ID - aborting
```

---

## 👥 Test 4: Zero State - No Emails for Org

### Steps:
1. Create a new organization with NO users
2. Select that organization
3. Navigate to **Meetings** tab

### Expected Result:
```
┌─────────────────────────────────────────────────────────────┐
│ No meetings                                                 │
│                                                             │
│ Reason: no_emails_for_org                                   │
│ Source counts — Fathom: 0, Summary: 0                       │
│ Window: 2025-04-24 → 2025-10-21 (America/Chicago)           │
│ Emails (sample): (none)                                     │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Suggestion: Add users with email addresses to this    │   │
│ │ organization in Admin → Users                         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [ Retry 180d ]  [ Show diagnostics ]                        │
└─────────────────────────────────────────────────────────────┘
```

### Console Logs (Expected):
```
[resolveOrgIdentity] 👥 Users found: { totalUsers: 50, orgUsers: 0, emails: [] }
[runMeetingsPipeline] ✅ Complete: { phase: 'EMPTY', count: 0, reason: 'no_emails_for_org' }
```

---

## 🌐 Test 5: Zero State - No Domain

### Steps:
1. Create organization with users BUT no domain field set
2. Select that organization
3. Navigate to **Meetings** tab

### Expected Result:
```
┌─────────────────────────────────────────────────────────────┐
│ No meetings                                                 │
│                                                             │
│ Reason: no_org_domain                                       │
│ Source counts — Fathom: 0, Summary: 0                       │
│ Window: 2025-04-24 → 2025-10-21 (America/Chicago)           │
│ Emails (sample): alice@external.com, bob@contractor.net     │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Suggestion: Set organization domain in                │   │
│ │ Admin → Organizations                                 │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [ Retry 180d ]  [ Show diagnostics ]                        │
└─────────────────────────────────────────────────────────────┘
```

### Console Logs (Expected):
```
[resolveOrgIdentity] 📋 Organization found: { id, name, domain: null }
[runMeetingsPipeline] ✅ Complete: { phase: 'EMPTY', count: 0, reason: 'no_org_domain' }
```

---

## 📄 Test 6: Pagination Loop

### Steps:
1. Select organization with 50+ meetings in Fathom
2. Open browser console
3. Navigate to **Meetings** tab
4. Watch console logs

### Expected Console Output:
```
[fetchFathomMeetings] 📞 Starting fetch: { orgId, emailCount: 15, dateRange: "2025-04-24 to 2025-10-21" }
[fetchFathomMeetings] 📄 Fetching page 1
[fetchFathomMeetings] ✅ Page 1 fetched: 25 items
[fetchFathomMeetings] 📄 Fetching page 2
[fetchFathomMeetings] ✅ Page 2 fetched: 25 items
[fetchFathomMeetings] 📄 Fetching page 3
[fetchFathomMeetings] ✅ Page 3 fetched: 18 items
[fetchFathomMeetings] ✅ No more pages
[fetchFathomMeetings] ✅ Total fetched: 68
```

**Verify**: Meeting count in UI should match total fetched (68 in this example)

---

## 🛡️ Test 7: Sticky Merge Guard

### Setup:
This test requires simulating a race condition (advanced).

### Steps:
1. Load meetings successfully (e.g., 20 meetings)
2. In browser console, manually trigger pipeline with broken API:
   ```javascript
   // Temporarily break API to return empty
   window.FORCE_EMPTY_RESPONSE = true;
   
   // Trigger re-fetch
   import('./meetings/pipeline').then(({ runMeetingsPipeline }) => {
     runMeetingsPipeline({ orgId: 'org_123' });
   });
   ```
3. Check console logs

### Expected Console Output:
```
[fetchFathomMeetings] ✅ Total fetched: 0  // API broken, returns empty
[safeMerge] 🛡️ BLOCKED empty overwrite: { currentCount: 20, incomingCount: 0 }
```

### Expected UI:
**Meetings list should still show 20 meetings** (NOT zero!)

### Cleanup:
```javascript
delete window.FORCE_EMPTY_RESPONSE;
```

---

## 📊 Test 8: Diagnostics Panel

### Steps:
1. Navigate to Meetings tab with zero meetings
2. Click **"Show diagnostics"** button

### Expected Result:
Alert popup with JSON:
```json
{
  "diagnostics": {
    "params": {
      "orgId": "org_123",
      "domain": "acme.com",
      "tz": "America/Chicago",
      "fromISO": "2025-04-24T05:00:00.000Z",
      "toISO": "2025-10-21T04:59:59.999Z",
      "emailsSample": ["alice@acme.com", "bob@acme.com", "carol@acme.com"]
    },
    "counts": {
      "fathom": 0,
      "summaries": 0,
      "merged": 0
    },
    "demo": false
  }
}
```

**Verify**:
- `orgId` matches selected org
- `domain` is correct
- `emailsSample` contains actual user emails
- `fromISO` / `toISO` are 180 days apart
- `tz` is America/Chicago

---

## 🔄 Test 9: Retry Button

### Steps:
1. Navigate to Meetings tab with zero meetings
2. Fix the underlying issue (e.g., add users to org)
3. Click **"Retry 180d"** button
4. Watch UI update

### Expected Result:
- Loading spinner appears briefly
- Meetings list populates with new data
- Console shows full pipeline run

### Console Logs:
```
[MeetingsPanel] Running pipeline for org: org_123
[runMeetingsPipeline] 🚀 Starting pipeline for org: org_123
... (full pipeline logs) ...
[runMeetingsPipeline] ✅ Complete: { phase: 'MERGED', count: 15 }
```

---

## 🌍 Test 10: Timezone Window

### Steps:
1. Select organization
2. Navigate to Meetings tab
3. Check header text

### Expected Result:
```
42 meetings · Fathom: 35, Summary: 7
· Window 2025-04-24 → 2025-10-21 (America/Chicago)
```

### Verify:
- Window is exactly 180 days
- End date is today
- Timezone is `America/Chicago`
- Dates are in `YYYY-MM-DD` format

### Console Verification:
```javascript
// In browser console
const { computeWindow } = await import('./meetings/window');
const window = computeWindow('America/Chicago', 180);
console.log(window);

// Output:
{
  tz: "America/Chicago",
  fromISO: "2025-04-24T05:00:00.000Z",  // 00:00 CST = 05:00 UTC
  toISO: "2025-10-21T04:59:59.999Z"     // 23:59 CST = 04:59 UTC next day
}
```

---

## 🎨 Test 11: Mobile Responsiveness

### Steps:
1. Open browser DevTools
2. Switch to mobile view (375px width)
3. Navigate to Meetings tab

### Expected Result:
- Tab trigger shows only icon (no text) on mobile
- Meetings list is scrollable
- Zero-state panel is readable
- Buttons stack vertically on small screens

---

## 🧹 Test 12: Data Cleanup After Org Switch

### Steps:
1. Select Organization A → Load meetings
2. Switch to Organization B (using context switcher)
3. Observe meetings tab

### Expected Result:
- Loading spinner appears
- Old meetings from Org A disappear
- New meetings from Org B appear
- No mixing of data between orgs

### Console Logs:
```
[App] 🔄 Loading data for context: { orgId: 'org_B' }
[App] ✅ Run meetings pipeline after cost classification loads
[runMeetingsPipeline] 🚀 Starting pipeline for org: org_B
```

---

## Checklist Summary

Use this checklist to verify all features:

- [ ] ✅ Meetings load successfully (Test 1)
- [ ] ⚠️ Demo mode banner appears (Test 2)
- [ ] 🚫 No org shows correct zero-state (Test 3)
- [ ] 👥 No emails shows actionable suggestion (Test 4)
- [ ] 🌐 No domain shows actionable suggestion (Test 5)
- [ ] 📄 Pagination fetches all pages (Test 6)
- [ ] 🛡️ Sticky merge prevents data loss (Test 7)
- [ ] 📊 Diagnostics show all params (Test 8)
- [ ] 🔄 Retry button re-runs pipeline (Test 9)
- [ ] 🌍 Timezone window is correct (Test 10)
- [ ] 🎨 Mobile UI works correctly (Test 11)
- [ ] 🧹 Org switching cleans up data (Test 12)

---

## What to Look For

### ✅ Good Signs
- Meetings appear quickly (1-2 seconds)
- Source counts add up correctly
- Console logs are clear and descriptive
- Zero-states have helpful suggestions
- Demo mode is clearly indicated
- No errors in browser console

### ⚠️ Warning Signs
- Meetings take >5 seconds to load → Check network tab
- Source counts don't match UI count → Check merge logic
- Demo banner appears for non-demo orgs → Check env vars
- Sticky merge doesn't trigger → Check `/meetings/merge.ts`

### 🚨 Red Flags
- Meetings disappear on refresh → **CRITICAL BUG**
- Console shows errors → Check API endpoints
- Zero-state shows `unknown` reason → Check diagnostics logic
- Pagination stops at page 1 → Check `nextPageToken` handling

---

**Status**: ✅ Ready for Testing  
**Last Updated**: October 21, 2025
