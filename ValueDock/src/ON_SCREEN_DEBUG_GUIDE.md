# 🔍 On-Screen Debug Guide for Cost Classification

## What's New

I've added **visible on-screen debugging** so you can see exactly what's happening without needing to access the browser console!

---

## Visual Debug Panel

At the TOP of the Cost Classification screen, you'll now see a **blue debug panel** with the following information:

### Last Action
Shows the most recent action that happened:
- `Loading data for org...` - When first loading
- `✅ Loaded saved data from server` - When data was found
- `⚠️ No saved data - loaded defaults` - When no saved data exists
- `🔄 Changed "Training & Onboarding" to Hard` - When you toggle a cost
- `🚀 Saving to server...` - When you click Save
- `✅ Saved successfully at [time]` - When save completes
- `❌ Save failed: [error]` - If save fails

### Debug Stats
- **Org ID** - The organization you're editing
- **Has Changes** - Shows YES if you've made changes
- **Hard Costs** - Count of hard costs
- **Soft Costs** - Count of soft costs
- **Saving** - Shows YES while saving
- **Loading** - Shows YES while loading

### Saved Data Info
- **Last Saved** - Date and time of last save
- **By** - Who saved it
- **⚠️ NO SAVED DATA** - Red warning if no data in database

---

## Alerts You'll See

### When You Toggle a Cost
- **Toast notification**: "🔄 [Cost Name] changed to Hard/Soft cost"
- This confirms the toggle was registered

### When You Click Save
- **Alert popup**: "🚀 SAVE CLICKED! Check debug console for details."
- This confirms the save button was clicked and the function started

### When Save Succeeds
- **Toast notification**: "✅ Cost classification saved successfully"
- **Alert popup**: "✅ SAVE SUCCESSFUL! Data has been saved to the database."
- **Debug panel** updates to show save time

### When Save Fails
- **Toast notification**: "Failed to save: [error message]"
- **Alert popup**: "❌ SAVE FAILED! Error: [details]"
- **Debug panel** shows the error

---

## Step-by-Step Test

### Test 1: Basic Toggle and Save

1. **Navigate to Admin → Costs**
2. **Select an organization**
3. **Look at debug panel** - Should show:
   ```
   Last Action: ⚠️ No saved data - loaded defaults
   Has Changes: ❌ NO
   Hard Costs: 8
   Soft Costs: 8
   ```

4. **Find "Training & Onboarding Costs"**
   - Should show as "Soft" (outline button)

5. **Click the "Hard" button**
   - **Toast should appear**: "🔄 Training & Onboarding Costs changed to Hard cost"
   - **Debug panel should update**:
     ```
     Last Action: 🔄 Changed "Training & Onboarding Costs" to Hard
     Has Changes: ✅ YES
     Hard Costs: 9
     ```

6. **Click "Save Changes" button**
   - **Alert should popup**: "🚀 SAVE CLICKED!"
   - Click OK
   - **Debug panel should show**: "Last Action: 🚀 Saving to server..."
   - **Another alert should popup**: "✅ SAVE SUCCESSFUL!"
   - **Debug panel should update**:
     ```
     Last Action: ✅ Saved successfully at [time]
     Has Changes: ❌ NO
     Last Saved: [date and time]
     By: [your name]
     ```

7. **Switch to Orgs tab**
8. **Switch back to Costs tab**
9. **Select the same organization**
   - **Debug panel should show**:
     ```
     Last Action: ✅ Loaded saved data from server
     Hard Costs: 9  ← Should be 9, not 8!
     Last Saved: [the time from step 6]
     ```
   - **Training & Onboarding should still be Hard**

---

## Troubleshooting with Debug Panel

### Issue: "Has Changes" Never Shows YES

**What it means:** The toggle is not working

**Debug panel will show:**
```
Last Action: [still showing old action]
Has Changes: ❌ NO  ← Never changes
```

**What to check:**
- Are you clicking the correct button? (Click the opposite of current state)
- Do you see a toast when you click?

---

### Issue: Save Button Doesn't Do Anything

**What it means:** The save function is not being called

**You should see:**
1. NO alert popup "🚀 SAVE CLICKED!"
2. Debug panel "Last Action" doesn't change to "Saving..."

**What to check:**
- Is the Save button disabled? (gray and unclickable)
- Does "Has Changes" show YES?
- If Save is disabled, you need to make a change first

---

### Issue: Save Starts But Never Completes

**Debug panel will show:**
```
Last Action: 🚀 Saving to server...
Saving: ⏳ YES  ← Stuck on YES
```

**What it means:** The API call is hanging or failed silently

**What to do:**
- Look in Debug Console (bottom of screen) for error messages
- Check if alert popup appeared with error
- Error should also show in "Last Action"

---

### Issue: Save Completes But Data Not Persisted

**You'll see:**
- Alert: "✅ SAVE SUCCESSFUL!"
- Debug panel: "Last Action: ✅ Saved successfully"
- Debug panel shows "Last Saved" time

**But when you reload:**
- Debug panel: "Last Action: ⚠️ No saved data"
- NO "Last Saved" shown
- Costs back to defaults

**What it means:** Backend is not actually saving to database

**Look in Debug Console for:**
```
[COST-CLASS SAVE] ✅ Verified read-back: FAILED
```

This would indicate the KV store is not working.

---

## What Each Alert Means

| Alert | Meaning | Next Step |
|-------|---------|-----------|
| 🚀 SAVE CLICKED! | Save button was clicked | Wait for success/fail alert |
| ✅ SAVE SUCCESSFUL! | Data was saved to database | Verify by reloading |
| ❌ SAVE FAILED! | Save did not work | Read error message |
| ❌ ERROR: No classification data | Component state is broken | Report this bug |

---

## Expected Flow (Happy Path)

```
1. Load org
   └─> Debug: "⚠️ No saved data" (first time)
   
2. Toggle cost
   └─> Toast: "🔄 [Cost] changed to Hard/Soft"
   └─> Debug: "🔄 Changed [Cost] to Hard"
   └─> Debug: "Has Changes: ✅ YES"
   
3. Click Save
   └─> Alert: "🚀 SAVE CLICKED!"
   └─> Debug: "🚀 Saving to server..."
   └─> Alert: "✅ SAVE SUCCESSFUL!"
   └─> Debug: "✅ Saved successfully at [time]"
   └─> Debug: "Has Changes: ❌ NO"
   └─> Debug: "Last Saved: [time]"
   
4. Switch tabs and back
   └─> Debug: "Loading data for org..."
   └─> Debug: "✅ Loaded saved data from server"
   └─> Debug: "Last Saved: [same time as before]"
   └─> Changes are still there!
```

---

## Quick Diagnostic Checklist

Run through this:

- [ ] Debug panel is visible at top
- [ ] Select organization - debug panel shows loading
- [ ] Toggle a cost - toast appears
- [ ] Debug panel "Has Changes" shows YES
- [ ] Save button is enabled (not grayed out)
- [ ] Click Save - alert "SAVE CLICKED!" appears
- [ ] Another alert "SAVE SUCCESSFUL!" appears
- [ ] Debug panel shows "Last Saved" time
- [ ] Switch tabs and back
- [ ] Select same org - debug panel shows "Loaded saved data"
- [ ] Changes are still there

**Which step fails?** That's where the problem is!

---

## Copy This Info

When reporting issues, copy the **Debug Panel** info:

```
Last Action: [copy this]
Has Changes: [YES/NO]
Hard Costs: [number]
Soft Costs: [number]
Saving: [YES/NO]
Loading: [YES/NO]
Last Saved: [time if shown, or "NOT SHOWN"]
```

And describe:
- Which alerts you saw (or didn't see)
- Which step failed from the checklist above

---

**The debug panel makes it super easy to see exactly what's happening!**
