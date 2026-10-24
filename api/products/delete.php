<?php
require_once __DIR__ . '/../db.php';
$json_file = '../database/products.json';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['id'])) {
    echo json_encode(['error' => 'ID is required for delete']);
    exit;
}

DB::delete('products', (string)$input['id']);
echo json_encode(['status' => 'success']);
?>
