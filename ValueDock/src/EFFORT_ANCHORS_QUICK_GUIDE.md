# Effort Anchors - Quick Visual Guide

## 🎯 What Are Effort Anchors?

Effort Anchors are **fixed benchmarks** that determine what counts as "moderate effort" in your organization.

---

## 📊 The Two Anchors

### 💰 Cost Target
**Default: $100,000**

"How much does a typical medium-sized project cost?"

```
$30K project  →  30% cost score  →  Below average cost
$100K project →  100% cost score →  Average cost
$200K project →  200% cost score →  Above average cost (capped at 120%)
```

### ⏱️ Time Target
**Default: 6 months**

"How long does a typical medium-sized project take?"

```
3 month project  →  50% time score  →  Faster than average
6 month project  →  100% time score →  Average timeline
12 month project →  200% time score →  Slower than average (capped at 120%)
```

---

## 🧮 The Formula

```
Implementation Effort = 
  50% × (Your Cost / Cost Target) +
  30% × (Your Time / Time Target) +
  20% × (Complexity / 10)
```

### Why These Weights?

- **Cost (50%)** - Biggest driver of effort (budget approval, funding)
- **Time (30%)** - Significant but flexible (can compress/extend)
- **Complexity (20%)** - Fixed by workflow design

---

## 🎨 Quadrant Impact

### The 40% Magic Number

```
Effort ≤ 40% = "Low Burden"  → Quick Win or Nice to Have
Effort > 40% = "High Burden" → Growth Engine or Deprioritize
```

### Visual Matrix

```
         Low Effort (≤40%)     High Effort (>40%)
High ROI  🟩 Quick Wins        🟦 Growth Engines
Low ROI   🟨 Nice to Have      🟥 Deprioritize
```

---

## 🔧 How to Adjust Anchors

### Access the Settings

1. Go to **Settings** (gear icon)
2. Click **Admin** tab
3. Click **Costs** sub-tab
4. Find **Effort Anchors** card at top

### Make Changes

1. Edit **Cost Target** field
2. Edit **Time Target** field
3. Click **Save Anchors**
4. ✅ All projects recalculate instantly!

---

## 💡 When to Adjust

### Raise Cost Target If...

❌ All projects are showing >60% effort scores  
❌ Quick Wins quadrant is empty  
❌ Your budgets are typically larger than $100K  

✅ Set to your **average project cost**

### Lower Cost Target If...

❌ All projects are showing <30% effort scores  
❌ Growth Engines quadrant is empty  
❌ Your budgets are typically smaller than $100K  

✅ Set to your **average project cost**

### Raise Time Target If...

❌ Your org has long approval/implementation cycles  
❌ Most projects take 9-18 months  
❌ Enterprise environment with many stakeholders  

✅ Set to your **average project duration**

### Lower Time Target If...

❌ Your org is fast-moving (startup, agile)  
❌ Most projects take 1-3 months  
❌ You have streamlined processes  

✅ Set to your **average project duration**

---

## 📈 Examples by Organization Type

### Startup ($30K / 3 months)

**Why:**
- Limited budgets
- Fast execution
- Lean teams

**Anchors:**
```typescript
{ costTarget: 30000, timeTarget: 3 }
```

**Example Project:**
- Cost: $20,000
- Time: 8 weeks (1.85 months)
- Complexity: 5/10

**Score:**
```
Cost:       $20K / $30K = 67%
Time:       1.85 / 3 = 62%
Complexity: 5 / 10 = 50%

Effort = (0.5 × 67%) + (0.3 × 62%) + (0.2 × 50%)
       = 33.5% + 18.6% + 10%
       = 62.1% → Growth Engine (high effort)
```

---

### Mid-Market ($100K / 6 months) ⭐ DEFAULT

**Why:**
- Balanced budgets
- Moderate timelines
- Standard processes

**Anchors:**
```typescript
{ costTarget: 100000, timeTarget: 6 }
```

**Example Project:**
- Cost: $50,000
- Time: 12 weeks (2.77 months)
- Complexity: 4/10

**Score:**
```
Cost:       $50K / $100K = 50%
Time:       2.77 / 6 = 46%
Complexity: 4 / 10 = 40%

Effort = (0.5 × 50%) + (0.3 × 46%) + (0.2 × 40%)
       = 25% + 13.8% + 8%
       = 46.8% → Growth Engine (high effort)
```

---

### Enterprise ($500K / 12 months)

**Why:**
- Large budgets
- Long timelines
- Complex stakeholders

**Anchors:**
```typescript
{ costTarget: 500000, timeTarget: 12 }
```

**Example Project:**
- Cost: $200,000
- Time: 24 weeks (5.54 months)
- Complexity: 7/10

**Score:**
```
Cost:       $200K / $500K = 40%
Time:       5.54 / 12 = 46%
Complexity: 7 / 10 = 70%

Effort = (0.5 × 40%) + (0.3 × 46%) + (0.2 × 70%)
       = 20% + 13.8% + 14%
       = 47.8% → Growth Engine (high effort)
```

---

## 🎯 Calibration Process

### Step 1: Review Current Distribution

Check your Opportunity Matrix. Are most projects in one quadrant?

```
✅ Good: Projects spread across quadrants
❌ Bad: All projects in same quadrant
```

### Step 2: Calculate Your Averages

Look at your last 5-10 projects:

```
Average Cost: ________
Average Time: ________
```

### Step 3: Set Anchors

```
Cost Target = Your Average Cost
Time Target = Your Average Time (in months)
```

### Step 4: Test and Iterate

1. Save anchors
2. Check matrix distribution
3. Adjust if needed
4. Repeat until balanced

---

## 🚨 Common Mistakes

### ❌ Setting Anchors Too High

**Problem:**
```
Cost Target: $1,000,000
Time Target: 24 months

Result: All projects score <10% effort → Everything is "Quick Win"
```

**Impact:**
- Matrix loses meaning
- Can't differentiate effort levels
- Strategic planning breaks down

**Fix:** Lower anchors to match your **actual** project scale

---

### ❌ Setting Anchors Too Low

**Problem:**
```
Cost Target: $10,000
Time Target: 1 month

Result: All projects score >80% effort → Everything is "Deprioritize"
```

**Impact:**
- Nothing looks achievable
- Team becomes demotivated
- Portfolio appears too difficult

**Fix:** Raise anchors to match your **actual** project scale

---

### ❌ Never Adjusting Anchors

**Problem:**
- Company grows from startup → mid-market
- Project scale increases 10x
- Anchors still set at startup levels

**Impact:**
- Scores become meaningless over time
- Strategic decisions based on outdated benchmarks

**Fix:** Review anchors **quarterly** and adjust as company evolves

---

## 📋 Quick Reference Card

### Admin Path
```
Settings → Admin → Costs → Effort Anchors
```

### Defaults
```
Cost Target:  $100,000
Time Target:  6 months
```

### Formula
```
Effort = 50%×Cost + 30%×Time + 20%×Complexity
```

### Threshold
```
≤40% = Low Effort
>40% = High Effort
```

### Permissions
```
✅ Global Admin
✅ Tenant Admin  
✅ Org Admin
❌ Regular User (view only)
```

---

## 🎓 Pro Tips

### Tip 1: Start with Defaults

If unsure, use the defaults ($100K / 6 months) and adjust based on results.

### Tip 2: Round to Nice Numbers

Use $50K, $100K, $200K (not $87,459)  
Use 3, 6, 12 months (not 5.7 months)

### Tip 3: Document Changes

Keep a log of when/why you changed anchors:

```
2025-01-15: Raised cost target $100K → $150K
Reason: Company expanded, project budgets increased
```

### Tip 4: Communicate to Team

When you change anchors, tell your team:

```
"We've adjusted effort benchmarks to reflect our new project scale.
Some projects may shift quadrants - this is expected."
```

### Tip 5: Monitor Distribution

Ideal distribution:
```
Quick Wins:      20-30%
Growth Engines:  20-30%
Nice to Have:    20-30%
Deprioritize:    10-20%
```

---

## 🔍 Debugging

### "My effort scores look wrong!"

**Check:**
1. View console logs (browser DevTools)
2. Look for "ABSOLUTE EFFORT CALCULATION"
3. Verify:
   - Estimated Cost includes all components
   - Estimated Time is in weeks
   - Cost Target / Time Target are correct
   - Complexity Index is from workflow

**Example Log:**
```
💡 ABSOLUTE EFFORT CALCULATION:
   Estimated Cost: $45,000
   Cost Target: $100,000
   Cost Score: 45.0% (below target) ✅
   Estimated Time: 8 weeks (1.8 months)
   Time Target: 6 months
   Time Score: 30.8% (below target) ✅
   Complexity Index: 6.2/10
   Complexity Score: 62.0% ✅
```

---

## 📞 Need Help?

### Can't find Effort Anchors?

**Check:**
- Are you logged in as admin?
- Are you on the **Costs** tab?
- Is the card at the **top** of the page?

### Changes not saving?

**Check:**
- Did you click "Save Anchors" button?
- Do you have admin permissions?
- Is there a network error in console?

### Scores still seem wrong?

**Try:**
1. Reset anchors to defaults
2. Save and refresh page
3. Check one project's calculation in console
4. Verify cost/time/complexity values

---

**Last Updated:** October 15, 2025  
**Version:** 2.0.0
