<?php
// api/settings/steadfast.php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$action = $input['action'] ?? '';

function getSetting($key) {
    $row = DB::find('settings', $key, 'key');
    return $row['value'] ?? '';
}

function saveSetting($key, $value) {
    $existing = DB::find('settings', $key, 'key');
    $now = date('c');
    if ($existing) {
        $existing['value'] = $value;
        $existing['updated_at'] = $now;
        DB::update('settings', $existing, $existing['id']);
    } else {
        DB::insert('settings', [
            'id'         => uniqid('set_'),
            'key'        => $key,
            'value'      => $value,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}

if ($action === 'update_webhook_token') {
    $token = $input['token'] ?? '';
    saveSetting('steadfast_webhook_token', $token);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'update_keys') {
    $api_key = trim($input['api_key'] ?? '');
    $secret_key = trim($input['secret_key'] ?? '');
    
    saveSetting('steadfast_api_key', $api_key);
    saveSetting('steadfast_secret_key', $secret_key);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'get_balance') {
    $api_key = getSetting('steadfast_api_key');
    $secret_key = getSetting('steadfast_secret_key');
    
    if (!$api_key || !$secret_key) {
        echo json_encode(['success' => false, 'error' => 'API keys missing', 'status' => 401]);
        exit;
    }
    
    if (function_exists('curl_init')) {
        $ch = curl_init('https://portal.packzy.com/api/v1/get_balance');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Api-Key: ' . $api_key,
            'Secret-Key: ' . $secret_key
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode == 200) {
            $resObj = json_decode($response, true);
            echo json_encode(['success' => true, 'status' => 200, 'data' => $resObj]);
        } else {
            echo json_encode(['success' => false, 'status' => $httpCode, 'error' => 'Invalid API Key or Steadfast unreachable']);
        }
    } else {
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'header'  => "Api-Key: {$api_key}\r\nSecret-Key: {$secret_key}\r\n",
                'timeout' => 10,
                'ignore_errors' => true
            ]
        ]);
        $response = @file_get_contents('https://portal.packzy.com/api/v1/get_balance', false, $ctx);
        if ($response !== false) {
            $resObj = json_decode($response, true);
            echo json_encode(['success' => true, 'status' => 200, 'data' => $resObj]);
        } else {
            echo json_encode(['success' => false, 'status' => 500, 'error' => 'Invalid API Key or Steadfast unreachable']);
        }
    }
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
