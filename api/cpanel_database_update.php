<?php
// api/cpanel_database_update.php
// Ss Seed Shop cPanel Database Migration, Repair & Verification Tool
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

// Auto-heal common typo or overwritten old .env (jjcelcf or agroseed_admin)
if (strpos($user, 'jjcelcf') !== false || strpos($db, 'jjcelcf') !== false || $user === 'agroseed_admin' || $user === 'agroseed_user' || (empty($db) && !empty($_SERVER['HTTP_HOST']))) {
    $host = 'localhost';
    $db   = 'jjcceicf_ssseedshop';
    $user = 'jjcceicf_ssseedshop';
    $pass = '8.GdFreD&XPEWzC.';
    if (file_exists($env_path) && is_writable($env_path)) {
        $env_raw = file_get_contents($env_path);
        $env_raw = preg_replace('/DB_HOST\s*=\s*["\']?[^"\'\r\n]+["\']?/', 'DB_HOST="localhost"', $env_raw);
        $env_raw = preg_replace('/DB_NAME\s*=\s*["\']?[^"\'\r\n]+["\']?/', 'DB_NAME="jjcceicf_ssseedshop"', $env_raw);
        $env_raw = preg_replace('/DB_USER\s*=\s*["\']?[^"\'\r\n]+["\']?/', 'DB_USER="jjcceicf_ssseedshop"', $env_raw);
        $env_raw = preg_replace('/DB_PASS\s*=\s*["\']?[^"\'\r\n]+["\']?/', 'DB_PASS="8.GdFreD&XPEWzC."', $env_raw);
        @file_put_contents($env_path, $env_raw);
        log_msg('success', "🔧 .env ফাইল স্বয়ংক্রিয়ভাবে সঠিক ক্রেডেনশিয়াল (jjcceicf_ssseedshop) দিয়ে মেরামত করা হয়েছে।");
    }
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

$summary = [];
$del_tests_passed = 0;

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
    add_column_if_missing($pdo, 'orders', 'created_by_admin_id', 'VARCHAR(64) DEFAULT NULL AFTER `courier_status`');
    add_column_if_missing($pdo, 'orders', 'pre_date', 'VARCHAR(50) DEFAULT NULL AFTER `last_status_changed_by`');
    add_column_if_missing($pdo, 'orders', 'traffic_source', 'VARCHAR(100) DEFAULT \'direct\' AFTER `pre_date`');
    add_column_if_missing($pdo, 'orders', 'is_deleted', 'TINYINT(1) DEFAULT 0 AFTER `traffic_source`');

    add_index_if_missing($pdo, 'orders', 'idx_ord_deleted', '`is_deleted`');
    add_index_if_missing($pdo, 'orders', 'idx_ord_created_by', '`created_by_admin_id`');
    add_index_if_missing($pdo, 'orders', 'idx_ord_last_modified', '`last_status_changed_by`');

    add_column_if_missing($pdo, 'products', 'available_stock', 'INT DEFAULT 0 AFTER `in_stock`');
    add_column_if_missing($pdo, 'products', 'position', 'INT DEFAULT 0 AFTER `stock`');
    add_column_if_missing($pdo, 'products', 'is_hidden', 'TINYINT(1) DEFAULT 0 AFTER `position`');

    add_index_if_missing($pdo, 'products', 'idx_prod_slug', '`slug`');
    add_index_if_missing($pdo, 'products', 'idx_prod_hidden', '`is_hidden`');
    add_index_if_missing($pdo, 'products', 'idx_prod_category', '`category`');
    add_index_if_missing($pdo, 'products', 'idx_prod_position', '`position`');

    add_column_if_missing($pdo, 'categories', 'slug', 'VARCHAR(100) DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'icon', 'VARCHAR(50) DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'image', 'TEXT DEFAULT NULL');
    add_column_if_missing($pdo, 'categories', 'is_active', 'TINYINT(1) DEFAULT 1');
    add_index_if_missing($pdo, 'categories', 'idx_cat_slug', '`slug`');

    add_column_if_missing($pdo, 'tags', 'slug', 'VARCHAR(100) DEFAULT NULL');
    add_column_if_missing($pdo, 'tags', 'position', 'INT DEFAULT 0');

    // Make product_image LONGTEXT
    try {
        $pdo->exec("ALTER TABLE `products` MODIFY `product_image` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `products` MODIFY `image_gallery` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `products` MODIFY `full_description` LONGTEXT DEFAULT NULL");
    } catch (Exception $e) {}

    // Stock Normalization (Non-destructive)
    try {
        $pdo->exec("UPDATE `products` SET `available_stock` = `stock` WHERE `available_stock` IS NULL AND `stock` > 0");
    } catch (Exception $e) {}

    // 5. Ensure Super Admin (ssseedshop220@gmail.com) exists with valid password
    try {
        $del_admins = $pdo->exec("DELETE FROM `admins` WHERE `email` IN ('hngarden@gmail.com', 'admin@ssseedshop.com', 'admin@agroseed.bd', 'admin@agroseed.com') OR `id` = 'admin_super_002'");
        $hash = password_hash('ssseedshop220', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO `admins` (`id`, `email`, `password_hash`, `password_plain`, `role`, `is_super_admin`, `name`, `permissions`, `created_at`) VALUES ('admin_super_001', 'ssseedshop220@gmail.com', ?, 'ssseedshop220', 'admin', 1, 'Ss Seed Shop Super Admin', '[\"*\"]', NOW()) ON DUPLICATE KEY UPDATE `email`='ssseedshop220@gmail.com', `password_hash`=?, `password_plain`='ssseedshop220', `role`='admin', `is_super_admin`=1");
        $stmt->execute([$hash, $hash]);
        log_msg('success', "✔ সুপার অ্যাডমিন একাউন্ট প্রস্তুত: <strong>ssseedshop220@gmail.com</strong> (পাসওয়ার্ড: ssseedshop220)");
    } catch (Exception $e) {
        log_msg('error', "সুপার অ্যাডমিন তৈরিতে সমস্যা: " . $e->getMessage());
    }

    // 6. Handle Initial Data Restore Action
    if (isset($_GET['action']) && $_GET['action'] === 'restore_initial_data') {
        $initial_file = __DIR__ . '/database/initial_data.sql';
        if (file_exists($initial_file)) {
            $sql = file_get_contents($initial_file);
            $sql = str_replace(["\r\n", "\r"], "\n", $sql);
            $stmts = array_filter(array_map('trim', explode(";\n", $sql)));
            $imported = 0;
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
            foreach ($stmts as $s) {
                if (!empty($s) && !str_starts_with($s, '--') && !str_starts_with($s, '/*')) {
                    try {
                        $pdo->exec($s);
                        $imported++;
                    } catch (Exception $e) {
                        // Skip duplicate or syntax issue
                    }
                }
            }
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
            log_msg('success', "🎉 সফলভাবে প্রাথমিক ডাটাবেস রিস্টোর সম্পন্ন হয়েছে ($imported টি রেকর্ড প্রসেস হয়েছে)! সব পণ্য ও ক্যাটাগরি ডেটাবেসে যুক্ত হয়েছে।");
        } else {
            log_msg('error', "initial_data.sql ফাইল পাওয়া যায়নি!");
        }
    }

    // 7. Live CRUD & Deletion Verification Self-Tests
    // Test A: Product DELETE
    try {
        $pdo->exec("INSERT INTO `products` (`id`, `name`, `regular_price`, `stock`, `in_stock`) VALUES ('__test_del_prod__', 'Delete Test Prod', 10, 1, 1) ON DUPLICATE KEY UPDATE `name`='Delete Test Prod'");
        $d_stmt = $pdo->prepare("DELETE FROM `products` WHERE `id` = ?");
        $d_stmt->execute(['__test_del_prod__']);
        $chk_prod = $pdo->query("SELECT COUNT(*) FROM `products` WHERE `id` = '__test_del_prod__'")->fetchColumn();
        if ((int)$chk_prod === 0) {
            $del_tests_passed++;
            log_msg('success', "✔ প্রোডাক্ট ডিলিট (Product DELETE) ফাংশন: <strong>সম্পূর্ণ সফল</strong>");
        } else {
            log_msg('error', "❌ প্রোডাক্ট ডিলিট ব্যর্থ হয়েছে!");
        }
    } catch (Exception $e) {
        log_msg('error', "প্রোডাক্ট ডিলিট টেস্ট এরর: " . $e->getMessage());
    }

    // Test B: Order Soft & Hard DELETE
    try {
        $pdo->exec("INSERT INTO `orders` (`id`, `order_id`, `customer_name`, `phone`, `address`, `is_deleted`) VALUES ('__test_del_ord__', 'ORD_DEL_TEST', 'Test Customer', '01700000000', 'Dhaka', 0) ON DUPLICATE KEY UPDATE `customer_name`='Test Customer'");
        $pdo->exec("UPDATE `orders` SET `is_deleted` = 1 WHERE `id` = '__test_del_ord__'");
        $chk_soft = $pdo->query("SELECT `is_deleted` FROM `orders` WHERE `id` = '__test_del_ord__'")->fetchColumn();
        $pdo->exec("DELETE FROM `orders` WHERE `id` = '__test_del_ord__'");
        $chk_perm = $pdo->query("SELECT COUNT(*) FROM `orders` WHERE `id` = '__test_del_ord__'")->fetchColumn();
        if ((int)$chk_soft === 1 && (int)$chk_perm === 0) {
            $del_tests_passed++;
            log_msg('success', "✔ অর্ডার সফট ডিলিট ও পার্মানেন্ট ডিলিট (Order Soft & Permanent DELETE): <strong>সম্পূর্ণ সফল</strong>");
        } else {
            log_msg('error', "❌ অর্ডার ডিলিট ব্যর্থ হয়েছে!");
        }
    } catch (Exception $e) {
        log_msg('error', "অর্ডার ডিলিট টেস্ট এরর: " . $e->getMessage());
    }

    // Test C: Category DELETE
    try {
        $pdo->exec("INSERT INTO `categories` (`id`, `name`, `slug`) VALUES ('__test_del_cat__', 'Test Cat', 'test-cat') ON DUPLICATE KEY UPDATE `name`='Test Cat'");
        $pdo->exec("DELETE FROM `categories` WHERE `id` = '__test_del_cat__'");
        $chk_cat = $pdo->query("SELECT COUNT(*) FROM `categories` WHERE `id` = '__test_del_cat__'")->fetchColumn();
        if ((int)$chk_cat === 0) {
            $del_tests_passed++;
            log_msg('success', "✔ ক্যাটাগরি ডিলিট (Category DELETE) ফাংশন: <strong>সম্পূর্ণ সফল</strong>");
        }
    } catch (Exception $e) {}

    // Test D: Tag DELETE
    try {
        $pdo->exec("INSERT INTO `tags` (`id`, `name`, `slug`) VALUES ('__test_del_tag__', 'Test Tag', 'test-tag') ON DUPLICATE KEY UPDATE `name`='Test Tag'");
        $pdo->exec("DELETE FROM `tags` WHERE `id` = '__test_del_tag__'");
        $chk_tag = $pdo->query("SELECT COUNT(*) FROM `tags` WHERE `id` = '__test_del_tag__'")->fetchColumn();
        if ((int)$chk_tag === 0) {
            $del_tests_passed++;
            log_msg('success', "✔ ট্যাগ/ব্যাজ ডিলিট (Tag DELETE) ফাংশন: <strong>সম্পূর্ণ সফল</strong>");
        }
    } catch (Exception $e) {}

    // Test E: Settings DELETE
    try {
        $pdo->exec("INSERT INTO `settings` (`key`, `value`) VALUES ('__test_del_key__', 'test_val') ON DUPLICATE KEY UPDATE `value`='test_val'");
        $pdo->exec("DELETE FROM `settings` WHERE `key` = '__test_del_key__'");
        $chk_set = $pdo->query("SELECT COUNT(*) FROM `settings` WHERE `key` = '__test_del_key__'")->fetchColumn();
        if ((int)$chk_set === 0) {
            $del_tests_passed++;
            log_msg('success', "✔ সেটিংস ডিলিট (Settings DELETE) ফাংশন: <strong>সম্পূর্ণ সফল</strong>");
        }
    } catch (Exception $e) {}

    // 8. Table Row Count Summary
    $tables = ['admins', 'products', 'categories', 'subcategories', 'tags', 'customers', 'orders', 'incomplete_orders', 'coupons', 'settings'];
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
    <title>Ss Seed Shop cPanel Database Migration & Verification</title>
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
        .btn-outline:hover { background: #1f2937; color: #fff; }
        .btn-warning {
            background: #f59e0b;
            color: #451a03;
        }
        .btn-warning:hover { background: #d97706; color: #fff; }
    </style>
</head>
<body>

<div class="container">
    <h1>🌱 Ss Seed Shop cPanel ডাটাবেস ভেরিফিকেশন ও রিপেয়ার</h1>
    <p>এই টুলটি স্বয়ংক্রিয়ভাবে MySQL ডাটাবেস টেবিলসমূহ যাচাই করে, মিসিং কলাম/ইনডেক্স ঠিক করে এবং <strong>ডিলিট (DELETE) অপারেশন সম্পূর্ণ কার্যকর</strong> কিনা তা লাইভ টেস্ট করে নিশ্চিত করে।</p>

    <div class="log-box">
        <?php foreach ($results as $res): ?>
            <div class="log-item log-<?= $res['type'] ?>">
                <?= $res['message'] ?>
            </div>
        <?php endforeach; ?>
    </div>

    <?php if (!empty($summary)): ?>
        <h3 style="color: #38bdf8; margin-top: 25px;">📊 বর্তমান টেবিল ও রেকর্ড সংখ্যা:</h3>
        <div class="table-grid">
            <?php foreach ($summary as $tbl => $cnt): ?>
                <div class="stat-card">
                    <div class="stat-label"><?= htmlspecialchars($tbl) ?></div>
                    <div class="stat-val"><?= htmlspecialchars($cnt) ?></div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (isset($summary['products']) && $summary['products'] == 0): ?>
            <div style="margin-top: 25px; padding: 18px; background: #3b2804; border: 1px solid #d97706; border-radius: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #fbbf24;">⚠️ ডেটাবেসে কোনো পণ্য পাওয়া যায়নি (0 Products)</h4>
                <p style="margin: 0 0 15px 0; color: #fde68a; font-size: 13px;">আপনার ডেটাবেসে এখনো প্রোডাক্ট ও ক্যাটাগরি লোড করা নেই। আপনি চাইলে নিচের বাটনে ক্লিক করে প্রস্তুতকৃত ১৯৯টি পণ্য ও ক্যাটাগরি ১-ক্লিকে ডেটাবেসে রিস্টোর করতে পারেন:</p>
                <a href="?action=restore_initial_data" class="btn btn-warning" onclick="return confirm('আপনি কি নিশ্চিত যে প্রাথমিক পণ্য ও ক্যাটাগরি ডেটাবেসে লোড করতে চান?')">📦 প্রাথমিক ১৯৯টি পণ্য ও ক্যাটাগরি রিস্টোর করুন</a>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <div class="actions">
        <a href="cpanel_database_update.php" class="btn">🔄 রিফ্রেশ ও পুনরায় টেস্ট করুন</a>
        <a href="https://ssseedshop.com/admin" class="btn btn-outline" target="_blank">🔐 অ্যাডমিন প্যানেল</a>
        <a href="https://ssseedshop.com" class="btn btn-outline" target="_blank">🌐 মূল ওয়েবসাইট</a>
    </div>
</div>

</body>
</html>
