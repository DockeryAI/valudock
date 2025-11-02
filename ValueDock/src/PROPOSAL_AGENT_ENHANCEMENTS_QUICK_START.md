# Proposal Agent Enhancements - Quick Start Guide

## 🚀 What's New

Five powerful new features for testing and running the Proposal Agent:

1. ✅ **Updated Tool Names** - Now using underscores (e.g., `fathom_list_calls`)
2. 🏢 **Seed Demo Deal & Run** - Create tenant, org, deal, and run agent
3. 🧪 **Seed + Smoke Test** - Full integration test with version persistence
4. ☁️ **Run in Cloud** - Execute via Supabase Edge Function
5. 📝 **Fallback Summaries** - Graceful handling when AI returns no final message

---

## 📍 How to Access

1. Sign in as admin
2. Navigate to **Admin** tab
3. Click **Proposal Agent** in sidebar
4. Select **Agent Runner** tab

---

## ⚡ Quick Test (30 seconds)

### 1. Smoke Test
**Purpose:** Validate all tool integrations

```
Steps:
1. Enable "OpenAI REST" toggle (optional for detailed logs)
2. Click "Smoke Test" button
3. Watch console logs populate
4. Review "Assistant Text" output
```

**Expected Output:**
```
✨ Smoke Test Complete!
✅ All tools executed successfully
```

---

## 🏢 Create Demo Environment (1 minute)

### 2. Seed Demo Deal & Run
**Purpose:** Create real tenant, org, and deal with one click

```
Steps:
1. Click "Seed Demo Deal & Run" button
2. Wait for entities to be created (~10 seconds)
3. Click "Show Demo IDs" to reveal IDs
4. Click "Copy All IDs" to save for later use
```

**What You Get:**
- ✅ New Demo Reseller tenant
- ✅ New Demo Customer Org
- ✅ New "Pilot Automation Proposal" deal
- ✅ Full agent execution
- ✅ Copyable UUIDs

**Use the IDs for:**
- Manual testing
- Debugging specific entities
- Integration with other systems

---

## 🧪 Full Integration Test (2 minutes)

### 3. Seed + Smoke Test
**Purpose:** Complete end-to-end test with version persistence

```
Steps:
1. Click "Seed + Smoke Test" button
2. Monitor step-by-step progress in console
3. Wait for "✨ Seed + Smoke Test Complete!" message
4. Click "Show Final Output" to view results
5. Click "Open Version vN" to view saved proposal
```

**What Happens:**
1. Creates demo tenant, org, deal
2. Runs full agent workflow
3. Executes all tools in sequence
4. Persists proposal version to database
5. Returns version link

**When to Use:**
- Before production deployments
- After making agent changes
- For comprehensive validation
- When testing version persistence

---

## ☁️ Cloud Execution Test (1 minute)

### 4. Run in Cloud
**Purpose:** Execute via Supabase Edge Function (production-like)

```
Steps:
1. Fill in Deal ID and Customer URL
2. Enable "Run in Cloud" toggle
3. Click "Run in Cloud" button
4. Monitor status: Queued → Running → Completed
5. Review output and click "Open Version" link
```

**Status Indicators:**
- 🕐 **Queued** - Request sent to cloud
- ⏳ **Running** - Cloud function executing
- ✅ **Completed** - Success! Results available
- ❌ **Error** - Check logs for details

**Benefits:**
- Scalable execution
- Production environment testing
- Background processing
- No frontend timeouts

---

## 📝 Understanding Fallback Summaries

### What is a Fallback Summary?
When the AI agent completes but doesn't return a final assistant message, the backend automatically composes a summary from stored sections.

### How to Identify
Look for this indicator:
```
⚠️ Composed Summary (Fallback) - No final assistant message
```

### What's Included
The fallback summary contains:
- ✅ Challenges & Goals
- ✅ ROI Summary with metrics
- ✅ Solution Overview
- ✅ Statement of Work (SOW)

### This is Normal When:
- AI completes all tool calls successfully
- All sections are saved to database
- No final synthesis message is generated

### Action Required:
✅ **None** - The fallback is fully functional and can be used as-is
✅ Copy to clipboard and use in proposals
❌ **Don't** treat this as an error

---

## 🔧 Tool Name Updates

### Before (Old Format) ❌
```
fathom.list_calls
fathom.get_transcript
valuedock.get_financials
valuedock.put_summary
gamma.create_deck
```

### After (New Format) ✅
```
fathom_list_calls
fathom_get_transcript
valuedock_get_financials
valuedock_put_summary
valuedock_put_roi_summary
valuedock_put_solution
valuedock_put_sow
gamma_create_doc
gamma_create_deck
```

**Why the Change:**
- Consistency with backend implementation
- Better compatibility with OpenAI function calling
- Clearer separation from object notation

---

## 🎯 Recommended Testing Workflow

### For Daily Development
```
1. Smoke Test (30 sec) - Quick validation
2. Make changes
3. Smoke Test again - Verify changes
```

### For Feature Testing
```
1. Seed Demo Deal & Run (1 min) - Create environment
2. Use generated IDs for manual testing
3. Seed + Smoke Test (2 min) - Full validation
```

### Before Production Deploy
```
1. Smoke Test - Basic validation
2. Seed + Smoke Test - Full integration
3. Run in Cloud - Production pathway test
4. Review all outputs and version links
```

---

## 🐛 Troubleshooting

### "Seed Demo Deal & Run" Fails
**Problem:** Entity creation fails
**Solution:**
1. Check backend endpoints exist:
   - `POST /rest/v1/tenants`
   - `POST /rest/v1/orgs`
   - `POST /rest/v1/deals`
2. Verify database permissions
3. Check admin role has proper rights

### "Run in Cloud" Shows Error
**Problem:** Cloud execution fails
**Solution:**
1. Verify Supabase Edge Function is deployed
2. Check function name: `proposal-agent-run`
3. Verify SUPABASE_ANON_KEY in environment
4. Review Supabase dashboard logs

### Fallback Summary Always Shows
**Problem:** AI never returns final message
**Solution:**
1. Check OpenAI API key is valid
2. Verify agent prompts are correct
3. Review tool response format
4. Check OpenAI API quota/limits

### Console Logs Not Appearing
**Problem:** No step-by-step logs
**Solution:**
1. Check browser console for errors
2. Verify WebSocket connection (if used)
3. Ensure backend is returning proper responses
4. Try enabling "OpenAI REST" toggle for more details

---

## 💡 Pro Tips

### Tip 1: Use OpenAI REST Toggle
Enable this for detailed request/response logging when debugging AI issues.

### Tip 2: Copy IDs Immediately
After running "Seed Demo Deal & Run", immediately copy the IDs. You'll need them for manual testing.

### Tip 3: Compare Outputs
Run the same test with and without "Run in Cloud" to verify consistency.

### Tip 4: Save Fallback Summaries
Fallback summaries are fully functional - don't discard them. They can be edited and used in proposals.

### Tip 5: Use Version Links
Always click "Open Version vN" links to verify data was persisted correctly.

### Tip 6: Monitor Cloud Status
Don't refresh the page while cloud run is in progress - you'll lose status updates.

---

## 📚 Additional Resources

- **Full Implementation Guide:** `PROPOSAL_AGENT_ENHANCEMENTS_COMPLETE.md`
- **Visual Guide:** `PROPOSAL_AGENT_ENHANCEMENTS_VISUAL_GUIDE.md`
- **Backend Setup:** See server endpoint documentation
- **Supabase Edge Functions:** Supabase dashboard documentation

---

## ✅ Checklist for First Use

- [ ] Navigate to Admin → Proposal Agent
- [ ] Enable "OpenAI REST" toggle
- [ ] Run "Smoke Test" successfully
- [ ] Click "Seed Demo Deal & Run"
- [ ] Copy demo IDs to clipboard
- [ ] Run "Seed + Smoke Test"
- [ ] Click "Open Version" link
- [ ] Enable "Run in Cloud" toggle
- [ ] Run cloud execution successfully
- [ ] Review all outputs

---

## 🎉 Success Criteria

You'll know everything is working when:
- ✅ Smoke Test completes with no errors
- ✅ Seed Demo creates 3 entities (tenant, org, deal)
- ✅ IDs are copyable and valid UUIDs
- ✅ Seed + Smoke Test saves a version
- ✅ Version link opens proposal content
- ✅ Cloud run shows "Completed" status
- ✅ Fallback summaries display properly (if applicable)
- ✅ All tool names use underscores in logs

