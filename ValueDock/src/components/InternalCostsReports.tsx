import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency, formatNumber, ProcessROIResults, InputData } from './utils/calculations';
import { Briefcase, Server, Shield, TrendingUp, DollarSign, Target } from 'lucide-react';
import { LandscapePrompt } from './LandscapePrompt';
import { useRequiresLandscape } from './ui/use-landscape';

interface InternalCostsReportsProps {
  processResults: ProcessROIResults[];
  data: InputData;
}

const COLORS = {
  labor: '#3b82f6',
  it: '#8b5cf6',
  compliance: '#f59e0b',
  opportunity: '#10b981',
  hard: '#ef4444',
  soft: '#06b6d4'
};

export function InternalCostsReports({ processResults, data }: InternalCostsReportsProps) {
  const { requiresLandscape, isMobile, isLandscape } = useRequiresLandscape();
  
  // Check if any processes have internal costs defined
  const hasInternalCosts = data.processes.some(p => {
    const ic = p.internalCosts;
    return ic && (
      ic.trainingOnboardingCosts > 0 ||
      ic.overtimePremiums > 0 ||
      ic.shadowSystemsCosts > 0 ||
      ic.softwareLicensing > 0 ||
      ic.infrastructureCosts > 0 ||
      ic.itSupportMaintenance > 0 ||
      ic.errorRemediationCosts > 0 ||
      ic.auditComplianceCosts > 0 ||
      ic.downtimeCosts > 0 ||
      ic.decisionDelays > 0 ||
      ic.staffCapacityDrag > 0 ||
      ic.customerImpactCosts > 0
    );
  });

  if (!hasInternalCosts) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <DollarSign className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No Internal Costs Configured</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Internal cost savings help quantify hidden operational expenses. Configure internal costs 
                in the Advanced Metrics dialog (gear icon) for each process to see detailed cost analysis here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals across all processes
  const totalInternalSavings = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.totalInternalCostSavings, 0
  );
  
  const totalLaborSavings = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.totalLaborWorkforceSavings, 0
  );
  
  const totalITSavings = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.totalITOperationsSavings, 0
  );
  
  const totalComplianceSavings = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.totalComplianceRiskSavings, 0
  );
  
  const totalOpportunitySavings = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.totalOpportunityCostSavings, 0
  );

  const totalHardDollar = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.hardDollarSavings, 0
  );
  
  const totalSoftDollar = processResults.reduce((sum, r) => 
    sum + r.internalCostSavings.softDollarSavings, 0
  );

  // Data for category breakdown chart
  const categoryData = [
    { name: 'Labor & Workforce', value: totalLaborSavings, color: COLORS.labor },
    { name: 'IT & Operations', value: totalITSavings, color: COLORS.it },
    { name: 'Compliance & Risk', value: totalComplianceSavings, color: COLORS.compliance },
    { name: 'Opportunity Costs', value: totalOpportunitySavings, color: COLORS.opportunity }
  ].filter(item => item.value > 0);

  // Data for hard vs soft dollar chart
  const hardSoftData = [
    { name: 'Hard Dollar Savings', value: totalHardDollar, color: COLORS.hard },
    { name: 'Soft Dollar Savings', value: totalSoftDollar, color: COLORS.soft }
  ].filter(item => item.value > 0);

  // Data for process-level breakdown
  const processBreakdownData = processResults
    .filter(r => r.internalCostSavings.totalInternalCostSavings > 0)
    .map(r => ({
      name: r.name.length > 20 ? r.name.substring(0, 20) + '...' : r.name,
      labor: r.internalCostSavings.totalLaborWorkforceSavings,
      it: r.internalCostSavings.totalITOperationsSavings,
      compliance: r.internalCostSavings.totalComplianceRiskSavings,
      opportunity: r.internalCostSavings.totalOpportunityCostSavings,
      total: r.internalCostSavings.totalInternalCostSavings
    }));

  // Detailed savings breakdown for each category
  const laborDetails = [
    { name: 'Training/Onboarding', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.trainingOnboardingSavings, 0) },
    { name: 'Overtime Premiums', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.overtimePremiumsSavings, 0) },
    { name: 'Shadow Systems', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.shadowSystemsSavings, 0) }
  ].filter(item => item.value > 0);

  const itDetails = [
    { name: 'Software Licensing', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.softwareLicensingSavings, 0) },
    { name: 'Infrastructure', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.infrastructureSavings, 0) },
    { name: 'IT Support', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.itSupportSavings, 0) }
  ].filter(item => item.value > 0);

  const complianceDetails = [
    { name: 'Error Remediation', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.errorRemediationSavings, 0) },
    { name: 'Audit/Compliance', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.auditComplianceSavings, 0) },
    { name: 'Downtime Costs', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.downtimeSavings, 0) }
  ].filter(item => item.value > 0);

  const opportunityDetails = [
    { name: 'Decision Delays', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.decisionDelaySavings, 0) },
    { name: 'Staff Capacity Drag', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.staffCapacityDragSavings, 0) },
    { name: 'Customer Impact', value: processResults.reduce((sum, r) => sum + r.internalCostSavings.customerImpactSavings, 0) }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internal Cost Savings Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of cost reductions from automating internal processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardDescription>Total Internal Savings</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalInternalSavings)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardDescription>Hard Dollar Savings</CardDescription>
                <CardTitle className="text-2xl text-green-600">{formatCurrency(totalHardDollar)}</CardTitle>
                <Badge variant="outline" className="w-fit">Direct Cost Reduction</Badge>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardDescription>Soft Dollar Savings</CardDescription>
                <CardTitle className="text-2xl text-cyan-600">{formatCurrency(totalSoftDollar)}</CardTitle>
                <Badge variant="outline" className="w-fit">Value Creation</Badge>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-5 min-w-max md:min-w-0">
                <TabsTrigger value="overview" className="whitespace-nowrap px-3 md:px-4">Overview</TabsTrigger>
                <TabsTrigger value="labor" className="whitespace-nowrap px-3 md:px-4">Labor</TabsTrigger>
                <TabsTrigger value="it" className="whitespace-nowrap px-3 md:px-4">IT/Ops</TabsTrigger>
                <TabsTrigger value="compliance" className="whitespace-nowrap px-3 md:px-4">Risk</TabsTrigger>
                <TabsTrigger value="opportunity" className="whitespace-nowrap px-3 md:px-4">Opportunity</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Savings by Category</CardTitle>
                    <CardDescription>Distribution of internal cost savings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Hard vs Soft Dollar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hard vs Soft Dollar Savings</CardTitle>
                    <CardDescription>Classification by realizability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={hardSoftData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {hardSoftData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p><strong>Hard Dollar:</strong> Direct, measurable cost reductions (labor, IT, explicit compliance)</p>
                      <p><strong>Soft Dollar:</strong> Value creation and opportunity costs (efficiency, decision speed, satisfaction)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Process-level breakdown */}
              {processBreakdownData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Savings by Process</CardTitle>
                    <CardDescription>Internal cost savings breakdown per process</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {requiresLandscape ? (
                      <LandscapePrompt message="Please rotate your device to landscape mode to view internal savings by process" />
                    ) : (
                      <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '85vh' : 400}>
                        <BarChart data={processBreakdownData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis tickFormatter={(value) => `${(Math.ceil(value) / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="labor" name="Labor & Workforce" stackId="a" fill={COLORS.labor} />
                          <Bar dataKey="it" name="IT & Operations" stackId="a" fill={COLORS.it} />
                          <Bar dataKey="compliance" name="Compliance & Risk" stackId="a" fill={COLORS.compliance} />
                          <Bar dataKey="opportunity" name="Opportunity Costs" stackId="a" fill={COLORS.opportunity} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="labor" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle>Labor & Workforce Savings</CardTitle>
                    <CardDescription>Reduction in training, overtime, and shadow system costs</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(totalLaborSavings)}
                  </div>
                  
                  {laborDetails.length > 0 && (
                    <>
                      {requiresLandscape ? (
                        <LandscapePrompt message="Please rotate your device to landscape mode to view labor savings details" />
                      ) : (
                        <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '70vh' : 250}>
                          <BarChart data={laborDetails} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="value" fill={COLORS.labor} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      <div className="space-y-3">
                        {laborDetails.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-lg">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
                        <p className="text-sm">
                          <strong>Impact:</strong> Automation reduces repetitive training needs, eliminates overtime tied to manual processes, 
                          and retires shadow systems like Excel macros and Access databases.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="it" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Server className="h-5 w-5 text-purple-600" />
                  <div>
                    <CardTitle>IT & Operations Savings</CardTitle>
                    <CardDescription>Reduced legacy software, infrastructure, and support costs</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(totalITSavings)}
                  </div>
                  
                  {itDetails.length > 0 && (
                    <>
                      {requiresLandscape ? (
                        <LandscapePrompt message="Please rotate your device to landscape mode to view IT savings details" />
                      ) : (
                        <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '70vh' : 250}>
                          <BarChart data={itDetails} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="value" fill={COLORS.it} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      <div className="space-y-3">
                        {itDetails.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-lg">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950">
                        <p className="text-sm">
                          <strong>TCO Reduction:</strong> Retiring legacy tools and reducing infrastructure needs lowers total cost of ownership. 
                          IT support hours decrease as manual processes and patching requirements diminish.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <div>
                    <CardTitle>Compliance & Risk Savings</CardTitle>
                    <CardDescription>Reduced errors, audit burden, and downtime costs</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-3xl font-bold text-amber-600">
                    {formatCurrency(totalComplianceSavings)}
                  </div>
                  
                  {complianceDetails.length > 0 && (
                    <>
                      {requiresLandscape ? (
                        <LandscapePrompt message="Please rotate your device to landscape mode to view compliance savings details" />
                      ) : (
                        <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '70vh' : 250}>
                          <BarChart data={complianceDetails} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="value" fill={COLORS.compliance} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      <div className="space-y-3">
                        {complianceDetails.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-lg">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950">
                        <p className="text-sm">
                          <strong>Risk Mitigation:</strong> Automation reduces manual errors and rework, streamlines audit preparation with 
                          real-time reporting, and minimizes business continuity risks from system outages.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunity" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle>Opportunity Cost Savings</CardTitle>
                    <CardDescription>Value from faster decisions, freed capacity, and improved satisfaction</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(totalOpportunitySavings)}
                  </div>
                  
                  {opportunityDetails.length > 0 && (
                    <>
                      {requiresLandscape ? (
                        <LandscapePrompt message="Please rotate your device to landscape mode to view opportunity cost details" />
                      ) : (
                        <ResponsiveContainer width="100%" height={isMobile && isLandscape ? '70vh' : 250}>
                          <BarChart data={opportunityDetails} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="value" fill={COLORS.opportunity} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      <div className="space-y-3">
                        {opportunityDetails.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-lg">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950">
                        <p className="text-sm">
                          <strong>Soft Dollar Value:</strong> While harder to quantify, these savings represent significant business value: 
                          faster time-to-insight, skilled staff redeployed to strategic work, and improved customer retention from better SLA compliance.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
