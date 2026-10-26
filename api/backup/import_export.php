<?php
// api/backup/import_export.php
// AgroSeed Full Data Backup, Export & Import API (JSON & CSV)

require_once __DIR__ . '/../db.php';

$db_dir = __DIR__ . '/../database';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getJsonData($filename) {
    $table = basename($filename, '.json');
    return DB::all($table);
}

function saveJsonData($filename, $data) {
    $table = basename($filename, '.json');
    return DB::saveAll($table, $data);
}

// Helper to extract order items from orders
function extractOrderItems($orders) {
    $items = [];
    foreach ($orders as $order) {
        $order_id = $order['order_id'] ?? $order['id'] ?? '';
        $order_created = $order['created_at'] ?? date('c');
        if (!empty($order['items']) && is_array($order['items'])) {
            foreach ($order['items'] as $item) {
                $items[] = [
                    'order_id'       => $order_id,
                    'product_id'     => $item['product_id'] ?? $item['id'] ?? '',
                    'product_name'   => $item['product_name'] ?? $item['name'] ?? '',
                    'product_image'  => $item['product_image'] ?? $item['image'] ?? '',
                    'quantity'       => intval($item['quantity'] ?? $item['qty'] ?? 1),
                    'unit_price'     => floatval($item['unit_price'] ?? $item['price'] ?? 0),
                    'delivered_qty'  => intval($item['delivered_qty'] ?? 0),
                    'returned_qty'   => intval($item['returned_qty'] ?? 0),
                    'created_at'     => $order_created
                ];
            }
        }
    }
    return $items;
}

// -----------------------------------------------------------------------------
// 1. GET: Export & Full Backup
// -----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action   = $_GET['action'] ?? '';
    $table    = $_GET['table'] ?? '';
    $format   = strtolower($_GET['format'] ?? 'csv');
    $download = isset($_GET['download']) && ($_GET['download'] === '1' || $_GET['download'] === 'true');

    // Action: FULL BACKUP (JSON)
    if ($action === 'full_backup' || $table === 'all' || $table === 'full') {
        $orders      = getJsonData('orders.json');
        $products    = getJsonData('products.json');
        $customers   = getJsonData('customers.json');
        $categories  = getJsonData('categories.json');
        $subcats     = getJsonData('subcategories.json');
        $coupons     = getJsonData('coupons.json');
        $settings    = getJsonData('settings.json');
        $sms_logs    = getJsonData('sms_logs.json');
        $order_items = extractOrderItems($orders);

        $backup = [
            'version'     => 2,
            'exported_at' => date('c'),
            'tables'      => [
                'products'       => $products,
                'orders_all'     => $orders,
                'order_items'    => $order_items,
                'customers'      => $customers,
                'categories'     => $categories,
                'subcategories'  => $subcats,
                'coupons'        => $coupons,
                'app_settings'   => $settings,
                'sms_logs'       => $sms_logs
            ]
        ];

        if ($download) {
            header('Content-Type: application/json; charset=utf-8');
            header('Content-Disposition: attachment; filename="full-backup-' . date('Y-m-d') . '.json"');
        } else {
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Specific Table Export
    $rows = [];
    $defaultColumns = [];

    switch ($table) {
        case 'products':
            $rows = getJsonData('products.json');
            $defaultColumns = ["name","sku","category","subcategory","regular_price","offer_price","buying_price","stock","is_hidden","tags","short_description","full_description","product_image"];
            break;
        case 'orders':
        case 'orders_all':
            $rows = getJsonData('orders.json');
            $defaultColumns = ["order_id","customer_name","phone","alt_phone","address","district","thana","delivery_area","status","total_amount","delivery_charge","advance","discount","note","tracking_code","created_at"];
            break;
        case 'order_items':
            $orders = getJsonData('orders.json');
            $rows = extractOrderItems($orders);
            $defaultColumns = ["order_id","product_id","product_name","product_image","quantity","unit_price","created_at"];
            break;
        case 'customers':
            $rows = getJsonData('customers.json');
            $defaultColumns = ["phone","name","alt_phone","address","district","thana","total_orders","total_spent","created_at"];
            break;
        case 'categories':
            $rows = getJsonData('categories.json');
            $defaultColumns = ["name","display_name","description","image","position"];
            break;
        case 'coupons':
            $rows = getJsonData('coupons.json');
            $defaultColumns = ["code","discount_type","discount_value","min_order_amount","max_discount_amount","usage_limit","used_count","is_active","starts_at","expires_at"];
            break;
        case 'sms_logs':
            $rows = getJsonData('sms_logs.json');
            $defaultColumns = ["id","order_id","phone","message","status","reason","timestamp"];
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Unknown table: ' . $table]);
            exit;
    }

    if ($format === 'json') {
        if ($download) {
            header('Content-Type: application/json; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $table . '_' . date('Y-m-d') . '.json"');
        } else {
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // CSV Export
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $table . '_' . date('Y-m-d') . '.csv"');

    // Output UTF-8 BOM so Excel opens Bengali properly
    echo "\xEF\xBB\xBF";

    $output = fopen('php://output', 'w');

    // Determine CSV headers
    if (!empty($rows)) {
        $first = $rows[0];
        $headers = !empty($defaultColumns) ? $defaultColumns : array_keys($first);
    } else {
        $headers = $defaultColumns;
    }

    fputcsv($output, $headers);

    foreach ($rows as $row) {
        $line = [];
        foreach ($headers as $col) {
            $val = $row[$col] ?? '';
            if (is_array($val)) {
                $line[] = implode('|', $val);
            } elseif (is_bool($val)) {
                $line[] = $val ? 'true' : 'false';
            } else {
                $line[] = (string)$val;
            }
        }
        fputcsv($output, $line);
    }

    fclose($output);
    exit;
}

// -----------------------------------------------------------------------------
// 2. POST: Import CSV / JSON & Full Restore
// -----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Get raw file or body content
    $content = '';
    $filename = '';
    $table = $_POST['table'] ?? $_GET['table'] ?? '';
    $action = $_POST['action'] ?? $_GET['action'] ?? '';

    if (!empty($_FILES['file']['tmp_name'])) {
        $content = file_get_contents($_FILES['file']['tmp_name']);
        $filename = $_FILES['file']['name'];
    } elseif (!empty($_FILES['backup_file']['tmp_name'])) {
        $content = file_get_contents($_FILES['backup_file']['tmp_name']);
        $filename = $_FILES['backup_file']['name'];
    } else {
        $raw = file_get_contents('php://input');
        $json_input = json_decode($raw, true);
        if ($json_input) {
            if (isset($json_input['action'])) $action = $json_input['action'];
            if (isset($json_input['table'])) $table = $json_input['table'];
            if (isset($json_input['content'])) $content = $json_input['content'];
            elseif (isset($json_input['tables'])) {
                $content = $raw;
                $action = 'full_restore';
            }
        } else {
            $content = $raw;
        }
    }

    if (empty($content)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No file content received']);
        exit;
    }

    // A. Action: FULL RESTORE (JSON)
    if ($action === 'full_restore' || strpos(trim($content), '{"version"') === 0 || (strpos($filename, 'full-backup') !== false && substr($filename, -5) === '.json')) {
        $backup = json_decode($content, true);
        if (!$backup || !isset($backup['tables']) || !is_array($backup['tables'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid full backup JSON file structure']);
            exit;
        }

        $results = [];

        // 1. Products
        if (isset($backup['tables']['products']) && is_array($backup['tables']['products'])) {
            $existing_products = getJsonData('products.json');
            $prod_map = [];
            foreach ($existing_products as $idx => $p) {
                $sku = trim(strtolower($p['sku'] ?? $p['id'] ?? ''));
                if ($sku) $prod_map[$sku] = $idx;
            }
            $p_inserted = 0; $p_updated = 0;
            foreach ($backup['tables']['products'] as $item) {
                $sku = trim(strtolower($item['sku'] ?? $item['id'] ?? ''));
                if ($sku && isset($prod_map[$sku])) {
                    $existing_products[$prod_map[$sku]] = array_merge($existing_products[$prod_map[$sku]], $item);
                    $p_updated++;
                } else {
                    if (empty($item['id'])) $item['id'] = 'prod_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
                    $existing_products[] = $item;
                    if ($sku) $prod_map[$sku] = count($existing_products) - 1;
                    $p_inserted++;
                }
            }
            saveJsonData('products.json', $existing_products);
            $results['products'] = "{$p_inserted} new, {$p_updated} updated";
        }

        // 2. Orders
        if (isset($backup['tables']['orders_all']) && is_array($backup['tables']['orders_all'])) {
            $existing_orders = getJsonData('orders.json');
            $order_map = [];
            foreach ($existing_orders as $idx => $o) {
                $oid = (string)($o['order_id'] ?? $o['id'] ?? '');
                if ($oid) $order_map[$oid] = $idx;
            }
            $o_inserted = 0; $o_updated = 0;
            foreach ($backup['tables']['orders_all'] as $item) {
                $oid = (string)($item['order_id'] ?? $item['id'] ?? '');
                if ($oid && isset($order_map[$oid])) {
                    $existing_orders[$order_map[$oid]] = array_merge($existing_orders[$order_map[$oid]], $item);
                    $o_updated++;
                } else {
                    $existing_orders[] = $item;
                    if ($oid) $order_map[$oid] = count($existing_orders) - 1;
                    $o_inserted++;
                }
            }
            saveJsonData('orders.json', $existing_orders);
            $results['orders'] = "{$o_inserted} new, {$o_updated} updated";
        }

        // 3. Customers
        if (isset($backup['tables']['customers']) && is_array($backup['tables']['customers'])) {
            $existing_customers = getJsonData('customers.json');
            $cust_map = [];
            foreach ($existing_customers as $idx => $c) {
                $phone = trim($c['phone'] ?? '');
                if ($phone) $cust_map[$phone] = $idx;
            }
            $c_inserted = 0; $c_updated = 0;
            foreach ($backup['tables']['customers'] as $item) {
                $phone = trim($item['phone'] ?? '');
                if ($phone && isset($cust_map[$phone])) {
                    $existing_customers[$cust_map[$phone]] = array_merge($existing_customers[$cust_map[$phone]], $item);
                    $c_updated++;
                } else {
                    $existing_customers[] = $item;
                    if ($phone) $cust_map[$phone] = count($existing_customers) - 1;
                    $c_inserted++;
                }
            }
            saveJsonData('customers.json', $existing_customers);
            $results['customers'] = "{$c_inserted} new, {$c_updated} updated";
        }

        // 4. Coupons
        if (isset($backup['tables']['coupons']) && is_array($backup['tables']['coupons'])) {
            $existing_coupons = getJsonData('coupons.json');
            $coup_map = [];
            foreach ($existing_coupons as $idx => $cp) {
                $code = strtoupper(trim($cp['code'] ?? ''));
                if ($code) $coup_map[$code] = $idx;
            }
            $cp_inserted = 0; $cp_updated = 0;
            foreach ($backup['tables']['coupons'] as $item) {
                $code = strtoupper(trim($item['code'] ?? ''));
                if ($code && isset($coup_map[$code])) {
                    $existing_coupons[$coup_map[$code]] = array_merge($existing_coupons[$coup_map[$code]], $item);
                    $cp_updated++;
                } else {
                    if (empty($item['id'])) $item['id'] = 'coup_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
                    $existing_coupons[] = $item;
                    if ($code) $coup_map[$code] = count($existing_coupons) - 1;
                    $cp_inserted++;
                }
            }
            saveJsonData('coupons.json', $existing_coupons);
            $results['coupons'] = "{$cp_inserted} new, {$cp_updated} updated";
        }

        // 5. Categories
        if (isset($backup['tables']['categories']) && is_array($backup['tables']['categories'])) {
            $existing_cats = getJsonData('categories.json');
            $cat_map = [];
            foreach ($existing_cats as $idx => $ct) {
                $cname = trim($ct['name'] ?? '');
                if ($cname) $cat_map[$cname] = $idx;
            }
            foreach ($backup['tables']['categories'] as $item) {
                $cname = trim($item['name'] ?? '');
                if ($cname && isset($cat_map[$cname])) {
                    $existing_cats[$cat_map[$cname]] = array_merge($existing_cats[$cat_map[$cname]], $item);
                } else {
                    $existing_cats[] = $item;
                    if ($cname) $cat_map[$cname] = count($existing_cats) - 1;
                }
            }
            saveJsonData('categories.json', $existing_cats);
            $results['categories'] = count($existing_cats) . " records";
        }

        echo json_encode([
            'success' => true,
            'message' => 'Full backup restored and merged successfully',
            'results' => $results
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // B. Table-Specific Import (CSV or JSON)
    // Strip UTF-8 BOM
    $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
    $rows = [];

    // Check if JSON
    $decoded_json = json_decode($content, true);
    if (is_array($decoded_json)) {
        $rows = $decoded_json;
    } else {
        // Parse CSV stream properly supporting multiline fields enclosed in quotes (RFC 4180)
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $content);
        rewind($stream);

        $headers = null;
        while (($data = fgetcsv($stream)) !== false) {
            if ($headers === null) {
                if (empty($data) || (count($data) === 1 && trim($data[0]) === '')) continue;
                $headers = array_map(function($h) {
                    return trim(preg_replace('/^\xEF\xBB\xBF/', '', (string)$h));
                }, $data);
                continue;
            }

            if (empty($data) || (count($data) === 1 && trim($data[0]) === '')) {
                continue;
            }

            $row = [];
            foreach ($headers as $i => $h) {
                if (!$h) continue;
                $val = isset($data[$i]) ? trim($data[$i]) : null;
                if ($val === null || $val === '') {
                    $row[$h] = null;
                } elseif (in_array(strtolower($val), ['true', '1'], true)) {
                    $row[$h] = true;
                } elseif (in_array(strtolower($val), ['false', '0'], true)) {
                    $row[$h] = false;
                } elseif (is_numeric($val) && strpos($h, 'phone') === false && strpos($h, 'order_id') === false) {
                    $row[$h] = strpos($val, '.') !== false ? floatval($val) : intval($val);
                } elseif (in_array($h, ['categories', 'tags', 'image_gallery']) && strpos($val, '|') !== false) {
                    $row[$h] = array_values(array_filter(explode('|', $val)));
                } else {
                    $row[$h] = $val;
                }
            }

            // Guard: ensure row has at least an id, sku, name, order_id, phone, or code
            if (!empty($row['name']) || !empty($row['sku']) || !empty($row['id']) || !empty($row['order_id']) || !empty($row['phone']) || !empty($row['code'])) {
                $rows[] = $row;
            }
        }
        fclose($stream);

        if (count($rows) === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'CSV file has no valid data rows']);
            exit;
        }
    }

    $inserted = 0;
    $updated  = 0;
    $errors   = 0;
    $total    = count($rows);

    // Auto-backup current data before import
    try {
        $backup_dir = __DIR__ . '/../database/backups';
        if (!is_dir($backup_dir)) @mkdir($backup_dir, 0755, true);
        $curr_data = getJsonData("{$table}.json");
        if (!empty($curr_data)) {
            $bk_name = $backup_dir . "/pre_import_{$table}_" . date('Ymd_His') . ".json";
            @file_put_contents($bk_name, json_encode($curr_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    } catch (\Exception $e) {}

    // Merge into target table
    if ($table === 'products') {
        $existing = getJsonData('products.json');
        $map = [];
        foreach ($existing as $idx => $p) {
            $sku = trim(strtolower($p['sku'] ?? $p['id'] ?? ''));
            if ($sku) $map[$sku] = $idx;
        }

        foreach ($rows as $r) {
            // Guard: skip empty or corrupted html fragment rows
            if (empty($r['name']) && empty($r['sku'])) continue;
            if (!empty($r['name']) && in_array(trim($r['name']), ['</ul>', '</li>', '</div>', '<p>', '</p>'])) continue;

            $sku = trim(strtolower($r['sku'] ?? $r['id'] ?? ''));
            if ($sku && isset($map[$sku])) {
                $existing[$map[$sku]] = array_merge($existing[$map[$sku]], $r);
                $updated++;
            } else {
                if (empty($r['id'])) $r['id'] = 'prod_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
                $existing[] = $r;
                if ($sku) $map[$sku] = count($existing) - 1;
                $inserted++;
            }
        }
        saveJsonData('products.json', $existing);

    } elseif ($table === 'coupons') {
        $existing = getJsonData('coupons.json');
        $map = [];
        foreach ($existing as $idx => $cp) {
            $code = strtoupper(trim($cp['code'] ?? ''));
            if ($code) $map[$code] = $idx;
        }

        foreach ($rows as $r) {
            $code = strtoupper(trim($r['code'] ?? ''));
            if ($code && isset($map[$code])) {
                $existing[$map[$code]] = array_merge($existing[$map[$code]], $r);
                $updated++;
            } else {
                if (empty($r['id'])) $r['id'] = 'coup_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
                $existing[] = $r;
                if ($code) $map[$code] = count($existing) - 1;
                $inserted++;
            }
        }
        saveJsonData('coupons.json', $existing);

    } elseif ($table === 'customers') {
        $existing = getJsonData('customers.json');
        $map = [];
        foreach ($existing as $idx => $c) {
            $phone = trim($c['phone'] ?? '');
            if ($phone) $map[$phone] = $idx;
        }

        foreach ($rows as $r) {
            $phone = trim($r['phone'] ?? '');
            if ($phone && isset($map[$phone])) {
                $existing[$map[$phone]] = array_merge($existing[$map[$phone]], $r);
                $updated++;
            } else {
                $existing[] = $r;
                if ($phone) $map[$phone] = count($existing) - 1;
                $inserted++;
            }
        }
        saveJsonData('customers.json', $existing);

    } elseif ($table === 'orders' || $table === 'orders_all') {
        $existing = getJsonData('orders.json');
        $map = [];
        foreach ($existing as $idx => $o) {
            $oid = (string)($o['order_id'] ?? $o['id'] ?? '');
            if ($oid) $map[$oid] = $idx;
        }

        foreach ($rows as $r) {
            $oid = (string)($r['order_id'] ?? $r['id'] ?? '');
            if ($oid && isset($map[$oid])) {
                $existing[$map[$oid]] = array_merge($existing[$map[$oid]], $r);
                $updated++;
            } else {
                $existing[] = $r;
                if ($oid) $map[$oid] = count($existing) - 1;
                $inserted++;
            }
        }
        saveJsonData('orders.json', $existing);

    } elseif ($table === 'categories') {
        $existing = getJsonData('categories.json');
        $map = [];
        foreach ($existing as $idx => $ct) {
            $cname = trim($ct['name'] ?? '');
            if ($cname) $map[$cname] = $idx;
        }

        foreach ($rows as $r) {
            $cname = trim($r['name'] ?? '');
            if ($cname && isset($map[$cname])) {
                $existing[$map[$cname]] = array_merge($existing[$map[$cname]], $r);
                $updated++;
            } else {
                $existing[] = $r;
                if ($cname) $map[$cname] = count($existing) - 1;
                $inserted++;
            }
        }
        saveJsonData('categories.json', $existing);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unsupported table for import: ' . $table]);
        exit;
    }

    echo json_encode([
        'success'  => true,
        'table'    => $table,
        'total'    => $total,
        'inserted' => $inserted,
        'updated'  => $updated,
        'errors'   => $errors,
        'message'  => "ইমপোর্ট সম্পন্ন: {$inserted} নতুন, {$updated} আপডেট"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
