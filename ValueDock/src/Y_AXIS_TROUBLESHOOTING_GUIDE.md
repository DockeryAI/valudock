# Y-Axis Movement Troubleshooting Guide

## Issue: Bubbles Not Moving on Y-Axis When Costs/Timeline Change

This guide will help diagnose why bubbles may not be repositioning vertically on the Opportunity Matrix when you reduce costs and timeline.

---

## How Y-Axis Positioning Works

### Formula:
```javascript
Implementation Effort = (0.5 × Cost Score) + (0.3 × Time Score) + (0.20 × Complexity Score)
```

Where:
- **Cost Score** = Estimated Cost / Cost Anchor (default: $100,000)
- **Time Score** = Estimated Time (weeks) / Time Anchor (default: 6 months = ~26 weeks)
- **Complexity Score** = Complexity Index / 10

### Y-Axis Positioning:
```javascript
Y = 95% - (Implementation Effort / 1.0) * 90%
```

- **Effort 0%** → Y = 95% (bottom)
- **Effort 40%** → Y = 59% (threshold line)
- **Effort 100%** → Y = 5% (top)

---

## Step 1: Check Console Logs

When you update costs/timeline, look for these console logs:

### Expected Log Pattern:

```
🔍 [OpportunityMatrix] Matrix Calculation Starting (ABSOLUTE EFFORT MODEL)
  Cost Target (Anchor): $100,000
  Time Target (Anchor): 6 months

💰 Matrix Calculation for "Invoice Processing":
  Estimated Cost: $50,000 (vs. $100,000 target)
  Estimated Time: 12 weeks (2.8 months vs. 6 month target)
  Complexity Index: 5.0/10
  
💡 ABSOLUTE EFFORT CALCULATION:
   Estimated Cost: 50,000
   Cost Target: 100,000
   Cost Score: 50.0% (below target)
   Estimated Time: 12 weeks (2.8 months)
   Time Target: 6 months
   Time Score: 46.2% (below target)
   Complexity Index: 5.0/10
   Complexity Score: 50.0%
   
  Implementation Effort: 48.8% (Cost: 50%, Time: 30%, Complexity: 20%)

🎯 [Position] "Invoice Processing": ROI 400 → X=80%, Effort 48.8% → Y=51%
```

### What to Check:

1. **Do you see the logs?**
   - ✅ YES → Go to Step 2
   - ❌ NO → The matrix isn't recalculating (go to Step 3)

2. **Does the "Estimated Cost" match what you entered?**
   - ✅ YES → Go to Step 2
   - ❌ NO → Data not updating properly (go to Step 4)

3. **Does the "Implementation Effort" change when you reduce costs/timeline?**
   - ✅ YES → Calculation working, check rendering (go to Step 5)
   - ❌ NO → Anchors might be incorrect (go to Step 6)

---

## Step 2: Verify Effort Calculation

### Manual Calculation:

Let's say you have:
- **Original:** $100K cost, 12 weeks, complexity 5/10
- **Updated:** $10K cost, 2 weeks, complexity 5/10

**Original Effort:**
```
Cost Score: 100,000 / 100,000 = 1.0 (100%)
Time Score: (12 weeks / 4.33) / 6 months = 2.77 / 6 = 0.462 (46.2%)
Complexity: 5 / 10 = 0.5 (50%)

Effort = (0.5 × 1.0) + (0.3 × 0.462) + (0.2 × 0.5)
       = 0.5 + 0.139 + 0.1
       = 0.739 (73.9%)
```

**Updated Effort:**
```
Cost Score: 10,000 / 100,000 = 0.1 (10%)
Time Score: (2 weeks / 4.33) / 6 months = 0.462 / 6 = 0.077 (7.7%)
Complexity: 5 / 10 = 0.5 (50%)

Effort = (0.5 × 0.1) + (0.3 × 0.077) + (0.2 × 0.5)
       = 0.05 + 0.023 + 0.1
       = 0.173 (17.3%)
```

**Y-Axis Positions:**
- Original: Y = 95% - (0.739 × 90%) = 28.5% (high up = high effort)
- Updated: Y = 95% - (0.173 × 90%) = 79.4% (low down = low effort)

**Expected Bubble Movement:** Should move **DOWN** by ~51% (from 28.5% to 79.4%)

---

## Step 3: Matrix Not Recalculating

If you don't see console logs when changing costs/timeline:

### Possible Causes:

1. **Data not saving properly**
   - Changes to `ImplementationScreen` should call `onChange(newData)`
   - This triggers `handleInputChange` in App.tsx
   - Which calls `setInputData()`

2. **useMemo dependencies missing**
   - Check `/components/OpportunityMatrixNPV.tsx` line 218
   - Dependencies: `[data.processes, data.groups, data.globalDefaults.financialAssumptions, data.globalDefaults.effortAnchors, results.processResults, timeHorizonMonths]`

### Fix:
```bash
# Check if data is being saved
# Open browser console and type:
console.log('Current input data:', inputData);

# Make a change to costs
# Then check again:
console.log('Updated input data:', inputData);
```

If the data object reference hasn't changed, React won't trigger the useMemo recalculation.

---

## Step 4: Data Not Updating

If the console shows old values when you change costs/timeline:

### Check Implementation Screen:

1. Open `/components/ImplementationScreen.tsx`
2. Find the `updateImplementationCosts` function
3. It should call: `onChange({ ...data, processes: [...] })`

### Verify in Browser Console:

```javascript
// Before making a change
const before = { ...inputData };

// Make a change to upfront costs
// Then compare:
const after = { ...inputData };
console.log('Before:', before.processes[0].implementationCosts.upfrontCosts);
console.log('After:', after.processes[0].implementationCosts.upfrontCosts);
```

---

## Step 5: Calculation Working But Not Rendering

If the logs show correct values but bubbles don't move:

### Check SVG Positioning:

Open browser DevTools → Elements → Find the bubble element:

```html
<div style="left: 80%; top: 51%; transform: translate(-50%, -50%);">
  <!-- Process bubble -->
</div>
```

**What to Check:**
- Does the `top` value match the console log `Y=51%`?
- ✅ YES → Rendering is working
- ❌ NO → There's a rendering bug

### Force Re-render:

Try changing tabs and coming back to the Opportunity Matrix:
1. Click "Impact and ROI" tab
2. Click "Opportunity" tab again
3. Check if bubble moved

---

## Step 6: Check Effort Anchors

If effort calculations seem wrong:

### View Current Anchors:

1. Go to Admin panel
2. Click "Effort Anchors"
3. Check values:
   - **Cost Target:** Should be $100,000 (default)
   - **Time Target:** Should be 6 months (default)

### If Anchors Are Wrong:

The effort calculation is **relative to these anchors**. If someone changed them:
- Cost Target = $10,000 → Your $10K process = 100% cost effort
- Time Target = 1 month → Your 2-week process = 50% time effort

### Reset Anchors:

```
Cost Target: 100000
Time Target: 6
```

Then click "Save Anchors to Backend"

---

## Step 7: Verify Process Data Structure

Check that the process object has all required fields:

```javascript
// In browser console
const process = inputData.processes.find(p => p.name === "Invoice Processing");
console.log('Implementation Costs:', process.implementationCosts);
```

**Required Fields:**
```javascript
{
  upfrontCosts: 50000,
  trainingCosts: 5000,
  consultingCosts: 10000,
  softwareCost: 500,
  implementationTimelineMonths: 12, // ⚠️ Actually stores WEEKS (legacy)
  // ... other fields
}
```

**⚠️ CRITICAL:** The field name is `implementationTimelineMonths` but it **stores weeks**, not months!

---

## Step 8: Check Matrix Dependencies

The matrix uses `useMemo` with these dependencies:

```javascript
useMemo(() => {
  // ... calculation
}, [
  data.processes,                              // ← Changes when you update costs
  data.groups,
  data.globalDefaults.financialAssumptions,
  data.globalDefaults.effortAnchors,
  results.processResults,
  timeHorizonMonths
]);
```

### Test Dependency Triggering:

Add a debug log at the start of the useMemo:

```javascript
const matrixData = useMemo(() => {
  console.log('🔄 [OpportunityMatrix] useMemo triggered!');
  console.log('   Processes count:', data.processes.length);
  console.log('   First process costs:', data.processes[0]?.implementationCosts);
  // ... rest of calculation
}, [...]);
```

If you don't see "useMemo triggered!" when changing costs:
- The `data.processes` object reference isn't changing
- React doesn't detect the change
- useMemo won't recalculate

### Fix Object Reference Issue:

In `ImplementationScreen.tsx`, ensure onChange creates a NEW object:

```javascript
const updateImplementationCosts = (field, value) => {
  onChange({
    ...data,
    processes: data.processes.map(p => 
      p.id === process.id
        ? { ...p, implementationCosts: { ...p.implementationCosts, [field]: value } }
        : p
    )
  });
};
```

This creates a new array reference, triggering React re-renders.

---

## Step 9: Browser Cache Issues

Sometimes browser caching prevents updates:

### Clear and Refresh:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or use keyboard shortcut:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

---

## Quick Diagnostic Script

Paste this into your browser console to diagnose all at once:

```javascript
// Diagnostic Script - Paste in Browser Console
console.log('=== OPPORTUNITY MATRIX Y-AXIS DIAGNOSTIC ===\n');

// 1. Check input data
const invoice = inputData?.processes?.find(p => p.name.includes('Invoice'));
if (!invoice) {
  console.error('❌ No Invoice Processing process found');
} else {
  console.log('✅ Invoice Processing found');
  console.log('   Upfront Costs:', invoice.implementationCosts.upfrontCosts);
  console.log('   Timeline (weeks):', invoice.implementationCosts.implementationTimelineMonths);
  console.log('   Complexity Index:', invoice.complexityMetrics?.complexityIndex);
}

// 2. Check effort anchors
console.log('\n📊 Effort Anchors:');
console.log('   Cost Target:', inputData?.globalDefaults?.effortAnchors?.costTarget || 100000);
console.log('   Time Target:', inputData?.globalDefaults?.effortAnchors?.timeTarget || 6);

// 3. Manual effort calculation
if (invoice) {
  const costTarget = inputData?.globalDefaults?.effortAnchors?.costTarget || 100000;
  const timeTarget = inputData?.globalDefaults?.effortAnchors?.timeTarget || 6;
  const complexity = invoice.complexityMetrics?.complexityIndex || 0;
  
  const cost = invoice.implementationCosts.upfrontCosts +
               invoice.implementationCosts.trainingCosts +
               invoice.implementationCosts.consultingCosts +
               (invoice.implementationCosts.softwareCost * 12);
  
  const timeWeeks = invoice.implementationCosts.implementationTimelineMonths;
  const timeMonths = timeWeeks / 4.33;
  
  const costScore = cost / costTarget;
  const timeScore = timeMonths / timeTarget;
  const complexityScore = complexity / 10;
  
  const effort = (0.5 * costScore) + (0.3 * timeScore) + (0.2 * complexityScore);
  const effortPercent = Math.min(1.0, effort) * 100;
  
  console.log('\n💡 Manual Effort Calculation:');
  console.log('   Total Cost:', cost);
  console.log('   Cost Score:', (costScore * 100).toFixed(1) + '%');
  console.log('   Time (months):', timeMonths.toFixed(1));
  console.log('   Time Score:', (timeScore * 100).toFixed(1) + '%');
  console.log('   Complexity Score:', (complexityScore * 100).toFixed(1) + '%');
  console.log('   FINAL EFFORT:', effortPercent.toFixed(1) + '%');
  
  // Y-axis position
  const y = 95 - (Math.min(1.0, effort) * 90);
  console.log('   Expected Y Position:', y.toFixed(1) + '% from top');
}

console.log('\n=== END DIAGNOSTIC ===');
```

---

## Expected Behavior

### When You Reduce Costs Dramatically:

**Example: $100K → $10K**

1. Console shows new cost in logs
2. Cost Score drops: 100% → 10%
3. Implementation Effort drops: ~74% → ~17%
4. Bubble moves DOWN (from 28% → 79% from top)

### When You Reduce Timeline Dramatically:

**Example: 12 weeks → 2 weeks**

1. Console shows new timeline in logs
2. Time Score drops: 46% → 8%
3. Implementation Effort drops slightly (time is only 30% weight)
4. Bubble moves DOWN a bit

---

## Still Not Working?

If you've tried everything and bubbles still don't move:

### Share These Logs:

1. Open browser console
2. Clear console (Ctrl+L or Cmd+K)
3. Make a change to costs
4. Copy ALL console output
5. Share with developer

### Include:
- Screenshot of current bubble position
- Screenshot of Implementation screen with new costs
- Console logs showing calculations
- Effort Anchors settings from Admin panel

---

## Summary Checklist

- [ ] Console shows calculation logs when changing costs
- [ ] "Estimated Cost" in logs matches what you entered
- [ ] "Implementation Effort" changes when you update costs
- [ ] useMemo triggers (see "useMemo triggered!" log)
- [ ] Object reference changes (new array created on onChange)
- [ ] Effort anchors are set correctly ($100K, 6 months)
- [ ] Browser cache cleared
- [ ] Tried changing tabs and returning to Opportunity Matrix
- [ ] Verified process data structure is correct
- [ ] Ran diagnostic script and reviewed output

**Last Updated:** October 15, 2025
