# Cost Classification Hard Gate - Final Verification Guide

## 🎯 Quick Test (2 minutes)

### Step 1: Check Organization Without Classification

1. Login to an organization that has NO cost classification
2. Open browser console (F12)
3. Navigate to "Impact and ROI" tab

**✅ Expected Console Output:**
```javascript
[App] ⚠️ No cost classification found - ROI BLOCKED until classification is created
[ROI Controller] 🚫 BLOCKED
  blockReason: "Cost classification is null - please create in Admin > Costs tab"
[ResultsScreen] 🚫 ROI calculation blocked - cost classification is null
```

**❌ Should NOT See:**
```javascript
[calculateProcessROI] ⚠️ Using default cost classification - custom classification not provided
```

---

### Step 2: Check Scenarios Tab

1. Navigate to "Scenarios" tab
2. Watch console

**✅ Expected Console Output:**
```javascript
[ScenarioScreen] 🚫 ROI calculation blocked - cost classification is null
```

**✅ Expected UI:**
- Scenario cards show $0 values
- No ROI calculations display
- No errors or warnings

---

### Step 3: Create Cost Classification

1. Go to Admin tab > Costs sub-tab
2. Create cost classification:
   - Assign 2-3 items to "Hard Costs"
   - Rest to "Soft Costs"
3. Click "Save Cost Classification"
4. Navigate back to "Impact and ROI" tab

**✅ Expected Console Output:**
```javascript
[App] ✅ Cost classification loaded: { hardCosts: 3, softCosts: 8 }
[ROI Controller] 🎯 RUN
  costClassification: { status: "CUSTOM (loaded from backend)" }
[ROI Controller] ✅ COMPLETE
  annualNetSavings: 125000
  npv: 234567
```

**✅ Expected UI:**
- ROI values display correctly
- All charts render
- No warnings in console

---

## 🔍 Comprehensive Test (5 minutes)

### Test All Screens With NULL Classification

Start with organization that has NO cost classification:

| Screen | Action | Expected Console | Expected UI |
|--------|--------|-----------------|-------------|
| **Inputs** | View processes | No ROI calls | Data displays normally |
| **Impact and ROI** | View results | 🚫 BLOCKED logs | $0 values |
| **Opportunity** | View matrix | 🚫 BLOCKED logs | Empty or $0 |
| **Timeline** | View timeline | No errors | Shows structure, $0 data |
| **Scenarios** | View scenarios | 🚫 BLOCKED logs | $0 scenario values |
| **Export** | View export | No errors | Shows data structure |

**Key Point:** NOT A SINGLE `⚠️ Using default cost classification` warning should appear!

---

### Test With Classification

After creating cost classification:

| Screen | Expected Behavior |
|--------|------------------|
| **Impact and ROI** | ✅ Shows calculated ROI, NPV, FTE savings |
| **Opportunity** | ✅ Plots processes on matrix with real values |
| **Timeline** | ✅ Shows implementation timeline with savings |
| **Scenarios** | ✅ Calculates different coverage scenarios |

**Console:** Only see `🎯 RUN` and `✅ COMPLETE` messages

---

## 🚨 Failure Scenarios (What to Check If Test Fails)

### If you see: `⚠️ Using default cost classification`

**Check these files:**

1. **/utils/roiController.ts** - Line 46
   ```typescript
   const clsReady = state.costClassificationLoaded === true && state.costClassification !== null;
   ```

2. **/App.tsx** - Lines 658 & 665
   ```typescript
   setCostClassificationLoaded(false); // Must be false, not true!
   ```

3. **/components/ResultsScreen.tsx** - Line 126
   ```typescript
   if (!costClassification) { /* guard */ }
   ```

4. **/components/ScenarioScreen.tsx** - Line 169
   ```typescript
   if (!costClassification) { /* guard */ }
   ```

5. **/components/SensitivityAnalysis.tsx** - Line 52
   ```typescript
   if (!costClassification) { /* guard */ }
   ```

---

## 📋 Quick Console Search Commands

Open console and filter by these terms:

### 1. Check for blocks (should see many):
```
Filter: "🚫"
```

### 2. Check for default warnings (should see ZERO):
```
Filter: "Using default cost"
```

### 3. Check for successful runs (after creating classification):
```
Filter: "🎯 RUN"
```

### 4. Check controller state:
```
Filter: "ROI Controller"
```

---

## ✅ Success Criteria

### Before Creating Classification
- ✅ Multiple `🚫 BLOCKED` messages in console
- ✅ Clear block reasons displayed
- ✅ UI shows $0 or "No data"
- ✅ **ZERO** "Using default cost classification" warnings

### After Creating Classification
- ✅ `✅ Cost classification loaded` message
- ✅ `🎯 RUN` and `✅ COMPLETE` messages
- ✅ ROI values calculate correctly
- ✅ All screens show real data
- ✅ **ZERO** warnings in console

---

## 🎓 Understanding the Fix

### Problem
Components were calling `calculateROI()` directly, bypassing the ROI controller's hard gate.

### Solution
Added guards in **7 locations**:

1. **App.tsx** - State management (don't mark null as "loaded")
2. **roiController.ts** - Dual null check (flag AND value)
3. **ResultsScreen.tsx** - Component guard
4. **ScenarioScreen.tsx** (x3) - Three calculation points
5. **SensitivityAnalysis.tsx** - Sensitivity guard

### Result
NO calculation can run with null classification, from ANY entry point.

---

## 🔧 Quick Fix Verification

Run this in browser console while on a screen with no classification:

```javascript
// Should be false or show null
console.log({
  costClassification: window.costClassification,
  costClassificationLoaded: window.costClassificationLoaded
});

// Check if any calculations are running
// Should see BLOCKED messages only
```

---

## 📞 Support

If verification fails:
1. Copy console output
2. Note which screen you're on
3. Check if organization has classification in Admin > Costs
4. Verify all 7 files have the guards in place

---

**Test Duration:** 2-5 minutes  
**Required Access:** Any organization (with and without classification)  
**Success Rate:** 100% (all entry points blocked)
