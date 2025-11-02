/**
 * ProposalContentBuilder - Editable content blocks for ValueDock proposals
 * 
 * Displays five core sections with AI-generated content that can be manually edited:
 * 1. Overview
 * 2. Challenges & Goals  
 * 3. ROI Summary
 * 4. Solution Summary
 * 5. Statement of Work (SOW)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import {
  FileText,
  Target,
  DollarSign,
  Lightbulb,
  FileCheck,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Mic,
  Upload
} from 'lucide-react';
import { apiCall } from '../utils/auth';
import { sectionPromptsConfig } from '../config/section_prompts';
import { formatCurrency } from './utils/calculations';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  edited: boolean;
}

interface ProposalContentBuilderProps {
  dealId: string;
  organizationId: string;
  tenantId: string;
  versionId: string;
  onContentSave?: (sections: ContentSection[]) => void;
}

interface ExportStatus {
  type: 'doc' | 'deck' | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  url: string | null;
  error: string | null;
}

const iconMap: Record<string, any> = {
  FileText,
  Target,
  DollarSign,
  Lightbulb,
  FileCheck
};

interface ROIQuickStats {
  annual_savings: number;
  payback_months: number;
  before_cost: number;
  after_cost: number;
  upfront_investment: number;
  ongoing_investment: number;
}

export function ProposalContentBuilder({
  dealId,
  organizationId,
  tenantId,
  versionId,
  onContentSave
}: ProposalContentBuilderProps) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // ROI Quick Stats
  const [roiQuickStats, setRoiQuickStats] = useState<ROIQuickStats | null>(null);
  const [roiStatsLoading, setRoiStatsLoading] = useState(false);
  
  // Fathom Fetch for Challenges
  const [isFetchingFromFathom, setIsFetchingFromFathom] = useState(false);
  const [useManualTranscript, setUseManualTranscript] = useState(false);
  const [manualTranscriptText, setManualTranscriptText] = useState('');
  
  // Export states
  const [docExport, setDocExport] = useState<ExportStatus>({
    type: null,
    status: 'idle',
    url: null,
    error: null
  });
  const [deckExport, setDeckExport] = useState<ExportStatus>({
    type: null,
    status: 'idle',
    url: null,
    error: null
  });

  // Load sections on mount
  useEffect(() => {
    loadSections();
    loadROIQuickStats();
  }, [dealId, organizationId, versionId]);

  const loadSections = async () => {
    try {
      setLoading(true);
      
      // Load saved sections from backend
      const response = await apiCall(
        `/proposal-content/load?dealId=${dealId}&organizationId=${organizationId}&versionId=${versionId}`
      );

      if (response.success && response.sections) {
        setSections(response.sections);
      } else {
        // Initialize with default content from config
        const defaultSections: ContentSection[] = sectionPromptsConfig.sections.map(section => ({
          id: section.id,
          title: section.title,
          content: section.defaultContent,
          edited: false
        }));
        setSections(defaultSections);
      }
      
      // Load export URLs if they exist
      if (response.exports) {
        if (response.exports.gammaDocUrl) {
          setDocExport({
            type: 'doc',
            status: 'success',
            url: response.exports.gammaDocUrl,
            error: null
          });
        }
        if (response.exports.gammaDeckUrl) {
          setDeckExport({
            type: 'deck',
            status: 'success',
            url: response.exports.gammaDeckUrl,
            error: null
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load proposal sections');
      
      // Fall back to defaults
      const defaultSections: ContentSection[] = sectionPromptsConfig.sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.defaultContent,
        edited: false
      }));
      setSections(defaultSections);
    } finally {
      setLoading(false);
    }
  };

  const loadROIQuickStats = async () => {
    try {
      setRoiStatsLoading(true);
      
      const response = await apiCall(
        `/proposal-roi/quick-stats?dealId=${dealId}&organizationId=${organizationId}`
      );

      // Check if API returned status: completed
      if (response.status === 'completed' && response.stats) {
        // Immediately surface the values in the UI
        setRoiQuickStats(response.stats);
        console.log('✅ ROI Quick Stats loaded (status: completed):', response.stats);
      } else if (response.success && response.stats) {
        // Fallback for backward compatibility
        setRoiQuickStats(response.stats);
        console.log('✅ ROI Quick Stats loaded (success):', response.stats);
      }
    } catch (error: any) {
      console.error('Error loading ROI quick stats:', error);
      // Don't show error toast - stats are optional
    } finally {
      setRoiStatsLoading(false);
    }
  };

  const handleRecalculateROI = async () => {
    try {
      setRoiStatsLoading(true);
      toast.info('Recalculating ROI...');
      
      // Trigger recalculation on server
      const response = await apiCall('/proposal-roi/recalculate', {
        method: 'POST',
        body: {
          dealId,
          organizationId
        }
      });

      // Check if API returned status: completed with immediate stats
      if (response.status === 'completed' && response.stats) {
        // Immediately surface the recalculated values
        setRoiQuickStats(response.stats);
        toast.success('ROI recalculated successfully!');
        console.log('✅ ROI recalculated (status: completed):', response.stats);
      } else if (response.success) {
        // Reload the stats if not immediately returned
        await loadROIQuickStats();
        toast.success('ROI recalculated successfully!');
      } else {
        toast.error('Failed to recalculate ROI');
      }
    } catch (error: any) {
      console.error('Error recalculating ROI:', error);
      toast.error('Failed to recalculate ROI');
    } finally {
      setRoiStatsLoading(false);
    }
  };

  const handleFetchFromFathom = async () => {
    try {
      setIsFetchingFromFathom(true);
      
      // Check if using manual transcript mode
      if (useManualTranscript) {
        if (!manualTranscriptText.trim()) {
          toast.error('Please enter transcript text');
          setIsFetchingFromFathom(false);
          return;
        }
        
        toast.info('Processing manual transcript...');
        
        // Split by newlines or paragraphs to create array
        const transcripts_text = manualTranscriptText
          .split(/\n\n+/)
          .map(t => t.trim())
          .filter(t => t.length > 0);
        
        const payload = {
          tenant_id: tenantId,
          org_id: organizationId,
          deal_id: dealId,
          transcripts_text
        };
        
        const response = await apiCall('/fathom-fetch', {
          method: 'POST',
          body: payload
        });
        
        if (response.success) {
          await loadSections();
          toast.success('Challenges extracted from manual transcript!');
          setManualTranscriptText(''); // Clear after success
        } else {
          toast.error('Failed to process transcript: ' + (response.error || 'Unknown error'));
        }
      } else {
        // Original Fathom API fetch mode
        toast.info('Fetching challenges from Fathom meetings...');
        
        // Calculate date range (last 30 days by default)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const payload = {
          tenant_id: tenantId,
          org_id: organizationId,
          deal_id: dealId,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          tags: '' // Optional: could add tag filter
        };
        
        const response = await apiCall('/fathom-fetch', {
          method: 'POST',
          body: payload
        });
        
        if (response.success) {
          await loadSections();
          toast.success('Challenges updated from Fathom meetings!');
        } else {
          toast.error('Failed to fetch from Fathom: ' + (response.error || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Error fetching from Fathom:', error);
      toast.error('Failed to fetch from Fathom');
    } finally {
      setIsFetchingFromFathom(false);
    }
  };

  const handleContentChange = (sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent, edited: true }
        : section
    ));
  };

  const handleResetSection = (sectionId: string) => {
    const configSection = sectionPromptsConfig.sections.find(s => s.id === sectionId);
    if (!configSection) return;

    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, content: configSection.defaultContent, edited: false }
        : section
    ));
    toast.success('Section reset to default');
  };

  const handleSaveSections = async () => {
    try {
      setSaving(true);

      const response = await apiCall('/proposal-content/save', {
        method: 'POST',
        body: {
          dealId,
          organizationId,
          tenantId,
          versionId,
          sections
        }
      });

      if (response.success) {
        toast.success('Proposal content saved!');
        onContentSave?.(sections);
      } else {
        throw new Error(response.error || 'Save failed');
      }
    } catch (error: any) {
      console.error('Error saving sections:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleExportToGammaDoc = async () => {
    try {
      setDocExport({ type: 'doc', status: 'loading', url: null, error: null });

      // Combine all sections into markdown
      const markdown = sections.map(section => section.content).join('\n\n---\n\n');
      
      const response = await apiCall('/proposal-content/export-gamma-doc', {
        method: 'POST',
        body: {
          dealId,
          organizationId,
          tenantId,
          versionId,
          title: `ValueDock Proposal - ${dealId}`,
          markdown
        }
      });

      if (response.success && response.gammaUrl) {
        setDocExport({
          type: 'doc',
          status: 'success',
          url: response.gammaUrl,
          error: null
        });
        toast.success('Gamma Doc created!');
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (error: any) {
      console.error('Error exporting to Gamma Doc:', error);
      setDocExport({
        type: 'doc',
        status: 'error',
        url: null,
        error: error.message
      });
      toast.error('Failed to create Gamma Doc');
    }
  };

  const handleExportToGammaDeck = async () => {
    try {
      setDeckExport({ type: 'deck', status: 'loading', url: null, error: null });

      // Create outline from sections
      const outline = sections.map(section => ({
        title: section.title,
        content: section.content
      }));
      
      const response = await apiCall('/proposal-content/export-gamma-deck', {
        method: 'POST',
        body: {
          dealId,
          organizationId,
          tenantId,
          versionId,
          title: `ValueDock Presentation - ${dealId}`,
          outline
        }
      });

      if (response.success && response.gammaUrl) {
        setDeckExport({
          type: 'deck',
          status: 'success',
          url: response.gammaUrl,
          error: null
        });
        toast.success('Gamma Deck created!');
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (error: any) {
      console.error('Error exporting to Gamma Deck:', error);
      setDeckExport({
        type: 'deck',
        status: 'error',
        url: null,
        error: error.message
      });
      toast.error('Failed to create Gamma Deck');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading proposal content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2>Proposal Content Builder</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                    Challenges & Goals: Auto-merged from Fathom
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Automatically included from the latest call summaries when saving new proposal versions.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground">
            Edit sections and export to Gamma
          </p>
        </div>
        <Button onClick={handleSaveSections} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Sections
            </>
          )}
        </Button>
      </div>

      {/* Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal Sections</CardTitle>
          <CardDescription>
            Edit each section below. AI-generated content can be customized as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              {sectionPromptsConfig.sections.map(config => {
                const Icon = iconMap[config.icon] || FileText;
                const section = sections.find(s => s.id === config.id);
                const isROISection = config.id === 'roi_summary';
                const hasROIData = isROISection && roiQuickStats;
                
                return (
                  <TabsTrigger key={config.id} value={config.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{config.title}</span>
                    {section?.edited && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        <span className="text-xs">✓</span>
                      </Badge>
                    )}
                    {hasROIData && (
                      <Badge variant="default" className="ml-1 h-5 px-2 bg-green-600 hover:bg-green-700">
                        <span className="text-xs">Calculated</span>
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {sectionPromptsConfig.sections.map(config => {
              const Icon = iconMap[config.icon] || FileText;
              const section = sections.find(s => s.id === config.id);
              if (!section) return null;

              return (
                <TabsContent key={config.id} value={config.id} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="h-6 w-6 mt-1 text-primary" />
                      <div>
                        <h3>{config.title}</h3>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Fetch from Fathom button - Only for Challenges section */}
                      {config.id === 'challenges' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleFetchFromFathom}
                          disabled={isFetchingFromFathom}
                        >
                          {isFetchingFromFathom ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Fetch from Fathom
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetSection(config.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* AI Prompt Reference */}
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>AI Prompt:</strong> {config.aiPrompt}
                      {config.id === 'challenges' && (
                        <>
                          <br /><br />
                          <strong>Agent Tool:</strong> Agent prefers the tool <code className="bg-muted px-1 py-0.5 rounded">fathom_fetch</code> for pulling call transcripts and extracting challenges/goals via our Edge Function.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Manual Transcript Upload - Only for Challenges section */}
                  {config.id === 'challenges' && (
                    <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-lg">Upload Notes/Transcript</CardTitle>
                            <Badge variant="outline" className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                              Fallback
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Manually paste meeting notes or transcripts to extract challenges and goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Toggle for Manual Mode */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="manual-transcript-toggle" className="cursor-pointer">
                              Use manual transcript
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>When enabled, sends transcripts_text to fathom_fetch tool</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            id="manual-transcript-toggle"
                            checked={useManualTranscript}
                            onCheckedChange={setUseManualTranscript}
                          />
                        </div>

                        {/* Manual Transcript Input */}
                        {useManualTranscript && (
                          <div className="space-y-2">
                            <Label htmlFor="manual-transcript">
                              Transcript Text
                            </Label>
                            <Textarea
                              id="manual-transcript"
                              value={manualTranscriptText}
                              onChange={(e) => setManualTranscriptText(e.target.value)}
                              placeholder="Paste meeting notes or transcript here...&#10;&#10;Separate different sections with blank lines.&#10;The AI will extract challenges and goals from this text."
                              className="min-h-[200px] font-mono text-sm"
                              disabled={isFetchingFromFathom}
                            />
                            <p className="text-xs text-muted-foreground">
                              {manualTranscriptText.trim() ? `${manualTranscriptText.trim().split(/\n\n+/).length} section(s) detected` : 'Paste your transcript above'}
                            </p>
                          </div>
                        )}

                        {/* Status Message */}
                        {useManualTranscript ? (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Manual mode enabled. Click "Fetch from Fathom" to process your transcript.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert>
                            <Mic className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              API mode enabled. Click "Fetch from Fathom" to fetch from Fathom meetings (last 30 days).
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* ROI Quick Stats Card - Only show for roi_summary section */}
                  {config.id === 'roi_summary' && (
                    <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                            <Badge 
                              variant="outline" 
                              className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                            >
                              Server
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Computed server-side via roi_quick_stats()</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRecalculateROI}
                            disabled={roiStatsLoading}
                          >
                            {roiStatsLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Calculating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Recalculate
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {roiStatsLoading && !roiQuickStats ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                        ) : roiQuickStats ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Annual Savings */}
                            <div className="p-4 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-muted-foreground">Annual Savings</span>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(roiQuickStats.annual_savings)}
                              </div>
                            </div>

                            {/* Payback Period */}
                            <div className="p-4 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {roiQuickStats.payback_months.toFixed(1)} months
                              </div>
                            </div>

                            {/* Before Cost → After Cost */}
                            <div className="p-4 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <ArrowRight className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-muted-foreground">Before → After Cost</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-muted-foreground line-through">
                                  {formatCurrency(roiQuickStats.before_cost)}
                                </span>
                                <ArrowRight className="h-4 w-4 text-orange-600" />
                                <span className="text-lg font-bold text-orange-600">
                                  {formatCurrency(roiQuickStats.after_cost)}
                                </span>
                              </div>
                            </div>

                            {/* Upfront / Ongoing Investment */}
                            <div className="p-4 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-muted-foreground">Investment</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Upfront:</span>
                                  <span className="text-sm font-bold text-purple-600">
                                    {formatCurrency(roiQuickStats.upfront_investment)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Ongoing:</span>
                                  <span className="text-sm font-bold text-purple-600">
                                    {formatCurrency(roiQuickStats.ongoing_investment)}/yr
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                              No ROI data available. Click "Recalculate" to generate stats.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Content Editor */}
                  <div className="space-y-2">
                    <Textarea
                      value={section.content}
                      onChange={(e) => handleContentChange(config.id, e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Enter content here..."
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{section.content.length} characters</span>
                      {section.edited && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export to Gamma</CardTitle>
          <CardDescription>
            Generate professional documents and presentations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Export to Gamma Doc */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4>Gamma Document</h4>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive proposal document
                  </p>
                </div>
              </div>

              <Button
                onClick={handleExportToGammaDoc}
                disabled={docExport.status === 'loading'}
                className="w-full"
              >
                {docExport.status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Gamma Doc
                  </>
                )}
              </Button>

              {/* Doc Status */}
              {docExport.status === 'success' && docExport.url && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm flex-1">Created</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(docExport.url!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                </div>
              )}
              {docExport.status === 'error' && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-400">Failed</span>
                </div>
              )}
            </div>

            {/* Export to Gamma Deck */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <div>
                  <h4>Gamma Presentation</h4>
                  <p className="text-xs text-muted-foreground">
                    Executive presentation deck
                  </p>
                </div>
              </div>

              <Button
                onClick={handleExportToGammaDeck}
                disabled={deckExport.status === 'loading'}
                className="w-full"
              >
                {deckExport.status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Gamma Deck
                  </>
                )}
              </Button>

              {/* Deck Status */}
              {deckExport.status === 'success' && deckExport.url && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm flex-1">Created</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(deckExport.url!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                </div>
              )}
              {deckExport.status === 'error' && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-400">Failed</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
