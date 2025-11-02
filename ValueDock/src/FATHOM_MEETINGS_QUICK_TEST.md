# Fathom Meetings Component - Quick Test

## ✅ 2-Minute Test

### 1. Login
- Go to ValuDock
- Login with your credentials

### 2. Look for the Component
**Location**: Right below the header, above the main tabs

You should see:
```
┌──────────────────────────────────────┐
│ 📅 Fathom Meeting Summaries          │
└──────────────────────────────────────┘
```

### 3. Check What Appears

#### Option A: Loading State ⏳
```
┌──────────────────────────────────────┐
│ 📅 Fathom Meeting Summaries          │
│                                      │
│     🔄 Loading meetings...           │
│                                      │
└──────────────────────────────────────┘
```

#### Option B: Meetings Found ✅
```
┌──────────────────────────────────────┐
│ 📅 Fathom Meeting Summaries          │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Discovery Call    Oct 18, 2024 │  │
│  │                                │  │
│  │ Discussed automation needs...  │  │
│  │                                │  │
│  │ [🔗 Open Meeting]              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Follow-up Meeting Oct 17, 2024 │  │
│  │ ...                            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

#### Option C: Error ❌
```
┌──────────────────────────────────────┐
│ 📅 Fathom Meeting Summaries          │
│                                      │
│  ⚠️ Error: HTTP 404                  │
│                                      │
└──────────────────────────────────────┘
```

#### Option D: No Meetings 📭
```
┌──────────────────────────────────────┐
│ 📅 Fathom Meeting Summaries          │
│                                      │
│         📅                           │
│     No meetings found.               │
│                                      │
└──────────────────────────────────────┘
```

---

## 🐛 If You See an Error

### "Element type is invalid"
**Cause**: Import path issue  
**Fix**: Already fixed - refresh the page

### Component not appearing at all
**Check**:
1. Are you logged in? (component only shows to authenticated users)
2. Check browser console for errors
3. Verify `/config/FathomMeetings.tsx` exists

### Meetings not loading
**Possible reasons**:
1. Endpoint might be down
2. Domain filter might not match
3. No meetings in date range

**To debug**:
Open browser console and look for:
```
Failed to load meetings
HTTP 404
HTTP 500
```

---

## ⚙️ To Customize

### Change the domain
**File**: `/config/FathomMeetings.tsx`

**Find**:
```typescript
const ENDPOINT = 
  "https://...?domain=thephoenixinsurance.com&..."
```

**Change** `domain=thephoenixinsurance.com` to your domain

### Change the date range
**Change** `since=2025-07-01` to your start date

### Change number of meetings
**Change** `limit=5` to desired number

---

## ✅ Success Checklist

- [ ] Component appears below header
- [ ] Shows "Fathom Meeting Summaries" title with calendar icon
- [ ] Displays one of: Loading / Meetings / Error / Empty
- [ ] Styled with cards and borders (not plain text)
- [ ] Matches ValuDock design (not using inline styles)
- [ ] "Open Meeting" buttons work (open in new tab)

---

## 🎯 Quick Answer

**Is it working?**

**YES** ✅ if you see a card with "Fathom Meeting Summaries" title  
**NO** ❌ if you see nothing or get errors

**The fix corrected the import path and updated the styling to match ValuDock's design system.**
