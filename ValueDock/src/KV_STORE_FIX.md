# KV Store Data Handling Fix

## Problem

When fetching users in the Admin Dashboard, the server threw an error:
```
TypeError: Cannot read properties of undefined (reading 'startsWith')
```

## Root Cause

The `kv.getByPrefix()` function was returning an array of items where some entries had missing or undefined `key` properties. When the code attempted to call `.startsWith()` on these undefined keys, it crashed.

This can happen when:
1. KV store has corrupted or incomplete entries
2. Different data structures are stored under similar prefixes
3. Concurrent writes create partial entries

## Solution

Added comprehensive null and type checks before accessing properties:

### Before (Unsafe):
```typescript
const allUsers = await kv.getByPrefix('user:');
const users = allUsers
  .filter(u => u.key.startsWith('user:') && !u.key.includes(':email:'))
  .map(u => u.value);
```

### After (Safe):
```typescript
const allUsers = await kv.getByPrefix('user:');
const users = allUsers
  .filter(u => {
    if (!u || !u.key || typeof u.key !== 'string') {
      console.warn('Invalid KV entry found:', u);
      return false;
    }
    return u.key.startsWith('user:') && !u.key.includes(':email:');
  })
  .map(u => u.value)
  .filter(v => {
    if (!v || typeof v !== 'object') {
      console.warn('Invalid user value found:', v);
      return false;
    }
    return true;
  });
```

## Changes Applied

Fixed the same pattern in multiple endpoints:

1. **`GET /admin/users`** - User listing with role-based filtering
2. **`GET /admin/tenants`** - Tenant listing  
3. **`GET /tenants/:identifier`** - Tenant lookup by domain
4. **`GET /whitelabel`** - White-label settings lookup

## Benefits

✅ **Crash Prevention** - No more undefined property errors
✅ **Data Validation** - Invalid entries are filtered out with warnings
✅ **Better Debugging** - Console logs show exactly which entries are problematic
✅ **Graceful Degradation** - Invalid data doesn't break the entire response

## Monitoring

The server now logs warnings when it encounters invalid data:
- `Invalid KV entry found: ...` - Entry missing required properties
- `Invalid user value found: ...` - User value is not a valid object

Check server logs for these messages to identify data quality issues.

## Prevention

To avoid similar issues in the future:

1. **Always validate KV results:**
   ```typescript
   const items = await kv.getByPrefix('prefix:');
   const valid = items.filter(item => item && item.key && item.value);
   ```

2. **Add error boundaries** around KV operations:
   ```typescript
   try {
     const data = await kv.get('key');
     if (!data || typeof data !== 'expected-type') {
       throw new Error('Invalid data structure');
     }
   } catch (error) {
     console.error('KV error:', error);
     return fallbackValue;
   }
   ```

3. **Validate data before storing:**
   ```typescript
   const userData = {
     id: user.id,
     email: user.email || '',
     name: user.name || 'Unknown',
     // ... ensure all required fields are present
   };
   await kv.set(`user:${user.id}`, userData);
   ```

## Testing

After this fix:
1. ✅ Admin dashboard loads without errors
2. ✅ User list displays correctly
3. ✅ Tenant list displays correctly
4. ✅ Invalid entries are filtered out gracefully
5. ✅ Server logs show any data quality issues