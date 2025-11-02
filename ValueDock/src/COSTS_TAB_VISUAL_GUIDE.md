# 💰 Costs Tab - Visual Navigation Guide

## New Layout (Two-Column Design)

```
┌────────────────────────────────────────────────────────────────────┐
│                    Admin Dashboard → Costs                         │
├──────────────────────────┬─────────────────────────────────────────┤
│                          │                                         │
│  📁 Select Organization  │  💵 Cost Classification Manager         │
│                          │                                         │
│  ▼ 🏢 Test Tenant       │  ┌──────────────────────────────────┐  │
│    │                     │  │ 💰 Cost Classification           │  │
│    ├─ 🏢 Acme Corp ✓    │  │ for Test Organization            │  │
│    │                     │  ├──────────────────────────────────┤  │
│    ├─ 🏢 XYZ Inc        │  │                                  │  │
│    │                     │  │ 💵 Hard Costs: 8                │  │
│    └─ 🏢 ABC Ltd        │  │ 📊 Soft Costs: 8                │  │
│                          │  │                                  │  │
│  ▶ 🏢 Partner A         │  ├──────────────────────────────────┤  │
│                          │  │ [All] [Labor] [IT] [Risk]       │  │
│  ▶ 🏢 Partner B         │  │                                  │  │
│                          │  │ Direct Labor Costs               │  │
│                          │  │ [💵 Hard]  [Soft]               │  │
│                          │  │                                  │  │
│                          │  │ Software Licensing               │  │
│                          │  │ [💵 Hard]  [Soft]               │  │
│                          │  │                                  │  │
│                          │  │ Training & Onboarding            │  │
│                          │  │ [Hard]  [📊 Soft]               │  │
│                          │  │                                  │  │
│                          │  └──────────────────────────────────┘  │
│                          │                                         │
└──────────────────────────┴─────────────────────────────────────────┘
```

## Step-by-Step Usage

### Step 1: Navigate to Costs Tab
```
Admin Dashboard → Click "Costs" tab
```

### Step 2: Expand Tenant
```
Left Panel:
▶ Tenant A         →  Click to expand
▼ Tenant A
  → Org 1
  → Org 2
  → Org 3
```

### Step 3: Select Organization
```
▼ Tenant A
  → Org 1          ←  Click this
  → Org 2
```

### Step 4: Manage Costs (Right Panel)
```
Right Panel loads automatically:

┌─────────────────────────────────┐
│ Cost Classification             │
│ for Org 1                       │
├─────────────────────────────────┤
│ 💵 Hard: 8  📊 Soft: 8         │
├─────────────────────────────────┤
│ Direct Labor         [💵] [  ]  │
│ Software Licensing   [💵] [  ]  │
│ Training & Onboarding[  ] [📊]  │
│ ...                             │
└─────────────────────────────────┘
```

### Step 5: Toggle Hard/Soft
```
Click button to reclassify:

Training & Onboarding
[Hard] [📊 Soft]  ← Currently "Soft"

↓ Click "Hard" button

Training & Onboarding
[💵 Hard] [Soft]  ← Now "Hard"
```

### Step 6: Save Changes
```
[Reset]  [💾 Save Changes]
         ↑ Click to save
```

## Role-Based Views

### 🔴 Global Admin View
```
Can see ALL tenants:
▼ Tenant A
  → Org 1
  → Org 2
▼ Tenant B  
  → Org 3
  → Org 4
▼ Tenant C
  → Org 5
```

### 🟡 Tenant Admin View
```
Can see ONLY their tenant:
▼ My Tenant
  → Org 1
  → Org 2
  → Org 3
```

### 🟢 Org Admin View
```
NO tree view - sees their org directly:

┌─────────────────────────────────┐
│ Cost Classification             │
│ for My Organization             │
├─────────────────────────────────┤
│ Automatically loaded            │
│ (no selection needed)           │
└─────────────────────────────────┘
```

## Visual Indicators

### Expanded Tenant
```
▼ Tenant Name  ← Chevron points down
```

### Collapsed Tenant
```
▶ Tenant Name  ← Chevron points right
```

### Selected Organization
```
→ Organization Name ✓  ← Checkmark or highlight
```

### Hard Cost Button (Active)
```
[💵 Hard]  ← Blue/filled background
```

### Soft Cost Button (Active)
```
[📊 Soft]  ← Green/filled background
```

### Inactive Button
```
[Hard]  ← Gray/outline style
```

## Empty States

### No Organization Selected
```
┌─────────────────────────────────┐
│                                 │
│         💰 (faded icon)         │
│                                 │
│  No Organization Selected       │
│                                 │
│  Select an organization from    │
│  the left panel to manage       │
│  cost classifications           │
│                                 │
└─────────────────────────────────┘
```

### No Tenants Available
```
┌─────────────────────────────────┐
│  ⚠️ No tenants available        │
│  Please create a tenant first.  │
└─────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
```
Two-column layout:
┌──────────┬───────────────┐
│  Tree    │  Manager      │
│  (33%)   │  (67%)        │
└──────────┴───────────────┘
```

### Tablet/Mobile (<1024px)
```
Stacked layout:
┌───────────────────────────┐
│  Tree                     │
│  (full width)             │
├───────────────────────────┤
│  Manager                  │
│  (full width)             │
└───────────────────────────┘
```

## Quick Tips

✅ **Tip 1**: Tenants start collapsed - click chevron to expand
✅ **Tip 2**: Selected org is highlighted in the tree
✅ **Tip 3**: Right panel only shows when org is selected
✅ **Tip 4**: Save button only enables when you make changes
✅ **Tip 5**: Use tabs to filter by category (All, Labor, IT, Risk, Opportunity)

## Common Workflows

### Change Multiple Costs for One Org
1. Expand tenant → Select org
2. Toggle multiple costs
3. Click "Save Changes" (saves all at once)

### Review All Orgs in a Tenant
1. Expand tenant
2. Click Org 1 → Review costs
3. Click Org 2 → Review costs
4. Click Org 3 → Review costs

### Quick Edit (Org Admin)
1. Click "Costs" tab
2. Already loaded! (no selection needed)
3. Make changes
4. Save

---

**Need More Help?** See full documentation in `/COST_CLASSIFICATION_FEATURE.md`
