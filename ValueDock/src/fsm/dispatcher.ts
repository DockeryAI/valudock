/**
 * ValuDock FSM Dispatcher
 * 
 * Central state machine coordinator that:
 * - Manages app phase transitions
 * - Queues side-effects (API calls, ROI calculations) 
 * - Prevents race conditions through serialization
 * - Ensures ROI only runs when data and classification are ready
 */

import { transition, type AppPhase, type AppEvent } from './appMachine';
import { enqueue } from './commandQueue';
import { ensureArray, mustArray, selectedIdsFromProcesses } from '../utils/arrayHelpers';
import { ROI } from '../services/roiFacade';
import { apiCall } from '../utils/auth';
import type { InputData } from '../components/utils/calculations';

// Current phase of the application
let phase: AppPhase = 'NO_ORG';

// State management - these would ideally come from a proper state manager
// For now, we'll use a simple object to track state
let appState: {
  orgId: string | null;
  groups: any[];
  groupCount: number;
  processes: any[];
  processCount: number;
  selectedProcessIds: string[];
  selectedCount: number;
  hardCosts: string[];
  softCosts: string[];
  costClassificationLoaded: boolean;
  costClassification: any;
  roiRunToken: string | null;
  setStateCallback?: (updates: any) => void;
} = {
  orgId: null,
  groups: [],
  groupCount: 0,
  processes: [],
  processCount: 0,
  selectedProcessIds: [],
  selectedCount: 0,
  hardCosts: [],
  softCosts: [],
  costClassificationLoaded: false,
  costClassification: null,
  roiRunToken: null,
};

/**
 * Get current FSM phase
 */
export function getPhase(): AppPhase {
  return phase;
}

/**
 * Initialize dispatcher with state callback
 * Call this once from App.tsx to connect the dispatcher to React state
 */
export function initDispatcher(setStateCallback: (updates: any) => void) {
  appState.setStateCallback = setStateCallback;
  console.log('[Dispatcher] Initialized with state callback');
}

/**
 * Get current app state (for reading)
 */
export function getState() {
  return { ...appState };
}

/**
 * Set app state (internal use only)
 */
function setState(updates: Partial<typeof appState>) {
  appState = { ...appState, ...updates };
  
  // Call React setState if connected
  if (appState.setStateCallback) {
    appState.setStateCallback(updates);
  }
}

/**
 * Dispatch an event to the state machine
 * This is the ONLY way to trigger state transitions
 */
export function dispatch(event: AppEvent): void {
  const prev = phase;
  const next = transition(prev, event);
  
  if (next === prev) {
    console.log('[FSM] No transition:', event.type, 'in', prev);
    return;
  }
  
  phase = next;
  console.log(`[FSM] ${prev} -> ${next} via ${event.type}`);

  // Execute side-effects based on the new phase
  switch (next) {
    case 'LOADING_DATA': {
      const orgId = (event.type === 'SELECT_ORG') ? event.orgId : appState.orgId;
      
      enqueue(async () => {
        if (!orgId) {
          console.warn('[FSM] No orgId to load data for');
          return;
        }

        console.log('[FSM] Loading data for org:', orgId);

        try {
          // Load processes and groups
          const resp = await apiCall(`/data/load?organizationId=${orgId}`, {
            method: 'GET',
          });

          if (!resp.success || !resp.data) {
            console.error('[FSM] Failed to load data:', resp);
            return;
          }

          const groups = ensureArray<any>(resp.data.groups);
          const processes = ensureArray<any>(resp.data.processes);
          const selectedIds = selectedIdsFromProcesses(processes);

          setState({
            orgId,
            groups,
            groupCount: groups.length,
            processes,
            processCount: processes.length,
            selectedProcessIds: selectedIds,
            selectedCount: selectedIds.length,
            costClassificationLoaded: false,
            costClassification: null,
          });

          console.log('[FSM] Data loaded:', {
            groupCount: groups.length,
            processCount: processes.length,
            selectedCount: selectedIds.length,
          });

          dispatch({ type: 'DATA_LOADED' });

          // Load cost classification
          console.log('[FSM] Loading cost classification for org:', orgId);
          const cls = await apiCall(`/cost-classification/${orgId}`, {
            method: 'GET',
          });

          if (cls.success && cls.classification) {
            const hardCosts = mustArray<string>('classification.hardCosts', cls.classification.hardCosts);
            const softCosts = mustArray<string>('classification.softCosts', cls.classification.softCosts);

            setState({
              hardCosts,
              softCosts,
              costClassificationLoaded: true,
              costClassification: {
                ...cls.classification,
                hardCosts,
                softCosts,
              },
            });

            console.log('[FSM] Cost classification loaded:', {
              hardCostsCount: hardCosts.length,
              softCostsCount: softCosts.length,
            });

            dispatch({ type: 'CLASS_LOADED' });
          } else {
            console.warn('[FSM] No cost classification found for org:', orgId);
            setState({
              costClassificationLoaded: false,
              costClassification: null,
            });
          }
        } catch (error) {
          console.error('[FSM] Error loading data:', error);
        }
      });
      break;
    }

    case 'CLASS_READY_IDLE': {
      // Auto-actions that run once classification is ready
      enqueue(async () => {
        const s = getState();
        
        // Auto-select all processes if none selected
        if ((s.selectedCount ?? 0) === 0 && (s.processCount ?? 0) > 0) {
          const ids = s.processes.map(p => p.id);
          setState({
            selectedProcessIds: ids,
            selectedCount: ids.length,
          });
          console.log('[FSM] Auto-selected all processes:', ids.length);
        }
        
        // Trigger ROI calculation
        dispatch({ type: 'REQUEST_ROI' });
      });
      break;
    }

    case 'RUNNING_ROI': {
      enqueue(async () => {
        const s = getState();
        
        // Create unique token to prevent duplicate runs
        const token = `${s.orgId}:${s.processCount}:${s.selectedCount}:${Date.now()}`;
        
        setState({
          roiRunToken: token,
        });

        console.log('[FSM] Starting ROI calculation with token:', token);

        try {
          await ROI.run({
            orgId: s.orgId,
            processCount: s.processCount,
            selectedCount: s.selectedCount,
            costClassificationLoaded: s.costClassificationLoaded,
            hardCosts: s.hardCosts,
            softCosts: s.softCosts,
          });

          // Check if token is still valid (not superseded by another run)
          const s2 = getState();
          if (s2.roiRunToken !== token) {
            console.log('[FSM] ROI run superseded, skipping state update');
            return;
          }

          dispatch({ type: 'ROI_DONE' });
        } catch (error) {
          console.error('[FSM] ROI calculation error:', error);
          dispatch({ type: 'ROI_DONE' }); // Still transition back to idle
        }
      });
      break;
    }
  }
}
