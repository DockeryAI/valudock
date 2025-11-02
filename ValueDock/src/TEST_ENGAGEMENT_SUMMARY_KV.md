# Test Guide: Engagement Summary KV Store

## 🎯 Testing Goals
Verify that the Meeting History Aggregate feature works correctly with the new KV store backend.

---

## ✅ Pre-Test Checklist

### Environment Variables
Ensure these are set in Supabase Edge Function secrets:
- [ ] `FATHOM_API_KEY` - Valid Fathom API key
- [ ] `OPENAI_API_KEY` - Valid OpenAI API key
- [ ] `SUPABASE_URL` - Project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Verify Edge Function is Running
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-888f4514/ping

# Expected response:
{
  "ok": true,
  "message": "ValuDock Edge Function is running",
  "environment": {
    "openai": "✓",
    "fathom": "✓",
    ...
  }
}
```

---

## 🧪 Test 1: Basic Flow - Happy Path

### Step 1: Start the Job
```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-summary \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"domain": "testcompany.com"}'
```

**Expected Response**:
```json
{
  "ok": true,
  "domain": "testcompany.com",
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

✅ **Success Criteria**:
- Response has `ok: true`
- `run_id` is a valid UUID
- `status` is "processing"

### Step 2: Poll for Status (Immediate)
```bash
curl "https://{projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-status?domain=testcompany.com&run_id={run_id}" \
  -H "Authorization: Bearer {accessToken}"
```

**Expected Response** (still processing):
```json
[
  {
    "domain": "testcompany.com",
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "summary": null,
    "error": null,
    "created_at": "2025-10-21T10:00:00.000Z",
    "updated_at": "2025-10-21T10:00:00.000Z"
  }
]
```

✅ **Success Criteria**:
- Response is an array with 1 item
- `status` is "processing"
- Record has all required fields

### Step 3: Wait and Poll Again (After 10-30 seconds)
```bash
# Wait 10-30 seconds, then poll again
curl "https://{projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-status?domain=testcompany.com&run_id={run_id}" \
  -H "Authorization: Bearer {accessToken}"
```

**Expected Response** (complete):
```json
[
  {
    "domain": "testcompany.com",
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "complete",
    "summary": {
      "meetings_count": 5,
      "people": [
        {"name": "John Doe", "role": "CEO", "count": 3}
      ],
      "themes": [
        {"topic": "Automation", "mentions": 15}
      ],
      "goals": ["Reduce manual work", "Improve efficiency"],
      "challenges": ["Legacy systems", "Budget constraints"],
      "risks": ["Integration complexity"],
      "recommendations": ["Start with pilot project"]
    },
    "error": null,
    "created_at": "2025-10-21T10:00:00.000Z",
    "updated_at": "2025-10-21T10:00:30.000Z"
  }
]
```

✅ **Success Criteria**:
- `status` is "complete"
- `summary` contains all expected fields
- `meetings_count` > 0
- `error` is null
- `updated_at` is later than `created_at`

---

## 🧪 Test 2: No Meetings Found

### Test with Non-Existent Domain
```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-summary \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"domain": "nonexistent-company-xyz-12345.com"}'
```

**Expected Behavior**:
- Job starts successfully
- After processing, status becomes "complete"
- Summary shows zero meetings

**Expected Summary**:
```json
{
  "summary": {
    "meetings_count": 0,
    "people": [],
    "themes": [],
    "goals": [],
    "challenges": [],
    "risks": [],
    "recommendations": []
  }
}
```

✅ **Success Criteria**:
- No error is thrown
- Status reaches "complete"
- All arrays are empty
- `meetings_count` is 0

---

## 🧪 Test 3: Error Handling

### Test with Missing API Key
Temporarily remove OPENAI_API_KEY from secrets, then:

```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-summary \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"domain": "testcompany.com"}'
```

**Expected Behavior**:
- Job starts successfully
- After processing, status becomes "error"
- Error message mentions missing API key

**Expected Response** (after polling):
```json
[
  {
    "status": "error",
    "error": "OPENAI_API_KEY not configured",
    "summary": null
  }
]
```

✅ **Success Criteria**:
- Error is caught and stored
- Status is "error"
- Error message is descriptive
- Job doesn't crash

---

## 🧪 Test 4: Frontend Integration

### Test in UI
1. Navigate to Presentation screen
2. Enter a company website (e.g., "https://testcompany.com")
3. Scroll to "Meeting History" section
4. Click "Generate Meeting Summary" button

**Expected UI Behavior**:
1. Button shows loading state: "Aggregating..."
2. Button is disabled during processing
3. After 10-30 seconds, summary appears
4. Goals and challenges are auto-filled
5. Success toast notification appears

✅ **Success Criteria**:
- [ ] Loading state shows correctly
- [ ] No errors in browser console
- [ ] Data populates all fields
- [ ] User sees confirmation message
- [ ] Can proceed with presentation creation

---

## 🧪 Test 5: Concurrent Requests

### Test Multiple Domains Simultaneously
```bash
# Terminal 1
curl -X POST ... -d '{"domain": "company-a.com"}'

# Terminal 2 (immediately after)
curl -X POST ... -d '{"domain": "company-b.com"}'

# Terminal 3 (immediately after)
curl -X POST ... -d '{"domain": "company-c.com"}'
```

**Expected Behavior**:
- All 3 jobs start successfully
- Each gets unique `run_id`
- All complete independently
- No interference between jobs

✅ **Success Criteria**:
- All 3 return unique run_ids
- All 3 can be polled independently
- All 3 complete successfully
- No KV conflicts

---

## 🧪 Test 6: KV Store Verification

### Check KV Store Directly
```typescript
// In edge function debug endpoint or console
const engagements = await kv.getByPrefix('engagement:');
console.log('All engagement jobs:', engagements);
```

**Expected Output**:
```javascript
[
  {
    key: 'engagement:testcompany.com:uuid-123',
    value: {
      domain: 'testcompany.com',
      run_id: 'uuid-123',
      status: 'complete',
      summary: { ... }
    }
  },
  // ... more engagements
]
```

✅ **Success Criteria**:
- Keys follow pattern: `engagement:{domain}:{run_id}`
- Values contain all required fields
- Completed jobs have status "complete"
- Failed jobs have status "error"

---

## 🧪 Test 7: Cleanup

### Manual Cleanup Test
```typescript
// Delete specific engagement
await kv.del('engagement:testcompany.com:uuid-123');

// Verify deletion
const record = await kv.get('engagement:testcompany.com:uuid-123');
console.log('Should be null:', record);
```

✅ **Success Criteria**:
- Record is deleted successfully
- Subsequent get returns null
- No errors during deletion

### Bulk Cleanup Test
```typescript
// Delete all engagements for a domain
const domainEngagements = await kv.getByPrefix('engagement:testcompany.com:');

for (const item of domainEngagements) {
  await kv.del(item.key);
}

// Verify cleanup
const remaining = await kv.getByPrefix('engagement:testcompany.com:');
console.log('Should be empty:', remaining);
```

✅ **Success Criteria**:
- All engagements for domain are deleted
- No engagements remain after cleanup
- No errors during bulk delete

---

## 🧪 Test 8: Timeout Scenario

### Simulate Long Processing (Mock)
Modify backend to add artificial delay:
```typescript
async function processEngagementSummary(domain: string, run_id: string) {
  // Add 65 second delay to trigger timeout
  await new Promise(resolve => setTimeout(resolve, 65000));
  // ... rest of processing
}
```

**Expected Frontend Behavior**:
- Polls for 60 seconds (30 attempts × 2 seconds)
- After 60 seconds, shows timeout error
- Error message: "Engagement summary timed out after 60 seconds. Please try again."

✅ **Success Criteria**:
- Frontend stops polling after 60 seconds
- User sees timeout error message
- Job continues in background (may complete later)
- No memory leaks from polling

---

## 📊 Test Results Template

| Test | Status | Notes |
|------|--------|-------|
| 1. Basic Flow - Happy Path | ⬜ | |
| 2. No Meetings Found | ⬜ | |
| 3. Error Handling | ⬜ | |
| 4. Frontend Integration | ⬜ | |
| 5. Concurrent Requests | ⬜ | |
| 6. KV Store Verification | ⬜ | |
| 7. Cleanup | ⬜ | |
| 8. Timeout Scenario | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## 🐛 Common Issues & Solutions

### Issue: "No record found"
**Cause**: Incorrect KV key format or domain mismatch  
**Solution**: Verify domain extraction logic, ensure no `https://` or `www`

### Issue: Status stuck on "processing"
**Cause**: Background job crashed or API keys missing  
**Solution**: Check edge function logs, verify API keys

### Issue: "Unauthorized" error
**Cause**: Invalid or expired access token  
**Solution**: Refresh authentication token, re-login

### Issue: Empty summary despite meetings
**Cause**: OpenAI response parsing failed  
**Solution**: Check OpenAI response format, review error logs

### Issue: Timeout on every request
**Cause**: Fathom API slow or unreachable  
**Solution**: Check Fathom API status, increase timeout duration

---

## 📝 Manual Testing Checklist

### Backend Tests
- [ ] POST /engagement-summary creates KV record
- [ ] GET /engagement-status returns correct format (array)
- [ ] Background processing updates KV on completion
- [ ] Background processing updates KV on error
- [ ] Zero meetings scenario completes gracefully
- [ ] Concurrent requests don't interfere
- [ ] KV cleanup works correctly

### Frontend Tests
- [ ] "Generate Meeting Summary" button works
- [ ] Loading state shows during polling
- [ ] Success message appears on completion
- [ ] Data populates meeting history field
- [ ] Goals and challenges auto-fill
- [ ] Error messages display correctly
- [ ] Timeout message after 60 seconds
- [ ] Can regenerate after error/timeout

### Edge Cases
- [ ] Invalid domain format (with http://, www)
- [ ] Domain with special characters
- [ ] Very long domain name
- [ ] Empty domain string
- [ ] Missing FATHOM_API_KEY
- [ ] Missing OPENAI_API_KEY
- [ ] Fathom API returns error
- [ ] OpenAI API returns error
- [ ] Network timeout during Fathom call
- [ ] Network timeout during OpenAI call

---

## 🎉 Success Criteria Summary

All tests pass when:
1. ✅ KV records are created with correct key pattern
2. ✅ Status transitions: processing → complete/error
3. ✅ Polling returns data in expected array format
4. ✅ Frontend receives and displays summary correctly
5. ✅ Errors are handled gracefully
6. ✅ Concurrent requests work independently
7. ✅ Cleanup removes old records successfully
8. ✅ No breaking changes to API contract

---

**Last Updated**: 2025-10-21  
**Feature**: Meeting History Aggregate (Engagement Summary)  
**Storage**: KV Store (`engagement:{domain}:{run_id}`)
