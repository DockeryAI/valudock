# Deletion Safety & Backup System 🛡️

## Overview

ValueDock® now includes a comprehensive deletion safety system with automatic backups and restore capabilities. This system protects against accidental data loss while allowing administrators to recover deleted entities for up to 6 months.

---

## Features

### 🔒 Safety Confirmations

All critical delete operations now require explicit confirmation:

1. **Single Entity Deletion**
   - Type `delete` to confirm
   - Clear warning about consequences
   - Individual selection only (no "Select All" for tenants/orgs)

2. **Multiple Entity Deletion**
   - Type `delete multiple` to confirm
   - Additional warnings for bulk operations
   - Must select each item individually

3. **Clear All Data**
   - Type `delete` to confirm
   - Shows count of processes and groups being deleted
   - Creates backup before clearing

### 💾 Automatic Backups

Every deletion automatically creates a backup:

- **Tenants**: Full tenant data with settings
- **Organizations**: Complete org configuration  
- **Users**: User profile and permissions
- **Data**: All ROI calculator data (processes, groups, settings)

### 🔄 Restore Capabilities

Administrators can restore deleted entities from the **Restore Backups** dialog:

- **Access**: Available in Admin Dashboard header
- **Permissions**:
  - **Global Admins**: Can restore any backup
  - **Tenant Admins**: Can restore tenants, orgs, users from their tenant
  - **Org Admins**: Can restore users and data from their organization

- **Features**:
  - Filter by type (Tenants, Organizations, Users, Data)
  - View deletion date and deleted by user
  - See expiration countdown (6 months)
  - One-click restore
  - Permanent delete option

---

## User Interface Components

### DeleteConfirmationDialog

**Location**: `/components/DeleteConfirmationDialog.tsx`

**Props**:
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  entityType: 'tenant' | 'tenants' | 'organization' | 'organizations' | 'user' | 'users' | 'data';
  entityName?: string;
  count?: number;
  additionalWarning?: string;
}
```

**Features**:
- Dynamic confirmation text based on entity count
- Color-coded warnings
- Backup notification
- Automatic form validation

### RestoreBackupDialog

**Location**: `/components/RestoreBackupDialog.tsx`

**Features**:
- Tabbed interface by entity type
- Sortable table with full backup details
- Expiration warnings (highlighted if < 30 days)
- Preview backup details
- Restore confirmation
- Permanent delete with confirmation

---

## Backend Implementation

### Backup Storage

**Storage**: KV Store with prefix `backup:`

**Structure**:
```typescript
{
  id: string;                    // Unique backup ID
  type: 'tenant' | 'organization' | 'user' | 'data';
  entityId: string | null;       // Original entity ID
  entityName: string;            // Display name
  data: any;                     // Complete entity data
  deletedAt: string;             // ISO timestamp
  deletedBy: string;             // User email/ID
  expiresAt: string;             // ISO timestamp (6 months)
}
```

### API Endpoints

#### List Backups
```
GET /admin/backups/list
Authorization: Bearer {token}
```

**Response**:
```json
{
  "backups": [...]
}
```

**Permission Filtering**:
- Global admins see all backups
- Tenant admins see backups from their tenant
- Org admins see backups from their organization

#### Restore Backup
```
POST /admin/backups/restore
Authorization: Bearer {token}
Body: { backupId: string }
```

**Response**:
```json
{
  "success": true,
  "message": "tenant restored successfully",
  "restoredEntity": "Acme Corporation"
}
```

#### Delete Backup
```
DELETE /admin/backups/{backupId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true
}
```

### Updated Delete Endpoints

All delete endpoints now create backups before deletion:

- `DELETE /admin/tenants/{tenantId}`
- `DELETE /admin/organizations/{organizationId}`
- `DELETE /admin/users/{userId}`
- `DELETE /data/clear`

---

## Security & Permissions

### Permission Matrix

| Role | List Backups | Restore Tenant | Restore Org | Restore User | Restore Data |
|------|--------------|----------------|-------------|--------------|--------------|
| Global Admin | All | ✅ | ✅ | ✅ | ✅ |
| Tenant Admin | Own Tenant | ✅ | ✅ (own) | ✅ (own) | ✅ (own) |
| Org Admin | Own Org | ❌ | ❌ | ✅ (own) | ✅ (own) |
| User | ❌ | ❌ | ❌ | ❌ | ❌ |

### Audit Trail

Every backup includes:
- **deletedBy**: Who initiated the deletion
- **deletedAt**: When the deletion occurred
- **restoredBy**: Who restored the entity (if restored)
- **restoredAt**: When it was restored (if restored)

---

## Workflow Examples

### Example 1: Deleting a Single Tenant

1. Admin clicks delete button on tenant row
2. DeleteConfirmationDialog appears:
   - Shows tenant name
   - Lists consequences (orgs and users will be deleted)
   - Shows backup notice
3. Admin types `delete` to confirm
4. System:
   - Creates backup with 6-month expiration
   - Deletes tenant from database
   - Shows success message: "Tenant deleted and backed up successfully"

### Example 2: Deleting Multiple Organizations

1. Admin selects 3 organizations individually
2. Admin clicks "Delete Selected" button
3. DeleteConfirmationDialog appears:
   - Shows count: "3 organizations"
   - Requires typing `delete multiple`
   - Enhanced warnings for bulk operation
4. Admin types `delete multiple` to confirm
5. System:
   - Creates 3 separate backups
   - Deletes all 3 organizations
   - Shows success: "3 organizations deleted and backed up successfully"

### Example 3: Restoring a Deleted User

1. Admin clicks "Restore Backups" in dashboard header
2. RestoreBackupDialog opens
3. Admin switches to "Users" tab
4. Admin sees list of deleted users with:
   - Name and email
   - Deletion date
   - Days until expiration
5. Admin clicks "Restore" button
6. Confirmation prompt appears
7. System:
   - Recreates user in KV store
   - Preserves original permissions
   - Shows success message
   - Refreshes admin dashboard

### Example 4: Clearing All Data

1. User clicks "Clear All Data" in menu
2. DeleteConfirmationDialog appears:
   - Shows type: "all data"
   - Additional warning with process/group counts
   - Backup notice
3. User types `delete` to confirm
4. System:
   - Creates backup of all current data
   - Clears localStorage
   - Resets to default data
   - Shows: "All data cleared and backed up successfully"

---

## Automatic Cleanup

### Expiration Policy

- **Retention Period**: 6 months from deletion date
- **Cleanup**: Automatic during backup listing
- **Warning**: Items expiring within 30 days are highlighted in orange

### Implementation

When listing backups, the system:
1. Checks expiration date
2. Removes expired backups
3. Returns only valid backups

---

## Design Changes

### Removed Features

**"Select All" Checkboxes**: Removed from tenants and organizations tables to prevent accidental bulk deletion. Users must:
- Select each tenant/org individually
- Face increased confirmation requirements for multiple selections

**Retained "Select All"**: Users table still has "Select All" as user deletion is less critical and more common in bulk operations.

### UI Improvements

1. **Color-Coded Warnings**:
   - Red for destructive actions
   - Blue for informational (backup notices)
   - Orange for expiration warnings

2. **Contextual Help**:
   - Clear consequence lists
   - Backup retention information
   - Expiration countdowns

3. **Smart Validation**:
   - Real-time confirmation text validation
   - Disabled confirm buttons until valid
   - Clear error messages

---

## Testing Scenarios

### Scenario 1: Tenant Deletion & Restore
1. Create a tenant "Test Corp"
2. Delete the tenant (type `delete`)
3. Verify backup appears in Restore Backups dialog
4. Restore the tenant
5. Verify tenant is back with all settings

### Scenario 2: Multiple Organization Deletion
1. Create 3 organizations
2. Select all 3 individually
3. Click "Delete Selected"
4. Verify prompt requires `delete multiple`
5. Verify 3 backups created
6. Restore one organization
7. Verify only that organization is restored

### Scenario 3: Data Clear & Restore
1. Create custom processes and groups
2. Clear all data (type `delete`)
3. Verify data is reset to defaults
4. Open Restore Backups dialog
5. Find and restore the data backup
6. Verify all custom data is restored

### Scenario 4: Permission Testing
1. As Tenant Admin:
   - Verify can see own tenant backups only
   - Verify cannot see other tenant backups
2. As Org Admin:
   - Verify can only see user/data backups
   - Verify cannot restore tenants/orgs

### Scenario 5: Expiration Testing
1. Create a backup
2. Manually adjust expiresAt to 25 days from now
3. Verify backup shows orange warning
4. Manually adjust expiresAt to past date
5. Verify backup is auto-removed from list

---

## Migration Notes

### For Existing Deployments

No migration required. The system:
- Creates backups going forward
- Works with existing data structure
- Doesn't affect existing entities

### For Development

1. **Backend**: Already updated in `/supabase/functions/server/index.tsx`
2. **Frontend**: Components added to `/components/`
3. **Integration**: AdminDashboard and App.tsx updated

---

## Future Enhancements

### Potential Additions

1. **Scheduled Backups**: Automatic daily/weekly backups
2. **Export Backups**: Download backups as JSON files
3. **Backup Notes**: Add notes when creating manual backups
4. **Restore Preview**: Show what will be restored before confirming
5. **Partial Restore**: Restore specific parts of an entity
6. **Backup Compression**: Reduce storage for large backups
7. **Email Notifications**: Alert admins when backups expire soon

---

## Troubleshooting

### Backup Not Created
- **Check**: User has admin permissions
- **Check**: Network connectivity to backend
- **Check**: Console for error messages
- **Solution**: Verify apiCall is working

### Cannot Restore Backup
- **Check**: Backup hasn't expired
- **Check**: User has permission to restore that entity type
- **Check**: Entity ID doesn't already exist
- **Solution**: Check backend logs for specific error

### Backup List Empty
- **Check**: Filters are not too restrictive
- **Check**: User has permission to view backups
- **Check**: Backups haven't all expired
- **Solution**: Try "All" filter, check date ranges

### "Delete Multiple" Not Working
- **Check**: Typed exactly `delete multiple` (lowercase)
- **Check**: More than one entity is selected
- **Solution**: Type the confirmation text precisely

---

## Summary

The Deletion Safety & Backup System provides enterprise-grade data protection for ValueDock®:

✅ **Prevents Accidental Deletion**: Explicit confirmations required  
✅ **Automatic Backups**: Every deletion is backed up  
✅ **Easy Recovery**: One-click restore from UI  
✅ **Role-Based Access**: Proper permission controls  
✅ **Audit Trail**: Full deletion/restore history  
✅ **Smart Cleanup**: Automatic expiration after 6 months  

This system ensures administrators can confidently manage their ValueDock® instance without fear of permanent data loss.
