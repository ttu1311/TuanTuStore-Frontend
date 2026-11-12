import type { Region } from "@/types";

// Nhãn hiển thị và màu sắc của từng vùng miền.
// Dùng bởi RegionBadge, các tab ở trang chủ, bản đồ, menu header, bộ lọc sản phẩm, trang chi tiết sản phẩm
// và form sản phẩm Admin. dotClass tô màu chấm vùng, textClass tô màu tên vùng.
export const regions: Record<Region, { label: string; dotClass: string; textClass: string }> = {
  bac: { label: "Miền Bắc", dotClass: "bg-che", textClass: "text-che" },
  trung: { label: "Miền Trung", dotClass: "bg-brown", textClass: "text-brown" },
  nam: { label: "Miền Nam", dotClass: "bg-gold", textClass: "text-gold-ink" },
};

export const regionKeys = Object.keys(regions) as Region[];

export function isRegion(value: string): value is Region {
  return value in regions;
}
