<?php
// api/products/delete.php
// Product Deletion API (Single & Batch Support, POST & DELETE Methods)
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'Method not allowed. Use POST or DELETE.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$target_id  = $input['id'] ?? $_POST['id'] ?? $_GET['id'] ?? null;
$target_ids = $input['ids'] ?? $_POST['ids'] ?? null;

if (!$target_id && (!is_array($target_ids) || empty($target_ids))) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'Product ID or array of IDs is required for deletion']);
    exit();
}

$ids_to_delete = is_array($target_ids) ? array_map('strval', $target_ids) : [(string)$target_id];
$ids_to_delete = array_values(array_filter($ids_to_delete));

if (empty($ids_to_delete)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'No valid product IDs provided']);
    exit();
}

$pdo = DB::pdo();
$deleted_count = 0;

if ($pdo) {
    try {
        $placeholders = implode(',', array_fill(0, count($ids_to_delete), '?'));
        $stmt = $pdo->prepare("DELETE FROM `products` WHERE `id` IN ($placeholders)");
        $stmt->execute($ids_to_delete);
        $deleted_count = $stmt->rowCount();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'error'   => 'Database error during deletion: ' . $e->getMessage()
        ]);
        exit();
    }
} else {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'success' => false,
        'error'   => 'Database connection not available'
    ]);
    exit();
}

echo json_encode([
    'status'        => 'success',
    'success'       => true,
    'id'            => $target_id,
    'deleted_count' => $deleted_count,
    'message'       => 'Product(s) deleted successfully'
], JSON_UNESCAPED_UNICODE);
?>
