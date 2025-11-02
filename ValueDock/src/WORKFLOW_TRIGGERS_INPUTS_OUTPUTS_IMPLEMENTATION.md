# Workflow Triggers, Inputs, Outputs, Dependencies Implementation

## Overview
System now supports per-node triggers, inputs, outputs, and dependencies with organization-scoped storage and per-user deletion.

## What Changed

### 1. Risk Scoring Update
**Triggers now count as inputs for complexity/risk calculation:**
- Old formula: Only counted nodes marked as `isInputNode`
- New formula: Counts all unique triggers + inputs across all nodes
- This directly feeds into the Complexity Index calculation

### 2. Data Model Updates

#### FlowNode Config (types.ts)
```typescript
config?: {
  // ... existing fields ...
  triggers?: string[];      // NEW: Array of trigger names
  inputs?: string[];        // NEW: Array of input names
  outputs?: string[];       // NEW: Array of output names
  dependencies?: string[];  // NEW: Array of dependency names
}
```

#### Organization Metadata (storage.ts)
```typescript
interface OrganizationWorkflowMetadata {
  organizationId: string;
  triggers: string[];      // Organization-wide available triggers
  inputs: string[];        // Organization-wide available inputs
  outputs: string[];       // Organization-wide available outputs
  dependencies: string[];  // Organization-wide available dependencies
}
```

### 3. Complexity Calculator Updated
File: `/components/workflow-module/complexityCalculator.ts`

**New logic:**
- Collects all unique triggers from all nodes
- Collects all unique inputs from all nodes
- **Total inputs = triggers + inputs** (for risk scoring)
- Dependencies collected from new `dependencies[]` field + legacy `responsibleTeam`

### 4. New Component: NodeMetadataEditor
File: `/components/workflow-module/NodeMetadataEditor.tsx`

Features:
- Text input with auto-suggestions from organization list
- Add new items (saves to organization)
- Remove items (removes from node only, not organization)
- Badge display with X buttons
- Dropdown suggestions while typing

## Integration into WorkflowBuilder

### Step 1: Import Dependencies

Add to top of WorkflowBuilder.tsx:
```typescript
import { LocalWorkflowStorage, OrganizationWorkflowMetadata } from './storage';
import { NodeMetadataEditor } from './NodeMetadataEditor';
```

### Step 2: Add State for Organization Metadata

Add inside the WorkflowBuilder component:
```typescript
const [orgMetadata, setOrgMetadata] = useState<OrganizationWorkflowMetadata>({
  organizationId: '',
  triggers: [],
  inputs: [],
  outputs: [],
  dependencies: []
});

// Load organization metadata on mount
useEffect(() => {
  const loadMetadata = async () => {
    if (organizationId) {
      const metadata = await LocalWorkflowStorage.loadMetadata(organizationId);
      setOrgMetadata(metadata);
    }
  };
  loadMetadata();
}, [organizationId]);
```

### Step 3: Add Helper Functions

```typescript
// Handler to add new trigger to organization
const handleAddTrigger = async (trigger: string) => {
  await LocalWorkflowStorage.addTrigger(orgMetadata.organizationId, trigger);
  const updated = await LocalWorkflowStorage.loadMetadata(orgMetadata.organizationId);
  setOrgMetadata(updated);
};

// Similar handlers for inputs, outputs, dependencies
const handleAddInput = async (input: string) => {
  await LocalWorkflowStorage.addInput(orgMetadata.organizationId, input);
  const updated = await LocalWorkflowStorage.loadMetadata(orgMetadata.organizationId);
  setOrgMetadata(updated);
};

const handleAddOutput = async (output: string) => {
  await LocalWorkflowStorage.addOutput(orgMetadata.organizationId, output);
  const updated = await LocalWorkflowStorage.loadMetadata(orgMetadata.organizationId);
  setOrgMetadata(updated);
};

const handleAddDependency = async (dependency: string) => {
  await LocalWorkflowStorage.addDependency(orgMetadata.organizationId, dependency);
  const updated = await LocalWorkflowStorage.loadMetadata(orgMetadata.organizationId);
  setOrgMetadata(updated);
};
```

### Step 4: Add NodeMetadataEditor Components to Properties Panel

Find the section where node properties are edited (likely in a sidebar or modal).

Add these sections for each node type (task, decision, input, document, action):

```tsx
{/* Node editing section */}
{editingNode && (
  <div className="space-y-4">
    {/* Existing fields: label, description, assignee, etc. */}
    
    {/* NEW: Triggers Section */}
    <NodeMetadataEditor
      label="Triggers"
      values={editingNode.config?.triggers || []}
      suggestions={orgMetadata.triggers}
      onChange={(triggers) => {
        setNodes(prev => prev.map(n => 
          n.id === editingNode.id 
            ? { ...n, config: { ...n.config, triggers } }
            : n
        ));
      }}
      onAddToOrganization={handleAddTrigger}
      placeholder="e.g., Email, EDI Feed, Vendor Portal"
    />
    
    {/* NEW: Inputs Section */}
    <NodeMetadataEditor
      label="Inputs"
      values={editingNode.config?.inputs || []}
      suggestions={orgMetadata.inputs}
      onChange={(inputs) => {
        setNodes(prev => prev.map(n => 
          n.id === editingNode.id 
            ? { ...n, config: { ...n.config, inputs } }
            : n
        ));
      }}
      onAddToOrganization={handleAddInput}
      placeholder="e.g., ERP, CRM, Database"
    />
    
    {/* NEW: Outputs Section */}
    <NodeMetadataEditor
      label="Outputs"
      values={editingNode.config?.outputs || []}
      suggestions={orgMetadata.outputs}
      onChange={(outputs) => {
        setNodes(prev => prev.map(n => 
          n.id === editingNode.id 
            ? { ...n, config: { ...n.config, outputs } }
            : n
        ));
      }}
      onAddToOrganization={handleAddOutput}
      placeholder="e.g., Parsed invoice record, Report"
    />
    
    {/* NEW: Dependencies Section */}
    <NodeMetadataEditor
      label="Dependencies"
      values={editingNode.config?.dependencies || []}
      suggestions={orgMetadata.dependencies}
      onChange={(dependencies) => {
        setNodes(prev => prev.map(n => 
          n.id === editingNode.id 
            ? { ...n, config: { ...n.config, dependencies } }
            : n
        ));
      }}
      onAddToOrganization={handleAddDependency}
      placeholder="e.g., AP, Procurement, Finance"
    />
  </div>
)}
```

### Step 5: Display in Node Tooltips (Optional Enhancement)

Add to node hover tooltips to show triggers/inputs/outputs/dependencies:

```tsx
{node.config?.triggers && node.config.triggers.length > 0 && (
  <div className="text-xs">
    <strong>Triggers:</strong> {node.config.triggers.join(', ')}
  </div>
)}
{node.config?.inputs && node.config.inputs.length > 0 && (
  <div className="text-xs">
    <strong>Inputs:</strong> {node.config.inputs.join(', ')}
  </div>
)}
{node.config?.outputs && node.config.outputs.length > 0 && (
  <div className="text-xs">
    <strong>Outputs:</strong> {node.config.outputs.join(', ')}
  </div>
)}
{node.config?.dependencies && node.config.dependencies.length > 0 && (
  <div className="text-xs">
    <strong>Dependencies:</strong> {node.config.dependencies.join(', ')}
  </div>
)}
```

## Example: Invoice Intake Process

```typescript
const invoiceIntakeNode = {
  id: '1',
  type: 'task',
  label: 'Invoice Intake',
  x: 100,
  y: 200,
  config: {
    description: 'Receive and extract invoice data',
    triggers: ['Email', 'EDI Feed', 'Vendor Portal'],
    inputs: ['OCR Engine', 'ERP'],
    outputs: ['Parsed invoice record'],
    dependencies: ['AP', 'Procurement']
  }
};
```

This node would contribute:
- **5 to inputs count** (3 triggers + 2 inputs)
- **2 to dependencies count** (AP, Procurement)

## Complexity Index Calculation

Given the example workflow with all 7 processes:

1. **Invoice Intake**: 5 inputs (triggers + inputs), 1 step, 2 dependencies
2. **Validation**: 2 inputs, 1 step, 2 dependencies  
3. **Exception Handling**: 2 inputs, 1 step, 3 dependencies
4. **Approval Workflow**: 2 inputs, 1 step, 3 dependencies
5. **Payment Processing**: 2 inputs, 1 step, 2 dependencies
6. **Reconciliation**: 3 inputs, 1 step, 3 dependencies
7. **Sub-Processes**: Various

**Total unique:**
- Inputs: ~12 unique triggers + inputs → normalized score ~8.5
- Steps: 7+ nodes → normalized score ~5.2  
- Dependencies: ~6 unique teams → normalized score ~7.0

**Complexity Index:**
```
= (0.4 × 8.5) + (0.4 × 5.2) + (0.2 × 7.0)
= 3.4 + 2.08 + 1.4
= 6.88 → "Moderate" risk (Risk Value = 5)
```

## Testing Checklist

- [ ] Add a trigger to a node → verify it appears in organization suggestions
- [ ] Add the same trigger to another node → verify it uses existing suggestion
- [ ] Remove a trigger from a node → verify it stays in organization suggestions
- [ ] Add a new input/output/dependency → verify organization-wide saving
- [ ] Check complexity metrics update in real-time
- [ ] Verify Risk Metrics section shows updated complexity index
- [ ] Confirm CFO Score in Opportunity Matrix uses new risk value

## Files Modified

1. `/components/workflow-module/types.ts` - Added fields to FlowNode config
2. `/components/workflow-module/storage.ts` - Added organization metadata management
3. `/components/workflow-module/complexityCalculator.ts` - Updated to count triggers as inputs
4. `/components/workflow-module/NodeMetadataEditor.tsx` - NEW component
5. `/components/ProcessAdvancedMetricsDialog.tsx` - Already updated for new complexity formula
6. `/components/OpportunityMatrix.tsx` - Already updated to use complexity metrics for risk
7. `/App.tsx` - Already updated to handle complexity updates with manual overrides

## Key Benefits

1. **Accurate Risk Scoring**: Triggers counted as inputs gives true complexity picture
2. **Reusability**: Organization-wide suggestions speed up workflow creation
3. **Flexibility**: Per-user deletion doesn't affect other users
4. **Consistency**: Everyone in organization sees same options
5. **CFO-Focused**: Direct integration with ROI matrix and risk calculations
