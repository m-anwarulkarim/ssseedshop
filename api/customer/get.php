<?php
// api/customer/get.php
// Returns customer list enriched with order stats (orderCount, orderTotal, last_order_date)

require_once __DIR__ . '/../db.php';

$customers_file = __DIR__ . '/../database/customers.json';
$orders_file    = __DIR__ . '/../database/orders.json';

if (!function_exists('normalizePhone')) {
    function normalizePhone($phone) {
        $clean = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($clean) > 11 && str_starts_with($clean, '88')) {
            $clean = substr($clean, 2);
        }
        return $clean;
    }
}

$customers = DB::all('customers');
$orders    = DB::all('orders');

// Filter out soft-deleted orders for stats
$valid_orders = array_filter($orders, fn($o) => empty($o['is_deleted']));

// Map orders by normalized phone and profile_id
$orders_by_phone = [];
$orders_by_profile = [];

foreach ($valid_orders as $o) {
    $p = normalizePhone($o['phone'] ?? '');
    $alt = normalizePhone($o['alt_phone'] ?? '');
    $pid = (string)($o['profile_id'] ?? $o['customer_id'] ?? '');

    if (!empty($p)) {
        if (!isset($orders_by_phone[$p])) $orders_by_phone[$p] = [];
        $orders_by_phone[$p][] = $o;
    }
    if (!empty($alt) && $alt !== $p) {
        if (!isset($orders_by_phone[$alt])) $orders_by_phone[$alt] = [];
        $orders_by_phone[$alt][] = $o;
    }
    if (!empty($pid)) {
        if (!isset($orders_by_profile[$pid])) $orders_by_profile[$pid] = [];
        $orders_by_profile[$pid][] = $o;
    }
}

// Track seen customer phones
$seen_phones = [];
$customer_list = [];

foreach ($customers as $c) {
    $phone = normalizePhone($c['phone'] ?? '');
    $pid = (string)($c['id'] ?? '');
    if ($phone) $seen_phones[$phone] = true;

    // Collect matched orders
    $my_orders = [];
    if (!empty($phone) && isset($orders_by_phone[$phone])) {
        $my_orders = array_merge($my_orders, $orders_by_phone[$phone]);
    }
    if (!empty($pid) && isset($orders_by_profile[$pid])) {
        $my_orders = array_merge($my_orders, $orders_by_profile[$pid]);
    }

    // Deduplicate by order id
    $unique_orders = [];
    $order_ids = [];
    foreach ($my_orders as $mo) {
        $moid = $mo['id'] ?? $mo['order_id'];
        if (!isset($order_ids[$moid])) {
            $order_ids[$moid] = true;
            $unique_orders[] = $mo;
        }
    }

    // Sort customer orders newest first
    usort($unique_orders, fn($a, $b) => strtotime($b['created_at'] ?? '1970-01-01') - strtotime($a['created_at'] ?? '1970-01-01'));

    $order_count = count($unique_orders);
    $order_total = 0;
    foreach ($unique_orders as $uo) {
        $order_total += (float)($uo['total_amount'] ?? 0);
    }
    $last_order_date = !empty($unique_orders) ? ($unique_orders[0]['created_at'] ?? null) : null;

    $c['visitor_id']      = $c['id'];
    $c['access_allowed']  = $c['access_allowed'] ?? true;
    $c['phone_verified']  = $c['phone_verified'] ?? true;
    $c['orderCount']      = $order_count;
    $c['orderTotal']      = $order_total;
    $c['last_order_date'] = $last_order_date;
    $c['user_type']       = $c['user_type'] ?? 'regular';

    $customer_list[] = $c;
}

// Also discover customers from orders who haven't registered
foreach ($valid_orders as $o) {
    $p = normalizePhone($o['phone'] ?? '');
    if (!empty($p) && !isset($seen_phones[$p])) {
        $seen_phones[$p] = true;
        $my_orders = $orders_by_phone[$p] ?? [];
        usort($my_orders, fn($a, $b) => strtotime($b['created_at'] ?? '1970-01-01') - strtotime($a['created_at'] ?? '1970-01-01'));

        $order_count = count($my_orders);
        $order_total = 0;
        foreach ($my_orders as $mo) {
            $order_total += (float)($mo['total_amount'] ?? 0);
        }

        $customer_list[] = [
            'id'              => 'guest_' . substr(md5($p), 0, 8),
            'visitor_id'      => 'guest_' . substr(md5($p), 0, 8),
            'name'            => $o['customer_name'] ?? 'কাস্টমার',
            'phone'           => $p,
            'address'         => $o['address'] ?? '',
            'district'        => '',
            'thana'           => '',
            'alt_phone'       => $o['alt_phone'] ?? '',
            'user_type'       => 'regular',
            'access_allowed'  => true,
            'phone_verified'  => false,
            'admin_notes'     => null,
            'orderCount'      => $order_count,
            'orderTotal'      => $order_total,
            'last_order_date' => $my_orders[0]['created_at'] ?? null,
            'created_at'      => $my_orders[count($my_orders) - 1]['created_at'] ?? date('c'),
        ];
    }
}

// Single fetch by id or phone
if (!empty($_GET['id']) || !empty($_GET['phone'])) {
    $search_id = $_GET['id'] ?? null;
    $search_p  = !empty($_GET['phone']) ? normalizePhone($_GET['phone']) : null;

    foreach ($customer_list as $cust) {
        if (($search_id && ($cust['id'] === $search_id || $cust['visitor_id'] === $search_id)) ||
            ($search_p && normalizePhone($cust['phone']) === $search_p)) {
            echo json_encode([
                'status'   => 'success',
                'customer' => $cust
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Customer not found']);
    exit();
}

// Search filtering (name, phone, address)
if (!empty($_GET['search'])) {
    $to_lower = function($s) {
        $str = (string)($s ?? '');
        return function_exists('mb_strtolower') ? mb_strtolower($str, 'UTF-8') : strtolower($str);
    };
    $q = $to_lower(trim($_GET['search']));
    $customer_list = array_values(array_filter($customer_list, function($c) use ($q, $to_lower) {
        $name    = $to_lower($c['name'] ?? '');
        $phone   = $to_lower($c['phone'] ?? '');
        $address = $to_lower($c['address'] ?? '');
        return str_contains($name, $q) || str_contains($phone, $q) || str_contains($address, $q);
    }));
}

// Sort by latest order date or created_at
usort($customer_list, function($a, $b) {
    $ta = strtotime($a['last_order_date'] ?? $a['created_at'] ?? '1970-01-01');
    $tb = strtotime($b['last_order_date'] ?? $b['created_at'] ?? '1970-01-01');
    return $tb - $ta;
});

echo json_encode(array_values($customer_list), JSON_UNESCAPED_UNICODE);
