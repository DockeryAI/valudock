# Global Settings - Visual User Guide

**Visual walkthrough of the auto-update feature**

---

## 📸 What You'll See

### Step 1: Changing a Global Setting

```
┌─────────────────────────────────────────────────┐
│ Global Default Settings                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Implementation Defaults                         │
│                                                 │
│ ┌──────────────────┐  ┌────────────────────┐  │
│ │ Software Cost    │  │ Upfront Costs      │  │
│ │ $ 500 → 750 ✏️   │  │ $ 5000             │  │
│ └──────────────────┘  └────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

You type a new value → System checks for conflicts

---

### Step 2A: No Conflicts (Smooth!)

```
All processes use global settings ✅

┌─────────────────────────────────────┐
│ ✅ Global Default Updated            │
│                                     │
│ Software Cost: $750                 │
│                                     │
│ All 5 processes now use $750        │
│                                     │
│ [Done]                              │
└─────────────────────────────────────┘

No warning needed!
```

---

### Step 2B: Conflicts Detected (Warning!)

```
⚠️ System detects processes with individual settings

┌──────────────────────────────────────────────────┐
│ ⚠️  Apply Global Setting to Processes?           │
├──────────────────────────────────────────────────┤
│                                                  │
│ You're about to change "Software Cost"          │
│                                                  │
│ The following 3 processes have individual       │
│ cost settings that differ from the global:      │
│                                                  │
│ ┌────────────────────────────────────────────┐ │
│ │ • Invoice Processing                       │ │
│ │ • Customer Onboarding                      │ │
│ │ • Report Generation                        │ │
│ └────────────────────────────────────────────┘ │
│                                                  │
│ ⚠️ Do you want to apply this change to all?     │
│                                                  │
│ • Yes: All processes use new value              │
│ • No: Only new processes use new value          │
│                                                  │
│ [Keep Individual] [Apply to All] 🔶             │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Visual Decision Tree

```
                    Change Global Setting
                            │
                            ↓
            ┌───────────────┴───────────────┐
            │                               │
      Any processes with              All processes use
      individual settings?             global settings
            │                               │
            ↓                               ↓
    ┏━━━━━━━━━━━━━━━┓              Apply Change
    ┃ WARNING       ┃              Immediately
    ┃ DIALOG        ┃                   │
    ┃               ┃                   ↓
    ┃ [Keep] [Apply]┃              ✅ Done!
    ┗━━━━━━━━━━━━━━━┛
            │
            ├───────────────┬──────────────┐
            │               │
    Click "Keep"     Click "Apply"
            │               │
            ↓               ↓
    Update Global    Update Global +
    Only              All Processes
            │               │
            ↓               ↓
        ✅ Done!        ✅ Done!
```

---

## 🎯 Before & After Examples

### Example 1: Apply to All Processes

**Before:**
```
Global Setting:        $500
├─ Process A (global): $500
├─ Process B (custom): $800 ⚠️
└─ Process C (global): $500
```

**You Change Global to $750**

**Warning Shows:**
```
⚠️ Process B has individual setting ($800)
```

**You Click "Apply to All"**

**After:**
```
Global Setting:        $750 ✅
├─ Process A (global): $750 ✅
├─ Process B (custom): $750 ✅ (updated!)
└─ Process C (global): $750 ✅
```

---

### Example 2: Keep Individual Settings

**Before:**
```
Global Setting:        $500
├─ Process A (global): $500
├─ Process B (custom): $800 ⚠️
└─ Process C (global): $500
```

**You Change Global to $750**

**Warning Shows:**
```
⚠️ Process B has individual setting ($800)
```

**You Click "Keep Individual"**

**After:**
```
Global Setting:        $750 ✅
├─ Process A (global): $750 ✅
├─ Process B (custom): $800 (unchanged)
└─ Process C (global): $750 ✅
```

---

## 📊 Process Status Indicators

```
┌─────────────────────────────────────────┐
│ Process: Invoice Processing            │
├─────────────────────────────────────────┤
│                                         │
│ 🔵 Uses Global Settings                 │
│    Software Cost: $500 (from global)    │
│                                         │
│ OR                                      │
│                                         │
│ 🟡 Individual Settings                  │
│    Software Cost: $800 (custom)         │
│                                         │
└─────────────────────────────────────────┘
```

**Legend:**
- 🔵 = Uses global defaults (changes automatically)
- 🟡 = Has individual settings (may trigger warning)

---

## 🔄 How to Change Process Setting Mode

### Making Process Use Global Settings

```
┌──────────────────────────────────────┐
│ Process Advanced Metrics             │
├──────────────────────────────────────┤
│                                      │
│ ☑️ Use Global Settings               │
│ [Toggle ON]                          │
│                                      │
│ Software Cost: $500 (from global) 🔵 │
│                                      │
└──────────────────────────────────────┘
```

### Making Process Use Individual Settings

```
┌──────────────────────────────────────┐
│ Process Advanced Metrics             │
├──────────────────────────────────────┤
│                                      │
│ ☐ Use Global Settings                │
│ [Toggle OFF]                         │
│                                      │
│ Software Cost: $ 800 ✏️ 🟡           │
│ (You can edit this now)              │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎓 User Journey Map

### Journey 1: Simple Update (No Warning)

```
1. User                2. System              3. Result
   │                      │                      │
   ├─ Change $500→$750    │                      │
   │                      │                      │
   │                      ├─ Check processes     │
   │                      │   ✅ All use global  │
   │                      │                      │
   │                      ├─ Apply immediately   │
   │                      │                      │
   │                      └─────────────────────→│
   │                                             │
   └─ See updated values ✅                      │
```

### Journey 2: Warning & Decision

```
1. User           2. System         3. Dialog      4. Result
   │                 │                 │              │
   ├─ Change         │                 │              │
   │  $500→$750      │                 │              │
   │                 │                 │              │
   │                 ├─ Check          │              │
   │                 │  ⚠️ Found 3     │              │
   │                 │  with custom    │              │
   │                 │                 │              │
   │                 ├─ Show ─────────→│              │
   │                 │  warning        │              │
   │                 │                 │              │
   │←────────────────┴─────────────────┤              │
   │  Review affected processes        │              │
   │                                   │              │
   ├─ Click "Apply to All" ───────────→│              │
   │                                   │              │
   │                                   ├─ Update ────→│
   │                                   │  everything  │
   │                                   │              │
   └───────────────────────────────────┴──────────────┤
                                                      │
   See all processes updated ✅                       │
```

---

## 📱 Mobile View

### Warning Dialog on Mobile

```
┌────────────────────────────┐
│ ⚠️                         │
│ Apply Global Setting?      │
├────────────────────────────┤
│                            │
│ Software Cost              │
│                            │
│ 3 processes affected:      │
│                            │
│ ┌────────────────────────┐│
│ │ • Invoice Processing   ││
│ │ • Customer Onboarding  ││
│ │ • Report Generation    ││
│ └────────────────────────┘│
│                            │
│ ⚠️ Apply to all?           │
│                            │
│ • Yes: Update all          │
│ • No: Keep individual      │
│                            │
│ ┌──────────┐┌───────────┐ │
│ │   Keep   ││   Apply   │ │
│ └──────────┘└───────────┘ │
└────────────────────────────┘
```

Touch-friendly buttons with clear labels

---

## 💡 Quick Tips Visual

```
┌─────────────────────────────────────────────────┐
│ 💡 TIPS                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✅ Start with global settings                   │
│    Set up defaults first                        │
│                                                 │
│ ✅ Customize only when needed                   │
│    Most processes should use global             │
│                                                 │
│ ✅ Read warning carefully                       │
│    Lists exactly what will change               │
│                                                 │
│ ✅ When in doubt, keep individual               │
│    You can always update manually later         │
│                                                 │
│ ✅ Use "Apply to All" for corrections           │
│    Good for fixing errors or updating pricing   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Use Case Scenarios

### Scenario A: New Project Setup

```
Stage 1: Setup
├─ Set global defaults
├─ Create all processes
└─ All use global settings 🔵

Stage 2: First Change
├─ Update global setting
├─ No warning (all use global)
└─ All processes update automatically ✅
```

### Scenario B: Mixed Settings

```
Stage 1: Mixed Setup
├─ 3 processes use global 🔵
├─ 2 processes have custom values 🟡
└─ Working as intended

Stage 2: Global Change
├─ Update global setting
├─ Warning shows 2 custom processes ⚠️
├─ Choose "Keep Individual"
└─ Custom values preserved ✅
```

### Scenario C: Price Update

```
Stage 1: Old Pricing
├─ Various custom prices
└─ Need to update all

Stage 2: New Pricing
├─ Change global to new price
├─ Warning shows all custom prices ⚠️
├─ Choose "Apply to All"
└─ All processes use new price ✅
```

---

## 📋 Checklist for Users

```
Before Changing Global Settings:

☐ Do I want this to affect all processes?
☐ Are there custom process values I want to keep?
☐ Is this a correction or intentional change?
☐ Have I reviewed which processes will be affected?

When Warning Appears:

☐ Read the list of affected processes
☐ Consider why each has custom values
☐ Choose appropriate action:
  □ Apply to All → Universal update
  □ Keep Individual → Preserve customizations
  
After Making Changes:

☐ Verify processes show expected values
☐ Recalculate ROI if needed
☐ Document any custom process settings
```

---

## 🎨 Color Legend

Throughout the interface:

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Uses global settings |
| 🟡 Yellow | Has individual settings |
| 🟢 Green | Success/Confirmed |
| 🟠 Orange | Warning/Caution |
| 🔴 Red | Error/Delete |
| ⚪ Gray | Disabled/Inactive |

---

## 🔗 Related Screens

```
Main Flow:

Inputs Screen (Global Settings)
      ↓
[Change Global Value]
      ↓
Warning Dialog (if needed)
      ↓
Updated Processes
      ↓
Results Screen (Recalculate)
```

**Navigation:**
- **Inputs Screen** → Where you change global settings
- **Process Editor** → Where you set individual values
- **Advanced Metrics** → Where you toggle Use Global Settings
- **Results Screen** → Where you see impact of changes

---

**Remember**: The warning dialog is your friend! It prevents accidental overwrites and gives you control over how changes propagate.

---

**Last Updated**: January 2025  
**Visual Guide** | **Version 1.0.0**
