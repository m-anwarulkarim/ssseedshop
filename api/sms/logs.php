<?php
// api/sms/logs.php
// SMS Logs API (Disabled by user request)

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-api-key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';
if ($action === 'balance') {
    echo json_encode([
        'success' => false,
        'message' => 'SMS service is disabled'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([], JSON_UNESCAPED_UNICODE);
exit;
