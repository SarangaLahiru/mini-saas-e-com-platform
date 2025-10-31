-- Add multiple images for each product to showcase image gallery

-- iPhone 15 Pro (product_id = 1) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-001a', 1, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800', 'iPhone 15 Pro side view', 3, false, NOW()),
('img-001b', 1, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', 'iPhone 15 Pro camera detail', 4, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- Samsung Galaxy S24 Ultra (product_id = 2) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-003a', 2, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'Samsung Galaxy S24 Ultra back view', 2, false, NOW()),
('img-003b', 2, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', 'Samsung Galaxy S24 Ultra with S Pen', 3, false, NOW()),
('img-003c', 2, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'Samsung Galaxy S24 Ultra camera', 4, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- MacBook Pro (product_id = 3) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-004a', 3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'MacBook Pro side view', 2, false, NOW()),
('img-004b', 3, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', 'MacBook Pro keyboard', 3, false, NOW()),
('img-004c', 3, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'MacBook Pro display', 4, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- Dell XPS 15 (product_id = 4) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-005a', 4, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'Dell XPS 15 side view', 2, false, NOW()),
('img-005b', 4, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'Dell XPS 15 open', 3, false, NOW()),
('img-005c', 4, 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800', 'Dell XPS 15 keyboard detail', 4, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- iPad Pro (product_id = 5) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-006a', 5, 'https://images.unsplash.com/photo-1585789575762-9db59a2b8e1f?w=800', 'iPad Pro with Apple Pencil', 2, false, NOW()),
('img-006b', 5, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'iPad Pro side view', 3, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- Sony WH-1000XM5 (product_id = 6) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-007a', 6, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800', 'Sony WH-1000XM5 side view', 2, false, NOW()),
('img-007b', 6, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', 'Sony WH-1000XM5 controls', 3, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- AirPods Pro (product_id = 7) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-008a', 7, 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'AirPods Pro with case', 2, false, NOW()),
('img-008b', 7, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', 'AirPods Pro case detail', 3, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- Canon EOS R5 (product_id = 8) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-009a', 8, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800', 'Canon EOS R5 back view', 2, false, NOW()),
('img-009b', 8, 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800', 'Canon EOS R5 with lens', 3, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- PlayStation 5 (product_id = 9) - Additional images
INSERT INTO images (resource_id, product_id, url, alt_text, sort_order, is_primary, created_at) VALUES
('img-010a', 9, 'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800', 'PlayStation 5 controller', 2, false, NOW()),
('img-010b', 9, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800', 'PlayStation 5 side view', 3, false, NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

