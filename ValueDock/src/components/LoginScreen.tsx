import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { signIn } from '../utils/auth';
import { projectId } from '../utils/supabase/info';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initLoading, setInitLoading] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting sign in with:', email);
      const result = await signIn(email, password);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        const errorMsg = result.error || 'Failed to sign in';
        console.error('Sign in failed:', errorMsg);
        
        // Provide helpful error messages
        if (errorMsg.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please click "Initialize Database" or "Reset Users" below.');
          setShowReset(true);
        } else {
          setError(errorMsg);
        }
      }
    } catch (err: any) {
      console.error('Sign in exception:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitLoading(true);
    setError('');
    setInitSuccess(false);
    setShowReset(false);
    
    try {
      console.log('Initializing database...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to initialize: ${errorText}`);
      }

      const data = await response.json();
      console.log('Initialization successful:', data);
      
      setInitSuccess(true);
      setCredentials(data.credentials);
      
      // Auto-fill admin credentials
      if (data.credentials?.admin) {
        setEmail(data.credentials.admin.email);
        setPassword(data.credentials.admin.password);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError(`Initialization failed: ${err.message}`);
    } finally {
      setInitLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('This will delete ALL users and recreate test accounts. Continue?')) {
      return;
    }
    
    setInitLoading(true);
    setError('');
    setInitSuccess(false);
    setShowReset(false);
    
    try {
      console.log('Resetting users...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/reset-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reset: ${errorText}`);
      }

      const data = await response.json();
      console.log('Reset successful:', data);
      
      setInitSuccess(true);
      setCredentials(data.credentials);
      
      // Auto-fill admin credentials
      if (data.credentials?.admin) {
        setEmail(data.credentials.admin.email);
        setPassword(data.credentials.admin.password);
      }
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(`Reset failed: ${err.message}`);
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center px-4 md:px-6">
          <CardTitle className="text-2xl md:text-3xl">ValuDock</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Sign in to access your automation ROI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {initSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">Database initialized successfully!</p>
                    {credentials && (
                      <div className="text-sm space-y-1 mt-2">
                        <p><strong>Admin:</strong> {credentials.admin.email} / {credentials.admin.password}</p>
                        <p><strong>User:</strong> {credentials.finance.email} / {credentials.finance.password}</p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                First time here?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleInitialize}
            disabled={initLoading || loading}
          >
            {initLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Database & Create Test Accounts'
            )}
          </Button>

          {showReset && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleReset}
              disabled={initLoading || loading}
            >
              Reset Users & Start Fresh
            </Button>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Click "Initialize Database" to create:</p>
            <ul className="text-left ml-4 space-y-1">
              <li>• Test tenant and organization</li>
              <li>• Admin account (admin@valudock.com / admin123)</li>
              <li>• User account (finance@testorganization.com / Test123!)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
