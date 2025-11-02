# Gamma Integration Guide

## Overview

The Gamma Integration feature allows users to automatically convert their ValueDock® presentation content into polished, professional slide decks using Gamma.app's AI-powered presentation builder. The system generates content in outline format optimized for Gamma's processing.

## Architecture

```
User Input (PresentationScreen)
          ↓
Generate with AI (ChatGPT format)
          ↓
Convert to Outline Format
          ↓
Send to Gamma API
          ↓
Gamma Processing
          ↓
Preview Slides in App
          ↓
Export (PDF, PPTX, Google Slides)
```

## Key Components

### 1. GammaIntegration Component (`/components/GammaIntegration.tsx`)

**Purpose:** Manages the entire Gamma workflow including generation, preview, sync, and export.

**Props:**
- `presentationContent` (string): Outline-formatted content from ChatGPT
- `onGenerateSuccess` (callback): Optional callback when generation succeeds

**States:**
- `idle`: No Gamma presentation generated
- `sending`: Sending content to Gamma API
- `processing`: Gamma is building the presentation
- `success`: Presentation ready and previewed
- `error`: Generation or sync failed

**Key Features:**
- ✅ Status badges (Sending, Processing, Success, Error)
- ✅ Generate/Regenerate button
- ✅ Edit in Gamma (opens in new tab)
- ✅ Sync/Refresh from Gamma
- ✅ Slide thumbnail preview grid
- ✅ Export to PDF, PPTX, Google Slides
- ✅ Error handling and retry

### 2. Presentation Screen Integration

**Location:** `/components/PresentationScreen.tsx`

**New Functions:**

```typescript
generateGammaOutline(): string
```
Converts presentation data into outline format optimized for Gamma:
- Uses markdown headers (# and ##)
- Bullet points for sub-items
- Structured sections for each slide
- Includes all ROI metrics and business data

**State Management:**

```typescript
const [gammaOutlineContent, setGammaOutlineContent] = useState<string>('');
```

**Integration Point:**
- Preview tab → After "Generate with AI" button
- Only shows when `gammaOutlineContent` exists
- Conditionally rendered based on content availability

## Outline Format Structure

The system generates content in the following structure for optimal Gamma processing:

```markdown
# Slide Title
## Subtitle or Main Point
- Bullet point 1
- Bullet point 2
- Bullet point 3

# Next Slide Title
## Another Subtitle
- Detail A
- Detail B
```

### Generated Slides

The `generateGammaOutline()` function creates 12-13 slides:

1. **Title Slide**
   - Presentation title
   - Company name/website

2. **Executive Summary**
   - Business description
   - Solution summary

3. **Current Challenges**
   - Each challenge as a section
   - Impact statements
   - Aligned outcomes

4. **Business Goals**
   - Each goal as a section
   - Target outcomes
   - Deliverables

5. **Proposed Solution**
   - Automation strategy
   - Process count
   - Timeline overview

6. **Financial Impact**
   - ROI percentage
   - NPV (3-year)
   - IRR
   - Annual savings
   - Payback period

7. **Savings Breakdown**
   - Hard vs soft savings
   - FTEs freed
   - EBITDA impact

8. **Implementation Timeline**
   - Phased approach
   - Key milestones

9. **Phase 1 Starting Processes**
   - Selected starter processes
   - Automation coverage
   - Technology stack

10. **Investment Required**
    - Upfront development
    - Training costs
    - Monthly/annual costs

11. **Client Requirements**
    - Access needed
    - Point person
    - Time commitment

12. **About DockeryAI**
    - Background
    - Services

13. **Next Steps**
    - Recommended actions
    - Engagement plan

## User Experience Flow

### Step 1: Generate Presentation Content

```
[Presentation Screen] → [Preview Tab] → [Generate with AI Button]
```

**Action:** User clicks "Generate with AI"
**Result:** 
- Validates required fields
- Generates outline format content
- Sets `gammaOutlineContent` state
- Shows Gamma Integration component

### Step 2: Send to Gamma

```
[Gamma Integration Card] → [Generate in Gamma Button]
```

**States:**
1. **Idle:** Blue "Generate in Gamma" button
2. **Sending:** Badge shows "Sending to Gamma..." with spinner
3. **Processing:** Badge shows "Gamma is processing..." with spinner
4. **Success:** Badge shows "Draft received" with checkmark

**Backend Flow (Production):**
```javascript
POST /api/gamma/generate
Body: {
  content: gammaOutlineContent,
  format: "outline",
  settings: {
    theme: "professional",
    layout: "auto"
  }
}

Response: {
  presentationId: "abc123",
  url: "https://gamma.app/docs/presentation-abc123",
  slides: [...],
  status: "ready"
}
```

### Step 3: Preview Slides

```
[Gamma Preview Container] → Grid of Slide Thumbnails
```

**Visual Design:**
- 2-3 column responsive grid
- Each slide shows:
  - Slide number (top-left badge)
  - Slide title
  - Content preview (truncated)
  - Hover effect with "Edit in Gamma" icon

**Interaction:**
- Click any slide → Opens Gamma editor
- Hover → Shows overlay with external link icon

### Step 4: Sync/Edit

**Edit in Gamma:**
- Opens `gammaUrl` in new browser tab
- User can customize slides in Gamma's editor
- Changes persist in Gamma

**Sync Button:**
- Fetches latest version from Gamma API
- Updates slide preview
- Shows last sync time

### Step 5: Export

**Export Options:**
1. **Download PDF**
   - Calls Gamma API export endpoint
   - Downloads static PDF file
   
2. **Download PPTX**
   - Calls Gamma API export endpoint
   - Downloads editable PowerPoint file
   
3. **Send to Google Slides**
   - Creates Google Slides copy
   - Opens in user's Google Drive

## API Integration (Production)

### Required Gamma API Endpoints

**Note:** These are examples based on typical presentation API patterns. Actual Gamma API documentation should be consulted.

#### 1. Generate Presentation

```http
POST https://api.gamma.app/v1/presentations/generate
Authorization: Bearer {GAMMA_API_KEY}
Content-Type: application/json

{
  "content": "# Slide 1\n## Content...",
  "format": "markdown",
  "settings": {
    "theme": "professional",
    "aspectRatio": "16:9"
  }
}

Response 201 Created:
{
  "id": "pres_abc123",
  "url": "https://gamma.app/docs/pres_abc123",
  "status": "processing"
}
```

#### 2. Check Status

```http
GET https://api.gamma.app/v1/presentations/{presentationId}
Authorization: Bearer {GAMMA_API_KEY}

Response 200 OK:
{
  "id": "pres_abc123",
  "url": "https://gamma.app/docs/pres_abc123",
  "status": "ready",
  "slideCount": 12,
  "slides": [
    {
      "id": "slide_1",
      "title": "Executive Summary",
      "thumbnailUrl": "https://...",
      "order": 1
    }
  ]
}
```

#### 3. Export to PDF

```http
POST https://api.gamma.app/v1/presentations/{presentationId}/export
Authorization: Bearer {GAMMA_API_KEY}
Content-Type: application/json

{
  "format": "pdf",
  "quality": "high"
}

Response 200 OK:
{
  "downloadUrl": "https://...",
  "expiresAt": "2025-10-10T00:00:00Z"
}
```

#### 4. Export to PPTX

```http
POST https://api.gamma.app/v1/presentations/{presentationId}/export
Authorization: Bearer {GAMMA_API_KEY}
Content-Type: application/json

{
  "format": "pptx"
}

Response 200 OK:
{
  "downloadUrl": "https://...",
  "expiresAt": "2025-10-10T00:00:00Z"
}
```

#### 5. Share to Google Slides

```http
POST https://api.gamma.app/v1/presentations/{presentationId}/share
Authorization: Bearer {GAMMA_API_KEY}
Content-Type: application/json

{
  "platform": "google-slides",
  "userEmail": "user@example.com"
}

Response 200 OK:
{
  "googleSlidesUrl": "https://docs.google.com/presentation/d/...",
  "shareStatus": "success"
}
```

### Backend Implementation

**Server Route:** `/supabase/functions/server/index.tsx`

```typescript
// Add Gamma API integration
app.post('/make-server-888f4514/gamma/generate', async (c) => {
  const { content } = await c.req.json();
  const gammaApiKey = Deno.env.get('GAMMA_API_KEY');
  
  if (!gammaApiKey) {
    return c.json({ error: 'Gamma API key not configured' }, 500);
  }
  
  try {
    // Send to Gamma API
    const response = await fetch('https://api.gamma.app/v1/presentations/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gammaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        format: 'markdown',
        settings: {
          theme: 'professional',
          aspectRatio: '16:9'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Poll for completion
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.gamma.app/v1/presentations/${data.id}`,
        {
          headers: { 'Authorization': `Bearer ${gammaApiKey}` }
        }
      );
      
      const statusData = await statusResponse.json();
      status = statusData.status;
      
      if (status === 'ready') {
        return c.json(statusData);
      }
      
      attempts++;
    }
    
    if (status !== 'ready') {
      throw new Error('Gamma processing timeout');
    }
    
  } catch (error) {
    console.error('Gamma generation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add export endpoints
app.post('/make-server-888f4514/gamma/export/:presentationId', async (c) => {
  const { presentationId } = c.req.param();
  const { format } = await c.req.json();
  const gammaApiKey = Deno.env.get('GAMMA_API_KEY');
  
  // Similar implementation for export...
});
```

### Frontend Implementation

**Update GammaIntegration.tsx:**

```typescript
const handleGenerateInGamma = async () => {
  setStatus('sending');
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/gamma/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: presentationContent })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to generate in Gamma');
    }
    
    const data = await response.json();
    setGammaUrl(data.url);
    setSlides(data.slides);
    setStatus('success');
    
  } catch (error) {
    setStatus('error');
    setErrorMessage(error.message);
  }
};
```

## Environment Variables

Add to Supabase Secrets:

```bash
GAMMA_API_KEY=your_gamma_api_key_here
```

**To add in Lovable:**
```typescript
create_supabase_secret('GAMMA_API_KEY')
```

## Error Handling

### Error States

1. **No Content Available**
   ```
   Alert: "Please generate presentation content using ChatGPT first"
   Button: Disabled
   ```

2. **Gamma Service Unavailable**
   ```
   Badge: "Generation failed" (red)
   Alert: "Gamma service unavailable. Please try again later."
   Action: Retry button enabled
   ```

3. **Processing Timeout**
   ```
   Alert: "Gamma is taking longer than expected. Your presentation may still be processing."
   Action: Refresh button to check status
   ```

4. **Export Failed**
   ```
   Toast: "Failed to download PDF/PPTX"
   Action: Retry export
   ```

### Error Recovery

```typescript
// Automatic retry logic
const MAX_RETRIES = 3;
let retryCount = 0;

const generateWithRetry = async () => {
  try {
    await handleGenerateInGamma();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(generateWithRetry, 2000 * retryCount);
    } else {
      setStatus('error');
      setErrorMessage('Max retries exceeded');
    }
  }
};
```

## Testing Checklist

### UI/UX Testing

- [ ] "Generate with AI" button creates outline content
- [ ] Gamma Integration card appears after content generation
- [ ] "Generate in Gamma" button is disabled without content
- [ ] Status badges update correctly (Sending → Processing → Success)
- [ ] Slide preview grid renders with correct layout
- [ ] Slide thumbnails are clickable and open Gamma
- [ ] "Edit in Gamma" button opens in new tab
- [ ] "Sync" button refreshes slides
- [ ] Last sync time displays correctly
- [ ] Export buttons trigger appropriate actions
- [ ] Error states show appropriate messages
- [ ] Mobile responsive layout works

### Integration Testing

- [ ] Outline format is correctly generated
- [ ] All 12-13 slides have content
- [ ] ROI metrics are properly formatted
- [ ] Company data is included
- [ ] Process lists are accurate
- [ ] Timeline information is present
- [ ] API calls include proper authentication
- [ ] Response data is parsed correctly
- [ ] Error responses are handled gracefully

### Edge Cases

- [ ] Empty presentation data
- [ ] Missing optional fields
- [ ] Very long content (>10,000 characters)
- [ ] Special characters in content
- [ ] Network timeout during generation
- [ ] Gamma API rate limiting
- [ ] Concurrent generation requests
- [ ] Browser tab closed during processing

## Future Enhancements

### Phase 2 Features

1. **Custom Themes**
   - Let users select Gamma theme
   - Preview different color schemes
   - Save theme preferences

2. **Slide Customization**
   - Reorder slides before generation
   - Remove unwanted slides
   - Add custom slides

3. **Brand Integration**
   - Upload company logo
   - Use brand colors
   - Custom fonts

4. **Version History**
   - Save multiple versions
   - Compare versions
   - Restore previous versions

5. **Collaboration**
   - Share with team members
   - Real-time editing indicators
   - Comments and annotations

6. **Analytics**
   - Track presentation views
   - Time spent on each slide
   - Viewer engagement metrics

### Code Examples for Future Features

**Custom Theme Selection:**

```typescript
<Select
  value={selectedTheme}
  onValueChange={setSelectedTheme}
>
  <SelectTrigger>
    <SelectValue placeholder="Select theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="professional">Professional</SelectItem>
    <SelectItem value="modern">Modern</SelectItem>
    <SelectItem value="minimal">Minimal</SelectItem>
    <SelectItem value="bold">Bold</SelectItem>
  </SelectContent>
</Select>
```

**Slide Reordering:**

```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="slides">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {slides.map((slide, index) => (
          <Draggable key={slide.id} draggableId={slide.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {slide.title}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

## Summary

The Gamma Integration feature transforms ValueDock®'s detailed ROI presentations into beautiful, shareable slide decks with minimal effort. By generating content in outline format optimized for Gamma's AI processing, the system creates professional presentations that can be further customized, exported in multiple formats, and shared with stakeholders.

**Key Benefits:**
- ✅ Automated slide generation from ROI data
- ✅ Professional design without manual formatting
- ✅ Multiple export formats (PDF, PPTX, Google Slides)
- ✅ In-app preview before exporting
- ✅ Seamless editing in Gamma's platform
- ✅ Real-time sync capabilities

The feature is production-ready with mock data and designed for easy integration with the actual Gamma API once credentials are obtained.
