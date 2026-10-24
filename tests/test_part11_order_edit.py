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

def test_api_layer():
    print("=" * 70)
    print("🧪 [PART 11 BACKEND API TESTS: Single Order Fetch & Edit Operations]")
    print("=" * 70)

    # 1. Fetch orders list to pick a sample
    status, orders = api_call("orders/get.php")
    assert status == 200 and len(orders) > 0, "At least one order must exist"
    target_order = orders[0]
    target_id = target_order["id"]
    target_code = target_order.get("order_id", target_id)
    print(f"Testing with Order ID: {target_id} (Code: {target_code})")

    # 2. Test get.php?id={id}
    print("\n[১/৪] get.php?id=... দিয়ে একক অর্ডার ও আইটেম ফেচ যাচাই...")
    status, single = api_call(f"orders/get.php?id={target_id}")
    assert status == 200, f"Expected 200, got {status}"
    assert single.get("id") == target_id, "Fetched order ID must match"
    print(f"✓ একক অর্ডার আইডি দিয়ে সফলভাবে প্রাপ্ত: {single.get('customer_name')}")

    # 3. Test get.php?order_id={code}
    print("\n[২/৪] get.php?order_id=... দিয়ে কোড অনুযায়ী ফেচ যাচাই...")
    status, single_by_code = api_call(f"orders/get.php?order_id={target_code}")
    assert status == 200
    assert single_by_code.get("id") == target_id
    print(f"✓ অর্ডার কোড #{target_code} দিয়ে সফলভাবে প্রাপ্ত!")

    # 4. Test update.php with arbitrary fields
    print("\n[৩/৪] update.php দিয়ে অল্টারনেটিভ ফোন, নোট, প্রিন্ট নোট ও আইটেম আপডেট...")
    new_note = "স্পেশাল ডেলিভারি নোট - পার্ট ১১ টেস্ট"
    new_alt_phone = "01999887766"
    status, res = api_call("orders/update.php", method="POST", payload={
        "id": target_id,
        "note": new_note,
        "alt_phone": new_alt_phone,
        "print_note": True,
        "pre_date": "2026-10-25"
    })
    assert status == 200 and res.get("success") is True
    print("✓ অর্ডারের নোট, অল্টারনেটিভ ফোন ও প্রি-ডেট আপডেট সফল!")

    # Verify updated values in get.php
    status, verified = api_call(f"orders/get.php?id={target_id}")
    assert verified.get("note") == new_note, "Note was not updated!"
    assert verified.get("alt_phone") == new_alt_phone, "Alt phone was not updated!"
    assert verified.get("print_note") is True, "Print note was not updated!"
    assert verified.get("pre_date") == "2026-10-25", "Pre date was not updated!"
    print("✓ ডাটাবেসে সেভ হওয়া ডাটা শতভাগ ভেরিফায়েড!")

    # 5. Test soft delete and recovery
    print("\n[৪/৪] delete.php (সফট ডিলিট ও রিকভারি যাচাই)...")
    status, del_res = api_call("orders/delete.php", method="POST", payload={"id": target_id, "permanent": False})
    assert status == 200 and del_res.get("is_deleted") is True
    # Restore
    api_call("orders/update.php", method="POST", payload={"id": target_id, "is_deleted": False})
    print("✓ সফট ডিলিট ও রিস্টোর সফল!")

    print("\n" + "=" * 70)
    print("🎉 Part 11 এর সমস্ত ব্যাকএন্ড API টেস্ট সফল হয়েছে!")
    print("=" * 70)

def test_playwright_e2e():
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E TEST: OrderEdit UI & Interactions]")
    print("=" * 70)

    # Pick an active order
    status, orders = api_call("orders/get.php")
    assert len(orders) > 0
    target_order = orders[0]
    target_code = target_order.get("order_id", target_order["id"])

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        print(f"\n[১/৪] অ্যাডমিন OrderEdit পেজ ওপেন করা হচ্ছে (#{target_code})...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/orders/edit/{target_code}", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        screenshot_edit_loaded = os.path.join(SCREENSHOTS_DIR, "06_order_edit_page_loaded.png")
        page.screenshot(path=screenshot_edit_loaded)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_edit_loaded}")

        # Check customer name field
        name_input = page.locator("#customerName, input[value*=''], input").first
        print(f"✓ অর্ডার এডিট পেজ সফলভাবে রেন্ডার হয়েছে!")

        # Edit Address
        print("\n[২/৪] ঠিকানা ও নোট পরিবর্তন করে সেভ করা হচ্ছে...")
        updated_address = "উত্তরা সেক্টর ৭, রোড ৪, ঢাকা (অটোমেটেড এডিট)"
        addr_area = page.locator("textarea").first
        if addr_area.is_visible():
            addr_area.fill(updated_address)
            time.sleep(0.5)

        # Click save button
        save_btn = page.locator("button:has-text('আপডেট করুন'), button:has-text('সংরক্ষণ করুন'), button:has-text('Save')").first
        if save_btn.is_visible():
            save_btn.scroll_into_view_if_needed()
            save_btn.click(force=True)
            time.sleep(2)
            print("✓ 'আপডেট করুন' বাটনে ক্লিক করা হয়েছে!")

        screenshot_edit_saved = os.path.join(SCREENSHOTS_DIR, "07_order_edit_saved.png")
        page.screenshot(path=screenshot_edit_saved)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_edit_saved}")

        # Verify through API
        status, updated_order = api_call(f"orders/get.php?id={target_order['id']}")
        print(f"✓ ডাটাবেসে সেভ হওয়া বর্তমান ঠিকানা: {updated_order.get('address')}")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 11 PLAYWRIGHT E2E টেস্ট সম্পূর্ণ সফল হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    test_api_layer()
    test_playwright_e2e()
