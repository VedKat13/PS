-- Update applications table to store all form data
-- Run this SQL in your MySQL Workbench

-- First, let's see if we need to modify the existing table
-- If the table needs major changes, you may need to backup data first

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS year VARCHAR(50),
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- If the above doesn't work due to existing data structure, use this alternative:
-- (Comment out the above and uncomment below if needed)

/*
-- Backup existing applications
CREATE TABLE applications_backup AS SELECT * FROM applications;

-- Drop and recreate the applications table with all fields
DROP TABLE applications;

CREATE TABLE applications (
  applicationid INT PRIMARY KEY AUTO_INCREMENT,
  applicantid INT NOT NULL,
  postid INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  branch VARCHAR(100),
  year VARCHAR(50),
  skills TEXT,
  experience TEXT,
  motivation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicantid) REFERENCES users(userid),
  FOREIGN KEY (postid) REFERENCES eventposts(postid),
  UNIQUE KEY unique_application (applicantid, postid)
);

-- Restore basic data from backup
INSERT INTO applications (applicationid, applicantid, postid, status)
SELECT applicationid, applicantid, postid, status FROM applications_backup;
*/
