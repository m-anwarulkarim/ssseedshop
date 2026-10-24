<?php
// api/customer/orders.php
// Customer Order History Fetch Endpoint for Ss Seed Shop

require_once __DIR__ . '/../db.php';



if (!function_exists('normalizePhone')) {
    function normalizePhone($phone) {
        $clean = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($clean) > 11 && str_starts_with($clean, '88')) {
            $clean = substr($clean, 2);
        }
        return $clean;
    }
}

// Read inputs from either GET or POST
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: [];
}

$profile_id = $_GET['profile_id'] ?? $_GET['id'] ?? $input['profile_id'] ?? $input['id'] ?? '';
$phone_raw  = $_GET['phone'] ?? $input['phone'] ?? '';
$phone      = normalizePhone($phone_raw);
$email      = strtolower(trim($_GET['email'] ?? $input['email'] ?? ''));

if (empty($phone) && empty($profile_id) && empty($email)) {
    echo json_encode([
        'status'  => 'success',
        'orders'  => [],
        'count'   => 0
    ]);
    exit();
}

$orders = DB::all('orders', 'created_at DESC');

$customer_orders = [];

foreach ($orders as $o) {
    $match = false;

    // 1. Match by phone or alt_phone
    if (!empty($phone)) {
        $order_phone = normalizePhone($o['phone'] ?? '');
        $order_alt   = normalizePhone($o['alt_phone'] ?? '');
        if ($order_phone === $phone || $order_alt === $phone) {
            $match = true;
        }
    }

    // 2. Match by profile_id / customer_id
    if (!$match && !empty($profile_id)) {
        $order_profile = $o['profile_id'] ?? $o['customer_id'] ?? '';
        if ($order_profile === $profile_id) {
            $match = true;
        }
    }

    // 3. Match by email
    if (!$match && !empty($email)) {
        $order_email = strtolower(trim($o['email'] ?? $o['customer_email'] ?? ''));
        if ($order_email === $email) {
            $match = true;
        }
    }

    if ($match) {
        // Exclude soft-deleted orders if flagged
        if (!empty($o['is_deleted'])) {
            continue;
        }
        $customer_orders[] = $o;
    }
}

// Sort by created_at descending (newest first)
usort($customer_orders, function($a, $b) {
    $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
    $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
    return $timeB - $timeA;
});

echo json_encode([
    'status'  => 'success',
    'success' => true,
    'orders'  => $customer_orders,
    'count'   => count($customer_orders)
], JSON_UNESCAPED_UNICODE);
?>
