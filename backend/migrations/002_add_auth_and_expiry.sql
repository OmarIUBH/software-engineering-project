-- SQLite does not allow adding a UNIQUE column directly via ALTER TABLE if the table already has data.
-- We must add the column first, then create an index.

ALTER TABLE users ADD COLUMN email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}';

-- Add expiry_date to Pantry Items
ALTER TABLE pantry_items ADD COLUMN expiry_date TEXT;
