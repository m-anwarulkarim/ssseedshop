/**
 * @file env.ts
 * @description Centralized, typed environment configuration for Ss Seed Shop.
 *
 * This module is the SINGLE SOURCE OF TRUTH for all environment variables.
 * Components, pages, and services should NEVER read `import.meta.env` directly
 * or hardcode fallback URLs like `http://localhost:8000` inside their code.
 */

export interface AppEnvConfig {
  /**
   * The base URL of the PHP Backend API without trailing slash.
   * e.g., "https://api.ssseedshop.com" in production or "http://127.0.0.1:8005" in local dev.
   */
  readonly apiUrl: string;

  /**
   * Optional Google OAuth Client ID for customer/admin social auth.
   */
  readonly googleClientId: string;

  /**
   * Current Vite application execution mode ("development" | "production" | "test").
   */
  readonly mode: string;

  /**
   * True if running in production mode.
   */
  readonly isProduction: boolean;

  /**
   * True if running in local development mode.
   */
  readonly isDevelopment: boolean;

  /**
   * Constructs an absolute API endpoint URL safely without duplicate slashes.
   *
   * @example
   * buildApiUrl("/products/get.php") // "https://api.ssseedshop.com/products/get.php"
   * buildApiUrl("settings/get.php?keys=meta_pixel_id") // "https://api.ssseedshop.com/settings/get.php?keys=meta_pixel_id"
   */
  readonly buildApiUrl: (endpoint: string) => string;
}

/**
 * Normalizes a URL by trimming trailing slashes and whitespace.
 */
function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Resolves the primary API base URL.
 * Priority:
 * 1. When browsing on localhost / 127.0.0.1 or in Vite dev mode, default to local PHP backend ("http://127.0.0.1:8005")
 *    (unless VITE_API_URL explicitly specifies a custom local port).
 * 2. Explicit `VITE_API_URL` set in environment for staging/production.
 * 3. Default production URL ("https://api.ssseedshop.com")
 */
function resolveApiUrl(): string {
  const isBrowser = typeof window !== "undefined";
  const isLocalHost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const configuredUrl = import.meta.env.VITE_API_URL;

  // In local browser development (localhost/127.0.0.1) or Vite dev mode,
  // automatically route to local PHP server on port 8005 so data always loads smoothly.
  if (isLocalHost || import.meta.env.DEV) {
    if (configuredUrl && (configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1"))) {
      return normalizeUrl(configuredUrl);
    }
    return "http://127.0.0.1:8005";
  }

  if (configuredUrl && typeof configuredUrl === "string" && configuredUrl.trim() !== "") {
    return normalizeUrl(configuredUrl);
  }

  return "https://api.ssseedshop.com";
}

const resolvedApiUrl = resolveApiUrl();
const resolvedMode = import.meta.env.MODE || (import.meta.env.PROD ? "production" : "development");
const resolvedIsProd = Boolean(import.meta.env.PROD);
const resolvedIsDev = Boolean(import.meta.env.DEV);
const DEFAULT_GOOGLE_CLIENT_ID = "934384186684-5s17f4snee7neecq45h0ssmh26b57pbk.apps.googleusercontent.com";
const resolvedGoogleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID).trim();

function createApiUrlBuilder(base: string) {
  return function buildApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.trim().replace(/^\/+/, "");
    return `${base}/${cleanEndpoint}`;
  };
}

/**
 * Immutable typed application environment configuration.
 */
export const env: Readonly<AppEnvConfig> = Object.freeze({
  apiUrl: resolvedApiUrl,
  googleClientId: resolvedGoogleClientId,
  mode: resolvedMode,
  isProduction: resolvedIsProd,
  isDevelopment: resolvedIsDev,
  buildApiUrl: createApiUrlBuilder(resolvedApiUrl),
});

/**
 * Primary API Base URL shorthand.
 * @example
 * import { API_URL } from "@/config/env";
 * fetch(`${API_URL}/products/get.php`)
 */
export const API_URL = env.apiUrl;

/**
 * Primary Google Client ID shorthand.
 */
export const GOOGLE_CLIENT_ID = env.googleClientId;

/**
 * Primary API URL builder shorthand.
 * @example
 * import { buildApiUrl } from "@/config/env";
 * fetch(buildApiUrl("/products/get.php"))
 */
export const buildApiUrl = env.buildApiUrl;

export default env;
