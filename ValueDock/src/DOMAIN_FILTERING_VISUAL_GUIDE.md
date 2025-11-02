# 🎨 Domain Filtering - Visual Guide

> **Quick Visual Reference: How Meeting Filtering Works**

---

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│  YOU ENTER: acme.com                                        │
│                                                             │
│  YOU GET:   Only meetings with @acme.com attendees          │
│                                                             │
│  YOU DON'T GET: Meetings from techco.com, vendor.com, etc. │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Example: Your Meeting List

### All Meetings in Fathom
```
📅 Meeting 1: "ACME Discovery Call"
   👤 john@acme.com         ← Target company
   👤 sales@yourcompany.com ← Your team

📅 Meeting 2: "TechCo Product Demo"  
   👤 bob@techco.com        ← Different company
   👤 demo@yourcompany.com  ← Your team

📅 Meeting 3: "ACME + TechCo Partnership"
   👤 john@acme.com         ← Target company  
   👤 bob@techco.com        ← Different company
   👤 lead@yourcompany.com  ← Your team

📅 Meeting 4: "VendorCo Integration"
   👤 cto@vendor.com        ← Different company
   👤 eng@yourcompany.com   ← Your team

📅 Meeting 5: "ACME Implementation Planning"
   👤 jane@acme.com         ← Target company
   👤 john@acme.com         ← Target company  
   👤 pm@yourcompany.com    ← Your team
```

---

## 🔍 When You Enter `acme.com`

### Meetings Included ✅
```
📅 Meeting 1: "ACME Discovery Call"
   ✓ john@acme.com         ← Included in attendee list
   ✗ sales@yourcompany.com ← Excluded from attendee list

📅 Meeting 3: "ACME + TechCo Partnership"
   ✓ john@acme.com         ← Included in attendee list
   ✗ bob@techco.com        ← Excluded from attendee list
   ✗ lead@yourcompany.com  ← Excluded from attendee list

📅 Meeting 5: "ACME Implementation Planning"
   ✓ jane@acme.com         ← Included in attendee list
   ✓ john@acme.com         ← Included in attendee list
   ✗ pm@yourcompany.com    ← Excluded from attendee list
```

### Meetings Excluded ❌
```
📅 Meeting 2: "TechCo Product Demo"
   ✗ FILTERED OUT - No @acme.com attendees

📅 Meeting 4: "VendorCo Integration"  
   ✗ FILTERED OUT - No @acme.com attendees
```

---

## 👥 Attendee List Generation

### What You See
```
Meeting History for acme.com

We conducted 3 meetings with:
• John (from john@acme.com)
• Jane (from jane@acme.com)

Meetings:
1. ACME Discovery Call
2. ACME + TechCo Partnership  
3. ACME Implementation Planning
```

### What You DON'T See
```
❌ bob@techco.com (different company)
❌ cto@vendor.com (different company)
❌ sales@yourcompany.com (your team, not customer)
❌ demo@yourcompany.com (your team, not customer)
❌ lead@yourcompany.com (your team, not customer)
❌ eng@yourcompany.com (your team, not customer)
❌ pm@yourcompany.com (your team, not customer)
```

---

## 🎯 AI Extraction Results

### Meeting History
```
✅ CORRECT:
"We conducted 3 meetings with John and Jane from ACME Corp to 
discuss their discovery needs, partnership opportunities with TechCo, 
and implementation planning."

❌ WRONG (but prevented):
"We met with John from ACME, Bob from TechCo, and CTO from VendorCo..."
```

### Challenges Extracted
```
✅ CORRECT (from ACME meetings only):
1. "ACME struggles with manual data entry processes"
2. "ACME's current system lacks real-time reporting"  
3. "ACME needs better integration with TechCo partners"

❌ WRONG (but prevented):
1. "TechCo needs product customization features..."
2. "VendorCo requires API documentation improvements..."
```

### Goals Extracted
```
✅ CORRECT (from ACME meetings only):
1. "Reduce ACME's data entry time by 50%"
2. "Implement real-time dashboards for ACME executives"
3. "Seamless integration between ACME and TechCo systems"

❌ WRONG (but prevented):  
1. "Launch TechCo's new product line..."
2. "Complete VendorCo integration by Q4..."
```

---

## 🔄 Step-by-Step Flow

### Step 1: User Action
```
┌────────────────────────┐
│ Company Website:       │
│ acme.com          [GO] │
└────────────────────────┘
```

### Step 2: System Fetches
```
Backend:
  ↓ Get meetings from fathom:domain:acme.com
  ↓ Load full meeting details  
  ↓ Verify each has @acme.com attendees
  ↓ Return only verified meetings

Frontend:
  ↓ Receive meetings from backend
  ↓ Triple-check for @acme.com attendees
  ↓ Filter out any without match
  ↓ Pass to AI processing
```

### Step 3: AI Processes
```
AI Functions:
  ↓ Loop through filtered meetings
  ↓ Extract only @acme.com attendees
  ↓ Skip meetings with zero customer attendees
  ↓ Generate company-specific insights
  ↓ Return results
```

### Step 4: Display Results
```
┌─────────────────────────────────────┐
│ Meeting History (Generated)         │
│                                     │
│ We conducted 3 meetings with        │
│ John and Jane from ACME Corp...     │
│                                     │
│ Challenges:                         │
│ • ACME-specific challenge 1         │
│ • ACME-specific challenge 2         │
│                                     │
│ Goals:                              │
│ • ACME-specific goal 1              │
│ • ACME-specific goal 2              │
└─────────────────────────────────────┘
```

---

## 🎨 UI Indicators

### In Company Website Field
```
┌──────────────────────────────────────┐
│ Company Website                      │
│ ┌──────────────────────────────────┐ │
│ │ acme.com                         │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### In Fathom Webhook Setup
```
┌────────────────────────────────────────────┐
│ 🎣 Fathom Webhook Setup                    │
│                                            │
│ 📌 Filtering meetings for: acme.com        │
│                                            │
│ [Setup Instructions] [Webhook Status]      │
└────────────────────────────────────────────┘
```

### In Webhook Status Tab
```
┌────────────────────────────────────────────────┐
│ ℹ️ Domain Filtering Active                     │
│                                                │
│ Only showing meetings where attendees have    │
│ @acme.com email addresses. Meetings with      │
│ other companies are automatically excluded.   │
└────────────────────────────────────────────────┘
```

### In Console
```
[FATHOM-WEBHOOK] Fetching meetings for domain: acme.com
[FATHOM-WEBHOOK] Found 5 meetings, 3 match domain acme.com
[FATHOM-WEBHOOK] Filtered out meeting 2 - no attendees from acme.com
[FATHOM-WEBHOOK] Filtered out meeting 4 - no attendees from acme.com
[FATHOM-WEBHOOK] Processing 3 meetings from acme.com
```

---

## ✅ Quick Verification

### How to Confirm It's Working

**1. Check the Domain Indicator**
```
Look for: 📌 Filtering meetings for: [your-domain]
```

**2. Review Webhook Status**
```
See blue alert: "Domain Filtering Active"
```

**3. Inspect Meeting Cards**
```
Each meeting should have at least one attendee
with @[your-domain] email address
```

**4. Test AI Generation**
```
Generated attendee list should only include
people from your target company domain
```

**5. Check Browser Console**
```
See filtering logs with meeting counts
```

---

## 🎯 Common Scenarios

### Scenario A: Pure Customer Meeting
```
Meeting: "ACME Kickoff"
  john@acme.com
  jane@acme.com

Result when filtering for acme.com:
  ✅ Meeting included
  ✅ Both attendees shown
  ✅ Used for AI processing
```

### Scenario B: Customer + Your Team
```
Meeting: "ACME Discovery"  
  john@acme.com
  sales@yourcompany.com

Result when filtering for acme.com:
  ✅ Meeting included
  ✅ Only john shown as attendee
  ✗ sales excluded from attendee list
  ✅ Used for AI processing
```

### Scenario C: Customer + Other Customer
```
Meeting: "ACME + TechCo"
  john@acme.com
  bob@techco.com

Result when filtering for acme.com:
  ✅ Meeting included
  ✅ Only john shown as attendee
  ✗ bob excluded from attendee list
  ✅ Used for AI processing

Result when filtering for techco.com:
  ✅ Meeting included
  ✅ Only bob shown as attendee
  ✗ john excluded from attendee list
  ✅ Used for AI processing
```

### Scenario D: No Customer Attendees
```
Meeting: "TechCo Demo"
  bob@techco.com
  demo@yourcompany.com

Result when filtering for acme.com:
  ❌ Meeting excluded
  ❌ Not used for AI processing
  ℹ️ Warning logged in console
```

---

## 🔒 Privacy Guarantee

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ACME CORP PRESENTATION                                   ║
║  ────────────────────────                                 ║
║                                                           ║
║  Data Sources:                                            ║
║  ✅ Meetings with @acme.com attendees ONLY                ║
║                                                           ║
║  Excluded:                                                ║
║  ❌ TechCo meetings                                       ║
║  ❌ VendorCo meetings                                     ║
║  ❌ Internal-only meetings                                ║
║  ❌ Other customer meetings                               ║
║                                                           ║
║  Guarantee: 4-Layer Filtering                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎓 Summary

### What Domain Filtering Means

**Simple Version:**
```
Enter "acme.com" → Get ONLY ACME meetings → ACME-specific insights
```

**Technical Version:**
```
Domain Filter → Backend Index Lookup → Meeting Verification → 
Frontend Re-verification → Attendee Filtering → AI Processing → 
Company-Specific Results
```

**User Impact:**
```
You can trust that every presentation contains data from 
ONLY the company you specified. No mixing. No errors.
```

---

**Visual Guide Complete** ✅

For more details, see:
- 📘 [Domain Filtering Guarantee](./DOMAIN_FILTERING_GUARANTEE.md)
- 📗 [Quick Start Guide](./FATHOM_WEBHOOK_QUICK_START.md)

---

*Last Updated: October 13, 2025*  
*Complexity: Simple Explanations*  
*Audience: All Users*
