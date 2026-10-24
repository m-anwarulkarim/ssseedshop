<?php
// api/settings/sms_api.php
// SMS API Service (Disabled by user request)

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-api-key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'success' => false,
    'error'   => 'SMS API is disabled',
    'message' => 'SMS API has been disabled by administrator.'
], JSON_UNESCAPED_UNICODE);
exit;
