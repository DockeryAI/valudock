# WorkfloDock-Style Progress UI

## 🎯 Overview

The Cloud Proposal Agent now features a WorkfloDock-standard progress tracking system with hierarchical step numbering, sticky progress bars, and copy-to-clipboard functionality for each command.

---

## 📊 Progress Header Format

### Standard Format
```
Agent 1 of 20 — Step 1.19.1 of N
```

### Components
- **Agent Number**: Current agent in the workflow (e.g., "1 of 20")
- **Step Number**: Hierarchical step ID (e.g., "1.19.1", "1.19.2")
  - Major step: `1`
  - Sub-step: `19`
  - Sub-sub-step: `1`
- **Total Steps**: Total number of steps at current level

### When to Use Sub-Steps
Sub-steps (1.19.1, 1.19.2, ...) are used when a single logical operation requires multiple technical steps:

1. **Code Generation** → 1.19.1: Write code, 1.19.2: Validate syntax
2. **Deployment** → 1.19.1: Build, 1.19.2: Deploy, 1.19.3: Verify
3. **Testing** → 1.19.1: Run tests, 1.19.2: Collect results

---

## 🎨 Visual Components

### 1. Sticky Progress Bar (Milestone Tracker)

Located at the top of the Cloud Run Console, this bar shows overall progress through 5 major milestones:

```
┌────────────────────────────────────────────────────────────┐
│ Progress                          Milestone 1 of 5         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Initialize  Fetch Data  Generate  Deploy  Complete        │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Green segments: Completed milestones
- 🔵 Blue pulsing segment: Current milestone (with animation)
- ⚪ Gray segments: Pending milestones
- Sticky positioning: Always visible at top during scroll

### 2. Step-by-Step Execution Log

Each step is displayed in a card with:

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Agent 1 of 20 — Step 1.3 of 4              10:45:23 AM  │
│                                                              │
│ Send POST request to edge function                          │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Command                                    [Copy]    │   │
│ │ fetch('https://...', { method: 'POST' })              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ HTTP 200 - Request sent                                    │
└─────────────────────────────────────────────────────────────┘
```

**Color Coding:**
- 🟢 **Green border**: Completed step
- 🔵 **Blue border**: Currently running step
- 🔴 **Red border**: Failed/error step
- ⚪ **Gray border**: Pending step

---

## 🎬 Example: Cloud Proposal Agent Workflow

### Full Execution Sequence

```
Agent 1 of 20 — Step 1.1 of 4
Initialize Cloud Proposal Agent
✓ Complete: Initialized with Deal ID: DEAL-2025-001

Agent 1 of 20 — Step 1.2 of 4
Build request payload
Command: JSON.stringify({ tenant_id: "...", ... })
✓ Complete: Payload constructed

Agent 1 of 20 — Step 1.3 of 4
Send POST request to edge function
Command: fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run', { method: 'POST', body: ... })
✓ Complete: HTTP 200 - Request sent

Agent 1 of 20 — Step 1.4 of 4
Parse JSON response
Command: const data = await response.json()
✓ Complete: Parsed response: completed

Agent 1 of 20 — Step 1.5 of 5
✓ Proposal Agent Completed Successfully
✓ Complete

Agent 1 of 20 — Step 1.6 of 6
Refresh proposals table
Command: await loadVersions()
✓ Complete: Proposals table refreshed
```

---

## 💻 Implementation Details

### State Management

```typescript
// WorkfloDock-style progress tracking
const [progressSteps, setProgressSteps] = useState<Array<{
  id: string;
  agentNumber: number;
  totalAgents: number;
  stepNumber: string; // e.g., "1.19.1", "1.19.2"
  totalSteps: number;
  title: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  command?: string;
  output?: string;
  timestamp: string;
}>>([]);

const [currentMilestone, setCurrentMilestone] = useState<number>(0);
const totalMilestones = 5; // Initialize → Fetch → Generate → Deploy → Complete
```

### Helper Functions

#### Add Step
```typescript
const addProgressStep = (
  agentNumber: number,
  totalAgents: number,
  stepNumber: string,
  totalSteps: number,
  title: string,
  command?: string
) => {
  const step = {
    id: `step-${Date.now()}-${Math.random()}`,
    agentNumber,
    totalAgents,
    stepNumber,
    totalSteps,
    title,
    status: 'running' as const,
    command,
    timestamp: new Date().toISOString()
  };
  setProgressSteps(prev => [...prev, step]);
  return step.id;
};
```

#### Update Step
```typescript
const updateProgressStep = (
  stepId: string,
  updates: { status?: 'pending' | 'running' | 'complete' | 'error'; output?: string }
) => {
  setProgressSteps(prev =>
    prev.map(step => (step.id === stepId ? { ...step, ...updates } : step))
  );
};
```

### Usage Pattern

```typescript
// 1. Add step (returns ID for later updates)
const stepId = addProgressStep(
  1,          // Agent 1
  20,         // of 20 agents
  '1.3',      // Step 1.3
  4,          // of 4 total steps
  'Send POST request',
  'fetch("https://...", { method: "POST" })'
);

// 2. Do work
const response = await fetch(...);

// 3. Update step status
updateProgressStep(stepId, { 
  status: 'complete',
  output: 'HTTP 200 - Request sent'
});

// 4. Update milestone
setCurrentMilestone(1); // Move to milestone 1
```

---

## 📋 Copy Command Feature

### UI Component

Each step with a command includes a "Copy" button:

```tsx
<Button
  size="sm"
  variant="ghost"
  className="h-6 px-2"
  onClick={() => {
    navigator.clipboard.writeText(step.command || '');
    toast.success('Command copied!');
  }}
>
  <Copy className="h-3 w-3 mr-1" />
  <span className="text-xs">Copy</span>
</Button>
```

### Command Formatting

Commands are displayed in monospace with code formatting:

```tsx
<code className="text-xs block overflow-x-auto whitespace-pre-wrap break-all">
  {step.command}
</code>
```

**Features:**
- Horizontal scrolling for long commands
- Word wrapping for readability
- Break-all for very long URLs/tokens

---

## 🎯 Milestone Definitions

| Milestone | Name | Description | Steps |
|-----------|------|-------------|-------|
| 0 | **Initialize** | Setup and validation | 1.1 - 1.2 |
| 1 | **Fetch Data** | HTTP request and parsing | 1.3 - 1.4 |
| 2 | **Generate** | AI processing (future) | TBD |
| 3 | **Deploy** | Save to database (future) | TBD |
| 4 | **Complete** | Finalization and refresh | 1.5 - 1.6 |

### Milestone Progression

```
0: Initialize
   └─ 1.1: Initialize Cloud Proposal Agent
   └─ 1.2: Build request payload

1: Fetch Data
   └─ 1.3: Send POST request to edge function
   └─ 1.4: Parse JSON response

4: Complete (skipping 2-3 for now)
   └─ 1.5: ✓ Proposal Agent Completed Successfully
   └─ 1.6: Refresh proposals table
```

---

## 🎨 Visual States

### Step States

#### 1. Running (Blue)
```
┌─────────────────────────────────────────────────────────────┐
│ ⟳ Agent 1 of 20 — Step 1.3 of 4              10:45:23 AM   │
│                                                              │
│ Send POST request to edge function                          │
│ [Command shown with Copy button]                            │
└─────────────────────────────────────────────────────────────┘
Border: Blue (#3B82F6)
Background: Blue-50 (light mode) / Blue-950 (dark mode)
Icon: Spinning loader (Loader2 with animate-spin)
```

#### 2. Complete (Green)
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Agent 1 of 20 — Step 1.3 of 4              10:45:23 AM   │
│                                                              │
│ Send POST request to edge function                          │
│ [Command shown with Copy button]                            │
│ HTTP 200 - Request sent                                     │
└─────────────────────────────────────────────────────────────┘
Border: Green (#10B981)
Background: Green-50 (light mode) / Green-950 (dark mode)
Icon: CheckCircle2 (green)
```

#### 3. Error (Red)
```
┌─────────────────────────────────────────────────────────────┐
│ ✗ Agent 1 of 20 — Step ERROR                10:45:23 AM    │
│                                                              │
│ Error: Network request failed                               │
└─────────────────────────────────────────────────────────────┘
Border: Red (#EF4444)
Background: Red-50 (light mode) / Red-950 (dark mode)
Icon: XCircle (red)
```

#### 4. Pending (Gray)
```
┌─────────────────────────────────────────────────────────────┐
│ ○ Agent 1 of 20 — Step 1.5 of 5              --:--:-- --   │
│                                                              │
│ Waiting to execute...                                       │
└─────────────────────────────────────────────────────────────┘
Border: Muted
Background: Muted/50
Icon: Circle (hollow, muted)
```

---

## 📱 Responsive Design

### Desktop View
- Full step cards with all details
- Side-by-side command and output
- Sticky progress bar at top

### Mobile View
- Stacked layout for better readability
- Command block takes full width
- Copy button remains accessible
- Sticky progress bar adapts

---

## 🔧 Customization

### Adding New Steps

```typescript
// Example: Add a deployment sub-step
const deployStepId = addProgressStep(
  1,                    // Agent number
  20,                   // Total agents
  '1.7.1',             // Hierarchical step (1 → 7 → 1)
  10,                   // Total steps
  'Deploy to production',
  'git push production main'
);

// Do deployment work...
await deployToProduction();

// Mark complete
updateProgressStep(deployStepId, {
  status: 'complete',
  output: 'Deployed successfully to production'
});
```

### Adding New Milestones

Update the milestone array and add labels:

```tsx
const totalMilestones = 7; // Was 5, now 7

// Update labels in JSX
<div className="flex justify-between text-xs text-muted-foreground">
  <span>Init</span>
  <span>Fetch</span>
  <span>Validate</span>  {/* New */}
  <span>Generate</span>
  <span>Test</span>       {/* New */}
  <span>Deploy</span>
  <span>Done</span>
</div>
```

---

## ✅ Best Practices

### 1. Step Numbering
- **Do**: Use hierarchical numbering (1.19.1, 1.19.2)
- **Don't**: Skip numbers or use non-sequential IDs
- **Why**: Maintains clear execution order

### 2. Command Clarity
- **Do**: Include actual executable commands
- **Don't**: Put descriptions in command field
- **Why**: Users can copy and run commands directly

### 3. Output Messages
- **Do**: Provide concise, informative status
- **Don't**: Dump raw error objects
- **Why**: Improves readability and debugging

### 4. Error Handling
- **Do**: Always mark failed steps with 'error' status
- **Don't**: Leave steps in 'running' state after failure
- **Why**: Clear visual feedback on failures

---

## 🧪 Testing Checklist

- [ ] Progress bar updates correctly through milestones
- [ ] Step numbering follows WorkfloDock format
- [ ] Copy command button works for all steps
- [ ] Step colors match status (green/blue/red/gray)
- [ ] Timestamps display correctly
- [ ] Scrolling works with sticky progress bar
- [ ] Mobile layout is readable
- [ ] Error states display properly
- [ ] Toast notifications appear on copy

---

## 📚 Related Documentation

- `CLOUD_RUN_ENHANCED_GUIDE.md` - Cloud Run features
- `PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md` - Core agent functionality
- `SYNC_CLOUD_SECRETS_GUIDE.md` - Secret management

---

## 🎓 Quick Reference

### Add a Step
```typescript
const id = addProgressStep(agentNum, totalAgents, stepNum, totalSteps, title, cmd);
```

### Update a Step
```typescript
updateProgressStep(id, { status: 'complete', output: 'Done!' });
```

### Update Milestone
```typescript
setCurrentMilestone(2); // Move to milestone 2
```

### Step Number Format
```
1.19.1
│ │  └─ Sub-sub-step (test iteration)
│ └──── Sub-step (deployment phase)
└────── Major step (workflow)
```

---

**Status**: ✅ Implemented  
**Version**: 1.0  
**Date**: 2025-10-16  
**Standard**: WorkfloDock Progress UI v1
