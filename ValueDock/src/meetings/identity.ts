/**
 * Identity resolver (org → emails, with domain heuristics)
 * 
 * Resolves organization identity to get:
 * - User emails in the organization
 * - Organization domain
 * - Domain-based email wildcards
 */

import { ensureArray } from './merge';
import { apiCall } from '../utils/auth';

/**
 * Resolve organization identity for meeting queries
 * 
 * Returns:
 * - org: Full organization object
 * - emails: Array of user emails in this org
 * - domain: Organization domain (e.g., "acme.com")
 * - domainEmails: Domain wildcards (e.g., ["*@acme.com"])
 */
export async function resolveOrgIdentity(app: { orgId: string | null }) {
  console.log('[resolveOrgIdentity] 🔍 Resolving identity for org:', app.orgId);
  
  // 1) Load orgs list
  const orgsResponse = await apiCall('/admin/organizations', { method: 'GET' });
  const orgs = ensureArray<any>(orgsResponse?.organizations);
  const org = orgs.find((o: any) => o.id === app.orgId) ?? null;
  
  console.log('[resolveOrgIdentity] 📋 Organization found:', {
    id: org?.id,
    name: org?.name,
    domain: org?.domain,
  });

  // 2) User emails in org
  const usersResp = await apiCall('/admin/users', { method: 'GET' });
  const allUsers = ensureArray<any>(usersResp?.users);
  const orgUsers = allUsers.filter(u => u.organizationId === app.orgId);
  const emails = orgUsers
    .map(u => String(u.email).toLowerCase())
    .filter(Boolean);
  
  console.log('[resolveOrgIdentity] 👥 Users found:', {
    totalUsers: allUsers.length,
    orgUsers: orgUsers.length,
    emails: emails.slice(0, 5), // Sample
  });

  // 3) Domain heuristic
  const domain = org?.domain ? String(org.domain).toLowerCase() : null;
  const domainEmails = domain ? [`*@${domain}`] : [];
  
  console.log('[resolveOrgIdentity] ✅ Identity resolved:', {
    orgId: app.orgId,
    orgName: org?.name,
    domain,
    emailCount: emails.length,
    domainEmails,
  });

  return {
    org,
    emails,
    domain,
    domainEmails,
  };
}
