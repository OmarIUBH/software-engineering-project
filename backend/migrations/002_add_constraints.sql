-- Add unique constraint to existing recipes table
-- Note: If duplicates already exist, this might fail unless cleaned up.
-- For a student project, we assume a fresh start or manual cleanup if needed.

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_user_title ON recipes(user_id, title);
