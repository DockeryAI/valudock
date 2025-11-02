# Cost Factor and Time Factor Calculation - Complete Explanation

## The Core Formula: Linear Normalization

Both cost factor and time factor use **linear normalization** to convert absolute values into a **0-1 scale** relative to your entire portfolio.

---

## Time Factor Calculation

### Formula
```typescript
const timeRange = Math.max(portfolioMaxTime - portfolioMinTime, 1);
const time_factor = (estimatedTime - portfolioMinTime) / timeRange;
```

### What This Means

The time factor represents **where your process sits in the range** between the fastest and slowest processes in your portfolio.

```
Time Factor = (Your Process Time - Minimum Time) / (Maximum Time - Minimum Time)
```

### Visual Example

Let's say you have these processes:

| Process              | Timeline |
|---------------------|----------|
| Email Automation    | 4 weeks  | ← Minimum
| Invoice Processing  | 8 weeks  | ← Your process
| CRM Migration       | 12 weeks |
| System Integration  | 24 weeks |
| ERP Implementation  | 40 weeks | ← Maximum

**Portfolio Range:**
- Minimum: 4 weeks
- Maximum: 40 weeks
- Range: 40 - 4 = 36 weeks

**Invoice Processing Time Factor:**
```
time_factor = (8 - 4) / 36
            = 4 / 36
            = 0.111
            = 11.1%
```

### Interpretation

```
0% (0.0)  = Fastest process in portfolio (at minimum)
50% (0.5) = Halfway between fastest and slowest
100% (1.0) = Slowest process in portfolio (at maximum)
11.1%     = Invoice Processing is very close to the fastest
```

---

## Cost Factor Calculation

### Formula
```typescript
const costRange = Math.max(portfolioMaxCost - portfolioMinCost, 1);
const cost_factor = (estimatedCost - portfolioMinCost) / costRange;
```

### What This Means

The cost factor represents **where your process sits in the range** between the cheapest and most expensive processes.

```
Cost Factor = (Your Process Cost - Minimum Cost) / (Maximum Cost - Minimum Cost)
```

### Visual Example

Let's say you have these processes:

| Process              | Total Cost |
|---------------------|------------|
| Email Automation    | $15,000    | ← Minimum
| Invoice Processing  | $45,000    | ← Your process
| CRM Migration       | $67,000    |
| System Integration  | $95,000    |
| ERP Implementation  | $125,000   | ← Maximum

**How Total Cost is Calculated:**
```typescript
Total Cost = 
  upfrontCosts + 
  trainingCosts + 
  consultingCosts + 
  (softwareCost × 12)  // 1 year of software
```

**Portfolio Range:**
- Minimum: $15,000
- Maximum: $125,000
- Range: $125,000 - $15,000 = $110,000

**Invoice Processing Cost Factor:**
```
cost_factor = ($45,000 - $15,000) / $110,000
            = $30,000 / $110,000
            = 0.273
            = 27.3%
```

### Interpretation

```
0% (0.0)  = Cheapest process in portfolio (at minimum)
50% (0.5) = Halfway between cheapest and most expensive
100% (1.0) = Most expensive process in portfolio (at maximum)
27.3%     = Invoice Processing is in the lower-mid range (relatively cheap)
```

---

## Complexity Factor Calculation

### Formula
```typescript
const complexity_factor = complexityIndex / 10;
```

### What This Means

Unlike cost and time, complexity uses a **fixed 0-10 scale** from the workflow builder, not portfolio normalization.

```
Complexity Factor = Complexity Index / 10
```

### Visual Example

```
Complexity Index: 6.2/10

complexity_factor = 6.2 / 10
                  = 0.62
                  = 62%
```

### Interpretation

```
0% (0.0)   = Minimal complexity (0/10)
50% (0.5)  = Moderate complexity (5/10)
100% (1.0) = Maximum complexity (10/10)
62%        = Above average complexity
```

---

## The Complete Weighted Calculation

### Formula
```typescript
implementation_effort = 
  (0.5 × cost_factor) + 
  (0.3 × time_factor) + 
  (0.2 × complexity_factor)
```

### Invoice Processing Example

Using our calculated factors:
- Cost Factor: 27.3%
- Time Factor: 11.1%
- Complexity Factor: 62.0%

```
Implementation Effort = (0.5 × 0.273) + (0.3 × 0.111) + (0.2 × 0.620)
                      = 0.1365 + 0.0333 + 0.124
                      = 0.294
                      = 29.4%
```

### Breakdown by Component

| Component   | Factor | Weight | Contribution |
|-------------|--------|--------|--------------|
| Cost        | 27.3%  | 50%    | 13.65%       |
| Time        | 11.1%  | 30%    | 3.33%        |
| Complexity  | 62.0%  | 20%    | 12.40%       |
| **TOTAL**   |        |        | **29.4%**    |

---

## How Changes Affect the Score

### Scenario 1: Change Time from 8 → 35 weeks

**New Time Factor:**
```
time_factor = (35 - 4) / 36
            = 31 / 36
            = 0.861
            = 86.1%
```

**New Implementation Effort:**
```
= (0.5 × 0.273) + (0.3 × 0.861) + (0.2 × 0.620)
= 0.1365 + 0.2583 + 0.124
= 0.519
= 51.9%
```

**Impact:**
- Time Factor: 11.1% → 86.1% (+75 points)
- Weighted Impact: 75 × 0.30 = +22.5 points
- Total Effort: 29.4% → 51.9% (+22.5 points)
- **Quadrant Change**: Quick Win → Growth Engine

---

### Scenario 2: Change Cost from $45,000 → $95,000

**New Cost Factor:**
```
cost_factor = ($95,000 - $15,000) / $110,000
            = $80,000 / $110,000
            = 0.727
            = 72.7%
```

**New Implementation Effort:**
```
= (0.5 × 0.727) + (0.3 × 0.111) + (0.2 × 0.620)
= 0.3635 + 0.0333 + 0.124
= 0.521
= 52.1%
```

**Impact:**
- Cost Factor: 27.3% → 72.7% (+45.4 points)
- Weighted Impact: 45.4 × 0.50 = +22.7 points
- Total Effort: 29.4% → 52.1% (+22.7 points)
- **Quadrant Change**: Quick Win → Growth Engine

---

### Scenario 3: Change Complexity from 6.2 → 9.5

**New Complexity Factor:**
```
complexity_factor = 9.5 / 10
                  = 0.95
                  = 95%
```

**New Implementation Effort:**
```
= (0.5 × 0.273) + (0.3 × 0.111) + (0.2 × 0.950)
= 0.1365 + 0.0333 + 0.190
= 0.360
= 36.0%
```

**Impact:**
- Complexity Factor: 62.0% → 95.0% (+33 points)
- Weighted Impact: 33 × 0.20 = +6.6 points
- Total Effort: 29.4% → 36.0% (+6.6 points)
- **No Quadrant Change**: Still Quick Win (< 40%)

---

## Key Insights

### 1. Portfolio-Relative Nature

**For Cost and Time:**
- Factors are **relative to your portfolio**, not absolute
- Adding a very expensive process makes all others cheaper (relatively)
- Adding a very fast process makes all others slower (relatively)

**Example:**
If you add a new process costing $200,000:
- Portfolio Max changes: $125,000 → $200,000
- Range changes: $110,000 → $185,000
- Invoice Processing cost factor: 27.3% → 16.2% ✅ **Lower score!**

### 2. Weight Importance

**Cost (50%) has the biggest impact:**
- A 50-point change in cost factor = 25-point total change
- Cost is the primary driver of implementation effort

**Time (30%) has moderate impact:**
- A 50-point change in time factor = 15-point total change
- Significant but not dominant

**Complexity (20%) has smallest impact:**
- A 50-point change in complexity = 10-point total change
- Least influential factor

### 3. The 40% Threshold

**Quadrant Boundaries:**
```
Implementation Effort ≤ 40% = "Low Effort" (Quick Wins or Nice to Have)
Implementation Effort > 40% = "High Effort" (Growth Engines or Deprioritize)
```

**To move from Growth Engine to Quick Win, you need:**
- Reduce total effort by at least 10-15 points (if near threshold)
- This could be achieved by:
  - Reducing cost by 20-30 points (×50% = 10-15 total)
  - Reducing time by 33-50 points (×30% = 10-15 total)
  - Reducing complexity by 50-75 points (×20% = 10-15 total)

---

## Edge Cases and Special Behaviors

### Edge Case 1: Only One Process

If you only have one process in your portfolio:

```
portfolioMinCost = $45,000
portfolioMaxCost = $45,000
costRange = $45,000 - $45,000 = $0

⚠️ Division by zero!
```

**Solution:** The code uses `Math.max(range, 1)` to prevent this:
```typescript
const costRange = Math.max(portfolioMaxCost - portfolioMinCost, 1);
// If range is 0, it becomes 1
```

**Result:**
```
cost_factor = ($45,000 - $45,000) / 1
            = 0 / 1
            = 0%
```

All single-process portfolios will have 0% cost and time factors.

---

### Edge Case 2: All Processes Identical

If all processes have the same cost and time:

```
All processes: $50,000, 12 weeks

portfolioMinCost = $50,000
portfolioMaxCost = $50,000
costRange = 1 (protected by Math.max)

cost_factor = ($50,000 - $50,000) / 1 = 0%
time_factor = (12 - 12) / 1 = 0%
```

**Result:** All processes will have identical scores, all in the lower-left quadrant.

---

### Edge Case 3: Process Below Minimum

This shouldn't happen, but if it did:

```
Your process: $10,000
Portfolio min: $15,000

cost_factor = ($10,000 - $15,000) / $110,000
            = -$5,000 / $110,000
            = -0.045
            = -4.5%
```

**Solution:** The code clamps the result:
```typescript
const implementation_effort = Math.max(0, Math.min(1, implementation_effort_raw));
```

Negative values become 0%, values over 100% become 100%.

---

## Debugging Your Calculation

### Check 1: Verify Your Portfolio Range

```javascript
console.log('All process times:', allTimes);
console.log('Time range:', portfolioMinTime, '-', portfolioMaxTime);
```

**Expected:** You should see variation, not all identical values.

### Check 2: Verify Your Process Values

```javascript
console.log('Invoice Processing time:', estimatedTime, 'weeks');
console.log('Invoice Processing cost:', estimatedCost);
```

**Expected:** These should match what you entered in the UI.

### Check 3: Verify Normalization

```javascript
console.log('Time factor:', time_factor);
console.log('Position:', estimatedTime, 'in range', portfolioMinTime, '-', portfolioMaxTime);
```

**Expected:** 
- If time is near min, factor should be near 0%
- If time is near max, factor should be near 100%
- If time is in middle, factor should be near 50%

### Check 4: Verify Weighted Combination

```javascript
console.log('Cost contribution:', 0.5 * cost_factor);
console.log('Time contribution:', 0.3 * time_factor);
console.log('Complexity contribution:', 0.2 * complexity_factor);
console.log('Total:', implementation_effort);
```

**Expected:** Total should equal sum of contributions.

---

## Summary

**Cost Factor:**
```
(Your Cost - Min Cost) / (Max Cost - Min Cost)
```
- Shows where you are in the cost range
- 0% = cheapest, 100% = most expensive
- Has 50% weight in final score

**Time Factor:**
```
(Your Time - Min Time) / (Max Time - Min Time)
```
- Shows where you are in the time range
- 0% = fastest, 100% = slowest
- Has 30% weight in final score

**Complexity Factor:**
```
Complexity Index / 10
```
- Fixed 0-10 scale (not portfolio-relative)
- 0% = simple, 100% = complex
- Has 20% weight in final score

**Implementation Effort:**
```
50% × Cost + 30% × Time + 20% × Complexity
```
- Combines all three factors
- 0-40% = Low Effort (Quick Wins or Nice to Have)
- 40-100% = High Effort (Growth Engines or Deprioritize)
