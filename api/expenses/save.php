<?php
// api/expenses/save.php
// Ss Seed Shop Expenses & Income Ledger Persistence API
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$now = date('c');

function upsertSetting($key, $value) {
    global $now;
    $existing = DB::find('settings', $key, 'key');
    $val_str = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
    if ($existing) {
        $existing['value'] = $val_str;
        $existing['updated_at'] = $now;
        DB::update('settings', $existing, $existing['id']);
    } else {
        DB::insert('settings', [
            'id'         => uniqid('set_'),
            'key'        => $key,
            'value'      => $val_str,
            'created_at' => $now,
            'updated_at' => $now
        ]);
    }
}

$updated = [];

if (isset($input['entries'])) {
    upsertSetting('agroseed_ledger_entries_v2', $input['entries']);
    $updated[] = 'entries';
}

if (isset($input['meta'])) {
    upsertSetting('agroseed_ledger_meta_v2', $input['meta']);
    $updated[] = 'meta';
}

echo json_encode([
    'status'  => 'success',
    'success' => true,
    'message' => 'Expenses data saved successfully',
    'updated' => $updated
], JSON_UNESCAPED_UNICODE);
?>
