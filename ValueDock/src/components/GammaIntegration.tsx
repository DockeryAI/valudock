import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Download,
  FileText,
  Presentation,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GammaIntegrationProps {
  presentationContent: string; // Outline format content from ChatGPT
  onGenerateSuccess?: (gammaUrl: string) => void;
}

type GammaStatus = 'idle' | 'sending' | 'processing' | 'success' | 'error';

interface GammaSlide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export function GammaIntegration({ presentationContent, onGenerateSuccess }: GammaIntegrationProps) {
  const [status, setStatus] = useState<GammaStatus>('idle');
  const [gammaUrl, setGammaUrl] = useState<string>('');
  const [slides, setSlides] = useState<GammaSlide[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Generate presentation in Gamma
  const handleGenerateInGamma = async () => {
    if (!presentationContent || presentationContent.trim().length === 0) {
      toast.error('Please generate presentation content first');
      return;
    }

    setStatus('sending');
    setErrorMessage('');
    
    try {
      // Step 1: Send content to Gamma API
      toast.info('Sending content to Gamma...');
      
      // Simulate API call to backend which then calls Gamma API
      // In production, this would be: 
      // const response = await fetch('/api/gamma/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: presentationContent })
      // });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('processing');
      toast.info('Gamma is processing your presentation...');
      
      // Step 2: Wait for Gamma to generate presentation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Retrieve presentation data
      // Mock data - in production this would come from Gamma API
      const mockSlides: GammaSlide[] = [
        {
          id: '1',
          title: 'Executive Summary',
          content: 'Company overview, challenges, and proposed solutions',
          imageUrl: undefined
        },
        {
          id: '2', 
          title: 'Current Challenges',
          content: 'Key pain points and business impact',
          imageUrl: undefined
        },
        {
          id: '3',
          title: 'Proposed Solution',
          content: 'Automation strategy and implementation approach',
          imageUrl: undefined
        },
        {
          id: '4',
          title: 'Financial Impact',
          content: 'ROI metrics, NPV, IRR, and payback period',
          imageUrl: undefined
        },
        {
          id: '5',
          title: 'Implementation Timeline',
          content: 'Phased rollout and key milestones',
          imageUrl: undefined
        },
        {
          id: '6',
          title: 'Next Steps',
          content: 'Action items and engagement plan',
          imageUrl: undefined
        }
      ];
      
      const mockGammaUrl = 'https://gamma.app/docs/presentation-abc123';
      
      setSlides(mockSlides);
      setGammaUrl(mockGammaUrl);
      setStatus('success');
      setLastSyncTime(new Date());
      
      toast.success('Presentation generated successfully in Gamma!');
      
      if (onGenerateSuccess) {
        onGenerateSuccess(mockGammaUrl);
      }
      
    } catch (error) {
      console.error('Gamma generation error:', error);
      setStatus('error');
      setErrorMessage('Failed to generate presentation in Gamma. Please try again.');
      toast.error('Failed to generate presentation');
    }
  };

  // Refresh/sync presentation from Gamma
  const handleRefreshFromGamma = async () => {
    if (!gammaUrl) return;
    
    setStatus('processing');
    toast.info('Syncing latest version from Gamma...');
    
    try {
      // In production: fetch updated slides from Gamma API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLastSyncTime(new Date());
      setStatus('success');
      toast.success('Presentation synced successfully');
      
    } catch (error) {
      console.error('Sync error:', error);
      setErrorMessage('Failed to sync with Gamma');
      toast.error('Sync failed');
    }
  };

  // Open in Gamma for editing
  const handleEditInGamma = () => {
    if (gammaUrl) {
      window.open(gammaUrl, '_blank');
      toast.info('Opening in Gamma...');
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    toast.info('Downloading PDF from Gamma...');
    
    try {
      // In production: call Gamma API to export as PDF
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleExportPPTX = async () => {
    toast.info('Downloading PowerPoint from Gamma...');
    
    try {
      // In production: call Gamma API to export as PPTX
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('PowerPoint downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PowerPoint');
    }
  };

  const handleExportGoogleSlides = async () => {
    toast.info('Sending to Google Slides...');
    
    try {
      // In production: call Gamma API to export to Google Slides
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Sent to Google Slides successfully');
    } catch (error) {
      toast.error('Failed to send to Google Slides');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return null;
      case 'sending':
        return (
          <Badge variant="outline" className="bg-blue-50">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sending to Gamma...
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-50">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Gamma is processing...
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Draft received
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            Generation failed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Trigger */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Presentation className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <div>
                <CardTitle className="text-sm md:text-base">Gamma Presentation Generator</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Create polished presentation slides from your content
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleGenerateInGamma}
              disabled={status === 'sending' || status === 'processing' || !presentationContent}
              className="flex-1"
            >
              {status === 'sending' || status === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Presentation className="h-4 w-4 mr-2" />
                  {status === 'success' ? 'Regenerate in Gamma' : 'Generate in Gamma'}
                </>
              )}
            </Button>
            
            {status === 'success' && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleEditInGamma}
                  className="gap-2 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit in Gamma</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleRefreshFromGamma}
                  disabled={status === 'processing'}
                  className="w-full sm:w-auto"
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${status === 'processing' ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </>
            )}
          </div>

          {!presentationContent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please generate presentation content using ChatGPT first. Make sure the content is in outline format for best results.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gamma Preview Container */}
      {status === 'success' && slides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gamma Presentation Preview</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {slides.length} slides generated. Click 'Edit in Gamma' to customize further.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className="group relative border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-muted/30"
                  onClick={handleEditInGamma}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2">{slide.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{slide.content}</p>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      {status === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Export Presentation</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Download or share your Gamma presentation
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleExportPPTX} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PPTX
              </Button>
              <Button onClick={handleExportGoogleSlides} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Send to Google Slides
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Alert>
        <Presentation className="h-4 w-4" />
        <AlertDescription>
          <strong>Gamma Integration:</strong> Your presentation content will be sent to Gamma.app which uses AI to create beautiful, polished slides. You can then edit, customize, and export the presentation in multiple formats.
        </AlertDescription>
      </Alert>
    </div>
  );
}
