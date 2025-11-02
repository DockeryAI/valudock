import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { InputData, formatCurrency, formatPercentage, formatNumber, ROIResults } from './utils/calculations';
import { ROI } from '../services/roi';
import { LandscapePrompt } from './LandscapePrompt';
import { useRequiresLandscape } from './ui/use-landscape';

interface ScenarioScreenProps {
  data: InputData;
  costClassification?: any;
  timeHorizonMonths?: number;
}

interface Scenario {
  name: string;
  coverage: number;
  description: string;
  color: string;
}

const defaultScenarios: Scenario[] = [
  {
    name: 'Conservative',
    coverage: 60,
    description: 'Lower adoption due to edge cases and manual overrides',
    color: '#f59e0b' // Amber/Orange for conservative
  },
  {
    name: 'Likely',
    coverage: 80,
    description: 'Expected automation coverage based on typical implementations',
    color: '#3b82f6' // Blue for likely
  },
  {
    name: 'Best Case',
    coverage: 95,
    description: 'Maximum automation potential with full optimization',
    color: '#10b981' // Green for best case
  }
];

const ScenarioCard = ({ 
  scenario, 
  results, 
  isSelected, 
  onSelect,
  onCoverageChange
}: {
  scenario: Scenario;
  results: ROIResults;
  isSelected: boolean;
  onSelect: () => void;
  onCoverageChange: (coverage: number) => void;
}) => {
  const getTrendIcon = () => {
    if (results.roiPercentage > 50) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (results.roiPercentage < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  // Get color classes based on scenario name
  const getScenarioColorClasses = () => {
    switch (scenario.name) {
      case 'Conservative':
        return {
          card: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
          title: 'text-yellow-900 dark:text-yellow-100'
        };
      case 'Likely':
        return {
          card: 'border-blue-300 bg-blue-50 dark:bg-blue-950/20',
          badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
          title: 'text-blue-900 dark:text-blue-100'
        };
      case 'Best Case':
        return {
          card: 'border-green-300 bg-green-50 dark:bg-green-950/20',
          badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
          title: 'text-green-900 dark:text-green-100'
        };
      default:
        return {
          card: '',
          badge: '',
          title: ''
        };
    }
  };

  const colors = getScenarioColorClasses();

  return (
    <Card 
      className={`transition-all hover:shadow-md border-2 ${colors.card} ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${colors.title}`}>{scenario.name}</CardTitle>
        </div>
        <div className="space-y-3">
          <Badge variant="outline" className={`w-fit ${colors.badge}`}>
            {scenario.coverage}% Coverage
          </Badge>
          
          {/* Slider for coverage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Slider
                value={[scenario.coverage]}
                onValueChange={(value) => onCoverageChange(value[0])}
                max={100}
                min={10}
                step={5}
                className="flex-1"
              />
              <Input
                type="number"
                value={scenario.coverage === 0 ? '' : (scenario.coverage || '')}
                onChange={(e) => onCoverageChange(parseInt(e.target.value) || 0)}
                className="w-16 h-8 text-sm"
                min={10}
                max={100}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Net Savings</p>
            <p className="font-semibold">{formatCurrency(results.annualNetSavings)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ROI</p>
            <p className="font-semibold">{formatPercentage(results.roiPercentage)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payback</p>
            <p className="font-semibold">{formatNumber(results.paybackPeriod)} mo</p>
          </div>
          <div>
            <p className="text-muted-foreground">Time Saved</p>
            <p className="font-semibold">{formatNumber(results.monthlyTimeSaved)} hrs/mo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ScenarioScreen({ data, costClassification, timeHorizonMonths = 36 }: ScenarioScreenProps) {
  const { requiresLandscape, isMobile, isLandscape } = useRequiresLandscape();
  const [selectedScenario, setSelectedScenario] = useState(1); // Default to "Likely"
  const [scenarios, setScenarios] = useState(defaultScenarios);
  
  // Helper function to calculate scenario ROI by adjusting coverage for all processes
  const calculateScenarioROI = (baseData: InputData, coveragePercentage: number) => {
    // ✅ HARD GATE: Block calculation if cost classification is null or undefined
    if (!costClassification || costClassification === null || costClassification === undefined) {
      console.log('[ScenarioScreen] 🚫 ROI calculation blocked - cost classification is null/undefined', {
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
    
    const scenarioData = {
      ...baseData,
      processes: baseData.processes.map(process => ({
        ...process,
        implementationCosts: {
          ...process.implementationCosts,
          automationCoverage: coveragePercentage
        }
      }))
    };
    // Use ROI service for scenario calculation (no controller/debouncing)
    return ROI.calculate(scenarioData, timeHorizonMonths, costClassification) || {
      annualNetSavings: 0,
      totalCost: 0,
      roi: 0,
      paybackPeriodMonths: 0,
      npv: 0,
      totalFTEsFreed: 0,
      processResults: [],
    };
  };

  const updateScenarioCoverage = (index: number, coverage: number) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], coverage };
    setScenarios(newScenarios);
  };

  const scenarioResults = scenarios.map(scenario => ({
    scenario,
    results: calculateScenarioROI(data, scenario.coverage)
  }));

  // Data for comparison charts
  const comparisonData = scenarioResults.map(({ scenario, results }) => ({
    name: scenario.name,
    'Net Savings': results.annualNetSavings,
    'ROI %': results.roiPercentage,
    'Payback (months)': results.paybackPeriod,
    'Hours Saved/Month': results.monthlyTimeSaved
  }));

  // Sensitivity analysis data - varying automation coverage
  const sensitivityData = [];
  for (let coverage = 20; coverage <= 100; coverage += 10) {
    const results = calculateScenarioROI(data, coverage);
    sensitivityData.push({
      coverage: `${coverage}%`,
      'ROI %': results.roiPercentage,
      'Net Savings': results.annualNetSavings / 1000, // Scale to thousands
      'Payback Period': results.paybackPeriod
    });
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-1 md:space-y-2">
        <h1>Scenario Analysis</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Compare different automation coverage scenarios to understand risk and opportunity
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioResults.map(({ scenario, results }, index) => (
          <ScenarioCard
            key={scenario.name}
            scenario={scenario}
            results={results}
            isSelected={selectedScenario === index}
            onSelect={() => setSelectedScenario(index)}
            onCoverageChange={(coverage) => updateScenarioCoverage(index, coverage)}
          />
        ))}
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="comparison" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-3 min-w-max md:min-w-0">
            <TabsTrigger value="comparison" className="whitespace-nowrap px-3 md:px-4">Scenario Comparison</TabsTrigger>
            <TabsTrigger value="sensitivity" className="whitespace-nowrap px-3 md:px-4">Sensitivity Analysis</TabsTrigger>
            <TabsTrigger value="timeline" className="whitespace-nowrap px-3 md:px-4">Implementation Timeline</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">ROI Comparison Across Scenarios</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Financial impact of different automation coverage levels
              </p>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view scenario comparisons" />
              ) : (
                <div className="md:h-80" style={{ height: isMobile && isLandscape ? '85vh' : undefined }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                      <Bar yAxisId="left" dataKey="Net Savings" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="ROI %" fill="#10b981" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Time Savings & Payback Period</CardTitle>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view time savings" />
              ) : (
                <div className="md:h-64" style={{ height: isMobile && isLandscape ? '85vh' : undefined }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Bar yAxisId="left" dataKey="Hours Saved/Month" fill="#8b5cf6" />
                      <Bar yAxisId="right" dataKey="Payback (months)" fill="#f59e0b" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Sensitivity to Automation Coverage</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                How ROI and savings change with different coverage percentages
              </p>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view sensitivity analysis" />
              ) : (
                <div className="md:h-80" style={{ height: isMobile && isLandscape ? '85vh' : undefined }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="coverage" />
                      <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value}%`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${Math.ceil(value)}k`} />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="ROI %" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="Net Savings" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <h4 className="font-medium text-red-900 dark:text-red-100">High Risk</h4>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatPercentage(scenarioResults[0].results.roiPercentage)}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">Conservative scenario</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Expected</h4>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatPercentage(scenarioResults[1].results.roiPercentage)}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Likely scenario</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Best Case</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatPercentage(scenarioResults[2].results.roiPercentage)}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Best case scenario</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Project Implementation Timeline</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ROI progression across all processes over 12-month implementation period
              </p>
            </CardHeader>
            <CardContent>
              {requiresLandscape ? (
                <LandscapePrompt message="Please rotate your device to landscape mode to view the implementation timeline" />
              ) : (
                <div className="md:h-80" style={{ height: isMobile && isLandscape ? '85vh' : undefined }}>
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(() => {
                    const timelineData = [];
                    // ✅ HARD GATE: Use ROI service with cost classification
                    const fullResults = (costClassification && costClassification !== null && costClassification !== undefined)
                      ? ROI.calculate(data, timeHorizonMonths, costClassification)
                      : null;
                    const safeResults = fullResults || { monthlySavings: 0, annualNetSavings: 0, processResults: [] };
                    const totalImplementationMonths = 12;
                    
                    for (let month = 0; month <= totalImplementationMonths; month++) {
                      // Calculate active processes (those that have started)
                      const activeProcesses = data.processes.filter(p => 
                        month >= p.implementationCosts.startMonth
                      );
                      
                      // Calculate cumulative savings based on active processes
                      const cumulativeSavings = activeProcesses.reduce((sum, process) => {
                        const processMonthsActive = Math.max(0, month - process.implementationCosts.startMonth);
                        const processResults = calculateScenarioROI(data, process.implementationCosts.automationCoverage);
                        const processShare = safeResults.monthlySavings > 0 
                          ? processResults.monthlySavings / safeResults.monthlySavings
                          : 0;
                        return sum + (processResults.monthlySavings * processMonthsActive * processShare);
                      }, 0);
                      
                      // Calculate cumulative costs
                      const cumulativeCost = activeProcesses.reduce((sum, process) => {
                        const processMonthsActive = Math.max(0, month - process.implementationCosts.startMonth);
                        return sum + (process.implementationCosts.softwareCost * processMonthsActive);
                      }, 0);
                      
                      const implementationProgress = Math.min(100, (month / totalImplementationMonths) * 100);
                      const netROI = cumulativeCost > 0 ? ((cumulativeSavings - cumulativeCost) / cumulativeCost) * 100 : 0;
                      
                      timelineData.push({
                        month,
                        'Implementation Progress': implementationProgress,
                        'Cumulative Savings': cumulativeSavings,
                        'Cumulative Cost': cumulativeCost,
                        'Net ROI': netROI
                      });
                    }
                    
                    return timelineData;
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      label={{ value: 'Month', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      tickFormatter={(value) => `${Math.round(value)}%`} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(value) => formatCurrency(value)} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'Implementation Progress' || name === 'Net ROI') {
                          return [`${Math.round(value)}%`, name];
                        }
                        return [formatCurrency(value), name];
                      }}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Implementation Progress" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                      name="Progress"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Net ROI" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
                      name="ROI"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="Cumulative Savings" 
                      stroke="hsl(var(--chart-4))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cumulative Savings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Implementation Phases</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Structured rollout across all {data.processes.length} business processes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { 
                      phase: 'Phase 1: Planning & Assessment', 
                      months: '0-2', 
                      progress: 100, 
                      description: 'Requirements gathering, current state analysis, tool selection',
                      processes: ['Data Processing (Month 1)'],
                      deliverables: ['Process documentation', 'Technology selection', 'Project charter']
                    },
                    { 
                      phase: 'Phase 2: Pilot Implementation', 
                      months: '2-4', 
                      progress: 75, 
                      description: 'Deploy initial automations with limited scope',
                      processes: ['Invoice Processing (Month 4)', 'Seasonal Reporting (Month 2)'],
                      deliverables: ['Pilot automation', 'Performance metrics', 'User feedback']
                    },
                    { 
                      phase: 'Phase 3: Full Rollout', 
                      months: '4-8', 
                      progress: 50, 
                      description: 'Scale to remaining processes with full feature set',
                      processes: ['Customer Onboarding (Month 7)'],
                      deliverables: ['Production deployment', 'User training', 'Support procedures']
                    },
                    { 
                      phase: 'Phase 4: Optimization & Monitoring', 
                      months: '8-12', 
                      progress: 25, 
                      description: 'Fine-tune performance and maximize coverage',
                      processes: ['All processes optimization'],
                      deliverables: ['Performance tuning', 'Coverage optimization', 'ROI validation']
                    }
                  ].map((item, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <h4 className="font-medium text-sm">{item.phase}</h4>
                        <Badge variant="outline" className="w-fit">
                          Months {item.months}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Active Processes:</span>
                          <span className="font-medium">{item.progress}% Complete</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {item.processes.map((process, idx) => (
                            <li key={idx}>• {process}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Key Deliverables:</span>
                        <div className="text-xs text-muted-foreground">
                          {item.deliverables.join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Management & Success Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Project governance and performance monitoring framework
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600 dark:text-red-400">High-Impact Risks</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <span>Technical integration complexity</span>
                        <Badge variant="destructive" className="text-xs">High</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                        <span>User adoption resistance</span>
                        <Badge variant="outline" className="text-xs">Medium</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                        <span>Process complexity underestimation</span>
                        <Badge variant="outline" className="text-xs">Medium</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600 dark:text-green-400">Mitigation Actions</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Phased rollout starting with {data.processes[0]?.name || 'simplest process'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Dedicated training program with 40+ hours per user</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Parallel manual processes during first 3 months</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span>Weekly progress reviews with steering committee</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-600 dark:text-blue-400">Success KPIs</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Task Automation Rate</span>
                          <span className="font-medium">≥95%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Error Reduction</span>
                          <span className="font-medium">≥80%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">User Satisfaction</span>
                          <span className="font-medium">≥4.0/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Savings</span>
                          <span className="font-medium">{formatCurrency(
                            (costClassification && costClassification !== null && costClassification !== undefined)
                              ? (ROI.calculate(data, timeHorizonMonths, costClassification)?.monthlySavings ?? 0)
                              : 0
                          )}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Use these scenarios to inform your automation strategy and set realistic expectations
        </p>
      </div>
    </div>
  );
}