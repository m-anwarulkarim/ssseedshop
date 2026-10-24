<?php
// api/products/get.php
require_once __DIR__ . '/../db.php';

header_remove('Pragma');
header_remove('Expires');
header('Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600');

try {
    // Query single product by id
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $p = DB::find('products', (string)$_GET['id']);
        if ($p) {
            $stock = isset($p['stock']) ? (int)$p['stock'] : 0;
            $avail = isset($p['available_stock']) && $p['available_stock'] !== null ? (int)$p['available_stock'] : $stock;
            $p['available_stock'] = $avail;
            $p['stock'] = $stock;
            if ($stock <= 0 && $avail <= 0) {
                $p['in_stock'] = false;
            }
            echo json_encode($p, JSON_UNESCAPED_UNICODE);
            exit();
        }
        http_response_code(404);
        echo json_encode(['error' => 'Product not found', 'id' => $_GET['id']]);
        exit();
    }

    $products = DB::all('products', 'position ASC');

    // Search filter
    if (!empty($_GET['search'])) {
        $rawS = trim((string)$_GET['search']);
        $s = function_exists('mb_strtolower') ? mb_strtolower($rawS, 'UTF-8') : strtolower($rawS);
        $products = array_filter($products, function($p) use ($s) {
            $name = (string)($p['name'] ?? '');
            $sku  = (string)($p['sku'] ?? '');
            $nameLower = function_exists('mb_strtolower') ? mb_strtolower($name, 'UTF-8') : strtolower($name);
            $skuLower  = function_exists('mb_strtolower') ? mb_strtolower($sku, 'UTF-8') : strtolower($sku);
            return strpos($nameLower, $s) !== false || strpos($skuLower, $s) !== false;
        });
    }

    // Category filter
    if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
        $cat = trim($_GET['category']);
        $products = array_filter($products, function($p) use ($cat) {
            $cats = (array)($p['categories'] ?? []);
            return ($p['category'] ?? '') === $cat || in_array($cat, $cats);
        });
    }

    $includeFull = isset($_GET['full']) && ($_GET['full'] === '1' || $_GET['full'] === 'true');

    // Helper for safe multi-byte truncation without character corruption
    $safeTruncate = function($text, $maxLen = 120) {
        if (function_exists('mb_substr')) {
            return mb_substr($text, 0, $maxLen, 'UTF-8');
        }
        if (preg_match('/^.{1,' . (int)$maxLen . '}/us', $text, $match)) {
            return $match[0];
        }
        return substr($text, 0, $maxLen);
    };

    // Normalize stock and available_stock for all products, strip full_description for listing
    foreach ($products as &$p) {
        $stock = isset($p['stock']) ? (int)$p['stock'] : 0;
        $avail = isset($p['available_stock']) && $p['available_stock'] !== null ? (int)$p['available_stock'] : $stock;
        $p['available_stock'] = $avail;
        $p['stock'] = $stock;
        if ($stock <= 0 && $avail <= 0) {
            $p['in_stock'] = false;
        }

        if (!$includeFull) {
            if (empty($p['short_description']) && !empty($p['full_description'])) {
                $plain = trim(strip_tags((string)$p['full_description']));
                $p['short_description'] = $safeTruncate($plain, 120);
            }
            unset($p['full_description']);
        }
    }
    unset($p);

    // Sort by position
    usort($products, function($a, $b) {
        return ($a['position'] ?? 0) - ($b['position'] ?? 0);
    });

    echo json_encode(array_values($products), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
