/**
 * Demo mode detector + bypass
 * 
 * Detects if organization is in demo mode based on domain.
 */

import { demoModeEnabledForOrg } from '../flags/demo';

/**
 * Check if organization should use demo data
 */
export function shouldUseDemo(org: any): boolean {
  return demoModeEnabledForOrg(org);
}

/**
 * Get demo mode status and details
 */
export function getDemoStatus(org: any): {
  enabled: boolean;
  reason: string;
  domain?: string;
} {
  const enabled = shouldUseDemo(org);
  
  if (!enabled) {
    return {
      enabled: false,
      reason: 'not_demo_domain',
    };
  }
  
  if (import.meta.env?.VITE_FORCE_DEMO === '1') {
    return {
      enabled: true,
      reason: 'forced_by_env',
      domain: org?.domain,
    };
  }
  
  return {
    enabled: true,
    reason: 'domain_match',
    domain: org?.domain,
  };
}
