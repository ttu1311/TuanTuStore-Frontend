// The ONLY place that talks to localStorage / sessionStorage.
// These functions must run in the browser (inside useEffect or an event handler), never during server rendering.
import { initialProducts, initialUsers } from "@/data/initialData";
import type { CartItem, Order, Product, User } from "@/types";

export const STORAGE_KEYS = {
  products: "tuantustore-products",
  users: "tuantustore-users",
  currentUser: "tuantustore-current-user",
  cart: "tuantustore-cart",
  orders: "tuantustore-orders",
  orderSeq: "tuantustore-order-seq", // the last order number used (1 -> "TT-000001")
} as const;

// Reads a JSON value. Returns null when the key is missing, the text is not valid JSON or storage is blocked.
export function readJSON<T>(key: string, storage: Storage = window.localStorage): T | null {
  try {
    const text = storage.getItem(key);
    return text === null ? null : (JSON.parse(text) as T);
  } catch {
    return null;
  }
}

// Saves a value as JSON. Returns false when the browser refuses (storage full or blocked).
export function writeJSON(key: string, value: unknown, storage: Storage = window.localStorage): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// First visit: fill every key that is missing (or unreadable) with its default value.
// A key that already holds valid data is NEVER overwritten, so refreshing the page keeps all changes.
export function initializeStorage() {
  if (!Array.isArray(readJSON(STORAGE_KEYS.products))) writeJSON(STORAGE_KEYS.products, initialProducts);
  if (!Array.isArray(readJSON(STORAGE_KEYS.users))) writeJSON(STORAGE_KEYS.users, initialUsers);
  if (!Array.isArray(readJSON(STORAGE_KEYS.cart))) writeJSON(STORAGE_KEYS.cart, []);
  if (!Array.isArray(readJSON(STORAGE_KEYS.orders))) writeJSON(STORAGE_KEYS.orders, []);
  if (typeof readJSON(STORAGE_KEYS.orderSeq) !== "number") writeJSON(STORAGE_KEYS.orderSeq, 0);
  repairDemoAdmin();
}

// A user as it may be saved in an older browser: an EARLIER version of this project kept a `passwordHash`
// (a hash that cannot be checked any more) instead of `password`.
type SavedUser = Partial<User> & { passwordHash?: string };

// The demo ADMIN of README.md is the only seeded account.
const demoAdmin = initialUsers[0];

// If the demo ADMIN was saved by the earlier version (no `password`), give it its documented password back,
// so the login written in README.md also works in a browser that already holds old data.
// Nothing else is touched: other old accounts stay as they are (login() explains what to do with them).
function repairDemoAdmin() {
  const users = readJSON<SavedUser[]>(STORAGE_KEYS.users);
  if (!Array.isArray(users)) return;

  const needsRepair = (user: SavedUser) => user.id === demoAdmin.id && typeof user.password !== "string";
  if (!users.some(needsRepair)) return;

  writeJSON(
    STORAGE_KEYS.users,
    users.map((user) => {
      if (!needsRepair(user)) return user;
      const repaired = { ...user, password: demoAdmin.password };
      delete repaired.passwordHash; // the old hash is useless now
      return repaired;
    })
  );
}

export type StoredData = {
  products: Product[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  currentUserId: string | null;
};

// Reads everything the website needs from storage
export function loadStoredData(): StoredData {
  return {
    products: readJSON<Product[]>(STORAGE_KEYS.products) ?? [],
    users: readJSON<User[]>(STORAGE_KEYS.users) ?? [],
    orders: readJSON<Order[]>(STORAGE_KEYS.orders) ?? [],
    cart: readJSON<CartItem[]>(STORAGE_KEYS.cart) ?? [],
    currentUserId: readCurrentUserId(),
  };
}

// ---------- Logged-in user ----------
// "Ghi nhớ đăng nhập" ticked   -> the user id is kept in localStorage (stays after closing the browser).
// "Ghi nhớ đăng nhập" unticked -> the user id is kept in sessionStorage (only this tab, gone when the tab closes).

export function readCurrentUserId(): string | null {
  return (
    readJSON<string>(STORAGE_KEYS.currentUser, window.sessionStorage) ??
    readJSON<string>(STORAGE_KEYS.currentUser, window.localStorage)
  );
}

export function saveCurrentUserId(userId: string, remember: boolean): boolean {
  clearCurrentUserId();
  return writeJSON(STORAGE_KEYS.currentUser, userId, remember ? window.localStorage : window.sessionStorage);
}

export function clearCurrentUserId() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.currentUser);
    window.sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  } catch {
    // storage blocked: nothing to clear
  }
}

// A short unique id for new records, e.g. "u-lx3k9a-4f2b"
export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
