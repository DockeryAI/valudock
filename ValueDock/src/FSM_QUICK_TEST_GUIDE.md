# FSM Quick Test Guide

## 🚀 How to Verify the FSM Is Working

### 1. Open Browser Console

After logging in, press `F12` to open developer tools.

### 2. Check FSM Status

```javascript
// Check current phase
window.DevFSM.getPhase()
// Expected: "CLASS_READY_IDLE" (if org selected)
// Expected: "NO_ORG" (if no org selected)

// Get full diagnostic
window.DevFSM.diagnose()
```

**Expected Output:**
```json
{
  "phase": "CLASS_READY_IDLE",
  "state": {
    "orgId": "some-org-id",
    "processCount": 10,
    "selectedCount": 10,
    "costClassificationLoaded": true,
    "hardCostsCount": 5,
    "softCostsCount": 3
  },
  "queue": {
    "length": 0,
    "processing": false
  },
  "timestamp": "2025-10-21T..."
}
```

### 3. Test Org Selection Flow

```javascript
// Select an organization
window.DevFSM.selectOrg('your-org-id')
```

**Watch Console for This Sequence:**
```
[FSM] NO_ORG -> LOADING_DATA via SELECT_ORG
[FSM] Loading data for org: your-org-id
[CommandQueue] Executing command (0 remaining)
[FSM] Data loaded: { groupCount: X, processCount: Y }
[FSM] LOADING_DATA -> DATA_READY_NO_CLASS via DATA_LOADED
[FSM] Loading cost classification for org: your-org-id
[FSM] Cost classification loaded: { hardCostsCount: X, softCostsCount: Y }
[FSM] DATA_READY_NO_CLASS -> CLASS_READY_IDLE via CLASS_LOADED
[FSM] Auto-selected all processes: Y
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

### 4. Verify Single ROI Pass

**✅ GOOD - You Should See:**
- ONE log: `[ROI Facade] ✅ RUN (single canonical pass)`
- ONE classification load per org selection
- Clean state transitions

**❌ BAD - You Should NOT See:**
- Multiple "RUN" logs for same org
- "Using default classification" messages
- "Blocked: not ready" (unless switching away quickly)
- Array validation errors

### 5. Test Process Selection

Select/deselect processes in the Inputs screen, then check:

```javascript
window.DevFSM.getState()
```

**Expected:**
```json
{
  "orgId": "...",
  "processCount": 10,
  "selectedCount": 5,  // Changed after selection
  "selectedProcessIds": ["id1", "id2", ...],  // Array of IDs
}
```

**✅ Verify:**
- `selectedProcessIds` is an **array**, not a number
- `selectedCount` is a **number**, not an array
- Changing selection triggers `REQUEST_ROI`

### 6. Force ROI Calculation

```javascript
// Manually trigger ROI (only works if in CLASS_READY_IDLE phase)
window.DevFSM.forceROI()
```

**Expected Console:**
```
[DevFSM] Force ROI request, current phase: CLASS_READY_IDLE
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[CommandQueue] Executing command (0 remaining)
[FSM] Starting ROI calculation with token: ...
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

### 7. Test Leave Tab

```javascript
// Simulate leaving the current tab
window.DevFSM.leaveTab()
```

**Expected:**
- Current operations should gracefully cancel
- Phase should stay in safe idle state
- No errors or hanging operations

### 8. Check Command Queue

```javascript
window.DevFSM.getQueueStatus()
```

**Expected When Idle:**
```json
{
  "length": 0,
  "processing": false
}
```

**Expected When Busy (rare):**
```json
{
  "length": 2,
  "processing": true
}
```

## 🧪 Acceptance Tests

### Test 1: No Org = No ROI
**Steps:**
1. Clear org selection (if possible via UI)
2. Run `window.DevFSM.getPhase()`

**Expected:**
- Phase: `"NO_ORG"`
- No ROI calculations in console
- No errors

### Test 2: Org Switch Doesn't Duplicate ROI
**Steps:**
1. Select Org A
2. Wait for ROI to complete
3. Select Org B
4. Count ROI run logs

**Expected:**
- Exactly ONE ROI run for Org A
- Exactly ONE ROI run for Org B
- Clean transitions between orgs

### Test 3: Classification Always Custom
**Steps:**
1. Select any org
2. Search console for "default"

**Expected:**
- NO logs containing "Using default classification"
- ONLY logs with "custom classification" or "CUSTOM (loaded from backend)"

### Test 4: Arrays Stay Arrays
**Steps:**
1. Run `window.DevFSM.getState()`
2. Check types of `processes` and `groups`

**Expected:**
```javascript
Array.isArray(state.processes) // true
Array.isArray(state.groups) // true
typeof state.processCount === 'number' // true
typeof state.selectedCount === 'number' // true
```

### Test 5: Race Condition Protection
**Steps:**
1. Rapidly switch between 3 different orgs
2. Watch console logs
3. Count final ROI runs

**Expected:**
- Commands queue up properly
- Only ONE active calculation at a time
- Final state matches last selected org
- No crashes or overlapping operations

## 🐛 Common Issues

### Issue: "Phase is undefined"
**Cause:** FSM not initialized  
**Fix:** Check that `initDispatcher()` was called in App.tsx

### Issue: "DevFSM is not defined"
**Cause:** Dev tools not loaded  
**Fix:** Import `./fsm/devShortcuts` in App.tsx

### Issue: ROI never runs
**Cause:** Stuck in wrong phase  
**Fix:** 
```javascript
window.DevFSM.diagnose()
// Check if costClassificationLoaded === true
// If false, check backend has classification for org
```

### Issue: Multiple ROI runs
**Cause:** Multiple dispatch calls  
**Fix:** Search codebase for `dispatch({ type: 'REQUEST_ROI' })` and remove duplicates

## 📊 Performance Metrics

Monitor these in console:

```javascript
// Check how long state transitions take
// Good: < 100ms per transition
// Bad: > 1000ms (indicates backend slowness)

// Check command queue length
// Good: 0-1 items
// Bad: > 5 items (indicates backlog)
```

## ✅ Success Criteria

After implementation, you should observe:

1. **Clean Console Logs** - No spam, clear transitions
2. **Single ROI Pass** - ONE calculation per org load
3. **No Race Conditions** - Fast org switching doesn't break
4. **Proper Types** - Arrays are arrays, counts are numbers
5. **Predictable State** - FSM phase always matches reality

## 🎯 Next Steps After Verification

1. Remove old ROI controller code
2. Update component documentation
3. Add error recovery (optional)
4. Implement FSM visualization UI (optional)

---

**Quick Commands:**
```javascript
window.DevFSM.getPhase()        // Check current phase
window.DevFSM.diagnose()        // Full diagnostic
window.DevFSM.forceROI()        // Trigger ROI
window.DevFSM.selectOrg('id')   // Change org
```
