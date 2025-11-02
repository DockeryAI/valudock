# Run & Save Version Feature

## 🎯 Overview

Added a new **"Run & Save Version"** button to the Proposal Builder that automatically creates a new proposal version, runs the agent, and updates the Version Switcher on success.

---

## 🆕 What's New

### **Two Execution Options:**

Previously, the Proposal Builder had only one execution method. Now there are two:

#### **1. Run Agent** (Original - Outline Button)
- Runs the agent with current settings
- Updates current version (if exists)
- Does NOT create a new version
- Use for: Testing, iterating on current version

#### **2. Run & Save Version** (New - Primary Button)
- Creates a **new version** automatically
- Runs the agent with the new version
- Saves all results to the new version
- Updates Version Switcher to the new version
- Shows toast: "Proposal v{N} saved!"
- Use for: Creating new proposal iterations

---

## 🎨 UI Changes

### **Before:**
```
┌────────────────────────────────────┐
│                                    │
│  [      Run Proposal Agent      ]  │ (Full width)
│                                    │
└────────────────────────────────────┘
```

### **After:**
```
┌────────────────────────────────────┐
│                                    │
│  [   Run Agent   ] [ Run & Save  ] │ (Two columns)
│    (Outline)        Version (Primary)
│                                    │
└────────────────────────────────────┘
```

**Desktop:** Two side-by-side buttons  
**Mobile:** Stacked vertically

---

## 🔄 Workflow

### **Run & Save Version Flow:**

```
1. User clicks "Run & Save Version"
         ↓
2. System creates new version
   - Version number auto-increments (v1 → v2 → v3...)
   - Status: "Draft"
   - Creator: Current user
   - Timestamp: Now
         ↓
3. Backend endpoint: POST /proposal-agent/create-version
   - Saves version metadata
   - Links to {tenant_id, org_id, deal_id}
         ↓
4. Agent executes with version ID
   - Fetches website data
   - Analyzes Fathom transcripts
   - Creates ValueDock calculations
   - Generates Gamma presentation
         ↓
5. Results saved to version
   - Form state (Customer URL, Fathom window)
   - Execution logs
   - Results (Gamma link, ValueDock data)
         ↓
6. Version Switcher updates
   - Fetches latest versions from backend
   - Displays new version as current
         ↓
7. Success toast displays
   - "Proposal v3 saved!" (example)
```

---

## 💡 Use Cases

### **Scenario 1: Initial Proposal**
```
User: First time creating proposal
Action: Click "Run & Save Version"
Result: Version 1 created and saved
```

### **Scenario 2: Alternative Approach**
```
User: Already have v1, want to try different parameters
Action: Modify Customer URL or Fathom window
        Click "Run & Save Version"
Result: Version 2 created with new settings
        Both versions available in dropdown
```

### **Scenario 3: Client Revisions**
```
User: Client requested changes
Action: Update parameters
        Click "Run & Save Version"
Result: New version created (v3, v4, etc.)
        Previous versions preserved
        Can compare all versions
```

### **Scenario 4: Testing Without Saving**
```
User: Want to test parameters without creating version
Action: Click "Run Agent" (outline button)
Result: Agent runs
        Current version updated (if exists)
        No new version created
```

---

## 🎯 Button Comparison

| Feature | Run Agent | Run & Save Version |
|---------|-----------|-------------------|
| **Creates new version** | ❌ No | ✅ Yes |
| **Auto-increments version** | ❌ No | ✅ Yes |
| **Updates Version Switcher** | ❌ No | ✅ Yes |
| **Shows success toast** | ❌ No | ✅ Yes (with version #) |
| **Saves to backend** | ✅ Yes | ✅ Yes |
| **Runs agent** | ✅ Yes | ✅ Yes |
| **Visual style** | Outline | Primary (solid) |
| **Best for** | Testing, iteration | Final proposals, new versions |

---

## 🎨 Visual Guide

### **Button States:**

#### **Normal State:**
```
┌─────────────────────────────────────────────┐
│  [  ▶  Run Agent  ] [ 💾 Run & Save Version]│
│     Outline button     Primary blue button   │
└─────────────────────────────────────────────┘
```

#### **Running State:**
```
┌─────────────────────────────────────────────┐
│  [  ⏳ Running...  ] [  ⏳ Running...       ]│
│     Both disabled      Both show spinner    │
└─────────────────────────────────────────────┘
```

#### **Disabled State:**
```
┌─────────────────────────────────────────────┐
│  [  ▶  Run Agent  ] [ 💾 Run & Save Version]│
│     Grayed out         Grayed out           │
│  (Missing Deal ID or Customer URL)          │
└─────────────────────────────────────────────┘
```

---

## 📊 Version Switcher Integration

### **After Successful Run:**

The Version Switcher automatically updates to show the new version:

```
Before:
┌─────────────────────────────┐
│ 📄 Version 2    [Draft]     │  ← Current
│ [▼ Switch] [+ New Version]  │
└─────────────────────────────┘

Click "Run & Save Version"
         ↓

After:
┌─────────────────────────────┐
│ 📄 Version 3    [Draft]     │  ← NEW! Auto-switched
│ [▼ Switch] [+ New Version]  │
└─────────────────────────────┘

Dropdown shows:
  Version 3 ✓  [Draft]   ← NEW (current)
  Version 2    [Draft]
  Version 1    [Approved]
```

---

## 🔧 Technical Implementation

### **New Functions Added:**

#### **1. handleRunAndSaveVersion()**
```typescript
const handleRunAndSaveVersion = async () => {
  // 1. Validate form
  // 2. Create new version
  // 3. Call backend to persist version
  // 4. Run agent with version ID
  // 5. Reload versions from backend
  // 6. Show success toast with version number
}
```

#### **2. runAgentWithVersion(version)**
```typescript
const runAgentWithVersion = async (version: ProposalVersion) => {
  // 1. Execute agent with specific version ID
  // 2. Track logs and results
  // 3. Save results to version
  // 4. Handle errors
}
```

### **Backend Endpoint Called:**

```
POST /make-server-888f4514/proposal-agent/create-version

Body:
{
  dealId: "DEAL-2025-Q4-ACME",
  organizationId: "org-123",
  tenantId: "tenant-456",
  version: {
    id: "DEAL-2025-Q4-ACME-v3-1729123456789",
    version: 3,
    status: "draft",
    createdAt: "2025-10-16T14:30:00Z",
    createdBy: "user-789",
    createdByName: "John Smith"
  }
}

Response:
{
  success: true
}
```

---

## 🎯 Key Benefits

### **1. Automatic Version Management**
- No need to click "+ New Version" first
- One-click creation and execution
- Version number auto-increments

### **2. Organized Proposal History**
- Each execution creates a discrete version
- Easy to compare different approaches
- Complete audit trail

### **3. Non-Destructive Testing**
- "Run Agent" for testing (doesn't create version)
- "Run & Save Version" for production runs
- Previous versions always preserved

### **4. Clear User Feedback**
- Toast notification confirms version saved
- Shows exact version number created
- Version Switcher updates immediately

### **5. Simplified Workflow**
- Reduces clicks (was: create version → run agent)
- Now: single button does both
- Clearer intent ("Save" vs just "Run")

---

## 📱 Responsive Design

### **Desktop (≥768px):**
```
┌────────────────────────────────────────────┐
│  [     Run Agent     ] [ Run & Save Version]│
│      50% width             50% width        │
└────────────────────────────────────────────┘
```

### **Mobile (<768px):**
```
┌───────────────────────┐
│  [   Run Agent      ] │
│                       │
│  [ Run & Save Version]│
│                       │
└───────────────────────┘
```

---

## 🧪 Testing Checklist

### **✅ Basic Functionality:**
- [ ] Click "Run & Save Version" creates new version
- [ ] Version number increments correctly (v1 → v2 → v3)
- [ ] Agent executes successfully
- [ ] Results saved to new version
- [ ] Toast shows correct version number

### **✅ Version Switcher:**
- [ ] New version appears in dropdown
- [ ] New version marked as current (✓)
- [ ] Can switch back to previous versions
- [ ] Version metadata correct (timestamp, creator)

### **✅ UI/UX:**
- [ ] Both buttons disabled when form incomplete
- [ ] Both buttons show spinner when running
- [ ] Buttons side-by-side on desktop
- [ ] Buttons stacked on mobile
- [ ] Visual distinction (outline vs primary)

### **✅ Error Handling:**
- [ ] Error if version creation fails
- [ ] Error if agent execution fails
- [ ] Previous version preserved on error
- [ ] Clear error messages to user

### **✅ Permissions:**
- [ ] Org admin can create versions for their org
- [ ] Tenant admin can create for any org in tenant
- [ ] Master admin can create for any org
- [ ] Regular users cannot access feature

---

## 🎓 User Guide

### **When to Use "Run Agent":**
- Testing different parameters
- Debugging configuration
- Quick iterations
- Don't need to save as new version

### **When to Use "Run & Save Version":**
- Creating final proposals
- Presenting alternatives to clients
- Preserving proposal history
- Need complete version control

### **Tips:**
1. Use "Run Agent" first to test parameters
2. Once satisfied, use "Run & Save Version" for production
3. Each client proposal should be a separate version
4. Use version status to track approval workflow
5. Keep version comments in a separate notes field (future feature)

---

## 🔮 Future Enhancements

Potential improvements to consider:

### **1. Version Naming:**
- Allow custom version names ("Initial Proposal", "Client Revision 1")
- Auto-name based on date or iteration count

### **2. Version Comparison:**
- Side-by-side comparison of two versions
- Highlight differences in parameters and results
- Export comparison report

### **3. Version Comments:**
- Add notes to each version
- Track why changes were made
- Collaboration between team members

### **4. Version Templates:**
- Save successful versions as templates
- Reuse configuration for similar deals
- Template library

### **5. Batch Operations:**
- Run multiple versions with different parameters
- A/B testing automation
- Parallel execution

### **6. Version Approval Workflow:**
- Submit version for review
- Approval/rejection flow
- Email notifications on status change

---

## 📁 Files Modified

### **Updated:**
- `/components/ProposalAgentRunner.tsx`
  - Added `handleRunAndSaveVersion()` function
  - Added `runAgentWithVersion()` helper
  - Added "Run & Save Version" button
  - Modified button layout (grid, two columns)
  - Added Save icon import

### **Created:**
- `/RUN_AND_SAVE_VERSION_FEATURE.md` - This documentation

---

## 🎯 Summary

**The "Run & Save Version" button streamlines the proposal creation workflow by automatically creating a new version, running the agent, and updating the Version Switcher in a single action. This provides a clear, production-ready option alongside the existing "Run Agent" button for testing and iteration.**

**Key takeaway:** One button for testing ("Run Agent"), one button for production ("Run & Save Version"). Clear intent, organized history, complete version control.

---

**Status:** ✅ Complete and ready for testing  
**Date:** October 16, 2025  
**Location:** Admin → Agent tab → Proposal Builder
