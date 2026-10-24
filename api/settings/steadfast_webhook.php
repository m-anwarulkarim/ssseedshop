<?php
// api/settings/steadfast_webhook.php
// Webhook endpoint for Steadfast / Packzy Courier status updates
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 1. Validate Token if configured and provided
$saved_token_row = DB::find('settings', 'steadfast_webhook_token', 'key');
$expected_token = trim((string)($saved_token_row['value'] ?? ''));

$headers = getallheaders();
$auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
$received_token = '';
if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $received_token = trim($matches[1]);
} elseif (isset($_GET['token'])) {
    $received_token = trim($_GET['token']);
} elseif (isset($headers['X-Webhook-Token'])) {
    $received_token = trim($headers['X-Webhook-Token']);
}

// 2. Parse Payload
$payload = json_decode(file_get_contents('php://input'), true) ?: $_POST;
if (empty($received_token) && isset($payload['token'])) {
    $received_token = trim((string)$payload['token']);
}

if (!empty($expected_token) && !empty($received_token) && $received_token !== $expected_token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid webhook token']);
    exit;
}

$consignment_id = (string)($payload['consignment_id'] ?? $payload['consignment']['consignment_id'] ?? '');
$invoice        = (string)($payload['invoice'] ?? $payload['order_id'] ?? '');
$tracking_code  = (string)($payload['tracking_code'] ?? '');
$status         = strtolower(trim((string)($payload['status'] ?? $payload['delivery_status'] ?? '')));

if (empty($status) && (empty($consignment_id) && empty($invoice) && empty($tracking_code))) {
    echo json_encode(['status' => 'ignored', 'message' => 'No relevant status or order identifier in payload']);
    exit;
}

// 3. Find and update order
$orders = DB::all('orders');
$matched_order = null;

foreach ($orders as $o) {
    if (!empty($consignment_id) && (string)($o['consignment_id'] ?? '') === $consignment_id) {
        $matched_order = $o;
        break;
    }
    if (!empty($invoice) && ((string)($o['order_id'] ?? '') === $invoice || (string)($o['id'] ?? '') === $invoice)) {
        $matched_order = $o;
        break;
    }
    if (!empty($tracking_code) && (string)($o['tracking_code'] ?? '') === $tracking_code) {
        $matched_order = $o;
        break;
    }
}

if ($matched_order) {
    $matched_order['courier_status'] = $status;
    $mapped_status = null;

    if ($status === 'delivered' || $status === 'delivered_approval_pending') {
        $mapped_status = 'delivered';
    } elseif (in_array($status, ['pending', 'in_transit', 'shipped', 'on_the_way', 'hold'])) {
        $mapped_status = 'shipped';
    } elseif (in_array($status, ['partial_delivered', 'partial_delivered_approval_pending', 'partial'])) {
        $mapped_status = 'partial';
    } elseif (in_array($status, ['cancelled_approval_pending', 'pending_return'])) {
        $mapped_status = 'pending_return';
    } elseif (in_array($status, ['cancelled', 'return', 'returned', 'rtn_received'])) {
        $mapped_status = 'return';
    } elseif ($status === 'in_review') {
        $mapped_status = 'entry_done';
    } elseif (in_array($status, ['unknown', 'unknown_approval_pending', 'missing'])) {
        $mapped_status = 'missing';
    }

    $status_changed = false;
    if ($mapped_status && $mapped_status !== ($matched_order['status'] ?? '')) {
        // If order was already marked as shipped, don't downgrade back to entry_done
        if (($matched_order['status'] ?? '') === 'shipped' && $mapped_status === 'entry_done') {
            // Retain shipped status
        } else {
            $matched_order['status'] = $mapped_status;
            $status_changed = true;
        }
    }
    $matched_order['updated_at'] = date('c');

    DB::update('orders', $matched_order, $matched_order['id']);

    if ($status_changed) {
        try {
            DB::insert('order_status_history', [
                'id'              => 'osh_' . bin2hex(random_bytes(8)),
                'order_id'        => $matched_order['id'],
                'status'          => $mapped_status,
                'changed_by'      => 'steadfast_webhook',
                'changed_by_name' => 'Steadfast Webhook (' . $status . ')',
                'changed_at'      => date('c'),
                'created_at'      => date('c')
            ]);
        } catch (Exception $e) {}
    }

    echo json_encode([
        'status'         => 'success',
        'message'        => "Order {$matched_order['id']} status updated to {$status}",
        'order_id'       => $matched_order['id'],
        'courier_status' => $status,
        'order_status'   => $matched_order['status']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'status'  => 'success',
    'message' => 'Webhook received, but no matching local order found'
]);
?>
