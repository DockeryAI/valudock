# Workflow Friction Tags - Quick Start Guide

## 🎯 What Are Friction Tags?

Friction tags are visual indicators you can add to workflow nodes to highlight:
- **🕐 Time Sinks**: Tasks that consume excessive employee time
- **⚠️ Quality Risks**: Steps prone to human error or inconsistencies

## 🚀 Quick Usage

### Step 1: Open Workflow Editor
1. Go to the **Inputs** screen
2. Click the **workflow icon** (🔀) next to any process
3. The workflow editor opens in full screen

### Step 2: Find Friction Tags
1. Look at the left sidebar (Node Library)
2. Scroll to the bottom section labeled **"Friction Tags"**
3. You'll see two circular icons:
   - 🕐 **Time Sink** (amber/yellow circle)
   - ⚠️ **Quality Risk** (red circle)

### Step 3: Add a Tag
1. **Click and drag** a tag from the library
2. **Drop it** onto any node in your workflow canvas
3. The tag attaches to the **top-right corner** of the node

### Step 4: View Info
- **Hover** over an attached tag to see:
  - Tag name
  - Full description
  - "Click to remove" hint

### Step 5: Remove a Tag
- Simply **click** on any attached tag to remove it
- Or use **Undo** to revert the attachment

## 📋 Tag Descriptions

### Time Sink 🕐
**When to use:**
- Manual data entry tasks
- Repetitive operations (copy-paste, reformatting)
- Tasks requiring multiple system logins
- High time investment per transaction
- Employee workload bottlenecks

**Description:**
"Tasks that are highly manual, repetitive, and consume a lot of employee time"

### Quality Risk ⚠️
**When to use:**
- Error-prone manual calculations
- Data transformation/mapping steps
- Processes with high error rates
- Tasks requiring tribal knowledge
- Compliance-sensitive operations
- Manual reviews or approvals

**Description:**
"Steps in the process that are prone to human error or inconsistencies"

## 💡 Common Patterns

### Pattern 1: Automation Candidate
```
[Previous Step] → [Manual Task]🕐 → [Next Step]
```
The Time Sink tag identifies automation opportunities.

### Pattern 2: Quality Control Needed
```
[Data Entry] → [Validation]⚠️ → [Approval]
```
The Quality Risk tag highlights where errors typically occur.

### Pattern 3: High-Priority Fix
```
[Receive Request] → [Manual Processing]🕐⚠️ → [Complete]
```
Both tags indicate a critical bottleneck that's both slow AND error-prone.

### Pattern 4: Decision Point Risk
```
[Gather Info] → [Decision]⚠️ → [Branch A or B]
```
Quality Risk on decisions shows inconsistent criteria application.

## 🎨 Visual Features

### Appearance
- **Size**: 20px diameter circles (larger than connection ports)
- **Position**: Top-right corner of nodes (-2px offset)
- **Color**: 
  - Time Sink: Amber (#f59e0b)
  - Quality Risk: Red (#ef4444)
- **Effect**: White icon glyph, drop shadow, hover scale effect

### Drag State
- When dragging a tag over the canvas, target nodes highlight with a **purple border**
- The border pulses to indicate drop zone

### Multiple Tags
- You can attach **both** tags to the same node
- They stack horizontally at the top-right
- Each tag type can only be added once per node

## 🔧 Technical Notes

### Persistence
✅ Saved with workflows in localStorage  
✅ Saved to cloud (Supabase)  
✅ Included in workflow templates  
✅ Exported in PDF workflows  

### Undo/Redo
✅ Adding tags is undoable  
✅ Removing tags is undoable  
✅ Full history support  

### No Breaking Changes
✅ Existing workflows work unchanged  
✅ Tags are optional  
✅ Backward compatible  

## 📊 Use Cases for ROI Analysis

### Before ValueDock® Implementation

Identify pain points in current workflows:

1. **Map the current process** in the workflow editor
2. **Add Time Sink tags** to manual/repetitive tasks
3. **Add Quality Risk tags** to error-prone steps
4. **Export to PDF** and share with stakeholders
5. Use these markers to **justify automation** in your ROI presentation

### During ROI Calculation

Reference workflow pain points:

1. Time Sinks help calculate **time savings** from automation
2. Quality Risks help quantify **error reduction** benefits
3. Visual workflow with tags supports your **business case**
4. Include in **executive presentations** (Presentation screen)

### After Implementation

Document improvements:

1. Create "before" and "after" workflows
2. Show how Time Sinks were **eliminated**
3. Demonstrate Quality Risks were **mitigated**
4. Track **continuous improvement** areas

## 🎓 Training Tips

### For Business Analysts
- Use tags during process discovery sessions
- Mark pain points as stakeholders describe them
- Create visual documentation for improvement initiatives

### For Project Managers
- Identify high-impact automation targets
- Prioritize projects based on tag density
- Track mitigation of risks over time

### For Executives
- Quickly scan workflows for problem areas
- Understand where employee time is consumed
- Identify compliance or quality vulnerabilities

## ⚡ Pro Tips

1. **Be Selective**: Don't over-mark nodes. Focus on truly problematic steps.

2. **Combine with Notes**: Use the node's Notes field to document specific issues.

3. **Before/After Views**: Create two workflow templates - current state vs. future state.

4. **Team Consensus**: Have team members mark workflows independently, then compare.

5. **Quantify**: For each marked node, estimate time/error impact in the notes.

6. **Review Regularly**: Update tag placements as processes improve.

7. **Export for Presentations**: Use PDF export to share marked workflows in meetings.

## 🐛 Troubleshooting

### Tags won't attach to nodes
- Make sure you're dragging from the "Friction Tags" section (bottom of left sidebar)
- Drop directly onto the node shape (60px × 60px area)
- Check that the node highlights with purple border when hovering

### Tags disappeared after saving
- Tags persist automatically with workflow saves
- Check browser console for errors
- Verify you clicked "Save" button before closing

### Can't see tag tooltips
- Hover directly over the small circular tag (top-right corner)
- Tooltip appears after brief delay
- Works on both canvas and in saved workflows

### Accidentally removed a tag
- Click **Undo** button in the top toolbar
- Undo is tracked per action
- Full history available during session

## 📚 Related Documentation

- **Full Feature Guide**: `/components/workflow-module/FRICTION_TAGS_FEATURE.md`
- **Workflow Module README**: `/components/workflow-module/README.md`
- **Workflow Integration Guide**: `/WORKFLOW_INTEGRATION_COMPLETE.md`
- **ValueDock Quick Start**: `/QUICK_START.md`

## 🔄 Changelog

**October 14, 2025** - Initial Release
- Time Sink and Quality Risk tags added
- Drag-and-drop from palette
- Click-to-remove functionality
- Hover tooltips
- Full persistence support
- Old WorkflowEditor.tsx removed (migration to workflow module complete)

---

**Need Help?** Check the comprehensive guide at `/components/workflow-module/FRICTION_TAGS_FEATURE.md`

**Questions?** Review the workflow module documentation or check the debug panel in the workflow editor.
