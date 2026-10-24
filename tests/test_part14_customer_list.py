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
    print("🧪 [PART 14 BACKEND API TESTS: CustomerList & Order History Calculation]")
    print("=" * 70)

    # 1. Fetch customer list
    print("\n[১/৪] api/customer/get.php কল করে কাস্টমার তালিকা ফেচ করা হচ্ছে...")
    status, customers = api_call("customer/get.php")
    assert status == 200 and isinstance(customers, list), f"Expected list of customers, got {customers}"
    assert len(customers) > 0, "Customers list must not be empty!"
    print(f"✓ মোট কাস্টমার পাওয়া গেছে: {len(customers)} জন")

    # Find a customer with orders
    active_customer = None
    for c in customers:
        if c.get("orderCount", 0) > 0:
            active_customer = c
            break

    if not active_customer:
        active_customer = customers[0]

    test_phone = active_customer["phone"]
    test_name = active_customer.get("name") or "টেস্ট কাস্টমার"
    test_orders = active_customer.get("orderCount", 0)
    test_total = active_customer.get("orderTotal", 0)
    print(f"✓ নির্বাচিত কাস্টমার: {test_name} ({test_phone}) | মোট অর্ডার: {test_orders} টি | মোট খরচ: ৳{test_total}")

    # 2. Search testing
    print(f"\n[২/৪] সার্চ ফিল্টারিং পরীক্ষা করা হচ্ছে (?search={test_phone})...")
    status, search_res = api_call(f"customer/get.php?search={test_phone}")
    assert status == 200 and isinstance(search_res, list)
    matching = [c for c in search_res if c["phone"] == test_phone]
    assert len(matching) > 0, "Searched customer must be returned!"
    print("✓ সার্চ ফিল্টারিং সফল!")

    # 3. Single customer profile test
    print(f"\n[৩/৪] একক কাস্টমার ডিটেইলস ফেচ করা হচ্ছে (?phone={test_phone})...")
    status, single_res = api_call(f"customer/get.php?phone={test_phone}")
    assert status == 200 and single_res.get("status") == "success"
    print(f"✓ একক প্রোফাইল তথ্য পাওয়া গেছে: {single_res['customer']['name']}")

    # 4. Profile update test via profile.php
    print("\n[৪/৪] api/customer/profile.php দিয়ে এডমিন নোট আপডেট পরীক্ষা করা হচ্ছে...")
    update_payload = {
        "action": "update",
        "phone": test_phone,
        "admin_notes": "VIP নিয়মিত কাস্টমার"
    }
    status, up_res = api_call("customer/profile.php", method="POST", payload=update_payload)
    assert status == 200 and up_res.get("status") == "success"
    print("✓ কাস্টমার এডমিন নোট সফলভাবে আপডেট হয়েছে!")

    print("\n" + "=" * 70)
    print("🎉 Part 14 ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)
    return test_phone, test_name, test_orders, test_total

def test_playwright_e2e(test_phone, test_name, test_orders, test_total):
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E: CustomerList & Order History Modal]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Open CustomerList page
        print("\n[১/৩] অ্যাডমিন CustomerList পেজে যাওয়া হচ্ছে (/admin/customers)...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/users/customers", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        screenshot_loaded = os.path.join(SCREENSHOTS_DIR, "14_customer_list_loaded.png")
        page.screenshot(path=screenshot_loaded)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_loaded}")

        # Step 2: Instant Search
        print(f"\n[২/৩] সার্চ বক্সে ফোন {test_phone} দিয়ে ইনস্ট্যান্ট সার্চ করা হচ্ছে...")
        search_input = page.locator("#customer-search-input, input[placeholder*='নাম বা মোবাইল']")
        search_input.wait_for(state="visible", timeout=10000)
        search_input.fill(test_phone)
        time.sleep(1.5)

        screenshot_search = os.path.join(SCREENSHOTS_DIR, "15_customer_search_result.png")
        page.screenshot(path=screenshot_search)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_search}")

        cust_row = page.locator(f"text={test_phone}").first
        cust_row.wait_for(state="visible", timeout=10000)
        print(f"✓ কাস্টমার {test_phone} টেবিলে সফলভাবে ফিল্টার হয়েছে!")

        # Step 3: Open details popup & order history
        print("\n[৩/৩] কাস্টমারে ক্লিক করে অর্ডার হিস্ট্রি ও ডিটেইলস পপআপ খোলা হচ্ছে...")
        view_btn = page.locator(f"#view-customer-{test_phone}").first
        if view_btn.is_visible():
            view_btn.click()
        else:
            cust_row.click()
        time.sleep(1.5)

        # Modal must be visible
        modal = page.locator("[role='dialog']").first
        modal.wait_for(state="visible", timeout=10000)

        screenshot_modal = os.path.join(SCREENSHOTS_DIR, "16_customer_order_history_modal.png")
        page.screenshot(path=screenshot_modal)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_modal}")
        print("✓ কাস্টমার ডিটেইলস এবং পূর্বের অর্ডার হিস্ট্রি পপআপ সফলভাবে দৃশ্যমান!")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 14 PLAYWRIGHT E2E টেস্ট সম্পূর্ণ সফল হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    phone, name, orders_cnt, total_amt = test_api_layer()
    test_playwright_e2e(phone, name, orders_cnt, total_amt)
