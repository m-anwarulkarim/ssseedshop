<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=180, stale-while-revalidate=600');

try {
    $products = DB::all('products', 'position ASC');
    echo json_encode(array_slice($products ?: [], 0, 8), JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    echo json_encode([]);
}
?>
