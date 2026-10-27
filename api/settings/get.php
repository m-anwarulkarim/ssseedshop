<?php
// api/settings/get.php
// AgroSeed Settings Fetch API

require_once __DIR__ . '/../db.php';
$json_file = __DIR__ . '/../database/settings.json';

header('Content-Type: application/json; charset=utf-8');
if (isset($_GET['admin']) || isset($_GET['_t']) || isset($_GET['nocache'])) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    header('Cache-Control: public, max-age=300, stale-while-revalidate=1800');
}

$settings = DB::all('settings');

// Single key query
if (isset($_GET['key'])) {
    $target_key = trim($_GET['key']);
    foreach ($settings as $s) {
        if (($s['key'] ?? '') === $target_key) {
            echo json_encode($s, JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    echo json_encode(['key' => $target_key, 'value' => null]);
    exit;
}

// Multiple keys query (comma-separated)
if (isset($_GET['keys'])) {
    $keys = array_map('trim', explode(',', $_GET['keys']));
    $filtered = [];
    foreach ($settings as $s) {
        if (in_array($s['key'] ?? '', $keys, true)) {
            $filtered[] = $s;
        }
    }
    echo json_encode(array_values($filtered), JSON_UNESCAPED_UNICODE);
    exit;
}

// All settings
// Exclude heavy admin internal accounting keys (176KB+) from generic public fetch to keep payload tiny (<7KB)
$include_ledger = isset($_GET['include_ledger']) && ($_GET['include_ledger'] === '1' || $_GET['include_ledger'] === 'true');
if (!$include_ledger) {
    $settings = array_filter($settings, function($s) {
        $k = $s['key'] ?? '';
        return $k !== 'agroseed_ledger_entries_v2' && $k !== 'agroseed_ledger_meta_v2';
    });
}

if (isset($_GET['admin']) || isset($_GET['_t']) || isset($_GET['nocache'])) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    header_remove('Pragma');
    header_remove('Expires');
    header('Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
}
echo json_encode(array_values($settings), JSON_UNESCAPED_UNICODE);
