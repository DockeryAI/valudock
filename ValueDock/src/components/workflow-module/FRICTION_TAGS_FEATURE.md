# Workflow Friction Tags Feature

## Overview
The workflow builder now includes two special friction tags that can be dragged from the node library and attached to any node on the canvas. These tags help identify problematic steps in workflows.

## Tag Types

### 1. Time Sink ⏰
- **Icon**: Clock (amber/yellow colored circle)
- **Description**: "Tasks that are highly manual, repetitive, and consume a lot of employee time"
- **Use Case**: Mark processes that are time-consuming and good candidates for automation
- **Color**: Amber (#f59e0b)

### 2. Quality Risk ⚠️
- **Icon**: Alert Triangle (red colored circle)
- **Description**: "Steps in the process that are prone to human error or inconsistencies"
- **Use Case**: Identify steps that need quality controls or automation to reduce errors
- **Color**: Red (#ef4444)

## How to Use

### Adding Friction Tags

1. **Locate the Friction Tags Section**
   - In the left sidebar node library, scroll to the bottom
   - Below the standard node types, you'll find "Friction Tags"
   - Two tags are displayed: Time Sink and Quality Risk

2. **Drag and Drop**
   - Click and drag a tag from the library
   - Drop it onto any node in the canvas
   - The tag will attach to the top-right corner of the node

3. **Visual Feedback**
   - When dragging a tag over a node, the node will highlight with a purple border
   - Successfully attached tags appear as small circular badges in the top-right corner
   - Tags are slightly larger than the connection ports (20px vs 16px)

### Viewing Tag Information

1. **Hover Tooltip**
   - Hover over an attached tag to see a detailed tooltip
   - Tooltip shows:
     - Tag label (e.g., "Time Sink")
     - Full description
     - "Click to remove" instruction

2. **Size and Position**
   - Tags are positioned at the top-right corner (-2px offset from edges)
   - Size: 20px × 20px circles
   - Icon glyph inside: 12px × 12px
   - Slightly larger than branch ports for visibility

### Removing Friction Tags

1. **Click to Remove**
   - Simply click on an attached tag
   - The tag will be removed immediately
   - Action is recorded in the undo history

2. **Undo Support**
   - Both adding and removing tags are undoable
   - Use the Undo button to revert changes

## Technical Details

### Data Structure

Friction tags are stored in the `attachments` array of each FlowNode:

```typescript
interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'input' | 'document' | 'action';
  label: string;
  x: number;
  y: number;
  config?: {...};
  attachments?: Array<{
    id: string;
    type: 'time-sink' | 'quality-risk';
  }>;
}
```

### Tag Templates

Tag templates are defined in `iconAttachmentTemplates`:

```typescript
const iconAttachmentTemplates = {
  'time-sink': {
    icon: Clock,
    label: 'Time Sink',
    color: 'bg-amber-500',
    description: 'Tasks that are highly manual, repetitive, and consume a lot of employee time'
  },
  'quality-risk': {
    icon: AlertTriangle,
    label: 'Quality Risk',
    color: 'bg-red-500',
    description: 'Steps in the process that are prone to human error or inconsistencies'
  },
};
```

### Persistence

- Friction tags are saved with the workflow
- They persist in localStorage and cloud storage
- Included in workflow templates
- Exported with PDF workflows

## Best Practices

### When to Use Time Sink Tags

- Manual data entry tasks
- Repetitive copy-paste operations
- Tasks requiring multiple system logins
- Processes with high time investment per instance
- Steps that create employee workload bottlenecks

### When to Use Quality Risk Tags

- Steps requiring complex calculations
- Data transformation or mapping tasks
- Processes with high error rates
- Tasks dependent on tribal knowledge
- Manual review or approval processes

### Visual Analysis

Use friction tags to:

1. **Identify Automation Opportunities**
   - Nodes with Time Sink tags are candidates for automation
   - Calculate potential time savings

2. **Prioritize Quality Improvements**
   - Nodes with Quality Risk tags need error prevention
   - Consider validation rules or automation

3. **Communicate with Stakeholders**
   - Visual indicators help non-technical stakeholders understand pain points
   - Export workflows to PDF showing problematic steps

4. **Process Documentation**
   - Document known issues in the workflow
   - Track improvement areas over time

## Design Decisions

### Why Top-Right Corner?
- Doesn't interfere with node labels
- Clearly visible without obscuring node content
- Doesn't conflict with connection ports
- Multiple tags can stack horizontally

### Why Click-to-Remove?
- Simple, intuitive interaction
- No additional UI needed
- Prevents accidental removal (requires deliberate click)
- Consistent with other deletion patterns

### Why Only Two Tag Types?
- Focused on most common ROI analysis needs
- Prevents visual clutter
- Easy to remember and use consistently
- Can be extended in future if needed

## Future Enhancements

Potential future additions:

1. **Custom Friction Tags**
   - Allow users to create custom tag types
   - Configurable colors and descriptions

2. **Tag Notes**
   - Add text notes to tags
   - Document specific issues or improvement ideas

3. **Metrics Integration**
   - Link tags to ROI calculations
   - Show time or cost impact in tooltip

4. **Filter/Search by Tags**
   - Find all nodes with specific tag types
   - Generate reports based on tags

5. **Multiple Tags of Same Type**
   - Currently limited to one of each type per node
   - Could allow multiple with counters

## Migration Notes

### Old WorkflowEditor Removed

The old `/components/WorkflowEditor.tsx` file has been removed as part of this update. The application now exclusively uses the workflow module from `/components/workflow-module/`:

- ✅ All workflow functionality migrated to the module
- ✅ App.tsx uses `StandaloneWorkflow` component
- ✅ Per-process workflow integration complete
- ✅ Organization-scoped templates working
- ✅ PDF export functional
- ✅ Document node integration active

### No Breaking Changes

Friction tags are:
- Optional (backward compatible)
- Additive (existing workflows work unchanged)
- Non-disruptive (doesn't affect workflow execution)

## Examples

### Example 1: Invoice Processing

```
[Start] → [Receive Invoice] → [Manual Data Entry]🕐 → [Validate Data]⚠️ → [Approval] → [Payment] → [End]
```

- 🕐 Time Sink: Manual data entry is time-consuming
- ⚠️ Quality Risk: Data validation is error-prone

### Example 2: Customer Onboarding

```
[Start] → [Collect Documents] → [Manual Review]🕐⚠️ → [Create Account] → [Send Welcome] → [End]
```

- 🕐⚠️ Both tags: Manual review is both time-consuming AND error-prone

### Example 3: Report Generation

```
[Start] → [Query Data] → [Format Report]🕐 → [Manual QA]⚠️ → [Distribute] → [End]
```

- 🕐 Time Sink: Report formatting is repetitive
- ⚠️ Quality Risk: QA process has inconsistencies

## Support

For questions or issues with friction tags:

1. Check this documentation
2. Review the workflow module README
3. Inspect the browser console for debug information
4. Use the Debug Panel in the workflow editor

## Changelog

### Version 1.0 (October 14, 2025)
- ✅ Initial release
- ✅ Two tag types: Time Sink and Quality Risk
- ✅ Drag-and-drop from palette
- ✅ Top-right corner positioning
- ✅ Hover tooltips with descriptions
- ✅ Click-to-remove functionality
- ✅ Undo/redo support
- ✅ Persistence in storage
- ✅ Old WorkflowEditor removed
- ✅ Integration with workflow module complete
