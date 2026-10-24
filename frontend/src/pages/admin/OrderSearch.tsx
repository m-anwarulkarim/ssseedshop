import { API_URL } from "@/config/env";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Loader2, Package, X, FileText, Phone, User, Pencil,
  Globe, Fingerprint, ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

const HISTORY_KEY = "order-search-history";
const MAX_HISTORY = 200;

interface SearchHistoryItem {
  query: string;
  type: "invoice" | "number" | "name" | "ip" | "fingerprint";
  timestamp: number;
}

function getHistory(): SearchHistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function addToHistory(query: string, type: SearchHistoryItem["type"]) {
  const history = getHistory().filter(h => !(h.query === query && h.type === type));
  history.unshift({ query, type, timestamp: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
function removeFromHistory(index: number) {
  const history = getHistory();
  history.splice(index, 1);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  returned: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  entry_done: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  printed: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function OrderSearch() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>(getHistory);
  const [showHistory, setShowHistory] = useState(true);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [quickResult, setQuickResult] = useState<any[] | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const quickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runQuickSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) { setQuickResult(null); return; }
    setQuickLoading(true);
    try {
      const url = API_URL;
      const res = await fetch(`${url}/orders/get.php`);
      let data = await res.json();
      const s = trimmed.toLowerCase();
      data = data.filter((o: any) => 
        (o.order_id && o.order_id.toLowerCase().includes(s)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(s)) ||
        (o.phone && o.phone.toLowerCase().includes(s)) ||
        (o.alt_phone && o.alt_phone.toLowerCase().includes(s))
      );
      
      data = data.map((o: any) => ({
        ...o,
        order_items: (o.items || []).map((i: any) => ({
          ...i,
          products: { product_image: i.product_image }
        }))
      }));
      
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setQuickResult(data.slice(0, 50));
      setActiveSearch(trimmed);
      setShowHistory(false);
    } finally {
      setQuickLoading(false);
    }
  }, []);

  const handleSearch = () => {
    const trimmed = search.trim();
    if (trimmed.length < 2) return;
    if (quickTimerRef.current) clearTimeout(quickTimerRef.current);
    runQuickSearch(trimmed);

    const type: SearchHistoryItem["type"] = trimmed.startsWith("fp_")
      ? "fingerprint"
      : /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed) ? "ip"
      : /^\d{11}$/.test(trimmed) ? "number"
      : /^\d+$/.test(trimmed) ? "invoice" : "name";
    addToHistory(trimmed, type);
    setHistory(getHistory());
  };

  const quickSearch = (value: string) => {
    setSearch(value);
    runQuickSearch(value);
    addToHistory(value, value.startsWith("fp_") ? "fingerprint" : /^\d{11}$/.test(value) ? "number" : "name");
    setHistory(getHistory());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (value: string) => {
    setSearch(value);
    setShowHistory(true);
    if (quickTimerRef.current) clearTimeout(quickTimerRef.current);
    if (value.trim().length >= 2) {
      quickTimerRef.current = setTimeout(() => runQuickSearch(value), 400);
    } else {
      setQuickResult(null);
      setActiveSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (quickTimerRef.current) clearTimeout(quickTimerRef.current);
      runQuickSearch(search);
    }
  };

  const historyIcon = (type: string) => {
    if (type === "number") return <Phone className="w-3.5 h-3.5" />;
    if (type === "name") return <User className="w-3.5 h-3.5" />;
    if (type === "ip") return <Globe className="w-3.5 h-3.5" />;
    if (type === "fingerprint") return <Fingerprint className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  const historyColor = (type: string) => {
    if (type === "number") return "bg-blue-500/10 text-blue-500";
    if (type === "name") return "bg-green-500/10 text-green-500";
    if (type === "ip") return "bg-purple-500/10 text-purple-500";
    if (type === "fingerprint") return "bg-rose-500/10 text-rose-500";
    return "bg-amber-500/10 text-amber-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 space-y-2 sticky top-0 z-10 bg-card border-b border-border rounded-t-lg">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder={t("ইনভয়েস, নম্বর, নাম দিয়ে সার্চ করুন...", "Search by invoice, number, name...")}
                className="pl-9"
                value={search}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => !activeSearch && setShowHistory(true)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} disabled={search.trim().length < 2 || quickLoading}>
              {quickLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
              {t("সার্চ", "Search")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("টাইপ করলেই সার্চ হবে", "Search starts as you type")}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {showHistory && !activeSearch && history.length > 0 && (
            <div className="border-t border-border">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("সাম্প্রতিক সার্চ", "Recent Searches")}
                </span>
                <button
                  onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                  className="text-xs text-destructive hover:underline"
                >
                  {t("সব মুছুন", "Clear all")}
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {history.map((item, i) => (
                  <div
                    key={`${item.query}-${item.timestamp}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 cursor-pointer group transition-colors"
                    onClick={() => { setSearch(item.query); setActiveSearch(item.query); setShowHistory(false); runQuickSearch(item.query); }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${historyColor(item.type)}`}>
                      {historyIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.query}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(i); setHistory(getHistory()); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeSearch && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mb-3 opacity-40" />
              <p>{t("সার্চ করতে টাইপ করুন", "Type to search")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {quickResult && !quickLoading && (
        <>
          {quickResult.length === 0 ? (
            <Card>
              <CardContent className="py-8 flex flex-col items-center text-muted-foreground gap-3">
                <Package className="w-10 h-10 opacity-40" />
                <p className="text-sm">{t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">{t("অর্ডার", "Orders")} ({quickResult.length})</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("ইনভয়েস", "Invoice")}</TableHead>
                      <TableHead>{t("কাস্টমার", "Customer")}</TableHead>
                      <TableHead>{t("ফোন", "Phone")}</TableHead>
                      <TableHead>{t("পণ্য", "Products")}</TableHead>
                      <TableHead className="text-right">{t("মোট", "Total")}</TableHead>
                      <TableHead>{t("স্ট্যাটাস", "Status")}</TableHead>
                      <TableHead>{t("তারিখ", "Date")}</TableHead>
                      <TableHead className="text-right">{t("অ্যাকশন", "Action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quickResult.map((order: any) => {
                      const items: any[] = order.order_items || [];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-bold text-primary whitespace-nowrap">{order.order_id}</TableCell>
                          <TableCell className="font-medium max-w-[120px] truncate">{order.customer_name}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="text-sm cursor-pointer text-primary hover:underline" onClick={() => quickSearch(order.phone)}>
                                {order.phone}
                              </p>
                              {order.alt_phone && (
                                <p className="text-xs text-muted-foreground cursor-pointer hover:text-primary hover:underline" onClick={() => quickSearch(order.alt_phone)}>
                                  {order.alt_phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {items.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {items.slice(0, 2).map((item: any) => {
                                  const img = item.product_image || item.products?.product_image;
                                  return img ? (
                                    <img key={item.id} src={img} alt="" className="w-7 h-7 rounded object-cover border border-border" />
                                  ) : (
                                    <div key={item.id} className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                                      <Package className="w-3 h-3" />
                                    </div>
                                  );
                                })}
                                {items.length > 2 && <span className="text-xs text-muted-foreground">+{items.length - 2}</span>}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">৳{order.total_amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[order.status] || ""}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {format(new Date(order.created_at), "dd/MM/yy HH:mm")}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/orders/edit/${order.order_id}`)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {quickLoading && !quickResult && (
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
