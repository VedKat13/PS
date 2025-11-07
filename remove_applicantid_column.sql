-- Remove the applicantId column since we're using userid instead
-- First drop the foreign key constraint
ALTER TABLE applications DROP FOREIGN KEY applications_ibfk_2;
-- Then drop the column
ALTER TABLE applications DROP COLUMN applicantId;
