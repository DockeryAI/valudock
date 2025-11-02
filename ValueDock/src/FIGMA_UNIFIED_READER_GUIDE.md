# ValueDock × Fathom — Unified Meeting Reader Guide

## Overview

A CORS-safe JavaScript module for syncing and reading Fathom meeting summaries from Supabase, designed for Figma plugins and client-side environments.

## Quick Start

### 1. Setup in Figma Plugin

Copy the entire content of `/scripts/valuedockFathomUnifiedReader.js` into your Figma plugin's JavaScript block.

### 2. Configure Environment Variables

Set these variables in your Figma plugin settings:

```javascript
SUPABASE_URL = "https://hpnxaentcrlditokrpyo.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = ""  // Leave empty unless syncing
DO_SYNC_NOW = false             // Set to true to enable sync
```

### 3. Basic Usage

```javascript
// Read meetings only (no sync)
const result = await valuedockFathomUnifiedReader();
console.log(result.meetings);
```

## Functions

### Main Function

#### `valuedockFathomUnifiedReader(options)`

Unified workflow that syncs (if enabled) then reads meetings.

**Parameters:**
- `options.sync` (boolean) - Whether to sync before reading (default: false)
- `options.limit` (number) - Number of meetings to fetch (default: 20)

**Returns:**
```javascript
{
  sync: {
    success: boolean,
    count: number,
    duration: number
  },
  meetings: Array<Meeting>,
  timestamp: string
}
```

**Example:**
```javascript
const result = await valuedockFathomUnifiedReader({ 
  sync: true, 
  limit: 50 
});
```

### Individual Functions

#### `syncMeetings()`

Syncs meetings from Fathom API to Supabase.

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` must be set
- Calls POST endpoint with Service Role authorization

**Returns:**
```javascript
{
  success: boolean,
  count: number,      // Number of meetings synced
  duration: number,   // Time taken in ms
  error?: string      // Error message if failed
}
```

**Console Output:**
```
🔄 [SYNC] Starting full sync...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Endpoint: https://...
✅ [SYNC] Complete in 1234ms
   Synced: 15 meeting(s)
```

#### `readSummaries(limit)`

Reads meeting summaries from Supabase (CORS-safe).

**Parameters:**
- `limit` (number) - Maximum meetings to fetch (default: 20)

**Requirements:**
- No authorization required (CORS-safe)
- Calls GET endpoint

**Returns:**
```javascript
Array<{
  meeting_id: string,
  title: string,
  start_time: string,
  summary: string,
  // ... other fields
}>
```

**Console Output:**
```
📖 [READ] Fetching meeting summaries...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Limit: 20
   Endpoint: https://...
✅ [READ] Loaded 20 meeting(s) in 456ms
   Sample meeting: { id: 'abc123', title: 'Team Sync', ... }
```

### Helper Functions

#### `safeJson(jsonString, fallback)`

Safely parses JSON with error handling.

```javascript
const data = safeJson('{"key": "value"}', {});
// Returns: { key: "value" }

const invalid = safeJson('invalid json', []);
// Returns: []
```

#### `hasValue(value)`

Checks if a value exists (not null/undefined/empty string).

```javascript
hasValue("hello")     // true
hasValue(0)           // true
hasValue(null)        // false
hasValue(undefined)   // false
hasValue("")          // false
```

## Usage Examples

### Example 1: Read Only (Default)

```javascript
// No sync, just read 20 meetings
const result = await valuedockFathomUnifiedReader();

console.log(`Loaded ${result.meetings.length} meetings`);
result.meetings.forEach(meeting => {
  console.log(`- ${meeting.title} (${meeting.start_time})`);
});
```

### Example 2: Sync Then Read

```javascript
// Sync first, then read
const result = await valuedockFathomUnifiedReader({ 
  sync: true,
  limit: 50 
});

if (result.sync.success) {
  console.log(`Synced ${result.sync.count} meetings`);
}
console.log(`Loaded ${result.meetings.length} meetings`);
```

### Example 3: Custom Limit

```javascript
// Read only first 10 meetings
const result = await valuedockFathomUnifiedReader({ limit: 10 });
console.log('Recent meetings:', result.meetings);
```

### Example 4: Direct Function Calls

```javascript
// Call functions individually
const syncResult = await syncMeetings();
if (syncResult.success) {
  console.log(`Synced ${syncResult.count} meetings in ${syncResult.duration}ms`);
}

const meetings = await readSummaries(30);
console.log(`Fetched ${meetings.length} meetings`);
```

## Console Output Examples

### Successful Read (No Sync)

```
═══════════════════════════════════════════════════════════
🚀 ValueDock × Fathom — Unified Meeting Reader
═══════════════════════════════════════════════════════════
   Supabase URL: https://hpnxaentcrlditokrpyo.supabase.co
   Sync enabled: false
   Read limit: 20
───────────────────────────────────────────────────────────

📖 [READ] Fetching meeting summaries...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Limit: 20
   Endpoint: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server?mode=read&user_id=...&limit=20
✅ [READ] Loaded 20 meeting(s) in 456ms
   Sample meeting: { id: 'abc123', title: 'Discovery Call', date: '2025-10-15T10:00:00Z', hasSummary: true }

═══════════════════════════════════════════════════════════
📊 Summary
═══════════════════════════════════════════════════════════
   Read: ✅ 20 meeting(s) loaded
═══════════════════════════════════════════════════════════
```

### Successful Sync + Read

```
═══════════════════════════════════════════════════════════
🚀 ValueDock × Fathom — Unified Meeting Reader
═══════════════════════════════════════════════════════════
   Supabase URL: https://hpnxaentcrlditokrpyo.supabase.co
   Sync enabled: true
   Read limit: 20
───────────────────────────────────────────────────────────

🔄 [SYNC] Starting full sync...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Endpoint: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server?user_id=...&full_sync=true
✅ [SYNC] Complete in 2341ms
   Synced: 15 meeting(s)

📖 [READ] Fetching meeting summaries...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Limit: 20
   Endpoint: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server?mode=read&user_id=...&limit=20
✅ [READ] Loaded 20 meeting(s) in 456ms
   Sample meeting: { id: 'abc123', title: 'Discovery Call', date: '2025-10-15T10:00:00Z', hasSummary: true }

═══════════════════════════════════════════════════════════
📊 Summary
═══════════════════════════════════════════════════════════
   Sync: ✅ 15 meeting(s)
   Read: ✅ 20 meeting(s) loaded
═══════════════════════════════════════════════════════════
```

### Error Example (Missing Service Role Key)

```
🔄 [SYNC] Starting full sync...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
❌ [SYNC] Service Role Key not configured
```

### Error Example (Network Failure)

```
📖 [READ] Fetching meeting summaries...
   User ID: 1c89cea9-d2ac-4b36-bad8-e228ac79e4e0
   Limit: 20
   Endpoint: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/fathom-server?mode=read&user_id=...&limit=20
❌ [READ] Network error after 5000ms
   Error: Failed to fetch
```

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes | `https://hpnxaentcrlditokrpyo.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for sync | `""` | Service role key (keep secret!) |
| `DO_SYNC_NOW` | No | `false` | Enable sync on every call |

### Runtime Options

```javascript
const result = await valuedockFathomUnifiedReader({
  sync: true,    // Override DO_SYNC_NOW
  limit: 50      // Override DEFAULT_LIMIT
});
```

## API Endpoints

### Sync Endpoint (POST)

```
POST ${SUPABASE_URL}/functions/v1/fathom-server?user_id={USER_ID}&full_sync=true
Authorization: Bearer {SERVICE_ROLE_KEY}
Content-Type: application/json
```

**Response:**
```json
{
  "count": 15,
  "message": "Synced 15 meetings"
}
```

### Read Endpoint (GET)

```
GET ${SUPABASE_URL}/functions/v1/fathom-server?mode=read&user_id={USER_ID}&limit={LIMIT}
Content-Type: application/json
```

**No Authorization header** (CORS-safe)

**Response:**
```json
{
  "meetings": [
    {
      "meeting_id": "abc123",
      "title": "Discovery Call",
      "start_time": "2025-10-15T10:00:00Z",
      "summary": "Meeting summary text...",
      "company_domain": "example.com"
    }
  ]
}
```

## Meeting Object Structure

Each meeting object contains:

```typescript
{
  meeting_id: string,          // Unique Fathom meeting ID
  title: string,               // Meeting title
  start_time: string,          // ISO 8601 datetime
  summary: string,             // AI-generated summary
  company_domain?: string,     // Company domain (if available)
  participants?: Array<...>,   // Meeting participants
  // ... additional Fathom fields
}
```

## Troubleshooting

### No meetings returned

**Possible causes:**
1. User has no meetings in Fathom
2. Wrong USER_ID
3. Meetings not synced yet

**Solution:**
```javascript
// Run sync first
const result = await valuedockFathomUnifiedReader({ sync: true });
```

### Sync fails with 401 error

**Cause:** Invalid or missing Service Role Key

**Solution:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify key is correct in Supabase dashboard
3. Ensure key has not been revoked

### CORS errors

**Cause:** Using Authorization header in read request

**Solution:**
- Use `readSummaries()` which has no auth header (CORS-safe)
- Or ensure your Edge Function has proper CORS headers

### Network timeout

**Cause:** Slow network or Edge Function cold start

**Solution:**
- Wait for function to warm up
- Check Supabase Edge Function logs
- Increase timeout if running in custom environment

## Security Notes

⚠️ **IMPORTANT:**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Only use sync feature in secure server environments
- Read function is safe for client use (no auth required)

## Best Practices

1. **Sync sparingly:** Only sync when needed, not on every page load
2. **Cache results:** Store meetings locally to reduce API calls
3. **Use appropriate limits:** Don't fetch more meetings than you need
4. **Handle errors:** Always check for empty arrays and error states
5. **Monitor logs:** Use console output to debug issues

## Integration with Figma Plugin

### In Figma Plugin Code

```javascript
// Paste the entire valuedockFathomUnifiedReader.js content here
// ... (the code from the file)

// Then use it:
async function loadMeetingsIntoFigma() {
  const result = await valuedockFathomUnifiedReader({ limit: 50 });
  
  // Map meetings to Figma text layers
  result.meetings.forEach((meeting, index) => {
    const textNode = figma.createText();
    textNode.characters = `${meeting.title}\n${meeting.summary}`;
    textNode.y = index * 100;
  });
}

loadMeetingsIntoFigma();
```

## Support

For issues or questions:
1. Check console output for detailed error messages
2. Verify environment variables are set correctly
3. Test sync and read functions independently
4. Check Supabase Edge Function logs

## Version History

- **v1.0.0** (2025-10-20): Initial unified reader with sync + read functionality
