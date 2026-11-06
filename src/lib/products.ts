// Các hàm hỗ trợ cho sản phẩm: những gì các trang hiển thị, và quy tắc của form sản phẩm Admin.
import type { Product } from "@/types";
import { isRegion } from "@/lib/regions";
import { slugify } from "@/lib/text";

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

// "Sản phẩm nổi bật" ở trang chủ
export function getFeaturedProducts(products: Product[]) {
  return sortNewestFirst(products.filter((product) => product.isFeatured));
}

// "Đặc sản bán chạy" ở trang chủ: các sản phẩm có thứ hạng, Top 1 lên đầu
export function getBestSellers(products: Product[]) {
  return products
    .filter((product) => product.rank !== undefined)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
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
  rank: string;
  isFeatured: boolean;
};

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
  rank: "",
  isFeatured: false,
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
    origin: product.origin,
    pack: product.pack,
    rank: product.rank ? String(product.rank) : "",
    isFeatured: product.isFeatured,
  };
}

const MAX_PRICE = 100_000_000; // 100 triệu đồng

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
  const text = (field: keyof Omit<ProductFormValues, "isFeatured">) => values[field].trim();

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
  if (!text("origin")) errors.origin = "Vui lòng nhập xuất xứ";
  if (!text("pack")) errors.pack = "Vui lòng nhập quy cách";
  if (!text("shortDescription")) errors.shortDescription = "Vui lòng nhập mô tả ngắn";
  if (!text("description")) errors.description = "Vui lòng nhập mô tả chi tiết";

  let rank: number | undefined;
  if (text("rank")) {
    const parsed = toPositiveInt(text("rank"), 99);
    if (parsed === null) errors.rank = "Thứ hạng phải là số nguyên từ 1 đến 99, hoặc để trống";
    else rank = parsed;
  }

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
      rank,
      isFeatured: values.isFeatured,
    },
  };
}
