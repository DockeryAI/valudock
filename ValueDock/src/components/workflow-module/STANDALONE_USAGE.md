# 🚀 Standalone Workflow Builder - Usage Guide

## ✨ No Dashboard Required!

The workflow builder is completely standalone. You can add it to **any app** with just a button - no CPA dashboard or complex setup needed!

---

## 🎯 Quick Start (30 seconds)

### 1. Import the Component

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';
import { Button } from './components/ui/button';
```

### 2. Add State

```tsx
function MyApp() {
  const [showWorkflow, setShowWorkflow] = useState(false);
```

### 3. Add Button + Workflow

```tsx
  return (
    <div>
      {/* Your button */}
      <Button onClick={() => setShowWorkflow(true)}>
        Open Workflow Builder
      </Button>

      {/* Workflow builder - shows when button is clicked */}
      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

### 4. Done! 🎉

That's it! The workflow builder is now in your app. Click the button to open it.

---

## 📦 What You Get

### Complete Feature Set (Out of the Box!)

**Node Types (7):**
- 🟢 Start - Green circle
- 🔴 End - Red circle  
- 🔵 Task - Blue square
- 🟡 Decision - Yellow diamond
- 🟣 Input/Output - Indigo trapezoid
- ⚪ Document - Gray square
- 🟠 Action - Orange square

**Canvas Features:**
- ✅ Drag and drop nodes
- ✅ Pan canvas (click & drag)
- ✅ Zoom (scroll wheel)
- ✅ Grid snapping
- ✅ Multi-select (Shift+Click)
- ✅ Selection box

**Workflow Features:**
- ✅ Draw connections
- ✅ Configure properties
- ✅ 3 pre-built templates
- ✅ Save/load workflows
- ✅ Deploy workflows
- ✅ Undo/redo (100 levels)
- ✅ Export/import (JSON)

**Default Storage:**
- ✅ Uses browser localStorage
- ✅ Works offline
- ✅ No backend needed

---

## 💡 Usage Examples

### Example 1: Simple Button

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';
import { Button } from './components/ui/button';
import { Workflow } from 'lucide-react';

function App() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8">
      <h1>My App</h1>
      
      <Button onClick={() => setShowWorkflow(true)} className="gap-2">
        <Workflow className="h-4 w-4" />
        Create Workflow
      </Button>

      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

### Example 2: In Navigation Bar

```tsx
function App() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div>
      {/* Header/Navigation */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1>ValueDock</h1>
        <nav className="flex gap-4">
          <a href="/dashboard">Dashboard</a>
          <a href="/clients">Clients</a>
          <button onClick={() => setShowWorkflow(true)}>
            Workflows
          </button>
        </nav>
      </header>

      {/* Page content */}
      <main>
        {/* Your app content */}
      </main>

      {/* Workflow builder overlay */}
      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

### Example 3: As a Tab/Page

```tsx
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="h-screen flex flex-col">
      {/* Tabs */}
      <div className="border-b">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('workflows')}>Workflows</button>
        <button onClick={() => setCurrentPage('clients')}>Clients</button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'workflows' && (
          <StandaloneWorkflow 
            fullScreen={false} 
            showCloseButton={false} 
          />
        )}
        {currentPage === 'clients' && <ClientsPage />}
      </div>
    </div>
  );
}
```

### Example 4: Multiple Entry Points

```tsx
function App() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8">
      {/* Action cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <h3>Build Workflows</h3>
          <p>Create automated workflows</p>
          <Button onClick={() => setShowWorkflow(true)}>
            Open Builder
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3>Templates</h3>
          <p>Use pre-built templates</p>
          <Button onClick={() => setShowWorkflow(true)}>
            Browse Templates
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3>My Workflows</h3>
          <p>View saved workflows</p>
          <Button onClick={() => setShowWorkflow(true)}>
            View All
          </Button>
        </div>
      </div>

      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

---

## ⚙️ Configuration (Optional)

### Basic - No Config Needed

The workflow builder works perfectly with **zero configuration**. Just use it!

```tsx
<StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
```

Default behavior:
- ✅ Uses localStorage for save/load
- ✅ Logs to console when saving/deploying
- ✅ All features enabled
- ✅ Full screen overlay
- ✅ Close button shown

### Advanced - Custom Callbacks

Add callbacks to integrate with your backend:

```tsx
<StandaloneWorkflow
  onClose={() => setShowWorkflow(false)}
  config={{
    onWorkflowSave: async (workflow) => {
      // Save to your backend
      await fetch('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      });
      alert('Workflow saved!');
    },
    
    onWorkflowDeploy: async (workflow, customerId) => {
      // Deploy to customer
      await fetch('/api/deploy', {
        method: 'POST',
        body: JSON.stringify({ workflow, customerId }),
      });
      alert('Deployed!');
    },
    
    onTemplateCreate: (template) => {
      // Handle template creation
      console.log('Template created:', template.name);
    },
  }}
/>
```

### Custom Storage Backend

Replace localStorage with your own storage:

```tsx
<StandaloneWorkflow
  config={{
    storage: {
      saveWorkflow: async (workflow) => {
        await api.saveWorkflow(workflow);
      },
      loadWorkflows: async () => {
        return await api.getWorkflows();
      },
      saveTemplate: async (template) => {
        await api.saveTemplate(template);
      },
      loadTemplates: async () => {
        return await api.getTemplates();
      },
    },
  }}
/>
```

### UI Customization

Control which UI elements are shown:

```tsx
<StandaloneWorkflow
  config={{
    ui: {
      showDeployButton: true,      // Show/hide deploy button
      showTemplateButtons: true,   // Show/hide template buttons
      showDocumentLibrary: false,  // Show/hide document library
    },
  }}
/>
```

### Embedded Mode (Not Full Screen)

Use the workflow builder as part of your page layout:

```tsx
<div className="h-screen">
  <StandaloneWorkflow
    fullScreen={false}       // Don't overlay the whole screen
    showCloseButton={false}  // Hide close button
  />
</div>
```

---

## 🎨 Styling & Layout

### Full Screen Overlay (Default)

```tsx
{showWorkflow && (
  <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
)}
```

This creates a full-screen overlay that covers your entire app. Perfect for modal-style workflow building.

### Embedded in Page

```tsx
<div className="h-screen">
  <StandaloneWorkflow 
    fullScreen={false} 
    showCloseButton={false}
  />
</div>
```

This embeds the workflow builder in your page layout. Make sure the parent container has a defined height.

### Custom Container

```tsx
<div className="h-[600px] border rounded-lg overflow-hidden">
  <StandaloneWorkflow 
    fullScreen={false} 
    showCloseButton={false}
    className="rounded-lg"
  />
</div>
```

### In Modal/Dialog

```tsx
import { Dialog, DialogContent } from './components/ui/dialog';

<Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
  <DialogContent className="max-w-[90vw] h-[90vh]">
    <StandaloneWorkflow 
      fullScreen={false}
      onClose={() => setShowWorkflow(false)}
    />
  </DialogContent>
</Dialog>
```

---

## 📊 Complete API Reference

### StandaloneWorkflow Props

```typescript
interface StandaloneWorkflowProps {
  // Callback when close button clicked
  onClose?: () => void;
  
  // Optional configuration
  config?: WorkflowModuleConfig;
  
  // Show close button (default: true)
  showCloseButton?: boolean;
  
  // Full screen mode (default: true)
  fullScreen?: boolean;
  
  // Custom class name
  className?: string;
}
```

### WorkflowModuleConfig

```typescript
interface WorkflowModuleConfig {
  // Callbacks
  onWorkflowSave?: (workflow: SavedWorkflow) => void;
  onWorkflowDeploy?: (workflow: any, customerId?: string) => void;
  onTemplateCreate?: (template: WorkflowTemplate) => void;
  
  // Custom storage backend
  storage?: {
    saveWorkflow?: (workflow: SavedWorkflow) => Promise<void>;
    loadWorkflows?: () => Promise<SavedWorkflow[]>;
    saveTemplate?: (template: WorkflowTemplate) => Promise<void>;
    loadTemplates?: () => Promise<WorkflowTemplate[]>;
  };
  
  // UI customization
  ui?: {
    showDeployButton?: boolean;
    showTemplateButtons?: boolean;
    showDocumentLibrary?: boolean;
  };
  
  // Document integration
  documents?: {
    enabled: boolean;
    getDocuments?: () => Promise<any[]>;
  };
  
  // Supabase integration (optional)
  supabase?: {
    projectId: string;
    publicAnonKey: string;
  };
}
```

---

## 🔌 Backend Integration Examples

### Example: Supabase

```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

<StandaloneWorkflow
  config={{
    onWorkflowSave: async (workflow) => {
      const { error } = await supabase
        .from('workflows')
        .insert([workflow]);
      
      if (error) console.error('Save error:', error);
      else alert('Workflow saved!');
    },
    
    storage: {
      loadWorkflows: async () => {
        const { data } = await supabase
          .from('workflows')
          .select('*');
        return data || [];
      },
    },
  }}
/>
```

### Example: Custom API

```tsx
<StandaloneWorkflow
  config={{
    onWorkflowSave: async (workflow) => {
      const response = await fetch('https://api.myapp.com/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(workflow),
      });
      
      if (response.ok) {
        alert('Saved successfully!');
      }
    },
  }}
/>
```

---

## ✅ No Dashboard Required!

Unlike the old setup, you **don't need** any of these:

- ❌ CPADashboard
- ❌ Dashboard wrapper
- ❌ Complex navigation setup
- ❌ Tab management
- ❌ Route configuration

**You only need:**

- ✅ Import StandaloneWorkflow
- ✅ Add a button
- ✅ Show/hide with state
- ✅ Done!

---

## 🎯 Common Patterns

### Pattern 1: Modal/Popup

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Build Workflow</Button>

{open && <StandaloneWorkflow onClose={() => setOpen(false)} />}
```

### Pattern 2: Dedicated Page

```tsx
// /pages/workflows.tsx
export default function WorkflowsPage() {
  return (
    <div className="h-screen">
      <StandaloneWorkflow 
        fullScreen={false}
        showCloseButton={false}
      />
    </div>
  );
}
```

### Pattern 3: Conditional Render

```tsx
const hasWorkflowAccess = user.role === 'admin';

{hasWorkflowAccess && (
  <Button onClick={() => setShowWorkflow(true)}>
    Workflows
  </Button>
)}

{showWorkflow && <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />}
```

---

## 📚 More Examples

See `SimpleExample.tsx` for complete working examples:

1. **SimpleWorkflowExample** - Basic button + workflow
2. **MultiButtonExample** - Multiple entry points
3. **TabbedExample** - Embedded in tabs
4. **BackendIntegrationExample** - With API integration

---

## 🎉 Summary

**It's really this simple:**

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';

function App() {
  const [show, setShow] = useState(false);
  
  return (
    <>
      <button onClick={() => setShow(true)}>Workflows</button>
      {show && <StandaloneWorkflow onClose={() => setShow(false)} />}
    </>
  );
}
```

**That's it! No dashboard, no complex setup. Just import and use!** 🚀

---

## 🔗 More Resources

- **Quick Start:** `QUICK_ADD.md`
- **Full API Docs:** `README.md`
- **Working Examples:** `SimpleExample.tsx`
- **Type Definitions:** `types.ts`
