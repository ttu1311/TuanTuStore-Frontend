"use client";

// The data of the whole website: products, users, orders, cart and the logged-in user.
//
// How it works:
// 1. On the server and on the very first render in the browser, `isReady` is false and every list is empty.
//    Pages show a loading state, so the server HTML and the first browser render are identical (no hydration error).
// 2. After the first render (useEffect), we fill missing localStorage keys with the default data,
//    read everything from localStorage, and set `isReady` to true.
// 3. Every action below first SAVES the new list to localStorage, then updates the React state.
//    If the browser refuses to save, the state is not changed and the action returns an error message.
//
// This is a front-end simulation: there is no server, and the "security" checks are for the demo only.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import CartToast from "@/components/ui/CartToast";
import { calculateTotals, cleanQuantity, getCartLines } from "@/lib/cart";
import { formatOrderCode, orderNumberFromCode, type CheckoutFields } from "@/lib/orders";
import { isSamePassword } from "@/lib/password";
import { createProductId, type ProductInput } from "@/lib/products";
import {
  STORAGE_KEYS,
  clearCurrentUserId,
  createId,
  initializeStorage,
  loadStoredData,
  readJSON,
  saveCurrentUserId,
  writeJSON,
} from "@/lib/storage";
import { normalizeEmail, normalizePhone, type RegisterValues } from "@/lib/validation";
import type { CartItem, Order, OrderItem, OrderStatus, PaymentMethod, Product, Role, User } from "@/types";

// What every action returns. `field` says which form field the message belongs to (if any).
export type ActionResult = { ok: true } | { ok: false; message: string; field?: string };

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; message: string };

const OK: ActionResult = { ok: true };

function fail(message: string, field?: string): ActionResult {
  return { ok: false, message, field };
}

const SAVE_ERROR = "Không thể lưu dữ liệu vào trình duyệt. Vui lòng thử lại.";
const NO_PERMISSION = "Bạn không có quyền thực hiện thao tác này.";
const WRONG_LOGIN = "Email hoặc mật khẩu không đúng";
// An account saved by an earlier version of this project has no password any more (see repairDemoAdmin in storage.ts)
const OLD_ACCOUNT =
  "Tài khoản này được tạo bằng phiên bản cũ của website nên không dùng được nữa. Hãy nhờ quản trị viên xóa tài khoản này rồi đăng ký lại.";

type StoreValue = {
  isReady: boolean; // false until the data has been read from localStorage
  products: Product[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  currentUser: User | null;

  // Products (Admin)
  addProduct: (input: ProductInput) => ActionResult;
  updateProduct: (id: string, input: ProductInput) => ActionResult;
  deleteProduct: (id: string) => ActionResult;

  // Cart
  addToCart: (productId: string, quantity: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;

  // Account
  register: (values: RegisterValues) => ActionResult;
  login: (email: string, password: string, remember: boolean) => ActionResult;
  logout: () => void;
  updateProfile: (fullName: string, phone: string) => ActionResult;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;

  // Orders
  placeOrder: (customer: CheckoutFields, paymentMethod: PaymentMethod) => PlaceOrderResult;
  updateOrderStatus: (code: string, status: OrderStatus) => ActionResult;
  deleteOrder: (code: string) => ActionResult;

  // Users (Admin)
  changeUserRole: (userId: string, role: Role) => ActionResult;
  deleteUser: (userId: string) => ActionResult;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  // Runs once, in the browser only (the server has no localStorage)
  useEffect(() => {
    function loadFromStorage() {
      const data = loadStoredData();
      setProducts(data.products);
      setUsers(data.users);
      setOrders(data.orders);
      setCart(data.cart);
      setCurrentUserId(data.currentUserId);
    }

    initializeStorage();
    loadFromStorage();
    // The second render here is intentional: the first render must match the server HTML (no localStorage there),
    // and only after it can we show the saved data. This is the standard way to avoid hydration errors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);

    // Another tab changed localStorage (for example the Admin edited a product there): read it again
    window.addEventListener("storage", loadFromStorage);
    return () => window.removeEventListener("storage", loadFromStorage);
  }, []);

  // The logged-in user is looked up in the user list, so a new name or role applies right away
  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const isAdmin = currentUser?.role === "ADMIN";

  // ---------- Saving: localStorage first, then React state ----------

  function saveProducts(next: Product[]) {
    if (!writeJSON(STORAGE_KEYS.products, next)) return false;
    setProducts(next);
    return true;
  }

  function saveUsers(next: User[]) {
    if (!writeJSON(STORAGE_KEYS.users, next)) return false;
    setUsers(next);
    return true;
  }

  function saveOrders(next: Order[]) {
    if (!writeJSON(STORAGE_KEYS.orders, next)) return false;
    setOrders(next);
    return true;
  }

  function saveCart(next: CartItem[]) {
    if (!writeJSON(STORAGE_KEYS.cart, next)) return false;
    setCart(next);
    return true;
  }

  // ---------- Products (Admin) ----------

  function addProduct(input: ProductInput): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    const product: Product = {
      ...input,
      id: createProductId(input.name, products.map((p) => p.id)),
      createdAt: new Date().toISOString(),
    };
    return saveProducts([...products, product]) ? OK : fail(SAVE_ERROR);
  }

  function updateProduct(id: string, input: ProductInput): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!products.some((p) => p.id === id)) return fail("Sản phẩm này không còn tồn tại.");
    // The id and the creation date never change, so links, the cart and old orders keep working
    const next = products.map((p) => (p.id === id ? { ...input, id: p.id, createdAt: p.createdAt } : p));
    return saveProducts(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteProduct(id: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!saveProducts(products.filter((p) => p.id !== id))) return fail(SAVE_ERROR);
    // Old orders keep their own copy of the name and price, so only the cart needs cleaning
    saveCart(cart.filter((item) => item.productId !== id));
    return OK;
  }

  // ---------- Cart ----------

  function addToCart(productId: string, quantity: number) {
    const amount = cleanQuantity(quantity);
    const exists = cart.some((item) => item.productId === productId);
    const saved = saveCart(
      exists
        ? cart.map((item) =>
            item.productId === productId ? { ...item, quantity: cleanQuantity(item.quantity + amount) } : item
          )
        : [...cart, { productId, quantity: amount }]
    );
    const name = products.find((p) => p.id === productId)?.name;
    setToast({
      id: Date.now(),
      message: saved ? `Đã thêm ${name ?? "sản phẩm"} vào giỏ hàng` : SAVE_ERROR,
    });
  }

  function setCartQuantity(productId: string, quantity: number) {
    const amount = cleanQuantity(quantity);
    saveCart(cart.map((item) => (item.productId === productId ? { ...item, quantity: amount } : item)));
  }

  function removeFromCart(productId: string) {
    saveCart(cart.filter((item) => item.productId !== productId));
  }

  // ---------- Account ----------

  // Creates a customer account and logs it in. The role is ALWAYS "USER".
  function register(values: RegisterValues): ActionResult {
    const email = normalizeEmail(values.email);
    if (users.some((user) => user.email === email)) return fail("Email này đã được đăng ký", "email");

    const user: User = {
      id: createId("u"),
      name: values.fullName.trim(),
      email,
      phone: normalizePhone(values.phone),
      password: values.password, // plain text: front-end demo only (see src/lib/password.ts)
      role: "USER",
      createdAt: new Date().toISOString(),
    };
    if (!saveUsers([...users, user])) return fail(SAVE_ERROR);

    saveCurrentUserId(user.id, false);
    setCurrentUserId(user.id);
    return OK;
  }

  function login(email: string, password: string, remember: boolean): ActionResult {
    const user = users.find((u) => u.email === normalizeEmail(email));
    if (user && typeof user.password !== "string") return fail(OLD_ACCOUNT);
    // The same message for a wrong email and a wrong password
    if (!user || !isSamePassword(password, user.password)) return fail(WRONG_LOGIN);

    if (!saveCurrentUserId(user.id, remember)) return fail(SAVE_ERROR);
    setCurrentUserId(user.id);
    return OK;
  }

  // Only forgets who is logged in. Users, products, orders and the cart stay.
  function logout() {
    clearCurrentUserId();
    setCurrentUserId(null);
  }

  // Name and phone of the logged-in user. The email and the role cannot be changed here.
  function updateProfile(fullName: string, phone: string): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập lại.");
    const next = users.map((user) =>
      user.id === currentUser.id ? { ...user, name: fullName.trim(), phone: normalizePhone(phone) } : user
    );
    return saveUsers(next) ? OK : fail(SAVE_ERROR);
  }

  function changePassword(currentPassword: string, newPassword: string): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập lại.");
    if (!isSamePassword(currentPassword, currentUser.password)) {
      return fail("Mật khẩu hiện tại không đúng", "currentPassword");
    }

    const next = users.map((user) => (user.id === currentUser.id ? { ...user, password: newPassword } : user));
    return saveUsers(next) ? OK : fail(SAVE_ERROR);
  }

  // ---------- Orders ----------

  // Creates an order from the cart, using the CURRENT prices in localStorage.
  function placeOrder(customer: CheckoutFields, paymentMethod: PaymentMethod): PlaceOrderResult {
    const lines = getCartLines(cart, products);
    if (lines.length === 0) return { ok: false, message: "Giỏ hàng của bạn đang trống." };

    // A copy of each product at purchase time: later price changes never change this order
    const items: OrderItem[] = lines.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    }));
    const totals = calculateTotals(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

    // One more than the last number ever used, so the code of a deleted order is never given again
    const lastNumber = Math.max(
      readJSON<number>(STORAGE_KEYS.orderSeq) ?? 0,
      ...orders.map((order) => orderNumberFromCode(order.code))
    );

    const order: Order = {
      code: formatOrderCode(lastNumber + 1),
      userId: currentUser?.id ?? null, // guest checkout: no user
      customerName: customer.fullName.trim(),
      phone: normalizePhone(customer.phone),
      email: normalizeEmail(customer.email),
      province: customer.province.trim(),
      district: customer.district.trim(),
      ward: customer.ward.trim(),
      address: customer.address.trim(),
      note: customer.note.trim(),
      paymentMethod,
      status: "PENDING",
      items,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      createdAt: new Date().toISOString(),
    };

    if (!saveOrders([...orders, order])) {
      return { ok: false, message: "Không thể lưu đơn hàng. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại." };
    }
    writeJSON(STORAGE_KEYS.orderSeq, lastNumber + 1);

    // The order is saved: only now is it safe to empty the cart
    saveCart([]);
    return { ok: true, order };
  }

  function updateOrderStatus(code: string, status: OrderStatus): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!orders.some((order) => order.code === code)) return fail("Đơn hàng này không còn tồn tại.");
    const next = orders.map((order) => (order.code === code ? { ...order, status } : order));
    return saveOrders(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteOrder(code: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    return saveOrders(orders.filter((order) => order.code !== code)) ? OK : fail(SAVE_ERROR);
  }

  // ---------- Users (Admin) ----------

  function adminCount() {
    return users.filter((user) => user.role === "ADMIN").length;
  }

  function changeUserRole(userId: string, role: Role): ActionResult {
    if (!isAdmin || !currentUser) return fail(NO_PERMISSION);
    // Rule 1: the account you are logged in with cannot change its own role
    if (userId === currentUser.id) return fail("Bạn không thể tự thay đổi vai trò của tài khoản đang đăng nhập.");

    const target = users.find((user) => user.id === userId);
    if (!target) return fail("Người dùng này không còn tồn tại.");
    if (target.role === role) return OK;

    // Rule 2: the website must always keep at least one ADMIN
    if (target.role === "ADMIN" && adminCount() <= 1) {
      return fail("Không thể hạ quyền: hệ thống phải có ít nhất một quản trị viên.");
    }

    const next = users.map((user) => (user.id === userId ? { ...user, role } : user));
    return saveUsers(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteUser(userId: string): ActionResult {
    if (!isAdmin || !currentUser) return fail(NO_PERMISSION);
    if (userId === currentUser.id) return fail("Bạn không thể xóa tài khoản đang đăng nhập.");

    const target = users.find((user) => user.id === userId);
    if (!target) return fail("Người dùng này không còn tồn tại.");
    if (target.role === "ADMIN" && adminCount() <= 1) {
      return fail("Không thể xóa: hệ thống phải có ít nhất một quản trị viên.");
    }

    if (!saveUsers(users.filter((user) => user.id !== userId))) return fail(SAVE_ERROR);

    // The orders of this user are kept, as guest orders, so the order history is not lost
    if (orders.some((order) => order.userId === userId)) {
      saveOrders(orders.map((order) => (order.userId === userId ? { ...order, userId: null } : order)));
    }
    return OK;
  }

  return (
    <StoreContext.Provider
      value={{
        isReady,
        products,
        users,
        orders,
        cart,
        currentUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        setCartQuantity,
        removeFromCart,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        changeUserRole,
        deleteUser,
      }}
    >
      {children}
      <CartToast toast={toast} onClose={closeToast} />
    </StoreContext.Provider>
  );
}

// Use it in any client component: const { products, addToCart } = useStore();
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}
