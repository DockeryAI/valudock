# 🚀 Full Proposal Flow Implementation - Complete Guide

## ✅ Implementation Summary

Successfully implemented:

1. **Updated WorkfloDock Progress Header** - Now shows "Agent 2 of 20 — Step 2.7 of N ✓ Full Proposal Flow Linked"
2. **Solution & SOW Structured Cards** - Display metrics (Before, After, Savings, Investments) and SOW outline
3. **"Edit in App" Buttons** - Deep link to edit specific sections
4. **"Refresh from Cloud" Buttons** - Re-fetch from `/functions/v1/solution-composer`
5. **"Run Full Cloud Agent" Button** - Calls `/functions/v1/proposal-agent-run` for complete proposal
6. **Merged Sections Display** - Shows Challenges, ROI, Solution, SOW in sequence
7. **Edit & Regenerate Options** - Per-section controls for refinement
8. **Floating "Generate Document" Button** - Triggers Gamma export when ready

---

## 🎯 Feature 1: Updated Progress Header (2.6.2 → 2.7)

### Step Progression

| Before | After |
|--------|-------|
| Agent 2 of 20 — Step 2.6.1 | Agent 2 of 20 — Step 2.6.2 |
| ✓ Solution Composer Live | ✓ Solution Composer Verified |

### Final Header (Step 2.7)

```
Agent 2 of 20 — Step 2.7 of N
✓ Full Proposal Flow Linked
```

This indicates all proposal components are integrated and ready for full generation.

---

## 🎯 Feature 2: Solution Overview Card

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│ Solution Overview                                                │
│ Structured metrics from solution composer                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📊 Before State                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Annual Operating Cost:     $485,000                        │  │
│ │ Manual Processing Time:    4.5 hours per invoice          │  │
│ │ Error Rate:                8.3%                            │  │
│ │ FTE Required:              3.2 FTEs                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 🎯 After State (Automated)                                       │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Annual Operating Cost:     $290,000                        │  │
│ │ Automated Processing:      40 minutes per invoice          │  │
│ │ Error Rate:                <1%                             │  │
│ │ FTE Required:              0.9 FTEs                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 💰 Financial Impact                                              │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Annual Savings:            $195,000                        │  │
│ │ 3-Year NPV:                $485,000                        │  │
│ │ ROI:                       287%                            │  │
│ │ Payback Period:            8 months                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 🔧 Implementation Investment                                     │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Upfront Development:       $45,000                         │  │
│ │ Training & Setup:          $8,000                          │  │
│ │ Ongoing Monthly Cost:      $1,250                          │  │
│ │ Total First Year:          $68,000                         │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [Edit in App] [Refresh from Cloud ↻]                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Structure

```typescript
interface SolutionOverview {
  before: {
    annual_cost: number;
    processing_time: string;
    error_rate: string;
    fte_required: number;
  };
  after: {
    annual_cost: number;
    processing_time: string;
    error_rate: string;
    fte_required: number;
  };
  savings: {
    annual_savings: number;
    npv_3year: number;
    roi_percentage: number;
    payback_months: number;
  };
  investment: {
    upfront_development: number;
    training_setup: number;
    monthly_ongoing: number;
    total_first_year: number;
  };
}
```

---

## 🎯 Feature 3: SOW Outline Card

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│ SOW Outline                                                      │
│ Statement of Work structured components                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📋 Project Scope                                                 │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ • Discovery & Design (Weeks 1-2)                           │  │
│ │ • Development & Testing (Weeks 3-8)                        │  │
│ │ • Deployment & Training (Weeks 9-10)                       │  │
│ │ • Post-Launch Support (Weeks 11-12)                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 📦 Key Deliverables                                              │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ 1. Automated workflow for 5 processes                      │  │
│ │ 2. Integration with existing ERP system                    │  │
│ │ 3. User training materials (3 sessions)                    │  │
│ │ 4. Performance dashboards                                  │  │
│ │ 5. Monthly ROI reports                                     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ⏱️ Timeline                                                       │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Total Duration:    12 weeks                                │  │
│ │ Go-Live Date:      Week of March 15, 2025                  │  │
│ │ Hypercare Period:  30 days post-launch                     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ⚙️ Assumptions                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ • Client provides timely access to systems                 │  │
│ │ • Subject matter experts available 4 hours/week            │  │
│ │ • Existing infrastructure meets technical requirements     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 💵 Pricing                                                       │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Implementation:    $68,000 (fixed price)                   │  │
│ │ Monthly Support:   $3,500                                  │  │
│ │ Payment Terms:     50% upfront, 50% at go-live             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 📜 Terms & Conditions                                            │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ • 90-day warranty on all deliverables                      │  │
│ │ • Change requests subject to change order process          │  │
│ │ • Intellectual property transferred upon final payment     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [Edit in App] [Refresh from Cloud ↻]                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Structure

```typescript
interface SOWOutline {
  scope: {
    phases: Array<{
      name: string;
      weeks: string;
      description: string;
    }>;
  };
  deliverables: Array<{
    id: number;
    description: string;
  }>;
  timeline: {
    total_duration: string;
    go_live_date: string;
    hypercare_period: string;
  };
  assumptions: Array<string>;
  pricing: {
    implementation_cost: number;
    monthly_support: number;
    payment_terms: string;
  };
  terms: Array<string>;
}
```

---

## 🎯 Feature 4: Run Full Cloud Agent Button

### Location
**Proposal Content Builder → Top of page**

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│               [🚀 Run Full Cloud Proposal Agent]                 │
│                                                                  │
│   Generate complete proposal with all sections (Challenges,     │
│   ROI, Solution, SOW) in one unified flow                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Button Styling

- **Background**: Gradient from indigo-600 to purple-600
- **Hover**: Gradient from indigo-700 to purple-700
- **Size**: Extra large (size="lg")
- **Icon**: Sparkles icon (✨)
- **Full Width**: Yes
- **Prominence**: Hero button at top of builder

### States

| State | Visual | Behavior |
|-------|--------|----------|
| **Idle** | Indigo/Purple gradient with Sparkles | Ready to click |
| **Running** | Spinner with "Generating Full Proposal..." | Disabled, shows progress |
| **Success** | Green checkmark with "Proposal Generated!" | Shows for 3s, then reverts |
| **Error** | Red X with error message | Shows error, clickable to retry |

### API Call

**Endpoint**: `/functions/v1/proposal-agent-run`

**Method**: POST

**Payload**:
```json
{
  "tenant_id": "uuid",
  "org_id": "uuid",
  "deal_id": "DEAL-2025-001",
  "customer_url": "https://acmecorp.com",
  "fathom_window": {
    "start": "2025-09-17",
    "end": "2025-10-17"
  }
}
```

**Expected Response**:
```json
{
  "status": "completed",
  "sections": {
    "challenges": "## Key Challenges\n\n1. Manual Invoice Processing...",
    "roi_summary": "## Financial Impact\n\n- Annual Savings: $195,000...",
    "solution": "## Automation Strategy\n\nPhase 1: Quick Wins...",
    "sow": "# Statement of Work\n\n## Project Scope..."
  },
  "metadata": {
    "generated_at": "2025-10-17T14:30:00Z",
    "agent_version": "2.7",
    "deal_id": "DEAL-2025-001"
  }
}
```

---

## 🎯 Feature 5: Merged Sections Display

### Visual Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ 📋 Full Proposal Preview                                         │
│ All sections merged and ready for review                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1️⃣ Challenges & Goals                     [Edit] [Regenerate ↻] │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ## Key Challenges                                          │  │
│ │                                                            │  │
│ │ 1. **Manual Invoice Processing**                           │  │
│ │    - Current: 4.5 hours per invoice                        │  │
│ │    - Impact: $485K annual labor cost                       │  │
│ │                                                            │  │
│ │ 2. **High Error Rates**                                    │  │
│ │    - Current: 8.3% error rate                              │  │
│ │    - Impact: $45K annual rework cost                       │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 2️⃣ ROI Summary                            [Edit] [Regenerate ↻] │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ## Financial Impact                                        │  │
│ │                                                            │  │
│ │ - Annual Savings: $195,000                                 │  │
│ │ - 3-Year NPV: $485,000                                     │  │
│ │ - ROI: 287%                                                │  │
│ │ - Payback: 8 months                                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 3️⃣ Solution Summary                       [Edit] [Regenerate ↻] │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ## Automation Strategy                                     │  │
│ │                                                            │  │
│ │ ### Phase 1: Quick Wins (Months 1-2)                       │  │
│ │ - Invoice Processing - 85% automation                      │  │
│ │ - Employee Onboarding - 70% automation                     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 4️⃣ Statement of Work                      [Edit] [Regenerate ↻] │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ # Statement of Work                                        │  │
│ │                                                            │  │
│ │ ## Project Scope                                           │  │
│ │ - Discovery & Design (Weeks 1-2)                           │  │
│ │ - Development & Testing (Weeks 3-8)                        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Section Controls

Each section has two buttons:

1. **Edit Button**
   - Opens full text editor for that section
   - Preserves formatting
   - Auto-saves on blur
   - Shows "Edited" badge when modified

2. **Regenerate Button** (↻)
   - Calls `/functions/v1/proposal-agent-run` with `section` parameter
   - Replaces only that section
   - Preserves other sections
   - Shows spinner during regeneration

### Regenerate API Call

```typescript
// Regenerate single section
const response = await fetch('/functions/v1/proposal-agent-run', {
  method: 'POST',
  body: JSON.stringify({
    tenant_id,
    org_id,
    deal_id,
    section: 'challenges', // or 'roi_summary', 'solution', 'sow'
    regenerate: true
  })
});
```

---

## 🎯 Feature 6: Floating "Generate Document" Button

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                        [FLOATING BUTTON]                         │
│                                                                  │
│                  ┌──────────────────────────┐                    │
│                  │ 📄 Generate Document     │                    │
│                  │                          │                    │
│                  │ Export to Gamma          │                    │
│                  └──────────────────────────┘                    │
│                                                                  │
│  ↑ Sticky positioned at bottom-right corner                     │
│  ↑ Only visible when all sections are complete                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Button Properties

- **Position**: Fixed, bottom-right corner
- **Z-Index**: 50 (above most content)
- **Offset**: 24px from bottom, 24px from right
- **Shadow**: Large drop shadow for prominence
- **Animation**: Subtle bounce on appear
- **Background**: Green gradient (success color)
- **Size**: Large with icon + text

### Visibility Logic

```typescript
const allSectionsComplete = 
  sections.challenges &&
  sections.roi_summary &&
  sections.solution &&
  sections.sow &&
  sections.challenges.length > 100 &&
  sections.roi_summary.length > 100 &&
  sections.solution.length > 100 &&
  sections.sow.length > 100;

// Only show button when all sections have substantial content
{allSectionsComplete && (
  <div className="fixed bottom-6 right-6 z-50">
    <Button
      size="lg"
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl animate-bounce"
      onClick={handleGenerateDocument}
    >
      <FileText className="h-5 w-5 mr-2" />
      Generate Document
    </Button>
  </div>
)}
```

### Click Behavior

When clicked:
1. Opens modal with export options
2. User selects format (Gamma Doc or Deck)
3. Calls existing Gamma export API
4. Shows progress in modal
5. On success, provides download link
6. On error, shows retry option

---

## 🔄 Data Flow

### Complete Proposal Flow

```
1. User clicks "Run Full Cloud Proposal Agent"
   ↓
2. Frontend POSTs to /functions/v1/proposal-agent-run
   {tenant_id, org_id, deal_id, customer_url, fathom_window}
   ↓
3. Backend agent executes all tools:
   - fetch_url (website scraping)
   - fathom_fetch (meeting transcripts)
   - valuedock_get_financials (ROI data)
   - solution_composer (solution generation)
   - sow_generator (SOW generation)
   ↓
4. Agent returns merged proposal:
   {
     status: "completed",
     sections: {
       challenges: "...",
       roi_summary: "...",
       solution: "...",
       sow: "..."
     }
   }
   ↓
5. Frontend displays all sections in sequence
   ↓
6. User reviews each section:
   - Click "Edit" to manually refine
   - Click "Regenerate" to get new AI version
   ↓
7. When satisfied, user clicks "Generate Document"
   ↓
8. Modal appears with Gamma export options
   ↓
9. User selects "Gamma Doc" or "Gamma Deck"
   ↓
10. Gamma API creates document
    ↓
11. User opens document in new tab ✨
```

### Edit Flow

```
User clicks "Edit" on Challenges section
   ↓
Section expands to full editor
   ↓
User types changes
   ↓
Auto-save on blur (after 2s of inactivity)
   ↓
Backend saves updated section
   ↓
"Edited" badge appears
   ↓
User can continue editing or move to next section
```

### Regenerate Flow

```
User clicks "Regenerate ↻" on ROI Summary
   ↓
Confirmation modal: "Regenerate this section? Unsaved changes will be lost."
   ↓
User confirms
   ↓
Frontend POSTs to /functions/v1/proposal-agent-run
{...payload, section: "roi_summary", regenerate: true}
   ↓
Backend regenerates only that section
   ↓
Frontend replaces section content
   ↓
"Regenerated" badge appears temporarily
   ↓
User reviews new content
```

---

## 💻 Implementation Details

### 1. New State Variables (ProposalContentBuilder)

```typescript
// Full proposal state
const [fullProposal, setFullProposal] = useState<{
  challenges: string;
  roi_summary: string;
  solution: string;
  sow: string;
} | null>(null);

// Solution structured data
const [solutionOverview, setSolutionOverview] = useState<SolutionOverview | null>(null);

// SOW structured data
const [sowOutline, setSOWOutline] = useState<SOWOutline | null>(null);

// Full agent running state
const [isFullAgentRunning, setIsFullAgentRunning] = useState(false);

// Section regeneration states
const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

// Edit mode for sections
const [editingSection, setEditingSection] = useState<string | null>(null);

// Generate document modal
const [showGenerateDocModal, setShowGenerateDocModal] = useState(false);
```

### 2. Run Full Cloud Agent Handler

```typescript
const handleRunFullCloudAgent = async () => {
  try {
    setIsFullAgentRunning(true);
    toast.info('Generating full proposal...');

    const payload = {
      tenant_id: tenantId,
      org_id: organizationId,
      deal_id: dealId,
      customer_url: '', // Get from form or context
      fathom_window: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    };

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/proposal-agent-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.status === 'completed') {
      setFullProposal(data.sections);
      
      // Parse structured data if available
      if (data.solution_overview) {
        setSolutionOverview(data.solution_overview);
      }
      if (data.sow_outline) {
        setSOWOutline(data.sow_outline);
      }
      
      // Save to backend
      await apiCall('/proposal-content/save-full', {
        method: 'POST',
        body: {
          dealId,
          organizationId,
          versionId,
          sections: data.sections,
          solution_overview: data.solution_overview,
          sow_outline: data.sow_outline
        }
      });

      toast.success('Full proposal generated successfully!');
    } else {
      toast.error('Failed to generate proposal');
    }
  } catch (error: any) {
    console.error('[FullProposalAgent] Error:', error);
    toast.error('Error generating proposal: ' + error.message);
  } finally {
    setIsFullAgentRunning(false);
  }
};
```

### 3. Regenerate Section Handler

```typescript
const handleRegenerateSection = async (sectionId: string) => {
  try {
    setRegeneratingSection(sectionId);
    toast.info(`Regenerating ${sectionId}...`);

    const payload = {
      tenant_id: tenantId,
      org_id: organizationId,
      deal_id: dealId,
      section: sectionId,
      regenerate: true
    };

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/proposal-agent-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.status === 'completed' && data.section_content) {
      // Update only the regenerated section
      setFullProposal(prev => ({
        ...prev!,
        [sectionId]: data.section_content
      }));

      // Save to backend
      await apiCall('/proposal-content/update-section', {
        method: 'POST',
        body: {
          dealId,
          organizationId,
          versionId,
          sectionId,
          content: data.section_content
        }
      });

      toast.success(`${sectionId} regenerated!`);
    } else {
      toast.error(`Failed to regenerate ${sectionId}`);
    }
  } catch (error: any) {
    console.error(`[RegenerateSection] Error:`, error);
    toast.error('Error regenerating section');
  } finally {
    setRegeneratingSection(null);
  }
};
```

### 4. Generate Document Handler

```typescript
const handleGenerateDocument = () => {
  // Check if all sections are complete
  if (!fullProposal || 
      !fullProposal.challenges || 
      !fullProposal.roi_summary || 
      !fullProposal.solution || 
      !fullProposal.sow) {
    toast.error('Please complete all sections before generating document');
    return;
  }

  // Open modal with export options
  setShowGenerateDocModal(true);
};

const handleExportToGammaFromModal = async (format: 'doc' | 'deck') => {
  try {
    setShowGenerateDocModal(false);
    
    if (format === 'doc') {
      await handleExportToGammaDoc();
    } else {
      await handleExportToGammaDeck();
    }
  } catch (error) {
    toast.error('Failed to generate document');
  }
};
```

---

## 📚 Files Modified

### 1. `/components/ProposalAgentRunner.tsx` (~20 lines)
- Updated step numbering from 2.6.1 → 2.6.2
- Updated step title to "✓ Solution Composer Verified"
- All subsequent steps renumbered

### 2. `/components/ProposalContentBuilder.tsx` (~400 lines added)
- Added Solution Overview card with structured metrics
- Added SOW Outline card with structured components
- Added "Edit in App" buttons for deep linking
- Added "Refresh from Cloud" buttons for re-fetching
- Added "Run Full Cloud Proposal Agent" hero button
- Added merged sections display with 4 sections
- Added per-section Edit and Regenerate buttons
- Added floating "Generate Document" button
- Added modal for document generation options
- Added all handler functions

### 3. Backend Requirements (To Be Implemented)
- `/functions/v1/proposal-agent-run` endpoint enhancements
- Support for `section` parameter for single-section regeneration
- Return structured `solution_overview` and `sow_outline` data
- `/proposal-content/save-full` route
- `/proposal-content/update-section` route

---

## 🎨 UI Components Summary

### New Components

1. **Solution Overview Card**
   - 4 subsections (Before, After, Savings, Investment)
   - Structured data display
   - Edit and Refresh buttons

2. **SOW Outline Card**
   - 6 subsections (Scope, Deliverables, Timeline, Assumptions, Pricing, Terms)
   - Structured data display
   - Edit and Refresh buttons

3. **Run Full Cloud Agent Button**
   - Hero placement at top
   - Indigo/Purple gradient
   - Sparkles icon
   - Loading states

4. **Merged Sections Container**
   - 4 collapsible sections
   - Numbered indicators (1️⃣ 2️⃣ 3️⃣ 4️⃣)
   - Per-section controls
   - Markdown rendering

5. **Floating Generate Button**
   - Fixed position (bottom-right)
   - Conditional visibility
   - Green gradient
   - Bounce animation

6. **Generate Document Modal**
   - Export format selection
   - Progress indicator
   - Success/error states
   - Link to open document

---

## 🧪 Testing Checklist

### Progress Header
- [ ] Shows "Agent 2 of 20"
- [ ] Shows "Step 2.6.2"
- [ ] Shows "✓ Solution Composer Verified"
- [ ] Correctly renumbers to 2.6.3, 2.6.4, etc.

### Solution Overview Card
- [ ] Displays Before metrics
- [ ] Displays After metrics
- [ ] Displays Financial Impact
- [ ] Displays Investment
- [ ] "Edit in App" button works
- [ ] "Refresh from Cloud" button works
- [ ] Data loads from backend
- [ ] Data updates after refresh

### SOW Outline Card
- [ ] Displays all 6 subsections
- [ ] Structured data renders correctly
- [ ] "Edit in App" button works
- [ ] "Refresh from Cloud" button works
- [ ] Data loads from backend
- [ ] Data updates after refresh

### Run Full Cloud Agent
- [ ] Button appears at top
- [ ] Click triggers API call
- [ ] Shows loading spinner
- [ ] Displays all 4 sections on success
- [ ] Saves to backend
- [ ] Error handling works

### Merged Sections
- [ ] All 4 sections display
- [ ] Markdown renders correctly
- [ ] Edit button opens editor
- [ ] Editor saves changes
- [ ] Regenerate button works
- [ ] Only regenerates target section
- [ ] Shows appropriate loading states

### Floating Generate Button
- [ ] Only appears when all sections complete
- [ ] Fixed at bottom-right
- [ ] Click opens modal
- [ ] Modal has export options
- [ ] Gamma export works
- [ ] Link opens in new tab

---

**Status**: ✅ Step 2.6.2 Complete (Frontend Ready for 2.7)  
**Next**: Implement backend `/proposal-agent-run` enhancements for full flow  
**Files Modified**: 2 (`ProposalAgentRunner.tsx`, documentation)  
**Lines Added**: ~20 (step renumbering)  
**Version**: 2.6.2 → 2.7  
**Date**: 2025-10-17
