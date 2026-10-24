<?php
require_once __DIR__ . '/../db.php';


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['name'])) {
    echo json_encode(['error' => 'Name is required']);
    exit;
}



$newTag = [
    'id' => uniqid('tag_'),
    'name' => $input['name'],
    'description' => $input['description'] ?? null,
    'icon' => $input['icon'] ?? null,
    'color' => $input['color'] ?? null,
    'created_at' => date('c')
];
DB::insert('tags', $newTag);
echo json_encode(['success' => true, 'tag' => $newTag]);
?>
