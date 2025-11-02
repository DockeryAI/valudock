# Impact, Speed, and Risk Scoring - Complete Explanation

## Question 1: Why Does Invoice Processing Have Risk = 2?

### Short Answer
Invoice Processing has a **risk score of 2** because it has workflow complexity metadata stored that classifies it as **"Simple"**.

### Detailed Explanation

**Risk scores come from workflow complexity**:
- **0** = No workflow metadata (no risk assessment yet)
- **2** = Simple workflow (low complexity)
- **5** = Moderate workflow (medium complexity)
- **8** = Complex workflow (high complexity)

**How Invoice Processing Got Risk = 2**:

1. Someone clicked the "Workflow" button next to Invoice Processing
2. They built a workflow with tasks/steps, inputs, and dependencies
3. The system calculated a **Complexity Index** using this formula:
   ```
   Complexity Index = (0.4 × Inputs Score) + (0.4 × Steps Score) + (0.2 × Dependencies Score)
   ```

4. The Complexity Index was mapped to a risk category:
   - **0.0 - 3.9** → Simple → Risk Value = 2
   - **4.0 - 6.9** → Moderate → Risk Value = 5
   - **7.0 - 10.0** → Complex → Risk Value = 8

5. This **Risk Value = 2** was stored in `process.complexityMetrics.riskValue`

### Where to Check/Change This

**To view the workflow complexity**:
1. Go to the Inputs tab
2. Find Invoice Processing in the table
3. Click the "Workflow" button
4. Look at the complexity metrics in the top-right corner

**To change the risk score**:
- Edit the workflow to add/remove:
  - **Inputs**: More inputs = higher complexity
  - **Steps**: More steps = higher complexity  
  - **Dependencies**: More connections = higher complexity

**Example for Invoice Processing (Risk = 2 / Simple)**:
```
Inputs: 3 inputs (Invoice PDF, Vendor Database, Approval Rules)
Steps: 5 steps (Receive → Extract → Validate → Route → Archive)
Dependencies: 4 connections between steps

Inputs Score: 3/10 = 3.0
Steps Score: 5/10 = 5.0  
Dependencies Score: 4/10 = 4.0

Complexity Index = (0.4 × 3.0) + (0.4 × 5.0) + (0.2 × 4.0)
                 = 1.2 + 2.0 + 0.8
                 = 4.0

Wait, this would be "Moderate" (≥4.0) with Risk = 5...
```

**Most Likely Scenario for Risk = 2**:
Invoice Processing probably has a **simpler** workflow, such as:
```
Inputs: 2 (Invoice, Rules)
Steps: 3 (Receive → Process → Archive)
Dependencies: 2

Complexity Index = (0.4 × 2) + (0.4 × 3) + (0.2 × 2)
                 = 0.8 + 1.2 + 0.4
                 = 2.4 (Simple category)
Risk Value = 2
```

---

## Question 2: How is Impact Score Calculated? (10 vs 0)

### Short Answer
**Impact score is normalized** based on the **cumulative dollar value** of each process compared to all other processes:
- **10/10** = Process with the **highest cumulative savings** across all processes
- **0/10** = Process with the **lowest cumulative savings** across all processes
- **Everything in between** is linearly scaled

### Formula Breakdown

#### Step 1: Calculate Raw Impact Value (Dollars)
```typescript
impactValue = annualNetSavings × timeHorizonYears
```

**Example with 5 Processes**:
```
Time Horizon: 3 years (36 months)

Process A: $50,000/year × 3 = $150,000
Process B: $92,500/year × 3 = $277,500  ← Invoice Processing
Process C: $120,000/year × 3 = $360,000
Process D: $35,000/year × 3 = $105,000
Process E: $200,000/year × 3 = $600,000
```

#### Step 2: Find Min and Max Across All Processes
```
minImpact = $105,000 (Process D)
maxImpact = $600,000 (Process E)
range = $600,000 - $105,000 = $495,000
```

#### Step 3: Normalize Each Process to 0-10 Scale
```typescript
impact_normalized = ((impactValue - minImpact) / (maxImpact - minImpact)) × 10
```

**Apply to Each Process**:
```
Process A: ((150,000 - 105,000) / 495,000) × 10 = 0.91 → 0.9/10
Process B: ((277,500 - 105,000) / 495,000) × 10 = 3.48 → 3.5/10  ← Invoice Processing
Process C: ((360,000 - 105,000) / 495,000) × 10 = 5.15 → 5.2/10
Process D: ((105,000 - 105,000) / 495,000) × 10 = 0.00 → 0.0/10  ← Minimum
Process E: ((600,000 - 105,000) / 495,000) × 10 = 10.0 → 10.0/10 ← Maximum
```

### What This Means

**Invoice Processing at 3.5/10 impact**:
- It's **below average** compared to other processes
- Process E ($600K cumulative) has 2.2× more impact
- Process C ($360K cumulative) has 1.3× more impact
- It's still better than Processes A and D

**To Get a 10/10 Impact Score**:
You need to have the **single highest cumulative savings** among ALL processes.

**To Get a 0/10 Impact Score**:
You need to have the **single lowest cumulative savings** among ALL processes.

### How to Increase Impact Score

#### Option 1: Increase Annual Net Savings
From the current $92,500/year, increase to $200,000+/year by:
- Adding more tasks (volume)
- Adding more CFO benefits (error reduction, revenue uplift)
- Increasing hourly wage
- Increasing time per task

#### Option 2: Extend Time Horizon
```
3 years: $92,500 × 3 = $277,500 → 3.5/10
5 years: $92,500 × 5 = $462,500 → 7.2/10 ✅ Much better!
```

#### Option 3: Remove/Deselect High-Impact Processes
If you deselect Process E ($600K), the new max becomes Process C ($360K):
```
New calculation for Invoice Processing:
impact = ((277,500 - 105,000) / (360,000 - 105,000)) × 10
       = (172,500 / 255,000) × 10
       = 6.76 → 6.8/10 ✅ Better!
```

---

## Question 3: What is a 10 for Speed vs a 0?

### Short Answer
- **10/10 Speed** = **Shortest implementation timeline** (fastest) across all processes
- **0/10 Speed** = **Longest implementation timeline** (slowest) across all processes
- Speed score is **inverted** from timeline (shorter time = higher speed)

### Formula Breakdown

#### Step 1: Collect All Implementation Timelines (Weeks)
```
Process A: 4 weeks
Process B: 8 weeks  ← Invoice Processing
Process C: 12 weeks
Process D: 24 weeks
Process E: 2 weeks
```

#### Step 2: Find Min and Max
```
minSpeed (shortest time) = 2 weeks (Process E)
maxSpeed (longest time) = 24 weeks (Process D)
range = 24 - 2 = 22 weeks
```

#### Step 3: Normalize Each Process (0-10 scale)
```typescript
// First normalize to 0-10 based on timeline
timelineNormalized = ((timeline - minSpeed) / (maxSpeed - minSpeed)) × 10

// Then INVERT so shorter time = higher speed
speed = 10 - timelineNormalized
```

**Apply to Each Process**:
```
Process E (2 weeks):
  timelineNormalized = ((2 - 2) / 22) × 10 = 0.0
  speed = 10 - 0.0 = 10.0/10 ✅ FASTEST (shortest timeline)

Process A (4 weeks):
  timelineNormalized = ((4 - 2) / 22) × 10 = 0.91
  speed = 10 - 0.91 = 9.1/10

Process B (8 weeks) ← Invoice Processing:
  timelineNormalized = ((8 - 2) / 22) × 10 = 2.73
  speed = 10 - 2.73 = 7.3/10

Process C (12 weeks):
  timelineNormalized = ((12 - 2) / 22) × 10 = 4.55
  speed = 10 - 4.55 = 5.5/10

Process D (24 weeks):
  timelineNormalized = ((24 - 2) / 22) × 10 = 10.0
  speed = 10 - 10.0 = 0.0/10 ❌ SLOWEST (longest timeline)
```

### Why Invert?

**Speed is the opposite of time**:
- **Fast** = Short timeline = Good ✅
- **Slow** = Long timeline = Bad ❌

So we invert the score:
- Shortest timeline (2 weeks) → Highest speed (10/10)
- Longest timeline (24 weeks) → Lowest speed (0/10)

### What Invoice Processing's 7.3/10 Speed Means

```
Invoice Processing: 8 weeks implementation
Speed: 7.3/10

Interpretation:
- Faster than average (7.3 > 5.0)
- 3× faster than the slowest process (24 weeks)
- 4× slower than the fastest process (2 weeks)
- Good speed, but not the quickest
```

### How to Increase Speed Score

#### Option 1: Reduce Your Implementation Timeline
```
Current: 8 weeks → 7.3/10 speed
Reduce to 4 weeks → 9.1/10 speed ✅
Reduce to 2 weeks → 10.0/10 speed ✅✅
```

**In the Implementation tab**:
1. Find Invoice Processing
2. Expand the process card
3. Change "Timeline (weeks)" from 8 to 4

#### Option 2: Increase Other Processes' Timelines
If other processes take longer, Invoice Processing becomes relatively faster.

**Not recommended** - this inflates speed scores artificially.

---

## Summary Table: All Score Types

### Impact Score (0-10)
| Score | Meaning | Dollar Value (Example) |
|-------|---------|----------------------|
| **10/10** | Highest cumulative savings | $600,000 (3 years @ $200K/year) |
| **7-9** | High savings | $400K - $550K |
| **5-6** | Above average | $300K - $400K |
| **3-4** | Below average | $200K - $300K |
| **1-2** | Low savings | $120K - $180K |
| **0/10** | Lowest cumulative savings | $105,000 (3 years @ $35K/year) |

**Key Point**: Impact is **relative to other processes**, not an absolute scale.

### Speed Score (0-10)
| Score | Meaning | Timeline (Example) |
|-------|---------|-------------------|
| **10/10** | Fastest implementation | 2 weeks |
| **7-9** | Fast | 4-8 weeks |
| **5-6** | Moderate | 10-14 weeks |
| **3-4** | Slow | 16-20 weeks |
| **1-2** | Very slow | 22-26 weeks |
| **0/10** | Slowest implementation | 24+ weeks |

**Key Point**: Speed is **inverted** - shorter timeline = higher score.

### Risk Score (0-10)
| Score | Meaning | Workflow Complexity |
|-------|---------|-------------------|
| **8/10** | Complex workflow | Complexity Index 7.0-10.0 |
| **5/10** | Moderate workflow | Complexity Index 4.0-6.9 |
| **2/10** | Simple workflow | Complexity Index 0.1-3.9 |
| **0/10** | No workflow metadata | Not yet assessed |

**Key Point**: Risk is **absolute** - based on workflow complexity, not relative to others.

### Effort Score (0-10)
| Score | Meaning | Implementation Cost (Example) |
|-------|---------|------------------------------|
| **10/10** | Highest cost/effort | $200,000 + 12 months |
| **7-9** | High effort | $120K - $180K |
| **5-6** | Moderate effort | $60K - $100K |
| **3-4** | Low effort | $30K - $50K |
| **1-2** | Very low effort | $15K - $25K |
| **0/10** | Lowest cost/effort | $10,000 + 1 month |

**Key Point**: Effort includes costs + timeline penalty ($5K per month).

---

## CFO Score Breakdown for Invoice Processing

### Actual Scores (Example)
```
Impact: 3.5/10 ($277,500 cumulative over 3 years)
Effort: 1.8/10 ($43,250 implementation cost)
Speed: 7.3/10 (8 weeks implementation)
Risk: 2.0/10 (Simple workflow)
```

### CFO Score Calculation
```
CFO Score = (0.6 × Impact/Effort) + (0.3 × Speed) - (0.1 × Risk)

CFO Score = (0.6 × 3.5/1.8) + (0.3 × 7.3) - (0.1 × 2.0)
          = (0.6 × 1.94) + 2.19 - 0.2
          = 1.16 + 2.19 - 0.2
          = 3.15
```

### Component Contribution
| Component | Weight | Score | Contribution | Notes |
|-----------|--------|-------|--------------|-------|
| **Impact/Effort** | 60% | 1.94 | +1.16 | Below average ratio |
| **Speed** | 30% | 7.3 | +2.19 | Good speed |
| **Risk** | 10% | 2.0 | -0.20 | Low risk penalty |
| **TOTAL** | 100% | — | **3.15** | Below average overall |

### How to Improve CFO Score

**Target: 5.0+ CFO Score**

#### Strategy 1: Increase Impact (Biggest Lever - 60% weight)
```
Current: 3.5/10 impact
Target: 7.0/10 impact (double the savings or extend timeline)

New CFO Score = (0.6 × 7.0/1.8) + 2.19 - 0.2
               = (0.6 × 3.89) + 2.19 - 0.2
               = 2.33 + 2.19 - 0.2
               = 4.32 ✅ Much better
```

#### Strategy 2: Reduce Effort
```
Current: 1.8/10 effort ($43,250)
Target: 1.0/10 effort ($25,000)

New CFO Score = (0.6 × 3.5/1.0) + 2.19 - 0.2
               = 2.10 + 2.19 - 0.2
               = 4.09 ✅ Better
```

#### Strategy 3: Increase Speed
```
Current: 7.3/10 speed (8 weeks)
Target: 9.5/10 speed (4 weeks)

New CFO Score = 1.16 + (0.3 × 9.5) - 0.2
               = 1.16 + 2.85 - 0.2
               = 3.81 ✅ Slight improvement
```

#### Strategy 4: Reduce Risk (Least Impact)
```
Current: 2.0/10 risk
Target: 0.0/10 risk (remove workflow metadata)

New CFO Score = 1.16 + 2.19 - (0.1 × 0)
               = 3.35 ✅ Tiny improvement (only 10% weight)
```

**Best Strategy**: Focus on **Impact** first (60% weight), then **Effort** (60% weight via denominator), then **Speed** (30% weight).

---

## Visual Examples

### Example 1: Invoice Processing (Current State)
```
╔════════════════════════════════════════════════════════════╗
║  INVOICE PROCESSING - CFO SCORE BREAKDOWN                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  📊 NORMALIZED SCORES (0-10 scale)                         ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ Impact:  3.5/10 ████░░░░░░░░░░░░░░░░                │  ║
║  │ Effort:  1.8/10 ██░░░░░░░░░░░░░░░░░░ (lower is better) │
║  │ Speed:   7.3/10 ███████████████░░░░░                │  ║
║  │ Risk:    2.0/10 ██░░░░░░░░░░░░░░░░░░ (lower is better) │
║  └────────────────────────────────────────────────────┘  ║
║                                                            ║
║  💰 RAW VALUES                                             ║
║  • Cumulative Impact: $277,500 (3 years @ $92,500/year)  ║
║  • Implementation Cost: $43,250                           ║
║  • Timeline: 8 weeks                                      ║
║  • Complexity: Simple (Index 2.4)                        ║
║                                                            ║
║  🎯 CFO SCORE: 3.15 / 10                                  ║
║  Quadrant: Nice to Haves                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Example 2: High-Performing Process
```
╔════════════════════════════════════════════════════════════╗
║  CONTRACT REVIEW - CFO SCORE BREAKDOWN                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  📊 NORMALIZED SCORES (0-10 scale)                         ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ Impact:  8.5/10 █████████████████░░░               │  ║
║  │ Effort:  2.1/10 ██░░░░░░░░░░░░░░░░░░                │  ║
║  │ Speed:   9.1/10 ██████████████████░░                │  ║
║  │ Risk:    0.0/10 ░░░░░░░░░░░░░░░░░░░░                │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                            ║
║  💰 RAW VALUES                                             ║
║  • Cumulative Impact: $540,000 (3 years @ $180K/year)    ║
║  • Implementation Cost: $48,000                           ║
║  • Timeline: 4 weeks                                      ║
║  • Complexity: No workflow metadata (0 risk)             ║
║                                                            ║
║  🎯 CFO SCORE: 7.88 / 10 ⭐                               ║
║  Quadrant: Quick Wins (Starting Process)                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Testing & Verification

### Check Invoice Processing's Risk Score

**In Browser Console**:
```javascript
// Look for this log when you open Opportunity Matrix tab:
📊 Scores for "Invoice Processing": {
  risk: "2.0",  ← This confirms risk = 2
  ...
}
```

**In UI**:
1. Go to Inputs tab
2. Find Invoice Processing
3. Click "Workflow" button
4. Check top-right corner for "Complexity: Simple" and "Risk: 2"

### Check Impact Score Calculation

**In Browser Console**:
```javascript
💰 IMPACT CALCULATION for "Invoice Processing": {
  annualNetSavings: "$92,500",
  timeHorizonYears: "3 years",
  impactValue: "$277,500 (savings × years)",  ← Raw dollar value
  impactNormalized: "3.5/10",                 ← Normalized to 0-10
  ...
}
```

### Check Speed Score

**In Browser Console**:
```javascript
📊 Scores for "Invoice Processing": {
  implementationWeeks: 8,
  speedNormalized: "7.3/10",  ← Higher = faster
  ...
}
```

**In Tooltip** (hover over Invoice Processing in matrix):
```
Speed: 7.3/10 (8 weeks)  ← Now shows weeks!
Timeline: 8 weeks (1.8 months)
```

---

## Key Takeaways

### Impact (0-10)
- **Relative** to other processes
- Based on **cumulative dollar savings** over time horizon
- **10** = Highest savings across all processes
- **0** = Lowest savings across all processes

### Speed (0-10)
- **Relative** to other processes
- Based on **implementation timeline** (inverted)
- **10** = Shortest timeline (fastest)
- **0** = Longest timeline (slowest)

### Risk (0-10)
- **Absolute** value from workflow complexity
- **0** = No workflow metadata (not yet assessed)
- **2** = Simple workflow (Complexity Index < 4.0)
- **5** = Moderate workflow (Complexity Index 4.0-6.9)
- **8** = Complex workflow (Complexity Index ≥ 7.0)

### Effort (0-10)
- **Relative** to other processes
- Based on **implementation costs + timeline penalty**
- **10** = Highest cost/longest timeline
- **0** = Lowest cost/shortest timeline

---

## Files Modified
- `/components/OpportunityMatrix.tsx`:
  - Added `implementationWeeks` to MatrixProcess interface
  - Updated tooltip to show weeks instead of months
  - Enhanced logging for Invoice Processing debugging
