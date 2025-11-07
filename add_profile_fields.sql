-- Add location and achievements columns to users table
ALTER TABLE users 
ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER bio,
ADD COLUMN achievements JSON DEFAULT NULL AFTER projects;
