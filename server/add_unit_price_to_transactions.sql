-- Migration script to add unit_price column to Transactions table
-- This fixes the missing unit_price column mentioned in TODO.md

ALTER TABLE Transactions
ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00
AFTER quantity;

-- Optional: Update existing records to set unit_price = total_price / quantity where quantity > 0
UPDATE Transactions
SET unit_price = total_price / quantity
WHERE quantity > 0 AND total_price > 0;