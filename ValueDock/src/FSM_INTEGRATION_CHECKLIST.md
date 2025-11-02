# FSM Integration Checklist

## 🎯 Overview

This checklist guides you through integrating the FSM system into App.tsx and removing the old ROI controller pattern.

**Estimated Time**: 2-3 hours  
**Difficulty**: Medium  
**Risk**: Low (FSM is already tested and guarded)

---

## ✅ Pre-Integration Verification

### [ ] 1. Verify FSM Files Exist

```bash
ls -la /fsm/
# Should show:
# - appMachine.ts
# - commandQueue.ts
# - dispatcher.ts
# - devShortcuts.ts

ls -la /services/
# Should show:
# - roiFacade.ts
# - roiInternal.ts
# - roi.ts (existing)
# - roiBoundary.ts (existing)

ls -la .eslintrc.cjs
# Should exist
```

### [ ] 2. Test FSM Standalone

Open browser console after starting dev server:

```javascript
// These should work:
window.DevFSM
window.DevFSM.getPhase()
window.DevFSM.diagnose()

// If not, import is needed in App.tsx
```

### [ ] 3. Backup Current State

```bash
# Create backup branch
git checkout -b backup-before-fsm-integration
git add -A
git commit -m "Backup before FSM integration"

# Return to working branch
git checkout main
```

---

## 🔧 Phase 1: Add FSM Imports to App.tsx

### [ ] 4. Add Import Statements

At the top of `/App.tsx`, add:

```typescript
// FSM imports (add after existing imports)
import { initDispatcher, dispatch, getPhase, getState as getFSMState } from './fsm/dispatcher';
import './fsm/devShortcuts'; // Enables window.DevFSM
```

**Verification:**
- No TypeScript errors
- DevFSM should appear in window after reload

---

### [ ] 5. Initialize Dispatcher on Mount

In the main `App()` function, add this `useEffect`:

```typescript
// Initialize FSM (add near other mount effects)
useEffect(() => {
  console.log('[App] Initializing FSM dispatcher...');
  
  // Connect FSM state updates to React state
  initDispatcher((updates) => {
    console.log('[App] FSM state update:', updates);
    
    // Apply FSM state updates to React state
    // This keeps React state in sync with FSM state
    if (updates.processes !== undefined) {
      setInputData(prev => ({
        ...prev,
        groups: updates.groups ?? prev.groups,
        processes: updates.processes ?? prev.processes,
      }));
    }
    
    if (updates.selectedProcessIds !== undefined) {
      setSelectedProcessIds(updates.selectedProcessIds);
    }
    
    if (updates.costClassification !== undefined) {
      setCostClassification(updates.costClassification);
      setCostClassificationLoaded(updates.costClassificationLoaded);
    }
  });
  
  console.log('[App] FSM dispatcher initialized');
}, []); // Run once on mount
```

**Verification:**
- Console shows "FSM dispatcher initialized"
- No errors

---

## 🔄 Phase 2: Replace Organization Selection

### [ ] 6. Update Context Switcher Handler

Find `handleContextOrgChange` function and replace its body:

```typescript
const handleContextOrgChange = async (orgId: string | null) => {
  console.log('[App] Context org change:', orgId);
  
  // Update local storage
  setSelectedContextOrgId(orgId);
  if (orgId) {
    localStorage.setItem("valuedock_selected_org_id", orgId);
  } else {
    localStorage.removeItem("valuedock_selected_org_id");
  }
  
  // ✅ NEW: Use FSM dispatcher instead of direct load
  dispatch({ type: 'SELECT_ORG', orgId });
  
  // ❌ OLD: Remove this line
  // await loadDataForCurrentContext(selectedContextTenantId, orgId);
};
```

**Verification:**
- Org selection still works
- Console shows FSM transitions
- Data loads correctly

---

### [ ] 7. Update Login Success Handler

Find `handleLoginSuccess` and update:

```typescript
const handleLoginSuccess = async () => {
  const { session, profile } = await getSession();
  console.log('[App - handleLoginSuccess] Login success');

  if (session && profile) {
    setIsAuthenticated(true);
    setUserProfile(profile);
    await fetchUserContextNames(profile);
    
    if (profile.organizationId) {
      console.log('[App - handleLoginSuccess] Auto-selecting org:', profile.organizationId);
      
      // ✅ NEW: Use FSM dispatcher
      dispatch({ type: 'SELECT_ORG', orgId: profile.organizationId });
      
      // ❌ OLD: Remove this
      // await loadDataForCurrentContext(null, profile.organizationId, profile);
    } else if (profile.role === "master_admin") {
      console.log('[App - handleLoginSuccess] Master admin - no auto org selection');
    }
    
    setCurrentTab("inputs");
  }
};
```

**Verification:**
- Login still works
- Org loads via FSM
- No duplicate API calls

---

## 🗑️ Phase 3: Remove Old ROI Triggers

### [ ] 8. Comment Out Auto-Select Effect

Find the `useEffect` that auto-selects processes and comment it out:

```typescript
// ❌ OLD: This is now handled by FSM in CLASS_READY_IDLE phase
/*
useEffect(() => {
  if (dataLoading) return;
  if (roiDebounceRef.current) {
    clearTimeout(roiDebounceRef.current);
  }
  roiDebounceRef.current = setTimeout(() => {
    try {
      const processes = mustArray('autoSelectProcesses', inputData.processes);
      const allProcessIds = processes
        .filter(p => p && typeof p === 'object' && 'id' in p)
        .map((p) => p.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      
      setSelectedProcessIds(allProcessIds);
      setDataReadyForROI(true);
    } catch (error) {
      console.error('[autoSelectProcesses] ERROR:', error);
      setDataReadyForROI(false);
      throw error;
    }
  }, 0);

  return () => {
    if (roiDebounceRef.current) {
      clearTimeout(roiDebounceRef.current);
    }
  };
}, [inputData.processes, dataLoading]);
*/

// ✅ NEW: Auto-select is now handled by FSM
// No effect needed - FSM does this in CLASS_READY_IDLE transition
```

**Verification:**
- Processes still auto-select
- No duplicate selections

---

### [ ] 9. Comment Out ROI Calculation Effect

Find the `useEffect` that calculates ROI and comment it out:

```typescript
// ❌ OLD: Direct ROI calculation is now handled by FSM
/*
useEffect(() => {
  const controllerState = {
    processCount: inputData.processes.length,
    selectedCount: selectedProcessIds.length,
    costClassificationLoaded,
    dataReadyForROI,
    costClassification,
    orgId: selectedContextOrgId || userProfile?.organizationId,
    hardCosts: costClassification?.hardCosts,
    softCosts: costClassification?.softCosts,
  };

  if (isROIReady(controllerState)) {
    const calculatedResults = scheduleROI(
      'data or classification changed',
      controllerState,
      filteredData,
      timeHorizonMonths,
    );
    
    if (calculatedResults) {
      setResults(calculatedResults);
    }
  } else {
    console.log("[App] 🚫 ROI not ready yet", {
      dataReadyForROI,
      costClassificationLoaded,
      processCount: inputData.processes.length,
    });
  }
}, [
  filteredData,
  costClassification,
  timeHorizonMonths,
  dataReadyForROI,
  costClassificationLoaded,
  selectedProcessIds.length,
]);
*/

// ✅ NEW: ROI calculation is now handled by FSM
// Triggered by dispatch({ type: 'REQUEST_ROI' })
```

**Verification:**
- ROI still calculates
- Only one calculation per data load

---

### [ ] 10. Update Process Selection Handler

When user changes process selection (in InputsScreenTable or ResultsScreen), ensure it dispatches REQUEST_ROI:

```typescript
// In InputsScreenTable or wherever selection changes
const handleSelectionChange = (newSelectedIds: string[]) => {
  setSelectedProcessIds(newSelectedIds);
  
  // ✅ Trigger ROI recalculation via FSM
  dispatch({ type: 'REQUEST_ROI' });
};
```

**Verification:**
- Changing selection triggers ROI
- No duplicate calculations

---

## 🧹 Phase 4: Clean Up Old Code

### [ ] 11. Remove loadDataForCurrentContext Function

The FSM now handles data loading. You can either:

**Option A: Remove entirely**
```typescript
// Delete the entire loadDataForCurrentContext function
// It's now handled by dispatcher.ts
```

**Option B: Keep as legacy (safer)**
```typescript
// Rename to show it's deprecated
const loadDataForCurrentContext_DEPRECATED = async (...) => {
  console.warn('DEPRECATED: Use dispatch({ type: "SELECT_ORG" }) instead');
  // ... keep function body for emergency fallback
};
```

**Verification:**
- App still loads data
- No broken references

---

### [ ] 12. Remove dataReadyForROI Flag

This flag is no longer needed (FSM phases replace it):

```typescript
// ❌ Remove this state
// const [dataReadyForROI, setDataReadyForROI] = useState(false);

// ❌ Remove all references to setDataReadyForROI()
```

**Verification:**
- No TypeScript errors
- App still functions

---

### [ ] 13. Remove roiDebounceRef

No longer needed with FSM:

```typescript
// ❌ Remove this ref
// const roiDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

// ❌ Remove all clearTimeout(roiDebounceRef.current) calls
```

**Verification:**
- No TypeScript errors

---

### [ ] 14. Remove Old roiController Imports

```typescript
// ❌ Remove these imports
// import { scheduleROI, resetROIController, isROIReady } from "./utils/roiController";

// ✅ Keep arrayHelpers (still needed)
import { mustArray, ensureArray, ... } from "./utils/arrayHelpers";
```

**Verification:**
- ESLint shows no errors
- Build succeeds

---

## 🧪 Phase 5: Testing

### [ ] 15. Test Basic Flow

```javascript
// 1. Open app and login
// 2. Open console
// 3. Check phase
window.DevFSM.getPhase()
// Should be: "CLASS_READY_IDLE" or "NO_ORG"

// 4. Check state
window.DevFSM.diagnose()
// Should show clean state
```

**Expected Console:**
```
[FSM] NO_ORG -> LOADING_DATA via SELECT_ORG
[FSM] LOADING_DATA -> DATA_READY_NO_CLASS via DATA_LOADED
[FSM] DATA_READY_NO_CLASS -> CLASS_READY_IDLE via CLASS_LOADED
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

---

### [ ] 16. Test Org Switching

```javascript
// 1. Select Org A
window.DevFSM.selectOrg('org-a-id')

// 2. Wait for completion (watch console)

// 3. Select Org B
window.DevFSM.selectOrg('org-b-id')

// 4. Verify only 1 ROI run for B
// Search console for "[ROI Facade] ✅ RUN"
```

**Success Criteria:**
- Exactly 1 ROI run per org
- No "default classification" logs
- Clean state transitions

---

### [ ] 17. Test Process Selection

```typescript
// 1. Go to Inputs or Results screen
// 2. Change process selection
// 3. Watch console for:
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

**Success Criteria:**
- ROI recalculates on selection change
- Only one calculation
- Results update correctly

---

### [ ] 18. Test Rapid Org Switching

```javascript
// Rapidly switch between orgs
window.DevFSM.selectOrg('org-1')
window.DevFSM.selectOrg('org-2')
window.DevFSM.selectOrg('org-3')

// Check final state
window.DevFSM.diagnose()
// Should show org-3 data only, no crashes
```

**Success Criteria:**
- No race conditions
- No duplicate calculations
- Final state matches last selected org

---

### [ ] 19. Test Leave Tab

```typescript
// 1. Start loading an org
dispatch({ type: 'SELECT_ORG', orgId: 'test-org' })

// 2. Immediately dispatch leave
dispatch({ type: 'LEAVE_TAB' })

// 3. Check phase
window.DevFSM.getPhase()
// Should be in safe state, no errors
```

**Success Criteria:**
- No crashes
- Operations cancel cleanly
- Can resume normal operation

---

### [ ] 20. Verify Array Safety

```javascript
const state = window.DevFSM.getState()

// Verify types
console.log('Processes is array:', Array.isArray(state.processes))
console.log('Groups is array:', Array.isArray(state.groups))
console.log('ProcessCount is number:', typeof state.processCount === 'number')
console.log('GroupCount is number:', typeof state.groupCount === 'number')

// All should be true
```

**Success Criteria:**
- Arrays are arrays
- Counts are numbers
- No key collisions

---

## 📊 Phase 6: Performance Verification

### [ ] 21. Measure Load Time

```javascript
// Before selecting org
const startTime = performance.now()

// Select org
dispatch({ type: 'SELECT_ORG', orgId: 'test-org' })

// When ROI completes, measure
const endTime = performance.now()
console.log('Total load time:', endTime - startTime, 'ms')

// Should be: 1500-3000ms (depending on backend)
```

**Success Criteria:**
- Load time < 3 seconds
- Faster than before FSM

---

### [ ] 22. Check Console Log Volume

```javascript
// Count logs during one org load
// Before FSM: 20-30 logs
// After FSM: 10-15 logs

// Should see reduction in noise
```

**Success Criteria:**
- Fewer total logs
- More informative logs
- No spam

---

## 🎯 Phase 7: Final Cleanup

### [ ] 23. Archive Old Files

```bash
# Create archive directory
mkdir -p /archive/pre-fsm

# Move old files
mv /utils/roiController.ts /archive/pre-fsm/
# (Keep if used elsewhere, otherwise archive)
```

---

### [ ] 24. Update Documentation

Add to `/README.md`:

```markdown
## State Management

This app uses an Event-Driven State Machine (FSM) for deterministic state transitions.

See:
- `/FSM_QUICK_REFERENCE_CARD.md` - Quick commands
- `/FSM_IMPLEMENTATION_COMPLETE.md` - Full architecture
- `/FSM_QUICK_TEST_GUIDE.md` - Testing guide

Debug tools available in console: `window.DevFSM`
```

---

### [ ] 25. Commit Changes

```bash
git add -A
git commit -m "feat: Integrate FSM for race-condition-free state management

- Added FSM dispatcher to App.tsx
- Replaced org selection with FSM events
- Removed old ROI useEffect dependencies
- Eliminated race conditions and duplicate calculations
- All tests passing

See FSM_IMPLEMENTATION_COMPLETE.md for details"

git push
```

---

## ✅ Success Criteria Summary

After completing this checklist, you should have:

- ✅ FSM dispatcher integrated into App.tsx
- ✅ Organization selection using FSM events
- ✅ ROI calculation through FSM only
- ✅ No race conditions
- ✅ No duplicate API calls
- ✅ No default classification fallbacks
- ✅ Arrays always arrays, counts always numbers
- ✅ Clean console logs
- ✅ Fast, deterministic behavior
- ✅ Dev tools working (window.DevFSM)

---

## 🐛 Rollback Plan

If something goes wrong:

```bash
# Rollback to backup
git checkout backup-before-fsm-integration

# Or rollback specific files
git checkout HEAD~1 -- App.tsx

# Test and commit
git commit -m "Rollback FSM integration for debugging"
```

Then debug using:
```javascript
window.DevFSM.diagnose()
// Check what went wrong
```

---

## 📞 Support

If stuck:
1. Check console for error messages
2. Run `window.DevFSM.diagnose()`
3. Compare against expected logs in `/FSM_QUICK_TEST_GUIDE.md`
4. Review `/FSM_VISUAL_FLOW_DIAGRAM.md` for flow clarity

---

**Good luck with the integration!** 🚀

**Estimated completion time**: 2-3 hours  
**Recommended approach**: Do in small steps, test after each phase
