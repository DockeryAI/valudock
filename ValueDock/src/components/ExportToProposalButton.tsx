/**
 * Export to Proposal Button Component
 *
 * Allows users to export ROI data from ValuDock to Sales Assistant
 * for proposal generation. Shows confirmation dialog and handles
 * the export process with loading states and feedback.
 *
 * NEW: Includes meetings section with company identification,
 * contact management, and pre-send validation to check for
 * existing Fathom meetings before export.
 */

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2, Plus, X, Users, AlertTriangle } from 'lucide-react';

interface Contact {
  name: string;
  email: string;
  title: string;
  isMainContact?: boolean;
}

interface ExportToProposalButtonProps {
  dealId: string;
  organizationId: string;
  organizationWebsite?: string;
  tenantId: string;
  userId?: string;
  roiSummary?: {
    annual_savings?: number;
    payback_months?: number;
    processes_count?: number;
  };
  onSuccess?: (exportId: string, proposalId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ExportToProposalButton: React.FC<ExportToProposalButtonProps> = ({
  dealId,
  organizationId,
  organizationWebsite,
  tenantId,
  userId,
  roiSummary,
  onSuccess,
  onError,
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Meetings section state
  const [companyName, setCompanyName] = useState(organizationId || '');
  const [emailDomain, setEmailDomain] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', email: '', title: '', isMainContact: true }
  ]);

  // Meeting validation state
  const [isCheckingMeetings, setIsCheckingMeetings] = useState(false);
  const [meetingsCheckResult, setMeetingsCheckResult] = useState<any>(null);
  const [showMeetingsWarning, setShowMeetingsWarning] = useState(false);

  // Contact management functions
  const addContact = () => {
    setContacts([...contacts, { name: '', email: '', title: '', isMainContact: false }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  // Extract domain from email domain input
  const normalizeDomain = (domain: string): string => {
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  };

  // Check for meetings pre-send validation
  const handleCheckMeetings = async () => {
    if (!emailDomain.trim()) {
      setErrorMessage('Please enter an email domain (e.g., acme.com)');
      return;
    }

    setIsCheckingMeetings(true);
    setMeetingsCheckResult(null);
    setShowMeetingsWarning(false);
    setErrorMessage('');

    try {
      // Get Sales Assistant URL from environment
      const salesAssistantUrl = import.meta.env.VITE_SALES_ASSISTANT_URL || 'http://localhost:54321';

      const response = await fetch(`${salesAssistantUrl}/functions/v1/check-meetings-for-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailDomain: normalizeDomain(emailDomain),
          companyName: companyName,
          contactEmails: contacts.filter(c => c.email.trim()).map(c => c.email.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check meetings');
      }

      const result = await response.json();
      setMeetingsCheckResult(result);

      // Show warning if no meetings found
      if (result.totalMeetings === 0) {
        setShowMeetingsWarning(true);
      }

    } catch (error: any) {
      console.error('[CheckMeetings] Error:', error);
      setErrorMessage('Unable to check meetings. You can still proceed with export.');
    } finally {
      setIsCheckingMeetings(false);
    }
  };

  const handleExport = async () => {
    // Validate required fields
    if (!emailDomain.trim()) {
      setErrorMessage('Email domain is required (e.g., acme.com)');
      return;
    }

    const mainContact = contacts.find(c => c.isMainContact);
    if (!mainContact || !mainContact.name.trim() || !mainContact.email.trim()) {
      setErrorMessage('Main contact name and email are required');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      // Get the current user ID if not provided
      const currentUserId = userId || 'system';

      // Get Sales Assistant URL from environment
      const salesAssistantUrl = import.meta.env.VITE_SALES_ASSISTANT_URL || 'http://localhost:54321';

      // Prepare contacts payload (filter out empty contacts)
      const validContacts = contacts.filter(c => c.name.trim() && c.email.trim());

      // Call the Sales Assistant webhook with new payload structure
      const response = await fetch(`${salesAssistantUrl}/functions/v1/valuedock-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_VALUEDOCK_WEBHOOK_SECRET || ''}`,
        },
        body: JSON.stringify({
          source: 'valuedock',
          exportId: `exp_${Date.now()}_${dealId}`,
          dealId,
          organizationId: companyName,
          organizationDomain: normalizeDomain(emailDomain),
          organizationWebsite: organizationWebsite || null,
          contacts: validContacts,
          tenantId,
          exportedAt: new Date().toISOString(),
          exportedBy: currentUserId,
          roi_summary: roiSummary || {},
          processes: [],
          timeline: {},
          assumptions: {},
          cost_breakdown: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const data = await response.json();

      setExportStatus('success');
      setShowConfirmation(false);

      // Call success callback
      if (onSuccess) {
        onSuccess(data.exportId, data.proposalId);
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
      }, 5000);

    } catch (error: any) {
      console.error('[ExportToProposal] Error:', error);
      setExportStatus('error');
      setErrorMessage(error.message || 'Failed to export to Sales Assistant');

      if (onError) {
        onError(error);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Button variant classes
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-blue-300',
  };

  const buttonClasses = `
    inline-flex items-center gap-2 rounded-lg font-medium
    transition-all duration-200 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative">
      {/* Main Export Button */}
      <button
        onClick={() => setShowConfirmation(true)}
        disabled={isExporting || exportStatus === 'success'}
        className={buttonClasses}
        title="Export ROI data to Sales Assistant for proposal generation"
      >
        {exportStatus === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Exported Successfully
          </>
        ) : isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Export to Proposal
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Export to Sales Assistant?
              </h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
              <p className="text-gray-600">
                This will send your ROI analysis to Sales Assistant where an AI-powered
                proposal will be generated. Please provide customer information to link
                with Fathom meeting transcripts.
              </p>

              {/* ROI Summary */}
              {roiSummary && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Annual Savings:</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {formatCurrency(roiSummary.annual_savings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Payback Period:</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {roiSummary.payback_months !== undefined ? `${roiSummary.payback_months} months` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Processes:</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {roiSummary.processes_count || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Meetings Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                  <span className="text-xs text-red-600">* Required</span>
                </div>

                {/* Company Name */}
                <div className="space-y-2 mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isExporting}
                  />
                </div>

                {/* Email Domain */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Domain <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    placeholder="e.g., acme.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isExporting}
                  />
                  <p className="text-xs text-gray-500">
                    Used to match Fathom meeting participants (e.g., john@acme.com)
                  </p>
                </div>

                {/* Contacts */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Contacts <span className="text-red-600">*</span>
                  </label>

                  {contacts.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">
                          {contact.isMainContact ? '👤 Main Contact' : `Contact ${index + 1}`}
                        </span>
                        {!contact.isMainContact && (
                          <button
                            onClick={() => removeContact(index)}
                            disabled={isExporting}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove contact"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={isExporting}
                        />
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                          placeholder="email@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={isExporting}
                        />
                        <input
                          type="text"
                          value={contact.title}
                          onChange={(e) => updateContact(index, 'title', e.target.value)}
                          placeholder="Job Title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={isExporting}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add Contact Button */}
                  <button
                    onClick={addContact}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Contact
                  </button>
                </div>

                {/* Check Meetings Button */}
                <div className="mt-4">
                  <button
                    onClick={handleCheckMeetings}
                    disabled={isCheckingMeetings || isExporting || !emailDomain.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isCheckingMeetings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking for Meetings...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Check for Meetings
                      </>
                    )}
                  </button>
                </div>

                {/* Meeting Check Results */}
                {meetingsCheckResult && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    meetingsCheckResult.totalMeetings > 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className="text-sm font-medium mb-1">
                      {meetingsCheckResult.recommendation}
                    </p>
                    {meetingsCheckResult.totalMeetings > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        <p><strong>Total:</strong> {meetingsCheckResult.totalMeetings} meeting(s)</p>
                        <p><strong>With Transcripts:</strong> {meetingsCheckResult.withTranscripts}</p>
                        {meetingsCheckResult.preview && meetingsCheckResult.preview.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Recent meetings:</p>
                            <ul className="list-disc list-inside ml-2">
                              {meetingsCheckResult.preview.slice(0, 3).map((m: any, i: number) => (
                                <li key={i}>{m.title} ({m.date})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Warning Banner */}
                {showMeetingsWarning && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">No Meetings Found</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        No Fathom meetings were found for this customer. The proposal will be generated
                        using only ValuDock ROI data. You can still proceed with the export.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 border-t pt-3">
                <p><strong>Deal ID:</strong> {dealId}</p>
                <p><strong>Organization:</strong> {organizationId}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isExporting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Export Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {exportStatus === 'error' && errorMessage && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Export Failed</h3>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              <button
                onClick={() => setExportStatus('idle')}
                className="text-sm text-red-700 underline mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {exportStatus === 'success' && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Export Successful!</h3>
              <p className="text-sm text-green-600 mt-1">
                ROI data sent to Sales Assistant. Check the Proposals tab to continue editing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportToProposalButton;
