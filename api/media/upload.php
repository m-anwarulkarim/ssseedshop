<?php
// api/media/upload.php
// Local File & Media Uploader with High-Efficiency WebP Optimization for Ss Seed Shop
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$file = $_FILES['file'] ?? $_FILES['image'] ?? null;
if (!$file || !isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errCode = $file['error'] ?? 'none';
    echo json_encode(['status' => 'error', 'message' => 'Upload failed or no file uploaded (Code: ' . $errCode . ')']);
    exit();
}

// Allowed extensions
$allowed_exts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp'];
$orig_name = $file['name'];
$ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));

if (!in_array($ext, $allowed_exts)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Unsupported format. Allowed: ' . implode(', ', $allowed_exts)]);
    exit();
}

// Upload directory: api/uploads/
$upload_dir = __DIR__ . '/../uploads';
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, 0755, true);
}

// Sanitize base filename
$base_name = pathinfo($orig_name, PATHINFO_FILENAME);
$safe_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $base_name);
if (empty($safe_name)) $safe_name = 'img';

$file_prefix = $safe_name . '_' . time() . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 6);
$target_base = $upload_dir . '/' . $file_prefix;

/**
 * Server-Side WebP Conversion & Optimization
 * Converts any raster image to WebP, scales to reasonable web max dimensions,
 * and maintains transparent PNG alpha channels.
 */
function processAndSaveImageAsWebP($tmp_path, $target_path_no_ext, $orig_ext, $max_dim = 1600, $quality = 82) {
    // Preserve vector SVGs as-is
    if ($orig_ext === 'svg') {
        $svg_path = $target_path_no_ext . '.svg';
        if (@move_uploaded_file($tmp_path, $svg_path)) {
            return ['success' => true, 'ext' => 'svg', 'path' => $svg_path];
        }
        return ['success' => false, 'ext' => 'svg', 'path' => null];
    }

    // Try GD extension conversion to WebP if available
    if (extension_loaded('gd') && function_exists('imagewebp')) {
        $info = @getimagesize($tmp_path);
        if ($info && !empty($info[2])) {
            $src = null;
            switch ($info[2]) {
                case IMAGETYPE_JPEG:
                    if (function_exists('imagecreatefromjpeg')) $src = @imagecreatefromjpeg($tmp_path);
                    break;
                case IMAGETYPE_PNG:
                    if (function_exists('imagecreatefrompng')) $src = @imagecreatefrompng($tmp_path);
                    break;
                case IMAGETYPE_WEBP:
                    if (function_exists('imagecreatefromwebp')) $src = @imagecreatefromwebp($tmp_path);
                    break;
                case IMAGETYPE_BMP:
                    if (function_exists('imagecreatefrombmp')) $src = @imagecreatefrombmp($tmp_path);
                    break;
            }

            if ($src) {
                $w = imagesx($src);
                $h = imagesy($src);

                // Resize down if exceeds maximum dimensions
                if ($w > $max_dim || $h > $max_dim) {
                    $ratio = min($max_dim / $w, $max_dim / $h);
                    $nw = max(1, (int)round($w * $ratio));
                    $nh = max(1, (int)round($h * $ratio));

                    $dst = imagecreatetruecolor($nw, $nh);
                    imagealphablending($dst, false);
                    imagesavealpha($dst, true);
                    $trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                    imagefilledrectangle($dst, 0, 0, $nw, $nh, $trans);

                    imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
                    imagedestroy($src);
                    $src = $dst;
                } else {
                    imagealphablending($src, false);
                    imagesavealpha($src, true);
                }

                $webp_dest = $target_path_no_ext . '.webp';
                if (@imagewebp($src, $webp_dest, $quality)) {
                    imagedestroy($src);
                    return ['success' => true, 'ext' => 'webp', 'path' => $webp_dest];
                }
                imagedestroy($src);
            }
        }
    }

    // Fallback: If GD is not present or already WebP / unconvertible, save directly
    $fallback_dest = $target_path_no_ext . '.' . $orig_ext;
    if (@move_uploaded_file($tmp_path, $fallback_dest)) {
        return ['success' => true, 'ext' => $orig_ext, 'path' => $fallback_dest];
    }

    return ['success' => false, 'ext' => $orig_ext, 'path' => null];
}

$save_result = processAndSaveImageAsWebP($file['tmp_name'], $target_base, $ext);

if (!$save_result['success'] || empty($save_result['path'])) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save file on server']);
    exit();
}

$final_filename = basename($save_result['path']);
$final_size = file_exists($save_result['path']) ? filesize($save_result['path']) : $file['size'];

// Build public URL with HTTPS support
$is_ssl = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$host = $_SERVER['HTTP_HOST'] ?? 'api.ssseedshop.com';
$is_local = in_array(explode(':', $host)[0], ['localhost', '127.0.0.1']);
$protocol = ($is_ssl || !$is_local) ? "https://" : "http://";

$script_dir = dirname($_SERVER['SCRIPT_NAME'] ?? '/media/upload.php');
$base_url = preg_replace('/\/media\/?$/', '', $script_dir);
if (!empty($base_url) && !str_starts_with($base_url, '/')) {
    $base_url = '/' . $base_url;
}
$base_url = rtrim($base_url, '/');
$public_url = $protocol . $host . $base_url . '/uploads/' . $final_filename;

echo json_encode([
    'status'   => 'success',
    'success'  => true,
    'url'      => $public_url,
    'filename' => $final_filename,
    'name'     => $orig_name,
    'size'     => $final_size,
    'format'   => $save_result['ext']
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
?>
