# 🚀 Gamma Export - Quick Reference

## Button Label
**"Export (Gamma or Storage)"**

---

## Response Format

```json
{
  "status": "completed",
  "steps": { "fathom": "ok", "proposal": "completed", "gamma": "ok" },
  "final_output": "Executive Summary — ValuDock Proposal...",
  "export_links": {
    "doc": "https://...proposal.md?...",
    "deck": "https://...deck-outline.json?..."
  },
  "mode": "storage" // or "live"
}
```

---

## Button Labels by Mode

### Storage Mode (default)
```
📄 Proposal (Markdown)
   [Open Proposal (Markdown) ↗]

📊 Deck Outline (JSON)
   [Open Deck Outline (JSON) ↗]
```

### Live Mode (mode === "live")
```
📄 Gamma Document
   [Open in Gamma ↗]

📊 Gamma Presentation
   [Open in Gamma ↗]
```

---

## Visual Elements

### Preview
Shows first 150 chars of `final_output`

### Step Badges
```
[Fathom: ok] [Proposal: completed] [Gamma: ok]
```

### Footer Message
- **Storage**: "Export files have been saved to storage"
- **Live**: "URLs have been saved to this proposal version"

---

## Toast Notifications

- **Storage**: "Export to Storage completed successfully!"
- **Live**: "Export to Gamma completed successfully!"

---

## Quick Test

1. Click "Export (Gamma or Storage)"
2. Wait for completion
3. Check success card for:
   - ✅ Preview text
   - ✅ Two buttons with correct labels
   - ✅ Step status badges
   - ✅ Footer message

---

**Updated**: 2025-10-17  
**Version**: 2.0
