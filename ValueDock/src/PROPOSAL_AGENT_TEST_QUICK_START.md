# Proposal Agent Test Features - Quick Start

## ⚡ 30-Second Overview

**New testing and debugging features for the Proposal Agent:**

1. **Test Run** - Quick test with dummy data
2. **Smoke Test** - Verify all tool calls
3. **Versions Log** - View version history
4. **OpenAI REST Toggle** - Debug mode with HTTP logging

---

## 🚀 Quick Start (5 Minutes)

### **Step 1: Navigate to Proposal Agent** (30 sec)
```
Admin → Agent → Proposal Builder
```

### **Step 2: Run Smoke Test** (1 min)
```
1. Click "Smoke Test" button
2. Watch console log:
   🧪 Starting Smoke Test...
   🌐 fetch_url → Success
   🎤 fathom.get_meetings → Success
   💾 valuedock.put_proposal → Success
   🎨 gamma.create_deck → Success
   ✨ Complete!

3. Click "Show Assistant Text" to see output
4. Toast: "Smoke test completed!"
```

### **Step 3: Run Test with Placeholder Data** (1 min)
```
1. Click "Test Run" button
2. Observe logs:
   🚀 Starting Test Run...
   📋 Using placeholder IDs
   🌐 Fetching site...
   💰 Analyzing ROI...
   💾 Saving version...
   ✨ Complete!

3. Click "Show Final Output"
4. Review generated test proposal
```

### **Step 4: View Version History** (1 min)
```
1. Click "Versions Log" tab
2. See all saved versions
3. Click "View JSON" on any version
4. Check console for full data
```

### **Step 5: Enable Debug Mode** (30 sec)
```
1. Toggle "Use OpenAI REST (no SDK)" ON
2. Run any test
3. Check logs for HTTP metadata
4. See inline API errors if any
```

---

## 🎯 Common Tasks

### **Task: Verify System is Working**
```
1. Click "Smoke Test"
2. Wait for all ✅ checkmarks
3. Read "Smoke test completed!" toast
Result: System operational ✓
```

### **Task: Debug Failed Proposal**
```
1. Toggle "Use OpenAI REST" ON
2. Click "Run Agent"
3. Check console logs for HTTP details
4. Look for inline API errors
Result: Root cause identified ✓
```

### **Task: Audit Version History**
```
1. Switch to "Versions Log" tab
2. Find version by date/creator
3. Click "View JSON"
4. Inspect console output
Result: Version data retrieved ✓
```

### **Task: Test Without Real Data**
```
1. Click "Test Run"
2. Uses dummy IDs automatically
3. Review logs and output
Result: Safe testing ✓
```

---

## 📊 Feature Comparison

| Feature | Test Run | Smoke Test | Versions Log |
|---------|----------|------------|--------------|
| **Purpose** | Full workflow test | Tool call verification | Audit trail |
| **Uses Real Data** | No (placeholders) | No (placeholders) | Yes (existing) |
| **Shows Console Log** | ✅ Yes | ✅ Yes | ❌ No |
| **Shows Output** | ✅ Yes (collapsible) | ✅ Yes (collapsible) | ❌ No |
| **Runs Tools** | ✅ All | ✅ All | ❌ N/A |
| **Duration** | ~3 seconds | ~2.5 seconds | Instant |
| **Safe for Prod** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🎨 UI Reference

### **Agent Runner Tab**
```
┌────────────────────────────────────┐
│ Agent Configuration                │
│                                    │
│ Deal ID: [____________________]    │
│ URL:     [____________________]    │
│                                    │
│ ┌────────────────────────────────┐│
│ │ Use OpenAI REST (no SDK) [⚪] ││
│ │ Direct HTTP logging           ││
│ └────────────────────────────────┘│
│                                    │
│ [Test Run]    [Smoke Test]         │
│ ────────────────────────────────   │
│ [Run Agent]   [Run & Save Version] │
└────────────────────────────────────┘
```

### **Console Log Display**
```
┌────────────────────────────────────┐
│ Test Run Console                   │
├────────────────────────────────────┤
│ 🚀 Starting Test Run...           │
│ 📋 Using placeholder IDs           │
│ 🌐 Fetching site → Complete       │
│ 💰 Analyzing ROI → Complete       │
│ 💾 Saving version → Complete      │
│ ✨ Test Run Complete!             │
│                                    │
│ [▼ Show Final Output]              │
└────────────────────────────────────┘
```

### **Versions Log Tab**
```
┌────────────────────────────────────┐
│ Version Activity Log               │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Version 3 [Draft] [Current]   │ │
│ │ Oct 16, 2025 2:30 PM          │ │
│ │                  [View JSON]  │ │
│ │                               │ │
│ │ Created by: John Doe          │ │
│ │ ID: deal-001-v3-17296...      │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### **"Test Run" button disabled**
**Issue**: Other test is running  
**Solution**: Wait for current test to complete

### **No versions showing in log**
**Issue**: No proposals created yet  
**Solution**: Run agent at least once with valid Deal ID

### **"View JSON" does nothing**
**Issue**: Data logged to console only  
**Solution**: Open browser DevTools → Console tab

### **OpenAI REST toggle not working**
**Issue**: Backend not configured for REST mode  
**Solution**: Feature uses simulated responses for now

---

## 📋 Testing Checklist

Before deploying to production:

- [ ] Run Smoke Test → All tools show ✅
- [ ] Run Test Run → Output displays correctly
- [ ] Check Versions Log → Shows all versions
- [ ] Toggle OpenAI REST → No errors
- [ ] Run actual proposal → Completes successfully
- [ ] Check console logs → No unexpected errors
- [ ] Verify version saved → Appears in log
- [ ] Click View JSON → Data logged to console

---

## 💡 Pro Tips

### **Tip 1: Use Test Run First**
Always run "Test Run" before trying with real data. Verifies system without making API calls.

### **Tip 2: Enable REST Mode for Debugging**
When troubleshooting API issues, toggle "Use OpenAI REST" ON to see full HTTP logs.

### **Tip 3: Check Console for Details**
Both tests log extensive details to browser console. Keep DevTools open while testing.

### **Tip 4: Versions Log for Audit**
Use "Versions Log" to track who created what and when. Great for team accountability.

### **Tip 5: Collapsible Outputs**
Click "Show/Hide" toggles to manage screen space while reviewing multiple test outputs.

---

## 🎯 Example Workflows

### **Workflow 1: Daily Health Check**
```
1. Open Proposal Agent
2. Click "Smoke Test"
3. Verify all ✅ checkmarks
4. Done! (30 seconds)
```

### **Workflow 2: Debug Failed Proposal**
```
1. Toggle "Use OpenAI REST" ON
2. Enter problematic Deal ID & URL
3. Click "Run Agent"
4. Review console logs
5. Identify error in HTTP response
6. Fix and retry (5 minutes)
```

### **Workflow 3: Version Audit**
```
1. Switch to "Versions Log" tab
2. Scan for specific date range
3. Click "View JSON" on suspicious version
4. Compare with previous version
5. Identify changes (3 minutes)
```

---

## 🚨 Warning Messages

### **When you see: "Test run failed"**
- Check backend logs
- Verify API keys configured
- Try "Smoke Test" first

### **When you see: "Smoke test failed"**
- One or more tools not responding
- Check backend availability
- Review error logs

### **When you see: "Failed to fetch version data"**
- Version may not exist
- Check dealId and orgId are correct
- Try refreshing page

---

## 📚 Related Guides

- [Full Documentation](/PROPOSAL_AGENT_TEST_FEATURES.md)
- [Proposal Agent Guide](/PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md)
- [Version Management](/PROPOSAL_VERSION_SWITCHER_IMPLEMENTATION.md)

---

## ✅ Quick Reference

| Button | Action | Duration | Output |
|--------|--------|----------|--------|
| **Test Run** | Full test with placeholders | ~3s | Console + Output |
| **Smoke Test** | Tool call verification | ~2.5s | Console + Assistant Text |
| **View JSON** | Fetch version data | Instant | Console log |
| **OpenAI REST** | Enable HTTP logging | N/A | Enhanced logs |

---

**Status**: ✅ Ready to Use  
**Location**: Admin → Agent → Proposal Builder  
**Last Updated**: October 16, 2025
