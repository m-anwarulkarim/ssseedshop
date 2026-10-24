// Local & Offline Safe Supabase Proxy
// Ss Seed Shop has transitioned to PHP PDO & MySQL Backend (https://api.ssseedshop.com)
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { compressImageToWebP } from '@/lib/imageCompressor';
import { API_BASE } from '@/lib/apiConfig';

interface FilterRule {
  type: "eq" | "neq" | "gte" | "lte" | "gt" | "lt" | "in";
  col: string;
  val: any;
}

interface QueryPlan {
  table: string;
  select?: string;
  filters: FilterRule[];
  orderRules: Array<{ col: string; ascending: boolean }>;
  limitVal?: number;
  single?: boolean;
  maybeSingle?: boolean;
  insertPayload?: any;
  upsertPayload?: any;
  updatePayload?: any;
  isDelete?: boolean;
}

function normalizePhone(p: any): string {
  if (!p) return "";
  const clean = String(p).replace(/\D/g, "");
  return clean.slice(-11);
}

function parseTime(val: any): number {
  if (!val) return NaN;
  const s = String(val).replace(" ", "T");
  return new Date(s).getTime();
}

function applyPlanFilters(rows: any[], plan: QueryPlan): any[] {
  let list = Array.isArray(rows) ? [...rows] : [];

  for (const f of plan.filters) {
    if (f.type === "eq") {
      list = list.filter((item) => {
        if (!item) return false;
        if (f.col === "phone") {
          const target = normalizePhone(f.val);
          const p1 = normalizePhone(item.phone);
          const p2 = normalizePhone(item.alt_phone);
          if (target.length < 11) return false;
          return p1 === target || (p2.length >= 11 && p2 === target);
        }
        if (f.col === "id" || f.col === "order_id") {
          const checkVal = String(f.val);
          return String(item.id) === checkVal || String(item.order_id) === checkVal;
        }
        if (typeof f.val === "boolean") {
          return Boolean(item[f.col]) === f.val;
        }
        return String(item[f.col]) === String(f.val);
      });
    } else if (f.type === "neq") {
      list = list.filter((item) => {
        if (!item) return true;
        if (f.col === "id" || f.col === "order_id") {
          const checkVal = String(f.val);
          return String(item.id) !== checkVal && String(item.order_id) !== checkVal;
        }
        return String(item[f.col]) !== String(f.val);
      });
    } else if (f.type === "gte") {
      const gteTime = parseTime(f.val);
      list = list.filter((item) => {
        if (!item || !item[f.col]) return false;
        const itemTime = parseTime(item[f.col]);
        return !isNaN(gteTime) && !isNaN(itemTime) ? itemTime >= gteTime : item[f.col] >= f.val;
      });
    } else if (f.type === "lte") {
      const lteTime = parseTime(f.val);
      list = list.filter((item) => {
        if (!item || !item[f.col]) return false;
        const itemTime = parseTime(item[f.col]);
        return !isNaN(lteTime) && !isNaN(itemTime) ? itemTime <= lteTime : item[f.col] <= f.val;
      });
    } else if (f.type === "in") {
      const arr = Array.isArray(f.val) ? f.val.map(String) : [];
      list = list.filter((item) => item && arr.includes(String(item[f.col])));
    }
  }

  // Sorting
  for (const rule of plan.orderRules) {
    list.sort((a, b) => {
      const aVal = a?.[rule.col];
      const bVal = b?.[rule.col];
      if (aVal === bVal) return 0;
      if (rule.col === "created_at" || rule.col === "updated_at") {
        const timeA = parseTime(aVal) || 0;
        const timeB = parseTime(bVal) || 0;
        return rule.ascending ? timeA - timeB : timeB - timeA;
      }
      if (aVal > bVal) return rule.ascending ? 1 : -1;
      return rule.ascending ? -1 : 1;
    });
  }

  // Limit
  if (typeof plan.limitVal === "number" && plan.limitVal > 0) {
    list = list.slice(0, plan.limitVal);
  }

  return list;
}

// Safe query execution handler
async function executeQuery(table: string, plan: QueryPlan): Promise<{ data: any; error: null; count?: number }> {
  try {
    // 1. Settings / app_settings
    if (table === "app_settings" || table === "settings") {
      if (plan.upsertPayload || plan.insertPayload || plan.updatePayload) {
        const payload = plan.upsertPayload || plan.insertPayload || plan.updatePayload;
        const res = await fetch(`${API_BASE}/settings/update.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: Array.isArray(payload) ? payload : [payload] }),
        });
        const json = await res.json().catch(() => ({}));
        return { data: json, error: null };
      }
      let queryParam = "";
      const inKey = plan.filters.find(f => f.type === "in" && f.col === "key");
      const eqKey = plan.filters.find(f => f.type === "eq" && f.col === "key");
      if (inKey && Array.isArray(inKey.val)) {
        queryParam = `?keys=${encodeURIComponent(inKey.val.join(","))}`;
      } else if (eqKey) {
        queryParam = `?key=${encodeURIComponent(eqKey.val)}`;
      }
      const res = await fetch(`${API_BASE}/settings/get.php${queryParam}`);
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json) ? json : [json];
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 2. Tags
    if (table === "tags") {
      if (plan.insertPayload || plan.upsertPayload) {
        const payload = plan.insertPayload || plan.upsertPayload;
        const res = await fetch(`${API_BASE}/tags/create.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        return { data: json, error: null };
      }
      const res = await fetch(`${API_BASE}/tags/get.php`);
      if (res.ok) {
        const json = await res.json();
        const data = applyPlanFilters(Array.isArray(json) ? json : [], plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 3. Categories
    if (table === "categories") {
      const res = await fetch(`${API_BASE}/categories/get.php`);
      if (res.ok) {
        const json = await res.json();
        const data = applyPlanFilters(Array.isArray(json) ? json : [], plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 4. Subcategories
    if (table === "subcategories") {
      const res = await fetch(`${API_BASE}/categories/subcategories.php`);
      if (res.ok) {
        const json = await res.json();
        const data = applyPlanFilters(Array.isArray(json) ? json : [], plan);
        return { data, error: null, count: data.length };
      }
    }

    // 5. Products / products_public
    if (table === "products" || table === "products_public") {
      if (plan.insertPayload || plan.upsertPayload || plan.updatePayload) {
        const payload = plan.insertPayload || plan.upsertPayload || plan.updatePayload;
        const res = await fetch(`${API_BASE}/products/save.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        return { data: json, error: null };
      }
      let endpoint = `${API_BASE}/products/get.php`;
      const idEq = plan.filters.find(f => f.type === "eq" && f.col === "id");
      if (idEq) {
        endpoint = `${API_BASE}/products/get_single.php?id=${encodeURIComponent(idEq.val)}`;
      }
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        const raw = Array.isArray(json) ? json : (json?.data || [json]);
        const data = applyPlanFilters(raw, plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 6. Orders
    if (table === "orders") {
      if (plan.updatePayload) {
        const idEq = plan.filters.find(f => f.type === "eq" && f.col === "id");
        const inId = plan.filters.find(f => f.type === "in" && f.col === "id");
        const ids = inId?.val || (idEq ? [idEq.val] : []);
        if (ids.length > 0) {
          await fetch(`${API_BASE}/orders/update.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, ...plan.updatePayload }),
          }).catch(() => {});
        }
        return { data: null, error: null };
      }

      // Check if phone filter is present to optimize fetch
      const phoneFilter = plan.filters.find(f => f.type === "eq" && f.col === "phone");
      let endpoint = `${API_BASE}/orders/get.php`;
      if (phoneFilter && phoneFilter.val) {
        endpoint += `?phone=${encodeURIComponent(phoneFilter.val)}`;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        const raw = Array.isArray(json) ? json : (json?.orders || []);
        // Strictly filter using caller's criteria (phone, is_deleted, created_at, id)
        const data = applyPlanFilters(raw, plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 7. Visitor Profiles / Customers
    if (table === "visitor_profiles" || table === "visitors") {
      const res = await fetch(`${API_BASE}/orders/get.php`);
      if (res.ok) {
        const orders = await res.json();
        const rawOrders = Array.isArray(orders) ? orders : [];
        const profiles = rawOrders.map((o: any) => ({
          id: o.visitor_profile_id || o.id,
          visitor_id: o.visitor_id,
          name: o.customer_name,
          phone: o.phone,
          alt_phone: o.alt_phone,
          address: o.address,
          created_at: o.created_at,
        }));
        const data = applyPlanFilters(profiles, plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 8. Order Items
    if (table === "order_items") {
      const res = await fetch(`${API_BASE}/orders/get.php`);
      if (res.ok) {
        const orders = await res.json();
        const rawOrders = Array.isArray(orders) ? orders : [];
        const allItems: any[] = [];
        for (const o of rawOrders) {
          const items = Array.isArray(o.items) ? o.items : [];
          for (let idx = 0; idx < items.length; idx++) {
            const it = items[idx];
            allItems.push({
              id: it.id || `${o.id}_item_${idx}`,
              order_id: o.id,
              product_id: it.product_id,
              product_name: it.product_name,
              product_image: it.product_image,
              unit_price: it.unit_price,
              quantity: it.quantity,
              products: {
                product_image: it.product_image,
                short_description: it.product_name,
                regular_price: it.unit_price,
              },
            });
          }
        }
        const data = applyPlanFilters(allItems, plan);
        if (plan.single || plan.maybeSingle) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null, count: data.length };
      }
    }

    // 9. Order Status History
    if (table === "order_status_history") {
      if (plan.insertPayload) {
        return { data: plan.insertPayload, error: null };
      }
      return { data: [], error: null, count: 0 };
    }
  } catch {
    // Fall through on any fetch error
  }

  // Safe empty fallbacks for any other table or failed fetch
  if (plan.single || plan.maybeSingle) {
    return { data: null, error: null };
  }
  return { data: [], error: null, count: 0 };
}

function createQueryBuilder(table: string, plan?: Partial<QueryPlan>): any {
  const currentPlan: QueryPlan = {
    table,
    filters: plan?.filters ? [...plan.filters] : [],
    orderRules: plan?.orderRules ? [...plan.orderRules] : [],
    select: plan?.select,
    limitVal: plan?.limitVal,
    single: plan?.single,
    maybeSingle: plan?.maybeSingle,
    insertPayload: plan?.insertPayload,
    upsertPayload: plan?.upsertPayload,
    updatePayload: plan?.updatePayload,
    isDelete: plan?.isDelete,
  };

  const handler: ProxyHandler<any> = {
    get(target, prop: string | symbol) {
      if (prop === "then") {
        return (resolve: any, reject?: any) => {
          return executeQuery(table, currentPlan).then(resolve, reject);
        };
      }
      if (prop === "catch") {
        return (reject: any) => Promise.resolve({ data: null, error: null }).catch(reject);
      }
      return (...args: any[]) => {
        const next: QueryPlan = {
          ...currentPlan,
          filters: [...currentPlan.filters],
          orderRules: [...currentPlan.orderRules],
        };
        const name = String(prop);
        if (name === "select") {
          next.select = args[0];
        } else if (name === "eq") {
          next.filters.push({ type: "eq", col: args[0], val: args[1] });
        } else if (name === "neq") {
          next.filters.push({ type: "neq", col: args[0], val: args[1] });
        } else if (name === "gte") {
          next.filters.push({ type: "gte", col: args[0], val: args[1] });
        } else if (name === "lte") {
          next.filters.push({ type: "lte", col: args[0], val: args[1] });
        } else if (name === "gt") {
          next.filters.push({ type: "gt", col: args[0], val: args[1] });
        } else if (name === "lt") {
          next.filters.push({ type: "lt", col: args[0], val: args[1] });
        } else if (name === "in") {
          next.filters.push({ type: "in", col: args[0], val: args[1] });
        } else if (name === "order") {
          next.orderRules.push({ col: args[0], ascending: args[1]?.ascending ?? true });
        } else if (name === "limit") {
          next.limitVal = Number(args[0]);
        } else if (name === "single") {
          next.single = true;
        } else if (name === "maybeSingle") {
          next.maybeSingle = true;
        } else if (name === "insert") {
          next.insertPayload = args[0];
        } else if (name === "upsert") {
          next.upsertPayload = args[0];
        } else if (name === "update") {
          next.updatePayload = args[0];
        } else if (name === "delete") {
          next.isDelete = true;
        }
        return createQueryBuilder(table, next);
      };
    },
  };
  return new Proxy({}, handler);
}

const dummyChannel: any = {
  on: () => dummyChannel,
  subscribe: () => dummyChannel,
  unsubscribe: () => {},
};

export const supabase = {
  from: (table: string) => createQueryBuilder(table),
  rpc: async (_name: string, _args?: any) => ({ data: null, error: null }),
  functions: {
    invoke: async (name: string, opts?: any) => {
      if (name === "sms-api") {
        try {
          const body = opts?.body || {};
          const res = await fetch(`${API_BASE}/settings/sms_api.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: body.action || "send_sms",
              number: body.number || body.phone,
              message: body.message,
              reason: body.reason || "manual"
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: new Error(data?.error || "SMS failed") };
          }
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
      return { data: null, error: null };
    },
  },
  channel: (_name: string) => dummyChannel,
  removeChannel: (_ch: any) => {},
  removeAllChannels: () => {},
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        try {
          let fileToUpload = file;
          if (file instanceof File && file.type?.startsWith("image/")) {
            fileToUpload = await compressImageToWebP(file);
          }
          const formData = new FormData();
          formData.append("file", fileToUpload, fileToUpload?.name || (file instanceof File ? file.name : "upload.webp"));
          formData.append("bucket", bucket);
          const res = await fetch(`${API_BASE}/media/upload.php`, {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          return { data: { path: json?.url || path }, error: null };
        } catch (e: any) {
          return { data: null, error: e };
        }
      },
      getPublicUrl: (path: string) => {
        const url = path.startsWith("http") ? path : `${API_BASE}/uploads/${path}`;
        return { data: { publicUrl: url } };
      },
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
    }),
  },
} as unknown as SupabaseClient<Database>;