import os
import sys
import json
import time
import urllib.request
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "tests", "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

API_BASE = "http://localhost:8005"
FRONTEND_BASE = "http://localhost:8081"
ORDERS_FILE = os.path.join(BASE_DIR, "api", "database", "orders.json")

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

def create_test_order(order_code, phone):
    payload = {
        "customer_name": "ডিলিট টেস্ট কাস্টমার",
        "phone": phone,
        "address": "গুলশান ২, ঢাকা",
        "total_amount": 450,
        "items": [{"product_id": "1", "product_name": "টেস্ট পণ্য", "unit_price": 450, "quantity": 1}],
        "status": "pending"
    }
    status, res = api_call("orders/create.php", method="POST", payload=payload)
    assert status == 200 and res.get("status") == "success"
    return res["data"]

def test_api_layer():
    print("=" * 70)
    print("🧪 [PART 12 BACKEND API TESTS: Deleted Orders & Restore/Permanent Delete]")
    print("=" * 70)

    test_phone = "019" + str(int(time.time()))[-8:]
    test_order = create_test_order("DEL101", test_phone)
    test_id = test_order["id"]
    test_code = test_order.get("order_id", test_id)
    print(f"Created Test Order: ID={test_id}, Code={test_code}")

    # 1. Soft delete the order
    print("\n[১/৪] api/orders/delete.php দিয়ে সফট ডিলিট করা হচ্ছে...")
    status, del_res = api_call("orders/delete.php", method="POST", payload={"id": test_id, "permanent": False})
    assert status == 200 and del_res.get("success") is True
    print("✓ সফট ডিলিট সফল!")

    # 2. Verify get.php?deleted_only=1 returns this order
    print("\n[২/৪] api/orders/get.php?deleted_only=1 তে চেক করা হচ্ছে...")
    status, deleted_list = api_call("orders/get.php?deleted_only=1")
    assert status == 200 and isinstance(deleted_list, list)
    deleted_ids = [o["id"] for o in deleted_list]
    assert test_id in deleted_ids, "Soft-deleted order must appear in deleted_only list!"
    print(f"✓ ডিলিটেড অর্ডার সফলভাবে তালিকায় উপস্থিত! মোট ডিলিটেড: {len(deleted_list)} টি")

    # 3. Test Restore via update.php
    print("\n[৩/৪] api/orders/update.php দিয়ে রিস্টোর (is_deleted: false) করা হচ্ছে...")
    status, res = api_call("orders/update.php", method="POST", payload={"ids": [test_id], "is_deleted": False})
    assert status == 200 and res.get("success") is True
    print("✓ রিস্টোর সফল!")

    # Verify not in deleted list anymore
    status, deleted_list_after = api_call("orders/get.php?deleted_only=1")
    deleted_ids_after = [o["id"] for o in deleted_list_after]
    assert test_id not in deleted_ids_after, "Restored order should no longer appear in deleted list!"
    print("✓ রিস্টোর করার পর অর্ডারটি ডিলিটেড তালিকা থেকে সরে গেছে!")

    # 4. Soft-delete again for browser E2E test
    api_call("orders/delete.php", method="POST", payload={"id": test_id, "permanent": False})
    print("\n[৪/৪] ব্রাউজার টেস্টের জন্য অর্ডারটি পুনরায় ডিলিট লিস্টে প্রস্তুত করা হয়েছে।")

    print("\n" + "=" * 70)
    print("🎉 Part 12 এর সমস্ত ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)
    return test_id, test_code, test_phone

def test_playwright_e2e(test_id, test_code, test_phone):
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E TEST: DeletedOrders UI & Actions]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Open DeletedOrders page
        print("\n[১/৪] অ্যাডমিন DeletedOrders পেজে যাওয়া হচ্ছে...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/orders/deleted", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        screenshot_deleted_loaded = os.path.join(SCREENSHOTS_DIR, "08_deleted_orders_loaded.png")
        page.screenshot(path=screenshot_deleted_loaded)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_deleted_loaded}")

        # Step 2: Search for the test order
        print(f"\n[২/৪] সার্চ বক্সে ফোন {test_phone} দিয়ে ডিলিটেড অর্ডার খোঁজা হচ্ছে...")
        search_input = page.locator("input[placeholder*='অর্ডার আইডি, নাম বা মোবাইল']")
        search_input.wait_for(state="visible", timeout=10000)
        search_input.fill(test_phone)

        order_row = page.locator(f"text={test_phone}").first
        order_row.wait_for(state="visible", timeout=10000)
        print(f"✓ ডিলিটেড অর্ডার #{test_code} সফলভাবে দৃশ্যমান!")

        screenshot_deleted_search = os.path.join(SCREENSHOTS_DIR, "09_deleted_order_search.png")
        page.screenshot(path=screenshot_deleted_search)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_deleted_search}")

        # Step 3: Click Restore Button
        print(f"\n[৩/৪] অর্ডারের পাশে 'রিস্টোর' বাটনে ক্লিক করা হচ্ছে...")
        restore_btn = page.locator(f"#restore-{test_code}, #restore-{test_id}").first
        if not restore_btn.is_visible():
            restore_btn = page.locator("button:has-text('রিস্টোর')").first

        restore_btn.wait_for(state="visible", timeout=10000)
        restore_btn.click(force=True)
        time.sleep(2)
        print("✓ রিস্টোর বাটনে ক্লিক সম্পন্ন!")

        screenshot_after_restore = os.path.join(SCREENSHOTS_DIR, "10_after_order_restore.png")
        page.screenshot(path=screenshot_after_restore)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_after_restore}")

        # Verify through API
        status, check_single = api_call(f"orders/get.php?id={test_id}")
        assert status == 200
        assert not check_single.get("is_deleted"), "Order must have is_deleted=False after restore!"
        print(f"✓ ডাটাবেস ভেরিফিকেশন: অর্ডার #{test_code} সক্রিয় হয়েছে (is_deleted: {check_single.get('is_deleted')})!")

        # Step 4: Permanent delete verification on a newly soft-deleted record
        print("\n[৪/৪] স্থায়ীভাবে মুছে ফেলা (Permanent Delete) পরীক্ষা করা হচ্ছে...")
        api_call("orders/delete.php", method="POST", payload={"id": test_id, "permanent": False})
        page.reload(wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Filter by search again so target order is at row 0
        search_input = page.locator("input[placeholder*='অর্ডার আইডি, নাম বা মোবাইল']")
        search_input.wait_for(state="visible", timeout=10000)
        search_input.fill(test_phone)
        time.sleep(1)

        perm_delete_btn = page.locator(f"#perm-delete-{test_code}, #perm-delete-{test_id}").first
        perm_delete_btn.wait_for(state="visible", timeout=10000)
        perm_delete_btn.click()
        time.sleep(1)

        # Confirm dialog
        confirm_btn = page.locator("#confirm-perm-delete-btn, button:has-text('হ্যাঁ, চিরতরে মুছুন'), button:has-text('Yes, Erase Forever')").first
        confirm_btn.wait_for(state="visible", timeout=10000)
        confirm_btn.click()
        time.sleep(2)
        print("✓ স্থায়ীভাবে মুছে ফেলার ডায়ালগ নিশ্চিত করা হয়েছে!")

        # Verify completely deleted
        status, check_final = api_call(f"orders/get.php?id={test_id}")
        assert status == 404, "Permanently deleted order must return 404!"
        print("✓ ডাটাবেস ভেরিফিকেশন: অর্ডারটি ডাটাবেস থেকে সম্পূর্ণভাবে মুছে গেছে (HTTP 404 Not Found)!")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 12 PLAYWRIGHT E2E টেস্ট সম্পূর্ণ সফল হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    t_id, t_code, t_phone = test_api_layer()
    test_playwright_e2e(t_id, t_code, t_phone)
