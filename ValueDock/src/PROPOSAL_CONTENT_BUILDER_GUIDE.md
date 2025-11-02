# Proposal Content Builder - Complete Guide

## 🎯 Overview

The **Proposal Content Builder** is an integrated feature within the ValueDock Proposal Agent that allows users to create, edit, and export professional proposal documents with AI-generated content across five core sections.

---

## 📋 Five Core Sections

### 1. **Overview** (📄 FileText Icon)
- **Purpose**: Executive summary and company background
- **Default Content**: Company overview, current situation, recommended approach
- **AI Prompt**: "Generate an executive overview section for a ValueDock proposal. Include: 1) Brief company background from website data, 2) Current situation summary, 3) Our recommended approach. Keep it concise and executive-level (2-3 paragraphs)."

### 2. **Challenges & Goals** (🎯 Target Icon)
- **Purpose**: Client pain points and strategic objectives
- **Default Content**: Key challenges, strategic goals, alignment with automation
- **AI Prompt**: "Based on Fathom meeting transcripts and website analysis, extract and structure: 1) Top 3-5 key challenges the client faces, 2) Their stated goals and objectives, 3) How these align with automation opportunities. Use bullet points and clear headers."

### 3. **ROI Summary** (💰 DollarSign Icon)
- **Purpose**: Financial impact and returns analysis
- **Default Content**: Annual savings, payback period, ROI percentage, NPV analysis
- **AI Prompt**: "Create a concise ROI summary using ValueDock calculated data. Include: 1) Key financial metrics (annual savings, ROI, payback), 2) Value breakdown by category, 3) NPV analysis. Present numbers clearly with proper formatting."

### 4. **Solution Summary** (💡 Lightbulb Icon)
- **Purpose**: Proposed automation approach and implementation plan
- **Default Content**: Phased automation strategy, specific processes, technology stack
- **AI Prompt**: "Generate a solution summary describing the automation implementation. Include: 1) Phased approach with timeline, 2) Specific processes to automate with estimated automation percentages, 3) Technology stack overview. Be specific but not overly technical."

### 5. **Statement of Work (SOW)** (✅ FileCheck Icon)
- **Purpose**: Project scope, deliverables, and timeline
- **Default Content**: Project phases, deliverables, investment, timeline
- **AI Prompt**: "Create a detailed Statement of Work for the automation project. Include: 1) Project phases with timelines, 2) Specific deliverables, 3) Client responsibilities, 4) Investment summary, 5) Success criteria. Structure it as a formal SOW."

---

## 🎨 User Interface

### **Tab Navigation**

```
┌──────────────────────────────────────────────┐
│ [ Agent Runner ] [ Content Builder ]         │
└──────────────────────────────────────────────┘
```

- **Agent Runner Tab**: Configure and run the proposal generation agent
- **Content Builder Tab**: Edit sections and export to Gamma (enabled after version creation)

### **Section Tabs**

```
┌─────────────────────────────────────────────────────────────┐
│ [📄 Overview] [🎯 Challenges] [💰 ROI] [💡 Solution] [✅ SOW] │
└─────────────────────────────────────────────────────────────┘
```

Each tab shows:
- ✓ Badge if content has been edited
- Section icon
- Section title

### **Editor Layout**

```
┌─────────────────────────────────────────────┐
│ 🎯 Challenges & Goals          [Reset]      │
│ Client pain points and objectives           │
│                                             │
│ ℹ️ AI Prompt:                              │
│ "Based on Fathom meeting transcripts..."   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ # Challenges & Goals                │   │
│ │                                     │   │
│ │ ## Key Challenges                   │   │
│ │ 1. **Process Inefficiency**...      │   │
│ │                                     │   │
│ │ (Editable textarea - 20 rows)       │   │
│ │                                     │   │
│ └─────────────────────────────────────┘   │
│ 1,247 characters           [✓ Edited]      │
└─────────────────────────────────────────────┘
```

---

## 🚀 Workflow

### **Step 1: Run Proposal Agent**

1. Navigate to **Admin → Agent → Proposal Builder**
2. Fill in:
   - Deal ID (e.g., `DEAL-2025-Q4-ACME`)
   - Customer Website URL
   - Fathom Date Window
   - Target Organization
3. Click **"Run & Save Version"**
4. Wait for agent to complete

### **Step 2: Edit Content**

1. Click **"Content Builder"** tab (enabled after version creation)
2. Navigate through the 5 section tabs
3. Edit content in the markdown textarea
4. Each section auto-saves when you switch tabs
5. Use **"Reset"** button to revert to defaults
6. Click **"Save All Sections"** when done

### **Step 3: Export to Gamma**

Two export options:

#### **Option A: Export to Gamma Doc**
```
┌──────────────────────────────┐
│ 📄 Gamma Document            │
│ Comprehensive proposal doc   │
│                              │
│ [Export to Gamma Doc]        │
│                              │
│ ✅ Created [Open]            │
└──────────────────────────────┘
```

#### **Option B: Export to Gamma Deck**
```
┌──────────────────────────────┐
│ ✅ Gamma Presentation        │
│ Executive presentation deck  │
│                              │
│ [Export to Gamma Deck]       │
│                              │
│ ✅ Created [Open]            │
└──────────────────────────────┘
```

---

## 💾 Data Storage

### **Backend Storage Structure**

```typescript
// KV Store Key Format
`proposal-content:${organizationId}:${dealId}:${versionId}`

// Stored Data
{
  dealId: string;
  organizationId: string;
  tenantId: string;
  versionId: string;
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: '# Company Overview\n\n...',
      edited: false
    },
    // ... other sections
  ];
  exports: {
    gammaDocUrl: 'https://gamma.app/docs/...',
    gammaDocCreatedAt: '2025-10-16T...',
    gammaDeckUrl: 'https://gamma.app/decks/...',
    gammaDeckCreatedAt: '2025-10-16T...'
  };
  savedAt: '2025-10-16T14:30:00Z';
  savedBy: 'user-id-123';
}
```

### **Auto-Save Behavior**

- Content is saved when:
  1. User clicks **"Save All Sections"** (manual save)
  2. User switches between section tabs (auto-save)
  3. User exports to Gamma (saves export URLs)

---

## 🔌 Backend Endpoints

### **1. Load Content**
```
GET /make-server-888f4514/proposal-content/load
  ?dealId=DEAL-2025-001
  &organizationId=org-123
  &versionId=version-456

Response:
{
  success: true,
  sections: [...],
  exports: {
    gammaDocUrl: "...",
    gammaDeckUrl: "..."
  }
}
```

### **2. Save Content**
```
POST /make-server-888f4514/proposal-content/save

Body:
{
  dealId: "DEAL-2025-001",
  organizationId: "org-123",
  tenantId: "tenant-789",
  versionId: "version-456",
  sections: [
    {
      id: "overview",
      title: "Overview",
      content: "# Company Overview...",
      edited: true
    },
    ...
  ]
}

Response:
{
  success: true
}
```

### **3. Export to Gamma Doc**
```
POST /make-server-888f4514/proposal-content/export-gamma-doc

Body:
{
  dealId: "DEAL-2025-001",
  organizationId: "org-123",
  tenantId: "tenant-789",
  versionId: "version-456",
  title: "ValueDock Proposal - ACME Corp",
  markdown: "# Overview\n\n..."
}

Response:
{
  success: true,
  gammaUrl: "https://gamma.app/docs/xyz123"
}
```

### **4. Export to Gamma Deck**
```
POST /make-server-888f4514/proposal-content/export-gamma-deck

Body:
{
  dealId: "DEAL-2025-001",
  organizationId: "org-123",
  tenantId: "tenant-789",
  versionId: "version-456",
  title: "ValueDock Presentation - ACME Corp",
  outline: [
    { title: "Overview", content: "..." },
    { title: "Challenges & Goals", content: "..." },
    ...
  ]
}

Response:
{
  success: true,
  gammaUrl: "https://gamma.app/decks/abc789"
}
```

---

## 🎯 Key Features

### **1. Markdown Editing**
- Full markdown support in all sections
- Syntax highlighting (monospace font)
- Character count display
- Large 20-row text areas

### **2. Reset to Defaults**
- Each section has a "Reset" button
- Restores original AI-generated content
- Marks section as unedited

### **3. Edit Tracking**
- Visual indicators (✓ badge) for edited sections
- Timestamp tracking in backend
- Edit history preservation

### **4. Version Integration**
- Content tied to specific proposal versions
- Each version has independent content
- Version switcher synchronization

### **5. Export Status Badges**
- **Idle**: No export yet
- **Loading**: Creating Gamma asset (spinner)
- **Success**: Export complete (✅ with Open button)
- **Error**: Export failed (❌ with error message)

---

## 🔧 Configuration File

### **Location**: `/config/section_prompts.ts`

```typescript
export const sectionPromptsConfig = {
  sections: [
    {
      "id": "overview",
      "title": "Overview",
      "description": "Executive summary and company background",
      "defaultContent": "# Company Overview\n\n...",
      "aiPrompt": "Generate an executive overview...",
      "icon": "FileText"
    },
    ...
  ],
  "exportFormats": {
    "gamma_doc": {
      "title": "ValueDock Proposal - {companyName}",
      "description": "Comprehensive proposal document",
      "sections": ["overview", "challenges", "roi_summary", "solution_summary", "sow"]
    },
    "gamma_deck": {
      "title": "ValueDock Presentation - {companyName}",
      "description": "Executive presentation deck",
      "slides": [
        { "title": "Overview", "content": "overview" },
        ...
      ]
    }
  }
} as const;
```

---

## 📊 Status Indicators

### **Export Button States**

#### **Before Export**
```
[Download] Export to Gamma Doc
```

#### **During Export**
```
[Spinner] Creating...
```

#### **After Success**
```
✅ Created [Open]
```

#### **After Failure**
```
❌ Failed
```

---

## 🎓 User Scenarios

### **Scenario 1: First-Time Setup**

```
1. User runs proposal agent
2. Version 1 created automatically
3. "Content Builder" tab enabled
4. Click tab → See 5 sections with defaults
5. Edit "Challenges & Goals" section
6. Click "Save All Sections"
7. Export to Gamma Doc
8. Click "Open" to view
```

### **Scenario 2: Edit Existing Content**

```
1. Select Version 2 from dropdown
2. Go to "Content Builder" tab
3. Content loads from backend
4. Edit "ROI Summary" with updated numbers
5. Section marked as edited (✓)
6. Save changes
7. Re-export to Gamma Doc (updates existing)
```

### **Scenario 3: Reset and Start Over**

```
1. Open "Solution Summary" tab
2. Content has been heavily customized
3. Click "Reset" button
4. Confirm reset
5. Default AI-generated content restored
6. Edit badge removed
7. Save new content
```

---

## 🔒 Permissions

### **Who Can Access?**

- **Master Admin**: All organizations
- **Tenant Admin**: All orgs in their tenant
- **Org Admin**: Their organization only
- **Regular Users**: Read-only access (future enhancement)

### **Required Permissions**

- Create/edit content: `org_admin` or higher
- Export to Gamma: `org_admin` or higher
- View content: All authenticated users

---

## 🐛 Troubleshooting

### **"Content Builder tab is disabled"**

**Cause**: No proposal version exists  
**Solution**: Run agent first or create a manual version

### **"Failed to save content"**

**Cause**: Network error or missing permissions  
**Solution**: 
1. Check browser console for errors
2. Verify user has org_admin role
3. Refresh page and try again

### **"Failed to create Gamma Doc"**

**Cause**: Gamma API integration not configured  
**Solution**:
1. Check server logs
2. Verify `GAMMA_API_KEY` environment variable
3. Implement actual Gamma API calls (currently placeholders)

### **Content not loading**

**Cause**: Missing deal ID or version ID  
**Solution**:
1. Ensure Deal ID is filled in
2. Create or select a version
3. Check browser network tab for API errors

---

## 🚀 Next Steps & Enhancements

### **Phase 1: Current Implementation** ✅
- [x] Five editable sections
- [x] Auto-save functionality
- [x] Version integration
- [x] Export button UI
- [x] Backend endpoints

### **Phase 2: Gamma Integration** (TODO)
- [ ] Implement actual Gamma API calls
- [ ] Configure API key storage
- [ ] Handle authentication
- [ ] Error recovery

### **Phase 3: AI Generation** (Future)
- [ ] Auto-populate sections from agent data
- [ ] AI-powered content suggestions
- [ ] Smart content merging
- [ ] Template library

### **Phase 4: Collaboration** (Future)
- [ ] Multi-user editing
- [ ] Comment threads
- [ ] Approval workflows
- [ ] Change tracking

---

## 📚 Related Documentation

- [Proposal Agent Runner Guide](/PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md)
- [Version Management System](/PROPOSAL_VERSION_SWITCHER_IMPLEMENTATION.md)
- [Gamma Integration Guide](/GAMMA_INTEGRATION_GUIDE.md)
- [Backend API Documentation](/docs/api-contracts.md)

---

## 🎉 Summary

The **Proposal Content Builder** provides a complete content management system for ValueDock proposals with:

✅ **5 core sections** with AI-driven defaults  
✅ **Markdown editing** for full customization  
✅ **Version control** integration  
✅ **Dual export** to Gamma Doc and Deck  
✅ **Auto-save** with edit tracking  
✅ **Status indicators** for export operations  
✅ **Reset functionality** to restore defaults  
✅ **Backend persistence** in Supabase KV store  

**Status**: ✅ Frontend complete, backend endpoints added (Gamma API integration needed)  
**Location**: Admin → Agent → Proposal Builder → Content Builder tab
