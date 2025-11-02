# Builder.io Integration Optimization Guide

**Last Updated**: January 2025  
**Purpose**: Prepare ValueDock® for seamless Builder.io integration and Loveable migration

## Overview

This guide optimizes ValueDock® for visual editing with Builder.io and ensures smooth migration to Loveable platform.

---

## 1. Component Structure Optimization

### ✅ Already Optimized Components

All ValueDock® components follow Builder.io best practices:

- **Functional Components** - All components use React functional syntax
- **TypeScript Props** - Clear prop interfaces for visual editing
- **Named Exports** - Easy component registration
- **Isolated Styles** - Tailwind classes, no CSS-in-JS conflicts
- **No External Dependencies on Window** - SSR-compatible

### Component Registration for Builder.io

```typescript
// Example: Register main screens
import { Builder } from '@builder.io/react';
import { InputsScreen } from './components/InputsScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PresentationScreen } from './components/PresentationScreen';

// Register each component
Builder.registerComponent(InputsScreen, {
  name: 'InputsScreen',
  inputs: [
    {
      name: 'data',
      type: 'object',
      required: true
    },
    {
      name: 'onChange',
      type: 'function',
      required: true
    }
  ]
});

Builder.registerComponent(ResultsScreen, {
  name: 'ResultsScreen',
  inputs: [
    {
      name: 'data',
      type: 'object',
      required: true
    },
    {
      name: 'implementation',
      type: 'object',
      required: true
    }
  ]
});

// Continue for all main components...
```

---

## 2. Data Layer Optimization

### Current Data Flow (Optimized for Builder.io)

```
App.tsx (State Container)
    ↓
Context/Props (Data Distribution)
    ↓
Screen Components (Presentation)
    ↓
Sub-components (Specific Features)
```

### Builder.io Data Integration Points

**State Management:**
```typescript
// App.tsx already uses centralized state
const [calculatorData, setCalculatorData] = useState<CalculatorData>({
  processes: [],
  globalDefaults: {},
  groups: []
});

// This is Builder.io compatible - can be wrapped in context
```

**Recommended Context Wrapper for Builder.io:**

```typescript
// Create: /contexts/CalculatorContext.tsx
import { createContext, useContext, useState } from 'react';

export const CalculatorContext = createContext(null);

export const CalculatorProvider = ({ children, initialData }) => {
  const [data, setData] = useState(initialData);
  
  return (
    <CalculatorContext.Provider value={{ data, setData }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);
```

---

## 3. Styling Optimization

### ✅ Already Builder.io Compatible

- **Tailwind CSS 4.0** - Fully supported by Builder.io
- **CSS Variables** - Defined in `styles/globals.css`
- **Shadcn/ui Components** - Builder.io compatible
- **Responsive Design** - Mobile-first approach works with Builder.io

### Theme Token Mapping for Builder.io

```css
/* styles/globals.css - Already optimized */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... etc */
}
```

**Builder.io Theme Integration:**
- All tokens can be edited in Builder.io visual editor
- No code changes needed for theme customization
- White-label ready

---

## 4. API Integration Optimization

### Current Backend (Builder.io Compatible)

```typescript
// Supabase Edge Function - Stateless, Builder.io friendly
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-888f4514`;

// All API calls use fetch (Builder.io compatible)
const response = await fetch(`${API_URL}/data/${key}`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
});
```

### Builder.io API Proxy Configuration

```typescript
// Add to Builder.io settings
{
  "apiProxies": {
    "valuedock-api": {
      "url": "https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514",
      "headers": {
        "Authorization": "Bearer [SUPABASE_ANON_KEY]"
      }
    }
  }
}
```

---

## 5. Component Prop Interfaces

### ✅ All Components Have Clear Interfaces

Example from InputsScreen:

```typescript
interface InputsScreenProps {
  data: CalculatorData;
  onChange: (data: CalculatorData) => void;
  onSave?: () => void;
  currentOrganization?: { id: string; name: string } | null;
}
```

**Builder.io Input Configuration:**

```typescript
{
  name: 'InputsScreen',
  inputs: [
    { name: 'data', type: 'object', required: true },
    { name: 'onChange', type: 'function', required: true },
    { name: 'onSave', type: 'function' },
    { name: 'currentOrganization', type: 'object' }
  ]
}
```

---

## 6. Image Optimization

### Current Implementation (Optimized)

```typescript
// components/figma/ImageWithFallback.tsx
// Already optimized for lazy loading
<img 
  loading="lazy"
  decoding="async"
  // ... Builder.io compatible
/>
```

### Builder.io Image Settings

- Use `ImageWithFallback` component
- Automatic Unsplash integration already present
- Lazy loading enabled by default

---

## 7. Performance Optimization

### ✅ Already Implemented

1. **Code Splitting** - React lazy loading ready
2. **Memoization** - useMemo/useCallback in calculations
3. **Lazy Loading** - Images and heavy components
4. **Debouncing** - Auto-save with 30s delay

### Builder.io Performance Enhancements

```typescript
// Add to App.tsx for Builder.io
import { lazy, Suspense } from 'react';

const InputsScreen = lazy(() => import('./components/InputsScreen'));
const ResultsScreen = lazy(() => import('./components/ResultsScreen'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <InputsScreen {...props} />
</Suspense>
```

---

## 8. Authentication Integration

### Current Auth (Supabase - Builder.io Compatible)

```typescript
// utils/auth.ts
export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### Builder.io Auth Wrapper

```typescript
// Create: /builders/AuthWrapper.tsx
import { Builder } from '@builder.io/react';

export const BuilderAuthWrapper = ({ children, user }) => {
  if (!user) {
    return <LoginScreen />;
  }
  return <>{children}</>;
};

Builder.registerComponent(BuilderAuthWrapper, {
  name: 'AuthWrapper',
  inputs: [
    { name: 'user', type: 'object' },
    { name: 'children', type: 'blocks' }
  ]
});
```

---

## 9. Mobile Optimization (Already Complete)

### ✅ Mobile-First Design

- Card-based layouts on mobile
- Touch-friendly buttons (44px min)
- No horizontal scroll
- Responsive breakpoints

### Builder.io Responsive Settings

All components use Tailwind responsive classes:
```typescript
className="flex flex-col md:flex-row lg:grid-cols-3"
```

Builder.io visual editor can modify these directly.

---

## 10. Form Components

### ✅ All Forms Use Controlled Components

```typescript
// Example: ProcessEditor
<Input
  value={process.name}
  onChange={(e) => onChange({ ...process, name: e.target.value })}
/>
```

**Builder.io Form Integration:**
- All inputs already controlled
- onChange handlers already implemented
- Validation already present

---

## 11. Chart Components (Recharts)

### Current Implementation

```typescript
// All charts use Recharts (Builder.io compatible)
import { LineChart, BarChart, PieChart } from 'recharts';
```

### Builder.io Chart Registration

```typescript
Builder.registerComponent(FTEImpactChart, {
  name: 'FTEImpactChart',
  inputs: [
    { name: 'data', type: 'list', subFields: [
      { name: 'month', type: 'string' },
      { name: 'fte', type: 'number' }
    ]}
  ]
});
```

---

## 12. Export Functionality

### Current Export System (Optimized)

```typescript
// components/utils/exportUtils.ts
export const exportToPDF = async (data) => {
  // Client-side PDF generation
  // Builder.io compatible
};
```

**No changes needed** - Export functions work independently.

---

## 13. Builder.io Specific Optimizations

### Create Builder.io Entry Point

```typescript
// Create: /builders/BuilderEntry.tsx
import { BuilderComponent, builder } from '@builder.io/react';
import { CalculatorProvider } from '../contexts/CalculatorContext';

builder.init(process.env.BUILDER_PUBLIC_KEY);

export const BuilderApp = () => {
  return (
    <CalculatorProvider>
      <BuilderComponent model="page" />
    </CalculatorProvider>
  );
};
```

### Component Registry File

```typescript
// Create: /builders/registerComponents.ts
import { Builder } from '@builder.io/react';

// Import all components
import { InputsScreen } from '../components/InputsScreen';
import { ResultsScreen } from '../components/ResultsScreen';
import { PresentationScreen } from '../components/PresentationScreen';
import { AdminDashboard } from '../components/AdminDashboard';
// ... import all major components

// Register all components
export const registerAllComponents = () => {
  // Screen Components
  Builder.registerComponent(InputsScreen, {
    name: 'Inputs Screen',
    inputs: [
      { name: 'data', type: 'object', required: true },
      { name: 'onChange', type: 'function', required: true }
    ]
  });

  Builder.registerComponent(ResultsScreen, {
    name: 'Results Screen',
    inputs: [
      { name: 'data', type: 'object', required: true },
      { name: 'implementation', type: 'object', required: true }
    ]
  });

  // Add all other components...
};
```

---

## 14. Environment Variables for Builder.io

### Create .env.builder

```bash
# Builder.io Configuration
BUILDER_PUBLIC_KEY=your_builder_public_key
BUILDER_PRIVATE_KEY=your_builder_private_key

# Existing Supabase (keep these)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 15. Package.json Updates for Builder.io

```json
{
  "dependencies": {
    "@builder.io/react": "^3.0.0",
    "@builder.io/sdk": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
    // ... existing dependencies
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "builder:dev": "builder dev",
    "builder:publish": "builder publish"
  }
}
```

---

## 16. File Structure for Builder.io

```
valuedock/
├── builders/                    # NEW - Builder.io specific
│   ├── BuilderEntry.tsx        # Entry point
│   ├── registerComponents.ts   # Component registry
│   └── AuthWrapper.tsx         # Auth integration
├── contexts/                    # NEW - React Context
│   └── CalculatorContext.tsx   # State management
├── components/                  # EXISTING - No changes
├── utils/                       # EXISTING - No changes
└── App.tsx                      # EXISTING - Minor updates
```

---

## 17. Builder.io Model Configuration

### Page Model

```json
{
  "name": "page",
  "kind": "page",
  "inputs": [
    { "name": "title", "type": "string" },
    { "name": "description", "type": "string" }
  ]
}
```

### Calculator Data Model

```json
{
  "name": "calculator-data",
  "kind": "data",
  "inputs": [
    { "name": "processes", "type": "list" },
    { "name": "globalDefaults", "type": "object" },
    { "name": "groups", "type": "list" }
  ]
}
```

---

## 18. Migration Checklist

### Pre-Migration
- ✅ All components functional
- ✅ TypeScript interfaces defined
- ✅ Tailwind CSS working
- ✅ API endpoints functional
- ✅ Mobile optimization complete

### Builder.io Setup
- [ ] Create Builder.io account
- [ ] Get API keys
- [ ] Install @builder.io/react
- [ ] Create contexts folder
- [ ] Create builders folder
- [ ] Register components
- [ ] Test visual editing

### Loveable Migration
- [ ] Export Builder.io config
- [ ] Import to Loveable
- [ ] Connect Supabase
- [ ] Test all features
- [ ] Deploy

---

## 19. Testing for Builder.io Compatibility

### Component Tests

```typescript
// Test each component renders independently
import { render } from '@testing-library/react';
import { InputsScreen } from './components/InputsScreen';

test('InputsScreen renders with Builder.io props', () => {
  const mockData = { processes: [], globalDefaults: {} };
  const mockOnChange = jest.fn();
  
  render(<InputsScreen data={mockData} onChange={mockOnChange} />);
  // Component should render without errors
});
```

---

## 20. Summary - What's Optimized

### ✅ Ready for Builder.io

1. **Component Architecture** - All functional components with clear props
2. **Styling** - Tailwind CSS fully compatible
3. **State Management** - Centralized, context-ready
4. **API Integration** - Fetch-based, stateless
5. **Mobile Optimization** - Responsive design complete
6. **TypeScript** - Strong typing throughout
7. **Performance** - Lazy loading, memoization ready
8. **Authentication** - Supabase auth compatible
9. **Forms** - Controlled components
10. **Charts** - Recharts integration

### 🔧 Needs Configuration (Not Code Changes)

1. Install @builder.io/react package
2. Create context providers
3. Create component registry file
4. Add Builder.io API keys
5. Configure Builder.io models

### 📝 No Breaking Changes Required

**All existing code remains functional** - Builder.io is additive, not replacing current implementation.

---

## Next Steps

See **LOVEABLE_MIGRATION_GUIDE.md** for step-by-step Loveable migration instructions.
