# Hard Costs Only Tooltip - Dynamic Update

## Overview

Updated the "Hard Costs Only" toggle tooltip to dynamically reflect what cost categories are actually configured as hard vs soft in the Admin → Costs section.

## What Changed

### Before:
The tooltip showed a **static list** of hard costs based on what the calculations found in the data, regardless of what the admin configured:

```
Hard Costs for This Configuration:
• Direct labor cost savings
• Error reduction savings
• Overtime elimination
• Software licensing savings
• ...

Toggle ON to filter out soft costs like revenue uplift...
```

**Problem:** The tooltip didn't match what the admin configured in the Costs tab. If you set everything to soft, the tooltip would still show hard costs based on detected values.

### After:
The tooltip now shows the **actual cost classification** from Admin → Costs:

```
Hard Cost Categories:
• Labor Costs
• Software Licensing
• Infrastructure

3 of 16 cost categories classified as "hard" in Admin → Costs

Toggle ON to show only hard cost savings. All soft costs will be excluded.
```

**Benefit:** The tooltip accurately reflects your admin configuration and shows exactly what will be counted when you toggle "Hard Costs Only" ON.

## Technical Implementation

### File: `/components/ResultsScreen.tsx`

**Lines 256-285:** Updated `hardCostsList` calculation

```typescript
// OLD (Detection-based):
const hardCostsList = useMemo(() => {
  const costs: string[] = [];
  
  if (displayResults.totalHardSavings > 0) {
    costs.push('Direct labor cost savings');
  }
  
  const hasErrorReduction = displayResults.processResults.some(...);
  if (hasErrorReduction) {
    costs.push('Error reduction savings');
  }
  
  // ... more detection logic
  return costs;
}, [displayResults]);

// NEW (Configuration-based):
const hardCostsList = useMemo(() => {
  const costLabels: Record<string, string> = {
    laborCosts: 'Labor Costs',
    trainingOnboardingCosts: 'Training & Onboarding',
    shadowSystemsCosts: 'Shadow Systems',
    turnoverCosts: 'Turnover/Attrition',
    errorRemediationCosts: 'Error Remediation',
    downtimeCosts: 'Downtime',
    decisionDelays: 'Decision Delays',
    staffCapacityDrag: 'Staff Capacity Drag',
    customerImpactCosts: 'Customer Impact',
    overtimePremiums: 'Overtime Premiums',
    softwareLicensing: 'Software Licensing',
    infrastructureCosts: 'Infrastructure',
    itSupportMaintenance: 'IT Support & Maintenance',
    apiLicensing: 'API Licensing',
    auditComplianceCosts: 'Audit & Compliance',
    slaPenalties: 'SLA Penalties'
  };
  
  // Use actual cost classification from admin
  if (costClassification?.hardCosts && Array.isArray(costClassification.hardCosts)) {
    return costClassification.hardCosts
      .map((costKey: string) => costLabels[costKey])
      .filter(Boolean);
  }
  
  // Fallback to default
  return ['Software Licensing', 'Infrastructure'];
}, [costClassification]);
```

**Lines 568-598:** Updated tooltip content

```typescript
<TooltipContent side="bottom" className="max-w-xs">
  <div className="space-y-2">
    <p className="font-semibold">Hard Cost Categories:</p>
    {hardCostsList.length > 0 ? (
      <>
        <ul className="text-xs space-y-1 list-disc pl-4">
          {hardCostsList.map((cost, index) => (
            <li key={index}>{cost}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground pt-2 border-t">
          {hardCostsList.length} of 16 cost categories classified as "hard" in Admin → Costs
        </p>
      </>
    ) : (
      <p className="text-xs text-muted-foreground">
        No hard costs configured in Admin → Costs. All categories are soft costs.
      </p>
    )}
    <p className="text-xs text-muted-foreground pt-1 border-t">
      Toggle ON to show only hard cost savings. All soft costs will be excluded from calculations.
    </p>
  </div>
</TooltipContent>
```

## Visual Examples

### Scenario 1: Only Labor Costs as Hard

**Admin → Costs Configuration:**
```
Hard Costs:
✓ Labor Costs

Soft Costs:
✓ Training & Onboarding
✓ Shadow Systems
✓ Turnover/Attrition
✓ Error Remediation
... (all others)
```

**Tooltip Display:**
```
┌─────────────────────────────────────┐
│ Hard Cost Categories:               │
│                                     │
│ • Labor Costs                       │
│                                     │
│ 1 of 16 cost categories            │
│ classified as "hard" in             │
│ Admin → Costs                       │
│ ─────────────────────────────       │
│ Toggle ON to show only hard cost   │
│ savings. All soft costs will be    │
│ excluded from calculations.        │
└─────────────────────────────────────┘
```

### Scenario 2: Everything Set to Soft

**Admin → Costs Configuration:**
```
Hard Costs:
(empty)

Soft Costs:
✓ Labor Costs
✓ Training & Onboarding
✓ Shadow Systems
... (all 16 categories)
```

**Tooltip Display:**
```
┌─────────────────────────────────────┐
│ Hard Cost Categories:               │
│                                     │
│ No hard costs configured in         │
│ Admin → Costs. All categories are  │
│ soft costs.                         │
│ ─────────────────────────────       │
│ Toggle ON to show only hard cost   │
│ savings. All soft costs will be    │
│ excluded from calculations.        │
└─────────────────────────────────────┘
```

### Scenario 3: Multiple Hard Costs

**Admin → Costs Configuration:**
```
Hard Costs:
✓ Labor Costs
✓ Software Licensing
✓ Infrastructure
✓ Error Remediation

Soft Costs:
✓ Training & Onboarding
✓ Shadow Systems
... (all others)
```

**Tooltip Display:**
```
┌─────────────────────────────────────┐
│ Hard Cost Categories:               │
│                                     │
│ • Labor Costs                       │
│ • Software Licensing                │
│ • Infrastructure                    │
│ • Error Remediation                 │
│                                     │
│ 4 of 16 cost categories            │
│ classified as "hard" in             │
│ Admin → Costs                       │
│ ─────────────────────────────       │
│ Toggle ON to show only hard cost   │
│ savings. All soft costs will be    │
│ excluded from calculations.        │
└─────────────────────────────────────┘
```

## Cost Category Mapping

The following internal keys are mapped to user-friendly labels:

| Internal Key | Display Label |
|-------------|---------------|
| `laborCosts` | Labor Costs |
| `trainingOnboardingCosts` | Training & Onboarding |
| `shadowSystemsCosts` | Shadow Systems |
| `turnoverCosts` | Turnover/Attrition |
| `errorRemediationCosts` | Error Remediation |
| `downtimeCosts` | Downtime |
| `decisionDelays` | Decision Delays |
| `staffCapacityDrag` | Staff Capacity Drag |
| `customerImpactCosts` | Customer Impact |
| `overtimePremiums` | Overtime Premiums |
| `softwareLicensing` | Software Licensing |
| `infrastructureCosts` | Infrastructure |
| `itSupportMaintenance` | IT Support & Maintenance |
| `apiLicensing` | API Licensing |
| `auditComplianceCosts` | Audit & Compliance |
| `slaPenalties` | SLA Penalties |

## Testing Instructions

### Quick Test (2 minutes):

1. **Hard refresh:** `Ctrl+Shift+R` or `Cmd+Shift+R`

2. **Configure costs in admin:**
   - Go to Admin → Costs tab
   - Select Test Organization
   - Move some categories to "Hard Costs" (e.g., Labor Costs, Software Licensing)
   - Click Save

3. **Check the tooltip:**
   - Go to Impact & ROI
   - Hover over the "Hard Costs Only" toggle
   - **Verify:** The tooltip shows exactly the categories you selected as hard

4. **Change configuration:**
   - Go back to Admin → Costs
   - Move all categories to "Soft Costs"
   - Click Save

5. **Check tooltip again:**
   - Go to Impact & ROI
   - Hover over "Hard Costs Only"
   - **Verify:** The tooltip says "No hard costs configured"

6. **Test with multiple hard costs:**
   - Go to Admin → Costs
   - Move 5-6 categories to "Hard Costs"
   - Save

7. **Verify tooltip shows all:**
   - Go to Impact & ROI
   - Hover over toggle
   - **Verify:** All selected categories appear in the list
   - **Verify:** Shows "5 of 16 cost categories classified as 'hard'"

## Data Flow

```
┌──────────────────────────┐
│ Admin → Costs Tab        │
│                          │
│ User drags categories    │
│ to Hard/Soft columns     │
│                          │
│ Clicks Save              │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST /cost-classification│
│                          │
│ Saves to Supabase KV     │
│ organizationId:          │
│   hardCosts: [...]       │
│   softCosts: [...]       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ App.tsx loads data       │
│                          │
│ GET /cost-classification │
│                          │
│ Sets costClassification  │
│ state                    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ ResultsScreen.tsx        │
│                          │
│ Receives costClassification│
│ as prop                  │
│                          │
│ Builds hardCostsList     │
│ from classification.     │
│ hardCosts array          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Tooltip displays list    │
│                          │
│ Shows exact categories   │
│ configured in Admin      │
└──────────────────────────┘
```

## Benefits

### 1. **Transparency**
Users can see exactly what cost categories are classified as hard before toggling the switch.

### 2. **Consistency**
The tooltip matches the admin configuration, reducing confusion about what "hard costs only" means.

### 3. **Guidance**
Shows the count "X of 16 cost categories" so users understand the scope of their configuration.

### 4. **Self-Documenting**
The tooltip includes "in Admin → Costs" to guide users where to change the configuration.

### 5. **Real-Time Updates**
When you change the cost classification in Admin, the tooltip updates immediately (after hard refresh).

## Edge Cases Handled

### 1. **No Hard Costs:**
Shows clear message: "No hard costs configured in Admin → Costs. All categories are soft costs."

### 2. **All Hard Costs:**
Shows all 16 categories with "16 of 16 cost categories classified as 'hard'"

### 3. **Missing Cost Classification:**
Falls back to default: ['Software Licensing', 'Infrastructure']

### 4. **Invalid Cost Keys:**
Filters out any undefined labels using `.filter(Boolean)`

### 5. **Empty Array:**
Handles empty hardCosts array gracefully

## Files Modified

| File | Lines | Description |
|------|-------|-------------|
| `/components/ResultsScreen.tsx` | 256-285 | Updated `hardCostsList` to use cost classification |
| `/components/ResultsScreen.tsx` | 568-598 | Updated tooltip content with dynamic list |
| `/components/utils/calculations.ts` | 447 | Updated rebuild marker |

## Summary

The "Hard Costs Only" toggle tooltip now **dynamically reflects** the cost classification configured in Admin → Costs, making it clear to users exactly which cost categories will be included when they toggle it ON.

**Before:** Static list based on detected values ❌  
**After:** Dynamic list from admin configuration ✅

**Rebuild Marker:** `2025-10-12-00-22`

**Hard refresh required:** `Ctrl+Shift+R` or `Cmd+Shift+R`

## What This Means for Users

When you hover over the "Hard Costs Only" toggle, you'll now see:

1. ✅ **Exact list** of cost categories you configured as "hard" in Admin → Costs
2. ✅ **Count** showing how many of the 16 categories are hard (e.g., "3 of 16")
3. ✅ **Clear message** if no hard costs are configured
4. ✅ **Direct reference** to where to change settings ("in Admin → Costs")
5. ✅ **Updated description** explaining what the toggle does

This makes the system more transparent and user-friendly! 🎉
