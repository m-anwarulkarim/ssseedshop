<?php
// api/orders/notify.php
// Ss Seed Shop Order Notification (SMS disabled by user request)

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-api-key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$order_id = trim($input['order_id'] ?? $input['id'] ?? ($_GET['order_id'] ?? ''));

echo json_encode([
    'status'   => 'success',
    'success'  => true,
    'sms_sent' => false,
    'message'  => 'SMS notification service is disabled',
    'data'     => [
        'order_id'    => $order_id,
        'sms_sent'    => false,
        'should_send' => false
    ]
], JSON_UNESCAPED_UNICODE);
exit();
