# 📦 Export (Gamma or Storage) - Complete Implementation

## ✅ Overview

Updated the Presentation Builder export feature to support both Gamma (live) and cloud storage modes with intelligent button labeling based on the backend response.

---

## 🎯 Key Changes

### 1. Button Label
**Changed from**: "Export to Gamma"  
**Changed to**: "Export (Gamma or Storage)"

**Reason**: Accurately reflects dual-mode capability

---

### 2. Mode-Aware UI

The UI adapts based on the `mode` field in the response:

| Mode | Document Button | Deck Button | Footer Message |
|------|----------------|-------------|----------------|
| `"live"` | Open in Gamma | Open in Gamma | URLs saved to proposal version |
| `"storage"` (or any other) | Open Proposal (Markdown) | Open Deck Outline (JSON) | Export files saved to storage |

---

## 📊 Response Contract

### Expected Response Format

```typescript
{
  status: 'completed',
  steps?: {
    fathom?: 'ok' | 'error' | 'skipped',
    proposal?: 'completed' | 'error',
    gamma?: 'ok' | 'error' | 'skipped'
  },
  final_output?: string,
  export_links: {
    doc: string,
    deck: string
  },
  mode?: 'live' | 'storage' | string
}
```

### Example: Storage Mode

```json
{
  "status": "completed",
  "steps": {
    "fathom": "ok",
    "proposal": "completed",
    "gamma": "ok"
  },
  "final_output": "Executive Summary — ValuDock Proposal for Acme Corporation. This comprehensive automation solution delivers...",
  "export_links": {
    "doc": "https://supabase-project.storage.co/proposal-12345.md?token=xyz",
    "deck": "https://supabase-project.storage.co/deck-outline-12345.json?token=abc"
  },
  "mode": "storage"
}
```

### Example: Live Mode

```json
{
  "status": "completed",
  "steps": {
    "fathom": "ok",
    "proposal": "completed",
    "gamma": "ok"
  },
  "final_output": "Executive Summary — ValuDock Proposal for Acme Corporation. This comprehensive automation solution delivers...",
  "export_links": {
    "doc": "https://gamma.app/docs/acme-corp-proposal-xyz123",
    "deck": "https://gamma.app/decks/acme-corp-presentation-abc456"
  },
  "mode": "live"
}
```

---

## 🎨 Visual Design

### Main Button

```tsx
<Button 
  onClick={handleExportToGamma}
  disabled={isExportingToGamma}
  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
>
  {isExportingToGamma ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Exporting...
    </>
  ) : (
    <>
      <Sparkles className="h-4 w-4 mr-2" />
      Export (Gamma or Storage)
    </>
  )}
</Button>
```

**Styling**:
- Purple-to-blue gradient background
- Full width
- Sparkles icon
- Loading state with spinner

---

### Success Card - Storage Mode

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Export Successful!                                   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Preview: Executive Summary — ValuDock Proposal...│    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📄 Proposal (Markdown)                          │    │
│ │                                                 │    │
│ │    [Open Proposal (Markdown) ↗]                │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📊 Deck Outline (JSON)                          │    │
│ │                                                 │    │
│ │    [Open Deck Outline (JSON) ↗]                │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ [Fathom: ok] [Proposal: completed] [Gamma: ok]         │
│                                                         │
│ Export files have been saved to storage                 │
└─────────────────────────────────────────────────────────┘
```

---

### Success Card - Live Mode

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Export Successful!                                   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Preview: Executive Summary — ValuDock Proposal...│    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📄 Gamma Document                               │    │
│ │                                                 │    │
│ │    [Open in Gamma ↗]                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📊 Gamma Presentation                           │    │
│ │                                                 │    │
│ │    [Open in Gamma ↗]                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ [Fathom: ok] [Proposal: completed] [Gamma: ok]         │
│                                                         │
│ URLs have been saved to this proposal version          │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Code Implementation

### State Interface

```typescript
const [gammaExportResult, setGammaExportResult] = useState<{
  status: string;
  steps?: { fathom?: string; proposal?: string; gamma?: string };
  final_output?: string;
  export_links?: {
    doc: string;
    deck: string;
  };
  mode?: string;
} | null>(null);
```

---

### Handler Function

```typescript
const handleExportToGamma = async () => {
  try {
    setIsExportingToGamma(true);
    toast.info('Exporting...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    const tenantId = user.user_metadata?.tenant_id || 'default-tenant';
    const orgId = user.user_metadata?.organization_id || 'default-org';
    const dealId = `DEAL-${Date.now()}`;
    const title = presentationData.executiveSummary.companyWebsite || 'ValuDock Proposal';
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/gamma-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        org_id: orgId,
        deal_id: dealId,
        title
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'completed') {
      setGammaExportResult({
        status: data.status,
        steps: data.steps,
        final_output: data.final_output,
        export_links: data.export_links,
        mode: data.mode
      });
      
      // Save URLs if available
      if (data.export_links?.doc && data.export_links?.deck) {
        // ... save logic
      }
      
      const exportType = data.mode === 'live' ? 'Gamma' : 'Storage';
      toast.success(`Export to ${exportType} completed successfully!`);
    } else {
      toast.error('Failed to export');
    }
  } catch (error: any) {
    toast.error('Error exporting: ' + error.message);
  } finally {
    setIsExportingToGamma(false);
  }
};
```

---

### Success Card Rendering

```tsx
{gammaExportResult && gammaExportResult.export_links && (
  <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-green-600" />
      <p className="font-medium text-green-900 dark:text-green-100">Export Successful!</p>
    </div>
    
    {/* Preview */}
    {gammaExportResult.final_output && (
      <div className="p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
        <p className="text-sm">{gammaExportResult.final_output.substring(0, 150)}...</p>
      </div>
    )}
    
    {/* Document Link */}
    <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium">
          {gammaExportResult.mode === 'live' ? 'Gamma Document' : 'Proposal (Markdown)'}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(gammaExportResult.export_links!.doc, '_blank')}
      >
        <Eye className="h-4 w-4 mr-2" />
        {gammaExportResult.mode === 'live' ? 'Open in Gamma' : 'Open Proposal (Markdown)'}
      </Button>
    </div>
    
    {/* Deck Link */}
    <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
      <div className="flex items-center gap-2">
        <FileCheck className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium">
          {gammaExportResult.mode === 'live' ? 'Gamma Presentation' : 'Deck Outline (JSON)'}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(gammaExportResult.export_links!.deck, '_blank')}
      >
        <Eye className="h-4 w-4 mr-2" />
        {gammaExportResult.mode === 'live' ? 'Open in Gamma' : 'Open Deck Outline (JSON)'}
      </Button>
    </div>
    
    {/* Step Status Badges */}
    {gammaExportResult.steps && (
      <div className="flex gap-2 text-xs">
        {gammaExportResult.steps.fathom && (
          <Badge variant="outline" className="bg-white dark:bg-green-900">
            Fathom: {gammaExportResult.steps.fathom}
          </Badge>
        )}
        {gammaExportResult.steps.proposal && (
          <Badge variant="outline" className="bg-white dark:bg-green-900">
            Proposal: {gammaExportResult.steps.proposal}
          </Badge>
        )}
        {gammaExportResult.steps.gamma && (
          <Badge variant="outline" className="bg-white dark:bg-green-900">
            Gamma: {gammaExportResult.steps.gamma}
          </Badge>
        )}
      </div>
    )}
    
    {/* Footer Message */}
    <p className="text-xs text-muted-foreground">
      {gammaExportResult.mode === 'live' 
        ? 'URLs have been saved to this proposal version' 
        : 'Export files have been saved to storage'}
    </p>
  </div>
)}
```

---

## 🧪 Testing Guide

### Test Scenario 1: Storage Mode Export

1. Click "Export (Gamma or Storage)"
2. Backend returns `mode: "storage"`
3. **Expected Results**:
   - ✅ Success card appears
   - ✅ Preview shows first 150 chars
   - ✅ Document button: "Open Proposal (Markdown)"
   - ✅ Deck button: "Open Deck Outline (JSON)"
   - ✅ Step badges show status
   - ✅ Footer: "Export files have been saved to storage"
   - ✅ Toast: "Export to Storage completed successfully!"

---

### Test Scenario 2: Live Mode Export

1. Click "Export (Gamma or Storage)"
2. Backend returns `mode: "live"`
3. **Expected Results**:
   - ✅ Success card appears
   - ✅ Preview shows first 150 chars
   - ✅ Document button: "Open in Gamma"
   - ✅ Deck button: "Open in Gamma"
   - ✅ Step badges show status
   - ✅ Footer: "URLs have been saved to this proposal version"
   - ✅ Toast: "Export to Gamma completed successfully!"

---

### Test Scenario 3: Partial Response

1. Backend returns minimal response (no steps, no final_output)
2. **Expected Results**:
   - ✅ Success card still appears
   - ✅ Preview section hidden
   - ✅ Buttons still work
   - ✅ Step badges hidden
   - ✅ Footer message defaults to storage mode

---

### Test Scenario 4: Error Handling

1. Backend returns error or network fails
2. **Expected Results**:
   - ✅ Error toast appears
   - ✅ Button returns to idle state
   - ✅ No success card shown
   - ✅ User can retry

---

## 📝 Backend Implementation Notes

### Required Fields

**Minimum**:
```json
{
  "status": "completed",
  "export_links": {
    "doc": "https://...",
    "deck": "https://..."
  }
}
```

**Recommended**:
```json
{
  "status": "completed",
  "steps": {
    "fathom": "ok",
    "proposal": "completed",
    "gamma": "ok"
  },
  "final_output": "Executive Summary...",
  "export_links": {
    "doc": "https://...",
    "deck": "https://..."
  },
  "mode": "live"
}
```

---

### Mode Detection Logic

```typescript
// Frontend logic
const isLiveMode = data.mode === 'live';
const buttonLabel = isLiveMode ? 'Open in Gamma' : 'Open Proposal (Markdown)';
const footerMessage = isLiveMode 
  ? 'URLs have been saved to this proposal version'
  : 'Export files have been saved to storage';
```

---

## 🎁 User Benefits

### 1. Clear Expectations
- Users know exactly what they're opening
- "Markdown" and "JSON" indicate file types
- "Gamma" indicates live Gamma app

### 2. Transparency
- Step status shows what was processed
- Preview confirms content quality
- Mode-specific messages set expectations

### 3. Flexibility
- Works with both Gamma and storage
- Same UI for both modes
- Graceful degradation if fields missing

### 4. Professional UX
- Consistent styling
- Predictable behavior
- Clear error messages

---

## 📚 Related Documentation

- [GAMMA_EXPORT_IMPLEMENTATION.md](GAMMA_EXPORT_IMPLEMENTATION.md) - Full technical guide
- [GAMMA_EXPORT_UPDATE_SUMMARY.md](GAMMA_EXPORT_UPDATE_SUMMARY.md) - Change summary
- [GAMMA_EXPORT_VISUAL_GUIDE.md](GAMMA_EXPORT_VISUAL_GUIDE.md) - Visual examples
- [GAMMA_EXPORT_QUICK_REF.md](GAMMA_EXPORT_QUICK_REF.md) - Quick reference

---

## ✅ Checklist

- [x] Button label updated to "Export (Gamma or Storage)"
- [x] State interface supports new response format
- [x] Handler extracts mode from response
- [x] UI conditionally renders based on mode
- [x] Preview displays first 150 characters
- [x] Step status badges render
- [x] Footer message adapts to mode
- [x] Toast notification adapts to mode
- [x] Links open in new tab
- [x] Error handling implemented
- [x] Documentation created

---

**Status**: ✅ Complete  
**Date**: 2025-10-17  
**Version**: 2.0  
**Files Modified**: 1 (PresentationScreen.tsx)  
**Lines Changed**: ~50
