# Cloud Run Enhanced - Testing Checklist

## 🧪 Complete Testing Guide

### Pre-Test Setup

- [ ] User is logged in as admin
- [ ] Navigate to Admin → Proposal Agent tab
- [ ] Browser console open (F12)
- [ ] No JavaScript errors showing

---

## Test Suite 1: Cloud Run Console Deployment

### Test 1.1: Panel Visibility

**Steps:**
1. Toggle "Run in Cloud" to ON
2. Scroll down below configuration card

**Expected:**
- [ ] "Cloud Run Console" panel is visible
- [ ] Panel has purple border (border-2 border-purple-500)
- [ ] Header shows 🔧 Wrench icon
- [ ] Title says "Cloud Run Console"
- [ ] Description says "Deploy and test the Edge Function"
- [ ] Panel is collapsible (click header to expand/collapse)

---

### Test 1.2: Initial State

**Steps:**
1. Expand Cloud Run Console panel

**Expected:**
- [ ] "Deploy Edge Function" button visible
- [ ] Button shows 🔧 Wrench icon
- [ ] Button text is "Deploy Edge Function"
- [ ] Button is enabled (not disabled)
- [ ] No deployment log showing yet
- [ ] No status badge in header

---

### Test 1.3: Deploy Edge Function - Start

**Steps:**
1. Click "Deploy Edge Function" button

**Expected (Immediately):**
- [ ] Button disabled
- [ ] Button text changes to "Deploying..."
- [ ] Button shows spinning Loader2 icon
- [ ] Header badge appears: "Deploying..." (gray)
- [ ] Deployment log appears below button
- [ ] First log line: "🚀 Deploying proposal-agent-run edge function..."

---

### Test 1.4: Deploy Edge Function - Progress

**Steps:**
1. Wait 1-2 seconds after clicking

**Expected:**
- [ ] Log shows: "✅ Edge function deployed successfully"
- [ ] Header badge changes to "Testing..." (gray)
- [ ] Log shows: "🧪 Running deployment verification test..."
- [ ] Log shows: "Test payload:"
- [ ] Test payload JSON is displayed with:
  - [ ] `tenant_id: "test-tenant-<timestamp>"`
  - [ ] `org_id: "test-org-<timestamp>"`
  - [ ] `deal_id: "TEST-DEPLOY-<timestamp>"`
  - [ ] `customer_url: "https://example.com"`
  - [ ] `fathom_window` with start/end dates

---

### Test 1.5: Deploy Edge Function - Completion

**Steps:**
1. Wait 2-3 more seconds

**Expected:**
- [ ] Log shows: "Test response:"
- [ ] Response JSON displayed with `status: "accepted"`
- [ ] Log shows: "✅ Deployment verified - endpoint returning {status:\"accepted\"}"
- [ ] Header badge changes to green "Deployment Verified ✓"
- [ ] Button re-enabled
- [ ] Button text back to "Deploy Edge Function"
- [ ] Toast notification: "Edge function deployed and verified!"
- [ ] Console logs show no errors

---

### Test 1.6: Deploy Again

**Steps:**
1. Click "Deploy Edge Function" again

**Expected:**
- [ ] Process repeats successfully
- [ ] No errors occur
- [ ] New test IDs are generated (different timestamps)
- [ ] Deployment log updates with new content
- [ ] Status badge remains green after completion

---

## Test Suite 2: Cloud Results Panel

### Test 2.1: Panel Appearance After Cloud Run

**Steps:**
1. Fill in form:
   - Deal ID: `TEST-CLOUD-001`
   - Customer URL: `https://example.com`
   - Fathom Window: "Last 30 days"
   - Organization: Select any
2. Click "Run in Cloud"

**Expected:**
- [ ] "Cloud Results" panel appears
- [ ] Panel has blue border (border-2 border-blue-500)
- [ ] Header shows 📄 FileText icon (blue)
- [ ] Title says "Cloud Results"
- [ ] Panel is auto-expanded (showCloudLog = true)
- [ ] Timestamp shown in description

---

### Test 2.2: Accepted Status Display

**Steps:**
1. Immediately after Cloud Run response

**Expected:**
- [ ] Header badge shows "Accepted" (blue)
- [ ] Status section shows:
  - [ ] ⏰ Clock icon (blue)
  - [ ] Text: "Accepted - Processing"
- [ ] Request ID is displayed
- [ ] Request ID format: `proposal-run-<timestamp>-<random>`
- [ ] Raw response visible in collapsible "View raw response"
- [ ] Toast notification: "Cloud run accepted successfully!"

---

### Test 2.3: Completed Status Display

**Steps:**
1. Modify backend response to return:
```json
{
  "status": "completed",
  "request_id": "proposal-run-12345-abc",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "finalOutput": "Test proposal summary with ROI analysis",
  "versionNumber": "v3",
  "dealLink": "https://app.valuedock.com/deals/TEST-CLOUD-001"
}
```
2. Run cloud run again

**Expected:**
- [ ] Header badge shows "Completed" (green)
- [ ] Status section shows:
  - [ ] ✅ CheckCircle2 icon (green)
  - [ ] Text: "Completed"
  - [ ] Green badge: "Proposal version saved to Supabase"
- [ ] Final Output section visible
  - [ ] Label: "Final Output"
  - [ ] Gray background box (bg-muted)
  - [ ] Text content matches backend response
- [ ] Version Number section visible
  - [ ] Label: "Version Number"
  - [ ] Font-mono styling
  - [ ] Value: "v3"
- [ ] Deal Link section visible
  - [ ] Label: "Deal Link"
  - [ ] Input field with URL (readonly)
  - [ ] "Open" button next to input
- [ ] Request ID still displayed
- [ ] Toast notification: "Proposal completed and saved!"

---

### Test 2.4: Deal Link Open Button

**Steps:**
1. With completed status showing
2. Click "Open" button next to Deal Link

**Expected:**
- [ ] New browser tab opens
- [ ] URL matches the dealLink from response
- [ ] Original tab remains on Proposal Agent page

---

### Test 2.5: Raw Response Collapsible

**Steps:**
1. Click "▸ View raw response"

**Expected:**
- [ ] Details section expands
- [ ] Shows full request and response JSON
- [ ] Syntax: `📤 Sending cloud run request...`
- [ ] Request JSON displayed
- [ ] Syntax: `📥 Response received:`
- [ ] Response JSON displayed
- [ ] ScrollArea with max height 200px
- [ ] Font-mono styling
- [ ] Background: bg-muted

---

### Test 2.6: Panel Collapse/Expand

**Steps:**
1. Click Cloud Results panel header

**Expected:**
- [ ] Panel collapses (content hidden)
- [ ] Chevron changes from ⌃ to ⌄
- [ ] Click header again - panel expands
- [ ] All content restored
- [ ] State persisted in showCloudLog

---

## Test Suite 3: Error Handling

### Test 3.1: Deployment Failure

**Steps:**
1. Modify backend to return error for deploy endpoint
2. Click "Deploy Edge Function"

**Expected:**
- [ ] Status changes to "Failed" (red badge)
- [ ] Log shows error message
- [ ] Button re-enabled after failure
- [ ] Toast notification: "Deployment error: <message>"
- [ ] Console logs error details

---

### Test 3.2: Cloud Run Failure

**Steps:**
1. Modify backend to return error for cloud run
2. Click "Run in Cloud"

**Expected:**
- [ ] Cloud Results panel appears
- [ ] Status badge shows error/status (red)
- [ ] Error message displayed
- [ ] Toast notification: "Cloud run failed or was rejected"
- [ ] Console logs error

---

### Test 3.3: Network Failure

**Steps:**
1. Block network (e.g., browser DevTools offline mode)
2. Try Deploy or Cloud Run

**Expected:**
- [ ] Error caught gracefully
- [ ] Toast shows error message
- [ ] No unhandled promise rejections
- [ ] UI remains functional

---

## Test Suite 4: Integration Tests

### Test 4.1: Multiple Cloud Runs

**Steps:**
1. Run cloud run 3 times with different Deal IDs

**Expected:**
- [ ] Cloud Results panel updates each time
- [ ] Request IDs are unique
- [ ] Timestamps increment
- [ ] No stale data from previous runs
- [ ] Each run tracked independently

---

### Test 4.2: Deploy Then Run

**Steps:**
1. Deploy edge function
2. Wait for "Deployment Verified"
3. Immediately run cloud run

**Expected:**
- [ ] Both panels visible simultaneously
- [ ] No UI conflicts
- [ ] Console panel stays verified
- [ ] Results panel shows new run
- [ ] Both collapsible independently

---

### Test 4.3: Toggle Off Then On

**Steps:**
1. Deploy and run successfully
2. Toggle "Run in Cloud" to OFF
3. Toggle back to ON

**Expected:**
- [ ] Panels are hidden when toggle OFF
- [ ] Regular buttons shown when OFF
- [ ] Panels reappear when toggle ON
- [ ] State preserved (deployment status, results)
- [ ] No errors in console

---

## Test Suite 5: UI/UX Tests

### Test 5.1: Visual Consistency

**Expected:**
- [ ] Cloud Console has purple border (#8b5cf6)
- [ ] Cloud Results has blue border (#3b82f6)
- [ ] Badges match semantic colors:
  - [ ] Blue for "Accepted"
  - [ ] Green for "Completed", "Verified"
  - [ ] Gray for "Deploying", "Testing"
  - [ ] Red for "Error", "Failed"
- [ ] Icons render at correct size (h-5 w-5)
- [ ] Spacing consistent (gap-2, gap-4)

---

### Test 5.2: Responsive Behavior

**Steps:**
1. Resize browser to mobile width (< 768px)
2. Test all features

**Expected:**
- [ ] Panels stack vertically
- [ ] Buttons remain full width
- [ ] Text wraps appropriately
- [ ] No horizontal scroll
- [ ] All content accessible

---

### Test 5.3: Accessibility

**Expected:**
- [ ] All buttons keyboard accessible
- [ ] Tab order logical
- [ ] Enter key works on collapsible headers
- [ ] Screen reader compatible
- [ ] Sufficient color contrast

---

## Test Suite 6: Backend Integration

### Test 6.1: Deploy Endpoint

**Test Request:**
```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-888f4514/deploy-edge-function \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"functionName":"proposal-agent-run"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Edge function 'proposal-agent-run' deployed successfully (simulated)",
  "functionName": "proposal-agent-run",
  "deployedAt": "2025-10-16T14:30:00.000Z",
  "note": "In production, this would execute: supabase functions deploy proposal-agent-run"
}
```

---

### Test 6.2: Cloud Run Endpoint

**Test Request:**
```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-888f4514/proposal-agent-run \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id":"test-tenant",
    "org_id":"test-org",
    "deal_id":"TEST-001",
    "customer_url":"https://example.com",
    "fathom_window":{"start":"2025-09-16","end":"2025-10-16"}
  }'
```

**Expected Response:**
```json
{
  "status": "accepted",
  "request_id": "proposal-run-...",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "Proposal agent run request accepted and queued"
}
```

---

## 📊 Test Results Summary

### Passing Criteria

**Cloud Run Console:**
- [ ] 6/6 deployment tests pass
- [ ] All status badges display correctly
- [ ] Log updates in real-time
- [ ] Error handling works

**Cloud Results:**
- [ ] 6/6 results tests pass
- [ ] All status states render correctly
- [ ] All fields display when present
- [ ] Collapsible works smoothly

**Integration:**
- [ ] 3/3 integration tests pass
- [ ] Panels work together
- [ ] Toggle behavior correct
- [ ] State management solid

**Backend:**
- [ ] 2/2 endpoint tests pass
- [ ] Proper authentication
- [ ] Correct response format
- [ ] Error handling complete

---

## 🐛 Known Issues & Workarounds

### Issue 1: Deploy is Simulated
**Description:** Backend doesn't actually deploy edge function  
**Workaround:** Manual deployment via CLI  
**Fix Priority:** Medium  
**Planned:** v2.1

### Issue 2: Status Polling
**Description:** No automatic status updates from accepted → completed  
**Workaround:** Manual refresh  
**Fix Priority:** High  
**Planned:** v2.2

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All Test Suite 1 tests pass (Deploy)
- [ ] All Test Suite 2 tests pass (Results)
- [ ] All Test Suite 3 tests pass (Errors)
- [ ] All Test Suite 4 tests pass (Integration)
- [ ] All Test Suite 5 tests pass (UI/UX)
- [ ] All Test Suite 6 tests pass (Backend)
- [ ] Documentation reviewed
- [ ] Code reviewed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility verified

---

**Test Version:** 2.0  
**Last Updated:** 2025-10-16  
**Total Tests:** 30+  
**Critical Tests:** 15  
**Pass Rate Required:** 100% (critical), 95% (all)
