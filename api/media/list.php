<?php
// api/media/list.php
// Lists uploaded media files for Ss Seed Shop
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

$upload_dir = __DIR__ . '/../uploads';
if (!is_dir($upload_dir)) {
    echo json_encode([], JSON_UNESCAPED_SLASHES);
    exit();
}

$is_ssl = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$host = $_SERVER['HTTP_HOST'] ?? 'api.ssseedshop.com';
$is_local = in_array(explode(':', $host)[0], ['localhost', '127.0.0.1']);
$protocol = ($is_ssl || !$is_local) ? "https://" : "http://";
$script_dir = dirname($_SERVER['SCRIPT_NAME']);
$base_url = preg_replace('/\/media$/', '', $script_dir);

$files = scandir($upload_dir);
$results = [];
foreach ($files as $f) {
    if ($f === '.' || $f === '..' || $f === '.htaccess' || $f === 'index.html') continue;
    $filePath = $upload_dir . '/' . $f;
    if (!is_file($filePath)) continue;

    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    $mime = 'image/jpeg';
    if ($ext === 'png') $mime = 'image/png';
    elseif ($ext === 'webp') $mime = 'image/webp';
    elseif ($ext === 'gif') $mime = 'image/gif';
    elseif ($ext === 'svg') $mime = 'image/svg+xml';

    $results[] = [
        'name'       => $f,
        'url'        => $protocol . $host . $base_url . '/uploads/' . $f,
        'size'       => filesize($filePath),
        'mimetype'   => $mime,
        'created_at' => date('c', filemtime($filePath))
    ];
}

usort($results, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

echo json_encode($results, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
?>
