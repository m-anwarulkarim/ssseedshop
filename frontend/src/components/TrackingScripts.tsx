// 🔒 DO_NOT_MODIFY_START — Facebook Pixel & Meta CAPI tracking (full file locked)
import { API_URL } from "@/config/env";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
// Helper to fire server-side Conversions API (CAPI) events via PHP backend
function sendToCapi(body: Record<string, unknown>) {
  try {
    fetch(`${API_URL}/tracking/meta_capi.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {}
}

// Prevent duplicate script injection across re-renders
let pixelInitialized = false;
let gtmInitialized = false;

// ─── Event Match Quality helpers ───────────────────────────────────────────
// Read a browser cookie by name (used for _fbp / _fbc set by fbevents.js).
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Persist fbc from an incoming ?fbclid=... so it survives after the URL is cleaned.
function captureFbcFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      localStorage.setItem("_fbc", fbc);
      return fbc;
    }
  } catch {}
  return null;
}

// Build the enriched user_data object sent to CAPI + used to enrich Pixel events.
// The more identifiers we send (fbp, fbc, external_id, phone, name, city),
// the higher Meta's Event Match Quality score climbs.
export function getEnrichedUserData(): Record<string, string> {
  const data: Record<string, string> = {};
  try {
    const fbp = getCookie("_fbp");
    if (fbp) data.fbp = fbp;

    const fbc = getCookie("_fbc") || localStorage.getItem("_fbc") || captureFbcFromUrl();
    if (fbc) data.fbc = fbc;

    const externalId = localStorage.getItem("visitor-id");
    if (externalId) data.external_id = externalId;

    // Cached checkout info — {name, phone, address, altPhone}
    const rawDelivery = localStorage.getItem("checkout-delivery-info");
    if (rawDelivery) {
      const d = JSON.parse(rawDelivery);
      if (d?.phone) data.ph = String(d.phone);
      if (d?.name) {
        const parts = String(d.name).trim().split(/\s+/);
        data.fn = parts[0];
        if (parts.length > 1) data.ln = parts.slice(1).join(" ");
      }
      if (d?.address) {
        // Extract city as the last comma-separated segment (heuristic)
        const segs = String(d.address).split(",").map((s: string) => s.trim()).filter(Boolean);
        if (segs.length) data.ct = segs[segs.length - 1];
      }
      data.country = "bd";
    }
  } catch {}
  return data;
}

const DEFAULT_PIXEL_ID: string | null = null;

export default function TrackingScripts() {
  const [pixelId, setPixelId] = useState<string | null>(DEFAULT_PIXEL_ID);
  const [gtmId, setGtmId] = useState<string | null>(null);
  const location = useLocation();
  const prevPathRef = useRef<string>("");
  const isAdmin = location.pathname.startsWith("/admin");

  // Fetch tracking IDs once
  useEffect(() => {
    if (isAdmin) return;
    const url = API_URL;
    fetch(`${url}/settings/get.php?keys=meta_pixel_id,gtm_id&_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        let foundPixel: string | null = null;
        let foundGtm: string | null = null;
        if (Array.isArray(data)) {
          data.forEach((r: any) => {
            if (r?.key === "meta_pixel_id" && r?.value != null && String(r.value).trim()) {
              foundPixel = String(r.value).trim();
            }
            if (r?.key === "gtm_id" && r?.value != null && String(r.value).trim()) {
              foundGtm = String(r.value).trim();
            }
          });
        }
        setPixelId(foundPixel);
        setGtmId(foundGtm);
      })
      .catch(() => {});
  }, [isAdmin]);

  // Capture fbclid ASAP so subsequent events include fbc.
  useEffect(() => { if (!isAdmin) captureFbcFromUrl(); }, [isAdmin]);

  // Fire PageView via server-side CAPI (deduped with browser pixel via event_id),
  // enriched with fbp / fbc / external_id / cached customer info.
  const sendPageViewCAPI = (eventId: string) => {
    sendToCapi({
      event_name: "PageView",
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: getEnrichedUserData(),
    });
  };

  // Meta Pixel — inject standard snippet ONCE
  useEffect(() => {
    if (!pixelId || pixelInitialized || isAdmin) return;
    pixelInitialized = true;

    const script = document.createElement("script");
    script.id = "meta-pixel-script";
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    noscript.id = "meta-pixel-noscript";
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.head.appendChild(noscript);
  }, [pixelId]);

  // Track PageView on initial load and route changes (excluding admin)
  useEffect(() => {
    if (!pixelId || isAdmin) return;

    const currentPath = location.pathname + location.search;
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    const eventId = `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const w = window as any;
    if (w.fbq) {
      w.fbq('track', 'PageView', {}, { eventID: eventId });
    }
    sendPageViewCAPI(eventId);
  }, [location.pathname, location.search, pixelId, isAdmin]);


  // GTM — inject ONCE
  useEffect(() => {
    if (!gtmId || gtmInitialized || isAdmin) return;
    gtmInitialized = true;

    const script = document.createElement("script");
    script.id = "gtm-script";
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);
  }, [gtmId]);

  return null;
}

/**
 * Helper: Fire a Meta Pixel Purchase event with deduplication.
 */
export function trackPurchase(orderId: string, value: number, currency = "BDT", phone?: string, customerName?: string) {
  const eventId = `purchase_${orderId}`;

  const w = window as any;
  if (w.fbq) {
    w.fbq('track', 'Purchase', {
      value,
      currency,
      content_type: 'product',
    }, { eventID: eventId });
  }

  const userData = getEnrichedUserData();
  if (phone) userData.ph = phone;
  if (customerName) {
    const parts = customerName.trim().split(/\s+/);
    userData.fn = parts[0];
    if (parts.length > 1) userData.ln = parts.slice(1).join(" ");
  }

  sendToCapi({
    event_name: "Purchase",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: { value, currency, content_type: "product" },
    user_data: userData,
  });
}

/**
 * Helper: Fire AddToCart event with deduplication + server-side CAPI.
 */
export function trackAddToCart(product: { id: string; sku?: string | null }, value: number, currency = "BDT") {
  const contentId = product.sku || product.id;
  const eventId = `atc_${product.id}_${Date.now()}`;

  const w = window as any;
  if (w.fbq) {
    w.fbq('track', 'AddToCart', {
      value,
      currency,
      content_ids: [contentId],
      content_type: 'product',
    }, { eventID: eventId });
  }

  sendToCapi({
    event_name: "AddToCart",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: { value, currency, content_ids: [contentId], content_type: "product" },
    user_data: getEnrichedUserData(),
  });
}

/**
 * Helper: Fire InitiateCheckout event with deduplication + server-side CAPI.
 */
export function trackInitiateCheckout(value: number, numItems: number, currency = "BDT") {
  const eventId = `ic_${Date.now()}`;

  const w = window as any;
  if (w.fbq) {
    w.fbq('track', 'InitiateCheckout', {
      value,
      currency,
      num_items: numItems,
      content_type: 'product',
    }, { eventID: eventId });
  }

  sendToCapi({
    event_name: "InitiateCheckout",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: { value, currency, num_items: numItems, content_type: "product" },
    user_data: getEnrichedUserData(),
  });
}

/**
 * Helper: Fire ViewContent event with deduplication + server-side CAPI.
 */
export function trackViewContent(product: { id: string; sku?: string | null; name?: string; category?: string }, value: number, currency = "BDT") {
  const contentId = product.sku || product.id;
  const eventId = `vc_${product.id}_${Date.now()}`;

  const w = window as any;
  if (w.fbq) {
    w.fbq('track', 'ViewContent', {
      value,
      currency,
      content_ids: [contentId],
      content_type: 'product',
      content_name: product.name,
      content_category: product.category,
    }, { eventID: eventId });
  }

  sendToCapi({
    event_name: "ViewContent",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: {
      value,
      currency,
      content_ids: [contentId],
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
    },
    user_data: getEnrichedUserData(),
  });
}
// 🔒 DO_NOT_MODIFY_END
