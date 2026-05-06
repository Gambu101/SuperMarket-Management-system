-- Complete Database Setup for SuperMarket-Management-system
-- Run: mysql -u root -p superinv < setup.sql

-- 1. Create database if not exists
CREATE DATABASE IF NOT EXISTS superinv;
USE superinv;

-- 2. Users table (base + role migration)
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'manager', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory table
CREATE TABLE IF NOT EXISTS Inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  low_stock_threshold INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_name (product_name),
  INDEX idx_category (category)
);

-- 4. Transactions table (base + unit_price migration)
CREATE TABLE IF NOT EXISTS Transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_date (transaction_date)
);

-- 5. StockActivityLog table
CREATE TABLE IF NOT EXISTS StockActivityLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type ENUM('ADD', 'EDIT', 'DELETE') NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity_changed INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  details TEXT,
  activity_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_activity_timestamp (activity_timestamp),
  INDEX idx_product_id (product_id)
);

-- 6. Insert test data
INSERT INTO Users (username, firstname, lastname, email, password, role) VALUES 
('admin', 'Super', 'Admin', 'admin@superinv.com', '$2b$10$9...hashed_admin_pass', 'admin'),
('manager1', 'Store', 'Manager', 'manager@superinv.com', '$2b$10$9...hashed_mgr_pass', 'manager'),
('user1', 'John', 'Doe', 'user@example.com', '$2b$10$9...hashed_user_pass', 'user')
ON DUPLICATE KEY UPDATE role=VALUES(role);

INSERT INTO Inventory (product_name, product_description, quantity, price, category, low_stock_threshold) VALUES 
('Milk', 'Fresh whole milk', 50, 2.99, 'Dairy', 10),
('Bread', 'White sliced bread', 30, 1.49, 'Bakery', 5),
('Apples', 'Red delicious apples', 100, 1.99, 'Produce', 20);

-- Note: Real passwords need bcrypt hash. Use signup endpoint after setup.
-- Admin login: Use /api/signup or manually hash 'adminpass' with bcrypt.
