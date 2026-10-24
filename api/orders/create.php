<?php
// api/orders/create.php
// Pure MySQL Order Creation & Customer Synchronization

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['status' => 'error', 'error' => 'Invalid JSON input']);
    exit;
}

// Generate unique 5-digit Order ID (like 84729)
$new_order_id = (string)rand(10000, 99999);
while (true) {
    $existing_order = DB::find('orders', $new_order_id, 'order_id');
    if (!$existing_order) {
        break;
    }
    $new_order_id = (string)rand(10000, 99999);
}

// Normalize phone
$phone_raw = $input['phone'] ?? '';
$clean_phone = preg_replace('/[^0-9]/', '', (string)$phone_raw);
if (strlen($clean_phone) > 11 && str_starts_with($clean_phone, '88')) {
    $clean_phone = substr($clean_phone, 2);
}

// Link or create customer profile in MySQL customers table
$profile_id = $input['profile_id'] ?? $input['customer_id'] ?? null;
$customer_name = trim($input['customer_name'] ?? '');
$address = trim($input['address'] ?? '');
$alt_phone = trim($input['alt_phone'] ?? '');

$existing_cust = null;
if (!empty($profile_id)) {
    $existing_cust = DB::find('customers', $profile_id, 'id');
}
if (!$existing_cust && !empty($clean_phone)) {
    $existing_cust = DB::find('customers', $clean_phone, 'phone');
    if ($existing_cust) {
        $profile_id = $existing_cust['id'];
    }
}

if ($existing_cust) {
    // Update existing customer info if missing
    $update_cust = [];
    if (empty($existing_cust['name']) && !empty($customer_name)) {
        $update_cust['name'] = $customer_name;
    }
    if (empty($existing_cust['address']) && !empty($address)) {
        $update_cust['address'] = $address;
    }
    if (empty($existing_cust['alt_phone']) && !empty($alt_phone)) {
        $update_cust['alt_phone'] = $alt_phone;
    }
    if (!empty($update_cust)) {
        $update_cust['updated_at'] = date('c');
        DB::update('customers', $update_cust, $existing_cust['id']);
    }
} elseif (!empty($clean_phone)) {
    // Auto-create customer profile for order delivery tracking
    $profile_id = 'cust_' . substr(md5(uniqid($clean_phone . mt_rand(), true)), 0, 12);
    $new_cust = [
        'id'             => $profile_id,
        'phone'          => $clean_phone,
        'name'           => $customer_name ?: 'কাস্টমার',
        'email'          => $input['email'] ?? '',
        'avatar_url'     => '',
        'alt_phone'      => $alt_phone ?: null,
        'phone_verified' => 0,
        'district'       => $input['district'] ?? null,
        'thana'          => $input['thana'] ?? null,
        'address'        => $address ?: null,
        'gender'         => null,
        'age'            => null,
        'bio'            => null,
        'username'       => 'guest_' . substr($clean_phone, -4),
        'auth_provider'  => 'guest',
        'created_at'     => date('c'),
        'updated_at'     => date('c'),
        'last_login'     => null
    ];
    DB::insert('customers', $new_cust);
}

// Build order data
$order_data = [
    'id'              => uniqid(),
    'order_id'        => $new_order_id,
    'customer_name'   => $customer_name,
    'phone'           => $clean_phone ?: $phone_raw,
    'address'         => $address,
    'alt_phone'       => $alt_phone ?: null,
    'note'            => $input['note'] ?? null,
    'total_amount'    => $input['total_amount'] ?? 0,
    'delivery_charge' => $input['delivery_charge'] ?? 0,
    'discount'        => $input['discount'] ?? 0,
    'subtotal'        => $input['subtotal'] ?? 0,
    'items'           => $input['items'] ?? [],
    'payment_method'  => $input['payment_method'] ?? 'cash_on_delivery',
    'status'          => !empty($input['status']) ? $input['status'] : 'pending',
    'pre_date'        => $input['pre_date'] ?? null,
    'payment_status'  => $input['payment_status'] ?? 'pending',
    'traffic_source'  => $input['traffic_source'] ?? 'direct',
    'created_by_admin_id'    => $input['created_by_admin_id'] ?? null,
    'last_status_changed_by' => $input['last_status_changed_by'] ?? null,
    'created_at'      => date('c'),
    'updated_at'      => date('c')
];

DB::insert('orders', $order_data);

// Decrease stock from products in MySQL
if (isset($input['items']) && is_array($input['items'])) {
    foreach ($input['items'] as $item) {
        $pid = $item['product_id'] ?? null;
        $qty = (int)($item['quantity'] ?? 0);
        if ($pid && $qty > 0) {
            $p = DB::find('products', (string)$pid);
            if ($p) {
                $new_stock = max(0, (int)($p['stock'] ?? 0) - $qty);
                DB::update('products', ['stock' => $new_stock, 'available_stock' => $new_stock, 'in_stock' => $new_stock > 0], (string)$pid);
            }
        }
    }
}

// Clean up matching incomplete orders in MySQL
if (!empty($clean_phone)) {
    $pdo = DB::pdo();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `incomplete_orders` WHERE `phone` = ? OR `phone` = ?");
            $stmt->execute([$clean_phone, $phone_raw]);
        } catch (Exception $e) {}
    }
}

echo json_encode([
    'status'     => 'success',
    'success'    => true,
    'data'       => $order_data,
    'profile_id' => $profile_id
], JSON_UNESCAPED_UNICODE);
?>
