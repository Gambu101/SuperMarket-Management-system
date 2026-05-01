-- SQL Script to create StockActivityLog table for tracking stock updates
-- Run this script in your MySQL database to create the table

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

-- If you need to add foreign key constraints (optional, uncomment if needed):
-- ALTER TABLE StockActivityLog 
-- ADD CONSTRAINT fk_stockactivity_user 
-- FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE;

-- ALTER TABLE StockActivityLog 
-- ADD CONSTRAINT fk_stockactivity_product 
-- FOREIGN KEY (product_id) REFERENCES Inventory(id) ON DELETE SET NULL;
