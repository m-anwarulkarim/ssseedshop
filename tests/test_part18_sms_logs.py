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
    print("🧪 [PART 18 BACKEND API TESTS: SMS Logs, History & Balance]")
    print("=" * 70)

    # 1. Test GET api/sms/logs.php
    print("\n[১/৪] api/sms/logs.php কল করে SMS লগ ফেচ করা হচ্ছে...")
    status, logs = api_call("sms/logs.php")
    assert status == 200 and isinstance(logs, list), f"Expected list of logs, got: {logs}"
    print(f"✓ সফলভাবে {len(logs)}টি SMS লগ পাওয়া গেছে।")
    if logs:
        sample = logs[0]
        print(f"  নমুনা লগ: ID={sample.get('id')}, Phone={sample.get('phone')}, Reason={sample.get('reason')}, Status={sample.get('status')}")
        assert "phone" in sample and "message" in sample and "created_at" in sample, "Missing required log keys"

    # 2. Test GET api/sms/logs.php?action=balance
    print("\n[২/৪] api/sms/logs.php?action=balance দিয়ে SMS ব্যালেন্স চেক করা হচ্ছে...")
    b_status, b_res = api_call("sms/logs.php?action=balance")
    assert b_status == 200 and b_res.get("success") is True, f"Balance check failed: {b_res}"
    balance = b_res.get("balance", {})
    print(f"✓ SMS ব্যালেন্স পাওয়া গেছে: {balance}")

    # 3. Test POST api/sms/logs.php action=add (Create test log)
    print("\n[৩/৪] টেস্ট SMS লগ তৈরি করা হচ্ছে (action=add)...")
    test_phone = "01988776655"
    test_msg = "Playwright Part 18 automated test SMS"
    add_status, add_res = api_call("sms/logs.php", method="POST", payload={
        "action": "add",
        "phone": test_phone,
        "message": test_msg,
        "reason": "manual",
        "status": "sent",
        "sent_by_admin": "Playwright Tester"
    })
    assert add_status == 200 and add_res.get("success") is True, f"Failed adding test log: {add_res}"
    created_id = add_res.get("log", {}).get("id")
    print(f"✓ টেস্ট SMS লগ সফলভাবে তৈরি হয়েছে, ID: {created_id}")

    # 4. Test POST api/sms/logs.php action=delete (Delete created log)
    print("\n[৪/৪] তৈরি করা টেস্ট SMS লগ ডিলিট করা হচ্ছে (action=delete)...")
    del_status, del_res = api_call("sms/logs.php", method="POST", payload={
        "action": "delete",
        "id": created_id
    })
    assert del_status == 200 and del_res.get("success") is True, f"Failed deleting test log: {del_res}"
    print(f"✓ টেস্ট SMS লগ সফলভাবে ডিলিট করা হয়েছে! Deleted count: {del_res.get('deleted_count')}")

def test_frontend_playwright():
    print("\n" + "=" * 70)
    print("🎭 [PART 18 FRONTEND PLAYWRIGHT TESTS: SmsLogs.tsx]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Set admin bypass in localStorage
        page.goto(f"{FRONTEND_BASE}/", wait_until="domcontentloaded")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            sessionStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
            localStorage.setItem('user', JSON.stringify({
                id: 'admin_1',
                email: 'admin@agroseed.bd',
                role: 'admin',
                name: 'Super Admin'
            }));
        }""")

        print("\n[১/৩] /admin/notifications পেজে নেভিগেট করা হচ্ছে...")
        page.goto(f"{FRONTEND_BASE}/admin/notifications", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Click SMS tab
        print("\n[২/৩] SMS ট্যাবে ক্লিক করা হচ্ছে...")
        sms_tab = page.locator("button[role='tab']:has-text('SMS'), [data-state]:has-text('SMS')")
        if sms_tab.count() > 0:
            sms_tab.first.click(force=True)
        else:
            page.locator("text=SMS").first.click(force=True)
        time.sleep(2)

        # Verify SMS dashboard elements
        page.wait_for_selector("text=SMS ড্যাশবোর্ড", timeout=10000)
        print("✓ SMS ড্যাশবোর্ড হেডার দৃশ্যমান হয়েছে।")

        # Capture loaded screenshot
        shot1_path = os.path.join(SCREENSHOTS_DIR, "23_sms_logs_loaded.png")
        page.screenshot(path=shot1_path, full_page=True)
        print(f"📸 স্ক্রিনশট ১ সংরক্ষিত: {shot1_path}")

        # Search functionality test
        print("\n[৩/৩] ফোন নম্বর / মেসেজ দিয়ে ফিল্টারিং ও সার্চ টেস্ট করা হচ্ছে...")
        search_input = page.locator("input[placeholder*='ফোন বা মেসেজ দিয়ে খুঁজুন']")
        if search_input.count() > 0:
            search_input.first.fill("01799881122")
            page.wait_for_timeout(1500)
            print("✓ সার্চ ইনপুটে '01799881122' প্রদান করা হয়েছে।")

        # Capture search results screenshot
        shot2_path = os.path.join(SCREENSHOTS_DIR, "24_sms_logs_search.png")
        page.screenshot(path=shot2_path, full_page=True)
        print(f"📸 স্ক্রিনশট ২ সংরক্ষিত: {shot2_path}")

        # Copy to artifact directory
        for filename in ["23_sms_logs_loaded.png", "24_sms_logs_search.png"]:
            src = os.path.join(SCREENSHOTS_DIR, filename)
            dst = os.path.join(ARTIFACT_DIR, filename)
            if os.path.exists(src):
                shutil.copy2(src, dst)
                print(f"✓ আর্টিফ্যাক্ট ফোল্ডারে কপি করা হয়েছে: {filename}")

        browser.close()
        print("\n✨ Part 18: সকল ব্যাকএন্ড ও ফ্রন্টএন্ড প্লেরাইট টেস্ট সফলভাবে সম্পন্ন হয়েছে!")

if __name__ == "__main__":
    test_api_layer()
    test_frontend_playwright()
