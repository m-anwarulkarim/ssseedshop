<?php
// api/orders/notify.php
// Ss Seed Shop Order Notification & SMS Alert Dispatcher

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../settings/sms_helper.php';

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-api-key");

$orders_file   = __DIR__ . '/../database/orders.json';
$settings_file = __DIR__ . '/../database/settings.json';

if (!function_exists('cleanPhoneNumber')) {
    function cleanPhoneNumber($phone) {
        $p = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($p) > 11 && str_starts_with($p, '88')) {
            $p = substr($p, 2);
        }
        return $p;
    }
}

if (!function_exists('sanitizeSms')) {
    function sanitizeSms($value) {
        // Strip emojis and normalize spaces
        $clean = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]/u', '', $value);
        return trim(preg_replace('/\s{2,}/u', ' ', $clean));
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS Preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = [];
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
} else {
    $input = $_GET;
}

$order_id   = trim($input['order_id'] ?? $input['id'] ?? '');
$new_status = trim($input['new_status'] ?? $input['status'] ?? 'pending');
$old_status = trim($input['old_status'] ?? '');

if (empty($order_id)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'order_id is required']);
    exit();
}

if (!empty($old_status) && $old_status === $new_status) {
    echo json_encode(['status' => 'skipped', 'success' => true, 'message' => 'Status unchanged']);
    exit();
}

$matched_order = null;
try {
    $matched_order = DB::find('orders', $order_id, 'id') ?: DB::find('orders', $order_id, 'order_id');
} catch (\Throwable $e) {}

$phone         = cleanPhoneNumber($input['phone'] ?? $matched_order['phone'] ?? '');
$customer_name = $input['customer_name'] ?? $matched_order['customer_name'] ?? 'সম্মানিত গ্রাহক';
$total_amount  = $input['total_amount'] ?? $matched_order['total_amount'] ?? 0;
$order_code    = $matched_order['order_id'] ?? $matched_order['id'] ?? $order_id;
$tracking_code = $input['tracking_code'] ?? $matched_order['tracking_code'] ?? '';
$tracking_link = !empty($tracking_code) ? "https://steadfast.com.bd/t/" . urlencode($tracking_code) : "";

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Customer phone number not found']);
    exit();
}

// 2. Read notification settings and templates
$settings_map = [];
try {
    $settings = DB::all('settings');
    foreach ($settings as $s) {
        if (isset($s['key'])) {
            $settings_map[$s['key']] = $s['value'] ?? '';
        }
    }
} catch (\Throwable $e) {}

if (file_exists($settings_file)) {
    $file_settings = json_decode(file_get_contents($settings_file), true) ?: [];
    foreach ($file_settings as $s) {
        if (isset($s['key']) && !isset($settings_map[$s['key']])) {
            $settings_map[$s['key']] = $s['value'] ?? '';
        }
    }
}

$isOn = function($key, $default = true) use ($settings_map) {
    if (!isset($settings_map[$key])) return $default;
    return $settings_map[$key] === 'true' || $settings_map[$key] === true || $settings_map[$key] === '1';
};

$getMsg = function($key, $fallback) use ($settings_map) {
    return !empty($settings_map[$key]) ? $settings_map[$key] : $fallback;
};

$sms_message = null;
$should_send = false;
$reason      = 'status_change';

switch ($new_status) {
    case 'pending':
        $raw_tpl = $getMsg('sms_msg_pending', '{order_id} অর্ডার সফল হয়েছে, মোট {total} টাকা। ধন্যবাদ! - Ss Seed Shop');
        $should_send = $isOn('sms_on_pending', true);
        $reason = 'order_created';
        break;

    case 'confirmed':
        $raw_tpl = $getMsg('sms_msg_confirmed', 'অভিনন্দন! আপনার {order_id} অর্ডারটি কনফার্ম হয়েছে। মোট {total} টাকা। - Ss Seed Shop');
        $should_send = $isOn('sms_on_confirmed', true);
        $reason = 'order_confirmed';
        break;

    case 'delivered':
        $raw_tpl = $getMsg('sms_msg_delivered', 'আপনার {order_id} অর্ডারটি সফলভাবে ডেলিভারি হয়েছে। Ss Seed Shop-এর সাথে থাকার জন্য ধন্যবাদ!');
        $should_send = $isOn('sms_on_delivered', true);
        $reason = 'order_delivered';
        break;

    case 'no_response':
    case 'good_but_no_response':
    case 'busy':
        $raw_tpl = $getMsg('sms_msg_no_response', 'আপনাকে কল করে পাওয়া যায়নি, অনুগ্রহ করে যোগাযোগ করুন। - Ss Seed Shop');
        $should_send = $isOn('sms_on_no_response', true);
        $reason = 'no_response';
        break;

    case 'entry_done':
        $raw_tpl = $getMsg('sms_msg_entry_done', 'আপনার অর্ডার {order_id} কুরিয়ারে বুকিং হয়েছে। {tracking_link} - Ss Seed Shop');
        $should_send = $isOn('sms_on_entry_done', true);
        $reason = 'courier_entry';
        break;

    default:
        $raw_tpl = null;
        $should_send = false;
        break;
}

if (!empty($raw_tpl)) {
    $sms_message = str_replace(
        ['{order_id}', '{total}', '{customer_name}', '{tracking_link}'],
        [$order_code, $total_amount, $customer_name, $tracking_link],
        $raw_tpl
    );
    $sms_message = sanitizeSms($sms_message);
}

// 3. Dispatch SMS if enabled
$sms_sent = false;
$gateway_res = null;

$ecomah_key = $settings_map['ecomah_api_key'] ?? getenv('ECOMAH_API_KEY') ?: '';
if (empty($ecomah_key)) {
    try {
        $row = DB::find('settings', 'ecomah_api_key', 'key');
        if (!empty($row['value'])) $ecomah_key = $row['value'];
    } catch (\Throwable $e) {}
}

if ($should_send && !empty($sms_message) && !empty($phone)) {
    if (!empty($ecomah_key)) {
        $res = ecomah_send_sms($ecomah_key, $phone, $sms_message);
        $sms_sent = !empty($res['success']);
        $gateway_res = $res['result'] ?? ['raw' => $res['raw'] ?? ''];
    } else {
        $sms_sent = false;
        $gateway_res = ['error' => 'API Key not configured'];
    }

    // 4. Record to sms_logs table
    try {
        DB::insert('sms_logs', [
            'id'        => 'sms_' . substr(md5(uniqid(mt_rand(), true)), 0, 10),
            'order_id'  => $order_code,
            'phone'     => $phone,
            'status'    => $new_status,
            'reason'    => $reason,
            'message'   => $sms_message,
            'sent'      => $sms_sent,
            'result'    => $gateway_res,
            'gateway'   => $gateway_res,
            'timestamp' => date('c')
        ]);
    } catch (\Throwable $e) {}
}

echo json_encode([
    'status'   => 'success',
    'success'  => true,
    'sms_sent' => $sms_sent,
    'message'  => $sms_sent ? 'SMS notification sent successfully' : ($should_send ? 'SMS sending failed or skipped' : 'Notification processed without SMS'),
    'data'     => [
        'order_id'    => $order_code,
        'phone'       => $phone,
        'new_status'  => $new_status,
        'sms_message' => $sms_message,
        'should_send' => $should_send,
        'gateway_res' => $gateway_res
    ]
], JSON_UNESCAPED_UNICODE);
exit();
?>
