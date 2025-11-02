/**
 * Standalone Workflow Builder Component
 * 
 * This is a ready-to-use workflow builder that can be added anywhere in your app.
 * Simply import and render this component - no configuration needed!
 * 
 * USAGE:
 * 
 * ```tsx
 * import { StandaloneWorkflow } from './components/workflow-module/StandaloneWorkflow';
 * 
 * function MyApp() {
 *   const [showWorkflow, setShowWorkflow] = useState(false);
 * 
 *   return (
 *     <div>
 *       <button onClick={() => setShowWorkflow(true)}>
 *         Open Workflow Builder
 *       </button>
 * 
 *       {showWorkflow && (
 *         <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState } from 'react';
import { WorkflowBuilder } from './WorkflowBuilder';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import type { SavedWorkflow, WorkflowModuleConfig } from './types';

export interface StandaloneWorkflowProps {
  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;
  
  /**
   * Optional configuration for the workflow builder
   */
  config?: WorkflowModuleConfig;
  
  /**
   * Show close button (default: true)
   */
  showCloseButton?: boolean;
  
  /**
   * Full screen mode (default: true)
   */
  fullScreen?: boolean;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Process ID for this workflow
   */
  processId?: string;
  
  /**
   * Process name for this workflow
   */
  processName?: string;
  
  /**
   * Organization ID for this workflow
   */
  organizationId?: string;
  
  /**
   * Callback when complexity metrics are updated
   */
  onComplexityUpdate?: (complexity: {
    inputsCount: number;
    stepsCount: number;
    dependenciesCount: number;
    inputsScore: number;
    stepsScore: number;
    dependenciesScore: number;
  }) => void;
}

/**
 * Standalone Workflow Builder Component
 * 
 * A complete, self-contained workflow builder with:
 * - All 7 node types
 * - Drag and drop functionality
 * - Template system
 * - Save/load workflows
 * - Properties panel
 * - Undo/redo
 * 
 * Works out of the box with localStorage, or you can provide custom config.
 */
export function StandaloneWorkflow({
  onClose,
  config,
  showCloseButton = true,
  fullScreen = true,
  className = '',
  processId,
  processName,
  organizationId,
  onComplexityUpdate,
}: StandaloneWorkflowProps = {}) {
  const [workflowConfig] = useState<WorkflowModuleConfig>(() => {
    // If config is provided, use it
    if (config) {
      return config;
    }
    
    // Default config with localStorage and console logging
    return {
      onWorkflowSave: (workflow: SavedWorkflow) => {
        console.log('✅ Workflow saved:', workflow.name);
      },
      onWorkflowDeploy: (workflow: any, customerId?: string) => {
        console.log('🚀 Workflow deployed:', {
          workflowName: workflow.nodes?.find((n: any) => n.type === 'start')?.label || 'Workflow',
          customerId: customerId || 'default',
          nodeCount: workflow.nodes?.length || 0,
        });
      },
      onTemplateCreate: (template: any) => {
        console.log('📋 Template created:', template.name);
      },
      ui: {
        showDeployButton: true,
        showTemplateButtons: true,
        showDocumentLibrary: false, // Disable by default for standalone
      },
    };
  });

  const containerClass = fullScreen
    ? `fixed inset-0 z-50 bg-white ${className}`
    : `relative h-full ${className}`;

  return (
    <div className={containerClass}>
      {/* Workflow Builder */}
      <div className="h-full">
        <WorkflowBuilder 
          config={workflowConfig}
          onClose={onClose}
          processId={processId}
          processName={processName}
          organizationId={organizationId}
          onComplexityUpdate={onComplexityUpdate}
        />
      </div>
    </div>
  );
}

/**
 * EXAMPLES:
 * 
 * 1. Basic usage with button:
 * 
 * ```tsx
 * function App() {
 *   const [showWorkflow, setShowWorkflow] = useState(false);
 * 
 *   return (
 *     <>
 *       <button onClick={() => setShowWorkflow(true)}>
 *         Create Workflow
 *       </button>
 * 
 *       {showWorkflow && (
 *         <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * 2. With custom callbacks:
 * 
 * ```tsx
 * <StandaloneWorkflow
 *   onClose={() => setShowWorkflow(false)}
 *   config={{
 *     onWorkflowSave: async (workflow) => {
 *       await saveToBackend(workflow);
 *       alert('Workflow saved!');
 *     },
 *     onWorkflowDeploy: async (workflow, customerId) => {
 *       await deployToCustomer(workflow, customerId);
 *       alert('Workflow deployed!');
 *     },
 *   }}
 * />
 * ```
 * 
 * 3. Embedded (not full screen):
 * 
 * ```tsx
 * <div className="h-screen">
 *   <StandaloneWorkflow
 *     fullScreen={false}
 *     showCloseButton={false}
 *   />
 * </div>
 * ```
 * 
 * 4. With custom storage:
 * 
 * ```tsx
 * <StandaloneWorkflow
 *   config={{
 *     storage: {
 *       saveWorkflow: async (w) => { await api.saveWorkflow(w); },
 *       loadWorkflows: async () => { return await api.getWorkflows(); },
 *       saveTemplate: async (t) => { await api.saveTemplate(t); },
 *       loadTemplates: async () => { return await api.getTemplates(); },
 *     },
 *   }}
 * />
 * ```
 */
