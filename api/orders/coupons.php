<?php
// api/orders/coupons.php
// Ss Seed Shop Coupon Validation & Usage Management API

require_once __DIR__ . '/../db.php';

$json_file = __DIR__ . '/../database/coupons.json';

if (!function_exists('getCoupons')) {
    function getCoupons($path) {
        return DB::all('coupons');
    }
}

if (!function_exists('saveCoupons')) {
    function saveCoupons($path, $data) {
        DB::saveAll('coupons', $data);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS Preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------------
// 1. GET Request: Verify Coupon or List All
// -------------------------------------------------------------
if ($method === 'GET') {
    $coupons = getCoupons($json_file);
    $code_raw = trim($_GET['code'] ?? '');

    // If no specific code requested, return list of coupons
    if (empty($code_raw)) {
        $active_only = isset($_GET['active_only']) ? filter_var($_GET['active_only'], FILTER_VALIDATE_BOOLEAN) : false;
        if ($active_only) {
            $coupons = array_filter($coupons, fn($c) => !empty($c['is_active']));
        }
        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'data'    => array_values($coupons),
            'count'   => count($coupons)
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $code = strtoupper($code_raw);
    $order_amount = (float)($_GET['amount'] ?? $_GET['order_amount'] ?? $_GET['total_price'] ?? $_GET['cart_total'] ?? $_GET['total'] ?? 0);

    $matched = null;
    foreach ($coupons as $c) {
        if (strtoupper($c['code'] ?? '') === $code) {
            $matched = $c;
            break;
        }
    }

    // 1. Check if coupon exists
    if (!$matched) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'message' => 'কুপন কোড সঠিক নয় (Invalid coupon code)'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 2. Check if active
    if (empty($matched['is_active'])) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'message' => 'এই কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে (Coupon is inactive)'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $now = time();

    // 3. Check start time
    if (!empty($matched['starts_at'])) {
        $starts_at = strtotime($matched['starts_at']);
        if ($starts_at && $starts_at > $now) {
            http_response_code(400);
            echo json_encode([
                'status'  => 'error',
                'success' => false,
                'message' => 'কুপনটি এখনো সক্রিয় হয়নি (Coupon not started yet)'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    // 4. Check expiration time
    if (!empty($matched['expires_at'])) {
        $expires_at = strtotime($matched['expires_at']);
        if ($expires_at && $expires_at < $now) {
            http_response_code(400);
            echo json_encode([
                'status'  => 'error',
                'success' => false,
                'message' => 'কুপনের মেয়াদ শেষ হয়ে গেছে (Coupon expired)'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    // 5. Check usage limit
    $usage_limit = isset($matched['usage_limit']) && $matched['usage_limit'] !== null ? (int)$matched['usage_limit'] : null;
    $used_count  = (int)($matched['used_count'] ?? 0);
    if ($usage_limit !== null && $usage_limit > 0 && $used_count >= $usage_limit) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'message' => 'কুপনের সর্বোচ্চ ব্যবহার সীমা শেষ হয়ে গেছে (Coupon usage limit reached)'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 6. Check minimum order amount
    $min_order = (float)($matched['min_order_amount'] ?? 0);
    if ($min_order > 0 && $order_amount > 0 && $order_amount < $min_order) {
        http_response_code(400);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'message' => "এই কুপনে সর্বনিম্ন অর্ডার ৳{$min_order} (Minimum order amount is ৳{$min_order})"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 7. Calculate Discount
    $discount_type = $matched['discount_type'] ?? 'fixed';
    $discount_val  = (float)($matched['discount_value'] ?? 0);
    $max_discount  = isset($matched['max_discount_amount']) && $matched['max_discount_amount'] !== null ? (float)$matched['max_discount_amount'] : null;

    $calculated_discount = 0;
    if ($discount_type === 'fixed') {
        $calculated_discount = $order_amount > 0 ? min($discount_val, $order_amount) : $discount_val;
    } elseif ($discount_type === 'percentage') {
        $base = $order_amount > 0 ? $order_amount : 100;
        $pct_amount = $base * ($discount_val / 100);
        if ($max_discount !== null && $max_discount > 0) {
            $calculated_discount = min($pct_amount, $max_discount);
        } else {
            $calculated_discount = $pct_amount;
        }
    }

    $calculated_discount = round($calculated_discount, 2);
    $final_amount = max(0, round($order_amount - $calculated_discount, 2));

    echo json_encode([
        'status'   => 'success',
        'success'  => true,
        'valid'    => true,
        'discount' => $calculated_discount,
        'message'  => "কুপন \"{$matched['code']}\" সফলভাবে যাচাই করা হয়েছে",
        'data'     => [
            'valid'               => true,
            'id'                  => $matched['id'],
            'code'                => $matched['code'],
            'discount_type'       => $discount_type,
            'discount_value'      => $discount_val,
            'max_discount_amount' => $max_discount,
            'min_order_amount'    => $min_order,
            'discount'            => $calculated_discount,
            'discount_amount'     => $calculated_discount,
            'final_amount'        => $final_amount
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// -------------------------------------------------------------
// 2. POST Request: Increment Usage or Upsert Coupon
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    
    $action = $input['action'] ?? 'increment_usage';
    $coupons = getCoupons($json_file);

    if ($action === 'increment_usage' || isset($input['coupon_id']) || isset($input['p_coupon_id'])) {
        $coupon_id   = $input['coupon_id'] ?? $input['p_coupon_id'] ?? $input['id'] ?? null;
        $coupon_code = strtoupper(trim($input['code'] ?? ''));
        $discount    = (float)($input['discount_amount'] ?? $input['p_discount_amount'] ?? 0);

        if (!$coupon_id && empty($coupon_code)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'success' => false, 'message' => 'coupon_id or code is required']);
            exit();
        }

        $target_index = -1;
        foreach ($coupons as $idx => $c) {
            if (($coupon_id && ($c['id'] ?? '') === $coupon_id) || (!empty($coupon_code) && strtoupper($c['code'] ?? '') === $coupon_code)) {
                $target_index = $idx;
                break;
            }
        }

        if ($target_index === -1) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Coupon not found']);
            exit();
        }

        $coupon = $coupons[$target_index];
        $coupon['used_count']           = ((int)($coupon['used_count'] ?? 0)) + 1;
        $coupon['total_discount_given'] = round(((float)($coupon['total_discount_given'] ?? 0)) + $discount, 2);
        $coupon['updated_at']           = date('c');

        $coupons[$target_index] = $coupon;
        saveCoupons($json_file, $coupons);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'Coupon usage incremented successfully',
            'data'    => $coupon
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Admin create / save new coupon
    if ($action === 'create' || $action === 'save') {
        $code = strtoupper(trim($input['code'] ?? ''));
        if (empty($code)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Coupon code is required']);
            exit();
        }

        $now = date('c');
        $new_coupon = [
            'id'                   => $input['id'] ?? ('coup_' . substr(md5(uniqid(mt_rand(), true)), 0, 10)),
            'code'                 => $code,
            'discount_type'        => $input['discount_type'] ?? 'fixed',
            'discount_value'       => (float)($input['discount_value'] ?? 0),
            'min_order_amount'     => (float)($input['min_order_amount'] ?? 0),
            'max_discount_amount'  => isset($input['max_discount_amount']) ? (float)$input['max_discount_amount'] : null,
            'usage_limit'          => isset($input['usage_limit']) ? (int)$input['usage_limit'] : null,
            'used_count'           => (int)($input['used_count'] ?? 0),
            'total_discount_given' => (float)($input['total_discount_given'] ?? 0),
            'starts_at'            => $input['starts_at'] ?? $now,
            'expires_at'           => $input['expires_at'] ?? null,
            'is_active'            => isset($input['is_active']) ? (bool)$input['is_active'] : true,
            'created_at'           => $now,
            'updated_at'           => $now
        ];

        // Check duplicate code
        $found_idx = -1;
        foreach ($coupons as $idx => $c) {
            if (strtoupper($c['code'] ?? '') === $code) {
                $found_idx = $idx;
                break;
            }
        }

        if ($found_idx >= 0) {
            $new_coupon['created_at'] = $coupons[$found_idx]['created_at'] ?? $now;
            $coupons[$found_idx] = $new_coupon;
        } else {
            $coupons[] = $new_coupon;
        }

        saveCoupons($json_file, $coupons);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'Coupon saved successfully',
            'data'    => $new_coupon
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

// -------------------------------------------------------------
// 3. DELETE Request: Delete a coupon
// -------------------------------------------------------------
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $target_id = $_GET['id'] ?? $input['id'] ?? null;
    $target_code = strtoupper(trim($_GET['code'] ?? $input['code'] ?? ''));

    $coupons = getCoupons($json_file);
    $initial_count = count($coupons);

    if (!empty($target_id)) {
        $coupons = array_filter($coupons, fn($c) => ($c['id'] ?? '') !== $target_id);
    } elseif (!empty($target_code)) {
        $coupons = array_filter($coupons, fn($c) => strtoupper($c['code'] ?? '') !== $target_code);
    }

    $deleted_count = $initial_count - count($coupons);
    saveCoupons($json_file, $coupons);

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
