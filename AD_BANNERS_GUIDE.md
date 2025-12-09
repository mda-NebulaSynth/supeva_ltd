# Ad Banners Feature - Implementation Guide

Complete implementation of advertisement banners for the Supeva Real Estate website.

## Overview

The ad banners system allows administrators to manage advertisement placements across the website through an easy-to-use admin interface.

## Components Created

### 1. **AdBanner Component** (`src/components/AdBanner.tsx`)
- Display component for showing banners on the website
- Features:
  - Automatic fetching from database based on slot ID
  - Smooth animations with Framer Motion
  - Click tracking capability
  - Responsive design
  - Graceful error handling (hides if no banner found)

### 2. **BannersManager Component** (`src/pages/admin/BannersManager.tsx`)
- Full-featured admin interface for managing banners
- Features:
  - Create, edit, and delete banners
  - Toggle banner active/inactive status
  - Real-time preview of banner images
  - Slot ID guide for common placements
  - Form validation

### 3. **AdSlot Component** (`src/components/AdSlot.tsx`)
- Existing component that was already integrated
- Similar functionality to AdBanner
- Used throughout the site

## Database Schema

The `ad_banners` table (already exists in Supabase):

```sql
CREATE TABLE ad_banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  slot_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);
```

**Fields:**
- `slot_id` - Unique identifier for banner placement (e.g., "home-hero", "blog-top")
- `image_url` - URL to the banner image
- `link_url` - Destination URL when banner is clicked
- `active` - Whether the banner should be displayed

## Banner Placements

Banners are integrated on the following pages:

### 1. **Homepage** - `HomePage.tsx`
- Slot ID: `Homepage-Ad-1`
- Location: Between featured content sections

### 2. **Blog Page** - `BlogPage.tsx`
- Slot ID: `blog-top`
- Location: After tag filters, before blog posts grid

### 3. **Projects Page** - `ProjectsPage.tsx`
- Slot ID: `projects-top`
- Location: After status filters, before projects grid

## Admin Access

**URL:** `/admin/ads`

The admin panel provides:
- List view of all banners (active and inactive)
- Create new banner form
- Edit existing banners
- Delete banners
- Toggle active/inactive status
- Visual preview of banner images

## Common Slot IDs

Recommended slot IDs for consistency:

| Slot ID | Location | Recommended Size |
|---------|----------|------------------|
| `home-hero` | Homepage hero section | 1200x400px |
| `blog-top` | Top of blog page | 1200x300px |
| `blog-sidebar` | Blog sidebar | 300x600px |
| `projects-top` | Top of projects page | 1200x300px |
| `footer` | Footer area | 1200x200px |

## Usage Instructions

### For Administrators:

1. **Navigate to Admin Panel**
   - Go to `/admin/ads`
   - Login if not already authenticated

2. **Create a New Banner**
   - Click "Add Banner" button
   - Fill in the form:
     - **Slot ID**: Where the banner appears (e.g., "blog-top")
     - **Image URL**: Direct link to your banner image
     - **Link URL**: Where users go when they click
     - **Active**: Check to show immediately
   - Preview appears as you enter the image URL
   - Click "Create Banner"

3. **Edit a Banner**
   - Click the edit icon (pencil) on any banner
   - Update the fields
   - Click "Update Banner"

4. **Activate/Deactivate a Banner**
   - Click the toggle button on any banner
   - Active banners show on the website
   - Inactive banners are hidden but not deleted

5. **Delete a Banner**
   - Click the delete icon (trash) on any banner
   - Confirm the deletion

### For Developers:

To add a banner to a new page:

```tsx
import { AdSlot } from '../components/AdSlot';

// In your component JSX:
<section className="py-8 bg-gray-50">
    <div className="container-custom">
        <AdSlot id="your-slot-id" className="max-w-4xl mx-auto" />
    </div>
</section>
```

## Security

Row Level Security (RLS) policies:
- **Public**: Can view active banners only
- **Admins**: Can create, edit, delete all banners
- **Authenticated users**: Can view all banners (active and inactive)

## Performance

- Banners are fetched asynchronously
- Failed banner loads don't break the page
- Only active banners are queried on public pages
- Images should be optimized for web (<200KB recommended)

## Best Practices

1. **Image Optimization**
   - Use WebP format for smaller file sizes
   - Compress images before uploading
   - Recommended max size: 1200px wide

2. **Slot ID Naming**
   - Use lowercase
   - Use hyphens, not spaces
   - Be descriptive: `blog-sidebar` not `bs1`

3. **Banner Rotation**
   - Currently shows the most recent active banner per slot
   - To rotate: Create multiple banners, activate one at a time

4. **Testing**
   - Always preview banners before activating
   - Test click-through links
   - Check responsive display on mobile

## Future Enhancements

Potential improvements:
1. Click tracking analytics
2. Impression counting
3. Automatic banner rotation
4. Scheduled activation/deactivation
5. A/B testing support
6. Upload images directly (vs. URL only)
7. Banner performance metrics

## Troubleshooting

**Banner not showing:**
- Check banner is set to "Active"
- Verify slot ID matches exactly
- Check image URL is accessible
- Clear browser cache

**Admin panel not accessible:**
- Ensure you're logged in as admin
- Check user role in Supabase profiles table

**Image not loading:**
- Verify image URL is public and accessible
- Check CORS settings if hosting externally
- Try opening image URL directly in browser

## Files Modified/Created

**Created:**
- `src/components/AdBanner.tsx` - Display component with animations
- `src/pages/admin/BannersManager.tsx` - Admin management interface
- `AD_BANNERS_GUIDE.md` - This documentation

**Modified:**
- `src/App.tsx` - Added `/admin/ads` route
- `src/pages/BlogPage.tsx` - Added banner slot
- `src/pages/ProjectsPage.tsx` - Added banner slot
- `src/pages/admin/AdminLayout.tsx` - Already had "Ad Banners" nav item

**Existing (not modified):**
- `src/components/AdSlot.tsx` - Already existed and working
- `supabase-schema.sql` - ad_banners table already defined
- `src/lib/database.types.ts` - ad_banners types already defined

## Support

For questions or issues with the ad banners system:
1. Check this documentation
2. Review the Supabase dashboard for data
3. Check browser console for errors
4. Verify RLS policies in Supabase
