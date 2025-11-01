-- Migration: Fix google_id to allow NULL properly
-- This converts existing empty strings to NULL and ensures proper UNIQUE constraint

-- Update existing empty strings to NULL
UPDATE users SET google_id = NULL WHERE google_id = '';

-- Ensure the column allows NULL (should already be the case, but making it explicit)
ALTER TABLE users MODIFY COLUMN google_id VARCHAR(100) NULL;

-- Note: UNIQUE constraint with NULL works correctly in MySQL
-- Multiple NULL values are allowed, but duplicate non-NULL values are not

