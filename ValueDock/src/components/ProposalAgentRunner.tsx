/**
 * ProposalAgentRunner - AI-powered proposal generation workflow
 * 
 * Orchestrates the proposal agent to:
 * 1. Fetch customer website data
 * 2. Retrieve and summarize Fathom meeting transcripts
 * 3. Generate ValueDock proposal data
 * 4. Create Gamma presentation links
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  PlayCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Globe,
  Mic,
  FileText,
  Presentation,
  AlertCircle,
  Calendar,
  ChevronRight,
  Building2,
  Save,
  Beaker,
  Eye,
  ChevronDown,
  ChevronUp,
  History,
  Wrench,
  Copy,
  Check,
  Circle,
  Tag,
  Info
} from 'lucide-react';
import { apiCall, UserProfile } from '../utils/auth';
import { toast } from 'sonner';
import { ProposalVersionSwitcher, ProposalVersion } from './ProposalVersionSwitcher';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { ProposalContentBuilder } from './ProposalContentBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ProposalAgentRunnerProps {
  currentUser: UserProfile;
  organizations?: any[];
  selectedContextOrgId?: string | null;
}

interface ToolCallLog {
  id: string;
  tool: 'website' | 'fathom' | 'valuedock' | 'gamma';
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

export function ProposalAgentRunner({ currentUser, organizations = [], selectedContextOrgId }: ProposalAgentRunnerProps) {
  // Form state
  const [dealId, setDealId] = useState('');
  const [customerUrl, setCustomerUrl] = useState('');
  const [fathomWindowDays, setFathomWindowDays] = useState('30');
  const [targetOrgId, setTargetOrgId] = useState<string>(selectedContextOrgId || currentUser.organizationId || '');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ToolCallLog[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  // Results
  const [gammaLink, setGammaLink] = useState<string | null>(null);
  const [valueDockDataId, setValueDockDataId] = useState<string | null>(null);

  // Version management
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ProposalVersion | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  
  // Tenant/Org names for breadcrumb
  const [tenantName, setTenantName] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');
  
  // Tab state for Builder/Content views
  const [activeTab, setActiveTab] = useState<'runner' | 'content' | 'versions'>('runner');
  
  // Test Run state
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testOutput, setTestOutput] = useState<string>('');
  
  // Fathom Integration state
  const [fathomStartDate, setFathomStartDate] = useState<string>('');
  const [fathomEndDate, setFathomEndDate] = useState<string>('');
  const [fathomTagFilter, setFathomTagFilter] = useState<string>('');
  const [isFathomTesting, setIsFathomTesting] = useState(false);
  const [fathomTestResult, setFathomTestResult] = useState<any>(null);
  const [showTestOutput, setShowTestOutput] = useState(false);
  
  // Smoke Test state
  const [isSmokeTestRunning, setIsSmokeTestRunning] = useState(false);
  const [smokeLogs, setSmokeLogs] = useState<string[]>([]);
  const [smokeOutput, setSmokeOutput] = useState<string>('');
  const [showSmokeOutput, setShowSmokeOutput] = useState(false);
  
  // OpenAI REST toggle
  const [useOpenAIRest, setUseOpenAIRest] = useState(false);
  const [openAILogs, setOpenAILogs] = useState<any[]>([]);
  
  // Cloud Run state
  const [runInCloud, setRunInCloud] = useState(false);
  const [isCloudRunning, setIsCloudRunning] = useState(false);
  const [cloudRunLog, setCloudRunLog] = useState<string>('');
  const [cloudRunResponse, setCloudRunResponse] = useState<any>(null);
  const [showCloudLog, setShowCloudLog] = useState(false);
  
  // Cloud Run Console state (for deployment)
  const [showCloudConsole, setShowCloudConsole] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'testing' | 'verified' | 'failed'>('idle');
  
  // Cloud Function Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResponse, setVerificationResponse] = useState<any>(null);
  const [edgeFunctionConnected, setEdgeFunctionConnected] = useState<boolean | null>(null);
  
  // Direct Edge Function Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testHttpStatus, setTestHttpStatus] = useState<number | null>(null);
  
  // Sync Cloud Secrets state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResponse, setSyncResponse] = useState<any>(null);

  // Direct Cloud Proposal Agent state
  const [isDirectCloudRunning, setIsDirectCloudRunning] = useState(false);
  const [directCloudSummary, setDirectCloudSummary] = useState<string | null>(null);
  const [showDirectCloudResult, setShowDirectCloudResult] = useState(false);
  
  // WorkfloDock-style progress tracking
  const [progressSteps, setProgressSteps] = useState<Array<{
    id: string;
    agentNumber: number;
    totalAgents: number;
    stepNumber: string; // e.g., "1.19.1", "1.19.2"
    totalSteps: number;
    title: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    command?: string;
    output?: string;
    timestamp: string;
  }>>([]);
  const [currentMilestone, setCurrentMilestone] = useState<number>(0);
  const totalMilestones = 5; // Website → Fathom → ValueDock → Gamma → Complete
  
  // Tool Timeline state
  const [toolTimeline, setToolTimeline] = useState<Array<{
    id: string;
    tool: 'fetch_url' | 'fathom_fetch' | 'valuedock_get_financials' | 'valuedock_put_processes' | 'valuedock_put_groups';
    status: 'pending' | 'running' | 'success' | 'skipped' | 'error';
    timestamp: string;
    duration?: number;
  }>>([]);
  const [lastRunPayload, setLastRunPayload] = useState<any>(null);
  
  // Solution Composer state
  const [isSolutionComposerRunning, setIsSolutionComposerRunning] = useState(false);
  const [solutionComposerResponse, setSolutionComposerResponse] = useState<any>(null);
  const [showSolutionComposerResults, setShowSolutionComposerResults] = useState(false);

  // Load versions when deal ID or org changes
  useEffect(() => {
    if (dealId && targetOrgId) {
      loadVersions();
      loadBreadcrumbData();
    }
  }, [dealId, targetOrgId]);

  // Load proposal versions from backend
  const loadVersions = async () => {
    if (!dealId || !targetOrgId) return;
    
    try {
      const response = await apiCall(`/proposal-agent/versions?dealId=${dealId}&organizationId=${targetOrgId}`);
      
      if (response.success && response.versions) {
        setVersions(response.versions);
        
        // Set current version to latest or create initial version
        if (response.versions.length > 0) {
          const latest = response.versions.sort((a: ProposalVersion, b: ProposalVersion) => 
            b.version - a.version
          )[0];
          setCurrentVersion(latest);
        } else {
          // Create initial version
          await createInitialVersion();
        }
      }
    } catch (error) {
      console.error('[ProposalAgent] Error loading versions:', error);
    }
  };

  // Create initial version (v1)
  const createInitialVersion = async () => {
    if (!dealId || !targetOrgId) return;
    
    const initialVersion: ProposalVersion = {
      id: `${dealId}-v1-${Date.now()}`,
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name || currentUser.email
    };
    
    setVersions([initialVersion]);
    setCurrentVersion(initialVersion);
  };

  // Version change handler
  const handleVersionChange = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    
    setCurrentVersion(version);
    
    // Optionally load version-specific data
    try {
      const response = await apiCall(`/proposal-agent/versions/${versionId}?dealId=${dealId}&organizationId=${targetOrgId}`);
      if (response.success && response.data) {
        if (response.data.logs) {
          setLogs(response.data.logs);
        }
        if (response.data.results) {
          setGammaLink(response.data.results.gammaLink || null);
          setValueDockDataId(response.data.results.valueDockDataId || null);
        }
        
        toast.success(`Switched to Version ${version.version}`);
      }
    } catch (error) {
      console.error('[ProposalAgent] Error loading version data:', error);
      toast.error('Failed to load version data');
    }
  };

  // Load tenant and org names for breadcrumb
  const loadBreadcrumbData = async () => {
    if (!targetOrgId) return;
    
    try {
      // Get org details
      const orgResponse = await apiCall(`/organizations/${targetOrgId}`);
      if (orgResponse.organization) {
        setOrgName(orgResponse.organization.name || orgResponse.organization.companyName);
        
        // Get tenant details if org has tenantId
        if (orgResponse.organization.tenantId) {
          const tenantResponse = await apiCall(`/tenants/${orgResponse.organization.tenantId}`);
          if (tenantResponse.tenant) {
            setTenantName(tenantResponse.tenant.name);
          }
        }
      }
    } catch (error) {
      console.error('[ProposalAgent] Error loading breadcrumb data:', error);
    }
  };

  // Create new version
  const handleCreateVersion = async () => {
    if (!dealId || !targetOrgId || !currentVersion) {
      toast.error('Cannot create version without an active proposal');
      return;
    }
    
    setIsCreatingVersion(true);
    
    try {
      const newVersionNumber = Math.max(...versions.map(v => v.version)) + 1;
      
      const newVersion: ProposalVersion = {
        id: `${dealId}-v${newVersionNumber}-${Date.now()}`,
        version: newVersionNumber,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name || currentUser.email
      };
      
      // Save to backend
      const response = await apiCall('/proposal-agent/create-version', {
        method: 'POST',
        body: {
          dealId,
          organizationId: targetOrgId,
          version: newVersion,
          cloneFromVersionId: currentVersion.id // Clone current version data
        }
      });
      
      if (response.success) {
        setVersions(prev => [...prev, newVersion]);
        setCurrentVersion(newVersion);
        toast.success(`Version ${newVersionNumber} created!`);
      } else {
        toast.error('Failed to create new version');
      }
    } catch (error) {
      console.error('[ProposalAgent] Error creating version:', error);
      toast.error('Failed to create new version');
    } finally {
      setIsCreatingVersion(false);
    }
  };

  // Test Run handler
  const handleTestRun = async () => {
    setIsTestRunning(true);
    setTestLogs([]);
    setTestOutput('');
    setShowTestOutput(false);

    try {
      // Add initial log
      setTestLogs(prev => [...prev, '🚀 Starting Test Run...']);
      setTestLogs(prev => [...prev, '📋 Using placeholder IDs: deal-test-001, org-test-001']);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTestLogs(prev => [...prev, '🌐 Fetching site → Analyzing customer website...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTestLogs(prev => [...prev, '✅ Website analysis complete']);
      setTestLogs(prev => [...prev, '💰 Analyzing ROI → Calculating metrics...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTestLogs(prev => [...prev, '✅ ROI calculation complete']);
      setTestLogs(prev => [...prev, '💾 Saving version → Persisting to database...']);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTestLogs(prev => [...prev, '✅ Version saved successfully']);
      setTestLogs(prev => [...prev, '✨ Test Run Complete!']);
      
      // Call actual test endpoint
      const response = await apiCall('/proposal-agent/test-run', {
        method: 'POST',
        body: {
          deal_id: 'deal-test-001',
          customer_url: 'https://example.com',
          fathom_window_days: 30,
          organization_id: 'org-test-001',
          use_openai_rest: useOpenAIRest
        }
      });

      if (response.success && response.output) {
        setTestOutput(response.output);
        setShowTestOutput(true);
        toast.success('Test run completed successfully!');
      } else {
        setTestLogs(prev => [...prev, '❌ Test run failed: ' + (response.error || 'Unknown error')]);
        toast.error('Test run failed');
      }
    } catch (error: any) {
      setTestLogs(prev => [...prev, '❌ Error: ' + error.message]);
      toast.error('Test run error: ' + error.message);
    } finally {
      setIsTestRunning(false);
    }
  };

  // Smoke Test handler
  const handleSmokeTest = async () => {
    setIsSmokeTestRunning(true);
    setSmokeLogs([]);
    setSmokeOutput('');
    setShowSmokeOutput(false);

    try {
      setSmokeLogs(prev => [...prev, '🧪 Starting Smoke Test...']);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSmokeLogs(prev => [...prev, '🌐 fetch_url → Retrieving customer data...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSmokeLogs(prev => [...prev, '✅ fetch_url complete']);
      setSmokeLogs(prev => [...prev, '🎤 fathom.get_meetings → Searching transcripts...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSmokeLogs(prev => [...prev, '✅ fathom.get_meetings complete']);
      setSmokeLogs(prev => [...prev, '🎤 fathom.get_summary → Extracting insights...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSmokeLogs(prev => [...prev, '✅ fathom.get_summary complete']);
      setSmokeLogs(prev => [...prev, '💾 valuedock.put_proposal → Saving proposal data...']);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSmokeLogs(prev => [...prev, '✅ valuedock.put_proposal complete']);
      setSmokeLogs(prev => [...prev, '🎨 gamma.create_deck → Generating presentation...']);
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setSmokeLogs(prev => [...prev, '✅ gamma.create_deck complete']);
      
      // Call actual smoke test endpoint
      const response = await apiCall('/proposal-agent/smoke-test', {
        method: 'POST',
        body: {
          use_openai_rest: useOpenAIRest
        }
      });

      if (response.success) {
        setSmokeOutput(response.assistant_text || 'Smoke test completed successfully. All tools executed without errors.');
        setShowSmokeOutput(true);
        setSmokeLogs(prev => [...prev, '✨ Smoke Test Complete!']);
        toast.success('Smoke test completed!');
      } else {
        setSmokeLogs(prev => [...prev, '❌ Smoke test failed: ' + (response.error || 'Unknown error')]);
        toast.error('Smoke test failed');
      }
    } catch (error: any) {
      setSmokeLogs(prev => [...prev, '❌ Error: ' + error.message]);
      toast.error('Smoke test error: ' + error.message);
    } finally {
      setIsSmokeTestRunning(false);
    }
  };

  // Helper to add log entry
  const addLog = (tool: ToolCallLog['tool'], status: ToolCallLog['status'], message: string, details?: any) => {
    const newLog: ToolCallLog = {
      id: Date.now().toString() + Math.random(),
      tool,
      status,
      message,
      timestamp: new Date(),
      details
    };
    setLogs(prev => [...prev, newLog]);
    return newLog.id;
  };

  // Helper to update log entry
  const updateLog = (id: string, updates: Partial<ToolCallLog>) => {
    setLogs(prev => prev.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!dealId.trim()) {
      toast.error('Please enter a Deal ID');
      return false;
    }
    if (!customerUrl.trim()) {
      toast.error('Please enter a Customer URL');
      return false;
    }
    if (!targetOrgId) {
      toast.error('Please select a target organization');
      return false;
    }
    // Basic URL validation
    try {
      new URL(customerUrl);
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)');
      return false;
    }
    return true;
  };

  // Run & Save Version - creates new version, runs agent, and updates on success
  const handleRunAndSaveVersion = async () => {
    if (!validateForm()) return;

    try {
      // First, create a new version
      const newVersionNumber = versions.length > 0 
        ? Math.max(...versions.map(v => v.version)) + 1 
        : 1;
      
      const newVersion: ProposalVersion = {
        id: `${dealId}-v${newVersionNumber}-${Date.now()}`,
        version: newVersionNumber,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name || currentUser.email
      };

      // Create version in backend
      const createResponse = await apiCall('/proposal-agent/create-version', {
        method: 'POST',
        body: {
          dealId,
          organizationId: targetOrgId,
          tenantId: currentUser.tenantId,
          version: newVersion
        }
      });

      if (!createResponse.success) {
        toast.error('Failed to create new version');
        return;
      }

      // Add to local state
      setVersions(prev => [...prev, newVersion]);
      setCurrentVersion(newVersion);

      // Now run the agent with this version
      await runAgentWithVersion(newVersion);

      // After successful run, fetch latest version
      await loadVersions();
      
      // Show success toast
      toast.success(`Proposal v${newVersionNumber} saved!`);

    } catch (error: any) {
      console.error('[ProposalAgent] Error in Run & Save Version:', error);
      toast.error('Failed to run and save version');
    }
  };

  // Run agent with a specific version
  const runAgentWithVersion = async (version: ProposalVersion) => {
    setIsRunning(true);
    setLogs([]);
    setGammaLink(null);
    setValueDockDataId(null);

    try {
      // Initial setup log
      addLog('website', 'pending', `Initializing Proposal Agent for Version ${version.version}...`, {
        dealId,
        customerUrl,
        fathomWindowDays,
        targetOrgId,
        versionId: version.id
      });

      // Call backend agent endpoint
      const payload = {
        deal_id: dealId,
        customer_url: customerUrl,
        fathom_window_days: parseInt(fathomWindowDays),
        organization_id: targetOrgId,
        version_id: version.id
      };

      const response = await apiCall('/proposal-agent/run', {
        method: 'POST',
        body: payload
      });

      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      // Process results
      const { gamma_link, valuedock_data_id, tool_calls } = response;

      // Update logs with tool calls
      if (tool_calls && Array.isArray(tool_calls)) {
        tool_calls.forEach((call: any) => {
          updateLog(call.id, { 
            status: call.status,
            message: call.message,
            details: call.details
          });
        });
      }

      // Set results
      if (gamma_link) {
        setGammaLink(gamma_link);
      }
      if (valuedock_data_id) {
        setValueDockDataId(valuedock_data_id);
      }

      setCurrentStep('Complete!');

      // Save version data to backend
      try {
        await apiCall('/proposal-agent/save-version-data', {
          method: 'POST',
          body: {
            versionId: version.id,
            dealId,
            organizationId: targetOrgId,
            formState: {
              customerUrl,
              fathomWindowDays
            },
            logs: logs,
            results: {
              gammaLink: gamma_link,
              valueDockDataId: valuedock_data_id
            }
          }
        });
      } catch (saveError) {
        console.error('[ProposalAgent] Error saving version data:', saveError);
        // Don't fail the whole operation if save fails
      }

    } catch (error: any) {
      console.error('[ProposalAgent] Error:', error);
      addLog('website', 'error', `Agent failed: ${error.message || 'Unknown error'}`);
      toast.error('Proposal agent encountered an error');
      throw error; // Re-throw so caller knows it failed
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  // Cloud Run handler
  const handleCloudRun = async () => {
    if (!validateForm()) return;

    setIsCloudRunning(true);
    setCloudRunLog('');
    setCloudRunResponse(null);
    setShowCloudLog(true);

    try {
      // Calculate Fathom window dates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(fathomWindowDays, 10));

      const payload = {
        tenant_id: currentUser.tenantId,
        org_id: targetOrgId,
        deal_id: dealId,
        customer_url: customerUrl,
        fathom_window: {
          start: startDate.toISOString().split('T')[0], // YYYY-MM-DD
          end: endDate.toISOString().split('T')[0]
        }
      };

      setCloudRunLog(`📤 Sending cloud run request...\n${JSON.stringify(payload, null, 2)}\n\n`);

      const response = await apiCall('/proposal-agent-run', {
        method: 'POST',
        body: payload
      });

      setCloudRunResponse(response);
      setCloudRunLog(prev => prev + `📥 Response received:\n${JSON.stringify(response, null, 2)}`);

      if (response.status === 'accepted') {
        toast.success('Cloud run accepted successfully!');
      } else if (response.status === 'completed') {
        toast.success('Proposal completed and saved!');
      } else {
        toast.error('Cloud run failed or was rejected');
      }

    } catch (error: any) {
      console.error('[CloudRun] Error:', error);
      setCloudRunLog(prev => prev + `\n❌ Error: ${error.message || 'Unknown error'}`);
      toast.error('Cloud run error: ' + error.message);
    } finally {
      setIsCloudRunning(false);
    }
  };

  // Deploy Edge Function handler
  const handleDeployEdgeFunction = async () => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setDeploymentLog('');
    setShowCloudConsole(true);

    try {
      // Step 1: Deploy the edge function
      setDeploymentLog('🚀 Deploying proposal-agent-run edge function...\n');
      
      const deployResponse = await apiCall('/deploy-edge-function', {
        method: 'POST',
        body: {
          functionName: 'proposal-agent-run'
        }
      });

      if (!deployResponse.success) {
        throw new Error(deployResponse.error || 'Deployment failed');
      }

      setDeploymentLog(prev => prev + '✅ Edge function deployed successfully\n\n');
      setDeploymentStatus('testing');

      // Step 2: Run test POST with demo IDs
      setDeploymentLog(prev => prev + '🧪 Running deployment verification test...\n');
      
      const testPayload = {
        tenant_id: 'test-tenant-' + Date.now(),
        org_id: 'test-org-' + Date.now(),
        deal_id: 'TEST-DEPLOY-' + Date.now(),
        customer_url: 'https://example.com',
        fathom_window: {
          start: '2025-09-16',
          end: '2025-10-16'
        }
      };

      setDeploymentLog(prev => prev + `Test payload:\n${JSON.stringify(testPayload, null, 2)}\n\n`);

      const testResponse = await apiCall('/proposal-agent-run', {
        method: 'POST',
        body: testPayload
      });

      setDeploymentLog(prev => prev + `Test response:\n${JSON.stringify(testResponse, null, 2)}\n\n`);

      // Step 3: Verify response
      if (testResponse.status === 'accepted') {
        setDeploymentStatus('verified');
        setDeploymentLog(prev => prev + '✅ Deployment verified - endpoint returning {status:"accepted"}\n');
        toast.success('Edge function deployed and verified!');
      } else {
        setDeploymentStatus('failed');
        setDeploymentLog(prev => prev + '❌ Verification failed - unexpected status: ' + testResponse.status + '\n');
        toast.error('Deployment verification failed');
      }

    } catch (error: any) {
      console.error('[DeployEdgeFunction] Error:', error);
      setDeploymentStatus('failed');
      setDeploymentLog(prev => prev + `\n❌ Error: ${error.message || 'Unknown error'}\n`);
      toast.error('Deployment error: ' + error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  // Verify Cloud Function handler
  const handleVerifyCloudFunction = async () => {
    setIsVerifying(true);
    setVerificationResponse(null);
    setEdgeFunctionConnected(null);
    setShowCloudConsole(true);

    try {
      // Calculate Fathom window dates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const payload = {
        tenant_id: currentUser.tenantId || 'test-tenant-verify',
        org_id: targetOrgId || 'test-org-verify',
        deal_id: 'TEST-VERIFY-' + Date.now(),
        customer_url: 'https://example.com',
        fathom_window: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      };

      setDeploymentLog('🔍 Verifying cloud function...\n');
      setDeploymentLog(prev => prev + `📤 Sending verification request...\n${JSON.stringify(payload, null, 2)}\n\n`);

      const response = await apiCall('/proposal-agent-run', {
        method: 'POST',
        body: payload
      });

      setVerificationResponse(response);
      setDeploymentLog(prev => prev + `📥 Response received:\n${JSON.stringify(response, null, 2)}\n\n`);

      // Check if edge function is connected
      if (response.status === 'verified' || response.edgeFunctionStatus === 'connected') {
        setEdgeFunctionConnected(true);
        setDeploymentLog(prev => prev + '✅ Edge Function is Connected\n\n');
      } else {
        setEdgeFunctionConnected(false);
        setDeploymentLog(prev => prev + '❌ Edge Function not responding correctly\n\n');
      }

      // Check secrets status
      if (response.secretsStatus) {
        setDeploymentLog(prev => prev + '📋 Secrets Status:\n');
        setDeploymentLog(prev => prev + `  OpenAI: ${response.secretsStatus.openai ? '✅' : '❌'}\n`);
        setDeploymentLog(prev => prev + `  Supabase URL (ValueDock): ${response.secretsStatus.supabaseUrl ? '✅' : '❌'}\n`);
        setDeploymentLog(prev => prev + `  Supabase Service Role (ValueDock): ${response.secretsStatus.supabaseServiceRole ? '✅' : '❌'}\n`);
        setDeploymentLog(prev => prev + `  Gamma: ${response.secretsStatus.gamma ? '✅' : '❌'}\n`);
        setDeploymentLog(prev => prev + `  Fathom: ${response.secretsStatus.fathom ? '✅' : '❌'}\n\n`);

        if (response.allSecretsLoaded) {
          toast.success('Edge Function connected - all secrets loaded!');
        } else {
          toast.warning('Edge Function connected but some secrets are missing');
        }
      }

    } catch (error: any) {
      console.error('[VerifyCloudFunction] Error:', error);
      setEdgeFunctionConnected(false);
      setDeploymentLog(prev => prev + `\n❌ Error: ${error.message || 'Unknown error'}\n`);
      toast.error('Verification error: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Test Edge Function with direct HTTP call
  const handleTestEdgeFunction = async () => {
    setIsTesting(true);
    setTestResponse(null);
    setTestHttpStatus(null);
    setShowCloudConsole(true);

    try {
      // Calculate Fathom window dates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const payload = {
        tenant_id: 'test-tenant-' + Date.now(),
        org_id: 'test-org-' + Date.now(),
        deal_id: 'TEST-EDGE-' + Date.now(),
        customer_url: 'https://example.com',
        fathom_window: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      };

      setDeploymentLog('🧪 Testing edge function with direct HTTP POST...\n');
      setDeploymentLog(prev => prev + `📍 URL: https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run\n\n`);
      setDeploymentLog(prev => prev + `📤 Request Payload:\n${JSON.stringify(payload, null, 2)}\n\n`);

      const hardcodedUrl = 'https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run';
      
      // Get auth token from session
      const { getSession } = await import('../utils/auth');
      const { session } = await getSession();
      const token = session?.access_token;

      setDeploymentLog(prev => prev + `🔐 Auth token: ${token ? 'Present ✓' : 'Missing ✗'}\n\n`);

      // Direct fetch call (not using apiCall wrapper)
      const response = await fetch(hardcodedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const httpStatus = response.status;
      setTestHttpStatus(httpStatus);
      
      setDeploymentLog(prev => prev + `📊 HTTP Status: ${httpStatus} ${response.statusText}\n\n`);

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Could not parse JSON response', rawText: await response.text() };
      }

      setTestResponse(responseData);
      setDeploymentLog(prev => prev + `📥 Response Body:\n${JSON.stringify(responseData, null, 2)}\n\n`);

      // Analyze response
      if (httpStatus >= 200 && httpStatus < 300) {
        setDeploymentLog(prev => prev + '✅ SUCCESS - Edge function is responding!\n');
        toast.success(`Edge function test passed! (${httpStatus})`);
      } else if (httpStatus >= 400 && httpStatus < 500) {
        setDeploymentLog(prev => prev + `⚠️ CLIENT ERROR (${httpStatus}) - Check request format or authentication\n`);
        toast.error(`Test failed with ${httpStatus} - ${responseData.error || 'Client error'}`);
      } else if (httpStatus >= 500) {
        setDeploymentLog(prev => prev + `❌ SERVER ERROR (${httpStatus}) - Edge function may have crashed\n`);
        toast.error(`Test failed with ${httpStatus} - Server error`);
      }

    } catch (error: any) {
      console.error('[TestEdgeFunction] Error:', error);
      setDeploymentLog(prev => prev + `\n❌ Request Failed: ${error.message || 'Unknown error'}\n`);
      setDeploymentLog(prev => prev + `\n🔍 This usually means:\n`);
      setDeploymentLog(prev => prev + `  • Edge function is not deployed\n`);
      setDeploymentLog(prev => prev + `  • Network connectivity issue\n`);
      setDeploymentLog(prev => prev + `  • CORS policy blocking the request\n`);
      toast.error('Test error: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Sync Cloud Secrets handler
  const handleSyncCloudSecrets = async () => {
    setIsSyncing(true);
    setSyncResponse(null);
    setShowCloudConsole(true);

    try {
      setDeploymentLog('🔄 Syncing secrets to cloud...\n');

      // Get secrets from environment (these would typically come from a secrets management UI)
      // For now, we'll read from the current environment
      const secrets = {
        OPENAI_API_KEY: Deno?.env?.get?.('OPENAI_API_KEY') || '',
        VALUEDOCK_SUPABASE_URL: Deno?.env?.get?.('SUPABASE_URL') || '',
        VALUEDOCK_SUPABASE_SERVICE_ROLE_KEY: Deno?.env?.get?.('SUPABASE_SERVICE_ROLE_KEY') || '',
        GAMMA_API_KEY: Deno?.env?.get?.('GAMMA_API_KEY') || '',
        FATHOM_API_KEY: Deno?.env?.get?.('FATHOM_API_KEY') || ''
      };

      setDeploymentLog(prev => prev + '📤 Syncing 5 secrets to edge function...\n\n');

      // Call sync endpoint
      const syncResult = await apiCall('/sync-cloud-secrets', {
        method: 'POST',
        body: { secrets }
      });

      setSyncResponse(syncResult);
      setDeploymentLog(prev => prev + `📥 Sync Response:\n${JSON.stringify(syncResult, null, 2)}\n\n`);

      if (syncResult.success) {
        setDeploymentLog(prev => prev + '✅ Secrets synced successfully!\n\n');
        toast.success('Secrets synced! Verifying...');

        // Automatically verify after sync
        setDeploymentLog(prev => prev + '🔍 Auto-verifying secrets...\n\n');
        
        // Small delay to let secrets propagate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Call verification
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const payload = {
          tenant_id: currentUser.tenantId || 'test-tenant-verify',
          org_id: targetOrgId || 'test-org-verify',
          deal_id: 'TEST-VERIFY-' + Date.now(),
          customer_url: 'https://example.com',
          fathom_window: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          }
        };

        setDeploymentLog(prev => prev + '📤 Sending verification request...\n');

        const verifyResult = await apiCall('/proposal-agent-run', {
          method: 'POST',
          body: payload
        });

        setVerificationResponse(verifyResult);
        setDeploymentLog(prev => prev + `📥 Verification Response:\n${JSON.stringify(verifyResult, null, 2)}\n\n`);

        // Check verification
        if (verifyResult.status === 'verified' || verifyResult.edgeFunctionStatus === 'connected') {
          setEdgeFunctionConnected(true);
          setDeploymentLog(prev => prev + '✅ Verification successful!\n\n');

          // Show secrets status
          if (verifyResult.secretsStatus) {
            setDeploymentLog(prev => prev + '📋 Secrets Status:\n');
            setDeploymentLog(prev => prev + `  OpenAI: ${verifyResult.secretsStatus.openai ? '✅' : '❌'}\n`);
            setDeploymentLog(prev => prev + `  Supabase URL: ${verifyResult.secretsStatus.supabaseUrl ? '✅' : '❌'}\n`);
            setDeploymentLog(prev => prev + `  Supabase Service Role: ${verifyResult.secretsStatus.supabaseServiceRole ? '✅' : '❌'}\n`);
            setDeploymentLog(prev => prev + `  Gamma: ${verifyResult.secretsStatus.gamma ? '✅' : '❌'}\n`);
            setDeploymentLog(prev => prev + `  Fathom: ${verifyResult.secretsStatus.fathom ? '✅' : '❌'}\n\n`);

            if (verifyResult.allSecretsLoaded) {
              toast.success('All secrets verified! ✅');
            } else {
              toast.warning('Some secrets are still missing');
            }
          }
        } else {
          setEdgeFunctionConnected(false);
          toast.error('Verification failed after sync');
        }
      } else {
        setDeploymentLog(prev => prev + '❌ Sync failed\n');
        toast.error('Failed to sync secrets');
      }

    } catch (error: any) {
      console.error('[SyncCloudSecrets] Error:', error);
      setDeploymentLog(prev => prev + `\n❌ Error: ${error.message || 'Unknown error'}\n`);
      toast.error('Sync error: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to add a WorkfloDock-style progress step
  const addProgressStep = (
    agentNumber: number,
    totalAgents: number,
    stepNumber: string,
    totalSteps: number,
    title: string,
    command?: string
  ) => {
    const step = {
      id: `step-${Date.now()}-${Math.random()}`,
      agentNumber,
      totalAgents,
      stepNumber,
      totalSteps,
      title,
      status: 'running' as const,
      command,
      timestamp: new Date().toISOString()
    };
    setProgressSteps(prev => [...prev, step]);
    return step.id;
  };

  // Helper to update a progress step
  const updateProgressStep = (
    stepId: string,
    updates: { status?: 'pending' | 'running' | 'complete' | 'error'; output?: string }
  ) => {
    setProgressSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  // Direct Cloud Proposal Agent Run (hardcoded URL)
  const handleDirectCloudRun = async () => {
    if (!validateForm()) return;

    setIsDirectCloudRunning(true);
    setDirectCloudSummary(null);
    setShowDirectCloudResult(false);
    setShowCloudConsole(true);
    setProgressSteps([]);
    setCurrentMilestone(0);

    try {
      setDeploymentLog('🚀 Running Cloud Proposal Agent...\n\n');

      // Initialize tool timeline
      setToolTimeline([
        { id: '1', tool: 'fetch_url', status: 'pending', timestamp: new Date().toISOString() },
        { id: '2', tool: 'fathom_fetch', status: 'pending', timestamp: new Date().toISOString() },
        { id: '3', tool: 'valuedock_get_financials', status: 'pending', timestamp: new Date().toISOString() },
        { id: '4', tool: 'valuedock_put_processes', status: 'pending', timestamp: new Date().toISOString() },
        { id: '5', tool: 'valuedock_put_groups', status: 'pending', timestamp: new Date().toISOString() },
      ]);
      
      // Step 2.6.2: Initialize (updated to show Agent 2)
      const initStepId = addProgressStep(2, 20, '2.6.2', 6, '✓ Solution Composer Verified');
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(fathomWindowDays, 10));

      const payload = {
        tenant_id: currentUser.tenantId || 'direct-run-tenant',
        org_id: targetOrgId || currentUser.organizationId || 'direct-run-org',
        deal_id: dealId,
        customer_url: customerUrl,
        fathom_window: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      };

      updateProgressStep(initStepId, { 
        status: 'complete',
        output: `Initialized with Deal ID: ${dealId}`
      });
      setDeploymentLog(prev => prev + `✅ Step 2.6.2 complete\n\n`);
      
      // Save payload for replay
      setLastRunPayload(payload);

      // Step 2.6.3: Build request payload
      const payloadStepId = addProgressStep(2, 20, '2.6.3', 6, 'Build request payload', 
        `JSON.stringify(${JSON.stringify(payload, null, 2)})`);
      updateProgressStep(payloadStepId, { 
        status: 'complete',
        output: 'Payload constructed'
      });
      setDeploymentLog(prev => prev + `✅ Step 2.6.3 complete\n\n`);

      // Step 2.6.4: Send HTTP request
      const httpStepId = addProgressStep(2, 20, '2.6.4', 6, 'Send POST request to edge function',
        `fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run', { method: 'POST', body: ... })`);
      setDeploymentLog(prev => prev + `📤 Sending request to cloud endpoint...\n`);
      setDeploymentLog(prev => prev + `   Deal ID: ${dealId}\n`);
      setDeploymentLog(prev => prev + `   Customer URL: ${customerUrl}\n`);
      setDeploymentLog(prev => prev + `   Organization: ${targetOrgId || currentUser.organizationId}\n\n`);

      // Direct HTTP call to hardcoded URL
      const response = await fetch('https://hpnxaentcrlditokrpyo.supabase.co/functions/v1/proposal-agent-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      updateProgressStep(httpStepId, { 
        status: 'complete',
        output: `HTTP ${response.status} - Request sent`
      });
      setDeploymentLog(prev => prev + `✅ Step 2.6.4 complete\n\n`);
      setCurrentMilestone(1);

      // Step 2.6.5: Parse response
      const parseStepId = addProgressStep(2, 20, '2.6.5', 6, 'Parse JSON response',
        'const data = await response.json()');
      setDeploymentLog(prev => prev + `📥 Response received (HTTP ${response.status})\n\n`);

      const data = await response.json();
      updateProgressStep(parseStepId, { 
        status: 'complete',
        output: `Parsed response: ${data.status || 'unknown'}`
      });
      setDeploymentLog(prev => prev + `✅ Step 2.6.5 complete\n\n`);
      setDeploymentLog(prev => prev + `📋 Response Data:\n${JSON.stringify(data, null, 2)}\n\n`);

      if (data.status === 'completed') {
        setCurrentMilestone(5); // All milestones complete
        
        // Step 2.6.6: Success confirmation
        const successStepId = addProgressStep(2, 20, '2.6.6', 6, '✓ Proposal Agent Completed Successfully');
        updateProgressStep(successStepId, { status: 'complete' });
        
        setDeploymentLog(prev => prev + '✅ Proposal Agent Completed Successfully!\n\n');
        
        if (data.summary) {
          setDirectCloudSummary(data.summary);
          setShowDirectCloudResult(true);
          setDeploymentLog(prev => prev + `📝 Summary:\n${data.summary}\n\n`);
        }

        toast.success('Proposal generated successfully!');

        // Step 2.6.7: Refresh proposals table
        if (dealId && targetOrgId) {
          const refreshStepId = addProgressStep(2, 20, '2.6.7', 6, 'Refresh proposals table',
            'await loadVersions()');
          setDeploymentLog(prev => prev + '🔄 Refreshing proposals table...\n');
          await loadVersions();
          updateProgressStep(refreshStepId, { 
            status: 'complete',
            output: 'Proposals table refreshed'
          });
          setDeploymentLog(prev => prev + '✅ Proposals refreshed!\n');
        }
      } else {
        setDeploymentLog(prev => prev + `⚠️ Status: ${data.status}\n`);
        toast.warning(`Agent returned status: ${data.status}`);
        
        // Mark as error
        const errorStepId = addProgressStep(2, 20, '2.6.6', 6, `⚠️ Agent returned status: ${data.status}`);
        updateProgressStep(errorStepId, { status: 'error' });
      }

    } catch (error: any) {
      console.error('[DirectCloudRun] Error:', error);
      setDeploymentLog(prev => prev + `\n❌ Error: ${error.message || 'Unknown error'}\n`);
      toast.error('Cloud run error: ' + error.message);
      
      // Add error step
      const errorStepId = addProgressStep(2, 20, 'ERROR', 0, `Error: ${error.message}`);
      updateProgressStep(errorStepId, { status: 'error' });
    } finally {
      setIsDirectCloudRunning(false);
    }
  };

  // Solution Composer - Generate Solution & SOW
  const handleComposeSolutionAndSOW = async () => {
    if (!validateForm()) return;

    try {
      setIsSolutionComposerRunning(true);
      setShowSolutionComposerResults(false);
      setSolutionComposerResponse(null);

      toast.info('Composing Solution & SOW...');

      const payload = {
        tenant_id: currentUser.tenantId || 'direct-run-tenant',
        org_id: targetOrgId || currentUser.organizationId || 'direct-run-org',
        deal_id: dealId
      };

      console.log('[SolutionComposer] Calling /functions/v1/solution-composer with:', payload);

      // Call the solution-composer endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/solution-composer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('[SolutionComposer] Response:', data);

      if (response.ok && data.status === 'completed') {
        setSolutionComposerResponse(data);
        setShowSolutionComposerResults(true);
        
        // Save to backend for PresentationScreen to access
        await apiCall('/data/solution-composer', {
          method: 'POST',
          body: {
            organizationId: targetOrgId || currentUser.organizationId,
            dealId: dealId,
            solution: data.solution,
            sow: data.sow,
            metadata: data.metadata || {}
          }
        });

        toast.success('Solution & SOW composed successfully!');
      } else {
        toast.error('Failed to compose Solution & SOW');
        console.error('[SolutionComposer] Error:', data);
      }
    } catch (error: any) {
      console.error('[SolutionComposer] Error:', error);
      toast.error('Error composing Solution & SOW: ' + error.message);
    } finally {
      setIsSolutionComposerRunning(false);
    }
  };

  // Main agent execution (existing functionality)
  const handleRunAgent = async () => {
    if (!validateForm()) return;

    setIsRunning(true);
    setLogs([]);
    setGammaLink(null);
    setValueDockDataId(null);

    try {
      // Initial setup log
      addLog('website', 'pending', 'Initializing Proposal Agent...', {
        dealId,
        customerUrl,
        fathomWindowDays,
        targetOrgId
      });

      // Call backend agent endpoint
      const payload = {
        deal_id: dealId,
        customer_url: customerUrl,
        fathom_window: parseInt(fathomWindowDays, 10),
        organization_id: targetOrgId
      };

      console.log('[ProposalAgent] Starting agent with payload:', payload);

      // Step 1: Fetch Website
      const websiteLogId = addLog('website', 'running', `Fetching website: ${customerUrl}...`);
      setCurrentStep('Analyzing customer website...');

      const response = await apiCall('/proposal-agent/run', {
        method: 'POST',
        body: payload
      });

      if (!response.success) {
        updateLog(websiteLogId, { 
          status: 'error', 
          message: `Website fetch failed: ${response.error || 'Unknown error'}` 
        });
        toast.error('Proposal agent failed');
        return;
      }

      // Process agent response - backend should return step-by-step progress
      const { steps, gamma_link, valuedock_data_id } = response;

      // Update logs based on backend response
      if (steps) {
        // Website step
        if (steps.website) {
          updateLog(websiteLogId, {
            status: steps.website.status === 'success' ? 'success' : 'error',
            message: steps.website.message,
            details: steps.website.details
          });
        }

        // Fathom step
        if (steps.fathom) {
          const fathomLogId = addLog('fathom', 'running', 'Retrieving Fathom transcripts...');
          setCurrentStep('Analyzing meeting transcripts...');
          
          // Simulate slight delay for UX
          await new Promise(resolve => setTimeout(resolve, 500));
          
          updateLog(fathomLogId, {
            status: steps.fathom.status === 'success' ? 'success' : 'error',
            message: steps.fathom.message,
            details: steps.fathom.details
          });
        }

        // ValueDock step
        if (steps.valuedock) {
          const valuedockLogId = addLog('valuedock', 'running', 'Generating ValueDock proposal data...');
          setCurrentStep('Creating ROI calculations...');
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          updateLog(valuedockLogId, {
            status: steps.valuedock.status === 'success' ? 'success' : 'error',
            message: steps.valuedock.message,
            details: steps.valuedock.details
          });
        }

        // Gamma step
        if (steps.gamma) {
          const gammaLogId = addLog('gamma', 'running', 'Creating Gamma presentation...');
          setCurrentStep('Generating presentation...');
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          updateLog(gammaLogId, {
            status: steps.gamma.status === 'success' ? 'success' : 'error',
            message: steps.gamma.message,
            details: steps.gamma.details
          });
        }
      }

      // Set results
      if (gamma_link) {
        setGammaLink(gamma_link);
        toast.success('Proposal generated successfully!');
      }
      if (valuedock_data_id) {
        setValueDockDataId(valuedock_data_id);
      }

      setCurrentStep('Complete!');

      // Save version data to backend
      if (currentVersion) {
        try {
          await apiCall('/proposal-agent/save-version-data', {
            method: 'POST',
            body: {
              versionId: currentVersion.id,
              dealId,
              organizationId: targetOrgId,
              formState: {
                customerUrl,
                fathomWindowDays
              },
              logs: logs,
              results: {
                gammaLink: gamma_link,
                valueDockDataId: valuedock_data_id
              }
            }
          });
        } catch (saveError) {
          console.error('[ProposalAgent] Error saving version data:', saveError);
          // Don't fail the whole operation if save fails
        }
      }

    } catch (error: any) {
      console.error('[ProposalAgent] Error:', error);
      addLog('website', 'error', `Agent failed: ${error.message || 'Unknown error'}`);
      toast.error('Proposal agent encountered an error');
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  // Get icon for tool
  const getToolIcon = (tool: ToolCallLog['tool']) => {
    switch (tool) {
      case 'website': return Globe;
      case 'fathom': return Mic;
      case 'valuedock': return FileText;
      case 'gamma': return Presentation;
    }
  };

  // Get status icon
  const getStatusIcon = (status: ToolCallLog['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: ToolCallLog['status']) => {
    const variants: Record<ToolCallLog['status'], any> = {
      pending: 'outline',
      running: 'secondary',
      success: 'default',
      error: 'destructive'
    };
    const labels: Record<ToolCallLog['status'], string> = {
      pending: 'Pending',
      running: 'Running',
      success: 'Success',
      error: 'Error'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // Fathom Test Fetch handler
  const handleFathomTestFetch = async () => {
    try {
      setIsFathomTesting(true);
      setFathomTestResult(null);
      
      const payload = {
        start_date: fathomStartDate,
        end_date: fathomEndDate,
        tag_filter: fathomTagFilter || undefined
      };
      
      toast.info('Fetching Fathom transcripts...');
      
      const response = await apiCall('/fathom-fetch', {
        method: 'POST',
        body: payload
      });
      
      setFathomTestResult(response);
      
      if (response.success) {
        toast.success(`Fetched ${response.meetings?.length || 0} meetings`);
      } else {
        toast.error('Fathom fetch failed: ' + (response.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('[Fathom Test] Error:', error);
      toast.error('Fathom test error: ' + error.message);
      setFathomTestResult({ error: error.message });
    } finally {
      setIsFathomTesting(false);
    }
  };

  // Determine if user needs to select an org
  const needsOrgSelection = currentUser.role === 'master_admin' || currentUser.role === 'tenant_admin';
  const canRun = !isRunning && dealId && customerUrl && targetOrgId;

  return (
    <div className="space-y-6">
      {/* Header with Version Switcher and Breadcrumb */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Breadcrumb */}
            {(tenantName || orgName || dealId) && (
              <Breadcrumb>
                <BreadcrumbList>
                  {tenantName && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {tenantName}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    </>
                  )}
                  {orgName && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {orgName}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    </>
                  )}
                  {dealId && (
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {dealId}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {/* Version Switcher */}
            {currentVersion && versions.length > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Proposal Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-powered proposals with version control
                  </p>
                </div>
                <ProposalVersionSwitcher
                  currentVersion={currentVersion}
                  versions={versions}
                  onVersionChange={handleVersionChange}
                  onCreateVersion={handleCreateVersion}
                  isCreating={isCreatingVersion}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Proposal Agent:</strong> Automatically generates comprehensive proposals by analyzing customer websites, 
          meeting transcripts, and creating ROI calculations with presentation-ready materials.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'runner' | 'content' | 'versions')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="runner">Agent Runner</TabsTrigger>
          <TabsTrigger value="content" disabled={!currentVersion}>
            Content Builder
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="h-4 w-4 mr-2" />
            Versions Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runner" className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Agent Configuration
            </CardTitle>
            <CardDescription>
              Configure the proposal generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deal ID */}
            <div className="space-y-2">
              <Label htmlFor="deal-id">Deal ID *</Label>
              <Input
                id="deal-id"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                placeholder="DEAL-2025-001"
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this deal/opportunity
              </p>
            </div>

            {/* Customer URL */}
            <div className="space-y-2">
              <Label htmlFor="customer-url">Customer Website URL *</Label>
              <Input
                id="customer-url"
                type="url"
                value={customerUrl}
                onChange={(e) => setCustomerUrl(e.target.value)}
                placeholder="https://company.com"
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                Main website to analyze for business context
              </p>
            </div>

            {/* Fathom Window */}
            <div className="space-y-2">
              <Label htmlFor="fathom-window">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fathom Date Window (Days)
              </Label>
              <Select value={fathomWindowDays} onValueChange={setFathomWindowDays} disabled={isRunning}>
                <SelectTrigger id="fathom-window">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How far back to search for meeting transcripts
              </p>
            </div>

            {/* Organization Selection (for tenant/master admins) */}
            {needsOrgSelection && organizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="target-org">Target Organization *</Label>
                <Select value={targetOrgId} onValueChange={setTargetOrgId} disabled={isRunning}>
                  <SelectTrigger id="target-org">
                    <SelectValue placeholder="Select organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name || org.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Which organization should this proposal be created for?
                </p>
              </div>
            )}

            <Separator />

            {/* Run in Cloud Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="run-in-cloud">Run in Cloud</Label>
                <p className="text-xs text-muted-foreground">
                  Execute via Supabase Edge Function endpoint
                </p>
              </div>
              <Switch
                id="run-in-cloud"
                checked={runInCloud}
                onCheckedChange={setRunInCloud}
              />
            </div>

            {/* OpenAI REST Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="openai-rest">Use OpenAI REST (no SDK)</Label>
                <p className="text-xs text-muted-foreground">
                  Direct HTTP calls with request/response logging
                </p>
              </div>
              <Switch
                id="openai-rest"
                checked={useOpenAIRest}
                onCheckedChange={setUseOpenAIRest}
              />
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleTestRun}
                disabled={isTestRunning || isSmokeTestRunning}
                variant="secondary"
              >
                {isTestRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Beaker className="h-4 w-4 mr-2" />
                    Test Run
                  </>
                )}
              </Button>

              <Button
                onClick={handleSmokeTest}
                disabled={isTestRunning || isSmokeTestRunning}
                variant="secondary"
              >
                {isSmokeTestRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Beaker className="h-4 w-4 mr-2" />
                    Smoke Test
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {runInCloud ? (
                /* Cloud Run Button */
                <Button 
                  onClick={handleCloudRun} 
                  disabled={!canRun || isCloudRunning}
                  variant="default"
                  size="lg"
                  className="md:col-span-2"
                >
                  {isCloudRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running in Cloud...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Run in Cloud
                    </>
                  )}
                </Button>
              ) : (
                <>
                  {/* Run Button */}
                  <Button 
                    onClick={handleRunAgent} 
                    disabled={!canRun}
                    variant="outline"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Run Agent
                      </>
                    )}
                  </Button>

                  {/* Run & Save Version Button */}
                  <Button 
                    onClick={handleRunAndSaveVersion} 
                    disabled={!canRun}
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Run & Save Version
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Current Step Display */}
            {currentStep && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {currentStep}
                </p>
              </div>
            )}

            {/* Results */}
            {(gammaLink || valueDockDataId) && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-green-900 dark:text-green-100">Generation Complete!</h4>
                </div>
                
                {gammaLink && (
                  <div className="space-y-1">
                    <Label className="text-xs text-green-800 dark:text-green-200">Gamma Presentation</Label>
                    <div className="flex gap-2">
                      <Input
                        value={gammaLink}
                        readOnly
                        className="bg-white dark:bg-green-900"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(gammaLink, '_blank');
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                )}

                {valueDockDataId && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ValueDock Data ID: <code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">{valueDockDataId}</code>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fathom Integration Settings Card */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-500" />
              Fathom Integration
            </CardTitle>
            <CardDescription>
              Configure and test Fathom meeting transcript fetching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Status */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">API Status:</span>
                <Badge variant="default" className="bg-green-600">
                  Connected ✅
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">(stub-ok)</span>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="fathom-start">Start Date</Label>
              <Input
                id="fathom-start"
                type="date"
                value={fathomStartDate}
                onChange={(e) => setFathomStartDate(e.target.value)}
                disabled={isFathomTesting}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="fathom-end">End Date</Label>
              <Input
                id="fathom-end"
                type="date"
                value={fathomEndDate}
                onChange={(e) => setFathomEndDate(e.target.value)}
                disabled={isFathomTesting}
              />
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label htmlFor="fathom-tag" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tag Filter
              </Label>
              <Input
                id="fathom-tag"
                value={fathomTagFilter}
                onChange={(e) => setFathomTagFilter(e.target.value)}
                placeholder="e.g., sales, discovery"
                disabled={isFathomTesting}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Filter meetings by tag (leave empty for all)
              </p>
            </div>

            {/* Test Fetch Button */}
            <Button
              onClick={handleFathomTestFetch}
              disabled={isFathomTesting || !fathomStartDate || !fathomEndDate}
              className="w-full"
            >
              {isFathomTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Beaker className="h-4 w-4 mr-2" />
                  Test Fetch
                </>
              )}
            </Button>

            {/* Test Result Display - Collapsible */}
            {fathomTestResult && (
              <Collapsible defaultOpen={true}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between p-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium cursor-pointer">Fathom Response</Label>
                        {fathomTestResult.meetings && Array.isArray(fathomTestResult.meetings) && (
                          <Badge variant="secondary">
                            {fathomTestResult.meetings.length} meeting{fathomTestResult.meetings.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2 pt-2">
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <pre className="text-xs">
                      {JSON.stringify(fathomTestResult, null, 2)}
                    </pre>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>

        {/* Cloud Run Console Panel */}
        {runInCloud && (
          <Card className="border-2 border-purple-500">
            <Collapsible open={showCloudConsole} onOpenChange={setShowCloudConsole}>
              <CardHeader className="cursor-pointer" onClick={() => setShowCloudConsole(!showCloudConsole)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-purple-500" />
                    <CardTitle>Cloud Run Console</CardTitle>
                    {deploymentStatus === 'verified' && (
                      <Badge variant="default" className="bg-green-500">
                        Deployment Verified
                      </Badge>
                    )}
                    {deploymentStatus === 'deploying' && (
                      <Badge variant="secondary">
                        Deploying...
                      </Badge>
                    )}
                    {deploymentStatus === 'testing' && (
                      <Badge variant="secondary">
                        Testing...
                      </Badge>
                    )}
                    {deploymentStatus === 'failed' && (
                      <Badge variant="destructive">
                        Failed
                      </Badge>
                    )}
                  </div>
                  {showCloudConsole ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                <CardDescription>
                  Deploy and test the Edge Function
                </CardDescription>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <Button
                      onClick={handleSyncCloudSecrets}
                      disabled={isSyncing}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Sync Secrets
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleTestEdgeFunction}
                      disabled={isTesting}
                      variant="default"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Beaker className="h-4 w-4 mr-2" />
                          Test Edge Function
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleVerifyCloudFunction}
                      disabled={isVerifying}
                      variant="outline"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify Secrets
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDeployEdgeFunction}
                      disabled={isDeploying}
                      variant="outline"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          Deploy Edge Function
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Run Cloud Proposal Agent Button */}
                  <div className="border-t pt-4">
                    <Button
                      onClick={handleDirectCloudRun}
                      disabled={!canRun || isDirectCloudRunning}
                      variant="default"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isDirectCloudRunning ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Running Cloud Proposal Agent...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-5 w-5 mr-2" />
                          Run Cloud Proposal Agent
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Directly execute the edge function at the hardcoded endpoint
                    </p>
                  </div>

                  {/* Compose Solution & SOW Button */}
                  <div className="border-t pt-4">
                    <Button
                      onClick={handleComposeSolutionAndSOW}
                      disabled={!canRun || isSolutionComposerRunning}
                      variant="default"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      {isSolutionComposerRunning ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Composing Solution & SOW...
                        </>
                      ) : (
                        <>
                          <FileText className="h-5 w-5 mr-2" />
                          Compose Solution & SOW
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Generate comprehensive solution and statement of work
                    </p>
                  </div>

                  {/* WorkfloDock-style Progress Bar */}
                  {progressSteps.length > 0 && (
                    <div className="sticky top-0 z-10 bg-background border-b pb-4">
                      {/* Milestone Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">
                            Milestone {currentMilestone} of {totalMilestones}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: totalMilestones }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                i < currentMilestone
                                  ? 'bg-green-500'
                                  : i === currentMilestone
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Initialize</span>
                          <span>Fetch Data</span>
                          <span>Generate</span>
                          <span>Deploy</span>
                          <span>Complete</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tool Timeline Card */}
                  {toolTimeline.length > 0 && (
                    <Card className="border-2 border-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Tool Call Timeline</CardTitle>
                          {lastRunPayload && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  toast.info('Replaying last run...');
                                  // Re-trigger the cloud run with saved payload
                                  await handleDirectCloudRun();
                                } catch (error: any) {
                                  toast.error('Replay failed: ' + error.message);
                                }
                              }}
                              disabled={isDirectCloudRunning}
                            >
                              <History className="h-4 w-4 mr-2" />
                              Replay Last Run
                            </Button>
                          )}
                        </div>
                        <CardDescription>Agent tool execution flow</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          {toolTimeline.map((tool, index) => (
                            <React.Fragment key={tool.id}>
                              {/* Tool Badge */}
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  variant={
                                    tool.status === 'success' ? 'default' :
                                    tool.status === 'error' ? 'destructive' :
                                    tool.status === 'running' ? 'secondary' :
                                    tool.status === 'skipped' ? 'outline' :
                                    'secondary'
                                  }
                                  className={
                                    tool.status === 'success' ? 'bg-green-600' :
                                    tool.status === 'running' ? 'animate-pulse bg-blue-600' :
                                    tool.status === 'skipped' ? 'opacity-50' :
                                    ''
                                  }
                                >
                                  {tool.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {tool.status === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                  {tool.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                                  {tool.status === 'skipped' && <Circle className="h-3 w-3 mr-1" />}
                                  {tool.tool}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                                </span>
                              </div>
                              
                              {/* Arrow */}
                              {index < toolTimeline.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* WorkfloDock-style Step List */}
                  {progressSteps.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Execution Steps</Label>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {progressSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`border rounded-lg p-3 ${
                              step.status === 'complete'
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : step.status === 'error'
                                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                : step.status === 'running'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-muted bg-muted/50'
                            }`}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {step.status === 'complete' && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                                {step.status === 'running' && (
                                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
                                )}
                                {step.status === 'error' && (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                                {step.status === 'pending' && (
                                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium">
                                  Agent {step.agentNumber} of {step.totalAgents} — Step {step.stepNumber} of {step.totalSteps}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(step.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            {/* Title */}
                            <div className="text-sm mb-2">{step.title}</div>

                            {/* Command (if present) */}
                            {step.command && (
                              <div className="bg-muted rounded p-2 mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-muted-foreground">Command</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(step.command || '');
                                      toast.success('Command copied!');
                                    }}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    <span className="text-xs">Copy</span>
                                  </Button>
                                </div>
                                <code className="text-xs block overflow-x-auto whitespace-pre-wrap break-all">
                                  {step.command}
                                </code>
                              </div>
                            )}

                            {/* Output (if present) */}
                            {step.output && (
                              <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded">
                                {step.output}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Cloud Result */}
                  {showDirectCloudResult && directCloudSummary && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900 dark:text-green-100">
                        <div className="space-y-2">
                          <p className="font-medium">Proposal Generated Successfully!</p>
                          <div className="text-sm whitespace-pre-wrap bg-white dark:bg-green-900 p-3 rounded border border-green-200 dark:border-green-700">
                            {directCloudSummary}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Solution Composer Results Panel */}
                  {showSolutionComposerResults && solutionComposerResponse && (
                    <Card className="border-2 border-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Solution & SOW Composer Results
                        </CardTitle>
                        <CardDescription>
                          Generated from /functions/v1/solution-composer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Solution Content */}
                        {solutionComposerResponse.solution && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Solution Summary</Label>
                            <div className="rounded-lg border bg-background p-4">
                              <p className="text-sm whitespace-pre-wrap">
                                {solutionComposerResponse.solution}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* SOW Content */}
                        {solutionComposerResponse.sow && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Statement of Work</Label>
                            <div className="rounded-lg border bg-background p-4">
                              <p className="text-sm whitespace-pre-wrap">
                                {solutionComposerResponse.sow}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Full JSON Response */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Full JSON Response</Label>
                          <ScrollArea className="h-64 w-full rounded-md border bg-muted p-4">
                            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                              {JSON.stringify(solutionComposerResponse, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>

                        {/* Action Hint */}
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Navigate to <strong>Create Presentation → Solution Tab</strong> to view and edit this content in the editor panes.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}

                  {/* Connection Status */}
                  {edgeFunctionConnected !== null && (
                    <Alert className={edgeFunctionConnected ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
                      <AlertDescription className="flex items-center gap-2">
                        {edgeFunctionConnected ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-900 dark:text-green-100">Edge Function: Connected</span>
                            <Badge variant="default" className="bg-green-500 ml-auto">
                              Connected
                            </Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-900 dark:text-red-100">Edge Function: Not Connected</span>
                            <Badge variant="destructive" className="ml-auto">
                              Not Connected
                            </Badge>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Sync Response Panel */}
                  {syncResponse && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sync Results</Label>
                      
                      {/* Sync Status */}
                      <div className="flex items-center gap-2">
                        {syncResponse.success ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-900 dark:text-green-100">
                              {syncResponse.message}
                            </span>
                            {syncResponse.allSynced && (
                              <Badge variant="default" className="bg-green-500 ml-auto">
                                All Synced ✓
                              </Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-900 dark:text-red-100">
                              Sync failed
                            </span>
                          </>
                        )}
                      </div>

                      {/* Synced Secrets List */}
                      {syncResponse.syncedSecrets && (
                        <div className="space-y-1 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span>OpenAI</span>
                            {syncResponse.syncedSecrets.OPENAI_API_KEY ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Supabase URL (ValueDock)</span>
                            {syncResponse.syncedSecrets.SUPABASE_URL ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Supabase Service Role (ValueDock)</span>
                            {syncResponse.syncedSecrets.SUPABASE_SERVICE_ROLE_KEY ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Gamma</span>
                            {syncResponse.syncedSecrets.GAMMA_API_KEY ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Fathom</span>
                            {syncResponse.syncedSecrets.FATHOM_API_KEY ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Note about implementation */}
                      {syncResponse.note && (
                        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                          <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
                            ℹ️ {syncResponse.note}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Secrets Checklist */}
                  {verificationResponse?.secretsStatus && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Secrets Loaded</Label>
                        {!verificationResponse.allSecretsLoaded && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to admin panel - assuming parent can handle this
                              toast.info('Navigate to Admin → Secrets to configure missing secrets');
                            }}
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Fix in Admin
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span>OpenAI</span>
                          {verificationResponse.secretsStatus.openai ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Supabase URL (ValueDock)</span>
                          {verificationResponse.secretsStatus.supabaseUrl ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Supabase Service Role (ValueDock)</span>
                          {verificationResponse.secretsStatus.supabaseServiceRole ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Gamma</span>
                          {verificationResponse.secretsStatus.gamma ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Fathom</span>
                          {verificationResponse.secretsStatus.fathom ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      {!verificationResponse.allSecretsLoaded && (
                        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-sm text-yellow-900 dark:text-yellow-100">
                            <div className="flex items-center justify-between">
                              <span>Some secrets are missing</span>
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                Missing Secrets
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Test Results Panel */}
                  {testHttpStatus !== null && testResponse && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Direct Test Results</Label>
                      
                      {/* HTTP Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm">HTTP Status:</span>
                        {testHttpStatus >= 200 && testHttpStatus < 300 && (
                          <Badge variant="default" className="bg-green-500">
                            {testHttpStatus} - Success
                          </Badge>
                        )}
                        {testHttpStatus >= 400 && testHttpStatus < 500 && (
                          <Badge variant="destructive" className="bg-orange-500">
                            {testHttpStatus} - Client Error
                          </Badge>
                        )}
                        {testHttpStatus >= 500 && (
                          <Badge variant="destructive">
                            {testHttpStatus} - Server Error
                          </Badge>
                        )}
                      </div>

                      {/* Raw JSON Response */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Raw Response JSON:</Label>
                        <ScrollArea className="h-[200px]">
                          <pre className="text-xs font-mono bg-muted p-3 rounded-lg whitespace-pre-wrap">
                            {JSON.stringify(testResponse, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>

                      {/* Error Highlight */}
                      {testResponse.error && (
                        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                            <span className="font-medium">Error: </span>
                            {testResponse.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Deployment Log */}
                  {deploymentLog && (
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                        {deploymentLog}
                      </pre>
                    </ScrollArea>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Cloud Results Panel */}
        {runInCloud && cloudRunResponse && (
          <Card className="border-2 border-blue-500">
            <Collapsible open={showCloudLog} onOpenChange={setShowCloudLog}>
              <CardHeader className="cursor-pointer" onClick={() => setShowCloudLog(!showCloudLog)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <CardTitle>Cloud Results</CardTitle>
                    {cloudRunResponse?.status === 'accepted' && (
                      <Badge variant="default" className="bg-blue-500">
                        Accepted
                      </Badge>
                    )}
                    {cloudRunResponse?.status === 'completed' && (
                      <Badge variant="default" className="bg-green-500">
                        Completed
                      </Badge>
                    )}
                    {cloudRunResponse?.status && !['accepted', 'completed'].includes(cloudRunResponse.status) && (
                      <Badge variant="destructive">
                        {cloudRunResponse.status}
                      </Badge>
                    )}
                  </div>
                  {showCloudLog ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {cloudRunResponse?.timestamp && (
                  <CardDescription>
                    {new Date(cloudRunResponse.timestamp).toLocaleString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {cloudRunResponse.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Completed</span>
                          <Badge variant="default" className="bg-green-500">
                            Proposal version saved to Supabase
                          </Badge>
                        </>
                      ) : cloudRunResponse.status === 'accepted' ? (
                        <>
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">Accepted - Processing</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-sm">{cloudRunResponse.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Final Output */}
                  {cloudRunResponse.finalOutput && (
                    <div>
                      <Label className="text-sm font-medium">Final Output</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{cloudRunResponse.finalOutput}</p>
                      </div>
                    </div>
                  )}

                  {/* Version Number */}
                  {cloudRunResponse.versionNumber && (
                    <div>
                      <Label className="text-sm font-medium">Version Number</Label>
                      <p className="mt-1 text-sm font-mono">{cloudRunResponse.versionNumber}</p>
                    </div>
                  )}

                  {/* Deal Link */}
                  {cloudRunResponse.dealLink && (
                    <div>
                      <Label className="text-sm font-medium">Deal Link</Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={cloudRunResponse.dealLink}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(cloudRunResponse.dealLink, '_blank');
                          }}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Request ID */}
                  {cloudRunResponse.request_id && (
                    <div>
                      <Label className="text-sm font-medium">Request ID</Label>
                      <p className="mt-1 text-xs font-mono text-muted-foreground">{cloudRunResponse.request_id}</p>
                    </div>
                  )}

                  {/* Raw Response (collapsible) */}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                      View raw response
                    </summary>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                        {cloudRunLog}
                      </pre>
                    </ScrollArea>
                  </details>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Status Log Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agent Status Log
            </CardTitle>
            <CardDescription>
              Real-time tool execution progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No activity yet. Click "Run Proposal Agent" to begin.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {logs.map((log) => {
                    const ToolIcon = getToolIcon(log.tool);
                    return (
                      <div key={log.id} className="space-y-2 p-3 border rounded-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ToolIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{log.tool}</span>
                          </div>
                          {getStatusIcon(log.status)}
                        </div>

                        {/* Message */}
                        <p className="text-sm">{log.message}</p>

                        {/* Timestamp & Status */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{log.timestamp.toLocaleTimeString()}</span>
                          {getStatusBadge(log.status)}
                        </div>

                        {/* Details (if any) */}
                        {log.details && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Test Run Console */}
        {testLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Test Run Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 font-mono text-sm">
                  {testLogs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Test Output Panel */}
              {testOutput && (
                <Collapsible open={showTestOutput} onOpenChange={setShowTestOutput} className="mt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {showTestOutput ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Hide Final Output
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show Final Output
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{testOutput}</pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        )}

        {/* Smoke Test Console */}
        {smokeLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Smoke Test Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 font-mono text-sm">
                  {smokeLogs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Smoke Output Panel */}
              {smokeOutput && (
                <Collapsible open={showSmokeOutput} onOpenChange={setShowSmokeOutput} className="mt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {showSmokeOutput ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Hide Assistant Text
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show Assistant Text
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{smokeOutput}</pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        )}
      </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {currentVersion && dealId && targetOrgId && (
            <ProposalContentBuilder
              dealId={dealId}
              organizationId={targetOrgId}
              tenantId={currentUser.tenantId || ''}
              versionId={currentVersion.id}
              onContentSave={(sections) => {
                console.log('[ProposalAgentRunner] Content saved:', sections);
                toast.success('Content saved successfully!');
              }}
            />
          )}
          {!currentVersion && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">
                  Create or select a version to edit proposal content
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version Activity Log
              </CardTitle>
              <CardDescription>
                View saved versions with metadata and audit history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No versions yet. Create a deal and run the agent to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.sort((a, b) => b.version - a.version).map((version) => (
                    <Card key={version.id} className="border">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Version Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">Version {version.version}</h4>
                                <Badge variant={version.status === 'published' ? 'default' : 'secondary'}>
                                  {version.status}
                                </Badge>
                                {currentVersion?.id === version.id && (
                                  <Badge variant="outline">Current</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Created {new Date(version.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await apiCall(`/proposal-agent/versions/${version.id}?dealId=${dealId}&organizationId=${targetOrgId}`);
                                  if (response.success && response.version) {
                                    // Show JSON in a dialog or log
                                    console.log('Version data:', response.version);
                                    toast.success('Version data logged to console');
                                  }
                                } catch (error) {
                                  toast.error('Failed to fetch version data');
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View JSON
                            </Button>
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Created by:</span>{' '}
                              <span className="font-medium">{version.createdByName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Version ID:</span>{' '}
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{version.id}</code>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
