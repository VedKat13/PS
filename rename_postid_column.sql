-- Rename postId to postid to match naming convention with eventposts table
ALTER TABLE applications CHANGE COLUMN postId postid INT NOT NULL;