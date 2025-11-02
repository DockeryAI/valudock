# 🧪 Quick Test: ROI Server Pill & Calculated Badge

## 🎯 5-Minute Visual Test

### Test 1: Server Pill Visibility ✅

**Steps**:
1. Navigate to **Admin** → **Proposal Agent**
2. Select any deal with a proposal
3. Click **"Edit Content"** on a proposal version
4. Navigate to **ROI Summary** tab

**Expected Result**:
```
┌────────────────────────────────────────────────────────┐
│ 💵 Quick Stats [Server] ℹ️              [Recalculate] │
└────────────────────────────────────────────────────────┘
```

**Check**:
- [ ] "Server" pill displays next to "Quick Stats" title
- [ ] Pill has blue background (light mode) or blue-900 (dark mode)
- [ ] Text is legible and properly colored
- [ ] Pill is inline with title (not wrapped)

---

### Test 2: Calculated Badge Appearance ✅

**Scenario A: With ROI Data**

**Steps**:
1. Ensure deal has ROI stats in database
2. Open Proposal Content Builder
3. Look at the tab bar

**Expected Result**:
```
┌────────────────────────────────────────────────────────┐
│  [📄]  [🎯]  [💵 ROI Summary ✓ Calculated]  [💡]  [✅]│
└────────────────────────────────────────────────────────┘
```

**Check**:
- [ ] Green "Calculated" badge appears on ROI Summary tab
- [ ] Badge says "Calculated" (not just an icon)
- [ ] Badge is visible and readable
- [ ] Badge does NOT appear on other tabs

**Scenario B: Without ROI Data**

**Steps**:
1. Use a deal without ROI stats
2. Open Proposal Content Builder
3. Look at the tab bar

**Expected Result**:
```
┌────────────────────────────────────────────────────────┐
│  [📄]  [🎯]  [💵 ROI Summary]  [💡]  [✅]              │
└────────────────────────────────────────────────────────┘
```

**Check**:
- [ ] NO "Calculated" badge on ROI Summary tab
- [ ] Only "✓" badge appears if content manually edited
- [ ] Tab is still clickable and functional

---

### Test 3: Status: Completed Immediate Display ✅

**Steps**:
1. Open browser **DevTools** → **Network** tab
2. Open Proposal Content Builder (ROI Summary tab)
3. Watch the network call to `/proposal-roi/quick-stats`
4. Check the response body

**Expected Response**:
```json
{
  "status": "completed",
  "stats": {
    "annual_savings": 450000,
    "payback_months": 8.5,
    "before_cost": 100000,
    "after_cost": 50000,
    "upfront_investment": 75000,
    "ongoing_investment": 25000
  }
}
```

**Check**:
- [ ] Response includes `"status": "completed"`
- [ ] Values display in UI **immediately** (no loading spinner)
- [ ] Console shows: `✅ ROI Quick Stats loaded (status: completed)`
- [ ] Green "Calculated" badge appears on tab

---

### Test 4: Recalculate with Immediate Stats ✅

**Steps**:
1. In ROI Summary tab, scroll to Quick Stats card
2. Click **[Recalculate]** button
3. Watch for toast notification
4. Watch for value updates

**Expected Flow**:
1. Toast: "Recalculating ROI..."
2. Button changes to "⟳ Calculating..."
3. API call to `/proposal-roi/recalculate` completes
4. **If `status: 'completed'` in response**:
   - Values update **immediately**
   - No loading spinner shown
   - Toast: "ROI recalculated successfully!"
5. **If only `success: true` in response**:
   - Secondary call to `/proposal-roi/quick-stats`
   - Brief loading spinner
   - Values update
   - Toast: "ROI recalculated successfully!"

**Check**:
- [ ] Recalculate button is disabled during loading
- [ ] Loading spinner shows on button
- [ ] Values update (numbers change)
- [ ] Success toast appears
- [ ] Console logs show correct status detection

---

### Test 5: All Metrics Display ✅

**Location**: ROI Summary tab → Quick Stats card

**Expected Metrics**:

| Metric | Icon | Example Value | Color |
|--------|------|---------------|-------|
| Annual Savings | 📈 | $450,000 | Green (#10B981) |
| Payback Period | 📉 | 8.5 months | Blue (#3B82F6) |
| Before → After | → | $100,000 → $50,000 | Orange (#F97316) |
| Investment (Upfront) | 💵 | Upfront: $75,000 | Purple (#9333EA) |
| Investment (Ongoing) | 💵 | Ongoing: $25,000/yr | Purple (#9333EA) |

**Check**:
- [ ] All 5 metrics display correctly
- [ ] Currency formatting includes commas ($450,000)
- [ ] Payback shows 1 decimal place (8.5)
- [ ] Before cost has strikethrough styling
- [ ] Arrow icon shows between before/after
- [ ] Investment split across two lines

---

### Test 6: Tooltip Information ✅

**Steps**:
1. Hover over the **ℹ️ Info icon** next to "Quick Stats (Server)"
2. Read tooltip content

**Expected Tooltip**:
```
┌─────────────────────────────────────────┐
│ Computed server-side via                │
│ roi_quick_stats()                       │
└─────────────────────────────────────────┘
```

**Check**:
- [ ] Tooltip appears on hover
- [ ] Text is readable
- [ ] Tooltip disappears when mouse moves away
- [ ] Tooltip positioning is correct (not cut off)

---

### Test 7: Responsive Design ✅

**Desktop (≥768px)**:
```
┌────────────────────────────────────────────────────────┐
│ 💵 Quick Stats [Server] ℹ️              [Recalculate] │
├────────────────────────────────────────────────────────┤
│  [📈 $450K]      [📉 8.5 mo]                          │
│  [→ $100K→$50K]  [💵 $75K/$25K]                       │
└────────────────────────────────────────────────────────┘
```

**Check**:
- [ ] 2×2 grid layout
- [ ] All content fits on screen
- [ ] No horizontal scrolling
- [ ] Adequate spacing between metrics

**Mobile (<768px)**:
1. Resize browser to mobile width (375px)
2. Or use DevTools device emulation (iPhone 12)

**Expected**:
```
┌────────────────────────┐
│ 💵 Quick Stats         │
│ [Server] ℹ️            │
│ [Recalculate]         │
├────────────────────────┤
│ 📈 Annual Savings     │
│ $450,000              │
├────────────────────────┤
│ 📉 Payback Period     │
│ 8.5 months            │
├────────────────────────┤
│ → Before → After      │
│ $100K → $50K          │
├────────────────────────┤
│ 💵 Investment         │
│ Upfront: $75K         │
│ Ongoing: $25K/yr      │
└────────────────────────┘
```

**Check**:
- [ ] Metrics stack vertically (1 column)
- [ ] Server pill wraps to new line if needed
- [ ] Recalculate button full width
- [ ] All text is readable
- [ ] Touch targets are adequate (44×44px)

---

### Test 8: Dark Mode Compatibility ✅

**Steps**:
1. Toggle dark mode (if available in app)
2. Navigate to ROI Summary tab
3. Check all visual elements

**Expected Dark Mode Colors**:
- Card background: Blue-950
- Server pill background: Blue-900
- Server pill text: Blue-300
- Server pill border: Blue-700
- Metric cards: Blue-900
- "Calculated" badge: Green-600 (same as light mode)

**Check**:
- [ ] All elements visible in dark mode
- [ ] Text has adequate contrast
- [ ] Colors match design system
- [ ] No invisible or barely visible elements

---

### Test 9: Error States ✅

**Scenario A: API Error**

**Steps**:
1. Simulate API error (e.g., invalid deal ID)
2. Open Proposal Content Builder
3. Navigate to ROI Summary tab

**Expected Result**:
- [ ] No crash or error modal
- [ ] Empty state message (or no stats shown)
- [ ] Recalculate button still functional
- [ ] No "Calculated" badge on tab

**Scenario B: Network Timeout**

**Steps**:
1. Throttle network in DevTools (slow 3G)
2. Click Recalculate button
3. Wait for timeout

**Expected Result**:
- [ ] Loading spinner shows
- [ ] Eventually times out gracefully
- [ ] Error toast appears
- [ ] Button re-enables for retry

---

### Test 10: Multiple Tabs Switching ✅

**Steps**:
1. Open ROI Summary tab
2. Verify "Calculated" badge appears
3. Switch to "Overview" tab
4. Switch back to "ROI Summary" tab

**Expected Result**:
- [ ] "Calculated" badge persists after tab switch
- [ ] Stats remain loaded (no re-fetch)
- [ ] Server pill still visible
- [ ] No layout shift or flicker

---

## 🐛 Common Issues & Solutions

### Issue 1: "Calculated" Badge Not Showing

**Symptoms**: Tab shows no green badge even with data

**Check**:
1. Open browser console
2. Look for: `✅ ROI Quick Stats loaded`
3. Verify `roiQuickStats` state is not null

**Fix**: 
- Ensure API returns valid stats object
- Check `response.stats` is not empty
- Verify state update in React DevTools

### Issue 2: Server Pill Missing

**Symptoms**: "Quick Stats" title shows but no [Server] pill

**Check**:
1. Inspect element in DevTools
2. Look for `<Badge>` element with "Server" text

**Fix**:
- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Verify Badge component import

### Issue 3: Values Not Updating Immediately

**Symptoms**: Loading spinner shows even with `status: 'completed'`

**Check**:
1. Network tab → Response body
2. Verify response includes `"status": "completed"`
3. Check console for: `✅ ROI Quick Stats loaded (status: completed)`

**Fix**:
- Backend must return `status: 'completed'` in response
- Update API endpoint to include status field
- Verify response structure matches expected format

### Issue 4: Recalculate Button Stuck

**Symptoms**: Button shows "Calculating..." forever

**Check**:
1. Network tab → Look for failed requests
2. Console → Check for errors

**Fix**:
- Ensure API endpoint is reachable
- Check for CORS or auth issues
- Verify `finally` block executes (sets loading to false)

---

## ✅ Quick Checklist

**Before marking complete, verify**:

- [ ] Server pill displays with blue styling
- [ ] Calculated badge appears when data exists
- [ ] Calculated badge does NOT appear without data
- [ ] Status: completed response handled correctly
- [ ] Values display immediately (no extra loading)
- [ ] All 5 metrics show correctly
- [ ] Recalculate button works
- [ ] Toast notifications appear
- [ ] Tooltip displays on info icon
- [ ] Responsive on mobile and desktop
- [ ] Dark mode works correctly
- [ ] Console logs show correct detection
- [ ] No errors in browser console

---

## 🎯 Success Criteria

| Criterion | Pass? |
|-----------|-------|
| Server pill visible | ⬜ |
| Calculated badge appears with data | ⬜ |
| Calculated badge hidden without data | ⬜ |
| Status: completed immediate display | ⬜ |
| All metrics display correctly | ⬜ |
| Recalculate works | ⬜ |
| Responsive design | ⬜ |
| Dark mode compatible | ⬜ |
| Error handling graceful | ⬜ |
| No console errors | ⬜ |

---

**Test Duration**: 5-10 minutes  
**Difficulty**: Easy  
**Prerequisites**: Deal with proposal data in system  
**Status**: Ready for QA ✅
