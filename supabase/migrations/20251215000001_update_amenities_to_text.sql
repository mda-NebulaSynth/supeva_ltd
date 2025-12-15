-- Update amenities column from text[] to text for markdown support
-- This migration converts the amenities column in the projects table from an array to a single text field

-- First, alter the column type from text[] to text
-- We'll convert existing array data to a newline-separated text format
ALTER TABLE projects
ALTER COLUMN amenities TYPE text
USING array_to_string(amenities, E'\n- ', E'- ');

-- Set default value to empty string
ALTER TABLE projects
ALTER COLUMN amenities SET DEFAULT '';

-- Update any NULL values to empty string
UPDATE projects
SET amenities = ''
WHERE amenities IS NULL;
