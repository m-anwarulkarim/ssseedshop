import React from "react";

interface DevelopedByHaqPlusProps {
  className?: string;
  siteName?: string;
  theme?: "light" | "dark" | "auto";
}

export const DevelopedByHaqPlus: React.FC<DevelopedByHaqPlusProps> = ({
  className = "",
  siteName = "Ss Seed Shop",
  theme = "light",
}) => {
  const whatsappNumber = "8801560007230";
  const message = `Hello HaqPlus IT! I saw ${siteName} website and want to build a project.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const isDark = theme === "dark";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Developed by haq plus it"
      title="Contact developer on WhatsApp"
      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none group shadow-sm ${
        isDark
          ? "bg-slate-900/90 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-emerald-500 hover:shadow-emerald-900/20"
          : "bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50/60 hover:border-emerald-400 hover:text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      } ${className}`}
    >
      {/* WhatsApp Tiny Brand Icon */}
      <svg
        className={`w-3.5 h-3.5 shrink-0 ${
          isDark ? "text-emerald-400" : "text-emerald-600"
        } group-hover:scale-110 transition-transform`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
      </svg>
      <span className={isDark ? "text-slate-300 font-medium" : "text-gray-600 font-medium"}>
        Developed by
      </span>
      <span
        className={`font-black tracking-wide ${
          isDark
            ? "text-emerald-400 group-hover:text-emerald-300"
            : "text-emerald-600 group-hover:text-emerald-700"
        }`}
      >
        haq plus it
      </span>
    </a>
  );
};

export default DevelopedByHaqPlus;
