# Cyclical Multiplier - How It Works

## Overview

The cyclical multiplier in ValueDock® is designed to **redistribute** workload/costs across time periods, not to add to the total amount. This reflects real business patterns where the annual total stays the same, but certain peak periods require more resources.

## The Correct Behavior ✅

**The cyclical multiplier adjusts the distribution so peak periods get more while off-peak periods get less, keeping the annual total constant.**

### Example:
- **Annual Task Volume**: 12,000 tasks/year
- **Average Monthly**: 1,000 tasks/month
- **Peak Multiplier**: 1.5x during peak months (e.g., month-end, tax season, holidays)
- **Peak Months**: Jan, Apr, Jul, Oct (4 months)

#### Distribution:
```
Peak months (4 months):    1,250 tasks/month × 4 = 5,000 tasks
Off-peak months (8 months):  875 tasks/month × 8 = 7,000 tasks
------------------------------------------------------------
Total:                                         = 12,000 tasks ✅
```

The total is still 12,000 tasks/year, but distributed unevenly.

## How the Math Works

### Formula:
```typescript
// Calculate adjustment factor so total remains constant
const numPeakPeriods = peakMonths.length;
const numOffPeakPeriods = 12 - numPeakPeriods;

// Let x = off-peak multiplier (what we need to solve for)
// Total = (numPeakPeriods × baseline × peakMultiplier) + (numOffPeakPeriods × baseline × x) 
// We want: Total = 12 × baseline

// Solving for x:
const offPeakMultiplier = (12 - numPeakPeriods * peakMultiplier) / numOffPeakPeriods;

// Apply to each month:
monthlyVolume = baseline * (isPeakMonth ? peakMultiplier : offPeakMultiplier);
```

### Example Calculation:
```
Baseline = 1,000 tasks/month
Peak multiplier = 1.5x
Peak months = 4 months

Off-peak multiplier = (12 - 4 × 1.5) / 8
                    = (12 - 6) / 8
                    = 6 / 8
                    = 0.75x

Peak months:    1,000 × 1.5 = 1,250 tasks/month
Off-peak months: 1,000 × 0.75 = 750 tasks/month

Total: (4 × 1,250) + (8 × 750) = 5,000 + 6,000 = 11,000... 

Wait, that's wrong! Let me fix this...
```

Actually, the correct formula should maintain the average:

```typescript
// Correct approach - maintain annual total
const totalMonths = 12;
const averageMonthly = annualTotal / 12;

// Calculate the adjustment factor
const peakCount = peakMonths.length;
const offPeakCount = 12 - peakCount;

// We want: 
// (peakCount × peakValue) + (offPeakCount × offPeakValue) = annualTotal
// Where: peakValue = averageMonthly × peakMultiplier

// Solve for offPeakValue:
const totalPeakAmount = peakCount * (averageMonthly * peakMultiplier);
const remainingForOffPeak = annualTotal - totalPeakAmount;
const offPeakMonthly = remainingForOffPeak / offPeakCount;

// Verification:
// (4 × 1,500) + (8 × 750) = 6,000 + 6,000 = 12,000 ✅
```

## Incorrect Behavior ❌ (What to Avoid)

**Adding to the total** would look like this:
```
Base monthly: 1,000 tasks/month × 12 = 12,000 tasks/year
Peak boost:   +500 tasks/month × 4 peak months = +2,000 tasks
------------------------------------------------------------
Total:                                         = 14,000 tasks ❌
```

This is **WRONG** because it artificially inflates the annual volume.

## Why This Matters

### Business Reality:
- **Tax preparation firms**: Same annual number of tax returns, but 80% happen in Q1
- **Retail**: Same annual sales volume, but concentrated in holiday season
- **Accounts Payable**: Same annual invoice count, but month-end has 3x more

### ROI Calculation Impact:
If we incorrectly **add** the multiplier to the total:
- ❌ **Overstates** the automation benefit
- ❌ Makes ROI look better than reality
- ❌ Misleads stakeholders on actual savings

If we correctly **redistribute** the total:
- ✅ **Accurately shows** peak period pressure
- ✅ Helps identify overtime costs during peaks
- ✅ Shows realistic automation value

## Implementation in ValueDock®

### Data Structure:
```typescript
export interface SeasonalPattern {
  peakMonths: number[];        // [0, 3, 6, 9] for Jan, Apr, Jul, Oct
  peakMultiplier: number;      // e.g., 1.5 for 50% higher during peaks
}

export interface CyclicalPattern {
  type: 'hourly' | 'daily' | 'monthly' | 'none';
  peakHours: number[];         // [8, 9, 10, 11, 12, 13, 14, 15, 16] for business hours
  peakDays: number[];          // [1, 2, 3, 4, 5] for weekdays
  peakDatesOfMonth: number[];  // [28, 29, 30, 31] for month-end
  multiplier: number;          // e.g., 2.0 for 2x higher during peaks
}
```

### Calculation Logic:
```typescript
function applyCyclicalPattern(
  annualVolume: number,
  pattern: SeasonalPattern | CyclicalPattern
): number[] {
  const periodsInYear = 12; // months
  const baselinePerPeriod = annualVolume / periodsInYear;
  
  const peakCount = pattern.peakMonths?.length || 0;
  const offPeakCount = periodsInYear - peakCount;
  
  // Calculate total amount that goes to peak periods
  const peakTotal = peakCount * baselinePerPeriod * pattern.peakMultiplier;
  
  // Remaining amount distributed to off-peak periods
  const offPeakTotal = annualVolume - peakTotal;
  const offPeakPerPeriod = offPeakTotal / offPeakCount;
  
  // Build monthly distribution
  const distribution = [];
  for (let month = 0; month < 12; month++) {
    const isPeak = pattern.peakMonths?.includes(month);
    distribution.push(
      isPeak 
        ? baselinePerPeriod * pattern.peakMultiplier 
        : offPeakPerPeriod
    );
  }
  
  // Verify total matches original
  const total = distribution.reduce((sum, val) => sum + val, 0);
  console.assert(
    Math.abs(total - annualVolume) < 0.01,
    `Cyclical pattern total (${total}) must equal annual volume (${annualVolume})`
  );
  
  return distribution;
}
```

## Use Cases

### 1. Month-End Spike (Accounting)
```typescript
seasonalPattern: {
  peakMonths: [],  // Not seasonal - happens every month
},
cyclicalPattern: {
  type: 'monthly',
  peakDatesOfMonth: [28, 29, 30, 31],
  multiplier: 3.0  // 3x volume on last 4 days of month
}
```

### 2. Holiday Season (Retail)
```typescript
seasonalPattern: {
  peakMonths: [10, 11],  // November, December
  peakMultiplier: 2.5   // 2.5x volume during holidays
}
```

### 3. Tax Season (Accounting Firm)
```typescript
seasonalPattern: {
  peakMonths: [0, 1, 2, 3],  // Jan-Apr
  peakMultiplier: 4.0        // 4x volume during tax season
}
```

### 4. Business Hours Concentration
```typescript
cyclicalPattern: {
  type: 'hourly',
  peakHours: [9, 10, 11, 14, 15, 16],  // Morning and afternoon peaks
  multiplier: 1.8  // 80% more during business hours
}
```

## Financial Impact

### Overtime Costs:
When cyclical patterns are modeled correctly, ValueDock® can calculate:
- **Overtime premium** during peak periods
- **Temp staff costs** for seasonal spikes
- **SLA compliance risk** during high-volume periods

### Example:
```
Annual volume: 12,000 invoices
Staff capacity: 900 invoices/month (10,800/year without overtime)

Month-end cyclical pattern:
- Days 1-27: 750 invoices (within capacity ✅)
- Days 28-31: 250 invoices (requires overtime ⚠️)

Without cyclical modeling:
- Average: 1,000/month → "Within capacity" ❌ WRONG

With cyclical modeling:
- Peak day: 62 invoices/day → Requires overtime ✅ CORRECT
- Overtime cost: 4 days × 2 hours/day × $50/hr × 1.5x = $600/month
- Annual overtime: $7,200
```

## Testing the Implementation

### Test Case 1: Simple Monthly Pattern
```typescript
const result = applyCyclicalPattern(12000, {
  peakMonths: [0, 3, 6, 9],
  peakMultiplier: 1.5
});

expect(result.reduce((a, b) => a + b)).toBe(12000); // Total unchanged
expect(result[0]).toBe(1500); // Peak month (Jan)
expect(result[1]).toBe(857); // Off-peak month (Feb)
```

### Test Case 2: Extreme Peak
```typescript
const result = applyCyclicalPattern(12000, {
  peakMonths: [11],  // December only
  peakMultiplier: 4.0
});

expect(result[11]).toBe(4000); // Dec gets 4x
expect(result[0]).toBe(727); // Other months get less
```

## Summary

| Aspect | Correct Behavior | Incorrect Behavior |
|--------|------------------|-------------------|
| **Total** | Stays constant | Increases |
| **Peak periods** | Get multiplier × average | Get multiplier added |
| **Off-peak periods** | Get reduced proportionally | Stay at baseline |
| **Business reality** | ✅ Accurate | ❌ Inflated |
| **ROI calculation** | ✅ Realistic | ❌ Overstated |

**Remember**: The cyclical multiplier is about **redistribution**, not **addition**. The annual total must remain constant, with peak periods taking a larger share and off-peak periods taking a smaller share.

---

**Status**: Interface defined, calculation logic ready for implementation  
**Next Steps**: Implement the `applyCyclicalPattern` function in `calculations.ts` and integrate with ROI calculations
