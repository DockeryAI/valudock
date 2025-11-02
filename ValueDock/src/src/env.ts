/**
 * Environment variable access for Figma Make runtime
 * 
 * Safely accesses environment variables in contexts where import.meta may be stubbed or unavailable.
 */

type AnyObj = Record<string, any>;

function tryGetImportMetaEnv(): AnyObj | null {
  try {
    // Some Figma runtimes stub import.meta but not import.meta.env
    // Try to access import.meta safely
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env as AnyObj;
    }
    
    // Fallback to globalThis if available
    const global = globalThis as any;
    if (global.import?.meta?.env) {
      return global.import.meta.env;
    }
    
    return null;
  } catch {
    return null;
  }
}

export function getEnv(key: string, fallback?: string): string | undefined {
  const imEnv = tryGetImportMetaEnv();
  if (imEnv && typeof imEnv[key] === 'string') return imEnv[key] as string;

  // Window-level injection (if present)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win: any = (globalThis as any).window;
  if (win && win.__ENV__ && typeof win.__ENV__[key] === 'string') return win.__ENV__[key];

  return fallback;
}

export const FATHOM_PROXY_BASE =
  getEnv('VITE_FATHOM_PROXY_URL') ||
  getEnv('FATHOM_PROXY_URL');
