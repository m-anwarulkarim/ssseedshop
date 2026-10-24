/// <reference types="vite/client" />

/**
 * Strongly typed interface for Vite environment variables in Ss Seed Shop.
 * Add any new VITE_* variables here to ensure autocompletion and type-safety.
 */
interface ImportMetaEnv {
  /**
   * Primary PHP Backend API Base URL
   * e.g. "https://api.ssseedshop.com" or "http://127.0.0.1:8005"
   */
  readonly VITE_API_URL?: string;

  /**
   * Google OAuth Client ID (optional)
   */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
