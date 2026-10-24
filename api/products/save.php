<?php
// api/products/save.php
// Create or Update Product in Ss Seed Shop JSON Database

require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');



$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

if (empty($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

$target_id = isset($input['id']) && !empty($input['id']) ? (string)$input['id'] : null;
$existing = null;

if ($target_id) {
    $existing = DB::find('products', $target_id);
}

if ($existing) {
    // ---------------------------------------------------------------------
    // UPDATE EXISTING PRODUCT
    // ---------------------------------------------------------------------
    $updated = array_merge($existing, $input);
    $updated['id'] = $target_id;
    $updated['updated_at'] = date('c');

    // Sync in_stock and available_stock based on stock
    if (isset($updated['stock'])) {
        $updated['stock'] = (int)$updated['stock'];
        $updated['available_stock'] = $updated['stock'];
        $updated['in_stock'] = $updated['stock'] > 0;
    }

    DB::update('products', $updated, $target_id);

    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'action'  => 'updated',
        'data'    => $updated
    ], JSON_UNESCAPED_UNICODE);
    exit();
} else {
    // ---------------------------------------------------------------------
    // CREATE NEW PRODUCT
    // ---------------------------------------------------------------------
    $new_id = uniqid('prod_');

    $new_product = array_merge([
        'id'                => $new_id,
        'name'              => '',
        'sku'               => '',
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
        'in_stock'          => true,
        'position'          => count(DB::all('products')) + 1,
        'product_image'     => null,
        'image_gallery'     => [],
        'is_hidden'         => false,
        'variations'        => [],
        'package_tiers'     => [],
        'highlight_features'=> null,
        'trust_card_1_title'=> null,
        'trust_card_1_text' => null,
        'trust_card_2_title'=> null,
        'trust_card_2_text' => null,
        'created_at'        => date('c')
    ], $input);

    $new_product['id'] = $new_id;
    if (isset($new_product['stock'])) {
        $new_product['stock'] = (int)$new_product['stock'];
        $new_product['available_stock'] = $new_product['stock'];
        $new_product['in_stock'] = $new_product['stock'] > 0;
    } else {
        $new_product['stock'] = 0;
        $new_product['available_stock'] = 0;
        $new_product['in_stock'] = false;
    }

    DB::insert('products', $new_product);

    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'action'  => 'created',
        'data'    => $new_product
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
