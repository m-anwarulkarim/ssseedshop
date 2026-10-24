import { API_URL, GOOGLE_CLIENT_ID } from "@/config/env";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Zap, PackageCheck } from "lucide-react";
import logoAsset from "@/assets/ssseedshop-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

declare global {
  interface Window {
    google?: any;
  }
}

const CUSTOMER_SESSION_KEY = "customer-session";

export interface CustomerSession {
  phone: string;
  profile_id: string;
  name: string | null;
  phone_verified: boolean;
  user_type?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  auth_provider?: string;
  token?: string;
}

export function getCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCustomerSession(session: CustomerSession) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
}

interface Props {
  onLogin: (session: CustomerSession) => void;
}

export default function CustomerLogin({ onLogin }: Props) {
  const { lang, t } = useLanguage();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);

  // ─── Handle Google OAuth Credential Response ───
  const handleGoogleResponse = async (response: any) => {
    if (!response?.credential) return;
    setGoogleLoading(true);
    try {
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/customer/google_auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data?.status === "success" && data?.session) {
        setCustomerSession(data.session);
        toast.success(
          lang === "en"
            ? "Successfully logged in with Google!"
            : "Google দিয়ে সফলভাবে লগইন হয়েছে!"
        );
        onLogin(data.session);
      } else {
        toast.error(
          data?.message ||
            (lang === "en" ? "Google login failed" : "Google লগইন ব্যর্থ হয়েছে")
        );
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(
        lang === "en"
          ? "Could not connect to authentication server"
          : "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Initialize Google Identity Services ───
  useEffect(() => {
    let isMounted = true;

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id && googleBtnRef.current && isMounted) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left",
          });
          setGoogleScriptReady(true);
        } catch (e) {
          console.warn("Google button init warning:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          renderGoogleBtn();
        }
      }, 300);
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-220px)] px-4 py-10">
      <Card className="w-full max-w-md mx-auto border border-gray-100 shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-8 pb-4 space-y-3">
          {/* Brand Logo with Soft Glow */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={logoAsset}
                alt="Ss Seed Shop"
                className="w-16 h-16 rounded-full object-contain p-1 border-2 border-emerald-500/30 bg-white shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
          </div>

          <div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {t("স্বাগতম Ss Seed Shop-এ", "Welcome to Ss Seed Shop")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              {t(
                "আপনার গুগল অ্যাকাউন্ট (Gmail) দিয়ে এক ক্লিকে সহজে ও নিরাপদে লগইন করুন।",
                "Sign in securely with your Google Account (Gmail) in one click."
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 space-y-6">
          {/* Main Google Sign-In Container */}
          <div className="flex flex-col items-center justify-center min-h-[50px] py-2">
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-[#e41d56]" />
                <span>{t("লগইন হচ্ছে...", "Signing in...")}</span>
              </div>
            ) : (
              <>
                {/* Official Google Identity Button Mount Point */}
                <div id="google-login-button-container" ref={googleBtnRef} className="w-full flex justify-center" />

                {/* Fallback button if Google script is taking time to initialize */}
                {!googleScriptReady && (
                  <button
                    type="button"
                    disabled
                    className="w-[320px] h-[44px] flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white shadow-sm text-sm font-medium text-gray-700 cursor-not-allowed opacity-80"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t("গুগল লোড হচ্ছে...", "Loading Google...")}</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Clean Trust Assurance Badges */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("১০০% নিরাপদ ও সুরক্ষিত গুগল ভেরিফাইড একাউন্ট", "100% secure Google verified account")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t("পাসওয়ার্ড বা ওটিপি-এর কোনো ঝামেলা নেই", "No password or OTP hassle required")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <PackageCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{t("এক ক্লিকে অর্ডার ও ডেলিভারি ট্র্যাক করুন", "Track orders and delivery in one click")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
