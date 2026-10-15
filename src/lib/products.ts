// Helpers for products: what the pages show, and the rules of the Admin product form.
import type { Product } from "@/types";
import { isRegion } from "@/lib/regions";
import { slugify } from "@/lib/text";

// 185000 with an old price of 220000 -> 16 (%)
export function discountPercent(product: Product) {
  return product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
}

// The description is saved as one text with a blank line between paragraphs
export function descriptionParagraphs(product: Product) {
  return product.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Newest first ("Mới nhất")
export function sortNewestFirst(products: Product[]) {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Homepage "Sản phẩm nổi bật"
export function getFeaturedProducts(products: Product[]) {
  return sortNewestFirst(products.filter((product) => product.isFeatured));
}

// Homepage "Đặc sản bán chạy": products with a rank, Top 1 first
export function getBestSellers(products: Product[]) {
  return products
    .filter((product) => product.rank !== undefined)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
}

// Up to `count` other products: the same region first, then the other regions
export function getRelatedProducts(products: Product[], current: Product, count = 4) {
  const others = sortNewestFirst(products.filter((item) => item.id !== current.id));
  const sameRegion = others.filter((item) => item.region === current.region);
  const otherRegions = others.filter((item) => item.region !== current.region);
  return [...sameRegion, ...otherRegions].slice(0, count);
}

// The id of a new product comes from its name: "Bánh tráng trộn" -> "banh-trang-tron".
// If that id is already used, a number is added: "banh-trang-tron-2".
export function createProductId(name: string, existingIds: string[]) {
  const base = slugify(name) || "san-pham";
  let id = base;
  for (let n = 2; existingIds.includes(id); n++) id = `${base}-${n}`;
  return id;
}

// ---------- Admin product form ----------

// The form keeps every value as text (that is what <input> gives us)
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

// Everything the Admin can edit (the id and the creation date are set automatically)
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

// An image inside the public folder, e.g. /images/p-o-mai.jpg
export const IMAGE_PATH_PATTERN = /^\/[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|avif|gif)$/i;

// "185000" -> 185000. Returns null if it is not a whole number between 1 and `max`.
function toPositiveInt(value: string, max: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= max ? number : null;
}

// Checks the form. Returns the errors, and the product data when there is no error.
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

  if (!text("brand")) errors.brand = "Vui lòng nhập thương hiệu";
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
      // Browsers may send line breaks as "\r\n". Paragraphs are split on blank lines.
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
