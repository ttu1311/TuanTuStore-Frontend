// Các hàm hỗ trợ cho sản phẩm: những gì các trang hiển thị, và quy tắc của form sản phẩm Admin.
import type { Product } from "@/types";
import { isRegion } from "@/lib/regions";
import { slugify } from "@/lib/text";
import { occasions as allOccasions } from "@/data/occasions";
import { normalizeProvince } from "@/data/provinces";
import { isKnownProvince } from "@/lib/address";
import { INITIAL_STOCK } from "@/lib/cart";

// 185000 với giá cũ 220000 -> 16 (%)
export function discountPercent(product: Product) {
  return product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
}

// Mô tả được lưu thành một đoạn văn bản, giữa các đoạn có một dòng trống
export function descriptionParagraphs(product: Product) {
  return product.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Tỉnh là phần cuối của xuất xứ: "Năm Căn, Cà Mau" -> "Cà Mau". Xuất xứ chỉ có một phần thì lấy cả chuỗi.
export function provinceOf(origin: string) {
  const parts = origin.split(",").map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? origin.trim();
}

// Tỉnh/thành (tên sau sáp nhập) của một sản phẩm. Xuất xứ còn ghi tên tỉnh cũ ("Bến Tre") vẫn ra tỉnh mới ("Vĩnh Long").
// Dùng chung cho tuyến "Bắc vào Nam", bộ lọc tỉnh, bản đồ và hộ chiếu, để mọi nơi gom sản phẩm giống nhau.
export function productProvince(product: Pick<Product, "origin">) {
  return normalizeProvince(provinceOf(product.origin));
}

// Nhóm sản phẩm theo một khóa (tỉnh, thương hiệu…): mỗi nhóm có tên và các sản phẩm của nó, tên xếp A đến Z
export function groupProducts(products: Product[], keyOf: (product: Product) => string) {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = keyOf(product);
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }
  return Array.from(groups, ([name, items]) => ({ name, items })).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

// Mới nhất lên đầu ("Mới nhất")
export function sortNewestFirst(products: Product[]) {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const BEST_SELLER_COUNT = 8;
export const TOP_BADGE_COUNT = 3; // chỉ 3 món bán nhiều nhất mới có nhãn "Top 1/2/3"

// Thứ tự bán chạy, HOÀN TOÀN do khách mua quyết định (Admin không xếp được): số lượng đã bán nhiều nhất trước
// (tổng số lượng trong các đơn, trừ đơn đã hủy). Bằng nhau, kể cả khi chưa bán được gì: nhiều lượt xem hơn
// (đếm trên trình duyệt này), rồi món mới hơn, rồi theo tên.
function compareBySales(sold: Map<string, number>, views: Record<string, number>) {
  return (a: Product, b: Product) =>
    (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0) ||
    (views[b.id] ?? 0) - (views[a.id] ?? 0) ||
    b.createdAt.localeCompare(a.createdAt) ||
    a.name.localeCompare(b.name, "vi");
}

// "Sản phẩm bán chạy" ở trang chủ: 8 món còn hàng, theo thứ tự trên. Cửa hàng chưa bán được gì thì danh sách vẫn đầy
// (theo lượt xem rồi món mới), nhưng chưa món nào có nhãn "Top" (xem topSellerRanks).
export function getBestSellers(products: Product[], sold: Map<string, number>, views: Record<string, number>) {
  return products
    .filter((product) => product.stock > 0)
    .sort(compareBySales(sold, views))
    .slice(0, BEST_SELLER_COUNT);
}

// Nhãn "Top n" trên thẻ sản phẩm: chỉ món ĐÃ BÁN ĐƯỢC mới có, lấy TOP_BADGE_COUNT món đầu. id -> 1, 2, 3.
export function topSellerRanks(products: Product[], sold: Map<string, number>, views: Record<string, number>) {
  const top = products
    .filter((product) => (sold.get(product.id) ?? 0) > 0)
    .sort(compareBySales(sold, views))
    .slice(0, TOP_BADGE_COUNT);
  return new Map(top.map((product, index) => [product.id, index + 1]));
}

// Tối đa `count` sản phẩm khác: cùng vùng trước, rồi đến các vùng khác
export function getRelatedProducts(products: Product[], current: Product, count = 4) {
  const others = sortNewestFirst(products.filter((item) => item.id !== current.id));
  const sameRegion = others.filter((item) => item.region === current.region);
  const otherRegions = others.filter((item) => item.region !== current.region);
  return [...sameRegion, ...otherRegions].slice(0, count);
}

// Id của sản phẩm mới được tạo từ tên: "Bánh tráng trộn" -> "banh-trang-tron".
// Nếu id đó đã được dùng, thêm một số: "banh-trang-tron-2".
export function createProductId(name: string, existingIds: string[]) {
  const base = slugify(name) || "san-pham";
  let id = base;
  for (let n = 2; existingIds.includes(id); n++) id = `${base}-${n}`;
  return id;
}

// ---------- Form sản phẩm Admin ----------

// Form giữ mọi giá trị dạng chữ (đó là những gì <input> trả về)
export type ProductFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string;
  region: string;
  brand: string;
  origin: string;
  pack: string;
  stock: string; // số lượng trong kho
  occasions: string[]; // id các dịp tặng đã tích
  enjoy: string; // câu chuyện sản phẩm: Cách thưởng thức
  storage: string; // Bảo quản
  season: string; // Mùa ngon nhất
};

export const MAX_STORY_LENGTH = 400;

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

// Mọi thứ Admin có thể sửa (id và ngày tạo được đặt tự động)
export type ProductInput = Omit<Product, "id" | "createdAt">;

export const emptyProductForm: ProductFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  oldPrice: "",
  image: "",
  region: "",
  brand: "",
  origin: "",
  pack: "",
  stock: String(INITIAL_STOCK),
  occasions: [],
  enjoy: "",
  storage: "",
  season: "",
};

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    image: product.image,
    region: product.region,
    brand: product.brand,
    // Xuất xứ là một tỉnh/thành sau sáp nhập; tên cũ ("Bến Tre") được đổi sẵn sang tên mới ("Vĩnh Long")
    origin: productProvince(product),
    pack: product.pack,
    stock: String(product.stock),
    occasions: product.occasions ?? [],
    enjoy: product.story?.enjoy ?? "",
    storage: product.story?.storage ?? "",
    season: product.story?.season ?? "",
  };
}

const MAX_PRICE = 100_000_000; // 100 triệu đồng
const MAX_STOCK = 99_999;

// Một ảnh trong thư mục public, ví dụ /images/p-o-mai.jpg
export const IMAGE_PATH_PATTERN = /^\/[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|avif|gif)$/i;

// "185000" -> 185000. Trả về null nếu không phải số nguyên từ 1 đến `max`.
function toPositiveInt(value: string, max: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= max ? number : null;
}

// Kiểm tra form. Trả về các lỗi, và dữ liệu sản phẩm khi không có lỗi.
export function validateProductForm(values: ProductFormValues): { errors: ProductFormErrors; input?: ProductInput } {
  const errors: ProductFormErrors = {};
  const text = (field: keyof Omit<ProductFormValues, "occasions">) => values[field].trim();

  if (!text("name")) errors.name = "Vui lòng nhập tên sản phẩm";
  else if (text("name").length > 100) errors.name = "Tên sản phẩm tối đa 100 ký tự";

  const price = toPositiveInt(text("price"), MAX_PRICE);
  if (price === null) errors.price = "Giá phải là số nguyên từ 1 đến 100.000.000 (đơn vị: đồng)";

  let oldPrice: number | undefined;
  if (text("oldPrice")) {
    const parsed = toPositiveInt(text("oldPrice"), MAX_PRICE);
    if (parsed === null) errors.oldPrice = "Giá cũ phải là số nguyên lớn hơn 0, hoặc để trống";
    else if (price !== null && parsed <= price) errors.oldPrice = "Giá cũ phải lớn hơn giá hiện tại";
    else oldPrice = parsed;
  }

  if (!IMAGE_PATH_PATTERN.test(text("image"))) {
    errors.image = "Nhập đường dẫn ảnh trong thư mục public, ví dụ /images/p-o-mai.jpg";
  }

  const region = text("region");
  if (!isRegion(region)) errors.region = "Vui lòng chọn vùng miền";

  if (!text("brand")) errors.brand = "Vui lòng chọn thương hiệu";
  if (!text("origin")) errors.origin = "Vui lòng chọn tỉnh / thành phố";
  else if (!isKnownProvince(text("origin"))) errors.origin = "Vui lòng chọn tỉnh / thành phố trong danh sách (sau sáp nhập)";
  if (!text("pack")) errors.pack = "Vui lòng nhập quy cách";
  if (!text("shortDescription")) errors.shortDescription = "Vui lòng nhập mô tả ngắn";
  if (!text("description")) errors.description = "Vui lòng nhập mô tả chi tiết";

  for (const field of ["enjoy", "storage", "season"] as const) {
    if (text(field).length > MAX_STORY_LENGTH) errors[field] = `Tối đa ${MAX_STORY_LENGTH} ký tự`;
  }

  // Tồn kho: số nguyên từ 0 (hết hàng) đến 99.999
  const stock = Number(text("stock"));
  const stockOk = text("stock") !== "" && Number.isInteger(stock) && stock >= 0 && stock <= MAX_STOCK;
  if (!stockOk) errors.stock = `Tồn kho phải là số nguyên từ 0 đến ${MAX_STOCK.toLocaleString("vi-VN")}`;

  if (Object.keys(errors).length > 0 || price === null || !isRegion(region)) return { errors };

  return {
    errors,
    input: {
      name: text("name"),
      shortDescription: text("shortDescription"),
      // Trình duyệt có thể gửi xuống dòng là "\r\n". Các đoạn văn được tách bằng dòng trống.
      description: values.description.replace(/\r\n/g, "\n").trim(),
      price,
      oldPrice,
      image: text("image"),
      region,
      brand: text("brand"),
      origin: text("origin"),
      pack: text("pack"),
      stock,
      // Luôn ghi cả hai trường (có thể rỗng), để dữ liệu mẫu không điền lại thứ Admin đã xóa (xem applySeedUpdates)
      occasions: allOccasions.map((occasion) => occasion.id).filter((id) => values.occasions.includes(id)),
      story: {
        enjoy: text("enjoy"),
        storage: text("storage"),
        ...(text("season") ? { season: text("season") } : {}),
      },
    },
  };
}
