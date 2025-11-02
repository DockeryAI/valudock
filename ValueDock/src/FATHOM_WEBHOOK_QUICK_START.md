# 🚀 Fathom Webhook Quick Start Guide

## 🎯 What This Does
Automatically pulls meeting data from Fathom into ValueDock using webhooks (bypasses DNS issues).

## 🔒 Important: Domain Filtering
**The system ONLY processes meetings for the specific company domain you enter.**
- ✅ Enter `acme.com` → Get ONLY ACME Corp meetings
- ✅ AI extracts ONLY ACME-specific challenges and goals
- ❌ Other companies' meetings are automatically excluded

📖 **[Read Full Domain Filtering Guarantee](./DOMAIN_FILTERING_GUARANTEE.md)**

---

## ⚡ 3-Minute Setup

### Step 1️⃣: Get Your Webhook URL (30 seconds)

1. Login to ValueDock
2. Go to **Presentation Screen**
3. Scroll to **Fathom Webhook Setup** card (blue border)
4. Click **Copy** button next to the webhook URL

**Your URL looks like:**
```
https://{your-project}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook
```

---

### Step 2️⃣: Configure in Fathom (1 minute)

1. Open **[Fathom Settings](https://app.fathom.video/settings/integrations)** → Integrations
2. Find **Webhooks** section → Click **Add Webhook**
3. **Paste** your webhook URL
4. Select event: `meeting.completed`
5. Click **Save**

**Screenshot Guide:**
```
Fathom Settings
  └─ Integrations
      └─ Webhooks
          └─ [Add Webhook]
              ├─ URL: [paste here]
              ├─ Event: meeting.completed ✓
              └─ [Save]
```

---

### Step 3️⃣: Test It (1 minute)

1. Complete a **test meeting** in Fathom (or use an existing one)
2. Wait 1-2 minutes for Fathom to send webhook
3. In ValueDock → **Webhook Status** tab → Click **Refresh**
4. ✅ Your meeting should appear!

---

## 🎨 Using the Features

### Generate Meeting History
1. Enter **Company Website** (e.g., `acme.com`)
2. Click **Generate with AI** next to "Meeting History"
3. AI creates executive summary from all webhook meetings

### Extract Challenges
1. Click **Generate with AI** next to "Challenges"
2. AI analyzes meeting transcripts
3. Automatically extracts 3-5 key business challenges

### Extract Goals
1. Click **Generate with AI** next to "Goals"
2. AI analyzes meeting transcripts
3. Automatically extracts 3-5 business goals

---

## ✅ Success Indicators

**Webhook Working:**
- ✅ Meetings appear in "Webhook Status" tab
- ✅ Meeting count shows > 0
- ✅ Can see attendees, titles, summaries

**AI Features Working:**
- ✅ "Generate with AI" completes successfully
- ✅ Meeting history text populates
- ✅ Challenges/goals appear with descriptions

---

## 🐛 Troubleshooting

### No Meetings Showing?

**Check #1:** Webhook configured correctly?
- Go to Fathom → Settings → Integrations → Webhooks
- Verify URL matches exactly
- Verify event is `meeting.completed`

**Check #2:** Meeting completed with right attendees?
- Attendees must have email with your company domain
- Example: If searching for `acme.com`, need `john@acme.com` as attendee

**Check #3:** Waited long enough?
- Fathom sends webhooks 1-2 minutes after meeting ends
- Click "Refresh" in Webhook Status tab

### AI Not Working?

**Problem:** "No meetings found"
- ✅ **Solution:** Configure webhook (see above)

**Problem:** "No transcripts available"
- ✅ **Solution:** Requires Fathom Pro plan with transcript feature

**Problem:** API error
- ✅ **Solution:** Check OPENAI_API_KEY is configured in Supabase

---

## 📊 Data Flow

```
[Fathom Meeting Ends]
        ↓
[Fathom sends webhook]
        ↓
[ValueDock receives & stores]
        ↓
[Visible in Webhook Status]
        ↓
[AI processes for insights]
```

---

## 🎁 Benefits

✅ **Automatic** - No manual exports  
✅ **Real-time** - Data arrives instantly  
✅ **Reliable** - Bypasses DNS issues  
✅ **Intelligent** - AI extracts insights  
✅ **Organized** - Sorted by company domain  

---

## 📚 Need More Help?

- **Full Documentation:** See `/FATHOM_WEBHOOK_IMPLEMENTATION.md`
- **Diagnostic Tool:** Click "🔍 Fathom Diagnostic" (bottom-left)
- **Debug Console:** Click "Show Debug Console" (bottom-right)

---

## 🎉 You're All Set!

Your ValueDock is now connected to Fathom via webhooks. Every completed meeting will:
1. Automatically flow into ValueDock
2. Be available for AI processing
3. Power your presentation builder

**Happy presenting!** 🚀

---

*Setup Time: ~3 minutes*  
*Difficulty: Easy* ⭐⭐☆☆☆  
*Reliability: Excellent* ✅✅✅✅✅
