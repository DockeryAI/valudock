/**
 * ValuDock ROI Facade
 * 
 * Single entry point for all ROI calculations.
 * This facade enforces that ROI can ONLY be calculated through the FSM dispatcher.
 * Direct calls to ROI calculation functions are blocked at both compile-time (ESLint) and runtime (trap).
 * 
 * Usage:
 * - From dispatcher: ROI.run() - Main ROI calculation triggered by state machine
 * - For scenarios: ROI.calculate() - Isolated calculation for what-if scenarios
 */

import { calculateProcessROI } from './roiInternal';

// Runtime lock to prevent unauthorized direct calls
let locked = false;

export const ROI = {
  /**
   * Main ROI calculation - called ONLY from dispatcher RUNNING_ROI phase
   * This reads from global state and updates ROI results
   */
  async run(context: {
    orgId: string | null;
    processCount: number;
    selectedCount: number;
    costClassificationLoaded: boolean;
    hardCosts: string[];
    softCosts: string[];
  }): Promise<void> {
    locked = true;
    
    try {
      if (!context.orgId || !context.costClassificationLoaded) {
        console.warn('[ROI Facade] ⚠️ Blocked: not ready', {
          orgId: context.orgId,
          costClassificationLoaded: context.costClassificationLoaded,
        });
        return;
      }

      const costClassification = {
        orgId: context.orgId,
        hardCosts: context.hardCosts,
        softCosts: context.softCosts,
        hardCostsCount: context.hardCosts?.length ?? 0,
        softCostsCount: context.softCosts?.length ?? 0,
        status: 'CUSTOM (loaded from backend)',
      };

      console.log('[ROI Facade] ✅ RUN (single canonical pass)', {
        processCount: context.processCount,
        selectedCount: context.selectedCount,
        hardCostsCount: costClassification.hardCostsCount,
        softCostsCount: costClassification.softCostsCount,
      });

      // Call internal ROI calculation (protected by guard)
      await calculateProcessROI({
        processCount: context.processCount,
        selectedCount: context.selectedCount,
        costClassification,
      });
    } finally {
      locked = false;
    }
  },

  /**
   * Isolated calculation for scenario analysis
   * Does NOT update global state, returns results directly
   */
  async calculate(params: {
    processCount: number;
    selectedCount: number;
    costClassification: any;
  }): Promise<any> {
    locked = true;
    
    try {
      console.log('[ROI Facade] 📊 Calculate (scenario mode)', {
        processCount: params.processCount,
        selectedCount: params.selectedCount,
      });

      return await calculateProcessROI(params);
    } finally {
      locked = false;
    }
  },

  /**
   * Runtime guard - throws if called outside of facade
   * This prevents any legacy direct calls from bypassing the FSM
   */
  _unsafeDirectInvokeGuard(): void {
    if (!locked) {
      const error = '[ROI Facade] ❌ Illegal direct call detected. Use dispatch(REQUEST_ROI) only.';
      console.error(error);
      throw new Error(error);
    }
  },
};
