# Invoice Processing: Cost & CFO Score Calculation Explained

## Quick Answer: Quadrant Thresholds

### CFO Score Formula
```
CFO Score = (0.6 × Impact/Effort) + (0.3 × Speed) - (0.1 × Risk)
```

### Quadrant Classification (0-10 Scale)
The quadrant is determined by **Impact** and **Effort** scores (NOT CFO Score):

| Quadrant | Impact | Effort | Description |
|----------|--------|--------|-------------|
| **Quick Wins** ⭐ | ≥ 7.0 | ≤ 4.0 | High impact, low effort - **START HERE** |
| **Big Hitters** | ≥ 7.0 | > 4.0 | High impact, high effort - Major projects |
| **Nice to Haves** | < 7.0 | ≤ 4.0 | Low impact, low effort - Fill-in projects |
| **Deprioritize** | < 7.0 | > 4.0 | Low impact, high effort - Avoid these |

**Key Point**: There is NO CFO Score threshold for quadrants. Quadrants are based purely on Impact (≥7 vs <7) and Effort (≤4 vs >4).

The **CFO Score** is used for **ranking processes WITHIN each quadrant**. The process with the highest CFO Score in "Quick Wins" gets marked as the recommended starting point.

---

## Invoice Processing: Complete Cost Calculation

### 1. Current Process Cost (Before Automation)

#### Step 1: Calculate Monthly Time Cost
```typescript
// Raw inputs (example values)
taskVolume = 500 tasks/month
timePerTask = 30 minutes/task
hourlyWage = $25/hour (from process group)
automationCoverage = 90% (from implementation section)

// Calculate monthly time spent
monthlyTasks = 500 tasks/month
timePerTaskMinutes = 30 minutes
monthlyTimeTotalMinutes = 500 × 30 = 15,000 minutes
monthlyTimeHours = 15,000 ÷ 60 = 250 hours

// Calculate fully loaded hourly rate (includes overhead)
overheadRate = 0.40 (40% from global defaults: benefits, payroll tax, facilities, IT, HR)
fullyLoadedHourlyRate = $25 × (1 + 0.40) = $35/hour

// Monthly cost BEFORE automation
currentMonthlyTimeCost = 250 hours × $35/hour = $8,750/month
```

#### Step 2: Annualize the Cost
```typescript
currentProcessCost = $8,750/month × 12 months = $105,000/year
```

**Result**: Invoice Processing currently costs **$105,000/year** in labor and overhead.

---

### 2. New Process Cost (After Automation)

#### Step 1: Calculate Remaining Labor Cost
```typescript
// With 90% automation, only 10% of work remains manual
automatedTimeCost = $8,750 × (1 - 0.90) = $8,750 × 0.10 = $875/month

// Annualized manual labor cost
annualLaborCostAfterAutomation = $875 × 12 = $10,500/year
```

#### Step 2: Add Software Costs
```typescript
// Monthly software subscription (from implementation costs)
processSoftwareCost = $500/month

// Annual software cost
annualSoftwareCost = $500 × 12 = $6,000/year
```

#### Step 3: Total New Process Cost
```typescript
newProcessCost = $10,500 (labor) + $6,000 (software) = $16,500/year
```

**Result**: After automation, Invoice Processing costs **$16,500/year** (labor + software).

**Important**: The `newProcessCost` shown in Process Breakdown only includes **recurring monthly costs** (labor + software subscriptions). It does NOT include:
- Upfront implementation costs
- Training costs  
- Consulting costs

These one-time costs are accounted for separately in the payback period calculation.

---

### 3. Annual Savings Calculation

```typescript
// Net cost reduction
netCostReduction = $105,000 - $16,500 = $88,500/year

// This is the base labor savings
// Additional CFO benefits may include:
// - Error reduction savings
// - Compliance risk reduction
// - Revenue uplift (faster invoice processing → faster cash collection)
// - Prompt payment discounts captured

annualNetSavings = netCostReduction + errorSavings + complianceSavings + revenueSavings
```

**Example**: If Invoice Processing has additional benefits:
- Error reduction: $5,000/year (fewer invoice errors = less rework)
- Compliance savings: $2,000/year (better audit trail)
- Prompt payment benefit: $3,000/year (capturing 2% early payment discounts)

```
annualNetSavings = $88,500 + $5,000 + $2,000 + $3,000 = $98,500/year
```

---

## CFO Score Calculation for Invoice Processing

The CFO Score uses **four factors**, each normalized to a 0-10 scale, then weighted:

### Raw Values (Dollar Amounts & Months)

```typescript
// IMPACT: Business value over time horizon
impactValue = annualNetSavings × timeHorizonYears
            = $98,500 × 3 years = $295,500

// EFFORT: Total implementation cost + timeline penalty
implementationCosts = upfrontCosts + trainingCosts + consultingCosts + (softwareCost × 12)
                    = $15,000 + $5,000 + $8,000 + ($500 × 12)
                    = $15,000 + $5,000 + $8,000 + $6,000
                    = $34,000

implementationMonths = 2 months
effortValue = $34,000 + (2 months × $5,000) = $34,000 + $10,000 = $44,000

// SPEED: Implementation timeline (shorter = faster = higher score after inversion)
speedValue = 2 months (will be inverted: shorter is better)

// RISK: Based on workflow complexity metrics
// For Invoice Processing with NO workflow metadata:
riskValue = 0 (no risk data = no risk penalty)

// If workflow WAS configured, risk would be based on complexity index:
// - Simple (Index 0.1-3.9): Risk = 2
// - Moderate (Index 4.0-6.9): Risk = 5  
// - Complex (Index 7.0-10.0): Risk = 8
```

---

### Normalization to 0-10 Scale

To ensure fair comparison, all values are normalized:

```typescript
// Find min/max across ALL processes
minImpact = $50,000    (e.g., smallest process)
maxImpact = $500,000   (e.g., largest process)
minEffort = $20,000
maxEffort = $200,000
minSpeed = 1 month
maxSpeed = 12 months
minRisk = 0
maxRisk = 8

// Normalize Invoice Processing values
impact_normalized = ((295,500 - 50,000) / (500,000 - 50,000)) × 10
                  = (245,500 / 450,000) × 10
                  = 5.46 (0-10 scale)

effort_normalized = ((44,000 - 20,000) / (200,000 - 20,000)) × 10
                  = (24,000 / 180,000) × 10
                  = 1.33 (0-10 scale)

// Speed is INVERTED (shorter time = higher score)
speed_normalized = ((12 - 2) / (12 - 1)) × 10
                 = (10 / 11) × 10
                 = 9.09 (0-10 scale)

risk_normalized = ((0 - 0) / (8 - 0)) × 10
                = 0.0 (0-10 scale)
```

**Key Insight**: Normalization ensures:
- A $300K process competes fairly with a $50K process
- A 2-month timeline is compared properly to a 12-month timeline
- All processes are on the same 0-10 scale

---

### CFO Score Calculation

```typescript
// Apply CFO-weighted formula
CFO_Score = (0.6 × impact/effort) + (0.3 × speed) - (0.1 × risk)

// Substitute normalized values
impact = 5.46
effort = 1.33
speed = 9.09
risk = 0.0

// Calculate
impact_to_effort_ratio = 5.46 / 1.33 = 4.11
CFO_Score = (0.6 × 4.11) + (0.3 × 9.09) - (0.1 × 0.0)
          = 2.47 + 2.73 - 0.0
          = 5.20
```

**Invoice Processing CFO Score: 5.20**

---

### CFO Score Component Breakdown

| Component | Weight | Normalized Score | Weighted Contribution |
|-----------|--------|------------------|----------------------|
| **Impact/Effort** | 60% | 4.11 (ratio) | +2.47 |
| **Speed** | 30% | 9.09 | +2.73 |
| **Risk** | 10% | 0.0 | -0.0 |
| **TOTAL** | 100% | — | **5.20** |

### What This Means

**Impact/Effort (60% weight)**: 
- Invoice Processing has a **good** ratio (5.46 ÷ 1.33 = 4.11)
- For every $1 of effort, you get $4.11 of impact
- This is the most important factor for CFOs

**Speed (30% weight)**:
- 2-month implementation = 9.09/10 score
- Fast projects deliver value quickly = higher CFO appeal
- Quick ROI realization is critical for CFOs

**Risk (10% weight)**:
- No workflow complexity data = 0 risk penalty
- If Invoice Processing had a "Complex" workflow (Risk = 8), CFO Score would be:
  - `5.20 - (0.1 × 8) = 5.20 - 0.8 = 4.40` ❌ Lower score

---

## Quadrant Classification for Invoice Processing

```typescript
// Use normalized scores for quadrant classification
impact = 5.46
effort = 1.33

// Check thresholds
if (impact >= 7.0 && effort <= 4.0) → "Quick Wins"
if (impact >= 7.0 && effort > 4.0)  → "Big Hitters"
if (impact < 7.0 && effort <= 4.0)  → "Nice to Haves"
if (impact < 7.0 && effort > 4.0)   → "Deprioritize"

// Invoice Processing classification
impact = 5.46 < 7.0 ❌
effort = 1.33 ≤ 4.0 ✅

→ Quadrant: "Nice to Haves"
```

**Why "Nice to Haves"?**
- Impact score is 5.46/10 (decent savings, but not exceptional)
- Effort score is 1.33/10 (very easy to implement)
- This is a **low-hanging fruit** but not a strategic game-changer

**To Move to "Quick Wins"**, Invoice Processing would need:
1. **Higher Impact**: Increase savings from $98,500 to ~$180,000/year
2. OR **More Time Horizon**: Extend from 3 years to 5+ years (impact × 1.67)
3. OR **Additional CFO Benefits**: Add more error/compliance/revenue savings

---

## How Time Horizon Affects Everything

### Current State (3-year horizon)
```
annualNetSavings = $98,500/year
timeHorizonYears = 3
impactValue = $98,500 × 3 = $295,500
impact_normalized = 5.46/10
Quadrant: "Nice to Haves"
```

### Extended to 5 Years
```
annualNetSavings = $98,500/year (same)
timeHorizonYears = 5
impactValue = $98,500 × 5 = $492,500 ⬆️
impact_normalized = 9.82/10 ⬆️ (now above 7.0 threshold!)
Quadrant: "Quick Wins" ⭐ (if effort stays below 4.0)
```

**Key Takeaway**: Moving the time horizon slider from 3 years to 5 years can shift processes from "Nice to Haves" to "Quick Wins" because the cumulative impact grows while implementation effort stays constant.

---

## Visual Summary: Invoice Processing

```
┌─────────────────────────────────────────────────────────────┐
│                    INVOICE PROCESSING                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CURRENT STATE                                               │
│  • 500 invoices/month × 30 min each = 250 hours/month       │
│  • Fully loaded rate: $35/hour                              │
│  • Annual cost: $105,000                                     │
│                                                              │
│  AUTOMATED STATE                                             │
│  • 90% automation coverage                                   │
│  • 25 hours/month manual work = $10,500/year                │
│  • Software cost: $500/month = $6,000/year                  │
│  • Annual cost: $16,500                                      │
│                                                              │
│  ANNUAL SAVINGS                                              │
│  • Net cost reduction: $88,500                              │
│  • Error reduction: $5,000                                   │
│  • Compliance savings: $2,000                               │
│  • Prompt payment benefit: $3,000                           │
│  • TOTAL: $98,500/year                                       │
│                                                              │
│  IMPLEMENTATION                                              │
│  • Upfront costs: $15,000                                    │
│  • Training: $5,000                                          │
│  • Consulting: $8,000                                        │
│  • Timeline: 2 months                                        │
│  • Total effort: $44,000                                     │
│                                                              │
│  CFO SCORE BREAKDOWN (0-10 scale)                           │
│  • Impact: 5.46 (cumulative savings over 3 years)          │
│  • Effort: 1.33 (low implementation cost & time)            │
│  • Speed: 9.09 (2 months = fast delivery)                  │
│  • Risk: 0.0 (no complexity data)                           │
│                                                              │
│  WEIGHTED CFO SCORE                                          │
│  = (0.6 × 5.46/1.33) + (0.3 × 9.09) - (0.1 × 0.0)          │
│  = (0.6 × 4.11) + 2.73 - 0                                  │
│  = 2.47 + 2.73                                              │
│  = 5.20                                                      │
│                                                              │
│  QUADRANT: Nice to Haves                                    │
│  (Impact 5.46 < 7.0, Effort 1.33 ≤ 4.0)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Improve Invoice Processing's CFO Score

### Option 1: Increase Business Impact ⬆️
**Current**: $98,500/year  
**Goal**: $180,000/year (to reach Impact ≥ 7.0)

**Strategies**:
1. **Add Revenue Impact**: Faster invoice processing → faster payment collection
   - If you process invoices 5 days faster, calculate cash flow acceleration value
   - Example: $2M in monthly invoices × 5 days faster × cost of capital (6%) = $16,000/year

2. **Quantify Compliance Savings**: Better audit trails, fewer penalties
   - Add explicit compliance risk reduction values

3. **Add Error Reduction**: Fewer manual errors = less rework
   - Calculate: error rate × cost per error × annual volume

4. **Capture Prompt Payment Discounts**: 2% discount if paid within 10 days
   - Calculate: eligible invoices × discount rate × capture improvement

### Option 2: Extend Time Horizon 📅
**Current**: 3 years → Impact = $295,500  
**Target**: 5 years → Impact = $492,500 (Impact score: 9.82/10 ✅)

Simply move the slider in the Impact & ROI section from 36 months to 60 months.

### Option 3: Reduce Implementation Effort ⬇️
**Current**: $44,000 effort  
**Goal**: Under $40,000

**Strategies**:
1. Use pre-built integrations instead of custom consulting
2. Reduce training costs with self-service onboarding
3. Negotiate lower upfront software costs

### Option 4: Speed Up Implementation ⚡
**Current**: 2 months (already excellent!)  
**Already optimized**: 9.09/10 speed score

---

## Common Questions

### Q1: Why does Invoice Processing have Risk = 0?
**A**: No workflow complexity metadata has been configured. To add risk data:
1. Click the "Workflow" button next to Invoice Processing
2. Build the workflow with tasks, inputs, and dependencies
3. System auto-calculates complexity: inputs (40%) + steps (40%) + dependencies (20%)
4. Risk value assigned: Simple (2), Moderate (5), or Complex (8)

### Q2: How is Invoice Processing different from, say, Contract Review?
**A**: Each process may have:
- Different task volumes (500 invoices vs 50 contracts)
- Different time per task (30 min vs 120 min)
- Different hourly wages (AP clerk $25 vs Legal analyst $50)
- Different automation coverage (90% vs 60%)
- Different implementation costs ($44K vs $120K)
- Different CFO benefits (prompt payment vs compliance risk)

All these factors combine to create unique Impact, Effort, Speed, and Risk scores.

### Q3: What if Invoice Processing is in my "Quick Wins" quadrant?
**A**: If Invoice Processing shows Impact ≥ 7.0 and Effort ≤ 4.0:
- It's a candidate for immediate implementation
- The process with the **highest CFO Score** in Quick Wins gets a ⭐ (recommended starting point)
- CFO Score ranks processes WITHIN each quadrant

### Q4: Should I always start with Quick Wins?
**A**: Generally yes, because:
- High impact + Low effort = Best ROI
- Fast implementation = Quick value delivery
- Builds momentum for bigger projects

However, strategic considerations may override:
- Dependency chains (Process B needs Process A first)
- Resource availability (team bandwidth)
- Business priorities (compliance deadline)

---

## Summary Table: Quadrant Thresholds

| Metric | Quick Wins ⭐ | Big Hitters | Nice to Haves | Deprioritize |
|--------|--------------|-------------|---------------|--------------|
| **Impact** | ≥ 7.0 | ≥ 7.0 | < 7.0 | < 7.0 |
| **Effort** | ≤ 4.0 | > 4.0 | ≤ 4.0 | > 4.0 |
| **Typical $** | High savings, low cost | High savings, high cost | Low savings, low cost | Low savings, high cost |
| **Strategy** | **DO FIRST** | Plan & phase | Fill capacity gaps | Avoid unless critical |
| **CFO View** | Maximum efficiency | Strategic investments | Nice extras | Resource waste |

**Remember**: CFO Score is for **ranking within quadrants**, NOT for quadrant classification!

---

## Files Referenced
- `/components/OpportunityMatrix.tsx` - Lines 70-88 (quadrant logic & CFO formula)
- `/components/utils/calculations.ts` - Lines 620-770 (cost calculations)
- `/TIME_HORIZON_AND_COST_IMPROVEMENTS.md` - Recent implementation details
