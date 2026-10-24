<?php
// api/settings/sms_helper.php
// Resilient E-COMAH SMS and External API Client

if (!function_exists('ecomah_send_sms')) {
    function ecomah_send_sms($ecomahKey, $phone, $message) {
        if (empty($ecomahKey)) {
            return ['success' => false, 'code' => 400, 'error' => 'API Key not configured'];
        }

        // E-COMAH SMS API strictly requires 'action' => 'send_sms'
        $payload = json_encode([
            'action'  => 'send_sms',
            'number'  => $phone,
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);

        // 1. PHP cURL (Standard on Linux / cPanel / configured PHP)
        if (function_exists('curl_init')) {
            $ch = curl_init('https://api.ecomah.com/sms-api');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'x-api-key: ' . $ecomahKey
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($res !== false) {
                $data = json_decode($res, true) ?: $res;
                $ok = ($code === 200 || $code === 201) && (!isset($data['success']) || $data['success'] === true);
                return ['success' => $ok, 'code' => $code, 'result' => $data, 'raw' => $res];
            }
        }

        // 2. Stream Context (Native PHP fallback)
        if (in_array('https', stream_get_wrappers())) {
            $ctx = stream_context_create([
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\nx-api-key: " . $ecomahKey . "\r\n",
                    'content' => $payload,
                    'timeout' => 10,
                    'ignore_errors' => true
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ]);
            $res = @file_get_contents('https://api.ecomah.com/sms-api', false, $ctx);
            if ($res !== false) {
                $data = json_decode($res, true) ?: $res;
                $ok = !isset($data['success']) || $data['success'] === true;
                return ['success' => $ok, 'code' => 200, 'result' => $data, 'raw' => $res];
            }
        }

        // 3. System CLI curl fallback (Windows development & local fallbacks)
        $tmpFile = tempnam(sys_get_temp_dir(), 'sms_');
        file_put_contents($tmpFile, $payload);
        $cmd = 'curl.exe -s -X POST "https://api.ecomah.com/sms-api" -H "Content-Type: application/json" -H "x-api-key: ' . $ecomahKey . '" --data-binary "@' . str_replace('\\', '/', $tmpFile) . '"';
        $output = @shell_exec($cmd);
        @unlink($tmpFile);
        if (!empty($output)) {
            $data = json_decode($output, true) ?: $output;
            $ok = is_array($data) && (!isset($data['success']) || $data['success'] === true);
            return ['success' => $ok, 'code' => 200, 'result' => $data, 'raw' => $output];
        }

        return ['success' => false, 'code' => 500, 'error' => 'Connection failed', 'result' => null];
    }
}

if (!function_exists('ecomah_check_balance')) {
    function ecomah_check_balance($ecomahKey) {
        if (empty($ecomahKey)) return null;

        $payload = json_encode([
            'action'  => 'check_balance',
            'api_key' => $ecomahKey
        ]);

        // 1. PHP cURL
        if (function_exists('curl_init')) {
            $ch = curl_init('https://api.ecomah.com/manage-external-api');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $res = curl_exec($ch);
            curl_close($ch);
            if ($res !== false) {
                $data = json_decode($res, true);
                if (is_array($data)) return $data;
            }
        }

        // 2. Stream context
        if (in_array('https', stream_get_wrappers())) {
            $ctx = stream_context_create([
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => $payload,
                    'timeout' => 10,
                    'ignore_errors' => true
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ]);
            $res = @file_get_contents('https://api.ecomah.com/manage-external-api', false, $ctx);
            if ($res !== false) {
                $data = json_decode($res, true);
                if (is_array($data)) return $data;
            }
        }

        // 3. System CLI curl fallback
        $tmpFile = tempnam(sys_get_temp_dir(), 'bal_');
        file_put_contents($tmpFile, $payload);
        $cmd = 'curl.exe -s -X POST "https://api.ecomah.com/manage-external-api" -H "Content-Type: application/json" --data-binary "@' . str_replace('\\', '/', $tmpFile) . '"';
        $output = @shell_exec($cmd);
        @unlink($tmpFile);
        if (!empty($output)) {
            $data = json_decode($output, true);
            if (is_array($data)) return $data;
        }

        return null;
    }
}
