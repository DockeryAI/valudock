# 🚀 Proposal Run Log - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. View the Run Log

Navigate to **Proposal Builder** tab. The Run Log panel appears on the right side (desktop) or below (mobile).

```
Proposal Builder → [Run Log Panel visible on right]
```

---

### 2. Add Your First Log Entry

**Using cURL**:
```bash
curl -X POST \
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-888f4514/proposal-logs' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "runId": "test-run-001",
    "phase": "Discovery",
    "step": "Test Step",
    "status": "running"
  }'
```

**Using JavaScript**:
```typescript
await fetch('/functions/v1/make-server-888f4514/proposal-logs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    runId: 'test-run-001',
    phase: 'Discovery',
    step: 'Test Step',
    status: 'running'
  })
});
```

---

### 3. Complete the Log Entry

```typescript
await fetch('/functions/v1/make-server-888f4514/proposal-logs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    runId: 'test-run-001',
    phase: 'Discovery',
    step: 'Test Step',
    status: 'completed',
    duration: 2300,
    notes: 'Successfully completed test step'
  })
});
```

---

### 4. Watch the Progress

The Run Log will:
- ✅ Auto-refresh every 5 seconds
- ✅ Update progress bar
- ✅ Show status changes
- ✅ Display duration

---

## 📊 Quick API Reference

### POST a Log

**Endpoint**: `/make-server-888f4514/proposal-logs`

**Required Fields**:
- `runId` - Unique run identifier
- `phase` - Discovery | ROI | Solution | Export
- `step` - Step description
- `status` - pending | running | completed | error

**Optional Fields**:
- `duration` - Time in milliseconds
- `notes` - Additional information
- `tenantId`, `orgId`, `dealId` - Context IDs

---

### GET Logs

**Endpoint**: `/make-server-888f4514/proposal-logs`

**Query Params**:
```
?run_id=test-run-001
?deal_id=deal-456
?org_id=org-789
?tenant_id=tenant-001
```

**Response**:
```json
{
  "success": true,
  "logs": [...],
  "count": 5
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Track Agent Execution

```typescript
// 1. Start agent
await logEntry('Discovery', 'Starting Agent', 'running');

// 2. Fetch data
await logEntry('Discovery', 'Fetch Fathom', 'running');
await fetchFathom();
await logEntry('Discovery', 'Fetch Fathom', 'completed', 2300);

// 3. Calculate ROI
await logEntry('ROI', 'Calculate Stats', 'running');
await calculateROI();
await logEntry('ROI', 'Calculate Stats', 'completed', 1500);

// 4. Generate solution
await logEntry('Solution', 'Generate Summary', 'running');
await generateSolution();
await logEntry('Solution', 'Generate Summary', 'completed', 3200);

// 5. Export
await logEntry('Export', 'Export to Gamma', 'running');
await exportToGamma();
await logEntry('Export', 'Export to Gamma', 'completed', 1800);
```

---

### Use Case 2: Handle Errors

```typescript
try {
  await logEntry('ROI', 'Calculate Stats', 'running');
  await calculateROI();
  await logEntry('ROI', 'Calculate Stats', 'completed', 1500);
} catch (error) {
  await logEntry('ROI', 'Calculate Stats', 'error', 800, error.message);
}
```

---

### Use Case 3: Track Long Operations

```typescript
const startTime = Date.now();

await logEntry('Solution', 'Generate Solution', 'running');

// Long operation...
await generateComprehensiveSolution();

const duration = Date.now() - startTime;
await logEntry('Solution', 'Generate Solution', 'completed', duration, 
  `Generated 5 sections in ${(duration/1000).toFixed(1)}s`
);
```

---

## 🔧 Integration Example

### Full Agent Runner Integration

```typescript
async function runProposalAgent(dealId: string, orgId: string) {
  const runId = `run-${Date.now()}`;
  
  try {
    // Phase 1: Discovery
    await logEntry(runId, 'Discovery', 'Initializing', 'running', orgId, dealId);
    
    await logEntry(runId, 'Discovery', 'Fetch Fathom Meetings', 'running', orgId, dealId);
    const meetings = await fetchFathomMeetings();
    await logEntry(runId, 'Discovery', 'Fetch Fathom Meetings', 'completed', 
      2300, orgId, dealId, `Found ${meetings.length} meetings`);
    
    await logEntry(runId, 'Discovery', 'Extract Challenges', 'running', orgId, dealId);
    const challenges = await extractChallenges(meetings);
    await logEntry(runId, 'Discovery', 'Extract Challenges', 'completed', 
      1800, orgId, dealId, `Extracted ${challenges.length} challenges`);
    
    // Phase 2: ROI
    await logEntry(runId, 'ROI', 'Calculate ROI Stats', 'running', orgId, dealId);
    const roiStats = await calculateROI();
    await logEntry(runId, 'ROI', 'Calculate ROI Stats', 'completed', 
      1500, orgId, dealId, `ROI: ${roiStats.roi}%`);
    
    // Phase 3: Solution
    await logEntry(runId, 'Solution', 'Generate Solution', 'running', orgId, dealId);
    const solution = await generateSolution();
    await logEntry(runId, 'Solution', 'Generate Solution', 'completed', 
      3200, orgId, dealId, 'Solution generated successfully');
    
    // Phase 4: Export
    await logEntry(runId, 'Export', 'Export to Gamma', 'running', orgId, dealId);
    const exportResult = await exportToGamma();
    await logEntry(runId, 'Export', 'Export to Gamma', 'completed', 
      1800, orgId, dealId, `Exported to ${exportResult.url}`);
    
    return { success: true, runId };
  } catch (error) {
    await logEntry(runId, getCurrentPhase(), 'Error occurred', 'error', 
      0, orgId, dealId, error.message);
    throw error;
  }
}

// Helper function
async function logEntry(
  runId: string, 
  phase: string, 
  step: string, 
  status: string,
  orgId?: string,
  dealId?: string,
  notes?: string
) {
  const startTime = performance.now();
  
  await fetch('/functions/v1/make-server-888f4514/proposal-logs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      runId,
      phase,
      step,
      status,
      duration: status === 'completed' ? Date.now() - startTime : undefined,
      notes,
      orgId,
      dealId
    })
  });
}
```

---

## 🎨 UI Features

### Auto-Refresh Toggle
```
Footer: [✓] Auto-refresh (every 5 seconds)
```
- ✅ Enabled by default
- Click checkbox to toggle
- Saves battery when disabled

---

### Manual Refresh
```
Header: [⟳] Refresh button
```
- Click anytime to force refresh
- Shows spinner while loading
- Updates all log entries

---

### Run ID Filter
```
Filter: 🔍 [Filter by Run ID...]
```
- Type to filter logs
- Shows only matching entries
- Clears easily

---

### Progress Bar
```
Discovery → ROI → Solution → Export
[▓▓▓▓▓░░░░░░░░░░░]
```
- Shows current phase
- Visual progress indicator
- Updates in real-time

---

## 📱 Mobile Experience

On mobile devices:
- Run Log appears **below** main content
- Full-width layout
- Touch-optimized buttons
- Scrollable log area
- Same functionality

---

## 🐛 Troubleshooting

### Logs not appearing?
1. Check authorization token
2. Verify runId matches
3. Click refresh button
4. Check browser console

### Auto-refresh not working?
1. Check checkbox is enabled
2. Verify component is mounted
3. Check for JavaScript errors
4. Try manual refresh

### Wrong phase showing?
1. Ensure phase is spelled correctly
2. Must be: Discovery, ROI, Solution, or Export
3. Check most recent log entry
4. Verify log timestamp

---

## ✅ Quick Checklist

- [ ] Navigate to Proposal Builder
- [ ] Verify Run Log panel is visible
- [ ] Try adding a test log entry
- [ ] Watch progress bar update
- [ ] Test auto-refresh toggle
- [ ] Try filtering by run ID
- [ ] Verify logs display correctly
- [ ] Check mobile layout

---

## 📚 Next Steps

1. **Read Full Documentation**: [PROPOSAL_RUN_LOG_IMPLEMENTATION.md](PROPOSAL_RUN_LOG_IMPLEMENTATION.md)
2. **See Visual Guide**: [PROPOSAL_RUN_LOG_VISUAL_GUIDE.md](PROPOSAL_RUN_LOG_VISUAL_GUIDE.md)
3. **Integrate with Agent**: Update your agent runner to log all steps
4. **Test Error Handling**: Verify error logs appear correctly
5. **Customize Duration Format**: Adjust display format as needed

---

**Quick Start Complete!** 🎉

You now have a working Run Log system tracking all proposal workflow phases.
