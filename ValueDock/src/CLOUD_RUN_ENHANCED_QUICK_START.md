# Cloud Run Enhanced Features - Quick Start

## ⚡ 3-Minute Setup

### Step 1: Deploy Edge Function (One-Time)

1. **Navigate** to Admin → Proposal Agent tab
2. **Toggle** "Run in Cloud" to ON
3. **Click** "Cloud Run Console" header to expand
4. **Click** "Deploy Edge Function" button
5. **Wait** 5-10 seconds
6. **Verify** you see green "Deployment Verified ✓" badge

✅ **Expected Result:**
```
🚀 Deploying proposal-agent-run edge function...
✅ Edge function deployed successfully

🧪 Running deployment verification test...
✅ Deployment verified - endpoint returning {status:"accepted"}
```

---

### Step 2: Run Your First Cloud Proposal

1. **Fill** the form:
   - Deal ID: `DEMO-2025-001`
   - Customer URL: `https://example.com`
   - Fathom Window: "Last 30 days"
   - Organization: Select from dropdown

2. **Click** "Run in Cloud"

3. **Watch** the Cloud Results panel appear

4. **Check** the status badge:
   - 🔵 Blue "Accepted" = Processing
   - 🟢 Green "Completed" = Success!

---

## 🎯 What You'll See

### Accepted State
```
Status: ⏰ Accepted - Processing
```

### Completed State
```
Status: ✅ Completed
Badge: [Proposal version saved to Supabase]

Final Output: This proposal includes ROI analysis...

Version Number: v3

Deal Link: https://app.com/deals/DEMO-2025-001
[Open]

Request ID: proposal-run-1729123456789-abc123
```

---

## 🔍 Quick Verification

### Deployment Verified?
- [ ] Green "Deployment Verified" badge visible
- [ ] Test payload shown in log
- [ ] Test response shows `{status:"accepted"}`

### Cloud Run Working?
- [ ] Cloud Results panel appeared
- [ ] Status badge shows "Accepted" or "Completed"
- [ ] Request ID is displayed
- [ ] Can expand "View raw response"

---

## 🐛 Quick Fixes

### Deploy button does nothing
**Fix:** Refresh page and try again

### No Cloud Results panel
**Fix:** Make sure "Run in Cloud" toggle is ON

### Status shows "Error"
**Fix:** Check browser console (F12) for details

---

## 📊 Panel Reference

### 🔧 Cloud Run Console (Purple Border)
- **Purpose:** Deploy and test Edge Function
- **Button:** "Deploy Edge Function"
- **States:** Idle → Deploying → Testing → Verified

### 📄 Cloud Results (Blue Border)
- **Purpose:** Show proposal run results
- **Appears:** After clicking "Run in Cloud"
- **Shows:** Status, Final Output, Version, Deal Link

---

## 💡 Pro Tips

1. **Deploy once** - Edge function stays deployed
2. **Watch badges** - Color = status (blue=processing, green=done)
3. **Open deal link** - Quick access to your proposal
4. **Collapse panels** - Click header to hide/show
5. **Raw response** - Use "View raw response" for debugging

---

## 🎓 Next Steps

- Read full guide: `CLOUD_RUN_ENHANCED_GUIDE.md`
- Learn API: See "API Contracts" section
- Troubleshoot: See "Troubleshooting" section

---

**Ready in:** < 3 minutes  
**Difficulty:** Easy  
**Version:** 2.0 (Enhanced)
