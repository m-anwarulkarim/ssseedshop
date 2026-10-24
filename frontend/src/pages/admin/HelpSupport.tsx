import React, { useState, useMemo } from "react";
import {
  Headphones, PhoneCall, Mail, MessageSquare, Send, Copy, ExternalLink,
  Check, CheckCircle2, ShieldCheck, Clock, Sparkles, RefreshCw, FileText,
  LifeBuoy, Settings, Trash2, Monitor, CheckCheck, HelpCircle, AlertCircle,
  ArrowUpRight, ArrowRight, Zap, CheckCircle, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CURRENT_VERSION, RELEASES } from "@/data/releases";
import { cn } from "@/lib/utils";

interface DeveloperContactConfig {
  developerName: string;
  agencyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportHours: string;
  notes: string;
}

const DEFAULT_CONFIG: DeveloperContactConfig = {
  developerName: "HaqPlus IT Team",
  agencyName: "HaqPlus IT",
  phone: "01560007230",
  whatsapp: "8801560007230",
  email: "dev.anwarul@gmail.com",
  supportHours: "সকাল ৯:০০ – রাত ১১:০০ (জরুরি প্রয়োজনে ২৪/৭)",
  notes: "Ss Seed Shop এর অফিসিয়াল টেকনিক্যাল পার্টনার",
};

interface SupportTicket {
  id: string;
  createdAt: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  referenceId?: string;
  status: "pending" | "resolved";
  adminEmail: string;
  systemDiagnostics: {
    browser: string;
    os: string;
    screen: string;
    version: string;
    url: string;
  };
}

const CATEGORIES = [
  { value: "orders", labelBn: "অর্ডার ও ডেলিভারি সংক্রান্ত সমস্যা", labelEn: "Orders & Delivery" },
  { value: "fraud", labelBn: "ফ্রড চেকার বা কুরিয়ার API সমস্যা", labelEn: "Fraud Checker & Courier API" },
  { value: "invoice", labelBn: "ইনভয়েস ও প্রিন্টার ফরম্যাট সমস্যা", labelEn: "Invoices & Printing" },
  { value: "users", labelBn: "অ্যাডমিন ইউজার ও পারমিশন কন্ট্রোল", labelEn: "Admin & Permissions" },
  { value: "products", labelBn: "প্রোডাক্ট, স্টক ও ক্যাটাগরি ম্যানেজমেন্ট", labelEn: "Products & Stock" },
  { value: "website", labelBn: "ওয়েবসাইট ব্যানার বা ডিজাইন সমস্যা", labelEn: "Website Banner & UI" },
  { value: "sms", labelBn: "এসএমএস বা নোটিফিকেশন ইস্যু", labelEn: "SMS & Notifications" },
  { value: "bug", labelBn: "সিস্টেম এরর বা বাগ রিপোর্ট", labelEn: "System Error / Bug" },
  { value: "feature", labelBn: "নতুন ফিচার বা পরিবর্তন রিকোয়েস্ট", labelEn: "Feature Request" },
  { value: "other", labelBn: "অন্যান্য কারিগরি সহায়তা", labelEn: "Other Inquiries" },
];

const PRIORITIES = [
  {
    value: "low" as const,
    labelBn: "সাধারণ",
    labelEn: "Low",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
    dotClass: "bg-slate-400",
  },
  {
    value: "medium" as const,
    labelBn: "মিডিয়াম",
    labelEn: "Medium",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200",
    dotClass: "bg-blue-500",
  },
  {
    value: "high" as const,
    labelBn: "জরুরি",
    labelEn: "High",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200",
    dotClass: "bg-amber-500",
  },
  {
    value: "critical" as const,
    labelBn: "অতীব জরুরি",
    labelEn: "Critical",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200",
    dotClass: "bg-rose-500",
  },
];

export default function HelpSupport() {
  const { t } = useLanguage();
  const currentRelease = RELEASES[0];

  // Developer contacts are fixed & permanent
  const config = DEFAULT_CONFIG;

  // Tickets stored in localStorage
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem("admin_support_tickets");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Ticket Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("orders");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState("ticket");

  // Get active admin user from session
  const adminEmail = useMemo(() => {
    try {
      const session = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.email || "ssseedshop220@gmail.com";
      }
    } catch {}
    return "ssseedshop220@gmail.com";
  }, []);

  // System Diagnostics auto-capture
  const diagnostics = useMemo(() => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let browser = "Google Chrome";
    if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) browser = "Apple Safari";
    else if (userAgent.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
    else if (userAgent.indexOf("Edge") > -1) browser = "Microsoft Edge";

    let os = "Windows";
    if (userAgent.indexOf("Mac") > -1) os = "macOS";
    else if (userAgent.indexOf("Android") > -1) os = "Android";
    else if (userAgent.indexOf("Linux") > -1) os = "Linux";

    return {
      browser,
      os,
      screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "1920x1080",
      version: CURRENT_VERSION,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
  }, []);

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t(`${label} কপি হয়েছে!`, `${label} copied to clipboard!`));
  };

  // Construct Formatted Ticket Text
  const generateTicketPayload = (ticketId: string) => {
    const catLabel = CATEGORIES.find(c => c.value === category)?.labelBn || category;
    const prioObj = PRIORITIES.find(p => p.value === priority);
    const prioLabel = prioObj ? prioObj.labelBn : priority;

    let text = `*🚨 [Ss Seed Shop Support Ticket #${ticketId}]*\n`;
    text += `*বিষয়:* ${subject || "কারিগরি সহায়তা"}\n`;
    text += `*ক্যাটাগরি:* ${catLabel}\n`;
    text += `*জরুরিত্ব:* ${prioLabel}\n`;
    if (referenceId) {
      text += `*রেফারেন্স/অর্ডার আইডি:* ${referenceId}\n`;
    }
    text += `*প্রেরক অ্যাডমিন:* ${adminEmail}\n`;
    text += `*তারিখ:* ${new Date().toLocaleString("bn-BD")}\n\n`;
    text += `*সমস্যার বিবরণ:*\n${description || "বিস্তারিত বিবরণ দেওয়া হয়নি।"}\n\n`;

    if (includeDiagnostics) {
      text += `*সিস্টেম ডায়াগনস্টিকস:*\n`;
      text += `• ভার্সন: v${diagnostics.version}\n`;
      text += `• ব্রাউজার ও ওএস: ${diagnostics.browser} (${diagnostics.os})\n`;
      text += `• স্ক্রিন সাইজ: ${diagnostics.screen}\n`;
      text += `• পেজ URL: ${diagnostics.url}\n`;
    }

    return text;
  };

  // Save ticket to local history
  const saveTicketToHistory = (ticketId: string) => {
    const newTicket: SupportTicket = {
      id: ticketId,
      createdAt: new Date().toISOString(),
      subject: subject || "সহায়তা অনুসন্ধান",
      category,
      priority,
      description,
      referenceId: referenceId || undefined,
      status: "pending",
      adminEmail,
      systemDiagnostics: diagnostics,
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem("admin_support_tickets", JSON.stringify(updated));
  };

  // Direct WhatsApp Launch
  const handleSendWhatsApp = (customText?: string) => {
    const cleanPhone = config.whatsapp.replace(/[^0-9]/g, "");
    let textToSend = customText;
    
    if (!textToSend) {
      if (!subject && !description) {
        textToSend = `Hello ${config.developerName}! Ss Seed Shop অ্যাডমিন প্যানেল থেকে বলছি। আমার একটি কারিগরি সহায়তা প্রয়োজন।`;
      } else {
        const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        textToSend = generateTicketPayload(ticketId);
        saveTicketToHistory(ticketId);
      }
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(waUrl, "_blank");
    toast.success(t("WhatsApp-এ পাঠানো হচ্ছে...", "Redirecting to WhatsApp..."));
  };

  // Direct Gmail Web Compose Launch
  const handleSendGmail = () => {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketBody = generateTicketPayload(ticketId);
    saveTicketToHistory(ticketId);

    const emailSubject = `[Ss Seed Shop Ticket #${ticketId}] [${priority.toUpperCase()}] ${subject || "সাপোর্ট রিকোয়েস্ট"}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(config.email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(ticketBody)}`;
    
    window.open(gmailUrl, "_blank");
    toast.success(t("Gmail কম্পোজার ওপেন হচ্ছে...", "Opening Gmail web composer..."));
  };

  // Copy Full Ticket
  const handleCopyTicket = () => {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketBody = generateTicketPayload(ticketId);
    copyToClipboard(ticketBody, "সম্পূর্ণ টিকিট টেক্সট");
    saveTicketToHistory(ticketId);
  };

  // Mark ticket as resolved
  const toggleTicketStatus = (id: string) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, status: (t.status === "pending" ? "resolved" : "pending") as "pending" | "resolved" } : t
    );
    setTickets(updated);
    localStorage.setItem("admin_support_tickets", JSON.stringify(updated));
    toast.success(t("টিকিট স্ট্যাটাস পরিবর্তন হয়েছে", "Ticket status updated"));
  };

  // Delete ticket
  const handleDeleteTicket = (id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
    localStorage.setItem("admin_support_tickets", JSON.stringify(updated));
    toast.success(t("টিকিট মুছে ফেলা হয়েছে", "Ticket removed"));
  };

  // Clear system cache & soft reload safely
  const handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem("admin_sidebar_counts");
      sessionStorage.removeItem("temp_support_cache");
      sessionStorage.removeItem("admin_diagnostics");
      toast.info(t("ক্যাশ ক্লিয়ার হচ্ছে...", "Clearing cache..."));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Hero Header Banner — Premium SaaS Dark-Indigo Mesh Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-9 shadow-2xl border border-slate-800">
        
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t("ডেভেলপার টিম অনলাইন • ১৫ মিনিটে রেসপন্স", "Developer Team Online • 15m Response")}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display">
              {t("হেল্প ও টেকনিক্যাল সাপোর্ট হাব", "Help & Technical Support Hub")}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {t(
                "Ss Seed Shop অ্যাডমিন প্যানেল ও স্টোরের যেকোনো সমস্যা, বাগ বা নতুন ফিচারের প্রয়োজনে সরাসরি ডেভেলপারের সাথে কানেক্ট হোন।",
                "Instant developer assistance for bug reports, store management, courier APIs, and technical optimizations."
              )}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Ss Seed Shop Core</p>
              <p className="text-sm font-bold font-mono text-white">v{CURRENT_VERSION}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Interactive Contact Cards — High-End Cards with Subtle Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: WhatsApp Support */}
        <div className="group relative rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.04] via-card to-card hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {t("তাৎক্ষণিক চ্যাট", "Fastest")}
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                WhatsApp সাপোর্ট
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                সরাসরি মেসেজ দিন, এররের স্ক্রিনশট ও বিবরণ পাঠান
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs">
              <span className="font-mono font-bold text-foreground tracking-wide text-sm">
                +{config.whatsapp}
              </span>
              <button
                onClick={() => copyToClipboard(config.whatsapp, "WhatsApp নম্বর")}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-background transition-colors"
                title="কপি করুন"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={() => handleSendWhatsApp()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs h-10 font-bold rounded-xl gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t("WhatsApp চ্যাট শুরু করুন", "Open WhatsApp Chat")}</span>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-70" />
          </Button>
        </div>

        {/* Card 2: Phone Hotline */}
        <div className="group relative rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.04] via-card to-card hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {t("জরুরি ফোন কল", "Direct Hotline")}
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                সরাসরি ফোন হটলাইন
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                জরুরি প্রয়োজনে টেকনিক্যাল ডেভেলপারের সাথে সরাসরি কথা বলুন
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs">
              <span className="font-mono font-bold text-foreground tracking-wide text-sm">
                {config.phone}
              </span>
              <button
                onClick={() => copyToClipboard(config.phone, "ফোন নম্বর")}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-background transition-colors"
                title="কপি করুন"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <a
            href={`tel:${config.phone.replace(/[^0-9+]/g, "")}`}
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs h-10 font-bold rounded-xl gap-2 shadow-md shadow-blue-600/25 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t("এখনই কল দিন", "Call Hotline Now")}</span>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-70" />
          </a>
        </div>

        {/* Card 3: Gmail Support */}
        <div className="group relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.04] via-card to-card hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {t("অফিশিয়াল সাপোর্ট", "Email Ticket")}
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                Gmail / ইমেইল টিকিট
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                বিস্তারিত বিবরণ সহ ফর্মাল টেকনিক্যাল রিকোয়েস্ট পাঠান
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs">
              <span className="font-mono font-medium text-foreground truncate pr-1 text-xs">
                {config.email}
              </span>
              <button
                onClick={() => copyToClipboard(config.email, "ইমেইল")}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-background transition-colors shrink-0"
                title="কপি করুন"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleSendGmail}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs h-10 font-bold rounded-xl gap-2 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>{t("Gmail কম্পোজার খুলুন", "Compose Gmail Ticket")}</span>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-70" />
          </Button>
        </div>

      </div>

      {/* 3. Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Ticket Studio, History & Release Notes */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            
            {/* Pill Tab Selector */}
            <TabsList className="bg-muted/60 p-1.5 border border-border/70 rounded-2xl grid grid-cols-3 gap-1.5 h-auto shadow-xs">
              <TabsTrigger
                value="ticket"
                className="text-xs py-2.5 rounded-xl font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t("নতুন টিকিট", "New Ticket")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs py-2.5 rounded-xl font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("টিকিট হিস্ট্রি", "My Tickets")}</span>
                {tickets.length > 0 && (
                  <Badge className="h-4 min-w-[16px] px-1 text-[10px] ml-1 bg-indigo-500 text-white rounded-full">
                    {tickets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="updates"
                className="text-xs py-2.5 rounded-xl font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{t("রিলিজ নোটস", "Changelog")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Support Ticket Studio */}
            <TabsContent value="ticket" className="m-0">
              <div className="rounded-3xl border border-border/80 bg-card shadow-sm p-6 sm:p-7 space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {t("কারিগরি সহায়তা টিকিট প্রস্তুত করুন", "Compose Support Ticket")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(
                        "সমস্যার বিবরণ লিখুন এবং WhatsApp বা Gmail-এ ১-ক্লিকে পাঠিয়ে দিন",
                        "Describe your issue and send directly to the developers"
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono text-muted-foreground bg-muted/40 px-2.5 py-1">
                    {adminEmail}
                  </Badge>
                </div>

                <div className="space-y-5">
                  
                  {/* Subject Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{t("সমস্যার শিরোনাম / বিষয় (Subject)", "Subject / Title")}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="যেমন: অর্ডারের স্ট্যাটাস পরিবর্তন হচ্ছে না / ফ্রড চেকার লোড হচ্ছে না..."
                      className="h-10 text-xs rounded-xl border-border/80 focus-visible:ring-emerald-500/20"
                    />
                  </div>

                  {/* Priority Selector — Visual Clickable Pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>{t("অগ্রাধিকার স্তর (Priority)", "Select Priority")}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">সমস্যার জরুরি অবস্থা অনুযায়ী নির্বাচন করুন</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRIORITIES.map((p) => {
                        const isSelected = priority === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value)}
                            className={cn(
                              "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                              isSelected
                                ? cn(p.badgeClass, "ring-2 ring-primary/20 shadow-xs font-bold")
                                : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full shrink-0", p.dotClass)} />
                            <span>{p.labelBn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>{t("সমস্যার বিভাগ (Category)", "Category")}</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-10 text-xs rounded-xl border-border/80">
                          <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="text-xs py-2">
                              {cat.labelBn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>{t("রেফারেন্স আইডি (ঐচ্ছিক)", "Reference ID")}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">অর্ডার #, ফোন নং</span>
                      </label>
                      <Input
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        placeholder="যেমন: অর্ডার #55380 অথবা কাস্টমার মোবাইল নম্বর..."
                        className="h-10 text-xs rounded-xl border-border/80"
                      />
                    </div>
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{t("সমস্যার বিস্তারিত বিবরণ (Description)", "Description")}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="কোথায় কী সমস্যা হচ্ছে, কোন পেজে বা কী এরর মেসেজ দেখাচ্ছে বিস্তারিত লিখুন..."
                      rows={4}
                      className="text-xs leading-relaxed resize-y rounded-xl border-border/80"
                    />
                  </div>

                  {/* High-Tech Diagnostic Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-muted/30 text-xs">
                    <div className="flex items-center gap-2.5 text-muted-foreground truncate">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="truncate text-xs font-mono text-foreground font-medium">
                        Ss Seed Shop v{diagnostics.version} • {diagnostics.browser} ({diagnostics.os})
                      </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none shrink-0 font-medium">
                      <input
                        type="checkbox"
                        checked={includeDiagnostics}
                        onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                        className="rounded accent-emerald-600 w-4 h-4"
                      />
                      <span>{t("টিকেটে ডায়াগনস্টিক তথ্য যুক্ত রাখুন", "Include system info")}</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      onClick={() => handleSendWhatsApp()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 !text-white font-bold text-xs h-11 rounded-xl gap-2 flex-1 shadow-md shadow-emerald-600/25 border-0 transition-all [&_svg]:!text-white [&_span]:!text-white"
                    >
                      <MessageSquare className="w-4 h-4 !text-white shrink-0" />
                      <span className="!text-white">{t("WhatsApp-এ পাঠান", "Send via WhatsApp")}</span>
                    </Button>

                    <Button
                      onClick={handleSendGmail}
                      className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 !text-white font-bold text-xs h-11 rounded-xl gap-2 flex-1 shadow-md shadow-rose-600/25 border-0 transition-all [&_svg]:!text-white [&_span]:!text-white"
                    >
                      <Mail className="w-4 h-4 !text-white shrink-0" />
                      <span className="!text-white">{t("Gmail-এ পাঠান", "Send via Gmail")}</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCopyTicket}
                      className="text-xs h-11 px-4 rounded-xl gap-2 hover:bg-muted font-semibold border-border/80 shadow-sm"
                    >
                      <Copy className="w-4 h-4 shrink-0" />
                      <span>{t("কপি", "Copy")}</span>
                    </Button>
                  </div>

                </div>

              </div>
            </TabsContent>

            {/* TAB 2: Support Ticket History */}
            <TabsContent value="history" className="m-0">
              <div className="rounded-3xl border border-border/80 bg-card shadow-sm p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {t("পূর্বে প্রস্তুতকৃত সাপোর্ট টিকিটসমূহ", "Support Ticket History")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("আপনার প্রেরিত টিকিটগুলোর স্থানীয় রেকর্ড ও স্ট্যাটাস", "Local records of previously generated requests")}
                    </p>
                  </div>
                  {tickets.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("আপনি কি নিশ্চিতভাবে সব টিকিট হিস্ট্রি মুছে ফেলতে চান?")) {
                          setTickets([]);
                          localStorage.removeItem("admin_support_tickets");
                          toast.success("সব টিকিট মুছে ফেলা হয়েছে");
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      ক্লিয়ার
                    </Button>
                  )}
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold">কোনো আগের টিকিট রেকর্ড নেই</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      নতুন কোনো সমস্যা বা বাগ তৈরি হলে "নতুন টিকিট" ট্যাব থেকে পাঠিয়ে দিন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {tickets.map((tkt) => {
                      const isPending = tkt.status === "pending";
                      return (
                        <div
                          key={tkt.id}
                          className="p-4 rounded-2xl border border-border/80 bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md">
                                #{tkt.id}
                              </span>
                              <span className="font-bold text-foreground text-sm">
                                {tkt.subject}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isPending ? "outline" : "secondary"}
                                className={cn(
                                  "text-[10px] py-0.5 px-2 rounded-full font-semibold",
                                  isPending ? "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                )}
                              >
                                {isPending ? "পেন্ডিং (Pending)" : "সমাধান হয়েছে"}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {new Date(tkt.createdAt).toLocaleDateString("bn-BD", {
                                  day: "numeric", month: "short"
                                })}
                              </span>
                            </div>
                          </div>

                          {tkt.description && (
                            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/40 font-mono">
                              {tkt.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1 gap-2 border-t border-border/40">
                            <span className="text-[11px] text-muted-foreground font-medium">
                              বিভাগ: <b>{CATEGORIES.find(c => c.value === tkt.category)?.labelBn || tkt.category}</b>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const waUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                                    `[Ticket #${tkt.id} ফলোআপ]\nবিষয়: ${tkt.subject}\nবিবরণ: ${tkt.description}`
                                  )}`;
                                  window.open(waUrl, "_blank");
                                }}
                                className="h-7 text-[11px] px-2.5 text-emerald-600 hover:text-emerald-700 rounded-lg gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                WhatsApp
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleTicketStatus(tkt.id)}
                                className="h-7 text-[11px] px-2.5 text-muted-foreground rounded-lg"
                              >
                                {isPending ? "মার্ক সমাধান" : "পুনরায় ওপেন"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTicket(tkt.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Release Notes */}
            <TabsContent value="updates" className="m-0">
              <div className="rounded-3xl border border-border/80 bg-card shadow-sm p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {t("ভার্সন আপডেট ও পরিবর্তনসমূহ", "System Release Notes")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("Ss Seed Shop প্যানেলের সাম্প্রতিক ফিচার আপডেট ও ফিক্স লগ", "Changelog and recent system improvements")}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                    v{currentRelease.version}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {RELEASES.map((rel) => (
                    <div key={rel.version} className="p-4 rounded-2xl border border-border/70 bg-card space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="font-mono font-bold text-sm text-foreground">v{rel.version}</span>
                        <span className="text-xs text-muted-foreground">{rel.date}</span>
                      </div>
                      <ul className="space-y-2">
                        {rel.changes.map((c, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-foreground/90 font-medium leading-relaxed">{t(c.bn, c.en)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Right Sidebar (5 cols): Quick Tools & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Fast System Cache Purge Tool */}
          <div className="p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] via-card to-card space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("সিস্টেম ক্যাশ ক্লিয়ার", "Clear System Cache")}
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200">
                এক-ক্লিক ফিক্স
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              কোনো পেজে পুরানো ডাটা আটকে থাকলে বা বাটন রেসপন্স না করলে এক ক্লিকে ব্রাউজার ক্যাশ ক্লিয়ার করে রিলোড নিন।
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCacheAndReload}
              className="w-full text-xs h-9 gap-2 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200 rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t("ক্যাশ ক্লিয়ার ও সফট রিলোড", "Purge Cache & Reload")}</span>
            </Button>
          </div>

          {/* Card 2: Interactive Troubleshooting FAQs */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("সাধারণ প্রশ্নোত্তর ও সমাধান", "Troubleshooting & FAQs")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">সবচেয়ে সাধারণ সমস্যাগুলোর তাৎক্ষণিক সমাধান</p>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
              
              <AccordionItem value="faq-1" className="border border-border/70 rounded-2xl px-3.5 py-0.5">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5 text-left">
                  ১. অর্ডারের স্ট্যাটাস পরিবর্তন না হলে কী করবেন?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3 space-y-1.5">
                  <p>• ইন্টারনেট সংযোগ সক্রিয় আছে কিনা নিশ্চিত করুন।</p>
                  <p>• কীবোর্ডে <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Ctrl + Shift + R</kbd> চেপে পেজে হার্ড রিফ্রেশ দিন।</p>
                  <p>• প্রয়োজনে উপরের <b>"ক্যাশ ক্লিয়ার ও সফট রিলোড"</b> বাটনে চাপুন।</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border border-border/70 rounded-2xl px-3.5 py-0.5">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5 text-left">
                  ২. ফ্রড চেকার রিপোর্ট লোড না হলে করণীয়?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3 space-y-1.5">
                  <p>• কাস্টমারের ফোন নম্বরটি ১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর কিনা দেখে নিন।</p>
                  <p>• কুরিয়ার সার্ভার ধীরগতির কারণে মাঝে মাঝে ১-২ সেকেন্ড সময় লাগতে পারে; পুনরায় ক্লিক করুন।</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border border-border/70 rounded-2xl px-3.5 py-0.5">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5 text-left">
                  ৩. ইনভয়েস প্রিন্ট করার সময় মার্জিন সমস্যা?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3 space-y-1.5">
                  <p>• প্রিন্ট উইন্ডোর "More settings"-এ গিয়ে <b>"Background graphics"</b> টিক দেওয়া নিশ্চিত করুন।</p>
                  <p>• কাগজের সাইজ A4 বা POS মোডে স্কেল ১০০% রাখুন।</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border border-border/70 rounded-2xl px-3.5 py-0.5">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5 text-left">
                  ৪. লাইভ রিমোট স্ক্রিন সাপোর্ট (AnyDesk)
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3 space-y-1.5">
                  <p>• জটিল সমস্যা সমাধানের জন্য WhatsApp-এ আপনার AnyDesk আইডি মেসেজ দিন।</p>
                  <p>• ডেভেলপার দল সরাসরি লাইভ স্ক্রিন দেখে সমস্যার সমাধান করে দেবে।</p>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          {/* Card 3: Certified Tech Partner Seal */}
          <div className="p-5 rounded-3xl border border-border/80 bg-muted/20 space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-foreground font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{config.agencyName}</span>
              <Badge className="ml-auto bg-emerald-500 text-white text-[10px] py-0 px-2 rounded-full">
                Verified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.notes}
            </p>
            <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2 border-t border-border/40 font-medium">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{config.supportHours}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
