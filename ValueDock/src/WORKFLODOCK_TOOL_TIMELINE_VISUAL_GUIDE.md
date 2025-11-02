# 🎨 WorkfloDock Tool Timeline - Visual Guide

## 📍 Quick Reference

**Location**: Admin → Proposal Agent → Agent Runner Tab → Click "Run Cloud Proposal Agent"

**New Features**:
1. Tool Call Timeline Card
2. Replay Last Run Button
3. Updated Progress Header
4. Auto-Merge Badge (in Proposal Content Builder)

---

## 🎬 Tool Timeline Card - Visual Flow

### Card Layout

```
┌────────────────────────────────────────────────────────────────┐
│ 🔧 Tool Call Timeline              [📜 Replay Last Run]        │
│    Agent tool execution flow                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [fetch_url]  →  [fathom_fetch]  →  [valuedock_get]  →        │
│    Success          Running            Pending                 │
│                                                                │
│  →  [valuedock_put_processes]  →  [valuedock_put_groups]      │
│           Pending                        Pending               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Tool Badge States

### State 1: Pending (Gray)
```
┌──────────────┐
│ ○ fetch_url  │ ← Circle icon, gray
└──────────────┘
   Pending
```

### State 2: Running (Blue, Animated)
```
┌──────────────┐
│ ⟳ fetch_url  │ ← Spinning loader, blue, pulsing
└──────────────┘
   Running ⚡
```

### State 3: Success (Green)
```
┌──────────────┐
│ ✓ fetch_url  │ ← Checkmark, green
└──────────────┘
   Success ✅
```

### State 4: Error (Red)
```
┌──────────────┐
│ ✗ fetch_url  │ ← X mark, red
└──────────────┘
   Error ❌
```

### State 5: Skipped (Gray, Faded)
```
┌──────────────┐
│ ○ fetch_url  │ ← Circle, 50% opacity
└──────────────┘
   Skipped
```

---

## 🔄 Complete Execution Flow

### Step 1: Initialization
```
┌────────────────────────────────────────────────────────────────┐
│ [○ fetch_url] → [○ fathom_fetch] → [○ valuedock_get] →        │
│    Pending         Pending             Pending                 │
│                                                                │
│  →  [○ valuedock_put_processes] → [○ valuedock_put_groups]    │
│           Pending                        Pending               │
└────────────────────────────────────────────────────────────────┘
```

### Step 2: First Tool Running
```
┌────────────────────────────────────────────────────────────────┐
│ [⟳ fetch_url] → [○ fathom_fetch] → [○ valuedock_get] →        │
│    Running ⚡        Pending             Pending                 │
│                                                                │
│  →  [○ valuedock_put_processes] → [○ valuedock_put_groups]    │
│           Pending                        Pending               │
└────────────────────────────────────────────────────────────────┘
```

### Step 3: First Success, Second Running
```
┌────────────────────────────────────────────────────────────────┐
│ [✓ fetch_url] → [⟳ fathom_fetch] → [○ valuedock_get] →        │
│    Success ✅       Running ⚡           Pending                 │
│                                                                │
│  →  [○ valuedock_put_processes] → [○ valuedock_put_groups]    │
│           Pending                        Pending               │
└────────────────────────────────────────────────────────────────┘
```

### Step 4: All Complete
```
┌────────────────────────────────────────────────────────────────┐
│ [✓ fetch_url] → [✓ fathom_fetch] → [✓ valuedock_get] →        │
│    Success ✅       Success ✅           Success ✅              │
│                                                                │
│  →  [✓ valuedock_put_processes] → [✓ valuedock_put_groups]    │
│           Success ✅                     Success ✅              │
└────────────────────────────────────────────────────────────────┘
```

---

## 📜 Replay Last Run Button

### Button States

**Enabled (after first run)**:
```
┌─────────────────────┐
│ 📜 Replay Last Run  │ ← Clickable
└─────────────────────┘
```

**Disabled (during run)**:
```
┌─────────────────────┐
│ 📜 Replay Last Run  │ ← Grayed out
└─────────────────────┘
```

**On Click**:
```
Toast: "Replaying last run..."
Timeline resets to pending
Same payload re-POSTed
```

---

## 📊 Progress Header Updates

### Before
```
Agent 1 of 20 — Step 1.19.1 of 6
Initialize Cloud Proposal Agent
```

### After
```
Agent 2 of 20 — Step 2.3.1 of N ✓ Fathom tool wired
```

### Step Evolution
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Step 2.3.1: ✓ Fathom tool wired                          │ ← Complete
│   Agent 2 of 20 — Step 2.3.1 of 6                          │
│   ✅ Completed 10:30:45 AM                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⟳ Step 2.3.2: Build request payload                         │ ← Running
│   Agent 2 of 20 — Step 2.3.2 of 6                          │
│   ⚡ Running...                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ○ Step 2.3.3: Send POST request to edge function           │ ← Pending
│   Agent 2 of 20 — Step 2.3.3 of 6                          │
│   ⏳ Pending                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏷️ Auto-Merge Badge (Proposal Content Builder)

### Location
```
┌────────────────────────────────────────────────────────────┐
│ Proposal Content Builder                                   │
│ [Challenges & Goals: Auto-merged from Fathom] ℹ️            │ ← Badge
│                                                            │
│ Edit sections and export to Gamma                         │
└────────────────────────────────────────────────────────────┘
```

### Badge Styles
- **Background**: Purple-100 (light) / Purple-900 (dark)
- **Text**: Purple-700 (light) / Purple-300 (dark)
- **Border**: Purple-300 (light) / Purple-700 (dark)
- **Variant**: Outline

### Tooltip (on hover)
```
┌────────────────────────────────────────────────────────┐
│ Automatically included from the latest call summaries  │
│ when saving new proposal versions.                    │
└────────────────────────────────────────────────────────┘
```

---

## 🎬 Complete User Journey

### Journey 1: First Run

```
1. User fills form:
   ┌─────────────────────────┐
   │ Deal ID: DEAL-2025-001  │
   │ Customer URL: acme.com  │
   │ Organization: Acme Corp │
   └─────────────────────────┘

2. Click "Run Cloud Proposal Agent"

3. Tool Timeline appears:
   All tools → Pending

4. Tools execute one by one:
   fetch_url: Pending → Running → Success ✅
   fathom_fetch: Pending → Running → Success ✅
   valuedock_get: Pending → Running → Success ✅
   valuedock_put_processes: Pending → Running → Success ✅
   valuedock_put_groups: Pending → Running → Success ✅

5. "Replay Last Run" button enabled

6. Progress shows:
   "Step 2.3.5: ✓ Proposal Agent Completed Successfully"
```

### Journey 2: Replay Run

```
1. User clicks "Replay Last Run"

2. Toast: "Replaying last run..."

3. Timeline resets:
   All tools → Pending

4. Same payload re-POSTed:
   {
     "deal_id": "DEAL-2025-001",
     "customer_url": "acme.com",
     ...
   }

5. Execution repeats (see Journey 1, steps 4-6)
```

### Journey 3: Viewing Auto-Merge

```
1. Navigate to: Admin → Proposal Agent → Edit Content

2. Header shows badge:
   [Challenges & Goals: Auto-merged from Fathom] ℹ️

3. Hover over badge → Tooltip appears:
   "Automatically included from the latest call summaries..."

4. User understands:
   - Challenges section auto-populated
   - Data from Fathom meetings
   - Updates on each version save
```

---

## 🎨 Color Palette

### Tool Timeline
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Card Border** | Blue-500 | Blue-500 |
| **Success Badge** | Green-600 bg | Green-600 bg |
| **Running Badge** | Blue-600 bg | Blue-600 bg |
| **Error Badge** | Red-600 bg | Red-600 bg |
| **Pending Badge** | Gray-400 | Gray-600 |
| **Arrow** | Muted-foreground | Muted-foreground |

### Auto-Merge Badge
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Background** | Purple-100 | Purple-900 |
| **Text** | Purple-700 | Purple-300 |
| **Border** | Purple-300 | Purple-700 |

### Progress Steps
| Status | Border | Background |
|--------|--------|------------|
| **Complete** | Green-500 | Green-50 / Green-950 |
| **Running** | Blue-500 | Blue-50 / Blue-950 |
| **Error** | Red-500 | Red-50 / Red-950 |
| **Pending** | Muted | Muted/50 |

---

## 📱 Responsive Design

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────────────────┐
│ Tool Timeline Card (full width)                                │
│ [Badge] → [Badge] → [Badge] → [Badge] → [Badge]               │
│                    Single row                                  │
└────────────────────────────────────────────────────────────────┘
```

### Tablet (768-1023px)
```
┌──────────────────────────────────────────┐
│ Tool Timeline Card                       │
│ [Badge] → [Badge] → [Badge] →            │
│ [Badge] → [Badge]                        │
│           Wrapped to 2 rows              │
└──────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌───────────────────────┐
│ Tool Timeline Card    │
│ [Badge]               │
│    ↓                  │
│ [Badge]               │
│    ↓                  │
│ [Badge]               │
│    ↓                  │
│ [Badge]               │
│    ↓                  │
│ [Badge]               │
│  Vertical stack       │
└───────────────────────┘
```

---

## 🔍 Debugging Visual Cues

### Success Path
```
All green checkmarks:
[✓] → [✓] → [✓] → [✓] → [✓]
Everything worked perfectly!
```

### Partial Failure
```
Mix of statuses:
[✓] → [✓] → [✗] → [○] → [○]
        Error here ↑
        Subsequent tools skipped
```

### Early Failure
```
[✗] → [○] → [○] → [○] → [○]
Failed immediately
All others skipped
```

### In Progress
```
[✓] → [✓] → [⟳] → [○] → [○]
             Currently running here
```

---

## 📊 Comparison: Before vs After

### Before (Text-only Logs)
```
Deployment Log:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Running Cloud Proposal Agent...

✅ Step 1.19.1 complete
✅ Step 1.19.2 complete
📤 Sending request to cloud endpoint...
   Deal ID: DEAL-2025-001
   Customer URL: acme.com
✅ Step 1.19.3 complete
📥 Response received (HTTP 200)
✅ Step 1.19.4 complete
✅ Proposal Agent Completed Successfully!
```

### After (Visual Timeline + Logs)
```
Tool Timeline:
┌────────────────────────────────────────────────────────────────┐
│ [✓ fetch_url] → [✓ fathom_fetch] → [✓ valuedock_get] →        │
│    Success ✅       Success ✅           Success ✅              │
│  →  [✓ valuedock_put_processes] → [✓ valuedock_put_groups]    │
│           Success ✅                     Success ✅              │
└────────────────────────────────────────────────────────────────┘

Progress Steps:
┌─────────────────────────────────────────────────────────────┐
│ ✅ Agent 2 of 20 — Step 2.3.1 of 6                          │
│    ✓ Fathom tool wired                                      │
│    Completed at 10:30:45 AM                                 │
└─────────────────────────────────────────────────────────────┘

Deployment Log:
(same as before)
```

---

## ✅ Visual Testing Checklist

### Tool Timeline Card
- [ ] Card appears when run starts
- [ ] Blue border (2px)
- [ ] 5 tool badges visible
- [ ] Arrows between badges
- [ ] Status text below each badge
- [ ] "Replay Last Run" button in header

### Tool Badges
- [ ] Pending: Gray circle, no animation
- [ ] Running: Blue loader, spinning + pulsing
- [ ] Success: Green checkmark, static
- [ ] Error: Red X, static
- [ ] Skipped: Gray circle, 50% opacity

### Progress Header
- [ ] Shows "Agent 2 of 20"
- [ ] Shows "Step 2.3.x of N"
- [ ] Includes checkmark for completed
- [ ] Shows descriptive title
- [ ] Timestamp visible

### Auto-Merge Badge
- [ ] Purple color scheme
- [ ] Outline variant
- [ ] Tooltip on hover
- [ ] Tooltip text correct
- [ ] Responsive (wraps on mobile)

### Dark Mode
- [ ] Tool timeline readable
- [ ] Badge colors visible
- [ ] Purple badge contrasts
- [ ] Progress steps readable
- [ ] Tooltip readable

---

**Quick Access**: Admin → Proposal Agent → Agent Runner  
**Documentation**: [WORKFLODOCK_TOOL_TIMELINE_COMPLETE.md](WORKFLODOCK_TOOL_TIMELINE_COMPLETE.md)  
**Status**: ✅ Complete
