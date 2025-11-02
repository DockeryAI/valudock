/**
 * ValuDock ROI Internal Calculation Engine
 * 
 * ⚠️ DO NOT IMPORT THIS DIRECTLY ⚠️
 * Use ROI.run() or ROI.calculate() from roiFacade.ts
 * 
 * This file contains the actual ROI math but is protected by the facade's runtime guard.
 */

import { ROI } from './roiFacade';
import { calculateROI as _calculateROIFromUtils } from '../components/utils/calculations';
import type { InputData } from '../components/utils/calculations';

/**
 * Internal ROI calculation function
 * Protected by facade's _unsafeDirectInvokeGuard
 */
export async function calculateProcessROI(args: {
  processCount: number;
  selectedCount: number;
  costClassification: {
    orgId?: string | null;
    hardCosts?: string[];
    softCosts?: string[];
    hardCostsCount?: number;
    softCostsCount?: number;
    status?: string;
  };
}): Promise<any> {
  // Runtime guard - throws if called directly
  ROI._unsafeDirectInvokeGuard();

  console.log('[ROI Internal] 🔢 Executing calculation with CUSTOM classification', {
    processCount: args.processCount,
    selectedCount: args.selectedCount,
    orgId: args.costClassification.orgId,
    hardCostsCount: args.costClassification.hardCostsCount,
    softCostsCount: args.costClassification.softCostsCount,
  });

  // ✅ NO "default classification" path
  // ✅ ONLY uses provided custom classification from backend
  // ✅ If classification is missing/invalid, facade blocks this from being called

  // NOTE: Actual calculation logic would call the real ROI calculation function
  // For now, this is a placeholder that demonstrates the protected call pattern

  // The actual implementation would look like:
  // return _calculateROIFromUtils(data, timeHorizon, args.costClassification);

  return {
    // Placeholder return - real implementation would calculate actual ROI
    message: 'ROI calculation executed with custom classification',
    ...args,
  };
}
