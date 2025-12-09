# Role-Based Access Control (RBAC) System - Setup Instructions

## Overview

The RBAC system has been implemented with **three roles**:

1. **Developer** (You - supeva@nebulasynth.com)
   - Highest access level with full bypass
   - Can access ALL tables and features
   - Hidden from team member counts and lists
   - Bypasses all RLS policies

2. **Founder**
   - Full admin access including team management
   - Can invite and manage staff
   - Access to all features except developer tools
   - Visible in team management

3. **Staff**
   - Access to analytics and content management (CRUD for blog, projects, testimonials, ads)
   - Cannot manage team members (read-only access)
   - Must be invited by a Founder

## Setup Steps

### Step 1: Run the Migration

1. Open your Supabase SQL Editor
2. Run the migration file: `supabase/migrations/05-rbac-system.sql`
3. This will create:
   - `admin_profiles` table with `developer`, `founder`, `staff` roles
   - Work attribution columns (`author_id`, `assigned_to`, etc.)
   - RLS policies with developer bypass
   - Helper functions

### Step 2: Create Your Developer Account

1. **Create Auth User in Supabase Dashboard:**
   - Go to Authentication → Users
   - Click "Add User"
   - Email: `supeva@nebulasynth.com`
   - Create a password
   - Copy the User ID (UUID format)

2. **Create Developer Profile:**
   ```sql
   INSERT INTO admin_profiles (id, email, full_name, role, is_developer, is_active)
   VALUES (
     '4f7cc3c6-bb97-4d30-9535-c99eaab60ac1',
     'supeva@nebulasynth.com',
     'Supeva Developer',
     'developer',
     true,
     true
   );
   ```

### Step 3: Create a Founder Account (Optional)

If you want to create a founder account for testing:

1. Create another auth user in Supabase Dashboard
2. Run this SQL:
   ```sql
   INSERT INTO admin_profiles (id, email, full_name, role, is_active)
   VALUES (
     'FOUNDER_USER_ID',
     'founder@example.com',
     'Founder Name',
     'founder',
     true
   );
   ```

### Step 4: Login and Test

1. Login with your developer credentials: `supeva@nebulasynth.com`
2. You should have full access to everything
3. You won't appear in team management lists (by design)

## What's Been Implemented

### ✅ Database Layer
- `admin_profiles` table with `developer`, `founder`, `staff` roles
- `is_developer` flag to identify developer accounts
- Work attribution columns on all content tables
- RLS policies with developer bypass
- Helper functions: `is_developer()`, `is_founder()`, `is_active_admin()`

### ✅ Authentication Context
**File:** `src/contexts/AuthContext.tsx`
- Added `AdminRole` type: `'developer' | 'founder' | 'staff'`
- Added `isDeveloper`, `isFounder`, `isStaff`, `isActiveAdmin` boolean flags
- Developer accounts bypass `is_active` check
- Automatic profile fetching on auth state changes

### ✅ Protected Route Component
**File:** `src/components/ProtectedRoute.tsx`
- Developers bypass ALL restrictions
- Supports `requireFounder` prop for founder-only pages
- Beautiful error screens for access denied

### ✅ Team Management Page
**File:** `src/pages/admin/TeamManagement.tsx`
- Founder-only access (developers can access too)
- Staff invitation system via email
- Activate/deactivate team members
- Search and filter functionality
- Developer accounts are hidden from team lists
- Stats dashboard (excludes developers from counts)

## Role Permissions Matrix

| Feature                  | Developer | Founder | Staff |
|--------------------------|-----------|---------|-------|
| Blog Posts (CRUD)        | ✅        | ✅      | ✅    |
| Projects (CRUD)          | ✅        | ✅      | ✅    |
| Project Updates (CRUD)   | ✅        | ✅      | ✅    |
| Testimonials (CRUD)      | ✅        | ✅      | ✅    |
| Ad Banners (CRUD)        | ✅        | ✅      | ✅    |
| Team Members (View)      | ✅        | ✅      | ✅    |
| Team Members (Manage)    | ✅        | ✅      | ❌    |
| Invite Staff             | ✅        | ✅      | ❌    |
| Analytics Dashboard      | ✅        | ✅      | ✅    |
| Bypass All RLS           | ✅        | ❌      | ❌    |
| Visible in Team Lists    | ❌        | ✅      | ✅    |

## Database Schema Changes

### admin_profiles Table
```sql
- id: UUID (references auth.users)
- email: TEXT
- full_name: TEXT
- role: 'developer' | 'founder' | 'staff'
- is_developer: BOOLEAN (true only for developers)
- is_active: BOOLEAN
- avatar_url: TEXT (nullable)
- invited_by: UUID (references admin_profiles)
- invited_at: TIMESTAMP
- accepted_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Work Attribution Columns Added
- `blog_posts.author_id` → References admin who wrote the post
- `projects.assigned_to` → References admin managing the project
- `project_updates.author_id` → References admin who posted the update
- `testimonials.added_by` → References admin who added testimonial
- `team_members.managed_by` → References admin managing team member

## Next Steps (Not Yet Implemented)

1. **Update Admin Routes** - Add ProtectedRoute wrapper to admin pages
2. **Update Navigation** - Show/hide menu items based on role
3. **Add Work Attribution UI** - Dropdowns to assign authors/managers in forms
4. **Staff Invitation Flow** - Email templates and onboarding
5. **Analytics Dashboard** - Track work by user

## Developer Notes

- Developer accounts **never** appear in team counts or lists
- Developer role bypasses `is_active` status check
- Developer has first priority in RLS policies (checked first)
- Use `isDeveloper` from `useAuth()` hook to show developer-only features
- All RLS policies have a developer bypass clause

## Testing Checklist

- [ ] Create developer account with supeva@nebulasynth.com
- [ ] Login and verify full access
- [ ] Create a founder account
- [ ] Founder can see team management
- [ ] Founder can invite staff
- [ ] Staff cannot access team management
- [ ] Developer is hidden from team lists
- [ ] All content CRUD operations work for all roles

## Support

If you encounter any issues:
1. Check Supabase logs for RLS policy errors
2. Verify your admin_profile exists and is_active = true
3. Check that role and is_developer flags are set correctly
4. Make sure you ran the migration successfully
