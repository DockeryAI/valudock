# Workflow Module - Complete Package 📦

A complete, portable workflow builder module extracted from ClientDock with **100% feature parity** and **exact visual design**. Perfect for integration into ValueDock or any React project.

## 🚀 Quick Start

### For ValueDock Integration
👉 **See [QUICK_ADD.md](./QUICK_ADD.md)** for 60-second setup

### For General Use
👉 **See [STANDALONE_USAGE.md](./STANDALONE_USAGE.md)** for comprehensive guide

## ✨ Complete Features

### All 7 Node Types (Exact from ClientDock)
- ✅ **Start Node** (Green Circle) - Workflow triggers
- ✅ **End Node** (Red Circle) - Completion actions  
- ✅ **Task Node** (Blue Square) - Manual/automated tasks
- ✅ **Decision Node** (Yellow Diamond) - Conditional branching with multi-branch support
- ✅ **Input/Output Node** (Indigo Trapezoid) - Data operations
- ✅ **Document Node** (Gray Square) - Document management
- ✅ **Action Node** (Orange Square) - Automated actions

### Complete Functionality
- 🎨 **Visual Canvas** - Drag-and-drop, pan, zoom
- 🔗 **Smart Connections** - Auto-routing, snap-to-grid, visual feedback
- 📝 **Template System** - 3 built-in templates + custom templates
- 💾 **Persistence** - localStorage + Supabase integration
- 📄 **Document Integration** - Full DocumentLibrary integration
- ↩️ **Undo/Redo** - Complete history management
- 🎯 **Multi-Select** - Batch operations, drag multiple nodes
- ⚙️ **Properties Panel** - Draggable, node-specific configuration
- 🚀 **Deployment** - Backend API integration
- 🎨 **Exact Design** - Pixel-perfect match to ClientDock

## Installation

### Copy the entire module

```bash
# The module is already in your project at:
# /components/workflow-module/
```

## Dependencies

The module requires these UI components (from shadcn/ui):
- `card`, `button`, `badge`, `input`, `label`, `textarea`
- `scroll-area`, `separator`, `collapsible`, `dialog`
- `dropdown-menu`, `alert-dialog`

And these packages:
- `lucide-react` - Icons
- `react` (v18+)
- `tailwindcss` (v4+)

**✅ All dependencies are already installed in ValueDock!**

## Basic Usage

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

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

## Advanced Usage

### With Custom Storage

```tsx
import { WorkflowModule, LocalWorkflowStorage } from './components/workflow-module';

function App() {
  return (
    <WorkflowModule
      config={{
        storage: {
          saveTemplate: LocalWorkflowStorage.saveTemplate,
          loadTemplates: LocalWorkflowStorage.loadTemplates,
          saveWorkflow: LocalWorkflowStorage.saveWorkflow,
          loadWorkflows: LocalWorkflowStorage.loadWorkflows,
        },
        onWorkflowSave: (workflow) => {
          console.log('Workflow saved:', workflow);
        },
      }}
    />
  );
}
```

### With Supabase Integration

```tsx
import { WorkflowModule } from './components/workflow-module';
import { projectId, publicAnonKey } from './utils/supabase/info';

function App() {
  return (
    <WorkflowModule
      config={{
        supabase: {
          projectId,
          publicAnonKey,
        },
        documents: {
          enabled: true,
          getDocuments: async () => {
            // Fetch documents from your backend
            return [];
          },
        },
      }}
    />
  );
}
```

### With Callbacks

```tsx
import { WorkflowModule } from './components/workflow-module';

function App() {
  return (
    <WorkflowModule
      config={{
        onWorkflowSave: (workflow) => {
          console.log('Saved:', workflow);
        },
        onWorkflowDeploy: (workflow, customerId) => {
          console.log('Deploying to customer:', customerId);
        },
        onTemplateCreate: (template) => {
          console.log('Template created:', template);
        },
        ui: {
          showDeployButton: true,
          showTemplateButtons: true,
          showDocumentLibrary: false,
        },
      }}
    />
  );
}
```

## Configuration Options

### WorkflowModuleConfig

| Property | Type | Description |
|----------|------|-------------|
| `supabase` | `{ projectId, publicAnonKey }` | Optional Supabase configuration |
| `storage` | `{ saveTemplate, loadTemplates, saveWorkflow, loadWorkflows }` | Custom storage handlers |
| `documents` | `{ enabled, getDocuments }` | Document library integration |
| `onWorkflowSave` | `(workflow) => void` | Called when workflow is saved |
| `onWorkflowDeploy` | `(workflow, customerId?) => void` | Called when workflow is deployed |
| `onTemplateCreate` | `(template) => void` | Called when template is created |
| `initialWorkflow` | `{ name?, nodes?, connections? }` | Initial workflow state |
| `ui` | `{ showDeployButton?, showTemplateButtons?, showDocumentLibrary? }` | UI customization |

## Node Types

1. **Start** - Entry point (green circle)
2. **End** - Exit point (red circle)
3. **Task** - Work item (blue square)
4. **Decision** - Conditional branch (yellow diamond)
5. **Input/Output** - Data collection (purple icon)
6. **Document** - File management (indigo icon)
7. **Action** - Automation trigger (orange icon)

## Keyboard Shortcuts

- **Delete/Backspace** - Delete selected nodes
- **Shift+Click** - Multi-select nodes
- **Esc** - Deselect all
- **Ctrl/Cmd+Z** - Undo
- **Space+Drag** - Pan canvas

## Features in Detail

### Template System
- Save workflows as reusable templates
- Load from 3 pre-built templates (1040 Tax Return, 1120 Corporate, Client Onboarding)
- Templates include metadata (name, description, category)

### Save/Load System
- Save workflow state locally or to Supabase
- Auto-save warning when navigating away with unsaved changes
- Load previously saved workflows with one click

### Document Library
- Attach documents to document nodes
- Browse and select from document library
- Preview document metadata in properties panel

### Properties Panel
- Draggable panel for configuring nodes
- Different configuration options per node type
- Expandable notes section for documentation

### Smart Snapping
- Snap to grid for precise alignment
- Snap to connection endpoints
- Insert nodes between existing connections
- Visual snap indicators

### Multi-Select
- Select multiple nodes with Shift+Click
- Drag multiple nodes together
- Delete multiple nodes at once
- Selection box with drag-to-select

## Storage

By default, the module uses localStorage for persistence. To use a custom backend:

```tsx
const customStorage = {
  saveTemplate: async (template) => {
    await fetch('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },
  loadTemplates: async () => {
    const res = await fetch('/api/templates');
    return res.json();
  },
  // ... saveWorkflow, loadWorkflows
};

<WorkflowModule config={{ storage: customStorage }} />
```

## Architecture

```
workflow-module/
├── index.tsx              # Main export
├── WorkflowBuilder.tsx    # Core component (wrapper)
├── StandaloneWorkflow.tsx # Ready-to-use component
├── SimpleExample.tsx      # Usage examples
├── types.ts               # TypeScript definitions
├── constants.ts           # Node templates & config
├── storage.ts             # Storage implementations
├── README.md              # This file
├── QUICK_ADD.md           # 60-second setup
├── STANDALONE_USAGE.md    # Comprehensive usage guide
└── SETUP.md               # Advanced setup
```

## Examples

### Example 1: Simple Workflow Builder

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

export default function App() {
  const [show, setShow] = useState(false);
  
  return (
    <div className="w-full h-screen">
      <button onClick={() => setShow(true)}>Open Workflow</button>
      {show && <StandaloneWorkflow onClose={() => setShow(false)} />}
    </div>
  );
}
```

### Example 2: With Backend Integration

```tsx
import { StandaloneWorkflow } from './components/workflow-module';
import { useState } from 'react';

export default function App() {
  const [show, setShow] = useState(false);
  
  const handleSave = async (workflow) => {
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });
  };

  return (
    <div>
      <button onClick={() => setShow(true)}>Workflows</button>
      {show && (
        <StandaloneWorkflow
          onClose={() => setShow(false)}
          config={{ onWorkflowSave: handleSave }}
        />
      )}
    </div>
  );
}
```

## Troubleshooting

**Issue: Module not displaying**
- Ensure parent container has explicit height (`h-screen`, `h-[600px]`, etc.)
- Check that Tailwind is configured correctly

**Issue: Templates not loading**
- Check browser console for errors
- Verify storage configuration is correct
- LocalStorage may be disabled in private browsing

**Issue: Supabase errors**
- Verify projectId and publicAnonKey are correct
- Ensure server endpoints exist
- Check CORS configuration

## License

MIT - Free to use in any Figma Make project

## Support

For issues or questions, refer to:
- [QUICK_ADD.md](./QUICK_ADD.md) - Quick setup guide
- [STANDALONE_USAGE.md](./STANDALONE_USAGE.md) - Full usage guide
- [SimpleExample.tsx](./SimpleExample.tsx) - Code examples
