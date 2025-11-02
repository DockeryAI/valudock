import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { InfoIcon, TrendingUp, HelpCircle } from 'lucide-react';
import { InputData, ProcessROIResults, formatCurrency, calculateCFOScoreComponents } from './utils/calculations';

interface OpportunityMatrixProps {
  data: InputData;
  results: {
    totalROI: number;
    paybackPeriod: number;
    processResults: ProcessROIResults[];
    totalBenefit: number;
    totalTimeSavings: number;
    npvDetails?: any;
  };
  timeHorizonMonths?: number; // Time horizon for financial calculations (default 36 months)
}

interface MatrixProcess {
  id: string;
  name: string;
  group: string;
  engine?: string;
  // NPV-based metrics
  roi: number; // Risk-adjusted ROI (typically 0-3 scale)
  implementationEffort: number; // 0-1 scale (weighted: complexity, EAC, EMV)
  executionHealth: number; // 0-1 scale (budget control) - kept for reference
  riskFactor: number; // 0-1 scale (EMV-based)
  npv: number; // Risk-adjusted NPV (dollars)
  r_adj: number; // Risk-adjusted discount rate
  complexityIndex: number; // 0-10 scale
  implementationWeeks: number; // original weeks value for display
  initialCost: number; // total implementation cost
  budget: number; // approved budget
  eac: number; // estimate at completion
  emv: number; // expected monetary value of risks
  quadrant: 'Quick Wins' | 'Growth Engines' | 'Nice to Haves' | 'Deprioritize';
  isStartingProcess: boolean;
}

const getEngineColor = (engine?: string): string => {
  switch (engine) {
    case 'Value Creation':
      return 'bg-purple-500';
    case 'Marketing and Sales':
      return 'bg-blue-500';
    case 'Value Delivery':
      return 'bg-green-500';
    case 'Finance':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
};

const getEngineBorderColor = (engine?: string): string => {
  switch (engine) {
    case 'Value Creation':
      return 'border-purple-500';
    case 'Marketing and Sales':
      return 'border-blue-500';
    case 'Value Delivery':
      return 'border-green-500';
    case 'Finance':
      return 'border-amber-500';
    default:
      return 'border-gray-500';
  }
};

export function OpportunityMatrix({ data, results, timeHorizonMonths = 36 }: OpportunityMatrixProps) {
  // Hover state management for bubble-label interaction
  const [hoveredProcessId, setHoveredProcessId] = React.useState<string | null>(null);
  
  // Log every render to track component updates
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  console.log(`🎨 [OpportunityMatrix] RENDER #${renderCount.current} at ${new Date().toLocaleTimeString()}`);
  console.log(`🎨 [OpportunityMatrix] Global Risk Factor from props: ${data.globalDefaults.financialAssumptions?.globalRiskFactor}`);
  
  // Track when global risk factor changes
  React.useEffect(() => {
    console.log('🔔 [OpportunityMatrix] Global Risk Factor CHANGED TO:', data.globalDefaults.financialAssumptions?.globalRiskFactor);
  }, [data.globalDefaults.financialAssumptions?.globalRiskFactor]);
  
  const { matrixData, costTarget, timeTarget } = useMemo(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('🔄 [OpportunityMatrix] ===== RECALCULATION STARTED =====');
    console.log('🔄 [OpportunityMatrix] Timestamp:', timestamp);
    console.log('🔄 [OpportunityMatrix] Process count:', data.processes.length);
    console.log('🔄 [OpportunityMatrix] Results count:', results.processResults?.length);
    console.log('🔄 [OpportunityMatrix] Time horizon:', timeHorizonMonths, 'months');
    console.log('🔄 [OpportunityMatrix] First 3 processes:', data.processes.slice(0, 3).map(p => ({
      name: p.name,
      fteCount: p.fteCount,
      complexityIndex: p.complexityMetrics?.complexityIndex
    })));
    
    const processesData: MatrixProcess[] = [];
    const timeHorizonYears = timeHorizonMonths / 12;

    // Get global financial assumptions
    const discountRate = (data.globalDefaults.financialAssumptions?.discountRate || 10) / 100; // Convert % to decimal
    const riskPremiumFactor = data.globalDefaults.financialAssumptions?.riskPremiumFactor || 0.03;
    const globalRiskFactorSetting = data.globalDefaults.financialAssumptions?.globalRiskFactor;
    
    console.log('🎯 GLOBAL FINANCIAL SETTINGS:');
    console.log(`   Discount Rate: ${(discountRate * 100).toFixed(1)}%`);
    console.log(`   Risk Premium Factor: ${riskPremiumFactor.toFixed(3)}`);
    console.log(`   Global Risk Factor Override: ${globalRiskFactorSetting !== undefined && globalRiskFactorSetting !== null ? globalRiskFactorSetting.toFixed(1) + '/10 🔒 ACTIVE' : 'Not Set (using individual complexity)'}`);
    console.log('');
    
    // Get effort anchors (absolute benchmarks)
    const costTarget = data.globalDefaults.effortAnchors?.costTarget || 100000; // Default: $100,000
    const timeTarget = data.globalDefaults.effortAnchors?.timeTarget || 6; // Default: 6 months
    
    console.log('🎯 EFFORT ANCHORS IN USE:');
    console.log(`   Cost Target: ${formatCurrency(costTarget)}`);
    console.log(`   Time Target: ${timeTarget} months`);
    console.log(`   Source: ${data.globalDefaults.effortAnchors ? 'Admin Panel Settings' : 'Default Values'}`);

    // Matrix calculation with absolute effort model


    // Calculate CFO Score for each process using NPV-based methodology
    data.processes.forEach(process => {
      const processResult = results.processResults.find(r => r.processId === process.id);
      if (!processResult) return;

      const group = data.groups.find(g => g.name === process.group);
      
      // Get complexity index from workflow metadata
      let complexityIndex = 0;
      if (process.complexityMetrics && process.complexityMetrics.complexityIndex !== undefined) {
        complexityIndex = process.complexityMetrics.complexityIndex;
      } else if (process.complexityMetrics) {
        // Calculate if not stored
        const { inputsScore, stepsScore, dependenciesScore } = process.complexityMetrics;
        complexityIndex = ((inputsScore || 0) * 0.4) + ((stepsScore || 0) * 0.4) + ((dependenciesScore || 0) * 0.2);
      }
      
      // Calculate initial cost (C0)
      const initialCost = 
        (process.implementationCosts.upfrontCosts || 0) +
        (process.implementationCosts.trainingCosts || 0) +
        (process.implementationCosts.consultingCosts || 0) +
        ((process.implementationCosts.softwareCost || 0) * 12); // 1 year of software costs
      
      // Build annual savings array (Year 1, Year 2, Year 3)
      const annualSavings = processResult.annualNetSavings || 0;
      const savingsYears = Array(Math.ceil(timeHorizonYears)).fill(annualSavings);
      
      // Get budget, EAC, EMV (with defaults if not provided)
      const budget = process.implementationCosts.budget || initialCost;
      const eac = process.implementationCosts.eac || initialCost; // Assume on-budget if not specified
      const emv = process.implementationCosts.emv || 0; // Assume no risk exposure if not specified
      
      // Implementation time for display and calculation
      // The field is named "Months" but actually stores weeks (legacy naming)
      const implementationWeeks = process.implementationCosts.implementationTimelineMonths || 1;
      const estimatedTime = implementationWeeks; // Use weeks directly
      
      // Calculate CFO Score components using absolute anchors
      const cfoComponents = calculateCFOScoreComponents({
        initialCost,
        savingsYears,
        startYear: 1,
        discountRate,
        complexityIndex,
        budget,
        eac,
        emv,
        riskPremiumFactor,
        estimatedCost: initialCost,
        estimatedTime,
        costTarget,
        timeTarget,
        globalRiskFactor: data.globalDefaults.financialAssumptions?.globalRiskFactor
      });
      
      // Log detailed breakdown
      const globalRiskOverride = data.globalDefaults.financialAssumptions?.globalRiskFactor;
      const effectiveRisk = (globalRiskOverride !== undefined && globalRiskOverride !== null) ? globalRiskOverride : complexityIndex;
      
      console.log(`\n💰 Matrix Calculation for "${process.name}":`);
      console.log(`  Estimated Cost: ${formatCurrency(initialCost)} (vs. ${formatCurrency(costTarget)} target)`);
      console.log(`  Estimated Time: ${estimatedTime} weeks (${(estimatedTime / 4.33).toFixed(1)} months vs. ${timeTarget} month target)`);
      if (globalRiskOverride !== undefined && globalRiskOverride !== null) {
        console.log(`  🔒 GLOBAL RISK OVERRIDE: ${globalRiskOverride.toFixed(1)}/10 (ignoring process complexity: ${complexityIndex.toFixed(1)}/10)`);
      } else {
        console.log(`  Complexity Index: ${complexityIndex.toFixed(1)}/10 (no global override)`);
      }
      console.log(`  Annual Savings: ${formatCurrency(annualSavings)} x ${savingsYears.length} years = ${formatCurrency(annualSavings * savingsYears.length)} total`);
      console.log(`  NPV (Risk-Adjusted): ${formatCurrency(cfoComponents.npv_final)}`);
      console.log(`  ROI_a (NPV/Cost): ${(cfoComponents.roi_a * 100).toFixed(1)}% = ${formatCurrency(cfoComponents.npv_final)} / ${formatCurrency(initialCost)}`);
      console.log(`  Implementation Effort: ${(cfoComponents.implementation_effort * 100).toFixed(1)}% (Cost: 50%, Time: 30%, Complexity: 20%)`);
      console.log(`  Quadrant: ${cfoComponents.quadrant}`);
      
      // Map quadrants to match UI expectations
      let quadrantDisplay: 'Quick Wins' | 'Strategic Bets' | 'Nice to Haves' | 'Deprioritize';
      switch (cfoComponents.quadrant) {
        case 'Quick Win':
          quadrantDisplay = 'Quick Wins';
          break;
        case 'Strategic Bet':
          quadrantDisplay = 'Strategic Bets';
          break;
        case 'Nice to Have':
          quadrantDisplay = 'Nice to Haves';
          break;
        default:
          quadrantDisplay = cfoComponents.quadrant as any;
      }
      
      processesData.push({
        id: process.id,
        name: process.name,
        group: process.group,
        engine: group?.engine,
        roi: cfoComponents.roi_a,
        implementationEffort: cfoComponents.implementation_effort,
        executionHealth: cfoComponents.execution_health,
        riskFactor: cfoComponents.risk_factor,
        npv: cfoComponents.npv_final,
        r_adj: cfoComponents.r_adj,
        complexityIndex: effectiveRisk, // Store EFFECTIVE risk (respects global override)
        implementationWeeks,
        initialCost,
        budget,
        eac,
        emv,
        quadrant: quadrantDisplay,
        isStartingProcess: false,
      });
    });

    // Find the starting process: highest ROI with lowest implementation effort in Quick Wins quadrant
    const quickWins = processesData.filter(p => p.quadrant === 'Quick Wins');
    if (quickWins.length > 0) {
      // Sort by: 1) highest ROI, 2) lowest implementation effort
      quickWins.sort((a, b) => {
        const roiDiff = b.roi - a.roi;
        if (Math.abs(roiDiff) > 0.1) return roiDiff;
        return a.implementationEffort - b.implementationEffort;
      });
      quickWins[0].isStartingProcess = true;
    }

    console.log(`✅ [OpportunityMatrix] Calculation Complete - ${processesData.length} processes positioned`);
    console.log(`  Quadrants: QW=${processesData.filter(p => p.quadrant === 'Quick Wins').length}, SB=${processesData.filter(p => p.quadrant === 'Strategic Bets').length}, NTH=${processesData.filter(p => p.quadrant === 'Nice to Haves').length}, DP=${processesData.filter(p => p.quadrant === 'Deprioritize').length}`);

    return {
      matrixData: processesData,
      costTarget,
      timeTarget
    };
  }, [
    timeHorizonMonths,
    // Track ALL process properties that affect calculations
    JSON.stringify(data.processes.map(p => ({
      id: p.id,
      name: p.name,
      group: p.group,
      fteCount: p.fteCount,
      taskVolume: p.taskVolume,
      timePerTask: p.timePerTask,
      annualSalary: p.annualSalary,
      automationLevel: p.automationLevel,
      complexityMetrics: p.complexityMetrics,
      implementationCosts: p.implementationCosts
    }))),
    // Track results (ROI/NPV calculations)
    JSON.stringify(results.processResults?.map(r => ({
      processId: r.processId,
      roi: r.roi,
      npv: r.npv
    }))),
    // Track global settings
    JSON.stringify(data.globalDefaults),
    // Track groups
    JSON.stringify(data.groups.map(g => ({ name: g.name, annualSalary: g.annualSalary })))
  ]);

  const getQuadrantColor = (quadrant: string): string => {
    switch (quadrant) {
      case 'Quick Wins':
        return 'bg-green-100/50 dark:bg-green-900/20';
      case 'Nice to Haves':
        return 'bg-yellow-100/50 dark:bg-yellow-900/20';
      case 'Deprioritize':
        return 'bg-red-100/50 dark:bg-red-900/20';
      case 'Strategic Bets':
      case 'Growth Engines': // Legacy support
        return 'bg-blue-100/50 dark:bg-blue-900/20';
      default:
        return '';
    }
  };

  // Calculate bubble size based on NPV
  const maxNPV = Math.max(...matrixData.map(p => Math.abs(p.npv)), 1);
  const minNPV = Math.min(...matrixData.map(p => Math.abs(p.npv)), 0);
  const getBubbleSize = (npv: number) => {
    const baseSize = 16; // minimum size
    const maxSize = 48; // maximum size
    const scale = (Math.abs(npv) / maxNPV) * (maxSize - baseSize);
    return baseSize + scale;
  };

  // MATRIX POSITIONING: Traditional 2x2 matrix with FIXED EQUAL QUADRANTS
  // Quadrants are ALWAYS 50/50 split visually
  // X-axis threshold at 50% (ROI = 100)
  // Y-axis threshold at 50% (Effort = 40%)
  
  // Find actual data range
  const actualMaxROI = Math.max(...matrixData.map(p => p.roi), 0.5);
  const actualMinROI = Math.min(...matrixData.map(p => p.roi), 0);
  const actualMaxEffort = Math.max(...matrixData.map(p => p.implementationEffort), 0.4);
  
  // FIXED quadrant threshold positions - ALWAYS 50/50
  const roiThresholdPercent = 50; // Vertical line at 50% (ROI = 50%)
  const effortThresholdPercent = 40; // Horizontal line at Effort = 40%
  
  // Matrix positioning: Equal quadrants (50/50 split)
  // X-axis: ROI threshold at 50% (50% position on chart)
  // Y-axis: Effort threshold at 40% (variable position - linear scale)

  return (
    <div className="space-y-6">
      {/* ON-SCREEN DEBUG PANEL */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-blue-900 dark:text-blue-100">🔍 Matrix Debug Info</CardTitle>
              <CardDescription>Real-time positioning calculations (50% ROI threshold)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white dark:bg-gray-900">
                Updated: {new Date().toLocaleTimeString()}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const debugText = `VALUEDOCK OPPORTUNITY MATRIX DEBUG INFO
Generated: ${new Date().toLocaleString()}
==============================================

THRESHOLDS:
- ROI Threshold: 50% (X = 50% on chart)
- Effort Threshold: 40% (Linear Y-axis)
- Max ROI in data: ${(actualMaxROI * 100).toFixed(1)}%
- Max Effort in data: ${(actualMaxEffort * 100).toFixed(1)}%

EFFORT ANCHORS (for calculating Implementation Effort):
- Cost Target: ${formatCurrency(costTarget)} (processes above this = high cost effort)
- Time Target: ${timeTarget} months (processes above this = high time effort)
- Source: ${data.globalDefaults.effortAnchors ? 'Admin Panel Settings' : 'Default Values'}

QUADRANT COUNTS:
- Quick Wins (ROI≥50%, Effort≤40%): ${matrixData.filter(p => p.quadrant === 'Quick Wins').length}
- Strategic Bets (ROI≥50%, Effort>40%): ${matrixData.filter(p => p.quadrant === 'Strategic Bets').length}
- Nice to Haves (ROI<50%, Effort≤40%): ${matrixData.filter(p => p.quadrant === 'Nice to Haves').length}
- Deprioritize (ROI<50%, Effort>40%): ${matrixData.filter(p => p.quadrant === 'Deprioritize').length}

GLOBAL RISK OVERRIDE:
${data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null ? `🔒 ACTIVE: ${data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10 - All processes use this risk factor` : '❌ NOT SET - Using individual process complexity scores'}
${data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null ? `
RISK IMPACT ANALYSIS:
  Current Risk Level: ${data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10
  Risk Multiplier: ${((1 - (0.5 * (data.globalDefaults.financialAssumptions.globalRiskFactor / 10))) * 100).toFixed(1)}%
  
  WHAT-IF COMPARISON (for a process with base ROI = 200%):
  • Risk 0/10 → Final ROI = 200.0% (no penalty)
  • Risk 2/10 → Final ROI = 180.0% (10% penalty)
  • Risk 4/10 → Final ROI = 160.0% (20% penalty) ${data.globalDefaults.financialAssumptions.globalRiskFactor === 4 ? '← YOUR CURRENT' : ''}
  • Risk 6/10 → Final ROI = 140.0% (30% penalty)
  • Risk 8/10 → Final ROI = 120.0% (40% penalty)
  • Risk 10/10 → Final ROI = 100.0% (50% max penalty)
  
  TIP: Lower risk = Higher ROI. Adjust to see matrix positions change!
` : ''}

PROCESS POSITIONING DETAILS:
${matrixData.map((process) => {
  let x: number;
  if (process.roi <= 0.5) {
    x = 5 + (process.roi / 0.5) * 45;
  } else {
    const rightScale = Math.max(0.5, actualMaxROI - 0.5);
    x = 50 + ((process.roi - 0.5) / rightScale) * 45;
  }
  const y = 95 - (process.implementationEffort * 90);
  const globalRiskOverride = data.globalDefaults.financialAssumptions?.globalRiskFactor;
  
  // Calculate what ROI would be with no risk (to show impact)
  const baseROI = process.npv / Math.max(process.initialCost, 1);
  const riskPenalty = globalRiskOverride !== undefined && globalRiskOverride !== null 
    ? ((baseROI - process.roi) / baseROI * 100)
    : 0;
  
  return `
${process.name}
  - ROI: ${(process.roi * 100).toFixed(1)}% ${process.roi >= 0.5 ? '✓ ≥50%' : '✗ <50%'}${globalRiskOverride !== undefined && globalRiskOverride !== null && baseROI > 0 ? ` (${riskPenalty.toFixed(1)}% risk penalty applied)` : ''}
  - Effort: ${(process.implementationEffort * 100).toFixed(1)}% ${process.implementationEffort <= 0.4 ? '✓ ≤40%' : '✗ >40%'}
  - Implementation Time: ${process.implementationWeeks} weeks (${(process.implementationWeeks / 4.33).toFixed(1)} months)
  - Implementation Cost: ${formatCurrency(process.initialCost)}
  - ${globalRiskOverride !== undefined && globalRiskOverride !== null ? `Risk (Global Override): ${globalRiskOverride.toFixed(1)}/10 🔒` : `Complexity: ${process.complexityIndex.toFixed(1)}/10`}
  - X Position: ${x.toFixed(1)}% (${process.roi <= 0.5 ? 'left' : 'right'} scale)
  - Y Position: ${y.toFixed(1)}% (from top)
  - NPV: ${formatCurrency(process.npv)}
  - Quadrant: ${process.quadrant}
`;
}).join('\n')}

DEPENDENCY TRACKING:
- Process Count: ${data.processes.length}
- Results Count: ${results.processResults?.length || 0}
- Time Horizon: ${timeHorizonMonths} months

DATA SOURCES:
${matrixData.map(p => `- ${p.name}: FTE=${data.processes.find(proc => proc.id === p.id)?.fteCount || 0}, Volume=${data.processes.find(proc => proc.id === p.id)?.taskVolume?.monthly || 0}/mo, Complexity=${p.complexityIndex.toFixed(1)}${data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined ? ' (GLOBAL OVERRIDE)' : ''}`).join('\n')}
`;
                  
                  // Fallback clipboard copy method that works even when Clipboard API is blocked
                  const copyToClipboardFallback = (text: string): boolean => {
                    try {
                      // Create a temporary textarea element
                      const textarea = document.createElement('textarea');
                      textarea.value = text;
                      textarea.style.position = 'fixed';
                      textarea.style.top = '0';
                      textarea.style.left = '0';
                      textarea.style.width = '2em';
                      textarea.style.height = '2em';
                      textarea.style.padding = '0';
                      textarea.style.border = 'none';
                      textarea.style.outline = 'none';
                      textarea.style.boxShadow = 'none';
                      textarea.style.background = 'transparent';
                      document.body.appendChild(textarea);
                      
                      // Select and copy
                      textarea.focus();
                      textarea.select();
                      
                      let successful = false;
                      try {
                        successful = document.execCommand('copy');
                      } catch (err) {
                        console.error('execCommand copy failed:', err);
                      }
                      
                      // Remove the textarea
                      document.body.removeChild(textarea);
                      
                      return successful;
                    } catch (err) {
                      console.error('Fallback copy failed:', err);
                      return false;
                    }
                  };
                  
                  // Try modern Clipboard API first, fallback to older method
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(debugText)
                      .then(() => {
                        toast.success('Debug info copied to clipboard!');
                      })
                      .catch((err) => {
                        console.log('Clipboard API blocked, trying fallback method...');
                        const success = copyToClipboardFallback(debugText);
                        if (success) {
                          toast.success('Debug info copied to clipboard!');
                        } else {
                          toast.error('Failed to copy. Please manually select and copy the debug panel text.');
                        }
                      });
                  } else {
                    // Clipboard API not available, use fallback immediately
                    const success = copyToClipboardFallback(debugText);
                    if (success) {
                      toast.success('Debug info copied to clipboard!');
                    } else {
                      toast.error('Failed to copy. Please manually select and copy the debug panel text.');
                    }
                  }
                }}
                className="bg-white dark:bg-gray-900"
              >
                📋 Copy Debug Info
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Thresholds:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div>ROI Threshold: <span className="font-bold text-green-600">50%</span> (X = 50% on chart)</div>
                  <div>Effort Threshold: <span className="font-bold text-orange-600">40%</span> (Linear Y-axis)</div>
                  <div>Max ROI in data: <span className="font-bold">{(actualMaxROI * 100).toFixed(1)}%</span></div>
                  <div>Max Effort in data: <span className="font-bold">{(actualMaxEffort * 100).toFixed(1)}%</span></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Effort Anchors:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div>Cost Target: <span className="font-bold">{formatCurrency(costTarget)}</span></div>
                  <div>Time Target: <span className="font-bold">{timeTarget} mo</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                    {data.globalDefaults.effortAnchors ? '✓ Admin Settings' : '⚠ Defaults'}
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quadrant Counts:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="text-green-700 dark:text-green-400">Quick Wins (ROI≥50%, Effort≤40%): {matrixData.filter(p => p.quadrant === 'Quick Wins').length}</div>
                  <div className="text-blue-700 dark:text-blue-400">Strategic Bets (ROI≥50%, Effort&gt;40%): {matrixData.filter(p => p.quadrant === 'Strategic Bets').length}</div>
                  <div className="text-yellow-700 dark:text-yellow-400">Nice to Haves (ROI&lt;50%, Effort≤40%): {matrixData.filter(p => p.quadrant === 'Nice to Haves').length}</div>
                  <div className="text-red-700 dark:text-red-400">Deprioritize (ROI&lt;50%, Effort&gt;40%): {matrixData.filter(p => p.quadrant === 'Deprioritize').length}</div>
                </div>
              </div>
            </div>
            
            {/* Global Risk Override Indicator */}
            {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null ? (
              <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="font-bold text-orange-900 dark:text-orange-100">Global Risk Override Active</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      All processes using risk factor: <span className="font-mono font-bold">{data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
              <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Process Positioning Details:</div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {matrixData.map((process) => {
                  // Calculate positions (same logic as rendering)
                  let x: number;
                  if (process.roi <= 0.5) {
                    x = 5 + (process.roi / 0.5) * 45;
                  } else {
                    const rightScale = Math.max(0.5, actualMaxROI - 0.5);
                    x = 50 + ((process.roi - 0.5) / rightScale) * 45;
                  }
                  const y = 95 - (process.implementationEffort * 90);
                  
                  return (
                    <div key={process.id} className="bg-white dark:bg-gray-900 p-2 rounded border border-blue-100 dark:border-blue-900">
                      <div className="font-mono text-xs space-y-1">
                        <div className="font-semibold text-blue-900 dark:text-blue-100">{process.name}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ROI:</span> <span className="font-bold">{(process.roi * 100).toFixed(1)}%</span>
                            {process.roi >= 0.5 ? <span className="text-green-600 ml-1">✓ ≥50%</span> : <span className="text-red-600 ml-1">✗ &lt;50%</span>}
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Effort:</span> <span className="font-bold">{(process.implementationEffort * 100).toFixed(1)}%</span>
                            {process.implementationEffort <= 0.4 ? <span className="text-green-600 ml-1">✓ ≤40%</span> : <span className="text-orange-600 ml-1">✗ &gt;40%</span>}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-1 border-t border-gray-200 dark:border-gray-700 pt-1">
                          <div><span className="font-medium">Time:</span> {process.implementationWeeks} wks ({(process.implementationWeeks / 4.33).toFixed(1)} mo)</div>
                          <div><span className="font-medium">Cost:</span> {formatCurrency(process.initialCost)}</div>
                          <div>
                            <span className="font-medium">
                              {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null ? 'Risk (Override):' : 'Complexity:'}
                            </span> {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null ? `${data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10 🔒` : `${process.complexityIndex.toFixed(1)}/10`}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">X Position:</span> <span className="font-bold">{x.toFixed(1)}%</span>
                            <span className="text-xs text-gray-500 ml-1">({process.roi <= 0.5 ? 'left' : 'right'} scale)</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Y Position:</span> <span className="font-bold">{y.toFixed(1)}%</span>
                            <span className="text-xs text-gray-500 ml-1">(from top)</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Quadrant:</span> 
                          <Badge className={`ml-2 ${
                            process.quadrant === 'Quick Wins' ? 'bg-green-500' :
                            process.quadrant === 'Strategic Bets' ? 'bg-blue-500' :
                            process.quadrant === 'Nice to Haves' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                            {process.quadrant}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle>ROI vs. Implementation Effort Matrix</CardTitle>
                  {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                      🔒 Global Risk: {data.globalDefaults.financialAssumptions.globalRiskFactor.toFixed(1)}/10
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  CFO-focused prioritization based on financial efficiency and execution complexity
                  {data.globalDefaults.financialAssumptions?.globalRiskFactor !== undefined && data.globalDefaults.financialAssumptions?.globalRiskFactor !== null && (
                    <span className="block mt-1 text-orange-600 dark:text-orange-400 font-medium">
                      ⚠️ All processes using global risk factor (ROI penalty: {(0.5 * (data.globalDefaults.financialAssumptions.globalRiskFactor / 10) * 100).toFixed(0)}%)
                    </span>
                  )}
                </CardDescription>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-96">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Matrix Methodology:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li><strong>Equal Quadrants:</strong> All 4 quadrants are always 50% × 50% (equal sized)
                        <p className="text-xs mt-1 italic">Thresholds fixed at center - ROI=100 (vertical) and Effort=40% (horizontal)</p>
                      </li>
                      <li><strong>X-Axis (ROI):</strong> Split scale for equal quadrants
                        <ul className="pl-4 mt-1 text-xs">
                          <li>Left half: 0-100% ROI</li>
                          <li>Right half: 100%-{Math.round(actualMaxROI * 100)}% ROI</li>
                        </ul>
                      </li>
                      <li><strong>Y-Axis (Implementation Effort):</strong> Split scale for equal quadrants
                        <ul className="pl-4 mt-1 text-xs">
                          <li>Bottom half: 0-40% effort</li>
                          <li>Top half: 40-100% effort</li>
                        </ul>
                      </li>
                      <li><strong>Bubble Size:</strong> Absolute NPV value</li>
                      <li><strong>Quadrant Rules:</strong>
                        <ul className="pl-4 mt-1">
                          <li>Quick Wins: ROI ≥ 100 AND Effort ≤ 40%</li>
                          <li>Strategic Bets: ROI ≥ 100 AND Effort &gt; 40%</li>
                          <li>Nice to Haves: ROI &lt; 100 AND Effort ≤ 40%</li>
                          <li>Deprioritize: ROI &lt; 100 AND Effort &gt; 40%</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>


          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Scatter plot - centered with proper spacing */}
            <div className="relative w-full py-8" style={{ minHeight: '1000px' }}>
              {/* Y-axis label - positioned on the left */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center z-40">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap tracking-wide">
                  Implementation Effort →
                </span>
              </div>

              {/* Y-axis tick marks - positioned on the left */}
              <div className="absolute left-8 top-8 bottom-8 flex flex-col justify-between items-end text-xs text-muted-foreground z-40 pr-2" style={{ height: '800px' }}>
                <span className="font-medium">High</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span className="font-medium">Low</span>
              </div>

              {/* Main centered container with shadow and border */}
              <div className="relative w-full max-w-7xl mx-auto">
                {/* Grid area with quadrants - increased height - NO SCROLLBARS */}
                <div className="relative w-full" style={{ paddingLeft: '5rem', paddingRight: '2rem' }}>
                  <div className="relative w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-xl bg-white dark:bg-gray-950" style={{ height: '800px' }}>
                  {/* Background quadrants with gradient overlays - FIXED 50/50 SPLIT */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
                    {/* Quadrants: ALWAYS 50% x 50% - Equal sized */}
                    {(() => {
                      const roiThresholdX = 50; // FIXED at 50% (center)
                      const effortThresholdY = 50; // FIXED at 50% (center, Y is inverted)
                      
                      return (
                        <>
                          {/* Top-left: Deprioritize (Low ROI < 50%, High Effort > 40%) */}
                          <div 
                            className="absolute top-0 left-0 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20"
                            style={{
                              width: `${roiThresholdX}%`,
                              height: `${effortThresholdY}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                          </div>
                          
                          {/* Top-right: Strategic Bets (High ROI ≥ 50%, High Effort > 40%) */}
                          <div 
                            className="absolute top-0 bg-gradient-to-bl from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20"
                            style={{
                              left: `${roiThresholdX}%`,
                              width: `${100 - roiThresholdX}%`,
                              height: `${effortThresholdY}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                          </div>
                          
                          {/* Bottom-left: Nice to Haves (Low ROI < 50%, Low Effort ≤ 40%) */}
                          <div 
                            className="absolute left-0 bg-gradient-to-tr from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20"
                            style={{
                              top: `${effortThresholdY}%`,
                              width: `${roiThresholdX}%`,
                              height: `${100 - effortThresholdY}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                          </div>
                          
                          {/* Bottom-right: Quick Wins (High ROI ≥ 50%, Low Effort ≤ 40%) */}
                          <div 
                            className="absolute bg-gradient-to-tl from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20"
                            style={{
                              left: `${roiThresholdX}%`,
                              top: `${effortThresholdY}%`,
                              width: `${100 - roiThresholdX}%`,
                              height: `${100 - effortThresholdY}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Top quadrant labels - FIXED 50/50 width */}
                  <div className="absolute -top-16 left-0 w-full flex gap-4 z-30">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-950/30 border-2 border-red-300 dark:border-red-700 shadow-lg backdrop-blur-sm" style={{ width: '50%', textAlign: 'center' }}>
                      <div className="text-sm font-bold text-red-700 dark:text-red-300">🟥 Deprioritize</div>
                      <div className="text-xs text-red-600 dark:text-red-400">ROI &lt; 100, High Effort</div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-bl from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/30 border-2 border-blue-300 dark:border-blue-700 shadow-lg backdrop-blur-sm" style={{ width: '50%', textAlign: 'center' }}>
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300">🟦 Strategic Bets</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">ROI ≥ 100, High Effort</div>
                    </div>
                  </div>

                  {/* Axis lines with shadow effect - FIXED at CENTER (50/50) */}
                  {/* Vertical line at ROI=100 (ALWAYS at 50% center) */}
                  <div 
                    className="absolute top-0 w-1 h-full bg-gradient-to-r from-transparent via-gray-500 to-transparent dark:via-gray-400 shadow-lg z-20" 
                    style={{ 
                      left: '50%',
                      marginLeft: '-2px'
                    }} 
                  />
                  {/* Horizontal line at Effort=40% (ALWAYS at 50% center) */}
                  <div 
                    className="absolute left-0 w-full h-1 bg-gradient-to-b from-transparent via-gray-500 to-transparent dark:via-gray-400 shadow-lg z-20" 
                    style={{ 
                      top: '50%',
                      marginTop: '-2px'
                    }} 
                  />
                  
                  {/* Calculate dynamic label positions to prevent overlaps */}
                  {(() => {
                    // First, calculate all bubble positions
                    const bubblePositions = matrixData.map((process, index) => {
                      const roiPercentage = process.roi * 100;
                      
                      // X-axis positioning with split scale
                      let x: number;
                      if (process.roi <= 0.5) {
                        x = 5 + (process.roi / 0.5) * 45;
                      } else {
                        const rightScale = Math.max(0.5, actualMaxROI - 0.5);
                        x = 50 + ((process.roi - 0.5) / rightScale) * 45;
                      }
                      
                      // Y-axis positioning (linear scale, inverted)
                      const y = 95 - (process.implementationEffort * 90);
                      const bubbleSize = getBubbleSize(process.npv);
                      
                      // Clamp bubble to visible area for rendering
                      const displayX = Math.max(2, Math.min(98, x));
                      const displayY = Math.max(2, Math.min(98, y));
                      const isOffChart = x < 0 || x > 100 || y < 0 || y > 100;
                      
                      // Position label close to bubble - directly above
                      let initialLabelX = displayX;
                      let initialLabelY = displayY - 3; // 3% above bubble
                      
                      // Keep initial position in bounds
                      initialLabelX = Math.max(12, Math.min(88, initialLabelX));
                      initialLabelY = Math.max(8, Math.min(92, initialLabelY));
                      
                      return {
                        process,
                        index,
                        x: displayX, // Use clamped position for rendering
                        y: displayY,
                        actualX: x, // Keep actual position for debug/data
                        actualY: y,
                        bubbleSize,
                        roiPercentage,
                        isOffChart,
                        // Initial label position (close above bubble)
                        labelX: initialLabelX,
                        labelY: initialLabelY,
                      };
                    });
                    
                    // Simple label positioning: avoid label-label overlap AND label-bubble overlap
                    const labelWidthPercent = 16; // Label width
                    const labelHeightPercent = 6;  // Label height
                    const bubbleRadiusPercent = 3; // Bubble radius (for collision detection)
                    
                    console.log('🏷️ Starting label positioning for', bubblePositions.length, 'processes');
                    
                    const maxIterations = 30;
                    
                    for (let iteration = 0; iteration < maxIterations; iteration++) {
                      let hadOverlap = false;
                      let iterationOverlaps = 0;
                      
                      for (let i = 0; i < bubblePositions.length; i++) {
                        const pos = bubblePositions[i];
                        
                        // Check 1: Label overlapping with OTHER labels?
                        for (let j = i + 1; j < bubblePositions.length; j++) {
                          const other = bubblePositions[j];
                          
                          const dx = pos.labelX - other.labelX;
                          const dy = pos.labelY - other.labelY;
                          
                          // Rectangular overlap
                          const overlapX = Math.abs(dx) < labelWidthPercent;
                          const overlapY = Math.abs(dy) < labelHeightPercent;
                          
                          if (overlapX && overlapY) {
                            hadOverlap = true;
                            iterationOverlaps++;
                            
                            // Gentle push - prefer vertical
                            const pushStrength = 0.5;
                            
                            if (Math.abs(dy) < Math.abs(dx)) {
                              const pushY = (labelHeightPercent - Math.abs(dy)) * pushStrength * Math.sign(dy || 1);
                              pos.labelY += pushY / 2;
                              other.labelY -= pushY / 2;
                            } else {
                              const pushX = (labelWidthPercent - Math.abs(dx)) * pushStrength * Math.sign(dx || 1);
                              pos.labelX += pushX / 2;
                              other.labelX -= pushX / 2;
                            }
                          }
                        }
                        
                        // Check 2: Is label overlapping its OWN bubble?
                        const dxBubble = pos.labelX - pos.x;
                        const dyBubble = pos.labelY - pos.y;
                        const distToBubble = Math.sqrt(dxBubble * dxBubble + dyBubble * dyBubble);
                        
                        // If label center is too close to bubble center (overlapping)
                        if (distToBubble < bubbleRadiusPercent) {
                          hadOverlap = true;
                          
                          // Push label away from bubble (upward)
                          const pushStrength = 0.3;
                          const angle = Math.atan2(dyBubble, dxBubble);
                          const pushDist = (bubbleRadiusPercent - distToBubble) * pushStrength;
                          
                          pos.labelX += Math.cos(angle) * pushDist;
                          pos.labelY += Math.sin(angle) * pushDist;
                        }
                        
                        // Keep within bounds
                        pos.labelX = Math.max(12, Math.min(88, pos.labelX));
                        pos.labelY = Math.max(8, Math.min(92, pos.labelY));
                      }
                      
                      if (iteration % 10 === 0 && iteration > 0) {
                        console.log(`  Iteration ${iteration}: ${iterationOverlaps} overlaps`);
                      }
                      
                      if (!hadOverlap) {
                        console.log(`✅ No overlaps after ${iteration} iterations`);
                        break;
                      }
                    }
                    
                    console.log(`📊 Final positions:`);
                    bubblePositions.forEach(pos => {
                      const distance = Math.sqrt(Math.pow(pos.labelX - pos.x, 2) + Math.pow(pos.labelY - pos.y, 2));
                      const actualPos = pos.actualX ? `(actual: ${pos.actualX.toFixed(1)}%, ${pos.actualY.toFixed(1)}%)` : '';
                      console.log(`  ${pos.process.name}: bubble(${pos.x.toFixed(1)}%, ${pos.y.toFixed(1)}%) ${actualPos} → label(${pos.labelX.toFixed(1)}%, ${pos.labelY.toFixed(1)}%) dist=${distance.toFixed(1)}%`);
                    });
                    
                    return bubblePositions.map(({ process, index, x, y, actualX, actualY, bubbleSize, roiPercentage, labelX, labelY, isOffChart }) => {
                      // Determine if we need a connector line
                      const labelDistance = Math.sqrt(Math.pow(labelX - x, 2) + Math.pow(labelY - y, 2));
                      
                      // Check if there are nearby bubbles (clustered/crowded area)
                      const nearbyBubbles = bubblePositions.filter(other => {
                        if (other.process.id === process.id) return false;
                        const dist = Math.sqrt(Math.pow(other.x - x, 2) + Math.pow(other.y - y, 2));
                        return dist < 8; // Within 8% = very close bubbles
                      });
                      
                      const hasCloseNeighbors = nearbyBubbles.length >= 1;
                      
                      // Show connector if:
                      // 1. Label moved far (>8%), OR
                      // 2. Bubbles are clustered together (even if label barely moved)
                      const needsConnector = labelDistance > 8 || hasCloseNeighbors;

                      return (
                        <React.Fragment key={process.id}>
                          {/* Connector line from bubble to label */}
                          {needsConnector && (
                            <svg
                              className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
                              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
                            >
                              <line
                                x1={`${x}%`}
                                y1={`${y}%`}
                                x2={`${labelX}%`}
                                y2={`${labelY}%`}
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                                className="text-gray-400 dark:text-gray-600 opacity-50"
                              />
                            </svg>
                          )}


                          
                          {/* Bubble (always visible, positioned at clamped coordinates) */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute ${
                                    process.isStartingProcess ? 'z-30' : 'z-25'
                                  }`}
                                  style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                  }}
                                  data-process-name={process.name}
                                  data-roi={roiPercentage.toFixed(1)}
                                  data-x-position={actualX?.toFixed(2) || x.toFixed(2)}
                                  data-y-position={actualY?.toFixed(2) || y.toFixed(2)}
                                  onMouseEnter={() => setHoveredProcessId(process.id)}
                                  onMouseLeave={() => setHoveredProcessId(null)}
                                >
                                  <div className="relative group">
                                    {/* Bubble centered at exact X,Y */}
                                    <div 
                                      className={`cursor-pointer transition-all ${
                                        hoveredProcessId === process.id ? 'scale-125' : 'hover:scale-110'
                                      }`} 
                                      style={{ transform: 'translate(-50%, -50%)' }}
                                    >
                                      {process.isStartingProcess && (
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce drop-shadow-lg">
                                          ⭐
                                        </div>
                                      )}
                                      <div
                                        className={`rounded-full ${
                                          getEngineColor(process.engine)
                                        } border-3 ${
                                          process.isStartingProcess 
                                            ? 'border-yellow-400 ring-4 ring-yellow-400/60 shadow-2xl shadow-yellow-500/50' 
                                            : 'border-white dark:border-gray-800 shadow-xl'
                                        } group-hover:scale-125 group-hover:shadow-2xl transition-all duration-200`}
                                        style={{
                                          width: `${bubbleSize}px`,
                                          height: `${bubbleSize}px`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm border-2 shadow-xl" side="top">
                                <div className="space-y-3 p-2">
                                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="font-bold text-sm">{process.name}</p>
                                    {process.isStartingProcess && (
                                      <Badge variant="default" className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-md">
                                        ⭐ Starting Process
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-3 h-3 rounded-full ${getEngineColor(process.engine)} shadow-sm`} />
                                      <span className="font-medium text-muted-foreground">{process.engine || 'No Engine'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                      <p className="text-muted-foreground">ROI (Risk-Adj):</p>
                                      <p className="font-semibold text-right text-blue-600 dark:text-blue-400">{(process.roi * 100).toFixed(1)}</p>
                                      
                                      <p className="text-muted-foreground">Impl. Effort:</p>
                                      <p className="font-semibold text-right">{(process.implementationEffort * 100).toFixed(1)}%</p>
                                      
                                      <p className="text-muted-foreground text-xs pl-2">• Cost (50%):</p>
                                      <p className="text-right">{formatCurrency(process.initialCost)}</p>
                                      
                                      <p className="text-muted-foreground text-xs pl-2">• Time (30%):</p>
                                      <p className="text-right">{process.implementationWeeks} weeks</p>
                                      
                                      <p className="text-muted-foreground text-xs pl-2">• Complexity (20%):</p>
                                      <p className="text-right">{process.complexityIndex.toFixed(1)}/10</p>
                                      
                                      <p className="text-muted-foreground mt-1">NPV:</p>
                                      <p className="font-semibold text-right mt-1">{formatCurrency(process.npv)}</p>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                      <Badge
                                        className={
                                          process.quadrant === 'Quick Wins'
                                            ? 'bg-green-600 shadow-md'
                                            : process.quadrant === 'Growth Engines'
                                            ? 'bg-blue-600 shadow-md'
                                            : process.quadrant === 'Nice to Haves'
                                            ? 'bg-yellow-600 shadow-md'
                                            : 'bg-red-600 shadow-md'
                                        }
                                      >
                                        {process.quadrant}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Dynamic label positioned separately - INTERACTIVE */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg border-2 backdrop-blur-sm cursor-pointer ${
                                    process.isStartingProcess ? 'z-31' : 'z-26'
                                  } ${
                                    process.isStartingProcess
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/70 dark:to-emerald-900/70 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600 shadow-green-500/30'
                                      : 'bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                                  } ${
                                    hoveredProcessId === process.id ? 'ring-2 ring-blue-400 scale-105' : ''
                                  } transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-blue-400`}
                                  style={{
                                    left: `${labelX}%`,
                                    top: `${labelY}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                  onMouseEnter={() => setHoveredProcessId(process.id)}
                                  onMouseLeave={() => setHoveredProcessId(null)}
                                >
                                  {process.name}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm border-2 shadow-xl" side="top">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <h4 className="font-semibold text-base">{process.name}</h4>
                                    <Badge className={getEngineColor(process.engine).replace('bg-', 'bg-opacity-20 text-')}>
                                      {process.engine || 'Unknown'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                    <p className="text-muted-foreground">ROI:</p>
                                    <p className="font-semibold text-right">{(process.roi * 100).toFixed(1)}%</p>
                                    
                                    <p className="text-muted-foreground">Implementation Effort:</p>
                                    <p className="font-semibold text-right">{(process.implementationEffort * 100).toFixed(1)}%</p>
                                    
                                    <p className="text-muted-foreground text-xs pl-2">• Cost (50%):</p>
                                    <p className="text-right">{formatCurrency(process.initialCost)}</p>
                                    
                                    <p className="text-muted-foreground text-xs pl-2">• Time (30%):</p>
                                    <p className="text-right">{process.implementationWeeks} weeks</p>
                                    
                                    <p className="text-muted-foreground text-xs pl-2">• Complexity (20%):</p>
                                    <p className="text-right">{process.complexityIndex.toFixed(1)}/10</p>
                                    
                                    <p className="text-muted-foreground mt-1">NPV:</p>
                                    <p className="font-semibold text-right mt-1">{formatCurrency(process.npv)}</p>
                                  </div>
                                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                    <Badge
                                      className={
                                        process.quadrant === 'Quick Wins'
                                          ? 'bg-green-600 shadow-md'
                                          : process.quadrant === 'Growth Engines'
                                          ? 'bg-blue-600 shadow-md'
                                          : process.quadrant === 'Nice to Haves'
                                          ? 'bg-yellow-600 shadow-md'
                                          : 'bg-red-600 shadow-md'
                                      }
                                    >
                                      {process.quadrant}
                                    </Badge>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </React.Fragment>
                      );
                    });
                  })()}
                  {/* X-axis tick marks */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 z-50 pointer-events-none" style={{ bottom: '-3rem' }}>
                    <div className="relative w-full h-full">
                      {/* X-axis labels positioned using EXACT same % system as bubbles */}
                      <div className="absolute inset-0 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {/* Left scale labels (0-50%) */}
                        <span className="absolute bg-white/95 dark:bg-gray-900/95 px-1.5 py-0.5 rounded border border-gray-400 dark:border-gray-500 shadow-sm" style={{ left: '5%', top: '0', transform: 'translateX(-50%)' }}>0</span>
                        <span className="absolute opacity-70 bg-white/90 dark:bg-gray-900/90 px-1 py-0.5 rounded shadow-sm" style={{ left: '27.5%', top: '0', transform: 'translateX(-50%)' }}>25</span>
                        
                        {/* Center threshold at 50% ROI */}
                        <span className="absolute font-bold text-green-700 dark:text-green-300 bg-green-100/95 dark:bg-green-900/95 px-2 py-1 rounded border-2 border-green-500 shadow-md" style={{ left: '50%', top: '0', transform: 'translateX(-50%)' }}>⚡ 50</span>
                          
                          {/* Right scale labels (50%-max) */}
                          <span className="absolute opacity-70 bg-white/90 dark:bg-gray-900/90 px-1 py-0.5 rounded shadow-sm" style={{ left: '72.5%', top: '0', transform: 'translateX(-50%)' }}>
                            {Math.round(50 + (actualMaxROI * 100 - 50) * 0.5)}
                          </span>
                          <span className="absolute bg-white/95 dark:bg-gray-900/95 px-1.5 py-0.5 rounded border border-gray-400 dark:border-gray-500 shadow-sm" style={{ left: '95%', top: '0', transform: 'translateX(-50%)' }}>
                            {Math.round(actualMaxROI * 100)}
                          </span>
                        </div>
                        {/* Axis label */}
                        <div className="absolute w-full text-center" style={{ top: '1.75rem' }}>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap tracking-wide bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded shadow-sm">
                            Risk-Adjusted ROI →
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom quadrant labels - FIXED 50/50 width */}
                    <div className="absolute left-0 w-full flex gap-4 z-40" style={{ bottom: '-6rem' }}>
                      <div className="px-4 py-2 rounded-lg bg-gradient-to-tr from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg backdrop-blur-sm" style={{ width: '50%', textAlign: 'center' }}>
                        <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300">🟨 Nice to Haves</div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">ROI &lt; 100, Low Effort</div>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-gradient-to-tl from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-950/30 border-2 border-green-300 dark:border-green-700 shadow-lg backdrop-blur-sm" style={{ width: '50%', textAlign: 'center' }}>
                        <div className="text-sm font-bold text-green-700 dark:text-green-300">🟩 Quick Wins</div>
                        <div className="text-xs text-green-600 dark:text-green-400">ROI ≥ 100, Low Effort</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Legend</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Color coding */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Engine Color Coding:</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />
                          <span className="text-xs">Value Creation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                          <span className="text-xs">Marketing/Sales</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                          <span className="text-xs">Value Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                          <span className="text-xs">Finance</span>
                        </div>
                      </div>
                    </div>
                    {/* Bubble size */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Bubble Size = NPV:</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-gray-400 shadow-sm" />
                          <span className="text-xs">{formatCurrency(minNPV)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gray-500 shadow-sm" />
                          <span className="text-xs">Mid</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-gray-600 shadow-sm" />
                          <span className="text-xs">{formatCurrency(maxNPV)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process table */}
            <div className="rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden bg-white dark:bg-gray-950">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                    <TableHead className="font-bold">Process</TableHead>
                    <TableHead className="font-bold">Engine</TableHead>
                    <TableHead className="text-right font-bold">ROI</TableHead>
                    <TableHead className="text-right font-bold">Impl. Effort</TableHead>
                    <TableHead className="text-right font-bold">NPV</TableHead>
                    <TableHead className="text-right font-bold">Complexity</TableHead>
                    <TableHead className="font-bold">Quadrant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixData
                    .sort((a, b) => {
                      // Sort by ROI first, then by lowest implementation effort
                      const roiDiff = b.roi - a.roi;
                      if (Math.abs(roiDiff) > 0.1) return roiDiff;
                      return a.implementationEffort - b.implementationEffort;
                    })
                    .map((process) => (
                      <TableRow key={process.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            {process.isStartingProcess && <span className="text-lg">⭐</span>}
                            {process.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getEngineColor(process.engine)} shadow-sm`} />
                            <span className="text-xs font-medium">{process.engine || 'None'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                          {(process.roi * 100).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={process.implementationEffort > 0.4 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                            {(process.implementationEffort * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(process.npv)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                            {process.complexityIndex.toFixed(1)}/10
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              process.quadrant === 'Quick Wins'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-md border border-green-400'
                                : (process.quadrant === 'Strategic Bets' || process.quadrant === 'Growth Engines')
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md border border-blue-400'
                                : process.quadrant === 'Nice to Haves'
                                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 shadow-md border border-yellow-400'
                                : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-md border border-red-400'
                            }
                          >
                            {process.quadrant}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
