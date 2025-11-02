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
  Info
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/auth';

interface WebhookMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  attendees?: Array<{
    name?: string;
    email?: string;
  }>;
  summary?: string;
  transcript?: string;
  domains?: string[];
}

export function FathomWebhookSetup({ domain }: { domain?: string }) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [meetings, setMeetings] = useState<WebhookMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook`;
    setWebhookUrl(url);
  }, []);

  useEffect(() => {
    if (domain) {
      fetchMeetings();
    }
  }, [domain]);

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
    if (!domain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-888f4514/fathom-webhook/meetings/${domain}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch meetings');
      }

      const data = await response.json();
      setMeetings(data.meetings || []);
      console.log('[FATHOM-WEBHOOK-SETUP] Loaded', data.meetings?.length || 0, 'meetings');
      
    } catch (err: any) {
      console.error('[FATHOM-WEBHOOK-SETUP] Error:', err);
      setError(err.message);
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
            <CardTitle>Fathom Webhook Setup</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            Webhook Mode
          </Badge>
        </div>
        <CardDescription>
          Configure Fathom to send meeting data automatically via webhook.
          {domain && (
            <span className="block mt-1 font-medium text-blue-700">
              📌 Filtering meetings for: <strong>{domain}</strong>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup Instructions</TabsTrigger>
            <TabsTrigger value="status">Webhook Status</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Why Webhooks?</strong> Due to DNS limitations in Supabase Edge Functions, 
                we use webhooks instead of API calls. Fathom will push meeting data directly to us.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Copy Webhook URL</h4>
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
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                  <li>Go to <a href="https://app.fathom.video/settings/integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    Fathom Settings → Integrations <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Find the "Webhooks" section</li>
                  <li>Click "Add Webhook"</li>
                  <li>Paste the webhook URL above</li>
                  <li>Select event: <code className="bg-gray-100 px-1 py-0.5 rounded">meeting.completed</code></li>
                  <li>Save the webhook configuration</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Test the Integration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  After configuring the webhook, complete a test meeting in Fathom. 
                  The meeting data will be sent automatically to ValueDock.
                </p>
                <Button 
                  onClick={fetchMeetings}
                  disabled={!domain || loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Check for Webhook Data
                </Button>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Automatic Processing:</strong> Once configured, meeting data will flow 
                  automatically. The AI will extract participants, challenges, and goals for your presentations.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            {domain && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Domain Filtering Active:</strong> Only showing meetings where attendees have 
                  <code className="mx-1 px-1.5 py-0.5 bg-blue-100 rounded text-xs">@{domain}</code> 
                  email addresses. Meetings with other companies are automatically excluded.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Webhook Meetings for {domain || 'this domain'}</h4>
              <Button 
                onClick={fetchMeetings}
                disabled={!domain || loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!domain && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enter a company website domain to check webhook meeting status
                </AlertDescription>
              </Alert>
            )}

            {domain && !loading && meetings.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No webhook meetings received for <strong>{domain}</strong> yet. 
                  Make sure the webhook is configured in Fathom and meetings have been completed.
                </AlertDescription>
              </Alert>
            )}

            {meetings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Found {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {meetings.map((meeting) => (
                    <Card key={meeting.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{meeting.title}</h5>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(meeting.startTime).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {meeting.attendees?.length || 0} attendees
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {meeting.summary && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Summary
                              </Badge>
                            )}
                            {meeting.transcript && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Transcript
                              </Badge>
                            )}
                          </div>
                        </div>

                        {meeting.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {meeting.summary}
                          </p>
                        )}

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {meeting.attendees.slice(0, 3).map((attendee, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {attendee.name || attendee.email}
                              </Badge>
                            ))}
                            {meeting.attendees.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{meeting.attendees.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
