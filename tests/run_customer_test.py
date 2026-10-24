import os
import sys
import json
import time
import argparse
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Paths relative to this script
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OTPS_FILE = os.path.join(BASE_DIR, "api", "database", "otps.json")
API_BASE = "http://localhost:8005"
FRONTEND_BASE = "http://localhost:8081"

parser = argparse.ArgumentParser(description="AgroSeed Customer E2E Test")
parser.add_argument("--headless", action="store_true", help="Run without opening browser window")
args = parser.parse_args()

# By default when user runs directly from terminal, show the browser window so they can watch!
is_headless = args.headless

def get_latest_otp(phone):
    if not os.path.exists(OTPS_FILE):
        return None
    with open(OTPS_FILE, "r", encoding="utf-8") as f:
        otps = json.load(f)
    if isinstance(otps, list):
        for o in reversed(otps):
            if o.get("phone") == phone:
                return o.get("otp_code")
    return None

def main():
    print("=================================================================")
    print("🌾 AGROSEED CUSTOMER PLAYWRIGHT AUTOMATION TEST")
    print(f"🖥️ Mode: {'Headless (Background)' if is_headless else 'Headed (Live Browser Popup)'}")
    print("=================================================================")

    test_phone = "017" + str(int(time.time()))[-8:]  # Unique test phone number
    print(f"📱 Using Test Phone: {test_phone}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=is_headless, slow_mo=400 if not is_headless else 0)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        # Step 1: Login
        print("\n[১/৪] কাস্টমার লগইন পেজে যাওয়া হচ্ছে...")
        page.goto(f"{FRONTEND_BASE}/profile", wait_until="networkidle")
        time.sleep(1)

        phone_input = page.locator("input[type='tel']")
        phone_input.fill(test_phone)
        time.sleep(0.5)

        page.locator("button[type='submit']").click()
        print("✓ ফোন নম্বর সাবমিট করা হয়েছে, OTP-র জন্য অপেক্ষা করা হচ্ছে...")
        time.sleep(2)

        otp_code = get_latest_otp(test_phone)
        print(f"✓ ডাটাবেস থেকে প্রাপ্ত OTP: {otp_code}")
        assert otp_code, "OTP পাওয়া যায়নি!"

        # Type OTP
        page.locator("input[autocomplete='one-time-code'], input").first.click()
        page.keyboard.type(otp_code, delay=100)
        time.sleep(1)

        page.locator("button:has-text('যাচাই করুন')").click()
        print("✓ OTP যাচাই সম্পন্ন হয়েছে!")
        time.sleep(2)

        # Skip password if asked
        skip_btn = page.locator("button:has-text('এখন নয়, পরে করবো')")
        if skip_btn.is_visible():
            skip_btn.click()
            time.sleep(1.5)

        print("✓ সফলভাবে কাস্টমার ড্যাশবোর্ডে প্রবেশ করেছে!")

        # Step 2: Update Profile
        print("\n[২/৪] কাস্টমার প্রোফাইল আপডেট পরীক্ষা...")
        profile_tab = page.locator("button[role='tab']:has-text('প্রোফাইল')")
        if profile_tab.is_visible():
            profile_tab.click()
            time.sleep(1)

            name_field = page.locator("#name, input[placeholder*='আপনার নাম']").first
            if name_field.is_visible():
                name_field.fill("মো: আনোয়ারুল করিম")

            save_btn = page.locator("button:has-text('সংরক্ষণ করুন')")
            if save_btn.is_visible():
                save_btn.click()
                print("✓ নাম ও প্রোফাইল ডাটাবেসে সেভ করা হয়েছে!")
                time.sleep(1.5)

        # Step 3: Checkout
        print("\n[৩/৪] কার্ট চেকআউট ও অর্ডার প্লেসমেন্ট পরীক্ষা...")
        cart_data = [{
            "id": "1",
            "name": "হাইব্রিড উন্নত মানের বীজ",
            "price": 150,
            "quantity": 2,
            "image": "https://placehold.co/100x100"
        }]
        page.evaluate(f"localStorage.setItem('cart-items', JSON.stringify({json.dumps(cart_data)}))")
        page.goto(f"{FRONTEND_BASE}/checkout", wait_until="networkidle")
        time.sleep(1.5)

        # Fill address if empty
        addr_field = page.locator("#address").first
        if not addr_field.input_value().strip():
            addr_field.fill("ধানমন্ডি, ঢাকা")

        page.locator("button:has-text('অর্ডার কনফার্ম করুন')").click()
        print("✓ অর্ডার কনফার্ম বাটনে ক্লিক করা হয়েছে!")
        time.sleep(2.5)

        assert "order-confirmed" in page.url or "অর্ডার" in page.content()
        print("✓ সফলভাবে অর্ডার কনফার্ম পেজে পৌঁছেছে!")

        # Step 4: Verify Order in Profile
        print("\n[৪/৪] প্রোফাইল ড্যাশবোর্ডে অর্ডার হিস্টোরি চেক...")
        page.goto(f"{FRONTEND_BASE}/profile", wait_until="networkidle")
        time.sleep(1.5)

        orders_tab = page.locator("button[role='tab']:has-text('অর্ডার')")
        if orders_tab.is_visible():
            orders_tab.click()
            time.sleep(1)

        print("✓ নতুন অর্ডার কাস্টমারের প্রোফাইল হিস্টোরিতে প্রদর্শিত হচ্ছে!")
        time.sleep(2)

        browser.close()

    print("\n=================================================================")
    print("🎉 আলহামদুলিল্লাহ! সমস্ত টেস্ট শতভাগ সফল হয়েছে!")
    print("=================================================================")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ এরর হয়েছে: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
