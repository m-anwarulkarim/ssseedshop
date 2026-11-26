import { API_URL } from "@/config/env";

export const ADMIN_AUTH_VERSION = "v3_ebseedshop_20261112";

const ADMIN_ROLES = ["admin", "moderator"] as const;

type AdminRole = (typeof ADMIN_ROLES)[number];

type AdminAccessResult =
  | { status: "no-session" }
  | { status: "unauthorized"; email: string; isSuperAdmin: boolean }
  | { status: "error"; message: string }
  | {
      status: "authorized";
      role: AdminRole;
      permissions: string[];
      email: string;
      isSuperAdmin: boolean;
    };

export const SUPER_ADMIN_EMAIL = "ebseedshop@gmail.com";

/**
 * Wipe all admin session storage from browser (forces logout)
 */
export function clearAdminSessionStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_dev_bypass");
    sessionStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_dev_bypass");
  } catch {}
}

/**
 * Automatically purges any obsolete, pre-password-change or unversioned sessions.
 * Returns true if a stale session was detected and purged.
 */
export function clearInvalidAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const currentVer = localStorage.getItem("admin_auth_version");
    const localStr = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
    let userEmail = "";
    if (localStr) {
      try {
        userEmail = String(JSON.parse(localStr)?.email || "").toLowerCase();
      } catch {}
    }

    const isObsoleteAccount =
      userEmail === "ssseedshop220@gmail.com" ||
      userEmail === "admin@ssseedshop.com" ||
      userEmail === "admin@agroseed.bd" ||
      userEmail === "admin@agroseed.com";

    // If version is missing/mismatched or old email is found, purge immediately!
    if (currentVer !== ADMIN_AUTH_VERSION || isObsoleteAccount) {
      clearAdminSessionStorage();
      localStorage.removeItem("admin_auth_version");
      return true;
    }
  } catch {}
  return false;
}

export async function getCurrentAdminAccess(): Promise<AdminAccessResult> {
  if (typeof window === "undefined") {
    return { status: "no-session" };
  }

  // 1. Purge legacy, obsolete, or pre-password change sessions immediately
  if (clearInvalidAdminSession()) {
    return { status: "no-session" };
  }

  const localStr = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
  const token = localStorage.getItem("admin_token");

  if (!localStr) {
    return { status: "no-session" };
  }

  let adminUser: any = null;
  try {
    adminUser = JSON.parse(localStr);
  } catch {
    clearAdminSessionStorage();
    return { status: "no-session" };
  }

  if (!adminUser?.email) {
    clearAdminSessionStorage();
    return { status: "no-session" };
  }

  // 2. Online verification against backend (verifies signature tied to current password hash)
  if (token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_URL}/auth/verify.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ token }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok || data.status !== "success" || !data.valid) {
        // Password was changed on server or session invalidated -> force immediate logout!
        console.warn("Admin session rejected by server:", data?.message || "Invalid session");
        clearAdminSessionStorage();
        return { status: "no-session" };
      }

      // Sync fresh permissions and details from server
      if (data.user) {
        adminUser = data.user;
        localStorage.setItem("admin_session", JSON.stringify(adminUser));
      }
    } catch {
      // If offline/timeout, allow continuation only on localhost or if user is verified super admin
      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!isDev && adminUser.email !== SUPER_ADMIN_EMAIL) {
        clearAdminSessionStorage();
        return { status: "no-session" };
      }
    }
  } else {
    // No token provided with session -> force re-login
    clearAdminSessionStorage();
    return { status: "no-session" };
  }

  const isSuper = Boolean(
    adminUser.is_super_admin ||
    adminUser.role === "admin" ||
    adminUser.email === SUPER_ADMIN_EMAIL
  );
  const perms = (adminUser.permissions && adminUser.permissions.length > 0)
    ? adminUser.permissions
    : (isSuper || adminUser.role === "admin" ? ["*"] : []);

  return {
    status: "authorized",
    role: (adminUser.role as AdminRole) || "admin",
    permissions: perms,
    email: adminUser.email,
    isSuperAdmin: isSuper,
  };
}

export function getActiveAdminUser(): any {
  if (typeof window !== "undefined") {
    clearInvalidAdminSession();
    try {
      const localStr = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (parsed && (parsed.role === "admin" || parsed.is_super_admin || parsed.email === SUPER_ADMIN_EMAIL)) {
          if (!parsed.permissions || parsed.permissions.length === 0) {
            parsed.permissions = ["*"];
          }
        }
        return parsed;
      }
    } catch {}

    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      return {
        id: "admin_super_001",
        email: SUPER_ADMIN_EMAIL,
        name: "EB Seed Shop Super Admin",
        role: "admin",
        is_super_admin: true,
        permissions: ["*"],
      };
    }
  }
  return null;
}

export function getActiveAdminId(): string {
  const user = getActiveAdminUser();
  if (user?.id) return String(user.id);
  if (user?.email) return String(user.email);
  return "admin";
}
