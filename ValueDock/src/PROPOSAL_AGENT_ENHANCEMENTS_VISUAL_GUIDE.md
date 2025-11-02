# Proposal Agent Enhancements - Visual Guide

## 📍 Location
**Admin Panel → Proposal Agent → Agent Runner Tab**

---

## 🎛️ New Controls Panel

### OpenAI REST Toggle
```
┌─────────────────────────────────────────────────┐
│ ⚙️  Use OpenAI REST (no SDK)          [Toggle]  │
│    Direct HTTP calls with logging               │
└─────────────────────────────────────────────────┘
```

### Test Buttons (Row 1)
```
┌──────────────────────┬──────────────────────┐
│  🧪 Test Run        │  🧪 Smoke Test      │
└──────────────────────┴──────────────────────┘
```

### Seed Demo Buttons (Row 2) - NEW! ✨
```
┌──────────────────────────┬────────────────────────────┐
│  🏢 Seed Demo Deal & Run│  🧪 Seed + Smoke Test     │
└──────────────────────────┴────────────────────────────┘
```

### Run in Cloud Toggle - NEW! ✨
```
┌─────────────────────────────────────────────────┐
│ ☁️  Run in Cloud                      [Toggle]  │
│    Execute via Supabase Edge Function           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Status: Queued → Running → Completed            │
│ [Open Version →]                                │
└─────────────────────────────────────────────────┘
```

### Action Buttons
```
┌──────────────────────┬──────────────────────┐
│  ▶️ Run Agent       │  💾 Run & Save Ver. │
│  (or Run in Cloud)  │                      │
└──────────────────────┴──────────────────────┘
```

---

## 📋 Seed Demo Deal & Run Console

### Step Log
```
🌱 Starting Seed Demo Deal & Run...
🏢 Creating Demo Reseller tenant...
✅ Tenant created: 550e8400-e29b-41d4-a716-446655440000
🏛️ Creating Demo Customer Org...
✅ Organization created: 660e8400-e29b-41d4-a716-446655440001
📋 Creating "Pilot Automation Proposal" deal...
✅ Deal created: 770e8400-e29b-41d4-a716-446655440002
🤖 Starting Proposal Agent runner...
🌐 fetch_url → Analyzing customer website...
✅ Website fetched
🎤 fathom_list_calls → Searching transcripts...
✅ Transcripts retrieved
💰 valuedock_put_summary → Saving to database...
✅ Data saved
🎨 gamma_create_deck → Generating presentation...
✅ Presentation created
✨ Seed Demo Deal & Run Complete!
```

### Copyable IDs Panel
```
┌─ Show Demo IDs ────────────────────────────────┐
│                                                 │
│  Tenant ID                                     │
│  ┌──────────────────────────────────────────┐ │
│  │ 550e8400-e29b-41d4-a716-446655440000    │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Organization ID                               │
│  ┌──────────────────────────────────────────┐ │
│  │ 660e8400-e29b-41d4-a716-446655440001    │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Deal ID                                       │
│  ┌──────────────────────────────────────────┐ │
│  │ 770e8400-e29b-41d4-a716-446655440002    │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [📋 Copy All IDs]                            │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Seed + Smoke Test Console

### Step Log
```
🧪 Starting Seed + Smoke Test...
🏢 Creating demo tenant...
✅ Tenant: 880e8400-e29b-41d4-a716-446655440003
🏛️ Creating demo org...
✅ Org: 990e8400-e29b-41d4-a716-446655440004
📋 Creating demo deal...
✅ Deal: aa0e8400-e29b-41d4-a716-446655440005
🤖 Invoking agent runner...
🌐 fetch_url → Analyzing customer site...
✅ fetch_url complete
🎤 fathom_list_calls → Fetching meetings...
✅ fathom_list_calls complete
💰 valuedock_get_financials → Retrieving ROI data...
✅ valuedock_get_financials complete
💾 valuedock_put_summary → Saving sections...
✅ valuedock_put_summary complete
🎨 gamma_create_deck → Creating presentation...
✅ gamma_create_deck complete
📄 Version saved: /proposals/v3
✨ Seed + Smoke Test Complete!
```

### Final Output Panel
```
┌─ Show Final Output ────────────────────────────┐
│                                                 │
│  [Proposal content displays here]              │
│  • Challenges & Goals                          │
│  • ROI Summary with financial metrics          │
│  • Solution Overview                           │
│  • Statement of Work                           │
│                                                 │
│  [📋 Copy to Clipboard]  [Open Version v3 →]  │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Fallback Summary Display

### When No Final Assistant Message
```
┌─ Show Composed Summary (Fallback) ─────────────┐
│                                                 │
│  ⚠️ Composed Summary (Fallback)                │
│     No final assistant message                 │
│                                                 │
│  [Composed summary from stored sections]       │
│                                                 │
│  Challenges & Goals:                           │
│  • Manual invoice processing delays...         │
│                                                 │
│  ROI Summary:                                  │
│  • 3-Year NPV: $450K                          │
│  • ROI: 180%                                   │
│                                                 │
│  Solution:                                     │
│  • Automated workflow for AP...               │
│                                                 │
│  SOW:                                          │
│  • Phase 1: Discovery & Design...             │
│                                                 │
│  [📋 Copy to Clipboard]                       │
└─────────────────────────────────────────────────┘
```

---

## ☁️ Cloud Run Status Indicators

### Status: Queued
```
┌─────────────────────────────────────────────────┐
│  🕐 Queued                                      │
└─────────────────────────────────────────────────┘
```

### Status: Running
```
┌─────────────────────────────────────────────────┐
│  ⏳ Running                                     │
└─────────────────────────────────────────────────┘
```

### Status: Completed
```
┌─────────────────────────────────────────────────┐
│  ✅ Completed                                   │
│  [Open Version →]                              │
└─────────────────────────────────────────────────┘
```

### Status: Error
```
┌─────────────────────────────────────────────────┐
│  ❌ Error                                       │
│  Failed to connect to cloud function          │
└─────────────────────────────────────────────────┘
```

### Cloud Run Output Panel
```
┌─ Cloud Run Output ─────────────────────────────┐
│                                                 │
│  [Final proposal output from cloud execution]  │
│                                                 │
│  [📋 Copy to Clipboard]  [Open Version v2 →]  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Updated Tool Names in Logs

### OLD Format (Deprecated) ❌
```
🎤 fathom.get_meetings → Searching...
💾 valuedock.put_proposal → Saving...
🎨 gamma.create_deck → Generating...
```

### NEW Format (Current) ✅
```
🎤 fathom_list_calls → Searching...
🎤 fathom_get_transcript → Extracting...
💰 valuedock_get_financials → Fetching...
💾 valuedock_put_summary → Saving challenges/goals...
📊 valuedock_put_roi_summary → Saving ROI...
🔧 valuedock_put_solution → Saving solution...
📋 valuedock_put_sow → Saving SOW...
🎨 gamma_create_doc → Generating doc...
🎨 gamma_create_deck → Generating deck...
```

---

## 🎯 Feature Comparison

| Feature | Test Run | Smoke Test | Seed Demo | Seed + Smoke | Cloud Run |
|---------|----------|------------|-----------|--------------|-----------|
| Creates Entities | ❌ | ❌ | ✅ | ✅ | ❌ |
| Runs Agent | ✅ | ✅ | ✅ | ✅ | ✅ |
| Saves Version | ❌ | ❌ | ❌ | ✅ | ✅ |
| Shows IDs | ❌ | ❌ | ✅ | ✅ | ❌ |
| Fallback Support | ✅ | ✅ | ❌ | ✅ | ✅ |
| Execution Mode | Frontend | Frontend | Frontend | Frontend | Cloud |
| Version Link | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 💡 Usage Tips

### Quick Validation
Use **Test Run** or **Smoke Test** for rapid API validation without creating entities.

### Demo Setup
Use **Seed Demo Deal & Run** when you need:
- A complete demo environment
- Real entity IDs for testing
- End-to-end workflow validation

### Full Integration Test
Use **Seed + Smoke Test** when you need:
- Complete test from creation to version persistence
- Verification of all tool integrations
- A saved proposal version to review

### Production Testing
Use **Run in Cloud** when you need:
- Scalable execution
- Background processing
- Production-like environment testing

---

## 🐛 Debugging Guide

### If Seed Demo Fails
1. Check console logs for specific error
2. Verify backend endpoints exist:
   - `/rest/v1/tenants`
   - `/rest/v1/orgs`
   - `/rest/v1/deals`
3. Check database permissions

### If Cloud Run Fails
1. Verify Supabase Edge Function is deployed
2. Check function URL format
3. Verify SUPABASE_ANON_KEY is set
4. Review Edge Function logs in Supabase dashboard

### If Fallback Summary Shows
This is **normal behavior** when:
- AI doesn't return a final message
- Backend composes summary from stored sections
- All section data is available

To fix:
- Check OpenAI API key
- Verify prompt configuration
- Review agent tool responses

---

## ✨ Best Practices

1. **Always start with Test Run** to validate basic connectivity
2. **Use Smoke Test** to verify all tool integrations
3. **Use Seed + Smoke Test** for comprehensive validation
4. **Enable OpenAI REST toggle** for detailed debugging
5. **Copy IDs** from Seed Demo for manual testing
6. **Review fallback summaries** to ensure data quality
7. **Test cloud execution** before relying on it in production

