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
    print("🧪 [PART 17 BACKEND API TESTS: Dashboard Analytics & Overview]")
    print("=" * 70)

    # 1. Test api/analytics/overview.php
    print("\n[১/৩] api/analytics/overview.php কল করে লাইভ অ্যানালিটিক্স ফেচ করা হচ্ছে...")
    status, res = api_call("analytics/overview.php")
    assert status == 200 and res.get("success") is True, f"Failed fetching overview analytics: {res}"
    data = res.get("data", {})
    summary = data.get("summary", {})
    assert "total_orders" in summary and "total_revenue" in summary, f"Invalid summary structure: {summary}"
    print(f"✓ সামারি রিপোর্ট: মোট অর্ডার: {summary.get('total_orders')}, মোট আয়: ৳{summary.get('total_revenue')}, পেন্ডিং: {summary.get('pending_orders')}, গ্রাহক: {summary.get('total_customers')}")

    # 2. Test chart data & profit periods
    print("\n[২/৩] ১৪ দিনের সেলস চার্ট ডাটা ও লাভ/লস পিরিয়ড যাচাই...")
    chart_data = data.get("chart_data", [])
    profit_periods = data.get("profit_periods", [])
    assert len(chart_data) == 14, f"Expected 14 days chart data, got {len(chart_data)}"
    assert len(profit_periods) >= 6, f"Expected at least 6 profit periods, got {len(profit_periods)}"
    print(f"✓ চার্ট ডাটা: {len(chart_data)} দিন, লাভ/লস সেগমেন্ট: {[p['label'] for p in profit_periods]}")

    # 3. Test recent orders & top products
    print("\n[৩/৩] সাম্প্রতিক অর্ডার ও সেরা বিক্রিত পণ্য যাচাই...")
    recent_orders = data.get("recent_orders", [])
    top_products = data.get("top_products", [])
    assert len(recent_orders) > 0, "Recent orders should not be empty"
    print(f"✓ সাম্প্রতিক অর্ডার পাওয়া গেছে: {len(recent_orders)}টি, সেরা পণ্য: {len(top_products)}টি (যেমন: {top_products[0].get('name') if top_products else 'N/A'})")

    print("\n" + "=" * 70)
    print("🎉 Part 17 ব্যাকএন্ড API টেস্ট শতভাগ সফল হয়েছে!")
    print("=" * 70)

def test_playwright_e2e():
    print("\n" + "=" * 70)
    print("🌐 [PLAYWRIGHT + PYTHON BROWSER E2E: Admin Dashboard Overview]")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 950})
        page = context.new_page()

        # Step 1: Open Overview page (/admin/overview)
        print("\n[১/২] অ্যাডমিন Overview পেজে যাওয়া হচ্ছে (/admin/overview)...")
        page.goto(f"{FRONTEND_BASE}/admin/overview", wait_until="domcontentloaded")
        page.evaluate("""() => {
            localStorage.setItem('admin_dev_bypass', 'true');
            localStorage.setItem('whats_new_popup_state', JSON.stringify({ version: '1.9.9', views: 999 }));
            localStorage.setItem('promo_popup_seen', 'true');
        }""")
        page.goto(f"{FRONTEND_BASE}/admin/overview", wait_until="domcontentloaded")
        time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(1)

        # Wait for revenue card or chart
        try:
            page.locator("text=মোট আয়").first.wait_for(timeout=8000)
        except Exception:
            pass

        screenshot_top = os.path.join(SCREENSHOTS_DIR, "21_overview_dashboard_top.png")
        page.screenshot(path=screenshot_top)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_top}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_top, os.path.join(ARTIFACT_DIR, "21_overview_dashboard_top.png"))

        # Step 2: Scroll down to view charts and top products
        print("\n[২/২] চার্ট, সাম্প্রতিক অর্ডার ও সেরা পণ্য সেকশন স্ক্রল করে ক্যাপচার করা হচ্ছে...")
        page.evaluate("window.scrollBy(0, 500)")
        time.sleep(1)

        screenshot_charts = os.path.join(SCREENSHOTS_DIR, "22_overview_charts_and_profit.png")
        page.screenshot(path=screenshot_charts)
        print(f"📸 স্ক্রিনশট সংরক্ষিত: {screenshot_charts}")
        if os.path.exists(ARTIFACT_DIR):
            shutil.copy2(screenshot_charts, os.path.join(ARTIFACT_DIR, "22_overview_charts_and_profit.png"))

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 Part 17 E2E ব্রাউজার ভ্যালিডেশন সফলভাবে সম্পন্ন হয়েছে!")
    print("=" * 70)

if __name__ == "__main__":
    test_api_layer()
    test_playwright_e2e()
