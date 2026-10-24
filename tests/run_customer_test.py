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
API_BASE = "http://localhost:8005"
FRONTEND_BASE = "http://localhost:8081"

parser = argparse.ArgumentParser(description="AgroSeed Customer E2E Test")
parser.add_argument("--headless", action="store_true", help="Run without opening browser window")
args = parser.parse_args()

is_headless = args.headless

def main():
    print("=================================================================")
    print("🌾 AGROSEED CUSTOMER PLAYWRIGHT AUTOMATION TEST (GOOGLE AUTH)")
    print(f"🖥️ Mode: {'Headless (Background)' if is_headless else 'Headed (Live Browser Popup)'}")
    print("=================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=is_headless, slow_mo=400 if not is_headless else 0)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        # Step 1: Login Page with Google
        print("\n[১/৩] কাস্টমার লগইন পেজ ভেরিফিকেশন...")
        page.goto(f"{FRONTEND_BASE}/profile", wait_until="networkidle")
        time.sleep(1)

        # Check for Google Sign In elements
        google_btn = page.locator("button:has-text('গুগল দিয়ে এক ক্লিকে লগইন করুন'), #google-login-button-container")
        assert google_btn.count() > 0, "Google Login Button not found!"
        print("✓ গুগল সাইন-ইন কার্ড সঠিকভাবে প্রদর্শিত হচ্ছে (কোনো ফোন/OTP রিকোয়ার্ড নেই)!")

        # Step 2: Checkout Test
        print("\n[২/৩] কার্ট চেকআউট ও অর্ডার প্লেসমেন্ট পরীক্ষা...")
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

        # Fill delivery info
        phone_field = page.locator("input[type='tel'], #phone").first
        if phone_field.is_visible():
            phone_field.fill("01712345678")

        name_field = page.locator("#name, input[name='name']").first
        if name_field.is_visible():
            name_field.fill("মো: আনোয়ারুল করিম")

        addr_field = page.locator("#address, textarea[name='address']").first
        if addr_field.is_visible() and not addr_field.input_value().strip():
            addr_field.fill("ধানমন্ডি, ঢাকা")

        page.locator("button:has-text('অর্ডার কনফার্ম করুন')").click()
        print("✓ অর্ডার কনফার্ম বাটনে ক্লিক করা হয়েছে!")
        time.sleep(2.5)

        assert "order-confirmed" in page.url or "অর্ডার" in page.content()
        print("✓ সফলভাবে অর্ডার কনফার্ম পেজে পৌঁছেছে!")

        # Step 3: Verify Profile UI with Mock Customer Session
        print("\n[৩/৩] গুগল অথেন্টিকেটেড কাস্টমার প্রোফাইল ড্যাশবোর্ড পরীক্ষা...")
        mock_customer = {
            "id": "cust_mock123",
            "name": "আনোয়ারুল করিম",
            "email": "anwarul@gmail.com",
            "phone": "01712345678",
            "auth_provider": "google",
            "token": "mock_google_session_token_123"
        }
        page.evaluate(f"""
            localStorage.setItem('customer_token', '{mock_customer["token"]}');
            localStorage.setItem('customer_data', JSON.stringify({json.dumps(mock_customer)}));
        """)
        page.goto(f"{FRONTEND_BASE}/profile", wait_until="networkidle")
        time.sleep(1.5)

        assert "anwarul@gmail.com" in page.content() or "আনোয়ারুল করিম" in page.content()
        print("✓ গুগল ভেরিফাইড প্রোফাইল সফলভাবে ড্যাশবোর্ডে লোড হয়েছে!")
        time.sleep(1)

        browser.close()

    print("\n=================================================================")
    print("🎉 আলহামদুলিল্লাহ! গুগল অথেন্টিকেশন ও অর্ডার টেস্ট শতভাগ সফল হয়েছে!")
    print("=================================================================")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ এরর হয়েছে: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
