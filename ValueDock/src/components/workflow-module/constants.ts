/**
 * Workflow Module Constants
 * 
 * EXTRACTED FROM: /components/workflow/WorkflowBuilder.tsx (ClientDock Original)
 * These are the EXACT constants from ClientDock's WorkflowBuilder for perfect replication
 */

import {
  Circle,
  Square,
  Diamond,
  FileInput,
  FileText,
  CheckCircle2,
} from 'lucide-react';

// Node templates with exact colors and icons from original
export const nodeTemplates = {
  start: { 
    icon: Circle, 
    label: 'Start', 
    color: 'bg-green-100 border-green-500 text-green-800',
    description: 'Initiates the workflow when triggered'
  },
  end: { 
    icon: Circle, 
    label: 'End', 
    color: 'bg-red-100 border-red-500 text-red-800',
    description: 'Marks the completion of the workflow'
  },
  task: { 
    icon: Square, 
    label: 'Task', 
    color: 'bg-blue-100 border-blue-500 text-blue-800',
    description: 'Represents a specific task or activity'
  },
  decision: { 
    icon: Diamond, 
    label: 'Decision', 
    color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    description: 'Creates conditional branches based on criteria'
  },
  input: { 
    icon: FileInput, 
    label: 'Input/Output', 
    color: 'bg-indigo-100 border-indigo-500 text-indigo-800',
    description: 'Handles data input or output operations'
  },
  document: { 
    icon: FileText, 
    label: 'Document', 
    color: 'bg-gray-100 border-gray-500 text-gray-800',
    description: 'Manages document-related operations'
  },
  action: { 
    icon: CheckCircle2, 
    label: 'Action', 
    color: 'bg-orange-100 border-orange-500 text-orange-800',
    description: 'Performs automated actions'
  },
};

// Trigger types - exact list from original WorkflowBuilder
export const triggerTypes = [
  { value: 'document-upload', label: 'Document Uploaded' },
  { value: 'document-signed', label: 'Document Signed' },
  { value: 'payment-received', label: 'Payment Received' },
  { value: 'form-submitted', label: 'Form Submitted' },
  { value: 'deadline-approaching', label: 'Deadline Approaching' },
  { value: 'client-assigned', label: 'Client Assigned' },
  { value: 'workflow-stage', label: 'Workflow Stage Changed' },
  { value: 'task-completed', label: 'Task Completed' },
  { value: 'email-received', label: 'Email Received' },
  { value: 'scheduled-date', label: 'Scheduled Date/Time' },
];

// Action types - exact list from original WorkflowBuilder
export const actionTypes = [
  { value: 'send-email', label: 'Send Email' },
  { value: 'send-sms', label: 'Send SMS' },
  { value: 'create-task', label: 'Create Task' },
  { value: 'request-document', label: 'Request Document' },
  { value: 'create-invoice', label: 'Create Invoice' },
  { value: 'assign-user', label: 'Assign to User' },
  { value: 'advance-stage', label: 'Advance Stage' },
  { value: 'send-notification', label: 'Send Notification' },
  { value: 'update-status', label: 'Update Status' },
  { value: 'schedule-meeting', label: 'Schedule Meeting' },
  { value: 'generate-report', label: 'Generate Report' },
  { value: 'manual-action', label: 'Manual Action (Custom)' },
];

export const GRID_SIZE = 50;
export const NODE_SIZE = 60;
export const SNAP_THRESHOLD = 70;
export const LINE_SNAP_THRESHOLD = 30;
export const CANVAS_PADDING = 100;
