/**
 * ROI Service - Single Facade for ROI Calculations
 * 
 * This module provides the ONLY approved way to calculate ROI.
 * Direct imports of calculateROI or calculateProcessROI are FORBIDDEN.
 * 
 * All ROI calculations must go through ROI.run() which enforces:
 * - Boundary guards (via roiBoundary.ts)
 * - Cost classification validation
 * - Proper error handling
 */

import { calculateROI as _calculateROIInternal } from '../components/utils/calculations';
import type { InputData, CostClassification } from '../components/utils/calculations';
import { guardROI, buildEnrichedClassification, type ROIArgs, type ROIContext } from './roiBoundary';

/**
 * ROI Service - The ONLY way to run ROI calculations
 * 
 * ❌ DO NOT use calculateROI directly
 * ❌ DO NOT use calculateProcessROI directly
 * ✅ USE ROI.run() through the controller
 */
export const ROI = {
  /**
   * Run ROI calculation with full validation
   * 
   * This is the single entry point for all ROI calculations.
   * It will:
   * 1. Validate context via boundary guard
   * 2. Enrich cost classification data
   * 3. Call internal calculation function
   * 4. Handle errors gracefully
   * 
   * @param context - Application context (orgId, flags, etc.)
   * @param filteredData - Process data to calculate ROI for
   * @param timeHorizonMonths - Time horizon for financial projections
   * @returns ROI results or null if blocked
   */
  run(
    context: ROIContext,
    filteredData: InputData,
    timeHorizonMonths: number,
  ): any | null {
    // Build args for boundary guard
    const args: ROIArgs = {
      processCount: context.processCount,
      selectedCount: filteredData.processes.filter(p => p.selected).length,
      allowDefault: false, // NEVER allow defaults in production
    };

    // Hard gate - check if ROI is allowed to run
    const validatedArgs = guardROI(args, context);
    if (!validatedArgs) {
      // Blocked by boundary guard
      return null;
    }

    // Enrich classification with metadata
    const enrichedClassification = buildEnrichedClassification(
      context.costClassification,
      context.orgId,
    );

    // Validate enriched classification
    if (!enrichedClassification) {
      console.error('[ROI Service] ❌ Failed to enrich cost classification');
      return null;
    }

    console.log('[ROI Service] 🎯 Executing calculation', {
      processCount: filteredData.processes.length,
      selectedProcesses: filteredData.processes.filter(p => p.selected).length,
      timeHorizonMonths,
      classification: {
        hardCosts: enrichedClassification.hardCosts?.length ?? 0,
        softCosts: enrichedClassification.softCosts?.length ?? 0,
        orgId: enrichedClassification.orgId,
        status: enrichedClassification.status,
      },
    });

    try {
      // Call internal calculation with validated data
      // IMPORTANT: We GUARANTEE classification is never null/undefined here
      const results = _calculateROIInternal(
        filteredData,
        timeHorizonMonths,
        enrichedClassification,
      );

      console.log('[ROI Service] ✅ Calculation complete', {
        annualNetSavings: results.annualNetSavings,
        roi: results.roi,
        npv: results.npv,
        processResultsCount: results.processResults?.length ?? 0,
      });

      return results;
    } catch (error) {
      console.error('[ROI Service] ❌ Calculation error:', error);
      // Re-throw error - no silent failures
      throw error;
    }
  },

  /**
   * Check if ROI can run with current context
   * Use this for UI state (e.g., showing/hiding "calculating..." messages)
   */
  canRun(context: ROIContext): boolean {
    const args: ROIArgs = {
      processCount: context.processCount,
      selectedCount: 0, // Not used for canRun check
      allowDefault: false,
    };
    
    return guardROI(args, context) !== null;
  },

  /**
   * Calculate ROI without controller/debouncing
   * 
   * This is for local, ephemeral calculations (e.g., scenario analysis, what-if).
   * It still enforces boundary checks but doesn't go through the controller.
   * 
   * USE CASES:
   * - Scenario screen (what-if with different automation coverage)
   * - Sensitivity analysis (parameter adjustments)
   * - Results screen (local filtered calculations)
   * 
   * DO NOT USE for the main app-level ROI calculation (use scheduleROI instead)
   * 
   * @param data - Process data to calculate
   * @param timeHorizonMonths - Time horizon for projections
   * @param costClassification - Cost classification (must be valid)
   * @returns ROI results or null if classification invalid
   */
  calculate(
    data: InputData,
    timeHorizonMonths: number,
    costClassification: any,
  ): any | null {
    // Validate cost classification
    if (!costClassification || costClassification === null || costClassification === undefined) {
      console.warn('[ROI Service] ⚠️ calculate() called with invalid cost classification');
      return null;
    }

    // For local calculations, we don't enforce full context checks
    // (no orgId required, no dataReady flag)
    // But we do require valid classification

    console.log('[ROI Service] 📊 Local calculation (no controller)', {
      processCount: data.processes.length,
      selectedProcesses: data.processes.filter(p => p.selected).length,
      timeHorizonMonths,
      hasClassification: !!costClassification,
    });

    try {
      const results = _calculateROIInternal(
        data,
        timeHorizonMonths,
        costClassification,
      );

      return results;
    } catch (error) {
      console.error('[ROI Service] ❌ Local calculation error:', error);
      throw error;
    }
  },
};

/**
 * Re-export types for convenience
 */
export type { ROIContext, ROIArgs };
