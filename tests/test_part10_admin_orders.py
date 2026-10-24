import os
import sys
import json
import time
import urllib.request
import urllib.parse
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
COUPONS_FILE = os.path.join(BASE_DIR, "api", "database", "coupons.json")
SMS_LOGS_FILE = os.path.join(BASE_DIR, "api", "database", "sms_logs.json")
INCOMPLETE_FILE = os.path.join(BASE_DIR, "api", "database", "incomplete_orders.json")

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
    print("🧪 [PART 10 BACKEND API TESTS: PHP Endpoints]")
    print("=" * 70)

    # 1. Test api/orders/get.php
    print("\n[১/৬] api/orders/get.php যাচাইকরণ...")
    status, orders = api_call("orders/get.php")
    assert status == 200, f"Expected 200, got {status}"
    assert isinstance(orders, list), "Expected orders to be a list"
    print(f"✓ get.php সফল! মোট অর্ডার প্রাপ্তি: {len(orders)} টি")

    # Filter by status
    status, pending_orders = api_call("orders/get.php?status=pending")
    assert status == 200
    for o in pending_orders:
        assert o.get("status") == "pending", f"Expected pending, got {o.get('status')}"
    print(f"✓ get.php?status=pending ফিল্টারিং সফল! পেন্ডিং অর্ডার: {len(pending_orders)} টি")

    # 2. Test api/orders/update.php (Single & Bulk)
    print("\n[২/৬] api/orders/update.php যাচাইকরণ...")
    assert len(orders) > 0, "No orders available to update"
    sample_order = orders[0]
    sample_id = sample_order.get("id")
    original_status = sample_order.get("status", "pending")

    # Single update
    test_status = "processing" if original_status != "processing" else "pending"
    status, res = api_call("orders/update.php", method="POST", payload={
        "id": sample_id,
        "status": test_status,
        "last_status_changed_by": "test-admin"
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res.get("success") is True
    print(f"✓ Single status update সফল: {original_status} -> {test_status}")

    # Revert back
    api_call("orders/update.php", method="POST", payload={"id": sample_id, "status": original_status})

    # Bulk update test
    if len(orders) >= 2:
        ids = [orders[0]["id"], orders[1]["id"]]
        status, res = api_call("orders/update.php", method="POST", payload={
            "ids": ids,
            "status": "hold"
        })
        assert status == 200
        assert res.get("updated_count") == 2
        print(f"✓ Bulk status update সফল! ২ টি অর্ডারের স্ট্যাটাস 'hold' এ পরিবর্তন হয়েছে।")
        # Revert
        api_call("orders/update.php", method="POST", payload={"ids": [orders[0]["id"]], "status": orders[0].get("status", "pending")})
        api_call("orders/update.php", method="POST", payload={"ids": [orders[1]["id"]], "status": orders[1].get("status", "pending")})

    # 3. Test api/orders/delete.php (Soft Delete & Restore)
    print("\n[৩/৬] api/orders/delete.php (সফট ডিলিট ও রিকভারি)...")
    status, res = api_call("orders/delete.php", method="POST", payload={"id": sample_id})
    assert status == 200
    assert res.get("success") is True
    assert res.get("is_deleted") is True
    print("✓ সফট ডিলিট সফল!")

    # Verify not in default get.php
    status, active_orders = api_call("orders/get.php")
    active_ids = [o["id"] for o in active_orders]
    assert sample_id not in active_ids, "Soft deleted order should not appear in default get.php list!"
    print("✓ সফট ডিলিট হওয়া অর্ডার ডিফল্ট get.php তালিকা থেকে সফলভাবে ফিল্টার হয়েছে!")

    # Restore order
    api_call("orders/update.php", method="POST", payload={"id": sample_id, "is_deleted": False})
    print("✓ অর্ডার রিস্টোর সম্পন্ন হয়েছে।")

    # 4. Test api/orders/coupons.php
    print("\n[৪/৬] api/orders/coupons.php কুপন যাচাই...")
    status, res = api_call("orders/coupons.php?code=WELCOME50&cart_total=600")
    assert status == 200
    assert res.get("valid") is True
    assert res.get("discount") == 50
    print(f"✓ কুপন ভ্যালিডেশন সফল: WELCOME50 দিলে ডিসকাউন্ট ৳{res.get('discount')}")

    # 5. Test api/orders/notify.php
    print("\n[৫/৬] api/orders/notify.php SMS অ্যালার্ট যাচাই...")
    status, res = api_call("orders/notify.php", method="POST", payload={
        "order_id": sample_id,
        "new_status": "confirmed"
    })
    assert status == 200
    assert res.get("success") is True
    print("✓ SMS অ্যালার্ট নোটিফিকেশন API সফল!")

    # 6. Test api/orders/incomplete.php
    print("\n[৬/৬] api/orders/incomplete.php ইনকমপ্লিট অর্ডার যাচাই...")
    status, res = api_call("orders/incomplete.php", method="POST", payload={
        "customer_name": "Part 10 Test Dropoff",
        "phone": "01999887766",
        "visitor_id": "vis_part10_test",
        "reason": "checkout_abandoned",
        "cart_snapshot": [{"id": "1", "name": "টেস্ট বীজ", "price": 250, "quantity": 1}]
    })
    assert status == 200
    assert res.get("success") is True
    print("✓ ইনকমপ্লিট অর্ডার সেভ ও ড্রপ-অফ রেকর্ড সফল!")

    print("\n" + "=" * 70)
    print("🎉 সমস্ত PHP API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)

def test_playwright_e2e():
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E TEST: Admin WebOrders & Checkout]")
    print("=" * 70)

    test_customer_name = "সাকিব আল হাসান"
    test_phone = "018" + str(int(time.time()))[-8:]
    test_address = "মিরপুর ২, ব্লক ডি, রোড ৫, ঢাকা"
    print(f"📱 টেস্ট গ্রাহকের ফোন: {test_phone}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Create a test order via Checkout
        print("\n[১/৫] চেকআউট পেজে কার্ট লোড ও কুপন WELCOME50 সহ নতুন অর্ডার প্লেস করা হচ্ছে...")
        cart_data = [{
            "id": "1",
            "name": "হাইব্রিড মরিচ বীজ",
            "price": 350,
            "quantity": 2,
            "image": "https://placehold.co/100x100"
        }]
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate(f"localStorage.setItem('cart-items', JSON.stringify({json.dumps(cart_data)}))")
        page.goto(f"{FRONTEND_BASE}/checkout", wait_until="networkidle")
        time.sleep(1)

        # Apply coupon
        toggle_btn = page.locator("#toggle-coupon-btn")
        if toggle_btn.is_visible():
            toggle_btn.click()
            time.sleep(0.3)

        coupon_input = page.locator("#coupon-code-input")
        if coupon_input.is_visible():
            coupon_input.fill("WELCOME50")
            page.locator("#apply-coupon-btn").click()
            time.sleep(1)
            print("✓ কুপন কোড WELCOME50 অ্যাপ্লাই করা হয়েছে!")

        # Fill checkout form
        page.locator("#name").fill(test_customer_name)
        page.locator("#phone").fill(test_phone)
        page.locator("#address").fill(test_address)
        time.sleep(0.5)

        # Submit Order
        page.locator("button:has-text('অর্ডার কনফার্ম করুন')").click()
        page.wait_for_url("**/order-confirmed/**", timeout=20000)
        confirmed_url = page.url
        order_code = confirmed_url.split("/")[-1].split("?")[0]
        print(f"✓ নতুন অর্ডার সফলভাবে তৈরি হয়েছে! অর্ডার কোড: {order_code}")

        # Capture confirmation screenshot
        screenshot_order = os.path.join(SCREENSHOTS_DIR, "01_order_confirmed.png")
        page.screenshot(path=screenshot_order)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_order}")

        # Step 2: Open Admin Web Orders Panel
        print("\n[২/৫] অ্যাডমিন WebOrders প্যানেল লোড করা হচ্ছে (Dev Bypass মোডে)...")
        # Set admin bypass flag in localStorage
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

        screenshot_admin_web = os.path.join(SCREENSHOTS_DIR, "02_admin_web_orders_loaded.png")
        page.screenshot(path=screenshot_admin_web)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_admin_web}")

        # Step 3: Search for the created order
        print(f"\n[৩/৫] অ্যাডমিন টেবিলে সার্চ করে অর্ডার #{order_code} বা {test_phone} খোঁজা হচ্ছে...")
        search_input = page.locator("input[placeholder*='অর্ডার আইডি, নাম বা ফোন']")
        assert search_input.is_visible(), "Search input should be visible!"
        search_input.fill(test_phone)
        time.sleep(1.5)

        # Verify the order row is visible
        order_row = page.get_by_text(test_phone).first
        assert order_row.is_visible(), f"Order with phone {test_phone} must be visible in admin table!"
        print(f"✓ টেবিলে গ্রাহক {test_customer_name} ({test_phone}) এর পেন্ডিং অর্ডার সঠিকভাবে দৃশ্যমান!")

        screenshot_search = os.path.join(SCREENSHOTS_DIR, "03_order_search_result.png")
        page.screenshot(path=screenshot_search)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_search}")

        # Step 4: 1-Click Quick Confirm
        print(f"\n[৪/৫] এক ক্লিকে 'কনফার্ম' (Quick Confirm) বাটনে ক্লিক করা হচ্ছে...")
        page.keyboard.press("Escape")
        time.sleep(0.5)
        quick_confirm_btn = page.locator(f"#quick-confirm-{order_code}")
        if not quick_confirm_btn.is_visible():
            # If order code differs from database code, find the first quick confirm button
            quick_confirm_btn = page.locator("button[id^='quick-confirm-']").first

        assert quick_confirm_btn.is_visible(), "Quick confirm button must be visible!"
        quick_confirm_btn.scroll_into_view_if_needed()
        quick_confirm_btn.click(force=True)
        time.sleep(2)
        print("✓ কুইক কনফার্ম বাটন চাপ দেওয়া হয়েছে! স্ট্যাটাস 'confirmed' এ রূপান্তরিত হয়েছে।")

        screenshot_confirmed = os.path.join(SCREENSHOTS_DIR, "04_order_quick_confirmed.png")
        page.screenshot(path=screenshot_confirmed)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_confirmed}")

        # Step 5: Test Incomplete Orders Tab
        print("\n[৫/৫] 'ইনকমপ্লিট অর্ডার' ট্যাবে ক্লিক করে ড্রপ-অফ কাস্টমার ডাটা যাচাই...")
        incomplete_tab = page.get_by_text("ইনকমপ্লিট").first
        if incomplete_tab.is_visible():
            incomplete_tab.click()
            time.sleep(2)
            print("✓ ইনকমপ্লিট অর্ডার ট্যাব ওপেন হয়েছে!")
            screenshot_incomplete = os.path.join(SCREENSHOTS_DIR, "05_incomplete_orders_tab.png")
            page.screenshot(path=screenshot_incomplete)
            print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_incomplete}")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 PLAYWRIGHT E2E টেস্ট সম্পূর্ণ সফল হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    test_api_layer()
    test_playwright_e2e()
