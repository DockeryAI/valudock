/**
 * Demo Mode Detection
 * 
 * Detects if an organization is in demo mode based on domain matching.
 * Demo domains are configured via environment variable.
 */

/**
 * Check if a domain is in the demo domains list
 */
export function isDemoDomain(domain?: string | null): boolean {
  if (!domain) return false;
  
  const demoDomains = (import.meta.env?.VITE_DEMO_DOMAINS ?? 'phoenixinsurance.com')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  
  return demoDomains.includes(domain.toLowerCase());
}

/**
 * Check if demo mode is enabled for an organization
 * 
 * Demo mode can be enabled in two ways:
 * 1. VITE_FORCE_DEMO=1 - Forces demo mode for all orgs
 * 2. Organization domain matches VITE_DEMO_DOMAINS list
 */
export function demoModeEnabledForOrg(org: { domain?: string | null } | null | undefined): boolean {
  const forced = (import.meta.env?.VITE_FORCE_DEMO === '1');
  return forced || isDemoDomain(org?.domain);
}

/**
 * Get demo mode configuration
 */
export function getDemoConfig(): {
  forced: boolean;
  domains: string[];
  enabled: (org: any) => boolean;
} {
  const forced = (import.meta.env?.VITE_FORCE_DEMO === '1');
  const domains = (import.meta.env?.VITE_DEMO_DOMAINS ?? 'phoenixinsurance.com')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  
  return {
    forced,
    domains,
    enabled: demoModeEnabledForOrg,
  };
}
