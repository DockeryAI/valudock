# ValueDock Fathom Loader - Figma Plugin

> **Automatically populate Figma designs with real Fathom meeting data**

A production-ready Figma plugin that fetches customer meeting data from Fathom via a proxy endpoint and intelligently maps it to text layers in your design. Perfect for creating data-driven presentation decks, sales materials, and customer success reports.

---

## 🎯 What It Does

1. **Fetches** Fathom meetings via your secure proxy endpoint
2. **Filters** by domain, emails, and date range
3. **Paginates** through large meeting lists
4. **Maps** meeting data to named text layers in Figma
5. **Updates** your design with real customer data

---

## ✨ Features

### 🔍 Smart Filtering
- **Domain filtering**: `dockeryai.com`
- **Alias domains**: Multiple domains in one search
- **Specific emails**: Target individual attendees
- **Date ranges**: Narrow down to specific timeframes
- **Pagination**: Load 1-100 meetings per page

### 🎨 Intelligent Layer Mapping
Automatically updates these text layers:
- `Title` → Meeting title
- `Date` → Formatted date/time
- `Summary` → AI-generated summary
- `Bullets` → Key highlights (bullet points)
- `TranscriptLink` → Fathom transcript URL

### 🛡️ Production-Ready
- ✅ Comprehensive error handling
- ✅ Clear user feedback
- ✅ Persistent configuration
- ✅ Debug mode for troubleshooting
- ✅ Works offline once loaded

---

## 🚀 Quick Start

### Prerequisites
- **Figma Desktop App** (plugin won't work in browser)
- **Node.js** 16+ and npm
- **Proxy endpoint** that returns Fathom meeting data

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Build plugin
npm run build

# 3. Load in Figma
# Menu → Plugins → Development → Import plugin from manifest...
# Select manifest.json
```

### First Run

1. **Create text layers** with these exact names:
   ```
   Title
   Date
   Summary
   Bullets
   TranscriptLink
   ```

2. **Configure proxy URL** (one-time setup):
   - Option A: Set `NEXT_PUBLIC_PROXY_URL` env var before building
   - Option B: Enter URL in plugin UI (saved automatically)

3. **Load meetings**:
   - Enter domain (e.g., `dockeryai.com`)
   - Click "Load Meetings"
   - Select a meeting
   - Click "Apply to Layers"

4. **Done!** Your text layers now contain real meeting data.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](FIGMA_PLUGIN_SETUP_GUIDE.md) | Complete installation and configuration |
| [Quick Start](FIGMA_PLUGIN_QUICK_START.md) | 5-minute getting started guide |
| [Test Guide](FIGMA_PLUGIN_TEST_GUIDE.md) | 20+ test scenarios with examples |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│ Figma Design                                │
│  ├─ Text: "Title"                          │
│  ├─ Text: "Date"                           │
│  ├─ Text: "Summary"                        │
│  ├─ Text: "Bullets"                        │
│  └─ Text: "TranscriptLink"                 │
└─────────────────┬───────────────────────────┘
                  │
                  │ Plugin updates layers
                  │
┌─────────────────▼───────────────────────────┐
│ Figma Plugin (TypeScript)                   │
│  ├─ scripts/figmaMeetingSelector.ts        │
│  ├─ index.html (UI)                        │
│  └─ dist/code.js (compiled)                │
└─────────────────┬───────────────────────────┘
                  │
                  │ POST request
                  │
┌─────────────────▼───────────────────────────┐
│ Your Proxy Endpoint                         │
│  ├─ Receives: domain, filters, cursor      │
│  ├─ Calls: Fathom API                      │
│  └─ Returns: filtered meetings             │
└─────────────────┬───────────────────────────┘
                  │
                  │ Bearer token
                  │
┌─────────────────▼───────────────────────────┐
│ Fathom API                                  │
│  └─ Real meeting data                      │
└─────────────────────────────────────────────┘
```

---

## 🔌 Proxy Endpoint Specification

### Request Format

```http
POST /your-endpoint
Content-Type: application/json

{
  "domain": "dockeryai.com",
  "aliases": ["example.com"],
  "emails": ["user@gmail.com"],
  "since": "2024-01-01T00:00:00Z",
  "until": "2024-12-31T23:59:59Z",
  "limit": 50,
  "cursor": "optional-pagination-token"
}
```

### Response Format

```json
{
  "items": [
    {
      "id": "94471626",
      "title": "Sales Discovery Call",
      "date": "2025-10-15T20:54:42Z",
      "summary": "Discussed automation needs...",
      "highlights": [
        "Customer processes 500+ invoices/month",
        "Looking for 70% time reduction"
      ],
      "transcript_url": "https://fathom.video/calls/436945936",
      "calendar_invitees": [
        {
          "name": "John Doe",
          "email": "john@dockeryai.com",
          "email_domain": "dockeryai.com"
        }
      ]
    }
  ],
  "next_cursor": "pagination-token-or-null",
  "debug": {
    "raw_count": 100,
    "filtered_count": 10,
    "returned_count": 10
  }
}
```

See [Setup Guide](FIGMA_PLUGIN_SETUP_GUIDE.md) for example proxy implementation.

---

## 🛠️ Development

### Build Commands

```bash
# Production build
npm run build

# Development mode (auto-rebuild on changes)
npm run watch
```

### Project Structure

```
/
├── scripts/
│   └── figmaMeetingSelector.ts    # Plugin controller (TypeScript)
├── dist/
│   └── code.js                     # Compiled output (auto-generated)
├── index.html                      # Plugin UI
├── manifest.json                   # Figma plugin manifest
├── package.json                    # Dependencies & scripts
├── .gitignore                      # Git ignore rules
│
├── FIGMA_PLUGIN_README.md          # This file
├── FIGMA_PLUGIN_SETUP_GUIDE.md     # Complete setup instructions
├── FIGMA_PLUGIN_QUICK_START.md     # Quick reference
└── FIGMA_PLUGIN_TEST_GUIDE.md      # Test scenarios
```

### Adding Custom Layer Names

Edit `scripts/figmaMeetingSelector.ts`:

```typescript
// Find these lines in handleApplyMeeting()
const titleNode = textNodes.find(n => n.name === 'Title');
const dateNode = textNodes.find(n => n.name === 'Date');
// ... add your custom layers here
```

### Debugging

**Open Plugin Console:**
```
Menu → Plugins → Development → Open Console
```

**Check Logs:**
```javascript
[Figma Plugin] Received message: fetch-meetings
[Figma Plugin] Fetching meetings with payload: {...}
[Figma Plugin] Response status: 200
[UI] Received message: meetings
```

---

## 🧪 Testing

### Quick Test

```bash
# 1. Build
npm run build

# 2. Load plugin in Figma

# 3. Create test layers:
#    Title, Date, Summary, Bullets, TranscriptLink

# 4. Run plugin and test:
#    - Load meetings for "dockeryai.com"
#    - Select a meeting
#    - Apply to layers
#    - Verify all 5 layers updated
```

### Comprehensive Testing

See [Test Guide](FIGMA_PLUGIN_TEST_GUIDE.md) for 20+ test scenarios including:
- Pagination
- Error handling
- Empty states
- Special characters
- Performance benchmarks

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin won't load | Run `npm run build`, restart Figma Desktop App |
| UI is blank | Check `index.html` exists, check browser console |
| No meetings load | Verify proxy URL, check domain spelling |
| Layers don't update | Check layer names are **exact** (case-sensitive) |
| Network error | Test proxy endpoint with curl/Postman first |
| "Proxy URL required" | Set env var or enter URL in plugin UI |

---

## 📋 Requirements

### System
- **Figma Desktop App** (required for network access)
- **Node.js** 16+
- **npm** 7+

### Figma Design
- Text layers with exact names (case-sensitive):
  - `Title`
  - `Date`
  - `Summary`
  - `Bullets`
  - `TranscriptLink`

### Backend
- Proxy endpoint that accepts POST requests
- Returns JSON with `items`, `next_cursor`, `debug`
- See [Setup Guide](FIGMA_PLUGIN_SETUP_GUIDE.md) for example implementation

---

## 🔐 Security

- ✅ **No API keys in plugin code**: All authentication via proxy
- ✅ **CORS handled server-side**: Plugin calls your proxy, proxy calls Fathom
- ✅ **Secure storage**: Proxy URL stored locally in Figma client storage
- ✅ **Network access declared**: Plugin declares domains in manifest.json

---

## 🎓 Usage Examples

### Example 1: Sales Deck

Create a template slide with:
```
Title: "Recent Customer Conversations"
Date: [automatically filled]
Summary: [automatically filled]
Bullets: [automatically filled]
```

Run plugin → Load meetings → Apply → Instant data-driven slide deck!

### Example 2: Weekly Report

Create weekly report template:
```
Week: Oct 15-22, 2024
Meetings This Week: [count from plugin]
Top Insights: [Bullets layer]
```

Filter by date range → Load meetings → Apply → Weekly report done!

### Example 3: Customer Success Review

Create customer-specific slides:
```
Customer: [from meeting title]
Last Meeting: [Date layer]
Discussion Summary: [Summary layer]
Action Items: [Bullets layer]
Recording: [TranscriptLink layer]
```

Filter by customer domain → Load → Apply → Customer review ready!

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `NEXT_PUBLIC_PROXY_URL` environment variable
- [ ] Run `npm run build`
- [ ] Test all scenarios from [Test Guide](FIGMA_PLUGIN_TEST_GUIDE.md)
- [ ] Verify proxy endpoint is production-ready
- [ ] Update version in `manifest.json`
- [ ] Test in clean Figma file
- [ ] Document any custom configuration

### Publishing to Figma Community (Optional)

1. Update `manifest.json`:
   - Unique plugin ID
   - Description
   - Icon (512x512 PNG)
   - Screenshots

2. Test thoroughly:
   - Fresh install
   - Multiple users
   - Different use cases

3. Submit to Figma:
   - Menu → Plugins → Development → Publish plugin
   - Follow Figma's review guidelines

---

## 📊 Performance

| Metric | Target | Acceptable |
|--------|--------|------------|
| Load 10 meetings | < 1s | < 3s |
| Load 100 meetings | < 2s | < 5s |
| Apply to layers | < 100ms | < 500ms |
| UI render (100 items) | < 200ms | < 1s |

---

## 🤝 Contributing

### Reporting Issues

Include:
1. **Steps to reproduce**
2. **Expected vs actual behavior**
3. **Console logs** (Menu → Plugins → Development → Open Console)
4. **Figma version**
5. **Plugin version**

### Feature Requests

Consider:
- Does it align with plugin purpose?
- Is it generalizable?
- Can it be configurable?

---

## 📝 License

MIT License - Use freely in your projects.

---

## 🙏 Credits

**Built for ValueDock** by the Figma Make AI team.

Special thanks to:
- Fathom.video for meeting intelligence
- Figma for the plugin platform
- The Supabase team for edge functions

---

## 📞 Support

- **Documentation**: See `/FIGMA_PLUGIN_SETUP_GUIDE.md`
- **Quick Start**: See `/FIGMA_PLUGIN_QUICK_START.md`
- **Testing**: See `/FIGMA_PLUGIN_TEST_GUIDE.md`
- **Issues**: Check troubleshooting section above

---

## 🗺️ Roadmap

Potential future enhancements:
- [ ] Bulk apply to multiple frames
- [ ] Custom field mapping configuration
- [ ] Meeting template library
- [ ] Export to PDF/PowerPoint
- [ ] Real-time sync with Fathom
- [ ] Multi-language support

---

## 📜 Changelog

### v1.0.0 (2024-10-17)
- Initial release
- Domain, alias, email filtering
- Date range filtering
- Pagination support
- Layer mapping for 5 fields
- Debug mode
- Persistent configuration
- Comprehensive error handling

---

**Ready to transform your Figma designs with real customer data?**

```bash
npm install && npm run build
```

Then load the plugin in Figma and start creating data-driven designs! 🎨✨
