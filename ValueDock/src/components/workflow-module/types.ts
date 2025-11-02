/**
 * Workflow Module Types
 * Shared type definitions for the workflow builder module
 */

export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'input' | 'document' | 'action';
  label: string;
  x: number;
  y: number;
  config?: {
    description?: string;
    assignee?: string;
    duration?: string;
    triggerType?: string;
    actionType?: string;
    documentId?: string;
    inputOutputType?: 'input' | 'output';
    // Complexity metrics
    isInputNode?: boolean; // Mark as an input for complexity calculation
    responsibleTeam?: string; // Team/role responsible for this node
    decisionCriteria?: Array<{ id: string; label: string }>;
    decisionType?: 'yes-no' | 'approved-not-approved' | 'custom';
    // End node config
    completionStatus?: string;
    sendNotification?: string;
    notifyRecipients?: string;
    archiveWorkflow?: string;
    generateReport?: string;
    // NEW: Triggers, Inputs, Outputs, Dependencies
    triggers?: string[]; // Array of trigger names (e.g., "Email", "EDI Feed", "Vendor Portal")
    inputs?: string[]; // Array of input names (e.g., "ERP", "GRN System")
    outputs?: string[]; // Array of output names (e.g., "Parsed invoice record")
    dependencies?: string[]; // Array of dependency names (e.g., "AP", "Procurement")
  };
  attachments?: Array<{
    id: string;
    type: 'time-sink' | 'quality-risk';
  }>;
}

export interface Connection {
  from: string;
  to: string;
  label?: string; // For decision branches
  criteriaId?: string; // Links to decision criteria
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: FlowNode[];
  connections: Connection[];
  createdAt?: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  savedAt: string;
  nodes: FlowNode[];
  connections: Connection[];
}

export interface WorkflowModuleConfig {
  // Optional Supabase configuration
  supabase?: {
    projectId: string;
    publicAnonKey: string;
  };
  
  // Storage configuration
  storage?: {
    saveTemplate?: (template: WorkflowTemplate) => Promise<void>;
    loadTemplates?: () => Promise<WorkflowTemplate[]>;
    saveWorkflow?: (workflow: SavedWorkflow) => Promise<void>;
    loadWorkflows?: () => Promise<SavedWorkflow[]>;
  };
  
  // Document integration
  documents?: {
    enabled: boolean;
    getDocuments?: () => Promise<any[]>;
  };
  
  // Callbacks
  onWorkflowSave?: (workflow: SavedWorkflow) => void;
  onWorkflowDeploy?: (workflow: { nodes: FlowNode[]; connections: Connection[] }, customerId?: string) => void;
  onTemplateCreate?: (template: WorkflowTemplate) => void;
  
  // Initial state
  initialWorkflow?: {
    name?: string;
    nodes?: FlowNode[];
    connections?: Connection[];
  };
  
  // UI customization
  ui?: {
    showDeployButton?: boolean;
    showTemplateButtons?: boolean;
    showDocumentLibrary?: boolean;
    customNodeTypes?: Record<string, any>;
  };
}
