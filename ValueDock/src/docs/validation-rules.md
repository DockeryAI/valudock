# ValueDock® Validation Rules & Constraints

## Overview

This document defines all input validation rules, data constraints, and error handling for ValueDock®. All validations are performed both client-side (for UX) and server-side (for security).

---

## 1. User Entity Validation

### Email Address

**Field**: `email`  
**Type**: String  
**Required**: Yes

**Rules**:
```
- Must match email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Must be unique across entire system
- Maximum length: 255 characters
- Must be lowercase (auto-converted)
- Cannot contain whitespace
```

**Error Messages**:
```
- Empty: "Email is required"
- Invalid format: "Please enter a valid email address"
- Duplicate: "User with this email already exists"
- Too long: "Email must be less than 255 characters"
```

**Example Validation**:
```typescript
function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (email.length > 255) return "Email must be less than 255 characters";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  
  return null; // Valid
}
```

---

### Password

**Field**: `password`  
**Type**: String  
**Required**: Yes (on creation)

**Rules**:
```
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain at least one letter
- Must contain at least one number (recommended)
- Cannot be empty or whitespace-only
```

**Error Messages**:
```
- Empty: "Password is required"
- Too short: "Password must be at least 8 characters"
- Too long: "Password must be less than 128 characters"
- Weak: "Password should contain letters and numbers"
```

**Example Validation**:
```typescript
function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be less than 128 characters";
  
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  
  return null; // Valid
}
```

---

### Name

**Field**: `name`  
**Type**: String  
**Required**: Yes

**Rules**:
```
- Minimum length: 1 character
- Maximum length: 100 characters
- Cannot be only whitespace
- Allows letters, spaces, hyphens, apostrophes
```

**Error Messages**:
```
- Empty: "Name is required"
- Too long: "Name must be less than 100 characters"
- Invalid: "Name contains invalid characters"
```

---

### Role

**Field**: `role`  
**Type**: Enum  
**Required**: Yes

**Allowed Values**:
```typescript
type UserRole = 'master_admin' | 'tenant_admin' | 'org_admin' | 'user';
```

**Rules**:
```
- Must be one of: master_admin, tenant_admin, org_admin, user
- Default: 'user'
- Tenant admins cannot assign 'master_admin' role
- Users cannot change their own role
```

**Error Messages**:
```
- Invalid: "Invalid role. Must be one of: master_admin, tenant_admin, org_admin, user"
- Unauthorized: "Only Global Admin can assign Global Admin role"
- Self-modification: "Cannot change your own role"
```

---

### Tenant ID

**Field**: `tenantId`  
**Type**: UUID String  
**Required**: Yes

**Rules**:
```
- Must be valid UUID format
- Tenant must exist in database
- Cannot be changed after user creation
- All users must belong to a tenant
```

**Error Messages**:
```
- Empty: "Tenant ID is required"
- Invalid format: "Invalid tenant ID format"
- Not found: "Tenant does not exist"
```

---

### Organization ID

**Field**: `organizationId`  
**Type**: UUID String or null  
**Required**: No

**Rules**:
```
- Must be valid UUID format (if provided)
- Organization must exist in database
- Organization must belong to same tenant as user
- Can be null (tenant-wide users)
```

**Error Messages**:
```
- Invalid format: "Invalid organization ID format"
- Not found: "Organization does not exist"
- Tenant mismatch: "Organization must be in the same tenant"
```

---

## 2. Tenant Entity Validation

### Tenant Name

**Field**: `name`  
**Type**: String  
**Required**: Yes

**Rules**:
```
- Minimum length: 1 character
- Maximum length: 100 characters
- Cannot be only whitespace
```

**Error Messages**:
```
- Empty: "Tenant name is required"
- Too long: "Tenant name must be less than 100 characters"
```

---

### Domain

**Field**: `domain`  
**Type**: String  
**Required**: Yes

**Rules**:
```
- Must be unique across entire system
- Must be URL-safe: lowercase letters, numbers, hyphens only
- Minimum length: 3 characters
- Maximum length: 50 characters
- Cannot start or end with hyphen
- No consecutive hyphens
```

**Regex**: `^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$`

**Error Messages**:
```
- Empty: "Domain is required"
- Too short: "Domain must be at least 3 characters"
- Too long: "Domain must be less than 50 characters"
- Invalid format: "Domain must contain only lowercase letters, numbers, and hyphens"
- Duplicate: "Tenant with this domain already exists"
```

**Example Validation**:
```typescript
function validateDomain(domain: string): string | null {
  if (!domain) return "Domain is required";
  if (domain.length < 3) return "Domain must be at least 3 characters";
  if (domain.length > 50) return "Domain must be less than 50 characters";
  
  const domainRegex = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/;
  if (!domainRegex.test(domain)) {
    return "Domain must contain only lowercase letters, numbers, and hyphens";
  }
  
  return null; // Valid
}
```

---

### White-Label Settings

#### Brand Name

**Field**: `settings.brandName`  
**Type**: String  
**Required**: No

**Rules**:
```
- Maximum length: 50 characters
- Can be empty (uses default "ValueDock®")
```

---

#### Primary Color

**Field**: `settings.primaryColor`  
**Type**: Hex Color String  
**Required**: No

**Rules**:
```
- Must be valid hex color: #RRGGBB
- Must start with #
- Must be exactly 7 characters (#RRGGBB)
- Can be empty (uses default #0ea5e9)
```

**Regex**: `^#[0-9A-Fa-f]{6}$`

**Error Messages**:
```
- Invalid: "Primary color must be a valid hex code (e.g., #0ea5e9)"
```

**Example Validation**:
```typescript
function validateHexColor(color: string): string | null {
  if (!color) return null; // Optional field
  
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(color)) {
    return "Primary color must be a valid hex code (e.g., #0ea5e9)";
  }
  
  return null; // Valid
}
```

---

#### Logo URL & Favicon URL

**Field**: `settings.logoUrl`, `settings.faviconUrl`  
**Type**: URL String  
**Required**: No

**Rules**:
```
- Must be valid URL (if provided)
- Must use HTTPS protocol
- Maximum length: 500 characters
```

**Error Messages**:
```
- Invalid: "Logo URL must be a valid HTTPS URL"
```

---

## 3. Organization Entity Validation

### Organization Name

**Field**: `name`  
**Type**: String  
**Required**: Yes

**Rules**:
```
- Minimum length: 1 character
- Maximum length: 100 characters
- Cannot be only whitespace
```

**Error Messages**:
```
- Empty: "Organization name is required"
- Too long: "Organization name must be less than 100 characters"
```

---

### Parent Organization ID

**Field**: `parentOrgId`  
**Type**: UUID String or null  
**Required**: No

**Rules**:
```
- Must be valid UUID format (if provided)
- Parent organization must exist
- Parent must be in same tenant
- Cannot create circular references (A → B → A)
- Cannot set self as parent
```

**Error Messages**:
```
- Invalid format: "Invalid parent organization ID"
- Not found: "Parent organization does not exist"
- Tenant mismatch: "Parent organization must be in the same tenant"
- Circular: "Cannot create circular organization hierarchy"
- Self-reference: "Organization cannot be its own parent"
```

---

## 4. ROI Calculator Input Validation

### Hourly Wage

**Field**: `input_hourly_wage`  
**Type**: Number (Currency)  
**Required**: Yes

**Rules**:
```
- Must be positive number > 0
- Maximum value: 10,000
- Maximum 2 decimal places
- Cannot be negative or zero
```

**Error Messages**:
```
- Invalid: "Hourly wage must be a positive number"
- Zero: "Hourly wage must be greater than 0"
- Too large: "Hourly wage must be less than $10,000"
```

---

### Tasks per Month

**Field**: `input_tasks_per_month`  
**Type**: Number (Integer)  
**Required**: Yes

**Rules**:
```
- Must be positive integer > 0
- Maximum value: 1,000,000
- No decimal places allowed
```

**Error Messages**:
```
- Invalid: "Tasks per month must be a positive number"
- Zero: "Tasks per month must be greater than 0"
- Decimal: "Tasks per month must be a whole number"
```

---

### Time per Task

**Field**: `input_time_per_task`  
**Type**: Number (Minutes)  
**Required**: Yes

**Rules**:
```
- Must be positive number > 0
- Maximum value: 1,440 (24 hours)
- Maximum 2 decimal places
```

**Error Messages**:
```
- Invalid: "Time per task must be a positive number"
- Zero: "Time per task must be greater than 0"
- Too large: "Time per task cannot exceed 24 hours (1,440 minutes)"
```

---

### Automation Coverage

**Field**: `input_automation_coverage`  
**Type**: Number (Percentage)  
**Required**: Yes

**Rules**:
```
- Must be between 0 and 100 (inclusive)
- Maximum 2 decimal places
- Cannot be negative
```

**Error Messages**:
```
- Out of range: "Automation coverage must be between 0% and 100%"
- Negative: "Automation coverage cannot be negative"
```

**Example Validation**:
```typescript
function validatePercentage(value: number): string | null {
  if (value < 0) return "Percentage cannot be negative";
  if (value > 100) return "Percentage cannot exceed 100%";
  return null; // Valid
}
```

---

### Software Cost

**Field**: `input_software_cost`  
**Type**: Number (Currency per month)  
**Required**: Yes

**Rules**:
```
- Must be non-negative (can be 0 for free software)
- Maximum value: 1,000,000
- Maximum 2 decimal places
```

**Error Messages**:
```
- Negative: "Software cost cannot be negative"
- Too large: "Software cost must be less than $1,000,000"
```

---

### Task Type

**Field**: `input_task_type`  
**Type**: Enum  
**Required**: Yes

**Allowed Values**:
```typescript
type TaskType = 'batch' | 'real-time';
```

**Default**: `'real-time'`

**Error Messages**:
```
- Invalid: "Task type must be either 'batch' or 'real-time'"
```

---

### Time of Day

**Field**: `input_time_of_day`  
**Type**: Enum  
**Required**: Yes

**Allowed Values**:
```typescript
type TimeOfDay = 'business-hours' | 'off-hours' | 'any';
```

**Default**: `'business-hours'`

---

### Peak Season Multiplier

**Field**: `input_peak_multiplier`  
**Type**: Number (Multiplier)  
**Required**: Only if `input_seasonal_enabled` is true

**Rules**:
```
- Must be >= 1.0
- Maximum value: 10.0
- Maximum 2 decimal places
```

**Error Messages**:
```
- Too low: "Peak multiplier must be at least 1.0"
- Too high: "Peak multiplier cannot exceed 10.0"
```

---

## 5. Cross-Field Validation

### User Organization Must Match Tenant

```typescript
async function validateUserOrganization(userId: string, organizationId: string): Promise<string | null> {
  const user = await kv.get(`user:${userId}`);
  const org = await kv.get(`org:${organizationId}`);
  
  if (user.tenantId !== org.tenantId) {
    return "Organization must belong to the same tenant as the user";
  }
  
  return null; // Valid
}
```

---

### Cannot Delete Yourself

```typescript
function validateUserDeletion(currentUserId: string, targetUserId: string): string | null {
  if (currentUserId === targetUserId) {
    return "Cannot delete yourself";
  }
  return null; // Valid
}
```

---

### Parent Organization Hierarchy

```typescript
async function validateParentOrg(orgId: string, parentOrgId: string): Promise<string | null> {
  // Cannot be own parent
  if (orgId === parentOrgId) {
    return "Organization cannot be its own parent";
  }
  
  // Check for circular references
  let current = parentOrgId;
  const visited = new Set([orgId]);
  
  while (current) {
    if (visited.has(current)) {
      return "Cannot create circular organization hierarchy";
    }
    visited.add(current);
    
    const parent = await kv.get(`org:${current}`);
    current = parent?.parentOrgId;
  }
  
  return null; // Valid
}
```

---

## 6. Error Response Format

All validation errors follow a consistent structure:

### Single Field Error
```json
{
  "error": "Email is required"
}
```

### Multiple Field Errors (Future)
```json
{
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## 7. Client-Side Validation (UX)

### Real-Time Validation

```typescript
// Example: Email validation on blur
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => {
    const error = validateEmail(email);
    setEmailError(error);
  }}
/>
{emailError && <p className="text-sm text-destructive">{emailError}</p>}
```

### Form Submission Validation

```typescript
async function handleSubmit() {
  // Validate all fields
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const nameError = validateName(formData.name);
  
  if (emailError || passwordError || nameError) {
    toast.error("Please fix validation errors");
    return;
  }
  
  // Proceed with submission
  await submitForm(formData);
}
```

---

## 8. Server-Side Validation (Security)

**⚠️ CRITICAL**: Always re-validate on the server, even if client-side validation passes.

```typescript
app.post('/auth/signup', async (c) => {
  const { email, password, name, role, tenantId, organizationId } = await c.req.json();
  
  // Re-validate all inputs
  const emailError = validateEmail(email);
  if (emailError) {
    return c.json({ error: emailError }, 400);
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    return c.json({ error: passwordError }, 400);
  }
  
  // Check for duplicate email
  const existingUser = await kv.get(`user:email:${email}`);
  if (existingUser) {
    return c.json({ error: "User with this email already exists" }, 409);
  }
  
  // Proceed with user creation
  // ...
});
```

---

## 9. Validation Utilities

### Reusable Validation Functions

```typescript
export const Validators = {
  email: (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  },
  
  password: (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  },
  
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  range: (value: number, min: number, max: number, fieldName: string) => {
    if (value < min || value > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },
  
  positiveNumber: (value: number, fieldName: string) => {
    if (value <= 0) {
      return `${fieldName} must be greater than 0`;
    }
    return null;
  }
};
```

---

## 10. Test Cases

### Email Validation Tests

| Input | Expected Result | Error Message |
|---|---|---|
| `` | ❌ Fail | "Email is required" |
| `invalid` | ❌ Fail | "Please enter a valid email address" |
| `test@` | ❌ Fail | "Please enter a valid email address" |
| `test@example.com` | ✅ Pass | - |
| `user+tag@example.co.uk` | ✅ Pass | - |

### Domain Validation Tests

| Input | Expected Result | Error Message |
|---|---|---|
| `` | ❌ Fail | "Domain is required" |
| `ab` | ❌ Fail | "Domain must be at least 3 characters" |
| `ABC` | ❌ Fail | "Domain must contain only lowercase letters, numbers, and hyphens" |
| `-test` | ❌ Fail | "Domain must contain only lowercase letters, numbers, and hyphens" |
| `test-` | ❌ Fail | "Domain must contain only lowercase letters, numbers, and hyphens" |
| `test--domain` | ❌ Fail | "Domain must contain only lowercase letters, numbers, and hyphens" |
| `abc` | ✅ Pass | - |
| `my-company-123` | ✅ Pass | - |

### Percentage Validation Tests

| Input | Expected Result | Error Message |
|---|---|---|
| `-10` | ❌ Fail | "Percentage cannot be negative" |
| `0` | ✅ Pass | - |
| `50` | ✅ Pass | - |
| `100` | ✅ Pass | - |
| `101` | ❌ Fail | "Percentage cannot exceed 100%" |
