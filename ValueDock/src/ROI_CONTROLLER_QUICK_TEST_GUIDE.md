# ROI Controller Quick Test Guide

## 🎯 What to Test

Test the new centralized ROI controller with hard-gating to ensure:
1. ROI only runs ONCE after classification loads
2. No "default classification" logs after custom loads
3. Arrays stay arrays (no count collisions)
4. Master admins handle gracefully without organization

---

## ✅ Test 1: Normal User Login

### Steps
1. Log in as regular user or org_admin (has organizationId)
2. Open browser console (F12)
3. Watch for ROI controller logs

### Expected Logs (in order)
```
[App - loadDataForCurrentContext] 🔄 Loading data for context: { orgId: "..." }
[App - loadDataForCurrentContext] ✅ Cost classification loaded: { hardCosts: X, softCosts: Y }
[autoSelectProcesses] Setting selectedProcessIds: { count: N, isArray: true }
[ROI Controller] 🎯 RUN { reason: "data or classification changed", costClassification: { status: "CUSTOM (loaded from backend)" } }
[calculateProcessROI] Using custom cost classification: { hardCosts: [...], softCosts: [...] }
[ROI Controller] ✅ COMPLETE { annualNetSavings: $XXX, npv: $YYY }
```

### ✅ Success Criteria
- Only ONE "🎯 RUN" log
- "Using custom cost classification" appears
- NO "⚠️ Using default cost classification" warnings
- NO "🚫 BLOCKED" after classification loads

---

## ✅ Test 2: Master Admin Login (No Org Initially)

### Steps
1. Log in as master_admin
2. Open browser console
3. Watch for logs during login

### Expected Logs
```
[App - Initialize] ℹ️ Master admin - no default org (will use context switcher)
[App - loadDataForCurrentContext] ℹ️ No organization selected
[ROI Controller] 🚫 BLOCKED { contextReady: false }
```

### Then Select Organization
4. Use context switcher to select an organization
5. Watch for ROI to run

### Expected After Selection
```
[App - loadDataForCurrentContext] 🔄 Loading data for context: { orgId: "..." }
[ROI Controller] 🎯 RUN { reason: "data or classification changed" }
[ROI Controller] ✅ COMPLETE
```

### ✅ Success Criteria
- No errors when orgId is null initially
- ROI blocked until org selected
- Single ROI run after org + classification loaded
- No "default classification" warnings

---

## ✅ Test 3: Rapid Data Changes (Debouncing)

### Steps
1. Log in and wait for initial ROI to complete
2. Go to Inputs tab
3. Rapidly change multiple process values:
   - Change task volume
   - Change time per task
   - Change automation coverage
4. Watch console for ROI controller logs

### Expected Behavior
```
[ROI Controller] 🚫 SKIP (debounce) { timeSinceLastRun: 45ms }
[ROI Controller] 🚫 SKIP (debounce) { timeSinceLastRun: 120ms }
[ROI Controller] 🎯 RUN { reason: "data or classification changed" }
```

### ✅ Success Criteria
- Multiple SKIP logs during rapid changes
- Only ONE RUN after changes settle
- 200ms minimum between runs
- No duplicate calculations

---

## ✅ Test 4: Array Validation

### Steps
1. Open browser console
2. Log in and watch state updates
3. Check array validation logs

### Expected Logs
```
[Array Debug] Final groups: { isArray: true, value: "Array(5)" }
[Array Debug] Final processes: { isArray: true, value: "Array(12)" }
[loadDataForCurrentContext] ✅ State updated (showing COUNTS for debugging): {
  groupsCount: 5,
  processesCount: 12,
  groupsAreArray: true,
  processesAreArray: true
}
```

### ✅ Success Criteria
- All `isArray: true` checks pass
- No `[mustArray] ❌` errors thrown
- No key collisions (groups as number)
- Counts shown separately for debugging

---

## ✅ Test 5: Cost Classification Loading

### Steps
1. Log in as org_admin or user
2. Navigate to Admin → Cost Classification
3. Change some cost categories (e.g., move "laborCosts" from hard to soft)
4. Click Save
5. Refresh page
6. Check ROI calculation reflects changes

### Expected Logs
```
[App - loadDataForCurrentContext] 📊 Loading cost classification for org: "..."
[App - loadDataForCurrentContext] ✅ Cost classification loaded: { hardCosts: [...], softCosts: [...] }
[calculateProcessROI] Using custom cost classification: { hardCosts: [...], softCosts: [...] }
[calculateProcessROI] Cost categorization results: { hardCostCount: X, softCostCount: Y }
```

### ✅ Success Criteria
- Classification loads before ROI runs
- Custom classification used (not defaults)
- Hard/soft savings match classification settings
- No warnings about default classification

---

## ✅ Test 6: Switch Between Organizations

### Steps (as tenant_admin or master_admin)
1. Log in
2. Select Organization A from context switcher
3. Wait for ROI to complete
4. Switch to Organization B
5. Watch console for controller reset

### Expected Logs
```
// Switching from Org A to Org B
[ROI Controller] 🔄 RESET
[App - loadDataForCurrentContext] 🔄 Loading data for context: { orgId: "org-b-id" }
[ROI Controller] 🚫 BLOCKED { clsReady: false }
[App - loadDataForCurrentContext] ✅ Cost classification loaded
[ROI Controller] 🎯 RUN { reason: "data or classification changed" }
```

### ✅ Success Criteria
- Controller resets on org switch
- New classification loads
- Single ROI run for new org
- No cross-contamination of data

---

## ❌ Red Flags to Watch For

### 🚨 CRITICAL ERRORS (Must Fix)
```
[mustArray] ❌ processes expected array, got number: 12
[validateArrayFieldsNotCounts] ❌ KEY COLLISION DETECTED
[ROI Controller] ❌ ERROR { reason: "...", error: ... }
```

### ⚠️ WARNINGS (Investigate)
```
[calculateProcessROI] ⚠️ Using default cost classification
// Should only appear if classification fails to load
```

### 🟡 UNEXPECTED PATTERNS (Review)
```
// Multiple RUN logs within 200ms
[ROI Controller] 🎯 RUN { ... } at 10:00:00.100
[ROI Controller] 🎯 RUN { ... } at 10:00:00.150

// Classification loaded but ROI still blocked
[costClassificationLoaded] true
[ROI Controller] 🚫 BLOCKED { clsReady: false }
```

---

## 📊 Success Metrics

### Passing Grade
- ✅ All 6 tests pass
- ✅ Zero `❌ ERROR` logs
- ✅ Zero `⚠️ default classification` warnings (except during classification load failure)
- ✅ Arrays remain arrays throughout
- ✅ Single ROI run per data/classification change
- ✅ Master admin login doesn't error

### Performance Check
- Initial ROI run: < 500ms
- Classification load: < 1s
- Debounce delay: ~200ms
- Context switch: < 2s total

---

## 🔍 Debugging Tips

### If ROI Never Runs
Check readiness gates:
```typescript
console.log('[DEBUG] ROI Gates:', {
  contextReady: Boolean(orgId),
  dataReady: processCount >= 0 && dataReadyForROI,
  clsReady: costClassificationLoaded === true
});
```

### If Default Classification Appears
Check backend response:
```typescript
console.log('[DEBUG] Cost Classification:', {
  loaded: costClassificationLoaded,
  hasHardCosts: costClassification?.hardCosts?.length,
  hasSoftCosts: costClassification?.softCosts?.length
});
```

### If Arrays Become Numbers
Check state updates:
```typescript
console.log('[DEBUG] State Shape:', {
  groupsType: typeof inputData.groups,
  groupsIsArray: Array.isArray(inputData.groups),
  processesType: typeof inputData.processes,
  processesIsArray: Array.isArray(inputData.processes)
});
```

---

**Last Updated**: October 21, 2025  
**Test Duration**: ~10 minutes  
**Required Roles**: master_admin, org_admin, user  
**Browser**: Chrome/Firefox with DevTools
