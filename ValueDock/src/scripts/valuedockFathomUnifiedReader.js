/**
 * ValueDock × Fathom — Unified Meeting Reader (CORS-safe)
 * 
 * This module provides a CORS-safe way to sync and read Fathom meeting summaries
 * from Supabase for use in Figma plugins and other client-side environments.
 * 
 * Usage in Figma plugin:
 * 1. Copy this entire code into your Figma plugin's JavaScript block
 * 2. Set environment variables (SUPABASE_URL required, SUPABASE_SERVICE_ROLE_KEY only if syncing)
 * 3. Call: const meetings = await valuedockFathomUnifiedReader()
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Set these as environment variables in your Figma plugin settings
  SUPABASE_URL: typeof SUPABASE_URL !== 'undefined' 
    ? SUPABASE_URL 
    : 'https://hpnxaentcrlditokrpyo.supabase.co',
  
  // Only needed if DO_SYNC_NOW is true
  SUPABASE_SERVICE_ROLE_KEY: typeof SUPABASE_SERVICE_ROLE_KEY !== 'undefined' 
    ? SUPABASE_SERVICE_ROLE_KEY 
    : '',
  
  // Set to true to sync meetings before reading
  DO_SYNC_NOW: typeof DO_SYNC_NOW !== 'undefined' 
    ? DO_SYNC_NOW 
    : false,
  
  // User ID for fetching meetings
  USER_ID: '1c89cea9-d2ac-4b36-bad8-e228ac79e4e0',
  
  // Default limit for number of meetings to fetch
  DEFAULT_LIMIT: 20
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
function safeJson(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ [JSON Parse Error]', error.message);
    return fallback;
  }
}

/**
 * Check if a value exists and is not null/undefined
 * @param {any} value - Value to check
 * @returns {boolean} True if value exists
 */
function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

// ============================================================================
// SYNC FUNCTION
// ============================================================================

/**
 * Sync meetings from Fathom API to Supabase
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set
 * @returns {Promise<Object>} Sync result
 */
async function syncMeetings() {
  const startTime = Date.now();
  console.log('🔄 [SYNC] Starting full sync...');
  console.log(`   User ID: ${CONFIG.USER_ID}`);
  
  if (!hasValue(CONFIG.SUPABASE_SERVICE_ROLE_KEY)) {
    console.error('❌ [SYNC] Service Role Key not configured');
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY not set'
    };
  }
  
  try {
    const url = `${CONFIG.SUPABASE_URL}/functions/v1/fathom-server?user_id=${CONFIG.USER_ID}&full_sync=true`;
    
    console.log(`   Endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SYNC] Failed:', response.status, response.statusText);
      console.error('   Error details:', errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    const data = await response.json();
    console.log(`✅ [SYNC] Complete in ${duration}ms`);
    console.log(`   Synced: ${data.count || 0} meeting(s)`);
    
    return {
      success: true,
      count: data.count || 0,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [SYNC] Network error after', duration + 'ms');
    console.error('   Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// READ FUNCTION
// ============================================================================

/**
 * Read meeting summaries from Supabase (CORS-safe, no auth required)
 * @param {number} limit - Maximum number of meetings to fetch (default: 20)
 * @returns {Promise<Array>} Array of meeting objects
 */
async function readSummaries(limit = CONFIG.DEFAULT_LIMIT) {
  const startTime = Date.now();
  console.log('📖 [READ] Fetching meeting summaries...');
  console.log(`   User ID: ${CONFIG.USER_ID}`);
  console.log(`   Limit: ${limit}`);
  
  if (!hasValue(CONFIG.SUPABASE_URL)) {
    console.error('❌ [READ] Supabase URL not configured');
    return [];
  }
  
  try {
    const url = `${CONFIG.SUPABASE_URL}/functions/v1/fathom-server?mode=read&user_id=${CONFIG.USER_ID}&limit=${limit}`;
    
    console.log(`   Endpoint: ${url}`);
    
    // CORS-safe fetch with no Authorization header
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [READ] Failed:', response.status, response.statusText);
      console.error('   Error details:', errorText);
      return [];
    }
    
    const data = await response.json();
    const meetings = data.meetings || [];
    
    console.log(`✅ [READ] Loaded ${meetings.length} meeting(s) in ${duration}ms`);
    
    // Log first meeting as sample
    if (meetings.length > 0) {
      console.log('   Sample meeting:', {
        id: meetings[0].meeting_id,
        title: meetings[0].title,
        date: meetings[0].start_time,
        hasSummary: hasValue(meetings[0].summary)
      });
    }
    
    return meetings;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [READ] Network error after', duration + 'ms');
    console.error('   Error:', error.message);
    return [];
  }
}

// ============================================================================
// MAIN WORKFLOW
// ============================================================================

/**
 * Main unified workflow: sync (if enabled) then read
 * @param {Object} options - Configuration options
 * @param {boolean} options.sync - Whether to sync before reading
 * @param {number} options.limit - Number of meetings to fetch
 * @returns {Promise<Object>} Result with meetings and sync status
 */
async function valuedockFathomUnifiedReader(options = {}) {
  const {
    sync = CONFIG.DO_SYNC_NOW,
    limit = CONFIG.DEFAULT_LIMIT
  } = options;
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 ValueDock × Fathom — Unified Meeting Reader');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Supabase URL: ${CONFIG.SUPABASE_URL}`);
  console.log(`   Sync enabled: ${sync}`);
  console.log(`   Read limit: ${limit}`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('');
  
  const result = {
    sync: null,
    meetings: [],
    timestamp: new Date().toISOString()
  };
  
  // Step 1: Sync if enabled
  if (sync) {
    result.sync = await syncMeetings();
    console.log('');
  }
  
  // Step 2: Always read summaries
  result.meetings = await readSummaries(limit);
  
  // Final summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Summary');
  console.log('═══════════════════════════════════════════════════════════');
  if (sync && result.sync) {
    console.log(`   Sync: ${result.sync.success ? '✅' : '❌'} ${result.sync.count || 0} meeting(s)`);
  }
  console.log(`   Read: ✅ ${result.meetings.length} meeting(s) loaded`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  return result;
}

// ============================================================================
// EXPORTS (for module environments)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    valuedockFathomUnifiedReader,
    syncMeetings,
    readSummaries,
    safeJson,
    hasValue,
    CONFIG
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Read only (no sync)
const result = await valuedockFathomUnifiedReader();
console.log(result.meetings);

// Example 2: Sync then read
const result = await valuedockFathomUnifiedReader({ sync: true, limit: 50 });
console.log('Synced:', result.sync.count);
console.log('Meetings:', result.meetings);

// Example 3: Read with custom limit
const result = await valuedockFathomUnifiedReader({ limit: 10 });
console.log('First 10 meetings:', result.meetings);

// Example 4: Direct function calls
const meetings = await readSummaries(20);
console.log(meetings);

const syncResult = await syncMeetings();
console.log('Sync successful:', syncResult.success);

*/
