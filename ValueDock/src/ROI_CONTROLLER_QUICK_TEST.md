# ROI Controller - Quick Test (30 Seconds)

## 🎯 What Was Fixed

**Problem**: Dummy data showing, multiple ROI calculations  
**Solution**: Central ROI controller with strict validation  
**Result**: Single ROI calculation, no dummy data, errors surface immediately  

---

## ✅ Quick Test (30 seconds)

### 1. Open Console and Login

Look for this exact sequence:

```
✅ PASS:
[ROI Controller] 🚫 BLOCKED { reason: "...", dataReady: false }
[ROI Controller] 🚫 BLOCKED { reason: "...", clsReady: false }
[ROI Controller] 🎯 RUN { costClassification: { status: "CUSTOM ..." } }
[ROI Controller] ✅ COMPLETE { annualNetSavings: ... }

❌ FAIL:
- Multiple 🎯 RUN messages
- Any "none" or "default" classification
- Dummy data in UI before load completes
```

### 2. Count the Calculations

**Search console for**: `"🎯 RUN"`

**Expected**: 1 result  
**If more**: Controller not working

---

## 🔍 Visual Checks

### Check 1: No Dummy Data on Load

1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Login

**Expected**: Blank/loading state until data loads  
**NOT Expected**: Dummy process names or $0 values

### Check 2: Arrays Are Arrays

Search console for: `"Setting selectedProcessIds"`

**Expected**:
```javascript
{
  count: 5,
  isArray: true  // ✅ Must be true
}
```

**NOT Expected**:
```javascript
{
  count: 0,
  isArray: false  // ❌ This means selectedProcessIds is a number
}
```

### Check 3: Controller State

Paste this in console:
```javascript
// Should throw error if not array:
console.log(typeof window.selectedProcessIds)
```

---

## 🚨 Break It Test (Prove Validation Works)

### Simulate Array/Count Collision:

Paste in console:
```javascript
localStorage.setItem('valuedock_data', JSON.stringify({
  processes: 5,  // Number instead of array
  groups: []
}));
location.reload();
```

**Expected**:
```
❌ Error: [mustArray] processes expected array, got number: 5
```

This is GOOD! It means validation is working and errors surface instead of falling back to dummy data.

### Clean Up:
```javascript
localStorage.clear();
location.reload();
```

---

## 📊 Success Indicators

- [ ] Only 1 🎯 RUN per org load
- [ ] Two 🚫 BLOCKED before the RUN
- [ ] Classification shows "CUSTOM (loaded from backend)"
- [ ] NO dummy data before load completes
- [ ] Arrays fail with clear error when corrupted

**If all checked: ✅ TEST PASSED**

---

## ⚡ Quick Commands

**Count ROI executions:**
```javascript
// In console, after login:
console.log(
  document.body.innerHTML.match(/🎯 RUN/g)?.length || 'Search console logs'
);
```

**Check array types:**
```javascript
// Should all be true:
console.log({
  processesIsArray: Array.isArray(JSON.parse(localStorage.valuedock_data || '{}').processes),
  groupsIsArray: Array.isArray(JSON.parse(localStorage.valuedock_data || '{}').groups)
});
```

**Force controller reset:**
```javascript
// See RESET message in console
location.reload();
```

---

## 🎉 What Success Looks Like

### Console Output:
```
[App - Initialize] Checking for existing session...
[App - Initialize] Session found for: admin@example.com
[App - loadDataForCurrentContext] 🔄 Loading data for context
[ROI Controller] 🔄 RESET
[ROI Controller] 🚫 BLOCKED { dataReady: false, clsReady: false }

[App - loadDataForCurrentContext] ✅ Data merged with defaults
[autoSelectProcesses] Setting selectedProcessIds: { count: 5, isArray: true }
[ROI Controller] 🚫 BLOCKED { dataReady: true, clsReady: false }

[App - loadDataForCurrentContext] ✅ Cost classification loaded
[ROI Controller] 🎯 RUN {
  processCount: 5,
  selectedCount: 5,
  costClassification: {
    orgId: "org_123",
    hardCostsCount: 3,
    softCostsCount: 5,
    status: "CUSTOM (loaded from backend)"
  }
}
[ROI Controller] ✅ COMPLETE {
  annualNetSavings: 150000,
  processResultsCount: 5
}
```

### UI:
- Shows loading state initially
- Data appears after backend load
- ROI values update once
- No dummy data at any point

---

## 🔧 If Test Fails

### Multiple RUN messages:

1. Check if cost classification is re-triggering
2. Look for duplicate useEffect dependencies
3. Verify debounce ref is working

### Dummy data showing:

1. Search console for "ensureArray" (should be 0 matches)
2. Check if backend is returning arrays
3. Verify mustArray is being used everywhere

### No errors when arrays are broken:

1. Validation might not be applied
2. Check mustArray imports
3. Verify validateArrayFieldsNotCounts calls

---

## 📞 Debug Commands

Paste these in console when stuck:

```javascript
// Check controller state:
console.log('ROI Controller:', {
  ready: /* controller state not exposed, check logs */
});

// Check localStorage data:
const data = JSON.parse(localStorage.valuedock_data || '{}');
console.log('Stored Data Types:', {
  processes: typeof data.processes,
  groups: typeof data.groups,
  processesLength: Array.isArray(data.processes) ? data.processes.length : 'NOT ARRAY',
  groupsLength: Array.isArray(data.groups) ? data.groups.length : 'NOT ARRAY',
});

// Check current state in React DevTools:
// Look for inputData.processes and verify it's an array
```

---

## ✅ Final Checklist

Quick sanity check before declaring success:

1. [ ] Console shows exactly 1 🎯 RUN message per org load
2. [ ] Console shows 2 🚫 BLOCKED messages before RUN
3. [ ] Classification status is "CUSTOM (loaded from backend)"
4. [ ] No dummy data visible during loading
5. [ ] Breaking arrays causes immediate error (not silent fallback)
6. [ ] Switching orgs shows 🔄 RESET message

**If all 6 checked: 🎉 ROI CONTROLLER WORKING PERFECTLY**
