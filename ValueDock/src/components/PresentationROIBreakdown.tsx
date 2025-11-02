import React from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { ROIResults, ProcessROIResults, formatCurrency, formatNumber, formatPercentage, generateCashflowData, InputData } from './utils/calculations';
import { WaterfallChart } from './WaterfallChart';
import { FTEImpactChart } from './FTEImpactChart';
import { LandscapeChartWrapper } from './LandscapeChartWrapper';
import { useIsMobile } from './ui/use-mobile';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface PresentationROIBreakdownProps {
  results: ROIResults;
  processResults: ProcessROIResults[];
  selectedProcessIds: string[];
  data?: InputData;
}

export function PresentationROIBreakdown({ 
  results, 
  processResults, 
  selectedProcessIds,
  data
}: PresentationROIBreakdownProps) {
  const isMobile = useIsMobile();
  
  // Track when data last changed for visual debugging
  const [lastUpdate, setLastUpdate] = React.useState(new Date().toLocaleTimeString());
  const [updateCount, setUpdateCount] = React.useState(0);
  const [dataSnapshot, setDataSnapshot] = React.useState({
    resultsHash: '',
    processResultsHash: '',
    selectedProcessHash: ''
  });
  
  // Cashflow timeline state
  const [cashflowMonths, setCashflowMonths] = React.useState(36);
  
  // Track changes to props
  React.useEffect(() => {
    const newHash = {
      resultsHash: JSON.stringify({
        annualNetSavings: results.annualNetSavings,
        totalFTEsFreed: results.totalFTEsFreed,
        npv: results.npv,
        totalInvestment: results.totalInvestment
      }),
      processResultsHash: JSON.stringify(processResults.map(pr => ({
        id: pr.processId,
        savings: pr.annualNetSavings
      }))),
      selectedProcessHash: JSON.stringify(selectedProcessIds)
    };
    
    // Check if data actually changed
    if (JSON.stringify(newHash) !== JSON.stringify(dataSnapshot)) {
      setLastUpdate(new Date().toLocaleTimeString());
      setUpdateCount(prev => prev + 1);
      setDataSnapshot(newHash);
    }
  }, [results, processResults, selectedProcessIds]);
  
  // Filter process results by selected processes (show only processes with meaningful data)
  const filteredProcessResults = React.useMemo(() => {
    const filtered = processResults.filter(pr => selectedProcessIds.includes(pr.processId));
    console.log('[PresentationROIBreakdown] ===== FILTERING PROCESSES =====');
    console.log('[PresentationROIBreakdown] Total process results:', processResults.length);
    console.log('[PresentationROIBreakdown] Process result IDs:', processResults.map(pr => pr.processId));
    console.log('[PresentationROIBreakdown] Selected process IDs:', selectedProcessIds);
    console.log('[PresentationROIBreakdown] Filtered process count:', filtered.length);
    console.log('[PresentationROIBreakdown] Filtered processes:', filtered.map(pr => ({
      id: pr.processId,
      name: pr.name,
      annualSavings: pr.annualNetSavings,
      ftesFreed: pr.ftesFreed
    })));
    console.log('[PresentationROIBreakdown] ============================================');
    return filtered;
  }, [processResults, selectedProcessIds]);

  // Recalculate totals based on selected processes
  const { totalInvestment, totalMonthlySavings, totalAnnualSavings, traditionalROI, totalFTEs } = React.useMemo(() => {
    const investment = filteredProcessResults.reduce((sum, r) => sum + r.totalInvestment, 0);
    const monthlySavings = filteredProcessResults.reduce((sum, r) => sum + r.monthlySavings, 0);
    const annualSavings = monthlySavings * 12;
    const roi = investment > 0 ? ((annualSavings - investment) / investment) * 100 : 0;
    const ftes = filteredProcessResults.reduce((sum, r) => sum + (r.ftesFreed || 0), 0);
    
    return {
      totalInvestment: investment,
      totalMonthlySavings: monthlySavings,
      totalAnnualSavings: annualSavings,
      traditionalROI: roi,
      totalFTEs: ftes
    };
  }, [filteredProcessResults]);
  
  // Recalculate NPV and IRR for filtered processes
  const { calculatedNPV, calculatedIRR } = React.useMemo(() => {
    const discountRate = 0.10; // 10% discount rate
    const timeHorizonYears = 3;
    
    // Calculate NPV: sum of discounted cash flows over 3 years
    let npv = -totalInvestment; // Initial investment is negative
    for (let year = 1; year <= timeHorizonYears; year++) {
      const discountFactor = Math.pow(1 + discountRate, year);
      npv += totalAnnualSavings / discountFactor;
    }
    
    // Calculate IRR using iterative approach
    let irr = 0;
    if (totalInvestment > 0 && totalAnnualSavings > 0) {
      // Approximate IRR using Newton's method
      let rate = 0.1; // Start with 10%
      for (let i = 0; i < 20; i++) {
        let npvCalc = -totalInvestment;
        let derivative = 0;
        
        for (let year = 1; year <= timeHorizonYears; year++) {
          const factor = Math.pow(1 + rate, year);
          npvCalc += totalAnnualSavings / factor;
          derivative -= (year * totalAnnualSavings) / Math.pow(1 + rate, year + 1);
        }
        
        if (Math.abs(npvCalc) < 0.01) break;
        rate = rate - npvCalc / derivative;
      }
      irr = rate * 100;
    }
    
    return { calculatedNPV: npv, calculatedIRR: irr };
  }, [totalInvestment, totalAnnualSavings]);

  // Generate sophisticated cashflow data using the same function as ResultsScreen
  const filteredData = React.useMemo(() => {
    if (!data || !data.processes) {
      return data; // Return data as-is if undefined or missing processes
    }
    return {
      ...data,
      processes: data.processes.map(p => ({
        ...p,
        selected: selectedProcessIds.includes(p.id)
      }))
    };
  }, [data, selectedProcessIds]);
  
  // Create a modified results object with only filtered processes
  const displayResults = React.useMemo(() => {
    return {
      ...results,
      processResults: filteredProcessResults
    };
  }, [results, filteredProcessResults]);
  
  const dynamicCashflowData = React.useMemo(() => {
    return generateCashflowData(filteredData, cashflowMonths, displayResults);
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

  // Calculate break-even month from cashflow data
  const breakevenMonth = React.useMemo(() => {
    const breakEvenData = dynamicCashflowData.find(item => item.month > 0 && item.netCashflow >= 0);
    return breakEvenData ? breakEvenData.month : null;
  }, [dynamicCashflowData]);

  // Calculate actual savings breakdown from filtered processes
  const { laborSavings, errorSavings, internalCostSavings, waterfallData } = React.useMemo(() => {
    const labor = filteredProcessResults.reduce((sum, r) => sum + (r.annualTimeSavings * r.fullyLoadedHourlyRate), 0);
    const errors = filteredProcessResults.reduce((sum, r) => sum + (r.errorReductionSavings || 0), 0);
    const internalCosts = filteredProcessResults.reduce((sum, r) => sum + (r.internalCostSavings?.totalInternalCostSavings || 0), 0);
    const otherSavings = totalAnnualSavings - labor - errors - internalCosts;
    
    // Prepare waterfall data with actual values
    const waterfall = [
      { name: 'Labor Savings', value: labor, color: '#10b981' },
      { name: 'Error Reduction', value: errors, color: '#3b82f6' },
      { name: 'Internal Costs', value: internalCosts, color: '#8b5cf6' },
      { name: 'Other Benefits', value: Math.max(0, otherSavings), color: '#f59e0b' },
    ].filter(item => item.value > 0);
    
    return {
      laborSavings: labor,
      errorSavings: errors,
      internalCostSavings: internalCosts,
      waterfallData: waterfall
    };
  }, [filteredProcessResults, totalAnnualSavings]);

  // Log key metrics updates for debugging
  React.useEffect(() => {
    console.log('[PresentationROIBreakdown] Metrics Updated:', {
      totalInvestment: formatCurrency(totalInvestment),
      totalAnnualSavings: formatCurrency(totalAnnualSavings),
      traditionalROI: formatPercentage(traditionalROI),
      npv: formatCurrency(calculatedNPV),
      irr: formatPercentage(calculatedIRR),
      payback: breakevenMonth !== null ? `${breakevenMonth} months` : 'N/A',
      totalFTEs: totalFTEs.toFixed(1)
    });
  }, [totalInvestment, totalAnnualSavings, traditionalROI, calculatedNPV, calculatedIRR, breakevenMonth, totalFTEs]);

  // Custom tooltip for Cash Flow chart to show break-even point (EXACT copy from ResultsScreen)
  const CashFlowTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentMonth = Number(label);
      const isBreakEvenMonth = breakevenMonth !== null && currentMonth === breakevenMonth;
      
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
    <div className="space-y-6">
      {/* Live Data Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live data synced from Impact & ROI</span>
        </div>
      </div>
      
      {/* AI Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Key Financial Impact
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The selected automation processes deliver a <strong>Year-1 ROI of {formatPercentage(traditionalROI)}</strong> with 
              a payback period of <strong>{breakevenMonth > 0 ? breakevenMonth : 'N/A'} months</strong>. 
              The solution generates <strong>{formatCurrency(totalAnnualSavings)}</strong> in annual savings 
              while requiring <strong>{formatCurrency(totalInvestment)}</strong> in initial investment. 
              Most impactful benefits include labor cost reduction ({formatCurrency(laborSavings)}), 
              error elimination ({formatCurrency(errorSavings)}), and internal cost savings 
              ({formatCurrency(internalCostSavings)}). The automation frees up <strong>{totalFTEs.toFixed(1)} FTEs</strong> for 
              strategic work.
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <Percent className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">Traditional ROI</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatPercentage(traditionalROI)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">NPV (3-Year)</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(calculatedNPV)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <Percent className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">IRR</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatPercentage(calculatedIRR)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <Calendar className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">Payback Period</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{breakevenMonth > 0 ? `${breakevenMonth}` : 'N/A'} mo</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">Monthly Savings</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(totalMonthlySavings)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">Total Investment</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(totalInvestment)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">EBITDA Impact</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(totalAnnualSavings * 0.85)}</p>
        </Card>

        <Card className="p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 mb-2">
            <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
            <Label className="text-[10px] md:text-xs text-muted-foreground leading-tight">FTE Impact</Label>
          </div>
          <p className="text-lg md:text-2xl font-bold truncate">{totalFTEs.toFixed(1)} FTEs</p>
        </Card>
      </div>

      {/* Cashflow Chart - EXACT copy from ResultsScreen */}
      <LandscapeChartWrapper message="Please rotate your device to landscape mode to view the Cash Flow chart" height="100vh">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Cumulative Cash Flow Analysis</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Projection over {cashflowMonths} months
                {breakevenMonth !== null && ` • Break-even at month ${breakevenMonth}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCashflowMonths(36)}
              disabled={cashflowMonths === 36}
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
        <div 
          className="overflow-x-auto mt-4"
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
      </Card>
      </LandscapeChartWrapper>

      {/* Savings Waterfall */}
      <LandscapeChartWrapper message="Please rotate your device to landscape mode to view the Savings Breakdown chart" height="100vh">
      <Card className="p-6">
        <h3 className="font-medium mb-4">Annual Savings Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {waterfallData.map((item) => (
            <div key={item.name} className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">{item.name}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value">
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      </LandscapeChartWrapper>

      {/* FTE Impact Chart */}
      <LandscapeChartWrapper message="Please rotate your device to landscape mode to view the FTE Impact chart" height="100vh">
      <Card className="p-6">
        <h3 className="font-medium mb-4">FTE Impact Analysis</h3>
        <FTEImpactChart 
          totalFTEsFreed={totalFTEs}
          utilizationType="redeployed"
          redeploymentValue={filteredProcessResults.reduce((sum, r) => sum + (r.softSavings || 0), 0)}
          hardSavings={filteredProcessResults.reduce((sum, r) => sum + (r.hardSavings || 0), 0)}
          attritionSavings={0}
        />
      </Card>
      </LandscapeChartWrapper>

    </div>
  );
}
