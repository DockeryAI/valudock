# 💰 Cost Classification Feature

## Overview

Administrators can now categorize process cost attributes as **Hard Costs** vs **Soft Costs** for each organization. This provides financial clarity and helps CFOs understand the direct vs indirect ROI impact.

## Feature Access

### Who Can Access:
- ✅ **Global Admin (master_admin)** - Can manage cost classification for ANY organization
- ✅ **Tenant Admin (tenant_admin)** - Can manage cost classification for organizations within their tenant
- ✅ **Organization Admin (org_admin)** - Can manage cost classification for their own organization only
- ❌ **Regular Users** - Cannot access this feature

## Navigation

**Admin Dashboard → Costs Tab**

- The "Costs" tab appears in the admin dashboard navigation
- Organization admins will automatically see their organization's classification
- Global/Tenant admins must first select an organization from the Organizations tab

## Cost Categories

### 💵 Hard Costs (Direct, Measurable)
Tangible expenses that appear on financial statements:
- Direct Labor Costs
- Software Licensing
- Infrastructure (servers, cloud)
- IT Support & Maintenance
- API Licensing
- Audit & Compliance
- Overtime Premiums
- SLA Penalties

### 📊 Soft Costs (Indirect, Opportunity)
Efficiency gains and opportunity costs:
- Training & Onboarding
- Shadow Systems (Excel, Access)
- Turnover & Attrition
- Error Remediation
- Downtime
- Decision Delays
- Staff Capacity Drag
- Customer Impact

## Cost Attributes

The system tracks 16 different cost attributes across 4 categories:

### 1️⃣ Labor & Workforce (5 attributes)
- Direct Labor Costs
- Training & Onboarding
- Overtime Premiums
- Shadow Systems
- Turnover & Attrition

### 2️⃣ IT & Operations (4 attributes)
- Software Licensing
- Infrastructure
- IT Support & Maintenance
- API Licensing

### 3️⃣ Compliance & Risk (3 attributes)
- Error Remediation
- Audit & Compliance
- Downtime

### 4️⃣ Opportunity Costs (4 attributes)
- Decision Delays
- Staff Capacity Drag
- Customer Impact
- SLA Penalties

## User Interface

### Layout
- **Summary Cards**: Shows count of hard vs soft costs at the top
- **Tabbed View**: Filter by category (All, Labor, IT, Risk, Opportunity)
- **Quick Toggle**: Click buttons to reclassify each attribute
- **Save Changes**: Only enabled when changes are made

### Actions
1. **View**: See current classification with visual indicators
2. **Reclassify**: Click "Hard" or "Soft" button to toggle classification
3. **Save**: Click "Save Changes" to persist to database
4. **Reset**: Discard unsaved changes and reload from server

### Visual Indicators
- Blue badge with 💵 = Hard Cost
- Green badge with 📊 = Soft Cost
- Count displays at top of screen
- Hover descriptions for each attribute

## Technical Implementation

### Frontend Component
**File**: `/components/CostClassificationManager.tsx`

**Key Features**:
- Organization-scoped classification
- Default values based on industry standards
- Real-time toggle between Hard/Soft
- Unsaved changes tracking
- Responsive design with tabs

### Backend API

**Endpoints**:

#### GET `/cost-classification/:organizationId`
```typescript
// Returns cost classification for an organization
{
  success: true,
  classification: {
    organizationId: string,
    hardCosts: string[],
    softCosts: string[],
    lastModified: string,
    modifiedBy: string,
    modifiedByName: string
  }
}
```

#### POST `/cost-classification/:organizationId`
```typescript
// Saves cost classification for an organization
Request Body: {
  hardCosts: string[],
  softCosts: string[]
}

Response: {
  success: true,
  classification: { ... },
  message: 'Cost classification saved successfully'
}
```

### Data Storage

**Key Format**: `cost-class:${organizationId}`

**Data Structure**:
```typescript
{
  organizationId: string,
  hardCosts: string[],      // Array of cost attribute keys
  softCosts: string[],      // Array of cost attribute keys
  lastModified: string,     // ISO timestamp
  modifiedBy: string,       // User ID
  modifiedByName: string    // User name/email
}
```

### Permissions Logic

```typescript
// Master Admin - Full access
if (role === 'master_admin') {
  // Can manage ANY organization
}

// Tenant Admin - Tenant-scoped access
if (role === 'tenant_admin') {
  // Can manage organizations within their tenant
  if (org.tenantId === user.tenantId) {
    // Access granted
  }
}

// Organization Admin - Org-scoped access
if (role === 'org_admin') {
  // Can only manage their own organization
  if (user.organizationId === organizationId) {
    // Access granted
  }
}
```

## Default Classifications

The system uses industry-standard defaults:

### Default Hard Costs:
- `laborCosts`
- `overtimePremiums`
- `softwareLicensing`
- `infrastructureCosts`
- `itSupportMaintenance`
- `apiLicensing`
- `auditComplianceCosts`
- `slaPenalties`

### Default Soft Costs:
- `trainingOnboardingCosts`
- `shadowSystemsCosts`
- `turnoverCosts`
- `errorRemediationCosts`
- `downtimeCosts`
- `decisionDelays`
- `staffCapacityDrag`
- `customerImpactCosts`

## Use Cases

### 1. CFO Reporting
CFOs can now clearly separate:
- **Hard Cost Savings**: Direct budget reduction (software, labor, infrastructure)
- **Soft Cost Savings**: Productivity gains, efficiency improvements

### 2. Multi-Tenant Customization
Different industries have different standards:
- **Manufacturing**: More hard costs (equipment, labor)
- **Professional Services**: More soft costs (efficiency, utilization)
- Tenant admins can customize for each client organization

### 3. ROI Presentations
- Clear separation in executive presentations
- Conservative estimates (hard costs only)
- Full impact (hard + soft costs)

### 4. Financial Planning
- Budget planning using hard costs
- Efficiency targets using soft costs
- Compliance with accounting standards

## Benefits

### For CFOs:
✅ Clear separation of direct vs indirect savings
✅ Aligns with GAAP/IFRS accounting standards
✅ Conservative vs optimistic ROI scenarios
✅ Board-ready financial presentations

### For Admins:
✅ Organization-specific customization
✅ Easy bulk reclassification
✅ Audit trail (who modified, when)
✅ Default values from industry standards

### For Organizations:
✅ Industry-appropriate classifications
✅ Flexible to business needs
✅ Supports multiple financial reporting methods
✅ Enables better decision-making

## Future Enhancements

Potential additions:
- [ ] Industry templates (Healthcare, Finance, Manufacturing, etc.)
- [ ] Bulk import/export of classifications
- [ ] Historical classification changes (audit log)
- [ ] Custom cost categories beyond Hard/Soft
- [ ] Cost classification reports in Results screen
- [ ] Export classification to PDF/Excel

## Testing

### Test Scenario 1: Organization Admin
1. Log in as org admin
2. Navigate to Admin Dashboard → Costs tab
3. Should see their organization's classification automatically
4. Toggle a few attributes between Hard/Soft
5. Click Save Changes
6. Reload page - changes should persist

### Test Scenario 2: Tenant Admin
1. Log in as tenant admin
2. Navigate to Admin Dashboard → Organizations tab
3. Click on an organization to select it
4. Navigate to Costs tab
5. Should see that organization's classification
6. Make changes and save
7. Switch to different organization - should see different classification

### Test Scenario 3: Global Admin
1. Log in as global admin
2. Can access Costs for any organization
3. Changes apply to specific organization only
4. Other organizations remain unchanged

### Test Scenario 4: Regular User
1. Log in as regular user
2. Costs tab should NOT appear in Admin Dashboard
3. No access to cost classification feature

## Database Schema

```typescript
// Key: cost-class:${organizationId}
{
  organizationId: "org_123",
  hardCosts: [
    "laborCosts",
    "softwareLicensing",
    "infrastructureCosts",
    // ...
  ],
  softCosts: [
    "trainingOnboardingCosts",
    "shadowSystemsCosts",
    // ...
  ],
  lastModified: "2025-01-11T12:00:00.000Z",
  modifiedBy: "user_456",
  modifiedByName: "John Smith"
}
```

## Security

- ✅ Organization-scoped permissions enforced
- ✅ Only admins can modify classifications
- ✅ Regular users cannot access feature
- ✅ Tenant isolation maintained
- ✅ Audit trail captured (who, when)

---

**Status**: ✅ **FEATURE COMPLETE & DEPLOYED**

*Implemented: January 2025*
