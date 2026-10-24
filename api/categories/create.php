<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty(trim($input['name'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['error' => 'ক্যাটাগরির নাম আবশ্যক']);
    exit;
}

// Auto-add columns to MySQL categories table if missing
try {
    $pdo = DB::pdo();
    if ($pdo) {
        $cols = DB::getTableColumns('categories');
        if (!in_array('image', $cols)) {
            $pdo->exec("ALTER TABLE `categories` ADD COLUMN `image` TEXT DEFAULT NULL");
        }
        if (!in_array('description', $cols)) {
            $pdo->exec("ALTER TABLE `categories` ADD COLUMN `description` TEXT DEFAULT NULL");
        }
    }
} catch (Exception $e) {}

// Normalize image and image_url
if (!empty($input['image']) && empty($input['image_url'])) {
    $input['image_url'] = $input['image'];
}
if (!empty($input['image_url']) && empty($input['image'])) {
    $input['image'] = $input['image_url'];
}

// Generate new ID
$input['id'] = uniqid('cat-');
if (!isset($input['position'])) {
    $allCats = DB::all('categories');
    $input['position'] = count($allCats) + 1;
}
$input['created_at'] = date('Y-m-d\TH:i:s\Z');

DB::insert('categories', $input);
echo json_encode(['status' => 'success', 'data' => $input], JSON_UNESCAPED_UNICODE);
?>
