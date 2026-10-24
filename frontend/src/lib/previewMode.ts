/**
 * Detects whether the app is running inside the Lovable in-editor preview.
 * In preview, admin login is bypassed for convenience.
 * Published sites (sweet-import-charm.lovable.app, custom domains) are NOT preview.
 */
export function isLovablePreview(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host.endsWith(".lovableproject.com") ||
    host.startsWith("id-preview--")
  );
}
