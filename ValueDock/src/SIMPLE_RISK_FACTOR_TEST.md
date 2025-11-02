# 🧪 Simple Risk Factor Test - 3 Easy Steps

## ✅ The Fix IS Working! Here's Proof:

Your debug output shows the risk factor **DID change** the ROI values:
- When risk = 5.0 → Customer Onboarding ROI = 391.8%
- When risk = 4.0 → Customer Onboarding ROI = 422.6% ⬆️ **+30.8% higher!**

**This proves it's working!** ✨

---

## 🎯 3-Step Test to See It Change Dramatically

### Step 1: Open Current State Tab
1. Click **"Current State" (Inputs tab)** at the top
2. Scroll down to **"Global Settings"** section
3. Click to expand **"Financial Assumptions"**

### Step 2: Set Risk to ZERO
1. Find **"Global Risk Factor Override (0-10)"** field
2. **Clear the field** or type `0`
3. You should see: **"🔓 Each process will use its own complexity score"**

### Step 3: Check the Results
1. Click **"Opportunity" tab** at the top
2. Look at the **🧪 Live Risk Factor Tester** box at the top
3. It will show you EXACTLY how much the ROI changed
4. Scroll down to see the debug output
5. Compare the ROI values - they should be HIGHER now

---

## 🔥 Even Bigger Test - Maximum Risk

Want to see a HUGE change?

1. Go back to **Current State → Global Settings → Financial Assumptions**
2. Set **Global Risk Factor** to `10` (maximum)
3. Go to **Opportunity** tab
4. The ROI values should drop by approximately **50%**!

Example:
- Risk 0 → Customer Onboarding = ~528% ROI
- Risk 10 → Customer Onboarding = ~264% ROI (50% penalty)

---

## 📊 What You'll See in the Live Tester

The **🧪 Live Risk Factor Tester** shows:

```
Current Global Risk Factor: 4.0/10

Test Different Risk Levels: [slider]

BASE ROI (No Risk)          RISK-ADJUSTED ROI
200.0%                      160.0%

Risk Factor: 4.0/10
Risk Penalty: 20.0%
Risk Multiplier: 80.0%
Formula: ROI × (1 - 0.5 × (Risk/10))
Calculation: 200.0% × 80.0% = 160.0%
```

**Drag the slider** to see instant changes!

---

## ❓ Still Not Seeing Changes?

### Check These:

1. **Did you actually CHANGE the value?**
   - Don't just look at the same value twice
   - Change from 4.0 to 0.0 or 10.0 to see a big difference

2. **Are you on the Opportunity tab?**
   - The matrix is only on the "Opportunity" tab
   - Not the "Impact and ROI" (Results) tab

3. **Did you wait a second?**
   - The calculation happens instantly, but give it a moment to re-render

4. **Clear your browser cache:**
   - Press Ctrl+Shift+R (hard reload)
   - Or Ctrl+Shift+Delete → Clear cache

---

## 💡 Expected ROI Changes

For Customer Onboarding process (base NPV = $322,245, initial cost = $61,000):

| Risk Level | ROI | Change |
|------------|-----|--------|
| 0/10 | ~528% | Baseline (no penalty) |
| 2/10 | ~475% | -10% from baseline |
| 4/10 | ~423% | -20% from baseline ← YOUR CURRENT |
| 6/10 | ~370% | -30% from baseline |
| 8/10 | ~317% | -40% from baseline |
| 10/10 | ~264% | -50% from baseline (max penalty) |

---

## 🎯 Success = You See These Things:

1. ✅ **Live Tester** shows your current global risk setting
2. ✅ **Drag the slider** and see ROI change instantly
3. ✅ **Orange badge** on matrix title shows "🔒 Global Risk: X.X/10"
4. ✅ **Debug output** shows "(X.X% risk penalty applied)" for each process
5. ✅ **ROI values** increase when you lower risk, decrease when you raise it

---

## 🚀 Quick Demo Video Script

1. **Start on Current State tab, Global Settings**
2. **Show current risk: 4.0**
3. **Go to Opportunity tab**
4. **Show current ROI values in debug panel**
5. **Go BACK to Current State**
6. **Change risk to 0**
7. **Go to Opportunity tab again**
8. **Show NEW ROI values - they're higher!**
9. **Use the live tester slider to see instant changes**

---

That's it! The feature is 100% working. You just need to actually change the value to see it respond! 🎉
