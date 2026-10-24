import urllib.request
import urllib.parse
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

API_URL = "http://localhost:8005"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDERS_FILE = os.path.join(BASE_DIR, "api", "database", "orders.json")
LOGS_FILE = os.path.join(BASE_DIR, "api", "database", "sms_logs.json")

def send_request(endpoint, method="POST", data=None):
    url = f"{API_URL}/{endpoint}"
    req_data = None
    headers = {"Content-Type": "application/json"}
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}

def run_tests():
    print("=================================================================")
    print("📢 AGROSEED NOTIFICATION & SMS ALERT API TESTS")
    print("=================================================================")

    # Ensure an order exists to notify about
    with open(ORDERS_FILE, "r", encoding="utf-8") as f:
        orders = json.load(f)
    assert len(orders) > 0, "At least one order must exist in orders.json"
    latest_order = orders[-1]
    order_id = latest_order.get("id")
    order_code = latest_order.get("order_id", order_id)
    print(f"Testing with Order ID: {order_id} (Code: {order_code})")

    # TEST 1: Pending (New Order Notification)
    print("\n========== TEST 1: Pending Order Notification ==========")
    status, res = send_request("orders/notify.php", data={
        "order_id": order_id,
        "new_status": "pending"
    })
    print(f"Pending notify status: {status}, response: {res}")
    assert status == 200
    assert res.get("success") is True
    sms_msg = res.get("data", {}).get("sms_message", "")
    assert str(order_code) in sms_msg, f"Order code {order_code} should be in SMS message: {sms_msg}"
    print(f"✓ Formatted SMS: {sms_msg}")

    # TEST 2: Confirmed Status Notification
    print("\n========== TEST 2: Confirmed Status Notification ==========")
    status, res = send_request("orders/notify.php", data={
        "order_id": order_id,
        "new_status": "confirmed",
        "old_status": "pending"
    })
    print(f"Confirmed notify status: {status}, response: {res}")
    assert status == 200
    assert res.get("success") is True
    sms_msg_confirmed = res.get("data", {}).get("sms_message", "")
    assert "কনফার্ম" in sms_msg_confirmed
    print(f"✓ Formatted Confirmed SMS: {sms_msg_confirmed}")

    # TEST 3: Delivered Status Notification
    print("\n========== TEST 3: Delivered Status Notification ==========")
    status, res = send_request("orders/notify.php", data={
        "order_id": order_id,
        "new_status": "delivered",
        "old_status": "confirmed"
    })
    print(f"Delivered notify status: {status}, response: {res}")
    assert status == 200
    assert res.get("success") is True
    sms_msg_deliv = res.get("data", {}).get("sms_message", "")
    assert "ডেলিভারি" in sms_msg_deliv
    print(f"✓ Formatted Delivered SMS: {sms_msg_deliv}")

    # TEST 4: Skip when status unchanged
    print("\n========== TEST 4: Skip when status unchanged ==========")
    status, res = send_request("orders/notify.php", data={
        "order_id": order_id,
        "new_status": "confirmed",
        "old_status": "confirmed"
    })
    print(f"Skipped notify status: {status}, response: {res}")
    assert status == 200
    assert res.get("status") == "skipped"

    # TEST 5: Verify SMS logs recorded in sms_logs.json
    print("\n========== TEST 5: Verify SMS logs in database ==========")
    assert os.path.exists(LOGS_FILE), "sms_logs.json must exist"
    with open(LOGS_FILE, "r", encoding="utf-8") as f:
        logs = json.load(f)
    print(f"Total SMS logs recorded: {len(logs)}")
    assert len(logs) >= 3, "At least 3 SMS logs should be recorded"
    latest_log = logs[-1]
    assert latest_log.get("status") == "delivered"
    assert latest_log.get("order_id") == str(order_code)
    print(f"✓ Latest SMS Log: ID={latest_log.get('id')}, Phone={latest_log.get('phone')}, Status={latest_log.get('status')}")

    print("\n=================================================================")
    print("🎉 আলহামদুলিল্লাহ! Part 9 এর সমস্ত নোটিফিকেশন টেস্ট সফল হয়েছে!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
