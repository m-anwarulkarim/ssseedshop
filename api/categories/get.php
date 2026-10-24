<?php
// api/categories/get.php
require_once __DIR__ . '/../db.php';

header_remove('Pragma');
header_remove('Expires');
header('Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

$categories = DB::all('categories', 'position ASC');

foreach ($categories as &$c) {
    if (empty($c['image']) && !empty($c['image_url'])) {
        $c['image'] = $c['image_url'];
    }
    if (empty($c['image_url']) && !empty($c['image'])) {
        $c['image_url'] = $c['image'];
    }
}
unset($c);

// Check if we need a single category by id or name
$id = $_GET['id'] ?? '';
$name = $_GET['name'] ?? '';

if ($id || $name) {
    foreach ($categories as $c) {
        if (($id && (string)$c['id'] === (string)$id) || ($name && $c['name'] === $name)) {
            echo json_encode($c, JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

echo json_encode(array_values($categories), JSON_UNESCAPED_UNICODE);
?>
