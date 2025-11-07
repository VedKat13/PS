-- Add foreign key constraint for postid to link applications to events
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_eventposts 
FOREIGN KEY (postid) REFERENCES eventposts(postid) ON DELETE CASCADE;
