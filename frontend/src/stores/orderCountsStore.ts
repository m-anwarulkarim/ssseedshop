import { useSyncExternalStore } from "react";

// Status → bucket map for WebOrders page (1:1 with WEB_STATUS_VALUES)
const WEB_BUCKET_OF: Record<string, string> = {
  pending: "pending",
  no_response: "no_response",
  good_but_no_response: "good_but_no_response",
  busy: "busy",
  hold: "hold",
  pre: "pre",
  cancelled: "cancelled",
  confirmed: "confirmed",
};

// Status → bucket map for OrderList page (mirrors FILTER_GROUPS in OrderList.tsx)
const LIST_BUCKET_OF: Record<string, string> = {
  confirmed: "confirmed",
  printed: "printed",
  entry_done: "entry_done",
  shipped: "shipped",
  on_the_way: "shipped",
  hold: "shipped",
  delivered: "delivered",
  delivered_approval_pending: "delivered",
  partial: "partial",
  partial_delivered: "partial",
  partial_delivered_approval_pending: "partial",
  pending_return: "pending_return",
  cancelled_approval_pending: "pending_return",
  return: "return",
  rtn_received: "return",
  cancelled: "cancelled",
  missing: "missing",
  unknown_approval_pending: "missing",
};

type CountsSnapshot = Record<string, number> | null;

interface State {
  webCounts: CountsSnapshot;
  listCounts: CountsSnapshot;
}

let state: State = { webCounts: null, listCounts: null };
const subs = new Set<() => void>();
const notify = () => subs.forEach((cb) => cb());
const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

export function setWebCounts(snapshot: Record<string, number>) {
  state = { ...state, webCounts: { ...snapshot } };
  notify();
}

export function setListCounts(snapshot: Record<string, number>) {
  state = { ...state, listCounts: { ...snapshot } };
  notify();
}

function applyDelta(
  slice: CountsSnapshot,
  bucketMap: Record<string, string>,
  oldStatus?: string | null,
  newStatus?: string | null,
): CountsSnapshot {
  if (!slice) return slice; // nothing cached yet → wait for server fetch
  const oldBucket = oldStatus ? bucketMap[oldStatus] : undefined;
  const newBucket = newStatus ? bucketMap[newStatus] : undefined;
  if (oldBucket === newBucket) return slice;

  const next = { ...slice };
  const dec = (k: string) => { next[k] = Math.max(0, (next[k] || 0) - 1); };
  const inc = (k: string) => { next[k] = (next[k] || 0) + 1; };

  let allDelta = 0;
  if (oldBucket && !newBucket) { dec(oldBucket); allDelta -= 1; }
  else if (!oldBucket && newBucket) { inc(newBucket); allDelta += 1; }
  else if (oldBucket && newBucket) { dec(oldBucket); inc(newBucket); }

  if (allDelta !== 0) {
    next.all = Math.max(0, (next.all || 0) + allDelta);
  }
  return next;
}

export function applyStatusChange(oldStatus?: string | null, newStatus?: string | null) {
  if (!oldStatus && !newStatus) return;
  const webCounts = applyDelta(state.webCounts, WEB_BUCKET_OF, oldStatus, newStatus);
  const listCounts = applyDelta(state.listCounts, LIST_BUCKET_OF, oldStatus, newStatus);
  if (webCounts !== state.webCounts || listCounts !== state.listCounts) {
    state = { webCounts, listCounts };
    notify();
  }
}

const getWebSnapshot = () => state.webCounts;
const getListSnapshot = () => state.listCounts;

export function useWebCounts(): CountsSnapshot {
  return useSyncExternalStore(subscribe, getWebSnapshot, getWebSnapshot);
}

export function useListCounts(): CountsSnapshot {
  return useSyncExternalStore(subscribe, getListSnapshot, getListSnapshot);
}
