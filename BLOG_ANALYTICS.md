# Blog Analytics & View Tracking

This document explains the blog post view tracking implementation in the Supeva Real Estate website.

## Overview

The blog view tracking system captures every page view on individual blog posts, storing detailed analytics data while automatically incrementing view counts for easy display.

## Database Schema

### `blog_views` Table

Stores individual view events with metadata:

```sql
CREATE TABLE blog_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT,
  user_agent TEXT,
  referrer TEXT
);
```

**Fields:**
- `id`: Unique identifier for each view event
- `created_at`: Timestamp when the view occurred
- `blog_post_id`: Foreign key to the blog post being viewed
- `viewer_ip`: IP address of the viewer (optional, can be populated server-side)
- `user_agent`: Browser/device information
- `referrer`: Source URL that led to this view

### `blog_posts.view_count` Column

Added to the `blog_posts` table for performance:

```sql
ALTER TABLE blog_posts
ADD COLUMN view_count INTEGER DEFAULT 0;
```

This column is automatically incremented via a database trigger whenever a new view is recorded.

## How It Works

### 1. Database Trigger

When a new view is inserted into `blog_views`, a PostgreSQL trigger automatically increments the `view_count`:

```sql
CREATE OR REPLACE FUNCTION increment_blog_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE id = NEW.blog_post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_blog_view_created
  AFTER INSERT ON blog_views
  FOR EACH ROW EXECUTE FUNCTION increment_blog_view_count();
```

### 2. Client-Side Tracking

In `BlogPostPage.tsx`, the `trackView()` function is called when a blog post loads:

```typescript
const trackView = async (postId: string) => {
    try {
        await supabase.from('blog_views').insert([
            {
                blog_post_id: postId,
                viewer_ip: null,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null
            }
        ]);
    } catch (error) {
        console.debug('View tracking error:', error);
    }
};
```

**Key Features:**
- Runs asynchronously - doesn't block page rendering
- Fails silently - errors don't affect user experience
- Captures browser and referrer information
- IP address can be added server-side if needed

### 3. Display View Count

The view count is displayed on each blog post page alongside other metadata:

```tsx
<div className="flex items-center gap-2">
    <Eye className="w-4 h-4" />
    {post.view_count.toLocaleString()} {post.view_count === 1 ? 'view' : 'views'}
</div>
```

## Setup Instructions

### 1. Run the Migration

Execute the SQL migration in your Supabase SQL Editor:

```bash
# The migration file is located at:
# supabase-views-migration.sql
```

### 2. Update Database Types

The TypeScript types in `src/lib/database.types.ts` have been updated to include:
- `blog_posts.view_count` field
- `blog_views` table definition

### 3. Row Level Security (RLS)

The migration includes RLS policies:

```sql
-- Anyone can record a view (public insert)
CREATE POLICY "Anyone can insert blog views" ON blog_views FOR INSERT WITH CHECK (true);

-- Only admins can view analytics data
CREATE POLICY "Admins can view all blog views" ON blog_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
```

## Analytics Queries

### Get Total Views by Post

```sql
SELECT
    bp.title,
    bp.slug,
    bp.view_count,
    COUNT(bv.id) as detailed_count
FROM blog_posts bp
LEFT JOIN blog_views bv ON bv.blog_post_id = bp.id
WHERE bp.status = 'published'
GROUP BY bp.id
ORDER BY bp.view_count DESC;
```

### Get Popular Posts

Use the built-in function:

```sql
SELECT * FROM get_popular_posts(10);
```

### Views Over Time

```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as views
FROM blog_views
WHERE blog_post_id = 'POST_ID_HERE'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Referrer Analysis

```sql
SELECT
    referrer,
    COUNT(*) as views
FROM blog_views
WHERE blog_post_id = 'POST_ID_HERE'
    AND referrer IS NOT NULL
GROUP BY referrer
ORDER BY views DESC;
```

### User Agent Analysis

```sql
SELECT
    CASE
        WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
        WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
        ELSE 'Desktop'
    END as device_type,
    COUNT(*) as views
FROM blog_views
GROUP BY device_type;
```

## Admin Dashboard Integration

To integrate analytics into the admin dashboard:

1. Query `blog_views` table for detailed analytics
2. Use `view_count` column for quick stats
3. Filter by date ranges for time-series analysis
4. Join with `blog_posts` for comprehensive reports

## Privacy Considerations

- IP addresses are currently set to `null` by default
- To enable IP tracking, implement server-side middleware
- Consider GDPR/privacy laws in your jurisdiction
- User Agent and Referrer data is anonymous
- No personally identifiable information is stored

## Performance

- **Indexes**: Created on `blog_post_id` and `created_at` for fast queries
- **Trigger**: Automatic view count updates are efficient
- **Async**: View tracking doesn't block page rendering
- **Fail-Safe**: Errors in tracking don't affect user experience

## Future Enhancements

Potential improvements:

1. **IP Geolocation**: Track viewer locations
2. **Session Tracking**: Deduplicate views from same session
3. **Read Time**: Track how long users spend reading
4. **Scroll Depth**: Measure engagement level
5. **Bot Detection**: Filter out crawler traffic
6. **Real-time Dashboard**: Live view counts with websockets
7. **Export Reports**: CSV/PDF analytics exports

## Testing

To test the implementation:

1. Visit any blog post page
2. Check the view count displayed
3. Refresh the page - count should increment
4. Query the database to verify:
   ```sql
   SELECT * FROM blog_views ORDER BY created_at DESC LIMIT 10;
   ```

## Troubleshooting

**Views not incrementing:**
- Check RLS policies are properly set
- Verify trigger is installed: `\df increment_blog_view_count`
- Check browser console for errors

**View count shows 0:**
- Ensure migration was run successfully
- Check if `view_count` column exists: `\d blog_posts`
- Verify trigger is firing

**Performance issues:**
- Ensure indexes exist: `\di blog_views*`
- Consider archiving old view data
- Monitor database query performance
