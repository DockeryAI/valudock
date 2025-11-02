# Domain Validation Fix - Manual Instructions

## Problem
The domain validation regex in several files has a bug that rejects valid domains like "testtenant.com".

## Root Cause
The regex pattern has `\\.` (double backslash + dot) instead of `\.` (single backslash + dot), which breaks the pattern matching.

## Solution Implemented
Created `/utils/domainValidation.ts` with the correct validation function.

## Files That Need Manual Fixing

Since the automated edit tool is experiencing issues with the regex pattern, please manually remove the local `isValidDomain` function from these files:

### 1. `/components/EnhancedUserDialogV2.tsx`
**Status:** Import added ✅ | Local function needs removal ❌

**Line ~179-182:** DELETE these lines:
```typescript
  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };
```

The import is already added at the top:
```typescript
import { isValidDomain } from '../utils/domainValidation';
```

### 2. `/components/AdminDashboard.tsx`
**Line ~136-141:** 

**Action needed:**
1. Add import at top of file (after existing imports):
   ```typescript
   import { isValidDomain } from '../utils/domainValidation';
   ```

2. DELETE these lines (~136-141):
   ```typescript
   const isValidDomain = (domain: string): boolean => {
     // Basic domain validation: alphanumeric, hyphens, dots
     // Must have at least one dot and valid TLD
     const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i;
     return domainRegex.test(domain);
   };
   ```

### 3. `/components/TenantOrgMobileView.tsx`
**Line ~95-98:**

**Action needed:**
1. Add import at top of file:
   ```typescript
   import { isValidDomain } from '../utils/domainValidation';
   ```

2. DELETE these lines (~95-98):
   ```typescript
   const isValidDomain = (domain: string): boolean => {
     const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i;
     return domainRegex.test(domain);
   };
   ```

### 4. `/components/EnhancedUserDialog.tsx` 
**Line ~185-188:**

**Action needed:**
1. Add import at top of file:
   ```typescript
   import { isValidDomain } from '../utils/domainValidation';
   ```

2. DELETE these lines (~185-188):
   ```typescript
   const isValidDomain = (domain: string): boolean => {
     const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i;
     return domainRegex.test(domain);
   };
   ```

## Testing After Fix

1. Go to Admin Dashboard
2. Try to create a new Tenant Admin user
3. Select "Create New Tenant" tab
4. Enter domain: `testtenant.com`
5. Should NOT show "invalid domain" error ✅

## Quick Manual Fix Steps

For each file listed above:

1. Open the file in your code editor
2. Find the `isValidDomain` function (use Ctrl+F / Cmd+F)
3. Select the entire function (all 4-5 lines)
4. Delete it
5. Add the import at the top if not already there
6. Save the file

## Why This Fix Works

The centralized `/utils/domainValidation.ts` file has the correct regex pattern:
```typescript
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
```

Notice: `?\.` (correct) instead of `?\\.` (broken)

This will properly match domains like:
- ✅ testtenant.com
- ✅ acme.com
- ✅ example-company.com
- ✅ test123.consulting
- ✅ my-site.co.uk

## Alternative: Quick Find & Replace

If you're comfortable with regex find/replace in your editor:

**Find:**
```
const isValidDomain = \(domain: string\): boolean => \{[\s\S]*?return domainRegex\.test\(domain\);[\s\S]*?\};
```

**Replace with:** (nothing - delete)

Then add the import manually.

## Status

- ✅ Created `/utils/domainValidation.ts` with correct regex
- ✅ Added import to `/components/EnhancedUserDialogV2.tsx`
- ⏳ Need to remove local functions from all 4 files
- ⏳ Need to add imports to 3 files (AdminDashboard, TenantOrgMobileView, EnhancedUserDialog)

Once completed, the domain validation will work correctly across the entire application.
