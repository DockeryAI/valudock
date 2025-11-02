# 📝 Manual Transcript Upload - Visual Test Guide

## 🎯 5-Minute Visual Test

Quick verification of the manual transcript upload feature.

---

## ✅ Test 1: Card Visibility (30 seconds)

### Steps
1. Login as admin
2. Go to **Admin** → **Proposal Agent**
3. Click **"Edit Content"** on any proposal
4. Navigate to **Challenges & Goals** tab

### Expected Result
```
┌──────────────────────────────────────────────────────────┐
│ 📝 Upload Notes/Transcript            [Fallback]         │
│    Manually paste meeting notes or transcripts...        │
└──────────────────────────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Purple-bordered card visible
- [ ] Upload icon (📝) in header
- [ ] "Fallback" badge shows
- [ ] Description text clear
- [ ] Card appears AFTER AI Prompt alert
- [ ] Card appears BEFORE content textarea

---

## ✅ Test 2: Toggle Switch (1 minute)

### Steps
1. Locate "Use manual transcript" toggle
2. Note initial state (should be OFF)
3. Click toggle to turn ON
4. Click toggle to turn OFF
5. Click toggle to turn ON again

### Expected Result - OFF State
```
┌────────────────────────────────────┐
│ Use manual transcript     [OFF]    │
└────────────────────────────────────┘

(No textarea visible)

┌────────────────────────────────────┐
│ 🎤 API mode enabled.               │
│    Click "Fetch from Fathom" to    │
│    fetch from Fathom meetings      │
│    (last 30 days).                 │
└────────────────────────────────────┘
```

### Expected Result - ON State
```
┌────────────────────────────────────┐
│ Use manual transcript     [ON]     │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Transcript Text                    │
│ ┌────────────────────────────────┐ │
│ │ (Textarea appears here)        │ │
│ └────────────────────────────────┘ │
│ Paste your transcript above        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ℹ️ Manual mode enabled.             │
│    Click "Fetch from Fathom" to    │
│    process your transcript.        │
└────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Toggle starts in OFF state
- [ ] Clicking toggle switches to ON
- [ ] Textarea appears when ON
- [ ] Textarea disappears when OFF
- [ ] Status alert changes (API ↔ Manual)
- [ ] Smooth transition
- [ ] No console errors

---

## ✅ Test 3: Textarea Input (1 minute)

### Steps
1. Toggle to ON
2. Click in textarea
3. Type or paste sample text:
```
Customer has manual invoice processing.
500 invoices per month.

Goal: Reduce to 1 FTE.
Improve accuracy to 99%.
```

### Expected Result
```
┌────────────────────────────────────┐
│ Transcript Text                    │
│ ┌────────────────────────────────┐ │
│ │ Customer has manual invoice    │ │
│ │ processing.                    │ │
│ │ 500 invoices per month.        │ │
│ │                                │ │
│ │ Goal: Reduce to 1 FTE.         │ │
│ │ Improve accuracy to 99%.       │ │
│ └────────────────────────────────┘ │
│ 2 section(s) detected              │
└────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Textarea accepts input
- [ ] Text displays in monospace font
- [ ] Section counter updates dynamically
- [ ] Counter shows "2 section(s) detected"
- [ ] Placeholder disappears when typing
- [ ] No lag or performance issues

---

## ✅ Test 4: Section Counter (1 minute)

### Test 4A: No Text
**Input**: (empty)  
**Expected**: "Paste your transcript above"

### Test 4B: Single Section
**Input**:
```
This is one continuous section with no blank lines.
It should count as 1 section.
```
**Expected**: "1 section(s) detected"

### Test 4C: Two Sections
**Input**:
```
First section here.

Second section here.
```
**Expected**: "2 section(s) detected"

### Test 4D: Multiple Sections
**Input**:
```
Section one.

Section two.

Section three.

Section four.
```
**Expected**: "4 section(s) detected"

### Test 4E: Extra Blank Lines
**Input**:
```
Section one.



Section two.


Section three.
```
**Expected**: "3 section(s) detected" (ignores extra newlines)

**Pass Criteria**:
- [ ] Counter updates as you type
- [ ] Correct count for all test cases
- [ ] No errors in console
- [ ] Counter uses muted text color

---

## ✅ Test 5: Fetch Button Interaction (1.5 minutes)

### Test 5A: Manual Mode - Empty Textarea
**Steps**:
1. Toggle ON
2. Leave textarea empty
3. Click "Fetch from Fathom"

**Expected**:
- Error toast: "Please enter transcript text"
- Button re-enables immediately
- No API call made

### Test 5B: Manual Mode - With Text
**Steps**:
1. Toggle ON
2. Paste sample transcript
3. Click "Fetch from Fathom"

**Expected**:
```
Loading State:
[⟳ Fetching...] (disabled)

Success Toast:
"Processing manual transcript..."
(then)
"Challenges extracted from manual transcript!"

After Success:
- Content refreshes
- Textarea clears (empty)
- Button re-enables
```

### Test 5C: API Mode
**Steps**:
1. Toggle OFF
2. Click "Fetch from Fathom"

**Expected**:
```
Loading State:
[⟳ Fetching...] (disabled)

Success Toast:
"Fetching challenges from Fathom meetings..."
(then)
"Challenges updated from Fathom meetings!"

After Success:
- Content refreshes
- Button re-enables
```

**Pass Criteria**:
- [ ] Empty textarea shows error
- [ ] Loading spinner shows
- [ ] Button disables during fetch
- [ ] Correct toast for each mode
- [ ] Success clears textarea (manual mode)
- [ ] Content refreshes on success
- [ ] No console errors

---

## ✅ Test 6: Agent Tool Documentation (30 seconds)

### Steps
1. Scroll to "AI Prompt Reference" alert
2. Read the text

### Expected Result
```
┌──────────────────────────────────────────────────────────┐
│ ✨ AI Prompt: Based on Fathom meeting transcripts and    │
│    website analysis, extract and structure: 1) Top 3-5   │
│    key challenges the client faces...                    │
│                                                          │
│    Agent Tool: Agent prefers the tool fathom_fetch for   │
│    pulling call transcripts and extracting challenges/   │
│    goals via our Edge Function.                         │
└──────────────────────────────────────────────────────────┘
```

**Pass Criteria**:
- [ ] Alert appears above Upload card
- [ ] Sparkles icon visible
- [ ] "Agent Tool:" section visible
- [ ] `fathom_fetch` in code style
- [ ] Text wraps properly
- [ ] Readable on mobile

---

## ✅ Test 7: Visual Styling (1 minute)

### Elements to Check

#### Card
- [ ] Border: 2px solid purple (`border-purple-500`)
- [ ] Background: Light purple (`bg-purple-50`)
- [ ] Dark mode: Dark purple (`bg-purple-950`)

#### Upload Icon
- [ ] Color: Purple-600
- [ ] Size: 5x5 (h-5 w-5)
- [ ] Position: Before title

#### Fallback Badge
- [ ] Text: "Fallback"
- [ ] Variant: Outline
- [ ] Colors: Purple tones

#### Toggle Row
- [ ] White background (light mode)
- [ ] Border: Purple-200
- [ ] Rounded corners
- [ ] Padding: Adequate spacing

#### Textarea
- [ ] Min height: 200px
- [ ] Font: Monospace
- [ ] Text size: Small
- [ ] Border: Standard
- [ ] Disabled state: Gray

#### Section Counter
- [ ] Font size: xs
- [ ] Color: Muted foreground
- [ ] Position: Below textarea

#### Status Alerts
- [ ] Manual mode: Info alert
- [ ] API mode: Info alert  
- [ ] Mic icon (API mode)
- [ ] Info icon (Manual mode)

---

## ✅ Test 8: Responsive Design (1 minute)

### Desktop (≥1024px)
**Expected**:
- Full card width
- Textarea wide and readable
- Toggle aligned properly
- All elements visible

### Tablet (768-1023px)
**Expected**:
- Card still full width
- Textarea adjusts
- Toggle still horizontal
- No overflow

### Mobile (<768px)
**Expected**:
- Card stacks vertically
- Textarea full width
- Toggle stacks if needed
- Scrollable textarea
- Touch-friendly (44px+ targets)

**Pass Criteria**:
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] No horizontal scroll
- [ ] Touch targets adequate
- [ ] Text readable at all sizes

---

## ✅ Test 9: Dark Mode (30 seconds)

### Steps
1. Switch to dark mode (if available)
2. Check all visual elements

### Expected Changes
```
Card Background: bg-purple-950 (very dark purple)
Border: Still visible
Text: High contrast
Textarea: Dark background, light text
Toggle: Dark theme
Alerts: Dark backgrounds
```

**Pass Criteria**:
- [ ] Card visible in dark mode
- [ ] Purple accent still visible
- [ ] Text readable
- [ ] Textarea usable
- [ ] No white flashes
- [ ] Smooth transition

---

## ✅ Test 10: Integration Test (2 minutes)

### Full Workflow Test

**Steps**:
1. Navigate to Challenges & Goals
2. Toggle manual mode ON
3. Paste this sample:
```
Client processes 1000 invoices monthly.
Takes 5 FTEs full-time.
Error rate around 3%.

Goals:
- Reduce to 2 FTEs
- Under 1% errors
- Real-time reporting

Budget: $150K
Timeline: 6 months
```
4. Verify section count shows "3 section(s) detected"
5. Click "Fetch from Fathom"
6. Wait for success toast
7. Verify content refreshes
8. Verify textarea clears
9. Toggle back to API mode
10. Verify UI updates

**Pass Criteria**:
- [ ] All steps complete without errors
- [ ] Section count accurate (3)
- [ ] Loading state works
- [ ] Success toast appears
- [ ] Content updates visible
- [ ] Textarea clears
- [ ] Mode switch works
- [ ] No console errors

---

## 🐛 Common Issues & Fixes

### Issue 1: Section Counter Not Updating
**Symptom**: Count stays at 0 or doesn't change

**Check**:
- Is text actually being entered?
- Are there blank lines (double newlines)?
- Check browser console for errors

**Fix**: Ensure double newlines (`\n\n`) between sections

### Issue 2: Textarea Not Appearing
**Symptom**: Toggle ON but no textarea

**Check**:
- Is toggle actually ON (checked state)?
- Check React DevTools for state
- Look for conditional rendering errors

**Fix**: Verify `useManualTranscript` state is true

### Issue 3: Fetch Doesn't Work
**Symptom**: Button click does nothing

**Check**:
- Browser console for errors
- Network tab for API calls
- Is backend endpoint implemented?

**Fix**: Implement backend `/fathom-fetch` endpoint

### Issue 4: Content Doesn't Refresh
**Symptom**: Success toast but no content update

**Check**:
- Is `loadSections()` being called?
- Check API response
- Verify Supabase update

**Fix**: Ensure backend saves to Supabase correctly

---

## 📸 Screenshot Checklist

When documenting or reporting:

1. **Card Overview**
   - [ ] Full card with all elements
   - [ ] Purple border visible
   - [ ] Fallback badge visible

2. **Toggle States**
   - [ ] Toggle OFF (API mode)
   - [ ] Toggle ON (Manual mode)
   - [ ] Textarea visible (ON state)

3. **Text Input**
   - [ ] Textarea with sample text
   - [ ] Section counter showing count
   - [ ] Placeholder visible (empty state)

4. **Status Alerts**
   - [ ] API mode alert
   - [ ] Manual mode alert
   - [ ] Both side-by-side

5. **Loading State**
   - [ ] Button with spinner
   - [ ] Disabled textarea

6. **Dark Mode**
   - [ ] All elements in dark mode
   - [ ] Purple accents visible

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Card renders in Challenges & Goals tab
- [ ] Purple border and badge visible
- [ ] Toggle switches between modes
- [ ] Textarea appears/disappears correctly
- [ ] Section counter updates dynamically
- [ ] Fetch button works in both modes
- [ ] Loading states show
- [ ] Toast notifications appear
- [ ] Content refreshes on success
- [ ] Textarea clears after success (manual mode)
- [ ] Agent tool documentation visible

### Nice to Have
- [ ] Smooth animations
- [ ] Responsive on all devices
- [ ] Accessible keyboard navigation
- [ ] Dark mode support
- [ ] Character count display

### Must Not Have
- [ ] No console errors
- [ ] No visual glitches
- [ ] No broken layouts
- [ ] No unhandled exceptions

---

**Test Duration**: 5-10 minutes  
**Difficulty**: Easy  
**Prerequisites**: Admin access, proposal with content  
**Status**: ✅ Ready for testing
