/**
 * Multi-Tenant Admin Module - Authentication Utilities
 */

import { createClient } from "@supabase/supabase-js";
import type { UserProfile, MultiTenantConfig } from "../types";

let supabaseClient: any = null;
let config: MultiTenantConfig | null = null;

export function initializeAuth(
  configuration: MultiTenantConfig,
) {
  config = configuration;
  supabaseClient = createClient(
    `https://${configuration.projectId}.supabase.co`,
    // Note: This should be the public anon key, not service role
    Deno.env?.get?.("SUPABASE_ANON_KEY") || "",
  );
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error(
      "Auth not initialized. Call initializeAuth first.",
    );
  }
  return supabaseClient;
}

export function getConfig() {
  if (!config) {
    throw new Error(
      "Config not initialized. Call initializeAuth first.",
    );
  }
  return config;
}

// Sign in
export async function signIn(email: string, password: string) {
  try {
    const supabase = getSupabaseClient();
    console.log("[MultiTenant] Attempting sign in...");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      console.error("[MultiTenant] Auth error:", error);
      throw error;
    }

    if (!data.session) {
      console.error("[MultiTenant] No session returned");
      throw new Error("No session returned");
    }

    console.log(
      "[MultiTenant] Successfully signed in, fetching profile...",
    );

    const profile = await fetchUserProfile(
      data.session.access_token,
    );

    return { success: true, session: data.session, profile };
  } catch (error: any) {
    console.error("[MultiTenant] Sign in error:", error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("[MultiTenant] Sign out error:", error);
    return { success: false, error: error.message };
  }
}

// Get current session
export async function getSession() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (data.session) {
      const profile = await fetchUserProfile(
        data.session.access_token,
      );
      return { session: data.session, profile };
    }

    return { session: null, profile: null };
  } catch (error: any) {
    console.error("[MultiTenant] Get session error:", error);
    return { session: null, profile: null };
  }
}

// Fetch user profile from backend
async function fetchUserProfile(
  accessToken: string,
): Promise<UserProfile | null> {
  try {
    const cfg = getConfig();
    console.log(
      "[MultiTenant] Fetching user profile from backend...",
    );

    const response = await fetch(
      `https://${cfg.projectId}.supabase.co/functions/v1${cfg.apiEndpoint}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[MultiTenant] Failed to fetch profile:",
        response.status,
        errorText,
      );
      throw new Error(
        `Failed to fetch profile: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log(
      "[MultiTenant] Profile fetched successfully:",
      data.profile?.email,
    );
    return data.profile;
  } catch (error: any) {
    console.error(
      "[MultiTenant] Error fetching profile:",
      error,
    );
    return null;
  }
}

// Check if user has required role
export function hasRole(
  profile: UserProfile | null,
  allowedRoles: string[],
): boolean {
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}

// Get permissions for a user
export function getUserPermissions(
  profile: UserProfile | null,
) {
  if (!profile) {
    return {
      canManageTenants: false,
      canManageOrganizations: false,
      canManageUsers: false,
      canViewBackups: false,
      canSwitchContext: false,
    };
  }

  const isMasterAdmin = profile.role === "master_admin";
  const isTenantAdmin = profile.role === "tenant_admin";
  const isOrgAdmin = profile.role === "org_admin";

  return {
    canManageTenants: isMasterAdmin,
    canManageOrganizations: isMasterAdmin || isTenantAdmin,
    canManageUsers:
      isMasterAdmin || isTenantAdmin || isOrgAdmin,
    canViewBackups:
      isMasterAdmin || isTenantAdmin || isOrgAdmin,
    canSwitchContext: isMasterAdmin || isTenantAdmin,
  };
}

// API call helper with auth
export async function apiCall(
  endpoint: string,
  options: RequestInit & { body?: any } = {},
) {
  console.log("[MultiTenant API] Endpoint:", endpoint);
  console.log(
    "[MultiTenant API] Method:",
    options.method || "GET",
  );

  const supabase = getSupabaseClient();
  const cfg = getConfig();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const { body, ...restOptions } = options;
  const requestOptions: RequestInit = {
    ...restOptions,
    headers,
  };

  if (body !== undefined) {
    requestOptions.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  const url = `https://${cfg.projectId}.supabase.co/functions/v1${cfg.apiEndpoint}${endpoint}`;

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[MultiTenant API] Error:", errorText);

    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || "Request failed");
    } catch (parseError) {
      throw new Error(errorText || "Request failed");
    }
  }

  return await response.json();
}