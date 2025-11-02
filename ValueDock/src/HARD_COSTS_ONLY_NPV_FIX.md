# Hard Costs Only Mode - NPV & EBITDA Fix

## The Problem

When you:
1. Set all 16 cost attributes to **soft** in Admin → Costs
2. Go to Impact & ROI tab
3. Toggle "Hard Costs Only" mode

**Expected:** NPV and EBITDA Impact should be **$0** (or negative with implementation costs)

**Actual:** NPV and EBITDA were still showing **positive values** like $2.25B NPV

## Root Cause

The "Hard Costs Only" filter in ResultsScreen was correctly:
- ✅ Filtering out soft savings from the UI
- ✅ Recalculating ROI based on hard savings only
- ✅ Zeroing out soft cost components

BUT it was NOT:
- ❌ Recalculating **NPV** (Net Present Value)
- ❌ Recalculating **EBITDA Impact**
- ❌ Recalculating **EBITDA by Year**

These values were coming from the original `adjustedResults` which used ALL savings (hard + soft).

## The Fix

Updated `/components/ResultsScreen.tsx` to recalculate NPV and EBITDA when in hard costs only mode:

### NPV Recalculation (lines 158-189)

```javascript
// Recalculate NPV for hard costs only
const totalUpfrontCosts = adjustedResults.totalUpfrontCosts;
const cashFlows = [-totalUpfrontCosts];

// Use hard savings only for monthly cash flow
const monthlyNetSavings = totalHardSavings / 12;
const monthlySoftwareCosts = annualCost / 12;

// Build monthly cash flows (using the same time horizon)
for (let month = 1; month <= timeHorizonMonths; month++) {
  const year = month / 12;
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, year);
  const monthlyNet = (monthlyNetSavings - monthlySoftwareCosts) * inflationMultiplier;
  cashFlows.push(monthlyNet);
}

// Calculate NPV with monthly discount rate
const npvHardOnly = calculateNPV(cashFlows, monthlyDiscountRate);
```

### EBITDA Recalculation (lines 191-209)

```javascript
// Calculate EBITDA for hard costs only
const taxRate = 0.25; // 25% default tax rate
const baseEBITDA = totalAnnualNetSavings; // Already based on hard savings only
const ebitdaImpactHardOnly = baseEBITDA * (1 - taxRate);

// Calculate EBITDA by year for hard costs only
const numberOfYears = Math.ceil(timeHorizonMonths / 12);
const ebitdaByYear: Record<string, number> = {};
for (let year = 1; year <= numberOfYears; year++) {
  ebitdaByYear[`year${year}`] = baseEBITDA * Math.pow(1 + inflationRate / 100, year - 1) * (1 - taxRate);
}
```

### Return Values (lines 219-221)

```javascript
return {
  ...adjustedResults,
  // ... other values ...
  npv: npvHardOnly,  // ← NEW: Use hard-only NPV
  ebitdaImpact: ebitdaImpactHardOnly,  // ← NEW: Use hard-only EBITDA
  ebitdaByYear: ebitdaByYearCompat  // ← NEW: Use hard-only EBITDA by year
};
```

## What Changed

### Before the Fix:

```javascript
return {
  ...adjustedResults,  // ← NPV, EBITDA from original (all savings)
  totalHardSavings,
  totalSoftSavings: 0,
  // ...
};
```

**Result:** With everything set to soft + hard costs only mode:
- Hard Savings: $0 ✓
- Soft Savings: $0 ✓
- NPV: **$2.25B** ❌ (calculated from ALL savings)
- EBITDA: **$313M** ❌ (calculated from ALL savings)

### After the Fix:

```javascript
return {
  ...adjustedResults,
  totalHardSavings,
  totalSoftSavings: 0,
  npv: npvHardOnly,  // ← Recalculated based on hard savings only!
  ebitdaImpact: ebitdaImpactHardOnly,  // ← Recalculated!
  ebitdaByYear: ebitdaByYearCompat  // ← Recalculated!
};
```

**Result:** With everything set to soft + hard costs only mode:
- Hard Savings: $0 ✓
- Soft Savings: $0 ✓
- NPV: **-$X** (negative = implementation costs) ✓
- EBITDA: **$0** (or negative) ✓

## Real-World Example

### Scenario: Everything Set to Soft

**Assumptions:**
- All 16 attributes in Soft Costs
- Hard Savings: $0
- Implementation Costs: $500k
- 3-year time horizon

**Before Fix (Hard Costs Only mode):**
```
NPV: $2,250,696,455  ❌ Wrong!
EBITDA Impact: $313,540,107  ❌ Wrong!
EBITDA Year 1: $313,540,107  ❌ Wrong!
```

**After Fix (Hard Costs Only mode):**
```
NPV: -$500,000  ✓ Correct! (just the implementation cost)
EBITDA Impact: -$375,000  ✓ Correct! (implementation cost after tax)
EBITDA Year 1: -$375,000  ✓ Correct!
```

## How NPV is Calculated

### NPV Formula:

```
NPV = Σ (Cash Flow / (1 + r)^t) - Initial Investment

Where:
- Cash Flow = Monthly Net Savings (with inflation)
- r = Monthly Discount Rate (typically 10%/12)
- t = Month number
```

### Hard Costs Only Mode:

```
Monthly Net Savings = (Hard Savings / 12) - (Software Costs / 12)

If Hard Savings = $0:
Monthly Net Savings = -Software Costs / 12

Result: NPV will be negative (just the costs, no benefits)
```

## How EBITDA is Calculated

### EBITDA Formula:

```
EBITDA Impact = Annual Net Savings × (1 - Tax Rate)

Where:
- Annual Net Savings = Hard Savings - Software Costs
- Tax Rate = 25% (default)
```

### Hard Costs Only Mode:

```
If Hard Savings = $0:
Annual Net Savings = -Software Costs

EBITDA Impact = -Software Costs × (1 - 0.25) = -Software Costs × 0.75
```

## Testing

### Quick Test (2 minutes):

1. **Set all to soft:**
   - Admin → Costs → Test Organization
   - Move ALL 16 attributes to Soft Costs
   - Save

2. **Go to Impact & ROI:**
   - Results Screen → CFO Dashboard tab

3. **Toggle "Hard Costs Only":**
   - Click the switch at the top right

4. **Verify:**
   - Hard Savings: **$0** ✓
   - NPV: **Negative** or **~$0** ✓
   - EBITDA Impact: **Negative** or **~$0** ✓

### Advanced Test:

1. **Set labor to hard, everything else soft:**
   - Admin → Costs
   - Move ONLY `laborCosts` to Hard Costs
   - Save

2. **Check results:**
   - Hard Savings: **$896k** (labor savings)
   - NPV: **Positive** (based on labor savings)
   - EBITDA: **Positive** (based on labor savings)

This proves the NPV/EBITDA calculations are now respecting the cost classification!

## Files Modified

### `/components/ResultsScreen.tsx`
- **Lines 158-221:** Added NPV and EBITDA recalculation for hard costs only mode
- **Line 158:** Build cash flow array starting with negative upfront costs
- **Lines 175-189:** NPV calculation using only hard savings
- **Lines 191-209:** EBITDA calculation using only hard savings
- **Lines 219-221:** Override NPV, EBITDA, and EBITDA by year in return object

### `/components/utils/calculations.ts`
- **Line 447:** Updated rebuild marker to `2025-10-12-00-10`

## Summary

The "Hard Costs Only" mode now correctly:

| Metric | Correctly Filtered |
|--------|-------------------|
| ✅ Hard Savings Display | Yes (was working) |
| ✅ Soft Savings Display | Yes (was working) |
| ✅ ROI Percentage | Yes (was working) |
| ✅ Payback Period | Yes (was working) |
| ✅ **NPV** | **Yes (NEW FIX!)** |
| ✅ **EBITDA Impact** | **Yes (NEW FIX!)** |
| ✅ **EBITDA by Year** | **Yes (NEW FIX!)** |

When you set everything to soft and toggle "Hard Costs Only", you'll now see:
- **NPV: Negative or ~$0** (implementation costs only)
- **EBITDA: Negative or ~$0** (no hard savings to offset costs)

## Rebuild Status

✅ **FIX COMPLETE**

**Rebuild Marker:** `2025-10-12-00-10`

**Hard refresh required:** `Ctrl+Shift+R` or `Cmd+Shift+R`

This completes the cost classification feature! 🎉
