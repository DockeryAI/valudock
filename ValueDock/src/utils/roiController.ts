/**
 * Central ROI Controller - Single Source of Truth for ROI Calculations
 * 
 * This controller ensures:
 * 1. ROI only runs ONCE after both data and cost classification are loaded
 * 2. Debouncing prevents rapid re-fires
 * 3. All ROI calculations route through this controller
 * 4. No dummy data - errors propagate properly
 * 5. Hard-gates ROI at the boundary - no execution without classification
 * 6. Uses ROI service facade - NEVER calls calculateROI directly
 */

import { ROI, type ROIContext } from '../services/roi';
import type { InputData } from '../components/utils/calculations';

const MIN_RE_RUN_MS = 200; // debounce threshold

interface ROIState {
  readyForROI: boolean;
  lastRunAt?: number;
  running?: boolean;
}

export interface ROIControllerState {
  processCount: number;
  selectedCount: number;
  costClassificationLoaded: boolean;
  dataReadyForROI: boolean;
  costClassification: any;
  orgId?: string | null;
  hardCosts?: string[];
  softCosts?: string[];
}

const now = () => Date.now();

let currentROIState: ROIState = {
  readyForROI: false,
  lastRunAt: undefined,
  running: false,
};

/**
 * Check if ROI is ready to run
 * Requires BOTH data ready AND cost classification loaded AND not null/undefined
 */
export function isROIReady(state: ROIControllerState): boolean {
  const dataReady = state.processCount >= 0 && state.dataReadyForROI;
  const clsReady = state.costClassificationLoaded === true && 
                   state.costClassification !== null && 
                   state.costClassification !== undefined &&
                   typeof state.costClassification === 'object';
  
  return dataReady && clsReady;
}

/**
 * Schedule ROI calculation
 * This is the ONLY function that should trigger ROI calculations
 * 
 * @param reason - Debug string explaining why ROI is being scheduled
 * @param state - Current application state
 * @param filteredData - Data to calculate ROI for
 * @param timeHorizonMonths - Time horizon for calculations
 * @returns ROI results if calculated, null if blocked
 */
export function scheduleROI(
  reason: string,
  state: ROIControllerState,
  filteredData: InputData,
  timeHorizonMonths: number,
): any | null {
  // Build context for ROI service
  const context: ROIContext = {
    orgId: state.orgId ?? null,
    costClassificationLoaded: state.costClassificationLoaded,
    costClassification: state.costClassification,
    dataReadyForROI: state.dataReadyForROI,
    processCount: state.processCount,
  };

  // Check readiness via ROI service
  const readyForROI = ROI.canRun(context);
  currentROIState.readyForROI = readyForROI;

  // Block if not ready (ROI.canRun already logged details)
  if (!readyForROI) {
    console.log('[ROI Controller] 🚫 BLOCKED by ROI service', { reason });
    return null;
  }

  // Block if already running
  if (currentROIState.running) {
    console.log('[ROI Controller] 🚫 SKIP (already running)', { reason });
    return null;
  }

  // Block if too soon (debounce)
  const last = currentROIState.lastRunAt ?? 0;
  if (now() - last < MIN_RE_RUN_MS) {
    console.log('[ROI Controller] 🚫 SKIP (debounce)', {
      reason,
      timeSinceLastRun: now() - last,
      threshold: MIN_RE_RUN_MS,
    });
    return null;
  }

  // Mark as running
  currentROIState.running = true;

  console.log('[ROI Controller] 🎯 SCHEDULING ROI', {
    reason,
    processCount: state.processCount,
    selectedCount: state.selectedCount,
    orgId: state.orgId,
    costClassificationLoaded: state.costClassificationLoaded,
  });

  try {
    // Call ROI service - this is the ONLY approved way to calculate ROI
    const results = ROI.run(context, filteredData, timeHorizonMonths);
    
    if (results) {
      console.log('[ROI Controller] ✅ COMPLETE', {
        reason,
        annualNetSavings: results.annualNetSavings,
        processResultsCount: results.processResults?.length || 0,
        totalFTEsFreed: results.totalFTEsFreed,
        npv: results.npv,
      });
    } else {
      console.log('[ROI Controller] ⚠️ ROI service returned null', { reason });
    }
    
    return results;
  } catch (error) {
    console.error('[ROI Controller] ❌ ERROR', { reason, error });
    throw error; // Propagate error - no fallbacks
  } finally {
    // Mark as complete
    currentROIState.running = false;
    currentROIState.lastRunAt = now();
  }
}

/**
 * Reset ROI controller state
 * Use when switching organizations or contexts
 */
export function resetROIController(): void {
  console.log('[ROI Controller] 🔄 RESET');
  currentROIState = {
    readyForROI: false,
    lastRunAt: undefined,
    running: false,
  };
}

/**
 * Get current ROI controller state (for debugging)
 */
export function getROIControllerState(): ROIState {
  return { ...currentROIState };
}
