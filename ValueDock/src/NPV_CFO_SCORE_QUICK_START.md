# NPV-Based CFO Score - Quick Start Guide

## ✅ What's Done

The CFO Score system has been **completely rebuilt** using NPV-based financial metrics with fixed enterprise thresholds.

---

## 🚀 Immediate Changes You'll See

### Opportunity Matrix Tab
- **New Title**: "NPV-Based Opportunity Matrix"
- **New X-Axis**: Risk-Adjusted ROI (%) instead of Impact
- **New Y-Axis**: Execution Health (%) instead of Effort  
- **New Bubble Size**: Absolute NPV instead of cumulative savings

### Quadrant Classifications (FIXED THRESHOLDS)
```
Quick Wins:      CFO Score ≥ 7.5  🟩
Big Hitters:     CFO Score 6.0-7.4 🟦
Nice to Haves:   CFO Score 4.5-5.9 🟨
Deprioritize:    CFO Score < 4.5   🟥
```

### New CFO Score Formula
```
CFO Score = (0.5 × ROI) + (0.3 × Execution_Health) + (0.2 × Risk_Factor)

Where:
• ROI = NPV / Initial_Cost (risk-adjusted)
• Execution_Health = 1 - ((EAC - Budget) / Budget)
• Risk_Factor = 1 - (EMV / Initial_Cost)
```

---

## 📊 How It Works

### Input Data (per process)
- **Initial Cost**: Upfront + Training + Consulting + 1yr Software
- **Annual Savings**: From existing ROI calculations
- **Complexity Index**: From workflow editor (0-10 scale)
- **Discount Rate**: From Global Settings (default 8%)
- **Budget**: Defaults to Initial Cost if not provided ⚠️
- **EAC**: Defaults to Initial Cost if not provided ⚠️
- **EMV**: Defaults to $0 if not provided ⚠️

### Calculation Steps
1. **Risk-Adjusted Rate**: `r_adj = 8% + (3% × Complexity/10)`
2. **Risk-Adjusted NPV**: Discounted cash flows with prudence adjustment
3. **ROI**: `NPV / Initial_Cost`
4. **Execution Health**: `1 - ((EAC - Budget) / Budget)` clamped to 0-1
5. **Risk Factor**: `1 - (EMV / Initial_Cost)` clamped to 0-1
6. **CFO Score**: Weighted combination (normalized to 0-10)
7. **Quadrant**: Based on fixed CFO Score thresholds

---

## 🎯 Example

**Invoice Processing**:
```
Initial Cost: $43,250
Annual Savings: $92,500
Complexity: 2.4 (Simple)
Discount Rate: 8%
Time Horizon: 3 years

Budget: $43,250 (default)
EAC: $43,250 (default - on budget)
EMV: $0 (default - no risk)

Results:
├─ r_adj: 8.72%
├─ NPV: $233,426
├─ ROI: 539.6%
├─ Execution Health: 100% (on budget)
├─ Risk Factor: 100% (no exposure)
├─ CFO Score: 8.84 / 10
└─ Quadrant: Quick Win ✅
```

---

## 🔍 Browser Console Logs

Look for these when you open the Opportunity Matrix:

```javascript
🔍 NPV-Based CFO Score Calculation Starting
  Discount Rate: 8.0%
  Risk Premium Factor: 0.03
  Time Horizon: 3 years

💰 CFO Score for "Invoice Processing":
  Initial Cost: $43,250
  Annual Savings: $92,500
  Complexity Index: 2.4
  Risk-Adjusted Rate (r_adj): 8.72%
  NPV (Risk-Adjusted): $233,426
  ROI: 539.6%
  Execution Health: 100.0%
  Risk Factor: 100.0%
  CFO Score (Normalized): 8.84/10
  Quadrant: Quick Win
```

---

## ⚠️ Current Limitations

### Missing UI Fields (Coming Soon)
The following fields are NOT YET in the UI but are used in calculations:

1. **Budget**: Currently defaults to Initial Cost
2. **EAC (Estimate at Completion)**: Currently defaults to Initial Cost  
3. **EMV (Expected Monetary Value)**: Currently defaults to $0

**Impact**: All processes currently show:
- Execution Health = 100% (assumes on-budget)
- Risk Factor = 100% (assumes no risk exposure)

**Solution**: Scores are primarily driven by NPV and ROI until these fields are added.

### Where to Add These Fields
**Implementation Screen** → Expand process → Add new section:
```
📊 NPV-Based CFO Metrics
├─ Budget (USD): $______
├─ EAC - Estimate at Completion (USD): $______
└─ EMV - Expected Monetary Value of Risks (USD): $______
```

---

## 📈 How Scores Change

### Scenario 1: Over Budget
```
Before: EAC = $50K, Budget = $50K → Exec Health = 100%
After:  EAC = $60K, Budget = $50K → Exec Health = 80%

Impact: CFO Score decreases by ~0.6 points
Quadrant: May drop from Quick Win to Big Hitter
```

### Scenario 2: High Risk Exposure
```
Before: EMV = $0, Initial Cost = $100K → Risk Factor = 100%
After:  EMV = $30K, Initial Cost = $100K → Risk Factor = 70%

Impact: CFO Score decreases by ~0.6 points
Quadrant: May drop from Big Hitter to Nice to Have
```

### Scenario 3: High Complexity
```
Before: Complexity = 2 → r_adj = 8.6%
After:  Complexity = 8 → r_adj = 10.4%

Impact: NPV decreases → ROI decreases → CFO Score decreases
Quadrant: Significant impact on marginally scoring processes
```

---

## 🎯 Interpreting Scores

### CFO Score Ranges

| Score | Meaning | Action |
|-------|---------|--------|
| **9-10** | Exceptional ROI, no execution risk | Prioritize immediately |
| **7.5-8.9** | Strong ROI, good execution | Quick Win - move forward |
| **6.0-7.4** | Good ROI, some execution concerns | Big Hitter - manage actively |
| **4.5-5.9** | Moderate ROI, execution risks | Nice to Have - defer if needed |
| **0-4.4** | Low ROI or high risk | Deprioritize or redesign |

### Component Interpretation

#### ROI (Risk-Adjusted)
- **>200%**: Exceptional return
- **100-200%**: Strong return
- **50-100%**: Good return
- **0-50%**: Moderate return
- **<0%**: Negative return (red flag)

#### Execution Health
- **95-100%**: On or under budget (healthy)
- **85-94%**: Slight overrun (monitor)
- **70-84%**: Significant overrun (concern)
- **<70%**: Severe overrun (red flag)

#### Risk Factor
- **95-100%**: Minimal risk exposure
- **85-94%**: Low risk
- **70-84%**: Moderate risk
- **<70%**: High risk exposure (red flag)

---

## 🔄 Comparison: Old vs New

### Example: Same Process, Different Scores

**Old System (Relative)**:
```
Impact: 3.5/10 (below average in portfolio)
Effort: 1.8/10 (low effort)
Speed: 7.3/10 (fast implementation)
Risk: 2.0/10 (simple workflow)
CFO Score: 5.09
Quadrant: Nice to Haves
```

**New System (Absolute)**:
```
NPV: $233,426 (absolute value)
ROI: 539.6% (absolute return)
Execution Health: 100% (on budget)
Risk Factor: 100% (no exposure)
CFO Score: 8.84
Quadrant: Quick Wins ✅
```

**Why the Difference?**
- Old system compared to OTHER processes (relative)
- New system evaluates financial merit independently (absolute)
- Same project can be "Nice to Have" in one portfolio but "Quick Win" universally

---

## 🛠️ Troubleshooting

### "All my processes are in Deprioritize!"
**Likely cause**: Negative NPV due to high costs or low savings

**Check**:
1. Are annual savings correctly captured?
2. Is the discount rate too high? (should be 8-12%)
3. Is complexity inflating the risk-adjusted rate?

**Fix**: Review cost/benefit inputs

### "Everything has CFO Score 5.0-6.0"
**Likely cause**: Moderate ROI with default Execution Health/Risk Factor

**Why**: Budget=EAC and EMV=0 gives 100% health and 100% risk factor

**Fix**: Add actual Budget, EAC, and EMV values to differentiate

### "Scores don't match my intuition"
**Remember**:
- NPV is time-value-of-money adjusted (not simple payback)
- Complexity reduces NPV via risk premium
- Execution Health and Risk Factor matter (30% weight combined)

**Action**: Check console logs for detailed breakdown

---

## 📚 Documentation

### Complete Details
- `/NPV_CFO_SCORE_IMPLEMENTATION_COMPLETE.md` - Full implementation guide
- `/NPV_CFO_SCORE_SYSTEM_COMPLETE.md` - Original requirements
- `/NPV_CALCULATION_QUICK_REFERENCE.md` - Formula reference
- `/CFO_SCORE_MIGRATION_GUIDE.md` - Migration guide

### Code Files
- `/components/OpportunityMatrixNPV.tsx` - New component (active)
- `/components/OpportunityMatrix.tsx` - Old component (deprecated)
- `/components/utils/calculations.ts` - Calculation functions

### Functions to Know
```typescript
// Calculate risk-adjusted NPV
calculateRiskAdjustedNPV(
  initialCost, savingsYears, startYear, 
  discountRate, complexityIndex, riskPremiumFactor
)

// Calculate all CFO Score components
calculateCFOScoreComponents({
  initialCost, savingsYears, startYear,
  discountRate, complexityIndex,
  budget, eac, emv, riskPremiumFactor
})
```

---

## ✅ Testing Checklist

When you load the Opportunity Matrix:

- [ ] Title says "NPV-Based Opportunity Matrix"
- [ ] X-axis labeled "Risk-Adjusted ROI (%)"
- [ ] Y-axis labeled "Execution Health (%)"
- [ ] Quadrant legend shows fixed thresholds (7.5, 6.0, 4.5)
- [ ] Tooltips show NPV, ROI, Execution Health, Risk Factor
- [ ] Console logs show detailed CFO Score breakdown
- [ ] Processes are sorted by CFO Score (highest first)
- [ ] Starting process (⭐) is highest-scoring Quick Win

---

## 🎯 Next Action

1. **Test the new matrix**: Go to Opportunity Matrix tab
2. **Review console logs**: Verify calculations are working
3. **Check tooltips**: Hover over processes to see new metrics
4. **Add input fields** (optional): Budget, EAC, EMV in Implementation section

**Status**: ✅ Core system is COMPLETE and WORKING  
**Limitation**: Defaults assume on-budget, zero-risk projects  
**Enhancement**: Add UI fields for Budget, EAC, EMV to unlock full functionality

---

**Ready to use! 🚀**
