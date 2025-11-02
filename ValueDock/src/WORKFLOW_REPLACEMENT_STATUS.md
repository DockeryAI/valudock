# Workflow Module Replacement Status

## ❌ Issue Encountered

The full ClientDock WorkflowBuilder.tsx file is **too large** to be written as a single file (over 6000 lines). The system has a file size limit.

## 🔧 Solution Required

You need to copy the ClientDock WorkflowBuilder.tsx file manually:

### Steps:

1. **In ClientDock project**, copy the contents of:
   `/components/workflow/WorkflowBuilder.tsx`

2. **In ValueDock project**, replace the contents of:
   `/components/workflow-module/WorkflowBuilder.tsx`

3. **Make these adjustments in the ValueDock file:**

#### Change 1: Remove the DocumentLibrary import (line ~30)
```tsx
// DELETE THIS LINE:
import { DocumentLibrary, type Document } from '../documents/DocumentLibrary';
```

#### Change 2: Update the projectId/publicAnonKey imports (around line 3)
```tsx
// FROM:
import { projectId as defaultProjectId, publicAnonKey as defaultPublicAnonKey } from '../../utils/supabase/info';

// TO:
import { projectId as defaultProjectId, publicAnonKey as defaultPublicAnonKey } from '../../utils/supabase/info';
import type { WorkflowModuleConfig } from './types';
```

#### Change 3: Update the component props (around line 427)
```tsx
// FROM:
export function WorkflowBuilder() {

// TO:
export interface WorkflowBuilderProps {
  config?: WorkflowModuleConfig;
  onClose?: () => void;
  processId?: string;
  processName?: string;
  organizationId?: string;
}

export function WorkflowBuilder({ 
  config,
  onClose,
  processId = "default",
  processName,
  organizationId = "default"
}: WorkflowBuilderProps = {}) {
```

#### Change 4: Use config values at the start of the component
```tsx
// Add these lines right after the function declaration:
const projectId = config?.supabase?.projectId || defaultProjectId;
const publicAnonKey = config?.supabase?.publicAnonKey || defaultPublicAnonKey;

// Update initial state to use config:
const [nodesState, setNodesState] = useState<FlowNode[]>(
  config?.initialWorkflow?.nodes || [
    { id: '1', type: 'start', label: 'Start', x: 400, y: 100 },
  ]
);

const [connections, setConnections] = useState<Connection[]>(config?.initialWorkflow?.connections || []);

const [workflowName, setWorkflowName] = useState(config?.initialWorkflow?.name || processName || 'New Workflow');
```

#### Change 5: Add config callback when saving workflows
Find the "Save Workflow" dropdown menu item (around line 850) and add:

```tsx
// After localStorage.setItem(), add:
config?.onWorkflowSave?.(workflowToSave);
```

#### Change 6: Add config callback when deploying workflows
Find the deploy success block (around line 1100) and add:

```tsx
// After successful deployment, add:
config?.onWorkflowDeploy?.({ nodes, connections }, deployCustomerId);
```

#### Change 7: Add config callback when creating templates
Find the template save success block (around line 1250) and add:

```tsx
// After successful template save, add:
config?.onTemplateCreate?.(template);
```

#### Change 8: Remove DocumentLibrary section (if present)
Search for and DELETE the entire DocumentLibrary modal section (around line 2800):

```tsx
// DELETE THIS ENTIRE BLOCK:
{showDocLibrary && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDocLibrary(false)}>
    <div className="w-[600px]" onClick={(e) => e.stopPropagation()}>
      <DocumentLibrary
        onSelectDocument={(doc: Document) => {
          // ...
        }}
        selectedDocId={selectedNodeData?.config?.documentId}
      />
    </div>
  </div>
)}
```

## ✅ After Making These Changes

1. **Test the workflow builder** by clicking the workflow icon on any process
2. **Verify** that:
   - All 7 node types appear in the palette
   - Drag and drop works
   - Properties panel opens when clicking nodes
   - Templates dropdown works
   - Save/Load works
   - Close button returns to ValueDock

## 📝 Why This Approach

The ClientDock WorkflowBuilder is a massive 6000+ line component with:
- Complete visual workflow editor
- All 7 node types
- Drag and drop canvas
- Properties panel
- Templates system
- Multi-select
- Undo/redo
- Decision branches
- And much more

It's too large to write programmatically, so manual copy-paste with the adjustments above is the best approach.

## 🎯 Expected Result

After copying and adjusting, you'll have the full ClientDock workflow builder integrated into ValueDock, accessible from the workflow icon in the Inputs screen process table.
