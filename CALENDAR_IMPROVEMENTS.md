# Calendar UI/UX Improvements Plan

## Overview
Enhancing the calendar interface to make posts bigger and add reschedule/delete functionality.

## Changes to Make

### 1. Make Posts Bigger
**File**: `/components/calendar/ContentCalendar.jsx`

- Increase `PostCard` padding from `sm/md` to `md/lg`
- Increase `min-height` from `120px` to `180px` for month view
- Increase font sizes for better readability
- Add more spacing between elements

### 2. Add Action Buttons to Posts
**Location**: Inside `PostCard` component

**Buttons to add:**
- **Reschedule** (Calendar icon) - Opens date/time picker
- **Delete** (Trash icon) - Deletes from calendar AND Facebook

**Behavior:**
- Show on hover (like the Edit button)
- Position at top-right alongside Edit button
- Show prominently for failed posts

### 3. Reschedule Functionality
**File**: `/app/dashboard/calendar/page.jsx`

Add `handlePostReschedule(post, newDate, newTime)` function that:
- Opens a modal/popover with date & time picker
- Updates post with new scheduled_for time
- Resets status to 'scheduled' if it was 'failed'
- Reloads calendar

### 4. Delete Functionality
**Files to update:**
- `/app/dashboard/calendar/page.jsx` - Add `handlePostDelete(post)` function
- `/app/api/posts/[postId]/route.js` - Update DELETE endpoint to also delete from Facebook

**Delete logic:**
1. If post.status === 'published':
   - Delete from Facebook using Graph API
   - Delete from database
2. If post.status === 'scheduled' or 'failed':
   - Just delete from database

**API endpoint:**
```
DELETE /api/posts/[postId]?deletefrom Facebook=true
```

### 5. New Components Needed

**RescheduleModal.jsx** - Modal with:
- Date picker
- Time picker (hour and minute selection)
- Save/Cancel buttons

## User Workflow

### Reschedule:
1. User hovers over post card
2. Clicks "Reschedule" icon
3. Modal opens with current scheduled time pre-filled
4. User selects new date/time
5. Clicks "Save"
6. Post updates and calendar refreshes

### Delete:
1. User hovers over post card
2. Clicks "Delete" icon
3. Confirmation dialog: "Delete this post? This will also remove it from Facebook if it was published."
4. User confirms
5. Post deleted from both places
6. Calendar refreshes

## Visual Changes
- Posts will be **1.5x bigger** for better visibility
- Failed posts show red border + prominent Reschedule button
- Action buttons (Edit, Reschedule, Delete) appear on hover
- Better spacing and typography

Would you like me to proceed with these changes?
