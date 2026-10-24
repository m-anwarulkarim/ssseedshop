import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Fbq = (...args: unknown[]) => void;

/**
 * Fires only the initial Meta PageView. TrackingScripts owns subsequent SPA
 * route changes. Never replace window.fbq here: fbevents.js installs runtime
 * state on that exact function reference after the external script loads.
 */
function withFbq(callback: (fbq: Fbq) => void) {
  const existing = (window as unknown as { fbq?: Fbq }).fbq;
  if (existing) {
    callback(existing);
    return () => undefined;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (fbq) {
      window.clearInterval(timer);
      callback(fbq);
    } else if (attempts >= 100) {
      window.clearInterval(timer);
    }
  }, 100);
  return () => window.clearInterval(timer);
}

export default function InitialMetaPageView() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    return withFbq((fbq) => {
      fbq("track", "PageView");
    });
  }, [isAdmin]);

  return null;
}
