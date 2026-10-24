// Centralized API Base resolution with intelligent localhost / production switching
export function getApiBase(): string {
  const isLocal = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocal) {
    // In local development, always use local PHP server on port 8005
    return "http://127.0.0.1:8005";
  }

  return import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
}

export const API_BASE = getApiBase();
