<?php
// api/products/get_single.php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=300');

$slug = trim($_GET['slug'] ?? '');
$id = trim($_GET['id'] ?? '');
if (!$slug && !$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug or id']);
    exit;
}

$product = null;
if ($id) {
    $product = DB::find('products', $id, 'id');
}

if (!$product && $slug) {
    $product = DB::find('products', $slug, 'slug');
    if (!$product) {
        $product = DB::find('products', $slug, 'id');
    }
}

if ($product) {
    $stock = isset($product['stock']) ? (int)$product['stock'] : 0;
    $avail = isset($product['available_stock']) && $product['available_stock'] !== null ? (int)$product['available_stock'] : $stock;
    $product['available_stock'] = $avail;
    $product['stock'] = $stock;
    if ($stock <= 0 && $avail <= 0) {
        $product['in_stock'] = false;
    }
    echo json_encode($product, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>
