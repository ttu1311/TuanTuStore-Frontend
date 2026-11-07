"use client";

// Dữ liệu của toàn bộ website: sản phẩm, người dùng, đơn hàng, giỏ hàng và người đang đăng nhập.
//
// Cách hoạt động:
// 1. Trên server và ở lần render đầu tiên trong trình duyệt, `isReady` là false và mọi danh sách đều rỗng.
//    Các trang hiện trạng thái đang tải, nên HTML từ server và lần render đầu ở trình duyệt giống hệt nhau (không lỗi hydration).
// 2. Sau lần render đầu (useEffect), ta điền các khóa localStorage còn thiếu bằng dữ liệu mặc định,
//    đọc mọi thứ từ localStorage, rồi đặt `isReady` thành true.
// 3. Mỗi thao tác bên dưới đều LƯU danh sách mới vào localStorage trước, rồi mới cập nhật state React.
//    Nếu trình duyệt từ chối lưu, state không đổi và thao tác trả về một thông báo lỗi.
//
// Đây là mô phỏng front-end: không có server, và các kiểm tra "bảo mật" chỉ dành cho bản demo.
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
import { MAX_COMMENT_LENGTH, reviewEligibility } from "@/lib/reviews";
import type { CartItem, Order, OrderItem, OrderStatus, PaymentMethod, Product, Review, Role, User } from "@/types";

// Kết quả mà mọi thao tác trả về. `field` cho biết thông báo thuộc về ô nhập nào (nếu có).
export type ActionResult = { ok: true } | { ok: false; message: string; field?: string };

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; message: string };

const OK: ActionResult = { ok: true };

function fail(message: string, field?: string): ActionResult {
  return { ok: false, message, field };
}

const SAVE_ERROR = "Không thể lưu dữ liệu vào trình duyệt. Vui lòng thử lại.";
const NO_PERMISSION = "Bạn không có quyền thực hiện thao tác này.";
const WRONG_LOGIN = "Email hoặc mật khẩu không đúng";
// Tài khoản lưu bởi phiên bản cũ của dự án không còn mật khẩu nữa (xem repairDemoAdmin trong storage.ts)
const OLD_ACCOUNT =
  "Tài khoản này được tạo bằng phiên bản cũ của website nên không dùng được nữa. Hãy nhờ quản trị viên xóa tài khoản này rồi đăng ký lại.";

type StoreValue = {
  isReady: boolean; // false cho tới khi dữ liệu được đọc xong từ localStorage
  products: Product[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  reviews: Review[];
  currentUser: User | null;

  // Sản phẩm (Admin)
  // replaceRank: true = đồng ý lấy thứ hạng (ví dụ Top 1) từ sản phẩm đang giữ nó
  addProduct: (input: ProductInput, replaceRank?: boolean) => ActionResult;
  updateProduct: (id: string, input: ProductInput, replaceRank?: boolean) => ActionResult;
  deleteProduct: (id: string) => ActionResult;

  // Giỏ hàng
  addToCart: (productId: string, quantity: number) => void;
  // Thêm nhiều sản phẩm (mỗi món 1) một lần, với MỘT thông báo (dùng cho "Hộp quà Ba Miền")
  addManyToCart: (productIds: string[], message: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void; // làm trống cả giỏ hàng

  // Tài khoản
  register: (values: RegisterValues) => ActionResult;
  login: (email: string, password: string, remember: boolean) => ActionResult;
  logout: () => void;
  updateProfile: (fullName: string, phone: string) => ActionResult;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;

  // Đơn hàng
  // gift: có = gói quà (miễn phí) kèm lời nhắn trên thiệp
  placeOrder: (customer: CheckoutFields, paymentMethod: PaymentMethod, gift?: { message: string }) => PlaceOrderResult;
  updateOrderStatus: (code: string, status: OrderStatus) => ActionResult;
  deleteOrder: (code: string) => ActionResult;

  // Đánh giá: chỉ khách đã nhận hàng; viết lại thì thay đánh giá cũ của chính mình
  submitReview: (productId: string, rating: number, comment: string) => ActionResult;
  deleteReview: (reviewId: string) => ActionResult; // người viết hoặc ADMIN

  // Người dùng (Admin)
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  // Chạy một lần, chỉ ở trình duyệt (server không có localStorage)
  useEffect(() => {
    function loadFromStorage() {
      const data = loadStoredData();
      setProducts(data.products);
      setUsers(data.users);
      setOrders(data.orders);
      setCart(data.cart);
      setReviews(data.reviews);
      setCurrentUserId(data.currentUserId);
    }

    initializeStorage();
    loadFromStorage();
    // Lần render thứ hai ở đây là có chủ đích: lần render đầu phải khớp HTML từ server (ở đó không có localStorage),
    // và chỉ sau đó ta mới hiển thị dữ liệu đã lưu. Đây là cách chuẩn để tránh lỗi hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);

    // Một tab khác đã đổi localStorage (ví dụ Admin sửa sản phẩm ở đó): đọc lại
    window.addEventListener("storage", loadFromStorage);
    return () => window.removeEventListener("storage", loadFromStorage);
  }, []);

  // Người đang đăng nhập được tra trong danh sách người dùng, nên tên hoặc vai trò mới có hiệu lực ngay
  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const isAdmin = currentUser?.role === "ADMIN";

  // ---------- Lưu: localStorage trước, rồi đến state React ----------

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

  function saveReviews(next: Review[]) {
    if (!writeJSON(STORAGE_KEYS.reviews, next)) return false;
    setReviews(next);
    return true;
  }

  function saveCart(next: CartItem[]) {
    if (!writeJSON(STORAGE_KEYS.cart, next)) return false;
    setCart(next);
    return true;
  }

  // ---------- Sản phẩm (Admin) ----------

  // Mỗi thứ hạng chỉ có một sản phẩm. Trả về danh sách mới sau khi xử lý trùng thứ hạng,
  // hoặc thông báo lỗi nếu thứ hạng đang có người giữ mà Admin chưa đồng ý thay thế.
  function resolveRank(list: Product[], id: string | null, rank: number | undefined, replaceRank: boolean) {
    const holder = rank === undefined ? undefined : list.find((p) => p.rank === rank && p.id !== id);
    if (!holder) return { list };
    if (!replaceRank) return { error: `"${holder.name}" đang là Top ${rank}. Hãy xác nhận thay thế hoặc chọn thứ hạng khác.` };
    // Sản phẩm cũ mất thứ hạng, nhưng mọi thứ khác của nó giữ nguyên
    return { list: list.map((p) => (p.id === holder.id ? { ...p, rank: undefined } : p)) };
  }

  function addProduct(input: ProductInput, replaceRank = false): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    const ranked = resolveRank(products, null, input.rank, replaceRank);
    if (!ranked.list) return fail(ranked.error);
    const product: Product = {
      ...input,
      id: createProductId(input.name, products.map((p) => p.id)),
      createdAt: new Date().toISOString(),
    };
    return saveProducts([...ranked.list, product]) ? OK : fail(SAVE_ERROR);
  }

  function updateProduct(id: string, input: ProductInput, replaceRank = false): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!products.some((p) => p.id === id)) return fail("Sản phẩm này không còn tồn tại.");
    const ranked = resolveRank(products, id, input.rank, replaceRank);
    if (!ranked.list) return fail(ranked.error);
    // Id và ngày tạo không bao giờ đổi, nên các liên kết, giỏ hàng và đơn hàng cũ vẫn hoạt động
    const next = ranked.list.map((p) => (p.id === id ? { ...input, id: p.id, createdAt: p.createdAt } : p));
    return saveProducts(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteProduct(id: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!saveProducts(products.filter((p) => p.id !== id))) return fail(SAVE_ERROR);
    // Đơn hàng cũ giữ bản sao tên và giá của riêng chúng, nên chỉ giỏ hàng cần dọn
    saveCart(cart.filter((item) => item.productId !== id));
    return OK;
  }

  // ---------- Giỏ hàng ----------

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

  function addManyToCart(productIds: string[], message: string) {
    let next = cart;
    for (const productId of productIds) {
      next = next.some((item) => item.productId === productId)
        ? next.map((item) => (item.productId === productId ? { ...item, quantity: cleanQuantity(item.quantity + 1) } : item))
        : [...next, { productId, quantity: 1 }];
    }
    setToast({ id: Date.now(), message: saveCart(next) ? message : SAVE_ERROR });
  }

  function setCartQuantity(productId: string, quantity: number) {
    const amount = cleanQuantity(quantity);
    saveCart(cart.map((item) => (item.productId === productId ? { ...item, quantity: amount } : item)));
  }

  function clearCart() {
    saveCart([]);
  }

  function removeFromCart(productId: string) {
    saveCart(cart.filter((item) => item.productId !== productId));
  }

  // ---------- Tài khoản ----------

  // Tạo tài khoản khách hàng và đăng nhập luôn. Vai trò LUÔN là "USER".
  function register(values: RegisterValues): ActionResult {
    const email = normalizeEmail(values.email);
    if (users.some((user) => user.email === email)) return fail("Email này đã được đăng ký", "email");

    const user: User = {
      id: createId("u"),
      name: values.fullName.trim(),
      email,
      phone: normalizePhone(values.phone),
      password: values.password, // chữ thường: chỉ dành cho demo front-end (xem src/lib/password.ts)
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
    // Cùng một thông báo cho email sai và mật khẩu sai
    if (!user || !isSamePassword(password, user.password)) return fail(WRONG_LOGIN);

    if (!saveCurrentUserId(user.id, remember)) return fail(SAVE_ERROR);
    setCurrentUserId(user.id);
    return OK;
  }

  // Chỉ quên người đang đăng nhập. Người dùng, sản phẩm, đơn hàng và giỏ hàng vẫn còn.
  function logout() {
    clearCurrentUserId();
    setCurrentUserId(null);
  }

  // Tên và số điện thoại của người đang đăng nhập. Email và vai trò không đổi được ở đây.
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

  // ---------- Đơn hàng ----------

  // Tạo đơn hàng từ giỏ hàng, dùng giá HIỆN TẠI trong localStorage.
  function placeOrder(customer: CheckoutFields, paymentMethod: PaymentMethod, gift?: { message: string }): PlaceOrderResult {
    const lines = getCartLines(cart, products);
    if (lines.length === 0) return { ok: false, message: "Giỏ hàng của bạn đang trống." };

    // Bản sao của từng sản phẩm tại thời điểm mua: thay đổi giá về sau không bao giờ làm đổi đơn này
    const items: OrderItem[] = lines.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    }));
    const totals = calculateTotals(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

    // Lớn hơn số cuối cùng từng dùng một đơn vị, nên mã của một đơn đã xóa không bao giờ được cấp lại
    const lastNumber = Math.max(
      readJSON<number>(STORAGE_KEYS.orderSeq) ?? 0,
      ...orders.map((order) => orderNumberFromCode(order.code))
    );

    const order: Order = {
      code: formatOrderCode(lastNumber + 1),
      userId: currentUser?.id ?? null, // khách chưa đăng nhập: không có người dùng
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
      ...(gift ? { gift: { message: gift.message.trim().slice(0, 200) } } : {}),
      createdAt: new Date().toISOString(),
    };

    if (!saveOrders([...orders, order])) {
      return { ok: false, message: "Không thể lưu đơn hàng. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại." };
    }
    writeJSON(STORAGE_KEYS.orderSeq, lastNumber + 1);

    // Đơn đã được lưu: chỉ đến lúc này mới an toàn để làm trống giỏ hàng
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

  // ---------- Đánh giá ----------

  function submitReview(productId: string, rating: number, comment: string): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập để đánh giá.");
    // Kiểm tra lại ở đây (không chỉ ở giao diện): chỉ khách đã nhận hàng mới được đánh giá
    if (reviewEligibility(currentUser, orders, productId) !== "can-review") {
      return fail("Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng.");
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Vui lòng chọn số sao (1–5)", "rating");
    const text = comment.trim();
    if (text.length < 10) return fail("Nhận xét cần ít nhất 10 ký tự", "comment");
    if (text.length > MAX_COMMENT_LENGTH) return fail(`Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự`, "comment");

    const review: Review = {
      id: createId("r"),
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment: text,
      createdAt: new Date().toISOString(),
    };
    // Mỗi khách một đánh giá cho mỗi sản phẩm: viết lại thì thay bản cũ
    const others = reviews.filter((r) => !(r.productId === productId && r.userId === currentUser.id));
    return saveReviews([...others, review]) ? OK : fail(SAVE_ERROR);
  }

  function deleteReview(reviewId: string): ActionResult {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return fail("Đánh giá này không còn tồn tại.");
    if (!currentUser || (review.userId !== currentUser.id && !isAdmin)) return fail(NO_PERMISSION);
    return saveReviews(reviews.filter((r) => r.id !== reviewId)) ? OK : fail(SAVE_ERROR);
  }

  // ---------- Người dùng (Admin) ----------

  function adminCount() {
    return users.filter((user) => user.role === "ADMIN").length;
  }

  function changeUserRole(userId: string, role: Role): ActionResult {
    if (!isAdmin || !currentUser) return fail(NO_PERMISSION);
    // Quy tắc 1: tài khoản bạn đang đăng nhập không được tự đổi vai trò của mình
    if (userId === currentUser.id) return fail("Bạn không thể tự thay đổi vai trò của tài khoản đang đăng nhập.");

    const target = users.find((user) => user.id === userId);
    if (!target) return fail("Người dùng này không còn tồn tại.");
    if (target.role === role) return OK;

    // Quy tắc 2: website luôn phải còn ít nhất một ADMIN
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

    // Đơn hàng của người dùng này được giữ lại, như đơn của khách chưa đăng nhập, để không mất lịch sử đặt hàng
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
        reviews,
        currentUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        addManyToCart,
        setCartQuantity,
        removeFromCart,
        clearCart,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        submitReview,
        deleteReview,
        changeUserRole,
        deleteUser,
      }}
    >
      {children}
      <CartToast toast={toast} onClose={closeToast} />
    </StoreContext.Provider>
  );
}

// Dùng trong bất kỳ client component nào: const { products, addToCart } = useStore();
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}
