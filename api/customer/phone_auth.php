<?php
// api/customer/phone_auth.php
// Phone & SMS OTP Authentication Endpoint for Ss Seed Shop Customers

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $input['action'] ?? '';

// Helper: normalize phone number
if (!function_exists('normalizePhone')) {
    function normalizePhone($phone) {
        $clean = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($clean) > 11 && str_starts_with($clean, '88')) {
            $clean = substr($clean, 2);
        }
        return $clean;
    }
}

$phone_raw = $input['phone'] ?? '';
$phone = normalizePhone($phone_raw);

// File paths
$customers_file = __DIR__ . '/../database/customers.json';
$orders_file    = __DIR__ . '/../database/orders.json';
$otps_file      = __DIR__ . '/../database/otps.json';
$settings_file  = __DIR__ . '/../database/settings.json';

if (!function_exists('getJsonData')) {
    function getJsonData($path) {
        $name = basename($path, '.json');
        return DB::all($name);
    }
}

if (!function_exists('saveJsonData')) {
    function saveJsonData($path, $data) {
        $name = basename($path, '.json');
        DB::saveAll($name, is_array($data) ? $data : []);
    }
}

if (!function_exists('createSessionToken')) {
    function createSessionToken($customer, $env) {
        $jwt_secret = $env['JWT_SECRET'] ?? 'agroseed_default_secure_secret_2026';
        $token_payload = [
            'sub'        => $customer['id'],
            'phone'      => $customer['phone'] ?? '',
            'email'      => $customer['email'] ?? '',
            'role'       => 'customer',
            'auth_type'  => 'phone',
            'iat'        => time(),
            'exp'        => time() + (30 * 86400) // 30 days
        ];

        $header_encoded = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload_encoded = base64_encode(json_encode($token_payload));
        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", $jwt_secret, true);
        return "$header_encoded.$payload_encoded." . base64_encode($signature);
    }
}

if (!function_exists('formatCustomerSession')) {
    function formatCustomerSession($customer, $token) {
        return [
            'phone'          => $customer['phone'] ?? '',
            'profile_id'     => $customer['id'],
            'name'           => $customer['name'] ?? '',
            'email'          => $customer['email'] ?? '',
            'avatar_url'     => $customer['avatar_url'] ?? '',
            'phone_verified' => (bool)($customer['phone_verified'] ?? true),
            'user_type'      => 'customer',
            'auth_provider'  => $customer['auth_provider'] ?? 'phone',
            'token'          => $token
        ];
    }
}

// -------------------------------------------------------------
// 1. ACTION: check_phone
// -------------------------------------------------------------
if ($action === 'check_phone') {
    if (empty($phone) || strlen($phone) < 11) {
        echo json_encode([
            'status' => 'error',
            'message' => 'সঠিক ফোন নম্বর দিন'
        ]);
        exit();
    }

    $customers = getJsonData($customers_file);
    $found_customer = null;

    foreach ($customers as $c) {
        if (!empty($c['phone']) && normalizePhone($c['phone']) === $phone) {
            $found_customer = $c;
            break;
        }
    }

    $customer_name = null;
    $has_password = false;
    $exists = false;

    if ($found_customer) {
        $exists = true;
        $customer_name = $found_customer['name'] ?? null;
        $has_password = !empty($found_customer['password_hash']);
    } else {
        // Pre-check orders.json to see if this customer previously placed an order!
        $orders = getJsonData($orders_file);
        foreach ($orders as $o) {
            if (!empty($o['phone']) && normalizePhone($o['phone']) === $phone) {
                $customer_name = $o['customer_name'] ?? null;
                $exists = true;
                break;
            }
        }
    }

    echo json_encode([
        'status'       => 'success',
        'exists'       => $exists,
        'has_password' => $has_password,
        'name'         => $customer_name
    ]);
    exit();
}

// -------------------------------------------------------------
// 2. ACTION: password_login / login_password
// -------------------------------------------------------------
if ($action === 'password_login' || $action === 'login_password') {
    $password = $input['password'] ?? '';

    if (empty($phone) || empty($password)) {
        echo json_encode(['valid' => false, 'error' => 'ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক']);
        exit();
    }

    $customers = getJsonData($customers_file);
    $target_index = -1;
    $target_customer = null;

    foreach ($customers as $idx => $c) {
        if (!empty($c['phone']) && normalizePhone($c['phone']) === $phone) {
            $target_index = $idx;
            $target_customer = $c;
            break;
        }
    }

    if (!$target_customer || empty($target_customer['password_hash'])) {
        echo json_encode(['valid' => false, 'error' => 'পাসওয়ার্ড সেট করা নেই বা অ্যাকাউন্ট পাওয়া যায়নি']);
        exit();
    }

    if (!password_verify($password, $target_customer['password_hash'])) {
        echo json_encode(['valid' => false, 'error' => 'ভুল পাসওয়ার্ড']);
        exit();
    }

    // Login successful
    $target_customer['last_login'] = date('c');
    $customers[$target_index] = $target_customer;
    saveJsonData($customers_file, $customers);

    $token = createSessionToken($target_customer, $env);
    $session = formatCustomerSession($target_customer, $token);

    echo json_encode([
        'valid'   => true,
        'profile' => $target_customer,
        'session' => $session,
        'token'   => $token
    ]);
    exit();
}

// -------------------------------------------------------------
// 3. ACTION: send_otp
// -------------------------------------------------------------
if ($action === 'send_otp') {
    if (empty($phone) || strlen($phone) < 11) {
        echo json_encode(['success' => false, 'error' => 'সঠিক ফোন নম্বর দিন']);
        exit();
    }

    $otp_code = sprintf('%04d', mt_rand(1000, 9999));
    $expires_at = date('c', time() + (5 * 60)); // 5 minutes validity

    $otps = getJsonData($otps_file);
    // Remove previous OTPs for this phone
    $filtered_otps = array_filter($otps, function($o) use ($phone) {
        return empty($o['phone']) || normalizePhone($o['phone']) !== $phone;
    });

    $filtered_otps[] = [
        'phone'      => $phone,
        'otp_code'   => $otp_code,
        'expires_at' => $expires_at,
        'attempts'   => 0,
        'created_at' => date('c')
    ];
    saveJsonData($otps_file, array_values($filtered_otps));

    // Send SMS via E-COMAH API if configured
    $settings = DB::all('settings');
    $ecomah_key = '';
    $otp_template = 'Your Ss Seed Shop verification code is: {otp}. Valid for 5 minutes.';
    foreach ($settings as $s) {
        if (($s['key'] ?? '') === 'ecomah_api_key') {
            $ecomah_key = $s['value'] ?? '';
        }
        if (($s['key'] ?? '') === 'customer_otp_sms_template' && !empty($s['value'])) {
            $otp_template = $s['value'];
        }
    }

    require_once __DIR__ . '/../settings/sms_helper.php';

    $sms_sent = false;
    if (!empty($ecomah_key)) {
        $sms_msg = str_ireplace('{otp}', $otp_code, $otp_template);
        $res = ecomah_send_sms($ecomah_key, $phone, $sms_msg);
        $sms_sent = !empty($res['success']);
    }

    echo json_encode([
        'success'   => true,
        'message'   => 'OTP পাঠানো হয়েছে',
        'remaining' => 3,
        // When running in dev without SMS gateway configured, dev_otp is provided for easy testing
        'dev_otp'   => empty($ecomah_key) ? $otp_code : null
    ]);
    exit();
}

// -------------------------------------------------------------
// 4. ACTION: verify_otp
// -------------------------------------------------------------
if ($action === 'verify_otp') {
    $otp_code = trim((string)($input['otp_code'] ?? $input['otp'] ?? ''));

    if (empty($phone) || empty($otp_code)) {
        echo json_encode(['valid' => false, 'success' => false, 'error' => 'ফোন নম্বর ও OTP দিন']);
        exit();
    }

    $otps = getJsonData($otps_file);
    $matched_otp_idx = -1;

    foreach ($otps as $idx => $o) {
        if (!empty($o['phone']) && normalizePhone($o['phone']) === $phone) {
            $matched_otp_idx = $idx;
            break;
        }
    }

    if ($matched_otp_idx === -1) {
        echo json_encode(['valid' => false, 'error' => 'কোনো সক্রিয় OTP পাওয়া যায়নি। নতুন করে পাঠান।']);
        exit();
    }

    $otp_record = $otps[$matched_otp_idx];
    $expired = strtotime($otp_record['expires_at']) < time();

    if ($expired) {
        unset($otps[$matched_otp_idx]);
        saveJsonData($otps_file, array_values($otps));
        echo json_encode(['valid' => false, 'error' => 'OTP-এর মেয়াদ শেষ হয়ে গেছে।']);
        exit();
    }

    if ($otp_record['otp_code'] !== $otp_code) {
        $otps[$matched_otp_idx]['attempts'] = ($otps[$matched_otp_idx]['attempts'] ?? 0) + 1;
        $remaining = max(0, 3 - $otps[$matched_otp_idx]['attempts']);
        saveJsonData($otps_file, $otps);

        echo json_encode([
            'valid'        => false,
            'error'        => 'ভুল OTP কোড',
            'remaining'    => $remaining,
            'last_attempt' => ($remaining === 1)
        ]);
        exit();
    }

    // OTP is valid! Remove OTP record
    unset($otps[$matched_otp_idx]);
    saveJsonData($otps_file, array_values($otps));

    // Get or Create Customer
    $customers = getJsonData($customers_file);
    $target_index = -1;
    $target_customer = null;

    foreach ($customers as $idx => $c) {
        if (!empty($c['phone']) && normalizePhone($c['phone']) === $phone) {
            $target_index = $idx;
            $target_customer = $c;
            break;
        }
    }

    $now = date('c');

    if ($target_customer) {
        $target_customer['phone_verified'] = true;
        $target_customer['last_login'] = $now;
        $customers[$target_index] = $target_customer;
    } else {
        // Check orders to inherit customer name / address if any!
        $orders = getJsonData($orders_file);
        $inherited_name = '';
        $inherited_address = '';
        foreach ($orders as $o) {
            if (!empty($o['phone']) && normalizePhone($o['phone']) === $phone) {
                if (!empty($o['customer_name'])) $inherited_name = $o['customer_name'];
                if (!empty($o['address'])) $inherited_address = $o['address'];
                break;
            }
        }

        $customer_id = 'cust_' . substr(md5(uniqid($phone . mt_rand(), true)), 0, 12);
        $target_customer = [
            'id'             => $customer_id,
            'phone'          => $phone,
            'name'           => $inherited_name ?: 'কাস্টমার',
            'email'          => '',
            'avatar_url'     => '',
            'alt_phone'      => '',
            'phone_verified' => true,
            'district'       => '',
            'thana'          => '',
            'address'        => $inherited_address,
            'gender'         => '',
            'age'            => null,
            'bio'            => '',
            'username'       => 'user_' . substr($phone, -4),
            'auth_provider'  => 'phone',
            'created_at'     => $now,
            'updated_at'     => $now,
            'last_login'     => $now
        ];
        $customers[] = $target_customer;
    }

    saveJsonData($customers_file, $customers);

    $token = createSessionToken($target_customer, $env);
    $session = formatCustomerSession($target_customer, $token);

    echo json_encode([
        'valid'   => true,
        'success' => true,
        'profile' => $target_customer,
        'session' => $session,
        'token'   => $token
    ]);
    exit();
}

// -------------------------------------------------------------
// 5. ACTION: set_password
// -------------------------------------------------------------
if ($action === 'set_password') {
    $password   = $input['password'] ?? '';
    $profile_id = $input['profile_id'] ?? '';

    if (empty($password) || strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে']);
        exit();
    }

    $customers = getJsonData($customers_file);
    $found = false;

    foreach ($customers as $idx => $c) {
        if (($c['id'] ?? '') === $profile_id || (!empty($phone) && normalizePhone($c['phone'] ?? '') === $phone)) {
            $customers[$idx]['password_hash'] = password_hash($password, PASSWORD_BCRYPT);
            $customers[$idx]['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if ($found) {
        saveJsonData($customers_file, $customers);
        echo json_encode(['success' => true, 'message' => 'পাসওয়ার্ড সেট হয়েছে!']);
    } else {
        echo json_encode(['success' => false, 'error' => 'কাস্টমার প্রোফাইল পাওয়া যায়নি']);
    }
    exit();
}

// -------------------------------------------------------------
// 6. ACTION: reset_password_send_otp
// -------------------------------------------------------------
if ($action === 'reset_password_send_otp') {
    if (empty($phone) || strlen($phone) < 11) {
        echo json_encode(['success' => false, 'error' => 'সঠিক ফোন নম্বর দিন']);
        exit();
    }

    $customers = getJsonData($customers_file);
    $customer_id = null;
    foreach ($customers as $c) {
        if (!empty($c['phone']) && normalizePhone($c['phone']) === $phone) {
            $customer_id = $c['id'];
            break;
        }
    }

    if (!$customer_id) {
        echo json_encode(['success' => false, 'error' => 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি']);
        exit();
    }

    // Reuse OTP sending logic
    $otp_code = sprintf('%04d', mt_rand(1000, 9999));
    $expires_at = date('c', time() + (5 * 60));

    $otps = getJsonData($otps_file);
    $filtered_otps = array_filter($otps, function($o) use ($phone) {
        return empty($o['phone']) || normalizePhone($o['phone']) !== $phone;
    });

    $filtered_otps[] = [
        'phone'      => $phone,
        'otp_code'   => $otp_code,
        'expires_at' => $expires_at,
        'attempts'   => 0,
        'created_at' => date('c')
    ];
    saveJsonData($otps_file, array_values($filtered_otps));

    echo json_encode([
        'success'    => true,
        'profile_id' => $customer_id,
        'message'    => 'পাসওয়ার্ড রিসেটের জন্য OTP পাঠানো হয়েছে',
        'dev_otp'    => $otp_code
    ]);
    exit();
}

// -------------------------------------------------------------
// 7. ACTION: reset_password_verify
// -------------------------------------------------------------
if ($action === 'reset_password_verify') {
    $otp_code = trim((string)($input['otp_code'] ?? ''));
    $new_password = $input['new_password'] ?? '';

    if (empty($phone) || empty($otp_code) || empty($new_password)) {
        echo json_encode(['valid' => false, 'error' => 'সকল তথ্য সঠিকভাবে দিন']);
        exit();
    }

    if (strlen($new_password) < 6) {
        echo json_encode(['valid' => false, 'error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে']);
        exit();
    }

    $otps = getJsonData($otps_file);
    $matched_otp_idx = -1;

    foreach ($otps as $idx => $o) {
        if (!empty($o['phone']) && normalizePhone($o['phone']) === $phone) {
            $matched_otp_idx = $idx;
            break;
        }
    }

    if ($matched_otp_idx === -1 || $otps[$matched_otp_idx]['otp_code'] !== $otp_code) {
        echo json_encode(['valid' => false, 'error' => 'ভুল বা মেয়াদোত্তীর্ণ OTP কোড']);
        exit();
    }

    // OTP matches! Update password
    unset($otps[$matched_otp_idx]);
    saveJsonData($otps_file, array_values($otps));

    $customers = getJsonData($customers_file);
    $updated = false;

    foreach ($customers as $idx => $c) {
        if (!empty($c['phone']) && normalizePhone($c['phone']) === $phone) {
            $customers[$idx]['password_hash'] = password_hash($new_password, PASSWORD_BCRYPT);
            $customers[$idx]['updated_at'] = date('c');
            $updated = true;
            break;
        }
    }

    saveJsonData($customers_file, $customers);

    echo json_encode([
        'valid'   => $updated,
        'message' => $updated ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' : 'কাস্টমার পাওয়া যায়নি'
    ]);
    exit();
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action: ' . $action]);
?>
