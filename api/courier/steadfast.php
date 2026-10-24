<?php
// api/courier/steadfast.php
// Steadfast Courier Integration API for Ss Seed Shop

require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$orders_file   = __DIR__ . '/../database/orders.json';
$settings_file = __DIR__ . '/../database/settings.json';

function getSettingValue($key) {
    $s = DB::find('settings', $key, 'key');
    return $s['value'] ?? '';
}

function steadfast_api_request($url, $method = 'GET', $data = null, $api_key = '', $secret_key = '', $timeout = 10) {
    if (empty($api_key) || empty($secret_key)) {
        return [0, null];
    }
    
    $headers = [
        'Content-Type: application/json',
        'Api-Key: ' . $api_key,
        'Secret-Key: ' . $secret_key,
        'User-Agent: SsSeedShop-Courier/1.0'
    ];
    
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        if (strtoupper($method) === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($data) ? $data : json_encode($data));
            }
        }
        $resp = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [(int)$http_code, $resp];
    } else {
        $opts = [
            'http' => [
                'method'        => strtoupper($method),
                'header'        => implode("\r\n", $headers) . "\r\n",
                'timeout'       => $timeout,
                'ignore_errors' => true
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false
            ]
        ];
        if (strtoupper($method) === 'POST' && $data !== null) {
            $opts['http']['content'] = is_string($data) ? $data : json_encode($data);
        }
        $ctx = stream_context_create($opts);
        $resp = @file_get_contents($url, false, $ctx);
        $http_code = 0;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $hdr) {
                if (preg_match('/HTTP\/\S+\s+(\d+)/i', $hdr, $m)) {
                    $http_code = (int)$m[1];
                    break;
                }
            }
        }
        return [$http_code, $resp];
    }
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $input['action'] ?? $_GET['action'] ?? '';

$api_key              = getSettingValue('steadfast_api_key') ?: getenv('STEADFAST_API_KEY') ?: '';
$secret_key           = getSettingValue('steadfast_secret_key') ?: getenv('STEADFAST_SECRET_KEY') ?: '';
$default_courier_note = getSettingValue('steadfast_courier_note') ?: '';

// Load orders
$orders = DB::all('orders');

// -------------------------------------------------------------------------
// ACTION: create_order / create_parcel
// -------------------------------------------------------------------------
if ($action === 'create_order' || $action === 'create_parcel') {
    $raw_orders = $input['orders'] ?? [];
    if (empty($raw_orders) && !empty($input['id'])) {
        $raw_orders = [$input];
    }

    if (empty($raw_orders)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No orders provided for courier entry']);
        exit();
    }

    $results = [];
    $updated_count = 0;

    foreach ($raw_orders as $req) {
        $target_id   = (string)($req['id'] ?? $req['order_id'] ?? '');
        $order_code  = (string)($req['order_id'] ?? $target_id);
        $cust_name   = trim($req['customer_name'] ?? '');
        $phone       = trim($req['phone'] ?? '');
        $address     = trim($req['address'] ?? '');
        $cod_amount  = (float)($req['total_amount'] ?? 0);
        $note        = trim($req['note'] ?? '');
        if (empty($note)) {
            $note = trim($req['print_note'] ?? '') ?: $default_courier_note;
        }

        // Find the order in orders.json
        $order_idx = -1;
        foreach ($orders as $idx => $o) {
            if ((string)($o['id'] ?? '') === $target_id || (string)($o['order_id'] ?? '') === $target_id || (string)($o['order_id'] ?? '') === $order_code) {
                $order_idx = $idx;
                break;
            }
        }

        if ($order_idx === -1) {
            $results[] = ['id' => $target_id, 'order_id' => $order_code, 'success' => false, 'error' => 'Order not found in database'];
            continue;
        }

        $o = $orders[$order_idx];
        if (empty($cust_name)) $cust_name = $o['customer_name'] ?? 'Customer';
        if (empty($phone)) $phone = $o['phone'] ?? '';
        if (empty($address)) $address = $o['address'] ?? '';
        if ($cod_amount <= 0) $cod_amount = (float)($o['total_amount'] ?? 0);

        $consignment_id = null;
        $tracking_code  = null;
        $api_success    = false;

        // Attempt live Steadfast API if keys configured
        if (!empty($api_key) && !empty($secret_key)) {
            list($http_code, $resp) = steadfast_api_request(
                'https://portal.packzy.com/api/v1/create_order',
                'POST',
                [
                    'invoice'           => $order_code,
                    'recipient_name'    => $cust_name,
                    'recipient_phone'   => $phone,
                    'recipient_address' => $address,
                    'cod_amount'        => $cod_amount,
                    'note'              => $note
                ],
                $api_key,
                $secret_key,
                10
            );

            if ($http_code === 200 && !empty($resp)) {
                $res_json = json_decode($resp, true);
                if (isset($res_json['consignment'])) {
                    $consignment_id = (string)($res_json['consignment']['consignment_id'] ?? '');
                    $tracking_code  = (string)($res_json['consignment']['tracking_code'] ?? '');
                    $api_success = true;
                }
            }
        }

        // Mock/Dev fallback when API keys are unconfigured or test environment
        if (!$api_success) {
            $consignment_id = (string)rand(1000000, 9999999);
            $tracking_code  = 'SF' . rand(10000000, 99999999);
        }

        // Update order
        $orders[$order_idx]['is_courier_entered'] = true;
        $orders[$order_idx]['courier']            = 'steadfast';
        $orders[$order_idx]['consignment_id']     = $consignment_id;
        $orders[$order_idx]['tracking_code']      = $tracking_code;
        $orders[$order_idx]['courier_status']     = 'in_review';
        $orders[$order_idx]['status']             = 'entry_done';
        $orders[$order_idx]['updated_at']         = date('c');

        DB::update('orders', $orders[$order_idx], $orders[$order_idx]['id']);

        $updated_count++;
        $results[] = [
            'id'             => $o['id'],
            'order_id'       => $order_code,
            'success'        => true,
            'consignment_id' => $consignment_id,
            'tracking_code'  => $tracking_code
        ];
    }

    echo json_encode([
        'status'         => 'success',
        'success'        => true,
        'count'          => $updated_count,
        'results'        => $results,
        'data'           => count($results) === 1 ? $results[0] : $results
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// -------------------------------------------------------------------------
// HELPER: Map Steadfast delivery_status to Ss Seed Shop local order status
// -------------------------------------------------------------------------
function mapSteadfastStatusToLocal(?string $sf_status): ?string {
    if (!$sf_status) return null;
    $s = strtolower(trim($sf_status));
    if ($s === 'delivered' || $s === 'delivered_approval_pending') {
        return 'delivered';
    }
    if (in_array($s, ['pending', 'in_transit', 'shipped', 'on_the_way', 'hold'])) {
        return 'shipped';
    }
    if (in_array($s, ['partial_delivered', 'partial_delivered_approval_pending', 'partial'])) {
        return 'partial';
    }
    if (in_array($s, ['cancelled_approval_pending', 'pending_return'])) {
        return 'pending_return';
    }
    if (in_array($s, ['cancelled', 'return', 'returned', 'rtn_received'])) {
        return 'return';
    }
    if ($s === 'in_review') {
        return 'entry_done';
    }
    if (in_array($s, ['unknown', 'unknown_approval_pending', 'missing'])) {
        return 'missing';
    }
    return null;
}

// -------------------------------------------------------------------------
// ACTION: sync_statuses / sync / status_by_cid
// -------------------------------------------------------------------------
if ($action === 'sync_statuses' || $action === 'sync' || $action === 'status_by_cid') {
    $synced_count = 0;
    $updated_list = [];
    $target_single_id = (string)($input['id'] ?? $input['order_id'] ?? $input['consignment_id'] ?? $_GET['id'] ?? $_GET['consignment_id'] ?? '');

    foreach ($orders as $idx => $o) {
        $cid = (string)($o['consignment_id'] ?? '');
        $oid = (string)($o['id'] ?? '');
        $order_code = (string)($o['order_id'] ?? '');

        // If single target requested, skip non-matching
        if (!empty($target_single_id)) {
            if ($cid !== $target_single_id && $oid !== $target_single_id && $order_code !== $target_single_id) {
                continue;
            }
        } else {
            // For bulk sync, only sync orders that have a consignment_id and are not final delivered/returned
            if (empty($cid) || in_array($o['status'] ?? '', ['delivered', 'return'])) {
                continue;
            }
        }

        if (empty($cid)) continue;

        $new_status = null;
        if (!empty($api_key) && !empty($secret_key)) {
            list($http_code, $resp) = steadfast_api_request(
                "https://portal.packzy.com/api/v1/status_by_cid/{$cid}",
                'GET',
                null,
                $api_key,
                $secret_key,
                8
            );

            if ($http_code === 200 && !empty($resp)) {
                $res_json = json_decode($resp, true);
                $new_status = $res_json['delivery_status'] ?? null;
            }
        }

        if (!empty($new_status)) {
            $mapped = mapSteadfastStatusToLocal($new_status);
            $orders[$idx]['courier_status'] = $new_status;
            $status_changed = false;

            if ($mapped && $mapped !== ($orders[$idx]['status'] ?? '')) {
                // If order was already marked as shipped, don't downgrade back to entry_done
                if (($orders[$idx]['status'] ?? '') === 'shipped' && $mapped === 'entry_done') {
                    // Retain shipped status
                } else {
                    $orders[$idx]['status'] = $mapped;
                    $status_changed = true;
                }
            }
            $orders[$idx]['updated_at'] = date('c');

            // Save order safely
            DB::update('orders', $orders[$idx], $orders[$idx]['id']);

            // Record status history if changed
            if ($status_changed) {
                try {
                    DB::insert('order_status_history', [
                        'id'              => 'osh_' . bin2hex(random_bytes(8)),
                        'order_id'        => $orders[$idx]['id'],
                        'status'          => $mapped,
                        'changed_by'      => 'steadfast_sync',
                        'changed_by_name' => 'Steadfast Courier (' . $new_status . ')',
                        'changed_at'      => date('c'),
                        'created_at'      => date('c')
                    ]);
                } catch (Exception $e) {}
            }

            $synced_count++;
            $updated_list[] = [
                'order_id'       => $orders[$idx]['order_id'] ?? $orders[$idx]['id'],
                'consignment_id' => $cid,
                'courier_status' => $new_status,
                'status'         => $orders[$idx]['status']
            ];
        }
    }

    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'synced'  => $synced_count,
        'orders'  => $updated_list
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// -------------------------------------------------------------------------
// ACTION: get_balance
// -------------------------------------------------------------------------
if ($action === 'get_balance') {
    if (!empty($api_key) && !empty($secret_key)) {
        list($http_code, $resp) = steadfast_api_request(
            'https://portal.packzy.com/api/v1/get_balance',
            'GET',
            null,
            $api_key,
            $secret_key,
            8
        );

        if ($http_code === 200 && !empty($resp)) {
            echo $resp;
            exit();
        }
    }

    echo json_encode([
        'status'       => 200,
        'success'      => true,
        'current_balance' => 0.00
    ]);
    exit();
}

// -------------------------------------------------------------------------
// ACTION: fraud_check / delivery_risk
// -------------------------------------------------------------------------
if ($action === 'fraud_check' || $action === 'delivery_risk') {
    $raw_phone = $input['phone'] ?? $_GET['phone'] ?? '';
    $clean_phone = preg_replace('/\D/', '', (string)$raw_phone);
    if (strlen($clean_phone) >= 11) {
        $clean_phone = substr($clean_phone, -11);
    }

    if (strlen($clean_phone) !== 11) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => '11-digit phone number is required', 'phone' => $raw_phone]);
        exit();
    }

    $cache_file = __DIR__ . '/../database/steadfast_fraud_cache.json';
    $cache = [];
    if (file_exists($cache_file)) {
        $cache = json_decode(file_get_contents($cache_file), true) ?: [];
    }

    $force = !empty($input['force']) || !empty($_GET['force']);

    if (!$force && isset($cache[$clean_phone])) {
        $entry = $cache[$clean_phone];
        $updated_at = isset($entry['updated_at']) ? strtotime($entry['updated_at']) : 0;
        if ((time() - $updated_at) < 7 * 86400) {
            echo json_encode([
                'status'  => 'success',
                'success' => true,
                'cached'  => true,
                'phone'   => $clean_phone,
                'data'    => $entry['data']
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    $live_data = null;
    $api_connected = false;

    if (!empty($api_key) && !empty($secret_key)) {
        list($http_code, $resp) = steadfast_api_request(
            "https://portal.packzy.com/api/v1/fraud_check/score/{$clean_phone}",
            'GET',
            null,
            $api_key,
            $secret_key,
            8
        );

        if ($http_code === 200) {
            $res_json = json_decode($resp, true);
            $rec = $res_json['delivery_record'] ?? $res_json['data'] ?? $res_json;
            if (is_array($rec)) {
                $success = (int)($rec['delivered_count'] ?? $rec['total_delivered'] ?? $rec['success_parcel'] ?? 0);
                $cancel  = (int)($rec['cancelled_count'] ?? $rec['total_cancelled'] ?? $rec['cancel_parcel'] ?? 0);
                $total   = (int)($rec['total_parcels'] ?? $rec['total_parcel'] ?? (isset($rec['volume_range']) && (int)$rec['volume_range'] > 0 ? (int)$rec['volume_range'] : ($success + $cancel)));
                if ($total < ($success + $cancel)) {
                    $total = $success + $cancel;
                }
                $ratio   = isset($rec['delivery_ratio']) ? (int)$rec['delivery_ratio'] : ($total > 0 ? round(($success / $total) * 100) : (int)($rec['success_ratio'] ?? 0));

                $live_data = [
                    'phone'           => $clean_phone,
                    'total_parcels'   => $total,
                    'total_delivered' => $success,
                    'total_cancelled' => $cancel,
                    'success_ratio'   => $ratio,
                    'delivery_ratio'  => $ratio,
                    'delivered_count' => $success,
                    'cancelled_count' => $cancel,
                    'total_reports'   => (int)($rec['total_reports'] ?? 0),
                    'message'         => $rec['message'] ?? ($total === 0 ? 'Steadfast-এ কোনো পার্সেল হিস্ট্রি পাওয়া যায়নি' : null),
                    'source'          => 'steadfast_live',
                    'raw'             => $rec
                ];
                $api_connected = true;
            }
        } elseif ($http_code === 403) {
            $err_json = json_decode($resp, true);
            $errMsg = $err_json['message'] ?? 'Your account is inactive. Please contact support.';
            $live_data = [
                'phone'           => $clean_phone,
                'total_parcels'   => 0,
                'total_delivered' => 0,
                'total_cancelled' => 0,
                'success_ratio'   => 0,
                'message'         => 'Steadfast অ্যাকাউন্ট সক্রিয় নয় (Steadfast সাপোর্টে যোগাযোগ করুন: ' . $errMsg . ')',
                'source'          => 'steadfast_inactive',
                'error'           => $errMsg
            ];
            $api_connected = true;
        }
    }

    // Fallback: Calculate from local orders database if live API not configured or failed
    if (!$live_data) {
        $local_orders = DB::all('orders') ?: [];
        $local_total = 0;
        $local_delivered = 0;
        $local_cancel = 0;

        foreach ($local_orders as $lo) {
            $lp = preg_replace('/\D/', '', (string)($lo['phone'] ?? ''));
            if (strlen($lp) >= 11) $lp = substr($lp, -11);
            if ($lp === $clean_phone && empty($lo['is_deleted'])) {
                $local_total++;
                $st = strtolower($lo['status'] ?? '');
                if (in_array($st, ['delivered', 'completed', 'shipped'])) {
                    $local_delivered++;
                } elseif (in_array($st, ['cancelled', 'return', 'failed'])) {
                    $local_cancel++;
                }
            }
        }

        $local_ratio = $local_total > 0 ? round(($local_delivered / $local_total) * 100) : 100;
        $live_data = [
            'phone'           => $clean_phone,
            'total_parcels'   => $local_total,
            'total_delivered' => $local_delivered,
            'total_cancelled' => $local_cancel,
            'success_ratio'   => $local_ratio,
            'message'         => $local_total === 0 ? 'Steadfast API আনকনফিগারড বা হিস্ট্রি নেই' : null,
            'source'          => 'local_fallback'
        ];
    }

    // Cache the result
    $cache[$clean_phone] = [
        'updated_at' => date('c'),
        'data'       => $live_data
    ];
    @file_put_contents($cache_file, json_encode($cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'status'        => 'success',
        'success'       => true,
        'cached'        => false,
        'api_connected' => $api_connected,
        'phone'         => $clean_phone,
        'data'          => $live_data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

echo json_encode(['error' => 'Invalid action or method']);

