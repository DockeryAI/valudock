# Run & Save Version - Quick Start

## ⚡ 30-Second Overview

**Two buttons, two purposes:**

- **"Run Agent"** = Test and iterate (no new version)
- **"Run & Save Version"** = Create production proposal (new version)

---

## 🎯 Quick Decision Tree

```
Do you want to save this as a new version?

    YES → Click "Run & Save Version" (blue button)
    NO  → Click "Run Agent" (outline button)
```

---

## 🚀 How to Use

### **Option 1: Run & Save Version (Recommended)**

1. Fill in form:
   - Deal ID
   - Customer URL
   - Fathom window
   
2. Click **"Run & Save Version"** (blue button)

3. Wait for completion

4. See toast: **"Proposal v2 saved!"**

5. Version switcher updates automatically

**Result:** New version created and saved

---

### **Option 2: Run Agent (Testing)**

1. Fill in form

2. Click **"Run Agent"** (outline button)

3. Wait for completion

4. Review results

**Result:** No new version created, current version updated

---

## 📊 Button Comparison

| Feature | Run Agent | Run & Save Version |
|---------|-----------|-------------------|
| **Look** | Outline (gray border) | Solid (blue fill) |
| **Icon** | ▶ Play | 💾 Save |
| **Creates version** | ❌ | ✅ |
| **Updates switcher** | ❌ | ✅ |
| **Shows toast** | ❌ | ✅ |
| **Best for** | Testing | Production |

---

## 💡 When to Use Each

### **Use "Run Agent" for:**
- ✅ Testing different URLs
- ✅ Trying different Fathom windows
- ✅ Quick iterations
- ✅ Debugging
- ✅ Don't want to clutter version history

### **Use "Run & Save Version" for:**
- ✅ Client presentations
- ✅ Final proposals
- ✅ Creating alternatives
- ✅ Preserving history
- ✅ Version control

---

## 🎬 Example Workflow

### **Creating Your First Proposal:**

```
1. Enter "DEAL-2025-Q4-ACME"
2. Enter "https://acme.com"
3. Select "Last 30 days"
4. Click "Run & Save Version"
5. Wait...
6. See "Proposal v1 saved!"
7. Done! ✅
```

### **Testing Different Parameters:**

```
1. Change URL to "https://test.com"
2. Click "Run Agent"
3. Review results
4. Change URL to "https://another.com"
5. Click "Run Agent" again
6. No versions created (just testing)
```

### **Creating Alternative Proposal:**

```
1. Already have Version 1
2. Change Fathom window to "60 days"
3. Click "Run & Save Version"
4. Version 2 created with new data
5. Can compare v1 vs v2
```

---

## 🔔 What You'll See

### **Success:**
```
Toast notification (top right):
┌────────────────────────┐
│ ✅ Proposal v3 saved!  │
└────────────────────────┘

Version Switcher updates:
📄 Version 3 [Draft] ← New!
```

### **Error:**
```
Toast notification (top right):
┌────────────────────────────┐
│ ❌ Failed to create version│
└────────────────────────────┘
```

---

## 🎯 Pro Tips

1. **Test First** - Use "Run Agent" to test parameters before creating version
2. **Save When Ready** - Use "Run & Save Version" once you're satisfied
3. **Version History** - Each client proposal should be a separate version
4. **Descriptive Deal IDs** - Use clear names like "ACME-Q4-2025" not "test1"
5. **Clean History** - Don't create versions for every test run

---

## 📱 Mobile vs Desktop

### **Desktop:**
```
[  Run Agent  ] [ Run & Save Version ]
  ← Side by side
```

### **Mobile:**
```
[  Run Agent       ]
                    ← Stacked
[ Run & Save Version]
```

---

## ⚠️ Common Questions

**Q: What's the difference between the two buttons?**  
A: "Run Agent" is for testing. "Run & Save Version" creates a new version.

**Q: Which should I use for a client proposal?**  
A: "Run & Save Version" - it creates a proper version in the history.

**Q: Can I undo a version?**  
A: Yes, use the Version Switcher to go back to previous versions.

**Q: What happens if I click "Run Agent" by mistake?**  
A: No problem! It just updates the current version, doesn't create a new one.

**Q: How do I see all my versions?**  
A: Click "▼ Switch Version" in the Version Switcher.

---

## 🎓 Quick Reference

### **"Run Agent" Button:**
- **Color:** Gray outline
- **Icon:** ▶ Play
- **Action:** Executes agent
- **Saves:** Updates current version
- **Creates version:** No
- **Toast:** No

### **"Run & Save Version" Button:**
- **Color:** Blue solid
- **Icon:** 💾 Save  
- **Action:** Creates version + executes agent
- **Saves:** New version with results
- **Creates version:** Yes
- **Toast:** "Proposal v{N} saved!"

---

## 🚀 Get Started

Ready to create your first version?

1. Navigate to **Admin → Agent** tab
2. Fill in the form
3. Click **"Run & Save Version"**
4. Watch the magic happen! ✨

---

**That's it! You now know how to use the Run & Save Version feature.** 🎉

For detailed documentation, see:
- `/RUN_AND_SAVE_VERSION_FEATURE.md` - Complete technical guide
- `/RUN_AND_SAVE_VERSION_VISUAL_GUIDE.md` - Visual examples and mockups
