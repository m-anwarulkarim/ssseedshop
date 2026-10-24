<?php
// api/orders/delete.php
// Ss Seed Shop Order Deletion API (Soft & Permanent Deletion, Single & Batch)
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
$permanent  = isset($input['permanent']) ? filter_var($input['permanent'], FILTER_VALIDATE_BOOLEAN) : (isset($_POST['permanent']) ? filter_var($_POST['permanent'], FILTER_VALIDATE_BOOLEAN) : (isset($_GET['permanent']) ? filter_var($_GET['permanent'], FILTER_VALIDATE_BOOLEAN) : false));

if (!$target_id && (!is_array($target_ids) || empty($target_ids))) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'Order ID or array of IDs is required for deletion']);
    exit();
}

$ids_to_delete = is_array($target_ids) ? array_map('strval', $target_ids) : [(string)$target_id];
$ids_to_delete = array_values(array_filter($ids_to_delete));

if (empty($ids_to_delete)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'No valid order IDs provided']);
    exit();
}

$pdo = DB::pdo();
$deleted_count = 0;
$now = date('c');

if ($pdo) {
    try {
        $placeholders = implode(',', array_fill(0, count($ids_to_delete), '?'));
        if ($permanent) {
            $stmt = $pdo->prepare("DELETE FROM `orders` WHERE `id` IN ($placeholders) OR `order_id` IN ($placeholders)");
            $stmt->execute(array_merge($ids_to_delete, $ids_to_delete));
            $deleted_count = $stmt->rowCount();
        } else {
            $stmt = $pdo->prepare("UPDATE `orders` SET `is_deleted` = 1, `updated_at` = ? WHERE `id` IN ($placeholders) OR `order_id` IN ($placeholders)");
            $stmt->execute(array_merge([$now], $ids_to_delete, $ids_to_delete));
            $deleted_count = $stmt->rowCount();
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'error'   => 'Database error during order deletion: ' . $e->getMessage()
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
    'permanent'     => $permanent,
    'is_deleted'    => !$permanent,
    'message'       => $permanent ? 'Order(s) permanently deleted' : 'Order(s) moved to trash'
], JSON_UNESCAPED_UNICODE);
?>
