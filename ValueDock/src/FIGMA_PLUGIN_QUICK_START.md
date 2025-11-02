# ValueDock Fathom Loader - Quick Start

## 🚀 5-Minute Setup

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Load in Figma
1. Open Figma Desktop App
2. Menu → Plugins → Development → **Import plugin from manifest...**
3. Select `manifest.json`

### 3. Create Text Layers
Create 5 text layers with these **exact names**:
- `Title`
- `Date`
- `Summary`
- `Bullets`
- `TranscriptLink`

### 4. Run Plugin
1. Menu → Plugins → Development → **ValueDock Fathom Loader**
2. Enter domain: `dockeryai.com`
3. Click **Load Meetings**
4. Select a meeting
5. Click **Apply to Layers**

---

## 📋 Required Files

```
✅ manifest.json          # Figma plugin config
✅ index.html             # Plugin UI
✅ scripts/figmaMeetingSelector.ts  # Controller
✅ package.json           # Build scripts
✅ dist/code.js           # Compiled (auto-generated)
```

---

## ⚙️ Proxy Configuration

**Option 1: Environment Variable**
```bash
export NEXT_PUBLIC_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-fetch
npm run build
```

**Option 2: Manual Entry**
Enter proxy URL in plugin UI (saved automatically)

---

## 🎯 Testing Checklist

### Before Testing
- [ ] Built plugin (`npm run build`)
- [ ] Created 5 text layers (Title, Date, Summary, Bullets, TranscriptLink)
- [ ] Configured proxy URL

### Test Cases
- [ ] Load meetings for valid domain
- [ ] Load more (pagination)
- [ ] Apply to layers
- [ ] Test with empty filters
- [ ] Test with date range
- [ ] Test error handling (invalid domain)

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Plugin won't load | Run `npm run build`, restart Figma |
| UI blank | Check `index.html` exists, check console |
| No meetings | Check domain spelling, verify proxy URL |
| Layers not updating | Check layer names are **exact** (case-sensitive) |
| Network error | Test proxy endpoint with curl/Postman |

---

## 📝 Expected Proxy Response

```json
{
  "items": [
    {
      "id": "94471626",
      "title": "Sales Call",
      "date": "2025-10-15T20:54:42Z",
      "summary": "Meeting summary...",
      "highlights": ["Point 1", "Point 2"],
      "transcript_url": "https://fathom.video/calls/436945936"
    }
  ],
  "next_cursor": null,
  "debug": {
    "raw_count": 10,
    "filtered_count": 5,
    "returned_count": 5
  }
}
```

---

## 🔍 Debugging

**Open Console:**
Menu → Plugins → Development → Open Console

**Check Logs:**
```
[Figma Plugin] Received message: fetch-meetings
[Figma Plugin] Fetching meetings with payload: {...}
[Figma Plugin] Response status: 200
[UI] Received message: meetings
```

---

## 📚 Full Documentation

See `/FIGMA_PLUGIN_SETUP_GUIDE.md` for complete details.

---

**Ready? Run:** `npm run build` and load in Figma! 🎉
