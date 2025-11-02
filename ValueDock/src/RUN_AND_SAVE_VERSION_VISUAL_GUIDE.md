# Run & Save Version - Visual Guide

## 🎨 Complete UI Overview

### **Desktop View:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Proposal Builder                         │
├─────────────────────────────────────────────────────────────────┤
│ 🏢 Acme Corp → West Division → DEAL-2025-001                    │
│                                                                  │
│ Proposal Builder                    📄 Version 2    [Draft]     │
│ Generate AI-powered proposals       [▼ Switch] [+ New Version]  │
├─────────────────────────────────────────────────────────────────┤
│ ℹ️ Proposal Agent: Automatically generates proposals...         │
├──────────────────────────┬──────────────────────────────────────┤
│ Configuration            │ Agent Status Log                     │
│                          │                                      │
│ Deal ID:                 │ Ready to generate proposal           │
│ [DEAL-2025-001]         │                                      │
│                          │                                      │
│ Customer URL:            │                                      │
│ [https://acme.com]      │                                      │
│                          │                                      │
│ Fathom Window:           │                                      │
│ [Last 30 days ▼]        │                                      │
│                          │                                      │
│ ─────────────────────   │                                      │
│                          │                                      │
│ ┌───────────────────────────────────────────┐                 │
│ │  [  ▶  Run Agent  ] [ 💾 Run & Save    ] │                 │
│ │     Outline button    Version (Primary)   │                 │
│ └───────────────────────────────────────────┘                 │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 🔍 Button Details

### **Side-by-Side Buttons:**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  ┌───────────────────────┐ ┌──────────────────────┐│
│  │                       │ │                      ││
│  │   ▶  Run Agent       │ │  💾  Run & Save     ││
│  │                       │ │      Version         ││
│  │   Light background    │ │   Blue background    ││
│  │   Gray border         │ │   Solid fill         ││
│  │                       │ │                      ││
│  └───────────────────────┘ └──────────────────────┘│
│       (Outline)               (Primary)            │
│                                                    │
└────────────────────────────────────────────────────┘
```

### **Button States:**

#### **1. Normal (Idle):**
```
[  ▶  Run Agent  ]    [ 💾 Run & Save Version ]
   Gray outline         Blue solid background
   White/transparent    White text
```

#### **2. Hover:**
```
[  ▶  Run Agent  ]    [ 💾 Run & Save Version ]
   Darker gray bg       Darker blue bg
   Slight highlight     Slight highlight
```

#### **3. Running:**
```
[  ⏳ Running...  ]   [  ⏳ Running...        ]
   Spinner animation    Spinner animation
   Both disabled        Both disabled
```

#### **4. Disabled (incomplete form):**
```
[  ▶  Run Agent  ]    [ 💾 Run & Save Version ]
   Faded gray           Faded blue
   No hover effect      No hover effect
   Cursor: not-allowed  Cursor: not-allowed
```

---

## 📱 Mobile View

```
┌───────────────────────────┐
│   Proposal Builder        │
├───────────────────────────┤
│ 🏢 Acme → West → DEAL-001│
│                           │
│ 📄 Version 2    [Draft]   │
│ [▼ Switch] [+ New]       │
├───────────────────────────┤
│ Configuration             │
│                           │
│ Deal ID:                  │
│ [DEAL-2025-001]          │
│                           │
│ Customer URL:             │
│ [https://acme.com]       │
│                           │
│ Fathom Window:            │
│ [Last 30 days ▼]         │
│                           │
│ ─────────────────────    │
│                           │
│ ┌───────────────────────┐│
│ │                       ││
│ │  ▶  Run Agent        ││
│ │                       ││
│ └───────────────────────┘│
│                           │
│ ┌───────────────────────┐│
│ │                       ││
│ │ 💾 Run & Save Version ││
│ │                       ││
│ └───────────────────────┘│
│                           │
├───────────────────────────┤
│ Status Log                │
│ (Ready)                   │
└───────────────────────────┘
```

**Stacked vertically for easy thumb access**

---

## 🎬 Action Sequences

### **Sequence 1: First-Time Use**

#### **Step 1: Form Filled**
```
┌────────────────────────────────────┐
│ Deal ID: [DEAL-2025-001] ✓        │
│ Customer: [https://acme.com] ✓    │
│                                    │
│ [  ▶  Run Agent  ] [ 💾 Run & Save]│ ← Both enabled
│    (available)        Version      │
└────────────────────────────────────┘
```

#### **Step 2: User Clicks "Run & Save Version"**
```
┌────────────────────────────────────┐
│                                    │
│ [  ⏳ Running...  ] [⏳ Running... ]│ ← Both disabled
│                                    │
│ 🔵 Creating Version 1...           │
└────────────────────────────────────┘
```

#### **Step 3: Version Created, Agent Running**
```
┌────────────────────────────────────┐
│ 📄 Version 1 [Draft] ← NEW!       │
│                                    │
│ [  ⏳ Running...  ] [⏳ Running... ]│
│                                    │
│ Status Log:                        │
│ 🌐 Website      [🔄 Running...]   │
│ 🎤 Fathom       [⏰ Pending]      │
└────────────────────────────────────┘
```

#### **Step 4: Execution Complete**
```
┌────────────────────────────────────┐
│ 📄 Version 1 [Draft]               │
│                                    │
│ [  ▶  Run Agent  ] [ 💾 Run & Save]│ ← Re-enabled
│                                    │
│ ✅ Complete!                       │
│ Status Log:                        │
│ 🌐 Website      [✅ Success]       │
│ 🎤 Fathom       [✅ Success]       │
│ 📄 ValueDock    [✅ Success]       │
│ 🎨 Gamma        [✅ Success]       │
│                                    │
│ 🎨 Gamma Link: [Open Presentation] │
└────────────────────────────────────┘

Toast appears:
┌──────────────────────────┐
│ ✅ Proposal v1 saved!    │
└──────────────────────────┘
```

---

### **Sequence 2: Creating Second Version**

#### **Step 1: Modify Parameters**
```
┌────────────────────────────────────┐
│ 📄 Version 1 [Draft]               │
│ [▼ Switch] [+ New Version]         │
│                                    │
│ Customer: [https://acme.com]       │
│           ↓ User changes           │
│ Customer: [https://subsidiary.com] │ ← Modified
│                                    │
│ [  ▶  Run Agent  ] [ 💾 Run & Save]│
│                        Version      │
└────────────────────────────────────┘
```

#### **Step 2: Click "Run & Save Version"**
```
┌────────────────────────────────────┐
│ [  ⏳ Running...  ] [⏳ Running... ]│
│                                    │
│ 🔵 Creating Version 2...           │
└────────────────────────────────────┘
```

#### **Step 3: Version 2 Created**
```
┌────────────────────────────────────┐
│ 📄 Version 2 [Draft] ← NEW!       │
│ [▼ Switch] [+ New Version]         │
│                                    │
│ Dropdown now shows:                │
│   Version 2 ✓  [Draft]  ← Current │
│   Version 1    [Draft]             │
└────────────────────────────────────┘

Toast:
┌──────────────────────────┐
│ ✅ Proposal v2 saved!    │
└──────────────────────────┘
```

---

### **Sequence 3: Testing Without Saving**

#### **User Wants to Test (Not Create Version)**
```
┌────────────────────────────────────┐
│ 📄 Version 2 [Draft]               │
│                                    │
│ Customer: [https://test.com]       │ ← Testing URL
│                                    │
│ User clicks:                       │
│ [  ▶  Run Agent  ] ← This one!    │
│                                    │
│ Result:                            │
│ - Agent runs with test URL         │
│ - Version 2 updated (not new v3)  │
│ - Can iterate quickly              │
└────────────────────────────────────┘
```

---

## 🎨 Color Coding

### **Button Colors:**

#### **Run Agent (Outline):**
```
Default:
- Background: transparent / white
- Border: 1px solid gray (#e5e7eb)
- Text: black / white (dark mode)

Hover:
- Background: light gray (#f9fafb)
- Border: darker gray (#d1d5db)

Disabled:
- Background: faded transparent
- Border: faded gray
- Text: faded gray
- Opacity: 0.5
```

#### **Run & Save Version (Primary):**
```
Default:
- Background: primary blue (#030213)
- Text: white
- No border (solid fill)

Hover:
- Background: darker blue
- Slight shadow

Disabled:
- Background: faded blue
- Text: faded white
- Opacity: 0.5
```

---

## 🔔 Toast Notifications

### **Success Toast:**
```
┌────────────────────────────────┐
│  ✅ Proposal v3 saved!         │
│                                │
│  Duration: 3 seconds           │
│  Position: Top right           │
│  Color: Green background       │
└────────────────────────────────┘
```

### **Error Toast (if version creation fails):**
```
┌────────────────────────────────┐
│  ❌ Failed to create version   │
│                                │
│  Duration: 5 seconds           │
│  Position: Top right           │
│  Color: Red background         │
└────────────────────────────────┘
```

### **Error Toast (if agent fails):**
```
┌────────────────────────────────┐
│  ❌ Proposal agent error       │
│                                │
│  Duration: 5 seconds           │
│  Position: Top right           │
│  Color: Red background         │
└────────────────────────────────┘
```

---

## 🎯 Version Switcher Updates

### **Before Clicking "Run & Save Version":**
```
┌─────────────────────────────┐
│ 📄 Version 2    [Draft]     │
│ [▼ Switch] [+ New Version]  │
└─────────────────────────────┘

Dropdown:
  Version 2 ✓  [Draft]
  Version 1    [Approved]
```

### **After Successful Run:**
```
┌─────────────────────────────┐
│ 📄 Version 3    [Draft]     │ ← Auto-updated!
│ [▼ Switch] [+ New Version]  │
└─────────────────────────────┘

Dropdown:
  Version 3 ✓  [Draft]   ← NEW (auto-selected)
  Version 2    [Draft]
  Version 1    [Approved]
```

**Notice:**
- Badge updates from "Version 2" → "Version 3"
- Checkmark moves to Version 3 in dropdown
- New version appears at top of list

---

## 📊 Complete Flow Diagram

```
┌──────────────────────┐
│ User fills form      │
│ - Deal ID            │
│ - Customer URL       │
│ - Fathom window      │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ Which button?        │
└──────┬───────┬───────┘
       │       │
       ↓       ↓
 ┌─────────┐ ┌─────────────────┐
 │Run Agent│ │Run & Save Version│
 └────┬────┘ └────┬────────────┘
      │           │
      │           ↓
      │    ┌──────────────────┐
      │    │ Create Version N  │
      │    └────┬─────────────┘
      │         │
      │         ↓
      └────────►┌──────────────┐
                │ Execute Agent │
                └────┬──────────┘
                     │
                     ↓
              ┌──────────────┐
              │ Save Results  │
              └────┬──────────┘
                   │
                   ↓
            ┌─────────────────┐
            │ Update Switcher? │
            └────┬────────┬────┘
                 │        │
            NO (Run) YES (Run&Save)
                 │        │
                 ↓        ↓
            ┌─────────┐ ┌──────────────┐
            │Done     │ │Reload Versions│
            └─────────┘ └────┬──────────┘
                             │
                             ↓
                      ┌──────────────┐
                      │Show Toast    │
                      │"Proposal vN  │
                      │ saved!"      │
                      └──────────────┘
```

---

## 💡 Visual Decision Guide

### **Should I use "Run Agent" or "Run & Save Version"?**

```
┌────────────────────────────────────────────┐
│                                            │
│  Are you testing or creating production?   │
│                                            │
│         Testing           Production       │
│            ↓                  ↓            │
│     [  ▶  Run Agent  ]  [ 💾 Run & Save  ]│
│                              Version       │
│                                            │
│     • Quick iteration   • Client proposal  │
│     • Debugging         • New version      │
│     • Parameter test    • Save history     │
│     • No version save   • Track progress   │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🎓 Quick Tips

### **Visual Cues:**

1. **Outline vs Solid** - Outline for testing, solid for production
2. **Icon Difference** - Play (▶) vs Save (💾) 
3. **Color Emphasis** - Blue primary draws eye to main action
4. **Side-by-Side** - Equal importance, but different purposes
5. **Consistent Spinners** - Both show same loading state

### **Layout:**
- **Desktop:** Side-by-side (equal width)
- **Tablet:** Side-by-side (responsive)
- **Mobile:** Stacked vertically
- **Always:** Both buttons same height for visual balance

---

## 📐 Exact Measurements

### **Desktop (≥768px):**
```
Button Container: 100% width
Layout: grid-cols-2 (50% / 50%)
Gap: 0.75rem (12px)
Button Height: 2.75rem (44px) - "lg" size
Button Padding: 1rem (16px) horizontal
Font Size: 1rem (16px)
Icon Size: 1rem (16px)
Icon Margin: 0.5rem (8px) right
```

### **Mobile (<768px):**
```
Button Container: 100% width
Layout: grid-cols-1 (stacked)
Gap: 0.75rem (12px)
Button Height: 2.75rem (44px)
Button Padding: 1rem (16px) horizontal
Font Size: 1rem (16px)
Icon Size: 1rem (16px)
Icon Margin: 0.5rem (8px) right
Min-Height: 44px (touch target)
```

---

## 🎨 Accessibility

### **ARIA Labels:**
```html
<button aria-label="Run agent without creating new version">
  Run Agent
</button>

<button aria-label="Run agent and save as new version">
  Run & Save Version
</button>
```

### **Keyboard Navigation:**
- Tab: Focus switches between buttons
- Enter/Space: Activates focused button
- Focus visible: Clear outline on keyboard focus

### **Screen Reader:**
- "Button: Run Agent, outline button"
- "Button: Run and Save Version, primary button"
- When running: "Running, disabled"

---

**This visual guide shows exactly what users will see and interact with when using the Run & Save Version feature!** 🚀
