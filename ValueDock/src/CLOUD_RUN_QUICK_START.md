# Cloud Run - Quick Start Guide

## 🚀 5-Minute Setup

### What You Need
- ✅ Admin access to ValueDock
- ✅ Proposal Agent tab access
- ✅ Valid deal information

---

## 📝 Quick Steps

### 1. Navigate to Proposal Agent
```
Login → Admin Panel → Proposal Agent Tab → Agent Runner
```

### 2. Toggle "Run in Cloud" to ON
Look for the toggle switch in the configuration panel (below OpenAI REST toggle)

### 3. Fill in the Form
- **Deal ID**: `DEAL-2025-001` (or your deal ID)
- **Customer URL**: `https://yourcompany.com`
- **Fathom Window**: Select "Last 30 days" (or preferred range)
- **Organization**: Select target org (if you're an admin)

### 4. Click "Run in Cloud"
The button will change to show loading spinner

### 5. View Results
- ✅ Green "Accepted" badge = Success
- ❌ Red badge = Error (check the log details)

---

## 🎯 Expected Result

```json
{
  "status": "accepted",
  "request_id": "proposal-run-1729123456789-abc123",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "Proposal agent run request accepted and queued"
}
```

---

## ⚡ Quick Test

Copy this into your fields:
- Deal ID: `TEST-CLOUD-001`
- URL: `https://example.com`
- Window: "Last 30 days"

Click "Run in Cloud" → Should see green "Accepted" badge within seconds

---

## 🔧 Troubleshooting

### Problem: "Unauthorized" Error
**Solution**: Sign out and sign back in (token expired)

### Problem: "Missing required fields"
**Solution**: Make sure all fields with * are filled

### Problem: No response appears
**Solution**: 
1. Check browser console (F12) for errors
2. Verify you're in Cloud Run mode (toggle ON)
3. Try refreshing the page

---

## 📚 More Information

- Full guide: `CLOUD_RUN_FEATURE_GUIDE.md`
- Visual guide: `CLOUD_RUN_VISUAL_GUIDE.md`
- API docs: See backend section in feature guide

---

## 💡 Pro Tips

1. **Use meaningful Deal IDs** - They help track requests later
2. **Expand the log panel** - Click header to see full request/response
3. **Check timestamps** - Helps correlate with backend logs
4. **Toggle ON/OFF** - Switch between cloud and local execution anytime

---

**Ready in**: < 5 minutes  
**Difficulty**: Easy  
**Version**: 1.0
