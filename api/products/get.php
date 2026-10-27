<?php
// api/products/get.php
// Ss Seed Shop - Optimized High-Performance Products API
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
    // Fast edge and browser caching with background revalidation
    header('Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600');
}

try {
    // 1. Single product lookup by ID
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $p = DB::find('products', (string)$_GET['id'], 'id');
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

    // 2. Single product lookup by slug
    if (isset($_GET['slug']) && $_GET['slug'] !== '') {
        $p = DB::find('products', (string)$_GET['slug'], 'slug');
        if (!$p) {
            $p = DB::find('products', (string)$_GET['slug'], 'id');
        }
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
        echo json_encode(['error' => 'Product not found', 'slug' => $_GET['slug']]);
        exit();
    }

    $includeFull = isset($_GET['full']) && ($_GET['full'] === '1' || $_GET['full'] === 'true');
    $pdo = DB::pdo();
    $products = null;

    // 3. Fast SQL Projection for Public Store (Omit heavy full_description blob & image_gallery)
    // Pushes down index filtering into MySQL (idx_prod_hidden, idx_prod_position)
    if ($pdo && !$isAdmin && !$includeFull) {
        $sql = "SELECT 
                    `id`, `name`, `slug`, `sku`, `category`, `categories`, `subcategory`, 
                    `tag`, `tags`, `product_image`, `regular_price`, `offer_price`, `buying_price`, 
                    `short_description`, `in_stock`, `available_stock`, `stock`, `position`, 
                    `is_hidden`, `package_tiers`, `highlight_features`, `trust_card_1_title`, 
                    `trust_card_1_text`, `trust_card_2_title`, `trust_card_2_text`, `created_at`, `updated_at`
                FROM `products`
                WHERE `is_hidden` = 0";
        $params = [];

        if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
            $cat = trim($_GET['category']);
            $sql .= " AND (`category` = :cat OR `categories` LIKE :cat_like)";
            $params[':cat'] = $cat;
            $params[':cat_like'] = '%"' . $cat . '"%';
        }

        if (!empty($_GET['search'])) {
            $rawS = trim((string)$_GET['search']);
            $sql .= " AND (`name` LIKE :search OR `sku` LIKE :search)";
            $params[':search'] = '%' . $rawS . '%';
        }

        $sql .= " ORDER BY `position` ASC, `created_at` DESC";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rawRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $products = [];
            foreach ($rawRows as $r) {
                if (isset($r['categories']) && is_string($r['categories'])) {
                    $dec = json_decode($r['categories'], true);
                    $r['categories'] = is_array($dec) ? $dec : [];
                }
                if (isset($r['tags']) && is_string($r['tags'])) {
                    $dec = json_decode($r['tags'], true);
                    $r['tags'] = is_array($dec) ? $dec : [];
                }
                if (isset($r['package_tiers']) && is_string($r['package_tiers'])) {
                    $dec = json_decode($r['package_tiers'], true);
                    $r['package_tiers'] = is_array($dec) ? $dec : [];
                }
                $r['in_stock'] = (bool)($r['in_stock'] ?? true);
                $r['is_hidden'] = (bool)($r['is_hidden'] ?? false);
                $products[] = $r;
            }
        } catch (Exception $e) {
            $products = null; // Gracefully fallback to DB::all if column missing or error
        }
    }

    // 4. Fallback or Admin / Full Fetch
    if ($products === null) {
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

        // Filter hidden for public visitors
        if (!$isAdmin) {
            $products = array_filter($products, fn($p) => empty($p['is_hidden']));
        }
    }

    // 5. Helper for safe multi-byte truncation without character corruption
    $safeTruncate = function($text, $maxLen = 120) {
        if (function_exists('mb_substr')) {
            return mb_substr($text, 0, $maxLen, 'UTF-8');
        }
        if (preg_match('/^.{1,' . (int)$maxLen . '}/us', $text, $match)) {
            return $match[0];
        }
        return substr($text, 0, $maxLen);
    };

    // 6. Normalize stock and available_stock for all products, strip full_description for listing
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

    // 7. Sort by position ASC, then created_at DESC
    usort($products, function($a, $b) {
        $posA = isset($a['position']) ? (int)$a['position'] : 0;
        $posB = isset($b['position']) ? (int)$b['position'] : 0;
        if ($posA !== $posB) {
            return $posA - $posB;
        }
        $tA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $tB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $tB - $tA;
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