/**
 * ValuDock FSM Dev Shortcuts
 * 
 * Development tools for testing and debugging the state machine.
 * These can be called from the browser console or a dev-only panel.
 * 
 * Usage in console:
 *   window.DevFSM.selectOrg('some-org-id')
 *   window.DevFSM.forceROI()
 *   window.DevFSM.getPhase()
 */

import { dispatch, getPhase, getState } from './dispatcher';
import { getQueueLength, isProcessing } from './commandQueue';

export const DevFSM = {
  /**
   * Simulate selecting an organization
   */
  selectOrg(orgId: string | null) {
    console.log('[DevFSM] Selecting org:', orgId);
    dispatch({ type: 'SELECT_ORG', orgId });
  },

  /**
   * Simulate leaving a tab (cancels ongoing operations)
   */
  leaveTab() {
    console.log('[DevFSM] Leaving tab');
    dispatch({ type: 'LEAVE_TAB' });
  },

  /**
   * Force an ROI calculation (only works if in CLASS_READY_IDLE phase)
   */
  forceROI() {
    const phase = getPhase();
    console.log('[DevFSM] Force ROI request, current phase:', phase);
    dispatch({ type: 'REQUEST_ROI' });
  },

  /**
   * Get current FSM phase
   */
  getPhase() {
    const phase = getPhase();
    console.log('[DevFSM] Current phase:', phase);
    return phase;
  },

  /**
   * Get current app state
   */
  getState() {
    const state = getState();
    console.log('[DevFSM] Current state:', {
      orgId: state.orgId,
      processCount: state.processCount,
      selectedCount: state.selectedCount,
      costClassificationLoaded: state.costClassificationLoaded,
      phase: getPhase(),
    });
    return state;
  },

  /**
   * Get command queue status
   */
  getQueueStatus() {
    const status = {
      length: getQueueLength(),
      processing: isProcessing(),
    };
    console.log('[DevFSM] Queue status:', status);
    return status;
  },

  /**
   * Complete diagnostic report
   */
  diagnose() {
    const state = getState();
    const phase = getPhase();
    const queue = {
      length: getQueueLength(),
      processing: isProcessing(),
    };

    const report = {
      phase,
      state: {
        orgId: state.orgId,
        processCount: state.processCount,
        selectedCount: state.selectedCount,
        costClassificationLoaded: state.costClassificationLoaded,
        hardCostsCount: state.hardCosts?.length ?? 0,
        softCostsCount: state.softCosts?.length ?? 0,
      },
      queue,
      timestamp: new Date().toISOString(),
    };

    console.log('[DevFSM] Diagnostic Report:', report);
    return report;
  },
};

// Expose to window for console access (dev only)
if (typeof window !== 'undefined') {
  (window as any).DevFSM = DevFSM;
  console.log('[DevFSM] Dev shortcuts available: window.DevFSM');
}
