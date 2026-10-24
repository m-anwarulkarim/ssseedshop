<?php
// api/auth/login.php
// Local Admin Authentication for Ss Seed Shop

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

require_once __DIR__ . '/../db.php';

$admins = DB::all('admins');

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$email = strtolower(trim($data['email'] ?? ''));
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ইমেইল ও পাসওয়ার্ড দিন']);
    exit();
}

$matched_admin = null;
foreach ($admins as $admin) {
    if (strtolower(trim($admin['email'] ?? '')) === $email) {
        $matched_admin = $admin;
        break;
    }
}

// Global fallback for initial super admin if not found in file
if (!$matched_admin && $email === 'ssseedshop220@gmail.com' && $password === 'ssseedshop220') {
    $matched_admin = [
        'id' => 'admin_super_default',
        'email' => $email,
        'name' => 'Super Admin',
        'role' => 'admin',
        'is_super_admin' => true,
        'permissions' => ['*'],
        'password_plain' => $password
    ];
}

if (!$matched_admin) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'ভুল ইমেইল বা পাসওয়ার্ড']);
    exit();
}

// Verify password
$password_ok = false;
if (!empty($matched_admin['password_hash']) && password_verify($password, $matched_admin['password_hash'])) {
    $password_ok = true;
} elseif (!empty($matched_admin['password_plain']) && $matched_admin['password_plain'] === $password) {
    $password_ok = true;
}

if (!$password_ok) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'ভুল ইমেইল বা পাসওয়ার্ড']);
    exit();
}

// Generate secure session token
$token_payload = [
    'admin_id' => $matched_admin['id'],
    'email' => $matched_admin['email'],
    'role' => $matched_admin['role'] ?? 'admin',
    'is_super_admin' => !empty($matched_admin['is_super_admin']),
    'exp' => time() + (86400 * 30), // 30 days
    'iat' => time()
];
$token = base64_encode(json_encode($token_payload)) . '.' . hash_hmac('sha256', json_encode($token_payload), 'agroseed_secure_admin_jwt_secret');

echo json_encode([
    'status' => 'success',
    'message' => 'Login successful',
    'token' => $token,
    'user' => [
        'id' => $matched_admin['id'],
        'email' => $matched_admin['email'],
        'name' => $matched_admin['name'] ?? 'Admin',
        'role' => $matched_admin['role'] ?? 'admin',
        'is_super_admin' => !empty($matched_admin['is_super_admin']),
        'permissions' => $matched_admin['permissions'] ?? ['*'],
        'photo_url' => $matched_admin['photo_url'] ?? ''
    ]
]);
