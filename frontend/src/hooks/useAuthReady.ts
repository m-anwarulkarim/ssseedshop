import { useEffect, useState } from "react";
import { clearInvalidAdminSession } from "@/lib/adminAccess";

interface AuthReadyState {
  isReady: boolean;
  session: any | null;
  user: any | null;
}

export function useAuthReady(): AuthReadyState {
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    try {
      if (clearInvalidAdminSession()) {
        setSession(null);
        return;
      }
      const localStr = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
      if (localStr) {
        const u = JSON.parse(localStr);
        setSession({ user: u });
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  return {
    isReady: true,
    session,
    user: session?.user ?? null,
  };
}