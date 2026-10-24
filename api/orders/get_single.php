<?php
// api/orders/get_single.php
require_once __DIR__ . '/../db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit;
}

$order = DB::find('orders', $id, 'id') ?: DB::find('orders', $id, 'order_id');
if ($order) {
    echo json_encode($order, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Order not found']);
?>
