// Nơi DUY NHẤT làm việc với localStorage / sessionStorage.
// Các hàm này phải chạy ở trình duyệt (trong useEffect hoặc trình xử lý sự kiện), không bao giờ chạy khi render trên server.
import { caMauProducts, initialProducts, initialUsers } from "@/data/initialData";
import { renamedImages, seedUpdates } from "@/data/seedUpdates";
import { INITIAL_STOCK } from "@/lib/cart";
import type { CartItem, ContactRequest, Order, Product, Review, User } from "@/types";

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
  contactRequests: "tuantustore-contact-requests", // yêu cầu liên hệ lại gửi từ trang /lien-he
  productViews: "tuantustore-product-views", // id sản phẩm -> số lần trang chi tiết được mở (xếp hạng "Sản phẩm bán chạy" khi chưa bán được)
  wishlists: "tuantustore-wishlists", // id người dùng -> id các sản phẩm yêu thích (lưu theo tài khoản)
} as const;

// Các nhóm sản phẩm được thêm vào dữ liệu mẫu SAU phiên bản đầu tiên của website.
// Để thêm sản phẩm về sau: đưa chúng vào initialProducts VÀ thêm một nhóm mới ở đây với id mới.
const seedBatches: { id: string; products: Product[] }[] = [{ id: "ca-mau", products: caMauProducts }];

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
  if (!Array.isArray(readJSON(STORAGE_KEYS.contactRequests))) writeJSON(STORAGE_KEYS.contactRequests, []);
  addNewSeedBatches();
  applySeedUpdates();
  repairDemoAdmin();
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
    // Thứ hạng "Top n" và "Ưu tiên" do Admin đặt đã bị bỏ: "Sản phẩm bán chạy" và nhãn Top chỉ tính từ số lượng đã bán.
    // Sản phẩm lưu từ trước còn hai trường đó thì bỏ đi một lần.
    if ("rank" in next || "isFeatured" in next) {
      const legacy: Record<string, unknown> = { ...next };
      delete legacy.rank;
      delete legacy.isFeatured;
      next = legacy as unknown as Product;
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

// Một người dùng như có thể được lưu trong trình duyệt cũ: một phiên bản TRƯỚC của dự án giữ `passwordHash`
// (mã băm không kiểm tra được nữa) thay vì `password`.
type SavedUser = Partial<User> & { passwordHash?: string };

// ADMIN demo trong README.md là tài khoản mẫu duy nhất.
const demoAdmin = initialUsers[0];

// Nếu ADMIN demo được lưu bởi phiên bản trước (không có `password`), trả lại cho nó mật khẩu đã ghi trong tài liệu,
// để thông tin đăng nhập ghi trong README.md cũng dùng được trên trình duyệt đang giữ dữ liệu cũ.
// Không đụng tới gì khác: các tài khoản cũ khác giữ nguyên (login() giải thích cách xử lý chúng).
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
      delete repaired.passwordHash; // mã băm cũ giờ vô dụng
      return repaired;
    })
  );
}

export type StoredData = {
  products: Product[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  reviews: Review[];
  contactRequests: ContactRequest[];
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
    contactRequests: readJSON<ContactRequest[]>(STORAGE_KEYS.contactRequests) ?? [],
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
    // storage bị chặn: không có gì để xóa
  }
}

// Một id ngắn, duy nhất cho các bản ghi mới, ví dụ "u-lx3k9a-4f2b"
export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
