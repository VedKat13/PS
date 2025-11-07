# EventPosts Table Enhancement Suggestions

## Current Columns
The `eventposts` table currently has:
- `postid` (Primary Key)
- `creatorId` (Foreign Key to users)
- `title`
- `description`
- `requiredSkills` (comma-separated string)
- `expirationTime` (registration deadline)
- `createdAt`
- `creatorName` (from JOIN with users table)

## Suggested Additional Columns

### Event Timing & Location
1. **eventDate** (DATETIME)
   - The actual date when the event takes place
   - Different from `createdAt` and `expirationTime`
   
2. **eventStartTime** (TIME)
   - Start time of the event
   
3. **eventEndTime** (TIME)
   - End time of the event
   
4. **duration** (VARCHAR)
   - Event duration (e.g., "2 days", "48 hours", "1 week")
   
5. **location** (VARCHAR)
   - Physical location or "Online"
   
6. **venue** (TEXT)
   - Detailed venue information (room number, building, etc.)
   
7. **meetingLink** (VARCHAR)
   - Zoom/Teams/Meet link for online events

### Participation Details
8. **maxParticipants** (INT)
   - Maximum number of participants allowed
   
9. **minTeamSize** (INT)
   - Minimum team size (for hackathons/projects)
   
10. **maxTeamSize** (INT)
    - Maximum team size
    
11. **currentParticipants** (INT)
    - Current number of applicants/participants
    
12. **participationType** (ENUM)
    - 'individual', 'team', 'both'

### Event Classification
13. **category** (ENUM or VARCHAR)
    - 'hackathon', 'workshop', 'competition', 'project', 'seminar', 'webinar'
    
14. **difficulty** (ENUM)
    - 'beginner', 'intermediate', 'advanced', 'all-levels'
    
15. **tags** (TEXT)
    - Comma-separated tags for better searchability
    
16. **domain** (VARCHAR)
    - Technical domain (e.g., "Web Development", "AI/ML", "Blockchain")

### Incentives & Requirements
17. **prizes** (TEXT)
    - Prize information (could be JSON for structured data)
    
18. **certificateOffered** (BOOLEAN)
    - Whether participants get certificates
    
19. **eligibility** (TEXT)
    - Eligibility criteria (e.g., "College students only", "Open to all")
    
20. **prerequisites** (TEXT)
    - Required knowledge or tools
    
21. **registrationFee** (DECIMAL)
    - Registration fee (0 for free events)

### Organizer Information
22. **organizerName** (VARCHAR)
    - Organization/club name
    
23. **organizerEmail** (VARCHAR)
    - Contact email for queries
    
24. **organizerPhone** (VARCHAR)
    - Contact phone number
    
25. **websiteUrl** (VARCHAR)
    - Event website or landing page
    
26. **socialMediaLinks** (JSON or TEXT)
    - Links to event pages on social media

### Event Details
27. **agenda** (TEXT)
    - Event schedule/agenda
    
28. **rules** (TEXT)
    - Competition rules or guidelines
    
29. **judging Criteria** (TEXT)
    - How participants will be evaluated
    
30. **resources** (TEXT)
    - Links to helpful resources, APIs, datasets
    
31. **imageUrl** (VARCHAR)
    - Event banner/poster image URL
    
32. **attachments** (JSON)
    - Links to PDFs, documents, etc.

### Administrative
33. **status** (ENUM)
    - 'draft', 'published', 'ongoing', 'completed', 'cancelled'
    
34. **visibility** (ENUM)
    - 'public', 'private', 'inviteOnly'
    
35. **featured** (BOOLEAN)
    - Whether to highlight this event on homepage
    
36. **approvalRequired** (BOOLEAN)
    - Whether applications need manual approval

## Priority Recommendations

### High Priority (Implement First)
These will provide the most value immediately:

1. **eventDate** - Crucial for event planning
2. **category** - Better organization and filtering
3. **maxParticipants** - Capacity management
4. **prizes** - Increases participation
5. **eligibility** - Helps users understand if they can apply
6. **organizerEmail** - Contact for queries
7. **status** - Event lifecycle management
8. **imageUrl** - Better visual appeal

### Medium Priority
These enhance user experience:

9. **location/venue** - Important for physical events
10. **meetingLink** - Essential for online events
11. **minTeamSize/maxTeamSize** - Team-based events
12. **difficulty** - Helps users gauge if event suits them
13. **certificateOffered** - Motivates participation
14. **tags** - Improves searchability

### Low Priority
Nice to have features:

15. **duration** - Can be calculated from start/end times
16. **agenda** - Detailed schedule
17. **rules** - For competitions
18. **resources** - Helpful links
19. **attachments** - Supporting documents
20. **featured** - Marketing feature

## Implementation Strategy

### Phase 1: Basic Event Information
```sql
ALTER TABLE eventposts
ADD COLUMN eventDate DATETIME,
ADD COLUMN category VARCHAR(50) DEFAULT 'event',
ADD COLUMN maxParticipants INT,
ADD COLUMN currentParticipants INT DEFAULT 0,
ADD COLUMN imageUrl VARCHAR(500);
```

### Phase 2: Enhanced Details
```sql
ALTER TABLE eventposts
ADD COLUMN location VARCHAR(255),
ADD COLUMN meetingLink VARCHAR(500),
ADD COLUMN prizes TEXT,
ADD COLUMN eligibility TEXT,
ADD COLUMN organizerEmail VARCHAR(255);
```

### Phase 3: Advanced Features
```sql
ALTER TABLE eventposts
ADD COLUMN minTeamSize INT DEFAULT 1,
ADD COLUMN maxTeamSize INT DEFAULT 1,
ADD COLUMN difficulty ENUM('beginner', 'intermediate', 'advanced', 'all-levels') DEFAULT 'all-levels',
ADD COLUMN status ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled') DEFAULT 'published',
ADD COLUMN certificateOffered BOOLEAN DEFAULT FALSE,
ADD COLUMN tags TEXT;
```

## UI Updates Required

When adding these columns, update:

1. **CreateEvent.tsx** - Add form fields for new columns
2. **EventDetailsDialog.tsx** - Display new information
3. **EventCard.tsx** - Show relevant snippets (category badge, participant count)
4. **eventController.ts** - Include new fields in queries
5. **API routes** - Accept and validate new data

## Example Enhanced Event Details Dialog Layout

```
┌─────────────────────────────────────────────┐
│ Hackathon 2025                    [X]       │
├─────────────────────────────────────────────┤
│ Badges: [Your Event] [Active] [Featured]   │
│                                             │
│ [Event Banner Image]                        │
│                                             │
│ 📝 Description                              │
│ Join us for an exciting 48-hour...          │
│                                             │
│ 📅 Event Details                            │
│ • Date: Dec 31, 2025                        │
│ • Time: 9:00 AM - 5:00 PM                   │
│ • Duration: 2 days                          │
│ • Location: Seminar Hall, Building A        │
│ • Category: Hackathon                       │
│ • Difficulty: Intermediate                  │
│                                             │
│ 👥 Participation                            │
│ • Team Size: 2-4 members                    │
│ • Max Participants: 100                     │
│ • Registered: 45/100                        │
│ • Type: Team-based                          │
│                                             │
│ 🏆 Incentives                               │
│ • Prizes: 1st: $1000, 2nd: $500, 3rd: $250 │
│ • Certificate: Yes                          │
│                                             │
│ 🎯 Requirements                             │
│ • Required Skills: JavaScript, React, Node  │
│ • Eligibility: College students only        │
│ • Prerequisites: Basic web development      │
│                                             │
│ 👤 Organizer                                │
│ • Organized by: John Doe                    │
│ • Organization: Tech Club                   │
│ • Contact: events@techclub.com              │
│                                             │
│ 🔗 Links                                    │
│ • Website • Rules • Resources               │
│                                             │
│              [Close]  [Apply Now]           │
└─────────────────────────────────────────────┘
```

## Notes

- Consider using JSON columns for complex data (prizes structure, social media links)
- Add appropriate indexes on frequently queried columns (category, status, eventDate)
- Update the backend validation to ensure data integrity
- Create migration scripts to add columns incrementally
- Test thoroughly after each phase of implementation
