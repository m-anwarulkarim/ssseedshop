import urllib.request
import urllib.parse
import json
import sys

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
    print("========== TEST 1: Clear and GET incomplete orders ==========")
    status, res = send_request("orders/incomplete.php")
    print(f"GET initial status: {status}, count: {res.get('count')}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("success") is True

    test_phone = "01788112233"
    visitor_id = "vis_test_abc_123"

    print("\n========== TEST 2: POST first incomplete order ==========")
    order_data = {
        "customer_name": "Test Incomplete User",
        "phone": test_phone,
        "address": "Banani, Dhaka",
        "visitor_id": visitor_id,
        "reason": "checkout_abandoned",
        "cart_snapshot": [
            {"id": "p1", "name": "Tomato Hybrid", "price": 120, "quantity": 2}
        ]
    }
    status, res = send_request("orders/incomplete.php", method="POST", data=order_data)
    print(f"POST status: {status}, response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("success") is True
    saved_item = res.get("data", {})
    assert saved_item.get("attempt_count") == 1, f"Expected attempt_count 1, got {saved_item.get('attempt_count')}"
    incomplete_id = saved_item.get("id")
    print(f"Created incomplete order ID: {incomplete_id}")

    print("\n========== TEST 3: POST upsert (same phone, attempt increment) ==========")
    order_data_2 = {
        "customer_name": "Test Incomplete User Updated",
        "phone": test_phone,
        "address": "Banani, Block C, Dhaka",
        "visitor_id": visitor_id,
        "reason": "failed_payment",
        "cart_snapshot": [
            {"id": "p1", "name": "Tomato Hybrid", "price": 120, "quantity": 3}
        ]
    }
    status, res = send_request("orders/incomplete.php", method="POST", data=order_data_2)
    print(f"POST upsert status: {status}, response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("success") is True
    updated_item = res.get("data", {})
    assert updated_item.get("attempt_count") == 2, f"Expected attempt_count 2, got {updated_item.get('attempt_count')}"
    assert updated_item.get("reason") == "failed_payment"
    assert updated_item.get("id") == incomplete_id, "ID should remain the same on upsert"

    print("\n========== TEST 4: GET list contains the incomplete order ==========")
    status, res = send_request("orders/incomplete.php")
    assert status == 200
    all_incomplete = res.get("data", [])
    matching = [x for x in all_incomplete if x.get("phone") == test_phone]
    assert len(matching) == 1, f"Expected 1 matching record, found {len(matching)}"
    assert matching[0].get("attempt_count") == 2

    print("\n========== TEST 5: Auto-cleanup on Order Creation (create.php) ==========")
    create_order_payload = {
        "customer_name": "Test Incomplete User",
        "phone": test_phone,
        "address": "Banani, Block C, Dhaka",
        "total_amount": 360,
        "items": [
            {"product_id": "p1", "name": "Tomato Hybrid", "price": 120, "quantity": 3}
        ],
        "payment_method": "cash_on_delivery"
    }
    status, res = send_request("orders/create.php", method="POST", data=create_order_payload)
    print(f"Order create status: {status}, response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("success") is True

    # Now verify that the incomplete order was cleaned up
    status, res = send_request("orders/incomplete.php")
    all_incomplete_after = res.get("data", [])
    matching_after = [x for x in all_incomplete_after if x.get("phone") == test_phone]
    print(f"Incomplete orders for {test_phone} after order creation: {len(matching_after)}")
    assert len(matching_after) == 0, "Incomplete order should have been auto-deleted after successful order placement!"

    print("\n========== TEST 6: Test DELETE endpoint explicitly ==========")
    # Create another test incomplete order
    temp_phone = "01700998877"
    status, res = send_request("orders/incomplete.php", method="POST", data={
        "customer_name": "Delete Me",
        "phone": temp_phone,
        "reason": "abandoned"
    })
    temp_id = res["data"]["id"]
    
    # Delete by ID
    status, res = send_request("orders/incomplete.php", method="DELETE", data={"id": temp_id})
    print(f"Delete by ID status: {status}, response: {res}")
    assert status == 200
    assert res.get("deleted_count") == 1

    print("\nALL INCOMPLETE ORDERS API AND INTEGRATION TESTS PASSED SUCCESSFULLY! 100% OK!")

if __name__ == "__main__":
    run_tests()
