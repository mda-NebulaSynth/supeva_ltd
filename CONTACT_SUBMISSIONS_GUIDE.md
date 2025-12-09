# Contact Submissions Feature - Implementation Guide

Complete implementation of contact form and submissions management for the Supeva Real Estate website.

## Overview

The contact submissions system allows visitors to submit inquiries through the website, and enables administrators to manage, track, and respond to these submissions efficiently.

## Components

### 1. **ContactPage Component** (`src/pages/ContactPage.tsx`)
- Public-facing contact form
- Features:
  - Contact information display
  - Form with validation
  - Success/error notifications
  - WhatsApp quick contact link
  - Responsive design

### 2. **ContactsManager Component** (`src/pages/admin/ContactsManager.tsx`)
- Admin interface for managing submissions
- Features:
  - View all submissions with status filtering
  - Search functionality across all fields
  - Detailed view modal for each submission
  - Status management (New → Contacted → Closed)
  - Quick actions (Email, WhatsApp, Delete)
  - Statistics dashboard
  - Project reference linking

## Database Schema

The `contact_submissions` table (already exists in Supabase):

```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed'))
);
```

**Fields:**
- `name` - Contact person's full name
- `email` - Contact email address
- `phone` - Contact phone number
- `message` - Inquiry message
- `project_id` - Optional reference to specific project
- `status` - Workflow status: new, contacted, or closed

## Workflow States

### 1. **New** (🆕)
- Initial state when submission is received
- Requires immediate attention
- Color: Blue

### 2. **Contacted** (📞)
- Admin has reached out to the customer
- Awaiting response or follow-up
- Color: Yellow

### 3. **Closed** (✅)
- Inquiry resolved or completed
- No further action needed
- Color: Gray

## Admin Access

**URL:** `/admin/contacts`

The admin panel provides:
- **Dashboard Stats**: Total, New, Contacted, Closed counts
- **Filter by Status**: Quick status filtering
- **Search**: Search across name, email, phone, message
- **List View**: All submissions with key info
- **Detail Modal**: Full submission details with actions
- **Status Update**: One-click status changes
- **Quick Actions**: Email, WhatsApp, Delete

## Usage Instructions

### For Website Visitors:

1. **Navigate to Contact Page** (`/contact`)
2. **Fill in the Form**:
   - Full Name (required)
   - Email Address (required)
   - Phone Number (required)
   - Message (required)
3. **Click "Send Message"**
4. **Confirmation**: Success message appears
5. **Response**: Admin will contact via email or phone

### For Administrators:

#### Viewing Submissions

1. **Navigate to** `/admin/contacts`
2. **Dashboard Overview**:
   - See total submissions
   - View count by status
   - Identify new inquiries needing attention

3. **Filter & Search**:
   - Filter by status (All, New, Contacted, Closed)
   - Search by name, email, phone, or message text

#### Managing a Submission

1. **Click on any submission** to open details
2. **View Information**:
   - Contact details (with click-to-call/email)
   - Full message
   - Related project (if any)
   - Submission timestamp

3. **Update Status**:
   - Click status buttons to change state
   - **New** → For unprocessed inquiries
   - **Contacted** → After reaching out
   - **Closed** → When resolved

4. **Quick Actions**:
   - **Send Email**: Opens email client with pre-filled subject
   - **WhatsApp**: Opens WhatsApp web with greeting message
   - **Delete**: Permanently removes submission (with confirmation)

#### Response Workflow

**Recommended Process:**

1. **Daily Review**:
   - Check for new submissions
   - Prioritize by urgency/project value

2. **Initial Contact**:
   - Use "Send Email" or "WhatsApp" button
   - Respond within 24 hours for best results
   - Change status to "Contacted"

3. **Follow-up**:
   - Track conversations
   - Set reminders for follow-ups
   - Update notes externally if needed

4. **Resolution**:
   - When inquiry is resolved
   - Change status to "Closed"
   - Optionally delete if no longer needed

### For Developers:

The contact form submission is handled in ContactPage.tsx:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
        .from('contact_submissions')
        .insert(formData);

    if (error) throw error;
    // Show success message
};
```

To pre-fill project_id (e.g., from project detail page):

```tsx
// In ProjectDetailPage or similar
<Link to="/contact?project=project-id">Contact About This Project</Link>

// In ContactPage, read from URL params:
const searchParams = new URLSearchParams(location.search);
const projectId = searchParams.get('project');

// Include in form data:
const formData = {
    name: '',
    email: '',
    phone: '',
    message: '',
    project_id: projectId || null
};
```

## Features Breakdown

### Search Functionality
- Searches across: name, email, phone, message
- Real-time filtering as you type
- Clear button to reset search

### Status Filtering
- Quick filter dropdown
- Shows only relevant submissions
- Maintains search query when changing filters

### Statistics Dashboard
- **Total Submissions**: All-time count
- **New**: Unprocessed inquiries
- **Contacted**: In-progress
- **Closed**: Resolved/archived

### Detail Modal
- Full-screen overlay
- Complete submission information
- One-click actions
- Status update buttons

### Quick Actions
1. **Email**: `mailto:` link with pre-filled data
2. **WhatsApp**: Direct link to WhatsApp Web
3. **Delete**: Remove submission (permanent)

## Security

Row Level Security (RLS) policies:
- **Public**: Can insert contact submissions
- **Admins**: Can view, update, delete all submissions
- **Public**: Cannot view submissions (privacy protection)

## Best Practices

### Response Times
- **New Inquiries**: Respond within 24 hours
- **Follow-ups**: Within 2-3 business days
- **Hot Leads**: Same day response

### Communication
- **Be Professional**: Use proper greetings and signatures
- **Be Specific**: Reference their inquiry details
- **Be Helpful**: Provide clear next steps

### Data Management
- **Regular Reviews**: Check new submissions daily
- **Status Updates**: Keep statuses current
- **Cleanup**: Archive/delete old closed submissions periodically

### Privacy
- **Respect Privacy**: Don't share customer data
- **Secure Access**: Only admin/staff roles have access
- **Data Retention**: Delete old submissions per policy

## Email Templates

### Initial Response

```
Subject: Re: Your inquiry - Supeva Real Estate

Hi [Name],

Thank you for contacting Supeva Real Estate!

I received your inquiry about [project/topic]. I'd be happy to help you with [specific need].

[Provide relevant information or next steps]

When would be a good time for a call to discuss this further?

Best regards,
[Your Name]
Supeva Real Estate
Phone: [Your Phone]
Email: [Your Email]
```

### Follow-up

```
Subject: Following up on your inquiry

Hi [Name],

I wanted to follow up on our previous conversation about [topic].

[Update or additional information]

Please let me know if you have any questions or if there's anything else I can help you with.

Best regards,
[Your Name]
```

## Common Scenarios

### Scenario 1: General Inquiry
- **Status**: New → Contacted
- **Action**: Send email with general information
- **Follow-up**: 2-3 days later

### Scenario 2: Specific Project Inquiry
- **Status**: New → Contacted
- **Action**: Send project brochure, schedule viewing
- **Follow-up**: Same day or next day

### Scenario 3: Callback Request
- **Status**: New → Contacted
- **Action**: Call immediately via click-to-call
- **Follow-up**: Update status based on call outcome

### Scenario 4: Spam/Invalid
- **Status**: New → Closed
- **Action**: Delete immediately
- **Follow-up**: None

## Troubleshooting

**Submissions not appearing:**
- Check RLS policies in Supabase
- Verify form is submitting successfully
- Check browser console for errors

**Cannot update status:**
- Ensure admin is logged in
- Check user role permissions
- Verify Supabase connection

**Email/WhatsApp links not working:**
- Check contact information format
- Verify phone number includes country code
- Test with different browsers

**Search not finding results:**
- Check spelling
- Try partial search terms
- Clear filters and try again

## Analytics & Reporting

Track these metrics for better performance:

1. **Response Rate**: % of inquiries responded to
2. **Response Time**: Average time to first response
3. **Conversion Rate**: % of inquiries that convert to clients
4. **Common Questions**: Most frequent inquiry topics
5. **Peak Times**: When most submissions occur

### Export Data (Future Enhancement)

```sql
-- Export last 30 days of submissions
SELECT
    name,
    email,
    phone,
    message,
    status,
    created_at
FROM contact_submissions
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

## Future Enhancements

Potential improvements:
1. **Email Integration**: Auto-send confirmation emails
2. **CRM Integration**: Sync with sales CRM
3. **Notes Field**: Add internal notes to submissions
4. **Assignment**: Assign submissions to team members
5. **Tags**: Categorize inquiries
6. **Automated Responses**: Send auto-reply on submission
7. **Analytics Dashboard**: Visualize submission trends
8. **Export to CSV**: Download submission data
9. **Email Templates**: Built-in response templates
10. **Scheduling**: Integrate calendar for bookings

## Integration Points

### Connect with Other Features

**Projects**:
- Link submission to specific project inquiry
- Show project name in admin panel
- Filter by project

**Team Members**:
- Assign submissions to specific agents
- Track response by team member

**CRM/Email Marketing**:
- Export contacts to mailing list
- Sync with email campaigns

## Files Modified/Created

**Created:**
- `src/pages/admin/ContactsManager.tsx` - Admin management interface
- `CONTACT_SUBMISSIONS_GUIDE.md` - This documentation

**Modified:**
- `src/App.tsx` - Added `/admin/contacts` route

**Existing (already working):**
- `src/pages/ContactPage.tsx` - Public contact form (already existed)
- `supabase-schema.sql` - contact_submissions table already defined
- `src/lib/database.types.ts` - contact_submissions types already defined

## Summary

The contact submissions feature is now fully functional with:
- ✅ Public contact form at `/contact`
- ✅ Admin management at `/admin/contacts`
- ✅ Status workflow (New → Contacted → Closed)
- ✅ Search and filter functionality
- ✅ Quick action buttons (Email, WhatsApp)
- ✅ Statistics dashboard
- ✅ Project reference linking
- ✅ Responsive design
- ✅ RLS security

Administrators can now efficiently manage and respond to customer inquiries, improving customer service and conversion rates.
