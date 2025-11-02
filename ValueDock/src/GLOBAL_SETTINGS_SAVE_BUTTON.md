# Global Settings Save Button Implementation

## Problem
Global settings in the Implementation tab were being saved immediately on every keystroke, causing:
- Excessive auto-saves (multiple saves while typing "600")
- No ability to review changes before saving
- Warning dialog not functioning properly

## Solution Implemented
Added a "Save Global Settings" button that:
1. **Only appears when there are unsaved changes** to global settings
2. **Prevents auto-save** - changes are held in pending state until button is clicked
3. **Shows warning dialog** - if any processes have individual settings that differ from the new global values
4. **Visual feedback** - Orange border and background on modified fields, plus "• Unsaved changes" indicator

## Key Changes

### File: `/components/ImplementationScreen.tsx`

#### New State Management
```typescript
const [pendingGlobalSettings, setPendingGlobalSettings] = useState<GlobalDefaults | null>(null);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [warningDialog, setWarningDialog] = useState({...});
```

#### New Functions
- **`updatePendingGlobalSettings()`** - Updates pending state without saving
- **`handleSaveGlobalSettings()`** - Triggered by button click, checks for conflicts
- **`getProcessesWithIndividualSettings()`** - Detects processes with custom settings
- **`applyGlobalSettings()`** - Applies changes with or without overriding individual settings
- **`handleWarningConfirm()`** - Applies to all processes (overrides individual settings)
- **`handleWarningCancel()`** - Applies only to processes using global settings

#### UI Enhancements
1. **Save Button** - Appears in card header when `hasUnsavedChanges === true`
2. **Visual Indicators** - Orange border/background on modified inputs
3. **Status Text** - "• Unsaved changes" message in alert
4. **Warning Dialog** - Integrated `GlobalSettingsWarningDialog` component

## User Workflow

### Before (Problematic)
```
User types "6" → Auto-save → User types "0" → Auto-save → User types "0" → Auto-save
Result: 3 saves for entering "600"
```

### After (Fixed)
```
User types "600" → No save → Click "Save Global Settings" button → 
  → Check for conflicts → Show warning if needed → Single save
Result: 1 save after user confirmation
```

## Warning Dialog Behavior

### When Saving Global Settings:
1. **No Individual Settings** - Applies immediately, no dialog shown
2. **Has Individual Settings** - Shows warning dialog with:
   - List of affected processes
   - Option to "Apply to All" (overrides individual settings)
   - Option to "Keep Individual Settings" (only updates global defaults)

## Visual Design

### Unsaved Changes Indicator
- **Save Button**: Green button with Save icon in card header
- **Input Fields**: Orange border (`border-orange-400`) and light orange background (`bg-orange-50`)
- **Alert Message**: "• Unsaved changes" in orange text

### Example
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Global Implementation Settings   [💾 Save Global Settings] │
├─────────────────────────────────────────────────────────┤
│ ℹ️ These settings will be used as defaults...          │
│    • Unsaved changes                                    │
│                                                         │
│ ┌──────────────┬──────────────┬──────────────┐        │
│ │ Software Cost│ Automation % │ Timeline     │        │
│ │ [🟠  $600  ]│ [🟠   80   ]│ [🟠    3   ]│  ← Orange borders
│ └──────────────┴──────────────┴──────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Testing Scenarios

### ✅ Test 1: Simple Edit and Save
1. Navigate to Implementation tab
2. Modify "Software Cost" field
3. Verify "Save Global Settings" button appears
4. Verify orange border on field
5. Click "Save Global Settings"
6. Verify data saves once
7. Verify button disappears

### ✅ Test 2: Edit with Individual Settings
1. Set process A to have individual implementation costs
2. Navigate to global settings
3. Modify "Software Cost" to different value
4. Click "Save Global Settings"
5. Verify warning dialog shows with process A listed
6. Test both "Apply to All" and "Keep Individual Settings"

### ✅ Test 3: Multiple Edits
1. Edit multiple fields (Software Cost, Training Costs, Upfront Costs)
2. Verify all fields show orange borders
3. Click "Save Global Settings"
4. Verify all changes saved in single operation

### ✅ Test 4: Cancel Changes (External Update)
1. Edit global settings (don't save)
2. Navigate to different tab
3. Return to Implementation tab
4. Verify pending changes are cleared (useEffect dependency on data.globalDefaults)

## Benefits
- ✅ **No more excessive auto-saves** - Single save per user action
- ✅ **User control** - Review changes before committing
- ✅ **Clear feedback** - Visual indicators for unsaved state
- ✅ **Conflict prevention** - Warning dialog for processes with individual settings
- ✅ **Better UX** - Matches expected behavior (edit → review → save)

## Related Components
- `/components/ImplementationScreen.tsx` - Main implementation (modified)
- `/components/GlobalSettingsWarningDialog.tsx` - Warning dialog (used)
- `/components/InputsScreenTable.tsx` - Has similar functionality (for reference)

## Bug Fixes Applied

### DOM Nesting Errors Fixed
- **Issue**: `AlertDialogDescription` component renders a `<p>` tag, but we were nesting `<p>`, `<div>`, and `<ul>` elements inside it
- **Fix**: Replaced `AlertDialogDescription` wrapper with a plain `<div>` to avoid illegal HTML nesting
- **File**: `/components/GlobalSettingsWarningDialog.tsx`

### Ref Forwarding Error Fixed
- **Issue**: `AlertDialogOverlay` component was not using `React.forwardRef`, causing ref errors
- **Fix**: Converted function to use `React.forwardRef` with proper TypeScript types
- **File**: `/components/ui/alert-dialog.tsx`

## Notes
- The `useEffect` hook resets pending changes when `data.globalDefaults` changes from outside
- This prevents stale pending state if data is loaded from server or another source
- The warning dialog only appears if there are actual conflicts (processes with different individual settings)
- All DOM nesting warnings and ref errors have been resolved
