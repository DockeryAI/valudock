# Backend Endpoints - Complete Connection Guide

**Last Updated:** October 17, 2025  
**Status:** ✅ All endpoints implemented and connected

---

## 🎯 Overview

ValuDock uses Supabase Edge Functions to provide a secure, scalable backend API. All endpoints are implemented in `/supabase/functions/server/index.tsx` and follow a consistent pattern with proper authentication, error handling, and logging.

## 🔗 Base URL

```
https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514
```

All endpoints are prefixed with `/make-server-888f4514` for routing.

## 🔑 Authentication

Most endpoints require authentication via Bearer token:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

Use the `apiCall()` utility from `/utils/auth.ts` which handles authentication automatically:

```typescript
import { apiCall } from '../utils/auth';

const response = await apiCall('/endpoint-path', {
  method: 'POST',
  body: { /* your data */ }
});
```

## 📋 Environment Variables

The Edge Function requires the following secrets to be configured in Supabase:

| Secret | Purpose | Status |
|--------|---------|--------|
| `OPENAI_API_KEY` | AI content generation | ✅ Configured |
| `FATHOM_API_KEY` | Meeting transcript fetching | ✅ Configured |
| `GAMMA_API_KEY` | Presentation export | ✅ Configured |
| `SUPABASE_URL` | Database connection | ✅ Auto-configured |
| `SUPABASE_ANON_KEY` | Public API access | ✅ Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | ✅ Auto-configured |

### ⚠️ Important: Redeployment Required

After adding or updating secrets, the Edge Function **must be redeployed** to pick up environment variables:

```bash
# Via Supabase CLI
supabase functions deploy make-server-888f4514

# Or via Supabase Dashboard
# Navigate to Edge Functions → make-server-888f4514 → Deploy
```

---

## 🛠️ Core Endpoints

### Health Check

```http
GET /health
```

**Purpose:** Basic server health check  
**Auth Required:** No  
**Response:**
```json
{
  "status": "ok"
}
```

### Ping (with Environment Status)

```http
GET /ping
```

**Purpose:** Health check with environment variable status  
**Auth Required:** No  
**Response:**
```json
{
  "ok": true,
  "message": "ValuDock Edge Function is running",
  "timestamp": "2025-10-17T10:00:00.000Z",
  "environment": {
    "openai": "✓",
    "fathom": "✓",
    "gamma": "✓"
  }
}
```

---

## 🤖 AI Endpoints

### AI Generate

```http
POST /ai/generate
```

**Purpose:** Generate content with OpenAI  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "prompt": "Generate a brief test message",
  "maxTokens": 50
}
```

**Response:**
```json
{
  "ok": true,
  "generated_text": "...",
  "tokens_used": 42
}
```

**Error Response (Missing API Key):**
```json
{
  "ok": false,
  "error": "OPENAI_API_KEY not configured in Edge Function environment",
  "message": "Please configure the OPENAI_API_KEY secret and redeploy the Edge Function"
}
```

### AI Analyze Website

```http
POST /ai/analyze-website
```

**Purpose:** Analyze website with OpenAI  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "url": "https://example.com",
  "analysisType": "quick"
}
```

---

## 📞 Fathom Integration Endpoints

### Fathom Fetch

```http
POST /fathom-fetch
```

**Purpose:** Consolidates Fathom API calls for discovery phase  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "customer_url": "example.com",
  "start_date": "2025-01-01",
  "end_date": "2025-10-17",
  "tags": ["discovery"],
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "dry_run": false
}
```

**Dry Run Response:**
```json
{
  "ok": true,
  "dry_run": true,
  "message": "Fathom fetch endpoint is available",
  "config_status": {
    "fathom_api_key": "✓ Configured",
    "customer_url": "example.com",
    "date_range": "2025-01-01 to 2025-10-17"
  }
}
```

### Fathom Diagnostic

```http
GET /fathom-diagnostic
```

**Purpose:** Test Fathom API connectivity  
**Auth Required:** Yes  
**Response:**
```json
{
  "ok": true,
  "fathom_status": "Connected",
  "api_key_status": "✓ Configured"
}
```

### Fathom Proxy

```http
POST /fathom-proxy
```

**Purpose:** Proxy Fathom API calls (bypasses CORS)  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "endpoint": "/users/me",
  "method": "GET"
}
```

### Fathom Webhook Meetings by Domain

```http
GET /fathom-webhook/meetings/{domain}
```

**Purpose:** Get meetings filtered by attendee domain  
**Auth Required:** Yes  
**Example:** `/fathom-webhook/meetings/example.com`

---

## 🎯 Proposal Agent Endpoints

### Proposal Agent Run (Cloud)

```http
POST /proposal-agent-run
```

**Purpose:** Run proposal agent in cloud environment  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "deal_id": "deal-789",
  "customer_url": "example.com",
  "fathom_window": {
    "start": "2025-01-01",
    "end": "2025-10-17"
  },
  "_verification": false
}
```

**Verification Mode (for testing):**
```json
{
  "tenant_id": "test",
  "org_id": "test",
  "deal_id": "test",
  "customer_url": "test.com",
  "fathom_window": { "start": "2025-01-01", "end": "2025-10-17" },
  "_verification": true
}
```

**Verification Response:**
```json
{
  "status": "verified",
  "message": "Edge function is deployed and operational",
  "secretsStatus": "✓ OPENAI_API_KEY configured, ✓ FATHOM_API_KEY configured, ✓ GAMMA_API_KEY configured"
}
```

### Solution Composer

```http
POST /solution-composer
```

**Purpose:** Generate solution architecture and SOW  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "deal_id": "deal-789",
  "workflows": [],
  "roi_data": {},
  "dry_run": false
}
```

**Response:**
```json
{
  "ok": true,
  "solution": {
    "architecture": "...",
    "implementation_plan": "...",
    "sow": "..."
  }
}
```

---

## 🎨 Gamma Export Endpoints

### Gamma Export

```http
POST /gamma-export
```

**Purpose:** Create Gamma presentations/documents  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "deal_id": "deal-789",
  "title": "ROI Proposal",
  "content": "...",
  "type": "presentation",
  "dry_run": false
}
```

**Response:**
```json
{
  "ok": true,
  "gamma_url": "https://gamma.app/docs/mock-presentation-id",
  "doc_id": "mock-presentation-id",
  "title": "ROI Proposal"
}
```

### Export Gamma Doc

```http
POST /proposal-content/export-gamma-doc
```

**Purpose:** Export proposal content to Gamma document  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "deal_id": "deal-789",
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "markdown": "# Proposal\n\nContent..."
}
```

### Export Gamma Deck

```http
POST /proposal-content/export-gamma-deck
```

**Purpose:** Export proposal to Gamma presentation deck  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "deal_id": "deal-789",
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "outline": { "slides": [...] }
}
```

---

## 📊 Analytics Endpoints

### Telemetry Log

```http
POST /telemetry-log
```

**Purpose:** Log execution metrics for analytics  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "deal_id": "deal-789",
  "phase": "discovery",
  "duration_ms": 1250,
  "tokens": 450,
  "cost": 0.05,
  "metadata": {}
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Telemetry logged successfully"
}
```

### Predictive ROI Feed

```http
GET /predictive-roi-feed?days=14
```

**Purpose:** Analytics and predictions based on historical data  
**Auth Required:** Optional  
**Query Parameters:**
- `days`: Number of days to analyze (default: 14)
- `ping`: Set to `true` for health check
- `diag`: Set to `true` for diagnostics

**Response:**
```json
{
  "ok": true,
  "predictions": {
    "estimated_roi_growth": 15.2,
    "confidence": 0.87,
    "based_on_deals": 42,
    "trend": "increasing"
  },
  "historical_averages": {
    "avg_roi": 2.4,
    "avg_implementation_time": 90,
    "avg_cost_savings": 125000
  }
}
```

### Billing Feed

```http
GET /billing-feed?days=14&baseline_days=7&multiplier=1.5&dry_run=true
```

**Purpose:** Cost analytics and alerts  
**Auth Required:** Optional  
**Query Parameters:**
- `days`: Analysis window (default: 14)
- `baseline_days`: Baseline period (default: 7)
- `multiplier`: Alert threshold multiplier (default: 1.5)
- `ping`: Health check
- `dry_run`: Test mode

**Response:**
```json
{
  "ok": true,
  "summaries": {
    "tenant_123::org_456": {
      "days": 14,
      "total_cost": 245.67,
      "total_tokens": 1234567,
      "latest_day": "2025-10-17",
      "latest_cost": 18.45,
      "baseline_avg": 12.30
    }
  },
  "alerts": []
}
```

### Analytics Dashboard

```http
GET /analytics/dashboard
```

**Purpose:** Get comprehensive analytics dashboard data  
**Auth Required:** Yes (master_admin only)  
**Response:**
```json
{
  "success": true,
  "costPerDay": [...],
  "durationPerDay": [...],
  "costByPhase": [...],
  "tokensByPhase": [...],
  "successFailPie": [...],
  "recentRuns": [...]
}
```

---

## 🔄 Content Revision

### Revise Content

```http
POST /revise-content
```

**Purpose:** Revise content based on brand guidelines and tone  
**Auth Required:** No (dry-run mode), Yes (live mode)  
**Request Body:**
```json
{
  "text": "Original content to improve",
  "brand_guide": "DockeryAI: trustworthy, proactive, concise.",
  "tone": "executive, confident",
  "instructions": "Tighten language, keep ROI metric",
  "tenant_id": "tenant-123",
  "org_id": "org-456",
  "dry_run": false
}
```

**Dry Run Response:**
```json
{
  "ok": true,
  "dry_run": true,
  "preview": "[DRY RUN] Would revise: \"Original content to improve...\" with tone: executive, confident",
  "message": "Revise content endpoint is available"
}
```

**Live Response:**
```json
{
  "ok": true,
  "revised": {
    "revised_text": "Improved content...",
    "diff_summary": "Improved clarity and alignment with brand voice",
    "tone_feedback": "Matches executive, confident tone requirements"
  }
}
```

---

## 🧪 Testing Backend Connections

### Using the Backend Connection Verifier

1. **Navigate to Admin Dashboard**
   - Sign in as admin
   - Go to Admin tab
   - Click "API / Webhooks" sub-tab

2. **Run Connection Tests**
   - Click "Run Tests" button
   - View real-time test results
   - Check for warnings (environment variable issues)
   - Expand details for full response data

3. **Filter by Category**
   - Core: Basic health checks and auth
   - AI: OpenAI-powered endpoints
   - Fathom: Meeting analysis integrations
   - Gamma: Presentation export
   - Analytics: Metrics and reporting

### Manual Testing with cURL

```bash
# Health check
curl -s "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/ping" | jq

# Test with authentication
curl -s "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/auth/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq

# Dry-run revise content (no auth required)
curl -s -X POST "https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/make-server-888f4514/revise-content" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test content","brand_guide":"Brief guidelines","tone":"professional","dry_run":true}' | jq
```

---

## ⚠️ Common Issues & Solutions

### Issue: "OpenAI API key not configured"

**Cause:** OPENAI_API_KEY environment variable not set or Edge Function not redeployed

**Solution:**
1. Verify secret exists: `supabase secrets list`
2. If missing, set it: `supabase secrets set OPENAI_API_KEY=your-key-here`
3. **Redeploy the function:** `supabase functions deploy make-server-888f4514`

### Issue: "Unauthorized" errors

**Cause:** Invalid or expired access token

**Solution:**
1. Check session: `await getSession()`
2. If expired, sign in again
3. Use `apiCall()` utility which handles auth automatically

### Issue: CORS errors

**Cause:** Request origin not in allowlist

**Solution:**
1. Check Edge Function CORS configuration in `/supabase/functions/server/index.tsx`
2. Ensure your origin is in the allowlist (currently set to `*` for development)

### Issue: 500 errors with no details

**Cause:** Server-side error

**Solution:**
1. Check Supabase Dashboard → Edge Functions → Logs
2. Look for console.error messages
3. Verify all required environment variables are set

---

## 📝 Frontend Integration Examples

### Using apiCall utility (Recommended)

```typescript
import { apiCall } from '../utils/auth';

// Simple GET request
const profile = await apiCall('/auth/profile');

// POST with body
const result = await apiCall('/ai/generate', {
  method: 'POST',
  body: {
    prompt: 'Generate proposal summary',
    maxTokens: 200
  }
});

// Error handling
try {
  const data = await apiCall('/fathom-fetch', {
    method: 'POST',
    body: { customer_url: 'example.com', ... }
  });
  console.log('Success:', data);
} catch (error) {
  console.error('Failed:', error.message);
}
```

### Direct fetch (for special cases)

```typescript
import { projectId, publicAnonKey } from '../utils/supabase/info';

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ping`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
```

---

## 🚀 Quick Start Checklist

- [ ] Verify all environment variables are set
- [ ] Redeploy Edge Function after setting secrets
- [ ] Test with Backend Connection Verifier in Admin Dashboard
- [ ] Verify health check returns `ok: true`
- [ ] Test AI endpoints (should show API key configured)
- [ ] Test Fathom endpoints (should show API key configured)
- [ ] Test Gamma endpoints (should show API key configured)
- [ ] Review Edge Function logs for any errors
- [ ] Confirm all endpoints return expected responses

---

## 📚 Additional Resources

- **Edge Function Source:** `/supabase/functions/server/index.tsx`
- **Auth Utilities:** `/utils/auth.ts`
- **Backend Verifier Component:** `/components/BackendConnectionVerifier.tsx`
- **Proposal Agent Runner:** `/components/ProposalAgentRunner.tsx`
- **Fathom Integration:** `/components/FathomDiagnostic.tsx`

---

**Last Updated:** October 17, 2025  
**Maintained by:** ValuDock Development Team
