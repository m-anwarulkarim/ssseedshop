<?php
// api/blogs/get.php
// Ss Seed Shop Blog Posts Fetch API

require_once __DIR__ . '/../db.php';

$json_file = __DIR__ . '/../database/blogs.json';

$blogs = DB::all('blogs', 'position ASC, created_at DESC');

// Single blog by ID or Slug
$id   = $_GET['id'] ?? null;
$slug = $_GET['slug'] ?? null;

if ($id || $slug) {
    foreach ($blogs as $b) {
        if (($id && ($b['id'] ?? '') === $id) || ($slug && ($b['slug'] ?? '') === $slug)) {
            echo json_encode($b, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Blog not found']);
    exit;
}

// Filter published only if requested
if (isset($_GET['published']) && ($_GET['published'] === '1' || $_GET['published'] === 'true')) {
    $blogs = array_values(array_filter($blogs, function ($b) {
        return !empty($b['is_published']);
    }));
}

// Filter category if requested
if (!empty($_GET['category'])) {
    $cat = trim($_GET['category']);
    $blogs = array_values(array_filter($blogs, function ($b) use ($cat) {
        return ($b['category'] ?? '') === $cat;
    }));
}

// Sort by position ascending, then created_at descending
usort($blogs, function ($a, $b) {
    $posA = intval($a['position'] ?? 0);
    $posB = intval($b['position'] ?? 0);
    if ($posA !== $posB) {
        return $posA <=> $posB;
    }
    return strtotime($b['created_at'] ?? '') <=> strtotime($a['created_at'] ?? '');
});

echo json_encode(array_values($blogs), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
