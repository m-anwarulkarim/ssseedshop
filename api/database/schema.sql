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

-- 14. OTPs Table
CREATE TABLE IF NOT EXISTS `otps` (
  `phone` VARCHAR(30) NOT NULL PRIMARY KEY,
  `otp` VARCHAR(10) NOT NULL,
  `expires_at` VARCHAR(50) NOT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL
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
