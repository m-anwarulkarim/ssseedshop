<?php
// api/orders/incomplete.php
// Ss Seed Shop Incomplete / Abandoned Order Management API

require_once __DIR__ . '/../db.php';



if (!function_exists('getIncompleteOrders')) {
    function getIncompleteOrders($path) {
        return DB::all('incomplete_orders', 'created_at DESC');
    }
}

if (!function_exists('saveIncompleteOrders')) {
    function saveIncompleteOrders($path, $data) {
        DB::saveAll('incomplete_orders', $data);
    }
}

if (!function_exists('cleanPhoneNumber')) {
    function cleanPhoneNumber($phone) {
        $p = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($p) > 11 && str_starts_with($p, '88')) {
            $p = substr($p, 2);
        }
        return $p;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS Preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------------
// 1. GET Request: List Incomplete Orders
// -------------------------------------------------------------
if ($method === 'GET') {
    $orders = getIncompleteOrders($json_file);
    
    // Optional filters
    $search = trim($_GET['search'] ?? '');
    $phone_filter = cleanPhoneNumber($_GET['phone'] ?? '');

    if (!empty($phone_filter)) {
        $orders = array_filter($orders, function($o) use ($phone_filter) {
            $p = cleanPhoneNumber($o['phone'] ?? '');
            return $p === $phone_filter;
        });
    }

    if (!empty($search)) {
        $search_lower = mb_strtolower($search, 'UTF-8');
        $orders = array_filter($orders, function($o) use ($search_lower) {
            $name = mb_strtolower($o['customer_name'] ?? '', 'UTF-8');
            $phone = $o['phone'] ?? '';
            $address = mb_strtolower($o['address'] ?? '', 'UTF-8');
            return str_contains($name, $search_lower) || str_contains($phone, $search_lower) || str_contains($address, $search_lower);
        });
    }

    // Sort by updated_at / created_at DESC (newest first)
    usort($orders, function($a, $b) {
        $timeA = isset($a['updated_at']) ? strtotime($a['updated_at']) : (isset($a['created_at']) ? strtotime($a['created_at']) : 0);
        $timeB = isset($b['updated_at']) ? strtotime($b['updated_at']) : (isset($b['created_at']) ? strtotime($b['created_at']) : 0);
        return $timeB - $timeA;
    });

    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'data'    => array_values($orders),
        'count'   => count($orders)
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// -------------------------------------------------------------
// 2. POST Request: Upsert / Save Incomplete Order
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    
    $customer_name = trim($input['customer_name'] ?? '');
    $phone_raw     = trim($input['phone'] ?? '');
    $clean_phone   = cleanPhoneNumber($phone_raw);
    $address       = trim($input['address'] ?? '');
    $visitor_id    = trim($input['visitor_id'] ?? '');
    $reason        = trim($input['reason'] ?? 'abandoned');
    $cart_snapshot = $input['cart_snapshot'] ?? [];

    // Need at least phone or visitor_id to track
    if (empty($clean_phone) && empty($visitor_id)) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'message' => 'Phone or visitor_id is required'
        ]);
        exit();
    }

    $orders = getIncompleteOrders($json_file);
    $target_index = -1;

    // Search for existing incomplete order
    foreach ($orders as $idx => $o) {
        $existing_phone = cleanPhoneNumber($o['phone'] ?? '');
        $existing_vid   = trim($o['visitor_id'] ?? '');

        $phone_match = (!empty($clean_phone) && !empty($existing_phone) && $clean_phone === $existing_phone);
        $vid_match   = (!empty($visitor_id) && !empty($existing_vid) && $visitor_id === $existing_vid);

        if ($phone_match || $vid_match) {
            $target_index = $idx;
            break;
        }
    }

    $now = date('c');

    if ($target_index !== -1) {
        // Update existing record
        $existing = $orders[$target_index];
        $existing['attempt_count'] = (int)($existing['attempt_count'] ?? 1) + 1;
        $existing['reason']        = $reason ?: ($existing['reason'] ?? 'abandoned');
        $existing['updated_at']    = $now;

        if (!empty($customer_name)) $existing['customer_name'] = $customer_name;
        if (!empty($clean_phone) && $existing['phone'] === 'unknown') $existing['phone'] = $clean_phone;
        if (!empty($address))       $existing['address']       = $address;
        if (!empty($cart_snapshot)) $existing['cart_snapshot'] = $cart_snapshot;
        if (!empty($visitor_id))    $existing['visitor_id']    = $visitor_id;

        $orders[$target_index] = $existing;
        saveIncompleteOrders($json_file, $orders);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'Incomplete order updated',
            'data'    => $existing
        ], JSON_UNESCAPED_UNICODE);
    } else {
        // Create new record
        $new_item = [
            'id'            => 'inc_' . substr(md5(uniqid(mt_rand(), true)), 0, 12),
            'customer_name' => $customer_name ?: null,
            'phone'         => $clean_phone ?: 'unknown',
            'address'       => $address ?: null,
            'visitor_id'    => $visitor_id ?: null,
            'reason'        => $reason ?: 'abandoned',
            'cart_snapshot' => is_array($cart_snapshot) ? $cart_snapshot : [],
            'attempt_count' => 1,
            'created_at'    => $now,
            'updated_at'    => $now
        ];

        $orders[] = $new_item;
        saveIncompleteOrders($json_file, $orders);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'Incomplete order recorded',
            'data'    => $new_item
        ], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// -------------------------------------------------------------
// 3. DELETE Request: Remove Incomplete Order(s)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    
    $target_id    = $_GET['id'] ?? $input['id'] ?? null;
    $target_ids   = $input['ids'] ?? null;
    $target_phone = cleanPhoneNumber($_GET['phone'] ?? $input['phone'] ?? '');

    $orders = getIncompleteOrders($json_file);
    $initial_count = count($orders);

    if (!empty($target_id)) {
        $orders = array_filter($orders, fn($o) => ($o['id'] ?? '') !== $target_id);
    } elseif (!empty($target_ids) && is_array($target_ids)) {
        $orders = array_filter($orders, fn($o) => !in_array($o['id'] ?? '', $target_ids));
    } elseif (!empty($target_phone)) {
        $orders = array_filter($orders, function($o) use ($target_phone) {
            return cleanPhoneNumber($o['phone'] ?? '') !== $target_phone;
        });
    }

    $deleted_count = $initial_count - count($orders);
    saveIncompleteOrders($json_file, $orders);

    echo json_encode([
        'status'        => 'success',
        'success'       => true,
        'deleted_count' => $deleted_count
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>
