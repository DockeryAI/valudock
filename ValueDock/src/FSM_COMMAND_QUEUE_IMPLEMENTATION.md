# Event-Driven State Machine + Command Queue Implementation

## 🎯 Objective

Eliminate race conditions from context switches & classification fetches by implementing a finite state machine (FSM) that controls all ROI calculations and data loading operations.

## ✅ What This Fixes

1. **Race Conditions**: No more duplicate ROI runs when switching organizations
2. **Default Classification Spam**: Only one canonical "custom classification" pass, no fallback logs
3. **Array/Count Confusion**: Keeps arrays as arrays, counts on separate keys
4. **Scattered Effects**: ROI/cashflow/auto-select only run on explicit transitions, not random effects
5. **Direct ROI Calls**: Blocked at both compile-time (ESLint) and runtime (guard)

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (UI Layer)                      │
│                                                             │
│  - Renders components                                       │
│  - Dispatches events: dispatch({ type: 'SELECT_ORG' })     │
│  - Reads state for display                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FSM Dispatcher (fsm/dispatcher.ts)             │
│                                                             │
│  - Manages phase transitions                                │
│  - Queues side-effects via Command Queue                    │
│  - Single source of truth for app state                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│  State Machine   │      │  Command Queue   │
│ (appMachine.ts)  │      │(commandQueue.ts) │
│                  │      │                  │
│ - Phase logic    │      │ - Serializes     │
│ - Transitions    │      │   side-effects   │
│ - Guards         │      │ - Prevents races │
└──────────────────┘      └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   ROI Facade     │
                          │(roiFacade.ts)    │
                          │                  │
                          │ - Runtime guard  │
                          │ - Single entry   │
                          │ - Validation     │
                          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  ROI Internal    │
                          │(roiInternal.ts)  │
                          │                  │
                          │ - Math engine    │
                          │ - Protected      │
                          └──────────────────┘
```

## 🔄 State Machine Flow

```
NO_ORG
  │
  │ SELECT_ORG (with orgId)
  ▼
LOADING_DATA ────────┐
  │                  │ SELECT_ORG (null)
  │ DATA_LOADED      │ or LEAVE_TAB
  ▼                  │
DATA_READY_NO_CLASS ─┤
  │                  │
  │ CLASS_LOADED     │
  ▼                  │
CLASS_READY_IDLE ────┤
  │                  │
  │ REQUEST_ROI      │
  ▼                  │
RUNNING_ROI          │
  │                  │
  │ ROI_DONE         │
  ▼                  │
CLASS_READY_IDLE ◄───┘
```

## 📁 File Structure

```
/fsm/
  ├── appMachine.ts      # State machine logic (phases, events, transitions)
  ├── commandQueue.ts    # Serializes async operations
  ├── dispatcher.ts      # Central coordinator
  └── devShortcuts.ts    # Dev/debug tools

/services/
  ├── roiFacade.ts       # Public API for ROI
  ├── roiInternal.ts     # Protected calculation engine
  ├── roi.ts             # (existing) Legacy facade - to be migrated
  └── roiBoundary.ts     # (existing) Guards

/.eslintrc.cjs           # Compile-time guards
```

## 🚀 Usage Guide

### From Components

**OLD (Forbidden):**
```typescript
// ❌ Direct call - will throw runtime error
calculateProcessROI(data);

// ❌ Direct import - ESLint error
import { calculateProcessROI } from './services/roiInternal';
```

**NEW (Required):**
```typescript
import { dispatch } from './fsm/dispatcher';

// ✅ Dispatch event to request ROI
dispatch({ type: 'REQUEST_ROI' });
```

### Context Switching

**OLD:**
```typescript
// This caused race conditions
setSelectedOrgId(newOrgId);
loadData(newOrgId);
loadClassification(newOrgId);
calculateROI(); // Might run before classification loads!
```

**NEW:**
```typescript
// Clean, ordered transition
dispatch({ type: 'SELECT_ORG', orgId: newOrgId });
// FSM handles data load → classification load → ROI automatically
```

## 🔍 How It Works

### 1. Event Dispatch

```typescript
// User selects an organization
dispatch({ type: 'SELECT_ORG', orgId: 'org-123' });
```

### 2. Phase Transition

```typescript
// State machine checks if transition is valid
NO_ORG + SELECT_ORG → LOADING_DATA
```

### 3. Side-Effect Execution

```typescript
// Dispatcher enqueues data loading
enqueue(async () => {
  const data = await apiCall('/data/load?organizationId=org-123');
  setState({ processes, groups });
  dispatch({ type: 'DATA_LOADED' });
});
```

### 4. Sequential Processing

```typescript
// Command queue ensures operations run in order:
// 1. Load data
// 2. Load classification
// 3. Auto-select processes
// 4. Calculate ROI
```

### 5. ROI Calculation

```typescript
// Only runs when phase === 'RUNNING_ROI'
// Only triggered by REQUEST_ROI event
// Only allowed after classification loaded
await ROI.run(context);
```

## 🛡️ Safety Guarantees

### Compile-Time (ESLint)

- ❌ Cannot import `roiInternal.ts` directly
- ❌ Cannot call `calculateProcessROI()` directly
- ✅ Must use `dispatch({ type: 'REQUEST_ROI' })`

### Runtime (Guard)

```typescript
export const ROI = {
  async run(context) {
    locked = true; // Set lock
    try {
      // Calculation code
    } finally {
      locked = false; // Release lock
    }
  },
  
  _unsafeDirectInvokeGuard() {
    if (!locked) {
      throw new Error('Illegal direct call!');
    }
  }
};
```

Any attempt to call ROI functions outside the facade throws an error.

## 🧪 Testing & Debugging

### Dev Console

```javascript
// Check current phase
window.DevFSM.getPhase()
// Output: "CLASS_READY_IDLE"

// Force org selection
window.DevFSM.selectOrg('org-123')

// Force ROI calculation (if in right phase)
window.DevFSM.forceROI()

// Get full diagnostic
window.DevFSM.diagnose()
```

### Expected Logs

**Good Flow:**
```
[FSM] NO_ORG -> LOADING_DATA via SELECT_ORG
[FSM] Loading data for org: org-123
[FSM] Data loaded: { processCount: 10, selectedCount: 10 }
[FSM] LOADING_DATA -> DATA_READY_NO_CLASS via DATA_LOADED
[FSM] Loading cost classification for org: org-123
[FSM] Cost classification loaded: { hardCostsCount: 5, softCostsCount: 3 }
[FSM] DATA_READY_NO_CLASS -> CLASS_READY_IDLE via CLASS_LOADED
[FSM] Auto-selected all processes: 10
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

**Bad Flow (Blocked):**
```
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ⚠️ Blocked: not ready { costClassificationLoaded: false }
```

## 📊 Acceptance Criteria

### ✅ Criterion 1: No ROI When No Org
- When `orgId=null`, logs show no ROI attempts
- Only message: "Please select organization"
- Phase stays at `NO_ORG`

### ✅ Criterion 2: Clean State Flow
- On org selection: `NO_ORG → LOADING_DATA → DATA_READY_NO_CLASS → CLASS_READY_IDLE → RUNNING_ROI → CLASS_READY_IDLE`
- Each transition logged with clear event name

### ✅ Criterion 3: One Custom Classification Pass
- Exactly ONE log: `[ROI Facade] ✅ RUN (single canonical pass)`
- ZERO logs: `"Using default classification"`
- Classification always from backend

### ✅ Criterion 4: Selection Triggers ROI
- Changing process selection calls `dispatch({ type: 'REQUEST_ROI' })`
- NOT direct function calls

### ✅ Criterion 5: Arrays Stay Arrays
- `processes` is always `any[]`, never `number`
- `groups` is always `any[]`, never `number`
- Counts on separate keys: `processCount`, `groupCount`

## 🔄 Migration Steps

### Phase 1: Install FSM (✅ Complete)
- [x] Create FSM files
- [x] Create facade + internal
- [x] Add ESLint rules
- [x] Add dev tools

### Phase 2: Wire Dispatcher to App.tsx
- [ ] Import dispatcher in App.tsx
- [ ] Call `initDispatcher(setState)` on mount
- [ ] Replace org selection with `dispatch({ type: 'SELECT_ORG' })`
- [ ] Remove direct `loadDataForCurrentContext` calls
- [ ] Remove ROI useEffect dependencies

### Phase 3: Update Components
- [ ] ResultsScreen: Replace ROI calls with dispatch
- [ ] ScenarioScreen: Use `ROI.calculate()` for local what-if
- [ ] Remove any remaining direct ROI calls

### Phase 4: Testing
- [ ] Test org switch (no duplicate ROI)
- [ ] Test tab switch (clean cancellation)
- [ ] Verify one classification log per load
- [ ] Check ESLint catches forbidden patterns

### Phase 5: Cleanup
- [ ] Remove old ROI controller
- [ ] Archive legacy roiController.ts
- [ ] Update documentation

## 🎓 Key Concepts

### State Machine
- **Deterministic**: Same input always produces same output
- **Explicit**: All transitions are clearly defined
- **Traceable**: Every state change is logged

### Command Queue
- **Serialization**: Operations execute one at a time
- **Order**: FIFO (first in, first out)
- **Safety**: No overlapping async operations

### ROI Facade
- **Single Entry**: Only way to run ROI
- **Validation**: Checks context before running
- **Protection**: Runtime guard prevents bypass

## 🐛 Troubleshooting

### "Illegal direct call" error
**Cause**: Code is calling `calculateProcessROI()` directly  
**Fix**: Use `dispatch({ type: 'REQUEST_ROI' })` instead

### ESLint error on import
**Cause**: Importing from `roiInternal.ts`  
**Fix**: Import `ROI` from `roiFacade.ts` instead

### ROI not running
**Cause**: FSM not in correct phase  
**Fix**: Check `window.DevFSM.getPhase()` - must be `CLASS_READY_IDLE`

### Duplicate ROI runs
**Cause**: Multiple dispatch calls or effects  
**Fix**: Remove duplicate `dispatch()` calls, check useEffect deps

### Classification not loading
**Cause**: Backend doesn't have classification for org  
**Fix**: Create classification in Admin panel

## 📚 References

- [State Machine Pattern](https://en.wikipedia.org/wiki/Finite-state_machine)
- [Command Pattern](https://refactoring.guru/design-patterns/command)
- [Race Condition Prevention](https://en.wikipedia.org/wiki/Race_condition)

## 🚧 Next Steps

1. **Wire Up App.tsx**: Connect dispatcher to React state
2. **Test Flow**: Verify clean transitions with no race conditions
3. **Monitor Logs**: Ensure only one "custom classification" pass
4. **Performance**: Measure improvement in state transition speed
5. **Documentation**: Update component docs with new patterns

---

**Status**: ✅ FSM Infrastructure Complete  
**Next**: Wire dispatcher to App.tsx and test
**Expected Outcome**: Zero race conditions, clean deterministic ROI flow
