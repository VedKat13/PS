# Quick Setup Guide - Event Details Enhancement

## Step 1: Run the SQL Migration

You need to run the SQL file to add the new columns to your database.

### Option A: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `add_event_details_columns.sql`
4. Click "Execute" (lightning bolt icon)

### Option B: Using MySQL Command Line
```bash
# If you have a password
mysql -u root -p project < add_event_details_columns.sql

# If no password
mysql -u root project < add_event_details_columns.sql
```

### Option C: Copy-Paste SQL
Open your MySQL client and run this:

```sql
USE project;

ALTER TABLE eventposts
ADD COLUMN eventDate DATETIME AFTER expirationTime,
ADD COLUMN eventStartTime TIME AFTER eventDate,
ADD COLUMN eventEndTime TIME AFTER eventStartTime,
ADD COLUMN location VARCHAR(255) AFTER eventEndTime,
ADD COLUMN venue TEXT AFTER location,
ADD COLUMN maxParticipants INT AFTER venue,
ADD COLUMN currentParticipants INT DEFAULT 0 AFTER maxParticipants,
ADD COLUMN prizes TEXT AFTER currentParticipants,
ADD COLUMN organizerEmail VARCHAR(255) AFTER prizes,
ADD COLUMN organizerPhone VARCHAR(50) AFTER organizerEmail,
ADD COLUMN imageUrl VARCHAR(500) AFTER organizerPhone;

-- Verify
DESCRIBE eventposts;
```

## Step 2: Test the Implementation

Once the SQL migration is complete:

1. **Restart your backend server** (if it's running)
2. **Go to Create Event page** (`/create-event`)
3. **Fill in the new fields:**
   - Event Date (when the event happens)
   - Start/End Time
   - Location (e.g., "Online", "New York", "Campus")
   - Venue (detailed address or meeting link)
   - Max Participants
   - Prizes (describe the incentives)
   - Organizer Email & Phone
   - Event Banner URL (image link)
4. **Submit the event**
5. **Go to Events page** and **click "View Details"** on your event
6. **Verify** all the new information displays correctly

## What Was Changed

### Database
- ✅ Added 11 new columns to `eventposts` table

### Backend (`server/src/controllers/eventController.ts`)
- ✅ Updated `createEvent` to save all new fields
- ✅ Updated `updateEvent` to update all new fields

### Frontend

**CreateEvent.tsx**
- ✅ Added form fields for all 11 new columns
- ✅ Updated form submission to send new data

**EventDetailsDialog.tsx**
- ✅ Displays event banner image
- ✅ Shows event date & time
- ✅ Shows location & venue
- ✅ Shows participant count (current/max)
- ✅ Shows prizes section
- ✅ Shows contact information (email & phone)

**EventCard.tsx**
- ✅ Passes all new fields to dialog

**Events.tsx**
- ✅ Maps all new fields from backend response

## New Fields Available

| Field | Type | Description |
|-------|------|-------------|
| eventDate | DATETIME | Actual event date/time |
| eventStartTime | TIME | Event start time |
| eventEndTime | TIME | Event end time |
| location | VARCHAR(255) | City, venue name, or "Online" |
| venue | TEXT | Detailed address or meeting link |
| maxParticipants | INT | Maximum allowed participants |
| currentParticipants | INT | Current registration count |
| prizes | TEXT | Prize details and incentives |
| organizerEmail | VARCHAR(255) | Contact email |
| organizerPhone | VARCHAR(50) | Contact phone |
| imageUrl | VARCHAR(500) | Event banner/poster URL |

## Example Event with All Fields

```json
{
  "title": "Hackathon 2025",
  "description": "48-hour coding marathon with amazing prizes!",
  "requiredSkills": "JavaScript,React,Node.js",
  "expirationTime": "2025-12-20T23:59:00",
  "eventDate": "2025-12-25T09:00:00",
  "eventStartTime": "09:00",
  "eventEndTime": "17:00",
  "location": "Online",
  "venue": "Zoom: https://zoom.us/j/123456789",
  "maxParticipants": 100,
  "prizes": "1st: $1000, 2nd: $500, 3rd: $250, Certificates for all",
  "organizerEmail": "events@techclub.com",
  "organizerPhone": "+1234567890",
  "imageUrl": "https://example.com/banner.jpg"
}
```

## Troubleshooting

### "Column already exists" error
The columns were already added. You can skip the migration.

### "Unknown column" error in backend
Make sure you ran the SQL migration and restarted the backend server.

### Fields not showing in dialog
Check browser console for errors. Make sure the backend is returning the new fields.

### Image not displaying
The imageUrl must be a valid, publicly accessible URL. Test it in your browser first.

## Next Steps (Optional)

Want to add more features? Check `EVENTPOSTS_ENHANCEMENT_SUGGESTIONS.md` for:
- Certificate offering flag
- Event categories
- Difficulty levels
- Registration fees
- Team size limits
- And 20+ more suggestions!
