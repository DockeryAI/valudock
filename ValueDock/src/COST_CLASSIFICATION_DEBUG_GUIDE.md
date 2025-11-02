# 🐛 Cost Classification - Debug Guide

## Issue: Changes Not Persisting

If you're experiencing issues where cost classification changes don't persist after saving and navigating away, follow this guide to debug.

## Enhanced Logging Added

I've added comprehensive logging to help debug this issue. When you interact with the Cost Classification feature, you'll now see detailed console logs.

### What to Look For in Console

#### When Loading:
```
[CostClassification] ========== LOADING ==========
[CostClassification] Organization ID: org_123
[CostClassification] Timestamp: 2025-01-11T...
[CostClassification] API Response: {...}
[CostClassification] ✅ Loaded from server
[CostClassification] Hard costs count: 8
[CostClassification] Soft costs count: 8
[CostClassification] Hard costs: ["laborCosts", "softwareLicensing", ...]
[CostClassification] ========== LOAD COMPLETE ==========
```

#### When Saving:
```
[CostClassification] ========== SAVING ==========
[CostClassification] Organization ID: org_123
[CostClassification] Hard costs: ["laborCosts", "trainingOnboardingCosts", ...]
[CostClassification] Soft costs: ["shadowSystemsCosts", ...]
[CostClassification] Timestamp: 2025-01-11T...
[CostClassification] ✅ Save response: {...}
[CostClassification] Updating local state with server response
[CostClassification] ========== SAVE COMPLETE ==========
```

#### Backend Logs:
```
[COST-CLASS SAVE] Saving classification for org: org_123
[COST-CLASS SAVE] User: user_456 Role: master_admin
[COST-CLASS SAVE] Classification saved successfully
```

## Step-by-Step Debugging Process

### Step 1: Test Save
1. Open browser console (F12)
2. Navigate to Admin Dashboard → Costs tab
3. Select an organization
4. Toggle a cost from Hard to Soft (e.g., Training & Onboarding)
5. Click "Save Changes"
6. **Check console for:**
   - `[CostClassification] ========== SAVING ==========`
   - Verify the hard/soft costs arrays look correct
   - Look for `[CostClassification] ✅ Save response`
   - **Backend log:** `[COST-CLASS SAVE] Classification saved successfully`

### Step 2: Navigate Away and Back
1. After saving, click on a different tab (e.g., "Inputs")
2. Wait 2 seconds
3. Navigate back to Admin Dashboard → Costs tab
4. Select the SAME organization
5. **Check console for:**
   - `[CostClassification] ========== LOADING ==========`
   - `[CostClassification] ✅ Loaded from server`
   - Verify hard costs array includes your changes
   - **Backend log:** `[COST-CLASS GET] Classification found:`

### Step 3: Verify Data in Backend
Check that the data is actually saved:
```bash
# In backend logs, look for:
[COST-CLASS GET] Loading classification for org: org_123
[COST-CLASS GET] Classification found: { organizationId: '...', hardCosts: [...], ... }
```

## Common Issues & Solutions

### Issue 1: Data Not Saving to Backend

**Symptoms:**
- Console shows `[CostClassification] ========== SAVING ==========`
- But no backend log for `[COST-CLASS SAVE] Classification saved successfully`
- Or error in console

**Possible Causes:**
- API endpoint not reachable
- Authentication issue
- Permission error

**Solution:**
1. Check for error messages in console
2. Verify you have admin role (master_admin, tenant_admin, or org_admin)
3. Check network tab for failed requests

### Issue 2: Data Saved But Not Loading Back

**Symptoms:**
- Save logs show success
- Backend shows data was saved
- But when you come back, it loads defaults instead

**Possible Causes:**
- Wrong organization ID on reload
- Key mismatch in backend storage

**Solution:**
1. Compare org IDs in save vs load:
   ```
   SAVE:  Organization ID: org_abc123
   LOAD:  Organization ID: org_abc123
   ```
   They should match!

2. Check backend storage key:
   ```
   Saving to:   cost-class:org_abc123
   Loading from: cost-class:org_abc123
   ```
   Should be the same!

### Issue 3: Component Not Reloading

**Symptoms:**
- You come back to Costs tab
- Same org still selected
- But data is stale (shows old values)

**Solution:**
Now fixed! The component has a `key` prop that forces remount:
```tsx
<CostClassificationManager
  key={selectedOrg.id}  // ← Forces remount on org change
  organizationId={selectedOrg.id}
  organizationName={selectedOrg.name}
/>
```

### Issue 4: Wrong Organization Selected

**Symptoms:**
- You save for Org A
- Come back and Org B is selected
- Data looks wrong

**Solution:**
- Make sure you're selecting the correct organization from the tree
- Check console: `Organization ID:` should match what you expect

## Testing Checklist

Run through this complete test:

### ✅ Test 1: Basic Save & Reload
- [ ] Select Org A
- [ ] Toggle "Training & Onboarding" from Soft → Hard
- [ ] Click Save
- [ ] Console shows save success
- [ ] Navigate to Inputs screen
- [ ] Navigate back to Costs
- [ ] Select Org A
- [ ] "Training & Onboarding" should still be Hard

### ✅ Test 2: Multiple Organizations
- [ ] Select Org A, toggle some costs, save
- [ ] Select Org B, toggle different costs, save
- [ ] Navigate away and back
- [ ] Select Org A - verify correct classification
- [ ] Select Org B - verify correct classification
- [ ] Each org should have its own independent classification

### ✅ Test 3: Persistence Across Sessions
- [ ] Make changes and save
- [ ] Close the browser tab completely
- [ ] Open ValueDock again
- [ ] Navigate to Costs
- [ ] Select the organization
- [ ] Changes should still be there

## What the Fixes Do

### Fix 1: Key Prop for Remounting
```tsx
<CostClassificationManager
  key={selectedOrg.id}  // ← New!
  organizationId={selectedOrg.id}
  organizationName={selectedOrg.name}
/>
```
**Why:** Forces React to unmount and remount the component when switching organizations, ensuring fresh data load.

### Fix 2: Enhanced Logging
**Why:** Helps you see exactly what's happening at each step - saving, loading, API calls, etc.

### Fix 3: Proper useEffect Dependency
```tsx
useEffect(() => {
  loadClassification();
}, [organizationId]);  // ← Reloads when org changes
```
**Why:** Ensures data is reloaded whenever a different organization is selected.

## Expected Behavior

### Correct Flow:
1. **Select Org → Load Data**
   ```
   [LOADING] → API Call → [Server Data] → Display
   ```

2. **Change Costs → Save**
   ```
   Toggle → [SAVING] → API Call → [Success] → Update Local State
   ```

3. **Navigate Away → Navigate Back**
   ```
   [Component Unmounts] → [Component Mounts] → [LOADING] → API Call → [Server Data] → Display
   ```

4. **Switch Organizations**
   ```
   Select Org B → [Component Remounts due to key] → [LOADING] → API Call → Display Org B Data
   ```

## Backend Data Verification

You can manually verify data is saved by checking the KV store:

**Key Format:**
```
cost-class:{organizationId}
```

**Example:**
```
cost-class:org_abc123
```

**Data Structure:**
```json
{
  "organizationId": "org_abc123",
  "hardCosts": ["laborCosts", "softwareLicensing", ...],
  "softCosts": ["trainingOnboardingCosts", ...],
  "lastModified": "2025-01-11T12:00:00.000Z",
  "modifiedBy": "user_456",
  "modifiedByName": "Admin User"
}
```

## Still Having Issues?

If you're still seeing problems after these fixes:

1. **Clear Console** (right-click → Clear console)
2. **Perform a fresh test** following Test 1 above
3. **Copy ALL console logs** from start to finish
4. **Share the logs** - look for:
   - Any error messages
   - The org IDs in save vs load
   - The hard/soft costs arrays
   - Backend response data

---

**Status:** 🔧 **DEBUGGING TOOLS ADDED**

The component now has comprehensive logging to help identify exactly where the issue is occurring.
