<?php
// api/settings/fraud_checker.php
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

if ($action === 'check') {
    $ecomahKey = getSetting('ecomah_api_key');
    if (!$ecomahKey) {
        echo json_encode(['error' => 'Ecomah API Key not configured']);
        exit;
    }
    
    $phone = trim($input['phone'] ?? '');
    if (!$phone) {
        echo json_encode(['error' => 'Phone number is required']);
        exit;
    }
    
    if (function_exists('curl_init')) {
        $ch = curl_init('https://api.ecomah.com/fraud-checker?phone=' . urlencode($phone));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-key: ' . $ecomahKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            echo json_encode(['success' => true, 'data' => $data]);
        } else {
            echo json_encode(['error' => 'Fraud Checker request failed (HTTP ' . $httpCode . ')']);
        }
    } else {
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'header'  => "Content-Type: application/json\r\nx-api-key: " . $ecomahKey . "\r\n",
                'timeout' => 10,
                'ignore_errors' => true
            ]
        ]);
        $response = @file_get_contents('https://api.ecomah.com/fraud-checker?phone=' . urlencode($phone), false, $ctx);
        if ($response !== false) {
            $data = json_decode($response, true);
            echo json_encode(['success' => true, 'data' => $data]);
        } else {
            echo json_encode(['error' => 'Fraud Checker request failed (connection error)']);
        }
    }
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
