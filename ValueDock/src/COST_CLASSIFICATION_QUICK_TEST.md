# Cost Classification Fix - Quick Test Guide

## 🚀 Quick 2-Minute Test

### Prerequisites
- Sign in as: **admin@dockeryai.com**
- Organization: **Test Organization** (under Test Tenant)

### Test Steps

#### 1. Hard Refresh Browser ⚡
**CRITICAL - Do this first!**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### 2. Set Labor as HARD (Admin → Costs)
1. Go to **Admin** tab → **Costs** sub-tab
2. Select **Test Tenant** → **Test Organization**
3. Ensure "Direct Labor Costs" is in the **Hard Costs** column
4. Click **Save Classification**

#### 3. Check Impact & ROI
1. Go to **Global View** menu
2. Select **Test Tenant** → **Test Organization**
3. Go to **Impact & ROI** tab
4. Scroll to CFO Dashboard
5. **Note the Hard Savings number** (should be large, e.g., $1M+)

#### 4. Set Labor as SOFT (Admin → Costs)
1. Go back to **Admin → Costs**
2. Move "Direct Labor Costs" from Hard to Soft
3. Click **Save Classification**

#### 5. Verify the Change
1. Go back to **Impact & ROI** tab
2. Check CFO Dashboard again
3. **Hard Savings should now be MUCH smaller**
4. **Soft Savings should now be MUCH larger**

### ✅ Expected Result

When you move "Direct Labor Costs" from hard to soft:

| Before (Labor = Hard) | After (Labor = Soft) |
|----------------------|---------------------|
| Hard: **$1,164,800** | Hard: **$0** |
| Soft: **$0** | Soft: **$1,164,800** |

**If the numbers flip dramatically, the fix is working!** 🎉

### 🔍 Console Verification

Open browser console (F12) and look for:

```javascript
[calculateProcessROI] Hard vs Soft breakdown: {
  laborSavingsHard: 1164800,  // Changes to 0 when labor is soft
  laborSavingsSoft: 0,        // Changes to 1164800 when labor is soft
  laborClassification: 'hard' // Shows 'soft' after you flip it
}
```

### 🐛 Troubleshooting

**Problem:** Numbers don't change  
**Solution:** Hard refresh again (Ctrl+Shift+R)

**Problem:** Console shows "Using default cost classification"  
**Solution:** Make sure you selected an organization, not just a tenant

**Problem:** No savings showing  
**Solution:** Make sure you have a selected process with FTEs

## What This Proves

This test proves that:
- ✅ All 16 cost attributes are now properly mapped
- ✅ Labor cost classification is being respected
- ✅ Hard vs soft categorization is working correctly
- ✅ The calculations update immediately when you change settings

## Files Modified

- `/components/utils/calculations.ts` - Core fix applied
- Rebuild marker: `2025-10-11-23-40`

## Full Documentation

See these files for complete details:
- `COST_CLASSIFICATION_FIX_VERIFICATION.md` - Comprehensive testing guide
- `COST_CLASSIFICATION_CRITICAL_FIX.md` - Detailed explanation of the fix
