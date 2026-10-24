<?php
// api/products/update.php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$updated_count = 0;
$updated_data = null;

// Check if array of multiple updates (e.g., bulk position updates)
if (isset($input[0]) && is_array($input[0])) {
    foreach ($input as $update) {
        if (isset($update['id'])) {
            $id = (string)$update['id'];
            if (isset($update['stock'])) {
                $update['stock'] = (int)$update['stock'];
                $update['available_stock'] = $update['stock'];
                $update['in_stock'] = $update['stock'] > 0;
            }
            DB::update('products', $update, $id);
            $updated_count++;
        }
    }
} else {
    // Single update
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required for update']);
        exit;
    }
    $id = (string)$input['id'];
    if (isset($input['stock'])) {
        $input['stock'] = (int)$input['stock'];
        $input['available_stock'] = $input['stock'];
        $input['in_stock'] = $input['stock'] > 0;
    }
    DB::update('products', $input, $id);
    $updated_data = DB::find('products', $id);
    $updated_count = 1;
}

echo json_encode([
    'status' => 'success',
    'updated_count' => $updated_count,
    'data' => $updated_data
], JSON_UNESCAPED_UNICODE);
?>
