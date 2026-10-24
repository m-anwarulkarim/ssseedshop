<?php
// api/customer/profile.php
// Customer Profile Management Endpoint for Ss Seed Shop

require_once __DIR__ . '/../db.php';



if (!function_exists('normalizePhone')) {
    function normalizePhone($phone) {
        $clean = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strlen($clean) > 11 && str_starts_with($clean, '88')) {
            $clean = substr($clean, 2);
        }
        return $clean;
    }
}

if (!function_exists('getCustomersList')) {
    function getCustomersList($path) {
        return DB::all('customers');
    }
}

if (!function_exists('saveCustomersList')) {
    function saveCustomersList($path, $data) {
        DB::saveAll('customers', $data);
    }
}

if (!function_exists('mapProfileOutput')) {
    function mapProfileOutput($c) {
        if (!$c) return null;
        $c['profile_picture'] = $c['avatar_url'] ?? $c['profile_picture'] ?? '';
        $c['avatar_url'] = $c['profile_picture'];
        unset($c['password_hash']); // Never expose password hash
        return $c;
    }
}

if (!function_exists('saveAvatarFile')) {
    function saveAvatarFile($dataStr, $customerId) {
        if (empty($dataStr)) return '';
        // If already an HTTP or relative URL, return directly
        if (preg_match('/^https?:\/\//i', $dataStr) || str_starts_with($dataStr, '/uploads/')) {
            return $dataStr;
        }
        // If data URI
        if (preg_match('/^data:image\/(\w+);base64,(.+)$/is', $dataStr, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            $binary = base64_decode($matches[2]);
            if ($binary !== false) {
                $uploads_dir = __DIR__ . '/../uploads/profiles';
                if (!is_dir($uploads_dir)) {
                    @mkdir($uploads_dir, 0755, true);
                }
                $safe_id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$customerId);
                if (empty($safe_id)) $safe_id = 'user';

                // Try converting non-WebP base64 to WebP using GD if available
                $saved_as_webp = false;
                $filename = 'profile_' . $safe_id . '_' . time() . '.webp';
                $filepath = $uploads_dir . '/' . $filename;

                if (extension_loaded('gd') && function_exists('imagewebp') && function_exists('imagecreatefromstring')) {
                    $img = @imagecreatefromstring($binary);
                    if ($img !== false) {
                        $w = imagesx($img);
                        $h = imagesy($img);
                        $max_dim = 512;
                        if ($w > $max_dim || $h > $max_dim) {
                            $ratio = min($max_dim / $w, $max_dim / $h);
                            $nw = max(1, (int)round($w * $ratio));
                            $nh = max(1, (int)round($h * $ratio));
                            $dst = imagecreatetruecolor($nw, $nh);
                            imagealphablending($dst, false);
                            imagesavealpha($dst, true);
                            imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
                            imagedestroy($img);
                            $img = $dst;
                        } else {
                            imagealphablending($img, false);
                            imagesavealpha($img, true);
                        }
                        if (@imagewebp($img, $filepath, 80)) {
                            $saved_as_webp = true;
                        }
                        imagedestroy($img);
                    }
                }

                if (!$saved_as_webp) {
                    $filename = 'profile_' . $safe_id . '_' . time() . '.' . ($ext === 'webp' ? 'webp' : $ext);
                    $filepath = $uploads_dir . '/' . $filename;
                    if (@file_put_contents($filepath, $binary) === false) {
                        return $dataStr;
                    }
                }

                $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8005';
                $is_ssl = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
                    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)
                    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
                $is_local = in_array(explode(':', $host)[0], ['localhost', '127.0.0.1']);
                $protocol = ($is_ssl || !$is_local) ? "https://" : "http://";
                $script_dir = dirname($_SERVER['SCRIPT_NAME'] ?? '/customer/profile.php');
                $base_url = preg_replace('/\/customer\/?$/', '', $script_dir);
                if (!empty($base_url) && !str_starts_with($base_url, '/')) {
                    $base_url = '/' . $base_url;
                }
                $base_url = rtrim($base_url, '/');
                return $protocol . $host . $base_url . '/uploads/profiles/' . $filename;
            }
        }
        return $dataStr;
    }
}

if (!function_exists('findOrCreateCustomer')) {
    function findOrCreateCustomer($profile_id, $phone_raw, $email_raw = '', $extra = []) {
        $customers = DB::all('customers');
        $phone = normalizePhone($phone_raw);
        $email = strtolower(trim($email_raw));

        // 1. Search existing customers
        foreach ($customers as $idx => $c) {
            if (!empty($profile_id) && ($c['id'] ?? '') === $profile_id) {
                return [$idx, $c, $customers];
            }
            if (!empty($phone) && normalizePhone($c['phone'] ?? '') === $phone) {
                return [$idx, $c, $customers];
            }
            if (!empty($email) && strtolower($c['email'] ?? '') === $email) {
                return [$idx, $c, $customers];
            }
        }

        // 2. Not found: search in orders database to inherit existing customer profile details
        $orders = DB::all('orders');
        $order_name = '';
        $order_phone = $phone;
        $order_address = '';
        $order_district = '';
        $order_thana = '';

        foreach ($orders as $o) {
            $op = normalizePhone($o['phone'] ?? '');
            $oalt = normalizePhone($o['alt_phone'] ?? '');
            $opid = $o['profile_id'] ?? $o['customer_id'] ?? '';

            $match = false;
            if (!empty($phone) && ($op === $phone || $oalt === $phone)) {
                $match = true;
            } elseif (!empty($profile_id) && $opid === $profile_id) {
                $match = true;
            }

            if ($match) {
                if (!empty($o['customer_name']) && empty($order_name)) $order_name = trim($o['customer_name']);
                if (!empty($o['phone']) && empty($order_phone)) $order_phone = normalizePhone($o['phone']);
                if (!empty($o['address']) && empty($order_address)) $order_address = trim($o['address']);
                if (!empty($o['district']) && empty($order_district)) $order_district = trim($o['district']);
                if (!empty($o['thana']) && empty($order_thana)) $order_thana = trim($o['thana']);
            }
        }

        $final_phone = !empty($phone) ? $phone : $order_phone;
        $final_name = !empty($extra['name']) ? trim($extra['name']) : ($order_name ?: 'কাস্টমার');
        $final_id = !empty($profile_id) ? $profile_id : ('cust_' . substr(md5(uniqid($final_phone . mt_rand(), true)), 0, 12));

        $username_seed = !empty($final_phone) ? substr($final_phone, -4) : substr(md5($final_id), 0, 4);
        $now = date('c');

        $new_customer = [
            'id'             => $final_id,
            'phone'          => $final_phone,
            'name'           => $final_name,
            'email'          => $email,
            'avatar_url'     => '',
            'profile_picture'=> '',
            'alt_phone'      => $extra['alt_phone'] ?? '',
            'phone_verified' => !empty($final_phone),
            'district'       => !empty($extra['district']) ? $extra['district'] : $order_district,
            'thana'          => !empty($extra['thana']) ? $extra['thana'] : $order_thana,
            'address'        => !empty($extra['address']) ? $extra['address'] : $order_address,
            'gender'         => $extra['gender'] ?? '',
            'age'            => isset($extra['age']) && $extra['age'] !== '' ? (int)$extra['age'] : null,
            'bio'            => $extra['bio'] ?? '',
            'username'       => 'user_' . $username_seed,
            'auth_provider'  => !empty($final_phone) ? 'phone' : (!empty($email) ? 'google' : 'guest'),
            'created_at'     => $now,
            'updated_at'     => $now,
            'last_login'     => $now
        ];

        $customers[] = $new_customer;
        DB::saveAll('customers', $customers);
        $new_idx = count($customers) - 1;

        return [$new_idx, $new_customer, $customers];
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------
// GET Request: Retrieve Profile
// -------------------------------------------------------------
if ($method === 'GET') {
    $profile_id = $_GET['id'] ?? $_GET['profile_id'] ?? '';
    $phone_raw  = $_GET['phone'] ?? '';
    $phone      = normalizePhone($phone_raw);
    $email      = strtolower(trim($_GET['email'] ?? ''));

    if (empty($profile_id) && empty($phone) && empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Profile ID, Phone or Email is required']);
        exit();
    }

    list($target_index, $found, $customers) = findOrCreateCustomer($profile_id, $phone, $email);

    if ($found) {
        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'profile' => mapProfileOutput($found)
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'কাস্টমার প্রোফাইল পাওয়া যায়নি']);
    }
    exit();
}

// -------------------------------------------------------------
// POST Request: Actions (get, update, change_password)
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $action = $input['action'] ?? 'update';
    $profile_id = $input['profile_id'] ?? $input['id'] ?? '';
    $phone = normalizePhone($input['phone'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));

    if (empty($profile_id) && empty($phone) && empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Profile ID, Phone or Email is required']);
        exit();
    }

    list($target_index, $customer, $customers) = findOrCreateCustomer($profile_id, $phone, $email, $input);

    // ACTION: get
    if ($action === 'get') {
        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'profile' => mapProfileOutput($customer)
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    // ACTION: update
    if ($action === 'update') {
        $allowed = ['name', 'alt_phone', 'district', 'thana', 'address', 'gender', 'bio', 'username', 'admin_notes', 'access_allowed', 'user_type'];
        foreach ($allowed as $field) {
            if (isset($input[$field])) {
                $customer[$field] = $input[$field];
            }
        }

        // Handle age (int)
        if (isset($input['age'])) {
            $customer['age'] = ($input['age'] !== '' && $input['age'] !== null) ? (int)$input['age'] : null;
        }

        // Handle phone update if provided
        if (!empty($input['phone'])) {
            $new_phone = normalizePhone($input['phone']);
            if (strlen($new_phone) === 11) {
                $customer['phone'] = $new_phone;
                $customer['phone_verified'] = true;
                if (empty($customer['username']) || str_starts_with($customer['username'], 'user_')) {
                    $customer['username'] = 'user_' . substr($new_phone, -4);
                }
            }
        }

        // Handle photo / avatar url (supports base64, data URI, or normal URL)
        $raw_photo = $input['profile_picture'] ?? $input['avatar_url'] ?? '';
        if (!empty($raw_photo)) {
            $saved_url = saveAvatarFile($raw_photo, $customer['id'] ?? $profile_id);
            $customer['avatar_url'] = $saved_url;
            $customer['profile_picture'] = $saved_url;
        }

        $customer['updated_at'] = date('c');
        $customers[$target_index] = $customer;
        saveCustomersList($customers_file, $customers);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
            'profile' => mapProfileOutput($customer)
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    // ACTION: change_password
    if ($action === 'change_password') {
        $old_pwd = $input['old_password'] ?? '';
        $new_pwd = $input['new_password'] ?? '';

        if (empty($new_pwd) || strlen($new_pwd) < 6) {
            echo json_encode(['status' => 'error', 'error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে باشد']);
            exit();
        }

        // If customer already has a password, verify old password first
        if (!empty($customer['password_hash'])) {
            if (empty($old_pwd) || !password_verify($old_pwd, $customer['password_hash'])) {
                echo json_encode(['status' => 'error', 'error' => 'বর্তমান পাসওয়ার্ড ভুল হয়েছে']);
                exit();
            }
        }

        $customer['password_hash'] = password_hash($new_pwd, PASSWORD_BCRYPT);
        $customer['updated_at'] = date('c');
        $customers[$target_index] = $customer;
        saveCustomersList($customers_file, $customers);

        echo json_encode([
            'status'  => 'success',
            'success' => true,
            'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    echo json_encode(['status' => 'error', 'message' => 'Invalid action: ' . $action]);
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>
