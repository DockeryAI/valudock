import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '../utils/auth';
import { projectId } from '../utils/supabase/info';

interface DiagnosticCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  details: string;
  errorType?: string;
  response?: any;
}

interface DiagnosticResult {
  timestamp: string;
  summary: string;
  checks: DiagnosticCheck[];
}

export function FathomDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      console.log('[FATHOM-DIAGNOSTIC] Starting diagnostic...');
      
      // Get auth token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        setResult({
          timestamp: new Date().toISOString(),
          summary: 'FAILED: Not authenticated',
          checks: [{
            name: 'Authentication',
            status: 'FAIL',
            details: 'You must be logged in to run diagnostics'
          }]
        });
        return;
      }

      // Call diagnostic endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-diagnostic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Diagnostic endpoint failed: ${response.status}`);
      }

      const diagnosticData = await response.json();
      console.log('[FATHOM-DIAGNOSTIC] Results:', diagnosticData);
      setResult(diagnosticData);

    } catch (error: any) {
      console.error('[FATHOM-DIAGNOSTIC] Error:', error);
      setResult({
        timestamp: new Date().toISOString(),
        summary: 'ERROR: Diagnostic failed to run',
        checks: [{
          name: 'Diagnostic Execution',
          status: 'ERROR',
          details: error.message || 'Unknown error occurred'
        }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'FAIL':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'ERROR':
        return <Badge className="bg-yellow-100 text-yellow-800">ERROR</Badge>;
      default:
        return <Badge>UNKNOWN</Badge>;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9998]"
        size="sm"
        variant="outline"
      >
        🔍 Fathom Diagnostic
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-[9998] w-[90vw] md:w-[500px] shadow-2xl border-2 border-blue-500">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">🔍 Fathom Diagnostic</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 hover:bg-white/20 text-white"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <CardContent className="space-y-4 pt-4 max-h-[500px] overflow-y-auto">
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostic...
            </>
          ) : (
            'Run Diagnostic Test'
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Summary</p>
              <p className={`${result.summary.includes('SUCCESS') ? 'text-green-700' : result.summary.includes('FAILED') ? 'text-red-700' : 'text-yellow-700'}`}>
                {result.summary}
              </p>
              <p className="text-xs text-gray-400 mt-1">{new Date(result.timestamp).toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              {result.checks.map((check, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <h4 className="font-medium">{check.name}</h4>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-gray-600 ml-7">{check.details}</p>
                  {check.errorType && (
                    <p className="text-xs text-gray-400 ml-7 mt-1">Error Type: {check.errorType}</p>
                  )}
                  {check.response && (
                    <details className="ml-7 mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">View Response</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(check.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {result.summary.includes('DNS resolution error') && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">✅ Solution Implemented: Webhooks</h4>
                <p className="text-sm text-blue-800 mb-3">
                  The DNS issue has been resolved using <strong>Fathom Webhooks</strong>. 
                  Instead of pulling data from Fathom API, Fathom now pushes meeting data directly to ValueDock.
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to the <strong>Presentation Screen</strong> in ValueDock</li>
                    <li>Find the <strong>Fathom Webhook Setup</strong> card</li>
                    <li>Follow the setup instructions to configure webhooks in Fathom</li>
                    <li>Complete a test meeting - data will flow automatically!</li>
                  </ol>
                  <p className="mt-3 text-xs">
                    💡 <strong>Tip:</strong> The webhook setup takes ~2 minutes and provides automatic, 
                    real-time meeting data without any API limitations.
                  </p>
                </div>
              </div>
            )}

            {result.summary.includes('Invalid API key') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">🔑 API Key Issue</h4>
                <p className="text-sm text-red-800">
                  The FATHOM_API_KEY environment variable is either not set or is invalid. 
                  Please verify your API key in the Supabase dashboard under Project Settings → Edge Functions → Environment Variables.
                </p>
              </div>
            )}
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
}
