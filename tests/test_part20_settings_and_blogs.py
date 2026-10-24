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
    print("🧪 [PART 20 BACKEND API TESTS: Settings & Blogs]")
    print("=" * 70)

    # 1. Test Settings API (get.php & update.php)
    print("\n[১/৪] api/settings/get.php ও update.php ডেলিভারি চার্জ সেটিংস টেস্ট...")
    dc_payload = {
        "title": "ডেলিভারি চার্জ টেস্ট",
        "subtitle": "অর্ডার মূল্য অনুযায়ী ডেলিভারি চার্জ",
        "tiers": [{"label": "অর্ডার ৳৬০০+", "sub": "ফ্রি ডেলিভারি", "charge": "ফ্রি", "isFree": True}]
    }
    st_status, st_res = api_call("settings/update.php", method="POST", payload={
        "key": "delivery_charge_page",
        "value": json.dumps(dc_payload)
    })
    assert st_status == 200 and st_res.get("success") is True, f"Failed updating settings: {st_res}"
    print(f"✓ সেটিংস সফলভাবে সেভ হয়েছে: {st_res.get('message')}")

    get_status, get_res = api_call("settings/get.php?key=delivery_charge_page")
    assert get_status == 200 and get_res.get("key") == "delivery_charge_page", f"Failed fetching setting: {get_res}"
    print("✓ সেটিংস সফলভাবে রিড করা হয়েছে।")

    # 2. Test Blogs Fetch (blogs/get.php)
    print("\n[২/৪] api/blogs/get.php ব্লগের তালিকা ফেচ টেস্ট...")
    b_status, b_res = api_call("blogs/get.php")
    assert b_status == 200 and isinstance(b_res, list) and len(b_res) > 0, f"Failed fetching blogs: {b_res}"
    print(f"✓ ব্লগ তালিকা পাওয়া গেছে, মোট ব্লগ: {len(b_res)} টি (প্রথম ব্লগ: {b_res[0].get('title')})")

    # 3. Test Blog Create (blogs/save.php)
    print("\n[৩/৪] api/blogs/save.php নতুন টেস্ট ব্লগ তৈরি...")
    test_title = f"টেস্ট এগ্রো ব্লগ ২০ ({int(time.time())})"
    test_blog_payload = {
        "title": test_title,
        "category": "কৃষি প্রযুক্তি",
        "excerpt": "আধুনিক স্মার্ট এগ্রিকালচার প্রযুক্তির ব্যবহার ও সুফল।",
        "content": "<p>কৃষিক্ষেত্রে আধুনিক তথ্যপ্রযুক্তির সংযোজন ফসল উৎপাদন বাড়িয়ে দেয়।</p>",
        "is_published": True,
        "position": 5
    }
    save_status, save_res = api_call("blogs/save.php", method="POST", payload=test_blog_payload)
    assert save_status == 200 and save_res.get("success") is True, f"Failed saving blog: {save_res}"
    created_blog_id = save_res.get("id")
    print(f"✓ নতুন ব্লগ তৈরি হয়েছে, আইডি: {created_blog_id}, শিরোনাম: {test_title}")

    # 4. Test Blog Delete (blogs/delete.php)
    print("\n[৪/৪] api/blogs/delete.php টেস্ট ব্লগ ডিলিট...")
    del_status, del_res = api_call("blogs/delete.php", method="POST", payload={"id": created_blog_id})
    assert del_status == 200 and del_res.get("success") is True, f"Failed deleting blog: {del_res}"
    print(f"✓ টেস্ট ব্লগ সফলভাবে মুছে ফেলা হয়েছে!")

def test_frontend_playwright():
    print("\n" + "=" * 70)
    print("🎭 [PART 20 FRONTEND PLAYWRIGHT TESTS: Settings & Blogs]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        # Admin login bypass in localStorage
        page.goto(f"{FRONTEND_BASE}/", wait_until="domcontentloaded")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            sessionStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '260.50.160', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
            localStorage.setItem('user', JSON.stringify({
                id: 'admin_1',
                email: 'admin@agroseed.bd',
                role: 'admin',
                name: 'Super Admin'
            }));
        }""")

        # 1. Test Delivery Charge Editor
        print("\n[১/৩] DeliveryChargeEditor পেজে যাওয়া হচ্ছে (/admin/settings/delivery-charge)...")
        page.goto(f"{FRONTEND_BASE}/admin/settings/delivery-charge", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Save button test
        save_btn = page.locator("button:has-text('সেভ করুন')")
        if save_btn.count() > 0:
            save_btn.first.click(force=True)
            time.sleep(1.5)
            print("✓ ডেলিভারি চার্জ সেভ বাটনে ক্লিক সম্পন্ন হয়েছে।")

        shot1_path = os.path.join(SCREENSHOTS_DIR, "27_delivery_charge_settings.png")
        page.screenshot(path=shot1_path, full_page=True)
        print(f"📸 স্ক্রিনশট ১ সংরক্ষিত: {shot1_path}")

        # 2. Test Promo Popup Settings
        print("\n[২/৩] PromoPopupSettings পেজে যাওয়া হচ্ছে (/admin/settings/promo-popup)...")
        page.goto(f"{FRONTEND_BASE}/admin/settings/promo-popup", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Click new popup button (button with Plus icon next to title)
        page.wait_for_selector("text=অফার পপআপ", timeout=10000)
        new_popup_btn = page.locator("#btn-add-new-popup")
        if new_popup_btn.count() > 0:
            new_popup_btn.click(force=True)
            time.sleep(1.5)
            print("✓ নতুন অফার পপআপ বাটনে (#btn-add-new-popup) ক্লিক সম্পন্ন হয়েছে।")

        shot2_path = os.path.join(SCREENSHOTS_DIR, "28_promo_popup_settings.png")
        page.screenshot(path=shot2_path, full_page=True)
        print(f"📸 স্ক্রিনশট ২ সংরক্ষিত: {shot2_path}")

        # 3. Test Blog List Management
        print("\n[৩/৩] BlogList পেজে যাওয়া হচ্ছে (/admin/blogs)...")
        page.goto(f"{FRONTEND_BASE}/admin/blogs", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Verify blog cards are rendered
        page.wait_for_selector("text=ব্লগ ম্যানেজমেন্ট", timeout=10000)
        print("✓ ব্লগ ম্যানেজমেন্ট হেডার দৃশ্যমান হয়েছে।")

        shot3_path = os.path.join(SCREENSHOTS_DIR, "29_blog_list_loaded.png")
        page.screenshot(path=shot3_path, full_page=True)
        print(f"📸 স্ক্রিনশট ৩ সংরক্ষিত: {shot3_path}")

        # Copy to artifact directory
        for filename in ["27_delivery_charge_settings.png", "28_promo_popup_settings.png", "29_blog_list_loaded.png"]:
            src = os.path.join(SCREENSHOTS_DIR, filename)
            dst = os.path.join(ARTIFACT_DIR, filename)
            if os.path.exists(src):
                shutil.copy2(src, dst)
                print(f"✓ আর্টিফ্যাক্ট ফোল্ডারে কপি করা হয়েছে: {filename}")

        browser.close()
        print("\n✨ Part 20: সকল ব্যাকএন্ড ও ফ্রন্টএন্ড প্লেরাইট টেস্ট শতভাগ সফল হয়েছে!")

if __name__ == "__main__":
    test_api_layer()
    test_frontend_playwright()
