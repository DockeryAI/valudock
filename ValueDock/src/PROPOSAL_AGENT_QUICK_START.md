# Proposal Agent - Quick Start Guide

## 🚀 How to Use the Proposal Agent

### **Step 1: Navigate to Admin Panel**
1. Click **Menu** (hamburger icon) in top-right
2. Select **Admin**
3. Click **Agent** tab

---

### **Step 2: Configure the Agent**

#### **Required Fields:**

**Deal ID**
```
Example: DEAL-2025-001
Purpose: Unique identifier for this opportunity
```

**Customer Website URL**
```
Example: https://acmecorp.com
Purpose: Website to analyze for business context
⚠️ Must include http:// or https://
```

**Fathom Date Window**
```
Options: 7, 14, 30, 60, 90, 180, 365 days
Default: 30 days
Purpose: How far back to search for meeting transcripts
```

**Target Organization** *(Tenant/Master Admins Only)*
```
Select which organization this proposal is for
Org admins: Auto-assigned to your organization
```

---

### **Step 3: Run the Agent**

Click **"Run Proposal Agent"** button

Watch the status log for real-time progress:
```
🌐 Website        [Running]  Fetching website...
🎤 Fathom         [Pending]  Waiting...
📄 ValueDock      [Pending]  Waiting...
🎨 Gamma          [Pending]  Waiting...
```

---

### **Step 4: View Results**

When complete, you'll see:
```
✅ Generation Complete!

Gamma Presentation: https://gamma.app/docs/...
                    [Open] ← Click to view

ValueDock Data ID: abc-123-def
```

Click **Open** to view the generated presentation in a new tab.

---

## 🎯 What the Agent Does

### **1. Website Analysis** 🌐
- Fetches customer website content
- Extracts business description
- Identifies industry and products
- Finds pain points and opportunities

### **2. Fathom Transcript Retrieval** 🎤
- Searches Fathom for recent meetings
- Filters by customer domain
- Summarizes challenges and goals
- Extracts key discussion points

### **3. ValueDock Data Generation** 📄
- Creates process definitions
- Calculates ROI projections
- Generates implementation timeline
- Populates cost savings data

### **4. Gamma Presentation** 🎨
- Creates presentation slides
- Includes website insights
- Shows meeting summaries
- Displays ROI calculations
- Returns shareable link

---

## 🔐 Permission Levels

### **Org Admin**
- ✅ Can run for their organization
- ❌ Cannot select other organizations
- 🎯 Auto-assigned to their org

### **Tenant Admin**
- ✅ Can run for any org in their tenant
- ✅ Must select target organization
- 🎯 Sees dropdown with tenant orgs

### **Master Admin**
- ✅ Can run for any organization
- ✅ Must select target organization
- 🎯 Sees dropdown with all orgs

---

## 💡 Pro Tips

### **Date Window Selection:**
```
7 days   → Very recent deals only
30 days  → Standard for active opportunities
90 days  → Longer sales cycles
365 days → Enterprise deals with long timelines
```

### **URL Requirements:**
```
✅ https://company.com
✅ http://www.company.com
❌ company.com          (missing protocol)
❌ www.company.com      (missing protocol)
```

### **Deal ID Best Practices:**
```
✅ DEAL-2025-001       (Clear, dated)
✅ ACME-Q1-2025        (Client-dated)
✅ OPP-ABC-123         (System ID)
❌ deal                (Too vague)
❌ test                (Non-descriptive)
```

---

## 🐛 Troubleshooting

### **"Please enter a valid URL"**
- Make sure URL includes `http://` or `https://`
- Check for typos in domain name

### **"Please select a target organization"**
- Tenant/Master admins must choose an org
- Use the dropdown to select

### **Agent runs but no results**
- Check status log for error messages
- Click "View details" on error entries
- Contact admin if persistent issues

### **Status log shows errors**
- **Website Error:** Check if URL is accessible
- **Fathom Error:** Verify Fathom API key is configured
- **ValueDock Error:** Check organization data setup
- **Gamma Error:** Verify Gamma API key is configured

---

## 📋 Example Workflow

### **Scenario:** New Enterprise Deal

```
1. Deal ID: ENT-2025-ACME
2. Customer URL: https://acmecorp.com
3. Fathom Window: 60 days (2 months of meetings)
4. Organization: Acme Corporation
5. Click "Run Proposal Agent"

Status Log Progress:
→ Website: Analyzing acmecorp.com...
→ Fathom: Found 5 meeting transcripts
→ ValueDock: Generated 8 processes
→ Gamma: Created 12-slide presentation

Result:
✅ Gamma Link: https://gamma.app/docs/acme-proposal-xyz
✅ Data ID: acme-2025-001
```

---

## ⚡ Quick Reference

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| Deal ID | ✅ | DEAL-2025-001 | Any unique string |
| Customer URL | ✅ | https://company.com | Include protocol |
| Fathom Window | ✅ | 30 days | Dropdown selection |
| Target Org | ⚠️ | Acme Corp | Only for tenant/master admins |

**Agent Execution Time:** ~30-60 seconds  
**Output:** Gamma presentation link + ValueDock data ID  
**Saved Data:** Yes, to selected organization  

---

## 🎯 Status Icons Guide

| Icon | Status | Meaning |
|------|--------|---------|
| ⏰ | Pending | Step not started yet |
| 🔄 | Running | Step currently executing |
| ✅ | Success | Step completed successfully |
| ❌ | Error | Step failed (check details) |

---

## 🔗 Related Features

### **API / Webhooks Tab**
Configure API keys for:
- OpenAI (proposal content)
- Fathom (meeting transcripts)
- Gamma (presentation generation)
- Supabase (data storage)

### **Organizations**
View/manage organizations where proposals will be created

### **Documents**
Access generated proposals and presentation materials

---

**Need Help?** Contact your system administrator or check the API / Webhooks tab to ensure all integrations are properly configured.
