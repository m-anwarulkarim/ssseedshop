<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty(trim($input['name'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['error' => 'পণ্যের নাম আবশ্যক']);
    exit;
}

$new_id = uniqid('prod_');
$all_prods = DB::all('products');

$new_product = array_merge([
    'id'                => $new_id,
    'name'              => '',
    'sku'               => 'SKU-' . substr(time(), -6),
    'slug'              => '',
    'category'          => null,
    'categories'        => [],
    'subcategory'       => null,
    'tag'               => null,
    'tags'              => [],
    'short_description' => '',
    'full_description'  => '',
    'regular_price'     => 0,
    'offer_price'       => null,
    'buying_price'      => null,
    'stock'             => 0,
    'available_stock'   => 0,
    'in_stock'          => false,
    'position'          => count($all_prods) + 1,
    'product_image'     => null,
    'image_gallery'     => [],
    'is_hidden'         => false,
    'variations'        => [],
    'created_at'        => date('c')
], $input);

$new_product['id'] = $new_id;
if (isset($new_product['stock'])) {
    $new_product['stock'] = (int)$new_product['stock'];
    $new_product['available_stock'] = $new_product['stock'];
    $new_product['in_stock'] = $new_product['stock'] > 0;
}

DB::insert('products', $new_product);

echo json_encode([
    'status'  => 'success',
    'success' => true,
    'action'  => 'created',
    'data'    => $new_product
], JSON_UNESCAPED_UNICODE);
?>
