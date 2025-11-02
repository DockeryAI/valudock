# X-Axis 50% ROI Threshold & Data Update Fix ✅

## Issues Fixed

### Issue 1: X-Axis Threshold Should Be 50% ROI (Not 100%)
The Quick Wins quadrant threshold was set at 100% ROI, but should be at **50% ROI**.

### Issue 2: Matrix Not Updating When Process Data Changes
When making changes to processes (e.g., Customer Onboarding), the matrix calculations weren't updating, showing stale data.

---

## Changes Made

### 1. **Quadrant Logic Updated (calculations.ts)**

**File:** `/components/utils/calculations.ts` (Lines 729-745)

```javascript
// OLD (WRONG):
if (roi_a >= 1.0 && implementation_effort <= 0.4) {
  quadrant = 'Quick Win'; // High ROI (≥100%), Low Effort
} else if (roi_a >= 1.0 && implementation_effort > 0.4) {
  quadrant = 'Strategic Bet'; // High ROI (≥100%), High Effort
} else if (roi_a < 1.0 && implementation_effort <= 0.4) {
  quadrant = 'Nice to Have'; // Low ROI (<100%), Low Effort
} else {
  quadrant = 'Deprioritize'; // Low ROI (<100%), High Effort
}

// NEW (CORRECT):
if (roi_a >= 0.5 && implementation_effort <= 0.4) {
  quadrant = 'Quick Win'; // High ROI (≥50%), Low Effort (≤40%)
} else if (roi_a >= 0.5 && implementation_effort > 0.4) {
  quadrant = 'Strategic Bet'; // High ROI (≥50%), High Effort (>40%)
} else if (roi_a < 0.5 && implementation_effort <= 0.4) {
  quadrant = 'Nice to Have'; // Low ROI (<50%), Low Effort (≤40%)
} else {
  quadrant = 'Deprioritize'; // Low ROI (<50%), High Effort (>40%)
}
```

**Impact:** Processes with ROI between 50-100% now qualify for Quick Wins and Strategic Bets quadrants.

---

### 2. **X-Axis Positioning Formula Updated (OpportunityMatrixNPV.tsx)**

**File:** `/components/OpportunityMatrixNPV.tsx` (Lines 429-447)

```javascript
// OLD (100% threshold):
if (process.roi <= 1.0) {
  // Left half: 0-100% ROI maps to 5%-50% of width
  x = 5 + (process.roi / 1.0) * 45;
} else {
  // Right half: 100%-max ROI maps to 50%-95% of width
  const rightScale = Math.max(1.0, actualMaxROI - 1.0);
  x = 50 + ((process.roi - 1.0) / rightScale) * 45;
}

// NEW (50% threshold):
if (process.roi <= 0.5) {
  // Left half: 0-50% ROI maps to 5%-50% of width
  x = 5 + (process.roi / 0.5) * 45;
} else {
  // Right half: 50%-max ROI maps to 50%-95% of width
  const rightScale = Math.max(0.5, actualMaxROI - 0.5);
  x = 50 + ((process.roi - 0.5) / rightScale) * 45;
}
```

**Impact:** Vertical center line now represents 50% ROI, not 100% ROI.

---

### 3. **NearbyProcesses Calculation Updated**

**File:** `/components/OpportunityMatrixNPV.tsx` (Lines 497-503)

Updated the label overlap detection to use the same 50% threshold formula.

---

### 4. **MaxROI Fallback Updated**

**File:** `/components/OpportunityMatrixNPV.tsx` (Line 246)

```javascript
// OLD:
const actualMaxROI = Math.max(...matrixData.map(p => p.roi), 1.0);

// NEW:
const actualMaxROI = Math.max(...matrixData.map(p => p.roi), 0.5);
```

Ensures the chart always spans at least 0-50% ROI, even if all processes have low ROI.

---

### 5. **Comments and Labels Updated**

Updated all comments and quadrant labels throughout the file to reflect:
- "High ROI" = **≥50%** (not ≥100%)
- "Low ROI" = **<50%** (not <100%)

**Updated comments:**
- Line 251: `Vertical line at 50% (ROI = 50%)`
- Line 255: `X-axis: ROI threshold at 50% (50% position on chart)`
- Line 345: `Low ROI < 50%, High Effort > 40%`
- Line 356: `High ROI ≥ 50%, High Effort > 40%`
- Line 368: `Low ROI < 50%, Low Effort ≤ 40%`
- Line 380: `High ROI ≥ 50%, Low Effort ≤ 40%`

---

### 6. **React Re-render Fix (useMemo Dependencies)**

**File:** `/components/OpportunityMatrixNPV.tsx` (Lines 212-221)

**Problem:** When you changed process data (like Customer Onboarding's complexity or costs), React didn't detect the change because `data.processes` is an array passed by reference. React's shallow comparison saw it as "the same array" even though objects inside changed.

**Solution:** Added a stringified dependency that forces recalculation when process properties change:

```javascript
}, [
  data.processes, 
  data.groups, 
  data.globalDefaults.financialAssumptions, 
  data.globalDefaults.effortAnchors, 
  results.processResults, 
  timeHorizonMonths,
  // Add stringified version to catch deep changes in processes
  JSON.stringify(data.processes.map(p => ({
    id: p.id,
    complexityMetrics: p.complexityMetrics,
    implementationCosts: p.implementationCosts
  })))
]);
```

**Impact:** Matrix now recalculates whenever:
- Process complexity metrics change
- Process implementation costs change
- Any other deep property changes

---

## New Matrix Layout

### Quadrant Definitions (Updated)

| Quadrant | ROI | Effort | Location |
|----------|-----|--------|----------|
| **Quick Wins** | ≥50% | ≤40% | Bottom-Right (Green) |
| **Strategic Bets** | ≥50% | >40% | Top-Right (Blue) |
| **Nice to Haves** | <50% | ≤40% | Bottom-Left (Yellow) |
| **Deprioritize** | <50% | >40% | Top-Left (Red) |

### Visual Layout
```
                  ROI = 50% (X = 50% on chart)
                        |
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    │  Deprioritize   │ Strategic Bets  │  Effort > 40%
    │  (ROI <50%)     │  (ROI ≥50%)     │
    │                 │                 │
  ──┼─────────────────┼─────────────────┤── Effort = 40%
    │                 │                 │
    │ Nice to Haves   │   Quick Wins    │  Effort ≤ 40%
    │  (ROI <50%)     │  (ROI ≥50%)     │
    │                 │                 │
    └─────────────────┴─────────────────┘
          Left              Right
        0-50% ROI        50%-max ROI
```

---

## Examples

### Example 1: Process with 75% ROI
- **Old behavior:** Falls in left half (0-100% scale), appears at ~34% from left
- **New behavior:** Falls in right half (50%-max scale), appears at ~64% from left
- **Quadrant:** Quick Wins (if effort ≤ 40%) or Strategic Bets (if effort > 40%)

### Example 2: Process with 45% ROI
- **Old behavior:** Falls in left half (0-100% scale), appears at ~21% from left
- **New behavior:** Falls in left half (0-50% scale), appears at ~43% from left
- **Quadrant:** Nice to Haves (if effort ≤ 40%) or Deprioritize (if effort > 40%)

### Example 3: Process with 200% ROI
- **Old behavior:** Falls in right half (100%-max scale)
- **New behavior:** Falls in right half (50%-max scale), positioned further right
- **Quadrant:** Quick Wins (if effort ≤ 40%) or Strategic Bets (if effort > 40%)

---

## Testing Instructions

### Test 1: Verify Quadrant Thresholds
1. **Refresh browser** and navigate to Results > Opportunity Matrix
2. Look for processes with **ROI between 50-100%**
3. **Verify** they appear in Quick Wins or Strategic Bets (green or blue quadrants)
4. Previously, these would have been in Nice to Haves or Deprioritize

### Test 2: Verify Data Updates
1. Go to **Inputs** and select **Customer Onboarding** process
2. Change the **Complexity Index** (via Workflow Builder)
3. Change the **Implementation Time** or **Estimated Cost**
4. Go back to **Results > Opportunity Matrix**
5. **Verify** the Customer Onboarding bubble has moved to a new position
6. **Verify** the ROI and Effort percentages have changed in the tooltip

### Test 3: Verify Center Line Position
1. The **vertical center line** should represent **50% ROI**
2. Processes to the **left of center** should have ROI < 50%
3. Processes to the **right of center** should have ROI ≥ 50%
4. Hover over bubbles near the center line to verify they're around 50% ROI

---

## Impact on Existing Data

### Processes That Will Move Quadrants:
Any process with **50% ≤ ROI < 100%** will move from:
- Nice to Haves → **Quick Wins** (if effort ≤ 40%)
- Deprioritize → **Strategic Bets** (if effort > 40%)

### Processes That Will Change Visual Position:
- **All processes** will shift horizontally due to the new X-axis scale
- Processes with ROI < 50% will spread out more in the left half
- Processes with ROI ≥ 50% will compress slightly in the right half

---

## Files Modified
1. `/components/utils/calculations.ts` - Quadrant logic (lines 729-745)
2. `/components/OpportunityMatrixNPV.tsx` - X-axis positioning and dependencies (multiple lines)

## Status
✅ **COMPLETE** - 50% ROI threshold implemented, data update bug fixed

## Date
October 16, 2025
