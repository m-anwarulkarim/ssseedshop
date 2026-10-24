import ssseedshopLogo from "@/assets/ssseedshop-logo.png";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/imageFallback";

/** Builds the same A4 invoice HTML used in the admin order list. */
export function buildInvoiceHtml(ordersList: any[]): string {
    const esc = (s: any) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    const toBnRaw = (v: any) => String(v ?? "").replace(/[0-9]/g, (d) => ["০","১","২","৩","৪","৫","৬","৭","৮","৯"][Number(d)]);
    const toBn = (v: any) => `<span class="num">${toBnRaw(v)}</span>`;
    const fmtDate = (d: Date) => toBn(`${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`);

    const pages = ordersList.map((o: any) => {
      const items = (o.order_items || []);
      const itemRows = items.map((i: any, idx: number) => {
        const price = Number(i.unit_price ?? 0);
        const regPrice = Number(i.products?.regular_price ?? 0);
        const hasDiscount = regPrice > 0 && regPrice > price;
        const qty = Number(i.quantity || 0);
        const displayUnit = hasDiscount ? regPrice : price;
        const lineTotal = displayUnit * qty;
        const name = esc(i.product_name || "");
        const img = esc(resolveImageUrl(i.product_image || i.image_url));
        const zebra = idx % 2 === 1 ? "background:#f1f8ef" : "background:#ffffff";
        return `<tr style="${zebra};border-bottom:1px solid #e7f0e2">
          <td style="padding:14px 10px;text-align:center;color:#1f2937;font-size:13px;vertical-align:middle;width:38px">${toBn(idx + 1)}</td>
          <td style="padding:10px;vertical-align:middle;width:64px"><div style="width:48px;height:48px;border-radius:8px;background:#eef6ea;overflow:hidden;display:flex;align-items:center;justify-content:center"><img src="${img}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'" style="width:100%;height:100%;object-fit:cover" alt=""/></div></td>
          <td style="padding:10px;vertical-align:middle;color:#0f172a;font-size:13px;line-height:1.45"><div style="font-weight:700">${name}</div>${(i.products?.short_description || i.short_description) ? `<div style="color:#6b7280;font-size:11px;margin-top:2px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:2.8em">${esc(String(i.products?.short_description || i.short_description).replace(/<[^>]*>/g, ''))}</div>` : ''}</td>
          <td style="padding:10px;text-align:center;color:#1f2937;font-size:13px;vertical-align:middle;white-space:nowrap">${toBn(qty)} প্যাকেট</td>
          <td style="padding:10px;text-align:center;vertical-align:middle;white-space:nowrap"><div style="color:#0f172a;font-size:14px;font-weight:700;line-height:1.2">৳ ${toBn(displayUnit.toFixed(0))}</div></td>
          <td style="padding:10px;text-align:right;color:#0f172a;font-size:13px;font-weight:700;vertical-align:middle;white-space:nowrap;padding-right:14px">৳ ${toBn(lineTotal.toFixed(0))}</td>
        </tr>`;
      }).join("");

      const subtotal = items.reduce((s: number, i: any) => s + Number(i.unit_price || 0) * Number(i.quantity || 0), 0);
      const regularSubtotal = items.reduce((s: number, i: any) => {
        const reg = Number(i.products?.regular_price || i.unit_price || 0);
        const unit = Number(i.unit_price || 0);
        return s + Math.max(reg, unit) * Number(i.quantity || 0);
      }, 0);
      const itemSavings = Math.max(0, regularSubtotal - subtotal);
      const delivery = Number(o.delivery_charge || 0);
      const discount = Number(o.discount || 0) + Number(o.advance || 0);
      const totalSavings = itemSavings + discount;
      const grandTotal = Number(o.total_amount || 0);
      const dateStr = fmtDate(new Date(o.created_at));
      const orderNo = esc(o.order_id || "");
      const paid = String(o.payment_status || "").toLowerCase() === "paid" ? "পরিশোধিত" : "বকেয়া";

      return `
        <div style="page-break-after:always;font-family:'Hind Siliguri','Noto Sans Bengali','SolaimanLipi','Segoe UI',Arial,sans-serif;color:#0f172a;background:#fff;padding:18px 22px;min-height:281mm;box-sizing:border-box;display:flex;flex-direction:column"><div style="flex:1 0 auto">
          <!-- HEADER -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:54px;height:54px;border-radius:50%;background:#eaf5e3;display:flex;align-items:center;justify-content:center;border:2px solid #d4ead0;overflow:hidden"><img src="${window.location.origin}${ssseedshopLogo}" alt="Ss Seed Shop" style="width:100%;height:100%;object-fit:cover"/></div>
              <div>
                <div style="font-size:22px;font-weight:800;color:#1f2937;letter-spacing:-0.3px">Ss Seed Shop</div>
                <div style="font-size:11px;color:#4b5563;margin-top:2px">সবজি, ফুল, ফল ও ঔষধি বীজের নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।</div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:24px;font-weight:800;color:#1f2937">অর্ডার চালান</div>
              <div style="font-size:11px;color:#4b5563;margin-top:6px">চালান নং: <span style="font-weight:700;color:#0f172a">${orderNo}</span></div>
              <div style="font-size:11px;color:#4b5563;margin-top:2px">তারিখ: <span style="font-weight:700;color:#0f172a">${dateStr}</span></div>
            </div>
          </div>

          <!-- PARTIES -->
          <div style="display:flex;gap:14px;margin-top:18px">
            <div style="flex:1;background:#eef6ea;border:1px solid #d4ead0;border-radius:10px;padding:12px 14px">
              <div style="font-size:11px;color:#4b5563;margin-bottom:4px">Sender</div>
              <div style="font-size:14px;font-weight:700;color:#0f172a">Ss Seed Shop</div>
              <div style="font-size:11px;color:#374151;margin-top:3px;line-height:1.55">Poran Mondol Tak, Boro Dewra, Tongi, Gazipur-1711</div>
              <div style="font-size:11px;color:#374151;margin-top:2px">Phone: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;color:#0f172a;letter-spacing:0.5px">01805080556</span></div>
              <div style="font-size:11px;color:#374151;margin-top:2px">Help: ssseedshop.com/help</div>
            </div>
            <div style="flex:1;background:#eef6ea;border:1px solid #d4ead0;border-radius:10px;padding:12px 14px">
              <div style="font-size:11px;color:#4b5563;margin-bottom:4px">প্রাপক</div>
              <div style="font-size:14px;font-weight:700;color:#0f172a">${esc(o.customer_name || "")}</div>
              <div style="font-size:11px;color:#374151;margin-top:3px">মোবাইল: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;color:#0f172a;letter-spacing:0.5px">${esc(o.phone || "")}${o.alt_phone ? " · " + esc(o.alt_phone) : ""}</span></div>
              <div style="font-size:11px;color:#374151;margin-top:2px;line-height:1.55">ঠিকানা: ${esc([o.address, o.thana, o.district].filter(Boolean).join(", "))}</div>
            </div>
          </div>

          <!-- ITEMS -->
          <table style="width:100%;border-collapse:collapse;margin-top:18px">
            <thead>
              <tr style="background:#1c4530">
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff;width:38px">ক্র.</th>
                <th style="padding:10px;text-align:left;font-size:12px;font-weight:700;color:#ffffff;width:64px">ছবি</th>
                <th style="padding:10px;text-align:left;font-size:12px;font-weight:700;color:#ffffff">পণ্যের বিবরণ</th>
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff">পরিমাণ</th>
                <th style="padding:10px;text-align:center;font-size:12px;font-weight:700;color:#ffffff">একক মূল্য</th>
                <th style="padding:10px;text-align:right;font-size:12px;font-weight:700;color:#ffffff;padding-right:14px">মোট</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- TOTALS -->
          <div style="display:flex;justify-content:flex-end;margin-top:14px">
            <table style="width:300px;border-collapse:collapse;font-size:13px">
              <tr><td style="padding:6px 0;color:#4b5563">সাবটোটাল</td><td style="padding:6px 0;text-align:right;color:#0f172a;font-weight:600">৳ ${toBn(regularSubtotal.toFixed(0))}</td></tr>
              <tr><td style="padding:6px 0;color:#4b5563">ডেলিভারি চার্জ</td><td style="padding:6px 0;text-align:right;color:#0f172a;font-weight:600">${delivery > 0 ? "৳ " + toBn(delivery.toFixed(0)) : "ফ্রি"}</td></tr>
              ${totalSavings > 0 ? `<tr><td style="padding:6px 0;color:#4b5563">ছাড়</td><td style="padding:6px 0;text-align:right;color:#dc2626;font-weight:600">- ৳ ${toBn(totalSavings.toFixed(0))}</td></tr>` : ""}
              <tr><td colspan="2" style="padding:0"><div style="border-top:1.5px solid #0f172a;margin:4px 0"></div></td></tr>
              <tr><td style="padding:8px 0;font-size:15px;font-weight:800;color:#0f172a">সর্বমোট</td><td style="padding:8px 0;text-align:right;font-size:18px;font-weight:800;color:#0f172a">৳ ${toBn(grandTotal.toFixed(0))}</td></tr>
              ${totalSavings > 0 ? `<tr><td colspan="2" style="padding:6px 0 0"><div style="background:#ecfdf5;border:1px dashed #10b981;border-radius:6px;padding:6px 10px;text-align:center;color:#047857;font-size:12px;font-weight:700">🎉 আপনি সাশ্রয় করেছেন ৳ ${toBn(totalSavings.toFixed(0))}</div></td></tr>` : ""}
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:10px">
            <div style="background:#eef6ea;border:1px solid #d4ead0;color:#1f2937;font-size:12px;padding:6px 12px;border-radius:6px">পেমেন্ট স্ট্যাটাস: ${paid}</div>
          </div>

          </div>
          <!-- FOOTER -->
          <div style="margin-top:18px;padding-top:12px;border-top:1px dashed #cbd5e1;text-align:center;page-break-inside:avoid;flex-shrink:0">
            <div style="font-size:14px;font-weight:700;color:#0f172a">আমাদের সাথে থাকার জন্য আন্তরিক ধন্যবাদ! 🪴</div>
            <div style="font-size:11px;color:#4b5563;margin-top:3px">আপনার বাগান সবুজ ও সতেজ হোক — Ss Seed Shop সবসময় আপনার পাশে।</div>
            <div style="font-size:10px;color:#6b7280;margin-top:8px">এটি একটি কম্পিউটার-জেনারেটেড চালান। যেকোনো জিজ্ঞাসার জন্য যোগাযোগ করুন: <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;font-size:12px;color:#0f172a;letter-spacing:0.5px">01805080556</span> / <span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:600;color:#0f172a">ssseedshop@gmail.com</span></div>
          </div>
        </div>`;
    }).join("");
  return `<html><head><title>Invoice</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Roboto+Mono:wght@500;600;700&display=swap" rel="stylesheet"><style>@page{size:A4;margin:8mm}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:'Hind Siliguri','Noto Sans Bengali',Arial,sans-serif}.num{font-family:'Tiro Bangla','Noto Sans Bengali',serif;font-weight:700;letter-spacing:0.6px;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:#0b1220}</style></head><body>${pages}<script>window.onload=()=>{setTimeout(()=>window.print(),600);}<\/script></body></html>`;
}

export function openInvoiceWindow(ordersList: any[]) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(buildInvoiceHtml(ordersList));
  w.document.close();
  return true;
}
