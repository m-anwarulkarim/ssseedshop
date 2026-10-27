<?php
// api/categories/get.php
// Ss Seed Shop - Optimized High-Performance Categories API
require_once __DIR__ . '/../db.php';

$isAdmin = isset($_GET['admin']) && ($_GET['admin'] === '1' || $_GET['admin'] === 'true');
$isNoCache = isset($_GET['_t']) || isset($_GET['nocache']) || $isAdmin;

if ($isNoCache) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    header_remove('Pragma');
    header_remove('Expires');
    header('Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
}

// 1. Single category by ID
if (!empty($_GET['id'])) {
    $c = DB::find('categories', (string)$_GET['id'], 'id');
    if ($c) {
        if (empty($c['image']) && !empty($c['image_url'])) $c['image'] = $c['image_url'];
        if (empty($c['image_url']) && !empty($c['image'])) $c['image_url'] = $c['image'];
        echo json_encode($c, JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

// 2. Single category by slug or name
if (!empty($_GET['slug'])) {
    $c = DB::find('categories', (string)$_GET['slug'], 'slug') ?: DB::find('categories', (string)$_GET['slug'], 'id');
    if ($c) {
        if (empty($c['image']) && !empty($c['image_url'])) $c['image'] = $c['image_url'];
        if (empty($c['image_url']) && !empty($c['image'])) $c['image_url'] = $c['image'];
        echo json_encode($c, JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

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

if (!empty($_GET['name'])) {
    $targetName = (string)$_GET['name'];
    foreach ($categories as $c) {
        if (($c['name'] ?? '') === $targetName) {
            echo json_encode($c, JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

if (!$isAdmin) {
    $categories = array_filter($categories, fn($c) => empty($c['is_hidden']));
}

echo json_encode(array_values($categories), JSON_UNESCAPED_UNICODE);
?>