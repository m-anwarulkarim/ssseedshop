-- ========================================================
-- Ss Seed Shop - Database Seed Template File
-- Format: MySQL / MariaDB (utf8mb4)
-- Purpose: Clean template for easily adding seed data
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Admins Table Template
-- (Default Super Admin is provided below for immediate login)
-- --------------------------------------------------------
INSERT INTO `admins` (
  `id`, `email`, `password_hash`, `password_plain`, `role`, 
  `is_super_admin`, `name`, `photo_url`, `id_card`, `join_date`, 
  `permissions`, `created_at`
) VALUES (
  'admin_super_001',
  'ssseedshop220@gmail.com',
  '$2y$10$z0LojZuJyheMv66l0/n5E.UvJekWk4kSZZl5l2GZ1eKqJ8eLzFw4y',
  'ssseedshop220',
  'superadmin',
  1,
  'Ss Seed Shop Admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'EMP-001',
  '2026-01-01',
  '["all"]',
  '2026-01-01T00:00:00+00:00'
) ON DUPLICATE KEY UPDATE `email`=`email`;

-- [অতিরিক্ত অ্যাডমিন যোগ করার ফরম্যাট]:
-- INSERT INTO `admins` (`id`, `email`, `password_hash`, `password_plain`, `role`, `is_super_admin`, `name`, `created_at`) 
-- VALUES ('admin_002', 'admin@example.com', '$2y$10$...', 'password123', 'admin', 0, 'Admin Name', NOW())
-- ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 2. Categories Table Template
-- --------------------------------------------------------
INSERT INTO `categories` (
  `id`, `name`, `slug`, `display_name`, `icon`, `image`, `image_url`, `position`, `is_active`, `is_hidden`, `created_at`
) VALUES 
('cat_vegetable', 'সবজি বীজ', 'vegetable-seeds', 'সবজি বীজ', 'Sprout', 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400', 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400', 1, 1, 0, '2026-01-01T00:00:00+00:00'),
('cat_flower', 'ফুলের বীজ', 'flower-seeds', 'ফুলের বীজ', 'Flower', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', 2, 1, 0, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- [নতুন ক্যাটাগরি যোগ করার ফরম্যাট]:
-- INSERT INTO `categories` (`id`, `name`, `slug`, `display_name`, `icon`, `image`, `position`, `is_active`)
-- VALUES ('cat_new', 'ক্যাটাগরি নাম', 'category-slug', 'প্রদর্শন নাম', 'Sprout', 'image_url_here', 3, 1)
-- ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 3. Subcategories Table Template
-- --------------------------------------------------------
INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`) VALUES 
('subcat_winter_veg', 'সবজি বীজ', 'শীতকালীন সবজি', 1, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- [নতুন সাব-ক্যাটাগরি যোগ করার ফরম্যাট]:
-- INSERT INTO `subcategories` (`id`, `category_name`, `name`, `position`, `created_at`)
-- VALUES ('subcat_001', 'প্যারেন্ট ক্যাটাগরি নাম', 'সাব-ক্যাটাগরি নাম', 1, NOW())
-- ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 4. Tags Table Template
-- --------------------------------------------------------
INSERT INTO `tags` (`id`, `name`, `slug`, `icon`, `color`, `position`, `created_at`) VALUES 
('tag_bestseller', 'হট সেলিং', 'hot-selling', 'Flame', '#EF4444', 1, '2026-01-01T00:00:00+00:00'),
('tag_new', 'নতুন আগমন', 'new-arrival', 'Sparkles', '#10B981', 2, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- [নতুন ট্যাগ যোগ করার ফরম্যাট]:
-- INSERT INTO `tags` (`id`, `name`, `slug`, `icon`, `color`, `position`, `created_at`)
-- VALUES ('tag_001', 'ট্যাগের নাম', 'tag-slug', 'Tag', '#3B82F6', 1, NOW())
-- ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 5. Products Table Template
-- (Example product showing all fields and JSON columns format)
-- --------------------------------------------------------
INSERT INTO `products` (
  `id`, `name`, `slug`, `sku`, `category`, `categories`, 
  `subcategory`, `tag`, `tags`, `product_image`, `image_gallery`, 
  `regular_price`, `offer_price`, `buying_price`, `short_description`, 
  `full_description`, `in_stock`, `available_stock`, `stock`, 
  `position`, `is_hidden`, `variations`, `package_tiers`, 
  `highlight_features`, `trust_card_1_title`, `trust_card_1_text`, 
  `trust_card_2_title`, `trust_card_2_text`, `created_at`, `updated_at`
) VALUES (
  'prod_sample_001',
  'উন্নত জাতের হাইব্রিড টমেটো বীজ',
  'hybrid-tomato-seeds',
  'TOM-001',
  'সবজি বীজ',
  '["সবজি বীজ"]',
  'শীতকালীন সবজি',
  'হট সেলিং',
  '["হট সেলিং"]',
  'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600',
  '["https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600"]',
  120.00,
  99.00,
  60.00,
  'উচ্চ ফলনশীল ও রোগ প্রতিরোধী উন্নত হাইব্রিড টমেটো বীজ।',
  '<p>আমাদের এই বীজ দ্রুত অঙ্কুরোদগম হয় এবং সর্বোচ্চ ফলন নিশ্চিত করে।</p>',
  1,
  100,
  100,
  1,
  0,
  '[]',
  '[]',
  '["অঙ্কুরোদগম হার ৯০%+", "রোগবালাই প্রতিরোধী জাত", "দ্রুত বর্ধনশীল"]',
  '১০০% খাঁটি বীজ',
  'আমরা বিশ্বস্ত উৎস থেকে সংগৃহীত সেরা মানের বীজ সরবরাহ করি।',
  'দ্রুত ডেলিভারি',
  'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধা।',
  '2026-01-01T00:00:00+00:00',
  '2026-01-01T00:00:00+00:00'
) ON DUPLICATE KEY UPDATE `id`=`id`;

-- [নতুন প্রোডাক্ট যোগ করার ফরম্যাট]:
-- INSERT INTO `products` (
--   `id`, `name`, `slug`, `sku`, `category`, `regular_price`, `offer_price`, 
--   `product_image`, `in_stock`, `available_stock`, `created_at`
-- ) VALUES (
--   'prod_002', 'পণ্যের নাম', 'product-slug', 'SKU-002', 'ক্যাটাগরি নাম', 
--   150.00, 120.00, 'https://example.com/image.jpg', 1, 50, NOW()
-- ) ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 6. Coupons Table Template
-- --------------------------------------------------------
INSERT INTO `coupons` (
  `id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, 
  `max_discount_amount`, `usage_limit`, `used_count`, `total_discount_given`, 
  `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`
) VALUES (
  'coup_welcome50',
  'WELCOME50',
  'fixed',
  50.00,
  500.00,
  NULL,
  100,
  0,
  0.00,
  '2026-01-01T00:00:00+00:00',
  '2027-12-31T23:59:59+00:00',
  1,
  '2026-01-01T00:00:00+00:00',
  '2026-01-01T00:00:00+00:00'
) ON DUPLICATE KEY UPDATE `id`=`id`;

-- [নতুন কুপন যোগ করার ফরম্যাট]:
-- INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `usage_limit`, `is_active`)
-- VALUES ('coup_002', 'DISCOUNT10', 'percent', 10.00, 1000.00, 50, 1)
-- ON DUPLICATE KEY UPDATE `id`=`id`;


-- --------------------------------------------------------
-- 7. Settings Table Template
-- --------------------------------------------------------
INSERT INTO `settings` (`key`, `value`, `updated_at`) VALUES 
('order_cooldown_enabled', 'true', '2026-01-01T00:00:00+00:00'),
('order_cooldown_hours', '24', '2026-01-01T00:00:00+00:00'),
('footer_quick_links', '[{"label":"হোম","href":"/"},{"label":"ক্যাটাগরি","href":"/categories"},{"label":"যোগাযোগ","href":"/help"}]', '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- [নতুন সেটিং যোগ করার ফরম্যাট]:
-- INSERT INTO `settings` (`key`, `value`, `updated_at`)
-- VALUES ('setting_key', 'setting_value', NOW())
-- ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

SET FOREIGN_KEY_CHECKS = 1;
