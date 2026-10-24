<?php
// api/media/delete.php
// Deletes uploaded media file (POST & DELETE Methods)
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

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
$filename = basename($input['name'] ?? $input['filename'] ?? $_POST['name'] ?? $_POST['filename'] ?? $_GET['name'] ?? $_GET['filename'] ?? '');

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Filename is required']);
    exit();
}

$target = __DIR__ . '/../uploads/' . $filename;
if (file_exists($target)) {
    @unlink($target);
    echo json_encode(['status' => 'success', 'success' => true, 'message' => 'File deleted successfully']);
} else {
    echo json_encode(['status' => 'success', 'success' => true, 'message' => 'File already deleted or not found']);
}
?>
