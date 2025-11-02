# 💰 Cost Classification - Quick Guide

## What Is It?

Admins can now categorize each cost attribute as either **Hard Cost** (direct, measurable) or **Soft Cost** (indirect, opportunity) for their organization.

## Where To Find It

```
Admin Dashboard → Costs Tab
```

## Who Can Use It?

| Role | Access |
|------|--------|
| 🔴 Global Admin | ✅ All organizations |
| 🟡 Tenant Admin | ✅ Organizations in their tenant |
| 🟢 Org Admin | ✅ Their organization only |
| ⚪ Regular User | ❌ No access |

## Quick Reference: Default Classifications

### 💵 Hard Costs (8 items)
Direct expenses on P&L:
- Direct Labor Costs
- Overtime Premiums
- Software Licensing
- Infrastructure (cloud, servers)
- IT Support & Maintenance
- API Licensing
- Audit & Compliance
- SLA Penalties

### 📊 Soft Costs (8 items)
Efficiency & opportunity:
- Training & Onboarding
- Shadow Systems (Excel, etc)
- Turnover & Attrition
- Error Remediation
- Downtime
- Decision Delays
- Staff Capacity Drag
- Customer Impact

## How To Use

### Step 1: Navigate
1. Go to **Admin Dashboard**
2. Click **Costs** tab

### Step 2: Select Organization (if needed)
- **Org Admins**: Your org loads automatically
- **Global/Tenant Admins**: Select an org from Organizations tab first

### Step 3: Classify Costs
- Click **Hard** button → Marks as hard cost
- Click **Soft** button → Marks as soft cost
- Active button is highlighted

### Step 4: Save
- Click **Save Changes** when done
- Click **Reset** to discard unsaved changes

## Categories

Click tabs to filter:
- **All** - See all 16 attributes
- **Labor** - 5 workforce costs
- **IT** - 4 technology costs
- **Risk** - 3 compliance costs
- **Opportunity** - 4 efficiency costs

## Use Cases

### 💼 Conservative ROI (Hard Costs Only)
- For CFO approval
- Board presentations
- Budget justification
- GAAP/IFRS compliant

### 📈 Full Impact (Hard + Soft Costs)
- Internal stakeholder buy-in
- Efficiency metrics
- Productivity gains
- Change management

### 🏢 Industry Customization
- **Manufacturing**: More hard costs
- **Professional Services**: More soft costs
- **Healthcare**: Mix of both
- **Financial Services**: Compliance-heavy

## Visual Indicators

```
┌─────────────────────────────────────────┐
│  💵 Hard Costs: 8   📊 Soft Costs: 8   │ ← Summary
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Direct Labor Costs                      │
│ Direct wages and salaries               │
│                    [💵 Hard] [Soft]     │ ← Toggle buttons
└─────────────────────────────────────────┘
```

## API Endpoints

```typescript
// Load classification
GET /cost-classification/:organizationId

// Save classification
POST /cost-classification/:organizationId
{
  hardCosts: ["laborCosts", "softwareLicensing", ...],
  softCosts: ["trainingOnboardingCosts", ...]
}
```

## Tips

✅ **Do**:
- Start with defaults (industry-standard)
- Consult with CFO for your industry
- Document why you reclassified items
- Save frequently

❌ **Don't**:
- Mix accounting standards
- Reclassify without reasoning
- Forget to save changes
- Use for compliance without CFO approval

## Common Questions

**Q: Can I add custom cost attributes?**
A: Not yet - 16 standard attributes currently supported

**Q: Will this affect my ROI calculations?**
A: Not directly - this is for reporting/categorization only

**Q: Can regular users see the classification?**
A: No - this is admin-only feature for now

**Q: Is there an audit trail?**
A: Yes - lastModified and modifiedBy are tracked

**Q: Can different organizations have different classifications?**
A: Yes! Each organization has its own classification

---

**Need Help?** See full documentation in `COST_CLASSIFICATION_FEATURE.md`
