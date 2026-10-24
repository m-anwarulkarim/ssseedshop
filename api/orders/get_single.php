<?php
require_once __DIR__ . '/../db.php';
$json_file = '../database/orders.json';

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit;
}

if (file_exists($json_file)) {
    $orders = json_decode(file_get_contents($json_file), true);
    foreach ($orders as $o) {
        if ((string)$o['order_id'] === (string)$id || (string)$o['id'] === (string)$id) {
            echo json_encode($o);
            exit;
        }
    }
}

http_response_code(404);
echo json_encode(['error' => 'Order not found']);
?>
