# Meeting History Aggregate - Quick Start Guide

## 🚀 5-Minute Quick Start

### Step 1: Navigate to Create Presentation

1. Login to ValuDock
2. Click menu → "Create Presentation"
3. Go to **Executive Summary** tab

---

### Step 2: Enter Company Domain

**Field**: "Company Domain"  
**Helper**: "use customer email domain"

**Example**: `acme.com` or `thephoenixinsurance.com`

**Important**: Use just the domain, not full URL:
- ✅ `acme.com`
- ✅ `thephoenixinsurance.com`
- ❌ `https://www.acme.com`

---

### Step 3: Generate Meeting Summary

**Click**: "✨ Generate Meeting Summary" button

**Wait**: 5-15 seconds while the system:
1. Fetches all Fathom meetings for that domain (last 6 months)
2. Aggregates meeting transcripts
3. Sends to OpenAI for analysis
4. Extracts goals, challenges, people, and stats

---

### Step 4: Review Results

**You'll See**:

```
✅ Summary (Editable)
┌─────────────────────────────────────┐
│ We met with Acme Corp over 6       │
│ months across 12 meetings. Key     │
│ stakeholders include VP of Ops... │
└─────────────────────────────────────┘

Total Meetings: 12    Time Span: 6 months

👥 People Met
• John Smith — VP of Operations
• Sarah Johnson — Director of IT
• Mike Davis — CFO

🎯 Goals (4)
• Reduce invoice processing time by 50%
• Improve compliance tracking
• Scale without adding headcount
• Enhance data accuracy

⚠️ Challenges (3)
• Manual data entry causes errors
• Slow approval workflows
• Limited visibility into metrics
```

---

### Step 5: Edit Summary (Optional)

**Click** inside the Summary text area  
**Edit** as needed  
**Click** outside to save

---

### Step 6: Save Summary

**Click**: "📄 Save Summary" button

**Result**: Summary saved to backend for later use

---

### Step 7: Use for Presentation

**Click**: "💡 Use for Presentation" button

**What Happens**:
- All **Goals** → Added to Business Goals section
- All **Challenges** → Added to Challenges section  
- **Summary** → Populated in Meeting History field

**Success Message**:
```
✅ Added 4 goals and 3 challenges to presentation
```

---

### Step 8: Verify & Edit

**Scroll Down** to Goals section  
**Verify** all goals appear  
**Edit** as needed (add target outcomes, align to metrics)

**Scroll Down** to Challenges section  
**Verify** all challenges appear  
**Edit** as needed (add impact, align to metrics)

---

## 📊 What Gets Auto-Populated

### Meeting History Field
```
Summary text from aggregated meetings
```

### Business Goals (NEW items added)
```
Goal 1: Reduce invoice processing time by 50%
  Target Outcome: [you can fill this in]
  Aligned Outcomes: [auto-aligned to relevant ROI metrics]

Goal 2: Improve compliance tracking
  ...
```

### Challenges (NEW items added)
```
Challenge 1: Manual data entry causes errors
  Impact: [you can fill this in]
  Aligned Outcomes: [auto-aligned to relevant metrics]

Challenge 2: Slow approval workflows
  ...
```

---

## 🎯 Pro Tips

### Tip 1: Domain Matching

**For Best Results**: Use the domain from customer email addresses

**Example**:
- Customer emails: `john@acme.com`, `sarah@acme.com`
- Enter domain: `acme.com`

This ensures Fathom matches meetings with those attendees.

---

### Tip 2: Time Range

**Default**: Last 6 months

**Can't Change**: Currently fixed (future enhancement)

**Workaround**: If you need older meetings, they're still aggregated if within the range.

---

### Tip 3: Edit After Import

**Strategy**: 
1. Click "Use for Presentation" to import all items
2. Review each goal/challenge
3. Delete any that don't apply
4. Add target outcomes and impacts
5. Verify outcome alignments

---

### Tip 4: Regenerate if Needed

**If Results Aren't Good**:
1. Click "🔄 Reset" button
2. Check domain is correct
3. Click "Generate Meeting Summary" again
4. Review new results

---

## ⚠️ Common Issues

### Issue: "Enter company domain above"

**Cause**: No domain entered  
**Fix**: Enter domain in "Company Domain" field above

---

### Issue: "0 meetings found"

**Possible Causes**:
1. No Fathom meetings for that domain
2. Domain spelling is wrong
3. Meetings older than 6 months

**Fix**:
- Verify domain spelling
- Check Fathom has meetings with attendees from that domain
- Ensure meetings are recent (last 6 months)

---

### Issue: Summary seems incomplete

**Possible Causes**:
- Only partial transcripts available
- Meetings were short/informal
- Some meetings missing transcripts

**Fix**:
- Edit summary manually to add missing context
- Use "Meeting Notes" field for additional details

---

### Issue: Goals/Challenges not aligned correctly

**Why**: Auto-alignment uses keyword matching

**Fix**:
1. Go to Goals section
2. Click on a goal to edit
3. Manually adjust aligned outcomes
4. Repeat for each goal/challenge

---

## 🔄 Reset & Regenerate

**When to Reset**:
- Results don't match expectations
- Want to try different domain
- Made mistakes during editing

**How**:
1. Click "🔄 Reset" button
2. Summary panel disappears
3. "Generate Meeting Summary" button returns
4. Start over

---

## 💾 Save for Later

**Save Summary**:
- Saves edited version to backend
- Associates with organization
- Can be retrieved later

**Currently**: Manual retrieval only  
**Future**: Auto-load saved summaries

---

## 🎨 Customization Tips

### Summary Text

**Good Practice**:
- Keep it concise (2-3 sentences)
- Include timeframe and meeting count
- Mention key stakeholders
- Highlight main discussion topics

**Example**:
```
We engaged with Acme Corporation over 6 months through 
12 discovery meetings. Key stakeholders included John 
Smith (VP of Operations), Sarah Johnson (Director of IT), 
and Mike Davis (CFO). Primary focus was on automating 
their invoice processing workflow to reduce errors and 
improve efficiency.
```

---

### Goals

**Best Practice**:
- Make them specific and measurable
- Add realistic target outcomes
- Align to quantified ROI metrics

**Example**:
```
Goal: Reduce invoice processing time by 50%
Target Outcome: From 3 days to 1.5 days average
Aligned Outcomes: 
  ✓ Time Savings
  ✓ Annual Savings
  ✓ FTE Reduction
```

---

### Challenges

**Best Practice**:
- Describe the current pain point
- Quantify the impact if possible
- Connect to business outcomes

**Example**:
```
Challenge: Manual data entry causes errors
Impact: 5% error rate costing $50K annually in corrections
Aligned Outcomes:
  ✓ Error Reduction
  ✓ Quality Improvement
  ✓ Annual Savings
```

---

## 📋 Checklist

Use this after generating meeting summary:

- [ ] Summary text makes sense
- [ ] Meeting count is accurate
- [ ] People list is complete
- [ ] All goals captured
- [ ] All challenges captured
- [ ] Clicked "Save Summary"
- [ ] Clicked "Use for Presentation"
- [ ] Verified goals appear in Goals section
- [ ] Verified challenges appear in Challenges section
- [ ] Added target outcomes to goals
- [ ] Added impact descriptions to challenges
- [ ] Verified outcome alignments

---

## 🎯 Complete Example

### Input

**Company Domain**: `thephoenixinsurance.com`

---

### Output After Generation

**Summary**:
```
We conducted discovery sessions with The Phoenix Insurance 
over 4 months through 8 meetings. Stakeholders included 
Sarah Chen (COO) and Mark Williams (Director of Claims). 
Focus areas centered on claims processing automation and 
reducing manual data entry.
```

**Stats**: 8 meetings, 4 months

**People**:
- Sarah Chen — COO
- Mark Williams — Director of Claims

**Goals**:
- Automate 80% of claims processing
- Reduce claims processing time from 7 to 2 days
- Improve claims accuracy to 99%+

**Challenges**:
- Manual data extraction from emails
- High error rates in claim categorization
- Limited visibility into processing bottlenecks

---

### After "Use for Presentation"

**Goals Section** (new items):
```
Goal: Automate 80% of claims processing
  Target Outcome: [Edit to add]
  Aligned: Annual Savings, FTE Reduction

Goal: Reduce claims processing time from 7 to 2 days
  Target Outcome: [Edit to add]
  Aligned: Time Savings, Annual Savings

Goal: Improve claims accuracy to 99%+
  Target Outcome: [Edit to add]
  Aligned: Quality Improvement, Error Reduction
```

**Challenges Section** (new items):
```
Challenge: Manual data extraction from emails
  Impact: [Edit to add]
  Aligned: Annual Savings, Time Savings

Challenge: High error rates in claim categorization
  Impact: [Edit to add]
  Aligned: Error Reduction, Quality Improvement

Challenge: Limited visibility into processing bottlenecks
  Impact: [Edit to add]
  Aligned: Process Visibility, Efficiency
```

---

## 🚀 Next Steps

After using Meeting History Aggregate:

1. **Complete Goals/Challenges** - Add outcomes and impacts
2. **Generate Solution Summary** - Use AI to create exec summary
3. **Select Processes** - Choose which to automate
4. **Review ROI Metrics** - Verify alignment
5. **Create Timeline** - Generate implementation plan
6. **Export to Gamma** - Create presentation deck

---

## 💡 Best Practices

### DO ✅
- Use exact customer email domain
- Review and edit AI-generated content
- Add specific target outcomes
- Verify metric alignments
- Save summary after editing

### DON'T ❌
- Use full URLs (just domain)
- Trust AI 100% without review
- Skip adding target outcomes
- Forget to save changes
- Leave alignments as auto-generated

---

## 📞 Support

**Having Issues?**
- Check domain spelling
- Verify Fathom meetings exist
- Review error messages in console (F12)
- Check that meetings are recent (< 6 months)

**Feature Not Working?**
- Try refreshing the page
- Clear browser cache
- Check network tab for API errors
- Contact support with error details

---

**Ready to try it?** 🎉

Start with Step 1: Enter your customer's email domain!
