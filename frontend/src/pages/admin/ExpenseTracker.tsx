import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, Leaf, X, Globe, Pencil,
  RotateCcw, Download, Upload, Repeat, AlertTriangle, Search as SearchIcon, RefreshCw, FileText,
  Calendar, Check, Filter, ArrowUpRight, ArrowDownRight, DollarSign, Layers, PieChart as PieIcon,
  BarChart3, Settings, AlertCircle, Sparkles, SlidersHorizontal
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import importedLedgerData from "@/data/imported_ledger.json";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Safe Storage polyfill for window.storage if not present
const safeStorage = {
  get: async (key: string, _isPrivate?: boolean) => {
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch {
      return null;
    }
  },
  set: async (key: string, val: string, _isPrivate?: boolean) => {
    try {
      localStorage.setItem(key, val);
      return true;
    } catch {
      return false;
    }
  },
};

if (typeof window !== "undefined" && !(window as any).storage) {
  (window as any).storage = safeStorage;
}

const ENTRIES_KEY = "agroseed:ledger-entries-en";
const META_KEY = "agroseed:ledger-meta-en";
const SEED_KEY = "agroseed:ledger-csv-seeded-v2026-09-25-clean";
const DB_ENTRIES_KEY = "agroseed_ledger_entries_v2";
const DB_META_KEY = "agroseed_ledger_meta_v2";
const ADD_NEW = "__add_new__";
const TRASH_DAYS = 7;

export type ArrayMetaKey = "incomeCategories" | "expenseCategories" | "vendors" | "paymentMethods";

interface LedgerEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  vendor?: string;
  paymentMethod?: string;
  description?: string;
  date: string;
  addedBy?: string;
  source?: string;
  deletedAt?: number | null;
}

interface RecurringTemplate {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  vendor?: string;
  paymentMethod?: string;
  description?: string;
  dayOfMonth: number;
  lastGeneratedMonth?: string | null;
}

interface LedgerMeta {
  incomeCategories: string[];
  expenseCategories: string[];
  vendors: string[];
  paymentMethods: string[];
  budgets: Record<string, number>;
  recurring: RecurringTemplate[];
  lastAddedBy: string;
}

const DEFAULT_META: LedgerMeta = {
  incomeCategories: ["Product Sales (Website)", "Direct Sales", "Delivery Charge", "Wholesale Order", "Other Income"],
  expenseCategories: ["Marketing & Ads", "Website & Software", "Seeds & Inventory", "Gardening Product", "Office Supplies", "Shipping & Courier", "Packaging & Labels", "Transport", "Bank & Payment Fees", "Entertainment", "Utilities", "Rent", "Salaries & Wages", "Professional Services", "Other Expense"],
  vendors: ["Amar Boost", "BTCL", "China bazar", "Ecomah", "china bazar", "Robi", "Laobaan", "Meta", "Redotpay", "সিরাজ টেক", "Local shop", "Steadfast Courier", "Local Bus", "Local Supplier", "Internet", "Ss Seed Shop", "Alibaba Supplier", "Pathao Courier"],
  paymentMethods: ["Cash", "bKash", "Nagad", "Rocket", "Bank Transfer", "Card"],
  budgets: {},
  recurring: [],
  lastAddedBy: "",
};

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#64748b", "#d97706"];

function taka(n: number | string) {
  const v = Number(n) || 0;
  return "৳" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthStr() {
  return todayStr().slice(0, 7);
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[Number(m) - 1]} ${y}`;
}

function lastNMonths(n: number) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }
  return arr;
}

function uid() {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ---------- Reusable dropdown with inline "+ Add New" option ---------- */
function EditableSelect({ label, value, onChange, options, onAddOption, placeholder }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  onAddOption: (val: string) => void;
  placeholder: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  if (adding) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="h-9 text-xs"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const v = draft.trim();
              if (!v) return;
              onAddOption(v);
              onChange(v);
              setDraft("");
              setAdding(false);
            }}
            className="h-9 px-3 text-xs"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setAdding(false); setDraft(""); }}
            className="h-9 px-3 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => (e.target.value === ADD_NEW ? setAdding(true) : onChange(e.target.value))}
        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={ADD_NEW} className="font-semibold text-primary">+ Add new...</option>
      </select>
    </div>
  );
}

/* ---------- Add / Edit Entry Modal ---------- */
function EntryForm({ meta, initial, onSave, onAddMetaOption, onClose }: {
  meta: LedgerMeta;
  initial: LedgerEntry | null;
  onSave: (entry: LedgerEntry) => void;
  onAddMetaOption: (key: ArrayMetaKey, val: string) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [type, setType] = useState<"income" | "expense">(initial?.type || "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category || meta.expenseCategories[0]);
  const [vendor, setVendor] = useState(initial?.vendor || meta.vendors[0] || "");
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || meta.paymentMethods[0] || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [date, setDate] = useState(initial?.date || todayStr());
  const [addedBy, setAddedBy] = useState(initial?.addedBy || meta.lastAddedBy || "");

  useEffect(() => {
    if (!isEdit) setCategory(type === "income" ? meta.incomeCategories[0] : meta.expenseCategories[0]);
  }, [type]); // eslint-disable-line

  const submit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSave({
      id: initial?.id || uid(),
      type, amount: Number(amount), category,
      vendor: type === "expense" ? vendor : "",
      paymentMethod, description: description.trim(), date,
      addedBy: addedBy.trim(),
      source: initial?.source || "manual",
      deletedAt: initial?.deletedAt || null,
    });
    onClose();
  };

  const categoryOptions = type === "income" ? meta.incomeCategories : meta.expenseCategories;
  const categoryMetaKey: ArrayMetaKey = type === "income" ? "incomeCategories" : "expenseCategories";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
              {type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-foreground">{isEdit ? "লেনদেন এডিট করুন" : "নতুন লেনদেন যুক্ত করুন"}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Income / Expense Switch */}
        <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "expense" ? "bg-rose-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            ব্যয় (Expense)
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "income" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            আয় (Income)
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">টাকার পরিমাণ (৳ Amount)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pl-8 text-base font-bold font-mono h-11"
              autoFocus
            />
          </div>
        </div>

        <EditableSelect
          label="ক্যাটাগরি (Category)"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          onAddOption={(v) => onAddMetaOption(categoryMetaKey, v)}
          placeholder="নতুন ক্যাটাগরির নাম"
        />

        {type === "expense" && (
          <EditableSelect
            label="ভেন্ডর / সরবরাহকারী (Vendor / Supplier)"
            value={vendor}
            onChange={setVendor}
            options={meta.vendors}
            onAddOption={(v) => onAddMetaOption("vendors", v)}
            placeholder="নতুন ভেন্ডরের নাম"
          />
        )}

        <EditableSelect
          label="পেমেন্ট মেথড (Payment Method)"
          value={paymentMethod}
          onChange={setPaymentMethod}
          options={meta.paymentMethods}
          onAddOption={(v) => onAddMetaOption("paymentMethods", v)}
          placeholder="নতুন পেমেন্ট মেথড"
        />

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">তারিখ (Date)</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">বিবরণ (Description - Optional)</Label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="যেমন: ৫০ প্যাকেট টমেটোর বীজ ক্রয়"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">যুক্তকারী (Added By - Optional)</Label>
          <Input
            type="text"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            placeholder="আপনার নাম"
            className="h-9 text-xs"
          />
        </div>

        <Button
          onClick={submit}
          className={`w-full h-11 font-bold text-sm shadow-md transition-all ${type === "income" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}`}
        >
          {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Recurring Template Form ---------- */
function RecurringForm({ meta, onSave, onAddMetaOption, onClose }: {
  meta: LedgerMeta;
  onSave: (tpl: RecurringTemplate) => void;
  onAddMetaOption: (key: ArrayMetaKey, val: string) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(meta.expenseCategories[0]);
  const [vendor, setVendor] = useState(meta.vendors[0] || "");
  const [paymentMethod, setPaymentMethod] = useState(meta.paymentMethods[0] || "");
  const [description, setDescription] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  useEffect(() => { setCategory(type === "income" ? meta.incomeCategories[0] : meta.expenseCategories[0]); }, [type]); // eslint-disable-line

  const submit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSave({
      id: uid(), type, amount: Number(amount), category,
      vendor: type === "expense" ? vendor : "", paymentMethod,
      description: description.trim(), dayOfMonth: Math.min(28, Math.max(1, Number(dayOfMonth) || 1)),
      lastGeneratedMonth: null,
    });
    onClose();
  };

  const categoryOptions = type === "income" ? meta.incomeCategories : meta.expenseCategories;
  const categoryMetaKey: ArrayMetaKey = type === "income" ? "incomeCategories" : "expenseCategories";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">নতুন পুনরাবৃত্ত লেনদেন (Recurring)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "expense" ? "bg-rose-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            ব্যয় (Expense)
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "income" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            আয় (Income)
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">টাকার পরিমাণ (৳ Amount)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-10 font-bold" autoFocus />
        </div>

        <EditableSelect label="ক্যাটাগরি" value={category} onChange={setCategory} options={categoryOptions}
          onAddOption={(v) => onAddMetaOption(categoryMetaKey, v)} placeholder="নতুন ক্যাটাগরি" />

        {type === "expense" && (
          <EditableSelect label="ভেন্ডর" value={vendor} onChange={setVendor} options={meta.vendors}
            onAddOption={(v) => onAddMetaOption("vendors", v)} placeholder="নতুন ভেন্ডর" />
        )}

        <EditableSelect label="পেমেন্ট মেথড" value={paymentMethod} onChange={setPaymentMethod} options={meta.paymentMethods}
          onAddOption={(v) => onAddMetaOption("paymentMethods", v)} placeholder="নতুন মেথড" />

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">মাসের কোন দিন পুনরাবৃত্তি হবে? (Day 1-28)</Label>
          <Input type="number" min="1" max="28" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">বিবরণ (Description)</Label>
          <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="যেমন: সার্ভার হোস্টিং বিল" className="h-9 text-xs" />
        </div>

        <Button onClick={submit} className="w-full h-10 font-bold text-sm bg-primary text-primary-foreground">
          যুক্ত করুন
        </Button>
      </div>
    </div>
  );
}

/* ---------- Editable list for the Settings tab ---------- */
function EditableList({ title, items, onRename, onDelete, onAdd }: {
  title: string;
  items: string[];
  onRename: (oldVal: string, newVal: string) => void;
  onDelete: (val: string) => void;
  onAdd: (val: string) => void;
}) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [newDraft, setNewDraft] = useState("");

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs font-normal">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background">
          {items.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">কোনো আইটেম নেই।</div>
          ) : (
            items.map((item) =>
              editingItem === item ? (
                <div key={item} className="p-2.5 flex items-center gap-2 bg-muted/40">
                  <Input
                    type="text"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="h-8 text-xs flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => { onRename(item, editDraft); setEditingItem(null); }} className="h-8 px-3 text-xs">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)} className="h-8 px-2 text-xs">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div key={item} className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-xs font-medium">
                  <span className="text-foreground">{item}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setEditDraft(item); }} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )
            )
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newDraft}
            onChange={(e) => setNewDraft(e.target.value)}
            placeholder={`Add new to ${title}`}
            className="h-8 text-xs flex-1"
          />
          <Button
            size="sm"
            onClick={() => { if (newDraft.trim()) { onAdd(newDraft.trim()); setNewDraft(""); } }}
            className="h-8 px-3 text-xs gap-1"
          >
            <Plus size={13} /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeLedgerEntry(e: any): LedgerEntry {
  if (!e || typeof e !== "object") {
    return {
      id: Math.random().toString(36).substring(2),
      type: "expense",
      amount: 0,
      category: "Other",
      vendor: "",
      paymentMethod: "Cash",
      description: "",
      date: todayStr(),
      addedBy: "",
      source: "manual",
      deletedAt: null,
    };
  }
  const rawDate = e.date || e.entry_date || e.created_at || todayStr();
  const dateStr = typeof rawDate === "string" && rawDate.length >= 10 ? rawDate.slice(0, 10) : todayStr();
  let deletedAt: number | null = null;
  if (typeof e.deletedAt === "number") {
    deletedAt = e.deletedAt;
  } else if (e.deleted_at) {
    const t = typeof e.deleted_at === "number" ? e.deleted_at : new Date(e.deleted_at).getTime();
    deletedAt = isNaN(t) ? null : t;
  }
  return {
    id: String(e.id || Math.random().toString(36).substring(2)),
    type: e.type === "income" ? "income" : "expense",
    amount: Number(e.amount) || 0,
    category: String(e.category || "Other"),
    vendor: String(e.vendor || ""),
    paymentMethod: String(e.paymentMethod || e.payment_method || "Cash"),
    description: String(e.description || ""),
    date: dateStr || todayStr(),
    addedBy: String(e.addedBy || e.added_by || ""),
    source: String(e.source || "manual"),
    deletedAt,
  };
}

/* ─────────────────────────────────────────────────────────────
   Main Component: ExpenseTracker
───────────────────────────────────────────────────────────── */
export default function ExpenseTracker() {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeLedgerEntry);
        }
      }
    } catch {}
    return [];
  });
  const [meta, setMeta] = useState<LedgerMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [syncingSales, setSyncingSales] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"ledger" | "insights" | "recurring" | "trash" | "settings">("ledger");

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  const [filterMonth, setFilterMonth] = useState(currentMonthStr());
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterPayment, setFilterPayment] = useState("");

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      let loadedEntries: LedgerEntry[] = [];
      let loadedMeta: LedgerMeta = DEFAULT_META;

      let remoteEntriesFound = false;
      let remoteMetaFound = false;
      const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";

      try {
        // 1. Fetch from PHP MySQL/JSON backend
        try {
          const res = await fetch(`${url}/expenses/get.php`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.entries) && json.entries.length > 0) {
              loadedEntries = json.entries.map(normalizeLedgerEntry);
              remoteEntriesFound = true;
            }
            if (json.success && json.meta && typeof json.meta === "object") {
              loadedMeta = { ...DEFAULT_META, ...json.meta };
              remoteMetaFound = true;
            }
          }
        } catch (err) {
          console.warn("Failed to fetch expenses from PHP API, attempting Supabase/local fallback", err);
        }

        // 2. Fallback to Supabase app_settings if not in PHP yet
        if (!remoteEntriesFound || !remoteMetaFound) {
          try {
            const { data: dbRows } = await supabase
              .from("app_settings")
              .select("key, value")
              .in("key", [DB_ENTRIES_KEY, DB_META_KEY]);

            if (dbRows && dbRows.length > 0) {
              for (const row of dbRows) {
                if (!remoteEntriesFound && row.key === DB_ENTRIES_KEY && row.value) {
                  try {
                    const parsed = JSON.parse(row.value);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      loadedEntries = parsed.map(normalizeLedgerEntry);
                      remoteEntriesFound = true;
                    }
                  } catch {}
                }
                if (!remoteMetaFound && row.key === DB_META_KEY && row.value) {
                  try {
                    const parsed = JSON.parse(row.value);
                    if (parsed && typeof parsed === "object") {
                      loadedMeta = { ...DEFAULT_META, ...parsed };
                      remoteMetaFound = true;
                    }
                  } catch {}
                }
              }
            }
          } catch {}
        }

        // 3. Fallback to local storage or imported csv data if not remote yet
        if (!remoteEntriesFound) {
          const isSeeded = localStorage.getItem(SEED_KEY) === "1";
          if (!isSeeded) {
            loadedEntries = (importedLedgerData as any[]).map(normalizeLedgerEntry);
            localStorage.setItem(SEED_KEY, "1");
          } else {
            try {
              const r = await (window as any).storage.get(ENTRIES_KEY, false);
              if (r && r.value) loadedEntries = JSON.parse(r.value).map(normalizeLedgerEntry);
              else loadedEntries = (importedLedgerData as any[]).map(normalizeLedgerEntry);
            } catch (e) {
              loadedEntries = (importedLedgerData as any[]).map(normalizeLedgerEntry);
            }
          }

          // Push to PHP API & Supabase so other browsers get it
          if (loadedEntries.length > 0) {
            void fetch(`${url}/expenses/save.php`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ entries: loadedEntries })
            }).catch(() => {});
            void supabase
              .from("app_settings")
              .upsert({ key: DB_ENTRIES_KEY, value: JSON.stringify(loadedEntries) }, { onConflict: "key" });
          }
        }

        if (!remoteMetaFound) {
          try {
            const r = await (window as any).storage.get(META_KEY, false);
            if (r && r.value) loadedMeta = { ...DEFAULT_META, ...JSON.parse(r.value) };
          } catch {}

          void fetch(`${url}/expenses/save.php`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meta: loadedMeta })
          }).catch(() => {});
          void supabase
            .from("app_settings")
            .upsert({ key: DB_META_KEY, value: JSON.stringify(loadedMeta) }, { onConflict: "key" });
        }

        // Update local storage cache (capped at 50 to conserve browser quota)
        try {
          localStorage.setItem(ENTRIES_KEY, JSON.stringify(loadedEntries.slice(0, 50)));
          localStorage.setItem(META_KEY, JSON.stringify(loadedMeta));
        } catch {}

        const now = Date.now();
        const cleaned = loadedEntries.filter((e) => !e.deletedAt || now - e.deletedAt < TRASH_DAYS * 86400000);
        if (cleaned.length !== loadedEntries.length) {
          try { await (window as any).storage.set(ENTRIES_KEY, JSON.stringify(cleaned), false); } catch (e) {}
        }

        const activeEntries = cleaned.filter((e) => !e.deletedAt);
        if (activeEntries.length > 0) {
          const curMonth = currentMonthStr();
          const hasCurrentMonthData = activeEntries.some((e) => (e.date || "").slice(0, 7) === curMonth);
          if (!hasCurrentMonthData) {
            const monthsWithData = Array.from(new Set(activeEntries.map((e) => (e.date || "").slice(0, 7)).filter(Boolean))).sort().reverse();
            if (monthsWithData.length > 0) {
              setFilterMonth(monthsWithData[0]);
            }
          }
        }

        setEntries(cleaned);
        setMeta(loadedMeta);

        // Silently sync delivered orders & purge non-delivered orders on load
        syncWebsiteSalesFromSupabase(cleaned, false);
      } catch (loadErr) {
        console.error("Critical error in ExpenseTracker loader:", loadErr);
      } finally {
        setLoading(false);
      }
    })();

    // 3. Realtime listener to sync expenses instantly across browsers
    const channel = supabase
      .channel("expense-tracker-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          if (row.key === DB_ENTRIES_KEY && row.value) {
            try {
              const parsed = JSON.parse(row.value);
              if (Array.isArray(parsed)) {
                const norm = parsed.map(normalizeLedgerEntry);
                setEntries(norm);
                try {
                  localStorage.setItem(ENTRIES_KEY, JSON.stringify(norm.slice(0, 50)));
                } catch {}
              }
            } catch {}
          }
          if (row.key === DB_META_KEY && row.value) {
            try {
              const parsed = JSON.parse(row.value);
              setMeta((prev) => ({ ...prev, ...parsed }));
              localStorage.setItem(META_KEY, row.value);
            } catch {}
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const resetToCSVData = async () => {
    if (!window.confirm("Replace current ledger entries with the exact data from ledger_2026-09-25.csv? Previous custom entries will be reset.")) return;
    const freshEntries = importedLedgerData as LedgerEntry[];
    setEntries(freshEntries);
    setMeta(DEFAULT_META);
    await (window as any).storage.set(ENTRIES_KEY, JSON.stringify(freshEntries), false);
    await (window as any).storage.set(META_KEY, JSON.stringify(DEFAULT_META), false);
    localStorage.setItem(SEED_KEY, "1");

    const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
    try {
      await fetch(`${url}/expenses/save.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: freshEntries, meta: DEFAULT_META })
      });
    } catch {}

    try {
      await supabase
        .from("app_settings")
        .upsert({ key: DB_ENTRIES_KEY, value: JSON.stringify(freshEntries) }, { onConflict: "key" });
      await supabase
        .from("app_settings")
        .upsert({ key: DB_META_KEY, value: JSON.stringify(DEFAULT_META) }, { onConflict: "key" });
    } catch {}

    toast.success(`Reset complete! Loaded ${freshEntries.length} entries from ledger_2026-09-25.csv`);
  };

  const persistEntries = async (next: LedgerEntry[]) => {
    const norm = next.map(normalizeLedgerEntry);
    setEntries(norm);
    try {
      const r = await (window as any).storage.set(ENTRIES_KEY, JSON.stringify(norm), false);
      setError(r ? "" : "There was a problem saving. Please try again.");
    } catch (e) { setError("There was a problem saving. Please try again."); }

    const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";
    try {
      await fetch(`${url}/expenses/save.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: norm })
      });
    } catch (e) {
      console.warn("Failed to sync entries to PHP API:", e);
    }

    try {
      await supabase
        .from("app_settings")
        .upsert({ key: DB_ENTRIES_KEY, value: JSON.stringify(norm) }, { onConflict: "key" });
    } catch {}
  };

  const persistMeta = async (next: LedgerMeta) => {
    setMeta(next);
    try { await (window as any).storage.set(META_KEY, JSON.stringify(next), false); }
    catch (e) { setError("There was a problem saving the new option."); }

    const url = import.meta.env.VITE_API_URL || "http://localhost:8005";
    try {
      await fetch(`${url}/expenses/save.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: next })
      });
    } catch (e) {
      console.warn("Failed to sync meta to PHP API:", e);
    }

    try {
      await supabase
        .from("app_settings")
        .upsert({ key: DB_META_KEY, value: JSON.stringify(next) }, { onConflict: "key" });
    } catch {}
  };

  const addMetaOption = (key: ArrayMetaKey, value: string) => {
    const list = meta[key];
    if (list.includes(value)) return;
    persistMeta({ ...meta, [key]: [...list, value] });
  };

  const entryFieldForMetaKey = (key: ArrayMetaKey): "vendor" | "paymentMethod" | "category" => {
    if (key === "vendors") return "vendor";
    if (key === "paymentMethods") return "paymentMethod";
    return "category"; // incomeCategories / expenseCategories
  };

  const renameMetaOption = (key: ArrayMetaKey, oldValue: string, newValue: string) => {
    const trimmed = newValue.trim();
    if (!trimmed || trimmed === oldValue) return;
    const list = meta[key];
    if (list.includes(trimmed)) { setError(`"${trimmed}" already exists in this list.`); return; }
    const nextList = list.map((v) => (v === oldValue ? trimmed : v));
    persistMeta({ ...meta, [key]: nextList });

    const field = entryFieldForMetaKey(key);
    const typeGuard = key === "incomeCategories" ? "income" : key === "expenseCategories" ? "expense" : null;
    const nextEntries = entries.map((e) => {
      if (e[field] !== oldValue) return e;
      if (typeGuard && e.type !== typeGuard) return e;
      return { ...e, [field]: trimmed };
    });
    persistEntries(nextEntries);
    setError("");
  };

  const deleteMetaOption = (key: ArrayMetaKey, value: string) => {
    const field = entryFieldForMetaKey(key);
    const inUse = entries.some((e) => !e.deletedAt && e[field] === value);
    if (inUse && !window.confirm(`"${value}" is used by existing entries. Removing it from the list won't change those entries, but it will disappear from the dropdown. Continue?`)) return;
    const list = meta[key];
    persistMeta({ ...meta, [key]: list.filter((v) => v !== value) });
  };

  const saveEntry = (entry: LedgerEntry) => {
    const exists = entries.some((e) => e.id === entry.id);
    persistEntries(exists ? entries.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...entries]);
    if (entry.addedBy) persistMeta({ ...meta, lastAddedBy: entry.addedBy });
  };

  const softDelete = (id: string) => {
    if (!window.confirm("Delete this entry? It will stay in Trash for 7 days.")) return;
    persistEntries(entries.map((e) => (e.id === id ? { ...e, deletedAt: Date.now() } : e)));
  };

  const restoreEntry = (id: string) => persistEntries(entries.map((e) => (e.id === id ? { ...e, deletedAt: null } : e)));

  const permanentDelete = (id: string) => {
    if (!window.confirm("This entry will be permanently deleted and cannot be recovered. Continue?")) return;
    persistEntries(entries.filter((e) => e.id !== id));
  };

  // --- Website sale auto-add hook ---
  useEffect(() => {
    (window as any).recordWebsiteSale = (order: { amount: number; description?: string; paymentMethod?: string; date?: string }) => {
      const entry: LedgerEntry = {
        id: uid(), type: "income", amount: Number(order.amount) || 0,
        category: "Product Sales (Website)", vendor: "",
        paymentMethod: order.paymentMethod || "bKash", description: order.description || "",
        date: order.date || todayStr(), addedBy: "Website Auto", source: "website", deletedAt: null,
      };
      setEntries((prev) => {
        const next = [entry, ...prev];
        (window as any).storage.set(ENTRIES_KEY, JSON.stringify(next), false).catch(() => {});
        return next;
      });
    };
    return () => { delete (window as any).recordWebsiteSale; };
  }, []);

  // Sync Website Sales from PHP backend orders table (Only DELIVERED orders)
  const syncWebsiteSalesFromSupabase = async (baseEntries?: LedgerEntry[], showToast: boolean = true) => {
    setSyncingSales(true);
    const url = import.meta.env.VITE_API_URL || "https://api.ssseedshop.com";

    // 1. Try PHP sync_sales endpoint first
    try {
      const res = await fetch(`${url}/expenses/sync_sales.php`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.entries)) {
          const norm = json.entries.map(normalizeLedgerEntry);
          setEntries(norm);
          try {
            await (window as any).storage.set(ENTRIES_KEY, JSON.stringify(norm), false);
          } catch {}
          if (showToast) {
            if (json.new_count === 0 && json.removed_count === 0) {
              toast.info("All delivered website sales are synced with ledger!");
            } else if (json.new_count > 0 && json.removed_count > 0) {
              toast.success(`Synced ${json.new_count} delivered sales and removed ${json.removed_count} non-delivered order entries.`);
            } else if (json.new_count > 0) {
              toast.success(`Successfully synced ${json.new_count} new delivered website sales into Ledger!`);
            } else {
              toast.success(`Removed ${json.removed_count} non-delivered order entries from Ledger.`);
            }
          }
          setSyncingSales(false);
          return;
        }
      }
    } catch (phpErr) {
      console.warn("PHP sync_sales failed, attempting client-side fallback", phpErr);
    }

    try {
      const { data: dbOrders, error: orderErr } = await supabase
        .from("orders")
        .select("id, order_id, total_amount, created_at, status")
        .not("order_id", "ilike", "OLD%")
        .eq("status", "delivered");

      if (orderErr) throw orderErr;

      // Fetch non-delivered orders to remove any premature sync entries
      const { data: nonDeliveredOrders } = await supabase
        .from("orders")
        .select("id, order_id, status")
        .not("order_id", "ilike", "OLD%")
        .neq("status", "delivered");

      let currentEntries = [...(baseEntries || entries)];
      let removedCount = 0;

      if (nonDeliveredOrders && nonDeliveredOrders.length > 0) {
        const nonDeliveredIds = new Set<string>();
        nonDeliveredOrders.forEach((o) => {
          if (o.order_id) nonDeliveredIds.add(String(o.order_id).trim().toLowerCase());
          if (o.id) {
            nonDeliveredIds.add(String(o.id).toLowerCase());
            nonDeliveredIds.add(String(o.id).slice(0, 8).toLowerCase());
          }
        });

        currentEntries = currentEntries.filter((e) => {
          if (e.addedBy === "Supabase Sync" || e.source === "website" || e.category === "Product Sales (Website)") {
            const desc = (e.description || "").toLowerCase();
            for (const id of nonDeliveredIds) {
              if (id && desc.includes(id)) {
                removedCount++;
                return false;
              }
            }
          }
          return true;
        });
      }

      const newEntries: LedgerEntry[] = [];

      (dbOrders || []).forEach((o) => {
        const cleanOrderId = o.order_id ? String(o.order_id).trim().toLowerCase() : "";
        const uuidPrefix = o.id ? String(o.id).slice(0, 8).toLowerCase() : "";
        const fullUuid = o.id ? String(o.id).toLowerCase() : "";
        const orderDate = o.created_at ? o.created_at.slice(0, 10) : todayStr();
        const orderAmount = Number(o.total_amount) || 0;

        // Smart check: match by order_id, UUID prefix, or (Date + Amount for website sales)
        const isAlreadySynced = currentEntries.some((e) => {
          if (e.type !== "income") return false;
          const desc = (e.description || "").toLowerCase();

          if (cleanOrderId && desc.includes(cleanOrderId)) return true;
          if (uuidPrefix && desc.includes(uuidPrefix)) return true;
          if (fullUuid && desc.includes(fullUuid)) return true;

          if (e.category === "Product Sales (Website)" && e.date === orderDate && Math.abs(e.amount - orderAmount) < 1) {
            return true;
          }

          return false;
        });

        if (!isAlreadySynced) {
          const desc = `Order #${o.order_id || uuidPrefix || "Website"}`;
          newEntries.push({
            id: uid(),
            type: "income",
            amount: orderAmount,
            category: "Product Sales (Website)",
            vendor: "",
            paymentMethod: "Cash",
            description: desc,
            date: orderDate,
            addedBy: "Supabase Sync",
            source: "website",
            deletedAt: null,
          });
        }
      });

      const finalEntries = [...newEntries, ...currentEntries];
      persistEntries(finalEntries);

      if (showToast) {
        if (newEntries.length === 0 && removedCount === 0) {
          toast.info("All delivered website sales are synced with ledger!");
        } else if (newEntries.length > 0 && removedCount > 0) {
          toast.success(`Synced ${newEntries.length} delivered sales and removed ${removedCount} non-delivered order entries.`);
        } else if (newEntries.length > 0) {
          toast.success(`Successfully synced ${newEntries.length} new delivered website sales into Ledger!`);
        } else {
          toast.success(`Removed ${removedCount} non-delivered order entries from Ledger.`);
        }
      }
    } catch (err: any) {
      if (showToast) toast.error(`Sales sync error: ${err.message || "Failed"}`);
    } finally {
      setSyncingSales(false);
    }
  };

  const normalizedEntries = useMemo(() => (entries || []).map(normalizeLedgerEntry), [entries]);
  const active = useMemo(() => normalizedEntries.filter((e) => !e.deletedAt), [normalizedEntries]);
  const trashed = useMemo(
    () => normalizedEntries.filter((e) => e.deletedAt).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)),
    [normalizedEntries]
  );

  const filtered = useMemo(() => {
    let list = active;
    if (useCustomRange) list = list.filter((e) => (e.date || "") >= dateFrom && (e.date || "") <= dateTo);
    else if (filterMonth && filterMonth !== "all") list = list.filter((e) => (e.date || "").slice(0, 7) === filterMonth);
    if (filterCategory) list = list.filter((e) => e.category === filterCategory);
    if (filterVendor) list = list.filter((e) => e.vendor === filterVendor);
    if (filterPayment) list = list.filter((e) => e.paymentMethod === filterPayment);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((e) => (e.description || "").toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q));
    }
    return list.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [active, useCustomRange, dateFrom, dateTo, filterMonth, filterCategory, filterVendor, filterPayment, searchText]);

  const totals = useMemo(() => {
    const income = filtered.filter((e) => e.type === "income").reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const expense = filtered.filter((e) => e.type === "expense").reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const monthOptions = useMemo(() => {
    const set = new Set(active.map((e) => (e.date || "").slice(0, 7)).filter(Boolean));
    set.add(currentMonthStr());
    return Array.from(set).sort().reverse();
  }, [active]);

  const trendData = useMemo(() => {
    const months = lastNMonths(6);
    return months.map((ym) => {
      const monthEntries = active.filter((e) => (e.date || "").slice(0, 7) === ym);
      return {
        month: monthLabel(ym).slice(0, 3),
        Income: monthEntries.filter((e) => e.type === "income").reduce((s, e) => s + (Number(e.amount) || 0), 0),
        Expense: monthEntries.filter((e) => e.type === "expense").reduce((s, e) => s + (Number(e.amount) || 0), 0),
      };
    });
  }, [active]);

  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((e) => e.type === "expense").forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const incomePieData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((e) => e.type === "income").forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const paymentMethodPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => {
      const key = e.paymentMethod || "Not specified";
      map[key] = (map[key] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const expenseCategoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((e) => e.type === "expense").forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return meta.expenseCategories.map((c) => ({ category: c, total: map[c] || 0 }));
  }, [filtered, meta.expenseCategories]);

  const incomeCategoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((e) => e.type === "income").forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return meta.incomeCategories.map((c) => ({ category: c, total: map[c] || 0 }));
  }, [filtered, meta.incomeCategories]);

  const topIncomeCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((e) => e.type === "income").forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return arr[0] || null;
  }, [filtered]);

  const daySpan = useMemo(() => {
    if (filtered.length === 0) return 1;
    const dates = filtered.map((e) => e.date).sort();
    const first = new Date(dates[0]).getTime(), last = new Date(dates[dates.length - 1]).getTime();
    return Math.max(1, Math.round((last - first) / 86400000) + 1);
  }, [filtered]);

  const budgetRows = useMemo(
    () => Object.entries(meta.budgets || {}).map(([cat, amt]) => ({
      category: cat, budget: amt,
      spent: filtered.filter((e) => e.type === "expense" && e.category === cat).reduce((s, e) => s + e.amount, 0),
    })),
    [meta.budgets, filtered]
  );

  const pendingRecurring = (meta.recurring || []).filter((t) => t.lastGeneratedMonth !== currentMonthStr());

  const generateRecurring = () => {
    if (pendingRecurring.length === 0) return;
    const cm = currentMonthStr();
    const newEntries: LedgerEntry[] = pendingRecurring.map((t) => ({
      id: uid(), type: t.type, amount: t.amount, category: t.category, vendor: t.vendor || "",
      paymentMethod: t.paymentMethod, description: t.description || "Recurring entry",
      date: `${cm}-${String(t.dayOfMonth).padStart(2, "0")}`, addedBy: "Recurring Auto", source: "recurring", deletedAt: null,
    }));
    persistEntries([...newEntries, ...entries]);
    const updatedRecurring = meta.recurring.map((t) => (t.lastGeneratedMonth !== cm ? { ...t, lastGeneratedMonth: cm } : t));
    persistMeta({ ...meta, recurring: updatedRecurring });
  };

  const addRecurringTemplate = (tpl: RecurringTemplate) => persistMeta({ ...meta, recurring: [...(meta.recurring || []), tpl] });
  const deleteRecurringTemplate = (id: string) => persistMeta({ ...meta, recurring: meta.recurring.filter((t) => t.id !== id) });

  const setBudget = () => {
    if (!budgetCategory || !budgetAmount || Number(budgetAmount) <= 0) return;
    persistMeta({ ...meta, budgets: { ...meta.budgets, [budgetCategory]: Number(budgetAmount) } });
    setBudgetCategory(""); setBudgetAmount("");
  };

  const removeBudget = (cat: string) => {
    const next = { ...meta.budgets };
    delete next[cat];
    persistMeta({ ...meta, budgets: next });
  };

  const exportRows = () => filtered.map((e) => ({
    date: e.date, type: e.type, category: e.category, vendor: e.vendor || "",
    paymentMethod: e.paymentMethod || "", description: e.description || "",
    amount: e.amount, addedBy: e.addedBy || "",
  }));

  const exportExcel = () => {
    const rows = filtered.map((e) => ({
      Date: e.date, Type: e.type === "income" ? "Income" : "Expense", Category: e.category,
      Vendor: e.vendor || "", "Payment Method": e.paymentMethod || "", Description: e.description || "",
      Amount: e.amount, "Added By": e.addedBy || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `ssseedshop-ledger-${useCustomRange ? `${dateFrom}_to_${dateTo}` : filterMonth}.xlsx`);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(exportRows());
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssseedshop-ledger-${useCustomRange ? `${dateFrom}_to_${dateTo}` : filterMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results: any) => {
        const imported: LedgerEntry[] = [];
        results.data.forEach((row: any) => {
          const type = (row.type || "").trim().toLowerCase();
          const amount = Number(row.amount);
          if ((type !== "income" && type !== "expense") || !amount || amount <= 0) return;
          imported.push({
            id: uid(), type: type as "income" | "expense", amount, category: (row.category || "Other").trim(),
            vendor: (row.vendor || "").trim(), paymentMethod: (row.paymentMethod || "").trim(),
            description: (row.description || "").trim(), date: row.date || todayStr(),
            addedBy: (row.addedBy || "CSV Import").trim(), source: "import", deletedAt: null,
          });
        });
        if (imported.length === 0) { setError("No valid entries were found in the CSV file."); return; }
        let nextMeta = { ...meta };
        imported.forEach((en) => {
          const key: ArrayMetaKey = en.type === "income" ? "incomeCategories" : "expenseCategories";
          if (en.category && !nextMeta[key].includes(en.category)) nextMeta = { ...nextMeta, [key]: [...nextMeta[key], en.category] };
          if (en.vendor && !nextMeta.vendors.includes(en.vendor)) nextMeta = { ...nextMeta, vendors: [...nextMeta.vendors, en.vendor] };
          if (en.paymentMethod && !nextMeta.paymentMethods.includes(en.paymentMethod)) nextMeta = { ...nextMeta, paymentMethods: [...nextMeta.paymentMethods, en.paymentMethod] };
        });
        persistMeta(nextMeta);
        persistEntries([...imported, ...entries]);
        setError("");
      },
    });
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">হিসাব খাতা লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Ss Seed Shop — আয় ও ব্যয় ট্র্যাকার
              <Badge variant="outline" className="text-[11px] font-normal border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                Ledger Book
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ব্যবসায়িক আয়, ব্যয়, মুনাফা এবং এনালিটিক্স হিসাব খাতা
            </p>
          </div>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          <Button
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="h-9 px-4 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" /> নতুন এন্ট্রি (New Entry)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncWebsiteSalesFromSupabase()}
            disabled={syncingSales}
            className="h-9 px-3 text-xs gap-1.5 border-border"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingSales ? "animate-spin text-primary" : ""}`} />
            {syncingSales ? "সিঙ্ক হচ্ছে..." : "ওয়েবসাইট সেলস সিঙ্ক"}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border overflow-x-auto no-print">
        {[
          ["ledger", "লেনদেন তালিকা (Ledger)", FileText, 0],
          ["insights", "চার্ট ও এনালিটিক্স (Insights)", BarChart3, 0],
          ["recurring", "পুনরাবৃত্ত (Recurring)", Repeat, pendingRecurring.length],
          ["trash", "ট্র্যাশ (Trash)", Trash2, trashed.length],
          ["settings", "সেটিংস (Settings)", Settings, 0],
        ].map(([key, label, Icon, badgeCount]: any) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              tab === key
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {badgeCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                key === "recurring" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-destructive/20 text-destructive"
              }`}>
                {badgeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────── TAB 1: LEDGER ─────────────────── */}
      {tab === "ledger" && (
        <div className="space-y-5">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Income */}
            <Card className="border-border bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500/20 shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">মোট আয় (Total Income)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {taka(totals.income)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ফিল্টার অনুযায়ী মোট অর্জিত আয়
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Expense */}
            <Card className="border-border bg-rose-500/5 dark:bg-rose-950/15 border-rose-500/20 shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">মোট ব্যয় (Total Expense)</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                    {taka(totals.expense)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ফিল্টার অনুযায়ী যাবতীয় খরচ
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Net Profit */}
            <Card className={`border-border shadow-xs ${
              totals.net >= 0
                ? "bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500/20"
                : "bg-amber-500/5 dark:bg-amber-950/15 border-amber-500/20"
            }`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    totals.net >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                  }`}>
                    নীট লাভ/ক্ষতি (Net Profit)
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    totals.net >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={`text-2xl font-black font-mono tracking-tight ${
                    totals.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {taka(totals.net)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {totals.net >= 0 ? "লাভজনক অবস্থানে রয়েছে" : "ঘাটতি / অতিরিক্ত ব্যয়"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="border-border bg-card shadow-xs no-print">
            <CardContent className="p-4 space-y-3">
              {/* Search input */}
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="বিবরণ বা ক্যাটাগরি দিয়ে খুঁজুন (Search by description or category)..."
                  className="pl-9 h-9 text-xs bg-background"
                />
              </div>

              {/* Filter controls grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 items-center">
                {/* Date range toggle / selector */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="customRangeToggle"
                    checked={useCustomRange}
                    onChange={(e) => setUseCustomRange(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <Label htmlFor="customRangeToggle" className="text-xs cursor-pointer text-muted-foreground font-medium">
                    কাস্টম তারিখ রেঞ্জ
                  </Label>
                </div>

                {useCustomRange ? (
                  <>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </>
                ) : (
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-input bg-background text-foreground text-xs cursor-pointer"
                  >
                    <option value="all">সব মাস (All Months)</option>
                    {monthOptions.map((ym) => (
                      <option key={ym} value={ym}>{monthLabel(ym)}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-input bg-background text-foreground text-xs cursor-pointer"
                >
                  <option value="">সব ক্যাটাগরি (All Categories)</option>
                  {[...meta.incomeCategories, ...meta.expenseCategories].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-input bg-background text-foreground text-xs cursor-pointer"
                >
                  <option value="">সব ভেন্ডর (All Vendors)</option>
                  {meta.vendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-input bg-background text-foreground text-xs cursor-pointer"
                >
                  <option value="">সব পেমেন্ট মেথড</option>
                  {meta.paymentMethods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Action Row & Export Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 no-print">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>মোট {filtered.length} টি লেনদেন পাওয়া গেছে</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={exportExcel} className="h-8 text-xs gap-1.5 border-border">
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs gap-1.5 border-border">
                <Download className="w-3.5 h-3.5 text-blue-600" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} className="h-8 text-xs gap-1.5 border-border">
                <Upload className="w-3.5 h-3.5 text-amber-600" /> Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 text-xs gap-1.5 border-border">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Print / PDF
              </Button>
              <input ref={importRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-2">
                <Wallet className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm font-semibold text-foreground">কোনো লেনদেন পাওয়া যায়নি</p>
                <p className="text-xs text-muted-foreground">ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন লেনদেন যুক্ত করুন।</p>
              </div>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors shadow-2xs"
                >
                  {/* Left Column: Icon + Category + Meta */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      e.type === "income"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}>
                      {e.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{e.category}</span>
                        {e.source === "website" && (
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 gap-1">
                            <Globe size={10} /> Website
                          </Badge>
                        )}
                        {e.source === "recurring" && (
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 gap-1">
                            <Repeat size={10} /> Recurring
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="font-mono">{new Date(e.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {e.vendor && <span>· <span className="text-foreground/80 font-medium">{e.vendor}</span></span>}
                        {e.paymentMethod && <span>· <Badge variant="secondary" className="text-[10px] h-4 px-1">{e.paymentMethod}</Badge></span>}
                        {e.description && <span>· <span>{e.description}</span></span>}
                        {e.addedBy && <span className="text-[11px] text-muted-foreground/80">({e.addedBy})</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount + Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-base font-extrabold font-mono whitespace-nowrap ${
                      e.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {e.type === "income" ? "+" : "−"}{taka(e.amount)}
                    </span>

                    <div className="flex items-center gap-1 no-print">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingEntry(e); setShowForm(true); }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => softDelete(e.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 2: INSIGHTS & CHARTS ─────────────────── */}
      {tab === "insights" && (
        <div className="space-y-6">
          {/* 6 Months Trend Bar Chart */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                গত ৬ মাসের আয় ও ব্যয়ের ট্রেন্ড (Last 6 Months: Income vs Expense)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} width={50} />
                    <Tooltip formatter={(v: any) => taka(v)} />
                    <Legend />
                    <Bar dataKey="Income" name="আয় (Income)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expense" name="ব্যয় (Expense)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Two-Column Pie Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Pie Chart */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <PieIcon className="w-4 h-4" />
                  ক্যাটাগরি অনুযায়ী ব্যয় (Expense by Category)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expensePieData.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">কোনো ব্যয়ের তথ্য নেই।</div>
                ) : (
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expensePieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {expensePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => taka(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background max-h-[200px] overflow-y-auto">
                  {expenseCategoryTotals.map((row, i) => (
                    <div key={row.category} className="flex items-center justify-between p-2.5 px-3 text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {row.category}
                      </span>
                      <span className="font-bold font-mono text-foreground">{row.total ? taka(row.total) : "—"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Income Pie Chart */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <PieIcon className="w-4 h-4" />
                  ক্যাটাগরি অনুযায়ী আয় (Income by Category)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incomePieData.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">কোনো আয়ের তথ্য নেই।</div>
                ) : (
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={incomePieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {incomePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => taka(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background max-h-[200px] overflow-y-auto">
                  {incomeCategoryTotals.map((row, i) => (
                    <div key={row.category} className="flex items-center justify-between p-2.5 px-3 text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {row.category}
                      </span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{row.total ? taka(row.total) : "—"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions by Payment Method */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                পেমেন্ট মেথড অনুযায়ী লেনদেন (Transactions by Payment Method)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethodPieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={2}>
                        {paymentMethodPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => taka(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background">
                  {paymentMethodPieData.map((row, i) => (
                    <div key={row.name} className="flex items-center justify-between p-2.5 px-3 text-xs">
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {row.name}
                      </span>
                      <span className="font-bold font-mono text-foreground">{taka(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Insights KPI Cards */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                ব্যবসায়িক গুরুত্বপূর্ণ অন্তর্দৃষ্টি (Business Insights)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">সেরা আয়ের ক্যাটাগরি (Top Income)</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {topIncomeCategory ? `${topIncomeCategory[0]} — ${taka(topIncomeCategory[1])}` : "তথ্য নেই"}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">গড় দৈনিক আয় (Daily Income)</p>
                  <p className="text-base font-bold font-mono text-foreground">
                    {taka(Math.round(totals.income / daySpan))}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">গড় দৈনিক ব্যয় (Daily Expense)</p>
                  <p className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                    {taka(Math.round(totals.expense / daySpan))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Tracking Section */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                বাজেট ট্র্যাকিং (Budget Management)
              </CardTitle>
              <CardDescription className="text-xs">
                নির্দিষ্ট ক্যাটাগরিতে ব্যয়ের লিমিট নির্ধারণ করুন এবং ট্র্যাক করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs cursor-pointer flex-1"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {meta.expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input
                  type="number"
                  placeholder="বাজেট পরিমাণ (৳)"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="h-9 text-xs w-full sm:w-48"
                />
                <Button onClick={setBudget} size="sm" className="h-9 px-4 text-xs font-bold shrink-0">
                  বাজেট সেট করুন
                </Button>
              </div>

              {budgetRows.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  কোনো বাজেট সেট করা হয়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {budgetRows.map((b) => {
                    const pct = Math.min(100, Math.round((b.spent / b.budget) * 100));
                    const over = b.spent > b.budget;
                    return (
                      <div key={b.category} className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            {b.category}
                            {over && <Badge variant="destructive" className="text-[10px] h-4 px-1 gap-1"><AlertTriangle size={10} /> ওভার বাজেট!</Badge>}
                          </span>
                          <span className={`font-mono font-bold ${over ? "text-destructive" : "text-muted-foreground"}`}>
                            {taka(b.spent)} / {taka(b.budget)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${over ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => removeBudget(b.category)} className="text-[11px] text-destructive hover:underline cursor-pointer">
                            বাজেট মুছুন
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────── TAB 3: RECURRING ─────────────────── */}
      {tab === "recurring" && (
        <div className="space-y-4">
          {pendingRecurring.length > 0 && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center justify-between flex-wrap gap-2">
              <span>চলতি মাসের {pendingRecurring.length} টি পুনরাবৃত্ত লেনদেন এখনো খাতায় যোগ করা হয়নি।</span>
              <Button size="sm" onClick={generateRecurring} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">
                এখনই যুক্ত করুন
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowRecurringForm(true)} size="sm" className="h-9 text-xs gap-1.5 font-bold">
              <Plus size={15} /> নতুন পুনরাবৃত্ত লেনদেন
            </Button>
          </div>

          <div className="space-y-2.5">
            {(meta.recurring || []).length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-1">
                <Repeat className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold text-foreground">কোনো পুনরাবৃত্ত এন্ট্রি নেই</p>
                <p className="text-xs text-muted-foreground">প্রতি মাসের নিয়মিত খরচ যেমন হোস্টিং, বেতন ইত্যাদি এখানে যোগ করুন।</p>
              </div>
            ) : (
              meta.recurring.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    }`}>
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        প্রতি মাসের {t.dayOfMonth} তারিখে {t.vendor ? `· ${t.vendor}` : ""} {t.description ? `· ${t.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-base font-bold font-mono ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {taka(t.amount)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => deleteRecurringTemplate(t.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {showRecurringForm && (
            <RecurringForm
              meta={meta}
              onSave={addRecurringTemplate}
              onAddMetaOption={addMetaOption}
              onClose={() => setShowRecurringForm(false)}
            />
          )}
        </div>
      )}

      {/* ─────────────────── TAB 4: TRASH ─────────────────── */}
      {tab === "trash" && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
            ℹ️ মুছে ফেলা লেনদেনগুলো এখানে ৭ দিন সংরক্ষিত থাকবে। এর পর স্বয়ংক্রিয়ভাবে স্থায়ীভাবে মুছে যাবে।
          </div>

          <div className="space-y-2.5">
            {trashed.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-1">
                <Trash2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold text-foreground">ট্র্যাশ সম্পূর্ণ খালি</p>
              </div>
            ) : (
              trashed.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{e.category}</p>
                    <p className="text-xs text-muted-foreground">{e.date} · {e.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-muted-foreground">{taka(e.amount)}</span>
                    <Button variant="outline" size="sm" onClick={() => restoreEntry(e.id)} className="h-8 text-xs gap-1 text-emerald-600 border-emerald-500/30">
                      <RotateCcw size={13} /> পুনরুদ্ধার
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => permanentDelete(e.id)} className="h-8 text-xs gap-1">
                      <Trash2 size={13} /> স্থায়ীভাবে ডিলিট
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 5: SETTINGS ─────────────────── */}
      {tab === "settings" && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">ডাটা ম্যানেজমেন্ট ও ব্যাকআপ</CardTitle>
              <CardDescription className="text-xs">
                ক্যাটাগরি, ভেন্ডর বা পেমেন্ট মেথড এডিট অথবা CSV ব্যাকআপ রিসেট করুন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={resetToCSVData} className="h-9 text-xs gap-2 text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                <FileText size={14} /> Reset All Data to ledger_2026-09-25.csv
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EditableList
              title="ব্যয়ের ক্যাটাগরি (Expense Categories)"
              items={meta.expenseCategories}
              onRename={(o, n) => renameMetaOption("expenseCategories", o, n)}
              onDelete={(v) => deleteMetaOption("expenseCategories", v)}
              onAdd={(v) => addMetaOption("expenseCategories", v)}
            />
            <EditableList
              title="আয়ের ক্যাটাগরি (Income Categories)"
              items={meta.incomeCategories}
              onRename={(o, n) => renameMetaOption("incomeCategories", o, n)}
              onDelete={(v) => deleteMetaOption("incomeCategories", v)}
              onAdd={(v) => addMetaOption("incomeCategories", v)}
            />
            <EditableList
              title="ভেন্ডর ও সরবরাহকারী (Vendors / Suppliers)"
              items={meta.vendors}
              onRename={(o, n) => renameMetaOption("vendors", o, n)}
              onDelete={(v) => deleteMetaOption("vendors", v)}
              onAdd={(v) => addMetaOption("vendors", v)}
            />
            <EditableList
              title="পেমেন্ট মেথড (Payment Methods)"
              items={meta.paymentMethods}
              onRename={(o, n) => renameMetaOption("paymentMethods", o, n)}
              onDelete={(v) => deleteMetaOption("paymentMethods", v)}
              onAdd={(v) => addMetaOption("paymentMethods", v)}
            />
          </div>
        </div>
      )}

      {/* Entry Form Modal */}
      {showForm && (
        <EntryForm
          meta={meta}
          initial={editingEntry}
          onSave={saveEntry}
          onAddMetaOption={addMetaOption}
          onClose={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}
    </div>
  );
}
