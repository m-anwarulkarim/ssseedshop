<?php
// api/settings/delete.php
// Settings Deletion API (POST & DELETE Methods, Pure MySQL)
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'Method not allowed. Use POST or DELETE.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$key = trim($input['key'] ?? $_POST['key'] ?? $_GET['key'] ?? '');

if (empty($key)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'error' => 'Key is required']);
    exit();
}

$pdo = DB::pdo();
if ($pdo) {
    try {
        $stmt = $pdo->prepare("DELETE FROM `settings` WHERE `key` = ?");
        $stmt->execute([$key]);
        $deleted_count = $stmt->rowCount();
        echo json_encode([
            'status'        => 'success',
            'success'       => true,
            'key'           => $key,
            'deleted_count' => $deleted_count,
            'message'       => 'Setting deleted successfully'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'success' => false,
            'error'   => 'Database error during setting deletion: ' . $e->getMessage()
        ]);
        exit();
    }
} else {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'success' => false,
        'error'   => 'Database connection not available'
    ]);
    exit();
}
?>
