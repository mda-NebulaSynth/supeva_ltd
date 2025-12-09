# Supabase Database Migrations

This folder contains SQL migration files to update your Supeva database schema with image compression and upload features.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://tqvrtvanrqnaltnjklit.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - `01-add-location-display-name.sql`
   - `02-add-gallery-and-videos.sql`
   - `03-create-storage-bucket.sql`
5. Click **Run** for each migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd c:\Users\USER\OneDrive\Desktop\Supeva

# Run each migration in order
supabase db execute -f supabase-migrations/01-add-location-display-name.sql
supabase db execute -f supabase-migrations/02-add-gallery-and-videos.sql
supabase db execute -f supabase-migrations/03-create-storage-bucket.sql
```

## Migration Details

### 01-add-location-display-name.sql
- Adds `location_display_name` column for friendly location names (e.g., "Kilimani, Nairobi")
- Migrates existing plain text locations to display names
- Keeps `location` field for Google Maps embed URLs

### 02-add-gallery-and-videos.sql
- Adds `gallery` column (TEXT[]) for storing uploaded image URLs
- Adds `videos` column (TEXT[]) for storing YouTube embed URLs
- Supports up to 5 total media items per project

### 03-create-storage-bucket.sql
Updates your existing storage buckets with size limits and compression:

| Bucket | Max Size | Purpose |
|--------|----------|---------|
| `projects` | 1 MB | Project gallery images and updates |
| `blog` | 500 KB | Blog featured images |
| `team` | 300 KB | Team member profile photos |
| `testimonials` | 300 KB | Client testimonial photos |
| `ads` | 2 MB | Advertisement banner images |

**Features:**
- Automatic image compression before upload (85% quality, max 1920px)
- JPEG output for optimal file sizes
- Public read access for all users
- Upload/delete access for authenticated users only
- Browser-based compression (no server load)

## Image Compression

All images are automatically compressed using the `browser-image-compression` library:

- **Compression Quality**: 85% (maintains visual quality)
- **Max Dimensions**: 1920px (width or height)
- **Output Format**: JPEG (optimized for web)
- **Processing**: Client-side (reduces server load)

### Before and After Example:
```
Original: 5.2 MB (4000x3000 PNG)
↓
Compressed: 450 KB (1920x1440 JPEG)
= 91% size reduction
```

## Verification

After running migrations, verify in Supabase Dashboard:

1. **SQL Editor** → Run: `SELECT * FROM projects LIMIT 1;`
   - Should see `location_display_name`, `gallery`, and `videos` columns

2. **Storage** section → Should see all 5 buckets with updated settings:
   - projects (1MB limit)
   - blog (500KB limit)
   - team (300KB limit)
   - testimonials (300KB limit)
   - ads (2MB limit)

## Usage in Admin Panel

### Projects
- **Gallery**: Upload up to 5 images or videos (max 1MB per image)
- **Location**: Separate friendly name and Google Maps embed

### Project Updates
- **Media**: Upload up to 5 images (max 1MB each)
- **Video**: Optional YouTube URL

### Blog Posts
- **Featured Image**: 1 image (max 500KB)

### Team Members
- **Profile Photo**: 1 image (max 300KB)

### Testimonials
- **Client Photo**: 1 image (max 300KB)

### Ad Banners
- **Banner Image**: 1 image (max 2MB)

## Next Steps

After running migrations:
1. Log in to your admin panel at `/admin`
2. Test image uploads in any section
3. Upload progress will show compression status
4. All images are automatically optimized
