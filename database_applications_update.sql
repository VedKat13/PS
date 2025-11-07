-- Update applications table to store full form data
-- Run this in MySQL Workbench

USE project;

-- Check if columns exist, if not add them
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS year VARCHAR(50),
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT;

-- Also ensure we have the right column names
-- If your table uses 'userid' instead of 'applicantid', we'll handle that in the code

-- View the current structure
DESCRIBE applications;

-- View all applications
SELECT * FROM applications;
