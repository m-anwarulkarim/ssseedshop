<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=180, stale-while-revalidate=600');

try {
    $products = DB::all('products', 'position ASC', 8);
    if (!empty($products)) {
        echo json_encode(array_values($products), JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Exception $e) {
    // Fallback to json if DB is down
}

$json_file = __DIR__ . '/../database/products.json';
if (file_exists($json_file)) {
    $products = json_decode(file_get_contents($json_file), true);
    echo json_encode(array_slice($products ?: [], 0, 8), JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([]);
}
?>
