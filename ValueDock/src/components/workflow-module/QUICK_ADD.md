# ⚡ Add Workflow Builder to Your App in 60 Seconds

## Copy-Paste This Code

### Step 1: Import (3 lines)

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';
import { Button } from './components/ui/button';
```

### Step 2: Add State (1 line)

```tsx
const [showWorkflow, setShowWorkflow] = useState(false);
```

### Step 3: Add Button + Workflow (8 lines)

```tsx
<Button onClick={() => setShowWorkflow(true)}>
  Build Workflow
</Button>

{showWorkflow && (
  <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
)}
```

## Complete Example

```tsx
import { useState } from 'react';
import { StandaloneWorkflow } from './components/workflow-module';
import { Button } from './components/ui/button';

function MyApp() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8">
      <h1>My App</h1>
      
      <Button onClick={() => setShowWorkflow(true)}>
        Build Workflow
      </Button>

      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
```

## That's It! ✅

You now have:
- ✅ Complete workflow builder
- ✅ All 7 node types
- ✅ Drag & drop
- ✅ Properties panel
- ✅ Templates
- ✅ Save/load
- ✅ Undo/redo
- ✅ Everything!

**No dashboard needed. No complex setup. Just works!** 🚀

---

## Optional: Add Backend Integration

If you want to save to your backend:

```tsx
<StandaloneWorkflow
  onClose={() => setShowWorkflow(false)}
  config={{
    onWorkflowSave: async (workflow) => {
      await fetch('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      });
      alert('Saved!');
    },
  }}
/>
```

---

## More Examples

See `STANDALONE_USAGE.md` for:
- Integration patterns
- Backend examples
- UI customization
- Advanced configuration

See `SimpleExample.tsx` for:
- Working code examples
- Different layouts
- Tab integration
- Multiple entry points
