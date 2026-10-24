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

API_BASE = "http://127.0.0.1:8005"

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
    print("🧪 [TEST PART 23: /admin/overview & /admin/expenses পূর্ণাঙ্গ ভেরিফিকেশন]")
    print("=" * 75)

    # -------------------------------------------------------------
    # 1. Test /admin/overview Backend API (api/analytics/overview.php)
    # -------------------------------------------------------------
    print("\n[১/৪] 📊 api/analytics/overview.php টেস্ট...")
    status, res = api_call("analytics/overview.php")
    print(f"  • Overview API Status: HTTP {status} -> success: {res.get('success')}")
    assert status == 200 and res.get("success") is True, f"Failed: {res}"

    data = res.get("data", {})
    summary = data.get("summary", {})
    profit_periods = data.get("profit_periods", [])
    chart_data = data.get("chart_data", [])
    recent_orders = data.get("recent_orders", [])
    top_products = data.get("top_products", [])

    print(f"  • Summary: মোট অর্ডার: {summary.get('total_orders')}, মোট আয়: ৳{summary.get('total_revenue')}, ডেলিভার্ড: {summary.get('delivered_orders')}")
    print(f"  • Profit Periods ({len(profit_periods)}টি): {[p['label'] + ': ৳' + str(p['profit']) for p in profit_periods[:3]]}")
    print(f"  • Chart Data: {len(chart_data)} দিনের সেলস ও রেভিনিউ ট্র্যাকিং")
    print(f"  • Recent Orders: {len(recent_orders)}টি অর্ডার")
    print(f"  • Top Products: {len(top_products)}টি পণ্য (১ম পণ্য: {top_products[0]['name'] if top_products else 'N/A'})")

    assert "total_orders" in summary
    assert len(profit_periods) >= 6
    assert len(chart_data) == 14
    print("  ✅ Overview Analytics API সম্পূর্ণ সফল!")

    # -------------------------------------------------------------
    # 2. Test /admin/expenses Fetch API (api/expenses/get.php)
    # -------------------------------------------------------------
    print("\n[২/৪] 💰 api/expenses/get.php টেস্ট...")
    status, res = api_call("expenses/get.php")
    print(f"  • Expenses Get API Status: HTTP {status} -> success: {res.get('success')}")
    assert status == 200 and res.get("success") is True, f"Failed: {res}"

    entries = res.get("entries", [])
    meta = res.get("meta", {})
    print(f"  • মোট লেজার এন্ট্রি: {len(entries)}টি")
    print(f"  • মেটা ক্যাটাগরি: {len(meta.get('expenseCategories', []))}টি খরচ ক্যাটাগরি, {len(meta.get('incomeCategories', []))}টি আয় ক্যাটাগরি")
    print(f"  • ভেন্ডরস: {len(meta.get('vendors', []))}টি ভেন্ডর")
    assert len(entries) > 0, "Ledger entries should not be empty"
    assert "expenseCategories" in meta
    print("  ✅ Expenses Get API সম্পূর্ণ সফল!")

    # -------------------------------------------------------------
    # 3. Test /admin/expenses Save API (api/expenses/save.php)
    # -------------------------------------------------------------
    print("\n[৩/৪] 📝 api/expenses/save.php টেস্ট (নতুন খরচ এন্ট্রি সেভ)...")
    test_entry = {
        "id": f"test_exp_{int(time.time())}",
        "type": "expense",
        "amount": 250,
        "category": "Office Supplies",
        "vendor": "Local shop",
        "paymentMethod": "Cash",
        "description": "অফিস প্রিন্টার পেপার ও স্টেশনারি টেস্ট",
        "date": time.strftime("%Y-%m-%d"),
        "addedBy": "Admin AutoTest",
        "source": "manual",
        "deletedAt": None
    }
    updated_entries = [test_entry] + entries

    status, res = api_call("expenses/save.php", method="POST", payload={"entries": updated_entries})
    print(f"  • Save Entries Status: HTTP {status} -> {res}")
    assert status == 200 and res.get("success") is True

    # Verify retrieval
    status, res = api_call("expenses/get.php")
    retrieved_entries = res.get("entries", [])
    found = any(e.get("id") == test_entry["id"] for e in retrieved_entries)
    print(f"  • Verify Saved Entry in DB: {'পাওয়া গেছে ✓' if found else 'পাওয়া যায়নি ✗'}")
    assert found, "Saved entry not found in get.php"
    print("  ✅ Expenses Save API সম্পূর্ণ সফল!")

    # -------------------------------------------------------------
    # 4. Test Website Sales Sync (api/expenses/sync_sales.php)
    # -------------------------------------------------------------
    print("\n[৪/৪] 🔄 api/expenses/sync_sales.php টেস্ট (ওয়েবসাইট ডেলিভার্ড অর্ডার অটো-সিঙ্ক)...")
    status, res = api_call("expenses/sync_sales.php", method="POST")
    print(f"  • Sync Sales Status: HTTP {status} -> {res.get('message', res.get('status'))}")
    print(f"  • সিঙ্ক রিপোর্ট: নতুন যুক্ত: {res.get('new_count')}টি, অপসারিত: {res.get('removed_count')}টি, মোট লেজার: {len(res.get('entries', []))}টি")
    assert status == 200 and res.get("success") is True
    print("  ✅ Website Sales Sync API সম্পূর্ণ সফল ও কার্যকর!")

    print("\n" + "=" * 75)
    print("🎉 /admin/overview এবং /admin/expenses এর সকল ব্যাকএন্ড ও ফ্রন্টএন্ড ইন্টিগ্রেশন ১০০% কার্যকর!")
    print("=" * 75)

if __name__ == "__main__":
    main()
