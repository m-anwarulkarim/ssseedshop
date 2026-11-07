<?php
// api/update_schema.php
// Standalone Database Auto-Migration, Performance Indexing & Schema Repair for Ss Seed Shop

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
    'success'   => true,
    'message'   => 'Database schema and performance indexing update completed successfully',
    'timestamp' => date('c'),
    'actions'   => []
];

// Helper to check and create index if missing
function ensureTableIndex(PDO $pdo, string $table, string $indexName, string $columnsSql, array &$actions) {
    try {
        $stmt = $pdo->query("SHOW INDEX FROM `$table` WHERE Key_name = '$indexName'");
        $exists = $stmt ? $stmt->fetch() : false;
        if (!$exists) {
            $pdo->exec("ALTER TABLE `$table` ADD INDEX `$indexName` $columnsSql");
            $actions[] = "Created index `$table`.`$indexName` $columnsSql";
        } else {
            $actions[] = "Verified index `$table`.`$indexName` (Already optimal)";
        }
    } catch (Exception $e) {
        $actions[] = "Index warning on `$table`.`$indexName`: " . $e->getMessage();
    }
}

// 1. PRODUCTS TABLE COLUMNS
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
        }
    }
} catch (Exception $e) {
    $report['actions'][] = "Products table error: " . $e->getMessage();
}

// 1.1 PRODUCTS INDEXES
$prodIndexes = [
    'idx_prod_category' => '(`category`)',
    'idx_prod_sku'      => '(`sku`)',
    'idx_prod_position' => '(`position`)',
    'idx_prod_stock'    => '(`in_stock`)',
    'idx_prod_slug'     => '(`slug`)',
    'idx_prod_hidden'   => '(`is_hidden`)',
    'idx_prod_created'  => '(`created_at`)',
];
foreach ($prodIndexes as $idxName => $colsSql) {
    ensureTableIndex($pdo, 'products', $idxName, $colsSql, $report['actions']);
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

$catIndexes = [
    'idx_cat_position' => '(`position`)',
    'idx_cat_slug'     => '(`slug`)',
    'idx_cat_hidden'   => '(`is_hidden`)',
];
foreach ($catIndexes as $idxName => $colsSql) {
    ensureTableIndex($pdo, 'categories', $idxName, $colsSql, $report['actions']);
}

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

$orderIndexes = [
    'idx_ord_order_id'      => '(`order_id`)',
    'idx_ord_phone'         => '(`phone`)',
    'idx_ord_status'        => '(`status`)',
    'idx_ord_created'       => '(`created_at`)',
    'idx_ord_deleted'       => '(`is_deleted`)',
    'idx_ord_created_by'    => '(`created_by_admin_id`)',
    'idx_ord_last_modified' => '(`last_status_changed_by`)',
];
foreach ($orderIndexes as $idxName => $colsSql) {
    ensureTableIndex($pdo, 'orders', $idxName, $colsSql, $report['actions']);
}

// 4. SETTINGS TABLE INDEXES
$settingsIndexes = [
    'idx_set_key' => '(`key`)',
];
foreach ($settingsIndexes as $idxName => $colsSql) {
    ensureTableIndex($pdo, 'settings', $idxName, $colsSql, $report['actions']);
}

// 5. AUTO-SEED / SYNC 30-COMBO-PACKAGE PRODUCT TO MYSQL
try {
    $comboProd = [
        'id'                 => 'prod_30_combo_package_270',
        'name'               => '৩০ প্রকার সবজির বীজ কম্বো প্যাকেজ',
        'slug'               => '30-combo-package',
        'sku'                => 'COMBO-30',
        'product_image'      => '/30-combo-package.jpg',
        'image_gallery'      => ['/30-combo-package.jpg'],
        'regular_price'      => 350,
        'offer_price'        => 270,
        'buying_price'       => 180,
        'category'           => 'শাক - সবজি',
        'categories'         => ['শাক - সবজি', 'সবজি'],
        'subcategory'        => 'কম্বো বীজ',
        'tag'                => 'জনপ্রিয়',
        'tags'               => ['হট অফার', 'বেস্ট সেলার', 'কম্বো অফার', 'ফ্রি ডেলিভারি'],
        'short_description'  => '৩০ প্রকার শাক ও সবজির উন্নত জাতের বীজ প্যাকেজ – সারাদেশে ফ্রি হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!',
        'full_description'   => "🌱 ৩০ প্রকার সবজির বীজ – মাত্র ২৭০ টাকা!\n🚛 সারাদেশে ক্যাশ অন হোম ডেলিভারি চার্জ সম্পূর্ণ ফ্রি 💥\n✨💸 অগ্রিম কোনো টাকা দিতে হবে না – হাতে পেয়ে দেখে মূল্য পরিশোধ করুন!\n\nআমাদের প্রতিটি বীজ পরীক্ষিত ও উন্নত জাতের, অঙ্কুরোদগম হার ৯০%+, ফলন বেশি। এক প্যাকেজেই আপনার পরিবার ও ছাদবাগানের সারা বছরের সবজির চাহিদা পূরণ হবে ইনশাআল্লাহ।\n\n🛍️ প্রতিটি বীজ আলাদা আলাদা এয়ারটাইট জিপার ব্যাগে থাকবে এবং বীজের নাম সুস্পষ্টভাবে লেখা থাকবে।\n\n📦 ৩০ প্রকার কম্বো প্যাকেজে যা যা পাচ্ছেন:\n১. চায়না স্ট্রবেরি - ২০ পিস\n২. সাম্মাম বিন - ৮ পিস\n৩. বিটরুট - ১৫ পিস\n৪. পুদিনা পাতা - ১৫ পিস\n৫. লাল তরমুজ - ৫ পিস\n৬. বোম্বাই মরিচ - ৮ পিস\n৭. হাইব্রিড ঢেরস - ১৫ পিস\n৮. লম্বা মরিচ - ৩০ পিস\n৯. লাল গাজর - ২০ পিস\n১০. কুমরা - ৮ পিস\n১১. হাইব্রিড বাঙ্গি - ৮ পিস\n১২. কলমি শাক - ২০ পিস\n১৩. করলা - ১০ পিস\n১৪. লাল শাক - ৫০ পিস\n১৫. লালমুলা - ২০ পিস\n১৬. কেরালা শিম - ৫ পিস\n১৭. হাইব্রিড লাউ - ৬ পিস\n১৮. পালং শাক - ৩০ পিস\n১৯. হাইব্রিড শসা - ৭ পিস\n২০. চাল কুমড়া - ১০ পিস\n২১. বারি মরিচ - ৩০ পিস\n২২. ধনিয়া বীজ - ৩০ পিস\n২৩. বাঁশড্যাটা শাক - ৫০ পিস\n২৪. পুইশাক - ১৫ পিস\n২৫. বরবটি বীজ - ১০ পিস\n২৬. হাইব্রিড শিম - ৭ পিস\n২৭. সূর্যমুখী বীজ - ১০ পিস\n২৮. বড় গাঁদা ফুল - ১৫ পিস\n২৯. বিটকফি - ২০ পিস\n৩০. ভুট্টার বীজ - ৮ পিস\n\n👉 জার্মিনেশন রেট ৯০%+ 😲\n🌱 আর দেরি না করে আপনার প্যাকেজটি এখনি অর্ডার করুন!",
        'stock'              => 1500,
        'available_stock'    => 1500,
        'in_stock'           => 1,
        'is_hidden'          => 0,
        'position'           => 0,
        'package_tiers'      => [
            [
                'id'               => 'pkg-1',
                'name'             => '১ প্যাকেট',
                'quantity'         => 1,
                'regular_price'    => 350,
                'offer_price'      => 270,
                'delivery_charge'  => 0,
                'is_free_delivery' => true,
                'badge'            => 'জনপ্রিয়'
            ],
            [
                'id'               => 'pkg-2',
                'name'             => '২ প্যাকেট',
                'quantity'         => 2,
                'regular_price'    => 700,
                'offer_price'      => 500,
                'delivery_charge'  => 0,
                'is_free_delivery' => true,
                'badge'            => 'ডাবল অফার'
            ],
            [
                'id'               => 'pkg-3',
                'name'             => '৫ প্যাকেট',
                'quantity'         => 5,
                'regular_price'    => 1750,
                'offer_price'      => 999,
                'delivery_charge'  => 0,
                'is_free_delivery' => true,
                'badge'            => 'মেগা সেভার'
            ]
        ],
        'highlight_features' => '৩০ প্রকার সেরা সবজি ও ফলের বীজ মাত্র ২৭০ টাকায় • হোম ডেলিভারি চার্জ সম্পূর্ণ ফ্রি • অগ্রিম টাকা ছাড়াই ক্যাশ অন ডেলিভারি',
        'trust_card_1_title' => 'নিশ্চিন্তে অর্ডার করুন',
        'trust_card_1_text'  => 'অর্ডার দেওয়ার পর আমাদের প্রতিনিধি আপনাকে কল করে বিস্তারিত আলোচনা করবেন এবং তারপরই অর্ডারটি কনফার্ম করা হবে। কোনো প্রশ্ন বা জিজ্ঞাসা থাকলে তখনই জেনে নিতে পারবেন।',
        'trust_card_2_title' => '🤝 আমাদের প্রতিশ্রুতি',
        'trust_card_2_text'  => 'আমরা সরাসরি সেরা জাতের সতেজ ও উচ্চ অঙ্কুরোদগমের বীজ সরবরাহ করছি। হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন।',
        'created_at'         => date('c'),
        'updated_at'         => date('c')
    ];

    $prodColumns = [
        'id', 'name', 'slug', 'sku', 'product_image', 'image_gallery',
        'regular_price', 'offer_price', 'buying_price', 'category', 'categories',
        'subcategory', 'tag', 'tags', 'short_description', 'full_description',
        'stock', 'available_stock', 'in_stock', 'is_hidden', 'position',
        'package_tiers', 'highlight_features', 'trust_card_1_title', 'trust_card_1_text',
        'trust_card_2_title', 'trust_card_2_text', 'created_at', 'updated_at'
    ];

    $stmt = $pdo->query("DESCRIBE `products`");
    $tableCols = $stmt ? $stmt->fetchAll(PDO::FETCH_COLUMN) : [];
    $validCols = array_intersect($prodColumns, $tableCols);

    $insertFields = [];
    $insertPlaceholders = [];
    $updateAssignments = [];
    $params = [];

    foreach ($validCols as $col) {
        $val = $comboProd[$col] ?? null;
        if (is_array($val) || is_object($val)) {
            $val = json_encode($val, JSON_UNESCAPED_UNICODE);
        } elseif (is_bool($val)) {
            $val = $val ? 1 : 0;
        }
        $insertFields[] = "`$col`";
        $insertPlaceholders[] = ":$col";
        $updateAssignments[] = "`$col` = VALUES(`$col`)";
        $params[":$col"] = $val;
    }

    $fieldsStr = implode(', ', $insertFields);
    $placeholdersStr = implode(', ', $insertPlaceholders);
    $updateStr = implode(', ', $updateAssignments);

    $upsertSql = "INSERT INTO `products` ($fieldsStr) VALUES ($placeholdersStr) ON DUPLICATE KEY UPDATE $updateStr";
    $upsertStmt = $pdo->prepare($upsertSql);
    $upsertStmt->execute($params);
    $report['actions'][] = "Synced 30-combo-package product into MySQL database successfully";
} catch (Exception $e) {
    $report['actions'][] = "Combo product sync note: " . $e->getMessage();
}

// Return fresh product columns for verification
try {
    $stmt = $pdo->query("DESCRIBE `products`");
    $report['final_products_columns'] = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
} catch (Exception $e) {}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
