-- Migration: Add payment_status, shipped_at, and delivered_at columns to orders table
-- Run this if you have an existing database without these columns

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'processing', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER status,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL AFTER billing_address,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL AFTER shipped_at;

-- Add index for payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Note: If your order_items table already exists with 'price' and 'total' columns,
-- you may need to rename them to match the schema:
-- ALTER TABLE order_items CHANGE COLUMN price unit_price DECIMAL(10,2) NOT NULL;
-- ALTER TABLE order_items CHANGE COLUMN total total_price DECIMAL(10,2) NOT NULL;

-- Update existing orders to set payment_status based on their payments
UPDATE orders o
SET o.payment_status = (
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.order_id = o.id AND p.payment_status = 'completed'
        ) THEN 'paid'
        WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.order_id = o.id AND p.payment_status = 'processing'
        ) THEN 'processing'
        WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.order_id = o.id AND p.payment_status = 'failed'
        ) THEN 'failed'
        WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.order_id = o.id AND p.payment_status = 'refunded'
        ) THEN 'refunded'
        ELSE 'pending'
    END
);

