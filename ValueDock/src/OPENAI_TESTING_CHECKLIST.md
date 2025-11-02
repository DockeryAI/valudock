# OpenAI Integration Testing Checklist

## 🧪 Pre-Testing Setup

- [ ] OpenAI API key uploaded to environment variables (OPENAI_API_KEY)
- [ ] Supabase Edge Functions server is running
- [ ] Logged into ValueDock application
- [ ] Have a test company website URL ready (e.g., https://stripe.com)
- [ ] At least one process created in Process Editor

---

## ✅ Test 1: Business Description Generator

**Steps:**
1. Navigate to Presentation screen
2. Go to Executive Summary tab
3. Enter company website: `https://stripe.com`
4. Click the sparkle icon (✨) next to "Business Description"
5. Wait 5-10 seconds

**Expected Result:**
- [ ] Loading spinner appears
- [ ] Green checkmark appears after completion
- [ ] Business description field populates with AI-generated text
- [ ] Text describes Stripe's business (payments, fintech, etc.)
- [ ] Success toast notification appears
- [ ] No errors in browser console

**If Failed:**
- Check browser console for errors
- Check server logs: `Error: OpenAI API key not configured`
- Verify API key is set correctly
- Try a different website URL

---

## ✅ Test 2: Solution Summary Generator

**Prerequisites:**
- [ ] Complete ROI calculations first
- [ ] Add at least one goal
- [ ] Add at least one challenge

**Steps:**
1. Scroll to "Solution Summary" field
2. Click sparkle icon (✨)
3. Wait 5-10 seconds

**Expected Result:**
- [ ] Loading spinner appears
- [ ] Green checkmark after completion
- [ ] Solution summary includes your ROI metrics
- [ ] Text is 2-3 sentences long
- [ ] Mentions specific dollar amounts and percentages
- [ ] Success toast notification

**If Failed:**
- Ensure you have ROI results calculated
- Check that goals/challenges are entered
- Check console for errors

---

## ✅ Test 3: Meeting Notes Generator

**Prerequisites:**
- [ ] At least one goal entered
- [ ] At least one challenge entered

**Steps:**
1. Go to Executive Summary tab
2. Add a goal: "Increase processing capacity by 30%"
3. Add a challenge: "Manual invoice processing takes 200 hours/month"
4. Click sparkle icon (✨) next to "Meeting Notes"
5. Wait 5-10 seconds

**Expected Result:**
- [ ] Meeting notes field populates
- [ ] Notes reference your goals and challenges
- [ ] Professional business tone
- [ ] Includes next steps or action items
- [ ] Success toast notification

---

## ✅ Test 4: Additional Benefits Generator

**Prerequisites:**
- [ ] Goals and challenges entered

**Steps:**
1. Navigate to Solution Implementation tab
2. Scroll to Benefits section
3. Click sparkle icon (✨) for "Additional Benefits"
4. Wait 5-10 seconds

**Expected Result:**
- [ ] List of 5 benefits appears
- [ ] Benefits are bulleted or numbered
- [ ] Benefits align with your goals/challenges
- [ ] Benefits are specific and concrete
- [ ] Success toast notification

---

## ✅ Test 5: Implementation Timeline Generator

**Prerequisites:**
- [ ] At least one starter process selected

**Steps:**
1. Go to Solution Implementation tab
2. Select a starter process (check the checkbox)
3. Click sparkle icon (✨) next to Timeline
4. Wait 5-10 seconds

**Expected Result:**
- [ ] Timeline field populates
- [ ] Shows 4 phases (Discovery, Development, Deployment, Optimization)
- [ ] Includes week ranges for each phase
- [ ] Mentions selected process names
- [ ] Success toast notification

---

## ✅ Test 6: Statement of Work Generator

**Prerequisites:**
- [ ] At least one starter process selected
- [ ] Cost estimates entered (optional but recommended)

**Steps:**
1. Navigate to Statement of Work tab
2. Enter upfront cost: `50000`
3. Enter monthly costs: `2000`
4. Click sparkle icon (✨) in SOW Details
5. Wait 5-10 seconds

**Expected Result:**
- [ ] SOW field populates with 2-3 paragraphs
- [ ] Includes project objectives and scope
- [ ] Mentions deliverables and responsibilities
- [ ] Professional business language
- [ ] References selected processes
- [ ] Success toast notification

---

## ✅ Test 7: Error Handling

**Test Invalid Website:**
1. Enter website: `not-a-valid-url`
2. Click sparkle icon for Business Description
3. Expected: Error toast appears with clear message

**Test Without Prerequisites:**
1. Try generating Solution Summary without ROI calculations
2. Expected: Should still work but may be generic

**Test API Rate Limit:**
1. Click multiple sparkle icons rapidly (5+ times)
2. Expected: Either all succeed or rate limit error appears

---

## ✅ Test 8: Full Workflow Integration

**Complete Presentation Creation:**
1. [ ] Enter website → Generate business description
2. [ ] Add 2 goals, 2 challenges manually
3. [ ] Generate meeting notes
4. [ ] Complete ROI calculations
5. [ ] Generate solution summary
6. [ ] Select 2 starter processes
7. [ ] Generate additional benefits
8. [ ] Generate timeline
9. [ ] Enter costs
10. [ ] Generate SOW
11. [ ] Review all generated content
12. [ ] Export to Gamma or PDF

**Expected Result:**
- [ ] All sections populate successfully
- [ ] Content is coherent across sections
- [ ] ROI metrics are consistent
- [ ] No errors during the entire flow
- [ ] Total time: ~15 minutes

---

## 🔧 Browser Console Tests

**Check Network Requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "ai"
4. Click a sparkle icon
5. Expected:
   - [ ] POST request to `/ai/generate` or `/ai/analyze-website`
   - [ ] Status: 200 OK
   - [ ] Response contains `success: true` and `content: "..."`

**Check for Errors:**
1. Open DevTools Console
2. Generate any AI content
3. Expected:
   - [ ] No red errors
   - [ ] May see blue info logs (normal)
   - [ ] If errors appear, copy full error message

---

## 📊 Performance Tests

**Response Time:**
- [ ] Business description: < 15 seconds
- [ ] Solution summary: < 15 seconds
- [ ] Meeting notes: < 15 seconds
- [ ] Benefits: < 15 seconds
- [ ] Timeline: < 15 seconds
- [ ] SOW: < 20 seconds

**If Slower:**
- OpenAI API may be experiencing high load
- Try again in a few minutes
- Consider upgrading to GPT-4 if you need faster responses

---

## 🐛 Common Issues & Solutions

### Issue: "OpenAI API key not configured"

**Debug Steps:**
1. [ ] Check environment variable is set: `OPENAI_API_KEY`
2. [ ] Verify key starts with `sk-`
3. [ ] Restart Supabase Edge Function server
4. [ ] Check server logs for startup messages

**Solution:**
```bash
# Check if env var is set (in Supabase dashboard)
# Or re-upload API key using the secret modal
```

---

### Issue: "Failed to generate content"

**Debug Steps:**
1. [ ] Check browser console for error details
2. [ ] Check server logs: Look for `[AI/GENERATE] Error:`
3. [ ] Verify you're logged in (auth token valid)
4. [ ] Check OpenAI API status: https://status.openai.com

**Solution:**
- If authentication error: Re-login
- If API error: Check OpenAI account has credits
- If rate limit: Wait 1 minute and retry

---

### Issue: Generated content is poor quality

**Debug Steps:**
1. [ ] Check if you provided enough context
2. [ ] Review your goals/challenges - are they specific?
3. [ ] Verify ROI calculations are complete

**Solution:**
- Add more detailed goals with numbers
- Enter specific challenges with impacts
- Click sparkle icon again to regenerate
- Manually edit the output

---

### Issue: Website analysis fails

**Debug Steps:**
1. [ ] Check URL format (must include https://)
2. [ ] Try accessing website in browser
3. [ ] Check if website blocks scrapers

**Solution:**
- Use company homepage (not deep page)
- Try `https://www.company.com` instead of `company.com`
- If website is protected, manually enter description

---

## 📝 Test Results Log

**Date:** ___________  
**Tester:** ___________  
**Environment:** ___________

| Test | Status | Notes |
|------|--------|-------|
| 1. Business Description | ⬜ Pass / ⬜ Fail | |
| 2. Solution Summary | ⬜ Pass / ⬜ Fail | |
| 3. Meeting Notes | ⬜ Pass / ⬜ Fail | |
| 4. Additional Benefits | ⬜ Pass / ⬜ Fail | |
| 5. Timeline | ⬜ Pass / ⬜ Fail | |
| 6. SOW | ⬜ Pass / ⬜ Fail | |
| 7. Error Handling | ⬜ Pass / ⬜ Fail | |
| 8. Full Workflow | ⬜ Pass / ⬜ Fail | |

**Overall Result:** ⬜ All Tests Passed / ⬜ Some Tests Failed

**Issues Found:**
```
[List any issues or bugs discovered]
```

**Recommendations:**
```
[Any suggested improvements]
```

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] Error handling works correctly
- [ ] Performance is acceptable
- [ ] Ready for production use
- [ ] Documentation is clear

**Tested By:** ___________  
**Date:** ___________  
**Signature:** ___________

---

## 🚀 Next Steps After Testing

1. [ ] Train team on AI features
2. [ ] Create sample presentations
3. [ ] Set usage guidelines
4. [ ] Monitor API costs
5. [ ] Gather user feedback
6. [ ] Iterate on prompts if needed

---

**Happy Testing! 🧪✨**
