/**
 * Multi-Tenant Admin Module - Validation Utilities
 */

/**
 * Validates domain format
 * - Alphanumeric with hyphens allowed
 * - Must have valid TLD
 * - Examples: example.com, my-company.co.uk
 */
export function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  
  // Basic domain validation: alphanumeric, hyphens, dots
  // Must have at least one dot and valid TLD
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * - Minimum 8 characters
 * - At least one number (optional but recommended)
 */
export function isValidPassword(password: string, requireNumber: boolean = false): boolean {
  if (!password || password.length < 8) return false;
  
  if (requireNumber) {
    return /\d/.test(password);
  }
  
  return true;
}

/**
 * Validates user name
 */
export function isValidName(name: string): boolean {
  if (!name) return false;
  return name.trim().length >= 2;
}

/**
 * Extracts domain from email
 * Example: john@example.com -> example.com
 */
export function extractDomainFromEmail(email: string): string {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase();
}

/**
 * Suggests email completion based on domain
 */
export function suggestEmailCompletion(partial: string, domain: string): string {
  if (!partial || !domain) return '';
  
  // If user typed "john@", suggest "john@domain.com"
  if (partial.includes('@') && !partial.includes('.')) {
    const [username] = partial.split('@');
    return `${username}@${domain}`;
  }
  
  return '';
}

/**
 * Sanitizes input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates role
 */
export function isValidRole(role: string): boolean {
  return ['master_admin', 'tenant_admin', 'org_admin', 'user'].includes(role);
}

/**
 * Checks if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
