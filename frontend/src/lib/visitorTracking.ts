// Safe Local Visitor Tracking System
import { detectTrafficSource } from "@/lib/trafficSource";

const VISITOR_FINGERPRINT_KEY = "visitor-fingerprint";
const VISITOR_ID_KEY = "visitor-id";
const BANNED_KEY = "visitor-banned";

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

function buildFingerprintSeed(): string {
  const nav = window.navigator;
  const screenInfo = window.screen;
  return [
    nav.userAgent,
    nav.language,
    nav.platform,
    nav.hardwareConcurrency ?? "na",
    nav.maxTouchPoints ?? 0,
    `${screenInfo.width}x${screenInfo.height}x${screenInfo.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
}

function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") return "fp_server";
  const existing = localStorage.getItem(VISITOR_FINGERPRINT_KEY);
  if (existing) return existing;
  const fingerprint = `fp_${hashString(`${buildFingerprintSeed()}|${Date.now()}`)}`;
  localStorage.setItem(VISITOR_FINGERPRINT_KEY, fingerprint);
  return fingerprint;
}

function isBot(): boolean {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
    /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
    /lighthouse/i, /pagespeed/i, /gtmetrix/i, /pingdom/i,
    /wget/i, /curl/i, /python-requests/i, /axios/i, /node-fetch/i,
  ];
  if (botPatterns.some((p) => p.test(ua))) return true;
  if ((navigator as any).webdriver === true) return true;
  if (!navigator.language) return true;
  return false;
}

export async function ensureVisitorTracked(): Promise<{ visitorId: string | null; fingerprint: string | null }> {
  if (typeof window === "undefined" || isBot()) {
    return { visitorId: null, fingerprint: null };
  }

  const fingerprint = getOrCreateFingerprint();
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return { visitorId, fingerprint };
}

interface CheckoutProfilePayload {
  name: string;
  phone: string;
  address: string;
  altPhone?: string | null;
}

export async function upsertVisitorProfileFromOrder(payload: CheckoutProfilePayload): Promise<{ id: string; phone: string; name: string | null } | null> {
  const phone = payload.phone?.trim();
  if (!phone) return null;

  const { visitorId } = await ensureVisitorTracked();
  const id = visitorId || `vp_${Date.now()}`;

  try {
    localStorage.setItem("customer_phone", phone);
    if (payload.name) localStorage.setItem("customer_name", payload.name);
    if (payload.address) localStorage.setItem("customer_address", payload.address);
  } catch {}

  return { id, phone, name: payload.name?.trim() || null };
}
