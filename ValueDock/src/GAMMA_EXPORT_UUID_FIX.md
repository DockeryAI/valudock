# Gamma Export UUID Error Fix

## Problem

Export to Gamma was failing with the error:
```
[ExportToGamma] Error: {
  "error": "invalid input syntax for type uuid: \"DEAL-1760736069952\""
}
```

## Root Cause

The `/proposal-gamma-links` endpoint was missing from the Edge Function. The frontend was trying to POST Gamma export URLs to this endpoint, but it didn't exist, causing the request to fail.

The error message suggested a UUID validation issue because some other part of the system was trying to insert the deal_id into a Postgres table with UUID constraints.

## Solution

Added two new endpoints to `/supabase/functions/server/index.tsx`:

### 1. POST `/make-server-888f4514/proposal-gamma-links`

Saves Gamma export links to the KV store (not Postgres, so no UUID constraints).

**Request Body:**
```json
{
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "deal_id": "DEAL-1760736069952",
  "version_id": "v1-1734567890",
  "doc_url": "https://gamma.app/docs/...",
  "deck_url": "https://gamma.app/decks/...",
  "mode": "storage"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gamma URLs saved to proposal version v1-1734567890"
}
```

### 2. GET `/make-server-888f4514/proposal-gamma-links`

Retrieves saved Gamma export links.

**Query Parameters:**
- `org_id` (required)
- `deal_id` (required)
- `version_id` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant_id": "tenant-123",
    "org_id": "org-456",
    "deal_id": "DEAL-1760736069952",
    "version_id": "v1-1734567890",
    "doc_url": "https://gamma.app/docs/...",
    "deck_url": "https://gamma.app/decks/...",
    "mode": "storage",
    "savedAt": "2024-12-18T10:30:00.000Z",
    "savedBy": "user-123",
    "savedByName": "John Doe"
  }
}
```

## Key Design Decisions

1. **KV Store, Not Postgres**: Uses the KV store instead of Postgres tables, avoiding UUID constraints
2. **Flexible deal_id**: Accepts any string format for deal_id (like `DEAL-1760736069952`), not just UUIDs
3. **Simple Key Structure**: Uses `proposal-gamma-links:{org_id}:{deal_id}:{version_id}` as the key
4. **Metadata Tracking**: Stores who saved the links and when

## Data Flow

```
User clicks "Export to Gamma"
  ↓
Frontend calls /gamma-export endpoint
  ↓
Gamma API creates presentation/doc
  ↓
Backend returns doc_url and deck_url
  ↓
Frontend calls /proposal-gamma-links (POST)
  ↓
Backend saves URLs to KV store
  ↓
Success! User can access Gamma links
```

## Testing

To test the fix:

1. **Login to ValuDock**
2. **Navigate to Presentation tab**
3. **Click "Export to Gamma"** button
4. **Check console** - should see:
   - `[ExportToGamma] Calling /functions/v1/gamma-export`
   - `[PROPOSAL-GAMMA-LINKS] Saving Gamma export links`
   - `[PROPOSAL-GAMMA-LINKS] Links saved successfully`
5. **No UUID errors** should appear

## Files Modified

- `/supabase/functions/server/index.tsx` - Added two new endpoints (lines ~5691-5800)

## Deployment

After this fix, you need to **redeploy the Edge Function** for the changes to take effect:

```bash
# Deploy the updated Edge Function
supabase functions deploy server
```

Or redeploy via the Supabase Dashboard:
1. Go to Edge Functions
2. Select the `server` function
3. Click "Deploy"

## Notes

- The `deal_id` format `DEAL-{timestamp}` is intentional and works perfectly with this solution
- No database migrations needed - all data stored in KV store
- Backwards compatible - existing code will work without changes
