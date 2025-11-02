import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Webhook, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Clock,
  Users,
  FileText,
  Info,
  Settings
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/auth';

interface WebhookMeeting {
  id: string;
  title: string;
  startTime: string;
  attendees?: Array<{ name?: string; email?: string }>;
  summary?: string;
}

interface FathomWebhookAdminProps {
  // Optional: pass domain to check specific company meetings
  defaultDomain?: string;
}

export function FathomWebhookAdmin({ defaultDomain }: FathomWebhookAdminProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [meetings, setMeetings] = useState<WebhookMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testDomain, setTestDomain] = useState(defaultDomain || '');

  useEffect(() => {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook`;
    setWebhookUrl(url);
  }, []);

  const copyWebhookUrl = async () => {
    try {
      // Method 1: Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }

    // Method 2: Fallback to document.execCommand (works in more contexts)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = webhookUrl;
      
      // Make it invisible but accessible
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      console.error('All copy methods failed:', err);
      // Show user-friendly error
      alert(`Unable to copy automatically. Please manually copy:\n\n${webhookUrl}`);
    }
  };

  const fetchMeetings = async () => {
    if (!testDomain) {
      setError('Please enter a company domain to test');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook/meetings/${testDomain}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch meetings (${response.status})`);
      }

      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (err: any) {
      console.error('Error fetching meetings:', err);
      setError(err.message || 'Failed to fetch meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-blue-600" />
            <CardTitle>Fathom Integration - API Mode</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            API-Based
          </Badge>
        </div>
        <CardDescription>
          Meeting data is now pulled directly from ValueDock's API instead of webhooks. 
          This provides real-time access to meetings filtered by organization domain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">
              <Settings className="h-4 w-4 mr-2" />
              API Information
            </TabsTrigger>
            <TabsTrigger value="status">
              <FileText className="h-4 w-4 mr-2" />
              Test & Refresh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>API-Based Integration Active</strong><br/>
                The system now fetches meeting data directly from ValueDock's API in real-time.
                No webhook configuration is required. Meetings are automatically filtered by organization domain.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How It Works</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Meeting data is pulled from ValueDock's backend API</li>
                  <li>Meetings are automatically filtered by company domain (e.g., @acme.com)</li>
                  <li>Data is fetched in real-time when generating presentations</li>
                  <li>Includes meeting summaries, highlights, and attendee information</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Legacy Webhook URL (For Reference)</h4>
                <div className="flex gap-2">
                  <Input 
                    value={webhookUrl} 
                    readOnly 
                    className="font-mono text-sm cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      // Select all text when clicked for easy manual copying
                      const input = e.currentTarget;
                      input.select();
                    }}
                    title="Click to select, then Ctrl+C to copy"
                  />
                  <Button 
                    onClick={copyWebhookUrl}
                    variant="outline"
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tip: Click the URL field to select it, or use the Copy button
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Configure in Fathom</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Open{' '}
                    <a
                      href="https://app.fathom.video/settings/integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Fathom Settings → Integrations
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Find <strong>Webhooks</strong> section → Click <strong>Add Webhook</strong></li>
                  <li>Paste your webhook URL</li>
                  <li>Select event: <code className="bg-gray-100 px-1 rounded">meeting.completed</code></li>
                  <li>Click <strong>Save</strong></li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Verify Setup</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Complete a test meeting in Fathom</li>
                  <li>Wait for meeting to process (usually 1-2 minutes)</li>
                  <li>Go to "Test Status" tab to verify meeting was received</li>
                </ul>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Automatic Processing:</strong> Once configured, meeting data will flow 
                  automatically. Users can generate meeting history, challenges, and goals from their presentations.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Real-Time API Access:</strong> Enter a company domain below to fetch the latest meetings
                from ValueDock's API. Meetings are filtered by domain (e.g., attendees with @acme.com email addresses).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Domain (e.g., acme.com)</label>
              <div className="flex gap-2">
                <Input
                  value={testDomain}
                  onChange={(e) => setTestDomain(e.target.value.toLowerCase())}
                  placeholder="acme.com"
                  className="flex-1"
                />
                <Button 
                  onClick={fetchMeetings}
                  disabled={!testDomain || loading}
                  variant="default"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Fetching...' : 'Refresh Meetings'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Fetches meetings from ValueDock API where attendees have @{testDomain || 'domain'} email addresses
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && meetings.length === 0 && testDomain && !error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No meetings found for <strong>{testDomain}</strong>. 
                  Make sure the webhook is configured and meetings have attendees with @{testDomain} email addresses.
                </AlertDescription>
              </Alert>
            )}

            {meetings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Found {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} for {testDomain}
                  </h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Webhook Active
                  </Badge>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {meetings.slice(0, 10).map((meeting) => (
                    <Card key={meeting.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-medium text-sm">{meeting.title || 'Untitled Meeting'}</h5>
                          {meeting.attendees && meeting.attendees.length > 0 && (
                            <Badge variant="secondary" className="shrink-0">
                              <Users className="h-3 w-3 mr-1" />
                              {meeting.attendees.length}
                            </Badge>
                          )}
                        </div>
                        
                        {meeting.startTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(meeting.startTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {meeting.attendees
                              .filter(att => att.email?.toLowerCase().includes(testDomain.toLowerCase()))
                              .slice(0, 3)
                              .map((attendee, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {attendee.name || attendee.email?.split('@')[0]}
                                </Badge>
                              ))}
                          </div>
                        )}

                        {meeting.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {meeting.summary.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {meetings.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Showing 10 of {meetings.length} meetings
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
