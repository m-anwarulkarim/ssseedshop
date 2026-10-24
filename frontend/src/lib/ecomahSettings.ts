

export const ECOMAH_SETTING_KEY = "ecomah_api_key";

const LEGACY_ECOMAH_KEYS = [
  "fraud_checker_api_key",
  "fraud_checker_api_secret",
  "sms_api_key",
  "sms_sender_id",
  "sms_base_url",
  "sms_balance_endpoint",
  "sms_send_endpoint",
  "sms_number_param",
  "sms_message_param",
];

export async function saveEcomahApiKey(apiKey: string) {
  const trimmedKey = apiKey.trim();
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

  await fetch(`${url}/settings/update.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: ECOMAH_SETTING_KEY, value: trimmedKey })
  });

  for (const k of LEGACY_ECOMAH_KEYS) {
    await fetch(`${url}/settings/delete.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k })
    });
  }

  return trimmedKey;
}

export async function deleteEcomahApiKey() {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  await fetch(`${url}/settings/delete.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: ECOMAH_SETTING_KEY })
  });
}