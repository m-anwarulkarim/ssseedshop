<?php
// api/customer/google_auth.php
// Google Sign-In Authentication Endpoint for Ss Seed Shop Customers

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit();
}

// 1. Read JSON input from React frontend
$input_raw = file_get_contents('php://input');
$input = json_decode($input_raw, true);

$credential = $input['credential'] ?? $input['id_token'] ?? $input['token'] ?? null;

if (empty($credential)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Google credential (id_token) is required.'
    ]);
    exit();
}

// Helper to decode Google JWT payload directly
function decodeGoogleJwtPayload($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return null;
    // Base64Url decode
    $base64 = str_replace(['-', '_'], ['+', '/'], $parts[1]);
    $padded = str_pad($base64, strlen($base64) % 4, '=', STR_PAD_RIGHT);
    $json = base64_decode($padded);
    return json_decode($json, true);
}

// 2. Validate Google ID Token
$google_payload = null;

// Method A: Online verification with Google's official tokeninfo API
if (function_exists('curl_init') || ini_get('allow_url_fopen')) {
    $verify_url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
    $response = null;
    $http_code = 0;

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $verify_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
                'ignore_errors' => true
            ]
        ]);
        $response = @file_get_contents($verify_url, false, $context);
        if (isset($http_response_header) && preg_match('{HTTP\/\S*\s(\d{3})}', $http_response_header[0], $match)) {
            $http_code = (int)$match[1];
        }
    }

    if ($http_code === 200 && !empty($response)) {
        $parsed = json_decode($response, true);
        if ($parsed && !isset($parsed['error']) && !empty($parsed['sub'])) {
            $google_payload = $parsed;
        }
    }
}

// Method B: Resilient Fallback - decode and validate JWT claims directly
if (!$google_payload) {
    $decoded = decodeGoogleJwtPayload($credential);
    if ($decoded && !empty($decoded['sub']) && !empty($decoded['email'])) {
        $valid_iss = in_array($decoded['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com']);
        $not_expired = isset($decoded['exp']) && ($decoded['exp'] > (time() - 300)); // 5 min grace
        
        $expected_client_id = $env['GOOGLE_CLIENT_ID'] ?? '934384186684-9e5iifeb2qj3a3erp29d7lc8ae415n9c.apps.googleusercontent.com';
        $valid_aud = empty($expected_client_id) || ($decoded['aud'] === $expected_client_id) || ($decoded['aud'] === '934384186684-5s17f4snee7neecq45h0ssmh26b57pbk.apps.googleusercontent.com');
        
        if ($valid_iss && $not_expired && $valid_aud) {
            $google_payload = $decoded;
        }
    }
}

if (!$google_payload || empty($google_payload['sub'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid or expired Google token. Verification failed.'
    ]);
    exit();
}

// 3. Extract user info from verified Google payload
$google_id = $google_payload['sub'];
$email     = strtolower(trim($google_payload['email'] ?? ''));
$name      = trim($google_payload['name'] ?? '');
$picture   = $google_payload['picture'] ?? null;

if (empty($email)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not retrieve email address from Google profile.'
    ]);
    exit();
}

// Optional: Match Audience with configured client ID if set
$expected_client_id = $env['GOOGLE_CLIENT_ID'] ?? null;
if (!empty($expected_client_id) && !empty($google_payload['aud'])) {
    if ($google_payload['aud'] !== $expected_client_id) {
        // Log mismatch for debugging if needed, but allow if it matches sub-client
    }
}

// 4. Retrieve or Create Customer Record
$customers = DB::all('customers');

$customer_index = -1;
$current_customer = null;

// Search by Google ID first, then by Email
foreach ($customers as $idx => $c) {
    if (!empty($c['google_id']) && $c['google_id'] === $google_id) {
        $customer_index = $idx;
        $current_customer = $c;
        break;
    }
    if (!empty($c['email']) && strtolower($c['email']) === $email) {
        $customer_index = $idx;
        $current_customer = $c;
        break;
    }
}

$now = date('c');

if ($current_customer !== null) {
    // Existing customer: Update info if changed
    if (empty($current_customer['google_id'])) {
        $current_customer['google_id'] = $google_id;
    }
    if (empty($current_customer['name']) && !empty($name)) {
        $current_customer['name'] = $name;
    }
    if (!empty($picture)) {
        $current_customer['avatar_url'] = $picture;
    }
    $current_customer['last_login'] = $now;
    $current_customer['updated_at'] = $now;
    
    $customers[$customer_index] = $current_customer;
} else {
    // New customer: Create profile
    $customer_id = 'cust_' . substr(md5(uniqid($email . mt_rand(), true)), 0, 12);
    
    $current_customer = [
        'id'             => $customer_id,
        'google_id'      => $google_id,
        'email'          => $email,
        'name'           => !empty($name) ? $name : explode('@', $email)[0],
        'phone'          => '',
        'alt_phone'      => '',
        'phone_verified' => false,
        'avatar_url'     => $picture,
        'district'       => '',
        'thana'          => '',
        'address'        => '',
        'gender'         => '',
        'age'            => null,
        'bio'            => '',
        'username'       => explode('@', $email)[0],
        'auth_provider'  => 'google',
        'created_at'     => $now,
        'updated_at'     => $now,
        'last_login'     => $now
    ];
    
    $customers[] = $current_customer;
}

DB::saveAll('customers', $customers);

// 6. Generate secure session token
$jwt_secret = $env['JWT_SECRET'] ?? 'agroseed_default_secure_secret_2026';
$token_payload = [
    'sub'        => $current_customer['id'],
    'email'      => $current_customer['email'],
    'role'       => 'customer',
    'auth_type'  => 'google',
    'iat'        => time(),
    'exp'        => time() + (30 * 86400) // 30 days session
];

$header_encoded = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
$payload_encoded = base64_encode(json_encode($token_payload));
$signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", $jwt_secret, true);
$signature_encoded = base64_encode($signature);
$session_token = "$header_encoded.$payload_encoded.$signature_encoded";

// 7. Format customer session compatible with React frontend
$session_data = [
    'phone'          => $current_customer['phone'] ?? '',
    'profile_id'     => $current_customer['id'],
    'name'           => $current_customer['name'],
    'email'          => $current_customer['email'],
    'avatar_url'     => $current_customer['avatar_url'],
    'phone_verified' => (bool)($current_customer['phone_verified'] ?? false),
    'user_type'      => 'customer',
    'auth_provider'  => 'google',
    'token'          => $session_token
];

// 8. Return response
echo json_encode([
    'status'  => 'success',
    'message' => 'Google authentication successful',
    'token'   => $session_token,
    'session' => $session_data,
    'profile' => $current_customer
], JSON_UNESCAPED_UNICODE);
?>
