import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

API_URL = "http://localhost:8005"

def send_request(endpoint, method="GET", data=None):
    url = f"{API_URL}/{endpoint}"
    req_data = None
    headers = {"Content-Type": "application/json"}
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}

def run_tests():
    print("========== TEST 1: List all coupons ==========")
    status, res = send_request("orders/coupons.php")
    print(f"List coupons status: {status}, count: {res.get('count')}")
    assert status == 200
    assert res.get("success") is True
    assert res.get("count") >= 3

    print("\n========== TEST 2: Validate invalid coupon ==========")
    status, res = send_request("orders/coupons.php?code=FAKECOUPON123&amount=500")
    print(f"Invalid coupon status: {status}, response: {res}")
    assert status == 400
    assert res.get("success") is False

    print("\n========== TEST 3: Minimum order amount check ==========")
    status, res = send_request("orders/coupons.php?code=WELCOME50&amount=200")
    print(f"Min order check status: {status}, response: {res}")
    assert status == 400
    assert "সর্বনিম্ন অর্ডার" in res.get("message", "") or "Minimum order" in res.get("message", "")

    print("\n========== TEST 4: Valid fixed coupon (WELCOME50) ==========")
    status, res = send_request("orders/coupons.php?code=welcome50&amount=400")
    print(f"WELCOME50 valid status: {status}, data: {res.get('data')}")
    assert status == 200
    assert res.get("success") is True
    data = res.get("data", {})
    assert data.get("discount_amount") == 50
    assert data.get("final_amount") == 350
    coupon_id = data.get("id")

    print("\n========== TEST 5: Valid percentage coupon (AGRO10) ==========")
    status, res = send_request("orders/coupons.php?code=AGRO10&amount=1000")
    print(f"AGRO10 valid status: {status}, data: {res.get('data')}")
    assert status == 200
    assert res.get("success") is True
    data10 = res.get("data", {})
    assert data10.get("discount_amount") == 100  # 10% of 1000 = 100
    assert data10.get("final_amount") == 900

    print("\n========== TEST 6: POST Increment Usage ==========")
    usage_payload = {
        "action": "increment_usage",
        "coupon_id": coupon_id,
        "discount_amount": 50
    }
    status, res = send_request("orders/coupons.php", method="POST", data=usage_payload)
    print(f"Increment usage 1 status: {status}, response: {res}")
    assert status == 200
    assert res.get("success") is True
    coupon_data = res.get("data", {})
    assert coupon_data.get("used_count") >= 1
    assert coupon_data.get("total_discount_given") >= 50

    # Increment again
    status, res = send_request("orders/coupons.php", method="POST", data=usage_payload)
    print(f"Increment usage 2 status: {status}, response: {res}")
    assert status == 200
    coupon_data = res.get("data", {})
    assert coupon_data.get("used_count") >= 2

    print("\nALL COUPONS API TESTS PASSED SUCCESSFULLY! 100% OK!")

if __name__ == "__main__":
    run_tests()
