# 📝 Manual Transcript Upload - Quick Reference

## 🎯 30-Second Guide

**Location**: Admin → Proposal Agent → Edit Content → Challenges & Goals

**Steps**:
1. Toggle "Use manual transcript" to **ON**
2. Paste meeting notes in textarea
3. See section count update
4. Click "Fetch from Fathom"
5. ✅ Challenges extracted!

---

## 🎨 Visual States

### OFF (API Mode - Default)
```
┌────────────────────────────────────┐
│ Use manual transcript     [OFF]    │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ 🎤 API mode enabled.               │
│    Fetches from Fathom (last 30d)  │
└────────────────────────────────────┘
```

### ON (Manual Mode)
```
┌────────────────────────────────────┐
│ Use manual transcript     [ON]     │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Transcript Text                    │
│ ┌────────────────────────────────┐ │
│ │ Paste meeting notes here...    │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│ 3 section(s) detected              │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ ℹ️ Manual mode enabled.             │
│    Click "Fetch" to process.       │
└────────────────────────────────────┘
```

---

## 📊 Two Modes Comparison

| Aspect | API Mode (OFF) | Manual Mode (ON) |
|--------|----------------|------------------|
| **Source** | Fathom API | Pasted text |
| **Input** | None required | Paste transcript |
| **Range** | Last 30 days | N/A |
| **Validation** | None | Non-empty check |
| **Payload** | `{start, end, tags}` | `{transcripts_text}` |

---

## 📡 API Payloads

### Manual Mode
```json
{
  "tenant_id": "...",
  "org_id": "...",
  "deal_id": "...",
  "transcripts_text": [
    "Section 1 text...",
    "Section 2 text...",
    "Section 3 text..."
  ]
}
```

### API Mode
```json
{
  "tenant_id": "...",
  "org_id": "...",
  "deal_id": "...",
  "start": "2025-09-16",
  "end": "2025-10-16",
  "tags": ""
}
```

---

## 💡 Pro Tips

### Formatting Transcripts
✅ **Good**:
```
Customer mentioned 500 invoices/month manually processed.
Takes 3 FTEs full-time.

Goal: Reduce to 1 FTE, improve accuracy.

Budget: $75K implementation.
```

❌ **Not Ideal**:
```
Customer mentioned 500 invoices/month manually processed. Takes 3 FTEs full-time. Goal: Reduce to 1 FTE, improve accuracy. Budget: $75K implementation.
```

### Section Separation
- Use **blank lines** (double newline: `\n\n`)
- Each section = one topic/theme
- More sections = better extraction

### What to Include
✅ Pain points & challenges  
✅ Goals & objectives  
✅ Budget & timeline  
✅ Specific numbers  
✅ Stakeholder quotes  

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Section count is 1 | Add blank lines between topics |
| "Please enter transcript text" | Toggle is ON but textarea empty |
| No extraction | Backend not implemented yet |
| Content doesn't refresh | Check browser console for errors |

---

## 🎯 Use Cases

### 1. Fathom API Down
Toggle ON → Paste → Fetch

### 2. External Meetings
(Zoom, Teams, Google Meet)
Copy transcript → Paste → Fetch

### 3. Handwritten Notes
Type notes → Separate with blank lines → Fetch

### 4. Email Conversations
Copy email thread → Paste → Fetch

### 5. Testing
Create sample transcript → Test extraction

---

## 📚 Agent Tool Reference

**Updated AI Prompt** (shown in UI):

> **Agent Tool:** Agent prefers the tool `fathom_fetch` for pulling call transcripts and extracting challenges/goals via our Edge Function.

**When Manual Mode ON**:
- Sends `transcripts_text` array to `fathom_fetch` tool
- Tool extracts challenges & goals
- Saves to Supabase challenges section

---

## ✅ Quick Checklist

### Before Using Manual Mode
- [ ] Have meeting notes ready
- [ ] Notes include challenges and goals
- [ ] Separated into logical sections

### Using Manual Mode
- [ ] Toggle "Use manual transcript" ON
- [ ] Paste notes in textarea
- [ ] Check section count (should be 2+)
- [ ] Click "Fetch from Fathom"
- [ ] Wait for success toast
- [ ] Review extracted content

### After Success
- [ ] Content refreshed in panel
- [ ] Textarea cleared (ready for next)
- [ ] Can toggle back to API mode

---

## 🎨 Color Coding

| Element | Color | Purpose |
|---------|-------|---------|
| **Card Border** | Purple | Distinguishes from Fathom API card |
| **Badge** | Purple "Fallback" | Indicates alternative mode |
| **Toggle** | Blue/Gray | Standard switch |
| **Textarea** | Default | Input area |
| **Alert (Manual)** | Purple | Manual mode status |
| **Alert (API)** | Blue | API mode status |

---

## 🚀 Quick Actions

**Enable Manual Mode**: Click toggle → ON

**Paste Transcript**: Click textarea → Ctrl+V / Cmd+V

**Check Sections**: Look at counter below textarea

**Process**: Click "Fetch from Fathom" button

**Switch Back**: Toggle → OFF (returns to API mode)

---

**Quick Access**: Admin → Proposal Agent → Edit Content → Challenges & Goals  
**Documentation**: [MANUAL_TRANSCRIPT_UPLOAD_COMPLETE.md](MANUAL_TRANSCRIPT_UPLOAD_COMPLETE.md)  
**Status**: ✅ Ready to use (Backend pending)
