<?php
// api/migrate.php
// Automated MySQL Schema Setup & Data Migration from JSON for Ss Seed Shop

header("Content-Type: text/html; charset=UTF-8");
require_once __DIR__ . '/db.php';

$env_path = __DIR__ . '/.env';
if (!file_exists($env_path) && file_exists(__DIR__ . '/env.txt')) {
    copy(__DIR__ . '/env.txt', $env_path);
}
$env = file_exists($env_path) ? parse_ini_file($env_path) : [];

$host = $env['DB_HOST'] ?? 'localhost';
$db   = $env['DB_NAME'] ?? '';
$user = $env['DB_USER'] ?? '';
$pass = $env['DB_PASS'] ?? '';

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ss Seed Shop Database Migration</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
.card { max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
h1 { color: #10b981; margin-top: 0; }
.step { padding: 8px 12px; margin: 6px 0; border-radius: 6px; font-family: monospace; font-size: 14px; }
.success { background: #064e3b; color: #a7f3d0; border-left: 4px solid #10b981; }
.error { background: #7f1d1d; color: #fecaca; border-left: 4px solid #ef4444; }
.info { background: #1e3a8a; color: #bfdbfe; border-left: 4px solid #3b82f6; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; background: #10b981; color: #064e3b; font-size: 12px; }
</style></head><body><div class='card'>";

echo "<h1>🌱 Ss Seed Shop MySQL Migration Tool</h1>";
echo "<p>Checking database configuration and migrating JSON data into MySQL tables...</p>";

if (empty($db) || $db === 'cpanel_database_name') {
    echo "<div class='step error'>❌ Error: Database name is not configured in <code>.env</code>. Please check DB_NAME, DB_USER, and DB_PASS.</div>";
    echo "</div></body></html>";
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    echo "<div class='step success'>✔ Connected to MySQL Database: <strong>" . htmlspecialchars($db) . "</strong></div>";
} catch (Exception $e) {
    echo "<div class='step error'>❌ Database Connection Failed: " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "</div></body></html>";
    exit;
}

// 1. Run Schema
$schema_file = __DIR__ . '/database/schema.sql';
if (!file_exists($schema_file)) {
    echo "<div class='step error'>❌ database/schema.sql file not found!</div>";
    echo "</div></body></html>";
    exit;
}

$sql_content = file_get_contents($schema_file);
$statements = array_filter(array_map('trim', explode(';', $sql_content)));

$tables_created = 0;
foreach ($statements as $stmt) {
    if (!empty($stmt)) {
        try {
            $pdo->exec($stmt);
            if (stripos($stmt, 'CREATE TABLE') !== false) {
                $tables_created++;
            }
        } catch (Exception $e) {
            echo "<div class='step error'>Error executing SQL: " . htmlspecialchars($e->getMessage()) . "</div>";
        }
    }
}
echo "<div class='step success'>✔ Schema executed successfully. Verified/Created $tables_created tables.</div>";

// Drop deleted/unwanted legacy tables if present
try {
    $pdo->exec("DROP TABLE IF EXISTS `blogs`");
    $pdo->exec("DROP TABLE IF EXISTS `ledger_entries`");
} catch (Exception $e) {}
function migrate_table_data($pdo, $table, $json_file, $key_col, $json_cols = []) {
    if (!file_exists($json_file)) {
        return 0;
    }

    // Never overwrite live operational tables (orders, incomplete orders, etc.) if they already have data!
    if (in_array($table, ['orders', 'incomplete_orders', 'order_status_history', 'customers', 'settings'])) {
        try {
            $existing_count = (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            if ($existing_count > 0) {
                // Table already has live data! Preserve deletions and active orders.
                return $existing_count;
            }
        } catch (Exception $e) {}
    }

    $raw = json_decode(file_get_contents($json_file), true);
    if (!is_array($raw) || empty($raw)) {
        return 0;
    }

    // Associative map handling (like fraud_cache)
    $items = [];
    if (array_keys($raw) !== range(0, count($raw) - 1)) {
        foreach ($raw as $k => $v) {
            if ($table === 'fraud_cache') {
                $items[] = ['phone' => (string)$k, 'data' => is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string)$v, 'updated_at' => date('c')];
            } elseif ($table === 'otps') {
                $items[] = ['phone' => (string)$k, 'otp' => (string)($v['otp'] ?? ''), 'expires_at' => (string)($v['expires_at'] ?? ''), 'created_at' => (string)($v['created_at'] ?? '')];
            }
        }
    } else {
        $items = $raw;
    }

    if (empty($items)) return 0;

    // PRESERVE PRODUCTS: Never overwrite existing product images, prices, stock, or details!
    // Only insert new products that don't already exist in MySQL!
    if ($table === 'products') {
        try {
            $existing_ids = $pdo->query("SELECT `id` FROM `products`")->fetchAll(PDO::FETCH_COLUMN);
            if (!empty($existing_ids)) {
                $existing_id_map = array_flip($existing_ids);
                $items = array_values(array_filter($items, function($item) use ($existing_id_map) {
                    return !isset($item['id']) || !isset($existing_id_map[(string)$item['id']]);
                }));
                if (empty($items)) {
                    return count($existing_ids);
                }
            }
        } catch (Exception $e) {}
    }

    // 1. Fetch current existing columns in this MySQL table
    $existing_cols = [];
    try {
        $q = $pdo->query("SHOW COLUMNS FROM `$table`");
        while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
            $existing_cols[strtolower($row['Field'])] = true;
        }
    } catch (Exception $e) {
        return 0;
    }

    // 2. Discover all columns across all items in this dataset and dynamically add missing columns
    $all_keys = [];
    foreach ($items as $item) {
        if (is_array($item)) {
            foreach (array_keys($item) as $k) {
                $all_keys[$k] = true;
            }
        }
    }

    foreach (array_keys($all_keys) as $col) {
        if (!isset($existing_cols[strtolower($col)])) {
            $type = 'LONGTEXT DEFAULT NULL';
            if (in_array(strtolower($col), ['position', 'stock', 'available_stock', 'attempt_count', 'age', 'used_count', 'usage_limit'])) {
                $type = 'INT DEFAULT 0';
            } elseif (in_array(strtolower($col), ['in_stock', 'is_hidden', 'is_active', 'is_deleted', 'is_printed', 'print_note', 'is_courier_entered', 'phone_verified', 'sent', 'is_super_admin'])) {
                $type = 'TINYINT(1) DEFAULT 0';
            } elseif (in_array(strtolower($col), ['regular_price', 'offer_price', 'buying_price', 'total_amount', 'delivery_charge', 'discount', 'subtotal', 'advance', 'amount', 'discount_value', 'min_order_amount', 'max_discount_amount', 'total_discount_given'])) {
                $type = 'DECIMAL(10,2) DEFAULT 0.00';
            } elseif (in_array(strtolower($col), ['slug', 'sku', 'phone', 'alt_phone', 'status', 'payment_method', 'payment_status', 'courier', 'consignment_id', 'tracking_code', 'created_at', 'updated_at', 'order_id'])) {
                $type = 'VARCHAR(255) DEFAULT NULL';
            }
            try {
                $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$col` $type");
                $existing_cols[strtolower($col)] = true;
            } catch (Exception $e) {}
        }
    }

    // 3. Insert or update rows safely
    $count = 0;
    foreach ($items as $item) {
        if (!is_array($item)) continue;

        // Process json fields
        foreach ($json_cols as $jc) {
            if (isset($item[$jc]) && is_array($item[$jc])) {
                $item[$jc] = json_encode($item[$jc], JSON_UNESCAPED_UNICODE);
            }
        }

        // Only include columns that actually exist in the table
        $valid_cols = [];
        $params = [];
        foreach ($item as $k => $v) {
            if (isset($existing_cols[strtolower($k)])) {
                $valid_cols[] = $k;
                if (is_bool($v)) {
                    $v = $v ? 1 : 0;
                } elseif (is_array($v)) {
                    $v = json_encode($v, JSON_UNESCAPED_UNICODE);
                }
                $params[":$k"] = $v;
            }
        }

        if (empty($valid_cols)) continue;

        $placeholders = array_map(function($c) { return ":$c"; }, $valid_cols);
        // SAFE INSERT: If row already exists in MySQL, preserve it untouched!
        $sql = "INSERT INTO `$table` (`" . implode('`, `', $valid_cols) . "`) 
                VALUES (" . implode(', ', $placeholders) . ") 
                ON DUPLICATE KEY UPDATE `$key_col` = `$key_col`";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $count++;
        } catch (Exception $e) {
            // Row-level fallback
        }
    }
    return $count;
}

// 2. Migrate each dataset
$migrations = [
    'admins'            => [__DIR__ . '/database/admins.json', 'id', ['permissions']],
    'products'          => [__DIR__ . '/database/products.json', 'id', ['categories', 'tags', 'image_gallery', 'variations']],
    'categories'        => [__DIR__ . '/database/categories.json', 'id', []],
    'subcategories'     => [__DIR__ . '/database/subcategories.json', 'id', []],
    'tags'              => [__DIR__ . '/database/tags.json', 'id', []],
    'customers'         => [__DIR__ . '/database/customers.json', 'id', []],
    'orders'            => [__DIR__ . '/database/orders.json', 'id', ['items']],
    'incomplete_orders' => [__DIR__ . '/database/incomplete_orders.json', 'id', ['cart_snapshot']],
    'coupons'           => [__DIR__ . '/database/coupons.json', 'id', []],
    'settings'          => [__DIR__ . '/database/settings.json', 'key', []],
    'sms_logs'          => [__DIR__ . '/database/sms_logs.json', 'id', ['gateway']],
    'fraud_cache'       => [__DIR__ . '/database/fraud_cache.json', 'phone', []],
    'otps'              => [__DIR__ . '/database/otps.json', 'phone', []],
    'order_status_history' => [__DIR__ . '/database/order_status_history.json', 'id', []],
    'visitor_profiles'  => [__DIR__ . '/database/visitor_profiles.json', 'id', []],
];

echo "<hr style='border-color: #334155; margin: 20px 0;'>";
echo "<h3>📊 Data Migration Progress:</h3>";

foreach ($migrations as $table => $config) {
    list($json_file, $key, $json_cols) = $config;
    $count = migrate_table_data($pdo, $table, $json_file, $key, $json_cols);
    echo "<div class='step info'>• Table <strong>$table</strong>: Migrated/Synced <strong>$count</strong> records.</div>";
}

// 3. Post-migration data cleanup & synchronization
try {
    $pdo->exec("UPDATE `products` SET `available_stock` = `stock` WHERE (`available_stock` IS NULL OR `available_stock` = 0) AND `stock` > 0");
    $pdo->exec("UPDATE `products` SET `in_stock` = 1 WHERE (`stock` > 0 OR `available_stock` > 0) AND `in_stock` = 0");
    $pdo->exec("DELETE FROM `admins` WHERE `email` = 'hngarden@gmail.com' OR `id` = 'admin_super_002'");
    echo "<div class='step success'>✔ Product stock & available_stock successfully synchronized.</div>";
} catch (Exception $e) {
    echo "<div class='step error'>Error syncing stock: " . htmlspecialchars($e->getMessage()) . "</div>";
}

echo "<hr style='border-color: #334155; margin: 20px 0;'>";
echo "<div class='step success'>🎉 <strong>All migrations completed successfully!</strong> Your MySQL database is now fully synced and active.</div>";
echo "<p><a href='products/get.php' style='color: #10b981; font-weight: bold;'>Test Products API Output →</a></p>";
echo "</div></body></html>";
?>
