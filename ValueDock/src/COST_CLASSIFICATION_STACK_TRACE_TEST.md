# Cost Classification - Stack Trace Test Guide

## 🎯 The Ultimate Fix

I've added a **hard gate with stack trace logging** directly in `calculateProcessROI`.

This means:
- ✅ The warning will NEVER appear again
- ✅ If somehow called with invalid data, we'll see EXACTLY where it came from
- ✅ Returns zero results instead of using defaults

---

## ⚡ Quick Test (30 seconds)

### Step 1: Open Console
Press `F12` to open browser developer console

### Step 2: Navigate to Organization Without Classification
Go to any organization that has no cost classification set up

### Step 3: Check Console Output

**✅ GOOD - Should see:**
```javascript
[App] ⚠️ No cost classification found - ROI BLOCKED until classification is created
[ROI Controller] 🚫 BLOCKED
  blockReason: "Cost classification is null - please create in Admin > Costs tab"
```

**❌ Should NOT see:**
```javascript
⚠️ Using default cost classification - custom classification not provided
```

**🔍 If you see THIS instead:**
```javascript
[calculateProcessROI] 🚨 BLOCKED - Invalid cost classification provided
{
  process: "Invoice Processing",
  costClassification: undefined,
  type: "undefined",
  stackTrace: "Error
    at calculateProcessROI (calculations.ts:842)
    at calculateROI (calculations.ts:1413)
    at ScenarioScreen.tsx:180    ← THIS IS THE CULPRIT!
    at useMemo
    ..."
}
```

This means:
1. One of the component guards failed to block the call
2. The stack trace shows EXACTLY which file/line called it
3. Copy the stack trace and report it

---

## 🔍 How to Read the Stack Trace

When you see the error, look at the `stackTrace` field:

```javascript
stackTrace: "Error
  at calculateProcessROI (calculations.ts:842)      ← Function that blocked it
  at calculateROI (calculations.ts:1413)            ← Parent function
  at ScenarioScreen.tsx:180                         ← THIS LINE IS THE PROBLEM!
  at Object.useMemo (react.js:...)
  at ScenarioScreen (ScenarioScreen.tsx:164)
  at div
  ..."
```

**The important line is the FIRST non-calculations.ts line**

In this example:
- File: `ScenarioScreen.tsx`
- Line: `180`
- Meaning: There's a `calculateROI` call on line 180 of ScenarioScreen that doesn't have a guard

---

## 🧪 Test All Screens

Navigate to each screen and watch the console:

| Screen | Expected Behavior |
|--------|------------------|
| **Inputs** | No ROI calls, no errors |
| **Implementation** | No ROI calls, no errors |
| **Impact and ROI** | 🚫 BLOCKED logs only |
| **Opportunity** | 🚫 BLOCKED logs only |
| **Timeline** | 🚫 BLOCKED logs only |
| **Scenarios** | 🚫 BLOCKED logs only |
| **Export** | No errors (uses passed results) |

**Key Point:** You should ONLY see `🚫 BLOCKED` messages, never the `⚠️ Using default` warning!

---

## 🚨 What to Do If Error Appears

### Step 1: Copy the Full Error
Right-click on the error in console → Copy object

### Step 2: Find the Stack Trace
Look for the first `.tsx` file that's NOT `calculations.ts`:

```
at calculateProcessROI (calculations.ts:842)  ← Skip
at calculateROI (calculations.ts:1413)        ← Skip
at ResultsScreen.tsx:126                      ← THIS ONE!
```

### Step 3: Report
Say: "Stack trace shows call from [FileName].tsx line [Number]"

Example:
> "Stack trace shows call from ResultsScreen.tsx line 126"

---

## 💡 What the Fix Does

### Before:
```typescript
// calculateProcessROI (OLD)
function calculateProcessROI(..., costClassification?) {
  // ... lots of code ...
  
  if (costClassification) {
    // Use custom classification
  } else {
    console.warn('⚠️ Using default cost classification');  ← Warning appeared here
    // Use defaults
  }
}
```

### After:
```typescript
// calculateProcessROI (NEW)
function calculateProcessROI(..., costClassification?) {
  // 🚫 HARD GATE at the VERY TOP
  if (!costClassification || costClassification === null || costClassification === undefined || typeof costClassification !== 'object') {
    console.error('🚨 BLOCKED', {
      process: process.name,
      costClassification,
      stackTrace: new Error().stack,  ← Shows WHO called this
    });
    
    return { /* zero results */ };  ← Returns immediately, never reaches warning
  }
  
  // Normal calculation (old else block is now unreachable dead code)
}
```

**Result:** The warning code is now **unreachable** - it will NEVER execute!

---

## 🎯 Success Criteria

### ✅ Test PASSES if:
- No `⚠️ Using default cost classification` warning appears
- Only see `🚫 BLOCKED` messages from ROI Controller
- All screens load without errors
- ROI values show $0 when no classification exists

### ❌ Test FAILS if:
- The warning still appears
- Stack trace error appears (means a guard is missing)

### 🔧 If Stack Trace Appears:
This is actually GOOD - it means:
1. The fix is working (blocking the calculation)
2. We now know EXACTLY where the issue is (the stack trace)
3. We can add a guard at that specific location

---

## 📊 Complete Protection Map

```
User Action (Navigate to Screen)
  ↓
Layer 1: App.tsx
  ├─ No classification? → Set loaded=false
  └─ Classification exists? → Set loaded=true
  ↓
Layer 2: ROI Controller
  ├─ Not loaded? → 🚫 BLOCK (no calculation)
  ├─ Classification null? → 🚫 BLOCK
  ├─ Classification undefined? → 🚫 BLOCK
  └─ All checks pass? → Schedule ROI
  ↓
Layer 3: Component Guards (7 locations)
  ├─ ResultsScreen: Check before calculating
  ├─ ScenarioScreen (x3): Check before calculating
  └─ SensitivityAnalysis: Check before calculating
  ↓
Layer 4: calculateProcessROI ⭐ NEW HARD GATE
  ├─ Invalid classification? → 🚨 BLOCK + LOG STACK TRACE
  └─ Valid classification? → Calculate normally
```

**Any ONE of these layers can stop the calculation!**

---

## 🔍 Console Filter Commands

To quickly find relevant logs:

### See all blocks:
```
Filter by: "🚫"
```

### See stack trace errors (if any):
```
Filter by: "🚨 BLOCKED"
```

### Check for old warning (should be zero):
```
Filter by: "Using default cost"
```

### See ROI controller activity:
```
Filter by: "ROI Controller"
```

---

## ✅ Expected Console Flow (No Classification)

```javascript
// On page load
[App] 🔄 Loading data for context...
[App] ⚠️ No cost classification found - ROI BLOCKED until classification is created

// When navigating to Impact and ROI tab
[ROI Controller] 🚫 BLOCKED
  blockReason: "Cost classification is null - please create in Admin > Costs tab"
  costClassificationLoaded: false
  costClassificationExists: false

[ResultsScreen] 🚫 ROI calculation blocked - cost classification is null/undefined
  costClassification: null
  type: "object"

// NO warnings or errors after this!
```

---

## ✅ Expected Console Flow (With Classification)

```javascript
// On page load
[App] ✅ Cost classification loaded: { hardCosts: 3, softCosts: 8 }

// When navigating to Impact and ROI tab
[ROI Controller] 🎯 RUN
  costClassification: { status: "CUSTOM (loaded from backend)" }
  
[ROI Controller] ✅ COMPLETE
  annualNetSavings: 125000
  npv: 234567
  processResults: [...]

// ROI values display correctly!
```

---

**Test Duration:** 30 seconds  
**Complexity:** Low (just watch console)  
**Success Rate:** Should be 100% (warning impossible to trigger)  
**Debug Features:** Stack trace shows exact source if somehow bypassed
