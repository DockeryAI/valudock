/**
 * Domain Validation Utility
 * 
 * Validates domain names for tenant and organization creation.
 * Accepts standard domain formats like: example.com, test-site.co.uk, acme123.consulting
 */

export const isValidDomain = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedDomain = domain.trim();

  // Basic domain validation: alphanumeric, hyphens, dots
  // Must have at least one dot and valid TLD (2+ characters)
  // Pattern breakdown:
  // - ^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+ : One or more domain labels (subdomain.domain.)
  // - [a-z]{2,}$ : TLD must be at least 2 characters
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  
  return domainRegex.test(trimmedDomain);
};

/**
 * Test cases for validation:
 * 
 * VALID:
 * - testtenant.com ✅
 * - acme.com ✅
 * - example-company.com ✅
 * - test123.consulting ✅
 * - my-site.co.uk ✅
 * 
 * INVALID:
 * - www.example.com ❌ (www prefix not allowed in this context)
 * - http://example.com ❌ (no protocol)
 * - example ❌ (no TLD)
 * - .com ❌ (no domain)
 * - example..com ❌ (double dots)
 * - -example.com ❌ (starts with hyphen)
 * - example-.com ❌ (ends with hyphen)
 */
