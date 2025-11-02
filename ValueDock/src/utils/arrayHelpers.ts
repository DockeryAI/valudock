/**
 * Array normalization utilities to prevent "not an array" validation errors
 * 
 * These helpers ensure that values that should be arrays are always treated as arrays,
 * even when the data source might return unexpected formats (numbers, null, undefined, etc.)
 */

/**
 * Safely converts any value to an array
 * - If already an array, returns as-is
 * - If null/undefined, returns empty array
 * - If number (especially 0 from .length), returns empty array to prevent wrapping [0]
 * - Otherwise wraps single value in array
 */
export function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  // Numbers like 0 should NOT be wrapped into [0] for ID arrays -> reject/empty
  if (typeof v === 'number') return [];
  return [v as T];
}

/**
 * Validates that a value is an array and returns it, or returns a default empty array
 * More strict than asArray - only accepts actual arrays
 */
export function ensureArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Validates and normalizes array fields in an object
 * Useful for API responses where certain fields must be arrays
 */
export function normalizeArrayFields<T extends Record<string, any>>(
  obj: T,
  arrayFields: (keyof T)[],
): T {
  const normalized = { ...obj };
  
  for (const field of arrayFields) {
    if (field in normalized) {
      normalized[field] = ensureArray(normalized[field]);
    }
  }
  
  return normalized;
}

/**
 * Type guard to check if value is a non-empty array
 */
export function isNonEmptyArray<T>(v: unknown): v is T[] {
  return Array.isArray(v) && v.length > 0;
}

/**
 * Safely extracts IDs from an array of objects
 */
export function extractIds<T extends { id: string }>(items: unknown): string[] {
  const arr = ensureArray<T>(items);
  return arr
    .filter((item): item is T => typeof item === 'object' && item !== null && 'id' in item)
    .map(item => item.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * Debug helper to log array validation info
 */
export function debugArray(label: string, v: unknown): void {
  console.log(`[Array Debug] ${label}:`, {
    type: typeof v,
    isArray: Array.isArray(v),
    value: Array.isArray(v) ? `Array(${v.length})` : v,
    sample: Array.isArray(v) && v.length > 0 ? v.slice(0, 3) : undefined,
  });
}

/**
 * Runtime assertion to catch array/number swaps
 * THROWS ERROR if value is not an array - NO FALLBACKS
 */
export function assertArray<T>(name: string, v: unknown): T[] {
  if (!Array.isArray(v)) {
    const error = `[assertArray] ❌ ${name} expected array, got ${typeof v}: ${JSON.stringify(v)}`;
    console.error(error);
    throw new Error(error);
  }
  return v as T[];
}

/**
 * Must-be-array validator - ERRORS with detailed context if not an array
 * Use this at component boundaries to catch prop validation issues
 */
export function mustArray<T>(name: string, v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  const error = `[mustArray] ❌ ${name} expected array, got ${typeof v}: ${JSON.stringify(v)}`;
  console.error(error);
  throw new Error(error);
}

/**
 * Validates that an object's critical array fields are actually arrays (not counts)
 * THROWS ERROR if any field is a number (which indicates key collision)
 */
export function validateArrayFieldsNotCounts(
  obj: any,
  fieldNames: string[],
  context: string
): void {
  const errors: string[] = [];
  
  for (const field of fieldNames) {
    const value = obj?.[field];
    
    // Check if the field exists but is a number (count) instead of an array
    if (value !== undefined && value !== null) {
      if (typeof value === 'number') {
        errors.push(`${field} is a NUMBER (${value}) instead of an array`);
      } else if (!Array.isArray(value)) {
        errors.push(`${field} is ${typeof value} instead of an array`);
      }
    }
  }
  
  if (errors.length > 0) {
    const errorMsg = `[validateArrayFieldsNotCounts] ❌ KEY COLLISION DETECTED in ${context}:\n${errors.map(e => `  - ${e}`).join('\n')}\n  This indicates a state update is using count keys (groups, processes) instead of distinct keys (groupCount, processCount)`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Extract selected process IDs from process array
 * Returns array of IDs where process.selected === true
 * Accepts unknown type to safely handle any input
 */
export function selectedIdsFromProcesses(
  procs: { id: string; selected?: boolean }[] | unknown
): string[] {
  return ensureArray<any>(procs)
    .filter(p => p?.selected === true)
    .map(p => p.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}
