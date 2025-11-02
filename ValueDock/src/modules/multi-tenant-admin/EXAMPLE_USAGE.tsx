/**
 * Multi-Tenant Admin Module - Usage Examples
 * 
 * This file shows various ways to integrate the module into your app
 */

import React, { useEffect, useState } from 'react';
import {
  MultiTenantAdminPanel,
  initializeAuth,
  useMultiTenant,
  usePermissions,
  useAuth,
  type UserProfile,
} from './modules/multi-tenant-admin';

// ============================================================
// EXAMPLE 1: Complete Admin Panel (Simplest Integration)
// ============================================================

export function Example1_CompleteAdminPanel() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Initialize module once on app startup
  useEffect(() => {
    initializeAuth({
      projectId: 'your-supabase-project-id',
      apiEndpoint: '/make-server-888f4514',
      enableBackups: true,
      enableGroupManagement: true,
    });
  }, []);

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  // That's it! Full admin panel in one component
  return <MultiTenantAdminPanel currentUser={currentUser} />;
}

// ============================================================
// EXAMPLE 2: Custom Admin Layout
// ============================================================

import {
  UserManagement,
  TenantManagement,
  OrganizationManagement,
  ContextSwitcher,
} from './modules/multi-tenant-admin';

export function Example2_CustomLayout() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your custom header */}
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <h1>My Custom Admin Portal</h1>
          <ContextSwitcher currentUser={currentUser} />
        </div>
      </header>

      {/* Your custom navigation */}
      <nav className="bg-white border-b">
        <button onClick={() => setSelectedTab('users')}>Users</button>
        <button onClick={() => setSelectedTab('tenants')}>Tenants</button>
        <button onClick={() => setSelectedTab('orgs')}>Organizations</button>
      </nav>

      {/* Module components */}
      <main className="p-6">
        {selectedTab === 'users' && (
          <UserManagement currentUser={currentUser} />
        )}
        {selectedTab === 'tenants' && (
          <TenantManagement currentUser={currentUser} />
        )}
        {selectedTab === 'orgs' && (
          <OrganizationManagement currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Custom UI with Module Hooks
// ============================================================

export function Example3_CustomUIWithHooks() {
  const { currentUser } = useAuth();
  const { users, tenants, organizations, loading, createUser, deleteUser } = useMultiTenant();
  const permissions = usePermissions(currentUser);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Custom User List</h1>
      
      {/* Build your own UI using the data */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {permissions.canManageUsers && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              {permissions.canManageUsers && (
                <td>
                  <button onClick={() => deleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Your custom create user form */}
      {permissions.canManageUsers && (
        <button onClick={() => {/* Your logic */}}>
          Add User
        </button>
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 4: Embed in Existing Admin Dashboard
// ============================================================

import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export function Example4_EmbedInExistingAdmin() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  return (
    <div className="admin-dashboard">
      {/* Your existing admin sections */}
      <YourExistingDashboard />
      <YourAnalytics />
      
      {/* Add multi-tenant management as a new tab */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <YourOverview />
        </TabsContent>
        
        <TabsContent value="settings">
          <YourSettings />
        </TabsContent>
        
        <TabsContent value="users">
          {/* Module admin panel */}
          <MultiTenantAdminPanel currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// EXAMPLE 5: Protected Admin Route
// ============================================================

export function Example5_ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const permissions = usePermissions(currentUser);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login
    return <Navigate to="/login" />;
  }

  if (!permissions.canManageUsers) {
    // Show access denied
    return (
      <div className="p-8 text-center">
        <h1>Access Denied</h1>
        <p>You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return <MultiTenantAdminPanel currentUser={currentUser} />;
}

// ============================================================
// EXAMPLE 6: Multi-Tenant SaaS Setup
// ============================================================

export function Example6_MultiTenantSaaS() {
  const { currentUser } = useAuth();
  const permissions = usePermissions(currentUser);

  return (
    <div className="saas-app">
      <header>
        <h1>My SaaS Platform</h1>
        {permissions.canSwitchContext && (
          <ContextSwitcher currentUser={currentUser} />
        )}
      </header>

      <main>
        {/* Show different UI based on role */}
        {currentUser?.role === 'master_admin' && (
          <GlobalAdminDashboard />
        )}
        
        {currentUser?.role === 'tenant_admin' && (
          <TenantAdminDashboard />
        )}
        
        {currentUser?.role === 'org_admin' && (
          <OrgAdminDashboard />
        )}
        
        {currentUser?.role === 'user' && (
          <RegularUserDashboard />
        )}
      </main>
    </div>
  );
}

function GlobalAdminDashboard() {
  return (
    <div>
      <h2>Global Admin Dashboard</h2>
      <MultiTenantAdminPanel currentUser={currentUser} />
    </div>
  );
}

function TenantAdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <h2>Tenant Admin Dashboard</h2>
      <p>Managing tenant: {currentUser?.tenantId}</p>
      <UserManagement currentUser={currentUser} />
      <OrganizationManagement currentUser={currentUser} />
    </div>
  );
}

// ============================================================
// EXAMPLE 7: Custom Validation
// ============================================================

export function Example7_CustomValidation() {
  useEffect(() => {
    initializeAuth({
      projectId: 'your-project-id',
      apiEndpoint: '/api',
      customValidation: {
        // Only allow company emails
        email: (email) => {
          return email.endsWith('@yourcompany.com');
        },
        // Block certain domains
        domain: (domain) => {
          const blockedDomains = ['spam.com', 'test.com'];
          return !blockedDomains.includes(domain);
        },
      },
    });
  }, []);

  return <MultiTenantAdminPanel currentUser={currentUser} />;
}

// ============================================================
// EXAMPLE 8: Data Fetching Pattern
// ============================================================

export function Example8_DataFetching() {
  const { users, tenants, organizations, loading, error, refresh } = useMultiTenant();

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div>Total Users: {users.length}</div>
      <div>Total Tenants: {tenants.length}</div>
      <div>Total Organizations: {organizations.length}</div>
      
      <button onClick={() => refresh()}>Refresh Data</button>
    </div>
  );
}

// ============================================================
// EXAMPLE 9: Permission-Based UI
// ============================================================

export function Example9_PermissionBasedUI() {
  const { currentUser } = useAuth();
  const permissions = usePermissions(currentUser);

  return (
    <div>
      {permissions.canManageTenants && (
        <section>
          <h2>Tenant Management</h2>
          <TenantManagement currentUser={currentUser} />
        </section>
      )}

      {permissions.canManageOrganizations && (
        <section>
          <h2>Organization Management</h2>
          <OrganizationManagement currentUser={currentUser} />
        </section>
      )}

      {permissions.canManageUsers && (
        <section>
          <h2>User Management</h2>
          <UserManagement currentUser={currentUser} />
        </section>
      )}

      {!permissions.canManageUsers && (
        <div>You don't have admin permissions</div>
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 10: Full App Integration
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export function Example10_FullApp() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Initialize module
    initializeAuth({
      projectId: 'your-project-id',
      apiEndpoint: '/api',
    });

    // Check for existing session
    getSession().then(({ profile }) => {
      setCurrentUser(profile);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={
            currentUser ? (
              <MultiTenantAdminPanel currentUser={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Your app routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================================
// Helper Components (You Would Build These)
// ============================================================

function YourExistingDashboard() {
  return <div>Your Existing Dashboard</div>;
}

function YourAnalytics() {
  return <div>Your Analytics</div>;
}

function YourOverview() {
  return <div>Your Overview</div>;
}

function YourSettings() {
  return <div>Your Settings</div>;
}

function RegularUserDashboard() {
  return <div>Regular User Dashboard</div>;
}

function OrgAdminDashboard() {
  return <div>Org Admin Dashboard</div>;
}

function LoadingSpinner() {
  return <div>Loading...</div>;
}

function ErrorMessage({ message }: { message: string }) {
  return <div>Error: {message}</div>;
}

function LoginPage() {
  return <div>Login Page</div>;
}

function HomePage() {
  return <div>Home Page</div>;
}

function Dashboard() {
  return <div>Dashboard</div>;
}
