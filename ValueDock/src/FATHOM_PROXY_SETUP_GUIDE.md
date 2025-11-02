# Fathom Proxy Setup Guide

## Overview

The Fathom Meeting History feature requires an external proxy to fetch meeting data from Fathom's API. This is because Supabase Edge Functions in the Figma Make environment have DNS restrictions that prevent direct API calls to external services.

## Current Behavior

✅ **Working:** Sample data mode with setup instructions  
⚠️ **Requires Setup:** Real Fathom meeting data via proxy

## Architecture

```
Frontend (ValuDock)
    ↓
Server (/fathom-meeting-history endpoint)
    ↓
External Proxy (VD_URL)
    ↓
Fathom API
```

## Setup Steps

### 1. Deploy Fathom Proxy to External Supabase Project

The proxy function is already created at `/supabase/functions/fathom-proxy/index.ts`.

Deploy it to a separate Supabase project:

```bash
# Navigate to your external Supabase project
cd /path/to/external-supabase-project

# Copy the fathom-proxy function
cp -r /path/to/valuedock/supabase/functions/fathom-proxy ./supabase/functions/

# Deploy the function
supabase functions deploy fathom-proxy

# Set the Fathom API key secret
supabase secrets set FATHOM_API_KEY=your_fathom_api_key_here
```

### 2. Configure VD_URL Environment Variable

The VD_URL should point to your external Supabase project where the proxy is deployed.

#### For Production Deployment:

```bash
# In your ValuDock Supabase project
supabase secrets set VD_URL=https://your-external-project.supabase.co
```

#### For Figma Make Environment:

The VD_URL needs to be set in the Edge Function environment. Since Figma Make doesn't support this directly, you have two options:

**Option A: Use Sample Data (Current)**
- The system will automatically provide sample meeting data
- Users can manually edit the content as needed
- Good for demos and testing

**Option B: Configure External Deployment**
1. Deploy ValuDock to a standard Supabase project
2. Set VD_URL as an Edge Function secret
3. Real Fathom data will be fetched automatically

### 3. Verify Setup

Once configured, the Meeting History feature will:

1. ✅ Check if VD_URL is configured
2. ✅ If configured: Fetch real meetings from Fathom via proxy
3. ✅ If not configured: Return sample data with setup instructions

## Sample Data Response

When VD_URL is not configured, the system provides:

```json
{
  "summary": "⚙️ Fathom Integration Setup Required\n\n[Setup instructions and sample content]",
  "meetingCount": 3,
  "attendees": ["Sample Contact (CEO)", ...],
  "meetingDates": ["October 12, 2025", ...],
  "domain": "example.com",
  "_isSampleData": true
}
```

## Frontend Indicators

The UI shows clear indicators when sample data is being used:

- 🔵 **Info Alert:** "This is sample data. To load real Fathom meetings..."
- 🏷️ **Badge:** "Sample Data" label on the summary
- 📢 **Toast:** "Sample data loaded. Configure Fathom proxy for real data."

## Testing

### Test with Sample Data (No Setup Required)

1. Navigate to Create Presentation → Meeting History
2. Enter a company domain (e.g., "acme.com")
3. Click "Aggregate Meetings"
4. Sample data will be loaded with setup instructions

### Test with Real Data (Requires Setup)

1. Complete all setup steps above
2. Navigate to Create Presentation → Meeting History
3. Enter a company domain that has Fathom meetings
4. Click "Aggregate Meetings"
5. Real meeting data will be fetched and aggregated

## Troubleshooting

### "Proxy not configured" message

**Cause:** VD_URL environment variable is not accessible to the Edge Function

**Solutions:**
1. For demos: Use the sample data (no action needed)
2. For production: Set VD_URL as described in Setup Step 2

### "Failed to connect to Fathom proxy"

**Cause:** VD_URL is set but the proxy is unreachable

**Check:**
- Is the external Supabase project running?
- Is the fathom-proxy function deployed?
- Is the URL correct (should end with .supabase.co)?

### "Fathom API error"

**Cause:** Proxy is working but Fathom API call failed

**Check:**
- Is FATHOM_API_KEY set in the external project?
- Does the API key have the correct permissions?
- Is the domain correct and do meetings exist for it?

## API Reference

### POST /fathom-meeting-history

Aggregates meetings for a specific company domain.

**Request:**
```json
{
  "domain": "acme.com"
}
```

**Response (Real Data):**
```json
{
  "summary": "We conducted 4 meetings with acme.com...",
  "meetingCount": 4,
  "attendees": ["John Doe (CEO)", "Jane Smith (CFO)"],
  "meetingDates": ["October 15, 2025", "October 10, 2025"],
  "domain": "acme.com"
}
```

**Response (Sample Data):**
```json
{
  "summary": "**⚙️ Fathom Integration Setup Required**...",
  "meetingCount": 3,
  "attendees": ["Sample Contact (CEO)", ...],
  "meetingDates": [...],
  "domain": "acme.com",
  "_isSampleData": true
}
```

## Benefits

✅ **Graceful Degradation:** Works out-of-the-box with sample data  
✅ **Clear Setup Path:** Users know exactly what's needed for real data  
✅ **Production Ready:** Full real-time integration when proxy is configured  
✅ **User-Friendly:** Sample data is realistic and editable

## Next Steps

1. ✅ Sample data mode is working (current state)
2. 🔄 Deploy to production Supabase to enable real Fathom integration
3. 🎯 Configure VD_URL environment variable
4. ✅ Real meeting data will flow automatically

---

**Last Updated:** October 19, 2025  
**Status:** Sample data mode active, proxy setup documented
