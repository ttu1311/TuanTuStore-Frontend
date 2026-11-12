// Danh sách "Bắc vào Nam" của trang bản đồ (/ban-do): mỗi mốc là MỘT tỉnh/thành, gom mọi sản phẩm của tỉnh đó,
// và các mốc xếp từ Bắc xuống Nam theo vĩ độ của tỉnh (src/data/provinces.ts).
import { provinceLatitude } from "@/data/provinces";
import { groupProducts, productProvince } from "@/lib/products";
import type { Product, Region } from "@/types";

// Tỉnh ngoài danh sách (không biết vĩ độ) được đặt ở giữa miền của nó, và không hiện vĩ độ
const regionLatitude: Record<Region, number> = { bac: 21, trung: 14.5, nam: 10 };

export type RouteStop = {
  province: string; // tên tỉnh/thành sau sáp nhập, ví dụ "Cần Thơ" (tiêu đề của mốc)
  region: Region;
  latitude?: number; // chỉ khi biết tỉnh đó, để không bao giờ hiện một con số đoán mò
  products: Product[]; // mọi sản phẩm của tỉnh, xếp A → Z
};

export function buildRoute(products: Product[]): RouteStop[] {
  // Xuất xứ ghi tên tỉnh cũ (ví dụ "Bến Tre") vẫn được gom vào tỉnh mới ("Vĩnh Long"): xem productProvince
  return groupProducts(products, productProvince)
    .map(({ name, items }): RouteStop => ({
      province: name,
      region: items[0].region,
      latitude: provinceLatitude(name),
      products: [...items].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    }))
    .sort(
      (a, b) =>
        (b.latitude ?? regionLatitude[b.region]) - (a.latitude ?? regionLatitude[a.region]) ||
        a.province.localeCompare(b.province, "vi"),
    );
}

// 21.59 -> "21,6° B" (dấu phẩy thập phân kiểu Việt, B = Bắc)
export function formatLatitude(latitude: number) {
  return `${latitude.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}° B`;
}
