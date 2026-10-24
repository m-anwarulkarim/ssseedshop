-- ========================================================
-- Ss Seed Shop Complete Database Dump (Schema + Data)
-- Generated for: jjcceicf_ssseedshop
-- Super Admin: ssseedshop220@gmail.com / ssseedshop220
-- ========================================================

-- ========================================================
-- AgroSeed MySQL Database Schema
-- Version: 1.0 (Production-Ready for cPanel / MariaDB)
-- Character Set: utf8mb4 (Full Bengali and Emoji Support)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_plain` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `is_super_admin` TINYINT(1) DEFAULT 0,
  `name` VARCHAR(191) DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `id_card` VARCHAR(100) DEFAULT NULL,
  `join_date` VARCHAR(50) DEFAULT NULL,
  `permissions` LONGTEXT DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) DEFAULT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `categories` LONGTEXT DEFAULT NULL,
  `subcategory` VARCHAR(100) DEFAULT NULL,
  `tag` VARCHAR(100) DEFAULT NULL,
  `tags` LONGTEXT DEFAULT NULL,
  `product_image` LONGTEXT DEFAULT NULL,
  `image_gallery` LONGTEXT DEFAULT NULL,
  `regular_price` DECIMAL(10,2) DEFAULT 0.00,
  `offer_price` DECIMAL(10,2) DEFAULT 0.00,
  `buying_price` DECIMAL(10,2) DEFAULT 0.00,
  `short_description` TEXT DEFAULT NULL,
  `full_description` LONGTEXT DEFAULT NULL,
  `in_stock` TINYINT(1) DEFAULT 1,
  `available_stock` INT DEFAULT 0,
  `stock` INT DEFAULT 0,
  `position` INT DEFAULT 0,
  `is_hidden` TINYINT(1) DEFAULT 0,
  `variations` LONGTEXT DEFAULT NULL,
  `package_tiers` LONGTEXT DEFAULT NULL,
  `highlight_features` TEXT DEFAULT NULL,
  `trust_card_1_title` VARCHAR(255) DEFAULT NULL,
  `trust_card_1_text` TEXT DEFAULT NULL,
  `trust_card_2_title` VARCHAR(255) DEFAULT NULL,
  `trust_card_2_text` TEXT DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_prod_category` (`category`),
  INDEX `idx_prod_sku` (`sku`),
  INDEX `idx_prod_position` (`position`),
  INDEX `idx_prod_stock` (`in_stock`),
  INDEX `idx_prod_slug` (`slug`),
  INDEX `idx_prod_hidden` (`is_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) DEFAULT NULL,
  `display_name` VARCHAR(100) DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `image` TEXT DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `position` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_hidden` TINYINT(1) DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_cat_position` (`position`),
  INDEX `idx_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subcategories Table
CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `position` INT DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_subcat_parent` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tags Table
CREATE TABLE IF NOT EXISTS `tags` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `color` VARCHAR(20) DEFAULT NULL,
  `position` INT DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_tags_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `phone` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `profile_picture` TEXT DEFAULT NULL,
  `cover_photo` TEXT DEFAULT NULL,
  `alt_phone` VARCHAR(30) DEFAULT NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `visitor_id` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `thana` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `user_type` VARCHAR(50) DEFAULT 'retail',
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `referral_code` VARCHAR(50) DEFAULT NULL,
  `auth_provider` VARCHAR(50) DEFAULT 'phone',
  `last_active_at` VARCHAR(50) DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  `last_login` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_cust_phone` (`phone`),
  INDEX `idx_cust_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `alt_phone` VARCHAR(30) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `total_amount` DECIMAL(10,2) DEFAULT 0.00,
  `delivery_charge` DECIMAL(10,2) DEFAULT 0.00,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) DEFAULT 0.00,
  `advance` DECIMAL(10,2) DEFAULT 0.00,
  `items` LONGTEXT DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'cash_on_delivery',
  `status` VARCHAR(50) DEFAULT 'pending',
  `payment_status` VARCHAR(50) DEFAULT 'pending',
  `is_printed` TINYINT(1) DEFAULT 0,
  `print_note` TINYINT(1) DEFAULT 0,
  `is_courier_entered` TINYINT(1) DEFAULT 0,
  `courier` VARCHAR(50) DEFAULT NULL,
  `consignment_id` VARCHAR(100) DEFAULT NULL,
  `tracking_code` VARCHAR(100) DEFAULT NULL,
  `courier_status` VARCHAR(50) DEFAULT NULL,
  `courier_note` TEXT DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `thana` VARCHAR(100) DEFAULT NULL,
  `visitor_id` VARCHAR(100) DEFAULT NULL,
  `visitor_profile_id` VARCHAR(100) DEFAULT NULL,
  `traffic_source` VARCHAR(100) DEFAULT 'direct',
  `created_by_admin_id` VARCHAR(64) DEFAULT NULL,
  `last_status_changed_by` VARCHAR(64) DEFAULT NULL,
  `pre_date` VARCHAR(50) DEFAULT NULL,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_ord_order_id` (`order_id`),
  INDEX `idx_ord_phone` (`phone`),
  INDEX `idx_ord_status` (`status`),
  INDEX `idx_ord_deleted` (`is_deleted`),
  INDEX `idx_ord_created_by` (`created_by_admin_id`),
  INDEX `idx_ord_last_modified` (`last_status_changed_by`),
  INDEX `idx_ord_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Incomplete Orders Table
CREATE TABLE IF NOT EXISTS `incomplete_orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `customer_name` VARCHAR(191) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `visitor_id` VARCHAR(100) DEFAULT NULL,
  `reason` VARCHAR(100) DEFAULT 'checkout_abandoned',
  `cart_snapshot` LONGTEXT DEFAULT NULL,
  `attempt_count` INT DEFAULT 1,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_inc_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` VARCHAR(20) DEFAULT 'fixed',
  `discount_value` DECIMAL(10,2) DEFAULT 0.00,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10,2) DEFAULT NULL,
  `usage_limit` INT DEFAULT 100,
  `used_count` INT DEFAULT 0,
  `total_discount_given` DECIMAL(10,2) DEFAULT 0.00,
  `starts_at` VARCHAR(50) DEFAULT NULL,
  `expires_at` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_coup_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(64) DEFAULT NULL,
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `value` LONGTEXT DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 12. SMS Logs Table
CREATE TABLE IF NOT EXISTS `sms_logs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(50) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `status` VARCHAR(50) DEFAULT NULL,
  `reason` VARCHAR(100) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `result` TEXT DEFAULT NULL,
  `sent` TINYINT(1) DEFAULT 1,
  `sent_by_admin` VARCHAR(64) DEFAULT NULL,
  `gateway` LONGTEXT DEFAULT NULL,
  `timestamp` VARCHAR(50) DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_sms_phone` (`phone`),
  INDEX `idx_sms_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Fraud Cache Table
CREATE TABLE IF NOT EXISTS `fraud_cache` (
  `phone` VARCHAR(30) NOT NULL PRIMARY KEY,
  `data` LONGTEXT NOT NULL,
  `fraudchecker_data` LONGTEXT DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Order Status History Table
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by` VARCHAR(64) DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_osh_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Visitors Table
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `visitor_id` VARCHAR(100) DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `device_type` VARCHAR(50) DEFAULT NULL,
  `first_seen_at` VARCHAR(50) DEFAULT NULL,
  `last_seen_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_vis_vid` (`visitor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Visitor Profiles Table
CREATE TABLE IF NOT EXISTS `visitor_profiles` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `visitor_id` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(191) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` VARCHAR(50) DEFAULT NULL,
  INDEX `idx_vp_vid` (`visitor_id`),
  INDEX `idx_vp_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- ========================================================
-- DATA SEED
-- ========================================================

-- ========================================================
-- AgroSeed MySQL Initial Data Seed
-- Generated: 2026-10-24 16:20:50
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Table: admins
INSERT INTO `admins` (`id`, `email`, `password_hash`, `password_plain`, `role`, `is_super_admin`, `name`, `photo_url`, `id_card`, `join_date`, `permissions`, `created_at`) VALUES ('admin_super_001', 'ssseedshop220@gmail.com', '$2y$10$z0LojZuJyhVfVjMMjUYQe.kY8cAhImYCmdbSLhIOR/PC2GOSrqoP2', 'ssseedshop220', 'admin', 1, 'Ss Seed Shop Super Admin', '', '', '2026-01-01', '[\"*\"]', '2026-01-01T00:00:00+06:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: products
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d3f9fa04-122e-4c76-b395-21c9fd9b67aa', 'উন্নত জাতের হাইব্রিড বরব টি  বীজ', 'imp-9444-d3f9fa', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364677034-4z5tmj9.webp', NULL, 99, 0, NULL, NULL, '[]', NULL, NULL, '[]', NULL, NULL, 'IMP-9444', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.051+00:00', '2026-09-25T16:23:44.51+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f3061e3c-c846-4a09-8a0f-b0048a30a559', 'চায়না গোল্ডেন ফিঙ্গার হলুদ হাইব্রিড মরিচ বীজ', 'imp-7915-f3061e', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1781005155188-zfqppdq.webp', NULL, 110, 0, NULL, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-7915', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:39.575+00:00', '2026-09-30T16:28:51.734+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0590b158-bf5e-4810-ba20-407c1f8eac4d', 'নি-ওয়াং হাইব্রিড বাঁশ লাউ বীজ (ইম্পোর্টেড চায়না প্যাকেট)', 'imp-5841-0590b1', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364654381-c2b1a1b.webp', NULL, 89, 0, NULL, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-5841', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:39.407+00:00', '2026-09-30T16:28:51.941+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9a6d32da-de0e-49ef-aa4b-b93ee3823174', 'হাইব্রিড লম্বা মিষ্ট কুমড়া বীজ (আমদানিকৃত)', 'imp-8165-9a6d32', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364664320-oo9kaqi.webp', NULL, 89, 0, NULL, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-8165', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:39.179+00:00', '2026-09-30T16:28:52.151+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9f6a8de1-d032-48f1-8364-a38f140085a7', 'হাইব্রিড কাচড়া মিষ্ট কুমড়া বীজ', 'imp-7378-9f6a8d', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364685199-qd754ow.webp', NULL, 89, 0, NULL, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-7378', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.887+00:00', '2026-09-30T16:28:49.508+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e7437253-8882-4e05-854b-a9191ef812c7', 'চায়না ইম্পোর্টেড প্রিমিয়াম ভাবেনা ফুলের বীজ', 'imp-5766-e74372', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732430131-vcozvqo.webp', NULL, 99, 0, NULL, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-5766', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.723+00:00', '2026-09-30T16:28:50.667+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4e3b8537-ac5c-4259-8805-d1e177c62bae', 'পিংক জিপসি (বেবি\'স ব্রেখ) ফুলের বীজ', 'imp-1032-4e3b85', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732438205-99e2npf.webp', NULL, 65, 0, NULL, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-1032', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.563+00:00', '2026-09-30T16:28:50.923+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4157e5ee-41d1-4ded-bb4d-a0387176751c', 'চায়না লেজি কিং হাইব্রিড তরমুজ বীজ', 'imp-8111-4157e5', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364688932-9kmc0sw.webp', NULL, 99, 0, NULL, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-8111', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.391+00:00', '2026-09-30T16:28:51.127+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('76ecd59e-37d9-4954-af4d-cb2c04bcc8bc', 'হাইব্রিড বারমাসি মিষ্টি মেলন (বাঙ্গি) বীজ', 'imp-5394-76ecd5', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364691909-3qbinlk.webp', NULL, 120, 0, NULL, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-5394', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.231+00:00', '2026-09-30T16:28:51.325+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2f620dc9-af6f-4052-b61d-19067a80de3c', 'চায়না বড় পাতা পালং শাকের বীজ (বারোমাসি জাত)', 'imp-9992-2f620d', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364695326-wa2sqrd.webp', NULL, 50, 0, NULL, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-9992', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:39.739+00:00', '2026-09-30T16:28:51.537+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('3e65e2e0-732d-4e55-8bbb-20f1275ac953', 'জে কে লাইফেং হাইব্রিড ওলকপি বীজ', 'jk-laifeng-hybrid-kohlrabi-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949175535-qo4fy5n.webp', NULL, 170, 69, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জে কে লাইফেং হাইব্রিড ওলকপি, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3>
<p><strong>জে কে লাইফেং হাইব্রিড ওলকপি বীজ</strong> উন্নতমানের ওলকপি চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুগঠিত, আকর্ষণীয় ওলকপি উৎপাদনে সহায়ক।</p>

<p>উন্নতমানের এই হাইব্রিড ওলকপি বাড়ির বাগান, ছাদবাগান, টব এবং বাণিজ্যিক চাষের জন্য উপযোগী। পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও সঠিক পানি ব্যবস্থাপনার মাধ্যমে স্বাস্থ্যবান গাছ ও সুন্দর ওলকপি পেতে সহায়তা করতে পারে। 🥬</p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০ টি বীজ / ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥬 <strong>জাত:</strong> জে কে লাইফেং হাইব্রিড ওলকপি</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>ওলকপি বা কোলরাবি একটি শীতকালীন সবজি। ঠান্ডা ও মৃদু আবহাওয়ায় গাছের বৃদ্ধি এবং ওলকপির সুগঠিত কাণ্ড তৈরির জন্য পরিবেশ বেশি উপযোগী। বাংলাদেশের আবহাওয়ায় সাধারণত নিচের সময়গুলোতে চাষ করা ভালো:</p>

<ul>
<li>🍂 <strong>শরৎ:</strong> সেপ্টেম্বর–অক্টোবর — বীজ বপন ও চারা তৈরির জন্য উপযোগী।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি — ওলকপি চাষের জন্য সবচেয়ে উপযোগী সময়।</li>
<li>🌸 <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল আবহাওয়ায় চাষ করা যেতে পারে।</li>
</ul>

<p>অতিরিক্ত গরম আবহাওয়ায় গাছের বৃদ্ধি ব্যাহত হতে পারে এবং ওলকপি কাঙ্ক্ষিত আকার ও গুণমান নাও পেতে পারে। তাই ঠান্ডা মৌসুমকে অগ্রাধিকার দেওয়া ভালো।</p>

<h3>🪴 ওলকপির জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
ওলকপির জন্য উর্বর, ঝুরঝুরে ও ভালো পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি যেন অতিরিক্ত শক্ত বা দীর্ঘসময় ভেজা না থাকে।</p>

<p><strong>২. জমি ভালোভাবে প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা, শুকনো শিকড় ও অন্যান্য আবর্জনা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার কুপিয়ে বা চাষ দিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p>

<p><strong>৩. জৈব সার প্রয়োগ করুন</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির উর্বরতা ও গঠন উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. উঁচু বেড তৈরি করুন</strong><br>
ওলকপির জমিতে পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে। তাই প্রয়োজন অনুযায়ী <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p>

<p><strong>৫. চারা রোপণের আগে মাটি প্রস্তুত করুন</strong><br>
চারা রোপণের কয়েকদিন আগে মাটি ভালোভাবে প্রস্তুত করে জৈব সার মিশিয়ে রাখুন। চারা রোপণের সময় মাটি ঝুরঝুরে ও পর্যাপ্ত আর্দ্র থাকা ভালো।</p>

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3>
<p>টব, গ্রো ব্যাগ বা ছাদবাগানে জে কে লাইফেং হাইব্রিড ওলকপি চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p>

<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ব্যবহার করুন। টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>প্রথমে ঝুরঝুরে ও পরিষ্কার বীজতলা তৈরি করুন। বীজ অল্প গভীরে বপন করে পাতলা করে মাটি বা কোকোপিট দিয়ে ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না।</p>

<p>বীজ বপনের পর হালকা স্প্রে করে পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা যখন কয়েকটি সুস্থ পাতা গজিয়ে শক্ত হয়ে উঠবে, তখন সতর্কতার সঙ্গে মূল জমি বা বড় টবে রোপণ করুন।</p>

<p>চারা রোপণের সময় পর্যাপ্ত দূরত্ব রাখুন, যাতে গাছের পাতা ও কাণ্ড ভালোভাবে বৃদ্ধি পায় এবং ওলকপি সুগঠিত হওয়ার জন্য প্রয়োজনীয় জায়গা পায়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌿 গাছের চারপাশের আগাছা নিয়মিত পরিষ্কার রাখুন।</li>
<li>🪴 মাটি শক্ত হয়ে গেলে গাছের গোড়ার চারপাশের মাটি হালকা করে আলগা করে দিন।</li>
</ul>

<h3>🌿 ভালো ফলনের জন্য পরিচর্যার টিপস</h3>
<ul>
<li>🌱 স্বাস্থ্যবান ও সবল চারা মূল জমিতে রোপণ করুন।</li>
<li>🌞 পর্যাপ্ত আলো ও বাতাস চলাচলের ব্যবস্থা রাখুন।</li>
<li>🍂 নিয়মিত পরিমাণমতো জৈব সার বা কম্পোস্ট ব্যবহার করুন।</li>
<li>💧 মাটির আর্দ্রতা বজায় রাখুন, তবে জলাবদ্ধতা হতে দেবেন না।</li>
<li>🐛 পাতায় পোকামাকড় বা রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li>
<li>🥬 ওলকপি অতিরিক্ত বড় হওয়ার আগে উপযুক্ত সময়ে সংগ্রহ করলে কোমল ও সুস্বাদু কাণ্ড পাওয়ার সম্ভাবনা বেশি থাকে।</li>
</ul>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা গ্রো ব্যাগ</li>
<li>🌱 সবজি বাগান</li>
<li>🚜 বাণিজ্যিক জমি</li>
</ul>

<h3>🥬 জে কে লাইফেং হাইব্রিড ওলকপির বিশেষত্ব</h3>
<p>হাইব্রিড জাতের এই ওলকপি সঠিক পরিচর্যা ও অনুকূল পরিবেশে <strong>শক্তিশালী গাছ এবং সুন্দর, সুগঠিত ওলকপি</strong> উৎপাদনে সহায়ক। বাড়ির বাগান থেকে শুরু করে ছাদবাগান ও বাণিজ্যিক চাষ—বিভিন্ন ধরনের চাষাবাদে এটি ব্যবহার করা যেতে পারে।</p>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ির বাগান, ছাদবাগান বা বাণিজ্যিক জমিতে উন্নতমানের ওলকপি চাষ করতে আজই জে কে লাইফেং হাইব্রিড ওলকপি বীজ অর্ডার করুন! 🌱🥬</strong></p>', 'VEG-1533', 25, 25, 1, 0, 0, '[]', '2026-09-24T01:46:39.905+00:00', '2026-10-17T05:26:04.797677+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f1c00c34-f535-4e3f-a678-269cc0205b7a', 'হাইব্রিড খাসির শিং মরিচ বীজ', 'hybrid-khasir-shing-chili-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949180625-lxoqcve.webp', NULL, 150, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, ঝাঁজালো, লম্বা ও বাঁকানো আকৃতির মরিচ উৎপাদনের জন্য আদর্শ।', '```html
<h2>হাইব্রিড খাসির শিং মরিচ বীজ</h2>

<p><strong>হাইব্রিড খাসির শিং মরিচ বীজ</strong> লম্বা, বাঁকানো ও খাসির শিংয়ের মতো আকৃতির ঝাল মরিচ চাষের জন্য উপযোগী একটি হাইব্রিড জাত। এর আকর্ষণীয় আকৃতি, মাংসল গঠন ও ঝাঁজালো স্বাদ রান্নায় ব্যবহারের পাশাপাশি বাজারজাতকরণের জন্যও উপযোগী। উপযুক্ত পরিবেশ, সুষম পুষ্টি ও নিয়মিত পরিচর্যায় গাছের ভালো বৃদ্ধি এবং দীর্ঘ সময় ধরে মরিচ সংগ্রহের সুযোগ তৈরি হতে পারে। ছাদবাগান, কিচেন গার্ডেন, বাড়ির আঙিনা ও বাণিজ্যিক চাষের জন্য এই বীজ বেছে নিতে পারেন।

<h2>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h2>

<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌶️ <strong>মরিচের ধরন:</strong> লম্বা, বাঁকানো ও ঝাল মরিচ</li>
  <li>🌿 <strong>জাতের ধরন:</strong> হাইব্রিড</li>
  <li>🏡 <strong>চাষের উপযোগিতা:</strong> ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li>
</ul>

<h2>হাইব্রিড খাসির শিং মরিচের বিশেষ বৈশিষ্ট্য</h2>

<ul>
  <li><strong>আকর্ষণীয় আকৃতি:</strong> খাসির শিংয়ের মতো লম্বা ও বাঁকানো মরিচ উৎপাদনের উপযোগী।</li>
  <li><strong>ঝাঁজালো ও মাংসল ফল:</strong> দৈনন্দিন রান্নায় ঝাল মরিচ হিসেবে ব্যবহার করা যায়।</li>
  <li><strong>ভালো ফলনের সম্ভাবনা:</strong> সঠিক পরিচর্যা ও অনুকূল পরিবেশে ভালো ফলন পেতে সহায়ক।</li>
  <li><strong>দীর্ঘ সময় ফল সংগ্রহ:</strong> গাছ সুস্থ থাকলে এবং পরিবেশ অনুকূলে থাকলে একাধিকবার মরিচ সংগ্রহ করা সম্ভব।</li>
  <li><strong>বহুমুখী চাষ:</strong> বাড়ির বাগানে পারিবারিক চাহিদা পূরণ থেকে শুরু করে বাণিজ্যিক উৎপাদনেও ব্যবহার উপযোগী।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>

<p>বাংলাদেশের স্থানীয় আবহাওয়া ও মৌসুম বিবেচনা করে মরিচের বীজ বপন করুন। অতিরিক্ত ঠান্ডা, জলাবদ্ধতা ও প্রচণ্ড তাপের চাপ এড়িয়ে উপযুক্ত পরিবেশে বীজ বপন করলে চারা গজানো ও বেড়ে ওঠার জন্য অনুকূল পরিস্থিতি তৈরি হয়। আপনার এলাকার আবহাওয়া অনুযায়ী বপনের সময় নির্বাচন করা ভালো।</p>

<h2>মাটি ও জমি প্রস্তুত</h2>

<p>মরিচ চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনের সুবিধাযুক্ত দোআঁশ মাটি উপযোগী। জমির মাটি ভালোভাবে ঝুরঝুরে করে পচা জৈব সার মিশিয়ে নিন। টবে চাষের ক্ষেত্রে বাগানের মাটির সঙ্গে পচা জৈব সার ও পানি নিষ্কাশনে সহায়ক উপাদান মিশিয়ে ব্যবহার করতে পারেন। মাটিতে যেন পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>

<h2>বীজ বপনের পদ্ধতি</h2>

<ol>
  <li>পরিষ্কার বীজতলা, সিড ট্রে অথবা ছোট পাত্রে ঝুরঝুরে ও আর্দ্র মাটি প্রস্তুত করুন।</li>
  <li>বীজ অল্প গভীরে বপন করে ওপর থেকে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>মাটির আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি দিয়ে জলাবদ্ধতা তৈরি করবেন না।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করে শক্ত হলে সাবধানে মূল জমি বা বড় টবে স্থানান্তর করুন।</li>
</ol>

<p><strong>পরামর্শ:</strong> চারা স্থানান্তরের সময় শিকড়ের ক্ষতি কম রাখুন। চারা লাগানোর পর প্রয়োজনমতো পানি দিন এবং প্রথম কয়েক দিন অতিরিক্ত তাপের চাপ থেকে সুরক্ষিত রাখুন।</p>

<h2>ছাদবাগান ও টবে মরিচ চাষ</h2>

<p>ছাদবাগান, বারান্দা কিংবা কিচেন গার্ডেনে খাসির শিং মরিচ চাষের জন্য পর্যাপ্ত আকারের টব ব্যবহার করুন। টবের নিচে পানি বের হওয়ার ছিদ্র থাকা জরুরি। গাছের শিকড় বিস্তারের জন্য পর্যাপ্ত মাটি রাখুন এবং টব এমন জায়গায় রাখুন, যেখানে পর্যাপ্ত সূর্যালোক পাওয়া যায়। গাছের বৃদ্ধি অনুযায়ী প্রয়োজন হলে খুঁটি বা অন্য সহায়তা দিতে পারেন।</p>

<h2>সূর্যালোক ও পানি ব্যবস্থাপনা</h2>

<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সূর্যালোক পায় এমন স্থানে গাছ রাখুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা দেখে নিয়মিত পানি দিন। গরম ও শুষ্ক আবহাওয়ায় পানির প্রয়োজন বাড়তে পারে।</li>
  <li><strong>জলাবদ্ধতা:</strong> অতিরিক্ত পানি জমতে দেবেন না, কারণ এতে শিকড়ের ক্ষতি হতে পারে।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
</ul>

<h2>সার প্রয়োগ ও পরিচর্যা</h2>

<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা জৈব সার এবং প্রয়োজনীয় সুষম সার প্রয়োগ করুন। গাছের বৃদ্ধির পর্যায় অনুযায়ী সারের পরিমাণ নির্ধারণ করুন এবং অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। নিয়মিত আগাছা পরিষ্কার করুন এবং শুকনো, হলুদ বা রোগাক্রান্ত পাতা দেখা গেলে সরিয়ে ফেলুন।</p>

<h2>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>

<p>মরিচ গাছে জাব পোকা, থ্রিপস, মাকড় ও বিভিন্ন রোগের আক্রমণ দেখা দিতে পারে। নিয়মিত গাছের কচি ডগা, পাতা ও কাণ্ড পরীক্ষা করুন। আক্রান্ত অংশ শনাক্ত হলে দ্রুত প্রয়োজনীয় ব্যবস্থা নিন। গাছের গোড়ায় অতিরিক্ত পানি জমতে দেবেন না এবং বাগানে পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন। প্রয়োজনে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিয়ে অনুমোদিত বালাইনাশক ব্যবহার করুন এবং পণ্যের নির্দেশনা ও অপেক্ষাকাল মেনে চলুন।</p>

<h2>মরিচ সংগ্রহের নিয়ম</h2>

<p>মরিচ কাঙ্ক্ষিত আকার ও রং ধারণ করলে কাঁচা অবস্থায় সংগ্রহ করতে পারেন। পরিষ্কার কাঁচি দিয়ে ডাঁটাসহ সাবধানে মরিচ তুলুন, যাতে গাছের ডাল ক্ষতিগ্রস্ত না হয়। নিয়মিত পরিপক্ব মরিচ সংগ্রহ করুন এবং গাছের পানি ও পুষ্টির চাহিদা বজায় রাখুন। ফলন ও সংগ্রহের সময় গাছের স্বাস্থ্য, আবহাওয়া, মাটির উর্বরতা এবং পরিচর্যার ওপর নির্ভর করে।</p>

<h2>কেন হাইব্রিড খাসির শিং মরিচ বীজ বেছে নেবেন?</h2>

<ul>
  <li>খাসির শিংয়ের মতো লম্বা ও বাঁকানো মরিচ চাষের উপযোগী।</li>
  <li>ঝাল ও মাংসল কাঁচা মরিচ হিসেবে রান্নায় ব্যবহার করা যায়।</li>
  <li>ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষে ব্যবহার উপযোগী।</li>
  <li>এক প্যাকেটে আনুমানিক ৫০০টি বীজ থাকায় একাধিক গাছ চাষের সুযোগ।</li>
  <li>সঠিক পরিচর্যায় সুস্থ গাছ ও ভালো ফলন পাওয়ার সম্ভাবনা।</li>
</ul>

<h2>আজই অর্ডার করুন Ss Seed Shop থেকে!</h2>

<p>নিজের বাগানে লম্বা, বাঁকানো ও ঝাল খাসির শিং মরিচ চাষের প্রস্তুতি নিন। <strong>Ss Seed Shop</strong> থেকে হাইব্রিড খাসির শিং মরিচ বীজ সংগ্রহ করুন এবং সঠিক পরিচর্যার মাধ্যমে নিজের বাগান থেকে টাটকা মরিচ উৎপাদনের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন।</strong></p>
```', 'VEG-1561', 13, 13, 1, 0, 0, '[]', '2026-09-24T01:42:42.756+00:00', '2026-10-12T11:24:42.29929+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('82be3435-926a-4049-a14c-ef63f4ade781', 'উচ্চ ফলনশীল লম্বা কালো বেগুন বীজ', 'evergreen-high-yield-long-black-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949147145-xkw7vx4.webp', NULL, 150, 65, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ২ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | বারোমাসি লম্বা কালো বেগুন, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'উচ্চ ফলনশীল লম্বা কালো বেগুন বীজ দীর্ঘ সময় ধরে বেগুন চাষের জন্য উপযোগী একটি উন্নত জাতের বীজ। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং লম্বা, আকর্ষণীয় কালো বেগুন উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ পরিমাণ: আনুমানিক ২ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1557', 10, 10, 1, 0, 0, '[]', '2026-09-24T01:42:50.417+00:00', '2026-10-12T11:24:54.26642+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('33142074-ae43-490b-8bed-1b017ad6696a', 'চায়না ইম্পোর্টেড হাইব্রিড কসমস ফুলের বীজ (মিক্স কালার)', 'china-imported-hybrid-mixed-cosmos-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732452957-m7vb8kd.webp', NULL, 210, 120, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>চায়না ইম্পোর্টেড হাইব্রিড কসমস ফুলের বীজ (মিক্স কালার)</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন গোলাপি, সাদা, লাল, বেগুনি ও অন্যান্য উজ্জ্বল রঙের মনোমুগ্ধকর ফুলে। এই হাইব্রিড জাতের কসমস দ্রুত বৃদ্ধি পায়, দীর্ঘসময় ধরে ফুল ফোটানোর জন্য উপযোগী এবং সঠিক পরিচর্যায় প্রচুর ফুল পাওয়ার সুযোগ থাকে।</p> 

<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি উপযোগী। উচ্চমানের আমদানিকৃত বীজ থেকে সঠিকভাবে চাষ করলে স্বাস্থ্যবান গাছ ও বর্ণিল ফুলের সুন্দর সমারোহ তৈরি করা সম্ভব।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🎨 <strong>ফুলের রঙ:</strong> মিক্স কালার — গোলাপি, সাদা, লাল, বেগুনিসহ বিভিন্ন আকর্ষণীয় রঙ</li> 
<li>🌸 <strong>জাত:</strong> ইম্পোর্টেড হাইব্রিড কসমস</li> 
<li>🌿 <strong>বিশেষ বৈশিষ্ট্য:</strong> দ্রুত বৃদ্ধি ও দীর্ঘসময় ফুল ফোটার উপযোগী</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার ও খোলা বাগান</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>কসমস ফুল সাধারণত <strong>মৃদু ঠান্ডা থেকে উষ্ণ আবহাওয়ায়</strong> ভালোভাবে বেড়ে ওঠে। বাংলাদেশের আবহাওয়ায় সাধারণভাবে <strong>শরৎ, শীত ও বসন্ত মৌসুমে</strong> চাষ করা সুবিধাজনক। অক্টোবর থেকে মার্চ পর্যন্ত সময়টি বীজ বপন ও ফুলের গাছ তৈরির জন্য ভালো ফল দিতে পারে। অতিরিক্ত গরম, ভারী বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলা উচিত।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>কসমস ফুলের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি</strong> উপযোগী। মাটিতে অতিরিক্ত পানি জমে থাকলে শিকড়ের স্বাভাবিক বৃদ্ধি ব্যাহত হতে পারে।</p> 

<ul> 
<li>🌱 মাটি ভালোভাবে ঝুরঝুরে করে নিন এবং আগাছা ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🏖️ মাটি বেশি ভারী হলে মোটা বালি বা পার্লাইট মিশিয়ে ড্রেনেজ উন্নত করুন।</li> 
<li>💧 পানি জমার প্রবণতা থাকলে উঁচু বেড তৈরি করুন।</li> 
<li>🌿 বীজ বপনের আগে মাটি সমান ও নরম করে নিন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>কসমসের বীজ ঝুরঝুরে ও আর্দ্র মাটিতে অল্প গভীরে বপন করুন। বীজ খুব গভীরে না দিয়ে মাটির উপর ছড়িয়ে <strong>পাতলা মাটি বা কোকোপিটের স্তর</strong> দিয়ে ঢেকে দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা কয়েকটি সুস্থ পাতা তৈরি করলে সাবধানে নির্দিষ্ট টব বা বাগানের স্থানে রোপণ করুন। গাছের মাঝে পর্যাপ্ত দূরত্ব রাখলে আলো-বাতাস চলাচল ভালো হয়।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>টব, গ্রো ব্যাগ বা ছাদবাগানে কসমস চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>কসমস ফুলের গাছ <strong>পর্যাপ্ত সূর্যালোক</strong> পছন্দ করে। প্রতিদিন কয়েক ঘণ্টা সরাসরি সূর্যের আলো পেলে গাছের বৃদ্ধি ও ফুল উৎপাদনে সহায়তা করতে পারে। খুব ছায়াযুক্ত স্থানে রাখলে গাছ দুর্বল ও লম্বা হয়ে যেতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। চারা অবস্থায় হালকা স্প্রে করে পানি দেওয়া ভালো। গাছ বড় হওয়ার পর গোড়ায় পানি দিন এবং অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p> 

<h3>🌿 পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>☀️ প্রতিদিন পর্যাপ্ত আলো পাওয়ার ব্যবস্থা করুন।</li> 
<li>💧 অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li> 
<li>🌱 নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>🍂 প্রয়োজন অনুযায়ী জৈব সার বা কম্পোস্ট প্রয়োগ করুন।</li> 
<li>✂️ শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে নতুন ফুল আসতে উৎসাহিত হতে পারে।</li> 
<li>🌬️ গাছের মাঝে পর্যাপ্ত জায়গা রাখুন, যাতে বাতাস চলাচল করতে পারে।</li> 
<li>🐛 পাতা ও কুঁড়িতে পোকামাকড়ের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
</ul> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>চায়না ইম্পোর্টেড হাইব্রিড কসমস</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষ করা যায়। সীমিত জায়গায় টব বা গ্রো ব্যাগ ব্যবহার করেও সহজেই রঙিন ফুলের বাগান তৈরি করা সম্ভব।</p> 

<h3>🌸 কেন চায়না হাইব্রিড কসমস চাষ করবেন?</h3> 
<ul> 
<li>🎨 এক প্যাকেটেই বিভিন্ন আকর্ষণীয় রঙের ফুল পাওয়ার সুযোগ</li> 
<li>🌸 দীর্ঘসময় ফুল ফোটানোর জন্য উপযোগী</li> 
<li>🌿 দ্রুত বৃদ্ধির জন্য উপযোগী হাইব্রিড জাত</li> 
<li>🏡 ছাদবাগান, বারান্দা ও হোম গার্ডেনের জন্য আকর্ষণীয়</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌺 বাগানে বর্ণিল ও দৃষ্টিনন্দন পরিবেশ তৈরি করতে সহায়ক</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>চায়না ইম্পোর্টেড হাইব্রিড কসমস ফুলের বীজ (মিক্স কালার)</strong> দিয়ে আপনার বাড়ি, বারান্দা বা ছাদবাগান সাজিয়ে তুলুন নানা রঙের সুন্দর ফুলে। সঠিক পরিচর্যায় গড়ে তুলুন প্রাণবন্ত ও বর্ণিল ফুলের বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'FUL-1502', 18, 18, 1, 0, 0, '[]', '2026-09-24T01:42:31.389+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('de91450b-64a3-4a79-9538-00e9949e77fb', 'মিষ্টি মটরশুঁটি (হাইব্রিড/উন্নত জাত)', 'sweet-pea-hybrid-improved-variety-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784178479-nahecbw.webp', NULL, 130, 30, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\",\"শাক - সবজি\"]', NULL, NULL, '[]', 'আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | মিষ্টি মটরশুঁটি, কোমল ও সুস্বাদু শুঁটি উৎপাদনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🫛 Product Short Description</h3><p>মিষ্টি মটরশুঁটি বীজ একটি হাইব্রিড/উন্নত জাতের মটরশুঁটি চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং কোমল, মিষ্টি ও সুস্বাদু মটরশুঁটি উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🫛 <strong>নিজের বাগানে তাজা মিষ্টি মটরশুঁটি চাষ করতে আজই অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌱 <strong>জাত:</strong> হাইব্রিড / উন্নত জাত</li><li>🫛 <strong>ফসল:</strong> মিষ্টি মটরশুঁটি</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>❄️ কোন কোন মৌসুমে ভালো হয়?</h3><p>মটরশুঁটি মূলত <strong>শীতকালীন ফসল</strong> এবং ঠান্ডা ও তুলনামূলক শুষ্ক আবহাওয়ায় ভালো বেড়ে ওঠে।</p><ul><li>🍂 <strong>শরৎকাল:</strong> অক্টোবরের শেষ থেকে বীজ বপন শুরু করা যায়।</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি সাধারণত চাষের জন্য সবচেয়ে উপযোগী সময়।</li><li>🌤️ <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল পরিবেশে চাষ করা যেতে পারে।</li><li>🌡️ অতিরিক্ত গরমে ফুল ও শুঁটি ধরার ক্ষেত্রে সমস্যা হতে পারে, তাই উষ্ণ মৌসুম এড়িয়ে চলা ভালো।</li></ul><h3>🪴 মিষ্টি মটরশুঁটি চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>মটরশুঁটির জন্য <strong>ঝুরঝুরে দোআঁশ বা বেলে দোআঁশ মাটি</strong> ভালো। মাটি উর্বর, জৈব পদার্থসমৃদ্ধ এবং পানি নিষ্কাশনযোগ্য হওয়া প্রয়োজন।</p><p><strong>২. জমি প্রস্তুত করুন</strong><br>জমি ২–৩ বার ভালোভাবে কোপানো বা চাষ দিয়ে মাটি ঝুরঝুরে করে নিন। আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</p><p><strong>৩. জৈব সার মেশান</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>৩০–৪০ কেজি</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। কাঁচা গোবর ব্যবহার করবেন না।</p><p><strong>৪. মাটির গঠন উন্নত করুন</strong><br>মাটি যদি খুব ভারী ও কাদামাটির মতো হয়, তাহলে পচা জৈব সার ও প্রয়োজন অনুযায়ী বালি/কোকোপিট মিশিয়ে মাটি ঝুরঝুরে করুন। এতে শিকড়ের বৃদ্ধি ও পানি নিষ্কাশন ভালো হয়।</p><p><strong>৫. বেড তৈরি করুন</strong><br>বর্ষা বা পানি জমার প্রবণতা থাকলে <strong>উঁচু বেড</strong> তৈরি করুন। বেডের মাঝে পানি বের হওয়ার জন্য নালা রাখুন।</p><p><strong>৬. চারা তৈরির মাটি</strong><br>ট্রে বা পাত্রে চারা তৈরি করতে চাইলে:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>ভালোভাবে মিশিয়ে ব্যবহার করুন।</p><p><strong>৭. বীজ বপনের আগে</strong><br>মাটি হালকা আর্দ্র রাখুন। বীজ অতিরিক্ত গভীরে বপন না করে উপযুক্ত গভীরতায় বপন করুন। অতিরিক্ত পানি দিয়ে মাটি কাদাময় করবেন না।</p><p><strong>৮. মাচা/সমর্থন</strong><br>মটরশুঁটির গাছ লতানো হলে গাছের ধরন অনুযায়ী বাঁশ, জাল বা দড়ির হালকা সমর্থন দিলে গাছ সহজে বেড়ে উঠতে পারে এবং শুঁটি সংগ্রহ করাও সহজ হয়।</p><p>💡 <strong>চাষের টিপস:</strong> পর্যাপ্ত রোদ, সঠিক পানি নিষ্কাশন এবং নিয়মিত আগাছা পরিষ্কার রাখলে গাছ সুস্থভাবে বেড়ে ওঠে। মাটিতে অতিরিক্ত পানি জমতে দেবেন না।</p><h3>🛒 অর্ডার করুন</h3><p><strong>তাজা, কোমল ও সুস্বাদু মিষ্টি মটরশুঁটি চাষের জন্য আজই উন্নতমানের বীজ অর্ডার করুন!</strong></p><h3></h3>', 'VEG-1606', 4, 4, 1, 0, 0, '[]', '2026-10-01T10:28:57.16+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ef3990f3-a9a0-41f8-95c0-174dff287760', 'চাইনিজ হাইব্রিড পার্পল বেগুন বীজ', 'chinese-hybrid-purple-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949178698-oyr0ewv.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785409787926-s7ie1bv.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785409847489-zglo9zn.webp\"]', 150, 110, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"পপুলার\",\"পরীক্ষিত\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, উজ্জ্বল বেগুনি রঙের, কোমল ও সুস্বাদু বেগুন উৎপাদনের জন্য আদর্শ।', 'চাইনিজ হাইব্রিড পার্পল বেগুন একটি উন্নত মানের ও উচ্চ ফলনশীল বেগুনের জাত, যা লম্বাটে আকৃতির আকর্ষণীয় গাঢ় বেগুনি রঙের ফল উৎপাদন করে। এর বেগুন কোমল, কম বীজযুক্ত ও সুস্বাদু হওয়ায় রান্নার জন্য অত্যন্ত উপযোগী। দ্রুত বৃদ্ধি, উচ্চ অঙ্কুরোদগম এবং দীর্ঘ সময় ফলন দেওয়ার ক্ষমতার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য জনপ্রিয়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1566', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:48:39.892+00:00', '2026-10-17T13:42:12.832489+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c1cf0e64-a7db-4431-9f7c-e16cd1e4b0d0', 'মিক্সড কালার হাইব্রিড পর্তুলিকা/টাইম ফুল বীজ', 'mixed-hybrid-portulaca-moss-rose-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732451801-jgaylda.webp', NULL, 250, 120, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"পরীক্ষিত\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের ডাবল ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'মিক্সড কালার হাইব্রিড পর্তুলিকা/টাইম ফুল বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন লাল, গোলাপি, হলুদ, সাদা, কমলা, বেগুনি ও অন্যান্য উজ্জ্বল রঙের দৃষ্টিনন্দন ফুলে। এই হাইব্রিড জাতটি কম পরিচর্যায় দ্রুত বৃদ্ধি পায় এবং প্রচুর ফুল ফোটায়। রোদপ্রিয় হওয়ায় টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং ল্যান্ডস্কেপিংয়ের জন্য এটি একটি আদর্শ নির্বাচন। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে রঙিন ফুলে বাগান ভরে থাকে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1530', 9, 9, 1, 0, 0, '[]', '2026-09-24T01:42:36.643+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b005be71-b935-4b29-a986-9bf3127a1bf7', 'রঙিন হাইব্রিড মরিচের বীজ', 'colorful-hybrid-chili-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459659672-iidlazc.webp', '[\"https:\\/\\/nkyfljjcxfrmuzsyltta.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1792459709034-2zulknu.webp\",\"https:\\/\\/nkyfljjcxfrmuzsyltta.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1792459710716-a2g1xok.webp\"]', 180, 120, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"পরীক্ষিত\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ১০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লাল, হলুদ, কমলা ও বেগুনি রঙের আকর্ষণীয়, ঝাঁজালো ও উচ্চ ফলনশীল মরিচ উৎপাদন করুন।', '<h3>🌱 Product Short Description</h3> 
<p><strong>রঙিন হাইব্রিড মরিচের বীজ</strong> একটি ব্যতিক্রমধর্মী ও দৃষ্টিনন্দন মরিচের জাত, যা গাছে বিভিন্ন উজ্জ্বল রঙের মরিচ উৎপাদনের জন্য পরিচিত। একই গাছে নানা রঙের মরিচ ধরায় এটি বাগানের সৌন্দর্য বাড়ানোর পাশাপাশি বাজারেও আকর্ষণ সৃষ্টি করতে পারে।</p> 

<p>ফলগুলো ঝাঁজালো ও সুস্বাদু এবং রান্না, সালাদ ও খাবার সাজানোর কাজে ব্যবহার করা যায়। <strong>টব, ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের</strong> জন্য উপযোগী এই জাতটি বাড়ির বাগানে রঙিন বৈচিত্র্য আনতে দারুণ একটি পছন্দ। 🌶️🌈</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> রঙিন হাইব্রিড মরিচ</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌈 রঙিন হাইব্রিড মরিচের বিশেষ বৈশিষ্ট্য</h3> 
<ul> 
<li>🌶️ বিভিন্ন উজ্জ্বল রঙের মরিচ উৎপাদনের জন্য উপযোগী</li> 
<li>🌿 একই গাছে নানা রঙের ফলের বৈচিত্র্য দেখা যেতে পারে</li> 
<li>✨ বাগানকে দৃষ্টিনন্দন ও আকর্ষণীয় করে তুলতে সহায়ক</li> 
<li>🌶️ ঝাঁজালো ও সুস্বাদু মরিচ</li> 
<li>🍲 রান্না ও বিভিন্ন খাবারে ব্যবহারযোগ্য</li> 
<li>🥗 সালাদ ও খাবার সাজানোর কাজে উপযোগী</li> 
<li>🏡 টব, ছাদবাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও ব্যবহার করা যায়</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>মরিচ উষ্ণ, রৌদ্রোজ্জ্বল ও পর্যাপ্ত আলোযুক্ত পরিবেশে ভালোভাবে বেড়ে ওঠে। বাংলাদেশে সাধারণভাবে <strong>অক্টোবর থেকে জানুয়ারি</strong> সময়টি মরিচের চারা তৈরির জন্য উপযোগী। অনুকূল পরিবেশ ও সঠিক পরিচর্যা থাকলে বছরের অন্যান্য সময়েও চাষ করা সম্ভব হতে পারে।</p> 

<p>বর্ষাকালে চাষ করলে পানি নিষ্কাশনের দিকে বিশেষ নজর দিতে হবে। অতিরিক্ত পানি বা জলাবদ্ধতা মরিচ গাছের শিকড়ের জন্য ক্ষতিকর হতে পারে।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>রঙিন হাইব্রিড মরিচের জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> ব্যবহার করা ভালো। মাটি শক্ত বা পানি জমে থাকার প্রবণতা থাকলে জৈব উপাদান ও ড্রেনেজ উপকরণ মিশিয়ে মাটির গঠন উন্নত করুন।</p> 

<ul> 
<li>🌱 মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🏖️ ভারী মাটি হলে প্রয়োজন অনুযায়ী মোটা বালি বা পার্লাইট ব্যবহার করুন।</li> 
<li>💧 পানি জমার সমস্যা থাকলে উঁচু বেড বা ভালো ড্রেনেজ ব্যবস্থা তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজ সরাসরি জমি, টব বা গ্রো ব্যাগে বপন করা যায়। তবে ভালোভাবে চারা তৈরি করে পরে নির্দিষ্ট জায়গায় রোপণ করলে পরিচর্যা সহজ হয়। ঝুরঝুরে মাটিতে বীজ <strong>প্রায় ০.৫–১ সেমি গভীরে</strong> বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</p> 

<p>বীজ বপনের পর স্প্রে করে হালকা পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া এড়িয়ে চলুন। চারা পর্যাপ্ত শক্ত হলে সাবধানে টব, গ্রো ব্যাগ বা মূল জমিতে রোপণ করুন।</p> 

<h3>🪴 টব বা গ্রো ব্যাগে চাষের মাটির মিশ্রণ</h3> 
<p>ছাদবাগান বা বারান্দায় রঙিন মরিচ চাষের জন্য নিচের মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 <strong>৪০%</strong> দোআঁশ মাটি</li> 
<li>🥥 <strong>৩০%</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%</strong> পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। এতে অতিরিক্ত পানি বের হয়ে গিয়ে শিকড় সুস্থ রাখতে সহায়তা করবে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>মরিচ গাছের ভালো বৃদ্ধি ও ফলনের জন্য প্রতিদিন <strong>প্রায় ৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন জায়গা নির্বাচন করুন। ছাদবাগান বা খোলা বারান্দা এ ক্ষেত্রে উপযোগী।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে পানি দিন। নিয়মিত আর্দ্রতা বজায় রাখুন, তবে টব বা জমিতে পানি জমতে দেবেন না। গরমের সময়ে মাটি দ্রুত শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানির পরিমাণ ও ব্যবধান সামঞ্জস্য করুন।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 নিয়মিত অল্প পরিমাণে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট প্রয়োগ করুন।</li> 
<li>🌱 আগাছা নিয়মিত পরিষ্কার রাখুন।</li> 
<li>💧 প্রয়োজন অনুযায়ী পানি দিন এবং জলাবদ্ধতা এড়িয়ে চলুন।</li> 
<li>☀️ গাছকে পর্যাপ্ত আলো ও বাতাস চলাচলের সুযোগ দিন।</li> 
<li>🌿 গাছ বেশি ভারী হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট ব্যবহার করুন।</li> 
<li>🐛 পাতার নিচে ও কচি ডগায় পোকামাকড়ের উপস্থিতি নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>✂️ শুকনো বা আক্রান্ত পাতা ও ডাল প্রয়োজন অনুযায়ী সরিয়ে ফেলুন।</li> 
</ul> 

<h3>🌶️ মরিচ সংগ্রহের পদ্ধতি</h3> 
<p>ফলের ব্যবহার অনুযায়ী মরিচ <strong>সবুজ অবস্থায় অথবা পরিপক্ব রঙ ধারণ করার পর</strong> সংগ্রহ করা যায়। বিভিন্ন রঙের পরিপক্ব মরিচ গাছকে আরও আকর্ষণীয় করে তোলে। পরিষ্কার কাঁচি দিয়ে মরিচ কাটলে গাছ ও নতুন ফলের ক্ষতি কম হয়। নিয়মিত পরিপক্ব মরিচ সংগ্রহ করলে গাছে নতুন ফল ধরার সুযোগ তৈরি হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>রঙিন হাইব্রিড মরিচ</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, টব, গ্রো ব্যাগ এবং কৃষিজমিতে চাষ করা যায়। বিশেষ করে অল্প জায়গায় রঙিন ও আকর্ষণীয় মরিচ উৎপাদনের জন্য এটি একটি চমৎকার পছন্দ।</p> 

<h3>🌟 কেন রঙিন হাইব্রিড মরিচ চাষ করবেন?</h3> 
<ul> 
<li>🌈 বিভিন্ন রঙের মরিচের আকর্ষণীয় বৈচিত্র্য</li> 
<li>🌶️ ঝাঁজালো ও সুস্বাদু ফল</li> 
<li>✨ বাগানের সৌন্দর্য বৃদ্ধি করে</li> 
<li>🥗 সালাদ ও খাবার সাজাতে ব্যবহারযোগ্য</li> 
<li>🍲 রান্নায় ব্যবহার করা যায়</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষের জন্য উপযোগী</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডানের জন্য উপযোগী</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও ব্যবহারযোগ্য</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p>আপনার বাগানে আনুন রঙের বৈচিত্র্য ও তাজা মরিচের স্বাদ। <strong>রঙিন হাইব্রিড মরিচের বীজ</strong> দিয়ে টব, ছাদবাগান বা জমিতে শুরু করুন আকর্ষণীয় মরিচ চাষ। সঠিক পরিচর্যার মাধ্যমে সুন্দর ও স্বাস্থ্যকর গাছ গড়ে তোলার লক্ষ্যে <strong>আজই অর্ডার করুন!</strong> 🌶️🌈</p>', 'VEG-1571', 19, 19, 1, 0, 0, '[]', '2026-09-24T01:48:41.025+00:00', '2026-10-20T01:28:38.190281+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b41704aa-8ca3-45b5-9bb9-99cd086ad737', 'হাইব্রিড সবুজ লম্বা বেগুন বীজ', 'hybrid-green-long-eggplant-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784054498-8g8xqdw.webp', NULL, 170, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', NULL, '<h3>🌱 Product Short Description</h3><p>হাইব্রিড সবুজ লম্বা বেগুন বীজ উন্নতমানের লম্বা সবুজ বেগুন চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং আকর্ষণীয় সবুজ লম্বা বেগুন উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষ—সব ক্ষেত্রেই চাষ করা যায়। 🍆 <strong>তাজা সবুজ লম্বা বেগুন চাষ শুরু করতে আজই অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌱 <strong>জাত:</strong> হাইব্রিড সবুজ লম্বা বেগুন</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>☀️ কোন কোন মৌসুমে ভালো হয়?</h3><p>বেগুন উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়া পছন্দ করে। বাংলাদেশে সাধারণত <strong>শীতকাল ও গ্রীষ্মকাল—দুই মৌসুমেই</strong> চাষ করা যায়।</p><ul><li>🌤️ <strong>শীতকাল:</strong> অক্টোবর–ফেব্রুয়ারি — তুলনামূলকভাবে অনুকূল সময়।</li><li>☀️ <strong>গ্রীষ্মকাল:</strong> মার্চ–জুন — সেচ ও নিয়মিত পরিচর্যার মাধ্যমে ভালোভাবে চাষ করা যায়।</li><li>🌧️ <strong>বর্ষাকাল:</strong> অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে উঁচু বেডে চাষ করলে সফলভাবে চাষ করা সম্ভব।</li></ul><h3>🪴 বেগুন চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>দোআঁশ বা বেলে দোআঁশ মাটি বেগুন চাষের জন্য ভালো। মাটি অবশ্যই ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য হওয়া উচিত। জলাবদ্ধ জমি এড়িয়ে চলুন।</p><p><strong>২. জমি/বেড প্রস্তুত করুন</strong><br>মাটি ভালোভাবে ২–৩ বার কোপানো বা চাষ দিয়ে ঝুরঝুরে করে নিন। আগাছা, শিকড় ও আবর্জনা পরিষ্কার করুন। পানি জমে থাকার সম্ভাবনা থাকলে উঁচু বেড তৈরি করুন।</p><p><strong>৩. জৈব সার মেশান</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>৪০–৫০ কেজি</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির গঠন ও জৈব পদার্থের পরিমাণ উন্নত হয়।</p><p><strong>৪. মাটির মিশ্রণ তৈরি করুন</strong><br>চারা তৈরির ক্ষেত্রে ব্যবহার করতে পারেন:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>মিশ্রণটি ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য রাখুন।</p><p><strong>৫. pH ও নিষ্কাশন</strong><br>বেগুন সাধারণত সামান্য অম্লীয় থেকে নিরপেক্ষ মাটিতে ভালো বেড়ে ওঠে। মাটিতে পানি যেন দীর্ঘসময় জমে না থাকে তা নিশ্চিত করুন।</p><p><strong>৬. চারা রোপণের আগে</strong><br>মাটি প্রস্তুতের পর কয়েকদিন রেখে দিন এবং অতিরিক্ত কাঁচা জৈব সার ব্যবহার করবেন না। রোগমুক্ত, সবল চারা নির্বাচন করে রোপণ করলে ভালো ফল পাওয়ার সম্ভাবনা বাড়ে।</p><p>💡 <strong>টিপস:</strong> বেগুন গাছের গোড়ায় পানি জমে থাকলে শিকড়ের সমস্যা ও রোগের ঝুঁকি বাড়তে পারে। তাই নিয়মিত সেচের পাশাপাশি ভালো পানি নিষ্কাশনের ব্যবস্থা রাখুন।</p>', 'VEG-1604', 10, 10, 1, 0, 0, '[]', '2026-10-01T10:26:14.482+00:00', '2026-10-19T05:50:44.819689+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fc1076dc-3a50-4f9a-a71e-7518fdca11bc', 'ইস্পাহানি রেড লং ডাটা', 'ispahani-red-long-danta-seeds-10-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783518839-6y483db.webp', NULL, 35, 0, 21, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"সেরা পণ্য\",\"পপুলার\",\"হাইব্রিড\",\"আগাম চাষ- শীতকাল\",\"প্রধান- শীতকালীন\"]', '১০ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি রেড লং ডাটা | উচ্চ ফলনশীল, দ্রুত বর্ধনশীল, আঁশবিহীন, নরম ও সুস্বাদু; ৩৫-৪০ দিনে সংগ্রহযোগ্য।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি রেড লং ডাটা</strong> একটি উচ্চ ফলনশীল ও অত্যন্ত দ্রুত বর্ধনশীল জাত। গাছের উচ্চতা প্রায় <strong>৩–৪ ফুট</strong> এবং কাণ্ডের রঙ আকর্ষণীয় লাল। এর ফল আঁশবিহীন, নরম ও সুস্বাদু হওয়ায় রান্নার জন্য উপযোগী। বীজ বপনের মাত্র <strong>৩৫–৪০ দিনের মধ্যে</strong> ফল সংগ্রহের উপযোগী হয়। সঠিক পরিচর্যায় প্রতি একরে প্রায় <strong>১৫–২০ মেট্রিক টন</strong> ফলন পাওয়া যেতে পারে।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> উচ্চ ফলনশীল<br>
<strong>🌿 বৃদ্ধি:</strong> অত্যন্ত দ্রুত বর্ধনশীল<br>
<strong>📏 গাছের উচ্চতা:</strong> ৩–৪ ফুট<br>
<strong>🔴 কাণ্ডের রঙ:</strong> লাল<br>
<strong>🥬 ফলের বৈশিষ্ট্য:</strong> আঁশবিহীন, নরম ও সুস্বাদু<br>
<strong>⏱️ সংগ্রহ:</strong> বীজ বপনের ৩৫–৪০ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ১৫–২০ মেট্রিক টন</p>', 'VEG-1601', 9, 9, 1, 0, 0, '[]', '2026-09-26T13:11:05.739+00:00', '2026-10-17T05:26:04.982544+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4ac08a98-2ab4-4ad2-a07d-c4aa2851bcac', 'চায়না হাইব্রিড হলুদ টমেটোর বীজ', 'china-hybrid-yellow-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949159153-pgl1zeu.webp', NULL, 150, 75, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | চায়না হাইব্রিড হলুদ টমেটো, শক্তিশালী গাছ ও আকর্ষণীয় ফলনের জন্য উপযোগী।', '<h3>🍅 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>চায়না হাইব্রিড হলুদ টমেটোর বীজ</strong> আকর্ষণীয় হলুদ রঙের টমেটো চাষের জন্য উপযোগী একটি উন্নত হাইব্রিড জাত। সঠিক পরিচর্যা, পর্যাপ্ত আলো, পুষ্টি ও অনুকূল পরিবেশ নিশ্চিত করলে শক্তিশালী গাছ এবং সুন্দর, স্বাস্থ্যকর ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<p>আকর্ষণীয় হলুদ রঙের কারণে এই টমেটো সাধারণ লাল টমেটোর পাশাপাশি বাগানে বৈচিত্র্য আনতে সহায়ক। <strong>বাড়ির বাগান, ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের</strong> জন্য এটি উপযোগী।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>💛 <strong>ফলের রঙ:</strong> আকর্ষণীয় হলুদ</li> 
<li>🌿 <strong>জাত:</strong> হাইব্রিড</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> বাড়ির বাগান, ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li> 
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>টমেটো তুলনামূলকভাবে <strong>মৃদু ঠান্ডা ও শুষ্ক আবহাওয়ায়</strong> ভালোভাবে বেড়ে ওঠে। বাংলাদেশের আবহাওয়ায় সাধারণত <strong>অক্টোবর থেকে ফেব্রুয়ারি</strong> সময় টমেটো চাষের জন্য উপযোগী। বর্ষাকালে অতিরিক্ত বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলা জরুরি। উষ্ণ অঞ্চলে উপযুক্ত পরিবেশ ও ব্যবস্থাপনার মাধ্যমে অন্যান্য সময়েও চাষের চেষ্টা করা যায়।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>হলুদ টমেটোর জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটিতে পানি জমে থাকলে শিকড়ের বৃদ্ধি ব্যাহত হতে পারে এবং রোগের ঝুঁকি বাড়তে পারে।</p> 

<ul> 
<li>🌱 জমির মাটি ২–৩ বার চাষ ও মই দিয়ে ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🌿 আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করুন।</li> 
<li>🍂 পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🌱 প্রয়োজন অনুযায়ী সুষম সার প্রয়োগ করুন।</li> 
<li>💧 পানি নিষ্কাশনের সুবিধার জন্য উঁচু বেড তৈরি করা ভালো।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>প্রথমে বীজতলা, সিড ট্রে বা ছোট পাত্রে ঝুরঝুরে মাটি ব্যবহার করে বীজ বপন করুন। বীজ প্রায় <strong>০.৫–১ সেমি গভীরে</strong> বপন করে পাতলা মাটি বা কোকোপিট দিয়ে ঢেকে দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>বীজ অঙ্কুরিত হওয়ার সময় মাটি হালকা আর্দ্র রাখুন এবং অতিরিক্ত পানি এড়িয়ে চলুন। চারা কয়েকটি সুস্থ পাতা তৈরি করলে ধীরে ধীরে বাইরের পরিবেশের সঙ্গে মানিয়ে নিয়ে মূল টব বা জমিতে রোপণ করুন।</p> 

<h3>🌱 চারা রোপণের পদ্ধতি</h3> 
<p>চারা রোপণের জন্য পর্যাপ্ত আলো ও ভালো পানি নিষ্কাশনযুক্ত জায়গা নির্বাচন করুন। গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন, যাতে বাতাস চলাচল করতে পারে এবং গাছের শিকড় ও ডালপালা স্বাভাবিকভাবে বৃদ্ধি পায়। চারা রোপণের পর গোড়ায় হালকা পানি দিন।</p> 

<p>গাছ বড় হওয়ার সঙ্গে সঙ্গে ফলের ভারে ডাল ভেঙে যাওয়া ঠেকাতে <strong>খুঁটি বা সাপোর্ট</strong> ব্যবহার করা যেতে পারে।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>ছাদবাগান বা টবে হলুদ টমেটো চাষের জন্য পর্যাপ্ত গভীরতার বড় টব বা গ্রো ব্যাগ ব্যবহার করা ভালো। মাটির মিশ্রণ হিসেবে ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>টমেটো গাছের জন্য <strong>পর্যাপ্ত সরাসরি সূর্যালোক</strong> অত্যন্ত গুরুত্বপূর্ণ। প্রতিদিন প্রায় ৬–৮ ঘণ্টা আলো পাওয়া যায় এমন জায়গায় গাছ রাখলে সুস্থ বৃদ্ধি ও ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। নিয়মিত ও পরিমিত সেচ বজায় রাখুন, তবে মাটিতে পানি জমতে দেবেন না। পাতায় অতিরিক্ত পানি না দিয়ে গাছের গোড়ায় পানি দেওয়া ভালো।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 গাছের গোড়ায় প্রয়োজন অনুযায়ী পচা কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>🌱 গাছের বৃদ্ধির পর্যায় অনুযায়ী প্রয়োজনীয় পুষ্টি নিশ্চিত করুন।</li> 
<li>🌿 নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>🪴 গাছ বড় হলে খুঁটি বা সাপোর্ট দিয়ে গাছকে সোজা রাখুন।</li> 
<li>✂️ অতিরিক্ত নিচের পাতা বা রোগাক্রান্ত অংশ থাকলে পরিষ্কার করুন।</li> 
<li>🐛 পাতা, কুঁড়ি ও ফলে পোকামাকড় বা রোগের লক্ষণ নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>💧 অতিরিক্ত সেচ ও জলাবদ্ধতা এড়িয়ে চলুন।</li> 
</ul> 

<h3>🍅 ফল সংগ্রহের সময়</h3> 
<p>ফল যখন জাতের স্বাভাবিক <strong>হলুদ রঙ</strong> ধারণ করতে শুরু করবে এবং পরিপক্বতার উপযুক্ত পর্যায়ে পৌঁছাবে, তখন প্রয়োজন অনুযায়ী সংগ্রহ করা যায়। টাটকা খাওয়ার জন্য গাছে আরও কিছুটা পাকার সুযোগ দেওয়া যেতে পারে। নিয়মিত পাকা বা পরিপক্ব ফল সংগ্রহ করলে গাছে নতুন ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>চায়না হাইব্রিড হলুদ টমেটো</strong> কৃষিজমি, বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বড় টব ও গ্রো ব্যাগে চাষ করা যায়। ছোট জায়গায়ও উপযুক্ত পাত্র ও সঠিক পরিচর্যার মাধ্যমে এই আকর্ষণীয় হলুদ টমেটো চাষ করা সম্ভব।</p> 

<h3>💛 কেন হলুদ টমেটো চাষ করবেন?</h3> 
<ul> 
<li>💛 আকর্ষণীয় হলুদ রঙের টমেটো উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 হাইব্রিড জাত হওয়ায় আধুনিক বাগানের জন্য আকর্ষণীয় নির্বাচন</li> 
<li>🏡 বাড়ির বাগান ও ছাদবাগানে চাষ করা যায়</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
<li>🌈 সাধারণ লাল টমেটোর পাশাপাশি বাগানে বৈচিত্র্য আনতে সহায়ক</li> 
<li>🍅 তাজা টমেটো উৎপাদনের জন্য উপযোগী</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>চায়না হাইব্রিড হলুদ টমেটোর বীজ</strong> দিয়ে আপনার বাগান বা ছাদবাগানে চাষ করুন আকর্ষণীয় হলুদ টমেটো। সঠিক পরিচর্যা, পর্যাপ্ত আলো ও পুষ্টির মাধ্যমে গড়ে তুলুন স্বাস্থ্যবান গাছ ও সুন্দর ফলের বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'VEG-1548', 22, 22, 1, 0, 0, '[]', '2026-09-24T01:42:49.626+00:00', '2026-10-14T06:04:45.512282+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d4c528bc-a718-4047-b02d-d7c10f16b397', 'উচ্চ ফলনশীল দেশি ধনিয়া পাতা বীজ', 'high-yield-local-coriander-leaf-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784186294-vuh2axs.webp', NULL, 80, 50, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', 'আনুমানিক ২০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | উচ্চ ফলনশীল দেশি ধনিয়া পাতা, সতেজ সুগন্ধি পাতা উৎপাদনে উপযোগী। আজই অর্ডার করুন!', '<h3>🌱 Product Short Description</h3><p>উচ্চ ফলনশীল দেশি ধনিয়া পাতা বীজ তাজা, সুগন্ধি ও সবুজ ধনিয়া পাতা চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে স্বাস্থ্যকর গাছ এবং ভালো পরিমাণে ধনিয়া পাতা উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান, টব এবং বাণিজ্যিক চাষ—সব ক্ষেত্রেই সহজে চাষ করা যায়। 🌿 <strong>নিজের বাগানে সতেজ ধনিয়া পাতা চাষ করতে আজই বীজ অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজের পরিমাণ:</strong> আনুমানিক ২০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌿 <strong>জাত:</strong> উচ্চ ফলনশীল দেশি ধনিয়া</li><li>🌱 <strong>ব্যবহার:</strong> ধনিয়া পাতা উৎপাদন</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>❄️ কোন কোন মৌসুমে ভালো হয়?</h3><p>ধনিয়া তুলনামূলকভাবে <strong>শীতল ও মৃদু আবহাওয়ায়</strong> ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় মূলত শীত মৌসুমে পাতা উৎপাদনের জন্য এটি বেশি উপযোগী।</p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর থেকে বপন করা যায়।</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি ধনিয়া পাতার জন্য সবচেয়ে উপযোগী সময়।</li><li>🌤️ <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল পরিবেশে চাষ করা যায়।</li><li>☀️ অতিরিক্ত গরমে গাছ দ্রুত ফুল ধরতে পারে, ফলে পাতার গুণমান ও উৎপাদন কমে যেতে পারে।</li></ul><h3>🪴 ধনিয়া পাতা চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>ধনিয়া পাতার জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী।</p><p><strong>২. মাটি ঝুরঝুরে করুন</strong><br>জমি বা বেডের মাটি ভালোভাবে ২–৩ বার কোপিয়ে ঝুরঝুরে করুন। আগাছা, পাথর ও পুরোনো শিকড় সরিয়ে ফেলুন।</p><p><strong>৩. জৈব সার ব্যবহার করুন</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>২০–৩০ কেজি</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। কাঁচা গোবর ব্যবহার করবেন না।</p><p><strong>৪. টবে ধনিয়া চাষের মাটি</strong><br>টব বা পাত্রের জন্য ব্যবহার করতে পারেন:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে নিন।</p><p><strong>৫. বীজ বপনের আগে</strong><br>ধনিয়ার বীজ সাধারণত শক্ত খোসাযুক্ত হওয়ায় বপনের আগে বীজ হালকা চাপ দিয়ে দুই ভাগ করা যেতে পারে। এতে অঙ্কুরোদগম সহজ হতে পারে। বীজ বেশি গভীরে বপন করবেন না।</p><p><strong>৬. বীজ বপন ও পানি</strong><br>মাটি হালকা আর্দ্র করে বীজ বপন করুন। বপনের পর স্প্রে করে পানি দিন। মাটি শুকিয়ে যেতে দেবেন না, তবে অতিরিক্ত পানি দিয়ে জলাবদ্ধতাও তৈরি করবেন না।</p><p><strong>৭. পর্যাপ্ত আলো</strong><br>ধনিয়া পাতার ভালো বৃদ্ধির জন্য প্রতিদিন পর্যাপ্ত সূর্যালোক প্রয়োজন। টব বা ছাদবাগানে এমন জায়গা নির্বাচন করুন যেখানে পর্যাপ্ত আলো-বাতাস পাওয়া যায়।</p><p>💡 <strong>বিশেষ টিপস:</strong> ধনিয়া পাতার জন্য অতিরিক্ত নাইট্রোজেন সার ব্যবহার না করে সুষম পরিচর্যা করুন। নিয়মিত আগাছা পরিষ্কার এবং মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখলে স্বাস্থ্যকর পাতা পাওয়া যায়।</p><h3>🛒 অর্ডার করুন</h3><p><strong>তাজা ও সুগন্ধি দেশি ধনিয়া পাতা চাষ করতে আজই উচ্চ ফলনশীল ধনিয়া বীজ অর্ডার করুন!</strong></p><h3></h3>', 'VEG-1608', 6, 6, 1, 0, 0, '[]', '2026-10-01T10:39:46.024+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('452df79d-99fe-455f-817d-57ea6aba2d75', 'হাইব্রিড ছোট পাতা পালং শাকের উন্নত বীজ', 'imp-9190-452df7', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364696464-9zfx3u4.webp', NULL, 55, 0, NULL, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-9190', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:39.899+00:00', '2026-09-30T16:29:03.292+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e6f8664d-f033-4fa5-bb98-379edc7d72ee', 'হাইব্রিড হলুদ স্কোয়াশ /বানানা জুকিনি বীজ (উন্নত জাত)', 'hybrid-yellow-squash-banana-zucchini-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364684051-zuwkfn4.webp', NULL, 150, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\"]', 'আনুমানিক ১০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, রোগপ্রতিরোধী, মিষ্টি স্বাদযুক্ত, সহজ চাষযোগ্য।', 'হাইব্রিড হলুদ স্কোয়াশ (বানানা জুকিনি) একটি উন্নত মানের হাইব্রিড জাত, যা বাংলাদেশের আবহাওয়ায় চাষের জন্য অত্যন্ত উপযোগী। এই জাতের ফল দেখতে অনেকটা কলার মতো লম্বাটে ও উজ্জ্বল হলুদ বর্ণের, স্বাদে মিষ্টি ও নরম গঠনের। এটি অত্যন্ত ফলনশীল, রোগবালাই সহনশীল এবং দ্রুত বর্ধনশীল। সালাদ, ভাজি, কারি বা রান্নার নানা পদে এটি ব্যবহার করা যায়। আমাদের বীজগুলো উচ্চ বিশুদ্ধতা ও পরিচ্ছন্নতাসহ ≥৮০% অঙ্কুরোদগম হার নিশ্চিত করে। স্বাস্থ্যকর ও জৈব পদ্ধতিতে চাষের জন্য আদর্শ।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications):

📦 বীজ সংখ্যা: আনুমানিক ১০ টি বীজ (উচ্চ গুণমানসম্পন্ন)

🌱 বিশুদ্ধতা (Purity): ৯৫%

✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%

✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%

🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1524', 0, 0, 0, 0, 0, '[]', '2026-09-24T01:42:45.454+00:00', '2026-10-12T11:24:45.594357+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c129220e-9728-43d0-8b22-1609e6e593c1', 'ইস্পাহানি মরক্কো সুপার দেশি ধনিয়া বীজ', 'ispahani-morocco-super-desi-coriander-seeds-50-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783341783-6ktan1z.webp', NULL, 60, 0, 36, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\"]', '৫০ গ্রাম (উচ্চ গুণমানসম্পন্ন) মরক্কো সুপার দেশি ধনিয়া বীজ | দ্রুত বর্ধনশীল, সুগন্ধযুক্ত, অধিক ফলনশীল ও ২৫-৩০ দিনে সংগ্রহযোগ্য।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি মরক্কো সুপার দেশি ধনিয়া বীজ</strong> একটি অধিক ফলনশীল ও দ্রুত বর্ধনশীল জাত। গাছ প্রচুর পাতা উৎপন্ন করে এবং সহজে হেলে পড়ে না। পাতা ও কাণ্ড সুগন্ধযুক্ত হওয়ায় রান্নায় ব্যবহারের জন্য উপযোগী। বীজ বপনের মাত্র <strong>২৫–৩০ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায়। প্রতি একরে সম্ভাব্য ফলন <strong>২.৫–৩ টন</strong> এবং দূরপাল্লার পরিবহনের জন্যও সুবিধাজনক।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ৫০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> অধিক ফলনশীল<br>
<strong>🌿 বৃদ্ধি:</strong> দ্রুত বর্ধনশীল<br>
<strong>🍃 বৈশিষ্ট্য:</strong> প্রচুর পাতা উৎপন্ন করে, গাছ হেলে পড়ে না<br>
<strong>🌿 সুগন্ধ:</strong> পাতা ও কাণ্ড সুগন্ধযুক্ত<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ২৫–৩০ দিনের মধ্যে<br>
<strong>📊 ফলন:</strong> প্রতি একরে ২.৫–৩ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1595', 12, 12, 1, 0, 0, '[]', '2026-09-25T16:52:39.999+00:00', '2026-10-17T05:26:05.17393+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('818e8417-b7c3-49e8-a8c9-40823a247de3', 'প্রিমিয়াম বেবি ব্লু আইজ ফুলের বীজ', 'premium-baby-blue-eyes-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732445384-pzgkhzo.webp', NULL, 150, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, আকাশি-নীল কোমল ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'প্রিমিয়াম বেবি ব্লু আইজ ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন আকাশি-নীল রঙের কোমল ও মনোমুগ্ধকর ফুল। ছোট হলেও অসংখ্য ফুল একসাথে ফুটে বাগানে এক অনন্য নান্দনিক সৌন্দর্য সৃষ্টি করে। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং গ্রাউন্ড কভার হিসেবে চাষের জন্য এটি অত্যন্ত উপযোগী। উচ্চমানের প্রিমিয়াম বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুলে ভরে ওঠে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1521', 1, 1, 1, 0, 0, '[]', '2026-09-24T01:42:35.195+00:00', '2026-10-12T11:24:30.455459+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f097854b-3041-411b-880e-7f5c1735f08e', 'হাইব্রিড স্ট্রবেরি টমেটো বীজ', 'hybrid-strawberry-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949162242-zfg65rf.webp', NULL, 120, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ২০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, স্ট্রবেরির মতো আকৃতির মিষ্টি, রসালো ও উচ্চ ফলনশীল টমেটো উৎপাদন করুন।', '<h2>হাইব্রিড স্ট্রবেরি টমেটো বীজ – আকর্ষণীয় ফল, মিষ্টি স্বাদ ও ঘরোয়া চাষের জন্য উপযোগী</h2>

<p><strong>হাইব্রিড স্ট্রবেরি টমেটো বীজ</strong> একটি আকর্ষণীয় টমেটো জাত, যার ফলের আকৃতি স্ট্রবেরির মতো দেখাতে পারে। ফলের উজ্জ্বল লাল রং, রসালো গঠন ও মিষ্টি স্বাদের কারণে এটি বাগানপ্রেমীদের কাছে বেশ আকর্ষণীয়। উপযুক্ত পরিবেশ, সঠিক পরিচর্যা ও নিয়মিত যত্ন পেলে গাছ ভালোভাবে বেড়ে উঠতে পারে এবং ফল উৎপাদনে সহায়তা পেতে পারে। ছাদ বাগান, বারান্দা, কিচেন গার্ডেন ও উপযুক্ত জমিতে চাষের জন্য এই টমেটো বিবেচনা করতে পারেন। পাকা ফল সালাদ, স্ন্যাকস এবং তাজা খাওয়ার জন্য ব্যবহার করা যায়।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> হাইব্রিড স্ট্রবেরি টমেটো বীজ</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>ফলের রং:</strong> পাকা অবস্থায় উজ্জ্বল লাল</li>
  <li><strong>ফলের আকৃতি:</strong> স্ট্রবেরির মতো আকর্ষণীয় আকৃতি</li>
  <li><strong>স্বাদ ও গঠন:</strong> মিষ্টি স্বাদের ও রসালো</li>
  <li><strong>চাষের উপযোগিতা:</strong> ছাদ বাগান, বারান্দা, কিচেন গার্ডেন ও উপযুক্ত কৃষিজমি</li>
</ul>

<h2>⭐ হাইব্রিড স্ট্রবেরি টমেটোর বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় ফলের আকৃতি:</strong> স্ট্রবেরির মতো আকৃতি বাগানে ভিন্ন মাত্রা যোগ করতে পারে।</li>
  <li><strong>উজ্জ্বল লাল রং:</strong> পাকা ফলের লাল রং খাবার পরিবেশন ও সালাদকে আকর্ষণীয় করে তোলে।</li>
  <li><strong>মিষ্টি ও রসালো স্বাদ:</strong> তাজা খাওয়া, সালাদ ও হালকা স্ন্যাকস তৈরিতে ব্যবহার করা যায়।</li>
  <li><strong>বাড়িতে চাষের সুযোগ:</strong> পর্যাপ্ত রোদ, উপযুক্ত টব ও পরিচর্যা থাকলে ছাদ বা বারান্দার বাগানে চাষ করা যায়।</li>
  <li><strong>বাগানের বৈচিত্র্য:</strong> প্রচলিত টমেটোর পাশাপাশি ভিন্ন আকৃতির টমেটো চাষে আগ্রহীদের জন্য একটি আকর্ষণীয় বিকল্প।</li>
</ul>

<h2>🌤️ বীজ বপনের উপযুক্ত সময়</h2>
<p>বাংলাদেশে সাধারণত শীতকালীন আবহাওয়া টমেটো চাষের জন্য অনুকূল। তবে এলাকার তাপমাত্রা, আবহাওয়া ও জাতের বৈশিষ্ট্য অনুযায়ী বীজ বপনের সময় নির্বাচন করুন। অতিরিক্ত গরম, ভারী বৃষ্টি ও জলাবদ্ধতা থেকে গাছকে রক্ষা করা ভালো।</p>

<h2>🪴 মাটি ও বীজতলা প্রস্তুতি</h2>
<p>টমেটো চাষের জন্য ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য মাটি বেছে নিন। বীজতলা বা চারা তৈরির ট্রেতে মাটির সঙ্গে পরিষ্কার কোকোপিট ও পরিপক্ব কম্পোস্ট মিশিয়ে হালকা, আর্দ্রতাধারণক্ষম চারা তৈরির মাধ্যম তৈরি করা যায়। ব্যবহৃত মাটি ও পাত্র পরিষ্কার রাখুন, যাতে চারার রোগের ঝুঁকি কমানো যায়।</p>

<h2>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h2>
<ol>
  <li>প্রস্তুত বীজতলা, সিডলিং ট্রে বা ছোট পাত্রে ঝুরঝুরে মাটি ভরে নিন।</li>
  <li>বীজ অল্প গভীরে বপন করে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>মাটি হালকা আর্দ্র রাখুন; অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li>চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা গজিয়ে শক্ত হলে শিকড়ের ক্ষতি না করে বড় টব বা জমিতে রোপণ করুন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন প্রায় ৬–৮ ঘণ্টা সরাসরি সূর্যালোক পায় এমন জায়গা নির্বাচন করুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা পরীক্ষা করে নিয়মিত পানি দিন। মাটি শুকিয়ে গেলে পানি দিন, তবে গোড়ায় জলাবদ্ধতা হতে দেবেন না।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের মধ্যে পর্যাপ্ত ফাঁকা জায়গা রাখুন, যাতে বাতাস চলাচল করতে পারে।</li>
  <li><strong>সাপোর্ট:</strong> গাছ বড় হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট ব্যবহার করুন, যাতে ফলের ভারে ডাল ভেঙে না যায়।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের পরিচর্যা</h2>
<p>গাছের সুস্থ বৃদ্ধি ও ফল উৎপাদনে সহায়তার জন্য মাটির উর্বরতা অনুযায়ী পরিপক্ব কম্পোস্ট এবং সুষম সার ব্যবহার করুন। অতিরিক্ত নাইট্রোজেন সার প্রয়োগ করলে পাতার বৃদ্ধি বেশি হলেও ফল উৎপাদন ব্যাহত হতে পারে। নিয়মিত আগাছা পরিষ্কার করুন, শুকনো বা রোগাক্রান্ত পাতা সরিয়ে ফেলুন এবং টবের মাটি শক্ত হয়ে গেলে ওপরের স্তর আলতোভাবে ঝুরঝুরে করুন।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>টমেটো গাছের পাতা, কাণ্ড ও ফল নিয়মিত পরীক্ষা করুন। পাতায় দাগ, পাতা কুঁকড়ে যাওয়া বা ফলে ক্ষতির লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন। আক্রান্ত গাছের অংশ সরিয়ে ফেলুন, বাগান পরিষ্কার রাখুন এবং গাছের গোড়ায় পানি জমতে দেবেন না। পোকামাকড় বা রোগের সমস্যা বাড়লে সঠিকভাবে শনাক্ত করে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন।</p>

<h2>🍅 ফল সংগ্রহ ও ব্যবহার</h2>
<p>ফল জাতের বৈশিষ্ট্য অনুযায়ী পরিপক্ব হয়ে আকর্ষণীয় লাল রং ধারণ করলে সংগ্রহ করুন। ফল সংগ্রহের সময় ডাল বা গাছের ক্ষতি না করে সাবধানে তুলুন। পাকা স্ট্রবেরি টমেটো তাজা খাওয়া, সালাদ, স্ন্যাকস এবং খাবার সাজানোর কাজে ব্যবহার করা যায়। ফলের আকার, স্বাদ ও ফলনের পরিমাণ চাষের পরিবেশ, পরিচর্যা এবং বীজের জাতগত বৈশিষ্ট্যের ওপর নির্ভর করে।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনের জন্য</h2>
<p>নিজের বাড়িতে আকর্ষণীয় টমেটো চাষ করতে চাইলে হাইব্রিড স্ট্রবেরি টমেটো বীজ হতে পারে একটি সুন্দর পছন্দ। টব বা গ্রো-ব্যাগে চাষের সময় পর্যাপ্ত জায়গা, উর্বর মাটি, ভালো পানি নিষ্কাশন এবং পর্যাপ্ত সূর্যালোক নিশ্চিত করুন। গাছের বৃদ্ধি অনুযায়ী টব নির্বাচন করুন এবং নিয়মিত পরিচর্যার মাধ্যমে সুস্থ গাছ গড়ে তুলুন।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>বাড়ির বাগানে ভিন্ন আকৃতির ও আকর্ষণীয় টমেটো চাষের জন্য সংগ্রহ করুন <strong>হাইব্রিড স্ট্রবেরি টমেটো বীজ</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যার মাধ্যমে আপনার বাগানে টমেটো চাষের অভিজ্ঞতাকে আরও আনন্দময় করে তুলুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1546', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:42:39.885+00:00', '2026-10-12T11:24:39.797109+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f179d6e0-bcc9-4c81-979f-4660d71e0795', 'হুয়াজুন F1 হাইব্রিড লম্বা কাঁচা মরিচ বীজ', 'huajun-f1-hybrid-long-green-chili-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784191623-f8pceeu.webp', NULL, 190, 55, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ৫ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হুয়াজুন F1 লম্বা কাঁচা মরিচ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>📝 Product Short Description</h3><p><strong>হুয়াজুন F1 হাইব্রিড লম্বা কাঁচা মরিচ বীজ</strong> উন্নতমানের লম্বা ও আকর্ষণীয় কাঁচা মরিচ উৎপাদনের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ গড়ে ওঠে এবং ভালো মানের মরিচ উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষ—সব ক্ষেত্রেই উপযোগী। নিয়মিত পরিচর্যা ও সঠিক সার-পানি ব্যবস্থাপনার মাধ্যমে ভালো ফলনের জন্য চাষ করতে পারেন। 🌱</p><p><strong>নিজের বাগানে হুয়াজুন F1 লম্বা কাঁচা মরিচ চাষ শুরু করতে আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>বীজের পরিমাণ:</strong> আনুমানিক ৫ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌶️ <strong>জাত:</strong> হুয়াজুন F1 হাইব্রিড লম্বা কাঁচা মরিচ</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>কাঁচা মরিচ উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়ায় ভালোভাবে বেড়ে ওঠে। বাংলাদেশে পর্যাপ্ত আলো, উষ্ণতা ও সঠিক পানি নিষ্কাশন নিশ্চিত করতে পারলে বিভিন্ন মৌশুমে মরিচ চাষ করা সম্ভব।</p><p><strong>🌱 উপযোগী সময়:</strong></p><ul><li>🍂 <strong>শীতকাল:</strong> অক্টোবর–জানুয়ারি</li><li>☀️ <strong>গ্রীষ্মকাল:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>🌧️ <strong>বর্ষার শুরু:</strong> মে–জুন, তবে পানি জমে না এমন উঁচু জমি বা বেড নির্বাচন করতে হবে।</li></ul><p>অতিরিক্ত জলাবদ্ধতা এড়িয়ে চলুন। বর্ষাকালে উঁচু বেড ও ভালো drainage ব্যবস্থা রাখা বিশেষ গুরুত্বপূর্ণ।</p><h3>🪴 কিভাবে মাটি তৈরি করবেন?</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>মরিচের জন্য <strong>ঝুরঝুরে, উর্বর দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি যেন পানি ধরে না রাখে এবং অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p>২️⃣ জমির মাটি প্রস্তুত<p>বীজ বা চারা রোপণের আগে মাটি ভালোভাবে <strong>২–৩ বার চাষ/কুপিয়ে</strong> ঝুরঝুরে করে নিন। আগাছা, পাথর ও আগের ফসলের অবশিষ্টাংশ পরিষ্কার করুন।</p>৩️⃣ জৈব সার প্রয়োগ<p>মাটির সঙ্গে ভালোভাবে পচা গোবর বা কম্পোস্ট মিশিয়ে দিন। এতে মাটির গঠন উন্নত হয় এবং গাছের শিকড় বিস্তারের জন্য উপযোগী পরিবেশ তৈরি হয়।</p><p>প্রয়োজনে মাটি পরীক্ষা করে রাসায়নিক সার ও অন্যান্য পুষ্টি উপাদানের মাত্রা নির্ধারণ করা সবচেয়ে ভালো।</p>৪️⃣ উঁচু বেড তৈরি<p>বর্ষাকালে বা পানি জমার প্রবণতা থাকলে <strong>উঁচু বেড</strong> তৈরি করে মরিচ চাষ করুন। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং শিকড়ে জলাবদ্ধতার ঝুঁকি কমে।</p>৫️⃣ চারা তৈরির মাটির মিশ্রণ<p>চারা তৈরির জন্য ব্যবহার করতে পারেন:</p><ul><li>৫০% ভালো মানের দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>মিশ্রণটি ঝুরঝুরে ও পরিষ্কার হওয়া উচিত এবং পানি নিষ্কাশনের ব্যবস্থা থাকতে হবে।</p>৬️⃣ টব বা ছাদবাগানে চাষ<p>টবে চাষের ক্ষেত্রে পর্যাপ্ত গভীরতার টব/কন্টেইনার ব্যবহার করুন। নিচে অবশ্যই drainage hole রাখুন। টবের মাটি অতিরিক্ত শক্ত করে চাপবেন না—শিকড়ের জন্য বাতাস চলাচলের সুযোগ থাকা প্রয়োজন।</p><h3>💧 পানি ও পরিচর্যা</h3><p>মাটির আর্দ্রতা নিয়মিত বজায় রাখুন, তবে অতিরিক্ত পানি দেবেন না। পানি দেওয়ার আগে মাটির উপরিভাগের আর্দ্রতা দেখে প্রয়োজন অনুযায়ী সেচ দিন। গাছের গোড়ায় পানি জমে থাকলে দ্রুত নিষ্কাশনের ব্যবস্থা করুন।</p><h3>🌿 ভালো ফলনের জন্য গুরুত্বপূর্ণ টিপস</h3><ul><li>প্রতিদিন পর্যাপ্ত রোদ পায় এমন জায়গা নির্বাচন করুন।</li><li>অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li><li>নিয়মিত আগাছা পরিষ্কার করুন।</li><li>প্রয়োজন অনুযায়ী জৈব সার ও পুষ্টি ব্যবস্থাপনা করুন।</li><li>রোগাক্রান্ত বা ক্ষতিগ্রস্ত পাতা ও ডাল দ্রুত অপসারণ করুন।</li><li>গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের সুযোগ রাখুন।</li></ul>', 'VEG-1611', 9, 9, 1, 0, 0, '[]', '2026-10-01T10:45:13.902+00:00', '2026-10-19T05:50:44.819689+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('10cab79e-4d0c-4496-bb61-3b5c28bd2115', 'হাইব্রিড লং চিলি (Erjintiao) মরিচের বীজ', 'hybrid-long-chili-erjintiao-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949154908-kl7sugh.webp', NULL, 170, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড লং চিলি (Erjintiao) মরিচ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাইব্রিড লং চিলি (Erjintiao) মরিচের বীজ লম্বা আকৃতির ঝাল মরিচ চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং লম্বা, আকর্ষণীয় মরিচ উৎপাদনে সহায়ক। ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ / ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1569', 10, 10, 1, 0, 0, '[]', '2026-09-24T01:42:51.052+00:00', '2026-10-12T11:24:55.614371+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('937130e4-72e6-4d2f-a4bb-d53aab1d3f0b', 'হাইব্রিড বিউটি মরিচ বীজ', 'hybrid-beauty-chili-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949156814-8kc1rbe.webp', NULL, 150, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"পপুলার\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, আকর্ষণীয় রঙের, ঝাঁজালো ও বাজারজাতকরণের জন্য উপযোগী মরিচ উৎপাদন করে।', '```html
<h2>হাইব্রিড বিউটি মরিচ বীজ</h2>

<p><strong>হাইব্রিড বিউটি মরিচ বীজ</strong> আকর্ষণীয় আকৃতি, মসৃণ গঠন ও সুন্দর রঙের মরিচ চাষের জন্য উপযোগী একটি হাইব্রিড জাত। উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় গাছের সুস্থ বৃদ্ধি এবং দীর্ঘ সময় ধরে মরিচ সংগ্রহের সুযোগ পাওয়া যেতে পারে। বাড়ির ছাদবাগান, বারান্দা, কিচেন গার্ডেন কিংবা বাণিজ্যিক জমিতে মরিচ চাষের জন্য এই জাতটি বিবেচনা করতে পারেন। তাজা রান্নায় ব্যবহার, শুকিয়ে সংরক্ষণ এবং বাজারজাতকরণের জন্যও মরিচ উপযোগী হতে পারে।

<h2>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h2>

<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌶️ <strong>মরিচের ধরন:</strong> হাইব্রিড বিউটি মরিচ</li>
  <li>🌿 <strong>জাতের ধরন:</strong> হাইব্রিড</li>
  <li>🏡 <strong>চাষের উপযোগিতা:</strong> ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li>
  <li>🍽️ <strong>ব্যবহার:</strong> তাজা রান্না, শুকিয়ে সংরক্ষণ ও বাজারজাতকরণ</li>
</ul>

<h2>হাইব্রিড বিউটি মরিচের বিশেষ বৈশিষ্ট্য</h2>

<ul>
  <li><strong>আকর্ষণীয় ফল:</strong> সুন্দর আকৃতি, মসৃণ গঠন ও আকর্ষণীয় রঙের মরিচ উৎপাদনের উপযোগী।</li>
  <li><strong>সুস্থ গাছের বৃদ্ধি:</strong> উপযুক্ত মাটি, পর্যাপ্ত আলো ও সুষম পুষ্টি গাছের স্বাভাবিক বৃদ্ধিতে সহায়তা করে।</li>
  <li><strong>দীর্ঘ সময় ফল সংগ্রহের সুযোগ:</strong> গাছ সুস্থ থাকলে পরিচর্যা ও পরিবেশের ওপর নির্ভর করে একাধিকবার মরিচ সংগ্রহ করা যায়।</li>
  <li><strong>বহুমুখী ব্যবহার:</strong> রান্নায় তাজা মরিচ হিসেবে ব্যবহার, শুকিয়ে সংরক্ষণ কিংবা বাজারজাতকরণের জন্য উপযোগী হতে পারে।</li>
  <li><strong>বিভিন্ন স্থানে চাষ:</strong> পর্যাপ্ত আলো ও উপযুক্ত জায়গা থাকলে বাড়ির বাগান, ছাদবাগান এবং কৃষিজমিতে চাষ করা যায়।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>

<p>বাংলাদেশের স্থানীয় আবহাওয়া ও মৌসুম বিবেচনা করে মরিচের বীজ বপন করুন। অতিরিক্ত ঠান্ডা, প্রচণ্ড গরম ও জলাবদ্ধতা এড়িয়ে উপযুক্ত পরিবেশে বীজ বপন করা ভালো। আপনার এলাকার আবহাওয়া ও চাষের পরিবেশ অনুযায়ী বপনের সময় নির্ধারণ করুন।</p>

<h2>মাটি ও বীজতলা প্রস্তুত</h2>

<p>মরিচ চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনের সুবিধাযুক্ত দোআঁশ মাটি উপযোগী। বীজতলা বা সিড ট্রেতে পরিষ্কার ও ঝুরঝুরে বীজ বপনের মিশ্রণ ব্যবহার করুন। মূল জমি বা টবের মাটিতে ভালোভাবে পচা জৈব সার মিশিয়ে নিলে গাছের বৃদ্ধির জন্য প্রয়োজনীয় পুষ্টি সরবরাহে সহায়তা পাওয়া যায়।</p>

<h2>বীজ বপনের নিয়ম</h2>

<ol>
  <li>প্রথমে পরিষ্কার সিড ট্রে, ছোট পাত্র অথবা বীজতলায় আর্দ্র ও ঝুরঝুরে মাটি প্রস্তুত করুন।</li>
  <li>বীজ অল্প গভীরে বপন করে ওপর থেকে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>মাটির আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি দেবেন না।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করে শক্ত হলে সাবধানে মূল জমি বা বড় টবে স্থানান্তর করুন।</li>
  <li>চারা স্থানান্তরের পর প্রয়োজনমতো পানি দিন এবং প্রথম কয়েক দিন অতিরিক্ত তাপের চাপ থেকে রক্ষা করুন।</li>
</ol>

<h2>ছাদবাগান ও টবে মরিচ চাষ</h2>

<p>ছাদবাগান, বারান্দা বা কিচেন গার্ডেনে মরিচ চাষের জন্য উপযুক্ত আকারের টব ব্যবহার করুন। টবের নিচে পানি নিষ্কাশনের ছিদ্র থাকা জরুরি। টবে বাগানের মাটির সঙ্গে পচা জৈব সার ও পানি নিষ্কাশনে সহায়ক উপাদান মিশিয়ে ব্যবহার করতে পারেন। গাছ এমন জায়গায় রাখুন, যেখানে পর্যাপ্ত সূর্যালোক পাওয়া যায়। গাছের বৃদ্ধি অনুযায়ী পানি ও পুষ্টির ব্যবস্থা করুন এবং প্রয়োজনমতো শুকনো পাতা পরিষ্কার করুন।</p>

<h2>সূর্যালোক ও পানি ব্যবস্থাপনা</h2>

<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সূর্যালোক পায় এমন স্থানে গাছ রাখুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা দেখে নিয়মিত পানি দিন। গরম ও শুষ্ক আবহাওয়ায় পানির প্রয়োজন বাড়তে পারে।</li>
  <li><strong>জলাবদ্ধতা:</strong> টব বা জমিতে অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
</ul>

<h2>সার প্রয়োগ ও গাছের পরিচর্যা</h2>

<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা জৈব সার এবং প্রয়োজনীয় সুষম সার প্রয়োগ করুন। গাছের বয়স ও বৃদ্ধির পর্যায় অনুযায়ী সারের পরিমাণ নির্ধারণ করুন। অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। নিয়মিত আগাছা পরিষ্কার করুন এবং শুকনো, হলুদ বা রোগাক্রান্ত পাতা দেখা গেলে সরিয়ে ফেলুন। গাছের বৃদ্ধি ও ফল ধারণের সময় পানি এবং পুষ্টির চাহিদার দিকে বিশেষ নজর দিন।</p>

<h2>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>

<p>মরিচ গাছে জাব পোকা, থ্রিপস, মাকড় এবং বিভিন্ন রোগের আক্রমণ দেখা দিতে পারে। নিয়মিত পাতার নিচের অংশ, কচি ডগা ও কাণ্ড পরীক্ষা করুন। আক্রান্ত পাতা বা ডাল শনাক্ত হলে দ্রুত প্রয়োজনীয় ব্যবস্থা নিন। অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতা এড়িয়ে চলুন এবং গাছের চারপাশে পর্যাপ্ত বাতাস চলাচল নিশ্চিত করুন। প্রয়োজনে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিয়ে অনুমোদিত বালাইনাশক ব্যবহার করুন এবং ব্যবহারের নির্দেশনা ও অপেক্ষাকাল মেনে চলুন।</p>

<h2>মরিচ সংগ্রহ ও সংরক্ষণ</h2>

<p>মরিচের জাত অনুযায়ী কাঙ্ক্ষিত আকার ও রং ধারণ করলে সংগ্রহ করুন। পরিষ্কার কাঁচি দিয়ে ডাঁটাসহ সাবধানে মরিচ তুলুন, যাতে গাছের ডাল ক্ষতিগ্রস্ত না হয়। তাজা মরিচ ব্যবহারের জন্য পরিষ্কার ও শুকনো স্থানে রাখুন। শুকিয়ে সংরক্ষণ করতে চাইলে ভালোভাবে পরিপক্ব ও সুস্থ মরিচ বেছে নিয়ে পরিষ্কার জায়গায় যথাযথভাবে শুকিয়ে আর্দ্রতামুক্ত পাত্রে সংরক্ষণ করুন। ফলন ও সংগ্রহের সময় আবহাওয়া, গাছের স্বাস্থ্য এবং পরিচর্যার ওপর নির্ভর করে।</p>

<h2>কেন হাইব্রিড বিউটি মরিচ বীজ বেছে নেবেন?</h2>

<ul>
  <li>আকর্ষণীয় আকৃতি ও মসৃণ গঠনের মরিচ চাষের উপযোগী।</li>
  <li>ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষে ব্যবহার করা যায়।</li>
  <li>তাজা রান্না ও শুকিয়ে সংরক্ষণের জন্য মরিচ উৎপাদনের সুযোগ।</li>
  <li>এক প্যাকেটে আনুমানিক ২৫০টি বীজ।</li>
  <li>সঠিক পরিচর্যা ও অনুকূল পরিবেশে ভালো ফলন পাওয়ার সম্ভাবনা।</li>
</ul>

<h2>আজই অর্ডার করুন Ss Seed Shop থেকে!</h2>

<p>নিজের ছাদবাগান, বারান্দা কিংবা কৃষিজমিতে মরিচ চাষের পরিকল্পনা করছেন? সংগ্রহ করুন <strong>হাইব্রিড বিউটি মরিচ বীজ</strong>। উপযুক্ত মাটি, পর্যাপ্ত সূর্যালোক, সুষম পুষ্টি ও নিয়মিত পরিচর্যার মাধ্যমে নিজের বাগানে মরিচ উৎপাদনের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন।</strong></p>
```', 'VEG-1562', 7, 7, 1, 0, 0, '[]', '2026-09-24T01:42:43.073+00:00', '2026-10-17T08:33:35.152489+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d6dc58cb-037d-43a4-b3b3-9614ad4e0896', 'প্রিমিয়াম গোলাপী জিনিয়া ফুলের বীজ', 'premium-pink-zinnia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732456998-qtgys7f.webp', NULL, 250, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, গোলাপী বড় দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 Product Short Description</h3>
<p><strong>প্রিমিয়াম গোলাপী জিনিয়া ফুলের বীজ</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন উজ্জ্বল গোলাপী রঙের বড় ও আকর্ষণীয় ফুলে। এই প্রিমিয়াম জাতটি সঠিক পরিচর্যা ও অনুকূল পরিবেশে দ্রুত বৃদ্ধি, দীর্ঘসময় ফুল ধারণ এবং প্রচুর ফুল উৎপাদনে সহায়ক।</p>

<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও সঠিক পানি ব্যবস্থাপনার মাধ্যমে স্বাস্থ্যবান গাছ এবং দীর্ঘসময় ধরে বর্ণিল গোলাপী ফুলের সৌন্দর্য উপভোগ করতে পারেন। 🌸</p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌸 <strong>ফুলের নাম:</strong> গোলাপী জিনিয়া (Pink Zinnia)</li>
<li>🎨 <strong>ফুলের রঙ:</strong> উজ্জ্বল গোলাপী</li>
<li>🌱 <strong>জাত:</strong> প্রিমিয়াম জিনিয়া</li>
<li>✨ <strong>ফুলের বৈশিষ্ট্য:</strong> বড়, আকর্ষণীয় ও দৃষ্টিনন্দন ফুল</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>জিনিয়া উষ্ণ, রৌদ্রোজ্জ্বল ও তুলনামূলক শুষ্ক আবহাওয়া পছন্দ করে। বাংলাদেশের আবহাওয়ায় পর্যাপ্ত আলো ও ভালো পানি নিষ্কাশনের ব্যবস্থা থাকলে বিভিন্ন সময়ে চাষ করা যায়।</p>

<ul>
<li>🍂 <strong>শরৎ:</strong> সেপ্টেম্বর–অক্টোবর — বীজ বপনের জন্য ভালো সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> অক্টোবর–ফেব্রুয়ারি — ফুল ফোটার জন্য অন্যতম উপযোগী সময়।</li>
<li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পেতে পারে।</li>
<li>☀️ <strong>গ্রীষ্মের শুরু:</strong> পর্যাপ্ত রোদ ও ভালো ড্রেনেজ থাকলে চাষ করা যায়।</li>
</ul>

<p>অতিরিক্ত বৃষ্টি, দীর্ঘসময় মেঘলা আবহাওয়া এবং জলাবদ্ধতা এড়িয়ে চলা ভালো।</p>

<h3>🪴 গোলাপী জিনিয়া ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
জিনিয়া ফুলের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি যেন খুব শক্ত বা কাদাযুক্ত না হয় এবং অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p>

<p><strong>২. জমি বা ফুলের বেড প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা, শুকনো শিকড় ও আবর্জনা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে মাটি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
মাটির উর্বরতা বৃদ্ধির জন্য ভালোভাবে পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির গঠন উন্নত হয় এবং গাছের শিকড় বৃদ্ধিতে সহায়তা করে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br>
জিনিয়া গাছের গোড়ায় দীর্ঘসময় পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে। তাই জমিতে প্রয়োজন অনুযায়ী <strong>উঁচু বেড ও ড্রেনেজ নালা</strong> তৈরি করুন। টবে চাষ করলে নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন।</p>

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3>
<p>টব, গ্রো ব্যাগ বা ছাদবাগানে গোলাপী জিনিয়া চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p>

<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>জিনিয়ার বীজ সরাসরি মাটিতে বা বীজতলায় বপন করা যায়। ঝুরঝুরে মাটির ওপর বীজ ছড়িয়ে দিয়ে খুব পাতলা করে মাটি বা কোকোপিট দিয়ে ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না।</p>

<p>বীজ বপনের পর হালকা স্প্রে করে পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা শক্ত ও স্বাস্থ্যবান হলে প্রয়োজন অনুযায়ী বড় টব বা ফুলের বেডে রোপণ করুন।</p>

<p>চারা রোপণের সময় গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন। এতে বাতাস চলাচল ভালো থাকবে এবং গাছের শাখা-প্রশাখা ছড়িয়ে সুন্দর আকৃতি তৈরি করতে সহায়তা করবে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন <strong>৫–৬ ঘণ্টা বা তার বেশি সরাসরি সূর্যালোক</strong> পেলে জিনিয়া ভালোভাবে বেড়ে উঠতে পারে।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে টব বা জমিতে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌿 গাছের চারপাশের আগাছা নিয়মিত পরিষ্কার রাখুন।</li>
<li>💨 গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন।</li>
</ul>

<h3>🌸 বেশি ফুল পাওয়ার জন্য পরিচর্যার টিপস</h3>
<ul>
<li>🌞 পর্যাপ্ত সূর্যালোক নিশ্চিত করুন।</li>
<li>🍂 নিয়মিত পরিমাণমতো পচা কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li>
<li>💧 মাটির আর্দ্রতা বজায় রাখুন, তবে জলাবদ্ধতা হতে দেবেন না।</li>
<li>✂️ শুকিয়ে যাওয়া ফুল নিয়মিত তুলে ফেললে নতুন ফুল আসতে উৎসাহিত হতে পারে।</li>
<li>🐛 পাতা, কুঁড়ি বা ফুলে পোকামাকড়ের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li>
<li>🌱 অতিরিক্ত ঘন করে গাছ লাগানো এড়িয়ে চলুন।</li>
</ul>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🏠 বারান্দা</li>
<li>🌸 ফুলের বেড</li>
<li>🌿 বর্ডার প্ল্যান্টিং</li>
<li>🌱 খোলা বাগান</li>
</ul>

<h3>🌸 প্রিমিয়াম গোলাপী জিনিয়ার বিশেষ আকর্ষণ</h3>
<p>উজ্জ্বল গোলাপী রঙের বড় ও আকর্ষণীয় ফুলের কারণে এই জিনিয়া বাগানের সৌন্দর্য বাড়াতে চমৎকার ভূমিকা রাখতে পারে। সঠিক পরিচর্যায় দীর্ঘসময় ফুল ধরে রাখার পাশাপাশি বাগানে একটি <strong>দৃষ্টিনন্দন ও বর্ণিল পরিবেশ</strong> তৈরি করতে সহায়তা করে।</p>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>আপনার বাড়ি, বারান্দা বা ছাদবাগানকে উজ্জ্বল গোলাপী ফুলে সাজাতে আজই প্রিমিয়াম গোলাপী জিনিয়া ফুলের বীজ অর্ডার করুন! 🌸💗</strong></p>', 'FUL-1518', 24, 24, 1, 0, 0, '[]', '2026-09-24T01:42:34.699+00:00', '2026-10-17T05:26:04.35641+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2997e39b-fdff-4b3e-94d7-74d2bee74ad6', 'ফুলকপি বীজ', 'cauliflower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1788796751243-0a4oo54.webp', NULL, 150, 110, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | উন্নত ফুলকপি বীজ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🥦 উন্নতমানের ফুলকপি বীজ</h3>

<p><strong>উন্নতমানের ফুলকপি বীজ</strong> সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর, সুগঠিত ফুলকপি উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান, টব ও বাণিজ্যিক চাষ—বিভিন্ন ধরনের চাষাবাদের জন্য এটি উপযোগী। সঠিক মাটি, পর্যাপ্ত আলো, পানি ও পুষ্টি ব্যবস্থাপনার মাধ্যমে ভালো ফলন পাওয়ার সম্ভাবনা রয়েছে।</p>

<h3>📋 Product Specifications</h3>

<ul>
<li><strong>📦 বীজের পরিমাণ:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৯০%</li>
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>🌍 উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>

<ul>
<li>🥦 উন্নতমানের ফুলকপি বীজ</li>
<li>🌱 শক্তিশালী গাছ বৃদ্ধিতে সহায়ক</li>
<li>🥦 সুন্দর ও সুগঠিত ফুলকপি উৎপাদনের জন্য উপযোগী</li>
<li>🌿 সঠিক পরিচর্যায় ভালো ফলনের সম্ভাবনা</li>
<li>🏡 বাড়ির বাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li>
<li>🏢 ছাদবাগান ও টবেও চাষ করা যায়</li>
<li>🧑‍🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li>
</ul>

<h3>📅 চাষের উপযুক্ত সময়</h3>

<p>ফুলকপি সাধারণত শীতল ও মৃদু আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে সাধারণত <strong>অক্টোবর থেকে জানুয়ারি</strong> সময় ফুলকপি চাষের জন্য উপযোগী। স্থানীয় আবহাওয়া ও জাতের বৈশিষ্ট্য অনুযায়ী বীজ বপন ও চারা রোপণের সময় সামঞ্জস্য করা ভালো।</p>

<h3>🌱 মাটি প্রস্তুতি</h3>

<p>ফুলকপির জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশন সুবিধাযুক্ত দোআঁশ মাটি ভালো। জমি ভালোভাবে প্রস্তুত করে পচা গোবর বা কম্পোস্ট মাটির সঙ্গে মিশিয়ে নিতে পারেন। মাটিতে পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে, তাই ভালো ড্রেনেজ নিশ্চিত করা জরুরি।</p>

<ul>
<li>মাটি ২–৩ বার চাষ বা কুপিয়ে ঝুরঝুরে করুন।</li>
<li>পর্যাপ্ত পচা জৈব সার বা কম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li>
<li>প্রয়োজনে উঁচু বেড তৈরি করে পানি নিষ্কাশনের ব্যবস্থা করুন।</li>
</ul>

<h3>🌿 বীজ বপন ও চারা তৈরি</h3>

<p>ফুলকপির বীজ প্রথমে সিড ট্রে, নার্সারি বেড বা ছোট পাত্রে বপন করে চারা তৈরি করা যায়। ঝুরঝুরে ও হালকা মাটিতে বীজ বপন করে পাতলা মাটি দিয়ে ঢেকে হালকা পানি দিতে হবে। চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন। শক্তিশালী ও সুস্থ চারা তৈরি হলে মূল জমি বা বড় পাত্রে স্থানান্তর করা যায়।</p>

<p><strong>পরামর্শ:</strong> চারা স্থানান্তরের সময় শিকড়ের চারপাশের মাটি যতটা সম্ভব অক্ষত রাখলে চারা নতুন পরিবেশে দ্রুত মানিয়ে নিতে সহায়তা করতে পারে।</p>

<h3>🪴 টব ও ছাদবাগানে চাষ</h3>

<p>বাড়ির বাগান বা ছাদবাগানে বড় টব, গ্রো ব্যাগ বা উপযুক্ত পাত্রে ফুলকপি চাষ করা যায়। পাত্রে পর্যাপ্ত গভীরতা এবং ড্রেনেজ ছিদ্র থাকা প্রয়োজন। উর্বর মাটি, কোকোপিট ও পচা কম্পোস্টের উপযুক্ত মিশ্রণ ব্যবহার করলে গাছের বৃদ্ধির জন্য ভালো পরিবেশ তৈরি হতে পারে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>

<p>ফুলকপি গাছের সুস্থ বৃদ্ধি ও ভালো ফুলকপি তৈরির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন পর্যাপ্ত আলো পাওয়া যায় এমন স্থানে চাষ করা ভালো। মাটি শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিতে হবে। তবে অতিরিক্ত পানি দিয়ে জলাবদ্ধতা তৈরি করা উচিত নয়।</p>

<h3>🌿 সার ও পরিচর্যা</h3>

<ul>
<li>গাছের বৃদ্ধির পর্যায় অনুযায়ী পরিমিত জৈব সার বা কম্পোস্ট ব্যবহার করুন।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন।</li>
<li>মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখুন, তবে পানি জমতে দেবেন না।</li>
<li>ফুলকপি গঠনের সময় গাছের পুষ্টির চাহিদার দিকে বিশেষ নজর দিন।</li>
<li>দুর্বল বা রোগাক্রান্ত পাতা প্রয়োজন অনুযায়ী অপসারণ করুন।</li>
</ul>

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3>

<p>ফুলকপিতে বিভিন্ন ধরনের পোকামাকড় ও রোগের আক্রমণ হতে পারে। নিয়মিত পাতার নিচের অংশ ও গাছের নতুন অংশ পরীক্ষা করুন। আক্রান্ত পাতা বা গাছের অংশ দ্রুত সরিয়ে ফেলুন এবং জমি পরিষ্কার রাখুন। অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতা এড়িয়ে পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত বালাইনাশক বা জৈব ব্যবস্থাপনা পদ্ধতি লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h3>🥦 ফুলকপি সংগ্রহ</h3>

<p>ফুলকপি যখন ভালোভাবে গঠিত, দৃঢ় ও পরিপক্ব হবে এবং ফুলের অংশগুলো আলাদা হয়ে যাওয়ার আগেই সংগ্রহ করা ভালো। অতিরিক্ত দেরি করলে ফুলকপির গুণমান ও আকৃতি ক্ষতিগ্রস্ত হতে পারে। তাই উপযুক্ত আকার ও পরিপক্বতা অনুযায়ী সময়মতো সংগ্রহ করুন।</p>

<h3>🏡 কোথায় চাষ করা যায়?</h3>

<ul>
<li>🏠 বাড়ির আঙিনা ও কিচেন গার্ডেন</li>
<li>🏢 ছাদবাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌿 ছোট বাগান</li>
<li>🌾 খোলা জমি</li>
<li>🧑‍🌾 বাণিজ্যিক কৃষি</li>
</ul>

<h3>💚 কেন এই ফুলকপি বীজ চাষ করবেন?</h3>

<p>উন্নতমানের বীজ, <strong>≥৯০% অঙ্কুরোদগমের হার</strong> এবং সঠিক পরিচর্যার মাধ্যমে শক্তিশালী গাছ ও সুগঠিত ফুলকপি উৎপাদনের সম্ভাবনা—সব মিলিয়ে বাড়ির বাগান থেকে শুরু করে বাণিজ্যিক চাষের জন্য এটি একটি উপযোগী নির্বাচন।</p>

<p><strong>🌱 ভালো ফলনের জন্য আজই আপনার ফুলকপি বীজ অর্ডার করুন এবং চাষ শুরু করুন!</strong></p>', 'VEG-1514', 10, 10, 1, 0, 0, '[]', '2026-09-24T01:46:41.197+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('62b03797-03eb-4919-92a0-83943a5cda5e', 'হাইব্রিড চেরি টমেটো বীজ (ক্যাসকেড ওয়াটারফল)', 'hybrid-cherry-tomato-cascade-waterfall-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949159990-gs9jq0q.webp', NULL, 160, 75, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | ক্যাসকেড ওয়াটারফল হাইব্রিড চেরি টমেটো, গুচ্ছাকারে ফল ও ভালো ফলনের জন্য উপযোগী।', '<h3>🍅 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>হাইব্রিড চেরি টমেটো (ক্যাসকেড ওয়াটারফল) বীজ</strong> ছোট আকৃতির, আকর্ষণীয় ও সুস্বাদু চেরি টমেটো উৎপাদনের জন্য উপযোগী। এই জাতের গাছে ফলগুলো ডালের ওপর <strong>গুচ্ছাকারে ঝুলে থাকার</strong> কারণে গাছটি দেখতে অত্যন্ত আকর্ষণীয় হয় এবং ছাদবাগান বা বাড়ির বাগানে বাড়তি সৌন্দর্য যোগ করে।</p> 

<p>টব, গ্রো ব্যাগ, ছাদবাগান ও বাড়ির বাগানের পাশাপাশি উপযুক্ত ব্যবস্থাপনায় বাণিজ্যিক চাষের জন্যও এটি ব্যবহার করা যায়। সঠিক পরিচর্যা, পর্যাপ্ত আলো, পুষ্টি ও পানি ব্যবস্থাপনা নিশ্চিত করলে স্বাস্থ্যবান গাছ ও ভালো ফলন পাওয়ার সুযোগ থাকে।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🍅 <strong>ফলের ধরন:</strong> ছোট আকৃতির চেরি টমেটো</li> 
<li>🌿 <strong>বিশেষ বৈশিষ্ট্য:</strong> ডালে গুচ্ছাকারে ঝুলে থাকা আকর্ষণীয় ফল</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, গ্রো ব্যাগ, ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষ</li> 
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>চেরি টমেটো সাধারণত <strong>মৃদু ঠান্ডা ও শুষ্ক আবহাওয়ায়</strong> ভালোভাবে বেড়ে ওঠে। বাংলাদেশের আবহাওয়ায় সাধারণভাবে <strong>অক্টোবর থেকে ফেব্রুয়ারি</strong> সময়টি চাষের জন্য উপযোগী। শীতের মৌসুমে পর্যাপ্ত রোদ ও নিয়ন্ত্রিত সেচ পেলে গাছের বৃদ্ধি ও ফল উৎপাদনে সহায়তা করতে পারে। অতিরিক্ত বৃষ্টি, জলাবদ্ধতা ও প্রচণ্ড গরম এড়িয়ে চলা ভালো।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>চেরি টমেটোর জন্য <strong>উর্বর, ঝুরঝুরে ও ভালো পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> উপযোগী। মাটিতে পানি জমে থাকলে শিকড় দুর্বল হতে পারে এবং রোগের ঝুঁকি বাড়তে পারে।</p> 

<ul> 
<li>🌱 মাটি ২–৩ বার চাষ বা কোদাল দিয়ে ভালোভাবে ঝুরঝুরে করুন।</li> 
<li>🌿 আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করুন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট ভালোভাবে মিশিয়ে দিন।</li> 
<li>🏖️ ভারী মাটিতে প্রয়োজন অনুযায়ী মোটা বালি বা পার্লাইট ব্যবহার করুন।</li> 
<li>💧 পানি নিষ্কাশনের সমস্যা থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজতলা বা সিড ট্রেতে ঝুরঝুরে ও জীবাণুমুক্ত/পরিষ্কার বীজতলা মিশ্রণ ব্যবহার করে বীজ বপন করুন। বীজ প্রায় <strong>০.৫–১ সেমি গভীরে</strong> বপন করে পাতলা মাটি বা কোকোপিট দিয়ে ঢেকে দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন এবং অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা কয়েকটি সুস্থ পাতা তৈরি করলে ধীরে ধীরে বাইরের পরিবেশের সঙ্গে মানিয়ে নিয়ে বড় টব, গ্রো ব্যাগ বা জমিতে রোপণ করুন।</p> 

<h3>🌱 চারা রোপণ ও গাছের সাপোর্ট</h3> 
<p>চারা রোপণের জন্য এমন জায়গা নির্বাচন করুন যেখানে পর্যাপ্ত সূর্যালোক ও ভালো বাতাস চলাচল রয়েছে। গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন, যাতে পাতায় আলো-বাতাস পৌঁছাতে পারে।</p> 

<p><strong>ক্যাসকেড ওয়াটারফল</strong> ধরনের চেরি টমেটোর ফল গুচ্ছাকারে ঝুলে থাকায় গাছ বড় হওয়ার সঙ্গে সঙ্গে শক্ত <strong>খুঁটি, ট্রেলিস বা সাপোর্ট</strong> দেওয়া উপকারী। এতে ডালপালা ও ফলের গুচ্ছ মাটিতে পড়ে যাওয়ার ঝুঁকি কমে এবং গাছকে সুন্দরভাবে পরিচালনা করা সহজ হয়।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>টব বা গ্রো ব্যাগে চেরি টমেটো চাষের জন্য পর্যাপ্ত গভীরতার পাত্র ব্যবহার করুন। মাটির মিশ্রণ হিসেবে ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি, যাতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>চেরি টমেটো গাছের জন্য <strong>প্রচুর সূর্যালোক</strong> প্রয়োজন। প্রতিদিন প্রায় ৬–৮ ঘণ্টা আলো পাওয়া যায় এমন জায়গায় গাছ রাখলে সুস্থ বৃদ্ধি ও ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। মাটির আর্দ্রতা তুলনামূলকভাবে স্থির রাখুন, তবে অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন। পাতায় পানি না দিয়ে গাছের গোড়ায় পানি দেওয়া ভালো।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 গাছের গোড়ায় প্রয়োজন অনুযায়ী পচা কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>🌱 গাছের বৃদ্ধির পর্যায় অনুযায়ী প্রয়োজনীয় পুষ্টি নিশ্চিত করুন।</li> 
<li>🌿 নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>🪴 গাছ বড় হওয়ার সঙ্গে সঙ্গে খুঁটি বা ট্রেলিসে গাছ বেঁধে দিন।</li> 
<li>✂️ প্রয়োজন অনুযায়ী অতিরিক্ত বা রোগাক্রান্ত পাতা পরিষ্কার করুন।</li> 
<li>🐛 পাতা, কুঁড়ি ও ফল নিয়মিত পর্যবেক্ষণ করে পোকামাকড় বা রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
<li>💧 অতিরিক্ত সেচ ও জলাবদ্ধতা এড়িয়ে চলুন।</li> 
</ul> 

<h3>🍅 ফল সংগ্রহের সময়</h3> 
<p>চেরি টমেটো যখন জাতের স্বাভাবিক রঙ ধারণ করে এবং ফল পরিপক্ব হতে শুরু করে, তখন প্রয়োজন অনুযায়ী সংগ্রহ করা যায়। সম্পূর্ণ পাকা ফলের স্বাদ ও মিষ্টতা বেশি উপভোগ করা যায়। নিয়মিত পরিপক্ব ফল সংগ্রহ করলে গাছে নতুন ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>হাইব্রিড চেরি টমেটো (ক্যাসকেড ওয়াটারফল)</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, বড় টব, গ্রো ব্যাগ এবং কৃষিজমিতে চাষ করা যায়। গুচ্ছাকারে ঝুলে থাকা ফলের কারণে এটি বাগানের সৌন্দর্য বৃদ্ধির জন্যও আকর্ষণীয়।</p> 

<h3>🍅 কেন ক্যাসকেড ওয়াটারফল চেরি টমেটো চাষ করবেন?</h3> 
<ul> 
<li>🍅 ছোট আকৃতির আকর্ষণীয় চেরি টমেটো উৎপাদনের জন্য উপযোগী</li> 
<li>🌿 ডালে গুচ্ছাকারে ঝুলে থাকা ফল বাগানের সৌন্দর্য বাড়ায়</li> 
<li>🏡 ছাদবাগান ও টবের জন্য উপযোগী</li> 
<li>🌱 সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ ও ভালো ফলন পাওয়ার সুযোগ</li> 
<li>🌾 বাণিজ্যিক চাষেও ব্যবহার করা যায়</li> 
<li>🌈 সাধারণ টমেটোর পাশাপাশি বাগানে বৈচিত্র্য আনতে সহায়ক</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>হাইব্রিড চেরি টমেটো (ক্যাসকেড ওয়াটারফল) বীজ</strong> দিয়ে আপনার ছাদবাগান, টব বা বাড়ির বাগানে চাষ করুন গুচ্ছাকারে ঝুলে থাকা আকর্ষণীয় চেরি টমেটো। সঠিক পরিচর্যায় গড়ে তুলুন সুন্দর ও উৎপাদনশীল টমেটোর বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'VEG-1554', 9, 9, 1, 0, 0, '[]', '2026-09-24T01:42:49.786+00:00', '2026-10-19T09:17:51.717064+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('6db7d372-4f6c-49b1-a18f-50363b072483', 'ইস্পাহানি এগ্রো রুপসা গ্রীণ-হাইব্রিড পুঁইশাক বীজ', 'ispahani-rupsa-green-hybrid-pui-shak-seeds-10-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783404362-myhzkfp.webp', NULL, 30, 0, 18, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"হাইব্রিড\",\"পপুলার\",\"সেরা পণ্য\"]', '১০ গ্রাম (উচ্চ গুণমানসম্পন্ন) রুপসা গ্রীণ হাইব্রিড পুঁইশাক বীজ | দ্রুত ফলনশীল, নরম কাণ্ড, উজ্জ্বল সবুজ পাতা ও ২০-২৫ টন ফলন।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি এগ্রো রুপসা গ্রীণ-হাইব্রিড পুঁইশাক বীজ</strong> একটি অধিক ফলনশীল ও দ্রুত ফলনশীল হাইব্রিড জাত। এর কাণ্ড অত্যন্ত নরম ও সুস্বাদু এবং পাতা ও ডগার রঙ আকর্ষণীয় উজ্জ্বল সবুজ। বীজ বপনের মাত্র <strong>৪০–৪৫ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায়। সঠিক পরিচর্যায় প্রতি একরে প্রায় <strong>২০–২৫ টন</strong> ফলন পাওয়া যেতে পারে। দূরপাল্লার পরিবহনের জন্যও এ জাতটি সুবিধাজনক।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> হাইব্রিড<br>
<strong>🌿 ফলন:</strong> অধিক ফলনশীল<br>
<strong>🥬 কাণ্ড:</strong> অত্যন্ত নরম ও সুস্বাদু<br>
<strong>🍃 পাতা ও ডগা:</strong> আকর্ষণীয় উজ্জ্বল সবুজ<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ৪০–৪৫ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ২০–২৫ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1597', 12, 12, 1, 0, 0, '[]', '2026-09-25T17:52:33.264+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f4d29e26-f623-4a21-9082-d1fa633a1ba3', 'চায়নিজ পার্পল এজ শিম বীজ', 'chinese-purple-edge-bean-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459305484-t4e3jad.webp', NULL, 110, 65, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- বর্ষারকাল\"]', 'আনুমানিক ৫ গ্রাম বা ১০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, আকর্ষণীয় বেগুনি শিম, দ্রুত অঙ্কুরোদগম ও সহজ চাষের জন্য উপযুক্ত।', 'চায়নিজ পার্পল এজ শিম বীজ একটি উন্নত মানের উচ্চ ফলনশীল জাত, যা সুস্বাদু ও আকর্ষণীয় বেগুনি রঙের শিম উৎপাদনের জন্য পরিচিত। গাছ দ্রুত বৃদ্ধি পায়, নিয়মিত ফলন দেয় এবং ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য সমানভাবে উপযোগী। উন্নত অঙ্কুরোদগম ক্ষমতা ও শক্তিশালী গাছের কারণে এই জাতটি সহজেই সফলভাবে চাষ করা যায়।&nbsp;<div><br><div><span style=\"font-weight: bold;\">&nbsp;পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)&nbsp;</span></div><div><ul><li>&nbsp;📦 বীজ সংখ্যা: আনুমানিক ১২টি বীজ (উচ্চ গুণমানসম্পন্ন)&nbsp;</li><li>🌱 বিশুদ্ধতা (Purity): ৯৫%&nbsp;</li><li>✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%&nbsp;</li><li>✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%&nbsp;</li><li>🪴 বেঁচে থাকার হার (Survival Rate): ৯০%</li></ul><div><br></div></div></div><div><span style=\"font-weight: bold;\">চাষের উপযুক্ত সময় ও মৌসুম</span></div><div><ul><li><span style=\"font-weight: bold;\">প্রধান মৌসুম (শীতকালীন শিম):</span> ভাদ্র থেকে আশ্বিন মাস (আগস্টের মাঝামাঝি থেকে অক্টোবর) বীজ বপনের সেরা সময়। এছাড়া আষাঢ় থেকে কার্তিক মাস পর্যন্তও সাধারণ শিম চাষ করা যায়।</li><li><span style=\"font-weight: bold;\">আগাম চাষ:</span> জ্যৈষ্ঠ থেকে আষাঢ় মাস (মে-জুলাই) পর্যন্ত আগাম জাতের শিমের বীজ বপন করা হয়।</li></ul><div><br></div></div><div><span style=\"font-weight: bold;\">মাটি তৈরি পদ্ধতি</span></div><div><span style=\"text-decoration-line: underline; background-color: rgb(254, 240, 138);\">শিম চাষের জন্য উর্বর ও ভালো নিষ্কাশন ব্যবস্থাযুক্ত মাটি প্রয়োজন।</span></div><div><ul><li><span style=\"font-weight: bold;\">জমি চাষ: </span>মাটি ভালোভাবে শোধন ও ঝুরঝুরে করতে ৩-৪ বার চাষ ও মই দিয়ে জমি তৈরি করতে হবে। যাতে মাটিতে বড় কোনো ঢিলা বা আগাছা না থাকে।</li><li><span style=\"font-weight: bold;\">নিষ্কাশন ব্যবস্থা:</span> শিমের গাছ জলাবদ্ধতা একদম সহ্য করতে পারে না। তাই জমি উঁচু রাখতে হবে এবং পানি নিষ্কাশনের ভালো ব্যবস্থা রাখতে হবে। প্রয়োজনে নালা তৈরি করে উঁচু বেড বা মাদা (গর্ত) তৈরি করতে হবে।</li><li><span style=\"font-weight: bold;\">সার প্রয়োগ: </span>জমি তৈরির সময় প্রতি শতকে বা মাদার জন্য পর্যাপ্ত জৈব সার (গোবর বা কম্পোস্ট), টিএসপি এবং পটাশ সার মাটির সাথে ভালোভাবে মিশিয়ে দিতে হবে। মাটি অতিরিক্ত অম্লীয় হলে চুন প্রয়োগ করা যেতে পারে।</li></ul></div>', 'VEG-1539', 19, 19, 1, 0, 0, '[]', '2026-09-24T01:48:46.76+00:00', '2026-10-20T01:22:10.417981+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f66878ab-71b9-4dac-bc8b-787bbb9a5364', 'প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো (কালো টমেটো) বীজ', 'premium-black-hybrid-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949157701-hdw98sb.webp', NULL, 150, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ১০০টি বীজ। প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো বীজ থেকে আকর্ষণীয় কালো-বেগুনি রঙের সুস্বাদু, পুষ্টিকর ও উচ্চ ফলনশীল টমেটো উৎপাদন করুন।', '<h3>🍅 প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো (কালো টমেটো) বীজ</h3>
<p><strong>প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো (কালো টমেটো) বীজ</strong> একটি ব্যতিক্রমধর্মী ও আকর্ষণীয় জাতের টমেটো চাষের জন্য উপযোগী। এর ফল গাঢ় কালো-বেগুনি আভাযুক্ত, মাংসল ও সুস্বাদু হতে পারে। সাধারণ লাল টমেটোর তুলনায় এর ব্যতিক্রমী রং বাগান ও বাজারে আলাদা আকর্ষণ তৈরি করে। ছাদবাগান, কিচেন গার্ডেন, টব, গ্রো ব্যাগ এবং বাণিজ্যিক চাষে উপযুক্ত পরিচর্যার মাধ্যমে এই টমেটো চাষ করা যায়। পর্যাপ্ত রোদ, উর্বর মাটি ও সঠিক পরিচর্যা গাছের বৃদ্ধি এবং ফল উৎপাদনে সহায়তা করে।</p>

<h3>📦 Product Specifications</h3>
<ul>
<li><strong>পণ্যের নাম:</strong> প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো (কালো টমেটো)</li>
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>ফলের রং:</strong> গাঢ় কালো-বেগুনি আভাযুক্ত</li>
<li><strong>জাত:</strong> হাইব্রিড</li>
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>চাষের স্থান:</strong> টব, ছাদবাগান, কিচেন গার্ডেন ও খোলা জমি</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>
<ul>
<li>🍅 গাঢ় কালো-বেগুনি আভাযুক্ত ব্যতিক্রমধর্মী টমেটো</li>
<li>🌱 হাইব্রিড জাত, উপযুক্ত পরিচর্যায় ভালো বৃদ্ধির জন্য উপযোগী</li>
<li>🥗 রান্না, সালাদ ও বিভিন্ন খাবারে ব্যবহার করা যায়</li>
<li>🏡 ছাদবাগান, কিচেন গার্ডেন ও শখের বাগানে চাষ করা যায়</li>
<li>🧑‍🌾 উপযুক্ত পরিবেশ ও পরিচর্যায় বাণিজ্যিক চাষের জন্যও বিবেচনা করা যায়</li>
<li>🌿 ফলের আকর্ষণীয় রং বাগানে বৈচিত্র্য যোগ করে</li>
</ul>

<h3>📅 কালো টমেটো চাষের উপযুক্ত সময়</h3>
<p>বাংলাদেশে টমেটো সাধারণত শীতকালীন ফসল। <strong>শীতকালীন চাষের জন্য আগস্টের শেষ থেকে অক্টোবরের মধ্যে বীজতলায় বীজ বপন</strong> করে চারা তৈরি করা যেতে পারে। চারার বয়স ও আবহাওয়া অনুযায়ী পরে মূল জমি বা টবে স্থানান্তর করতে হয়। অতিরিক্ত গরম, ভারী বৃষ্টি ও জলাবদ্ধতা গাছের বৃদ্ধি ও ফল ধারণে সমস্যা সৃষ্টি করতে পারে। অঞ্চল ও স্থানীয় আবহাওয়া অনুযায়ী বপনের সময় সমন্বয় করুন।</p>

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>
<p>টমেটো চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি উপযোগী। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকলে শিকড়ের বৃদ্ধি ও পুষ্টি গ্রহণে সহায়তা করে।</p>
<ul>
<li>জমির মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করুন।</li>
<li>আগাছা, পাথর ও শক্ত মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li>মাটির সঙ্গে ভালোভাবে পচানো গোবর বা কম্পোস্ট মিশিয়ে নিন।</li>
<li>পানি জমার আশঙ্কা থাকলে উঁচু বেড তৈরি করুন।</li>
<li>টবে চাষ করলে পর্যাপ্ত ড্রেনেজ ছিদ্রযুক্ত পাত্র ব্যবহার করুন।</li>
</ul>
<p><strong>সহজ মাটির মিশ্রণ:</strong> ৫০% দোআঁশ মাটি, ৩০% পচা কম্পোস্ট এবং ২০% কোকোপিট বা মোটা বালু মিশিয়ে টবের জন্য হালকা ও পানি নিষ্কাশনযোগ্য মাটি তৈরি করতে পারেন।</p>

<h3>🌿 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>কালো টমেটোর বীজ প্রথমে বীজতলা, সিডলিং ট্রে বা ছোট পাত্রে বপন করে চারা তৈরি করা সুবিধাজনক। চারা সুস্থভাবে বেড়ে উঠলে নির্ধারিত টব বা জমিতে স্থানান্তর করা যায়।</p>
<ul>
<li>বীজতলায় ঝুরঝুরে ও পরিষ্কার বীজ বপনের উপযোগী মিশ্রণ ব্যবহার করুন।</li>
<li>বীজ অল্প গভীরে বপন করে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
<li>স্প্রে বোতল দিয়ে হালকা পানি দিন, যাতে বীজ সরে না যায়।</li>
<li>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন, কিন্তু জলাবদ্ধ হতে দেবেন না।</li>
<li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করলে এবং স্থানান্তরের উপযোগী হলে মূল স্থানে লাগান।</li>
<li>চারা স্থানান্তরের সময় শিকড়ের ক্ষতি কমানোর চেষ্টা করুন।</li>
</ul>

<h3>🪴 টব ও ছাদবাগানে কালো টমেটো চাষ</h3>
<p>কালো টমেটো ছাদবাগান, বারান্দা ও কিচেন গার্ডানে টব বা গ্রো ব্যাগে চাষ করা যায়। গাছের শিকড় ও বৃদ্ধির জন্য পর্যাপ্ত জায়গা রয়েছে এমন পাত্র নির্বাচন করুন। টবের নিচে পানি নিষ্কাশনের ছিদ্র থাকা জরুরি।</p>
<p>গাছের বৃদ্ধি অনুযায়ী মজবুত খুঁটি বা সাপোর্ট ব্যবহার করুন। গাছের ডালপালা যেন পর্যাপ্ত আলো-বাতাস পায়, সে জন্য প্রয়োজনীয় ফাঁকা জায়গা রাখুন। ফলের ওজন বাড়লে ডালকে সাপোর্ট দিলে ভেঙে যাওয়ার ঝুঁকি কমতে পারে।</p>

<h3>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<p>টমেটো গাছের ভালো বৃদ্ধি ও ফল ধারণের জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৬–৮ ঘণ্টা সরাসরি রোদ পায় এমন স্থান বেছে নিন। মাটির উপরিভাগ শুকাতে শুরু করলে গাছের প্রয়োজন অনুযায়ী পানি দিন। নিয়মিত ও পরিমিত সেচ বজায় রাখুন; কখনো অতিরিক্ত শুকিয়ে যাওয়া, আবার কখনো দীর্ঘ সময় জলাবদ্ধ থাকা—দুটিই এড়িয়ে চলুন।</p>
<p>সম্ভব হলে গাছের পাতার পরিবর্তে গোড়ার মাটিতে পানি দিন। এতে পাতায় দীর্ঘ সময় আর্দ্রতা জমে থাকার ঝুঁকি কমে।</p>

<h3>💧 সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<ul>
<li>মাটি প্রস্তুতির সময় পরিমিত পচা কম্পোস্ট বা জৈব সার মিশিয়ে নিন।</li>
<li>গাছের বৃদ্ধি, ফুল আসা ও ফল ধরার পর্যায় অনুযায়ী সুষম সার প্রয়োগ করুন।</li>
<li>অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন, কারণ এতে পাতার বৃদ্ধি বেশি হলেও ফুল ও ফল উৎপাদন প্রভাবিত হতে পারে।</li>
<li>গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</li>
<li>প্রয়োজন অনুযায়ী মাটি আলগা করুন, তবে শিকড়ের ক্ষতি করবেন না।</li>
<li>মাটির আর্দ্রতা বজায় রাখুন এবং অতিরিক্ত পানি জমতে দেবেন না।</li>
</ul>

<h3>🐛 রোগ ও পোকামাকড় ব্যবস্থাপনা</h3>
<p>টমেটো গাছে সাদা মাছি, জাবপোকা, ফলছিদ্রকারী পোকা ও বিভিন্ন ছত্রাকজনিত রোগের সমস্যা দেখা দিতে পারে। নিয়মিত পাতা, কাণ্ড ও ফল পরীক্ষা করুন। আক্রান্ত পাতা বা ফল সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। পর্যাপ্ত বাতাস চলাচল নিশ্চিত করুন ও জলাবদ্ধতা এড়িয়ে চলুন। প্রয়োজন হলে রোগ বা পোকা শনাক্ত করে স্থানীয়ভাবে অনুমোদিত বালাইনাশক পণ্যের লেবেল নির্দেশনা অনুসরণ করুন।</p>

<h3>🍅 ফল সংগ্রহের সময়</h3>
<p>ফলের রং, আকার ও পরিপক্বতা দেখে টমেটো সংগ্রহ করুন। কালো টমেটোর ক্ষেত্রে জাতভেদে পাকা ফলের গায়ে গাঢ় বেগুনি বা কালচে আভা দেখা যেতে পারে। ফলের স্বাভাবিক রং ও পরিপক্বতার লক্ষণ সম্পর্কে বীজের প্যাকেটের নির্দেশনা অনুসরণ করা ভালো। ফল সংগ্রহের সময় ডাল ভেঙে না ফেলে সাবধানে তুলুন।</p>

<h3>🥗 কালো টমেটোর ব্যবহার</h3>
<ul>
<li>🥗 তাজা সালাদে ব্যবহার করা যায়</li>
<li>🍲 রান্না ও বিভিন্ন খাবার তৈরিতে ব্যবহার করা যায়</li>
<li>🍅 বাড়ির বাগানে বৈচিত্র্যময় টমেটো চাষের জন্য উপযোগী</li>
<li>🧺 ফলের আকর্ষণীয় রং ও স্বাদের কারণে খাবার পরিবেশনে বৈচিত্র্য আনে</li>
</ul>
<p><strong>পুষ্টি সম্পর্কিত তথ্য:</strong> কালো বা বেগুনি আভাযুক্ত কিছু টমেটোর জাতের ফলে অ্যান্থোসায়ানিনসহ বিভিন্ন অ্যান্টিঅক্সিডেন্ট থাকতে পারে। তবে নির্দিষ্ট এই জাতের পুষ্টিমান সম্পর্কে পরীক্ষিত তথ্য ছাড়া বিশেষ পুষ্টিগত মাত্রা নিশ্চিত করে বলা যায় না।</p>

<h3>🏡 কোথায় কালো টমেটো চাষ করা যায়?</h3>
<ul>
<li>🏠 বাড়ির আঙিনা ও কিচেন গার্ডেন</li>
<li>🏢 ছাদবাগান</li>
<li>🌿 বারান্দা ও টব</li>
<li>🪴 গ্রো ব্যাগ ও পাত্রে</li>
<li>🌾 উপযুক্ত জমিতে বাণিজ্যিক চাষ</li>
</ul>

<h3>💚 কেন প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো চাষ করবেন?</h3>
<p><strong>প্রিমিয়াম ব্ল্যাক হাইব্রিড টমেটো বীজ</strong> তাদের জন্য একটি আকর্ষণীয় নির্বাচন, যারা বাড়ির বাগানে ব্যতিক্রমধর্মী রঙের টমেটো চাষ করতে চান অথবা উপযুক্ত পরিবেশে নতুন জাতের ফসল উৎপাদন করতে আগ্রহী। সঠিক মৌসুম নির্বাচন, পর্যাপ্ত সূর্যালোক, উর্বর মাটি, পরিমিত সেচ এবং নিয়মিত পরিচর্যার মাধ্যমে সুস্থ গাছ ও ভালো ফলনের সম্ভাবনা বাড়ানো যায়।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং নিজের বাগানে চাষ করুন আকর্ষণীয় কালো-বেগুনি টমেটো!</strong></p>', 'VEG-1551', 8, 8, 1, 0, 0, '[]', '2026-09-24T01:42:33.365+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('aa368fae-3fbe-4e4d-8f93-5c106a0f407e', 'চায়না হাইব্রিড সবুজ মিষ্ টি বীজ আখ বীজ', 'imp-9982-aa368f', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364700850-554w5nf.webp', NULL, 65, 0, NULL, NULL, '[]', NULL, NULL, '[]', NULL, NULL, 'IMP-9982', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.695+00:00', '2026-09-25T16:23:44.51+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d00ecbbf-91ec-438d-a8e4-8dbccbfe1c76', 'বারোমাসি বড় পাতা কলমি শাকের বীজ', 'imp-2943-d00ecb', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364659957-57nlwf6.webp', NULL, 65, 0, NULL, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-2943', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.867+00:00', '2026-09-30T16:28:58.094+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e90e12f2-0552-47b1-a28e-78721940dc81', 'নংজিয়াওয়াং হাইব্রিড গোল বেগুন বীজ', 'nongjiawang-hybrid-round-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949150848-n0ed0x0.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783005185106-gfrcpgw.webp\"]', 180, 120, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"পপুলার\",\"হাইব্রিড\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, গোলাকার, চকচকে, সুস্বাদু ও উচ্চ ফলনশীল বেগুন উৎপাদন করুন।', 'নংজিয়াওয়াং হাইব্রিড গোল বেগুন একটি উন্নত মানের উচ্চ ফলনশীল জাত, যা আকর্ষণীয় গোলাকার ও গাঢ় বেগুনি রঙের বেগুন উৎপাদন করে। এর ফল মাংসল, কোমল এবং সুস্বাদু হওয়ায় বিভিন্ন ধরনের রান্নার জন্য উপযুক্ত। দ্রুত বৃদ্ধি, শক্তিশালী গাছ এবং দীর্ঘ সময় ফলন দেওয়ার ক্ষমতার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য আদর্শ।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1570', 16, 16, 1, 0, 0, '[]', '2026-09-24T01:48:40.176+00:00', '2026-10-12T11:25:08.258726+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('31ae6eda-f822-431c-b7ef-59f9192f3343', 'হাইব্রিড পুদিনা পাতার বীজ (ফ্রি উপহার)', 'imp-3721-31ae6e', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364701470-majaw2s.webp', NULL, 0, 0, NULL, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-3721', 94, 94, 1, 1, 0, '[]', '2026-09-24T06:28:42.031+00:00', '2026-10-01T01:52:51.75+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('07146996-61d0-4aab-8405-4715cabb4927', 'চায়না লং প্রিমিয়াম হাইব্রিড ধুন্দুল বীজ', 'imp-2224-071469', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364680456-fmne1lg.webp', NULL, 75, 0, NULL, NULL, '[]', NULL, NULL, '[]', NULL, NULL, 'IMP-2224', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.375+00:00', '2026-09-25T16:23:44.51+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('7d499a01-05b5-4596-b5c1-40c958d65ee7', 'নংজিয়াওয়াং হাইব্রিড লাল টমেটো বীজ', 'imp-3291-7d499a', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364663400-r92agvc.webp', NULL, 85, 0, NULL, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-3291', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.535+00:00', '2026-09-30T16:28:58.538+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c99e8170-cbe4-40fe-863e-b418f3b28d9f', 'হাইব্রিড বিউ টি বীজ মরিচ বীজ', 'imp-8035-c99e81', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364674857-rwdrk32.webp', NULL, 89, 0, NULL, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-8035', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:41.215+00:00', '2026-09-30T16:28:58.733+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fde86708-96fb-46f0-bd0a-c7a6c41106f4', 'হাইব্রিড চায়না ঝাল মরিচ বীজ', 'hybrid-china-hot-chili-pepper-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949183862-o6zop3c.webp', NULL, 150, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড চায়না ঝাল মরিচ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '🌶️ হাইব্রিড চায়না ঝাল মরিচ বীজ
<p>হাইব্রিড চায়না ঝাল মরিচ বীজ একটি উন্নতমানের ঝাল মরিচের জাত, যা সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং ভালো ফলন দিতে সক্ষম। মরিচের ফল আকর্ষণীয় হওয়ায় এটি বাড়ির বাগান, ছাদবাগান এবং বাণিজ্যিকভাবে চাষের জন্য উপযোগী।</p>
<p>সঠিক মাটি, পর্যাপ্ত আলো, পানি ও সার ব্যবস্থাপনা নিশ্চিত করলে সুস্থ গাছ এবং ভালো ফলন পাওয়ার সম্ভাবনা থাকে।</p>
<h2>🌱 পণ্যের বৈশিষ্ট্য</h2>
<ul>
<li>🌶️ ঝাল ও আকর্ষণীয় মরিচ উৎপাদনের জন্য উপযোগী</li>
<li>🌱 শক্তিশালী ও সুস্থ গাছ গঠনে সহায়ক</li>
<li>🍃 সঠিক পরিচর্যায় ভালো ফলন পাওয়ার উপযোগী</li>
<li>🏡 বাড়ির বাগান ও ছাদবাগানের জন্য উপযোগী</li>
<li>🚜 বাণিজ্যিক চাষের জন্যও ব্যবহারযোগ্য</li>
<li>🌿 টব, গ্রো ব্যাগ ও জমিতে চাষ করা যায়</li>
</ul>
<h2>📋 Product Specifications</h2>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

📅 চাষের উপযুক্ত মৌসুম
<p>বাংলাদেশের আবহাওয়ায় মরিচ প্রায় সারা বছরই চাষ করা যায়। তবে অতিরিক্ত বৃষ্টি, জলাবদ্ধতা ও তীব্র শীত এড়িয়ে চাষ করলে ভালো ফলন পাওয়ার সম্ভাবনা বেশি।</p>
<h3>🌤️ প্রধান মৌসুম</h3>
<ul>
<li><strong>রবি মৌসুম:</strong> সেপ্টেম্বর–নভেম্বর বীজ বপনের জন্য উপযোগী।</li>
<li><strong>খরিফ মৌসুম:</strong> জানুয়ারি–মার্চে চারা তৈরি করে পরবর্তী সময়ে রোপণ করা যায়।</li>
<li><strong>বর্ষাকাল:</strong> অতিরিক্ত বৃষ্টির সময় উঁচু বেড বা ভালো নিষ্কাশনযুক্ত টবে চাষ করা ভালো।</li>
</ul>

<p>📌 স্থানীয় আবহাওয়া, জাতের বৈশিষ্ট্য ও চাষের স্থান অনুযায়ী বপন ও রোপণের সময় কিছুটা পরিবর্তিত হতে পারে।</p>


🌱 মরিচের বীজ থেকে চারা তৈরির পদ্ধতি
<h3>১️⃣ বীজতলা/সিড ট্রে প্রস্তুত</h3>
<p>বীজতলা, সিড ট্রে বা ছোট টবে ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন।</p>
<h3>২️⃣ বীজ বপন</h3>
<p>মাটির উপর হালকা গর্ত করে প্রায় <strong>০.৫–১ সেমি গভীরে</strong> বীজ বপন করুন। খুব গভীরে বীজ পুঁতে দেওয়া উচিত নয়।</p>
<h3>৩️⃣ পানি দেওয়া</h3>
<p>বীজ বপনের পর স্প্রে করে হালকা পানি দিন। মাটি স্যাঁতসেঁতে রাখুন, তবে পানি জমতে দেবেন না।</p>
<h3>৪️⃣ আলো ও পরিবেশ</h3>
<p>চারা গজানোর আগ পর্যন্ত উষ্ণ ও আর্দ্র পরিবেশ বজায় রাখুন। চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন।</p>
<h3>৫️⃣ চারা রোপণ</h3>
<p>চারা কয়েকটি সুস্থ পাতা ধারণ করলে এবং যথেষ্ট শক্ত হলে মূল জমি বা বড় টবে রোপণ করা যায়।</p>

🪴 মাটি তৈরির নিয়ম
<p>মরিচের জন্য ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য মাটি সবচেয়ে ভালো।</p>
<h3>🌿 টব/গ্রো ব্যাগের জন্য মাটির মিশ্রণ</h3>
<ul>
<li>🟤 <strong>দোআঁশ মাটি:</strong> ৫০%</li>
<li>🥥 <strong>কোকোপিট:</strong> ২০–৩০%</li>
<li>🌱 <strong>পচা জৈব সার/কম্পোস্ট:</strong> ২০–৩০%</li>
</ul>
<p>সব উপকরণ ভালোভাবে মিশিয়ে কয়েকদিন রেখে ব্যবহার করলে মাটির গঠন আরও ভালো হয়।</p>
<h3>⚠️ গুরুত্বপূর্ণ</h3>
<ul>
<li>শক্ত বা অতিরিক্ত এঁটেল মাটি ব্যবহার করবেন না।</li>
<li>টবের নিচে অবশ্যই পানি বের হওয়ার ছিদ্র থাকতে হবে।</li>
<li>কাঁচা গোবর সরাসরি ব্যবহার না করে ভালোভাবে পচানো জৈব সার ব্যবহার করুন।</li>
<li>পানি জমে থাকলে মরিচের শিকড় ক্ষতিগ্রস্ত হতে পারে।</li>
</ul>

🌱 জমিতে চাষের পদ্ধতি
<h3>১. জমি নির্বাচন</h3>
<p>পর্যাপ্ত সূর্যালোক পায় এবং পানি জমে না এমন জমি নির্বাচন করুন।</p>
<h3>২. জমি প্রস্তুত</h3>
<p>জমি ভালোভাবে ঝুরঝুরে করে কয়েকবার চাষ দিয়ে আগাছা ও মাটির ঢেলা পরিষ্কার করুন। প্রয়োজন অনুযায়ী পচা জৈব সার মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</p>
<h3>৩. বেড তৈরি</h3>
<p>জমিতে উঁচু বেড তৈরি করলে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে। বিশেষ করে বর্ষাকালে উঁচু বেড উপকারী।</p>
<h3>৪. চারা রোপণ</h3>
<p>সুস্থ ও সবল চারা বেছে নিয়ে পর্যাপ্ত দূরত্ব বজায় রেখে রোপণ করুন। গাছের আকার ও স্থানীয় চাষপদ্ধতি অনুযায়ী দূরত্ব সামঞ্জস্য করা যায়।</p>
<h3>৫. সেচ</h3>
<p>মাটি শুকিয়ে গেলে প্রয়োজন অনুযায়ী সেচ দিন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন।</p>

💧 পানি ও সার ব্যবস্থাপনা
<p>মরিচ গাছের জন্য নিয়মিত কিন্তু পরিমিত পানি প্রয়োজন। মাটির উপরিভাগ শুকিয়ে এলে পানি দিন।</p>
<p>গাছের বৃদ্ধির পর্যায় অনুযায়ী জৈব সার ও প্রয়োজনীয় পুষ্টি সরবরাহ করুন। ফুল ও ফল আসার সময়ে গাছের পুষ্টির চাহিদা বাড়ে, তাই সুষম সার ব্যবস্থাপনা গুরুত্বপূর্ণ।</p>

☀️ আলো ও পরিচর্যা
<p>🌞 প্রতিদিন পর্যাপ্ত সূর্যালোক নিশ্চিত করুন।</p>
<p>🌿 গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</p>
<p>💧 অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p>
<p>🪴 টবে চাষ করলে প্রয়োজন অনুযায়ী বড় টবে স্থানান্তর করুন।</p>
<p>🌱 রোগাক্রান্ত বা শুকিয়ে যাওয়া পাতা ও ডাল দ্রুত অপসারণ করুন।</p>
<p>🔎 নিয়মিত গাছ পর্যবেক্ষণ করে পোকামাকড় বা রোগের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</p>

🌶️ ফলন ও সংগ্রহ
<p>গাছের বৃদ্ধি, আবহাওয়া, মাটি, সার, পানি এবং পরিচর্যার ওপর ফলন ও ফল ধরার সময় নির্ভর করে। মরিচ পছন্দের পরিপক্বতা অনুযায়ী সবুজ অবস্থায় অথবা পরিপক্ব অবস্থায় সংগ্রহ করা যায়।</p>
<p>নিয়মিত মরিচ সংগ্রহ করলে গাছে নতুন ফুল ও ফল আসতে সহায়তা করতে পারে।</p>
<h2>📌 চাষের সংক্ষিপ্ত ধাপ</h2>
<p><strong>বীজ নির্বাচন → বীজতলা প্রস্তুত → বীজ বপন → চারা পরিচর্যা → জমি/টব প্রস্তুত → চারা রোপণ → পানি ও সার ব্যবস্থাপনা → রোগ-পোকা পর্যবেক্ষণ → মরিচ সংগ্রহ</strong></p>
<h3>🛒 Ss Seed Shop</h3>
<p><strong>সেরা বীজ, সেরা ফলন</strong> 🌱</p>', 'VEG-1565', 7, 7, 1, 0, 0, '[]', '2026-09-24T01:42:50.893+00:00', '2026-10-17T05:26:04.827491+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d29cb4b6-f2dd-4bdb-8d98-4c9e9d1290cc', '১২ মাসী কুঞ্জলতা/তারালতা ফুলের বীজ', 'all-season-star-vine-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732448620-lmfnrcm.webp', NULL, 120, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৩৫ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, দ্রুত বেড়ে ওঠা লতানো গাছ, তারার মতো রঙিন ফুল, বাগানের জন্য আদর্শ।', '১২ মাসী কুঞ্জলতা/তারালতা ফুলের বীজ দিয়ে আপনার বাগানে তৈরি করুন প্রাকৃতিক সবুজ ও রঙিন ফুলের আবরণ। এই দ্রুত বর্ধনশীল লতানো গাছটি তারার মতো আকর্ষণীয় ফুলে দেয়াল, গেট, বারান্দা, ট্রেলিস, পারগোলা ও বাগানের বেড়া সহজেই ঢেকে দেয়। সারা বছর চাষের উপযোগী হওয়ায় এটি ছাদবাগান ও ল্যান্ডস্কেপিংয়ের জন্যও অত্যন্ত জনপ্রিয়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় গাছ দ্রুত বৃদ্ধি পেয়ে দীর্ঘসময় ধরে প্রচুর ফুল ফোটায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৩৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1548', 16, 16, 1, 0, 0, '[]', '2026-09-24T01:42:47.2+00:00', '2026-10-19T06:06:15.472525+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('df830a9a-7d0d-4021-911b-019b69f1b2a4', 'হাওরুনকিং হাইব্রিড বাঁধাকপির বীজ', 'haorunking-hybrid-cabbage-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949174297-pnv3lp7.webp', NULL, 160, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাওরুনকিং হাইব্রিড বাঁধাকপি, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3>
<p><strong>হাওরুনকিং হাইব্রিড বাঁধাকপির বীজ</strong> উন্নতমানের বাঁধাকপি চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর, সুগঠিত বাঁধাকপি উৎপাদনে সহায়ক।</p>
<p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। সঠিক মাটি, পর্যাপ্ত আলো ও নিয়মিত পরিচর্যায় স্বাস্থ্যবান গাছ ও ভালো মানের বাঁধাকপি পেতে সহায়তা করতে পারে। 🥬 <strong>উন্নতমানের বাঁধাকপি চাষের জন্য আজই হাওরুনকিং হাইব্রিড বাঁধাকপির বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥬 <strong>জাত:</strong> হাওরুনকিং হাইব্রিড বাঁধাকপি</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>বাঁধাকপি মূলত <strong>শীতকালীন সবজি</strong> এবং তুলনামূলক ঠান্ডা ও মৃদু আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে হাওরুনকিং হাইব্রিড বাঁধাকপি চাষের জন্য নিচের সময়গুলো উপযোগী:</p>
<ul>
<li>🍂 <strong>শরৎ:</strong> সেপ্টেম্বর–অক্টোবর — বীজতলায় বীজ বপন ও চারা তৈরির উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি — চারা রোপণ ও বাঁধাকপি বৃদ্ধির জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল আবহাওয়ায় চাষ করা যেতে পারে।</li>
<li>☀️ অতিরিক্ত গরমে বাঁধাকপির মাথা সুগঠিত হতে সমস্যা হতে পারে, তাই গরম মৌসুমে চাষ না করাই ভালো।</li>
</ul>

<h3>🪴 হাওরুনকিং বাঁধাকপির জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
বাঁধাকপির জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকা প্রয়োজন এবং দীর্ঘসময় পানি জমে থাকা উচিত নয়।</p>

<p><strong>২. জমি পরিষ্কার ও মাটি ঝুরঝুরে করুন</strong><br>
প্রথমে জমির আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করুন। এরপর কোদাল বা চাষের মাধ্যমে মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির গঠন ও উর্বরতা উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. মাটির পানি নিষ্কাশন নিশ্চিত করুন</strong><br>
বাঁধাকপির শিকড় জলাবদ্ধতা সহ্য করতে পারে না। তাই জমিতে পানি জমে থাকলে <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p>

<p><strong>৫. বীজতলার মাটি প্রস্তুত করুন</strong><br>
চারা তৈরির জন্য ঝুরঝুরে ও পরিষ্কার মাটি ব্যবহার করুন। বীজতলায় ভালোভাবে পচা কম্পোস্ট মিশিয়ে মাটি প্রস্তুত করুন। বীজ খুব গভীরে না দিয়ে অল্প গভীরে বপন করুন এবং অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন।</p>

<p><strong>৬. চারা রোপণের আগে জমি প্রস্তুত করুন</strong><br>
চারা রোপণের আগে জমিতে তৈরি করা বেডের মাটি আবার হালকা করে ঝুরঝুরে করে নিন। মাটিতে প্রয়োজনীয় জৈব সার ভালোভাবে মিশিয়ে তারপর চারা রোপণ করুন।</p>

<p><strong>৭. টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</strong><br>
টব বা পাত্রে হাওরুনকিং হাইব্রিড বাঁধাকপি চাষের জন্য নিচের মিশ্রণ ব্যবহার করতে পারেন:</p>
<ul>
<li>🟤 ৪০% ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 ৩০% কোকোপিট</li>
<li>🍂 ২০% ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p><strong>বীজতলায় বীজ ছিটিয়ে</strong> অল্প মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। বীজতলায় অতিরিক্ত পানি দেবেন না। স্প্রে করে পানি দেওয়া ভালো। চারা শক্ত ও স্বাস্থ্যবান হলে মূল জমি বা টবে রোপণ করুন।</p>

<p><strong>চারা রোপণের সময়</strong> গাছের চারপাশে পর্যাপ্ত জায়গা রাখুন, যাতে গাছের পাতা স্বাভাবিকভাবে ছড়াতে পারে এবং বাঁধাকপির মাথা সুন্দরভাবে গঠিত হতে পারে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li>
<li>💧 মাটি শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌱 গাছের গোড়ার মাটি মাঝে মাঝে হালকা করে আলগা করে দিলে শিকড়ে বাতাস চলাচলে সহায়তা করতে পারে।</li>
</ul>

<p>💡 <strong>বিশেষ টিপস:</strong> বাঁধাকপির ভালো মাথা গঠনের জন্য ঠান্ডা আবহাওয়া, পর্যাপ্ত সূর্যালোক, উর্বর মাটি এবং সঠিক পানি ব্যবস্থাপনা গুরুত্বপূর্ণ। নিয়মিত আগাছা পরিষ্কার করুন এবং গাছের গোড়ায় পানি জমতে দেবেন না।</p>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা পাত্র</li>
<li>🌱 সবজি বাগান</li>
<li>🚜 বাণিজ্যিক জমি</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ির বাগান, ছাদবাগান বা বাণিজ্যিক জমিতে সুন্দর ও সুগঠিত বাঁধাকপি চাষ করতে আজই হাওরুনকিং হাইব্রিড বাঁধাকপির বীজ অর্ডার করুন!</strong></p>', 'VEG-1532', 24, 24, 1, 0, 0, '[]', '2026-09-24T01:46:39.769+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4a40fa90-79b5-453a-ba2d-6ebfb35568dd', 'বিদেশী হাইব্রিড সবুজ স্কোয়াশ (জুকিনি) বীজ', 'imported-hybrid-green-zucchini-squash-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792407096035-2dz632y.webp', NULL, 120, 110, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\"]', 'আনুমানিক ৩০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, পুষ্টিকর ও সুস্বাদু সবুজ জুকিনি উৎপাদনের জন্য আদর্শ।', 'বিদেশী হাইব্রিড সবুজ স্কোয়াশ (জুকিনি) একটি উন্নত মানের ও উচ্চ ফলনশীল সবজি জাত, যা মসৃণ, গাঢ় সবুজ রঙের ও কোমল ফল উৎপাদন করে। জুকিনি ভিটামিন, খনিজ ও খাদ্য আঁশে সমৃদ্ধ হওয়ায় স্বাস্থ্যকর খাদ্য হিসেবে অত্যন্ত জনপ্রিয়। গাছ দ্রুত বৃদ্ধি পায়, অল্প সময়ে ফলন শুরু করে এবং দীর্ঘ সময় ধরে উৎপাদন দেয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1525', 6, 6, 1, 0, 0, '[]', '2026-09-24T01:48:44.176+00:00', '2026-10-19T10:51:43.632936+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('82b5fb12-4007-43ac-81c4-690f4305f1f7', 'চায়না হাইব্রিড জায়ান্ট সাদা মূলা বীজ', 'china-hybrid-giant-white-radish-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378436934-jmdatbl.webp', NULL, 120, 45, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | চায়না হাইব্রিড জায়ান্ট সাদা মূলা, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '🥕 Product Short Description

চায়না হাইব্রিড জায়ান্ট সাদা মূলা বীজ উন্নত জাতের মূলা চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং বড় আকৃতির সাদা মূলা উৎপাদনে সহায়ক।

বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষে ব্যবহার করা যায়। 🥕 বড় ও আকর্ষণীয় সাদা মূলা চাষ করতে আজই অর্ডার করুন!

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌏 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1511', 14, 14, 1, 0, 0, '[]', '2026-09-24T01:46:41.641+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('1a93eb39-a3fe-4e4d-aa31-323af9613d4c', 'উচ্চ ফলনশীল হাইব্রিড ব্রকলি বীজ', 'high-yield-hybrid-broccoli-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949145032-o5pvyks.webp', NULL, 150, 120, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | উচ্চ ফলনশীল হাইব্রিড ব্রকলি, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3>
<p><strong>উচ্চ ফলনশীল হাইব্রিড ব্রকলি বীজ</strong> উন্নতমানের ব্রকলি চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুগঠিত ব্রকলি উৎপাদনে সহায়ক।</p>
<p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। পর্যাপ্ত আলো, উর্বর মাটি ও নিয়মিত পরিচর্যায় স্বাস্থ্যবান গাছ এবং ভালো মানের ব্রকলি পেতে সহায়তা করতে পারে। 🥦 <strong>নিজের বাগানে তাজা ব্রকলি চাষ করতে আজই হাইব্রিড ব্রকলি বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥦 <strong>জাত:</strong> উচ্চ ফলনশীল হাইব্রিড ব্রকলি</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>ব্রকলি একটি <strong>শীতকালীন সবজি</strong> এবং ঠান্ডা ও মৃদু আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে হাইব্রিড ব্রকলি চাষের জন্য সাধারণত নিচের সময়গুলো বেশি উপযোগী:</p>
<ul>
<li>🍂 <strong>শরৎ:</strong> সেপ্টেম্বর–অক্টোবর — বীজতলায় বীজ বপন ও চারা তৈরির উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি — চারা রোপণ ও ব্রকলির মাথা গঠনের জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল আবহাওয়ায় চাষ করা যেতে পারে।</li>
<li>☀️ <strong>অতিরিক্ত গরম:</strong> বেশি তাপমাত্রায় ব্রকলির মাথা ভালোভাবে গঠিত নাও হতে পারে, তাই গরমের সময় চাষ না করাই ভালো।</li>
</ul>

<h3>🪴 ব্রকলির জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
ব্রকলির জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকা প্রয়োজন। পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p>

<p><strong>২. জমি পরিষ্কার ও মাটি প্রস্তুত করুন</strong><br>
প্রথমে জমির আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করুন। এরপর কোদাল বা চাষের মাধ্যমে মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির গঠন ও উর্বরতা উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br>
ব্রকলির শিকড় জলাবদ্ধতা পছন্দ করে না। তাই জমিতে পানি জমার সম্ভাবনা থাকলে <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন, যাতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p>

<p><strong>৫. বীজতলার মাটি প্রস্তুত করুন</strong><br>
চারা তৈরির জন্য পরিষ্কার, ঝুরঝুরে ও আগাছামুক্ত মাটি ব্যবহার করুন। ভালোভাবে পচা কম্পোস্ট মিশিয়ে বীজতলা তৈরি করুন। বীজ অল্প গভীরে বপন করুন এবং অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন।</p>

<p><strong>৬. চারা রোপণের আগে জমি প্রস্তুত করুন</strong><br>
চারা রোপণের আগে জমির বেডের মাটি আবার হালকা করে ঝুরঝুরে করে নিন। প্রয়োজনীয় জৈব সার মাটির সঙ্গে ভালোভাবে মিশিয়ে তারপর স্বাস্থ্যবান চারা রোপণ করুন।</p>

<p><strong>৭. টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</strong><br>
টব বা বড় পাত্রে ব্রকলি চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p>
<ul>
<li>🟤 ৪০% ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 ৩০% কোকোপিট</li>
<li>🍂 ২০% ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>বীজতলায় বীজ সমানভাবে ছড়িয়ে দিয়ে অল্প পরিমাণ মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না। অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন এবং পানি দেওয়ার সময় <strong>স্প্রে করে পানি দেওয়া</strong> ভালো।</p>

<p>চারা পর্যাপ্ত শক্ত ও স্বাস্থ্যবান হলে মূল জমি বা বড় টবে রোপণ করুন। চারা রোপণের সময় গাছের মধ্যে পর্যাপ্ত জায়গা রাখুন, যাতে পাতাগুলো ভালোভাবে ছড়াতে পারে এবং ব্রকলির মাথা সুগঠিত হওয়ার জন্য প্রয়োজনীয় জায়গা পায়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌱 গাছের গোড়ার মাটি মাঝে মাঝে হালকা করে আলগা করলে শিকড়ে বাতাস চলাচলে সহায়তা করতে পারে।</li>
</ul>

<p>💡 <strong>বিশেষ টিপস:</strong> ব্রকলির ভালো বৃদ্ধি ও সুগঠিত মাথা পাওয়ার জন্য ঠান্ডা আবহাওয়া, পর্যাপ্ত সূর্যালোক, উর্বর মাটি এবং সঠিক পানি ব্যবস্থাপনা গুরুত্বপূর্ণ। নিয়মিত আগাছা পরিষ্কার করুন এবং গাছের গোড়ায় পানি জমতে দেবেন না।</p>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা পাত্র</li>
<li>🌱 সবজি বাগান</li>
<li>🚜 বাণিজ্যিক জমি</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ির বাগান, ছাদবাগান বা বাণিজ্যিক জমিতে উন্নতমানের', 'VEG-1528', 22, 22, 1, 0, 0, '[]', '2026-09-24T01:46:39.629+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b5f88772-8783-4cb9-bfa3-c17ce1983273', 'চাইনিজ হাইব্রিড রক্ত গাঁদা ফুলের বীজ', 'chinese-hybrid-red-marigold-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732453520-ggxntoj.webp', NULL, 150, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"পপুলার\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, গাঢ় লাল বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3>
<p><strong>চাইনিজ হাইব্রিড রক্ত গাঁদা ফুলের বীজ</strong> দিয়ে আপনার বাগানে ফুটিয়ে তুলুন গভীর লাল রঙের বড় ও ঘন পাপড়ির আকর্ষণীয় ফুল। এই হাইব্রিড জাত দ্রুত বৃদ্ধি ও বেশি ফুল উৎপাদনের জন্য উপযোগী।</p>
<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। সঠিক পরিচর্যা ও অনুকূল পরিবেশে স্বাস্থ্যবান গাছ ও দৃষ্টিনন্দন ফুল পেতে সহায়ক। 🌺 <strong>বাগানকে আকর্ষণীয় করতে আজই রক্ত গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌺 <strong>জাত:</strong> চাইনিজ হাইব্রিড রক্ত গাঁদা</li>
<li>🌈 <strong>ফুলের রঙ:</strong> গভীর লাল</li>
<li>🌸 <strong>ফুলের বৈশিষ্ট্য:</strong> বড় ও ঘন পাপড়িযুক্ত</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>চাইনিজ হাইব্রিড রক্ত গাঁদা তুলনামূলকভাবে <strong>শীতল ও মৃদু আবহাওয়ায়</strong> ভালো বৃদ্ধি পায় এবং সুন্দর ফুল দেয়। বাংলাদেশে নিচের সময়গুলোতে চাষ করা ভালো:</p>
<ul>
<li>🍂 <strong>হেমন্ত:</strong> অক্টোবর–নভেম্বর — বীজ বপনের জন্য উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি — ফুল উৎপাদনের জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ ও বসন্তের শুরু:</strong> ফেব্রুয়ারি–মার্চ পর্যন্ত অনুকূল পরিবেশে ফুল পাওয়া যেতে পারে।</li>
<li>🌧️ <strong>বর্ষাকাল:</strong> অতিরিক্ত বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলা উচিত। তবে উঁচু বেড বা ভালো ড্রেনেজযুক্ত টবে চাষ করা যায়।</li>
</ul>

<h3>🪴 রক্ত গাঁদা ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
রক্ত গাঁদার জন্য হালকা, ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। ভারী ও পানি ধরে রাখে এমন কাদামাটি সরাসরি ব্যবহার না করাই ভালো।</p>

<p><strong>২. খোলা জমির মাটি প্রস্তুত করুন</strong><br>
জমি থেকে আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করে মাটি ২–৩ বার ভালোভাবে কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. ভারী মাটি হালকা করুন</strong><br>
মাটি যদি বেশি এঁটেল হয়, তাহলে পচা জৈব সার ও প্রয়োজনমতো মোটা বালি মিশিয়ে মাটির গঠন ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য করে নিন।</p>

<p><strong>৫. উঁচু বেড তৈরি করুন</strong><br>
যেসব জায়গায় বৃষ্টির পানি জমে থাকে সেখানে প্রায় <strong>৬–৮ ইঞ্চি উঁচু বেড</strong> তৈরি করা ভালো। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং শিকড় সুস্থ থাকে।</p>

<p><strong>৬. টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</strong><br>
টব বা পাত্রে গাঁদা চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p>
<ul>
<li>🟤 ৪০% ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 ৩০% কোকোপিট</li>
<li>🍂 ২০% ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> থাকতে হবে, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p>

<p><strong>৭. বীজ বপনের প্রস্তুতি</strong><br>
মাটি প্রস্তুত হওয়ার পর উপরের অংশ হালকা করে ঝুরঝুরে করে নিন। বীজ সমানভাবে ছড়িয়ে দিয়ে খুব অল্প পরিমাণ মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। অতিরিক্ত গভীরে বীজ পুঁতে দেবেন না।</p>

<p><strong>৮. পানি ও আর্দ্রতা ব্যবস্থাপনা</strong><br>
বীজ অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। পানি দেওয়ার সময় জোরে পানি না ঢেলে <strong>স্প্রে করে পানি দেওয়া</strong> ভালো। অতিরিক্ত পানি জমতে দেবেন না।</p>

<p><strong>৯. পর্যাপ্ত আলো নিশ্চিত করুন</strong><br>
গাছকে প্রতিদিন প্রায় <strong>৫–৬ ঘণ্টা বা তার বেশি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে রাখলে স্বাস্থ্যকর বৃদ্ধি ও ফুল উৎপাদনে সহায়তা করবে।</p>

<p>💡 <strong>বিশেষ টিপস:</strong> রক্ত গাঁদা গাছ ভালো ফুল দেওয়ার জন্য পর্যাপ্ত আলো, ঝুরঝুরে মাটি ও সঠিক পানি ব্যবস্থাপনা প্রয়োজন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p>

<h3>🌺 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🪴 টব ও পাত্র</li>
<li>🏠 বারান্দা</li>
<li>🌿 ছাদবাগান</li>
<li>🌸 ফুলের বেড</li>
<li>🌱 বর্ডার</li>
<li>🏡 খোলা বাগান</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ি, বারান্দা বা ছাদবাগানে গভীর লাল রঙের আকর্ষণীয় ফুলের সৌন্দর্য আনতে আজই চাইনিজ হাইব্রিড রক্ত গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>', 'FUL-1504', 32, 32, 1, 0, 0, '[]', '2026-09-24T01:42:32.204+00:00', '2026-10-17T05:26:05.662234+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d137b27f-ba90-47cd-8687-67169ea91e9c', 'হাইব্রিড সূর্যমুখী (আকাশমুখী) ঝাল মরিচের বীজ', 'hybrid-sunfacing-hot-chili-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459456943-u9vo6w0.webp', '[\"https:\\/\\/nkyfljjcxfrmuzsyltta.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1792459477652-7ro1bed.webp\",\"https:\\/\\/nkyfljjcxfrmuzsyltta.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1792459484253-y8s18m3.webp\",\"https:\\/\\/nkyfljjcxfrmuzsyltta.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1792459486506-9ifr4dz.webp\"]', 150, 75, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, উপরের দিকে মুখ করা ঝাঁজালো, আকর্ষণীয় ও উচ্চ ফলনশীল মরিচ উৎপাদন করুন।', 'হাইব্রিড সূর্যমুখী (আকাশমুখী) ঝাল মরিচ একটি ব্যতিক্রমধর্মী ও উচ্চ ফলনশীল মরিচের জাত, যার মরিচগুলো নিচের দিকে ঝুলে না থেকে আকাশের দিকে মুখ করে বৃদ্ধি পায়। গাছে একসাথে প্রচুর মরিচ ধরে, যা দেখতে অত্যন্ত আকর্ষণীয় এবং স্বাদে ঝাঁজালো। টব, ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1564', 11, 11, 1, 0, 0, '[]', '2026-09-24T01:48:41.744+00:00', '2026-10-20T01:25:16.489958+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d0bd0209-16e1-4c38-89f0-7584c0a18b9b', 'হাইব্রিড সাদা ডিম বেগুন বীজ', 'hybrid-white-egg-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789379731965-zgturou.webp', NULL, 140, 110, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড সাদা ডিম বেগুন, আকর্ষণীয় ফল ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '🌱 Product Short Description

হাইব্রিড সাদা ডিম বেগুন বীজ একটি আকর্ষণীয় জাতের বেগুন চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং ডিমের মতো আকৃতির সুন্দর সাদা বেগুন উৎপাদনে সহায়ক।

বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🍆 আকর্ষণীয় সাদা ডিম বেগুন চাষ করতে আজই অর্ডার করুন!

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 জাত: হাইব্রিড সাদা ডিম বেগুন
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌏 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1508', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:46:43.001+00:00', '2026-10-12T11:25:03.505042+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c74b2410-3c24-436c-8b43-7664d3664904', 'জিনকেলিফেং হলুদ চেরি টমেটো বীজ (হাইব্রিড)', 'jinkelifeng-hybrid-yellow-cherry-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949160743-u2jvdzf.webp', NULL, 170, 75, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জিনকেলিফেং হাইব্রিড হলুদ চেরি টমেটো, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>🍅 জিনকেলিফেং হলুদ চেরি টমেটো বীজ (হাইব্রিড)</h3> 

<p><strong>জিনকেলিফেং হলুদ চেরি টমেটো বীজ</strong> আকর্ষণীয় হলুদ রঙের ছোট চেরি টমেটো চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং গুচ্ছাকারে সুন্দর ফল উৎপাদনে সহায়ক। আকর্ষণীয় রঙ ও ছোট আকারের ফলের কারণে এটি ঘরোয়া বাগান, টব, ছাদবাগান এবং বাণিজ্যিক চাষ—সব ক্ষেত্রেই উপযোগী।</p> 

<h3>📋 Product Specifications</h3> 

<ul> 
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li><strong>🌍 উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3> 

<ul> 
<li>🍅 আকর্ষণীয় হলুদ রঙের ছোট চেরি টমেটো</li> 
<li>🌱 হাইব্রিড জাত</li> 
<li>🌿 শক্তিশালী গাছ বৃদ্ধিতে সহায়ক</li> 
<li>🍅 গুচ্ছাকারে সুন্দর ফল উৎপাদনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🏡 বাড়ির বাগান ও ছাদবাগানের জন্য উপযোগী</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
</ul> 

<h3>📅 চাষের উপযুক্ত সময়</h3> 

<p>বাংলাদেশে সাধারণত তুলনামূলক শীতল ও মৃদু আবহাওয়ায় টমেটো চাষ ভালো হয়। সাধারণভাবে <strong>অক্টোবর থেকে ফেব্রুয়ারি</strong> সময়টি টমেটো চাষের জন্য উপযোগী। তবে স্থানীয় তাপমাত্রা ও আবহাওয়ার ওপর ভিত্তি করে বীজ বপনের সময় নির্বাচন করা ভালো।</p> 

<h3>🌱 মাটি প্রস্তুতি</h3> 

<p>টমেটোর জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশন সুবিধাযুক্ত দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। মাটিতে ভালোভাবে পচানো জৈব সার বা কম্পোস্ট মিশিয়ে নিলে গাছের প্রাথমিক বৃদ্ধিতে সহায়তা করতে পারে। পানি জমে থাকে এমন জায়গা এড়িয়ে চলুন।</p> 

<h3>🌿 বীজ বপন ও চারা তৈরি</h3> 

<p>বীজ সিড ট্রে, ছোট টব বা নার্সারি বেডে বপন করে চারা তৈরি করা যায়। ঝুরঝুরে ও হালকা মাটিতে বীজ বপন করে পাতলা মাটি দিয়ে ঢেকে হালকা পানি দিতে হবে। চারা গজানোর পর পর্যাপ্ত আলো ও বাতাস নিশ্চিত করুন। সুস্থ ও শক্তিশালী চারা তৈরি হলে মূল টব, গ্রো ব্যাগ বা জমিতে স্থানান্তর করা যায়।</p> 

<p><strong>পরামর্শ:</strong> চারা স্থানান্তরের সময় শিকড়ের চারপাশের মাটি যতটা সম্ভব অক্ষত রাখলে চারা দ্রুত নতুন পরিবেশের সঙ্গে মানিয়ে নিতে সহায়তা করতে পারে।</p> 

<h3>🪴 টব ও ছাদবাগানে চাষ</h3> 

<p>জিনকেলিফেং হলুদ চেরি টমেটো টব, গ্রো ব্যাগ ও বিভিন্ন আকারের পাত্রে চাষ করা যায়। পাত্রের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। মাটি, কোকোপিট ও পচা কম্পোস্টের মিশ্রণ ব্যবহার করলে হালকা ও পানি নিষ্কাশনযোগ্য চাষমাধ্যম তৈরি করা যায়।</p> 

<p>গাছ বড় হওয়ার সঙ্গে সঙ্গে খুঁটি বা উপযুক্ত সাপোর্ট ব্যবহার করলে গাছ সোজা রাখতে এবং ফলের গুচ্ছের ওজন সামলাতে সহায়তা করবে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 

<p>টমেটো গাছের সুস্থ বৃদ্ধি ও ফল উৎপাদনের জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় <strong>৬–৮ ঘণ্টা আলো</strong> পাওয়া যায় এমন স্থানে গাছ রাখলে ভালো ফল পাওয়ার সম্ভাবনা থাকে। মাটির উপরিভাগ শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p> 

<h3>🌿 সার ও পরিচর্যা</h3> 

<ul> 
<li>গাছের বৃদ্ধির পর্যায় অনুযায়ী পরিমিত জৈব সার বা কম্পোস্ট ব্যবহার করুন।</li> 
<li>ফুল ও ফল আসার সময় পর্যাপ্ত পুষ্টি নিশ্চিত করুন।</li> 
<li>গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</li> 
<li>দুর্বল বা রোগাক্রান্ত পাতা প্রয়োজন অনুযায়ী অপসারণ করুন।</li> 
<li>ফলের গুচ্ছ ভারী হলে খুঁটি বা সাপোর্ট দিয়ে গাছকে সহায়তা দিন।</li> 
</ul> 

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3> 

<p>টমেটো গাছে এফিড, সাদা মাছি, থ্রিপসসহ বিভিন্ন পোকামাকড় আক্রমণ করতে পারে। নিয়মিত গাছের পাতা ও নতুন ডগা পরীক্ষা করুন। আক্রান্ত পাতা বা ফল দ্রুত সরিয়ে ফেলুন এবং বাগানে পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন। ছত্রাকজনিত সমস্যা কমাতে অতিরিক্ত পানি ও পাতায় দীর্ঘসময় পানি জমে থাকা এড়িয়ে চলুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত বালাইনাশক বা জৈব ব্যবস্থাপনা পদ্ধতি লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p> 

<h3>🍅 ফল সংগ্রহ</h3> 

<p>ফল যখন পরিপক্ব হয়ে আকর্ষণীয় হলুদ রঙ ধারণ করবে, তখন প্রয়োজন অনুযায়ী সংগ্রহ করা যায়। নিয়মিত পরিপক্ব ফল সংগ্রহ করলে গাছে নতুন ফল ধারণের সুযোগ তৈরি হতে পারে।</p> 

<h3>🏡 কোথায় চাষ করা যায়?</h3> 

<ul> 
<li>🏠 বাড়ির বাগান</li> 
<li>🌿 কিচেন গার্ডেন</li> 
<li>🏢 ছাদবাগান</li> 
<li>🪴 টব ও গ্রো ব্যাগ</li> 
<li>🌱 বারান্দা ও ছোট বাগান</li> 
<li>🌾 খোলা জমি</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষাবাদ</li> 
</ul> 

<h3>💚 কেন চাষ করবেন?</h3> 

<p><strong>জিনকেলিফেং হলুদ চেরি টমেটো</strong> আকর্ষণীয় হলুদ রঙের ছোট ফল এবং গুচ্ছাকারে ফল উৎপাদনের বৈশিষ্ট্যের কারণে বাড়ির বাগান ও ছাদবাগানের জন্য একটি চমৎকার নির্বাচন। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ গড়ে উঠতে পারে এবং নিয়মিত পরিচর্যায় সুন্দর ফল পাওয়ার সম্ভাবনা থাকে।</p> 

<p><strong>🌱 আজই অর্ডার করুন এবং আপনার বাগানে আকর্ষণীয় হলুদ চেরি টমেটো চাষ শুরু করুন!</strong></p>', 'VEG-1547', 16, 16, 1, 0, 0, '[]', '2026-09-24T01:42:49.94+00:00', '2026-10-19T09:17:51.717064+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9cc8e21d-4286-476a-aa76-e9a2719e2009', 'ব্ল্যাক বিউটি হাইব্রিড কালো মরিচের বীজ', 'black-beauty-hybrid-black-pepper-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1786268688414-br06nka.webp', NULL, 170, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | ব্ল্যাক বিউটি হাইব্রিড কালো মরিচ, আকর্ষণীয় রঙ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3> 
<p><strong>ব্ল্যাক বিউটি হাইব্রিড কালো মরিচের বীজ</strong> আকর্ষণীয় কালো রঙের মরিচ উৎপাদনের জন্য উপযোগী একটি ব্যতিক্রমী হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং দৃষ্টিনন্দন রঙের মরিচ উৎপাদনে সহায়ক।</p> 

<p>এর ব্যতিক্রমী কালো রঙ বাগানে আলাদা সৌন্দর্য ও বৈচিত্র্য তৈরি করে। <strong>বাড়ির বাগান, ছাদবাগান, কিচেন গার্ডেন, টব, গ্রো ব্যাগ এবং বাণিজ্যিক চাষের</strong> জন্য এটি উপযোগী। 🌶️🖤</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> ব্ল্যাক বিউটি হাইব্রিড কালো মরিচ</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>🖤 ব্ল্যাক বিউটি কালো মরিচের বিশেষ বৈশিষ্ট্য</h3> 
<ul> 
<li>🌶️ আকর্ষণীয় কালো রঙের মরিচ উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 ব্যতিক্রমী ও দৃষ্টিনন্দন হাইব্রিড জাত</li> 
<li>💪 সঠিক পরিচর্যায় শক্তিশালী গাছ গড়ে উঠতে সহায়ক</li> 
<li>✨ সাধারণ মরিচের তুলনায় বাগানে আলাদা বৈচিত্র্য তৈরি করে</li> 
<li>🏡 বাড়ির বাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🌿 ছাদবাগান ও বারান্দায় চাষ করা যায়</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষের জন্য উপযোগী</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও ব্যবহার করা যায়</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>মরিচ উষ্ণ ও রৌদ্রোজ্জ্বল পরিবেশে ভালোভাবে বেড়ে ওঠে। বাংলাদেশে সাধারণভাবে <strong>অক্টোবর থেকে জানুয়ারি</strong> সময়টি মরিচের চারা তৈরির জন্য অনুকূল। পর্যাপ্ত আলো, উপযুক্ত তাপমাত্রা ও সঠিক পরিচর্যা থাকলে অন্যান্য সময়েও চাষ করা যেতে পারে।</p> 

<p>গরম ও বর্ষাকালে চাষের ক্ষেত্রে পানি নিষ্কাশনের দিকে বিশেষ গুরুত্ব দিতে হবে। অতিরিক্ত আর্দ্রতা ও দীর্ঘসময় জলাবদ্ধতা গাছের শিকড়ের জন্য ক্ষতিকর হতে পারে।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>ব্ল্যাক বিউটি মরিচের জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> ব্যবহার করা ভালো। ভালো মাটির পরিবেশ গাছের শিকড়ের বৃদ্ধি ও স্বাস্থ্যকর গাছ গঠনে সহায়তা করে।</p> 

<ul> 
<li>🌱 মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🏖️ ভারী মাটি হলে প্রয়োজন অনুযায়ী মোটা বালি বা পার্লাইট ব্যবহার করুন।</li> 
<li>💧 পানি জমার প্রবণতা থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজ সিড ট্রে, নার্সারি বেড, টব বা গ্রো ব্যাগে বপন করা যায়। ঝুরঝুরে ও হালকা আর্দ্র মাটিতে বীজ <strong>প্রায় ০.৫–১ সেমি গভীরে</strong> বপন করে পাতলা মাটি দিয়ে ঢেকে দিন।</p> 

<p>বীজ বপনের পর স্প্রে করে হালকা পানি দিন। অঙ্কুরোদগমের সময় মাটি আর্দ্র রাখুন, তবে অতিরিক্ত পানি দেবেন না। চারা পর্যাপ্ত শক্ত হলে সাবধানে টব, গ্রো ব্যাগ অথবা জমিতে স্থানান্তর করুন।</p> 

<h3>🪴 টব বা গ্রো ব্যাগে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>ছাদবাগান বা বারান্দায় চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 <strong>৪০%</strong> দোআঁশ মাটি</li> 
<li>🥥 <strong>৩০%</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%</strong> পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। এতে অতিরিক্ত পানি বের হয়ে গিয়ে শিকড়ের জন্য ভালো পরিবেশ বজায় রাখতে সহায়তা করবে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>মরিচ গাছের ভালো বৃদ্ধি ও ফলনের জন্য প্রতিদিন <strong>প্রায় ৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন জায়গা নির্বাচন করুন। ছাদ, খোলা বারান্দা বা রোদযুক্ত কিচেন গার্ডেন এ জন্য উপযোগী।</p> 

<p>মাটির উপরিভাগ কিছুটা শুকিয়ে এলে পানি দিন। নিয়মিত আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি বা জলাবদ্ধতা তৈরি হতে দেবেন না। গরমের সময়ে মাটি দ্রুত শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিতে হবে।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 নিয়মিত অল্প পরিমাণে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট প্রয়োগ করুন।</li> 
<li>🌱 গাছের গোড়ার আগাছা পরিষ্কার রাখুন।</li> 
<li>💧 মাটির আর্দ্রতা দেখে প্রয়োজন অনুযায়ী পানি দিন।</li> 
<li>☀️ গাছকে পর্যাপ্ত আলো ও বাতাস চলাচলের সুযোগ দিন।</li> 
<li>🌿 গাছ বেশি ভারী হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট ব্যবহার করুন।</li> 
<li>🐛 পাতার নিচে, কচি ডগা ও ফলে পোকামাকড়ের উপস্থিতি নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>✂️ শুকনো বা আক্রান্ত পাতা ও ডাল প্রয়োজন অনুযায়ী সরিয়ে ফেলুন।</li> 
</ul> 

<h3>🌶️ মরিচ সংগ্রহের পদ্ধতি</h3> 
<p>মরিচের রঙ ও পরিপক্বতা দেখে প্রয়োজন অনুযায়ী ফল সংগ্রহ করুন। আকর্ষণীয় কালো রঙের ফলের জন্য ফলের রঙ পরিবর্তন ও পরিপক্বতার পর্যায় পর্যবেক্ষণ করা গুরুত্বপূর্ণ।</p> 

<p>পরিষ্কার কাঁচি দিয়ে ফল সংগ্রহ করলে গাছের ডাল ও নতুন কুঁড়ির ক্ষতি কম হয়। নিয়মিত পরিপক্ব ফল সংগ্রহ করলে গাছে নতুন ফল ধরার সুযোগ তৈরি হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>ব্ল্যাক বিউটি হাইব্রিড কালো মরিচ</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, টব, গ্রো ব্যাগ এবং কৃষিজমিতে চাষ করা যায়। অল্প জায়গায় ব্যতিক্রমী রঙের মরিচ চাষ করতে আগ্রহীদের জন্য এটি আকর্ষণীয় একটি জাত।</p> 

<h3>🌟 কেন ব্ল্যাক বিউটি হাইব্রিড কালো মরিচ চাষ করবেন?</h3> 
<ul> 
<li>🖤 আকর্ষণীয় কালো রঙের মরিচ উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 ব্যতিক্রমী হাইব্রিড জাত</li> 
<li>💪 শক্তিশালী গাছ গঠনে সহায়ক</li> 
<li>✨ বাগানে দৃষ্টিনন্দন বৈচিত্র্য তৈরি করে</li> 
<li>🏡 বাড়ির বাগান ও ছাদবাগানের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে সহজে চাষ করা যায়</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও ব্যবহারযোগ্য</li> 
<li>🌍 চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p>আপনার বাগানে আনুন সাধারণ মরিচের বাইরে একটি ব্যতিক্রমী কালো রঙের বৈচিত্র্য। <strong>ব্ল্যাক বিউটি হাইব্রিড কালো মরিচের বীজ</strong> দিয়ে টব, ছাদবাগান বা জমিতে চাষ শুরু করুন। সঠিক পরিচর্যার মাধ্যমে স্বাস্থ্যকর গাছ ও আকর্ষণীয় মরিচ উৎপাদনের লক্ষ্যে <strong>আজই অর্ডার করুন!</strong> 🌶️🖤</p>', 'VEG-1592', 18, 18, 1, 0, 0, '[]', '2026-09-24T01:42:51.205+00:00', '2026-10-14T06:04:45.481295+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('434175b3-d2a6-47ee-beac-ab69ab50e9c2', 'ইম্পোর্টেড উন্নত জাতের হাইব্রিড সবুজ শিম বীজ (উচ্চ ফলনশীল)', 'imported-hybrid-green-bean-seeds-high-yield', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949208255-ecw0yvk.webp', NULL, 110, 65, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- বর্ষারকাল\"]', 'আনুমানিক ৫ গ্রাম বা ১০ টি ক্যাপসুল। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, কোমল, মাংসল ও সুস্বাদু সবুজ শিম উৎপাদনের জন্য আদর্শ।', '<h3>🌱 ইম্পোর্টেড উন্নত জাতের হাইব্রিড সবুজ শিম বীজ</h3>

<p><strong>ইম্পোর্টেড উন্নত জাতের হাইব্রিড সবুজ শিম</strong> একটি প্রিমিয়াম মানের জাত, যা সঠিক পরিচর্যা ও অনুকূল পরিবেশে লম্বা, কোমল, মাংসল এবং উজ্জ্বল সবুজ শিম উৎপাদনের জন্য উপযোগী। গাছের স্বাভাবিক বৃদ্ধি ও নিয়মিত পরিচর্যা ভালো ফলন পেতে সহায়তা করে। শিমের সুস্বাদু ফল রান্নার বিভিন্ন পদে ব্যবহার করা যায়। বাড়ির বাগান, ছাদবাগান, কিচেন গার্ডেন এবং বাণিজ্যিক চাষের জন্য এটি একটি উপযোগী নির্বাচন।</p>

<h3>📋 Product Specifications</h3>

<ul>
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ৩০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>

<ul>
<li>🌱 উন্নত জাতের হাইব্রিড সবুজ শিম</li>
<li>🫛 লম্বা, কোমল, মাংসল ও উজ্জ্বল সবুজ শিম উৎপাদনের জন্য উপযোগী</li>
<li>🌿 সঠিক পরিচর্যায় গাছের ভালো বৃদ্ধি ও ফলন পেতে সহায়ক</li>
<li>🥗 সুস্বাদু শিম রান্নার বিভিন্ন পদে ব্যবহারযোগ্য</li>
<li>🏡 বাড়ির বাগান ও কিচেন গার্ডেনে চাষ করা যায়</li>
<li>🏢 ছাদবাগান ও উপযুক্ত পাত্রে চাষের সুযোগ রয়েছে</li>
<li>🧑‍🌾 পারিবারিক ও বাণিজ্যিক চাষের জন্য উপযোগী</li>
</ul>

<h3>📅 চাষের উপযুক্ত সময় ও মৌসুম</h3>

<p>বাংলাদেশে সাধারণ শিমের প্রধান বপন মৌসুম সাধারণত <strong>ভাদ্র থেকে আশ্বিন মাস (আগস্টের মাঝামাঝি থেকে অক্টোবর)</strong>। আগাম চাষের জন্য কিছু জাত জ্যৈষ্ঠ থেকে আষাঢ় মাসে (মে–জুলাই) বপন করা যায়। তবে এই হাইব্রিড জাতের সুনির্দিষ্ট মৌসুম বীজের প্যাকেটের নির্দেশনা, স্থানীয় আবহাওয়া ও জাতের বৈশিষ্ট্য অনুযায়ী নির্ধারণ করা ভালো।</p>

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>

<p>শিম চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশন সুবিধাযুক্ত দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকলে শিকড়ের বৃদ্ধি ও গাছের পুষ্টি গ্রহণে সহায়তা করে।</p>

<ul>
<li><strong>জমি চাষ:</strong> জমি ৩–৪ বার চাষ ও মই দিয়ে মাটি ঝুরঝুরে করুন এবং আগাছা ও বড় মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li><strong>নিষ্কাশন ব্যবস্থা:</strong> শিম জলাবদ্ধতা সহ্য করতে পারে না। তাই উঁচু বেড বা মাদা তৈরি করুন এবং প্রয়োজনীয় নালা রাখুন।</li>
<li><strong>জৈব সার:</strong> জমি তৈরির সময় ভালোভাবে পচানো গোবর বা কম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li>
<li><strong>অন্যান্য সার:</strong> মাটির উর্বরতা অনুযায়ী প্রয়োজনীয় সুষম সার ব্যবহার করুন। মাটির অম্লতা অনুযায়ী চুন প্রয়োগের প্রয়োজন আছে কি না, তা নির্ধারণ করা ভালো।</li>
</ul>

<h3>🌿 বীজ বপন পদ্ধতি</h3>

<p>শিমের বীজ সাধারণত সরাসরি জমি, বেড, মাদা বা উপযুক্ত বড় পাত্রে বপন করা যায়। বীজ প্রায় <strong>২–৩ সেন্টিমিটার গভীরে</strong> বপন করে মাটি দিয়ে ঢেকে হালকা পানি দিন। মাটিতে প্রয়োজনীয় আর্দ্রতা বজায় রাখুন, তবে পানি জমতে দেবেন না।</p>

<p>চারা গজানোর পর সুস্থ ও সবল গাছ রাখুন এবং গাছের বৃদ্ধির জন্য পর্যাপ্ত জায়গা নিশ্চিত করুন। বীজ বপনের আগে প্যাকেটে উল্লেখিত নির্দেশনা অনুসরণ করুন।</p>

<h3>🪴 টব ও ছাদবাগানে শিম চাষ</h3>

<p>ছাদবাগান, বারান্দা বা বাড়ির আঙিনায় উপযুক্ত বড় টব ও গ্রো ব্যাগে সবুজ শিম চাষ করা যায়। পাত্রে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। ঝুরঝুরে মাটি, পচা কম্পোস্ট এবং পানি নিষ্কাশন উপযোগী চাষমাধ্যম ব্যবহার করুন।</p>

<p>শিমের লতা বেড়ে ওঠার জন্য শক্ত মাচা, জাল বা খুঁটির ব্যবস্থা করুন। এতে লতা ছড়িয়ে বাড়তে পারে এবং শিম সংগ্রহ করাও সহজ হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>

<p>শিম গাছের ভালো বৃদ্ধির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৬–৮ ঘণ্টা আলো পাওয়া যায় এমন স্থানে চাষ করা ভালো। মাটির আর্দ্রতা বজায় রাখতে নিয়মিত প্রয়োজন অনুযায়ী পানি দিন। বিশেষ করে ফুল ও শুঁটি ধরার সময় পানির ঘাটতি এড়িয়ে চলুন। তবে অতিরিক্ত পানি ও জলাবদ্ধতা গাছের ক্ষতি করতে পারে।</p>

<h3>🌿 সার ও নিয়মিত পরিচর্যা</h3>

<ul>
<li>গাছের বৃদ্ধির পর্যায় অনুযায়ী প্রয়োজনীয় জৈব সার ও সুষম পুষ্টি নিশ্চিত করুন।</li>
<li>অতিরিক্ত নাইট্রোজেন সার প্রয়োগ এড়িয়ে চলুন, কারণ এতে পাতার বৃদ্ধি বেশি হতে পারে।</li>
<li>গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</li>
<li>লতা বড় হওয়ার সঙ্গে সঙ্গে মাচা বা সাপোর্টে তুলে দিন।</li>
<li>ফুল ও শুঁটি ধরার সময় মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখুন।</li>
</ul>

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3>

<p>শিম গাছে জাবপোকা, সাদা মাছি ও বিভিন্ন ধরনের পাতাখেকো পোকা আক্রমণ করতে পারে। নিয়মিত পাতার নিচের অংশ, কচি ডগা ও শুঁটি পরীক্ষা করুন। আক্রান্ত পাতা সরিয়ে ফেলুন, বাগান পরিষ্কার রাখুন এবং পর্যাপ্ত আলো-বাতাস চলাচলের ব্যবস্থা করুন। রোগ বা পোকার আক্রমণ বেশি হলে স্থানীয়ভাবে অনুমোদিত বালাইনাশক বা জৈব নিয়ন্ত্রণ পদ্ধতি পণ্যের লেবেল অনুযায়ী ব্যবহার করুন।</p>

<h3>🫛 শিম সংগ্রহ</h3>

<p>শিমের শুঁটি কোমল, মাংসল ও উপযুক্ত আকার ধারণ করলে সংগ্রহ করুন। শুঁটি অতিরিক্ত পরিপক্ব হওয়ার আগেই সংগ্রহ করলে সাধারণত ভালো মান বজায় থাকে। নিয়মিত শিম সংগ্রহ করলে গাছে পরবর্তী শুঁটি উৎপাদনের সুযোগ তৈরি হতে পারে।</p>

<h3>🏡 কোথায় চাষ করা যায়?</h3>

<ul>
<li>🏠 বাড়ির আঙিনা ও কিচেন গার্ডেন</li>
<li>🏢 ছাদবাগান</li>
<li>🪴 বড় টব ও গ্রো ব্যাগ</li>
<li>🌿 পারিবারিক সবজি বাগান</li>
<li>🌾 খোলা জমি</li>
<li>🧑‍🌾 বাণিজ্যিক সবজি খামার</li>
</ul>

<h3>💚 কেন এই হাইব্রিড সবুজ শিম বীজ নির্বাচন করবেন?</h3>

<p>লম্বা, কোমল ও উজ্জ্বল সবুজ শিম চাষের জন্য এই উন্নত জাতের হাইব্রিড বীজ বাড়ির বাগান থেকে শুরু করে বাণিজ্যিক চাষের জন্য উপযোগী। সঠিক মৌসুমে বপন, উর্বর মাটি, পর্যাপ্ত পানি, মাচা এবং নিয়মিত পরিচর্যা নিশ্চিত করলে ভালো মানের শিম উৎপাদনের সম্ভাবনা থাকে।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং নিজের বাগানে তাজা সবুজ শিম চাষ শুরু করুন!</strong></p>', 'VEG-1537', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:42:32.047+00:00', '2026-10-12T11:24:24.852616+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0f99daae-9c39-4ddf-b1b5-48a9791b09ae', 'হাং জিলং হাইব্রিড বেগুনি লম্বা বেগুন বীজ (১০০ পিস প্যাকেট)', 'hang-jilong-hybrid-purple-long-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949148240-qdu2k3h.webp', NULL, 170, 95, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাং জিলং হাইব্রিড বেগুনি লম্বা বেগুন, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাং জিলং হাইব্রিড বেগুনি লম্বা বেগুন বীজ আকর্ষণীয় বেগুনি রঙের লম্বা বেগুন চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর আকৃতির লম্বা বেগুন উৎপাদনে সহায়ক। ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1573', 17, 17, 1, 0, 0, '[]', '2026-09-24T01:42:50.577+00:00', '2026-10-17T13:42:12.832489+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('74f41c46-76e5-400a-b61d-f427e9183664', 'আমদানিকৃত হাইব্রিড লাল জিনিয়া ফুলের বীজ', 'imported-hybrid-red-zinnia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732454222-a7u8zs2.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"পরীক্ষিত\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল লাল বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'আমদানিকৃত হাইব্রিড লাল জিনিয়া ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন উজ্জ্বল লাল রঙের বড় ও আকর্ষণীয় ফুলে। হাইব্রিড জাত হওয়ায় গাছ দ্রুত বৃদ্ধি পায়, অধিক ফুল উৎপাদন করে এবং দীর্ঘসময় ধরে ফুল ফোটায়। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে দৃষ্টিনন্দন ফুলে ভরে ওঠে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1551', 10, 10, 1, 0, 0, '[]', '2026-09-24T01:42:47.708+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f5731618-1e98-49a7-b761-7b38f49a1707', 'হাইড্রেনজিয়া (রও পরিবর্তনকারী)-ফুলের বীজ - Mixed Color', 'imp-6137-f57316', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732436902-92fzkz0.webp', NULL, 70, 0, NULL, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', NULL, NULL, 'IMP-6137', 10, 10, 1, 1, 0, '[]', '2026-09-24T06:28:40.067+00:00', '2026-09-30T16:29:03.465+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9e403172-a595-4c5c-8ccc-a746ec2b7364', 'আমদানিকৃত হাইব্রিড স্পাইসি রিংস্কেলড চিলি (কুঁচকানো মরিচ) বীজ', 'imported-hybrid-spicy-ring-scaled-chili-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459809714-ju0c8gi.webp', NULL, 120, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কুঁচকানো আকৃতির ঝাঁজালো, উচ্চ ফলনশীল ও আকর্ষণীয় মরিচ উৎপাদন করুন।', 'আমদানিকৃত হাইব্রিড স্পাইসি রিংস্কেলড চিলি (কুঁচকানো মরিচ) একটি বিশেষ আকৃতির ও উচ্চ ফলনশীল মরিচের জাত। এর মরিচগুলো কুঁচকানো বা ভাঁজযুক্ত গঠনের হওয়ায় দেখতে অত্যন্ত আকর্ষণীয় এবং স্বাদে তীব্র ঝাঁজালো। গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং দীর্ঘ সময় ধরে প্রচুর ফলন দেয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1560', 15, 15, 1, 0, 0, '[]', '2026-09-24T01:48:40.604+00:00', '2026-10-20T01:30:20.275691+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('966ca163-2f98-4170-928a-47aa6a31dd74', 'বেগুনি শিম বীজ - F1 হাইব্রিড', 'purple-bean-f1-hybrid-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949207103-zc4ddm5.webp', NULL, 140, 85, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- বর্ষারকাল\"]', 'আনুমানিক ৫ গ্রাম বা ১০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, আকর্ষণীয় বেগুনি রঙের, কোমল ও উচ্চ ফলনশীল শিম উৎপাদন করুন।', '<escape>
```html
<h2>বারোমাসি বেগুনি শিম F1 হাইব্রিড বীজ – আকর্ষণীয় বেগুনি শুঁটি ও দীর্ঘ সময় ফলনের সম্ভাবনা</h2>

<p><strong>বারোমাসি বেগুনি শিম F1 হাইব্রিড</strong> একটি আকর্ষণীয় শিমের জাত, যার শুঁটি বেগুনি রঙের, লম্বাটে ও কোমল। এর ব্যতিক্রমী রং এবং সুস্বাদু শুঁটি বাড়ির বাগান ও বাজার—উভয় ক্ষেত্রেই আলাদা আকর্ষণ তৈরি করতে পারে। উপযুক্ত আবহাওয়া, মাচা, সুষম পুষ্টি ও নিয়মিত পরিচর্যায় গাছ ভালোভাবে বেড়ে উঠতে পারে এবং দীর্ঘ সময় ধরে শুঁটি উৎপাদনের সুযোগ তৈরি হতে পারে। ছাদ বাগান, কিচেন গার্ডেন, বাড়ির আঙিনা এবং বাণিজ্যিক চাষের জন্য এই বীজ বিবেচনা করতে পারেন।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> বারোমাসি বেগুনি শিম F1 হাইব্রিড</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ১২টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>শুঁটির রং:</strong> বেগুনি</li>
  <li><strong>শুঁটির বৈশিষ্ট্য:</strong> লম্বাটে ও কোমল</li>
  <li><strong>জাতের ধরন:</strong> F1 হাইব্রিড</li>
  <li><strong>চাষের উপযোগিতা:</strong> ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক জমি</li>
</ul>

<h2>⭐ বারোমাসি বেগুনি শিমের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় বেগুনি শুঁটি:</strong> শুঁটির ব্যতিক্রমী রং বাগানে বৈচিত্র্য আনে এবং বাজারে আলাদা নজর কাড়তে পারে।</li>
  <li><strong>কোমল ও সুস্বাদু:</strong> কচি শুঁটি ভাজি, তরকারি ও বিভিন্ন ঘরোয়া রান্নায় ব্যবহার করা যায়।</li>
  <li><strong>লতানো গাছ:</strong> মাচা বা উপযুক্ত সাপোর্ট দিলে গাছের বৃদ্ধি ও পরিচর্যা সহজ হয়।</li>
  <li><strong>দীর্ঘ সময় ফলনের সম্ভাবনা:</strong> অনুকূল পরিবেশ ও নিয়মিত পরিচর্যায় একাধিকবার শুঁটি সংগ্রহ করা সম্ভব হতে পারে।</li>
  <li><strong>বিভিন্ন জায়গায় চাষ:</strong> জমি, বাড়ির আঙিনা এবং পর্যাপ্ত জায়গাসম্পন্ন ছাদ বাগানে চাষ করা যায়।</li>
</ul>

<h2>🌤️ চাষের উপযুক্ত সময় ও মৌসুম</h2>
<p>শিমের বীজ বপনের সময় জাতের বৈশিষ্ট্য, স্থানীয় আবহাওয়া ও মৌসুমের ওপর নির্ভর করে। বাংলাদেশে প্রচলিত শীতকালীন শিমের জন্য সাধারণত ভাদ্র থেকে আশ্বিন মাসের মধ্যে বীজ বপন করা হয়। কিছু আগাম জাতের শিম জ্যৈষ্ঠ থেকে আষাঢ় মাসেও বপন করা যায়। তবে বারোমাসি বেগুনি শিম F1 হাইব্রিডের ক্ষেত্রে প্যাকেটের নির্দেশনা ও স্থানীয় কৃষি পরামর্শ অনুসরণ করুন। বারোমাসি নাম থাকলেও সারা বছর ফলন পেতে আবহাওয়া ও পরিচর্যার উপযোগিতা গুরুত্বপূর্ণ।</p>

<h2>🪴 মাটি ও জমি প্রস্তুতির পদ্ধতি</h2>
<p>শিম চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি উপযোগী। জমি ভালোভাবে চাষ ও মই দিয়ে আগাছা, বড় মাটির ঢেলা এবং অন্যান্য আবর্জনা সরিয়ে নিন। শিম গাছ জলাবদ্ধতা সহ্য করতে পারে না, তাই জমিতে পানি নিষ্কাশনের ভালো ব্যবস্থা রাখা জরুরি। প্রয়োজনে উঁচু বেড বা মাদা তৈরি করুন।</p>

<ul>
  <li><strong>জৈব সার:</strong> জমি তৈরির সময় মাটির উর্বরতা অনুযায়ী ভালোভাবে পচানো গোবর বা কম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li>
  <li><strong>রাসায়নিক সার:</strong> মাটির অবস্থা ও কৃষি পরামর্শ অনুযায়ী সুষম সার ব্যবহার করুন।</li>
  <li><strong>মাটির অম্লতা:</strong> মাটি অতিরিক্ত অম্লীয় হলে পরীক্ষা ও স্থানীয় কৃষি পরামর্শের ভিত্তিতে চুন প্রয়োগ করুন।</li>
  <li><strong>নিষ্কাশন:</strong> জমিতে পানি জমে থাকার আশঙ্কা থাকলে নালা তৈরি করে পানি বের হওয়ার ব্যবস্থা রাখুন।</li>
</ul>

<h2>🌱 বীজ বপন ও চারা গজানোর পদ্ধতি</h2>
<ol>
  <li>পরিষ্কার, ঝুরঝুরে ও আর্দ্রতাযুক্ত মাটি প্রস্তুত করুন।</li>
  <li>বীজ সরাসরি নির্ধারিত মাদা বা জমিতে বপন করতে পারেন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>বপনের পর আলতোভাবে পানি দিন, যাতে মাটি আর্দ্র থাকে কিন্তু জলাবদ্ধতা না হয়।</li>
  <li>চারা গজানোর পর দুর্বল চারা থাকলে প্রয়োজন অনুযায়ী পাতলা করে সুস্থ গাছের বৃদ্ধির জায়গা নিশ্চিত করুন।</li>
  <li>গাছ বড় হওয়ার আগেই মজবুত মাচা বা সাপোর্ট তৈরি করে দিন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন জায়গায় শিম গাছ লাগান।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা ও আবহাওয়া অনুযায়ী নিয়মিত সেচ দিন।</li>
  <li><strong>জলাবদ্ধতা এড়ানো:</strong> গাছের গোড়ায় পানি জমতে দেবেন না, কারণ এতে শিকড়ের ক্ষতি হতে পারে।</li>
  <li><strong>মাচা তৈরি:</strong> লতানো গাছের জন্য শক্ত ও স্থিতিশীল মাচা তৈরি করুন, যাতে লতা সহজে ছড়িয়ে উঠতে পারে।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের পরিচর্যা</h2>
<p>গাছের সুস্থ বৃদ্ধি ও শুঁটি উৎপাদনে সহায়তার জন্য মাটির উর্বরতা অনুযায়ী সুষম সার এবং পরিপক্ব জৈব সার প্রয়োগ করুন। অতিরিক্ত নাইট্রোজেন সার দিলে পাতার বৃদ্ধি বেশি হতে পারে, তাই সারের পরিমাণে ভারসাম্য বজায় রাখুন। নিয়মিত আগাছা পরিষ্কার করুন, লতাকে মাচায় তুলে দিন এবং শুকনো বা রোগাক্রান্ত পাতা সরিয়ে ফেলুন। ফুল ও শুঁটি আসার সময় মাটির আর্দ্রতা ঠিক রাখা বিশেষভাবে গুরুত্বপূর্ণ।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>শিম গাছের পাতা, কাণ্ড, ফুল ও শুঁটি নিয়মিত পরীক্ষা করুন। পাতায় দাগ, পাতা কুঁকড়ে যাওয়া, গাছের বৃদ্ধি কমে যাওয়া বা শুঁটিতে ছিদ্র দেখা দিলে দ্রুত ব্যবস্থা নিন। আক্রান্ত অংশ প্রয়োজন অনুযায়ী সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। রোগ বা পোকার আক্রমণ বাড়লে সঠিকভাবে শনাক্ত করে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন।</p>

<h2>🫘 শিম সংগ্রহ ও রান্নায় ব্যবহার</h2>
<p>শুঁটি জাতের বৈশিষ্ট্য অনুযায়ী উপযুক্ত আকারে পৌঁছালে এবং কোমল থাকা অবস্থায় সংগ্রহ করুন। নিয়মিত শুঁটি সংগ্রহ করলে গাছের অবস্থা পর্যবেক্ষণ করা সহজ হয় এবং অনুকূল পরিবেশে নতুন শুঁটি গঠনে সহায়তা করতে পারে। বেগুনি শিম ভাজি, তরকারি ও অন্যান্য ঘরোয়া রান্নায় ব্যবহার করা যায়। রান্নার পর শুঁটির রং পরিবর্তিত হতে পারে। ফলন ও সংগ্রহের সময় আবহাওয়া, মাটি, গাছের স্বাস্থ্য এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনে চাষ</h2>
<p>বাড়িতে বেগুনি শিম চাষ করতে চাইলে পর্যাপ্ত মাটির জায়গা, সূর্যালোক ও মজবুত মাচার ব্যবস্থা নিশ্চিত করুন। ছাদে চাষের জন্য পানি নিষ্কাশনের ছিদ্রযুক্ত বড় টব বা গ্রো-ব্যাগ ব্যবহার করুন। লতা ছড়িয়ে ওঠার জন্য সাপোর্ট দিন এবং নিয়মিত পানি ও পুষ্টির ব্যবস্থা রাখুন। ছাদে টব বসানোর সময় অতিরিক্ত ওজনের বিষয়টিও বিবেচনায় রাখুন।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>বাড়ির বাগান বা বাণিজ্যিক চাষে আকর্ষণীয় বেগুনি শিম উৎপাদনের পরিকল্পনা থাকলে সংগ্রহ করুন <strong>বারোমাসি বেগুনি শিম F1 হাইব্রিড বীজ</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যার মাধ্যমে সুস্থ গাছ গড়ে তুলুন এবং নিজের বাগানে তাজা শিম উৎপাদনের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1538', 7, 7, 1, 0, 0, '[]', '2026-09-24T01:42:41.801+00:00', '2026-10-13T07:39:53.100106+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ec47607c-226f-4a05-a4de-d72fa6fe7d5b', 'হাইব্রিড কমলা গাঁদা ফুলের বীজ', 'hybrid-orange-marigold-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1783791508944-ssc0e5e.webp', NULL, 150, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল কমলা রঙের ঘন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3>
<p><strong>হাইব্রিড কমলা গাঁদা ফুলের বীজ</strong> দিয়ে আপনার বাগানে ফুটিয়ে তুলুন উজ্জ্বল কমলা রঙের বড় ও ঘন আকৃতির আকর্ষণীয় ফুল। হাইব্রিড জাত হওয়ায় গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং দীর্ঘসময় ধরে প্রচুর ফুল উৎপাদনের জন্য উপযোগী।</p>
<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের বীজ ও সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ এবং দৃষ্টিনন্দন ফুল পেতে সহায়ক। 🌼 <strong>আপনার বাগানকে উজ্জ্বল কমলা ফুলে সাজাতে আজই গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌼 <strong>জাত:</strong> হাইব্রিড কমলা গাঁদা</li>
<li>🧡 <strong>ফুলের রঙ:</strong> উজ্জ্বল কমলা</li>
<li>🌸 <strong>ফুলের বৈশিষ্ট্য:</strong> বড় ও ঘন আকৃতির আকর্ষণীয় ফুল</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>গাঁদা ফুল তুলনামূলকভাবে <strong>শীতল ও মৃদু আবহাওয়ায়</strong> ভালো বৃদ্ধি পায় এবং প্রচুর ফুল দিতে পারে। বাংলাদেশে হাইব্রিড কমলা গাঁদা চাষের জন্য নিচের সময়গুলো বেশি উপযোগী:</p>
<ul>
<li>🍂 <strong>হেমন্ত:</strong> অক্টোবর–নভেম্বর — বীজ বপনের জন্য উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি — গাছের বৃদ্ধি ও ফুল উৎপাদনের জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ ও বসন্তের শুরু:</strong> ফেব্রুয়ারি–মার্চ পর্যন্ত অনুকূল পরিবেশে ফুল পাওয়া যেতে পারে।</li>
<li>🌧️ <strong>বর্ষাকাল:</strong> অতিরিক্ত বৃষ্টি ও জলাবদ্ধতা গাছের জন্য ক্ষতিকর হতে পারে। তবে উঁচু বেড বা ভালো ড্রেনেজযুক্ত টবে চাষ করা যায়।</li>
</ul>

<h3>🪴 কমলা গাঁদা ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
গাঁদা ফুলের জন্য হালকা, ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। খুব ভারী ও পানি ধরে রাখে এমন কাদামাটি সরাসরি ব্যবহার না করাই ভালো।</p>

<p><strong>২. খোলা জমির মাটি প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা, পুরোনো শিকড় ও অন্যান্য আবর্জনা পরিষ্কার করুন। এরপর কোদাল বা চাষের মাধ্যমে মাটি <strong>২–৩ বার ভালোভাবে ঝুরঝুরে</strong> করে নিন। বড় মাটির ঢেলা ভেঙে মাটি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির উর্বরতা ও গঠন উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. মাটি ভারী হলে হালকা করুন</strong><br>
এঁটেল বা ভারী মাটি হলে পচা কম্পোস্টের সঙ্গে প্রয়োজনমতো <strong>মোটা বালি</strong> মিশিয়ে মাটিকে ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য করে তুলুন।</p>

<p><strong>৫. উঁচু বেড তৈরি করুন</strong><br>
যেসব জমিতে পানি জমে থাকার সম্ভাবনা থাকে সেখানে প্রায় <strong>৬–৮ ইঞ্চি উঁচু বেড</strong> তৈরি করা ভালো। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং গাছের শিকড় সুস্থ থাকে।</p>

<p><strong>৬. টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</strong><br>
টব বা পাত্রে হাইব্রিড কমলা গাঁদা চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p>
<ul>
<li>🟤 ৪০% ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 ৩০% কোকোপিট</li>
<li>🍂 ২০% ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি জমে না থাকে।</p>

<p><strong>৭. বীজ বপনের পদ্ধতি</strong><br>
মাটি প্রস্তুত করার পর উপরের অংশ হালকা করে ঝুরঝুরে করে নিন। বীজ সমানভাবে ছড়িয়ে দিয়ে অল্প পরিমাণ মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না।</p>

<p><strong>৮. পানি ও আর্দ্রতা ব্যবস্থাপনা</strong><br>
বীজ অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। পানি দেওয়ার সময় জোরে পানি না ঢেলে <strong>স্প্রে করে পানি দেওয়া</strong> ভালো, যাতে বীজ সরে না যায়। অতিরিক্ত পানি জমতে দেবেন না।</p>

<p><strong>৯. পর্যাপ্ত আলো নিশ্চিত করুন</strong><br>
গাঁদা ফুলের গাছ ভালো বৃদ্ধি ও ফুল উৎপাদনের জন্য প্রতিদিন প্রায় <strong>৫–৬ ঘণ্টা বা তার বেশি সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে রাখা ভালো।</p>

<p>💡 <strong>বিশেষ টিপস:</strong> গাঁদা গাছ পর্যাপ্ত আলো, ঝুরঝুরে মাটি ও সঠিক পানি ব্যবস্থাপনায় ভালোভাবে বেড়ে ওঠে। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন। শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে গাছে নতুন ফুল আসতে সহায়তা করতে পারে।</p>

<h3>🌼 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🪴 টব ও পাত্র</li>
<li>🏠 বারান্দা</li>
<li>🌿 ছাদবাগান</li>
<li>🌸 ফুলের বেড</li>
<li>🌱 বর্ডার</li>
<li>🏡 খোলা বাগান</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ি, বারান্দা বা ছাদবাগানে উজ্জ্বল কমলা রঙের আকর্ষণীয় ফুলের সৌন্দর্য আনতে আজই হাইব্রিড কমলা গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>', 'FUL-1540', 7, 7, 1, 0, 0, '[]', '2026-09-24T01:42:38.267+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('bb0bcde8-853d-4db5-b181-a013d847d2ea', 'হাইব্রিড বাঁশ লাউ বীজ (ইম্পোর্টেড চায়না প্যাকেট)', 'ni-wang-hybrid-bamboo-bottle-gourd-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949191026-4osq63e.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1781081754704-1h6u29c.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1781081755534-b2w9y85.webp\"]', 120, 110, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৩৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লম্বা, কোমল, উচ্চ ফলনশীল ও বাজারে চাহিদাসম্পন্ন বাঁশ লাউ উৎপাদন করুন।', 'হাইব্রিড বাঁশ লাউ (ইম্পোর্টেড চায়না প্যাকেট) একটি উন্নত মানের ও উচ্চ ফলনশীল লাউয়ের জাত, যা অত্যন্ত লম্বা, সোজা ও আকর্ষণীয় বাঁশ লাউ উৎপাদন করে। এর ফল কোমল, সুস্বাদু এবং কম বয়সে সংগ্রহ করলে রান্নার জন্য বিশেষ উপযোগী। গাছ দ্রুত বৃদ্ধি পায়, দীর্ঘ সময় ধরে ফলন দেয় এবং ভালো পরিচর্যায় প্রচুর উৎপাদন পাওয়া যায়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1578', 7, 7, 1, 0, 0, '[]', '2026-09-24T01:48:37.784+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d41ef4bc-9380-4f53-a2d2-db9aea0e7fe2', 'হাইব্রিড লম্বা লাল মরিচের বীজ - ৮৮১৯ (উচ্চ ফলনশীল)', 'hybrid-long-red-chili-8819-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459574161-yd3vvid.webp', NULL, 150, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, ঝাঁজালো, উজ্জ্বল লাল রঙের এবং দীর্ঘ আকৃতির মরিচ উৎপাদন করে।', '<h3>🌱 Product Short Description</h3> 
<p><strong>হাইব্রিড লম্বা লাল মরিচ ৮৮১৯</strong> একটি উচ্চ ফলনশীল ও জনপ্রিয় মরিচের জাত, যা লম্বা, সরু ও উজ্জ্বল লাল রঙের মরিচ উৎপাদনের জন্য উপযোগী। গাছ শক্তিশালী এবং সঠিক পরিচর্যায় দীর্ঘসময় ফলন পাওয়ার সুযোগ তৈরি হতে পারে। মরিচের ঝাঁজ ও গুণগত মান রান্নায় ব্যবহারের জন্য উপযোগী।</p> 

<p>ছাদবাগান, কিচেন গার্ডেন, টব, গ্রো ব্যাগ এবং বাণিজ্যিক চাষের জন্য উপযোগী এই জাতটি। নিজের বাগানে সুস্বাদু ও আকর্ষণীয় লাল মরিচ চাষ করতে <strong>আজই অর্ডার করুন!</strong> 🌶️</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> হাইব্রিড লম্বা লাল মরিচ ৮৮১৯</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌶️ হাইব্রিড লম্বা লাল মরিচ ৮৮১৯-এর বিশেষ বৈশিষ্ট্য</h3> 
<ul> 
<li>🌶️ লম্বা, সরু ও উজ্জ্বল লাল রঙের মরিচ উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 শক্তিশালী গাছ গঠনে সহায়ক</li> 
<li>📈 সঠিক পরিচর্যায় ভালো ফলন পাওয়ার সম্ভাবনা</li> 
<li>⏳ দীর্ঘসময় ফলন দেওয়ার জন্য উপযোগী</li> 
<li>🌶️ ঝাঁজালো ও রান্নায় ব্যবহার উপযোগী</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে মরিচ চাষ করা ভালো?</h3> 
<p>মরিচ উষ্ণ ও রৌদ্রোজ্জ্বল পরিবেশে ভালোভাবে বেড়ে ওঠে। বাংলাদেশে সাধারণভাবে <strong>অক্টোবর থেকে জানুয়ারি</strong> সময়টি মরিচের চারা তৈরির জন্য সুবিধাজনক। উপযুক্ত পরিবেশ, তাপমাত্রা ও পরিচর্যা থাকলে বছরের অন্যান্য সময়েও চাষ করা যেতে পারে।</p> 

<p>বর্ষাকালে মরিচ চাষ করলে পানি নিষ্কাশনের দিকে বিশেষ নজর দিতে হবে। অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতা এড়িয়ে চলা জরুরি।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>মরিচ গাছের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> উপযোগী। জমির মাটি শক্ত হলে জৈব সার ও প্রয়োজনীয় ড্রেনেজ উপাদান মিশিয়ে মাটিকে ঝুরঝুরে করে নিন।</p> 

<ul> 
<li>🌱 জমি কয়েকবার চাষ ও মই দিয়ে মাটি ঝুরঝুরে করুন।</li> 
<li>🍂 পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>💧 পানি জমার সমস্যা থাকলে উঁচু বেড তৈরি করুন।</li> 
<li>🏖️ ভারী মাটিতে প্রয়োজন অনুযায়ী বালি বা পার্লাইট ব্যবহার করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজ সরাসরি জমি, টব বা গ্রো ব্যাগে বপন করা যায়। তবে প্রথমে সিড ট্রে বা নার্সারি বেডে চারা তৈরি করে পরে মূল জায়গায় রোপণ করলে পরিচর্যা সহজ হয়। ঝুরঝুরে মাটিতে বীজ <strong>প্রায় ০.৫–১ সেমি গভীরে</strong> বপন করে পাতলা মাটি দিয়ে ঢেকে দিন।</p> 

<p>বীজ বপনের পর হালকা পানি স্প্রে করুন। অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন, তবে অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা শক্ত হলে সাবধানে নির্দিষ্ট দূরত্বে রোপণ করুন।</p> 

<h3>🪴 টব বা গ্রো ব্যাগে চাষের মাটির মিশ্রণ</h3> 
<p>ছাদবাগান বা বারান্দায় মরিচ চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 <strong>৪০%</strong> দোআঁশ মাটি</li> 
<li>🥥 <strong>৩০%</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%</strong> পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>মরিচ গাছের ভালো বৃদ্ধি ও ফলনের জন্য প্রতিদিন <strong>প্রায় ৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন জায়গা নির্বাচন করা ভালো। ছাদ, খোলা বারান্দা বা রোদযুক্ত কিচেন গার্ডেন এ ক্ষেত্রে উপযোগী।</p> 

<p>মাটির উপরিভাগ কিছুটা শুকিয়ে এলে পানি দিন। মাটিতে প্রয়োজনীয় আর্দ্রতা বজায় রাখুন, তবে জলাবদ্ধতা তৈরি হতে দেবেন না। গরম ও শুষ্ক আবহাওয়ায় মাটি দ্রুত শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিতে হবে।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 নিয়মিত অল্প পরিমাণে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট প্রয়োগ করুন।</li> 
<li>🌱 গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার রাখুন।</li> 
<li>💧 মাটির আর্দ্রতা পর্যবেক্ষণ করে পানি দিন।</li> 
<li>☀️ গাছকে পর্যাপ্ত আলো ও বাতাস চলাচলের সুযোগ দিন।</li> 
<li>🌿 গাছ বেশি ভারী হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট দিন।</li> 
<li>🐛 পাতার নিচে, কচি ডগা ও ফলে পোকামাকড়ের উপস্থিতি নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>✂️ শুকনো বা আক্রান্ত পাতা ও ডাল প্রয়োজন অনুযায়ী সরিয়ে ফেলুন।</li> 
</ul> 

<h3>🌶️ মরিচ সংগ্রহের পদ্ধতি</h3> 
<p>ব্যবহারের ধরন অনুযায়ী মরিচ <strong>সবুজ অবস্থায় অথবা সম্পূর্ণ লাল ও পরিপক্ব অবস্থায়</strong> সংগ্রহ করা যায়। লাল মরিচের জন্য ফল গাছে রেখে পরিপক্ব হওয়ার পর সংগ্রহ করুন। পরিষ্কার কাঁচি দিয়ে ফল সংগ্রহ করলে গাছের ডাল ও নতুন কুঁড়ির ক্ষতি কম হয়।</p> 

<p>নিয়মিত পরিপক্ব মরিচ সংগ্রহ করলে গাছে নতুন ফল ধরার সুযোগ তৈরি হতে পারে এবং দীর্ঘসময় উৎপাদন বজায় রাখতে সহায়ক হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>হাইব্রিড লম্বা লাল মরিচ ৮৮১৯</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, টব, গ্রো ব্যাগ এবং কৃষিজমিতে চাষ করা যায়। অল্প জায়গায় টব বা গ্রো ব্যাগ ব্যবহার করেও সহজে মরিচ চাষ করা সম্ভব।</p> 

<h3>🌟 কেন হাইব্রিড লম্বা লাল মরিচ ৮৮১৯ চাষ করবেন?</h3> 
<ul> 
<li>🌶️ লম্বা ও আকর্ষণীয় লাল মরিচ উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 শক্তিশালী গাছ গঠনে সহায়ক</li> 
<li>📈 ভালো ফলনের সম্ভাবনা</li> 
<li>⏳ দীর্ঘসময় ফলন পাওয়ার জন্য উপযোগী</li> 
<li>🌶️ ঝাঁজালো মরিচ রান্নায় ব্যবহার করা যায়</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌾 বাণিজ্যিক চাষেও ব্যবহারযোগ্য</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p>আপনার ছাদবাগান, কিচেন গার্ডেন বা কৃষিজমিতে <strong>হাইব্রিড লম্বা লাল মরিচ ৮৮১৯</strong> দিয়ে মরিচ চাষ শুরু করুন। সঠিক মাটি, পর্যাপ্ত আলো, পানি ও নিয়মিত পরিচর্যার মাধ্যমে ভালো ও স্বাস্থ্যকর গাছ গড়ে তোলার লক্ষ্যে <strong>আজই অর্ডার করুন!</strong> 🌶️</p>', 'VEG-1563', 16, 16, 1, 0, 0, '[]', '2026-09-24T01:48:41.596+00:00', '2026-10-20T01:26:28.328431+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('df1ac7ba-95cf-4e7b-82c6-9fad1ae46a85', 'হাইব্রিড লাল টমেটো বীজ', 'nongjiawang-hybrid-red-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949161470-m2nw6lu.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782990303797-hu6myut.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782990303445-h6wpp9h.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782990302956-nchfejl.webp\"]', 120, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৬০০টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, উজ্জ্বল লাল রঙের, সুস্বাদু ও বাজারজাতকরণের জন্য আদর্শ', 'নংজিয়াওয়াং হাইব্রিড লাল টমেটো বীজ উন্নত মানের ও উচ্চ ফলনশীল একটি হাইব্রিড জাত। এর গাছে প্রচুর পরিমাণে উজ্জ্বল লাল, মাংসল ও সুস্বাদু টমেটো ধরে। দ্রুত বৃদ্ধি, ভালো অঙ্কুরোদগম এবং রোগ সহনশীলতার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য অত্যন্ত উপযোগী।&nbsp;<div><br></div><div><span style=\"font-weight: bold;\">&nbsp;Product Specifications&nbsp;</span></div><div><ul><li>&nbsp;📦 বীজ সংখ্যা: আনুমানিক ৬০০টি বীজ (উচ্চ গুণমানসম্পন্ন)&nbsp;</li><li>🌱 বিশুদ্ধতা (Purity): ৯৫%&nbsp;</li><li>✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%&nbsp;</li><li>✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%</li><li>&nbsp;🪴 বেঁচে থাকার হার (Survival Rate): ৯০%</li></ul></div>', 'VEG-1549', 0, 0, 0, 0, 0, '[]', '2026-09-24T01:48:30.896+00:00', '2026-10-12T11:25:04.614134+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('12f65264-b37f-4bf1-80fb-1ad150de6184', 'বিদেশী পেঁয়াজ পাতার বীজ', 'imported-green-onion-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364668295-v04vbq5.webp', NULL, 120, 55, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ১০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, দ্রুত বৃদ্ধি পায়, সুগন্ধি ও কোমল পাতা উৎপাদন করে, সারা বছর চাষের জন্য উপযোগী।', 'বিদেশী পেঁয়াজ পাতার বীজ থেকে কোমল, সুগন্ধি ও পুষ্টিকর পেঁয়াজ পাতা উৎপাদন করা যায়। দ্রুত অঙ্কুরোদগম ও উচ্চ ফলনশীল বৈশিষ্ট্যের কারণে এটি ছাদ বাগান, কিচেন গার্ডেন এবং বাণিজ্যিক চাষের জন্য অত্যন্ত উপযোগী। রান্না, সালাদ ও বিভিন্ন খাবারে তাজা স্বাদ যোগ করতে এই পেঁয়াজ পাতা বিশেষ জনপ্রিয়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1509', 4, 4, 1, 0, 0, '[]', '2026-09-24T01:42:44.48+00:00', '2026-10-17T06:51:22.132504+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('631082ff-1679-4165-90b2-2a759462c413', 'বোম্বাই-২ মরিচের বীজ', 'bombai-2-chili-pepper-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378427906-fqdi41w.webp', NULL, 120, 110, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"হাইব্রিড\"]', 'আনুমানিক ২০০+ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | বোম্বাই-২ মরিচ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🌱 Product Short Description</h3> 
<p><strong>বোম্বাই-২ মরিচের বীজ</strong> উন্নত মানের মরিচ চাষের জন্য উপযোগী একটি ভালো জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ গড়ে উঠতে এবং ভালো ফলন পেতে সহায়ক।</p> 

<p>বাড়ির বাগান, ছাদবাগান, টব, গ্রো ব্যাগ ও বাণিজ্যিক চাষের জন্য উপযোগী এই মরিচের বীজ। নিজের বাগানে সতেজ মরিচ চাষ শুরু করতে <strong>আজই অর্ডার করুন!</strong> 🌶️</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০+ টি বীজ / ১ গ্রাম+ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> বোম্বাই-২</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে মরিচ চাষ করা ভালো?</h3> 
<p>মরিচ উষ্ণ ও পর্যাপ্ত আলোযুক্ত পরিবেশে ভালোভাবে বেড়ে ওঠে। বাংলাদেশে সাধারণভাবে <strong>অক্টোবর থেকে জানুয়ারি</strong> সময়টি মরিচের চারা তৈরির জন্য সুবিধাজনক। এছাড়া অনুকূল পরিবেশে বছরের অন্যান্য সময়েও চাষ করা যায়।</p> 

<p>বর্ষাকালে চাষ করলে জমিতে বা টবে যেন পানি জমে না থাকে তা নিশ্চিত করতে হবে। অতিরিক্ত জলাবদ্ধতা মরিচ গাছের শিকড়ের জন্য ক্ষতিকর হতে পারে।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>মরিচের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি শক্ত বা অতিরিক্ত কাদাযুক্ত হলে জৈব উপাদান ও ড্রেনেজ উপকরণ মিশিয়ে মাটির গঠন উন্নত করুন।</p> 

<ul> 
<li>🌱 জমির মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🏖️ ভারী মাটিতে প্রয়োজন অনুযায়ী বালি বা পার্লাইট ব্যবহার করুন।</li> 
<li>💧 পানি জমার প্রবণতা থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজ সরাসরি জমিতে বা আগে <strong>সিড ট্রে/নার্সারি বেডে</strong> বপন করে চারা তৈরি করা যায়। ঝুরঝুরে মাটিতে বীজ ছিটিয়ে হালকা মাটি দিয়ে ঢেকে দিন। সাধারণভাবে <strong>প্রায় ০.৫–১ সেমি গভীরে</strong> বপন করা উপযোগী।</p> 

<p>বীজ বপনের পর হালকা পানি স্প্রে করুন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা পর্যাপ্ত শক্ত হলে মূল জমি, টব বা গ্রো ব্যাগে স্থানান্তর করা যায়।</p> 

<h3>🪴 টব বা গ্রো ব্যাগে চাষের মাটির মিশ্রণ</h3> 
<p>ছাদবাগান বা বারান্দায় মরিচ চাষের জন্য নিচের ধরনের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 <strong>৪০%</strong> দোআঁশ মাটি</li> 
<li>🥥 <strong>৩০%</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%</strong> পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি, যাতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>মরিচ গাছ ভালো ফলন দেওয়ার জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় <strong>৬–৮ ঘণ্টা আলো</strong> পাওয়া যায় এমন জায়গায় গাছ রাখলে ভালো বৃদ্ধি ও ফলন পেতে সহায়ক হতে পারে।</p> 

<p>মাটির উপরিভাগ কিছুটা শুকিয়ে এলে পানি দিন। নিয়মিত আর্দ্রতা বজায় রাখুন, তবে টব বা জমিতে পানি জমতে দেবেন না। অতিরিক্ত পানি শিকড়ের সমস্যা তৈরি করতে পারে।</p> 

<h3>🌿 সার ও পরিচর্যা</h3> 
<ul> 
<li>🍂 নির্দিষ্ট সময় পরপর পচা কম্পোস্ট বা ভার্মিকম্পোস্ট প্রয়োগ করুন।</li> 
<li>🌱 আগাছা নিয়মিত পরিষ্কার করুন।</li> 
<li>💧 মাটির আর্দ্রতা পর্যবেক্ষণ করে পানি দিন।</li> 
<li>☀️ গাছ যেন পর্যাপ্ত আলো ও বাতাস পায় তা নিশ্চিত করুন।</li> 
<li>🌿 প্রয়োজন অনুযায়ী অতিরিক্ত দুর্বল বা আক্রান্ত পাতা সরিয়ে ফেলুন।</li> 
<li>🐛 পাতার নিচে ও কচি ডগায় পোকামাকড়ের উপস্থিতি নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>🌱 গাছ বড় হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট দেওয়া যেতে পারে।</li> 
</ul> 

<h3>🌶️ মরিচ সংগ্রহের পদ্ধতি</h3> 
<p>ফল জাত ও ব্যবহারের ধরন অনুযায়ী সবুজ অবস্থায় বা পরিপক্ব অবস্থায় মরিচ সংগ্রহ করা যায়। পরিষ্কার কাঁচি বা হাত দিয়ে সাবধানে মরিচ সংগ্রহ করুন, যাতে গাছের ডাল বা নতুন কুঁড়ি ক্ষতিগ্রস্ত না হয়। নিয়মিত পরিপক্ব মরিচ সংগ্রহ করলে গাছে নতুন ফল ধরার সুযোগ তৈরি হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>বোম্বাই-২ মরিচের বীজ</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, টব, গ্রো ব্যাগ এবং কৃষিজমিতে চাষের জন্য উপযোগী। অল্প জায়গাতেও টব বা গ্রো ব্যাগ ব্যবহার করে সহজে মরিচ চাষ করা যায়।</p> 

<h3>🌟 কেন বোম্বাই-২ মরিচ চাষ করবেন?</h3> 
<ul> 
<li>🌱 উন্নত মানের মরিচ চাষের জন্য উপযোগী</li> 
<li>🌿 সঠিক পরিচর্যায় শক্তিশালী গাছ পাওয়ার সম্ভাবনা</li> 
<li>🌶️ বাড়িতে তাজা মরিচ উৎপাদনের সুযোগ</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও ব্যবহারযোগ্য</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p>নিজের বাড়ির বাগান, ছাদ বা কৃষিজমিতে <strong>বোম্বাই-২ মরিচের বীজ</strong> দিয়ে মরিচ চাষ শুরু করুন। সঠিক মাটি, পর্যাপ্ত আলো, পানি ও নিয়মিত পরিচর্যার মাধ্যমে ভালো ফলন পাওয়ার লক্ষ্যে আজই আপনার বীজ অর্ডার করুন!</p>', 'VEG-1507', 22, 22, 1, 0, 0, '[]', '2026-09-24T01:46:42.861+00:00', '2026-10-13T05:23:18.318228+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('3245f1d5-0061-4c5e-9275-9bb40d41b989', 'বারি বেগুন-১২ বীজ (কেজি বেগুন) - প্রিমিয়াম কোয়ালিটি', 'bari-eggplant-12-1kg-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378431882-el9bg0m.webp', NULL, 250, 150, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"হাইব্রিড\"]', 'আনুমানিক ২০০+ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | বারি বেগুন-১২, প্রায় ১ কেজি ওজনের বড় বেগুনের জন্য উপযোগী। আজই অর্ডার করুন!', '🌱 Product Short Description

বারি বেগুন-১২ একটি উন্নত জাতের বেগুন, যার প্রতিটি বেগুনের ওজন প্রায় ১ কেজি পর্যন্ত হতে পারে। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং বড় আকৃতির বেগুন উৎপাদনে সহায়ক।

বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🍆 বড় আকৃতির বেগুন চাষের জন্য প্রিমিয়াম মানের বীজ নিতে আজই অর্ডার করুন!

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ২০০+ টি বীজ (উচ্চ গুণমানসম্পন্ন)
⚖️ ফলের ওজন: প্রতিটি বেগুনের ওজন প্রায় ১ কেজি
🌱 বীজের মান: শতভাগ অরিজিনাল বীজ নিশ্চয়তা
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1505', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:46:42.573+00:00', '2026-10-17T12:58:14.811634+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('655ce18a-9d3b-467c-bbab-dfe7d17f7caa', 'মিক্সড ওয়াইল্ড ফ্লাওয়ার বীজ (মিশ্র বুনো ফুল)', 'mixed-wildflower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732427680-22lulwt.webp', NULL, 120, 55, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৪ গ্রাম (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বিভিন্ন রঙের বুনো ফুলের সমাহার, প্রাকৃতিক সৌন্দর্যে ভরিয়ে তুলুন আপনার বাগান।', 'মিক্সড ওয়াইল্ড ফ্লাওয়ার বীজ (মিশ্র বুনো ফুল) দিয়ে সহজেই তৈরি করুন রঙিন ও প্রাকৃতিক সৌন্দর্যে ভরা একটি ফুলের বাগান। এই মিশ্র প্যাকেটে বিভিন্ন প্রজাতির আকর্ষণীয় ফুলের বীজ থাকে, যা পর্যায়ক্রমে ফুটে বাগানকে দীর্ঘসময় রঙিন ও প্রাণবন্ত রাখে। টব, ছাদবাগান, খোলা বাগান, বর্ডার এবং ল্যান্ডস্কেপ সাজানোর জন্য এটি একটি দারুণ নির্বাচন। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ ও প্রচুর ফুল পাওয়া যায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৪ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1529', 5, 5, 1, 0, 0, '[]', '2026-09-24T01:42:36.488+00:00', '2026-10-18T04:12:52.504338+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c49df23c-8eaa-4fdd-9b6e-593de0706316', 'চাইনিজ হাইব্রিড সবুজ বেগুন বীজ', 'chinese-hybrid-green-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949149785-l4wlan4.webp', NULL, 150, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"পরীক্ষিত\",\"সেরা পণ্য\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, সুস্বাদু ও আকর্ষণীয় সবুজ বেগুন উৎপাদনের জন্য উপযুক্ত।', '<escape>
```html
<h2>চাইনিজ হাইব্রিড সবুজ বেগুন বীজ – লম্বাটে, কোমল ও সুস্বাদু বেগুন চাষ</h2>

<p><strong>চাইনিজ হাইব্রিড সবুজ বেগুন বীজ</strong> হালকা সবুজ রঙের লম্বাটে ও মসৃণ বেগুন চাষের জন্য একটি আকর্ষণীয় জাত। এর ফল কোমল, কম বীজযুক্ত এবং স্বাদে চমৎকার হওয়ায় ভাজি, ভর্তা, তরকারিসহ বিভিন্ন ধরনের রান্নায় ব্যবহার করা যায়। উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় গাছ ভালোভাবে বেড়ে উঠতে পারে এবং দীর্ঘ সময় ধরে ফল দেওয়ার সম্ভাবনা থাকে। বাড়ির ছাদ বাগান, কিচেন গার্ডেন, আঙিনা ও বাণিজ্যিক জমিতে বেগুন চাষে আগ্রহীদের জন্য এই জাতটি বিবেচনা করতে পারেন।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> চাইনিজ হাইব্রিড সবুজ বেগুন বীজ</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>ফলের রং:</strong> হালকা সবুজ</li>
  <li><strong>ফলের আকৃতি:</strong> লম্বাটে ও মসৃণ</li>
  <li><strong>ফলের বৈশিষ্ট্য:</strong> কোমল ও তুলনামূলক কম বীজযুক্ত</li>
  <li><strong>চাষের উপযোগিতা:</strong> ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li>
</ul>

<h2>⭐ চাইনিজ হাইব্রিড সবুজ বেগুনের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় সবুজ রং:</strong> হালকা সবুজ ও মসৃণ ফল দেখতে সুন্দর এবং রান্নায় বৈচিত্র্য আনে।</li>
  <li><strong>লম্বাটে ফল:</strong> ফলের লম্বাটে আকৃতি কাটাকাটি ও রান্নার জন্য সুবিধাজনক।</li>
  <li><strong>কোমল শাঁস:</strong> কচি অবস্থায় সংগ্রহ করলে বেগুন সাধারণত কোমল থাকে এবং বিভিন্ন রান্নায় ব্যবহার করা যায়।</li>
  <li><strong>কম বীজযুক্ত ফল:</strong> জাতের বৈশিষ্ট্য অনুযায়ী ফল তুলনামূলক কম বীজযুক্ত হতে পারে।</li>
  <li><strong>দীর্ঘ সময় ফলনের সম্ভাবনা:</strong> সঠিক পরিচর্যা ও অনুকূল পরিবেশে গাছ থেকে একাধিকবার ফল সংগ্রহ করা সম্ভব হতে পারে।</li>
  <li><strong>বিভিন্ন স্থানে চাষ:</strong> জমির পাশাপাশি পর্যাপ্ত আকারের টব বা গ্রো-ব্যাগেও চাষ করা যায়।</li>
</ul>

<h2>🌤️ বেগুন চাষের উপযুক্ত সময়</h2>
<p>বাংলাদেশে আবহাওয়া ও এলাকার মৌসুম অনুযায়ী বেগুন চাষের সময় নির্বাচন করা উচিত। পর্যাপ্ত সূর্যালোক, উষ্ণ আবহাওয়া এবং পানি নিষ্কাশনযোগ্য মাটি গাছের বৃদ্ধির জন্য সহায়ক। অতিরিক্ত বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলুন এবং স্থানীয় আবহাওয়ার সঙ্গে মিলিয়ে বীজ বপনের পরিকল্পনা করুন।</p>

<h2>🪴 মাটি ও বীজতলা প্রস্তুতি</h2>
<p>বেগুন চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি উপযোগী। বীজতলা তৈরির জন্য মাটির সঙ্গে পরিষ্কার কোকোপিট ও পরিপক্ব কম্পোস্ট মিশিয়ে নিতে পারেন। বীজতলা বা সিডলিং ট্রে পরিষ্কার রাখুন, যাতে চারার রোগের ঝুঁকি কমে। জমিতে চাষের আগে মাটি ভালোভাবে ঝুরঝুরে করে প্রয়োজন অনুযায়ী জৈব সার মিশিয়ে নিন।</p>

<h2>🌱 বীজ বপন ও চারা রোপণের পদ্ধতি</h2>
<ol>
  <li>পরিষ্কার বীজতলা, সিডলিং ট্রে বা ছোট পাত্রে ঝুরঝুরে মাটি প্রস্তুত করুন।</li>
  <li>বীজ অল্প গভীরে বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে পানি দিয়ে মাটি আর্দ্র রাখুন, তবে পানি জমতে দেবেন না।</li>
  <li>চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন।</li>
  <li>চারা শক্ত হয়ে কয়েকটি সত্যিকারের পাতা গজালে শিকড়ের ক্ষতি না করে নির্ধারিত জায়গায় রোপণ করুন।</li>
  <li>গাছের স্বাভাবিক বৃদ্ধি ও পরিচর্যার সুবিধার জন্য গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখুন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন প্রায় ৬–৮ ঘণ্টা সরাসরি সূর্যালোক পায় এমন জায়গা নির্বাচন করুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা ও আবহাওয়া অনুযায়ী নিয়মিত পানি দিন। অতিরিক্ত পানি দিয়ে গোড়ায় জলাবদ্ধতা তৈরি করবেন না।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের মধ্যে পর্যাপ্ত জায়গা রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
  <li><strong>টবে চাষ:</strong> পানি নিষ্কাশনের ছিদ্রযুক্ত পর্যাপ্ত বড় টব বা গ্রো-ব্যাগ ব্যবহার করুন।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের পরিচর্যা</h2>
<p>গাছের বৃদ্ধি ও ফল উৎপাদনে সহায়তার জন্য মাটির উর্বরতা অনুযায়ী পরিপক্ব কম্পোস্ট এবং সুষম সার প্রয়োগ করুন। প্রয়োজনের অতিরিক্ত সার ব্যবহার করবেন না। নিয়মিত আগাছা পরিষ্কার করুন, গাছের গোড়ার মাটি আলতোভাবে ঝুরঝুরে রাখুন এবং শুকনো বা রোগাক্রান্ত পাতা সরিয়ে ফেলুন। ফুল ও ফল আসার সময় গাছের পানি ও পুষ্টির চাহিদার দিকে বিশেষ নজর দিন।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>বেগুন গাছের পাতা, কাণ্ড, ফুল ও ফল নিয়মিত পরীক্ষা করুন। পাতায় দাগ, পাতা কুঁকড়ে যাওয়া, কাণ্ডে ক্ষতি বা ফলে ছিদ্র দেখা দিলে দ্রুত ব্যবস্থা নিন। আক্রান্ত অংশ সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। সমস্যা বেশি হলে পোকা বা রোগ সঠিকভাবে শনাক্ত করে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন।</p>

<h2>🍆 বেগুন সংগ্রহ ও রান্নায় ব্যবহার</h2>
<p>ফল জাতের বৈশিষ্ট্য অনুযায়ী উপযুক্ত আকারে পৌঁছালে এবং কোমল থাকা অবস্থায় সংগ্রহ করুন। ধারালো ছুরি দিয়ে ফল কাটার সময় গাছের ডাল ক্ষতিগ্রস্ত করা থেকে বিরত থাকুন। নিয়মিত উপযুক্ত ফল সংগ্রহ করলে গাছের পরিচর্যা সহজ হয়। চাইনিজ হাইব্রিড সবুজ বেগুন ভাজি, ভর্তা, তরকারি এবং অন্যান্য ঘরোয়া রান্নায় ব্যবহার করা যায়। ফলের আকার, স্বাদ ও ফলনের পরিমাণ আবহাওয়া, মাটি এবং পরিচর্যার ওপর নির্ভর করে।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনে চাষ</h2>
<p>বাড়িতে সবুজ বেগুন চাষ করতে চাইলে পর্যাপ্ত মাটির জায়গা, রোদ ও পানি নিষ্কাশনের ব্যবস্থা নিশ্চিত করুন। ছাদ বা বারান্দায় চাষের জন্য পর্যাপ্ত বড় টব বা গ্রো-ব্যাগ ব্যবহার করুন। গাছ বড় হওয়ার সঙ্গে সঙ্গে নিয়মিত পানি দিন, প্রয়োজন অনুযায়ী সার প্রয়োগ করুন এবং গাছের স্বাস্থ্য পর্যবেক্ষণ করুন। এতে ঘরোয়া বাগান থেকে তাজা বেগুন সংগ্রহের সুযোগ তৈরি হতে পারে।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>বাড়ির বাগান কিংবা বাণিজ্যিক চাষে আকর্ষণীয় সবুজ বেগুন উৎপাদনের পরিকল্পনা থাকলে সংগ্রহ করুন <strong>চাইনিজ হাইব্রিড সবুজ বেগুন বীজ</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যার মাধ্যমে সুস্থ গাছ গড়ে তুলুন এবং নিজের বাগানে তাজা বেগুন চাষের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1558', 14, 14, 1, 0, 0, '[]', '2026-09-24T01:42:41.468+00:00', '2026-10-17T05:26:04.797677+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('838fe41d-d986-44d4-888f-efa37a5fa8d6', 'ইস্পাহানি শ্রাবণী হাইব্রিড ডাটা বীজ', 'ispahani-shraboni-hybrid-data-seeds-10-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783469443-rgrxobz.webp', NULL, 30, 0, 18, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"হাইব্রিড\",\"সেরা পণ্য\",\"আগাম চাষ- শীতকাল\",\"প্রধান- শীতকালীন\"]', '১০ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি শ্রাবণী হাইব্রিড ডাটা বীজ | দ্রুত বর্ধনশীল, আঁশবিহীন, নরম ও সুস্বাদু; ৩৫-৪০ দিনে সংগ্রহযোগ্য।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি শ্রাবণী হাইব্রিড ডাটা বীজ</strong> একটি উচ্চ ফলনশীল ও অত্যন্ত দ্রুত বর্ধনশীল হাইব্রিড জাত। গাছের উচ্চতা প্রায় <strong>৩.৫–৪.৫ ফুট</strong> এবং কাণ্ডের রঙ হালকা সবুজ। এর ডাটা আঁশবিহীন, নরম ও সুস্বাদু হওয়ায় রান্নার জন্য উপযোগী। বীজ বপনের মাত্র <strong>৩৫–৪০ দিনের মধ্যে</strong> সংগ্রহের উপযোগী হয়। সঠিক পরিচর্যায় প্রতি একরে <strong>১৫–২০ মেট্রিক টন</strong> পর্যন্ত ফলন পাওয়া যেতে পারে।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> হাইব্রিড, উচ্চ ফলনশীল<br>
<strong>🌿 বৃদ্ধি:</strong> অত্যন্ত দ্রুত বর্ধনশীল<br>
<strong>📏 গাছের উচ্চতা:</strong> ৩.৫–৪.৫ ফুট<br>
<strong>🟢 কাণ্ডের রঙ:</strong> হালকা সবুজ<br>
<strong>🥬 ডাটার বৈশিষ্ট্য:</strong> আঁশবিহীন, নরম ও সুস্বাদু<br>
<strong>⏱️ সংগ্রহ:</strong> বীজ বপনের ৩৫–৪০ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ১৫–২০ মেট্রিক টন</p>', 'VEG-1602', 6, 6, 1, 0, 0, '[]', '2026-09-26T13:16:36.816+00:00', '2026-10-17T05:26:05.346045+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('5c238446-9907-4ff6-9b7d-385b25cfc761', 'অরিজিনাল লাল সালভিয়া (Salvia) ফুলের বীজ', 'original-red-salvia-flower-seeds-mini-pack', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784193326-x6sl4b9.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', '≥৮০% অঙ্কুরোদগম | অরিজিনাল লাল সালভিয়া ফুল, উজ্জ্বল লাল ফুলের জন্য উপযোগী।', '<h3>📝 Product Short Description</h3><p><strong>অরিজিনাল লাল সালভিয়া (Salvia) ফুলের বীজ – মিনি প্যাক</strong> সুন্দর উজ্জ্বল লাল ফুলের গাছ তৈরির জন্য উপযোগী। সালভিয়ার আকর্ষণীয় ফুল বাগান, টব, বারান্দা, ছাদবাগান ও ফুলের বেডকে প্রাণবন্ত করে তুলতে পারে।</p><p>সঠিক পরিচর্যা, পর্যাপ্ত আলো এবং পানি নিষ্কাশনযোগ্য মাটি নিশ্চিত করলে স্বাস্থ্যকর গাছ ও সুন্দর ফুল পাওয়ার জন্য সহায়ক। ফুলের বাগান সাজাতে বা টবে শোভাবর্ধক ফুল হিসেবে চাষ করতে পারেন। 🌺</p><p><strong>নিজের বাগানে লাল সালভিয়া ফুলের সৌন্দর্য আনতে আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>প্যাক:</strong> মিনি প্যাক</li><li>🌺 <strong>ফুলের নাম:</strong> লাল সালভিয়া (Salvia)</li><li>🌱 <strong>বীজ সংখ্যা:</strong> প্যাকেট অনুযায়ী (উচ্চ গুণমানসম্পন্ন)</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>ব্যবহার:</strong> টব, ছাদবাগান, বারান্দা ও ফুলের বাগান</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>লাল সালভিয়া উজ্জ্বল আলো ও উষ্ণ পরিবেশ পছন্দ করে। সাধারণ সালভিয়া জাতগুলো পূর্ণ রোদে এবং আর্দ্র কিন্তু ভালো পানি নিষ্কাশনযুক্ত মাটিতে ভালোভাবে বেড়ে ওঠে।</p><p>বাংলাদেশের আবহাওয়ায় <strong>শীতের শেষভাগ থেকে বসন্ত এবং তুলনামূলক শুষ্ক ও নাতিশীতোষ্ণ সময়</strong> টব বা বাগানে চাষের জন্য সুবিধাজনক।</p><p><strong>🌱 প্রস্তাবিত সময়:</strong></p><ul><li>🍂 <strong>শরৎ/শীত:</strong> অক্টোবর–ফেব্রুয়ারি</li><li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>☀️ অতিরিক্ত তীব্র গরমে দুপুরের প্রচণ্ড রোদ ও পানির ঘাটতি এড়িয়ে চলুন।</li><li>🌧️ বর্ষাকালে চাষ করলে অবশ্যই ভালো drainage নিশ্চিত করুন।</li></ul><p>RHS-এর তথ্য অনুযায়ী Salvia splendens সাধারণত বার্ষিক ফুল হিসেবে চাষ করা হয় এবং গ্রীষ্ম থেকে শরৎ পর্যন্ত ফুল দিতে পারে; বীজ বপনের জন্য ১৫–১৮°C তাপমাত্রার পরিবেশ উল্লেখ করা হয়েছে।</p><h3>🪴 কিভাবে মাটি তৈরি করবেন?</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>লাল সালভিয়ার জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি</strong> ব্যবহার করুন। খুব ভারী ও পানি জমে থাকে এমন মাটি এড়িয়ে চলুন।</p>২️⃣ মাটি ঝুরঝুরে করা<p>বাগানের মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করুন। আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করে মাটি সমান করে নিন।</p>৩️⃣ জৈব সার মেশানো<p>মাটির সঙ্গে ভালোভাবে পচা কম্পোস্ট বা গোবর সার মিশিয়ে দিন। এতে মাটিতে জৈব পদার্থ বাড়ে এবং শিকড় বিস্তারের জন্য ভালো পরিবেশ তৈরি হয়।</p>৪️⃣ পানি নিষ্কাশনের ব্যবস্থা<p>সালভিয়ার জন্য মাটিতে পানি জমে থাকা এড়িয়ে চলা গুরুত্বপূর্ণ। জমি বা বেডে পানি আটকে থাকলে উঁচু বেড তৈরি করুন। টবে অবশ্যই নিচে পর্যাপ্ত drainage hole রাখুন।</p>৫️⃣ বীজতলার মাটির মিশ্রণ<p>বীজ থেকে চারা তৈরির জন্য একটি হালকা মিশ্রণ ব্যবহার করতে পারেন:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>মিশ্রণটি পরিষ্কার, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য রাখুন।</p>৬️⃣ বীজ বপনের সময়<p>সালভিয়ার বীজ ছোট হওয়ায় মাটির উপর হালকাভাবে ছিটিয়ে বপন করে খুব পাতলা মাটি বা উপযুক্ত growing medium দিয়ে ঢেকে দিন। অতিরিক্ত গভীরে বীজ পুঁতে দেবেন না। বীজতলা আর্দ্র রাখুন, তবে পানি জমতে দেবেন না।</p>৭️⃣ আলো ও অবস্থান<p>চারা গজানোর পর ধীরে ধীরে পর্যাপ্ত আলোতে অভ্যস্ত করুন। পরিণত গাছের জন্য <strong>পূর্ণ রোদযুক্ত স্থান</strong> নির্বাচন করা ভালো।</p><h3>💧 পানি ও পরিচর্যা</h3><p>মাটি সামান্য আর্দ্র রাখুন, কিন্তু অতিরিক্ত পানি দেবেন না। শুষ্ক আবহাওয়ায় প্রয়োজন অনুযায়ী পানি দিন। গাছের গোড়ায় পানি জমে থাকলে শিকড়ের ক্ষতির ঝুঁকি বাড়তে পারে।</p><h3>🌺 সুন্দর ফুল পাওয়ার জন্য টিপস</h3><ul><li>পর্যাপ্ত রোদযুক্ত স্থান নির্বাচন করুন।</li><li>পানি জমে থাকে এমন মাটি ব্যবহার করবেন না।</li><li>নিয়মিত আগাছা পরিষ্কার করুন।</li><li>প্রয়োজন অনুযায়ী জৈব সার প্রয়োগ করুন।</li><li>গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন।</li><li>ফুল ফোটার পর শুকিয়ে যাওয়া ফুলের অংশ ছেঁটে দিলে নতুন ফুল আসতে সহায়তা করতে পারে।</li></ul>', 'VEG-1612', 2, 2, 1, 0, 0, '[]', '2026-10-01T10:47:42.166+00:00', '2026-10-17T05:26:34.744511+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fdc4c6f3-6587-41d9-a0e4-5665cb816216', 'ওয়াইল্ড বাগামট (বি বাম) ফুলের বীজ', 'wild-bergamot-bee-balm-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732428531-30o0q6g.webp', NULL, 150, 35, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ১০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মৌমাছি ও প্রজাপতি আকর্ষণকারী দৃষ্টিনন্দন ফুল, বাগানের জন্য আদর্শ।', 'ওয়াইল্ড বাগামট (বি বাম) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অনন্য সৌন্দর্যের সুদৃশ্য ফুল। এই বহুবর্ষজীবী ফুলটি মৌমাছি, প্রজাপতি ও অন্যান্য উপকারী পরাগায়নকারী পোকামাকড়কে আকর্ষণ করে, যা প্রাকৃতিক পরিবেশের ভারসাম্য বজায় রাখতে সহায়ক। টব, ছাদবাগান, ফুলের বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল ফোটে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1511', 2, 2, 1, 0, 0, '[]', '2026-09-24T01:46:43.157+00:00', '2026-10-19T06:06:15.472525+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('3c51103b-b328-4ac7-9f5e-d0779bb860e2', 'চাইনিজ জায়ান্ট ডালিয়া ফুলের বীজ', 'chinese-giant-dahlia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732445996-pqmqls6.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বিশাল আকৃতির দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 চাইনিজ জায়ান্ট ডালিয়া ফুলের বীজ</h3>

<p><strong>চাইনিজ জায়ান্ট ডালিয়া ফুলের বীজ</strong> দিয়ে আপনার বাগানে ফুটিয়ে তুলুন বিশাল আকৃতির, বহুস্তরযুক্ত পাপড়ির মনোমুগ্ধকর ফুল। এই উন্নত জাতের ডালিয়া বড় আকারের ফুল ও আকর্ষণীয় রঙের জন্য বাগান সাজাতে চমৎকার একটি নির্বাচন। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষ করা যায়। সঠিক পরিচর্যা ও অনুকূল পরিবেশে সুস্থ গাছ এবং সুন্দর ফুল পাওয়ার সম্ভাবনা থাকে।</p>

<h3>📋 Product Specifications</h3>

<ul>
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>

<ul>
<li>🌸 বিশাল আকৃতির ফুল উৎপাদনের জন্য উপযোগী</li>
<li>🌺 বহুস্তরযুক্ত পাপড়ির আকর্ষণীয় ফুল</li>
<li>🎨 বাগানে রঙিন ও দৃষ্টিনন্দন পরিবেশ তৈরি করতে সহায়ক</li>
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li>
<li>🏡 ছাদবাগান, বারান্দা ও বাড়ির বাগানের জন্য উপযোগী</li>
<li>🌿 ফুলের বেড, বর্ডার ও খোলা বাগানে লাগানো যায়</li>
</ul>

<h3>📅 বীজ বপনের উপযুক্ত সময়</h3>

<p>বাংলাদেশে ডালিয়া সাধারণত শীতকালীন ফুল হিসেবে ভালো হয়। তাই <strong>শরৎকালে বীজ বপন করে শীতের সময় ফুল পাওয়ার পরিকল্পনা</strong> করা যেতে পারে। স্থানীয় তাপমাত্রা ও আবহাওয়ার সঙ্গে মিলিয়ে বপনের সময় নির্ধারণ করুন।</p>

<h3>🌱 মাটি প্রস্তুতি</h3>

<p>ডালিয়া চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশন সুবিধাযুক্ত মাটি প্রয়োজন। দোআঁশ মাটির সঙ্গে ভালোভাবে পচানো কম্পোস্ট মিশিয়ে উপযুক্ত চাষমাধ্যম তৈরি করা যায়।</p>

<ul>
<li>মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li>
<li>পচা কম্পোস্ট বা জৈব সার মাটির সঙ্গে মিশিয়ে দিন।</li>
<li>পাত্র বা বেডে পানি বের হওয়ার পর্যাপ্ত ব্যবস্থা রাখুন।</li>
<li>পানি জমে থাকে এমন স্থান এড়িয়ে চলুন।</li>
</ul>

<h3>🌿 বীজ বপন ও চারা তৈরি</h3>

<p>বীজ সিড ট্রে, ছোট টব বা নার্সারি বেডে বপন করা যায়। ঝুরঝুরে মাটির উপর বীজ ছড়িয়ে হালকাভাবে মাটি দিয়ে ঢেকে দিন এবং স্প্রে করে পানি দিন। মাটি আর্দ্র রাখুন, তবে অতিরিক্ত ভেজা করবেন না। চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন। চারা শক্তিশালী হলে উপযুক্ত বড় টব বা বাগানের বেডে স্থানান্তর করা যায়।</p>

<h3>🪴 টব ও ছাদবাগানে চাষ</h3>

<p>চাইনিজ জায়ান্ট ডালিয়া বড় টব, গ্রো ব্যাগ বা ছাদবাগানের উপযুক্ত পাত্রে চাষ করা যায়। বড় আকারের ফুলের জন্য গাছের শিকড় ছড়ানোর পর্যাপ্ত জায়গা নিশ্চিত করুন। পাত্রের নিচে ড্রেনেজ ছিদ্র থাকা জরুরি। গাছ বড় হলে প্রয়োজন অনুযায়ী খুঁটি বা সাপোর্ট ব্যবহার করুন, যাতে ভারী ফুলের কারণে গাছ হেলে না পড়ে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>

<p>ডালিয়া ভালোভাবে বেড়ে ওঠা ও ফুল দেওয়ার জন্য পর্যাপ্ত সূর্যালোক পছন্দ করে। প্রতিদিন প্রায় ৬ ঘণ্টা বা তার বেশি রোদ পায় এমন স্থানে রাখার চেষ্টা করুন। মাটির উপরিভাগ শুকাতে শুরু করলে পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন এবং সম্ভব হলে পাতার পরিবর্তে গাছের গোড়ায় পানি দিন।</p>

<h3>🌿 সার ও পরিচর্যা</h3>

<ul>
<li>গাছের বৃদ্ধির পর্যায় অনুযায়ী পরিমিত পচা কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li>
<li>গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</li>
<li>দুর্বল ও শুকনো পাতা প্রয়োজন অনুযায়ী সরিয়ে ফেলুন।</li>
<li>গাছ বড় হলে খুঁটি দিয়ে সাপোর্ট দিন।</li>
<li>পর্যাপ্ত আলো, পানি ও সুষম পুষ্টি নিশ্চিত করুন।</li>
</ul>

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3>

<p>ডালিয়া গাছে এফিড, মাকড় ও ছত্রাকজনিত সমস্যা দেখা দিতে পারে। নিয়মিত পাতা ও কচি ডগা পরীক্ষা করুন। আক্রান্ত অংশ সরিয়ে ফেলুন, গাছের চারপাশ পরিষ্কার রাখুন এবং বাতাস চলাচলের ব্যবস্থা নিশ্চিত করুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত বালাই ব্যবস্থাপনা পণ্য লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h3>🌸 ফুল ফোটা ও পরিচর্যা</h3>

<p>গাছ পরিণত হলে অনুকূল পরিবেশ ও সঠিক পরিচর্যায় ফুল ফুটতে শুরু করে। শুকিয়ে যাওয়া ফুল সরিয়ে দিলে গাছের পরিচ্ছন্নতা বজায় থাকে। বড় ও আকর্ষণীয় ফুল পেতে পর্যাপ্ত আলো, সঠিক পানি ব্যবস্থাপনা এবং গাছের প্রয়োজন অনুযায়ী পুষ্টি নিশ্চিত করুন।</p>

<h3>🏡 কোথায় চাষ করা যায়?</h3>

<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌺 ফুলের বেড ও বর্ডার</li>
<li>🌿 বারান্দা ও শখের বাগান</li>
<li>🌳 খোলা বাগান ও ল্যান্ডস্কেপ</li>
</ul>

<h3>💚 কেন চাইনিজ জায়ান্ট ডালিয়া চাষ করবেন?</h3>

<p>বড় আকৃতির ফুল ও বহুস্তরযুক্ত পাপড়ির সৌন্দর্যে বাগানকে আকর্ষণীয় করে তুলতে <strong>চাইনিজ জায়ান্ট ডালিয়া ফুলের বীজ</strong> একটি চমৎকার পছন্দ। টব থেকে শুরু করে খোলা বাগান—বিভিন্ন জায়গায় চাষ করা যায়। সঠিক পরিচর্যা ও অনুকূল পরিবেশে সুন্দর ফুল পাওয়ার সম্ভাবনা থাকে।</p>

<p><strong>🌸 আজই অর্ডার করুন এবং আপনার বাগান সাজিয়ে তুলুন চাইনিজ জায়ান্ট ডালিয়ার মনোমুগ্ধকর ফুলে!</strong></p>', 'FUL-1505', 11, 11, 1, 0, 0, '[]', '2026-09-24T01:42:32.377+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('559c37cb-53bd-4f16-aa51-392f3edd09cc', 'হাইব্রিড কালো চেরি টমেটো বীজ', 'hybrid-black-cherry-tomato-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949163039-d6mgomo.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783008888261-eurlmkf.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783008889775-9ehv5qb.webp\"]', 120, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ১০০টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, মিষ্টি, রসালো ও গাঢ় বেগুনি-কালো রঙের আকর্ষণীয় চেরি টমেটো উৎপাদন করুন।', 'হাইব্রিড কালো চেরি টমেটো একটি প্রিমিয়াম ও উচ্চ ফলনশীল জাত, যা ছোট আকারের গাঢ় কালো-বেগুনি রঙের চেরি টমেটো উৎপাদন করে। এর ফল মিষ্টি, রসালো এবং অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ। টব, ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি অত্যন্ত উপযোগী। সালাদ, স্ন্যাকস ও তাজা খাওয়ার জন্য এই জাতটি বিশেষভাবে জনপ্রিয়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1552', 2, 2, 1, 0, 0, '[]', '2026-09-24T01:48:33.184+00:00', '2026-10-12T11:25:05.435391+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e37c160c-ab23-483e-a6b4-656dd9253271', 'হাইব্রিড সবুজ টমেটো বীজ', 'hybrid-green-tomato-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784201842-ms94xo2.webp', NULL, 150, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"হাইব্রিড\"]', 'আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড সবুজ টমেটো চাষের জন্য উপযোগী উন্নতমানের বীজ।', '<h3>🌱 Product Short Description</h3><p><strong>হাইব্রিড সবুজ টমেটো বীজ</strong> উন্নতমানের সবুজ টমেটো চাষের জন্য উপযোগী একটি ভালো মানের জাত। সঠিক পরিচর্যা, পর্যাপ্ত আলো-বাতাস ও উপযুক্ত মাটিতে চাষ করলে সুস্থ ও শক্তিশালী গাছ গড়ে উঠতে সহায়ক। বাড়ির বাগান, ছাদবাগান, টব এবং বাণিজ্যিক চাষ—সব ক্ষেত্রেই উপযোগী।</p><h3>📋 পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🍅 <strong>ফসলের ধরন:</strong> হাইব্রিড সবুজ টমেটো</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষ</li></ul><h3>🌤️ কোন কোন মৌশুমে ভালো হয়?</h3><p>বাংলাদেশের আবহাওয়ায় টমেটো সাধারণত <strong>শীতল ও তুলনামূলক শুষ্ক মৌশুমে</strong> ভালো ফলন দেয়।</p><p><strong>🌱 উপযুক্ত সময়:</strong></p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর — বীজতলা/চারা তৈরির জন্য ভালো সময়</li><li>❄️ <strong>শীত:</strong> নভেম্বর–ফেব্রুয়ারি — টমেটো চাষের প্রধান ও উপযোগী মৌশুম</li><li>🌸 <strong>বসন্তের শুরু:</strong> ফেব্রুয়ারি–মার্চ — অনুকূল তাপমাত্রায় চাষ করা যায়</li></ul><p><strong>⚠️ বর্ষাকাল ও অতিরিক্ত গরমে</strong> টমেটো চাষে পানি জমে থাকা, অতিরিক্ত আর্দ্রতা ও তাপমাত্রাজনিত সমস্যা হতে পারে। তাই এ সময়ে উন্নত পানি নিষ্কাশন ব্যবস্থা ও প্রয়োজনীয় সুরক্ষা নিশ্চিত করা গুরুত্বপূর্ণ।</p><h3>🧑‍🌾 টমেটো চাষের জন্য মাটি তৈরির বিস্তারিত নিয়ম</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>টমেটোর জন্য <strong>উর্বর দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি ঝুরঝুরে, জৈব পদার্থসমৃদ্ধ এবং পানি নিষ্কাশনযোগ্য হওয়া ভালো। পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুত<p>জমির মাটি ভালোভাবে <strong>২–৩ বার চাষ ও মই দিয়ে ঝুরঝুরে</strong> করে নিতে হবে। আগাছা, পুরোনো শিকড় ও শক্ত মাটির দলা পরিষ্কার করে মাটির সঙ্গে জৈব সার ভালোভাবে মিশিয়ে দিন।</p>৩️⃣ জৈব সার প্রয়োগ<p>প্রতি শতকে আনুমানিক <strong>৩০–৪০ কেজি পচা গোবর বা ভালো মানের কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দেওয়া যেতে পারে। জৈব সার মাটির গঠন উন্নত করতে এবং গাছের প্রাথমিক বৃদ্ধিতে সহায়তা করে।</p>৪️⃣ বেড তৈরি<p>টমেটো চাষে <strong>উঁচু বেড</strong> তৈরি করা ভালো, বিশেষ করে বর্ষা বা পানি জমার প্রবণতা থাকলে। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং শিকড়ের কাছে জলাবদ্ধতা কমে।</p>৫️⃣ টব বা ছাদবাগানের মাটি<p>টবে চাষের জন্য একটি কার্যকর মিশ্রণ হতে পারে:</p><ul><li>🟤 <strong>৪০% দোআঁশ মাটি</strong></li><li>🌴 <strong>৩০% কোকোপিট</strong></li><li>🌿 <strong>২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</strong></li><li>🪨 <strong>১০% মোটা বালি বা পার্লাইট</strong></li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে করে ব্যবহার করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ হোল</strong> থাকতে হবে।</p>৬️⃣ বীজ থেকে চারা তৈরি<p>বীজতলা বা ট্রেতে ঝুরঝুরে, জীবাণুমুক্ত ও পানি নিষ্কাশনযোগ্য মাধ্যম ব্যবহার করুন। বীজ খুব গভীরে না দিয়ে অল্প মাটি দিয়ে ঢেকে হালকা পানি দিন। মাটি সবসময় আর্দ্র রাখুন, তবে অতিরিক্ত পানি দিয়ে কাদা করবেন না।</p><p>চারা কয়েকটি সুস্থ পাতা ও শক্ত কান্ড তৈরি করলে ধীরে ধীরে মূল জমি বা বড় টবে প্রতিস্থাপন করুন।</p>৭️⃣ পানি ও আলো ব্যবস্থাপনা<p>টমেটো গাছের জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত পানি বা দীর্ঘসময় ভেজা মাটি শিকড়ের জন্য ক্ষতিকর হতে পারে।</p><p>💡 <strong>টিপস:</strong> ভালো ফলনের জন্য পর্যাপ্ত রোদ, সুষম সার প্রয়োগ, আগাছা নিয়ন্ত্রণ, সঠিক দূরত্বে চারা রোপণ এবং প্রয়োজন অনুযায়ী গাছকে খুঁটি দিয়ে সাপোর্ট দেওয়া গুরুত্বপূর্ণ।</p>', 'VEG-1613', 2, 2, 1, 0, 0, '[]', '2026-10-01T11:38:11.07+00:00', '2026-10-12T11:25:22.267452+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ac534fe8-4d9d-42bc-a696-5c904c509886', 'হাইব্রিড বেগুনি লং শিম বীজ (আলাদা ও আকর্ষণীয় জাত)', 'hybrid-purple-long-beans-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949198429-4oagvz6.webp', NULL, 150, 85, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- বর্ষারকাল\"]', 'আনুমানিক ১০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড বেগুনি লং শিম, আকর্ষণীয় রঙ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাইব্রিড বেগুনি লং শিম বীজ আলাদা ও আকর্ষণীয় বেগুনি রঙের লম্বা শিম চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং সুন্দর আকৃতির বেগুনি শিম উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ পরিমাণ: আনুমানিক ১০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1541', 13, 13, 1, 0, 0, '[]', '2026-09-24T01:46:40.333+00:00', '2026-10-19T06:06:15.058397+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fee6ed6d-ddff-4f33-8b5b-a0960f0fb822', 'প্রিমিয়াম বামন সূর্যমুখী ফুলের বীজ', 'premium-dwarf-sunflower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732458222-584ijva.webp', NULL, 150, 110, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, ছোট আকারের দৃষ্টিনন্দন সূর্যমুখী, টব ও ছাদবাগানের জন্য আদর্শ।', 'প্রিমিয়াম বামন সূর্যমুখী ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন ছোট আকারের হলেও উজ্জ্বল হলুদ রঙের মনোমুগ্ধকর সূর্যমুখী ফুল। এই বামন জাতটি টব, বারান্দা, ছাদবাগান এবং ছোট বাগানের জন্য বিশেষভাবে উপযোগী, কারণ এটি কম জায়গায়ও সহজে চাষ করা যায়। গাছ দ্রুত বৃদ্ধি পায় এবং সঠিক পরিচর্যায় প্রতিটি গাছে একাধিক সুন্দর ফুল ফোটে। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং বাগানকে সহজেই উজ্জ্বল ও প্রাণবন্ত করে তোলে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1520', 6, 6, 1, 0, 0, '[]', '2026-09-24T01:42:35.027+00:00', '2026-10-17T05:19:44.714373+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('111985d7-3ef0-458a-b6ec-f0e4086e77c1', 'মেজেন্টা জিনিয়া ফুলের বীজ', 'magenta-zinnia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732456305-ow4xw9e.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- বর্ষাকালীন\",\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মেজেন্টা রঙের বড় দৃষ্টিনন্দন ফুল, টব ও বাগানের জন্য আদর্শ।', 'মেজেন্টা জিনিয়া ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন উজ্জ্বল মেজেন্টা রঙের বড় ও আকর্ষণীয় ফুল। এই প্রিমিয়াম জিনিয়া জাতটি দ্রুত বৃদ্ধি পায়, দীর্ঘসময় ধরে ফুল ফোটায় এবং সঠিক পরিচর্যায় প্রচুর ফুল উৎপাদন করে। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে বর্ণিল সৌন্দর্যে বাগানকে ভরিয়ে তোলে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1531', 14, 14, 1, 0, 0, '[]', '2026-09-24T01:42:36.796+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ca8248c0-21d8-412f-b0a4-01c3378a29cb', 'হাইব্রিড বেগুনি বাঁধাকপি বীজ', 'hybrid-purple-cabbage-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792407030858-twsacn4.webp', NULL, 150, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড বেগুনি বাঁধাকপি, শক্তিশালী গাছ ও আকর্ষণীয় রঙের ভালো ফলনের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3>
<p><strong>হাইব্রিড বেগুনি বাঁধাকপি বীজ</strong> আকর্ষণীয় বেগুনি রঙের বাঁধাকপি চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর, সুগঠিত বাঁধাকপি উৎপাদনে সহায়ক।</p>
<p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। পর্যাপ্ত আলো, উর্বর মাটি ও নিয়মিত পরিচর্যায় স্বাস্থ্যবান গাছ এবং আকর্ষণীয় বেগুনি বাঁধাকপি পেতে সহায়তা করতে পারে। 🥬 <strong>নিজের বাগানে আকর্ষণীয় বেগুনি বাঁধাকপি চাষ করতে আজই হাইব্রিড বেগুনি বাঁধাকপির বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥬 <strong>জাত:</strong> হাইব্রিড বেগুনি বাঁধাকপি</li>
<li>🟣 <strong>রঙ:</strong> আকর্ষণীয় বেগুনি</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🌍 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>বেগুনি বাঁধাকপি একটি <strong>শীতকালীন সবজি</strong> এবং ঠান্ডা ও মৃদু আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে হাইব্রিড বেগুনি বাঁধাকপি চাষের জন্য সাধারণত নিচের সময়গুলো বেশি উপযোগী:</p>
<ul>
<li>🍂 <strong>শরৎ:</strong> সেপ্টেম্বর–অক্টোবর — বীজতলায় বীজ বপন ও চারা তৈরির জন্য উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি — চারা রোপণ ও বাঁধাকপির মাথা গঠনের জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ:</strong> ফেব্রুয়ারি পর্যন্ত অনুকূল আবহাওয়ায় চাষ করা যেতে পারে।</li>
<li>☀️ <strong>অতিরিক্ত গরম:</strong> বেশি তাপমাত্রায় বাঁধাকপির মাথা শক্ত ও সুগঠিত হতে সমস্যা হতে পারে, তাই অতিরিক্ত গরম মৌসুম এড়িয়ে চলা ভালো।</li>
</ul>

<h3>🪴 বেগুনি বাঁধাকপির জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
বেগুনি বাঁধাকপির জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকা প্রয়োজন। দীর্ঘসময় পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p>

<p><strong>২. জমি পরিষ্কার ও মাটি ঝুরঝুরে করুন</strong><br>
প্রথমে জমি থেকে আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করুন। এরপর কোদাল বা চাষের মাধ্যমে মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির গঠন ও উর্বরতা উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br>
বাঁধাকপির শিকড় জলাবদ্ধতা সহ্য করতে পারে না। তাই পানি জমার প্রবণতা থাকলে <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন, যাতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p>

<p><strong>৫. বীজতলার মাটি প্রস্তুত করুন</strong><br>
চারা তৈরির জন্য পরিষ্কার, ঝুরঝুরে ও আগাছামুক্ত মাটি ব্যবহার করুন। মাটির সঙ্গে ভালোভাবে পচা কম্পোস্ট মিশিয়ে বীজতলা তৈরি করুন। বীজ অল্প গভীরে বপন করুন এবং অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন।</p>

<p><strong>৬. চারা রোপণের আগে জমি প্রস্তুত করুন</strong><br>
চারা রোপণের আগে জমির বেডের মাটি আবার হালকা করে ঝুরঝুরে করে নিন। প্রয়োজনীয় জৈব সার মাটির সঙ্গে ভালোভাবে মিশিয়ে তারপর স্বাস্থ্যবান চারা রোপণ করুন।</p>

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3>
<p>বেগুনি বাঁধাকপি টব বা বড় পাত্রেও চাষ করা যায়। মাটি তৈরির জন্য নিচের অনুপাত ব্যবহার করতে পারেন:</p>
<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>বীজতলায় বীজ সমানভাবে ছড়িয়ে দিয়ে অল্প পরিমাণ মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না। অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন এবং পানি দেওয়ার সময় <strong>স্প্রে করে পানি দেওয়া</strong> ভালো।</p>

<p>চারা পর্যাপ্ত শক্ত ও স্বাস্থ্যবান হলে মূল জমি বা বড় টবে রোপণ করুন। চারা রোপণের সময় গাছের মধ্যে পর্যাপ্ত জায়গা রাখুন, যাতে পাতাগুলো ভালোভাবে ছড়াতে পারে এবং বাঁধাকপির মাথা সুগঠিত হওয়ার জন্য প্রয়োজনীয় জায়গা পায়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌱 গাছের গোড়ার মাটি মাঝে মাঝে হালকা করে আলগা করলে শিকড়ে বাতাস চলাচলে সহায়তা করতে পারে।</li>
<li>🌿 গাছের চারপাশের আগাছা নিয়মিত পরিষ্কার রাখুন।</li>
</ul>

<p>💡 <strong>বিশেষ টিপস:</strong> বেগুনি বাঁধাকপির সুন্দর ও সুগঠিত মাথা পেতে ঠান্ডা আবহাওয়া, পর্যাপ্ত সূর্যালোক, উর্বর মাটি এবং সঠিক পানি ব্যবস্থাপনা গুরুত্বপূর্ণ। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা পাত্র</li>
<li>🌱 সবজি বাগান</li>
<li>🚜 বাণিজ্যিক জমি</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ির বাগান, ছাদবাগান বা বাণিজ্যিক জমিতে আকর্ষণীয় বেগুনি রঙের বাঁধাকপি চাষ করতে আজই হাইব্রিড বেগুনি বাঁধাকপির বীজ অর্ডার করুন!</strong></p>', 'VEG-1527', 22, 22, 1, 0, 0, '[]', '2026-09-24T01:46:39.489+00:00', '2026-10-19T10:50:39.437632+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('200cf717-8db0-4e6c-a501-2ffac7b514c6', 'হাইব্রিড ইনকা হলুদ গাঁদা ফুলের বীজ', 'hybrid-inca-yellow-marigold-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732440130-r09co4w.webp', NULL, 120, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল হলুদ বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3>
<p><strong>হাইব্রিড ইনকা হলুদ গাঁদা ফুলের বীজ</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন বড় আকৃতির উজ্জ্বল হলুদ ফুলে। ইনকা হাইব্রিড জাতের গাঁদা ফুল ঘন পাপড়ি, সমান আকৃতির বড় ফুল এবং দীর্ঘস্থায়ী সৌন্দর্যের জন্য আকর্ষণীয়।</p>
<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য উপযোগী। উচ্চমানের বীজ ও সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ এবং দীর্ঘসময় ধরে আকর্ষণীয় ফুল পেতে সহায়ক। 🌼 <strong>আপনার বাগানকে উজ্জ্বল হলুদ ফুলে সাজাতে আজই ইনকা হলুদ গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌼 <strong>জাত:</strong> হাইব্রিড ইনকা হলুদ গাঁদা</li>
<li>💛 <strong>ফুলের রঙ:</strong> উজ্জ্বল হলুদ</li>
<li>🌸 <strong>ফুলের বৈশিষ্ট্য:</strong> বড় আকৃতি ও ঘন পাপড়িযুক্ত</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>গাঁদা ফুল তুলনামূলকভাবে <strong>মৃদু ও শীতল আবহাওয়ায়</strong> ভালো বৃদ্ধি পায় এবং সুন্দর ফুল দেয়। বাংলাদেশে হাইব্রিড ইনকা হলুদ গাঁদা চাষের জন্য নিচের সময়গুলো বেশি উপযোগী:</p>
<ul>
<li>🍂 <strong>হেমন্ত:</strong> অক্টোবর–নভেম্বর — বীজ বপন ও চারা তৈরির জন্য উপযোগী সময়।</li>
<li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি — গাছের বৃদ্ধি ও ফুল উৎপাদনের জন্য সবচেয়ে ভালো সময়।</li>
<li>🌸 <strong>শীতের শেষ ও বসন্তের শুরু:</strong> ফেব্রুয়ারি–মার্চ পর্যন্ত অনুকূল পরিবেশে ফুল পাওয়া যেতে পারে।</li>
<li>🌧️ <strong>বর্ষাকাল:</strong> অতিরিক্ত বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলা উচিত। তবে উঁচু বেড ও ভালো ড্রেনেজ থাকলে চাষ করা সম্ভব।</li>
</ul>

<h3>🪴 ইনকা হলুদ গাঁদা ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
গাঁদা ফুলের জন্য হালকা, ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। অতিরিক্ত পানি ধরে রাখে এমন ভারী কাদামাটি ব্যবহার না করাই ভালো।</p>

<p><strong>২. খোলা জমির মাটি প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা, পুরোনো শিকড় ও অন্যান্য আবর্জনা পরিষ্কার করুন। এরপর কোদাল বা চাষের মাধ্যমে মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p>

<p><strong>৩. জৈব সার মেশান</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৩০–৪০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির উর্বরতা ও গঠন উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. ভারী মাটি হালকা করুন</strong><br>
মাটি বেশি এঁটেল হলে পচা জৈব সার এবং প্রয়োজনমতো <strong>মোটা বালি</strong> মিশিয়ে মাটিকে ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য করে তুলুন।</p>

<p><strong>৫. উঁচু বেড তৈরি করুন</strong><br>
যেসব স্থানে পানি জমার সম্ভাবনা রয়েছে সেখানে প্রায় <strong>৬–৮ ইঞ্চি উঁচু বেড</strong> তৈরি করা ভালো। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং গাছের শিকড় সুস্থ রাখতে সহায়তা করে।</p>

<p><strong>৬. টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</strong><br>
টব বা পাত্রে হাইব্রিড ইনকা হলুদ গাঁদা চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p>
<ul>
<li>🟤 ৪০% ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 ৩০% কোকোপিট</li>
<li>🍂 ২০% ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। টবের নিচে অবশ্যই পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন, যাতে অতিরিক্ত পানি জমে না থাকে।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>বীজতলায় প্রস্তুত মাটির উপর বীজ সমানভাবে ছড়িয়ে দিয়ে অল্প পরিমাণ মাটি বা কোকোপিট দিয়ে হালকা ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না। অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন এবং পানি দেওয়ার সময় <strong>স্প্রে করে পানি দেওয়া</strong> ভালো।</p>

<p>চারা পর্যাপ্ত শক্ত ও স্বাস্থ্যবান হলে মূল টব, বেড বা জমিতে রোপণ করুন। চারা রোপণের সময় গাছের চারপাশে পর্যাপ্ত জায়গা রাখলে গাছের বৃদ্ধি ও ফুলের আকৃতি ভালোভাবে বিকশিত হতে সহায়তা করবে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন প্রায় <strong>৫–৬ ঘণ্টা বা তার বেশি সরাসরি সূর্যালোক</strong> পাওয়া যায় এমন স্থানে রাখুন।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে মাটি সবসময় ভেজা বা জলাবদ্ধ রাখবেন না।</li>
<li>🌱 গাছের গোড়ার মাটি মাঝে মাঝে হালকা করে আলগা করলে শিকড়ে বাতাস চলাচলে সহায়তা করতে পারে।</li>
<li>🌼 শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে নতুন ফুল আসতে সহায়তা করতে পারে।</li>
</ul>

<p>💡 <strong>বিশেষ টিপস:</strong> ইনকা গাঁদার সুন্দর ও বড় ফুল পেতে পর্যাপ্ত সূর্যালোক, ঝুরঝুরে উর্বর মাটি এবং সঠিক পানি ব্যবস্থাপনা গুরুত্বপূর্ণ। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p>

<h3>🌼 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🪴 টব ও পাত্র</li>
<li>🏠 বারান্দা</li>
<li>🌿 ছাদবাগান</li>
<li>🌸 ফুলের বেড</li>
<li>🌱 বর্ডার</li>
<li>🏡 খোলা বাগান</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ি, বারান্দা বা ছাদবাগানে বড় আকৃতির উজ্জ্বল হলুদ ফুলের সৌন্দর্য আনতে আজই হাইব্রিড ইনকা হলুদ গাঁদা ফুলের বীজ অর্ডার করুন!</strong></p>', 'FUL-1539', 9, 9, 1, 0, 0, '[]', '2026-09-24T01:42:38.107+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('60290800-3e95-435d-ada5-522de55e3f73', 'মিক্স কালার জিনিয়া ফুলের বীজ (ইমপোর্টেড হাইব্রিড)', 'imported-hybrid-mixed-color-zinnia-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732432622-vh21dcd.webp', NULL, 160, 120, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ দানা (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল মিশ্র রঙের বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 Product Short Description</h3>
<p><strong>মিক্স কালার জিনিয়া ফুলের বীজ (ইমপোর্টেড হাইব্রিড)</strong> দিয়ে আপনার বাগান সাজিয়ে তুলুন লাল, হলুদ, গোলাপি, কমলা, সাদা ও বেগুনি রঙের দৃষ্টিনন্দন ফুলে। ইমপোর্টেড হাইব্রিড জাত হওয়ায় সঠিক পরিচর্যা ও অনুকূল পরিবেশে দ্রুত বৃদ্ধি, স্বাস্থ্যবান গাছ এবং প্রচুর ফুল উৎপাদনে সহায়ক।</p>

<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। একই প্যাকেটে বিভিন্ন রঙের ফুল পাওয়ার কারণে বাগানে বৈচিত্র্য ও আকর্ষণীয় সৌন্দর্য তৈরি করতে এটি বিশেষভাবে উপযোগী। 🌸</p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০ দানা (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌸 <strong>ফুলের নাম:</strong> জিনিয়া (Zinnia)</li>
<li>🌈 <strong>রঙ:</strong> মিক্স কালার — লাল, হলুদ, গোলাপি, কমলা, সাদা ও বেগুনি</li>
<li>🌱 <strong>জাত:</strong> ইমপোর্টেড হাইব্রিড</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>জিনিয়া উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়া পছন্দ করে। বাংলাদেশের আবহাওয়ায় পর্যাপ্ত আলো ও সঠিক পানি নিষ্কাশনের ব্যবস্থা থাকলে বিভিন্ন সময়ে চাষ করা যায়। তবে অতিরিক্ত বৃষ্টিপাত ও দীর্ঘসময় জলাবদ্ধতা এড়িয়ে চলা প্রয়োজন।</p>

<ul>
<li>🌸 <strong>শীতকাল:</strong> অক্টোবর–ফেব্রুয়ারি — ফুল চাষের জন্য অন্যতম উপযোগী সময়।</li>
<li>🌱 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পেতে পারে।</li>
<li>☀️ <strong>গ্রীষ্মের শুরু:</strong> পর্যাপ্ত রোদ ও ভালো ড্রেনেজ থাকলে চাষ করা যায়।</li>
</ul>

<h3>🪴 জিনিয়া ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
জিনিয়া চাষের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। এমন মাটি নির্বাচন করুন যেখানে পানি জমে থাকে না এবং শিকড় সহজে ছড়াতে পারে।</p>

<p><strong>২. জমি বা বেড প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা, শুকনো শিকড় ও অন্যান্য আবর্জনা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে বা চাষ দিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে মাটি সমান করে দিন।</p>

<p><strong>৩. জৈব সার ব্যবহার করুন</strong><br>
মাটির উর্বরতা বাড়াতে ভালোভাবে পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। জৈব সার ব্যবহারে মাটির গঠন উন্নত হয় এবং গাছের শিকড়ের বৃদ্ধিতে সহায়তা করে। কাঁচা গোবর ব্যবহার না করাই ভালো।</p>

<p><strong>৪. পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br>
জিনিয়া গাছের গোড়ায় দীর্ঘসময় পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে। তাই জমিতে প্রয়োজন অনুযায়ী <strong>উঁচু বেড ও ড্রেনেজ নালা</strong> তৈরি করুন। টবে চাষ করলে নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন।</p>

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3>
<p>টব, বারান্দা বা ছাদবাগানে জিনিয়া চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p>

<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন। মাটি যেন অতিরিক্ত শক্ত বা কাদামাটির মতো না হয় এবং অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে তা নিশ্চিত করুন।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>জিনিয়ার বীজ সাধারণত সরাসরি মাটিতে বা বীজতলায় বপন করা যায়। মাটি ঝুরঝুরে করে বীজ ছড়িয়ে দিয়ে তার ওপর খুব পাতলা করে মাটি বা কোকোপিট দিয়ে ঢেকে দিন। বীজ খুব গভীরে পুঁতে দেবেন না।</p>

<p>বীজ বপনের পর হালকা স্প্রে করে পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা কিছুটা শক্ত ও স্বাস্থ্যবান হলে প্রয়োজন অনুযায়ী বড় টব বা মূল বেডে রোপণ করুন।</p>

<p>চারা রোপণের সময় গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখলে বাতাস চলাচল ভালো হয় এবং গাছের শাখা-প্রশাখা ছড়িয়ে সুন্দর আকৃতির গাছ তৈরি হতে সহায়তা করে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন <strong>৫–৬ ঘণ্টা বা তার বেশি সরাসরি সূর্যালোক</strong> পেলে জিনিয়া ভালোভাবে বেড়ে উঠতে পারে।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে টব বা জমিতে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌿 গাছের গোড়ার আশপাশের আগাছা নিয়মিত পরিষ্কার রাখুন।</li>
<li>✂️ শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে নতুন ফুল আসতে উৎসাহিত হতে পারে।</li>
</ul>

<h3>🌸 বেশি ফুল পাওয়ার জন্য পরিচর্যার টিপস</h3>
<ul>
<li>🌞 পর্যাপ্ত সূর্যালোক নিশ্চিত করুন।</li>
<li>🌱 মাটি সবসময় ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য রাখুন।</li>
<li>🍂 নিয়মিত পরিমাণমতো জৈব সার বা কম্পোস্ট ব্যবহার করুন।</li>
<li>✂️ শুকনো ও মরা ফুল নিয়মিত অপসারণ করুন।</li>
<li>🐛 পাতায় বা কুঁড়িতে পোকামাকড়ের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li>
<li>💨 অতিরিক্ত ঘন করে গাছ লাগানো এড়িয়ে চলুন, যাতে বাতাস চলাচল ভালো থাকে।</li>
</ul>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 টব ও বড় পাত্র</li>
<li>🏠 বারান্দা</li>
<li>🌸 ফুলের বেড</li>
<li>🌱 খোলা বাগান</li>
</ul>

<h3>🎨 মিক্স কালার জিনিয়ার বিশেষ আকর্ষণ</h3>
<p>একটি প্যাকেটে বিভিন্ন রঙের জিনিয়া ফুল পাওয়ার সম্ভাবনা থাকায় বাগানে সহজেই <strong>রঙিন ও বৈচিত্র্যময় ফুলের সমাহার</strong> তৈরি করা যায়। লাল, হলুদ, গোলাপি, কমলা, সাদা ও বেগুনি রঙের ফুল একসঙ্গে ফুটলে টব, বারান্দা, ছাদবাগান বা ফুলের বেড আরও আকর্ষণীয় হয়ে উঠতে পারে।</p>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>আপনার বাড়ি, বারান্দা বা ছাদবাগানকে রঙিন ফুলে সাজাতে আজই মিক্স কালার জিনিয়া ফুলের বীজ (ইমপোর্টেড হাইব্রিড) অর্ডার করুন। 🌸🌈</strong></p>', 'FUL-1528', 21, 21, 1, 0, 0, '[]', '2026-09-24T01:42:36.329+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('099b8c06-d1f0-4fa3-97e3-8f9d0f43e7ce', 'হাইব্রিড লম্বা সাদা বেগুন বীজ', 'hybrid-long-white-eggplant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949177831-i3300rz.webp', NULL, 170, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[]', 'আনুমানিক ৩০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড লম্বা সাদা বেগুন, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাইব্রিড লম্বা সাদা বেগুন বীজ আকর্ষণীয় সাদা রঙের লম্বা বেগুন চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর আকৃতির লম্বা সাদা বেগুন উৎপাদনে সহায়ক। ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৩০০ টি বীজ / ২ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1568', 15, 15, 1, 0, 0, '[]', '2026-09-24T01:42:50.736+00:00', '2026-10-15T07:34:04.141989+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('7821a8d5-bc46-43e0-a252-71672d8fc906', 'টেডি বিয়ার সূর্যমুখী ফুলের বীজ', 'teddy-bear-sunflower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732449288-oey3ry5.webp', NULL, 130, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, টেডি বিয়ারের মতো ঘন হলুদ ফুল, টব ও বাগানের জন্য আদর্শ।', '<h3>🌻 টেডি বিয়ার সূর্যমুখী ফুলের বীজ (Teddy Bear Sunflower Seeds)</h3>
<p><strong>টেডি বিয়ার সূর্যমুখী ফুলের বীজ</strong> দিয়ে আপনার বাগানে ফুটিয়ে তুলুন নরম, ঘন ও স্তরযুক্ত পাপড়ির মনোমুগ্ধকর সূর্যমুখী ফুল। প্রচলিত সূর্যমুখীর তুলনায় এই বিশেষ জাতের ডাবল পাপড়ি ফুলকে দেয় তুলতুলে টেডি বিয়ারের মতো আকৃতি, যা বাগানের সৌন্দর্য বাড়িয়ে তোলে। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার ও খোলা বাগানে উপযুক্ত পরিবেশে এই ফুল চাষ করা যায়। পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও নিয়মিত পরিচর্যায় সুস্থ গাছ এবং আকর্ষণীয় ফুল পেতে পারেন।</p>

<h3>📦 Product Specifications</h3>
<ul>
<li><strong>পণ্যের নাম:</strong> টেডি বিয়ার সূর্যমুখী ফুলের বীজ</li>
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>ফুলের ধরন:</strong> ডাবল পাপড়িযুক্ত, ঘন ও তুলতুলে</li>
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>চাষের স্থান:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগান</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>
<ul>
<li>🌻 টেডি বিয়ারের মতো ঘন ও স্তরযুক্ত পাপড়ি</li>
<li>🌼 সাধারণ সূর্যমুখীর তুলনায় আলাদা ও আকর্ষণীয় ফুলের গঠন</li>
<li>☀️ পর্যাপ্ত সূর্যালোকে ভালোভাবে বেড়ে ওঠার উপযোগী</li>
<li>🪴 টব, গ্রো ব্যাগ ও ছাদবাগানে চাষ করা যায়</li>
<li>🏡 বাড়ির আঙিনা, ফুলের বেড ও বাগানের বর্ডার সাজাতে উপযোগী</li>
<li>💐 শোভাময় ফুলের বাগানে বৈচিত্র্য যোগ করে</li>
</ul>

<h3>📅 টেডি বিয়ার সূর্যমুখী চাষের উপযুক্ত সময়</h3>
<p>সূর্যমুখী ফুল সাধারণত উষ্ণ আবহাওয়া ও পর্যাপ্ত সূর্যালোক পছন্দ করে। বাংলাদেশের আবহাওয়ায় <strong>শীতের শেষ ভাগ থেকে বসন্তের শুরুতে</strong> উপযুক্ত পরিবেশে চাষ করা যায়। অনেক এলাকায় শীতকালেও চাষের সুযোগ থাকে, তবে অতিরিক্ত ঠান্ডা, ভারী বৃষ্টি ও জলাবদ্ধতা এড়িয়ে চলা ভালো। বীজ বপনের সময় স্থানীয় আবহাওয়া ও তাপমাত্রা বিবেচনা করুন।</p>

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>
<p>টেডি বিয়ার সূর্যমুখীর জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি উপযোগী। ভালো মাটি শিকড়ের বৃদ্ধি এবং গাছের স্বাভাবিক বিকাশে সহায়তা করে।</p>
<ul>
<li>মাটি ভালোভাবে কুপিয়ে বা ঝুরঝুরে করে নিন।</li>
<li>আগাছা, পাথর ও শক্ত মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li>মাটির সঙ্গে ভালোভাবে পচানো গোবর বা কম্পোস্ট মিশিয়ে নিন।</li>
<li>পানি জমার আশঙ্কা থাকলে উঁচু বেড তৈরি করুন।</li>
<li>টবে চাষের জন্য নিচে পর্যাপ্ত ড্রেনেজ ছিদ্রযুক্ত পাত্র ব্যবহার করুন।</li>
</ul>
<p><strong>সহজ মাটির মিশ্রণ:</strong> ৫০% দোআঁশ মাটি, ৩০% পচা কম্পোস্ট এবং ২০% কোকোপিট বা মোটা বালু মিশিয়ে টবের জন্য হালকা ও সুনিষ্কাশিত মাটি তৈরি করতে পারেন।</p>

<h3>🌿 বীজ বপনের সঠিক পদ্ধতি</h3>
<p>সূর্যমুখীর বীজ সরাসরি টব বা নির্ধারিত বাগানের স্থানে বপন করা যায়। সূর্যমুখীর শিকড় তুলনামূলক সংবেদনশীল হতে পারে, তাই সরাসরি মূল পাত্রে বপন করলে চারা স্থানান্তরের প্রয়োজন কমে।</p>
<ul>
<li>প্রথমে মাটি ঝুরঝুরে করে হালকা আর্দ্র করে নিন।</li>
<li>প্রতি স্থানে এক বা দুটি বীজ প্রায় ২–৩ সেন্টিমিটার গভীরে বপন করুন।</li>
<li>বীজের উপর আলতো করে মাটি চাপা দিন।</li>
<li>স্প্রে বা হালকা সেচের মাধ্যমে পানি দিন।</li>
<li>চারা গজানোর পর একাধিক চারা থাকলে সবচেয়ে সবলটি রেখে অন্যটি সাবধানে সরিয়ে দিন।</li>
<li>গাছের সম্ভাব্য আকার অনুযায়ী পর্যাপ্ত দূরত্ব রাখুন।</li>
</ul>

<h3>🪴 টব ও ছাদবাগানে চাষ</h3>
<p>টেডি বিয়ার সূর্যমুখী টব ও ছাদবাগানে চাষের জন্য আকর্ষণীয় একটি শোভাময় ফুল। গাছের শিকড় ও বৃদ্ধির উপযোগী গভীর এবং স্থিতিশীল টব বা গ্রো ব্যাগ বেছে নিন। টবের আকার গাছের প্রকৃত বৃদ্ধির ধরন অনুযায়ী নির্বাচন করা ভালো।</p>
<p>টবটি এমন স্থানে রাখুন, যেখানে প্রতিদিন পর্যাপ্ত সরাসরি রোদ পাওয়া যায়। ছাদে বাতাস বেশি থাকলে টবটি স্থিতিশীল রাখুন এবং প্রয়োজন অনুযায়ী গাছকে সাপোর্ট দিন।</p>

<h3>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<p>সূর্যমুখীর সুস্থ বৃদ্ধি ও ফুল ফোটার জন্য পর্যাপ্ত রোদ প্রয়োজন। প্রতিদিন প্রায় ৬–৮ ঘণ্টা সরাসরি সূর্যালোক পায় এমন স্থান বেছে নিন। মাটির উপরিভাগ শুকাতে শুরু করলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত পানি দিয়ে মাটি জলাবদ্ধ করবেন না, কারণ এতে শিকড় পচে যাওয়ার ঝুঁকি বাড়তে পারে।</p>

<h3>💧 সার ও নিয়মিত পরিচর্যা</h3>
<ul>
<li>মাটি প্রস্তুতের সময় পরিমিত পরিমাণে পচা কম্পোস্ট বা জৈব সার মিশিয়ে নিন।</li>
<li>গাছের বৃদ্ধি অনুযায়ী প্রয়োজন হলে সুষম সার ব্যবহার করুন।</li>
<li>গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার করুন।</li>
<li>মাটির আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত সেচ এড়িয়ে চলুন।</li>
<li>গাছ লম্বা হলে বা বাতাসে হেলে পড়ার আশঙ্কা থাকলে খুঁটি দিয়ে সাপোর্ট দিন।</li>
<li>শুকনো ও ক্ষতিগ্রস্ত পাতা সরিয়ে গাছ পরিচ্ছন্ন রাখুন।</li>
</ul>

<h3>🐛 রোগ ও পোকামাকড় ব্যবস্থাপনা</h3>
<p>গাছের পাতা, কাণ্ড ও ফুল নিয়মিত পর্যবেক্ষণ করুন। পোকামাকড়ের আক্রমণ, পাতায় দাগ বা পচনের লক্ষণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন। গাছের চারপাশ পরিষ্কার রাখুন, পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা করুন এবং গোড়ায় পানি জমতে দেবেন না। প্রয়োজন হলে সমস্যা শনাক্ত করে স্থানীয়ভাবে অনুমোদিত বালাইনাশক পণ্যের লেবেল নির্দেশনা অনুসরণ করুন।</p>

<h3>🌻 ফুল ফোটা ও সংগ্রহ</h3>
<p>উপযুক্ত আবহাওয়া, পর্যাপ্ত সূর্যালোক, সঠিক মাটি ও নিয়মিত পরিচর্যায় টেডি বিয়ার সূর্যমুখী ফুল ফোটে। বীজ বপন থেকে ফুল ফোটার সময় জাত, তাপমাত্রা ও পরিচর্যার ওপর নির্ভর করে পরিবর্তিত হতে পারে। ফুলের সৌন্দর্য উপভোগ করতে গাছকে পর্যাপ্ত জায়গা ও আলো দিন। কাটা ফুল হিসেবে ব্যবহার করতে চাইলে ফুলের ডাঁটা পরিষ্কারভাবে কেটে নিতে পারেন।</p>

<h3>🏡 কোথায় টেডি বিয়ার সূর্যমুখী চাষ করা যায়?</h3>
<ul>
<li>🏠 বাড়ির আঙিনা ও সামনের বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🌿 বারান্দা ও টব</li>
<li>🪴 গ্রো ব্যাগ ও বড় পাত্র</li>
<li>🌸 ফুলের বেড ও বাগানের বর্ডার</li>
<li>💐 শোভাময় ও শখের ফুলের বাগান</li>
</ul>

<h3>💛 কেন টেডি বিয়ার সূর্যমুখী ফুলের বীজ চাষ করবেন?</h3>
<p>আপনার বাগানে ব্যতিক্রমধর্মী ও তুলতুলে পাপড়ির ফুল ফুটাতে <strong>টেডি বিয়ার সূর্যমুখী ফুলের বীজ</strong> একটি আকর্ষণীয় নির্বাচন। এর বিশেষ ফুলের গঠন টব, ছাদবাগান ও ফুলের বেডে নতুন সৌন্দর্য যোগ করে। উপযুক্ত মৌসুম, পর্যাপ্ত রোদ, সুনিষ্কাশিত মাটি ও নিয়মিত পরিচর্যার মাধ্যমে নিজের বাগানে উপভোগ করুন মনোমুগ্ধকর সূর্যমুখী ফুল।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং আপনার বাগান সাজিয়ে তুলুন টেডি বিয়ার সূর্যমুখীর অনন্য সৌন্দর্যে!</strong></p>', 'FUL-1512', 5, 5, 1, 0, 0, '[]', '2026-09-24T01:42:33.716+00:00', '2026-10-19T08:00:15.091827+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('73ce2d04-8d63-40c1-b9d2-131daccfdd7d', 'চীনা হাইব্রিড লম্বা কাঁচা মরিচ বীজ - হ্যংজিও ১', 'chinese-hybrid-long-green-chili-hangjiao-1-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364647738-j6ntcku.webp', NULL, 120, 65, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"পরীক্ষিত\",\"সেরা পণ্য\"]', 'আনুমানিক ২০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লম্বা, মাংসল ও সুস্বাদু সবুজ মরিচ উৎপাদন করে।', '```html
<h2>চীনা হাইব্রিড লম্বা কাঁচা মরিচ বীজ – হ্যংজিও ১</h2>

<p><strong>চীনা হাইব্রিড লম্বা কাঁচা মরিচ বীজ – হ্যংজিও ১</strong> একটি উন্নতমানের হাইব্রিড মরিচের জাত, যা লম্বা, সবুজ ও আকর্ষণীয় কাঁচা মরিচ চাষের জন্য উপযোগী। অনুকূল পরিবেশ ও সঠিক পরিচর্যায় গাছে প্রচুর মরিচ ধরতে পারে। বাজারজাতকরণের পাশাপাশি বাড়ির আঙিনা, ছাদবাগান ও সবজি বাগানে চাষের জন্যও এটি একটি ভালো পছন্দ। নিজের বাগানে টাটকা কাঁচা মরিচ উৎপাদন করতে চাইলে এই বীজ বেছে নিতে পারেন।

<h2>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h2>

<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌶️ <strong>মরিচের ধরন:</strong> লম্বা, সবুজ কাঁচা মরিচ</li>
  <li>🌿 <strong>জাতের ধরন:</strong> হাইব্রিড</li>
  <li>🏡 <strong>চাষের উপযোগিতা:</strong> বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষ</li>
</ul>

<h2>চীনা হাইব্রিড লম্বা কাঁচা মরিচের বিশেষ বৈশিষ্ট্য</h2>

<ul>
  <li><strong>লম্বা ও আকর্ষণীয় মরিচ:</strong> গাছে লম্বা, সবুজ ও দেখতে সুন্দর মরিচ ধরার উপযোগী।</li>
  <li><strong>ফলন সম্ভাবনা:</strong> উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় ভালো ফলন পেতে সহায়ক।</li>
  <li><strong>শক্তিশালী গাছের বৃদ্ধি:</strong> সঠিক মাটি, পানি ও পুষ্টি ব্যবস্থাপনায় গাছের সুস্থ বৃদ্ধি বজায় রাখা যায়।</li>
  <li><strong>গৃহস্থালি চাষে উপযোগী:</strong> পরিবারের দৈনন্দিন রান্নার জন্য টাটকা কাঁচা মরিচ উৎপাদন করা যায়।</li>
  <li><strong>বাজারজাতকরণের উপযোগিতা:</strong> আকর্ষণীয় মরিচ উৎপাদনের মাধ্যমে বাণিজ্যিক চাষেও ব্যবহার করা যেতে পারে।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>

<p>বাংলাদেশের আবহাওয়ায় উপযুক্ত তাপমাত্রা ও স্থানীয় মৌসুম বিবেচনা করে মরিচের বীজ বপন করা ভালো। অতিরিক্ত ঠান্ডা, জলাবদ্ধতা ও প্রচণ্ড গরমের চাপ এড়িয়ে বীজ বপন করুন। আপনার এলাকার আবহাওয়া ও চাষের পরিবেশ অনুযায়ী সময় নির্বাচন করলে ভালো ফল পাওয়ার সম্ভাবনা বাড়ে।</p>

<h2>মাটি ও জমি প্রস্তুত</h2>

<p>মরিচ চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনের সুবিধাযুক্ত দোআঁশ মাটি উপযোগী। জমি বা টবের মাটি ভালোভাবে ঝুরঝুরে করে পচা জৈব সার মিশিয়ে নিন। মাটিতে যেন পানি জমে না থাকে, সেদিকে বিশেষ খেয়াল রাখুন।</p>

<h2>বীজ বপনের নিয়ম</h2>

<ol>
  <li>প্রথমে ঝুরঝুরে ও আর্দ্র বীজতলা বা ছোট পাত্র প্রস্তুত করুন।</li>
  <li>বীজ অল্প গভীরে বপন করে ওপর থেকে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>মাটি হালকা আর্দ্র রাখুন, তবে অতিরিক্ত পানি দেবেন না।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করে শক্ত হলে সাবধানে মূল জমি বা বড় টবে স্থানান্তর করুন।</li>
</ol>

<p><strong>পরামর্শ:</strong> বীজ বপনের পর মাটি শুকিয়ে যেতে দেবেন না। একই সঙ্গে অতিরিক্ত ভেজা মাটি এড়িয়ে চলুন, কারণ এতে বীজ পচে যাওয়ার ঝুঁকি থাকে।</p>

<h2>ছাদবাগান ও টবে মরিচ চাষ</h2>

<p>ছাদবাগান বা বারান্দায় মরিচ চাষের জন্য পর্যাপ্ত আকারের টব ব্যবহার করুন, যাতে গাছের শিকড় ভালোভাবে বিস্তার লাভ করতে পারে। টবের নিচে পানি বের হওয়ার ছিদ্র থাকতে হবে। টবে বাগানের মাটি, পচা জৈব সার ও পানি নিষ্কাশনে সহায়ক উপাদান মিশিয়ে ব্যবহার করতে পারেন। গাছ বড় হওয়ার সঙ্গে সঙ্গে প্রয়োজনমতো সহায়তা দিন এবং অতিরিক্ত ঘন গাছ পাতলা করে দিন।</p>

<h2>সূর্যালোক ও পানি ব্যবস্থাপনা</h2>

<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন স্থানে গাছ রাখুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা দেখে নিয়মিত পানি দিন। গরম ও শুষ্ক আবহাওয়ায় পানির প্রয়োজন বাড়তে পারে।</li>
  <li><strong>নিষ্কাশন:</strong> জমি বা টবে পানি জমে থাকতে দেবেন না।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের মধ্যে পর্যাপ্ত ফাঁকা জায়গা রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
</ul>

<h2>সার প্রয়োগ ও পরিচর্যা</h2>

<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা জৈব সার এবং প্রয়োজনীয় সুষম সার প্রয়োগ করুন। গাছের বয়স ও বৃদ্ধির পর্যায় অনুযায়ী সারের পরিমাণ ঠিক করুন। অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। নিয়মিত আগাছা পরিষ্কার করুন এবং শুকনো বা রোগাক্রান্ত পাতা দেখা গেলে তা সরিয়ে ফেলুন।</p>

<h2>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>

<p>মরিচ গাছে জাব পোকা, থ্রিপস, মাকড় ও বিভিন্ন ধরনের রোগের আক্রমণ দেখা দিতে পারে। নিয়মিত গাছের পাতা, কাণ্ড ও কচি ডগা পরীক্ষা করুন। আক্রান্ত গাছ বা পাতা শনাক্ত হলে দ্রুত উপযুক্ত ব্যবস্থা নিন। প্রয়োজন হলে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন এবং পণ্যের নির্দেশনা ও অপেক্ষাকাল মেনে চলুন।</p>

<h2>মরিচ সংগ্রহ</h2>

<p>মরিচের আকার, রং ও পরিপক্বতা কাঙ্ক্ষিত পর্যায়ে পৌঁছালে সংগ্রহ করুন। পরিষ্কার কাঁচি দিয়ে ডাঁটাসহ সাবধানে মরিচ তুললে গাছের ক্ষতি কম হয়। নিয়মিত পরিপক্ব মরিচ সংগ্রহ করলে গাছের পরিচর্যা সহজ হয় এবং পরবর্তী ফল সংগ্রহের সুযোগ বজায় থাকে। ফলন ও সংগ্রহের সময় আবহাওয়া, মাটির উর্বরতা এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h2>কেন চীনা হাইব্রিড লম্বা কাঁচা মরিচ বীজ – হ্যংজিও ১ বেছে নেবেন?</h2>

<ul>
  <li>লম্বা ও সবুজ কাঁচা মরিচ চাষের উপযোগী হাইব্রিড জাত।</li>
  <li>বাড়ির আঙিনা, ছাদবাগান ও বাণিজ্যিক চাষে ব্যবহার করা যায়।</li>
  <li>নিজের বাগান থেকে টাটকা মরিচ সংগ্রহের সুযোগ।</li>
  <li>সঠিক পরিচর্যায় সুস্থ গাছ ও ভালো ফলন পাওয়ার সম্ভাবনা।</li>
  <li>এক প্যাকেটে আনুমানিক ২০০টি বীজ।</li>
</ul>

<h2>আজই অর্ডার করুন Ss Seed Shop থেকে!</h2>

<p>নিজের বাগানে লম্বা, সবুজ কাঁচা মরিচ চাষের প্রস্তুতি নিন <strong>চীনা হাইব্রিড লম্বা কাঁচা মরিচ বীজ – হ্যংজিও ১</strong> দিয়ে। মানসম্মত বীজ বেছে নিন, নিয়মিত পরিচর্যা করুন এবং নিজের বাগানের টাটকা মরিচ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন।</strong></p>
```', 'MOR-1503', 9, 9, 1, 0, 0, '[]', '2026-09-24T01:42:42.448+00:00', '2026-10-12T11:24:41.92034+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f3f5e9f4-661b-4662-8676-b3e6ef035524', 'ইতালিয়ান হাইব্রিড লেটুস বীজ', 'italian-hybrid-lettuce-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1780915207764-1qq9abx.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1780915221599-75fx88o.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1780915220943-wrxy9ep.webp\"]', 120, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পপুলার\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বসন্তকাল\"]', 'আনুমানিক ২০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, অঙ্কুরোদগম ক্ষমতাসম্পন্ন, দ্রুত বৃদ্ধি পায় এবং সতেজ, কচি ও সুস্বাদু লেটুস উৎপাদন করে।', 'ইতালিয়ান হাইব্রিড লেটুস বীজ থেকে উন্নত মানের, কোমল ও সুস্বাদু লেটুস উৎপাদন করা যায়। দ্রুত বৃদ্ধি, উচ্চ অঙ্কুরোদগম হার এবং ভালো বেঁচে থাকার ক্ষমতার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য উপযোগী। সারা বছর চাষ করা সম্ভব এবং তাজা সালাদ তৈরির জন্য আদর্শ।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1523', 2, 2, 1, 0, 0, '[]', '2026-09-24T01:48:41.884+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4010c811-037e-4005-b920-fef4ab252226', 'ইস্পাহানি উচ্চফলনশীল হাইব্রিড লালশাক RM 001', 'ispahani-rm-001-hybrid-red-amaranth-seeds-10-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791782539240-hpz7ban.webp', NULL, 28, 0, 16.8, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"হাইব্রিড\",\"সেরা পণ্য\",\"আগাম চাষ- শীতকাল\",\"প্রধান- শীতকালীন\"]', '১০ গ্রাম (উচ্চ গুণমানসম্পন্ন) RM 001 হাইব্রিড লালশাক বীজ | দ্রুত ফলনশীল, নরম-সুস্বাদু, গাঢ় লাল পাতা ও ২৫-৩০ টন ফলন।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি উচ্চফলনশীল হাইব্রিড লালশাক RM 001</strong> একটি অধিক ফলনশীল ও দ্রুত ফলনশীল জাত। এর পাতা আকর্ষণীয় গাঢ় লাল রঙের এবং শাক নরম ও সুস্বাদু। বীজ বপনের মাত্র <strong>২০–২৫ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায়। সঠিক পরিচর্যায় প্রতি একরে <strong>২৫–৩০ টন</strong> পর্যন্ত ফলন পাওয়া যেতে পারে। শাকটি দূরপাল্লার পরিবহনের জন্যও সুবিধাজনক।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> উচ্চফলনশীল হাইব্রিড<br>
<strong>🌿 বৃদ্ধি:</strong> দ্রুত ফলনশীল<br>
<strong>🍃 পাতার রঙ:</strong> আকর্ষণীয় গাঢ় লাল<br>
<strong>🥬 গুণমান:</strong> নরম ও সুস্বাদু<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ২০–২৫ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ২৫–৩০ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1603', 11, 11, 1, 0, 0, '[]', '2026-09-26T13:23:44.775+00:00', '2026-10-17T05:26:05.17393+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c1f7945e-9a2e-44d1-b697-0d5792091dfe', 'অল সিজন প্রিমিয়াম সাদা জিনিয়া ফুল গাছের বীজ', 'all-season-premium-white-zinnia-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732457630-6nic69x.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"পপুলার\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, সাদা দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'অল সিজন প্রিমিয়াম সাদা জিনিয়া ফুল গাছের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন উজ্জ্বল সাদা রঙের বড় ও আকর্ষণীয় ফুল। এই প্রিমিয়াম জাতটি দ্রুত বৃদ্ধি পায়, দীর্ঘসময় ধরে ফুল ফোটায় এবং অল সিজন চাষের জন্য উপযোগী। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ প্রচুর দৃষ্টিনন্দন ফুল উপহার দেয়, যা বাগানের সৌন্দর্য বহুগুণ বৃদ্ধি করে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1549', 17, 17, 1, 0, 0, '[]', '2026-09-24T01:42:47.375+00:00', '2026-10-17T12:31:28.569342+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('97dbb623-ac11-4889-a286-c772f223b20a', 'হাইব্রিড টবে চাষ উপযোগী সাদা ধানমরিচ বীজ', 'hybrid-white-dhanmorich-seeds-for-pots', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949182620-j7ms341.webp', NULL, 180, 75, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"পপুলার\",\"পরীক্ষিত\"]', 'আনুমানিক ১০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, ছোট, ঝাঁজালো ও আকর্ষণীয় সাদা মরিচ উৎপাদন করুন।', '```html
<h2>হাইব্রিড টবে চাষ উপযোগী সাদা ধানমরিচ বীজ</h2>

<p><strong>হাইব্রিড সাদা ধানমরিচ বীজ</strong> ছোট আকৃতির, ঝাঁজালো এবং সাদা বা হালকা ক্রিম রঙের মরিচ চাষের জন্য উপযোগী একটি বিশেষ জাত। গাছ তুলনামূলক ছোট হওয়ায় টব, ছাদবাগান, বারান্দা ও কিচেন গার্ডেনে সহজেই চাষ করা যায়। গাছে সাদা রঙের মরিচ ধরলে সবুজ পাতার সঙ্গে দৃষ্টিনন্দন বৈপরীত্য তৈরি হয়, যা বাগানের সৌন্দর্যও বাড়ায়। সঠিক পরিচর্যা ও অনুকূল পরিবেশে দীর্ঘ সময় ধরে মরিচ সংগ্রহের সুযোগ পাওয়া যেতে পারে। নিজের বাড়িতে টাটকা ঝাল মরিচ উৎপাদন করতে চাইলে এই বীজ হতে পারে একটি আকর্ষণীয় পছন্দ।

<h2>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h2>

<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌶️ <strong>মরিচের ধরন:</strong> ছোট আকৃতির ও ঝাল মরিচ</li>
  <li>🎨 <strong>মরিচের রং:</strong> সাদা বা হালকা ক্রিম</li>
  <li>🌿 <strong>জাতের ধরন:</strong> হাইব্রিড</li>
  <li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বারান্দা, কিচেন গার্ডেন ও উপযুক্ত বাণিজ্যিক চাষ</li>
</ul>

<h2>হাইব্রিড সাদা ধানমরিচের বিশেষ বৈশিষ্ট্য</h2>

<ul>
  <li><strong>আকর্ষণীয় সাদা মরিচ:</strong> সাদা বা হালকা ক্রিম রঙের মরিচ বাগানে ভিন্নধর্মী সৌন্দর্য যোগ করে।</li>
  <li><strong>টবে চাষের উপযোগী:</strong> ছোট গাছের বৈশিষ্ট্যের কারণে সীমিত জায়গায় চাষের জন্য উপযোগী।</li>
  <li><strong>ঝাঁজালো স্বাদ:</strong> রান্নায় ঝাল স্বাদের জন্য ব্যবহার করা যায়।</li>
  <li><strong>দীর্ঘ সময় সংগ্রহের সুযোগ:</strong> গাছ সুস্থ থাকলে উপযুক্ত পরিবেশে একাধিকবার মরিচ সংগ্রহ করা সম্ভব।</li>
  <li><strong>শৌখিন বাগানের জন্য উপযোগী:</strong> বারান্দা, ছাদ বা বাড়ির ছোট বাগানে সবুজ পাতার সঙ্গে সাদা মরিচ দৃষ্টিনন্দন দেখায়।</li>
  <li><strong>ফলনের সম্ভাবনা:</strong> সঠিক পরিচর্যা, পর্যাপ্ত আলো ও সুষম পুষ্টি গাছের বৃদ্ধি ও ফল ধারণে সহায়ক।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>

<p>বাংলাদেশের স্থানীয় আবহাওয়া ও মৌসুম অনুযায়ী সাদা ধানমরিচের বীজ বপন করুন। অতিরিক্ত ঠান্ডা, প্রচণ্ড গরম ও জলাবদ্ধতা এড়িয়ে উপযুক্ত পরিবেশে বীজ বপন করা ভালো। টবে চাষের ক্ষেত্রে আবহাওয়া অনুকূলে থাকলে পরিচর্যার সুবিধা অনুযায়ী বপনের সময় নির্বাচন করা যায়।</p>

<h2>মাটি ও টব প্রস্তুত</h2>

<p>মরিচ চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনের সুবিধাযুক্ত মাটি নির্বাচন করুন। টবের মিশ্রণ তৈরির জন্য বাগানের মাটির সঙ্গে ভালোভাবে পচা জৈব সার ও পানি নিষ্কাশনে সহায়ক উপাদান মিশিয়ে নিতে পারেন। টবের নিচে পর্যাপ্ত ছিদ্র রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে। গাছের শিকড়ের বৃদ্ধির জন্য উপযুক্ত আকারের টব ব্যবহার করুন।</p>

<h2>সাদা ধানমরিচের বীজ বপনের নিয়ম</h2>

<ol>
  <li>প্রথমে পরিষ্কার সিড ট্রে, ছোট পাত্র বা বীজতলায় ঝুরঝুরে ও আর্দ্র মাটি প্রস্তুত করুন।</li>
  <li>বীজ অল্প গভীরে বপন করে ওপর থেকে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ মাটির গভীরে সরে না যায়।</li>
  <li>মাটির আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি দেবেন না।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করে শক্ত হলে সাবধানে মূল টবে স্থানান্তর করুন।</li>
  <li>চারা স্থানান্তরের পর প্রয়োজনমতো পানি দিন এবং শুরুতে তীব্র রোদ ও অতিরিক্ত তাপের চাপ থেকে রক্ষা করুন।</li>
</ol>

<h2>ছাদবাগান ও বারান্দায় সাদা ধানমরিচ চাষ</h2>

<p>সাদা ধানমরিচের ছোট গাছের বৈশিষ্ট্য টবে ও সীমিত জায়গায় চাষের জন্য সুবিধাজনক। ছাদ, বারান্দা বা জানালার পাশে এমন জায়গা নির্বাচন করুন, যেখানে পর্যাপ্ত সূর্যালোক পাওয়া যায়। টবের মাটি যেন অতিরিক্ত শক্ত না হয় এবং পানি নিষ্কাশন ভালো থাকে। গাছের বৃদ্ধির সঙ্গে সঙ্গে প্রয়োজনমতো জৈব সার দিন এবং শুকনো পাতা পরিষ্কার করুন। পর্যাপ্ত আলো ও সঠিক পরিচর্যায় গাছের বৃদ্ধি এবং মরিচ উৎপাদন বজায় রাখতে সহায়তা পাওয়া যায়।</p>

<h2>সূর্যালোক ও পানি ব্যবস্থাপনা</h2>

<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন স্থানে টব রাখুন।</li>
  <li><strong>পানি:</strong> মাটির ওপরের স্তর শুকাতে শুরু করলে প্রয়োজন অনুযায়ী পানি দিন।</li>
  <li><strong>জলাবদ্ধতা:</strong> টবের নিচে পানি জমতে দেবেন না, কারণ অতিরিক্ত ভেজা মাটি শিকড়ের ক্ষতি করতে পারে।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের চারপাশে পর্যাপ্ত আলো-বাতাস চলাচলের ব্যবস্থা রাখুন।</li>
</ul>

<h2>সার প্রয়োগ ও নিয়মিত পরিচর্যা</h2>

<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা জৈব সার এবং প্রয়োজনীয় সুষম সার প্রয়োগ করুন। গাছের বয়স ও বৃদ্ধির পর্যায় অনুযায়ী সারের পরিমাণ ঠিক করুন। অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। নিয়মিত আগাছা পরিষ্কার করুন এবং শুকনো, হলুদ বা রোগাক্রান্ত পাতা সরিয়ে ফেলুন। টবের মাটি দীর্ঘদিন শক্ত হয়ে গেলে ওপরের স্তর আলতোভাবে ঝুরঝুরে করে দিতে পারেন, তবে শিকড়ের ক্ষতি যেন না হয়।</p>

<h2>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>

<p>মরিচ গাছে জাব পোকা, থ্রিপস, মাকড় ও বিভিন্ন রোগের আক্রমণ দেখা দিতে পারে। নিয়মিত কচি ডগা, পাতার নিচের অংশ ও কাণ্ড পরীক্ষা করুন। আক্রান্ত পাতা বা ডাল শনাক্ত হলে প্রয়োজন অনুযায়ী ব্যবস্থা নিন। অতিরিক্ত পানি ও ঘন গাছের কারণে আর্দ্রতা বেড়ে গেলে রোগের ঝুঁকি বাড়তে পারে, তাই পানি নিষ্কাশন ও বাতাস চলাচল নিশ্চিত করুন। প্রয়োজনে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিয়ে অনুমোদিত বালাইনাশক ব্যবহার করুন এবং ব্যবহারের নির্দেশনা মেনে চলুন।</p>

<h2>সাদা ধানমরিচ সংগ্রহের নিয়ম</h2>

<p>মরিচ কাঙ্ক্ষিত আকার ধারণ করে সাদা বা হালকা ক্রিম রঙে পৌঁছালে সংগ্রহের উপযুক্ততা যাচাই করুন। পরিষ্কার কাঁচি দিয়ে ডাঁটাসহ সাবধানে মরিচ তুলুন, যাতে গাছের ডাল ক্ষতিগ্রস্ত না হয়। নিয়মিত পরিপক্ব মরিচ সংগ্রহ করুন এবং গাছের পানি ও পুষ্টির চাহিদা বজায় রাখুন। গাছের ফলন ও সংগ্রহের সময় আবহাওয়া, পরিচর্যা এবং গাছের স্বাস্থ্যের ওপর নির্ভরশীল।</p>

<h2>কেন হাইব্রিড টবে চাষ উপযোগী সাদা ধানমরিচ বেছে নেবেন?</h2>

<ul>
  <li>সাদা বা হালকা ক্রিম রঙের আকর্ষণীয় ঝাল মরিচ।</li>
  <li>ছোট গাছের কারণে টব ও সীমিত জায়গায় চাষের উপযোগী।</li>
  <li>ছাদবাগান, বারান্দা ও কিচেন গার্ডেনে চাষ করা যায়।</li>
  <li>নিজের বাড়িতে টাটকা মরিচ উৎপাদনের সুযোগ।</li>
  <li>এক প্যাকেটে আনুমানিক ১০০টি বীজ।</li>
  <li>সঠিক পরিচর্যায় সুস্থ গাছ ও ভালো ফলন পাওয়ার সম্ভাবনা।</li>
</ul>

<h2>আজই অর্ডার করুন Ss Seed Shop থেকে!</h2>

<p>আপনার ছাদবাগান বা বারান্দায় ভিন্নধর্মী সাদা মরিচ চাষ করতে সংগ্রহ করুন <strong>হাইব্রিড টবে চাষ উপযোগী সাদা ধানমরিচ বীজ</strong>। সঠিক মাটি, পর্যাপ্ত আলো, নিয়মিত পানি ও যত্নের মাধ্যমে নিজের বাগানে মরিচ চাষের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন।</strong></p>
```', 'MOR-1506', 15, 15, 1, 0, 0, '[]', '2026-09-24T01:42:42.921+00:00', '2026-10-17T05:26:04.797677+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('07305a41-77d0-4dec-94e2-b39d97f4097a', 'উন্নত জাতের হলিহক ফুলের বীজ (১২ মাসী চাষ উপযোগী)', 'premium-hollyhock-flower-seeds-all-season', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732434438-7dhdpx5.webp', NULL, 150, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\",\"বসন্তকাল\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, ১২ মাস চাষ উপযোগী, লম্বা দণ্ডে দৃষ্টিনন্দন ফুল, বাগানের জন্য আদর্শ।', '<h3>🌸 ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</h3>
<p><strong>ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন গাঢ় বেগুনি রঙের মনোমুগ্ধকর ফুলে। আকর্ষণীয় রং ও সুন্দর ফুলের জন্য অ্যাস্টার বাগান, ছাদবাগান এবং বারান্দা সাজানোর একটি চমৎকার পছন্দ। হাইব্রিড জাতের এই ফুল উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় সুস্থ গাছ এবং প্রচুর ফুল উৎপাদনে সহায়তা করতে পারে। টব, গ্রো ব্যাগ, ফুলের বেড, বর্ডার ও খোলা বাগানে চাষের জন্য উপযোগী।

<h3>📦 Product Specifications</h3>
<ul>
<li><strong>পণ্যের নাম:</strong> ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</li>
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>ফুলের রং:</strong> গাঢ় বেগুনি</li>
<li><strong>জাত:</strong> হাইব্রিড</li>
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>চাষের স্থান:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগান</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>
<ul>
<li>💜 গাঢ় বেগুনি রঙের আকর্ষণীয় ফুল</li>
<li>🌱 হাইব্রিড জাত, উপযুক্ত পরিচর্যায় সুস্থ গাছের বৃদ্ধির জন্য উপযোগী</li>
<li>🌸 বাগানে সৌন্দর্য ও রঙের বৈচিত্র্য যোগ করে</li>
<li>🪴 টব, গ্রো ব্যাগ ও ছাদবাগানে চাষ করা যায়</li>
<li>🏡 বাড়ির আঙিনা, বারান্দা ও ফুলের বেড সাজাতে উপযোগী</li>
<li>🌼 অনুকূল পরিবেশে দীর্ঘ সময় ফুল পাওয়ার সম্ভাবনা থাকে</li>
</ul>

<h3>📅 অ্যাস্টার ফুল চাষের উপযুক্ত সময়</h3>
<p>অ্যাস্টার ফুল সাধারণত মৃদু ও তুলনামূলক শীতল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় <strong>শরৎকালের শেষ ভাগ থেকে শীতকাল</strong> অ্যাস্টার চাষের জন্য উপযোগী হতে পারে। সাধারণভাবে সেপ্টেম্বর থেকে ডিসেম্বরের মধ্যে বীজ বপনের পরিকল্পনা করা যায়; তবে সঠিক সময় অ্যাস্টারের জাত, স্থানীয় তাপমাত্রা ও আবহাওয়ার ওপর নির্ভর করে। অতিরিক্ত গরম, ভারী বৃষ্টি এবং জলাবদ্ধতা এড়িয়ে চলুন।

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>
<p>অ্যাস্টার ফুলের জন্য ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য দোআঁশ মাটি ভালো। উপযুক্ত মাটি শিকড়ের বৃদ্ধি, পুষ্টি গ্রহণ ও গাছের সুস্থ বিকাশে সহায়তা করে।</p>
<ul>
<li>মাটি ভালোভাবে কুপিয়ে বা ঝুরঝুরে করে নিন।</li>
<li>পাথর, আগাছা ও শক্ত মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li>মাটির সঙ্গে ভালোভাবে পচানো গোবর বা কম্পোস্ট মিশিয়ে নিন।</li>
<li>পানি জমে থাকার আশঙ্কা থাকলে উঁচু বেড তৈরি করুন।</li>
<li>টবের নিচে পর্যাপ্ত পানি নিষ্কাশনের ছিদ্র নিশ্চিত করুন।</li>
</ul>
<p><strong>সহজ মাটির মিশ্রণ:</strong> ৫০% দোআঁশ মাটি, ৩০% পচা কম্পোস্ট এবং ২০% কোকোপিট বা মোটা বালু মিশিয়ে টবের জন্য হালকা ও পানি নিষ্কাশনযোগ্য মাটি তৈরি করতে পারেন। মাটির ধরন অনুযায়ী অনুপাত সামান্য পরিবর্তন করা যায়।</p>

<h3>🌿 বীজ বপনের সঠিক পদ্ধতি</h3>
<p>অ্যাস্টারের বীজ ছোট হওয়ায় বপনের সময় সতর্কতা প্রয়োজন। বীজ সরাসরি প্রস্তুত টব বা বেডে বপন করা যায়, অথবা বীজতলায় চারা তৈরি করে পরে মূল স্থানে লাগানো যায়।</p>
<ul>
<li>বীজতলা বা পাত্রে ঝুরঝুরে ও হালকা আর্দ্র মাটি তৈরি করুন।</li>
<li>বীজ মাটির উপর সমানভাবে ছড়িয়ে দিন।</li>
<li>বীজের উপর খুব পাতলা মাটির স্তর দিন; অতিরিক্ত গভীরে পুঁতে দেবেন না।</li>
<li>স্প্রে বোতল দিয়ে হালকা পানি দিন, যাতে বীজ সরে না যায়।</li>
<li>অঙ্কুরোদগম না হওয়া পর্যন্ত মাটি হালকা আর্দ্র রাখুন, কিন্তু ভিজে কাদা করবেন না।</li>
<li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করলে শিকড় অক্ষত রেখে সাবধানে প্রয়োজনীয় দূরত্বে রোপণ করুন।</li>
</ul>

<h3>🪴 টব ও ছাদবাগানে অ্যাস্টার চাষ</h3>
<p>বেগুনি অ্যাস্টার টব, গ্রো ব্যাগ, ছাদবাগান ও বারান্দায় চাষ করা যায়। গাছের শিকড়ের উপযুক্ত বৃদ্ধি নিশ্চিত করতে মাঝারি আকারের বা প্রয়োজন অনুযায়ী গভীর পাত্র বেছে নিন। টবে যেন অতিরিক্ত পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>
<p>পাত্রটি এমন জায়গায় রাখুন, যেখানে পর্যাপ্ত রোদ ও বাতাস চলাচলের ব্যবস্থা রয়েছে। এক পাত্রে অতিরিক্ত গাছ রাখবেন না; গাছের বৃদ্ধি অনুযায়ী পর্যাপ্ত ফাঁকা জায়গা রাখলে পরিচর্যা সহজ হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<p>অ্যাস্টার ফুলের ভালো বৃদ্ধির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৫–৬ ঘণ্টা বা তার বেশি রোদ পায় এমন স্থান উপযোগী হতে পারে। গাছের গোড়ার মাটি শুকাতে শুরু করলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত সেচ ও জলাবদ্ধতা এড়িয়ে চলুন, কারণ এতে শিকড় পচে যাওয়ার ঝুঁকি বাড়তে পারে।</p>

<h3>💧 সার ও নিয়মিত পরিচর্যা</h3>
<ul>
<li>মাটি তৈরির সময় পরিমিত পরিমাণে পচা কম্পোস্ট বা জৈব সার মিশিয়ে নিন।</li>
<li>গাছের বৃদ্ধি অনুযায়ী প্রয়োজন হলে পরিমিত সার প্রয়োগ করুন।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন এবং গাছের চারপাশ পরিচ্ছন্ন রাখুন।</li>
<li>শুকিয়ে যাওয়া ফুল ও ক্ষতিগ্রস্ত পাতা সরিয়ে ফেলুন।</li>
<li>গাছ অতিরিক্ত ঘন হলে বাতাস চলাচলের জন্য প্রয়োজনীয় জায়গা রাখুন।</li>
<li>অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন এবং সার ব্যবহারের নির্দেশনা অনুসরণ করুন।</li>
</ul>

<h3>🐛 রোগ ও পোকামাকড় ব্যবস্থাপনা</h3>
<p>গাছের পাতা, কাণ্ড ও গোড়া নিয়মিত পর্যবেক্ষণ করুন। পাতায় দাগ, পচন বা পোকামাকড়ের আক্রমণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন। পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন এবং মাটিতে পানি জমতে দেবেন না। সমস্যা বেশি হলে রোগ বা পোকা শনাক্ত করে স্থানীয়ভাবে অনুমোদিত বালাইনাশক পণ্যের লেবেল অনুযায়ী ব্যবস্থা নিন।</p>

<h3>🌼 ফুল ফোটা ও গাছের যত্ন</h3>
<p>উপযুক্ত মৌসুমে বপন, পর্যাপ্ত সূর্যালোক, সঠিক মাটি ও নিয়মিত পরিচর্যা অ্যাস্টার গাছের বৃদ্ধি ও ফুল ফোটাতে সহায়তা করে। গাছের জাত ও আবহাওয়া অনুযায়ী ফুল ফোটার সময় ভিন্ন হতে পারে। ফুলের বেডে অন্যান্য রঙের ফুলের সঙ্গে বেগুনি অ্যাস্টার লাগালে বাগানে সুন্দর রঙের বৈচিত্র্য তৈরি হয়।</p>

<h3>🏡 কোথায় বেগুনি অ্যাস্টার চাষ করা যায়?</h3>
<ul>
<li>🏠 বাড়ির আঙিনা ও সামনের বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🌿 বারান্দা ও ছোট বাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌸 ফুলের বেড ও বাগানের বর্ডার</li>
<li>💐 বাড়ি ও বাগানের সৌন্দর্যবর্ধক ফুলের আয়োজন</li>
</ul>

<h3>💜 কেন ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ চাষ করবেন?</h3>
<p>গাঢ় বেগুনি রঙের আকর্ষণীয় ফুল দিয়ে বাগান সাজাতে <strong>ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</strong> একটি চমৎকার নির্বাচন। টব থেকে শুরু করে ছাদবাগান ও খোলা ফুলের বেড—বিভিন্ন স্থানে উপযুক্ত পরিবেশে এই ফুল চাষ করা যায়। নিয়মিত যত্নের মাধ্যমে নিজের বাগানে তৈরি করুন মনোমুগ্ধকর ফুলের সমাহার।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং আপনার বাগানকে সাজিয়ে তুলুন গাঢ় বেগুনি অ্যাস্টার ফুলে!</strong></p>', 'FUL-1510', 5, 5, 1, 0, 0, '[]', '2026-09-24T01:42:33.199+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b2143fda-d0b5-4e7b-b5f7-06c713f8cedc', 'হাইব্রিড লম্বা বেগুন বীজ', 'hybrid-long-eggplant-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459876761-4a0b0i7.webp', NULL, 120, 85, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"পপুলার\",\"পরীক্ষিত\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, চকচকে ও সুস্বাদু লম্বা বেগুন উৎপাদনের জন্য আদর্শ।', 'হাইব্রিড লম্বা বেগুন একটি উন্নত মানের ও উচ্চ ফলনশীল জাত, যা লম্বা আকৃতির, মসৃণ ও আকর্ষণীয় বেগুন উৎপাদন করে। এর ফল কোমল, কম বীজযুক্ত এবং রান্নায় অত্যন্ত সুস্বাদু। দ্রুত বৃদ্ধি, দীর্ঘ সময় ফলন এবং রোগ সহনশীলতার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য অত্যন্ত উপযোগী।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1559', 5, 5, 1, 0, 0, '[]', '2026-09-24T01:48:40.452+00:00', '2026-10-20T01:31:41.521106+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('408714d5-5651-46cf-99fa-5a5ea6e585b4', 'ইস্পাহানি কিং হাইব্রিড পেঁপে', 'ispahani-king-hybrid-papaya-10-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791785189451-bytkwch.webp', NULL, 80, 0, 48, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"হাইব্রিড\",\"সেরা পণ্য\"]', 'আনুমানিক ১০টি বীজ (উচ্চ গুণমানসম্পন্ন) | ইস্পাহানি কিং হাইব্রিড পেঁপে, অধিক ফলনশীল, ভাইরাস সহনশীল ও ২-৩ কেজি ওজনের মিষ্টি ফল।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি কিং হাইব্রিড পেঁপে</strong> একটি অধিক ফলনশীল হাইব্রিড জাত, যা তাইওয়ানের বিশ্বখ্যাত <strong>Know-You</strong> কোম্পানি থেকে আমদানিকৃত। ফল লম্বাটে-গোলাকার আকৃতির এবং গড় ওজন ২–৩ কেজি। জাতটি ভাইরাস সহনশীল এবং ফলের ব্রিক্স (মিষ্টির মাত্রা) প্রায় ১২%। বীজ বপনের প্রায় ১৮০ দিনের মধ্যে ফল সংগ্রহ করা যায়। দূরপাল্লার পরিবহনের জন্যও ফল উপযোগী।</p>
<p><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ১০টি বীজ (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> হাইব্রিড<br>
<strong>🍈 ফলের আকৃতি:</strong> লম্বাটে-গোলাকার<br>
<strong>⚖️ গড় ফলের ওজন:</strong> ২–৩ কেজি<br>
<strong>🍬 ব্রিক্স:</strong> ১২%<br>
<strong>🛡️ সহনশীলতা:</strong> ভাইরাস সহনশীল<br>
<strong>⏱️ সংগ্রহ:</strong> বীজ বপনের প্রায় ১৮০ দিনের মধ্যে<br>
<strong>📅 সংগ্রহের মৌসুম:</strong> জুন–জুলাই<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক<br><strong>উৎপত্তি:</strong> তাইওয়ানের Know-You কোম্পানি থেকে আমদানিকৃত</p>', 'VEG-1594', 7, 7, 1, 0, 0, '[]', '2026-09-25T16:46:48.47+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('47762a3d-37aa-425f-bc68-f306cfe233e6', 'হাইব্রিড পুদিনা পাতার বীজ', 'hybrid-mint-leaf-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1792459385060-fthhon0.webp', NULL, 150, 110, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"পপুলার\",\"হাইব্রিড\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, সুগন্ধি, সতেজ, দ্রুত বর্ধনশীল ও উচ্চ ফলনশীল পুদিনা পাতা উৎপাদন করুন।', 'হাইব্রিড পুদিনা পাতার বীজ একটি উন্নত মানের ও দ্রুত বর্ধনশীল ভেষজ উদ্ভিদের জাত, যা ঘন সবুজ, সুগন্ধি ও সতেজ পাতা উৎপাদন করে। পুদিনা পাতা শরবত, চা, সালাদ, চাটনি এবং বিভিন্ন রান্নায় স্বাদ ও সুগন্ধ বৃদ্ধিতে ব্যাপকভাবে ব্যবহৃত হয়। এটি টব, ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য অত্যন্ত উপযোগী। নিয়মিত সংগ্রহের মাধ্যমে দীর্ঘ সময় ধরে তাজা পাতা পাওয়া যায়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1534', 6, 6, 1, 0, 0, '[]', '2026-09-24T01:48:43.164+00:00', '2026-10-20T01:23:14.490144+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ba5e00c2-9a3f-413a-ab02-d650ffa0cc68', 'ইস্পাহানি বারোমাসি F1 হাইব্রিড বেগুন EP-1820', 'ispahani-ep-1820-baromasif1-hybrid-eggplant-seeds-5-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784083733-vn26eoh.webp', NULL, 40, 0, 24, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"সেরা পণ্য\",\"পপুলার\"]', '৫ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি F1 হাইব্রিড বেগুন EP-1820 | সারা বছর চাষযোগ্য, ২০০-২৫০ গ্রাম ফল, দ্রুত ফলন ও ৩৫-৪০ টন ফলন।', '<p><strong>ইস্পাহানি বারোমাসি F1 হাইব্রিড বেগুন EP-1820</strong> একটি সারা বছর চাষযোগ্য, ঝোপালো ও দ্রুত বর্ধনশীল হাইব্রিড জাত। ফল ডিম্বাকৃতির, আকর্ষণীয় সবুজ রঙের এবং নিচের অংশে সাদা ছোপযুক্ত। প্রতিটি ফলের দৈর্ঘ্য প্রায় <strong>৫.৫–৬.৫ ইঞ্চি</strong> এবং গড় ওজন <strong>২০০–২৫০ গ্রাম</strong>। প্রতিটি গাছে প্রায় <strong>২৫–৩০টি</strong> বেগুন ধরতে পারে। জাতটি ঢলে পড়া রোগ, বৃষ্টির পানি ও তাপমাত্রার প্রতিকূলতা সহনশীল। বীজ বপনের <strong>৪৫–৫০ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায় এবং প্রতি একরে <strong>৩৫–৪০ টন</strong> পর্যন্ত ফলন হতে পারে।<span aria-hidden=\"true\"></span></p>
<p><strong>📦 বীজের পরিমাণ:</strong> ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> বারোমাসি F1 হাইব্রিড<br>
<strong>📅 চাষের সময়:</strong> সারা বছর<br>
<strong>🍆 ফলের আকৃতি:</strong> ডিম্বাকৃতির<br>
<strong>🎨 ফলের রঙ:</strong> আকর্ষণীয় সবুজ, নিচে সাদা ছোপযুক্ত<br>
<strong>📏 ফলের দৈর্ঘ্য:</strong> ৫.৫–৬.৫ ইঞ্চি<br>
<strong>⚖️ গড় ওজন:</strong> ২০০–২৫০ গ্রাম<br>
<strong>🌿 প্রতি গাছে ফল:</strong> ২৫–৩০টি<br>
<strong>🛡️ সহনশীলতা:</strong> ঢলে পড়া রোগ, বৃষ্টির পানি ও তাপমাত্রার প্রতিকূলতা সহনশীল<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ৪৫–৫০ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ৩৫–৪০ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1600', 3, 3, 1, 0, 0, '[]', '2026-09-26T13:03:59.24+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f3b49c07-09e8-4572-b244-780af6c16f14', 'আমদানিকৃত হাইব্রিড হলুদ জিনিয়া ফুলের বীজ', 'imported-hybrid-yellow-zinnia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732455421-b9o1sl0.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল হলুদ বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'আমদানিকৃত হাইব্রিড হলুদ জিনিয়া ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন উজ্জ্বল হলুদ রঙের বড় ও আকর্ষণীয় ফুলে। হাইব্রিড জাত হওয়ায় গাছ দ্রুত বৃদ্ধি পায়, অধিক ফুল উৎপাদন করে এবং দীর্ঘসময় ধরে ফুল ফোটায়। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে দৃষ্টিনন্দন ফুলে ভরে ওঠে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1552', 12, 12, 1, 0, 0, '[]', '2026-09-24T01:42:47.872+00:00', '2026-10-12T11:24:49.351408+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b313e0dd-4f14-46d8-a515-33c2d1e408ae', 'কেরালা-২ জাতের শিম বীজ (বারোমাসি ও খাটো জাত)', 'kerala-2-evergreen-dwarf-beans-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378429442-pgjbtir.webp', NULL, 150, 110, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[]', 'আনুমানিক ৩০–৩২ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | কেরালা-২ বারোমাসি খাটো শিম, আগাম ফলন ও মাচা ছাড়াই চাষের জন্য উপযোগী। আজই অর্ডার করুন!', '🫘 Product Short Description

কেরালা-২ জাতের শিম একটি উচ্চফলনশীল, আগাম ও খাটো জাতের শিম। মাত্র প্রায় ৪০ দিনে ফলন পাওয়ার উপযোগী এবং খাটো গাছ হওয়ায় সাধারণত মাচা দেওয়ার প্রয়োজন হয় না।

বারোমাসি বৈশিষ্ট্যের কারণে উপযুক্ত পরিবেশ ও সঠিক পরিচর্যায় দীর্ঘসময় শিম চাষের সুযোগ পাওয়া যায়। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🫘 আগাম শিম চাষ শুরু করতে আজই অর্ডার করুন!

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৩০–৩২ টি বীজ / ১২ গ্রাম প্যাকেট
🌱 জাত: কেরালা-২
🌿 ধরন: বারোমাসি ও খাটো জাত
⚡ বৈশিষ্ট্য: উচ্চফলনশীল আগাম জাত
⏱️ ফলন: প্রায় ৪০ দিনে ফলন উপযোগী
🪴 মাচা: খাটো জাত হওয়ায় মাচা দেওয়া লাগে না
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1506', 10, 10, 1, 0, 0, '[]', '2026-09-24T01:46:42.721+00:00', '2026-10-19T06:06:15.299378+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('659ea214-220f-4f7c-b4a8-c34699d02ed3', 'আমদানিকৃত গোল স্কোয়াশ বীজ (সবুজ)', 'imported-green-round-squash-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784203482-cjfwf1v.webp', NULL, 150, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[]', 'বীজ সংখ্যা প্যাকেট অনুযায়ী (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | সবুজ গোল স্কোয়াশ চাষের জন্য আমদানিকৃত উন্নতমানের বীজ।', '<h3>🌱 Product Short Description</h3><p><strong>আমদানিকৃত গোল স্কোয়াশ বীজ (সবুজ)</strong> সবুজ ও আকর্ষণীয় গোলাকৃতির স্কোয়াশ চাষের জন্য উপযোগী উন্নতমানের বীজ। সঠিক পরিচর্যা, পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও নিয়মিত পানি ব্যবস্থাপনায় সুস্থ ও শক্তিশালী গাছ গড়ে উঠতে সহায়ক। বাড়ির বাগান, ছাদবাগান, টব এবং বাণিজ্যিক চাষে ব্যবহার করা যায়।</p><h3>📋 পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> প্যাকেট অনুযায়ী (উচ্চ গুণমানসম্পন্ন)</li><li>🥒 <strong>ফসলের ধরন:</strong> গোল স্কোয়াশ</li><li>🟢 <strong>রং:</strong> সবুজ</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌍 <strong>উৎপত্তি:</strong> আমদানিকৃত</li><li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষ</li></ul><h3>🌤️ কোন কোন মৌশুমে ভালো হয়?</h3><p>গোল স্কোয়াশ উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় সাধারণত <strong>শীতের শেষ থেকে গ্রীষ্ম এবং বর্ষার শুরুর সময়</strong> চাষের জন্য উপযোগী।</p><p><strong>🌱 উপযুক্ত সময়:</strong></p><ul><li>🌸 <strong>শীতের শেষ:</strong> জানুয়ারি–ফেব্রুয়ারি</li><li>☀️ <strong>গ্রীষ্ম:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>🌧️ <strong>বর্ষার শুরু:</strong> মে–জুন, তবে পানি নিষ্কাশনের ভালো ব্যবস্থা থাকতে হবে</li></ul><p>অতিরিক্ত জলাবদ্ধতা ও দীর্ঘসময় ভেজা মাটি স্কোয়াশ গাছের শিকড়ের জন্য ক্ষতিকর হতে পারে। তাই বর্ষাকালে <strong>উঁচু বেড ও ভালো ড্রেনেজ</strong> নিশ্চিত করা জরুরি।</p><h3>🧑‍🌾 গোল স্কোয়াশ চাষের জন্য মাটি তৈরির বিস্তারিত নিয়ম</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>গোল স্কোয়াশের জন্য <strong>উর্বর দোআঁশ বা বেলে-দোআঁশ মাটি</strong> ভালো। মাটি ঝুরঝুরে, জৈব পদার্থসমৃদ্ধ এবং পানি নিষ্কাশনযোগ্য হওয়া প্রয়োজন। শক্ত ও পানি জমে থাকে এমন মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুত<p>প্রথমে জমির আগাছা, পুরোনো শিকড় ও মাটির দলা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার চাষ ও মই দিয়ে</strong> ভালোভাবে ঝুরঝুরে করে নিন। এতে শিকড় সহজে মাটির ভেতরে বিস্তার করতে পারে।</p>৩️⃣ জৈব সার মেশানো<p>প্রতি শতকে আনুমানিক <strong>৪০–৫০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিতে পারেন। পচা জৈব সার মাটির গঠন উন্নত করতে এবং গাছের বৃদ্ধিতে সহায়তা করে।</p>৪️⃣ উঁচু বেড তৈরি<p>স্কোয়াশের জন্য উঁচু বেড তৈরি করা ভালো। বিশেষ করে বর্ষাকালে বেড উঁচু রাখলে অতিরিক্ত পানি দ্রুত বের হয়ে যায়।</p><p>বেডের মাটি ঝুরঝুরে করে তৈরি করুন এবং গাছের লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন।</p>৫️⃣ টব বা ছাদবাগানের মাটি<p>টবে গোল স্কোয়াশ চাষের জন্য নিচের মিশ্রণ ব্যবহার করতে পারেন:</p><ul><li>🟤 <strong>৪০% দোআঁশ মাটি</strong></li><li>🌴 <strong>৩০% কোকোপিট</strong></li><li>🌿 <strong>২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</strong></li><li>🪨 <strong>১০% মোটা বালি বা পার্লাইট</strong></li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে করে নিন। টবের নিচে পর্যাপ্ত <strong>ড্রেনেজ হোল</strong> থাকা অত্যন্ত গুরুত্বপূর্ণ।</p>৬️⃣ বীজ বপনের প্রস্তুতি<p>বীজ বপনের আগে মাটি হালকা আর্দ্র করে নিন। স্কোয়াশের তুলনামূলক বড় বীজ সাধারণত অল্প গভীরে বপন করা হয়। বীজ খুব গভীরে না দিয়ে মাটি দিয়ে হালকাভাবে ঢেকে দিন।</p><p>বীজ অঙ্কুরোদগমের সময় মাটি শুকিয়ে যেতে দেবেন না, তবে অতিরিক্ত পানি দিয়ে জলাবদ্ধতাও তৈরি করবেন না।</p>৭️⃣ পর্যাপ্ত সূর্যালোক<p>স্কোয়াশ গাছের ভালো বৃদ্ধি ও ফলনের জন্য প্রতিদিন <strong>পর্যাপ্ত সরাসরি সূর্যালোক</strong> প্রয়োজন। ছাদ বা বাড়ির বাগানে এমন জায়গা নির্বাচন করুন যেখানে গাছ পর্যাপ্ত আলো পায়।</p>৮️⃣ পানি নিষ্কাশন<p>গাছের গোড়ায় পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে। তাই সেচের পর অতিরিক্ত পানি দ্রুত বের হয়ে যাওয়ার ব্যবস্থা রাখুন। বিশেষ করে বর্ষাকালে ড্রেনেজের দিকে বিশেষ নজর দিন।</p>৯️⃣ লতা ছড়ানোর জায়গা<p>গোল স্কোয়াশের গাছ মাটির ওপর লতা ছড়িয়ে বাড়তে পারে। তাই জমি বা ছাদবাগানে লতা ছড়ানোর জন্য পর্যাপ্ত জায়গা রাখুন। প্রয়োজনে শক্ত জালি বা সাপোর্ট ব্যবহার করে লতা পরিচালনা করা যেতে পারে।</p><p>💡 <strong>চাষের টিপস:</strong> ভালো ফলনের জন্য উর্বর মাটি, পর্যাপ্ত রোদ, সঠিক পানি ব্যবস্থাপনা, ভালো ড্রেনেজ এবং নিয়মিত আগাছা নিয়ন্ত্রণ নিশ্চিত করুন।</p>', 'VEG-1614', 3, 3, 1, 0, 5, '[]', '2026-10-01T11:40:34.031+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('49155bc7-fe0f-42fd-9791-b673f018cca8', 'হাইব্রিড ঢেঁড়স বীজ - ইম্পোর্টেড', 'imported-hybrid-baromasi-okra-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785416601725-4fhl8i1.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782994023302-rkmwliw.webp\"]', 150, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পপুলার\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৫ গ্রাম বা ৯০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, লম্বা, উচ্চ ফলনশীল ও রোগ সহনশীল ঢেঁড়স উৎপাদন করুন।', 'হাইব্রিড ঢেঁড়স (ইম্পোর্টেড) একটি উন্নত মানের ও উচ্চ ফলনশীল ঢেঁড়সের জাত, যা সারা বছর চাষের জন্য উপযোগী। গাছে প্রচুর পরিমাণে লম্বা, কোমল, সবুজ ও সুস্বাদু ঢেঁড়স ধরে। দ্রুত বৃদ্ধি, দীর্ঘ সময় ফলন এবং রোগ সহনশীল বৈশিষ্ট্যের কারণে এটি কৃষক ও শখের বাগানিদের কাছে অত্যন্ত জনপ্রিয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি আদর্শ নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৪০-৪৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1526', 2, 2, 1, 0, 6, '[]', '2026-09-24T01:48:44.764+00:00', '2026-10-17T05:26:04.982544+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e9529f9c-4f62-451e-afc4-5b5e47efa552', 'প্রিমিয়াম সাদা করলা (হাইব্রিড বীজ)', 'premium-white-bitter-gourd-hybrid-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949210637-ttz42n4.webp', NULL, 210, 70, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"আনকমন\",\"পপুলার\",\"প্রধান- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, আকর্ষণীয় সাদা রঙের, কম তিতকুটে ও উচ্চ ফলনশীল করলা উৎপাদন করুন।', '<h3>🌱 Product Short Description</h3>
<p><strong>প্রিমিয়াম সাদা করলা (হাইব্রিড বীজ)</strong> একটি উন্নতমানের ও উচ্চ ফলনশীল করলার জাত, যা দৃষ্টিনন্দন সাদা রঙের লম্বাটে ফল উৎপাদনের জন্য উপযোগী। সাধারণ করলার তুলনায় এর তিতকুটে স্বাদ তুলনামূলকভাবে মৃদু এবং ফল কোমল ও সুস্বাদু।</p>
<p>দ্রুত বৃদ্ধি, দীর্ঘসময় ফলন এবং ভালো রোগ সহনশীলতার কারণে এটি <strong>ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের</strong> জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে স্বাস্থ্যবান গাছ ও ভালো মানের সাদা করলা উৎপাদনে সহায়ক। 🥒 <strong>নিজের বাগানে আকর্ষণীয় সাদা করলা চাষ করতে আজই বীজ অর্ডার করুন!</strong></p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥒 <strong>জাত:</strong> প্রিমিয়াম সাদা করলা হাইব্রিড</li>
<li>🎨 <strong>ফলের রঙ:</strong> আকর্ষণীয় সাদা</li>
<li>🌱 <strong>ফলের ধরন:</strong> লম্বাটে, কোমল ও সুস্বাদু</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>করলা উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়ার ফসল। বাংলাদেশের আবহাওয়ায় বছরের বেশিরভাগ সময় করলা চাষ করা সম্ভব হলেও <strong>ফেব্রুয়ারি থেকে মে মাস</strong> পর্যন্ত সময়টি চাষের জন্য সবচেয়ে উপযোগী। এছাড়া বর্ষাকালেও উপযুক্ত পানি নিষ্কাশন ব্যবস্থা থাকলে চাষ করা যায়।</p>

<ul>
<li>☀️ <strong>গ্রীষ্ম ও খরা মৌসুম:</strong> ফেব্রুয়ারি–মে মাস বীজ বপনের জন্য সবচেয়ে উপযোগী সময়।</li>
<li>🌧️ <strong>বর্ষাকাল:</strong> জুন–জুলাই মাসেও দ্বিতীয় দফায় বীজ বপন করা যায়। তবে অতিরিক্ত পানি ও জলাবদ্ধতা অবশ্যই এড়িয়ে চলতে হবে।</li>
</ul>

<h3>🪴 করলা চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
করলা চাষের জন্য <strong>দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটি উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনযোগ্য হওয়া প্রয়োজন। অতিরিক্ত পানি জমে থাকে এমন জমি করলা চাষের জন্য উপযোগী নয়।</p>

<p><strong>২. জমি চাষ ও মাটি প্রস্তুত করুন</strong><br>
জমি বা মাটি <strong>২–৩ বার ভালোভাবে চাষ ও মই দিয়ে</strong> ঝুরঝুরে ও সমতল করে নিন। বড় মাটির ঢেলা ভেঙে আগাছা ও পুরোনো শিকড় পরিষ্কার করুন। করলার জন্য মাটির <strong>pH প্রায় ৬.০–৬.৭</strong> হলে ভালো ফলনের জন্য উপযোগী পরিবেশ তৈরি হয়।</p>

<p><strong>৩. বেড তৈরি করুন</strong><br>
জমি প্রস্তুত করার পর প্রায় <strong>সোয়া ৩ ফুট প্রশস্ত বেড</strong> তৈরি করুন। দুই বেডের মাঝখানে প্রায় <strong>২ ফুট নালা</strong> রাখলে অতিরিক্ত বৃষ্টির পানি দ্রুত বের হয়ে যেতে পারে এবং জলাবদ্ধতা কমানো যায়।</p>

<p><strong>৪. মাদা বা গর্ত তৈরি করুন</strong><br>
প্রতিটি মাদা বা গর্ত প্রায় <strong>৩০ সেমি × ৩০ সেমি × ৩০ সেমি</strong> আকারে তৈরি করুন। মাদার মাটির সঙ্গে ভালোভাবে পচা গোবর বা কম্পোস্ট এবং প্রয়োজনীয় সার মিশিয়ে নিন।</p>

<p><strong>৫. মাদা প্রস্তুত করে রাখুন</strong><br>
জৈব সার ও প্রয়োজনীয় সার মাটির সঙ্গে ভালোভাবে মিশিয়ে মাদা <strong>১০–১৫ দিন রেখে</strong> দিন। এরপর মাটি ঝুরঝুরে করে বীজ বপন করুন। এতে সার ও মাটি ভালোভাবে মিশে যাওয়ার সুযোগ পায়।</p>

<h3>🌱 টব বা ছাদবাগানের জন্য মাটি তৈরি</h3>
<p>টবে বা ছাদবাগানে সাদা করলা চাষের জন্য এমন মাটি ব্যবহার করুন যা ঝুরঝুরে এবং পানি নিষ্কাশনযোগ্য। নিচের মিশ্রণটি ব্যবহার করা যেতে পারে:</p>

<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপাদান ভালোভাবে মিশিয়ে টবে ব্যবহার করুন। করলা লতানো গাছ হওয়ায় পর্যাপ্ত জায়গার পাশাপাশি <strong>শক্ত মাচা বা ট্রেলিস</strong> তৈরি করা প্রয়োজন। টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন।</p>

<h3>💧 পানি ও পরিচর্যা</h3>
<ul>
<li>☀️ প্রতিদিন পর্যাপ্ত <strong>সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করুন।</li>
<li>💧 মাটির উপরিভাগ শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li>
<li>🌿 লতা বড় হওয়ার সঙ্গে সঙ্গে মাচা বা ট্রেলিসে তুলে দিন।</li>
<li>🌱 জমি বা টবের আশপাশের আগাছা নিয়মিত পরিষ্কার করুন।</li>
</ul>

<h3>🐛 প্রধান রোগবালাই ও প্রতিকার</h3>

<p><strong>১. মাছি পোকা (Fruit Fly)</strong><br>
ফলমাছি করলার ফলে ডিম পাড়ে এবং পরবর্তীতে আক্রান্ত ফল পচে যেতে পারে।</p>
<ul>
<li><strong>প্রতিকার:</strong> আক্রান্ত ফল দ্রুত সংগ্রহ করে নষ্ট বা মাটিচাপা দিন এবং প্রয়োজন অনুযায়ী অনুমোদিত ফেরোমন ফাঁদ ব্যবহার করুন।</li>
</ul>

<p><strong>২. জাব পোকা বা এফিড (Aphids)</strong><br>
এফিড সাধারণত কচি পাতা ও ডগার রস চুষে গাছকে দুর্বল করে দিতে পারে।</p>
<ul>
<li><strong>প্রতিকার:</strong> আক্রান্ত অংশ পর্যবেক্ষণ করুন এবং আক্রমণ বেশি হলে অনুমোদিত কীটনাশক বা জৈব বালাইনাশক লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</li>
</ul>

<p><strong>৩. সাদা গুঁড়ো রোগ (Powdery Mildew)</strong><br>
পাতার ওপর সাদা গুঁড়োর মতো আস্তরণ দেখা দিতে পারে এবং আক্রান্ত পাতা ধীরে ধীরে দুর্বল হয়ে যায়।</p>
<ul>
<li><strong>প্রতিকার:</strong> আক্রান্ত পাতা অপসারণ করুন এবং প্রয়োজন হলে অনুমোদিত সালফারভিত্তিক ছত্রাকনাশক লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</li>
</ul>

<p>💡 <strong>বিশেষ টিপস:</strong> করলা গাছের সুস্থ বৃদ্ধি ও দীর্ঘসময় ফলন পেতে পর্যাপ্ত সূর্যালোক, উর্বর মাটি, সঠিক পানি নিষ্কাশন এবং শক্ত মাচা নিশ্চিত করুন। নিয়মিত গাছ পর্যবেক্ষণ করলে রোগ ও পোকার আক্রমণ দ্রুত শনাক্ত করা সহজ হয়।</p>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏠 কিচেন গার্ডেন</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা পাত্র</li>
<li>🌱 বাড়ির বাগান</li>
<li>🚜 বাণিজ্যিক জমি</li>
</ul>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>বাড়ির বাগান, ছাদবাগান বা বাণিজ্যিক জমিতে আকর্ষণীয় সাদা রঙের কোমল ও সুস্বাদু করলা চাষ করতে আজই প্রিমিয়াম সাদা করলা হাইব্রিড বীজ অর্ডার করুন!</strong></p>', 'VEG-1543', 27, 27, 1, 0, 7, '[]', '2026-09-24T01:42:45.772+00:00', '2026-10-17T06:51:22.132504+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f27d1af1-879f-440c-928d-82412eee99d4', 'কয়েন প্ল্যান্ট ইনডোর প্ল্যান্ট/পয়সা পাতা গাছের বীজ', 'coin-plant-indoor-money-plant-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732431353-s8vj7tr.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783092243730-r9z97i6.webp\"]', 200, 35, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, আকর্ষণীয় গোলাকার পাতার ইনডোর গাছ, ঘর ও অফিস সাজানোর জন্য আদর্শ।', 'কয়েন প্ল্যান্ট ইনডোর প্ল্যান্ট/পয়সা পাতা গাছের বীজ দিয়ে সহজেই ঘর, অফিস বা বারান্দায় তৈরি করুন সবুজ ও নান্দনিক পরিবেশ। এর গোলাকার মুদ্রার মতো পাতা গাছটিকে অত্যন্ত আকর্ষণীয় করে তোলে এবং আধুনিক ইনডোর ডেকোরেশনে এটি বেশ জনপ্রিয়। টবেই সহজে চাষ করা যায় এবং সঠিক পরিচর্যায় দ্রুত বৃদ্ধি পায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি, ফলে সুস্থ ও সুন্দর ইনডোর গাছ পাওয়া সহজ হয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1508', 5, 5, 1, 0, 10, '[]', '2026-09-24T01:48:32.608+00:00', '2026-10-13T05:24:31.642917+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('041df811-3926-4c46-896b-6f234f127d19', 'স্ট্রফ্লাওয়ার / পেপার ফ্লাওয়ার হাই কোয়ালিটি ফুলের বীজ', 'strawflower-paper-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732450484-walx5gm.webp', NULL, 190, 65, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ ক্ষুদ্র দানা (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, কাগজের মতো দীর্ঘস্থায়ী রঙিন ফুল, টব ও বাগানের জন্য আদর্শ।', 'স্ট্রফ্লাওয়ার / পেপার ফ্লাওয়ার হাই কোয়ালিটি ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন কাগজের মতো শক্ত, রঙিন ও দীর্ঘস্থায়ী ফুলে। এই ফুল শুকিয়ে যাওয়ার পরও দীর্ঘদিন রঙ ও আকৃতি ধরে রাখে, তাই ড্রাই ফ্লাওয়ার, ফুলের তোড়া ও হোম ডেকোরেশনের জন্য অত্যন্ত জনপ্রিয়। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় গাছ দীর্ঘসময় ধরে প্রচুর আকর্ষণীয় ফুল উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ ক্ষুদ্র দানা (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1535', 0, 0, 0, 0, 10, '[]', '2026-09-24T01:42:37.45+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('92829086-6b30-46bb-9012-1f58e2ea88a8', 'ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ', 'imported-hybrid-purple-aster-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732433252-12bnjzi.webp', NULL, 150, 30, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, গাঢ় বেগুনি আকর্ষণীয় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</h3>
<p><strong>ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন গাঢ় বেগুনি রঙের মনোমুগ্ধকর ফুলে। আকর্ষণীয় রং ও সুন্দর ফুলের জন্য অ্যাস্টার বাগান, ছাদবাগান এবং বারান্দা সাজানোর একটি চমৎকার পছন্দ। হাইব্রিড জাতের এই ফুল উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় সুস্থ গাছ এবং প্রচুর ফুল উৎপাদনে সহায়তা করতে পারে। টব, গ্রো ব্যাগ, ফুলের বেড, বর্ডার ও খোলা বাগানে চাষের জন্য উপযোগী।

<h3>📦 Product Specifications</h3>
<ul>
<li><strong>পণ্যের নাম:</strong> ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</li>
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>ফুলের রং:</strong> গাঢ় বেগুনি</li>
<li><strong>জাত:</strong> হাইব্রিড</li>
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>চাষের স্থান:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগান</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>
<ul>
<li>💜 গাঢ় বেগুনি রঙের আকর্ষণীয় ফুল</li>
<li>🌱 হাইব্রিড জাত, উপযুক্ত পরিচর্যায় সুস্থ গাছের বৃদ্ধির জন্য উপযোগী</li>
<li>🌸 বাগানে সৌন্দর্য ও রঙের বৈচিত্র্য যোগ করে</li>
<li>🪴 টব, গ্রো ব্যাগ ও ছাদবাগানে চাষ করা যায়</li>
<li>🏡 বাড়ির আঙিনা, বারান্দা ও ফুলের বেড সাজাতে উপযোগী</li>
<li>🌼 অনুকূল পরিবেশে দীর্ঘ সময় ফুল পাওয়ার সম্ভাবনা থাকে</li>
</ul>

<h3>📅 অ্যাস্টার ফুল চাষের উপযুক্ত সময়</h3>
<p>অ্যাস্টার ফুল সাধারণত মৃদু ও তুলনামূলক শীতল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় <strong>শরৎকালের শেষ ভাগ থেকে শীতকাল</strong> অ্যাস্টার চাষের জন্য উপযোগী হতে পারে। সাধারণভাবে সেপ্টেম্বর থেকে ডিসেম্বরের মধ্যে বীজ বপনের পরিকল্পনা করা যায়; তবে সঠিক সময় অ্যাস্টারের জাত, স্থানীয় তাপমাত্রা ও আবহাওয়ার ওপর নির্ভর করে। অতিরিক্ত গরম, ভারী বৃষ্টি এবং জলাবদ্ধতা এড়িয়ে চলুন।

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>
<p>অ্যাস্টার ফুলের জন্য ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনযোগ্য দোআঁশ মাটি ভালো। উপযুক্ত মাটি শিকড়ের বৃদ্ধি, পুষ্টি গ্রহণ ও গাছের সুস্থ বিকাশে সহায়তা করে।</p>
<ul>
<li>মাটি ভালোভাবে কুপিয়ে বা ঝুরঝুরে করে নিন।</li>
<li>পাথর, আগাছা ও শক্ত মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li>মাটির সঙ্গে ভালোভাবে পচানো গোবর বা কম্পোস্ট মিশিয়ে নিন।</li>
<li>পানি জমে থাকার আশঙ্কা থাকলে উঁচু বেড তৈরি করুন।</li>
<li>টবের নিচে পর্যাপ্ত পানি নিষ্কাশনের ছিদ্র নিশ্চিত করুন।</li>
</ul>
<p><strong>সহজ মাটির মিশ্রণ:</strong> ৫০% দোআঁশ মাটি, ৩০% পচা কম্পোস্ট এবং ২০% কোকোপিট বা মোটা বালু মিশিয়ে টবের জন্য হালকা ও পানি নিষ্কাশনযোগ্য মাটি তৈরি করতে পারেন। মাটির ধরন অনুযায়ী অনুপাত সামান্য পরিবর্তন করা যায়।</p>

<h3>🌿 বীজ বপনের সঠিক পদ্ধতি</h3>
<p>অ্যাস্টারের বীজ ছোট হওয়ায় বপনের সময় সতর্কতা প্রয়োজন। বীজ সরাসরি প্রস্তুত টব বা বেডে বপন করা যায়, অথবা বীজতলায় চারা তৈরি করে পরে মূল স্থানে লাগানো যায়।</p>
<ul>
<li>বীজতলা বা পাত্রে ঝুরঝুরে ও হালকা আর্দ্র মাটি তৈরি করুন।</li>
<li>বীজ মাটির উপর সমানভাবে ছড়িয়ে দিন।</li>
<li>বীজের উপর খুব পাতলা মাটির স্তর দিন; অতিরিক্ত গভীরে পুঁতে দেবেন না।</li>
<li>স্প্রে বোতল দিয়ে হালকা পানি দিন, যাতে বীজ সরে না যায়।</li>
<li>অঙ্কুরোদগম না হওয়া পর্যন্ত মাটি হালকা আর্দ্র রাখুন, কিন্তু ভিজে কাদা করবেন না।</li>
<li>চারা কয়েকটি সত্যিকারের পাতা তৈরি করলে শিকড় অক্ষত রেখে সাবধানে প্রয়োজনীয় দূরত্বে রোপণ করুন।</li>
</ul>

<h3>🪴 টব ও ছাদবাগানে অ্যাস্টার চাষ</h3>
<p>বেগুনি অ্যাস্টার টব, গ্রো ব্যাগ, ছাদবাগান ও বারান্দায় চাষ করা যায়। গাছের শিকড়ের উপযুক্ত বৃদ্ধি নিশ্চিত করতে মাঝারি আকারের বা প্রয়োজন অনুযায়ী গভীর পাত্র বেছে নিন। টবে যেন অতিরিক্ত পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>
<p>পাত্রটি এমন জায়গায় রাখুন, যেখানে পর্যাপ্ত রোদ ও বাতাস চলাচলের ব্যবস্থা রয়েছে। এক পাত্রে অতিরিক্ত গাছ রাখবেন না; গাছের বৃদ্ধি অনুযায়ী পর্যাপ্ত ফাঁকা জায়গা রাখলে পরিচর্যা সহজ হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<p>অ্যাস্টার ফুলের ভালো বৃদ্ধির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৫–৬ ঘণ্টা বা তার বেশি রোদ পায় এমন স্থান উপযোগী হতে পারে। গাছের গোড়ার মাটি শুকাতে শুরু করলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত সেচ ও জলাবদ্ধতা এড়িয়ে চলুন, কারণ এতে শিকড় পচে যাওয়ার ঝুঁকি বাড়তে পারে।</p>

<h3>💧 সার ও নিয়মিত পরিচর্যা</h3>
<ul>
<li>মাটি তৈরির সময় পরিমিত পরিমাণে পচা কম্পোস্ট বা জৈব সার মিশিয়ে নিন।</li>
<li>গাছের বৃদ্ধি অনুযায়ী প্রয়োজন হলে পরিমিত সার প্রয়োগ করুন।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন এবং গাছের চারপাশ পরিচ্ছন্ন রাখুন।</li>
<li>শুকিয়ে যাওয়া ফুল ও ক্ষতিগ্রস্ত পাতা সরিয়ে ফেলুন।</li>
<li>গাছ অতিরিক্ত ঘন হলে বাতাস চলাচলের জন্য প্রয়োজনীয় জায়গা রাখুন।</li>
<li>অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন এবং সার ব্যবহারের নির্দেশনা অনুসরণ করুন।</li>
</ul>

<h3>🐛 রোগ ও পোকামাকড় ব্যবস্থাপনা</h3>
<p>গাছের পাতা, কাণ্ড ও গোড়া নিয়মিত পর্যবেক্ষণ করুন। পাতায় দাগ, পচন বা পোকামাকড়ের আক্রমণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন। পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন এবং মাটিতে পানি জমতে দেবেন না। সমস্যা বেশি হলে রোগ বা পোকা শনাক্ত করে স্থানীয়ভাবে অনুমোদিত বালাইনাশক পণ্যের লেবেল অনুযায়ী ব্যবস্থা নিন।</p>

<h3>🌼 ফুল ফোটা ও গাছের যত্ন</h3>
<p>উপযুক্ত মৌসুমে বপন, পর্যাপ্ত সূর্যালোক, সঠিক মাটি ও নিয়মিত পরিচর্যা অ্যাস্টার গাছের বৃদ্ধি ও ফুল ফোটাতে সহায়তা করে। গাছের জাত ও আবহাওয়া অনুযায়ী ফুল ফোটার সময় ভিন্ন হতে পারে। ফুলের বেডে অন্যান্য রঙের ফুলের সঙ্গে বেগুনি অ্যাস্টার লাগালে বাগানে সুন্দর রঙের বৈচিত্র্য তৈরি হয়।</p>

<h3>🏡 কোথায় বেগুনি অ্যাস্টার চাষ করা যায়?</h3>
<ul>
<li>🏠 বাড়ির আঙিনা ও সামনের বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🌿 বারান্দা ও ছোট বাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌸 ফুলের বেড ও বাগানের বর্ডার</li>
<li>💐 বাড়ি ও বাগানের সৌন্দর্যবর্ধক ফুলের আয়োজন</li>
</ul>

<h3>💜 কেন ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ চাষ করবেন?</h3>
<p>গাঢ় বেগুনি রঙের আকর্ষণীয় ফুল দিয়ে বাগান সাজাতে <strong>ইম্পোর্টেড হাইব্রিড বেগুনি অ্যাস্টার ফুলের বীজ</strong> একটি চমৎকার নির্বাচন। টব থেকে শুরু করে ছাদবাগান ও খোলা ফুলের বেড—বিভিন্ন স্থানে উপযুক্ত পরিবেশে এই ফুল চাষ করা যায়। নিয়মিত যত্নের মাধ্যমে নিজের বাগানে তৈরি করুন মনোমুগ্ধকর ফুলের সমাহার।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং আপনার বাগানকে সাজিয়ে তুলুন গাঢ় বেগুনি অ্যাস্টার ফুলে!</strong></p>', 'FUL-1509', 4, 4, 1, 0, 12, '[]', '2026-09-24T01:42:33.031+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e028df49-9012-4a59-bc76-7373f8d98a7a', 'হাইব্রিড সালাদ শসা বীজ', 'hybrid-salad-cucumber-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949193048-v3ieryg.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782993673106-mahn7gx.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785342575336-caxeflf.webp\"]', 150, 120, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, খাস্তা, রসালো ও তিতা-মুক্ত শসা উৎপাদন করুন, সালাদের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3>
<p><strong>বারোমাসি হাইব্রিড সালাদ শসা</strong> একটি উচ্চ ফলনশীল ও দ্রুত বর্ধনশীল জাত, যা লম্বা, খাস্তা ও রসালো শসা উৎপাদনের জন্য উপযোগী। এর ফল তিতা-মুক্ত, সুস্বাদু এবং সালাদ, স্যান্ডউইচ ও তাজা খাওয়ার জন্য অত্যন্ত উপযোগী।</p>

<p>সঠিক পরিচর্যা ও অনুকূল পরিবেশে দীর্ঘসময় ধরে ফলন দিতে সক্ষম এই শসা <strong>ছাদবাগান, কিচেন গার্ডেন, টব, গ্রো ব্যাগ এবং বাণিজ্যিক চাষের</strong> জন্য চমৎকার একটি নির্বাচন। পর্যাপ্ত সূর্যালোক, উর্বর মাটি, নিয়মিত পানি ও মাচা ব্যবস্থাপনার মাধ্যমে স্বাস্থ্যবান গাছ ও ভালো ফলন পেতে সহায়তা করতে পারে। 🥒</p>

<h3>📋 Product Specifications</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৬০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🥒 <strong>জাত:</strong> বারোমাসি হাইব্রিড সালাদ শসা</li>
<li>🌱 <strong>বৈশিষ্ট্য:</strong> উচ্চ ফলনশীল ও দ্রুত বর্ধনশীল</li>
<li>🥒 <strong>ফলের বৈশিষ্ট্য:</strong> লম্বা, খাস্তা, রসালো ও তিতা-মুক্ত</li>
<li>🥗 <strong>ব্যবহার:</strong> সালাদ, স্যান্ডউইচ ও তাজা খাওয়ার জন্য উপযোগী</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3>
<p>শসা উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়া পছন্দ করে। বারোমাসি হাইব্রিড সালাদ শসা বিভিন্ন মৌসুমে চাষ করা গেলেও অনুকূল তাপমাত্রা, পর্যাপ্ত আলো ও ভালো পানি নিষ্কাশন নিশ্চিত করা গুরুত্বপূর্ণ।</p>

<ul>
<li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — শসা চাষের জন্য ভালো সময়।</li>
<li>☀️ <strong>গ্রীষ্ম:</strong> এপ্রিল–জুন — পর্যাপ্ত পানি ও সেচের ব্যবস্থা থাকলে ভালোভাবে চাষ করা যায়।</li>
<li>🌧️ <strong>বর্ষার শুরু:</strong> পানি নিষ্কাশনের ভালো ব্যবস্থা থাকলে চাষ করা যায়।</li>
<li>🍂 <strong>শরৎ:</strong> অতিরিক্ত বৃষ্টি কমে গেলে অনুকূল পরিবেশে চাষ করা যেতে পারে।</li>
<li>❄️ <strong>শীতের মৃদু সময়:</strong> তুলনামূলক উষ্ণ এলাকায় রোদযুক্ত স্থানে চাষ করা সম্ভব।</li>
</ul>

<p>অতিরিক্ত ঠান্ডা, অতিরিক্ত বৃষ্টি ও দীর্ঘসময় জলাবদ্ধতা শসার বৃদ্ধি ও ফলনকে প্রভাবিত করতে পারে।</p>

<h3>🪴 সালাদ শসার জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3>

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>
শসার জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকা ভালো এবং পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p>

<p><strong>২. জমি ভালোভাবে প্রস্তুত করুন</strong><br>
প্রথমে জমি থেকে আগাছা ও আবর্জনা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে বা চাষ দিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে মাটি সমান করুন।</p>

<p><strong>৩. জৈব সার প্রয়োগ করুন</strong><br>
প্রতি শতক জমিতে আনুমানিক <strong>৪০–৫০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির উর্বরতা ও পানি ধারণক্ষমতা উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p>

<p><strong>৪. উঁচু বেড ও পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br>
শসা জলাবদ্ধতা পছন্দ করে না। তাই প্রয়োজন অনুযায়ী <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন। বর্ষাকালে ভালো ড্রেনেজ বিশেষভাবে গুরুত্বপূর্ণ।</p>

<p><strong>৫. মাচা বা ট্রেলিসের ব্যবস্থা করুন</strong><br>
লম্বা ও দ্রুত বর্ধনশীল শসার লতা মাটিতে ছড়িয়ে দেওয়ার পরিবর্তে শক্ত <strong>মাচা বা ট্রেলিস</strong> ব্যবহার করলে লতা সুশৃঙ্খলভাবে বেড়ে উঠতে পারে। এতে ফল মাটির সংস্পর্শে কম আসে এবং সংগ্রহ করাও সহজ হয়।</p>

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3>
<p>ছাদবাগান, টব বা গ্রো ব্যাগে সালাদ শসা চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p>

<ul>
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li>
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li>
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li>
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li>
</ul>

<p>সব উপকরণ ভালোভাবে মিশিয়ে ব্যবহার করুন। শসার শিকড় ও লতার বৃদ্ধির জন্য পর্যাপ্ত জায়গা দিতে তুলনামূলক বড় টব বা গ্রো ব্যাগ নির্বাচন করুন এবং নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন।</p>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>শসার বীজ সরাসরি জমি, টব বা গ্রো ব্যাগে বপন করা যায়। বীজ বপনের আগে মাটি ঝুরঝুরে ও আর্দ্র করে নিন। সাধারণভাবে বীজ <strong>প্রায় ২–৩ সেন্টিমিটার গভীরে</strong> বপন করা যায়।</p>

<p>বীজ বপনের পর হালকা পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দিয়ে বীজতলা বা টবে পানি জমিয়ে রাখবেন না। একাধিক গাছ হলে পর্যাপ্ত দূরত্ব রাখুন, যাতে লতা ও শিকড় ভালোভাবে বৃদ্ধি পেতে পারে।</p>

<p>চারা গজানোর পর গাছের পাশে দ্রুত মাচা বা ট্রেলিস স্থাপন করুন। লতা বড় হওয়ার সঙ্গে সঙ্গে মাচায় তুলে দিলে গাছের পরিচর্যা ও ফল সংগ্রহ সহজ হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<ul>
<li>🌞 প্রতিদিন <strong>৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li>
<li>💧 মাটি শুকিয়ে যাওয়ার আগেই প্রয়োজন অনুযায়ী নিয়মিত পানি দিন।</li>
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li>
<li>🌿 গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার রাখুন।</li>
<li>🪴 মাটি শক্ত হয়ে গেলে গোড়ার চারপাশের মাটি হালকা করে আলগা করুন।</li>
</ul>

<h3>🥒 ভালো ফলনের জন্য পরিচর্যার টিপস</h3>
<ul>
<li>🌞 পর্যাপ্ত সূর্যালোক নিশ্চিত করুন।</li>
<li>🪴 উর্বর ও পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন।</li>
<li>🌿 লতার জন্য শক্ত মাচা বা ট্রেলিস তৈরি করুন।</li>
<li>🍂 নিয়মিত পরিমাণমতো কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li>
<li>💧 ফল ধরার সময় মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখুন।</li>
<li>🐝 ফুল আসার সময় অতিরিক্ত কীটনাশক ব্যবহার এড়িয়ে চলুন, যাতে পরাগায়নকারী পোকামাকড়ের ক্ষতি না হয়।</li>
<li>🥒 শসা উপযুক্ত আকারে পৌঁছালে নিয়মিত সংগ্রহ করুন, এতে নতুন ফল ধরতে সহায়তা করতে পারে।</li>
<li>🐛 পাতা বা ফলে পোকামাকড় ও রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li>
</ul>

<h3>🌿 চাষের উপযুক্ত স্থান</h3>
<ul>
<li>🏡 কিচেন গার্ডেন</li>
<li>🌿 ছাদবাগান</li>
<li>🪴 বড় টব বা গ্রো ব্যাগ</li>
<li>🏠 বারান্দা বা পর্যাপ্ত রোদযুক্ত স্থান</li>
<li>🌱 সবজি বাগান</li>
<li>🚜 বাণিজ্যিক চাষের জমি</li>
</ul>

<h3>🥗 সালাদ শসার বিশেষ আকর্ষণ</h3>
<p>লম্বা, খাস্তা ও রসালো ফলের কারণে এই হাইব্রিড সালাদ শসা <strong>সালাদ, স্যান্ডউইচ এবং তাজা খাওয়ার</strong> জন্য বিশেষভাবে উপযোগী। তিতা-মুক্ত ও সুস্বাদু ফলের পাশাপাশি দ্রুত বর্ধনশীল লতা সঠিক পরিচর্যায় দীর্ঘসময় ধরে ফলন দিতে সহায়তা করতে পারে।</p>

<h3>🛒 অর্ডার করুন</h3>
<p><strong>ছাদবাগান, কিচেন গার্ডেন বা বাণিজ্যিক চাষে লম্বা, খাস্তা ও রসালো শসা চাষ করতে আজই বারোমাসি হাইব্রিড সালাদ শসার বীজ অর্ডার করুন! 🥒🌱</strong></p>', 'VEG-1553', 23, 23, 1, 0, 12, '[]', '2026-09-24T01:48:44.036+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('43a63026-cdaf-4f82-8054-d420e9669251', 'পিংক ইভনিং প্রিমরোজ (ইম্পোর্টেড ফুলের বীজ)', 'pink-evening-primrose-imported-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732444217-mt5si9f.webp', NULL, 190, 49, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"আগাম চাষ- শীতকাল\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, কোমল গোলাপি দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h2>পিংক ইভনিং প্রিমরোজ ফুলের বীজ (ইম্পোর্টেড)</h2>

<p>পিংক ইভনিং প্রিমরোজ (Pink Evening Primrose) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন কোমল গোলাপি রঙের মনোমুগ্ধকর ফুল। এই শোভাময় ফুলগাছটি বাগান, টব, ছাদবাগান, ফুলের বেড ও বর্ডার সাজানোর জন্য আকর্ষণীয় একটি পছন্দ। উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় গাছটি সুন্দরভাবে বেড়ে উঠতে পারে এবং ফুল ফোটার মৌসুমে বাগানে যোগ করতে পারে নান্দনিক সৌন্দর্য। উচ্চমানের আমদানিকৃত বীজ থেকে চারা তৈরি করে আপনার বাগানকে সাজিয়ে তুলুন রঙিন ফুলের সমারোহে।</p>

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌸 <strong>ফুলের রং:</strong> গোলাপি</li>
  <li>🌿 <strong>ব্যবহার:</strong> টব, ছাদবাগান, ফুলের বেড, বর্ডার ও খোলা বাগান</li>
  <li>🌍 <strong>বীজের ধরন:</strong> ইম্পোর্টেড ফুলের বীজ</li>
</ul>

<h3>পিংক ইভনিং প্রিমরোজ ফুলের বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🌸 কোমল গোলাপি ফুল বাগানে আকর্ষণীয় সৌন্দর্য যোগ করে।</li>
  <li>🪴 টব ও ছাদবাগানে চাষের জন্য উপযোগী।</li>
  <li>🌿 ফুলের বেড, বর্ডার ও খোলা বাগান সাজাতে ব্যবহার করা যায়।</li>
  <li>🏡 বাড়ির আঙিনা ও বাগানের সৌন্দর্য বাড়াতে সহায়ক।</li>
  <li>🌱 সঠিক মাটি, আলো ও পরিচর্যায় স্বাস্থ্যবান গাছ গড়ে তোলা সম্ভব।</li>
  <li>🌼 বাগানে অন্যান্য ফুলের গাছের সঙ্গে সাজিয়ে লাগালে দৃষ্টিনন্দন ফুলের বিন্যাস তৈরি করা যায়।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশের আবহাওয়ায় স্থানীয় তাপমাত্রা ও জাতের উপযোগিতা বিবেচনা করে বীজ বপন করুন। অতিরিক্ত গরম, ভারী বৃষ্টি ও জলাবদ্ধতার সময় নতুন চারা ক্ষতিগ্রস্ত হতে পারে। তাই নাতিশীতোষ্ণ আবহাওয়া এবং পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন স্থান বেছে নেওয়া ভালো। বীজের প্যাকেটে নির্দিষ্ট নির্দেশনা থাকলে সেটি অনুসরণ করুন।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>বীজ বপনের জন্য ঝুরঝুরে, হালকা ও পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন। বাগানের মাটির সঙ্গে পরিমিত পরিমাণে পচা জৈব সার ও কোকোপিট মিশিয়ে বীজতলার মিশ্রণ তৈরি করতে পারেন। মাটি যেন অতিরিক্ত শক্ত না হয় এবং পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>

<h3>বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে পরিষ্কার সিডলিং ট্রে, ছোট টব অথবা উপযুক্ত বীজতলা প্রস্তুত করুন।</li>
  <li>ট্রেতে ঝুরঝুরে বীজতলার মিশ্রণ ভরে মাটির উপরিভাগ সমান করে নিন।</li>
  <li>বীজগুলো সমানভাবে ছড়িয়ে দিন। বীজ খুব ছোট হলে অতিরিক্ত গভীরে বপন করবেন না।</li>
  <li>বীজের ধরন অনুযায়ী খুব হালকা মাটি দিয়ে ঢেকে দিন অথবা প্রয়োজন হলে উপরিভাগে রেখে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>বীজতলা হালকা আর্দ্র রাখুন এবং পানি জমতে দেবেন না।</li>
  <li>চারা যথেষ্ট শক্ত হলে শিকড়ের ক্ষতি না করে সাবধানে নির্দিষ্ট টব বা বাগানে স্থানান্তর করুন।</li>
</ol>

<h3>টব ও ছাদবাগানে চাষের পদ্ধতি</h3>
<p>পিংক ইভনিং প্রিমরোজ টব, ছাদবাগান কিংবা ফুলের বেডে চাষ করা যেতে পারে। টবের নিচে পানি বের হওয়ার ছিদ্র রাখুন। গাছের বৃদ্ধির ধরন অনুযায়ী উপযুক্ত আকারের টব নির্বাচন করুন এবং একাধিক গাছ লাগালে তাদের মধ্যে পর্যাপ্ত জায়গা রাখুন। এতে গাছের বৃদ্ধি, বাতাস চলাচল এবং পরিচর্যা সহজ হয়।</p>

<h3>সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> জাতের চাহিদা অনুযায়ী পর্যাপ্ত আলো পায় এমন স্থান নির্বাচন করুন। নতুন চারাকে তীব্র রোদে ধীরে ধীরে অভ্যস্ত করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির উপরিভাগ শুকাতে শুরু করলে প্রয়োজনমতো পানি দিন। অতিরিক্ত পানি দেওয়া ও জলাবদ্ধতা এড়িয়ে চলুন।</li>
  <li>🌬️ <strong>বাতাস চলাচল:</strong> গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন, যাতে অতিরিক্ত আর্দ্রতার কারণে রোগের ঝুঁকি না বাড়ে।</li>
</ul>

<h3>সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<p>চারা বেড়ে ওঠার সময় পরিমিত পরিমাণে পচা জৈব সার বা কম্পোস্ট ব্যবহার করতে পারেন। প্রয়োজনের অতিরিক্ত সার প্রয়োগ করবেন না, কারণ এতে গাছের স্বাভাবিক বৃদ্ধি ব্যাহত হতে পারে। শুকনো পাতা ও মরা ফুল থাকলে সরিয়ে দিন। নিয়মিত গাছ পর্যবেক্ষণ করুন এবং গাছের চারপাশ আগাছামুক্ত রাখুন।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>পাতা ও কচি ডগা নিয়মিত পরীক্ষা করুন। পোকামাকড়ের আক্রমণ বা রোগের লক্ষণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন এবং গাছের চারপাশ পরিষ্কার রাখুন। প্রয়োজন হলে ফুলগাছের উপযোগী অনুমোদিত বালাইনাশক পণ্যের লেবেল ও নিরাপত্তা নির্দেশনা মেনে ব্যবহার করুন।</p>

<h3>কোথায় লাগাবেন পিংক ইভনিং প্রিমরোজ?</h3>
<ul>
  <li>🌸 বাড়ির আঙিনা ও ফুলের বাগানে</li>
  <li>🪴 বারান্দা ও ছাদবাগানের টবে</li>
  <li>🌿 বাগানের ফুলের বেড ও বর্ডারে</li>
  <li>🏡 বাড়ি বা প্রবেশপথের পাশে সাজানো বাগানে</li>
  <li>🌼 অন্যান্য শোভাময় ফুলের গাছের সঙ্গে মিশ্র ফুলের বাগানে</li>
</ul>

<h3>কেন পিংক ইভনিং প্রিমরোজ ফুলের বীজ সংগ্রহ করবেন?</h3>
<p>বাগানে গোলাপি ফুলের কোমল সৌন্দর্য যোগ করতে পিংক ইভনিং প্রিমরোজ হতে পারে আকর্ষণীয় একটি নির্বাচন। আনুমানিক ৫০০০টি বীজের প্যাকেট থেকে পরিকল্পনা অনুযায়ী একাধিক স্থানে বীজ বপন করতে পারবেন। সঠিক বীজ বপন, উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যা গাছের সুস্থ বৃদ্ধি এবং ফুল ফোটার অনুকূল পরিবেশ তৈরি করতে সহায়তা করে। অঙ্কুরোদগম, ফুল ফোটার সময় ও গাছের ফলাফল আবহাওয়া, মাটি এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>আপনার বাগানকে গোলাপি ফুলের সৌন্দর্যে সাজাতে সংগ্রহ করুন <strong>পিংক ইভনিং প্রিমরোজ ইম্পোর্টেড ফুলের বীজ</strong>। মানসম্মত বীজ ও বাগান পরিচর্যার প্রতি যত্ন নিয়ে গড়ে তুলুন আপনার পছন্দের ফুলের বাগান। অর্ডার করুন <strong>Ss Seed Shop</strong> থেকে এবং আপনার বাগানে যোগ করুন নতুন রঙের ছোঁয়া।</p>
```', 'FUL-1514', 17, 17, 1, 0, 12, '[]', '2026-09-24T01:42:34.041+00:00', '2026-10-17T05:26:05.180595+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4517b9d4-eecb-4af4-b1e7-6b2ccf9d9e37', 'হাইব্রিড লম্বা মিষ্টি কুমড়া বীজ (আমদানিকৃত)', 'imported-hybrid-long-sweet-pumpkin-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364664320-oo9kaqi.webp', NULL, 150, 50, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পপুলার\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লম্বা আকৃতির, মিষ্টি, পুষ্টিকর ও উচ্চ ফলনশীল কুমড়া উৎপাদন করুন।', '<h2>হাইব্রিড লম্বা মিষ্টি কুমড়ার বীজ (আমদানিকৃত)</h2>

<p>হাইব্রিড লম্বা মিষ্টি কুমড়া একটি আকর্ষণীয় সবজি জাত, যা উপযুক্ত পরিবেশ ও সঠিক পরিচর্যায় লম্বা আকৃতির, সুন্দর রঙের এবং সুস্বাদু ফল উৎপাদনের জন্য চাষ করা হয়। এর শাঁস ঘন ও মিষ্টি স্বাদের হওয়ায় তরকারি, ভর্তা, স্যুপসহ বিভিন্ন ধরনের খাবার তৈরিতে ব্যবহার করা যায়। লতানো গাছের বৃদ্ধির জন্য পর্যাপ্ত জায়গা, উর্বর মাটি, সঠিক সার ব্যবস্থাপনা ও নিয়মিত পরিচর্যা নিশ্চিত করলে ভালো ফলনের সম্ভাবনা তৈরি হয়। পারিবারিক সবজি বাগান কিংবা পরিকল্পিত বাণিজ্যিক চাষের জন্য আমদানিকৃত হাইব্রিড লম্বা মিষ্টি কুমড়ার বীজ হতে পারে একটি আকর্ষণীয় পছন্দ।</p>

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🎃 <strong>ফসলের ধরন:</strong> মিষ্টি কুমড়া</li>
  <li>🌿 <strong>গাছের ধরন:</strong> লতানো সবজি গাছ</li>
  <li>🌍 <strong>বীজের ধরন:</strong> আমদানিকৃত হাইব্রিড বীজ</li>
  <li>🍲 <strong>ব্যবহার:</strong> তরকারি, ভর্তা, স্যুপ ও বিভিন্ন খাদ্য প্রস্তুত</li>
</ul>

<h3>হাইব্রিড লম্বা মিষ্টি কুমড়ার বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🎃 উপযুক্ত পরিচর্যায় লম্বা আকৃতির ফল উৎপাদনের সম্ভাবনা থাকে।</li>
  <li>🍲 মিষ্টি স্বাদের শাঁস বিভিন্ন রান্নায় ব্যবহার করা যায়।</li>
  <li>🌱 অনুকূল পরিবেশে গাছের বৃদ্ধি ও ফল ধারণ ভালো হতে পারে।</li>
  <li>🌿 লতানো গাছের জন্য পর্যাপ্ত জায়গা ও প্রয়োজনমতো মাচার ব্যবস্থা করা যায়।</li>
  <li>🏡 বাড়ির আঙিনা ও পারিবারিক সবজি বাগানে চাষ করা সম্ভব।</li>
  <li>🌾 উপযুক্ত চাষ ব্যবস্থাপনায় বাণিজ্যিক উৎপাদনের জন্যও বিবেচনা করা যায়।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশের উষ্ণ আবহাওয়ায় মিষ্টি কুমড়া চাষ করা যায়। তবে বীজ বপনের সময় স্থানীয় মৌসুম, তাপমাত্রা, বৃষ্টিপাত এবং জমির পানি নিষ্কাশনের অবস্থা বিবেচনা করুন। অতিরিক্ত জলাবদ্ধতা ও দীর্ঘসময় ভেজা মাটি বীজ এবং চারার ক্ষতি করতে পারে। তাই পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন জমি বা স্থান নির্বাচন করা জরুরি। বীজের প্যাকেটে নির্দিষ্ট নির্দেশনা থাকলে সেটিকে অগ্রাধিকার দিন।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>মিষ্টি কুমড়া চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। জমি ভালোভাবে প্রস্তুত করে পরিমিত পরিমাণে পচা গোবর বা কম্পোস্ট মিশিয়ে নিন। জমিতে পানি জমার আশঙ্কা থাকলে উঁচু মাদা বা বেড তৈরি করে চাষ করুন। টবে চাষ করতে চাইলে বড় আকারের পাত্র বা গ্রো ব্যাগ ব্যবহার করুন, যাতে শিকড় ও লতা বৃদ্ধির পর্যাপ্ত জায়গা থাকে।</p>

<h3>বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে জমি, মাদা, বড় টব অথবা চারা তৈরির পাত্র প্রস্তুত করুন।</li>
  <li>মাটির সঙ্গে পরিমিত পরিমাণে পচা জৈব সার মিশিয়ে নিন।</li>
  <li>প্রতিটি মাদায় কয়েকটি বীজ বপন করতে পারেন; পরে সুস্থ ও সবল চারা রেখে অতিরিক্ত চারা তুলে দিন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>বীজ বপনের পর আলতোভাবে পানি দিন এবং মাটি হালকা আর্দ্র রাখুন।</li>
  <li>চারা গজানোর পর দুর্বল চারা সরিয়ে দিন, যাতে সবল গাছ পর্যাপ্ত জায়গা পায়।</li>
  <li>লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজনমতো মাচার ব্যবস্থা করুন।</li>
</ol>

<h3>জমি ও ছাদবাগানে চাষের পদ্ধতি</h3>
<p>হাইব্রিড লম্বা মিষ্টি কুমড়া জমি, বাড়ির আঙিনা অথবা পর্যাপ্ত জায়গাযুক্ত ছাদবাগানে চাষ করা যেতে পারে। জমিতে চাষ করলে লতা ছড়িয়ে পড়ার জন্য যথেষ্ট জায়গা রাখুন। ছাদবাগানে চাষের ক্ষেত্রে বড় ও মজবুত টব বা গ্রো ব্যাগ ব্যবহার করুন এবং ছাদের ভারবহন ক্ষমতা বিবেচনায় রাখুন। মাচায় লতা তুলতে চাইলে ফলের ওজন বহন করতে সক্ষম শক্ত কাঠামো তৈরি করুন।</p>

<h3>সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন স্থান নির্বাচন করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির আর্দ্রতা অনুযায়ী নিয়মিত পানি দিন, বিশেষ করে গাছের বৃদ্ধি ও ফল গঠনের সময়।</li>
  <li>🚿 <strong>জলাবদ্ধতা:</strong> গাছের গোড়ায় পানি জমতে দেবেন না; অতিরিক্ত ভেজা মাটি শিকড়ের ক্ষতি করতে পারে।</li>
  <li>🌿 <strong>লতার যত্ন:</strong> লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজন হলে লতাকে সঠিক দিকে পরিচালিত করুন।</li>
</ul>

<h3>সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা গোবর, কম্পোস্ট এবং প্রয়োজনীয় পুষ্টি উপাদান সরবরাহ করুন। সুষম সার ব্যবস্থাপনা অনুসরণ করুন এবং অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। গাছের গোড়ার আগাছা পরিষ্কার রাখুন, লতা ও পাতার অবস্থা নিয়মিত পর্যবেক্ষণ করুন এবং প্রয়োজনমতো পরিচর্যা করুন।</p>

<h3>পরাগায়ন ও ফলের যত্ন</h3>
<p>কুমড়ার ফুল থেকে ফল গঠনের জন্য পরাগায়ন গুরুত্বপূর্ণ। বাগানে মৌমাছি ও অন্যান্য উপকারী পরাগবাহীর উপস্থিতি বজায় রাখতে সহায়ক পরিবেশ তৈরি করুন। ফুল ফোটার সময় কীটনাশকের অপ্রয়োজনীয় ব্যবহার এড়িয়ে চলুন। ফল বড় হতে শুরু করলে ফলের নিচে পরিষ্কার ও শুকনো খড় বা উপযুক্ত উপকরণ দেওয়া যেতে পারে, যাতে ফল সরাসরি ভেজা মাটির সংস্পর্শে না থাকে।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>কুমড়া গাছে ফলের মাছি, জাবপোকা এবং পাতায় বিভিন্ন রোগের লক্ষণ দেখা দিতে পারে। নিয়মিত পাতা, কচি ডগা ও ফল পরীক্ষা করুন। আক্রান্ত অংশ সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। প্রয়োজন হলে ফসলের জন্য অনুমোদিত বালাইনাশক পণ্যের লেবেল ও নিরাপত্তা নির্দেশনা মেনে ব্যবহার করুন। ফুল ফোটা ও পরাগায়নের সময় উপকারী পোকামাকড়ের সুরক্ষায় বিশেষ সতর্ক থাকুন।</p>

<h3>ফসল সংগ্রহ ও সংরক্ষণ</h3>
<p>ফলের জাত ও ব্যবহারের উদ্দেশ্য অনুযায়ী উপযুক্ত পরিপক্বতায় মিষ্টি কুমড়া সংগ্রহ করুন। ফল কাটার সময় ডাঁটার কিছু অংশ রেখে সাবধানে কাটুন, যাতে ফলের গায়ে আঘাত না লাগে। সংরক্ষণের আগে ফলের গায়ে অতিরিক্ত আর্দ্রতা থাকতে দেবেন না এবং ক্ষতিগ্রস্ত ফল আলাদা রাখুন। ফলের সংরক্ষণকাল জাত, পরিপক্বতা ও সংরক্ষণের পরিবেশের ওপর নির্ভর করে।</p>

<h3>কোথায় চাষ করবেন?</h3>
<ul>
  <li>🌾 বাড়ির আঙিনা ও পারিবারিক সবজি বাগানে</li>
  <li>🚜 কৃষিজমি ও উঁচু বেডে</li>
  <li>🌿 পর্যাপ্ত জায়গাযুক্ত খোলা বাগানে</li>
  <li>🏡 বড় টব বা গ্রো ব্যাগে</li>
  <li>🧑‍🌾 পারিবারিক চাহিদা অথবা পরিকল্পিত বাণিজ্যিক চাষে</li>
</ul>

<h3>কেন হাইব্রিড লম্বা মিষ্টি কুমড়ার বীজ বেছে নেবেন?</h3>
<p>নিজের বাগানে লম্বা আকৃতির মিষ্টি কুমড়া চাষ করতে চাইলে এই আমদানিকৃত হাইব্রিড বীজ হতে পারে একটি আকর্ষণীয় বিকল্প। আনুমানিক ৫০টি বীজের এই প্যাকেটটি পারিবারিক বাগান বা সীমিত পরিসরে চাষের পরিকল্পনায় ব্যবহার করতে পারেন। উপযুক্ত মাটি, পর্যাপ্ত সূর্যালোক, সুষম সার, নিয়মিত পানি এবং সঠিক পরিচর্যা গাছের বৃদ্ধি ও ফল ধারণে সহায়তা করে। ফলের আকার, স্বাদ, ফলন ও সংরক্ষণক্ষমতা জাতের বৈশিষ্ট্য, আবহাওয়া এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>নিজের বাগানে মিষ্টি কুমড়া চাষের পরিকল্পনা করছেন? সংগ্রহ করুন <strong>হাইব্রিড লম্বা মিষ্টি কুমড়ার আমদানিকৃত বীজ</strong> <strong>Ss Seed Shop</strong> থেকে। সঠিক পরিচর্যার মাধ্যমে আপনার বাগানে গড়ে তুলুন সবুজ লতা ও সতেজ সবজির সমারোহ।</p>
```', 'VEG-1576', 13, 13, 1, 0, 12, '[]', '2026-09-24T01:42:39.567+00:00', '2026-10-17T05:26:05.167014+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('91754479-12bf-437e-9d27-fbcbcaa2aa85', 'স্যাটিস বা সি ল্যাভেন্ডার ফুলের বীজ', 'statice-sea-lavender-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732447219-kojuoxv.webp', NULL, 190, 40, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ৩০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, কাগজের মতো দীর্ঘস্থায়ী রঙিন ফুল, টব ও বাগানের জন্য আদর্শ।', 'স্যাটিস বা সি ল্যাভেন্ডার ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন কাগজের মতো টেকসই ও দৃষ্টিনন্দন রঙিন ফুলে। এই ফুলটি দীর্ঘসময় সতেজ থাকে এবং শুকনো ফুল (Dry Flower) তৈরির জন্য বিশ্বজুড়ে অত্যন্ত জনপ্রিয়। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুল উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৩০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1536', 2, 2, 1, 0, 12, '[]', '2026-09-24T01:42:37.621+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('68309280-949d-4c6a-8f00-bf8b90a16812', 'হাই-কোয়ালিটি ল্যাভেন্ডার (Lavender) বীজ', 'high-quality-lavender-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732431989-eqfjvjb.webp', NULL, 190, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মনোমুগ্ধকর সুগন্ধি বেগুনি ফুল, টব, ছাদবাগান ও বাগানের জন্য আদর্শ।', 'হাই-কোয়ালিটি ল্যাভেন্ডার (Lavender) বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন মনোমুগ্ধকর সুগন্ধি ও আকর্ষণীয় বেগুনি ফুল। ল্যাভেন্ডার তার মনোরম সুবাস, সৌন্দর্য এবং শোভাময় বৈশিষ্ট্যের জন্য বিশ্বজুড়ে অত্যন্ত জনপ্রিয়। এটি টব, ছাদবাগান, বারান্দা এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ ও দীর্ঘসময় ধরে ফুল পাওয়া যায়। এছাড়াও ল্যাভেন্ডারের সুগন্ধ চারপাশের পরিবেশকে আরও সতেজ ও মনোরম করে তোলে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1537', 7, 7, 1, 0, 12, '[]', '2026-09-24T01:42:37.787+00:00', '2026-10-18T04:12:52.504338+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d8550398-2bd3-4675-baa2-58448bb25dfe', 'পিংক জিপসি (বেবি\'স ব্রেথ) ফুলের বীজ', 'pink-gypsophila-babys-breath-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732438205-99e2npf.webp', NULL, 150, 49, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"সেরা পণ্য\",\"আনকমন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৩০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, কোমল গোলাপি ফুলের গুচ্ছ, ফুলের বেড, টব ও বাগানের জন্য আদর্শ।', '<h2>পিংক জিপসি (বেবি’স ব্রেথ) ফুলের বীজ – Pink Gypsy Baby’s Breath</h2>

<p>পিংক জিপসি (বেবি’স ব্রেথ) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অসংখ্য ছোট ছোট কোমল গোলাপি ফুলের মনোমুগ্ধকর গুচ্ছ। হালকা ও মেঘের মতো ফুলের সৌন্দর্যের জন্য বেবি’স ব্রেথ ফুল বিশেষভাবে আকর্ষণীয়। ফুলের বেড, বর্ডার, টব, ছাদবাগান এবং ফুলের তোড়া সাজাতে এই শোভাময় ফুল ব্যবহার করা যায়। সঠিক পরিবেশ ও যত্নে গাছ বেড়ে উঠলে বাগানে তৈরি হতে পারে গোলাপি ফুলের সুন্দর সমারোহ। ফুলপ্রেমীদের সংগ্রহে ভিন্নধর্মী সৌন্দর্য যোগ করতে পিংক জিপসি হতে পারে একটি চমৎকার পছন্দ।</p>

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৩০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🌸 <strong>ফুলের রং:</strong> গোলাপি</li>
  <li>🌿 <strong>ব্যবহার:</strong> ফুলের বেড, বর্ডার, টব, ছাদবাগান ও ফুলের সাজসজ্জা</li>
</ul>

<h3>পিংক জিপসি ফুলের বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🌸 ছোট ছোট গোলাপি ফুলের গুচ্ছ বাগানে কোমল ও আকর্ষণীয় সৌন্দর্য যোগ করে।</li>
  <li>☁️ হালকা ও মেঘের মতো ফুলের বিন্যাস ফুলের বাগানকে দৃষ্টিনন্দন করে তোলে।</li>
  <li>🪴 টব ও ছাদবাগানে উপযুক্ত পরিবেশে চাষ করা যায়।</li>
  <li>🌿 ফুলের বেড ও বর্ডার সাজাতে ব্যবহার করা যায়।</li>
  <li>💐 ফুলের তোড়া ও বিভিন্ন ধরনের ফুলের সাজসজ্জায় মানানসই।</li>
  <li>🏡 বাড়ির আঙিনা ও শখের বাগানে বৈচিত্র্য আনতে সহায়ক।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশের আবহাওয়ায় স্থানীয় তাপমাত্রা ও জাতের উপযোগিতা বিবেচনা করে বীজ বপন করুন। অতিরিক্ত গরম, ভারী বৃষ্টি ও জলাবদ্ধতা থেকে নতুন চারাকে রক্ষা করা জরুরি। আবহাওয়া অনুকূলে থাকলে এবং পর্যাপ্ত আলো-বাতাস পাওয়া যায় এমন স্থানে বীজতলা তৈরি করুন। বীজের প্যাকেটে নির্দিষ্ট মৌসুম বা বপনসংক্রান্ত নির্দেশনা থাকলে সেটি অনুসরণ করুন।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>পিংক জিপসি ফুলের বীজ বপনের জন্য ঝুরঝুরে, হালকা ও পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন। বাগানের মাটির সঙ্গে পরিমিত পরিমাণে পচা জৈব সার ও কোকোপিট মিশিয়ে বীজতলার মিশ্রণ তৈরি করা যায়। মাটি যেন অতিরিক্ত শক্ত না হয় এবং পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>

<h3>বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে পরিষ্কার সিডলিং ট্রে, ছোট টব অথবা উপযুক্ত বীজতলা প্রস্তুত করুন।</li>
  <li>বীজতলায় ঝুরঝুরে মাটির মিশ্রণ ভরে উপরিভাগ সমান করে নিন।</li>
  <li>বীজগুলো মাটির উপরিভাগে সমানভাবে ছড়িয়ে দিন।</li>
  <li>বীজ ছোট হলে খুব গভীরে পুঁতে দেবেন না। জাতের নির্দেশনা অনুযায়ী প্রয়োজনে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>বীজতলা হালকা আর্দ্র রাখুন, তবে অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li>চারা যথেষ্ট শক্ত হলে শিকড়ের ক্ষতি না করে সাবধানে নির্দিষ্ট টব বা বাগানে স্থানান্তর করুন।</li>
</ol>

<h3>টব ও ছাদবাগানে চাষের পদ্ধতি</h3>
<p>পিংক জিপসি ফুল টব, ছাদবাগান কিংবা বাগানের নির্দিষ্ট ফুলের বেডে চাষ করা যেতে পারে। টবের নিচে পানি বের হওয়ার ছিদ্র রাখুন এবং গাছের বৃদ্ধির ধরন অনুযায়ী উপযুক্ত আকারের পাত্র নির্বাচন করুন। একাধিক গাছ লাগালে পর্যাপ্ত দূরত্ব রাখুন, যাতে গাছের মধ্যে আলো ও বাতাস চলাচল করতে পারে। ফুলের বেডে সারিবদ্ধভাবে বা অন্যান্য উপযুক্ত ফুলের গাছের সঙ্গে লাগালে সুন্দর ফুলের বিন্যাস তৈরি করা যায়।</p>

<h3>সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> পর্যাপ্ত আলো পায় এমন স্থান নির্বাচন করুন। নতুন চারাকে তীব্র রোদে ধীরে ধীরে অভ্যস্ত করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির উপরিভাগ শুকাতে শুরু করলে প্রয়োজনমতো পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li>
  <li>🌬️ <strong>বাতাস চলাচল:</strong> গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন, যাতে অতিরিক্ত আর্দ্রতায় রোগের ঝুঁকি না বাড়ে।</li>
</ul>

<h3>সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<p>গাছের সুস্থ বৃদ্ধি বজায় রাখতে পরিমিত পরিমাণে পচা জৈব সার বা কম্পোস্ট ব্যবহার করতে পারেন। অতিরিক্ত সার প্রয়োগ না করে গাছের বৃদ্ধি ও মাটির অবস্থা অনুযায়ী সার দিন। শুকনো পাতা ও মরা ফুল সরিয়ে ফেলুন এবং গাছের চারপাশ আগাছামুক্ত রাখুন। নিয়মিত পরিচর্যা গাছকে সুস্থ রাখতে এবং ফুল ফোটার অনুকূল পরিবেশ তৈরি করতে সহায়তা করে।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>নিয়মিত গাছের পাতা ও কচি ডগা পরীক্ষা করুন। পোকামাকড় বা রোগের লক্ষণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন এবং গাছের চারপাশ পরিষ্কার রাখুন। প্রয়োজন হলে ফুলগাছের উপযোগী অনুমোদিত বালাইনাশক পণ্যের লেবেল ও নিরাপত্তা নির্দেশনা অনুসরণ করে ব্যবহার করুন।</p>

<h3>কোথায় ব্যবহার করবেন?</h3>
<ul>
  <li>🌸 বাড়ির আঙিনা ও শখের ফুলের বাগানে</li>
  <li>🪴 বারান্দা ও ছাদবাগানের টবে</li>
  <li>🌿 ফুলের বেড ও বর্ডার সাজাতে</li>
  <li>💐 ফুলের তোড়া ও বিভিন্ন ফুলের সাজসজ্জায়</li>
  <li>🏡 অন্যান্য শোভাময় ফুলের গাছের সঙ্গে মিশ্র ফুলের বাগান তৈরি করতে</li>
</ul>

<h3>কেন পিংক জিপসি ফুলের বীজ বেছে নেবেন?</h3>
<p>বাগানে কোমল গোলাপি রঙের ছোট ছোট ফুলের গুচ্ছ দেখতে চাইলে পিংক জিপসি একটি আকর্ষণীয় বিকল্প। আনুমানিক ৩০০টি বীজের এই প্যাকেট দিয়ে আপনার বাগানের উপযোগী স্থানে বীজ বপন করতে পারবেন। সঠিক বীজ বপন, উপযুক্ত আলো, পানি নিষ্কাশন এবং নিয়মিত পরিচর্যা গাছের সুস্থ বৃদ্ধিতে সহায়তা করে। অঙ্কুরোদগম, ফুল ফোটার সময় ও ফুলের পরিমাণ আবহাওয়া, মাটি এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>আপনার বাগানকে ছোট ছোট গোলাপি ফুলের সৌন্দর্যে সাজাতে সংগ্রহ করুন <strong>পিংক জিপসি (বেবি’স ব্রেথ) ফুলের বীজ</strong>। বাগান, টব কিংবা ছাদবাগানে নতুন সৌন্দর্য যোগ করতে আজই অর্ডার করুন <strong>Ss Seed Shop</strong> থেকে।</p>
```', 'FUL-1515', 9, 9, 1, 0, 12, '[]', '2026-09-24T01:42:34.193+00:00', '2026-10-12T11:24:28.52542+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('7fc5bfa1-af14-404a-b9d0-faec8f3443d5', 'বেলুন ফ্লাওয়ার বীজ', 'balloon-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732447785-pa1zsqs.webp', NULL, 120, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\",\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ১০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বেলুনের মতো কুঁড়ি ও তারকাকৃতি ফুল, টব ও বাগানের জন্য আদর্শ।', 'বেলুন ফ্লাওয়ার বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অনন্য সৌন্দর্যের বেলুন আকৃতির কুঁড়ি ও তারকাকৃতি দৃষ্টিনন্দন ফুল। ফুল ফোটার আগে কুঁড়িগুলো ছোট বেলুনের মতো ফুলে ওঠে, যা এই গাছটির বিশেষ আকর্ষণ। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুল উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1525', 1, 1, 1, 0, 12, '[]', '2026-09-24T01:42:35.849+00:00', '2026-10-13T05:24:31.642917+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9fa964b9-a6e6-4c9a-910e-bacf2b3851a0', 'সুগন্ধি সুইট অ্যালিসাম ফুলের বীজ (মিক্স কালার)', 'sweet-alyssum-mixed-color-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732426932-fhrme64.webp', NULL, 120, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"পপুলার\",\"আনকমন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, সুগন্ধি মিশ্র রঙের ফুল, বর্ডার, টব ও ছাদবাগান সাজানোর জন্য আদর্শ।', 'সুগন্ধি সুইট অ্যালিসাম ফুলের বীজ (মিক্স কালার) দিয়ে আপনার বাগানে ফুটিয়ে তুলুন সাদা, গোলাপি, বেগুনি ও ল্যাভেন্ডার রঙের ছোট ছোট মনোমুগ্ধকর ফুল। মিষ্টি সুগন্ধযুক্ত এই ফুল গুচ্ছাকারে ফোটে এবং টব, ঝুলন্ত টব, বর্ডার, ছাদবাগান ও ল্যান্ডস্কেপ সাজানোর জন্য অত্যন্ত জনপ্রিয়। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল ফোটে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ২,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1534', 1, 1, 1, 0, 12, '[]', '2026-09-24T01:42:37.259+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c70b5d29-61f9-4b14-85dc-a471bbd9c8f0', 'প্রিমিয়াম কোয়ালিটি ফ্লক্স ফুল বীজ', 'premium-phlox-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732433818-btaoepi.webp', NULL, 120, 50, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, গুচ্ছাকারে রঙিন ফুল ফোটে, টব, ছাদবাগান ও বাগানের জন্য আদর্শ।', 'প্রিমিয়াম কোয়ালিটি ফ্লক্স ফুল বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন গুচ্ছাকারে ফোটা মনোমুগ্ধকর রঙিন ফুলে। ফ্লক্স তার দীর্ঘস্থায়ী ফুল, উজ্জ্বল রঙ এবং সহজ পরিচর্যার জন্য অত্যন্ত জনপ্রিয়। টব, ছাদবাগান, বারান্দা, ফুলের বেড ও বাগানের বর্ডারে চাষের জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ ও দীর্ঘসময় ধরে প্রচুর ফুল পাওয়া যায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1516', 6, 6, 1, 0, 12, '[]', '2026-09-24T01:42:34.379+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('518728bd-e41b-4c1b-a8fa-5bde481828c4', 'বিড়ালের হজম ও হেয়ারবল সমস্যার সমাধানে প্রিমিয়াম ক্যাট গ্রাস বীজ', 'premium-cat-grass-seeds-for-cats', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732430776-kwgnmri.webp', NULL, 140, 35, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\"]', 'আনুমানিক ১,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, দ্রুত বেড়ে ওঠে, বিড়ালের হজমে সহায়ক ও হেয়ারবল নিয়ন্ত্রণে উপকারী।', 'বিড়ালের হজম ও হেয়ারবল সমস্যার সমাধানে প্রিমিয়াম ক্যাট গ্রাস বীজ আপনার প্রিয় বিড়ালের জন্য একটি প্রাকৃতিক ও নিরাপদ সবুজ ঘাস উৎপাদনের আদর্শ উপায়। ক্যাট গ্রাস বিড়ালের হজম প্রক্রিয়াকে সহায়তা করে, পাকস্থলীতে জমে থাকা হেয়ারবল সহজে বের হতে সাহায্য করে এবং প্রয়োজনীয় প্রাকৃতিক আঁশ (ফাইবার) সরবরাহ করে। এটি ঘরের ভেতরে টব বা ছোট ট্রেতে খুব সহজেই চাষ করা যায় এবং অল্প সময়ের মধ্যেই কোমল সবুজ ঘাস গজিয়ে ওঠে, যা বিড়াল আনন্দের সঙ্গে খেতে পারে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1523', 0, 0, 0, 0, 12, '[]', '2026-09-24T01:42:35.527+00:00', '2026-10-15T07:34:04.500873+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f32913a3-aaa8-4a78-ab11-c9827dd97ed1', 'হাইব্রিড ডাবল হলিহক ফুলের বীজ (মাল্টিকালার)', 'hybrid-double-hollyhock-multicolor-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732441519-akzi8qn.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\",\"বসন্তকাল\"]', 'আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মাল্টিকালার ডাবল পাপড়ির বড় ফুল, টব ও বাগানের জন্য আদর্শ।', 'হাইব্রিড ডাবল হলিহক ফুলের বীজ (মাল্টিকালার) দিয়ে আপনার বাগানকে সাজিয়ে তুলুন বড় আকৃতির বহুস্তরযুক্ত (ডাবল) পাপড়ির দৃষ্টিনন্দন ফুলে। এই হাইব্রিড জাতটি লাল, গোলাপি, হলুদ, সাদা, বেগুনি ও অন্যান্য উজ্জ্বল রঙের ফুল ফোটায়, যা বাগানের সৌন্দর্য বহুগুণ বাড়িয়ে তোলে। লম্বা দণ্ডজুড়ে সারিবদ্ধভাবে ফোটা এই ফুল টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানের জন্য অত্যন্ত উপযোগী। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল পাওয়া যায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1541', 5, 5, 1, 0, 13, '[]', '2026-09-24T01:42:38.432+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('370b2f19-c507-408c-9feb-033a0d1c8f22', 'রঙিন সন্ধ্যামালতী ফুলের বীজ - মাল্টিকালার মিক্স', 'multicolor-four-oclock-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732444803-wrj12mc.webp', NULL, 190, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মাল্টিকালার সুগন্ধি ফুল, বিকেল থেকে রাতে ফোটে, টব ও বাগানের জন্য আদর্শ।', 'রঙিন সন্ধ্যামালতী ফুলের বীজ - মাল্টিকালার মিক্স দিয়ে আপনার বাগানকে সাজিয়ে তুলুন লাল, গোলাপি, হলুদ, সাদা ও অন্যান্য রঙের মনোমুগ্ধকর ফুলে। সন্ধ্যার পর ফুল ফুটতে শুরু করে এবং মিষ্টি সুগন্ধে চারপাশ ভরে তোলে, যা এই গাছটিকে বিশেষ আকর্ষণীয় করে। টব, ছাদবাগান, বারান্দা, ফুলের বেড এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় গাছ দীর্ঘসময় ধরে প্রচুর ফুল উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1532', 9, 9, 1, 0, 15, '[]', '2026-09-24T01:42:36.947+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('1ef9d957-cdb4-4fb2-a9c0-728b7fc0ca41', 'হাইব্রিড চাল কুমড়া বীজ', 'hybrid-wax-gourd-winter-melon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949187342-w2cwlmd.webp', NULL, 120, 65, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"হাইব্রিড\",\"সেরা পণ্য\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৩৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড় আকৃতির, সাদা আবরণযুক্ত, উচ্চ ফলনশীল ও দীর্ঘদিন সংরক্ষণযোগ্য চাল কুমড়া উৎপাদন করুন।', '<h2>হাইব্রিড চাল কুমড়ার বীজ (Hybrid Ash Gourd Seeds)</h2>

<p>হাইব্রিড চাল কুমড়া একটি জনপ্রিয় সবজি, যা সঠিক পরিচর্যা ও উপযুক্ত পরিবেশে বড় আকৃতির, মসৃণ এবং সাদা আবরণযুক্ত ফল উৎপাদন করতে পারে। এর শাঁস কোমল ও ঘন হওয়ায় তরকারি, ভর্তা, স্যুপ এবং বিভিন্ন ধরনের মিষ্টান্ন তৈরিতে ব্যবহার করা যায়। লতানো গাছের বৃদ্ধির জন্য পর্যাপ্ত জায়গা, উর্বর মাটি ও নিয়মিত পরিচর্যা নিশ্চিত করলে ভালো ফলনের সম্ভাবনা তৈরি হয়। পারিবারিক সবজি বাগান এবং পরিকল্পিত বাণিজ্যিক চাষ—উভয় ক্ষেত্রেই হাইব্রিড চাল কুমড়া একটি বিবেচনাযোগ্য সবজি ফসল।</p>

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৩৫টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🥒 <strong>ফসলের ধরন:</strong> চাল কুমড়া বা অ্যাশ গার্ড</li>
  <li>🌿 <strong>গাছের ধরন:</strong> লতানো সবজি গাছ</li>
  <li>🍲 <strong>ব্যবহার:</strong> তরকারি, ভর্তা, স্যুপ ও বিভিন্ন মিষ্টান্ন তৈরি</li>
</ul>

<h3>হাইব্রিড চাল কুমড়ার বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🥒 উপযুক্ত পরিচর্যায় বড় আকৃতির ও সাদা আবরণযুক্ত ফল উৎপাদনের সম্ভাবনা থাকে।</li>
  <li>🌿 লতানো গাছ বেড়ে ওঠার জন্য পর্যাপ্ত জায়গা ও সাপোর্টের ব্যবস্থা করা যায়।</li>
  <li>🍲 চাল কুমড়া বিভিন্ন ধরনের রান্না ও মিষ্টান্ন তৈরিতে ব্যবহার করা যায়।</li>
  <li>🏡 বাড়ির আঙিনা ও সবজি বাগানে চাষ করা সম্ভব।</li>
  <li>🌾 সঠিক চাষ ব্যবস্থাপনায় পারিবারিক চাহিদা ও বাণিজ্যিক উৎপাদনের জন্য বিবেচনা করা যায়।</li>
  <li>📦 পরিপক্ব ফলের সংরক্ষণকাল জাত ও সংরক্ষণ পরিবেশের ওপর নির্ভর করে।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশের উষ্ণ আবহাওয়ায় চাল কুমড়া চাষ করা যায়। তবে বীজ বপনের সময় স্থানীয় মৌসুম, তাপমাত্রা, বৃষ্টিপাত এবং জমির পানি নিষ্কাশনের অবস্থা বিবেচনা করুন। অতিরিক্ত জলাবদ্ধতা ও দীর্ঘসময় ভেজা মাটি বীজ এবং চারার ক্ষতি করতে পারে। তাই পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন জমি বা স্থান নির্বাচন করুন। বীজের প্যাকেটে নির্দিষ্ট নির্দেশনা থাকলে সেটিকে অগ্রাধিকার দিন।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>চাল কুমড়া চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। জমি ভালোভাবে প্রস্তুত করে পরিমিত পরিমাণে পচা গোবর বা কম্পোস্ট মিশিয়ে নিন। জমিতে পানি জমার আশঙ্কা থাকলে উঁচু মাদা বা বেড তৈরি করে চাষ করুন। টবে চাষ করতে চাইলে বড় আকারের পাত্র বা গ্রো ব্যাগ ব্যবহার করুন, যাতে গাছের শিকড় ও লতা বৃদ্ধির পর্যাপ্ত জায়গা থাকে।</p>

<h3>চাল কুমড়ার বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে জমি, মাদা, বড় টব অথবা চারা তৈরির পাত্র প্রস্তুত করুন।</li>
  <li>মাটির সঙ্গে পরিমিত পরিমাণে পচা জৈব সার মিশিয়ে নিন।</li>
  <li>প্রতিটি মাদায় কয়েকটি বীজ বপন করতে পারেন; পরে সুস্থ ও সবল চারা রেখে অতিরিক্ত চারা তুলে দিন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>বীজ বপনের পর আলতোভাবে পানি দিন এবং মাটি হালকা আর্দ্র রাখুন।</li>
  <li>চারা গজানোর পর দুর্বল চারা সরিয়ে দিন, যাতে সবল গাছ পর্যাপ্ত জায়গা পায়।</li>
  <li>লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজনমতো সাপোর্টের ব্যবস্থা করুন।</li>
</ol>

<h3>জমি ও ছাদবাগানে চাষের পদ্ধতি</h3>
<p>হাইব্রিড চাল কুমড়া জমি, বাড়ির আঙিনা অথবা পর্যাপ্ত জায়গাযুক্ত ছাদবাগানে চাষ করা যেতে পারে। জমিতে চাষ করলে গাছের লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন। ছাদবাগানে চাষের ক্ষেত্রে বড় ও মজবুত টব বা গ্রো ব্যাগ ব্যবহার করুন এবং ছাদের ভারবহন ক্ষমতা বিবেচনায় রাখুন। লতা মাচায় তুলতে চাইলে ফলের ওজন বহন করতে সক্ষম শক্ত কাঠামো তৈরি করুন।</p>

<h3>সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন জায়গা নির্বাচন করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির আর্দ্রতা অনুযায়ী নিয়মিত পানি দিন, বিশেষ করে গাছের বৃদ্ধি ও ফল গঠনের সময়।</li>
  <li>🚿 <strong>জলাবদ্ধতা:</strong> গাছের গোড়ায় পানি জমতে দেবেন না; অতিরিক্ত ভেজা মাটি শিকড়ের ক্ষতি করতে পারে।</li>
  <li>🌿 <strong>লতার যত্ন:</strong> লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজন হলে লতাকে সঠিক দিকে পরিচালিত করুন।</li>
</ul>

<h3>সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা গোবর, কম্পোস্ট এবং প্রয়োজনীয় পুষ্টি উপাদান সরবরাহ করুন। সুষম সার ব্যবস্থাপনা অনুসরণ করুন এবং অতিরিক্ত সার প্রয়োগ এড়িয়ে চলুন। গাছের গোড়ার আগাছা পরিষ্কার রাখুন, লতা ও পাতার অবস্থা নিয়মিত পর্যবেক্ষণ করুন এবং প্রয়োজনমতো পরিচর্যা করুন।</p>

<h3>পরাগায়ন ও ফলের যত্ন</h3>
<p>চাল কুমড়ার ফুল থেকে ফল গঠনের জন্য পরাগায়ন গুরুত্বপূর্ণ। বাগানে মৌমাছি ও অন্যান্য উপকারী পরাগবাহীর উপস্থিতি বজায় রাখতে সহায়ক পরিবেশ তৈরি করুন। ফুল ফোটার সময় কীটনাশকের অপ্রয়োজনীয় ব্যবহার এড়িয়ে চলুন। ফল বড় হতে শুরু করলে ফলের নিচে পরিষ্কার ও শুকনো খড় বা উপযুক্ত উপকরণ দেওয়া যেতে পারে, যাতে ফল সরাসরি ভেজা মাটির সংস্পর্শে না থাকে।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>চাল কুমড়ার গাছে ফলের মাছি, জাবপোকা এবং পাতায় বিভিন্ন রোগের লক্ষণ দেখা দিতে পারে। নিয়মিত পাতা, কচি ডগা ও ফল পরীক্ষা করুন। আক্রান্ত অংশ সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। প্রয়োজন হলে ফসলের জন্য অনুমোদিত বালাইনাশক পণ্যের লেবেল ও নিরাপত্তা নির্দেশনা মেনে ব্যবহার করুন। ফুল ফোটা ও পরাগায়নের সময় উপকারী পোকামাকড়ের সুরক্ষায় বিশেষ সতর্ক থাকুন।</p>

<h3>ফসল সংগ্রহ ও সংরক্ষণ</h3>
<p>ফলের জাত ও ব্যবহারের উদ্দেশ্য অনুযায়ী উপযুক্ত পরিপক্বতায় চাল কুমড়া সংগ্রহ করুন। ফল কাটার সময় ডাঁটার কিছু অংশ রেখে সাবধানে কাটুন, যাতে ফলের গায়ে আঘাত না লাগে। সংরক্ষণের আগে ফলের গায়ে অতিরিক্ত আর্দ্রতা থাকতে দেবেন না এবং কাটা বা ক্ষতিগ্রস্ত ফল আলাদা রাখুন। ফল কতদিন ভালো থাকবে তা জাত, পরিপক্বতা এবং সংরক্ষণের পরিবেশের ওপর নির্ভর করে।</p>

<h3>কোথায় চাষ করবেন?</h3>
<ul>
  <li>🌾 বাড়ির আঙিনা ও পারিবারিক সবজি বাগানে</li>
  <li>🚜 কৃষিজমি ও উঁচু বেডে</li>
  <li>🌿 পর্যাপ্ত জায়গাযুক্ত বাগানে</li>
  <li>🏡 বড় টব বা গ্রো ব্যাগে</li>
  <li>🧑‍🌾 পারিবারিক চাহিদা অথবা পরিকল্পিত বাণিজ্যিক চাষে</li>
</ul>

<h3>কেন হাইব্রিড চাল কুমড়ার বীজ বেছে নেবেন?</h3>
<p>নিজের বাগানে চাল কুমড়া চাষ করতে চাইলে হাইব্রিড চাল কুমড়ার বীজ হতে পারে একটি আকর্ষণীয় বিকল্প। আনুমানিক ৩৫টি বীজের এই প্যাকেটটি পারিবারিক বাগান বা সীমিত পরিসরে চাষের পরিকল্পনায় ব্যবহার করতে পারেন। উপযুক্ত মাটি, পর্যাপ্ত সূর্যালোক, সুষম সার, নিয়মিত পানি এবং সঠিক পরিচর্যা গাছের বৃদ্ধি ও ফল ধারণে সহায়তা করে। ফলের আকার, ফলন, স্বাদ ও সংরক্ষণক্ষমতা জাতের বৈশিষ্ট্য, আবহাওয়া এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>নিজের বাগানে চাল কুমড়া চাষের পরিকল্পনা করছেন? সংগ্রহ করুন <strong>হাইব্রিড চাল কুমড়ার বীজ</strong> <strong>Ss Seed Shop</strong> থেকে। সঠিক পরিচর্যার মাধ্যমে আপনার বাগানে গড়ে তুলুন সবুজ লতা ও সতেজ সবজির সমারোহ।</p>
```', 'VEG-1575', 15, 15, 1, 0, 15, '[]', '2026-09-24T01:42:39.251+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fb6ebaaa-c2ce-434d-9778-6a00acf99ed5', 'আমেরিকান ডায়ান্থাস ফুলের বীজ', 'american-dianthus-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732440747-9kbbjz7.webp', NULL, 190, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল রঙের সুগন্ধি ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ', 'আমেরিকান ডায়ান্থাস ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন লাল, গোলাপি, সাদা, বেগুনি ও অন্যান্য আকর্ষণীয় রঙের মনোমুগ্ধকর ফুলে। ডায়ান্থাস তার হালকা সুগন্ধ, দৃষ্টিনন্দন পাপড়ি এবং দীর্ঘস্থায়ী ফুলের জন্য বিশ্বজুড়ে জনপ্রিয়। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি, গাছ দ্রুত বৃদ্ধি পায় এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল ফোটে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1554', 15, 15, 1, 0, 20, '[]', '2026-09-24T01:42:48.196+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('6df03cbb-ecf3-4ea0-8de5-c6348335356b', 'হুরহুরে / স্পাইডার ফ্লাওয়ার (Cleome) ফুলের বীজ', 'cleome-spider-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732442880-tgw4r77.webp', NULL, 120, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"সেরা পণ্য\",\"পপুলার\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, অনন্য আকৃতির দৃষ্টিনন্দন ফুল, প্রজাপতি আকর্ষণকারী, টব ও বাগানের জন্য আদর্শ।', 'হুরহুরে / স্পাইডার ফ্লাওয়ার (Cleome) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অনন্য আকৃতির মনোমুগ্ধকর ফুল। লম্বা পুংকেশরের কারণে এই ফুলটি মাকড়সার মতো আকৃতি ধারণ করে, যা একে অন্যান্য ফুল থেকে আলাদা করে। এটি মৌমাছি ও প্রজাপতি আকর্ষণ করে এবং টব, ছাদবাগান, ফুলের বেড, বর্ডার ও খোলা বাগানে চাষের জন্য অত্যন্ত উপযোগী। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুল ফোটায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1543', 10, 10, 1, 0, 20, '[]', '2026-09-24T01:42:38.755+00:00', '2026-10-17T05:26:04.545583+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('795ff0bb-1f00-4ea1-8d7d-fbd4e228a44f', 'চায়না অ্যাস্টার ফুল বীজ (মিক্সড কালার)', 'china-aster-mixed-color-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732437551-v19w1s3.webp', NULL, 190, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৬০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের বড় আকর্ষণীয় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>চায়না অ্যাস্টার ফুল বীজ (মিক্সড কালার)</strong> দিয়ে আপনার বাগানে ফুটিয়ে তুলুন গোলাপি, বেগুনি, সাদা, লালসহ বিভিন্ন আকর্ষণীয় রঙের দৃষ্টিনন্দন ফুল। অ্যাস্টার ফুল তার বড় ও আকর্ষণীয় ফুল, দীর্ঘস্থায়ী সৌন্দর্য এবং তুলনামূলক সহজ পরিচর্যার জন্য জনপ্রিয়।</p> 

<p>টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি উপযোগী। সঠিক মাটি, পর্যাপ্ত আলো, নিয়মিত পানি ও পরিচর্যা নিশ্চিত করলে স্বাস্থ্যবান গাছ এবং দীর্ঘসময় ধরে সুন্দর ফুল পাওয়ার সুযোগ থাকে।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৬০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🎨 <strong>ফুলের রঙ:</strong> মিক্সড কালার — গোলাপি, বেগুনি, সাদা, লালসহ বিভিন্ন রঙ</li> 
<li>🌸 <strong>ফুলের ধরন:</strong> বড় আকৃতির ও দৃষ্টিনন্দন ফুল</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগান</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>বাংলাদেশের আবহাওয়ায় চায়না অ্যাস্টার সাধারণত <strong>শীত ও শীতের আগের/পরের ঠান্ডা সময়ে</strong> ভালোভাবে বেড়ে ওঠে। সাধারণভাবে <strong>অক্টোবর থেকে জানুয়ারি</strong> সময়টি বীজ বপন ও চাষের জন্য উপযোগী। অতিরিক্ত গরম ও দীর্ঘসময় জলাবদ্ধ পরিবেশ এড়িয়ে চলা ভালো।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>অ্যাস্টার ফুলের জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটিতে পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে, তাই ভালো ড্রেনেজ নিশ্চিত করা জরুরি।</p> 

<ul> 
<li>🌱 বাগানের মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🪨 মাটি বেশি ভারী হলে কিছু মোটা বালি বা পার্লাইট মিশিয়ে পানি নিষ্কাশন বাড়ান।</li> 
<li>🌿 আগাছা, পুরোনো শিকড় ও মাটির আবর্জনা পরিষ্কার করে নিন।</li> 
<li>💧 বেডে পানি জমে থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বীজগুলো ঝুরঝুরে ও আর্দ্র বীজতলা বা ট্রেতে বপন করুন। অ্যাস্টারের ছোট বীজ খুব গভীরে না দিয়ে মাটির উপর হালকাভাবে ছড়িয়ে <strong>পাতলা মাটি বা কোকোপিটের স্তর</strong> দিয়ে ঢেকে দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>অঙ্কুরোদগমের আগ পর্যন্ত মাটি হালকা আর্দ্র রাখুন। অতিরিক্ত পানি দিলে বীজ পচে যেতে পারে। চারা কয়েকটি সুস্থ পাতা তৈরি করলে সাবধানে মূল টব বা বাগানের নির্দিষ্ট স্থানে রোপণ করুন।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>টব বা গ্রো ব্যাগে অ্যাস্টার চাষের জন্য নিচের ধরনের মাটি মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>চায়না অ্যাস্টার ফুলের গাছের জন্য <strong>পর্যাপ্ত সূর্যালোক</strong> গুরুত্বপূর্ণ। প্রতিদিন কয়েক ঘণ্টা সকালের বা সরাসরি সূর্যের আলো পেলে গাছের সুস্থ বৃদ্ধি ও ফুল উৎপাদনে সহায়তা করতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। চারা অবস্থায় হালকা স্প্রে করে পানি দেওয়া ভালো। গাছ বড় হওয়ার পর গোড়ায় পানি দিন এবং পাতা ও ফুলের ওপর অতিরিক্ত পানি জমে থাকা এড়িয়ে চলুন।</p> 

<h3>🌿 পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🌱 নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>☀️ পর্যাপ্ত আলো নিশ্চিত করুন।</li> 
<li>💧 অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li> 
<li>🍂 প্রয়োজন অনুযায়ী কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>✂️ শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে নতুন ফুল আসতে উৎসাহিত হতে পারে।</li> 
<li>🐛 পাতা বা কুঁড়িতে পোকামাকড়ের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
<li>🌬️ গাছের মাঝে পর্যাপ্ত জায়গা রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li> 
</ul> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>চায়না অ্যাস্টার ফুলের বীজ</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড, বাগানের বর্ডার এবং খোলা জায়গায় চাষ করা যায়। সীমিত জায়গায়ও টব বা গ্রো ব্যাগ ব্যবহার করে সহজেই এই রঙিন ফুলের বাগান তৈরি করা সম্ভব।</p> 

<h3>🌸 কেন চায়না অ্যাস্টার ফুল চাষ করবেন?</h3> 
<ul> 
<li>🎨 এক প্যাকেটেই বিভিন্ন আকর্ষণীয় ফুলের রঙ পাওয়ার সুযোগ</li> 
<li>🌸 বড় ও দৃষ্টিনন্দন ফুলের জন্য উপযোগী</li> 
<li>🏡 বাড়ির বাগান ও ছাদবাগানে সৌন্দর্য বাড়াতে উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌿 সঠিক পরিচর্যায় দীর্ঘসময় ফুল পাওয়ার সুযোগ</li> 
<li>🎁 বাগান সাজানো ও ফুলপ্রেমীদের জন্য আকর্ষণীয় নির্বাচন</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>চায়না অ্যাস্টার ফুল বীজ (মিক্সড কালার)</strong> দিয়ে আপনার বাড়ি, বারান্দা বা ছাদবাগান সাজিয়ে তুলুন বিভিন্ন রঙের আকর্ষণীয় ফুলে। সঠিক পরিচর্যায় গড়ে তুলুন সুন্দর ও রঙিন ফুলের বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'FUL-1501', 16, 16, 1, 0, 21, '[]', '2026-09-24T01:42:31.229+00:00', '2026-10-19T08:00:15.091827+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ea55d587-98cb-492c-8b51-1e55fe57b44e', 'হাইব্রিড সবুজ বড় করলা বীজ', 'hybrid-green-big-bitter-gourd-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949166337-8kwkvty.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785377985394-m0kkvsz.webp\"]', 210, 75, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বড় আকারের সবুজ ফল, বারোমাসি চাষের জন্য উপযোগী ও উচ্চ ফলনশীল।', '<h3>🌱 Product Short Description</h3> 
<p><strong>হাইব্রিড বারোমাসি সবুজ বড় করলা বীজ</strong> উচ্চ ফলনশীল ও উন্নত মানের একটি হাইব্রিড জাত, যা বছরের বিভিন্ন সময়ে চাষের জন্য উপযোগী। গাছ দ্রুত বৃদ্ধি পায় এবং বড় আকারের, সবুজ ও সমান আকৃতির করলা উৎপাদনের জন্য উপযোগী।</p> 

<p>টব, ছাদবাগান, মাচা এবং খোলা জমিতে সহজেই চাষ করা যায়। সঠিক পরিচর্যা ও অনুকূল পরিবেশে দীর্ঘসময় ধরে ফলন পাওয়ার সুযোগ তৈরি হতে পারে। পারিবারিক বাগান থেকে শুরু করে <strong>বাণিজ্যিক চাষের</strong> জন্যও এটি একটি ভালো নির্বাচন। 🥒🌿</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> হাইব্রিড বারোমাসি সবুজ বড় করলা</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌿 করলার বিশেষ বৈশিষ্ট্য</h3> 
<ul> 
<li>🥒 বড় আকারের সবুজ করলা উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 দ্রুত বৃদ্ধিশীল গাছ</li> 
<li>📈 সঠিক পরিচর্যায় ভালো ফলনের সম্ভাবনা</li> 
<li>⏳ দীর্ঘসময় ধরে ফলন পাওয়ার জন্য উপযোগী</li> 
<li>🌿 মাচায় চাষের জন্য উপযোগী লতানো গাছ</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনে চাষ করা যায়</li> 
<li>🪴 টব ও গ্রো ব্যাগেও চাষ করা সম্ভব</li> 
<li>🌾 পারিবারিক ও বাণিজ্যিক—উভয় ধরনের চাষের জন্য উপযোগী</li> 
</ul> 

<h3>🌤️ করলা চাষের উপযুক্ত মৌসুম</h3> 
<p>বছরের বিভিন্ন সময়ে করলা চাষ করা সম্ভব হলেও বাংলাদেশে সাধারণভাবে <strong>ফেব্রুয়ারি থেকে মে মাস</strong> করলা বীজ বপনের জন্য সবচেয়ে উপযোগী সময়। উপযুক্ত পরিবেশ, তাপমাত্রা ও পরিচর্যা থাকলে অন্যান্য সময়েও চাষ করা যায়।</p> 

<ul> 
<li>🌞 <strong>গ্রীষ্মকাল ও খরা মৌসুম:</strong> ফেব্রুয়ারি থেকে মে মাস (মাঘ থেকে জ্যৈষ্ঠ) বীজ বপনের জন্য উপযোগী সময়।</li> 
<li>🌧️ <strong>বর্ষাকাল:</strong> জুন থেকে জুলাই মাসে দ্বিতীয় দফায় বীজ বপন করা যেতে পারে। এ সময়ে পানি নিষ্কাশনের দিকে বিশেষ নজর দিতে হবে।</li> 
</ul> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>করলা চাষের জন্য <strong>দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটিতে পর্যাপ্ত জৈব উপাদান এবং ভালো পানি নিষ্কাশন ব্যবস্থা থাকা প্রয়োজন।</p> 

<ul> 
<li>🌱 <strong>মাটির ধরন:</strong> উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি ব্যবহার করুন।</li> 
<li>🚜 <strong>জমি প্রস্তুত:</strong> জমি ২–৩ বার ভালোভাবে চাষ ও মই দিয়ে মাটি ঝুরঝুরে ও সমতল করে নিন।</li> 
<li>⚗️ <strong>মাটির pH:</strong> প্রায় ৬.০–৬.৭ pH-এর মাটি করলা চাষের জন্য উপযোগী।</li> 
<li>🌿 <strong>বেড তৈরি:</strong> প্রায় ৩.২৫ ফুট প্রশস্ত বেড তৈরি করে দুই বেডের মাঝে প্রায় ২ ফুট নালা রাখুন, যাতে অতিরিক্ত বৃষ্টির পানি সহজে বের হয়ে যেতে পারে।</li> 
<li>🕳️ <strong>মাদা বা গর্ত:</strong> প্রায় ৩০ × ৩০ × ৩০ সেমি আকারের মাদা তৈরি করুন।</li> 
<li>🍂 <strong>জৈব সার:</strong> পচা গোবর বা কম্পোস্টের সঙ্গে প্রয়োজনীয় পরিমাণ টিএসপি ও পটাশ মিশিয়ে মাদার মাটিতে ভালোভাবে মিশিয়ে দিন।</li> 
<li>⏳ <strong>মাটি প্রস্তুতির সময়:</strong> সার মেশানোর পর প্রায় ১০–১৫ দিন রেখে দিলে মাটি বীজ বপনের জন্য প্রস্তুত করা যায়।</li> 
</ul> 

<h3>🌱 বীজ বপনের পদ্ধতি</h3> 
<p>করলার বীজ সরাসরি মাদা, বেড, টব বা গ্রো ব্যাগে বপন করা যায়। বীজ বপনের আগে মাটি ভালোভাবে ঝুরঝুরে করে নিন। বীজ প্রায় <strong>২–৩ সেমি গভীরে</strong> বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</p> 

<p>বীজ বপনের পর হালকা পানি স্প্রে করুন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দিয়ে মাটি কাদা করে ফেলবেন না। চারা গজানোর পর দুর্বল চারা বাদ দিয়ে সুস্থ চারা রেখে দিন।</p> 

<h3>🏡 টব ও ছাদবাগানে চাষের পদ্ধতি</h3> 
<p>ছাদবাগানে করলা চাষের জন্য পর্যাপ্ত জায়গার একটি <strong>বড় টব বা গ্রো ব্যাগ</strong> নির্বাচন করুন। নিচে ভালো ড্রেনেজ ছিদ্র থাকা জরুরি। মাটি হিসেবে দোআঁশ মাটি, কোকোপিট, পচা কম্পোস্ট ও মোটা বালির মিশ্রণ ব্যবহার করা যেতে পারে।</p> 

<p>করলা লতানো গাছ হওয়ায় চারা বড় হওয়ার সঙ্গে সঙ্গে <strong>মজবুত মাচা বা ট্রেলিস</strong> তৈরি করুন। লতা মাচায় তুলে দিলে আলো-বাতাস চলাচল ভালো হয় এবং ফল সংগ্রহ করাও সহজ হয়।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>করলা গাছের ভালো বৃদ্ধি ও ফলনের জন্য <strong>প্রতিদিন পর্যাপ্ত সূর্যালোক</strong> প্রয়োজন। ছাদবাগান বা খোলা জমিতে এমন জায়গা নির্বাচন করুন যেখানে দিনের বেশিরভাগ সময় ভালো আলো পাওয়া যায়।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে নিয়মিত পানি দিন। গরম ও শুষ্ক সময়ে পানির প্রয়োজন বাড়তে পারে। বর্ষাকালে অতিরিক্ত পানি যেন জমে না থাকে, সেজন্য নালা ও ড্রেনেজ ব্যবস্থা সচল রাখুন।</p> 

<h3>🌿 মাচা ও গাছের পরিচর্যা</h3> 
<ul> 
<li>🪢 লতা বাড়ার সঙ্গে সঙ্গে মজবুত মাচা বা ট্রেলিসে তুলে দিন।</li> 
<li>🌱 প্রয়োজন অনুযায়ী দুর্বল বা অতিরিক্ত ঘন লতা ছাঁটাই করুন।</li> 
<li>🍂 গাছের গোড়ায় আগাছা জমতে দেবেন না।</li> 
<li>💧 নিয়মিত মাটির আর্দ্রতা পর্যবেক্ষণ করুন।</li> 
<li>☀️ গাছের চারপাশে পর্যাপ্ত আলো ও বাতাস চলাচলের ব্যবস্থা রাখুন।</li> 
<li>🥒 ছোট ফল ধরার পর নিয়মিত গাছ পর্যবেক্ষণ করুন এবং পরিপক্ব ফল সময়মতো সংগ্রহ করুন।</li> 
</ul> 

<h3>🐛 প্রধান রোগবালাই ও প্রতিকার</h3> 

<p><strong>১. মাছি পোকা (Fruit Fly):</strong> মাছি পোকা করলার ফলে ডিম পাড়তে পারে। আক্রান্ত ফলে লার্ভা তৈরি হয়ে ফলের ভেতরের অংশ নষ্ট করে এবং ফল পচে যেতে পারে।</p> 

<p><strong>প্রতিকার:</strong> আক্রান্ত ও ঝরে পড়া ফল দ্রুত সংগ্রহ করে নিরাপদে নষ্ট বা মাটিচাপা দিন। প্রয়োজন অনুযায়ী <strong>সেক্স ফেরোমন ফাঁদ</strong> ব্যবহার করা যেতে পারে।</p> 

<p><strong>২. পাতার জাব পোকা বা এফিড (Aphids):</strong> এফিড সাধারণত কচি পাতা ও ডগার রস চুষে গাছকে দুর্বল করে দিতে পারে।</p> 

<p><strong>প্রতিকার:</strong> আক্রান্ত অংশ পর্যবেক্ষণ করে প্রয়োজনীয় ব্যবস্থা নিন। আক্রমণ বেশি হলে স্থানীয় কৃষি কর্মকর্তার পরামর্শ অনুযায়ী অনুমোদিত কীটনাশক বা উপযুক্ত জৈব বালাইনাশক ব্যবহার করুন।</p> 

<p><strong>৩. সাদা গুঁড়ো রোগ (Powdery Mildew):</strong> পাতার ওপর সাদা গুঁড়োর মতো আস্তরণ দেখা দিতে পারে এবং আক্রান্ত পাতা ধীরে ধীরে দুর্বল বা শুকিয়ে যেতে পারে।</p> 

<p><strong>প্রতিকার:</strong> আক্রান্ত পাতা অপসারণ করুন এবং গাছের চারপাশে পর্যাপ্ত আলো-বাতাস চলাচলের ব্যবস্থা করুন। প্রয়োজন হলে স্থানীয় কৃষি কর্মকর্তার পরামর্শ অনুযায়ী অনুমোদিত সালফারভিত্তিক ছত্রাকনাশক নিয়ম মেনে ব্যবহার করুন।</p> 

<h3>🥒 করলা সংগ্রহের সঠিক সময়</h3> 
<p>করলার ফল <strong>কচি ও কোমল অবস্থায়</strong> সংগ্রহ করা সবচেয়ে ভালো। ফল বেশি পরিপক্ব হয়ে গেলে অতিরিক্ত বীজযুক্ত ও শক্ত হয়ে যেতে পারে। পরিষ্কার ছুরি বা কাঁচি দিয়ে ফল সংগ্রহ করুন, যাতে গাছের লতা বা নতুন ফলের ক্ষতি না হয়।</p> 

<p>নিয়মিত পরিপক্ব ফল সংগ্রহ করলে গাছে নতুন ফুল ও ফল আসার সুযোগ তৈরি হতে পারে এবং দীর্ঘসময় উৎপাদন বজায় রাখতে সহায়ক হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>হাইব্রিড বারোমাসি সবুজ বড় করলা</strong> খোলা কৃষিজমি, বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, টব ও গ্রো ব্যাগে চাষ করা যায়। মজবুত মাচা তৈরি করতে পারলে অল্প জায়গাতেও লতানো করলা গাছ পরিচালনা করা সম্ভব।</p> 

<h3>🌟 কেন হাইব্রিড বারোমাসি সবুজ বড় করলা চাষ করবেন?</h3> 
<ul> 
<li>🥒 বড় আকারের সবুজ করলা উৎপাদনের জন্য উপযোগী</li> 
<li>🌱 দ্রুত বৃদ্ধির জন্য উপযোগী হাইব্রিড জাত</li> 
<li>📈 সঠিক পরিচর্যায় ভালো ফলনের সম্ভাবনা</li> 
<li>⏳ দীর্ঘসময় ফলন পাওয়ার সুযোগ</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডানের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🪢 মাচা বা ট্রেলিসে সহজে পরিচালনা করা যায়</li> 
<li>🌾 পারিবারিক ও বাণিজ্যিক উভয় ধরনের চাষের জন্য উপযোগী</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p>আপনার ছাদবাগান, কিচেন গার্ডেন বা কৃষিজমিতে <strong>হাইব্রিড বারোমাসি সবুজ বড় করলা বীজ</strong> দিয়ে চাষ শুরু করুন। সঠিক মাটি, মাচা, পানি, আলো ও নিয়মিত পরিচর্যার মাধ্যমে স্বাস্থ্যকর গাছ ও ভালো ফলন পাওয়ার লক্ষ্যে <strong>আজই অর্ডার করুন!</strong> 🥒🌿</p>', 'VEG-1544', 18, 18, 1, 0, 24, '[]', '2026-09-24T01:48:46.612+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b37ad81d-deb1-42df-a595-d81ca08950b9', 'বড় পাতা কলমি শাকের বীজ', 'baromasi-large-leaf-water-spinach-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364659957-57nlwf6.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783092813430-mnvhiz0.webp\"]', 110, 45, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পপুলার\",\"পরীক্ষিত\",\"হাইব্রিড\"]', 'আনুমানিক ১২০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, বড় পাতার, পুষ্টিকর ও দ্রুত বর্ধনশীল কলমি শাক উৎপাদন করুন।', 'বারোমাসি বড় পাতা কলমি শাক একটি উন্নত মানের ও উচ্চ ফলনশীল শাকের জাত, যা বড় আকারের কোমল, সবুজ ও সুস্বাদু পাতা উৎপাদন করে। দ্রুত বৃদ্ধি এবং বারবার সংগ্রহের সুবিধার কারণে এটি সারা বছর চাষের জন্য উপযোগী। ভিটামিন, খনিজ ও খাদ্যআঁশে সমৃদ্ধ এই শাক দৈনন্দিন খাদ্যতালিকায় একটি স্বাস্থ্যকর সংযোজন। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য আদর্শ।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১২০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1617', 15, 15, 1, 0, 25, '[]', '2026-09-24T01:48:42.44+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c5a5857f-fde9-432e-b704-0c94a8d5df5b', 'ইমপোর্টেড হাইব্রিড পিটুনিয়া বীজ', 'imported-hybrid-purple-petunia-flower-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784182820-2z7oy3d.webp', NULL, 130, 55, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', '≥৮০% অঙ্কুরোদগম | ইমপোর্টেড হাইব্রিড বেগুনি পিটুনিয়া, টব ও বাগানে আকর্ষণীয় ফুলের জন্য উপযোগী।', '<h3>🌱 Product Short Description</h3><p>ইমপোর্টেড হাইব্রিড বেগুনি পিটুনিয়া ফুলের বীজ সুন্দর ও আকর্ষণীয় বেগুনি রঙের ফুল চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে স্বাস্থ্যকর গাছ এবং প্রচুর আকর্ষণীয় ফুল পেতে সহায়ক।</p><p>টব, বারান্দা, ছাদবাগান, জানালার পাশে ও বাগানের সৌন্দর্য বৃদ্ধিতে চমৎকারভাবে ব্যবহার করা যায়। 🌸 <strong>আপনার বাগানকে রঙিন করতে আজই পিটুনিয়া ফুলের বীজ অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> প্যাকেট অনুযায়ী (উচ্চ গুণমানসম্পন্ন)</li><li>🌸 <strong>জাত:</strong> হাইব্রিড বেগুনি পিটুনিয়া</li><li>🌍 <strong>ধরন:</strong> ইমপোর্টেড</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li></ul><h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3><p>পিটুনিয়া তুলনামূলকভাবে <strong>শীতল ও মৃদু আবহাওয়ায়</strong> ভালো বেড়ে ওঠে এবং ফুল দেয়।</p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর থেকে বীজ বপন করা যায়।</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি সাধারণত ফুলের জন্য সবচেয়ে উপযোগী সময়।</li><li>🌸 <strong>শীতের শেষ:</strong> ফেব্রুয়ারি–মার্চ পর্যন্ত অনুকূল পরিবেশে ফুল পাওয়া যেতে পারে।</li><li>☀️ অতিরিক্ত গরম ও প্রচণ্ড রোদে গাছ দুর্বল হতে পারে, তাই গরমের সময় দুপুরের তীব্র রোদ থেকে কিছুটা সুরক্ষা দেওয়া ভালো।</li></ul><h3>🪴 পিটুনিয়া ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য মাটি নির্বাচন করুন</strong><br>পিটুনিয়ার জন্য হালকা, উর্বর ও পানি দ্রুত নিষ্কাশন হয় এমন মাটি সবচেয়ে ভালো। ভারী কাদামাটি সরাসরি ব্যবহার না করাই ভালো।</p><p><strong>২. আদর্শ পটিং মিক্স তৈরি করুন</strong><br>টব বা পাত্রের জন্য ব্যবহার করতে পারেন:</p><ul><li>৪০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li><li>১০% মোটা বালি বা পার্লাইট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে নিন।</p><p><strong>৩. জৈব সার ব্যবহার করুন</strong><br>ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট অল্প পরিমাণে মাটির সঙ্গে মিশিয়ে দিন। কাঁচা গোবর ব্যবহার করবেন না।</p><p><strong>৪. টবের নিষ্কাশন ব্যবস্থা নিশ্চিত করুন</strong><br>টবের নিচে অবশ্যই পর্যাপ্ত ড্রেনেজ ছিদ্র থাকতে হবে। অতিরিক্ত পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে।</p><p><strong>৫. বীজ বপনের পদ্ধতি</strong><br>পিটুনিয়ার বীজ সাধারণত খুব ছোট। মাটির উপরিভাগে ছড়িয়ে দিয়ে হালকা চাপ দিন এবং পাতলা করে কোকোপিট দিয়ে ঢেকে বা সামান্য ছিটিয়ে দিন। খুব গভীরে বীজ পুঁতে দেবেন না।</p><p><strong>৬. আর্দ্রতা ও আলো</strong><br>বীজ অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। পানি দেওয়ার সময় জোরে ঢালবেন না; স্প্রে করে পানি দেওয়া ভালো। পর্যাপ্ত আলো নিশ্চিত করুন।</p><p>💡 <strong>বিশেষ টিপস:</strong> পিটুনিয়া অতিরিক্ত পানি পছন্দ করে না। মাটি শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন এবং গাছকে পর্যাপ্ত আলো-বাতাসযুক্ত স্থানে রাখুন।</p><h3>🛒 অর্ডার করুন</h3><p><strong>বাড়ি, বারান্দা বা ছাদবাগানে নজরকাড়া বেগুনি ফুলের সৌন্দর্য আনতে আজই ইমপোর্টেড হাইব্রিড পিটুনিয়া বীজ অর্ডার করুন!</strong></p><h3></h3>', 'FUL-1560', 32, 32, 1, 0, 25, '[]', '2026-10-01T10:32:06.173+00:00', '2026-10-17T05:26:05.180595+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c9b97690-4631-4f0a-8686-f38dc5ad6b17', 'হাইব্রিড পালং শাকের উন্নত বীজ', 'hybrid-spinach-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949203140-qtf7vew.webp', NULL, 110, 30, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"পপুলার\",\"পরীক্ষিত\",\"আগাম চাষ- শীতকাল\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, সুস্বাদু, পুষ্টিকর ও উচ্চ ফলনশীল পালং শাক উৎপাদন করুন।', '<h3>🌱 হাইব্রিড পালং শাকের উন্নত বীজ</h3> 

<p><strong>হাইব্রিড পালং শাকের উন্নত বীজ</strong> একটি উচ্চ ফলনশীল ও দ্রুত বর্ধনশীল জাত, যা ছোট আকারের কোমল, নরম ও সুস্বাদু পাতা উৎপাদনের জন্য উপযোগী। পালং শাকের পাতা ভিটামিন, আয়রন ও অন্যান্য প্রয়োজনীয় পুষ্টিগুণের ভালো উৎস। দ্রুত সংগ্রহযোগ্য হওয়ায় এটি ঘরোয়া বাগান, ছাদবাগান, বারান্দা ও বাণিজ্যিক চাষ—সব ক্ষেত্রেই উপযোগী। নিয়মিত পরিচর্যায় পর্যায়ক্রমে তাজা ও স্বাস্থ্যকর শাক সংগ্রহ করা যায়।</p> 

<h3>📦 Product Specifications</h3> 

<ul> 
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3> 

<ul> 
<li>🌱 দ্রুত বর্ধনশীল ও উচ্চ ফলনশীল জাত</li> 
<li>🥬 কোমল, নরম ও সুস্বাদু পাতা উৎপাদনে উপযোগী</li> 
<li>⏱️ তুলনামূলক দ্রুত সংগ্রহযোগ্য</li> 
<li>🌿 নিয়মিত পরিচর্যায় পর্যায়ক্রমে শাক সংগ্রহের সুযোগ</li> 
<li>🏡 ঘরোয়া ও ছাদবাগানের জন্য উপযোগী</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
</ul> 

<h3>📅 চাষের উপযুক্ত সময়</h3> 

<p>পালং শাক তুলনামূলকভাবে শীতল ও মৃদু আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে সাধারণত <strong>শরৎ, শীত ও বসন্তের শুরুতে</strong> চাষের জন্য উপযোগী পরিবেশ পাওয়া যায়। তবে স্থানীয় আবহাওয়া ও তাপমাত্রা অনুযায়ী চাষের সময় নির্বাচন করা ভালো। অতিরিক্ত গরমের সময় পাতার গুণমান ও বৃদ্ধিতে প্রভাব পড়তে পারে।</p> 

<h3>🌱 মাটি প্রস্তুতি</h3> 

<p>পালং শাকের জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশন সুবিধাযুক্ত দোআঁশ মাটি ভালো। জমি বা বেডের মাটি ভালোভাবে ঝুরঝুরে করে পচা জৈব সার/কম্পোস্ট মিশিয়ে নিতে পারেন। পানি যেন জমে না থাকে সেদিকে বিশেষ খেয়াল রাখতে হবে।</p> 

<ul> 
<li>মাটি ২–৩ বার কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করুন।</li> 
<li>পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>জমিতে অতিরিক্ত পানি জমার সুযোগ থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌿 বীজ বপন পদ্ধতি</h3> 

<p>বীজ সরাসরি জমি, বেড, টব বা গ্রো ব্যাগে বপন করা যায়। মাটির উপর সমানভাবে বীজ ছিটিয়ে হালকা মাটি দিয়ে ঢেকে দিতে হবে। অতিরিক্ত গভীরে বীজ বপন না করাই ভালো। বীজ বপনের পর হালকা পানি দিতে হবে, যাতে বীজের স্থান নষ্ট না হয়।</p> 

<p><strong>পরামর্শ:</strong> চারা গজানোর পর অতিরিক্ত ঘন জায়গায় থাকা চারাগুলো প্রয়োজন অনুযায়ী পাতলা করে দিলে গাছ পর্যাপ্ত আলো, বাতাস ও পুষ্টি পাবে।</p> 

<h3>🪴 টব ও ছাদবাগানে চাষ</h3> 

<p>এই পালং শাক টব, ট্রে, গ্রো ব্যাগ বা ছাদবাগানের বিভিন্ন পাত্রে সহজেই চাষ করা যায়। পাত্রে অবশ্যই পর্যাপ্ত ড্রেনেজ ছিদ্র থাকতে হবে। মাটির সঙ্গে জৈব সার বা কম্পোস্ট মিশিয়ে ব্যবহার করলে গাছের বৃদ্ধিতে সহায়তা করবে।</p> 

<p><strong>সহজ মাটির মিশ্রণ:</strong> দোআঁশ মাটি, কোকোপিট ও পচা কম্পোস্ট/জৈব সার মিশিয়ে হালকা ও পানি নিষ্কাশনযোগ্য মাধ্যম তৈরি করা যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 

<p>পালং শাকের সুস্থ বৃদ্ধির জন্য পর্যাপ্ত আলো প্রয়োজন। প্রতিদিন কয়েক ঘণ্টা সকালের নরম রোদ বা পর্যাপ্ত আলো পাওয়া যায় এমন স্থানে রাখলে ভালো ফল পাওয়া যেতে পারে। মাটি একেবারে শুকিয়ে যেতে দেওয়া উচিত নয়, আবার অতিরিক্ত পানি দিয়ে জলাবদ্ধতাও তৈরি করা যাবে না।</p> 

<h3>💧 সার ও পরিচর্যা</h3> 

<ul> 
<li>মাটি শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন।</li> 
<li>নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>প্রয়োজনে অল্প অল্প করে জৈব সার/কম্পোস্ট ব্যবহার করুন।</li> 
<li>অতিরিক্ত রাসায়নিক সার প্রয়োগ না করে গাছের বৃদ্ধি ও মাটির অবস্থা অনুযায়ী সার ব্যবস্থাপনা করুন।</li> 
<li>পাতায় পোকা বা রোগের লক্ষণ দেখা দিলে দ্রুত আক্রান্ত অংশ সরিয়ে উপযুক্ত ব্যবস্থা নিন।</li> 
</ul> 

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3> 

<p>পাতাজাতীয় ফসলে বিভিন্ন ধরনের পোকামাকড় আক্রমণ করতে পারে। নিয়মিত গাছ পর্যবেক্ষণ করুন এবং আক্রান্ত পাতা দ্রুত সরিয়ে ফেলুন। বাগানে পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন এবং অতিরিক্ত পানি দেওয়া এড়িয়ে চলুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত জৈব বা বালাইনাশক পণ্যের লেবেল নির্দেশনা অনুসরণ করে ব্যবহার করুন।</p> 

<h3>🥬 সংগ্রহের সময়</h3> 

<p>পাতা কোমল ও কচি থাকা অবস্থায় প্রয়োজন অনুযায়ী সংগ্রহ করা যায়। খুব বেশি পুরোনো হওয়ার আগেই পাতা সংগ্রহ করলে সাধারণত নরম ও সুস্বাদু শাক পাওয়া যায়। পর্যায়ক্রমে পাতা সংগ্রহ করলে নতুন পাতা গজানোর সুযোগ তৈরি হয়।</p> 

<h3>🏡 কোথায় চাষ করা যায়?</h3> 

<ul> 
<li>🏠 বাড়ির আঙিনা ও রান্নাঘর বাগান</li> 
<li>🏢 ছাদবাগান</li> 
<li>🌿 বারান্দা ও ছোট বাগান</li> 
<li>🪴 টব ও গ্রো ব্যাগ</li> 
<li>🌾 খোলা জমি</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষাবাদ</li> 
</ul> 

<h3>💚 কেন চাষ করবেন?</h3> 

<p>দ্রুত বর্ধনশীল, কোমল ও সুস্বাদু পাতার জন্য <strong>হাইব্রিড পালং শাকের উন্নত বীজ</strong> ঘরোয়া বাগান থেকে শুরু করে বাণিজ্যিক চাষ—বিভিন্ন ধরনের চাষাবাদে একটি ভালো নির্বাচন। অল্প জায়গায়ও চাষ করা যায় এবং প্রয়োজন অনুযায়ী তাজা শাক সংগ্রহ করা সম্ভব।</p> 

<p><strong>🌱 আজই অর্ডার করুন এবং নিজের বাগানে তাজা পালং শাক চাষ শুরু করুন!</strong></p>', 'VEG-1520', 10, 10, 1, 0, 25, '[]', '2026-09-24T01:42:44.808+00:00', '2026-10-19T09:17:51.717064+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('914f1039-44e8-499e-9d5e-424b9f396fe5', 'ইম্পোর্টেড লার্জ-লিফ হাইব্রিড ধনে পাতার বীজ', 'imported-large-leaf-hybrid-coriander-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949200357-757gdff.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782993245862-6u5doiy.webp\"]', 120, 25, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"হাইব্রিড\",\"পরীক্ষিত\",\"পপুলার\"]', 'আনুমানিক ১০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড় পাতার, সুগন্ধি, বারোমাসি ও উচ্চ ফলনশীল ধনেপাতা উৎপাদন করুন।', '<h3>🌿 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>ইম্পোর্টেড লার্জ-লিফ হাইব্রিড ধনে পাতা (বারোমাসি জাত)</strong> একটি উন্নত মানের ও উচ্চ ফলনশীল ধনেপাতার জাত, যা বড় আকারের কোমল, সুগন্ধি ও ঘন সবুজ পাতা উৎপাদনের জন্য উপযোগী। দ্রুত বৃদ্ধি, বারবার কাটার সুবিধা এবং দীর্ঘসময় পাতা উৎপাদনের সম্ভাবনার কারণে এটি বাড়ির বাগান থেকে বাণিজ্যিক চাষ—সব ক্ষেত্রেই আকর্ষণীয়।</p> 

<p>তাজা ধনেপাতা সালাদ, ভর্তা, তরকারি, স্যুপ, চাটনি ও বিভিন্ন রান্নায় ব্যবহার করা যায়। <strong>ছাদবাগান, কিচেন গার্ডেন, বারান্দা, টব ও বাণিজ্যিক চাষের</strong> জন্য এটি উপযোগী।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🌿 <strong>পাতার ধরন:</strong> বড় আকারের, কোমল ও ঘন সবুজ পাতা</li> 
<li>🌱 <strong>জাত:</strong> বারোমাসি হাইব্রিড</li> 
<li>🌿 <strong>বিশেষ বৈশিষ্ট্য:</strong> দ্রুত বৃদ্ধি ও বারবার কাটার উপযোগী</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> ছাদবাগান, কিচেন গার্ডেন, টব ও বাণিজ্যিক চাষ</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>ধনেপাতা তুলনামূলকভাবে <strong>মৃদু ঠান্ডা ও সহনীয় আবহাওয়ায়</strong> ভালোভাবে বেড়ে ওঠে। এই বারোমাসি জাতটি উপযুক্ত পরিবেশ ও পরিচর্যার মাধ্যমে বছরের বিভিন্ন সময়ে চাষ করা যেতে পারে। বাংলাদেশে সাধারণভাবে <strong>অক্টোবর থেকে মার্চ</strong> সময়টি ধনেপাতা চাষের জন্য বিশেষভাবে অনুকূল। উষ্ণ সময়ে চাষ করলে অতিরিক্ত রোদ ও পানির ঘাটতি থেকে গাছকে রক্ষা করা প্রয়োজন।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>ধনেপাতার জন্য <strong>ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি খুব শক্ত বা পানি জমে থাকে এমন হলে বীজের অঙ্কুরোদগম ও শিকড়ের বৃদ্ধি ব্যাহত হতে পারে।</p> 

<ul> 
<li>🌱 মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🏖️ ভারী মাটি হলে কিছু মোটা বালি বা পার্লাইট মিশিয়ে ড্রেনেজ উন্নত করুন।</li> 
<li>💧 পানি জমার সমস্যা থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপনের পদ্ধতি</h3> 
<p>ধনেপাতার বীজ সরাসরি বেড, টব বা গ্রো ব্যাগে বপন করা যায়। মাটি ঝুরঝুরে করে বীজ সমানভাবে ছড়িয়ে দিন এবং <strong>প্রায় ০.৫–১ সেমি মাটি দিয়ে হালকাভাবে ঢেকে</strong> দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। অতিরিক্ত পানি দিলে বীজ পচে যেতে পারে। চারা গজানোর পর অতিরিক্ত ঘন জায়গায় প্রয়োজন অনুযায়ী পাতলা করে দিলে প্রতিটি গাছ পর্যাপ্ত জায়গা ও পুষ্টি পাবে।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>বারোমাসি ধনেপাতা টব, ট্রে বা গ্রো ব্যাগে খুব সহজেই চাষ করা যায়। মাটির মিশ্রণ হিসেবে ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>পাতার জন্য চাষ করায় খুব গভীর টবের প্রয়োজন না হলেও মাটির গভীরতা পর্যাপ্ত রাখা এবং নিচে ভালো ড্রেনেজ ব্যবস্থা থাকা জরুরি।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>ধনেপাতা <strong>সকালের রোদ ও উজ্জ্বল আলোতে</strong> ভালোভাবে বেড়ে উঠতে পারে। প্রতিদিন কয়েক ঘণ্টা আলো পাওয়া যায় এমন জায়গায় টব বা বেড রাখুন। অতিরিক্ত তীব্র রোদে মাটি দ্রুত শুকিয়ে গেলে প্রয়োজন অনুযায়ী হালকা ছায়ার ব্যবস্থা করা যেতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে পানি দিন। ধনেপাতার জন্য নিয়মিত হালকা আর্দ্রতা প্রয়োজন হলেও মাটিতে পানি জমিয়ে রাখা যাবে না। টবে চাষ করলে অতিরিক্ত পানি যেন ড্রেনেজ ছিদ্র দিয়ে বের হয়ে যেতে পারে তা নিশ্চিত করুন।</p> 

<h3>🌿 সার ও পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>🍂 নিয়মিত অল্প পরিমাণে কম্পোস্ট বা ভার্মিকম্পোস্ট প্রয়োগ করুন।</li> 
<li>🌱 আগাছা নিয়মিত পরিষ্কার করুন।</li> 
<li>💧 মাটির আর্দ্রতা বজায় রাখুন, তবে জলাবদ্ধতা এড়িয়ে চলুন।</li> 
<li>🌿 অতিরিক্ত ঘন চারা হলে প্রয়োজন অনুযায়ী পাতলা করে দিন।</li> 
<li>☀️ পর্যাপ্ত আলো-বাতাস চলাচলের ব্যবস্থা করুন।</li> 
<li>🐛 পাতায় পোকামাকড় বা রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
</ul> 

<h3>✂️ বারবার পাতা কাটার সঠিক পদ্ধতি</h3> 
<p>ধনেপাতা যখন পর্যাপ্ত বড় ও ঘন হয়ে উঠবে, তখন প্রয়োজন অনুযায়ী পাতা কাটা যায়। <strong>গাছের একেবারে গোড়া থেকে সব পাতা একসঙ্গে না কেটে</strong> কিছু অংশ রেখে কাটলে গাছ পুনরায় নতুন পাতা গজানোর সুযোগ পায়।</p> 

<p>পরিষ্কার ও ধারালো কাঁচি দিয়ে প্রয়োজনমতো পাতা কেটে নিন। নিয়মিত পরিচর্যা, পর্যাপ্ত পুষ্টি ও সঠিক পানি ব্যবস্থাপনা থাকলে বারবার তাজা ধনেপাতা সংগ্রহ করা সম্ভব হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>ইম্পোর্টেড লার্জ-লিফ হাইব্রিড ধনে পাতা</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, ছাদবাগান, বারান্দা, টব, ট্রে, গ্রো ব্যাগ এবং কৃষিজমিতে চাষ করা যায়। অল্প জায়গায়ও সহজে চাষ করা যায় বলে শহুরে বাগানের জন্য এটি বিশেষভাবে উপযোগী।</p> 

<h3>🌿 কেন এই ধনেপাতা চাষ করবেন?</h3> 
<ul> 
<li>🌿 বড় আকারের কোমল ও ঘন সবুজ পাতা</li> 
<li>🌱 দ্রুত বৃদ্ধির জন্য উপযোগী হাইব্রিড জাত</li> 
<li>✂️ বারবার পাতা কাটার সুযোগ</li> 
<li>🌿 দীর্ঘসময় তাজা পাতা পাওয়ার সম্ভাবনা</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে সহজে চাষ করা যায়</li> 
<li>🍲 সালাদ, ভর্তা, তরকারি ও বিভিন্ন রান্নায় ব্যবহারযোগ্য</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>ইম্পোর্টেড লার্জ-লিফ হাইব্রিড ধনে পাতা (বারোমাসি জাত)</strong> দিয়ে আপনার ছাদবাগান, বারান্দা বা কিচেন গার্ডেনে চাষ করুন সতেজ, সুগন্ধি ও ঘন সবুজ ধনেপাতা। সঠিক পরিচর্যায় বারবার তাজা পাতা সংগ্রহের সুযোগ তৈরি করুন। <strong>আজই অর্ডার করুন!</strong></p>', 'VEG-1517', 15, 15, 1, 0, 25, '[]', '2026-09-24T01:48:42.032+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f2e1bd04-1ba1-4209-9370-7833925cade2', 'ক্যালেন্ডুলা ফুলের বীজ (মিক্সড কালার)', 'calendula-mixed-color-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732424692-zcmymzd.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, হলুদ ও কমলা রঙের দৃষ্টিনন্দন ফুল, টব, ছাদবাগান ও বাগানের জন্য আদর্শ।', '<h3>🌼 ক্যালেন্ডুলা ফুলের বীজ (মিক্সড কালার)</h3>

<p><strong>ক্যালেন্ডুলা ফুলের বীজ (মিক্সড কালার)</strong> দিয়ে সহজেই আপনার বাগানে ফুটিয়ে তুলুন হলুদ, কমলা ও সোনালি রঙের আকর্ষণীয় ফুল। এই শীতকালীন ফুলটি টব, ছাদবাগান, বারান্দা, ফুলের বেড কিংবা খোলা বাগানে চাষের জন্য উপযোগী। পর্যাপ্ত আলো ও সঠিক পরিচর্যায় গাছ সুস্থভাবে বেড়ে ওঠে এবং বাগানকে রঙিন ও প্রাণবন্ত করে তোলে।</p>

<h3>📋 Product Specifications</h3>

<ul>
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ১৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>

<ul>
<li>🌼 হলুদ, কমলা ও সোনালি রঙের আকর্ষণীয় ফুল</li>
<li>🌱 শীতকালীন ফুলের জাত</li>
<li>🌸 সঠিক পরিচর্যায় দীর্ঘসময় ফুল ফোটার সম্ভাবনা</li>
<li>🪴 টব ও গ্রো ব্যাগে চাষের জন্য উপযোগী</li>
<li>🏡 ছাদবাগান, বারান্দা ও বাড়ির বাগান সাজাতে উপযোগী</li>
<li>🌿 ফুলের বেড ও বাগানের বর্ডারে লাগানো যায়</li>
</ul>

<h3>📅 চাষের উপযুক্ত মৌসুম</h3>

<p><strong>ক্যালেন্ডুলা একটি শীতকালীন ফুল।</strong> বাংলাদেশে সাধারণত <strong>অক্টোবর থেকে নভেম্বর মাসে</strong> বীজ বপন করা ভালো। শীতের মৃদু আবহাওয়ায় গাছের বৃদ্ধি ও ফুল ফোটার জন্য উপযোগী পরিবেশ পাওয়া যায়। অঞ্চলভেদে তাপমাত্রা ও আবহাওয়া অনুযায়ী বপনের সময় কিছুটা পরিবর্তিত হতে পারে।</p>

<p><strong>🌡️ বিশেষ পরামর্শ:</strong> অতিরিক্ত গরম ও জলাবদ্ধতা এড়িয়ে চলুন। গাছকে প্রতিদিন পর্যাপ্ত রোদ পায় এমন স্থানে রাখলে ভালো ফুল পাওয়ার সম্ভাবনা থাকে।</p>

<h3>🌱 মাটি প্রস্তুতি</h3>

<p>ক্যালেন্ডুলা চাষের জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশন সুবিধাযুক্ত মাটি উপযোগী। দোআঁশ মাটির সঙ্গে ভালোভাবে পচানো কম্পোস্ট মিশিয়ে চাষমাধ্যম তৈরি করা যায়।</p>

<ul>
<li>মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li>
<li>পচা কম্পোস্ট বা জৈব সার মাটির সঙ্গে মিশিয়ে দিন।</li>
<li>টব বা বেডে পানি বের হওয়ার পর্যাপ্ত ব্যবস্থা রাখুন।</li>
<li>অতিরিক্ত পানি জমে থাকে এমন স্থান এড়িয়ে চলুন।</li>
</ul>

<h3>🌿 বীজ বপন ও চারা তৈরি</h3>

<p>বীজ সরাসরি টব, বাগানের বেড বা সিড ট্রেতে বপন করা যায়। বীজ মাটিতে হালকাভাবে ঢেকে দিয়ে স্প্রে করে পানি দিন। মাটি আর্দ্র রাখুন, তবে অতিরিক্ত ভিজিয়ে রাখবেন না। চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন। চারা শক্তিশালী হলে প্রয়োজন অনুযায়ী বড় টব বা নির্দিষ্ট স্থানে স্থানান্তর করা যায়।</p>

<h3>🪴 টব ও ছাদবাগানে চাষ</h3>

<p>ক্যালেন্ডুলা টব, গ্রো ব্যাগ, বারান্দার পাত্র ও ছাদবাগানে সহজেই চাষ করা যায়। পাত্রের নিচে ড্রেনেজ ছিদ্র থাকা জরুরি। হালকা, উর্বর ও পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন। গাছের চারার মধ্যে পর্যাপ্ত দূরত্ব রাখলে আলো-বাতাস চলাচল সহজ হয় এবং গাছের বৃদ্ধিতে সহায়তা করে।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>

<p>ক্যালেন্ডুলা পর্যাপ্ত সূর্যালোক পছন্দ করে। প্রতিদিন প্রায় ৪–৬ ঘণ্টা বা তার বেশি রোদ পাওয়া যায় এমন স্থানে রাখার চেষ্টা করুন। মাটির উপরিভাগ শুকাতে শুরু করলে পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</p>

<h3>🌿 সার ও পরিচর্যা</h3>

<ul>
<li>গাছের বৃদ্ধির জন্য পরিমিত পচা কম্পোস্ট ব্যবহার করুন।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন।</li>
<li>শুকনো ও মলিন ফুল সরিয়ে ফেলুন, এতে নতুন ফুল আসতে সহায়তা করতে পারে।</li>
<li>গাছ অতিরিক্ত ঘন হলে প্রয়োজন অনুযায়ী চারা পাতলা করুন।</li>
<li>অতিরিক্ত নাইট্রোজেন সার ব্যবহার এড়িয়ে চলুন; এতে পাতার বৃদ্ধি বেশি হলেও ফুল কম হতে পারে।</li>
</ul>

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3>

<p>ক্যালেন্ডুলা গাছে এফিড ও অন্যান্য ছোট পোকামাকড় আক্রমণ করতে পারে। নিয়মিত পাতা ও কচি ডগা পরীক্ষা করুন। আক্রান্ত অংশ সরিয়ে ফেলুন এবং গাছের চারপাশ পরিষ্কার রাখুন। অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতা এড়িয়ে চলুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত জৈব বা বালাই ব্যবস্থাপনা পণ্য লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h3>🌼 ফুল ফোটা ও পরিচর্যা</h3>

<p>অনুকূল আবহাওয়া ও সঠিক পরিচর্যায় ক্যালেন্ডুলা গাছে উজ্জ্বল হলুদ, কমলা ও সোনালি রঙের ফুল ফুটতে পারে। শুকিয়ে যাওয়া ফুল নিয়মিত সরিয়ে দিলে গাছের সৌন্দর্য বজায় থাকে এবং নতুন ফুল ফোটার সুযোগ তৈরি হতে পারে।</p>

<h3>🏡 কোথায় চাষ করা যায়?</h3>

<ul>
<li>🏡 বাড়ির বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌿 বারান্দা</li>
<li>🌼 ফুলের বেড ও বর্ডার</li>
<li>🌳 খোলা বাগান ও ল্যান্ডস্কেপ</li>
</ul>

<h3>💚 কেন ক্যালেন্ডুলা ফুলের বীজ চাষ করবেন?</h3>

<p>হলুদ, কমলা ও সোনালি রঙের ফুল দিয়ে শীতকালীন বাগান সাজাতে <strong>ক্যালেন্ডুলা ফুলের বীজ (মিক্সড কালার)</strong> একটি সুন্দর নির্বাচন। টব থেকে শুরু করে খোলা বাগান—বিভিন্ন জায়গায় চাষ করা যায়। পর্যাপ্ত আলো, সঠিক পানি ব্যবস্থাপনা ও নিয়মিত পরিচর্যায় রঙিন ফুলে বাগানকে আরও প্রাণবন্ত করে তুলতে পারেন।</p>

<p><strong>🌼 আজই অর্ডার করুন এবং আপনার বাগান সাজিয়ে তুলুন ক্যালেন্ডুলার উজ্জ্বল রঙিন ফুলে!</strong></p>', 'FUL-1506', 0, 0, 0, 0, 25, '[]', '2026-09-24T01:42:32.537+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('a1bba17f-6670-46ed-bb20-2764774159bb', 'হাইড্রেনজিয়া (রঙ পরিবর্তনকারী)-ফুলের বীজ - Mixed Color', 'color-changing-hydrangea-mixed-color-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732436902-92fzkz0.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- গ্রীষ্মকালীন\",\"বসন্তকাল\"]', 'আনুমানিক ৪৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের বড় ফুলের গুচ্ছ, টব, ছাদবাগান ও বাগানের জন্য আদর্শ।', 'হাইড্রেনজিয়া (রঙ পরিবর্তনকারী) ফুলের বীজ - Mixed Color দিয়ে আপনার বাগানকে সাজিয়ে তুলুন বড় আকৃতির গুচ্ছাকারে ফোটা মনোমুগ্ধকর ফুলে। উপযুক্ত মাটির pH অনুযায়ী কিছু হাইড্রেনজিয়া জাতের ফুলের রঙ পরিবর্তিত হতে পারে, যা এই গাছটিকে আরও আকর্ষণীয় করে তোলে। টব, ছাদবাগান, বারান্দা, বাগানের বর্ডার ও ল্যান্ডস্কেপ সাজানোর জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ ও দীর্ঘসময় ধরে দৃষ্টিনন্দন ফুল পাওয়া যায়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৪৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1538', 3, 3, 1, 0, 25, '[]', '2026-09-24T01:42:37.944+00:00', '2026-10-19T08:00:15.091827+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('01862530-d3f9-4ce7-a7a1-f62ece3bf087', 'এরাবিয়ান হাইব্রিড শসা বীজ', 'arabian-hybrid-cucumber-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378434271-2dkkpry.webp', NULL, 170, 120, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[]', 'আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | এরাবিয়ান হাইব্রিড শসা, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🥒 এরাবিয়ান হাইব্রিড শসা বীজ</h3> 

<p><strong>এরাবিয়ান হাইব্রিড শসা বীজ</strong> উন্নত মানের শসা চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং আকর্ষণীয় ও সুস্বাদু শসা উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান, টব ও বাণিজ্যিক চাষ—বিভিন্ন ধরনের চাষাবাদের জন্য এটি উপযোগী।</p> 

<h3>📋 Product Specifications</h3> 

<ul> 
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li><strong>🌏 উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li> 
</ul> 

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3> 

<ul> 
<li>🥒 উন্নতমানের হাইব্রিড শসার জাত</li> 
<li>🌱 শক্তিশালী গাছ বৃদ্ধিতে সহায়ক</li> 
<li>🥒 আকর্ষণীয় ও সুস্বাদু শসা উৎপাদনের জন্য উপযোগী</li> 
<li>🌿 সঠিক পরিচর্যায় ভালো ফলনের সম্ভাবনা</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🏡 বাড়ির বাগান ও ছাদবাগানের জন্য উপযোগী</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
</ul> 

<h3>📅 চাষের উপযুক্ত সময়</h3> 

<p>শসা উষ্ণ ও পর্যাপ্ত আলোযুক্ত আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে সাধারণত <strong>ফেব্রুয়ারি থেকে মে</strong> এবং অনুকূল পরিবেশে বর্ষাকালের শুরুতেও শসা চাষ করা যায়। অতিরিক্ত ঠান্ডা বা দীর্ঘসময় জলাবদ্ধ পরিবেশ এড়িয়ে চলা ভালো।</p> 

<h3>🌱 মাটি প্রস্তুতি</h3> 

<p>শসার জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশন সুবিধাযুক্ত দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকলে গাছের বৃদ্ধি ও ফল উৎপাদনে সহায়তা করতে পারে।</p> 

<ul> 
<li>মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করে নিন।</li> 
<li>পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>জলাবদ্ধতা এড়াতে উঁচু বেড বা পর্যাপ্ত ড্রেনেজের ব্যবস্থা করুন।</li> 
</ul> 

<h3>🌿 বীজ বপন পদ্ধতি</h3> 

<p>শসার বীজ সরাসরি জমি, বেড, টব বা গ্রো ব্যাগে বপন করা যায়। বীজ প্রায় <strong>২–৩ সেন্টিমিটার</strong> গভীরে বপন করে হালকা মাটি দিয়ে ঢেকে দিন। বপনের পর হালকা পানি দিতে হবে, যাতে মাটি আর্দ্র থাকে কিন্তু অতিরিক্ত পানি জমে না যায়।</p> 

<p>চারা গজানোর পর দুর্বল বা অতিরিক্ত ঘন চারা সরিয়ে সুস্থ গাছগুলোর জন্য পর্যাপ্ত জায়গা ও আলো নিশ্চিত করুন।</p> 

<h3>🪴 টব ও ছাদবাগানে চাষ</h3> 

<p>এরাবিয়ান হাইব্রিড শসা টব, গ্রো ব্যাগ বা ছাদবাগানের পাত্রে চাষ করা যায়। পাত্রে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। মাটি, কোকোপিট ও পচা কম্পোস্টের মিশ্রণ ব্যবহার করলে হালকা ও পানি নিষ্কাশনযোগ্য চাষমাধ্যম তৈরি করা যায়।</p> 

<p>শসা লতানো গাছ হওয়ায় <strong>মাচা বা শক্ত সাপোর্ট</strong> ব্যবহার করলে লতাগুলো সহজে বেড়ে উঠতে পারে এবং ফল মাটির সংস্পর্শে কম আসে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 

<p>শসার সুস্থ বৃদ্ধি ও ফল উৎপাদনের জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় <strong>৬–৮ ঘণ্টা আলো</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো। মাটি শুকিয়ে গেলে নিয়মিত পানি দিন, বিশেষ করে ফুল ও ফল ধরার সময় মাটিতে প্রয়োজনীয় আর্দ্রতা বজায় রাখা গুরুত্বপূর্ণ। তবে অতিরিক্ত পানি দিয়ে জলাবদ্ধতা তৈরি করা উচিত নয়।</p> 

<h3>🌿 সার ও পরিচর্যা</h3> 

<ul> 
<li>গাছের বৃদ্ধির পর্যায়ে প্রয়োজন অনুযায়ী পচা কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li> 
<li>ফুল ও ফল ধরার সময় সুষম পুষ্টি নিশ্চিত করুন।</li> 
<li>নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>মাচা বা সাপোর্টে লতা সঠিকভাবে উঠিয়ে দিন।</li> 
<li>অতিরিক্ত ঘন লতা ও শুকনো পাতা প্রয়োজন অনুযায়ী পরিষ্কার করুন।</li> 
</ul> 

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3> 

<p>শসা গাছে এফিড, থ্রিপস, সাদা মাছি ও বিভিন্ন ধরনের পাতাখেকো পোকা আক্রমণ করতে পারে। নিয়মিত পাতার নিচের অংশ, কচি ডগা ও ফল পরীক্ষা করুন। আক্রান্ত পাতা বা ফল দ্রুত সরিয়ে ফেলুন। অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতা এড়িয়ে পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত জৈব বা বালাইনাশক পণ্য লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p> 

<h3>🥒 শসা সংগ্রহ</h3> 

<p>শসা অতিরিক্ত বড় ও বীজ শক্ত হওয়ার আগেই প্রয়োজন অনুযায়ী সংগ্রহ করা ভালো। নিয়মিত পরিপক্ব শসা সংগ্রহ করলে গাছে নতুন ফল ধরার সুযোগ তৈরি হতে পারে। কচি অবস্থায় সংগ্রহ করলে সাধারণত শসা বেশি কোমল ও সুস্বাদু থাকে।</p> 

<h3>🏡 কোথায় চাষ করা যায়?</h3> 

<ul> 
<li>🏠 বাড়ির বাগান</li> 
<li>🌿 কিচেন গার্ডেন</li> 
<li>🏢 ছাদবাগান</li> 
<li>🪴 টব ও গ্রো ব্যাগ</li> 
<li>🌱 বারান্দা ও ছোট জায়গা</li> 
<li>🌾 খোলা জমি</li> 
<li>🧑‍🌾 বাণিজ্যিক চাষাবাদ</li> 
</ul> 

<h3>💚 কেন এরাবিয়ান হাইব্রিড শসা চাষ করবেন?</h3> 

<p><strong>এরাবিয়ান হাইব্রিড শসা</strong> শক্তিশালী গাছ এবং আকর্ষণীয় ও সুস্বাদু শসা উৎপাদনের জন্য একটি উপযোগী নির্বাচন। ছোট জায়গায় টব বা গ্রো ব্যাগে চাষের পাশাপাশি খোলা জমিতেও চাষ করা যায়। সঠিক পরিচর্যা, পর্যাপ্ত আলো, পানি ও পুষ্টি নিশ্চিত করলে ভালো ফলনের সম্ভাবনা থাকে।</p> 

<p><strong>🥒 নিজের বাগানে তাজা শসা চাষ শুরু করতে আজই অর্ডার করুন!</strong></p>', 'VEG-1504', 16, 16, 1, 0, 28, '[]', '2026-09-24T01:46:42.425+00:00', '2026-10-17T07:49:04.594666+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('cb7906a9-3d5a-4f7d-914f-be0bc86cf8cf', 'মালভা জেরিনা (রঙিন ডোরাকাটা) ফুলের বীজ', 'malva-zebrina-striped-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732438870-3lc4mc9.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, রঙিন ডোরাকাটা দৃষ্টিনন্দন ফুল, টব, ছাদবাগান ও বাগানের জন্য আদর্শ।', 'মালভা জেরিনা (রঙিন ডোরাকাটা) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অনন্য নকশার রঙিন ডোরাকাটা আকর্ষণীয় ফুল। এই শোভাময় ফুলটি তার বড় আকৃতির পাপড়ি ও বৈচিত্র্যময় রঙের জন্য বিশেষভাবে জনপ্রিয়। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুলে ভরে ওঠে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1527', 19, 19, 1, 0, 31, '[]', '2026-09-24T01:42:36.169+00:00', '2026-10-12T11:24:32.401251+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0a8cfcd5-20ee-4e33-b26a-7830538c2734', 'হাইব্রিড চায়নিজ লাল পেঁয়াজ বীজ', 'hybrid-chinese-red-onion-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364694251-47b0nyw.webp', NULL, 120, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ৫০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড় আকৃতির, ঝাঁঝালো, উচ্চ ফলনশীল ও দীর্ঘদিন সংরক্ষণযোগ্য পেঁয়াজ উৎপাদন করুন।', '<escape>```html
<h2>হাইব্রিড চায়নিজ লাল পেঁয়াজ বীজ</h2>

<p>হাইব্রিড চায়নিজ লাল পেঁয়াজ একটি উন্নত মানের পেঁয়াজের জাত, যা আকর্ষণীয় লাল রঙের গোলাকার ও সমান আকারের কন্দ উৎপাদনের জন্য পরিচিত। এর ঝাঁঝালো স্বাদ ও সুগন্ধ রান্নার স্বাদ বাড়াতে সহায়তা করে। উপযুক্ত মাটি, অনুকূল আবহাওয়া এবং নিয়মিত পরিচর্যায় এ জাতের পেঁয়াজের ভালো বৃদ্ধি ও ফলন পাওয়ার সম্ভাবনা থাকে। পারিবারিক বাগান থেকে শুরু করে বাণিজ্যিক চাষ—উভয় ক্ষেত্রেই এটি চাষের জন্য বিবেচনা করতে পারেন।</p>

<h2>পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>পেঁয়াজের রং:</strong> আকর্ষণীয় লাল</li>
  <li><strong>কন্দের আকৃতি:</strong> গোলাকার ও সমান আকারের হওয়ার উপযোগী</li>
  <li><strong>ব্যবহার:</strong> রান্না, পারিবারিক চাষ ও বাণিজ্যিক উৎপাদন</li>
</ul>

<h2>হাইব্রিড চায়নিজ লাল পেঁয়াজের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় লাল রং:</strong> পেঁয়াজের কন্দে সুন্দর লাল রং থাকায় দেখতে আকর্ষণীয় হয়।</li>
  <li><strong>গোলাকার কন্দ:</strong> সঠিক পরিচর্যা ও উপযুক্ত পরিবেশে সমান আকারের গোলাকার কন্দ গঠনে সহায়ক।</li>
  <li><strong>ঝাঁঝালো স্বাদ ও সুগন্ধ:</strong> দৈনন্দিন রান্না এবং বিভিন্ন খাবার তৈরিতে উপযোগী।</li>
  <li><strong>উন্নত বৃদ্ধির সম্ভাবনা:</strong> পর্যাপ্ত আলো, সুষম পুষ্টি ও সঠিক সেচ পেলে গাছের বৃদ্ধি ভালো হতে পারে।</li>
  <li><strong>বিভিন্ন চাষের উপযোগিতা:</strong> জমিতে পরিকল্পিতভাবে চাষের পাশাপাশি উপযুক্ত পাত্রে সীমিত পরিসরে পরীক্ষামূলক চাষ করা যেতে পারে।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>
<p>পেঁয়াজের বীজ বপনের সময় স্থানীয় আবহাওয়া, তাপমাত্রা ও চাষপদ্ধতির ওপর নির্ভর করে। বাংলাদেশের অনেক এলাকায় শীতকালীন মৌসুম পেঁয়াজ চাষের জন্য উপযোগী। বীজ বপনের আগে আপনার এলাকার কৃষি আবহাওয়া ও স্থানীয় কৃষি কর্মকর্তার পরামর্শ অনুসরণ করুন।</p>

<h2>মাটি প্রস্তুত করার পদ্ধতি</h2>
<ul>
  <li>ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে—এমন মাটি নির্বাচন করুন।</li>
  <li>জমির মাটি ভালোভাবে চাষ দিয়ে আগাছা, পাথর ও অন্যান্য আবর্জনা পরিষ্কার করুন।</li>
  <li>মাটির উর্বরতা অনুযায়ী পচা জৈব সার বা কম্পোস্ট মিশিয়ে নিন।</li>
  <li>জমিতে পানি জমে থাকে এমন ব্যবস্থা এড়িয়ে চলুন, কারণ অতিরিক্ত আর্দ্রতায় পেঁয়াজের শিকড় ও কন্দ ক্ষতিগ্রস্ত হতে পারে।</li>
</ul>

<h2>বীজ বপন ও চারা তৈরির নিয়ম</h2>
<ol>
  <li>পরিষ্কার ও ঝুরঝুরে মাটিতে বীজতলা তৈরি করুন।</li>
  <li>বীজ সমানভাবে ছিটিয়ে হালকাভাবে মাটি দিয়ে ঢেকে দিন। অতিরিক্ত গভীরে বীজ বপন করবেন না।</li>
  <li>বীজ বপনের পর হালকা পানি দিন, যাতে মাটি আর্দ্র থাকে কিন্তু পানি জমে না যায়।</li>
  <li>চারা গজানোর পর আগাছা পরিষ্কার করুন এবং চারার গোড়ায় পানি জমতে দেবেন না।</li>
  <li>চারা উপযুক্ত আকার ও শক্তি অর্জন করলে সতর্কতার সঙ্গে মূল জমিতে রোপণ করুন।</li>
</ol>

<h2>সেচ ও পরিচর্যা</h2>
<ul>
  <li><strong>সেচ:</strong> মাটির আর্দ্রতা বুঝে প্রয়োজনমতো পানি দিন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন।</li>
  <li><strong>আগাছা নিয়ন্ত্রণ:</strong> নিয়মিত আগাছা পরিষ্কার রাখুন, যাতে গাছ পর্যাপ্ত আলো ও পুষ্টি পায়।</li>
  <li><strong>সার ব্যবস্থাপনা:</strong> মাটির অবস্থা ও গাছের বৃদ্ধির পর্যায় অনুযায়ী সুষম সার ব্যবহার করুন। সম্ভব হলে মাটি পরীক্ষা করে সারের পরিমাণ নির্ধারণ করুন।</li>
  <li><strong>আলো:</strong> পর্যাপ্ত সূর্যালোক পাওয়া যায় এমন স্থানে চাষ করুন।</li>
  <li><strong>বায়ু চলাচল:</strong> গাছের ঘনত্ব উপযুক্ত রাখুন, যাতে বাতাস চলাচল করতে পারে এবং রোগের ঝুঁকি কমে।</li>
</ul>

<h2>রোগ ও পোকামাকড় ব্যবস্থাপনা</h2>
<p>পেঁয়াজের গাছে রোগ ও পোকামাকড়ের লক্ষণ নিয়মিত পর্যবেক্ষণ করুন। আক্রান্ত গাছ বা পাতা দেখা গেলে দ্রুত ব্যবস্থা নিন। জমিতে পানি জমতে দেবেন না এবং পরিচ্ছন্ন চাষাবাদ বজায় রাখুন। প্রয়োজন হলে স্থানীয় কৃষি কর্মকর্তার পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক নির্ধারিত মাত্রায় ব্যবহার করুন।</p>

<h2>ফসল সংগ্রহ ও সংরক্ষণ</h2>
<p>গাছের পাতা হলুদ হয়ে শুকাতে শুরু করলে এবং কন্দ পরিপক্বতার লক্ষণ দেখালে ফসল সংগ্রহের উপযুক্ত সময় নির্ধারণ করুন। সংগ্রহের পর কন্দ পরিষ্কার, শুকনো ও বাতাস চলাচল করে এমন স্থানে ভালোভাবে শুকিয়ে নিন। সংরক্ষণের আগে ক্ষতিগ্রস্ত বা পচা কন্দ আলাদা করুন। দীর্ঘদিন ভালো রাখতে শুষ্ক, ঠান্ডা ও বায়ু চলাচল উপযোগী স্থানে সংরক্ষণ করুন। সংরক্ষণের স্থায়িত্ব কন্দের পরিপক্বতা, শুকানোর পদ্ধতি ও পরিবেশের ওপর নির্ভরশীল।</p>

<h2>কেন হাইব্রিড চায়নিজ লাল পেঁয়াজ বীজ নির্বাচন করবেন?</h2>
<ul>
  <li>আকর্ষণীয় লাল রঙের পেঁয়াজ উৎপাদনের জন্য উপযোগী।</li>
  <li>ঝাঁঝালো স্বাদ ও সুগন্ধযুক্ত পেঁয়াজ রান্নায় ব্যবহার করা যায়।</li>
  <li>সঠিক পরিচর্যায় ভালো বৃদ্ধি ও ফলনের সম্ভাবনা রয়েছে।</li>
  <li>পারিবারিক চাষ ও বাণিজ্যিক উৎপাদনের পরিকল্পনায় বিবেচনা করা যায়।</li>
  <li>আনুমানিক ৫০০টি বীজের প্যাকেট—চাষের পরিকল্পনা অনুযায়ী ব্যবহার করতে পারবেন।</li>
</ul>

<h2>Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>আপনার বাগান বা কৃষিজমিতে পেঁয়াজ চাষের পরিকল্পনা করছেন? হাইব্রিড চায়নিজ লাল পেঁয়াজ বীজ সংগ্রহ করুন Ss Seed Shop থেকে। সঠিক বীজ বপন, পরিচর্যা ও ফসল ব্যবস্থাপনার মাধ্যমে আপনার চাষের পরিকল্পনাকে এগিয়ে নিন।</p>

<p><strong>Ss Seed Shop - সেরা বীজ, সেরা ফলন</strong></p>
<p><strong>আজই অর্ডার করুন!</strong></p>
```</escape>', 'VEG-1510', 3, 3, 1, 0, 35, '[]', '2026-09-24T01:42:44.64+00:00', '2026-10-17T05:26:04.982544+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('85a9de6f-ae25-4f1c-a28d-09daa88e5f93', 'উন্নত জাতের হাইব্রিড বরবটি বীজ', 'premium-hybrid-yardlong-bean-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949225640-lehrfk.png', NULL, 150, 75, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৫ গ্রাম বা ৩০ টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, লম্বা, কোমল ও সুস্বাদু বরবটি উৎপাদনের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3> 
<p><strong>উন্নত জাতের হাইব্রিড বরবটি</strong> একটি উচ্চ ফলনশীল ও দ্রুত বর্ধনশীল সবজি জাত, যা লম্বা, সবুজ, কোমল ও সুস্বাদু শুঁটি উৎপাদনের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ তৈরি হয় এবং দীর্ঘসময় ধরে ফলন দিতে সহায়তা করে।</p> 

<p>রান্না, ভাজি ও বিভিন্ন সবজি পদ তৈরিতে বরবটির ব্যাপক চাহিদা রয়েছে। ছাদবাগান, কিচেন গার্ডেন, বড় টব বা গ্রো ব্যাগ এবং বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন। 🌱</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>জাত:</strong> উন্নত জাতের হাইব্রিড বরবটি</li> 
<li>🥬 <strong>ফলের বৈশিষ্ট্য:</strong> লম্বা, সবুজ, কোমল ও সুস্বাদু শুঁটি</li> 
<li>🌱 <strong>গাছের বৈশিষ্ট্য:</strong> শক্তিশালী ও দ্রুত বর্ধনশীল</li> 
<li>🛡️ <strong>সহনশীলতা:</strong> রোগ সহনশীল</li> 
<li>🌿 <strong>ফলন:</strong> দীর্ঘসময় ধরে ফলন দিতে সক্ষম</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌤️ চাষের উপযুক্ত মৌসুম ও সময়</h3> 
<ul> 
<li>🌱 <strong>প্রধান মৌসুম:</strong> ফেব্রুয়ারি থেকে জুলাই মাস পর্যন্ত (বাংলা ফাল্গুন থেকে আষাঢ়-শ্রাবণ) বরবটি বীজ বপনের উপযোগী সময়।</li> 
<li>🌿 <strong>অন্যান্য সময়:</strong> উষ্ণ ও আর্দ্র অঞ্চলে সেপ্টেম্বর–অক্টোবর মাসেও কিছু জাতের বরবটি চাষ করা যায়।</li> 
<li>❄️ <strong>শীতকাল:</strong> অতিরিক্ত ঠান্ডা আবহাওয়ায় বরবটির বৃদ্ধি ও ফলন ব্যাহত হতে পারে, তাই শীতের সময় বীজ বপন না করাই ভালো।</li> 
</ul> 

<p>বরবটি উষ্ণ আবহাওয়া ও পর্যাপ্ত সূর্যালোক পছন্দ করে। বীজ বপনের সময় এমনভাবে নির্বাচন করুন, যাতে গাছের বৃদ্ধির সময় পর্যাপ্ত উষ্ণতা ও আলো পাওয়া যায়।</p> 

<h3>🪴 বরবটির জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 

<p><strong>১. মাটির ধরন</strong><br> 
বরবটি চাষের জন্য <strong>দোআঁশ ও বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি ঝুরঝুরে, উর্বর ও ভালো পানি নিষ্কাশনযোগ্য হওয়া প্রয়োজন। জমিতে দীর্ঘসময় পানি জমে থাকা যাবে না।</p> 

<p><strong>২. চাষ ও মই দেওয়া</strong><br> 
জমি ভালোভাবে <strong>৪–৫ বার চাষ ও মই</strong> দিয়ে মাটি ঝুরঝুরে ও সমান করে নিন। জমি থেকে আগাছা, পুরোনো শিকড় ও অন্যান্য আবর্জনা পরিষ্কার করে ফেলুন।</p> 

<p><strong>৩. সার প্রয়োগ</strong><br> 
জমি তৈরির সময় মাটির সঙ্গে পর্যাপ্ত <strong>ভালোভাবে পচা জৈব সার বা গোবর</strong> মিশিয়ে দিন। মাটির প্রয়োজন অনুযায়ী টিএসপি ও পটাশ সারও প্রয়োগ করা যেতে পারে। সার মাটির সঙ্গে ভালোভাবে মিশিয়ে ব্যবহার করুন।</p> 

<p><strong>৪. মাদা বা বেড তৈরি</strong><br> 
পানি নিষ্কাশনের সুবিধার জন্য জমি সামান্য উঁচু করে <strong>বেড বা মাদা</strong> তৈরি করুন। বর্ষাকালে উঁচু বেড ব্যবহার করলে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে সাহায্য করে।</p> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>বরবটির বীজ সাধারণত সরাসরি জমি, মাদা বা বড় টবে বপন করা যায়। বীজ বপনের আগে মাটি ভালোভাবে ঝুরঝুরে ও হালকা আর্দ্র করে নিন। সাধারণভাবে বীজ <strong>প্রায় ২–৩ সেন্টিমিটার গভীরে</strong> বপন করা যেতে পারে।</p> 

<p>প্রতিটি মাদায় প্রয়োজন অনুযায়ী কয়েকটি বীজ বপন করুন। চারা গজানোর পর দুর্বল চারা সরিয়ে সবল গাছগুলো রেখে দিন। এতে গাছের মধ্যে পর্যাপ্ত জায়গা থাকবে এবং স্বাস্থ্যবান লতা তৈরি হতে সহায়তা করবে।</p> 

<h3>🌿 মাচা বা ট্রেলিস তৈরির পদ্ধতি</h3> 
<p>বরবটি একটি লতানো গাছ। তাই গাছের বৃদ্ধি শুরু হওয়ার পর <strong>শক্ত মাচা বা ট্রেলিস</strong> তৈরি করা অত্যন্ত গুরুত্বপূর্ণ। বাঁশ, দড়ি বা অন্যান্য মজবুত উপকরণ দিয়ে মাচা তৈরি করে লতাগুলো ধীরে ধীরে মাচায় তুলে দিন।</p> 

<p>মাচা ব্যবহার করলে লতা সুশৃঙ্খলভাবে বেড়ে উঠতে পারে, বাতাস চলাচল ভালো হয় এবং লম্বা বরবটি সংগ্রহ করাও সহজ হয়। ফল মাটির সংস্পর্শে না থাকায় পরিষ্কার ও সুন্দর শুঁটি পাওয়ার ক্ষেত্রেও এটি সহায়ক।</p> 

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3> 
<p>ছাদবাগান, টব বা গ্রো ব্যাগে বরবটি চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li> 
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>বরবটির লতা ও শিকড়ের বৃদ্ধির জন্য বড় টব বা গ্রো ব্যাগ ব্যবহার করুন। টবের নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন এবং শক্ত মাচার ব্যবস্থা করুন।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<ul> 
<li>🌞 প্রতিদিন <strong>৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li> 
<li>💧 মাটি শুকিয়ে যাওয়ার আগেই প্রয়োজন অনুযায়ী পানি দিন।</li> 
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li> 
<li>🌿 গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার রাখুন।</li> 
<li>🍂 মাটিতে আর্দ্রতা ধরে রাখতে গাছের গোড়ায় জৈব মালচ ব্যবহার করা যেতে পারে।</li> 
</ul> 

<h3>🥬 ভালো ফলনের জন্য পরিচর্যার টিপস</h3> 
<ul> 
<li>🌱 স্বাস্থ্যবান ও সবল গাছ নির্বাচন করুন।</li> 
<li>🌞 পর্যাপ্ত সূর্যালোক ও বাতাস চলাচলের ব্যবস্থা রাখুন।</li> 
<li>🌿 গাছের লতা নিয়মিত মাচায় তুলে দিন।</li> 
<li>🍂 প্রয়োজন অনুযায়ী কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>💧 ফুল ও ফল ধরার সময় মাটির আর্দ্রতা বজায় রাখুন।</li> 
<li>🐝 ফুল আসার সময় পরাগায়নকারী পোকামাকড়ের উপস্থিতি বজায় রাখতে অপ্রয়োজনীয় কীটনাশক ব্যবহার এড়িয়ে চলুন।</li> 
<li>🥬 কোমল অবস্থায় বরবটি নিয়মিত সংগ্রহ করলে নতুন শুঁটি আসতে সহায়তা করতে পারে।</li> 
<li>🐛 পাতা, ফুল বা শুঁটিতে পোকামাকড় ও রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
</ul> 

<h3>🌿 চাষের উপযুক্ত স্থান</h3> 
<ul> 
<li>🏡 কিচেন গার্ডেন</li> 
<li>🌿 ছাদবাগান</li> 
<li>🪴 বড় টব বা গ্রো ব্যাগ</li> 
<li>🌱 সবজি বাগান</li> 
<li>🚜 বাণিজ্যিক চাষের জমি</li> 
</ul> 

<h3>🥬 বরবটির বিশেষ আকর্ষণ</h3> 
<p>লম্বা, সবুজ, কোমল ও সুস্বাদু শুঁটির কারণে এই হাইব্রিড বরবটি রান্না, ভাজি ও বিভিন্ন সবজি পদ তৈরির জন্য উপযোগী। দ্রুত বর্ধনশীল গাছ সঠিক পরিচর্যায় দীর্ঘসময় ধরে ফলন দিতে সহায়তা করতে পারে।</p> 

<h3>🛒 অর্ডার করুন</h3> 
<p><strong>ছাদবাগান, কিচেন গার্ডেন বা বাণিজ্যিক চাষে লম্বা ও কোমল বরবটি চাষ করতে আজই উন্নত জাতের হাইব্রিড বরবটির বীজ অর্ডার করুন! 🌱🥬</strong></p>', 'VEG-1536', 15, 15, 1, 0, 36, '[]', '2026-09-24T01:42:30.749+00:00', '2026-10-17T12:58:14.811634+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c226238a-954f-482e-bf22-57e0e7c9b0d9', 'হাইব্রিড রকমেলন (সাম্মাম) বীজ - জিজৌমি সুইট মেলন', 'hybrid-rockmelon-sammam-jizoumi-sweet-melon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378433009-atcht2k.webp', NULL, 170, 110, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৪০–৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | মিষ্টি, সুস্বাদু সাম্মাম উৎপাদনে উপযোগী। আজই অর্ডার করুন!', '🥦 Product Short Description

প্রায় ২০০টি উন্নতমানের ফুলকপি বীজ, যা সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর, সুগঠিত ফুলকপি উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

🌱 ভালো ফলনের জন্য আজই আপনার ফুলকপি বীজ অর্ডার করুন এবং চাষ শুরু করুন!

📋 Product Specifications
বীজের পরিমাণ: আনুমানিক ২০০ টি বীজ
Purity: 95%
Cleanliness: 98%
Germination Rate: ≥ 90%
Survival Rate: 90%
Origin: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1502', 0, 0, 0, 0, 40, '[]', '2026-09-24T01:46:41.793+00:00', '2026-10-12T11:25:01.387612+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('5a2d8284-2d8b-433d-8ffd-cca41aef1dc5', 'বিদেশী জাতের কমলা জিনিয়া ফুল বীজ', 'imported-orange-zinnia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732454826-kl9ayy6.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল কমলা বড় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'বিদেশী জাতের কমলা জিনিয়া ফুল বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন উজ্জ্বল কমলা রঙের বড় ও আকর্ষণীয় ফুলে। এই উন্নত জাতের জিনিয়া দ্রুত বৃদ্ধি পায়, দীর্ঘসময় ধরে ফুল ফোটায় এবং সঠিক পরিচর্যায় প্রচুর ফুল উৎপাদন করে। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি একটি চমৎকার নির্বাচন। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে বাগানে প্রাণবন্ত সৌন্দর্য ছড়িয়ে দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1524', 16, 16, 1, 0, 41, '[]', '2026-09-24T01:42:35.692+00:00', '2026-10-12T11:24:31.366848+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('821ba9ea-1c52-4233-8494-9f86a0e021b2', 'হাইব্রিড লম্বা সবুজ শসার বীজ', 'sob-1512-copy-78zx-8618d6', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1788366466637-1geo49.jpg', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1788366476783-zjrdjui.webp\"]', 150, 85, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, খাস্তা, রসালো ও তিতা-মুক্ত শসা উৎপাদন করুন, সালাদের জন্য আদর্শ।', 'বারোমাসি হাইব্রিড সালাদ শসা একটি উচ্চ ফলনশীল ও দ্রুত বর্ধনশীল জাত, যা লম্বা, খাস্তা ও রসালো শসা উৎপাদন করে। এর ফল তিতা-মুক্ত, সুস্বাদু এবং সালাদ, স্যান্ডউইচ ও তাজা খাওয়ার জন্য অত্যন্ত উপযোগী। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষে চমৎকার ফলন পাওয়া যায়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৬০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1556', 17, 17, 1, 0, 45, '[]', '2026-09-24T01:48:50.444+00:00', '2026-10-12T11:25:14.490237+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8c028986-b367-4a74-8d49-ca397a2905a6', 'ইস্পাহানি কপি পালং শাক বীজ', 'ispahani-kopi-palong-shak-seeds-40-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783671262-tp2ys07.webp', NULL, 35, 0, 21, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"সেরা পণ্য\",\"হাইব্রিড\"]', '৪০ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি কপি পালং শাক বীজ | দ্রুত ফলনশীল, চওড়া-পুরু পাতা, নরম-সুস্বাদু ও ২৫-৩০ দিনে সংগ্রহযোগ্য।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি কপি পালং শাক বীজ</strong> একটি অধিক ফলনশীল ও দ্রুত ফলনশীল জাত। এর পাতা চওড়া ও পুরু, নরম এবং সুস্বাদু। আকর্ষণীয় সবুজ পাতার কারণে এটি চাষ ও বাজারজাতকরণের জন্য উপযোগী। বীজ বপনের মাত্র <strong>২৫–৩০ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায়। সঠিক পরিচর্যায় প্রতি একরে <strong>১০–১২ টন</strong> পর্যন্ত ফলন পাওয়া যেতে পারে। দূরপাল্লার পরিবহনের জন্যও সুবিধাজনক।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ৪০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> অধিক ফলনশীল<br>
<strong>🌿 বৃদ্ধি:</strong> দ্রুত ফলনশীল<br>
<strong>🍃 পাতা:</strong> চওড়া, পুরু ও আকর্ষণীয় সবুজ<br>
<strong>🥬 গুণমান:</strong> নরম ও সুস্বাদু<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ২৫–৩০ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ১০–১২ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1598', 0, 0, 0, 0, 45, '[]', '2026-09-25T18:45:08.905+00:00', '2026-10-12T11:25:16.121033+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('a79dbb69-00ec-4de8-a43c-f22beef64143', 'প্রিমিয়াম মাগুরাইট ডেইজি ফুলের বীজ', 'premium-marguerite-daisy-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732425700-iwlxiwu.webp', NULL, 150, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ৪৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বড় ও আকর্ষণীয় ডেইজি ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'প্রিমিয়াম মাগুরাইট ডেইজি ফুলের বীজ দিয়ে আপনার বাগানকে করে তুলুন আরও আকর্ষণীয় ও প্রাণবন্ত। এই সুন্দর ফুলটি তার বড়, উজ্জ্বল ও মনোমুগ্ধকর পাপড়ির জন্য অত্যন্ত জনপ্রিয়। টব, বারান্দা, ছাদবাগান এবং খোলা জায়গায় সহজেই চাষ করা যায়। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি, গাছ দ্রুত বৃদ্ধি পায় এবং দীর্ঘসময় ধরে প্রচুর ফুল ফোটে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৪৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1522', 15, 15, 1, 0, 46, '[]', '2026-09-24T01:42:35.359+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('65d356a7-3d06-4d7e-ac9a-5fb33ed23144', 'প্রিমিয়াম কোয়ালিটি শাস্তা ডেইজি ফুলের বীজ (সাদা)', 'premium-shasta-daisy-white-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732429422-cx8mj0b.webp', NULL, 120, 50, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বড় সাদা ডেইজি ফুল, দীর্ঘসময় ফুল ফোটে, টব ও বাগানের জন্য আদর্শ।', 'প্রিমিয়াম কোয়ালিটি শাস্তা ডেইজি ফুলের বীজ (সাদা) দিয়ে আপনার বাগানে ফুটিয়ে তুলুন বড় আকৃতির উজ্জ্বল সাদা ফুল, যার মাঝখানে থাকে আকর্ষণীয় হলুদ কেন্দ্র। এই বহুবর্ষজীবী ফুলটি দীর্ঘসময় ধরে ফোটে এবং টব, ছাদবাগান, বারান্দা, ফুলের বর্ডার ও খোলা বাগানে চাষের জন্য আদর্শ। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি, গাছ দ্রুত বৃদ্ধি পায় এবং সঠিক পরিচর্যায় প্রচুর ফুল উৎপন্ন করে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1517', 14, 14, 1, 0, 47, '[]', '2026-09-24T01:42:34.536+00:00', '2026-10-18T04:12:52.504338+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('dbc044b4-ded2-4c33-9702-1142db4ff2cf', 'প্রিমিয়াম গ্যালারডিয়া (ব্লাঙ্কেট ফ্লাওয়ার) ইমপোর্টেড ফুলের বীজ', 'premium-gaillardia-blanket-flower-imported-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732423855-95whzhn.webp', NULL, 130, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, দীর্ঘসময় রঙিন ফুলের জন্য উপযুক্ত।', 'প্রিমিয়াম গ্যালারডিয়া (ব্লাঙ্কেট ফ্লাওয়ার) ইমপোর্টেড ফুলের বীজ আপনার বাগানকে দীর্ঘসময় ধরে লাল, হলুদ ও কমলা রঙের আকর্ষণীয় ফুলে ভরিয়ে তুলবে। এটি খরা সহনশীল, কম পরিচর্যায় সহজেই বেড়ে ওঠে এবং টব, ছাদবাগান, বারান্দা ও খোলা বাগানের জন্য উপযুক্ত। উচ্চমানের আমদানিকৃত এই বীজে রয়েছে উচ্চ অঙ্কুরোদগম ক্ষমতা, যা স্বাস্থ্যবান ও প্রচুর ফুল ফোটাতে সহায়তা করে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1519', 13, 13, 1, 0, 54, '[]', '2026-09-24T01:42:34.863+00:00', '2026-10-17T05:26:04.35641+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('834d36ce-d749-4bc6-b474-c137fdc52c57', 'চায়না হাইব্রিড লাল মিষ্টি কুমড়া (লাল চেরি/চেস্টনাট)', 'china-hybrid-red-sweet-pumpkin-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784188907-gpyaw6y.webp', NULL, 170, 45, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', 'আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | চায়না হাইব্রিড লাল মিষ্টি কুমড়া, আকর্ষণীয় লাল রং ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🌱 Product Short Description</h3><p>চায়না হাইব্রিড লাল মিষ্টি কুমড়া (লাল চেরি/চেস্টনাট) একটি আকর্ষণীয় জাতের মিষ্টি কুমড়া, যা সুন্দর লালচে রঙের ফল উৎপাদনের জন্য পরিচিত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতা এবং ভালো ফলন পেতে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🎃 <strong>নিজের বাগানে আকর্ষণীয় লাল মিষ্টি কুমড়া চাষ করতে আজই বীজ অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🎃 <strong>জাত:</strong> চায়না হাইব্রিড লাল মিষ্টি কুমড়া</li><li>🍒 <strong>পরিচিতি:</strong> লাল চেরি / চেস্টনাট</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>☀️ কোন কোন মৌসুমে ভালো হয়?</h3><p>মিষ্টি কুমড়া উষ্ণ আবহাওয়ার ফসল। পর্যাপ্ত রোদ, উষ্ণ তাপমাত্রা এবং ভালো পানি নিষ্কাশন থাকলে এটি ভালোভাবে বেড়ে ওঠে।</p><ul><li>🌤️ <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — চাষের জন্য ভালো সময়।</li><li>☀️ <strong>গ্রীষ্ম:</strong> মার্চ–মে — উষ্ণ পরিবেশে গাছের বৃদ্ধি ভালো হয়।</li><li>🌧️ <strong>বর্ষার শুরু:</strong> মে–জুলাই — পর্যাপ্ত পানি নিষ্কাশন থাকলে চাষ করা যায়।</li><li>❄️ অতিরিক্ত ঠান্ডা ও কুয়াশার সময়ে বীজের অঙ্কুরোদগম ও গাছের বৃদ্ধি ধীর হতে পারে।</li></ul><h3>🪴 লাল মিষ্টি কুমড়া চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>মিষ্টি কুমড়ার জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> ভালো। জমিতে পানি জমে থাকা এড়িয়ে চলুন।</p><p><strong>২. জমি ভালোভাবে প্রস্তুত করুন</strong><br>জমি ২–৩ বার ভালোভাবে কোপানো বা চাষ দিয়ে মাটি ঝুরঝুরে করুন। আগাছা, পাথর ও আগের ফসলের শিকড় পরিষ্কার করুন।</p><p><strong>৩. মাদার/গর্ত তৈরি করুন</strong><br>লতানো কুমড়ার জন্য আলাদা গর্ত বা মাদা তৈরি করা ভালো। প্রতি মাদার মাটির সঙ্গে ভালোভাবে পচা গোবর বা কম্পোস্ট মিশিয়ে দিন।</p><p><strong>৪. জৈব সার ব্যবহার করুন</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>৫০–৬০ কেজি</strong> ব্যবহার করা যেতে পারে। কাঁচা গোবর সরাসরি বীজের কাছে ব্যবহার করবেন না।</p><p><strong>৫. টবে বা ছাদবাগানে মাটির মিশ্রণ</strong><br>বড় টব/ড্রামে চাষ করতে চাইলে:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ব্যবহার করুন।</p><p><strong>৬. বীজ বপনের আগে</strong><br>বীজ ২–৪ ঘণ্টা পরিষ্কার পানিতে ভিজিয়ে বপন করলে কিছু ক্ষেত্রে দ্রুত অঙ্কুরোদগমে সহায়তা করতে পারে। তবে বীজের প্যাকেটের নির্দেশনা থাকলে সেটিই অনুসরণ করুন।</p><p><strong>৭. পানি নিষ্কাশন নিশ্চিত করুন</strong><br>কুমড়ার গোড়ায় পানি দীর্ঘসময় জমে থাকলে শিকড়ের সমস্যা হতে পারে। তাই উঁচু মাদা, নালা বা পর্যাপ্ত ড্রেনেজ ব্যবস্থা রাখুন।</p><p><strong>৮. পর্যাপ্ত জায়গা রাখুন</strong><br>কুমড়ার লতা অনেক দূর পর্যন্ত ছড়িয়ে যেতে পারে। তাই জমি বা ছাদবাগানে লতা ছড়ানোর জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজন হলে লতার দিকনির্দেশনা দিন।</p><p>💡 <strong>বিশেষ টিপস:</strong> ফুল ও ফল আসার সময় মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখুন, তবে জলাবদ্ধতা এড়িয়ে চলুন। ফল মাটির সরাসরি সংস্পর্শে থাকলে পরিষ্কার খড় বা শুকনো মালচ ব্যবহার করা যেতে পারে।</p><h3>🛒 অর্ডার করুন</h3><p><strong>আকর্ষণীয় লাল রঙের মিষ্টি কুমড়া চাষের জন্য আজই চায়না হাইব্রিড লাল মিষ্টি কুমড়ার বীজ অর্ডার করুন!</strong></p><h3></h3>', 'VEG-1609', 8, 8, 1, 0, 55, '[]', '2026-10-01T10:41:37.201+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8d6f672c-c10b-45cd-91f9-f4b81cca6f79', 'হলুদ গোলাপ ফুলের বীজ', 'yellow-rose-flower-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784200031-vb8jtyt.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', NULL, '<h3>📝 Product Short Description</h3><p><strong>হলুদ গোলাপ ফুলের বীজ</strong> সুন্দর হলুদ রঙের আকর্ষণীয় গোলাপ গাছ ও ফুল উৎপাদনের জন্য উপযোগী। উজ্জ্বল হলুদ ফুল বাগান, টব, বারান্দা ও ছাদবাগানকে আরও প্রাণবন্ত ও নান্দনিক করে তুলতে পারে। 🌹💛</p><p>সঠিক পরিচর্যা, পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও সঠিক পানি ব্যবস্থাপনা নিশ্চিত করলে স্বাস্থ্যকর গাছ এবং সুন্দর ফুল উৎপাদনে সহায়ক। ফুলপ্রেমীদের সংগ্রহে রাখার জন্যও এটি একটি আকর্ষণীয় জাত।</p><p><strong>নিজের বাগানে হলুদ গোলাপের সৌন্দর্য আনতে আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌹 <strong>ফুলের নাম:</strong> হলুদ গোলাপ</li><li>💛 <strong>ফুলের রং:</strong> হলুদ</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🏡 <strong>ব্যবহার:</strong> টব, বারান্দা, ছাদবাগান ও ফুলের বাগান</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>বাংলাদেশের আবহাওয়ায় গোলাপ সাধারণত <strong>শীতকাল ও বসন্তকালে</strong> ভালোভাবে বেড়ে ওঠে। পর্যাপ্ত আলো, ভালো বাতাস চলাচল ও পানি নিষ্কাশনের ব্যবস্থা থাকলে অন্যান্য সময়েও চাষ করা যায়।</p><p><strong>🌱 উপযোগী সময়:</strong></p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি</li><li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>☀️ গ্রীষ্মে অতিরিক্ত তাপের সময় দুপুরের তীব্র রোদ থেকে গাছকে কিছুটা সুরক্ষা দেওয়া যেতে পারে।</li><li>🌧️ বর্ষাকালে পানি জমে না এমন স্থান নির্বাচন করুন।</li></ul><h3>🪴 কিভাবে মাটি তৈরি করবেন?</h3>১️⃣ উপযুক্ত মাটি<p><strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি</strong> ব্যবহার করুন। পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুতি<p>মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে ২–৩ বার ঝুরঝুরে করুন। আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করে নিন।</p>৩️⃣ জৈব সার প্রয়োগ<p>মাটির সঙ্গে ভালোভাবে পচা গোবর বা কম্পোস্ট মিশিয়ে দিন। এতে মাটির গঠন উন্নত হয় এবং শিকড় বৃদ্ধির উপযোগী পরিবেশ তৈরি হয়।</p>৪️⃣ টবের মাটির মিশ্রণ<p>টবে চাষের জন্য ব্যবহার করতে পারেন:</p><ul><li>৪০% দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li><li>১০% মোটা বালি/পার্লাইট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন।</p>৫️⃣ পানি নিষ্কাশন<p>টবের নিচে পর্যাপ্ত <strong>drainage hole</strong> রাখুন। অতিরিক্ত পানি দ্রুত বের হয়ে যাওয়ার ব্যবস্থা করুন। মাটিতে দীর্ঘসময় পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে।</p><h3>🌱 বীজ বপনের পদ্ধতি</h3><ul><li>পরিষ্কার ও ঝুরঝুরে বীজতলা তৈরি করুন।</li><li>মাটি হালকা আর্দ্র করে বীজ বপন করুন।</li><li>বীজ খুব গভীরে না দিয়ে পাতলা মাটি দিয়ে ঢেকে দিন।</li><li>হালকা পানি স্প্রে করে মাটির আর্দ্রতা বজায় রাখুন।</li><li>পানি জমতে দেবেন না।</li><li>চারা গজানোর পর ধীরে ধীরে পর্যাপ্ত আলোতে অভ্যস্ত করুন।</li></ul><h3>☀️ আলো ও অবস্থান</h3><p>গোলাপের জন্য পর্যাপ্ত সূর্যালোক ও ভালো বায়ু চলাচলযুক্ত স্থান নির্বাচন করুন। টবে চাষ করলে এমন জায়গা বেছে নিন যেখানে পর্যাপ্ত আলো পাওয়া যায় এবং বৃষ্টির পানি দীর্ঘসময় জমে থাকে না।</p><h3>💧 পানি ও পরিচর্যা</h3><p>মাটির উপরিভাগ কিছুটা শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন এবং গাছের গোড়ায় পানি জমতে দেবেন না।</p><h3>🌹 সুন্দর ফুল পাওয়ার জন্য টিপস</h3><ul><li>পর্যাপ্ত আলোযুক্ত স্থান নির্বাচন করুন।</li><li>উর্বর ও ঝুরঝুরে মাটি ব্যবহার করুন।</li><li>নিয়মিত আগাছা পরিষ্কার করুন।</li><li>প্রয়োজন অনুযায়ী কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li><li>শুকনো ও দুর্বল পাতা/ডাল পরিষ্কার রাখুন।</li><li>গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের সুযোগ রাখুন।</li><li>বর্ষাকালে জলাবদ্ধতা এড়িয়ে চলুন।</li></ul><p><strong>হলুদ গোলাপের উজ্জ্বল সৌন্দর্যে আপনার বাগানকে আরও আকর্ষণীয় করে তুলতে আজই অর্ডার করুন!</strong> 🌹💛</p>', 'FUL-1601', 3, 3, 1, 0, 55, '[]', '2026-10-01T11:34:47.665+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('edf44729-b2fa-4898-85bc-0136c5b7909a', 'বারোমাসি ইস্পাহানি মরিচ IR-8 (উফশী মরিচ)', 'ispahani-morich-ir-8-10-gram', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791783797919-hk8rbln.webp', NULL, 32, 0, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\"]', '১০ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি মরিচ IR-8 | সারা বছর চাষযোগ্য, তীব্র ঝাঁঝালো, রোগসহনশীল ও দীর্ঘদিন ফলনশীল।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি মরিচ IR-8 (উফশী মরিচ)</strong> একটি উচ্চফলনশীল ও সারা বছর চাষযোগ্য মরিচের জাত। গাছ মধ্যম ঝোপালো ও শক্ত, ফলে তীব্র ঝাঁঝ রয়েছে। আকর্ষণীয় গাঢ় সবুজ, মসৃণ ত্বকের মরিচ দীর্ঘদিন ধরে ফল দেয়। রোগব্যাধি সহনশীল হওয়ায় চাষে সুবিধাজনক এবং দূরবর্তী পরিবহনেও ভালো থাকে। কাঁচা ও পাকা—উভয় অবস্থায় রান্নায় ব্যবহার করা যায়।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 চাষযোগ্যতা:</strong> সারা বছর<br>
<strong>🌶️ ঝাঁঝ:</strong> তীব্র<br>
<strong>🌿 গাছ:</strong> মধ্যম ঝোপালো ও শক্ত<br>
<strong>🥬 ফল:</strong> আকর্ষণীয় গাঢ় সবুজ ও মসৃণ ত্বক<br>
<strong>🛡️ সহনশীলতা:</strong> রোগব্যাধি সহনশীল<br>
<strong>🚚 পরিবহন:</strong> দূর পরিবহনের জন্য সুবিধাজনক<br>
<strong>🍽️ ব্যবহার:</strong> কাঁচা ও পাকা উভয় অবস্থায়</p>', 'VEG-1596', 0, 0, 0, 0, 55, '[]', '2026-09-25T16:35:55.04+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('91398d1b-3280-4b60-b3e4-dbe202d8d3a7', 'হাইব্রিড থাই গোলাপ বীজ – মিক্সড কালার', 'ful-1559-91398d', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784194623-s06dowa.webp', NULL, 150, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', 'আনুমানিক ১৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড থাই গোলাপ, মিশ্র রঙের আকর্ষণীয় ফুল ও সুন্দর বাগানের জন্য উপযোগী।', '<h3>📝 Product Short Description</h3><p><strong>হাইব্রিড থাই গোলাপ বীজ – মিক্সড কালার</strong> বিভিন্ন আকর্ষণীয় রঙের গোলাপ ফুল উৎপাদনের জন্য উপযোগী একটি সুন্দর ফুলের বীজ। একই প্যাকেটে মিশ্র রঙের ফুল পাওয়ার সম্ভাবনা থাকায় বাড়ির বাগান, টব, বারান্দা ও ছাদবাগানকে বৈচিত্র্যময় ও আকর্ষণীয় করে তুলতে পারেন।</p><p>সঠিক পরিচর্যা, পর্যাপ্ত আলো, উর্বর মাটি ও নিয়মিত পানি ব্যবস্থাপনা নিশ্চিত করলে স্বাস্থ্যকর গাছ এবং সুন্দর ফুল উৎপাদনে সহায়ক। 🌹</p><p><strong>নিজের বাগানে রঙিন থাই গোলাপের সৌন্দর্য আনতে আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌹 <strong>ফুলের নাম:</strong> হাইব্রিড থাই গোলাপ</li><li>🎨 <strong>রঙ:</strong> মিক্সড কালার</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌿 <strong>ব্যবহার:</strong> টব, বারান্দা, ছাদবাগান ও ফুলের বাগান</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>গোলাপ সাধারণত পর্যাপ্ত আলো ও তুলনামূলক নাতিশীতোষ্ণ আবহাওয়ায় ভালোভাবে বেড়ে ওঠে। বাংলাদেশে <strong>শীতকাল ও বসন্তকাল</strong> গোলাপ চাষের জন্য বিশেষভাবে সুবিধাজনক। পর্যাপ্ত আলো ও সঠিক পরিচর্যা থাকলে অন্যান্য সময়েও টবে চাষ করা যায়।</p><p><strong>🌱 উপযোগী সময়:</strong></p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি</li><li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>☀️ গ্রীষ্মকালে অতিরিক্ত তাপ থেকে গাছকে সুরক্ষা দিতে দুপুরের তীব্র রোদে আংশিক ছায়ার ব্যবস্থা করা যেতে পারে।</li><li>🌧️ বর্ষাকালে অতিরিক্ত পানি ও জলাবদ্ধতা অবশ্যই এড়িয়ে চলতে হবে।</li></ul><h3>🪴 কিভাবে মাটি তৈরি করবেন?</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>গোলাপের জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি যেন অতিরিক্ত শক্ত বা পানি জমে থাকার মতো ভারী না হয়।</p>২️⃣ মাটি ঝুরঝুরে করা<p>বাগানের মাটি ভালোভাবে কুপিয়ে ২–৩ বার ঝুরঝুরে করে নিন। পাথর, আগাছা ও পুরোনো শিকড় পরিষ্কার করুন। এতে নতুন চারার শিকড় সহজে মাটিতে বিস্তার করতে পারবে।</p>৩️⃣ জৈব সার মেশানো<p>মাটির সঙ্গে ভালোভাবে পচা গোবর বা কম্পোস্ট মিশিয়ে নিন। জৈব পদার্থ মাটির গঠন উন্নত করতে এবং গাছের শিকড়ের জন্য উপযোগী পরিবেশ তৈরি করতে সহায়তা করে।</p>৪️⃣ টবের জন্য মাটির মিশ্রণ<p>টবে থাই গোলাপ চাষের জন্য ব্যবহার করতে পারেন:</p><ul><li>৪০% দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li><li>১০% মোটা বালি/পার্লাইট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে growing medium তৈরি করুন।</p>৫️⃣ পানি নিষ্কাশন নিশ্চিত করুন<p>টবের নিচে পর্যাপ্ত <strong>drainage hole</strong> থাকা জরুরি। টবের নিচে পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে। প্রয়োজনে টবটি সামান্য উঁচু করে রাখুন যাতে অতিরিক্ত পানি সহজে বের হয়ে যায়।</p>৬️⃣ বীজ বপনের মাটি<p>বীজ থেকে চারা তৈরির জন্য হালকা ও পরিষ্কার growing medium ব্যবহার করুন। মাটি খুব বেশি চাপ দিয়ে শক্ত করবেন না। বীজ বপনের পর হালকা পানি স্প্রে করে মাটির আর্দ্রতা বজায় রাখুন।</p><h3>🌱 চারা তৈরির পর পরিচর্যা</h3><p>চারা গজানোর পর ধীরে ধীরে পর্যাপ্ত আলোতে অভ্যস্ত করুন। চারাগুলো একটু বড় হলে সুস্থ ও সবল চারা আলাদা টব বা নির্দিষ্ট স্থানে স্থানান্তর করতে পারেন।</p><p>গাছের চারপাশে পর্যাপ্ত জায়গা রাখুন যাতে আলো-বাতাস চলাচল করতে পারে। প্রয়োজন অনুযায়ী জৈব সার প্রয়োগ করুন এবং অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন।</p><h3>🌹 সুন্দর ফুল পাওয়ার জন্য গুরুত্বপূর্ণ টিপস</h3><ul><li>প্রতিদিন পর্যাপ্ত আলো পায় এমন স্থান নির্বাচন করুন।</li><li>পানি জমে থাকে এমন মাটি ব্যবহার করবেন না।</li><li>নিয়মিত আগাছা পরিষ্কার করুন।</li><li>শুকনো ও দুর্বল ডাল/পাতা পরিষ্কার করুন।</li><li>ফুলের গাছের জন্য প্রয়োজন অনুযায়ী জৈব সার ব্যবহার করুন।</li><li>অতিরিক্ত গরম ও ভারী বৃষ্টির সময় গাছের বিশেষ যত্ন নিন।</li><li>টবে চাষ করলে মাটি অতিরিক্ত শুকিয়ে যেতে দেবেন না।</li></ul><p><strong>রঙিন ও আকর্ষণীয় গোলাপের বাগান তৈরি করতে হাইব্রিড থাই গোলাপ বীজ – মিক্সড কালার হতে পারে আপনার সংগ্রহের সুন্দর একটি সংযোজন।</strong></p>', 'FUL-1559', 2, 2, 1, 0, 55, '[]', '2026-10-01T11:13:22.97+00:00', '2026-10-18T04:12:52.504338+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f9065727-b0e4-4864-ae56-a5231775b0a2', 'হলুদ সরিষা ফুলের বীজ', 'yellow-mustard-flower-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784184049-thear5e.webp', NULL, 120, 30, 30, 'ফুল', '[\"ফুল\",\"শাক - সবজি\"]', NULL, NULL, '[]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হলুদ সরিষা ফুলের বীজ, উজ্জ্বল হলুদ ফুলে বাগান সাজাতে উপযোগী। আজই অর্ডার করুন!', '<h3>🌱 Product Short Description</h3><p>হলুদ সরিষা ফুলের বীজ সুন্দর উজ্জ্বল হলুদ ফুলের চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে স্বাস্থ্যকর গাছ এবং আকর্ষণীয় হলুদ ফুলের সমারোহ তৈরি করতে সহায়ক।</p><p>বাগান, ছাদবাগান, বাড়ির আঙিনা ও বিভিন্ন ল্যান্ডস্কেপে রঙিন সৌন্দর্য আনার জন্য ব্যবহার করা যায়। 🌼 <strong>আপনার বাগানকে হলুদের সৌন্দর্যে সাজাতে আজই বীজ অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌼 <strong>ফুলের রং:</strong> উজ্জ্বল হলুদ</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>❄️ কোন কোন মৌসুমে ভালো হয়?</h3><p>সরিষা মূলত <strong>শীতকালীন ফসল</strong> এবং তুলনামূলক ঠান্ডা ও শুষ্ক আবহাওয়ায় ভালো বেড়ে ওঠে।</p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর বীজ বপনের উপযোগী সময়।</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–জানুয়ারি সাধারণত সবচেয়ে ভালো সময়।</li><li>🌼 <strong>ফুলের সময়:</strong> আবহাওয়া ও জাতভেদে সাধারণত শীতের মাঝামাঝি থেকে ফুল আসতে শুরু করে।</li><li>☀️ অতিরিক্ত গরম ও জলাবদ্ধ পরিবেশ এড়িয়ে চলা ভালো।</li></ul><h3>🪴 হলুদ সরিষা ফুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>সরিষা ফুলের জন্য উর্বর, ঝুরঝুরে <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> ভালো। মাটি অবশ্যই পানি নিষ্কাশনযোগ্য হওয়া উচিত।</p><p><strong>২. জমি/বেড প্রস্তুত করুন</strong><br>জমি ২–৩ বার ভালোভাবে কোপানো বা চাষ দিয়ে মাটি ঝুরঝুরে করে নিন। আগাছা, পাথর ও আগের ফসলের শিকড় পরিষ্কার করুন।</p><p><strong>৩. জৈব সার মেশান</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>২০–৩০ কেজি</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিতে পারেন। কাঁচা গোবর ব্যবহার করবেন না।</p><p><strong>৪. টব বা পাত্রে চাষের মাটি</strong><br>ছাদবাগান বা টবে চাষ করতে চাইলে:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>ভালোভাবে মিশিয়ে ব্যবহার করুন।</p><p><strong>৫. বীজ বপন</strong><br>মাটি হালকা আর্দ্র করে বীজ ছিটিয়ে বা সারিবদ্ধভাবে বপন করুন। বীজ খুব গভীরে পুঁতে না দিয়ে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</p><p><strong>৬. পানি নিষ্কাশন</strong><br>সরিষা গাছ জলাবদ্ধতা সহ্য করতে পারে না। তাই জমি বা টবে পানি যেন দীর্ঘসময় জমে না থাকে তা নিশ্চিত করুন।</p><p><strong>৭. পর্যাপ্ত আলো</strong><br>ভালো বৃদ্ধি ও ফুলের জন্য প্রতিদিন পর্যাপ্ত সূর্যালোক পাওয়া যায় এমন স্থানে চাষ করুন।</p><p>💡 <strong>বিশেষ টিপস:</strong> বীজ বপনের পর মাটি শুকিয়ে যেতে দেবেন না, আবার অতিরিক্ত পানি দিয়েও কাদাময় করবেন না। গাছ বড় হওয়ার সঙ্গে সঙ্গে প্রয়োজন অনুযায়ী আগাছা পরিষ্কার করুন।</p><h3>🛒 অর্ডার করুন</h3><p><strong>আপনার বাগানে মনোমুগ্ধকর হলুদ ফুলের সৌন্দর্য আনতে আজই উন্নতমানের সরিষা ফুলের বীজ অর্ডার করুন!</strong></p><h3></h3>', 'VEG-1607', 4, 4, 1, 0, 55, '[]', '2026-10-01T10:34:21.49+00:00', '2026-10-14T06:04:44.828383+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('1b138ddd-3830-48ce-89ac-4430f8198c72', 'থাই জাতের হাইব্রিড কলমি শাক বীজ', 'thai-hybrid-water-spinach-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364697552-92nadxi.webp', NULL, 110, 45, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ১২০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, মোটা ডাঁটা, কোমল পাতা, দ্রুত বৃদ্ধি ও উচ্চ ফলনশীল কলমি শাক উৎপাদন করুন।', 'থাই জাতের হাইব্রিড কলমি শাক একটি উন্নত মানের ও উচ্চ ফলনশীল শাকের জাত, যা মোটা ডাঁটা, বড় ও কোমল পাতা এবং দ্রুত বৃদ্ধির জন্য পরিচিত। এটি সারা বছর চাষ করা যায় এবং বারবার সংগ্রহের উপযোগী। শাকটি সুস্বাদু, পুষ্টিগুণে সমৃদ্ধ এবং বিভিন্ন ধরনের রান্নায় ব্যবহার করা যায়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি আদর্শ নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১২০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'SAK-1504', 11, 11, 1, 0, 56, '[]', '2026-09-24T01:42:44.012+00:00', '2026-10-17T05:26:05.346045+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ab5cfafc-6e02-4ed3-8474-d5a9c9948e83', 'হানি মেলন বীজ (হাইব্রিড সাম্মাম)', 'honey-melon-hybrid-sammam-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949195684-82m918k.webp', NULL, 190, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হানি মেলন হাইব্রিড সাম্মাম, মিষ্টি ফল, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হানি মেলন বীজ (হাইব্রিড সাম্মাম) মিষ্টি ও সুস্বাদু হানি মেলন বা সাম্মাম চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং আকর্ষণীয় ফল উৎপাদনে সহায়ক। ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1591', 13, 13, 1, 0, 62, '[]', '2026-09-24T01:42:50.257+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('47536044-cbb1-40ca-9b99-9480d6710538', 'হাওরুনঝিং গোল্ডেন বয় মিনি শসা বীজ', 'haorunjing-golden-boy-mini-cucumber-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949194374-dck8ipe.webp', NULL, 170, 99, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- শীতকালীন\"]', 'আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাওরুনঝিং গোল্ডেন বয় মিনি শসা, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাওরুনঝিং গোল্ডেন বয় মিনি শসা বীজ ছোট আকৃতির আকর্ষণীয় শসা চাষের জন্য উপযোগী একটি উন্নতমানের জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং সুন্দর আকৃতির মিনি শসা উৎপাদনে সহায়ক। টব, ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ২০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1555', 9, 9, 1, 0, 65, '[]', '2026-09-24T01:46:40.187+00:00', '2026-10-12T11:24:58.058942+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('18115f20-0572-4fa1-8e0d-db673909b6c4', 'জাপানি ব্ল্যাক পাম্পকিন (মিষ্টি কুমড়া) বীজ', 'japanese-black-pumpkin-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784205628-y6evkxb.webp', NULL, 170, 110, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', 'আনুমানিক ৫ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জাপানি ব্ল্যাক পাম্পকিন চাষের জন্য উন্নতমানের বীজ।', '<h3>🌱 Product Short Description</h3><p><strong>জাপানি ব্ল্যাক পাম্পকিন (মিষ্টি কুমড়া) বীজ</strong> উন্নতমানের মিষ্টি কুমড়া চাষের জন্য উপযোগী একটি আকর্ষণীয় জাত। সঠিক পরিচর্যা, পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও সঠিক পানি ব্যবস্থাপনায় সুস্থ ও শক্তিশালী গাছ গড়ে উঠতে সহায়ক। বাড়ির বাগান, ছাদবাগান, টব এবং বাণিজ্যিক চাষের জন্য উপযোগী।</p><h3>📋 পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3><ul><li>📦 <strong>বীজের পরিমাণ:</strong> আনুমানিক ৫ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🎃 <strong>ফসলের ধরন:</strong> জাপানি ব্ল্যাক পাম্পকিন / মিষ্টি কুমড়া</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🏡 <strong>চাষের উপযোগিতা:</strong> বাড়ির বাগান, ছাদবাগান, টব ও বাণিজ্যিক চাষ</li></ul><h3>🌤️ কোন কোন মৌশুমে ভালো হয়?</h3><p>মিষ্টি কুমড়া উষ্ণ আবহাওয়ার ফসল। বাংলাদেশের আবহাওয়ায় সাধারণত <strong>শীতের শেষ থেকে গ্রীষ্ম এবং বর্ষার শুরুর দিকে</strong> চাষের জন্য ভালো সময়।</p><p><strong>🌱 উপযুক্ত সময়:</strong></p><ul><li>🌸 <strong>শীতের শেষ:</strong> জানুয়ারি–ফেব্রুয়ারি</li><li>☀️ <strong>গ্রীষ্ম:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>🌧️ <strong>বর্ষার শুরু:</strong> মে–জুন, তবে পানি নিষ্কাশনের ভালো ব্যবস্থা থাকতে হবে</li></ul><p>অতিরিক্ত ঠান্ডা, কুয়াশা ও জলাবদ্ধতা এড়িয়ে চলা ভালো। বর্ষাকালে উঁচু বেড ব্যবহার করলে অতিরিক্ত পানি দ্রুত নিষ্কাশনে সহায়তা করে।</p><h3>🧑‍🌾 জাপানি ব্ল্যাক পাম্পকিন চাষের জন্য মাটি তৈরির বিস্তারিত নিয়ম</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>মিষ্টি কুমড়ার জন্য <strong>উর্বর দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটি ঝুরঝুরে, জৈব পদার্থসমৃদ্ধ এবং পানি নিষ্কাশনযোগ্য হওয়া প্রয়োজন। ভারী ও দীর্ঘসময় পানি ধরে রাখে এমন মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুত<p>প্রথমে জমির আগাছা, পুরোনো শিকড় ও মাটির দলা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার চাষ ও মই দিয়ে</strong> ভালোভাবে ঝুরঝুরে করে নিন।</p><p>কুমড়ার শিকড় ভালোভাবে ছড়িয়ে পড়ার জন্য মাটি গভীরভাবে আলগা করা উপকারী।</p>৩️⃣ জৈব সার প্রয়োগ<p>প্রতি শতকে আনুমানিক <strong>৫০–৬০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিতে পারেন।</p><p>জৈব সার মাটির গঠন উন্নত করতে, পানি ধারণক্ষমতা বজায় রাখতে এবং গাছের প্রাথমিক বৃদ্ধিতে সহায়তা করে।</p>৪️⃣ উঁচু বেড বা মাদা তৈরি<p>জমিতে চাষ করলে <strong>উঁচু বেড বা মাদা</strong> তৈরি করা ভালো। এতে বৃষ্টির অতিরিক্ত পানি দ্রুত বের হয়ে যায় এবং গাছের গোড়ায় জলাবদ্ধতা কমে।</p><p>মিষ্টি কুমড়ার লতা ছড়িয়ে বাড়ে, তাই প্রতিটি গাছের জন্য পর্যাপ্ত জায়গা রাখতে হবে।</p>৫️⃣ টব বা ছাদবাগানের মাটি<p>টব বা বড় গ্রো ব্যাগে চাষের জন্য নিচের মিশ্রণ ব্যবহার করতে পারেন:</p><ul><li>🟤 <strong>৪০% দোআঁশ মাটি</strong></li><li>🌴 <strong>৩০% কোকোপিট</strong></li><li>🌿 <strong>২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</strong></li><li>🪨 <strong>১০% মোটা বালি বা পার্লাইট</strong></li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে করে নিন। টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত <strong>ড্রেনেজ হোল</strong> থাকা অত্যন্ত গুরুত্বপূর্ণ।</p>৬️⃣ বীজ বপনের প্রস্তুতি<p>মাটি বীজ বপনের আগে হালকা আর্দ্র করে নিন। মিষ্টি কুমড়ার বীজ তুলনামূলক বড় হওয়ায় অল্প গভীরে বপন করা যায়। বীজ খুব গভীরে না দিয়ে ঝুরঝুরে মাটি দিয়ে হালকাভাবে ঢেকে দিন।</p><p>প্রয়োজনে বীজ বপনের আগে <strong>২–৪ ঘণ্টা পানিতে ভিজিয়ে</strong> নেওয়া যেতে পারে, তবে প্যাকেটের নির্দেশনা থাকলে সেটিই অগ্রাধিকার দিন।</p>৭️⃣ পানি ও সূর্যালোক ব্যবস্থাপনা<p>বীজ অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। অতিরিক্ত পানি দিয়ে মাটি কাদাময় করবেন না।</p><p>গাছ বড় হওয়ার পর পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> প্রয়োজন। ছাদবাগান বা বাড়ির বাগানে প্রতিদিন ভালো আলো পায় এমন জায়গা নির্বাচন করুন।</p>৮️⃣ লতা ছড়ানোর ব্যবস্থা<p>মিষ্টি কুমড়ার গাছ লতানো প্রকৃতির। তাই জমিতে লতা ছড়িয়ে দেওয়ার জন্য পর্যাপ্ত জায়গা রাখুন। ছাদবাগানে চাষ করলে শক্ত জালি, মাচা বা সাপোর্ট ব্যবহার করে লতা পরিচালনা করা যেতে পারে।</p><p>💡 <strong>চাষের টিপস:</strong> ভালো ফলনের জন্য উর্বর মাটি, পর্যাপ্ত রোদ, সঠিক পানি ব্যবস্থাপনা, ভালো ড্রেনেজ এবং লতা ছড়ানোর পর্যাপ্ত জায়গা নিশ্চিত করুন।</p>', 'VEG-1615', 4, 4, 1, 0, 66, '[]', '2026-10-01T11:45:22.047+00:00', '2026-10-14T07:01:26.05628+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2a38ddf0-6650-4dbf-a0b7-f16e7290e6ba', 'হাইব্রিড গোল্ডেন সাম্মাম (রকমেলন) বীজ', 'hybrid-golden-sammam-rockmelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949173319-44yqfa8.webp', NULL, 170, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড গোল্ডেন সাম্মাম (রকমেলন), মিষ্টি ফল, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাইব্রিড গোল্ডেন সাম্মাম (রকমেলন) বীজ আকর্ষণীয় গোল্ডেন রঙের মিষ্টি ও সুস্বাদু সাম্মাম চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং আকর্ষণীয় ফল উৎপাদনে সহায়ক। ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1590', 13, 13, 1, 0, 67, '[]', '2026-09-24T01:42:50.098+00:00', '2026-10-12T11:24:53.625489+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8f5dcad4-16e4-410a-91ec-8d2533d961d5', 'উচ্চ ফলনশীল হাইব্রিড লাল ঢেঁড়স বীজ', 'high-yield-hybrid-red-okra-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949171400-3an22pd.webp', NULL, 150, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"হাইব্রিড\",\"পপুলার\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৫০ টি বা ৫ গ্রাম বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, আকর্ষণীয় লাল রঙের, কোমল ও পুষ্টিকর ঢেঁড়স উৎপাদন করুন।', '<h3>🌱 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>উচ্চ ফলনশীল হাইব্রিড লাল ঢেঁড়স</strong> একটি ব্যতিক্রমধর্মী ও আকর্ষণীয় ঢেঁড়সের জাত, যা উজ্জ্বল লাল রঙের কোমল ও সুস্বাদু ফল উৎপাদনের জন্য উপযোগী। গাছ দ্রুত বৃদ্ধি পায় এবং অনুকূল পরিবেশ ও সঠিক পরিচর্যায় দীর্ঘসময় ধরে ফলন পাওয়ার সুযোগ থাকে।</p> 

<p>গাছে প্রচুর পরিমাণে ঢেঁড়স ধরতে পারে এবং এর আকর্ষণীয় লাল রঙ বাগানের সৌন্দর্যও বাড়ায়। রান্নার পাশাপাশি বাড়ির বাগানে বৈচিত্র্য আনতে <strong>ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের</strong> জন্য এটি একটি চমৎকার নির্বাচন।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৪০–৪৫টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🌶️ <strong>ফলের রঙ:</strong> আকর্ষণীয় উজ্জ্বল লাল</li> 
<li>🥬 <strong>ফলের বৈশিষ্ট্য:</strong> কোমল ও সুস্বাদু</li> 
<li>🌿 <strong>বিশেষ বৈশিষ্ট্য:</strong> দ্রুত বৃদ্ধি ও দীর্ঘসময় ফলন দেওয়ার উপযোগী</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> ছাদবাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>ঢেঁড়স একটি <strong>উষ্ণ আবহাওয়াপ্রিয় সবজি</strong>। বাংলাদেশের আবহাওয়ায় সাধারণত <strong>ফাল্গুন থেকে ভাদ্র</strong> পর্যন্ত বিভিন্ন সময়ে চাষ করা যায়। বসন্ত ও গ্রীষ্মের উষ্ণ আবহাওয়ায় বীজের অঙ্কুরোদগম ও গাছের বৃদ্ধি ভালোভাবে শুরু হতে পারে। বর্ষাকালেও চাষ করা সম্ভব, তবে অতিরিক্ত বৃষ্টির পানি ও জলাবদ্ধতা অবশ্যই এড়িয়ে চলতে হবে।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>লাল ঢেঁড়সের জন্য <strong>উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি</strong> উপযোগী। মাটিতে পানি জমে থাকলে শিকড়ের বৃদ্ধি ব্যাহত হতে পারে এবং রোগের ঝুঁকি বাড়তে পারে।</p> 

<ul> 
<li>🌱 জমির মাটি ২–৩ বার চাষ ও মই দিয়ে ঝুরঝুরে করে নিন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করুন।</li> 
<li>🍂 পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li> 
<li>🌱 প্রয়োজন অনুযায়ী সুষম সার ব্যবহার করুন।</li> 
<li>💧 পানি নিষ্কাশনের সুবিধার জন্য উঁচু বেড তৈরি করা ভালো।</li> 
</ul> 

<h3>🌱 বীজ বপনের পদ্ধতি</h3> 
<p>বীজ সরাসরি জমি, বেড বা বড় টবে বপন করা যায়। বীজ বপনের আগে মাটি ভালোভাবে ঝুরঝুরে ও হালকা আর্দ্র করে নিন। প্রতিটি বীজ প্রায় <strong>২–৩ সেমি গভীরে</strong> বপন করে পাতলা মাটি দিয়ে ঢেকে দিন। এরপর হালকা পানি দিন।</p> 

<p>অঙ্কুরোদগম না হওয়া পর্যন্ত মাটি শুকিয়ে যেতে দেবেন না। তবে অতিরিক্ত পানি দেওয়া যাবে না। চারা বের হওয়ার পর দুর্বল চারা বাদ দিয়ে সুস্থ ও শক্তিশালী গাছগুলো পর্যাপ্ত জায়গা রেখে বেড়ে ওঠার সুযোগ দিন।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>ছাদবাগান বা টবে লাল ঢেঁড়স চাষের জন্য বড় ও গভীর টব/গ্রো ব্যাগ ব্যবহার করুন। মাটির মিশ্রণ হিসেবে ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যাবে এবং শিকড় সুস্থ রাখতে সহায়তা করবে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>লাল ঢেঁড়সের ভালো বৃদ্ধির জন্য <strong>প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক</strong> প্রয়োজন। সম্ভব হলে এমন জায়গা নির্বাচন করুন যেখানে প্রতিদিন অন্তত ৬ ঘণ্টা রোদ পাওয়া যায়। পর্যাপ্ত আলো গাছের বৃদ্ধি ও ফলন উৎপাদনে সহায়তা করতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। গাছের গোড়ায় নিয়মিত আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন। গরম ও শুষ্ক আবহাওয়ায় পানির প্রয়োজন তুলনামূলক বেশি হতে পারে।</p> 

<h3>🌿 সার ও পরিচর্যা</h3> 
<ul> 
<li>🍂 গাছের গোড়ায় নিয়মিত পরিমাণমতো কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>🌱 গাছের বৃদ্ধি অনুযায়ী প্রয়োজনীয় পুষ্টি নিশ্চিত করুন।</li> 
<li>🌿 আগাছা নিয়মিত পরিষ্কার করুন।</li> 
<li>💧 মাটির আর্দ্রতা বজায় রাখুন, কিন্তু পানি জমতে দেবেন না।</li> 
<li>🐛 পাতার নিচে ও কচি ডগায় পোকামাকড়ের উপস্থিতি নিয়মিত পর্যবেক্ষণ করুন।</li> 
<li>✂️ অতিরিক্ত পুরোনো বা রোগাক্রান্ত পাতা থাকলে পরিষ্কার করে দিন।</li> 
</ul> 

<h3>🥬 ফল সংগ্রহের সঠিক সময়</h3> 
<p>ঢেঁড়সের ফল সাধারণত <strong>কোমল অবস্থায়</strong> সংগ্রহ করা ভালো। ফল বেশি পরিপক্ব হয়ে গেলে শক্ত ও আঁশযুক্ত হতে পারে। তাই নিয়মিত গাছ পর্যবেক্ষণ করে উপযুক্ত আকারের কোমল ফল সংগ্রহ করুন। নিয়মিত ফল সংগ্রহ করলে গাছে নতুন ফল আসার সুযোগ তৈরি হতে পারে।</p> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>উচ্চ ফলনশীল হাইব্রিড লাল ঢেঁড়স</strong> কৃষিজমি, কিচেন গার্ডেন, বাড়ির আঙিনা, ছাদবাগান, বড় টব ও গ্রো ব্যাগে চাষ করা যায়। ছোট জায়গায় কয়েকটি বড় টব ব্যবহার করেও নিজের পরিবারের জন্য তাজা লাল ঢেঁড়স উৎপাদন করা সম্ভব।</p> 

<h3>❤️ কেন লাল ঢেঁড়স চাষ করবেন?</h3> 
<ul> 
<li>❤️ আকর্ষণীয় উজ্জ্বল লাল রঙের ফল</li> 
<li>🌱 দ্রুত বৃদ্ধির জন্য উপযোগী হাইব্রিড জাত</li> 
<li>🥬 কোমল ও সুস্বাদু ঢেঁড়স উৎপাদনের জন্য উপযোগী</li> 
<li>🌿 দীর্ঘসময় ফলন পাওয়ার সুযোগ</li> 
<li>🏡 ছাদবাগান ও কিচেন গার্ডেনের জন্য আকর্ষণীয়</li> 
<li>🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li> 
<li>🌈 সাধারণ সবুজ ঢেঁড়সের পাশাপাশি বাগানে বৈচিত্র্য আনতে সহায়ক</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>উচ্চ ফলনশীল হাইব্রিড লাল ঢেঁড়সের বীজ</strong> দিয়ে আপনার ছাদবাগান, কিচেন গার্ডেন বা কৃষি জমিতে শুরু করুন আকর্ষণীয় লাল ঢেঁড়সের চাষ। সঠিক পরিচর্যা ও নিয়মিত ফল সংগ্রহের মাধ্যমে গড়ে তুলুন সুন্দর ও উৎপাদনশীল সবজি বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'VEG-1522', 8, 8, 1, 0, 70, '[]', '2026-09-24T01:42:31.719+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('badab387-1350-4f2a-93a0-0814df24c43f', 'উন্নত জাতের হাইব্রিড সাদা শসার বীজ', 'premium-hybrid-white-cucumber-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949169112-fd476om.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785400372397-mb61r7k.webp\"]', 150, 40, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, মিষ্টি স্বাদের, খাস্তা ও উচ্চ ফলনশীল সাদা শসা উৎপাদন করুন।', 'উন্নত জাতের হাইব্রিড সাদা শসা একটি আকর্ষণীয় ও উচ্চ ফলনশীল শসার জাত, যা হালকা সাদা রঙের, খাস্তা ও রসালো ফল উৎপাদন করে। এর ফল সুস্বাদু, কোমল এবং তিতা-মুক্ত হওয়ায় সালাদ ও তাজা খাওয়ার জন্য আদর্শ। ছাদ বাগান, কিচেন গার্ডেন এবং বাণিজ্যিক চাষে সমানভাবে উপযোগী।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৬০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1545', 11, 11, 1, 0, 73, '[]', '2026-09-24T01:48:30.596+00:00', '2026-10-13T05:24:32.251419+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('bfa674c6-a22d-44a8-bf0f-1ce3d2d84e78', 'কর্নফ্লাওয়ার ফুলের বীজ, (মিক্স কালার)', 'cornflower-mixed-color-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732435717-qifp578.webp', NULL, 130, 85, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"বসন্তকাল\",\"প্রধান- গ্রীষ্মকালীন\"]', 'আনুমানিক ৩০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের আকর্ষণীয় ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', '<h3>🌸 কর্নফ্লাওয়ার ফুলের বীজ (মিক্স কালার)</h3>
<p><strong>কর্নফ্লাওয়ার ফুলের বীজ (মিক্স কালার)</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন নীল, গোলাপি, সাদা, বেগুনি ও অন্যান্য আকর্ষণীয় রঙের দৃষ্টিনন্দন ফুলে। কর্নফ্লাওয়ার তার কোমল পাপড়ি, মনোমুগ্ধকর রং এবং বাগানের সৌন্দর্য বাড়ানোর জন্য জনপ্রিয়। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার ও খোলা বাগানে এই ফুল চাষ করা যায়। উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় সুস্থ গাছ এবং দীর্ঘ সময় ধরে সুন্দর ফুল পাওয়ার সম্ভাবনা থাকে।

<h3>📦 Product Specifications</h3>
<ul>
<li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৩০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>ফুলের রং:</strong> নীল, গোলাপি, সাদা, বেগুনি ও মিক্স কালার</li>
<li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li><strong>চাষের স্থান:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড ও খোলা বাগান</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>
<ul>
<li>🌸 বিভিন্ন আকর্ষণীয় রঙের ফুল পাওয়ার সুযোগ</li>
<li>🌿 সঠিক পরিচর্যায় সুস্থ ও সতেজ গাছ বেড়ে উঠতে পারে</li>
<li>🏡 টব, ছাদবাগান ও বাড়ির আঙিনায় চাষের উপযোগী</li>
<li>🌼 ফুলের বেড, বর্ডার ও বাগানের সৌন্দর্য বাড়াতে সহায়ক</li>
<li>🪴 উপযুক্ত পাত্র ও মাটিতে সহজে চাষ করা যায়</li>
<li>💐 বাড়ির বাগান ও ফুলের সাজসজ্জার জন্য সুন্দর একটি নির্বাচন</li>
</ul>

<h3>📅 কর্নফ্লাওয়ার চাষের উপযুক্ত সময়</h3>
<p>কর্নফ্লাওয়ার তুলনামূলক শীতল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় সাধারণত <strong>শীতকাল কর্নফ্লাওয়ার চাষের জন্য বেশি উপযোগী</strong>। অক্টোবরের শেষ থেকে ডিসেম্বরের মধ্যে বীজ বপন করে চাষ শুরু করা যেতে পারে। তবে এলাকার আবহাওয়া, তাপমাত্রা ও বীজের জাত অনুযায়ী বপনের সময় কিছুটা পরিবর্তিত হতে পারে। অতিরিক্ত গরম ও দীর্ঘ সময়ের জলাবদ্ধতা গাছের বৃদ্ধিতে বাধা সৃষ্টি করতে পারে।</p>

<h3>🌱 মাটি প্রস্তুত করার পদ্ধতি</h3>
<p>কর্নফ্লাওয়ার চাষের জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ মাটি ভালো। মাটিতে প্রয়োজনীয় জৈব পদার্থ থাকলে গাছের শিকড়ের বৃদ্ধি ও পুষ্টি গ্রহণে সহায়তা করে।</p>
<ul>
<li>মাটি ভালোভাবে কুপিয়ে বা ঝুরঝুরে করে নিন।</li>
<li>মাটি থেকে পাথর, আগাছা ও শক্ত মাটির ঢেলা সরিয়ে ফেলুন।</li>
<li>মাটির সঙ্গে ভালোভাবে পচানো গোবর বা কম্পোস্ট মিশিয়ে নিন।</li>
<li>পানি নিষ্কাশনের সুবিধা নিশ্চিত করুন, যাতে টব বা বেডে পানি জমে না থাকে।</li>
<li>জমিতে চাষ করলে প্রয়োজন অনুযায়ী উঁচু বেড তৈরি করুন।</li>
</ul>
<p><strong>সহজ মাটির মিশ্রণ:</strong> ৫০% দোআঁশ মাটি, ৩০% পচা কম্পোস্ট এবং ২০% কোকোপিট বা মোটা বালু মিশিয়ে টবের জন্য উপযোগী মাটি তৈরি করতে পারেন। মাটির ধরন অনুযায়ী এই অনুপাত কিছুটা পরিবর্তন করা যায়।</p>

<h3>🌿 বীজ বপনের সঠিক পদ্ধতি</h3>
<p>কর্নফ্লাওয়ারের বীজ সরাসরি টব, গ্রো ব্যাগ, ফুলের বেড বা জমিতে বপন করা যায়। বীজ বপনের আগে মাটি হালকা আর্দ্র করে নিন। এরপর মাটির উপর বীজ ছড়িয়ে দিয়ে তার ওপর প্রায় ৩–৫ মিলিমিটার সূক্ষ্ম মাটির পাতলা স্তর দিন। বীজ খুব গভীরে পুঁতে দেওয়া উচিত নয়।</p>
<ul>
<li>বীজ বপনের পর স্প্রে বোতল দিয়ে হালকা পানি দিন।</li>
<li>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন।</li>
<li>পাত্রটি পর্যাপ্ত আলো ও বাতাস চলাচল করে এমন স্থানে রাখুন।</li>
<li>চারা বড় হলে অতিরিক্ত ঘন চারাগুলো পাতলা করে দিন, যাতে প্রতিটি গাছ পর্যাপ্ত আলো, বাতাস ও পুষ্টি পায়।</li>
</ul>

<h3>🪴 টব ও ছাদবাগানে কর্নফ্লাওয়ার চাষ</h3>
<p>কর্নফ্লাওয়ার টব, গ্রো ব্যাগ এবং ছাদবাগানের ফুলের বেডে চাষ করা যায়। গাছের শিকড় বৃদ্ধির জন্য উপযুক্ত গভীরতার পাত্র বেছে নিন। টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র থাকা জরুরি। টব এমন স্থানে রাখুন, যেখানে প্রতিদিন পর্যাপ্ত সূর্যালোক পাওয়া যায়।</p>
<p>একই পাত্রে অতিরিক্ত গাছ লাগাবেন না। গাছের বৃদ্ধি অনুযায়ী পর্যাপ্ত জায়গা রাখলে বাতাস চলাচল সহজ হয় এবং পরিচর্যাও সুবিধাজনক হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<p>কর্নফ্লাওয়ারের ভালো বৃদ্ধির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৬ ঘণ্টা বা তার বেশি রোদ পায় এমন স্থানে রাখলে ভালো ফল পাওয়া যেতে পারে। গাছের গোড়ার মাটি শুকাতে শুরু করলে প্রয়োজন অনুযায়ী পানি দিন। তবে অতিরিক্ত পানি দিয়ে মাটি সব সময় ভেজা বা জলাবদ্ধ করে রাখবেন না।</p>

<h3>💧 সার ও নিয়মিত পরিচর্যা</h3>
<ul>
<li>মাটি প্রস্তুতের সময় পরিমিত পরিমাণে পচা কম্পোস্ট বা জৈব সার মিশিয়ে নিন।</li>
<li>গাছের বৃদ্ধি ও মাটির অবস্থা বুঝে প্রয়োজন অনুযায়ী সার প্রয়োগ করুন।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন।</li>
<li>গাছের গোড়ায় পানি জমতে দেবেন না।</li>
<li>শুকিয়ে যাওয়া ফুল ও ক্ষতিগ্রস্ত পাতা সরিয়ে দিলে গাছ পরিচ্ছন্ন থাকে।</li>
<li>অতিরিক্ত নাইট্রোজেন সার ব্যবহার এড়িয়ে চলুন, কারণ এতে পাতার বৃদ্ধি বেশি হলেও ফুলের পরিমাণ প্রভাবিত হতে পারে।</li>
</ul>

<h3>🐛 রোগ ও পোকামাকড় ব্যবস্থাপনা</h3>
<p>গাছের পাতা ও কাণ্ড নিয়মিত পর্যবেক্ষণ করুন। পাতায় দাগ, পচন বা পোকামাকড়ের আক্রমণ দেখা দিলে আক্রান্ত অংশ সরিয়ে ফেলুন এবং গাছের চারপাশ পরিষ্কার রাখুন। পর্যাপ্ত আলো-বাতাস চলাচল নিশ্চিত করুন এবং অতিরিক্ত সেচ এড়িয়ে চলুন। প্রয়োজন হলে সমস্যার ধরন অনুযায়ী স্থানীয়ভাবে অনুমোদিত বালাই ব্যবস্থাপনা পণ্য লেবেলের নির্দেশনা অনুসরণ করে ব্যবহার করুন।</p>

<h3>🌼 ফুল ফোটা ও বাগানের সৌন্দর্য</h3>
<p>উপযুক্ত আবহাওয়া, পর্যাপ্ত রোদ, সঠিক মাটি ও নিয়মিত পরিচর্যা কর্নফ্লাওয়ার গাছের স্বাভাবিক বৃদ্ধি এবং ফুল ফোটাতে সহায়তা করে। মিক্স কালারের ফুল বাগানে বৈচিত্র্য তৈরি করে এবং অন্যান্য ফুলের গাছের সঙ্গে সাজিয়ে লাগালে দৃষ্টিনন্দন পরিবেশ তৈরি করা যায়। ফুল ফোটার সময় জাত ও পরিবেশ অনুযায়ী ভিন্ন হতে পারে।</p>

<h3>🏡 কোথায় কর্নফ্লাওয়ার চাষ করা যায়?</h3>
<ul>
<li>🏠 বাড়ির আঙিনা ও সামনের বাগান</li>
<li>🏢 ছাদবাগান</li>
<li>🌿 বারান্দা ও ছোট বাগান</li>
<li>🪴 টব ও গ্রো ব্যাগ</li>
<li>🌸 ফুলের বেড ও বাগানের বর্ডার</li>
<li>💐 বাড়ির সৌন্দর্যবর্ধক ফুলের বাগান</li>
</ul>

<h3>💚 কেন কর্নফ্লাওয়ার ফুলের বীজ (মিক্স কালার) চাষ করবেন?</h3>
<p>বিভিন্ন রঙের আকর্ষণীয় ফুলে বাগান সাজাতে <strong>কর্নফ্লাওয়ার ফুলের বীজ (মিক্স কালার)</strong> হতে পারে একটি সুন্দর পছন্দ। সঠিক মৌসুমে বপন, পর্যাপ্ত সূর্যালোক, পানি নিষ্কাশনযোগ্য মাটি এবং নিয়মিত পরিচর্যার মাধ্যমে টব বা বাগানে মনোমুগ্ধকর ফুলের সমাহার তৈরি করতে পারেন।</p>

<p><strong>🌱 আজই অর্ডার করুন এবং আপনার বাগানকে সাজিয়ে তুলুন রঙিন কর্নফ্লাওয়ার ফুলে!</strong></p>', 'FUL-1507', 7, 7, 1, 0, 75, '[]', '2026-09-24T01:42:32.707+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2ff6fa36-31fc-4973-8bb3-3691d9d214db', 'হাইব্রিড লাল বরবটি (প্রিমিয়াম কোয়ালিটি বীজ)', 'hybrid-red-yardlong-bean-seeds-premium-quality', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949211818-tt0sij.png', NULL, 220, 85, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ১০ গ্রাম বা ৫০ টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লাল রঙের, কোমল, সুস্বাদু ও উচ্চ ফলনশীল বরবটি উৎপাদন করুন।', 'হাইব্রিড লাল বরবটি (প্রিমিয়াম কোয়ালিটি বীজ) একটি উন্নত মানের ও উচ্চ ফলনশীল জাত, যা লম্বা, আকর্ষণীয় লাল রঙের এবং কোমল শুঁটি উৎপাদন করে। এর গাছ দ্রুত বৃদ্ধি পায়, দীর্ঘ সময় ধরে ফলন দেয় এবং বিভিন্ন আবহাওয়ায় ভালো উৎপাদন করে। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি অত্যন্ত উপযোগী। বাজারে এর ব্যতিক্রমী রঙ ও মানের কারণে বিশেষ চাহিদা রয়েছে।&nbsp;<div><br></div><div><span style=\"font-weight: bold;\">&nbsp;Product Specifications&nbsp;</span></div><div><ul><li>&nbsp;📦 বীজ সংখ্যা: আনুমানিক ৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)&nbsp;</li><li>🌱 বিশুদ্ধতা (Purity): ৯৫%&nbsp;</li><li>✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%</li><li>✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%&nbsp;</li><li>🪴 বেঁচে থাকার হার (Survival Rate): ৯০%</li></ul><div><br></div></div><div><span style=\"font-weight: bold;\">চাষের উপযুক্ত মৌসুম ও সময়</span></div><div><ul><li><span style=\"font-weight: bold;\">প্রধান মৌসুম:</span> ফেব্রুয়ারি থেকে জুলাই মাস (বসন্ত থেকে বর্ষার শুরু) বীজ বপনের জন্য সেরা।</li><li><span style=\"font-weight: bold;\">অন্যান্য সময়:</span> উষ্ণ ও উপযোগী আবহাওয়া থাকলে সারা বছরই এর কিছু জাত চাষ করা যায়।</li></ul><div><br></div></div><div><span style=\"font-weight: bold;\">মাটি তৈরি পদ্ধতি</span></div><div><ul><li><span style=\"font-weight: bold;\">মাটির ধরন: </span>দো-আঁশ ও বেলে দো-আঁশ মাটি বরবটি চাষের জন্য সবচেয়ে ভালো। মাটিতে যেন পানি জমে না থাকে, সে ব্যবস্থা থাকতে হবে।</li><li><span style=\"font-weight: bold;\">চাষ ও মই দেওয়া:</span> জমি ভালোভাবে ৪ থেকে ৫টি চাষ ও মই দিয়ে মাটি ঝুরঝুরে ও সমান করতে হবে। সব আগাছা ও পুরোনো শেকড় পরিষ্কার করে নিতে হবে।</li><li><span style=\"font-weight: bold;\">সার প্রয়োগ: </span>জমি তৈরির সময় মাটির সাথে পর্যাপ্ত জৈব সার বা গোবর, টিএসপি এবং পটাশ সার ভালোভাবে মিশিয়ে দিতে হবে।</li><li><span style=\"font-weight: bold;\">মাদা বা বেড তৈরি: </span>পানি নিষ্কাশনের সুবিধার জন্য জমি উঁচু করে বেড বা ছোট মাদা (গর্ত) তৈরি করতে হবে।</li></ul></div><div><br></div><div><br></div>', 'VEG-1542', 10, 10, 1, 0, 80, '[]', '2026-09-24T01:42:46.881+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('a6369803-237a-4073-98be-881a62520c17', 'হাইব্রিড ভুঁই শসা (মাচা ছাড়া চাষযোগ্য)', 'hybrid-ground-cucumber-seeds-no-trellis', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784180145-9jn2pjq.webp', NULL, 170, 110, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[]', 'আনুমানিক ৭০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড ভুঁই শসা, মাচা ছাড়াই চাষযোগ্য, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '<h3>🌱 Product Short Description</h3><p>হাইব্রিড ভুঁই শসার বীজ এমন একটি জাতের জন্য উপযোগী, যা <strong>মাচা ছাড়াই মাটিতে চাষ করা যায়</strong>। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং তাজা, আকর্ষণীয় শসা উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও খোলা জমিতে সহজে চাষের জন্য উপযোগী। 🥒 <strong>মাচা তৈরির ঝামেলা ছাড়াই শসা চাষ শুরু করতে আজই অর্ডার করুন!</strong></p><h3>📋 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৭০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌱 <strong>জাত:</strong> হাইব্রিড ভুঁই শসা</li><li>🪴 <strong>চাষ পদ্ধতি:</strong> মাচা ছাড়া চাষযোগ্য</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>☀️ কোন কোন মৌসুমে ভালো হয়?</h3><p>শসা উষ্ণ ও পর্যাপ্ত সূর্যালোকযুক্ত পরিবেশে ভালো বেড়ে ওঠে। বাংলাদেশে সাধারণত <strong>গ্রীষ্ম ও বর্ষার শুরুতে</strong> শসা চাষ ভালো করা যায়।</p><ul><li>🌤️ <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — চাষের জন্য ভালো সময়।</li><li>☀️ <strong>গ্রীষ্ম:</strong> মার্চ–মে — উষ্ণ পরিবেশে দ্রুত বৃদ্ধি পেতে পারে।</li><li>🌧️ <strong>বর্ষার শুরু:</strong> জুন–জুলাই — পর্যাপ্ত পানি নিষ্কাশনের ব্যবস্থা থাকলে চাষ করা যায়।</li><li>❄️ অতিরিক্ত শীত ও কুয়াশার সময়ে গাছের বৃদ্ধি তুলনামূলক ধীর হতে পারে।</li></ul><h3>🪴 ভুঁই শসা চাষের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br>ঝুরঝুরে <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> ভুঁই শসার জন্য উপযোগী। মাটি উর্বর এবং পানি নিষ্কাশনযোগ্য হওয়া গুরুত্বপূর্ণ।</p><p><strong>২. জমি প্রস্তুত করুন</strong><br>জমি ২–৩ বার ভালোভাবে কোপানো/চাষ দিয়ে মাটি ঝুরঝুরে করুন। আগাছা, পাথর ও আগের ফসলের অবশিষ্ট শিকড় সরিয়ে ফেলুন।</p><p><strong>৩. উঁচু বেড তৈরি করুন</strong><br>ভুঁই শসার লতা মাটিতে ছড়িয়ে বাড়বে, তাই অতিরিক্ত পানি জমে থাকা এড়াতে <strong>উঁচু বেড</strong> তৈরি করা ভালো। এতে শিকড়ে বাতাস চলাচল ও পানি নিষ্কাশন ভালো থাকে।</p><p><strong>৪. জৈব সার ব্যবহার করুন</strong><br>প্রতি শতক জমিতে ভালোভাবে পচা গোবর বা কম্পোস্ট প্রায় <strong>৪০–৫০ কেজি</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। কাঁচা গোবর সরাসরি ব্যবহার না করাই ভালো।</p><p><strong>৫. চারা তৈরির মাটি</strong><br>ট্রে বা ছোট পাত্রে চারা তৈরি করতে চাইলে:</p><ul><li>৫০% ঝুরঝুরে দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>ভালোভাবে মিশিয়ে ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য মাধ্যম তৈরি করুন।</p><p><strong>৬. বীজ বপনের আগে</strong><br>মাটি হালকা আর্দ্র রাখুন। বীজ খুব গভীরে না দিয়ে উপযুক্ত গভীরতায় বপন করুন এবং অতিরিক্ত পানি দেওয়া এড়িয়ে চলুন।</p><p><strong>৭. পানি নিষ্কাশনের ব্যবস্থা</strong><br>শসার গোড়ায় দীর্ঘসময় পানি জমে থাকলে শিকড়ের সমস্যা ও রোগের ঝুঁকি বাড়তে পারে। তাই নালা ও নিষ্কাশন ব্যবস্থা ভালো রাখুন।</p><p>💡 <strong>বিশেষ টিপস:</strong> যেহেতু এটি মাচা ছাড়া চাষযোগ্য, তাই লতা মাটিতে ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন। ফল মাটির সরাসরি সংস্পর্শে থাকলে খড়, শুকনো পাতা বা পরিষ্কার মালচ ব্যবহার করা যেতে পারে।</p><h3></h3>', 'VEG-1605', 8, 8, 1, 0, 82, '[]', '2026-10-01T10:27:37.003+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('9efd3536-99ca-40ee-a2f8-8c05d43b1c2d', 'চায়না লং প্রিমিয়াম হাইব্রিড ধুন্দুল বীজ', 'chinese-hybrid-purple-edge-bean-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949205269-66f997y.webp', NULL, 140, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\"]', 'আনুমানিক ৫ গ্রাম ৩০ টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, লম্বা, কোমল ও সুস্বাদু ধুন্দুল উৎপাদনের জন্য আদর্শ।', '<h3>🌱 Product Short Description</h3> 
<p><strong>চায়না লং প্রিমিয়াম হাইব্রিড ধুন্দুল</strong> একটি উন্নতমানের ও উচ্চ ফলনশীল জাত, যা লম্বা, মসৃণ ও আকর্ষণীয় সবুজ ধুন্দুল উৎপাদনের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে গাছ দ্রুত বৃদ্ধি পায় এবং দীর্ঘসময় ধরে ফলন দিতে সহায়তা করে।</p> 

<p>এর ফল কোমল, কম আঁশযুক্ত ও স্বাদে চমৎকার হওয়ায় বিভিন্ন ধরনের রান্নার জন্য উপযোগী। ছাদবাগান, কিচেন গার্ডেন, বড় টব বা গ্রো ব্যাগ এবং বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন। 🥒</p> 

<h3>📋 Product Specifications</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৩০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🥒 <strong>জাত:</strong> চায়না লং প্রিমিয়াম হাইব্রিড ধুন্দুল</li> 
<li>🥒 <strong>ফলের বৈশিষ্ট্য:</strong> লম্বা, মসৃণ ও আকর্ষণীয় সবুজ</li> 
<li>🌱 <strong>বৈশিষ্ট্য:</strong> দ্রুত বর্ধনশীল ও উচ্চ ফলনশীল</li> 
<li>🍽️ <strong>খাদ্যগুণ:</strong> কোমল, কম আঁশযুক্ত ও সুস্বাদু</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে ভালো হয়?</h3> 
<p>ধুন্দুল উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়া পছন্দ করে। বাংলাদেশে সাধারণত উষ্ণ মৌসুমে চায়না লং হাইব্রিড ধুন্দুল চাষ ভালো ফল দিতে পারে। পর্যাপ্ত আলো, পানি নিষ্কাশন এবং সঠিক পরিচর্যা নিশ্চিত করা গুরুত্বপূর্ণ।</p> 

<ul> 
<li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল — চাষের জন্য উপযোগী সময়।</li> 
<li>☀️ <strong>গ্রীষ্ম:</strong> এপ্রিল–জুন — উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পেতে পারে।</li> 
<li>🌧️ <strong>বর্ষার শুরু:</strong> পর্যাপ্ত ড্রেনেজ থাকলে চাষ করা যায়।</li> 
<li>🍂 <strong>শরৎ:</strong> অতিরিক্ত বৃষ্টি কমে গেলে অনুকূল পরিবেশে চাষ করা যেতে পারে।</li> 
</ul> 

<p>অতিরিক্ত ঠান্ডা ও দীর্ঘসময় জলাবদ্ধতা এড়িয়ে চলুন। বর্ষাকালে উঁচু বেড ও ভালো পানি নিষ্কাশনের ব্যবস্থা রাখা বিশেষভাবে গুরুত্বপূর্ণ।</p> 

<h3>🪴 ধুন্দুলের জন্য মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 

<p><strong>১. উপযুক্ত মাটি নির্বাচন করুন</strong><br> 
ধুন্দুলের জন্য উর্বর, ঝুরঝুরে ও ভালো পানি নিষ্কাশনযোগ্য <strong>দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটিতে পর্যাপ্ত জৈব পদার্থ থাকা ভালো এবং পানি জমে থাকে এমন ভারী মাটি এড়িয়ে চলুন।</p> 

<p><strong>২. জমি ভালোভাবে প্রস্তুত করুন</strong><br> 
প্রথমে জমি থেকে আগাছা, শুকনো শিকড় ও আবর্জনা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার ভালোভাবে কুপিয়ে বা চাষ দিয়ে</strong> ঝুরঝুরে করে নিন। বড় মাটির ঢেলা ভেঙে জমি সমান করে দিন।</p> 

<p><strong>৩. জৈব সার প্রয়োগ করুন</strong><br> 
প্রতি শতক জমিতে আনুমানিক <strong>৪০–৫০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। এতে মাটির উর্বরতা, গঠন ও পানি ধারণক্ষমতা উন্নত হতে সাহায্য করবে। কাঁচা গোবর ব্যবহার করবেন না।</p> 

<p><strong>৪. উঁচু বেড ও পানি নিষ্কাশনের ব্যবস্থা করুন</strong><br> 
ধুন্দুল জলাবদ্ধতা সহ্য করতে পারে না। তাই জমিতে পানি জমার প্রবণতা থাকলে <strong>উঁচু বেড</strong> তৈরি করুন এবং বেডের পাশে নালা রাখুন। এতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p> 

<p><strong>৫. মাচা বা ট্রেলিস তৈরি করুন</strong><br> 
ধুন্দুলের লতা দ্রুত বৃদ্ধি পায়। তাই গাছের জন্য শক্ত <strong>মাচা বা ট্রেলিস</strong> তৈরি করলে লতা উপরে উঠতে পারে এবং ফল মাটির সংস্পর্শ থেকে দূরে থাকে। এতে পরিচর্যা ও ফল সংগ্রহও সহজ হয়।</p> 

<h3>🪴 টব বা ছাদবাগানের জন্য আদর্শ মাটির মিশ্রণ</h3> 
<p>ছাদবাগান, টব বা গ্রো ব্যাগে চায়না লং হাইব্রিড ধুন্দুল চাষের জন্য নিচের মাটির মিশ্রণ ব্যবহার করতে পারেন:</p> 

<ul> 
<li>🟤 <strong>৪০%:</strong> ঝুরঝুরে দোআঁশ মাটি</li> 
<li>🌴 <strong>৩০%:</strong> কোকোপিট</li> 
<li>🍂 <strong>২০%:</strong> ভালোভাবে পচা কম্পোস্ট বা ভার্মিকম্পোস্ট</li> 
<li>🏖️ <strong>১০%:</strong> মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>সব উপকরণ ভালোভাবে মিশিয়ে ব্যবহার করুন। লতা ও শিকড়ের বৃদ্ধির জন্য তুলনামূলক বড় টব বা গ্রো ব্যাগ নির্বাচন করুন এবং নিচে পর্যাপ্ত <strong>ড্রেনেজ ছিদ্র</strong> রাখুন।</p> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>ধুন্দুলের বীজ সরাসরি জমি, টব বা গ্রো ব্যাগে বপন করা যায়। বীজ বপনের আগে মাটি ঝুরঝুরে ও হালকা আর্দ্র করে নিন। সাধারণভাবে বীজ <strong>প্রায় ২–৩ সেন্টিমিটার গভীরে</strong> বপন করা যেতে পারে।</p> 

<p>বীজ বপনের পর হালকা পানি দিন এবং মাটি আর্দ্র রাখুন। অতিরিক্ত পানি দিয়ে মাটিতে জলাবদ্ধতা তৈরি করবেন না। চারা গজানোর পর সবল গাছ রেখে প্রয়োজন অনুযায়ী দুর্বল চারা সরিয়ে দিতে পারেন।</p> 

<p>গাছ বাড়তে শুরু করলে দ্রুত মাচা বা ট্রেলিসে লতা তুলে দিন। এতে গাছের বৃদ্ধি সুশৃঙ্খল হয় এবং লম্বা সবুজ ফল পরিষ্কার ও সুন্দরভাবে বেড়ে উঠতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<ul> 
<li>🌞 প্রতিদিন <strong>৬–৮ ঘণ্টা পর্যাপ্ত সূর্যালোক</strong> পাওয়া যায় এমন স্থানে চাষ করা ভালো।</li> 
<li>💧 মাটি শুকিয়ে যাওয়ার আগেই প্রয়োজন অনুযায়ী পানি দিন।</li> 
<li>🚫 অতিরিক্ত পানি দিয়ে জমি বা টবে জলাবদ্ধতা তৈরি করবেন না।</li> 
<li>🌿 গাছের গোড়ার আগাছা নিয়মিত পরিষ্কার রাখুন।</li> 
<li>🪴 মাটি শক্ত হয়ে গেলে গোড়ার চারপাশের মাটি হালকা করে আলগা করুন।</li> 
</ul> 

<h3>🥒 ভালো ফলনের জন্য পরিচর্যার টিপস</h3> 
<ul> 
<li>🌞 পর্যাপ্ত সূর্যালোক নিশ্চিত করুন।</li> 
<li>🌱 উর্বর ও জৈব পদার্থসমৃদ্ধ মাটি ব্যবহার করুন।</li> 
<li>🌿 লতার জন্য শক্ত মাচা বা ট্রেলিস তৈরি করুন।</li> 
<li>🍂 নিয়মিত পরিমাণমতো কম্পোস্ট বা জৈব সার প্রয়োগ করুন।</li> 
<li>💧 ফুল ও ফল ধরার সময় মাটিতে পর্যাপ্ত আর্দ্রতা বজায় রাখুন।</li> 
<li>🐝 ফুল আসার সময় পরাগায়নকারী পোকামাকড়ের উপস্থিতি বজায় রাখতে অপ্রয়োজনীয় কীটনাশক ব্যবহার এড়িয়ে চলুন।</li> 
<li>🥒 ফল কোমল অবস্থায় নিয়মিত সংগ্রহ করলে নতুন ফল ধরতে সহায়তা করতে পারে।</li> 
<li>🐛 পাতা ও ফলে পোকামাকড় বা রোগের লক্ষণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
</ul> 

<h3>🌿 চাষের উপযুক্ত স্থান</h3> 
<ul> 
<li>🏡 কিচেন গার্ডেন</li> 
<li>🌿 ছাদবাগান</li> 
<li>🪴 বড় টব বা গ্রো ব্যাগ</li> 
<li>🌱 সবজি বাগান</li> 
<li>🚜 বাণিজ্যিক চাষের জমি</li> 
</ul> 

<h3>🥒 চায়না লং হাইব্রিড ধুন্দুলের বিশেষ আকর্ষণ</h3> 
<p>লম্বা, মসৃণ ও আকর্ষণীয় সবুজ ফলের পাশাপাশি কোমল ও কম আঁশযুক্ত বৈশিষ্ট্যের কারণে এই ধুন্দুল বিভিন্ন ধরনের রান্নার জন্য উপযোগী। দ্রুত বর্ধনশীল গাছ সঠিক পরিচর্যায় দীর্ঘসময় ধরে ফলন দিতে সহায়তা করতে পারে।</p> 

<h3>🛒 অর্ডার করুন</h3> 
<p><strong>ছাদবাগান, কিচেন গার্ডেন বা বাণিজ্যিক চাষে লম্বা, কোমল ও আকর্ষণীয় সবুজ ধুন্দুল চাষ করতে আজই চায়না লং প্রিমিয়াম হাইব্রিড ধুন্দুলের বীজ অর্ডার করুন! 🥒🌱</strong></p>', 'VEG-1521', 6, 6, 1, 0, 87, '[]', '2026-09-24T01:42:30.424+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f3e8187e-9b12-4e41-bd1b-7cfdd330f6b2', 'অরনামেন্টাল মিনি সূর্যমুখী ফুলের বীজ (শোভাবর্ধনকারী জাত)', 'ornamental-mini-sunflower-flower-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784198493-5vi1kfl.webp', NULL, 180, 110, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"হাইব্রিড\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | অরনামেন্টাল মিনি সূর্যমুখী, শোভাবর্ধনকারী সুন্দর ফুলের জন্য উপযোগী।', '📝 Product Short Description<p><strong>অরনামেন্টাল মিনি সূর্যমুখী ফুলের বীজ (শোভাবর্ধনকারী জাত)</strong> ছোট আকৃতির সুন্দর সূর্যমুখী গাছ ও আকর্ষণীয় ফুল উৎপাদনের জন্য উপযোগী একটি শোভাবর্ধনকারী জাত। উজ্জ্বল হলুদ ফুল বাগান, টব, বারান্দা ও ছাদবাগানকে আরও প্রাণবন্ত ও আকর্ষণীয় করে তুলতে পারে। 🌻</p><p>সঠিক পরিচর্যা, পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও নিয়মিত পানি ব্যবস্থাপনা নিশ্চিত করলে স্বাস্থ্যকর গাছ এবং সুন্দর ফুল উৎপাদনে সহায়ক। ছোট জায়গায় শোভাবর্ধনকারী ফুলের বাগান তৈরির জন্যও এটি উপযোগী।</p><p><strong>নিজের বাগানে মিনি সূর্যমুখীর সৌন্দর্য আনতে আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌻 <strong>ফুলের নাম:</strong> অরনামেন্টাল মিনি সূর্যমুখী</li><li>🌿 <strong>জাতের ধরন:</strong> শোভাবর্ধনকারী জাত</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🏡 <strong>ব্যবহার:</strong> টব, বারান্দা, ছাদবাগান ও ফুলের বাগান</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>সূর্যমুখী উষ্ণ আবহাওয়া ও পর্যাপ্ত সূর্যালোক পছন্দ করে। বাংলাদেশে <strong>শীতের শেষভাগ থেকে বসন্তকাল</strong> মিনি সূর্যমুখী চাষের জন্য বেশ উপযোগী। পর্যাপ্ত আলো ও পানি নিষ্কাশনের ব্যবস্থা থাকলে অন্যান্য সময়েও টবে চাষ করা যায়।</p><p><strong>🌱 উপযোগী সময়:</strong></p><ul><li>🍂 <strong>শরৎ:</strong> অক্টোবর–নভেম্বর</li><li>❄️ <strong>শীতকাল:</strong> নভেম্বর–ফেব্রুয়ারি</li><li>🌸 <strong>বসন্ত:</strong> ফেব্রুয়ারি–এপ্রিল</li><li>☀️ গ্রীষ্মকালে চাষ করলে অতিরিক্ত তাপ ও পানির ঘাটতি থেকে গাছকে সুরক্ষিত রাখুন।</li><li>🌧️ বর্ষাকালে চাষ করলে পানি জমে না এমন জায়গা নির্বাচন করুন।</li></ul><h3>🪴 কিভাবে মাটি তৈরি করবেন?</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>মিনি সূর্যমুখীর জন্য <strong>ঝুরঝুরে, উর্বর ও ভালো পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি</strong> ব্যবহার করা ভালো। অতিরিক্ত পানি ধরে রাখে এমন ভারী মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুত<p>বাগানের মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে ঝুরঝুরে করুন। আগাছা, পাথর ও শুকনো শিকড় পরিষ্কার করে মাটি সমান করে নিন।</p>৩️⃣ জৈব সার মেশানো<p>মাটির সঙ্গে ভালোভাবে পচা কম্পোস্ট বা গোবর সার মিশিয়ে দিন। এতে মাটির গঠন উন্নত হয় এবং গাছের শিকড় বৃদ্ধির জন্য উপযোগী পরিবেশ তৈরি হয়।</p>৪️⃣ টবের মাটির মিশ্রণ<p>টবে অরনামেন্টাল মিনি সূর্যমুখী চাষের জন্য ব্যবহার করতে পারেন:</p><ul><li>৫০% দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট</li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে মাটি তৈরি করুন।</p>৫️⃣ পানি নিষ্কাশনের ব্যবস্থা<p>টবের নিচে পর্যাপ্ত <strong>drainage hole</strong> থাকা জরুরি। অতিরিক্ত পানি যেন দ্রুত বের হয়ে যেতে পারে তা নিশ্চিত করুন। মাটিতে দীর্ঘসময় পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে।</p><h3>🌱 বীজ বপনের পদ্ধতি</h3><p>সূর্যমুখীর বীজ সাধারণত সরাসরি টব বা নির্দিষ্ট জায়গায় বপন করা যায়। ঝুরঝুরে আর্দ্র মাটিতে বীজ বপন করে হালকা মাটি দিয়ে ঢেকে দিন। বীজ বপনের পর হালকা পানি স্প্রে করুন এবং মাটি আর্দ্র রাখুন, তবে পানি জমতে দেবেন না।</p><p>চারা বের হওয়ার পর পর্যাপ্ত সূর্যালোক নিশ্চিত করুন। অতিরিক্ত ঘন হলে দুর্বল চারাগুলো সরিয়ে সুস্থ গাছগুলোর জন্য পর্যাপ্ত জায়গা রাখুন।</p><h3>💧 পানি ও পরিচর্যা</h3><p>মাটির আর্দ্রতা নিয়মিত পর্যবেক্ষণ করুন। মাটির উপরিভাগ কিছুটা শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। গাছের গোড়ায় পানি জমতে দেবেন না।</p><h3>🌻 সুন্দর ফুল পাওয়ার জন্য গুরুত্বপূর্ণ টিপস</h3><ul><li>প্রতিদিন পর্যাপ্ত সূর্যালোক পায় এমন জায়গা নির্বাচন করুন।</li><li>টবের আকার গাছের বৃদ্ধির উপযোগী রাখুন।</li><li>পানি জমে থাকে এমন মাটি এড়িয়ে চলুন।</li><li>নিয়মিত আগাছা পরিষ্কার করুন।</li><li>প্রয়োজন অনুযায়ী কম্পোস্ট বা জৈব সার ব্যবহার করুন।</li><li>গাছ বড় হলে বাতাসের চাপ থেকে রক্ষার জন্য প্রয়োজন অনুযায়ী সাপোর্ট দিতে পারেন।</li><li>শুকনো ফুল ও পাতা পরিষ্কার রাখুন।</li></ul><p><strong>ছোট জায়গায় উজ্জ্বল ও আকর্ষণীয় ফুলের বাগান তৈরি করতে অরনামেন্টাল মিনি সূর্যমুখী একটি সুন্দর পছন্দ।</strong> 🌻</p>', 'FUL-1561', 9, 9, 1, 0, 93, '[]', '2026-10-01T11:26:08.389+00:00', '2026-10-14T06:04:44.828383+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('39096417-9b97-4e79-ab51-308aa0d35163', 'জাপানিজ হাইব্রিড মিষ্টি কুমড়া বীজ', 'japanese-hybrid-sweet-pumpkin-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784190231-wgnmkrw.webp', NULL, 190, 45, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', 'আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জাপানিজ হাইব্রিড মিষ্টি কুমড়া, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', '<h3>📝 Product Short Description</h3><p><strong>জাপানিজ হাইব্রিড মিষ্টি কুমড়া বীজ</strong> উন্নতমানের মিষ্টি কুমড়া চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা, পর্যাপ্ত আলো-বাতাস ও উপযুক্ত মাটি নিশ্চিত করলে শক্তিশালী গাছ এবং আকর্ষণীয় ও ভালো মানের মিষ্টি কুমড়া উৎপাদনে সহায়ক।</p><p>বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষ—বিভিন্ন ধরনের চাষাবাদের জন্য উপযোগী। নিজের বাগানে জাপানিজ হাইব্রিড মিষ্টি কুমড়া চাষ শুরু করতে <strong>আজই অর্ডার করুন!</strong></p><h3>📦 Product Specifications</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🌱 <strong>জাত:</strong> জাপানিজ হাইব্রিড মিষ্টি কুমড়া</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🌏 <strong>উৎপত্তি:</strong> চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)</li></ul><h3>☀️ কোন কোন মৌশুমে ভালো হয়?</h3><p>মিষ্টি কুমড়া উষ্ণ আবহাওয়ার ফসল। বাংলাদেশে সাধারণভাবে <strong>শীতকালীন ও গ্রীষ্মকালীন—দুই সময়েই</strong> মিষ্টি কুমড়া চাষ করা যায়। BAMIS-এর তথ্য অনুযায়ী মিষ্টি কুমড়ার জন্য <strong>অক্টোবর–নভেম্বর</strong> একটি উপযোগী বপন সময়; অন্যান্য কৃষি তথ্যসূত্রে <strong>ফেব্রুয়ারি–মে</strong> সময়কেও গ্রীষ্মকালীন চাষের জন্য উপযোগী বলা হয়েছে।</p><p><strong>প্রস্তাবিত সময়:</strong></p><ul><li>🍂 <strong>শীতকালীন চাষ:</strong> অক্টোবর–নভেম্বর</li><li>☀️ <strong>গ্রীষ্মকালীন চাষ:</strong> ফেব্রুয়ারি–মে</li><li>🌧️ বর্ষাকালে চাষ করলে অবশ্যই উঁচু বেড ও কার্যকর নিষ্কাশন ব্যবস্থা রাখতে হবে, কারণ অতিরিক্ত পানি জমে থাকলে কুমড়ার গাছ ক্ষতিগ্রস্ত হতে পারে।</li></ul><h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3><p><strong>১. উপযুক্ত মাটি নির্বাচন</strong><br>মিষ্টি কুমড়ার জন্য উর্বর, জৈব পদার্থসমৃদ্ধ <strong>দোআঁশ বা বেলে-দোআঁশ মাটি</strong> ভালো। জমিতে পানি জমে থাকে এমন ভারী ও দুর্বল নিষ্কাশনের মাটি এড়িয়ে চলুন।</p><p><strong>২. জমি ভালোভাবে ঝুরঝুরে করুন</strong><br>বীজ বপনের আগে জমি <strong>২–৩ বার চাষ দিয়ে</strong> মাটি ভালোভাবে ঝুরঝুরে ও আগাছামুক্ত করে নিতে পারেন। শক্ত মাটি হলে গভীরভাবে আলগা করে শিকড় বিস্তারের উপযোগী করুন।</p><p><strong>৩. জৈব সার মেশান</strong><br>পচা গোবর বা ভালোভাবে কম্পোস্ট করা জৈব সার মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন। মাটির উর্বরতা অনুযায়ী সার প্রয়োগ করা সবচেয়ে ভালো; সম্ভব হলে মাটি পরীক্ষা করে সার ব্যবস্থাপনা নির্ধারণ করুন।</p><p><strong>৪. উঁচু বেড বা মাদা তৈরি করুন</strong><br>পানি নিষ্কাশনের সুবিধার জন্য সামান্য উঁচু বেড/মাদা তৈরি করুন। BAMIS-এর নির্দেশনায় মিষ্টি কুমড়ার জন্য উঁচু বেড ও সেচ-নিষ্কাশনের ব্যবস্থা রাখার কথা বলা হয়েছে।</p><p><strong>৫. গর্ত/মাদা প্রস্তুত</strong><br>প্রতিটি মাদায় উর্বর মাটি ও পচা জৈব সার ভালোভাবে মিশিয়ে কয়েকদিন রেখে দিতে পারেন। এরপর মাটির আর্দ্রতা ঠিক রেখে বীজ বপন করুন।</p><p><strong>৬. টব বা ছাদবাগানের জন্য মাটির মিশ্রণ</strong><br>টবে চাষের ক্ষেত্রে ব্যবহার করতে পারেন:</p><ul><li>৫০% দোআঁশ মাটি</li><li>৩০% কোকোপিট</li><li>২০% ভালোভাবে পচা কম্পোস্ট/জৈব সার</li></ul><p>টবের নিচে অবশ্যই পর্যাপ্ত drainage hole রাখতে হবে, যাতে অতিরিক্ত পানি বের হয়ে যেতে পারে।</p><h3>💧 পানি ও পরিচর্যা</h3><p>মাটি যেন একেবারে শুকিয়ে না যায়, আবার অতিরিক্ত পানিও জমে না থাকে। বিশেষ করে ফলনশীল গাছের ক্ষেত্রে নিয়মিত আর্দ্রতা বজায় রাখা গুরুত্বপূর্ণ। শুষ্ক সময়ে প্রয়োজন অনুযায়ী সেচ দিন এবং ভারী বৃষ্টির পর দ্রুত পানি নিষ্কাশনের ব্যবস্থা করুন।</p><h3>🌿 বাড়তি গুরুত্বপূর্ণ টিপস</h3><ul><li>পর্যাপ্ত রোদযুক্ত জায়গা নির্বাচন করুন।</li><li>লতাগুলো ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন।</li><li>মাটিতে আগাছা জমতে দেবেন না।</li><li>ফল মাটির সঙ্গে সরাসরি লেগে থাকলে নিচে শুকনো খড়/মালচ ব্যবহার করা যেতে পারে।</li><li>একই জমিতে বারবার কুমড়া জাতীয় ফসল না করে ফসল পর্যায়ক্রম (crop rotation) অনুসরণ করলে রোগের চাপ কমাতে সহায়তা করতে পারে।</li></ul>', 'VEG-1610', 3, 3, 1, 0, 95, '[]', '2026-10-01T10:43:31.447+00:00', '2026-10-17T05:26:05.17393+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0dd00ff1-1e01-4866-8466-b7133ae4c429', 'চায়না লেজি কিং হাইব্রিড তরমুজ বীজ', 'china-lazy-king-hybrid-watermelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785379449361-6gtqhq5.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785379460833-dzzbm6m.webp\"]', 150, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"পপুলার\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৩৫-৪০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড়, মিষ্টি, রসালো ও উচ্চ ফলনশীল প্রিমিয়াম তরমুজ উৎপাদন করুন।', 'চায়না লেজি কিং হাইব্রিড তরমুজ একটি উন্নত মানের ও উচ্চ ফলনশীল তরমুজের জাত, যা বড় আকৃতির, আকর্ষণীয় এবং অত্যন্ত মিষ্টি ফল উৎপাদন করে। এর শাঁস উজ্জ্বল লাল, রসালো ও খাস্তা হওয়ায় খেতে অত্যন্ত সুস্বাদু। গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং অনুকূল পরিচর্যায় দীর্ঘ সময় ধরে প্রচুর ফলন দেয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫-৪০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1585', 5, 5, 1, 0, 99, '[]', '2026-09-24T01:48:39.172+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8e60f5bc-b9ce-4b8a-a600-909388f8a457', 'চায়না ইম্পোর্টেড প্রিমিয়াম ভারবেনা ফুলের বীজ', 'china-imported-premium-verbena-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732430131-vcozvqo.webp', NULL, 190, 65, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, গুচ্ছাকারে উজ্জ্বল রঙের ফুল ফোটে, টব, ছাদবাগান ও বর্ডারের জন্য আদর্শ।', '<h3>🌸 পণ্যের সংক্ষিপ্ত বিবরণ</h3> 
<p><strong>চায়না ইম্পোর্টেড প্রিমিয়াম ভারবেনা ফুলের বীজ</strong> দিয়ে আপনার বাগানকে সাজিয়ে তুলুন থোকায় থোকায় ফুটে থাকা দৃষ্টিনন্দন রঙিন ফুলে। এই প্রিমিয়াম আমদানিকৃত জাতটি দীর্ঘসময় ধরে ফুল ফোটানোর জন্য উপযোগী এবং বাগানে রঙিন ও প্রাণবন্ত পরিবেশ তৈরি করতে সহায়তা করে।</p> 

<p>ভারবেনা ফুল মৌমাছি ও প্রজাপতির মতো পরাগবাহীদের আকর্ষণ করতে পারে, ফলে এটি শুধু বাগানের সৌন্দর্যই বাড়ায় না, বরং একটি প্রাণবন্ত ফুলের পরিবেশ তৈরিতেও সহায়ক। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষের জন্য এটি উপযোগী।</p> 

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3> 
<ul> 
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৪০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li> 
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li> 
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li> 
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li> 
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li> 
<li>🌸 <strong>ফুলের ধরন:</strong> থোকায় থোকায় রঙিন ও আকর্ষণীয় ফুল</li> 
<li>🌿 <strong>বিশেষ বৈশিষ্ট্য:</strong> দীর্ঘসময় ফুল ফোটানোর জন্য উপযোগী</li> 
<li>🦋 <strong>পরাগবাহী আকর্ষণ:</strong> মৌমাছি ও প্রজাপতি আকর্ষণে সহায়ক</li> 
<li>🏡 <strong>চাষের উপযোগিতা:</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার ও খোলা বাগান</li> 
</ul> 

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3> 
<p>বাংলাদেশের আবহাওয়ায় ভারবেনা সাধারণত <strong>শীতল ও মৃদু উষ্ণ আবহাওয়ায়</strong> ভালোভাবে বেড়ে ওঠে। সাধারণভাবে <strong>অক্টোবর থেকে মার্চ</strong> পর্যন্ত সময় চাষের জন্য উপযোগী। শীতের মৌসুমে পর্যাপ্ত আলো পেলে গাছের বৃদ্ধি ও ফুলের সৌন্দর্য ভালোভাবে প্রকাশ পেতে পারে। অতিরিক্ত গরম ও জলাবদ্ধতা এড়িয়ে চলা ভালো।</p> 

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3> 
<p>ভারবেনার জন্য <strong>ঝুরঝুরে, উর্বর ও ভালো পানি নিষ্কাশনযোগ্য দোআঁশ মাটি</strong> উপযোগী। মাটিতে পানি জমে থাকলে শিকড়ের স্বাভাবিক বৃদ্ধি ব্যাহত হতে পারে। তাই চাষের আগে মাটির ড্রেনেজ নিশ্চিত করা গুরুত্বপূর্ণ।</p> 

<ul> 
<li>🌱 মাটি ভালোভাবে ঝুরঝুরে করে নিন।</li> 
<li>🍂 পচা গোবর, কম্পোস্ট বা ভার্মিকম্পোস্ট মাটির সঙ্গে মিশিয়ে দিন।</li> 
<li>🏖️ ভারী মাটিতে মোটা বালি বা পার্লাইট মিশিয়ে পানি নিষ্কাশন উন্নত করুন।</li> 
<li>🌿 আগাছা, পাথর ও পুরোনো শিকড় পরিষ্কার করে নিন।</li> 
<li>💧 পানি জমার প্রবণতা থাকলে উঁচু বেড তৈরি করুন।</li> 
</ul> 

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3> 
<p>ভারবেনার ছোট বীজ ঝুরঝুরে ও হালকা আর্দ্র বীজতলা বা সিড ট্রেতে বপন করুন। বীজ খুব গভীরে পুঁতে না দিয়ে মাটির উপর ছড়িয়ে <strong>খুব পাতলা মাটি বা কোকোপিটের স্তর</strong> দিয়ে ঢেকে দিন। এরপর হালকা পানি স্প্রে করুন।</p> 

<p>অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন এবং অতিরিক্ত পানি দেওয়া থেকে বিরত থাকুন। চারা কয়েকটি সুস্থ পাতা তৈরি করলে সাবধানে মূল টব বা বাগানের নির্দিষ্ট স্থানে রোপণ করুন।</p> 

<h3>🏡 টব বা ছাদবাগানে মাটি তৈরির সহজ মিশ্রণ</h3> 
<p>টব বা গ্রো ব্যাগে ভারবেনা চাষের জন্য নিচের অনুপাতে মাটি তৈরি করতে পারেন:</p> 

<ul> 
<li>🌱 ৪০% দোআঁশ মাটি</li> 
<li>🥥 ৩০% কোকোপিট</li> 
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li> 
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li> 
</ul> 

<p>টবের নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন, যাতে অতিরিক্ত পানি দ্রুত বের হয়ে যেতে পারে।</p> 

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3> 
<p>ভারবেনা গাছের জন্য <strong>পর্যাপ্ত সূর্যালোক</strong> গুরুত্বপূর্ণ। প্রতিদিন কয়েক ঘণ্টা সরাসরি সূর্যের আলো পেলে গাছের সুস্থ বৃদ্ধি ও ফুল উৎপাদনে সহায়তা করতে পারে। খুব বেশি ছায়াযুক্ত স্থানে রাখলে ফুল কমে যেতে পারে।</p> 

<p>মাটির উপরিভাগ শুকিয়ে এলে প্রয়োজন অনুযায়ী পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন। টবে চাষ করলে পানি দেওয়ার পর অতিরিক্ত পানি যেন নিচের ড্রেনেজ ছিদ্র দিয়ে বের হয়ে যেতে পারে তা নিশ্চিত করুন।</p> 

<h3>🌿 পরিচর্যার গুরুত্বপূর্ণ টিপস</h3> 
<ul> 
<li>☀️ প্রতিদিন পর্যাপ্ত সূর্যালোক পাওয়ার ব্যবস্থা করুন।</li> 
<li>💧 অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li> 
<li>🌱 নিয়মিত আগাছা পরিষ্কার করুন।</li> 
<li>🍂 প্রয়োজন অনুযায়ী জৈব সার বা কম্পোস্ট প্রয়োগ করুন।</li> 
<li>✂️ শুকিয়ে যাওয়া ফুল নিয়মিত তুলে দিলে নতুন ফুল আসতে উৎসাহিত হতে পারে।</li> 
<li>🌿 গাছ বেশি লম্বা হলে হালকা ছাঁটাই করলে ঝোপালো বৃদ্ধি পেতে সহায়তা করতে পারে।</li> 
<li>🐛 পাতা, কুঁড়ি ও ফুলে পোকামাকড়ের আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li> 
<li>🌬️ গাছের মাঝে পর্যাপ্ত জায়গা রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li> 
</ul> 

<h3>📍 কোথায় চাষ করা যায়?</h3> 
<p><strong>চায়না ইম্পোর্টেড প্রিমিয়াম ভারবেনা</strong> টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে চাষ করা যায়। ছোট জায়গায় টব বা গ্রো ব্যাগ ব্যবহার করেও সুন্দর ফুলের বাগান তৈরি করা সম্ভব।</p> 

<h3>🦋 কেন ভারবেনা ফুল চাষ করবেন?</h3> 
<ul> 
<li>🌸 থোকায় থোকায় আকর্ষণীয় রঙিন ফুল পাওয়ার সুযোগ</li> 
<li>🌿 দীর্ঘসময় ফুল ফোটানোর জন্য উপযোগী</li> 
<li>🦋 মৌমাছি ও প্রজাপতি আকর্ষণে সহায়ক</li> 
<li>🏡 ছাদবাগান, বারান্দা ও হোম গার্ডেনের জন্য উপযোগী</li> 
<li>🪴 টব ও গ্রো ব্যাগে চাষ করা যায়</li> 
<li>🌺 বাগানের সৌন্দর্য ও রঙিন পরিবেশ বাড়াতে সহায়ক</li> 
</ul> 

<h3>🛒 আজই অর্ডার করুন</h3> 
<p><strong>চায়না ইম্পোর্টেড প্রিমিয়াম ভারবেনা ফুলের বীজ</strong> দিয়ে আপনার বাড়ি, বারান্দা বা ছাদবাগান সাজিয়ে তুলুন থোকায় থোকায় ফুটে থাকা রঙিন ফুলে। সঠিক পরিচর্যায় গড়ে তুলুন প্রাণবন্ত ও আকর্ষণীয় ফুলের বাগান। <strong>আজই অর্ডার করুন!</strong></p>', 'FUL-1503', 7, 7, 1, 0, 100, '[]', '2026-09-24T01:42:31.549+00:00', '2026-10-19T06:06:15.312111+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0331322b-fdef-4fe1-8596-74b3c0838268', 'দেয়ালের লতা-গ্রিন ওয়াল ক্রিপার বীজ', 'green-wall-creeper-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732442182-yh1cgxf.webp', NULL, 190, 65, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\"]', 'আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, দ্রুত বৃদ্ধি পাওয়া সবুজ লতা, দেয়াল, বেড়া ও গ্রিন ওয়াল তৈরির জন্য আদর্শ', '<h2>দেয়ালের লতা – গ্রিন ওয়াল ক্রিপার ফুল ও পাতাবাহার বীজ</h2>

<p>দেয়ালের লতা বা গ্রিন ওয়াল ক্রিপার বীজ দিয়ে সহজেই তৈরি করুন প্রাকৃতিক সবুজ দেয়াল ও মনোরম পরিবেশ। দ্রুত বেড়ে ওঠা এই লতানো গাছটি দেয়াল, বেড়া, ট্রেলিস, বারান্দা, ছাদবাগান এবং বাগানের প্রবেশপথ সবুজে সাজাতে উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে গাছটি ঘন সবুজ পাতায় দেয়াল বা বাগানের সৌন্দর্য বাড়াতে সাহায্য করে। বাড়ি, অফিস কিংবা বাগানের খালি জায়গাকে প্রাকৃতিক সবুজে সাজানোর জন্য এটি হতে পারে একটি আকর্ষণীয় পছন্দ। 

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ৩০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>গ্রিন ওয়াল ক্রিপার গাছের বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🌿 দেয়াল ও বেড়া সবুজে সাজাতে উপযোগী লতানো গাছ।</li>
  <li>🏡 বাড়ি, বারান্দা, ছাদবাগান ও বাগানের সৌন্দর্য বাড়াতে সহায়ক।</li>
  <li>🪴 উপযুক্ত সাপোর্ট বা ট্রেলিসে লতাকে সুন্দরভাবে ছড়িয়ে দেওয়া যায়।</li>
  <li>🌱 সঠিক মাটি, পানি ও আলো পেলে স্বাস্থ্যবান গাছ গড়ে উঠতে পারে।</li>
  <li>🌳 প্রাকৃতিক সবুজ পরিবেশ ও আকর্ষণীয় বাগান তৈরিতে ব্যবহার করা যায়।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশের আবহাওয়ায় তাপমাত্রা ও আর্দ্রতা অনুকূলে থাকলে গ্রিন ওয়াল ক্রিপারের বীজ বপন করা যায়। অতিরিক্ত গরম, ভারী বৃষ্টি এবং জলাবদ্ধতার সময় বীজ ও চারার বিশেষ যত্ন নিন। নির্দিষ্ট জাতের নির্দেশনা জানা থাকলে সেটিকে অগ্রাধিকার দিন।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>বীজ বপনের জন্য ঝুরঝুরে, উর্বর এবং পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন মাটি ব্যবহার করুন। বাগানের মাটির সঙ্গে পচা জৈব সার ও প্রয়োজনমতো কোকোপিট মিশিয়ে হালকা বীজতলা তৈরি করা যায়। মাটিতে যেন পানি জমে না থাকে, তা নিশ্চিত করুন।</p>

<h3>বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে ছোট টব, সিডলিং ট্রে অথবা উপযুক্ত বীজতলায় ঝুরঝুরে মাটি ভরে নিন।</li>
  <li>বীজের জাত অনুযায়ী উপযুক্ত গভীরতায় বীজ বপন করুন এবং হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বোতল দিয়ে আলতোভাবে পানি দিন, যাতে বীজ সরে না যায়।</li>
  <li>মাটি হালকা আর্দ্র রাখুন; অতিরিক্ত পানি দিয়ে জলাবদ্ধতা তৈরি করবেন না।</li>
  <li>চারা শক্ত হলে সাবধানে নির্দিষ্ট জায়গায় বা বড় টবে স্থানান্তর করুন।</li>
</ol>

<h3>টব, বারান্দা ও ছাদবাগানে চাষ</h3>
<p>গ্রিন ওয়াল ক্রিপার টবে, বারান্দায় কিংবা ছাদবাগানে চাষ করা যেতে পারে। লতা ছড়িয়ে ওঠার জন্য দেয়ালের পাশে জালি, ট্রেলিস বা উপযুক্ত সাপোর্ট রাখুন। গাছের বৃদ্ধির ধরন অনুযায়ী পর্যাপ্ত জায়গা দিন এবং প্রয়োজনমতো লতাকে সাপোর্টের দিকে পরিচালিত করুন। দেয়ালে সরাসরি লাগানোর আগে নিশ্চিত হোন যে গাছটি দেয়ালের পৃষ্ঠে উপযুক্তভাবে বেড়ে উঠতে পারবে।</p>

<h3>সূর্যালোক ও পানি</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> জাতের চাহিদা অনুযায়ী পর্যাপ্ত আলোযুক্ত স্থান নির্বাচন করুন। নতুন চারাকে তীব্র রোদে ধীরে ধীরে অভ্যস্ত করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির উপরিভাগ শুকাতে শুরু করলে প্রয়োজনমতো পানি দিন। অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li>
  <li>🌬️ <strong>বাতাস চলাচল:</strong> গাছের চারপাশে পর্যাপ্ত বাতাস চলাচলের ব্যবস্থা রাখুন, যাতে পাতায় অতিরিক্ত আর্দ্রতা জমে না থাকে।</li>
</ul>

<h3>সার প্রয়োগ ও পরিচর্যা</h3>
<p>গাছের বৃদ্ধি ভালো রাখতে পরিমিত পরিমাণে পচা জৈব সার বা কম্পোস্ট ব্যবহার করুন। গাছের অবস্থা ও বৃদ্ধির পর্যায় অনুযায়ী প্রয়োজন হলে উপযুক্ত সার প্রয়োগ করুন। শুকনো, হলুদ বা রোগাক্রান্ত পাতা সরিয়ে ফেলুন এবং লতার অতিরিক্ত বৃদ্ধি নিয়ন্ত্রণে প্রয়োজনমতো ছাঁটাই করুন।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>নিয়মিত পাতার দুই পাশ ও কচি ডগা পরীক্ষা করুন। পোকামাকড় বা রোগের লক্ষণ দেখা গেলে আক্রান্ত অংশ সরিয়ে ফেলুন এবং গাছের চারপাশ পরিষ্কার রাখুন। প্রয়োজন হলে গাছের উপযোগী অনুমোদিত বালাইনাশক লেবেলের নির্দেশনা মেনে ব্যবহার করুন।</p>

<h3>কোথায় ব্যবহার করবেন?</h3>
<ul>
  <li>🏡 বাড়ির দেয়াল ও সীমানাপ্রাচীর সাজাতে</li>
  <li>🌿 বাগানের বেড়া ও ট্রেলিস সবুজে ঢাকতে</li>
  <li>🪴 বারান্দা ও ছাদবাগানে প্রাকৃতিক সবুজ পরিবেশ তৈরি করতে</li>
  <li>🌳 বাগানের প্রবেশপথ ও নির্দিষ্ট ল্যান্ডস্কেপিং অংশ সাজাতে</li>
  <li>🏢 উপযুক্ত সাপোর্টের সাহায্যে অফিস বা অন্যান্য স্থানের বাইরের অংশ সবুজায়নে</li>
</ul>

<h3>কেন গ্রিন ওয়াল ক্রিপার বীজ বেছে নেবেন?</h3>
<p>আপনার বাড়ি বা বাগানে প্রাকৃতিক সবুজের আবহ তৈরি করতে গ্রিন ওয়াল ক্রিপার একটি আকর্ষণীয় বিকল্প। সঠিক স্থান নির্বাচন, উপযুক্ত সাপোর্ট এবং নিয়মিত পরিচর্যার মাধ্যমে দেয়াল বা বেড়াকে সবুজে সাজিয়ে তুলতে পারেন। বীজের অঙ্কুরোদগম ও গাছের বৃদ্ধির ফলাফল আবহাওয়া, মাটির গুণমান এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>দেয়াল, বারান্দা কিংবা ছাদবাগানকে সবুজে সাজানোর পরিকল্পনা করছেন? আপনার বাগানের জন্য গ্রিন ওয়াল ক্রিপার বীজ সংগ্রহ করুন <strong>Ss Seed Shop</strong> থেকে। বীজ বপন করুন, যত্ন নিন এবং ধীরে ধীরে গড়ে তুলুন আপনার পছন্দের সবুজ পরিবেশ।</p>
```', 'FUL-1513', 4, 4, 1, 0, 102, '[]', '2026-09-24T01:42:33.872+00:00', '2026-10-14T06:04:45.481295+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('db1e1587-b83f-4e43-a84c-ff9e99f633cc', 'হাইব্রিড কলসি লাউ বা বোতল লাউয়ের বীজ', 'hybrid-bottle-gourd-kolshi-lau-seeds', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791784207156-00jbx8v.webp', NULL, 150, 70, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[]', 'আনুমানিক ১০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড কলসি লাউ চাষের জন্য উন্নতমানের বীজ।', '<h3>🌱 Product Short Description</h3><p><strong>হাইব্রিড কলসি লাউ বা বোতল লাউয়ের বীজ</strong> উন্নতমানের কলসি আকৃতির লাউ চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা, পর্যাপ্ত সূর্যালোক, উর্বর মাটি ও নিয়মিত পানি ব্যবস্থাপনায় সুস্থ ও শক্তিশালী গাছ গড়ে উঠতে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।</p><h3>📋 পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3><ul><li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০ টি বীজ (উচ্চ গুণমানসম্পন্ন)</li><li>🥒 <strong>ফসলের ধরন:</strong> হাইব্রিড কলসি লাউ / বোতল লাউ</li><li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li><li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li><li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥ ৮০%</li><li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li><li>🏡 <strong>চাষের উপযোগিতা:</strong> বাড়ির বাগান, ছাদবাগান, টব ও বাণিজ্যিক চাষ</li></ul><h3>🌤️ কোন কোন মৌশুমে ভালো হয়?</h3><p>কলসি লাউ বা বোতল লাউ <strong>উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়ায়</strong> ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়ায় সাধারণত শীতের শেষ থেকে বর্ষার শুরুর সময় পর্যন্ত চাষ করা যায়।</p><p><strong>🌱 উপযুক্ত সময়:</strong></p><ul><li>🌸 <strong>শীতের শেষ:</strong> জানুয়ারি–ফেব্রুয়ারি</li><li>☀️ <strong>গ্রীষ্ম:</strong> ফেব্রুয়ারি–এপ্রিল — চাষের জন্য উপযোগী সময়</li><li>🌧️ <strong>বর্ষার শুরু:</strong> মে–জুন — ভালো ড্রেনেজ থাকলে চাষ করা যায়</li></ul><p>অতিরিক্ত ঠান্ডা ও কুয়াশায় গাছের বৃদ্ধি ধীর হতে পারে। বর্ষাকালে অবশ্যই জমিতে পানি জমে থাকা রোধ করতে হবে।</p><h3>🧑‍🌾 কলসি লাউ চাষের জন্য মাটি তৈরির বিস্তারিত নিয়ম</h3>১️⃣ উপযুক্ত মাটি নির্বাচন<p>লাউয়ের জন্য <strong>উর্বর দোআঁশ বা বেলে-দোআঁশ মাটি</strong> সবচেয়ে উপযোগী। মাটি ঝুরঝুরে, জৈব পদার্থসমৃদ্ধ এবং পানি নিষ্কাশনযোগ্য হওয়া ভালো।</p><p>খুব শক্ত, কাদাযুক্ত বা দীর্ঘসময় পানি ধরে রাখে এমন মাটি এড়িয়ে চলুন।</p>২️⃣ জমির মাটি প্রস্তুত<p>প্রথমে জমির আগাছা, পুরোনো শিকড় ও মাটির দলা পরিষ্কার করুন। এরপর মাটি <strong>২–৩ বার চাষ ও মই দিয়ে</strong> ভালোভাবে ঝুরঝুরে করে নিন।</p><p>লাউয়ের শিকড় ভালোভাবে ছড়িয়ে পড়ার জন্য মাটি পর্যাপ্ত গভীর পর্যন্ত আলগা করা ভালো।</p>৩️⃣ জৈব সার প্রয়োগ<p>প্রতি শতকে আনুমানিক <strong>৪০–৫০ কেজি ভালোভাবে পচা গোবর বা কম্পোস্ট</strong> মাটির সঙ্গে ভালোভাবে মিশিয়ে দিতে পারেন।</p><p>জৈব সার মাটির গঠন উন্নত করতে এবং গাছের প্রাথমিক বৃদ্ধিতে সহায়তা করে।</p>৪️⃣ মাদা তৈরি<p>লাউ চাষে সাধারণত <strong>মাদা তৈরি করে</strong> বীজ বপন করা সুবিধাজনক। মাদা উঁচু করে তৈরি করলে বৃষ্টির অতিরিক্ত পানি সহজে বের হয়ে যায়।</p><p>প্রতিটি মাদায় উর্বর ঝুরঝুরে মাটি ও পচা জৈব সার ভালোভাবে মিশিয়ে নিন।</p>৫️⃣ টব বা ছাদবাগানের মাটি<p>টব বা বড় গ্রো ব্যাগে কলসি লাউ চাষের জন্য ব্যবহার করতে পারেন:</p><ul><li>🟤 <strong>৪০% দোআঁশ মাটি</strong></li><li>🌴 <strong>৩০% কোকোপিট</strong></li><li>🌿 <strong>২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</strong></li><li>🪨 <strong>১০% মোটা বালি বা পার্লাইট</strong></li></ul><p>সব উপাদান ভালোভাবে মিশিয়ে ঝুরঝুরে করে নিন। টব বা গ্রো ব্যাগের নিচে পর্যাপ্ত <strong>ড্রেনেজ হোল</strong> অবশ্যই রাখতে হবে।</p>৬️⃣ বীজ বপনের প্রস্তুতি<p>বীজ বপনের আগে মাটি হালকা আর্দ্র করে নিন। বীজ খুব গভীরে না দিয়ে আনুমানিক <strong>২–৩ সেন্টিমিটার গভীরে</strong> বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</p><p>প্রয়োজনে বীজ বপনের আগে <strong>২–৪ ঘণ্টা পানিতে ভিজিয়ে</strong> নেওয়া যেতে পারে, তবে প্যাকেটের নির্দেশনা থাকলে সেটিই অগ্রাধিকার দিন।</p>৭️⃣ পানি ও সূর্যালোক<p>বীজ অঙ্কুরোদগমের সময় মাটি হালকা আর্দ্র রাখুন। অতিরিক্ত পানি দিয়ে মাটি কাদাময় করবেন না।</p><p>গাছের ভালো বৃদ্ধি ও ফলনের জন্য পর্যাপ্ত <strong>সরাসরি সূর্যালোক</strong> প্রয়োজন। প্রতিদিন ভালো আলো পায় এমন জায়গায় চাষ করা ভালো।</p>৮️⃣ মাচা বা লতা ওঠানোর ব্যবস্থা<p>লাউ লতানো ফসল হওয়ায় গাছ বড় হওয়ার সঙ্গে সঙ্গে <strong>মজবুত মাচা বা জালি</strong> তৈরি করে দিতে হবে। এতে লতা সুন্দরভাবে বেড়ে উঠতে পারে এবং ফল মাটির সংস্পর্শে কম থাকে।</p><p>💡 <strong>চাষের টিপস:</strong> ভালো ফলনের জন্য উর্বর মাটি, পর্যাপ্ত রোদ, নিয়মিত পানি, ভালো ড্রেনেজ এবং শক্ত মাচার ব্যবস্থা নিশ্চিত করুন। জলাবদ্ধতা এড়িয়ে চলুন।</p>', 'VEG-1616', 6, 6, 1, 0, 103, '[]', '2026-10-01T11:47:04.776+00:00', '2026-10-15T07:34:06.106087+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2e035d7a-d5d0-4bf3-adcc-64800a3b92d0', 'ইস্পাহানি- চৈতি বারোমাসি F1 হাইব্রিড বেগুন', 'ispahani-chaity-baromasif1-hybrid-eggplant-seeds-5-gram', NULL, NULL, 40, 0, 24, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\",\"সেরা পণ্য\",\"পপুলার\"]', '৫ গ্রাম (উচ্চ গুণমানসম্পন্ন) ইস্পাহানি বারোমাসি F1 হাইব্রিড বেগুন চৈতি | সারা বছর চাষযোগ্য, দ্রুত ফলনশীল, ১২ ইঞ্চি ফল ও ৪০-৪২ টন ফলন।', '<h3>📝 Product Short Description<span aria-hidden=\"true\"></span></h3>
<p><strong>ইস্পাহানি বারোমাসি F1 হাইব্রিড বেগুন চৈতি</strong> একটি আগাম ও সারা বছর চাষযোগ্য হাইব্রিড জাত। ফল আকর্ষণীয় বেগুনি রঙের, দ্রুত বর্ধনশীল এবং গড় ওজন <strong>১৪০–১৫০ গ্রাম</strong>। ফলের দৈর্ঘ্য প্রায় <strong>১২ ইঞ্চি</strong>। জাতটি ঢলে পড়া রোগ, বৃষ্টির পানি ও তাপমাত্রার প্রতিকূলতা সহনশীল। বীজ বপনের মাত্র <strong>৫০–৫৫ দিনের মধ্যে</strong> ফসল সংগ্রহ করা যায় এবং প্রতি একরে <strong>৪০–৪২ টন</strong> পর্যন্ত ফলন দিতে পারে। দূরপাল্লার পরিবহনের জন্যও সুবিধাজনক।</p>
<p><strong>📦 বীজের পরিমাণ:</strong> ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)<br>
<strong>🌱 জাত:</strong> F1 হাইব্রিড, আগাম জাত<br>
<strong>📅 চাষের সময়:</strong> সারা বছর<br>
<strong>🍆 ফলের রঙ:</strong> আকর্ষণীয় বেগুনি<br>
<strong>📏 ফলের দৈর্ঘ্য:</strong> প্রায় ১২ ইঞ্চি<br>
<strong>⚖️ গড় ওজন:</strong> ১৪০–১৫০ গ্রাম<br>
<strong>🛡️ সহনশীলতা:</strong> ঢলে পড়া রোগ, বৃষ্টির পানি ও তাপমাত্রার প্রতিকূলতা সহনশীল<br>
<strong>⏱️ ফসল সংগ্রহ:</strong> বীজ বপনের ৫০–৫৫ দিনের মধ্যে<br>
<strong>📊 সম্ভাব্য ফলন:</strong> প্রতি একরে ৪০–৪২ টন<br>
<strong>🚚 পরিবহন:</strong> দূরপাল্লার পরিবহনের জন্য সুবিধাজনক</p>', 'VEG-1599', 3, 3, 1, 0, 107, '[]', '2026-09-26T12:56:49.26+00:00', '2026-10-13T15:39:03.302513+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2edcdd88-8aa2-4d8f-af34-b349198ea71f', 'সন্ধ্যাতারা ইভনিং প্রিমরোজ ফুলের বীজ', 'evening-primrose-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732446606-3eh3snb.webp', NULL, 190, 65, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, সন্ধ্যায় ফোটা মনোমুগ্ধকর ফুল, দীর্ঘসময় সৌন্দর্য, টব ও বাগানের জন্য আদর্শ।', 'সন্ধ্যাতারা ইভনিং প্রিমরোজ ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন সন্ধ্যার পর প্রস্ফুটিত হওয়া মনোমুগ্ধকর ফুল। এই শোভাময় গাছটি সন্ধ্যায় ফুল ফুটিয়ে চারপাশে অনন্য সৌন্দর্য ছড়িয়ে দেয় এবং দীর্ঘসময় ধরে ফুল ধরে রাখে। টব, ছাদবাগান, ফুলের বেড, বর্ডার ও খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুল উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫,০০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1533', 7, 7, 1, 0, 108, '[]', '2026-09-24T01:42:37.108+00:00', '2026-10-17T05:26:04.545583+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('22eb75c6-6b4b-4b35-bc3e-a4a7ec8603b2', 'হাইব্রিড রকমেলন - হাওরুনচিং ২ (সিলভার ফ্র্যাগ্রেন্স জেড)', 'haorunching-2-silver-fragrance-jade-hybrid-rockmelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789378435895-7i4qau0.webp', NULL, 170, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৪০–৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাওরুনচিং ২ হাইব্রিড রকমেলন, সুগন্ধি মিষ্টি ফল ও ভালো ফলনের জন্য উপযোগী। আজই অর্ডার করুন!', '🌱 Product Short Description

হাইব্রিড রকমেলন – হাওরুনচিং ২ (সিলভার ফ্র্যাগ্রেন্স জেড) একটি আকর্ষণীয় ও সুগন্ধযুক্ত রকমেলন জাত, যা মিষ্টি ও সুস্বাদু ফল উৎপাদনের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং ভালো ফলন পেতে সহায়ক।

বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী। 🍈 সুস্বাদু রকমেলন চাষ শুরু করতে আজই অর্ডার করুন!

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৪০–৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌏 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1503', 5, 5, 1, 0, 112, '[]', '2026-09-24T01:46:41.929+00:00', '2026-10-19T05:50:44.819689+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('42be033a-b359-499a-80f6-33db3ed5e508', 'আমদানিকৃত উন্নত জাতের গোলাপি পদ্ম ফুল', 'imported-premium-pink-lotus-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732439473-oi3g6dg.webp', NULL, 150, 59, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মনোমুগ্ধকর গোলাপি পদ্মফুল, টব ও জলাধারে চাষের জন্য আদর্শ।', 'আমদানিকৃত উন্নত জাতের গোলাপি পদ্ম ফুলের বীজ দিয়ে সহজেই আপনার টব, বাটি, কৃত্রিম জলাধার বা পুকুরে ফুটিয়ে তুলুন দৃষ্টিনন্দন গোলাপি পদ্মফুল। উন্নত জাতের এই পদ্ম বড় আকৃতির আকর্ষণীয় ফুল এবং স্বাস্থ্যবান পাতার জন্য জনপ্রিয়। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দ্রুত বৃদ্ধি পেয়ে দীর্ঘসময় ধরে মনোমুগ্ধকর ফুল উপহার দেয়। ছাদবাগান, বাড়ির উঠান বা জলভিত্তিক বাগান সাজানোর জন্য এটি একটি চমৎকার নির্বাচন।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1550', 7, 7, 1, 0, 113, '[]', '2026-09-24T01:42:47.544+00:00', '2026-10-12T11:24:48.623381+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e1f78b35-01a0-4ec1-aacb-edd11cdd8a80', 'ইমপোর্টেড মাল্টি-কালার সূর্যমুখী ফুলের বীজ', 'imported-multi-color-sunflower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732458848-mpd4a2o.webp', NULL, 130, 120, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বহু রঙের দৃষ্টিনন্দন সূর্যমুখী, টব ও বাগানের জন্য আদর্শ।', 'ইমপোর্টেড মাল্টি-কালার সূর্যমুখী ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন হলুদ, লাল, কমলা ও অন্যান্য উজ্জ্বল রঙের দৃষ্টিনন্দন সূর্যমুখী ফুল। এই বিশেষ জাতটি দ্রুত বৃদ্ধি পায়, সহজে চাষযোগ্য এবং দীর্ঘসময় ধরে বাগানকে রঙিন ও প্রাণবন্ত রাখে। টব, ছাদবাগান, বারান্দা, ফুলের বেড এবং খোলা বাগানের জন্য এটি একটি আদর্শ নির্বাচন। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় প্রতিটি গাছ অসাধারণ সৌন্দর্য উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1555', 3, 3, 1, 0, 115, '[]', '2026-09-24T01:42:48.357+00:00', '2026-10-19T08:00:15.091827+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('45bf91f8-d5b0-4e59-94ff-6b94771ca35d', 'প্রিমিয়াম চাইনিজ ফ্রুট শসা বীজ - জিংকেলিফেং', 'jinkelifeng-premium-chinese-fruit-cucumber-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1788705247218-5d6iqkc.webp', NULL, 150, 110, 30, 'টমেটো - শসা', '[\"টমেটো - শসা\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"বিকল্প- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জিংকেলিফেং প্রিমিয়াম চাইনিজ ফ্রুট শসা, আকর্ষণীয় ফল, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'প্রিমিয়াম চাইনিজ ফ্রুট শসা বীজ – জিংকেলিফেং আকর্ষণীয় ও সুস্বাদু ফ্রুট শসা চাষের জন্য উপযোগী একটি উন্নতমানের জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং সুন্দর আকৃতির ফল উৎপাদনে সহায়ক। টব, ছাদবাগান, বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1550', 4, 4, 1, 0, 118, '[]', '2026-09-24T01:46:40.477+00:00', '2026-10-12T11:24:58.714127+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('7dc4683c-e64d-4b40-a367-60fa576ed80c', 'আমদানিকৃত জায়ান্ট মিষ্টি কুমড়ার বীজ (বিশাল সাইজ)', 'giant-sweet-pumpkin-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1786260990985-2co55i8.webp', NULL, 150, 60, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | আমদানিকৃত জায়ান্ট মিষ্টি কুমড়া, বিশাল সাইজের ফল ও ভালো ফলনের জন্য উপযোগী।', 'আমদানিকৃত জায়ান্ট মিষ্টি কুমড়ার বীজ, যা বিশাল আকৃতির মিষ্টি কুমড়া উৎপাদনের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে এই বীজ থেকে শক্তিশালী গাছ ও ভালো ফলন পাওয়ার সম্ভাবনা রয়েছে। ছাদবাগান, বাড়ির বাগান ও কৃষি জমিতে চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার: ≥৮০%
🪴 বেঁচে থাকার হার: ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1580', 0, 0, 0, 1, 121, '[]', '2026-09-24T01:42:49.297+00:00', '2026-10-15T08:48:51.690862+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('3aef67a7-652c-4313-85af-246f02ef63ce', 'চায়না হাইব্রিড সবুজ মিষ্টি আখ বীজ', 'china-hybrid-green-sweet-sugarcane-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364700850-554w5nf.webp', NULL, 120, 55, 30, 'সবজি', '[\"সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ২০০টি বীজ। ≥৮০% অঙ্কুরোদগম রসালো, মিষ্টি, উচ্চ ফলনশীল ও উন্নত মানের আখ উৎপাদন করুন।', '<h3>🌱 পণ্যের সংক্ষিপ্ত বিবরণ</h3>
<p><strong>চায়না হাইব্রিড সবুজ মিষ্টি আখ</strong> একটি উন্নত জাতের উচ্চ ফলনশীল আখ, যা লম্বা, মোটা ও রসসমৃদ্ধ কাণ্ড উৎপাদনের জন্য উপযোগী। এর স্বাদ মিষ্টি ও সুস্বাদু। সরাসরি খাওয়া, তাজা আখের রস তৈরি এবং বাণিজ্যিক চাষের জন্য এটি ভালো একটি নির্বাচন।</p>

<p>গাছ দ্রুত বৃদ্ধি পায় এবং সঠিক পরিচর্যা, পর্যাপ্ত আলো ও পুষ্টি নিশ্চিত করতে পারলে শক্তিশালী কাণ্ড ও ভালো ফলন পাওয়া যেতে পারে। বাড়ির বাগান, বড় টব/ড্রাম, ছাদবাগান এবং কৃষি খামারে চাষের জন্য উপযোগী।</p>

<h3>📋 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h3>
<ul>
<li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ২০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
<li>🍬 <strong>বিশেষ বৈশিষ্ট্য:</strong> মিষ্টি স্বাদ, রসসমৃদ্ধ ও মোটা কাণ্ড</li>
<li>🌿 <strong>চাষের উপযোগিতা:</strong> হোম গার্ডেন, ছাদবাগান ও বাণিজ্যিক চাষ</li>
</ul>

<h3>🌤️ কোন কোন মৌসুমে চাষ করা ভালো?</h3>
<p>বাংলাদেশের উষ্ণ ও আর্দ্র আবহাওয়া আখ চাষের জন্য উপযোগী। সাধারণত <strong>বসন্ত ও গ্রীষ্মের শুরুতে</strong> রোপণ করলে গাছের বৃদ্ধি ভালোভাবে শুরু হতে পারে। বর্ষার শুরুতেও পর্যাপ্ত পানি নিষ্কাশনের ব্যবস্থা থাকলে চাষ করা যায়। অতিরিক্ত জলাবদ্ধতা ও তীব্র শীত এড়িয়ে চলা ভালো।</p>

<h3>🪴 মাটি তৈরির বিস্তারিত পদ্ধতি</h3>
<p>আখের জন্য <strong>উর্বর দোআঁশ বা বেলে দোআঁশ মাটি</strong> সবচেয়ে ভালো। মাটিতে পানি জমে থাকলে শিকড় ক্ষতিগ্রস্ত হতে পারে, তাই ভালো নিষ্কাশন ব্যবস্থা নিশ্চিত করতে হবে।</p>

<ul>
<li>জমির মাটি ২–৩ বার ভালোভাবে চাষ ও মই দিয়ে ঝুরঝুরে করে নিন।</li>
<li>আগাছা, পুরোনো শিকড় ও আবর্জনা পরিষ্কার করে ফেলুন।</li>
<li>পচা গোবর বা কম্পোস্ট মাটির সঙ্গে ভালোভাবে মিশিয়ে দিন।</li>
<li>প্রয়োজন অনুযায়ী ফসফরাস ও পটাশজাতীয় সার ব্যবহার করা যেতে পারে।</li>
<li>জমিতে পানি জমার সম্ভাবনা থাকলে উঁচু বেড বা নালা তৈরি করুন।</li>
</ul>

<h3>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h3>
<p>বীজগুলো হালকা ঝুরঝুরে ও আর্দ্র মাটিতে অল্প গভীরে বপন করুন। বীজ খুব গভীরে পুঁতে না দিয়ে পাতলা মাটি দিয়ে ঢেকে দিতে হবে। অঙ্কুরোদগমের সময় মাটি যেন শুকিয়ে না যায়, তবে অতিরিক্ত পানি দেওয়া যাবে না।</p>

<p>চারা শক্তিশালী হলে পর্যাপ্ত জায়গা রেখে মূল স্থানে রোপণ করুন। বড় আকারে চাষের ক্ষেত্রে গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখা জরুরি, যাতে আলো-বাতাস চলাচল করতে পারে এবং গাছ স্বাভাবিকভাবে বৃদ্ধি পায়।</p>

<h3>🏡 টব বা ছাদবাগানে চাষের জন্য মাটি প্রস্তুতি</h3>
<p>বড় টব, ড্রাম বা গ্রো ব্যাগে চাষের ক্ষেত্রে নিচে অবশ্যই পর্যাপ্ত ড্রেনেজ ছিদ্র রাখতে হবে। একটি ভালো মিশ্রণ হিসেবে ব্যবহার করতে পারেন:</p>

<ul>
<li>🌱 ৪০% দোআঁশ মাটি</li>
<li>🥥 ৩০% কোকোপিট</li>
<li>🍂 ২০% পচা কম্পোস্ট/ভার্মিকম্পোস্ট</li>
<li>🏖️ ১০% মোটা বালি বা পার্লাইট</li>
</ul>

<p>আখের শিকড় ও কাণ্ডের বৃদ্ধির জন্য তুলনামূলক বড় ও গভীর পাত্র ব্যবহার করা ভালো।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>
<p>আখ একটি <strong>পূর্ণ রোদপ্রিয় ফসল</strong>। প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পেলে গাছের বৃদ্ধি ও কাণ্ডের বিকাশ ভালো হতে পারে। মাটির উপরিভাগ শুকিয়ে গেলে প্রয়োজন অনুযায়ী পানি দিন। তবে টব বা জমিতে পানি জমে থাকতে দেওয়া যাবে না।</p>

<h3>🌿 পরিচর্যার গুরুত্বপূর্ণ টিপস</h3>
<ul>
<li>আগাছা নিয়মিত পরিষ্কার করুন, যাতে গাছ পর্যাপ্ত পুষ্টি পায়।</li>
<li>গাছের গোড়ায় প্রয়োজন অনুযায়ী জৈব সার বা কম্পোস্ট প্রয়োগ করুন।</li>
<li>গাছ বড় হওয়ার সঙ্গে সঙ্গে মাটির গোড়ায় মাটি তুলে দেওয়া যেতে পারে, এতে গাছের গোড়া শক্ত হতে সাহায্য করে।</li>
<li>অতিরিক্ত পানি ও জলাবদ্ধতা এড়িয়ে চলুন।</li>
<li>পাতা হলুদ হওয়া, দাগ বা পোকার আক্রমণ দেখা দিলে দ্রুত ব্যবস্থা নিন।</li>
<li>পর্যাপ্ত আলো, পুষ্টি ও সঠিক পানি ব্যবস্থাপনা নিশ্চিত করুন।</li>
</ul>

<h3>📍 কোথায় চাষ করা যায়?</h3>
<p>চায়না হাইব্রিড সবুজ মিষ্টি আখ <strong>কৃষি জমি, হোম গার্ডেন, ছাদবাগান, বড় টব, ড্রাম ও গ্রো ব্যাগে</strong> চাষের জন্য উপযোগী। ছাদে চাষের ক্ষেত্রে ভবনের ধারণক্ষমতা ও নিরাপত্তা বিবেচনা করে উপযুক্ত আকারের পাত্র ব্যবহার করুন।</p>

<h3>🍹 কেন চাষ করবেন?</h3>
<ul>
<li>🍬 মিষ্টি ও সুস্বাদু আখ উৎপাদনের জন্য উপযোগী</li>
<li>💧 রসসমৃদ্ধ কাণ্ড পাওয়ার সম্ভাবনা</li>
<li>🌿 হোম গার্ডেন ও ছাদবাগানের জন্য আকর্ষণীয় ফসল</li>
<li>🏡 নিজের বাগান থেকে তাজা আখ উপভোগের সুযোগ</li>
<li>🛒 সরাসরি খাওয়া ও আখের রস তৈরিতে ব্যবহারযোগ্য</li>
<li>🌾 বাণিজ্যিক চাষের জন্যও উপযোগী</li>
</ul>

<h3>🛒 আজই অর্ডার করুন</h3>
<p><strong>চায়না হাইব্রিড সবুজ মিষ্টি আখের বীজ</strong> দিয়ে আপনার বাড়ির বাগান, ছাদবাগান বা কৃষি জমিতে শুরু করুন মিষ্টি ও রসালো আখের চাষ। সঠিক পরিচর্যার মাধ্যমে গাছের সুস্থ বৃদ্ধি ও ভালো ফলন পাওয়ার চেষ্টা করুন। <strong>আজই অর্ডার করুন!</strong></p>', 'VEG-1516', 4, 4, 1, 0, 128, '[]', '2026-09-24T01:42:31.059+00:00', '2026-10-13T05:24:31.650998+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('0bbb21de-5334-49a1-b79e-5a02ad1b7480', 'ব্লু ফ্ল্যাক্স অতসী ফুল বীজ', 'blue-flax-atsi-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732451133-nz1tkp0.webp', NULL, 120, 50, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, আকাশি-নীল কোমল ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'ব্লু ফ্ল্যাক্স (অতসী) ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন আকাশি-নীল রঙের কোমল ও মনোমুগ্ধকর ফুল। সরু সবুজ পাতার সঙ্গে নীল ফুলের অপূর্ব সমন্বয় বাগানে প্রাকৃতিক সৌন্দর্য এনে দেয়। টব, ছাদবাগান, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে প্রচুর ফুল ফোটায়। মৌমাছি ও অন্যান্য উপকারী পরাগবাহীকেও এই ফুল আকর্ষণ করে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1526', 5, 5, 1, 0, 134, '[]', '2026-09-24T01:42:36.009+00:00', '2026-10-14T06:04:44.495351+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('7307f778-72dc-4e92-9c02-74b5e959271f', 'প্রিমিয়াম সাদা তিল বীজ (উচ্চ ফলনশীল)', 'premium-white-sesame-seeds-high-yield', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364662522-ju0c434.webp', NULL, 120, 30, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ১০ গ্রাম বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, তেলসমৃদ্ধ, পুষ্টিকর ও উন্নত মানের তিল উৎপাদন করুন।', 'প্রিমিয়াম সাদা তিল বীজ একটি উচ্চ ফলনশীল ও উন্নত মানের জাত, যা কৃষক ও বাগানপ্রেমীদের জন্য আদর্শ। এই জাতের গাছে প্রচুর পরিমাণে সাদা তিল উৎপন্ন হয় এবং তেল উৎপাদন, খাদ্য ও বাণিজ্যিক চাষের জন্য অত্যন্ত উপযোগী। ভালো অঙ্কুরোদগম ও উচ্চ বেঁচে থাকার হার নিশ্চিত করে সফল চাষাবাদ।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1513', 5, 5, 1, 0, 135, '[]', '2026-09-24T01:42:45.613+00:00', '2026-10-12T11:24:45.953774+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('ea4c1db1-4038-4256-bc18-7dbf8d240ee1', 'লাল সূর্যমুখী ফুলের বীজ', 'ful-1555-copy-9onl-55b0cf', 'https://cdn.abseed.com.bd/storage/v1/object/public/product-images/1775369076705-t915tqo.webp', NULL, 250, 120, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বহু রঙের দৃষ্টিনন্দন সূর্যমুখী, টব ও বাগানের জন্য আদর্শ।', 'লাল সূর্যমুখী ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন হলুদ, লাল, কমলা ও অন্যান্য উজ্জ্বল রঙের দৃষ্টিনন্দন সূর্যমুখী ফুল। এই বিশেষ জাতটি দ্রুত বৃদ্ধি পায়, সহজে চাষযোগ্য এবং দীর্ঘসময় ধরে বাগানকে রঙিন ও প্রাণবন্ত রাখে। টব, ছাদবাগান, বারান্দা, ফুলের বেড এবং খোলা বাগানের জন্য এটি একটি আদর্শ নির্বাচন। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় প্রতিটি গাছ অসাধারণ সৌন্দর্য উপহার দেয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1570', 3, 3, 1, 0, 140, '[]', '2026-09-24T01:42:49.145+00:00', '2026-10-19T11:30:23.84617+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('1503fbe1-4778-4aee-96d5-d2081c4bea1f', 'চাইনিজ আইস সুগার হাইব্রিড তরমুজের বীজ (৮৪২৪ জাত)', 'chinese-ice-sugar-hybrid-watermelon-8424-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364657153-4yhf2bd.webp', NULL, 150, 55, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ২৫টি ক্যাপসুল। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, অত্যন্ত মিষ্টি, রসালো ও উচ্চ ফলনশীল তরমুজ উৎপাদন করুন।', '<h2>চাইনিজ আইস সুগার হাইব্রিড তরমুজ (৮৪২৪ জাত) – মিষ্টি, রসালো ও আকর্ষণীয় তরমুজ চাষ</h2>

<p><strong>চাইনিজ আইস সুগার হাইব্রিড তরমুজ (৮৪২৪ জাত)</strong> একটি আকর্ষণীয় তরমুজের জাত, যা গোলাকার ফল, উজ্জ্বল লাল শাঁস এবং মিষ্টি স্বাদের জন্য পরিচিত। উপযুক্ত আবহাওয়া, পরাগায়ন ও নিয়মিত পরিচর্যায় গাছ ভালোভাবে বেড়ে উঠতে পারে এবং ফল উৎপাদনে সহায়তা পেতে পারে। ফলের শাঁস খাস্তা ও রসালো হওয়ায় পাকা তরমুজ তাজা খাওয়ার জন্য উপযোগী। বাড়ির বাগান, কিচেন গার্ডেন এবং উপযুক্ত কৃষিজমিতে তরমুজ চাষে আগ্রহীদের জন্য এই জাতটি বিবেচনা করার মতো একটি বিকল্প।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> চাইনিজ আইস সুগার হাইব্রিড তরমুজ</li>
  <li><strong>জাত:</strong> ৮৪২৪</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ২৫টি ক্যাপসুল (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>ফলের আকৃতি:</strong> গোলাকার</li>
  <li><strong>শাঁসের রং:</strong> উজ্জ্বল লাল</li>
  <li><strong>স্বাদ ও গঠন:</strong> মিষ্টি, খাস্তা ও রসালো</li>
  <li><strong>চাষের উপযোগিতা:</strong> কিচেন গার্ডেন, উপযুক্ত ছাদ বাগান ও বাণিজ্যিক জমি</li>
</ul>

<h2>⭐ চাইনিজ আইস সুগার তরমুজের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় গোলাকার ফল:</strong> গোলাকার ফলের গঠন তরমুজটিকে দেখতে সুন্দর করে তোলে।</li>
  <li><strong>মিষ্টি ও রসালো শাঁস:</strong> পাকা ফলের লাল শাঁস তাজা খাওয়া ও ফলের সালাদ তৈরিতে ব্যবহার করা যায়।</li>
  <li><strong>খাস্তা গঠন:</strong> উপযুক্তভাবে পরিপক্ব ফলের শাঁস সুস্বাদু ও রসালো হতে পারে।</li>
  <li><strong>লতানো গাছ:</strong> গাছের বৃদ্ধি ও লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা প্রয়োজন।</li>
  <li><strong>বাগান ও জমিতে চাষ:</strong> উপযুক্ত পরিবেশ ও পরিচর্যা থাকলে বাড়ির বাগান বা বাণিজ্যিক জমিতে চাষ করা যায়।</li>
</ul>

<h2>🌤️ তরমুজ চাষের উপযুক্ত সময়</h2>
<p>তরমুজ সাধারণত উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে স্থানীয় আবহাওয়া, তাপমাত্রা ও বৃষ্টিপাত বিবেচনা করে বীজ বপনের সময় নির্ধারণ করা উচিত। অতিরিক্ত ঠান্ডা, দীর্ঘস্থায়ী বৃষ্টি ও জলাবদ্ধতা গাছের বৃদ্ধি ব্যাহত করতে পারে। তাই বীজ বপনের আগে এলাকার মৌসুম ও আবহাওয়ার উপযোগিতা যাচাই করে নিন।</p>

<h2>🪴 মাটি ও জমি প্রস্তুতি</h2>
<p>তরমুজ চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনযোগ্য বেলে-দোআঁশ বা দোআঁশ মাটি উপযোগী। জমি ভালোভাবে তৈরি করে মাটির উর্বরতা অনুযায়ী পরিপক্ব কম্পোস্ট বা জৈব সার মিশিয়ে নিতে পারেন। জমিতে যেন পানি জমে না থাকে, তা নিশ্চিত করুন। ছাদ বাগানে চাষের জন্য বড় ও মজবুত কনটেইনার, পর্যাপ্ত মাটির গভীরতা এবং ভালো নিষ্কাশনব্যবস্থা প্রয়োজন।</p>

<h2>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h2>
<ol>
  <li>পরিষ্কার পাত্র বা নির্ধারিত জমিতে ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য মাটি প্রস্তুত করুন।</li>
  <li>বীজ সরাসরি জমিতে অথবা ছোট পাত্রে বপন করতে পারেন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>স্প্রে বা হালকা সেচের মাধ্যমে মাটি আর্দ্র রাখুন, তবে অতিরিক্ত পানি দেবেন না।</li>
  <li>চারা তৈরি করলে স্থানান্তরের সময় শিকড়ের ক্ষতি যতটা সম্ভব কমিয়ে দিন।</li>
  <li>গাছের লতা ছড়িয়ে বেড়ে ওঠার জন্য পর্যাপ্ত জায়গা রাখুন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন জায়গায় গাছ লাগান।</li>
  <li><strong>পানি:</strong> আবহাওয়া ও মাটির আর্দ্রতা অনুযায়ী নিয়মিত সেচ দিন। ফুল ও ফল গঠনের সময় মাটিতে প্রয়োজনীয় আর্দ্রতা বজায় রাখুন।</li>
  <li><strong>জলাবদ্ধতা:</strong> গাছের গোড়ায় পানি জমতে দেবেন না, কারণ এতে শিকড়ের ক্ষতি হতে পারে।</li>
  <li><strong>লতার বিস্তার:</strong> গাছের লতা ছড়িয়ে বাড়ার জন্য পর্যাপ্ত জায়গা নিশ্চিত করুন।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের পরিচর্যা</h2>
<p>গাছের সুস্থ বৃদ্ধি ও ফল উৎপাদনে সহায়তার জন্য মাটির উর্বরতা অনুযায়ী সুষম সার ও পরিপক্ব জৈব সার প্রয়োগ করুন। প্রয়োজনের অতিরিক্ত সার ব্যবহার করবেন না। নিয়মিত আগাছা পরিষ্কার করুন, গাছের বৃদ্ধি পর্যবেক্ষণ করুন এবং ফলের নিচে অতিরিক্ত আর্দ্রতা জমে থাকলে তা কমানোর ব্যবস্থা নিন। সঠিক পরিচর্যা গাছের স্বাস্থ্য ভালো রাখতে সহায়তা করে।</p>

<h2>🐛 রোগবালাই ও পোকামাকড় ব্যবস্থাপনা</h2>
<p>গাছের পাতা, কাণ্ড, ফুল ও ফল নিয়মিত পরীক্ষা করুন। পাতায় দাগ, হলদে ভাব, অস্বাভাবিক বৃদ্ধি বা ফলের ক্ষতি দেখা দিলে দ্রুত কারণ শনাক্ত করার চেষ্টা করুন। আক্রান্ত অংশ প্রয়োজন অনুযায়ী সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। রোগ বা পোকার আক্রমণ বাড়লে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিয়ে অনুমোদিত বালাইনাশক নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h2>🍉 ফল সংগ্রহ ও ব্যবহার</h2>
<p>ফল পরিপক্ব হলে জাতের বৈশিষ্ট্য ও পরিপক্বতার লক্ষণ দেখে সংগ্রহ করুন। ফলের আকার, মিষ্টতা, শাঁসের রং ও ফলনের পরিমাণ আবহাওয়া, মাটি, পরাগায়ন এবং পরিচর্যার ওপর নির্ভরশীল। পাকা তরমুজ তাজা খাওয়া, ফলের সালাদ তৈরি অথবা পরিবারের সদস্যদের পরিবেশনের জন্য ব্যবহার করা যায়।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনে চাষ</h2>
<p>বাড়িতে তরমুজ চাষ করতে চাইলে লতার বিস্তার ও ফলের বৃদ্ধির জন্য পর্যাপ্ত জায়গা নিশ্চিত করুন। ছাদে চাষের ক্ষেত্রে বড় ও মজবুত টব বা গ্রো-ব্যাগ, উর্বর মাটি, পর্যাপ্ত রোদ এবং পানি নিষ্কাশনের ব্যবস্থা প্রয়োজন। ছাদের ওপর অতিরিক্ত ওজনের চাপ যেন না পড়ে, সেটিও বিবেচনায় রাখুন। জায়গা সীমিত হলে জমি বা আঙিনায় চাষ করা তুলনামূলক সুবিধাজনক হতে পারে।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>নিজের বাগানে মিষ্টি, রসালো ও আকর্ষণীয় তরমুজ চাষের পরিকল্পনা থাকলে সংগ্রহ করুন <strong>চাইনিজ আইস সুগার হাইব্রিড তরমুজ (৮৪২৪ জাত)</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ এবং নিয়মিত পরিচর্যার মাধ্যমে তরমুজ চাষের সম্ভাবনাকে কাজে লাগান।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1583', 0, 0, 0, 0, 142, '[]', '2026-09-24T01:42:40.212+00:00', '2026-10-12T11:24:40.510511+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('bca9cf5d-7aa1-4c48-85b7-397601dcb4be', 'হাইব্রিড মিষ্টি মেলন (বাঙ্গি) বীজ', 'hybrid-baromashi-sweet-melon-bangi-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949170627-lyi2pby.webp', NULL, 180, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ১২০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, সুগন্ধি, মিষ্টি, রসালো ও উচ্চ ফলনশীল বাঙ্গি উৎপাদন করুন।', 'হাইব্রিড মিষ্টি মেলন (বাঙ্গি) একটি উন্নত মানের ও উচ্চ ফলনশীল ফলের জাত, যা গোলাকার থেকে ডিম্বাকার আকৃতির অত্যন্ত মিষ্টি, সুগন্ধি ও রসালো ফল উৎপাদন করে। এর শাঁস কোমল, পুষ্টিগুণে সমৃদ্ধ এবং গরমের সময়ে অত্যন্ত জনপ্রিয়। গাছ দ্রুত বৃদ্ধি পায়, দীর্ঘ সময় ধরে ফলন দেয় এবং ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য উপযোগী।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১২০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1581', 4, 4, 1, 0, 143, '[]', '2026-09-24T01:42:46.56+00:00', '2026-10-12T11:24:46.914233+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('945d6027-798c-4184-afb9-f13ff3f1c69e', 'হলুদ তরমুজ বীজ (ভেতর লাল)', 'yellow-watermelon-red-flesh-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949201259-ltzvwln.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782992647087-rky5b5b.webp\"]', 180, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"আনকমন\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ২৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, আকর্ষণীয় হলুদ খোসার, মিষ্টি, রসালো ও উচ্চ ফলনশীল তরমুজ উৎপাদন করুন।', 'হলুদ তরমুজ (ভেতর লাল) একটি ব্যতিক্রমধর্মী ও উচ্চ ফলনশীল তরমুজের জাত, যা বাইরে উজ্জ্বল হলুদ এবং ভেতরে গাঢ় লাল শাঁসযুক্ত ফল উৎপাদন করে। এর ফল অত্যন্ত মিষ্টি, রসালো ও খাস্তা হওয়ায় খেতে অসাধারণ সুস্বাদু। আকর্ষণীয় রঙের কারণে বাজারে বিশেষ চাহিদা রয়েছে। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1588', 2, 2, 1, 0, 144, '[]', '2026-09-24T01:48:39.316+00:00', '2026-10-19T05:50:44.819689+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e8442c81-8543-44de-9e16-11b4736ed6c0', 'আমদানিকৃত হোয়াইট ডেইজি ফুলের বীজ', 'imported-white-daisy-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732435068-uc2dap3.webp', NULL, 150, 55, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"আনকমন\",\"পপুলার\",\"প্রধান- শীতকালীন\"]', 'আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, উজ্জ্বল সাদা দৃষ্টিনন্দন ফুল, দীর্ঘসময় ফোটে, টব ও বাগানের জন্য আদর্শ।', 'আমদানিকৃত হোয়াইট ডেইজি ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন নির্মল সৌন্দর্যের উজ্জ্বল সাদা ডেইজি ফুল। এর সাদা পাপড়ি ও সোনালি-হলুদ কেন্দ্র ফুলটিকে আরও আকর্ষণীয় করে তোলে। টব, ছাদবাগান, বারান্দা, ফুলের বেড, বর্ডার এবং খোলা বাগানে সহজেই চাষ করা যায়। উচ্চমানের আমদানিকৃত বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি, গাছ দ্রুত বৃদ্ধি পায় এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল ফোটে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1553', 1, 1, 1, 0, 148, '[]', '2026-09-24T01:42:48.035+00:00', '2026-10-12T11:24:49.716188+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d9c3b173-9ed9-4723-ab9f-bdbf44ceec2b', 'হাইব্রিড সবুজ বড় করলা বীজ', 'hybrid-green-big-bitter-gourd-seedss', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1788971471955-v4s7bzh.webp', NULL, 150, 85, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ২০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, বড় আকারের সবুজ ফল, বারোমাসি চাষের জন্য উপযোগী ও উচ্চ ফলনশীল।', 'হাইব্রিড বারোমাসি সবুজ বড় করলা বীজ উচ্চ ফলনশীল ও উন্নত মানের একটি হাইব্রিড জাত, যা সারা বছর চাষের জন্য উপযোগী। গাছ দ্রুত বৃদ্ধি পায় এবং বড় আকারের সবুজ, সমান আকৃতির করলা উৎপাদন করে। টব, ছাদবাগান, মাচা এবং খোলা জমিতে সহজেই চাষ করা যায়। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফলন পাওয়া যায়। বাণিজ্যিক ও পারিবারিক—উভয় ধরনের চাষের জন্য এটি একটি চমৎকার নির্বাচন।&nbsp;<div><span style=\"font-weight: bold;\">&nbsp;পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)&nbsp;</span></div><div><ul><li>&nbsp;📦 বীজ সংখ্যা: আনুমানিক ১৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)&nbsp;</li><li>🌱 বিশুদ্ধতা (Purity): ৯৫%&nbsp;</li><li>✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%&nbsp;</li><li>✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%&nbsp;</li><li>🪴 বেঁচে থাকার হার (Survival Rate): ৯০%</li></ul><div><span style=\"background-color: rgb(254, 240, 138);\">বছরের প্রায় পুরো সময়ই করলা চাষ করা সম্ভব হলেও, ফেব্রুয়ারি থেকে মে মাস (বৈশাখ-জ্যৈষ্ঠ মাস) করলা চাষের সবচেয়ে উপযুক্ত সময়। তবে ঋতুভেদে এটি খরা ও বর্ষা—উভয় মৌসুমেই চাষ করা যায়।</span></div></div><div><br></div><div><span style=\"font-weight: bold;\">করলা চাষের উপযুক্ত মৌসুম</span></div><div><ul><li><span style=\"font-weight: bold;\">গ্রীষ্মকাল ও খরা মৌসুম:</span> ফেব্রুয়ারি থেকে মে মাস (মাঘ থেকে জ্যৈষ্ঠ মাস) বীজ বপনের সেরা সময়।</li><li><span style=\"font-weight: bold;\">বর্ষাকাল:</span> জুন থেকে জুলাই মাসেও দ্বিতীয় দফায় বীজ বপন করা যায়।</li></ul><div><br></div></div><div><span style=\"font-weight: bold;\">মাটি তৈরি পদ্ধতি</span></div><div><ul><li><span style=\"font-weight: bold;\">মাটির ধরন:</span> করলা চাষের জন্য দোআঁশ বা বেলে-দোআঁশ মাটি সবচেয়ে ভালো। মাটিতে পর্যাপ্ত জৈব সার ও সুনিষ্কাশন ব্যবস্থা থাকতে হবে।</li><li><span style=\"font-weight: bold;\">জমি চাষ: </span>জমি বা মাটি ২ থেকে ৩ বার ভালোভাবে চাষ ও মই দিয়ে ঝুরঝুরে ও সমতল করে নিতে হবে। মাটির পিএইচ (pH) মাত্রা ৬.০ থেকে ৬.৭ এর মধ্যে থাকা আদর্শ।</li><li><span style=\"font-weight: bold;\">বেড তৈরি: </span>জমি তৈরি করে সোয়া ৩ ফুট প্রশস্ত বেড তৈরি করতে হবে এবং দুই বেডের মাঝে প্রায় ২ ফুট নালা রাখতে হবে যাতে বৃষ্টির পানি জমে না থাকে।</li><li><span style=\"font-weight: bold;\">মাদা বা গর্ত তৈরি: </span>৩০ সেমি × ৩০ সেমি × ৩০ সেমি আকারে গর্ত বা মাদা তৈরি করতে হবে। প্রতিটি মাদায় পরিমিত জৈব সার (যেমন পচা গোবর বা কম্পোস্ট), টিএসপি এবং পটাশ মাটি ও সারের সাথে ভালোভাবে মিশিয়ে ১০-১৫ দিন রেখে দিতে হবে।</li></ul></div><div><br></div><div><span style=\"font-weight: bold;\">প্রধান রোগবালাই ও প্রতিকার</span></div><div><ul><li><span style=\"font-weight: bold;\">মাছি পোকা (Fruit Fly): </span>এই পোকা করলার গায়ে ডিম পাড়ে এবং ফল পচিয়ে ফেলে।</li></ul></div><div><span style=\"background-color: rgb(254, 202, 202);\">প্রতিকার: আক্রান্ত ফল সংগ্রহ করে সাথে সাথে মাটিচাপা দিতে হবে এবং সেক্স ফেরোমন ফাঁদ ব্যবহার করতে হবে।</span></div><div><ul><li><span style=\"font-weight: bold;\">পাতার জাব পোকা বা এফিড (Aphids)</span>: কচি পাতা ও ডগার রস চুষে গাছ দুর্বল করে দেয়।</li></ul></div><div><span style=\"background-color: rgb(254, 202, 202);\">প্রতিকার: আক্রমণ বেশি হলে অনুমোদিত কীটনাশক বা জৈব বালাইনাশক স্প্রে করতে হবে।</span></div><div><ul><li><span style=\"font-weight: bold;\">সাদা গুঁড়ো রোগ (Powdery Mildew):</span> পাতার ওপর সাদা পাউডার বা আস্তরণ পড়ে এবং পাতা শুকিয়ে যায়।</li></ul></div><div><span style=\"background-color: rgb(254, 202, 202);\">প্রতিকার: সালফারভিত্তিক ছত্রাকনাশক নিয়মমাফিক ব্যবহার করতে হবে।</span></div>', 'VEG-1535', 2, 2, 1, 0, 149, '[]', '2026-09-24T01:46:41.337+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('a5149ebf-e173-4b04-b53d-d98c9bdbca36', 'হাইব্রিড লাল পেরিলা বা লাল পুদিনা বীজ', 'red-perilla-red-mint-hybrid-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782380754273-d00xa4h.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783010066785-2z22a6v.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783010068855-zxdw1uk.webp\"]', 120, 40, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"পরীক্ষিত\"]', 'আনুমানিক ৩৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, সুগন্ধি, লাল-বেগুনি পাতার, পুষ্টিকর ও উচ্চ ফলনশীল ভেষজ গাছ উৎপাদন করুন।', 'হাইব্রিড লাল পেরিলা বা লাল পুদিনা একটি প্রিমিয়াম মানের সুগন্ধি ভেষজ উদ্ভিদ, যা আকর্ষণীয় লাল-বেগুনি রঙের পাতা উৎপাদন করে। এর পাতা সালাদ, সুশি, স্যুপ, হারবাল চা ও বিভিন্ন এশিয়ান রান্নায় ব্যবহার করা হয়। অ্যান্টিঅক্সিডেন্ট, ভিটামিন ও খনিজে সমৃদ্ধ এই উদ্ভিদ দ্রুত বৃদ্ধি পায় এবং দীর্ঘ সময় ধরে পাতা সংগ্রহ করা যায়। টব, ছাদ বাগান ও কিচেন গার্ডেনের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1512', 1, 1, 1, 0, 150, '[]', '2026-09-24T01:48:43.308+00:00', '2026-10-12T11:25:11.906521+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('286be48f-68f5-4201-834e-a34ed81a78d7', 'কিং ওয়াটারমেলন বীজ - বড় ও মিষ্টি জাত (ইম্পোর্টেড)', 'king-watermelon-large-sweet-imported-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785400969416-wynl4jw.webp', NULL, 150, 55, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৩৫-৪০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড় আকৃতির, অত্যন্ত মিষ্টি, রসালো ও উচ্চ ফলনশীল তরমুজ উৎপাদন করুন।', '<h2>কিং ওয়াটারমেলন বীজ (ইম্পোর্টেড) – মিষ্টি, রসালো ও আকর্ষণীয় তরমুজ চাষ</h2>

<p><strong>কিং ওয়াটারমেলন (ইম্পোর্টেড)</strong> তরমুজ চাষে আগ্রহীদের জন্য একটি আকর্ষণীয় জাত। উপযুক্ত পরিবেশ ও সঠিক পরিচর্যায় এই জাতের গাছ ভালোভাবে বেড়ে উঠতে পারে এবং বড় আকৃতির তরমুজ উৎপাদনের সম্ভাবনা থাকে। ফলের শাঁস উজ্জ্বল লাল, রসালো ও খাস্তা হওয়ায় পাকা তরমুজ তাজা খাওয়ার জন্য বেশ উপযোগী। বাড়ির বাগান, উপযুক্ত ছাদ বাগান এবং বাণিজ্যিক জমিতে তরমুজ চাষের পরিকল্পনা করলে কিং ওয়াটারমেলন বীজ বিবেচনা করতে পারেন।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> কিং ওয়াটারমেলন (ইম্পোর্টেড)</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৩৫–৪০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>ফলের শাঁস:</strong> উজ্জ্বল লাল</li>
  <li><strong>স্বাদ ও গঠন:</strong> মিষ্টি, রসালো ও খাস্তা</li>
  <li><strong>চাষের উপযোগিতা:</strong> উপযুক্ত জমি, কিচেন গার্ডেন ও পরিকল্পিত ছাদ বাগান</li>
</ul>

<h2>⭐ কিং ওয়াটারমেলনের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>আকর্ষণীয় ফল:</strong> উপযুক্ত পরিচর্যায় বড় আকৃতির তরমুজ উৎপাদনের সম্ভাবনা থাকে।</li>
  <li><strong>লাল ও রসালো শাঁস:</strong> পাকা ফলের উজ্জ্বল লাল শাঁস তাজা খাওয়ার জন্য উপযোগী।</li>
  <li><strong>মিষ্টি স্বাদ:</strong> পাকা তরমুজ গরমের দিনে সতেজ ফল হিসেবে পরিবেশন করা যায়।</li>
  <li><strong>লতানো গাছ:</strong> গাছের বিস্তারের জন্য পর্যাপ্ত জায়গা ও উপযুক্ত পরিচর্যা নিশ্চিত করা প্রয়োজন।</li>
  <li><strong>বিভিন্ন চাষপদ্ধতিতে ব্যবহার:</strong> জমিতে চাষের পাশাপাশি পর্যাপ্ত জায়গা ও সঠিক ব্যবস্থা থাকলে বড় কনটেইনারে পরীক্ষামূলকভাবে চাষ করা যায়।</li>
</ul>

<h2>🌤️ তরমুজ বীজ বপনের উপযুক্ত সময়</h2>
<p>তরমুজ সাধারণত উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে এলাকার আবহাওয়া, তাপমাত্রা, বৃষ্টিপাত ও স্থানীয় মৌসুম বিবেচনা করে বীজ বপনের সময় নির্বাচন করুন। অতিরিক্ত ঠান্ডা, জলাবদ্ধতা এবং দীর্ঘ সময় ধরে মাটি ভেজা থাকা গাছের বৃদ্ধিতে সমস্যা তৈরি করতে পারে।</p>

<h2>🪴 মাটি ও জমি প্রস্তুতি</h2>
<p>তরমুজ চাষের জন্য ঝুরঝুরে, উর্বর ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে-দোআঁশ মাটি উপযোগী। জমি এমনভাবে প্রস্তুত করুন, যাতে অতিরিক্ত পানি সহজে বের হয়ে যেতে পারে। মাটির উর্বরতা অনুযায়ী ভালোভাবে পচানো জৈব সার বা কম্পোস্ট মিশিয়ে নিতে পারেন। ছাদ বাগানে চাষ করলে পর্যাপ্ত গভীরতা ও ধারণক্ষমতাসম্পন্ন বড় কনটেইনার এবং নিরাপদ পানি নিষ্কাশনের ব্যবস্থা রাখুন।</p>

<h2>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h2>
<ol>
  <li>পরিষ্কার সিডলিং পট বা উপযুক্ত জায়গায় ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য মাটি প্রস্তুত করুন।</li>
  <li>বীজ সরাসরি নির্ধারিত স্থানে অথবা ছোট পাত্রে বপন করতে পারেন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>হালকা পানি দিয়ে মাটি আর্দ্র রাখুন, তবে পানি জমতে দেবেন না।</li>
  <li>চারা তৈরি করলে স্থানান্তরের সময় শিকড়ের ক্ষতি যতটা সম্ভব কমিয়ে দিন।</li>
  <li>গাছের লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং প্রয়োজন অনুযায়ী গাছের দূরত্ব বজায় রাখুন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি রোদ পায় এমন স্থান নির্বাচন করুন।</li>
  <li><strong>পানি:</strong> গাছের বৃদ্ধি ও আবহাওয়া অনুযায়ী নিয়মিত পানি দিন। বিশেষ করে ফুল ও ফল গঠনের সময়ে মাটির আর্দ্রতা বজায় রাখুন।</li>
  <li><strong>জলাবদ্ধতা এড়ানো:</strong> গাছের গোড়ায় পানি জমে থাকলে শিকড়ের ক্ষতি হতে পারে, তাই নিষ্কাশনের ব্যবস্থা নিশ্চিত করুন।</li>
  <li><strong>লতার জায়গা:</strong> লতা মাটিতে ছড়িয়ে বাড়তে পারে এমন পর্যাপ্ত জায়গা রাখুন। ছোট জায়গায় চাষ করলে লতার বিস্তার পরিকল্পনা করে নিন।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের পরিচর্যা</h2>
<p>সুস্থ গাছ ও ভালো ফল উৎপাদনের জন্য মাটির উর্বরতা অনুযায়ী সুষম সার এবং পরিপক্ব জৈব সার ব্যবহার করুন। গাছের বৃদ্ধির বিভিন্ন পর্যায়ে পুষ্টির চাহিদা পরিবর্তিত হয়, তাই প্রয়োজনের অতিরিক্ত সার প্রয়োগ করবেন না। নিয়মিত আগাছা পরিষ্কার করুন, লতার বৃদ্ধি পর্যবেক্ষণ করুন এবং ফলের নিচে অতিরিক্ত আর্দ্রতা জমে থাকলে তা কমানোর ব্যবস্থা করুন।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>তরমুজ গাছের পাতা, কাণ্ড, ফুল ও ফল নিয়মিত পরীক্ষা করুন। পাতা হলুদ হয়ে যাওয়া, দাগ দেখা দেওয়া বা ফলের ক্ষতি হলে সমস্যার কারণ শনাক্ত করার চেষ্টা করুন। বাগান পরিষ্কার রাখুন, আক্রান্ত গাছের অংশ প্রয়োজন অনুযায়ী সরিয়ে ফেলুন এবং পানি ব্যবস্থাপনায় সতর্ক থাকুন। রোগ বা পোকার আক্রমণ বাড়লে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন।</p>

<h2>🍉 ফল সংগ্রহ ও ব্যবহার</h2>
<p>ফল পরিপক্ব হলে জাতের বৈশিষ্ট্য ও পরিপক্বতার লক্ষণ দেখে সংগ্রহ করুন। তরমুজের আকার, শাঁসের রং, মিষ্টতা ও ফলনের পরিমাণ আবহাওয়া, মাটি, পরাগায়ন এবং পরিচর্যার ওপর নির্ভর করে। পাকা তরমুজ টুকরো করে তাজা খাওয়া, ফলের সালাদ তৈরি অথবা পরিবারের সদস্যদের পরিবেশনের জন্য ব্যবহার করা যায়।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনের জন্য</h2>
<p>বাড়িতে তরমুজ চাষ করতে চাইলে মনে রাখবেন, তরমুজের লতা বিস্তারের জন্য পর্যাপ্ত জায়গা প্রয়োজন। ছাদে চাষের ক্ষেত্রে বড় ও মজবুত কনটেইনার, পর্যাপ্ত রোদ, উর্বর মাটি এবং ভালো পানি নিষ্কাশনের ব্যবস্থা নিশ্চিত করুন। ছাদের ওপর অতিরিক্ত ওজনের চাপ যেন না পড়ে, সেটিও বিবেচনায় রাখুন। পর্যাপ্ত জায়গা না থাকলে জমিতে বা আঙিনায় চাষ করা অধিক সুবিধাজনক হতে পারে।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>নিজের বাগানে আকর্ষণীয় ও রসালো তরমুজ চাষের পরিকল্পনা থাকলে সংগ্রহ করুন <strong>কিং ওয়াটারমেলন (ইম্পোর্টেড) বীজ</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ এবং নিয়মিত পরিচর্যার মাধ্যমে তরমুজ চাষের সম্ভাবনাকে কাজে লাগান।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1582', 3, 3, 1, 0, 151, '[]', '2026-09-24T01:42:40.053+00:00', '2026-10-17T13:39:57.063852+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('94815fef-7cfd-4b6e-b843-74233bbd392d', 'ব্ল্যাক ডায়মন্ড বীজহীন তরমুজের বীজ', 'black-diamond-seedless-watermelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364690822-3s743rm.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783096061307-trz5rat.webp\"]', 180, 120, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ২৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড়, মিষ্টি, রসালো ও উচ্চ ফলনশীল প্রিমিয়াম মানের তরমুজ উৎপাদন করুন।', 'ব্ল্যাক ডায়মন্ড বীজহীন তরমুজ একটি জনপ্রিয় প্রিমিয়াম হাইব্রিড জাত, যা বড় আকারের, গাঢ় সবুজ-কালো খোসাযুক্ত এবং অত্যন্ত আকর্ষণীয় তরমুজ উৎপাদন করে। এর শাঁস উজ্জ্বল লাল, অত্যন্ত মিষ্টি, রসালো ও খাস্তা। বীজের পরিমাণ খুবই কম বা প্রায় বীজহীন হওয়ায় খাওয়ার জন্য এটি বিশেষভাবে পছন্দনীয়। উচ্চ ফলন, দ্রুত বৃদ্ধি এবং বাজারে ভালো চাহিদার কারণে এটি বাণিজ্যিক ও পারিবারিক চাষের জন্য আদর্শ।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1589', 1, 1, 1, 0, 152, '[]', '2026-09-24T01:48:39.468+00:00', '2026-10-12T11:25:07.135724+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('dcec1e54-f9fd-44b6-95e9-f40c79e6acb3', 'কচি ডগা ও শাকের জন্য বিশেষ মিষ্টি কুমড়া বীজ', 'pumpkin-seeds-for-young-shoots-and-greens', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949188199-c5lz5rw.webp', NULL, 150, 65, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\"]', 'আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | কচি ডগা ও শাকের জন্য বিশেষ মিষ্টি কুমড়া, সবুজ ডগা উৎপাদনে উপযোগী।', 'কচি ডগা ও শাকের জন্য বিশেষ মিষ্টি কুমড়া বীজ মূলত কচি ডগা ও শাক সংগ্রহের উদ্দেশ্যে চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে দ্রুত সবুজ ডগা ও শাক উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও জমিতে চাষের জন্য উপযোগী এবং নিয়মিত কচি ডগা সংগ্রহ করা যায়।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৪০ টি বীজ / ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1515', 3, 3, 1, 0, 153, '[]', '2026-09-24T01:46:40.625+00:00', '2026-10-12T11:24:59.020325+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8721cdf6-4771-474d-a0de-5c9bfdd23e1c', 'জাপানি লাল মিষ্টি কুমড়ার বীজ (হাইব্রিড)', 'japanese-hybrid-red-sweet-pumpkin-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949189190-lgsmclm.webp', NULL, 170, 95, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | জাপানি হাইব্রিড লাল মিষ্টি কুমড়া, আকর্ষণীয় রঙ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'জাপানি লাল মিষ্টি কুমড়ার বীজ (হাইব্রিড) আকর্ষণীয় লালচে রঙের মিষ্টি কুমড়া চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং সুন্দর আকৃতির ফল উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৩০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1579', 0, 0, 0, 1, 154, '[]', '2026-09-24T01:42:49.466+00:00', '2026-10-15T08:48:59.59251+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('16c50113-cf78-425b-b7e6-cab73e39257b', 'ইম্পোর্টেড বোল লোটাস (টবের পদ্ম) ফুলের বীজ - অল সিজন', 'imported-bowl-lotus-pot-lotus-flower-seeds-all-season', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732426323-mxaabp2.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782992779281-l65z2wt.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1782992779763-3sbd9sq.webp\"]', 150, 55, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"১২ মাস\",\"পপুলার\"]', 'আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, অল সিজন চাষযোগ্য, টব ও ছোট জলাধারে দৃষ্টিনন্দন পদ্মফুলের জন্য আদর্শ।', 'ইম্পোর্টেড বোল লোটাস (টবের পদ্ম) ফুলের বীজ - অল সিজন দিয়ে সহজেই আপনার টব, বাটি বা ছোট জলাধারে ফুটিয়ে তুলুন মনোমুগ্ধকর পদ্মফুল। অল সিজন জাত হওয়ায় উপযুক্ত পরিবেশে বছরের বিভিন্ন সময় চাষ করা যায়। উচ্চমানের আমদানিকৃত বীজ দ্রুত অঙ্কুরিত হয় এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছে রূপ নেয়। ছাদবাগান, বারান্দা, বাড়ির উঠান কিংবা সৌন্দর্যবর্ধনের জন্য এটি একটি চমৎকার নির্বাচন।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1556', 1, 1, 1, 0, 155, '[]', '2026-09-24T01:48:46.328+00:00', '2026-10-17T12:31:28.569342+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('31413002-32fa-4733-999c-c8ee698d97d1', 'উচ্চ ফলনশীল হাইব্রিড ঝিঙে বীজ', 'high-yield-hybrid-ridge-gourd-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949168361-rdakacy.webp', NULL, 150, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- গ্রীষ্মকালীন\",\"প্রধান- বর্ষাকালীন\"]', 'আনুমানিক ৪০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | উচ্চ ফলনশীল হাইব্রিড ঝিঙে, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'উচ্চ ফলনশীল হাইব্রিড ঝিঙে বীজ উন্নতমানের ঝিঙে চাষের জন্য উপযোগী একটি হাইব্রিড জাত। সঠিক পরিচর্যা, পর্যাপ্ত আলো ও অনুকূল পরিবেশে শক্তিশালী গাছ এবং ভালো মানের ঝিঙে উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ সংখ্যা: আনুমানিক ৪০ টি বীজ / ৫ গ্রাম (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1529', 0, 0, 0, 0, 156, '[]', '2026-09-24T01:46:40.042+00:00', '2026-10-12T11:24:57.681646+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('d89dbdd7-7a48-4c6b-9ac0-ed09d4ffee6a', 'হাইব্রিড লাল লেটুস বীজ', 'hybrid-red-lettuce-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364640688-m9tl80m.webp', NULL, 120, 75, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"আনকমন\",\"পপুলার\",\"প্রধান- শীতকালীন\",\"বসন্তকাল\"]', 'আনুমানিক ২০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, দ্রুত বৃদ্ধি পায়, কচি লাল পাতার উচ্চ ফলন দেয় এবং সালাদের জন্য আদর্শ।', 'হাইব্রিড লাল লেটুস বীজ থেকে আকর্ষণীয় লাল রঙের কোমল ও পুষ্টিকর পাতা উৎপাদন করা যায়। দ্রুত অঙ্কুরোদগম, দীর্ঘ সময় ধরে ফলন এবং সহজ পরিচর্যার কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য উপযুক্ত। সালাদ, স্যান্ডউইচ ও বিভিন্ন স্বাস্থ্যকর খাবারে ব্যবহারের জন্য এটি একটি জনপ্রিয় সবজি।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1519', 1, 1, 1, 0, 160, '[]', '2026-09-24T01:42:44.329+00:00', '2026-10-18T09:01:52.186172+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('c792bfdf-c46f-4fea-ab31-2e8394a0599e', 'হাজারী গোলাপ ফুলের বীজ', 'hazari-rose-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732443514-d12yyyi.webp', NULL, 190, 45, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, ঘন পাপড়িযুক্ত দৃষ্টিনন্দন গোলাপ, দীর্ঘসময় ফুল ফোটে, বাগানের জন্য আদর্শ।', 'হাজারী গোলাপ ফুলের বীজ দিয়ে আপনার বাগানে ফুটিয়ে তুলুন অসংখ্য পাপড়িযুক্ত ঘন ও আকর্ষণীয় গোলাপ ফুল। এই বিশেষ জাতটি তার বড়, পূর্ণ ও দৃষ্টিনন্দন ফুলের জন্য অত্যন্ত জনপ্রিয়। টব, ছাদবাগান, বারান্দা, ফুলের বেড এবং খোলা বাগানে সহজেই চাষ করা যায়। গাছ শক্তিশালীভাবে বৃদ্ধি পায় এবং সঠিক পরিচর্যায় দীর্ঘসময় ধরে প্রচুর ফুল ফোটায়, যা বাগানের সৌন্দর্যকে বহুগুণ বাড়িয়ে তোলে। উচ্চমানের বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং ফলনও উন্নত হয়।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ১০০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1542', 0, 0, 0, 0, 161, '[]', '2026-09-24T01:42:38.596+00:00', '2026-10-13T05:24:31.642917+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('4a650bf3-130d-48e2-bca3-9d5cf7951a1e', 'সুপার হোয়াইট হাইব্রিড মিষ্টি ভুট্টা বীজ', 'super-white-hybrid-sweet-corn-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364702355-rbqulz0.webp', NULL, 150, 50, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ৩৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, দুধসাদা, অত্যন্ত মিষ্টি, কোমল ও উচ্চ ফলনশীল ভুট্টা উৎপাদন করুন।', 'সুপার হোয়াইট হাইব্রিড মিষ্টি ভুট্টা একটি উন্নত মানের ও উচ্চ ফলনশীল ভুট্টার জাত, যা দুধসাদা রঙের, কোমল দানা ও অত্যন্ত মিষ্টি স্বাদের মোচা উৎপাদন করে। এর দানাগুলো রসালো, সুস্বাদু এবং সেদ্ধ, গ্রিল, স্যুপ ও বিভিন্ন খাদ্য প্রস্তুতে অত্যন্ত জনপ্রিয়। গাছ দ্রুত বৃদ্ধি পায়, রোগ সহনশীল এবং অনুকূল পরিচর্যায় প্রচুর ফলন দেয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি আদর্শ নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1531', 1, 1, 1, 0, 163, '[]', '2026-09-24T01:42:46.404+00:00', '2026-10-12T11:24:46.580289+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8e9bf763-47f2-426b-988f-e39c26fba41d', 'হাইব্রিড বেগুনি লং শিম বীজ (আলাদা ও আকর্ষণীয় জাত) (কপি)', 'sob-1525-copy-kl45-bf0cb6', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949198429-4oagvz6.webp', NULL, 150, 65, 30, 'করলা-সিম-বরবটি', '[\"করলা-সিম-বরবটি\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"আগাম চাষ- বর্ষারকাল\"]', 'আনুমানিক ১০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম | হাইব্রিড বেগুনি লং শিম, আকর্ষণীয় রঙ, শক্তিশালী গাছ ও ভালো ফলনের জন্য উপযোগী।', 'হাইব্রিড বেগুনি লং শিম বীজ আলাদা ও আকর্ষণীয় বেগুনি রঙের লম্বা শিম চাষের জন্য উপযোগী একটি উন্নতমানের হাইব্রিড জাত। সঠিক পরিচর্যা ও অনুকূল পরিবেশে শক্তিশালী লতানো গাছ এবং সুন্দর আকৃতির বেগুনি শিম উৎপাদনে সহায়ক। বাড়ির বাগান, ছাদবাগান ও বাণিজ্যিক চাষের জন্য উপযোগী।

📋 Product Specifications
📦 বীজ পরিমাণ: আনুমানিক ১০ গ্রাম বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%
🌍 উৎপত্তি: চায়না ইন্টেক প্যাকেট (ইমপোর্টেড)', 'VEG-1540', 1, 1, 1, 1, 165, '[]', '2026-09-24T01:46:41.485+00:00', '2026-10-12T11:25:00.711741+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('72e65082-44ff-4d24-9a3f-32f360b2c9d2', 'হানি ড্রপ মিনি তরমুজ বীজ (টবে চাষ উপযোগী)', 'honey-drop-mini-watermelon-seeds-for-pots', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364658090-o952t3v.webp', NULL, 120, 55, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"পপুলার\",\"সেরা পণ্য\",\"হাইব্রিড\"]', 'আনুমানিক ৫০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, টবে চাষ উপযোগী, অত্যন্ত মিষ্টি, রসালো ও ছোট আকৃতির তরমুজ উৎপাদন করে।', '<escape>
```html
<h2>হানি ড্রপ মিনি তরমুজ বীজ – ছোট আকৃতির মিষ্টি তরমুজ চাষ</h2>

<p><strong>হানি ড্রপ মিনি তরমুজ</strong> ছোট আকৃতির তরমুজ চাষে আগ্রহীদের জন্য একটি আকর্ষণীয় জাত। এর ফল মিষ্টি, রসালো ও সুস্বাদু হওয়ায় পরিবারের সদস্যদের জন্য তাজা ফল হিসেবে উপভোগ করা যায়। উপযুক্ত পরিবেশ ও নিয়মিত পরিচর্যায় গাছ ভালোভাবে বেড়ে উঠতে পারে এবং ফল ধারণ করতে পারে। টব, ছাদ বাগান, বারান্দা বা সীমিত জায়গার হোম গার্ডেনে চাষের পরিকল্পনা থাকলে এই মিনি তরমুজ একটি আকর্ষণীয় বিকল্প হতে পারে।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>পণ্যের নাম:</strong> হানি ড্রপ মিনি তরমুজ</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৫০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>ফলের ধরন:</strong> ছোট আকৃতির তরমুজ</li>
  <li><strong>স্বাদ ও গঠন:</strong> মিষ্টি ও রসালো</li>
  <li><strong>চাষের উপযোগিতা:</strong> টব, ছাদ বাগান, বারান্দা ও হোম গার্ডেন</li>
</ul>

<h2>⭐ হানি ড্রপ মিনি তরমুজের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>ছোট আকৃতির ফল:</strong> ছোট তরমুজ পছন্দ করেন এমন বাগানপ্রেমীদের জন্য আকর্ষণীয় একটি বিকল্প।</li>
  <li><strong>মিষ্টি ও রসালো:</strong> পাকা ফল তাজা খাওয়া এবং ফলের সালাদ তৈরিতে ব্যবহার করা যায়।</li>
  <li><strong>সীমিত জায়গায় চাষের সুযোগ:</strong> পর্যাপ্ত বড় টব বা গ্রো-ব্যাগ, রোদ ও পরিচর্যা থাকলে ছাদ বাগান বা বাড়ির বাগানে চাষ করা যায়।</li>
  <li><strong>শখের বাগানের জন্য উপযোগী:</strong> নিজ হাতে ফল উৎপাদনের অভিজ্ঞতা নিতে আগ্রহীদের জন্য ভালো একটি পছন্দ।</li>
  <li><strong>পারিবারিক ব্যবহারের জন্য:</strong> ছোট পরিবারের জন্য তাজা ফল উৎপাদনের পরিকল্পনায় এই জাত বিবেচনা করা যায়।</li>
</ul>

<h2>🌤️ তরমুজ চাষের উপযুক্ত সময়</h2>
<p>তরমুজ সাধারণত উষ্ণ আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে এলাকার তাপমাত্রা, বৃষ্টিপাত ও মৌসুম অনুযায়ী বীজ বপনের সময় নির্বাচন করুন। অতিরিক্ত ঠান্ডা, দীর্ঘস্থায়ী বৃষ্টি এবং জলাবদ্ধতা গাছের বৃদ্ধিতে সমস্যা তৈরি করতে পারে। তাই বীজ বপনের আগে স্থানীয় আবহাওয়ার উপযোগিতা বিবেচনা করা ভালো।</p>

<h2>🪴 টব ও মাটি প্রস্তুতি</h2>
<p>মিনি তরমুজ চাষের জন্য উর্বর, ঝুরঝুরে এবং পানি নিষ্কাশনযোগ্য মাটি ব্যবহার করুন। মাটির সঙ্গে পরিপক্ব কম্পোস্ট মিশিয়ে নিতে পারেন। টব বা গ্রো-ব্যাগ এমন হতে হবে, যাতে গাছের শিকড় বিস্তার লাভ করতে পারে এবং অতিরিক্ত পানি বের হয়ে যেতে পারে। টবের আকার নির্বাচন করার সময় গাছের লতা ও ফলের বৃদ্ধির জন্য পর্যাপ্ত জায়গা রাখুন।</p>

<h2>🌱 বীজ বপন ও চারা তৈরির পদ্ধতি</h2>
<ol>
  <li>পরিষ্কার সিডলিং পট বা ছোট পাত্রে ঝুরঝুরে মাটি প্রস্তুত করুন।</li>
  <li>বীজ উপযুক্ত গভীরতায় বপন করে পাতলা মাটির স্তর দিয়ে ঢেকে দিন।</li>
  <li>হালকা পানি দিয়ে মাটি আর্দ্র রাখুন, তবে অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li>চারা গজানোর পর পর্যাপ্ত আলো-বাতাস নিশ্চিত করুন।</li>
  <li>চারা শক্ত হলে শিকড়ের ক্ষতি কমিয়ে নির্ধারিত টব বা জমিতে স্থানান্তর করুন।</li>
  <li>গাছের লতা বাড়ার জন্য প্রয়োজনীয় জায়গা রাখুন এবং প্রয়োজনে উপযুক্ত সাপোর্ট দিন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন জায়গায় টব রাখুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা ও আবহাওয়া অনুযায়ী নিয়মিত পানি দিন। বিশেষ করে ফুল ও ফল গঠনের সময় পানির ঘাটতি যেন না হয়।</li>
  <li><strong>জলাবদ্ধতা:</strong> টবের নিচে পর্যাপ্ত ছিদ্র রাখুন এবং গোড়ায় পানি জমতে দেবেন না।</li>
  <li><strong>লতার পরিচর্যা:</strong> লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন। জায়গা সীমিত হলে মজবুত মাচা বা সাপোর্টের ব্যবস্থা বিবেচনা করুন।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও গাছের যত্ন</h2>
<p>গাছের সুস্থ বৃদ্ধি ও ফল উৎপাদনে সহায়তার জন্য মাটির উর্বরতা অনুযায়ী পরিপক্ব কম্পোস্ট এবং সুষম সার ব্যবহার করুন। প্রয়োজনের অতিরিক্ত সার প্রয়োগ করবেন না। নিয়মিত আগাছা পরিষ্কার করুন, পাতার অবস্থা পর্যবেক্ষণ করুন এবং গাছের গোড়ার মাটি যেন অতিরিক্ত শক্ত না হয়ে যায় সেদিকে খেয়াল রাখুন। টবে চাষ করলে পানি ও পুষ্টির অবস্থা নিয়মিত পরীক্ষা করা বিশেষভাবে জরুরি।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>গাছের পাতা, কাণ্ড, ফুল ও ফল নিয়মিত পরীক্ষা করুন। পাতায় দাগ, হলদে ভাব বা ফলের ক্ষতি দেখা দিলে দ্রুত কারণ শনাক্ত করার চেষ্টা করুন। আক্রান্ত অংশ প্রয়োজন অনুযায়ী সরিয়ে ফেলুন এবং টবের চারপাশ পরিষ্কার রাখুন। সমস্যা বাড়লে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন।</p>

<h2>🍉 ফল সংগ্রহ ও ব্যবহার</h2>
<p>ফল জাতের বৈশিষ্ট্য অনুযায়ী পরিপক্ব হলে সংগ্রহ করুন। তরমুজের রং, আকার ও অন্যান্য পরিপক্বতার লক্ষণ পর্যবেক্ষণ করুন। ফলের মিষ্টতা, আকার ও ফলনের পরিমাণ আবহাওয়া, পরিচর্যা, পরাগায়ন এবং গাছের বৃদ্ধির ওপর নির্ভর করে। পাকা হানি ড্রপ মিনি তরমুজ তাজা খাওয়া বা ফলের সালাদ তৈরিতে ব্যবহার করা যায়।</p>

<h2>🏡 ছাদ বাগান ও বারান্দায় চাষ</h2>
<p>সীমিত জায়গায় তরমুজ চাষ করতে চাইলে হানি ড্রপ মিনি তরমুজ একটি বিবেচনাযোগ্য বিকল্প। তবে ছোট ফলের জাত হলেও গাছের লতা ছড়িয়ে বাড়ার জন্য পর্যাপ্ত জায়গা প্রয়োজন। বড় ও মজবুত টব বা গ্রো-ব্যাগ, উর্বর মাটি, পর্যাপ্ত রোদ এবং ভালো পানি নিষ্কাশনের ব্যবস্থা নিশ্চিত করুন। ছাদে টব রাখার সময় ছাদের ভারবহন ক্ষমতার বিষয়টিও বিবেচনায় রাখুন।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>বাড়ির বাগানে ছোট আকৃতির মিষ্টি ও রসালো তরমুজ চাষের পরিকল্পনা থাকলে সংগ্রহ করুন <strong>হানি ড্রপ মিনি তরমুজ বীজ</strong>। সঠিক বীজ বপন, উপযুক্ত পরিবেশ এবং নিয়মিত পরিচর্যার মাধ্যমে নিজের বাগানে তরমুজ চাষের আনন্দ উপভোগ করুন।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1586', 0, 0, 0, 0, 167, '[]', '2026-09-24T01:42:41.161+00:00', '2026-10-12T11:24:40.84659+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('8d1ba5fc-005b-4f72-8b87-56b1046c9407', 'চায়না বড় পাতা পালং শাকের বীজ', 'china-large-leaf-spinach-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364695326-wa2sqrd.webp', NULL, 120, 40, 30, 'শাক ও সবজি', '[\"শাক ও সবজি\"]', NULL, NULL, '[\"হাইব্রিড\",\"পরীক্ষিত\",\"সেরা পণ্য\"]', 'আনুমানিক ১০০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, বড় পাতার, কোমল, পুষ্টিকর, বারোমাসি ও উচ্চ ফলনশীল পালং শাক উৎপাদন করুন।', '```html
<h2>চায়না বড় পাতা পালং শাক বীজ</h2>

<p><strong>চায়না বড় পাতা পালং শাক বীজ</strong> দ্রুত বর্ধনশীল পালং শাক চাষের জন্য উপযোগী একটি জাত। এর বড় আকারের, কোমল ও ঘন সবুজ পাতা খাবারের স্বাদ ও বৈচিত্র্য বাড়াতে সহায়তা করে। সঠিক পরিচর্যা ও অনুকূল পরিবেশে দ্রুত পাতা বৃদ্ধি এবং প্রয়োজন অনুযায়ী একাধিকবার পাতা সংগ্রহের সুযোগ পাওয়া যেতে পারে। বাড়ির ছাদবাগান, বারান্দা, কিচেন গার্ডেন কিংবা বাণিজ্যিকভাবে শাক উৎপাদনের জন্য এই বীজ বেছে নিতে পারেন। নিজের বাগানে তাজা পালং শাক উৎপাদন করতে চাইলে এটি একটি উপযোগী পছন্দ।

<h2>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h2>

<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🥬 <strong>শাকের ধরন:</strong> বড় পাতা পালং শাক</li>
  <li>🌿 <strong>পাতার বৈশিষ্ট্য:</strong> বড়, কোমল ও ঘন সবুজ পাতা</li>
  <li>🏡 <strong>চাষের উপযোগিতা:</strong> ছাদবাগান, বারান্দা, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li>
</ul>

<h2>চায়না বড় পাতা পালং শাকের বিশেষ বৈশিষ্ট্য</h2>

<ul>
  <li><strong>বড় ও কোমল পাতা:</strong> বড় আকারের সবুজ পাতা উৎপাদনের উপযোগী, যা রান্নায় ব্যবহার করা যায়।</li>
  <li><strong>দ্রুত বৃদ্ধি:</strong> অনুকূল পরিবেশ, পর্যাপ্ত আর্দ্রতা ও সঠিক পরিচর্যায় দ্রুত পাতা বৃদ্ধি পেতে পারে।</li>
  <li><strong>পুষ্টিকর শাক:</strong> পালং শাকে বিভিন্ন ভিটামিন, আয়রন ও অন্যান্য খনিজ উপাদান থাকে, যা সুষম খাদ্যের অংশ হতে পারে।</li>
  <li><strong>বারবার পাতা সংগ্রহের সুযোগ:</strong> গাছের ধরন ও বৃদ্ধির অবস্থার ওপর নির্ভর করে উপযুক্ত পাতা একাধিকবার সংগ্রহ করা যেতে পারে।</li>
  <li><strong>বিভিন্ন স্থানে চাষ:</strong> বাড়ির আঙিনা, ছাদবাগান, উঁচু বেড ও উপযুক্ত টবে চাষ করা যায়।</li>
</ul>

<h2>বীজ বপনের উপযুক্ত সময়</h2>

<p>পালং শাক সাধারণত তুলনামূলক শীতল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশের আবহাওয়া বিবেচনায় শীতল মৌসুমে চাষ করা সুবিধাজনক। তবে নির্দিষ্ট জাতের তাপসহনশীলতা ও স্থানীয় পরিবেশ অনুযায়ী বপনের সময় নির্বাচন করুন। অতিরিক্ত গরমে গাছ দ্রুত ফুল ধরতে পারে এবং পাতার গুণমান কমে যেতে পারে।</p>

<h2>মাটি ও জমি প্রস্তুত</h2>

<p>চায়না বড় পাতা পালং শাকের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনের সুবিধাযুক্ত দোআঁশ মাটি উপযোগী। জমি ভালোভাবে আগাছামুক্ত করে মাটি ঝুরঝুরে করুন এবং ভালোভাবে পচা জৈব সার মিশিয়ে নিন। টবে চাষের ক্ষেত্রে বাগানের মাটির সঙ্গে পচা জৈব সার ও পানি নিষ্কাশনে সহায়ক উপাদান মিশিয়ে ব্যবহার করতে পারেন।</p>

<h2>বীজ বপনের নিয়ম</h2>

<ol>
  <li>প্রথমে জমি, উঁচু বেড বা টবে ঝুরঝুরে ও আর্দ্র মাটি প্রস্তুত করুন।</li>
  <li>বীজ সারিতে অথবা ছিটিয়ে বপন করুন। সারিতে বপন করলে পরবর্তী পরিচর্যা ও পাতা সংগ্রহ সহজ হয়।</li>
  <li>বীজের ওপর হালকা মাটির স্তর দিন এবং আলতোভাবে পানি ছিটিয়ে দিন।</li>
  <li>বীজ গজানো পর্যন্ত মাটি হালকা আর্দ্র রাখুন, তবে অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li>চারা ঘন হয়ে গেলে প্রয়োজন অনুযায়ী পাতলা করে দিন, যাতে প্রতিটি গাছ পর্যাপ্ত আলো, বাতাস ও পুষ্টি পায়।</li>
</ol>

<p><strong>পরামর্শ:</strong> বীজ বপনের পর মাটি সম্পূর্ণ শুকিয়ে যেতে দেবেন না। আবার অতিরিক্ত ভেজা মাটিও এড়িয়ে চলুন, কারণ জলাবদ্ধতায় বীজ ও চারার ক্ষতি হতে পারে।</p>

<h2>ছাদবাগান ও টবে পালং শাক চাষ</h2>

<p>ছাদবাগান, বারান্দা কিংবা কিচেন গার্ডেনে পালং শাক চাষের জন্য চওড়া টব, ট্রে বা প্ল্যান্টার ব্যবহার করতে পারেন। পাত্রে পর্যাপ্ত গভীরতা এবং পানি বের হওয়ার ছিদ্র থাকা প্রয়োজন। উর্বর মাটিতে বীজ বপন করে এমন স্থানে রাখুন, যেখানে পর্যাপ্ত সূর্যালোক পাওয়া যায়। গাছ ঘন হয়ে গেলে কিছু চারা তুলে পাতলা করুন। এতে অবশিষ্ট গাছ ভালোভাবে বেড়ে ওঠার জায়গা পাবে।</p>

<h2>সূর্যালোক ও পানি ব্যবস্থাপনা</h2>

<ul>
  <li><strong>সূর্যালোক:</strong> পর্যাপ্ত আলো পায় এমন জায়গায় শাক চাষ করুন। প্রচণ্ড গরমে অতিরিক্ত তাপের চাপ কমানোর ব্যবস্থা রাখুন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা অনুযায়ী নিয়মিত পানি দিন। পাতার বৃদ্ধি ভালো রাখতে মাটির আর্দ্রতা বজায় রাখা গুরুত্বপূর্ণ।</li>
  <li><strong>জলাবদ্ধতা:</strong> জমি বা টবে অতিরিক্ত পানি জমতে দেবেন না।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছ অতিরিক্ত ঘন হতে দেবেন না, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
</ul>

<h2>সার প্রয়োগ ও গাছের পরিচর্যা</h2>

<p>মাটির উর্বরতা অনুযায়ী বপনের আগে পচা জৈব সার মিশিয়ে নিন। গাছের বৃদ্ধি দুর্বল হলে মাটির অবস্থা ও প্রয়োজন বিবেচনা করে সুষম সার প্রয়োগ করুন। অতিরিক্ত নাইট্রোজেন সার ব্যবহার এড়িয়ে চলুন এবং শাক হিসেবে খাওয়ার জন্য পাতা সংগ্রহের আগে ব্যবহৃত সারের নির্দেশনা ও নিরাপদ সংগ্রহকাল মেনে চলুন। নিয়মিত আগাছা পরিষ্কার করুন এবং গাছের বৃদ্ধি পর্যবেক্ষণ করুন।</p>

<h2>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>

<p>পালং শাকে পাতাখেকো পোকা, জাব পোকা এবং আর্দ্র পরিবেশে বিভিন্ন রোগের সমস্যা দেখা দিতে পারে। নিয়মিত পাতার ওপর ও নিচের অংশ পরীক্ষা করুন। আক্রান্ত পাতা সরিয়ে ফেলুন এবং জমি বা টবে পানি জমতে দেবেন না। পর্যাপ্ত দূরত্ব বজায় রাখুন, যাতে বাতাস চলাচল করতে পারে। প্রয়োজনে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ অনুযায়ী অনুমোদিত বালাইনাশক ব্যবহার করুন এবং খাদ্য হিসেবে পাতা সংগ্রহের আগে লেবেলে উল্লেখিত অপেক্ষাকাল অবশ্যই মেনে চলুন।</p>

<h2>পালং শাক সংগ্রহের নিয়ম</h2>

<p>পাতা প্রয়োজনীয় আকারে পৌঁছালে বাইরের বড় পাতাগুলো সাবধানে সংগ্রহ করতে পারেন, যদি গাছের বৃদ্ধি ও জাতের বৈশিষ্ট্য তাতে উপযোগী হয়। গাছের মাঝের নতুন পাতাগুলো অক্ষত রাখলে বৃদ্ধি অব্যাহত থাকতে পারে। একসঙ্গে পুরো গাছ সংগ্রহ করতে চাইলে পাতার আকার ও কোমলতা বিবেচনা করুন। সংগ্রহের পর পরিষ্কার পানিতে ভালোভাবে ধুয়ে রান্নায় ব্যবহার করুন। সংগ্রহের সময় গাছের বৃদ্ধি, আবহাওয়া ও পরিচর্যার ওপর নির্ভরশীল।</p>

<h2>কেন চায়না বড় পাতা পালং শাক বীজ বেছে নেবেন?</h2>

<ul>
  <li>বড়, কোমল ও ঘন সবুজ পাতা উৎপাদনের উপযোগী।</li>
  <li>ছাদবাগান, বারান্দা ও কিচেন গার্ডেনে চাষ করা যায়।</li>
  <li>নিজের বাগান থেকে তাজা শাক সংগ্রহের সুযোগ।</li>
  <li>এক প্যাকেটে আনুমানিক ১০০০টি বীজ।</li>
  <li>সঠিক পরিচর্যায় ভালো পাতা উৎপাদনের সম্ভাবনা।</li>
</ul>

<h2>আজই অর্ডার করুন Ss Seed Shop থেকে!</h2>

<p>নিজের বাড়িতে তাজা ও সবুজ পালং শাক চাষ করতে সংগ্রহ করুন <strong>চায়না বড় পাতা পালং শাক বীজ</strong>। সঠিক মাটি, নিয়মিত পানি ও প্রয়োজনীয় পরিচর্যার মাধ্যমে ছাদবাগান কিংবা কিচেন গার্ডেনেই গড়ে তুলুন আপনার ছোট্ট সবজির বাগান।</p>

<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন।</strong></p>
```', 'SAK-1503', 0, 0, 0, 0, 168, '[]', '2026-09-24T01:42:43.857+00:00', '2026-10-12T11:24:43.342117+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fc0b9e12-63da-431b-ba42-91319ca5e0d6', 'মাল্টিকালার হাইব্রিড ক্যাপসিকাম বীজ', 'multi-color-hybrid-capsicum-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785949152842-4bicwbj.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783401705710-8j83i63.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1783401707679-qsro54f.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785379676637-73v0nef.webp\"]', 180, 120, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ১০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, লাল, হলুদ, কমলা ও সবুজ রঙের আকর্ষণীয়, মিষ্টি ও উচ্চ ফলনশীল ক্যাপসিকাম উৎপাদন করুন।', 'মাল্টি কালার হাইব্রিড ক্যাপসিকাম বীজ একটি প্রিমিয়াম মানের জাত, যা একই চাষে লাল, হলুদ, কমলা ও সবুজ রঙের সুন্দর ক্যাপসিকাম উৎপাদন করতে সক্ষম। ফলগুলো মাংসল, মিষ্টি স্বাদের এবং পুষ্টিগুণে সমৃদ্ধ। ছাদ বাগান, গ্রিনহাউস, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি অত্যন্ত উপযোগী। সালাদ, রান্না ও সাজসজ্জার কাজে ব্যাপকভাবে ব্যবহৃত হয়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1572', 0, 0, 0, 0, 169, '[]', '2026-09-24T01:48:44.32+00:00', '2026-10-12T11:25:12.850859+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('116cb137-0bb9-44bf-b16b-233c67e8ec5e', 'চায়নিজ মিষ্টি চিটা ভুট্টা বীজ (হাইব্রিড)', 'chinese-hybrid-sweet-speckled-corn-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364661699-xfchylw.webp', NULL, 150, 110, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"হাইব্রিড\"]', 'আনুমানিক ৩৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, সুস্বাদু, মিষ্টি, রঙিন দানার ও উচ্চ ফলনশীল ভুট্টা উৎপাদন করুন।', 'চায়নিজ মিষ্টি চিটা ভুট্টা (হাইব্রিড) একটি আকর্ষণীয় ও উচ্চ ফলনশীল ভুট্টার জাত, যার মোচায় সাদা, হলুদ ও বেগুনি রঙের দানার মনোমুগ্ধকর সমন্বয় দেখা যায়। দানাগুলো অত্যন্ত মিষ্টি, কোমল ও পুষ্টিকর হওয়ায় সেদ্ধ, গ্রিল, সালাদ ও বিভিন্ন খাদ্য প্রস্তুতে ব্যবহার করা যায়। দ্রুত বৃদ্ধি, ভালো রোগ সহনশীলতা এবং উন্নত ফলনের কারণে এটি কৃষক ও শখের বাগানপ্রেমীদের কাছে সমান জনপ্রিয়।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1530', 0, 0, 0, 0, 170, '[]', '2026-09-24T01:42:45.277+00:00', '2026-10-12T11:24:45.273741+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('f25dd2bb-1a44-4a27-83a0-73ff8c682bec', 'লাল স্ট্রবেরি বীজ', 'red-sto', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791879873729-14de6.jpg', NULL, 150, 110, 30, 'শাক ও সবজি', '[\"শাক ও সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'FOL-1501', 8, 8, 1, 0, 171, '[]', '2026-09-24T01:46:40.765+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('eef7bedc-2b44-48d5-9f44-7c8eb0586b12', 'সাদা স্ট্রবেরি বীজ (কপি)', 'fol-1501-copy-u90g-a09471', 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791879920000-8z37a.jpg', NULL, 150, 110, 30, 'শাক ও সবজি', '[\"শাক ও সবজি\"]', NULL, NULL, '[]', NULL, NULL, 'FOL-1501-copy-u90g', 9, 9, 1, 0, 172, '[]', '2026-09-24T01:46:40.901+00:00', '2026-10-18T09:01:52.505093+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('96894ad9-e149-41f4-b33c-5f1755e6e408', 'হাইব্রিড হলুদ গোল জুকিনি বীজ (উচ্চ ফলনশীল)', 'hybrid-yellow-round-zucchini-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364683169-yoe69dr.webp', NULL, 150, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\"]', 'আনুমানিক ১০টি বীজ। Ss Seed Shop থেকে নিন উচ্চ ফলনশীল হাইব্রিড হলুদ গোল জুকিনি বীজ। ছাদবাগান বা মাঠের জন্য সেরা, অঙ্কুরোদগম হার ৯০%।', 'আকর্ষণীয় রঙের ও চমৎকার স্বাদের হাইব্রিড হলুদ গোল জুকিনি চাষ করুন খুব সহজেই। আমাদের এই উচ্চ ফলনশীল বীজগুলো ছাদবাগান বা বাণিজ্যিক কৃষির জন্য বিশেষভাবে উপযুক্ত। উন্নত জাতের এই জুকিনি বীজের অঙ্কুরোদগম ও বেঁচে থাকার হার অত্যন্ত চমৎকার, যা নিশ্চিত করবে আপনার লাভজনক ও পুষ্টিকর ফলন।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)
📦 বীজ সংখ্যা: আনুমানিক ১০ টি বীজ (উচ্চ গুণমানসম্পন্ন)

🌱 বিশুদ্ধতা (Purity): ৯৫%

✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%

✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%

🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'SOB-1517', 0, 0, 0, 0, 174, '[]', '2026-09-24T01:42:47.04+00:00', '2026-10-12T11:24:47.587278+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('fb87e2e7-5aa4-4746-a8c6-7563d5549efd', 'প্রিমিয়াম মিক্সড পিটুনিয়া ফুলের বীজ', 'premium-mixed-petunia-flower-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782732449879-93ek9l4.webp', NULL, 110, 75, 30, 'ফুল', '[\"ফুল\"]', NULL, NULL, '[]', 'আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন) | ≥৮০% অঙ্কুরোদগম, মিশ্র রঙের বড় আকর্ষণীয় ফুল, টব, ঝুলন্ত টব ও বাগানের জন্য আদর্শ।', 'প্রিমিয়াম মিক্সড পিটুনিয়া ফুলের বীজ দিয়ে আপনার বাগানকে সাজিয়ে তুলুন লাল, গোলাপি, সাদা, বেগুনি, নীল ও অন্যান্য উজ্জ্বল রঙের দৃষ্টিনন্দন ফুলে। পিটুনিয়া তার বড় আকৃতির ফুল, দীর্ঘস্থায়ী ফুল ফোটা এবং প্রচুর ফুল উৎপাদনের জন্য অত্যন্ত জনপ্রিয়। টব, ঝুলন্ত টব (Hanging Basket), ছাদবাগান, বারান্দা, ফুলের বেড ও বাগানের বর্ডারে চাষের জন্য এটি একটি আদর্শ নির্বাচন। উচ্চমানের প্রিমিয়াম বীজ হওয়ায় অঙ্কুরোদগমের হার বেশি এবং সঠিক পরিচর্যায় স্বাস্থ্যবান গাছ দীর্ঘসময় ধরে বর্ণিল ফুলে ভরে ওঠে।

পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)

📦 বীজ সংখ্যা: আনুমানিক ৫০ টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'FUL-1557', 0, 0, 0, 0, 175, '[]', '2026-09-24T01:42:48.677+00:00', '2026-10-12T11:24:51.288903+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('da23ff41-6ec9-4b9f-872e-088d8d351038', 'হাইব্রিড কালো তরমুজের বীজ', 'hybrid-baromashi-black-watermelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785411561895-au7y2vc.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785411402723-kbdaf2p.webp\"]', 180, 110, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"পরীক্ষিত\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৩৫-৪০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, গাঢ় কালো খোসার, মিষ্টি, রসালো ও উচ্চ ফলনশীল তরমুজ উৎপাদন করুন।', 'হাইব্রিড কালো তরমুজ একটি আকর্ষণীয় ও উচ্চ ফলনশীল তরমুজের জাত, যা গাঢ় কালো বা কালচে সবুজ খোসাযুক্ত বড় ও সুদর্শন ফল উৎপাদন করে। এর শাঁস উজ্জ্বল লাল, অত্যন্ত মিষ্টি, খাস্তা ও রসালো। গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং দীর্ঘ সময় ধরে ফলন দিতে সক্ষম। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫-৪০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1587', 0, 0, 0, 0, 176, '[]', '2026-09-24T01:48:39.609+00:00', '2026-10-12T11:25:07.510138+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('e2755b4b-443b-4049-ba51-ca63d360bd79', 'হাইব্রিড লাউ বীজ - খাটো জাত', 'hybrid-short-bottle-gourd-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364655221-uvwkmqq.webp', NULL, 120, 75, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\"]', 'আনুমানিক ৩৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, কোমল, সুস্বাদু ও দ্রুত ফলনশীল লাউ উৎপাদনের জন্য আদর্শ।', '<h2>হাইব্রিড লাউ বীজ (খাটো জাত) – কোমল, সুস্বাদু ও উচ্চ ফলনশীল লাউ চাষ</h2>

<p><strong>হাইব্রিড লাউ বীজ (খাটো জাত)</strong> উন্নত মানের লাউ উৎপাদনের জন্য উপযোগী একটি জাত, যা থেকে মাঝারি থেকে খাটো আকৃতির কোমল ও সুস্বাদু লাউ পাওয়া যেতে পারে। অনুকূল পরিবেশ ও সঠিক পরিচর্যায় গাছ দ্রুত বৃদ্ধি পেতে পারে এবং তুলনামূলক কম সময়ে ফলন শুরু করতে পারে। ছাদ বাগান, বাড়ির কিচেন গার্ডেন এবং বাণিজ্যিক জমিতে চাষের জন্য এটি একটি ভালো পছন্দ। লাউয়ের কোমল শাঁস ও চমৎকার স্বাদ দৈনন্দিন রান্নার জন্য বেশ উপযোগী।</p>

<h2>🌱 পণ্যের বৈশিষ্ট্য ও স্পেসিফিকেশন</h2>
<ul>
  <li><strong>বীজের নাম:</strong> হাইব্রিড লাউ বীজ (খাটো জাত)</li>
  <li><strong>বীজ সংখ্যা:</strong> আনুমানিক ৩৫টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li><strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li><strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li><strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li><strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li><strong>উপযোগিতা:</strong> ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষ</li>
  <li><strong>ব্যবহার:</strong> রান্নার জন্য কোমল ও সুস্বাদু লাউ উৎপাদন</li>
</ul>

<h2>⭐ হাইব্রিড খাটো লাউয়ের বিশেষ বৈশিষ্ট্য</h2>
<ul>
  <li><strong>খাটো থেকে মাঝারি আকৃতির ফল:</strong> জাতের বৈশিষ্ট্য অনুযায়ী খাটো বা মাঝারি আকৃতির লাউ উৎপাদনের উপযোগী।</li>
  <li><strong>কোমল ও সুস্বাদু:</strong> কচি লাউ রান্না, ভাজি, তরকারি ও বিভিন্ন ঘরোয়া খাবারে ব্যবহার করা যায়।</li>
  <li><strong>দ্রুত বৃদ্ধি:</strong> অনুকূল আবহাওয়া, পর্যাপ্ত আলো ও সঠিক পরিচর্যায় গাছ ভালোভাবে বেড়ে উঠতে পারে।</li>
  <li><strong>দীর্ঘ সময় ফল পাওয়ার সম্ভাবনা:</strong> নিয়মিত পরিচর্যা ও উপযুক্ত পরিবেশে গাছ থেকে একাধিকবার লাউ সংগ্রহ করা সম্ভব হতে পারে।</li>
  <li><strong>বিভিন্ন জায়গায় চাষ:</strong> বাড়ির আঙিনা, কিচেন গার্ডেন, জমি ও উপযুক্ত ছাদ বাগানে চাষ করা যায়।</li>
</ul>

<h2>🌤️ লাউ চাষের উপযুক্ত সময়</h2>
<p>বাংলাদেশে আবহাওয়া, তাপমাত্রা ও স্থানীয় মৌসুম বিবেচনা করে লাউ চাষের সময় নির্বাচন করা উচিত। সাধারণত উষ্ণ আবহাওয়া এবং পর্যাপ্ত সূর্যালোক লাউ গাছের বৃদ্ধির জন্য সহায়ক। বীজ বপনের আগে স্থানীয় আবহাওয়া ও মৌসুমের সঙ্গে মিলিয়ে নেওয়া ভালো।</p>

<h2>🪴 মাটি ও জমি প্রস্তুতি</h2>
<p>লাউ চাষের জন্য পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন উর্বর, ঝুরঝুরে ও জৈব পদার্থসমৃদ্ধ মাটি নির্বাচন করুন। জমি বা টবের মাটির সঙ্গে পচা গোবর বা পরিপক্ব কম্পোস্ট মিশিয়ে নিতে পারেন। মাটিতে যেন পানি জমে না থাকে, সেদিকে খেয়াল রাখুন।</p>

<h2>🌿 বীজ বপন ও চারা তৈরির পদ্ধতি</h2>
<ol>
  <li>বীজ বপনের জন্য সুস্থ ও পানি নিষ্কাশনযোগ্য মাটি প্রস্তুত করুন।</li>
  <li>চাইলে ছোট পাত্রে বা সিডলিং ব্যাগে চারা তৈরি করতে পারেন।</li>
  <li>বীজ মাটিতে উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>বীজ বপনের পর আলতোভাবে পানি দিন, যাতে মাটি আর্দ্র থাকে কিন্তু পানি জমে না যায়।</li>
  <li>চারা কয়েকটি সত্যিকারের পাতা গজিয়ে শক্ত হলে শিকড়ের ক্ষতি না করে নির্ধারিত জায়গায় রোপণ করুন।</li>
</ol>

<h2>☀️ সূর্যালোক ও পানি ব্যবস্থাপনা</h2>
<ul>
  <li><strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন জায়গা বেছে নিন।</li>
  <li><strong>পানি:</strong> মাটির আর্দ্রতা অনুযায়ী নিয়মিত পানি দিন। অতিরিক্ত পানি দিয়ে গোড়ায় জলাবদ্ধতা তৈরি করবেন না।</li>
  <li><strong>মাচা তৈরি:</strong> লাউ গাছ লতানো হওয়ায় মজবুত মাচা বা উপযুক্ত সাপোর্টের ব্যবস্থা করুন।</li>
  <li><strong>বাতাস চলাচল:</strong> গাছের আশপাশে পর্যাপ্ত জায়গা রাখুন, যাতে আলো-বাতাস চলাচল করতে পারে।</li>
</ul>

<h2>🌾 সার প্রয়োগ ও পরিচর্যা</h2>
<p>গাছের সুস্থ বৃদ্ধি নিশ্চিত করতে মাটির উর্বরতা অনুযায়ী পরিপক্ব কম্পোস্ট বা জৈব সার ব্যবহার করুন। প্রয়োজন হলে স্থানীয় কৃষি পরামর্শ অনুযায়ী সুষম সার প্রয়োগ করুন। আগাছা পরিষ্কার রাখুন, লতার বাড়বাড়ন্তের জন্য মাচা ঠিক রাখুন এবং গাছের গোড়ার মাটি আলগা করে দিন। অতিরিক্ত সার প্রয়োগ থেকে বিরত থাকুন।</p>

<h2>🐛 পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h2>
<p>লাউ গাছে পোকামাকড় বা রোগের লক্ষণ দেখা দিলে নিয়মিত পাতা, কাণ্ড ও ফল পরীক্ষা করুন। আক্রান্ত পাতা বা ফল প্রয়োজন অনুযায়ী সরিয়ে ফেলুন এবং জমি পরিষ্কার রাখুন। সমস্যা বাড়লে সঠিক রোগ বা পোকা শনাক্ত করে স্থানীয় কৃষি কর্মকর্তার পরামর্শে অনুমোদিত বালাইনাশক নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h2>🥒 লাউ সংগ্রহ</h2>
<p>লাউয়ের ফল জাতের বৈশিষ্ট্য অনুযায়ী উপযুক্ত আকারে পৌঁছালে এবং শাঁস কোমল থাকা অবস্থায় সংগ্রহ করুন। ধারালো ছুরি দিয়ে লতার ক্ষতি না করে ফল কাটুন। নিয়মিত পরিপক্ব কচি লাউ সংগ্রহ করলে গাছের পরিচর্যা সহজ হয় এবং অনুকূল পরিবেশে নতুন ফল বিকাশে সহায়তা করতে পারে। ফলন ও সংগ্রহের সময় আবহাওয়া, মাটি এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h2>🏡 ছাদ বাগান ও কিচেন গার্ডেনের জন্য উপযোগী</h2>
<p>বাড়িতে নিজের হাতে তাজা লাউ উৎপাদন করতে চাইলে হাইব্রিড লাউ বীজ (খাটো জাত) বিবেচনা করতে পারেন। ছাদে চাষের জন্য যথেষ্ট বড় ও গভীর টব বা গ্রো-ব্যাগ, উর্বর মাটি, পর্যাপ্ত রোদ এবং লতা ছড়ানোর জন্য মজবুত মাচা নিশ্চিত করুন। টবের নিচে পানি নিষ্কাশনের ছিদ্র থাকা জরুরি।</p>

<h2>🛒 Ss Seed Shop থেকে অর্ডার করুন</h2>
<p>বাড়ির বাগান কিংবা বাণিজ্যিক চাষের জন্য সংগ্রহ করুন <strong>হাইব্রিড লাউ বীজ (খাটো জাত)</strong>। সঠিক বীজ বপন, নিয়মিত পরিচর্যা এবং উপযুক্ত পরিবেশের মাধ্যমে সুস্থ লাউ গাছ গড়ে তোলার চেষ্টা করুন।</p>
<p><strong>Ss Seed Shop – সেরা বীজ, সেরা ফলন। আজই অর্ডার করুন!</strong></p>
```
</escape>', 'VEG-1577', 0, 0, 0, 0, 177, '[]', '2026-09-24T01:42:39.731+00:00', '2026-10-15T08:52:36.224902+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('b49c1bdf-870c-4509-b7e7-0826a7185632', 'চায়না গোল্ডেন ফিঙ্গার হলুদ হাইব্রিড মরিচ বীজ', 'china-golden-finger-yellow-hybrid-chili-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1781005155188-zfqppdq.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1781005173438-cx1ysve.webp\",\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1781005173962-h753178.webp\"]', 150, 110, 30, 'মরিচ - বেগুন', '[\"মরিচ - বেগুন\"]', NULL, NULL, '[\"১২ মাস\",\"আনকমন\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ১০০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, উজ্জ্বল হলুদ, লম্বা ও উচ্চ ফলনশীল ঝাঁজালো মরিচ উৎপাদন করুন।', 'চায়না গোল্ডেন ফিঙ্গার হলুদ হাইব্রিড মরিচ একটি আকর্ষণীয় ও উচ্চ ফলনশীল মরিচের জাত, যা উজ্জ্বল সোনালি-হলুদ রঙের লম্বা মরিচ উৎপাদন করে। এর গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং দীর্ঘ সময় ধরে প্রচুর ফলন দেয়। মরিচগুলো ঝাঁজালো, দৃষ্টিনন্দন এবং বাজারে বিশেষ আকর্ষণ সৃষ্টি করে। টব, ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি অত্যন্ত উপযোগী।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ১০০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1567', 0, 0, 0, 0, 178, '[]', '2026-09-24T01:48:40.756+00:00', '2026-10-12T11:25:09.322937+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('2ef8c130-fa19-429c-b9ce-477117189920', 'হাইব্রিড কাচড়া মিষ্টি কুমড়া বীজ', 'hybrid-kachra-sweet-pumpkin-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364685199-qd754ow.webp', NULL, 120, 99, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পরীক্ষিত\",\"সেরা পণ্য\",\"হাইব্রিড\",\"প্রধান- শীতকালীন\",\"বিকল্প- গ্রীষ্মকালীন\",\"বিকল্প- বর্ষাকালীন\"]', 'আনুমানিক ১৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, মিষ্টি স্বাদের, পুষ্টিকর ও দীর্ঘ সংরক্ষণযোগ্য কুমড়া উৎপাদন করে।', '```html
<h2>হাইব্রিড কাচড়া মিষ্টি কুমড়ার বীজ (Hybrid Kachra Sweet Pumpkin Seeds)</h2>

<p>হাইব্রিড কাচড়া মিষ্টি কুমড়া একটি আকর্ষণীয় কুমড়ার জাত, যা উপযুক্ত পরিবেশ ও সঠিক পরিচর্যায় মাঝারি থেকে বড় আকৃতির মিষ্টি স্বাদের ফল উৎপাদনের জন্য চাষ করা হয়। এর শাঁস ঘন ও আকর্ষণীয় রঙের হতে পারে এবং রান্না, ভর্তা, স্যুপসহ বিভিন্ন সুস্বাদু খাবার তৈরিতে ব্যবহার করা যায়। লতানো গাছের বৃদ্ধির জন্য পর্যাপ্ত জায়গা, উর্বর মাটি ও নিয়মিত পরিচর্যা নিশ্চিত করতে পারলে পারিবারিক বাগান কিংবা বাণিজ্যিক চাষ—উভয় ক্ষেত্রেই এই কুমড়া চাষের পরিকল্পনা করা যায়।</p>

<h3>পণ্যের বৈশিষ্ট্য ও বিবরণ (Product Specifications)</h3>
<ul>
  <li>📦 <strong>বীজ সংখ্যা:</strong> আনুমানিক ১৫টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
  <li>🌱 <strong>বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
  <li>✨ <strong>পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
  <li>✅ <strong>অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
  <li>🪴 <strong>বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
  <li>🎃 <strong>ফসলের ধরন:</strong> মিষ্টি কুমড়া</li>
  <li>🌿 <strong>গাছের ধরন:</strong> লতানো সবজি গাছ</li>
  <li>🍲 <strong>ব্যবহার:</strong> রান্না, ভর্তা, স্যুপ ও বিভিন্ন খাদ্য প্রস্তুত</li>
</ul>

<h3>হাইব্রিড কাচড়া মিষ্টি কুমড়ার বিশেষ বৈশিষ্ট্য</h3>
<ul>
  <li>🎃 উপযুক্ত পরিচর্যায় মাঝারি থেকে বড় আকৃতির ফল উৎপাদনের সম্ভাবনা থাকে।</li>
  <li>🍲 মিষ্টি স্বাদের কুমড়া বিভিন্ন ধরনের রান্নায় ব্যবহার করা যায়।</li>
  <li>🌱 সঠিক পরিবেশে গাছের বৃদ্ধি ও ফল ধারণ ভালো হতে পারে।</li>
  <li>🏡 পারিবারিক সবজি বাগানে চাষের জন্য উপযোগী।</li>
  <li>🌾 পর্যাপ্ত জায়গা ও সঠিক পরিচর্যা নিশ্চিত করা গেলে বাণিজ্যিক চাষেও বিবেচনা করা যায়।</li>
  <li>🥣 কুমড়ার শাঁস দিয়ে ভর্তা, তরকারি, স্যুপসহ নানা খাবার তৈরি করা যায়।</li>
</ul>

<h3>বীজ বপনের উপযুক্ত সময়</h3>
<p>বাংলাদেশে মিষ্টি কুমড়া সাধারণত উষ্ণ আবহাওয়ায় ভালোভাবে বেড়ে ওঠে। স্থানীয় মৌসুম, বৃষ্টিপাত, জমির পানি নিষ্কাশন এবং বীজের জাত অনুযায়ী বপনের সময় নির্ধারণ করুন। অতিরিক্ত জলাবদ্ধতা ও দীর্ঘসময় ভেজা মাটি বীজ এবং চারার ক্ষতি করতে পারে। তাই পানি নিষ্কাশনের ভালো ব্যবস্থা রয়েছে এমন জমি বা স্থান নির্বাচন করা জরুরি।</p>

<h3>মাটি তৈরির পদ্ধতি</h3>
<p>মিষ্টি কুমড়া চাষের জন্য উর্বর, ঝুরঝুরে ও পানি নিষ্কাশনযোগ্য দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। জমির মাটি ভালোভাবে ঝুরঝুরে করে পরিমিত পরিমাণে পচা গোবর বা কম্পোস্ট মিশিয়ে নিন। জমিতে পানি জমে থাকলে উঁচু বেড বা মাদা তৈরি করে চাষ করা যেতে পারে। টবে চাষ করলে পর্যাপ্ত জায়গা ও পানি বের হওয়ার ছিদ্রযুক্ত বড় পাত্র ব্যবহার করুন।</p>

<h3>বীজ বপনের নিয়ম</h3>
<ol>
  <li>প্রথমে জমি, মাদা, বড় টব অথবা চারা তৈরির পাত্র প্রস্তুত করুন।</li>
  <li>মাটির সঙ্গে পরিমিত পরিমাণে পচা জৈব সার মিশিয়ে নিন।</li>
  <li>প্রতিটি মাদায় কয়েকটি বীজ বপন করতে পারেন; পরে সুস্থ চারা রেখে অতিরিক্ত চারা তুলে দিন।</li>
  <li>বীজ মাটির মধ্যে উপযুক্ত গভীরতায় বপন করে হালকা মাটি দিয়ে ঢেকে দিন।</li>
  <li>বীজ বপনের পর আলতোভাবে পানি দিন এবং মাটি হালকা আর্দ্র রাখুন।</li>
  <li>চারা গজানোর পর দুর্বল চারা সরিয়ে সবল চারা রাখুন, যাতে গাছ পর্যাপ্ত জায়গা পায়।</li>
  <li>লতা ছড়িয়ে পড়ার জন্য পর্যাপ্ত জায়গা রাখুন এবং আগাছা পরিষ্কার করুন।</li>
</ol>

<h3>জমিতে ও ছাদবাগানে চাষের পদ্ধতি</h3>
<p>হাইব্রিড কাচড়া মিষ্টি কুমড়া জমি, বাড়ির আঙিনা অথবা পর্যাপ্ত জায়গাযুক্ত ছাদবাগানে চাষ করা যেতে পারে। জমিতে চাষের সময় গাছের লতা ছড়িয়ে পড়ার জন্য যথেষ্ট জায়গা রাখুন। ছাদবাগানে চাষ করলে বড় ও মজবুত টব বা গ্রো ব্যাগ ব্যবহার করুন এবং ছাদের ভারবহন ক্ষমতা বিবেচনায় রাখুন। গাছের লতা কোনো সাপোর্টে তুলতে চাইলে ফলের ওজন বহনের উপযোগী শক্ত কাঠামো তৈরি করতে হবে।</p>

<h3>সূর্যালোক ও পানি ব্যবস্থাপনা</h3>
<ul>
  <li>☀️ <strong>সূর্যালোক:</strong> প্রতিদিন পর্যাপ্ত সরাসরি সূর্যালোক পায় এমন স্থান নির্বাচন করুন।</li>
  <li>💧 <strong>পানি:</strong> মাটির আর্দ্রতা অনুযায়ী নিয়মিত পানি দিন, বিশেষ করে গাছের বৃদ্ধি ও ফল গঠনের সময়।</li>
  <li>🚿 <strong>জলাবদ্ধতা:</strong> গোড়ায় পানি জমতে দেবেন না; অতিরিক্ত ভেজা মাটি শিকড়ের ক্ষতি করতে পারে।</li>
  <li>🌿 <strong>লতার পরিচর্যা:</strong> লতা ছড়িয়ে পড়ার জন্য জায়গা রাখুন এবং প্রয়োজনমতো লতাকে সঠিক দিকে পরিচালিত করুন।</li>
</ul>

<h3>সার প্রয়োগ ও গাছের পরিচর্যা</h3>
<p>গাছের সুস্থ বৃদ্ধি ও ফল ধারণের জন্য মাটির উর্বরতা অনুযায়ী পচা গোবর, কম্পোস্ট এবং প্রয়োজনীয় পুষ্টি উপাদান সরবরাহ করুন। অতিরিক্ত নাইট্রোজেনযুক্ত সার প্রয়োগ করলে পাতার বৃদ্ধি বেশি হলেও ফল ধারণে ভারসাম্যহীনতা দেখা দিতে পারে। তাই সুষম সার ব্যবস্থাপনা অনুসরণ করুন। গাছের গোড়ার আগাছা পরিষ্কার রাখুন এবং লতা ও পাতার অবস্থা নিয়মিত পর্যবেক্ষণ করুন।</p>

<h3>পরাগায়ন ও ফলের যত্ন</h3>
<p>কুমড়ার ফুলে ফল ধরার জন্য পরাগায়ন গুরুত্বপূর্ণ। বাগানে মৌমাছি ও অন্যান্য উপকারী পরাগবাহীর উপস্থিতি বজায় রাখতে সহায়ক পরিবেশ তৈরি করুন। ফুল আসার সময় কীটনাশকের অপ্রয়োজনীয় ব্যবহার এড়িয়ে চলুন। ফল ধরতে শুরু করলে ফলের নিচে পরিষ্কার ও শুকনো খড় বা উপযুক্ত উপকরণ দেওয়া যেতে পারে, যাতে ফল সরাসরি ভেজা মাটির সংস্পর্শে না থাকে।</p>

<h3>পোকামাকড় ও রোগবালাই ব্যবস্থাপনা</h3>
<p>কুমড়া গাছে ফলের মাছি, জাবপোকা এবং পাতা বা লতায় রোগের লক্ষণ দেখা দিতে পারে। নিয়মিত গাছ পর্যবেক্ষণ করুন, আক্রান্ত অংশ সরিয়ে ফেলুন এবং বাগান পরিষ্কার রাখুন। প্রয়োজন হলে ফসলের জন্য অনুমোদিত বালাইনাশক পণ্যের লেবেল অনুযায়ী ব্যবহার করুন। ফুল ফোটা ও পরাগায়নের সময় উপকারী পোকামাকড়ের সুরক্ষায় বিশেষ সতর্ক থাকুন।</p>

<h3>ফসল সংগ্রহ ও সংরক্ষণ</h3>
<p>কুমড়ার ফল পরিপক্ব হলে এবং জাত অনুযায়ী উপযুক্ত রং, আকার ও খোসার বৈশিষ্ট্য দেখা দিলে সংগ্রহ করুন। ফল কাটার সময় ডাঁটার কিছু অংশ রেখে সাবধানে কাটুন, যাতে ফলের ক্ষতি কম হয়। সংরক্ষণের আগে ফলের গায়ে অতিরিক্ত আর্দ্রতা না থাকতে দিন এবং ক্ষতিগ্রস্ত ফল আলাদা রাখুন। সংরক্ষণকাল ফলের পরিপক্বতা, জাত ও পরিবেশের ওপর নির্ভর করে।</p>

<h3>কোথায় চাষ করবেন?</h3>
<ul>
  <li>🌾 বাড়ির আঙিনা ও সবজি বাগানে</li>
  <li>🚜 কৃষিজমি ও উঁচু বেডে</li>
  <li>🏡 পর্যাপ্ত জায়গাযুক্ত ছাদবাগানে</li>
  <li>🌿 বড় টব বা গ্রো ব্যাগে</li>
  <li>🧑‍🌾 পারিবারিক চাহিদা অথবা পরিকল্পিত বাণিজ্যিক চাষে</li>
</ul>

<h3>কেন হাইব্রিড কাচড়া মিষ্টি কুমড়ার বীজ বেছে নেবেন?</h3>
<p>নিজের বাগানে মিষ্টি কুমড়া চাষ করতে চাইলে হাইব্রিড কাচড়া মিষ্টি কুমড়ার বীজ হতে পারে একটি আকর্ষণীয় বিকল্প। আনুমানিক ১৫টি বীজের এই প্যাকেটটি পারিবারিক বাগান বা সীমিত পরিসরে চাষের পরিকল্পনায় ব্যবহার করতে পারেন। উপযুক্ত মাটি, পর্যাপ্ত সূর্যালোক, সুষম সার, নিয়মিত পানি এবং সঠিক পরিচর্যা গাছের বৃদ্ধি ও ফল ধারণে সহায়তা করে। ফলের আকার, স্বাদ, ফলন ও সংরক্ষণক্ষমতা চাষের পরিবেশ, জাতের বৈশিষ্ট্য এবং পরিচর্যার ওপর নির্ভরশীল।</p>

<h3>আজই অর্ডার করুন!</h3>
<p>নিজের বাগানে মিষ্টি কুমড়া চাষের পরিকল্পনা করছেন? সংগ্রহ করুন <strong>হাইব্রিড কাচড়া মিষ্টি কুমড়ার বীজ</strong> <strong>Ss Seed Shop</strong> থেকে। সঠিক পরিচর্যার মাধ্যমে নিজের বাগানে গড়ে তুলুন সবুজ লতাপাতা ও কুমড়ার ফলের সমারোহ।</p>
```', 'VEG-1574', 0, 0, 0, 0, 179, '[]', '2026-09-24T01:42:39.085+00:00', '2026-10-12T11:24:38.067233+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('361acb72-5672-4657-966b-acee1b9903fa', 'চাইনিজ হাইব্রিড তরমুজের বীজ (আইস সুগার কিলিন)', 'chinese-hybrid-ice-sugar-qilin-watermelon-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1785405949449-qa2100s.webp', '[\"https:\\/\\/mmscnllcjgsqpzzdaeby.supabase.co\\/storage\\/v1\\/object\\/public\\/product-images\\/1785405958809-39wkca8.webp\"]', 150, 55, 30, 'তরমুজ', '[\"তরমুজ\"]', NULL, NULL, '[\"১২ মাস\",\"সেরা পণ্য\",\"প্রধান- গ্রীষ্মকালীন\",\"আগাম চাষ- শীতকাল\"]', 'আনুমানিক ৩৫-৪০টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, অত্যন্ত মিষ্টি, রসালো ও উচ্চ ফলনশীল তরমুজ উৎপাদন করুন।', 'চাইনিজ হাইব্রিড তরমুজ (আইস সুগার কিলিন) একটি উন্নত মানের ও উচ্চ ফলনশীল তরমুজের জাত, যা অত্যন্ত মিষ্টি, রসালো ও সুস্বাদু ফল উৎপাদন করে। এর শাঁস উজ্জ্বল লাল রঙের, টেক্সচার খাস্তা এবং চিনির পরিমাণ বেশি হওয়ায় খেতে অসাধারণ লাগে। গাছ শক্তিশালী, দ্রুত বৃদ্ধি পায় এবং অনুকূল পরিচর্যায় প্রচুর ফলন দেয়। ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য এটি একটি চমৎকার নির্বাচন।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ৩৫-৪০টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1584', 0, 0, 0, 1, 180, '[]', '2026-09-24T01:48:39.024+00:00', '2026-10-12T11:25:06.138951+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('bf10c577-bb30-496a-bad2-2757202e4538', 'হাইব্রিড জাপানিজ মিষ্টি কুমড়া বীজ (ক্যাবচ্যা জাত)', 'hybrid-japanese-kabocha-sweet-pumpkin-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364656189-5mln66a.webp', NULL, 150, 65, 30, 'লাউ - কুমড়া', '[\"লাউ - কুমড়া\"]', NULL, NULL, '[\"১২ মাস\",\"পপুলার\",\"পরীক্ষিত\",\"হাইব্রিড\"]', 'আনুমানিক ২০-২৫টি বীজ। ≥৮০% অঙ্কুরোদগম বারোমাসি উচ্চ ফলনশীল, মিষ্টি, ঘন শাঁসযুক্ত ও পুষ্টিকর কুমড়া উৎপাদন করে।', 'হাইব্রিড জাপানিজ মিষ্টি কুমড়া (ক্যাবচ্যা জাত) একটি প্রিমিয়াম মানের ও উচ্চ ফলনশীল কুমড়ার জাত, যা গোলাকার, গাঢ় সবুজ খোসা ও উজ্জ্বল কমলা শাঁসযুক্ত ফল উৎপাদন করে। এর স্বাদ অত্যন্ত মিষ্টি, শাঁস ঘন এবং পুষ্টিগুণে সমৃদ্ধ। স্যুপ, ভর্তা, বেকিং ও বিভিন্ন স্বাস্থ্যকর খাবার তৈরিতে এটি ব্যাপকভাবে ব্যবহৃত হয়। দীর্ঘ সংরক্ষণ ক্ষমতা ও চমৎকার ফলনের কারণে এটি ছাদ বাগান, কিচেন গার্ডেন ও বাণিজ্যিক চাষের জন্য আদর্শ।

Product Specifications

📦 বীজ সংখ্যা: আনুমানিক ২০-২৫টি বীজ (উচ্চ গুণমানসম্পন্ন)
🌱 বিশুদ্ধতা (Purity): ৯৫%
✨ পরিচ্ছন্নতা (Cleanliness): ৯৮%
✅ অঙ্কুরোদগমের হার (Germination Rate): ≥৮০%
🪴 বেঁচে থাকার হার (Survival Rate): ৯০%', 'VEG-1593', 0, 0, 0, 0, 181, '[]', '2026-09-24T01:42:39.403+00:00', '2026-10-12T11:24:38.71711+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `products` (`id`, `name`, `slug`, `product_image`, `image_gallery`, `regular_price`, `offer_price`, `buying_price`, `category`, `categories`, `subcategory`, `tag`, `tags`, `short_description`, `full_description`, `sku`, `stock`, `available_stock`, `in_stock`, `is_hidden`, `position`, `variations`, `created_at`, `updated_at`) VALUES ('844d0c23-f117-4a4e-ac5e-d1ba5ef2c817', 'গৌরী গাজরের বীজ (হাইব্রিড)', 'gauri-hybrid-carrot-seeds', 'https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364660852-3lv7vko.webp', NULL, 150, 85, 30, 'শাক - সবজি', '[\"শাক - সবজি\"]', NULL, NULL, '[\"প্রধান- শীতকালীন\"]', 'আনুমানিক ১০০০টি বীজ। ≥৮০% অঙ্কুরোদগম উচ্চ ফলনশীল, লম্বা, মিষ্টি, উজ্জ্বল কমলা রঙের ও উচ্চ ফলনশীল গাজর উৎপাদন করুন।', '<h3>🥕 গৌরী গাজর (হাইব্রিড) বীজ</h3>

<p><strong>গৌরী গাজর (হাইব্রিড) বীজ</strong> উন্নত মানের গাজর চাষের জন্য উপযোগী। সঠিক পরিচর্যা ও অনুকূল পরিবেশে এই জাত থেকে লম্বা, মসৃণ, উজ্জ্বল কমলা রঙের গাজর উৎপাদন করা সম্ভব। গাজরের স্বাদ মিষ্টি, শাঁস কোমল এবং এটি বিটা-ক্যারোটিনসহ বিভিন্ন ভিটামিন ও খনিজের উৎস। সমান আকৃতির গাজর উৎপাদনের সম্ভাবনা ও বাজারে চাহিদার কারণে এটি পারিবারিক বাগান এবং বাণিজ্যিক চাষের জন্য উপযোগী।</p>

<h3>📋 Product Specifications</h3>

<ul>
<li><strong>📦 বীজ সংখ্যা:</strong> আনুমানিক ১০০০টি বীজ (উচ্চ গুণমানসম্পন্ন)</li>
<li><strong>🌱 বিশুদ্ধতা (Purity):</strong> ৯৫%</li>
<li><strong>✨ পরিচ্ছন্নতা (Cleanliness):</strong> ৯৮%</li>
<li><strong>✅ অঙ্কুরোদগমের হার (Germination Rate):</strong> ≥৮০%</li>
<li><strong>🪴 বেঁচে থাকার হার (Survival Rate):</strong> ৯০%</li>
</ul>

<h3>⭐ বিশেষ বৈশিষ্ট্য</h3>

<ul>
<li>🥕 আকর্ষণীয় উজ্জ্বল কমলা রঙের গাজর</li>
<li>🌱 হাইব্রিড জাত, সঠিক পরিচর্যায় ভালো ফলনের সম্ভাবনা</li>
<li>🥕 লম্বা, মসৃণ ও সমান আকৃতির মূল উৎপাদনের জন্য উপযোগী</li>
<li>😋 মিষ্টি স্বাদ ও কোমল শাঁস</li>
<li>💚 বিটা-ক্যারোটিনসহ বিভিন্ন পুষ্টি উপাদানের উৎস</li>
<li>🏡 বাড়ির বাগান ও ছাদবাগানের জন্য উপযোগী</li>
<li>🧑‍🌾 পারিবারিক ও বাণিজ্যিক চাষে ব্যবহারযোগ্য</li>
</ul>

<h3>📅 চাষের উপযুক্ত সময়</h3>

<p>গাজর সাধারণত শীতল আবহাওয়ায় ভালো বৃদ্ধি পায়। বাংলাদেশে <strong>অক্টোবর থেকে ডিসেম্বর</strong> সময়টি গাজর চাষের জন্য সাধারণত উপযোগী। তবে স্থানীয় আবহাওয়া, মাটির তাপমাত্রা ও বীজের প্যাকেটের নির্দেশনা অনুযায়ী বপনের সময় নির্বাচন করা ভালো।</p>

<h3>🌱 মাটি প্রস্তুতি</h3>

<p>গাজরের লম্বা ও মসৃণ মূল গঠনের জন্য গভীর, ঝুরঝুরে, পাথর-কাঁকরমুক্ত এবং পানি নিষ্কাশন সুবিধাযুক্ত বেলে দোআঁশ মাটি ভালো। মাটি শক্ত বা দলাযুক্ত হলে গাজরের মূল বাঁকা বা অসমান হতে পারে।</p>

<ul>
<li>মাটি ভালোভাবে কুপিয়ে বা চাষ দিয়ে গভীর পর্যন্ত ঝুরঝুরে করুন।</li>
<li>পচা কম্পোস্ট পরিমিত পরিমাণে মিশিয়ে মাটির উর্বরতা বাড়ান।</li>
<li>বড় মাটির ঢেলা, পাথর ও আগাছার শিকড় সরিয়ে ফেলুন।</li>
<li>জলাবদ্ধতা এড়াতে প্রয়োজন অনুযায়ী উঁচু বেড তৈরি করুন।</li>
</ul>

<h3>🌿 বীজ বপন পদ্ধতি</h3>

<p>গাজরের বীজ সাধারণত সরাসরি জমি, বেড বা গভীর পাত্রে বপন করা ভালো। বীজ সারিতে বপন করে প্রায় <strong>০.৫–১ সেন্টিমিটার</strong> গভীরতায় হালকা মাটি দিয়ে ঢেকে দিন। বপনের পর আলতোভাবে পানি দিন, যাতে মাটি আর্দ্র থাকে এবং বীজ সরে না যায়।</p>

<p>চারা গজানোর পর অতিরিক্ত ঘন চারা পাতলা করে দিন। এতে প্রতিটি গাজরের মূল বড় হওয়ার জন্য পর্যাপ্ত জায়গা পাবে। গাজরের মূল ক্ষতিগ্রস্ত হতে পারে বলে অপ্রয়োজনে চারা স্থানান্তর না করাই ভালো।</p>

<h3>🪴 টব ও ছাদবাগানে গাজর চাষ</h3>

<p>গৌরী গাজর টব, গভীর গ্রো ব্যাগ বা ছাদবাগানের পাত্রে চাষ করা যায়। লম্বা মূলের জন্য পর্যাপ্ত গভীরতার পাত্র নির্বাচন করুন। পাত্রে ঝুরঝুরে, পাথর-কাঁকরমুক্ত মাটি ব্যবহার করুন এবং নিচে পর্যাপ্ত ড্রেনেজ ছিদ্র রাখুন।</p>

<p><strong>পরামর্শ:</strong> পাত্রে মাটি খুব শক্ত করে চেপে দেবেন না। মাটি হালকা ও ঝুরঝুরে থাকলে গাজরের মূল স্বাভাবিকভাবে বাড়তে সুবিধা হয়।</p>

<h3>☀️ আলো ও পানি ব্যবস্থাপনা</h3>

<p>গাজরের ভালো বৃদ্ধির জন্য পর্যাপ্ত সূর্যালোক প্রয়োজন। প্রতিদিন প্রায় ৬ ঘণ্টা বা তার বেশি সূর্যালোক পাওয়া যায় এমন স্থানে চাষ করা ভালো। বীজ অঙ্কুরোদগম ও মূল বৃদ্ধির সময় মাটিতে সমান আর্দ্রতা বজায় রাখুন। একবার মাটি অতিরিক্ত শুকিয়ে যাওয়া এবং পরে অতিরিক্ত পানি দেওয়া এড়িয়ে চলুন।</p>

<h3>🌿 সার ও পরিচর্যা</h3>

<ul>
<li>বপনের আগে মাটিতে ভালোভাবে পচানো কম্পোস্ট মিশিয়ে নিন।</li>
<li>গাছের প্রয়োজন অনুযায়ী সুষম সার ব্যবহার করুন।</li>
<li>অতিরিক্ত নাইট্রোজেন সার প্রয়োগ এড়িয়ে চলুন, কারণ এতে পাতার বৃদ্ধি বেশি হতে পারে এবং মূলের গুণমান প্রভাবিত হতে পারে।</li>
<li>নিয়মিত আগাছা পরিষ্কার করুন, তবে গাজরের শিকড় যেন ক্ষতিগ্রস্ত না হয়।</li>
<li>গাজরের কাঁধ মাটির ওপরে বেরিয়ে এলে হালকা মাটি দিয়ে ঢেকে দিতে পারেন।</li>
</ul>

<h3>🐛 পোকামাকড় ও রোগ ব্যবস্থাপনা</h3>

<p>গাজরে বিভিন্ন ধরনের পোকামাকড় ও ছত্রাকজনিত রোগ দেখা দিতে পারে। গাছ নিয়মিত পর্যবেক্ষণ করুন, আক্রান্ত অংশ সরিয়ে ফেলুন এবং জমিতে পানি জমতে দেবেন না। সুস্থ বীজ, পরিষ্কার চাষের জায়গা ও সঠিক পানি ব্যবস্থাপনা রোগের ঝুঁকি কমাতে সহায়তা করে। প্রয়োজন হলে স্থানীয়ভাবে অনুমোদিত বালাইনাশক লেবেলের নির্দেশনা অনুযায়ী ব্যবহার করুন।</p>

<h3>🥕 গাজর সংগ্রহ</h3>

<p>গাজরের মূল উপযুক্ত আকার ও পরিপক্বতায় পৌঁছালে সংগ্রহ করুন। সংগ্রহের আগে মাটি হালকা আর্দ্র করলে মূল তুলতে সুবিধা হতে পারে। গাজর তোলার সময় সাবধানে মাটি আলগা করুন, যাতে মূল ভেঙে না যায়। বীজের জাত ও চাষের পরিবেশ অনুযায়ী সংগ্রহের সময় ভিন্ন হতে পারে।</p>

<h3>🏡 কোথায় চাষ করা যায়?</h3>

<ul>
<li>🏠 বাড়ির আঙিনা ও কিচেন গার্ডেন</li>
<li>🏢 ছাদবাগান</li>
<li>🪴 গভীর টব ও গ্রো ব্যাগ</li>
<li>🌾 খোলা জমি</li>
<li>🧑‍🌾 বাণিজ্যিক সবজি খামার</li>
</ul>

<h3>💚 কেন গৌরী গাজর চাষ করবেন?</h3>

<p><strong>গৌরী গাজর (হাইব্রিড)</strong> আকর্ষণীয় কমলা রঙ, মিষ্টি স্বাদ এবং লম্বা ও মসৃণ মূল উৎপাদনের সম্ভাবনার কারণে বাড়ির বাগান ও বাণিজ্যিক চাষের জন্য একটি উপযোগী নির্বাচন। সঠিক মাটি প্রস্তুতি, পর্যাপ্ত আলো, নিয়মিত পানি এবং প্রয়োজনীয় পরিচর্যার মাধ্যমে মানসম্মত গাজর উৎপাদনে সহায়তা পাওয়া যায়।</p>

<p><strong>🥕 আজই গৌরী গাজর বীজ অর্ডার করুন এবং নিজের বাগানে তাজা গাজর চাষ শুরু করুন!</strong></p>', 'VEG-1518', 0, 0, 0, 0, 1000, '[]', '2026-09-24T01:42:31.879+00:00', '2026-10-12T11:24:24.53791+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('e856868f-6883-4212-a662-2627b815a67a', 'টমেটো - শসা', 'টমেটো - শসা', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-tomato-shosa.jpg', 4, 1, '2026-09-24T01:42:29.641+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('1f66f7fb-335c-409e-8c60-e26bfd005586', 'করলা-সিম-বরবটি', 'করলা-সিম-বরবটি', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-korola-sim.jpg', 3, 1, '2026-09-24T01:42:29.801+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('aaa9c6f9-4819-4b5a-93b5-4f44484914b9', 'ফুল', 'ফুল', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/1791528277942-m3ispai.webp', 1, 1, '2026-10-09T06:16:58.8958+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('9c8bf52d-eeab-4307-b524-6d127b9eaa89', 'লাউ - কুমড়া', 'লাউ - কুমড়া', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-lau-kumra.jpg', 6, 1, '2026-09-24T01:42:29.96+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('d7934686-157c-4294-a74a-cef97aae98f7', 'তরমুজ', 'তরমুজ', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-tormuj.jpg', 7, 1, '2026-09-24T01:42:30.116+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('95fcfa02-076d-4bf0-9809-56c0da295386', 'মরিচ - বেগুন', 'মরিচ - বেগুন', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-morich-begun.jpg', 5, 1, '2026-09-24T01:42:30.268+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `position`, `is_active`, `created_at`) VALUES ('f7b16a44-7a63-4eb3-a825-deede9822a32', 'শাক - সবজি', 'শাক - সবজি', NULL, 'https://nkyfljjcxfrmuzsyltta.supabase.co/storage/v1/object/public/product-images/categories/cat-shak-sobji.jpg', 2, 1, '2026-09-24T01:42:29.481+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: subcategories
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES ('sub_1', 'বীজ', 'সবজি বীজ', 1, '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES ('sub_2', 'বীজ', 'ফুলের বীজ', 2, '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES ('sub_3', 'বীজ', 'ফলমূলের বীজ', 3, '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES ('sub_4', 'সার ও কিটনাশক', 'জৈব সার', 1, '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES ('sub_6acc89d2cdf03', 'বীজ', 'হাইব্রিড বীজ 1791789522', 5, '2026-10-12T07:18:42+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: tags
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('ea017852-6565-4cec-90ff-a7e2ba849ab1', 'আনকমন', 'আনকমন', 'purple', 0, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('f24ecba2-f15f-47fd-aa4d-75f97be6ed81', 'পপুলার', 'পপুলার', 'amber', 1, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('25442b9e-1d69-4101-82fa-b67a173179b3', 'পরীক্ষিত', 'পরীক্ষিত', 'pink', 2, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('2b6c6ee2-bb2e-46b4-b098-76f8049119df', 'সেরা পণ্য', 'সেরা পণ্য', 'emerald', 3, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('cf1c4862-9c67-4c9f-aa0a-243a0e6fa447', 'অফার', 'অফার', 'orange', 4, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('53eed60e-56cc-402f-9dac-9ecefa7e9c2d', 'আগাম চাষ- শীতকাল', 'আগাম চাষ- শীতকাল', 'blue', 5, '2026-07-01T12:26:43.038+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('a9ed5671-1873-43df-be51-22addeebb48b', 'হাইব্রিড', 'হাইব্রিড', 'yellow', 6, '2026-07-01T12:27:16.345+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('2bb5f837-ef60-45e3-8571-5846833e2e12', 'প্রধান- গ্রীষ্মকালীন', 'প্রধান- গ্রীষ্মকালীন', 'purple', 7, '2026-09-11T04:36:14.118+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('abe8a397-81bd-4b24-bd5c-2e50ef9eb3a7', 'প্রধান- বর্ষাকালীন', 'প্রধান- বর্ষাকালীন', 'purple', 8, '2026-09-11T04:37:30.381+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('8fc79f63-6f63-49f3-8a84-5468a6a1d8d1', 'প্রধান- শীতকালীন', 'প্রধান- শীতকালীন', 'purple', 9, '2026-09-11T04:45:48.78+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('f7383054-56e5-4616-8ec2-d57ca4955d15', 'আগাম চাষ- গ্রীষ্মকাল', 'আগাম চাষ- গ্রীষ্মকাল', 'blue', 10, '2026-09-11T07:00:01.203+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('7a228fd3-9fb0-48fe-9f3b-e2dd34840199', 'বিকল্প- বর্ষাকালীন', 'বিকল্প- বর্ষাকালীন', 'pink', 11, '2026-09-11T08:56:46.272+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('8bb49baf-0b12-4ef6-8920-6640433bd886', 'বিকল্প- গ্রীষ্মকালীন', 'বিকল্প- গ্রীষ্মকালীন', 'pink', 12, '2026-09-11T08:59:03.584+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('1da30d8f-fd77-4c46-93a5-ae9863d59fd6', 'বিকল্প- শীতকালীন', 'বিকল্প- শীতকালীন', 'pink', 13, '2026-09-11T09:05:55.676+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('6d23e2cd-e28f-46e4-b0cd-d914d17e4718', 'আগাম চাষ- বর্ষারকাল', 'আগাম চাষ- বর্ষারকাল', 'blue', 14, '2026-09-11T18:09:18.113+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('fb6da226-5220-4aa5-b14a-1045148a78cc', 'বসন্তকাল', 'বসন্তকাল', 'emerald', 15, '2026-09-21T11:15:31.966+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('69953230-499f-49c8-8add-0b070aeed9a1', 'শরৎকাল', 'শরৎকাল', 'emerald', 16, '2026-09-21T11:18:25.917+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `tags` (`id`, `name`, `slug`, `color`, `position`, `created_at`) VALUES ('b898fb96-8da6-48b7-9ce5-d8e6455593a2', '১২ মাস', '১২ মাস', '#e60000', 17, '2026-10-09T00:38:51.667736+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: customers
INSERT INTO `customers` (`id`, `google_id`, `email`, `name`, `phone`, `alt_phone`, `phone_verified`, `avatar_url`, `district`, `thana`, `address`, `gender`, `age`, `bio`, `username`, `auth_provider`, `created_at`, `updated_at`, `last_login`) VALUES ('cust_427d05e9dfd3', '113139516248392605469', 'dev.anwarul@gmail.com', 'ANWARUL KARIM', '', '', 0, 'https://lh3.googleusercontent.com/a/ACg8ocKD63KgBJGUqTs5pTfGm-BljGWywzxjzOSozb1Wi6GkzUHghJM=s96-c', '', '', '', '', NULL, '', 'dev.anwarul', 'google', '2026-10-24T12:58:05+00:00', '2026-10-24T12:58:05+00:00', '2026-10-24T12:58:05+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `customers` (`id`, `phone`, `name`, `email`, `avatar_url`, `alt_phone`, `phone_verified`, `district`, `thana`, `address`, `gender`, `age`, `bio`, `username`, `auth_provider`, `created_at`, `updated_at`, `last_login`) VALUES ('cust_4632ad373681', '01712345678', 'মো: আনোয়ারুল করিম', '', '', NULL, 0, NULL, NULL, 'ধানমন্ডি, ঢাকা', NULL, NULL, NULL, 'guest_5678', 'guest', '2026-10-24T13:34:38+00:00', '2026-10-24T13:34:38+00:00', NULL) ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: orders
INSERT INTO `orders` (`id`, `order_id`, `profile_id`, `customer_id`, `customer_name`, `phone`, `address`, `alt_phone`, `note`, `total_amount`, `delivery_charge`, `discount`, `subtotal`, `items`, `payment_method`, `status`, `pre_date`, `payment_status`, `traffic_source`, `created_by_admin_id`, `last_status_changed_by`, `created_at`, `updated_at`) VALUES ('6adcb3ee8f2c5', '84357', 'cust_4632ad373681', 'cust_4632ad373681', 'মো: আনোয়ারুল করিম', '01712345678', 'ধানমন্ডি, ঢাকা', NULL, NULL, 370, 70, 0, 0, '[{\"product_id\":\"1\",\"product_name\":\"হাইব্রিড উন্নত মানের বীজ\",\"product_image\":\"https:\\/\\/placehold.co\\/100x100\",\"quantity\":2,\"unit_price\":150,\"variation_id\":null,\"sku\":null}]', 'cash_on_delivery', 'pending', NULL, 'pending', 'direct', NULL, NULL, '2026-10-24T13:34:38+00:00', '2026-10-24T13:34:38+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: coupons
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `total_discount_given`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES ('coup_ssseedshop10', 'SS10', 'percentage', 10, 500, 200, 100, 0, 0, '2026-01-01T00:00:00+00:00', '2027-12-31T23:59:59+00:00', 1, '2026-01-01T00:00:00+00:00', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `total_discount_given`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES ('coup_welcome50', 'WELCOME50', 'fixed', 50, 300, NULL, 500, 7, 350, '2026-01-01T00:00:00+00:00', '2027-12-31T23:59:59+00:00', 1, '2026-01-01T00:00:00+00:00', '2026-10-12T04:51:40+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `total_discount_given`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES ('coup_special100', 'SPECIAL100', 'fixed', 100, 1000, NULL, 50, 0, 0, '2026-01-01T00:00:00+00:00', '2027-12-31T23:59:59+00:00', 1, '2026-01-01T00:00:00+00:00', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_order_amount`, `usage_limit`, `id`) VALUES ('DISC322', 'fixed', 60, 400, 100, 'coup_b2bb358b') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Table: settings
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_on_pending', 'true', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_on_confirmed', 'true', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_on_delivered', 'true', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_on_no_response', 'true', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_on_entry_done', 'true', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_msg_pending', '{order_id} অর্ডার সফল হয়েছে, মোট {total} টাকা। ধন্যবাদ! - Ss Seed Shop', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_msg_confirmed', 'অভিনন্দন! আপনার {order_id} অর্ডারটি কনফার্ম হয়েছে। মোট {total} টাকা। - Ss Seed Shop', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_msg_delivered', 'আপনার {order_id} অর্ডারটি সফলভাবে ডেলিভারি হয়েছে। Ss Seed Shop-এর সাথে থাকার জন্য ধন্যবাদ!', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_msg_no_response', 'আপনাকে কল করে পাওয়া যায়নি, অনুগ্রহ করে যোগাযোগ করুন। - Ss Seed Shop', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('sms_msg_entry_done', 'আপনার অর্ডার {order_id} কুরিয়ারে বুকিং হয়েছে। {tracking_link} - Ss Seed Shop', '2026-01-01T00:00:00+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES ('set_6accaa3341822', 'delivery_charge_page', '{\"title\":\"ডেলিভারি চার্জ টেস্ট\",\"subtitle\":\"অর্ডার মূল্য অনুযায়ী ডেলিভারি চার্জ\",\"listTitle\":\"ডেলিভারি চার্জ তালিকা\",\"listSubtitle\":\"সারা বাংলাদেশে হোম ডেলিভারি\",\"tiers\":[{\"label\":\"অর্ডার ৳৬০০+\",\"sub\":\"ফ্রি ডেলিভারি\",\"charge\":\"ফ্রি\",\"isFree\":true}],\"timeTitle\":\"ডেলিভারি পেতে আনুমানিক সময়\",\"timeItems\":[{\"label\":\"ঢাকার ভিতরে\",\"value\":\"১ – ২ দিন\"}],\"footerNote\":\"৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!\"}', '2026-10-12T09:36:51+00:00', '2026-10-12T09:41:54+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES ('promo_popups', '[{\"id\":\"debdacaf-dcf0-4bd8-b38f-b19fd6b5c94c\",\"title\":\"বিশেষ অফার!\",\"subtitle\":\"৬৯৯ টাকার পণ্যটি কিনলে সাথে ফ্রি উপহার পাচ্ছেন।\",\"badge_text\":\"ফ্রি অফার\",\"image_url\":\"https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1789965538995-tixul3y.webp\",\"button_text\":\"অর্ডার করুন ও ফ্রি উপহার নিন\",\"link_url\":\"/all-products\",\"delay_seconds\":3,\"is_active\":false,\"show_once\":true,\"start_at\":null,\"end_at\":null,\"sort_order\":1,\"created_at\":\"2026-09-24T05:08:09.179+00:00\",\"updated_at\":\"2026-10-02T13:40:23.777+00:00\",\"buy_product_id\":null,\"free_product_id\":null,\"free_note\":null}]', '2026-10-20T02:15:29.853Z') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('footer_quick_links', '[{\"label\":\"হোম\",\"href\":\"/\"},{\"label\":\"ক্যাটাগরি\",\"href\":\"/categories\"},{\"label\":\"অফার\",\"href\":\"/\"},{\"label\":\"সাহায্য\",\"href\":\"/help\"}]', '2026-10-09T00:38:50.936564+00:00', '2026-10-09T00:38:50.936564+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('footer_categories', '[{\"label\":\"সবজির বীজ\",\"href\":\"/categories\"},{\"label\":\"ফুলের বীজ\",\"href\":\"/categories\"},{\"label\":\"ফলের বীজ\",\"href\":\"/categories\"},{\"label\":\"ঔষধি বীজ\",\"href\":\"/categories\"}]', '2026-10-09T00:38:50.936564+00:00', '2026-10-09T00:38:50.936564+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('variation_stock_seeded_v1', 'true', '2026-10-09T00:38:55.840259+00:00', '2026-10-09T00:38:55.840259+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('free_gift_offer', '{\"enabled\":false,\"tiers\":[{\"minAmount\":699,\"productId\":\"47762a3d-37aa-425f-bc68-f306cfe233e6\",\"productName\":\"হাইব্রিড পুদিনা পাতার বীজ\",\"productImage\":\"https://mmscnllcjgsqpzzdaeby.supabase.co/storage/v1/object/public/product-images/1782364701470-majaw2s.webp\",\"note\":\"\"}]}', '2026-09-25T18:16:56.881+00:00', '2026-09-25T18:16:56.881+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('order_cooldown_enabled', 'true', '2026-09-25T03:25:22.239+00:00', '2026-10-09T10:18:45.431+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES ('order_cooldown_hours', '32', '2026-09-25T03:25:22.239+00:00', '2026-10-09T10:18:45.431+00:00') ON DUPLICATE KEY UPDATE `key`=`key`;

SET FOREIGN_KEY_CHECKS = 1;
