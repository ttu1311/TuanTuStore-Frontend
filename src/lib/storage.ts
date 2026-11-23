// Nơi DUY NHẤT làm việc với localStorage / sessionStorage.
// Các hàm này phải chạy ở trình duyệt (trong useEffect hoặc trình xử lý sự kiện), không bao giờ chạy khi render trên server.
import { caMauProducts, initialProducts, initialUsers } from "@/data/initialData";
import { threeRegionProducts } from "@/data/moreProducts";
import { renamedImages, seedUpdates } from "@/data/seedUpdates";
import { INITIAL_STOCK } from "@/lib/cart";
import type { CartItem, Coupon, Order, Product, Review, User } from "@/types";

export const STORAGE_KEYS = {
  products: "tuantustore-products",
  users: "tuantustore-users",
  currentUser: "tuantustore-current-user",
  cart: "tuantustore-cart",
  orders: "tuantustore-orders",
  orderSeq: "tuantustore-order-seq", // số thứ tự đơn hàng đã dùng gần nhất (1 -> "TT-000001")
  seedBatches: "tuantustore-seed-batches", // các seedBatches bên dưới mà trình duyệt này đã nhận
  recentlyViewed: "tuantustore-recently-viewed", // id các sản phẩm vừa xem, mới nhất đứng đầu
  reviews: "tuantustore-reviews", // đánh giá sản phẩm của khách đã nhận hàng
  productViews: "tuantustore-product-views", // id sản phẩm -> số lần trang chi tiết được mở (xếp hạng "Sản phẩm bán chạy" khi chưa bán được)
  wishlists: "tuantustore-wishlists", // id người dùng -> id các sản phẩm yêu thích (lưu theo tài khoản)
  coupons: "tuantustore-coupons", // mã giảm giá chủ cửa hàng tạo ở /admin/ma-giam-gia
  recentSearches: "tuantustore-recent-searches", // tối đa 5 từ khóa vừa tìm ở ô tìm kiếm trên header, mới nhất đứng đầu (src/lib/search.ts)
  music: "tuantustore-music", // nhạc nền: { trackId, currentTime, volume, muted } (src/context/MusicContext.tsx)
  migrations: "tuantustore-migrations", // id các bước dọn dữ liệu MỘT LẦN đã chạy trên trình duyệt này (xem runMigrations)
} as const;

// Các nhóm sản phẩm được thêm vào dữ liệu mẫu SAU phiên bản đầu tiên của website.
// Để thêm sản phẩm về sau: đưa chúng vào initialProducts VÀ thêm một nhóm mới ở đây với id mới.
const seedBatches: { id: string; products: Product[] }[] = [
  { id: "ca-mau", products: caMauProducts },
  { id: "ba-mien-60", products: threeRegionProducts }, // 47 món, mỗi miền đủ 20 món (tháng 11/2026)
];

// Đọc một giá trị JSON. Trả về null khi thiếu khóa, văn bản không phải JSON hợp lệ hoặc storage bị chặn.
export function readJSON<T>(key: string, storage: Storage = window.localStorage): T | null {
  try {
    const text = storage.getItem(key);
    return text === null ? null : (JSON.parse(text) as T);
  } catch {
    return null;
  }
}

// Lưu một giá trị dạng JSON. Trả về false khi trình duyệt từ chối (storage đầy hoặc bị chặn).
export function writeJSON(key: string, value: unknown, storage: Storage = window.localStorage): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Lần truy cập đầu: điền giá trị mặc định cho mọi khóa còn thiếu (hoặc không đọc được).
// Khóa đã có dữ liệu hợp lệ thì KHÔNG BAO GIỜ bị ghi đè, nên tải lại trang vẫn giữ mọi thay đổi.
export function initializeStorage() {
  if (!Array.isArray(readJSON(STORAGE_KEYS.products))) {
    // initialProducts đã chứa mọi nhóm, nên đánh dấu tất cả là đã nhận
    if (writeJSON(STORAGE_KEYS.products, initialProducts)) {
      writeJSON(STORAGE_KEYS.seedBatches, seedBatches.map((batch) => batch.id));
    }
  }
  if (!Array.isArray(readJSON(STORAGE_KEYS.users))) writeJSON(STORAGE_KEYS.users, initialUsers);
  if (!Array.isArray(readJSON(STORAGE_KEYS.cart))) writeJSON(STORAGE_KEYS.cart, []);
  if (!Array.isArray(readJSON(STORAGE_KEYS.orders))) writeJSON(STORAGE_KEYS.orders, []);
  if (typeof readJSON(STORAGE_KEYS.orderSeq) !== "number") writeJSON(STORAGE_KEYS.orderSeq, 0);
  if (!Array.isArray(readJSON(STORAGE_KEYS.reviews))) writeJSON(STORAGE_KEYS.reviews, []); // không có đánh giá mẫu: chỉ đánh giá thật
  if (!Array.isArray(readJSON(STORAGE_KEYS.coupons))) writeJSON(STORAGE_KEYS.coupons, []); // không có mã mẫu
  addNewSeedBatches();
  applySeedUpdates();
  runMigrations();
}

// ---------- Các bước dọn dữ liệu chạy MỘT LẦN trên mỗi trình duyệt ----------
// Mỗi bước có một id; id được ghi vào STORAGE_KEYS.migrations SAU KHI bước đó lưu xong, nên:
// lần ghi thất bại (storage đầy / bị chặn) sẽ được thử lại ở lần truy cập sau, còn bước đã xong thì không bao giờ chạy lại
// (ví dụ: sau này một khách đăng ký đúng email admin@tuantustore.vn thì tài khoản đó không bị xóa nhầm).
const migrations: { id: string; run: () => boolean }[] = [
  { id: "remove-legacy-admin", run: removeLegacyAdminAccount },
  { id: "remove-contact-requests", run: removeContactRequests },
];

function runMigrations() {
  const saved = readJSON<string[]>(STORAGE_KEYS.migrations);
  const done = Array.isArray(saved) ? saved : [];
  for (const migration of migrations) {
    if (done.includes(migration.id) || !migration.run()) continue;
    done.push(migration.id);
    writeJSON(STORAGE_KEYS.migrations, done);
  }
}

// Trang Liên hệ (form "Yêu cầu gọi lại") đã bị bỏ, nên khóa lưu các yêu cầu đó không còn ai đọc: xóa khỏi trình duyệt.
// Khóa này không còn trong STORAGE_KEYS, tên cũ chỉ còn ở đây. Trả về true khi khóa đã hết (kể cả khi chưa từng có),
// false nếu storage bị chặn (sẽ thử lại lần sau).
const LEGACY_CONTACT_REQUESTS_KEY = "tuantustore-contact-requests";

function removeContactRequests() {
  try {
    window.localStorage.removeItem(LEGACY_CONTACT_REQUESTS_KEY);
    return window.localStorage.getItem(LEGACY_CONTACT_REQUESTS_KEY) === null;
  } catch {
    return false;
  }
}

const LEGACY_ADMIN_ID = "u-admin";
const LEGACY_ADMIN_EMAIL = "admin@tuantustore.vn";

// Phiên bản cũ tạo sẵn tài khoản quản trị mẫu (admin@tuantustore.vn, mật khẩu chữ thường) trong localStorage và cấp quyền
// bằng trường "role". Nay quản trị viên đăng nhập riêng ở /dang-nhap-quan-tri (mật khẩu kiểm tra ở server), nên:
// - xóa bản ghi tài khoản quản trị mẫu đó; đơn hàng của nó được giữ lại như đơn của khách chưa đăng nhập (giống deleteUser),
//   danh sách yêu thích của nó bị xóa, và nếu trình duyệt đang đăng nhập bằng nó thì đăng xuất;
// - bỏ trường "role" ở MỌI tài khoản còn lại (hạ quyền những tài khoản từng được nâng lên ADMIN ở giao diện cũ).
// Ghi đơn hàng / yêu thích / phiên TRƯỚC, danh sách người dùng SAU CÙNG: lỗi giữa chừng thì lần sau vẫn tìm thấy tài khoản cũ để làm lại.
// Trả về false nếu chưa lưu được (sẽ thử lại lần sau).
function removeLegacyAdminAccount() {
  const users = readJSON<unknown[]>(STORAGE_KEYS.users);
  if (!Array.isArray(users)) return false;

  const isLegacyAdmin = (user: unknown) => {
    if (!user || typeof user !== "object") return false;
    const record = user as { id?: unknown; email?: unknown };
    return record.id === LEGACY_ADMIN_ID || (typeof record.email === "string" && record.email.trim().toLowerCase() === LEGACY_ADMIN_EMAIL);
  };
  const removedIds = users.filter(isLegacyAdmin).map((user) => (user as { id?: unknown }).id).filter((id): id is string => typeof id === "string");
  const hasRole = users.some((user) => user !== null && typeof user === "object" && "role" in user);
  if (removedIds.length === 0 && !hasRole) return true; // trình duyệt mới hoặc đã sạch

  if (removedIds.length > 0) {
    const orders = readJSON<Order[]>(STORAGE_KEYS.orders);
    if (Array.isArray(orders) && orders.some((order) => removedIds.includes(order.userId ?? ""))) {
      const detached = orders.map((order) => (removedIds.includes(order.userId ?? "") ? { ...order, userId: null } : order));
      if (!writeJSON(STORAGE_KEYS.orders, detached)) return false;
    }
    const wishlists = readJSON<Record<string, unknown>>(STORAGE_KEYS.wishlists);
    if (wishlists && typeof wishlists === "object" && !Array.isArray(wishlists) && removedIds.some((id) => id in wishlists)) {
      const rest = Object.fromEntries(Object.entries(wishlists).filter(([userId]) => !removedIds.includes(userId)));
      if (!writeJSON(STORAGE_KEYS.wishlists, rest)) return false;
    }
    const current = readCurrentUserId();
    if (current && removedIds.includes(current)) clearCurrentUserId();
  }

  const cleaned = users.filter((user) => !isLegacyAdmin(user)).map((user) => {
    if (!user || typeof user !== "object" || !("role" in user)) return user;
    const { role: _role, ...rest } = user as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unused-vars
    return rest;
  });
  return writeJSON(STORAGE_KEYS.users, cleaned);
}

// Trình duyệt đã lưu danh sách sản phẩm TRƯỚC khi một nhóm tồn tại sẽ nhận nhóm đó ở đây, MỘT LẦN:
// - các sản phẩm được THÊM vào cuối danh sách đã lưu; không có gì đã lưu (sản phẩm, giỏ hàng, đơn hàng, người dùng) bị đổi;
// - sản phẩm có id đã có trong danh sách thì bị bỏ qua (ví dụ Admin đã tự tạo "Cua biển Năm Căn");
// - id của nhóm sau đó được ghi nhớ, nên tải lại trang không bao giờ thêm hai lần
//   và sản phẩm Admin đã xóa sau đó không quay lại.
function addNewSeedBatches() {
  const products = readJSON<Product[]>(STORAGE_KEYS.products);
  if (!Array.isArray(products)) return; // storage bị chặn hoặc đầy: thử lại ở lần truy cập sau

  const savedIds = readJSON<string[]>(STORAGE_KEYS.seedBatches);
  const received = Array.isArray(savedIds) ? savedIds : [];
  const newBatches = seedBatches.filter((batch) => !received.includes(batch.id));
  if (newBatches.length === 0) return;

  const existingIds = new Set(products.map((product) => product.id));
  const added = newBatches.flatMap((batch) => batch.products).filter((product) => !existingIds.has(product.id));

  // Các nhóm chỉ được đánh dấu sau khi sản phẩm đã được lưu, nên lần ghi thất bại sẽ được thử lại lần sau
  if (added.length > 0 && !writeJSON(STORAGE_KEYS.products, [...products, ...added])) return;
  writeJSON(STORAGE_KEYS.seedBatches, [...received, ...newBatches.map((batch) => batch.id)]);
}

// Cập nhật sản phẩm mẫu đã được lưu từ trước (thương hiệu thật, sửa mô tả và giá sai), theo danh sách trong seedUpdates.
// Chỉ đổi một trường khi nó VẪN LÀ giá trị mẫu cũ, nên chỗ nào Admin đã tự sửa thì được giữ nguyên.
// Riêng ảnh cũ đã bị xóa (renamedImages) thì được đổi ở MỌI sản phẩm, vì để nguyên chỉ ra ảnh hỏng.
function applySeedUpdates() {
  const products = readJSON<Product[]>(STORAGE_KEYS.products);
  if (!Array.isArray(products)) return;

  const seedById = new Map(initialProducts.map((product) => [product.id, product]));
  let changed = false;

  const updated = products.map((product) => {
    let next = product;
    // Tồn kho thêm về sau: sản phẩm lưu từ trước (cả sản phẩm Admin tự tạo) bắt đầu với INITIAL_STOCK
    if (typeof next.stock !== "number") {
      next = { ...next, stock: INITIAL_STOCK };
      changed = true;
    }
    const newImage = renamedImages[product.image];
    if (newImage) {
      next = { ...next, image: newImage };
      changed = true;
    }

    const seed = seedById.get(product.id);
    if (!seed) return next;

    // Các trường thêm về sau (dịp tặng, câu chuyện sản phẩm): sản phẩm mẫu lưu từ trước chưa có thì nhận từ initialData.
    // Admin lưu sản phẩm luôn ghi cả hai trường (có thể rỗng), nên thứ Admin đã xóa không bị điền lại.
    if (next.occasions === undefined && seed.occasions) {
      next = { ...next, occasions: seed.occasions };
      changed = true;
    }
    if (next.story === undefined && seed.story) {
      next = { ...next, story: seed.story };
      changed = true;
    }

    for (const update of seedUpdates) {
      if (update.id !== product.id) continue;
      const current = next[update.field];
      const isOld = update.from instanceof RegExp ? update.from.test(String(current)) : current === update.from;
      if (!isOld || current === seed[update.field]) continue;
      next = { ...next, [update.field]: seed[update.field] };
      changed = true;
    }
    return next;
  });

  if (changed) writeJSON(STORAGE_KEYS.products, updated);
}

type StoredData = {
  products: Product[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  reviews: Review[];
  coupons: Coupon[];
  productViews: Record<string, number>;
  wishlists: Record<string, string[]>;
  currentUserId: string | null;
};

// Đọc mọi thứ website cần từ storage
export function loadStoredData(): StoredData {
  return {
    products: readJSON<Product[]>(STORAGE_KEYS.products) ?? [],
    users: readJSON<User[]>(STORAGE_KEYS.users) ?? [],
    orders: readJSON<Order[]>(STORAGE_KEYS.orders) ?? [],
    cart: readJSON<CartItem[]>(STORAGE_KEYS.cart) ?? [],
    reviews: readJSON<Review[]>(STORAGE_KEYS.reviews) ?? [],
    coupons: readJSON<Coupon[]>(STORAGE_KEYS.coupons) ?? [],
    productViews: readViews(),
    wishlists: readWishlists(),
    currentUserId: readCurrentUserId(),
  };
}

// Lượt xem: một đối tượng { id: số lần }. Dữ liệu hỏng hoặc không phải số thì bỏ qua.
function readViews(): Record<string, number> {
  const saved = readJSON<Record<string, unknown>>(STORAGE_KEYS.productViews);
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  return Object.fromEntries(
    Object.entries(saved).filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] >= 0)
  );
}

// Danh sách yêu thích: { idNgườiDùng: [idSảnPhẩm, …] }. Phần hỏng (không phải mảng chữ) thì bỏ qua.
function readWishlists(): Record<string, string[]> {
  const saved = readJSON<Record<string, unknown>>(STORAGE_KEYS.wishlists);
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  return Object.fromEntries(
    Object.entries(saved).flatMap(([userId, ids]) =>
      Array.isArray(ids) ? [[userId, ids.filter((id): id is string => typeof id === "string")]] : []
    )
  );
}

// ---------- Người đang đăng nhập ----------
// "Ghi nhớ đăng nhập" được tích   -> id người dùng được giữ trong localStorage (còn sau khi đóng trình duyệt).
// "Ghi nhớ đăng nhập" không tích  -> id người dùng được giữ trong sessionStorage (chỉ tab này, mất khi đóng tab).

function readCurrentUserId(): string | null {
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
    // storage bị chặn: không có gì để xóa
  }
}

// Một id ngắn, duy nhất cho các bản ghi mới, ví dụ "u-lx3k9a-4f2b"
export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
