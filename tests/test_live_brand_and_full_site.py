import os
import sys
import json
import time
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

FRONTEND_BASE = "http://localhost:8081"

def save_screenshot(page, filename):
    local_path = os.path.join(SCREENSHOTS_DIR, filename)
    artifact_path = os.path.join(ARTIFACT_DIR, filename)
    page.screenshot(path=local_path, full_page=False)
    if os.path.exists(ARTIFACT_DIR):
        shutil.copy2(local_path, artifact_path)
    print(f"📸 Screenshot saved: {filename}")

def run_live_audit():
    print("🚀 [STARTING LIVE FULL WEBSITE AUDIT & BRANDING VERIFICATION]")
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # Set localStorage bypass flags
        page.goto(FRONTEND_BASE, wait_until="domcontentloaded")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")

        # 1. Home Page Audit
        try:
            print("\n1️⃣ Checking Home Page (https://agroseed.bd/ live equivalent)...")
            page.goto(FRONTEND_BASE, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2000)
            title = page.title()
            print(f"   Page Title: {title}")
            assert "AgroSeed" in title, f"Title does not contain AgroSeed: {title}"
            save_screenshot(page, "30_home_page_live.png")
            
            body_text = page.inner_text("body")
            has_ab_seed = "ab seed" in body_text.lower() or "abseed" in body_text.lower()
            print(f"   Legacy branding ('ab seed') present in DOM: {has_ab_seed}")
            assert not has_ab_seed, "Old branding 'ab seed' found on Home Page!"
            results.append({"page": "Home Page", "status": "PASS", "title": title})
        except Exception as e:
            print(f"❌ Home Page Error: {e}")
            results.append({"page": "Home Page", "status": "FAIL", "error": str(e)})

        # 2. Products Catalog Audit
        try:
            print("\n2️⃣ Checking Products Catalog Page...")
            page.goto(f"{FRONTEND_BASE}/products", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2000)
            save_screenshot(page, "31_products_catalog_live.png")
            body_text = page.inner_text("body")
            has_ab_seed = "ab seed" in body_text.lower()
            assert not has_ab_seed, "Old branding found on Products page"
            results.append({"page": "Products Catalog", "status": "PASS"})
        except Exception as e:
            print(f"❌ Products Catalog Error: {e}")
            results.append({"page": "Products Catalog", "status": "FAIL", "error": str(e)})

        # 3. Admin Overview Dashboard
        try:
            print("\n3️⃣ Checking Admin Dashboard Overview...")
            page.goto(f"{FRONTEND_BASE}/admin/overview", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2500)
            save_screenshot(page, "32_admin_dashboard_live.png")
            body_text = page.inner_text("body")
            assert "মোট" in body_text or "অর্ডার" in body_text or "ড্যাশবোর্ড" in body_text
            results.append({"page": "Admin Dashboard", "status": "PASS"})
        except Exception as e:
            print(f"❌ Admin Dashboard Error: {e}")
            results.append({"page": "Admin Dashboard", "status": "FAIL", "error": str(e)})

        # 4. Admin Orders
        try:
            print("\n4️⃣ Checking Admin Orders Page...")
            page.goto(f"{FRONTEND_BASE}/admin/orders/web", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2500)
            save_screenshot(page, "33_admin_orders_live.png")
            body_text = page.inner_text("body")
            assert "অর্ডার" in body_text
            results.append({"page": "Admin Orders", "status": "PASS"})
        except Exception as e:
            print(f"❌ Admin Orders Error: {e}")
            results.append({"page": "Admin Orders", "status": "FAIL", "error": str(e)})

        # 5. Admin Products List
        try:
            print("\n5️⃣ Checking Admin Products Management...")
            page.goto(f"{FRONTEND_BASE}/admin/products", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2500)
            save_screenshot(page, "34_admin_products_live.png")
            results.append({"page": "Admin Products", "status": "PASS"})
        except Exception as e:
            print(f"❌ Admin Products Error: {e}")
            results.append({"page": "Admin Products", "status": "FAIL", "error": str(e)})

        # 6. Admin Expense Tracker (Where AB seed previously occurred)
        try:
            print("\n6️⃣ Checking Admin Expense Tracker...")
            page.goto(f"{FRONTEND_BASE}/admin/expenses", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2000)
            save_screenshot(page, "35_admin_expenses_live.png")
            body_text = page.inner_text("body")
            has_ab_seed = "ab seed" in body_text.lower()
            print(f"   Legacy 'ab seed' found in Expense Tracker: {has_ab_seed}")
            assert not has_ab_seed, "Old branding 'ab seed' found in Expense Tracker!"
            results.append({"page": "Admin Expenses", "status": "PASS"})
        except Exception as e:
            print(f"❌ Admin Expenses Error: {e}")
            results.append({"page": "Admin Expenses", "status": "FAIL", "error": str(e)})

        # 7. Footer & Brand check
        try:
            print("\n7️⃣ Checking Footer Branding...")
            page.goto(FRONTEND_BASE, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(1000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1500)
            save_screenshot(page, "36_home_footer_live.png")
            footer_text = page.inner_text("footer")
            assert "AgroSeed" in footer_text or "agroseed" in footer_text.lower(), "Footer missing AgroSeed"
            assert "ab seed" not in footer_text.lower(), "Footer contains ab seed"
            results.append({"page": "Footer Branding", "status": "PASS"})
        except Exception as e:
            print(f"❌ Footer Branding Error: {e}")
            results.append({"page": "Footer Branding", "status": "FAIL", "error": str(e)})

        browser.close()

    print("\n===============================")
    print("📊 [LIVE AUDIT SUMMARY RESULT]")
    print("===============================")
    all_pass = True
    for r in results:
        status_icon = "✅" if r["status"] == "PASS" else "❌"
        print(f"{status_icon} {r['page']}: {r['status']}")
        if r["status"] != "PASS":
            all_pass = False

    if all_pass:
        print("\n🎉 ALL LIVE AUDIT TESTS PASSED WITH 100% SUCCESS!")
    else:
        print("\n⚠️ SOME TESTS FAILED!")

if __name__ == "__main__":
    run_live_audit()
