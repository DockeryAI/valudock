import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/auth';
import { projectId } from '../utils/supabase/info';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function AuthTokenDebugger() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAuth = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Step 1: Get session
      console.log('[DEBUG] Step 1: Getting session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setResult({
          step: 'session',
          error: sessionError.message,
          details: 'Failed to get session from Supabase'
        });
        return;
      }

      if (!session) {
        setResult({
          step: 'session',
          error: 'No session found',
          details: 'User is not logged in'
        });
        return;
      }

      console.log('[DEBUG] Session exists');
      console.log('[DEBUG] User email:', session.user?.email);
      console.log('[DEBUG] Token length:', session.access_token?.length);

      const tokenPreview = session.access_token.substring(0, 50) + '...';
      
      // Step 2: Verify token with backend
      console.log('[DEBUG] Step 2: Verifying token with backend...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/debug/verify-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[DEBUG] Backend response status:', response.status);
      const data = await response.json();
      console.log('[DEBUG] Backend response data:', data);

      if (response.ok && data.success) {
        setResult({
          step: 'success',
          session: {
            email: session.user?.email,
            userId: session.user?.id,
            tokenLength: session.access_token.length,
            tokenPreview
          },
          decoded: data.decoded,
          backend: {
            hasUserId: data.hasUserId,
            tokenLength: data.tokenLength
          }
        });
      } else {
        setResult({
          step: 'backend',
          error: data.error || 'Backend verification failed',
          details: data.details || 'Token could not be verified',
          session: {
            email: session.user?.email,
            userId: session.user?.id,
            tokenLength: session.access_token.length,
            tokenPreview
          }
        });
      }
    } catch (error: any) {
      console.error('[DEBUG] Test error:', error);
      setResult({
        step: 'error',
        error: error.message,
        details: 'Unexpected error during test'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Auth Token Debugger</h3>
        <p className="text-sm text-muted-foreground">
          Use this tool to verify your authentication token is working correctly.
        </p>
      </div>

      <Button
        onClick={testAuth}
        disabled={testing}
        className="w-full"
      >
        {testing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Authentication'
        )}
      </Button>

      {result && (
        <div className="space-y-3">
          {result.step === 'success' && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <div className="font-semibold mb-2">✅ Authentication Working!</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Email:</strong> {result.session.email}</div>
                  <div><strong>User ID:</strong> {result.decoded.sub}</div>
                  <div><strong>Token Length:</strong> {result.session.tokenLength} chars</div>
                  <div><strong>Token Audience:</strong> {result.decoded.aud}</div>
                  <div><strong>Token Role:</strong> {result.decoded.role}</div>
                  <div><strong>Expires:</strong> {new Date(result.decoded.exp * 1000).toLocaleString()}</div>
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono break-all">
                    {result.session.tokenPreview}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result.step === 'session' && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <div className="font-semibold mb-2">❌ Session Error</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Error:</strong> {result.error}</div>
                  <div><strong>Details:</strong> {result.details}</div>
                  <div className="mt-2 p-2 bg-white/50 rounded">
                    <strong>Solution:</strong> Please log out and log back in.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result.step === 'backend' && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <div className="font-semibold mb-2">⚠️ Backend Verification Failed</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Session Email:</strong> {result.session.email}</div>
                  <div><strong>Session User ID:</strong> {result.session.userId}</div>
                  <div><strong>Token Length:</strong> {result.session.tokenLength} chars</div>
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono break-all">
                    {result.session.tokenPreview}
                  </div>
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <div><strong>Backend Error:</strong> {result.error}</div>
                    <div><strong>Details:</strong> {result.details}</div>
                  </div>
                  <div className="mt-2 p-2 bg-white/50 rounded">
                    <strong>Solution:</strong> The token format may be incorrect. Try refreshing the page or logging out and back in.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result.step === 'error' && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <div className="font-semibold mb-2">❌ Unexpected Error</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Error:</strong> {result.error}</div>
                  <div><strong>Details:</strong> {result.details}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-3">
        <strong>How it works:</strong>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Gets your current session from Supabase</li>
          <li>Extracts your access token</li>
          <li>Sends it to the backend for verification</li>
          <li>Backend decodes the JWT and checks for user ID</li>
          <li>Reports success or specific error</li>
        </ol>
      </div>
    </Card>
  );
}
