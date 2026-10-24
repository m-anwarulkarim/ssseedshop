<?php
// api/expenses/get.php
// Ss Seed Shop Expenses & Income Ledger Retrieval API
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$entries_row = DB::find('settings', 'agroseed_ledger_entries_v2', 'key');
$meta_row    = DB::find('settings', 'agroseed_ledger_meta_v2', 'key');

$entries = [];
$meta = null;

if (!empty($entries_row['value'])) {
    $parsed = json_decode($entries_row['value'], true);
    if (is_array($parsed)) {
        $entries = $parsed;
    }
}

// Fallback to local imported_ledger.json if DB has nothing yet
if (empty($entries)) {
    $seed_file = __DIR__ . '/../database/imported_ledger.json';
    if (!file_exists($seed_file)) {
        $seed_file = __DIR__ . '/../../frontend/src/data/imported_ledger.json';
    }
    if (file_exists($seed_file)) {
        $entries = json_decode(file_get_contents($seed_file), true) ?: [];
    }
}

if (!empty($meta_row['value'])) {
    $parsed_meta = json_decode($meta_row['value'], true);
    if (is_array($parsed_meta)) {
        $meta = $parsed_meta;
    }
}

$default_meta = [
    'incomeCategories'  => ["Product Sales (Website)", "Direct Sales", "Delivery Charge", "Wholesale Order", "Other Income"],
    'expenseCategories' => ["Marketing & Ads", "Website & Software", "Seeds & Inventory", "Gardening Product", "Office Supplies", "Shipping & Courier", "Packaging & Labels", "Transport", "Bank & Payment Fees", "Entertainment", "Utilities", "Rent", "Salaries & Wages", "Professional Services", "Other Expense"],
    'vendors'           => ["Amar Boost", "BTCL", "China bazar", "Ecomah", "china bazar", "Robi", "Laobaan", "Meta", "Redotpay", "সিরাজ টেক", "Local shop", "Steadfast Courier", "Local Bus", "Local Supplier", "Internet", "Ss Seed Shop", "Alibaba Supplier", "Pathao Courier"],
    'paymentMethods'    => ["Cash", "bKash", "Nagad", "Rocket", "Bank Transfer", "Card"],
    'budgets'           => new stdClass(),
    'recurring'         => [],
    'lastAddedBy'       => ''
];

if (!$meta) {
    $meta = $default_meta;
}

// Normalize entry fields to guarantee both camelCase and snake_case exist
if (is_array($entries)) {
    foreach ($entries as &$entry) {
        $raw_date = $entry['date'] ?? $entry['entry_date'] ?? $entry['created_at'] ?? date('Y-m-d');
        $date_str = substr((string)$raw_date, 0, 10);
        $entry['date'] = $date_str;
        $entry['entry_date'] = $date_str;

        $pm = $entry['paymentMethod'] ?? $entry['payment_method'] ?? 'Cash';
        $entry['paymentMethod'] = $pm;
        $entry['payment_method'] = $pm;

        $ab = $entry['addedBy'] ?? $entry['added_by'] ?? '';
        $entry['addedBy'] = $ab;
        $entry['added_by'] = $ab;

        $del = $entry['deletedAt'] ?? $entry['deleted_at'] ?? null;
        if ($del !== null && !is_numeric($del)) {
            $parsed_ts = strtotime($del);
            $del = $parsed_ts ? $parsed_ts * 1000 : null;
        }
        $entry['deletedAt'] = $del;
        $entry['deleted_at'] = $del;
    }
    unset($entry);
}

echo json_encode([
    'status'  => 'success',
    'success' => true,
    'entries' => $entries,
    'meta'    => $meta
], JSON_UNESCAPED_UNICODE);
?>
