# Proposal Version Switcher - Quick Start

## 🚀 5-Minute Guide

### **What Is It?**
Version control for AI-generated proposals. Create multiple versions, switch between them, and track changes over time.

---

## 📍 Where to Find It

```
Menu → Admin → Agent Tab → Top of Proposal Builder
```

You'll see:
- **Breadcrumb:** Shows Tenant → Organization → Deal
- **Version Badge:** Current version number and status
- **Buttons:** Switch Version | + New Version

---

## 🎯 Quick Actions

### **1. Create Your First Proposal**

```
1. Enter Deal ID: "DEAL-2025-001"
2. Select Organization from dropdown
3. Enter Customer URL: "https://company.com"
4. Click "Run Proposal Agent"

✅ Version 1 automatically created!
```

**What Happens:**
- Breadcrumb appears showing hierarchy
- Version 1 badge shows [Draft] status
- Agent runs and saves results to V1

---

### **2. Create an Alternative Version**

```
1. Click "+ New Version" button
2. Version 2 is created (copies V1 data)
3. Modify Customer URL or Fathom window
4. Click "Run Proposal Agent" again

✅ Now you have 2 versions to compare!
```

**Use Case:**
- Test different Fathom time windows
- Try different customer websites
- Create multiple proposals for same deal

---

### **3. Switch Between Versions**

```
1. Click "▼ Switch Version"
2. Select "Version 1" from dropdown
3. View original proposal

To go back:
- Click "▼ Switch Version"
- Select "Version 2"
```

**What Gets Loaded:**
- ✅ Form fields (URL, Fathom window)
- ✅ Execution logs from that run
- ✅ Results (Gamma link, ValueDock data)

---

### **4. View Version Details**

Click "▼ Switch Version" to see:

```
Version 3 ✓              [Draft]
📅 Oct 16, 2025 2:30 PM
👤 John Smith

Version 2                [Review]
📅 Oct 15, 2025 10:15 AM
👤 Jane Doe

Version 1                [Approved]
📅 Oct 14, 2025 3:45 PM
👤 John Smith
```

Each entry shows:
- Version number
- Status badge (color-coded)
- Creation date/time
- Who created it
- ✓ Checkmark on current version

---

## 📊 Status Meanings

| Status | Color | Meaning |
|--------|-------|---------|
| **Draft** | Gray | Work in progress |
| **Review** | Blue | Submitted for review |
| **Approved** | Green | Finalized, ready to send |
| **Archived** | Orange | Old version, superseded |

---

## 🔄 Common Workflows

### **Workflow 1: Iterative Refinement**

```
Day 1: Create Version 1 with 30-day Fathom window
       ↓
       Review results, need more meeting data
       ↓
       Create Version 2 with 60-day window
       ↓
       Compare results between V1 and V2
       ↓
       Choose best version to present
```

### **Workflow 2: A/B Testing**

```
Same Deal, Different Approaches:

Version 1: Focus on primary website
Version 2: Include subsidiary website
Version 3: Combine both approaches

Compare all three → Pick winner
```

### **Workflow 3: Client Revisions**

```
Version 1: Initial proposal (Approved)
       ↓
Client requests changes
       ↓
Version 2: Updated with new data (Draft)
       ↓
Client reviews Version 2
       ↓
Version 2: Approved (Both versions kept)
```

---

## 🎯 Pro Tips

### **Tip 1: Use Descriptive Deal IDs**
```
✅ Good: ACME-Q4-2025-ENTERPRISE
✅ Good: DEAL-2025-001-WESTCOAST
❌ Avoid: deal1, test, proposal
```

### **Tip 2: Create Versions Before Major Changes**
```
Before changing Customer URL or Fathom window:
→ Click "+ New Version" first
→ Make changes in new version
→ Keep old version as backup
```

### **Tip 3: Review History Before Client Meetings**
```
Before presentation:
→ Click "▼ Switch Version"
→ Review all versions
→ Pick best one for client
→ Have alternatives ready
```

### **Tip 4: Use Status to Track Progress**
```
Start:     Version 1 [Draft]
           ↓
Internal:  Version 1 [Review]
           ↓
Client:    Version 1 [Approved]
           ↓
Next deal: Version 1 [Archived]
```

---

## 🏢 Breadcrumb Navigation

### **What You'll See:**

**Master Admin:**
```
🏢 [Global] → 🏢 Acme Corp → 📄 DEAL-2025-001
```

**Tenant Admin:**
```
🏢 Tech Solutions → 🏢 West Division → 📄 ENT-Q4-2025
```

**Org Admin:**
```
🏢 Sales Department → 📄 SALES-2025-10
```

### **What It Tells You:**
- ✅ Which tenant (if applicable)
- ✅ Which organization
- ✅ Which deal you're working on
- ✅ Full context at a glance

---

## ⚡ Keyboard Shortcuts (Future)

Coming soon:
- `Ctrl/Cmd + N` - New Version
- `Ctrl/Cmd + S` - Save Current Version
- `Ctrl/Cmd + ↑/↓` - Navigate Versions

---

## 🐛 Troubleshooting

### **"No versions available"**
**Fix:** Enter a Deal ID first. Version 1 auto-creates once you enter a deal.

### **"Cannot create version"**
**Fix:** Make sure you have:
- Valid Deal ID entered
- Organization selected
- Current version exists

### **"Version not loading"**
**Fix:** 
- Check your internet connection
- Verify you have access to the organization
- Try switching to another version first

### **Breadcrumb not showing**
**Fix:**
- Enter Deal ID to see breadcrumb
- Select organization to populate names
- Refresh if data doesn't load

---

## 📋 Checklist: First Time Setup

Before creating your first version:

- [ ] Navigate to Admin → Agent tab
- [ ] See "Proposal Builder" header
- [ ] Enter Deal ID
- [ ] Select Organization
- [ ] Enter Customer URL
- [ ] Choose Fathom window

After running agent:

- [ ] See Version 1 badge appear
- [ ] See breadcrumb with hierarchy
- [ ] View execution logs
- [ ] Access Gamma link in results
- [ ] Click "+ New Version" to test

---

## 🎯 When to Use Each Feature

### **Use "Switch Version" When:**
- Reviewing historical proposals
- Comparing different approaches
- Showing alternatives to clients
- Auditing past work

### **Use "+ New Version" When:**
- Testing different parameters
- Creating alternatives
- Making major changes
- Starting fresh iteration

### **Use Breadcrumb For:**
- Confirming correct organization
- Understanding context
- Navigating hierarchy
- Quick reference

---

## 📊 Quick Reference Table

| Action | Button/Control | Result |
|--------|---------------|--------|
| View current version | Top badge | Shows version # and status |
| See all versions | ▼ Switch Version | Opens dropdown with history |
| Change version | Click version in dropdown | Loads that version's data |
| Create new version | + New Version | Creates next version number |
| See context | Breadcrumb at top | Shows Tenant → Org → Deal |
| View creator | Version dropdown | Shows who made each version |
| Check timestamp | Version dropdown | Shows when created |

---

## 🚀 Next Steps

After mastering the basics:

1. **Experiment** - Create multiple versions for practice
2. **Compare** - Switch between versions to see differences
3. **Document** - Use versions to track proposal evolution
4. **Present** - Keep multiple versions for client options
5. **Archive** - Mark old versions as Archived when done

---

## 💡 Remember

- ✅ Version 1 auto-creates when you enter Deal ID
- ✅ New versions clone current version's data
- ✅ All versions are saved automatically
- ✅ Switch freely between versions anytime
- ✅ Each version is independent
- ✅ Old versions never get deleted

---

**You're ready to start using version control for your proposals!** 🎉

For detailed information, see `/PROPOSAL_VERSION_SWITCHER_IMPLEMENTATION.md`
