import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
  roi: number; // Risk-adjusted ROI (0-3 scale typically)
  executionHealth: number; // 0-1 scale (budget control)
  riskFactor: number; // 0-1 scale (EMV-based)
  npv: number; // Risk-adjusted NPV (dollars)
  r_adj: number; // Risk-adjusted discount rate
  cfoScore: number; // Normalized CFO Score (0-10 scale)
  // Legacy metrics for comparison (optional)
  complexityIndex: number; // 0-10 scale
  implementationWeeks: number; // original weeks value for display
  quadrant: 'Quick Wins' | 'Big Hitters' | 'Nice to Haves' | 'Deprioritize';
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

// NEW: Fixed quadrant thresholds based on CFO Score (not relative)
const getQuadrantFromCFOScore = (cfoScore: number, npv: number, roi: number, emv: number, initialCost: number): 'Quick Wins' | 'Big Hitters' | 'Nice to Haves' | 'Deprioritize' => {
  // Fixed enterprise thresholds
  let quadrant: 'Quick Wins' | 'Big Hitters' | 'Nice to Haves' | 'Deprioritize';
  
  if (cfoScore >= 7.5) {
    quadrant = 'Quick Wins';
  } else if (cfoScore >= 6.0) {
    quadrant = 'Big Hitters';
  } else if (cfoScore >= 4.5) {
    quadrant = 'Nice to Haves';
  } else {
    quadrant = 'Deprioritize';
  }
  
  // Optional gating by efficiency ratios
  const cost_to_value = initialCost / Math.max(npv, 1);
  const risk_to_value = (emv / Math.max(initialCost, 1)) / Math.max(roi, 0.01);
  
  if ((cost_to_value > 1.0 || risk_to_value > 0.75) && cfoScore < 7.5) {
    quadrant = 'Deprioritize';
  }
  
  return quadrant;
};

// REMOVED: Old CFO Score calculation - replaced with NPV-based system
// See calculateCFOScoreComponents in utils/calculations.ts

// Normalize value to 0-10 scale
const normalizeToScale = (value: number, min: number, max: number): number => {
  if (max === min) return 5; // middle value if no variation
  const normalized = ((value - min) / (max - min)) * 10;
  return Math.max(0, Math.min(10, normalized));
};

export function OpportunityMatrix({ data, results, timeHorizonMonths = 36 }: OpportunityMatrixProps) {
  const matrixData = useMemo(() => {
    const processesData: MatrixProcess[] = [];
    const timeHorizonYears = timeHorizonMonths / 12;

    // Get global financial assumptions
    const discountRate = (data.globalDefaults.financialAssumptions?.discountRate || 10) / 100; // Convert % to decimal
    const riskPremiumFactor = data.globalDefaults.financialAssumptions?.riskPremiumFactor || 0.03;

    console.log('🔍 NPV-Based CFO Score Calculation Starting');
    console.log(`  Discount Rate: ${(discountRate * 100).toFixed(1)}%`);
    console.log(`  Risk Premium Factor: ${riskPremiumFactor}`);
    console.log(`  Time Horizon: ${timeHorizonYears} years`);

    data.processes.forEach(process => {
      const processResult = results.processResults.find(r => r.processId === process.id);
      if (!processResult) return;

      const group = data.groups.find(g => g.name === process.group);
      
      // IMPACT: Based on net savings over the time horizon (business value)
      // Scale annual savings by the time horizon (in years)
      const impactValue = (processResult.annualNetSavings || 0) * timeHorizonYears;
      
      // EFFORT: Based on implementation costs and time
      const implementationCosts = 
        (process.implementationCosts.upfrontCosts || 0) +
        (process.implementationCosts.trainingCosts || 0) +
        (process.implementationCosts.consultingCosts || 0) +
        (process.implementationCosts.softwareCost || 0) * 12;
      
      // CRITICAL: implementationTimelineMonths field actually stores WEEKS (UI shows "weeks")
      // Convert weeks to months for consistent calculation (1 month ≈ 4.33 weeks)
      const implementationWeeks = process.implementationCosts.implementationTimelineMonths || 1;
      const implementationMonths = implementationWeeks / 4.33;
      const effortValue = implementationCosts + (implementationMonths * 5000);
      
      // SPEED: Inverse of implementation timeline (faster = higher score)
      // Shorter timeline = quicker results. Use weeks for granularity.
      const speedValue = implementationWeeks;
      
      // RISK: Based on complexity metrics from workflow editor
      // Processes with workflow metadata get risk values: 2 (Simple), 5 (Moderate), or 8 (Complex)
      // Processes WITHOUT workflow metadata default to 0 (no risk data available)
      let riskValue = 0; // Default to 0 (no risk assessment yet)
      
      if (process.complexityMetrics && process.complexityMetrics.riskValue !== undefined) {
        // Use the pre-calculated risk value from workflow complexity
        riskValue = process.complexityMetrics.riskValue;
        console.log(`📊 ✅ Using stored risk value for "${process.name}":`, riskValue, 
                    '(Category:', process.complexityMetrics.riskCategory + ',',
                    'Index:', process.complexityMetrics.complexityIndex + ')');
      } else if (process.complexityMetrics) {
        // Fallback: Calculate from scores if riskValue not stored
        const { inputsScore, stepsScore, dependenciesScore } = process.complexityMetrics;
        
        // Calculate complexity index: (0.4 * inputs) + (0.4 * steps) + (0.2 * dependencies)
        const complexityIndex = ((inputsScore || 0) * 0.4) + ((stepsScore || 0) * 0.4) + ((dependenciesScore || 0) * 0.2);
        
        // CRITICAL FIX: If complexity index is exactly 0, risk should be 0 (no metrics = no risk)
        // Only assign risk values when there's actual complexity data
        if (complexityIndex === 0) {
          riskValue = 0;
        } else if (complexityIndex < 4.0) {
          riskValue = 2;
        } else if (complexityIndex < 7.0) {
          riskValue = 5;
        } else {
          riskValue = 8;
        }
        console.log(`📊 ✅ Calculated risk value for "${process.name}":`, riskValue, '(Index:', complexityIndex + ')');
      } else {
        // No workflow metadata = Default risk of 0 (no risk data available)
        // Risk remains 0 until workflow complexity is analyzed via metadata
        console.log(`📊 ⚪ No workflow metadata for "${process.name}" - Risk: 0 (no risk factors)`);
      }

      // DEBUG: Enhanced logging for risk calculation
      if (process.name.toLowerCase().includes('invoice') || process.name === 'Intake' || process.name.toLowerCase().includes('intake')) {
        console.log('========================================');
        console.log('DETAILED RISK DEBUG FOR:', process.name);
        console.log('  Has complexityMetrics?', !!process.complexityMetrics);
        if (process.complexityMetrics) {
          console.log('  Full complexity data:', process.complexityMetrics);
          console.log('  - inputsCount:', process.complexityMetrics.inputsCount);
          console.log('  - stepsCount:', process.complexityMetrics.stepsCount);
          console.log('  - dependenciesCount:', process.complexityMetrics.dependenciesCount);
          console.log('  - inputsScore:', process.complexityMetrics.inputsScore);
          console.log('  - stepsScore:', process.complexityMetrics.stepsScore);
          console.log('  - dependenciesScore:', process.complexityMetrics.dependenciesScore);
          console.log('  - complexityIndex:', process.complexityMetrics.complexityIndex);
          console.log('  - riskCategory:', process.complexityMetrics.riskCategory);
          console.log('  - riskValue:', process.complexityMetrics.riskValue);
          console.log('  - autoGatherFromWorkflow:', process.complexityMetrics.autoGatherFromWorkflow);
          console.log('  ⚠️  SOURCE: This data was stored to the process object');
          console.log('  💡 WHY: Either manually entered in Advanced Metrics, or auto-saved from Workflow Builder');
        } else {
          console.log('  ⚪ NO COMPLEXITY METRICS FOUND');
          console.log('  This means workflow has NOT been configured');
          console.log('  Defaulting to: Risk = 0 (No risk assessment yet)');
        }
        console.log('  FINAL RISK VALUE USED:', riskValue);
        console.log('========================================');
      }

      rawData.push({
        process,
        processResult,
        group,
        impactValue,
        effortValue,
        speedValue,
        riskValue,
      });
    });

    // Find min/max for normalization
    const impactValues = rawData.map(d => d.impactValue);
    const effortValues = rawData.map(d => d.effortValue);
    const speedValues = rawData.map(d => d.speedValue);
    
    console.log(`💰 OpportunityMatrix using time horizon: ${timeHorizonMonths} months (${timeHorizonYears} years)`);
    const riskValues = rawData.map(d => d.riskValue);

    const minImpact = Math.min(...impactValues);
    const maxImpact = Math.max(...impactValues);
    const minEffort = Math.min(...effortValues);
    const maxEffort = Math.max(...effortValues);
    const minSpeed = Math.min(...speedValues);
    const maxSpeed = Math.max(...speedValues);
    const minRisk = Math.min(...riskValues);
    const maxRisk = Math.max(...riskValues);

    // Second pass: normalize and calculate scores
    rawData.forEach(({ process, processResult, group, impactValue, effortValue, speedValue, riskValue }) => {
      // Normalize to 0-10 scale
      const impact = normalizeToScale(impactValue, minImpact, maxImpact);
      const effort = normalizeToScale(effortValue, minEffort, maxEffort);
      // Speed: invert so shorter time = higher speed score
      const speed = 10 - normalizeToScale(speedValue, minSpeed, maxSpeed);
      
      // Risk: Use raw risk value directly (already on 0-10 scale from complexity metrics)
      // Risk values are: 0 (no metadata), 2 (Simple), 5 (Moderate), or 8 (Complex)
      const risk = riskValue;
      
      console.log(`📊 Scores for "${process.name}":`, {
        risk: risk.toFixed(1),
        rawRiskValue: riskValue,
        impact: impact.toFixed(1),
        effort: effort.toFixed(1),
        speed: speed.toFixed(1)
      });

      // Enhanced logging for impact calculation
      if (process.name.toLowerCase().includes('invoice')) {
        console.log(`💰 IMPACT CALCULATION for "${process.name}":`, {
          annualNetSavings: `${processResult.annualNetSavings.toFixed(0)}`,
          timeHorizonYears: `${timeHorizonYears} years`,
          impactValue: `${impactValue.toFixed(0)} (savings × years)`,
          impactNormalized: `${impact.toFixed(1)}/10`,
          implementationWeeks: `${speedValue} weeks`,
          implementationMonths: `${(speedValue / 4.33).toFixed(1)} months`,
          effortValue: `${effortValue.toFixed(0)}`,
          effortNormalized: `${effort.toFixed(1)}/10`,
          speedNormalized: `${speed.toFixed(1)}/10 (${speedValue} weeks)`,
          riskValue: `${risk.toFixed(1)}/10`,
        });
      }

      // Calculate CFO score
      const cfoScore = calculateCFOScore(impact, effort, speed, risk);

      // Determine quadrant
      const quadrant = getQuadrantFromScores(impact, effort);

      processesData.push({
        id: process.id,
        name: process.name,
        group: process.group,
        engine: group?.engine,
        impact,
        effort,
        speed,
        risk,
        cfoScore,
        impactValue,
        effortValue,
        implementationMonths: (process.implementationCosts.implementationTimelineMonths || 1) / 4.33, // Convert weeks to months
        implementationWeeks: process.implementationCosts.implementationTimelineMonths || 1, // Original weeks value
        quadrant,
        isStartingProcess: false,
      });
    });

    // Find the starting process: highest CFO score in Quick Wins quadrant
    const quickWins = processesData.filter(p => p.quadrant === 'Quick Wins');
    if (quickWins.length > 0) {
      quickWins.sort((a, b) => b.cfoScore - a.cfoScore);
      quickWins[0].isStartingProcess = true;
    }

    return processesData;
  }, [data.processes, data.groups, results.processResults, timeHorizonMonths]);

  const getQuadrantColor = (quadrant: string): string => {
    switch (quadrant) {
      case 'Quick Wins':
        return 'bg-green-100/50 dark:bg-green-900/20';
      case 'Nice to Haves':
        return 'bg-yellow-100/50 dark:bg-yellow-900/20';
      case 'Deprioritize':
        return 'bg-red-100/50 dark:bg-red-900/20';
      case 'Big Hitters':
        return 'bg-blue-100/50 dark:bg-blue-900/20';
      default:
        return '';
    }
  };

  // Calculate bubble size scale
  const maxSavings = Math.max(...matrixData.map(p => p.impactValue), 1);
  const getBubbleSize = (savings: number) => {
    const baseSize = 12; // minimum size
    const maxSize = 32; // maximum size
    const scale = (savings / maxSavings) * (maxSize - baseSize);
    return baseSize + scale;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">Opportunity Matrix</CardTitle>
                <CardDescription className="text-base">
                  CFO-weighted prioritization based on Impact, Effort, Speed, and Risk
                </CardDescription>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/30 hover:border-primary/40 text-sm text-primary transition-all cursor-help shadow-sm hover:shadow">
                    <HelpCircle className="h-4 w-4" />
                    <span className="font-medium">
                      How are scores calculated?
                    </span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-96" side="right" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        CFO-Weighted Scoring Formula
                      </h4>
                      <div className="bg-primary/5 p-3 rounded-md border border-primary/20 mb-2">
                        <code className="text-sm">
                          CFO Score = (0.6 × Impact/Effort) + (0.3 × Speed) - (0.1 × Risk)
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This formula prioritizes processes that deliver maximum business value with minimal implementation complexity, 
                        rewarding quick time-to-value while accounting for risk.
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t space-y-2">
                      <h5 className="font-semibold text-sm">Score Components (0-10 scale):</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong className="text-primary">Impact (60%):</strong>
                          <p className="text-muted-foreground">Annual benefit value normalized across all processes</p>
                        </div>
                        <div>
                          <strong className="text-blue-600 dark:text-blue-400">Effort:</strong>
                          <p className="text-muted-foreground">Implementation cost (divides Impact for ROI ratio)</p>
                        </div>
                        <div>
                          <strong className="text-green-600 dark:text-green-400">Speed (30%):</strong>
                          <p className="text-muted-foreground">Inverse of implementation timeline (faster = higher score)</p>
                        </div>
                        <div>
                          <strong className="text-red-600 dark:text-red-400">Risk (-10%):</strong>
                          <p className="text-muted-foreground">Workflow complexity: Simple=2, Moderate=5, Complex=8, No Data=0</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <h5 className="font-semibold text-sm mb-2">Risk Calculation:</h5>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                        <code className="text-xs block mb-2">
                          Complexity Index = (0.4 × Inputs) + (0.4 × Steps) + (0.2 × Dependencies)
                        </code>
                        <div className="text-xs space-y-1">
                          <p>• <strong>Simple:</strong> Index &lt; 4.0 → Risk = 2</p>
                          <p>• <strong>Moderate:</strong> Index 4.0-6.9 → Risk = 5</p>
                          <p>• <strong>Complex:</strong> Index ≥ 7.0 → Risk = 8</p>
                          <p>• <strong>No Workflow:</strong> No metadata → Risk = 0</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 <strong>Note:</strong> Processes without workflow metadata default to Risk=0 (no assessment). 
                        Open the workflow editor to calculate precise risk scores.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Engines:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getEngineColor('Value Creation')}`} />
              <span className="text-xs">Value Creation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getEngineColor('Marketing and Sales')}`} />
              <span className="text-xs">Marketing and Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getEngineColor('Value Delivery')}`} />
              <span className="text-xs">Value Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getEngineColor('Finance')}`} />
              <span className="text-xs">Finance</span>
            </div>
          </div>

          {/* Add spacing wrapper for labels */}
          <div className="space-y-2">
            {/* Top quadrant labels (outside the matrix) */}
            <div className="flex justify-around px-12">
              <div className="px-3 py-1 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                <div className="text-sm font-bold text-red-700 dark:text-red-400">Deprioritize</div>
              </div>
              <div className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                <div className="text-sm font-bold text-blue-700 dark:text-blue-400">Big Hitters</div>
              </div>
            </div>

            {/* Matrix container with axis labels outside */}
            <div className="flex gap-2">
              {/* Y-axis label (left side, outside) */}
              <div className="flex items-center justify-center w-12 flex-shrink-0">
                <div className="transform -rotate-90 text-sm font-semibold whitespace-nowrap">
                  Effort (Implementation Difficulty & Cost) →
                </div>
              </div>

              {/* Main matrix */}
              <div className="flex-1">
                <div className="relative w-full h-[600px] border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-visible bg-white dark:bg-gray-950 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' }}>
                  {/* Quadrant backgrounds - faint colors */}
                  <div className={`absolute top-0 right-0 w-1/2 h-1/2 ${getQuadrantColor('Big Hitters')}`} />
                  <div className={`absolute top-0 left-0 w-1/2 h-1/2 ${getQuadrantColor('Deprioritize')}`} />
                  <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 ${getQuadrantColor('Nice to Haves')}`} />
                  <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 ${getQuadrantColor('Quick Wins')}`} />

                  {/* Axis lines (thicker, darker) */}
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400 dark:bg-gray-600 z-0" />
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 dark:bg-gray-600 z-0" />

                  {/* Plot processes */}
                  {matrixData.map(process => {
                    // Convert 0-10 scale to pixel position
                    // X: 0 = left edge (5%), 10 = right edge (95%)
                    // Y: 0 = bottom edge (95%), 10 = top edge (5%)
                    const x = 5 + (process.impact / 10) * 90;
                    const y = 95 - (process.effort / 10) * 90;
              
                    const bubbleSize = getBubbleSize(process.impactValue);

                    return (
                      <TooltipProvider key={process.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute cursor-pointer transition-all hover:scale-110 ${
                                process.isStartingProcess ? 'z-20' : 'z-10'
                              }`}
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <div className="flex items-center gap-2 group">
                                {/* Process dot with engine color - bubble size based on savings */}
                                <div className="relative flex-shrink-0">
                                  {process.isStartingProcess && (
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-lg animate-pulse">
                                      ⭐
                                    </div>
                                  )}
                                  <div
                                    className={`rounded-full ${getEngineColor(process.engine)} border-2 ${
                                      process.isStartingProcess 
                                        ? 'border-yellow-400 ring-4 ring-yellow-400/50 shadow-lg' 
                                        : 'border-white dark:border-gray-900 shadow-md'
                                    } group-hover:scale-125 transition-transform`}
                                    style={{
                                      width: `${bubbleSize}px`,
                                      height: `${bubbleSize}px`,
                                    }}
                                  />
                                </div>
                                
                                {/* Process name label - no truncation */}
                                <div 
                                  className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-sm border ${
                                    process.isStartingProcess
                                      ? 'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700'
                                      : 'bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                                  } group-hover:shadow-lg transition-all`}
                                >
                                  {process.name}
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="top">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{process.name}</p>
                                {process.isStartingProcess && (
                                  <Badge variant="default" className="bg-green-600">
                                    Starting Process
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getEngineColor(process.engine)}`} />
                                  <span className="text-muted-foreground">{process.engine || 'No Engine'}</span>
                                </div>
                                <p><strong>Group:</strong> {process.group}</p>
                                <p><strong>CFO Score:</strong> {process.cfoScore.toFixed(2)}</p>
                                <p><strong>Impact:</strong> {process.impact.toFixed(1)}/10 ({formatCurrency(process.impactValue)} cumulative)</p>
                                <p><strong>Effort:</strong> {process.effort.toFixed(1)}/10 ({formatCurrency(process.effortValue)})</p>
                                <p><strong>Speed:</strong> {process.speed.toFixed(1)}/10 ({process.implementationWeeks} weeks)</p>
                                <p><strong>Risk:</strong> {process.risk.toFixed(1)}/10</p>
                                <p><strong>Timeline:</strong> {process.implementationWeeks} weeks ({process.implementationMonths.toFixed(1)} months)</p>
                                <p><strong>Quadrant:</strong> {process.quadrant}</p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom quadrant labels (closer to edge, like top ones) */}
            <div className="flex justify-around px-12">
              <div className="px-3 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                <div className="text-sm font-bold text-yellow-700 dark:text-yellow-400">Nice to Haves</div>
              </div>
              <div className="px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                <div className="text-sm font-bold text-green-700 dark:text-green-400">Quick Wins ⭐</div>
              </div>
            </div>

            {/* X-axis label (bottom, outside) */}
            <div className="text-center ml-12">
              <div className="text-sm font-semibold py-2">
                Impact (Business Value & Strategic Gain) →
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Quick Wins', 'Nice to Haves', 'Big Hitters', 'Deprioritize'].map(quadrant => {
              const count = matrixData.filter(p => p.quadrant === quadrant).length;
              return (
                <div key={quadrant} className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{quadrant}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Process Prioritization Data</CardTitle>
          <CardDescription>
            Detailed scores and metrics for each process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead className="text-right">CFO Score</TableHead>
                  <TableHead className="text-right">Impact</TableHead>
                  <TableHead className="text-right">Effort</TableHead>
                  <TableHead className="text-right">Speed</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Quadrant</TableHead>
                  <TableHead className="text-right">Annual Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrixData
                  .sort((a, b) => b.cfoScore - a.cfoScore)
                  .map(process => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {process.isStartingProcess && <span>⭐</span>}
                          {process.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getEngineColor(process.engine)}`} />
                          <span className="text-xs">{process.engine || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {process.cfoScore.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{process.impact.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{process.effort.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{process.speed.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{process.risk.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            process.quadrant === 'Quick Wins'
                              ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400'
                              : process.quadrant === 'Big Hitters'
                              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400'
                              : process.quadrant === 'Nice to Haves'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400'
                          }
                        >
                          {process.quadrant}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(process.impactValue)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
