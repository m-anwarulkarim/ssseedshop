/**
 * @file apiConfig.ts
 * @description API base configuration. Re-exports the centralized typed config from @/config/env.
 */
import { env, API_URL, buildApiUrl } from "@/config/env";

export function getApiBase(): string {
  return env.apiUrl;
}

export const API_BASE = env.apiUrl;
export { API_URL, buildApiUrl, env };
export default API_BASE;
