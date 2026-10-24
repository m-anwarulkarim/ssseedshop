import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Phone, KeyRound, ArrowLeft, UserCircle, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

declare global {
  interface Window {
    google?: any;
  }
}

const CUSTOMER_SESSION_KEY = "customer-session";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "934384186684-5s17f4snee7neecq45h0ssmh26b57pbk.apps.googleusercontent.com";

async function callPhoneAuth(body: Record<string, any>) {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const res = await fetch(`${url}/customer/phone_auth.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

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

type Step = "phone" | "otp" | "password" | "set_password" | "reset_otp" | "reset_new_password";

interface Props {
  onLogin: (session: CustomerSession) => void;
}

export default function CustomerLogin({ onLogin }: Props) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [tempProfile, setTempProfile] = useState<any>(null);
  const [resetProfileId, setResetProfileId] = useState<string | null>(null);
  const [otpVerifyRemaining, setOtpVerifyRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ─── Google Sign-In Handler ───
  const handleGoogleResponse = async (response: any) => {
    if (!response?.credential) return;
    setGoogleLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/customer/google_auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data?.status === "success" && data?.session) {
        setCustomerSession(data.session);
        toast.success("Google দিয়ে সফলভাবে লগইন হয়েছে!");
        onLogin(data.session);
      } else {
        toast.error(data?.message || "Google লগইন ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Google সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (step !== "phone") return;

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
  }, [step]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 11) {
      toast.error("সঠিক ফোন নম্বর দিন");
      return;
    }

    setLoading(true);
    const data = await callPhoneAuth({ action: "check_phone", phone: trimmed });
    setLoading(false);

    if (data?.has_password) {
      setHasPassword(true);
      setProfileName(data.name);
      setStep("password");
    } else {
      setLoading(true);
      const otpRes = await callPhoneAuth({ action: "send_otp", phone: trimmed });
      setLoading(false);

      if (otpRes?.locked) {
        setIsLocked(true);
        toast.error(otpRes?.error || "অনেকবার চেষ্টা হয়েছে।");
        return;
      }

      if (otpRes?.success) {
        setOtpVerifyRemaining(3);
        setStep("otp");
        setCountdown(300);
        toast.success("OTP পাঠানো হয়েছে!");
      } else {
        toast.error(otpRes?.error || "OTP পাঠাতে সমস্যা হয়েছে");
      }
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    const data = await callPhoneAuth({ action: "password_login", phone: phone.trim(), password: password.trim() });
    setLoading(false);

    if (data?.locked) {
      setIsLocked(true);
      toast.error(data?.error);
      return;
    }

    if (data?.valid && data.profile) {
      const session: CustomerSession = {
        phone: phone.trim(),
        profile_id: data.profile.id,
        name: data.profile.name,
        phone_verified: true,
      };
      setCustomerSession(session);
      toast.success("সফলভাবে লগইন হয়েছে!");
      onLogin(session);
    } else {
      toast.error("পাসওয়ার্ড ভুল হয়েছে");
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 4 || loading) return;

    setLoading(true);
    const visitorId = localStorage.getItem("visitor-id");
    const data = await callPhoneAuth({ action: "verify_otp", phone: phone.trim(), otp_code: otpValue, visitor_id: visitorId });
    setLoading(false);

    if (data?.locked) {
      setIsLocked(true);
      toast.error(data?.error);
      return;
    }

    if (data?.valid && data.profile) {
      setTempProfile(data.profile);
      setStep("set_password");
    } else {
      const remaining = data?.remaining ?? 0;
      setOtpVerifyRemaining(remaining);
      if (data?.last_attempt) {
        toast.error("শেষ চেষ্টা! আবারও ব্যর্থ হলে আরও ১৫ মিনিট অপেক্ষা করুন অথবা কাস্টমার সাপোর্টে যোগাযোগ করুন।");
      } else {
        toast.error("OTP ভুল বা মেয়াদ শেষ");
      }
      setOtpValue("");
    }
  };

  const handleSetPassword = async (skip = false) => {
    if (!skip && newPassword.trim().length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (!skip) {
      setLoading(true);
      await callPhoneAuth({
        action: "set_password",
        phone: phone.trim(),
        password: newPassword.trim(),
        profile_id: tempProfile.id,
      });
      setLoading(false);
      toast.success("পাসওয়ার্ড সেট হয়েছে!");
    }

    const session: CustomerSession = {
      phone: phone.trim(),
      profile_id: tempProfile.id,
      name: tempProfile.name,
      phone_verified: true,
    };
    setCustomerSession(session);
    onLogin(session);
  };

  // ─── Forgot Password Flow ───
  const handleForgotPassword = async () => {
    setLoading(true);
    const data = await callPhoneAuth({ action: "reset_password_send_otp", phone: phone.trim() });
    setLoading(false);

    if (data?.locked) {
      setIsLocked(true);
      toast.error(data?.error);
      return;
    }

    if (data?.success) {
      setResetProfileId(data.profile_id);
      setOtpValue("");
      setOtpVerifyRemaining(3);
      setStep("reset_otp");
      setCountdown(300);
      toast.success("পাসওয়ার্ড রিসেটের জন্য OTP পাঠানো হয়েছে!");
    } else {
      toast.error(data?.error || "OTP পাঠাতে সমস্যা হয়েছে");
    }
  };

  const handleResetOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 4) return;
    setStep("reset_new_password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    const data = await callPhoneAuth({
      action: "reset_password_verify",
      phone: phone.trim(),
      otp_code: otpValue,
      new_password: newPassword.trim(),
    });

    if (data?.locked) {
      setLoading(false);
      setIsLocked(true);
      toast.error(data?.error);
      return;
    }

    if (data?.valid) {
      const loginData = await callPhoneAuth({ action: "password_login", phone: phone.trim(), password: newPassword.trim() });
      setLoading(false);

      if (loginData?.valid && loginData.profile) {
        const session: CustomerSession = {
          phone: phone.trim(),
          profile_id: loginData.profile.id,
          name: loginData.profile.name,
          phone_verified: true,
        };
        setCustomerSession(session);
        toast.success("পাসওয়ার্ড রিসেট হয়েছে ও লগইন সফল!");
        onLogin(session);
      } else {
        toast.success("পাসওয়ার্ড রিসেট হয়েছে! লগইন করুন।");
        setPassword("");
        setNewPassword("");
        setOtpValue("");
        setStep("password");
      }
    } else {
      setLoading(false);
      const remaining = data?.remaining ?? 0;
      setOtpVerifyRemaining(remaining);
      if (data?.last_attempt) {
        toast.error("শেষ চেষ্টা! আবারও ব্যর্থ হলে আরও ১৫ মিনিট অপেক্ষা করুন অথবা কাস্টমার সাপোর্টে যোগাযোগ করুন।");
      } else {
        toast.error(data?.error || "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে");
      }
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    const action = step === "reset_otp" ? "reset_password_send_otp" : "send_otp";
    const data = await callPhoneAuth({ action, phone: phone.trim() });
    setLoading(false);

    if (data?.locked) {
      setIsLocked(true);
      toast.error(data?.error);
      return;
    }

    if (data?.success) {
      setOtpVerifyRemaining(3);
      setCountdown(300);
      toast.success("নতুন OTP পাঠানো হয়েছে!");
    }
  };


  const formatCountdown = () => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTitle = () => {
    switch (step) {
      case "phone": return "লগইন করুন";
      case "password": return `স্বাগতম${profileName ? `, ${profileName}` : ""}!`;
      case "otp": return "OTP যাচাই";
      case "set_password": return "পাসওয়ার্ড সেট করুন";
      case "reset_otp": return "পাসওয়ার্ড রিসেট";
      case "reset_new_password": return "নতুন পাসওয়ার্ড";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "phone": return "আপনার ফোন নম্বর দিন";
      case "password": return "আপনার পাসওয়ার্ড দিন";
      case "otp": return `${phone} নম্বরে পাঠানো ৪ সংখ্যার কোড দিন`;
      case "set_password": return "পরবর্তী সময়ে দ্রুত লগইনের জন্য একটি পাসওয়ার্ড সেট করুন (ঐচ্ছিক)";
      case "reset_otp": return `${phone} নম্বরে পাঠানো ৪ সংখ্যার কোড দিন`;
      case "reset_new_password": return "আপনার নতুন পাসওয়ার্ড দিন";
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {(step === "reset_otp" || step === "reset_new_password") 
              ? <ShieldCheck className="w-6 h-6 text-primary" />
              : <UserCircle className="w-6 h-6 text-primary" />
            }
          </div>
          <CardTitle className="text-xl font-display">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">
                অ্যাকাউন্ট লক হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন অথবা কাস্টমার সাপোর্টে যোগাযোগ করুন: 01805080556
              </p>
            </div>
          )}

          {step === "phone" && (
            <div className="space-y-4">
              {/* Google Sign-In Section */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]">
                  {googleLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Google যাচাই করা হচ্ছে...
                    </div>
                  )}
                </div>
              </div>

              {/* Elegant Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">
                    অথবা মোবাইল নম্বর দিয়ে
                  </span>
                </div>
              </div>

              {/* Phone Submit Form */}
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                    disabled={isLocked}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || isLocked}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  পরবর্তী
                </Button>
              </form>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="পাসওয়ার্ড"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                  disabled={isLocked}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || isLocked}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                লগইন করুন
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm text-primary"
                onClick={handleForgotPassword}
                disabled={loading || isLocked}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                পাসওয়ার্ড ভুলে গেছেন?
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setStep("phone"); setPassword(""); setIsLocked(false); }}
              >
                <ArrowLeft className="w-4 h-4" /> অন্য নম্বর ব্যবহার করুন
              </Button>
            </form>
          )}

          {(step === "otp" || step === "reset_otp") && (
            <form onSubmit={step === "otp" ? handleOtpVerify : handleResetOtpVerify} className="space-y-5">
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={otpValue} onChange={setOtpValue} autoComplete="one-time-code">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {otpVerifyRemaining <= 1 && otpVerifyRemaining > 0 && !isLocked && (
                <p className="text-xs text-destructive flex items-center gap-1 justify-center">
                  <AlertTriangle className="w-3 h-3" />
                  শেষ চেষ্টা! ভুল হলে ১৫ মিনিট অপেক্ষা করতে হবে
                </p>
              )}

              <div className="text-center text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <span>মেয়াদ শেষ: {formatCountdown()}</span>
                ) : (
                  <button type="button" onClick={resendOtp} className="text-primary hover:underline" disabled={loading || isLocked}>
                    আবার OTP পাঠান
                  </button>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading || otpValue.length !== 4 || isLocked}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                যাচাই করুন
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { 
                setStep(step === "reset_otp" ? "password" : "phone"); 
                setOtpValue(""); 
                setIsLocked(false);
              }}>
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </Button>
            </form>
          )}

          {step === "reset_new_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                পাসওয়ার্ড রিসেট করুন
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { 
                setStep("password"); 
                setNewPassword(""); 
                setOtpValue(""); 
              }}>
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </Button>
            </form>
          )}

          {step === "set_password" && (
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button className="w-full" onClick={() => handleSetPassword(false)} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                পাসওয়ার্ড সেট করুন
              </Button>
              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => handleSetPassword(true)}>
                এখন নয়, পরে করবো
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
