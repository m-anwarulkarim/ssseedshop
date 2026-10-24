import os
import sys
import json
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

API_BASE = "http://localhost:8005"

def api_call(endpoint, method="GET", payload=None, headers=None):
    url = f"{API_BASE}/{endpoint}"
    data = None
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(body)
            except:
                return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}

def main():
    print("=" * 75)
    print("🔍 [TEST PART 22: /admin/website/api পূর্ণাঙ্গ ভেরিফিকেশন ও টেস্ট]")
    print("=" * 75)

    all_passed = True

    # -------------------------------------------------------------
    # 1. Steadfast Courier API
    # -------------------------------------------------------------
    print("\n[১/৬] 🚚 Steadfast কুরিয়ার API টেস্ট...")
    
    # 1a. Update Keys
    status, res = api_call("settings/steadfast.php", method="POST", payload={
        "action": "update_keys",
        "api_key": "test_sf_api_key_12345",
        "secret_key": "test_sf_secret_key_67890"
    })
    print(f"  • Update Keys: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    # 1b. Update Webhook Token
    test_webhook_token = "tok_test_secure_hash_8989"
    status, res = api_call("settings/steadfast.php", method="POST", payload={
        "action": "update_webhook_token",
        "token": test_webhook_token
    })
    print(f"  • Update Webhook Token: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    # 1c. Courier Note
    test_note = "সাবধানে ডেলিভারি করুন - ভঙ্গুর বীজ প্যাকেট"
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "steadfast_courier_note",
        "value": test_note
    })
    print(f"  • Save Courier Note: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    # 1d. Verify in get.php
    status, res = api_call("settings/get.php?keys=steadfast_api_key,steadfast_secret_key,steadfast_webhook_token,steadfast_courier_note")
    saved_map = {item["key"]: item["value"] for item in res}
    print(f"  • Verify Saved Values: {saved_map}")
    assert saved_map.get("steadfast_api_key") == "test_sf_api_key_12345"
    assert saved_map.get("steadfast_webhook_token") == test_webhook_token
    assert saved_map.get("steadfast_courier_note") == test_note

    # 1e. Webhook Auth & Status Update
    print("  • Testing steadfast_webhook.php unauthorized attempt...")
    bad_status, bad_res = api_call("settings/steadfast_webhook.php", method="POST", payload={
        "consignment_id": "9999",
        "status": "delivered"
    }, headers={"Authorization": "Bearer wrong_token"})
    print(f"    -> Unauthorized Check: HTTP {bad_status} ({bad_res})")
    assert bad_status == 401

    print("  • Testing steadfast_webhook.php authorized callback...")
    good_status, good_res = api_call("settings/steadfast_webhook.php", method="POST", payload={
        "invoice": "6ac9ad285ae99",
        "status": "delivered"
    }, headers={"Authorization": f"Bearer {test_webhook_token}"})
    print(f"    -> Authorized Callback Check: HTTP {good_status} ({good_res})")
    assert good_status == 200 and good_res.get("status") == "success"
    print("  ✅ Steadfast Courier API সম্পূর্ণ সফল ও কার্যকর!")

    # -------------------------------------------------------------
    # 2. SMS API (E-COMAH)
    # -------------------------------------------------------------
    print("\n[২/৬] 📱 SMS API (E-COMAH) টেস্ট...")
    test_ecomah_key = "ec_live_api_key_demo_98765"
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "ecomah_api_key",
        "value": test_ecomah_key
    })
    print(f"  • Save E-COMAH API Key: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    status, res = api_call("settings/get.php?key=ecomah_api_key")
    print(f"  • Verify E-COMAH API Key: {res.get('value')}")
    assert res.get("value") == test_ecomah_key

    # Balance check endpoint (calls E-COMAH external API)
    status, res = api_call("settings/sms_api.php", method="POST", payload={
        "action": "check_balance"
    })
    print(f"  • Check Balance Handler: HTTP {status} -> {res}")
    assert status == 200

    # Send SMS validation test (requires number & message)
    status, res = api_call("settings/sms_api.php", method="POST", payload={
        "action": "send_sms",
        "number": "01933819799",
        "message": "AgroSeed টেস্ট এসএমএস"
    })
    print(f"  • Send SMS Handler: HTTP {status} -> {res}")
    assert status == 200
    print("  ✅ SMS API (E-COMAH) হ্যান্ডলার সম্পূর্ণ নিখুঁত!")

    # -------------------------------------------------------------
    # 3. Fraud Checker
    # -------------------------------------------------------------
    print("\n[৩/৬] 🛡️ ফ্রড চেকার (Fraud Checker) টেস্ট...")
    status, res = api_call("settings/fraud_checker.php", method="POST", payload={
        "action": "check",
        "phone": "01933819799"
    })
    print(f"  • Fraud Checker Handler: HTTP {status} -> {res}")
    assert status == 200
    print("  ✅ ফ্রড চেকার এন্ডপয়েন্ট সফল ও প্রস্তুত!")

    # -------------------------------------------------------------
    # 4. Meta Pixel & Conversions API
    # -------------------------------------------------------------
    print("\n[৪/৬] 📊 Meta Pixel ও Conversions API টেস্ট...")
    test_pixel_id = "987654321012345"
    test_capi_token = "EAABcd123456789xyzToken"
    
    # Save Pixel & CAPI
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "meta_pixel_id",
        "value": test_pixel_id
    })
    assert status == 200
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "meta_capi_token",
        "value": test_capi_token
    })
    assert status == 200

    # Verify Get
    status, res = api_call("settings/get.php?keys=meta_pixel_id,meta_capi_token")
    pixel_map = {item["key"]: item["value"] for item in res}
    print(f"  • Saved Pixel & CAPI: {pixel_map}")
    assert pixel_map.get("meta_pixel_id") == test_pixel_id
    assert pixel_map.get("meta_capi_token") == test_capi_token

    # Test Delete
    status, res = api_call("settings/delete.php", method="POST", payload={"key": "meta_pixel_id"})
    print(f"  • Delete Pixel ID: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    status, res = api_call("settings/get.php?key=meta_pixel_id")
    print(f"  • Verify Deleted: {res.get('value')}")
    assert res.get("value") is None
    print("  ✅ Meta Pixel & Conversions API সেভ এবং ডিলিট সম্পূর্ণ ত্রুটিমুক্ত!")

    # -------------------------------------------------------------
    # 5. SMS Notification Settings & Triggers
    # -------------------------------------------------------------
    print("\n[৫/৬] 🔔 SMS নোটিফিকেশন সেটিংস ও অর্ডার ট্রিগার টেস্ট...")
    # Update templates & toggles
    custom_pending_tpl = "অর্ডার #{order_id} প্রাপ্ত হয়েছে, মোট {total} টাকা। AgroSeed টিম।"
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "sms_msg_pending",
        "value": custom_pending_tpl
    })
    assert status == 200
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "sms_on_pending",
        "value": "true"
    })
    assert status == 200

    # Test order notify endpoint with this custom template
    status, res = api_call("orders/notify.php", method="POST", payload={
        "order_id": "6ac9ad285ae99",
        "new_status": "pending",
        "old_status": ""
    })
    print(f"  • Trigger Order Notify: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True
    print(f"    মেসেজ ফরম্যাটেড: {res.get('message_sent')}")
    print("  ✅ SMS নোটিফিকেশন সেটিংস ও ট্রিগার যথাযথভাবে কাজ করছে!")

    # -------------------------------------------------------------
    # 6. Customer OTP SMS Template
    # -------------------------------------------------------------
    print("\n[৬/৬] 🔑 কাস্টমার OTP SMS টেমপ্লেট টেস্ট...")
    custom_otp_tpl = "আপনার এগ্রো-সিড লগইন কোড হলো: {otp}। এটি গোপন রাখুন।"
    status, res = api_call("settings/update.php", method="POST", payload={
        "key": "customer_otp_sms_template",
        "value": custom_otp_tpl
    })
    assert status == 200

    status, res = api_call("settings/get.php?key=customer_otp_sms_template")
    print(f"  • Saved OTP Template: {res.get('value')}")
    assert res.get("value") == custom_otp_tpl
    print("  ✅ কাস্টমার SMS টেমপ্লেট নিখুঁতভাবে কানেক্টেড ও ফাংশনাল!")

    print("\n" + "=" * 75)
    print("🎉 /admin/website/api এর সব ৬টি সেকশন এবং ব্যাকএন্ড হ্যান্ডলার ১০০% সফল!")
    print("=" * 75)

if __name__ == "__main__":
    main()
