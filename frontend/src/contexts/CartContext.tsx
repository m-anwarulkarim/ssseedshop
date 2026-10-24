import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { trackAddToCart } from "@/components/TrackingScripts";
import { trackEvent } from "@/hooks/useAnalyticsTracker";

export interface CartItemTag {
  name: string;
  icon: string;
  color: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  quantity: number;
  maxStock?: number | null;
  shortDescription?: string | null;
  tags?: CartItemTag[];
  variationId?: string | null;
  variationName?: string | null;
  sku?: string | null;
  isFreeGift?: boolean;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, variationId?: string | null) => void;
  updateQuantity: (id: string, quantity: number, variationId?: string | null) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = "cart-items";

function saveCartSafely(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err: any) {
    try {
      // Storage quota exceeded! Clear non-essential large caches from localStorage
      const purgeKeys = [
        "agroseed:ledger-entries-en",
        "agroseed:ledger-meta-en",
        "agroseed_ledger_entries_v2",
        "admin_support_tickets",
        "search_history",
        "order_search_history",
      ];
      for (const k of purgeKeys) {
        try { localStorage.removeItem(k); } catch {}
      }

      // Purge any key larger than 30KB except essential auth
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key !== CART_STORAGE_KEY && key !== "admin_session" && key !== "admin_token" && key !== "customer_session") {
          const val = localStorage.getItem(key);
          if (val && val.length > 30000) {
            try { localStorage.removeItem(key); } catch {}
          }
        }
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback: Save compact representation without heavy images
      try {
        const compactItems = items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          oldPrice: i.oldPrice,
          image: i.image && i.image.startsWith("data:") ? "" : i.image,
          quantity: i.quantity,
          variationId: i.variationId,
          variationName: i.variationName,
          sku: i.sku,
          isFreeGift: i.isFreeGift,
        }));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compactItems));
      } catch {
        // Last resort: Keep working in memory without crashing React
      }
    }
  }
}

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed: CartItem[] = JSON.parse(stored);
    // Free gift items are always limited to 1 (also normalizes legacy entries)
    return parsed.map((i) => {
      const isGift = i.isFreeGift || i.variationName === "ফ্রি" || /\(ফ্রি উপহার\)$/.test(i.name || "");
      return isGift ? { ...i, isFreeGift: true, quantity: Math.min(i.quantity || 1, 1) } : i;
    });
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage safely
  useEffect(() => {
    saveCartSafely(items);
  }, [items]);

  const openCart = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeCart = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const getCartKey = (id: string, variationId?: string | null) => variationId ? `${id}::${variationId}` : id;

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    const key = getCartKey(newItem.id, newItem.variationId);
    let blocked = false;
    let freeGiftDuplicate = false;
    setItems((prev) => {
      const existing = prev.find((i) => getCartKey(i.id, i.variationId) === key);
      if (existing) {
        // Free gift items are hard-capped at 1 — repeated clicks never increase them
        if (newItem.isFreeGift || existing.isFreeGift) {
          if (existing.quantity >= 1) {
            freeGiftDuplicate = true;
            return prev;
          }
          return prev.map((i) =>
            getCartKey(i.id, i.variationId) === key ? { ...i, quantity: 1, isFreeGift: true } : i
          );
        }
        const max = newItem.maxStock ?? existing.maxStock;
        if (typeof max === "number" && existing.quantity >= max) {
          blocked = true;
          return prev;
        }
        return prev.map((i) =>
          getCartKey(i.id, i.variationId) === key
            ? { ...i, quantity: i.quantity + 1, maxStock: max ?? i.maxStock }
            : i
        );
      }
      if (typeof newItem.maxStock === "number" && newItem.maxStock < 1) {
        blocked = true;
        return prev;
      }
      // New free gift always enters the cart with quantity 1
      if (newItem.isFreeGift) return [...prev, { ...newItem, quantity: 1, isFreeGift: true }];
      return [...prev, { ...newItem, quantity: 1 }];
    });
    if (freeGiftDuplicate) {
      toast.error("ফ্রি প্রোডাক্ট সর্বোচ্চ ১টি নেওয়া যাবে");
      return;
    }
    if (blocked) {
      toast.error(`সর্বোচ্চ ${newItem.maxStock} টি অর্ডার করা যাবে (স্টক সীমা)`);
      return;
    }
    trackAddToCart(newItem, newItem.price);
    trackEvent("add_to_cart", { productId: newItem.id, productName: newItem.name });
  };

  const removeItem = (id: string, variationId?: string | null) => {
    const key = getCartKey(id, variationId);
    setItems((prev) => prev.filter((i) => getCartKey(i.id, i.variationId) !== key));
  };

  const updateQuantity = (id: string, quantity: number, variationId?: string | null) => {
    if (quantity <= 0) {
      removeItem(id, variationId);
      return;
    }
    const key = getCartKey(id, variationId);
    let capped = false;
    let capValue = 0;
    setItems((prev) =>
      prev.map((i) => {
        if (getCartKey(i.id, i.variationId) !== key) return i;
        // Free gift quantity can never exceed 1
        if (i.isFreeGift && quantity > 1) {
          capped = true;
          capValue = 1;
          return { ...i, quantity: 1 };
        }
        let next = quantity;
        if (typeof i.maxStock === "number" && next > i.maxStock) {
          capped = true;
          capValue = i.maxStock;
          next = i.maxStock;
        }
        return { ...i, quantity: next };
      })
    );
    if (capped) toast.error(`সর্বোচ্চ ${capValue} টি অর্ডার করা যাবে (স্টক সীমা)`);
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
