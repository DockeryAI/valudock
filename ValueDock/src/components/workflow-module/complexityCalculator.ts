/**
 * Workflow Complexity Calculator
 * Automatically gathers complexity metrics from workflow data
 */

import { FlowNode, Connection } from './types';
import { normalizeInputsScore, normalizeStepsScore, normalizeDependenciesScore } from '../utils/calculations';

export interface ComplexityMetrics {
  inputsCount: number;
  stepsCount: number;
  dependenciesCount: number;
  inputsScore: number;
  stepsScore: number;
  dependenciesScore: number;
}

/**
 * Calculate complexity metrics from workflow data
 */
export function calculateWorkflowComplexity(
  nodes: FlowNode[],
  connections: Connection[]
): ComplexityMetrics {
  // Count inputs: unique triggers + inputs across all nodes
  // Triggers count as inputs for risk scoring
  const allTriggers = new Set<string>();
  const allInputs = new Set<string>();
  
  nodes.forEach(node => {
    // Count triggers from each node
    if (node.config?.triggers && Array.isArray(node.config.triggers)) {
      node.config.triggers.forEach(trigger => {
        if (trigger.trim()) allTriggers.add(trigger.trim().toLowerCase());
      });
    }
    
    // Count inputs from each node
    if (node.config?.inputs && Array.isArray(node.config.inputs)) {
      node.config.inputs.forEach(input => {
        if (input.trim()) allInputs.add(input.trim().toLowerCase());
      });
    }
    
    // Legacy: also count nodes marked as input nodes
    if (node.config?.isInputNode === true) {
      allInputs.add(node.id);
    }
  });
  
  // Total inputs = triggers + inputs
  const inputsCount = allTriggers.size + allInputs.size;
  
  // Count steps: total number of nodes (excluding start and end)
  const stepsCount = nodes.filter(node => 
    node.type !== 'start' && node.type !== 'end'
  ).length;
  
  // Count dependencies: unique dependencies across all nodes
  const allDependencies = new Set<string>();
  
  nodes.forEach(node => {
    // Count from new dependencies field
    if (node.config?.dependencies && Array.isArray(node.config.dependencies)) {
      node.config.dependencies.forEach(dep => {
        if (dep.trim()) allDependencies.add(dep.trim().toLowerCase());
      });
    }
    
    // Legacy: also count from responsibleTeam
    if (node.config?.responsibleTeam && node.config.responsibleTeam.trim() !== '') {
      allDependencies.add(node.config.responsibleTeam.trim().toLowerCase());
    }
  });
  
  const dependenciesCount = allDependencies.size;
  
  // Normalize scores
  const inputsScore = normalizeInputsScore(inputsCount);
  const stepsScore = normalizeStepsScore(stepsCount);
  const dependenciesScore = normalizeDependenciesScore(dependenciesCount);
  
  return {
    inputsCount,
    stepsCount,
    dependenciesCount,
    inputsScore,
    stepsScore,
    dependenciesScore
  };
}

/**
 * Get list of all unique teams in workflow
 */
export function getWorkflowTeams(nodes: FlowNode[]): string[] {
  const teams = new Set<string>();
  nodes.forEach(node => {
    if (node.config?.responsibleTeam && node.config.responsibleTeam.trim() !== '') {
      teams.add(node.config.responsibleTeam.trim());
    }
  });
  return Array.from(teams).sort();
}

/**
 * Get list of all input nodes
 */
export function getInputNodes(nodes: FlowNode[]): FlowNode[] {
  return nodes.filter(node => node.config?.isInputNode === true);
}
