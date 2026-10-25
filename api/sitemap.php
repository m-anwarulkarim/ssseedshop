<?php
/**
 * Dynamic XML Sitemap Generator
 * Automatically queries products and categories from MySQL database
 * Dynamically resolves domain (e.g. ssseedshop.com or abseed.com.bd)
 * Includes Google Image Sitemap extensions for maximum image SEO visibility.
 */

require_once __DIR__ . '/db.php';

header_remove('Pragma');
header_remove('Expires');
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400');

function xmlEscape(string $str): string {
    return htmlspecialchars($str, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

// 1. Resolve host and base frontend URL
$rawHost = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? 'ssseedshop.com';
$rawHost = preg_replace('/:\d+$/', '', trim($rawHost));

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
           (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
           (!in_array(strtolower($rawHost), ['localhost', '127.0.0.1']));

$scheme = $isHttps ? 'https' : 'http';

// If called via api.subdomain, strip api. for frontend URLs
$frontendHost = $rawHost;
if (strpos($frontendHost, 'api.') === 0) {
    $frontendHost = substr($frontendHost, 4);
}

$baseUrl = rtrim("$scheme://$frontendHost", '/');
$today = date('Y-m-d');

// 2. Fetch products and categories
$products = [];
$categories = [];

try {
    $allProducts = DB::all('products', 'position ASC');
    $products = array_filter($allProducts, function($p) {
        return empty($p['is_hidden']) || $p['is_hidden'] == 0 || $p['is_hidden'] === false;
    });
} catch (Exception $e) {
    $products = [];
}

try {
    $allCategories = DB::all('categories', 'position ASC');
    $categories = array_filter($allCategories, function($c) {
        return !isset($c['is_active']) || $c['is_active'] == 1 || $c['is_active'] === true;
    });
} catch (Exception $e) {
    $categories = [];
}

// 3. Static main pages
$staticPages = [
    ['loc' => "$baseUrl/", 'priority' => '1.0', 'changefreq' => 'daily'],
    ['loc' => "$baseUrl/all-products", 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => "$baseUrl/products", 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => "$baseUrl/categories", 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => "$baseUrl/cultivation-guide", 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => "$baseUrl/help", 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => "$baseUrl/delivery-charge", 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => "$baseUrl/return-policy", 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => "$baseUrl/terms-conditions", 'priority' => '0.5', 'changefreq' => 'monthly'],
    ['loc' => "$baseUrl/privacy-policy", 'priority' => '0.5', 'changefreq' => 'monthly'],
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- ==================== STATIC MAIN PAGES ==================== -->
<?php foreach ($staticPages as $page): ?>
  <url>
    <loc><?= xmlEscape($page['loc']) ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq><?= $page['changefreq'] ?></changefreq>
    <priority><?= $page['priority'] ?></priority>
  </url>
<?php endforeach; ?>

  <!-- ==================== CATEGORIES ==================== -->
<?php foreach ($categories as $cat): 
    $catName = $cat['name'] ?? '';
    if (empty($catName)) continue;
    $catUrl = "$baseUrl/category/" . rawurlencode($catName);
    $catImage = !empty($cat['image']) ? $cat['image'] : (!empty($cat['image_url']) ? $cat['image_url'] : null);
?>
  <url>
    <loc><?= xmlEscape($catUrl) ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
<?php if ($catImage): ?>
    <image:image>
      <image:loc><?= xmlEscape($catImage) ?></image:loc>
      <image:title><?= xmlEscape(($cat['display_name'] ?? $catName) . ' বীজ') ?></image:title>
    </image:image>
<?php endif; ?>
  </url>
<?php endforeach; ?>

  <!-- ==================== PRODUCTS ==================== -->
<?php foreach ($products as $prod): 
    $slug = !empty($prod['slug']) ? $prod['slug'] : ($prod['id'] ?? '');
    if (empty($slug)) continue;
    $prodUrl = "$baseUrl/product/" . rawurlencode($slug);
    $updatedAt = !empty($prod['updated_at']) ? substr($prod['updated_at'], 0, 10) : $today;
    $prodImage = !empty($prod['product_image']) ? $prod['product_image'] : null;
    $prodName = $prod['name'] ?? 'বীজ';
?>
  <url>
    <loc><?= xmlEscape($prodUrl) ?></loc>
    <lastmod><?= xmlEscape($updatedAt) ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
<?php if ($prodImage): ?>
    <image:image>
      <image:loc><?= xmlEscape($prodImage) ?></image:loc>
      <image:title><?= xmlEscape($prodName) ?></image:title>
    </image:image>
<?php endif; ?>
  </url>
<?php endforeach; ?>

</urlset>
