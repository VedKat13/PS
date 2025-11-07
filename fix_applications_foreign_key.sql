-- Fix the applications foreign key to allow CASCADE delete
-- Drop the existing constraint
ALTER TABLE applications DROP FOREIGN KEY applications_ibfk_3;

-- Add the constraint back with ON DELETE CASCADE
ALTER TABLE applications 
ADD CONSTRAINT applications_ibfk_3 
FOREIGN KEY (userid) REFERENCES users(userId) ON DELETE CASCADE;
