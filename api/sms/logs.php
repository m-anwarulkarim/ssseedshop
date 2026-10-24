<?php
// api/sms/logs.php
// Ss Seed Shop SMS Logs & History API

require_once __DIR__ . '/../db.php';

$logs_file     = __DIR__ . '/../database/sms_logs.json';
$settings_file = __DIR__ . '/../database/settings.json';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getSettingValue($key) {
    $s = DB::find('settings', $key, 'key');
    return $s['value'] ?? '';
}

require_once __DIR__ . '/../settings/sms_helper.php';

// 1. GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'logs';

    // Balance check
    if ($action === 'balance') {
        $ecomahKey = getSettingValue('ecomah_api_key') ?: getenv('ECOMAH_API_KEY');
        if (!empty($ecomahKey)) {
            $bal = ecomah_check_balance($ecomahKey);
            if ($bal && is_array($bal)) {
                echo json_encode([
                    'success' => true,
                    'balance' => $bal
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        // Fallback if not configured
        echo json_encode([
            'success' => false,
            'balance' => null,
            'error'   => 'Ecomah SMS API Key not configured'
        ]);
        exit;
    }

    // Default: fetch SMS logs
    $raw_logs = DB::all('sms_logs');

    $date_from = $_GET['date_from'] ?? $_GET['from'] ?? null;
    $date_to   = $_GET['date_to'] ?? $_GET['to'] ?? null;
    $search    = strtolower(trim($_GET['search'] ?? $_GET['q'] ?? $_GET['phone'] ?? ''));
    $reason    = trim($_GET['reason'] ?? 'all');
    $status    = trim($_GET['status'] ?? 'all');
    $limit     = isset($_GET['limit']) ? intval($_GET['limit']) : 500;

    $normalized = [];
    foreach ($raw_logs as $log) {
        $created_at = $log['created_at'] ?? $log['timestamp'] ?? date('c');
        $result     = $log['result'] ?? $log['gateway'] ?? null;
        $phone      = (string)($log['phone'] ?? '');
        $message    = (string)($log['message'] ?? '');
        $log_reason = (string)($log['reason'] ?? 'manual');
        $log_status = (string)($log['status'] ?? 'sent');

        // Date filter
        if ($date_from && strtotime($created_at) < strtotime($date_from)) {
            continue;
        }
        if ($date_to && strtotime($created_at) > strtotime($date_to)) {
            continue;
        }

        // Reason filter
        if ($reason !== 'all' && $reason !== '' && $log_reason !== $reason) {
            continue;
        }

        // Status filter
        if ($status !== 'all' && $status !== '' && $log_status !== $status) {
            continue;
        }

        // Search query
        if ($search !== '') {
            $matched = (strpos(strtolower($phone), $search) !== false) ||
                       (strpos(strtolower($message), $search) !== false);
            if (!$matched) continue;
        }

        $normalized[] = [
            'id'            => (string)($log['id'] ?? ('sms_' . substr(md5(uniqid(mt_rand(), true)), 0, 10))),
            'order_id'      => $log['order_id'] ?? null,
            'phone'         => $phone,
            'message'       => $message,
            'status'        => $log_status,
            'reason'        => $log_reason,
            'sent'          => isset($log['sent']) ? (bool)$log['sent'] : true,
            'result'        => $result,
            'gateway'       => $result,
            'created_at'    => $created_at,
            'timestamp'     => $created_at,
            'sent_by_admin' => $log['sent_by_admin'] ?? null
        ];
    }

    // Sort by created_at descending (latest first)
    usort($normalized, function ($a, $b) {
        return strtotime($b['created_at']) <=> strtotime($a['created_at']);
    });

    if ($limit > 0) {
        $normalized = array_slice($normalized, 0, $limit);
    }

    // Return array directly for drop-in compatibility
    echo json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 2. POST / DELETE actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? $_GET['action'] ?? 'delete';

    $logs = file_exists($logs_file) ? (json_decode(file_get_contents($logs_file), true) ?: []) : [];

    // Action: DELETE single or multiple
    if ($action === 'delete') {
        $target_id  = $input['id'] ?? $_GET['id'] ?? null;
        $target_ids = $input['ids'] ?? null;

        if (!$target_id && (!is_array($target_ids) || empty($target_ids))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Log ID or IDs array is required']);
            exit;
        }

        $ids_to_delete = is_array($target_ids) ? array_map('strval', $target_ids) : [(string)$target_id];
        $deleted_count = 0;

        $new_logs = array_values(array_filter($logs, function ($l) use ($ids_to_delete, &$deleted_count) {
            $lid = (string)($l['id'] ?? '');
            if (in_array($lid, $ids_to_delete, true)) {
                $deleted_count++;
                return false;
            }
            return true;
        }));

        if (!is_dir(dirname($logs_file))) {
            mkdir(dirname($logs_file), 0777, true);
        }
        file_put_contents($logs_file, json_encode($new_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'success'       => true,
            'message'       => 'SMS log deleted successfully',
            'deleted_count' => $deleted_count
        ]);
        exit;
    }

    // Action: CLEAR ALL / CLEAR OLD
    if ($action === 'clear_all' || $action === 'clear_old') {
        $days = isset($input['days']) ? intval($input['days']) : (isset($_GET['days']) ? intval($_GET['days']) : 0);
        $deleted_count = 0;

        if ($days > 0) {
            $cutoff = time() - ($days * 86400);
            $new_logs = array_values(array_filter($logs, function ($l) use ($cutoff, &$deleted_count) {
                $time = strtotime($l['created_at'] ?? $l['timestamp'] ?? '');
                if ($time && $time < $cutoff) {
                    $deleted_count++;
                    return false;
                }
                return true;
            }));
        } else {
            // Full clear
            $deleted_count = count($logs);
            $new_logs = [];
        }

        if (!is_dir(dirname($logs_file))) {
            mkdir(dirname($logs_file), 0777, true);
        }
        file_put_contents($logs_file, json_encode($new_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'success'       => true,
            'message'       => "Cleared {$deleted_count} SMS logs successfully",
            'deleted_count' => $deleted_count
        ]);
        exit;
    }

    // Action: CREATE / ADD log
    if ($action === 'add' || $action === 'create') {
        $phone   = trim($input['phone'] ?? '');
        $message = trim($input['message'] ?? '');
        $reason  = trim($input['reason'] ?? 'manual');
        $status  = trim($input['status'] ?? 'sent');

        if (empty($phone) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Phone and message are required']);
            exit;
        }

        $new_entry = [
            'id'            => 'sms_' . substr(md5(uniqid(mt_rand(), true)), 0, 10),
            'order_id'      => $input['order_id'] ?? null,
            'phone'         => $phone,
            'status'        => $status,
            'reason'        => $reason,
            'message'       => $message,
            'sent'          => true,
            'gateway'       => $input['gateway'] ?? ['mode' => 'local', 'status' => 'sent'],
            'sent_by_admin' => $input['sent_by_admin'] ?? 'Admin',
            'timestamp'     => date('c')
        ];

        array_unshift($logs, $new_entry);
        if (!is_dir(dirname($logs_file))) {
            mkdir(dirname($logs_file), 0777, true);
        }
        file_put_contents($logs_file, json_encode(array_values($logs), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'success' => true,
            'message' => 'SMS log recorded successfully',
            'log'     => $new_entry
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unknown action: ' . $action]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
