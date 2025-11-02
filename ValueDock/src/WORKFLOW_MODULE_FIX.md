# Workflow Module Build Error Fix

## Problem
Build error occurred because `WorkflowBuilder.tsx` was trying to import `WorkflowBuilder` from `WorkflowEditor.tsx`, but that file exports `WorkflowEditor` instead.

```
ERROR: No matching export in "WorkflowEditor.tsx" for import "WorkflowBuilder"
```

## Root Cause
The workflow-module's `WorkflowBuilder.tsx` was attempting to import a non-existent export:
```tsx
import { WorkflowBuilder as CoreWorkflowBuilder } from '../WorkflowEditor';
```

But `WorkflowEditor.tsx` actually exports:
```tsx
export function WorkflowEditor({ ... }) { ... }
```

## Solution Applied

### 1. Fixed WorkflowBuilder.tsx Import
Changed the import to use the correct export name:
```tsx
// Before:
import { WorkflowBuilder as CoreWorkflowBuilder } from '../WorkflowEditor';

// After:
import { WorkflowEditor } from '../WorkflowEditor';
```

### 2. Added Missing Props
Updated `WorkflowBuilder` component to accept and pass through required props:

```tsx
export interface WorkflowBuilderProps {
  config?: WorkflowModuleConfig;
  onClose?: () => void;           // Added
  processId?: string;             // Added
  processName?: string;           // Added
  organizationId?: string;        // Added
}

export function WorkflowBuilder({ 
  config, 
  onClose,
  processId = "default",
  processName,
  organizationId = "default"
}: WorkflowBuilderProps = {}) {
  // ... storage logic ...
  
  return (
    <WorkflowEditor 
      processId={processId}
      processName={processName || config?.initialWorkflow?.name || "New Workflow"}
      organizationId={organizationId}
      onBack={onClose || (() => {})}
    />
  );
}
```

### 3. Updated StandaloneWorkflow.tsx
Passed `onClose` callback to `WorkflowBuilder`:

```tsx
<WorkflowBuilder 
  config={workflowConfig}
  onClose={onClose}    // Added this line
/>
```

## Files Changed
1. ✅ `/components/workflow-module/WorkflowBuilder.tsx` - Fixed import and added props
2. ✅ `/components/workflow-module/StandaloneWorkflow.tsx` - Passed onClose to WorkflowBuilder

## Verification
- ✅ Import error resolved
- ✅ WorkflowEditor properly wrapped by WorkflowBuilder
- ✅ Close button functionality preserved
- ✅ All props correctly passed through

## How It Works Now

```
User clicks workflow icon
    ↓
StandaloneWorkflow renders
    ↓
WorkflowBuilder (wrapper)
    ↓
WorkflowEditor (original component)
```

The `WorkflowBuilder` now acts as a thin wrapper around the existing `WorkflowEditor`, preparing it for future migration to a fully configurable standalone module.

## Future Enhancement
When ready to make the workflow module fully independent:
1. Copy the full `WorkflowEditor` implementation into `WorkflowBuilder.tsx`
2. Add config-based customization (storage, callbacks, UI options)
3. Remove dependency on `WorkflowEditor.tsx`

For now, the wrapper approach provides:
- ✅ Working integration
- ✅ No breaking changes
- ✅ Easy future migration path
- ✅ Clean separation of concerns
