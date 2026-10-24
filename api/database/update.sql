-- ============================================================
-- AgroSeed Database Update & Optimization Script (Safe Patch)
-- cPanel phpMyAdmin-এ এই কোডটি SQL ট্যাবে পেস্ট করে 'Go' বাটনে ক্লিক করুন।
-- এটি আপনার কোনো বর্তমান ডাটা মুছে ফেলবে না (No data loss)।
-- ============================================================

-- ১. Products টেবিলে প্রয়োজনীয় কলাম যোগ করা (যদি না থাকে)
SET @dbname = DATABASE();

-- available_stock কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND COLUMN_NAME = 'available_stock');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `products` ADD COLUMN `available_stock` INT DEFAULT 0 AFTER `in_stock`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- position কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND COLUMN_NAME = 'position');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `products` ADD COLUMN `position` INT DEFAULT 0 AFTER `stock`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- is_hidden কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_hidden');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `products` ADD COLUMN `is_hidden` TINYINT(1) DEFAULT 0 AFTER `position`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- প্রডাক্ট ছবির সাইজ বড় করার জন্য LONGTEXT এ রূপান্তর
ALTER TABLE `products` MODIFY COLUMN `product_image` LONGTEXT DEFAULT NULL;
ALTER TABLE `products` MODIFY COLUMN `image_gallery` LONGTEXT DEFAULT NULL;
ALTER TABLE `products` MODIFY COLUMN `full_description` LONGTEXT DEFAULT NULL;


-- ২. Orders টেবিলে প্রয়োজনীয় কলাম যোগ করা
-- created_by_admin_id কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'created_by_admin_id');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `orders` ADD COLUMN `created_by_admin_id` VARCHAR(64) DEFAULT NULL AFTER `courier_status`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pre_date কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'pre_date');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `orders` ADD COLUMN `pre_date` VARCHAR(50) DEFAULT NULL AFTER `last_status_changed_by`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- traffic_source কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'traffic_source');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `orders` ADD COLUMN `traffic_source` VARCHAR(100) DEFAULT \'direct\' AFTER `pre_date`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- is_deleted কলাম যোগ
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'is_deleted');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `orders` ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `traffic_source`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ৩. ফাস্ট লোডিংয়ের জন্য ইনডেক্স তৈরি (Performance Indexes)
-- Products Indexes
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_prod_slug');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `products` ADD INDEX `idx_prod_slug` (`slug`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_prod_hidden');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `products` ADD INDEX `idx_prod_hidden` (`is_hidden`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_prod_category');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `products` ADD INDEX `idx_prod_category` (`category`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Orders Indexes
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_ord_deleted');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_ord_deleted` (`is_deleted`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_ord_created_by');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_ord_created_by` (`created_by_admin_id`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_ord_last_modified');
SET @query = IF(@idx_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_ord_last_modified` (`last_status_changed_by`)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ৪. স্টক ডাটা স্বাভাবিক করা (Stock Sync)
-- যেগুলোর স্টক আছে কিন্তু available_stock ফাঁকা ছিল সেগুলোকে ঠিক করা
UPDATE `products` 
SET `available_stock` = `stock` 
WHERE (`available_stock` IS NULL OR `available_stock` = 0) AND `stock` > 0;

-- যেগুলোর স্টক 0 বা তার নিচে সেগুলোকে সঠিকভাবে স্টক-আউট করা
UPDATE `products` 
SET `in_stock` = 0, `available_stock` = 0 
WHERE `stock` <= 0;

-- যেগুলোর স্টক 0 এর বেশি সেগুলোকে ইন-স্টক করা
UPDATE `products` 
SET `in_stock` = 1 
WHERE `stock` > 0;
