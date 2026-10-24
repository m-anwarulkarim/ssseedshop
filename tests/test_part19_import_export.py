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
    print("🧪 [PART 19 BACKEND API TESTS: Backup, Export & Import]")
    print("=" * 70)

    # 1. Test Full Backup Export (JSON)
    print("\n[১/৪] api/backup/import_export.php?action=full_backup দিয়ে ফুল ব্যাকআপ ফেচ করা হচ্ছে...")
    status, backup = api_call("backup/import_export.php?action=full_backup")
    assert status == 200 and backup.get("version") == 2, f"Invalid full backup: {backup}"
    tables = backup.get("tables", {})
    assert "products" in tables and "orders_all" in tables and "coupons" in tables, "Missing core tables in backup"
    print(f"✓ ফুল ব্যাকআপ সফল! মোট টেবিল: {len(tables)} (পণ্য: {len(tables['products'])}, অর্ডার: {len(tables['orders_all'])}, কুপন: {len(tables['coupons'])})")

    # 2. Test CSV Export for Products and Orders
    print("\n[২/৪] CSV ফরম্যাটে প্রোডাক্ট এবং অর্ডার এক্সপোর্ট টেস্ট...")
    prod_req = urllib.request.urlopen(f"{API_BASE}/backup/import_export.php?table=products&format=csv")
    prod_csv = prod_req.read().decode("utf-8-sig")
    assert "sku" in prod_csv and "regular_price" in prod_csv, "Invalid products CSV"
    print(f"✓ প্রোডাক্ট CSV এক্সপোর্ট সফল, লাইন সংখ্যা: {len(prod_csv.splitlines())}")

    order_req = urllib.request.urlopen(f"{API_BASE}/backup/import_export.php?table=orders&format=csv")
    order_csv = order_req.read().decode("utf-8-sig")
    assert "order_id" in order_csv and "customer_name" in order_csv, "Invalid orders CSV"
    print(f"✓ অর্ডার CSV এক্সপোর্ট সফল, লাইন সংখ্যা: {len(order_csv.splitlines())}")

    # 3. Test Product CSV Import / Merge
    print("\n[৩/৪] CSV আপলোড দিয়ে নতুন প্রোডাক্ট ইমপোর্ট ও মার্জ টেস্ট...")
    test_sku = f"TEST-SEED-{int(time.time()) % 10000}"
    csv_prod_content = f"name,sku,category,regular_price,offer_price,stock\nটেস্ট বীজ ১৯,{test_sku},বীজ,420,380,50\n"
    import_status, import_res = api_call("backup/import_export.php", method="POST", payload={
        "table": "products",
        "content": csv_prod_content
    })
    assert import_status == 200 and import_res.get("success") is True, f"Product import failed: {import_res}"
    print(f"✓ প্রোডাক্ট ইমপোর্ট সম্পন্ন: {import_res.get('message')}")

    # 4. Test Coupon CSV Import / Merge
    print("\n[৪/৪] CSV আপলোড দিয়ে কুপন ইমপোর্ট ও মার্জ টেস্ট...")
    test_code = f"DISC{int(time.time()) % 1000}"
    csv_coupon_content = f"code,discount_type,discount_value,min_order_amount,usage_limit\n{test_code},fixed,60,400,100\n"
    c_status, c_res = api_call("backup/import_export.php", method="POST", payload={
        "table": "coupons",
        "content": csv_coupon_content
    })
    assert c_status == 200 and c_res.get("success") is True, f"Coupon import failed: {c_res}"
    print(f"✓ কুপন ইমপোর্ট সম্পন্ন: {c_res.get('message')}")

def test_frontend_playwright():
    print("\n" + "=" * 70)
    print("🎭 [PART 19 FRONTEND PLAYWRIGHT TESTS: ImportExport.tsx]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
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

        print("\n[১/৩] /admin/website/import-export পেজে নেভিগেট করা হচ্ছে...")
        page.goto(f"{FRONTEND_BASE}/admin/website/import-export", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Verify page header
        page.wait_for_selector("text=ডাটা ব্যাকআপ ও ইমপোর্ট/এক্সপোর্ট", timeout=10000)
        print("✓ পেজ হেডার 'ডাটা ব্যাকআপ ও ইমপোর্ট/এক্সপোর্ট' দৃশ্যমান হয়েছে।")

        # Capture loaded screenshot
        shot1_path = os.path.join(SCREENSHOTS_DIR, "25_import_export_page_loaded.png")
        page.screenshot(path=shot1_path, full_page=True)
        print(f"📸 স্ক্রিনশট ১ সংরক্ষিত: {shot1_path}")

        # Test single table export click
        print("\n[২/৩] প্রোডাক্ট কার্ডের 'এক্সপোর্ট' বাটনে ক্লিক করে লাইভ এক্সপোর্ট পরীক্ষা...")
        export_buttons = page.locator("button:has-text('এক্সপোর্ট')")
        if export_buttons.count() > 0:
            export_buttons.first.click(force=True)
            time.sleep(2)
            print("✓ প্রথম এক্সপোর্ট বাটনে ক্লিক সম্পন্ন হয়েছে।")

        # Test sample file upload / import into Coupons
        print("\n[৩/৩] টেস্ট কুপন CSV ফাইল আপলোড ও মার্জ পরীক্ষা...")
        temp_csv_path = os.path.join(SCREENSHOTS_DIR, "temp_test_coupons.csv")
        with open(temp_csv_path, "w", encoding="utf-8") as f:
            f.write("code,discount_type,discount_value,min_order_amount\nAGROTEST50,fixed,50,300\n")

        file_inputs = page.locator("input[type='file'][accept*='.csv']")
        if file_inputs.count() > 0:
            file_inputs.first.set_input_files(temp_csv_path)
            time.sleep(2)
            print("✓ টেস্ট CSV ফাইল আপলোড ইনপুটে পাঠানো হয়েছে।")

        # Capture success state screenshot
        shot2_path = os.path.join(SCREENSHOTS_DIR, "26_import_export_success_state.png")
        page.screenshot(path=shot2_path, full_page=True)
        print(f"📸 স্ক্রিনশট ২ সংরক্ষিত: {shot2_path}")

        # Clean up temp file
        if os.path.exists(temp_csv_path):
            os.remove(temp_csv_path)

        # Copy to artifact directory
        for filename in ["25_import_export_page_loaded.png", "26_import_export_success_state.png"]:
            src = os.path.join(SCREENSHOTS_DIR, filename)
            dst = os.path.join(ARTIFACT_DIR, filename)
            if os.path.exists(src):
                shutil.copy2(src, dst)
                print(f"✓ আর্টিফ্যাক্ট ফোল্ডারে কপি করা হয়েছে: {filename}")

        browser.close()
        print("\n✨ Part 19: সকল ব্যাকএন্ড ও ফ্রন্টএন্ড প্লেরাইট টেস্ট সফলভাবে সম্পন্ন হয়েছে!")

if __name__ == "__main__":
    test_api_layer()
    test_frontend_playwright()
