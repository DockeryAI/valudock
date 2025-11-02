# ValueDock Fathom Loader - Visual Guide

## 📸 Step-by-Step with Screenshots

### Step 1: Create Text Layers in Figma

**Before:**
```
┌─────────────────────────────────────┐
│  Empty Figma Frame                  │
│                                     │
│  (No text layers yet)               │
│                                     │
└─────────────────────────────────────┘
```

**Create these layers:**
```
Frame: "Meeting Card"
  ├─ Text: "Title"        → Type: Text, Font: Inter Regular
  ├─ Text: "Date"         → Type: Text, Font: Inter Regular
  ├─ Text: "Summary"      → Type: Text, Font: Inter Regular
  ├─ Text: "Bullets"      → Type: Text, Font: Inter Regular
  └─ Text: "TranscriptLink" → Type: Text, Font: Inter Regular
```

**After:**
```
┌─────────────────────────────────────┐
│  Meeting Card                       │
│                                     │
│  Title: Title                       │
│  Date: Date                         │
│  Summary: Summary                   │
│  Bullets: Bullets                   │
│  TranscriptLink: TranscriptLink     │
│                                     │
└─────────────────────────────────────┘
```

---

### Step 2: Build & Load Plugin

**Terminal:**
```bash
$ npm run build

> valuedock-fathom-figma-plugin@1.0.0 build
> esbuild scripts/figmaMeetingSelector.ts --bundle --outfile=dist/code.js --format=cjs --platform=browser

  dist/code.js  15.2kb

✅ Build successful
```

**Figma Menu:**
```
Menu → Plugins → Development → Import plugin from manifest...
  ↓
[File picker: Select manifest.json]
  ↓
✅ Plugin loaded: "ValueDock Fathom Loader"
```

---

### Step 3: Open Plugin UI

**Figma Menu:**
```
Menu → Plugins → Development → ValueDock Fathom Loader
```

**Plugin Window Opens:**
```
┌────────────────────────────────────────┐
│ ValueDock Fathom Loader          [×]   │
├────────────────────────────────────────┤
│                                        │
│ Proxy URL (optional if env is set)    │
│ [___________________________________]  │
│ Only needed if NEXT_PUBLIC_PROXY_URL   │
│ is not set                             │
│                                        │
│ Primary Domain *                       │
│ [___________________________________]  │
│                                        │
│ Alias Domains (comma-separated)        │
│ [___________________________________]  │
│                                        │
│ Specific Emails (comma-separated)      │
│ [___________________________________]  │
│                                        │
│ Since (optional)    Until (optional)   │
│ [_____________]    [_____________]     │
│                                        │
│ Limit per request                      │
│ [50___]                                │
│                                        │
│ [Load Meetings] [Load More]            │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ No meetings loaded yet.        │    │
│ │ Enter a domain and click       │    │
│ │ "Load Meetings".               │    │
│ └────────────────────────────────┘    │
│                                        │
│ [       Apply to Layers        ]       │
│ Create text layers named: Title,       │
│ Date, Summary, Bullets, TranscriptLink │
│                                        │
│ ▶ Debug Info                           │
│                                        │
└────────────────────────────────────────┘
```

---

### Step 4: Enter Domain & Load

**Fill in domain:**
```
┌────────────────────────────────────────┐
│ Primary Domain *                       │
│ [dockeryai.com__________________]      │
└────────────────────────────────────────┘
```

**Click "Load Meetings":**
```
┌────────────────────────────────────────┐
│ ⟳ Loading meetings...                  │
├────────────────────────────────────────┤
│ [Load Meetings] [Load More]            │
│ (buttons disabled while loading)       │
└────────────────────────────────────────┘
```

---

### Step 5: Meetings Appear

**After loading:**
```
┌────────────────────────────────────────┐
│ ValueDock Fathom Loader          [×]   │
├────────────────────────────────────────┤
│ ... (filters collapsed for space) ...  │
│                                        │
│ [Load Meetings] [Load More]            │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ 10/15/24, 8:54 PM  Sales Call  │    │
│ │ 10/14/24, 2:30 PM  Tech Review │    │
│ │ 10/13/24, 11:00 AM Discovery   │    │
│ │ 10/12/24, 4:15 PM  Q4 Planning │    │
│ │ 10/11/24, 9:00 AM  Weekly Sync │    │
│ └────────────────────────────────┘    │
│                                        │
│ [       Apply to Layers        ]       │
│                                        │
└────────────────────────────────────────┘
```

---

### Step 6: Select a Meeting

**Click on "Sales Call":**
```
┌────────────────────────────────────────┐
│ ┌────────────────────────────────┐    │
│ │ 10/15/24, 8:54 PM  Sales Call  │◄─ Selected (blue bg)
│ │ 10/14/24, 2:30 PM  Tech Review │    │
│ │ 10/13/24, 11:00 AM Discovery   │    │
│ └────────────────────────────────┘    │
│                                        │
│ [       Apply to Layers        ]       │
│         ▲ Now enabled!                 │
└────────────────────────────────────────┘
```

---

### Step 7: Apply to Layers

**Click "Apply to Layers":**
```
✅ Notification appears:
   "✓ Updated 5 text layers"
```

**Figma layers update:**

**Before:**
```
┌─────────────────────────────────────┐
│  Meeting Card                       │
│                                     │
│  Title: Title                       │
│  Date: Date                         │
│  Summary: Summary                   │
│  Bullets: Bullets                   │
│  TranscriptLink: TranscriptLink     │
└─────────────────────────────────────┘
```

**After:**
```
┌──────────────────────────────────────────────────┐
│  Meeting Card                                    │
│                                                  │
│  Title: Sales Discovery Call                    │
│  Date: 10/15/2024, 8:54:42 PM                   │
│  Summary: Discussed automation opportunities    │
│  for invoice processing. Customer currently     │
│  processes 500+ invoices monthly with manual    │
│  entry. Looking for 70% time reduction.         │
│                                                  │
│  Bullets:                                        │
│  • Currently processing 500+ invoices/month     │
│  • Team of 3 spends 6 hours daily               │
│  • Integration with QuickBooks required         │
│  • Target: 70% time reduction                   │
│                                                  │
│  TranscriptLink:                                 │
│  https://fathom.video/calls/436945936           │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Real-World Example: Sales Deck

### Template Slide (Before)

```
╔═══════════════════════════════════════════════════╗
║  Recent Customer Conversations                    ║
║                                                   ║
║  Meeting: Title                                   ║
║  Date: Date                                       ║
║                                                   ║
║  What We Discussed:                               ║
║  Summary                                          ║
║                                                   ║
║  Key Takeaways:                                   ║
║  Bullets                                          ║
║                                                   ║
║  View Recording: TranscriptLink                   ║
╚═══════════════════════════════════════════════════╝
```

### After Loading Meeting Data

```
╔═══════════════════════════════════════════════════╗
║  Recent Customer Conversations                    ║
║                                                   ║
║  Meeting: Sales Discovery Call                   ║
║  Date: October 15, 2024 at 8:54 PM               ║
║                                                   ║
║  What We Discussed:                               ║
║  Customer is processing 500+ invoices monthly     ║
║  with manual data entry. Current process          ║
║  involves 3 team members spending 2 hours daily.  ║
║  Looking for automation solution to integrate     ║
║  with existing QuickBooks system.                 ║
║                                                   ║
║  Key Takeaways:                                   ║
║  • Processing 500+ invoices monthly               ║
║  • 6 hours of manual work daily (3 people × 2h)  ║
║  • QuickBooks integration required                ║
║  • Target: 70% time reduction                     ║
║  • Timeline: 60-day implementation                ║
║                                                   ║
║  View Recording:                                  ║
║  https://fathom.video/calls/436945936            ║
╚═══════════════════════════════════════════════════╝
```

---

## 🔍 Filtering Examples

### Example 1: Domain Only

**Input:**
```
Domain: dockeryai.com
Aliases: (empty)
Emails: (empty)
```

**Result:**
- All meetings with attendees from `@dockeryai.com`

---

### Example 2: Multiple Domains

**Input:**
```
Domain: dockeryai.com
Aliases: example.com, another.com
Emails: (empty)
```

**Result:**
- Meetings with attendees from any of:
  - `@dockeryai.com`
  - `@example.com`
  - `@another.com`

---

### Example 3: Specific Emails

**Input:**
```
Domain: gmail.com
Aliases: (empty)
Emails: john@gmail.com, sarah@gmail.com
```

**Result:**
- Only meetings where John or Sarah attended
- Even if domain is gmail.com, only shows these 2 people

---

### Example 4: Date Range

**Input:**
```
Domain: dockeryai.com
Since: 2024-10-01
Until: 2024-10-31
```

**Result:**
- Only October 2024 meetings
- From `@dockeryai.com` domain

---

## 📊 Pagination Example

### First Load (Limit: 5)

**Plugin UI:**
```
┌────────────────────────────────────────┐
│ Limit per request                      │
│ [5___]                                 │
│                                        │
│ [Load Meetings] [Load More ✓]         │
│                   ▲ Enabled!           │
│ ┌────────────────────────────────┐    │
│ │ 10/15/24, 8:54 PM  Meeting 1   │    │
│ │ 10/14/24, 2:30 PM  Meeting 2   │    │
│ │ 10/13/24, 11:00 AM Meeting 3   │    │
│ │ 10/12/24, 4:15 PM  Meeting 4   │    │
│ │ 10/11/24, 9:00 AM  Meeting 5   │    │
│ └────────────────────────────────┘    │
│                                        │
│ ▶ Debug Info                           │
│ {                                      │
│   "raw_count": 50,                     │
│   "filtered_count": 20,                │
│   "returned_count": 5                  │
│ }                                      │
└────────────────────────────────────────┘
```

### After "Load More"

**Plugin UI:**
```
┌────────────────────────────────────────┐
│ [Load Meetings] [Load More ✓]         │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ 10/15/24, 8:54 PM  Meeting 1   │    │
│ │ 10/14/24, 2:30 PM  Meeting 2   │    │
│ │ 10/13/24, 11:00 AM Meeting 3   │    │
│ │ 10/12/24, 4:15 PM  Meeting 4   │    │
│ │ 10/11/24, 9:00 AM  Meeting 5   │    │
│ │ 10/10/24, 3:00 PM  Meeting 6   │◄─ New
│ │ 10/09/24, 1:30 PM  Meeting 7   │◄─ New
│ │ 10/08/24, 10:00 AM Meeting 8   │◄─ New
│ │ 10/07/24, 4:45 PM  Meeting 9   │◄─ New
│ │ 10/06/24, 11:30 AM Meeting 10  │◄─ New
│ └────────────────────────────────┘    │
│                                        │
│ ▼ Debug Info                           │
│ {                                      │
│   "raw_count": 50,                     │
│   "filtered_count": 20,                │
│   "returned_count": 10  ◄─ Updated    │
│ }                                      │
└────────────────────────────────────────┘
```

---

## ⚠️ Error States

### Error 1: Missing Domain

**UI:**
```
┌────────────────────────────────────────┐
│ ⚠️ Please enter a domain.               │
├────────────────────────────────────────┤
│ Primary Domain *                       │
│ [___________________________________]  │
│          ▲ Empty - error!              │
└────────────────────────────────────────┘
```

---

### Error 2: Missing Proxy URL

**UI:**
```
┌────────────────────────────────────────┐
│ ⚠️ Proxy URL required (set             │
│    NEXT_PUBLIC_PROXY_URL or fill       │
│    the field).                         │
├────────────────────────────────────────┤
│ Proxy URL (optional if env is set)    │
│ [___________________________________]  │
│          ▲ Empty and no env!           │
└────────────────────────────────────────┘
```

---

### Error 3: No Meetings Found

**UI:**
```
┌────────────────────────────────────────┐
│ ⚠️ No meetings found. Try adding       │
│    emails or widening the date range.  │
├────────────────────────────────────────┤
│ ┌────────────────────────────────┐    │
│ │ No meetings found.              │    │
│ │ Try adjusting your filters.     │    │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

---

### Error 4: Network Error

**UI:**
```
┌────────────────────────────────────────┐
│ ⚠️ Proxy failed: 404 — Not Found       │
├────────────────────────────────────────┤
│ Proxy URL (optional if env is set)    │
│ [https://wrong-url.com_________]       │
│              ▲ Check this!             │
└────────────────────────────────────────┘
```

---

### Error 5: No Matching Layers

**Figma Notification:**
```
┌──────────────────────────────────────────────┐
│ ⚠️ No matching text layers found. Create    │
│    layers named: Title, Date, Summary,      │
│    Bullets, TranscriptLink                  │
└──────────────────────────────────────────────┘
```

**Current Figma Layers:**
```
Frame: "Meeting Card"
  ├─ Text: "Heading"        ✗ Wrong name
  ├─ Text: "Timestamp"      ✗ Wrong name
  └─ Text: "Content"        ✗ Wrong name
```

**Fix:**
```
Frame: "Meeting Card"
  ├─ Text: "Title"          ✅ Correct
  ├─ Text: "Date"           ✅ Correct
  ├─ Text: "Summary"        ✅ Correct
  ├─ Text: "Bullets"        ✅ Correct
  └─ Text: "TranscriptLink" ✅ Correct
```

---

## 🎓 Advanced: Debug Mode

### Toggle Debug Panel

**Closed:**
```
┌────────────────────────────────────────┐
│ ▶ Debug Info                           │
│                                        │
└────────────────────────────────────────┘
```

**Open:**
```
┌────────────────────────────────────────┐
│ ▼ Debug Info                           │
│ ┌────────────────────────────────┐    │
│ │ {                              │    │
│ │   "raw_count": 100,            │    │
│ │   "filtered_count": 15,        │    │
│ │   "returned_count": 10         │    │
│ │ }                              │    │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**What it means:**
- `raw_count`: Total meetings from Fathom API (100)
- `filtered_count`: Meetings matching filters (15)
- `returned_count`: Meetings shown in UI (10, limited by "Limit" field)

---

## 📱 Full UI Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    PLUGIN WORKFLOW                      │
└─────────────────────────────────────────────────────────┘

   ┌─────────────┐
   │  Open       │
   │  Plugin     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Configure  │───► Proxy URL (if env not set)
   │  Settings   │───► Enter domain (required)
   └──────┬──────┘───► Add filters (optional)
          │
          ▼
   ┌─────────────┐
   │   Click     │
   │   "Load"    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Loading    │───► Spinner shows
   │  State      │───► Buttons disabled
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Meetings   │───► List appears
   │  Loaded     │───► Load More enabled (if cursor exists)
   └──────┬──────┘───► Apply button still disabled
          │
          ▼
   ┌─────────────┐
   │   Select    │───► Click a meeting
   │   Meeting   │───► Item highlighted
   └──────┬──────┘───► Apply button enabled
          │
          ▼
   ┌─────────────┐
   │   Click     │
   │   "Apply"   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Layers     │───► Title updated
   │  Updated    │───► Date updated
   └─────────────┘───► Summary updated
                  ───► Bullets updated
                  ───► TranscriptLink updated
                  ───► ✅ Success notification
```

---

## 🎉 Success Checklist

After following this guide, you should see:

- ✅ Plugin loads in Figma Desktop App
- ✅ UI appears when plugin opened
- ✅ Domain input accepts text
- ✅ "Load Meetings" fetches data
- ✅ Meetings appear in scrollable list
- ✅ Selecting a meeting highlights it
- ✅ "Apply to Layers" updates all 5 text layers
- ✅ Real meeting data appears in Figma design
- ✅ "Load More" works for pagination
- ✅ Debug panel shows API response counts
- ✅ Error messages are clear and helpful

---

**🎨 Ready to create data-driven designs with real customer data!**
