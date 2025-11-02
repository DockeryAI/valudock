# Backup & Restore Quick Reference 🚀

## Quick Actions

### Delete a Tenant or Organization
1. Click the trash icon next to the entity
2. Type `delete` in the confirmation box
3. Click "Delete" button
4. ✅ Automatic backup created (retained for 6 months)

### Delete Multiple Tenants or Organizations
1. Select each item individually with checkbox
2. Click "Delete X Selected" button
3. Type `delete multiple` in the confirmation box
4. Click "Delete" button
5. ✅ Individual backups created for each entity

### Clear All Data
1. Click menu (top right) → "Clear All Data"
2. Type `delete` in the confirmation box
3. Click "Delete all data" button
4. ✅ Full data backup created before clearing

### Restore Something You Deleted
1. Go to Admin Dashboard
2. Click "Restore Backups" button (top right)
3. Filter by entity type if needed
4. Find the backup you want to restore
5. Click "Restore" button
6. Confirm the restore action
7. ✅ Entity is restored with all original data

---

## Important Notes

### ⚠️ Safety Features

- **No "Select All"**: You must select each tenant/org individually to prevent accidental mass deletion
- **Type to Confirm**: You must type the exact confirmation text (`delete` or `delete multiple`)
- **Backup Notice**: Every delete operation shows that a backup will be created
- **6-Month Retention**: All backups are kept for 6 months before automatic deletion

### 🔐 Permissions

| You are a... | You can restore... |
|--------------|-------------------|
| **Global Admin** | Everything |
| **Tenant Admin** | Tenants, Organizations, and Users in your tenant |
| **Org Admin** | Users in your organization and your own data |

### 📅 Expiration Warnings

- Backups **expiring within 30 days** are highlighted in **orange**
- Expired backups are **automatically deleted** and cannot be restored
- Check the "Expires" column to see days remaining

---

## Common Scenarios

### "I accidentally deleted a tenant!"
✅ No problem! Go to Restore Backups → Tenants tab → Find the tenant → Click Restore

### "I need to restore a user from 2 months ago"
✅ Go to Restore Backups → Users tab → Find the user → Click Restore

### "I cleared all data by mistake!"
✅ Go to Restore Backups → Data tab → Find the most recent backup → Click Restore

### "I need to permanently delete a backup"
✅ Go to Restore Backups → Find the backup → Click the trash icon → Confirm deletion

---

## Tips & Tricks

### 💡 Best Practices

1. **Before Major Changes**: Create a manual snapshot (Save Snapshot in menu)
2. **Regular Reviews**: Check Restore Backups monthly to see what's expiring
3. **Document Deletions**: Note why you deleted something in case you need to restore
4. **Test Restores**: Occasionally test restore functionality to ensure it works

### ⚡ Keyboard Shortcuts

- Type and press **Enter** in confirmation dialogs to quickly confirm (if text is valid)
- **Esc** key closes dialogs without confirming

### 🔍 Finding Backups

- Use the **filter tabs** (All, Tenants, Organizations, Users, Data) to narrow results
- Check the **"Deleted" column** to see when something was deleted
- Check the **"Deleted By" column** to see who deleted it

---

## Contact Support

If you need help with backups or restores:

1. Check the **DELETION_SAFETY_BACKUP_SYSTEM.md** file for detailed documentation
2. Contact your system administrator
3. Check the browser console for error messages (F12 key)

---

## Summary

✅ **Every deletion creates a backup** (kept for 6 months)  
✅ **Easy to restore** (one click in Admin Dashboard)  
✅ **Safe confirmations** (type to confirm prevents accidents)  
✅ **Permission-based access** (you can only restore what you have access to)  
✅ **Automatic cleanup** (expired backups are removed automatically)  

**Your data is protected!** 🛡️
