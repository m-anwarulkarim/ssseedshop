import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COUPONS_FILE = os.path.join(BASE_DIR, "api", "database", "coupons.json")
FRONTEND_BASE = "http://localhost:8081"

def get_coupon_used_count(code):
    if not os.path.exists(COUPONS_FILE):
        return 0
    with open(COUPONS_FILE, "r", encoding="utf-8") as f:
        coupons = json.load(f)
    for c in coupons:
        if c.get("code") == code:
            return c.get("used_count", 0)
    return 0

def test_checkout_coupon():
    print("=================================================================")
    print("🎫 AGROSEED CHECKOUT COUPON PLAYWRIGHT TEST")
    print("=================================================================")

    initial_used = get_coupon_used_count("WELCOME50")
    print(f"Initial WELCOME50 used_count in JSON: {initial_used}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        # Step 1: Pre-populate cart with ৳600 items
        print("\n[১/৪] কার্টে পণ্য যুক্ত করে চেকআউট পেজে যাওয়া হচ্ছে...")
        cart_data = [{
            "id": "1",
            "name": "হাইব্রিড উন্নত মানের বীজ",
            "price": 300,
            "quantity": 2,
            "image": "https://placehold.co/100x100"
        }]
        page.goto(f"{FRONTEND_BASE}/", wait_until="networkidle")
        page.evaluate(f"localStorage.setItem('cart-items', JSON.stringify({json.dumps(cart_data)}))")
        page.goto(f"{FRONTEND_BASE}/checkout", wait_until="networkidle")
        time.sleep(1)

        # Step 2: Open coupon box and apply WELCOME50
        print("\n[২/৪] কুপন কোড WELCOME50 ইনপুট ও প্রয়োগ করা হচ্ছে...")
        toggle_btn = page.locator("#toggle-coupon-btn")
        if toggle_btn.is_visible():
            toggle_btn.click()
            time.sleep(0.5)

        coupon_input = page.locator("#coupon-code-input")
        assert coupon_input.is_visible(), "Coupon input should be visible!"
        coupon_input.fill("WELCOME50")
        time.sleep(0.3)

        page.locator("#apply-coupon-btn").click()
        time.sleep(1.5)

        # Verify discount badge
        applied_badge = page.get_by_text("WELCOME50", exact=True).first
        assert applied_badge.is_visible(), "Applied coupon badge WELCOME50 should appear!"
        print("✓ কুপন WELCOME50 সফলভাবে প্রয়োগ হয়েছে এবং ব্যাজ দৃশ্যমান!")

        # Step 3: Fill delivery information and submit
        print("\n[৩/৪] ডেলিভারি তথ্য পূরণ এবং অর্ডার কনফার্ম করা হচ্ছে...")
        name_input = page.locator("#name")
        if not name_input.input_value().strip():
            name_input.fill("কুপন টেস্ট কাস্টমার")

        phone_input = page.locator("#phone")
        if not phone_input.input_value().strip():
            phone_input.fill("01799881122")

        addr_input = page.locator("#address")
        if not addr_input.input_value().strip():
            addr_input.fill("মিরপুর ১০, ঢাকা")

        time.sleep(0.5)
        page.locator("button:has-text('অর্ডার কনফার্ম করুন')").click()

        # Wait for redirect
        print("✓ সাবমিট বাটনে ক্লিক করা হয়েছে, কনফার্মেশন পেজের জন্য অপেক্ষা...")
        page.wait_for_url("**/order-confirmed/**", timeout=15000)
        print(f"✓ অর্ডার সফল! বর্তমান URL: {page.url}")

        browser.close()

    # Step 4: Verify usage count incremented in JSON
    time.sleep(1)
    new_used = get_coupon_used_count("WELCOME50")
    print(f"\n[৪/৪] ডাটাবেস ভেরিফিকেশন: নতুন used_count = {new_used} (পূর্বের: {initial_used})")
    assert new_used == initial_used + 1, f"Expected used_count to increment by 1, but got {new_used}"
    print("✓ কুপন ব্যবহারের সংখ্যা ডাটাবেসে সফলভাবে ১ বৃদ্ধি পেয়েছে!")

    print("\n=================================================================")
    print("🎉 আলহামদুলিল্লাহ! কুপন সিস্টেমের Playwright টেস্ট শতভাগ সফল হয়েছে!")
    print("=================================================================")

if __name__ == "__main__":
    test_checkout_coupon()
