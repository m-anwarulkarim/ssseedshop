<?php
// api/blogs/save.php
// Ss Seed Shop Blog Post Create & Update API

require_once __DIR__ . '/../db.php';

$json_file = __DIR__ . '/../database/blogs.json';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (empty($input['title'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Title is required']);
    exit;
}

$blogs = DB::all('blogs');

$id = $input['id'] ?? null;
$title = trim($input['title']);
$slug = !empty($input['slug']) ? trim($input['slug']) : strtolower(trim(preg_replace('/[^a-zA-Z0-9\x{0980}-\x{09FF}]+/u', '-', $title), '-'));

$now = date('c');
$saved_blog = null;

if ($id) {
    // Update existing
    $found = false;
    foreach ($blogs as $k => $b) {
        if (($b['id'] ?? '') === $id) {
            $blogs[$k] = array_merge($b, [
                'title'        => $title,
                'slug'         => $slug,
                'cover_image'  => $input['cover_image'] ?? $b['cover_image'] ?? null,
                'excerpt'      => $input['excerpt'] ?? $b['excerpt'] ?? null,
                'content'      => $input['content'] ?? $b['content'] ?? '',
                'category'     => $input['category'] ?? $b['category'] ?? null,
                'is_published' => isset($input['is_published']) ? (bool)$input['is_published'] : ($b['is_published'] ?? true),
                'position'     => isset($input['position']) ? intval($input['position']) : ($b['position'] ?? 0),
                'updated_at'   => $now,
            ]);
            $saved_blog = $blogs[$k];
            $found = true;
            break;
        }
    }
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Blog not found for update']);
        exit;
    }
} else {
    // Insert new
    $new_id = 'blog_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
    $saved_blog = [
        'id'           => $new_id,
        'title'        => $title,
        'slug'         => $slug,
        'cover_image'  => $input['cover_image'] ?? null,
        'excerpt'      => $input['excerpt'] ?? null,
        'content'      => $input['content'] ?? '',
        'category'     => $input['category'] ?? null,
        'is_published' => isset($input['is_published']) ? (bool)$input['is_published'] : true,
        'position'     => isset($input['position']) ? intval($input['position']) : 0,
        'created_at'   => $now,
        'updated_at'   => $now,
    ];
    array_unshift($blogs, $saved_blog);
}

DB::saveAll('blogs', array_values($blogs));

echo json_encode([
    'success' => true,
    'status'  => 'success',
    'message' => $id ? 'Blog updated successfully' : 'Blog created successfully',
    'data'    => $saved_blog,
    'id'      => $saved_blog['id']
], JSON_UNESCAPED_UNICODE);
