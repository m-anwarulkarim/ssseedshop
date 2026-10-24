<?php
// api/settings/update.php
// Ss Seed Shop Settings Update & Upsert API

require_once __DIR__ . '/../db.php';


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$settings = DB::all('settings');

$now = date('c');

// Check if array of settings provided
$items_to_save = [];
if (isset($input['settings']) && is_array($input['settings'])) {
    $items_to_save = $input['settings'];
} elseif (is_array($input) && isset($input[0]) && is_array($input[0])) {
    $items_to_save = $input;
} elseif (isset($input['key'])) {
    $items_to_save = [$input];
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Setting key or settings array is required']);
    exit;
}

$updated_count = 0;
$inserted_count = 0;

foreach ($items_to_save as $item) {
    $key = trim($item['key'] ?? '');
    if (!$key) continue;

    $val = $item['value'] ?? null;
    if (is_array($val) || is_object($val)) {
        $val = json_encode($val, JSON_UNESCAPED_UNICODE);
    }

    $found = false;
    foreach ($settings as $k => $s) {
        if (($s['key'] ?? '') === $key) {
            $settings[$k]['value'] = $val;
            $settings[$k]['updated_at'] = $now;
            $found = true;
            $updated_count++;
            break;
        }
    }

    if (!$found) {
        $settings[] = [
            'id'         => $item['id'] ?? uniqid('set_'),
            'key'        => $key,
            'value'      => $val,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $inserted_count++;
    }
}

DB::saveAll('settings', array_values($settings));

echo json_encode([
    'success'  => true,
    'status'   => 'success',
    'message'  => "Settings saved ({$updated_count} updated, {$inserted_count} added)",
    'updated'  => $updated_count,
    'inserted' => $inserted_count
]);
