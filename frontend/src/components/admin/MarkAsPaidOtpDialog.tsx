import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MarkAsPaidOtpDialog({
  open,
  onOpenChange,
  year,
  month,
  totalAmount,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  month: number;
  totalAmount: number;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"send" | "verify">("send");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const monthLabel = `${EN_MONTHS[month - 1]} ${year}`;

  const reset = () => { setStep("send"); setOtp(""); };

  const handleSendOtp = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("monthly-cost-otp", {
        body: { action: "send_otp", year, month, total_amount: totalAmount },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      // Debug log in browser console
      if ((data as any)?.debug_otp) {
        console.log(`%c[Monthly Cost OTP] ${monthLabel}: ${(data as any).debug_otp}`, "color: #16a34a; font-weight: bold; font-size: 14px;");
      }
      toast({ title: t("OTP পাঠানো হয়েছে", "OTP Sent"), description: t("অনুমোদিত নম্বরে চেক করুন", "Check the authorized number") });
      setStep("verify");
    } catch (e: any) {
      toast({ title: t("ত্রুটি", "Error"), description: e.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("monthly-cost-otp", {
        body: { action: "verify_otp", year, month, otp_code: otp },
      });
      if (error) throw error;
      if ((data as any)?.error || !(data as any)?.success) {
        throw new Error((data as any)?.error || "Invalid OTP");
      }
      toast({ title: t("পেইড মার্ক হয়েছে", "Marked as Paid") });
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast({ title: t("ভুল OTP", "Wrong OTP"), description: e.message, variant: "destructive" });
      setOtp("");
    } finally { setVerifying(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {t("OTP যাচাই", "OTP Verification")}
          </DialogTitle>
          <DialogDescription>
            {monthLabel} — ৳{totalAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {step === "send" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t(
                "একটি ৪ ডিজিটের OTP অনুমোদিত নম্বরে পাঠানো হবে।",
                "A 4-digit OTP will be sent to the authorized number."
              )}
            </p>
            <Button onClick={handleSendOtp} disabled={sending} className="w-full">
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {t("OTP পাঠান", "Send OTP")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendOtp} disabled={sending} className="flex-1">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("আবার পাঠান", "Resend")}
              </Button>
              <Button onClick={handleVerify} disabled={otp.length !== 4 || verifying} className="flex-1">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                {t("যাচাই", "Verify")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
