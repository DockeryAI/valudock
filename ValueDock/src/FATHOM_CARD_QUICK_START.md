# 🎤 Fathom Integration Card - Quick Start

## 📍 Where to Find It

**Path**: Admin → Agent → Agent Runner tab → Right column

Look for the blue-bordered card with a microphone icon 🎤

---

## ⚡ Quick Test (30 seconds)

### Step 1: Set Dates
```
Start Date: [Select today's date - 30 days]
End Date:   [Select today's date]
```

### Step 2: (Optional) Add Tag
```
Tag Filter: [sales]  ← Try "sales", "discovery", or leave empty
```

### Step 3: Test
```
Click → [🧪 Test Fetch]
```

### Step 4: View Results
```
Scroll down to see JSON response:
{
  "success": true,
  "meetings": [...],
  "count": 5
}
```

---

## 🎯 What Each Field Does

| Field | Purpose | Required? |
|-------|---------|-----------|
| **Start Date** | Beginning of date range | ✅ Yes |
| **End Date** | End of date range | ✅ Yes |
| **Tag Filter** | Filter by meeting tag | ❌ Optional |
| **Test Fetch** | Sends API request | - |

---

## 🎨 Visual Reference

```
┌──────────────────────────────────────┐
│ 🎤 Fathom Integration                │ ← Blue border card
├──────────────────────────────────────┤
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ API Status: Connected ✅         │ │ ← Green badge
│ │                     (stub-ok)    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Start Date                           │
│ [2025-01-01]  ← Click for calendar   │
│                                      │
│ End Date                             │
│ [2025-01-31]  ← Click for calendar   │
│                                      │
│ 🏷️ Tag Filter                        │
│ [sales]  ← Type tag name             │
│ Optional: Filter meetings by tag...  │
│                                      │
│ [🧪 Test Fetch]  ← Full width button │
│                                      │
│ Response:                            │
│ ┌──────────────────────────────────┐ │
│ │ {                                │ │
│ │   "success": true,               │ │ ← JSON viewer
│ │   "meetings": [...],             │ │ ← Scrollable
│ │   "count": 5                     │ │
│ │ }                                │ │
│ └──────────────────────────────────┘ │
│ Found 5 meetings  ← Summary count    │
└──────────────────────────────────────┘
```

---

## 🔧 Button States

### ❌ Disabled (Gray)
- **When**: No dates selected
- **Why**: Dates are required

### ✅ Enabled (Blue)
- **When**: Both dates selected
- **Action**: Click to fetch

### ⟳ Loading (Spinner)
- **When**: Fetch in progress
- **Text**: "Fetching..."
- **Action**: Wait for response

---

## 📊 Expected Response

### ✅ Success
```json
{
  "success": true,
  "meetings": [
    {
      "id": "mtg-123",
      "title": "Discovery Call",
      "date": "2025-01-15",
      "tags": ["sales"]
    }
  ],
  "count": 1
}
```

**Result**: Toast → "Fetched 1 meeting"

### ❌ Error
```json
{
  "success": false,
  "error": "API key invalid"
}
```

**Result**: Toast → "Fathom fetch failed: API key invalid"

---

## 🎯 Common Use Cases

### Use Case 1: Test Connection
```
Purpose: Verify Fathom API is working
Start Date: [any date]
End Date: [any date]
Tag Filter: [empty]
Expected: Returns all meetings in range
```

### Use Case 2: Filter by Tag
```
Purpose: Find specific meeting types
Start Date: [2025-01-01]
End Date: [2025-01-31]
Tag Filter: [sales]
Expected: Returns only sales meetings
```

### Use Case 3: Narrow Date Range
```
Purpose: Test recent meetings
Start Date: [today - 7 days]
End Date: [today]
Tag Filter: [empty]
Expected: Returns meetings from last week
```

---

## 🐛 Troubleshooting

### Issue: Button Disabled
**Problem**: Can't click Test Fetch  
**Solution**: Check both dates are filled

### Issue: No Results
**Problem**: Response shows 0 meetings  
**Possible Causes**:
- Date range has no meetings
- Tag filter too specific
- API key not configured

**Solution**:
- Widen date range
- Remove tag filter
- Check API key in backend

### Issue: Error Response
**Problem**: JSON shows error message  
**Solution**:
- Check FATHOM_API_KEY environment variable
- Verify Fathom API access
- Check backend logs

---

## 💡 Pro Tips

### Tip 1: Quick Date Selection
```
Last 7 days:  Start = Today - 7, End = Today
Last 30 days: Start = Today - 30, End = Today
Last 90 days: Start = Today - 90, End = Today
```

### Tip 2: Tag Matching
```
Tag filter is case-insensitive and partial:
"sales" matches → "Sales", "SALES", "sales-call"
```

### Tip 3: Empty Results
```
If no meetings found, try:
1. Remove tag filter
2. Widen date range
3. Check if any meetings exist in Fathom
```

### Tip 4: Copy JSON
```
Right-click on JSON → Select All → Copy
Or use browser DevTools Console to inspect
```

---

## 📱 Mobile View

On mobile devices (<768px), the card stacks vertically:

```
┌─────────────────────┐
│ 🎤 Fathom Integ...  │
├─────────────────────┤
│ API: Connected ✅   │
│                     │
│ Start Date          │
│ [_________________] │
│                     │
│ End Date            │
│ [_________________] │
│                     │
│ Tag Filter          │
│ [_________________] │
│                     │
│ [Test Fetch]        │
│                     │
│ Response:           │
│ ┌─────────────────┐ │
│ │ { "success":... │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 🔗 API Endpoint

```
POST /functions/v1/fathom-fetch

Request:
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "tag_filter": "sales"  // Optional
}

Response:
{
  "success": true,
  "meetings": [...],
  "count": 5
}
```

---

## ✅ Quick Checklist

Before clicking Test Fetch:
- [ ] Start date selected
- [ ] End date selected
- [ ] Start date before end date
- [ ] Tag filter optional (can be empty)
- [ ] Button enabled (blue)

After clicking Test Fetch:
- [ ] Toast notification appears
- [ ] Button shows loading spinner
- [ ] JSON response displays
- [ ] Meeting count shows (if success)
- [ ] Error message shows (if failure)

---

## 🎓 Next Steps

After testing Fathom integration:

1. **Integrate with Proposal Agent**
   - Use fetched meetings for proposal context
   - Analyze transcripts for pain points

2. **Configure Auto-Fetch**
   - Set up scheduled fetches
   - Define default date ranges

3. **Review Meeting Data**
   - Check transcript quality
   - Verify tag consistency

---

**Quick Access**: Admin → Agent → Agent Runner → Fathom Integration Card  
**Test Time**: 30 seconds  
**Status**: ✅ Ready to use
