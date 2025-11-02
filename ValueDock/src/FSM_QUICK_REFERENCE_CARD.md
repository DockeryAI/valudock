# FSM Quick Reference Card

## 🚀 Quick Commands

```javascript
// Check current state
window.DevFSM.getPhase()

// Full diagnostic
window.DevFSM.diagnose()

// Force ROI calculation
window.DevFSM.forceROI()

// Change organization
window.DevFSM.selectOrg('org-id')

// Leave current tab
window.DevFSM.leaveTab()
```

## 📋 State Phases

| Phase | Meaning | Next Allowed Events |
|-------|---------|---------------------|
| `NO_ORG` | No org selected | `SELECT_ORG` |
| `LOADING_DATA` | Fetching from backend | `DATA_LOADED`, `SELECT_ORG`, `LEAVE_TAB` |
| `DATA_READY_NO_CLASS` | Need classification | `CLASS_LOADED`, `SELECT_ORG` |
| `CLASS_READY_IDLE` | Ready for ROI | `REQUEST_ROI`, `SELECT_ORG` |
| `RUNNING_ROI` | Calculating | `ROI_DONE` |

## 🎪 Events

```typescript
// Organization selected
dispatch({ type: 'SELECT_ORG', orgId: 'org-123' })

// Data loaded from backend
dispatch({ type: 'DATA_LOADED' })

// Cost classification loaded
dispatch({ type: 'CLASS_LOADED' })

// Request ROI calculation
dispatch({ type: 'REQUEST_ROI' })

// ROI calculation complete
dispatch({ type: 'ROI_DONE' })

// User left tab
dispatch({ type: 'LEAVE_TAB' })
```

## ✅ Good Flow Pattern

```
[FSM] NO_ORG -> LOADING_DATA via SELECT_ORG
[FSM] Data loaded: { processCount: 10, selectedCount: 10 }
[FSM] LOADING_DATA -> DATA_READY_NO_CLASS via DATA_LOADED
[FSM] Cost classification loaded: { hardCosts: 5, softCosts: 3 }
[FSM] DATA_READY_NO_CLASS -> CLASS_READY_IDLE via CLASS_LOADED
[FSM] Auto-selected all processes: 10
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE
```

## ❌ Bad Patterns (Now Blocked)

```typescript
// ❌ Direct import
import { calculateProcessROI } from './services/roiInternal';
// Error: ESLint forbids direct import

// ❌ Direct call
calculateProcessROI(data);
// Error: Runtime guard throws error

// ❌ Multiple effects
useEffect(() => calculateROI(), [orgId]);
useEffect(() => calculateROI(), [selection]);
// Problem: Race conditions (now eliminated)

// ✅ Correct pattern
dispatch({ type: 'REQUEST_ROI' });
```

## 🛡️ Guard Layers

```
1. ESLint (Compile)
   └─► Blocks forbidden imports

2. FSM Phase (Logic)
   └─► Only allows valid transitions

3. Runtime Lock (Execution)
   └─► Prevents direct calls
```

## 📊 State Structure

```typescript
{
  // Organization
  orgId: string | null,
  
  // Data arrays (MUST be arrays)
  processes: Process[],
  groups: Group[],
  selectedProcessIds: string[],
  hardCosts: string[],
  softCosts: string[],
  
  // Counts (MUST be numbers)
  processCount: number,
  groupCount: number,
  selectedCount: number,
  
  // Flags
  costClassificationLoaded: boolean,
  
  // Nested objects
  costClassification: {...},
  
  // Token for deduplication
  roiRunToken: string | null
}
```

## 🔍 Diagnostic Checklist

### ROI Not Running?
```javascript
const diag = window.DevFSM.diagnose();

// Check:
✓ diag.phase === 'CLASS_READY_IDLE'
✓ diag.state.orgId !== null
✓ diag.state.costClassificationLoaded === true
✓ diag.queue.processing === false
```

### Arrays vs Counts
```javascript
const state = window.DevFSM.getState();

// Verify:
✓ Array.isArray(state.processes)
✓ typeof state.processCount === 'number'
✓ Array.isArray(state.groups)
✓ typeof state.groupCount === 'number'
```

### Duplicate ROI Runs?
```bash
# Search console for:
"[ROI Facade] ✅ RUN"

# Should see:
✓ 1 log per org selection
✗ Multiple logs = BUG
```

## 🎯 Integration Checklist

```typescript
// In App.tsx

// 1. Import
import { initDispatcher, dispatch, getState } from './fsm/dispatcher';
import './fsm/devShortcuts';

// 2. Initialize
useEffect(() => {
  initDispatcher((updates) => {
    // Sync FSM state to React
    setInputData(prev => ({ ...prev, ...updates }));
  });
}, []);

// 3. Replace org selection
const handleOrgChange = (orgId) => {
  dispatch({ type: 'SELECT_ORG', orgId });
};

// 4. Replace ROI triggers
const handleRecalculate = () => {
  dispatch({ type: 'REQUEST_ROI' });
};

// 5. Remove old code
// ❌ Delete: loadDataForCurrentContext calls
// ❌ Delete: ROI useEffect dependencies
// ❌ Delete: Direct scheduleROI calls
```

## 📁 File Locations

```
/fsm/
  ├── appMachine.ts      # State machine logic
  ├── commandQueue.ts    # Operation serialization
  ├── dispatcher.ts      # Central coordinator
  └── devShortcuts.ts    # Dev tools

/services/
  ├── roiFacade.ts       # ROI public API
  └── roiInternal.ts     # ROI calculation engine

/.eslintrc.cjs           # Compile-time guards
```

## 🧪 Test Commands

```bash
# 1. Start dev server
npm run dev

# 2. Open console (F12)

# 3. Check status
window.DevFSM.getPhase()

# 4. Test org switch
window.DevFSM.selectOrg('test-org-id')

# 5. Verify single ROI run
# Search console for "[ROI Facade]"
# Should see exactly 1 log

# 6. Test queue
window.DevFSM.getQueueStatus()
# Should show { length: 0, processing: false }
```

## ⚡ Performance Tips

```javascript
// Good: Single dispatch for org change
dispatch({ type: 'SELECT_ORG', orgId });
// FSM handles everything automatically

// Bad: Multiple manual operations
setOrgId(orgId);           // ❌
loadData(orgId);           // ❌
loadClassification(orgId); // ❌
calculateROI();            // ❌
```

## 🔥 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Illegal direct call" | Direct ROI call | Use `dispatch({ type: 'REQUEST_ROI' })` |
| "Invalid transition" | Wrong phase for event | Check `getPhase()`, wait for ready state |
| "DevFSM is not defined" | Shortcuts not loaded | Import `./fsm/devShortcuts` |
| "Array expected, got number" | Key collision | Use `mustArray()` helper |
| Multiple ROI runs | Duplicate dispatches | Remove extra `dispatch()` calls |

## 📖 Documentation

- **Architecture**: `FSM_COMMAND_QUEUE_IMPLEMENTATION.md`
- **Testing**: `FSM_QUICK_TEST_GUIDE.md`
- **Diagrams**: `FSM_VISUAL_FLOW_DIAGRAM.md`
- **Summary**: `FSM_IMPLEMENTATION_COMPLETE.md`

---

**Print this card and keep it handy!** 📋
