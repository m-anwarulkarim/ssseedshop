<?php
// api/database/export_seed_sql.php
// Generates seed.sql with all current data from JSON files

$output_file = __DIR__ . '/seed.sql';
$fp = fopen($output_file, 'w');

fwrite($fp, "-- ========================================================\n");
fwrite($fp, "-- AgroSeed MySQL Initial Data Seed\n");
fwrite($fp, "-- Generated: " . date('Y-m-d H:i:s') . "\n");
fwrite($fp, "-- ========================================================\n\n");
fwrite($fp, "SET NAMES utf8mb4;\n");
fwrite($fp, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

function escape_val($val) {
    if (is_null($val)) return 'NULL';
    if (is_bool($val)) return $val ? '1' : '0';
    if (is_int($val) || is_float($val)) return $val;
    if (is_array($val)) $val = json_encode($val, JSON_UNESCAPED_UNICODE);
    return "'" . addslashes((string)$val) . "'";
}

$tables = [
    'admins'            => [__DIR__ . '/admins.json', ['permissions']],
    'products'          => [__DIR__ . '/products.json', ['categories', 'tags', 'image_gallery', 'variations']],
    'categories'        => [__DIR__ . '/categories.json', []],
    'subcategories'     => [__DIR__ . '/subcategories.json', []],
    'tags'              => [__DIR__ . '/tags.json', []],
    'customers'         => [__DIR__ . '/customers.json', []],
    'orders'            => [__DIR__ . '/orders.json', ['items']],
    'incomplete_orders' => [__DIR__ . '/incomplete_orders.json', ['cart_snapshot']],
    'coupons'           => [__DIR__ . '/coupons.json', []],
    'settings'          => [__DIR__ . '/settings.json', []],
    'blogs'             => [__DIR__ . '/blogs.json', []],
    'sms_logs'          => [__DIR__ . '/sms_logs.json', ['gateway']],
    'fraud_cache'       => [__DIR__ . '/fraud_cache.json', []],
    'otps'              => [__DIR__ . '/otps.json', []],
    'ledger_entries'    => [__DIR__ . '/ledger_entries.json', []],
    'order_status_history' => [__DIR__ . '/order_status_history.json', []],
    'visitor_profiles'  => [__DIR__ . '/visitor_profiles.json', []],
];

foreach ($tables as $table => $config) {
    list($json_file, $json_cols) = $config;
    if (!file_exists($json_file)) continue;

    $raw = json_decode(file_get_contents($json_file), true);
    if (!is_array($raw) || empty($raw)) continue;

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

    if (empty($items)) continue;

    fwrite($fp, "-- Table: $table\n");
    foreach ($items as $item) {
        if (!is_array($item)) continue;
        foreach ($json_cols as $jc) {
            if (isset($item[$jc]) && is_array($item[$jc])) {
                $item[$jc] = json_encode($item[$jc], JSON_UNESCAPED_UNICODE);
            }
        }

        $cols = array_keys($item);
        $vals = array_map('escape_val', array_values($item));

        $sql = "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $vals) . ") ON DUPLICATE KEY UPDATE `id`=`id`;\n";
        if ($table === 'settings') {
            $sql = "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $vals) . ") ON DUPLICATE KEY UPDATE `key`=`key`;\n";
        } elseif ($table === 'fraud_cache' || $table === 'otps') {
            $sql = "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $vals) . ") ON DUPLICATE KEY UPDATE `phone`=`phone`;\n";
        }
        fwrite($fp, $sql);
    }
    fwrite($fp, "\n");
}

fwrite($fp, "SET FOREIGN_KEY_CHECKS = 1;\n");
fclose($fp);

echo "Successfully exported seed.sql (" . filesize($output_file) . " bytes)\n";
?>
