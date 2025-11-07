-- Add form data columns to applications table
USE project;

ALTER TABLE applications 
ADD COLUMN name VARCHAR(255),
ADD COLUMN email VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN branch VARCHAR(100),
ADD COLUMN year VARCHAR(50),
ADD COLUMN skills TEXT,
ADD COLUMN experience TEXT,
ADD COLUMN motivation TEXT;
