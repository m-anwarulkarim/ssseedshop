import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Built-in URL redirect map (frozen — no new redirects can be added).
 * Maps old/legacy paths to current routes. Runs on every route change
 * inside BrowserRouter. Admin (/e) routes are skipped.
 */
const BUILTIN_REDIRECTS: Readonly<Record<string, string>> = Object.freeze({
  "/hn/lau/": "/product/lau",
  "/hn/capsicum/": "/product/capsicum",
  "/hn/blu-berry/": "/product/buluberry",
  "/hn/hn-sim-final/": "/product/sim",
  "/hn/morich-final/": "/product/colurmorich",
  "/hn/sammam/": "/product/shammam",
  "/hn/tormuj-final-step/": "/product/kalo-tormuj",
  "/hn/dheros-1/": "/product/laldheros",
  "/hn/bombaichilli/": "/product/bombai",
  "/hn/pepe-1/": "/product/pepee",
  "/hn/newchar-2/": "/product/trisprokar",
  "/hn/dosprokar-ful/": "/product/dosprokar",
});

export function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith("/admin")) return;

    // Try exact match first, then with/without trailing slash for safety
    const path = location.pathname;
    const target =
      BUILTIN_REDIRECTS[path] ||
      BUILTIN_REDIRECTS[path.endsWith("/") ? path.slice(0, -1) : path + "/"];

    if (target) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
