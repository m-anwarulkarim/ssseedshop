<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
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

// Support array of updates (e.g. bulk position update)
if (isset($input[0]) && is_array($input[0])) {
    $updated_count = 0;
    foreach ($input as $update) {
        if (!empty($update['id'])) {
            $id = (string)$update['id'];
            if (!empty($update['image']) && empty($update['image_url'])) {
                $update['image_url'] = $update['image'];
            }
            if (!empty($update['image_url']) && empty($update['image'])) {
                $update['image'] = $update['image_url'];
            }
            $existing = DB::find('categories', $id);
            if ($existing) {
                $merged = array_merge($existing, $update);
                DB::update('categories', $merged, $id);
                $updated_count++;
            }
        }
    }
    echo json_encode(['status' => 'success', 'updated_count' => $updated_count], JSON_UNESCAPED_UNICODE);
    exit;
}

// Single update
if (empty($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

$id = (string)$input['id'];
$existing = DB::find('categories', $id);
if (!$existing) {
    // Check in JSON fallback
    $allCats = DB::all('categories');
    foreach ($allCats as $c) {
        if ((string)($c['id'] ?? '') === $id) {
            $existing = $c;
            break;
        }
    }
}

if (!$existing) {
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

if (!empty($input['image']) && empty($input['image_url'])) {
    $input['image_url'] = $input['image'];
}
if (!empty($input['image_url']) && empty($input['image'])) {
    $input['image'] = $input['image_url'];
}

$updated = array_merge($existing, $input);
DB::update('categories', $updated, $id);

echo json_encode(['status' => 'success', 'data' => $updated], JSON_UNESCAPED_UNICODE);
?>
