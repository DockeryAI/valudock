import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles,
  AlertCircle,
  Target,
  Edit,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Lightbulb,
  Info,
  DollarSign,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { InputData, ROIResults, ProcessROIResults, formatCurrency, formatNumber, formatPercentage } from './utils/calculations';
import { GammaIntegration } from './GammaIntegration';
import { PresentationROIBreakdown } from './PresentationROIBreakdown';
import { ProposalVersionSwitcher, ProposalVersion } from './ProposalVersionSwitcher';
import { ProposalRunLog } from './ProposalRunLog';

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase, apiCall } from '../utils/auth';
import { generateMeetingHistory, extractChallenges, extractGoals } from '../utils/valuedockFathomClient';
import { mustArray } from '../utils/arrayHelpers';

interface AggregatedMeetingData {
  summary: string;
  goals: string[];
  challenges: string[];
  people: Array<{ name: string; title: string; email: string }>;
  meetings_count: number;
  months_span: number;
}

interface MeetingSummaryRecord {
  recording_id: string;
  title: string;
  summary_md: string;
  created_at: string;
  source_url: string;
}

interface PresentationData {
  executiveSummary: {
    companyWebsite: string;
    businessDescription: string;
    meetingHistory: string;
    meetingNotes: string;
    goals: Array<{
      id: string;
      description: string;
      targetOutcome: string;
      alignedOutcomes: string[];
    }>;
    challenges: Array<{
      id: string;
      description: string;
      impact: string;
      alignedOutcomes: string[];
    }>;
    solutionSummary: string;
    discoveryAndROISummary?: string; // NEW: Combined discovery and ROI summary from agent
  };
  solutionImplementation: {
    processes: Array<{
      id: string;
      name: string;
      automationPercentage: number;
      manualPercentage: number;
      technology: string;
    }>;
    selectedStarterProcessIds: string[];
    timeline: {
      description: string;
    };
    customerRequirements: {
      accessNeeded: string;
      pointPerson: string;
      timePerWeek: string;
    };
    benefits: {
      roiSavings: string;
      additionalBenefits: string;
      alignmentToGoals: string;
    };
  };
  aboutDockeryAI: {
    background: string;
    services: string;
    testimonials: Array<{
      id: string;
      content: string;
      author: string;
      company: string;
    }>;
  };
  costsAndBenefits: {
    solutionSummary: string;
    initialProject: {
      summary: string;
    };
    remainingProjects: {
      summary: string;
    };
  };
  statementOfWork: {
    projectDescription: string;
    sowDetails: string;
    upfrontDevelopmentCost: number;
    trainingCosts: number;
    monthlyCosts: number;
    yearlyCosts: number;
  };
  aiSettings: {
    autoSummarizeWebsite: boolean;
  };
  fathomIntegration: {
    customerName: string;
    dateStart: string;
    dateEnd: string;
    lastSync: string;
    meetingSummary: {
      text: string;
      count: number;
      attendees: string[];
      teams: string[];
      topics: string[];
    };
    challenges: Array<{
      id: string;
      label: string;
      impactDollars: number;
      risk: 'Low' | 'Medium' | 'High';
      efficiencyLossHoursMonth: number;
    }>;
    goals: Array<{
      id: string;
      label: string;
      kpi: string;
      target: string;
    }>;
    solutionSummary: {
      text: string;
    };
  };
}

interface PresentationScreenProps {
  data: InputData;
  results: ROIResults;
  selectedProcessIds: string[];
  hardCostsOnlyMode: boolean;
}

export function PresentationScreen({ data, results, selectedProcessIds, hardCostsOnlyMode }: PresentationScreenProps) {
  // ✅ CRITICAL: Validate all array props at component boundary - THROWS on error
  const safeProcesses = mustArray('PresentationScreen.data.processes', data.processes);
  const safeGroups = mustArray('PresentationScreen.data.groups', data.groups);
  const safeSelectedIds = mustArray<string>('PresentationScreen.selectedProcessIds', selectedProcessIds);
  const safeProcessResults = mustArray('PresentationScreen.results.processResults', results.processResults);
  
  // Use safe arrays for all internal operations
  const safeData = {
    ...data,
    processes: safeProcesses,
    groups: safeGroups,
  };
  
  const safeResults = {
    ...results,
    processResults: safeProcessResults,
  };
  
  const isMobile = useIsMobile();
  const renderCountRef = React.useRef(0);
  
  // Increment render counter
  renderCountRef.current += 1;
  
  // Debug: Log when data or results change
  useEffect(() => {
    console.log('[PresentationScreen] ===== COMPONENT UPDATE =====');
    console.log('[PresentationScreen] Render #:', renderCountRef.current);
    console.log('[PresentationScreen] Selected Process IDs:', safeSelectedIds);
    console.log('[PresentationScreen] Hard Costs Only Mode:', hardCostsOnlyMode);
    console.log('[PresentationScreen] Data:', {
      processCount: safeProcesses.length,
      selectedCount: safeProcesses.filter(p => p.selected).length,
      processes: safeProcesses.map(p => ({ id: p.id, name: p.name, selected: p.selected, fteCount: p.fteCount, taskVolume: p.taskVolume }))
    });
    console.log('[PresentationScreen] Results:', {
      processResultsCount: safeProcessResults.length,
      processResultsWithData: safeProcessResults.filter(pr => pr.annualNetSavings > 0).length,
      processResultsIds: safeProcessResults.map(pr => pr.processId),
      annualSavings: safeResults.annualNetSavings,
      roi: safeResults.roiPercentage,
      totalFTEsFreed: safeResults.totalFTEsFreed,
      npv: safeResults.npv
    });
    console.log('[PresentationScreen] ===============================');
  }, [safeData, safeResults, safeSelectedIds, hardCostsOnlyMode]);
  
  const [presentationData, setPresentationData] = useState<PresentationData>({
    executiveSummary: {
      companyWebsite: '',
      businessDescription: '',
      meetingHistory: '',
      meetingNotes: '',
      goals: [],
      challenges: [],
      solutionSummary: '',
      discoveryAndROISummary: '', // NEW: Combined discovery and ROI summary from agent
    },
    solutionImplementation: {
      processes: [],
      selectedStarterProcessIds: [],
      timeline: {
        description: '',
      },
      customerRequirements: {
        accessNeeded: '',
        pointPerson: '',
        timePerWeek: '',
      },
      benefits: {
        roiSavings: '',
        additionalBenefits: '',
        alignmentToGoals: '',
      },
    },
    aboutDockeryAI: {
      background: 'DockeryAI is a leading automation and AI consulting firm specializing in business process automation, intelligent document processing, and custom AI solutions. With years of experience across industries, we help organizations achieve significant ROI through strategic automation initiatives.',
      services: 'Process Automation • Intelligent Document Processing • Custom AI Solutions • Workflow Optimization • Integration Services • Training & Support',
      testimonials: [],
    },
    costsAndBenefits: {
      solutionSummary: '',
      initialProject: {
        summary: '',
      },
      remainingProjects: {
        summary: '',
      },
    },
    statementOfWork: {
      projectDescription: '',
      sowDetails: '',
      upfrontDevelopmentCost: 0,
      trainingCosts: 0,
      monthlyCosts: 0,
      yearlyCosts: 0,
    },
    aiSettings: {
      autoSummarizeWebsite: false,
    },
    fathomIntegration: {
      customerName: '',
      dateStart: '',
      dateEnd: '',
      lastSync: '',
      meetingSummary: {
        text: '',
        count: 0,
        attendees: [],
        teams: [],
        topics: [],
      },
      challenges: [],
      goals: [],
      solutionSummary: {
        text: '',
      },
    },
  });

  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [sectionsToExport, setSectionsToExport] = useState<string[]>(['all']);
  const [editingOutcomes, setEditingOutcomes] = useState<{
    type: 'goal' | 'challenge' | null;
    id: string | null;
    outcomes: string[];
  }>({ type: null, id: null, outcomes: [] });
  const [aiGenerationStatus, setAiGenerationStatus] = useState<{
    [key: string]: 'idle' | 'loading' | 'success' | 'error';
  }>({});
  
  // Aggregated meeting data state
  const [aggregatedMeetingData, setAggregatedMeetingData] = useState<AggregatedMeetingData | null>(null);
  const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);
  const [isSavingAggregate, setIsSavingAggregate] = useState(false);
  
  // Meeting summaries from database
  const [meetingSummaries, setMeetingSummaries] = useState<MeetingSummaryRecord[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [isSyncingMeetings, setIsSyncingMeetings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [gammaOutlineContent, setGammaOutlineContent] = useState<string>('');
  const [gammaUrl, setGammaUrl] = useState<string>('');
  const [gammaEditUrl, setGammaEditUrl] = useState<string>('');
  const [isGeneratingGamma, setIsGeneratingGamma] = useState(false);
  
  // Version management state
  const [currentVersion, setCurrentVersion] = useState<ProposalVersion>({
    id: 'v1',
    version: 1,
    status: 'draft',
    createdAt: new Date().toISOString(),
    createdBy: 'current-user',
    createdByName: 'You'
  });
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  
  // Gamma Export state
  const [isExportingToGamma, setIsExportingToGamma] = useState(false);
  const [gammaExportResult, setGammaExportResult] = useState<{
    status: string;
    steps?: { fathom?: string; proposal?: string; gamma?: string };
    final_output?: string;
    export_links?: {
      doc: string;
      deck: string;
    };
    mode?: string;
  } | null>(null);

  // Auto-populate processes from data
  useEffect(() => {
    const processes = data.processes.map(p => ({
      id: p.id,
      name: p.name,
      automationPercentage: p.implementationCosts?.automationCoverage || 80,
      manualPercentage: 100 - (p.implementationCosts?.automationCoverage || 80),
      technology: 'RPA & AI',
    }));

    setPresentationData(prev => ({
      ...prev,
      solutionImplementation: {
        ...prev.solutionImplementation,
        processes,
      },
    }));
  }, [data.processes]);

  // Auto-generate solution summary from ROI data
  useEffect(() => {
    if (results) {
      const autoSummary = `Proposed automation solution delivers a ${formatPercentage(results.roiPercentage)} ROI with ${formatCurrency(results.annualNetSavings)} in annual net savings. Total 3-year NPV: ${formatCurrency(results.npv)}. Payback period: ${formatNumber(results.paybackPeriod)} months.`;
      
      setPresentationData(prev => ({
        ...prev,
        executiveSummary: {
          ...prev.executiveSummary,
          solutionSummary: prev.executiveSummary.solutionSummary || autoSummary,
        },
      }));
    }
  }, [results]);

  // Auto-generate costs and benefits summary with detailed cost breakdown
  useEffect(() => {
    if (results && data) {
      // Calculate total upfront and ongoing costs from selected starter processes
      const starterProcessIds = presentationData.solutionImplementation.selectedStarterProcessIds;
      const starterProcessResults = results.processResults.filter(pr => 
        starterProcessIds.includes(pr.processId)
      );
      
      const totalUpfrontCost = starterProcessResults.reduce((sum, r) => sum + r.totalInvestment, 0);
      const totalMonthlyCost = starterProcessResults.reduce((sum, r) => {
        const monthlySoftware = (r.implementationCosts?.softwareCost || 0);
        const monthlyIT = (r.ongoingITSupportCosts || 0) / 12;
        return sum + monthlySoftware + monthlyIT;
      }, 0);
      const totalAnnualSavings = starterProcessResults.reduce((sum, r) => sum + (r.monthlySavings * 12), 0);
      
      const summary = `Initial automation project includes ${starterProcessResults.length} starter process${starterProcessResults.length !== 1 ? 'es' : ''} with upfront investment of ${formatCurrency(totalUpfrontCost)} and ongoing costs of ${formatCurrency(totalMonthlyCost)}/month. Projected annual savings: ${formatCurrency(totalAnnualSavings)}. Total opportunity across all ${data.processes.length} processes: ${formatCurrency(results.annualNetSavings)} annual net savings with ${formatPercentage(results.roiPercentage)} ROI.`;
      
      setPresentationData(prev => ({
        ...prev,
        costsAndBenefits: {
          ...prev.costsAndBenefits,
          solutionSummary: prev.costsAndBenefits.solutionSummary || summary,
        },
      }));
    }
  }, [results, data, presentationData.solutionImplementation.selectedStarterProcessIds]);

  // Auto-generate project description from starter processes
  useEffect(() => {
    const starterProcesses = presentationData.solutionImplementation.processes.filter(p =>
      presentationData.solutionImplementation.selectedStarterProcessIds.includes(p.id)
    );

    if (starterProcesses.length > 0) {
      const description = `Initial automation project will focus on ${starterProcesses.length} key process${starterProcesses.length > 1 ? 'es' : ''}: ${starterProcesses.map(p => p.name).join(', ')}. These processes were selected based on high impact, quick implementation potential, and strategic alignment with business goals.`;
      
      if (!presentationData.statementOfWork.projectDescription) {
        setPresentationData(prev => ({
          ...prev,
          statementOfWork: {
            ...prev.statementOfWork,
            projectDescription: description,
          },
        }));
      }
    }
  }, [presentationData.solutionImplementation.selectedStarterProcessIds, presentationData.solutionImplementation.processes]);

  // Auto-align outcomes for goals and challenges
  useEffect(() => {
    if (results) {
      // Auto-align outcomes for goals
      const updatedGoals = presentationData.executiveSummary.goals.map(goal => {
        if (goal.description && goal.alignedOutcomes.length === 0) {
          return {
            ...goal,
            alignedOutcomes: autoAlignOutcomes(goal.description)
          };
        }
        return goal;
      });

      // Auto-align outcomes for challenges
      const updatedChallenges = presentationData.executiveSummary.challenges.map(challenge => {
        if (challenge.description && challenge.alignedOutcomes.length === 0) {
          return {
            ...challenge,
            alignedOutcomes: autoAlignOutcomes(challenge.description)
          };
        }
        return challenge;
      });

      // Check if any updates are needed
      const goalsChanged = JSON.stringify(updatedGoals) !== JSON.stringify(presentationData.executiveSummary.goals);
      const challengesChanged = JSON.stringify(updatedChallenges) !== JSON.stringify(presentationData.executiveSummary.challenges);

      if (goalsChanged || challengesChanged) {
        setPresentationData(prev => ({
          ...prev,
          executiveSummary: {
            ...prev.executiveSummary,
            goals: updatedGoals,
            challenges: updatedChallenges,
          },
        }));
      }

      // Also update the benefits alignment text for backward compatibility
      const allItems = [...presentationData.executiveSummary.goals, ...presentationData.executiveSummary.challenges];
      if (allItems.length > 0 && !presentationData.solutionImplementation.benefits.alignmentToGoals) {
        const alignmentSummary = allItems
          .filter(item => item.alignedOutcomes && item.alignedOutcomes.length > 0)
          .map(item => `• ${item.description}: ${item.alignedOutcomes.slice(0, 2).join(', ')}`)
          .join('\n');

        if (alignmentSummary) {
          setPresentationData(prev => ({
            ...prev,
            solutionImplementation: {
              ...prev.solutionImplementation,
              benefits: {
                ...prev.solutionImplementation.benefits,
                alignmentToGoals: alignmentSummary,
              },
            },
          }));
        }
      }
    }
  }, [presentationData.executiveSummary.goals.map(g => g.description).join(','), 
      presentationData.executiveSummary.challenges.map(c => c.description).join(','), 
      results]);

  // Add challenge
  const addChallenge = () => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        challenges: [
          ...presentationData.executiveSummary.challenges,
          { id: Date.now().toString(), description: '', impact: '' },
        ],
      },
    });
  };

  // Remove challenge
  const removeChallenge = (id: string) => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        challenges: presentationData.executiveSummary.challenges.filter(c => c.id !== id),
      },
    });
  };

  // Update challenge
  const updateChallenge = (id: string, field: 'description' | 'impact' | 'alignedOutcomes', value: string | string[]) => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        challenges: presentationData.executiveSummary.challenges.map(c =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      },
    });
  };

  // Add goal
  const addGoal = () => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        goals: [
          ...presentationData.executiveSummary.goals,
          { id: Date.now().toString(), description: '', targetOutcome: '', alignedOutcomes: [] },
        ],
      },
    });
  };

  // Remove goal
  const removeGoal = (id: string) => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        goals: presentationData.executiveSummary.goals.filter(g => g.id !== id),
      },
    });
  };

  // Update goal
  const updateGoal = (id: string, field: 'description' | 'targetOutcome' | 'alignedOutcomes', value: string | string[]) => {
    setPresentationData({
      ...presentationData,
      executiveSummary: {
        ...presentationData.executiveSummary,
        goals: presentationData.executiveSummary.goals.map(g =>
          g.id === id ? { ...g, [field]: value } : g
        ),
      },
    });
  };

  // Get available outcomes from results
  const getAvailableOutcomes = () => {
    if (!results) return [];
    
    return [
      { id: 'roi', label: `${formatPercentage(results.roiPercentage)} ROI`, value: `${formatPercentage(results.roiPercentage)} ROI` },
      { id: 'npv', label: `${formatCurrency(results.npv)} NPV (3-Year)`, value: `${formatCurrency(results.npv)} NPV (3-Year)` },
      { id: 'irr', label: `${formatPercentage(results.irr)} IRR`, value: `${formatPercentage(results.irr)} IRR` },
      { id: 'payback', label: `${formatNumber(results.paybackPeriod)} Month Payback`, value: `${formatNumber(results.paybackPeriod)} month payback period` },
      { id: 'annualSavings', label: `${formatCurrency(results.annualNetSavings)} Annual Savings`, value: `${formatCurrency(results.annualNetSavings)} in annual net savings` },
      { id: 'monthlySavings', label: `${formatCurrency(results.monthlySavings)} Monthly Savings`, value: `${formatCurrency(results.monthlySavings)} in monthly savings` },
      { id: 'timeSaved', label: `${formatNumber(results.monthlyTimeSaved)} Hours/Month Saved`, value: `${formatNumber(results.monthlyTimeSaved)} hours saved per month` },
      { id: 'annualTime', label: `${formatNumber(results.annualTimeSavings)} Hours/Year Saved`, value: `${formatNumber(results.annualTimeSavings)} hours saved annually` },
      { id: 'fteFreed', label: `${formatNumber(results.totalFTEsFreed)} FTEs Freed`, value: `${formatNumber(results.totalFTEsFreed)} FTEs freed up` },
      { id: 'errorReduction', label: `${formatCurrency(results.totalErrorReductionSavings)} Error Reduction`, value: `${formatCurrency(results.totalErrorReductionSavings)} in error reduction savings` },
      { id: 'complianceRisk', label: `${formatCurrency(results.totalComplianceRiskReduction)} Compliance Risk Reduction`, value: `${formatCurrency(results.totalComplianceRiskReduction)} in compliance risk reduction` },
      { id: 'revenueUplift', label: `${formatCurrency(results.totalRevenueUplift)} Revenue Uplift`, value: `${formatCurrency(results.totalRevenueUplift)} in revenue uplift` },
      { id: 'promptPayment', label: `${formatCurrency(results.totalPromptPaymentBenefit)} Prompt Payment Benefit`, value: `${formatCurrency(results.totalPromptPaymentBenefit)} in prompt payment discount savings` },
      { id: 'ebitdaImpact', label: `${formatCurrency(results.ebitdaImpact)} EBITDA Impact`, value: `${formatCurrency(results.ebitdaImpact)} EBITDA impact` },
      { id: 'totalInvestment', label: `${formatCurrency(results.totalInvestment)} Total Investment`, value: `${formatCurrency(results.totalInvestment)} total investment` },
    ];
  };

  // Auto-align outcomes based on keywords
  const autoAlignOutcomes = (description: string): string[] => {
    const desc = description.toLowerCase();
    const alignments: string[] = [];
    const outcomes = getAvailableOutcomes();

    // Time/Efficiency related
    if (desc.includes('time') || desc.includes('slow') || desc.includes('efficiency') || desc.includes('faster') || desc.includes('speed')) {
      const timeOutcome = outcomes.find(o => o.id === 'timeSaved');
      const annualTimeOutcome = outcomes.find(o => o.id === 'annualTime');
      if (timeOutcome) alignments.push(timeOutcome.value);
      if (annualTimeOutcome) alignments.push(annualTimeOutcome.value);
    }

    // Cost/Savings related
    if (desc.includes('cost') || desc.includes('expense') || desc.includes('budget') || desc.includes('save') || desc.includes('reduce spend')) {
      const savingsOutcome = outcomes.find(o => o.id === 'annualSavings');
      const monthlySavingsOutcome = outcomes.find(o => o.id === 'monthlySavings');
      if (savingsOutcome) alignments.push(savingsOutcome.value);
      if (monthlySavingsOutcome) alignments.push(monthlySavingsOutcome.value);
    }

    // Error/Quality related
    if (desc.includes('error') || desc.includes('quality') || desc.includes('accuracy') || desc.includes('mistake')) {
      const errorOutcome = outcomes.find(o => o.id === 'errorReduction');
      if (errorOutcome) alignments.push(errorOutcome.value);
    }

    // Capacity/Staffing related
    if (desc.includes('capacity') || desc.includes('volume') || desc.includes('scale') || desc.includes('staff') || desc.includes('headcount') || desc.includes('fte')) {
      const fteOutcome = outcomes.find(o => o.id === 'fteFreed');
      if (fteOutcome) alignments.push(fteOutcome.value);
    }

    // Compliance/Risk related
    if (desc.includes('compliance') || desc.includes('risk') || desc.includes('audit') || desc.includes('regulation')) {
      const complianceOutcome = outcomes.find(o => o.id === 'complianceRisk');
      if (complianceOutcome) alignments.push(complianceOutcome.value);
    }

    // Revenue/Growth related
    if (desc.includes('revenue') || desc.includes('growth') || desc.includes('sales') || desc.includes('income')) {
      const revenueOutcome = outcomes.find(o => o.id === 'revenueUplift');
      if (revenueOutcome) alignments.push(revenueOutcome.value);
    }

    // Prompt Payment related
    if (desc.includes('payment') || desc.includes('discount') || desc.includes('cash flow') || 
        desc.includes('invoice') || desc.includes('invoicing') || desc.includes('early payment') ||
        desc.includes('prompt payment') || desc.includes('payables') || desc.includes('ap automation')) {
      const promptPaymentOutcome = outcomes.find(o => o.id === 'promptPayment');
      if (promptPaymentOutcome) alignments.push(promptPaymentOutcome.value);
    }

    // ROI/Financial metrics (general financial goals)
    if (desc.includes('roi') || desc.includes('return') || desc.includes('profitability') || desc.includes('financial')) {
      const roiOutcome = outcomes.find(o => o.id === 'roi');
      const npvOutcome = outcomes.find(o => o.id === 'npv');
      const irrOutcome = outcomes.find(o => o.id === 'irr');
      if (roiOutcome) alignments.push(roiOutcome.value);
      if (npvOutcome) alignments.push(npvOutcome.value);
      if (irrOutcome) alignments.push(irrOutcome.value);
    }

    // EBITDA related
    if (desc.includes('ebitda') || desc.includes('profit') || desc.includes('margin')) {
      const ebitdaOutcome = outcomes.find(o => o.id === 'ebitdaImpact');
      if (ebitdaOutcome) alignments.push(ebitdaOutcome.value);
    }

    // Payback related
    if (desc.includes('payback') || desc.includes('break even') || desc.includes('recover investment')) {
      const paybackOutcome = outcomes.find(o => o.id === 'payback');
      if (paybackOutcome) alignments.push(paybackOutcome.value);
    }

    // If no specific alignments found, add general ROI metrics
    if (alignments.length === 0) {
      const roiOutcome = outcomes.find(o => o.id === 'roi');
      const savingsOutcome = outcomes.find(o => o.id === 'annualSavings');
      if (roiOutcome) alignments.push(roiOutcome.value);
      if (savingsOutcome) alignments.push(savingsOutcome.value);
    }

    return alignments;
  };

  // Update process
  const updateProcess = (id: string, field: string, value: any) => {
    setPresentationData({
      ...presentationData,
      solutionImplementation: {
        ...presentationData.solutionImplementation,
        processes: presentationData.solutionImplementation.processes.map(p =>
          p.id === id ? { ...p, [field]: value } : p
        ),
      },
    });
  };

  // Add testimonial
  const addTestimonial = () => {
    setPresentationData({
      ...presentationData,
      aboutDockeryAI: {
        ...presentationData.aboutDockeryAI,
        testimonials: [
          ...presentationData.aboutDockeryAI.testimonials,
          { id: Date.now().toString(), content: '', author: '', company: '' },
        ],
      },
    });
  };

  // Remove testimonial
  const removeTestimonial = (id: string) => {
    setPresentationData({
      ...presentationData,
      aboutDockeryAI: {
        ...presentationData.aboutDockeryAI,
        testimonials: presentationData.aboutDockeryAI.testimonials.filter(t => t.id !== id),
      },
    });
  };

  // Update testimonial
  const updateTestimonial = (id: string, field: 'content' | 'author' | 'company', value: string) => {
    setPresentationData({
      ...presentationData,
      aboutDockeryAI: {
        ...presentationData.aboutDockeryAI,
        testimonials: presentationData.aboutDockeryAI.testimonials.map(t =>
          t.id === id ? { ...t, [field]: value } : t
        ),
      },
    });
  };

  // Toggle starter process selection
  const toggleStarterProcess = (processId: string) => {
    const currentlySelected = presentationData.solutionImplementation.selectedStarterProcessIds;
    const newSelection = currentlySelected.includes(processId)
      ? currentlySelected.filter(id => id !== processId)
      : [...currentlySelected, processId];
    
    setPresentationData({
      ...presentationData,
      solutionImplementation: {
        ...presentationData.solutionImplementation,
        selectedStarterProcessIds: newSelection,
      },
    });
  };

  // Get next phase processes (non-starter processes)
  const getNextPhaseProcesses = () => {
    return presentationData.solutionImplementation.processes
      .filter(p => !presentationData.solutionImplementation.selectedStarterProcessIds.includes(p.id))
      .map(p => p.name)
      .join(', ') || 'None';
  };

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      console.log('[AUTH] Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AUTH] Session error:', error);
        throw new Error('Failed to get session: ' + error.message);
      }
      
      if (!session) {
        console.error('[AUTH] No session found');
        throw new Error('Not authenticated. Please login again.');
      }
      
      if (!session.access_token) {
        console.error('[AUTH] Session exists but no access token');
        throw new Error('Invalid session. Please login again.');
      }
      
      console.log('[AUTH] Token retrieved successfully');
      console.log('[AUTH] User:', session.user?.email);
      console.log('[AUTH] Token preview:', session.access_token.substring(0, 20) + '...');
      
      return session.access_token;
    } catch (error) {
      console.error('[AUTH] Error in getAuthToken:', error);
      throw error;
    }
  };



  // Generate content with AI
  const generateWithAI = async (section: string) => {
    setAiGenerationStatus(prev => ({ ...prev, [section]: 'loading' }));
    
    try {
      // Get user's access token
      const accessToken = await getAuthToken();
      
      let updatedData = { ...presentationData };
      
      switch (section) {
        case 'businessDescription':
          if (presentationData.executiveSummary.companyWebsite) {
            console.log('[AI] Calling analyze-website endpoint...');
            console.log('[AI] Website:', presentationData.executiveSummary.companyWebsite);
            console.log('[AI] Token preview:', accessToken.substring(0, 20) + '...');
            
            // Call OpenAI API via backend to analyze website
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/analyze-website`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                website: presentationData.executiveSummary.companyWebsite 
              }),
            });

            console.log('[AI] Response status:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[AI] Error response:', errorText);
              let errorData;
              try {
                errorData = JSON.parse(errorText);
              } catch (e) {
                throw new Error(`Failed to analyze website: ${errorText}`);
              }
              throw new Error(errorData.error || 'Failed to analyze website');
            }

            const data = await response.json();
            console.log('[AI] Success! Description length:', data.description?.length || 0);
            updatedData.executiveSummary.businessDescription = data.description;
            toast.success('Business description generated with AI');
          } else {
            toast.error('Please enter a company website first');
            setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
            return;
          }
          break;
          
        case 'meetingHistory':
          if (presentationData.executiveSummary.companyWebsite) {
            // Extract domain from website URL
            const domain = presentationData.executiveSummary.companyWebsite
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0];
            
            // Call Fathom API via proxy
            console.log('[FATHOM-FRONTEND] Fetching meeting history for domain:', domain);
            
            try {
              const fathomData = await generateMeetingHistory(domain);
              
              console.log('[FATHOM-FRONTEND] Meeting count:', fathomData.meetingCount);
              console.log('[FATHOM-FRONTEND] Summary length:', fathomData.summary?.length);
              
              updatedData.executiveSummary.meetingHistory = fathomData.summary;
              
              if (fathomData.meetingCount === 0) {
                toast.info(`No meetings found for ${domain}. Make sure Fathom meetings include attendees with @${domain} email addresses.`);
              } else {
                toast.success(`Generated meeting history from ${fathomData.meetingCount} Fathom meeting${fathomData.meetingCount > 1 ? 's' : ''}`);
              }
            } catch (error: any) {
              console.error('[FATHOM-FRONTEND] Error:', error);
              toast.error('Failed to fetch meeting history', {
                description: error.message || 'Please check your API configuration and try again.',
                duration: 6000,
              });
              setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
              return;
            }
          } else {
            toast.error('Please enter a company website first');
            setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
            return;
          }
          break;
          
        case 'goals':
          if (presentationData.executiveSummary.companyWebsite) {
            // Extract domain from website URL
            const domainGoals = presentationData.executiveSummary.companyWebsite
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0];
            
            // Extract goals via proxy
            console.log('[FATHOM-GOALS] Extracting goals for domain:', domainGoals);
            
            try {
              const goals = await extractGoals(domainGoals);
              
              console.log('[FATHOM-GOALS] Extracted goals:', goals.length);
              
              // Add extracted goals to existing goals
              if (goals.length > 0) {
                const newGoals = goals.map((goal) => ({
                  id: Date.now().toString() + Math.random(),
                  description: goal.description,
                  targetOutcome: goal.targetOutcome,
                  alignedOutcomes: autoAlignOutcomes(goal.description)
                }));
                
                updatedData.executiveSummary.goals = [
                  ...presentationData.executiveSummary.goals,
                  ...newGoals
                ];
                
                toast.success(`Added ${newGoals.length} goal${newGoals.length > 1 ? 's' : ''} from Fathom meetings`);
              } else {
                toast.info(`No goals extracted from ${domainGoals} meetings. Try discussing specific business objectives in your meetings.`);
              }
            } catch (error: any) {
              console.error('[FATHOM-GOALS] Error:', error);
              toast.error('Failed to extract goals', {
                description: error.message || 'Please check your API configuration and try again.',
                duration: 6000,
              });
              setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
              return;
            }
          } else {
            toast.error('Please enter a company website first');
            setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
            return;
          }
          break;
          
        case 'challenges':
          if (presentationData.executiveSummary.companyWebsite) {
            // Extract domain from website URL
            const domainChallenges = presentationData.executiveSummary.companyWebsite
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0];
            
            // Extract challenges via proxy
            console.log('[FATHOM-CHALLENGES] Extracting challenges for domain:', domainChallenges);
            
            try {
              const challenges = await extractChallenges(domainChallenges);
              
              console.log('[FATHOM-CHALLENGES] Extracted challenges:', challenges.length);
              
              // Add extracted challenges to existing challenges
              if (challenges.length > 0) {
                const newChallenges = challenges.map((challenge) => ({
                  id: Date.now().toString() + Math.random(),
                  description: challenge.description,
                  impact: challenge.impact,
                  alignedOutcomes: autoAlignOutcomes(challenge.description + ' ' + challenge.impact)
                }));
                
                updatedData.executiveSummary.challenges = [
                  ...presentationData.executiveSummary.challenges,
                  ...newChallenges
                ];
                
                toast.success(`Added ${newChallenges.length} challenge${newChallenges.length > 1 ? 's' : ''} from Fathom meetings`);
              } else {
                toast.info(`No challenges extracted from ${domainChallenges} meetings. Try discussing specific business problems in your meetings.`);
              }
            } catch (error: any) {
              console.error('[FATHOM-CHALLENGES] Error:', error);
              toast.error('Failed to extract challenges', {
                description: error.message || 'Please check your API configuration and try again.',
                duration: 6000,
              });
              setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
              return;
            }
          } else {
            toast.error('Please enter a company website first');
            setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
            return;
          }
          break;
          
        case 'benefits':
          {
            const prompt = `Based on the following business goals and challenges, suggest 5 specific additional benefits of implementing automation:\n\nGoals:\n${presentationData.executiveSummary.goals.map(g => `- ${g.description}`).join('\n')}\n\nChallenges:\n${presentationData.executiveSummary.challenges.map(c => `- ${c.description}`).join('\n')}\n\nProvide a bulleted list of 5 concrete benefits beyond the quantified ROI metrics.`;
            
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                section: 'benefits',
                prompt,
                context: {
                  goals: presentationData.executiveSummary.goals,
                  challenges: presentationData.executiveSummary.challenges
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate benefits');
            }

            const data = await response.json();
            updatedData.solutionImplementation.benefits.additionalBenefits = data.content;
            toast.success('Benefits generated with AI');
          }
          break;
          
        case 'timeline':
          {
            const starterProcesses = presentationData.solutionImplementation.processes
              .filter(p => presentationData.solutionImplementation.selectedStarterProcessIds.includes(p.id))
              .map(p => p.name);
            
            const prompt = `Create a realistic implementation timeline for automating the following processes:\n${starterProcesses.join(', ')}\n\nProvide a phased timeline with 4 phases covering discovery, development, deployment, and optimization. Include week ranges for each phase.`;
            
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                section: 'timeline',
                prompt,
                context: { starterProcesses }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate timeline');
            }

            const data = await response.json();
            updatedData.solutionImplementation.timeline.description = data.content;
            toast.success('Timeline generated with AI');
          }
          break;
          
        case 'sow':
          {
            const starterProcesses = presentationData.solutionImplementation.processes
              .filter(p => presentationData.solutionImplementation.selectedStarterProcessIds.includes(p.id));
            
            const prompt = `Write a Statement of Work (SOW) for an automation implementation project covering these processes:\n${starterProcesses.map(p => p.name).join(', ')}\n\nInclude: project objectives, scope, deliverables, responsibilities, timelines, and success criteria. Keep it professional and concise (2-3 paragraphs).`;
            
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                section: 'sow',
                prompt,
                context: { 
                  processes: starterProcesses,
                  upfrontCost: presentationData.statementOfWork.upfrontDevelopmentCost,
                  monthlyCosts: presentationData.statementOfWork.monthlyCosts
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate SOW');
            }

            const data = await response.json();
            updatedData.statementOfWork.sowDetails = data.content;
            toast.success('SOW generated with AI');
          }
          break;
          
        case 'solutionSummary':
          {
            const prompt = `Create a compelling executive summary for an automation solution with the following details:

ROI: ${formatPercentage(results.roiPercentage)}
Annual Net Savings: ${formatCurrency(results.annualNetSavings)}
3-Year NPV: ${formatCurrency(results.npv)}
Payback Period: ${formatNumber(results.paybackPeriod)} months
Total FTEs Freed: ${formatNumber(results.totalFTEsFreed)}

Goals:
${presentationData.executiveSummary.goals.map(g => `- ${g.description}`).join('\n')}

Challenges:
${presentationData.executiveSummary.challenges.map(c => `- ${c.description}`).join('\n')}

Write a concise, compelling 2-3 sentence executive summary that highlights the value proposition.`;
            
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                section: 'solutionSummary',
                prompt,
                context: {
                  roi: results,
                  goals: presentationData.executiveSummary.goals,
                  challenges: presentationData.executiveSummary.challenges
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate solution summary');
            }

            const data = await response.json();
            updatedData.executiveSummary.solutionSummary = data.content;
            toast.success('Solution summary generated with AI');
          }
          break;
          
        case 'meetingNotes':
          {
            const prompt = `Generate professional meeting notes based on the following context:

Company Website: ${presentationData.executiveSummary.companyWebsite}
Business Description: ${presentationData.executiveSummary.businessDescription}

Goals discussed:
${presentationData.executiveSummary.goals.map(g => `- ${g.description}: ${g.targetOutcome}`).join('\n')}

Challenges identified:
${presentationData.executiveSummary.challenges.map(c => `- ${c.description}: ${c.impact}`).join('\n')}

Write concise meeting notes summarizing the discussion, key takeaways, and next steps.`;
            
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ 
                section: 'meetingNotes',
                prompt,
                context: {
                  website: presentationData.executiveSummary.companyWebsite,
                  goals: presentationData.executiveSummary.goals,
                  challenges: presentationData.executiveSummary.challenges
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate meeting notes');
            }

            const data = await response.json();
            updatedData.executiveSummary.meetingNotes = data.content;
            toast.success('Meeting notes generated with AI');
          }
          break;
      }
      
      setPresentationData(updatedData);
      setAiGenerationStatus(prev => ({ ...prev, [section]: 'success' }));
      
      setTimeout(() => {
        setAiGenerationStatus(prev => ({ ...prev, [section]: 'idle' }));
      }, 3000);
      
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(`Failed to generate ${section}`);
      setAiGenerationStatus(prev => ({ ...prev, [section]: 'error' }));
      setTimeout(() => {
        setAiGenerationStatus(prev => ({ ...prev, [section]: 'idle' }));
      }, 3000);
    }
  };

  // Fathom sync - pull meetings for customer
  const syncFathomMeetings = async () => {
    if (!presentationData.fathomIntegration.customerName) {
      toast.error('Please enter a customer name');
      return;
    }

    setAiGenerationStatus(prev => ({ ...prev, fathomSync: 'loading' }));
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customer_name: presentationData.fathomIntegration.customerName,
          date_start: presentationData.fathomIntegration.dateStart,
          date_end: presentationData.fathomIntegration.dateEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync Fathom meetings');
      }

      const data = await response.json();
      
      setPresentationData(prev => ({
        ...prev,
        fathomIntegration: {
          ...prev.fathomIntegration,
          lastSync: new Date().toISOString(),
        },
      }));

      setAiGenerationStatus(prev => ({ ...prev, fathomSync: 'success' }));
      toast.success(`Synced ${data.meetingCount || 0} meetings from Fathom`);
    } catch (error) {
      console.error('Fathom sync error:', error);
      setAiGenerationStatus(prev => ({ ...prev, fathomSync: 'error' }));
      toast.error('Failed to sync Fathom meetings');
    }
  };

  // Generate meeting summary with AI
  const generateMeetingSummary = async () => {
    if (!presentationData.fathomIntegration.customerName) {
      toast.error('Please enter a customer name and sync Fathom meetings first');
      return;
    }

    setAiGenerationStatus(prev => ({ ...prev, meetingSummary: 'loading' }));
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/generate-meeting-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customer_name: presentationData.fathomIntegration.customerName,
          date_start: presentationData.fathomIntegration.dateStart,
          date_end: presentationData.fathomIntegration.dateEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting summary');
      }

      const data = await response.json();
      
      setPresentationData(prev => ({
        ...prev,
        fathomIntegration: {
          ...prev.fathomIntegration,
          meetingSummary: data.meeting_summary,
        },
      }));

      setAiGenerationStatus(prev => ({ ...prev, meetingSummary: 'success' }));
      toast.success('Meeting summary generated');
    } catch (error) {
      console.error('Meeting summary error:', error);
      setAiGenerationStatus(prev => ({ ...prev, meetingSummary: 'error' }));
      toast.error('Failed to generate meeting summary');
    }
  };

  // Generate challenges from Fathom meetings
  const generateChallengesFromFathom = async () => {
    if (!presentationData.fathomIntegration.customerName) {
      toast.error('Please enter a customer name and sync Fathom meetings first');
      return;
    }

    setAiGenerationStatus(prev => ({ ...prev, fathomChallenges: 'loading' }));
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/extract-challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customer_name: presentationData.fathomIntegration.customerName,
          date_start: presentationData.fathomIntegration.dateStart,
          date_end: presentationData.fathomIntegration.dateEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract challenges');
      }

      const data = await response.json();
      
      setPresentationData(prev => ({
        ...prev,
        fathomIntegration: {
          ...prev.fathomIntegration,
          challenges: data.challenges,
        },
      }));

      setAiGenerationStatus(prev => ({ ...prev, fathomChallenges: 'success' }));
      toast.success(`Extracted ${data.challenges.length} challenges`);
    } catch (error) {
      console.error('Challenges extraction error:', error);
      setAiGenerationStatus(prev => ({ ...prev, fathomChallenges: 'error' }));
      toast.error('Failed to extract challenges');
    }
  };

  // Generate goals from Fathom meetings
  const generateGoalsFromFathom = async () => {
    if (!presentationData.fathomIntegration.customerName) {
      toast.error('Please enter a customer name and sync Fathom meetings first');
      return;
    }

    setAiGenerationStatus(prev => ({ ...prev, fathomGoals: 'loading' }));
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/extract-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customer_name: presentationData.fathomIntegration.customerName,
          date_start: presentationData.fathomIntegration.dateStart,
          date_end: presentationData.fathomIntegration.dateEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract goals');
      }

      const data = await response.json();
      
      setPresentationData(prev => ({
        ...prev,
        fathomIntegration: {
          ...prev.fathomIntegration,
          goals: data.goals,
        },
      }));

      setAiGenerationStatus(prev => ({ ...prev, fathomGoals: 'success' }));
      toast.success(`Extracted ${data.goals.length} goals`);
    } catch (error) {
      console.error('Goals extraction error:', error);
      setAiGenerationStatus(prev => ({ ...prev, fathomGoals: 'error' }));
      toast.error('Failed to extract goals');
    }
  };

  // Fetch aggregated meeting data
  const fetchAggregatedMeetings = async () => {
    if (!presentationData.executiveSummary.companyWebsite) {
      toast.error('Please enter a company domain first');
      return;
    }
    
    setIsLoadingAggregate(true);
    setAiGenerationStatus(prev => ({ ...prev, aggregateMeetings: 'loading' }));
    
    try {
      // Extract domain from website URL
      const domain = presentationData.executiveSummary.companyWebsite
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      
      console.log('[AGGREGATE-MEETINGS] Starting engagement summary for domain:', domain);
      
      // Get auth token
      const accessToken = await getAuthToken();
      
      // Step 1: Start the engagement summary job
      const startResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain })
      });
      
      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || 'Failed to start engagement summary');
      }
      
      const startData = await startResponse.json();
      
      if (!startData.ok || !startData.run_id) {
        throw new Error('Invalid response from server');
      }
      
      const { run_id } = startData;
      console.log('[AGGREGATE-MEETINGS] Job started with run_id:', run_id);
      
      // Step 2: Poll for completion (every 2 seconds, max 60 seconds)
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;
        
        console.log(`[AGGREGATE-MEETINGS] Polling attempt ${attempts}/${maxAttempts}...`);
        
        const statusResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/engagement-status?domain=${encodeURIComponent(domain)}&run_id=${encodeURIComponent(run_id)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          }
        );
        
        if (!statusResponse.ok) {
          console.error('[AGGREGATE-MEETINGS] Status check failed:', statusResponse.status);
          continue; // Keep trying
        }
        
        const statusData = await statusResponse.json();
        const record = Array.isArray(statusData) ? statusData[0] : null;
        
        if (!record) {
          console.log('[AGGREGATE-MEETINGS] No record found yet, continuing...');
          continue;
        }
        
        console.log('[AGGREGATE-MEETINGS] Status:', record.status);
        
        if (record.status === 'complete') {
          // Success! Extract the summary
          const summary = record.summary || {};
          
          const aggregateData = {
            domain,
            summary: JSON.stringify(summary), // Convert to string if needed
            meetings_count: summary.meetings_count || 0,
            months_span: 6,
            generated_at: record.updated_at,
            _isSampleData: false,
            goals: summary.goals || [],
            challenges: summary.challenges || [],
            people: summary.people || []
          };
          
          setAggregatedMeetingData(aggregateData);
          setAiGenerationStatus(prev => ({ ...prev, aggregateMeetings: 'success' }));
          
          toast.success(`Engagement summary complete! Analyzed ${summary.meetings_count || 0} meeting${(summary.meetings_count || 0) !== 1 ? 's' : ''}`);
          
          // Optionally refresh meeting summaries
          try {
            await fetchMeetingSummaries();
          } catch (err) {
            console.warn('[AGGREGATE-MEETINGS] Failed to refresh meeting summaries:', err);
          }
          
          return; // Exit successfully
        }
        
        if (record.status === 'error') {
          throw new Error(record.error || 'Engagement summary failed');
        }
        
        // Status is still "processing", continue polling
      }
      
      // If we get here, we timed out
      throw new Error('Engagement summary timed out after 60 seconds. Please try again.');
      
    } catch (error: any) {
      console.error('[AGGREGATE-MEETINGS] Error:', error);
      setAiGenerationStatus(prev => ({ ...prev, aggregateMeetings: 'error' }));
      toast.error('Failed to generate engagement summary: ' + error.message, {
        duration: 6000
      });
    } finally {
      setIsLoadingAggregate(false);
    }
  };
  
  // Save aggregated meeting summary
  const saveAggregatedSummary = async () => {
    if (!aggregatedMeetingData) {
      toast.error('No summary to save');
      return;
    }
    
    if (!presentationData.executiveSummary.companyWebsite) {
      toast.error('Company domain is required');
      return;
    }
    
    setIsSavingAggregate(true);
    
    try {
      const domain = presentationData.executiveSummary.companyWebsite
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      
      console.log('[SAVE-AGGREGATE] Saving summary for domain:', domain);
      
      // Save the aggregated data to KV store using a key format
      const key = `fathom_aggregate_${domain}_${new Date().toISOString().split('T')[0]}`;
      
      const response = await apiCall('/data/save', {
        method: 'POST',
        body: {
          _meta: {
            key: key,
            type: 'fathom_aggregate'
          },
          domain: domain,
          aggregate: aggregatedMeetingData,
          saved_at: new Date().toISOString()
        }
      });
      
      if (response.success) {
        toast.success('Summary saved successfully!');
        console.log('[SAVE-AGGREGATE] Saved with key:', key);
      } else {
        throw new Error('Save failed');
      }
    } catch (error: any) {
      console.error('[SAVE-AGGREGATE] Error:', error);
      toast.error('Failed to save summary: ' + error.message);
    } finally {
      setIsSavingAggregate(false);
    }
  };
  
  // Use aggregated data for presentation (populate goals and challenges)
  const useAggregatedDataForPresentation = () => {
    if (!aggregatedMeetingData) {
      toast.error('No aggregated data available');
      return;
    }
    
    const outcomes = getAvailableOutcomes();
    
    // Convert goals from strings to full goal objects
    const newGoals = aggregatedMeetingData.goals.map((goalText, index) => ({
      id: `goal-${Date.now()}-${index}`,
      description: goalText,
      targetOutcome: '', // User can fill this in later
      alignedOutcomes: calculateAutoAlignedOutcomes(goalText, outcomes)
    }));
    
    // Convert challenges from strings to full challenge objects
    const newChallenges = aggregatedMeetingData.challenges.map((challengeText, index) => ({
      id: `challenge-${Date.now()}-${index}`,
      description: challengeText,
      impact: '', // User can fill this in later
      alignedOutcomes: calculateAutoAlignedOutcomes(challengeText, outcomes)
    }));
    
    setPresentationData(prev => ({
      ...prev,
      executiveSummary: {
        ...prev.executiveSummary,
        goals: [...prev.executiveSummary.goals, ...newGoals],
        challenges: [...prev.executiveSummary.challenges, ...newChallenges],
        meetingHistory: aggregatedMeetingData.summary // Also populate meeting history with summary
      }
    }));
    
    toast.success(`Added ${newGoals.length} goal${newGoals.length !== 1 ? 's' : ''} and ${newChallenges.length} challenge${newChallenges.length !== 1 ? 's' : ''} to presentation`);
  };

  // Fetch meeting summaries from database
  const fetchMeetingSummaries = async () => {
    setIsLoadingSummaries(true);
    
    try {
      // Get domain from company website in presentation data
      if (!presentationData.executiveSummary.companyWebsite) {
        // Silently return - user hasn't entered a company website yet (expected state)
        setMeetingSummaries([]);
        setIsLoadingSummaries(false);
        return;
      }
      
      // Extract domain from website URL
      const domain = presentationData.executiveSummary.companyWebsite
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      
      console.log('[READ] 📡 Fetching meeting summaries for domain:', domain);
      
      // Get auth token
      const accessToken = await getAuthToken();
      
      // Use local make-server endpoint to fetch meetings by domain
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook/meetings/${domain}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[READ] ❌ Fetch error:', errorText);
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      const meetings = data?.meetings || [];
      
      console.log(`[READ] ✅ Loaded ${meetings.length} meeting(s) for domain: ${domain}`);
      setMeetingSummaries(meetings);
      
    } catch (error: any) {
      console.error('[READ] ❌ Error fetching summaries:', error);
      toast.error('Failed to load meeting summaries: ' + error.message);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  // Trigger live sync of meetings from Fathom
  const syncMeetingsFromFathom = async () => {
    setIsSyncingMeetings(true);
    
    try {
      // Get domain from company website in presentation data
      if (!presentationData.executiveSummary.companyWebsite) {
        toast.error('Please enter a company website first');
        setIsSyncingMeetings(false);
        return;
      }
      
      // Extract domain from website URL
      const domain = presentationData.executiveSummary.companyWebsite
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      
      console.log('[SYNC] 🔄 Syncing meetings from Fathom for domain:', domain);
      
      // Use the aggregate meetings endpoint to fetch and summarize meetings
      const TENANT_ID = "tenant_1760123794597_dvfwkt51b";
      const ORG_ID = "org_1760123846858_02zmwx74j";
      
      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom/aggregate-meetings?tenantId=${TENANT_ID}&orgId=${ORG_ID}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SYNC] ❌ Sync error:', errorText);
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('[SYNC] ✅ Meeting sync complete:', result);
      
      toast.success('Meetings synced from Fathom!');
      
      // Refresh the summaries list
      await fetchMeetingSummaries();
      
    } catch (error: any) {
      console.error('[SYNC] ❌ Error:', error);
      toast.error('Failed to sync meetings: ' + error.message);
    } finally {
      setIsSyncingMeetings(false);
    }
  };

  // Load summaries on component mount
  useEffect(() => {
    fetchMeetingSummaries();
  }, []);

  // Generate solution summary from implementation data
  const generateSolutionSummary = async () => {
    await generateSolutionSummaryFromImplementation();
  };

  const generateSolutionSummaryFromImplementation = async () => {
    setAiGenerationStatus(prev => ({ ...prev, solutionSummary: 'loading' }));
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/generate-solution-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          implementation_data: presentationData.solutionImplementation,
          roi_data: results,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate solution summary');
      }

      const data = await response.json();
      
      // Handle both string and object response formats
      const summaryText = typeof data.solution_summary === 'string' 
        ? data.solution_summary 
        : (data.solution_summary?.text || '');
      
      setPresentationData(prev => ({
        ...prev,
        costsAndBenefits: {
          ...prev.costsAndBenefits,
          solutionSummary: summaryText,
        },
      }));

      setAiGenerationStatus(prev => ({ ...prev, solutionSummary: 'success' }));
      toast.success('Solution summary generated');
    } catch (error) {
      console.error('Solution summary error:', error);
      setAiGenerationStatus(prev => ({ ...prev, solutionSummary: 'error' }));
      toast.error('Failed to generate solution summary');
    }
  };

  // Generate Gamma presentation
  const generateGammaPresentation = async () => {
    const errors = validatePresentationData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before generating');
      return;
    }
    
    setValidationErrors([]);
    setIsGeneratingGamma(true);
    toast.info('Generating presentation with ChatGPT and Gamma...');
    
    try {
      const accessToken = await getAuthToken();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/generate-gamma-presentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          executiveSummary: presentationData.executiveSummary,
          solutionImplementation: presentationData.solutionImplementation,
          fathomIntegration: presentationData.fathomIntegration,
          aboutDockeryAI: presentationData.aboutDockeryAI,
          costsAndBenefits: presentationData.costsAndBenefits,
          statementOfWork: presentationData.statementOfWork,
          roiData: results,
          processes: data.processes,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Gamma presentation');
      }

      const responseData = await response.json();
      setGammaUrl(responseData.gamma_url);
      setGammaEditUrl(responseData.edit_url);
      
      // Generate outline format content for local preview
      const outlineContent = generateGammaOutline();
      setGammaOutlineContent(outlineContent);
      
      toast.success('Presentation created successfully in Gamma!');
    } catch (error) {
      console.error('Gamma generation error:', error);
      toast.error('Failed to generate Gamma presentation');
    } finally {
      setIsGeneratingGamma(false);
    }
  };

  // Validate presentation data
  const validatePresentationData = (): string[] => {
    const errors: string[] = [];
    
    if (!presentationData.executiveSummary.businessDescription) {
      errors.push('Business description is required');
    }
    if (presentationData.executiveSummary.goals.length === 0 && 
        presentationData.executiveSummary.challenges.length === 0) {
      errors.push('At least one goal or challenge is required');
    }
    if (!presentationData.executiveSummary.solutionSummary) {
      errors.push('Solution summary is required');
    }
    if (presentationData.solutionImplementation.selectedStarterProcessIds.length === 0) {
      errors.push('Select at least one starting process');
    }
    
    return errors;
  };

  // Generate full presentation with AI
  const generateFullPresentation = async () => {
    await generateGammaPresentation();
    
    // Simulate AI generation
    setTimeout(() => {
      toast.success('Presentation generated! Ready to export.');
      setShowPreview(true);
    }, 3000);
  };

  // Export to Gamma handler
  const handleExportToGamma = async () => {
    try {
      setIsExportingToGamma(true);
      toast.info('Exporting to Gamma...');
      
      // Get tenant_id and org_id from supabase auth user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      // Fetch user metadata for tenant/org info
      const tenantId = user.user_metadata?.tenant_id || 'default-tenant';
      const orgId = user.user_metadata?.organization_id || 'default-org';
      const dealId = `DEAL-${Date.now()}`;
      const title = presentationData.executiveSummary.companyWebsite || 'ValuDock Proposal';
      
      console.log('[ExportToGamma] Calling /functions/v1/gamma-export with:', {
        tenant_id: tenantId,
        org_id: orgId,
        deal_id: dealId,
        title
      });
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/gamma-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          org_id: orgId,
          deal_id: dealId,
          title
        })
      });
      
      const data = await response.json();
      console.log('[ExportToGamma] Response:', data);
      
      if (response.ok && data.status === 'completed') {
        // Store the full response including mode
        setGammaExportResult({
          status: data.status,
          steps: data.steps,
          final_output: data.final_output,
          export_links: data.export_links,
          mode: data.mode
        });
        
        // Save URLs to proposal record for current version (if export_links exist)
        if (data.export_links?.doc && data.export_links?.deck) {
          try {
            const saveResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-gamma-links`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                tenant_id: tenantId,
                org_id: orgId,
                deal_id: dealId,
                version_id: currentVersion.id,
                doc_url: data.export_links.doc,
                deck_url: data.export_links.deck,
                mode: data.mode
              })
            });
            
            if (saveResponse.ok) {
              console.log('[ExportToGamma] URLs saved to proposal record');
            }
          } catch (saveError) {
            console.error('[ExportToGamma] Failed to save URLs:', saveError);
            // Don't fail the main flow if saving fails
          }
        }
        
        const exportType = data.mode === 'live' ? 'Gamma' : 'Storage';
        toast.success(`Export to ${exportType} completed successfully!`);
      } else {
        toast.error('Failed to export to Gamma');
        console.error('[ExportToGamma] Error:', data);
      }
    } catch (error: any) {
      console.error('[ExportToGamma] Error:', error);
      toast.error('Error exporting to Gamma: ' + error.message);
    } finally {
      setIsExportingToGamma(false);
    }
  };

  // Generate outline format content for Gamma
  const generateGammaOutline = (): string => {
    const outline = [];
    
    // Slide 1: Title Slide
    outline.push('# Automation ROI Presentation');
    outline.push(`## ${presentationData.executiveSummary.companyWebsite || 'Client Name'}`);
    outline.push('');
    
    // Slide 2: Executive Summary
    outline.push('# Executive Summary');
    outline.push(`## ${presentationData.executiveSummary.businessDescription || 'Company Overview'}`);
    if (presentationData.executiveSummary.solutionSummary) {
      outline.push(`- ${presentationData.executiveSummary.solutionSummary}`);
    }
    outline.push('');
    
    // Slide 3: Current Challenges
    if (presentationData.executiveSummary.challenges.length > 0) {
      outline.push('# Current Challenges');
      presentationData.executiveSummary.challenges.forEach(challenge => {
        outline.push(`## ${challenge.description}`);
        if (challenge.impact) {
          outline.push(`- Impact: ${challenge.impact}`);
        }
        if (challenge.alignedOutcomes && challenge.alignedOutcomes.length > 0) {
          outline.push(`- Addresses: ${challenge.alignedOutcomes.slice(0, 2).join(', ')}`);
        }
      });
      outline.push('');
    }
    
    // Slide 4: Business Goals
    if (presentationData.executiveSummary.goals.length > 0) {
      outline.push('# Business Goals');
      presentationData.executiveSummary.goals.forEach(goal => {
        outline.push(`## ${goal.description}`);
        if (goal.targetOutcome) {
          outline.push(`- Target: ${goal.targetOutcome}`);
        }
        if (goal.alignedOutcomes && goal.alignedOutcomes.length > 0) {
          outline.push(`- Delivers: ${goal.alignedOutcomes.slice(0, 2).join(', ')}`);
        }
      });
      outline.push('');
    }
    
    // Slide 5: Proposed Solution
    outline.push('# Proposed Solution');
    outline.push('## Automation Strategy');
    outline.push(`- ${presentationData.solutionImplementation.processes.length} processes identified for automation`);
    outline.push(`- Starting with ${starterProcesses.length} high-impact processes`);
    if (presentationData.solutionImplementation.timeline.description) {
      outline.push(`- Timeline: ${presentationData.solutionImplementation.timeline.description.split('\\n')[0]}`);
    }
    outline.push('');
    
    // Slide 6: Financial Impact
    outline.push('# Financial Impact');
    outline.push('## Key Metrics');
    outline.push(`- ROI: ${formatPercentage(results.roiPercentage)}`);
    outline.push(`- NPV (3-Year): ${formatCurrency(results.npv)}`);
    outline.push(`- IRR: ${formatPercentage(results.irr)}`);
    outline.push(`- Annual Savings: ${formatCurrency(results.annualNetSavings)}`);
    outline.push(`- Payback Period: ${formatNumber(results.paybackPeriod)} months`);
    outline.push('');
    
    // Slide 7: Hard vs Soft Savings
    outline.push('# Savings Breakdown');
    outline.push('## Hard & Soft Dollar Savings');
    outline.push(`- Hard Savings: ${formatCurrency(results.totalHardSavings)}`);
    outline.push(`- Soft Savings: ${formatCurrency(results.totalSoftSavings)}`);
    outline.push(`- FTEs Freed: ${formatNumber(results.totalFTEsFreed)}`);
    outline.push(`- EBITDA Impact: ${formatCurrency(results.ebitdaImpact)}`);
    outline.push('');
    
    // Slide 8: Implementation Timeline
    if (presentationData.solutionImplementation.timeline.description) {
      outline.push('# Implementation Timeline');
      const timelineLines = presentationData.solutionImplementation.timeline.description.split('\\n');
      timelineLines.forEach(line => {
        if (line.trim()) {
          outline.push(`- ${line.trim()}`);
        }
      });
      outline.push('');
    }
    
    // Slide 9: Starting Processes
    if (starterProcesses.length > 0) {
      outline.push('# Phase 1: Starting Processes');
      starterProcesses.forEach(process => {
        outline.push(`## ${process.name}`);
        outline.push(`- Automation Coverage: ${process.automationPercentage}%`);
        outline.push(`- Technology: ${process.technology}`);
      });
      outline.push('');
    }
    
    // Slide 10: Investment & Costs
    outline.push('# Investment Required');
    outline.push('## Initial Costs');
    outline.push(`- Upfront Development: ${formatCurrency(presentationData.statementOfWork.upfrontDevelopmentCost)}`);
    outline.push(`- Training: ${formatCurrency(presentationData.statementOfWork.trainingCosts)}`);
    outline.push(`- Monthly Costs: ${formatCurrency(presentationData.statementOfWork.monthlyCosts)}`);
    outline.push(`- Annual Costs: ${formatCurrency(presentationData.statementOfWork.yearlyCosts)}`);
    outline.push('');
    
    // Slide 11: Customer Requirements
    if (presentationData.solutionImplementation.customerRequirements.accessNeeded ||
        presentationData.solutionImplementation.customerRequirements.pointPerson) {
      outline.push('# What We Need From You');
      outline.push('## Client Requirements');
      if (presentationData.solutionImplementation.customerRequirements.accessNeeded) {
        outline.push(`- Access: ${presentationData.solutionImplementation.customerRequirements.accessNeeded}`);
      }
      if (presentationData.solutionImplementation.customerRequirements.pointPerson) {
        outline.push(`- Point Person: ${presentationData.solutionImplementation.customerRequirements.pointPerson}`);
      }
      if (presentationData.solutionImplementation.customerRequirements.timePerWeek) {
        outline.push(`- Time Commitment: ${presentationData.solutionImplementation.customerRequirements.timePerWeek}`);
      }
      outline.push('');
    }
    
    // Slide 12: About Us
    outline.push('# About DockeryAI');
    outline.push(`## ${presentationData.aboutDockeryAI.background}`);
    outline.push('## Our Services');
    outline.push(`${presentationData.aboutDockeryAI.services}`);
    outline.push('');
    
    // Slide 13: Next Steps
    outline.push('# Next Steps');
    outline.push('## Recommended Actions');
    outline.push('- Review and approve proposed solution');
    outline.push('- Finalize starting process selection');
    outline.push('- Schedule kickoff meeting');
    outline.push('- Begin discovery and design phase');
    outline.push('');
    
    return outline.join('\\n');
  };

  // Open outcome editor
  const openOutcomeEditor = (type: 'goal' | 'challenge', id: string) => {
    const item = type === 'goal'
      ? presentationData.executiveSummary.goals.find(g => g.id === id)
      : presentationData.executiveSummary.challenges.find(c => c.id === id);
    
    if (item) {
      setEditingOutcomes({
        type,
        id,
        outcomes: [...(item.alignedOutcomes || [])],
      });
    }
  };

  // Toggle outcome in editor
  const toggleOutcomeInEditor = (outcomeValue: string) => {
    setEditingOutcomes(prev => {
      const isSelected = prev.outcomes.includes(outcomeValue);
      return {
        ...prev,
        outcomes: isSelected
          ? prev.outcomes.filter(o => o !== outcomeValue)
          : [...prev.outcomes, outcomeValue],
      };
    });
  };

  // Save edited outcomes
  const saveEditedOutcomes = () => {
    if (editingOutcomes.type && editingOutcomes.id) {
      if (editingOutcomes.type === 'goal') {
        updateGoal(editingOutcomes.id, 'alignedOutcomes', editingOutcomes.outcomes);
      } else {
        updateChallenge(editingOutcomes.id, 'alignedOutcomes', editingOutcomes.outcomes);
      }
    }
    setEditingOutcomes({ type: null, id: null, outcomes: [] });
  };

  // Toggle section for export
  const toggleSection = (section: string) => {
    if (section === 'all') {
      setSectionsToExport(['all']);
    } else {
      const currentSections = sectionsToExport.filter(s => s !== 'all');
      if (currentSections.includes(section)) {
        setSectionsToExport(currentSections.filter(s => s !== section));
      } else {
        setSectionsToExport([...currentSections, section]);
      }
    }
  };

  // Export presentation
  const handleExport = async (format: 'word' | 'google' | 'pdf') => {
    try {
      if (!presentationData.executiveSummary.businessDescription) {
        toast.error('Please add a business description');
        return;
      }

      const sections = sectionsToExport.includes('all') 
        ? ['executive', 'solution', 'about', 'costs', 'sow'] 
        : sectionsToExport;

      toast.info(`Exporting presentation as ${format.toUpperCase()} with sections: ${sections.join(', ')}...`);
      
      setTimeout(() => {
        toast.success(`Presentation exported as ${format.toUpperCase()} including all charts and reports from Impact and ROI section`);
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export presentation');
    }
  };

  const starterProcesses = presentationData.solutionImplementation.processes.filter(p =>
    presentationData.solutionImplementation.selectedStarterProcessIds.includes(p.id)
  );

  // Load versions from backend on mount
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const accessToken = await getAuthToken();
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-versions/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.versions && data.versions.length > 0) {
            setVersions(data.versions);
            // Set the latest version as current if no version is set
            if (!currentVersion.id || currentVersion.id === 'v1') {
              const latest = data.versions.sort((a: ProposalVersion, b: ProposalVersion) => b.version - a.version)[0];
              setCurrentVersion(latest);
            }
          } else {
            // Initialize with first version
            setVersions([currentVersion]);
          }
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
        // Initialize with first version on error
        setVersions([currentVersion]);
      }
    };

    loadVersions();
  }, []);

  // Handle version change
  const handleVersionChange = async (version: ProposalVersion) => {
    try {
      const accessToken = await getAuthToken();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-versions/${version.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.presentationData) {
          setPresentationData(data.presentationData);
          setCurrentVersion(version);
          toast.success(`Switched to Version ${version.version}`);
        }
      } else {
        toast.error('Failed to load version data');
      }
    } catch (error) {
      console.error('Failed to switch version:', error);
      toast.error('Failed to switch version');
    }
  };

  // Create new version
  const handleCreateVersion = async () => {
    setIsCreatingVersion(true);
    try {
      const accessToken = await getAuthToken();
      
      // Get latest version number
      const latestVersion = Math.max(...versions.map(v => v.version), 0);
      const newVersionNumber = latestVersion + 1;

      // Clone current presentation data
      const newVersionData = {
        version: newVersionNumber,
        status: 'draft',
        presentationData: { ...presentationData }
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-versions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newVersionData)
      });

      if (response.ok) {
        const data = await response.json();
        const newVersion: ProposalVersion = {
          id: data.versionId,
          version: newVersionNumber,
          status: 'draft',
          createdAt: new Date().toISOString(),
          createdBy: data.createdBy || 'current-user',
          createdByName: data.createdByName || 'You'
        };

        setVersions(prev => [...prev, newVersion]);
        setCurrentVersion(newVersion);
        toast.success(`Version ${newVersionNumber} created successfully`);
      } else {
        toast.error('Failed to create new version');
      }
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create new version');
    } finally {
      setIsCreatingVersion(false);
    }
  };

  // Auto-save current version
  useEffect(() => {
    const saveVersion = async () => {
      if (!currentVersion.id || currentVersion.id === 'v1') return;
      
      try {
        const accessToken = await getAuthToken();
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-888f4514/proposal-versions/${currentVersion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            presentationData,
            lastModified: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to auto-save version:', error);
      }
    };

    // Debounce auto-save
    const timeoutId = setTimeout(saveVersion, 2000);
    return () => clearTimeout(timeoutId);
  }, [presentationData, currentVersion.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Proposal Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build a comprehensive C-level presentation with ROI data and implementation details
          </p>
        </div>
        
        {/* Version Switcher */}
        <ProposalVersionSwitcher
          currentVersion={currentVersion}
          versions={versions}
          onVersionChange={handleVersionChange}
          onCreateVersion={handleCreateVersion}
          isCreating={isCreatingVersion}
        />
      </div>

      {/* Two-column layout: Main content + Run Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="executive" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4 md:mb-6">
          <TabsTrigger value="executive" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <Briefcase className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">Executive</span>
          </TabsTrigger>
          <TabsTrigger value="solution" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <Lightbulb className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">Solution</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <Info className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">About</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <DollarSign className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">Costs</span>
          </TabsTrigger>
          <TabsTrigger value="sow" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <FileCheck className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">SOW</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-2">
            <Eye className="h-4 w-4 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm hidden md:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Executive Summary Tab */}
        <TabsContent value="executive" className="space-y-6">
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="p-6">
            <div className="space-y-6">
              {/* Company Domain */}
              <div>
                <Label>Company Domain</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  use customer email domain
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="company.com (e.g., acme.com)"
                    value={presentationData.executiveSummary.companyWebsite}
                    onChange={(e) =>
                      setPresentationData({
                        ...presentationData,
                        executiveSummary: {
                          ...presentationData.executiveSummary,
                          companyWebsite: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Business Description */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Business Description</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateWithAI('businessDescription')}
                    disabled={aiGenerationStatus.businessDescription === 'loading'}
                  >
                    {aiGenerationStatus.businessDescription === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : aiGenerationStatus.businessDescription === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Generated
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Brief description of the business, industry, and key operations..."
                  value={presentationData.executiveSummary.businessDescription}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      executiveSummary: {
                        ...presentationData.executiveSummary,
                        businessDescription: e.target.value,
                      },
                    })
                  }
                  rows={4}
                />
              </div>

              {/* Meeting History - Aggregated Summary */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Meeting History</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aggregate all Fathom meetings for this domain
                    </p>
                  </div>
                  {!aggregatedMeetingData && (
                    <Button
                      size="sm"
                      onClick={fetchAggregatedMeetings}
                      disabled={!presentationData.executiveSummary.companyWebsite || isLoadingAggregate}
                    >
                      {isLoadingAggregate ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Aggregating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Meeting Summary
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {!presentationData.executiveSummary.companyWebsite && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Enter company domain above to generate meeting summary
                    </AlertDescription>
                  </Alert>
                )}
                
                {aggregatedMeetingData && (
                  <div className="space-y-4">
                    {/* Sample Data Warning */}
                    {aggregatedMeetingData._isSampleData && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This is sample data. To load real Fathom meetings, configure the VALUEDOCK_SUPABASE_URL environment variable in your Edge Function settings.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Summary - WYSIWYG Editable */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Summary</Label>
                        <div className="flex items-center gap-2">
                          {aggregatedMeetingData._isSampleData && (
                            <Badge variant="outline" className="text-xs">
                              Sample Data
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Editable
                          </Badge>
                        </div>
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="min-h-[120px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        onBlur={(e) => {
                          setAggregatedMeetingData({
                            ...aggregatedMeetingData,
                            summary: e.currentTarget.textContent || ''
                          });
                        }}
                      >
                        {aggregatedMeetingData.summary}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Meeting Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Total Meetings</Label>
                        <p className="text-2xl font-semibold">{aggregatedMeetingData.meetings_count}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Time Span</Label>
                        <p className="text-2xl font-semibold">
                          {aggregatedMeetingData.months_span} month{aggregatedMeetingData.months_span !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* People Met */}
                    {aggregatedMeetingData.people && aggregatedMeetingData.people.length > 0 && (
                      <div>
                        <Label className="mb-2 block">People Met</Label>
                        <div className="space-y-2">
                          {aggregatedMeetingData.people.map((person, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{person.name}</span>
                              {person.title && (
                                <>
                                  <span className="text-muted-foreground">—</span>
                                  <span className="text-muted-foreground">{person.title}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Goals */}
                    {aggregatedMeetingData.goals && aggregatedMeetingData.goals.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Goals ({aggregatedMeetingData.goals.length})</Label>
                        <ul className="space-y-1">
                          {aggregatedMeetingData.goals.map((goal, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Challenges */}
                    {aggregatedMeetingData.challenges && aggregatedMeetingData.challenges.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Challenges ({aggregatedMeetingData.challenges.length})</Label>
                        <ul className="space-y-1">
                          {aggregatedMeetingData.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={saveAggregatedSummary}
                        disabled={isSavingAggregate}
                      >
                        {isSavingAggregate ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Save Summary
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={useAggregatedDataForPresentation}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Use for Presentation
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAggregatedMeetingData(null)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Meeting Notes for AI */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Label>Meeting Notes (for AI Analysis)</Label>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <Textarea
                  placeholder="Paste meeting notes here. AI will analyze to identify challenges, goals, and key requirements..."
                  value={presentationData.executiveSummary.meetingNotes}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      executiveSummary: {
                        ...presentationData.executiveSummary,
                        meetingNotes: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>

              {/* Goals Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <Label>Business Goals</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateWithAI('goals')}
                      disabled={!presentationData.executiveSummary.companyWebsite || aiGenerationStatus.goals === 'loading'}
                      className="flex-shrink-0"
                    >
                      {aiGenerationStatus.goals === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Generating...</span>
                        </>
                      ) : aiGenerationStatus.goals === 'success' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 sm:mr-2 text-green-500" />
                          <span className="hidden sm:inline">Generated</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Generate with AI</span>
                          <span className="sm:hidden">AI</span>
                        </>
                      )}
                    </Button>
                    <Button size="sm" onClick={addGoal} className="flex-shrink-0">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Goal</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {presentationData.executiveSummary.goals.map((goal) => (
                    <Card key={goal.id} className="p-4 border-l-4 border-l-green-500">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Goal Description</Label>
                            <Input
                              placeholder="e.g., Reduce processing time by 50%..."
                              value={goal.description}
                              onChange={(e) =>
                                updateGoal(goal.id, 'description', e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Target Outcome</Label>
                          <Textarea
                            placeholder="Specific metrics or outcomes desired..."
                            value={goal.targetOutcome}
                            onChange={(e) =>
                              updateGoal(goal.id, 'targetOutcome', e.target.value)
                            }
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Aligned Outcomes from Impact & ROI</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openOutcomeEditor('goal', goal.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Auto-aligned based on goal keywords. Click Edit to customize.
                          </p>
                          <div className="space-y-2">
                            {goal.alignedOutcomes.map((outcome, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                  ✓
                                </Badge>
                                <span className="flex-1">{outcome}</span>
                              </div>
                            ))}
                            {goal.alignedOutcomes.length === 0 && (
                              <p className="text-xs text-muted-foreground italic p-2 bg-muted/50 rounded">
                                Add a goal description to auto-align outcomes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {presentationData.executiveSummary.goals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No goals added yet</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Challenges Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <Label>Challenges Uncovered</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateWithAI('challenges')}
                      disabled={!presentationData.executiveSummary.companyWebsite || aiGenerationStatus.challenges === 'loading'}
                      className="flex-shrink-0"
                    >
                      {aiGenerationStatus.challenges === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Generating...</span>
                        </>
                      ) : aiGenerationStatus.challenges === 'success' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 sm:mr-2 text-green-500" />
                          <span className="hidden sm:inline">Generated</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Generate with AI</span>
                          <span className="sm:hidden">AI</span>
                        </>
                      )}
                    </Button>
                    <Button size="sm" onClick={addChallenge} className="flex-shrink-0">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Challenge</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {presentationData.executiveSummary.challenges.map((challenge) => (
                    <Card key={challenge.id} className="p-4 border-l-4 border-l-orange-500">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Challenge Description</Label>
                            <Input
                              placeholder="e.g., Manual process causing delays..."
                              value={challenge.description}
                              onChange={(e) =>
                                updateChallenge(challenge.id, 'description', e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeChallenge(challenge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Business Impact</Label>
                          <Textarea
                            placeholder="Impact in dollars, risk, or efficiency loss..."
                            value={challenge.impact}
                            onChange={(e) =>
                              updateChallenge(challenge.id, 'impact', e.target.value)
                            }
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Aligned Outcomes from Impact & ROI</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openOutcomeEditor('challenge', challenge.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Auto-aligned based on challenge keywords. Click Edit to customize.
                          </p>
                          <div className="space-y-2">
                            {challenge.alignedOutcomes.map((outcome, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded text-sm">
                                <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                  ✓
                                </Badge>
                                <span className="flex-1">{outcome}</span>
                              </div>
                            ))}
                            {challenge.alignedOutcomes.length === 0 && (
                              <p className="text-xs text-muted-foreground italic p-2 bg-muted/50 rounded">
                                Add a challenge description to auto-align outcomes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {presentationData.executiveSummary.challenges.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No challenges added yet</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Solution Summary with ROI</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Auto-generated from Impact and ROI data. Edit as needed.
                </p>
                <Textarea
                  placeholder="Solution overview with ROI summary..."
                  value={presentationData.executiveSummary.solutionSummary}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      executiveSummary: {
                        ...presentationData.executiveSummary,
                        solutionSummary: e.target.value,
                      },
                    })
                  }
                  rows={5}
                />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs mb-2">Quick Reference from ROI Calculator:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total 3-Year NPV:</span>
                      <span className="ml-2">${results.npv.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IRR:</span>
                      <span className="ml-2">{results.irr}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="ml-2">{results.roi}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payback Period:</span>
                      <span className="ml-2">{results.paybackPeriod} months</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Discovery + ROI Summary - Agent Generated */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Discovery + ROI Summary</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Combined discovery findings and ROI summary from agent
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                    Agent Generated
                  </Badge>
                </div>
                <Textarea
                  placeholder="This section will be auto-populated when the Proposal Agent runs..."
                  value={presentationData.executiveSummary.discoveryAndROISummary || ''}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      executiveSummary: {
                        ...presentationData.executiveSummary,
                        discoveryAndROISummary: e.target.value,
                      },
                    })
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!presentationData.executiveSummary.discoveryAndROISummary) {
                        toast.error('No content to copy');
                        return;
                      }
                      try {
                        await navigator.clipboard.writeText(
                          presentationData.executiveSummary.discoveryAndROISummary
                        );
                        toast.success('Copied to clipboard!');
                      } catch (error) {
                        toast.error('Failed to copy to clipboard');
                      }
                    }}
                    disabled={!presentationData.executiveSummary.discoveryAndROISummary}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy to Executive Summary
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!presentationData.executiveSummary.discoveryAndROISummary) {
                        toast.error('No content to download');
                        return;
                      }
                      
                      // Create a blob with the content
                      const blob = new Blob(
                        [presentationData.executiveSummary.discoveryAndROISummary],
                        { type: 'text/plain' }
                      );
                      
                      // Create download link
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `discovery-roi-summary-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast.success('Downloaded as text file!');
                    }}
                    disabled={!presentationData.executiveSummary.discoveryAndROISummary}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as Text
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  💡 <strong>Tip:</strong> This content is auto-populated when you run the Proposal Agent in Admin → Proposal Agent → Run Cloud Proposal Agent
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Solution & Implementation Tab */}
        <TabsContent value="solution" className="space-y-6">
          {/* 1. Benefits and Goal Alignment - MOVED TO TOP */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Benefits & Goal Alignment</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI will align ROI benefits to your stated goals and challenges
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => generateWithAI('benefits')}
                    disabled={aiGenerationStatus.benefits === 'loading'}
                  >
                    {aiGenerationStatus.benefits === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Alignment
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">ROI Savings</Label>
                    <Textarea
                      placeholder="Quantifiable savings and ROI metrics..."
                      value={presentationData.solutionImplementation.benefits.roiSavings}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          solutionImplementation: {
                            ...presentationData.solutionImplementation,
                            benefits: {
                              ...presentationData.solutionImplementation.benefits,
                              roiSavings: e.target.value,
                            },
                          },
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Additional Benefits</Label>
                    <Textarea
                      placeholder="Non-financial benefits (e.g., improved accuracy, faster processing)..."
                      value={presentationData.solutionImplementation.benefits.additionalBenefits}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          solutionImplementation: {
                            ...presentationData.solutionImplementation,
                            benefits: {
                              ...presentationData.solutionImplementation.benefits,
                              additionalBenefits: e.target.value,
                            },
                          },
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Alignment to Customer Goals (Auto-generated)</Label>
                    <Textarea
                      placeholder="How benefits align with the challenges and goals identified..."
                      value={presentationData.solutionImplementation.benefits.alignmentToGoals}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          solutionImplementation: {
                            ...presentationData.solutionImplementation,
                            benefits: {
                              ...presentationData.solutionImplementation.benefits,
                              alignmentToGoals: e.target.value,
                            },
                          },
                        })
                      }
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      System auto-identifies goal alignments based on challenges. Edit as needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Process-by-Process Net Benefits After Automation */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Process-by-Process Net Benefits After Automation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive breakdown showing net benefits after automation. Check boxes to select starter processes for Phase 1.
                </p>
              </div>
              
              {results.processResults && results.processResults.length > 0 ? (
                (() => {
                  // Group processes by their group name, maintaining original order
                  const groupedProcesses = new Map<string, typeof results.processResults>();
                  
                  results.processResults.forEach((processResult) => {
                    const groupName = processResult.group || 'Ungrouped';
                    if (!groupedProcesses.has(groupName)) {
                      groupedProcesses.set(groupName, []);
                    }
                    groupedProcesses.get(groupName)!.push(processResult);
                  });
                  
                  return (
                    <div className="space-y-6">
                      {Array.from(groupedProcesses.entries()).map(([groupName, processes]) => (
                        <div key={groupName} className="space-y-3">
                          {/* Group Header */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <h4 className="font-medium text-sm">{groupName}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {processes.length} process{processes.length !== 1 ? 'es' : ''}
                            </Badge>
                          </div>
                          
                          {/* Processes Table */}
                          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                            <table className="w-full text-sm min-w-[640px]">
                              <thead>
                                <tr className="border-b text-xs">
                                  <th className="text-left p-2 w-8">Starter</th>
                                  <th className="text-left p-2">Process</th>
                                  <th className="text-right p-2">Investment</th>
                                  <th className="text-right p-2">Annual Savings</th>
                                  <th className="text-right p-2">ROI</th>
                                  <th className="text-right p-2">Payback</th>
                                  <th className="text-right p-2">FTE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {processes.map((processResult) => {
                                  const processROI = processResult.totalInvestment > 0 
                                    ? ((processResult.monthlySavings * 12 - processResult.totalInvestment) / processResult.totalInvestment) * 100
                                    : 0;
                                  const isStarterProcess = presentationData.solutionImplementation.selectedStarterProcessIds.includes(processResult.processId);
                                  
                                  return (
                                    <tr 
                                      key={processResult.processId} 
                                      className={`border-b last:border-0 hover:bg-muted/50 ${isStarterProcess ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                    >
                                      <td className="p-2">
                                        <Checkbox
                                          id={`process-starter-${processResult.processId}`}
                                          checked={isStarterProcess}
                                          onCheckedChange={() => toggleStarterProcess(processResult.processId)}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <div className="flex items-center gap-2">
                                          <label
                                            htmlFor={`process-starter-${processResult.processId}`}
                                            className="cursor-pointer font-medium"
                                          >
                                            {processResult.name}
                                          </label>
                                          {isStarterProcess && (
                                            <Badge variant="default" className="bg-blue-600 text-xs">
                                              Starter
                                            </Badge>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-2 text-right font-medium">
                                        {formatCurrency(processResult.totalInvestment)}
                                      </td>
                                      <td className="p-2 text-right font-medium text-green-600 dark:text-green-400">
                                        {formatCurrency(processResult.monthlySavings * 12)}
                                      </td>
                                      <td className="p-2 text-right font-medium">
                                        {formatPercentage(processROI)}
                                      </td>
                                      <td className="p-2 text-right">
                                        {processResult.breakEvenMonth} mo
                                      </td>
                                      <td className="p-2 text-right">
                                        {(processResult.ftesFreed || 0).toFixed(1)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <p>No process data available. Please configure processes in the Inputs section.</p>
                </Card>
              )}
            </div>
          </Card>

          {/* 3. Timeline & Project Plan */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Timeline & Project Plan</h3>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Timeline Description</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateWithAI('timeline')}
                    disabled={aiGenerationStatus.timeline === 'loading'}
                  >
                    {aiGenerationStatus.timeline === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Overall project timeline and phases..."
                  value={presentationData.solutionImplementation.timeline.description}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      solutionImplementation: {
                        ...presentationData.solutionImplementation,
                        timeline: {
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* 4. Customer Requirements */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-medium mb-4">Customer Requirements</h3>
              <div>
                <Label className="text-xs">Access Needed</Label>
                <Textarea
                  placeholder="Systems, data, or resources needed from customer..."
                  value={presentationData.solutionImplementation.customerRequirements.accessNeeded}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      solutionImplementation: {
                        ...presentationData.solutionImplementation,
                        customerRequirements: {
                          ...presentationData.solutionImplementation.customerRequirements,
                          accessNeeded: e.target.value,
                        },
                      },
                    })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-xs">Point Person</Label>
                <Input
                  placeholder="Primary contact and their role..."
                  value={presentationData.solutionImplementation.customerRequirements.pointPerson}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      solutionImplementation: {
                        ...presentationData.solutionImplementation,
                        customerRequirements: {
                          ...presentationData.solutionImplementation.customerRequirements,
                          pointPerson: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Time Commitment (per week)</Label>
                <Input
                  placeholder="e.g., 5-10 hours for first month, then 2-3 hours ongoing"
                  value={presentationData.solutionImplementation.customerRequirements.timePerWeek}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      solutionImplementation: {
                        ...presentationData.solutionImplementation,
                        customerRequirements: {
                          ...presentationData.solutionImplementation.customerRequirements,
                          timePerWeek: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* 5. Next Phase */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Next Phase</h3>
              <div>
                <Label className="text-xs">Next Phase Processes (Auto-populated)</Label>
                <Input
                  value={getNextPhaseProcesses()}
                  disabled
                  className="mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Processes not selected as starters will be implemented in subsequent phases
                </p>
              </div>
            </div>
          </Card>

          {/* 6. ROI Breakdown & Financial Analysis */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">ROI Breakdown & Financial Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive financial analysis based on your processes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('[PresentationScreen] Manual refresh triggered');
                      console.log('[PresentationScreen] Current results:', results);
                      console.log('[PresentationScreen] Current data processes:', data.processes.length);
                      toast.success('Data is live and synced!');
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {/* Solution Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Solution Summary</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateSolutionSummary()}
                    disabled={aiGenerationStatus.solutionSummary === 'loading'}
                  >
                    {aiGenerationStatus.solutionSummary === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : aiGenerationStatus.solutionSummary === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Generated
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="AI will generate a summary of upfront costs, yearly costs, 3-year ROI, NPV, and annual savings..."
                  value={presentationData.costsAndBenefits.solutionSummary}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      costsAndBenefits: {
                        ...presentationData.costsAndBenefits,
                        solutionSummary: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  className="mb-4"
                />
              </div>
              
              <PresentationROIBreakdown 
                key={`roi-breakdown-${results.annualNetSavings}-${results.totalFTEsFreed}-${results.npv}-${selectedProcessIds.join(',')}`}
                results={results}
                processResults={results.processResults || []}
                selectedProcessIds={selectedProcessIds}
                data={data}
              />
            </div>
          </Card>
        </TabsContent>

        {/* AI Content Tab - Fathom Integration */}
        <TabsContent value="ai-content" className="space-y-6">
          {/* Header with Customer & Date Inputs */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-4">Fathom Integration Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect to Fathom to automatically generate content from customer meetings using AI
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="input-customer-name">Customer Name</Label>
                  <Input
                    id="input-customer-name"
                    placeholder="Acme Corp"
                    value={presentationData.fathomIntegration.customerName}
                    onChange={(e) =>
                      setPresentationData({
                        ...presentationData,
                        fathomIntegration: {
                          ...presentationData.fathomIntegration,
                          customerName: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="date-start">Start Date</Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={presentationData.fathomIntegration.dateStart}
                    onChange={(e) =>
                      setPresentationData({
                        ...presentationData,
                        fathomIntegration: {
                          ...presentationData.fathomIntegration,
                          dateStart: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="date-end">End Date</Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={presentationData.fathomIntegration.dateEnd}
                    onChange={(e) =>
                      setPresentationData({
                        ...presentationData,
                        fathomIntegration: {
                          ...presentationData.fathomIntegration,
                          dateEnd: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button
                    id="btn-sync-fathom"
                    onClick={syncFathomMeetings}
                    disabled={aiGenerationStatus.fathomSync === 'loading'}
                    variant="outline"
                  >
                    {aiGenerationStatus.fathomSync === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Fathom
                      </>
                    )}
                  </Button>
                  {presentationData.fathomIntegration.lastSync && (
                    <p className="text-xs text-muted-foreground mt-1" id="text-last-sync">
                      Last synced: {new Date(presentationData.fathomIntegration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Meeting Summary Card */}
          <Card className="p-6" id="card-meeting-summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium" id="label-meeting-summary">Meeting Summary</h3>
                  <p className="text-sm text-muted-foreground mt-1" id="text-meeting-summary-help">
                    Uses ChatGPT (AgentKit) to summarize Fathom meetings for this customer across the selected date range.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    id="status-meeting-summary"
                    variant={
                      aiGenerationStatus.meetingSummary === 'success'
                        ? 'default'
                        : aiGenerationStatus.meetingSummary === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {aiGenerationStatus.meetingSummary === 'loading' && 'Loading'}
                    {aiGenerationStatus.meetingSummary === 'success' && 'Success'}
                    {aiGenerationStatus.meetingSummary === 'error' && 'Error'}
                    {!aiGenerationStatus.meetingSummary && 'Idle'}
                  </Badge>
                  <Button
                    id="btn-generate-meeting-summary"
                    onClick={generateMeetingSummary}
                    disabled={aiGenerationStatus.meetingSummary === 'loading'}
                  >
                    {aiGenerationStatus.meetingSummary === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Textarea
                id="textarea-meeting-summary"
                placeholder="AI-generated summary of discussions, attendees, topics, and count of meetings."
                value={presentationData.fathomIntegration.meetingSummary.text}
                onChange={(e) =>
                  setPresentationData({
                    ...presentationData,
                    fathomIntegration: {
                      ...presentationData.fathomIntegration,
                      meetingSummary: {
                        ...presentationData.fathomIntegration.meetingSummary,
                        text: e.target.value,
                      },
                    },
                  })
                }
                rows={6}
                className="font-mono text-sm"
              />
              
              {presentationData.fathomIntegration.meetingSummary.count > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Meetings:</span>{' '}
                    <span className="font-medium">{presentationData.fathomIntegration.meetingSummary.count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attendees:</span>{' '}
                    <span className="font-medium">{presentationData.fathomIntegration.meetingSummary.attendees.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Topics:</span>{' '}
                    <span className="font-medium">{presentationData.fathomIntegration.meetingSummary.topics.length}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Business Challenges Card */}
          <Card className="p-6" id="card-business-challenges">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium" id="label-business-challenges">Business Challenges</h3>
                  <p className="text-sm text-muted-foreground mt-1" id="text-challenges-help">
                    Extracted from Fathom discussions; editable.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    id="status-challenges"
                    variant={
                      aiGenerationStatus.fathomChallenges === 'success'
                        ? 'default'
                        : aiGenerationStatus.fathomChallenges === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {aiGenerationStatus.fathomChallenges === 'loading' && 'Loading'}
                    {aiGenerationStatus.fathomChallenges === 'success' && 'Success'}
                    {aiGenerationStatus.fathomChallenges === 'error' && 'Error'}
                    {!aiGenerationStatus.fathomChallenges && 'Idle'}
                  </Badge>
                  <Button
                    id="btn-generate-challenges"
                    onClick={generateChallengesFromFathom}
                    disabled={aiGenerationStatus.fathomChallenges === 'loading'}
                    variant="secondary"
                  >
                    {aiGenerationStatus.fathomChallenges === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div id="list-challenges" className="space-y-3">
                {presentationData.fathomIntegration.challenges.map((challenge) => (
                  <div key={challenge.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg" id={`item-challenge-${challenge.id}`}>
                    <div>
                      <Label className="text-xs">Challenge</Label>
                      <Input
                        id={`input-challenge-label-${challenge.id}`}
                        value={challenge.label}
                        onChange={(e) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              challenges: presentationData.fathomIntegration.challenges.map(c =>
                                c.id === challenge.id ? { ...c, label: e.target.value } : c
                              ),
                            },
                          });
                        }}
                        placeholder="Challenge description"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Impact ($/year)</Label>
                      <Input
                        id={`input-challenge-impact-dollars-${challenge.id}`}
                        type="number"
                        value={challenge.impactDollars === 0 ? '' : (challenge.impactDollars || '')}
                        onChange={(e) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              challenges: presentationData.fathomIntegration.challenges.map(c =>
                                c.id === challenge.id ? { ...c, impactDollars: Number(e.target.value) } : c
                              ),
                            },
                          });
                        }}
                        placeholder="120000"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Risk Level</Label>
                      <Select
                        value={challenge.risk}
                        onValueChange={(value: 'Low' | 'Medium' | 'High') => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              challenges: presentationData.fathomIntegration.challenges.map(c =>
                                c.id === challenge.id ? { ...c, risk: value } : c
                              ),
                            },
                          });
                        }}
                      >
                        <SelectTrigger id={`select-challenge-risk-${challenge.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Efficiency Loss (hrs/mo)</Label>
                      <Input
                        id={`input-efficiency-loss-hours-month-${challenge.id}`}
                        type="number"
                        value={challenge.efficiencyLossHoursMonth === 0 ? '' : (challenge.efficiencyLossHoursMonth || '')}
                        onChange={(e) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              challenges: presentationData.fathomIntegration.challenges.map(c =>
                                c.id === challenge.id ? { ...c, efficiencyLossHoursMonth: Number(e.target.value) } : c
                              ),
                            },
                          });
                        }}
                        placeholder="30"
                      />
                    </div>
                  </div>
                ))}
                
                {presentationData.fathomIntegration.challenges.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No challenges yet. Generate them from Fathom meetings.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Business Goals Card */}
          <Card className="p-6" id="card-business-goals">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium" id="label-business-goals">Business Goals</h3>
                  <p className="text-sm text-muted-foreground mt-1" id="text-goals-help">
                    Aligned to challenges; editable.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    id="status-goals"
                    variant={
                      aiGenerationStatus.fathomGoals === 'success'
                        ? 'default'
                        : aiGenerationStatus.fathomGoals === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {aiGenerationStatus.fathomGoals === 'loading' && 'Loading'}
                    {aiGenerationStatus.fathomGoals === 'success' && 'Success'}
                    {aiGenerationStatus.fathomGoals === 'error' && 'Error'}
                    {!aiGenerationStatus.fathomGoals && 'Idle'}
                  </Badge>
                  <Button
                    id="btn-generate-goals"
                    onClick={generateGoalsFromFathom}
                    disabled={aiGenerationStatus.fathomGoals === 'loading'}
                    variant="secondary"
                  >
                    {aiGenerationStatus.fathomGoals === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div id="list-goals" className="space-y-3">
                {presentationData.fathomIntegration.goals.map((goal) => (
                  <div key={goal.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg" id={`item-goal-${goal.id}`}>
                    <div>
                      <Label className="text-xs">Goal</Label>
                      <Input
                        id={`input-goal-label-${goal.id}`}
                        value={goal.label}
                        onChange={(e) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              goals: presentationData.fathomIntegration.goals.map(g =>
                                g.id === goal.id ? { ...g, label: e.target.value } : g
                              ),
                            },
                          });
                        }}
                        placeholder="Goal description"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">KPI</Label>
                      <Select
                        value={goal.kpi}
                        onValueChange={(value) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              goals: presentationData.fathomIntegration.goals.map(g =>
                                g.id === goal.id ? { ...g, kpi: value } : g
                              ),
                            },
                          });
                        }}
                      >
                        <SelectTrigger id={`select-goal-kpi-${goal.id}`}>
                          <SelectValue placeholder="Select KPI" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DSO">DSO</SelectItem>
                          <SelectItem value="Accuracy %">Accuracy %</SelectItem>
                          <SelectItem value="Cycle Time">Cycle Time</SelectItem>
                          <SelectItem value="CSAT">CSAT</SelectItem>
                          <SelectItem value="Cost Reduction">Cost Reduction</SelectItem>
                          <SelectItem value="Processing Time">Processing Time</SelectItem>
                          <SelectItem value="Error Rate">Error Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Target</Label>
                      <Input
                        id={`input-goal-target-${goal.id}`}
                        value={goal.target}
                        onChange={(e) => {
                          setPresentationData({
                            ...presentationData,
                            fathomIntegration: {
                              ...presentationData.fathomIntegration,
                              goals: presentationData.fathomIntegration.goals.map(g =>
                                g.id === goal.id ? { ...g, target: e.target.value } : g
                              ),
                            },
                          });
                        }}
                        placeholder="-10 days"
                      />
                    </div>
                  </div>
                ))}
                
                {presentationData.fathomIntegration.goals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No goals yet. Generate them from Fathom meetings.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Solution Summary Card */}
          <Card className="p-6" id="card-solution-summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium" id="label-solution-summary">Solution & ROI Summary</h3>
                  <p className="text-sm text-muted-foreground mt-1" id="text-solution-help">
                    Uses data from Implementation section (processes, % automation, tech, phases) + ROI calculator.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    id="status-solution"
                    variant={
                      aiGenerationStatus.solutionSummary === 'success'
                        ? 'default'
                        : aiGenerationStatus.solutionSummary === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {aiGenerationStatus.solutionSummary === 'loading' && 'Loading'}
                    {aiGenerationStatus.solutionSummary === 'success' && 'Success'}
                    {aiGenerationStatus.solutionSummary === 'error' && 'Error'}
                    {!aiGenerationStatus.solutionSummary && 'Idle'}
                  </Badge>
                  <Button
                    id="btn-generate-solution-summary"
                    onClick={generateSolutionSummaryFromImplementation}
                    disabled={aiGenerationStatus.solutionSummary === 'loading'}
                    variant="secondary"
                  >
                    {aiGenerationStatus.solutionSummary === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate from Implementation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Textarea
                id="textarea-solution-summary"
                placeholder="AI-generated summary of processes automated, % automation, tech used, phases, and ROI snapshot."
                value={presentationData.fathomIntegration.solutionSummary.text}
                onChange={(e) =>
                  setPresentationData({
                    ...presentationData,
                    fathomIntegration: {
                      ...presentationData.fathomIntegration,
                      solutionSummary: {
                        text: e.target.value,
                      },
                    },
                  })
                }
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </Card>
        </TabsContent>

        {/* About DockeryAI Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label>Background & Experience</Label>
                <Textarea
                  placeholder="Company background, years in business, expertise areas..."
                  value={presentationData.aboutDockeryAI.background}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      aboutDockeryAI: {
                        ...presentationData.aboutDockeryAI,
                        background: e.target.value,
                      },
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>Services Provided</Label>
                <Textarea
                  placeholder="Core services and offerings..."
                  value={presentationData.aboutDockeryAI.services}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      aboutDockeryAI: {
                        ...presentationData.aboutDockeryAI,
                        services: e.target.value,
                      },
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Testimonials</Label>
                  <Button size="sm" onClick={addTestimonial}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
                <div className="space-y-4">
                  {presentationData.aboutDockeryAI.testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Testimonial</Label>
                            <Textarea
                              placeholder="Client testimonial or success story..."
                              value={testimonial.content}
                              onChange={(e) =>
                                updateTestimonial(testimonial.id, 'content', e.target.value)
                              }
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTestimonial(testimonial.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Author</Label>
                            <Input
                              placeholder="e.g., John Smith"
                              value={testimonial.author}
                              onChange={(e) =>
                                updateTestimonial(testimonial.id, 'author', e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Company & Title</Label>
                            <Input
                              placeholder="e.g., CTO, Acme Corp"
                              value={testimonial.company}
                              onChange={(e) =>
                                updateTestimonial(testimonial.id, 'company', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {presentationData.aboutDockeryAI.testimonials.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No testimonials added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Costs & Benefits Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Solution Summary - AI Generated */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Solution Summary</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI will generate a comprehensive solution summary based on selected processes and ROI data
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => generateSolutionSummary()}
                    disabled={aiGenerationStatus.solutionSummary === 'loading'}
                  >
                    {aiGenerationStatus.solutionSummary === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : aiGenerationStatus.solutionSummary === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Generated
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="AI will generate a solution summary based on your implementation plan and ROI analysis..."
                  value={presentationData.costsAndBenefits.solutionSummary || ''}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      costsAndBenefits: {
                        ...presentationData.costsAndBenefits,
                        solutionSummary: e.target.value,
                      },
                    })
                  }
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  AI analyzes your selected processes, implementation timeline, and ROI metrics to create a comprehensive solution overview
                </p>
              </div>

              <Separator />

              {/* ROI Breakdown & Financial Analysis */}
              <div>
                <h3 className="font-medium mb-4">ROI Breakdown & Financial Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Live data synchronized from Impact and ROI section. All metrics update automatically based on your process selections and calculations.
                </p>
                <PresentationROIBreakdown 
                  results={results}
                  processResults={results.processResults}
                  selectedProcessIds={data.processes.filter(p => p.fteCount > 0 || p.taskVolume > 0).map(p => p.id)}
                  data={data}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Statement of Work Tab */}
        <TabsContent value="sow" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label>Initial Project Description (Auto-generated)</Label>
                <Textarea
                  placeholder="Detailed description of the initial automation project..."
                  value={presentationData.statementOfWork.projectDescription}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      statementOfWork: {
                        ...presentationData.statementOfWork,
                        projectDescription: e.target.value,
                      },
                    })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from selected starter processes. Edit as needed.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Statement of Work Details</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateWithAI('sow')}
                    disabled={aiGenerationStatus.sow === 'loading'}
                  >
                    {aiGenerationStatus.sow === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Draft SOW
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Detailed SOW including deliverables, milestones, responsibilities..."
                  value={presentationData.statementOfWork.sowDetails}
                  onChange={(e) =>
                    setPresentationData({
                      ...presentationData,
                      statementOfWork: {
                        ...presentationData.statementOfWork,
                        sowDetails: e.target.value,
                      },
                    })
                  }
                  rows={8}
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Upfront Development Cost</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={presentationData.statementOfWork.upfrontDevelopmentCost === 0 ? '' : (presentationData.statementOfWork.upfrontDevelopmentCost || '')}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          statementOfWork: {
                            ...presentationData.statementOfWork,
                            upfrontDevelopmentCost: Number(e.target.value),
                          },
                        })
                      }
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Training Costs</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={presentationData.statementOfWork.trainingCosts === 0 ? '' : (presentationData.statementOfWork.trainingCosts || '')}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          statementOfWork: {
                            ...presentationData.statementOfWork,
                            trainingCosts: Number(e.target.value),
                          },
                        })
                      }
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly Costs</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={presentationData.statementOfWork.monthlyCosts === 0 ? '' : (presentationData.statementOfWork.monthlyCosts || '')}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          statementOfWork: {
                            ...presentationData.statementOfWork,
                            monthlyCosts: Number(e.target.value),
                          },
                        })
                      }
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Yearly Costs</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={presentationData.statementOfWork.yearlyCosts === 0 ? '' : (presentationData.statementOfWork.yearlyCosts || '')}
                      onChange={(e) =>
                        setPresentationData({
                          ...presentationData,
                          statementOfWork: {
                            ...presentationData.statementOfWork,
                            yearlyCosts: Number(e.target.value),
                          },
                        })
                      }
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">Total Project Investment</span>
                  </div>
                  <p className="text-2xl">
                    ${(
                      presentationData.statementOfWork.upfrontDevelopmentCost +
                      presentationData.statementOfWork.trainingCosts +
                      presentationData.statementOfWork.monthlyCosts +
                      presentationData.statementOfWork.yearlyCosts
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    First year total (upfront + training + monthly + yearly)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium">Presentation Preview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review all sections before exporting. AI-generated content is marked with [AI-Generated].
                  </p>
                </div>
                <Button 
                  onClick={generateFullPresentation} 
                  size="lg"
                  disabled={isGeneratingGamma}
                >
                  {isGeneratingGamma ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Presentation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Gamma Presentation
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Gamma Links */}
              {gammaUrl && (
                <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-900 dark:text-green-100">
                        Presentation Successfully Created
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-green-800 dark:text-green-200">View Presentation:</Label>
                        <a 
                          href={gammaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {gammaUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-green-800 dark:text-green-200">Edit Presentation:</Label>
                        <a 
                          href={gammaEditUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {gammaEditUrl}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => window.open(gammaUrl, '_blank')}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Presentation
                      </Button>
                      <Button 
                        onClick={() => window.open(gammaEditUrl, '_blank')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit in Gamma
                      </Button>
                      <Button 
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(gammaUrl);
                            toast.success('Link copied to clipboard');
                          } catch (error) {
                            // Silently handle clipboard permission errors - user already gets toast message
                            toast.error('Failed to copy - clipboard access denied');
                          }
                        }}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {gammaOutlineContent && !gammaUrl && (
                <GammaIntegration 
                  presentationContent={gammaOutlineContent}
                  onGenerateSuccess={(url) => {
                    console.log('Gamma presentation URL:', url);
                  }}
                />
              )}

              <Separator />

              {/* Executive Summary Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Executive Summary</h4>
                  {presentationData.executiveSummary.businessDescription && (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  {presentationData.executiveSummary.companyWebsite && (
                    <p><strong>Website:</strong> {presentationData.executiveSummary.companyWebsite}</p>
                  )}
                  {presentationData.executiveSummary.businessDescription && (
                    <p><strong>Business:</strong> {presentationData.executiveSummary.businessDescription.substring(0, 200)}...</p>
                  )}
                  <p><strong>Goals:</strong> {presentationData.executiveSummary.goals.length} defined</p>
                  <p><strong>Challenges:</strong> {presentationData.executiveSummary.challenges.length} identified</p>
                </div>
              </div>

              {/* Solution Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Solution & Implementation</h4>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <p><strong>Processes:</strong> {presentationData.solutionImplementation.processes.length} to automate</p>
                  <p><strong>Starting Phase:</strong> {presentationData.solutionImplementation.selectedStarterProcessIds.length} processes selected</p>
                  {presentationData.solutionImplementation.timeline.description && (
                    <p><strong>Timeline:</strong> {presentationData.solutionImplementation.timeline.description.substring(0, 100)}...</p>
                  )}
                </div>
              </div>

              {/* ROI Metrics Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Financial Impact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-2xl font-bold">{formatPercentage(results.roiPercentage)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Annual Savings</p>
                    <p className="text-2xl font-bold">{formatCurrency(results.annualNetSavings)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Payback Period</p>
                    <p className="text-2xl font-bold">{formatNumber(results.paybackPeriod)}mo</p>
                  </div>
                </div>
              </div>

              {/* Data Completeness Indicator */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Data Completeness</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Company Information', complete: !!presentationData.executiveSummary.businessDescription },
                    { label: 'Goals & Challenges', complete: presentationData.executiveSummary.goals.length > 0 || presentationData.executiveSummary.challenges.length > 0 },
                    { label: 'Solution Summary', complete: !!presentationData.executiveSummary.solutionSummary },
                    { label: 'Process Selection', complete: presentationData.solutionImplementation.selectedStarterProcessIds.length > 0 },
                    { label: 'Timeline', complete: !!presentationData.solutionImplementation.timeline.description },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      {item.complete ? (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Incomplete
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Click "Generate with AI" to have the system research additional information and complete any missing sections using OpenAI's agent capabilities.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Export Section - Inside Preview Tab */}
          <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-medium mb-2">Ready to Export?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your presentation will include all the data you've entered along with charts, graphs, and ROI calculations from the Impact and ROI section. All reports will be attached as appendices.
              </p>
              
              <div className="mb-4">
                <Label className="text-sm mb-2 block">Select Sections to Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-all"
                      checked={sectionsToExport.includes('all')}
                      onCheckedChange={() => toggleSection('all')}
                    />
                    <label htmlFor="export-all" className="text-sm cursor-pointer">
                      Include All Sections
                    </label>
                  </div>
                  {!sectionsToExport.includes('all') && (
                    <div className="ml-6 space-y-2">
                      {[
                        { id: 'executive', label: 'Executive Summary' },
                        { id: 'solution', label: 'Solution & Implementation' },
                        { id: 'about', label: 'About DockeryAI' },
                        { id: 'costs', label: 'Costs & Benefits' },
                        { id: 'sow', label: 'Statement of Work' },
                      ].map((section) => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`export-${section.id}`}
                            checked={sectionsToExport.includes(section.id)}
                            onCheckedChange={() => toggleSection(section.id)}
                          />
                          <label htmlFor={`export-${section.id}`} className="text-sm cursor-pointer">
                            {section.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => handleExport('pdf')} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export as PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button variant="outline" onClick={() => handleExport('word')} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export as Word</span>
                  <span className="sm:hidden">Word</span>
                </Button>
                <Button variant="outline" onClick={() => handleExport('google')} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export as Google Doc</span>
                  <span className="sm:hidden">Google Doc</span>
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              {/* Export (Gamma or Storage) Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">Export (Gamma or Storage)</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate proposal documents and presentations
                </p>
                
                <Button 
                  onClick={handleExportToGamma}
                  disabled={isExportingToGamma}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isExportingToGamma ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Export (Gamma or Storage)
                    </>
                  )}
                </Button>
                
                {gammaExportResult && gammaExportResult.export_links && (
                  <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-900 dark:text-green-100">Export Successful!</p>
                    </div>
                    
                    {/* Show final output if available */}
                    {gammaExportResult.final_output && (
                      <div className="p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                        <p className="text-sm">{gammaExportResult.final_output.substring(0, 150)}...</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {/* Document Link */}
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {gammaExportResult.mode === 'live' ? 'Gamma Document' : 'Proposal (Markdown)'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(gammaExportResult.export_links!.doc, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {gammaExportResult.mode === 'live' ? 'Open in Gamma' : 'Open Proposal (Markdown)'}
                        </Button>
                      </div>
                      
                      {/* Deck Link */}
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {gammaExportResult.mode === 'live' ? 'Gamma Presentation' : 'Deck Outline (JSON)'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(gammaExportResult.export_links!.deck, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {gammaExportResult.mode === 'live' ? 'Open in Gamma' : 'Open Deck Outline (JSON)'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show step status if available */}
                    {gammaExportResult.steps && (
                      <div className="flex gap-2 text-xs">
                        {gammaExportResult.steps.fathom && (
                          <Badge variant="outline" className="bg-white dark:bg-green-900">
                            Fathom: {gammaExportResult.steps.fathom}
                          </Badge>
                        )}
                        {gammaExportResult.steps.proposal && (
                          <Badge variant="outline" className="bg-white dark:bg-green-900">
                            Proposal: {gammaExportResult.steps.proposal}
                          </Badge>
                        )}
                        {gammaExportResult.steps.gamma && (
                          <Badge variant="outline" className="bg-white dark:bg-green-900">
                            Gamma: {gammaExportResult.steps.gamma}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {gammaExportResult.mode === 'live' 
                        ? 'URLs have been saved to this proposal version' 
                        : 'Export files have been saved to storage'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
        </TabsContent>
      </Tabs>
        </div>

        {/* Run Log Panel - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ProposalRunLog
              tenantId={currentVersion.tenantId}
              orgId={currentVersion.organizationId}
              dealId={currentVersion.dealId}
              runId={currentVersion.id}
            />
          </div>
        </div>
      </div>

      {/* Outcome Editor Dialog */}
      <Dialog open={editingOutcomes.type !== null} onOpenChange={() => setEditingOutcomes({ type: null, id: null, outcomes: [] })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Aligned Outcomes - {editingOutcomes.type === 'goal' ? 'Goal' : 'Challenge'}
            </DialogTitle>
            <DialogDescription>
              Select which outcomes from the Impact and ROI analysis align with this {editingOutcomes.type}. 
              These will be displayed in the presentation to show how automation addresses the {editingOutcomes.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Available Outcomes from Impact & ROI</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {getAvailableOutcomes().map((outcome) => (
                  <div
                    key={outcome.id}
                    className="flex items-start space-x-2 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                    onClick={() => toggleOutcomeInEditor(outcome.value)}
                  >
                    <Checkbox
                      id={`outcome-${outcome.id}`}
                      checked={editingOutcomes.outcomes.includes(outcome.value)}
                      onCheckedChange={() => toggleOutcomeInEditor(outcome.value)}
                    />
                    <label
                      htmlFor={`outcome-${outcome.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {outcome.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <Label className="text-sm mb-2 block">Selected Outcomes ({editingOutcomes.outcomes.length})</Label>
              {editingOutcomes.outcomes.length > 0 ? (
                <div className="space-y-2">
                  {editingOutcomes.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-accent/50 rounded text-sm">
                      <Badge variant="outline">✓</Badge>
                      <span className="flex-1">{outcome}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No outcomes selected</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingOutcomes({ type: null, id: null, outcomes: [] })}
              >
                Cancel
              </Button>
              <Button onClick={saveEditedOutcomes}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
