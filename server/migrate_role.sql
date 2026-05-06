-- Emergency migration: Add role column if missing
-- Run: mysql -u root -p superinv < migrate_role.sql

USE superinv;

ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'manager', 'admin') NOT NULL DEFAULT 'user' AFTER password;

CREATE INDEX IF NOT EXISTS idx_users_role ON Users(role);

-- Update existing users to 'user' role
UPDATE Users SET role = 'user' WHERE role IS NULL OR role = '';

echo "Role column added successfully!"
