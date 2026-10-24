import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const STEPS = [
  { threshold: 0, charge: 120, labelBn: "৳120", labelEn: "৳120" },
  { threshold: 200, charge: 70, labelBn: "৳70", labelEn: "৳70" },
  { threshold: 400, charge: 50, labelBn: "৳50", labelEn: "৳50" },
  { threshold: 600, charge: 0, labelBn: "ফ্রি", labelEn: "Free" },
];

interface DeliveryProgressBarProps {
  totalPrice: number;
}

export default function DeliveryProgressBar({ totalPrice }: DeliveryProgressBarProps) {
  const { t } = useLanguage();
  const maxThreshold = STEPS[STEPS.length - 1].threshold;
  const clampedPrice = Math.min(totalPrice, maxThreshold);
  const progressPercent = (clampedPrice / maxThreshold) * 100;

  let currentStepIndex = 0;
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (totalPrice >= STEPS[i].threshold) {
      currentStepIndex = i;
      break;
    }
  }

  const nextStep = currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1] : null;
  const remaining = nextStep ? nextStep.threshold - totalPrice : 0;

  return (
    <div className="space-y-1.5">
      <div className="text-center">
        {nextStep && remaining > 0 ? (
          <p className="text-xs font-medium text-muted-foreground">
            {t(
              <>আর <span className="font-bold text-primary">{remaining} টাকার</span> অর্ডার করলে ডেলিভারি চার্জ{" "}<span className="font-bold text-primary">{nextStep.charge === 0 ? "ফ্রি" : `${nextStep.charge} টাকা`}</span> হবে</>,
              <>Order <span className="font-bold text-primary">৳{remaining}</span> more for delivery charge of{" "}<span className="font-bold text-primary">{nextStep.charge === 0 ? "Free" : `৳${nextStep.charge}`}</span></>
            )}
          </p>
        ) : totalPrice >= maxThreshold ? (
          <p className="text-[11px] font-bold text-primary">
            {t("🎉 ফ্রি ডেলিভারি আনলক হয়েছে!", "🎉 Free delivery unlocked!")}
          </p>
        ) : null}
      </div>

      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPercent}%`,
            background: totalPrice >= maxThreshold
              ? "hsl(var(--primary))"
              : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="h-full w-[60%] absolute animate-[shimmer_2s_ease-in-out_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              }}
            />
          </div>
        </div>

        {STEPS.map((step, i) => {
          if (i === 0) return null;
          const pos = (step.threshold / maxThreshold) * 100;
          const reached = totalPrice >= step.threshold;
          return (
            <div
              key={step.threshold}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-background transition-colors duration-500 z-10",
                reached ? "bg-primary" : "bg-muted-foreground/30"
              )}
              style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] font-semibold px-0.5">
        {STEPS.map((step) => {
          const reached = totalPrice >= step.threshold;
          return (
            <span
              key={step.threshold}
              className={cn(
                "transition-colors duration-300",
                reached ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              {t(step.labelBn, step.labelEn)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
