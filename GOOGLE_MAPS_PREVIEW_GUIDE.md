# Google Maps Preview Feature - Implementation Guide

Smart location field with automatic Google Maps link detection and preview.

## Overview

The location field in the ProjectsManager now intelligently detects Google Maps URLs and provides a visual preview, making it easy for admins to add map locations to projects.

## Features

### 1. **Smart URL Detection**

The system automatically detects various Google Maps URL formats:

**Supported Formats:**
- Short links: `https://maps.app.goo.gl/KTsfhJb3dyPuTaZV8`
- Short links (alternative): `https://goo.gl/maps/...`
- Full URLs: `https://www.google.com/maps/...`
- Without protocol: `maps.app.goo.gl/KTsfhJb3dyPuTaZV8` (auto-adds https://)

### 2. **Visual Preview**

When a Google Maps link is detected:
- Large map pin icon displayed
- "Google Maps Location Detected" message
- Clickable preview area
- Link to open in new tab
- Full URL shown for verification

### 3. **Dual Input Support**

The location field accepts two types of input:

**Text Address:**
```
Nairobi, Kenya
123 Main Street, Westlands
Karen, Nairobi
```

**Google Maps URL:**
```
https://maps.app.goo.gl/KTsfhJb3dyPuTaZV8
```

## How It Works

### For Administrators

#### Adding a Location with Google Maps

1. **Navigate to Projects Manager** (`/admin/projects`)
2. **Click "Add Project"** or **Edit existing project**
3. **In the Location field**, you have two options:

   **Option A: Text Address**
   - Type: `Westlands, Nairobi, Kenya`
   - No preview shown

   **Option B: Google Maps Link**
   - Go to Google Maps
   - Find your location
   - Click "Share" button
   - Copy the share link
   - Paste into Location field: `https://maps.app.goo.gl/xxx`
   - Preview appears automatically!

4. **Save the project**

#### Getting a Google Maps Link

1. **Open Google Maps** (https://maps.google.com)
2. **Search for your location**
3. **Click the "Share" button**
4. **Click "Copy link"**
5. **Paste into location field**

Example link:
```
https://maps.app.goo.gl/KTsfhJb3dyPuTaZV8
```

### For Developers

#### URL Detection Logic

```typescript
const extractGoogleMapsUrl = (input: string): string | null => {
    const googleMapsPatterns = [
        /maps\.app\.goo\.gl\/[A-Za-z0-9]+/,
        /google\.com\/maps/,
        /goo\.gl\/maps/
    ];

    const isGoogleMapsUrl = googleMapsPatterns.some(pattern =>
        pattern.test(input)
    );

    if (isGoogleMapsUrl) {
        // Ensure https:// protocol
        return input.startsWith('http') ? input : `https://${input}`;
    }

    return null;
};
```

#### Location Change Handler

```typescript
const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value });

    // Check if it's a Google Maps URL
    const mapsUrl = extractGoogleMapsUrl(value);
    if (mapsUrl) {
        setMapPreviewUrl(mapsUrl);
    } else {
        setMapPreviewUrl(null);
    }
};
```

## UI Components

### Preview Card

When a Maps URL is detected, shows:

```
┌─────────────────────────────────┐
│ Map Preview    [Open in Maps] → │
├─────────────────────────────────┤
│                                 │
│          📍 (map pin icon)      │
│                                 │
│   Google Maps Location Detected │
│      Click to view full map     │
│                                 │
│  https://maps.app.goo.gl/...   │
│                                 │
└─────────────────────────────────┘
💡 This Google Maps link will be
   saved and can be used on your
   project page
```

### Visual Elements

**Icon:**
- 64×64 px map pin icon
- Primary color (#0EA5E9)
- SVG for crispness

**Preview Area:**
- 264px height
- Rounded corners
- Border with hover effect
- Clickable (opens in new tab)

**Link Display:**
- Monospace font
- Primary color
- Word break for long URLs
- Max width constraint

## Benefits

### 1. **Ease of Use**
- No need to convert URLs manually
- Automatic detection
- Visual confirmation

### 2. **Flexibility**
- Accepts text or URLs
- Works with multiple URL formats
- Backward compatible

### 3. **User Experience**
- Clear visual feedback
- Quick preview
- Direct link to full map

### 4. **Data Storage**
- Stores actual Google Maps URL
- Can be used to embed maps later
- Links remain functional

## Use Cases

### Residential Projects
```
Location: https://maps.app.goo.gl/abcd1234
Preview: ✓ Shows map pin
Result: Customers can click to see exact location
```

### Commercial Properties
```
Location: CBD, Nairobi or https://maps.app.goo.gl/xyz789
Preview: Text shows no preview, URL shows preview
```

### Multiple Locations
```
Location: Multiple sites - Westlands, Karen, Runda
Note: Use text for multiple locations
```

## Technical Details

### State Management

```typescript
const [mapPreviewUrl, setMapPreviewUrl] = useState<string | null>(null);
```

### Reset on Form Clear

```typescript
const resetForm = () => {
    // ... other resets
    setMapPreviewUrl(null);
};
```

### Load on Edit

```typescript
const handleEdit = (project: Project) => {
    // ... set form data
    const mapsUrl = extractGoogleMapsUrl(project.location);
    setMapPreviewUrl(mapsUrl);
};
```

## Accessibility

### ARIA Labels
- Preview area is clickable link
- "Open in new tab" icon
- Screen reader friendly

### Keyboard Navigation
- Tab to location input
- Type or paste URL
- Tab to preview link
- Enter to open

### Visual Indicators
- Clear label "Map Preview"
- Icon for visual users
- Text for screen readers

## Future Enhancements

Potential improvements:

1. **Embedded Map**
   - Show actual interactive map in iframe
   - Requires Google Maps Embed API key

2. **Coordinate Extraction**
   - Parse lat/lng from URL
   - Store separately in database

3. **Address Validation**
   - Verify text addresses
   - Suggest corrections

4. **Multiple Formats**
   - Support Apple Maps
   - Support Waze
   - Support OpenStreetMap

5. **Geocoding**
   - Convert text address to coordinates
   - Auto-generate map link

6. **Map Customization**
   - Choose zoom level
   - Select map type (satellite, terrain)
   - Add markers

## Browser Compatibility

✅ **Tested On:**
- Chrome (desktop/mobile)
- Firefox
- Safari (desktop/mobile)
- Edge

✅ **Features:**
- URL detection: All browsers
- Link preview: All browsers
- External links: All browsers

## Example Workflow

### Complete Example

1. **Admin opens project form**
2. **Fills in project details**
3. **For location, goes to Google Maps**
4. **Searches**: "Karen, Nairobi, Kenya"
5. **Clicks Share → Copy link**
6. **Gets**: `https://maps.app.goo.gl/KTsfhJb3dyPuTaZV8`
7. **Pastes into location field**
8. **Preview appears immediately**
9. **Clicks preview to verify** (opens in new tab)
10. **Submits form**
11. **Location saved with Maps URL**

## Code Changes

### Files Modified

**src/pages/admin/ProjectsManager.tsx:**
- Added `mapPreviewUrl` state
- Added `extractGoogleMapsUrl()` function
- Added `handleLocationChange()` function
- Updated `resetForm()` to clear preview
- Updated `handleEdit()` to load preview
- Enhanced location field UI with preview

### New Features
- ✅ Automatic Google Maps URL detection
- ✅ Visual preview with map pin icon
- ✅ Clickable preview to open full map
- ✅ Support for multiple URL formats
- ✅ Helper text and guidance
- ✅ Mobile-responsive design

## Summary

The Google Maps preview feature provides:

- 🔍 **Smart Detection**: Automatically recognizes Maps URLs
- 👁️ **Visual Preview**: Shows map pin and link
- 🔗 **Quick Access**: Click to open in Google Maps
- 📝 **Flexible Input**: Text address or Maps URL
- 💾 **Data Storage**: Saves URL for future use
- 📱 **Mobile Friendly**: Works on all devices
- ♿ **Accessible**: Screen reader compatible

This enhancement makes it significantly easier for administrators to add accurate, linkable locations to their real estate projects!
