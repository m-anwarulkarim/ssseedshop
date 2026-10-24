<?php
// api/settings/sms_api.php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/sms_helper.php';

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-api-key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$action = $input['action'] ?? '';

function getSetting($key) {
    try {
        $row = DB::find('settings', $key, 'key');
        if (!empty($row['value'])) return $row['value'];
    } catch (\Throwable $e) {}

    $json_file = __DIR__ . '/../database/settings.json';
    if (file_exists($json_file)) {
        $settings = json_decode(file_get_contents($json_file), true) ?: [];
        foreach ($settings as $s) {
            if (($s['key'] ?? '') === $key) return $s['value'] ?? '';
        }
    }
    return '';
}

$ecomahKey = getSetting('ecomah_api_key');
if (empty($ecomahKey)) {
    $ecomahKey = getenv('ECOMAH_API_KEY') ?: '';
}

if ($action === 'check_balance') {
    if (empty($ecomahKey)) {
        http_response_code(400);
        echo json_encode(['error' => 'Ecomah SMS API Key not configured']);
        exit;
    }

    $bal = ecomah_check_balance($ecomahKey);
    if ($bal && is_array($bal)) {
        echo json_encode([
            'success'       => true,
            'balance'       => $bal,
            'sms_remaining' => $bal['sms']['remaining'] ?? 0,
            'sms_limit'     => $bal['sms']['limit'] ?? 0,
            'sms_used'      => $bal['sms']['used'] ?? 0,
            'label'         => $bal['label'] ?? 'Connected'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(502);
        echo json_encode(['error' => 'ব্যালেন্স চেক ব্যর্থ (গেটওয়ে সংযোগে সমস্যা)']);
    }
    exit;
}

if ($action === 'send_sms') {
    if (empty($ecomahKey)) {
        http_response_code(400);
        echo json_encode(['error' => 'Ecomah SMS API Key not configured']);
        exit;
    }

    $number = trim($input['number'] ?? $input['phone'] ?? '');
    $message = trim($input['message'] ?? '');
    $reason = trim($input['reason'] ?? 'manual');

    if (empty($number) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'ফোন নম্বর ও মেসেজ প্রয়োজন']);
        exit;
    }

    $res = ecomah_send_sms($ecomahKey, $number, $message);

    // Record into sms_logs
    try {
        DB::insert('sms_logs', [
            'id'        => 'sms_' . substr(md5(uniqid(mt_rand(), true)), 0, 10),
            'order_id'  => $input['order_id'] ?? null,
            'phone'     => $number,
            'status'    => !empty($res['success']) ? 'sent' : 'failed',
            'reason'    => $reason,
            'message'   => $message,
            'sent'      => !empty($res['success']),
            'result'    => $res['result'] ?? null,
            'gateway'   => $res['result'] ?? null,
            'timestamp' => date('c')
        ]);
    } catch (\Throwable $e) {}

    if (!empty($res['success'])) {
        echo json_encode([
            'success' => true,
            'result'  => $res['result'] ?? ['msg' => 'SMS sent successfully']
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => $res['result']['error'] ?? $res['error'] ?? 'SMS পাঠাতে ব্যর্থ',
            'details' => $res['result'] ?? null
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
