# 🎯 Visual Test Guide: Risk Score Calculation

## Quick 5-Minute Test

### ✅ Test 1: Debug Console (10 seconds)
**What to check:**
1. Open app
2. Look at bottom-right corner
3. **Expected:** Console should be minimized (just a bar at bottom)
4. Click on it to expand
5. **Expected:** Console opens and shows logs

**Status:** ✅ PASS if console starts minimized

---

### ✅ Test 2: Risk Score Explanation (30 seconds)
**What to check:**
1. Navigate to **Opportunity Matrix** tab
2. Scroll to "How Processes Are Weighted" section
3. Look for **"Risk Score Calculation:"** heading
4. **Expected:** Should see formula and explanation:
   ```
   Complexity Index = (0.4 × Inputs) + (0.4 × Steps) + (0.2 × Dependencies)
   Simple (0-3.9, Risk=2), Moderate (4-6.9, Risk=5), Complex (7+, Risk=8)
   ```

**Status:** ✅ PASS if explanation is visible

---

### ✅ Test 3: Risk Score Updates from Workflow (3 minutes)

#### Step 1: Check Current State
1. Go to **Opportunity Matrix**
2. Find "Invoice Processing" (if it exists)
3. Hover over it
4. Note the **Risk:** value in tooltip
5. **Current State:** Might show 0.0 or some value

#### Step 2: Load Workflow Template
1. Go to **Inputs** screen
2. Find or create "Invoice Processing" process
3. Click **Workflow** button
4. Click **Templates** in toolbar
5. Select "Invoice Processing (Accounts Payable)"
6. Click **Load Template**
7. **Expected:** 16 nodes appear on canvas

#### Step 3: Check Console (IMPORTANT!)
1. Expand debug console (bottom-right)
2. **Expected to see:**
   ```
   📊 Workflow complexity calculated: {inputsCount: 13, stepsCount: 16, ...}
     - Inputs: 13 (Score: 10)
     - Steps: 16 (Score: 8)
     - Dependencies: 14 (Score: 9.33)
   ```

#### Step 4: View Complexity Dialog
1. Click **Advanced** button in workflow toolbar
2. **Expected to see:**
   ```
   Workflow Complexity Metrics
   
   Total Inputs: 13
   Total Steps: 16
   Total Dependencies: 14
   
   Complexity Index: 9.1
   Risk Category: COMPLEX
   Risk Value: 8
   ```

#### Step 5: Close Workflow & Check Matrix
1. Click **X** or **Close** to return to main app
2. **Expected console log:**
   ```
   📊 Updated complexity for "Invoice Processing": {
     complexityIndex: 9.1,
     riskCategory: "Complex",
     riskValue: 8
   }
   ```
3. Navigate to **Opportunity Matrix** tab
4. Find "Invoice Processing" on the 2x2 grid
5. Hover over it
6. **Expected tooltip:**
   ```
   Invoice Processing
   CFO Score: [some value]
   Impact: [value]/10
   Effort: [value]/10
   Speed: [value]/10
   Risk: 8.0/10  ← KEY CHECK: Should show 8.0 not 0.0
   ```

#### Step 6: Check Console Again
1. While on Opportunity Matrix, check console
2. **Expected to see:**
   ```
   📊 Using stored risk value for "Invoice Processing": 8 (Category: Complex, Index: 9.1)
   📊 Normalized scores for "Invoice Processing": {
     risk: "8.0",
     rawRiskValue: 8,
     impact: "7.5",
     effort: "6.2",
     speed: "5.8"
   }
   ```

#### Step 7: Check Data Table
1. Scroll down to "Process Prioritization Data" table
2. Find "Invoice Processing" row
3. Look at **Risk** column
4. **Expected:** Shows 8.0 (or normalized value)

**Status:** ✅ PASS if:
- Console shows complexity calculations
- Tooltip shows Risk: 8.0/10
- Table shows Risk: 8.0
- Console shows "Using stored risk value: 8"

---

## Detailed Console Output Reference

### What You Should See (Step by Step)

#### When Loading Workflow Template:
```
✅ Step 1: Workflow Builder calculates complexity
📊 Workflow complexity calculated: {
  inputsCount: 13,
  stepsCount: 16,
  dependenciesCount: 14,
  inputsScore: 10,
  stepsScore: 8,
  dependenciesScore: 9.33
}
  - Inputs: 13 (Score: 10)
  - Steps: 16 (Score: 8)
  - Dependencies: 14 (Score: 9.33)

✅ Step 2: App.tsx receives complexity update
📊 Updated complexity for "Invoice Processing": {
  complexityIndex: 9.1,
  riskCategory: "Complex",
  riskValue: 8,
  inputsScore: 10,
  stepsScore: 8,
  dependenciesScore: 9.33
}
```

#### When Viewing Opportunity Matrix:
```
✅ Step 3: Matrix reads stored risk value
📊 Using stored risk value for "Invoice Processing": 8 (Category: Complex, Index: 9.1)

✅ Step 4: Matrix normalizes scores for display
📊 Normalized scores for "Invoice Processing": {
  risk: "8.0",
  rawRiskValue: 8,
  impact: "7.5",
  effort: "6.2",
  speed: "5.8"
}
```

---

## Visual Checklist

### Before Loading Workflow Template
```
┌─────────────────────────────────────────────┐
│ Invoice Processing                          │
├─────────────────────────────────────────────┤
│ CFO Score: 2.45                            │
│ Impact: 7.5/10                             │
│ Effort: 6.2/10                             │
│ Speed: 5.8/10                              │
│ Risk: 0.0/10  ← Shows 0 before workflow   │
│ Timeline: 6 months                          │
│ Quadrant: Big Hitters                       │
└─────────────────────────────────────────────┘
```

### After Loading Workflow Template
```
┌─────────────────────────────────────────────┐
│ Invoice Processing                          │
├─────────────────────────────────────────────┤
│ CFO Score: 1.65  ← Changed (risk penalty)  │
│ Impact: 7.5/10                             │
│ Effort: 6.2/10                             │
│ Speed: 5.8/10                              │
│ Risk: 8.0/10  ← NOW SHOWS 8.0! ✅         │
│ Timeline: 6 months                          │
│ Quadrant: Big Hitters                       │
└─────────────────────────────────────────────┘
```

### CFO Score Impact
```
Before (Risk = 0):
CFO Score = (0.6 × 7.5/6.2) + (0.3 × 5.8) - (0.1 × 0)
          = 0.73 + 1.74 - 0
          = 2.47

After (Risk = 8):
CFO Score = (0.6 × 7.5/6.2) + (0.3 × 5.8) - (0.1 × 8)
          = 0.73 + 1.74 - 0.8
          = 1.67  ← Reduced by 0.8 points
```

---

## Troubleshooting Visual Guide

### Problem: Risk still shows 0.0
**What you'll see:**
```
❌ Tooltip shows:
Risk: 0.0/10

❌ Console shows:
📊 Using fallback risk calculation for "Invoice Processing": 50
(No "Using stored risk value" message)
```

**Fix:**
1. Open workflow editor again
2. Click any node
3. Add any metadata (trigger, input, output, or dependency)
4. Save workflow
5. Close and reopen matrix

**After fix, you should see:**
```
✅ Console shows:
📊 Workflow complexity calculated: {...}
📊 Updated complexity for "Invoice Processing": {riskValue: 8, ...}

✅ Tooltip shows:
Risk: 8.0/10
```

---

### Problem: Console doesn't show complexity logs
**What you'll see:**
```
❌ No messages like:
📊 Workflow complexity calculated
📊 Updated complexity
📊 Using stored risk value
```

**Fix:**
1. Check console is expanded (click bottom-right)
2. Reload page
3. Open workflow editor
4. Load template again
5. Logs should appear immediately

---

### Problem: Risk shows wrong number
**What you'll see:**
```
⚠️ Console shows:
📊 Using stored risk value: 8
📊 Normalized scores: {risk: "3.2", rawRiskValue: 8}

⚠️ Tooltip shows:
Risk: 3.2/10  (not 8.0)
```

**Explanation:** This is CORRECT!
- Raw risk value = 8 (stored correctly)
- Normalized risk = 3.2 (relative to other processes)
- If other processes have higher risk values, Invoice Processing will show lower on 0-10 scale
- The -0.8 penalty still applies correctly to CFO Score

---

## Success Criteria

### ✅ All Tests Pass When:

1. **Debug Console**
   - Starts minimized
   - Can be expanded
   - Shows all logs

2. **Risk Explanation**
   - Visible in Opportunity Matrix
   - Shows formula
   - Explains categories

3. **Risk Calculation**
   - Console logs show all 3 steps:
     - Complexity calculated
     - Process updated
     - Matrix uses stored value
   - Tooltip shows non-zero risk
   - Table shows non-zero risk
   - CFO Score changes when risk changes

4. **Live Updates**
   - Edit workflow metadata
   - Risk updates automatically
   - No need to reload page

---

## Quick Reference: What Risk Values Mean

| Risk Value | Category | What It Means                  | CFO Score Impact |
|-----------|----------|--------------------------------|------------------|
| 2         | Simple   | Easy to implement, low risk    | -0.2             |
| 5         | Moderate | Normal complexity              | -0.5             |
| 8         | Complex  | High complexity, higher risk   | **-0.8**         |

### Invoice Processing (Complex = 8)
- 13 unique systems/triggers
- 16 workflow steps
- 14 team dependencies
- **Result:** Higher risk = Lower CFO Score

---

## Summary

This fix ensures that:
1. ✅ Debug console starts minimized
2. ✅ Risk calculation is explained clearly
3. ✅ Risk scores update dynamically from workflow metadata
4. ✅ All calculations are logged for debugging
5. ✅ Matrix displays correct risk values
6. ✅ CFO scores reflect risk properly

**Time to test:** ~3-5 minutes
**Expected result:** Risk score updates from 0.0 to 8.0 after loading workflow template
