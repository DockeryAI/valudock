# Collapsible Properties Panel - Visual Guide

## Feature Overview

The Workflow Builder properties panel now supports **collapse/expand** functionality. This gives you more canvas space when working on workflow structure.

---

## Visual Comparison

### Before (Always Expanded)
```
┌────────────────────────────────────────┐
│ 🎯 Workflow Builder                    │
├────────────────────────────────────────┤
│                                        │
│  [Start] ──→ [Task] ──→ [End]         │
│                ↓                       │
│              Properties Panel:         │
│              ┌─────────────────┐       │
│              │ Task Node    [X]│       │
│              ├─────────────────┤       │
│              │ Label: Task     │       │
│              │                 │       │
│              │ ⚙️ Configuration│       │
│              │   Type: Task    │       │
│              │   Assignee: ... │       │
│              │                 │       │
│              │ 📊 Complexity   │       │
│              │   Team: IT      │       │
│              │                 │       │
│              │ [Delete Node]   │       │
│              └─────────────────┘       │
│                                        │
└────────────────────────────────────────┘
     ↑ Properties panel takes up space
```

### After (Collapsible)
```
┌────────────────────────────────────────┐
│ 🎯 Workflow Builder                    │
├────────────────────────────────────────┤
│                                        │
│  [Start] ──→ [Task] ──→ [Decision]    │
│                ↓           ↙  ↘        │
│           [Task 2]    [Task 3] [End]  │
│                                        │
│                          Properties:   │
│                          ┌──────────┐  │
│                          │ Task [∧][X]│  
│                          └──────────┘  │
│                           ↑ Collapsed! │
│                                        │
│       ← MORE CANVAS SPACE! →          │
│                                        │
└────────────────────────────────────────┘
```

---

## Button Locations

### Expanded State
```
┌─────────────────────────────────────┐
│  Task Node          [∨] [X]         │  ← Header bar
├─────────────────────────────────────┤     [∨] = Collapse
│  Label: Task                        │     [X] = Close
│                                     │
│  ⚙️ Configuration                   │
│    Trigger Type: [dropdown]         │
│    ...                              │
│                                     │
│  📋 Process Metadata                │
│    Triggers: email, ...             │
│    ...                              │
│                                     │
│  📊 Complexity Tracking             │
│    Team: IT                         │
│    ...                              │
│                                     │
│  [Delete Node]                      │
└─────────────────────────────────────┘
```

### Collapsed State
```
┌─────────────────────────────────────┐
│  Task Node          [∧] [X]         │  ← Only header visible
└─────────────────────────────────────┘     [∧] = Expand
                                             [X] = Close
```

---

## Button Behavior

### Chevron Button (Collapse/Expand)
| State | Icon | Tooltip | Action |
|-------|------|---------|--------|
| **Expanded** | `∨` (ChevronDown) | "Collapse properties" | Hides all content except header |
| **Collapsed** | `∧` (ChevronDown rotated) | "Expand properties" | Shows all content |

**Icon Animation:**
- Smooth rotation transition
- `rotate-180` class when collapsed
- Visual feedback on state change

### X Button (Close)
| Icon | Tooltip | Action |
|------|---------|--------|
| `X` | "Close properties" | Closes panel completely (same as before) |

**Behavior:**
- Works in both expanded and collapsed states
- Closes the panel entirely
- Click another node to reopen

---

## User Workflows

### Workflow 1: Maximize Canvas Space
```
1. Click node → Properties panel opens (expanded)
2. Click [∨] → Panel collapses to header only
3. More canvas space for building workflow
4. Header still shows which node is selected
5. Panel remains draggable even when collapsed
```

### Workflow 2: Quick Node Reference
```
1. Select multiple nodes while building
2. Collapse properties panel for each
3. See multiple node headers on canvas
4. Quick visual reference of what's selected
5. Expand any panel when you need to edit
```

### Workflow 3: Toggle While Editing
```
1. Edit node properties (expanded)
2. Need to see more canvas → Collapse
3. Check workflow structure
4. Need to edit again → Expand
5. Smooth back-and-forth workflow
```

---

## State Management

### Component State
```typescript
const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false);
```

**Default:** `false` (expanded)
**Persistence:** Not persisted between sessions
**Scope:** Per-panel instance

### When Panel Opens
```typescript
// User clicks a node
handleNodeClick(nodeId) {
  setSelectedNode(nodeId);
  setShowPropertiesPanel(true);
  setPropertiesPanelCollapsed(false); // Always opens expanded
}
```

**Behavior:** Each time you select a node, the panel opens in the **expanded** state by default.

### State Transitions
```
Panel Closed
     ↓ (Click node)
Panel Open + Expanded
     ↓ (Click ∨)
Panel Open + Collapsed
     ↓ (Click ∧)
Panel Open + Expanded
     ↓ (Click X)
Panel Closed
```

---

## Visual Feedback

### Chevron Icon States

**Expanded:**
```
[∨]  ← Points down
     "Click to collapse"
```

**Collapsed:**
```
[∧]  ← Points up
     "Click to expand"
```

**Animation:**
```css
transition-transform
rotate-180 when collapsed
```

### Hover Effects

**Buttons:**
```typescript
className="h-6 w-6 p-0 hover:bg-white/20 rounded"
```

- Subtle white background on hover
- Clear click target (24px × 24px)
- Accessible touch target size

### Header Styling

**Background:**
```typescript
className="bg-gradient-to-r from-indigo-600 to-purple-600"
```

**Text:**
```typescript
className="text-white text-sm font-semibold"
```

**Cursor:**
```typescript
cursor-grab active:cursor-grabbing
```

Panel remains draggable in both states.

---

## Accessibility

### Keyboard Support
- **Tab:** Navigate to buttons
- **Enter/Space:** Toggle collapse/expand
- **Escape:** Close panel (existing behavior)

### Screen Readers
- Buttons have clear tooltips
- State communicated through icon rotation
- Panel header always readable

### Touch Targets
- All buttons are 24px × 24px minimum
- Adequate spacing between buttons
- Easy to tap on mobile/tablet

---

## Technical Details

### CSS Classes

**Header:**
```tsx
className="px-3 py-2 border-b bg-gradient-to-r from-indigo-600 to-purple-600 
           cursor-grab active:cursor-grabbing flex items-center justify-between"
```

**Button Container:**
```tsx
className="flex items-center gap-1"
```

**Chevron Icon:**
```tsx
className={`w-3.5 h-3.5 text-white transition-transform 
            ${propertiesPanelCollapsed ? 'rotate-180' : ''}`}
```

**Content Wrapper:**
```tsx
{!propertiesPanelCollapsed && (
  <ScrollArea className="max-h-[calc(100vh-150px)]">
    {/* Content */}
  </ScrollArea>
)}
```

### Event Handlers

**Collapse/Expand:**
```tsx
onClick={() => setPropertiesPanelCollapsed(!propertiesPanelCollapsed)}
onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
```

**Close:**
```tsx
onClick={() => setShowPropertiesPanel(false)}
onMouseDown={(e) => e.stopPropagation()}
```

---

## Common Use Cases

### 1. Complex Workflow Building
```
Scenario: Building a workflow with 20+ nodes
Solution: 
  - Collapse properties after editing each node
  - See full canvas while placing nodes
  - Expand only when needed for detailed edits
```

### 2. Mobile/Small Screens
```
Scenario: Working on a laptop or tablet
Solution:
  - Properties panel takes up valuable space
  - Collapse when not actively editing
  - Maximize visible canvas area
```

### 3. Presentation Mode
```
Scenario: Showing workflow to stakeholders
Solution:
  - Collapse all property panels
  - Clean view of workflow structure
  - Focus on process flow, not details
```

### 4. Multi-Node Editing
```
Scenario: Editing several nodes in sequence
Solution:
  - Edit first node → Collapse
  - Edit second node → Collapse
  - Multiple collapsed panels show context
  - Can see which nodes you've worked on
```

---

## Comparison with Other Features

### vs. Close Button (X)
| Feature | Collapse [∨] | Close [X] |
|---------|--------------|-----------|
| **Header** | ✅ Stays visible | ❌ Gone |
| **Position** | ✅ Preserved | ❌ Lost |
| **Node name** | ✅ Shows | ❌ Hidden |
| **Canvas space** | ✅ More | ✅ Most |
| **Quick reference** | ✅ Yes | ❌ No |

**When to use:**
- **Collapse:** Need canvas space but want to keep node reference
- **Close:** Done editing, don't need panel at all

### vs. Minimizing Window
| Feature | Collapse Panel | Minimize Window |
|---------|---------------|-----------------|
| **Speed** | ✅ Instant | ⚠️ Slower |
| **Position** | ✅ Stays put | ⚠️ May move |
| **Draggable** | ✅ Yes | ❌ No |
| **Node context** | ✅ Shows name | ❌ Hidden |

**Advantage:** Collapse is faster and preserves context.

---

## Future Enhancements

Potential improvements for future versions:

1. **Remember state per node type**
   - Start nodes always collapsed
   - Decision nodes always expanded
   - User preference saved

2. **Keyboard shortcut**
   - `Ctrl+B` to toggle collapse
   - `Ctrl+W` to close panel

3. **Collapse all button**
   - Global control in toolbar
   - Collapse all open panels at once

4. **Resize handle**
   - Drag to adjust panel width
   - Save preferred width

5. **Snap to edges**
   - Auto-snap to canvas edges
   - Prevent overlap with nodes

---

## Summary

✅ **What's New:**
- Collapse/expand button in properties panel header
- Smooth animation with chevron icon rotation
- More canvas space when collapsed
- Panel remains draggable in both states

✅ **Benefits:**
- Better use of screen real estate
- Faster workflow building
- Keep node context visible
- Improved mobile/tablet experience

✅ **How to Use:**
1. Click node to open properties (expanded)
2. Click `∨` to collapse to header only
3. Click `∧` to expand again
4. Click `X` to close entirely

---

**Implementation:** Complete ✅  
**Files Modified:** `/components/workflow-module/WorkflowBuilder.tsx`  
**Date:** October 16, 2025
