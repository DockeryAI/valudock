import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCcw,
  Server,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiCall } from '../utils/auth';

interface EndpointTest {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  description: string;
  requiresAuth: boolean;
  category: 'Core' | 'AI' | 'Fathom' | 'Gamma' | 'Analytics' | 'Admin';
  payload?: any;
}

const ENDPOINTS: EndpointTest[] = [
  // Core endpoints
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    description: 'Basic server health check',
    requiresAuth: false,
    category: 'Core'
  },
  {
    name: 'Auth Profile',
    path: '/auth/profile',
    method: 'GET',
    description: 'Get current user profile',
    requiresAuth: true,
    category: 'Core'
  },
  
  // AI endpoints
  {
    name: 'AI Generate',
    path: '/ai/generate',
    method: 'POST',
    description: 'Generate content with OpenAI',
    requiresAuth: true,
    category: 'AI',
    payload: {
      prompt: 'Generate a brief test message',
      maxTokens: 50
    }
  },
  {
    name: 'AI Analyze Website',
    path: '/ai/analyze-website',
    method: 'POST',
    description: 'Analyze website with OpenAI',
    requiresAuth: true,
    category: 'AI',
    payload: {
      url: 'https://example.com',
      analysisType: 'quick'
    }
  },
  
  // Fathom endpoints
  {
    name: 'Fathom Diagnostic',
    path: '/fathom-diagnostic',
    method: 'GET',
    description: 'Test Fathom API connectivity',
    requiresAuth: true,
    category: 'Fathom'
  },
  {
    name: 'Fathom Proxy',
    path: '/fathom-proxy',
    method: 'POST',
    description: 'Proxy Fathom API calls',
    requiresAuth: true,
    category: 'Fathom',
    payload: {
      endpoint: '/users/me',
      method: 'GET'
    }
  },
  {
    name: 'Fathom Webhook Meetings',
    path: '/fathom-webhook/meetings/example.com',
    method: 'GET',
    description: 'Get meetings by domain',
    requiresAuth: true,
    category: 'Fathom'
  },
  
  // Gamma endpoints
  {
    name: 'Export Gamma Doc',
    path: '/proposal-content/export-gamma-doc',
    method: 'POST',
    description: 'Export to Gamma document',
    requiresAuth: true,
    category: 'Gamma',
    payload: {
      deal_id: 'test-deal',
      tenant_id: 'test-tenant',
      org_id: 'test-org',
      markdown: '# Test Document\n\nThis is a test.'
    }
  },
  {
    name: 'Export Gamma Deck',
    path: '/proposal-content/export-gamma-deck',
    method: 'POST',
    description: 'Export to Gamma presentation',
    requiresAuth: true,
    category: 'Gamma',
    payload: {
      deal_id: 'test-deal',
      tenant_id: 'test-tenant',
      org_id: 'test-org',
      outline: { slides: [] }
    }
  },
  
  // Proposal Agent endpoints
  {
    name: 'Proposal Agent Run',
    path: '/proposal-agent-run',
    method: 'POST',
    description: 'Run proposal agent (cloud)',
    requiresAuth: true,
    category: 'AI',
    payload: {
      tenant_id: 'test-tenant',
      org_id: 'test-org',
      deal_id: 'test-deal',
      customer_url: 'example.com',
      fathom_window: {
        start: '2025-01-01',
        end: '2025-10-17'
      },
      _verification: true
    }
  },
  
  // Analytics endpoints
  {
    name: 'Analytics Dashboard',
    path: '/analytics/dashboard',
    method: 'GET',
    description: 'Get analytics dashboard data',
    requiresAuth: true,
    category: 'Analytics'
  },
  
  // Data endpoints
  {
    name: 'Load Data',
    path: '/data/load',
    method: 'GET',
    description: 'Load user ROI data',
    requiresAuth: true,
    category: 'Core'
  },
  {
    name: 'Proposal Logs',
    path: '/proposal-logs',
    method: 'GET',
    description: 'Get proposal run logs',
    requiresAuth: true,
    category: 'Core'
  }
];

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  response?: any;
  error?: any;
}

export function BackendConnectionVerifier() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const testEndpoint = async (endpoint: EndpointTest): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      let response;
      
      if (endpoint.requiresAuth) {
        // Use apiCall which handles auth
        if (endpoint.method === 'GET') {
          response = await apiCall(endpoint.path, { method: 'GET' });
        } else {
          response = await apiCall(endpoint.path, {
            method: 'POST',
            body: endpoint.payload || {}
          });
        }
      } else {
        // Direct fetch for non-auth endpoints
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514${endpoint.path}`;
        const res = await fetch(url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: endpoint.method === 'POST' ? JSON.stringify(endpoint.payload || {}) : undefined
        });
        
        response = await res.json();
      }
      
      const duration = Date.now() - startTime;
      
      // Check for success indicators
      const isSuccess = 
        response?.status === 'ok' ||
        response?.status === 'verified' ||
        response?.success === true ||
        response?.ok === true ||
        (response && !response.error);
      
      // Check for environment variable issues
      const hasEnvWarning = 
        response?.message?.includes('not configured') ||
        response?.message?.includes('API key') ||
        response?.secretsStatus?.includes('missing');
      
      return {
        endpoint: endpoint.name,
        status: hasEnvWarning ? 'warning' : (isSuccess ? 'success' : 'error'),
        message: response?.message || response?.error || 'Connected successfully',
        duration,
        response
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        endpoint: endpoint.name,
        status: 'error',
        message: error.message || 'Connection failed',
        duration,
        error: error.toString()
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    const newResults: TestResult[] = [];
    
    for (const endpoint of ENDPOINTS) {
      // Skip if category filter is active and doesn't match
      if (selectedCategory && endpoint.category !== selectedCategory) {
        continue;
      }
      
      const result = await testEndpoint(endpoint);
      newResults.push(result);
      setResults([...newResults]); // Update in real-time
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTesting(false);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'warning') => {
    const variants: any = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    };
    
    return (
      <Badge variant={variants[status]} className="gap-1">
        {getStatusIcon(status)}
        {status === 'success' ? 'OK' : status === 'warning' ? 'Warning' : 'Failed'}
      </Badge>
    );
  };

  const categories = Array.from(new Set(ENDPOINTS.map(e => e.category)));
  const filteredEndpoints = selectedCategory 
    ? ENDPOINTS.filter(e => e.category === selectedCategory)
    : ENDPOINTS;

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Connection Verifier
            </CardTitle>
            <CardDescription>
              Test all backend API endpoints and verify connectivity
            </CardDescription>
          </div>
          <Button
            onClick={runAllTests}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">{successCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-600">{warningCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-bold text-red-600">{errorCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All ({ENDPOINTS.length})
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({ENDPOINTS.filter(e => e.category === category).length})
            </Button>
          ))}
        </div>

        <Separator />

        {/* Test Results */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {filteredEndpoints.map((endpoint, index) => {
              const result = results.find(r => r.endpoint === endpoint.name);
              const isExpanded = showDetails[endpoint.name];
              
              return (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {endpoint.method}
                        </Badge>
                        {endpoint.requiresAuth && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auth
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{endpoint.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {endpoint.path}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {endpoint.description}
                      </p>
                      
                      {result && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs">
                            {result.message}
                            {result.duration && (
                              <span className="text-muted-foreground ml-2">
                                ({result.duration}ms)
                              </span>
                            )}
                          </p>
                          
                          {(result.response || result.error) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs gap-1"
                              onClick={() => setShowDetails({
                                ...showDetails,
                                [endpoint.name]: !isExpanded
                              })}
                            >
                              {isExpanded ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  Show Details
                                </>
                              )}
                            </Button>
                          )}
                          
                          {isExpanded && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(result.response || result.error, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {result ? (
                        getStatusBadge(result.status)
                      ) : testing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not Tested
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Environment Variable Warnings */}
        {results.some(r => r.status === 'warning') && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Environment Variable Issues Detected
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Some API keys may not be configured properly. The Edge Function may need to be redeployed to pick up environment variables. Check the Supabase dashboard for secret management.
                </p>
                <ul className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside space-y-1">
                  {results
                    .filter(r => r.status === 'warning')
                    .map(r => (
                      <li key={r.endpoint}>
                        <strong>{r.endpoint}</strong>: {r.message}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
