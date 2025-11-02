/**
 * ROI Boundary Guard - Hard Gate Pattern
 * 
 * This module enforces a strict boundary around ROI calculations.
 * NO ROI calculation can proceed without:
 * 1. Valid organization context (orgId)
 * 2. Cost classification loaded and valid
 * 3. Data ready for calculation
 * 
 * This is the FIRST line of defense against rogue ROI calls.
 */

export interface ROIArgs {
  processCount: number;
  selectedCount: number;
  costClassification?: {
    orgId?: string | null;
    hardCostsCount?: number;
    softCostsCount?: number;
    status?: string;
    hardCosts?: string[];
    softCosts?: string[];
  };
  allowDefault?: boolean; // ONLY for testing - never true in production
}

export interface ROIContext {
  orgId: string | null;
  costClassificationLoaded: boolean;
  costClassification: any;
  dataReadyForROI: boolean;
  processCount: number;
}

/**
 * Hard gate function - BLOCKS ROI unless ALL conditions are met
 * 
 * Returns the args if valid, null if blocked
 */
export function guardROI(args: ROIArgs, context: ROIContext): ROIArgs | null {
  const contextReady = !!context.orgId;
  const clsReady = context.costClassificationLoaded === true;
  const clsValid = context.costClassification !== null && 
                   context.costClassification !== undefined &&
                   typeof context.costClassification === 'object';
  const dataReady = context.dataReadyForROI === true;

  // Log blocking reason if any condition fails
  if (!contextReady || !clsReady || !clsValid || !dataReady) {
    console.warn('[ROI Boundary] 🚫 BLOCKED', {
      contextReady,
      clsReady,
      clsValid,
      dataReady,
      allowDefault: !!args?.allowDefault,
      blockReason: !contextReady 
        ? 'No organization context (orgId is null)' 
        : !clsReady 
          ? 'Cost classification not loaded (flag false)'
          : !clsValid
            ? 'Cost classification is null/undefined/invalid'
            : !dataReady
              ? 'Data not ready for ROI calculation'
              : 'Unknown reason',
    });
    return null;
  }

  // All checks passed - allow ROI to proceed
  return args;
}

/**
 * Validation helper - checks if cost classification is valid
 */
export function isValidCostClassification(cls: any): boolean {
  if (!cls || cls === null || cls === undefined) return false;
  if (typeof cls !== 'object') return false;
  
  // Must have hardCosts and softCosts arrays
  if (!Array.isArray(cls.hardCosts) || !Array.isArray(cls.softCosts)) return false;
  
  return true;
}

/**
 * Build enriched cost classification for ROI calculation
 * This ensures we always pass complete classification data
 */
export function buildEnrichedClassification(
  costClassification: any,
  orgId: string | null,
): any {
  if (!costClassification) return null;
  
  return {
    ...costClassification,
    orgId: orgId,
    hardCostsCount: costClassification.hardCosts?.length ?? 0,
    softCostsCount: costClassification.softCosts?.length ?? 0,
    status: 'CUSTOM (loaded from backend)',
  };
}
