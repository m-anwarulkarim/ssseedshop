<?php
// api/expenses/sync_sales.php
// Sync Delivered Website Orders into Ss Seed Shop Ledger as Income
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$orders = DB::all('orders');
$entries_row = DB::find('settings', 'agroseed_ledger_entries_v2', 'key');
$entries = [];

if (!empty($entries_row['value'])) {
    $parsed = json_decode($entries_row['value'], true);
    if (is_array($parsed)) {
        $entries = $parsed;
    }
}

if (empty($entries)) {
    $seed_file = __DIR__ . '/../database/imported_ledger.json';
    if (file_exists($seed_file)) {
        $entries = json_decode(file_get_contents($seed_file), true) ?: [];
    }
}

// 1. Separate delivered vs non-delivered orders
$delivered_orders = [];
$non_delivered_ids = [];

foreach ($orders as $o) {
    if (!empty($o['is_deleted'])) continue;
    $st = strtolower($o['status'] ?? 'pending');
    $oid = strtolower(trim((string)($o['order_id'] ?? '')));
    $id = strtolower(trim((string)($o['id'] ?? '')));

    if ($st === 'delivered') {
        $delivered_orders[] = $o;
    } else {
        if (!empty($oid)) $non_delivered_ids[$oid] = true;
        if (!empty($id)) {
            $non_delivered_ids[$id] = true;
            $non_delivered_ids[substr($id, 0, 8)] = true;
        }
    }
}

// 2. Remove any entries that were synced for orders that are now not delivered
$cleaned_entries = [];
$removed_count = 0;

foreach ($entries as $e) {
    $is_synced = ($e['addedBy'] ?? '') === 'Supabase Sync' || ($e['addedBy'] ?? '') === 'Website Sync' || ($e['source'] ?? '') === 'website' || ($e['category'] ?? '') === 'Product Sales (Website)';
    if ($is_synced) {
        $desc = strtolower($e['description'] ?? '');
        $should_remove = false;
        foreach (array_keys($non_delivered_ids) as $nid) {
            if (!empty($nid) && strpos($desc, $nid) !== false) {
                $should_remove = true;
                break;
            }
        }
        if ($should_remove) {
            $removed_count++;
            continue;
        }
    }
    $cleaned_entries[] = $e;
}

// 3. Add delivered orders that are not yet in the ledger
$new_entries = [];

foreach ($delivered_orders as $o) {
    $oid = trim((string)($o['order_id'] ?? ''));
    $id = trim((string)($o['id'] ?? ''));
    $clean_oid = strtolower($oid);
    $uuid_prefix = strtolower(substr($id, 0, 8));
    $order_date = !empty($o['created_at']) ? substr($o['created_at'], 0, 10) : date('Y-m-d');
    $order_amount = (float)($o['total_amount'] ?? 0);

    // Check if already in ledger
    $already_synced = false;
    foreach ($cleaned_entries as $e) {
        if (($e['type'] ?? '') !== 'income') continue;
        $desc = strtolower($e['description'] ?? '');
        if (!empty($clean_oid) && strpos($desc, $clean_oid) !== false) {
            $already_synced = true;
            break;
        }
        if (!empty($uuid_prefix) && strpos($desc, $uuid_prefix) !== false) {
            $already_synced = true;
            break;
        }
        $e_date = $e['date'] ?? $e['entry_date'] ?? '';
        if (($e['category'] ?? '') === 'Product Sales (Website)' && $e_date === $order_date && abs((float)($e['amount'] ?? 0) - $order_amount) < 0.5) {
            $already_synced = true;
            break;
        }
    }

    if (!$already_synced) {
        $desc = 'Order #' . (!empty($oid) ? $oid : (!empty($uuid_prefix) ? $uuid_prefix : 'Website'));
        $payment_method = !empty($o['payment_method']) ? ucfirst($o['payment_method']) : 'Cash';
        $new_entries[] = [
            'id'             => 'sale_' . (!empty($oid) ? $oid : uniqid()),
            'type'           => 'income',
            'amount'         => $order_amount,
            'category'       => 'Product Sales (Website)',
            'vendor'         => '',
            'paymentMethod'  => $payment_method,
            'payment_method' => $payment_method,
            'description'    => $desc,
            'date'           => $order_date,
            'entry_date'     => $order_date,
            'addedBy'        => 'Website Sync',
            'added_by'       => 'Website Sync',
            'source'         => 'website',
            'deletedAt'      => null,
            'deleted_at'     => null
        ];
    }
}

$final_entries = array_merge($new_entries, $cleaned_entries);

// 4. Save to settings table
$now = date('c');
$existing = DB::find('settings', 'agroseed_ledger_entries_v2', 'key');
$val_str = json_encode($final_entries, JSON_UNESCAPED_UNICODE);

if ($existing) {
    $existing['value'] = $val_str;
    $existing['updated_at'] = $now;
    DB::update('settings', $existing, $existing['id']);
} else {
    DB::insert('settings', [
        'id'         => uniqid('set_'),
        'key'        => 'agroseed_ledger_entries_v2',
        'value'      => $val_str,
        'created_at' => $now,
        'updated_at' => $now
    ]);
}

echo json_encode([
    'status'        => 'success',
    'success'       => true,
    'new_count'     => count($new_entries),
    'removed_count' => $removed_count,
    'entries'       => $final_entries
], JSON_UNESCAPED_UNICODE);
?>
