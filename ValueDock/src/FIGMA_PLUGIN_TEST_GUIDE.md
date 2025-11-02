# ValueDock Fathom Loader - Testing Guide

## Test Scenarios

### Test 1: Basic Load (Happy Path) ✅

**Setup:**
1. Create text layers: `Title`, `Date`, `Summary`, `Bullets`, `TranscriptLink`
2. Configure proxy URL

**Steps:**
1. Open plugin
2. Enter domain: `dockeryai.com`
3. Leave other fields empty
4. Click "Load Meetings"

**Expected:**
- Loading spinner appears
- Status banner shows "Loading meetings..."
- Meetings appear in list (5-10 meetings)
- Load More button enabled if `next_cursor` exists
- Debug info shows counts

**Pass Criteria:**
- ✅ No errors in console
- ✅ Meetings list populated
- ✅ Each meeting shows date + title

---

### Test 2: Pagination ✅

**Setup:**
1. Set Limit to 5
2. Load meetings for domain with 10+ meetings

**Steps:**
1. Click "Load Meetings"
2. Wait for initial load (5 meetings)
3. Click "Load More"
4. Wait for additional meetings

**Expected:**
- First load: 5 meetings
- After "Load More": 10 meetings (5 + 5)
- "Load More" button disabled if no more meetings

**Pass Criteria:**
- ✅ Meetings append (don't replace)
- ✅ No duplicate meetings
- ✅ Pagination cursor handled correctly

---

### Test 3: Apply to Layers ✅

**Setup:**
1. Load meetings
2. Select a meeting from list

**Steps:**
1. Click "Apply to Layers"
2. Check text layers

**Expected Layer Values:**
- `Title`: Meeting title (e.g., "Sales Call")
- `Date`: "10/15/2024, 8:54:42 PM" (local format)
- `Summary`: Meeting summary text or "(No summary)"
- `Bullets`: 
  ```
  • First highlight
  • Second highlight
  • Third highlight
  ```
- `TranscriptLink`: "https://fathom.video/calls/436945936"

**Pass Criteria:**
- ✅ All 5 layers updated
- ✅ Date formatted correctly
- ✅ Bullets have "•" prefix
- ✅ Empty highlights = empty Bullets layer
- ✅ Notification shows "✓ Updated 5 text layers"

---

### Test 4: Domain Filtering ✅

**Setup:**
1. Use domain: `gmail.com`
2. Add specific email: `mtarver53@gmail.com`

**Steps:**
1. Enter domain: `gmail.com`
2. Enter emails: `mtarver53@gmail.com`
3. Click "Load Meetings"

**Expected:**
- Only meetings where attendees include `mtarver53@gmail.com`
- Domain filter AND email filter both applied

**Pass Criteria:**
- ✅ Only relevant meetings shown
- ✅ Debug info shows filtered_count < raw_count

---

### Test 5: Date Range Filtering ✅

**Setup:**
1. Set Since: `2024-10-01`
2. Set Until: `2024-10-31`

**Steps:**
1. Enter domain
2. Set date range
3. Click "Load Meetings"

**Expected:**
- Only meetings from October 2024
- Proxy receives ISO dates in request

**Pass Criteria:**
- ✅ All meetings within date range
- ✅ No meetings outside range

---

### Test 6: Alias Domains ✅

**Setup:**
1. Primary domain: `dockeryai.com`
2. Aliases: `example.com, another.com`

**Steps:**
1. Enter primary domain
2. Enter aliases (comma-separated)
3. Click "Load Meetings"

**Expected:**
- Meetings from all 3 domains
- Proxy receives lowercase aliases array

**Pass Criteria:**
- ✅ Meetings from all domains
- ✅ Aliases sent as array to proxy

---

### Test 7: Empty Results ⚠️

**Setup:**
1. Use non-existent domain: `nonexistent12345.com`

**Steps:**
1. Enter fake domain
2. Click "Load Meetings"

**Expected:**
- Empty state message: "No meetings found. Try adding emails or widening the date range."
- Yellow warning banner
- "Load More" disabled
- "Apply to Layers" disabled

**Pass Criteria:**
- ✅ Clear empty state message
- ✅ No error (just info message)

---

### Test 8: Missing Domain ❌

**Setup:**
1. Leave domain field empty

**Steps:**
1. Click "Load Meetings" with empty domain

**Expected:**
- Red error banner: "Please enter a domain."
- No network request made

**Pass Criteria:**
- ✅ Error shown immediately
- ✅ No API call attempted

---

### Test 9: Missing Proxy URL ❌

**Setup:**
1. Don't set `NEXT_PUBLIC_PROXY_URL`
2. Leave proxy URL field empty

**Steps:**
1. Enter domain
2. Click "Load Meetings"

**Expected:**
- Red error banner: "Proxy URL required (set NEXT_PUBLIC_PROXY_URL or fill the field)."
- No network request made

**Pass Criteria:**
- ✅ Clear error message
- ✅ Instructions provided

---

### Test 10: Network Error ❌

**Setup:**
1. Use invalid proxy URL: `https://invalid-url-12345.com`

**Steps:**
1. Enter domain
2. Click "Load Meetings"

**Expected:**
- Loading spinner appears
- Red error banner: "Proxy failed: 404 — Not Found" (or network error)
- Console shows fetch error

**Pass Criteria:**
- ✅ Error handled gracefully
- ✅ Error message explains issue
- ✅ Buttons re-enabled after error

---

### Test 11: No Matching Layers ⚠️

**Setup:**
1. Don't create text layers (or rename them)
2. Load and select a meeting

**Steps:**
1. Click "Apply to Layers"

**Expected:**
- Red error notification: "No matching text layers found. Create layers named: Title, Date, Summary, Bullets, TranscriptLink"

**Pass Criteria:**
- ✅ Clear instructions on what to create
- ✅ No plugin crash

---

### Test 12: Partial Layer Match ✅

**Setup:**
1. Create only 2 layers: `Title`, `Date`
2. Load and select a meeting

**Steps:**
1. Click "Apply to Layers"

**Expected:**
- Title and Date updated
- Notification: "✓ Updated 2 text layers"

**Pass Criteria:**
- ✅ Partial update works
- ✅ Count is accurate

---

### Test 13: Proxy URL Persistence 💾

**Setup:**
1. Enter proxy URL manually
2. Close plugin
3. Reopen plugin

**Expected:**
- Proxy URL field pre-filled with saved value
- No need to re-enter

**Pass Criteria:**
- ✅ Value persists across sessions
- ✅ Stored in Figma client storage

---

### Test 14: Debug Panel Toggle 🐛

**Steps:**
1. Click "▶ Debug Info"
2. Load meetings
3. Click "▼ Debug Info" to close

**Expected:**
- Panel expands to show debug JSON
- Shows raw_count, filtered_count, returned_count
- Toggle icon changes
- Panel closes when clicked again

**Pass Criteria:**
- ✅ Toggle works smoothly
- ✅ Debug data appears
- ✅ Formatted JSON

---

### Test 15: Meeting Selection 🎯

**Setup:**
1. Load 5+ meetings

**Steps:**
1. Click first meeting
2. Click third meeting
3. Click first meeting again

**Expected:**
- First meeting: highlighted (blue background)
- Third meeting: highlighted, first unhighlighted
- First meeting again: highlighted, third unhighlighted
- "Apply to Layers" button enabled when meeting selected

**Pass Criteria:**
- ✅ Only one meeting selected at a time
- ✅ Visual highlight works
- ✅ Apply button state updates

---

### Test 16: Large Limit ⚡

**Setup:**
1. Set Limit to 100
2. Domain with 200+ meetings

**Steps:**
1. Click "Load Meetings"
2. Wait for load
3. Click "Load More"

**Expected:**
- First load: 100 meetings
- After "Load More": 200 meetings
- List scrollable
- No performance issues

**Pass Criteria:**
- ✅ All 100 meetings load
- ✅ UI remains responsive
- ✅ Scrolling smooth

---

### Test 17: Console Logging 📝

**Steps:**
1. Open plugin console (Menu → Plugins → Development → Open Console)
2. Perform any action (load, apply, etc.)

**Expected Console Output:**
```
[Figma Plugin] Received message: fetch-meetings
[Figma Plugin] Fetching meetings with payload: {...}
[Figma Plugin] Request payload: {...}
[Figma Plugin] Response status: 200
[Figma Plugin] Response data: {...}
[Figma Plugin] Cache now has 5 meetings
[Figma Plugin] Next cursor: abc123
[UI] Received message: meetings
```

**Pass Criteria:**
- ✅ Clear, structured logs
- ✅ No errors or warnings
- ✅ Helpful for debugging

---

### Test 18: Special Characters in Meeting Data 🔤

**Setup:**
1. Meeting with special characters:
   - Title: `"Meeting with Q&A's & Notes"`
   - Summary: `Email: test@example.com <tag>`

**Steps:**
1. Load and apply meeting

**Expected:**
- Special characters displayed correctly
- No HTML injection
- No encoding issues

**Pass Criteria:**
- ✅ Ampersands show as `&`
- ✅ Quotes show correctly
- ✅ Email addresses preserved
- ✅ HTML tags escaped

---

### Test 19: Empty Meeting Fields 🔲

**Setup:**
1. Meeting with missing fields:
   - No summary
   - No highlights
   - No transcript_url

**Steps:**
1. Load and apply meeting

**Expected Layer Values:**
- Summary: `(No summary)`
- Bullets: `` (empty)
- TranscriptLink: `` (empty)

**Pass Criteria:**
- ✅ No errors
- ✅ Fallback text for summary
- ✅ Empty strings for optional fields

---

### Test 20: Environment Variable Detection 🔐

**Test A: Env Set**
```bash
export NEXT_PUBLIC_PROXY_URL=https://prod.supabase.co/functions/v1/fathom-fetch
npm run build
```

**Expected:**
- Proxy URL field **disabled**
- Placeholder: "Using NEXT_PUBLIC_PROXY_URL from environment"
- Value pre-filled

**Test B: Env Not Set**
```bash
unset NEXT_PUBLIC_PROXY_URL
npm run build
```

**Expected:**
- Proxy URL field **enabled**
- Placeholder: "https://your-proxy..."
- Empty field (uses storage)

**Pass Criteria:**
- ✅ Env takes precedence
- ✅ Field disabled when env set
- ✅ Manual entry works when env not set

---

## Automated Testing Script

Create `test.sh`:

```bash
#!/bin/bash

echo "🧪 Running Figma Plugin Tests..."

# Build
echo "📦 Building plugin..."
npm run build

if [ ! -f "dist/code.js" ]; then
  echo "❌ Build failed: dist/code.js not found"
  exit 1
fi

echo "✅ Build successful"

# Check files
echo "📁 Checking required files..."
files=("manifest.json" "index.html" "scripts/figmaMeetingSelector.ts" "package.json")

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

echo "✅ All required files present"

# Verify manifest
echo "🔍 Verifying manifest..."
if ! grep -q '"main": "dist/code.js"' manifest.json; then
  echo "❌ manifest.json: main not set to dist/code.js"
  exit 1
fi

if ! grep -q '"ui": "index.html"' manifest.json; then
  echo "❌ manifest.json: ui not set to index.html"
  exit 1
fi

echo "✅ Manifest valid"

echo "🎉 All checks passed!"
echo ""
echo "Next steps:"
echo "1. Open Figma Desktop App"
echo "2. Menu → Plugins → Development → Import plugin from manifest"
echo "3. Select manifest.json from this directory"
echo "4. Run manual tests from FIGMA_PLUGIN_TEST_GUIDE.md"
```

Make executable:
```bash
chmod +x test.sh
./test.sh
```

---

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Figma Version: [X.XX.X]
- Plugin Version: [X.X.X]
- Proxy URL: [URL]
- Test Domain: [domain]

## Results

| Test | Status | Notes |
|------|--------|-------|
| Basic Load | ✅ PASS | Loaded 10 meetings |
| Pagination | ✅ PASS | 5 + 5 = 10 total |
| Apply to Layers | ✅ PASS | All 5 layers updated |
| Domain Filtering | ✅ PASS | Filtered correctly |
| Date Range | ✅ PASS | October only |
| Alias Domains | ✅ PASS | 3 domains |
| Empty Results | ✅ PASS | Clear message |
| Missing Domain | ✅ PASS | Error shown |
| Missing Proxy | ✅ PASS | Error shown |
| Network Error | ✅ PASS | Handled gracefully |
| No Layers | ✅ PASS | Clear instructions |
| Partial Layers | ✅ PASS | Updated 2/5 |
| Proxy Persistence | ✅ PASS | Value saved |
| Debug Toggle | ✅ PASS | Panel works |
| Meeting Selection | ✅ PASS | Highlights correctly |
| Large Limit | ✅ PASS | 100 meetings loaded |
| Console Logs | ✅ PASS | Clear output |
| Special Characters | ✅ PASS | Rendered correctly |
| Empty Fields | ✅ PASS | Fallbacks work |
| Env Detection | ✅ PASS | Both modes work |

## Issues Found
None

## Recommendations
Ready for production
```

---

## Performance Benchmarks

| Operation | Expected Time | Max Acceptable |
|-----------|---------------|----------------|
| Load 10 meetings | < 1s | < 3s |
| Load 100 meetings | < 2s | < 5s |
| Apply to layers | < 100ms | < 500ms |
| UI render (100 items) | < 200ms | < 1s |

---

## Checklist Before Release

- [ ] All 20 tests pass
- [ ] No console errors
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Example proxy endpoint provided
- [ ] Error messages clear and actionable
- [ ] UI responsive and polished
- [ ] Build script works on fresh install
- [ ] Manifest.json valid
- [ ] Ready for Figma Community submission

---

**Happy Testing! 🎉**
