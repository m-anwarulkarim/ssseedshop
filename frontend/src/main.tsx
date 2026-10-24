import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import App from "./App.tsx";
import "./index.css";

const STALE_BUILD_RECOVERY_KEY = "stale-build-recovery";

const recoverFromStaleBuild  = async () => {
  const alreadyRecovered = sessionStorage.getItem(STALE_BUILD_RECOVERY_KEY) === "1";
  if (alreadyRecovered) return;

  sessionStorage.setItem(STALE_BUILD_RECOVERY_KEY, "1");

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // ignore recovery cleanup issues
  }

  const url = new URL(window.location.href);
  url.searchParams.set("v", Date.now().toString());
  window.location.replace(url.toString());
};

window.addEventListener("vite:preloadError", () => {
  void recoverFromStaleBuild();
});

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "");
  if (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  ) {
    event.preventDefault();
    void recoverFromStaleBuild();
  }
});

window.addEventListener("load", () => {
  sessionStorage.removeItem(STALE_BUILD_RECOVERY_KEY);
});

// Catch hard offline events globally
window.addEventListener("offline", () => {
  toast.error("আপনি অফলাইনে আছেন।", { id: "offline-status" });
});
window.addEventListener("online", () => {
  toast.success("ইন্টারনেট সংযোগ ফিরে এসেছে।", { id: "offline-status" });
});

// Unregister any previously-installed service workers and clear caches.
// PWA / push notification system has been removed.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
