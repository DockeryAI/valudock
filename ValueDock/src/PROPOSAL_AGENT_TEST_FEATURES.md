# Proposal Agent - Test & Debug Features

## 🎯 Overview

Added comprehensive testing and debugging features to the Proposal Agent admin panel to help QA and troubleshoot the AI proposal generation system.

---

## ✨ New Features

### 1. **Test Run** Button

**Location**: Admin → Agent → Proposal Builder → Agent Runner tab  
**Purpose**: Quick test of the proposal agent with placeholder data

#### **How it Works:**
1. Click "Test Run" button
2. Uses dummy IDs:
   - Deal ID: `deal-test-001`
   - Organization ID: `org-test-001`
   - URL: `https://example.com`
3. Shows console-style log in real-time:
   ```
   🚀 Starting Test Run...
   📋 Using placeholder IDs: deal-test-001, org-test-001
   🌐 Fetching site → Analyzing customer website...
   ✅ Website analysis complete
   💰 Analyzing ROI → Calculating metrics...
   ✅ ROI calculation complete
   💾 Saving version → Persisting to database...
   ✅ Version saved successfully
   ✨ Test Run Complete!
   ```
4. Displays "FINAL OUTPUT" in a collapsible panel
5. Shows toast: "Test run completed successfully!"

#### **UI Components:**
```tsx
// Test Run Button
<Button onClick={handleTestRun} variant="secondary">
  <Beaker className="h-4 w-4 mr-2" />
  Test Run
</Button>

// Console Log Display
<Card>
  <CardHeader>
    <CardTitle>Test Run Console</CardTitle>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-[300px]">
      <div className="font-mono text-sm">
        {testLogs.map(log => <div>{log}</div>)}
      </div>
    </ScrollArea>
  </CardContent>
</Card>

// Collapsible Output
<Collapsible>
  <CollapsibleTrigger>
    Show/Hide Final Output
  </CollapsibleTrigger>
  <CollapsibleContent>
    <pre>{testOutput}</pre>
  </CollapsibleContent>
</Collapsible>
```

---

### 2. **Smoke Test** Button

**Location**: Admin → Agent → Proposal Builder → Agent Runner tab  
**Purpose**: Test all tool calls in sequence

#### **How it Works:**
1. Click "Smoke Test" button
2. Shows console-style log with tool call progression:
   ```
   🧪 Starting Smoke Test...
   🌐 fetch_url → Retrieving customer data...
   ✅ fetch_url complete
   🎤 fathom.get_meetings → Searching transcripts...
   ✅ fathom.get_meetings complete
   🎤 fathom.get_summary → Extracting insights...
   ✅ fathom.get_summary complete
   💾 valuedock.put_proposal → Saving proposal data...
   ✅ valuedock.put_proposal complete
   🎨 gamma.create_deck → Generating presentation...
   ✅ gamma.create_deck complete
   ✨ Smoke Test Complete!
   ```
3. Displays assistant's final text in collapsible panel
4. Shows toast: "Smoke test completed!"

#### **Tool Call Sequence:**
1. `fetch_url` - Website data retrieval
2. `fathom.get_meetings` - Find meeting transcripts
3. `fathom.get_summary` - Extract meeting insights
4. `valuedock.put_proposal` - Save proposal to database
5. `gamma.create_deck` - Generate presentation

---

### 3. **Versions Activity Log** Tab

**Location**: Admin → Agent → Proposal Builder → Versions Log tab  
**Purpose**: View all saved proposal versions with metadata

#### **Features:**
- Lists all versions in descending order (newest first)
- Shows for each version:
  - Version number (e.g., "Version 2")
  - Status badge (Draft/Published)
  - "Current" badge for active version
  - Created timestamp
  - Created by (user name)
  - Version ID (UUID)
- **"View JSON" button** - Fetches and logs version data

#### **UI Layout:**
```
┌─────────────────────────────────────────────┐
│ 📜 Version Activity Log                     │
│ View saved versions with metadata           │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Version 3 [Draft] [Current]             │ │
│ │ Created Oct 16, 2025 2:30 PM            │ │
│ │                          [View JSON]    │ │
│ │                                         │ │
│ │ Created by: John Doe                    │ │
│ │ Version ID: deal-001-v3-1729...         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Version 2 [Published]                   │ │
│ │ Created Oct 15, 2025 10:15 AM           │ │
│ │                          [View JSON]    │ │
│ │                                         │ │
│ │ Created by: Jane Smith                  │ │
│ │ Version ID: deal-001-v2-1729...         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### **View JSON Functionality:**
```typescript
// Fetches stored proposal row
const response = await apiCall(
  `/proposal-agent/versions/${versionId}?dealId=${dealId}&organizationId=${orgId}`
);

// Logs to console for audit
console.log('Version data:', response.version);
toast.success('Version data logged to console');
```

---

### 4. **Use OpenAI REST (no SDK)** Toggle

**Location**: Admin → Agent → Proposal Builder → Agent Runner tab  
**Purpose**: Switch between OpenAI SDK and direct REST API calls

#### **Features:**
- Toggle switch with label and description
- When **ENABLED**:
  - Backend uses direct `POST /v1/responses` HTTP calls
  - Logs all HTTP request/response metadata
  - Displays API errors inline
  - Better for debugging and troubleshooting
- When **DISABLED** (default):
  - Uses OpenAI SDK (standard approach)
  - Cleaner code, fewer logs

#### **UI Component:**
```tsx
<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
  <div className="space-y-0.5">
    <Label htmlFor="openai-rest">Use OpenAI REST (no SDK)</Label>
    <p className="text-xs text-muted-foreground">
      Direct HTTP calls with request/response logging
    </p>
  </div>
  <Switch
    id="openai-rest"
    checked={useOpenAIRest}
    onCheckedChange={setUseOpenAIRest}
  />
</div>
```

#### **Backend Implementation:**
```typescript
// When useOpenAIRest is true, backend calls:
const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [...]
  })
});

// Log metadata
console.log('[OpenAI REST] Request:', {
  url: 'https://api.openai.com/v1/responses',
  method: 'POST',
  headers: { ... },
  timestamp: new Date().toISOString()
});

console.log('[OpenAI REST] Response:', {
  status: response.status,
  headers: response.headers,
  timestamp: new Date().toISOString()
});

// Display errors inline
if (!response.ok) {
  const error = await response.json();
  console.error('[OpenAI REST] API Error:', error);
  // Return to frontend for inline display
  return { success: false, error: error.message };
}
```

---

## 🎨 UI Updates

### **Tab Navigation**

Before:
```
[ Agent Runner ] [ Content Builder ]
```

After:
```
[ Agent Runner ] [ Content Builder ] [ 📜 Versions Log ]
```

### **Agent Runner Tab Layout**

```
┌─────────────────────────────────────────────┐
│ Agent Configuration                         │
├─────────────────────────────────────────────┤
│ Deal ID: [input]                            │
│ Customer URL: [input]                       │
│ Fathom Window: [dropdown]                   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Use OpenAI REST (no SDK)       [toggle] │ │
│ │ Direct HTTP calls with logging          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [ Test Run ]      [ Smoke Test ]            │
│                                             │
│ ───────────────────────────────────────────  │
│                                             │
│ [ Run Agent ]     [ Run & Save Version ]    │
└─────────────────────────────────────────────┘
```

---

## 📊 State Management

### **New State Variables:**
```typescript
// Test Run
const [isTestRunning, setIsTestRunning] = useState(false);
const [testLogs, setTestLogs] = useState<string[]>([]);
const [testOutput, setTestOutput] = useState<string>('');
const [showTestOutput, setShowTestOutput] = useState(false);

// Smoke Test
const [isSmokeTestRunning, setIsSmokeTestRunning] = useState(false);
const [smokeLogs, setSmokeLogs] = useState<string[]>([]);
const [smokeOutput, setSmokeOutput] = useState<string>('');
const [showSmokeOutput, setShowSmokeOutput] = useState(false);

// OpenAI REST Toggle
const [useOpenAIRest, setUseOpenAIRest] = useState(false);
const [openAILogs, setOpenAILogs] = useState<any[]>([]);
```

---

## 🔌 Backend Endpoints

### **1. Test Run Endpoint**
```
POST /make-server-888f4514/proposal-agent/test-run
```

**Request Body:**
```json
{
  "deal_id": "deal-test-001",
  "customer_url": "https://example.com",
  "fathom_window_days": 30,
  "organization_id": "org-test-001",
  "use_openai_rest": false
}
```

**Response:**
```json
{
  "success": true,
  "output": "Test Run Completed Successfully!...",
  "timestamp": "2025-10-16T14:30:00Z"
}
```

### **2. Smoke Test Endpoint**
```
POST /make-server-888f4514/proposal-agent/smoke-test
```

**Request Body:**
```json
{
  "use_openai_rest": false
}
```

**Response:**
```json
{
  "success": true,
  "assistant_text": "Smoke Test Report...",
  "tool_calls": [
    { "tool": "fetch_url", "status": "success" },
    { "tool": "fathom.get_meetings", "status": "success" },
    { "tool": "fathom.get_summary", "status": "success" },
    { "tool": "valuedock.put_proposal", "status": "success" },
    { "tool": "gamma.create_deck", "status": "success" }
  ],
  "timestamp": "2025-10-16T14:30:00Z"
}
```

---

## 🚀 Usage Workflow

### **QA Testing Workflow:**

1. **Navigate to Proposal Agent**
   ```
   Admin → Agent → Proposal Builder
   ```

2. **Enable Debug Mode**
   ```
   ✅ Toggle "Use OpenAI REST (no SDK)" ON
   ```

3. **Run Smoke Test**
   ```
   Click "Smoke Test" button
   Watch console logs
   Review assistant text output
   ```

4. **Run Test with Placeholder Data**
   ```
   Click "Test Run" button
   Observe step-by-step logs
   Check final output
   ```

5. **Review Version History**
   ```
   Switch to "Versions Log" tab
   Click "View JSON" on any version
   Check console for full version data
   ```

6. **Run Actual Proposal**
   ```
   Fill in real Deal ID, URL
   Click "Run & Save Version"
   Monitor OpenAI REST logs (if enabled)
   Check for inline API errors
   ```

---

## 🐛 Debugging Features

### **Console-Style Logs**
- Real-time log streaming
- Monospace font for readability
- Emoji indicators for status
- Scrollable log area

### **Collapsible Output Panels**
- Hide/show final outputs
- Syntax-highlighted text
- Full error stack traces
- Copy-friendly formatting

### **Inline Error Display**
- API errors shown in UI
- HTTP metadata logged
- Request/response details
- Timestamp tracking

---

## 📁 Files Modified

### **Frontend:**
1. `/components/ProposalAgentRunner.tsx`
   - Added Test Run handler
   - Added Smoke Test handler
   - Added Versions Log tab
   - Added OpenAI REST toggle
   - Added console log displays
   - Added collapsible output panels

### **Backend:**
1. `/supabase/functions/server/index.tsx`
   - Added `/proposal-agent/test-run` endpoint
   - Added `/proposal-agent/smoke-test` endpoint

---

## 🎯 Key Benefits

### **For QA Teams:**
✅ Quick smoke tests without real data  
✅ Console logs for step-by-step verification  
✅ Collapsible outputs for easy review  
✅ Version history audit trail  

### **For Developers:**
✅ OpenAI REST mode for debugging  
✅ HTTP request/response logging  
✅ Inline API error display  
✅ Full version data inspection  

### **For Admins:**
✅ No-risk testing with placeholder data  
✅ Version activity tracking  
✅ User attribution for all versions  
✅ JSON export for auditing  

---

## 🔮 Future Enhancements

### **Phase 1: Current** ✅
- [x] Test Run with placeholder IDs
- [x] Smoke Test for tool calls
- [x] Versions activity log
- [x] OpenAI REST toggle
- [x] Console-style logs
- [x] Collapsible output panels

### **Phase 2: Enhanced Testing**
- [ ] Custom test scenarios
- [ ] API response mocking
- [ ] Load testing mode
- [ ] Performance metrics

### **Phase 3: Advanced Debugging**
- [ ] Request replay functionality
- [ ] Tool call inspector
- [ ] Response diff viewer
- [ ] Error analytics dashboard

---

## 📚 Related Documentation

- [Proposal Agent Runner Implementation](/PROPOSAL_AGENT_RUNNER_IMPLEMENTATION.md)
- [Version Management System](/PROPOSAL_VERSION_SWITCHER_IMPLEMENTATION.md)
- [Content Builder Guide](/PROPOSAL_CONTENT_BUILDER_GUIDE.md)

---

## ✅ Status

**Implementation**: ✅ Complete  
**Testing**: Ready for QA  
**Location**: Admin → Agent → Proposal Builder  
**Date**: October 16, 2025
