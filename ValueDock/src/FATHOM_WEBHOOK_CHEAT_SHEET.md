# 🎣 Fathom Webhook - Quick Reference Card

> **Print this page or bookmark for instant reference!**

---

## 🚀 3-Step Setup

### 1️⃣ Copy Webhook URL
```
ValueDock → Presentation Screen → Fathom Webhook Setup → [Copy Button]
```

### 2️⃣ Add to Fathom
```
https://app.fathom.video/settings/integrations
→ Webhooks → Add Webhook → Paste URL → meeting.completed → Save
```

### 3️⃣ Test It
```
Complete test meeting → Wait 2 min → ValueDock → Webhook Status → Refresh
```

---

## 🎯 What Does It Do?

| Feature | What It Does |
|---------|--------------|
| **Meeting History** | Auto-generates executive summary from all meetings |
| **Challenge Extraction** | AI pulls business challenges from transcripts |
| **Goal Extraction** | AI identifies business objectives from conversations |
| **Auto-Sync** | New meetings appear automatically (1-2 min delay) |

---

## 🔧 Using AI Features

```
1. Enter Company Website (e.g., acme.com)
2. Click "Generate with AI" next to:
   • Meeting History
   • Challenges  
   • Goals
3. AI processes webhook data automatically
```

---

## ✅ Success Checklist

- [ ] Webhook URL copied
- [ ] Added to Fathom settings
- [ ] Event: `meeting.completed` selected
- [ ] Test meeting completed
- [ ] Meeting appears in Webhook Status tab
- [ ] AI features working

---

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| **No meetings showing** | Check webhook configured in Fathom settings |
| **Wrong domain** | Attendees must have email with company domain |
| **AI not working** | Verify meetings show in Webhook Status first |
| **Webhook URL wrong** | Copy directly from UI, don't type manually |

---

## 📍 Key Locations

| What | Where |
|------|-------|
| **Setup UI** | Presentation Screen → Fathom Webhook Setup card |
| **Meeting Status** | Webhook Status tab in setup card |
| **AI Features** | Presentation Screen → Executive Summary section |
| **Diagnostic** | Bottom-left corner → "🔍 Fathom Diagnostic" |
| **Debug Console** | Bottom-right corner → "Show Debug Console" |

---

## 🔗 Quick Links

- **Fathom Settings:** [app.fathom.video/settings/integrations](https://app.fathom.video/settings/integrations)
- **Quick Start Guide:** `/FATHOM_WEBHOOK_QUICK_START.md`
- **Full Documentation:** `/FATHOM_WEBHOOK_IMPLEMENTATION.md`

---

## 📊 Webhook URL Format

```
https://{your-project-id}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook
```

**Event to select in Fathom:** `meeting.completed`

---

## 💡 Pro Tips

✨ **Tip #1:** Meetings appear automatically 1-2 minutes after completion  
✨ **Tip #2:** AI works best with transcripts (Fathom Pro required)  
✨ **Tip #3:** Use specific company domains for accurate filtering  
✨ **Tip #4:** Check Webhook Status tab to verify data is flowing  
✨ **Tip #5:** Run Diagnostic tool if anything seems wrong  

---

## 🎯 Data Flow (Simple)

```
[Fathom Meeting Ends]
       ↓
[Fathom Sends Webhook] (1-2 min)
       ↓
[ValueDock Stores Data]
       ↓
[Visible in Webhook Status]
       ↓
[AI Features Use Data]
```

---

## 📞 Get Help

1. **Quick Help:** Click "🔍 Fathom Diagnostic" (bottom-left)
2. **Full Guide:** Read `/FATHOM_WEBHOOK_QUICK_START.md`
3. **Technical:** See `/FATHOM_WEBHOOK_IMPLEMENTATION.md`
4. **Logs:** Supabase Dashboard → Edge Functions → Search `[FATHOM-WEBHOOK]`

---

## ✅ One-Line Test

**After setup, verify it works:**
```
Complete meeting → Wait 2 min → Presentation → Webhook Status → Click Refresh → See meeting ✓
```

---

**🎉 That's it! You're ready to use Fathom webhooks in ValueDock!**

---

*Quick Reference v1.0 | Oct 2025*  
*Bookmark this page: `/FATHOM_WEBHOOK_CHEAT_SHEET.md`*
