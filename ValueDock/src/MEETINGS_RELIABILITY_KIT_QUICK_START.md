# Meetings Reliability Kit - Quick Start ⚡

**Get the Meetings Reliability Kit running in 5 minutes.**

---

## Step 1: Verify Files Are In Place ✅

Check that these files exist:

```bash
/meetings/
  ├── pipeline.ts          # ✅ Main orchestrator
  ├── window.ts            # ✅ Date window calculator
  ├── identity.ts          # ✅ Identity resolver
  ├── sources.ts           # ✅ API fetchers
  ├── merge.ts             # ✅ Safe merge logic
  └── demoGuard.ts         # ✅ Demo mode detector

/flags/
  └── demo.ts              # ✅ Demo config

/screens/MeetingsPanel/
  └── index.tsx            # ✅ UI component

/App.tsx                   # ✅ Already integrated
```

All files are already created. You're ready to go! 🎉

---

## Step 2: Configure Environment (Optional) 🔧

If you want to enable demo mode:

```bash
# Option 1: Force demo for ALL orgs
VITE_FORCE_DEMO=1

# Option 2: Demo for specific domains only
VITE_DEMO_DOMAINS=phoenixinsurance.com,demo.acme.com
```

**Default**: Demo mode is OFF for all orgs.

---

## Step 3: Test the Meetings Tab 🧪

1. **Log in** to ValuDock
2. **Select an organization** (if master_admin)
3. **Click the Meetings tab** (Users icon)
4. **Wait 1-2 seconds** for data to load

### What You Should See:

**If meetings exist:**
```
✅ 42 meetings · Fathom: 35, Summary: 7
   · Window 2025-04-24 → 2025-10-21 (America/Chicago)
```

**If no meetings:**
```
⚠️ No meetings
   Reason: no_emails_for_org
   [Suggestion appears with next steps]
```

---

## Step 4: Verify Console Logs 📊

Open browser DevTools → Console tab.

### Expected Logs (Happy Path):

```
[runMeetingsPipeline] 🚀 Starting pipeline for org: org_123
[runMeetingsPipeline] 📅 Window: { tz, fromISO: "2025-04-24", toISO: "2025-10-21" }
[resolveOrgIdentity] 🔍 Resolving identity for org: org_123
[resolveOrgIdentity] ✅ Identity resolved: { orgId, orgName, domain, emailCount: 15 }
[fetchFathomMeetings] 📞 Starting fetch: { orgId, emailCount: 15 }
[fetchFathomMeetings] 📄 Fetching page 1
[fetchFathomMeetings] ✅ Page 1 fetched: 35 items
[fetchFathomMeetings] ✅ No more pages
[fetchFathomMeetings] ✅ Total fetched: 35
[fetchSummaryMeetings] 📞 Starting fetch: { orgId }
[fetchSummaryMeetings] ✅ Fetched: 7 items
[safeMerge] ✅ Merged: { currentCount: 0, incomingCount: 35, mergedCount: 35 }
[safeMerge] ✅ Merged: { currentCount: 35, incomingCount: 7, mergedCount: 42 }
[runMeetingsPipeline] ✅ Complete: { phase: 'MERGED', count: 42, reason: 'ok' }
```

**Good to go!** ✅

---

## Troubleshooting 🔧

### Problem: "No meetings" with reason `no_emails_for_org`

**Solution:**
1. Go to **Admin** tab → **Users**
2. Add users to the organization
3. Make sure users have **email addresses** set
4. Return to **Meetings** tab → Click **Retry 180d**

---

### Problem: "No meetings" with reason `no_org_domain`

**Solution:**
1. Go to **Admin** tab → **Organizations**
2. Edit the organization
3. Set the **domain** field (e.g., `acme.com`)
4. Save
5. Return to **Meetings** tab → Click **Retry 180d**

---

### Problem: Console shows errors like "404 Not Found"

**Check:**
1. Are your backend endpoints working?
   ```
   GET /admin/organizations
   GET /admin/users
   GET /meetings/fathom
   GET /meetings/summary
   ```

2. Test manually:
   ```bash
   curl -H "Authorization: Bearer {token}" \
     https://{projectId}.supabase.co/functions/v1/make-server-888f4514/admin/users
   ```

3. If endpoints don't exist, check `/supabase/functions/server/index.tsx`

---

### Problem: Demo mode banner appears for non-demo orgs

**Check:**
1. Is `VITE_FORCE_DEMO=1` set? → Remove it
2. Is org domain in `VITE_DEMO_DOMAINS`? → Remove it from list
3. Restart dev server after changing env vars

---

### Problem: Meetings take >5 seconds to load

**Possible Causes:**
1. **Large date window** → Reduce from 180 to 90 days
   ```typescript
   // /meetings/window.ts
   export function computeWindow(tz = 'America/Chicago', days = 90) // Changed from 180
   ```

2. **Slow API responses** → Check network tab in DevTools
3. **Many pages to fetch** → Check console for pagination logs

---

### Problem: Zero meetings but should have data

**Debug Steps:**
1. Click **"Show diagnostics"** button in zero-state
2. Check `emailsSample` - are there emails?
3. Check `domain` - is it set?
4. Check `fromISO` / `toISO` - do meetings fall in this window?
5. Check console for API errors

**Example Diagnostic:**
```json
{
  "diagnostics": {
    "params": {
      "orgId": "org_123",
      "domain": null,  // ⚠️ Problem: No domain set
      "emailsSample": []  // ⚠️ Problem: No users
    }
  }
}
```

**Fix**: Add domain and users to organization.

---

## API Requirements 🔌

Your backend must implement these endpoints:

### 1. `/admin/organizations`
```json
{
  "organizations": [
    {
      "id": "org_123",
      "name": "Acme Corp",
      "domain": "acme.com"  // ⚠️ Required for meetings
    }
  ]
}
```

### 2. `/admin/users`
```json
{
  "users": [
    {
      "id": "user_1",
      "email": "alice@acme.com",  // ⚠️ Required for meetings
      "organizationId": "org_123"
    }
  ]
}
```

### 3. `/meetings/fathom`
```
GET /meetings/fathom?orgId=org_123&emails=["alice@acme.com"]&domainEmails=["*@acme.com"]&from=2025-04-24T05:00:00.000Z&to=2025-10-21T04:59:59.999Z&pageToken=xyz
```

**Response:**
```json
{
  "items": [
    {
      "id": "meeting_1",
      "title": "Weekly Sync",
      "start": "2025-10-15T14:00:00Z",
      "end": "2025-10-15T15:00:00Z",
      "attendees": ["alice@acme.com", "bob@acme.com"]
    }
  ],
  "nextPageToken": "token_abc" // Or null when done
}
```

### 4. `/meetings/summary`
```
GET /meetings/summary?orgId=org_123&from=2025-04-24T05:00:00.000Z&to=2025-10-21T04:59:59.999Z
```

**Response:**
```json
{
  "items": [
    {
      "id": "summary_1",
      "title": "Q4 Planning",
      "start": "2025-10-14T10:00:00Z"
    }
  ]
}
```

---

## Key Features at a Glance 🎯

| Feature | What It Does | Why It Matters |
|---------|-------------|----------------|
| **Demo Mode** | Detects phoenixinsurance.com and other demo domains | Shows banner to avoid confusion |
| **Identity Resolver** | Converts orgId → emails + domain | Required for API queries |
| **Pagination Loop** | Fetches ALL pages until exhausted | Never misses meetings |
| **Sticky Merge** | Blocks empty arrays from overwriting data | **Prevents silent data loss** |
| **Zero-State Diagnostics** | Shows WHY meetings are zero | Actionable troubleshooting |

---

## Manual Testing Checklist ✅

Run through this checklist to verify everything works:

- [ ] Meetings load for org with users + domain
- [ ] Demo banner appears for `phoenixinsurance.com`
- [ ] Zero-state shows for org with no users
- [ ] Zero-state shows for org with no domain
- [ ] Console logs are clean (no errors)
- [ ] Pagination fetches multiple pages (if >25 meetings)
- [ ] Retry button re-runs pipeline
- [ ] Show diagnostics button displays JSON
- [ ] Switching orgs loads new meetings
- [ ] Mobile view works correctly

---

## What's Next? 🚀

Now that the Meetings Reliability Kit is working, you can:

1. **Customize the UI** → Edit `/screens/MeetingsPanel/index.tsx`
2. **Add filtering** → Filter by date range, attendees, etc.
3. **Enable search** → Search meeting titles
4. **Add actions** → Click to view transcript, export to PDF, etc.
5. **Integrate with other features** → Link meetings to processes, proposals, etc.

---

## Support 💬

If you encounter issues:

1. **Check console logs** → Most issues show clear error messages
2. **Review diagnostics** → Click "Show diagnostics" in zero-state
3. **Check this guide** → Troubleshooting section above
4. **Read full docs** → `/MEETINGS_RELIABILITY_KIT_COMPLETE.md`

---

## Quick Reference Commands

```bash
# Run dev server
npm run dev

# Check environment variables
echo $VITE_DEMO_DOMAINS
echo $VITE_FORCE_DEMO

# Test API manually
curl -H "Authorization: Bearer {token}" \
  https://{projectId}.supabase.co/functions/v1/make-server-888f4514/admin/users

# View logs in production
# (Check Supabase Edge Functions logs)
```

---

**Status**: ✅ Production-Ready  
**Time to Launch**: ~5 minutes  
**Last Updated**: October 21, 2025

---

## Success Indicators 🎉

You know it's working when:

✅ Meetings tab appears with Users icon  
✅ Data loads in 1-2 seconds  
✅ Console shows "✅ Complete: { phase: 'MERGED', count: X }"  
✅ Zero-states have helpful suggestions  
✅ Demo banner appears ONLY for demo domains  
✅ Retry button works  
✅ No errors in console  

**You're all set!** 🚀
