# ValueDock® Architecture Schema

## High-Level Architecture

ValueDock® is a multi-tenant SaaS application for ROI calculation and automation investment analysis, built on a three-tier architecture.

```
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
```

## Data Flow

### Authentication Flow
1. **User Login** → Frontend sends credentials to Supabase Auth (via SDK)
2. **Auth Success** → Returns access token + session
3. **Profile Fetch** → Frontend calls `/auth/profile` with token
4. **Authorization** → All subsequent requests include Bearer token

### Computation Architecture
- **Client-Side**: All ROI calculations, scenario modeling, timeline generation
- **Server-Side**: User management, tenant management, data persistence
- **No External APIs**: Self-contained calculation engine

### Data Storage
- **Supabase Auth**: User credentials, sessions, email confirmations
- **KV Store (PostgreSQL)**: 
  - User profiles with RBAC roles
  - Tenant configurations & white-label settings
  - Organization hierarchies
  - All data stored with prefixed keys (e.g., `user:`, `tenant:`, `org:`)

## Key Components

### Frontend Pages
1. **Inputs** - Process configuration, volume, wages, task types
2. **Implementation** - Phase planning, resource allocation
3. **Results** - ROI metrics, cost savings, payback period
4. **Timeline** - Gantt chart, implementation schedule
5. **Scenarios** - What-if analysis, sensitivity testing
6. **Export** - PDF generation, shareable links
7. **Admin** - Multi-tenant management (role-based access)

### Security Model
- **Authentication**: Supabase Auth (password-based, OAuth-ready)
- **Authorization**: Role-Based Access Control (RBAC)
- **Session Management**: JWT tokens via Supabase
- **Tenant Isolation**: All data scoped by tenantId
- **Transport Security**: HTTPS only

### Multi-Tenancy
- **Tenant**: Top-level organization (created by Global Admin)
- **Organization**: Sub-unit within a tenant
- **User Scoping**: All users belong to one tenant + optional org
- **Data Isolation**: Backend enforces tenant boundaries

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State**: React hooks (useState, useEffect)
- **Routing**: Client-side tab navigation

### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Hono (web server)
- **Database**: PostgreSQL (via KV abstraction)
- **Auth**: Supabase Auth
- **Deployment**: Supabase Edge Network

### Development
- **Build**: Figma Make (hot reload)
- **Version Control**: Git-ready structure
- **Environment**: Supabase project ID + keys

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│         Supabase Cloud Platform          │
│  ┌────────────────────────────────────┐  │
│  │  Edge Function (Global CDN)        │  │
│  │  - Hono server (index.tsx)         │  │
│  │  - KV store interface              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  PostgreSQL Database               │  │
│  │  - kv_store_888f4514 table         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Supabase Auth Service             │  │
│  │  - User authentication             │  │
│  │  - Session management              │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌──────────────────────────────────────────┐
│   Frontend (Static Hosting/CDN)         │
│   - React SPA                            │
│   - Client-side routing                  │
└──────────────────────────────────────────┘
```

## Performance Considerations

1. **Client-Side Computation**: Keeps server load minimal
2. **KV Store**: O(1) lookups for user/tenant data
3. **Session Caching**: Reduces auth overhead
4. **Edge Functions**: Low-latency global distribution
5. **No Heavy Queries**: Simple key-based retrieval only

## Scalability

- **Horizontal**: Supabase Edge Functions auto-scale
- **Vertical**: Calculations run in-browser (no server bottleneck)
- **Multi-Tenant**: Isolated by design, infinite tenant capacity
- **Storage**: KV store can handle millions of keys

## Future Extensibility

- **External APIs**: Ready for integration (API contracts defined)
- **OAuth Providers**: Supabase Auth supports Google, GitHub, etc.
- **Webhooks**: Can add event triggers
- **Analytics**: Ready for telemetry integration
- **Internationalization**: Structure supports i18n
