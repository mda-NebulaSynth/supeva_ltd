# Supabase Type Fixes

## Problem: "Argument of type '{...}' is not assignable to parameter of type 'never'"

This happens when TypeScript can't find the table definition in `Database` types.

## Solution 1: Temporary Type Assertion (Quick Fix)

```typescript
// Before (fails):
const { error } = await supabase
    .from('admin_profiles')
    .update({ is_active: !currentStatus })
    .eq('id', adminId);

// After (works):
const { error } = await supabase
    .from('admin_profiles')
    .update({ is_active: !currentStatus } as any)
    .eq('id', adminId);
```

## Solution 2: Proper Typing (Best Practice)

```typescript
import type { Database } from '../lib/database.types';

type AdminProfile = Database['public']['Tables']['admin_profiles']['Row'];
type AdminProfileUpdate = Database['public']['Tables']['admin_profiles']['Update'];

// Usage:
const updates: AdminProfileUpdate = {
    is_active: !currentStatus
};

const { error } = await supabase
    .from('admin_profiles')
    .update(updates)
    .eq('id', adminId);
```

## Solution 3: Disable Type Checking for Specific Operations

Add `// @ts-ignore` comment above the line:

```typescript
// @ts-ignore - Type mismatch, will be fixed when types are regenerated
const { error } = await supabase
    .from('admin_profiles')
    .update({ is_active: !currentStatus })
    .eq('id', adminId);
```

## For All Manager Files

Apply pattern 2 or 3 to these files:
- `src/pages/admin/TeamManagement.tsx`
- `src/pages/admin/TeamManager.tsx`
- `src/pages/admin/BlogManager.tsx`
- `src/pages/admin/ProjectsManager.tsx`
- `src/pages/admin/ProjectUpdatesManager.tsx`
- `src/pages/admin/TestimonialsManager.tsx`
- `src/pages/admin/BannersManager.tsx`
- `src/contexts/AuthContext.tsx`

## React Component Return Type Issues

```typescript
// Before (error):
export const MyComponent = () => {
    if (loading) {
        return <div>Loading...</div>; // Type error
    }
    return <div>Content</div>;
};

// After (fixed):
export const MyComponent = (): JSX.Element => {
    if (loading) {
        return <div>Loading...</div>;
    }
    return <div>Content</div>;
};

// Or use React.FC:
export const MyComponent: React.FC = () => {
    if (loading) {
        return <div>Loading...</div>;
    }
    return <div>Content</div>;
};
```

## Input Value null/undefined Issues

```typescript
// Before (error):
<input value={formData.name} />

// After (fixed):
<input value={formData.name || ''} />

// Or with proper typing:
const [formData, setFormData] = useState<{
    name: string;  // Not string | null | undefined
    email: string;
}>({
    name: '',
    email: ''
});
```

## Lucide Icon Props Issues

```typescript
// Before (error):
<Plus size={20} />

// After (fixed with className):
<Plus className="w-5 h-5" />

// Or use size properly:
<Plus size="20" />  // string, not number

// Or install types:
// npm install -D @types/lucide-react
```

## After Running GET_ALL_TABLES_AND_COLUMNS.sql

Share the output and I'll generate a complete, accurate `database.types.ts` file.
