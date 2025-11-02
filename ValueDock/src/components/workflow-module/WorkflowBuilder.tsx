import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { projectId as defaultProjectId, publicAnonKey as defaultPublicAnonKey } from '../../utils/supabase/info';
import type { WorkflowModuleConfig } from '../workflow-module/types';
import { calculateWorkflowComplexity } from './complexityCalculator';
import { LocalWorkflowStorage, type OrganizationWorkflowMetadata } from './storage';
import { NodeMetadataEditor } from './NodeMetadataEditor';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { 
  Save,
  Download,
  Upload,
  Trash2,
  Circle,
  Square,
  Diamond,
  FileInput,
  Zap,
  FileText,
  CheckCircle2,
  X,
  FileStack,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  Lock,
  FolderKanban,
  Menu,
  Undo2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface FlowNode {
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
    decisionCriteria?: Array<{ id: string; label: string }>;
    decisionType?: 'yes-no' | 'approved-not-approved' | 'custom';
    // End node config
    completionStatus?: string;
    sendNotification?: string;
    notifyRecipients?: string;
    archiveWorkflow?: string;
    generateReport?: string;
  };
  attachments?: Array<{
    id: string;
    type: 'time-sink' | 'quality-risk';
  }>;
}

interface Connection {
  from: string;
  to: string;
  label?: string; // For decision branches
  criteriaId?: string; // Links to decision criteria
}

const nodeTemplates = {
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

const iconAttachmentTemplates = {
  'time-sink': {
    icon: Clock,
    label: 'Time Sink',
    color: 'bg-amber-500',
    description: 'Tasks that are highly manual, repetitive, and consume a lot of employee time'
  },
  'quality-risk': {
    icon: AlertTriangle,
    label: 'Quality Risk',
    color: 'bg-red-500',
    description: 'Steps in the process that are prone to human error or inconsistencies'
  },
};

const triggerTypes = [
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

const actionTypes = [
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

function NodeShape({ type, label, size = 60, inLibrary = false }: { type: FlowNode['type'], label: string, size?: number, inLibrary?: boolean }) {
  const template = nodeTemplates[type];
  const Icon = template.icon;
  const iconSize = size < 55 ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const textSize = size < 55 ? 'text-[8px]' : 'text-[10px]';
  
  if (type === 'start' || type === 'end') {
    return (
      <div className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.12))' }}>
        <div className={`w-full h-full flex flex-col items-center justify-center border-2 ${template.color} rounded-full`}>
          <Icon className={`${iconSize} mb-0.5`} />
          <span className={`${textSize} text-center px-1 leading-tight`} title={label}>
            {label.length > 11 ? label.substring(0, 8) + '...' : label}
          </span>
        </div>
      </div>
    );
  }
  
  if (type === 'decision') {
    return (
      <div className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.12))' }}>
        <div 
          className={`w-full h-full flex items-center justify-center border-2 ${template.color}`}
          style={{ transform: 'rotate(45deg)', borderRadius: '6px' }}
        >
          <div style={{ transform: 'rotate(-45deg)' }} className="flex flex-col items-center justify-center px-1">
            <Icon className={`${iconSize} mb-0.5`} />
            <span className={`text-[7px] text-center leading-tight`} title={label}>
              {label.length > 11 ? label.substring(0, 8) + '...' : label}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'input') {
    const bgColor = template.color.includes('indigo-100') ? '#e0e7ff' : '#e5e7eb';
    const borderColor = template.color.includes('indigo-500') ? '#6366f1' : '#6b7280';
    
    return (
      <div 
        className={`w-full h-full relative`} 
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.12))'
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path 
            d="M 20 5 L 95 5 L 80 95 L 5 95 Z" 
            fill={bgColor}
            stroke={borderColor}
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`${iconSize} mb-0.5`} />
          <div className="flex flex-col items-center gap-0.5">
            <span className={`${textSize} text-center leading-none`}>Input/</span>
            <span className={`${textSize} text-center leading-none`}>Output</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.12))' }}>
      <div 
        className={`w-full h-full flex flex-col items-center justify-center border-2 ${template.color} rounded-lg`}
      >
        <Icon className={`${iconSize} mb-0.5`} />
        <span className={`${textSize} text-center px-1 leading-tight`} title={label}>
          {label.length > 11 ? label.substring(0, 8) + '...' : label}
        </span>
      </div>
    </div>
  );
}

// Helper function to get stable connection ordering for decision nodes
// This ensures branches don't swap positions when connections are added/removed
function getSortedConnectionsFromNode(nodeId: string, connections: Connection[], sourceNode?: FlowNode) {
  const conns = connections.filter(c => c.from === nodeId);
  
  // If the source node has decision criteria, sort connections by criteria order
  if (sourceNode?.config?.decisionCriteria) {
    const criteriaOrder = sourceNode.config.decisionCriteria.map(c => c.id);
    return conns.sort((a, b) => {
      const aIndex = a.criteriaId ? criteriaOrder.indexOf(a.criteriaId) : 999;
      const bIndex = b.criteriaId ? criteriaOrder.indexOf(b.criteriaId) : 999;
      return aIndex - bIndex;
    });
  }
  
  // Otherwise return in current order
  return conns;
}

// Helper function to calculate endpoint position for decision branches
function calculateEndpointPosition(
  sourceNode: FlowNode, 
  connectionIndex: number, 
  totalConnections: number,
  panOffset: { x: number; y: number }
) {
  const nodeSize = 60;
  const nodeCenterX = sourceNode.x + nodeSize / 2;
  const nodeCenterY = sourceNode.y + nodeSize / 2;
  
  // Optimized spacing to completely eliminate node and label overlap
  // Strategy: Increase BOTH angle spread AND distance based on branch count
  let angleSpacing: number;
  let connectionLength: number;
  
  if (totalConnections === 1) {
    angleSpacing = 0;
    connectionLength = 200;
  } else if (totalConnections === 2) {
    angleSpacing = 60; // Wide angle for 2 branches
    connectionLength = 200; // Good distance
  } else if (totalConnections === 3) {
    angleSpacing = 50; // Medium angle for 3 branches
    connectionLength = 230; // Longer to prevent label overlap at midpoint
  } else if (totalConnections === 4) {
    angleSpacing = 42; // Balanced angle for 4 branches
    connectionLength = 250; // Even longer distance
  } else if (totalConnections === 5) {
    angleSpacing = 38; // Tighter angle for 5 branches
    connectionLength = 270; // Much longer to compensate
  } else {
    angleSpacing = 35; // Tight angle for 6+ branches
    connectionLength = 290; // Very long distance to avoid all overlap
  }
  
  // Spread connections in a fan pattern
  const angleOffset = (connectionIndex - (totalConnections - 1) / 2) * angleSpacing;
  const baseAngle = 90; // Point downward by default
  const angle = (baseAngle + angleOffset) * (Math.PI / 180);
  
  // Calculate endpoint position
  const endpointX = nodeCenterX + Math.cos(angle) * connectionLength;
  const endpointY = nodeCenterY + Math.sin(angle) * connectionLength;
  
  return { x: endpointX, y: endpointY };
}

// Redistribute all connected nodes when decision branches change
function redistributeDecisionNodes(
  decisionNodeId: string,
  nodes: FlowNode[],
  connections: Connection[],
  panOffset: { x: number; y: number },
  excludeNodeIds: string[] = [] // NEW: Nodes to exclude from redistribution
): FlowNode[] {
  const decisionNode = nodes.find(n => n.id === decisionNodeId);
  if (!decisionNode) return nodes;

  // Get all connections from this decision node (both pending and connected)
  const allConnectionsFromDecision = connections.filter(c => c.from === decisionNodeId);
  const totalBranches = allConnectionsFromDecision.length;

  if (totalBranches === 0) return nodes;

  // This function should RARELY be called - only when initially connecting nodes to decision endpoints
  // If you see this, it means nodes are being forcibly repositioned!
  console.error(`🚨 redistributeDecisionNodes: ${decisionNodeId.slice(-8)}, ${totalBranches} branches, excluding ${excludeNodeIds.length} nodes`);
  console.trace('Stack trace:');

  // Create a map of which nodes to reposition
  const nodesToReposition = new Map<string, { x: number; y: number }>();

  allConnectionsFromDecision.forEach((conn, index) => {
    // Skip pending connections (they don't have real nodes)
    if (conn.to.startsWith('pending-')) return;
    
    // NEW: Skip nodes that should be excluded from redistribution
    if (excludeNodeIds.includes(conn.to)) {
      console.log(`  ⏭️  Skipping excluded node ${conn.to.slice(-8)} in branch ${index + 1}`);
      return;
    }

    // Calculate the new ideal position for this branch
    // Use {x: 0, y: 0} for panOffset since we're calculating world coordinates, not screen coordinates
    const endpoint = calculateEndpointPosition(decisionNode, index, totalBranches, { x: 0, y: 0 });

    // The connected node should be positioned at this endpoint (rounded to avoid decimals)
    const nodeX = Math.round(endpoint.x - 30);
    const nodeY = Math.round(endpoint.y - 30);
    nodesToReposition.set(conn.to, {
      x: nodeX, // Center the node on the endpoint
      y: nodeY
    });

    console.log(`  Branch ${index + 1}/${totalBranches} (${conn.label}): Moving node ${conn.to.slice(-8)} to (${nodeX}, ${nodeY})`);
  });

  // Return updated nodes array with repositioned nodes
  return nodes.map(node => {
    const newPos = nodesToReposition.get(node.id);
    if (newPos) {
      return { ...node, x: newPos.x, y: newPos.y };
    }
    return node;
  });
}

// Calculate optimal port position based on node positions
function getPortPosition(fromNode: FlowNode, toNode: FlowNode, isOutput: boolean) {
  const nodeSize = 60;
  const fromCenterX = fromNode.x + nodeSize / 2;
  const fromCenterY = fromNode.y + nodeSize / 2;
  const toCenterX = toNode.x + nodeSize / 2;
  const toCenterY = toNode.y + nodeSize / 2;
  
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const angle = Math.atan2(dy, dx);
  
  // Determine which side to place the port
  // -45 to 45 degrees: right
  // 45 to 135 degrees: bottom
  // 135 to -135 degrees: left
  // -135 to -45 degrees: top
  
  let x, y;
  
  if (isOutput) {
    // Output port on the source node
    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
      // Right
      x = fromNode.x + nodeSize;
      y = fromNode.y + nodeSize / 2;
    } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
      // Bottom
      x = fromNode.x + nodeSize / 2;
      y = fromNode.y + nodeSize;
    } else if (angle >= (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
      // Left
      x = fromNode.x;
      y = fromNode.y + nodeSize / 2;
    } else {
      // Top
      x = fromNode.x + nodeSize / 2;
      y = fromNode.y;
    }
  } else {
    // Input port on the target node (opposite side)
    const oppositeAngle = angle + Math.PI;
    const normalizedAngle = oppositeAngle > Math.PI ? oppositeAngle - 2 * Math.PI : oppositeAngle;
    
    if (normalizedAngle >= -Math.PI / 4 && normalizedAngle < Math.PI / 4) {
      // Right
      x = toNode.x + nodeSize;
      y = toNode.y + nodeSize / 2;
    } else if (normalizedAngle >= Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
      // Bottom
      x = toNode.x + nodeSize / 2;
      y = toNode.y + nodeSize;
    } else if (normalizedAngle >= (3 * Math.PI) / 4 || normalizedAngle < -(3 * Math.PI) / 4) {
      // Left
      x = toNode.x;
      y = toNode.y + nodeSize / 2;
    } else {
      // Top
      x = toNode.x + nodeSize / 2;
      y = toNode.y;
    }
  }
  
  return { x, y };
}

export interface WorkflowBuilderProps {
  config?: WorkflowModuleConfig;
  onClose?: () => void;
  processId?: string;
  processName?: string;
  organizationId?: string;
  onComplexityUpdate?: (complexity: {
    inputsCount: number;
    stepsCount: number;
    dependenciesCount: number;
    inputsScore: number;
    stepsScore: number;
    dependenciesScore: number;
  }) => void;
}

export function WorkflowBuilder({ 
  config,
  onClose,
  onComplexityUpdate,
  processId = "default",
  processName,
  organizationId = "default"
}: WorkflowBuilderProps = {}) {
  console.log('🎯 ========================================');
  console.log('🎯 WORKFLOW BUILDER COMPONENT MOUNTED');
  console.log('🎯 Process ID:', processId);
  console.log('🎯 Organization ID:', organizationId);
  console.log('🎯 ========================================');
  
  // Use config values or fall back to defaults
  const projectId = config?.supabase?.projectId || defaultProjectId;
  const publicAnonKey = config?.supabase?.publicAnonKey || defaultPublicAnonKey;
  
  const [nodesState, setNodesState] = useState<FlowNode[]>(
    config?.initialWorkflow?.nodes || [
      { id: '1', type: 'start', label: 'Start', x: 400, y: 100 },
    ]
  );
  
  // Wrapper for setNodes that logs when calculated positions are being set
  const setNodes = (newNodes: FlowNode[] | ((prev: FlowNode[]) => FlowNode[])) => {
    const actualNodes = typeof newNodes === 'function' ? newNodes(nodesState) : newNodes;
    
    // SAFETY: Round all node positions to integers to prevent any decimal drift
    const safeNodes = actualNodes.map(node => ({
      ...node,
      x: Math.round(node.x),
      y: Math.round(node.y)
    }));
    
    // Check if any node had calculated coordinates (many decimal places) before rounding
    actualNodes.forEach((node, idx) => {
      const xStr = node.x.toString();
      const yStr = node.y.toString();
      const hasDecimals = (xStr.includes('.') && xStr.split('.')[1]?.length > 5) || 
                          (yStr.includes('.') && yStr.split('.')[1]?.length > 5);
      
      if (hasDecimals) {
        // Capture who called this
        const stack = new Error().stack;
        const lines = stack?.split('\n') || [];
        
        // Extract function names from stack trace
        const getFunctionName = (line: string) => {
          // Try to extract function name from stack line
          const match = line.match(/at (\w+)/);
          return match ? match[1] : line.substring(0, 40);
        };
        
        const caller1 = getFunctionName(lines[2] || '');
        const caller2 = getFunctionName(lines[3] || '');
        const caller3 = getFunctionName(lines[4] || '');
        
        const msg = `🔴 ${node.id.slice(-8)}: (${node.x.toFixed(1)},${node.y.toFixed(1)}) → ROUNDED to (${safeNodes[idx].x},${safeNodes[idx].y})`;
        const trace = `  ${caller1} > ${caller2} > ${caller3}`;
        
        console.error(msg);
        console.error('   Stack:', caller1, '>', caller2, '>', caller3);
        
        setDebugInfo(prev => [...prev.slice(-2), msg, trace]);
      }
    });
    
    setNodesState(safeNodes);
  };
  
  const nodes = nodesState;
  const [connections, setConnections] = useState<Connection[]>(config?.initialWorkflow?.connections || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<{ from: string; to: string } | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(config?.initialWorkflow?.name || processName || 'New Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempWorkflowName, setTempWorkflowName] = useState('New Workflow');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionDragPos, setConnectionDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<{ from: string; to: string } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showDocLibrary, setShowDocLibrary] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [propertiesPos, setPropertiesPos] = useState<{ x: number; y: number } | null>(null);
  const [draggingProperties, setDraggingProperties] = useState(false);
  const [propertiesDragStart, setPropertiesDragStart] = useState({ x: 0, y: 0 });
  const [pendingNodePosition, setPendingNodePosition] = useState<{ x: number; y: number; connection: Connection } | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<FlowNode | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [deployCustomerId, setDeployCustomerId] = useState('');
  const [nodeTooltip, setNodeTooltip] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [savedPropertiesPos, setSavedPropertiesPos] = useState<{ x: number; y: number } | null>(null);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showLoadTemplateDialog, setShowLoadTemplateDialog] = useState(false);
  const [showCreateNewDialog, setShowCreateNewDialog] = useState(false);
  const [showClearCanvasDialog, setShowClearCanvasDialog] = useState(false);
  const [showExitWarningDialog, setShowExitWarningDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showLoadWorkflowDialog, setShowLoadWorkflowDialog] = useState(false);
  const [saveLog, setSaveLog] = useState<string[]>([]);
  const [loadLog, setLoadLog] = useState<string[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [debugRefreshTrigger, setDebugRefreshTrigger] = useState(0);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string; savedAt: string; nodes: FlowNode[]; connections: Connection[] }>>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<Array<{ id: string; name: string; savedAt: string; nodes: FlowNode[]; connections: Connection[] }>>([]);
  const [snapTarget, setSnapTarget] = useState<{ x: number; y: number; connectionId: string } | null>(null);
  const [lineSnapTarget, setLineSnapTarget] = useState<{ from: string; to: string; x: number; y: number } | null>(null);
  const [history, setHistory] = useState<Array<{ nodes: FlowNode[]; connections: Connection[] }>>([
    { 
      nodes: config?.initialWorkflow?.nodes || [{ id: '1', type: 'start', label: 'Start', x: 400, y: 100 }], 
      connections: config?.initialWorkflow?.connections || [] 
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [autoScrollInterval, setAutoScrollInterval] = useState<number | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<{ from: string; to: string; criteriaId: string; x: number; y: number; originalLabel: string } | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [draggingIconAttachment, setDraggingIconAttachment] = useState<'time-sink' | 'quality-risk' | null>(null);
  const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false);
  const [orgMetadata, setOrgMetadata] = useState<OrganizationWorkflowMetadata>({
    organizationId: '',
    triggers: [],
    inputs: [],
    outputs: [],
    dependencies: []
  });
  
  const connectionHandledRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasBodyRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for multi-node dragging to avoid stale closures
  const multiDragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isMultiDragging = useRef(false);
  const didDragRef = useRef(false); // Track if we actually dragged
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // Store drag start position as ref to avoid stale state
  
  // Track whether initial workflow has been loaded
  const initialLoadCompleteRef = useRef(false);

  // Debug helper
  const addDebug = useCallback((msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev.slice(-4), msg]); // Keep last 5 messages
  }, []);
  
  // Helper to mark changes as unsaved (only after initial load)
  const markAsUnsaved = useCallback(() => {
    if (initialLoadCompleteRef.current) {
      setHasUnsavedChanges(true);
      console.log('🔄 Marked as unsaved (user made a change)');
    } else {
      console.log('⏭️ Skipping unsaved mark (initial load not complete)');
    }
  }, []);

  // Copy debug info with fallback for restrictive clipboard policies
  const copyDebugInfo = () => {
    const debugData = [
      '=== DEBUG INFO ===',
      ...debugInfo,
      '',
      '=== STATE ===',
      `Multi-select: ${selectedNodes.size} nodes [${Array.from(selectedNodes).join(', ')}]`,
      `Selected: ${selectedNode || 'None'}`,
      `Dragging: ${draggingNode || 'No'}`,
      `Multi-drag: ${isMultiDragging.current}`,
      `Did drag: ${didDragRef.current}`,
      `History: ${historyIndex + 1}/${history.length}`,
      '',
      '=== NODES ===',
      ...nodes.map(n => `${n.id}: ${n.label} (${n.x}, ${n.y})`)
    ].join('\n');
    
    // Use legacy execCommand method which works in more restrictive contexts
    const textarea = document.createElement('textarea');
    textarea.value = debugData;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Debug info copied to clipboard!');
      } else {
        console.log('=== DEBUG DATA ===');
        console.log(debugData);
        alert('Could not copy. Debug info logged to console.');
      }
    } catch (err) {
      console.log('=== DEBUG DATA ===');
      console.log(debugData);
      alert('Could not copy. Debug info logged to console.');
    }
    
    document.body.removeChild(textarea);
  };

  // Track whether we're in an undo/redo operation to prevent recording history during those
  const isUndoRedoRef = useRef(false);
  
  // Automatically record history when nodes or connections change
  // This ensures each state change gets its own history entry
  useEffect(() => {
    // Skip if this is an undo/redo operation
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    
    // Skip the initial mount
    if (history.length === 1 && historyIndex === 0 && nodes.length === 1 && nodes[0].type === 'start') {
      return;
    }
    
    const snapshot = { 
      nodes: JSON.parse(JSON.stringify(nodes)), 
      connections: JSON.parse(JSON.stringify(connections)) 
    };
    
    setHistoryIndex(currentIndex => {
      setHistory(prevHistory => {
        // Check if this snapshot is identical to the current one - if so, skip it
        const currentEntry = prevHistory[currentIndex];
        if (currentEntry && 
            JSON.stringify(currentEntry.nodes) === JSON.stringify(snapshot.nodes) &&
            JSON.stringify(currentEntry.connections) === JSON.stringify(snapshot.connections)) {
          console.log(`⏭️ Skipping duplicate history entry at index ${currentIndex}`);
          return prevHistory;
        }
        
        // Truncate any "future" history if we've undone and are now making new changes
        const newHistory = prevHistory.slice(0, currentIndex + 1);
        newHistory.push(snapshot);
        
        // Limit history to 100 entries to prevent memory issues
        const trimmedHistory = newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
        
        const newIndex = trimmedHistory.length - 1;
        console.log(`📝 Auto-recording history: ${snapshot.nodes.length} nodes, index ${currentIndex} → ${newIndex}, history length: ${trimmedHistory.length}`);
        
        return trimmedHistory;
      });
      
      // Increment index (will be adjusted if history was trimmed)
      const newIndex = currentIndex + 1;
      return newIndex > 100 ? 100 : newIndex;
    });
  }, [nodes, connections]);

  // Calculate and report complexity metrics when nodes change
  useEffect(() => {
    if (onComplexityUpdate) {
      const complexity = calculateWorkflowComplexity(nodes, connections);
      console.log('📊 Workflow complexity calculated:', complexity);
      console.log('  - Inputs:', complexity.inputsCount, '(Score:', complexity.inputsScore + ')');
      console.log('  - Steps:', complexity.stepsCount, '(Score:', complexity.stepsScore + ')');
      console.log('  - Dependencies:', complexity.dependenciesCount, '(Score:', complexity.dependenciesScore + ')');
      onComplexityUpdate(complexity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections]); // onComplexityUpdate intentionally omitted to prevent infinite loop
  
  // Track unsaved changes when nodes or connections change
  // NO AUTO-SAVE - user must explicitly click Save button
  useEffect(() => {
    // Skip if this is the initial state (just the start node)
    if (nodes.length === 1 && nodes[0].type === 'start' && connections.length === 0) {
      return;
    }
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    
    // Update debug info to show unsaved status
    const logs: string[] = [];
    logs.push(`⚠️ UNSAVED CHANGES`);
    logs.push(`   Nodes: ${nodes.length}`);
    logs.push(`   Connections: ${connections.length}`);
    logs.push(`   Click "Save Workflow" to save`);
    setSaveLog(logs);
  }, [nodes, connections]);
  
  // Manual save function - only saves when user clicks "Save Workflow" button
  const handleSaveWorkflow = () => {
    console.log('💾 ==========================================');
    console.log('💾 MANUAL SAVE TRIGGERED');
    console.log('💾 ==========================================');
    console.log('  Process ID:', processId);
    console.log('  Org ID:', organizationId);
    console.log('  Process Name:', processName);
    console.log('  Nodes:', nodes.length);
    console.log('  Connections:', connections.length);
    
    const workflowToSave = {
      id: processId,
      name: workflowName,
      savedAt: new Date().toISOString(),
      nodes: nodes,
      connections: connections,
      processId: processId,
      organizationId: organizationId
    };
    
    const storageKey = `workflow_${organizationId}_${processId}`;
    
    console.log('  Storage Key:', storageKey);
    console.log('  Workflow Data:', workflowToSave);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(workflowToSave));
      console.log('✅ SAVE SUCCESSFUL');
      
      // Verify it was actually saved
      const verification = localStorage.getItem(storageKey);
      if (verification) {
        console.log('✅ VERIFICATION: Workflow exists in localStorage');
        console.log('  Stored data length:', verification.length, 'chars');
        
        // Update save log
        const logs: string[] = [];
        logs.push(`💾 SAVED`);
        logs.push(`   Process: "${processName}"`);
        logs.push(`   Storage Key: ${storageKey}`);
        logs.push(`   Nodes: ${nodes.length}`);
        logs.push(`   Connections: ${connections.length}`);
        logs.push(`   ✅ SAVED AT ${new Date().toLocaleTimeString()}`);
        setSaveLog(logs);
        addDebug(`✅ Workflow saved at ${new Date().toLocaleTimeString()}`);
        
        // Clear unsaved changes flag
        setHasUnsavedChanges(false);
        
        // Call config callback
        config?.onWorkflowSave?.(workflowToSave);
        
        // Refresh debug panel
        setDebugRefreshTrigger(prev => prev + 1);
        
      } else {
        console.error('❌ VERIFICATION FAILED: Workflow NOT in localStorage!');
      }
      
      // Show all workflow keys in localStorage
      const allWorkflowKeys = Object.keys(localStorage).filter(k => k.startsWith('workflow_'));
      console.log('📋 All workflow keys in localStorage:', allWorkflowKeys);
      
    } catch (error) {
      console.error('❌ SAVE FAILED:', error);
    }
    
    console.log('💾 ==========================================');
  };
  
  // Confirm exit without saving
  const handleExitWithoutSaving = () => {
    addDebug('🚪 Exiting without saving');
    setShowExitWarningDialog(false);
    onClose?.();
  };
  
  // Legacy recordHistory function - now a no-op since we auto-record
  // Keeping it so we don't have to remove all the calls throughout the code
  const recordHistory = useCallback(() => {
    // No-op: history is now recorded automatically in the useEffect above
  }, []);

  // Undo to previous state
  const handleUndo = useCallback(() => {
    console.log(`↩️ Undo: current index=${historyIndex}, history length=${history.length}`);
    isUndoRedoRef.current = true; // Prevent auto-recording during undo
    setHistoryIndex(prevIndex => {
      if (prevIndex > 0 && history.length > 0 && history[prevIndex - 1]) {
        const previousState = history[prevIndex - 1];
        if (previousState && previousState.nodes && previousState.connections) {
          console.log(`✅ Undoing to state with ${previousState.nodes.length} nodes`);
          setNodes(JSON.parse(JSON.stringify(previousState.nodes)));
          setConnections(JSON.parse(JSON.stringify(previousState.connections)));
          setHasUnsavedChanges(true);
          return prevIndex - 1;
        }
      }
      console.log('⚠️ Cannot undo - at beginning of history or invalid state');
      return prevIndex;
    });
  }, [history, historyIndex]);

  const confirmDeleteSelectedNodes = () => {
    console.log(`🗑️ Confirm delete called for ${selectedNodes.size} nodes:`, Array.from(selectedNodes));
    if (selectedNodes.size === 0) {
      console.log('⚠️ No nodes selected, aborting delete');
      return;
    }
    
    // Check if trying to delete start node
    if (Array.from(selectedNodes).some(id => nodes.find(n => n.id === id)?.type === 'start')) {
      alert('Cannot delete the start node');
      console.log('⚠️ Cannot delete start node');
      return;
    }
    
    recordHistory();
    const remainingNodes = nodes.filter(n => !selectedNodes.has(n.id));
    const remainingConnections = connections.filter(c => !selectedNodes.has(c.from) && !selectedNodes.has(c.to));
    console.log(`✅ Deleting nodes. Before: ${nodes.length}, After: ${remainingNodes.length}`);
    
    setNodes(remainingNodes);
    setConnections(remainingConnections);
    setSelectedNodes(new Set());
    setShowDeleteConfirm(false);
    setHasUnsavedChanges(true);
  };

  const createNewWorkflow = () => {
    // Reset to initial state with just the start node
    const initialNodes = [{
      id: 'start',
      type: 'start' as const,
      label: 'Start',
      x: 400,
      y: 100,
      config: {},
    }];
    setNodes(initialNodes);
    setConnections([]);
    setSelectedNode(null);
    setSelectedNodes(new Set());
    setShowPropertiesPanel(false);
    setHasUnsavedChanges(true);
    setWorkflowName(processName || 'Untitled Workflow');
    // Reset history with the new clean state
    setHistory([{ nodes: initialNodes, connections: [] }]);
    setHistoryIndex(0);
    setShowCreateNewDialog(false);
  };
  
  // Clear canvas - DELETE saved workflow and reset to empty state
  const handleClearCanvas = () => {
    const storageKey = `workflow_${organizationId}_${processId}`;
    
    console.log('🗑️ ==========================================');
    console.log('🗑️ CLEARING WORKFLOW');
    console.log('🗑️ ==========================================');
    console.log('  Process:', processName);
    console.log('  Storage Key:', storageKey);
    
    // DELETE the workflow from localStorage
    localStorage.removeItem(storageKey);
    console.log('✅ Workflow DELETED from localStorage');
    
    addDebug(`🗑️ Cleared workflow for ${processName}`);
    
    // Reset to initial state
    const initialNodes = [{
      id: 'start',
      type: 'start' as const,
      label: 'Start',
      x: 400,
      y: 100,
      config: {},
    }];
    setNodes(initialNodes);
    setConnections([]);
    setSelectedNode(null);
    setSelectedNodes(new Set());
    setShowPropertiesPanel(false);
    setHasUnsavedChanges(false); // NOT unsaved - we just cleared it intentionally
    setWorkflowName(processName || 'Untitled Workflow');
    setHistory([{ nodes: initialNodes, connections: [] }]);
    setHistoryIndex(0);
    setShowClearCanvasDialog(false);
    
    // Update save log to show cleared state
    const logs: string[] = [];
    logs.push(`🗑️ WORKFLOW CLEARED`);
    logs.push(`   Process: "${processName}"`);
    logs.push(`   Storage Key: ${storageKey}`);
    logs.push(`   ✅ DELETED AT ${new Date().toLocaleTimeString()}`);
    setSaveLog(logs);
    
    console.log('✅ Canvas cleared and workflow deleted');
    console.log('🗑️ ==========================================');
  };

  useEffect(() => {
    const selectedData = nodes.find(n => n.id === selectedNode) || null;
    setSelectedNodeData(selectedData);
  }, [selectedNode, nodes]);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await LocalWorkflowStorage.loadTemplates();
        console.log('✅ Loaded templates:', loadedTemplates.length);
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('❌ Error loading templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Load organization metadata for triggers/inputs/outputs/dependencies
  useEffect(() => {
    const loadMetadata = async () => {
      if (organizationId) {
        try {
          const metadata = await LocalWorkflowStorage.loadMetadata(organizationId);
          console.log('✅ Loaded organization metadata for', organizationId);
          setOrgMetadata(metadata);
        } catch (error) {
          console.error('❌ Error loading organization metadata:', error);
        }
      }
    };
    loadMetadata();
  }, [organizationId]);

  // Handlers for adding items to organization metadata
  const handleAddTrigger = async (trigger: string) => {
    if (organizationId) {
      await LocalWorkflowStorage.addTrigger(organizationId, trigger);
      const updated = await LocalWorkflowStorage.loadMetadata(organizationId);
      setOrgMetadata(updated);
    }
  };

  const handleAddInput = async (input: string) => {
    if (organizationId) {
      await LocalWorkflowStorage.addInput(organizationId, input);
      const updated = await LocalWorkflowStorage.loadMetadata(organizationId);
      setOrgMetadata(updated);
    }
  };

  const handleAddOutput = async (output: string) => {
    if (organizationId) {
      await LocalWorkflowStorage.addOutput(organizationId, output);
      const updated = await LocalWorkflowStorage.loadMetadata(organizationId);
      setOrgMetadata(updated);
    }
  };

  const handleAddDependency = async (dependency: string) => {
    if (organizationId) {
      await LocalWorkflowStorage.addDependency(organizationId, dependency);
      const updated = await LocalWorkflowStorage.loadMetadata(organizationId);
      setOrgMetadata(updated);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Delete key - delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.size > 0 && !showDeleteConfirm) {
        e.preventDefault();
        console.log(`🗑️ Delete key pressed with ${selectedNodes.size} nodes selected`);
        setShowDeleteConfirm(true);
      }
      // Ctrl+Z or Cmd+Z - undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        console.log('↩️ Undo triggered');
        handleUndo();
      }
      // Ctrl+A or Cmd+A - select all nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allNodeIds = new Set(nodes.map(n => n.id));
        setSelectedNodes(allNodeIds);
        console.log(`✅ Selected all ${allNodeIds.size} nodes`);
      }
      // Escape - clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodes(new Set());
        setSelectionBox(null);
        console.log('❌ Cleared selection');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, historyIndex, showDeleteConfirm, handleUndo, nodes]);

  const handleDragFromPalette = (type: FlowNode['type']) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData('nodeType', type);
    };
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if dropping an icon attachment
    const iconAttachmentType = e.dataTransfer.getData('iconAttachmentType') as 'time-sink' | 'quality-risk' | '';
    if (iconAttachmentType && canvasRef.current) {
      // Find the node under the drop position
      const rect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left - panOffset.x;
      const dropY = e.clientY - rect.top - panOffset.y;
      
      const targetNode = nodes.find(n => {
        const nodeSize = 60;
        return dropX >= n.x && dropX <= n.x + nodeSize && 
               dropY >= n.y && dropY <= n.y + nodeSize;
      });
      
      if (targetNode) {
        recordHistory();
        const attachments = targetNode.attachments || [];
        
        // Check if this attachment type already exists
        if (!attachments.some(a => a.type === iconAttachmentType)) {
          const updatedNodes = nodes.map(n => 
            n.id === targetNode.id 
              ? { ...n, attachments: [...attachments, { id: Date.now().toString(), type: iconAttachmentType }] }
              : n
          );
          setNodes(updatedNodes);
          markAsUnsaved();
        }
      }
      setDraggingIconAttachment(null);
      return;
    }
    
    const nodeType = e.dataTransfer.getData('nodeType') as FlowNode['type'];
    if (!nodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left - panOffset.x);
    const y = Math.round(e.clientY - rect.top - panOffset.y);

    console.log(`🎯 PALETTE DROP at (${x}, ${y}), lineSnapTarget:`, lineSnapTarget);

    const newNode: FlowNode = {
      id: Date.now().toString(),
      type: nodeType,
      label: nodeTemplates[nodeType].label,
      x: x - 30,
      y: y - 30,
      config: {},
    };

    let connectedToEndpoint = false;
    
    // PRIORITY 1: Check if dropped on a line snap target (for inserting between nodes)
    // This takes priority over endpoint snapping to allow inserting nodes into existing connections
    if (lineSnapTarget) {
      console.log('🔗 Node from palette snapped to line - inserting between nodes!');
      
      recordHistory();
      
      // Snap node to line position (rounded to avoid decimals)
      newNode.x = Math.round(lineSnapTarget.x);
      newNode.y = Math.round(lineSnapTarget.y);
      
      let updatedNodes = [...nodes, newNode];
      
      // Remove old connection and create two new connections
      const oldConn = connections.find(c => c.from === lineSnapTarget.from && c.to === lineSnapTarget.to);
      const updatedConnections = connections
        .filter(c => !(c.from === lineSnapTarget.from && c.to === lineSnapTarget.to))
        .concat([
          { from: lineSnapTarget.from, to: newNode.id, label: oldConn?.label, criteriaId: oldConn?.criteriaId },
          { from: newNode.id, to: lineSnapTarget.to }
        ]);
      setConnections(updatedConnections);
      
      // DON'T redistribute - the node is exactly where the user placed it on the line
      
      setNodes(updatedNodes);
      setLineSnapTarget(null);
      markAsUnsaved();
      connectedToEndpoint = true;
    }
    
    // PRIORITY 2: Check if dropped near a pending decision branch endpoint
    // Only check this if NOT already snapped to a line
    if (!connectedToEndpoint) {
      const pendingConnections = connections.filter(c => c.to.startsWith('pending-'));
      
      for (const conn of pendingConnections) {
        const sourceNode = nodes.find(n => n.id === conn.from);
        if (sourceNode) {
          // Calculate all endpoints for this decision node
          // Use ALL connections (both pending and connected) for stable positioning
          // Sort by criteriaId to ensure stable branch ordering
          const allConnectionsFromSource = getSortedConnectionsFromNode(conn.from, connections, sourceNode);
          const connIndex = allConnectionsFromSource.findIndex(c => c.to === conn.to);
          
          const endpoint = calculateEndpointPosition(sourceNode, connIndex, allConnectionsFromSource.length, panOffset);
          
          // Check distance between drop point and endpoint (in SVG coordinates)
          const dropX = x + 30; // Center of new node
          const dropY = y + 30;
          const distance = Math.sqrt(
            Math.pow(dropX - endpoint.x, 2) + 
            Math.pow(dropY - endpoint.y, 2)
          );
          
          // REDUCED threshold from 100px to 70px to reduce conflicts with line snapping
          if (distance < 70) {
            console.log('🎯 Node snapped to endpoint from palette');
            
            // Record history before making changes
            recordHistory();
            
            // Snap to exact endpoint position (rounded to avoid decimals)
            newNode.x = Math.round(endpoint.x - 30);
            newNode.y = Math.round(endpoint.y - 30);
            
            const updatedNodes = [...nodes, newNode];
            setNodes(updatedNodes);
            
            // Update the pending connection to point to the new node
            const updatedConnections = connections.map(c => 
              c.to === conn.to
                ? { ...c, to: newNode.id }
                : c
            );
            setConnections(updatedConnections);
            
            // DON'T redistribute - node is locked at snap position
            // Pending endpoints will naturally adjust for remaining branches
            
            setSelectedNode(newNode.id);
            markAsUnsaved();
            connectedToEndpoint = true;
            break;
          }
        }
      }
    }

    // If not connected to endpoint or line, just add the node normally
    if (!connectedToEndpoint) {
      recordHistory();
      setNodes([...nodes, newNode]);
      setSelectedNode(newNode.id);
      markAsUnsaved();
    }
    
    // Clear snap targets
    setSnapTarget(null);
    setLineSnapTarget(null);
    
    // Position properties panel using saved position or default
    if (savedPropertiesPos) {
      setPropertiesPos(savedPropertiesPos);
    } else if (canvasBodyRef.current) {
      const rect = canvasBodyRef.current.getBoundingClientRect();
      setPropertiesPos({ 
        x: rect.right - 220,
        y: rect.top + 10 
      });
    }
    setShowPropertiesPanel(true);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if dragging near any pending endpoint
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // For palette drags, calculate position where node center would be
    const mouseX = e.clientX - rect.left - panOffset.x;
    const mouseY = e.clientY - rect.top - panOffset.y;
    
    // First check for line snapping (higher priority)
    let foundLineSnap = false;
    const snapThreshold = 50; // Detection threshold for line snapping (increased from 40 to make it easier to snap)
    
    console.log(`🔍 Palette DragOver: mouse at (${mouseX.toFixed(0)}, ${mouseY.toFixed(0)}), checking ${connections.filter(c => !c.to.startsWith('pending-')).length} real connections`);
    
    for (const conn of connections) {
      if (conn.to.startsWith('pending-')) continue;
      
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        // Node centers in world coordinates
        const fromCenter = { x: fromNode.x + 30, y: fromNode.y + 30 };
        const toCenter = { x: toNode.x + 30, y: toNode.y + 30 };
        // Dragged node center (where it would be placed)
        const dragCenter = { x: mouseX, y: mouseY };
        
        const lineLengthSq = Math.pow(toCenter.x - fromCenter.x, 2) + Math.pow(toCenter.y - fromCenter.y, 2);
        const t = Math.max(0, Math.min(1, (
          (dragCenter.x - fromCenter.x) * (toCenter.x - fromCenter.x) +
          (dragCenter.y - fromCenter.y) * (toCenter.y - fromCenter.y)
        ) / lineLengthSq));
        
        const closest = {
          x: fromCenter.x + t * (toCenter.x - fromCenter.x),
          y: fromCenter.y + t * (toCenter.y - fromCenter.y)
        };
        
        const distanceToLine = Math.sqrt(
          Math.pow(dragCenter.x - closest.x, 2) + 
          Math.pow(dragCenter.y - closest.y, 2)
        );
        
        // Use percentage-based exclusion zone matching the drag logic
        const lineLength = Math.sqrt(lineLengthSq);
        const exclusionPercentage = 0.20; // Exclude 20% from each end
        const isInValidZone = t > exclusionPercentage && t < (1 - exclusionPercentage);
        
        const fromLabel = fromNode.label || fromNode.id.slice(-6);
        const toLabel = toNode.label || toNode.id.slice(-6);
        
        if (distanceToLine < snapThreshold * 2) { // Log anything close
          console.log(`  📏 ${fromLabel}→${toLabel}: dist=${distanceToLine.toFixed(1)}px, t=${t.toFixed(2)}, valid=${isInValidZone}, lineLen=${lineLength.toFixed(1)}`);
        }
        
        if (distanceToLine < snapThreshold && isInValidZone) {
          console.log(`  ✅ LINE SNAP FOUND: ${fromLabel}→${toLabel}`);
          setLineSnapTarget({ 
            from: conn.from, 
            to: conn.to, 
            x: Math.round(closest.x - 30), 
            y: Math.round(closest.y - 30) 
          });
          foundLineSnap = true;
          setSnapTarget(null); // Clear pending snap if line snap is active
          break;
        }
      }
    }
    
    if (!foundLineSnap) {
      setLineSnapTarget(null);
      
      // Check for pending endpoint snapping
      const pendingConnections = connections.filter(c => c.to.startsWith('pending-'));
      let foundSnap = false;
      
      for (const conn of pendingConnections) {
        const sourceNode = nodes.find(n => n.id === conn.from);
        if (sourceNode) {
          const allConnectionsFromSource = getSortedConnectionsFromNode(conn.from, connections, sourceNode);
          const connIndex = allConnectionsFromSource.findIndex(c => c.to === conn.to);
          
          const endpoint = calculateEndpointPosition(sourceNode, connIndex, allConnectionsFromSource.length, panOffset);
          
          const distance = Math.sqrt(
            Math.pow(mouseX + 30 - endpoint.x, 2) + 
            Math.pow(mouseY + 30 - endpoint.y, 2)
          );
          
          // Reduced threshold to match drag logic and give line snap priority
          if (distance < 60) {
            setSnapTarget({ x: Math.round(endpoint.x - 30), y: Math.round(endpoint.y - 30), connectionId: conn.to });
            foundSnap = true;
            break;
          }
        }
      }
      
      if (!foundSnap && snapTarget) {
        setSnapTarget(null);
      }
    }
  };

  const handleNodeClick = (nodeId: string, event?: React.MouseEvent) => {
    console.log(`🖱️ NodeClick called for ${nodeId.slice(-8)}, didDrag: ${didDragRef.current}, draggingNode: ${draggingNode?.slice(-8) || 'null'}, multiDragSize: ${multiDragStartPositions.current.size}, shiftKey: ${event?.shiftKey}`);
    
    // Don't handle click if we just finished dragging
    if (didDragRef.current) {
      addDebug(`🚫 Click ignored (just dragged)`);
      // Reset the flag so next click works
      didDragRef.current = false;
      return;
    }
    
    // SHIFT+CLICK: Add/remove node from multi-selection
    if (event?.shiftKey) {
      const newSelection = new Set(selectedNodes);
      if (newSelection.has(nodeId)) {
        // Remove from selection
        newSelection.delete(nodeId);
        addDebug(`➖ Removed ${nodeId.slice(-8)} from selection`);
      } else {
        // Add to selection
        newSelection.add(nodeId);
        addDebug(`➕ Added ${nodeId.slice(-8)} to selection`);
      }
      setSelectedNodes(newSelection);
      console.log(`✅ Shift+click: now ${newSelection.size} nodes selected`);
      
      // Don't open properties panel for multi-selection
      if (newSelection.size > 1) {
        setSelectedNode(null);
        setShowPropertiesPanel(false);
      } else if (newSelection.size === 1) {
        // If only one node left, select it and show properties
        const singleNode = Array.from(newSelection)[0];
        setSelectedNode(singleNode);
        
        // Position properties panel
        if (savedPropertiesPos) {
          setPropertiesPos(savedPropertiesPos);
        } else if (canvasBodyRef.current) {
          const rect = canvasBodyRef.current.getBoundingClientRect();
          setPropertiesPos({ 
            x: rect.right - 220,
            y: rect.top + 10 
          });
        }
        setShowPropertiesPanel(true);
      } else {
        // No nodes selected
        setSelectedNode(null);
        setShowPropertiesPanel(false);
      }
      return;
    }
    
    // If this node is part of a multi-selection, don't change the selection
    // Only open properties panel for single-selected node
    if (selectedNodes.has(nodeId) && selectedNodes.size > 1) {
      addDebug(`🚫 Click ignored (in multi-select)`);
      // Multi-selection - don't change selection, don't open properties
      return;
    }
    
    // Clear multi-selection when clicking on a single node
    if (selectedNodes.size > 0) {
      addDebug(`Clearing multi-select`);
      setSelectedNodes(new Set());
    }
    
    addDebug(`✅ Node clicked: ${nodeId.slice(-8)}`);
    setSelectedNode(nodeId);
    
    // Position properties panel using saved position or default
    if (savedPropertiesPos) {
      setPropertiesPos(savedPropertiesPos);
    } else if (canvasBodyRef.current) {
      const rect = canvasBodyRef.current.getBoundingClientRect();
      setPropertiesPos({ 
        x: rect.right - 220, // 220px = 208px width + 12px margin
        y: rect.top + 10 
      });
    }
    setShowPropertiesPanel(true);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0 || connectingFrom) return;
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    addDebug(`MouseDown: ${nodeId.slice(-8)}, selected: ${selectedNodes.size} nodes`);

    // Reset didDragRef at the start of a new mouse interaction
    // This ensures we start fresh for each mousedown
    didDragRef.current = false;
    
    setDraggingNode(nodeId);
    
    // Store initial mouse position in ref (not state) to avoid stale closure issues
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    console.log(`🖱️ MouseDown at screen coords: (${mouseX}, ${mouseY})`);
    dragOffsetRef.current = {
      x: mouseX,
      y: mouseY,
    };
    
    // If this node is part of multi-selection, store positions of all selected nodes
    // IMPORTANT: Always use the CURRENT node positions from the nodes array
    console.log(`🖱️ MouseDown on ${nodeId.slice(-8)}, selectedNodes:`, Array.from(selectedNodes), 'has nodeId:', selectedNodes.has(nodeId));
    
    if (selectedNodes.has(nodeId) && selectedNodes.size > 1) {
      // Multi-node drag: Store current positions of all selected nodes
      const positions = new Map<string, { x: number; y: number }>();
      nodes.forEach(n => {
        if (selectedNodes.has(n.id)) {
          // Store the current position from the nodes state
          positions.set(n.id, { x: n.x, y: n.y });
          console.log(`  📍 Multi-drag SETUP: storing ${n.id.slice(-8)} at EXACT position (${n.x}, ${n.y})`);
        }
      });
      console.log(`  📍 MOUSEDOWN SUMMARY: ${positions.size} nodes, mouse at (${mouseX}, ${mouseY})`);
      
      if (positions.size === 0) {
        console.error('❌ No positions stored for multi-drag!');
        return;
      }
      
      multiDragStartPositions.current = positions;
      isMultiDragging.current = true;
      const nodeIds = Array.from(positions.keys()).map(id => id.slice(-8)).join(', ');
      addDebug(`✅ Multi-drag setup: ${positions.size} nodes [${nodeIds}]`);
    } else {
      // Single node drag: Store only this node's current position
      console.log(`  �� Single-drag: storing ${nodeId.slice(-8)} at (${node.x}, ${node.y})`);
      multiDragStartPositions.current = new Map([[nodeId, { x: node.x, y: node.y }]]);
      isMultiDragging.current = false;
      addDebug(`Single drag setup: ${nodeId.slice(-8)}`);
      if (selectedNodes.size > 0) {
        console.log(`⚠️ Node not in selection or only 1 selected. Size: ${selectedNodes.size}, has: ${selectedNodes.has(nodeId)}`);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Check for middle mouse button OR ctrl+left click for panning
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      // Store the starting mouse position relative to current offset
      setPanStart({ 
        x: e.clientX - panOffset.x, 
        y: e.clientY - panOffset.y 
      });
      document.body.style.cursor = 'grabbing';
      return;
    }
    
    // Regular left click on canvas - start selection box
    if (e.button === 0) {
      // Start selection box
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      }
      setSelectedConnection(null);
      setSelectedNode(null);
      setShowPropertiesPanel(false);
      setSelectedNodes(new Set());
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Panning is now handled by global event listener
    if (isPanning) {
      return;
    }
    
    // Update selection box
    if (selectionBox && !draggingNode && !connectingFrom) {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionBox({ ...selectionBox, endX: x, endY: y });
      }
      return;
    }
    
    if (draggingNode && !connectingFrom) {
      // Safety check: ensure we have start positions stored
      if (multiDragStartPositions.current.size === 0) {
        console.warn('⚠️ Dragging but no start positions stored, aborting drag');
        setDraggingNode(null);
        return;
      }
      
      // Calculate the delta from where the drag started
      const currentMouseX = e.clientX;
      const currentMouseY = e.clientY;
      const deltaX = currentMouseX - dragOffsetRef.current.x;
      const deltaY = currentMouseY - dragOffsetRef.current.y;
      
      // Get current position for snapping/line detection (using main dragged node)
      const originalPos = multiDragStartPositions.current.get(draggingNode);
      if (!originalPos) {
        console.warn('⚠️ Dragging node not found in start positions, aborting');
        setDraggingNode(null);
        return;
      }
      
      const x = originalPos.x + deltaX;
      const y = originalPos.y + deltaY;
      
      // Debug logging to trace coordinate calculations
      if (multiDragStartPositions.current.size > 1) {
        console.log(`📐 MouseMove: screen(${currentMouseX},${currentMouseY}) - dragStart(${dragOffsetRef.current.x},${dragOffsetRef.current.y}) = delta(${deltaX},${deltaY})`);
        console.log(`📍 Original positions:`, Array.from(multiDragStartPositions.current.entries()).map(([id, pos]) => 
          `${id.slice(-6)}:(${pos.x},${pos.y})`
        ).join(', '));
        console.log(`📍 Main dragging node original pos:`, originalPos);
        console.log(`📍 Main dragging node will move to:`, { x, y });
      }
      
      // Auto-scroll when near edges
      if (canvasBodyRef.current) {
        const rect = canvasBodyRef.current.getBoundingClientRect();
        const edgeThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 5;
        
        let scrollX = 0;
        let scrollY = 0;
        
        if (e.clientX < rect.left + edgeThreshold) scrollX = scrollSpeed;
        if (e.clientX > rect.right - edgeThreshold) scrollX = -scrollSpeed;
        if (e.clientY < rect.top + edgeThreshold) scrollY = scrollSpeed;
        if (e.clientY > rect.bottom - edgeThreshold) scrollY = -scrollSpeed;
        
        if (scrollX !== 0 || scrollY !== 0) {
          if (!autoScrollInterval) {
            const interval = window.setInterval(() => {
              setPanOffset(prev => ({
                x: prev.x + scrollX,
                y: prev.y + scrollY
              }));
            }, 16); // ~60fps
            setAutoScrollInterval(interval);
          }
        } else if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          setAutoScrollInterval(null);
        }
      }
      
      // Check if near any connection line for inserting between nodes
      // Only allow line snapping for single node drag, not multi-drag
      let foundLineSnap = false;
      const lineSnapThreshold = 50; // Distance from line to trigger snap
      
      if (!isMultiDragging.current) {
        const realConnections = connections.filter(c => !c.to.startsWith('pending-'));
        console.log(`📊 Checking ${realConnections.length} real connections for line snap at drag pos (${(x + 30).toFixed(1)}, ${(y + 30).toFixed(1)})`);
        
        for (const conn of realConnections) {
          
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          if (fromNode && toNode && conn.from !== draggingNode && conn.to !== draggingNode) {
          // Get connection line endpoints
          const fromCenter = { x: fromNode.x + 30, y: fromNode.y + 30 };
          const toCenter = { x: toNode.x + 30, y: toNode.y + 30 };
          const dragCenter = { x: x + 30, y: y + 30 };
          
          // Calculate closest point on line to dragged node
          const lineLengthSq = Math.pow(toCenter.x - fromCenter.x, 2) + Math.pow(toCenter.y - fromCenter.y, 2);
          const t = Math.max(0, Math.min(1, (
            (dragCenter.x - fromCenter.x) * (toCenter.x - fromCenter.x) +
            (dragCenter.y - fromCenter.y) * (toCenter.y - fromCenter.y)
          ) / lineLengthSq));
          
          const closest = {
            x: fromCenter.x + t * (toCenter.x - fromCenter.x),
            y: fromCenter.y + t * (toCenter.y - fromCenter.y)
          };
          
          // Check distance to line
          const distanceToLine = Math.sqrt(
            Math.pow(dragCenter.x - closest.x, 2) + 
            Math.pow(dragCenter.y - closest.y, 2)
          );
          
          // Only snap if not too close to either endpoint (to avoid confusion with endpoint snapping)
          const distToFrom = Math.sqrt(
            Math.pow(dragCenter.x - fromCenter.x, 2) + 
            Math.pow(dragCenter.y - fromCenter.y, 2)
          );
          const distToTo = Math.sqrt(
            Math.pow(dragCenter.x - toCenter.x, 2) + 
            Math.pow(dragCenter.y - toCenter.y, 2)
          );
          // Calculate minimum distances from endpoints to avoid endpoint snap conflicts
          // Strategy: Use a percentage-based exclusion zone that adapts to line length
          const lineLength = Math.sqrt(lineLengthSq);
          const exclusionPercentage = 0.20; // Exclude 20% from each end
          const minEndpointDistance = Math.max(40, lineLength * exclusionPercentage); // At least 40px, or 20% of line length
          
          // Check if snap point is in the valid middle zone (not too close to endpoints)
          const isInValidZone = t > exclusionPercentage && t < (1 - exclusionPercentage);
          
          if (distanceToLine < lineSnapThreshold && isInValidZone) {
            const fromNodeLabel = fromNode.label || fromNode.id.slice(0, 6);
            const toNodeLabel = toNode.label || toNode.id.slice(0, 6);
            console.log(`🔗 Line snap detected: ${fromNodeLabel}→${toNodeLabel} (dist: ${distanceToLine.toFixed(1)}px, t: ${t.toFixed(2)}, lineLen: ${lineLength.toFixed(1)}px, exclusion: ${minEndpointDistance.toFixed(1)}px)`);
            addDebug(`Line snap: ${fromNodeLabel}→${toNodeLabel}`);
            setLineSnapTarget({ 
              from: conn.from, 
              to: conn.to, 
              x: Math.round(closest.x - 30), 
              y: Math.round(closest.y - 30) 
            });
            foundLineSnap = true;
            break;
          } else if (distanceToLine < lineSnapThreshold) {
            // Log why line snap was rejected
            const reasons = [];
            if (!isInValidZone) reasons.push(`t=${t.toFixed(2)} outside valid zone (${exclusionPercentage.toFixed(2)}-${(1-exclusionPercentage).toFixed(2)})`);
            if (reasons.length > 0) {
              console.log(`🚫 Line snap rejected for ${fromNode.label}→${toNode.label}: ${reasons.join(', ')}`);
            }
          }
        }
        }
      }
      
      if (!foundLineSnap) {
        setLineSnapTarget(null);
      } else {
        // If we found a line snap, clear any endpoint snap target
        setSnapTarget(null);
      }
      
      // Check if near any pending decision branch endpoint
      // IMPORTANT: Only check for endpoint snapping if we didn't find a line snap
      // This prevents conflicts where both types of snapping are active
      
      // CRITICAL FIX: Don't allow endpoint snap for nodes that already have incoming connections
      // This prevents already-connected nodes from re-snapping to their original endpoint positions
      const draggingNodeHasIncomingConnection = connections.some(c => c.to === draggingNode);
      
      if (draggingNodeHasIncomingConnection) {
        console.log(`🚫 Dragging node ${draggingNode?.slice(-8)} already has incoming connection - endpoint snap disabled`);
      }
      
      const pendingConnections = connections.filter(c => c.to.startsWith('pending-'));
      let foundSnap = false;
      
      if (!foundLineSnap && !draggingNodeHasIncomingConnection) {
        for (const conn of pendingConnections) {
        const sourceNode = nodes.find(n => n.id === conn.from);
        if (sourceNode) {
          // Calculate all endpoints for this decision node
          const allConnectionsFromSource = getSortedConnectionsFromNode(conn.from, connections, sourceNode);
          const connIndex = allConnectionsFromSource.findIndex(c => c.to === conn.to);
          
          const endpoint = calculateEndpointPosition(sourceNode, connIndex, allConnectionsFromSource.length, panOffset);
          
          // Check distance from dragged node center to endpoint
          const nodeCenterX = x + 30;
          const nodeCenterY = y + 30;
          const distance = Math.sqrt(
            Math.pow(nodeCenterX - endpoint.x, 2) + 
            Math.pow(nodeCenterY - endpoint.y, 2)
          );
          
          // REDUCED snap distance to give line snapping more priority
          const endpointSnapThreshold = 60;
          if (distance < endpointSnapThreshold) {
             console.log(`🎯 Endpoint snap detected: ${sourceNode.label || sourceNode.id.slice(-8)} branch ${connIndex + 1} (dist: ${distance.toFixed(1)}px, endpoint: ${endpoint.x.toFixed(1)},${endpoint.y.toFixed(1)})`);
            addDebug(`Endpoint snap: ${sourceNode.label} br${connIndex + 1}`);
            setSnapTarget({ x: endpoint.x - 30, y: endpoint.y - 30, connectionId: conn.to });
            foundSnap = true;
            break;
          } else if (distance < 100) {
            // Log near-misses to help debug
            console.log(`⚠️ Near endpoint but outside threshold: ${sourceNode.label} branch ${connIndex + 1} (dist: ${distance.toFixed(1)}px, threshold: ${endpointSnapThreshold}px)`);
          }
        }
      }
      } // End of if (!foundLineSnap && !draggingNodeHasIncomingConnection) block
      else if (foundLineSnap) {
        // Line snap is active, make sure endpoint snap is cleared
        console.log(`🔗 Line snap active - endpoint snap disabled`);
      }
      
      if (!foundSnap && !foundLineSnap) {
        setSnapTarget(null);
      }
      
      // Mark that we actually dragged (only if moved more than 3 pixels)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 3) {
        didDragRef.current = true;
      }
      
      // Multi-node dragging: move all selected nodes by the same delta
      if (multiDragStartPositions.current.size > 1) {
        const nodeIds = Array.from(multiDragStartPositions.current.keys()).map(id => id.slice(-8)).join(', ');
        addDebug(`🔄 Multi-drag Δ:(${deltaX.toFixed(0)},${deltaY.toFixed(0)}) [${nodeIds}]`);
        
        // Use functional setState to avoid stale closure issues
        setNodes(prevNodes => {
          const updated = prevNodes.map(n => {
            if (multiDragStartPositions.current.has(n.id)) {
              const originalPos = multiDragStartPositions.current.get(n.id)!;
              // SAFETY: Round to integers to prevent decimal drift
              const newX = Math.round(originalPos.x + deltaX);
              const newY = Math.round(originalPos.y + deltaY);
              console.log(`  ➡️ ${n.id.slice(-6)}: orig(${originalPos.x},${originalPos.y}) + delta(${deltaX.toFixed(0)},${deltaY.toFixed(0)}) = new(${newX},${newY})`);
              return {
                ...n,
                x: newX,
                y: newY
              };
            }
            return n;
          });
          return updated;
        });
      } else {
        // Single node dragging - round to integers
        setNodes(prevNodes => prevNodes.map(n => n.id === draggingNode ? { ...n, x: Math.round(x), y: Math.round(y) } : n));
      }
      
      markAsUnsaved();
    } else if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Get mouse position in SVG coordinates (no panOffset subtraction)
      setConnectionDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    console.log('🟡 Canvas mouseUp - connectingFrom:', connectingFrom, 'hoveredNode:', hoveredNode);
    
    // Handle selection box
    if (selectionBox) {
      const box = {
        left: Math.min(selectionBox.startX, selectionBox.endX) - panOffset.x,
        right: Math.max(selectionBox.startX, selectionBox.endX) - panOffset.x,
        top: Math.min(selectionBox.startY, selectionBox.endY) - panOffset.y,
        bottom: Math.max(selectionBox.startY, selectionBox.endY) - panOffset.y
      };
      
      const selected = new Set<string>();
      nodes.forEach(node => {
        const nodeRight = node.x + 60;
        const nodeBottom = node.y + 60;
        
        if (node.x < box.right && nodeRight > box.left &&
            node.y < box.bottom && nodeBottom > box.top) {
          selected.add(node.id);
        }
      });
      
      const selectedIds = Array.from(selected).map(id => id.slice(-8)).join(', ');
      addDebug(`✅ Box-selected ${selected.size} nodes [${selectedIds}]`);
      console.log('📦 Selection box selected nodes:', Array.from(selected));
      setSelectedNodes(selected);
      setSelectionBox(null);
      
      if (selected.size > 0) {
        return; // Don't process other mouseup logic
      }
    }
    
    // If we're connecting and hovering over a valid input port, complete the connection
    if (connectingFrom && hoveredNode && connectingFrom !== hoveredNode) {
      const targetNode = nodes.find(n => n.id === hoveredNode);
      // Only connect if target is not a Start node (start nodes can't have inputs)
      if (targetNode && targetNode.type !== 'start') {
        console.log('✅ Completing connection - from:', connectingFrom, 'to:', hoveredNode);
        
        // Check if connection already exists to prevent duplicates
        const connectionExists = connections.some(
          conn => conn.from === connectingFrom && conn.to === hoveredNode
        );
        
        if (!connectionExists) {
          recordHistory();
          const newConnection = { from: connectingFrom, to: hoveredNode };
          setConnections(prev => {
            const updated = [...prev, newConnection];
            console.log('📋 Updated connections array:', updated);
            return updated;
          });
        } else {
          console.log('���️ Connection already exists');
        }
      } else {
        console.log('❌ Cannot connect to start node');
      }
      setConnectingFrom(null);
      setConnectionDragPos(null);
      setHoveredNode(null);
      setDraggingNode(null);
      setIsPanning(false);
      return;
    }
    
    // Check if we just finished dragging a node - check if dropped on pending endpoint
    const wasDragging = draggingNode !== null;
    
    if (wasDragging && !connectingFrom && canvasRef.current) {
      const draggedNode = nodes.find(n => n.id === draggingNode);
      if (draggedNode) {
        // If there's a line snap target, insert node between two connected nodes
        if (lineSnapTarget) {
          console.log('🔗 Node snapped to line - inserting between nodes!');
          
          recordHistory();
          
          // Snap node to line position (rounded to avoid decimals)
          let updatedNodes = nodes.map(n => 
            n.id === draggingNode 
              ? { ...n, x: Math.round(lineSnapTarget.x), y: Math.round(lineSnapTarget.y) }
              : n
          );
          
          // Remove old connection and create two new connections
          const oldConn = connections.find(c => c.from === lineSnapTarget.from && c.to === lineSnapTarget.to);
          const updatedConnections = connections
            .filter(c => !(c.from === lineSnapTarget.from && c.to === lineSnapTarget.to))
            .concat([
              { from: lineSnapTarget.from, to: draggedNode.id, label: oldConn?.label, criteriaId: oldConn?.criteriaId },
              { from: draggedNode.id, to: lineSnapTarget.to }
            ]);
          setConnections(updatedConnections);
          
          // DON'T redistribute - line snap positions the inserted node precisely where the user wants it
          // Other nodes on decision branches should stay where they are
          
          setNodes(updatedNodes);
          setLineSnapTarget(null);
          setDraggingNode(null);
          setHasUnsavedChanges(true);
          return;
        }
        
        // If there's a snap target, snap to it and connect
        // CRITICAL: Check if node already has incoming connection - if so, ignore snap target
        const nodeHasIncomingConnection = connections.some(c => c.to === draggingNode);
        
        if (snapTarget && !nodeHasIncomingConnection) {
          const pendingConn = connections.find(c => c.to === snapTarget.connectionId);
          if (pendingConn) {
            addDebug(`Snap to (${snapTarget.x},${snapTarget.y})`);
            console.log('🎯 Node snapped to endpoint - connecting!');
            
            recordHistory();
            
            // Snap node to exact endpoint position (rounded to avoid decimals)
            const updatedNodes = nodes.map(n => 
              n.id === draggingNode 
                ? { ...n, x: Math.round(snapTarget.x), y: Math.round(snapTarget.y) }
                : n
            );
            setNodes(updatedNodes);
            
            // Update the pending connection to point to the dragged node
            const updatedConnections = connections.map(c => 
              c.to === snapTarget.connectionId
                ? { ...c, to: draggedNode.id }
                : c
            );
            setConnections(updatedConnections);
            
            // DON'T redistribute - node is locked at snap position
            
            setSnapTarget(null);
            setDraggingNode(null);
            setHasUnsavedChanges(true);
            return;
          }
        } else if (snapTarget && nodeHasIncomingConnection) {
          console.log(`🚫 Ignoring snapTarget in mouseup - node ${draggingNode?.slice(-8)} already has incoming connection`);
          setSnapTarget(null); // Clear the snap target
        }
        
        // If not snapped, record history for the move
        if (isMultiDragging.current) {
          // Multi-node move
          console.log('✅ Multi-drag complete, recording history');
          addDebug(`✅ Multi-move done`);
          recordHistory();
        } else {
          // Single node move
          addDebug(`✅ Single-move done`);
          recordHistory();
        }
      }
    }
    
    // Clear connection state if not completed
    if (connectingFrom) {
      console.log('⚠️ Connection not completed - clearing state');
      setConnectingFrom(null);
      setConnectionDragPos(null);
      setHoveredNode(null);
    }
    
    console.log('🏁 MouseUp - resetting drag state. didDrag:', didDragRef.current, 'multiDragSize:', multiDragStartPositions.current.size);
    
    // Log final state before clearing
    if (multiDragStartPositions.current.size > 0) {
      console.log('🏁 Drag involved these nodes:', 
        Array.from(multiDragStartPositions.current.keys()).map(id => id.slice(-6)).join(', ')
      );
      console.log('🏁 Their stored START positions were:',
        Array.from(multiDragStartPositions.current.entries()).map(([id, pos]) => 
          `${id.slice(-6)}:(${pos.x},${pos.y})`
        ).join(', ')
      );
      console.log('🏁 Their CURRENT positions are now:',
        nodes.filter(n => multiDragStartPositions.current.has(n.id)).map(n =>
          `${n.id.slice(-6)}:(${n.x.toFixed(0)},${n.y.toFixed(0)})`
        ).join(', ')
      );
    }
    
    setDraggingNode(null);
    
    // Clear multi-drag state
    const hadMultiDrag = multiDragStartPositions.current.size > 1;
    multiDragStartPositions.current = new Map(); // Clear multi-drag positions
    isMultiDragging.current = false;
    
    if (hadMultiDrag) {
      console.log('✅ Cleared multi-drag state');
    }
    
    setSnapTarget(null);
    setLineSnapTarget(null);
    
    // Note: didDragRef is reset in handleNodeClick after checking it
    // This ensures onClick can check if drag just happened
    
    // Clear auto-scroll
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
    
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = 'default';
    }
  };

  const deleteNode = (id: string) => {
    if (nodes.find(n => n.id === id)?.type === 'start') {
      alert('Cannot delete the start node');
      return;
    }
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    if (selectedNode === id) {
      setSelectedNode(null);
      setShowPropertiesPanel(false);
    }
  };

  const handleOutputPortMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🔵 Output port mouseDown - Starting connection from:', nodeId);
    setDraggingNode(null); // Prevent node dragging when connecting
    setConnectingFrom(nodeId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Get mouse position in SVG coordinates
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      console.log('Initial drag position:', pos);
      setConnectionDragPos(pos);
    }
  };

  const handleInputPortMouseEnter = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      setHoveredNode(nodeId);
    }
  };

  const handleInputPortMouseUp = (nodeId: string) => {
    console.log('🟢 Input port mouseUp - Attempting connection to:', nodeId, 'from:', connectingFrom);
    
    if (connectingFrom && connectingFrom !== nodeId) {
      // Check if connection already exists to prevent duplicates
      const connectionExists = connections.some(
        conn => conn.from === connectingFrom && conn.to === nodeId
      );
      
      if (!connectionExists) {
        const newConnection = { from: connectingFrom, to: nodeId };
        console.log('✅ Creating connection:', newConnection);
        
        setConnections(prev => {
          const updated = [...prev, newConnection];
          console.log('📋 Updated connections array:', updated);
          return updated;
        });
      } else {
        console.log('⚠️ Connection already exists - skipping');
      }
      
      // Clear connection state
      setConnectingFrom(null);
      setConnectionDragPos(null);
      console.log('🧹 Cleared connection state');
    } else {
      console.log('❌ Cannot create connection - same node or no source');
    }
  };
  
  const handleInputPortClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🎯 Input port CLICK');
    handleInputPortMouseUp(nodeId);
  };

  const updateNode = (id: string, updates: Partial<FlowNode>, skipHistory = false) => {
    // Ensure any position updates are integers
    if (updates.x !== undefined) {
      updates.x = Math.round(updates.x);
    }
    if (updates.y !== undefined) {
      updates.y = Math.round(updates.y);
    }
    
    // ALWAYS record history for non-transient updates (not during typing)
    if (!skipHistory) {
      recordHistory();
      
      // Show WHAT is being updated in the node
      const keys = Object.keys(updates).join(',');
      addDebug(`Update ${id.slice(-8)}: ${keys}`);
      
      // If position is being updated, show it
      if (updates.x !== undefined || updates.y !== undefined) {
        addDebug(`  -> pos (${updates.x?.toFixed?.(0)}, ${updates.y?.toFixed?.(0)})`);
      }
    }
    
    // Debug: Log if position is being updated with calculated values
    if (updates.x !== undefined || updates.y !== undefined) {
      const xStr = updates.x?.toString() || '';
      const yStr = updates.y?.toString() || '';
      // Check if these are calculated values (contain many decimal places)
      if (xStr.includes('.') && xStr.split('.')[1]?.length > 5 || 
          yStr.includes('.') && yStr.split('.')[1]?.length > 5) {
        addDebug(`⚠️ updateNode CALC POS: ${id.slice(-8)}`);
        console.log(`⚠️ updateNode called with calculated position for ${id.slice(-8)}: (${updates.x}, ${updates.y})`);
        console.trace('Stack trace:');
      }
    }
    
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
    setHasUnsavedChanges(true);
    // Update selectedNodeData if it's the selected node
    if (selectedNodeData && selectedNodeData.id === id) {
      setSelectedNodeData({ ...selectedNodeData, ...updates });
    }
  };

  // Calculate the best port position on a node's border based on direction to another node
  const getPortPosition = (node: FlowNode, targetNode: FlowNode, isOutput: boolean) => {
    const nodeSize = 60;
    const nodeCenterX = node.x + nodeSize / 2;
    const nodeCenterY = node.y + nodeSize / 2;
    const targetCenterX = targetNode.x + nodeSize / 2;
    const targetCenterY = targetNode.y + nodeSize / 2;
    
    // Calculate angle from node to target
    const angle = Math.atan2(targetCenterY - nodeCenterY, targetCenterX - nodeCenterX);
    const degrees = angle * (180 / Math.PI);
    
    // Determine which side of the node to place the port
    let portX = nodeCenterX;
    let portY = nodeCenterY;
    
    if (degrees >= -45 && degrees < 45) {
      // Right side
      portX = node.x + nodeSize;
      portY = nodeCenterY;
    } else if (degrees >= 45 && degrees < 135) {
      // Bottom side
      portX = nodeCenterX;
      portY = node.y + nodeSize;
    } else if (degrees >= 135 || degrees < -135) {
      // Left side
      portX = node.x;
      portY = nodeCenterY;
    } else {
      // Top side
      portX = nodeCenterX;
      portY = node.y;
    }
    
    // Return in SVG coordinates (add panOffset, nodes are absolutely positioned)
    return { x: portX + panOffset.x, y: portY + panOffset.y };
  };
  
  const deleteConnection = (from: string, to: string) => {
    console.log('🗑️ Deleting connection:', from, '->', to);
    
    // Find the connection to get its criteriaId (if it's a decision branch)
    const connectionToDelete = connections.find(
      conn => conn.from === from && conn.to === to
    );
    
    // Filter out the connection to delete
    const updatedConnections = connections.filter(
      conn => !(conn.from === from && conn.to === to)
    );
    
    // If this was a decision branch, also remove the criteria from the source node
    if (connectionToDelete?.criteriaId) {
      const sourceNode = nodes.find(n => n.id === from);
      if (sourceNode && sourceNode.config?.decisionCriteria) {
        const updatedCriteria = sourceNode.config.decisionCriteria.filter(
          c => c.id !== connectionToDelete.criteriaId
        );
        
        const updatedNodes = nodes.map(n =>
          n.id === from
            ? { ...n, config: { ...n.config, decisionCriteria: updatedCriteria } }
            : n
        );
        
        setNodes(updatedNodes);
        console.log('🔀 Also removed decision criteria:', connectionToDelete.criteriaId);
      }
    }
    
    setConnections(updatedConnections);
    setSelectedConnection(null);
    setHasUnsavedChanges(true);
    
    console.log('✅ Connection deleted. Remaining connections:', updatedConnections.length);
  };

  const renderConnection = (conn: Connection, index: number) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    // Handle pending connections (for decision branches without target nodes yet)
    const isPending = conn.to.startsWith('pending-');
    
    if (!fromNode) return null;
    if (!isPending && !toNode) return null;

    let x1: number, y1: number, x2: number, y2: number;
    
    if (isPending) {
      // For pending connections, draw from the node to a position offset from it
      const nodeSize = 60;
      const nodeCenterX = fromNode.x + nodeSize / 2 + panOffset.x;
      const nodeCenterY = fromNode.y + nodeSize / 2 + panOffset.y;
      
      // Calculate the index of this criteria to spread them out
      // IMPORTANT: Use ALL connections from this node (both pending and connected) for stable positioning
      // Sort by criteriaId to ensure stable branch ordering
      const allConnectionsFromNode = getSortedConnectionsFromNode(conn.from, connections, fromNode);
      const totalCriteria = allConnectionsFromNode.length;
      const criteriaIndex = allConnectionsFromNode.findIndex(c => c.to === conn.to);
      
      // Use the helper function to calculate endpoint position
      const endpoint = calculateEndpointPosition(fromNode, criteriaIndex, totalCriteria, panOffset);
      
      // Calculate angle to endpoint for determining start port side
      const dx = endpoint.x - nodeCenterX;
      const dy = endpoint.y - nodeCenterY;
      const angle = Math.atan2(dy, dx);
      const startDegrees = angle * (180 / Math.PI);
      
      // Start from appropriate node edge
      if (startDegrees >= -45 && startDegrees < 45) {
        x1 = fromNode.x + nodeSize + panOffset.x;
        y1 = nodeCenterY;
      } else if (startDegrees >= 45 && startDegrees < 135) {
        x1 = nodeCenterX;
        y1 = fromNode.y + nodeSize + panOffset.y;
      } else if (startDegrees >= 135 || startDegrees < -135) {
        x1 = fromNode.x + panOffset.x;
        y1 = nodeCenterY;
      } else {
        x1 = nodeCenterX;
        y1 = fromNode.y + panOffset.y;
      }
      
      // End at calculated endpoint position
      x2 = endpoint.x + panOffset.x;
      y2 = endpoint.y + panOffset.y;
    } else {
      // Normal connection between two nodes
      const outputPos = getPortPosition(fromNode, toNode!, true);
      const inputPos = getPortPosition(toNode!, fromNode, false);

      x1 = outputPos.x;
      y1 = outputPos.y;
      x2 = inputPos.x;
      y2 = inputPos.y;
    }

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10;
    const arrowOffset = 14; // Move arrow back from node to avoid port obstruction
    
    const isSelected = selectedConnection?.from === conn.from && selectedConnection?.to === conn.to;
    const isHovered = hoveredConnection?.from === conn.from && hoveredConnection?.to === conn.to;
    
    // Calculate arrow position (offset from end point)
    const arrowX = x2 - arrowOffset * Math.cos(angle);
    const arrowY = y2 - arrowOffset * Math.sin(angle);
    
    // Calculate midpoint for delete button and label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
      <g key={`connection-${index}-${conn.from}-${conn.to}`}>
        {/* Invisible wider line for easier clicking */}
        <line 
          x1={x1} 
          y1={y1} 
          x2={x2} 
          y2={y2} 
          stroke="transparent" 
          strokeWidth="12"
          style={{ cursor: draggingIconAttachment ? 'default' : 'pointer', pointerEvents: draggingIconAttachment ? 'none' : 'stroke' }}
          onMouseEnter={(e) => {
            if (draggingIconAttachment) {
              e.stopPropagation(); // Prevent bubbling to node
              setHoveredNode(null);
            } else {
              setHoveredConnection({ from: conn.from, to: conn.to });
            }
          }}
          onMouseLeave={() => {
            if (!draggingIconAttachment) {
              setHoveredConnection(null);
            }
          }}
          onClick={(e) => {
            if (!draggingIconAttachment) {
              e.stopPropagation();
              setSelectedConnection({ from: conn.from, to: conn.to });
            }
          }}
        />
        {/* Visible line */}
        <line 
          x1={x1} 
          y1={y1} 
          x2={x2} 
          y2={y2} 
          stroke={isSelected ? '#ef4444' : isHovered ? '#3b82f6' : '#6b7280'} 
          strokeWidth={isSelected || isHovered ? '3' : '2'}
          style={{ pointerEvents: 'none' }}
        />
        {/* Arrow head positioned away from port */}
        <polygon
          points={`${arrowX},${arrowY} ${arrowX - arrowLength * Math.cos(angle - Math.PI / 6)},${arrowY - arrowLength * Math.sin(angle - Math.PI / 6)} ${arrowX - arrowLength * Math.cos(angle + Math.PI / 6)},${arrowY - arrowLength * Math.sin(angle + Math.PI / 6)}`}
          fill={isSelected ? '#ef4444' : isHovered ? '#3b82f6' : '#6b7280'}
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Connection label for decision branches */}
        {conn.label && (() => {
          // Position label closer to the endpoint (70% instead of 50%)
          // This spreads labels out more and reduces overlap
          const labelRatio = isPending ? 0.65 : 0.70;
          const labelX = x1 + (x2 - x1) * labelRatio;
          const labelY = y1 + (y2 - y1) * labelRatio;
          
          return (
            <g>
              {/* White background for label */}
              <rect
                x={labelX - (conn.label.length * 3.8) - 2.5}
                y={labelY - 7}
                width={conn.label.length * 7.6 + 5}
                height={14}
                fill="white"
                stroke={isSelected ? '#ef4444' : isHovered ? '#3b82f6' : '#6b7280'}
                strokeWidth={isSelected || isHovered ? '3' : '2'}
                rx="3"
                style={{ pointerEvents: draggingIconAttachment ? 'none' : 'auto', cursor: draggingIconAttachment ? 'default' : 'pointer' }}
                onMouseEnter={(e) => {
                  if (draggingIconAttachment) {
                    e.stopPropagation(); // Prevent bubbling to node
                    setIsOverConnection(true);
                    setHoveredNode(null);
                  }
                }}
                onMouseLeave={() => {
                  if (draggingIconAttachment) {
                    setIsOverConnection(false);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (conn.criteriaId) {
                    setEditingLabel({ 
                      from: conn.from, 
                      to: conn.to, 
                      criteriaId: conn.criteriaId,
                      x: labelX + panOffset.x,
                      y: labelY + panOffset.y,
                      originalLabel: conn.label || ''
                    });
                    setEditingLabelText(conn.label || '');
                  }
                }}
              />
              <text
                x={labelX}
                y={labelY + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? '#ef4444' : isHovered ? '#3b82f6' : '#374151'}
                fontSize="11"
                fontWeight="500"
                style={{ pointerEvents: draggingIconAttachment ? 'none' : 'auto', userSelect: 'none', cursor: draggingIconAttachment ? 'default' : 'pointer' }}
                onMouseEnter={(e) => {
                  if (draggingIconAttachment) {
                    e.stopPropagation(); // Prevent bubbling to node
                    setIsOverConnection(true);
                    setHoveredNode(null);
                  }
                }}
                onMouseLeave={() => {
                  if (draggingIconAttachment) {
                    setIsOverConnection(false);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (conn.criteriaId) {
                    setEditingLabel({ 
                      from: conn.from, 
                      to: conn.to, 
                      criteriaId: conn.criteriaId,
                      x: labelX + panOffset.x,
                      y: labelY + panOffset.y,
                      originalLabel: conn.label || ''
                    });
                    setEditingLabelText(conn.label || '');
                  }
                }}
              >
                {conn.label}
              </text>
            </g>
          );
        })()}
        
        {/* Pending endpoint - clickable to add node */}
        {isPending && (
          <g style={{ pointerEvents: draggingIconAttachment ? 'none' : 'auto' }}>
            <circle 
              cx={x2} 
              cy={y2} 
              r="16" 
              fill="#10b981"
              stroke="#047857"
              strokeWidth="2"
              style={{ cursor: draggingIconAttachment ? 'default' : 'pointer' }}
              onMouseEnter={(e) => {
                if (draggingIconAttachment) {
                  e.stopPropagation(); // Prevent bubbling to node
                  setIsOverConnection(true);
                  setHoveredNode(null);
                }
              }}
              onMouseLeave={() => {
                if (draggingIconAttachment) {
                  setIsOverConnection(false);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Show node type selector
                setPendingNodePosition({
                  x: Math.round(x2 - panOffset.x - 30),
                  y: Math.round(y2 - panOffset.y - 30),
                  connection: conn
                });
              }}
            />
            <text
              x={x2}
              y={y2 + 1}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              +
            </text>
          </g>
        )}
        
        {/* Delete button when selected (not for pending connections) */}
        {isSelected && !isPending && (
          <g 
            style={{ pointerEvents: draggingIconAttachment ? 'none' : 'auto' }}
            onMouseEnter={(e) => {
              if (draggingIconAttachment) {
                e.stopPropagation(); // Prevent bubbling to node
                setIsOverConnection(true);
                setHoveredNode(null);
              }
            }}
            onMouseLeave={() => {
              if (draggingIconAttachment) {
                setIsOverConnection(false);
              }
            }}
          >
            <circle 
              cx={midX} 
              cy={midY} 
              r="12" 
              fill="#ef4444"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🗑️ Delete button clicked for connection:', conn.from, '->', conn.to);
                recordHistory();
                deleteConnection(conn.from, conn.to);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />
            <line 
              x1={midX - 5} 
              y1={midY - 5} 
              x2={midX + 5} 
              y2={midY + 5} 
              stroke="white" 
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            />
            <line 
              x1={midX + 5} 
              y1={midY - 5} 
              x2={midX - 5} 
              y2={midY + 5} 
              stroke="white" 
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        )}
      </g>
    );
  };

  const renderDraggingConnection = () => {
    if (!connectingFrom || !connectionDragPos) return null;

    const fromNode = nodes.find(n => n.id === connectingFrom);
    if (!fromNode) return null;

    const nodeSize = 60;
    // Node position in SVG coordinates (nodes are absolutely positioned, so same as CSS)
    const nodeCenterX = fromNode.x + nodeSize / 2 + panOffset.x;
    const nodeCenterY = fromNode.y + nodeSize / 2 + panOffset.y;
    
    // Mouse position is already in SVG coordinates
    const mouseX = connectionDragPos.x;
    const mouseY = connectionDragPos.y;
    
    // Calculate angle from node to mouse
    const angle = Math.atan2(mouseY - nodeCenterY, mouseX - nodeCenterX);
    const degrees = angle * (180 / Math.PI);
    
    // Determine which side of the node to place the output port
    let x1 = nodeCenterX;
    let y1 = nodeCenterY;
    
    if (degrees >= -45 && degrees < 45) {
      // Right side
      x1 = fromNode.x + nodeSize + panOffset.x;
      y1 = nodeCenterY;
    } else if (degrees >= 45 && degrees < 135) {
      // Bottom side
      x1 = nodeCenterX;
      y1 = fromNode.y + nodeSize + panOffset.y;
    } else if (degrees >= 135 || degrees < -135) {
      // Left side
      x1 = fromNode.x + panOffset.x;
      y1 = nodeCenterY;
    } else {
      // Top side
      x1 = nodeCenterX;
      y1 = fromNode.y + panOffset.y;
    }
    
    const x2 = mouseX;
    const y2 = mouseY;

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  };

  // Get dynamic port positions for a node based on its connections
  const getDynamicPorts = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { inputs: [], outputs: [] };

    const inputs = connections
      .filter(c => c.to === nodeId)
      .map(c => {
        const fromNode = nodes.find(n => n.id === c.from);
        if (!fromNode) return null;
        return getPortPosition(fromNode, node, false);
      })
      .filter(Boolean);

    const outputs = connections
      .filter(c => c.from === nodeId)
      .map(c => {
        const toNode = nodes.find(n => n.id === c.to);
        if (!toNode) return null;
        return getPortPosition(node, toNode, true);
      })
      .filter(Boolean);

    return { inputs, outputs };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        // Check if we have multi-selection
        if (selectedNodes.size > 1) {
          addDebug(`Delete ${selectedNodes.size} nodes`);
          recordHistory();
          const idsToDelete = Array.from(selectedNodes);
          setNodes(nodes.filter(n => !idsToDelete.includes(n.id)));
          setConnections(connections.filter(c => !idsToDelete.includes(c.from) && !idsToDelete.includes(c.to)));
          setSelectedNodes(new Set());
          setHasUnsavedChanges(true);
        } else if (selectedNode) {
          deleteNode(selectedNode);
        } else if (selectedConnection) {
          deleteConnection(selectedConnection.from, selectedConnection.to);
        }
      }
      if (e.key === 'Escape') {
        setConnectingFrom(null);
        setConnectionDragPos(null);
        setSelectedConnection(null);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Handle properties panel dragging
      if (draggingProperties && propertiesPos) {
        setPropertiesPos({
          x: e.clientX - propertiesDragStart.x,
          y: e.clientY - propertiesDragStart.y
        });
      }
      
      // Continue node dragging even when mouse leaves canvas
      // IMPORTANT: Use the same delta-based calculation as the canvas mouse handler
      if (draggingNode && !connectingFrom && canvasContainerRef.current && multiDragStartPositions.current.size > 0) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        
        // Calculate delta from drag start (same as in handleCanvasMouseMove)
        const deltaX = e.clientX - dragOffsetRef.current.x;
        const deltaY = e.clientY - dragOffsetRef.current.y;
        
        // Use functional setState to avoid stale closure issues
        setNodes(prevNodes => {
          return prevNodes.map(n => {
            if (multiDragStartPositions.current.has(n.id)) {
              const originalPos = multiDragStartPositions.current.get(n.id)!;
              // SAFETY: Round to integers to prevent decimal drift
              return {
                ...n,
                x: Math.round(originalPos.x + deltaX),
                y: Math.round(originalPos.y + deltaY)
              };
            }
            return n;
          });
        });
        setHasUnsavedChanges(true);
        
        // Auto-pan when mouse is outside or near edges of canvas
        const edgeThreshold = 50;
        const panSpeed = 15;
        let autoPanX = 0;
        let autoPanY = 0;
        
        // Check if mouse is outside canvas or near edges
        if (e.clientX < rect.left) {
          // Mouse is to the left of canvas
          autoPanX = panSpeed;
        } else if (e.clientX > rect.right) {
          // Mouse is to the right of canvas
          autoPanX = -panSpeed;
        } else if (e.clientX - rect.left < edgeThreshold) {
          // Mouse is near left edge
          autoPanX = panSpeed * 0.5;
        } else if (rect.right - e.clientX < edgeThreshold) {
          // Mouse is near right edge
          autoPanX = -panSpeed * 0.5;
        }
        
        if (e.clientY < rect.top) {
          // Mouse is above canvas
          autoPanY = panSpeed;
        } else if (e.clientY > rect.bottom) {
          // Mouse is below canvas
          autoPanY = -panSpeed;
        } else if (e.clientY - rect.top < edgeThreshold) {
          // Mouse is near top edge
          autoPanY = panSpeed * 0.5;
        } else if (rect.bottom - e.clientY < edgeThreshold) {
          // Mouse is near bottom edge
          autoPanY = -panSpeed * 0.5;
        }
        
        if (autoPanX !== 0 || autoPanY !== 0) {
          setPanOffset(prev => ({
            x: prev.x + autoPanX,
            y: prev.y + autoPanY
          }));
        }
      }
      
      // Continue panning even when mouse leaves canvas
      if (isPanning) {
        const newOffset = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        };
        setPanOffset(newOffset);
      }
    };
    
    const handleMouseUp = () => {
      if (draggingProperties && propertiesPos) {
        // Save the new position as the default for this session
        setSavedPropertiesPos(propertiesPos);
      }
      setDraggingProperties(false);
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
      // Record history when node drag ends
      if (draggingNode) {
        recordHistory();
      }
      setDraggingNode(null);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedNode, draggingProperties, propertiesDragStart, propertiesPos, isPanning, panStart, draggingNode, panOffset, nodes, connectingFrom, selectedConnection]);

  // Sync selectedNodeData with selectedNode whenever nodes change or selection changes
  useEffect(() => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        setSelectedNodeData(node);
      }
    } else {
      setSelectedNodeData(null);
    }
  }, [selectedNode, nodes]);

  // Load saved workflow for this specific process from localStorage on mount
  useEffect(() => {
    const storageKey = `workflow_${organizationId}_${processId}`;
    const logs: string[] = [];
    
    console.log('🔍 ==========================================');
    console.log('🔍 LOADING WORKFLOW');
    console.log('🔍 ==========================================');
    
    logs.push(`🔍 Loading workflow for "${processName}"`);
    logs.push(`   Process ID: ${processId}`);
    logs.push(`   Org ID: ${organizationId}`);
    logs.push(`   Storage key: ${storageKey}`);
    
    console.log('  Process Name:', processName);
    console.log('  Process ID:', processId);
    console.log('  Org ID:', organizationId);
    console.log('  Storage Key:', storageKey);
    
    // List ALL workflow keys in localStorage for debugging
    // IMPORTANT: Use Object.keys() which is more reliable than localStorage.key()
    const allWorkflowKeys = Object.keys(localStorage).filter(k => k.startsWith('workflow_'));
    logs.push(`   📋 Found ${allWorkflowKeys.length} workflows in localStorage`);
    
    console.log('📋 All workflows in localStorage:', allWorkflowKeys);
    console.log('🔍 Looking for key:', storageKey);
    console.log('🔍 Key exists?', allWorkflowKeys.includes(storageKey));
    
    // Try to load the specific workflow
    const saved = localStorage.getItem(storageKey);
    
    console.log('📦 Retrieved from localStorage:', saved ? 'YES (' + saved.length + ' chars)' : 'NO');
    
    if (saved) {
      try {
        const workflow = JSON.parse(saved);
        logs.push(`✅ FOUND SAVED WORKFLOW`);
        logs.push(`   Name: ${workflow.name}`);
        logs.push(`   Nodes: ${workflow.nodes?.length || 0}`);
        logs.push(`   Connections: ${workflow.connections?.length || 0}`);
        logs.push(`   Saved At: ${workflow.savedAt ? new Date(workflow.savedAt).toLocaleString() : 'Unknown'}`);
        
        console.log('✅ WORKFLOW LOADED SUCCESSFULLY');
        console.log('  Name:', workflow.name);
        console.log('  Nodes:', workflow.nodes?.length || 0);
        console.log('  Connections:', workflow.connections?.length || 0);
        console.log('  Saved At:', workflow.savedAt);
        
        setNodes(workflow.nodes || [{ id: 'start', type: 'start', label: 'Start', x: 400, y: 100 }]);
        setConnections(workflow.connections || []);
        setWorkflowName(workflow.name || processName || 'New Workflow');
        setHasUnsavedChanges(false);
        initialLoadCompleteRef.current = true; // Mark initial load as complete
        
        console.log('✅ State updated with loaded workflow');
      } catch (e) {
        logs.push(`❌ ERROR parsing workflow: ${e}`);
        console.error('❌ ERROR parsing workflow:', e);
      }
    } else {
      logs.push(`⚠️ NO SAVED WORKFLOW FOUND`);
      logs.push(`   💡 This is the first time editing this workflow`);
      
      console.log('⚠️ NO SAVED WORKFLOW FOUND');
      console.log('💡 This is the first time editing this workflow');
      console.log('💡 Starting with default start node');
      initialLoadCompleteRef.current = true; // Mark initial load as complete
    }
    
    setLoadLog(logs);
    console.log('🔍 ==========================================');
  }, [processId, organizationId, processName]);

  // Load templates for this organization
  useEffect(() => {
    const storageKey = `workflow_templates_${organizationId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const loadedTemplates = JSON.parse(saved);
        setTemplates(loadedTemplates);
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }
  }, [organizationId]);

  // Handler for Back to Inputs button
  const handleBackToInputs = () => {
    if (hasUnsavedChanges) {
      setShowExitWarningDialog(true);
    } else {
      onClose?.();
    }
  };

  // Handler to save workflow and exit
  const handleSaveAndExit = () => {
    const workflowToSave = {
      id: processId,
      name: workflowName,
      savedAt: new Date().toISOString(),
      nodes: nodes,
      connections: connections,
      processId: processId,
      organizationId: organizationId
    };
    
    // Save to localStorage keyed by processId and organizationId
    const storageKey = `workflow_${organizationId}_${processId}`;
    
    const logs: string[] = [];
    logs.push(`💾 SAVING & EXITING`);
    logs.push(`   Process: "${processName}"`);
    logs.push(`   Storage Key: ${storageKey}`);
    logs.push(`   Nodes: ${nodes.length}`);
    logs.push(`   Connections: ${connections.length}`);
    logs.push(`   ✅ SAVED AT ${new Date().toLocaleTimeString()}`);
    setSaveLog(logs);
    console.log(logs.join('\n'));
    console.log(`💾 Saving workflow for process "${processName}" (${processId})`);
    console.log(`   Storage key: ${storageKey}`);
    console.log(`   Workflow data:`, workflowToSave);
    localStorage.setItem(storageKey, JSON.stringify(workflowToSave));
    setHasUnsavedChanges(false);
    
    // Call config callback
    config?.onWorkflowSave?.(workflowToSave);
    
    // Refresh debug panel
    setDebugRefreshTrigger(prev => prev + 1);
    
    // Close the dialog and exit
    setShowExitWarningDialog(false);
    onClose?.();
  };

  // Friction tag hover detection using drag events
  useEffect(() => {
    if (!draggingIconAttachment) {
      setHoveredNode(null);
      return;
    }

    let raf = 0;
    
    const onMove = (e: DragEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const stack = document.elementsFromPoint(e.clientX, e.clientY);
        const nodeEl = stack.find(el => el instanceof HTMLElement && el.dataset.nodeId) as HTMLElement | undefined;
        const nextNodeId = nodeEl?.dataset.nodeId ?? null;
        setHoveredNode(prev => {
          if (prev !== nextNodeId) console.log('🎯 Friction tag hover:', nextNodeId || 'none');
          return nextNodeId;
        });
      });
    };

    window.addEventListener('drag', onMove as any);
    window.addEventListener('dragover', onMove as any);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('drag', onMove as any);
      window.removeEventListener('dragover', onMove as any);
    };
  }, [draggingIconAttachment]);

  // Friction tag drop handler
  useEffect(() => {
    if (!draggingIconAttachment) return;
    
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      if (hoveredNode) {
        console.log('💾 Attaching friction tag:', draggingIconAttachment, 'to node:', hoveredNode);
        setNodes(prev => prev.map(node => {
          if (node.id !== hoveredNode) return node;
          const hasAttachment = node.attachments?.some(a => a.type === draggingIconAttachment);
          if (hasAttachment) {
            console.log('⚠️ Node already has this friction tag');
            return node;
          }
          return {
            ...node,
            attachments: [...(node.attachments || []), { id: `attachment-${Date.now()}`, type: draggingIconAttachment }]
          };
        }));
        recordHistory();
        setHasUnsavedChanges(true);
      }
      setHoveredNode(null);
      setDraggingIconAttachment(null);
    };
    
    const onDragEnd = () => {
      setHoveredNode(null);
      setDraggingIconAttachment(null);
    };
    
    window.addEventListener('drop', onDrop as any);
    window.addEventListener('dragend', onDragEnd as any);
    return () => {
      window.removeEventListener('drop', onDrop as any);
      window.removeEventListener('dragend', onDragEnd as any);
    };
  }, [draggingIconAttachment, hoveredNode]);

  return (
    <div className="space-y-3 px-4 relative">
      {/* WORKFLOW PERSISTENCE DEBUG PANEL - FIXED POSITION */}
      <div className="fixed top-20 right-4 z-50 bg-yellow-50 border-2 border-yellow-400 rounded text-xs shadow-lg max-w-sm" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between p-2 pb-0">
          <div className="font-semibold">🔍 Workflow Debug Panel</div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const currentKey = 'workflow_' + organizationId + '_' + processId;
                const allWorkflows = Object.keys(localStorage)
                  .filter(k => k.startsWith('workflow_'))
                  .map(k => k === currentKey ? k + ' ← CURRENT' : k)
                  .join('\n') || 'NO WORKFLOWS SAVED';
                
                const debugText = [
                  'WORKFLOW DEBUG INFO',
                  '==================',
                  'Process ID: ' + processId,
                  'Org ID: ' + organizationId,
                  'Process Name: ' + processName,
                  'Storage Key: ' + currentKey,
                  '',
                  'Nodes: ' + nodes.length,
                  'Connections: ' + connections.length,
                  'Unsaved Changes: ' + (hasUnsavedChanges ? 'YES' : 'NO'),
                  '',
                  'All Workflows in localStorage:',
                  allWorkflows,
                  '',
                  'LOAD LOG:',
                  loadLog.join('\n'),
                  '',
                  'SAVE LOG:',
                  saveLog.join('\n')
                ].join('\n');
                
                // Fallback clipboard copy that works everywhere
                const textarea = document.createElement('textarea');
                textarea.value = debugText;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                  document.execCommand('copy');
                  alert('✅ Debug info copied to clipboard!');
                } catch (err) {
                  console.error('Copy failed:', err);
                  alert('❌ Copy failed. Check console for debug info.');
                  console.log(debugText);
                }
                document.body.removeChild(textarea);
              }}
              className="text-yellow-700 hover:text-yellow-900 transition-colors px-1"
              title="Copy to clipboard"
            >
              📋
            </button>
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                console.log('Current localStorage workflow keys:', Object.keys(localStorage).filter(k => k.startsWith('workflow_')));
                setDebugRefreshTrigger(prev => prev + 1);
              }}
              className="text-yellow-700 hover:text-yellow-900 transition-colors px-1"
              title="Refresh localStorage view"
            >
              🔄
            </button>
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-yellow-700 hover:text-yellow-900 transition-colors"
              title={showDebugInfo ? "Collapse" : "Expand"}
            >
              {showDebugInfo ? '−' : '+'}
            </button>
          </div>
        </div>
        {showDebugInfo && (<div className="p-2 pt-1">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div><strong>Process ID:</strong> {processId}</div>
            <div><strong>Org ID:</strong> {organizationId}</div>
            <div><strong>Process Name:</strong> {processName}</div>
            <div><strong>Storage Key:</strong> workflow_{organizationId}_{processId}</div>
          </div>
          <div>
            <div><strong>Nodes:</strong> {nodes.length}</div>
            <div><strong>Connections:</strong> {connections.length}</div>
            <div><strong>Unsaved Changes:</strong> {hasUnsavedChanges ? 'YES' : 'NO'}</div>
            <div><strong>All Workflows in localStorage:</strong></div>
            <div className="text-[9px] bg-white p-1 rounded mt-1 max-h-20 overflow-y-auto" key={debugRefreshTrigger}>
              {Object.keys(localStorage).filter(k => k.startsWith('workflow_')).map(k => (
                <div key={k} className={k === `workflow_${organizationId}_${processId}` ? 'text-green-600 font-semibold' : ''}>
                  {k} {k === `workflow_${organizationId}_${processId}` ? '← CURRENT' : ''}
                </div>
              ))}
              {Object.keys(localStorage).filter(k => k.startsWith('workflow_')).length === 0 && (
                <div className="text-red-600">NO WORKFLOWS SAVED</div>
              )}
            </div>
          </div>
        </div>
        
        {/* LOAD LOG */}
        {loadLog.length > 0 && (
          <div className="mt-2 pt-2 border-t border-yellow-300">
            <div className="font-semibold mb-1">📥 Last Load:</div>
            <div className="text-[9px] bg-white p-1 rounded font-mono">
              {loadLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
        
        {/* SAVE LOG */}
        {saveLog.length > 0 && (
          <div className="mt-2 pt-2 border-t border-yellow-300">
            <div className="font-semibold mb-1 text-green-700">💾 Last Save:</div>
            <div className="text-[9px] bg-green-50 p-1 rounded font-mono text-green-800">
              {saveLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
        </div>
        )}
      </div>

      {/* FRICTION TAG DEBUG PANEL - FIXED POSITION */}
      {draggingIconAttachment && (
        <div className="fixed top-96 right-4 z-50 bg-purple-50 border-2 border-purple-400 rounded p-2 text-xs shadow-lg" style={{ pointerEvents: 'none' }}>
          <div className="font-semibold mb-1">🏷️ Friction Tag Drag Debug</div>
          <div className="text-[10px]">
            <div><strong>Dragging:</strong> {draggingIconAttachment}</div>
            <div><strong>Hovered Node:</strong> {hoveredNode || 'NONE'}</div>
            <div><strong>Hit Zone Showing:</strong> {hoveredNode ? 'YES (on node ' + hoveredNode + ')' : 'NO'}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl">Visual Workflow Builder</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {isPanning ? 'Panning...' : 'Ctrl+Click or Middle Mouse to pan'}
            </p>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={handleBackToInputs} className="h-7 gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Inputs
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-xs" title={`Process: ${processId}\nOrg: ${organizationId}`}>
            📁 {processName || processId}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-xs">
            {nodes.length} nodes, {connections.length} connections
          </Badge>
          
          {/* SAVE STATUS INDICATOR */}
          {hasUnsavedChanges ? (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-400 text-yellow-700 text-xs">
              ⚠️ Unsaved changes
            </Badge>
          ) : saveLog.length > 0 ? (
            <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700 text-xs">
              ✓ Saved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 border-gray-300 text-gray-500 text-xs">
              ⏸ No changes
            </Badge>
          )}
          
          {/* SAVE WORKFLOW BUTTON - Primary action */}
          <Button 
            variant={hasUnsavedChanges ? "default" : "outline"}
            size="sm" 
            className="h-7 gap-1.5"
            onClick={handleSaveWorkflow}
            title="Save workflow to localStorage"
          >
            <Save className="w-3.5 h-3.5" />
            {hasUnsavedChanges ? 'Save Workflow' : 'Saved'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1.5"
            onClick={() => setShowClearCanvasDialog(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                <Menu className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowSaveTemplateDialog(true)}>
                <FileStack className="w-3 h-3 mr-2" />
                Save as Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLoadTemplateDialog(true)}>
                <FolderKanban className="w-3 h-3 mr-2" />
                Load Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Compact Node Palette */}
        <div className="col-span-2 relative">
          <Card className="rounded-lg sticky top-3">
            <div className="px-6 rounded-t-lg border-b flex items-center" style={{ backgroundColor: '#e0e7ff', height: '52px', minHeight: '52px', maxHeight: '52px' }}>
              <h4 className="text-base leading-none" style={{ color: '#4338ca', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600' }}>Nodes</h4>
            </div>
            <CardContent className="p-3">
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="flex flex-col items-center gap-4 p-1">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 px-3 py-2">
                    {Object.entries(nodeTemplates).map(([type, template], index) => (
                      <div key={type} className="relative">
                        <div
                          draggable
                          onDragStart={handleDragFromPalette(type as FlowNode['type'])}
                          className="cursor-move hover:scale-105 transition-all flex justify-center"
                          title={template.description}
                        >
                          <div style={{ width: '50px', height: '50px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                            <NodeShape type={type as FlowNode['type']} label={template.label} size={50} inLibrary={true} />
                          </div>
                        </div>
                        {/* Vertical border between columns */}
                        {index % 2 === 0 && index < Object.entries(nodeTemplates).length - 1 && (
                          <div className="absolute top-0 bottom-0 w-px" style={{ right: '-1rem', backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
                        )}
                        {/* Horizontal border between rows */}
                        {index < Object.entries(nodeTemplates).length - 2 && (
                          <div className="absolute left-0 right-0 h-px" style={{ bottom: '-0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Friction Tags Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2 text-center">Friction Tags</h5>
                    <div className="text-[9px] text-center text-gray-500 mb-2">
                      Drag these onto nodes ↓
                    </div>
                    <div className="flex justify-center gap-6 px-3">
                      {Object.entries(iconAttachmentTemplates).map(([type, template]) => {
                        const Icon = template.icon;
                        return (
                          <div key={type} className="relative">
                            <div
                              draggable
                              onDragStart={(e) => {
                                console.log('🏷️ FRICTION TAG DRAG START:', type);
                                addDebug(`🏷️ Dragging ${template.label}`);
                                setDraggingIconAttachment(type as 'time-sink' | 'quality-risk');
                                e.dataTransfer.effectAllowed = 'copy';
                                e.dataTransfer.setData('text/plain', type);
                              }}
                              onDragEnd={(e) => {
                                console.log('🏷️ FRICTION TAG DRAG END');
                                addDebug('🏷️ Drag ended');
                                setDraggingIconAttachment(null);
                                setHoveredNode(null);
                              }}
                              className="cursor-grab active:cursor-grabbing hover:scale-110 transition-all flex flex-col items-center gap-1"
                              style={{ userSelect: 'none' }}
                              title={template.description}
                            >
                              <div 
                                className={`${template.color} text-white rounded-full p-2 shadow-md`}
                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[8px] text-gray-600 text-center leading-tight w-16" style={{ pointerEvents: 'none' }}>
                                {template.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="col-span-10 relative" ref={canvasContainerRef}>
          <Card className="rounded-lg shadow-md">
            <div className="px-6 rounded-t-lg border-b flex items-center justify-between" style={{ backgroundColor: '#e0e7ff', height: '52px', minHeight: '52px', maxHeight: '52px' }}>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempWorkflowName}
                  onChange={(e) => setTempWorkflowName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setWorkflowName(tempWorkflowName);
                      setIsEditingName(false);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  onBlur={() => {
                    setWorkflowName(tempWorkflowName);
                    setIsEditingName(false);
                    setHasUnsavedChanges(true);
                  }}
                  autoFocus
                  className="text-base bg-white border border-indigo-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  style={{ color: '#4338ca', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600' }}
                />
              ) : (
                <h4 
                  className="text-base cursor-pointer hover:bg-white/50 rounded transition-colors leading-none" 
                  style={{ color: '#4338ca', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600' }}
                  onClick={() => {
                    setTempWorkflowName(workflowName);
                    setIsEditingName(true);
                  }}
                >
                  {workflowName}
                </h4>
              )}
              <div className="flex items-center gap-2">
                {connectingFrom && (
                  <Badge className="bg-purple-500 text-xs h-5">Drag to input port</Badge>
                )}
                {selectedNodes.size > 0 && (
                  <>
                    <Badge className="bg-blue-500 text-xs h-5">{selectedNodes.size} selected</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="h-7 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Selected
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="h-7 gap-1.5"
                  title={`Undo (${historyIndex} actions available)`}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="relative w-full overflow-hidden shadow-inner" style={{ height: 'calc(100vh - 260px)' }} ref={canvasBodyRef}>
                {/* Grid Background Layer */}
                <div 
                  className="absolute inset-0 bg-gray-50 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                  }}
                />
                
                <div
                  ref={canvasRef}
                  onDrop={handleCanvasDrop}
                  onDragOver={handleCanvasDragOver}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={(e) => {
                    // When dragging friction tags, DON'T set isOverConnection
                    // The node's onMouseEnter handler will set hoveredNode
                    // This ensures the purple hit zone shows ONLY when over a node div, not over SVG connections
                    
                    // Call the original handler if it exists
                    if (typeof handleCanvasMouseMove === 'function') {
                      handleCanvasMouseMove(e);
                    }
                  }}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseEnter={() => {
                    // Clear hovered node when mouse enters canvas area (not over a specific node)
                    if (draggingIconAttachment) {
                      setHoveredNode(null);
                    }
                  }}
                  className="absolute inset-0"
                  style={{
                    cursor: isPanning ? 'grabbing' : 'default',
                    padding: '40px',
                  }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    {connections.map((conn, index) => renderConnection(conn, index))}
                    {renderDraggingConnection()}
                    
                    {/* Selection box */}
                    {selectionBox && (
                      <rect
                        x={Math.min(selectionBox.startX, selectionBox.endX)}
                        y={Math.min(selectionBox.startY, selectionBox.endY)}
                        width={Math.abs(selectionBox.endX - selectionBox.startX)}
                        height={Math.abs(selectionBox.endY - selectionBox.startY)}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    )}
                    
                    {/* Snap indicator for pending endpoints */}
                    {snapTarget && (
                      <g>
                        <circle
                          cx={snapTarget.x + 30 + panOffset.x}
                          cy={snapTarget.y + 30 + panOffset.y}
                          r="35"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="r"
                            values="35;40;35"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0.8;0.6"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={snapTarget.x + 30 + panOffset.x}
                          cy={snapTarget.y + 30 + panOffset.y}
                          r="8"
                          fill="#3b82f6"
                          opacity="0.5"
                        />
                      </g>
                    )}
                    
                    {/* Line snap indicator for inserting between nodes */}
                    {lineSnapTarget && (
                      <g>
                        <circle
                          cx={lineSnapTarget.x + 30 + panOffset.x}
                          cy={lineSnapTarget.y + 30 + panOffset.y}
                          r="35"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          opacity="0.7"
                        >
                          <animate
                            attributeName="r"
                            values="35;40;35"
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.7;0.9;0.7"
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={lineSnapTarget.x + 30 + panOffset.x}
                          cy={lineSnapTarget.y + 30 + panOffset.y}
                          r="8"
                          fill="#10b981"
                          opacity="0.6"
                        />
                      </g>
                    )}
                  </svg>

                  {nodes.map((node) => {
                    const isSelected = selectedNode === node.id;
                    const isMultiSelected = selectedNodes.has(node.id);
                    const isHovered = hoveredNode === node.id;
                    const showPorts = isHovered || connectingFrom !== null || isSelected;
                    
                    // Generate tooltip content for the node
                    const getNodeTooltip = () => {
                      const template = nodeTemplates[node.type];
                      let details: string[] = [];
                      
                      details.push(`Type: ${template.label}`);
                      details.push(`Name: ${node.label}`);
                      
                      if (node.config) {
                        if (node.config.description) details.push(`Description: ${node.config.description}`);
                        if (node.config.assignee) details.push(`Assignee: ${node.config.assignee}`);
                        if (node.config.duration) details.push(`Duration: ${node.config.duration}`);
                        if (node.config.triggerType) {
                          const trigger = triggerTypes.find(t => t.value === node.config.triggerType);
                          details.push(`Trigger: ${trigger?.label || node.config.triggerType}`);
                        }
                        if (node.config.actionType) {
                          const action = actionTypes.find(a => a.value === node.config.actionType);
                          details.push(`Action: ${action?.label || node.config.actionType}`);
                        }
                        if (node.config.decisionCriteria && node.config.decisionCriteria.length > 0) {
                          details.push(`Criteria: ${node.config.decisionCriteria.map(c => c.label).join(', ')}`);
                        }
                      }
                      
                      return details.join('\n');
                    };
                    
                    // Calculate dynamic port positions for this node
                    const nodeSize = 60;
                    const getPortsForNode = () => {
                      const ports: Array<{ side: 'top' | 'right' | 'bottom' | 'left', isInput: boolean, targetId?: string }> = [];
                      
                      // Add output ports based on outgoing connections
                      if (node.type !== 'end') {
                        const outgoingConnections = connections.filter(c => c.from === node.id);
                        if (outgoingConnections.length > 0) {
                          outgoingConnections.forEach(conn => {
                            const targetNode = nodes.find(n => n.id === conn.to);
                            if (targetNode) {
                              const angle = Math.atan2(
                                targetNode.y + nodeSize / 2 - (node.y + nodeSize / 2),
                                targetNode.x + nodeSize / 2 - (node.x + nodeSize / 2)
                              ) * (180 / Math.PI);
                              
                              let side: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
                              if (angle >= -45 && angle < 45) side = 'right';
                              else if (angle >= 45 && angle < 135) side = 'bottom';
                              else if (angle >= 135 || angle < -135) side = 'left';
                              else side = 'top';
                              
                              ports.push({ side, isInput: false, targetId: conn.to });
                            }
                          });
                        } else if (showPorts) {
                          // Show default output port when no connections
                          ports.push({ side: 'bottom', isInput: false });
                        }
                      }
                      
                      // Add input ports based on incoming connections
                      if (node.type !== 'start') {
                        const incomingConnections = connections.filter(c => c.to === node.id);
                        if (incomingConnections.length > 0) {
                          incomingConnections.forEach(conn => {
                            const sourceNode = nodes.find(n => n.id === conn.from);
                            if (sourceNode) {
                              const angle = Math.atan2(
                                sourceNode.y + nodeSize / 2 - (node.y + nodeSize / 2),
                                sourceNode.x + nodeSize / 2 - (node.x + nodeSize / 2)
                              ) * (180 / Math.PI);
                              
                              let side: 'top' | 'right' | 'bottom' | 'left' = 'top';
                              if (angle >= -45 && angle < 45) side = 'right';
                              else if (angle >= 45 && angle < 135) side = 'bottom';
                              else if (angle >= 135 || angle < -135) side = 'left';
                              else side = 'top';
                              
                              ports.push({ side, isInput: true, targetId: conn.from });
                            }
                          });
                        } else if (showPorts && connectingFrom && connectingFrom !== node.id) {
                          // Show input port on the side closest to the connecting node
                          const sourceNode = nodes.find(n => n.id === connectingFrom);
                          if (sourceNode) {
                            const angle = Math.atan2(
                              sourceNode.y + nodeSize / 2 - (node.y + nodeSize / 2),
                              sourceNode.x + nodeSize / 2 - (node.x + nodeSize / 2)
                            ) * (180 / Math.PI);
                            
                            let side: 'top' | 'right' | 'bottom' | 'left' = 'top';
                            if (angle >= -45 && angle < 45) side = 'right';
                            else if (angle >= 45 && angle < 135) side = 'bottom';
                            else if (angle >= 135 || angle < -135) side = 'left';
                            else side = 'top';
                            
                            ports.push({ side, isInput: true });
                          }
                        } else if (showPorts) {
                          // Show default input port
                          ports.push({ side: 'top', isInput: true });
                        }
                      }
                      
                      return ports;
                    };
                    
                    const ports = getPortsForNode();

                    return (
                      <div
                        key={node.id}
                        data-node-id={node.id}
                        className="absolute"
                        style={{
                          left: node.x + panOffset.x,
                          top: node.y + panOffset.y,
                          width: '60px',
                          height: '60px',
                          zIndex: isSelected ? 10 : 2,
                        }}
                        onDragOver={(e) => {
                          if (draggingIconAttachment) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onDrop={(e) => {
                          if (draggingIconAttachment) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Add friction tag to node
                            recordHistory();
                            const attachmentId = `attachment-${Date.now()}`;
                            const updatedNodes = nodes.map(n =>
                              n.id === node.id
                                ? {
                                    ...n,
                                    attachments: [
                                      ...(n.attachments || []),
                                      { id: attachmentId, type: draggingIconAttachment }
                                    ]
                                  }
                                : n
                            );
                            setNodes(updatedNodes);
                            setHasUnsavedChanges(true);
                            setDraggingIconAttachment(null);
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation(); // Prevent canvas onMouseEnter from clearing this
                          // When dragging friction tags, ALWAYS set hoveredNode when entering a node div
                          // This will trigger the purple hit zone animation
                          setHoveredNode(node.id);
                          if (!draggingNode && !connectingFrom) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setNodeTooltip({
                              nodeId: node.id,
                              x: rect.right + 10,
                              y: rect.top
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          // Don't clear hoveredNode if we're connecting - we need it for mouseUp
                          if (!connectingFrom) {
                            setHoveredNode(null);
                          }
                          setNodeTooltip(null);
                        }}
                        onMouseDown={(e) => {
                          handleNodeMouseDown(e, node.id);
                          setNodeTooltip(null);
                        }}
                        onClick={(e) => {
                          // Prevent click if we're still in any drag-related state
                          // Note: didDragRef check happens inside handleNodeClick
                          if (draggingNode || isMultiDragging.current || multiDragStartPositions.current.size > 0) {
                            console.log('🚫 Click prevented - still in drag state');
                            e.stopPropagation();
                            return;
                          }
                          handleNodeClick(node.id, e);
                        }}
                      >
                        {/* Multi-selection highlight */}
                        {isMultiSelected && (
                          <div className="absolute -inset-1 border-2 border-blue-500 rounded-lg bg-blue-500/10 pointer-events-none" />
                        )}
                        
                        {/* Friction tag drag highlight - shows when hovering over the node */}
                        {draggingIconAttachment && hoveredNode === node.id && (
                          <div className="absolute -inset-1 border-2 border-purple-500 rounded-lg bg-purple-500/10 pointer-events-none animate-pulse" />
                        )}
                        
                        {/* Dynamic Ports */}
                        {ports.map((port, idx) => {
                          let portStyle: React.CSSProperties = { pointerEvents: 'auto' };
                          let portClass = 'absolute w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-30 shadow-md transition-all';
                          
                          // Position based on side
                          if (port.side === 'top') {
                            portStyle = { ...portStyle, top: '-6px', left: '50%', transform: 'translateX(-50%)' };
                          } else if (port.side === 'bottom') {
                            portStyle = { ...portStyle, bottom: '-6px', left: '50%', transform: 'translateX(-50%)' };
                          } else if (port.side === 'left') {
                            portStyle = { ...portStyle, left: '-6px', top: '50%', transform: 'translateY(-50%)' };
                          } else if (port.side === 'right') {
                            portStyle = { ...portStyle, right: '-6px', top: '50%', transform: 'translateY(-50%)' };
                          }
                          
                          if (port.isInput) {
                            const isActiveTarget = connectingFrom && connectingFrom !== node.id;
                            portClass += isActiveTarget ? ' border-green-500 cursor-pointer hover:scale-125' : ' border-gray-400';
                            
                            return (
                              <div
                                key={`input-${port.side}-${idx}`}
                                data-input-port="true"
                                data-node-id={node.id}
                                className={portClass}
                                style={portStyle}
                                onMouseEnter={() => handleInputPortMouseEnter(node.id)}
                                onMouseUp={() => handleInputPortMouseUp(node.id)}
                                onClick={(e) => handleInputPortClick(node.id, e)}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 pointer-events-none" />
                              </div>
                            );
                          } else {
                            const isActive = connectingFrom === node.id;
                            portClass += isActive ? ' border-green-500 ring-2 ring-green-300' : ' border-blue-500 cursor-pointer hover:scale-125';
                            
                            return (
                              <div
                                key={`output-${port.side}-${idx}`}
                                data-output-port="true"
                                data-node-id={node.id}
                                className={portClass}
                                style={portStyle}
                                onMouseDown={(e) => handleOutputPortMouseDown(node.id, e)}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-blue-500'} pointer-events-none`} />
                              </div>
                            );
                          }
                        })}

                        {/* Friction Tags */}
                        {node.attachments && node.attachments.length > 0 && (
                          <div className="absolute -top-2 -right-2 flex gap-1 z-40">
                            {node.attachments.map((attachment, idx) => {
                              const template = iconAttachmentTemplates[attachment.type];
                              const Icon = template.icon;
                              return (
                                <div
                                  key={attachment.id}
                                  className={`${template.color} text-white rounded-full p-1 shadow-lg cursor-pointer hover:scale-110 transition-all group relative`}
                                  style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove attachment on click
                                    recordHistory();
                                    const updatedNodes = nodes.map(n => 
                                      n.id === node.id 
                                        ? { ...n, attachments: n.attachments?.filter(a => a.id !== attachment.id) }
                                        : n
                                    );
                                    setNodes(updatedNodes);
                                    setHasUnsavedChanges(true);
                                  }}
                                  title={template.description}
                                >
                                  <Icon className="w-3 h-3" />
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-full mb-1 hidden group-hover:block pointer-events-none whitespace-nowrap">
                                    <div className="bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-lg">
                                      {template.label}
                                      <div className="text-gray-300 text-[8px] mt-0.5 max-w-[150px] whitespace-normal">
                                        {template.description}
                                      </div>
                                      <div className="text-gray-400 text-[8px] mt-0.5 italic">Click to remove</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className={`w-full h-full ${isSelected ? 'ring-2 ring-blue-400' : ''} ${isHovered ? 'ring-2 ring-indigo-300' : ''} ${connectingFrom === node.id ? 'ring-2 ring-green-400' : ''} transition-all cursor-move`}>
                          <NodeShape type={node.type} label={node.label} />
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Inline Branch Label Editor - positioned within canvas */}
                  {editingLabel && (
                    <input
                      ref={labelInputRef}
                      type="text"
                      value={editingLabelText}
                      onChange={(e) => {
                        setEditingLabelText(e.target.value);
                        // Update in real-time
                        setConnections(connections.map(conn => 
                          conn.from === editingLabel.from && conn.to === editingLabel.to
                            ? { ...conn, label: e.target.value }
                            : conn
                        ));
                        const sourceNode = nodes.find(n => n.id === editingLabel.from);
                        if (sourceNode && sourceNode.config?.decisionCriteria) {
                          const updatedCriteria = sourceNode.config.decisionCriteria.map(c =>
                            c.id === editingLabel.criteriaId ? { ...c, label: e.target.value } : c
                          );
                          setNodes(nodes.map(n =>
                            n.id === editingLabel.from
                              ? { ...n, config: { ...n.config, decisionCriteria: updatedCriteria } }
                              : n
                          ));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          recordHistory();
                          setEditingLabel(null);
                        } else if (e.key === 'Escape') {
                          // Revert to original
                          setConnections(connections.map(conn => 
                            conn.from === editingLabel.from && conn.to === editingLabel.to
                              ? { ...conn, label: editingLabel.originalLabel }
                              : conn
                          ));
                          const sourceNode = nodes.find(n => n.id === editingLabel.from);
                          if (sourceNode && sourceNode.config?.decisionCriteria) {
                            const updatedCriteria = sourceNode.config.decisionCriteria.map(c =>
                              c.id === editingLabel.criteriaId ? { ...c, label: editingLabel.originalLabel } : c
                            );
                            setNodes(nodes.map(n =>
                              n.id === editingLabel.from
                                ? { ...n, config: { ...n.config, decisionCriteria: updatedCriteria } }
                                : n
                            ));
                          }
                          setEditingLabel(null);
                        }
                      }}
                      onBlur={() => {
                        recordHistory();
                        setEditingLabel(null);
                      }}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      className="absolute px-2 py-0.5 border-2 border-blue-400 rounded bg-white"
                      style={{
                        left: `${editingLabel.x}px`,
                        top: `${editingLabel.y}px`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '11px',
                        fontWeight: '500',
                        width: `${Math.max(60, editingLabelText.length * 7.6 + 20)}px`,
                        textAlign: 'center',
                        zIndex: 200,
                        pointerEvents: 'auto',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Warning Dialog */}
      <AlertDialog open={showSaveWarning} onOpenChange={setShowSaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes on the canvas. Loading a template will replace all current nodes and connections. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSaveWarning(false);
              setPendingTemplate(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Load the pending template
              if (pendingTemplate && pendingTemplate.workflowData) {
                setNodes(pendingTemplate.workflowData.nodes || []);
                setConnections(pendingTemplate.workflowData.connections || []);
                setWorkflowName(pendingTemplate.name);
                setHasUnsavedChanges(false);
              }
              setShowSaveWarning(false);
              setPendingTemplate(null);
            }}>
              Continue (Discard Changes)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* Clear Canvas Confirmation Dialog */}
      <AlertDialog open={showCreateNewDialog} onOpenChange={setShowCreateNewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all nodes and connections from the canvas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => createNewWorkflow()}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Canvas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Canvas Confirmation Dialog (from toolbar button) */}
      <AlertDialog open={showClearCanvasDialog} onOpenChange={setShowClearCanvasDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all nodes and connections from the canvas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                createNewWorkflow();
                setShowClearCanvasDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Canvas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarningDialog} onOpenChange={setShowExitWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this workflow. Would you like to save before returning to the Inputs screen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitWarningDialog(false);
                onClose?.();
              }}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Exit Without Saving
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleSaveAndExit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save as Template Dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save the current workflow as a template for this organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="Enter template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Describe this template..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSaveTemplateDialog(false);
              setTemplateName('');
              setTemplateDescription('');
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!templateName.trim()) {
                alert('Please enter a template name');
                return;
              }
              
              const template = {
                id: `template_${organizationId}_${Date.now()}`,
                name: templateName.trim(),
                description: templateDescription.trim(),
                savedAt: new Date().toISOString(),
                organizationId: organizationId,
                nodes: nodes,
                connections: connections
              };
              
              // Save to localStorage
              const storageKey = `workflow_templates_${organizationId}`;
              const existingTemplates = JSON.parse(localStorage.getItem(storageKey) || '[]');
              existingTemplates.push(template);
              localStorage.setItem(storageKey, JSON.stringify(existingTemplates));
              
              setTemplates(existingTemplates);
              setShowSaveTemplateDialog(false);
              setTemplateName('');
              setTemplateDescription('');
              
              alert(`✅ Template "${template.name}" saved successfully!`);
            }}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={showLoadTemplateDialog} onOpenChange={setShowLoadTemplateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Select a template to load for this workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No templates found</p>
                <p className="text-xs mt-2">Save a workflow as a template to see it here</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          const confirm = window.confirm(
                            'You have unsaved changes. Loading this template will discard them. Continue?'
                          );
                          if (!confirm) return;
                        }
                        
                        setNodes(template.nodes);
                        setConnections(template.connections);
                        setWorkflowName(template.name);
                        setHasUnsavedChanges(true);
                        setShowLoadTemplateDialog(false);
                        
                        // Reset history with the new template
                        setHistory([{ nodes: template.nodes, connections: template.connections }]);
                        setHistoryIndex(0);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.description && (
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {template.nodes.length} nodes, {template.connections.length} connections
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Saved: {new Date(template.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirm = window.confirm(`Delete template "${template.name}"?`);
                            if (confirm) {
                              const storageKey = `workflow_templates_${organizationId}`;
                              const updatedTemplates = templates.filter(t => t.id !== template.id);
                              setTemplates(updatedTemplates);
                              localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Workflow Dialog */}
      <Dialog open={showLoadWorkflowDialog} onOpenChange={setShowLoadWorkflowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Workflow</DialogTitle>
            <DialogDescription>
              Select a previously saved workflow to load
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {savedWorkflows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No saved workflows found</p>
                <p className="text-xs mt-2">Save your current workflow from the menu to see it here</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-4">
                  {savedWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          const confirm = window.confirm(
                            'You have unsaved changes. Loading this workflow will discard them. Continue?'
                          );
                          if (!confirm) return;
                        }
                        
                        setNodes(workflow.nodes);
                        setConnections(workflow.connections);
                        setWorkflowName(workflow.name);
                        setHasUnsavedChanges(false);
                        setShowLoadWorkflowDialog(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {workflow.nodes.length} nodes, {workflow.connections.length} connections
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Saved: {new Date(workflow.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirm = window.confirm(`Delete workflow "${workflow.name}"?`);
                            if (confirm) {
                              setSavedWorkflows(savedWorkflows.filter(w => w.id !== workflow.id));
                              localStorage.setItem(
                                'savedWorkflows',
                                JSON.stringify(savedWorkflows.filter(w => w.id !== workflow.id))
                              );
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Type Selector Dialog */}
      {pendingNodePosition && (
        <Dialog open={!!pendingNodePosition} onOpenChange={(open) => !open && setPendingNodePosition(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Node Type</DialogTitle>
              <DialogDescription>
                Choose the type of node to add to this branch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(nodeTemplates)
                  .filter(([key]) => key !== 'start' && key !== 'end')
                  .map(([type, template]) => {
                    const Icon = template.icon;
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        onClick={() => {
                          const newNode: FlowNode = {
                            id: `node-${Date.now()}`,
                            type: type as FlowNode['type'],
                            label: template.label,
                            x: pendingNodePosition.x,
                            y: pendingNodePosition.y,
                            config: {}
                          };
                          setNodes([...nodes, newNode]);
                          
                          // Update the connection to point to the new node
                          setConnections(connections.map(c => 
                            c.from === pendingNodePosition.connection.from && c.to === pendingNodePosition.connection.to
                              ? { ...c, to: newNode.id }
                              : c
                          ));
                          
                          setPendingNodePosition(null);
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{template.label}</span>
                      </Button>
                    );
                  })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Draggable Properties Panel - Redesigned */}
      {showPropertiesPanel && selectedNodeData && propertiesPos && (
        <div 
          className="fixed w-64 z-50"
          style={{ 
            left: `${propertiesPos.x}px`, 
            top: `${propertiesPos.y}px`,
            cursor: draggingProperties ? 'grabbing' : 'default',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div 
              className="px-3 py-2 border-b bg-gradient-to-r from-indigo-600 to-purple-600 cursor-grab active:cursor-grabbing flex items-center justify-between"
              onMouseDown={(e) => {
                setDraggingProperties(true);
                setPropertiesDragStart({ x: e.clientX - propertiesPos.x, y: e.clientY - propertiesPos.y });
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-white text-sm font-semibold truncate">
                  {selectedNodeData.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-white/20 rounded flex-shrink-0" 
                  onClick={() => setPropertiesPanelCollapsed(!propertiesPanelCollapsed)}
                  onMouseDown={(e) => e.stopPropagation()}
                  title={propertiesPanelCollapsed ? "Expand properties" : "Collapse properties"}
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${propertiesPanelCollapsed ? 'rotate-180' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-white/20 rounded flex-shrink-0" 
                  onClick={() => setShowPropertiesPanel(false)}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Close properties"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </Button>
              </div>
            </div>
            
            {/* Content - Collapsible */}
            {!propertiesPanelCollapsed && (
              <ScrollArea className="max-h-[calc(100vh-150px)]">
                <div className="p-3 space-y-2.5 bg-white">
                  {/* Label */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">Node Label</Label>
                  <Input
                    value={selectedNodeData.label}
                    onChange={(e) => {
                      recordHistory();
                      updateNode(selectedNodeData.id, { label: e.target.value }, true);
                    }}
                    className="h-8 text-sm border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter label..."
                  />
                </div>

                {/* Configuration Section */}
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-8 px-2 justify-between text-xs font-semibold hover:bg-gray-50 text-gray-800 -mx-1"
                    >
                      <span>⚙️ Configuration</span>
                      <ChevronDown className="w-3.5 h-3.5 transition-transform ui-state-open:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                    {(selectedNodeData.type === 'start' || selectedNodeData.type === 'trigger') && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">Trigger Type</Label>
                        <select
                          value={selectedNodeData.config?.triggerType || ''}
                          onChange={(e) => {
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, triggerType: e.target.value }
                            });
                          }}
                          className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Select trigger...</option>
                          {triggerTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {(selectedNodeData.config?.triggerType === 'document-upload' || 
                          selectedNodeData.config?.triggerType === 'document-signed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-6 text-[10px] mt-1 border-blue-300 hover:bg-blue-50"
                            onClick={() => setShowDocLibrary(true)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Select Document
                          </Button>
                        )}
                      </div>
                    )}

                    {selectedNodeData.type === 'decision' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">Decision Type</Label>
                        <select
                          value={selectedNodeData.config?.decisionType || ''}
                          onChange={(e) => {
                            const type = e.target.value as 'yes-no' | 'approved-not-approved' | 'custom';
                            let criteria: Array<{ id: string; label: string }> = [];
                            
                            if (type === 'yes-no') {
                              criteria = [
                                { id: 'yes', label: 'Yes' },
                                { id: 'no', label: 'No' }
                              ];
                            } else if (type === 'approved-not-approved') {
                              criteria = [
                                { id: 'approved', label: 'Approved' },
                                { id: 'not-approved', label: 'Not Approved' }
                              ];
                            }
                            
                            // updateNode will record history
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, decisionType: type, decisionCriteria: criteria }
                            });
                            
                            // Get nodes that were connected to this decision node
                            const connectedNodeIds = connections
                              .filter(conn => conn.from === selectedNodeData.id && !conn.to.startsWith('pending-'))
                              .map(conn => conn.to);
                            
                            // Remove all old connections from this decision node (both pending and completed)
                            const otherConnections = connections.filter(conn => conn.from !== selectedNodeData.id);
                            
                            // Create connections for each criteria
                            if (criteria.length > 0) {
                              console.log('🔀 Creating decision connections:', criteria);
                              const newConnections = criteria.map(c => ({
                                from: selectedNodeData.id,
                                to: `pending-${selectedNodeData.id}-${c.id}`,
                                label: c.label,
                                criteriaId: c.id
                              }));
                              console.log('🔀 Total connections:', [...otherConnections, ...newConnections]);
                              const updatedConnections = [...otherConnections, ...newConnections];
                              setConnections(updatedConnections);
                              
                              // If there were previously connected nodes, we need to remove them or reassign them
                              // For now, we just disconnect them (they become orphaned)
                              // Future enhancement: could try to reconnect them to matching criteria
                            } else {
                              setConnections(otherConnections);
                            }
                          }}
                          className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Select type...</option>
                          <option value="yes-no">Yes / No</option>
                          <option value="custom">Custom Criteria</option>
                        </select>
                        
                        {selectedNodeData.config?.decisionType === 'custom' && (
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-700">Custom Options</Label>
                            {(selectedNodeData.config?.decisionCriteria || []).map((criteria, idx) => (
                              <div key={criteria.id} className="flex gap-1">
                                <Input
                                  value={criteria.label}
                                  onChange={(e) => {
                                    const newCriteria = [...(selectedNodeData.config?.decisionCriteria || [])];
                                    newCriteria[idx] = { ...criteria, label: e.target.value };
                                    // updateNode will record history
                                    updateNode(selectedNodeData.id, {
                                      config: { ...selectedNodeData.config, decisionCriteria: newCriteria }
                                    });
                                    // Update the connection label to match
                                    setConnections(connections.map(conn => 
                                      conn.from === selectedNodeData.id && conn.criteriaId === criteria.id
                                        ? { ...conn, label: e.target.value }
                                        : conn
                                    ));
                                  }}
                                  className="h-6 text-[11px]"
                                  placeholder={`Option ${idx + 1}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    const newCriteria = selectedNodeData.config?.decisionCriteria?.filter((_, i) => i !== idx) || [];
                                    // updateNode will record history
                                    updateNode(selectedNodeData.id, {
                                      config: { ...selectedNodeData.config, decisionCriteria: newCriteria }
                                    });
                                    // Remove connection for this criteria
                                    const updatedConnections = connections.filter(c => c.criteriaId !== criteria.id);
                                    setConnections(updatedConnections);
                                    
                                    // DON'T redistribute - let manually positioned nodes stay where they are
                                    // Users can manually adjust node positions if needed
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-6 text-[10px]"
                              onClick={() => {
                                recordHistory(); // Record once at the start
                                
                                const currentCriteria = selectedNodeData.config?.decisionCriteria || [];
                                const newCriterion = { 
                                  id: `opt-${Date.now()}`, 
                                  label: `Option ${currentCriteria.length + 1}` 
                                };
                                const newCriteria = [...currentCriteria, newCriterion];
                                
                                // Update node with new criteria (skip history since we recorded above)
                                const updatedNodes = nodes.map(n => 
                                  n.id === selectedNodeData.id 
                                    ? { ...n, config: { ...n.config, decisionCriteria: newCriteria } }
                                    : n
                                );
                                setNodes(updatedNodes);
                                
                                // Create connection for new criteria
                                const newConn = {
                                  from: selectedNodeData.id,
                                  to: `pending-${selectedNodeData.id}-${newCriterion.id}`,
                                  label: newCriterion.label,
                                  criteriaId: newCriterion.id
                                };
                                console.log('➕ Adding new criterion connection:', newConn);
                                const updatedConnections = [...connections, newConn];
                                setConnections(updatedConnections);
                                
                                // DON'T redistribute - let manually positioned nodes stay where they are
                                // The new branch will show a pending connection endpoint for the user to connect
                                
                                setHasUnsavedChanges(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Option
                            </Button>
                          </div>
                        )}
                        
                        {selectedNodeData.config?.decisionCriteria && selectedNodeData.config.decisionCriteria.length > 0 && (
                          <div className="text-[9px] text-gray-600 bg-blue-50 p-1.5 rounded">
                            ℹ️ Click connection endpoints to add nodes
                          </div>
                        )}
                      </div>
                    )}

                    {selectedNodeData.type === 'action' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-gray-700">Action Type</Label>
                      <select
                        value={selectedNodeData.config?.actionType || ''}
                        onChange={(e) => {
                          updateNode(selectedNodeData.id, {
                            config: { ...selectedNodeData.config, actionType: e.target.value }
                          });
                        }}
                        className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                      >
                        <option value="">Select action...</option>
                        {actionTypes.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedNodeData.config?.actionType === 'manual-action' && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-700">Manual Action Description</Label>
                        <Textarea
                          value={selectedNodeData.config?.description || ''}
                          onChange={(e) => updateNode(selectedNodeData.id, {
                            config: { ...selectedNodeData.config, description: e.target.value }
                          }, true)}
                          onBlur={() => recordHistory()}
                          className="text-[11px] min-h-[60px]"
                          placeholder="Describe the manual action to be performed..."
                        />
                      </div>
                    )}
                  </>
                )}

                {selectedNodeData.type === 'input' && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-gray-700">Type</Label>
                    <select
                      value={selectedNodeData.config?.inputOutputType || 'input'}
                      onChange={(e) => {
                        updateNode(selectedNodeData.id, {
                          config: { ...selectedNodeData.config, inputOutputType: e.target.value as 'input' | 'output' }
                        });
                      }}
                      className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                    >
                      <option value="input">Input</option>
                      <option value="output">Output</option>
                    </select>
                  </div>
                )}

                {selectedNodeData.type === 'task' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-gray-700">Assignee</Label>
                      <select
                        value={selectedNodeData.config?.assignee || ''}
                        onChange={(e) => {
                          const newAssignee = e.target.value;
                          updateNode(selectedNodeData.id, {
                            config: { 
                              ...selectedNodeData.config, 
                              assignee: newAssignee,
                              // Clear action when assignee changes
                              apiAction: newAssignee.startsWith('api-') ? selectedNodeData.config?.apiAction : undefined
                            }
                          });
                        }}
                        className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                      >
                        <option value="">Select assignee...</option>
                        <option value="cpa">CPA</option>
                        <option value="client">Client</option>
                        <option disabled>─────────────────</option>
                        <option value="api-quickbooks">QuickBooks (API)</option>
                        <option value="api-docusign">DocuSign (API)</option>
                        <option value="api-stripe">Stripe (API)</option>
                        <option value="api-slack">Slack (API)</option>
                        <option value="api-mailchimp">Mailchimp (API)</option>
                        <option value="api-zapier">Zapier (API)</option>
                        <option value="api-hubspot">HubSpot (API)</option>
                      </select>
                    </div>
                    
                    {/* Show API Action selector if assignee is a 3rd party API */}
                    {selectedNodeData.config?.assignee?.startsWith('api-') && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-700">API Action</Label>
                        <select
                          value={selectedNodeData.config?.apiAction || ''}
                          onChange={(e) => {
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, apiAction: e.target.value }
                            });
                          }}
                          className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                        >
                          <option value="">Select action...</option>
                          {selectedNodeData.config?.assignee === 'api-quickbooks' && (
                            <>
                              <option value="create-invoice">Create Invoice</option>
                              <option value="create-customer">Create Customer</option>
                              <option value="create-payment">Record Payment</option>
                              <option value="get-balance">Get Account Balance</option>
                              <option value="sync-expenses">Sync Expenses</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-docusign' && (
                            <>
                              <option value="send-envelope">Send Envelope</option>
                              <option value="get-status">Get Document Status</option>
                              <option value="download-signed">Download Signed Document</option>
                              <option value="void-envelope">Void Envelope</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-stripe' && (
                            <>
                              <option value="create-charge">Create Charge</option>
                              <option value="create-subscription">Create Subscription</option>
                              <option value="create-customer">Create Customer</option>
                              <option value="refund">Issue Refund</option>
                              <option value="send-invoice">Send Invoice</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-slack' && (
                            <>
                              <option value="send-message">Send Message</option>
                              <option value="create-channel">Create Channel</option>
                              <option value="post-file">Post File</option>
                              <option value="send-notification">Send Notification</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-mailchimp' && (
                            <>
                              <option value="add-subscriber">Add Subscriber</option>
                              <option value="send-campaign">Send Campaign</option>
                              <option value="update-list">Update List</option>
                              <option value="tag-contact">Tag Contact</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-zapier' && (
                            <>
                              <option value="trigger-zap">Trigger Zap</option>
                              <option value="send-webhook">Send Webhook</option>
                            </>
                          )}
                          {selectedNodeData.config?.assignee === 'api-hubspot' && (
                            <>
                              <option value="create-contact">Create Contact</option>
                              <option value="create-deal">Create Deal</option>
                              <option value="log-activity">Log Activity</option>
                              <option value="send-email">Send Email</option>
                              <option value="update-property">Update Property</option>
                            </>
                          )}
                        </select>
                        {selectedNodeData.config?.apiAction && (
                          <div className="text-[9px] text-blue-600 bg-blue-50 p-1.5 rounded mt-1">
                            ℹ️ This task will execute via {selectedNodeData.config.assignee.replace('api-', '').toUpperCase()} API
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedNodeData.type === 'document' && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-gray-700">Document</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-6 text-[10px] border-blue-300 hover:bg-blue-50 justify-start"
                      onClick={() => setShowDocLibrary(true)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {selectedNodeData.config?.documentId 
                        ? selectedNodeData.label || 'Change Document'
                        : 'Select Document'}
                    </Button>
                    {selectedNodeData.config?.documentId && (
                      <div className="text-[9px] text-gray-500 bg-blue-50 p-1.5 rounded mt-1">
                        ℹ️ Document selected: {selectedNodeData.label}
                      </div>
                    )}
                  </div>
                )}

                    {selectedNodeData.type === 'end' && (
                      <div className="space-y-1.5">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-700">Completion Status</Label>
                          <select
                            value={selectedNodeData.config?.completionStatus || 'completed'}
                            onChange={(e) => {
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, completionStatus: e.target.value }
                              });
                            }}
                            className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                          >
                            <option value="completed">Completed</option>
                            <option value="approved">Approved</option>
                            <option value="archived">Archived</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <Collapsible defaultOpen={false}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-6 px-2 justify-between text-[10px] font-semibold hover:bg-gray-100 text-gray-700">
                              <span>Additional Settings</span>
                              <ChevronDown className="w-3 h-3 transition-transform" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1.5 mt-1">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-700">Assignee</Label>
                              <select
                                value={selectedNodeData.config?.assignee || ''}
                                onChange={(e) => {
                                  updateNode(selectedNodeData.id, {
                                    config: { ...selectedNodeData.config, assignee: e.target.value }
                                  });
                                }}
                                className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                              >
                                <option value="">Select assignee...</option>
                                <option value="cpa">CPA</option>
                                <option value="client">Client</option>
                                <option disabled>─────────────────</option>
                                <option value="api-quickbooks">QuickBooks (API)</option>
                                <option value="api-docusign">DocuSign (API)</option>
                                <option value="api-stripe">Stripe (API)</option>
                                <option value="api-slack">Slack (API)</option>
                                <option value="api-mailchimp">Mailchimp (API)</option>
                                <option value="api-zapier">Zapier (API)</option>
                                <option value="api-hubspot">HubSpot (API)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-700">Send Notification</Label>
                              <select
                                value={selectedNodeData.config?.sendNotification || 'yes'}
                                onChange={(e) => {
                                  updateNode(selectedNodeData.id, {
                                    config: { ...selectedNodeData.config, sendNotification: e.target.value }
                                  });
                                }}
                                className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>

                            {selectedNodeData.config?.sendNotification === 'yes' && (
                              <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-gray-700">Notify</Label>
                                <select
                                  value={selectedNodeData.config?.notifyRecipients || 'all'}
                                  onChange={(e) => {
                                    updateNode(selectedNodeData.id, {
                                      config: { ...selectedNodeData.config, notifyRecipients: e.target.value }
                                    });
                                  }}
                                  className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                                >
                                  <option value="all">All Participants</option>
                                  <option value="client">Client Only</option>
                                  <option value="cpa">CPA Only</option>
                                  <option value="assignees">Task Assignees</option>
                                </select>
                              </div>
                            )}

                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-700">Archive Workflow</Label>
                              <select
                                value={selectedNodeData.config?.archiveWorkflow || 'yes'}
                                onChange={(e) => {
                                  updateNode(selectedNodeData.id, {
                                    config: { ...selectedNodeData.config, archiveWorkflow: e.target.value }
                                  });
                                }}
                                className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-700">Generate Report</Label>
                              <select
                                value={selectedNodeData.config?.generateReport || 'yes'}
                                onChange={(e) => {
                                  updateNode(selectedNodeData.id, {
                                    config: { ...selectedNodeData.config, generateReport: e.target.value }
                                  });
                                }}
                                className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Notes Section */}
                <div className="pt-2.5">
                  <Collapsible open={notesExpanded} onOpenChange={setNotesExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 px-2 justify-between text-xs font-semibold hover:bg-gray-50 text-gray-800 -mx-1"
                      >
                        <span>📝 Notes</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${notesExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 pt-2 border-t border-gray-100">
                      <Textarea
                        value={selectedNodeData.config?.description || ''}
                        onChange={(e) => updateNode(selectedNodeData.id, {
                          config: { ...selectedNodeData.config, description: e.target.value }
                        })}
                        onBlur={() => recordHistory()}
                        rows={3}
                        placeholder="Add notes about this node..."
                        className="text-sm border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* System Integration Section */}
                {(selectedNodeData.type === 'task' || selectedNodeData.type === 'input' || 
                  selectedNodeData.type === 'start' || selectedNodeData.type === 'trigger') && (
                  <div className="pt-2.5">
                    <Collapsible defaultOpen={true}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full h-8 px-2 justify-between text-xs font-semibold hover:bg-indigo-50 text-indigo-700 -mx-1"
                        >
                          <div className="flex items-center gap-2">
                            <span>🔗 System Integration</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-indigo-50 border-indigo-300 text-indigo-700">
                              CFO
                            </Badge>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform ui-state-open:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                        {/* Triggers */}
                        {(selectedNodeData.type === 'start' || selectedNodeData.type === 'trigger' || selectedNodeData.type === 'task') && (
                          <NodeMetadataEditor
                            label="Triggers"
                            values={selectedNodeData.config?.triggers || []}
                            suggestions={orgMetadata.triggers}
                            onChange={(triggers) => {
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, triggers }
                              });
                            }}
                            onAddToOrganization={handleAddTrigger}
                            placeholder="e.g., Email, EDI Feed"
                          />
                        )}

                        {/* Inputs */}
                        <NodeMetadataEditor
                          label="Inputs"
                          values={selectedNodeData.config?.inputs || []}
                          suggestions={orgMetadata.inputs}
                          onChange={(inputs) => {
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, inputs }
                            });
                          }}
                          onAddToOrganization={handleAddInput}
                          placeholder="e.g., ERP, OCR Engine"
                        />

                        {/* Outputs */}
                        <NodeMetadataEditor
                          label="Outputs"
                          values={selectedNodeData.config?.outputs || []}
                          suggestions={orgMetadata.outputs}
                          onChange={(outputs) => {
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, outputs }
                            });
                          }}
                          onAddToOrganization={handleAddOutput}
                          placeholder="e.g., Parsed record"
                        />

                        {/* Dependencies */}
                        <NodeMetadataEditor
                          label="Dependencies"
                          values={selectedNodeData.config?.dependencies || []}
                          suggestions={orgMetadata.dependencies}
                          onChange={(dependencies) => {
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, dependencies }
                            });
                          }}
                          onAddToOrganization={handleAddDependency}
                          placeholder="e.g., AP, Finance, IT"
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Complexity Metrics Section */}
                <div className="pt-2.5">
                  <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 px-2 justify-between text-xs font-semibold hover:bg-purple-50 text-purple-700 -mx-1"
                      >
                        <div className="flex items-center gap-2">
                          <span>📊 Complexity Tracking</span>
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-purple-50 border-purple-300 text-purple-700">
                            Risk
                          </Badge>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform ui-state-open:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                      {/* Mark as Input Node checkbox */}
                      {selectedNodeData.type !== 'start' && selectedNodeData.type !== 'end' && (
                        <div className="flex items-center space-x-2 p-1.5 rounded bg-purple-50 border border-purple-200">
                          <Checkbox
                            id={`input-${selectedNodeData.id}`}
                            checked={selectedNodeData.config?.isInputNode || false}
                            onCheckedChange={(checked) => {
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, isInputNode: checked as boolean }
                              });
                            }}
                            className="h-3 w-3"
                          />
                          <label
                            htmlFor={`input-${selectedNodeData.id}`}
                            className="text-[10px] cursor-pointer flex-1"
                          >
                            Mark as Input Node
                          </label>
                        </div>
                      )}

                      {/* Team Assignment dropdown */}
                      {selectedNodeData.type !== 'start' && selectedNodeData.type !== 'end' && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-700">Responsible Team</Label>
                          <select
                            value={selectedNodeData.config?.responsibleTeam || ''}
                            onChange={(e) => {
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, responsibleTeam: e.target.value }
                              });
                            }}
                            className="w-full h-6 px-2 text-[11px] border border-gray-300 rounded focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-white"
                          >
                            <option value="">Select team...</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Operations">Operations</option>
                            <option value="Finance">Finance</option>
                            <option value="IT">IT</option>
                            <option value="DevOps">DevOps</option>
                            <option value="HR">HR</option>
                            <option value="Customer Success">Customer Success</option>
                            <option value="Product">Product</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Legal">Legal</option>
                            <option value="Compliance">Compliance</option>
                          </select>
                          <p className="text-[9px] text-gray-500">For dependency tracking</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-9 text-sm font-medium"
                    onClick={() => {
                      recordHistory();
                      deleteNode(selectedNodeData.id);
                    }}
                    disabled={selectedNodeData.type === 'start'}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Node
                  </Button>
                </div>
              </div>
            </ScrollArea>
            )}
          </Card>
        </div>
      )}



      {/* Node Hover Tooltip */}
      {nodeTooltip && (() => {
        const node = nodes.find(n => n.id === nodeTooltip.nodeId);
        if (!node) return null;
        
        const template = nodeTemplates[node.type];
        const details: string[] = [];
        
        details.push(`${template.label}`);
        if (node.label !== template.label) details.push(`${node.label}`);
        
        if (node.config) {
          if (node.config.description) details.push(`${node.config.description}`);
          if (node.config.assignee) details.push(`Assignee: ${node.config.assignee}`);
          if (node.config.duration) details.push(`${node.config.duration}h`);
          if (node.config.triggerType) {
            const trigger = triggerTypes.find(t => t.value === node.config.triggerType);
            details.push(`${trigger?.label || node.config.triggerType}`);
          }
          if (node.config.actionType) {
            const action = actionTypes.find(a => a.value === node.config.actionType);
            details.push(`${action?.label || node.config.actionType}`);
          }
          if (node.config.decisionCriteria && node.config.decisionCriteria.length > 0) {
            details.push(`${node.config.decisionCriteria.map(c => c.label).join(', ')}`);
          }
        }
        
        return (
          <div
            className="fixed z-[100] pointer-events-none"
            style={{
              left: `${nodeTooltip.x}px`,
              top: `${nodeTooltip.y}px`
            }}
          >
            <div className="bg-white border border-gray-300 shadow-md rounded px-2 py-1.5 text-[10px] text-gray-700 leading-tight space-y-0.5" style={{ maxWidth: '180px' }}>
              {details.map((detail, idx) => (
                <div key={idx}>{detail}</div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Delete Selected Nodes Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Nodes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedNodes.size} selected node{selectedNodes.size > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelectedNodes} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Exit Warning Dialog - Unsaved Changes */}
      <AlertDialog open={showExitWarningDialog} onOpenChange={setShowExitWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this workflow. Do you want to save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleExitWithoutSaving}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowExitWarningDialog(false)}>
              Cancel
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndExit} className="bg-green-600 hover:bg-green-700">
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Clear Canvas Confirmation Dialog */}
      <AlertDialog open={showClearCanvasDialog} onOpenChange={setShowClearCanvasDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all nodes and connections for "{processName}" and remove the saved workflow from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCanvas} className="bg-red-600 hover:bg-red-700">
              Clear Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 shadow-lg rounded-lg p-3 max-w-sm z-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-blue-700">Debug Panel</h3>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] h-4 px-1">{debugInfo.length}</Badge>
            <button
              onClick={copyDebugInfo}
              className="text-[10px] bg-blue-500 text-white hover:bg-blue-600 px-2 py-0.5 rounded"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
            <button
              onClick={() => setDebugInfo([])}
              className="text-[10px] text-gray-500 hover:text-gray-700 px-1"
              title="Clear logs"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto text-[10px] font-mono">
          {debugInfo.length === 0 ? (
            <div className="text-gray-400 text-center py-2">No logs yet</div>
          ) : (
            debugInfo.slice(-10).map((info, idx) => (
              <div key={idx} className="text-gray-700 border-b border-gray-100 pb-0.5">
                {info}
              </div>
            ))
          )}
        </div>
        <div className="mt-2 pt-2 border-t text-[9px] text-gray-600 space-y-0.5">
          <div className="break-all">Multi-select: {selectedNodes.size} [{Array.from(selectedNodes).map(id => id.slice(-8)).join(', ')}]</div>
          <div>Selected: {selectedNode ? selectedNode.slice(-10) : 'None'}</div>
          <div>Dragging: {draggingNode ? draggingNode.slice(-10) : 'No'}</div>
          <div>Multi-drag: {isMultiDragging.current ? 'Yes' : 'No'}</div>
          <div>Did drag: {didDragRef.current ? 'Yes' : 'No'}</div>
          <div>History: {historyIndex + 1}/{history.length}</div>
        </div>
      </div>

    </div>
  );
}
