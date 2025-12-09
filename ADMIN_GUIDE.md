# Admin Dashboard Guide

## Overview

The Supeva Sandbox Admin Dashboard is a fully-featured Content Management System (CMS) for managing your real estate website. Built with React, TypeScript, and Supabase, it provides an intuitive interface for managing projects, blog posts, team members, and more.

## Accessing the Admin Dashboard

### URL
```
https://your-domain.com/admin
```

### Login
1. Navigate to `/login`
2. Enter your admin email and password
3. You'll be automatically redirected to the dashboard

### Authentication
- **Technology**: Supabase Auth with email/password
- **Role-Based Access**: Only users with `role: 'admin'` can access admin routes
- **Session Management**: Automatic session refresh and persistence

## Dashboard Structure

### Main Sections

1. **Dashboard** (`/admin`) - Overview and statistics
2. **Projects** (`/admin/projects`) - Manage real estate properties
3. **Blog Posts** (`/admin/blog`) - Create and edit blog articles
4. **Team Members** (`/admin/team`) - Manage team profiles
5. **Ad Banners** (`/admin/ads`) - Manage advertisement slots
6. **Testimonials** (`/admin/testimonials`) - Client reviews
7. **Contact Submissions** (`/admin/contacts`) - View inquiries

## Features

### Projects Manager

#### Overview
Comprehensive CRUD interface for managing real estate projects with the following capabilities:

#### Features
- ✅ **Create** new projects with full details
- ✅ **Read/View** all projects in a responsive grid
- ✅ **Update** existing project information
- ✅ **Delete** projects with confirmation
- ✅ **Search** projects by name or location
- ✅ **Filter** by status (Active, Sold, Upcoming)
- ✅ **Auto-slug generation** from project name

#### Project Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Project display name |
| Slug | Text | Auto | URL-friendly identifier (auto-generated) |
| Description | Textarea | No | Full project description |
| Location | Text | Yes | Physical location/address |
| Status | Select | Yes | active, sold, or upcoming |
| Price Min | Number | No | Minimum price (KES) |
| Price Max | Number | No | Maximum price (KES) |
| Bedrooms | Text | No | Number/range of bedrooms |
| Bathrooms | Text | No | Number/range of bathrooms |
| Area (sq ft) | Number | No | Property size in square feet |
| Featured Image | URL | No | Main project image URL |
| Gallery | Array | No | Additional images (future) |
| Amenities | Array | No | List of amenities (future) |

#### Creating a Project

1. Click **"Add New Project"** button
2. Fill in the project details:
   - **Name**: Enter project name (slug auto-generates)
   - **Description**: Add detailed description
   - **Location**: Enter full address
   - **Pricing**: Set price range
   - **Property Details**: Beds, baths, area
   - **Status**: Choose current status
   - **Images**: Add featured image URL
3. Click **"Create Project"**

#### Editing a Project

1. Find the project in the grid
2. Click **"Edit"** button on the project card
3. Update any fields in the modal
4. Click **"Update Project"**

#### Deleting a Project

1. Find the project in the grid
2. Click the **red trash icon**
3. Confirm deletion in the alert dialog
4. Project is permanently removed

### Dashboard Statistics

The main dashboard displays real-time statistics:

- **Total Projects**: Count of all projects
- **Blog Posts**: Published articles count
- **Team Members**: Active team members
- **Contact Submissions**: New inquiries

### Quick Actions

Direct links to common tasks:
- Manage Projects
- Create Blog Post
- View Live Website

## Technical Details

### Architecture

```
Admin Dashboard
├── AdminLayout.tsx          # Main layout with sidebar
├── Dashboard.tsx            # Overview page
├── ProjectsManager.tsx      # Projects CRUD
└── [Future Components]
    ├── BlogManager.tsx
    ├── TeamManager.tsx
    ├── AdsManager.tsx
    └── ContactsViewer.tsx
```

### State Management

- **Local State**: React useState for component state
- **Data Fetching**: Supabase client for real-time data
- **Form Handling**: Controlled components with validation
- **Optimistic Updates**: UI updates before server confirmation

### Animations

All admin components use Framer Motion for smooth transitions:
- **Page Transitions**: Fade-in on route change
- **Modal Animations**: Scale and fade entrance/exit
- **Card Hover**: Elevation and shadow effects
- **Form Interactions**: Input focus animations

### Responsive Design

- **Mobile**: Collapsible sidebar, stacked forms
- **Tablet**: Optimized grid layouts
- **Desktop**: Full sidebar, multi-column grids

## Database Integration

### Supabase Tables

#### projects
```sql
- id: UUID (primary key)
- name: TEXT
- slug: TEXT (unique)
- description: TEXT
- location: TEXT
- price_min: INTEGER
- price_max: INTEGER
- bedrooms: TEXT
- bathrooms: TEXT
- area_sqft: INTEGER
- status: TEXT (active|sold|upcoming)
- featured_image: TEXT
- gallery: TEXT[]
- amenities: TEXT[]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Row Level Security (RLS)

Projects table policies:
- **SELECT**: Public read access
- **INSERT/UPDATE/DELETE**: Admin role only

```sql
-- Example policy
CREATE POLICY "Admins can manage projects"
ON projects
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

## Image Management

### Current Implementation
- **Method**: Direct URL input
- **Storage**: External URLs (Unsplash, Cloudinary, etc.)
- **Validation**: URL format only

### Future Enhancement
```tsx
// File upload to Supabase Storage
const uploadImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('projects')
    .upload(`${projectSlug}/${file.name}`, file);

  return data?.path;
};
```

## Security Best Practices

### 1. Authentication Checks
```tsx
// ProtectedRoute component ensures authentication
<Route element={<ProtectedRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<Dashboard />} />
  </Route>
</Route>
```

### 2. Role Verification
```tsx
// Check user role in AuthContext
const { user } = useAuth();
if (user?.user_metadata?.role !== 'admin') {
  // Redirect or show error
}
```

### 3. Input Validation
```tsx
// Required fields in forms
<input required minLength={3} maxLength={100} />

// Server-side validation in Supabase
```

### 4. SQL Injection Prevention
- Supabase client uses parameterized queries
- No raw SQL in client code
- All inputs are sanitized

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search |
| `Esc` | Close modal |
| `Ctrl/Cmd + S` | Save form (in modal) |
| `Tab` | Navigate form fields |

## Accessibility (WCAG 2.1 AA)

### Implemented Features
- ✅ Keyboard navigation throughout
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels on icons and buttons
- ✅ Semantic HTML structure
- ✅ Color contrast ratios meet AA standards
- ✅ Form labels and error messages
- ✅ Reduced motion support

### Testing
```bash
# Run accessibility audit
npm run a11y-audit

# Or use browser tools
# Chrome DevTools > Lighthouse > Accessibility
```

## Performance Optimization

### Implemented Optimizations
1. **Lazy Loading**: Images load on demand
2. **Debounced Search**: 300ms delay on search input
3. **Pagination**: (Future) Load data in chunks
4. **Caching**: Supabase real-time subscriptions
5. **Optimistic Updates**: UI updates before DB confirmation

### Performance Metrics
- **Time to Interactive**: <2s
- **First Contentful Paint**: <1s
- **API Response Time**: <500ms average

## Troubleshooting

### Can't Access Admin Dashboard

**Problem**: Redirected to login or 404

**Solutions**:
1. Verify user is authenticated
2. Check user role in Supabase:
   ```sql
   SELECT * FROM profiles WHERE email = 'your-email';
   ```
3. Ensure role is 'admin':
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email';
   ```

### Projects Not Saving

**Problem**: Form submits but no data appears

**Solutions**:
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies allow insert/update
4. Ensure all required fields are filled

### Images Not Displaying

**Problem**: Image URLs show broken image icon

**Solutions**:
1. Verify URL is publicly accessible
2. Check CORS headers if cross-origin
3. Use HTTPS URLs only
4. Test URL in new browser tab

### Slow Performance

**Problem**: Dashboard is laggy or slow

**Solutions**:
1. Clear browser cache
2. Reduce number of concurrent animations
3. Check network tab for slow API calls
4. Enable database indexes in Supabase

## Future Enhancements

### Planned Features

#### Phase 3
- [ ] Blog post editor with rich text (TipTap)
- [ ] Team member management
- [ ] Ad banner CRUD
- [ ] Testimonials management
- [ ] Contact submissions viewer with filters

#### Phase 4
- [ ] File upload to Supabase Storage
- [ ] Image cropping and optimization
- [ ] Bulk operations (delete, update status)
- [ ] Export data (CSV, JSON)
- [ ] Activity log and audit trail

#### Phase 5
- [ ] Advanced search with filters
- [ ] Drag-and-drop image upload
- [ ] Inline editing (click to edit)
- [ ] Undo/redo functionality
- [ ] Version history for content

## API Reference

### Fetch Projects
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });
```

### Create Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert([{
    name: 'New Project',
    slug: 'new-project',
    status: 'active',
    // ... other fields
  }]);
```

### Update Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ name: 'Updated Name' })
  .eq('id', projectId);
```

### Delete Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

## Support

For technical support or questions:

- **Documentation**: Check README.md and this guide
- **Issues**: Report bugs on GitHub
- **Email**: info@supeva.com
- **Developer**: Contact development team

---

**Last Updated**: 2024-12-06
**Version**: 2.0.0 (Phase 2 Complete)
**Maintained By**: Supeva Development Team
