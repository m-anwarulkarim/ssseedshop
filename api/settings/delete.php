<?php
// api/settings/delete.php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$key = trim($input['key'] ?? '');

if (empty($key)) {
    http_response_code(400);
    echo json_encode(['error' => 'Key is required']);
    exit;
}

// 1. Delete from MySQL if connected
try {
    $pdo = DB::pdo();
    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `settings` WHERE `key` = ?");
        $stmt->execute([$key]);
    }
} catch (Exception $e) {
    // Continue to JSON fallback
}

// 2. Delete from JSON file
$json_file = DB::getJsonFile('settings');
if (file_exists($json_file)) {
    $settings = json_decode(file_get_contents($json_file), true) ?: [];
    $filtered = array_values(array_filter($settings, function($s) use ($key) {
        return ($s['key'] ?? '') !== $key;
    }));
    DB::atomicWriteJson($json_file, $filtered);
}

echo json_encode(['status' => 'success', 'success' => true]);
?>
