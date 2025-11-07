-- Add userid column to applications table
ALTER TABLE applications
ADD COLUMN userid INT NOT NULL AFTER applicationid,
ADD FOREIGN KEY (userid) REFERENCES users(userid);
