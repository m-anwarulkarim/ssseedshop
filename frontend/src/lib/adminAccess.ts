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

const SUPER_ADMIN_EMAIL = "admin@ssseedshop.com";

export async function getCurrentAdminAccess(): Promise<AdminAccessResult> {
  if (typeof window !== "undefined") {
    // 1. Check local admin session
    try {
      const localStr = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
      if (localStr) {
        const adminUser = JSON.parse(localStr);
        if (adminUser?.email) {
          const isSuper = Boolean(
            adminUser.is_super_admin ||
            adminUser.role === "admin" ||
            adminUser.email === SUPER_ADMIN_EMAIL ||
            adminUser.email === "admin@ssseedshop.com"
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
      }
    } catch {
      // Ignore JSON parse errors
    }

    // 2. Dev bypass fallback
    if (localStorage.getItem("admin_dev_bypass") === "true" || sessionStorage.getItem("admin_dev_bypass") === "true") {
      return {
        status: "authorized",
        role: "admin",
        permissions: ["*"],
        email: SUPER_ADMIN_EMAIL,
        isSuperAdmin: true,
      };
    }

    // 3. Localhost / local dev auto-authorization
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      const devSuperAdmin = {
        id: "admin_super_001",
        email: SUPER_ADMIN_EMAIL,
        name: "Ss Seed Shop Super Admin",
        role: "admin",
        is_super_admin: true,
        permissions: ["*"],
      };
      try {
        localStorage.setItem("admin_session", JSON.stringify(devSuperAdmin));
        localStorage.setItem("admin_dev_bypass", "true");
      } catch {}
      return {
        status: "authorized",
        role: "admin",
        permissions: ["*"],
        email: SUPER_ADMIN_EMAIL,
        isSuperAdmin: true,
      };
    }
  }

  return { status: "no-session" };
}

export function getActiveAdminUser(): any {
  if (typeof window !== "undefined") {
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
        name: "Ss Seed Shop Super Admin",
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