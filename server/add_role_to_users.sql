-- Migration script to add role column to Users table
-- Run this script to add admin/manager functionality

ALTER TABLE Users
ADD COLUMN role ENUM('user', 'manager', 'admin') NOT NULL DEFAULT 'user'
AFTER password;

-- Optional: Create an index on role for better query performance
CREATE INDEX idx_users_role ON Users(role);