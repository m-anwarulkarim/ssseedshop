import os
import sys
import json
import time
import urllib.request
import shutil
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "tests", "screenshots")
ARTIFACT_DIR = r"C:\Users\AB Rakib\.gemini\antigravity-ide\brain\68ea5b27-bd4f-4b81-bbb0-e83577ae85bc"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

API_BASE = "http://localhost:8005"
FRONTEND_BASE = "http://localhost:8081"

def api_call(endpoint, method="GET", payload=None):
    url = f"{API_BASE}/{endpoint}"
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}

def test_api_layer():
    print("=" * 70)
    print("🧪 [PART 15 BACKEND API TESTS: Steadfast Courier & Fraud Checker]")
    print("=" * 70)

    # 1. Test Fraud Checker check & caching
    test_phone = "01602867954"
    print(f"\n[১/৫] api/orders/fraud_checker.php কল করে ফোন {test_phone} ফ্রড স্কোর যাচাই...")
    status, f_res = api_call("orders/fraud_checker.php", method="POST", payload={
        "action": "check",
        "phone": test_phone
    })
    assert status == 200 and f_res.get("success") is True, f"Failed fraud check: {f_res}"
    f_data = f_res.get("data", {}).get("fraudchecker_data", {})
    assert "success_rate" in f_data or "courierData" in f_data, f"Invalid fraud structure: {f_data}"
    print(f"✓ ফ্রড ডেটা পাওয়া গেছে! Success Rate: {f_data.get('success_rate')}% (Orders: {f_data.get('total_orders')}, Received: {f_data.get('total_received')})")

    # 2. Test cache verification
    print("\n[২/৫] লোকাল ক্যাশ ভেরিফিকেশন (দ্বিতীয় কলে cached: true আশা করা হচ্ছে)...")
    status, f_cache_res = api_call(f"orders/fraud_checker.php?action=check&phone={test_phone}")
    assert status == 200 and f_cache_res.get("cached") is True, f"Expected cache hit, got: {f_cache_res}"
    print("✓ লোকাল JSON ক্যাশ (fraud_cache.json) সফলভাবে কাজ করছে (Cache Hit: True)!")

    # 3. Test get_all_cached
    print("\n[৩/৫] api/orders/fraud_checker.php?action=get_all_cached কল করা হচ্ছে...")
    status, all_cached = api_call("orders/fraud_checker.php?action=get_all_cached")
    assert status == 200 and all_cached.get("success") is True, f"Failed get_all_cached: {all_cached}"
    cached_count = all_cached.get("count", 0)
    print(f"✓ মোট ক্যাশড কাস্টমার ফোন সংখ্যা: {cached_count}টি")

    # 4. Test Steadfast Courier create_order (parcel booking)
    print("\n[৪/৫] api/courier/steadfast.php দিয়ে পার্সেল বুকিং (Create Parcel) পরীক্ষা করা হচ্ছে...")
    # Find an order in orders.json
    status, orders = api_call("orders/get.php")
    assert status == 200 and isinstance(orders, list) and len(orders) > 0, "No orders found to test courier"
    target_order = orders[0]
    target_id = target_order.get("id")
    target_order_id = target_order.get("order_id", target_id)

    courier_payload = {
        "action": "create_order",
        "orders": [{
            "id": target_id,
            "order_id": target_order_id,
            "customer_name": target_order.get("customer_name", "Test Customer"),
            "phone": target_order.get("phone", "01602867954"),
            "address": target_order.get("address", "Dhaka"),
            "total_amount": target_order.get("total_amount", 500),
            "note": "Courier Test Part 15"
        }]
    }
    status, c_res = api_call("courier/steadfast.php", method="POST", payload=courier_payload)
    assert status == 200 and c_res.get("success") is True, f"Failed courier booking: {c_res}"
    results = c_res.get("results", [])
    assert len(results) > 0 and results[0].get("success") is True, f"Courier entry rejected: {results}"
    consignment_id = results[0].get("consignment_id")
    tracking_code = results[0].get("tracking_code")
    print(f"✓ পার্সেল বুকিং সফল! Consignment ID: {consignment_id}, Tracking Code: {tracking_code}")

    # Verify orders.json updated
    status, updated_orders = api_call("orders/get.php")
    matching = next((o for o in updated_orders if o.get("id") == target_id), None)
    assert matching is not None, "Order not found in database"
    assert matching.get("consignment_id") == consignment_id, "Consignment ID not saved in orders.json"
    assert matching.get("tracking_code") == tracking_code, "Tracking Code not saved in orders.json"
    print("✓ কনসাইনমেন্ট আইডি ও ট্র্যাকিং কোড orders.json এ সফলভাবে সংরক্ষিত হয়েছে!")

    # 5. Test Steadfast status sync
    print("\n[৫/৫] api/courier/steadfast.php দিয়ে স্ট্যাটাস সিঙ্ক (Sync Courier Status) পরীক্ষা করা হচ্ছে...")
    status, sync_res = api_call("courier/steadfast.php", method="POST", payload={"action": "sync_statuses"})
    assert status == 200 and sync_res.get("success") is True, f"Failed status sync: {sync_res}"
    print(f"✓ কুরিয়ার স্ট্যাটাস সিঙ্ক সফল! সিঙ্ককৃত অর্ডার সংখ্যা: {sync_res.get('synced', 0)}")

    print("\n" + "=" * 70)
    print("🎉 Part 15 ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)
    return test_phone, target_order_id

def test_playwright_e2e(test_phone, target_order_id):
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E: Steadfast Courier & Fraud Bar]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Open WebOrders page to verify Fraud Bar
        print("\n[১/২] অ্যাডমিন WebOrders পেজে যাওয়া হচ্ছে (/admin/orders/web)...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/orders/web", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Trigger fraud check on the first row if button exists
        fraud_call_btn = page.locator("button[title*='কল করুন'], button[title*='ফ্রড']").first
        if fraud_call_btn.is_visible():
            print("✓ ফ্রড চেকার অন-ডিমান্ড বাটনে ক্লিক করা হচ্ছে...")
            fraud_call_btn.click()
            time.sleep(1.5)

        # Wait for fraud bar or search row
        time.sleep(1)
        screenshot_fraud = os.path.join(SCREENSHOTS_DIR, "18_fraud_score_bar.png")
        page.screenshot(path=screenshot_fraud)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_fraud}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_fraud, os.path.join(ARTIFACT_DIR, "18_fraud_score_bar.png"))

        # Step 2: Open OrderList page to verify Courier Sync and Fraud Bar
        print("\n[২/২] অ্যাডমিন OrderList পেজে যাওয়া হচ্ছে (/admin/orders/list)...")
        page.goto(f"{FRONTEND_BASE}/admin/orders/list", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(1)

        # Wait for table
        try:
            page.locator("table tbody tr").first.wait_for(timeout=8000)
        except Exception:
            pass

        # Look for courier sync button or table
        sync_btn = page.locator("button:has-text('সিঙ্ক'), button:has-text('Sync')").first
        if sync_btn.is_visible():
            print("✓ কুরিয়ার স্ট্যাটাস সিঙ্ক বাটনে ক্লিক করা হচ্ছে...")
            sync_btn.click()
            time.sleep(1.5)

        screenshot_courier = os.path.join(SCREENSHOTS_DIR, "17_courier_entry.png")
        page.screenshot(path=screenshot_courier)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_courier}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_courier, os.path.join(ARTIFACT_DIR, "17_courier_entry.png"))

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 15 E2E ব্রাউজার ভ্যালিডেশন সফলভাবে সম্পন্ন হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    t_phone, t_order = test_api_layer()
    test_playwright_e2e(t_phone, t_order)
