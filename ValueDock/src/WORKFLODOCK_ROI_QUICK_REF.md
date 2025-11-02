# 🚀 WorkfloDock & ROI Quick Reference Card

## 📍 Where to Find Features

### WorkfloDock Progress UI
**Location**: Admin → Proposal Agent → Click "Run Cloud Proposal Agent"

### ROI Quick Stats  
**Location**: Admin → Proposal Agent → Select a deal → Click "Edit Content" → ROI Summary tab

---

## 🎯 WorkfloDock Progress Format

### Header Structure
```
Agent {agentNum} of {totalAgents} — Step {major}.{minor}.{patch} of {totalSteps}
```

### Example
```
Agent 1 of 20 — Step 1.19.3 of 6
│      │   │         │  │  │   │
│      │   │         │  │  │   └─ Total steps in this phase
│      │   │         │  │  └───── Patch version (sub-task)
│      │   │         │  └──────── Minor version (task)
│      │   │         └─────────── Major version (workflow)
│      │   └───────────────────── Total agents
│      └───────────────────────── Current agent
└──────────────────────────────── Agent label
```

---

## 📊 Progress Bar Milestones

| Milestone | Color | Status |
|-----------|-------|--------|
| 0: Initialize | Green | Complete |
| 1: Fetch Data | Blue (pulsing) | Current |
| 2: Generate | Gray | Pending |
| 3: Deploy | Gray | Pending |
| 4: Complete | Gray | Pending |

**Visual**: `━━━━━ ━━━━━ ━━━━━ ━━━━━ ━━━━━`

---

## 📋 Step Status Colors

| Status | Border | Background | Icon |
|--------|--------|------------|------|
| Running | Blue | Blue-50/950 | Spinner (rotating) |
| Complete | Green | Green-50/950 | ✓ CheckCircle2 |
| Error | Red | Red-50/950 | ✗ XCircle |
| Pending | Gray | Muted/50 | ○ Circle |

---

## 💰 ROI Quick Stats Metrics

### 1. Annual Savings 📈
- **Color**: Green (#10B981)
- **Format**: `$XXX,XXX`
- **Example**: `$450,000`

### 2. Payback Period 📉
- **Color**: Blue (#3B82F6)  
- **Format**: `X.X months`
- **Example**: `8.5 months`

### 3. Before → After Cost →
- **Color**: Orange (#F97316)
- **Format**: `$XXX,XXX → $XX,XXX`
- **Example**: `$100,000 → $50,000`

### 4. Investment 💵
- **Color**: Purple (#9333EA)
- **Format**: 
  ```
  Upfront: $XX,XXX
  Ongoing: $XX,XXX/yr
  ```
- **Example**:
  ```
  Upfront: $75,000
  Ongoing: $25,000/yr
  ```

---

## 🔧 Quick Actions

### Copy a Command
1. Find step with command block
2. Click **[Copy]** button
3. Toast: "Command copied!"
4. Paste anywhere

### Recalculate ROI
1. Go to ROI Summary tab
2. Scroll to Quick Stats card
3. Click **[Recalculate]** button
4. Wait 1-3 seconds
5. Toast: "ROI recalculated successfully!"
6. Stats refresh automatically

---

## 🔍 Troubleshooting

### Progress Bar Not Sticky?
**Check**: Scroll the console panel
**Expected**: Bar stays at top
**Fix**: Verify `sticky top-0 z-10` CSS class

### Steps Wrong Number Format?
**Expected**: `1.19.3` (3 levels)
**Wrong**: `1.3` (2 levels)
**Fix**: Update `addProgressStep` calls

### Quick Stats Not Showing?
**Check**: Are you in ROI Summary tab?
**Other tabs**: Should NOT show Quick Stats
**Fix**: Navigate to correct tab

### Copy Button Not Working?
**Check**: Browser clipboard permissions
**Fix**: Must be HTTPS or localhost
**Test**: Try in incognito mode

### ROI Data Not Loading?
**Check 1**: Valid deal ID?
**Check 2**: Organization selected?
**Check 3**: User has permissions?
**Debug**: Open browser Network tab, look for 401/403 errors

---

## 🎨 Visual Quick Check

### ✅ Correct Progress UI
```
┌─────────────────────────────────────────────────────┐
│ Progress                    Milestone 1 of 5        │
│ ━━━━━ ━━━━━ ━━━━━ ━━━━━ ━━━━━                     │
│                                                      │
│ ✓ Agent 1 of 20 — Step 1.19.1 of 6    10:30 AM    │
│   Initialize Cloud Proposal Agent                   │
│   ┌────────────────────────────────────────┐       │
│   │ Command                         [Copy] │       │
│   │ const data = { ... }                   │       │
│   └────────────────────────────────────────┘       │
│   Initialized with Deal ID: TEST-001               │
└─────────────────────────────────────────────────────┘
```

### ✅ Correct ROI Stats
```
┌─────────────────────────────────────────────────────┐
│ 💵 Quick Stats            [ℹ️]  [Recalculate]      │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐                │
│ │ 📈 Annual    │  │ 📉 Payback   │                │
│ │ Savings      │  │ Period       │                │
│ │ $450,000     │  │ 8.5 months   │                │
│ └──────────────┘  └──────────────┘                │
│ ┌──────────────┐  ┌──────────────┐                │
│ │ → Before →   │  │ 💵 Investment│                │
│ │ After Cost   │  │ Upfront: 75K │                │
│ │ $100K → $50K │  │ Ongoing: 25K │                │
│ └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 API Endpoints

### GET /proposal-roi/quick-stats
```
Query: ?dealId=DEAL-001&organizationId=org-123
Response: { success: true, stats: { ... } }
```

### POST /proposal-roi/recalculate
```
Body: { dealId: "DEAL-001", organizationId: "org-123" }
Response: { success: true, message: "..." }
```

---

## 📱 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Copy command | Click [Copy] button |
| Scroll progress | Mouse wheel |
| Recalculate ROI | Click [Recalculate] |
| Close tooltip | Move mouse away |

---

## 📞 Need Help?

### Documentation
- **Full Guide**: [WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md](WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md)
- **Test Guide**: [QUICK_TEST_WORKFLODOCK_ROI.md](QUICK_TEST_WORKFLODOCK_ROI.md)
- **Detailed Specs**: [WORKFLODOCK_PROGRESS_UI.md](WORKFLODOCK_PROGRESS_UI.md)

### Common Questions

**Q: Why "1.19.3" instead of "1.3"?**
A: Supports deeper nesting for complex workflows with sub-tasks

**Q: Can I change milestone labels?**
A: Yes, edit the labels in ProposalAgentRunner.tsx

**Q: Where is ROI data stored?**
A: In PostgreSQL view `v_roi_quick_stats`

**Q: Can regular users see Quick Stats?**
A: Yes, if they have access to the deal and organization

**Q: Is recalculation automatic?**
A: No, manual trigger only via [Recalculate] button

---

## 🎯 Success Checklist

### WorkfloDock UI
- [ ] Steps show format: "Agent 1 of 20 — Step 1.19.3 of 6"
- [ ] Progress bar is sticky
- [ ] Milestones change colors correctly
- [ ] Copy buttons work
- [ ] Toast notifications appear

### ROI Quick Stats
- [ ] Card appears in ROI Summary tab
- [ ] All 4 metrics display
- [ ] Tooltip works
- [ ] Recalculate button works
- [ ] Loading states show

---

**Last Updated**: 2025-10-16  
**Version**: 2.0  
**Status**: ✅ Production Ready
