# Blog Analytics Setup Guide

Quick setup guide for enabling blog post view tracking on your Supeva Real Estate website.

## Prerequisites

- Supabase project set up
- Admin access to Supabase SQL Editor
- Project running locally or deployed

## Setup Steps

### Step 1: Run Database Migration

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-views-migration.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

The migration will:
- ✅ Create `blog_views` table
- ✅ Add `view_count` column to `blog_posts`
- ✅ Create indexes for performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create auto-increment trigger
- ✅ Add helper function for popular posts

### Step 2: Verify Installation

Run this query in SQL Editor to verify:

```sql
-- Check if table exists
SELECT * FROM blog_views LIMIT 1;

-- Check if column was added
SELECT view_count FROM blog_posts LIMIT 1;

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_blog_view_created';
```

### Step 3: Test View Tracking

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Visit any blog post**
   - Navigate to `/blog`
   - Click on any published blog post
   - You should see the view count displayed

3. **Verify in database**
   ```sql
   -- Check recent views
   SELECT * FROM blog_views ORDER BY created_at DESC LIMIT 5;

   -- Check updated view counts
   SELECT title, view_count FROM blog_posts ORDER BY view_count DESC;
   ```

## What Gets Tracked

For each blog post view, the system captures:
- ✅ **Post ID** - Which blog post was viewed
- ✅ **Timestamp** - When the view occurred
- ✅ **User Agent** - Browser/device information
- ✅ **Referrer** - Where the visitor came from
- ❌ **IP Address** - Currently disabled (privacy-first)

## Where View Count is Displayed

The view count appears on:
1. **Individual blog post pages** - Next to the read time
2. **Database** - `blog_posts.view_count` column

Example display:
```
📅 January 15, 2024  ⏱️ 5 min read  👁️ 1,234 views
```

## Analytics Queries

### Get most popular posts:
```sql
SELECT * FROM get_popular_posts(10);
```

### View breakdown by referrer:
```sql
SELECT
    referrer,
    COUNT(*) as total_views
FROM blog_views
WHERE referrer IS NOT NULL
GROUP BY referrer
ORDER BY total_views DESC
LIMIT 10;
```

### Daily view trends:
```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as views
FROM blog_views
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Important Notes

### Privacy & GDPR Compliance
- IP addresses are **NOT** collected by default
- Only anonymous data is stored (user agent, referrer)
- No personally identifiable information (PII)
- Compliant with privacy regulations

### Performance
- View tracking is **asynchronous** - won't slow down page loads
- Failed tracking **won't break** the user experience
- Indexes ensure **fast queries** on analytics data

### Security (RLS Policies)
- ✅ **Public** - Anyone can record a view
- ✅ **Admins only** - View detailed analytics data
- ❌ **Public** - Cannot query analytics data directly

## Troubleshooting

### Problem: Views not being recorded

**Check 1: RLS Policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'blog_views';
```

**Check 2: Trigger is active**
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_blog_view_created';
```

**Check 3: Browser console**
- Open DevTools → Console
- Look for any errors when visiting a blog post
- Should see no errors related to view tracking

### Problem: View count not incrementing

**Check if trigger is working:**
```sql
-- Manually insert a test view
INSERT INTO blog_views (blog_post_id)
VALUES ((SELECT id FROM blog_posts LIMIT 1));

-- Check if view_count increased
SELECT title, view_count FROM blog_posts LIMIT 1;
```

### Problem: TypeScript errors

If you see type errors:
1. Ensure `database.types.ts` is updated
2. Restart TypeScript server in VS Code: `Cmd/Ctrl + Shift + P` → "Restart TS Server"
3. Check that `view_count` is in the `blog_posts` Row type

## Next Steps

After setup, you can:

1. **Build Admin Dashboard**
   - Display popular posts
   - Show view trends
   - Analyze traffic sources

2. **Add More Tracking**
   - Reading time
   - Scroll depth
   - Click tracking

3. **Export Reports**
   - Generate CSV exports
   - Create PDF reports
   - Email analytics summaries

## Support

For detailed documentation, see:
- `BLOG_ANALYTICS.md` - Full technical documentation
- `supabase-schema.sql` - Original database schema
- `supabase-views-migration.sql` - View tracking migration

For issues or questions:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Verify RLS policies are correct
