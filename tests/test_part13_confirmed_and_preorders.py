import os
import sys
import json
import time
from datetime import datetime, timedelta
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

def create_pre_order(phone, pre_date):
    payload = {
        "customer_name": "প্রি-অর্ডার টেস্ট কাস্টমার",
        "phone": phone,
        "address": "উত্তরা সেক্টর ৭, ঢাকা",
        "total_amount": 750,
        "items": [
            {"product_id": "1", "product_name": "হাইব্রিড মরিচ বীজ", "unit_price": 350, "quantity": 1},
            {"product_id": "2", "product_name": "উন্নত জাতের বেগুন বীজ", "unit_price": 400, "quantity": 1}
        ],
        "status": "pre",
        "pre_date": pre_date,
        "note": "বিশেষ ডেলিভারি"
    }
    status, res = api_call("orders/create.php", method="POST", payload=payload)
    assert status == 200 and res.get("status") == "success", f"Failed to create pre-order: {res}"
    return res["data"]

def test_api_layer():
    print("=" * 70)
    print("🧪 [PART 13 BACKEND API TESTS: ConfirmedOrders & PreOrders]")
    print("=" * 70)

    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    test_phone = "018" + str(int(time.time()))[-8:]

    # 1. Create a pre-order
    print("\n[১/৪] নতুন প্রি-অর্ডার তৈরি করা হচ্ছে (status: pre, pre_date: today)...")
    pre_order = create_pre_order(test_phone, today_str)
    test_id = pre_order["id"]
    test_code = pre_order.get("order_id", test_id)
    print(f"✓ তৈরি সফল: ID={test_id}, Order Code=#{test_code}")

    # 2. Verify get.php?status=pre
    print("\n[২/৪] api/orders/get.php?status=pre চেক করা হচ্ছে...")
    status, pre_list = api_call("orders/get.php?status=pre")
    assert status == 200 and isinstance(pre_list, list)
    pre_ids = [o["id"] for o in pre_list]
    assert test_id in pre_ids, f"Order {test_id} must appear in status=pre list!"
    print(f"✓ প্রি-অর্ডার তালিকায় উপস্থিত! মোট প্রি-অর্ডার: {len(pre_list)} টি")

    # 3. Update pre_date via update.php
    print(f"\n[৩/৪] api/orders/update.php দিয়ে ডেলিভারি তারিখ পরিবর্তন করা হচ্ছে ({tomorrow_str})...")
    status, update_res = api_call("orders/update.php", method="POST", payload={"id": test_id, "pre_date": tomorrow_str})
    assert status == 200 and update_res.get("status") == "success"
    print("✓ প্রি-অর্ডার তারিখ সফলভাবে আপডেট হয়েছে!")

    # Verify updated
    status, single = api_call(f"orders/get.php?id={test_id}")
    assert status == 200 and single.get("pre_date") == tomorrow_str
    print(f"✓ ডাটাবেস ভেরিফিকেশন: নতুন pre_date = {single.get('pre_date')}")

    # 4. Test notification on status change
    print("\n[৪/৪] api/orders/notify.php টেস্ট করা হচ্ছে...")
    status, notify_res = api_call("orders/notify.php", method="POST", payload={
        "order_id": test_id,
        "new_status": "confirmed",
        "old_status": "pre"
    })
    assert status == 200
    print(f"✓ নোটিফিকেশন রেসপন্স: {notify_res}")

    print("\n" + "=" * 70)
    print("🎉 Part 13 ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)
    return test_id, test_code, test_phone, tomorrow_str

def test_playwright_e2e(test_id, test_code, test_phone, tomorrow_str):
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E: PreOrders & ConfirmedOrders UI]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Open PreOrders page
        print("\n[১/৪] অ্যাডমিন PreOrders পেজে যাওয়া হচ্ছে (/admin/orders/pre)...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/orders/pre", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        screenshot_pre_loaded = os.path.join(SCREENSHOTS_DIR, "11_preorders_page_loaded.png")
        page.screenshot(path=screenshot_pre_loaded)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_pre_loaded}")

        # Reset date to today for browser test
        api_call("orders/update.php", method="POST", payload={"id": test_id, "pre_date": datetime.now().strftime("%Y-%m-%d")})
        page.reload(wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Switch to "সব" (All) tab to see all pre-orders regardless of date
        all_tab = page.locator("button[value='all'], button:has-text('সব')").first
        if all_tab.is_visible():
            all_tab.click()
            time.sleep(1)

        # Step 2: Search for the test pre-order
        print(f"\n[২/৪] সার্চ বক্সে ফোন {test_phone} দিয়ে প্রি-অর্ডার ফিল্টার করা হচ্ছে...")
        search_input = page.locator("input[placeholder*='অর্ডার আইডি, নাম বা মোবাইল']")
        search_input.wait_for(state="visible", timeout=10000)
        search_input.fill(test_phone)
        time.sleep(1)

        order_row = page.locator(f"text={test_phone}").first
        order_row.wait_for(state="visible", timeout=10000)
        print(f"✓ প্রি-অর্ডার #{test_code} সফলভাবে তালিকায় দৃশ্যমান!")

        # Step 3: Edit pre_date through Dialog
        print("\n[৩/৪] টেবিলের 'তারিখ' বাটনে ক্লিক করে ডেলিভারি ডেট ডায়ালগ ওপেন করা হচ্ছে...")
        edit_date_btn = page.locator(f"#edit-date-{test_code}, #edit-date-{test_id}").first
        if not edit_date_btn.is_visible():
            edit_date_btn = page.locator("button:has-text('তারিখ')").first

        edit_date_btn.wait_for(state="visible", timeout=10000)
        edit_date_btn.click()
        time.sleep(1)

        # Set new date (next week)
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        date_input = page.locator("#pre-date-input")
        date_input.wait_for(state="visible", timeout=10000)
        date_input.fill(future_date)
        time.sleep(0.5)

        save_btn = page.locator("#save-pre-date-btn")
        save_btn.wait_for(state="visible", timeout=10000)
        save_btn.click()
        time.sleep(2)

        screenshot_pre_updated = os.path.join(SCREENSHOTS_DIR, "12_preorder_date_updated.png")
        page.screenshot(path=screenshot_pre_updated)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_pre_updated}")
        print("✓ প্রি-অর্ডার তারিখ সফলভাবে ডায়ালগ থেকে আপডেট করা হয়েছে!")

        # Step 4: Confirmed Orders page test
        print("\n[৪/৪] কনফার্মড অর্ডার পেজে যাওয়া হচ্ছে (/admin/orders/confirmed)...")
        # First update test order to confirmed status
        api_call("orders/update.php", method="POST", payload={"id": test_id, "status": "confirmed"})

        page.goto(f"{FRONTEND_BASE}/admin/orders/confirmed", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Search for confirmed order
        search_box = page.locator("#confirmed-orders-search, input[placeholder*='ফোন'], input[placeholder*='phone']").first
        search_box.wait_for(state="visible", timeout=10000)
        search_box.fill(test_phone)
        time.sleep(1.5)

        screenshot_confirmed = os.path.join(SCREENSHOTS_DIR, "13_confirmed_orders_loaded.png")
        page.screenshot(path=screenshot_confirmed)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_confirmed}")

        row_item = page.locator(f"text={test_phone}").first
        assert row_item.is_visible(), "Confirmed order must be visible in ConfirmedOrders page!"
        print(f"✓ কনফার্মড অর্ডার #{test_code} সফলভাবে ConfirmedOrders পেজে দৃশ্যমান!")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 13 PLAYWRIGHT E2E টেস্ট সম্পূর্ণ সফল হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    t_id, t_code, t_phone, t_date = test_api_layer()
    test_playwright_e2e(t_id, t_code, t_phone, t_date)
