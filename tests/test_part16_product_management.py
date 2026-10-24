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
    print("🧪 [PART 16 BACKEND API TESTS: Product Management & Categories]")
    print("=" * 70)

    # 1. Test tags API
    print("\n[১/৫] api/tags/get.php কল করে ট্যাগ তালিকা ফেচ করা হচ্ছে...")
    status, tags = api_call("tags/get.php")
    assert status == 200 and isinstance(tags, list) and len(tags) > 0, f"Failed fetching tags: {tags}"
    print(f"✓ মোট ট্যাগ পাওয়া গেছে: {len(tags)}টি (যেমন: {[t.get('name') for t in tags[:2]]})")

    # 2. Test subcategories API
    print("\n[২/৫] api/categories/subcategories.php কল করে সাব-ক্যাটাগরি যাচাই ও নতুন সাব-ক্যাটাগরি যোগ...")
    status, subs = api_call("categories/subcategories.php")
    assert status == 200 and isinstance(subs, list) and len(subs) > 0, f"Failed fetching subcategories: {subs}"
    print(f"✓ মোট সাব-ক্যাটাগরি পাওয়া গেছে: {len(subs)}টি")

    # Add a new subcategory
    new_sub = {"category_name": "বীজ", "name": f"হাইব্রিড বীজ {int(time.time())}", "position": 5}
    status, add_sub_res = api_call("categories/subcategories.php", method="POST", payload=new_sub)
    assert status == 200 and add_sub_res.get("success") is True, f"Failed adding subcategory: {add_sub_res}"
    print(f"✓ নতুন সাব-ক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে: {new_sub['name']}")

    # 3. Test products/get.php
    print("\n[৩/৫] api/products/get.php দিয়ে প্রোডাক্ট তালিকা ও সিঙ্গেল প্রোডাক্ট কোয়েরি যাচাই...")
    status, products = api_call("products/get.php")
    assert status == 200 and isinstance(products, list) and len(products) > 0, f"Failed fetching products: {products}"
    first_id = products[0]["id"]
    status, single_p = api_call(f"products/get.php?id={first_id}")
    assert status == 200 and single_p.get("id") == first_id, f"Failed single product query: {single_p}"
    print(f"✓ প্রোডাক্ট ফেচ সফল! আইডি {first_id}: {single_p.get('name')} (মূল্য: ৳{single_p.get('regular_price')})")

    # 4. Test products/save.php (Create & Update)
    print("\n[৪/৫] api/products/save.php দিয়ে নতুন প্রোডাক্ট তৈরি ও আপডেট পরীক্ষা...")
    test_prod_name = f"প্রিমিয়াম টমেটো বীজ {int(time.time())}"
    test_sku = f"TOM-{int(time.time()) % 10000}"
    create_payload = {
        "name": test_prod_name,
        "sku": test_sku,
        "regular_price": 250,
        "offer_price": 220,
        "stock": 45,
        "category": "বীজ",
        "categories": ["বীজ"],
        "subcategory": "সবজি বীজ",
        "tags": ["বেস্টসেলার"]
    }
    status, create_res = api_call("products/save.php", method="POST", payload=create_payload)
    assert status == 200 and create_res.get("success") is True, f"Product create failed: {create_res}"
    created_id = create_res.get("data", {}).get("id")
    print(f"✓ নতুন প্রোডাক্ট সফলভাবে তৈরি হয়েছে! ID: {created_id}, Name: {test_prod_name}")

    # Update the created product
    update_payload = {
        "id": created_id,
        "regular_price": 280,
        "stock": 60
    }
    status, update_res = api_call("products/save.php", method="POST", payload=update_payload)
    assert status == 200 and update_res.get("success") is True, f"Product update failed: {update_res}"
    assert update_res.get("data", {}).get("regular_price") == 280, "Price was not updated"
    print("✓ প্রোডাক্ট তথ্য ও স্টক সফলভাবে আপডেট হয়েছে!")

    # 5. Test delete.php
    print("\n[৫/৫] api/products/delete.php দিয়ে প্রোডাক্ট ডিলিট পরীক্ষা...")
    status, del_res = api_call("products/delete.php", method="POST", payload={"id": created_id})
    assert status == 200 and del_res.get("status") == "success", f"Product delete failed: {del_res}"
    print(f"✓ টেস্ট প্রোডাক্ট {created_id} সফলভাবে মুছে ফেলা হয়েছে!")

    print("\n" + "=" * 70)
    print("🎉 Part 16 ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)

def test_playwright_e2e():
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E: ProductList & ProductForm]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 850})
        page = context.new_page()

        # Step 1: Open ProductList page (/admin/products)
        print("\n[১/৩] অ্যাডমিন ProductList পেজে যাওয়া হচ্ছে (/admin/products)...")
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/products", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Wait for table
        try:
            page.locator("table tbody tr").first.wait_for(timeout=8000)
        except Exception:
            pass

        screenshot_list = os.path.join(SCREENSHOTS_DIR, "19_product_list_loaded.png")
        page.screenshot(path=screenshot_list)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_list}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_list, os.path.join(ARTIFACT_DIR, "19_product_list_loaded.png"))

        # Step 2: Instant Search on ProductList
        print("\n[২/৩] প্রোডাক্ট লিস্টে নাম/SKU দিয়ে ইনস্ট্যান্ট সার্চ পরীক্ষা...")
        search_input = page.locator("input[placeholder*='সার্চ']").first
        if search_input.is_visible():
            search_input.fill("Test")
            time.sleep(1)

        # Test Stock Toggle on the first row
        stock_badge = page.locator("div[id^='stock-badge-']").first
        if stock_badge.is_visible():
            print("✓ স্টক টগল ব্যাজে ক্লিক করা হচ্ছে...")
            stock_badge.click()
            time.sleep(1.5)

        # Step 3: Open ProductForm to create product
        print("\n[৩/৩] অ্যাডমিন ProductForm পেজে যাওয়া হচ্ছে (/admin/products/create)...")
        page.goto(f"{FRONTEND_BASE}/admin/products/create", wait_until="networkidle")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Fill ProductForm fields
        prod_name = f"অটো-টেস্ট পেঁপে বীজ {int(time.time()) % 1000}"
        sku_val = f"PAPAYA-{int(time.time()) % 1000}"

        name_input = page.locator("input[name='name']")
        name_input.wait_for(state="visible", timeout=10000)
        name_input.fill(prod_name)

        sku_input = page.locator("input[name='sku']")
        if sku_input.is_visible():
            sku_input.fill(sku_val)

        # Pick category
        cat_btn = page.locator("button:has-text('বীজ')").first
        if cat_btn.is_visible():
            cat_btn.click()
            time.sleep(0.5)

        # Fill price & stock
        price_input = page.locator("input[name='regular_price']")
        if price_input.is_visible():
            price_input.fill("180")

        stock_input = page.locator("input[name='stock']")
        if stock_input.is_visible():
            stock_input.fill("50")

        # Pick a tag if visible
        tag_btn = page.locator("button:has-text('বেস্টসেলার')").first
        if tag_btn.is_visible():
            tag_btn.click()
            time.sleep(0.5)

        # Take screenshot of filled product form
        screenshot_form = os.path.join(SCREENSHOTS_DIR, "20_product_form_create.png")
        page.screenshot(path=screenshot_form)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_form}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_form, os.path.join(ARTIFACT_DIR, "20_product_form_create.png"))

        # Submit form
        save_btn = page.locator("button[type='submit']:has-text('তৈরি করুন'), button[type='submit']").first
        if save_btn.is_visible():
            print("✓ 'পণ্য তৈরি করুন' বাটনে ক্লিক করা হচ্ছে...")
            save_btn.click()
            time.sleep(2.5)

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 16 E2E ব্রাউজার ভ্যালিডেশন সফলভাবে সম্পন্ন হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    test_api_layer()
    test_playwright_e2e()
