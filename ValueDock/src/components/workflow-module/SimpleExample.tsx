/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║          SIMPLE WORKFLOW BUILDER INTEGRATION EXAMPLE              ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 * 
 * This shows the EASIEST way to add the workflow builder to your app.
 * Just copy and paste this into your component!
 */

import { useState } from 'react';
import { StandaloneWorkflow } from './StandaloneWorkflow';
import { Button } from '../ui/button';
import { Workflow } from 'lucide-react';

/**
 * Example 1: Basic Button + Workflow Builder
 * 
 * This is all you need! Click the button, workflow builder opens.
 * Works completely standalone with localStorage.
 */
export function SimpleWorkflowExample() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8">
      {/* Your app content */}
      <div className="space-y-4">
        <h1 className="text-3xl">My App</h1>
        <p className="text-gray-600">Click the button below to open the workflow builder:</p>
        
        {/* Simple button to open workflow */}
        <Button onClick={() => setShowWorkflow(true)} className="gap-2">
          <Workflow className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow builder - full screen overlay */}
      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}

/**
 * Example 2: With Multiple Buttons
 * 
 * Show different entry points for workflow builder
 */
export function MultiButtonExample() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">ValueDock</h1>
        <Button onClick={() => setShowWorkflow(true)} variant="outline">
          Workflows
        </Button>
      </div>

      {/* Main content with action cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Build Workflows</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create automated workflows for your clients
          </p>
          <Button onClick={() => setShowWorkflow(true)} className="w-full">
            Open Builder
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Manage Clients</h3>
          <p className="text-sm text-gray-600 mb-4">
            View and manage your client list
          </p>
          <Button variant="outline" className="w-full">
            View Clients
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            Access your document library
          </p>
          <Button variant="outline" className="w-full">
            View Documents
          </Button>
        </div>
      </div>

      {/* Workflow builder overlay */}
      {showWorkflow && (
        <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}

/**
 * Example 3: Embedded in Tab/Page
 * 
 * Show workflow builder as part of a tabbed interface
 */
export function TabbedExample() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation */}
      <div className="border-b">
        <div className="flex gap-4 p-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 ${activeTab === 'home' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 ${activeTab === 'workflows' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Workflows
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 ${activeTab === 'clients' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Clients
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <div className="p-8">
            <h2 className="text-2xl mb-4">Dashboard</h2>
            <p>Welcome to your dashboard!</p>
          </div>
        )}

        {activeTab === 'workflows' && (
          <StandaloneWorkflow 
            fullScreen={false} 
            showCloseButton={false}
          />
        )}

        {activeTab === 'clients' && (
          <div className="p-8">
            <h2 className="text-2xl mb-4">Clients</h2>
            <p>Client list goes here...</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 4: With Custom Callbacks
 * 
 * Show how to integrate with your backend
 */
export function BackendIntegrationExample() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setShowWorkflow(true)}>
        Open Workflow Builder
      </Button>

      {showWorkflow && (
        <StandaloneWorkflow
          onClose={() => setShowWorkflow(false)}
          config={{
            // Called when user saves a workflow
            onWorkflowSave: async (workflow) => {
              console.log('Saving workflow:', workflow.name);
              
              // Example: Save to your backend
              try {
                const response = await fetch('/api/workflows', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(workflow),
                });
                
                if (response.ok) {
                  alert('Workflow saved successfully!');
                } else {
                  alert('Error saving workflow');
                }
              } catch (error) {
                console.error('Save error:', error);
                alert('Error saving workflow');
              }
            },

            // Called when user deploys a workflow
            onWorkflowDeploy: async (workflow, customerId) => {
              console.log('Deploying workflow to:', customerId);
              
              // Example: Deploy to customer
              try {
                const response = await fetch('/api/workflows/deploy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    workflow,
                    customerId,
                  }),
                });
                
                if (response.ok) {
                  alert(`Workflow deployed to ${customerId}!`);
                } else {
                  alert('Error deploying workflow');
                }
              } catch (error) {
                console.error('Deploy error:', error);
                alert('Error deploying workflow');
              }
            },

            // Called when user creates a template
            onTemplateCreate: (template) => {
              console.log('Template created:', template.name);
              alert(`Template "${template.name}" created!`);
            },

            // UI customization
            ui: {
              showDeployButton: true,
              showTemplateButtons: true,
              showDocumentLibrary: false,
            },
          }}
        />
      )}
    </div>
  );
}

/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║                        QUICK START GUIDE                          ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 * 
 * STEP 1: Copy this code into your component
 * ────────────────────────────────────────────────────────────────────
 * 
 * import { useState } from 'react';
 * import { StandaloneWorkflow } from './components/workflow-module';
 * import { Button } from './components/ui/button';
 * 
 * function MyApp() {
 *   const [showWorkflow, setShowWorkflow] = useState(false);
 * 
 *   return (
 *     <div>
 *       <Button onClick={() => setShowWorkflow(true)}>
 *         Open Workflow Builder
 *       </Button>
 * 
 *       {showWorkflow && (
 *         <StandaloneWorkflow onClose={() => setShowWorkflow(false)} />
 *       )}
 *     </div>
 *   );
 * }
 * 
 * 
 * STEP 2: That's it! You're done!
 * ────────────────────────────────────────────────────────────────────
 * 
 * The workflow builder includes:
 * ✅ All 7 node types
 * ✅ Drag and drop
 * ✅ Properties panel
 * ✅ Templates
 * ✅ Save/load (localStorage by default)
 * ✅ Undo/redo
 * ✅ Multi-select
 * ✅ Everything works out of the box!
 * 
 * 
 * STEP 3 (OPTIONAL): Add custom backend integration
 * ────────────────────────────────────────────────────────────────────
 * 
 * <StandaloneWorkflow
 *   onClose={() => setShowWorkflow(false)}
 *   config={{
 *     onWorkflowSave: async (workflow) => {
 *       await saveToYourBackend(workflow);
 *     },
 *     onWorkflowDeploy: async (workflow, customerId) => {
 *       await deployToCustomer(workflow, customerId);
 *     },
 *   }}
 * />
 * 
 * 
 * That's all you need! No dashboard required, no complex setup.
 * Just import, add a button, and you're building workflows! 🚀
 */
