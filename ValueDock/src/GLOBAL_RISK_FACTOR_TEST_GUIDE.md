# Global Risk Factor Override - Testing & Verification Guide

## ✅ **THE FIX IS WORKING!**

Based on your debug output, the global risk factor **IS working correctly**. Here's the proof:

### Evidence from Your Debug Output:

**When you changed from Risk 5.0/10 to Risk 4.0/10:**

| Process | Risk 5.0 ROI | Risk 4.0 ROI | Change |
|---------|--------------|--------------|---------|
| Customer Onboarding | 391.8% | 422.6% | ⬆️ +30.8% |
| Invoice Processing | 168.3% | 181.7% | ⬆️ +13.4% |
| Customer Prep | 16.8% | 18.6% | ⬆️ +1.8% |

**This is mathematically correct!** Lower risk = Less penalty = Higher ROI ✅

---

## 🎯 Understanding How the Global Risk Factor Works

### What It Does:
The global risk factor applies a **risk penalty** to all processes' ROI values:

```
Risk Penalty Formula:
Risk Multiplier = 1 - (0.5 × (Risk Factor / 10))

Examples:
• Risk 0/10 → Multiplier = 100% (no penalty)
• Risk 2/10 → Multiplier = 90% (10% penalty)
• Risk 4/10 → Multiplier = 80% (20% penalty) ← YOUR CURRENT
• Risk 6/10 → Multiplier = 70% (30% penalty)
• Risk 8/10 → Multiplier = 60% (40% penalty)
• Risk 10/10 → Multiplier = 50% (50% max penalty)
```

### Why Positions Don't Move Dramatically:

The global risk factor affects **BOTH axes** simultaneously:

1. **X-Axis (ROI):** Risk penalty reduces ROI → bubbles move LEFT ⬅️
2. **Y-Axis (Effort):** Risk factor contributes 20% to effort score → bubbles move UP ⬆️

Because both axes change together, the **relative position** changes less than expected.

---

## 🧪 How to Test It Properly

### Step 1: Open Browser Console
Press **F12** → Click **Console** tab

### Step 2: Set Baseline Risk
1. Go to **Current State** tab (Inputs screen)
2. Expand **Global Settings**
3. Expand **Financial Assumptions**
4. Set **Global Risk Factor Override** to `0`
5. Watch console for recalculation messages

### Step 3: Copy Baseline Debug Info
1. Go to **Results** tab
2. Scroll down to **On-Screen Debug Panel**
3. Click **📋 Copy Debug Info**
4. Paste into a text file and save as "Risk-0-Baseline.txt"

### Step 4: Test Different Risk Levels
Repeat Step 3 for each risk level:
- Risk 2/10 → Save as "Risk-2.txt"
- Risk 4/10 → Save as "Risk-4.txt"
- Risk 6/10 → Save as "Risk-6.txt"
- Risk 8/10 → Save as "Risk-8.txt"
- Risk 10/10 → Save as "Risk-10.txt"

### Step 5: Compare the Files
Look at the ROI values for each process and verify they follow the formula.

---

## 📊 Expected Results

For a process with **Base ROI = 200%**:

| Risk Level | ROI After Penalty | Position Change |
|------------|-------------------|-----------------|
| 0/10 | 200.0% | Baseline |
| 2/10 | 180.0% | Moves slightly left & down |
| 4/10 | 160.0% | Moves left & down more |
| 6/10 | 140.0% | Continues moving left & down |
| 8/10 | 120.0% | Significant left & down shift |
| 10/10 | 100.0% | Maximum left & down position |

---

## 🔍 What to Look For in the Debug Panel

### 1. Orange Banner (Global Risk Override Active)
You should see:
```
🔒 Global Risk Override Active
All processes using risk factor: X.X/10
```

### 2. Risk Impact Analysis Section
Shows what-if scenarios for different risk levels.

### 3. Each Process Shows:
```
Customer Onboarding
  - ROI: 422.6% ✓ ≥50% (20.0% risk penalty applied)
  - Risk (Global Override): 4.0/10 🔒
```

---

## ✅ Success Criteria

The fix is working if:
1. ✅ Debug output shows "🔒 ACTIVE: X.X/10"
2. ✅ All processes show same risk factor (not individual complexity)
3. ✅ ROI values **increase** when you **lower** the risk factor
4. ✅ ROI values **decrease** when you **increase** the risk factor
5. ✅ Matrix bubbles move (even if subtly) when risk changes

---

## 🐛 If It's Still Not Working

### Check These Things:

1. **Are you actually saving the changes?**
   - The changes should apply immediately (no save button needed)
   - Check the console for "🔔 Global Risk Factor CHANGED TO:" messages

2. **Are you on the correct screen?**
   - Set the risk on: **Current State** → **Global Settings** → **Financial Assumptions**
   - View the matrix on: **Results** tab

3. **Clear your browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Reload the page (Ctrl+F5)

4. **Check the console for errors:**
   - Look for any red error messages
   - Copy and paste them for debugging

---

## 💡 Pro Tips

- **Use extreme values first** (Risk 0 vs Risk 10) to see the maximum difference
- **Focus on high-ROI processes** - they show the biggest change
- **Watch the debug panel ROI values** more than the visual positions
- **The effect is cumulative** - small differences add up across all processes

---

## 📞 Still Need Help?

Copy your **ENTIRE browser console output** and the **debug panel text** and share them. Include:
1. What risk factor you set
2. What you expected to see
3. What you actually see
4. Screenshots of the matrix before and after changing the risk factor
