# Cost Classification Fix - Verification Guide

## What Was Fixed

### Problem 1: Incomplete Savings Mapping (Fixed ✅)
The `savingsMap` in `calculations.ts` only included 12 of the 16 cost attributes shown in the Cost Classification UI.

**Missing attributes:**
- `laborCosts` (base FTE/labor savings)
- `turnoverCosts` (not currently tracked)
- `apiLicensing` (part of implementation costs)
- `slaPenalties` (not currently tracked)

**Fix Applied:**
- Updated `savingsMap` to include all 16 attributes
- Attributes not tracked as internal savings are mapped to `0`
- Added detailed comments explaining each attribute

### Problem 2: Labor Costs Always Hard (Fixed ✅)
The biggest issue was that **base labor savings** (`annualGrossSavings` from FTE reduction) were **always** classified as hard savings, regardless of the organization's cost classification setting.

**Fix Applied:**
- Added logic to check if `laborCosts` is in the hard or soft costs array
- Split labor savings into `laborSavingsHard` and `laborSavingsSoft`
- Applied the correct classification when calculating total hard/soft savings

### Enhanced Logging (Added ✅)
Added comprehensive console logging:
- Shows which costs are hard vs soft with dollar values
- Logs labor classification (hard or soft)
- Displays detailed breakdown of internal cost categorization

## Files Modified

1. **`/components/utils/calculations.ts`**
   - Updated `savingsMap` to include all 16 cost attributes (lines 770-792)
   - Added labor cost classification logic (lines 844-858)
   - Enhanced logging for debugging (lines 808-828, 859-867)
   - Updated rebuild marker to 2025-10-11-23-40

## How to Verify the Fix

### Step 1: Hard Refresh Browser
**CRITICAL**: You must hard refresh to clear the cache!
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Alternative**: Open incognito/private window

### Step 2: Navigate to Cost Classification
1. Sign in as Global Admin (admin@dockeryai.com)
2. Go to **Admin** tab
3. Click **Costs** sub-tab
4. Select "Test Tenant" in the tenant dropdown
5. Click "Test Organization" in the tree view

### Step 3: Set Up Test Classification
Configure the following as **HARD** costs:
- ✅ Direct Labor Costs (this is the key one to test!)
- ✅ Overtime Premiums
- ✅ Software Licensing
- ✅ Infrastructure

Leave these as **SOFT** costs:
- Training & Onboarding
- Shadow Systems
- Turnover & Attrition
- Error Remediation
- Audit & Compliance
- Downtime
- Decision Delays
- Staff Capacity Drag
- Customer Impact
- IT Support & Maintenance
- API Licensing
- SLA Penalties

Click **Save Classification**.

### Step 4: Create a Test Process
1. Go to **Global View** menu
2. Select "Test Tenant" → "Test Organization"
3. Go to **Inputs** tab
4. Create a new process with these values:
   - Name: "Classification Test"
   - FTE Count: 10
   - Task Volume: 5000
   - Check the selection checkbox
   - Set some internal costs (e.g., Decision Delays: 10%, Staff Capacity Drag: 5%)

### Step 5: Check Results & Console
1. Go to **Impact & ROI** tab
2. Scroll down to CFO Dashboard
3. Look at the **Hard Savings** and **Soft Savings** boxes

**Expected Results:**
- Hard Savings should include the base labor savings (from 10 FTEs)
- Console should show:
  ```
  [calculateProcessROI] Hard vs Soft breakdown: {
    laborSavingsHard: [large number],
    laborSavingsSoft: 0,
    totalHardSavings: [large number],
    totalSoftSavings: [smaller number],
    laborClassification: 'hard'
  }
  ```

### Step 6: Test Flipping Labor to Soft
1. Go back to **Admin → Costs**
2. Select "Test Organization"
3. **Move "Direct Labor Costs" from Hard to Soft**
4. Save
5. Go back to **Impact & ROI** tab

**Expected Results:**
- Hard Savings should now be MUCH smaller (only overtime, software, infrastructure)
- Soft Savings should now be MUCH larger (includes base labor)
- Console should show:
  ```
  [calculateProcessROI] Hard vs Soft breakdown: {
    laborSavingsHard: 0,
    laborSavingsSoft: [large number],
    totalHardSavings: [small number],
    totalSoftSavings: [large number],
    laborClassification: 'soft'
  }
  ```

## Console Logging Reference

### When Loading Cost Classification
```
[CostClassification] ✅ Loaded from server
[CostClassification] Hard costs count: 4
[CostClassification] Soft costs count: 12
[CostClassification] Hard costs: ["laborCosts", "overtimePremiums", "softwareLicensing", "infrastructureCosts"]
```

### When Calculating ROI
```
[calculateProcessROI] Opportunity cost savings: {
  processName: "Classification Test",
  decisionDelaySavings: 56000,
  staffCapacityDragSavings: 28000,
  customerImpactSavings: 0
}

[calculateProcessROI] Using custom cost classification: {
  hardCosts: ["laborCosts", "overtimePremiums", ...],
  softCosts: ["trainingOnboardingCosts", ...]
}

[calculateProcessROI] Cost categorization results: {
  processName: "Classification Test",
  totalInternalCostSavings: 84000,
  internalHardDollarSavings: 45000,
  internalSoftDollarSavings: 39000,
  hardCostDetails: { "overtimePremiums": 45000 },
  softCostDetails: { "decisionDelays": 56000, "staffCapacityDrag": 28000 }
}

[calculateProcessROI] Hard vs Soft breakdown: {
  laborSavingsHard: 560000,  // or 0 if labor is soft
  laborSavingsSoft: 0,        // or 560000 if labor is soft
  totalHardSavings: 605000,
  totalSoftSavings: 39000,
  laborClassification: 'hard'
}
```

## Troubleshooting

### Issue: Numbers Don't Change When Flipping Labor Cost
**Solution:**
1. Hard refresh the browser (Ctrl+Shift+R)
2. Check console for "[calculateProcessROI] Hard vs Soft breakdown" log
3. Verify `laborClassification` shows the correct value
4. If still not working, open browser dev tools and disable cache

### Issue: Console Shows "Using default cost classification"
**Problem:** Cost classification isn't being loaded
**Solution:**
1. Check that you selected an organization (not just a tenant)
2. Verify the cost classification was saved (check Admin → Costs)
3. Look for "[CostClassification] ✅ Loaded from server" in console
4. If not present, there may be an API issue

### Issue: Internal Costs Not Showing
**Problem:** Process doesn't have internal costs configured
**Solution:**
1. Click the gear icon on the process row
2. Scroll to "Internal Cost Analysis"
3. Set some percentages (e.g., Decision Delays: 10%)
4. Save and return to Impact & ROI

## Expected Behavior Summary

| Labor Classification | Hard Savings Includes | Soft Savings Includes |
|---------------------|----------------------|----------------------|
| **Hard** | Base labor + overtime + software + infrastructure + internal hard costs | Revenue uplift + compliance + attrition + internal soft costs |
| **Soft** | Overtime + software + infrastructure + internal hard costs | **Base labor** + revenue uplift + compliance + attrition + internal soft costs |

The key difference is where **base labor savings** (from FTE reduction) is counted!

## Technical Details

### The 16 Cost Attributes
1. **Direct Labor Costs** - Base FTE/labor savings (NEW - now respects classification)
2. Training & Onboarding - Internal cost savings
3. Overtime Premiums - Internal cost savings
4. Shadow Systems - Internal cost savings
5. Turnover & Attrition - Not tracked (maps to 0)
6. Software Licensing - Internal cost savings
7. Infrastructure - Internal cost savings
8. IT Support & Maintenance - Internal cost savings
9. API Licensing - Implementation cost (maps to 0)
10. Error Remediation - Internal cost savings
11. Audit & Compliance - Internal cost savings
12. Downtime - Internal cost savings
13. Decision Delays - Internal cost savings
14. Staff Capacity Drag - Internal cost savings
15. Customer Impact - Internal cost savings
16. SLA Penalties - Not tracked (maps to 0)

### Cost Flow
```
calculateProcessROI (per process)
  ↓
Calculates hardSavings and softSavings
  ↓
calculateROI (aggregates all processes)
  ↓
totalHardSavings = sum of all hardSavings
totalSoftSavings = sum of all softSavings
  ↓
CFOSummaryDashboard displays totals
```

## Success Criteria

✅ All 16 cost attributes are in the savingsMap  
✅ Labor costs classification is respected  
✅ Hard savings change dramatically when labor is moved between hard/soft  
✅ Console logging shows correct classification  
✅ CFO Dashboard displays accurate hard vs soft breakdown  
✅ No TypeScript errors or runtime warnings  

## Rebuild Marker

Current rebuild marker: `2025-10-11-23-40`

This ensures the browser knows the code has been updated and needs to be recompiled.
