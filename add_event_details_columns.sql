-- Add high-priority event detail columns to eventposts table
-- Run this SQL migration in your MySQL database

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

-- Verify the changes
DESCRIBE eventposts;
