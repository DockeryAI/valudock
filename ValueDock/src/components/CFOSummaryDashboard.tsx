import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, Target, PieChart, AlertCircle, CheckCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatPercentage, ROIResults } from './utils/calculations';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

interface CFOSummaryDashboardProps {
  results: ROIResults;
  hardCostsOnlyMode?: boolean;
}

export function CFOSummaryDashboard({ results, hardCostsOnlyMode = false }: CFOSummaryDashboardProps) {
  const [showAllYears, setShowAllYears] = useState(false);
  const npvColor = results.npv >= 0 ? 'text-green-600' : 'text-red-600';
  const irrColor = results.irr >= 15 ? 'text-green-600' : results.irr >= 10 ? 'text-yellow-600' : 'text-red-600';
  
  const hardSavingsPercent = results.totalHardSavings + results.totalSoftSavings > 0 
    ? (results.totalHardSavings / (results.totalHardSavings + results.totalSoftSavings)) * 100 
    : 0;
  
  // Only log if there are actually internal cost savings (no need to spam console with zeros)
  if (results.totalInternalCostSavings > 0) {
    console.log('🔍 CFO Dashboard - Internal Savings:', {
      totalInternalCostSavings: results.totalInternalCostSavings,
      totalInternalHardDollarSavings: results.totalInternalHardDollarSavings,
      totalInternalSoftDollarSavings: results.totalInternalSoftDollarSavings
    });
  }
    
  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Net Present Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${npvColor}`}>
              {formatCurrency(results.npv)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {results.npv >= 0 ? 'Positive NPV indicates value creation' : 'Negative NPV - review assumptions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Internal Rate of Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${irrColor}`}>
              {formatPercentage(results.irr)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {results.irr >= 15 ? 'Exceeds typical hurdle rate' : 'Compare to cost of capital'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              EBITDA Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(results.ebitdaImpact)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Year 1 (Current Year)
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Year 2</p>
                  <p className="font-semibold text-blue-500">{formatCurrency(results.ebitdaByYear.year2 || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Year 3</p>
                  <p className="font-semibold text-blue-500">{formatCurrency(results.ebitdaByYear.year3 || 0)}</p>
                </div>
              </div>
              {(() => {
                // Calculate how many additional years beyond year 3
                const allYears = Object.keys(results.ebitdaByYear)
                  .filter(key => key.startsWith('year'))
                  .map(key => parseInt(key.replace('year', '')))
                  .sort((a, b) => a - b);
                const additionalYears = allYears.filter(y => y > 3);
                
                if (additionalYears.length === 0) return null;
                
                return (
                  <div className="space-y-2">
                    {showAllYears && (
                      <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                        {additionalYears.map(year => (
                          <div key={year}>
                            <p className="text-muted-foreground text-xs">Year {year}</p>
                            <p className="font-semibold text-blue-500">
                              {formatCurrency(results.ebitdaByYear[`year${year}`] || 0)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllYears(!showAllYears)}
                      className="w-full h-7 text-xs"
                    >
                      {showAllYears ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Years 4-{Math.max(...allYears)}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Impact Highlight (if applicable) */}
      {(results.totalRevenueUplift > 0 || results.totalPromptPaymentBenefit > 0) && (
        <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Impact
            </CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-500">
              Additional revenue and cash flow benefits from automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.totalRevenueUplift > 0 && (
                <div>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(results.totalRevenueUplift)}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
                    Revenue Uplift from improved speed, quality, capacity, and satisfaction
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Impact Card (if applicable) */}
      {results.totalComplianceRiskReduction > 0 && (
        <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Cost Avoidance
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-500">
              Risk-adjusted annual compliance costs avoided through automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.totalComplianceRiskReduction)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                  Annual Compliance Cost Avoided
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 p-3 bg-blue-50/50 dark:bg-blue-900/10">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Conservative Estimate:</strong> Based on probability-weighted expected fines avoided, adjusted for automation coverage percentage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Traditional ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {formatPercentage(results.roiPercentage)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {results.paybackPeriod.toFixed(1)} month payback period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(results.monthlySavings)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recurring monthly benefit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(results.processResults.reduce((sum, r) => sum + r.totalInvestment, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total upfront costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hard vs Soft Savings */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Composition: Hard vs. Soft</CardTitle>
          <CardDescription>
            Hard savings are direct cost reductions that impact the P&L. Soft savings represent value creation and revenue opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg border-blue-600 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-600">Hard Savings</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(results.totalHardSavings)}
                </p>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor Cost Reduction:</span>
                    <span className="font-medium">{formatCurrency(results.annualNetSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Reduction:</span>
                    <span className="font-medium">{formatCurrency(results.totalErrorReductionSavings)}</span>
                  </div>
                  {(results.totalInternalHardDollarSavings || 0) > 0 && (
                    <div className="flex justify-between p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Internal Hard Savings:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(results.totalInternalHardDollarSavings || 0)}</span>
                    </div>
                  )}
                  {results.totalPromptPaymentBenefit > 0 && (
                    <div className="flex justify-between p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                      <span className="text-purple-700 dark:text-purple-400 font-medium">Prompt Payment Benefit:</span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">{formatCurrency(results.totalPromptPaymentBenefit)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg border-green-600 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-600">Soft Savings / Value Creation</h4>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency((results.totalSoftSavings || 0) + (results.fteProductivityUplift || 0) + (results.totalComplianceRiskReduction || 0) + (results.totalAttritionSavings || 0))}
                </p>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  {results.totalRevenueUplift > 0 && (
                    <div className="flex justify-between p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded">
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Revenue Uplift:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(results.totalRevenueUplift)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance Cost Avoidance:</span>
                    <span className="font-medium">{formatCurrency(results.totalComplianceRiskReduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attrition Savings:</span>
                    <span className="font-medium">{formatCurrency(results.totalAttritionSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FTE Redeployment:</span>
                    <span className="font-medium">{formatCurrency(results.fteProductivityUplift)}</span>
                  </div>
                  {(results.totalInternalSoftDollarSavings || 0) > 0 && (
                    <div className="flex justify-between p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-700 dark:text-blue-400 font-medium">Internal Soft Savings:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(results.totalInternalSoftDollarSavings || 0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Financial Impact Breakdown</CardTitle>
          <CardDescription>
            Comprehensive view of all cost savings and value creation components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Labor Cost Savings:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.annualNetSavings)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Error/Rework Reduction:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.totalErrorReductionSavings)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Compliance Risk Mitigation:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.totalComplianceRiskReduction)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Attrition Cost Savings:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.totalAttritionSavings)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Peak Season Savings:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.peakSeasonSavings)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>Overtime Savings:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.overtimeSavings)}</div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>SLA Compliance Value:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.slaComplianceValue)}</div>
              
              <div className={`font-medium ${(results.totalInternalCostSavings || 0) > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'} ${hardCostsOnlyMode && (results.totalInternalSoftDollarSavings || 0) > 0 ? 'line-through opacity-50' : ''}`}>
                Internal Cost Savings:
              </div>
              <div className={`text-right font-medium ${(results.totalInternalCostSavings || 0) > 0 ? 'text-blue-700 dark:text-blue-400 font-bold' : ''} ${hardCostsOnlyMode && (results.totalInternalSoftDollarSavings || 0) > 0 ? 'line-through opacity-50' : ''}`}>
                {formatCurrency(results.totalInternalCostSavings || 0)}
              </div>
              
              <div className={`font-medium ${results.totalRevenueUplift > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'} ${hardCostsOnlyMode ? 'line-through opacity-50' : ''}`}>
                Revenue Uplift:
              </div>
              <div className={`text-right font-medium ${results.totalRevenueUplift > 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''} ${hardCostsOnlyMode ? 'line-through opacity-50' : ''}`}>
                {formatCurrency(results.totalRevenueUplift)}
              </div>
              
              <div className={`font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'}`}>FTE Redeployment Value:</div>
              <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-muted-foreground/50 line-through' : ''}`}>{formatCurrency(results.fteProductivityUplift)}</div>
              
              {results.totalPromptPaymentBenefit > 0 && (
                <>
                  <div className={`font-medium ${hardCostsOnlyMode ? 'text-purple-700/50 dark:text-purple-400/50 line-through' : 'text-purple-700 dark:text-purple-400'}`}>
                    Prompt Payment Benefit:
                  </div>
                  <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-purple-700/50 dark:text-purple-400/50 line-through' : 'text-purple-700 dark:text-purple-400 font-bold'}`}>
                    {formatCurrency(results.totalPromptPaymentBenefit)}
                  </div>
                </>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-x-4 text-sm pt-2">
              <div className="font-medium text-muted-foreground">Less: System Integration Costs:</div>
              <div className="text-right font-medium text-red-600">-{formatCurrency(results.totalSystemIntegrationCosts)}</div>
              
              <div className="font-medium text-muted-foreground">Less: Annual Software Costs:</div>
              <div className="text-right font-medium text-red-600">-{formatCurrency(results.annualCost)}</div>
              
              {((results.ongoingITSupportCosts || 0) > 0 || (results.ongoingTrainingCosts || 0) > 0 || (results.ongoingOvertimeCosts || 0) > 0 || (results.ongoingShadowSystemsCosts || 0) > 0) && (
                <>
                  <div className="col-span-2 pt-2 pb-1">
                    <p className={`text-xs italic ${hardCostsOnlyMode ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      Ongoing costs after automation reduction (soft costs):
                    </p>
                  </div>
                  
                  {(results.ongoingITSupportCosts || 0) > 0 && (
                    <>
                      <div className={`font-medium pl-2 ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>IT Support (Reduced):</div>
                      <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>-{formatCurrency(results.ongoingITSupportCosts)}</div>
                    </>
                  )}
                  
                  {(results.ongoingTrainingCosts || 0) > 0 && (
                    <>
                      <div className={`font-medium pl-2 ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>Training (Reduced):</div>
                      <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>-{formatCurrency(results.ongoingTrainingCosts)}</div>
                    </>
                  )}
                  
                  {(results.ongoingOvertimeCosts || 0) > 0 && (
                    <>
                      <div className={`font-medium pl-2 ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>Overtime (Reduced):</div>
                      <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>-{formatCurrency(results.ongoingOvertimeCosts)}</div>
                    </>
                  )}
                  
                  {(results.ongoingShadowSystemsCosts || 0) > 0 && (
                    <>
                      <div className={`font-medium pl-2 ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>Shadow Systems (Reduced):</div>
                      <div className={`text-right font-medium ${hardCostsOnlyMode ? 'text-orange-700/50 dark:text-orange-400/50 line-through' : 'text-orange-700 dark:text-orange-400'}`}>-{formatCurrency(results.ongoingShadowSystemsCosts)}</div>
                    </>
                  )}
                </>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-x-4 text-base font-bold pt-2">
              <div>Total Annual Net Benefit:</div>
              <div className="text-right text-green-600">
                {formatCurrency(
                  (hardCostsOnlyMode ? 0 : (results.annualNetSavings || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.totalErrorReductionSavings || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.totalComplianceRiskReduction || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.totalRevenueUplift || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.totalAttritionSavings || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.fteProductivityUplift || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.totalPromptPaymentBenefit || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.peakSeasonSavings || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.overtimeSavings || 0)) + 
                  (hardCostsOnlyMode ? 0 : (results.slaComplianceValue || 0)) + 
                  (hardCostsOnlyMode ? (results.totalInternalHardDollarSavings || 0) : (results.totalInternalCostSavings || 0)) - 
                  (results.totalSystemIntegrationCosts || 0) -
                  (hardCostsOnlyMode ? 0 : (results.ongoingITSupportCosts || 0)) -
                  (hardCostsOnlyMode ? 0 : (results.ongoingTrainingCosts || 0)) -
                  (hardCostsOnlyMode ? 0 : (results.ongoingOvertimeCosts || 0)) -
                  (hardCostsOnlyMode ? 0 : (results.ongoingShadowSystemsCosts || 0))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}