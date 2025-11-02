/**
 * DeleteConfirmationDialog - Safety confirmation for critical delete operations
 * 
 * Features:
 * - Require typing "delete" for single entity deletion
 * - Require typing "delete multiple" for multiple entity deletion
 * - Clear warnings about consequences
 * - Backup notification
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Database, Clock, Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  entityType: 'tenant' | 'tenants' | 'organization' | 'organizations' | 'user' | 'users' | 'data';
  entityName?: string;
  count?: number; // For multiple deletions
  additionalWarning?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  entityType,
  entityName,
  count = 1,
  additionalWarning
}: DeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine if this is a multiple deletion
  const isMultiple = entityType === 'data' 
    ? false // 'data' is always singular (clear all data)
    : count > 1 || entityType.endsWith('s');
  
  const requiredText = isMultiple ? 'delete multiple' : 'delete';
  const isValid = confirmText.toLowerCase() === requiredText;

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setConfirmText('');
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'tenant':
      case 'tenants':
        return isMultiple ? 'tenants' : 'tenant';
      case 'organization':
      case 'organizations':
        return isMultiple ? 'organizations' : 'organization';
      case 'user':
      case 'users':
        return isMultiple ? 'users' : 'user';
      case 'data':
        return 'all data';
      default:
        return 'item';
    }
  };

  const getConsequences = () => {
    switch (entityType) {
      case 'tenant':
      case 'tenants':
        return [
          'All organizations within the tenant(s) will be deleted',
          'All users within the tenant(s) will be deleted',
          'All associated data and settings will be deleted'
        ];
      case 'organization':
      case 'organizations':
        return [
          'All users within the organization(s) will be deleted',
          'All associated data, processes, and calculations will be deleted'
        ];
      case 'user':
      case 'users':
        return [
          'User access will be revoked immediately',
          'User-specific data may be deleted'
        ];
      case 'data':
        return [
          'All processes and calculations will be deleted',
          'All scenario data will be deleted',
          'All timeline and implementation data will be deleted'
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            {isMultiple ? (
              <>
                You are about to delete <strong>{count} {getEntityLabel()}</strong>.
              </>
            ) : (
              <>
                You are about to delete {entityName ? (
                  <>the {getEntityLabel()} <strong>"{entityName}"</strong></>
                ) : (
                  <>this {getEntityLabel()}</>
                )}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">
                ⚠️ This action will have the following consequences:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {getConsequences().map((consequence, index) => (
                  <li key={index}>{consequence}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Additional Warning */}
          {additionalWarning && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                {additionalWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Backup Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3" />
                <strong>Backup Protection</strong>
              </div>
              A backup will be created before deletion. You can restore deleted {getEntityLabel()} from the backup for up to <strong>6 months</strong>.
            </AlertDescription>
          </Alert>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-semibold">
              Type <code className="px-2 py-0.5 bg-muted rounded text-red-600 font-mono">{requiredText}</code> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${requiredText}" here`}
              className="font-mono"
              autoComplete="off"
              disabled={loading}
            />
            {confirmText && !isValid && (
              <p className="text-sm text-red-600">
                Please type "{requiredText}" exactly to confirm
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <span className="mr-2">⏳</span>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {isMultiple ? `${count} ${getEntityLabel()}` : getEntityLabel()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
