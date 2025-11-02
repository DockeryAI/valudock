# FSM Visual Flow Diagram

## 🎨 Complete State Flow

```
                             ┌──────────────────┐
                             │     NO_ORG       │
                             │                  │
                             │  • No org ID     │
                             │  • Empty data    │
                             │  • Waiting       │
                             └────────┬─────────┘
                                      │
                              SELECT_ORG(orgId)
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  LOADING_DATA    │◄────┐
                             │                  │     │
                             │  • Fetch data    │     │ SELECT_ORG(new)
                             │  • Load groups   │     │ LEAVE_TAB
                             │  • Load process  │     │
                             └────────┬─────────┘     │
                                      │               │
                                 DATA_LOADED          │
                                      │               │
                                      ▼               │
                             ┌──────────────────┐     │
                             │DATA_READY_NO_CLS │     │
                             │                  │     │
                             │  • Has data      │     │
                             │  • Need class.   │     │
                             │  • Load class.   │     │
                             └────────┬─────────┘     │
                                      │               │
                                CLASS_LOADED          │
                                      │               │
                                      ▼               │
                             ┌──────────────────┐     │
                    ┌────────┤CLASS_READY_IDLE  │─────┤
                    │        │                  │     │
              REQUEST_ROI    │  • Ready for ROI │     │
                    │        │  • Auto-select   │     │
                    │        │  • Idle          │     │
                    │        └──────────────────┘     │
                    │                                 │
                    ▼                                 │
           ┌──────────────────┐                      │
           │   RUNNING_ROI    │                      │
           │                  │                      │
           │  • Calculating   │                      │
           │  • Locked        │                      │
           │  • Token set     │                      │
           └────────┬─────────┘                      │
                    │                                │
               ROI_DONE                              │
                    │                                │
                    └────────────────────────────────┘
```

## 🔄 Event Flow Details

### SELECT_ORG Event

```
User Action: Select org from dropdown
     │
     ▼
dispatch({ type: 'SELECT_ORG', orgId: 'org-123' })
     │
     ▼
FSM Transition: NO_ORG → LOADING_DATA
     │
     ▼
Enqueue Command: Load data + classification
     │
     ├─► API Call: /data/load?organizationId=org-123
     │   └─► setState({ processes, groups })
     │   └─► dispatch({ type: 'DATA_LOADED' })
     │
     ├─► Transition: LOADING_DATA → DATA_READY_NO_CLASS
     │
     ├─► API Call: /cost-classification/org-123
     │   └─► setState({ costClassification })
     │   └─► dispatch({ type: 'CLASS_LOADED' })
     │
     ├─► Transition: DATA_READY_NO_CLASS → CLASS_READY_IDLE
     │
     ├─► Auto-select all processes
     │   └─► setState({ selectedProcessIds })
     │
     ├─► dispatch({ type: 'REQUEST_ROI' })
     │
     ├─► Transition: CLASS_READY_IDLE → RUNNING_ROI
     │
     ├─► ROI.run(context)
     │   └─► Calculate ROI with custom classification
     │
     ├─► dispatch({ type: 'ROI_DONE' })
     │
     └─► Transition: RUNNING_ROI → CLASS_READY_IDLE

DONE: System idle, waiting for next user action
```

### REQUEST_ROI Event

```
Trigger: User changes process selection
     │
     ▼
dispatch({ type: 'REQUEST_ROI' })
     │
     ▼
FSM Check: Current phase === CLASS_READY_IDLE?
     │
     ├─► YES: Transition to RUNNING_ROI
     │        │
     │        ▼
     │   Generate token: org:processes:selected:timestamp
     │        │
     │        ▼
     │   ROI.run(context)
     │        │
     │        ├─► Guard check: locked = true
     │        ├─► Validate: orgId, classification
     │        ├─► Calculate: ROI math
     │        └─► Guard release: locked = false
     │        │
     │        ▼
     │   Check token still valid
     │        │
     │        ├─► YES: dispatch({ type: 'ROI_DONE' })
     │        └─► NO: Skip (superseded by new run)
     │
     └─► NO: Ignore (invalid transition)
```

## 🛡️ Guard System

```
Component wants to run ROI
     │
     ▼
dispatch({ type: 'REQUEST_ROI' })
     │
     ▼
┌────────────────────────────────┐
│   FSM Phase Guard              │
│                                │
│   ✓ Is phase CLASS_READY_IDLE? │
│   ✗ Reject if wrong phase      │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Transition Allowed           │
│                                │
│   Move to RUNNING_ROI          │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Command Queue                │
│                                │
│   ✓ Add to queue               │
│   ✓ Execute when ready         │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   ROI Facade                   │
│                                │
│   ✓ Set runtime lock           │
│   ✓ Validate context           │
│   ✓ Check classification       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   ROI Internal                 │
│                                │
│   ✓ Check facade lock          │
│   ✓ Execute calculation        │
│   ✗ Throw if not locked        │
└────────┬───────────────────────┘
         │
         ▼
    ROI Results
```

## 🚫 Blocked Paths

### Before FSM (Race Conditions)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  useEffect  │────►│calculateROI │────►│  Results    │
│  (org)      │  │  │             │  │  │  (stale)    │
└─────────────┘  │  └─────────────┘  │  └─────────────┘
                 │                   │
┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐
│  useEffect  │──┼─►│calculateROI │──┼─►│  Results    │
│(selection)  │  │  │             │  │  │ (conflict)  │
└─────────────┘  │  └─────────────┘  │  └─────────────┘
                 │                   │
┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐
│  useEffect  │──┘  │calculateROI │──┘  │  Results    │
│  (class)    │     │             │     │  (wrong)    │
└─────────────┘     └─────────────┘     └─────────────┘

❌ Problem: 3 simultaneous ROI runs, race to setState
```

### After FSM (Serialized)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  dispatch   │────►│    Queue    │────►│  ROI.run    │
│(SELECT_ORG) │     │   Command   │     │   (once)    │
└─────────────┘     │             │     └──────┬──────┘
                    │  1. Load    │            │
                    │  2. Class   │            ▼
                    │  3. Auto    │     ┌─────────────┐
                    │  4. ROI     │────►│   Results   │
                    └─────────────┘     │  (correct)  │
                                        └─────────────┘

✅ Solution: Single execution path, deterministic order
```

## 📊 Data Flow

```
Backend                FSM                   Components
   │                    │                        │
   │  /data/load        │                        │
   │◄───────────────────┤                        │
   │                    │                        │
   │  processes[]       │                        │
   │───────────────────►│                        │
   │                    │                        │
   │                    │  setState(processes)   │
   │                    │───────────────────────►│
   │                    │                        │
   │  /classification   │                        │
   │◄───────────────────┤                        │
   │                    │                        │
   │  hard/soft costs   │                        │
   │───────────────────►│                        │
   │                    │                        │
   │                    │  setState(costs)       │
   │                    │───────────────────────►│
   │                    │                        │
   │                    │  ROI.run()             │
   │                    │───────┐                │
   │                    │       │                │
   │                    │◄──────┘                │
   │                    │                        │
   │                    │  setState(results)     │
   │                    │───────────────────────►│
   │                    │                        │
   │                    │                    ┌───┴───┐
   │                    │                    │ Render│
   │                    │                    └───────┘
```

## 🎭 Anti-Patterns (Now Blocked)

### ❌ Direct ROI Call
```typescript
// OLD - Now throws runtime error
calculateProcessROI(data);

// ESLint error:
// ❌ Never call calculateProcessROI directly
```

### ❌ Multiple useEffect Triggers
```typescript
// OLD - Caused race conditions
useEffect(() => {
  calculateROI(); // ❌
}, [orgId, selectedIds, classification]);

// NEW - Single dispatch
useEffect(() => {
  if (needsRecalc) {
    dispatch({ type: 'REQUEST_ROI' }); // ✅
  }
}, [needsRecalc]);
```

### ❌ Scattered State Updates
```typescript
// OLD - State could be inconsistent
setProcesses(data.processes); // ❌
setGroups(data.groups);       // ❌
calculateROI();               // ❌ Wrong timing

// NEW - FSM manages state
dispatch({ type: 'SELECT_ORG', orgId }); // ✅
// FSM handles rest
```

## 🎯 Success Indicators

### Good Flow
```
[FSM] NO_ORG -> LOADING_DATA via SELECT_ORG
[CommandQueue] Executing command (0 remaining)
[FSM] LOADING_DATA -> DATA_READY_NO_CLASS via DATA_LOADED
[FSM] DATA_READY_NO_CLASS -> CLASS_READY_IDLE via CLASS_LOADED
[FSM] CLASS_READY_IDLE -> RUNNING_ROI via REQUEST_ROI
[ROI Facade] ✅ RUN (single canonical pass)
[FSM] RUNNING_ROI -> CLASS_READY_IDLE via ROI_DONE

✅ Clean, sequential, one ROI pass
```

### Bad Flow (Fixed)
```
[App] 🔄 Loading data...
[App] ⚠️ Using default classification  ❌ ELIMINATED
[App] 🔄 Loading data...                ❌ DUPLICATE
[App] ⚠️ Using default classification  ❌ ELIMINATED
calculateProcessROI called             ❌ BLOCKED

✅ These patterns no longer possible
```

---

**Legend:**
- `─►` : Flow direction
- `┌─┐` : Process/state box
- `✓` : Check/validation
- `✗` : Rejection/block
- `❌` : Anti-pattern (blocked)
- `✅` : Correct pattern
