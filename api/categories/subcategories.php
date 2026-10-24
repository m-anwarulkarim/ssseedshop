<?php
// api/categories/subcategories.php
// Subcategories API for Ss Seed Shop
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getSubcategories() {
    return DB::all('subcategories', 'position ASC');
}

// -------------------------------------------------------------------------
// GET: Fetch subcategories
// -------------------------------------------------------------------------
if ($method === 'GET') {
    $category_name = $_GET['category_name'] ?? '';
    $subs = getSubcategories();

    if (!empty($category_name)) {
        $subs = array_filter($subs, function($s) use ($category_name) {
            return ($s['category_name'] ?? '') === $category_name;
        });
    }

    usort($subs, function($a, $b) {
        return ($a['position'] ?? 0) - ($b['position'] ?? 0);
    });

    echo json_encode(array_values($subs), JSON_UNESCAPED_UNICODE);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// -------------------------------------------------------------------------
// DELETE / Action=delete
// -------------------------------------------------------------------------
if ($method === 'DELETE' || ($method === 'POST' && (isset($_GET['action']) && $_GET['action'] === 'delete' || isset($input['action']) && $input['action'] === 'delete'))) {
    $del_id = $_GET['id'] ?? $input['id'] ?? '';
    if (empty($del_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required to delete']);
        exit();
    }
    DB::delete('subcategories', $del_id);
    echo json_encode(['status' => 'success']);
    exit();
}

// -------------------------------------------------------------------------
// POST: Add new subcategories
// -------------------------------------------------------------------------
if ($method === 'POST') {
    if (empty($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'No data provided']);
        exit();
    }

    $existing = getSubcategories();
    $added = [];
    $rows = isset($input[0]) && is_array($input[0]) ? $input : [$input];

    foreach ($rows as $row) {
        $name = trim($row['name'] ?? '');
        $cat  = trim($row['category_name'] ?? '');
        if (empty($name) || empty($cat)) continue;

        $already = false;
        foreach ($existing as $e) {
            if (($e['name'] ?? '') === $name && ($e['category_name'] ?? '') === $cat) {
                $already = true;
                break;
            }
        }
        if ($already) continue;

        $new_item = [
            'id'            => uniqid('sub_'),
            'category_name' => $cat,
            'name'          => $name,
            'position'      => (int)($row['position'] ?? 0),
            'created_at'    => date('c')
        ];
        DB::insert('subcategories', $new_item);
        $added[] = $new_item;
    }

    echo json_encode([
        'status'  => 'success',
        'success' => true,
        'added'   => count($added),
        'data'    => $added
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
