# 🚀 Process Complexity Metrics - Quick Start Guide

## What is this?

Capture complexity data to calculate implementation risk for your CFO Score. Two modes available:

---

## Option 1: Manual Entry (Quick Estimates)

### Step 1: Open Process Complexity
1. Go to **Inputs** tab
2. Click **Advanced Metrics** button on any process
3. Click **Process Complexity** tab (purple theme)

### Step 2: Enter Counts
- **Auto-Gather**: Keep it **OFF** (default)
- **Inputs Count**: How many systems/APIs feed this workflow? (e.g., 5)
- **Steps Count**: How many tasks in the process? (e.g., 12)
- **Dependencies Count**: How many teams involved? (e.g., 3)

> System auto-normalizes to 0-10 scores using enterprise thresholds

### Step 3: Add Risk Factors
1. Go to **Implementation** tab
2. Scroll to **Implementation Risk Factors**
3. Enter:
   - **Technology Novelty (1-10)**: How new is the tech?
     - 1 = Familiar tools (Excel, email)
     - 10 = Cutting-edge AI/blockchain
   - **Change Scope (1-10)**: How big is the change?
     - 1 = Minor process tweak
     - 10 = Company-wide transformation

### Step 4: Review Overall Score
- Return to **Advanced Metrics → Process Complexity**
- See **Overall Complexity Score** at bottom
- Score feeds into CFO Risk calculation

---

## Option 2: Auto-Gather (Precise from Workflow)

### Step 1: Enable Auto-Gather
1. Go to **Advanced Metrics → Process Complexity**
2. Toggle **Auto-Gather from Workflow Editor**: **ON**
3. Notice fields become disabled (will auto-populate)

### Step 2: Build Your Workflow
1. Click **Workflow** button next to the process
2. Design your workflow with drag-and-drop nodes

### Step 3: Mark Input Nodes
For each node that receives data from external systems:
1. Click the node
2. In properties panel, scroll to **Complexity Tracking** (purple section)
3. Check ✓ **Mark as Input Node**

Examples:
- "Receive Invoice" ← Email system
- "Pull Customer Data" ← CRM API
- "Get Approval" ← Approval platform

### Step 4: Assign Teams
For each node:
1. Click the node
2. In **Complexity Tracking** section
3. Select **Responsible Team** from dropdown:
   - Marketing, Sales, Operations, Finance
   - IT, DevOps, HR, Customer Success
   - Product, Engineering, Legal, Compliance

### Step 5: Auto-Calculation
- System counts automatically:
  - **Inputs**: Nodes marked as input
  - **Steps**: All non-start/end nodes
  - **Dependencies**: Unique teams assigned
- Scores update in real-time
- Return to **Advanced Metrics** to see results

### Step 6: Add Manual Risk Factors
- Still need to manually enter in **Implementation** tab:
  - Technology Novelty (1-10)
  - Change Scope (1-10)

---

## 📊 Understanding the Scores

### Normalization Thresholds

**Inputs Score:**
```
0-2 inputs  → Low (1-3)
3-5 inputs  → Medium (4-6)
6+ inputs   → High (7-10)
```

**Steps Score:**
```
1-5 steps   → Low (1-3)
6-15 steps  → Medium (4-6)
16+ steps   → High (7-10)
```

**Dependencies Score:**
```
0-1 team    → Low (1-3)
2-3 teams   → Medium (4-6)
4+ teams    → High (7-10)
```

### Overall Complexity Score
```
Score = (Inputs + Steps + Dependencies + Tech Novelty + Change Scope) / 5
```

All factors weighted equally at 20% each.

---

## 💡 When to Use Which Mode

### Use Manual Entry When:
- ✅ Quick rough estimate needed
- ✅ Workflow not yet designed
- ✅ Process is simple (< 5 steps)
- ✅ Just need ballpark numbers

### Use Auto-Gather When:
- ✅ Detailed workflow built
- ✅ Need precise metrics
- ✅ Complex multi-team process
- ✅ Want real-time updates

### Hybrid Approach:
1. Start with auto-gather from workflow
2. Fine-tune counts manually if needed
3. Toggle between modes to compare

---

## 🎯 Examples

### Example 1: Simple Process (Manual)
**Process**: Monthly expense report approval

**Inputs**: 
- Expense system
- Accounting software
= **2 inputs** → Score: 2.0

**Steps**:
- Submit, Review, Approve, Export
= **4 steps** → Score: 2.3

**Dependencies**:
- Finance team only
= **1 team** → Score: 3.0

**Risk Factors**:
- Tech Novelty: 2 (familiar tools)
- Change Scope: 3 (minor change)

**Overall Score**: (2.0 + 2.3 + 3.0 + 2 + 3) / 5 = **2.5/10** (Low Risk)

### Example 2: Complex Process (Auto-Gather)
**Process**: New customer onboarding automation

**Build workflow with**:
- 18 task nodes
- 6 marked as inputs (CRM, payment, KYC, contracts, email, slack)
- 5 teams assigned (Sales, Legal, Finance, IT, Customer Success)

**Auto-calculates**:
- Inputs: 6 → Score: 7.0
- Steps: 18 → Score: 7.7
- Dependencies: 5 → Score: 8.0

**Add manually**:
- Tech Novelty: 8 (new AI integration)
- Change Scope: 7 (major process overhaul)

**Overall Score**: (7.0 + 7.7 + 8.0 + 8 + 7) / 5 = **7.5/10** (High Risk)

---

## 🔍 Troubleshooting

### "Auto-gather not working"
- ✅ Check toggle is ON in Advanced Metrics
- ✅ Make sure you saved the workflow
- ✅ Verify nodes have teams assigned
- ✅ Check nodes are marked as inputs

### "Scores seem wrong"
- ✅ Review normalization thresholds above
- ✅ Verify input counts are correct
- ✅ Check all teams are unique (IT + IT = 1, not 2)
- ✅ Remember: start/end nodes don't count as steps

### "Can't edit fields"
- ✅ If auto-gather is ON, fields are disabled
- ✅ Toggle OFF to manually edit
- ✅ Toggling back ON will restore workflow values

---

## 📈 What Happens Next?

Your complexity metrics feed into:

1. **CFO Risk Score** calculation
2. **Opportunity Matrix** positioning
3. **Implementation planning** estimates
4. **ROI projections** adjustments

Higher complexity = Higher risk = Lower CFO Score

Use this to:
- Prioritize simpler processes first
- Plan extra resources for complex ones
- Justify longer timelines
- Identify de-scoping opportunities

---

## 🎓 Pro Tips

1. **Start simple**: Get basics working, add detail later
2. **Be realistic**: Don't underestimate complexity
3. **Update regularly**: Complexity changes as you learn
4. **Compare processes**: See relative complexity across portfolio
5. **Use for scoping**: Break complex processes into phases

---

## 📞 Need Help?

- See full documentation: `/COMPLEXITY_METRICS_IMPLEMENTATION_COMPLETE.md`
- Check workflow guide: `/components/workflow-module/README.md`
- Review CFO score methodology: `/docs/cfo-score-methodology.md`

---

**Happy Complexity Tracking! 🎉**
