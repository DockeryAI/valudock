/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║                    WORKFLOW MODULE v1.0.0                          ║
 * ║              Standalone Visual Workflow Builder                    ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 * 
 * A complete, production-ready drag-and-drop workflow builder for React
 * applications. Built for Figma Make projects but works anywhere.
 * 
 * ✨ FEATURES:
 * - 🎨 Drag-and-drop canvas with smart snapping
 * - 📦 7 node types (Start, End, Task, Decision, Input/Output, Document, Action)
 * - 🔗 Auto-routing connections with line insertion
 * - 📝 Template management system
 * - 💾 Save/load workflows (localStorage or custom backend)
 * - 📄 Document integration support
 * - ↩️ Full undo/redo history
 * - 🎯 Multi-select with Shift+Click
 * - ⚙️ Draggable properties panel
 * - 🚀 Deploy workflows to customers
 * 
 * 📚 DOCUMENTATION:
 * - README.md - Full API documentation and features
 * - SETUP.md - Step-by-step setup instructions
 * - INTEGRATION.md - Integration guides for different projects
 * - SimpleExample.tsx - 10+ usage examples
 * - CHECKLIST.md - Setup verification checklist
 * 
 * 🚀 QUICK START (NO DASHBOARD REQUIRED!):
 * 
 * 1. Basic usage - Just a button!
 * 
 *    ```tsx
 *    import { useState } from 'react';
 *    import { StandaloneWorkflow } from './components/workflow-module';
 *    
 *    function App() {
 *      const [showWorkflow, setShowWorkflow] = useState(false);
 *      
 *      return (
 *        <div>
 *          <button onClick={() => setShowWorkflow(true)}>
 *            Build Workflow
 *          </button>
 *          
 *          {showWorkflow && (
 *            <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
 *          )}
 *        </div>
 *      );
 *    }
 *    ```
 * 
 * 2. With callbacks:
 * 
 *    ```tsx
 *    <WorkflowModule
 *      config={{
 *        onWorkflowSave: (workflow) => {
 *          console.log('Saved:', workflow);
 *        },
 *        onWorkflowDeploy: (workflow, customerId) => {
 *          console.log('Deploying to:', customerId);
 *        },
 *      }}
 *    />
 *    ```
 * 
 * 3. With custom storage:
 * 
 *    ```tsx
 *    <WorkflowModule
 *      config={{
 *        storage: {
 *          saveWorkflow: async (w) => { await api.save(w); },
 *          loadWorkflows: async () => { return api.load(); },
 *          // ... saveTemplate, loadTemplates
 *        },
 *      }}
 *    />
 *    ```
 * 
 * 4. Full configuration:
 * 
 *    ```tsx
 *    <WorkflowModule
 *      config={{
 *        supabase: {
 *          projectId: 'your-project-id',
 *          publicAnonKey: 'your-anon-key',
 *        },
 *        documents: {
 *          enabled: true,
 *          getDocuments: async () => [...],
 *        },
 *        ui: {
 *          showDeployButton: true,
 *          showTemplateButtons: true,
 *        },
 *        onWorkflowSave: (w) => { ... },
 *        onWorkflowDeploy: (w, id) => { ... },
 *        onTemplateCreate: (t) => { ... },
 *      }}
 *    />
 *    ```
 * 
 * 📦 SETUP:
 * 
 * 1. Copy this entire folder to your project
 * 2. Follow SETUP.md to configure WorkflowBuilder.tsx
 * 3. Import and use as shown above
 * 
 * 📋 DEPENDENCIES:
 * - react ^18.0.0
 * - lucide-react (for icons)
 * - shadcn/ui components (in components/ui/)
 * 
 * 📄 LICENSE: MIT
 * 
 * For more details, see README.md or visit the ClientDock project.
 */

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Main workflow builder component
 * Re-exported as "WorkflowModule" for clearer naming
 */
export { WorkflowBuilder as WorkflowModule } from './WorkflowBuilder';

/**
 * Standalone workflow builder component
 * Ready-to-use component with close button and default config
 * Perfect for adding workflow builder to any app with a button
 */
export { StandaloneWorkflow } from './StandaloneWorkflow';

/**
 * Storage implementations
 * - LocalWorkflowStorage: Browser localStorage (default)
 * - SupabaseWorkflowStorage: Supabase cloud storage
 */
export { LocalWorkflowStorage, SupabaseWorkflowStorage } from './storage';

/**
 * Constants and configuration
 * - nodeTemplates: Node type definitions
 * - GRID_SIZE: Canvas grid size
 * - NODE_SIZE: Default node dimensions
 */
export { nodeTemplates, GRID_SIZE, NODE_SIZE } from './constants';

/**
 * TypeScript types
 * - FlowNode: Workflow node definition
 * - Connection: Node-to-node connection
 * - WorkflowTemplate: Reusable workflow template
 * - SavedWorkflow: Persisted workflow instance
 * - WorkflowModuleConfig: Configuration object for WorkflowModule
 */
export type { 
  FlowNode, 
  Connection, 
  WorkflowTemplate, 
  SavedWorkflow, 
  WorkflowModuleConfig 
} from './types';
