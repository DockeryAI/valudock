import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Download, Link, FileText, Share2, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InputData, ROIResults, formatCurrency, formatPercentage, formatNumber, generateCashflowData, getMonthlyTaskVolume, getTimePerTaskInMinutes } from './utils/calculations';
import { exportToPDF, exportToExcel, shareViaEmail, generateShareableLink } from './utils/exportUtils';

interface ExportScreenProps {
  data: InputData;
  results: ROIResults;
  onDownloadPDF: () => void;
  onCopyLink: () => void;
}

const SummarySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="font-medium text-lg">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`flex justify-between items-center py-1 ${highlight ? 'font-medium' : ''}`}>
    <span className="text-muted-foreground">{label}</span>
    <span className={highlight ? 'text-primary' : ''}>{value}</span>
  </div>
);

export function ExportScreen({ data, results, onDownloadPDF, onCopyLink }: ExportScreenProps) {
  const [sectionsToExport, setSectionsToExport] = useState<string[]>(['all']);
  
  const getROIStatus = () => {
    if (results.roiPercentage > 100) return { label: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' };
    if (results.roiPercentage > 50) return { label: 'Good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' };
    if (results.roiPercentage > 0) return { label: 'Positive', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' };
    return { label: 'Negative', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' };
  };

  const roiStatus = getROIStatus();

  const toggleSection = (section: string) => {
    if (section === 'all') {
      setSectionsToExport(['all']);
    } else {
      const currentSections = sectionsToExport.filter(s => s !== 'all');
      if (currentSections.includes(section)) {
        const newSections = currentSections.filter(s => s !== section);
        setSectionsToExport(newSections.length === 0 ? ['all'] : newSections);
      } else {
        setSectionsToExport([...currentSections, section]);
      }
    }
  };

  const handlePDFExport = async () => {
    try {
      const cashflowData = generateCashflowData(data);
      const sections = sectionsToExport.includes('all') 
        ? ['executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'] 
        : sectionsToExport;
      
      await exportToPDF(data, results, cashflowData, sections);
      // toast.success(`PDF downloaded successfully with ${sectionsToExport.includes('all') ? 'all reports, charts, and visuals' : 'selected sections'}!`);
    } catch (error) {
      console.error('Failed to generate PDF export:', error);
      // toast.error('Failed to generate PDF export');
    }
  };

  const handleExcelExport = async () => {
    try {
      const cashflowData = generateCashflowData(data);
      const sections = sectionsToExport.includes('all') 
        ? ['executive', 'financial', 'internal', 'sensitivity', 'fte', 'details', 'charts'] 
        : sectionsToExport;
      
      await exportToExcel(data, results, cashflowData, sections);
      // toast.success(`Excel file downloaded successfully with ${sectionsToExport.includes('all') ? 'all data and charts' : 'selected sections'}!`);
    } catch (error) {
      console.error('Failed to generate Excel export:', error);
      // toast.error('Failed to generate Excel export');
    }
  };

  const handleEmailShare = () => {
    try {
      shareViaEmail(data, results);
      // toast.success('Email draft opened!');
    } catch (error) {
      console.error('Failed to open email client:', error);
      // toast.error('Failed to open email client');
    }
  };

  const handleCopyShareableLink = async () => {
    try {
      const link = generateShareableLink(data);
      await navigator.clipboard.writeText(link);
      toast.success('Read-only shareable link copied to clipboard!');
    } catch (error) {
      // Silently handle clipboard permission errors - user already gets toast message
      toast.error('Failed to copy link - clipboard access denied');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1>ROI Analysis Summary</h1>
        <p className="text-muted-foreground">
          Share your automation business case with stakeholders
        </p>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <p className="text-sm text-muted-foreground">
            Download or share your ROI analysis with all Impact and ROI reports and visuals
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-3 block">Select Sections to Include</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-all"
                  checked={sectionsToExport.includes('all')}
                  onCheckedChange={() => toggleSection('all')}
                />
                <label htmlFor="export-all" className="text-sm cursor-pointer">
                  Include All Sections (Includes all reports, charts, and visuals from Impact and ROI)
                </label>
              </div>
              {!sectionsToExport.includes('all') && (
                <div className="ml-6 space-y-2">
                  {[
                    { id: 'executive', label: 'Executive Summary' },
                    { id: 'financial', label: 'Cash Flow Analysis & Waterfall Chart' },
                    { id: 'internal', label: 'Internal Savings Reports' },
                    { id: 'sensitivity', label: 'Sensitivity Analysis' },
                    { id: 'fte', label: 'FTE Impact Charts' },
                    { id: 'details', label: 'Detailed Breakdown' },
                    { id: 'charts', label: 'All Charts & Visuals' },
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
          
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handlePDFExport} className="gap-2 w-full">
              <Download className="h-4 w-4 flex-shrink-0" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleExcelExport} className="gap-2 w-full">
              <FileText className="h-4 w-4 flex-shrink-0" />
              Export to Excel
            </Button>
            <Button variant="outline" onClick={handleEmailShare} className="gap-2 w-full">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Share via Email</span>
              <span className="sm:hidden">Email</span>
            </Button>
            <Button variant="outline" onClick={handleCopyShareableLink} className="gap-2 w-full">
              <Link className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Copy Shareable Link</span>
              <span className="sm:hidden">Copy Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Annual Net Savings</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(results.annualNetSavings)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">ROI Percentage</p>
              <p className="text-xl font-bold">{formatPercentage(results.roiPercentage)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Payback Period</p>
              <p className="text-xl font-bold">{formatNumber(results.paybackPeriod)} months</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Time Saved</p>
              <p className="text-xl font-bold">{formatNumber(results.monthlyTimeSaved)} hrs/mo</p>
            </div>
          </div>
          
          <p className="text-sm leading-relaxed">
            Based on the analysis, implementing automation for the specified tasks would result in 
            <strong> {formatCurrency(results.annualNetSavings)} in annual net savings</strong> with a 
            <strong> {formatPercentage(results.roiPercentage)} return on investment</strong>. 
            The initial investment would be recovered in approximately 
            <strong> {formatNumber(results.paybackPeriod)} months</strong>, 
            while saving <strong>{formatNumber(results.monthlyTimeSaved)} hours per month</strong> 
            of manual labor time.
          </p>
        </CardContent>
      </Card>

      {/* Detailed Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Assumptions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key inputs used in the ROI calculation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <SummarySection title="Global Settings">
            <DataRow label="Monthly Software Cost" value={formatCurrency(data.softwareCost)} />
            <DataRow label="Annual Software Cost" value={formatCurrency(data.softwareCost * 12)} />
            <DataRow label="Implementation Timeline" value={`${data.implementationTimelineMonths} months`} />
            <DataRow label="Overtime Rate" value={formatCurrency(data.overtimeRate)} />
            <DataRow label="Temp Staff Hourly Rate" value={formatCurrency(data.tempStaffCostPerHour)} />
            <DataRow label="Number of Processes" value={data.processes.length.toString()} />
          </SummarySection>

          <Separator />

          <SummarySection title="Process Summary">
            {data.processes.map((process, index) => (
              <div key={process.id} className="space-y-2">
                <h5 className="font-medium">{process.name}</h5>
                <div className="ml-4 space-y-1 text-sm">
                  <DataRow label="Task Type" value={process.taskType.charAt(0).toUpperCase() + process.taskType.slice(1)} />
                  <DataRow label="Hourly Wage" value={formatCurrency(process.averageHourlyWage)} />
                  <DataRow label="Tasks/Month" value={formatNumber(getMonthlyTaskVolume(process.taskVolume, process.taskVolumeUnit))} />
                  <DataRow label="Time/Task" value={`${getTimePerTaskInMinutes(process.timePerTask, process.timeUnit)} min`} />
                  <DataRow label="Coverage" value={`${process.implementationCosts.automationCoverage}%`} />
                  {process.slaRequirements.hasSLA && (
                    <DataRow label="SLA Target" value={process.slaRequirements.slaTarget} />
                  )}
                  {process.taskType === 'seasonal' && (
                    <DataRow label="Peak Months" value={`${process.seasonalPattern.peakMonths.length} months`} />
                  )}
                </div>
                {index < data.processes.length - 1 && <div className="border-t my-2" />}
              </div>
            ))}
          </SummarySection>
        </CardContent>
      </Card>

      {/* Calculated Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Calculated Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SummarySection title="Time Savings">
            <DataRow label="Monthly Time Saved" value={`${formatNumber(results.monthlyTimeSaved)} hours`} />
            <DataRow label="Annual Time Saved" value={`${formatNumber(results.annualTimeSavings)} hours`} />
            <DataRow label="Equivalent Full-time Employees" value={formatNumber(results.annualTimeSavings / 2080)} />
          </SummarySection>

          <Separator />

          <SummarySection title="Financial Impact">
            <DataRow label="Monthly Labor Savings" value={formatCurrency(results.monthlySavings)} />
            <DataRow label="Annual Labor Savings" value={formatCurrency(results.monthlySavings * 12)} />
            <DataRow label="Annual Software Cost" value={formatCurrency(results.annualCost)} />
            <DataRow label="Annual Net Savings" value={formatCurrency(results.annualNetSavings)} highlight />
            <DataRow label="Return on Investment" value={formatPercentage(results.roiPercentage)} highlight />
            <DataRow label="Payback Period" value={`${formatNumber(results.paybackPeriod)} months`} highlight />
            {results.peakSeasonSavings > 0 && (
              <DataRow label="Peak Season Additional Savings" value={formatCurrency(results.peakSeasonSavings)} />
            )}
            {results.overtimeSavings > 0 && (
              <DataRow label="Overtime Cost Reduction" value={formatCurrency(results.overtimeSavings)} />
            )}
            {results.slaComplianceValue > 0 && (
              <DataRow label="SLA Compliance Value" value={formatCurrency(results.slaComplianceValue)} />
            )}
          </SummarySection>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.roiPercentage > 50 && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm">
                  <strong>Strong Business Case:</strong> The projected ROI of {formatPercentage(results.roiPercentage)} 
                  indicates a compelling automation opportunity. Consider proceeding with implementation.
                </p>
              </div>
            )}
            
            {results.roiPercentage > 0 && results.roiPercentage <= 50 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm">
                  <strong>Moderate Opportunity:</strong> The ROI is positive but modest. Consider optimizing 
                  automation coverage or exploring cost-effective alternatives.
                </p>
              </div>
            )}
            
            {results.roiPercentage <= 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm">
                  <strong>Reassess Strategy:</strong> Current projections show negative ROI. Consider reducing 
                  software costs, increasing automation coverage, or targeting higher-value tasks.
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <strong>Next Steps:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Validate assumptions with actual implementation data</li>
                <li>Consider running a pilot program to test automation coverage</li>
                <li>Factor in change management and training costs</li>
                <li>Monitor actual results and adjust projections accordingly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Report generated on {new Date().toLocaleDateString()}</p>
        <p>This analysis is based on the provided assumptions and should be validated with actual implementation data.</p>
      </div>
    </div>
  );
}
