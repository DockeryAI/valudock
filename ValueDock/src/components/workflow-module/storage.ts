/**
 * Workflow Module Storage Utilities
 * Handles saving/loading workflows and templates with multiple storage backends
 */

import type { WorkflowTemplate, SavedWorkflow } from './types';

/**
 * Organization-scoped workflow metadata (triggers, inputs, outputs, dependencies)
 */
export interface OrganizationWorkflowMetadata {
  organizationId: string;
  triggers: string[]; // Organization-wide list of available triggers
  inputs: string[]; // Organization-wide list of available inputs
  outputs: string[]; // Organization-wide list of available outputs
  dependencies: string[]; // Organization-wide list of available dependencies
}

/**
 * Local Storage Implementation
 * Used as fallback when no custom storage is provided
 */
export class LocalWorkflowStorage {
  private static TEMPLATES_KEY = 'workflow_templates';
  private static WORKFLOWS_KEY = 'saved_workflows';
  private static METADATA_KEY = 'workflow_metadata';

  static async saveTemplate(template: WorkflowTemplate): Promise<void> {
    const templates = await this.loadTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  static async loadTemplates(): Promise<WorkflowTemplate[]> {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultTemplates();
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    const templates = await this.loadTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(filtered));
  }

  static async saveWorkflow(workflow: SavedWorkflow): Promise<void> {
    const workflows = await this.loadWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(workflows));
  }

  static async loadWorkflows(): Promise<SavedWorkflow[]> {
    const stored = localStorage.getItem(this.WORKFLOWS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static async deleteWorkflow(workflowId: string): Promise<void> {
    const workflows = await this.loadWorkflows();
    const filtered = workflows.filter(w => w.id !== workflowId);
    localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(filtered));
  }

  // Organization Metadata Management
  static async loadMetadata(organizationId: string): Promise<OrganizationWorkflowMetadata> {
    const stored = localStorage.getItem(`${this.METADATA_KEY}_${organizationId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default metadata includes examples from Invoice Processing workflow
    return {
      organizationId,
      triggers: [
        'Email',
        'EDI Feed',
        'Vendor Portal',
        'API Call',
        'Manual Entry',
        'Webhook',
        'Scheduled Batch'
      ],
      inputs: [
        'ERP',
        'OCR Engine',
        'GRN System',
        'Ticketing/Workflow tool',
        'BPM Engine',
        'Banking API',
        'Bank Feed',
        'BI Tool',
        'Compliance System',
        'CRM',
        'Database'
      ],
      outputs: [
        'Parsed invoice record',
        'Validation Results',
        'Match Status',
        'Resolution Details',
        'Controller Decision',
        'Approval Status',
        'Compliance Clearance',
        'Payment Confirmation',
        'Remittance',
        'Reconciliation Report',
        'KPIs',
        'Report',
        'Email',
        'Notification'
      ],
      dependencies: [
        'AP',
        'Procurement',
        'Receiving',
        'Vendors',
        'Operations',
        'Finance',
        'Controllers',
        'Department Managers',
        'Compliance',
        'Legal',
        'Treasury',
        'Accounting',
        'Audit',
        'IT'
      ]
    };
  }

  static async saveMetadata(metadata: OrganizationWorkflowMetadata): Promise<void> {
    localStorage.setItem(`${this.METADATA_KEY}_${metadata.organizationId}`, JSON.stringify(metadata));
  }

  static async addTrigger(organizationId: string, trigger: string): Promise<void> {
    const metadata = await this.loadMetadata(organizationId);
    if (!metadata.triggers.includes(trigger)) {
      metadata.triggers.push(trigger);
      await this.saveMetadata(metadata);
    }
  }

  static async addInput(organizationId: string, input: string): Promise<void> {
    const metadata = await this.loadMetadata(organizationId);
    if (!metadata.inputs.includes(input)) {
      metadata.inputs.push(input);
      await this.saveMetadata(metadata);
    }
  }

  static async addOutput(organizationId: string, output: string): Promise<void> {
    const metadata = await this.loadMetadata(organizationId);
    if (!metadata.outputs.includes(output)) {
      metadata.outputs.push(output);
      await this.saveMetadata(metadata);
    }
  }

  static async addDependency(organizationId: string, dependency: string): Promise<void> {
    const metadata = await this.loadMetadata(organizationId);
    if (!metadata.dependencies.includes(dependency)) {
      metadata.dependencies.push(dependency);
      await this.saveMetadata(metadata);
    }
  }

  private static getDefaultTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'invoice-processing-ap',
        name: 'Invoice Processing (Accounts Payable)',
        description: 'Comprehensive end-to-end invoice processing workflow with exception handling, multi-level approvals, and compliance routing',
        category: 'Finance',
        nodes: [
          // Start
          { 
            id: 'start', 
            type: 'start', 
            label: 'Start', 
            x: 100, 
            y: 50,
            config: {
              triggers: ['Email', 'EDI Feed', 'Vendor Portal'],
              description: 'Invoice processing triggered by email, EDI feed, or vendor portal'
            }
          },
          
          // 1. Invoice Intake
          { 
            id: 'intake', 
            type: 'task', 
            label: 'Invoice Intake', 
            x: 100, 
            y: 180,
            config: {
              description: 'Receive and extract invoice data (email, EDI, or portal)',
              triggers: ['Email', 'EDI Feed', 'Vendor Portal'],
              inputs: ['OCR Engine', 'ERP'],
              outputs: ['Parsed invoice record'],
              dependencies: ['AP', 'Procurement'],
              responsibleTeam: 'AP'
            }
          },
          
          // Intake Decision: Data extraction successful?
          {
            id: 'intake-decision',
            type: 'decision',
            label: 'Data Valid?',
            x: 100,
            y: 310,
            config: {
              decisionType: 'custom',
              decisionCriteria: [
                { id: 'success', label: 'Success' },
                { id: 'fail', label: 'Extraction Failed' },
                { id: 'unknown-vendor', label: 'Unknown Vendor' }
              ]
            }
          },
          
          // Sub-process: Data Exception Review
          {
            id: 'data-exception',
            type: 'task',
            label: 'Data Exception Review',
            x: 350,
            y: 310,
            config: {
              description: 'Manual review of extraction failures',
              inputs: ['Failed Invoice Data', 'OCR Engine'],
              outputs: ['Corrected Invoice Data'],
              dependencies: ['AP'],
              responsibleTeam: 'AP'
            }
          },
          
          // Sub-process: Vendor Master Update
          {
            id: 'vendor-update',
            type: 'task',
            label: 'Vendor Master Update',
            x: 350,
            y: 440,
            config: {
              description: 'Add new vendor to master database',
              inputs: ['Vendor Information', 'ERP'],
              outputs: ['Updated Vendor Master'],
              dependencies: ['AP', 'Procurement'],
              responsibleTeam: 'Procurement'
            }
          },
          
          // 2. Validation & Matching
          {
            id: 'validation',
            type: 'task',
            label: 'Validation & Matching',
            x: 100,
            y: 470,
            config: {
              description: 'Validate required fields, perform 2-way/3-way PO match',
              inputs: ['ERP', 'GRN System'],
              outputs: ['Validation Results', 'Match Status'],
              dependencies: ['Procurement', 'Receiving'],
              responsibleTeam: 'AP'
            }
          },
          
          // Validation Decision
          {
            id: 'validation-decision',
            type: 'decision',
            label: 'Match OK?',
            x: 100,
            y: 600,
            config: {
              decisionType: 'custom',
              decisionCriteria: [
                { id: 'match', label: 'Match Successful' },
                { id: 'mismatch', label: 'Mismatch/Missing PO' }
              ]
            }
          },
          
          // 3. Exception Handling
          {
            id: 'exception-handling',
            type: 'task',
            label: 'Exception Handling',
            x: 350,
            y: 600,
            config: {
              description: 'Investigate discrepancies or disputes',
              inputs: ['ERP', 'Ticketing/Workflow tool'],
              outputs: ['Resolution Details'],
              dependencies: ['Procurement', 'Vendors', 'Operations'],
              responsibleTeam: 'AP'
            }
          },
          
          // Exception Decision
          {
            id: 'exception-decision',
            type: 'decision',
            label: 'Resolved?',
            x: 350,
            y: 730,
            config: {
              decisionType: 'custom',
              decisionCriteria: [
                { id: 'resolved', label: 'Resolution Found' },
                { id: 'escalate', label: 'Unresolvable' }
              ]
            }
          },
          
          // Sub-process: Finance Controller Review
          {
            id: 'controller-review',
            type: 'task',
            label: 'Finance Controller Review',
            x: 600,
            y: 730,
            config: {
              description: 'Escalation to Controller for unresolvable exceptions',
              inputs: ['Exception Details', 'ERP'],
              outputs: ['Controller Decision'],
              dependencies: ['Finance', 'Controllers'],
              responsibleTeam: 'Finance'
            }
          },
          
          // 4. Approval Workflow
          {
            id: 'approval',
            type: 'task',
            label: 'Approval Workflow',
            x: 100,
            y: 860,
            config: {
              description: 'Multi-level approval routing based on amount, cost center, or policy',
              inputs: ['ERP', 'BPM Engine'],
              outputs: ['Approval Status'],
              dependencies: ['Department Managers', 'Controllers', 'Finance'],
              responsibleTeam: 'Finance'
            }
          },
          
          // Approval Decision
          {
            id: 'approval-decision',
            type: 'decision',
            label: 'Amount & Compliance?',
            x: 100,
            y: 990,
            config: {
              decisionType: 'custom',
              decisionCriteria: [
                { id: 'small', label: '≤ $10K' },
                { id: 'large', label: '> $10K' },
                { id: 'compliance', label: 'Compliance Flag' }
              ]
            }
          },
          
          // Sub-process: Compliance Review
          {
            id: 'compliance-review',
            type: 'task',
            label: 'Compliance Review',
            x: 350,
            y: 990,
            config: {
              description: 'Review invoices flagged for compliance',
              inputs: ['Invoice Details', 'Compliance System'],
              outputs: ['Compliance Clearance'],
              dependencies: ['Compliance', 'Legal', 'Finance'],
              responsibleTeam: 'Compliance'
            }
          },
          
          // 5. Payment Processing
          {
            id: 'payment',
            type: 'task',
            label: 'Payment Processing',
            x: 100,
            y: 1150,
            config: {
              description: 'Execute payment and send remittance',
              inputs: ['ERP', 'Banking API'],
              outputs: ['Payment Confirmation', 'Remittance'],
              dependencies: ['Treasury', 'Finance'],
              responsibleTeam: 'Treasury'
            }
          },
          
          // Payment Decision
          {
            id: 'payment-decision',
            type: 'decision',
            label: 'Payment OK?',
            x: 100,
            y: 1280,
            config: {
              decisionType: 'yes-no',
              decisionCriteria: [
                { id: 'yes', label: 'Success' },
                { id: 'no', label: 'Failure' }
              ]
            }
          },
          
          // Sub-process: Payment Exception Resolution
          {
            id: 'payment-exception',
            type: 'task',
            label: 'Payment Exception Resolution',
            x: 350,
            y: 1280,
            config: {
              description: 'Handle failed payments',
              inputs: ['Payment Error Details', 'Banking API'],
              outputs: ['Retry Payment'],
              dependencies: ['Treasury', 'IT'],
              responsibleTeam: 'Treasury'
            }
          },
          
          // 6. Reconciliation & Reporting
          {
            id: 'reconciliation',
            type: 'task',
            label: 'Reconciliation & Reporting',
            x: 100,
            y: 1410,
            config: {
              description: 'Match payments, close ledgers, generate KPIs',
              inputs: ['ERP', 'Bank Feed', 'BI Tool'],
              outputs: ['Reconciliation Report', 'KPIs'],
              dependencies: ['Accounting', 'Audit', 'Compliance'],
              responsibleTeam: 'Accounting'
            }
          },
          
          // End
          { id: 'end', type: 'end', label: 'End', x: 100, y: 1540 }
        ],
        connections: [
          // Main flow
          { from: 'start', to: 'intake' },
          { from: 'intake', to: 'intake-decision' },
          
          // Intake decision branches
          { from: 'intake-decision', to: 'validation', label: 'Success', criteriaId: 'success' },
          { from: 'intake-decision', to: 'data-exception', label: 'Extraction Failed', criteriaId: 'fail' },
          { from: 'intake-decision', to: 'vendor-update', label: 'Unknown Vendor', criteriaId: 'unknown-vendor' },
          
          // Exception returns
          { from: 'data-exception', to: 'validation' },
          { from: 'vendor-update', to: 'validation' },
          
          // Validation decision
          { from: 'validation', to: 'validation-decision' },
          { from: 'validation-decision', to: 'approval', label: 'Match Successful', criteriaId: 'match' },
          { from: 'validation-decision', to: 'exception-handling', label: 'Mismatch/Missing PO', criteriaId: 'mismatch' },
          
          // Exception handling
          { from: 'exception-handling', to: 'exception-decision' },
          { from: 'exception-decision', to: 'approval', label: 'Resolution Found', criteriaId: 'resolved' },
          { from: 'exception-decision', to: 'controller-review', label: 'Unresolvable', criteriaId: 'escalate' },
          { from: 'controller-review', to: 'approval' },
          
          // Approval routing
          { from: 'approval', to: 'approval-decision' },
          { from: 'approval-decision', to: 'payment', label: '≤ $10K', criteriaId: 'small' },
          { from: 'approval-decision', to: 'payment', label: '> $10K', criteriaId: 'large' },
          { from: 'approval-decision', to: 'compliance-review', label: 'Compliance Flag', criteriaId: 'compliance' },
          { from: 'compliance-review', to: 'payment' },
          
          // Payment
          { from: 'payment', to: 'payment-decision' },
          { from: 'payment-decision', to: 'reconciliation', label: 'Success', criteriaId: 'yes' },
          { from: 'payment-decision', to: 'payment-exception', label: 'Failure', criteriaId: 'no' },
          { from: 'payment-exception', to: 'payment' },
          
          // Final
          { from: 'reconciliation', to: 'end' }
        ]
      },
      {
        id: 'onboarding-basic',
        name: '1040 Individual Tax Return',
        description: 'Standard workflow for individual tax return preparation',
        category: 'Tax Preparation',
        nodes: [
          { id: '1', type: 'start', label: 'Start', x: 100, y: 100 },
          { id: '2', type: 'input', label: 'Client Intake Form', x: 100, y: 250, config: { description: 'Collect basic client information' } },
          { id: '3', type: 'document', label: 'W-2s & 1099s', x: 100, y: 400, config: { description: 'Upload income documents' } },
          { id: '4', type: 'task', label: 'Review Documents', x: 100, y: 550, config: { assignee: 'Tax Preparer', duration: '2 hours' } },
          { id: '5', type: 'decision', label: 'Complete?', x: 100, y: 700, config: { decisionType: 'yes-no', decisionCriteria: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }] } },
          { id: '6', type: 'task', label: 'Prepare Return', x: 300, y: 850, config: { assignee: 'Tax Preparer', duration: '4 hours' } },
          { id: '7', type: 'action', label: 'Send for Review', x: 300, y: 1000, config: { actionType: 'Send Email' } },
          { id: '8', type: 'end', label: 'End', x: 300, y: 1150 },
        ],
        connections: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' },
          { from: '4', to: '5' },
          { from: '5', to: '6', label: 'Yes', criteriaId: 'yes' },
          { from: '5', to: '3', label: 'No', criteriaId: 'no' },
          { from: '6', to: '7' },
          { from: '7', to: '8' },
        ],
      },
      {
        id: 'business-return',
        name: '1120 Corporate Return',
        description: 'Workflow for corporate tax return preparation',
        category: 'Tax Preparation',
        nodes: [
          { id: '1', type: 'start', label: 'Start', x: 100, y: 100 },
          { id: '2', type: 'document', label: 'Financial Statements', x: 100, y: 250 },
          { id: '3', type: 'task', label: 'Reconcile Books', x: 100, y: 400, config: { assignee: 'Senior Accountant', duration: '8 hours' } },
          { id: '4', type: 'task', label: 'Prepare Return', x: 100, y: 550, config: { assignee: 'Tax Manager', duration: '12 hours' } },
          { id: '5', type: 'action', label: 'Partner Review', x: 100, y: 700, config: { actionType: 'Request Approval' } },
          { id: '6', type: 'end', label: 'End', x: 100, y: 850 },
        ],
        connections: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' },
          { from: '4', to: '5' },
          { from: '5', to: '6' },
        ],
      },
      {
        id: 'client-onboarding',
        name: 'New Client Onboarding',
        description: 'Complete onboarding process for new clients',
        category: 'Onboarding',
        nodes: [
          { id: '1', type: 'start', label: 'Start', x: 100, y: 100 },
          { id: '2', type: 'input', label: 'Engagement Letter', x: 100, y: 250 },
          { id: '3', type: 'document', label: 'ID Verification', x: 100, y: 400 },
          { id: '4', type: 'task', label: 'Setup in System', x: 100, y: 550, config: { assignee: 'Admin', duration: '30 minutes' } },
          { id: '5', type: 'action', label: 'Welcome Email', x: 100, y: 700, config: { actionType: 'Send Email' } },
          { id: '6', type: 'end', label: 'End', x: 100, y: 850 },
        ],
        connections: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' },
          { from: '4', to: '5' },
          { from: '5', to: '6' },
        ],
      },
    ];
  }
}

/**
 * Supabase Storage Implementation
 * Used when Supabase credentials are provided
 */
export class SupabaseWorkflowStorage {
  private projectId: string;
  private publicAnonKey: string;

  constructor(projectId: string, publicAnonKey: string) {
    this.projectId = projectId;
    this.publicAnonKey = publicAnonKey;
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    const response = await fetch(
      `https://${this.projectId}.supabase.co/functions/v1/make-server-888f4514/workflow-templates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicAnonKey}`,
        },
        body: JSON.stringify(template),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save template');
    }
  }

  async loadTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-888f4514/workflow-templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Failed to load templates from Supabase, using local storage');
        return LocalWorkflowStorage.loadTemplates();
      }

      return await response.json();
    } catch (error) {
      console.warn('Error loading templates from Supabase:', error);
      return LocalWorkflowStorage.loadTemplates();
    }
  }

  async saveWorkflow(workflow: SavedWorkflow): Promise<void> {
    const response = await fetch(
      `https://${this.projectId}.supabase.co/functions/v1/make-server-888f4514/workflows`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicAnonKey}`,
        },
        body: JSON.stringify(workflow),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save workflow');
    }
  }

  async loadWorkflows(): Promise<SavedWorkflow[]> {
    try {
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-888f4514/workflows`,
        {
          headers: {
            'Authorization': `Bearer ${this.publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Failed to load workflows from Supabase, using local storage');
        return LocalWorkflowStorage.loadWorkflows();
      }

      return await response.json();
    } catch (error) {
      console.warn('Error loading workflows from Supabase:', error);
      return LocalWorkflowStorage.loadWorkflows();
    }
  }
}
