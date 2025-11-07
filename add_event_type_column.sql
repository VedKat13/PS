-- Add eventType column to categorize events as event/hackathon/project
-- Run this SQL migration in your MySQL database

USE project;

ALTER TABLE eventposts
ADD COLUMN eventType ENUM('event', 'hackathon', 'project') DEFAULT 'event' AFTER title;

-- Verify the changes
DESCRIBE eventposts;
