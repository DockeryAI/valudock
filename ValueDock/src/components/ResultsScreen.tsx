import React, { useState } from 'react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Clock, DollarSign, Target, Download, Calculator, PieChart, Users, BarChart3, Filter, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InputData, ROIResults, CashflowData, formatCurrency, formatPercentage, formatNumber, getMonthlyTaskVolume, getTimePerTaskInMinutes, generateCashflowData } from './utils/calculations';
import { ROI } from '../services/roi';
import { CFOSummaryDashboard } from './CFOSummaryDashboard';
import { WaterfallChart } from './WaterfallChart';
import { SensitivityAnalysis as ScenarioAnalysis } from './SensitivityAnalysis';
import { FTEImpactChart } from './FTEImpactChart';
import { InternalCostsReports } from './InternalCostsReports';
import { LandscapePrompt } from './LandscapePrompt';
import { useRequiresLandscape } from './ui/use-landscape';
import { mustArray } from '../utils/arrayHelpers';

interface ResultsScreenProps {
  data: InputData;
  results: ROIResults;
  cashflowData: CashflowData[];
  onExport: () => void;
  onCalculate: () => void;
  selectedProcessIds: string[];
  setSelectedProcessIds: (ids: string[]) => void;
  hardCostsOnlyMode: boolean;
  setHardCostsOnlyMode: (mode: boolean) => void;
  costClassification?: any;
  timeHorizonMonths: number;
  setTimeHorizonMonths: (value: number) => void;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  trend,
  onClick
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}) => (
  <Card className={`${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`} onClick={onClick}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend && (
              <Badge variant={trend === 'positive' ? 'default' : trend === 'negative' ? 'destructive' : 'secondary'}>
                {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '—'}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

export function ResultsScreen({ 
  data, 
  results, 
  cashflowData, 
  onExport, 
  onCalculate,
  selectedProcessIds,
  setSelectedProcessIds,
  hardCostsOnlyMode,
  setHardCostsOnlyMode,
  costClassification,
  timeHorizonMonths,
  setTimeHorizonMonths
}: ResultsScreenProps) {
  // ✅ CRITICAL: Validate all array props at component boundary - THROWS on error
  const safeProcesses = mustArray('ResultsScreen.data.processes', data.processes);
  const safeGroups = mustArray('ResultsScreen.data.groups', data.groups);
  const safeSelectedIds = mustArray<string>('ResultsScreen.selectedProcessIds', selectedProcessIds);
  const safeProcessResults = mustArray('ResultsScreen.results.processResults', results.processResults);
  const safeCashflowData = mustArray('ResultsScreen.cashflowData', cashflowData);
  
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
  
  const { requiresLandscape, isMobile, isLandscape } = useRequiresLandscape();
  const [selectedMetric, setSelectedMetric] = React.useState<string | null>(null);
  const [cashflowMonths, setCashflowMonths] = React.useState(36); // Default 36 months for cashflow chart
  
  // Create filtered data with only selected processes
  const filteredData = React.useMemo(() => {
    return {
      ...safeData,
      processes: safeProcesses.map(p => ({
        ...p,
        selected: safeSelectedIds.includes(p.id)
      }))
    };
  }, [safeData, safeSelectedIds]);
  
  // Recalculate NPV/IRR with the selected time horizon and filtered processes
  const adjustedResults = React.useMemo(() => {
    // ✅ HARD GATE: Block calculation if cost classification is null or undefined
    if (!costClassification || costClassification === null || costClassification === undefined) {
      console.log('[ResultsScreen] 🚫 ROI calculation blocked - cost classification is null/undefined', {
        costClassification,
        type: typeof costClassification,
      });
      return {
        annualNetSavings: 0,
        totalCost: 0,
        roi: 0,
        paybackPeriodMonths: 0,
        npv: 0,
        totalFTEsFreed: 0,
        processResults: [],
      };
    }
    // Use ROI service for local calculation (no controller/debouncing)
    return ROI.calculate(filteredData, timeHorizonMonths, costClassification) || {
      annualNetSavings: 0,
      totalCost: 0,
      roi: 0,
      paybackPeriodMonths: 0,
      npv: 0,
      totalFTEsFreed: 0,
      processResults: [],
    };
  }, [filteredData, timeHorizonMonths, costClassification]);
  
  // Filter for hard costs only when toggle is on
  const displayResults = React.useMemo(() => {
    if (!hardCostsOnlyMode) {
      return adjustedResults;
    }
    
    // When hard costs only mode is on, recalculate totals excluding soft savings
    const hardOnlyProcessResults = adjustedResults.processResults.map(pr => ({
      ...pr,
      // Zero out soft savings components
      softSavings: 0,
      revenueUplift: 0,
      complianceRiskReduction: 0,
      internalCostSavings: {
        ...pr.internalCostSavings,
        softDollarSavings: 0,
        // Zero out all soft cost categories
        trainingOnboardingSavings: 0,
        shadowSystemsSavings: 0,
        infrastructureSavings: 0,
        itSupportSavings: 0,
        errorRemediationSavings: 0,
        auditComplianceSavings: 0,
        downtimeSavings: 0,
        decisionDelaySavings: 0,
        staffCapacityDragSavings: 0,
        customerImpactSavings: 0,
        totalLaborWorkforceSavings: pr.internalCostSavings.overtimePremiumsSavings,
        totalITOperationsSavings: pr.internalCostSavings.softwareLicensingSavings,
        totalComplianceRiskSavings: 0,
        totalOpportunityCostSavings: 0,
        totalInternalCostSavings: pr.internalCostSavings.hardDollarSavings
      },
      // Recalculate annual net savings with only hard costs
      annualNetSavings: pr.hardSavings,
      monthlySavings: pr.hardSavings / 12
    }));
    
    // Recalculate aggregate totals
    const totalHardSavings = hardOnlyProcessResults.reduce((sum, pr) => sum + pr.hardSavings, 0);
    const annualCost = adjustedResults.annualCost;
    const totalAnnualNetSavings = totalHardSavings - annualCost; // Net after software costs
    const totalMonthlySavings = totalAnnualNetSavings / 12;
    
    // Recalculate ROI based on hard savings only
    const roiPercentage = annualCost > 0 ? (totalAnnualNetSavings / annualCost) * 100 : 0;
    
    // Recalculate payback period
    // totalMonthlySavings is already net after software costs, so we use it directly
    const totalUpfrontCosts = adjustedResults.totalUpfrontCosts;
    const paybackPeriod = totalMonthlySavings > 0 ? totalUpfrontCosts / totalMonthlySavings : 999;
    
    // Recalculate process-level ROI and payback for each process
    const updatedProcessResults = hardOnlyProcessResults.map(pr => {
      const processSoftwareCost = pr.implementationCosts.softwareCost;
      const processAnnualCost = processSoftwareCost * 12;
      const processROI = processAnnualCost > 0 ? (pr.annualNetSavings / processAnnualCost) * 100 : 0;
      const processMonthlyNet = pr.monthlySavings - processSoftwareCost;
      const processPayback = processMonthlyNet > 0 ? pr.totalInvestment / processMonthlyNet : 999;
      
      return {
        ...pr,
        roiPercentage: processROI,
        paybackPeriod: processPayback,
        paybackPeriodMonths: processPayback
      };
    });
    
    // Recalculate NPV and EBITDA for hard costs only
    // When hard savings are $0, NPV should also be $0 (or just negative implementation costs)
    
    // Define constants outside the if block so they're available for EBITDA calculation
    const discountRate = 10; // Default discount rate
    const inflationRate = 3; // Default inflation rate
    
    let npvHardOnly = 0;
    
    if (totalHardSavings > 0 || totalUpfrontCosts > 0) {
      const cashFlows = [-totalUpfrontCosts];
      
      // Use hard savings only for monthly cash flow
      const monthlyNetSavings = totalHardSavings / 12;
      const monthlySoftwareCosts = annualCost / 12;
      
      // Build monthly cash flows (using the same time horizon as the main calculation)
      for (let month = 1; month <= timeHorizonMonths; month++) {
        const year = month / 12;
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, year);
        const monthlyNet = (monthlyNetSavings - monthlySoftwareCosts) * inflationMultiplier;
        cashFlows.push(monthlyNet);
      }
      
      // Calculate NPV with monthly discount rate
      const monthlyDiscountRate = discountRate / 12;
      const calculateNPV = (cashFlows: number[], rate: number): number => {
        return cashFlows.reduce((npv, cashFlow, index) => {
          return npv + cashFlow / Math.pow(1 + rate / 100, index);
        }, 0);
      };
      npvHardOnly = calculateNPV(cashFlows, monthlyDiscountRate);
    }
    
    // Calculate EBITDA for hard costs only
    const taxRate = 0.25; // 25% default tax rate
    const baseEBITDA = totalAnnualNetSavings;
    const ebitdaImpactHardOnly = baseEBITDA * (1 - taxRate);
    
    // Calculate EBITDA by year for hard costs only
    const numberOfYears = Math.ceil(timeHorizonMonths / 12);
    const ebitdaByYear: Record<string, number> = {};
    for (let year = 1; year <= numberOfYears; year++) {
      ebitdaByYear[`year${year}`] = baseEBITDA * Math.pow(1 + inflationRate / 100, year - 1) * (1 - taxRate);
    }
    
    const ebitdaByYearCompat = {
      year1: ebitdaByYear.year1 || 0,
      year2: ebitdaByYear.year2 || 0,
      year3: ebitdaByYear.year3 || 0,
      ...ebitdaByYear
    };
    
    return {
      ...adjustedResults,
      processResults: updatedProcessResults,
      totalAnnualNetSavings,
      totalMonthlySavings,
      monthlySavings: totalMonthlySavings,
      annualNetSavings: totalAnnualNetSavings,
      roiPercentage,
      paybackPeriod,
      totalSoftSavings: 0,
      totalHardSavings,
      totalRevenueUplift: 0,
      totalComplianceRiskReduction: 0,
      totalAttritionSavings: 0,
      fteProductivityUplift: 0,
      totalErrorReductionSavings: 0,
      totalPromptPaymentBenefit: 0,
      peakSeasonSavings: 0,
      overtimeSavings: 0,
      slaComplianceValue: 0,
      totalInternalCostSavings: updatedProcessResults.reduce((sum, pr) => sum + pr.internalCostSavings.totalInternalCostSavings, 0),
      totalInternalHardDollarSavings: updatedProcessResults.reduce((sum, pr) => sum + pr.internalCostSavings.hardDollarSavings, 0),
      totalInternalSoftDollarSavings: 0,
      npv: npvHardOnly,
      ebitdaImpact: ebitdaImpactHardOnly,
      ebitdaByYear: ebitdaByYearCompat
    };
  }, [adjustedResults, hardCostsOnlyMode]);
  
  // Build dynamic hard costs list based on cost classification from admin panel
  const hardCostsList = useMemo(() => {
    // Map of internal cost keys to user-friendly labels
    const costLabels: Record<string, string> = {
      laborCosts: 'Labor Costs',
      trainingOnboardingCosts: 'Training & Onboarding',
      shadowSystemsCosts: 'Shadow Systems',
      turnoverCosts: 'Turnover/Attrition',
      errorRemediationCosts: 'Error Remediation',
      downtimeCosts: 'Downtime',
      decisionDelays: 'Decision Delays',
      staffCapacityDrag: 'Staff Capacity Drag',
      customerImpactCosts: 'Customer Impact',
      overtimePremiums: 'Overtime Premiums',
      softwareLicensing: 'Software Licensing',
      infrastructureCosts: 'Infrastructure',
      itSupportMaintenance: 'IT Support & Maintenance',
      apiLicensing: 'API Licensing',
      auditComplianceCosts: 'Audit & Compliance',
      slaPenalties: 'SLA Penalties'
    };
    
    // If we have cost classification from admin, use it
    if (costClassification?.hardCosts && Array.isArray(costClassification.hardCosts)) {
      const hardCostLabels = costClassification.hardCosts
        .map((costKey: string) => costLabels[costKey])
        .filter(Boolean); // Remove any undefined labels
      
      return hardCostLabels;
    }
    
    // Fallback to default (Software Licensing + Infrastructure)
    return ['Software Licensing', 'Infrastructure'];
  }, [costClassification]);
  
  // Process selection helper functions
  const toggleProcess = (processId: string) => {
    setSelectedProcessIds(prev => 
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };
  
  const selectAllProcesses = () => {
    setSelectedProcessIds(data.processes.map(p => p.id));
  };
  
  const deselectAllProcesses = () => {
    setSelectedProcessIds([]);
  };
  
  const selectHardCostsOnly = () => {
    // Select only processes that have hard cost savings (non-zero hard savings)
    const hardCostProcesses = data.processes
      .filter(p => {
        // A process has hard costs if it has any of these:
        // - Labor savings
        // - Error reduction
        // - Prompt payment benefit
        // - Internal hard dollar savings
        return p.taskVolume > 0 || 
               (p.errorReworkCosts?.errorRate && p.errorReworkCosts.errorRate > 0) ||
               (p.internalCosts && (
                 p.internalCosts.overtimePremiums > 0 ||
                 p.internalCosts.softwareLicensing > 0
               ));
      })
      .map(p => p.id);
    setSelectedProcessIds(hardCostProcesses);
  };
  
  const toggleHardCostsOnly = () => {
    // Simply toggle the mode without changing process selection
    setHardCostsOnlyMode(!hardCostsOnlyMode);
  };
  
  // Generate cashflow data based on the timeline slider and filtered/adjusted results
  const dynamicCashflowData = React.useMemo(() => {
    // Create a modified input data with process results from displayResults
    const dataForCashflow = {
      ...filteredData,
      processes: filteredData.processes.map(p => ({
        ...p,
        // Keep the process data but the cashflow will use displayResults
      }))
    };
    // Pass displayResults which has hard-costs-only filtering applied
    return generateCashflowData(dataForCashflow, cashflowMonths, displayResults);
  }, [filteredData, cashflowMonths, displayResults]);
  
  const chartData = dynamicCashflowData.map(item => ({
    month: item.month,
    'Cumulative Savings': item.cumulativeSavings,
    'Cumulative Cost': item.cumulativeCost,
    'Net Cashflow': item.netCashflow
  }));

  // Calculate synchronized Y-axis domain for both left and right axes
  const yAxisDomain = React.useMemo(() => {
    const allValues = chartData.flatMap(item => [
      item['Cumulative Savings'],
      item['Cumulative Cost'],
      item['Net Cashflow']
    ]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    // Add 10% padding
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  const barChartData = [
    {
      category: 'Time Saved',
      'Hours per Month': displayResults.monthlyTimeSaved,
      'Annual Hours': displayResults.annualTimeSavings
    },
    {
      category: 'Cost Impact',
      'Monthly Savings': displayResults.monthlySavings,
      'Annual Savings': displayResults.annualNetSavings
    }
  ];

  const getTrendFromROI = (roi: number) => {
    if (roi > 20) return 'positive';
    if (roi < 0) return 'negative';
    return 'neutral';
  };

  // Calculate additional metrics for new components
  const totalUpfrontCosts = displayResults.processResults.reduce((sum, r) => sum + r.totalInvestment, 0);
  const utilizationType = data.globalDefaults.utilizationImpact?.utilizationType || 'redeployed';
  const redeploymentValue = displayResults.fteProductivityUplift || 0;

  // Calculate actual break-even month from cashflow data
  const breakEvenMonth = React.useMemo(() => {
    // Find the first month where netCashflow becomes positive (not including month 0)
    const breakEvenData = dynamicCashflowData.find(item => item.month > 0 && item.netCashflow >= 0);
    return breakEvenData ? breakEvenData.month : null;
  }, [dynamicCashflowData]);
  
  // Sync payback period with break-even month from cashflow
  // Use this as the final results to display everywhere
  const finalResults = React.useMemo(() => {
    if (breakEvenMonth === null) {
      return displayResults;
    }
    return {
      ...displayResults,
      paybackPeriod: breakEvenMonth
    };
  }, [displayResults, breakEvenMonth]);

  // Custom tooltip for Cash Flow chart to show break-even point
  const CashFlowTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentMonth = Number(label);
      const isBreakEvenMonth = breakEvenMonth !== null && currentMonth === breakEvenMonth;
      
      return (
        <div 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: '#000000'
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px', color: '#000000' }}>
            Month {label}
            {isBreakEvenMonth && (
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 8px', 
                backgroundColor: '#166534', 
                color: '#ffffff', 
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                BREAK EVEN
              </span>
            )}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              color: '#000000', 
              marginBottom: '4px',
              fontSize: '14px'
            }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>●</span> {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-center md:text-left space-y-1 md:space-y-2 flex-1">
          <h1>Impact and ROI</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Comprehensive financial analysis
            {selectedProcessIds.length < data.processes.length && 
              ` (${selectedProcessIds.length} of ${data.processes.length} processes selected)`
            }
          </p>
        </div>
        <div className="flex gap-2 justify-center md:justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Select Processes</span>
                <span className="sm:hidden">Processes</span>
                {selectedProcessIds.length < data.processes.length && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedProcessIds.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter by Process</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={selectAllProcesses}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={deselectAllProcesses}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.processes.map(process => (
                    <div 
                      key={process.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleProcess(process.id);
                      }}
                    >
                      <Checkbox
                        id={process.id}
                        checked={selectedProcessIds.includes(process.id)}
                        onCheckedChange={() => {}}
                        className="pointer-events-none"
                      />
                      <label
                        htmlFor={process.id}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {process.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`flex items-center gap-2 border rounded-md px-3 py-2 transition-colors cursor-pointer ${
                    hardCostsOnlyMode ? 'bg-primary/10 border-primary/50' : 'bg-background'
                  }`}
                  onClick={toggleHardCostsOnly}
                >
                  <div className={`text-xs md:text-sm cursor-pointer whitespace-nowrap ${
                    hardCostsOnlyMode ? 'text-primary' : ''
                  }`}>
                    <span className="hidden sm:inline">Hard Costs Only</span>
                    <span className="sm:hidden">Hard $</span>
                  </div>
                  <Switch 
                    checked={hardCostsOnlyMode}
                    onCheckedChange={() => {}}
                    className="pointer-events-none"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-semibold">Hard Cost Categories:</p>
                  {hardCostsList.length > 0 ? (
                    <>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        {hardCostsList.map((cost, index) => (
                          <li key={index}>{cost}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        {hardCostsList.length} of 16 cost categories classified as "hard" in Admin → Costs
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No hard costs configured in Admin → Costs. All categories are soft costs.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1 border-t">
                    Toggle ON to show only hard cost savings. All soft costs will be excluded from calculations.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={onExport} className="gap-1 md:gap-2 text-xs md:text-sm">
            <Download className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Tabbed Interface for Different Views */}
      <Tabs defaultValue="executive" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-6 min-w-max md:min-w-0">
            <TabsTrigger value="executive" className="gap-1 md:gap-2 px-3 md:px-4">
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Executive</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-1 md:gap-2 px-3 md:px-4">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Cash Flow</span>
            </TabsTrigger>
            <TabsTrigger value="internal" className="gap-1 md:gap-2 px-3 md:px-4">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Internal Savings</span>
            </TabsTrigger>
            <TabsTrigger value="sensitivity" className="gap-1 md:gap-2 px-3 md:px-4">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Scenarios</span>
            </TabsTrigger>
            <TabsTrigger value="fte" className="gap-1 md:gap-2 px-3 md:px-4">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">FTE Impact</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="gap-1 md:gap-2 px-3 md:px-4">
              <PieChart className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Breakdown</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Executive Summary Tab */}
        <TabsContent value="executive" className="space-y-6 mt-6">
          {/* Time Horizon Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Time Horizon</span>
                <span className="text-muted-foreground">
                  {timeHorizonMonths} months ({(timeHorizonMonths / 12).toFixed(1)} years)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Slider
                  value={[timeHorizonMonths]}
                  onValueChange={(value) => setTimeHorizonMonths(value[0])}
                  min={12}
                  max={120}
                  step={1}
                  className="flex-1"
                />
                {/* Tick marks */}
                <div className="relative w-full h-6 px-2">
                  {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((month) => {
                    const position = ((month - 12) / (120 - 12)) * 100;
                    return (
                      <div
                        key={month}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="w-px h-2 bg-border" />
                        <span className="text-xs text-muted-foreground mt-0.5">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust the time horizon to see how NPV and IRR change over different periods. 
                Default is 36 months (3 years). Drag the slider to customize.
              </p>
            </CardContent>
          </Card>
          
          <CFOSummaryDashboard results={finalResults} hardCostsOnlyMode={hardCostsOnlyMode} />
        </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* Cashflow Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Cash Flow Analysis Over Time</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track cumulative savings and costs{breakEvenMonth !== null ? ` with break-even point at Month ${breakEvenMonth}` : ''}
              </p>
              
              {/* Timeline Slider */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-medium">Timeline: {cashflowMonths} months ({(cashflowMonths / 12).toFixed(1)} years)</label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCashflowMonths(36)}
                    className="text-xs"
                  >
                    <span className="hidden sm:inline">Reset to 36 months</span>
                    <span className="sm:hidden">Reset</span>
                  </Button>
                </div>
                <Slider
                  value={[cashflowMonths]}
                  onValueChange={([value]) => setCashflowMonths(value)}
                  min={12}
                  max={120}
                  step={6}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12 months (1 year)</span>
                  <span>120 months (10 years)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view the cash flow chart" />
              ) : (
              <div 
                className="overflow-x-auto"
                style={{ 
                  width: '100%',
                  paddingRight: '1rem'
                }}
              >
                <div 
                  style={{ 
                    height: '480px',
                    minWidth: cashflowMonths > 36 ? `${(cashflowMonths / 36) * 100}%` : '100%'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 20, right: 20, top: 10, bottom: 30 }}>
                      <defs>
                        <pattern id="breakEvenPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                          <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#16a34a" strokeWidth="2"/>
                        </pattern>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month"
                        label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        domain={yAxisDomain}
                        tickFormatter={(value) => {
                          const roundedValue = Math.ceil(value);
                          const absValue = Math.abs(roundedValue);
                          if (absValue >= 1000000) return `${(roundedValue / 1000000).toFixed(1)}M`;
                          if (absValue >= 1000) return `${(roundedValue / 1000).toFixed(0)}k`;
                          return `${roundedValue}`;
                        }}
                        width={70}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={yAxisDomain}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          // Completely skip rendering zero tick on right axis to avoid duplicate
                          if (payload.value === 0) {
                            return null;
                          }
                          
                          const roundedValue = Math.ceil(payload.value);
                          const absValue = Math.abs(roundedValue);
                          let text;
                          if (absValue >= 1000000) text = `${(roundedValue / 1000000).toFixed(1)}M`;
                          else if (absValue >= 1000) text = `${(roundedValue / 1000).toFixed(0)}k`;
                          else text = `${roundedValue}`;
                          
                          return (
                            <text x={x} y={y} dy={4} textAnchor="start" fill="currentColor" fontSize={12}>
                              {text}
                            </text>
                          );
                        }}
                        width={70}
                      />
                      <RechartsTooltip 
                        content={<CashFlowTooltip />}
                      />
                      <ReferenceLine 
                        y={0}
                        yAxisId="left"
                        stroke="#16a34a" 
                        strokeWidth={3}
                        label={{ 
                          value: 'Break-Even', 
                          position: 'right', 
                          fill: '#16a34a', 
                          fontWeight: 'bold',
                          fontSize: 14
                        }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="Cumulative Savings" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="Cumulative Savings"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="Cumulative Cost" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        name="Cumulative Cost"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="Net Cashflow" 
                        stroke="#8b5cf6" 
                        strokeWidth={4}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                        name="Net Cashflow"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Time and Cost Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Time & Cost Savings Breakdown</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Monthly and annual impact of automation
              </p>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view the savings breakdown chart" />
              ) : (
              <div className="md:h-80" style={{ height: isMobile && isLandscape ? '85vh' : undefined }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ left: 20, right: 20, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" />
                    <YAxis 
                      tickFormatter={(value) => {
                        const roundedValue = Math.ceil(value);
                        const absValue = Math.abs(roundedValue);
                        if (absValue >= 1000000) return `${(roundedValue / 1000000).toFixed(1)}M`;
                        if (absValue >= 1000) return `${(roundedValue / 1000).toFixed(0)}k`;
                        return `${roundedValue}`;
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value: any, name: string) => {
                        if (name.includes('Hours')) {
                          return [formatNumber(value as number), name];
                        }
                        return [formatCurrency(value as number), name];
                      }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#000000'
                      }}
                      labelStyle={{
                        color: '#000000',
                        fontWeight: 600
                      }}
                      itemStyle={{
                        color: '#000000'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Hours per Month" fill="#10b981" name="Hours per Month" />
                    <Bar dataKey="Annual Hours" fill="#06b6d4" name="Annual Hours" />
                    <Bar dataKey="Monthly Savings" fill="#f59e0b" name="Monthly Savings ($)" />
                    <Bar dataKey="Annual Savings" fill="#8b5cf6" name="Annual Savings ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Waterfall Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Savings Waterfall Analysis</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                How gross savings convert to net savings after all costs
              </p>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view the waterfall chart" />
              ) : (
                <WaterfallChart
                  grossSavings={hardCostsOnlyMode ? displayResults.totalHardSavings : (displayResults.monthlySavings * 12) + displayResults.annualCost}
                  implementation={totalUpfrontCosts}
                  training={displayResults.processResults.reduce((sum, r) => sum + r.implementationCosts.trainingCosts, 0)}
                  software={displayResults.annualCost}
                  integration={displayResults.totalSystemIntegrationCosts}
                  netSavings={displayResults.annualNetSavings}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Costs Tab */}
        <TabsContent value="internal" className="space-y-6 mt-6">
          <InternalCostsReports 
            processResults={displayResults.processResults}
            data={filteredData}
          />
        </TabsContent>

        {/* Scenario Analysis Tab */}
        <TabsContent value="sensitivity" className="space-y-6 mt-6">
          <ScenarioAnalysis
            conservative={displayResults.sensitivityAnalysis.conservative}
            likely={displayResults.sensitivityAnalysis.likely}
            optimistic={displayResults.sensitivityAnalysis.optimistic}
            data={filteredData}
            hardCostsOnlyMode={hardCostsOnlyMode}
            costClassification={costClassification}
          />
        </TabsContent>

        {/* FTE Impact Tab */}
        <TabsContent value="fte" className="space-y-6 mt-6">
          <FTEImpactChart
            totalFTEsFreed={finalResults.totalFTEsFreed}
            utilizationType={utilizationType}
            redeploymentValue={finalResults.fteProductivityUplift || 0}
            hardSavings={finalResults.totalHardSavings}
            attritionSavings={finalResults.totalAttritionSavings}
          />
        </TabsContent>

        {/* Detailed Breakdown Tab (original content) */}
        <TabsContent value="detailed" className="space-y-6 mt-6">

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Annual Net Savings"
          value={formatCurrency(finalResults.annualNetSavings)}
          icon={DollarSign}
          subtitle="After software costs"
          trend={finalResults.annualNetSavings > 0 ? 'positive' : 'negative'}
          onClick={() => setSelectedMetric('savings')}
        />
        <MetricCard
          title="ROI Percentage"
          value={formatPercentage(finalResults.roiPercentage)}
          icon={TrendingUp}
          subtitle="Return on investment"
          trend={getTrendFromROI(finalResults.roiPercentage)}
          onClick={() => setSelectedMetric('roi')}
        />
        <MetricCard
          title="Payback Period"
          value={`${formatNumber(finalResults.paybackPeriod)} mo`}
          icon={Target}
          subtitle="Time to break even"
          onClick={() => setSelectedMetric('payback')}
        />
        <MetricCard
          title="Time Saved"
          value={`${formatNumber(finalResults.monthlyTimeSaved)} hrs`}
          icon={Clock}
          subtitle="Per month"
          trend="positive"
          onClick={() => setSelectedMetric('timesaved')}
        />
      </div>

      {/* Detailed Metric Views */}
      {selectedMetric && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedMetric === 'savings' && 'Annual Net Savings Breakdown'}
                {selectedMetric === 'roi' && 'ROI Analysis Details'}
                {selectedMetric === 'payback' && 'Payback Period Analysis'}
                {selectedMetric === 'timesaved' && 'Time Savings Breakdown'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedMetric === 'savings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Total Annual Savings</h4>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(finalResults.monthlySavings * 12)}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">From labor cost reduction</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Software Costs</h4>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(finalResults.annualCost)}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Annual software expenses</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Net Savings</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(finalResults.annualNetSavings)}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">After all costs</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Savings by Process</h4>
                  {finalResults.processResults.map((processResult) => (
                    <div key={processResult.processId} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span>{processResult.name}</span>
                      <span className="font-medium">{formatCurrency(processResult.annualNetSavings)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMetric === 'roi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">ROI Calculation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Annual Net Savings:</span>
                        <span className="font-medium">{formatCurrency(finalResults.annualNetSavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Investment:</span>
                        <span className="font-medium">{formatCurrency(finalResults.totalInvestment)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>ROI:</span>
                        <span>{formatPercentage(finalResults.roiPercentage)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Investment Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Upfront Costs:</span>
                        <span>{formatCurrency(finalResults.totalUpfrontCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Year Software:</span>
                        <span>{formatCurrency(finalResults.annualSoftwareCosts)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total Investment:</span>
                        <span>{formatCurrency(finalResults.totalInvestment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedMetric === 'payback' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Break-even Analysis</h4>
                  <p className="text-3xl font-bold mb-2">{formatNumber(finalResults.paybackPeriod)} months</p>
                  <p className="text-sm text-muted-foreground">Time to recover initial investment</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Monthly Cash Flow</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly Savings:</span>
                        <span className="font-medium text-green-600">{formatCurrency(finalResults.monthlyLaborSavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Software Costs:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(finalResults.monthlySoftwareCosts)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Net Monthly Savings:</span>
                        <span>{formatCurrency(finalResults.monthlyNetSavings)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Recovery Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Initial Investment:</span>
                        <span>{formatCurrency(finalResults.totalUpfrontCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Recovery:</span>
                        <span>{formatCurrency(finalResults.monthlyNetSavings)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Payback Period:</span>
                        <span>{formatNumber(finalResults.paybackPeriod)} months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedMetric === 'timesaved' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Monthly</h4>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatNumber(finalResults.monthlyTimeSaved)} hrs
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Annual</h4>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatNumber(finalResults.monthlyTimeSaved * 12)} hrs
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Equivalent FTEs</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatNumber(displayResults.monthlyTimeSaved / 160)} 
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Time Savings by Process</h4>
                  {displayResults.processResults.map((processResult) => {
                    const process = filteredData.processes.find(p => p.name === processResult.name)!;
                    const monthlyTasks = getMonthlyTaskVolume(process.taskVolume, process.taskVolumeUnit);
                    const timePerTaskMinutes = getTimePerTaskInMinutes(process.timePerTask, process.timeUnit);
                    const monthlyHours = (monthlyTasks * timePerTaskMinutes * (processResult.implementationCosts.automationCoverage / 100)) / 60;
                    return (
                      <div key={processResult.name} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{processResult.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {monthlyTasks} tasks/month × {timePerTaskMinutes} min × {processResult.implementationCosts.automationCoverage}% coverage
                          </p>
                        </div>
                        <span className="font-medium">{formatNumber(monthlyHours)} hrs/mo</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Process Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            ROI analysis for each business process
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayResults.processResults.map((processResult) => {
              const process = filteredData.processes.find(p => p.id === processResult.processId)!;
              return (
                <div key={processResult.processId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4>{processResult.name}</h4>
                    <Badge variant={process.taskType === 'seasonal' ? 'default' : 'secondary'}>
                      {process.taskType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-muted-foreground">Yearly Cost (Before)</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Annual process cost before automation (labor + overhead)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold">{formatCurrency(processResult.currentProcessCost * 12)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-muted-foreground">Yearly Cost (After)</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Annual process cost after automation (monthly software costs only, excluding one-time upfront costs)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold">{formatCurrency(processResult.newProcessCost * 12)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-muted-foreground">Monthly Savings</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Total labor cost savings per month after automation, including base wages, overhead, and benefits</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold">{formatCurrency(processResult.monthlySavings)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-muted-foreground">Annual Net</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Net annual savings after deducting software costs and implementation expenses</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold">{formatCurrency(processResult.annualNetSavings)}</p>
                    </div>
                  </div>
                  {(processResult.peakSeasonSavings > 0 || processResult.slaComplianceValue > 0 || processResult.revenueUplift > 0 || processResult.promptPaymentBenefit > 0) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex gap-4 text-sm flex-wrap">
                        {processResult.peakSeasonSavings > 0 && (
                          <div className="text-blue-600 dark:text-blue-400">
                            <span className="font-medium">Seasonal: </span>
                            {formatCurrency(processResult.peakSeasonSavings)}
                          </div>
                        )}
                        {processResult.slaComplianceValue > 0 && (
                          <div className="text-purple-600 dark:text-purple-400">
                            <span className="font-medium">SLA Value: </span>
                            {formatCurrency(processResult.slaComplianceValue)}
                          </div>
                        )}
                        {processResult.revenueUplift > 0 && (
                          <div className="text-green-600 dark:text-green-400">
                            <span className="font-medium">Revenue Uplift: </span>
                            {formatCurrency(processResult.revenueUplift)}
                          </div>
                        )}
                        {processResult.promptPaymentBenefit > 0 && (
                          <div className="text-emerald-600 dark:text-emerald-400">
                            <span className="font-medium">Prompt Payment: </span>
                            {formatCurrency(processResult.promptPaymentBenefit)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Savings Breakdown */}
      {(results.peakSeasonSavings > 0 || results.overtimeSavings > 0 || results.slaComplianceValue > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Value Drivers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Beyond basic labor savings, automation provides these additional benefits
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.peakSeasonSavings > 0 && (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Peak Season Savings</h4>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(results.peakSeasonSavings)}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">From seasonal processes</p>
                </div>
              )}
              {results.overtimeSavings > 0 && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Overtime Elimination</h4>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(results.overtimeSavings)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Annual overtime cost reduction</p>
                </div>
              )}
              {results.slaComplianceValue > 0 && (
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">SLA Compliance</h4>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(results.slaComplianceValue)}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Annual penalties avoided</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}



      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly Labor Savings</p>
              <p className="font-medium">{formatCurrency(results.monthlySavings)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Annual Software Cost</p>
              <p className="font-medium">{formatCurrency(results.annualCost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasks Automated per Month</p>
              <p className="font-medium">{formatNumber(data.processes.reduce((sum, process) => {
                const coverage = process.implementationCosts.automationCoverage;
                const monthlyTasks = getMonthlyTaskVolume(process.taskVolume, process.taskVolumeUnit);
                return sum + (monthlyTasks * coverage / 100);
              }, 0))}</p>
            </div>
          </div>
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}