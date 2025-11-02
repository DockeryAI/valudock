# Single-Pass ROI - Quick Test Card

## 🎯 What Was Fixed

**Problem**: ROI calculated 3 times (none → default → custom)  
**Solution**: Gate on BOTH `dataReadyForROI` AND `costClassificationLoaded`  
**Result**: ROI calculates ONCE with custom classification  

---

## ✅ Quick Test (30 seconds)

### 1. Login and Open Console

Look for this sequence:

```
🚫 ROI calculation BLOCKED - waiting for readiness flags
   reason: "Data not ready"

🚫 ROI calculation BLOCKED - waiting for readiness flags
   reason: "Cost classification not loaded"

✅ Cost classification loaded: { hardCosts: 3, softCosts: 5 }

🎯 ROI RECALCULATION (SINGLE-PASS WITH CUSTOM CLASSIFICATION)
   status: "CUSTOM (loaded from backend)"
```

### 2. Count the ROI Calculations

**✅ PASS**: You see **1** ROI calculation with "SINGLE-PASS WITH CUSTOM CLASSIFICATION"  
**❌ FAIL**: You see multiple ROI calculations or any "none"/"default" classification

---

## 🔍 What to Look For

### Good Signs ✅

- Single 🎯 emoji in console (means one calculation)
- `costClassification.status: "CUSTOM (loaded from backend)"`
- Two 🚫 BLOCKED messages before the calculation
- Clear readiness flag breakdown in logs

### Bad Signs ❌

- Multiple 🎯 emojis (means multiple calculations)
- `costClassification: "none"` or `"default"`
- ROI calculated before cost classification loads
- No BLOCKED messages

---

## 🚨 If Test Fails

1. **Check backend endpoint**:
   ```
   GET /cost-classification/{orgId}
   ```
   Should return `{ success: true, classification: { hardCosts: [...], softCosts: [...] } }`

2. **Check console for flags**:
   ```
   dataReadyForROI: true
   costClassificationLoaded: true
   readyForROI: true
   ```

3. **Verify no errors** in cost classification fetch

---

## 📊 Before vs After

### Before (Bad) ❌
```
ROI RECALCULATION { costClassification: "none" }
ROI RECALCULATION { costClassification: "default" }
ROI RECALCULATION { costClassification: { orgId: "org123" } }
```
**3 calculations = confusing, wasteful**

### After (Good) ✅
```
🚫 BLOCKED (data not ready)
🚫 BLOCKED (cost classification not loaded)
🎯 SINGLE-PASS WITH CUSTOM CLASSIFICATION
```
**1 calculation = clean, fast**

---

## ⚡ Quick Commands

**Search console for**:
```
"🎯 ROI RECALCULATION"
```

**Count results**:
- Should see: **1 result**
- If more: **FIX NEEDED**

**Check classification status**:
```
"CUSTOM (loaded from backend)"
```

---

## ✅ Success Criteria

- [ ] Only 1 ROI calculation per page load
- [ ] Calculation includes "SINGLE-PASS WITH CUSTOM CLASSIFICATION"
- [ ] Cost classification shows "CUSTOM (loaded from backend)" or "DEFAULT (no custom classification found)"
- [ ] No "none" or "default" classification in logs
- [ ] Two BLOCKED messages before calculation

**If all checked: ✅ TEST PASSED**

---

## 🎉 Expected Result

Console should look like this:

```
[App] 🚫 ROI calculation BLOCKED - waiting for readiness flags
  dataReadyForROI: false
  costClassificationLoaded: false
  reason: "Data not ready"

[autoSelectProcesses] Setting selectedProcessIds: { count: 5, isArray: true }

[App] 🚫 ROI calculation BLOCKED - waiting for readiness flags
  dataReadyForROI: true
  costClassificationLoaded: false
  reason: "Cost classification not loaded"

[App - loadDataForCurrentContext] ✅ Cost classification loaded:
  hardCosts: 3
  softCosts: 5

[App] ===== 🎯 ROI RECALCULATION (SINGLE-PASS WITH CUSTOM CLASSIFICATION) =====
[App] Readiness flags:
  dataReadyForROI: true
  costClassificationLoaded: true
  readyForROI: true
[App] ✅ About to call calculateROI with CUSTOM CLASSIFICATION:
  processCount: 5
  selectedCount: 5
  costClassification:
    orgId: "org_123abc"
    hardCostsCount: 3
    softCostsCount: 5
    status: "CUSTOM (loaded from backend)"
[App] Results calculated:
  annualNetSavings: 150000
  processResultsCount: 5
  totalFTEsFreed: 2.5
  npv: 450000
```

**Clean, clear, SINGLE calculation with custom classification!**
