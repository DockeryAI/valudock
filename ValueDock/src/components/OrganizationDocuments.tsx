import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { Upload, FileText, Trash2, Eye, Download, Search } from 'lucide-react';
import { apiCall, UserProfile } from '../utils/auth';

export interface OrganizationDocument {
  id: string;
  name: string;
  organizationId: string;
  organizationName?: string;
  tenantId: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName?: string;
}

interface OrganizationDocumentsProps {
  userProfile: UserProfile;
}

export function OrganizationDocuments({ userProfile }: OrganizationDocumentsProps) {
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<OrganizationDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadOrgId, setUploadOrgId] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<OrganizationDocument | null>(null);

  useEffect(() => {
    loadOrganizations();
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const data = await apiCall('/admin/organizations', 'GET');
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/documents', 'GET');
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by organization
    if (selectedOrg !== 'all') {
      filtered = filtered.filter(doc => doc.organizationId === selectedOrg);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile || !uploadOrgId) {
      toast.error('Please select a file and organization');
      return;
    }

    try {
      setLoading(true);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadFile);
      });

      const data = await apiCall('/admin/documents', 'POST', {
        name: uploadFile.name,
        organizationId: uploadOrgId,
        fileContent: base64,
        mimeType: uploadFile.type,
        fileSize: uploadFile.size
      });

      setDocuments([...documents, data.document]);
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadOrgId('');
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      await apiCall(`/admin/documents/${documentId}`, 'DELETE');
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (document: OrganizationDocument) => {
    setViewingDocument(document);
    setViewDialogOpen(true);
  };

  const downloadDocument = async (document: OrganizationDocument) => {
    try {
      window.open(document.fileUrl, '_blank');
      toast.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canUpload = ['master_admin', 'tenant_admin', 'org_admin'].includes(userProfile.role);
  const canDelete = ['master_admin', 'tenant_admin', 'org_admin'].includes(userProfile.role);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Documents</CardTitle>
              <CardDescription>
                Manage documents that can be referenced in workflows
              </CardDescription>
            </div>
            {canUpload && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a document for your organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Select value={uploadOrgId} onValueChange={setUploadOrgId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization..." />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      />
                      {uploadFile && (
                        <p className="text-sm text-muted-foreground">
                          {uploadFile.name} ({formatFileSize(uploadFile.size)})
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, Word, Excel, Text (max 10MB)
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={uploadDocument} disabled={loading || !uploadFile || !uploadOrgId}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          {loading && documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedOrg !== 'all' 
                  ? 'No documents found matching your filters'
                  : 'No documents uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.organizationName || doc.organizationId}</TableCell>
                      <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{doc.uploadedByName || doc.uploadedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDocument(doc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {viewingDocument && (
              <iframe
                src={viewingDocument.fileUrl}
                className="w-full h-full border rounded"
                title={viewingDocument.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
