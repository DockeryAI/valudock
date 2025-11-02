import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'master_admin' | 'tenant_admin' | 'org_admin' | 'user';
  tenantId: string;
  organizationId?: string | null;
  groupIds?: string[]; // Array of group IDs the user is assigned to
  readOnly?: boolean; // If true, user can only view data, not edit
  createdAt: string;
  active: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
}

// Sign in
export async function signIn(email: string, password: string) {
  try {
    console.log('Attempting Supabase auth sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }

    if (!data.session) {
      console.error('No session returned from Supabase');
      throw new Error('No session returned');
    }

    console.log('Successfully signed in to Supabase, fetching profile...');
    
    // Fetch user profile from backend
    const profile = await fetchUserProfile(data.session.access_token);
    
    if (!profile) {
      console.warn('No profile found for user');
    }
    
    return { success: true, session: data.session, profile };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Get current session
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (data.session) {
      const profile = await fetchUserProfile(data.session.access_token);
      return { session: data.session, profile };
    }
    
    return { session: null, profile: null };
  } catch (error: any) {
    console.error('Get session error:', error);
    return { session: null, profile: null };
  }
}

// Fetch user profile from backend
async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching user profile from backend...');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch profile:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    console.log('Profile fetched successfully:', data.profile?.email);
    return data.profile;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(profile: UserProfile | null, allowedRoles: string[]): boolean {
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}

// API call helper with auth
export async function apiCall(endpoint: string, options: RequestInit & { body?: any } = {}) {
  console.log('========== API CALL ==========');
  console.log('Endpoint:', endpoint);
  console.log('Method:', options.method || 'GET');
  console.log('Body (before stringify):', options.body);
  
  // Get session and refresh if needed
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error(`Session error: ${sessionError.message}`);
  }
  
  // If no session, try to refresh
  if (!session) {
    console.log('No session found, attempting to refresh...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Refresh error:', refreshError);
      throw new Error('Authentication required - please sign in again');
    }
    
    if (!refreshedSession) {
      throw new Error('No valid session - please sign in again');
    }
    
    console.log('Session refreshed successfully');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
    console.log('Auth token present:', session.access_token.substring(0, 20) + '...');
    console.log('Token expires at:', session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown');
  } else {
    console.warn('No auth token available');
    throw new Error('No authentication token - please sign in again');
  }

  // Build request options with properly stringified body
  const { body, ...restOptions } = options;
  const requestOptions: RequestInit = {
    ...restOptions,
    headers,
  };

  // Stringify body if it exists and is not already a string
  if (body !== undefined) {
    requestOptions.body = typeof body === 'string' 
      ? body 
      : JSON.stringify(body);
    console.log('Body (after stringify):', requestOptions.body);
  }

  const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514${endpoint}`;
  console.log('Full URL:', url);

  const response = await fetch(url, requestOptions);
  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response text:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error('Error response JSON:', errorJson);
      throw new Error(errorJson.error || 'Request failed');
    } catch (parseError) {
      throw new Error(errorText || 'Request failed');
    }
  }

  const responseData = await response.json();
  console.log('Success response:', responseData);
  return responseData;
}