<?php
// api/db.php
// Dual-Engine Database Layer for AgroSeed (MySQL PDO with fallback/live backup to JSON)

// 1. Automatic Gzip compression for ultra-fast API transfer
if (!ob_get_level() && !headers_sent() && extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
    ob_start('ob_gzhandler');
}

// 2. Setup CORS to allow requests from Cloudflare / React frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400");
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Load Environment Variables from .env file
$env_path = __DIR__ . '/.env';
$env = [];
if (file_exists($env_path)) {
    $env = parse_ini_file($env_path);
}

// 3. Database Credentials
$driver  = strtolower($env['DB_CONNECTION'] ?? $env['DB_DRIVER'] ?? 'mysql');
$host    = $env['DB_HOST'] ?? 'localhost'; 
$port    = $env['DB_PORT'] ?? ($driver === 'pgsql' ? '5432' : '3306');
$db      = $env['DB_NAME'] ?? '';
$user    = $env['DB_USER'] ?? '';
$pass    = $env['DB_PASS'] ?? '';
$charset = 'utf8mb4';

$pdo = null;
$db_error = null;

$is_local_host = in_array(strtolower($host), ['localhost', '127.0.0.1', '::1']);
$can_attempt_connect = !empty($db) && $db !== 'cpanel_database_name' && !empty($user) && $user !== 'cpanel_database_user';

if ($can_attempt_connect && $is_local_host) {
    $tempFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'agroseed_db_offline';
    if (file_exists($tempFile) && (time() - filemtime($tempFile) < 120)) {
        $can_attempt_connect = false;
    } else {
        $sock = @fsockopen($host, (int)$port, $errno, $errstr, 0.02);
        if ($sock) {
            fclose($sock);
            if (file_exists($tempFile)) @unlink($tempFile);
        } else {
            @touch($tempFile);
            $can_attempt_connect = false;
        }
    }
}

if ($can_attempt_connect) {
    try {
        if ($driver === 'pgsql') {
            $dsn = "pgsql:host=$host;port=$port;dbname=$db";
        } else {
            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        }
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 2,
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        $pdo = null;
        $db_error = $e->getMessage();
    }
}

/**
 * AgroSeed Dual-Engine Database Access Layer
 */
class DB {
    private static $jsonCols = [
        'admins'            => ['permissions'],
        'products'          => ['categories', 'tags', 'image_gallery', 'variations'],
        'orders'            => ['items'],
        'incomplete_orders' => ['cart_snapshot'],
        'sms_logs'          => ['gateway'],
    ];

    public static function pdo(): ?PDO {
        global $pdo;
        return $pdo;
    }

    public static function isConnected(): bool {
        global $pdo;
        return $pdo !== null;
    }

    /**
     * Get JSON file path for a table
     */
    public static function getJsonFile(string $table): string {
        return __DIR__ . "/database/{$table}.json";
    }

    /**
     * Decode JSON string columns for a table row
     */
    private static function decodeRow(string $table, array $row): array {
        $cols = self::$jsonCols[$table] ?? [];
        foreach ($cols as $c) {
            if (isset($row[$c]) && is_string($row[$c])) {
                $decoded = json_decode($row[$c], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row[$c] = $decoded;
                }
            }
        }
        // Normalize boolean/numeric fields
        if (isset($row['in_stock'])) $row['in_stock'] = (bool)$row['in_stock'];
        if (isset($row['is_hidden'])) $row['is_hidden'] = (bool)$row['is_hidden'];
        if (isset($row['is_super_admin'])) $row['is_super_admin'] = (bool)$row['is_super_admin'];
        if (isset($row['phone_verified'])) $row['phone_verified'] = (bool)$row['phone_verified'];
        if (isset($row['is_active'])) $row['is_active'] = (bool)$row['is_active'];
        if (isset($row['is_published'])) $row['is_published'] = (bool)$row['is_published'];
        if (isset($row['sent'])) $row['sent'] = (bool)$row['sent'];
        if (isset($row['is_courier_entered'])) $row['is_courier_entered'] = (bool)$row['is_courier_entered'];
        if (isset($row['print_note'])) $row['print_note'] = (bool)$row['print_note'];
        if ($table === 'categories') {
            if (!empty($row['image_url']) && empty($row['image'])) {
                $row['image'] = $row['image_url'];
            }
            if (!empty($row['image']) && empty($row['image_url'])) {
                $row['image_url'] = $row['image'];
            }
        }
        return $row;
    }

    /**
     * Encode array columns before saving to SQL
     */
    private static function encodeRow(string $table, array $row): array {
        if ($table === 'categories') {
            if (!empty($row['image']) && empty($row['image_url'])) {
                $row['image_url'] = $row['image'];
            }
            if (!empty($row['image_url']) && empty($row['image'])) {
                $row['image'] = $row['image_url'];
            }
        }
        $cols = self::$jsonCols[$table] ?? [];
        foreach ($cols as $c) {
            if (isset($row[$c]) && (is_array($row[$c]) || is_object($row[$c]))) {
                $row[$c] = json_encode($row[$c], JSON_UNESCAPED_UNICODE);
            }
        }
        return $row;
    }

    /**
     * Atomic write to JSON file with lock
     */
    public static function atomicWriteJson(string $file, $data): bool {
        $tmp = $file . '.tmp.' . uniqid();
        $payload = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($payload === false) return false;

        $fp = fopen($file, 'c+');
        if (!$fp) return false;

        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $payload);
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
            return true;
        }
        fclose($fp);
        return false;
    }

    /**
     * Fetch all records from table
     */
    public static function all(string $table, string $orderBy = ''): array {
        $pdo = self::pdo();
        if ($pdo) {
            try {
                $sql = "SELECT * FROM `$table`" . (!empty($orderBy) ? " ORDER BY $orderBy" : "");
                $stmt = $pdo->query($sql);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                return array_map(function($r) use ($table) {
                    return self::decodeRow($table, $r);
                }, $rows);
            } catch (Exception $e) {
                // Fall through to JSON on table error
            }
        }

        $file = self::getJsonFile($table);
        if (file_exists($file)) {
            $raw = json_decode(file_get_contents($file), true);
            return is_array($raw) ? $raw : [];
        }
        return [];
    }

    /**
     * Find single record by column value
     */
    public static function find(string $table, $value, string $column = 'id'): ?array {
        $pdo = self::pdo();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE `$column` = ? LIMIT 1");
                $stmt->execute([$value]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row ? self::decodeRow($table, $row) : null;
            } catch (Exception $e) {
                // Fall through to JSON
            }
        }

        $all = self::all($table);
        foreach ($all as $item) {
            if (isset($item[$column]) && (string)$item[$column] === (string)$value) {
                return $item;
            }
        }
        return null;
    }

    private static $tableColsCache = [];

    /**
     * Get list of real column names for a MySQL table
     */
    public static function getTableColumns(string $table): array {
        if (isset(self::$tableColsCache[$table])) {
            return self::$tableColsCache[$table];
        }
        $pdo = self::pdo();
        if (!$pdo) return [];
        try {
            $stmt = $pdo->query("DESCRIBE `$table`");
            $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
            self::$tableColsCache[$table] = is_array($cols) ? $cols : [];
            return self::$tableColsCache[$table];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Insert record
     */
    public static function insert(string $table, array $data): bool {
        $pdo = self::pdo();
        $sql_ok = false;
        if ($pdo) {
            try {
                $validCols = self::getTableColumns($table);
                $filtered = [];
                foreach ($data as $k => $v) {
                    if (empty($validCols) || in_array($k, $validCols)) {
                        $filtered[$k] = $v;
                    }
                }
                $encoded = self::encodeRow($table, $filtered);
                $cols = array_keys($encoded);
                if (!empty($cols)) {
                    $placeholders = array_map(function($c) { return ":$c"; }, $cols);
                    $sql = "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $placeholders) . ")";
                    $stmt = $pdo->prepare($sql);
                    $params = [];
                    foreach ($encoded as $k => $v) {
                        if (is_bool($v)) $v = $v ? 1 : 0;
                        $params[":$k"] = $v;
                    }
                    $stmt->execute($params);
                    $sql_ok = true;
                }
            } catch (Exception $e) {
                // Fallback to json if SQL fails
                $sql_ok = false;
            }
        }

        // Always sync to JSON for live local backup unless SQL succeeded on heavy write tables
        if (!$sql_ok || !in_array($table, ['orders', 'sms_logs', 'visitors', 'fraud_cache'])) {
            $file = self::getJsonFile($table);
            $items = file_exists($file) ? json_decode(file_get_contents($file), true) ?: [] : [];
            $items[] = $data;
            self::atomicWriteJson($file, $items);
        }
        return true;
    }

    /**
     * Update record
     */
    public static function update(string $table, array $data, $idVal, string $idCol = 'id'): bool {
        $pdo = self::pdo();
        $sql_ok = false;
        if ($pdo) {
            try {
                $validCols = self::getTableColumns($table);
                $filtered = [];
                foreach ($data as $k => $v) {
                    if (empty($validCols) || in_array($k, $validCols)) {
                        $filtered[$k] = $v;
                    }
                }
                $encoded = self::encodeRow($table, $filtered);
                $sets = [];
                $params = [':_idVal' => $idVal];
                foreach ($encoded as $k => $v) {
                    if ($k === $idCol) continue;
                    $sets[] = "`$k` = :$k";
                    if (is_bool($v)) $v = $v ? 1 : 0;
                    $params[":$k"] = $v;
                }
                if (!empty($sets)) {
                    $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " WHERE `$idCol` = :_idVal";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                    $sql_ok = true;
                }
            } catch (Exception $e) {
                // Fallback
                $sql_ok = false;
            }
        }

        // Sync to JSON backup unless SQL succeeded on heavy tables
        if (!$sql_ok || !in_array($table, ['orders', 'sms_logs', 'visitors', 'fraud_cache'])) {
            $file = self::getJsonFile($table);
            if (file_exists($file)) {
                $items = json_decode(file_get_contents($file), true) ?: [];
                foreach ($items as $idx => $item) {
                    if (isset($item[$idCol]) && (string)$item[$idCol] === (string)$idVal) {
                        $items[$idx] = array_merge($item, $data);
                        self::atomicWriteJson($file, $items);
                        break;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Delete record
     */
    public static function delete(string $table, $idVal, string $idCol = 'id'): bool {
        $pdo = self::pdo();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `$table` WHERE `$idCol` = ?");
                $stmt->execute([$idVal]);
            } catch (Exception $e) {
                // Fallback
            }
        }

        // Sync to JSON backup
        $file = self::getJsonFile($table);
        if (file_exists($file)) {
            $items = json_decode(file_get_contents($file), true) ?: [];
            $filtered = array_values(array_filter($items, function($i) use ($idCol, $idVal) {
                return !isset($i[$idCol]) || (string)$i[$idCol] !== (string)$idVal;
            }));
            self::atomicWriteJson($file, $filtered);
        }
        return true;
    }

    /**
     * Save entire array (e.g. for reordering or full overwrite)
     */
    public static function saveAll(string $table, array $items): bool {
        $pdo = self::pdo();
        if ($pdo) {
            try {
                $validCols = self::getTableColumns($table);
                $pdo->beginTransaction();
                $pdo->exec("TRUNCATE TABLE `$table`");
                foreach ($items as $item) {
                    if (!is_array($item)) continue;
                    $filtered = [];
                    foreach ($item as $k => $v) {
                        if (empty($validCols) || in_array($k, $validCols)) {
                            $filtered[$k] = $v;
                        }
                    }
                    $encoded = self::encodeRow($table, $filtered);
                    $cols = array_keys($encoded);
                    if (empty($cols)) continue;
                    $placeholders = array_map(function($c) { return ":$c"; }, $cols);
                    $sql = "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $placeholders) . ")";
                    $stmt = $pdo->prepare($sql);
                    $params = [];
                    foreach ($encoded as $k => $v) {
                        if (is_bool($v)) $v = $v ? 1 : 0;
                        $params[":$k"] = $v;
                    }
                    $stmt->execute($params);
                }
                $pdo->commit();
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
            }
        }

        $file = self::getJsonFile($table);
        self::atomicWriteJson($file, array_values($items));
        return true;
    }
}
?>
