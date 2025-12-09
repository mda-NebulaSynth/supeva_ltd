# Cloudflare Pages Deployment Configuration

## Build Configuration

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 18 or higher

## Environment Variables

Add these environment variables in your Cloudflare Pages project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_ANALYTICS_ID=your_ga_id (optional)
VITE_FACEBOOK_PIXEL_ID=your_fb_pixel_id (optional)
```

## Deployment Steps

### Via Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project**
3. Connect your Git repository (GitHub/GitLab)
4. Select the repository: `Supeva`
5. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Add environment variables (see above)
7. Click **Save and Deploy**

### Via Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages publish dist --project-name=supeva-sandbox
```

## Custom Domain Setup

1. In Cloudflare Pages, go to your project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow the DNS configuration instructions
6. Wait for DNS propagation (usually a few minutes)

## Redirects and Headers

Create a `public/_redirects` file for SPA routing:

```
/*    /index.html   200
```

Create a `public/_headers` file for security headers:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Performance Optimization

Cloudflare Pages automatically provides:
- Global CDN distribution
- Automatic HTTPS
- HTTP/2 and HTTP/3 support
- Brotli compression
- Smart caching

## Monitoring

- View deployment logs in Cloudflare Dashboard
- Monitor analytics in **Analytics** tab
- Set up alerts for deployment failures

## Rollback

To rollback to a previous deployment:
1. Go to **Deployments** in your project
2. Find the deployment you want to rollback to
3. Click **Rollback to this deployment**
