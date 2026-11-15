// Các hàm hỗ trợ cho thương hiệu. Thông tin từng thương hiệu nằm ở src/data/brands.ts;
// thương hiệu nào có những sản phẩm nào thì tính từ danh sách sản phẩm (Product.brand).
import { brands } from "@/data/brands";
import type { Brand, Product } from "@/types";

export function findBrand(name: string): Brand | undefined {
  return brands.find((brand) => brand.name === name);
}

// Các thương hiệu có thể chọn khi thêm/sửa sản phẩm: mọi thương hiệu trong danh mục,
// cộng thương hiệu đang có trên sản phẩm (phòng khi sản phẩm cũ dùng tên không có trong danh mục). A đến Z.
export function brandNames(products: Product[]) {
  const names = new Set([...brands.map((brand) => brand.name), ...products.map((product) => product.brand)]);
  return Array.from(names).sort((a, b) => a.localeCompare(b, "vi"));
}
