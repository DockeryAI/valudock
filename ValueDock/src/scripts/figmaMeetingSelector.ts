/**
 * ValueDock Fathom Meeting Selector - Figma Plugin Controller
 * 
 * Fetches Fathom meetings via proxy and maps them to text layers.
 * Built to CommonJS for Figma plugin compatibility.
 */

// Environment variable fallback
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

// In-memory cache for meetings
let meetingsCache: any[] = [];
let nextCursor: string | null = null;

// Show UI
figma.showUI(__html__, { width: 460, height: 560 });

// Message handlers
figma.ui.onmessage = async (msg) => {
  console.log('[Figma Plugin] Received message:', msg.type);

  try {
    switch (msg.type) {
      case 'get-proxy-url':
        await handleGetProxyUrl();
        break;

      case 'save-proxy-url':
        await handleSaveProxyUrl(msg.value);
        break;

      case 'fetch-meetings':
        await handleFetchMeetings(msg.payload, msg.cursor);
        break;

      case 'apply-meeting':
        await handleApplyMeeting(msg.meeting);
        break;

      default:
        console.warn('[Figma Plugin] Unknown message type:', msg.type);
    }
  } catch (error: any) {
    console.error('[Figma Plugin] Error handling message:', error);
    figma.notify(`Error: ${error.message}`, { error: true });
    figma.ui.postMessage({
      type: 'error',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Get stored proxy URL from client storage
 */
async function handleGetProxyUrl() {
  try {
    // First try environment variable
    if (PROXY_URL) {
      figma.ui.postMessage({
        type: 'proxy-url',
        value: PROXY_URL,
        source: 'env'
      });
      return;
    }

    // Fall back to stored value
    const storedUrl = await figma.clientStorage.getAsync('vd_proxy_url');
    figma.ui.postMessage({
      type: 'proxy-url',
      value: storedUrl || '',
      source: 'storage'
    });
  } catch (error: any) {
    console.error('[Figma Plugin] Error getting proxy URL:', error);
    figma.ui.postMessage({
      type: 'proxy-url',
      value: '',
      source: 'error'
    });
  }
}

/**
 * Save proxy URL to client storage
 */
async function handleSaveProxyUrl(value: string) {
  try {
    await figma.clientStorage.setAsync('vd_proxy_url', value);
    figma.notify('Proxy URL saved');
    console.log('[Figma Plugin] Proxy URL saved:', value);
  } catch (error: any) {
    console.error('[Figma Plugin] Error saving proxy URL:', error);
    figma.notify('Failed to save proxy URL', { error: true });
  }
}

/**
 * Fetch meetings from proxy
 */
async function handleFetchMeetings(payload: any, cursor: string | null) {
  console.log('[Figma Plugin] Fetching meetings with payload:', payload);

  // Validate domain
  if (!payload.domain || payload.domain.trim() === '') {
    figma.notify('Please enter a domain.', { error: true });
    figma.ui.postMessage({
      type: 'error',
      message: 'Please enter a domain.'
    });
    return;
  }

  // Get proxy URL
  let proxyUrl = PROXY_URL;
  if (!proxyUrl) {
    proxyUrl = await figma.clientStorage.getAsync('vd_proxy_url');
  }

  if (!proxyUrl) {
    figma.notify('Proxy URL required (set NEXT_PUBLIC_PROXY_URL or fill the field).', { error: true });
    figma.ui.postMessage({
      type: 'error',
      message: 'Proxy URL required (set NEXT_PUBLIC_PROXY_URL or fill the field).'
    });
    return;
  }

  // Show loading state
  figma.ui.postMessage({ type: 'loading', isLoading: true });

  try {
    // Build request payload
    const requestPayload = {
      domain: payload.domain.toLowerCase().trim(),
      aliases: (payload.aliases || []).map((a: string) => a.toLowerCase().trim()).filter(Boolean),
      emails: (payload.emails || []).map((e: string) => e.toLowerCase().trim()).filter(Boolean),
      since: payload.since || undefined,
      until: payload.until || undefined,
      limit: Math.min(Math.max(payload.limit || 50, 1), 100), // Clamp 1-100
      cursor: cursor || undefined
    };

    console.log('[Figma Plugin] Request payload:', requestPayload);

    // Make request
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('[Figma Plugin] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy failed: ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    console.log('[Figma Plugin] Response data:', data);

    // Extract meetings
    const items = data.items || [];
    const newCursor = data.next_cursor || null;
    const debug = data.debug || {};

    // If this is a new fetch (no cursor), reset cache
    if (!cursor) {
      meetingsCache = [];
      nextCursor = null;
    }

    // Append to cache
    meetingsCache = [...meetingsCache, ...items];
    nextCursor = newCursor;

    console.log('[Figma Plugin] Cache now has', meetingsCache.length, 'meetings');
    console.log('[Figma Plugin] Next cursor:', nextCursor);

    // Check if empty
    if (meetingsCache.length === 0) {
      figma.notify('No meetings found. Try adding emails or widening the date range.');
      figma.ui.postMessage({
        type: 'error',
        message: 'No meetings found. Try adding emails or widening the date range.'
      });
      figma.ui.postMessage({ type: 'loading', isLoading: false });
      return;
    }

    // Send to UI
    figma.ui.postMessage({
      type: 'meetings',
      items: meetingsCache,
      next_cursor: nextCursor,
      debug: debug
    });

    figma.notify(`Loaded ${meetingsCache.length} meeting${meetingsCache.length !== 1 ? 's' : ''}`);

  } catch (error: any) {
    console.error('[Figma Plugin] Fetch error:', error);
    figma.notify(`Error: ${error.message}`, { error: true });
    figma.ui.postMessage({
      type: 'error',
      message: error.message || 'Failed to fetch meetings'
    });
  } finally {
    figma.ui.postMessage({ type: 'loading', isLoading: false });
  }
}

/**
 * Apply meeting data to selected text layers
 */
async function handleApplyMeeting(meeting: any) {
  console.log('[Figma Plugin] Applying meeting to layers:', meeting);

  try {
    // Load Inter font (required for text manipulation)
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    // Find text nodes by exact name
    const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];

    const titleNode = textNodes.find(n => n.name === 'Title');
    const dateNode = textNodes.find(n => n.name === 'Date');
    const summaryNode = textNodes.find(n => n.name === 'Summary');
    const bulletsNode = textNodes.find(n => n.name === 'Bullets');
    const transcriptLinkNode = textNodes.find(n => n.name === 'TranscriptLink');

    let updatedCount = 0;

    // Update Title
    if (titleNode) {
      titleNode.characters = meeting.title || '';
      updatedCount++;
    }

    // Update Date (convert to local string)
    if (dateNode) {
      const date = meeting.date ? new Date(meeting.date) : new Date();
      dateNode.characters = date.toLocaleString();
      updatedCount++;
    }

    // Update Summary
    if (summaryNode) {
      const summaryText = meeting.summary?.trim() || '(No summary)';
      summaryNode.characters = summaryText;
      updatedCount++;
    }

    // Update Bullets (highlights)
    if (bulletsNode) {
      const highlights = meeting.highlights || [];
      if (highlights.length > 0) {
        bulletsNode.characters = highlights.map((h: string) => `• ${h}`).join('\n');
      } else {
        bulletsNode.characters = '';
      }
      updatedCount++;
    }

    // Update TranscriptLink
    if (transcriptLinkNode) {
      transcriptLinkNode.characters = meeting.transcript_url || meeting.share_url || '';
      updatedCount++;
    }

    if (updatedCount === 0) {
      figma.notify('No matching text layers found. Create layers named: Title, Date, Summary, Bullets, TranscriptLink', { 
        error: true,
        timeout: 5000
      });
    } else {
      figma.notify(`✓ Updated ${updatedCount} text layer${updatedCount !== 1 ? 's' : ''}`);
    }

    console.log('[Figma Plugin] Applied meeting to', updatedCount, 'layers');

  } catch (error: any) {
    console.error('[Figma Plugin] Error applying meeting:', error);
    figma.notify(`Error applying meeting: ${error.message}`, { error: true });
  }
}
