<?php
// api/orders/delete.php
// Ss Seed Shop Order Deletion API (Soft & Permanent Deletion, Single & Batch)

require_once __DIR__ . '/../db.php';

$json_file = __DIR__ . '/../database/orders.json';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$target_id  = $input['id'] ?? $_GET['id'] ?? null;
$target_ids = $input['ids'] ?? null;
$permanent  = isset($input['permanent']) ? filter_var($input['permanent'], FILTER_VALIDATE_BOOLEAN) : (isset($_GET['permanent']) ? filter_var($_GET['permanent'], FILTER_VALIDATE_BOOLEAN) : false);

if (!$target_id && (!is_array($target_ids) || empty($target_ids))) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID or array of IDs is required for deletion']);
    exit();
}

$ids_to_delete = is_array($target_ids) ? array_map('strval', $target_ids) : [(string)$target_id];
$ids_to_delete = array_values(array_filter($ids_to_delete));

if (empty($ids_to_delete)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid IDs provided']);
    exit();
}

$deleted_count = 0;
$now = date('c');

$pdo = DB::pdo();
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
        // Fallback to json if SQL fails
    }
}

// Sync to JSON backup
if (file_exists($json_file)) {
    $orders = json_decode(file_get_contents($json_file), true) ?: [];
    $json_deleted = 0;
    if ($permanent) {
        $orders = array_values(array_filter($orders, function($o) use ($ids_to_delete, &$json_deleted) {
            $oid   = (string)($o['id'] ?? '');
            $ocode = (string)($o['order_id'] ?? '');
            if (in_array($oid, $ids_to_delete, true) || in_array($ocode, $ids_to_delete, true)) {
                $json_deleted++;
                return false;
            }
            return true;
        }));
    } else {
        foreach ($orders as $k => $o) {
            $oid   = (string)($o['id'] ?? '');
            $ocode = (string)($o['order_id'] ?? '');
            if (in_array($oid, $ids_to_delete, true) || in_array($ocode, $ids_to_delete, true)) {
                $orders[$k]['is_deleted'] = true;
                $orders[$k]['updated_at'] = $now;
                $json_deleted++;
            }
        }
    }
    DB::atomicWriteJson($json_file, $orders);
    if ($deleted_count === 0) {
        $deleted_count = $json_deleted;
    }
}

echo json_encode([
    'status'        => 'success',
    'success'       => true,
    'deleted_count' => $deleted_count,
    'permanent'     => $permanent,
    'is_deleted'    => !$permanent
], JSON_UNESCAPED_UNICODE);
?>
