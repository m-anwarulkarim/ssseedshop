<?php
// api/admin/manage.php
// Local Admin & Moderator Management for Ss Seed Shop

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$admins_file = __DIR__ . '/../database/admins.json';

require_once __DIR__ . '/../db.php';

function getAdmins($file) {
    return DB::all('admins');
}

function saveAdmins($file, $data) {
    DB::saveAll('admins', $data);
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$action = $input['action'] ?? $_GET['action'] ?? 'list';

$admins = getAdmins($admins_file);

// Auto-purge hngarden@gmail.com permanently from DB and memory
$has_hngarden = false;
$clean_admins = [];
foreach ($admins as $a) {
    $a_email = strtolower(trim($a['email'] ?? ''));
    $a_id = strtolower(trim($a['id'] ?? ''));
    if ($a_email === 'hngarden@gmail.com' || $a_id === 'admin_super_002') {
        $has_hngarden = true;
    } else {
        $clean_admins[] = $a;
    }
}
if ($has_hngarden) {
    saveAdmins($admins_file, $clean_admins);
    $admins = $clean_admins;
}

// 1. LIST ADMINS
if ($action === 'list') {
    $formatted = array_map(function($a) {
        $isSuper = !empty($a['is_super_admin']) || ($a['email'] ?? '') === 'admin@ssseedshop.com' || ($a['email'] ?? '') === 'admin@agroseed.bd';
        return [
            'id' => $a['id'],
            'email' => $a['email'],
            'role' => $isSuper ? 'admin' : ($a['role'] ?? 'moderator'),
            'is_super_admin' => $isSuper,
            'permissions' => $isSuper ? ['*'] : ($a['permissions'] ?? []),
            'created_at' => $a['created_at'] ?? date('c'),
            'user_metadata' => [
                'name' => $a['name'] ?? '',
                'photo_url' => $a['photo_url'] ?? '',
                'id_card' => $a['id_card'] ?? '',
                'join_date' => $a['join_date'] ?? '',
                'is_super_admin' => $isSuper,
            ]
        ];
    }, $admins);

    echo json_encode($formatted, JSON_UNESCAPED_UNICODE);
    exit();
}

// 2. CREATE ADMIN
if ($action === 'create') {
    $email = strtolower(trim($input['email'] ?? ''));
    $password = trim($input['password'] ?? '');
    $name = trim($input['name'] ?? '');
    $role = trim($input['role'] ?? 'moderator');
    $permissions = $input['permissions'] ?? [];
    $photo_url = trim($input['photo_url'] ?? '');
    $id_card = trim($input['id_card'] ?? '');
    $join_date = trim($input['join_date'] ?? date('Y-m-d'));

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'ইমেইল ও পাসওয়ার্ড দিন']);
        exit();
    }

    foreach ($admins as $a) {
        if (strtolower(trim($a['email'] ?? '')) === $email) {
            http_response_code(400);
            echo json_encode(['error' => 'এই ইমেইল দিয়ে ইতোমধ্যে একজন অ্যাডমিন বিদ্যমান']);
            exit();
        }
    }

    $new_admin = [
        'id' => 'admin_' . time() . '_' . mt_rand(100, 999),
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'password_plain' => $password,
        'role' => $role,
        'is_super_admin' => false,
        'name' => $name,
        'photo_url' => $photo_url,
        'id_card' => $id_card,
        'join_date' => $join_date,
        'permissions' => $permissions,
        'created_at' => date('c')
    ];

    $admins[] = $new_admin;
    saveAdmins($admins_file, $admins);

    echo json_encode(['status' => 'success', 'message' => 'নতুন অ্যাডমিন যুক্ত করা হয়েছে', 'admin' => $new_admin]);
    exit();
}

// 3. UPDATE ADMIN
if ($action === 'update') {
    $user_id = $input['user_id'] ?? '';
    if (empty($user_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID আবশ্যক']);
        exit();
    }

    $found = false;
    foreach ($admins as &$a) {
        if ($a['id'] === $user_id) {
            $isSuper = !empty($a['is_super_admin']) || ($a['email'] ?? '') === 'admin@ssseedshop.com' || ($a['email'] ?? '') === 'admin@agroseed.bd';
            if (isset($input['name'])) $a['name'] = trim($input['name']);
            if ($isSuper) {
                $a['role'] = 'admin';
                $a['permissions'] = ['*'];
                $a['is_super_admin'] = true;
            } else {
                if (isset($input['role'])) $a['role'] = trim($input['role']);
                if (isset($input['permissions'])) $a['permissions'] = $input['permissions'];
            }
            if (isset($input['photo_url'])) $a['photo_url'] = trim($input['photo_url']);
            if (isset($input['id_card'])) $a['id_card'] = trim($input['id_card']);
            if (isset($input['join_date'])) $a['join_date'] = trim($input['join_date']);
            if (!empty($input['password'])) {
                $a['password_plain'] = trim($input['password']);
                $a['password_hash'] = password_hash(trim($input['password']), PASSWORD_DEFAULT);
            }
            $found = true;
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'অ্যাডমিন পাওয়া যায়নি']);
        exit();
    }

    saveAdmins($admins_file, $admins);
    echo json_encode(['status' => 'success', 'message' => 'অ্যাডমিন তথ্য আপডেট হয়েছে']);
    exit();
}

// 4. DELETE ADMIN
if ($action === 'delete') {
    $user_id = trim($input['user_id'] ?? $input['id'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    if (empty($user_id) && empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID অথবা Email আবশ্যক']);
        exit();
    }

    $filtered = [];
    $deleted = false;
    foreach ($admins as $a) {
        $a_email = strtolower(trim($a['email'] ?? ''));
        $match = (!empty($user_id) && ($a['id'] === $user_id)) || (!empty($email) && ($a_email === $email));
        if ($match) {
            if ($a_email === 'admin@ssseedshop.com' || $a_email === 'admin@agroseed.bd') {
                http_response_code(400);
                echo json_encode(['error' => 'মূল সুপার অ্যাডমিন (admin@ssseedshop.com) মুছে ফেলা সম্ভব নয়']);
                exit();
            }
            $deleted = true;
            continue;
        }
        $filtered[] = $a;
    }

    if (!$deleted) {
        http_response_code(404);
        echo json_encode(['error' => 'অ্যাডমিন পাওয়া যায়নি']);
        exit();
    }

    saveAdmins($admins_file, array_values($filtered));
    echo json_encode(['status' => 'success', 'message' => 'অ্যাডমিন মুছে ফেলা হয়েছে']);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'অজ্ঞাত অ্যাকশন']);
