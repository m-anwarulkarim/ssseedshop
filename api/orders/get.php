<?php
// api/orders/get.php
// Ss Seed Shop Orders Retrieval with High-Performance Database Pushdown
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// 1. Single Order by ID or order_id (O(1) B-tree lookup)
$target_param = !empty($_GET['id']) ? trim($_GET['id']) : (!empty($_GET['order_id']) ? trim($_GET['order_id']) : null);
if ($target_param !== null) {
    $order = DB::find('orders', $target_param, 'id') ?: DB::find('orders', $target_param, 'order_id');
    if ($order) {
        echo json_encode($order, JSON_UNESCAPED_UNICODE);
        exit();
    }
    http_response_code(404);
    echo json_encode(['error' => 'Order not found']);
    exit();
}

$pdo = DB::pdo();
$orders = null;

// High-performance SQL query with pushed-down filters and MySQL indexes
if ($pdo) {
    try {
        $whereClauses = [];
        $params = [];

        // Deleted filter
        $deleted_only = isset($_GET['deleted_only']) && ($_GET['deleted_only'] === '1' || $_GET['deleted_only'] === 'true');
        $include_deleted = isset($_GET['include_deleted']) && ($_GET['include_deleted'] === '1' || $_GET['include_deleted'] === 'true');
        if ($deleted_only) {
            $whereClauses[] = "`is_deleted` = 1";
        } elseif (!$include_deleted) {
            $whereClauses[] = "(`is_deleted` = 0 OR `is_deleted` IS NULL)";
        }

        // Status filter (uses idx_ord_status)
        if (!empty($_GET['status']) && $_GET['status'] !== 'all') {
            $allowed_statuses = array_map('trim', explode(',', strtolower($_GET['status'])));
            $inPlaceholders = implode(',', array_fill(0, count($allowed_statuses), '?'));
            $whereClauses[] = "LOWER(`status`) IN ($inPlaceholders)";
            foreach ($allowed_statuses as $st) {
                $params[] = $st;
            }
        }

        // Phone filter (uses idx_ord_phone)
        if (!empty($_GET['phone'])) {
            $clean_phone = preg_replace('/[^0-9]/', '', (string)$_GET['phone']);
            if (strlen($clean_phone) > 11 && str_starts_with($clean_phone, '88')) {
                $clean_phone = substr($clean_phone, 2);
            }
            $whereClauses[] = "(`phone` LIKE ? OR `alt_phone` LIKE ?)";
            $params[] = "%$clean_phone%";
            $params[] = "%$clean_phone%";
        }

        // Search query
        if (!empty($_GET['search'])) {
            $s = trim((string)$_GET['search']);
            $whereClauses[] = "(`order_id` LIKE ? OR `customer_name` LIKE ? OR `phone` LIKE ? OR `address` LIKE ? OR `note` LIKE ?)";
            $params[] = "%$s%";
            $params[] = "%$s%";
            $params[] = "%$s%";
            $params[] = "%$s%";
            $params[] = "%$s%";
        }

        // Date filtering
        if (!empty($_GET['since']) || !empty($_GET['from'])) {
            $fromDate = date('Y-m-d H:i:s', strtotime($_GET['since'] ?? $_GET['from']));
            $whereClauses[] = "`created_at` >= ?";
            $params[] = $fromDate;
        }
        if (!empty($_GET['to'])) {
            $toDate = date('Y-m-d H:i:s', strtotime($_GET['to']));
            $whereClauses[] = "`created_at` <= ?";
            $params[] = $toDate;
        }

        $sql = "SELECT * FROM `orders`";
        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY `created_at` DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rawRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $orders = [];
        foreach ($rawRows as $r) {
            $orders[] = DB::decodeRow('orders', $r);
        }
    } catch (Exception $e) {
        $orders = null; // Fallback to DB::all on table/column issue
    }
}

// Fallback logic for file or unhandled SQL
if ($orders === null) {
    $orders = DB::all('orders', 'created_at DESC');

    // Filter out deleted unless requested
    $deleted_only = isset($_GET['deleted_only']) && ($_GET['deleted_only'] === '1' || $_GET['deleted_only'] === 'true');
    $include_deleted = isset($_GET['include_deleted']) && ($_GET['include_deleted'] === '1' || $_GET['include_deleted'] === 'true');

    if ($deleted_only) {
        $orders = array_filter($orders, fn($o) => !empty($o['is_deleted']));
    } elseif (!$include_deleted) {
        $orders = array_filter($orders, fn($o) => empty($o['is_deleted']));
    }

    // Status filter
    if (!empty($_GET['status']) && $_GET['status'] !== 'all') {
        $allowed_statuses = array_map('trim', explode(',', strtolower($_GET['status'])));
        $orders = array_filter($orders, function($o) use ($allowed_statuses) {
            $st = strtolower($o['status'] ?? 'pending');
            return in_array($st, $allowed_statuses);
        });
    }

    // Phone filter
    if (!empty($_GET['phone'])) {
        $clean_phone = preg_replace('/[^0-9]/', '', (string)$_GET['phone']);
        if (strlen($clean_phone) > 11 && str_starts_with($clean_phone, '88')) {
            $clean_phone = substr($clean_phone, 2);
        }
        $orders = array_filter($orders, function($o) use ($clean_phone) {
            $op = preg_replace('/[^0-9]/', '', (string)($o['phone'] ?? ''));
            if (strlen($op) > 11 && str_starts_with($op, '88')) {
                $op = substr($op, 2);
            }
            $alt = preg_replace('/[^0-9]/', '', (string)($o['alt_phone'] ?? ''));
            if (strlen($alt) > 11 && str_starts_with($alt, '88')) {
                $alt = substr($alt, 2);
            }
            return ($op !== '' && $op === $clean_phone) || ($alt !== '' && $alt === $clean_phone);
        });
    }

    // Search query
    if (!empty($_GET['search'])) {
        $to_lower = function($s) {
            $str = (string)($s ?? '');
            return function_exists('mb_strtolower') ? mb_strtolower($str, 'UTF-8') : strtolower($str);
        };
        $search = $to_lower(trim($_GET['search']));
        $orders = array_filter($orders, function($o) use ($search, $to_lower) {
            $order_id = $to_lower($o['order_id'] ?? '');
            $name     = $to_lower($o['customer_name'] ?? '');
            $phone    = $to_lower($o['phone'] ?? '');
            $address  = $to_lower($o['address'] ?? '');
            $note     = $to_lower($o['note'] ?? '');

            return str_contains($order_id, $search) ||
                   str_contains($name, $search) ||
                   str_contains($phone, $search) ||
                   str_contains($address, $search) ||
                   str_contains($note, $search);
        });
    }

    // Date filtering
    if (!empty($_GET['since']) || !empty($_GET['from'])) {
        $from_time = strtotime($_GET['since'] ?? $_GET['from']);
        if ($from_time) {
            $orders = array_filter($orders, function($o) use ($from_time) {
                $created = strtotime($o['created_at'] ?? '1970-01-01');
                return $created >= $from_time;
            });
        }
    }

    if (!empty($_GET['to'])) {
        $to_time = strtotime($_GET['to']);
        if ($to_time) {
            $orders = array_filter($orders, function($o) use ($to_time) {
                $created = strtotime($o['created_at'] ?? '1970-01-01');
                return $created <= $to_time;
            });
        }
    }

    // Sort by created_at DESC
    usort($orders, function($a, $b) {
        $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $timeB - $timeA;
    });
}

// Pagination if requested
$total_count = count($orders);
if (isset($_GET['limit']) && (int)$_GET['limit'] > 0) {
    $limit = (int)$_GET['limit'];
    $page = max(0, (int)($_GET['page'] ?? 0));
    $orders = array_slice($orders, $page * $limit, $limit);
}

// Response output
if (isset($_GET['wrapped']) && ($_GET['wrapped'] === '1' || $_GET['wrapped'] === 'true')) {
    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'total'   => $total_count,
        'data'    => array_values($orders)
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(array_values($orders), JSON_UNESCAPED_UNICODE);
}
?>