<?php
// api/blogs/delete.php
// Ss Seed Shop Blog Post Delete API

require_once __DIR__ . '/../db.php';

$json_file = __DIR__ . '/../database/blogs.json';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$id = $input['id'] ?? $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Blog ID is required']);
    exit;
}

DB::delete('blogs', $id);

echo json_encode([
    'success' => true,
    'status'  => 'success',
    'message' => 'Blog deleted successfully'
]);
?>
