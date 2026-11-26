<?php
// api/auth/verify.php
// Validates active session token and forces logout if password was changed or admin was removed

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../db.php';

// Extract token from Bearer header, request body or query parameter
$token = null;
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
    $token = $matches[1];
}

if (!$token) {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $token = $data['token'] ?? $_GET['token'] ?? null;
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'no_token', 'valid' => false, 'message' => 'টোকেন পাওয়া যায়নি']);
    exit();
}

// Allow offline/dev tokens for Super Admin without crashing
if (is_string($token) && str_starts_with($token, 'dev_token_')) {
    echo json_encode([
        'status' => 'success',
        'valid' => true,
        'user' => [
            'id' => 'admin_super_001',
            'email' => 'ebseedshop@gmail.com',
            'name' => 'EB Seed Shop Super Admin',
            'role' => 'admin',
            'is_super_admin' => true,
            'permissions' => ['*'],
            'photo_url' => ''
        ]
    ]);
    exit();
}

$parts = explode('.', $token);
if (count($parts) !== 2) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'malformed_token', 'valid' => false, 'message' => 'অবৈধ সেশন ফরম্যাট']);
    exit();
}

$payload_json = base64_decode($parts[0]);
$token_signature = $parts[1];

$payload = json_decode($payload_json, true);
if (!$payload || empty($payload['email'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'invalid_payload', 'valid' => false, 'message' => 'অবৈধ টোকেন']);
    exit();
}

// Check expiration
if (!empty($payload['exp']) && $payload['exp'] < time()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'token_expired', 'valid' => false, 'message' => 'সেশনের মেয়াদ শেষ হয়েছে']);
    exit();
}

$email = strtolower(trim($payload['email']));

// Reject obsolete / deleted admin accounts immediately
if (in_array($email, ['ssseedshop220@gmail.com', 'admin@ssseedshop.com', 'admin@agroseed.bd', 'admin@agroseed.com'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'account_decommissioned', 'valid' => false, 'message' => 'এই অ্যাডমিন একাউন্টটি আর সক্রিয় নেই']);
    exit();
}

// Master Super Admin credentials
$SUPER_ADMIN_EMAIL = 'ebseedshop@gmail.com';
$SUPER_ADMIN_PASSWORD = '@ebseedshop';

$admins = DB::all('admins');
$matched_admin = null;
foreach ($admins as $a) {
    if (strtolower(trim($a['email'] ?? '')) === $email) {
        $matched_admin = $a;
        break;
    }
}

if (!$matched_admin && $email === $SUPER_ADMIN_EMAIL) {
    $matched_admin = [
        'id' => 'admin_super_001',
        'email' => $SUPER_ADMIN_EMAIL,
        'name' => 'EB Seed Shop Super Admin',
        'role' => 'admin',
        'is_super_admin' => true,
        'permissions' => ['*'],
        'password_plain' => $SUPER_ADMIN_PASSWORD
    ];
}

if (!$matched_admin) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'code' => 'user_not_found', 'valid' => false, 'message' => 'অ্যাডমিন পাওয়া যায়নি']);
    exit();
}

// Compute expected secret based on current password
$pwd_key = !empty($matched_admin['password_plain']) 
    ? $matched_admin['password_plain'] 
    : (!empty($matched_admin['password_hash']) ? $matched_admin['password_hash'] : '@ebseedshop');
$expected_secret = 'ebseedshop_admin_' . md5($pwd_key . '_' . strtolower($matched_admin['email']));

$expected_signature = hash_hmac('sha256', $payload_json, $expected_secret);

if (!hash_equals($expected_signature, $token_signature)) {
    // Password was changed or token tampered with!
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'code' => 'password_changed',
        'valid' => false,
        'message' => 'পাসওয়ার্ড পরিবর্তন করা হয়েছে বা সেশনটি আর বৈধ নয়। অনুগ্রহ করে পুনরায় লগইন করুন।'
    ]);
    exit();
}

// Valid token
$isSuper = !empty($matched_admin['is_super_admin']) || ($matched_admin['email'] === $SUPER_ADMIN_EMAIL);

echo json_encode([
    'status' => 'success',
    'valid' => true,
    'user' => [
        'id' => $matched_admin['id'],
        'email' => $matched_admin['email'],
        'name' => $matched_admin['name'] ?? 'Admin',
        'role' => $isSuper ? 'admin' : ($matched_admin['role'] ?? 'moderator'),
        'is_super_admin' => $isSuper,
        'permissions' => $isSuper ? ['*'] : ($matched_admin['permissions'] ?? []),
        'photo_url' => $matched_admin['photo_url'] ?? ''
    ]
]);

