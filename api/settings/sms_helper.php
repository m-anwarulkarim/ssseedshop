<?php
// api/settings/sms_helper.php
// Stub helper (SMS disabled by user request)

if (!function_exists('ecomah_send_sms')) {
    function ecomah_send_sms($ecomahKey, $phone, $message) {
        return ['success' => false, 'code' => 200, 'message' => 'SMS disabled'];
    }
}

if (!function_exists('ecomah_check_balance')) {
    function ecomah_check_balance($ecomahKey) {
        return ['success' => false, 'message' => 'SMS disabled'];
    }
}
