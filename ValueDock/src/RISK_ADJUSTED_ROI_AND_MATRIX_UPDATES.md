# Risk-Adjusted ROI & Matrix Positioning Updates

## ✅ Implementation Complete

This document summarizes the major updates to the ROI matrix positioning, risk adjustment calculations, and effort anchors administration.

---

## 🎯 1. Risk-Adjusted ROI Implementation

### Formula Implementation
The system now applies an **additional risk adjustment multiplier** to ROI calculations:

```typescript
// Base ROI from NPV
roi_raw = NPV_final / max(Initial_Cost, 1)

// Risk Factor (0-1 scale)
Risk_Factor = effectiveRiskFactor / 10

// Risk Adjustment Multiplier (reduces ROI by up to 50%)
Risk_Adjustment = 1 - (0.5 * Risk_Factor)

// Final Risk-Adjusted ROI
roi_a = roi_raw * Risk_Adjustment
```

### Risk Factor Sources (Priority Order)
1. **Global Risk Factor Override** (if set): Applied uniformly to all processes
2. **Process Complexity Score** (default): Each process uses its own 0-10 complexity score

### Impact Examples
- **Complexity 0/10**: No adjustment (100% of raw ROI)
- **Complexity 5/10**: 25% reduction (75% of raw ROI)
- **Complexity 10/10**: 50% reduction (50% of raw ROI)

---

## 🌐 2. Global Risk Factor Override

### Location
**Admin Panel → Inputs Tab → Global Settings → Financial Assumptions**

### Features
- **Optional field** (0-10 scale)
- **Leave empty**: Each process uses its own complexity score
- **Set value**: Overrides all process complexity scores
- **Visual indicator**: Shows whether global override is active

### UI Elements
```
🔒 All processes will use risk factor: 5.0/10  (when set)
🔓 Each process will use its own complexity score  (when empty)
```

### Use Cases
- **Standardized risk assessment**: Apply same risk level across portfolio
- **Conservative vs. aggressive analysis**: Adjust entire portfolio's risk profile
- **Scenario testing**: Compare results with different global risk factors

---

## 📊 3. Matrix Positioning Updates

### Fixed Scale Implementation
The matrix now uses a **FIXED scale** that doesn't change based on data:

#### X-Axis (Risk-Adjusted ROI)
- **Range**: 0% to 75%
- **Threshold**: 37.5% (50% position)
- **Scrollable**: Projects with ROI > 75% extend beyond visible area

#### Y-Axis (Implementation Effort)
- **Range**: 0% to 100%
- **Threshold**: 50% (visual midpoint)
- **Fixed**: Always displays full range

### Positioning Formulas
```typescript
// X position (ROI)
x = 5% + (min(roi, 0.75) / 0.75) * 90%

// Y position (Effort) - inverted because CSS top=0 is screen top
y = 95% - (min(effort, 1.0) / 1.0) * 90%
```

### Quadrant Layout
```
┌─────────────┬─────────────┐
│  🟥 Depr.   │  🟦 Strat.  │  ← High Effort (top)
│  Low ROI    │  Bets       │
│             │  High ROI   │
├─────────────┼─────────────┤ 50% line (effort)
│  🟨 Nice    │  🟩 Quick   │  
│  to Haves   │  Wins       │  ← Low Effort (bottom)
│  Low ROI    │  High ROI   │
└─────────────┴─────────────┘
  ↑           ↑             ↑
  Low ROI   37.5%        High ROI
```

### X-Axis Labels
```
0%  →  18.75%  →  37.5%  →  56.25%  →  75%
```

### Scrolling Behavior
- **Horizontal scroll**: Enabled if processes exceed 75% ROI
- **Vertical scroll**: Enabled if content exceeds viewport
- **Min width**: 800px to prevent squishing

---

## ⚙️ 4. Effort Anchors Admin Redesign

### Key Changes
1. **Collapsible section**: Defaults to closed, expands on click
2. **Organization-first workflow**: Must select org before setting targets
3. **Updated defaults**:
   - Cost Target: **$200,000** (was $100,000)
   - Time Target: **12 months** (was 6 months)
4. **Admin-level only**: Hidden for org_admin users
5. **Space-efficient design**: Compact 2-column grid layout

### Organization Selection
```
╔═══════════════════════════════════════╗
║ 🏢 Select Organization *             ║
║ [Choose an organization... ▼]        ║
║ ⚠️ You must select an organization   ║
║    before setting targets             ║
╚═══════════════════════════════════════╝
```

### Input Controls
- **Cost/Time fields**: Greyed out until organization selected
- **Save button**: Disabled until organization selected
- **Reset button**: Restores to new defaults ($200K, 12 months)

### Visibility Rules
- ✅ **master_admin**: Can configure any organization
- ✅ **tenant_admin**: Can configure organizations in their tenant
- ❌ **org_admin**: Section is completely hidden

---

## 📝 5. Updated Calculation Flow

### Step-by-Step Process
1. **Load Global Settings**
   - Get `globalRiskFactor` (if set)
   - Get `effortAnchors` (cost/time targets)
   - Get `discountRate`, `riskPremiumFactor`

2. **For Each Process**:
   ```
   a. Get process complexity score
   b. Determine effective risk factor:
      - Use global override if set
      - Otherwise use process complexity
   c. Calculate NPV with risk-adjusted discount rate
   d. Calculate base ROI = NPV / Cost
   e. Apply risk adjustment multiplier to ROI
   f. Calculate implementation effort (cost 50%, time 30%, complexity 20%)
   g. Determine quadrant based on thresholds
   h. Position on matrix using fixed scale
   ```

3. **Matrix Display**:
   - Plot bubbles using fixed X (0-75%) and Y (0-100%) scales
   - Size bubbles by NPV
   - Color by engine type
   - Enable scroll if needed

---

## 🔍 6. Console Logging

### Enhanced Debug Output
Every calculation now logs:

```javascript
🎲 RISK ADJUSTMENT:
   Global Risk Factor: 7.0/10 (OVERRIDE)
   Risk Adjustment Multiplier: 65.0%
   ROI (raw): 450.0%
   ROI (risk-adjusted): 292.5%

🎯 [Position] "Invoice Processing": 
   ROI 292% → X=95%, Effort 25% → Y=73%, NPV=$850,000
```

### Matrix Summary
```
📊 [OpportunityMatrix] Traditional Matrix Positioning (FIXED SCALE)
📊 [OpportunityMatrix] X-axis scale: 0% to 75% RISK-ADJUSTED ROI
📊 [OpportunityMatrix] Global Risk Factor: 7.0/10 (OVERRIDE)
📊 [OpportunityMatrix] NPV range: $125,000 to $2,500,000
```

---

## 🧪 7. Testing Scenarios

### Test 1: High ROI Process (Invoice Processing)
- **Raw ROI**: 1000%
- **Complexity**: 3/10
- **Risk Adjustment**: 85% (15% reduction)
- **Risk-Adjusted ROI**: 850%
- **Expected Position**: Off the right side of chart (scrollable)

### Test 2: Global Risk Factor Override
1. Set global risk factor to 5.0
2. All processes should use 5.0 regardless of complexity
3. Console should show "OVERRIDE" label
4. Matrix positions should shift left (lower ROI)

### Test 3: Time Horizon Changes
1. Change from 3 years to 10 years
2. NPV should increase dramatically
3. Bubble sizes should grow
4. Positions should move right (higher ROI)

### Test 4: Effort Anchors
1. Open Effort Anchors section
2. Select an organization (required!)
3. Set cost target to $500K
4. Processes under $500K should score lower effort
5. Processes over $500K should score higher effort

---

## 📐 8. Quadrant Classification Thresholds

### Fixed Thresholds (Non-Visual)
The actual quadrant classification uses these thresholds:
- **ROI threshold**: 100% (1.0)
- **Effort threshold**: 40% (0.4)

### Visual Quadrants
The visual quadrants are 50/50 squares for balance:
- **ROI line**: 50% (at 37.5% ROI given 0-75% scale)
- **Effort line**: 50% (at 50% effort given 0-100% scale)

**Note**: Visual quadrants are guides only. Actual classification uses the fixed thresholds in calculations.ts.

---

## 🛠️ 9. Files Modified

### Core Calculation Logic
- `/components/utils/calculations.ts`
  - Added `globalRiskFactor` to `FinancialAssumptions` interface
  - Added risk adjustment multiplier calculation
  - Updated `calculateCFOScoreComponents` function

### Matrix Display
- `/components/OpportunityMatrixNPV.tsx`
  - Changed X-axis scale from 0-200% to 0-75%
  - Added scrollable container
  - Updated positioning formulas
  - Added global risk factor logging
  - Pass globalRiskFactor to calculations

### Admin Panel
- `/components/EffortAnchorsAdmin.tsx`
  - Complete rewrite with collapsible design
  - Organization-first workflow
  - Updated defaults ($200K, 12 months)
  - Admin-level only visibility

- `/components/InputsScreenTable.tsx`
  - Added Global Risk Factor Override field
  - Added tooltip with usage instructions
  - Visual indicator for override status

---

## 📊 10. Default Values Summary

| Setting | Old Default | New Default | Notes |
|---------|-------------|-------------|-------|
| Cost Target | $100,000 | $200,000 | More realistic for enterprise projects |
| Time Target | 6 months | 12 months | Better reflects typical implementation |
| X-axis Range | 0-200% | 0-75% | Focused on realistic ROI range |
| Global Risk Factor | N/A | undefined (not set) | Optional override feature |

---

## ✅ Verification Checklist

- [x] Risk adjustment multiplier applied to ROI
- [x] Global risk factor override field added
- [x] Matrix uses fixed 0-75% X-axis scale
- [x] Scrolling enabled for overflow content
- [x] Effort anchors default to $200K / 12 months
- [x] Organization selection mandatory before saving
- [x] Effort anchors hidden for org admins
- [x] Console logging shows risk adjustments
- [x] Bubble positions update with time horizon
- [x] Visual indicators show override status

---

## 📝 Notes

1. **Risk-Adjusted ROI**: The matrix now correctly displays RISK-ADJUSTED ROI on the X-axis, not raw ROI
2. **Fixed Scale Benefits**: Consistent positioning across different datasets makes trend analysis easier
3. **Overflow Strategy**: Projects exceeding 75% ROI are still visible via horizontal scroll
4. **Admin Permissions**: Only master_admin and tenant_admin can configure effort anchors
5. **Organization-Level Settings**: Each organization has independent anchor values

---

## 🚀 Next Steps

If you need to further customize:

1. **Adjust risk penalty**: Change `0.5` in risk adjustment formula (currently 50% max reduction)
2. **Change X-axis range**: Modify `maxROIScale` in OpportunityMatrixNPV.tsx
3. **Modify effort weights**: Update 50%/30%/20% split in calculations.ts
4. **Add more risk factors**: Extend the risk factor system beyond complexity

---

Last Updated: 2025-10-15
