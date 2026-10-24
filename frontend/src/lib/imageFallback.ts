import { API_BASE } from "@/lib/apiConfig";

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * Robust image URL resolver:
 * - Fixes relative paths (e.g. /uploads/..., uploads/...) by prepending API_BASE
 * - Detects and gracefully handles dead Supabase URLs
 * - Handles blob: and data: URLs
 * - Gracefully handles empty / null
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER_IMAGE;
  const trimmed = String(url).trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;

  // Blob or Data URLs (e.g. client previews)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Dead Supabase project links fallback
  if (trimmed.includes("supabase.co")) {
    return PLACEHOLDER_IMAGE;
  }

  // Already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Relative path starting with /uploads/ or uploads/
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${API_BASE}/${cleanPath}`;
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null; // Strictly prevent any infinite error recursion
  target.src = PLACEHOLDER_IMAGE;
};
