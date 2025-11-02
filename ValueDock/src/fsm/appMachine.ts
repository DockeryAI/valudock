/**
 * ValuDock Application Finite State Machine
 * 
 * This FSM enforces strict state transitions to prevent race conditions
 * and ensure ROI calculations only happen at the right time with valid data.
 * 
 * State Flow:
 * NO_ORG → LOADING_DATA → DATA_READY_NO_CLASS → CLASS_READY_IDLE → RUNNING_ROI → CLASS_READY_IDLE
 */

export type AppPhase =
  | 'NO_ORG'              // No organization selected
  | 'LOADING_DATA'        // Fetching processes/groups from backend
  | 'DATA_READY_NO_CLASS' // Data loaded, waiting for cost classification
  | 'CLASS_READY_IDLE'    // Classification loaded, ready for ROI
  | 'RUNNING_ROI';        // ROI calculation in progress

export type AppEvent =
  | { type: 'SELECT_ORG'; orgId: string | null }
  | { type: 'DATA_LOADED' }
  | { type: 'CLASS_LOADED' }
  | { type: 'REQUEST_ROI' }
  | { type: 'ROI_DONE' }
  | { type: 'LEAVE_TAB' };

export type AppContext = {
  orgId: string | null;
  processCount: number;
  selectedCount: number;
  costClassificationLoaded: boolean;
  // Anti-recursion token to prevent duplicate ROI runs
  roiRunToken?: string | null;
};

/**
 * Check if an event is valid in the current phase
 */
export function can(event: AppEvent['type'], phase: AppPhase): boolean {
  switch (phase) {
    case 'NO_ORG':
      return event === 'SELECT_ORG';
    
    case 'LOADING_DATA':
      return event === 'DATA_LOADED' || event === 'LEAVE_TAB' || event === 'SELECT_ORG';
    
    case 'DATA_READY_NO_CLASS':
      return event === 'CLASS_LOADED' || event === 'LEAVE_TAB' || event === 'SELECT_ORG';
    
    case 'CLASS_READY_IDLE':
      return event === 'REQUEST_ROI' || event === 'LEAVE_TAB' || event === 'SELECT_ORG';
    
    case 'RUNNING_ROI':
      return event === 'ROI_DONE' || event === 'LEAVE_TAB';
    
    default:
      return false;
  }
}

/**
 * Transition to a new phase based on the current phase and event
 */
export function transition(phase: AppPhase, event: AppEvent): AppPhase {
  if (!can(event.type, phase)) {
    console.warn(`[FSM] Invalid transition: ${event.type} in phase ${phase}`);
    return phase;
  }

  switch (phase) {
    case 'NO_ORG':
      if (event.type === 'SELECT_ORG') {
        return event.orgId ? 'LOADING_DATA' : 'NO_ORG';
      }
      break;

    case 'LOADING_DATA':
      if (event.type === 'DATA_LOADED') return 'DATA_READY_NO_CLASS';
      if (event.type === 'SELECT_ORG') return event.orgId ? 'LOADING_DATA' : 'NO_ORG';
      if (event.type === 'LEAVE_TAB') return 'LOADING_DATA';
      break;

    case 'DATA_READY_NO_CLASS':
      if (event.type === 'CLASS_LOADED') return 'CLASS_READY_IDLE';
      if (event.type === 'SELECT_ORG') return event.orgId ? 'LOADING_DATA' : 'NO_ORG';
      break;

    case 'CLASS_READY_IDLE':
      if (event.type === 'REQUEST_ROI') return 'RUNNING_ROI';
      if (event.type === 'SELECT_ORG') return event.orgId ? 'LOADING_DATA' : 'NO_ORG';
      break;

    case 'RUNNING_ROI':
      if (event.type === 'ROI_DONE') return 'CLASS_READY_IDLE';
      break;
  }

  return phase;
}
