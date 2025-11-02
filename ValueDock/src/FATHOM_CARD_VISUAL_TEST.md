# 🎤 Fathom Integration Card - Visual Test Guide

## 🎯 5-Minute Visual Test

### Prerequisites
- Admin account (Master Admin, Tenant Admin, or Org Admin)
- Browser with date picker support
- Proposal Agent access

---

## ✅ Test 1: Card Visibility (30 seconds)

### Steps
1. Login as admin
2. Click **Admin** tab
3. Click **Agent** sub-tab
4. Look for **Agent Runner** tab content

### Expected Result
```
┌────────────────────────────────────┐
│ 🎤 Fathom Integration              │ ← Blue border
└────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Card visible in right column
- [ ] Blue border (2px solid)
- [ ] Microphone icon (🎤) in header
- [ ] "Fathom Integration" title

---

## ✅ Test 2: API Status Badge (15 seconds)

### Steps
1. Locate green badge inside card
2. Read badge text

### Expected Result
```
┌──────────────────────────────────────┐
│ API Status: [Connected ✅] (stub-ok) │
└──────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Green badge visible
- [ ] Text: "Connected ✅"
- [ ] Checkmark emoji present
- [ ] "(stub-ok)" label after badge

---

## ✅ Test 3: Date Pickers (1 minute)

### Steps
1. Click on **Start Date** input
2. Verify calendar opens
3. Select a date
4. Click on **End Date** input
5. Verify calendar opens
6. Select a date after start date

### Expected Result
```
Start Date: [2025-01-01] ← Native calendar picker
End Date:   [2025-01-31] ← Native calendar picker
```

**Pass Criteria**:
- [ ] Start Date input shows calendar on click
- [ ] Selected date displays in format YYYY-MM-DD
- [ ] End Date input shows calendar on click
- [ ] Selected date displays correctly
- [ ] Both inputs have proper labels

---

## ✅ Test 4: Tag Filter (30 seconds)

### Steps
1. Click on **Tag Filter** input
2. Type "sales"
3. Verify text appears

### Expected Result
```
🏷️ Tag Filter
[sales]
Optional: Filter meetings by tag (leave empty for all)
```

**Pass Criteria**:
- [ ] Tag icon (🏷️) in label
- [ ] Input accepts text
- [ ] Placeholder visible when empty: "e.g., sales, discovery"
- [ ] Help text visible below: "Optional: Filter meetings by tag..."

---

## ✅ Test 5: Button States (2 minutes)

### Test 5A: Disabled State
**Steps**: Clear both dates

**Expected**:
```
[Test Fetch] ← Grayed out, not clickable
```

**Pass Criteria**:
- [ ] Button appears disabled (gray)
- [ ] Cursor shows "not-allowed"
- [ ] Click does nothing

### Test 5B: Enabled State
**Steps**: Fill both dates

**Expected**:
```
[🧪 Test Fetch] ← Blue, clickable
```

**Pass Criteria**:
- [ ] Button appears enabled (blue)
- [ ] Beaker icon visible
- [ ] Cursor shows pointer
- [ ] Hover effect visible

### Test 5C: Loading State
**Steps**: Click Test Fetch (with backend ready)

**Expected**:
```
[⟳ Fetching...] ← Spinner animation
```

**Pass Criteria**:
- [ ] Button shows spinner
- [ ] Text changes to "Fetching..."
- [ ] Button disabled during fetch
- [ ] Spinner animates (rotates)

---

## ✅ Test 6: JSON Response Viewer (1 minute)

### Steps
1. Fill start date: Today - 30 days
2. Fill end date: Today
3. Click Test Fetch
4. Wait for response

### Expected Result
```
Response:
┌────────────────────────────────┐
│ {                              │
│   "success": true,             │
│   "meetings": [...],           │
│   "count": 5                   │
│ }                              │
└────────────────────────────────┘
Found 5 meetings
```

**Pass Criteria**:
- [ ] "Response:" label appears
- [ ] Bordered box with JSON content
- [ ] JSON is pretty-printed (2-space indent)
- [ ] Monospace font
- [ ] Scrollable if content too long
- [ ] Meeting count summary below

---

## ✅ Test 7: Toast Notifications (30 seconds)

### Test 7A: Start Notification
**Steps**: Click Test Fetch

**Expected**: Toast appears: "Fetching Fathom transcripts..."

**Pass Criteria**:
- [ ] Toast visible in top-right
- [ ] Blue info icon
- [ ] Message correct

### Test 7B: Success Notification
**Steps**: Wait for response

**Expected**: Toast appears: "Fetched 5 meetings"

**Pass Criteria**:
- [ ] Toast visible in top-right
- [ ] Green checkmark icon
- [ ] Meeting count in message

### Test 7C: Error Notification
**Steps**: Trigger error (e.g., backend down)

**Expected**: Toast appears: "Fathom fetch failed: [error]"

**Pass Criteria**:
- [ ] Toast visible in top-right
- [ ] Red X icon
- [ ] Error message displayed

---

## ✅ Test 8: Responsive Design (1 minute)

### Test 8A: Desktop (≥1024px)
**Steps**: Resize browser to full width

**Expected**:
```
┌──────────────┬──────────────┐
│ Agent Config │ Fathom Card  │
└──────────────┴──────────────┘
```

**Pass Criteria**:
- [ ] Card in right column
- [ ] Side-by-side layout
- [ ] Adequate spacing

### Test 8B: Mobile (<768px)
**Steps**: Resize browser to 375px width

**Expected**:
```
┌──────────────┐
│ Agent Config │
└──────────────┘
┌──────────────┐
│ Fathom Card  │
└──────────────┘
```

**Pass Criteria**:
- [ ] Card stacks vertically
- [ ] Full width card
- [ ] All fields readable
- [ ] Button full width

---

## ✅ Test 9: Field Interaction (1 minute)

### Steps
1. Click Start Date → Select date
2. Click End Date → Select date
3. Click Tag Filter → Type text
4. Tab through fields
5. Clear all fields
6. Refill all fields

### Expected Result
- All fields interactive
- Tab order logical: Start → End → Tag → Button
- Clear button works on date fields
- Text input accepts keyboard

**Pass Criteria**:
- [ ] Tab key navigation works
- [ ] Date fields clearable
- [ ] Tag field clearable
- [ ] No visual glitches
- [ ] Focus states visible

---

## ✅ Test 10: Error Handling (1 minute)

### Test 10A: Missing Backend
**Steps**: Test Fetch with backend down

**Expected**:
```json
{
  "error": "Network request failed"
}
```

**Pass Criteria**:
- [ ] Error shown in JSON viewer
- [ ] Error toast appears
- [ ] Button re-enables
- [ ] No crash

### Test 10B: Invalid Response
**Steps**: Backend returns invalid JSON

**Expected**: Error handling catches issue

**Pass Criteria**:
- [ ] Error message displayed
- [ ] App doesn't crash
- [ ] User can retry

---

## 📊 Test Summary Checklist

### Visual Elements
- [ ] Card border blue (2px)
- [ ] Mic icon in header
- [ ] API status badge green
- [ ] Date pickers native style
- [ ] Tag icon in label
- [ ] Beaker icon in button
- [ ] JSON viewer monospace

### Functional Elements
- [ ] Start date selectable
- [ ] End date selectable
- [ ] Tag filter accepts text
- [ ] Button disables without dates
- [ ] Button shows loading
- [ ] JSON response displays
- [ ] Meeting count shows
- [ ] Toast notifications work

### Responsive Elements
- [ ] Desktop layout correct
- [ ] Mobile layout stacks
- [ ] Touch targets adequate
- [ ] All text readable

### Accessibility
- [ ] Labels present on all inputs
- [ ] Focus states visible
- [ ] Tab order logical
- [ ] Screen reader friendly
- [ ] Error messages clear

---

## 🐛 Common Visual Issues

### Issue: Card Not Visible
**Check**:
- Logged in as admin?
- On Agent tab?
- In Agent Runner section?
- Scrolled down?

### Issue: Dates Not Selectable
**Check**:
- Browser supports HTML5 date input?
- Try Chrome/Edge/Safari (best support)
- Firefox may have different UI

### Issue: Button Always Disabled
**Check**:
- Both dates filled?
- Dates in YYYY-MM-DD format?
- No browser errors in console?

### Issue: JSON Not Showing
**Check**:
- Backend endpoint exists?
- Network request succeeded?
- Response is valid JSON?
- ScrollArea rendering?

---

## 🎨 Visual Comparison

### ✅ Correct Layout
```
┌────────────────────────────────────────┐
│ 🎤 Fathom Integration    [Blue border] │
├────────────────────────────────────────┤
│ [Green badge: Connected ✅] (stub-ok)  │
│                                        │
│ Start Date:                            │
│ [2025-01-01] ← Calendar icon           │
│                                        │
│ End Date:                              │
│ [2025-01-31] ← Calendar icon           │
│                                        │
│ 🏷️ Tag Filter:                         │
│ [sales]                                │
│ Help text here...                      │
│                                        │
│ [🧪 Test Fetch] ← Full width, blue    │
│                                        │
│ Response: ← Only when result exists    │
│ [JSON here...]                         │
└────────────────────────────────────────┘
```

### ❌ Incorrect Layout
```
┌────────────────────────────────────────┐
│ Fathom Integration ← No icon/color     │
├────────────────────────────────────────┤
│ Connected ← No badge                   │
│ Start: [____] End: [____] ← No labels  │
│ Tag: [____]                            │
│ [Test] ← Too small                     │
│ {JSON} ← Always visible                │
└────────────────────────────────────────┘
```

---

## 📸 Screenshot Checklist

When documenting or reporting issues, capture:

1. **Full Card View**
   - Entire card with all fields
   - Border visible
   - All labels readable

2. **Date Picker Open**
   - Calendar UI visible
   - Selected date highlighted
   - Month/year navigation

3. **JSON Response**
   - Complete response
   - Formatting visible
   - Scroll indicator if truncated

4. **Loading State**
   - Button with spinner
   - Disabled fields
   - Any progress indicators

5. **Error State**
   - Error message in JSON
   - Toast notification
   - Field states

---

## ✅ Final Acceptance Criteria

### Must Have ✅
- [ ] Card renders in Admin → Agent → Agent Runner
- [ ] Blue border visible
- [ ] API status shows "Connected ✅"
- [ ] Both date pickers functional
- [ ] Tag filter accepts input
- [ ] Test Fetch button works
- [ ] JSON response displays
- [ ] Meeting count summary shows
- [ ] Toast notifications appear
- [ ] Loading states work

### Nice to Have ⭐
- [ ] Smooth animations
- [ ] Hover effects
- [ ] Focus indicators
- [ ] Responsive layout
- [ ] Clear error messages

### Must Not Have ❌
- [ ] No console errors
- [ ] No visual glitches
- [ ] No unhandled exceptions
- [ ] No accessibility issues
- [ ] No broken layouts

---

**Test Duration**: 5-10 minutes  
**Difficulty**: Easy  
**Tools Needed**: Browser, admin account  
**Status**: ✅ Ready for visual testing
