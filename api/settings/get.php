<?php
// api/settings/get.php
// Ss Seed Shop - Optimized High-Performance Settings API
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');
if (isset($_GET['admin']) || isset($_GET['_t']) || isset($_GET['nocache'])) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    header_remove('Pragma');
    header_remove('Expires');
    header('Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
}

$pdo = DB::pdo();

// 1. Single key query (Indexed Primary Key lookup)
if (isset($_GET['key'])) {
    $target_key = trim($_GET['key']);
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `settings` WHERE `key` = ? LIMIT 1");
            $stmt->execute([$target_key]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode($row, JSON_UNESCAPED_UNICODE);
                exit;
            }
        } catch (Exception $e) {}
    } else {
        $settings = DB::all('settings');
        foreach ($settings as $s) {
            if (($s['key'] ?? '') === $target_key) {
                echo json_encode($s, JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }
    echo json_encode(['key' => $target_key, 'value' => null]);
    exit;
}

// 2. Multiple keys query (comma-separated, indexed IN clause)
if (isset($_GET['keys'])) {
    $keys = array_values(array_filter(array_map('trim', explode(',', $_GET['keys']))));
    if (empty($keys)) {
        echo json_encode([]);
        exit;
    }
    if ($pdo) {
        try {
            $placeholders = implode(',', array_fill(0, count($keys), '?'));
            $stmt = $pdo->prepare("SELECT * FROM `settings` WHERE `key` IN ($placeholders)");
            $stmt->execute($keys);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            echo json_encode($rows, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {}
    } else {
        $settings = DB::all('settings');
        $filtered = [];
        foreach ($settings as $s) {
            if (in_array($s['key'] ?? '', $keys, true)) {
                $filtered[] = $s;
            }
        }
        echo json_encode(array_values($filtered), JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 3. All settings fetch
$include_ledger = isset($_GET['include_ledger']) && ($_GET['include_ledger'] === '1' || $_GET['include_ledger'] === 'true');

if ($pdo) {
    try {
        if ($include_ledger) {
            $stmt = $pdo->query("SELECT * FROM `settings`");
        } else {
            $stmt = $pdo->query("SELECT * FROM `settings` WHERE `key` NOT IN ('agroseed_ledger_entries_v2', 'agroseed_ledger_meta_v2') AND `key` NOT LIKE 'ledger_%'");
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {}
}

$settings = DB::all('settings');
if (!$include_ledger) {
    $settings = array_filter($settings, function($s) {
        $k = $s['key'] ?? '';
        return $k !== 'agroseed_ledger_entries_v2' && $k !== 'agroseed_ledger_meta_v2' && !str_starts_with($k, 'ledger_');
    });
}

echo json_encode(array_values($settings), JSON_UNESCAPED_UNICODE);
?>