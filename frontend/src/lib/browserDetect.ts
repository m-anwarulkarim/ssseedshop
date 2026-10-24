/**
 * Facebook / Instagram In-App Browser detection & external-browser helpers.
 */

/** Returns true when running inside Facebook or Instagram's in-app browser. */
export function isFacebookBrowser(): boolean {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram/i.test(ua);
}

/** Rough iOS check (iPhone / iPad / iPod). */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Rough Android check. */
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * On Android, returns an `intent://` URL that tells the OS to open the
 * current page (or a custom URL) in Chrome.
 * On iOS there is no automatic way — returns `null`.
 */
export function getChromeIntentUrl(targetUrl?: string): string | null {
  if (!isAndroid()) return null;
  const url = targetUrl || window.location.href;
  // Strip the scheme so intent:// can re-add it
  const stripped = url.replace(/^https?:\/\//, "");
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
}

/** Copy text to clipboard (best-effort). */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}
