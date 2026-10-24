import brandPlaceholderSvg from "@/assets/placeholder.svg";
import { API_URL } from "@/config/env";

// Hashed asset ensures browsers and CDNs never serve stale cached placeholder images
export const PLACEHOLDER_IMAGE = brandPlaceholderSvg;

/**
 * Robust image URL resolver:
 * - If url is missing or empty, returns PLACEHOLDER_IMAGE
 * - If url is an exact reference to placeholder.svg/png, returns PLACEHOLDER_IMAGE
 * - If url is blob: or data:, returns it as-is (for client previews)
 * - If url is an absolute HTTP/HTTPS URL, returns it directly so the browser can load it!
 * - If url is a relative path (e.g. /uploads/... or uploads/...), prepends API_URL
 * - If the image is actually broken (404 / network failure), the <img> tag's onError={handleImageError}
 *   will automatically swap to PLACEHOLDER_IMAGE!
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER_IMAGE;
  const trimmed = String(url).trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;

  // Exact static placeholder paths
  if (
    trimmed === "/placeholder.svg" ||
    trimmed === "/placeholder.png" ||
    trimmed === "placeholder.svg" ||
    trimmed === "placeholder.png"
  ) {
    return PLACEHOLDER_IMAGE;
  }

  // Blob or Data URLs (e.g. client previews during file selection)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it's a localhost URL containing /uploads/ (e.g. uploaded during local dev)
    // normalize it to API_URL so it loads seamlessly across dev & production
    if (trimmed.includes("/uploads/")) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          const uploadIdx = trimmed.indexOf("/uploads/");
          const relativeUpload = trimmed.substring(uploadIdx + 1); // "uploads/..."
          return `${API_URL}/${relativeUpload}`;
        }
      } catch {
        // Ignore URL parse error and continue
      }
    }
    return trimmed;
  }

  // Relative path starting with /uploads/ or uploads/
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${API_URL}/${cleanPath}`;
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null; // Strictly prevent any infinite error recursion
  target.src = PLACEHOLDER_IMAGE;
};
