/**
 * Fathom Raw API Proxy
 * 
 * This is a standalone Edge Function that proxies ANY Fathom API request.
 * Deploy this to an external Supabase project that doesn't have DNS restrictions.
 * 
 * Deployment:
 * 1. Deploy to external Supabase project: `supabase functions deploy fathom-proxy-raw`
 * 2. Configure environment variables on ValuDock:
 *    - VD_URL=https://your-external-project.supabase.co
 *    - VD_SERVICE_ROLE_KEY=your_service_role_key
 * 
 * Usage:
 * POST /functions/v1/fathom-proxy-raw
 * Body: { 
 *   url: "https://us-central1.gcp.api.fathom.video/v1/calls?...",
 *   method: "GET",
 *   headers: { "Authorization": "Bearer ...", ... }
 * }
 * Returns: Direct passthrough of Fathom API response
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
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
    console.log('[FATHOM-PROXY-RAW] Incoming request...');
    
    // Parse request body
    const body: ProxyRequest = await req.json();
    const { url, method = 'GET', headers = {}, body: requestBody } = body;
    
    if (!url) {
      console.error('[FATHOM-PROXY-RAW] Missing url parameter');
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`[FATHOM-PROXY-RAW] Proxying ${method} request to:`, url);
    
    // Call Fathom API with provided parameters
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && requestBody) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }
    
    const fathomResponse = await fetch(url, fetchOptions);
    
    if (!fathomResponse.ok) {
      const errorText = await fathomResponse.text();
      console.error(`[FATHOM-PROXY-RAW] Fathom API error (${fathomResponse.status}):`, errorText);
      
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
    
    // Get response data
    const data = await fathomResponse.json();
    
    console.log(`[FATHOM-PROXY-RAW] ✅ Success - returning ${JSON.stringify(data).length} bytes`);
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('[FATHOM-PROXY-RAW] Error:', error);
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
