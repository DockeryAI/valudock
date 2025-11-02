# Fathom Integration Error Fix Guide

## 🔧 Error Fixed: "Failed to fetch meeting history from Fathom"

The system has been updated with comprehensive error handling and logging to help diagnose and fix Fathom API issues.

## ✅ What Was Fixed

### 1. **Enhanced Backend Error Handling**
- Added detailed logging for all Fathom API calls
- Better error messages based on HTTP status codes
- Specific handling for 401 (authentication) and 403 (permission) errors
- Returns user-friendly error messages to frontend

### 2. **Improved Frontend Error Display**
- Shows specific error messages from backend
- Logs detailed debugging information to console
- Better user feedback with informative toast messages
- Handles empty results gracefully

### 3. **Added Test Endpoint**
- New endpoint to verify Fathom API connectivity: `/make-server-888f4514/test-fathom`
- Tests API key validity
- Shows meeting count if successful
- Provides specific error diagnosis

## 🔍 Debugging Steps

### Step 1: Check API Key Configuration

Open your browser console and run:
```javascript
fetch('https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-888f4514/test-fathom')
  .then(r => r.json())
  .then(console.log)
```

**Expected successful response:**
```json
{
  "success": true,
  "message": "Fathom API connection successful",
  "meetingCount": 5,
  "keys": {
    "fathom": true,
    "openai": true
  }
}
```

**If you see error responses:**

#### Error: "FATHOM_API_KEY not configured"
**Solution:** Add your Fathom API key
1. You should have received a modal to add FATHOM_API_KEY
2. If not, contact support to add the environment variable
3. Get your key from: https://app.fathom.video/settings/integrations

#### Error: "Invalid Fathom API key" (401)
**Solution:** Your API key is incorrect
1. Go to https://app.fathom.video/settings/integrations
2. Verify your API key is correct
3. Generate a new API key if needed
4. Update the environment variable

#### Error: "Fathom API access forbidden" (403)
**Solution:** API key lacks permissions
1. Check your Fathom account has meetings
2. Verify the API key has read access to meetings
3. Try regenerating the API key with full permissions

### Step 2: Check Browser Console Logs

When you click the AI sparkle button for Meeting History, you should see:

```
[FATHOM-FRONTEND] Fetching meeting history for domain: acme.com
[FATHOM-FRONTEND] Response status: 200
[FATHOM-FRONTEND] Meeting count: 4
[FATHOM-FRONTEND] Summary length: 523
```

**If you see errors**, note the exact error message and status code.

### Step 3: Check Server Logs

In your Supabase dashboard:
1. Go to Edge Functions
2. Click on `make-server-888f4514`
3. View Logs tab

Look for entries starting with `[FATHOM]`:

**Successful flow:**
```
[FATHOM] Starting meeting fetch...
[FATHOM] API Key present: true
[FATHOM] Response status: 200
[FATHOM] Retrieved 10 total meetings
[FATHOM] Found 4 meetings with attendees from acme.com
[FATHOM] Got summary for meeting abc123: ...
[FATHOM] Successfully generated executive summary
```

**If you see errors**, the logs will show specific details about what failed.

## 🎯 Common Issues & Solutions

### Issue 1: "No meetings found with attendees from {domain}"

**Cause:** Fathom has no meetings with attendees from that company domain.

**Solutions:**
1. ✅ **Verify domain is correct**
   - Input: `https://www.acme-corp.com` → Domain: `acme-corp.com`
   - Make sure the domain matches attendee emails in Fathom

2. ✅ **Check Fathom meetings**
   - Go to https://app.fathom.video
   - Verify you have recorded meetings
   - Check attendee emails match the company domain
   - Example: For domain `acme.com`, you need attendees with `@acme.com` emails

3. ✅ **Use correct email domains**
   - ✅ GOOD: `john.smith@acme.com` (matches `acme.com`)
   - ❌ BAD: `john.smith@gmail.com` (personal email, won't match)

### Issue 2: "API keys not configured"

**Cause:** Missing FATHOM_API_KEY or OPENAI_API_KEY environment variable.

**Solution:**
1. Check you received modal to add FATHOM_API_KEY
2. Get Fathom API key: https://app.fathom.video/settings/integrations
3. OpenAI key should already be configured (OPENAI_API_KEY)
4. If keys are missing, they need to be added as Supabase secrets

### Issue 3: Network/Connection Errors

**Cause:** Cannot reach Fathom API servers.

**Solutions:**
1. ✅ Check internet connectivity
2. ✅ Verify Fathom.video is not down: https://status.fathom.video
3. ✅ Try again in a few minutes
4. ✅ Check firewall/proxy settings

### Issue 4: "Failed to generate summary" (OpenAI errors)

**Cause:** OpenAI API issues or missing key.

**Solutions:**
1. ✅ Verify OPENAI_API_KEY is configured
2. ✅ Check OpenAI account has credits: https://platform.openai.com/account/billing
3. ✅ Verify API key is valid
4. ✅ Check OpenAI rate limits

### Issue 5: Empty Challenges/Goals Arrays

**Cause:** AI couldn't extract structured data from meeting summaries.

**Why this happens:**
- Meetings don't explicitly discuss challenges or goals
- Fathom summaries lack specific business problem/objective language
- Meetings are too general or off-topic

**Solutions:**
1. ✅ **Improve meeting discussions**
   - Explicitly mention "our goal is to..."
   - Discuss specific problems: "the challenge we're facing is..."
   - Use business-focused language

2. ✅ **Review Fathom summaries**
   - Check if Fathom captured the key discussion points
   - Ensure summaries include business objectives and problems

3. ✅ **Manual entry as fallback**
   - If AI extraction fails, manually enter challenges/goals
   - Use AI-generated content as a starting point, not final copy

## 📋 Testing Checklist

Use this checklist to verify your Fathom integration:

- [ ] **Step 1:** FATHOM_API_KEY environment variable is set
- [ ] **Step 2:** OPENAI_API_KEY environment variable is set
- [ ] **Step 3:** Test endpoint returns `success: true`
- [ ] **Step 4:** Fathom account has recorded meetings
- [ ] **Step 5:** Meetings have attendees with company domain emails
- [ ] **Step 6:** Company website entered in Presentation screen
- [ ] **Step 7:** Click AI sparkle button next to Meeting History
- [ ] **Step 8:** Check browser console for `[FATHOM-FRONTEND]` logs
- [ ] **Step 9:** Verify meeting history appears in text field
- [ ] **Step 10:** Try extracting goals and challenges

## 🔐 API Key Setup (Detailed)

### Getting Your Fathom API Key:

1. **Login to Fathom**
   - Visit: https://app.fathom.video

2. **Navigate to Settings**
   - Click your profile icon (top right)
   - Select "Settings"

3. **Go to Integrations**
   - URL: https://app.fathom.video/settings/integrations
   - Or click "Integrations" in settings menu

4. **Generate API Key**
   - Look for "API Access" or "API Keys" section
   - Click "Generate New Key" or "Create API Key"
   - Name it "ValueDock Integration"
   - Copy the key immediately (you won't see it again!)

5. **Add to ValueDock**
   - You should see a modal prompting for FATHOM_API_KEY
   - Paste the key you just copied
   - Click Save/Submit

6. **Verify**
   - Use the test endpoint (see Step 1 above)
   - Should return success: true

### API Key Permissions:

Your Fathom API key needs:
- ✅ Read access to meetings
- ✅ Read access to transcripts/summaries
- ✅ Read access to attendees

If you have issues, regenerate the key with full read permissions.

## 🎬 Example Workflow

Here's a complete example of successful Fathom integration:

### Scenario:
- Company: Acme Corporation
- Website: https://www.acme-corp.com
- Domain: acme-corp.com
- Meetings in Fathom: 3 meetings with attendees from @acme-corp.com

### Steps:

1. **Go to Presentation Screen** in ValueDock

2. **Fill Executive Summary:**
   - Company Name: "Acme Corporation"
   - Company Website: "https://www.acme-corp.com"

3. **Generate Meeting History:**
   - Click AI sparkle ✨ next to "Meeting History"
   - Wait 5-10 seconds
   - See toast: "Generated meeting history from 3 Fathom meetings"
   - Text appears in Meeting History field

4. **Extract Goals:**
   - Scroll to Goals section
   - Click "Extract from Fathom" button
   - See toast: "Added 4 goals from Fathom meetings"
   - New goals appear in Goals list

5. **Extract Challenges:**
   - Scroll to Challenges section
   - Click "Extract from Fathom" button
   - See toast: "Added 5 challenges from Fathom meetings"
   - New challenges appear in Challenges list

6. **Review & Edit:**
   - Review AI-generated content
   - Edit as needed for accuracy
   - Continue building presentation

## 🆘 Still Having Issues?

If you've tried everything above and still have errors:

### Check Server Logs:
1. Supabase Dashboard → Edge Functions → make-server-888f4514 → Logs
2. Look for `[FATHOM]` entries
3. Note exact error messages

### Browser Console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for `[FATHOM-FRONTEND]`, `[FATHOM-GOALS]`, `[FATHOM-CHALLENGES]` entries
4. Note exact error messages

### Test API Directly:
```bash
# Replace with your actual API key
curl -H "Authorization: Bearer YOUR_FATHOM_API_KEY" \
  https://api.fathom.video/v1/meetings
```

Expected: JSON response with meetings array
If error: Note the HTTP status code and error message

### Common Error Codes:
- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: API key lacks permissions
- **404 Not Found**: Wrong endpoint URL
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Fathom API issue
- **503 Service Unavailable**: Fathom is down

## 📝 Summary

The Fathom integration has been enhanced with:
✅ Better error messages
✅ Detailed logging for debugging
✅ Test endpoint for connectivity verification
✅ Graceful handling of edge cases
✅ User-friendly feedback

**Next Steps:**
1. Test the connectivity using the test endpoint
2. Try generating meeting history with a real company domain
3. Check browser console and server logs if issues occur
4. Use this guide to troubleshoot specific errors

The integration should now provide clear, actionable error messages that help you quickly identify and fix any issues!
