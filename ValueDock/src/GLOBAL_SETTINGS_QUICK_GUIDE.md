# Global Settings - Quick Reference Guide

**Quick guide for updating global defaults**

---

## 🎯 What This Feature Does

When you change a global setting (like Software Cost or Implementation Timeline), the system:

1. ✅ **Checks** if any processes have individual cost settings
2. ⚠️ **Warns you** if they do
3. 🤔 **Asks** if you want to apply the change to all processes or just new ones

---

## 📋 Quick Steps

### If You See the Warning Dialog:

**Option 1: Apply to All Processes**
```
Use when: You want ALL processes to use the new value
Result: Global default + all existing processes updated
```

**Option 2: Keep Individual Settings**
```
Use when: You want to preserve custom process values
Result: Global default updated, but existing individual values unchanged
```

---

## 🔍 Which Fields Trigger This?

Implementation cost fields:
- ✅ Software Cost
- ✅ Automation Coverage  
- ✅ Implementation Timeline
- ✅ Upfront Costs
- ✅ Training Costs
- ✅ Consulting Costs
- ✅ Average Hourly Wage
- ✅ Temp Staff Rate
- ✅ Overtime Rate

---

## 💡 Common Scenarios

### Scenario 1: Setting Up New Project
```
✅ All processes use global settings
✅ No warning dialog
✅ Changes apply immediately to all processes
```

### Scenario 2: Correcting a Pricing Error
```
⚠️ Some processes have custom values
⚠️ Warning dialog appears
✅ Choose "Apply to All Processes"
✅ Error corrected everywhere
```

### Scenario 3: Updating Default for Future Processes
```
⚠️ Processes have different costs for good reasons
⚠️ Warning dialog appears
✅ Choose "Keep Individual Settings"
✅ Only new processes use new default
```

---

## 🎨 Visual Flow

```
Change Global Setting
        ↓
Any processes with 
individual settings?
        ↓
    ┌───YES───┐
    ↓         ↓
Show Dialog   No Dialog
    ↓         ↓
Choose    Apply Change
Action    Immediately
```

---

## ⚙️ How to Set Individual Process Costs

If you need a process to have different costs:

1. Open the process in Inputs Screen
2. Click **Advanced Metrics**
3. Toggle **"Use Global Settings"** to OFF
4. Enter your custom values
5. Save

---

## 🔄 How to Reset Process to Global Settings

To make a process use global settings again:

1. Open the process in Inputs Screen
2. Click **Advanced Metrics**
3. Toggle **"Use Global Settings"** to ON
4. Process now uses global defaults

---

## ❓ FAQ

**Q: Why didn't I see a warning?**  
A: All your processes use global settings (good!) or the individual values already match the new global value.

**Q: Can I undo this?**  
A: Yes, just change the global setting back and choose your desired option again.

**Q: What if I'm not sure which option to choose?**  
A: Choose "Keep Individual Settings" to be safe. You can always manually update processes later.

**Q: Does this affect calculations already done?**  
A: No, only future calculations. Re-calculate to see updated results.

**Q: Can I see which processes have individual settings?**  
A: Yes! The warning dialog lists all affected processes by name.

---

## 🎓 Best Practices

### ✅ DO:
- Use global settings for consistency
- Customize individual processes when needed
- Review the warning dialog carefully
- Keep individual settings if processes genuinely differ

### ❌ DON'T:
- Rush through the warning dialog
- Apply globally without checking affected processes
- Forget to recalculate after changes
- Set individual values unless necessary

---

## 🆘 Troubleshooting

### Issue: Can't Change Individual Process Value

**Solution:**
1. Open process Advanced Metrics
2. Toggle "Use Global Settings" to OFF
3. Now you can edit individual values

### Issue: Want All Processes to Match Global

**Solution:**
1. Change any global setting slightly
2. Click "Apply to All Processes"
3. Change global setting to desired value
4. Click "Apply to All Processes" again

### Issue: Made Wrong Choice in Dialog

**Solution:**
1. Change the global setting to original value
2. Make correct choice this time
3. Change global setting to desired value
4. Make correct choice again

---

## 📊 Examples

### Example 1: Update Software Cost

**Before:**
- Global: $500
- Process A: $500 (uses global)
- Process B: $800 (individual)

**Change Global to $750**

**Warning Shows:** "Process B has individual settings"

**Choose "Apply to All":**
- Global: $750
- Process A: $750
- Process B: $750 ✅ Updated

**Choose "Keep Individual":**
- Global: $750
- Process A: $750
- Process B: $800 ✅ Unchanged

---

## 🔗 Related Docs

- [GLOBAL_SETTINGS_AUTO_UPDATE.md](./GLOBAL_SETTINGS_AUTO_UPDATE.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Getting started guide
- [InputsScreen Documentation](./components/InputsScreen.tsx) - Technical details

---

**Remember**: The warning dialog is there to protect your carefully customized process settings. Take a moment to choose the right option for your situation!

---

**Last Updated**: January 2025  
**Quick Reference** | **Version 1.0.0**
