<?php
// api/cpanel_database_update.php
// Ss Seed Shop cPanel Database Migration & Optimization Tool
// Access via browser: https://api.ssseedshop.com/cpanel_database_update.php

ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: text/html; charset=UTF-8");

require_once __DIR__ . '/db.php';

$env_path = __DIR__ . '/.env';
$env = file_exists($env_path) ? parse_ini_file($env_path) : [];

$host = $env['DB_HOST'] ?? 'localhost';
$db   = $env['DB_NAME'] ?? '';
$user = $env['DB_USER'] ?? '';
$pass = $env['DB_PASS'] ?? '';

$results = [];
$error_count = 0;
$success_count = 0;

function log_msg($type, $msg) {
    global $results, $error_count, $success_count;
    if ($type === 'error') $error_count++;
    if ($type === 'success') $success_count++;
    $results[] = ['type' => $type, 'message' => $msg];
}

// 1. Check Connection
$pdo = null;
if (empty($db) || $db === 'cpanel_database_name') {
    log_msg('error', "ডাটাবেস নাম কনফিগার করা হয়নি! api/.env ফাইলে DB_NAME ঠিক করুন।");
} else {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        log_msg('success', "MySQL ডাটাবেসের সাথে সফলভাবে সংযোগ স্থাপিত হয়েছে: <strong>" . htmlspecialchars($db) . "</strong>");
    } catch (Exception $e) {
        log_msg('error', "ডাটাবেস সংযোগ ব্যর্থ: " . htmlspecialchars($e->getMessage()));
    }
}

if ($pdo) {
    // 2. Execute Base Schema (CREATE TABLE IF NOT EXISTS)
    $schema_file = __DIR__ . '/database/schema.sql';
    if (file_exists($schema_file)) {
        $sql = file_get_contents($schema_file);
        $stmts = array_filter(array_map('trim', explode(';', $sql)));
        $tbl_count = 0;
        foreach ($stmts as $stmt) {
            if (!empty($stmt)) {
                try {
                    $pdo->exec($stmt);
                    if (stripos($stmt, 'CREATE TABLE') !== false) {
                        $tbl_count++;
                    }
                } catch (Exception $e) {
                    // Ignore already existing objects
                }
            }
        }
        log_msg('success', "বেস স্কিমা সফলভাবে এক্সিকিউট হয়েছে। ($tbl_count টি টেবিল ভেরিফাইড)");
    }

    // 3. Helper to add column if not exists
    function add_column_if_missing($pdo, $table, $column, $definition) {
        try {
            $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
            $stmt->execute([$column]);
            if ($stmt->rowCount() === 0) {
                $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
                log_msg('success', "টেবিল `{$table}`-এ নতুন কলাম যোগ করা হয়েছে: `{$column}`");
                return true;
            }
        } catch (Exception $e) {
            log_msg('error', "`{$table}` কলাম চেকিং এরর: " . htmlspecialchars($e->getMessage()));
        }
        return false;
    }

    // Helper to add index if not exists
    function add_index_if_missing($pdo, $table, $index_name, $column_def) {
        try {
            $stmt = $pdo->prepare("SHOW INDEX FROM `$table` WHERE Key_name = ?");
            $stmt->execute([$index_name]);
            if ($stmt->rowCount() === 0) {
                $pdo->exec("ALTER TABLE `$table` ADD INDEX `$index_name` ($column_def)");
                log_msg('success', "টেবিল `{$table}`-এ ইনডেক্স তৈরি করা হয়েছে: `{$index_name}` ($column_def)");
                return true;
            }
        } catch (Exception $e) {
            // Index might already exist or column missing
        }
        return false;
    }

    // 4. Schema Enhancements & Missing Columns
    // A. Orders Table
    add_column_if_missing($pdo, 'orders', 'created_by_admin_id', 'VARCHAR(64) DEFAULT NULL AFTER `courier_status`');
    add_column_if_missing($pdo, 'orders', 'pre_date', 'VARCHAR(50) DEFAULT NULL AFTER `last_status_changed_by`');
    add_column_if_missing($pdo, 'orders', 'traffic_source', 'VARCHAR(100) DEFAULT \'direct\' AFTER `pre_date`');
    add_column_if_missing($pdo, 'orders', 'is_deleted', 'TINYINT(1) DEFAULT 0 AFTER `traffic_source`');

    add_index_if_missing($pdo, 'orders', 'idx_ord_deleted', '`is_deleted`');
    add_index_if_missing($pdo, 'orders', 'idx_ord_created_by', '`created_by_admin_id`');
    add_index_if_missing($pdo, 'orders', 'idx_ord_last_modified', '`last_status_changed_by`');

    // B. Products Table
    add_column_if_missing($pdo, 'products', 'available_stock', 'INT DEFAULT 0 AFTER `in_stock`');
    add_column_if_missing($pdo, 'products', 'position', 'INT DEFAULT 0 AFTER `stock`');
    add_column_if_missing($pdo, 'products', 'is_hidden', 'TINYINT(1) DEFAULT 0 AFTER `position`');

    add_index_if_missing($pdo, 'products', 'idx_prod_slug', '`slug`');
    add_index_if_missing($pdo, 'products', 'idx_prod_hidden', '`is_hidden`');
    add_index_if_missing($pdo, 'products', 'idx_prod_category', '`category`');
    add_index_if_missing($pdo, 'products', 'idx_prod_position', '`position`');

    // C. Categories Table
    add_column_if_missing($pdo, 'categories', 'slug', 'VARCHAR(100) DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'icon', 'VARCHAR(50) DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'image', 'TEXT DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'is_active', 'TINYINT(1) DEFAULT 1');
    add_index_if_missing($pdo, 'categories', 'idx_cat_slug', '`slug`');

    // D. Tags Table
    add_column_if_missing($pdo, 'tags', 'slug', 'VARCHAR(100) DEFAULT NULL');
    add_column_if_missing($pdo, 'tags', 'position', 'INT DEFAULT 0');

    // Make product_image LONGTEXT if it's currently limited
    try {
        $pdo->exec("ALTER TABLE `products` MODIFY `product_image` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `products` MODIFY `image_gallery` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `products` MODIFY `full_description` LONGTEXT DEFAULT NULL");
    } catch (Exception $e) {}

    // 5. Stock Normalization (Run once here, NOT on every GET request!)
    try {
        $synced_stock = $pdo->exec("UPDATE `products` SET `available_stock` = `stock` WHERE (`available_stock` IS NULL OR `available_stock` = 0) AND `stock` > 0");
        $synced_instock = $pdo->exec("UPDATE `products` SET `in_stock` = 1 WHERE (`stock` > 0 OR `available_stock` > 0) AND `in_stock` = 0");
        $synced_outstock = $pdo->exec("UPDATE `products` SET `in_stock` = 0, `available_stock` = 0 WHERE `stock` <= 0");
        log_msg('info', "স্টক ডাটা সিনক্রোনাইজ করা হয়েছে। (স্টক আউট ফিক্স সম্পন্ন)");
    } catch (Exception $e) {
        log_msg('error', "স্টক সিঙ্ক এরর: " . htmlspecialchars($e->getMessage()));
    }

    // Ensure removed admin account hngarden@gmail.com is purged from MySQL
    try {
        $del_admins = $pdo->exec("DELETE FROM `admins` WHERE `email` = 'hngarden@gmail.com' OR `id` = 'admin_super_002'");
        if ($del_admins > 0) {
            log_msg('success', "✔ অপ্রয়োজনীয় অ্যাডমিন একাউন্ট (hngarden@gmail.com) ডাটাবেস থেকে সম্পূর্ণ মুছে ফেলা হয়েছে।");
        }
    } catch (Exception $e) {}

    // Drop deleted/unwanted legacy tables (blogs, expenses/ledger_entries)
    try {
        $pdo->exec("DROP TABLE IF EXISTS `blogs`");
        $pdo->exec("DROP TABLE IF EXISTS `ledger_entries`");
        log_msg('success', "✔ অপ্রয়োজনীয় টেবিল (`blogs`, `ledger_entries`) ডাটাবেস থেকে সম্পূর্ণ মুছে ফেলা হয়েছে।");
    } catch (Exception $e) {}

    // 6. Inspect heavy base64 product images
    try {
        $stmt = $pdo->query("SELECT `id`, `name`, LENGTH(`product_image`) as img_len FROM `products` WHERE `product_image` LIKE 'data:image%'");
        $heavy_prods = $stmt->fetchAll();
        if (!empty($heavy_prods)) {
            $count = count($heavy_prods);
            $details = [];
            foreach ($heavy_prods as $hp) {
                $kb = round($hp['img_len'] / 1024, 1);
                $details[] = htmlspecialchars($hp['name']) . " ({$kb} KB)";
            }
            log_msg('info', "⚠️ সতর্কবার্তা: $count টি পণ্যে Base64 ইমেজ পাওয়া গেছে যা লোডিং ধীর করে: " . implode(', ', $details));
        } else {
            log_msg('success', "✔ কোনো ক্ষতিকর ভারী Base64 ছবি পাওয়া যায়নি। সব ইমেজ লিংক হিসেবে আছে।");
        }
    } catch (Exception $e) {}

    // 7. Verify & Sync SMS Gateway
    require_once __DIR__ . '/settings/sms_helper.php';
    try {
        $stmt = $pdo->prepare("SELECT `value` FROM `settings` WHERE `key` = 'ecomah_api_key' LIMIT 1");
        $stmt->execute();
        $key_row = $stmt->fetch();
        $ecomah_key = $key_row['value'] ?? '';
        if (!empty($ecomah_key)) {
            $bal = ecomah_check_balance($ecomah_key);
            if ($bal && !empty($bal['success'])) {
                $rem = $bal['sms']['remaining'] ?? 0;
                $limit = $bal['sms']['limit'] ?? 0;
                $used = $bal['sms']['used'] ?? 0;
                log_msg('success', "📱 E-COMAH SMS গেটওয়ে সক্রিয় ও সংযুক্ত! অবশিষ্ট SMS: <strong>{$rem}</strong> টি (ব্যবহৃত: {$used}, মোট কোটা: {$limit})");
            } else {
                log_msg('error', "⚠️ E-COMAH SMS ব্যালেন্স সংযোগে সমস্যা। গেটওয়ে রেসপন্স: " . json_encode($bal, JSON_UNESCAPED_UNICODE));
            }
        } else {
            log_msg('info', "ℹ️ E-COMAH SMS API Key কনফিগার করা হয়নি। এডমিন প্যানেল থেকে যোগ করুন।");
        }
    } catch (Exception $e) {
        log_msg('error', "SMS গেটওয়ে টেস্ট এরর: " . htmlspecialchars($e->getMessage()));
    }

    // 8. Handle Live MySQL -> JSON Sync if requested
    if (isset($_GET['action']) && $_GET['action'] === 'sync_json') {
        $sync_tables = [
            'admins'            => ['permissions'],
            'products'          => ['categories', 'tags', 'image_gallery', 'variations'],
            'categories'        => [],
            'subcategories'     => [],
            'tags'              => [],
            'customers'         => [],
            'orders'            => ['items'],
            'incomplete_orders' => ['cart_snapshot'],
            'coupons'           => [],
            'settings'          => [],
            'sms_logs'          => ['gateway'],
        ];
        $synced_count = 0;
        foreach ($sync_tables as $st => $jcols) {
            try {
                $stmt = $pdo->query("SELECT * FROM `$st`");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as &$r) {
                    foreach ($jcols as $jc) {
                        if (isset($r[$jc]) && is_string($r[$jc])) {
                            $dec = json_decode($r[$jc], true);
                            if (json_last_error() === JSON_ERROR_NONE) $r[$jc] = $dec;
                        }
                    }
                    if (isset($r['in_stock'])) $r['in_stock'] = (bool)$r['in_stock'];
                    if (isset($r['is_hidden'])) $r['is_hidden'] = (bool)$r['is_hidden'];
                }
                $target_file = __DIR__ . "/database/{$st}.json";
                file_put_contents($target_file, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                $synced_count++;
            } catch (Exception $e) {}
        }
        log_msg('success', "💾 সফলভাবে $synced_count টি MySQL টেবিল থেকে লেটেস্ট ডাটা (ইমেজ, অর্ডার ও সেটিংস) লোকাল JSON ব্যাকআপে সিঙ্ক করা হয়েছে!");
    }

    // 9. Table Row Count Summary
    $tables = ['admins', 'products', 'categories', 'customers', 'orders', 'incomplete_orders', 'coupons', 'settings', 'sms_logs'];
    $summary = [];
    foreach ($tables as $t) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$t`");
            $row = $stmt->fetch();
            $summary[$t] = $row['cnt'] ?? 0;
        } catch (Exception $e) {
            $summary[$t] = 'N/A';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ss Seed Shop cPanel Database Migration & Optimization</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            margin: 0;
            padding: 30px 15px;
            display: flex;
            justify-content: center;
        }
        .container {
            max-width: 850px;
            width: 100%;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        h1 {
            color: #10b981;
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 24px;
        }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .log-box {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .log-item {
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-family: monospace;
        }
        .log-success { background: #064e3b; color: #a7f3d0; border-left: 4px solid #10b981; }
        .log-error { background: #7f1d1d; color: #fecaca; border-left: 4px solid #ef4444; }
        .log-info { background: #1e3a8a; color: #bfdbfe; border-left: 4px solid #3b82f6; }
        .table-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .stat-card {
            background: #1f2937;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #374151;
            text-align: center;
        }
        .stat-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
        .stat-val { font-size: 20px; font-weight: bold; color: #10b981; margin-top: 4px; }
        .actions {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #1f2937;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        .btn {
            background: #10b981;
            color: #064e3b;
            text-decoration: none;
            font-weight: bold;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            transition: all 0.2s;
            display: inline-block;
        }
        .btn:hover { background: #059669; color: #fff; }
        .btn-outline {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #374151;
        }
        .btn-outline:hover { color: #f1f5f9; border-color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌱 Ss Seed Shop cPanel ডাটাবেস অটো-আপডেট ও অপ্টিমাইজেশন</h1>
        <p>এই টুলটি স্বয়ংক্রিয়ভাবে আপনার MySQL ডাটাবেসের টেবিল স্ট্রাকচার পরীক্ষা করে, মিসিং কলাম ও ইনডেক্স যোগ করে এবং ওয়েবসাইট লোডিং স্পিড বাড়ানোর জন্য ডাটাবেস অপ্টিমাইজ করে।</p>

        <div class="log-box">
            <?php foreach ($results as $r): ?>
                <div class="log-item log-<?= $r['type'] ?>">
                    <span><?= $r['type'] === 'success' ? '✔' : ($r['type'] === 'error' ? '✖' : 'ℹ') ?></span>
                    <div><?= $r['message'] ?></div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (!empty($summary)): ?>
            <h3 style="color: #e2e8f0; margin-top: 25px; font-size: 16px;">📊 ডাটাবেস টেবিল ও রেকর্ড সামারি:</h3>
            <div class="table-grid">
                <?php foreach ($summary as $tbl => $cnt): ?>
                    <div class="stat-card">
                        <div class="stat-label"><?= htmlspecialchars($tbl) ?></div>
                        <div class="stat-val"><?= htmlspecialchars((string)$cnt) ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="actions">
            <a href="cpanel_database_update.php" class="btn">🔄 পুনরায় পরীক্ষা ও স্কিমা আপডেট</a>
            <a href="cpanel_database_update.php?action=sync_json" class="btn btn-outline" style="border-color: #10b981; color: #a7f3d0;">💾 MySQL থেকে JSON ব্যাকআপ সিঙ্ক</a>
            <a href="products/get.php" target="_blank" class="btn btn-outline">⚡ প্রোডাক্ট API টেস্ট করুন</a>
        </div>
    </div>
</body>
</html>
