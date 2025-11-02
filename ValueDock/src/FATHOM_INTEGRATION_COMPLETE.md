# Fathom.video Integration - Complete Guide

## ✅ Configuration Complete

The Fathom.video API integration has been successfully configured for ValueDock®. You've been prompted to add your `FATHOM_API_KEY` environment variable.

## 🔑 Getting Your Fathom API Key

1. **Visit Fathom Settings**: https://app.fathom.video/settings/integrations
2. **Generate API Key**: Create a new API key for ValueDock integration
3. **Add to Environment**: When prompted, paste your API key into the modal

## 🎯 How It Works

The system automatically:
1. Fetches meetings from Fathom filtered by company domain
2. Retrieves Fathom's AI-generated call summaries
3. Analyzes summaries using OpenAI GPT-4o-mini
4. Extracts structured data for your presentation

## 📊 Three Main Features

### 1. **Meeting History Generator**
- **Endpoint**: `/fathom-meeting-history`
- **What it does**: Creates executive summary of all customer meetings
- **Output**: 
  - Meeting count
  - List of attendees from customer organization
  - Meeting dates
  - Professional 2-3 paragraph summary
  
**Example Usage**:
```json
POST /make-server-888f4514/fathom-meeting-history
{
  "domain": "acme.com"
}
```

**Response**:
```json
{
  "summary": "We conducted 4 meetings with Acme Corp...",
  "meetingCount": 4,
  "attendees": ["John Smith", "Jane Doe"],
  "meetingDates": ["January 15, 2025", "January 22, 2025"],
  "domain": "acme.com"
}
```

### 2. **Challenges Extractor**
- **Endpoint**: `/fathom-extract-challenges`
- **What it does**: Identifies business challenges discussed in meetings
- **Output**: Structured list of challenges with business impact
  
**Example Usage**:
```json
POST /make-server-888f4514/fathom-extract-challenges
{
  "domain": "acme.com"
}
```

**Response**:
```json
{
  "challenges": [
    {
      "description": "Manual invoice processing consuming 40 hours/month",
      "impact": "Delaying payments and reducing cash flow efficiency"
    },
    {
      "description": "High error rate in data entry",
      "impact": "Causing reconciliation delays and customer dissatisfaction"
    }
  ]
}
```

### 3. **Goals Extractor**
- **Endpoint**: `/fathom-extract-goals`
- **What it does**: Identifies business goals mentioned in meetings
- **Output**: Structured list of goals with target outcomes

**Example Usage**:
```json
POST /make-server-888f4514/fathom-extract-goals
{
  "domain": "acme.com"
}
```

**Response**:
```json
{
  "goals": [
    {
      "description": "Reduce Days Sales Outstanding (DSO)",
      "targetOutcome": "Decrease from 45 to 30 days within 6 months"
    },
    {
      "description": "Automate invoice processing",
      "targetOutcome": "Reduce manual processing time by 80%"
    }
  ]
}
```

## 🎬 Using in Presentation Screen

### Step-by-Step Workflow:

1. **Go to Presentation Screen** in ValueDock
2. **Enter Company Website** in Executive Summary section (e.g., `https://www.acme.com`)
3. **Click AI Sparkle Icons (✨)** next to these fields:
   - **Meeting History**: Generates executive summary from Fathom
   - **Challenges**: Extracts and adds challenges to presentation
   - **Goals**: Extracts and adds goals to presentation

### How Domain Filtering Works:

The system extracts the domain from the company website:
- Input: `https://www.acme.com/about`
- Extracted domain: `acme.com`
- Searches for: Meetings with attendees having `@acme.com` emails

### Automatic Data Population:

When you click the AI buttons:
1. System fetches all Fathom meetings with attendees from that domain
2. Retrieves Fathom's AI-generated summaries (NOT full transcripts - more efficient!)
3. Uses OpenAI to:
   - Summarize who you met with and when
   - Extract specific challenges discussed
   - Identify business goals mentioned
4. **Automatically adds** extracted challenges/goals to respective presentation sections

## 🔧 Technical Details

### API Integration Flow:

```
Frontend (Presentation Screen)
    ↓
Backend Endpoint (/fathom-meeting-history, /fathom-extract-challenges, /fathom-extract-goals)
    ↓
Fathom.video API (fetch meetings by domain, get AI summaries)
    ↓
OpenAI GPT-4o-mini (analyze summaries, extract structured data)
    ↓
Return to Frontend (populate presentation fields)
```

### Meeting Filtering Logic:

1. Fetch ALL meetings from Fathom API
2. Filter where `attendee.email` ends with `@{company-domain}`
3. Sort by date (most recent first)
4. Limit to 20 most recent meetings
5. Fetch Fathom's AI summary for each meeting
6. Combine summaries and analyze with OpenAI

### Advantages of Using Fathom Summaries:

✅ **Faster**: Summaries are smaller than full transcripts  
✅ **More Accurate**: Fathom's AI already extracted key points  
✅ **Cost-Effective**: Fewer tokens sent to OpenAI  
✅ **Better Results**: Summaries focus on actionable insights  

## 🐛 Troubleshooting

### "No meetings found"
- ✅ Verify company website domain is correct
- ✅ Ensure Fathom meetings have attendees with emails from that domain
- ✅ Check that meetings exist in your Fathom account

### "API key not configured"
- ✅ Make sure you added your FATHOM_API_KEY when prompted
- ✅ Verify the key is valid in Fathom settings
- ✅ Check that OPENAI_API_KEY is also configured

### "Failed to fetch meetings"
- ✅ Check Fathom API key has correct permissions
- ✅ Verify your Fathom account has access to the meetings
- ✅ Check network connectivity

### Empty challenges/goals array
- ✅ Meetings may not contain explicit challenges/goals discussion
- ✅ Try adding more context in meetings about problems and objectives
- ✅ Fathom summaries may need to be more detailed

## 📝 Best Practices

### For Optimal Results:

1. **Use Clear Company Domains**: 
   - ✅ Good: `acme.com`
   - ❌ Avoid: `acme-staging.internal.com`

2. **Invite Customers with Company Emails**:
   - ✅ `john.smith@acme.com`
   - ❌ `john.smith@gmail.com` (won't be filtered correctly)

3. **Discuss Specific Challenges & Goals**:
   - The AI extraction works best when meetings explicitly mention problems and objectives
   - Use phrases like "our goal is to..." and "the challenge we're facing is..."

4. **Review Extracted Data**:
   - AI-generated content should be reviewed and edited if needed
   - Use as a starting point, not final copy

## 🔐 Security Notes

- ✅ Fathom API key stored securely in Supabase environment variables
- ✅ Never exposed to frontend
- ✅ All API calls made from secure backend
- ✅ Tokens require user authentication

## 📈 Next Steps

Want to enhance the integration? Consider:

1. **Add Date Range Filters**: Limit analysis to meetings in specific timeframe
2. **Meeting Selector UI**: Browse and manually select specific meetings
3. **Connection Status Indicator**: Show Fathom API connection status in Admin Dashboard  
4. **Caching**: Store analyzed meetings to avoid re-processing
5. **Bulk Analysis**: Process multiple companies at once

---

## 🎉 You're Ready!

The Fathom integration is fully configured and ready to use. Simply:
1. Add your FATHOM_API_KEY when prompted
2. Go to Presentation Screen
3. Enter a company website
4. Click the AI sparkle icons to generate content from your Fathom meetings!

**Questions or issues?** Check the troubleshooting section above or review the server logs for detailed error messages.
