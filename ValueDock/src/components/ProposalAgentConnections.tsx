/**
 * ProposalAgentConnections - API configuration panel for AI integrations
 * 
 * Provides a centralized interface to configure all API keys needed for
 * the Proposal Agent feature including OpenAI, Supabase, Fathom, and Gamma.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, ExternalLink, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import { apiCall } from '../utils/auth';
import { toast } from 'sonner';

interface APIKeyConfig {
  openaiApiKey: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  fathomApiKey: string;
  gammaApiKey: string;
}

interface ConnectionStatus {
  openai: 'connected' | 'disconnected' | 'testing' | 'error';
  supabase: 'connected' | 'disconnected' | 'testing' | 'error';
  fathom: 'connected' | 'disconnected' | 'testing' | 'error';
  gamma: 'connected' | 'disconnected' | 'testing' | 'error';
}

export function ProposalAgentConnections() {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig>({
    openaiApiKey: '',
    supabaseUrl: '',
    supabaseServiceRoleKey: '',
    fathomApiKey: '',
    gammaApiKey: ''
  });

  const [showKeys, setShowKeys] = useState({
    openaiApiKey: false,
    supabaseServiceRoleKey: false,
    fathomApiKey: false,
    gammaApiKey: false
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    openai: 'disconnected',
    supabase: 'disconnected',
    fathom: 'disconnected',
    gamma: 'disconnected'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      // Load from backend (these would be stored securely in environment or encrypted storage)
      const response = await apiCall('/admin/api-config');
      if (response.success && response.config) {
        setApiKeys(response.config);
        // Test connections for configured keys
        if (response.config.openaiApiKey) testConnection('openai');
        if (response.config.supabaseUrl && response.config.supabaseServiceRoleKey) testConnection('supabase');
        if (response.config.fathomApiKey) testConnection('fathom');
        if (response.config.gammaApiKey) testConnection('gamma');
      }
    } catch (error) {
      console.error('Error loading API configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const response = await apiCall('/admin/api-config', {
        method: 'POST',
        body: apiKeys
      });

      if (response.success) {
        toast.success('API configuration saved successfully');
      } else {
        toast.error('Failed to save API configuration');
      }
    } catch (error: any) {
      console.error('Error saving API configuration:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service: 'openai' | 'supabase' | 'fathom' | 'gamma') => {
    setConnectionStatus(prev => ({ ...prev, [service]: 'testing' }));

    try {
      const response = await apiCall(`/admin/test-connection/${service}`, {
        method: 'POST',
        body: { apiKeys }
      });

      if (response.success) {
        setConnectionStatus(prev => ({ ...prev, [service]: 'connected' }));
        toast.success(`${service.toUpperCase()} connection successful`);
      } else {
        setConnectionStatus(prev => ({ ...prev, [service]: 'error' }));
        toast.error(`${service.toUpperCase()} connection failed: ${response.error}`);
      }
    } catch (error: any) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'error' }));
      console.error(`${service} connection test failed:`, error);
      toast.error(`${service.toUpperCase()} connection test failed`);
    }
  };

  const getStatusBadge = (status: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'testing':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Testing...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Configured
          </Badge>
        );
    }
  };

  const toggleShowKey = (key: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Proposal Agent Connections
            </CardTitle>
            <CardDescription>
              Configure API keys for AI-powered proposal generation and meeting analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Security Note:</strong> API keys are stored securely and never exposed in the frontend.
            These connections enable AI features including proposal generation, meeting transcription analysis,
            and presentation creation.
          </AlertDescription>
        </Alert>

        {/* OpenAI Configuration */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">OpenAI API</h3>
              <p className="text-sm text-muted-foreground">Required for AI proposal generation and analysis</p>
            </div>
            {getStatusBadge(connectionStatus.openai)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="openai-api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openai-api-key"
                  type={showKeys.openaiApiKey ? 'text' : 'password'}
                  value={apiKeys.openaiApiKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => toggleShowKey('openaiApiKey')}
                >
                  {showKeys.openaiApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                onClick={() => testConnection('openai')}
                disabled={!apiKeys.openaiApiKey || connectionStatus.openai === 'testing'}
                variant="outline"
              >
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                OpenAI Platform <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Supabase Configuration */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Supabase</h3>
              <p className="text-sm text-muted-foreground">Database and backend services</p>
            </div>
            {getStatusBadge(connectionStatus.supabase)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase URL</Label>
            <Input
              id="supabase-url"
              type="url"
              value={apiKeys.supabaseUrl}
              onChange={(e) => setApiKeys({ ...apiKeys, supabaseUrl: e.target.value })}
              placeholder="https://xxxxx.supabase.co"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-service-role-key">Service Role Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="supabase-service-role-key"
                  type={showKeys.supabaseServiceRoleKey ? 'text' : 'password'}
                  value={apiKeys.supabaseServiceRoleKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, supabaseServiceRoleKey: e.target.value })}
                  placeholder="eyJ..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => toggleShowKey('supabaseServiceRoleKey')}
                >
                  {showKeys.supabaseServiceRoleKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                onClick={() => testConnection('supabase')}
                disabled={!apiKeys.supabaseUrl || !apiKeys.supabaseServiceRoleKey || connectionStatus.supabase === 'testing'}
                variant="outline"
              >
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find these in your{' '}
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Supabase Dashboard <ExternalLink className="h-3 w-3" />
              </a>
              {' '}under Project Settings → API
            </p>
          </div>
        </div>

        {/* Fathom Configuration */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Fathom API</h3>
              <p className="text-sm text-muted-foreground">Meeting transcription and analysis</p>
            </div>
            {getStatusBadge(connectionStatus.fathom)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fathom-api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="fathom-api-key"
                  type={showKeys.fathomApiKey ? 'text' : 'password'}
                  value={apiKeys.fathomApiKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, fathomApiKey: e.target.value })}
                  placeholder="fth_..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => toggleShowKey('fathomApiKey')}
                >
                  {showKeys.fathomApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                onClick={() => testConnection('fathom')}
                disabled={!apiKeys.fathomApiKey || connectionStatus.fathom === 'testing'}
                variant="outline"
              >
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://app.fathom.video/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Fathom Settings <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Gamma Configuration */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Gamma API</h3>
              <p className="text-sm text-muted-foreground">AI-powered presentation generation</p>
            </div>
            {getStatusBadge(connectionStatus.gamma)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gamma-api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gamma-api-key"
                  type={showKeys.gammaApiKey ? 'text' : 'password'}
                  value={apiKeys.gammaApiKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, gammaApiKey: e.target.value })}
                  placeholder="gamma_..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => toggleShowKey('gammaApiKey')}
                >
                  {showKeys.gammaApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                onClick={() => testConnection('gamma')}
                disabled={!apiKeys.gammaApiKey || connectionStatus.gamma === 'testing'}
                variant="outline"
              >
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://gamma.app/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Gamma Settings <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={saveConfiguration} 
            disabled={saving}
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>

        {/* Connection Summary */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Connection Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 border rounded">
              <p className="text-sm text-muted-foreground mb-1">OpenAI</p>
              {getStatusBadge(connectionStatus.openai)}
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-sm text-muted-foreground mb-1">Supabase</p>
              {getStatusBadge(connectionStatus.supabase)}
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-sm text-muted-foreground mb-1">Fathom</p>
              {getStatusBadge(connectionStatus.fathom)}
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-sm text-muted-foreground mb-1">Gamma</p>
              {getStatusBadge(connectionStatus.gamma)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
