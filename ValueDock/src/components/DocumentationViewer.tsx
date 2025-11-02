import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Copy, FileText, Database, Shield, CheckCircle, Network, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DataDictionary } from './DataDictionary';
import { useIsMobile } from './ui/use-mobile';

interface Document {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content?: string;
  isComponent?: boolean;
}

// Embedded documentation content
const ARCHITECTURE_DOC = `# ValuDock Architecture Schema

## High-Level Architecture

ValueDock® is a multi-tenant SaaS application for ROI calculation and automation investment analysis, built on a three-tier architecture.

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Inputs  │  Impl.   │ Results  │ Timeline │ Scenarios│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │  Export  │       Admin Dashboard                      │  │
│  └──────────┴────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │ Authorization: Bearer Token
┌──────────────────────┴──────────────────────────────────────┐
│         Server (Supabase Edge Function - Hono)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes:                                              │  │
│  │  • /auth/* - Authentication & user profile            │  │
│  │  • /admin/* - Admin operations (RBAC protected)       │  │
│  │  • /init - System initialization                      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────┴────────┐          ┌─────────┴─────────┐
│  Supabase Auth │          │ Key-Value Store   │
│  - User mgmt   │          │  (PostgreSQL)     │
│  - Sessions    │          │  - User profiles  │
│  - Password    │          │  - Tenants        │
│  - OAuth ready │          │  - Organizations  │
└────────────────┘          │  - Calculations   │
                            └───────────────────┘
\`\`\`

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State**: React hooks (useState, useEffect)

### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Hono (web server)
- **Database**: PostgreSQL (via KV abstraction)
- **Auth**: Supabase Auth`;

const DOMAIN_MODEL_DOC = `# ValueDock® Domain Model & Entity Relationship Diagram

## Core Entities

### 1. User
**Storage Key**: \`user:{userId}\`

**Attributes**:
- id: UUID (Primary Key)
- email: Unique email address
- name: Display name
- role: master_admin | tenant_admin | org_admin | user
- tenantId: Foreign Key → Tenant
- organizationId: Optional Foreign Key → Organization
- active: Soft delete flag
- createdAt: ISO 8601 timestamp

**Role Types**:
- \`master_admin\` - Global Admin (system-wide access)
- \`tenant_admin\` - Tenant Admin (tenant-scoped access)
- \`org_admin\` - Organization Admin (org-scoped access)
- \`user\` - Regular user

### 2. Tenant
**Storage Key**: \`tenant:{tenantId}\`

**Attributes**:
- id: UUID (Primary Key)
- name: Company name
- domain: Unique subdomain identifier
- settings: White-label configuration
- active: Soft delete flag
- createdAt: ISO 8601 timestamp

**TenantSettings**:
- brandName: Custom application name
- primaryColor: Hex color code
- logoUrl: URL to custom logo
- faviconUrl: URL to custom favicon

### 3. Organization
**Storage Key**: \`org:{organizationId}\`

**Attributes**:
- id: UUID (Primary Key)
- name: Organization name
- tenantId: Foreign Key → Tenant (required)
- parentOrgId: Foreign Key → Organization (self-referential)
- settings: Extensible metadata
- createdAt: ISO 8601 timestamp

## Entity Relationships

\`\`\`
TENANT (1) ─── (N) ORGANIZATION
  │                    │
  │                    │
  └──── (N) USER ──────┘
         (optional org membership)
\`\`\`

## Key-Value Store Schema

All entities stored in: \`kv_store_888f4514\`

**Key Patterns**:
- Users: \`user:{userId}\`, \`user:email:{email}\`
- Tenants: \`tenant:{tenantId}\`, \`tenant:domain:{domain}\`
- Organizations: \`org:{organizationId}\``;

const PERMISSIONS_DOC = `# ValueDock® Permissions Matrix (RBAC)

## Role Definitions

| Role | Internal Name | Display Name | Scope |
|---|---|---|---|
| **Global Administrator** | \`master_admin\` | Global Admin | Entire system |
| **Tenant Administrator** | \`tenant_admin\` | Tenant Admin | Single tenant |
| **Organization Administrator** | \`org_admin\` | Org Admin | Single organization |
| **Regular User** | \`user\` | User | Tenant-scoped |

## Permission Matrix

### Legend
- ✅ Full Access
- 🔒 Scoped Access (within tenant/org)
- ❌ No Access
- ⚠️ Restricted (with limitations)

## 1. User Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| View all users | ✅ | 🔒 Tenant | 🔒 Org | ❌ |
| Create user | ✅ | 🔒 Tenant | 🔒 Org | ❌ |
| Update user | ✅ | 🔒 Tenant | 🔒 Org | ⚠️ Self |
| Change role | ✅ | ⚠️ No GA | ❌ | ❌ |
| Delete user | ✅ | 🔒 Tenant | 🔒 Org | ❌ |

**Notes**:
- Tenant Admin cannot assign \`master_admin\` role
- Users cannot delete themselves
- Org Admin can only manage users within their organization

## 2. Tenant Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| View all tenants | ✅ | ❌ | ❌ | ❌ |
| Create tenant | ✅ | ❌ | ❌ | ❌ |
| Update tenant | ✅ | 🔒 Own | ❌ | ❌ |
| Delete tenant | ✅ | ❌ | ❌ | ❌ |
| White-label | ✅ | 🔒 Own | ❌ | ❌ |

## 3. Organization Management

| Action | Global Admin | Tenant Admin | Org Admin | User |
|---|:---:|:---:|:---:|:---:|
| View all orgs | ✅ | 🔒 Tenant | ❌ | ❌ |
| Create org | ✅ | 🔒 Tenant | ❌ | ❌ |
| Update org | ✅ | 🔒 Tenant | 🔒 Own | ❌ |
| Delete org | ✅ | 🔒 Tenant | ❌ | ❌ |

## 4. ROI Calculator Features

All authenticated users have full access to calculator features:
- View and edit inputs
- Run calculations
- Create scenarios
- Export to PDF
- Share via link
- View timeline

## Role Hierarchy

\`\`\`
Global Admin (master_admin)
  │
  ├─ Tenant Admin (tenant_admin)
  │    │
  │    └─ Org Admin (org_admin)
  │         │
  │         └─ User (user)
\`\`\``;

const API_CONTRACTS_DOC = `# ValueDock® API Contracts

Base URL: \`https://{projectId}.supabase.co/functions/v1/make-server-888f4514\`

All endpoints require \`Authorization: Bearer {accessToken}\` header unless specified.

## Authentication Endpoints

### POST /init
**Description**: Initialize Global Admin account (idempotent)
**Authentication**: Public (anon key)

**Success Response (201)**:
\`\`\`json
{
  "success": true,
  "message": "Global admin created successfully",
  "credentials": {
    "email": "admin@dockeryai.com",
    "password": "admin123"
  }
}
\`\`\`

### POST /auth/signup
**Description**: Create new user account
**Required Roles**: master_admin, tenant_admin, org_admin

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "user",
  "tenantId": "tenant-uuid",
  "organizationId": "org-uuid"
}
\`\`\`

**Success Response (201)**:
\`\`\`json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "tenantId": "tenant-uuid"
  }
}
\`\`\`

### GET /auth/profile
**Description**: Get current user's profile
**Required Roles**: Any authenticated user

**Success Response (200)**:
\`\`\`json
{
  "profile": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "tenantId": "tenant-uuid"
  }
}
\`\`\`

## Admin Endpoints

### GET /admin/users
**Description**: List users (filtered by role)
**Required Roles**: master_admin, tenant_admin, org_admin

### POST /admin/tenants
**Description**: Create tenant
**Required Roles**: master_admin only

### GET /admin/organizations
**Description**: List organizations
**Required Roles**: master_admin, tenant_admin

### PUT /admin/users/:userId
**Description**: Update user
**Required Roles**: master_admin, tenant_admin, org_admin

### DELETE /admin/users/:userId
**Description**: Delete user
**Required Roles**: master_admin, tenant_admin`;

const VALIDATION_DOC = `# ValueDock® Validation Rules & Constraints

## User Entity Validation

### Email Address
**Type**: String
**Required**: Yes

**Rules**:
- Must match email regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
- Must be unique across entire system
- Maximum length: 255 characters
- Must be lowercase (auto-converted)

**Error Messages**:
- Empty: "Email is required"
- Invalid: "Please enter a valid email address"
- Duplicate: "User with this email already exists"

### Password
**Type**: String
**Required**: Yes (on creation)

**Rules**:
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain at least one letter

**Error Messages**:
- Empty: "Password is required"
- Too short: "Password must be at least 8 characters"

### Name
**Type**: String
**Required**: Yes

**Rules**:
- Minimum length: 1 character
- Maximum length: 100 characters
- Cannot be only whitespace

### Role
**Type**: Enum
**Required**: Yes

**Values**:
- master_admin (Global Admin)
- tenant_admin (Tenant Admin)
- org_admin (Organization Admin)
- user (Regular User)

**Rules**:
- Tenant admins cannot assign master_admin role
- Role must be valid enum value

## Tenant Entity Validation

### Name
**Required**: Yes
**Max Length**: 100 characters

### Domain
**Required**: Yes
**Format**: Lowercase alphanumeric, hyphens only
**Must be unique**: Yes

## Organization Entity Validation

### Name
**Required**: Yes
**Max Length**: 100 characters

### TenantId
**Required**: Yes
**Must exist**: Yes

## ROI Calculator Input Validation

### Hourly Wage
**Type**: Number (Currency)
**Min**: 0
**Max**: 1000
**Default**: 40

### Tasks per Month
**Type**: Number
**Min**: 1
**Max**: 100000
**Default**: 100

### Time per Task (minutes)
**Type**: Number
**Min**: 0.1
**Max**: 480 (8 hours)
**Default**: 15

### Automation Coverage (%)
**Type**: Number
**Min**: 0
**Max**: 100
**Default**: 80

### Software Cost ($/month)
**Type**: Number
**Min**: 0
**Max**: 1000000
**Default**: 500`;

export function DocumentationViewer() {
  const [selectedDoc, setSelectedDoc] = useState<string>('dictionary');
  const isMobile = useIsMobile();

  const documents: Document[] = [
    {
      id: 'dictionary',
      title: 'Data Dictionary',
      description: 'Complete reference for all input parameters and calculated outputs',
      icon: <BookOpen className="h-4 w-4" />,
      isComponent: true
    },
    {
      id: 'architecture',
      title: 'Architecture Schema',
      description: 'High-level system architecture, data flow, and component design',
      icon: <Network className="h-4 w-4" />,
      content: ARCHITECTURE_DOC
    },
    {
      id: 'domain-model',
      title: 'Domain Model & ERD',
      description: 'Entity definitions, relationships, and database schema',
      icon: <Database className="h-4 w-4" />,
      content: DOMAIN_MODEL_DOC
    },
    {
      id: 'permissions',
      title: 'Permissions Matrix (RBAC)',
      description: 'Role-based access control rules and permission mappings',
      icon: <Shield className="h-4 w-4" />,
      content: PERMISSIONS_DOC
    },
    {
      id: 'api-contracts',
      title: 'API Contracts',
      description: 'REST API endpoints, request/response formats, and error codes',
      icon: <FileText className="h-4 w-4" />,
      content: API_CONTRACTS_DOC
    },
    {
      id: 'validation',
      title: 'Validation Rules',
      description: 'Input validation rules, constraints, and error messages',
      icon: <CheckCircle className="h-4 w-4" />,
      content: VALIDATION_DOC
    }
  ];

  const currentDoc = documents.find(d => d.id === selectedDoc);

  const handleCopyToClipboard = async () => {
    if (currentDoc?.content) {
      try {
        await navigator.clipboard.writeText(currentDoc.content);
        toast.success(`${currentDoc.title} copied to clipboard`);
      } catch (error) {
        // Silently handle clipboard permission errors - user already gets toast message
        toast.error('Failed to copy - clipboard access denied');
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">System Documentation</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete reference including data dictionary, architecture documents, schemas, and technical specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDoc} onValueChange={setSelectedDoc}>
            <div className={isMobile ? "" : "overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"}>
              <TabsList className={isMobile ? "flex flex-col w-full gap-1" : "inline-flex md:grid w-auto md:w-full grid-cols-6 min-w-max md:min-w-0"}>
                {documents.map(doc => (
                  <div key={doc.id} className="doc-tooltip-wrapper">
                    <div className="doc-tooltip-content">
                      <div className="doc-tooltip-title">{doc.title}</div>
                      <div className="doc-tooltip-desc">{doc.description}</div>
                    </div>
                    <TabsTrigger 
                      value={doc.id} 
                      className="gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-4"
                    >
                      {doc.icon}
                      <span className="hidden sm:inline text-xs lg:text-sm">{doc.title.split(' ')[0]}</span>
                    </TabsTrigger>
                  </div>
                ))}
              </TabsList>
            </div>

            {documents.map(doc => (
              <TabsContent key={doc.id} value={doc.id} className="space-y-3 sm:space-y-4">
                {doc.isComponent ? (
                  <DataDictionary />
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg">{doc.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="self-start sm:self-auto flex-shrink-0"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Copy</span>
                      </Button>
                    </div>

                    <Card>
                      <ScrollArea className="h-[400px] sm:h-[600px] w-full">
                        <CardContent className="pt-4 sm:pt-6">
                          <pre className="whitespace-pre-wrap text-[10px] sm:text-xs font-mono leading-relaxed">
                            {doc.content}
                          </pre>
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
