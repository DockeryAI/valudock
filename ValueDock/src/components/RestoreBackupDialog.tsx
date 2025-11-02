/**
 * RestoreBackupDialog - Restore deleted entities from backups
 * 
 * Features:
 * - View backups for last 6 months
 * - Filter by entity type (tenants, organizations, users, data)
 * - Preview backup details before restore
 * - Confirm restore action
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Database, Clock, AlertCircle, Building2, Users, User, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { apiCall } from '../utils/auth';
import { toast } from 'sonner@2.0.3';

interface Backup {
  id: string;
  type: 'tenant' | 'organization' | 'user' | 'data';
  entityId?: string;
  entityName?: string;
  deletedAt: string;
  deletedBy: string;
  data: any;
  expiresAt: string;
}

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreSuccess: () => void;
}

export function RestoreBackupDialog({
  open,
  onOpenChange,
  onRestoreSuccess
}: RestoreBackupDialogProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'tenant' | 'organization' | 'user' | 'data'>('all');

  useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/admin/backups/list');
      setBackups(response.backups || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to restore this ${backup.type}? This will recreate the deleted entity.`)) {
      return;
    }

    setRestoring(true);
    try {
      await apiCall('/admin/backups/restore', {
        method: 'POST',
        body: { backupId: backup.id }
      });
      
      toast.success(`${backup.type} restored successfully`);
      onRestoreSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast.error(error.message || 'Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!confirm('Are you sure you want to permanently delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      await apiCall(`/admin/backups/${backup.id}`, {
        method: 'DELETE'
      });
      
      toast.success('Backup deleted permanently');
      loadBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      toast.error(error.message || 'Failed to delete backup');
    }
  };

  const filteredBackups = filterType === 'all' 
    ? backups 
    : backups.filter(b => b.type === filterType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tenant':
        return <Building2 className="h-4 w-4" />;
      case 'organization':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'data':
        return <FileText className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'tenant':
        return 'default';
      case 'organization':
        return 'secondary';
      case 'user':
        return 'outline';
      case 'data':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Restore from Backup
          </DialogTitle>
          <DialogDescription>
            Restore deleted tenants, organizations, users, or data from backups within the last 6 months.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tenant">Tenants</TabsTrigger>
            <TabsTrigger value="organization">Organizations</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value={filterType} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading backups...</p>
                </div>
              </div>
            ) : filteredBackups.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No backups found. Backups are automatically created when you delete tenants, organizations, users, or clear data.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead>Deleted By</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBackups.map((backup) => {
                      const daysUntilExpiry = getDaysUntilExpiry(backup.expiresAt);
                      const isExpiringSoon = daysUntilExpiry <= 30;
                      
                      return (
                        <TableRow key={backup.id}>
                          <TableCell>
                            <Badge variant={getTypeBadgeVariant(backup.type)} className="flex items-center gap-1 w-fit">
                              {getTypeIcon(backup.type)}
                              <span className="capitalize">{backup.type}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {backup.entityName || backup.entityId || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(backup.deletedAt)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {backup.deletedBy}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className={`text-sm ${isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                                {daysUntilExpiry} days
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(backup)}
                                disabled={restoring}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBackup(backup)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200 mt-4">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <strong>Backup Retention:</strong> Backups are automatically deleted after 6 months. Items expiring within 30 days are highlighted in orange.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={loadBackups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
