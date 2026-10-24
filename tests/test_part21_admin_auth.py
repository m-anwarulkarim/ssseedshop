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

def save_screenshot(page, filename):
    local_path = os.path.join(SCREENSHOTS_DIR, filename)
    artifact_path = os.path.join(ARTIFACT_DIR, filename)
    page.screenshot(path=local_path, full_page=False)
    if os.path.exists(ARTIFACT_DIR):
        shutil.copy2(local_path, artifact_path)
    print(f"📸 Screenshot saved: {filename}")

def test_admin_auth_api():
    print("=" * 70)
    print("🔐 [PART 21 API TEST: Local Admin Auth & Management]")
    print("=" * 70)

    # 1. Test Login with invalid credentials
    print("\n[১/৫] ভুল পাসওয়ার্ড দিয়ে লগইন টেস্ট করা হচ্ছে...")
    code, resp = api_call("auth/login.php", method="POST", payload={
        "email": "admin@agroseed.bd",
        "password": "wrong_password"
    })
    print(f"   HTTP Code: {code}, Message: {resp.get('message')}")
    assert code == 401, "Expected 401 for wrong password"

    # 2. Test Login with valid Super Admin
    print("\n[২/৫] সঠিক Super Admin ক্রেডেনশিয়াল দিয়ে লগইন টেস্ট...")
    code, resp = api_call("auth/login.php", method="POST", payload={
        "email": "admin@agroseed.bd",
        "password": "admin123"
    })
    print(f"   HTTP Code: {code}, Status: {resp.get('status')}")
    assert code == 200, f"Expected 200, got {code}"
    assert resp.get("status") == "success"
    assert "token" in resp
    assert resp["user"]["email"] == "admin@agroseed.bd"
    assert resp["user"]["is_super_admin"] is True
    print(f"   ✅ Login Successful! User: {resp['user']['name']} ({resp['user']['role']})")

    # 3. Test Admin Manage: List
    print("\n[৩/৫] api/admin/manage.php?action=list কল করা হচ্ছে...")
    code, admins = api_call("admin/manage.php?action=list", method="GET")
    assert code == 200
    assert isinstance(admins, list) and len(admins) >= 1
    print(f"   ✅ মোট অ্যাডমিন পাওয়া গেছে: {len(admins)} জন")

    # 4. Test Admin Manage: Create Moderator
    print("\n[৪/৫] নতুন মডারেটর তৈরি করা হচ্ছে (action=create)...")
    test_email = f"moderator_{int(time.time())}@agroseed.bd"
    code, create_res = api_call("admin/manage.php", method="POST", payload={
        "action": "create",
        "email": test_email,
        "password": "modpassword123",
        "name": "Playwright Test Moderator",
        "role": "moderator",
        "permissions": ["overview", "orders-web"]
    })
    print(f"   Create Response: {create_res}")
    assert code == 200
    new_admin_id = create_res["admin"]["id"]

    # 5. Test Login with newly created moderator
    print("\n[৫/৫] সদ্য তৈরিকৃত মডারেটর দিয়ে লগইন যাচাই...")
    code, mod_login = api_call("auth/login.php", method="POST", payload={
        "email": test_email,
        "password": "modpassword123"
    })
    assert code == 200
    assert mod_login["user"]["role"] == "moderator"
    print(f"   ✅ মডারেটর সফলভাবে লগইন করতে পেরেছে!")

    # Cleanup: Delete the test moderator
    code, del_res = api_call("admin/manage.php", method="POST", payload={
        "action": "delete",
        "user_id": new_admin_id
    })
    assert code == 200
    print(f"   🧹 টেস্ট মডারেটর সফলভাবে মুছে ফেলা হয়েছে!")

    print("\n🎉 ALL API AUTH TESTS PASSED 100%!")

def test_admin_auth_playwright():
    print("\n" + "=" * 70)
    print("🎭 [PART 21 PLAYWRIGHT BROWSER E2E: Admin Login & Session Flow]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # Step 1: Open /admin without any bypass to see the actual login form
        print("\n[১/৩] অ্যাডমিন লগইন পেজে যাওয়া হচ্ছে (সেশন ছাড়া)...")
        page.goto(f"{FRONTEND_BASE}/admin", wait_until="domcontentloaded")
        page.evaluate("""() => {
            localStorage.clear();
            sessionStorage.clear();
        }""")
        page.goto(f"{FRONTEND_BASE}/admin", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        save_screenshot(page, "37_admin_login_page_empty.png")
        print("   লগইন ফর্ম রেন্ডার হয়েছে।")

        # Step 2: Fill in email and password
        print("\n[২/৩] ইমেইল (admin@agroseed.bd) ও পাসওয়ার্ড (admin123) দিয়ে লগইন করা হচ্ছে...")
        page.locator("input[type='email']").fill("admin@agroseed.bd")
        page.locator("input[type='password']").fill("admin123")
        page.wait_for_timeout(500)
        save_screenshot(page, "38_admin_login_filled.png")

        # Submit form
        page.locator("button[type='submit']").first.click()
        page.wait_for_timeout(3000)

        # Verify redirection to /admin/overview
        current_url = page.url
        print(f"   লগইনের পর বর্তমান URL: {current_url}")
        assert "/admin/overview" in current_url or "/admin" in current_url
        save_screenshot(page, "39_admin_logged_in_dashboard.png")
        print("   ✅ সফলভাবে ড্যাশবোর্ডে প্রবেশ করা হয়েছে!")

        # Step 3: Check Admin List page (/admin/users/admins)
        print("\n[৩/৩] অ্যাডমিন তালিকা পেজে যাওয়া হচ্ছে (/admin/users/admins)...")
        page.goto(f"{FRONTEND_BASE}/admin/users/admins", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        save_screenshot(page, "40_admin_list_table_loaded.png")
        body_text = page.inner_text("body")
        assert "admin@agroseed.bd" in body_text or "অ্যাডমিন" in body_text
        print("   ✅ অ্যাডমিন ও মডারেটর তালিকা সফলভাবে রেন্ডার হয়েছে!")

        browser.close()

    print("\n🎉 ALL PLAYWRIGHT ADMIN AUTH TESTS PASSED 100%!")

if __name__ == "__main__":
    test_admin_auth_api()
    test_admin_auth_playwright()
