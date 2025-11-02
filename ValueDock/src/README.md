# ValueDock® - Enterprise ROI Calculator

A comprehensive, multi-tenant ROI Calculator web application with sophisticated financial modeling, role-based access control, and white-label customization capabilities.

![ValueDock](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue)

## 🎯 Overview

ValueDock® is a professional-grade ROI calculator designed for enterprises to model, analyze, and present complex business cases with precision. Built with CFO-focused calculations and multi-tenant architecture, it enables organizations to:

- **Model Complex ROI Scenarios** with 7 main calculation screens
- **Multi-Tenant Architecture** with organization-scoped data isolation
- **Role-Based Permissions** (Master Admin, Tenant Admin, Org Admin, User)
- **Advanced Financial Modeling** including NPV, IRR, payback periods, and sensitivity analysis
- **Mobile-Optimized** with full touch interface support
- **White-Label Ready** for enterprise customization

## ✨ Key Features

### 📊 Seven Main Calculation Screens

1. **Inputs Screen** - Process configuration with drag-and-drop reordering
2. **Implementation Screen** - Timeline and deployment planning
3. **Results Screen** - Comprehensive financial outputs with interactive charts
4. **Presentation Screen** - Executive-ready ROI breakdown with waterfall charts + AI-powered features
5. **Scenario Screen** - What-if analysis and sensitivity testing
6. **Timeline Screen** - Visual project roadmap
7. **Export Screen** - Multi-format export (PDF, CSV, Excel)

### 🤖 AI-Powered Presentation Builder

- **Fathom Meeting Integration** - Automatic webhook-based meeting data ingestion
- **Meeting History Generator** - AI creates executive summaries from customer meetings
- **Challenge Extraction** - Automatically identifies business challenges from transcripts
- **Goal Extraction** - Pulls business objectives from meeting conversations
- **Gamma.ai Integration** - One-click presentation generation
- **Business Description AI** - Auto-generates company overviews from websites

### 🔐 Sophisticated Access Control

- **Master Admin** - Full system access across all tenants
- **Tenant Admin** - Manage organizations and users within tenant
- **Organization Admin** - Manage users within organization
- **User** - Access organization's ROI calculators

### 🏢 Multi-Tenant Architecture

- Complete data isolation per organization
- Separate processes, groups, and calculations per org
- Two-level navigation (Tenant → Organization)
- Each organization operates as independent instance

### 💰 CFO-Grade Financial Calculations

- Net Present Value (NPV) with custom discount rates
- Internal Rate of Return (IRR)
- Payback period calculations
- Cost classification (Hard vs Soft costs)
- Overhead cost allocation
- Seasonal demand modeling
- SLA compliance impacts
- FTE savings analysis
- Cash flow projections

### 📱 Mobile Optimized

- Card-based mobile layouts
- Touch-friendly process reordering
- Scrollable metric screens
- No horizontal scroll issues
- Responsive across all breakpoints

## 🚀 Getting Started

### Quick Start (10 Minutes)

**New to ValuDock? Start here:** 📖 **[DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md)**

This guide walks you through:
- ✅ Installing prerequisites
- ✅ Downloading the project
- ✅ Setting up Supabase
- ✅ Running the app locally
- ✅ First login

### Prerequisites

- **Node.js 18+** (Download: https://nodejs.org/)
- **npm 9+** (Comes with Node.js)
- **Git** (Download: https://git-scm.com/)
- **Supabase Account** (Sign up: https://supabase.com/)

### Installation

**1. Download the project**
```bash
git clone <your-repository-url>
cd valuedock
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# Get credentials from: https://app.supabase.com/project/_/settings/api
```

**4. Deploy edge function**
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Deploy
supabase functions deploy server
```

**5. Start development server**
```bash
npm run dev
```

**6. Open in browser**
```
http://localhost:5173
```

**7. Login with default credentials**
- Email: `admin@dockery.ai`
- Password: `admin123`

### Detailed Setup Guides

- 📘 **[LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)** - Complete local development guide
- 📋 **[DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md)** - Step-by-step setup checklist
- 🔧 **[LOCAL_DEV_QUICK_REFERENCE.md](./LOCAL_DEV_QUICK_REFERENCE.md)** - Daily development commands
- ⚡ **[DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md)** - Quick start guide

## 📖 Documentation

### 🚀 Getting Started

- **[Login Credentials](./LOGIN_CREDENTIALS.md)** ⭐ **Start here for login issues**
- **[First Time Setup](./FIRST_TIME_SETUP.md)** - Initial configuration guide
- **[Quick Start Guide](./QUICK_START.md)** - Get up and running quickly
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### 🔐 Authentication

- **[Auth Troubleshooting](./AUTH_TROUBLESHOOTING_GUIDE.md)** - Fix login errors
- **[Login Credentials](./LOGIN_CREDENTIALS.md)** - Default test accounts
- **[Auth Setup](./AUTH_SETUP.md)** - Authentication configuration

### 📚 Technical Documentation

- **[Architecture](./docs/architecture-schema.md)** - System design and data flow
- **[API Contracts](./docs/api-contracts.md)** - Backend API documentation
- **[Permissions Matrix](./docs/permissions-matrix.md)** - Role-based access control
- **[Domain Model](./docs/domain-model.md)** - Data structures and relationships

### 📋 Feature Documentation

- [Admin Panel Guide](./GLOBAL_ADMIN_DOCUMENTATION.md)
- [Cost Classification](./COST_CLASSIFICATION_FEATURE.md)
- [Group-Based Filtering](./GROUP_BASED_FILTERING_IMPLEMENTATION.md)
- [Context Switcher](./CONTEXT_SWITCHER_IMPLEMENTATION.md)
- [NPV Time Horizon](./NPV_TIME_HORIZON_FEATURE.md)
- [Mobile Optimization](./COMPREHENSIVE_FIXES_APPLIED.md)

### 🤖 AI & Integration Documentation

- **[Fathom Webhook Quick Start](./FATHOM_WEBHOOK_QUICK_START.md)** ⭐ **3-minute setup**
- **[Fathom Webhook Implementation](./FATHOM_WEBHOOK_IMPLEMENTATION.md)** - Complete technical guide
- **[Domain Filtering Guarantee](./DOMAIN_FILTERING_GUARANTEE.md)** 🔒 **Privacy & Data Isolation**
- **[Domain Filtering Visual Guide](./DOMAIN_FILTERING_VISUAL_GUIDE.md)** 🎨 **How filtering works**
- [OpenAI Integration](./OPENAI_INTEGRATION_GUIDE.md) - AI-powered features
- [Gamma.ai Integration](./GAMMA_INTEGRATION_GUIDE.md) - Presentation generation
- [AI Features Quick Start](./AI_FEATURES_QUICK_START.md) - Using AI capabilities

## 🏗️ Project Structure

```
valuedock/
├── App.tsx                          # Main application component
├── components/                      # React components
│   ├── AdminDashboard.tsx          # Admin control panel
│   ├── InputsScreen.tsx            # Process input configuration
│   ├── ResultsScreen.tsx           # Financial results display
│   ├── PresentationScreen.tsx      # Executive presentation view
│   ├── UserManagementTree.tsx      # User hierarchy management
│   ├── ui/                         # Shadcn UI components
│   └── utils/                      # Shared utilities
├── supabase/                       # Backend functions
│   └── functions/
│       └── server/                 # Edge function server
│           ├── index.tsx           # API routes
│           └── kv_store.tsx        # Key-value storage
├── utils/                          # Utility functions
│   ├── auth.ts                     # Authentication logic
│   ├── domainValidation.ts         # Input validation
│   └── supabase/                   # Supabase client config
└── styles/
    └── globals.css                 # Global styles and tokens
```

## 🔧 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Backend**: Supabase (Edge Functions + PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage + KV Store

## 🧪 Testing

### Quick Admin Creation

```bash
# Follow the guide to create your first admin user
# See QUICK_ADMIN_CREATION_GUIDE.md
```

### Test Scenarios

Comprehensive test scenarios are documented in `TEST_SCENARIOS.md`:

- Master Admin workflows
- Tenant Admin permissions
- Organization Admin capabilities
- User access restrictions
- Data isolation verification

## 🔒 Security

- **Role-Based Access Control** (RBAC) at all levels
- **Data Isolation** per organization
- **Environment Variables** for sensitive credentials
- **Service Role Key** never exposed to frontend
- **Secure Authentication** via Supabase Auth
- **Input Validation** on all user inputs

## 📊 Data Persistence

ValueDock® uses multiple storage strategies:

1. **localStorage** - Client-side draft auto-save
2. **Supabase KV Store** - Server-side data persistence
3. **Organization-Scoped** - All calculations stored per organization

## 🎨 Customization

### White-Label Configuration

Customize branding in `styles/globals.css`:

```css
:root {
  --primary: #your-brand-color;
  --secondary: #your-secondary-color;
  /* Additional theme tokens */
}
```

### Cost Classifications

Configure custom cost categories in the Admin Panel → Cost Classification Manager.

## 📈 Roadmap

- [ ] AI-powered insights integration
- [ ] Builder.io visual editor integration
- [ ] Advanced export templates
- [ ] Multi-currency support
- [ ] API webhooks
- [ ] Audit logging

## 🤝 Contributing

This is a proprietary application. For contribution guidelines, please contact the development team.

## 📝 License

Proprietary - All rights reserved

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Issues**: Check existing `.md` guides for known issues and fixes

## 📧 Contact

For enterprise licensing and support inquiries, please contact the ValueDock® team.

---

**Built with ❤️ for CFOs and Finance Teams**

Last Updated: January 2025
Version: 1.0.0 (Production Ready)
