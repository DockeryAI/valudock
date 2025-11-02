# Fathom Integration Testing Guide

## Overview

This guide walks through testing the new Fathom meeting integration in ValuDock's export flow. The integration allows you to identify customers, check for Fathom meetings before export, and automatically link meeting transcripts to AI-generated proposals.

## Prerequisites

### 1. Environment Setup

Ensure your `.env` file has the following variables:

```bash
# Base URL for Sales Assistant API
VITE_SALES_ASSISTANT_URL=https://palnrcrchtqexcibnvsu.supabase.co

# Webhook authentication secret
VITE_VALUEDOCK_WEBHOOK_SECRET=5fdaa7dee950980cc28a93cda6ac3f884fda831a7e6c600e781031945cf449cb
```

For local development:
```bash
VITE_SALES_ASSISTANT_URL=http://localhost:54321
```

### 2. Sales Assistant Must Be Running

If testing locally, ensure Sales Assistant's Supabase functions are running:

```bash
cd /Users/byronhudson/Projects/sales-assistant
supabase start
```

### 3. Fathom Meetings in Database

For the integration to work, you need Fathom meetings in the Sales Assistant database that match your test company's email domain.

**Example test data:**
- Company: "Acme Corporation"
- Email Domain: "acme.com"
- Contacts: john@acme.com, sarah@acme.com
- Meetings: Any Fathom meetings with participants from @acme.com

## Testing Steps

### Test 1: Export with Existing Meetings (Happy Path)

This tests the scenario where meetings ARE found.

1. **Start ValuDock**
   ```bash
   cd /Users/byronhudson/Projects/ValuDock/ValueDock
   npm run dev
   ```

2. **Create or Open an ROI Analysis**
   - Navigate to a deal with ROI calculations complete
   - Or create a new test deal with some basic ROI data

3. **Click "Export to Proposal" Button**
   - Should open the export modal

4. **Fill Out Customer Information**
   ```
   Company Name: Acme Corporation
   Email Domain: acme.com

   Main Contact:
   - Name: John Smith
   - Email: john@acme.com
   - Title: CTO

   [Click + Add Another Contact if you want to add more]
   ```

5. **Click "Check for Meetings"**
   - Should show loading spinner
   - Wait for response (usually 1-3 seconds)

6. **Verify Meeting Check Result**

   **Expected: Green success box showing:**
   ```
   ✅ Found 5 meetings with 3 transcripts. Proposal will include rich meeting insights.

   Total: 5 meeting(s)
   With Transcripts: 3

   Recent meetings:
   • Acme Q4 Planning (10/15/2024)
   • Product Demo - Acme (10/10/2024)
   • Discovery Call - Acme (10/01/2024)
   ```

7. **Click "Export Now"**
   - Should show "Exporting..." state
   - Should close modal on success
   - Should show success message with proposal ID

8. **Verify in Sales Assistant**
   ```bash
   # Open Sales Assistant
   open http://localhost:5173  # or your Sales Assistant URL
   ```

   - Navigate to Proposals tab
   - Find the new proposal (titled "Acme Corporation - MM-DD-YYYY")
   - Should show "generating..." or completed status
   - Proposal should include sections with Fathom meeting insights

### Test 2: Export with No Meetings (Warning Path)

This tests the scenario where NO meetings are found.

1. **Click "Export to Proposal"** (on any deal)

2. **Fill Out Customer Information with Non-Existent Domain**
   ```
   Company Name: Fake Company Inc
   Email Domain: fakecompany99999.com

   Main Contact:
   - Name: Jane Doe
   - Email: jane@fakecompany99999.com
   - Title: CEO
   ```

3. **Click "Check for Meetings"**

4. **Verify Warning Display**

   **Expected: Yellow warning box:**
   ```
   ⚠️ No meetings found. Proposal will be generated using ValuDock ROI data only.

   No Fathom meetings were found for this customer. The proposal will be
   generated using only ValuDock ROI data. You can still proceed with the export.
   ```

5. **Verify You Can Still Export**
   - "Export Now" button should still be enabled
   - User can proceed despite warning

6. **Click "Export Now"**
   - Should succeed and create proposal
   - Proposal will only include ValuDock ROI data (no meeting insights)

### Test 3: Form Validation

This tests required field validation.

1. **Click "Export to Proposal"**

2. **Leave Email Domain Empty**
   - Try clicking "Check for Meetings"
   - **Expected:** Error message "Please enter an email domain (e.g., acme.com)"

3. **Fill Email Domain, Leave Contact Empty**
   ```
   Email Domain: acme.com
   Main Contact: [leave all fields blank]
   ```
   - Try clicking "Export Now"
   - **Expected:** Error message "Main contact name and email are required"

4. **Fill Required Fields Properly**
   - Should allow export to proceed

### Test 4: Multiple Contacts

This tests the dynamic contact form.

1. **Click "Export to Proposal"**

2. **Add Multiple Contacts**
   ```
   Main Contact:
   - Name: John Smith
   - Email: john@acme.com
   - Title: CTO

   [Click + Add Another Contact]

   Contact 2:
   - Name: Sarah Johnson
   - Email: sarah@acme.com
   - Title: VP Engineering

   [Click + Add Another Contact]

   Contact 3:
   - Name: Mike Davis
   - Email: mike@acme.com
   - Title: Director of IT
   ```

3. **Verify UI**
   - Should show 3 contact cards
   - Main contact should show "👤 Main Contact"
   - Additional contacts should show "Contact 2", "Contact 3"
   - Additional contacts should have X button to remove

4. **Remove a Contact**
   - Click X on Contact 2
   - **Expected:** Contact removed, Contact 3 becomes Contact 2

5. **Check for Meetings**
   - All contact emails should be included in the check
   - Meetings with ANY of these email domains should be found

### Test 5: API Error Handling

This tests error handling when Sales Assistant is unreachable.

1. **Stop Sales Assistant** (if running locally)
   ```bash
   cd /Users/byronhudson/Projects/sales-assistant
   supabase stop
   ```

2. **In ValuDock, Try to Check for Meetings**
   - **Expected:** Error message displayed
   - Should still allow user to proceed with export

3. **Try to Export**
   - **Expected:** Export fails with network error
   - Error message displayed to user

4. **Restart Sales Assistant**
   ```bash
   cd /Users/byronhudson/Projects/sales-assistant
   supabase start
   ```

5. **Retry Export**
   - Should now succeed

## Expected API Calls

### 1. Check Meetings API

**Request:**
```json
POST https://palnrcrchtqexcibnvsu.supabase.co/functions/v1/check-meetings-for-company
Content-Type: application/json

{
  "emailDomain": "acme.com",
  "companyName": "Acme Corporation",
  "contactEmails": ["john@acme.com", "sarah@acme.com"]
}
```

**Response (with meetings):**
```json
{
  "success": true,
  "emailDomain": "acme.com",
  "companyName": "Acme Corporation",
  "totalMeetings": 5,
  "withTranscripts": 3,
  "withoutTranscripts": 2,
  "preview": [
    {
      "id": "uuid",
      "title": "Acme Q4 Planning",
      "date": "10/15/2024",
      "participantCount": 4,
      "hasTranscript": true
    }
  ],
  "recommendation": "✅ Found 5 meetings with 3 transcripts..."
}
```

**Response (no meetings):**
```json
{
  "success": true,
  "totalMeetings": 0,
  "withTranscripts": 0,
  "preview": [],
  "recommendation": "⚠️ No meetings found...",
  "warnings": ["No meetings found - proposal will use ValuDock data only"]
}
```

### 2. Export Webhook API

**Request:**
```json
POST https://palnrcrchtqexcibnvsu.supabase.co/functions/v1/valuedock-webhook
Authorization: Bearer <webhook_secret>
Content-Type: application/json

{
  "source": "valuedock",
  "exportId": "exp_1730568000_deal_123",
  "dealId": "deal_123",
  "organizationId": "Acme Corporation",
  "organizationDomain": "acme.com",
  "organizationWebsite": "https://acme.com",
  "contacts": [
    {
      "name": "John Smith",
      "email": "john@acme.com",
      "title": "CTO",
      "isMainContact": true
    },
    {
      "name": "Sarah Johnson",
      "email": "sarah@acme.com",
      "title": "VP Engineering",
      "isMainContact": false
    }
  ],
  "tenantId": "test-tenant",
  "exportedAt": "2024-11-02T18:00:00Z",
  "exportedBy": "user_123",
  "roi_summary": {
    "annual_savings": 250000,
    "payback_months": 8,
    "processes_count": 3
  },
  "processes": [],
  "timeline": {},
  "assumptions": {},
  "cost_breakdown": {}
}
```

**Response:**
```json
{
  "success": true,
  "proposalId": "uuid",
  "companyId": "uuid",
  "matchedMeetings": 5,
  "totalMeetings": 5,
  "message": "ROI data received, 5 meeting(s) linked, proposal created",
  "nextSteps": [
    "Proposal record created in Sales Assistant",
    "5 Fathom meeting(s) automatically linked",
    "AI generation triggered in background",
    "Check Proposals tab to view and edit"
  ]
}
```

## Debugging Tips

### Check Browser Console

Open DevTools (F12) and check the Console tab for:

```javascript
[CheckMeetings] Searching for meetings with domain: acme.com
[CheckMeetings] Found 5 matching meetings
```

### Check Network Tab

Look for these API calls:
- POST `/functions/v1/check-meetings-for-company`
- POST `/functions/v1/valuedock-webhook`

Inspect request/response bodies to verify data being sent.

### Check Sales Assistant Logs

If testing locally:

```bash
cd /Users/byronhudson/Projects/sales-assistant
supabase functions logs check-meetings-for-company --local
supabase functions logs valuedock-webhook --local
```

### Common Issues

**Issue:** "Check for Meetings" button disabled
- **Cause:** Email domain field is empty
- **Fix:** Enter a valid email domain (e.g., acme.com)

**Issue:** "Unable to check meetings" error
- **Cause:** Sales Assistant URL incorrect or service down
- **Fix:** Verify VITE_SALES_ASSISTANT_URL in .env

**Issue:** "Export failed" error
- **Cause:** Missing webhook secret or incorrect URL
- **Fix:** Verify VITE_VALUEDOCK_WEBHOOK_SECRET in .env

**Issue:** "Main contact required" error
- **Cause:** Main contact name or email is empty
- **Fix:** Fill out all required fields marked with *

**Issue:** Meetings not showing in check
- **Cause:** No meetings in database with matching email domain
- **Fix:** Import Fathom meetings or use a test domain that has meetings

## Success Criteria

✅ **All tests pass if:**

1. Form displays correctly with all fields
2. Can add/remove multiple contacts
3. Check for Meetings button works and shows results
4. Warning displays when no meetings found
5. Export succeeds with valid data
6. Export creates proposal in Sales Assistant
7. Proposal includes meeting insights (when meetings exist)
8. Form validation prevents invalid exports
9. Error messages are clear and helpful
10. User can proceed even if no meetings found

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy ValuDock changes to production
   - Update Sales Assistant production environment
   - Train users on new workflow

2. **If tests fail:**
   - Check error messages in console
   - Verify environment variables
   - Ensure Sales Assistant functions are deployed
   - Review API logs for errors

3. **For production deployment:**
   - Update VITE_SALES_ASSISTANT_URL to production URL
   - Ensure webhook secret is secure
   - Test with real customer data
   - Monitor API logs for errors

## Support

For issues or questions:
- Review VALUDOCK_INTEGRATION_GUIDE.md in sales-assistant project
- Review FATHOM_INTEGRATION_SUMMARY.md for API details
- Check Supabase function logs for backend errors

---

**Testing Checklist:**

- [ ] Test 1: Export with existing meetings
- [ ] Test 2: Export with no meetings (warning)
- [ ] Test 3: Form validation
- [ ] Test 4: Multiple contacts
- [ ] Test 5: API error handling
- [ ] Verify API calls in Network tab
- [ ] Check Sales Assistant logs
- [ ] Verify proposal created correctly
- [ ] Verify meeting insights in proposal

**Status:** Ready for testing
**Version:** v0.3.0
**Last Updated:** 2024-11-02
