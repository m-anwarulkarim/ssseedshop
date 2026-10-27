<?php
// api/update_schema.php
// Standalone Database Auto-Migration & Schema Repair for Ss Seed Shop

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$pdo = DB::pdo();

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Database connection failed. Check db.php credentials.',
        'mode'    => 'JSON Fallback Active'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

$report = [
    'success' => true,
    'message' => 'Database schema update completed successfully',
    'timestamp' => date('c'),
    'actions' => []
];

// 1. PRODUCTS TABLE
$prodCols = [
    'package_tiers'      => 'LONGTEXT DEFAULT NULL',
    'highlight_features' => 'TEXT DEFAULT NULL',
    'trust_card_1_title' => 'VARCHAR(255) DEFAULT NULL',
    'trust_card_1_text'  => 'TEXT DEFAULT NULL',
    'trust_card_2_title' => 'VARCHAR(255) DEFAULT NULL',
    'trust_card_2_text'  => 'TEXT DEFAULT NULL',
    'variations'         => 'LONGTEXT DEFAULT NULL',
    'available_stock'    => 'INT DEFAULT 0',
    'position'           => 'INT DEFAULT 0',
    'is_hidden'          => 'TINYINT(1) DEFAULT 0',
    'buying_price'       => 'DECIMAL(10,2) DEFAULT 0.00',
    'categories'         => 'LONGTEXT DEFAULT NULL',
    'tags'               => 'LONGTEXT DEFAULT NULL',
    'product_image'      => 'LONGTEXT DEFAULT NULL',
    'image_gallery'      => 'LONGTEXT DEFAULT NULL',
    'full_description'   => 'LONGTEXT DEFAULT NULL',
];

try {
    $stmt = $pdo->query("DESCRIBE `products`");
    $existingCols = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

    foreach ($prodCols as $col => $type) {
        if (!in_array($col, $existingCols)) {
            try {
                $pdo->exec("ALTER TABLE `products` ADD COLUMN `$col` $type");
                $report['actions'][] = "Added column `products`.`$col` ($type)";
            } catch (Exception $e) {
                $report['actions'][] = "Error adding `products`.`$col`: " . $e->getMessage();
            }
        } else {
            $report['actions'][] = "Verified column `products`.`$col` (Already exists)";
        }
    }
} catch (Exception $e) {
    $report['actions'][] = "Products table error: " . $e->getMessage();
}

// 2. CATEGORIES TABLE
$catCols = [
    'image'       => 'TEXT DEFAULT NULL',
    'description' => 'TEXT DEFAULT NULL',
];
try {
    $stmt = $pdo->query("DESCRIBE `categories`");
    $existingCols = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    foreach ($catCols as $col => $type) {
        if (!in_array($col, $existingCols)) {
            try {
                $pdo->exec("ALTER TABLE `categories` ADD COLUMN `$col` $type");
                $report['actions'][] = "Added column `categories`.`$col`";
            } catch (Exception $e) {
                $report['actions'][] = "Error adding `categories`.`$col`: " . $e->getMessage();
            }
        }
    }
} catch (Exception $e) {}

// 3. ORDERS TABLE
$orderCols = [
    'is_deleted'          => 'TINYINT(1) DEFAULT 0',
    'traffic_source'      => "VARCHAR(100) DEFAULT 'direct'",
    'pre_date'            => 'VARCHAR(50) DEFAULT NULL',
    'created_by_admin_id' => 'VARCHAR(64) DEFAULT NULL',
];
try {
    $stmt = $pdo->query("DESCRIBE `orders`");
    $existingCols = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    foreach ($orderCols as $col => $type) {
        if (!in_array($col, $existingCols)) {
            try {
                $pdo->exec("ALTER TABLE `orders` ADD COLUMN `$col` $type");
                $report['actions'][] = "Added column `orders`.`$col`";
            } catch (Exception $e) {
                $report['actions'][] = "Error adding `orders`.`$col`: " . $e->getMessage();
            }
        }
    }
} catch (Exception $e) {}

// Return fresh product columns for verification
try {
    $stmt = $pdo->query("DESCRIBE `products`");
    $report['final_products_columns'] = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
} catch (Exception $e) {}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

