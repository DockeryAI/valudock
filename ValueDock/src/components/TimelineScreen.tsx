import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CalendarDays, DollarSign, TrendingUp, Clock, X, Download } from 'lucide-react';
import { InputData, ProcessROIResults, formatCurrency, formatNumber } from './utils/calculations';

interface TimelineScreenProps {
  data: InputData;
  processResults: ProcessROIResults[];
}

interface TimelineMetric {
  type: 'duration' | 'investment' | 'savings' | 'breakeven';
  processId: string;
  processName: string;
  data: any;
}

export function TimelineScreen({ data, processResults }: TimelineScreenProps) {
  const [selectedMetric, setSelectedMetric] = useState<TimelineMetric | null>(null);
  
  // Calculate timeline dimensions
  const maxMonth = Math.max(...processResults.map(r => r.endMonth), 24);
  const months = Array.from({ length: maxMonth }, (_, i) => i + 1);
  
  // Calculate total investment and savings
  const totalInvestment = processResults.reduce((sum, r) => sum + r.totalInvestment, 0);
  const totalMonthlySavings = processResults.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalBreakEvenMonth = Math.max(...processResults.map(r => r.breakEvenMonth));

  const getStatusColor = (process: ProcessROIResults, month: number) => {
    if (month < process.startMonth) return 'bg-gray-200 dark:bg-gray-700';
    if (month >= process.startMonth && month <= process.endMonth) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getMonthLabel = (month: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const handleMetricClick = (type: TimelineMetric['type'], processResult: ProcessROIResults) => {
    const process = data.processes.find(p => p.id === processResult.processId)!;
    setSelectedMetric({
      type,
      processId: processResult.processId,
      processName: processResult.processName,
      data: { processResult, process }
    });
  };

  const handleExport = () => {
    // Create exportable timeline data
    const timelineData = processResults.map(r => ({
      Process: r.processName,
      StartMonth: r.startMonth,
      EndMonth: r.endMonth,
      Duration: `${r.duration} months`,
      Investment: formatCurrency(r.totalInvestment),
      MonthlySavings: formatCurrency(r.monthlySavings),
      BreakEven: `Month ${r.breakEvenMonth}`,
      ROI: `${r.roiPercentage.toFixed(1)}%`
    }));
    
    // Convert to CSV
    const headers = Object.keys(timelineData[0]).join(',');
    const rows = timelineData.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-center md:text-left space-y-1 md:space-y-2 flex-1">
          <h1>Implementation Timeline</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visual roadmap showing when each process starts, ends, and begins generating ROI
          </p>
        </div>
        <Button onClick={handleExport} className="gap-1 md:gap-2 text-xs md:text-sm">
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" 
              onClick={() => setSelectedMetric({ type: 'duration', processId: 'all', processName: 'All Processes', data: { maxMonth } })}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-xl font-bold">{maxMonth} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedMetric({ type: 'breakeven', processId: 'all', processName: 'All Processes', data: { totalBreakEvenMonth } })}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Break Even</p>
                <p className="text-xl font-bold">Month {totalBreakEvenMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metric View */}
      {selectedMetric && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedMetric.type === 'duration' && 'Project Duration Details'}
                {selectedMetric.type === 'investment' && 'Total Investment Breakdown'}
                {selectedMetric.type === 'savings' && 'Monthly Savings Analysis'}
                {selectedMetric.type === 'breakeven' && 'Break Even Analysis'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedMetric.type === 'duration' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Total Timeline</h4>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{selectedMetric.data.maxMonth} months</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Processes</h4>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{processResults.length}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Avg Duration</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatNumber(processResults.reduce((sum, r) => sum + (r.endMonth - r.startMonth + 1), 0) / processResults.length)} months
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Process Duration Breakdown</h4>
                  {processResults.map(result => (
                    <div key={result.processId} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span>{result.processName}</span>
                      <span className="font-medium">{result.endMonth - result.startMonth + 1} months</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMetric.type === 'investment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Total Investment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Upfront Costs:</span>
                        <span className="font-medium">{formatCurrency(processResults.reduce((sum, r) => sum + r.upfrontCosts, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Software Costs:</span>
                        <span className="font-medium">{formatCurrency(processResults.reduce((sum, r) => sum + r.annualSoftwareCosts, 0))}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total Investment:</span>
                        <span>{formatCurrency(selectedMetric.data.totalInvestment)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Investment by Process</h4>
                    <div className="space-y-2 text-sm">
                      {processResults.map(result => (
                        <div key={result.processId} className="flex justify-between">
                          <span>{result.processName}:</span>
                          <span className="font-medium">{formatCurrency(result.totalInvestment)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedMetric.type === 'savings' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Total Monthly Savings</h4>
                  <p className="text-3xl font-bold mb-2">{formatCurrency(selectedMetric.data.totalMonthlySavings)}</p>
                  <p className="text-sm text-muted-foreground">Once all processes are fully implemented</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Monthly Savings by Process</h4>
                  {processResults.map(result => (
                    <div key={result.processId} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{result.processName}</span>
                        <p className="text-sm text-muted-foreground">Starting month {result.endMonth + 1}</p>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(result.monthlySavings)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMetric.type === 'breakeven' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Portfolio Break Even</h4>
                  <p className="text-3xl font-bold mb-2">Month {selectedMetric.data.totalBreakEvenMonth}</p>
                  <p className="text-sm text-muted-foreground">When cumulative savings exceed total investment</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Break Even by Process</h4>
                  {processResults.map(result => (
                    <div key={result.processId} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span>{result.processName}</span>
                      <span className="font-medium">Month {result.breakEvenMonth}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Horizontal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Roadmap</CardTitle>
          <p className="text-sm text-muted-foreground">
            Horizontal timeline showing process implementation phases. Scroll horizontally to see full timeline.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Month Headers */}
              <div className="flex mb-4">
                <div className="w-48 flex-shrink-0"></div>
                {months.map(month => (
                  <div key={month} className="w-24 text-center">
                    <div className="text-xs text-muted-foreground">{getMonthLabel(month)}</div>
                    <div className="text-sm font-medium">M{month}</div>
                  </div>
                ))}
              </div>

              {/* Process Rows */}
              <div className="space-y-3">
                {processResults.map((processResult) => {
                  const process = data.processes.find(p => p.id === processResult.processId)!;
                  return (
                    <div key={processResult.processId} className="flex items-center">
                      {/* Process Info */}
                      <div className="w-48 flex-shrink-0 pr-4">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{processResult.processName}</h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {process.taskType}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {formatCurrency(processResult.monthlySavings)}/mo
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs p-1 justify-start"
                              onClick={() => handleMetricClick('duration', processResult)}
                            >
                              <CalendarDays className="h-3 w-3 mr-1" />
                              {processResult.endMonth - processResult.startMonth + 1}mo
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs p-1 justify-start"
                              onClick={() => handleMetricClick('investment', processResult)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(processResult.totalInvestment)}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs p-1 justify-start"
                              onClick={() => handleMetricClick('savings', processResult)}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {formatCurrency(processResult.monthlySavings)}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs p-1 justify-start"
                              onClick={() => handleMetricClick('breakeven', processResult)}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              M{processResult.breakEvenMonth}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex">
                        {months.map(month => (
                          <div key={month} className="w-24 h-8 px-1">
                            <div 
                              className={`h-full rounded ${getStatusColor(processResult, month)} transition-all duration-200`}
                              title={
                                month < processResult.startMonth ? 'Planning' :
                                month >= processResult.startMonth && month <= processResult.endMonth ? 'Implementation' :
                                'Completed'
                              }
                            >
                              {month === processResult.startMonth && (
                                <div className="text-white text-xs p-1 font-medium">Start</div>
                              )}
                              {month === processResult.endMonth && (
                                <div className="text-white text-xs p-1 font-medium">End</div>
                              )}
                              {month === processResult.breakEvenMonth && (
                                <div className="absolute mt-8 text-xs font-medium text-green-600">Break Even</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span className="text-sm">Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Implementation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}