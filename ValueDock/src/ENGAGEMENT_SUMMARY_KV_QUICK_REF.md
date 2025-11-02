# Engagement Summary KV Store - Quick Reference

## 🎯 What Changed
Migrated from database table to KV store to comply with system guidelines.

## 🔑 KV Key Structure
```
engagement:{domain}:{run_id}
```

**Example**: `engagement:acmecorp.com:550e8400-e29b-41d4-a716-446655440000`

## 📊 Record Structure
```typescript
{
  domain: "example.com",
  run_id: "uuid-here",
  status: "processing" | "complete" | "error",
  summary: { ... } | null,    // AI analysis when complete
  error: "error message" | null,
  created_at: "2025-10-21T10:00:00.000Z",
  updated_at: "2025-10-21T10:00:45.000Z"
}
```

## 🚀 API Endpoints

### Start Engagement Summary
```bash
POST /make-server-888f4514/engagement-summary
Content-Type: application/json
Authorization: Bearer {token}

{
  "domain": "example.com"
}

Response:
{
  "ok": true,
  "domain": "example.com",
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

### Check Status (Poll)
```bash
GET /make-server-888f4514/engagement-status?domain=example.com&run_id={run_id}
Authorization: Bearer {token}

Response (array format):
[
  {
    "domain": "example.com",
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "complete",
    "summary": {
      "meetings_count": 5,
      "people": [...],
      "goals": [...],
      "challenges": [...]
    }
  }
]
```

## ⏱️ Polling Pattern
- Poll every **2 seconds**
- Max **30 attempts** (60 seconds total)
- Stop on `status === 'complete'` or `status === 'error'`

## 🔄 Process Flow

```
1. Frontend extracts domain from companyWebsite
   ↓
2. POST /engagement-summary → Get run_id
   ↓
3. Backend stores { status: 'processing' } in KV
   ↓
4. Backend fetches Fathom meetings (async)
   ↓
5. Backend filters by domain, sends to OpenAI
   ↓
6. Frontend polls GET /engagement-status every 2s
   ↓
7. Backend updates KV with { status: 'complete', summary: {...} }
   ↓
8. Frontend receives complete status, displays data
```

## 🛠️ Backend Implementation

### Store Initial Status
```typescript
const kvKey = `engagement:${domain}:${run_id}`;
await kv.set(kvKey, {
  domain,
  run_id,
  status: 'processing',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  summary: null,
  error: null
});
```

### Update on Completion
```typescript
await kv.set(kvKey, {
  domain,
  run_id,
  status: 'complete',
  summary: aiGeneratedSummary,
  created_at: ...,
  updated_at: new Date().toISOString(),
  error: null
});
```

### Update on Error
```typescript
await kv.set(kvKey, {
  domain,
  run_id,
  status: 'error',
  error: error.message,
  summary: null,
  created_at: ...,
  updated_at: new Date().toISOString()
});
```

## 📱 Frontend Usage

### Trigger Aggregation
```typescript
const domain = extractDomain(companyWebsite);

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-summary`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain })
  }
);

const { run_id } = await response.json();
```

### Poll for Status
```typescript
const statusResponse = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-status?` +
  `domain=${encodeURIComponent(domain)}&run_id=${encodeURIComponent(run_id)}`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
);

const statusData = await statusResponse.json();
const record = Array.isArray(statusData) ? statusData[0] : null;

if (record?.status === 'complete') {
  // Success! Use record.summary
}
```

## 🧹 Cleanup

### Delete Specific Engagement
```typescript
await kv.del('engagement:example.com:run-id-123');
```

### Delete All for Domain
```typescript
const allForDomain = await kv.getByPrefix('engagement:example.com:');
for (const item of allForDomain) {
  await kv.del(item.key);
}
```

### Delete Old Engagements (7+ days)
```typescript
const all = await kv.getByPrefix('engagement:');
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

for (const item of all) {
  if (new Date(item.value.created_at).getTime() < sevenDaysAgo) {
    await kv.del(item.key);
  }
}
```

## 🐛 Debugging

### View All Engagements
```typescript
const engagements = await kv.getByPrefix('engagement:');
console.log('All engagements:', engagements);
```

### View Specific Engagement
```typescript
const record = await kv.get('engagement:example.com:uuid-123');
console.log('Status:', record.status);
console.log('Summary:', record.summary);
```

### Common Issues

**❌ "No record found"**
- Check domain format (no https://, no www)
- Verify run_id matches initial POST response
- Ensure KV key was created: `engagement:{domain}:{run_id}`

**❌ "Timeout after 60 seconds"**
- Check Fathom API connectivity
- Check OpenAI API key
- Review backend logs for processing errors

**❌ "Status stuck on 'processing'"**
- Backend processing may have crashed
- Check edge function logs
- Verify async error handling is working

## ✅ Testing Checklist

### Happy Path
1. ✅ Enter company website in Presentation screen
2. ✅ Click "Generate Meeting Summary"
3. ✅ See "Aggregating..." loading state
4. ✅ Wait for completion (should be < 60s)
5. ✅ See meeting summary populated
6. ✅ See goals and challenges extracted

### Error Cases
1. ✅ No Fathom API key → See error message
2. ✅ No OpenAI API key → See error message
3. ✅ Invalid domain → See validation error
4. ✅ Zero meetings found → See "0 meetings" message
5. ✅ Network timeout → See timeout message

## 📝 Files Modified
- `/supabase/functions/server/index.tsx` (lines ~7550-7830)

## 📚 Related Docs
- [ENGAGEMENT_SUMMARY_KV_MIGRATION.md](/ENGAGEMENT_SUMMARY_KV_MIGRATION.md) - Full migration details
- [MEETING_HISTORY_AGGREGATE_IMPLEMENTATION.md](/MEETING_HISTORY_AGGREGATE_IMPLEMENTATION.md) - Original feature docs

---

**Last Updated**: 2025-10-21  
**Status**: ✅ Production Ready  
**Breaking Changes**: None (API contract unchanged)
