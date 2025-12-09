# 📸 Supeva Sandbox - Visual Guide

## 🎨 What You'll See

### 🏠 Home Page (http://localhost:5173/)

**Hero Section**
- Full-screen gradient background (blue to purple)
- Large heading: "Find Your Dream Home"
- Subheading with description
- Two CTA buttons: "Explore Projects" and "Book a Visit"
- Animated scroll indicator at bottom

**Featured Projects Section**
- 3 project cards in a grid
- Each card shows:
  - Featured image
  - "New Listing" badge (if applicable)
  - Project title
  - Location with pin icon
  - Bedrooms, bathrooms, area icons
  - Price range
  - Arrow icon on hover

**Testimonials Section**
- Light gradient background
- 3 testimonial cards
- Star ratings
- Client photos and names
- Glassmorphism effect on cards

**Blog Preview Section**
- 3 latest blog post cards
- Featured images
  - Publish date
  - Post title and excerpt
  - "Read More" link with arrow

**CTA Section**
- Full-width gradient background
- Building icon
- "Ready to Find Your Dream Home?" heading
- "Get Started Today" button

---

### 🏢 Projects Page (http://localhost:5173/projects)

**Hero Section**
- Gradient background
- "Our Projects" heading
- Description text

**Filter Bar**
- Filter icon
- Three buttons: "All Projects", "Active", "Upcoming"
- Active filter highlighted in blue

**Projects Grid**
- Responsive grid (1 column mobile, 2 tablet, 3 desktop)
- Project cards with:
  - Large featured image
  - Badges (New Listing, Coming Soon)
  - Project details
  - Price range
  - Hover effects (image zoom, arrow slide)

---

### 📞 Contact Page (http://localhost:5173/contact)

**Hero Section**
- Gradient background
- "Contact Us" heading

**Two-Column Layout**

**Left Column - Contact Info**
- "Get in Touch" heading
- Three info cards:
  - Visit Us (with map pin icon)
  - Call Us (with phone icon)
  - Email Us (with mail icon)

**Right Column - Contact Form**
- White card with shadow
- Form fields:
  - Full Name
  - Email Address
  - Phone Number
  - Message (textarea)
- Blue "Send Message" button
- Success/error message display

---

### 🔐 Login Page (http://localhost:5173/login)

**Centered Card**
- Glassmorphism effect
- Gradient background
- Login icon in circle
- "Welcome Back" heading
- Email and password fields with icons
- Remember me checkbox
- Forgot password link
- Blue "Sign In" button
- Back to home link

---

### 🎨 Design Elements You'll Notice

#### Colors
- **Primary Blue**: Used for buttons, links, active states
- **Purple Accent**: Used in gradients and highlights
- **White/Gray**: Clean backgrounds and text

#### Typography
- **Headings**: Bold, large, using Outfit font
- **Body Text**: Clean, readable, using Inter font
- **Gradient Text**: Blue to purple gradient on special headings

#### Animations
- **Fade In**: Elements appear smoothly
- **Slide Up**: Content slides up from bottom
- **Hover Effects**: 
  - Images zoom in
  - Buttons lift up with shadow
  - Arrows slide right
  - Cards get larger shadow

#### Components
- **Buttons**: Rounded, with gradients, shadows, and hover effects
- **Cards**: White with shadows, rounded corners, hover effects
- **Badges**: Small, rounded pills with gradients
- **Inputs**: Clean borders, focus states with blue ring

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Single column layouts
- Hamburger menu in header
- Stacked navigation
- Full-width cards
- Larger touch targets

### Tablet (768px - 1024px)
- Two-column grids
- Condensed navigation
- Medium-sized cards

### Desktop (> 1024px)
- Three-column grids
- Full navigation bar
- Larger images
- Optimal spacing

---

## 🎯 Interactive Elements

### Header/Navigation
- **Scroll Effect**: Background becomes white with shadow when scrolling
- **Active Links**: Highlighted in blue
- **Mobile Menu**: Slides down with animation
- **Logo**: Scales up on hover

### Project Cards
- **Hover**: Image zooms in, shadow increases
- **Badge**: Pulses if "New Listing"
- **Arrow**: Slides right on hover

### Buttons
- **Hover**: Lifts up, shadow increases
- **Active**: Slightly pressed effect
- **Loading**: Spinner animation

### Forms
- **Focus**: Blue ring appears
- **Validation**: Red border if error
- **Success**: Green message with checkmark

---

## 🎨 Color Reference

```css
/* Primary Colors */
primary-50:  #f0f9ff
primary-600: #0284c7 (Main blue)
primary-700: #0369a1 (Dark blue)

/* Accent Colors */
accent-600: #c026d3 (Main purple)
accent-700: #a21caf (Dark purple)

/* Neutral Colors */
gray-50:  #f9fafb (Light background)
gray-600: #4b5563 (Text)
gray-900: #111827 (Dark text)
```

---

## 🖼️ Sample Content

### Projects
1. **Furaha Residences** - Kilimani, Nairobi
   - 2-4 bedrooms
   - KES 8.5M - 15M
   - Modern apartments

2. **Zuri Heights** - Westlands, Nairobi
   - 3-5 bedrooms
   - KES 12M - 25M
   - Luxury homes

3. **Marble View Estates** - Karen, Nairobi
   - 4-6 bedrooms
   - KES 18M - 35M
   - Exclusive estates (Coming Soon)

### Testimonials
- Sarah Mwangi - 5 stars
- James Omondi - 5 stars
- Grace Wanjiku - 5 stars

### Blog Posts
- "10 Tips for First-Time Home Buyers"
- "The Rise of Smart Homes in Nairobi"
- "Investment Opportunities in Karen"

---

## 🚀 How to View

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser to: http://localhost:5173

3. Navigate through pages using the header menu

4. Try different screen sizes (responsive design)

5. Hover over elements to see animations

6. Try the contact form (won't submit without Supabase setup)

---

## 📝 Notes

- **Images**: Currently using Unsplash placeholder images
- **Data**: Will be empty until Supabase is configured
- **Forms**: Will show errors until Supabase is connected
- **Admin**: Login page ready, dashboard needs to be built

---

**Enjoy exploring your new real estate website!** 🎉
