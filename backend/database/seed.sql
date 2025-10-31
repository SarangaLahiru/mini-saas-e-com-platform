-- Comprehensive Seed Data for Electronics Store
-- This script populates the database with realistic dummy data

USE electronics_store;
-- Insert brands
INSERT INTO brands (name, slug, is_active, created_at, updated_at) VALUES
('Apple', 'apple', true, NOW(), NOW()),
('Samsung', 'samsung', true, NOW(), NOW()),
('Dell', 'dell', true, NOW(), NOW()),
('Sony', 'sony', true, NOW(), NOW()),
('Canon', 'canon', true, NOW(), NOW()),
('Google', 'google', true, NOW(), NOW());


-- Insert categories
INSERT INTO categories (resource_id, name, slug, description, image, is_active, sort_order, created_at, updated_at) VALUES
('cat-001', 'Smartphones', 'smartphones', 'Latest smartphones and mobile devices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', true, 1, NOW(), NOW()),
('cat-002', 'Laptops', 'laptops', 'Laptops and notebooks for work and gaming', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', true, 2, NOW(), NOW()),
('cat-003', 'Tablets', 'tablets', 'Tablets and iPads for productivity and entertainment', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', true, 3, NOW(), NOW()),
('cat-004', 'Headphones', 'headphones', 'Audio devices and headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', true, 4, NOW(), NOW()),
('cat-005', 'Cameras', 'cameras', 'Digital cameras and photography equipment', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', true, 5, NOW(), NOW()),
('cat-006', 'Gaming', 'gaming', 'Gaming consoles and accessories', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', true, 6, NOW(), NOW()),
('cat-007', 'Smart Home', 'smart-home', 'Smart home devices and automation', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true, 7, NOW(), NOW()),
('cat-008', 'Accessories', 'accessories', 'Phone cases, chargers, and other accessories', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', true, 8, NOW(), NOW());

-- Insert products
INSERT INTO products (resource_id, name, slug, description, short_description, sku, brand_id, price, compare_price, cost_price, stock_quantity, low_stock_threshold, track_quantity, allow_backorder, weight, length, width, height, is_active, is_featured, is_digital, requires_shipping, taxable, meta_title, meta_description, created_at, updated_at) VALUES
('prod-001', 'iPhone 15 Pro', 'iphone-15-pro', 'The most advanced iPhone with titanium design and A17 Pro chip', 'Latest iPhone with titanium design', 'IPH15PRO-128', (SELECT id FROM brands WHERE slug='apple'), 999.00, 1099.00, 800.00, 50, 5, true, false, 0.187, 14.67, 7.15, 0.83, true, true, false, true, true, 'iPhone 15 Pro - Latest Apple Smartphone', 'Get the iPhone 15 Pro with titanium design and A17 Pro chip', NOW(), NOW()),
('prod-002', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Premium Android smartphone with S Pen and advanced camera system', 'Premium Android with S Pen', 'SGS24U-256', (SELECT id FROM brands WHERE slug='samsung'), 1199.00, 1299.00, 900.00, 30, 5, true, false, 0.232, 16.24, 7.9, 0.88, true, true, false, true, true, 'Samsung Galaxy S24 Ultra - Premium Android', 'Premium Samsung smartphone with S Pen and advanced features', NOW(), NOW()),
('prod-003', 'MacBook Pro 16"', 'macbook-pro-16', 'Professional laptop with M3 Pro chip and Liquid Retina XDR display', 'Professional laptop with M3 Pro', 'MBP16-M3PRO', (SELECT id FROM brands WHERE slug='apple'), 2499.00, 2699.00, 2000.00, 20, 3, true, false, 2.16, 35.57, 24.81, 1.68, true, true, false, true, true, 'MacBook Pro 16" - Professional Laptop', 'Professional MacBook Pro with M3 Pro chip for creators', NOW(), NOW()),
('prod-004', 'Dell XPS 15', 'dell-xps-15', 'High-performance Windows laptop with stunning display', 'High-performance Windows laptop', 'DXP15-512', (SELECT id FROM brands WHERE slug='dell'), 1799.00, 1999.00, 1400.00, 25, 5, true, false, 1.8, 35.4, 23.5, 1.7, true, false, false, true, true, 'Dell XPS 15 - High Performance Laptop', 'Dell XPS 15 with stunning display and powerful performance', NOW(), NOW()),
('prod-005', 'iPad Pro 12.9"', 'ipad-pro-12-9', 'Professional tablet with M2 chip and Liquid Retina XDR display', 'Professional tablet with M2 chip', 'IPADPRO-128', (SELECT id FROM brands WHERE slug='apple'), 1099.00, 1199.00, 800.00, 40, 5, true, false, 0.682, 28.06, 21.49, 0.64, true, true, false, true, true, 'iPad Pro 12.9" - Professional Tablet', 'iPad Pro with M2 chip for professional work', NOW(), NOW()),
('prod-006', 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Premium noise-canceling headphones with industry-leading sound quality', 'Premium noise-canceling headphones', 'SONY-WH1000XM5', (SELECT id FROM brands WHERE slug='sony'), 399.00, 449.00, 250.00, 60, 10, true, false, 0.25, 20.0, 17.0, 7.0, true, true, false, true, true, 'Sony WH-1000XM5 - Premium Headphones', 'Sony WH-1000XM5 with industry-leading noise cancellation', NOW(), NOW()),
('prod-007', 'AirPods Pro 2nd Gen', 'airpods-pro-2nd-gen', 'Wireless earbuds with active noise cancellation and spatial audio', 'Wireless earbuds with noise cancellation', 'APPRO2-USB-C', (SELECT id FROM brands WHERE slug='apple'), 249.00, 279.00, 150.00, 80, 15, true, false, 0.056, 6.0, 4.5, 2.1, true, true, false, true, true, 'AirPods Pro 2nd Gen - Wireless Earbuds', 'AirPods Pro with active noise cancellation and spatial audio', NOW(), NOW()),
('prod-008', 'Canon EOS R5', 'canon-eos-r5', 'Professional mirrorless camera with 45MP sensor and 8K video', 'Professional mirrorless camera', 'CANON-R5', (SELECT id FROM brands WHERE slug='canon'), 3899.00, 4199.00, 3000.00, 15, 3, true, false, 0.65, 13.8, 9.8, 8.8, true, true, false, true, true, 'Canon EOS R5 - Professional Camera', 'Canon EOS R5 with 45MP sensor and 8K video recording', NOW(), NOW()),
('prod-009', 'PlayStation 5', 'playstation-5', 'Next-generation gaming console with ultra-high speed SSD', 'Next-gen gaming console', 'PS5-STD', NULL, 499.00, 549.00, 350.00, 100, 20, true, false, 4.5, 39.0, 26.0, 9.6, true, true, false, true, true, 'PlayStation 5 - Gaming Console', 'PlayStation 5 with ultra-high speed SSD and ray tracing', NOW(), NOW()),
('prod-010', 'Nest Hub Max', 'nest-hub-max', 'Smart display with Google Assistant and built-in camera', 'Smart display with Google Assistant', 'NEST-HUBMAX', (SELECT id FROM brands WHERE slug='google'), 229.00, 279.00, 150.00, 35, 5, true, false, 1.2, 24.0, 17.0, 3.0, true, false, false, true, true, 'Nest Hub Max - Smart Display', 'Google Nest Hub Max with smart home control', NOW(), NOW()),
('prod-011', 'iPhone 15', 'iphone-15', 'Latest iPhone with A16 Bionic chip and Dynamic Island', 'Latest iPhone with Dynamic Island', 'IPH15-128', (SELECT id FROM brands WHERE slug='apple'), 799.00, 899.00, 600.00, 75, 10, true, false, 0.171, 14.76, 7.15, 0.78, true, false, false, true, true, 'iPhone 15 - Latest Apple Smartphone', 'iPhone 15 with A16 Bionic chip and Dynamic Island', NOW(), NOW()),
('prod-012', 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'Flagship Android smartphone with AI-powered features', 'Flagship Android smartphone', 'SGS24-128', (SELECT id FROM brands WHERE slug='samsung'), 799.00, 899.00, 600.00, 45, 8, true, false, 0.167, 14.7, 7.0, 0.76, true, false, false, true, true, 'Samsung Galaxy S24 - Flagship Android', 'Samsung Galaxy S24 with AI-powered features', NOW(), NOW());

-- Insert product categories (many-to-many relationship)
INSERT INTO product_categories (product_id, category_id, created_at) VALUES
(1, 1, NOW()), (2, 1, NOW()), (11, 1, NOW()), (12, 1, NOW()), -- Smartphones
(3, 2, NOW()), (4, 2, NOW()), -- Laptops
(5, 3, NOW()), -- Tablets
(6, 4, NOW()), (7, 4, NOW()), -- Headphones
(8, 5, NOW()), -- Cameras
(9, 6, NOW()), -- Gaming
(10, 7, NOW()); -- Smart Home

-- Insert product images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
-- iPhone 15 Pro images
('img-001', 1, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'iPhone 15 Pro front view', 1, true, NOW()),
('img-002', 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 'iPhone 15 Pro back view', 2, false, NOW()),
('img-001a', 1, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800', 'iPhone 15 Pro side view', 3, false, NOW()),
('img-001b', 1, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', 'iPhone 15 Pro camera detail', 4, false, NOW()),

-- Samsung Galaxy S24 Ultra images
('img-003', 2, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'Samsung Galaxy S24 Ultra front view', 1, true, NOW()),
('img-003a', 2, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'Samsung Galaxy S24 Ultra back view', 2, false, NOW()),
('img-003b', 2, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', 'Samsung Galaxy S24 Ultra with S Pen', 3, false, NOW()),
('img-003c', 2, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'Samsung Galaxy S24 Ultra camera', 4, false, NOW()),

-- MacBook Pro images
('img-004', 3, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 'MacBook Pro 16 inch front view', 1, true, NOW()),
('img-004a', 3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'MacBook Pro side view', 2, false, NOW()),
('img-004b', 3, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', 'MacBook Pro keyboard', 3, false, NOW()),
('img-004c', 3, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'MacBook Pro display', 4, false, NOW()),

-- Dell XPS 15 images
('img-005', 4, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 'Dell XPS 15 front view', 1, true, NOW()),
('img-005a', 4, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'Dell XPS 15 side view', 2, false, NOW()),
('img-005b', 4, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'Dell XPS 15 open', 3, false, NOW()),
('img-005c', 4, 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800', 'Dell XPS 15 keyboard detail', 4, false, NOW()),

-- iPad Pro images
('img-006', 5, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'iPad Pro 12.9 inch front view', 1, true, NOW()),
('img-006a', 5, 'https://images.unsplash.com/photo-1585789575762-9db59a2b8e1f?w=800', 'iPad Pro with Apple Pencil', 2, false, NOW()),
('img-006b', 5, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'iPad Pro side view', 3, false, NOW()),

-- Sony WH-1000XM5 images
('img-007', 6, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'Sony WH-1000XM5 headphones', 1, true, NOW()),
('img-007a', 6, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800', 'Sony WH-1000XM5 side view', 2, false, NOW()),
('img-007b', 6, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', 'Sony WH-1000XM5 controls', 3, false, NOW()),

-- AirPods Pro images
('img-008', 7, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 'AirPods Pro 2nd Gen', 1, true, NOW()),
('img-008a', 7, 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'AirPods Pro with case', 2, false, NOW()),
('img-008b', 7, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', 'AirPods Pro case detail', 3, false, NOW()),

-- Canon EOS R5 images
('img-009', 8, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 'Canon EOS R5 camera', 1, true, NOW()),
('img-009a', 8, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800', 'Canon EOS R5 back view', 2, false, NOW()),
('img-009b', 8, 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800', 'Canon EOS R5 with lens', 3, false, NOW()),

-- PlayStation 5 images
('img-010', 9, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', 'PlayStation 5 console', 1, true, NOW()),
('img-010a', 9, 'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800', 'PlayStation 5 controller', 2, false, NOW()),
('img-010b', 9, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800', 'PlayStation 5 side view', 3, false, NOW()),
('img-011', 10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'Nest Hub Max smart display', 1, true, NOW()),
('img-012', 11, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'iPhone 15 front view', 1, true, NOW()),
('img-013', 12, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'Samsung Galaxy S24 front view', 1, true, NOW());

-- Insert product variants
INSERT INTO variants (resource_id, product_id, name, sku, price, compare_price, cost_price, stock_quantity, weight, is_active, created_at, updated_at) VALUES
-- iPhone 15 Pro variants
('var-001', 1, '128GB Storage', 'IPH15PRO-128', 0.00, 0.00, 0.00, 20, 0.187, true, NOW(), NOW()),
('var-002', 1, '256GB Storage', 'IPH15PRO-256', 100.00, 100.00, 50.00, 15, 0.187, true, NOW(), NOW()),
('var-003', 1, '512GB Storage', 'IPH15PRO-512', 300.00, 300.00, 150.00, 10, 0.187, true, NOW(), NOW()),
('var-004', 1, '1TB Storage', 'IPH15PRO-1TB', 500.00, 500.00, 250.00, 5, 0.187, true, NOW(), NOW()),
-- Samsung Galaxy S24 Ultra variants
('var-005', 2, '256GB Storage', 'SGS24U-256', 0.00, 0.00, 0.00, 15, 0.232, true, NOW(), NOW()),
('var-006', 2, '512GB Storage', 'SGS24U-512', 200.00, 200.00, 100.00, 10, 0.232, true, NOW(), NOW()),
('var-007', 2, '1TB Storage', 'SGS24U-1TB', 400.00, 400.00, 200.00, 5, 0.232, true, NOW(), NOW()),
-- MacBook Pro variants
('var-008', 3, '512GB Storage', 'MBP16-512', 0.00, 0.00, 0.00, 10, 2.16, true, NOW(), NOW()),
('var-009', 3, '1TB Storage', 'MBP16-1TB', 200.00, 200.00, 100.00, 8, 2.16, true, NOW(), NOW()),
('var-010', 3, '2TB Storage', 'MBP16-2TB', 600.00, 600.00, 300.00, 5, 2.16, true, NOW(), NOW());

-- Insert sample users (with hashed passwords - password: "password123")
INSERT INTO users (resource_id, username, email, password, first_name, last_name, phone, is_active, is_admin, is_verified, created_at, updated_at) VALUES
('user-001', 'admin', 'admin@electronicsstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', '+1-555-0100', true, true, true, NOW(), NOW()),
('user-002', 'john_doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '+1-555-0101', true, false, true, NOW(), NOW()),
('user-003', 'jane_smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', '+1-555-0102', true, false, true, NOW(), NOW()),
('user-004', 'mike_wilson', 'mike@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Wilson', '+1-555-0103', true, false, false, NOW(), NOW()),
('user-005', 'sarah_jones', 'sarah@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Jones', '+1-555-0104', true, false, true, NOW(), NOW());

-- Insert sample addresses
INSERT INTO addresses (resource_id, user_id, type, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, created_at, updated_at) VALUES
('addr-001', 2, 'shipping', 'John', 'Doe', 'Tech Corp', '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'USA', '+1-555-0101', true, NOW(), NOW()),
('addr-002', 2, 'billing', 'John', 'Doe', 'Tech Corp', '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'USA', '+1-555-0101', true, NOW(), NOW()),
('addr-003', 3, 'shipping', 'Jane', 'Smith', 'Design Studio', '456 Oak Ave', 'Suite 200', 'Los Angeles', 'CA', '90210', 'USA', '+1-555-0102', true, NOW(), NOW()),
('addr-004', 4, 'shipping', 'Mike', 'Wilson', 'Startup Inc', '789 Pine St', NULL, 'San Francisco', 'CA', '94102', 'USA', '+1-555-0103', true, NOW(), NOW()),
('addr-005', 5, 'shipping', 'Sarah', 'Jones', 'Creative Agency', '321 Elm St', 'Floor 3', 'Chicago', 'IL', '60601', 'USA', '+1-555-0104', true, NOW(), NOW());

-- Insert sample orders
INSERT INTO orders (resource_id, user_id, order_number, status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, currency, notes, shipping_address, billing_address, created_at, updated_at) VALUES
('order-001', 2, 'ORD-2024-001', 'delivered', 999.00, 79.92, 0.00, 0.00, 1078.92, 'USD', 'Please deliver during business hours', '{"first_name":"John","last_name":"Doe","address_line_1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA"}', '{"first_name":"John","last_name":"Doe","address_line_1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA"}', NOW(), NOW()),
('order-002', 3, 'ORD-2024-002', 'shipped', 2499.00, 199.92, 25.00, 100.00, 2623.92, 'USD', 'Fragile - handle with care', '{"first_name":"Jane","last_name":"Smith","address_line_1":"456 Oak Ave","city":"Los Angeles","state":"CA","postal_code":"90210","country":"USA"}', '{"first_name":"Jane","last_name":"Smith","address_line_1":"456 Oak Ave","city":"Los Angeles","state":"CA","postal_code":"90210","country":"USA"}', NOW(), NOW()),
('order-003', 2, 'ORD-2024-003', 'processing', 399.00, 31.92, 15.00, 0.00, 445.92, 'USD', 'Gift wrapping requested', '{"first_name":"John","last_name":"Doe","address_line_1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA"}', '{"first_name":"John","last_name":"Doe","address_line_1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA"}', NOW(), NOW()),
('order-004', 4, 'ORD-2024-004', 'pending', 1199.00, 95.92, 0.00, 50.00, 1244.92, 'USD', NULL, '{"first_name":"Mike","last_name":"Wilson","address_line_1":"789 Pine St","city":"San Francisco","state":"CA","postal_code":"94102","country":"USA"}', '{"first_name":"Mike","last_name":"Wilson","address_line_1":"789 Pine St","city":"San Francisco","state":"CA","postal_code":"94102","country":"USA"}', NOW(), NOW()),
('order-005', 5, 'ORD-2024-005', 'delivered', 249.00, 19.92, 0.00, 0.00, 268.92, 'USD', 'Left at front door', '{"first_name":"Sarah","last_name":"Jones","address_line_1":"321 Elm St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA"}', '{"first_name":"Sarah","last_name":"Jones","address_line_1":"321 Elm St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA"}', NOW(), NOW());

-- Insert sample order items
INSERT INTO order_items (resource_id, order_id, product_id, variant_id, quantity, unit_price, total_price, created_at) VALUES
('item-001', 1, 1, 1, 1, 999.00, 999.00, NOW()),
('item-002', 2, 3, 8, 1, 2499.00, 2499.00, NOW()),
('item-003', 3, 6, NULL, 1, 399.00, 399.00, NOW()),
('item-004', 4, 2, 5, 1, 1199.00, 1199.00, NOW()),
('item-005', 5, 7, NULL, 1, 249.00, 249.00, NOW());

-- Insert sample payments
INSERT INTO payments (resource_id, order_id, payment_method, payment_status, amount, currency, transaction_id, gateway_response, processed_at, created_at, updated_at) VALUES
('pay-001', 1, 'credit_card', 'completed', 1078.92, 'USD', 'txn_123456789', '{"status":"succeeded","id":"pi_123456789"}', NOW(), NOW(), NOW()),
('pay-002', 2, 'credit_card', 'completed', 2623.92, 'USD', 'txn_123456790', '{"status":"succeeded","id":"pi_123456790"}', NOW(), NOW(), NOW()),
('pay-003', 3, 'credit_card', 'processing', 445.92, 'USD', 'txn_123456791', '{"status":"processing","id":"pi_123456791"}', NULL, NOW(), NOW()),
('pay-004', 4, 'credit_card', 'pending', 1244.92, 'USD', NULL, NULL, NULL, NOW(), NOW()),
('pay-005', 5, 'credit_card', 'completed', 268.92, 'USD', 'txn_123456792', '{"status":"succeeded","id":"pi_123456792"}', NOW(), NOW(), NOW());

-- Insert sample reviews
INSERT INTO reviews (resource_id, product_id, user_id, rating, title, comment, is_approved, is_verified_purchase, created_at, updated_at) VALUES
('rev-001', 1, 2, 5, 'Amazing phone!', 'The iPhone 15 Pro is absolutely fantastic. The camera quality is outstanding and the performance is smooth. The titanium design feels premium and the battery life is excellent.', true, true, NOW(), NOW()),
('rev-002', 3, 3, 5, 'Perfect for work', 'The MacBook Pro is perfect for my work needs. The M3 Pro chip is incredibly fast and the display is gorgeous. Highly recommended for professionals.', true, true, NOW(), NOW()),
('rev-003', 6, 2, 4, 'Great sound quality', 'The Sony headphones have excellent noise cancellation and sound quality. The battery life is impressive and they are very comfortable for long listening sessions.', true, true, NOW(), NOW()),
('rev-004', 7, 5, 5, 'Love these earbuds', 'AirPods Pro are the best wireless earbuds I have ever used. The noise cancellation is incredible and the fit is perfect. The spatial audio feature is amazing.', true, true, NOW(), NOW()),
('rev-005', 2, 4, 4, 'Great Android phone', 'The Samsung Galaxy S24 Ultra is a fantastic phone. The S Pen is very useful and the camera system is impressive. The battery life could be better though.', true, true, NOW(), NOW()),
('rev-006', 8, 3, 5, 'Professional camera', 'The Canon EOS R5 is an excellent professional camera. The image quality is outstanding and the 8K video recording is amazing. Worth every penny.', true, true, NOW(), NOW());

-- Insert sample cart
INSERT INTO cart (resource_id, user_id, session_id, created_at, updated_at) VALUES
('cart-001', 2, 'sess_123456789', NOW(), NOW()),
('cart-002', 4, 'sess_123456790', NOW(), NOW());

-- Insert sample cart items
INSERT INTO cart_items (resource_id, cart_id, product_id, variant_id, quantity, created_at, updated_at) VALUES
('cart-item-001', 1, 9, NULL, 1, NOW(), NOW()),
('cart-item-002', 1, 10, NULL, 2, NOW(), NOW()),
('cart-item-003', 2, 11, NULL, 1, NOW(), NOW());

-- Insert sample wishlist
INSERT INTO wishlist (resource_id, user_id, product_id, created_at) VALUES
('wish-001', 2, 8, NOW()),
('wish-002', 2, 9, NOW()),
('wish-003', 3, 1, NOW()),
('wish-004', 4, 3, NOW()),
('wish-005', 5, 6, NOW());

-- Insert sample discounts
INSERT INTO discounts (resource_id, code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, used_count, is_active, starts_at, expires_at, created_at, updated_at) VALUES
('disc-001', 'WELCOME10', 'Welcome Discount', '10% off for new customers', 'percentage', 10.00, 100.00, 50.00, 1000, 25, true, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()),
('disc-002', 'FREESHIP', 'Free Shipping', 'Free shipping on orders over $50', 'fixed_amount', 15.00, 50.00, 15.00, 500, 45, true, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), NOW(), NOW()),
('disc-003', 'BLACKFRIDAY', 'Black Friday Sale', '20% off on Black Friday', 'percentage', 20.00, 200.00, 200.00, 200, 0, false, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('disc-004', 'STUDENT10', 'Student Discount', '10% off for students', 'percentage', 10.00, 50.00, 100.00, 100, 12, true, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW(), NOW());

-- Insert sample promotions
INSERT INTO promotions (resource_id, name, description, type, content, image, link_url, is_active, starts_at, expires_at, created_at, updated_at) VALUES
('promo-001', 'New iPhone 15 Pro Available!', 'Get the latest iPhone 15 Pro with titanium design and A17 Pro chip', 'banner', 'Shop the new iPhone 15 Pro with titanium design and A17 Pro chip. Available now!', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200', '/products/iphone-15-pro', true, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()),
('promo-002', 'Free Shipping on Orders Over $50', 'Enjoy free shipping on all orders over $50', 'banner', 'Free shipping on all orders over $50. No minimum purchase required for premium members!', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', '/shipping-info', true, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), NOW(), NOW()),
('promo-003', 'Gaming Sale - Up to 30% Off', 'Up to 30% off on gaming consoles and accessories', 'popup', 'Don\'t miss our gaming sale! Up to 30% off on PlayStation 5, Xbox Series X, and gaming accessories.', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200', '/categories/gaming', false, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
('promo-004', 'MacBook Pro M3 - Professional Power', 'MacBook Pro with M3 Pro chip for professionals', 'sidebar', 'MacBook Pro with M3 Pro chip delivers incredible performance for professionals. Order now!', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', '/products/macbook-pro-16', true, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), NOW(), NOW());

-- Insert sample OTP verifications (for testing)
INSERT INTO otp_verifications (resource_id, user_id, email, otp_code, otp_type, is_used, expires_at, created_at, updated_at) VALUES
('otp-001', 4, 'mike@example.com', '123456', 'email_verification', false, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NOW(), NOW()),
('otp-002', 2, 'john@example.com', '654321', 'password_reset', false, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NOW(), NOW());

-- Reset auto-increment values
ALTER TABLE users AUTO_INCREMENT = 6;
ALTER TABLE categories AUTO_INCREMENT = 9;
ALTER TABLE products AUTO_INCREMENT = 13;
ALTER TABLE orders AUTO_INCREMENT = 6;
ALTER TABLE reviews AUTO_INCREMENT = 7;
ALTER TABLE discounts AUTO_INCREMENT = 5;
ALTER TABLE promotions AUTO_INCREMENT = 5;

-- Display summary
SELECT 'Seed data inserted successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_categories FROM categories;