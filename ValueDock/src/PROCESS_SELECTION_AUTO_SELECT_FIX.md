# Process Selection Auto-Select Fix

## Issue
In the Impact and ROI section, processes were not being auto-selected by default. Users had to manually select processes to see ROI calculations, which was confusing and inconsistent with expected behavior.

## Root Cause
The `selectedProcessIds` state in `/App.tsx` was initialized as an empty array `[]`, and there was no automatic mechanism to populate it when processes were loaded or changed.

## Solution Implemented
Added a `useEffect` hook that automatically selects all processes whenever the `inputData.processes` array changes:

```tsx
// Auto-select all processes whenever processes change
// This is independent of the process selection in the Inputs screen (which is for deletion only)
useEffect(() => {
  const allProcessIds = inputData.processes.map(p => p.id);
  setSelectedProcessIds(allProcessIds);
}, [inputData.processes]);
```

This ensures that:
1. **All processes are selected by default** in the Impact and ROI section
2. **Auto-selection happens automatically** whenever:
   - Organization data is loaded from the backend
   - Processes are added or removed
   - User switches between organizations
   - Data is reset or cleared

## Key Points

### Independence from Inputs Screen
The process selection in the **Impact and ROI** section (`selectedProcessIds` in App.tsx) is completely independent from the process selection in the **Inputs** section (`selectedProcessIds` in InputsScreenTable.tsx).

- **Inputs Screen**: Selection is used for **deletion only** - users can select multiple processes to delete them
- **Impact & ROI Screen**: Selection determines **which processes are included in ROI calculations and reporting**

### Default Behavior
- **Every organization** starts with all processes selected by default
- **Every new process** is automatically included in calculations
- Users can still manually deselect processes if they want to see ROI for a subset

## Files Modified
- `/App.tsx` - Added useEffect to auto-select all processes and updated comments

## Testing Checklist
- [x] All processes auto-selected when app loads
- [x] All processes auto-selected when switching organizations
- [x] New processes automatically included in calculations
- [x] Manual process filtering still works (users can deselect if needed)
- [x] Inputs screen selection remains independent (for deletion only)
- [x] ROI calculations reflect all processes by default

## Implementation Date
October 10, 2025
