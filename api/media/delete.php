<?php
// api/media/delete.php
// Deletes uploaded media file
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$filename = basename($input['name'] ?? $input['filename'] ?? '');

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Filename is required']);
    exit();
}

$target = __DIR__ . '/../uploads/' . $filename;
if (file_exists($target)) {
    unlink($target);
    echo json_encode(['status' => 'success', 'message' => 'File deleted']);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'File not found']);
}
?>
