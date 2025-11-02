import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Minus } from 'lucide-react';
import { Slider } from './ui/slider';
import { formatPercentage } from './utils/calculations';
import { InputData, calculateROI } from './utils/calculations';
import { LandscapePrompt } from './LandscapePrompt';
import { useRequiresLandscape } from './ui/use-landscape';

interface SensitivityAnalysisProps {
  conservative: number;
  likely: number;
  optimistic: number;
  data?: InputData;
  hardCostsOnlyMode?: boolean;
  costClassification?: any;
}

export function SensitivityAnalysis({ conservative, likely, optimistic, data, hardCostsOnlyMode = false, costClassification }: SensitivityAnalysisProps) {
  const { requiresLandscape, isMobile, isLandscape } = useRequiresLandscape();
  // State for automation coverage adjustments (as percentages, e.g., -20, 0, +20)
  const [conservativeAdjustment, setConservativeAdjustment] = useState(-20);
  const [likelyAdjustment, setLikelyAdjustment] = useState(0);
  const [optimisticAdjustment, setOptimisticAdjustment] = useState(20);

  // Recalculate ROI based on adjusted automation coverage
  const recalculatedValues = useMemo(() => {
    if (!data) {
      // If no data is provided, use the passed-in values
      return {
        conservative,
        likely,
        optimistic
      };
    }

    const calculateAdjustedROI = (adjustment: number) => {
      // Create a copy of the data with adjusted automation coverage
      const adjustedData = {
        ...data,
        processes: data.processes.map(process => ({
          ...process,
          implementationCosts: {
            ...process.implementationCosts,
            automationCoverage: Math.max(0, Math.min(100, process.implementationCosts.automationCoverage + adjustment))
          }
        }))
      };

      // Recalculate ROI
      // ✅ HARD GATE: Block calculation if cost classification is null or undefined
      if (!costClassification || costClassification === null || costClassification === undefined) {
        console.log('[SensitivityAnalysis] 🚫 ROI calculation blocked - cost classification is null/undefined', {
          costClassification,
          type: typeof costClassification,
        });
        return 0;
      }
      const results = calculateROI(adjustedData, 36, costClassification);
      
      // If hard costs only mode, recalculate ROI based on hard savings only
      if (hardCostsOnlyMode) {
        const totalHardSavings = results.processResults.reduce((sum, pr) => sum + pr.hardSavings, 0);
        const annualCost = results.annualCost;
        const annualNetSavings = totalHardSavings - annualCost;
        return annualCost > 0 ? (annualNetSavings / annualCost) * 100 : 0;
      }
      
      return results.roiPercentage;
    };

    return {
      conservative: calculateAdjustedROI(conservativeAdjustment),
      likely: calculateAdjustedROI(likelyAdjustment),
      optimistic: calculateAdjustedROI(optimisticAdjustment)
    };
  }, [conservativeAdjustment, likelyAdjustment, optimisticAdjustment, data, conservative, likely, optimistic, hardCostsOnlyMode, costClassification]);

  const chartData = [
    {
      scenario: 'Conservative',
      value: recalculatedValues.conservative,
      description: `${conservativeAdjustment > 0 ? '+' : ''}${conservativeAdjustment}% automation coverage`,
      color: '#eab308'
    },
    {
      scenario: 'Likely',
      value: recalculatedValues.likely,
      description: `${likelyAdjustment > 0 ? '+' : ''}${likelyAdjustment}% automation coverage`,
      color: '#3b82f6'
    },
    {
      scenario: 'Optimistic',
      value: recalculatedValues.optimistic,
      description: `${optimisticAdjustment > 0 ? '+' : ''}${optimisticAdjustment}% automation coverage`,
      color: '#10b981'
    }
  ];

  const getIcon = (scenario: string) => {
    if (scenario === 'Conservative') return <Minus className="h-5 w-5 text-yellow-600" />;
    if (scenario === 'Optimistic') return <TrendingUp className="h-5 w-5 text-green-600" />;
    return <Minus className="h-5 w-5 text-blue-600" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{item.scenario}</p>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <p className="text-lg font-bold mt-1" style={{ color: item.color }}>
            {formatPercentage(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensitivity Analysis</CardTitle>
        <CardDescription>
          ROI projections across different automation coverage scenarios. Adjust the sliders to see how changes in automation coverage affect ROI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Scenario Cards with Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conservative */}
            <div 
              className="p-4 rounded-lg border"
              style={{ borderColor: '#eab308', backgroundColor: '#eab30810' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Minus className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Conservative</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {conservativeAdjustment > 0 ? '+' : ''}{conservativeAdjustment}% automation coverage
              </p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#eab308' }}>
                {formatPercentage(recalculatedValues.conservative)}
              </p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Coverage Adjustment: {conservativeAdjustment > 0 ? '+' : ''}{conservativeAdjustment}%
                </label>
                <Slider
                  value={[conservativeAdjustment]}
                  onValueChange={(value) => setConservativeAdjustment(value[0])}
                  min={-50}
                  max={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-50%</span>
                  <span>0%</span>
                </div>
              </div>
            </div>

            {/* Likely */}
            <div 
              className="p-4 rounded-lg border"
              style={{ borderColor: '#3b82f6', backgroundColor: '#3b82f610' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Minus className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Likely</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {likelyAdjustment > 0 ? '+' : ''}{likelyAdjustment}% automation coverage
              </p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#3b82f6' }}>
                {formatPercentage(recalculatedValues.likely)}
              </p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Coverage Adjustment: {likelyAdjustment > 0 ? '+' : ''}{likelyAdjustment}%
                </label>
                <Slider
                  value={[likelyAdjustment]}
                  onValueChange={(value) => setLikelyAdjustment(value[0])}
                  min={-30}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-30%</span>
                  <span>+30%</span>
                </div>
              </div>
            </div>

            {/* Optimistic */}
            <div 
              className="p-4 rounded-lg border"
              style={{ borderColor: '#10b981', backgroundColor: '#10b98110' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Optimistic</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {optimisticAdjustment > 0 ? '+' : ''}{optimisticAdjustment}% automation coverage
              </p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#10b981' }}>
                {formatPercentage(recalculatedValues.optimistic)}
              </p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Coverage Adjustment: {optimisticAdjustment > 0 ? '+' : ''}{optimisticAdjustment}%
                </label>
                <Slider
                  value={[optimisticAdjustment]}
                  onValueChange={(value) => setOptimisticAdjustment(value[0])}
                  min={0}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="mt-6">
            {requiresLandscape ? (
              <LandscapePrompt message="Please rotate your device to landscape mode to view the scenario analysis chart" />
            ) : (
              <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '70vh' : 250}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
