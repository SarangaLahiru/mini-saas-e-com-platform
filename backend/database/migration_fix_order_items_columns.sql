-- Migration: Fix order_items column names to match schema
-- Run this if your order_items table has 'price' and 'total' instead of 'unit_price' and 'total_price'

-- Check and rename columns if they exist with wrong names
ALTER TABLE order_items 
CHANGE COLUMN price unit_price DECIMAL(10,2) NOT NULL,
CHANGE COLUMN total total_price DECIMAL(10,2) NOT NULL;

