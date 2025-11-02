/**
 * Fathom API Proxy
 * 
 * This is a standalone Edge Function that proxies Fathom API requests.
 * Deploy this to an external Supabase project that doesn't have DNS restrictions.
 * 
 * Deployment:
 * 1. Deploy to external Supabase project: `supabase functions deploy fathom-proxy`
 * 2. Configure environment variables on ValuDock:
 *    - VD_URL=https://your-external-project.supabase.co
 *    - VD_SERVICE_ROLE_KEY=your_service_role_key
 *    - FATHOM_API_KEY=your_fathom_api_key
 * 
 * Usage:
 * POST /functions/v1/fathom-proxy
 * Body: { domain: "acme.com", fathomApiKey: "your_key" }
 * Returns: Array of meetings for the specified domain
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface FathomProxyRequest {
  domain: string;
  fathomApiKey: string;
}

interface FathomMeeting {
  id?: string;
  meeting_id?: string;
  title?: string;
  name?: string;
  date?: string;
  start_time?: string;
  attendees?: Array<{
    name?: string;
    email?: string;
  }>;
  transcript_url?: string;
  recording_url?: string;
  summary?: string;
  highlights?: string[];
  key_points?: string[];
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[FATHOM-PROXY] Incoming request...');
    
    // Parse request body
    const body: FathomProxyRequest = await req.json();
    const { domain, fathomApiKey } = body;
    
    if (!domain) {
      console.error('[FATHOM-PROXY] Missing domain parameter');
      return new Response(
        JSON.stringify({ error: 'Missing domain parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!fathomApiKey) {
      console.error('[FATHOM-PROXY] Missing fathomApiKey parameter');
      return new Response(
        JSON.stringify({ error: 'Missing fathomApiKey parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`[FATHOM-PROXY] Fetching meetings for domain: ${domain}`);
    
    // Call Fathom API
    const fathomResponse = await fetch('https://us.fathom.video/api/v1/meetings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fathomApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!fathomResponse.ok) {
      const errorText = await fathomResponse.text();
      console.error(`[FATHOM-PROXY] Fathom API error (${fathomResponse.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Fathom API error (${fathomResponse.status})`,
          details: errorText
        }),
        { 
          status: fathomResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await fathomResponse.json();
    const allMeetings: FathomMeeting[] = Array.isArray(data) ? data : (data.meetings || []);
    
    console.log(`[FATHOM-PROXY] Retrieved ${allMeetings.length} total meetings from Fathom`);
    
    // Filter meetings by domain - check attendees for matching domain
    const filteredMeetings = allMeetings.filter((meeting) => {
      if (!meeting.attendees || !Array.isArray(meeting.attendees)) {
        return false;
      }
      
      return meeting.attendees.some((attendee) => {
        if (!attendee.email) return false;
        return attendee.email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
      });
    });
    
    console.log(`[FATHOM-PROXY] Filtered to ${filteredMeetings.length} meetings for domain: ${domain}`);
    
    // Sort by date (most recent first)
    const sortedMeetings = filteredMeetings.sort((a, b) => {
      const dateA = new Date(a.date || a.start_time || 0).getTime();
      const dateB = new Date(b.date || b.start_time || 0).getTime();
      return dateB - dateA;
    });
    
    // Transform to consistent format
    const meetings = sortedMeetings.map((meeting) => ({
      id: meeting.id || meeting.meeting_id || '',
      title: meeting.title || meeting.name || 'Untitled Meeting',
      date: meeting.date || meeting.start_time || new Date().toISOString(),
      attendees: meeting.attendees || [],
      transcript_url: meeting.transcript_url || meeting.recording_url,
      summary: meeting.summary || '',
      highlights: meeting.highlights || meeting.key_points || []
    }));
    
    console.log(`[FATHOM-PROXY] ✅ Returning ${meetings.length} meetings`);
    
    return new Response(
      JSON.stringify(meetings),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('[FATHOM-PROXY] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
