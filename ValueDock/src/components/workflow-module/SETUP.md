# Workflow Module Setup Guide

This guide will help you set up the Workflow Module as a standalone, portable component.

## Quick Start (5 minutes)

### Step 1: Copy the WorkflowBuilder

The workflow module is already set up in your project! It's located at:
```
/components/workflow-module/
```

### Step 2: Basic Usage

The simplest way to use the workflow builder:

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';

function App() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div>
      <button onClick={() => setShowWorkflow(true)}>
        Open Workflow Builder
      </button>

      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

That's it! The workflow builder is now ready to use.

---

## Advanced Configuration (Optional)

### Option 1: Use Existing WorkflowEditor

The module currently wraps your existing `/components/WorkflowEditor.tsx`. This works out of the box with localStorage.

### Option 2: Full Module Migration

If you want to fully migrate to the configurable module system, follow these steps:

#### 1. Update WorkflowBuilder.tsx

Currently, `/components/workflow-module/WorkflowBuilder.tsx` is a simple wrapper. To add full configuration support:

**Copy the WorkflowEditor component:**
```bash
# Backup current wrapper
mv components/workflow-module/WorkflowBuilder.tsx components/workflow-module/WorkflowBuilder.tsx.backup

# Copy WorkflowEditor as base
cp components/WorkflowEditor.tsx components/workflow-module/WorkflowBuilder.tsx
```

#### 2. Update Imports in WorkflowBuilder.tsx

Open `components/workflow-module/WorkflowBuilder.tsx` and make these changes:

**Add these imports at the top:**
```tsx
import type { WorkflowModuleConfig } from './types';
import { LocalWorkflowStorage, SupabaseWorkflowStorage } from './storage';
```

**Remove (if present):**
```tsx
import { projectId, publicAnonKey } from '../utils/supabase/info';
```

#### 3. Add Config Prop

Update the function signature:

**Before:**
```tsx
export function WorkflowBuilder() {
```

**After:**
```tsx
export interface WorkflowBuilderProps {
  config?: WorkflowModuleConfig;
}

export function WorkflowBuilder({ config }: WorkflowBuilderProps = {}) {
```

#### 4. Make Supabase Optional

Add this near the top of the component:

```tsx
const { projectId = '', publicAnonKey = '' } = config?.supabase || {};
const hasSupabase = !!config?.supabase;
```

#### 5. Set Up Storage

Add storage selection logic:

```tsx
const storage = React.useMemo(() => {
  if (config?.storage) {
    return config.storage;
  }
  if (config?.supabase) {
    return new SupabaseWorkflowStorage(
      config.supabase.projectId,
      config.supabase.publicAnonKey
    );
  }
  return LocalWorkflowStorage;
}, [config]);
```

#### 6. Replace localStorage Calls

Find and replace localStorage calls with storage calls:

**Before:**
```tsx
const templates = JSON.parse(localStorage.getItem('workflow-templates') || '[]');
localStorage.setItem('workflow-templates', JSON.stringify(templates));
```

**After:**
```tsx
const templates = await storage.loadTemplates();
await storage.saveTemplate(template);
```

#### 7. Add Callbacks

Add callback invocations after key actions:

**Save Workflow:**
```tsx
const handleSaveWorkflow = async () => {
  const workflow = {
    id: Date.now().toString(),
    name: workflowName,
    savedAt: new Date().toISOString(),
    nodes,
    connections
  };
  
  await storage.saveWorkflow(workflow);
  config?.onWorkflowSave?.(workflow);  // Add this line
  
  setHasUnsavedChanges(false);
};
```

**Deploy Workflow:**
```tsx
const handleDeploy = async () => {
  // ... existing deploy logic ...
  
  config?.onWorkflowDeploy?.({ nodes, connections }, customerId);  // Add this line
};
```

**Create Template:**
```tsx
const handleSaveTemplate = async () => {
  const template = {
    id: Date.now().toString(),
    name: templateName,
    description: templateDescription,
    category: 'Custom',
    nodes,
    connections
  };
  
  await storage.saveTemplate(template);
  config?.onTemplateCreate?.(template);  // Add this line
};
```

#### 8. Make UI Elements Conditional

Wrap UI elements with config checks:

**Deploy Button:**
```tsx
{(config?.ui?.showDeployButton ?? true) && (
  <Button onClick={() => setShowDeployDialog(true)}>
    <Upload className="mr-2 h-4 w-4" />
    Deploy Workflow
  </Button>
)}
```

**Template Buttons:**
```tsx
{(config?.ui?.showTemplateButtons ?? true) && (
  <DropdownMenu>
    {/* Template menu content */}
  </DropdownMenu>
)}
```

**Document Library:**
```tsx
{(config?.documents?.enabled ?? false) && showDocLibrary && (
  <div className="absolute right-6 top-20 z-50 w-96">
    <DocumentLibrary
      onSelectDocument={(doc) => {
        // ... document selection logic ...
      }}
    />
  </div>
)}
```

#### 9. Use Initial Workflow

Update initial state to use config:

**Before:**
```tsx
const [nodes, setNodes] = useState<FlowNode[]>([
  { id: '1', type: 'start', label: 'Start', x: 400, y: 100 }
]);
const [workflowName, setWorkflowName] = useState('New Workflow');
```

**After:**
```tsx
const [nodes, setNodes] = useState<FlowNode[]>(
  config?.initialWorkflow?.nodes || [
    { id: '1', type: 'start', label: 'Start', x: 400, y: 100 }
  ]
);
const [workflowName, setWorkflowName] = useState(
  config?.initialWorkflow?.name || 'New Workflow'
);
```

---

## Testing

After setup, test the module:

### Test 1: Basic Functionality

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

function Test() {
  const [show, setShow] = useState(true);
  
  return show && <StandaloneWorkflow onClose={() => setShow(false)} />;
}
```

### Test 2: With Callbacks

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

function Test() {
  const [show, setShow] = useState(true);
  
  return show && (
    <StandaloneWorkflow
      onClose={() => setShow(false)}
      config={{
        onWorkflowSave: (workflow) => {
          console.log('✅ Workflow saved:', workflow);
        },
        onWorkflowDeploy: (workflow, customerId) => {
          console.log('🚀 Deployed to:', customerId);
        },
      }}
    />
  );
}
```

### Test 3: With Custom Storage

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

function Test() {
  const [show, setShow] = useState(true);
  
  return show && (
    <StandaloneWorkflow
      onClose={() => setShow(false)}
      config={{
        storage: {
          saveWorkflow: async (w) => {
            console.log('Saving to custom backend:', w);
          },
          loadWorkflows: async () => {
            return [];
          },
          saveTemplate: async (t) => {
            console.log('Saving template:', t);
          },
          loadTemplates: async () => {
            return [];
          },
        },
      }}
    />
  );
}
```

---

## Copy to New Project

Once setup is complete, you can copy the entire module to a new project:

```bash
# From your new project directory
mkdir -p components/workflow-module

# Copy the module
cp -r ../valuedock/components/workflow-module/* components/workflow-module/

# Copy required UI components (if not already present)
cp -r ../valuedock/components/ui components/

# Copy WorkflowEditor if using it as base
cp ../valuedock/components/WorkflowEditor.tsx components/
```

Then in your new project:

```tsx
import { StandaloneWorkflow } from './components/workflow-module';

function App() {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShow(true)}>Workflows</button>
      {show && <StandaloneWorkflow onClose={() => setShow(false)} />}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Module not displaying
- Ensure parent container has explicit height
- Check browser console for errors
- Verify all imports are correct

### Issue: Templates not loading
- Check localStorage in browser DevTools
- Verify storage configuration is correct
- Clear localStorage and try again

### Issue: Supabase errors
- Verify projectId and publicAnonKey are correct
- Check that server endpoints exist
- Ensure CORS is configured

### Issue: TypeScript errors
- Run `npm install` to ensure types are up to date
- Check that all type imports are correct
- Verify WorkflowModuleConfig interface matches usage

---

## Summary

The workflow module is **already set up and ready to use** in ValueDock! 

**For basic usage:**
1. Import `StandaloneWorkflow`
2. Add a button to show/hide it
3. Done!

**For advanced configuration:**
1. Follow the optional migration steps above
2. Add custom storage, callbacks, and UI configuration
3. Customize to your needs

See `QUICK_ADD.md` for the fastest way to get started, or `STANDALONE_USAGE.md` for comprehensive examples.
