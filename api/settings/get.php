<?php
// api/settings/get.php
// Ss Seed Shop Settings Fetch API

require_once __DIR__ . '/../db.php';
$json_file = __DIR__ . '/../database/settings.json';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

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
echo json_encode(array_values($settings), JSON_UNESCAPED_UNICODE);
