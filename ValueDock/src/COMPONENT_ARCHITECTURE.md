# Component Architecture - Visual Guide

## 🏗️ Application Structure

```
App.tsx (Root Container)
├── responsive-container
│   ├── Header Section
│   │   ├── Logo + Title
│   │   ├── User Welcome Message
│   │   └── Action Menu (Dropdown)
│   │       ├── Save Snapshot
│   │       ├── Restore Snapshot
│   │       ├── Admin Dashboard (if admin)
│   │       ├── Create Presentation
│   │       └── Sign Out
│   │
│   └── Main Tabs Container
│       ├── TabsList (6 tabs, responsive grid)
│       │   ├── Inputs Tab
│       │   ├── Implementation Tab
│       │   ├── Impact & ROI Tab
│       │   ├── Timeline Tab
│       │   ├── Scenarios Tab
│       │   └── Export Tab
│       │
│       └── TabsContent (7 screens)
│           ├── InputsScreenTable
│           ├── ImplementationScreen
│           ├── ResultsScreen (Impact & ROI)
│           ├── TimelineScreen
│           ├── ScenarioScreen
│           ├── ExportScreen
│           └── PresentationScreen (hidden, accessed via menu)
```

---

## 📱 Screen Layouts

### 1. InputsScreenTable
```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Add Process Button                 │
├─────────────────────────────────────────────────────┤
│  Info Alert: Instructions                           │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ Process Groups (Collapsible)                  │  │
│  │  ├── Process 1 Row (inline editing)           │  │
│  │  │   [Name] [Volume] [Time] [Cost] [Actions] │  │
│  │  ├── Process 2 Row                            │  │
│  │  └── Process 3 Row                            │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Summary Cards (3-column grid)                      │
│   ├── Total Processes                               │
│   ├── Monthly Volume                                │
│   └── Total Labor Cost                              │
└─────────────────────────────────────────────────────┘

Layout Classes:
- Container: "space-y-6"
- Process table: "overflow-x-auto" (mobile scroll)
- Summary grid: "grid grid-cols-1 md:grid-cols-3 gap-4"
```

### 2. ImplementationScreen
```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Description                        │
├─────────────────────────────────────────────────────┤
│  Summary Cards (2-column grid)                      │
│   ├── Total Upfront Costs                           │
│   └── Monthly Software Costs                        │
├─────────────────────────────────────────────────────┤
│  Process Implementation Cards (stack vertically)    │
│  ┌─────────────────────────────────────────────┐   │
│  │ Process 1: Invoice Processing               │   │
│  │  ├── Software Cost                          │   │
│  │  ├── Automation Coverage                    │   │
│  │  ├── Upfront Costs                          │   │
│  │  ├── Training Costs                         │   │
│  │  └── Timeline (weeks)                       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Process 2: Order Processing                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

Layout Classes:
- Container: "space-y-8"
- Summary grid: "grid grid-cols-1 md:grid-cols-2 gap-4"
- Process cards: "space-y-6"
```

### 3. ResultsScreen (Impact & ROI)
```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Export Button                      │
├─────────────────────────────────────────────────────┤
│  Nested Tabs (6 tabs)                               │
│  ├─────────────────────────────────────────────┐   │
│  │ Executive Tab                               │   │
│  │  ├── Metric Cards (4-col responsive grid)  │   │
│  │  │   ├── ROI %                             │   │
│  │  │   ├── Annual Savings                    │   │
│  │  │   ├── Payback Period                    │   │
│  │  │   └── Monthly Savings                   │   │
│  │  ├── ROI Breakdown Chart                   │   │
│  │  └── Summary Text                          │   │
│  └─────────────────────────────────────────────┘   │
│  ├─────────────────────────────────────────────┐   │
│  │ Cash Flow Tab                               │   │
│  │  ├── Line Chart (responsive)               │   │
│  │  └── Breakeven Point Card                  │   │
│  └─────────────────────────────────────────────┘   │
│  ├── Internal Costs Tab (charts + reports)         │
│  ├── Sensitivity Analysis Tab (charts)             │
│  ├── FTE Impact Tab (charts + table)               │
│  └── Detailed Tab (comprehensive tables)           │
└─────────────────────────────────────────────────────┘

Layout Classes:
- Container: "space-y-6 max-w-7xl mx-auto"
- Metric grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
- Charts: "w-full h-auto" (responsive)
```

### 4. TimelineScreen
```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Description                        │
├─────────────────────────────────────────────────────┤
│  Timeline Visualization (horizontal scroll)         │
│  ├── Week 1-4: Process 1                            │
│  ├── Week 5-8: Process 2                            │
│  └── Week 9-12: Process 3                           │
├─────────────────────────────────────────────────────┤
│  Process Details Table                              │
│  └── [Name] [Duration] [Dependencies] [Status]     │
└─────────────────────────────────────────────────────┘

Layout Classes:
- Container: "space-y-6"
- Timeline: "overflow-x-auto"
- Table: "w-full"
```

### 5. PresentationScreen ⭐ (AI-Ready)
```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Description                        │
├─────────────────────────────────────────────────────┤
│  Main Tabs (6 tabs)                                 │
│  ├─────────────────────────────────────────────┐   │
│  │ Executive Summary Tab                       │   │
│  │  ├── Company Website Input                  │   │
│  │  │   [URL field]                           │   │
│  │  ├── Business Description                   │   │
│  │  │   [AI Toggle] [Generate Button]         │   │
│  │  │   [Textarea with content]               │   │
│  │  ├── Meeting History                        │   │
│  │  │   [Textarea]                            │   │
│  │  ├── Meeting Notes (for AI)                │   │
│  │  │   [Large textarea - AI analyzes this]  │   │
│  │  ├── Business Goals                         │   │
│  │  │   [Add Goal Button]                     │   │
│  │  │   ├── Goal 1 [Edit outcomes]           │   │
│  │  │   └── Goal 2                            │   │
│  │  ├── Business Challenges                    │   │
│  │  │   [Add Challenge] [AI Draft from Notes] │   │
│  │  │   ├── Challenge 1 [Edit outcomes]      │   │
│  │  │   └── Challenge 2                       │   │
│  │  └── Solution Summary                       │   │
│  │      [Textarea]                            │   │
│  └─────────────────────────────────────────────┘   │
│  ├─────────────────────────────────────────────┐   │
│  │ Solution & Implementation Tab               │   │
│  │  ├── Process Selection (checkboxes)        │   │
│  │  ├── Starting Phase Selector                │   │
│  │  ├── Timeline Description                   │   │
│  │  │   [AI Toggle] [Generate Button]         │   │
│  │  ├── Customer Requirements                  │   │
│  │  └── Benefits & Alignment                   │   │
│  │      [AI Suggest Button]                   │   │
│  └─────────────────────────────────────────────┘   │
│  ├── About DockeryAI Tab                           │
│  ├── Costs & Benefits Tab                          │
│  ├── Statement of Work Tab                         │
│  │   [AI Toggle] [Draft SOW Button]               │
│  └─────────────────────────────────────────────┐   │
│      │ Preview Tab ⭐                          │   │
│      │  ├── Generate with AI (master button) │   │
│      │  ├── Executive Summary Preview         │   │
│      │  ├── Solution Preview                  │   │
│      │  ├── ROI Metrics Preview               │   │
│      │  └── Data Completeness Checklist       │   │
│      │      ├── ✓ Company Info                │   │
│      │      ├── ⚠ Goals/Challenges            │   │
│      │      └── ✓ Process Selection           │   │
│      └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Export Section (sticky bottom)                     │
│  ├── Section Selector (checkboxes)                 │
│  └── Export Buttons (PowerPoint, PDF, Slides)      │
└─────────────────────────────────────────────────────┘

Layout Classes:
- Container: "space-y-6"
- Form sections: "space-y-4"
- AI buttons: "flex items-center gap-2"
- Preview metrics: "grid grid-cols-3 gap-4"
```

---

## 🎨 Responsive Patterns

### Desktop (1024px+)
```
┌────────────────────────────────────────────────────┐
│ [Logo] ValueDock®     Welcome User      [Menu]    │
├────────────────────────────────────────────────────┤
│ [📊 Inputs] [🔧 Implementation] [📈 Impact & ROI] │
│ [📅 Timeline] [🎯 Scenarios] [📤 Export]          │
├────────────────────────────────────────────────────┤
│                                                    │
│  Screen Content (max-w-7xl centered)              │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Card 1  │ │  Card 2  │ │  Card 3  │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌─────────────────────────────────────┐
│ [Logo] ValueDock®   [Menu]          │
├─────────────────────────────────────┤
│ [📊 Inputs] [🔧 Impl] [📈 ROI]     │
│ [📅 Time] [🎯 Scen] [📤 Export]    │
├─────────────────────────────────────┤
│                                     │
│  Screen Content (full width)       │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Card 1    │ │   Card 2    │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐                   │
│  │   Card 3    │                   │
│  └─────────────┘                   │
│                                     │
└─────────────────────────────────────┘
```

### Mobile (375px)
```
┌──────────────────────────┐
│ [Logo] ValueDock® [Menu] │
├──────────────────────────┤
│ [📊][🔧][📈][📅][🎯][📤]│
│  Icons only, scrollable  │
├──────────────────────────┤
│                          │
│  Screen Content          │
│  (full width)            │
│                          │
│  ┌──────────────────┐    │
│  │     Card 1       │    │
│  └──────────────────┘    │
│  ┌──────────────────┐    │
│  │     Card 2       │    │
│  └──────────────────┘    │
│  ┌──────────────────┐    │
│  │     Card 3       │    │
│  └──────────────────┘    │
│                          │
└──────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌──────────────┐
│  User Input  │
│  (Forms)     │
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│   InputData      │ ← Single source of truth
│   State Object   │
└──────┬───────────┘
       │
       ├─────────────→ ┌─────────────────┐
       │               │ calculateROI()  │
       │               │ (utils)         │
       │               └────────┬────────┘
       │                        │
       ↓                        ↓
┌──────────────────┐    ┌──────────────────┐
│  Screen Renders  │    │  ROIResults      │
│  (Components)    │    │  Object          │
└──────────────────┘    └────────┬─────────┘
       │                         │
       │                         │
       └─────────────────────────┴──→ ┌──────────────────┐
                                      │  ResultsScreen   │
                                      │  Charts/Metrics  │
                                      └──────────────────┘
                                              │
                                              ↓
                                      ┌──────────────────┐
                                      │ Export/Present   │
                                      └──────────────────┘
```

---

## 🧩 Component Reusability

### Atomic Components (shadcn/ui)
```
Button ──┬──→ Used in: All screens
         ├──→ Variants: default, outline, ghost, destructive
         └──→ Sizes: sm, default, lg

Card ────┬──→ Used in: All screens
         ├──→ CardHeader (title section)
         └──→ CardContent (body)

Input ───┬──→ Used in: Inputs, Implementation, Presentation
         ├──→ Types: text, number, email
         └──→ Auto-select on focus (numbers)

Badge ───┬──→ Used in: Results, Presentation
         └──→ Status indicators, metrics

Tabs ────┬──→ Used in: Results (nested), Presentation
         └──→ Responsive grid layout
```

### Composite Components
```
MetricCard ──→ Results screen
├── Icon + Value + Title
└── Optional trend badge

TableHeader ──→ Inputs screen
├── Label + Tooltip
└── Sticky positioning

NumberInput ──→ Multiple screens
├── Prefix/suffix support
└── Auto-select behavior

ProcessEditor ──→ Implementation screen
├── Multiple input fields
└── Collapsible sections
```

---

## 🎯 Component Hierarchy Best Practices

### ✅ Good Pattern (Current Implementation)
```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h2>Title</h2>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button>Action</Button>
  </div>

  {/* Content */}
  <Card>
    <CardHeader>
      <CardTitle>Section</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => <Item key={item.id} {...item} />)}
      </div>
    </CardContent>
  </Card>
</div>
```

### ❌ Anti-Pattern (Avoided)
```tsx
<div style={{ width: '1200px', margin: '0 auto' }}>
  <div style={{ display: 'flex', gap: '20px' }}>
    <div style={{ width: '300px' }}>Fixed width</div>
    <div style={{ width: '900px' }}>Fixed width</div>
  </div>
</div>
```

---

## 📦 Import Structure

```typescript
// Standard import order:
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Icon1, Icon2 } from 'lucide-react';
import { CustomComponent } from './CustomComponent';
import { utility } from './utils/utility';

// Component definition
export function ComponentName({ props }: Props) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = () => {};
  
  // Render
  return (
    <div className="auto-layout-classes">
      {/* JSX */}
    </div>
  );
}
```

---

## 🚀 Builder.io Integration Points

### Easy to Edit in Visual Editor
- ✅ All text content (headings, descriptions)
- ✅ Colors via CSS variables
- ✅ Spacing via Tailwind classes
- ✅ Button text and icons
- ✅ Card layouts and grids

### Requires Code Changes
- ⚠️ Calculation formulas
- ⚠️ State management logic
- ⚠️ API integration
- ⚠️ Custom validation rules

### Protected (Don't Edit)
- 🔒 `/utils/auth.ts` - Authentication logic
- 🔒 `/utils/supabase/*` - Backend integration
- 🔒 `/components/utils/calculations.ts` - ROI engine

---

## ✅ Architecture Verification

### Checklist for Each Screen:
- [x] Uses responsive container (`max-w-7xl mx-auto`)
- [x] Uses flexbox or grid for layout
- [x] No fixed widths (except functional inputs)
- [x] Consistent spacing (`space-y-*`, `gap-*`)
- [x] Responsive breakpoints (sm:, md:, lg:)
- [x] Semantic HTML structure
- [x] Accessible forms (labels, ARIA)
- [x] Loading/error states
- [x] Mobile-friendly (touch targets 44px+)

---

## 🎉 Summary

**This architecture provides:**
1. **Flexibility** - Easy to customize in visual editors
2. **Consistency** - Patterns repeated across screens
3. **Responsiveness** - Works on all devices
4. **Maintainability** - Clear structure and documentation
5. **Scalability** - Easy to add new screens/features

**Perfect for:**
- ✅ Loveable import and customization
- ✅ Builder.io visual editing
- ✅ Team collaboration
- ✅ Future enhancements
- ✅ Production deployment

All components follow the same patterns, making it easy to understand and extend the application!
