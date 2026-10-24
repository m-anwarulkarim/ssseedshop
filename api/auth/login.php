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

// Check if master super admin credentials
$is_master_super_admin = ($email === 'ssseedshop220@gmail.com' && $password === 'ssseedshop220');

if ($is_master_super_admin) {
    if (!$matched_admin) {
        $matched_admin = [
            'id' => 'admin_super_001',
            'email' => 'ssseedshop220@gmail.com',
            'name' => 'Ss Seed Shop Super Admin',
            'role' => 'admin',
            'is_super_admin' => true,
            'permissions' => ['*'],
            'password_plain' => 'ssseedshop220'
        ];
    }
    // Auto-sync MySQL database in real time if connected
    try {
        if (class_exists('DB') && method_exists('DB', 'pdo')) {
            $pdo = DB::pdo();
            if ($pdo) {
                $hash = password_hash('ssseedshop220', PASSWORD_DEFAULT);
                $pdo->exec("DELETE FROM `admins` WHERE `email` IN ('admin@ssseedshop.com', 'admin@agroseed.bd', 'admin@agroseed.com')");
                $chk = $pdo->prepare("SELECT id FROM `admins` WHERE `email` = 'ssseedshop220@gmail.com'");
                $chk->execute();
                if ($chk->rowCount() === 0) {
                    $ins = $pdo->prepare("INSERT INTO `admins` (`id`, `email`, `password_hash`, `password_plain`, `role`, `is_super_admin`, `name`, `permissions`, `created_at`) VALUES ('admin_super_001', 'ssseedshop220@gmail.com', ?, 'ssseedshop220', 'admin', 1, 'Ss Seed Shop Super Admin', '[\"*\"]', NOW()) ON DUPLICATE KEY UPDATE `email`='ssseedshop220@gmail.com', `password_hash`=?, `password_plain`='ssseedshop220', `role`='admin', `is_super_admin`=1");
                    $ins->execute([$hash, $hash]);
                } else {
                    $up = $pdo->prepare("UPDATE `admins` SET `password_hash` = ?, `password_plain` = 'ssseedshop220', `role` = 'admin', `is_super_admin` = 1 WHERE `email` = 'ssseedshop220@gmail.com'");
                    $up->execute([$hash]);
                }
            }
        }
    } catch (Exception $e) {}
}

if (!$matched_admin) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'ভুল ইমেইল বা পাসওয়ার্ড']);
    exit();
}

// Verify password
$password_ok = false;
if ($is_master_super_admin) {
    $password_ok = true;
} elseif (!empty($matched_admin['password_hash']) && password_verify($password, $matched_admin['password_hash'])) {
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
