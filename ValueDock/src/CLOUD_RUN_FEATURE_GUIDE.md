# Cloud Run Feature - Proposal Agent

## Overview

The **Cloud Run** feature allows you to execute the Proposal Agent via a Supabase Edge Function endpoint. When enabled, the system sends a structured JSON request to the backend and displays the response in a collapsible log panel.

## How It Works

### 1. Enable Cloud Run Mode

In the Proposal Agent Runner admin panel:
- Toggle **"Run in Cloud"** switch to ON
- The UI will switch to show the "Run in Cloud" button
- The standard "Run Agent" and "Run & Save Version" buttons are hidden when Cloud Run is active

### 2. Configure Parameters

Fill out the required fields:
- **Deal ID** - Unique identifier for this opportunity (e.g., `DEAL-2025-001`)
- **Customer Website URL** - The customer's main website (e.g., `https://company.com`)
- **Fathom Date Window** - How far back to search for meeting transcripts (e.g., "Last 30 days")
- **Target Organization** - Which organization this proposal is for (for admins)

### 3. Click "Run in Cloud"

The system will:
1. Validate all required fields
2. Calculate Fathom window dates (start and end in YYYY-MM-DD format)
3. POST to `/proposal-agent-run` with the following JSON payload:

```json
{
  "tenant_id": "<uuid>",
  "org_id": "<uuid>",
  "deal_id": "<string>",
  "customer_url": "<url>",
  "fathom_window": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  }
}
```

### 4. View Response

The response appears in a **collapsible "Cloud Run Log" panel** with:
- ✅ **Green "Accepted" badge** if `status === "accepted"`
- ❌ **Red badge** if status indicates error or rejection
- 📅 **Timestamp** of when the request was processed
- 📋 **Full JSON log** showing both request and response

## Backend Endpoint

### Route
```
POST /make-server-888f4514/proposal-agent-run
```

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "tenant_id": "uuid-string",
  "org_id": "uuid-string",
  "deal_id": "DEAL-2025-001",
  "customer_url": "https://company.com",
  "fathom_window": {
    "start": "2025-09-16",
    "end": "2025-10-16"
  }
}
```

### Success Response (200)
```json
{
  "status": "accepted",
  "request_id": "proposal-run-1729123456789-abc123",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "message": "Proposal agent run request accepted and queued",
  "data": {
    "tenant_id": "...",
    "org_id": "...",
    "deal_id": "...",
    "customer_url": "...",
    "fathom_window": { ... }
  }
}
```

### Error Response (400/500)
```json
{
  "status": "error",
  "error": "Missing required fields",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "required": ["tenant_id", "org_id", "deal_id", "customer_url", "fathom_window"]
}
```

## UI Components

### Cloud Run Toggle
Located in the Agent Configuration panel:
- Shows/hides based on toggle state
- When ON: Shows "Run in Cloud" button (full width)
- When OFF: Shows normal "Run Agent" and "Run & Save Version" buttons

### Cloud Run Log Panel
- **Appearance**: Only visible when Cloud Run mode is ON AND a response has been received
- **Style**: Blue border, collapsible
- **Header**: 
  - Title: "Cloud Run Log"
  - Status badge (green for accepted, red for errors)
  - Timestamp
  - Chevron icon (up/down) for expand/collapse
- **Content**: 
  - Pre-formatted JSON showing request and response
  - Scrollable (400px max height)
  - Monospace font with syntax-friendly styling

## State Management

### Frontend State Variables
```typescript
const [runInCloud, setRunInCloud] = useState(false);           // Toggle state
const [isCloudRunning, setIsCloudRunning] = useState(false);   // Loading state
const [cloudRunLog, setCloudRunLog] = useState<string>('');    // Request/response log
const [cloudRunResponse, setCloudRunResponse] = useState<any>(null); // Full response
const [showCloudLog, setShowCloudLog] = useState(false);       // Collapse state
```

### Backend Storage
Requests are stored in the KV store with key:
```
proposal-agent-run:<request_id>
```

Value structure:
```json
{
  "id": "proposal-run-1729123456789-abc123",
  "tenant_id": "...",
  "org_id": "...",
  "deal_id": "...",
  "customer_url": "...",
  "fathom_window": { "start": "...", "end": "..." },
  "status": "accepted",
  "timestamp": "2025-10-16T14:30:00.000Z",
  "user_id": "..."
}
```

## User Flow

1. **Navigate** to Admin → Proposal Agent tab
2. **Toggle** "Run in Cloud" to ON
3. **Fill** in Deal ID, Customer URL, Fathom Window, and Organization
4. **Click** "Run in Cloud"
5. **Wait** for loading spinner (shows "Running in Cloud...")
6. **View** response in the Cloud Run Log panel
7. **Expand/Collapse** log panel to view details
8. **Check** status badge for success (green) or error (red)

## Testing

### Quick Test
1. Enable "Run in Cloud" toggle
2. Enter test data:
   - Deal ID: `TEST-001`
   - URL: `https://example.com`
   - Fathom: "Last 30 days"
3. Click "Run in Cloud"
4. Verify response shows:
   - ✅ Green "Accepted" badge
   - Valid timestamp
   - Request ID in response

### Error Handling
The system handles:
- ❌ Missing required fields → 400 error
- ❌ Invalid authorization → 401 error
- ❌ Server errors → 500 error with details
- ✅ All errors logged to Cloud Run Log panel

## Next Steps

This feature provides the foundation for:
- ✨ Async proposal generation queue
- 📊 Job status tracking
- 🔔 Webhook notifications on completion
- 📈 Analytics on proposal generation requests
- 🔄 Retry mechanisms for failed runs

## Technical Notes

### Date Calculation
The frontend automatically calculates Fathom window dates:
```typescript
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - parseInt(fathomWindowDays, 10));

// Formatted as YYYY-MM-DD
const start = startDate.toISOString().split('T')[0];
const end = endDate.toISOString().split('T')[0];
```

### Authentication
- Uses existing `apiCall()` utility
- Passes user's access token in Authorization header
- Backend verifies token via `verifyAuth()` middleware

### Logging
All cloud run requests are logged:
```
[PROPOSAL-AGENT-RUN] Cloud run request received
[PROPOSAL-AGENT-RUN] ✅ Request validated successfully
[PROPOSAL-AGENT-RUN] ✅ Request stored with ID: ...
```

## Troubleshooting

### Issue: "Unauthorized" Error
- **Cause**: Invalid or expired access token
- **Fix**: Sign out and sign back in

### Issue: No Response Displayed
- **Cause**: Cloud Run Log only shows after receiving response
- **Fix**: Check browser console for errors, verify backend is running

### Issue: "Missing required fields" Error
- **Cause**: Not all form fields filled out
- **Fix**: Ensure Deal ID, Customer URL, and Organization are filled

---

**Version**: 1.0  
**Last Updated**: 2025-10-16  
**Component**: `ProposalAgentRunner.tsx`  
**Backend**: `/supabase/functions/server/index.tsx`  
