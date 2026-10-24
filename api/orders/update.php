<?php
// api/orders/update.php
// Ss Seed Shop Order Update API (Status, Customer Info & Bulk Support)

require_once __DIR__ . '/../db.php';



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$target_id  = $input['id'] ?? $input['order_id'] ?? null;
$target_ids = $input['ids'] ?? null;

if (!$target_id && (!is_array($target_ids) || empty($target_ids))) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID or array of IDs is required for update']);
    exit();
}

$orders = DB::all('orders');

$now = date('c');
$updated_count = 0;
$updated_orders = [];

// Bulk Update
if (is_array($target_ids) && !empty($target_ids)) {
    $string_ids = array_map('strval', $target_ids);
    foreach ($orders as $k => $o) {
        $oid = (string)($o['id'] ?? '');
        $ocode = (string)($o['order_id'] ?? '');
        if (in_array($oid, $string_ids, true) || in_array($ocode, $string_ids, true)) {
            if (isset($input['status'])) $orders[$k]['status'] = $input['status'];
            if (isset($input['last_status_changed_by'])) $orders[$k]['last_status_changed_by'] = $input['last_status_changed_by'];
            if (isset($input['is_deleted'])) $orders[$k]['is_deleted'] = (bool)$input['is_deleted'];
            $orders[$k]['updated_at'] = $now;
            $updated_orders[] = $orders[$k];
            $updated_count++;
        }
    }
} else {
    // Single Order Update
    $target_id = (string)$target_id;
    foreach ($orders as $k => $o) {
        $oid = (string)($o['id'] ?? '');
        $ocode = (string)($o['order_id'] ?? '');
        if ($oid === $target_id || $ocode === $target_id) {
            $prev_status = $o['status'] ?? 'pending';
            // Merge all provided properties except ID
            $update_fields = $input;
            unset($update_fields['id']);

            $orders[$k] = array_merge($o, $update_fields);
            $orders[$k]['updated_at'] = $now;
            $updated_orders[] = $orders[$k];
            $updated_count++;
            break;
        }
    }
}

if ($updated_count > 0) {
    // 1. Direct safe update per order (avoids MySQL TRUNCATE)
    foreach ($updated_orders as $uo) {
        DB::update('orders', $uo, $uo['id']);
    }

    // 2. Insert order status history
    if (isset($input['status'])) {
        try {
            $newStatus = (string)$input['status'];
            $adminUser = (string)($input['last_status_changed_by'] ?? 'admin');
            foreach ($updated_orders as $uo) {
                DB::insert('order_status_history', [
                    'id'              => 'osh_' . bin2hex(random_bytes(8)),
                    'order_id'        => $uo['id'],
                    'status'          => $newStatus,
                    'changed_by'      => $adminUser,
                    'changed_by_name' => $adminUser,
                    'changed_at'      => $now,
                    'created_at'      => $now
                ]);
            }
        } catch (Exception $e) {}
    }

    echo json_encode([
        'status'        => 'success',
        'success'       => true,
        'count'         => $updated_count,
        'updated_count' => $updated_count,
        'data'          => count($updated_orders) === 1 ? $updated_orders[0] : $updated_orders
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found']);
}
?>
