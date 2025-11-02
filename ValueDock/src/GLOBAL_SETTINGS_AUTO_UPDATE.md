# Global Settings Auto-Update Feature

**Feature**: Automatic process update when global settings change with individual cost detection

---

## Overview

When users modify global default settings in the Inputs Screen, the system now:

1. **Automatically applies** the change to new processes
2. **Detects processes** with individual cost settings that differ from global defaults
3. **Shows a warning dialog** asking if the user wants to apply the change to all processes
4. **Preserves individual settings** if the user chooses not to apply globally

---

## How It Works

### Step 1: User Changes Global Setting

When a user modifies any implementation cost field in the Global Default Settings:
- Average Hourly Wage
- Automation Coverage
- Overtime Multiplier
- Software Cost
- Implementation Timeline
- Upfront Costs
- Training Costs
- Consulting Costs
- Temp Staff Hourly Rate
- Overtime Rate

### Step 2: System Detects Individual Settings

The system checks all processes to find any that:
- Have **"Use Global Settings" toggled OFF** in their Advanced Metrics
- Have individual cost values that **differ from the new global value**

### Step 3: Warning Dialog Appears

If processes with individual settings are detected, a warning dialog shows:

**Dialog Contents:**
```
⚠️ Apply Global Setting to Processes?

You're about to change "Software Cost" in the global settings.

The following 3 processes have individual cost settings that differ from the global defaults:
• Invoice Processing
• Customer Onboarding
• Report Generation

Do you want to apply this change to all processes?

• Yes, apply globally: All processes will use the new global setting value
• No, keep individual settings: Only new processes will use this global value

Tip: You can always adjust individual process settings later in the Advanced Metrics section of each process.

[Keep Individual Settings]  [Apply to All Processes]
```

### Step 4: User Chooses Action

**Option A: "Apply to All Processes"**
- Global default is updated
- ALL processes (including those with individual settings) are updated to use the new value
- All processes continue to have their "Use Global Settings" toggle state preserved

**Option B: "Keep Individual Settings"**
- Global default is updated
- Processes with individual settings keep their current values
- Only new processes will use the new global default

---

## User Scenarios

### Scenario 1: No Individual Settings

**Situation**: All processes use global settings

**Action**: User changes Software Cost from $500 to $750

**Result**:
- ✅ No warning dialog appears
- ✅ Global default updated immediately
- ✅ All processes automatically use $750

### Scenario 2: Some Processes Have Individual Settings

**Situation**: 
- 5 processes total
- 2 processes use global settings
- 3 processes have individual Software Cost values ($600, $800, $1000)

**Action**: User changes global Software Cost from $500 to $750

**Result**:
- ⚠️ Warning dialog appears
- Shows the 3 processes with individual settings
- User chooses:
  - **Apply Globally**: All 5 processes now use $750
  - **Keep Individual**: 2 processes use $750, 3 keep their individual values

### Scenario 3: Individual Settings Match New Global Value

**Situation**:
- Process A uses global ($500)
- Process B has individual setting ($750)

**Action**: User changes global Software Cost from $500 to $750

**Result**:
- ✅ No warning dialog (Process B already has $750)
- ✅ Global default updated immediately
- ✅ Process A now uses $750, Process B continues with $750

---

## Technical Implementation

### Components Created

**1. GlobalSettingsWarningDialog.tsx**

New dialog component that displays:
- Warning icon and title
- List of affected processes
- Explanation of both options
- Two action buttons

**2. Updated InputsScreen.tsx**

Added logic for:
- Detecting processes with individual settings
- Checking if values differ from new global value
- Showing/hiding warning dialog
- Applying changes based on user choice

### Key Functions

```typescript
// Check which processes have individual settings that differ
const getProcessesWithIndividualSettings = (
  field: keyof GlobalDefaults, 
  newValue: any
): string[]

// Apply global default change with optional process updates
const applyGlobalDefaultChange = (
  field: keyof GlobalDefaults, 
  value: any, 
  applyToAll: boolean
)

// Handle warning dialog confirmation
const handleWarningConfirm = () => {
  applyGlobalDefaultChange(field, value, true); // Apply to all
}

// Handle warning dialog cancellation
const handleWarningCancel = () => {
  applyGlobalDefaultChange(field, value, false); // Keep individual
}
```

### Field Mapping

Global defaults map to process implementation costs:

| Global Default Field | Process Field |
|---------------------|---------------|
| softwareCost | implementationCosts.softwareCost |
| automationCoverage | implementationCosts.automationCoverage |
| implementationTimelineMonths | implementationCosts.implementationTimelineMonths |
| upfrontCosts | implementationCosts.upfrontCosts |
| trainingCosts | implementationCosts.trainingCosts |
| consultingCosts | implementationCosts.consultingCosts |

---

## User Guide

### For Users

**Q: When will I see the warning dialog?**  
A: Only when you change a global setting AND there are processes with individual cost settings that differ from the new value.

**Q: What happens if I click "Apply to All Processes"?**  
A: The new global value will be applied to ALL processes, including those that had individual settings.

**Q: What happens if I click "Keep Individual Settings"?**  
A: The global default updates, but processes with individual settings keep their current values. Only new processes will use the new global value.

**Q: Can I change my mind later?**  
A: Yes! You can always go into each process's Advanced Metrics section and:
- Toggle "Use Global Settings" on/off
- Manually adjust individual values

**Q: Which fields trigger this warning?**  
A: All implementation cost fields:
- Software Cost
- Automation Coverage
- Implementation Timeline
- Upfront Costs
- Training Costs
- Consulting Costs

**Q: What if I want to reset all processes to use global settings?**  
A: You can do this in two ways:
1. Change a global setting and click "Apply to All Processes"
2. Manually toggle "Use Global Settings" ON for each process in Advanced Metrics

---

## Best Practices

### When to Use "Apply to All Processes"

✅ **Use when:**
- You want consistent values across all processes
- You're correcting an error in a cost estimate
- You're updating to reflect new pricing
- You're setting up initial values and want uniformity

### When to Use "Keep Individual Settings"

✅ **Use when:**
- Different processes genuinely have different costs
- You've carefully customized specific processes
- You want to maintain existing cost models
- You're only updating the default for new processes

### Recommended Workflow

1. **Start with global defaults** for new projects
2. **Create all processes** first
3. **Customize individual processes** as needed in Advanced Metrics
4. **Update global defaults** when starting new groups of processes
5. **Use warning dialog wisely** based on your specific needs

---

## Examples

### Example 1: Software Cost Update

**Before:**
- Global Software Cost: $500/month
- Process A: Uses global ($500)
- Process B: Individual setting ($800)
- Process C: Uses global ($500)

**Action:** Change global Software Cost to $750

**Warning Dialog Shows:**
```
The following 1 process has individual cost settings:
• Process B
```

**If "Apply to All Processes":**
- Global: $750
- Process A: $750
- Process B: $750 (updated from $800)
- Process C: $750

**If "Keep Individual Settings":**
- Global: $750
- Process A: $750
- Process B: $800 (unchanged)
- Process C: $750

### Example 2: Implementation Timeline Update

**Before:**
- Global Implementation Timeline: 3 months
- Process A: Individual setting (6 months)
- Process B: Individual setting (2 months)
- Process C: Uses global (3 months)

**Action:** Change global Implementation Timeline to 4 months

**Warning Dialog Shows:**
```
The following 2 processes have individual cost settings:
• Process A
• Process B
```

**If "Apply to All Processes":**
- All processes now use 4 months

**If "Keep Individual Settings":**
- Process A: 6 months (unchanged)
- Process B: 2 months (unchanged)
- Process C: 4 months (updated)

---

## Troubleshooting

### Warning Dialog Doesn't Appear

**Possible Reasons:**
1. All processes use global settings (no individual overrides)
2. Individual settings already match the new global value
3. No processes exist yet

**Solution:** This is expected behavior. The dialog only appears when needed.

### Can't Update Individual Process

**Problem:** Individual process values seem locked

**Solution:** 
1. Go to that process's Advanced Metrics
2. Toggle "Use Global Settings" to OFF
3. Now you can edit individual values

### Want to Bulk Reset All Processes

**Problem:** Need to reset many processes to global settings

**Solution:**
1. Note current global values
2. Change global value to something different
3. Click "Apply to All Processes"
4. Change global value back to original
5. Click "Apply to All Processes" again

---

## Data Flow

```
User Changes Global Setting
        ↓
System Checks All Processes
        ↓
Any processes with individual settings?
        ↓
    Yes ─────→ Show Warning Dialog
        ↓              ↓
        No         User Chooses
        ↓              ↓
Update Global ←────────┤
  Default      Apply to All? Keep Individual?
        ↓              ↓              ↓
New Processes    Update All     Update Only Global
  Use New         Processes      & New Processes
   Value
```

---

## Technical Details

### State Management

```typescript
const [warningDialog, setWarningDialog] = useState<{
  open: boolean;
  field: keyof GlobalDefaults | null;
  value: any;
  affectedProcesses: string[];
  settingName: string;
}>({
  open: false,
  field: null,
  value: null,
  affectedProcesses: [],
  settingName: '',
});
```

### Detection Logic

```typescript
const getProcessesWithIndividualSettings = (
  field: keyof GlobalDefaults, 
  newValue: any
): string[] => {
  const processField = globalToProcessFieldMap[field];
  if (!processField) return [];

  return data.processes
    .filter(process => {
      // Only check processes not using global settings
      if (process.implementationCosts.useGlobalSettings) return false;
      
      // Check if individual value differs from new global value
      const currentValue = process.implementationCosts[processField];
      return currentValue !== newValue;
    })
    .map(process => process.name);
};
```

### Apply Logic

```typescript
const applyGlobalDefaultChange = (
  field: keyof GlobalDefaults, 
  value: any, 
  applyToAll: boolean
) => {
  const newData = { 
    ...data, 
    globalDefaults: { ...data.globalDefaults, [field]: value }
  };

  if (applyToAll && globalToProcessFieldMap[field]) {
    const processField = globalToProcessFieldMap[field];
    newData.processes = data.processes.map(process => ({
      ...process,
      implementationCosts: {
        ...process.implementationCosts,
        [processField]: value,
      }
    }));
  }

  onChange(newData);
};
```

---

## Future Enhancements

### Potential Improvements

1. **Batch Mode**
   - Allow updating multiple global settings at once
   - Show combined list of affected processes
   - Single confirmation dialog

2. **Selective Application**
   - Checkboxes to select which processes to update
   - Apply to some but not all affected processes

3. **Undo/Redo**
   - Ability to undo global setting changes
   - History of applied changes

4. **Preview Mode**
   - Show before/after values for affected processes
   - Calculate impact of changes on ROI

5. **Smart Suggestions**
   - Recommend when to apply globally
   - Flag processes that might need updates

---

## Related Features

- **Use Global Settings Toggle** - In Process Advanced Metrics
- **Process Groups** - Group-level default wages
- **Cost Classifications** - Hard vs Soft cost categorization
- **Auto-Save** - Changes are auto-saved every 30 seconds

---

## Summary

The Global Settings Auto-Update feature:

✅ **Prevents accidental overwrites** of carefully set individual costs  
✅ **Gives users control** over how changes propagate  
✅ **Maintains data integrity** across processes  
✅ **Provides clear feedback** about what will change  
✅ **Supports flexible workflows** for different use cases  

**Result**: Users can confidently update global settings knowing they have control over how those changes affect existing processes.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Implemented and Tested
