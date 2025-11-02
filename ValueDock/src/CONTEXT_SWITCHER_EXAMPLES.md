# Context Switcher - Visual Examples & Use Cases

## Visual Hierarchy

```
🌐 Global Admin View
│
├── 🏢 Tenant: Acme Reseller
│   ├── 🏢 Organization: Acme Corp
│   ├── 🏢 Organization: Beta Industries  
│   └── 🏢 Organization: Gamma LLC
│
├── 🏢 Tenant: XYZ Partners
│   ├── 🏢 Organization: XYZ Manufacturing
│   └── 🏢 Organization: XYZ Retail
│
└── 🏢 Tenant: CloudCorp MSP
    ├── 🏢 Organization: Client A
    ├── 🏢 Organization: Client B
    └── 🏢 Organization: Client C
```

## Example Scenarios

### Scenario 1: MSP Managing Multiple Clients

**Context**: CloudCorp MSP is a managed service provider with 50 client organizations

**User**: Sarah (Global Admin at CloudCorp)

**Workflow**:
1. Sarah logs in → Sees "Welcome, Global Admin"
2. Opens context switcher → Sees all 3 tenants
3. Selects "CloudCorp MSP" tenant
4. Dropdown now shows 50 organizations under CloudCorp MSP
5. Selects "Client A"
6. Header updates to "Viewing: Client A"
7. Admin dashboard now shows only Client A's data
8. Sarah can now:
   - Review Client A's ROI calculations
   - Manage Client A's users
   - Edit Client A's settings
9. When done, Sarah can switch to "Client B" or back to "All Organizations"

**Key Benefit**: Sarah can quickly switch between clients without logging out/in

---

### Scenario 2: Consulting Firm with Departments

**Context**: Acme Reseller is a consulting firm that sells ValueDock® to their clients

**User**: John (Tenant Admin at Acme Reseller)

**Workflow**:
1. John logs in → Sees "Welcome Acme Reseller admin"
2. Opens context switcher → Sees 3 organizations in his tenant:
   - Acme Corp (manufacturing division)
   - Beta Industries (logistics client)
   - Gamma LLC (finance client)
3. John selects "Beta Industries"
4. Header updates to "Viewing: Beta Industries"
5. John can now:
   - View Beta's ROI metrics
   - Add users to Beta's organization
   - Update Beta's configuration
6. Switches to "All Organizations" to see cross-org analytics

**Key Benefit**: John manages multiple client orgs without accessing other tenants

---

### Scenario 3: Single Organization Admin

**Context**: Emily is an admin at Beta Industries only

**User**: Emily (Organization Admin at Beta Industries)

**Display**:
```
┌─────────────────────────────────┐
│  🏢  Beta Industries            │
│      Acme Reseller              │
└─────────────────────────────────┘
```

**Workflow**:
1. Emily logs in → Sees "Welcome Beta Industries admin"
2. Context switcher shows a **read-only badge** (not clickable)
3. Display shows:
   - Organization: Beta Industries
   - Tenant: Acme Reseller
4. Emily can manage users within Beta Industries only
5. Emily cannot switch to other organizations

**Key Benefit**: Clear visibility of context, but no switching ability

---

## UI States

### State 1: Global Admin - All Tenants Selected

**Header Display**:
```
┌──────────────────────────────────────────┐
│ 🌐  All Tenants                          │
│     Global View                          │
└──────────────────────────────────────────┘
```

**Dropdown Content**:
```
┌─────────────────────────────────────────────┐
│ Search tenants and organizations...        │
├─────────────────────────────────────────────┤
│ Global View                                 │
│ ✓ 🌐 All Tenants                           │
│                                             │
│ ─────────────────────────────────          │
│                                             │
│ Tenants                                     │
│   🏢 Acme Reseller (3 organizations)       │
│   🏢 XYZ Partners (2 organizations)        │
│   🏢 CloudCorp MSP (50 organizations)      │
└─────────────────────────────────────────────┘
```

---

### State 2: Global Admin - Tenant Selected

**Header Display**:
```
┌──────────────────────────────────────────┐
│ 🏢  CloudCorp MSP                        │
│     All Organizations                    │
└──────────────────────────────────────────┘
```

**Dropdown Content**:
```
┌─────────────────────────────────────────────┐
│ Search tenants and organizations...        │
├─────────────────────────────────────────────┤
│ Global View                                 │
│   🌐 All Tenants                           │
│                                             │
│ ─────────────────────────────────────      │
│                                             │
│ Tenants                                     │
│ ✓ 🏢 CloudCorp MSP (50 organizations)      │
│   🏢 Acme Reseller (3 organizations)       │
│   🏢 XYZ Partners (2 organizations)        │
│                                             │
│ ─────────────────────────────────────      │
│                                             │
│ Organizations in Selected Tenant            │
│   👥 All Organizations                      │
│   🏢 Client A                               │
│   🏢 Client B                               │
│   🏢 Client C                               │
│   ... (47 more)                             │
│                                             │
│ ─────────────────────────────────────      │
│                                             │
│ 🏢 CloudCorp MSP                           │
└─────────────────────────────────────────────┘
```

---

### State 3: Global Admin - Organization Selected

**Header Display**:
```
┌──────────────────────────────────────────┐
│ 🏢  Client A                             │
│     CloudCorp MSP                        │
└──────────────────────────────────────────┘
```

**Dropdown Content**:
```
┌─────────────────────────────────────────────┐
│ Search tenants and organizations...        │
├─────────────────────────────────────────────┤
│ Organizations in Selected Tenant            │
│   👥 All Organizations                      │
│ ✓ 🏢 Client A                               │
│   🏢 Client B                               │
│   🏢 Client C                               │
│   ... (47 more)                             │
│                                             │
│ ─────────────────────────────────────      │
│                                             │
│ 🏢 CloudCorp MSP  🏢 Client A              │
└─────────────────────────────────────────────┘
```

---

### State 4: Tenant Admin - Viewing All Organizations

**Header Display**:
```
┌──────────────────────────────────────────┐
│ 🏢  Acme Reseller                        │
│     All Organizations                    │
└──────────────────────────────────────────┘
```

**Dropdown Content**:
```
┌─────────────────────────────────────────────┐
│ Search organizations...                     │
├─────────────────────────────────────────────┤
│ Organizations                               │
│   👥 All Organizations                      │
│   🏢 Acme Corp                              │
│   🏢 Beta Industries                        │
│   🏢 Gamma LLC                              │
│                                             │
│ ─────────────────────────────────────      │
│                                             │
│ 🏢 Acme Reseller                           │
└─────────────────────────────────────────────┘
```

**Note**: Tenant Admin does NOT see:
- "All Tenants" option
- Other tenants
- Organizations from other tenants

---

### State 5: Organization Admin - Read-Only

**Header Display**:
```
┌──────────────────────────────────────────┐
│ 🏢  Beta Industries                      │
│     Acme Reseller                        │
└──────────────────────────────────────────┘
```

**Not Clickable** - This is a static display badge, not a dropdown

---

## Search Examples

### Example 1: Search "acme"

**Results**:
```
Tenants:
  🏢 Acme Reseller (3 organizations)

Organizations:
  🏢 Acme Corp
```

### Example 2: Search "client"

**Results** (Global Admin viewing all):
```
Organizations:
  🏢 Client A (CloudCorp MSP)
  🏢 Client B (CloudCorp MSP)
  🏢 Client C (CloudCorp MSP)
```

### Example 3: Search "manufacturing"

**Results**:
```
Organizations:
  🏢 XYZ Manufacturing (XYZ Partners)
  🏢 Acme Manufacturing (Acme Reseller)
```

---

## Mobile vs Desktop

### Desktop View (Header)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] ValueDock®              [Context Switcher]      [Menu]  │
│         Welcome, Global Admin   (Dropdown Button)        ☰      │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (Menu)

```
Click Menu (☰) →

┌─────────────────────────────────┐
│ [Context Switcher - Full Width] │
│                                 │
│ ─────────────────────────────  │
│                                 │
│ Save Snapshot                   │
│ Restore Snapshot                │
│ ─────────────────────────────  │
│ Clear All Data                  │
│ ─────────────────────────────  │
│ Admin                           │
│ Profile                         │
│ ─────────────────────────────  │
│ Documentation                   │
│ Logout                          │
└─────────────────────────────────┘
```

---

## Real-World Use Cases

### Use Case 1: Emergency Support
**Scenario**: A client organization is experiencing data issues.

**Action**:
1. Global admin receives support ticket
2. Opens ValueDock®
3. Uses context switcher to navigate to client's organization
4. Reviews their data, identifies issue
5. Fixes configuration
6. Switches back to global view

**Time Saved**: ~5 minutes per support ticket (no need to contact client for credentials)

---

### Use Case 2: Quarterly Reviews
**Scenario**: Tenant admin needs to review ROI metrics across all client organizations.

**Action**:
1. Tenant admin logs in
2. Selects "All Organizations" in context switcher
3. Admin dashboard shows aggregated data from all orgs
4. Switches to each organization individually for detailed review
5. Exports reports for each client

**Time Saved**: ~30 minutes per quarter (streamlined navigation)

---

### Use Case 3: Onboarding New Client
**Scenario**: MSP signs a new client and needs to set them up.

**Action**:
1. Global admin creates new organization via Admin Dashboard
2. Uses context switcher to navigate to new organization
3. Configures organization settings
4. Creates organization admin user
5. Sets up initial processes
6. Switches back to global view

**Time Saved**: Single interface for entire workflow

---

### Use Case 4: Multi-Tenant Reporting
**Scenario**: Global admin needs to compare metrics across all tenants.

**Action**:
1. Selects "All Tenants" in context switcher
2. Views aggregate dashboard
3. Switches to "Tenant A" to drill down
4. Compares with "Tenant B"
5. Makes strategic decisions based on cross-tenant insights

**Value**: Business intelligence across entire platform

---

## Best Practices

### For Global Admins
✅ **DO**: Use "All Tenants" for system-wide oversight
✅ **DO**: Switch to specific tenant when troubleshooting
✅ **DO**: Use search to quickly find organizations
✅ **DO**: Bookmark frequently accessed contexts (future feature)

❌ **DON'T**: Make changes while in "All Tenants" view without confirming context
❌ **DON'T**: Leave context switcher open while navigating

### For Tenant Admins
✅ **DO**: Use "All Organizations" for cross-org analytics
✅ **DO**: Switch to specific org when managing users
✅ **DO**: Regularly review all organizations in your tenant

❌ **DON'T**: Assume you're in correct org - always check header

### For Organization Admins
✅ **DO**: Be aware of your tenant and organization
✅ **DO**: Request tenant admin access if you manage multiple orgs

❌ **DON'T**: Attempt to access other organizations (system prevents this)

---

## Troubleshooting

### Issue: Context Switcher Not Showing
**Cause**: User is not `master_admin` or `tenant_admin`
**Solution**: Role must be updated by a higher-level admin

### Issue: Organizations Missing from Dropdown
**Cause**: Organizations might belong to a different tenant
**Solution**: Verify tenant selection first

### Issue: Selection Not Persisting
**Cause**: LocalStorage might be disabled
**Solution**: Enable cookies/localStorage in browser settings

### Issue: Wrong Organization Showing
**Cause**: Stale context from previous session
**Solution**: Use context switcher to explicitly select correct org

---

## Metrics & Analytics (Future)

### Suggested Tracking
- Most viewed organizations
- Context switch frequency
- Time spent per organization
- Search query patterns
- Popular tenant/org combinations

### Insights
- Which clients need most attention
- Peak usage times per organization
- Support patterns across tenants

---

This context switcher transforms ValueDock® into a true multi-tenant platform with seamless navigation, clear visual hierarchy, and role-based access control. It empowers admins to efficiently manage complex organizational structures while maintaining security and clarity.
