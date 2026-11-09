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
import CartToast, { type Toast } from "@/components/ui/CartToast";
import { MAX_QUANTITY, calculateTotals, cleanQuantity, getCartLines, maxOrderable } from "@/lib/cart";
import { formatOrderCode, isNotShipped, orderNumberFromCode, type CheckoutFields } from "@/lib/orders";
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
import { validateContact, type ContactValues } from "@/lib/contact";
import { cleanAddress, validateAddress } from "@/lib/address";
import type { CartItem, ContactRequest, SavedAddress, Order, OrderItem, OrderStatus, PaymentMethod, Product, Review, Role, User } from "@/types";

// Kết quả mà mọi thao tác trả về. `field` cho biết thông báo thuộc về ô nhập nào (nếu có).
export type ActionResult = { ok: true } | { ok: false; message: string; field?: string };

export type PlaceOrderOptions = { gift?: { message: string }; forOther?: boolean };

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
  contactRequests: ContactRequest[];
  productViews: Record<string, number>; // id sản phẩm -> số lần trang chi tiết được mở (trên trình duyệt này)
  wishlist: string[]; // id các sản phẩm yêu thích của người đang đăng nhập (rỗng khi chưa đăng nhập)
  currentUser: User | null;

  // Thêm / bỏ một sản phẩm khỏi danh sách yêu thích. Cần đăng nhập: chưa đăng nhập thì trả về lỗi với field "login".
  toggleWishlist: (productId: string) => ActionResult;

  // Một lần mở trang chi tiết sản phẩm (dùng cho "Sản phẩm nổi bật")
  recordView: (productId: string) => void;

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
  // address: có = lưu luôn địa chỉ mặc định (trang thanh toán, lần đầu "Mua cho bản thân")
  updateProfile: (fullName: string, phone: string, address?: SavedAddress) => ActionResult;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;
  updateAddress: (address: SavedAddress) => ActionResult; // địa chỉ giao hàng mặc định

  // Đơn hàng
  // options.gift: có = gói quà (miễn phí) kèm lời nhắn trên thiệp; options.forOther: mua tặng người thân
  placeOrder: (customer: CheckoutFields, paymentMethod: PaymentMethod, options?: PlaceOrderOptions) => PlaceOrderResult;
  updateOrderStatus: (code: string, status: OrderStatus) => ActionResult;
  // TẠM THỜI: Admin xác nhận đã nhận chuyển khoản (khi có backend, webhook PayOS làm việc này)
  confirmPayment: (code: string) => ActionResult;
  deleteOrder: (code: string) => ActionResult;

  // Đánh giá: chỉ khách đã nhận hàng; viết lại thì thay đánh giá cũ của chính mình
  submitReview: (productId: string, rating: number, comment: string) => ActionResult;
  deleteReview: (reviewId: string) => ActionResult; // người viết hoặc ADMIN

  // Yêu cầu liên hệ lại: ai cũng gửi được; chỉ ADMIN đánh dấu và xóa
  submitContactRequest: (values: ContactValues) => ActionResult;
  setContactRequestDone: (id: string, done: boolean) => ActionResult;
  deleteContactRequest: (id: string) => ActionResult;

  // Người dùng (Admin)
  changeUserRole: (userId: string, role: Role) => ActionResult;
  deleteUser: (userId: string) => ActionResult;
};

const StoreContext = createContext<StoreValue | null>(null);

// Cộng (+1) hoặc trừ (-1) tồn kho theo các món của một đơn. Sản phẩm đã bị xóa thì bỏ qua. Kho không bao giờ âm.
function changeStock(products: Product[], items: OrderItem[], direction: 1 | -1) {
  return products.map((product) => {
    const quantity = items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
    return quantity === 0 ? product : { ...product, stock: Math.max(0, product.stock + direction * quantity) };
  });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [productViews, setProductViews] = useState<Record<string, number>>({});
  const [wishlists, setWishlists] = useState<Record<string, string[]>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
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
      setContactRequests(data.contactRequests);
      setProductViews(data.productViews);
      setWishlists(data.wishlists);
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
  const wishlist = currentUser ? (wishlists[currentUser.id] ?? []) : [];

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

  function saveContactRequests(next: ContactRequest[]) {
    if (!writeJSON(STORAGE_KEYS.contactRequests, next)) return false;
    setContactRequests(next);
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

  // Số lượng không bao giờ vượt quá tồn kho: thêm quá thì giỏ chỉ giữ tới mức còn hàng, và thông báo nói rõ
  function addToCart(productId: string, quantity: number) {
    const product = products.find((p) => p.id === productId);
    const name = product?.name ?? "sản phẩm";
    const limit = product ? maxOrderable(product) : 0;
    const inCart = cart.find((item) => item.productId === productId)?.quantity ?? 0;
    if (limit === 0) {
      setToast({ id: Date.now(), message: `${name} đã hết hàng` });
      return;
    }
    if (inCart >= limit) {
      setToast({ id: Date.now(), message: `Chỉ còn ${limit} ${name}: giỏ hàng của bạn đã có đủ số này` });
      return;
    }
    const nextQuantity = Math.min(limit, cleanQuantity(inCart + cleanQuantity(quantity)));
    const saved = saveCart(
      inCart > 0
        ? cart.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
        : [...cart, { productId, quantity: nextQuantity }]
    );
    const capped = nextQuantity < inCart + cleanQuantity(quantity);
    setToast({
      id: Date.now(),
      message: !saved
        ? SAVE_ERROR
        : capped
          ? `Chỉ còn ${limit} ${name}: giỏ hàng đã có ${nextQuantity}`
          : `Đã thêm ${name} vào giỏ hàng`,
    });
  }

  function addManyToCart(productIds: string[], message: string) {
    let next = cart;
    const skipped: string[] = []; // món đã hết hàng, hoặc giỏ đã có đủ số còn lại
    for (const productId of productIds) {
      const product = products.find((p) => p.id === productId);
      const inCart = next.find((item) => item.productId === productId)?.quantity ?? 0;
      if (!product || inCart + 1 > maxOrderable(product)) {
        if (product) skipped.push(product.name);
        continue;
      }
      next = inCart > 0
        ? next.map((item) => (item.productId === productId ? { ...item, quantity: inCart + 1 } : item))
        : [...next, { productId, quantity: 1 }];
    }
    const note = skipped.length > 0 ? ` (không đủ hàng: ${skipped.join(", ")})` : "";
    setToast({ id: Date.now(), message: saveCart(next) ? message + note : SAVE_ERROR });
  }

  function setCartQuantity(productId: string, quantity: number) {
    const product = products.find((p) => p.id === productId);
    // Không vượt tồn kho (nhưng ít nhất 1: muốn bỏ hẳn thì dùng nút "Xóa")
    const amount = Math.max(1, Math.min(cleanQuantity(quantity), product ? maxOrderable(product) : MAX_QUANTITY));
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
  function updateProfile(fullName: string, phone: string, address?: SavedAddress): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập lại.");
    if (address && Object.keys(validateAddress(address)).length > 0) return fail("Địa chỉ chưa hợp lệ");
    const next = users.map((user) =>
      user.id === currentUser.id
        ? { ...user, name: fullName.trim(), phone: normalizePhone(phone), ...(address ? { address: cleanAddress(address) } : {}) }
        : user
    );
    return saveUsers(next) ? OK : fail(SAVE_ERROR);
  }

  function updateAddress(address: SavedAddress): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập lại.");
    const errors = validateAddress(address);
    const firstField = Object.keys(errors)[0] as keyof SavedAddress | undefined;
    if (firstField) return fail(errors[firstField] ?? "Địa chỉ chưa hợp lệ", firstField);
    const next = users.map((user) => (user.id === currentUser.id ? { ...user, address: cleanAddress(address) } : user));
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
  function placeOrder(customer: CheckoutFields, paymentMethod: PaymentMethod, options: PlaceOrderOptions = {}): PlaceOrderResult {
    const { gift, forOther } = options;
    const lines = getCartLines(cart, products);
    if (lines.length === 0) return { ok: false, message: "Giỏ hàng của bạn đang trống." };

    // Kiểm tra tồn kho NGAY LÚC đặt (tab khác hoặc khách khác có thể vừa mua hết)
    const short = lines.find(({ product, quantity }) => quantity > product.stock);
    if (short) {
      return {
        ok: false,
        message:
          short.product.stock === 0
            ? `${short.product.name} đã hết hàng. Vui lòng xóa khỏi giỏ hàng để tiếp tục.`
            : `${short.product.name} chỉ còn ${short.product.stock} sản phẩm. Vui lòng giảm số lượng trong giỏ hàng.`,
      };
    }

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
      province: customer.address.province.trim(),
      ward: customer.address.ward.trim(), // địa chỉ 2 cấp: không còn quận/huyện
      address: customer.address.street.trim(),
      note: customer.note.trim(),
      paymentMethod,
      ...(paymentMethod === "BANK_TRANSFER" ? { paymentStatus: "UNPAID" as const } : {}),
      status: "PENDING",
      items,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      ...(gift ? { gift: { message: gift.message.trim().slice(0, 200) } } : {}),
      ...(forOther && currentUser ? { forOther: true } : {}),
      createdAt: new Date().toISOString(),
    };

    // Trừ kho trước; nếu không lưu được đơn thì trả lại kho như cũ.
    // TẠM THỜI (chưa có backend): kho chỉ đúng trên trình duyệt này. Kho thật cần server trừ kho trong một giao dịch.
    const previousProducts = products;
    if (!saveProducts(changeStock(products, items, -1))) {
      return { ok: false, message: "Không thể lưu đơn hàng. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại." };
    }
    if (!saveOrders([...orders, order])) {
      saveProducts(previousProducts);
      return { ok: false, message: "Không thể lưu đơn hàng. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại." };
    }
    writeJSON(STORAGE_KEYS.orderSeq, lastNumber + 1);

    // Đơn đã được lưu: chỉ đến lúc này mới an toàn để làm trống giỏ hàng
    saveCart([]);
    return { ok: true, order };
  }

  function updateOrderStatus(code: string, status: OrderStatus): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    const order = orders.find((item) => item.code === code);
    if (!order) return fail("Đơn hàng này không còn tồn tại.");
    if (order.status === status) return OK;
    // Đơn đã hủy là trạng thái cuối: hàng đã trả về kho, mở lại sẽ làm sai tồn kho
    if (order.status === "CANCELLED") return fail("Đơn đã hủy không thể đổi trạng thái. Hãy để khách đặt đơn mới.");
    if (status === "CANCELLED") {
      if (!isNotShipped(order.status)) return fail("Chỉ hủy được đơn chưa giao (Chờ xác nhận hoặc Đã xác nhận).");
      // Hủy đơn chưa giao: trả hàng lại kho
      if (!saveProducts(changeStock(products, order.items, +1))) return fail(SAVE_ERROR);
    }
    const next = orders.map((item) => (item.code === code ? { ...item, status } : item));
    return saveOrders(next) ? OK : fail(SAVE_ERROR);
  }

  function confirmPayment(code: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    const order = orders.find((item) => item.code === code);
    if (!order) return fail("Đơn hàng này không còn tồn tại.");
    if (order.paymentMethod !== "BANK_TRANSFER") return fail("Đơn này thanh toán khi nhận hàng.");
    // Xác nhận lần hai không làm gì (không ghi đè ngày đã nhận tiền)
    if (order.paymentStatus === "PAID") return OK;
    const next = orders.map((item) =>
      item.code === code
        ? {
            ...item,
            paymentStatus: "PAID" as const,
            paidAt: new Date().toISOString(),
            // Đã nhận tiền thì đơn đang chờ cũng được xác nhận luôn
            status: item.status === "PENDING" ? ("CONFIRMED" as const) : item.status,
          }
        : item
    );
    return saveOrders(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteOrder(code: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    const order = orders.find((item) => item.code === code);
    if (!order) return OK;
    if (!saveOrders(orders.filter((item) => item.code !== code))) return fail(SAVE_ERROR);
    // Xóa đơn chưa giao: trả hàng lại kho (đơn đã hủy thì đã trả lúc hủy; đơn đã giao thì hàng đã đi)
    if (isNotShipped(order.status)) saveProducts(changeStock(products, order.items, +1));
    return OK;
  }

  // ---------- Yêu thích (lưu theo tài khoản) ----------

  function saveWishlists(next: Record<string, string[]>) {
    if (!writeJSON(STORAGE_KEYS.wishlists, next)) return false;
    setWishlists(next);
    return true;
  }

  function toggleWishlist(productId: string): ActionResult {
    if (!currentUser) return fail("Vui lòng đăng nhập để lưu sản phẩm yêu thích.", "login");
    const isSaved = wishlist.includes(productId);
    // Món mới thích đứng đầu danh sách
    const nextList = isSaved ? wishlist.filter((id) => id !== productId) : [productId, ...wishlist];
    if (!saveWishlists({ ...wishlists, [currentUser.id]: nextList })) return fail(SAVE_ERROR);
    const name = products.find((p) => p.id === productId)?.name ?? "Sản phẩm";
    setToast({
      id: Date.now(),
      message: isSaved ? `Đã bỏ ${name} khỏi yêu thích` : `Đã thêm ${name} vào yêu thích`,
      link: { href: "/tai-khoan?tab=wishlist", label: "Xem yêu thích" },
    });
    return OK;
  }

  // ---------- Lượt xem sản phẩm ----------

  function recordView(productId: string) {
    const next = { ...productViews, [productId]: (productViews[productId] ?? 0) + 1 };
    // Lượt xem chỉ để xếp hạng "Nổi bật": lưu không được cũng không sao
    writeJSON(STORAGE_KEYS.productViews, next);
    setProductViews(next);
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

  // ---------- Yêu cầu liên hệ lại ----------

  function submitContactRequest(values: ContactValues): ActionResult {
    // Kiểm tra lại ở đây (không chỉ ở giao diện)
    const errors = validateContact(values);
    const firstField = Object.keys(errors)[0] as keyof ContactValues | undefined;
    if (firstField) return fail(errors[firstField] ?? "Thông tin chưa hợp lệ", firstField);

    const request: ContactRequest = {
      id: createId("c"),
      name: values.name.trim(),
      phone: normalizePhone(values.phone),
      email: values.email.trim() === "" ? "" : normalizeEmail(values.email),
      topic: values.topic,
      callTime: values.callTime,
      message: values.message.trim(),
      userId: currentUser?.id ?? null,
      done: false,
      createdAt: new Date().toISOString(),
    };
    return saveContactRequests([...contactRequests, request]) ? OK : fail(SAVE_ERROR);
  }

  function setContactRequestDone(id: string, done: boolean): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    if (!contactRequests.some((request) => request.id === id)) return fail("Yêu cầu này không còn tồn tại.");
    const next = contactRequests.map((request) => (request.id === id ? { ...request, done } : request));
    return saveContactRequests(next) ? OK : fail(SAVE_ERROR);
  }

  function deleteContactRequest(id: string): ActionResult {
    if (!isAdmin) return fail(NO_PERMISSION);
    return saveContactRequests(contactRequests.filter((request) => request.id !== id)) ? OK : fail(SAVE_ERROR);
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
    // Danh sách yêu thích thuộc về tài khoản: xóa tài khoản thì xóa luôn
    if (wishlists[userId]) {
      const rest = { ...wishlists };
      delete rest[userId];
      saveWishlists(rest);
    }

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
        contactRequests,
        productViews,
        wishlist,
        currentUser,
        recordView,
        toggleWishlist,
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
        updateAddress,
        placeOrder,
        updateOrderStatus,
        confirmPayment,
        deleteOrder,
        submitReview,
        deleteReview,
        submitContactRequest,
        setContactRequestDone,
        deleteContactRequest,
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
