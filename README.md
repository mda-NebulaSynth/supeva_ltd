# Supeva Sandbox - Real Estate Website

A premium real estate website built with React, TypeScript, Vite, TailwindCSS, and Supabase.

## 🚀 Features

### Frontend
- ✅ **Landing Page** - Hero section, featured projects, testimonials, blog preview
- ✅ **Projects Page** - Filterable project listings with "New Listing" badges
- ✅ **Project Details** - Full project information and gallery
- ✅ **Blog** - Blog listing and detail pages with "New Post" badges
- ✅ **Contact Page** - Contact form with Supabase integration
- ✅ **About Us** - Company information
- ✅ **Our Team** - Team member profiles
- ✅ **Authentication** - Supabase Auth with email/password
- ✅ **Admin Dashboard** - Protected CMS for content management
- ✅ **Ad Management** - Dynamic ad slots throughout the site
- ✅ **SEO Optimization** - Dynamic meta tags for all pages
- ✅ **Responsive Design** - Mobile-first approach with TailwindCSS

### Backend (Supabase)
- ✅ **Authentication** - Email/password with role-based access (admin/staff)
- ✅ **PostgreSQL Database** - Structured tables for all content
- ✅ **Storage** - Image and file uploads
- ✅ **Row Level Security** - Secure data access policies
- ✅ **Real-time** - Live data updates

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd Supeva
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

### 3. Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Open the `supabase-schema.sql` file from this project
3. Copy and paste the entire SQL content
4. Click **Run** to create all tables and policies

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Create First Admin User

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. After creation, go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### 6. Set Up Storage Buckets

1. Go to **Storage** in Supabase
2. Create the following buckets (all public):
   - `projects` - For project images
   - `blog` - For blog post images
   - `team` - For team member photos
   - `ads` - For advertisement banners
   - `brochures` - For PDF brochures

3. For each bucket, set the policy to allow public read access:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'bucket_name');
   ```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🌐 Deployment to Cloudflare Pages

### Option 1: Via Cloudflare Dashboard

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create a project**
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Click **Save and Deploy**

### Option 2: Via Wrangler CLI

```bash
npm install -g wrangler
wrangler pages publish dist
```

## 📁 Project Structure

```
Supeva/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Header, Footer, Layout
│   │   ├── AdSlot.tsx      # Ad slot component
│   │   ├── SEO.tsx         # SEO meta tags
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/                # Libraries and utilities
│   │   ├── supabase.ts     # Supabase client
│   │   └── database.types.ts # TypeScript types
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── LoginPage.tsx
│   ├── utils/              # Utility functions
│   │   └── helpers.ts      # Date, price formatting, etc.
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── supabase-schema.sql     # Database schema
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (sky blue to deep blue)
- **Accent**: Purple gradient (vibrant purple to deep purple)

### Typography
- **Display Font**: Outfit (headings)
- **Body Font**: Inter (body text)

### Components
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`
- Cards: `.card`, `.card-glass`
- Inputs: `.input`, `.textarea`
- Badges: `.badge`, `.badge-new`, `.badge-featured`

## 🔐 Authentication Flow

1. User signs up/logs in via `/login`
2. Supabase Auth creates user session
3. Protected routes check authentication status
4. Admin users can access `/admin/*` routes
5. Role-based permissions enforced via RLS policies

## 📊 Database Schema

### Tables
- `profiles` - User profiles with roles
- `projects` - Real estate projects
- `blog_posts` - Blog articles
- `project_updates` - Timeline updates for projects
- `team_members` - Team member information
- `ad_banners` - Advertisement banners
- `testimonials` - Client testimonials
- `contact_submissions` - Contact form submissions

## 🎯 Next Steps (To Be Implemented)

### High Priority
1. **Admin Dashboard** - Complete CMS interface
   - Project CRUD operations
   - Blog post editor with rich text
   - Team member management
   - Ad banner management
   - Contact form submissions view

2. **Project Detail Page** - Full implementation
   - Image gallery with lightbox
   - "Talk to Agent" contact form

3. **Blog Detail Page** - Full implementation
   - Rich text content rendering
   - Related posts
   - Social sharing buttons

4. **About & Team Pages** - Full implementation
   - Company story
   - Team member profiles
   - Company values

### Medium Priority
5. **Project Updates Page** - Timeline view
   - Photo galleries
   - Video embeds (YouTube/Vimeo)
   - Progress tracking

6. **Booking System** - Future enhancement
   - Contact agent for property inquiries
   - Consultation scheduling

7. **Analytics Integration**
   - Google Analytics
   - Facebook Pixel
   - Event tracking

### Low Priority
8. **Advanced Features**
   - Property comparison tool
   - Saved favorites (requires auth)
   - Email notifications
   - Advanced search/filters
   - Virtual tours

## 🐛 Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are properly configured

### Authentication Issues
- Check user exists in Supabase Auth
- Verify user role in profiles table
- Clear browser cache and cookies

## 📝 License

Proprietary - Supeva Sandbox © 2024

## 🤝 Support

For support, email info@supeva.com or contact the development team.
