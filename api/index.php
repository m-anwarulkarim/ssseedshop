<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'success',
    'message' => 'Welcome to Ss Seed Shop PHP API',
    'version' => '1.0.0',
    'endpoints' => [
        'products' => '/products/get.php',
        'login' => '/auth/login.php'
    ]
]);
?>
