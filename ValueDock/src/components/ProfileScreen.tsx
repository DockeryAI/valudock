import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { User, Lock, Palette, Image, AlertCircle, Save, Upload, Bug } from 'lucide-react';
import { apiCall } from '../utils/auth';
import { AuthTokenDebugger } from './AuthTokenDebugger';

interface ProfileScreenProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userId?: string;
  tenantId?: string | null;
  organizationId?: string | null;
  tenantName?: string;
  organizationName?: string;
  onProfileUpdate?: (data: any) => void;
}

export function ProfileScreen({ 
  userEmail = 'user@example.com',
  userName = 'John Doe',
  userRole = 'user',
  userId,
  tenantId,
  organizationId,
  tenantName,
  organizationName,
  onProfileUpdate
}: ProfileScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBranding, setIsLoadingBranding] = useState(false);

  const [profileData, setProfileData] = useState({
    name: userName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [brandingData, setBrandingData] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    logoUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const isAdmin = ['master_admin', 'tenant_admin', 'org_admin'].includes(userRole);
  
  const getProfileTitle = () => {
    if (userRole === 'master_admin') return 'Global Profile';
    if (userRole === 'tenant_admin' && tenantName) return `${tenantName} Profile`;
    if (userRole === 'org_admin' && organizationName) return `${organizationName} Profile`;
    return `${userName} Profile`;
  };

  useEffect(() => {
    if (isAdmin) {
      loadBrandingData();
    }
  }, [isAdmin, userRole, tenantId, organizationId]);

  const loadBrandingData = async () => {
    setIsLoadingBranding(true);
    try {
      let endpoint = '';
      
      if (userRole === 'master_admin') {
        endpoint = '/admin/default-branding';
      } else if (userRole === 'tenant_admin' && tenantId) {
        endpoint = `/admin/tenants/${tenantId}/branding`;
      } else if (userRole === 'org_admin' && organizationId) {
        endpoint = `/admin/organizations/${organizationId}/branding`;
      }

      if (endpoint) {
        const response = await apiCall(endpoint, { method: 'GET' });
        if (response.branding) {
          setBrandingData(response.branding);
          setLogoPreview(response.branding.logoUrl || '');
        }
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    } finally {
      setIsLoadingBranding(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }

    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (!profileData.currentPassword) {
        toast.error('Current password is required to set a new password');
        return;
      }
      if (profileData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
    }

    setIsSaving(true);
    try {
      await apiCall('/admin/update-profile', {
        method: 'POST',
        body: {
          name: profileData.name,
          email: profileData.email,
          currentPassword: profileData.currentPassword || undefined,
          newPassword: profileData.newPassword || undefined,
        },
      });

      toast.success('Profile updated successfully');
      
      // Clear password fields
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      if (onProfileUpdate) {
        onProfileUpdate({ name: profileData.name, email: profileData.email });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      let endpoint = '';
      
      if (userRole === 'master_admin') {
        endpoint = '/admin/default-branding';
      } else if (userRole === 'tenant_admin' && tenantId) {
        endpoint = `/admin/tenants/${tenantId}/branding`;
      } else if (userRole === 'org_admin' && organizationId) {
        endpoint = `/admin/organizations/${organizationId}/branding`;
      }

      if (endpoint) {
        await apiCall(endpoint, {
          method: 'POST',
          body: brandingData,
        });

        toast.success('Branding updated successfully');
        
        if (userRole === 'master_admin') {
          toast.info('New tenants and organizations will use these defaults');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setBrandingData({ ...brandingData, logoUrl: url });
    setLogoPreview(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', userRole);
      if (tenantId) formData.append('tenantId', tenantId);
      if (organizationId) formData.append('organizationId', organizationId);

      // Upload to backend
      const response = await fetch(`https://${process.env.REACT_APP_SUPABASE_URL || window.location.hostname}/functions/v1/make-server-888f4514/admin/upload-logo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      
      if (data.url) {
        setBrandingData({ ...brandingData, logoUrl: data.url });
        setLogoPreview(data.url);
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo. You can enter a URL instead.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">{getProfileTitle()}</h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? 'Manage your profile, password, and branding settings' 
            : 'Manage your account settings and preferences'}
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={isAdmin ? "grid w-full grid-cols-3" : "grid w-full grid-cols-2"}>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile & Password
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
          )}
          <TabsTrigger value="debug">
            <Bug className="h-4 w-4 mr-2" />
            Auth Debug
          </TabsTrigger>
        </TabsList>

        {/* Profile & Password Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Personal Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="mt-2">
                      <Badge variant={userRole === 'master_admin' ? 'destructive' : 'outline'}>
                        {userRole === 'master_admin' ? 'Global Admin' : 
                         userRole === 'tenant_admin' ? 'Tenant Admin' : 
                         userRole === 'org_admin' ? 'Organization Admin' : 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Password Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Change Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Leave blank to keep current password
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>
                  {userRole === 'master_admin' 
                    ? 'Set default branding for new tenants and organizations' 
                    : 'Customize your organization\'s branding'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userRole === 'master_admin' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      These settings only apply to newly created tenants and organizations. 
                      Existing tenants and organizations will keep their current branding.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Logo Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Logo</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload an image or enter a URL. Images will be automatically resized.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logoFile">Upload Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logoFile"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploadingLogo}
                          className="cursor-pointer"
                        />
                        {isUploadingLogo && (
                          <div className="text-sm text-muted-foreground">Uploading...</div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, or SVG (max 5MB)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Or Enter Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={brandingData.logoUrl}
                        onChange={(e) => handleLogoUrlChange(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Direct link to image file
                      </p>
                    </div>
                  </div>

                  {logoPreview && (
                    <div className="space-y-2">
                      <Label>Logo Preview</Label>
                      <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-center h-32">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                          onError={() => {
                            toast.error('Failed to load logo preview');
                            setLogoPreview('');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Colors Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Brand Colors</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose your primary and secondary brand colors
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={brandingData.primaryColor}
                          onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          value={brandingData.primaryColor}
                          onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={brandingData.secondaryColor}
                          onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          value={brandingData.secondaryColor}
                          onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-16 flex-1 rounded-lg border shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: brandingData.primaryColor }}
                      >
                        <span className="text-xs font-medium text-white drop-shadow">Primary</span>
                      </div>
                      <div
                        className="h-16 flex-1 rounded-lg border shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: brandingData.secondaryColor }}
                      >
                        <span className="text-xs font-medium text-white drop-shadow">Secondary</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveBranding} disabled={isSaving || isLoadingBranding}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Branding'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Auth Debug Tab */}
        <TabsContent value="debug">
          <AuthTokenDebugger />
        </TabsContent>
      </Tabs>
    </div>
  );
}
