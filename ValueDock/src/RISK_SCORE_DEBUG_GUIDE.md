# 🔍 Risk Score Debug Guide

## Expected Behavior

### ✅ Processes WITH Workflow Metadata
- **Should show:** Risk = 2, 5, or 8 based on complexity
- **Example:** Invoice Processing with 16 nodes → Risk = 8 (Complex)

### ✅ Processes WITHOUT Workflow Metadata  
- **Should show:** Risk = 0 (no risk factors defined)
- **Example:** Any process that hasn't had workflow editor opened

---

## Step-by-Step Test Procedure

### Test 1: Invoice Processing (Should Show Risk = 8)

#### Step 1: Open Workflow Editor
1. Go to **Inputs** screen
2. Find "Invoice Processing" process
3. Click **Workflow** button
4. **Check Console - Should See:**
   ```
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
   ```

#### Step 2: Load Template (if not already loaded)
1. Click **Templates** in toolbar
2. Select "Invoice Processing (Accounts Payable)"
3. Click **Load Template**
4. **Check Console - Should See:**
   ```
   📊 Workflow complexity calculated: [same as above]
   🔔 onComplexityUpdate TRIGGERED for processId: [process-id]
      Complexity data received: {inputsCount: 13, stepsCount: 16, ...}
   ```

#### Step 3: Close Workflow
1. Click **Close** or **X** button
2. **Check Console - Should See:**
   ```
   📊 Updated complexity for "Invoice Processing": {
     complexityIndex: 9.1,
     riskCategory: "Complex",
     riskValue: 8,
     inputsScore: 10,
     stepsScore: 8,
     dependenciesScore: 9.33
   }
   ✅ Process data updated in state for: [process-id]
   ```

#### Step 4: View Opportunity Matrix
1. Navigate to **Opportunity Matrix** tab
2. Find "Invoice Processing" on the grid
3. Hover over it
4. **Check Tooltip - Should Show:**
   ```
   Invoice Processing
   CFO Score: [value]
   Impact: [value]/10
   Effort: [value]/10
   Speed: [value]/10
   Risk: 8.0/10  ← KEY CHECK
   Timeline: [months]
   Quadrant: [quadrant]
   ```

5. **Check Console - Should See:**
   ```
   📊 ✅ Using stored risk value for "Invoice Processing": 8 (Category: Complex, Index: 9.1)
   📊 Normalized scores for "Invoice Processing": {
     risk: "8.0",
     rawRiskValue: 8,
     impact: "[value]",
     effort: "[value]",
     speed: "[value]"
   }
   ```

6. **Check Data Table:**
   - Scroll to "Process Prioritization Data" table
   - Find "Invoice Processing" row
   - Risk column should show: **8.0** (or normalized value)

---

### Test 2: Process Without Metadata (Should Show Risk = 0)

#### Step 1: Find Process Without Workflow
1. Go to **Inputs** screen
2. Find any process that you haven't opened the workflow for
3. Note the process name (e.g., "Customer Onboarding")

#### Step 2: View in Opportunity Matrix
1. Navigate to **Opportunity Matrix** tab
2. Find that process on the grid
3. Hover over it
4. **Check Tooltip - Should Show:**
   ```
   [Process Name]
   CFO Score: [value]
   Impact: [value]/10
   Effort: [value]/10
   Speed: [value]/10
   Risk: 0.0/10  ← Should be 0 (no workflow metadata)
   ```

5. **Check Console - Should See:**
   ```
   📊 ⚪ No workflow metadata for "[Process Name]" - Risk: 0 (no risk factors)
   📊 Normalized scores for "[Process Name]": {
     risk: "0.0",
     rawRiskValue: 0,
     impact: "[value]",
     effort: "[value]",
     speed: "[value]"
   }
   ```

---

## Console Log Emoji Guide

| Emoji | Meaning | When You See It |
|-------|---------|----------------|
| 📊 | Metrics/Calculation | Any risk calculation or complexity metric |
| ✅ | Success | When risk value is found and used |
| ⚪ | Zero/None | When process has no workflow metadata |
| 🔔 | Callback Triggered | When workflow sends complexity update |

---

## Troubleshooting

### Problem: Invoice Processing Shows Risk = 0

**Check 1: Was workflow editor opened?**
```
Console should show:
📊 Workflow complexity calculated: {inputsCount: 13, ...}
```
If NOT seen → Open workflow editor, load template, close it

**Check 2: Was complexity update triggered?**
```
Console should show:
🔔 onComplexityUpdate TRIGGERED for processId: [id]
```
If NOT seen → Close and reopen workflow editor

**Check 3: Was process data updated?**
```
Console should show:
📊 Updated complexity for "Invoice Processing": {riskValue: 8, ...}
✅ Process data updated in state for: [id]
```
If NOT seen → Check if processId matches

**Check 4: Is complexity stored in process?**
```
Console should show (when viewing matrix):
📊 ✅ Using stored risk value for "Invoice Processing": 8
```
If shows ⚪ instead → Complexity wasn't stored, repeat workflow editor steps

---

### Problem: Risk Shows Wrong Number

**Scenario 1: Shows 0 but should show 8**
- Workflow metadata not loaded
- Fix: Open workflow, load template, close, refresh matrix

**Scenario 2: Shows different number (e.g., 3.2 instead of 8.0)**
- This is CORRECT if normalized
- Raw risk = 8 (stored)
- Displayed risk = normalized relative to other processes
- Check console for "rawRiskValue: 8"

**Scenario 3: All processes show same risk**
- Only one process has metadata
- Others default to 0
- Add metadata to more processes

---

### Problem: Console Doesn't Show Logs

**Fix:**
1. Expand debug console (bottom-right)
2. Reload page
3. Open workflow editor
4. Should see logs immediately

**If still no logs:**
1. Check browser console (F12)
2. Look for errors
3. Verify WorkflowBuilder is rendering

---

## Expected Console Output (Complete Flow)

### When Loading Invoice Processing Template:

```
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

🔔 onComplexityUpdate TRIGGERED for processId: invoice-processing-123
   Complexity data received: {
     inputsCount: 13,
     stepsCount: 16,
     dependenciesCount: 14,
     inputsScore: 10,
     stepsScore: 8,
     dependenciesScore: 9.33
   }

📊 Updated complexity for "Invoice Processing": {
  complexityIndex: 9.1,
  riskCategory: "Complex",
  riskValue: 8,
  inputsScore: 10,
  stepsScore: 8,
  dependenciesScore: 9.33
}

✅ Process data updated in state for: invoice-processing-123
```

### When Viewing Opportunity Matrix:

```
📊 ✅ Using stored risk value for "Invoice Processing": 8 (Category: Complex, Index: 9.1)
📊 Normalized scores for "Invoice Processing": {
  risk: "8.0",
  rawRiskValue: 8,
  impact: "7.5",
  effort: "6.2",
  speed: "5.8"
}

📊 ⚪ No workflow metadata for "Customer Onboarding" - Risk: 0 (no risk factors)
📊 Normalized scores for "Customer Onboarding": {
  risk: "0.0",
  rawRiskValue: 0,
  impact: "6.2",
  effort: "4.5",
  speed: "7.0"
}
```

---

## How Risk Affects CFO Score

### Invoice Processing Example (Risk = 8)

**Without Risk Penalty:**
```
CFO Score = (0.6 × 7.5/6.2) + (0.3 × 5.8) - (0.1 × 0)
          = 0.73 + 1.74 - 0
          = 2.47
```

**With Risk Penalty (Risk = 8):**
```
CFO Score = (0.6 × 7.5/6.2) + (0.3 × 5.8) - (0.1 × 8)
          = 0.73 + 1.74 - 0.8
          = 1.67
```

**Impact:** CFO Score reduced by **0.8 points** due to complexity

### Process Without Metadata (Risk = 0)

**CFO Score:**
```
CFO Score = (0.6 × Impact/Effort) + (0.3 × Speed) - (0.1 × 0)
          = [calculation] - 0
          = [no risk penalty]
```

**Impact:** No risk penalty (no complexity data)

---

## Quick Verification Checklist

Use this to quickly verify everything is working:

- [ ] Debug console starts minimized
- [ ] Risk explanation visible in Opportunity Matrix
- [ ] Open Invoice Processing workflow
- [ ] Load template → Console shows "📊 Workflow complexity calculated"
- [ ] Console shows "🔔 onComplexityUpdate TRIGGERED"
- [ ] Close workflow → Console shows "📊 Updated complexity"
- [ ] Console shows "✅ Process data updated in state"
- [ ] View Matrix → Tooltip shows "Risk: 8.0/10"
- [ ] Console shows "📊 ✅ Using stored risk value: 8"
- [ ] Table shows Risk: 8.0
- [ ] Processes without workflow show Risk: 0.0
- [ ] Console shows "📊 ⚪ No workflow metadata" for those processes

---

## Summary

**Key Points:**
1. Processes WITH workflow metadata → Risk = 2, 5, or 8
2. Processes WITHOUT workflow metadata → Risk = 0
3. Invoice Processing should show Risk = 8 (Complex, 16 nodes)
4. Risk affects CFO Score: -0.1 × Risk (e.g., -0.8 for Risk=8)
5. Console logs track entire flow with emoji indicators

**If Risk Still Shows Wrong:**
1. Check all console logs in sequence
2. Verify processId matches
3. Ensure template loaded completely
4. Refresh Opportunity Matrix tab
5. Check if data persisted in state
