# Absolute Effort Calculation Implementation - Complete Guide

## Overview

ValueDock has been upgraded from **portfolio-relative** to **absolute anchor-based** effort calculation. This provides predictable, controllable scoring that doesn't change when new projects are added.

---

## What Changed

### Before (Portfolio-Relative)
```typescript
// OLD: Score based on position in portfolio
cost_factor = (Your Cost - Min Cost in Portfolio) / (Max Cost - Min Cost)
time_factor = (Your Time - Min Time in Portfolio) / (Max Time - Min Time)

// Problem: Adding a $200K project makes all others "cheaper" relatively
```

### After (Absolute Anchors)
```typescript
// NEW: Score based on fixed benchmarks
cost_factor = Your Cost / Cost Target
time_factor = Your Time / Time Target

// Benefit: Adding projects doesn't change existing scores
```

---

## Key Features

### 1️⃣ **Default Anchors**

System-wide defaults for all organizations:

```typescript
{
  costTarget: 100000,  // $100,000 USD
  timeTarget: 6        // 6 months
}
```

These represent a "moderate effort" project in a mid-sized company.

---

### 2️⃣ **Admin Configuration UI**

**Location:** Settings → Admin → Costs → Effort Anchors

**Permissions:**
- ✅ Global Admin (master_admin)
- ✅ Tenant Admin (tenant_admin)
- ✅ Org Admin (org_admin)
- ❌ Regular users (view only)

**Editable Fields:**
- **Cost Target ($)** - default: $100,000
- **Time Target (months)** - default: 6 months

---

### 3️⃣ **Calculation Formula**

#### Step 1: Calculate Raw Scores

```typescript
// Cost Score (0-1.2, clamped)
cost_score = clamp(Estimated Cost / Cost Target, 0, 1.2)

// Time Score (0-1.2, clamped)
// Note: Timeline is stored in weeks, anchor is in months
time_in_months = Estimated Time (weeks) / 4.33
time_score = clamp(time_in_months / Time Target, 0, 1.2)

// Complexity Score (0-1, from workflow)
complexity_score = clamp(Complexity Index / 10, 0, 1)
```

#### Step 2: Weighted Combination

```typescript
Implementation Effort = 
  (0.5 × cost_score) +      // 50% weight
  (0.3 × time_score) +      // 30% weight
  (0.2 × complexity_score)  // 20% weight
```

#### Step 3: Clamp to 0-100%

```typescript
implementation_effort = clamp(raw_effort, 0, 1)
```

---

## Quadrant Mapping

The Opportunity Matrix uses these thresholds:

| Quadrant | Logic | Color |
|----------|-------|-------|
| 🟩 **Quick Wins** | ROI ≥ 100% and Effort ≤ 40% | Green |
| 🟦 **Growth Engines** | ROI ≥ 100% and Effort > 40% | Blue |
| 🟨 **Nice to Have** | ROI < 100% and Effort ≤ 40% | Yellow |
| 🟥 **Deprioritize** | ROI < 100% and Effort > 40% | Red |

**The 40% Threshold:**
- Projects below 40% effort are "low implementation burden"
- Projects above 40% effort are "high implementation burden"

---

## Example Calculations

### Example 1: Quick Win Project

**Inputs:**
- Estimated Cost: $50,000
- Estimated Time: 12 weeks (2.77 months)
- Complexity Index: 4.5/10
- ROI: 150%

**Calculation:**
```typescript
cost_score = $50,000 / $100,000 = 0.50 (50%)
time_score = 2.77 / 6 = 0.46 (46%)
complexity_score = 4.5 / 10 = 0.45 (45%)

effort = (0.5 × 0.50) + (0.3 × 0.46) + (0.2 × 0.45)
       = 0.25 + 0.138 + 0.09
       = 0.478 → 47.8%
```

**Result:** 🟦 **Growth Engine** (ROI ≥ 100%, Effort > 40%)

---

### Example 2: Low-Effort Project

**Inputs:**
- Estimated Cost: $30,000
- Estimated Time: 8 weeks (1.85 months)
- Complexity Index: 3.0/10
- ROI: 200%

**Calculation:**
```typescript
cost_score = $30,000 / $100,000 = 0.30 (30%)
time_score = 1.85 / 6 = 0.31 (31%)
complexity_score = 3.0 / 10 = 0.30 (30%)

effort = (0.5 × 0.30) + (0.3 × 0.31) + (0.2 × 0.30)
       = 0.15 + 0.093 + 0.06
       = 0.303 → 30.3%
```

**Result:** 🟩 **Quick Win** (ROI ≥ 100%, Effort ≤ 40%)

---

### Example 3: High-Cost, High-Effort Project

**Inputs:**
- Estimated Cost: $150,000
- Estimated Time: 40 weeks (9.23 months)
- Complexity Index: 8.5/10
- ROI: 180%

**Calculation:**
```typescript
cost_score = $150,000 / $100,000 = 1.20 (capped at 120%)
time_score = 9.23 / 6 = 1.20 (capped at 120%)
complexity_score = 8.5 / 10 = 0.85 (85%)

effort = (0.5 × 1.20) + (0.3 × 1.20) + (0.2 × 0.85)
       = 0.60 + 0.36 + 0.17
       = 1.13 → 100% (capped)
```

**Result:** 🟦 **Growth Engine** (ROI ≥ 100%, Effort > 40%)

---

## Impact of Changing Anchors

### Scenario: Raise Cost Target from $100K → $150K

**Same project as Example 1:**
- Estimated Cost: $50,000

**Before:**
```typescript
cost_score = $50,000 / $100,000 = 0.50 (50%)
```

**After:**
```typescript
cost_score = $50,000 / $150,000 = 0.33 (33%)
```

**Effect:** Lower cost score = lower overall effort = easier to achieve Quick Win status

---

### Scenario: Lower Time Target from 6 → 3 months

**Same project as Example 2:**
- Estimated Time: 8 weeks (1.85 months)

**Before:**
```typescript
time_score = 1.85 / 6 = 0.31 (31%)
```

**After:**
```typescript
time_score = 1.85 / 3 = 0.62 (62%)
```

**Effect:** Higher time score = higher overall effort = harder to achieve Quick Win status

---

## Admin UI Features

### Effort Anchors Card

**Visual Elements:**
- 📊 Cost Target input (with $ prefix)
- 📅 Time Target input (with "months" suffix)
- ℹ️ Tooltips explaining each field
- 🔄 Reset button (restores defaults)
- 💾 Save button (only when changes made)

**How It Works Explanation:**
```
Implementation Effort = 
  50% × (Cost / Cost Target) +
  30% × (Time / Time Target) +
  20% × (Complexity / 10)

Result: Projects ≤40% are "Quick Wins" or "Nice to Have"
        Projects >40% are "Growth Engines" or "Deprioritize"
```

**Quadrant Reference:**
Visual cards showing all four quadrants with their logic

---

## Technical Implementation

### Files Modified

1. **`/components/utils/calculations.ts`**
   - Updated `GlobalDefaults` interface to include `effortAnchors`
   - Modified `calculateCFOScoreComponents()` to use absolute anchors
   - Removed portfolio min/max parameters
   - Added default effort anchors to `defaultGlobalDefaults`

2. **`/components/OpportunityMatrixNPV.tsx`**
   - Removed portfolio min/max calculation loop
   - Passed `costTarget` and `timeTarget` to CFO calculation
   - Updated console logging to show anchor-based comparisons

3. **`/components/EffortAnchorsAdmin.tsx`** ✨ **NEW**
   - Admin UI component for configuring anchors
   - Permission-based editing
   - Real-time validation
   - Visual explanations and tooltips

4. **`/components/AdminDashboard.tsx`**
   - Integrated `EffortAnchorsAdmin` component
   - Added props for `globalDefaults` and `onSaveGlobalDefaults`
   - Positioned in Costs tab before Cost Classification

5. **`/App.tsx`**
   - Passed `globalDefaults` to `AdminDashboard`
   - Created save handler that updates backend and local state

---

## Data Persistence

### Storage Location

Anchors are stored in the organization's global defaults:

```typescript
{
  globalDefaults: {
    // ... other defaults
    effortAnchors: {
      costTarget: 100000,
      timeTarget: 6
    }
  }
}
```

### Backend Endpoint

```typescript
POST /data/save
{
  organizationId: "org_abc123",
  data: {
    globalDefaults: {
      effortAnchors: {
        costTarget: 120000,
        timeTarget: 8
      }
    }
  }
}
```

---

## Console Logging

### Before (Portfolio-Relative)

```
💡 IMPLEMENTATION EFFORT CALCULATION:
   Estimated Time: 8 weeks
   Portfolio Time Range: 4 - 40 weeks
   Time Factor: 11.1% (normalized position in range)
   Cost Factor: 27.3%
   Complexity Factor: 62.0%
```

### After (Absolute Anchors)

```
💡 ABSOLUTE EFFORT CALCULATION:
   Estimated Cost: $45,000
   Cost Target: $100,000
   Cost Score: 45.0% (below target)
   Estimated Time: 8 weeks (1.8 months)
   Time Target: 6 months
   Time Score: 30.8% (below target)
   Complexity Index: 6.2/10
   Complexity Score: 62.0%
```

---

## Migration Guide

### Automatic Migration

**No action required!** Existing organizations without `effortAnchors` will automatically use defaults:

```typescript
const costTarget = globalDefaults.effortAnchors?.costTarget || 100000;
const timeTarget = globalDefaults.effortAnchors?.timeTarget || 6;
```

### For Admins

1. Navigate to **Settings → Admin → Costs**
2. Review the **Effort Anchors** card at the top
3. Adjust anchors based on your organization's project scale
4. Click **Save Anchors**
5. All projects will be recalculated automatically

---

## Calibration Guidelines

### When to Adjust Anchors

**Raise Cost Target** if:
- Most projects feel "too hard" (high effort scores)
- You work with larger budgets than average
- Your Quick Wins quadrant is empty

**Lower Cost Target** if:
- Most projects feel "too easy" (low effort scores)
- You work with smaller budgets than average
- Your Growth Engines quadrant is empty

**Raise Time Target** if:
- Your org typically has longer implementation cycles
- Most projects are scoring as high-effort on time

**Lower Time Target** if:
- Your org has fast deployment capabilities
- Most projects are scoring as low-effort on time

---

## Common Scenarios

### Scenario 1: Startup Environment

**Profile:**
- Small budgets ($10K-$50K)
- Fast execution (2-12 weeks)
- High complexity due to lack of processes

**Suggested Anchors:**
```typescript
{
  costTarget: 30000,   // $30K
  timeTarget: 3        // 3 months
}
```

---

### Scenario 2: Enterprise Environment

**Profile:**
- Large budgets ($200K-$1M)
- Slow execution (6-18 months)
- High complexity due to stakeholders

**Suggested Anchors:**
```typescript
{
  costTarget: 500000,  // $500K
  timeTarget: 12       // 12 months
}
```

---

### Scenario 3: Mid-Market B2B SaaS

**Profile:**
- Medium budgets ($50K-$200K)
- Moderate execution (3-9 months)
- Medium complexity

**Suggested Anchors:**
```typescript
{
  costTarget: 100000,  // $100K (default)
  timeTarget: 6        // 6 months (default)
}
```

---

## Troubleshooting

### Issue: All Projects Are Quick Wins

**Cause:** Anchors set too high for your organization

**Solution:** Lower the anchors
```typescript
// Before
{ costTarget: 100000, timeTarget: 6 }

// After
{ costTarget: 50000, timeTarget: 3 }
```

---

### Issue: All Projects Are Growth Engines

**Cause:** Anchors set too low for your organization

**Solution:** Raise the anchors
```typescript
// Before
{ costTarget: 100000, timeTarget: 6 }

// After
{ costTarget: 200000, timeTarget: 12 }
```

---

### Issue: Effort Scores Don't Match Expectations

**Verify:**
1. Check the console logs during matrix calculation
2. Confirm cost includes all components:
   - Upfront costs
   - Training costs
   - Consulting costs
   - Software costs (×12 months)
3. Verify time is in weeks (not months) in the data
4. Check complexity index from workflow builder

---

## Testing Checklist

### ✅ Admin UI Testing

- [ ] Navigate to Admin → Costs
- [ ] See Effort Anchors card at top
- [ ] Cost Target shows $100,000 default
- [ ] Time Target shows 6 months default
- [ ] Tooltips explain each field
- [ ] Reset button works
- [ ] Save button only enabled when changes made
- [ ] Non-admin users see "view only" message

### ✅ Calculation Testing

- [ ] Create test project: $50K, 12 weeks, complexity 5
- [ ] Check console for "ABSOLUTE EFFORT CALCULATION" logs
- [ ] Verify cost score = 50%
- [ ] Verify time score ≈ 46%
- [ ] Verify overall effort ≈ 47.8%
- [ ] Confirm quadrant = Growth Engine (>40%)

### ✅ Integration Testing

- [ ] Change anchors to $200K and 12 months
- [ ] Save anchors
- [ ] Navigate to Opportunity Matrix
- [ ] Verify same project now shows lower effort
- [ ] Confirm quadrant may change to Quick Win

---

## Performance Impact

### Before
```typescript
// Portfolio normalization: O(n) for each process
allCosts = processes.map(p => calculateCost(p))  // O(n)
min = Math.min(...allCosts)                      // O(n)
max = Math.max(...allCosts)                      // O(n)
// Total: O(3n) = O(n)
```

### After
```typescript
// Absolute anchors: O(1) per process
costTarget = 100000  // O(1)
timeTarget = 6       // O(1)
// Total: O(1)
```

**Performance Improvement:** Eliminated O(n) normalization loop

---

## Future Enhancements

### Potential Features

1. **Industry-Specific Presets**
   ```typescript
   presets = {
     'startup': { costTarget: 30000, timeTarget: 3 },
     'enterprise': { costTarget: 500000, timeTarget: 12 },
     'smb': { costTarget: 100000, timeTarget: 6 }
   }
   ```

2. **Tenant-Level Anchors**
   - Allow tenant admins to set defaults for all orgs
   - Orgs can override if needed

3. **Historical Tracking**
   - Track anchor changes over time
   - Show impact on quadrant distribution

4. **Smart Recommendations**
   - Analyze project distribution
   - Suggest optimal anchors automatically

---

## Summary

### What You Need to Know

1. **Scores are now absolute** - Adding/removing projects doesn't change existing scores
2. **Anchors are configurable** - Admins can adjust for organizational scale
3. **Defaults work for most** - $100K and 6 months fits mid-market companies
4. **Changes auto-recalculate** - Save anchors → all projects update instantly
5. **Permission-based** - Only admins can edit anchors

### Quick Reference

**Formula:**
```
Effort = 50%×(Cost/$100K) + 30%×(Time/6mo) + 20%×(Complexity/10)
```

**Threshold:**
```
≤40% = Quick Win or Nice to Have
>40% = Growth Engine or Deprioritize
```

**Admin Path:**
```
Settings → Admin → Costs → Effort Anchors
```

---

**Last Updated:** October 15, 2025  
**Version:** 2.0.0
