-- Add role column to groupmembers table
ALTER TABLE groupmembers 
ADD COLUMN role ENUM('admin', 'member') DEFAULT 'member' AFTER userid;
