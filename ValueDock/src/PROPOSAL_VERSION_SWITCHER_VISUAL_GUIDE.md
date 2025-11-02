# Proposal Version Switcher - Visual Guide

## 🎨 What You'll See

### **Header Layout (Desktop)**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  🏢 Tech Corporation → 🏢 West Division → 📄 DEAL-2025-Q4-ACME        │
│                                                                         │
│  Proposal Builder                           📄 Version 3    [Draft]    │
│  Generate AI-powered proposals              [▼ Switch] [+ New Version] │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### **Version Dropdown (Expanded)**

```
                              ┌─────────────────────────────────────┐
                              │ ALL VERSIONS                        │
                              ├─────────────────────────────────────┤
                              │ ┌─────────────────────────────────┐ │
                              │ │ Version 3 ✓         [Draft]     │ │
                              │ │ 📅 Oct 16, 2025 2:30 PM         │ │
                              │ │ 👤 John Smith                   │ │
                              │ └─────────────────────────────────┘ │
                              │ ┌─────────────────────────────────┐ │
                              │ │ Version 2           [Review]    │ │
                              │ │ 📅 Oct 15, 2025 10:15 AM        │ │
                              │ │ 👤 Jane Doe                     │ │
                              │ └─────────────────────────────────┘ │
                              │ ┌─────────────────────────────────┐ │
                              │ │ Version 1           [Approved]  │ │
                              │ │ 📅 Oct 14, 2025 3:45 PM         │ │
                              │ │ 👤 John Smith                   │ │
                              │ └─────────────────────────────────┘ │
                              └─────────────────────────────────────┘
```

---

## 🎨 Status Badge Colors

### Visual Examples:

```
┌──────────────────┐
│ Version 1 [Draft]│  ← Gray badge
└──────────────────┘

┌───────────────────┐
│ Version 2 [Review]│  ← Blue badge
└───────────────────┘

┌──────────────────────┐
│ Version 3 [Approved] │  ← Green badge
└──────────────────────┘

┌──────────────────────┐
│ Version 4 [Archived] │  ← Orange badge
└──────────────────────┘
```

---

## 📋 Breadcrumb Examples

### **Scenario 1: Tenant Admin Creating Proposal**

```
🏢 Acme Corporation → 🏢 Sales Department → 📄 DEAL-2025-001
└─ Tenant Name     └─ Organization Name  └─ Deal Identifier
```

### **Scenario 2: Org Admin (No Tenant)**

```
🏢 West Coast Division → 📄 ENT-Q4-2025
└─ Organization Name  └─ Deal Identifier
```

### **Scenario 3: Just Started (No Deal ID Yet)**

```
🏢 Tech Solutions → 🏢 Product Team
└─ Tenant         └─ Organization
```

---

## 🔄 Complete User Flow Visualization

### **Step 1: Initial State**

```
Admin → Agent Tab

┌────────────────────────────────────────┐
│ Proposal Builder                        │
│ (No breadcrumb yet - no Deal ID)       │
├────────────────────────────────────────┤
│                                         │
│ Deal ID:    [________________]          │
│ Customer:   [________________]          │
│ Org:        [Select Organization ▼]    │
│                                         │
│         [Run Proposal Agent]            │
└────────────────────────────────────────┘
```

### **Step 2: After Entering Deal ID**

```
┌────────────────────────────────────────────────────────┐
│ 🏢 Tech Corp → 🏢 West Division → 📄 DEAL-2025-001   │
│                                                         │
│ Proposal Builder             📄 Version 1   [Draft]    │
│ AI-powered proposals         [▼ Switch] [+ New Version]│
├────────────────────────────────────────────────────────┤
│                                                         │
│ Deal ID:    [DEAL-2025-001]                            │
│ Customer:   [https://acme.com]                         │
│ Org:        [West Division ▼]                          │
│                                                         │
│         [Run Proposal Agent]                            │
└────────────────────────────────────────────────────────┘
```

### **Step 3: After Running Agent**

```
┌────────────────────────────────────────────────────────┐
│ 🏢 Tech Corp → 🏢 West Division → 📄 DEAL-2025-001   │
│                                                         │
│ Proposal Builder             📄 Version 1   [Draft]    │
│ AI-powered proposals         [▼ Switch] [+ New Version]│
├────────────────────────────────────────────────────────┤
│ Configuration        │ Status Log                      │
│                      │                                 │
│ Deal ID: ...         │ ✅ Website fetched             │
│                      │ ✅ Fathom analyzed             │
│                      │ ✅ ValueDock created           │
│ [Run Again]          │ ✅ Gamma generated             │
│                      │                                 │
│ ✅ Complete!         │ 🎨 Gamma Link: [Open]          │
└──────────────────────┴─────────────────────────────────┘
```

### **Step 4: Creating New Version**

```
User clicks [+ New Version]
         ↓
┌────────────────────────────────────────────────────────┐
│ 🏢 Tech Corp → 🏢 West Division → 📄 DEAL-2025-001   │
│                                                         │
│ Proposal Builder             📄 Version 2   [Draft]    │
│ AI-powered proposals         [▼ Switch] [+ New Version]│
├────────────────────────────────────────────────────────┤
│ Configuration        │ Status Log                      │
│                      │                                 │
│ (Form cloned from V1)│ (Logs cleared - ready for new  │
│ Customer: acme.com   │  run)                          │
│ Fathom: 30 days      │                                 │
│                      │ Click Run to generate new      │
│ [Run Proposal Agent] │ proposal with V2               │
└──────────────────────┴─────────────────────────────────┘
```

### **Step 5: Switching Versions**

```
User clicks [▼ Switch Version] → Selects Version 1
         ↓
┌────────────────────────────────────────────────────────┐
│ 🏢 Tech Corp → 🏢 West Division → 📄 DEAL-2025-001   │
│                                                         │
│ Proposal Builder             📄 Version 1   [Draft]    │
│ AI-powered proposals         [▼ Switch] [+ New Version]│
├────────────────────────────────────────────────────────┤
│ Configuration        │ Status Log (Historical)         │
│                      │                                 │
│ (V1 form restored)   │ ✅ Website fetched (Oct 14)    │
│ Customer: acme.com   │ ✅ Fathom analyzed (Oct 14)    │
│ Fathom: 30 days      │ ✅ ValueDock created (Oct 14)  │
│                      │ ✅ Gamma generated (Oct 14)    │
│ [Run Again]          │                                 │
│                      │ 🎨 V1 Gamma Link: [Open]       │
└──────────────────────┴─────────────────────────────────┘
```

---

## 🎯 Version Comparison View

### **Side-by-Side Visualization:**

```
┌─────────────────────────────┬─────────────────────────────┐
│ Version 1 [Approved]        │ Version 2 [Draft]           │
├─────────────────────────────┼─────────────────────────────┤
│ Created: Oct 14, 2025       │ Created: Oct 15, 2025       │
│ By: John Smith              │ By: Jane Doe                │
│                             │                             │
│ Customer: acme.com          │ Customer: acme.com          │
│ Fathom: 30 days             │ Fathom: 60 days ← Changed  │
│                             │                             │
│ Results:                    │ Results:                    │
│ ✅ Gamma Link A             │ ✅ Gamma Link B             │
│ ✅ ValueDock ID: vd-123     │ ✅ ValueDock ID: vd-456     │
└─────────────────────────────┴─────────────────────────────┘
```

---

## 📱 Mobile Layout

### **Stacked View:**

```
┌───────────────────────────┐
│   Proposal Builder        │
├───────────────────────────┤
│ 🏢 Tech → West → DEAL-001│
│                           │
│ 📄 Version 3    [Draft]   │
│ [▼ Switch] [+ New]       │
├───────────────────────────┤
│ ℹ️ Proposal Agent: Auto..│
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
│ [30 days ▼]              │
│                           │
│ [Run Proposal Agent]      │
├───────────────────────────┤
│ Status Log                │
│                           │
│ ✅ Website                │
│ ✅ Fathom                 │
│ ✅ ValueDock              │
│ ✅ Gamma                  │
└───────────────────────────┘
```

---

## 🎨 Interactive Elements

### **Version Badge (Current)**

```
Inactive:
┌─────────────────────────┐
│ 📄 Version 3  [Draft]   │
└─────────────────────────┘

Hover:
┌─────────────────────────┐
│ 📄 Version 3  [Draft]   │  ← Slight highlight
└─────────────────────────┘
```

### **Switch Version Button**

```
Default:
┌──────────────────┐
│ ▼ Switch Version │
└──────────────────┘

Hover:
┌──────────────────┐
│ ▼ Switch Version │  ← Background change
└──────────────────┘

Clicked:
┌──────────────────┐
│ ▼ Switch Version │  ← Dropdown appears below
└──────────────────┘
        ↓
    [Dropdown]
```

### **New Version Button**

```
Default:
┌───────────────┐
│ + New Version │
└───────────────┘

Disabled (Creating):
┌───────────────┐
│ ⏳ Creating...│  ← Spinner animation
└───────────────┘

After Creation:
┌───────────────┐
│ + New Version │  ← Returns to normal
└───────────────┘
Version number incremented in badge ↑
```

---

## 🔍 Zoom In: Version Dropdown Item

### **Standard Item:**

```
┌──────────────────────────────────┐
│ Version 2           [Review]     │  ← Version # and Status badge
│ 📅 Oct 15, 2025 10:15 AM         │  ← Creation timestamp
│ 👤 Jane Doe                      │  ← Creator name
└──────────────────────────────────┘
```

### **Current Item (Selected):**

```
┌──────────────────────────────────┐
│ Version 3 ✓         [Draft]      │  ← Checkmark indicates current
│ 📅 Oct 16, 2025 2:30 PM          │  ← (Background slightly darker)
│ 👤 John Smith                    │
└──────────────────────────────────┘
```

### **Hover State:**

```
┌──────────────────────────────────┐
│ Version 2           [Review]     │  ← Background highlight
│ 📅 Oct 15, 2025 10:15 AM         │  ← Cursor: pointer
│ 👤 Jane Doe                      │
└──────────────────────────────────┘
```

---

## 🌈 Color Coding Reference

### **Status Badge Colors:**

```
Draft:
[Draft]     ← bg-gray-100 text-gray-700
            ← Dark mode: bg-gray-800 text-gray-300

Review:
[Review]    ← bg-blue-100 text-blue-700
            ← Dark mode: bg-blue-900 text-blue-300

Approved:
[Approved]  ← bg-green-100 text-green-700
            ← Dark mode: bg-green-900 text-green-300

Archived:
[Archived]  ← bg-orange-100 text-orange-700
            ← Dark mode: bg-orange-900 text-orange-300
```

---

## 🎯 Quick Actions Guide

### **Action 1: View Version History**

```
Click: [▼ Switch Version]
  ↓
See all versions with metadata
  ↓
Click any version to load it
```

### **Action 2: Create Alternative Proposal**

```
Currently on: Version 2
  ↓
Click: [+ New Version]
  ↓
Version 3 created (clones V2 data)
  ↓
Modify and run with new parameters
```

### **Action 3: Compare Two Versions**

```
Note current version results
  ↓
Click: [▼ Switch Version]
  ↓
Select different version
  ↓
Compare results side-by-side
```

---

## 📊 Visual Status Indicators

### **In Progress:**

```
🔄 Agent Running...

Status Log:
🌐 Website      [🔄 Running...]
🎤 Fathom       [⏰ Pending]
📄 ValueDock    [⏰ Pending]
🎨 Gamma        [⏰ Pending]
```

### **Success:**

```
✅ Generation Complete!

Status Log:
🌐 Website      [✅ Success]
🎤 Fathom       [✅ Success]
📄 ValueDock    [✅ Success]
🎨 Gamma        [✅ Success]

Results:
🎨 Gamma Presentation: [Open]
```

### **Error:**

```
❌ Agent Failed

Status Log:
🌐 Website      [✅ Success]
🎤 Fathom       [❌ Error]
📄 ValueDock    [⏰ Pending]
🎨 Gamma        [⏰ Pending]

Error: Failed to retrieve Fathom data
```

---

## 🎨 Dark Mode Comparison

### **Light Mode:**

```
┌────────────────────────────────────┐
│ 📄 Version 3    [Draft]            │  ← White background
│              Gray badge             │  ← Light gray
└────────────────────────────────────┘
```

### **Dark Mode:**

```
┌────────────────────────────────────┐
│ 📄 Version 3    [Draft]            │  ← Dark background
│              Dark gray badge        │  ← Darker gray
└────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

### **What's Visible:**
✅ Current version number and status  
✅ Complete version history  
✅ Contextual breadcrumb (Tenant → Org → Deal)  
✅ Creator and timestamp for each version  
✅ Quick access to create new versions  

### **What's Clickable:**
✅ Version dropdown - switch versions  
✅ + New Version button - create version  
✅ Individual versions in dropdown  
✅ Breadcrumb items (future: could link to org/tenant views)  

### **What Updates Automatically:**
✅ Breadcrumb when org/deal changes  
✅ Version list when new version created  
✅ Current version badge when switching  
✅ Form/logs/results when version loads  

---

**This visual guide shows exactly what users will see and interact with when using the Proposal Version Switcher feature!** 🚀
