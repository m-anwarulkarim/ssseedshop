<?php
require_once __DIR__ . '/../db.php';
$json_file = __DIR__ . '/../database/orders.json';
$products_file = __DIR__ . '/../database/products.json';
$customers_file = __DIR__ . '/../database/customers.json';

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

$orders = [];
if (file_exists($json_file)) {
    $orders = json_decode(file_get_contents($json_file), true) ?: [];
}

// Generate sequential Order ID starting from 1001 (e.g. 1001, 1002, 1003...)
function get_next_sequential_order_id(): string {
    $max_seq = 1000;
    
    // 1. Check settings table/file for tracked sequence
    $seq_setting = DB::find('settings', 'next_order_serial', 'key');
    if ($seq_setting && !empty($seq_setting['value']) && is_numeric($seq_setting['value'])) {
        $max_seq = max($max_seq, (int)$seq_setting['value'] - 1);
    }
    
    // 2. Check MySQL database if connected
    $pdo = DB::pdo();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT MAX(CAST(`order_id` AS UNSIGNED)) as max_id FROM `orders` WHERE `order_id` REGEXP '^[0-9]+$' AND CAST(`order_id` AS UNSIGNED) >= 1001 AND CAST(`order_id` AS UNSIGNED) < 20000");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!empty($row['max_id'])) {
                $max_seq = max($max_seq, (int)$row['max_id']);
            }
        } catch (Exception $e) {}
    }
    
    // 3. Check JSON database
    $json_file = __DIR__ . '/../database/orders.json';
    if (file_exists($json_file)) {
        $orders = json_decode(file_get_contents($json_file), true) ?: [];
        foreach ($orders as $o) {
            $oid = $o['order_id'] ?? '';
            if (is_numeric($oid)) {
                $num = (int)$oid;
                if ($num >= 1001 && $num < 20000) {
                    $max_seq = max($max_seq, $num);
                }
            }
        }
    }
    
    $next_id = $max_seq + 1;
    
    // Double-check for uniqueness
    while (true) {
        $existing = DB::find('orders', (string)$next_id, 'order_id');
        if (!$existing) {
            break;
        }
        $next_id++;
    }
    
    // Save next sequence tracker in settings
    try {
        if ($seq_setting) {
            DB::update('settings', ['value' => (string)($next_id + 1), 'updated_at' => date('c')], 'next_order_serial', 'key');
        } else {
            DB::insert('settings', [
                'id'         => 'set_' . uniqid(),
                'key'        => 'next_order_serial',
                'value'      => (string)($next_id + 1),
                'created_at' => date('c'),
                'updated_at' => date('c')
            ]);
        }
    } catch (Exception $e) {}
    
    return (string)$next_id;
}

$new_order_id = get_next_sequential_order_id();

// Normalize phone
$phone_raw = $input['phone'] ?? '';
$clean_phone = preg_replace('/[^0-9]/', '', (string)$phone_raw);
if (strlen($clean_phone) > 11 && str_starts_with($clean_phone, '88')) {
    $clean_phone = substr($clean_phone, 2);
}

// Link or create customer profile in customers.json
$profile_id = $input['profile_id'] ?? $input['customer_id'] ?? null;
$customer_name = trim($input['customer_name'] ?? '');
$address = trim($input['address'] ?? '');
$alt_phone = trim($input['alt_phone'] ?? '');

$customers = [];
if (file_exists($customers_file)) {
    $customers = json_decode(file_get_contents($customers_file), true) ?: [];
}

$matched_customer_idx = -1;
if (!empty($profile_id)) {
    foreach ($customers as $idx => $c) {
        if (($c['id'] ?? '') === $profile_id) {
            $matched_customer_idx = $idx;
            break;
        }
    }
}

if ($matched_customer_idx === -1 && !empty($clean_phone)) {
    foreach ($customers as $idx => $c) {
        $cp = preg_replace('/[^0-9]/', '', $c['phone'] ?? '');
        if (strlen($cp) > 11 && str_starts_with($cp, '88')) $cp = substr($cp, 2);
        if ($cp === $clean_phone) {
            $matched_customer_idx = $idx;
            $profile_id = $c['id'];
            break;
        }
    }
}

if ($matched_customer_idx !== -1) {
    // Update existing customer info if missing
    $existing = $customers[$matched_customer_idx];
    $changed = false;
    if (empty($existing['name']) && !empty($customer_name)) {
        $existing['name'] = $customer_name;
        $changed = true;
    }
    if (empty($existing['address']) && !empty($address)) {
        $existing['address'] = $address;
        $changed = true;
    }
    if (empty($existing['alt_phone']) && !empty($alt_phone)) {
        $existing['alt_phone'] = $alt_phone;
        $changed = true;
    }
    if ($changed) {
        $existing['updated_at'] = date('c');
        $customers[$matched_customer_idx] = $existing;
        file_put_contents($customers_file, json_encode($customers, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
} elseif (!empty($clean_phone)) {
    // Auto-create customer profile (phone_verified = false until they login via OTP)
    $profile_id = 'cust_' . substr(md5(uniqid($clean_phone . mt_rand(), true)), 0, 12);
    $new_cust = [
        'id'             => $profile_id,
        'phone'          => $clean_phone,
        'name'           => $customer_name ?: 'কাস্টমার',
        'email'          => $input['email'] ?? '',
        'avatar_url'     => '',
        'alt_phone'      => $alt_phone ?: null,
        'phone_verified' => false,
        'district'       => $input['district'] ?? null,
        'thana'          => $input['thana'] ?? null,
        'address'        => $address ?: null,
        'gender'         => null,
        'age'            => null,
        'bio'            => null,
        'username'       => 'user_' . substr($clean_phone, -4),
        'auth_provider'  => 'phone',
        'created_at'     => date('c'),
        'updated_at'     => date('c'),
        'last_login'     => null
    ];
    $customers[] = $new_cust;
    file_put_contents($customers_file, json_encode($customers, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Build order data
$order_data = [
    'id'              => uniqid(),
    'order_id'        => $new_order_id,
    'profile_id'      => $profile_id,
    'customer_id'     => $profile_id,
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

// Decrease stock from products
if (isset($input['items']) && is_array($input['items'])) {
    foreach ($input['items'] as $item) {
        $pid = $item['product_id'] ?? null;
        $qty = (int)($item['quantity'] ?? 0);
        if ($pid && $qty > 0) {
            $p = DB::find('products', (string)$pid);
            if ($p) {
                $new_stock = max(0, (int)($p['stock'] ?? 0) - $qty);
                DB::update('products', ['stock' => $new_stock, 'in_stock' => $new_stock > 0], (string)$pid);
            }
        }
    }
}

// Clean up matching incomplete orders by phone
$incomplete_file = __DIR__ . '/../database/incomplete_orders.json';
if (file_exists($incomplete_file) && !empty($clean_phone)) {
    $incomplete_orders = json_decode(file_get_contents($incomplete_file), true) ?: [];
    $filtered_incomplete = array_filter($incomplete_orders, function($io) use ($clean_phone) {
        $ip = preg_replace('/[^0-9]/', '', (string)($io['phone'] ?? ''));
        if (strlen($ip) > 11 && str_starts_with($ip, '88')) $ip = substr($ip, 2);
        return $ip !== $clean_phone;
    });
    if (count($filtered_incomplete) !== count($incomplete_orders)) {
        file_put_contents($incomplete_file, json_encode(array_values($filtered_incomplete), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

echo json_encode([
    'status'     => 'success',
    'success'    => true,
    'data'       => $order_data,
    'profile_id' => $profile_id
], JSON_UNESCAPED_UNICODE);
?>
