<?php
// api/tracking/meta_capi.php
// Server-Side Meta Conversions API (CAPI) Proxy for Ss Seed Shop

require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$eventName = trim($input['event_name'] ?? '');
if (!$eventName) {
    http_response_code(400);
    echo json_encode(['error' => 'event_name is required']);
    exit;
}

// Retrieve Pixel ID and CAPI Token from settings
$settings = DB::all('settings');
$pixelId = null;
$capiToken = null;

foreach ($settings as $s) {
    if (($s['key'] ?? '') === 'meta_pixel_id' && !empty($s['value'])) {
        $pixelId = trim((string)$s['value']);
    }
    if (($s['key'] ?? '') === 'meta_capi_token' && !empty($s['value'])) {
        $capiToken = trim((string)$s['value']);
    }
}

if (!$pixelId || !$capiToken) {
    // Graceful exit if CAPI is not configured yet
    echo json_encode([
        'success'            => false,
        'message'            => 'Meta CAPI not configured in settings',
        'pixel_id_present'   => !empty($pixelId),
        'capi_token_present' => !empty($capiToken)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper to hash user data as per Meta guidelines (SHA-256 lowercase)
function hashMetaUserData($str) {
    if (!$str) return null;
    $clean = strtolower(trim((string)$str));
    return hash('sha256', $clean);
}

// Helper to normalize Bangladesh phone number before hashing
function hashMetaPhone($phone) {
    if (!$phone) return null;
    $digits = preg_replace('/[^0-9]/', '', (string)$phone);
    if (strpos($digits, '880') === 0) {
        $normalized = '+' . $digits;
    } elseif (strpos($digits, '01') === 0) {
        $normalized = '+880' . substr($digits, 1);
    } else {
        $normalized = '+' . $digits;
    }
    return hash('sha256', $normalized);
}

// Prepare user_data
$rawUserData = $input['user_data'] ?? [];
$userData = [
    'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
    'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
];

if (!empty($rawUserData['fbp'])) $userData['fbp'] = $rawUserData['fbp'];
if (!empty($rawUserData['fbc'])) $userData['fbc'] = $rawUserData['fbc'];
if (!empty($rawUserData['external_id'])) $userData['external_id'] = hashMetaUserData($rawUserData['external_id']);
if (!empty($rawUserData['ph'])) $userData['ph'] = [hashMetaPhone($rawUserData['ph'])];
if (!empty($rawUserData['fn'])) $userData['fn'] = [hashMetaUserData($rawUserData['fn'])];
if (!empty($rawUserData['ln'])) $userData['ln'] = [hashMetaUserData($rawUserData['ln'])];
if (!empty($rawUserData['ct'])) $userData['ct'] = [hashMetaUserData($rawUserData['ct'])];
if (!empty($rawUserData['country'])) $userData['country'] = [hashMetaUserData('bd')];

// Clean nulls
$userData = array_filter($userData);

// Prepare event payload
$eventData = [
    'event_name'         => $eventName,
    'event_time'         => time(),
    'event_id'           => $input['event_id'] ?? ('srv_' . time() . '_' . bin2hex(random_bytes(4))),
    'event_source_url'   => $input['event_source_url'] ?? ($_SERVER['HTTP_REFERER'] ?? 'https://ssseedshop.com'),
    'action_source'      => 'website',
    'user_data'          => $userData,
];

if (!empty($input['custom_data']) && is_array($input['custom_data'])) {
    $eventData['custom_data'] = $input['custom_data'];
}

$payload = json_encode(['data' => [$eventData]], JSON_UNESCAPED_UNICODE);

// Dispatch to Meta Graph API v19.0
$apiUrl = "https://graph.facebook.com/v19.0/{$pixelId}/events?access_token=" . urlencode($capiToken);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 3);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$resJson = json_decode($response, true);

echo json_encode([
    'success'       => ($httpCode >= 200 && $httpCode < 300),
    'event_name'    => $eventName,
    'event_id'      => $eventData['event_id'],
    'meta_response' => $resJson
], JSON_UNESCAPED_UNICODE);

