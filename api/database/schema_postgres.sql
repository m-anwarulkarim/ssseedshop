-- ========================================================
-- AgroSeed PostgreSQL Database Schema
-- Version: 1.0 (Production-Ready for Supabase / Neon / PostgreSQL)
-- Character Set: UTF8
-- ========================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_plain VARCHAR(255) DEFAULT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT FALSE,
  name VARCHAR(191) DEFAULT NULL,
  photo_url TEXT DEFAULT NULL,
  id_card VARCHAR(100) DEFAULT NULL,
  join_date VARCHAR(50) DEFAULT NULL,
  permissions TEXT DEFAULT NULL,
  created_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admins (email);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  sku VARCHAR(100) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  categories TEXT DEFAULT NULL,
  subcategory VARCHAR(100) DEFAULT NULL,
  tag VARCHAR(100) DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  product_image TEXT DEFAULT NULL,
  image_gallery TEXT DEFAULT NULL,
  regular_price NUMERIC(10,2) DEFAULT 0.00,
  offer_price NUMERIC(10,2) DEFAULT 0.00,
  buying_price NUMERIC(10,2) DEFAULT 0.00,
  short_description TEXT DEFAULT NULL,
  full_description TEXT DEFAULT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  available_stock INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  variations TEXT DEFAULT NULL,
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_prod_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_prod_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_prod_position ON products (position);
CREATE INDEX IF NOT EXISTS idx_prod_stock ON products (in_stock);
CREATE INDEX IF NOT EXISTS idx_prod_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_prod_hidden ON products (is_hidden);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  position INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_cat_position ON categories (position);

-- 4. Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_subcat_parent ON subcategories (category_name);

-- 5. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT NULL,
  color VARCHAR(20) DEFAULT NULL,
  created_at VARCHAR(50) DEFAULT NULL
);

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  phone VARCHAR(30) NOT NULL,
  name VARCHAR(191) DEFAULT NULL,
  email VARCHAR(191) DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  alt_phone VARCHAR(30) DEFAULT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  district VARCHAR(100) DEFAULT NULL,
  thana VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  username VARCHAR(100) DEFAULT NULL,
  auth_provider VARCHAR(50) DEFAULT 'phone',
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL,
  last_login VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_cust_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_cust_email ON customers (email);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(191) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  alt_phone VARCHAR(30) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  total_amount NUMERIC(10,2) DEFAULT 0.00,
  delivery_charge NUMERIC(10,2) DEFAULT 0.00,
  discount NUMERIC(10,2) DEFAULT 0.00,
  subtotal NUMERIC(10,2) DEFAULT 0.00,
  items TEXT DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  print_note BOOLEAN DEFAULT FALSE,
  advance NUMERIC(10,2) DEFAULT 0.00,
  is_courier_entered BOOLEAN DEFAULT FALSE,
  courier VARCHAR(50) DEFAULT NULL,
  consignment_id VARCHAR(100) DEFAULT NULL,
  tracking_code VARCHAR(100) DEFAULT NULL,
  courier_status VARCHAR(50) DEFAULT NULL,
  created_by_admin_id VARCHAR(64) DEFAULT NULL,
  last_status_changed_by VARCHAR(64) DEFAULT NULL,
  pre_date VARCHAR(50) DEFAULT NULL,
  traffic_source VARCHAR(100) DEFAULT 'direct',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_ord_order_id ON orders (order_id);
CREATE INDEX IF NOT EXISTS idx_ord_phone ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_ord_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_ord_deleted ON orders (is_deleted);
CREATE INDEX IF NOT EXISTS idx_ord_created_by ON orders (created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_ord_last_modified ON orders (last_status_changed_by);
CREATE INDEX IF NOT EXISTS idx_ord_created_at ON orders (created_at);

-- 8. Incomplete Orders Table
CREATE TABLE IF NOT EXISTS incomplete_orders (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  customer_name VARCHAR(191) DEFAULT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT DEFAULT NULL,
  visitor_id VARCHAR(100) DEFAULT NULL,
  reason VARCHAR(100) DEFAULT 'checkout_abandoned',
  cart_snapshot TEXT DEFAULT NULL,
  attempt_count INTEGER DEFAULT 1,
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_inc_phone ON incomplete_orders (phone);

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) DEFAULT 'fixed',
  discount_value NUMERIC(10,2) DEFAULT 0.00,
  min_order_amount NUMERIC(10,2) DEFAULT 0.00,
  max_discount_amount NUMERIC(10,2) DEFAULT NULL,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  total_discount_given NUMERIC(10,2) DEFAULT 0.00,
  starts_at VARCHAR(50) DEFAULT NULL,
  expires_at VARCHAR(50) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_coup_code ON coupons (code);

-- 10. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(64) DEFAULT NULL,
  key VARCHAR(100) NOT NULL PRIMARY KEY,
  value TEXT DEFAULT NULL,
  created_at VARCHAR(50) DEFAULT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);

-- 12. SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  order_id VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(30) NOT NULL,
  status VARCHAR(50) DEFAULT NULL,
  reason VARCHAR(100) DEFAULT NULL,
  message TEXT DEFAULT NULL,
  sent BOOLEAN DEFAULT TRUE,
  gateway TEXT DEFAULT NULL,
  timestamp VARCHAR(50) DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_logs (phone);
CREATE INDEX IF NOT EXISTS idx_sms_order ON sms_logs (order_id);

-- 13. Fraud Cache Table
CREATE TABLE IF NOT EXISTS fraud_cache (
  phone VARCHAR(30) NOT NULL PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at VARCHAR(50) DEFAULT NULL
);
