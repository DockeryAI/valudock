# ValueDock Fathom Loader - Figma Plugin Setup Guide

## Overview

This Figma plugin fetches Fathom meeting data via a proxy endpoint and automatically maps it to text layers in your Figma design. Perfect for creating presentation decks with real customer meeting data.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

Or for development with auto-rebuild:

```bash
npm run watch
```

### 3. Load in Figma

1. Open Figma Desktop App
2. Go to **Menu → Plugins → Development → Import plugin from manifest...**
3. Select the `manifest.json` file from this directory
4. Plugin will appear in **Menu → Plugins → Development → ValueDock Fathom Loader**

---

## File Structure

```
/
├── scripts/
│   └── figmaMeetingSelector.ts    # Plugin controller (TypeScript)
├── dist/
│   └── code.js                     # Compiled plugin code (auto-generated)
├── index.html                      # Plugin UI
├── manifest.json                   # Figma plugin manifest
└── package.json                    # Build scripts and dependencies
```

---

## Usage

### Step 1: Prepare Your Design

Create text layers in Figma with these **exact names**:

- `Title` - Meeting title
- `Date` - Meeting date/time
- `Summary` - AI-generated meeting summary
- `Bullets` - Meeting highlights (bullet points)
- `TranscriptLink` - Link to Fathom transcript

**Example Figma Setup:**

```
Frame: "Meeting Card"
  ├─ Text: "Title"
  ├─ Text: "Date"
  ├─ Text: "Summary"
  ├─ Text: "Bullets"
  └─ Text: "TranscriptLink"
```

### Step 2: Configure Proxy URL

**Option A: Environment Variable (Recommended)**

Set `NEXT_PUBLIC_PROXY_URL` before building:

```bash
export NEXT_PUBLIC_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-fetch
npm run build
```

**Option B: Manual Entry**

Leave env unset and enter the proxy URL in the plugin UI. It will be saved to Figma's client storage.

### Step 3: Load Meetings

1. **Open the plugin** (Menu → Plugins → Development → ValueDock Fathom Loader)
2. **Enter domain** (required): e.g., `dockeryai.com`
3. **Add filters** (optional):
   - Alias domains: `example.com, another.com`
   - Specific emails: `user@gmail.com, contact@example.com`
   - Date range: Since/Until
   - Limit: 1-100 meetings per request
4. **Click "Load Meetings"**
5. **Select a meeting** from the list
6. **Click "Apply to Layers"**

---

## Proxy Endpoint Requirements

Your proxy endpoint must:

### Accept POST Request

```typescript
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

### Return Response

```typescript
{
  "items": [
    {
      "id": "94471626",
      "title": "Sales Call",
      "date": "2025-10-15T20:54:42Z",
      "summary": "Meeting summary here...",
      "highlights": ["Point 1", "Point 2"],
      "transcript_url": "https://fathom.video/calls/436945936",
      "share_url": "https://fathom.video/share/...",
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
    "raw_count": 10,
    "filtered_count": 5,
    "returned_count": 5
  }
}
```

---

## Features

### ✅ Pagination Support

- **Load More** button appears when `next_cursor` exists
- Automatically appends new meetings to the list
- Enforces `limit` parameter (1-100 per request)

### ✅ Domain & Email Filtering

- **Primary domain**: Required (e.g., `dockeryai.com`)
- **Alias domains**: Optional comma-separated list
- **Specific emails**: Optional comma-separated list
- All filters are sent to proxy for server-side filtering

### ✅ Date Range Filtering

- **Since**: Optional start date (ISO 8601)
- **Until**: Optional end date (ISO 8601)
- Uses HTML5 `datetime-local` input

### ✅ Smart Layer Mapping

- Finds text layers by **exact name match**
- Automatically loads Inter Regular font
- Updates only matching layers
- Shows count of updated layers

### ✅ Error Handling

- Clear error messages with visual banners
- Validates domain input
- Checks for proxy URL configuration
- Handles network failures gracefully

### ✅ Debug Mode

- Toggle-able debug panel
- Shows raw API response counts
- Logs all operations to browser console

### ✅ Persistent Storage

- Proxy URL saved to Figma client storage
- Survives plugin restarts
- Per-user configuration

---

## Error Messages

### "Please enter a domain."
**Cause**: Domain field is empty  
**Fix**: Enter a valid domain (e.g., `dockeryai.com`)

### "Proxy URL required (set NEXT_PUBLIC_PROXY_URL or fill the field)."
**Cause**: No proxy URL configured  
**Fix**: Either:
- Set `NEXT_PUBLIC_PROXY_URL` env var and rebuild
- Enter proxy URL in the plugin UI

### "Proxy failed: 404 — Not Found"
**Cause**: Proxy endpoint doesn't exist or is incorrect  
**Fix**: Verify the proxy URL is correct

### "No meetings found. Try adding emails or widening the date range."
**Cause**: No meetings match the filters  
**Fix**: 
- Check domain spelling
- Add specific emails
- Widen date range
- Remove filters to see all meetings

### "No matching text layers found. Create layers named: Title, Date, Summary, Bullets, TranscriptLink"
**Cause**: No text layers with expected names  
**Fix**: Create text layers with exact names (case-sensitive)

---

## Development

### Build for Production

```bash
npm run build
```

Outputs to `dist/code.js`

### Development Mode (Auto-rebuild)

```bash
npm run watch
```

Plugin automatically reloads in Figma when code changes.

### Testing

1. **Create test layers**:
   ```
   Title
   Date
   Summary
   Bullets
   TranscriptLink
   ```

2. **Run plugin** and verify each layer updates correctly

3. **Test edge cases**:
   - Empty meeting list
   - Missing summary
   - No highlights
   - Network errors
   - Pagination

### Console Logging

All operations are logged to browser console:

```javascript
// Figma plugin console (main thread)
console.log('[Figma Plugin] ...')

// UI console (iframe)
console.log('[UI] ...')
```

Open DevTools in Figma: **Menu → Plugins → Development → Open Console**

---

## Proxy Implementation Example

Here's a minimal Supabase Edge Function proxy:

```typescript
// /supabase/functions/fathom-fetch/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { domain, aliases, emails, since, until, limit, cursor } = await req.json();
    
    // Validate domain
    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    // Call Fathom API
    const fathomApiKey = Deno.env.get('FATHOM_API_KEY');
    const fathomUrl = `https://us.fathom.video/api/v1/meetings${cursor ? `?cursor=${cursor}` : ''}`;
    
    const response = await fetch(fathomUrl, {
      headers: {
        'Authorization': `Bearer ${fathomApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Fathom API error: ${response.status}`);
    }
    
    const data = await response.json();
    const allMeetings = data.items || [];
    
    // Filter by domain/emails
    const filtered = allMeetings.filter(meeting => {
      if (!meeting.calendar_invitees) return false;
      
      return meeting.calendar_invitees.some(attendee => {
        const emailDomain = attendee.email_domain?.toLowerCase();
        const email = attendee.email?.toLowerCase();
        
        // Check domain match
        if (emailDomain === domain.toLowerCase()) return true;
        
        // Check alias match
        if (aliases?.some(a => a.toLowerCase() === emailDomain)) return true;
        
        // Check specific email match
        if (emails?.some(e => e.toLowerCase() === email)) return true;
        
        return false;
      });
    });
    
    // Apply date filters
    let dateFiltered = filtered;
    if (since) {
      dateFiltered = dateFiltered.filter(m => 
        new Date(m.date) >= new Date(since)
      );
    }
    if (until) {
      dateFiltered = dateFiltered.filter(m => 
        new Date(m.date) <= new Date(until)
      );
    }
    
    // Apply limit
    const limited = dateFiltered.slice(0, limit);
    
    return new Response(
      JSON.stringify({
        items: limited,
        next_cursor: data.next_cursor || null,
        debug: {
          raw_count: allMeetings.length,
          filtered_count: dateFiltered.length,
          returned_count: limited.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
```

Deploy:
```bash
supabase functions deploy fathom-fetch
```

Then use:
```
NEXT_PUBLIC_PROXY_URL=https://your-project.supabase.co/functions/v1/fathom-fetch
```

---

## Troubleshooting

### Plugin Won't Load

1. Check `dist/code.js` exists (run `npm run build`)
2. Check `manifest.json` paths are correct
3. Restart Figma Desktop App

### UI Not Showing

1. Check `index.html` exists
2. Check console for errors
3. Try reimporting the plugin

### Meetings Not Loading

1. Open plugin console (Menu → Plugins → Development → Open Console)
2. Check for network errors
3. Verify proxy URL is correct
4. Test proxy endpoint directly with curl/Postman

### Layers Not Updating

1. Verify layer names are **exact** (case-sensitive):
   - `Title` not `title` or `TITLE`
2. Ensure layers are TEXT layers, not frames
3. Check console for font loading errors
4. Select a meeting before clicking "Apply to Layers"

---

## Production Deployment

### 1. Set Environment Variable

```bash
export NEXT_PUBLIC_PROXY_URL=https://prod.supabase.co/functions/v1/fathom-fetch
```

### 2. Build

```bash
npm run build
```

### 3. Publish to Figma Community (Optional)

1. Update `manifest.json` with unique ID
2. Add description, icon, and screenshots
3. Submit to Figma Community

---

## Security Notes

- **Proxy required**: Plugin never calls Fathom API directly (CORS restrictions)
- **API keys**: Never hardcode API keys in plugin code
- **Storage**: Proxy URL stored locally in Figma, not sent to external servers
- **Network access**: Plugin declares `allowedDomains: ["*"]` for flexibility

---

## Support

### Common Issues

**Q: Why use a proxy instead of calling Fathom directly?**  
A: Figma plugins run in a sandboxed iframe with CORS restrictions. The proxy handles authentication and CORS headers.

**Q: Can I use this without a proxy?**  
A: No. Fathom API doesn't support CORS from Figma plugin origins.

**Q: Does this work in Figma web (browser)?**  
A: No. This plugin uses `networkAccess` which requires Figma Desktop App.

**Q: How do I change the text layer names?**  
A: Edit the `handleApplyMeeting` function in `scripts/figmaMeetingSelector.ts`

---

## License

MIT - Use freely in your projects

---

## Credits

Built for **ValueDock** by the Figma Make AI team.

**Last Updated**: October 17, 2024
