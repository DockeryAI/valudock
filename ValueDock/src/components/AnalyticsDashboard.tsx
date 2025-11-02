import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Clock, DollarSign, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiCall } from '../utils/auth';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Progress } from './ui/progress';
import { formatCurrency } from './utils/calculations';

interface AnalyticsData {
  kpis: {
    runsToday: number;
    successRate: number;
    avgDuration: number;
    totalCost: number;
    trends: {
      runsToday: number;
      successRate: number;
      avgDuration: number;
      totalCost: number;
    };
  };
  runsPerDay: Array<{ date: string; runs: number }>;
  costPerDay: Array<{ date: string; cost: number }>;
  durationPerDay: Array<{ date: string; duration: number }>;
  costByPhase: Array<{ phase: string; cost: number }>;
  tokensByPhase: Array<{ phase: string; tokens: number }>;
  successFailPie: Array<{ name: string; value: number }>;
  recentRuns: Array<{
    id: string;
    tenant: string;
    org: string;
    duration: number;
    cost: number;
    status: 'success' | 'failed' | 'running';
    startedAt: string;
  }>;
  currentRun?: {
    step: string;
    progress: number;
    eta: string;
  };
}

interface AnalyticsDashboardProps {
  userRole: string;
}

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Only show to global admin
  if (userRole !== 'master_admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only global administrators can access the Analytics Dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadTenants();
    loadOrganizations();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTenant, selectedOrg, dateRange]);

  const loadTenants = async () => {
    try {
      const response = await apiCall('/admin/tenants');
      if (response.tenants) {
        setTenants(response.tenants);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await apiCall('/admin/organizations');
      if (response.organizations) {
        setOrganizations(response.organizations);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTenant !== 'all') params.append('tenantId', selectedTenant);
      if (selectedOrg !== 'all') params.append('orgId', selectedOrg);
      params.append('days', dateRange);

      const response = await apiCall(`/analytics/dashboard?${params.toString()}`);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRunDetails = async (runId: string) => {
    setDetailsLoading(true);
    try {
      const response = await apiCall(`/analytics/run-details/${runId}`);
      if (response.success) {
        setRunDetails(response.details);
      }
    } catch (error) {
      console.error('Error loading run details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRunClick = (runId: string) => {
    setSelectedRunId(runId);
    loadRunDetails(runId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'running':
        return <Badge variant="outline"><Activity className="h-3 w-3 mr-1" />Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              No analytics data found for the selected filters.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Run Analytics</h2>
        <p className="text-muted-foreground">Telemetry, Cost, and Performance Overview</p>
      </div>

      {/* Filter Row */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm mb-2 block">Tenant</label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tenants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Organization</label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations
                    .filter(org => selectedTenant === 'all' || org.tenantId === selectedTenant)
                    .map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadAnalytics} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Runs Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-3xl">{data.kpis.runsToday}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  {getTrendIcon(data.kpis.trends.runsToday)}
                  <span>{Math.abs(data.kpis.trends.runsToday)}% vs yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-3xl">{data.kpis.successRate}%</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  {getTrendIcon(data.kpis.trends.successRate)}
                  <span>{Math.abs(data.kpis.trends.successRate)}% vs period avg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-3xl">{data.kpis.avgDuration}</span>
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  {getTrendIcon(data.kpis.trends.avgDuration)}
                  <span>{Math.abs(data.kpis.trends.avgDuration)}% vs period avg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <span className="text-3xl">${data.kpis.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  {getTrendIcon(data.kpis.trends.totalCost)}
                  <span>${Math.abs(data.kpis.trends.totalCost).toFixed(2)} vs yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Runs per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.runsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="runs" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.costPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#00C49F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avg Duration per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.durationPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)} min`} />
              <Legend />
              <Line type="monotone" dataKey="duration" stroke="#8884D8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.costByPhase}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="cost" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokens by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.tokensByPhase}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tokens" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Fail (Last {dateRange} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.successFailPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.successFailPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Click a row to view detailed logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentRuns.map((run) => (
                <TableRow
                  key={run.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRunClick(run.id)}
                >
                  <TableCell className="font-mono text-xs">{run.id.slice(0, 8)}...</TableCell>
                  <TableCell>{run.tenant}</TableCell>
                  <TableCell>{run.org}</TableCell>
                  <TableCell>{run.duration.toFixed(1)} min</TableCell>
                  <TableCell>${run.cost.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Real-Time Progress Widget */}
      {data.currentRun && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse text-blue-600" />
              Live Run in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span>{data.currentRun.step}</span>
                <span className="text-muted-foreground">ETA: {data.currentRun.eta}</span>
              </div>
              <Progress value={data.currentRun.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Run Detail Drawer */}
      <Sheet open={selectedRunId !== null} onOpenChange={(open) => !open && setSelectedRunId(null)}>
        <SheetContent className="w-full md:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Run Details</SheetTitle>
            <SheetDescription>
              Detailed logs and metrics for run {selectedRunId?.slice(0, 8)}
            </SheetDescription>
          </SheetHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : runDetails ? (
            <div className="mt-6 space-y-4">
              {/* Run Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{getStatusBadge(runDetails.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{runDetails.duration.toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span>${runDetails.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tokens:</span>
                    <span>{runDetails.totalTokens.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Phase Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Phase Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {runDetails.phases?.map((phase: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{phase.name}</span>
                        {getStatusBadge(phase.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Duration: {phase.duration?.toFixed(1) || 'N/A'} min</div>
                        <div>Cost: ${phase.cost?.toFixed(2) || '0.00'}</div>
                        <div>Tokens: {phase.tokens?.toLocaleString() || 'N/A'}</div>
                      </div>
                      {phase.logs && (
                        <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                          {phase.logs.map((log: string, logIdx: number) => (
                            <div key={logIdx} className="py-1">{log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
