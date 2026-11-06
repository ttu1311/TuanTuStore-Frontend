"use client";

import { useState } from "react";
import FilterGroup from "@/components/products/FilterGroup";
import { btnBase, btnGhost, btnSmall } from "@/components/ui/buttons";
import type { BrandSummary } from "@/lib/brands";
import { regions as allRegions } from "@/lib/regions";
import type { Region } from "@/types";

// Các mức giá (quy tắc khớp nằm trong ProductListing)
const priceRanges = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "under-100", label: "Dưới 100.000₫" },
  { value: "100-200", label: "100.000₫ – 200.000₫" },
  { value: "over-200", label: "Trên 200.000₫" },
];

const optionLabel = "flex min-h-11 cursor-pointer items-center gap-3 text-ink";
const optionInput = "h-5 w-5 shrink-0 cursor-pointer accent-primary";

type ProductFiltersProps = {
  brandOptions: BrandSummary[]; // mọi thương hiệu đang có sản phẩm, kèm số sản phẩm và tên các sản phẩm
  regions: Region[]; // các vùng đã tích
  brands: string[]; // các thương hiệu đã tích
  provinceOptions: { name: string; count: number }[]; // mọi tỉnh có sản phẩm, kèm số sản phẩm
  provinces: string[]; // các tỉnh đã tích
  price: string; // giá trị mức giá đang chọn
  onToggleRegion: (region: Region) => void;
  onToggleBrand: (brand: string) => void;
  onToggleProvince: (province: string) => void;
  onPriceChange: (price: string) => void;
  onReset: () => void;
};

// Các bộ lọc, hiển thị trong Sidebar của danh sách sản phẩm (ContentSidebar cung cấp thẻ <aside>).
// State nằm ở ProductListing; component này chỉ hiển thị nó.
export default function ProductFilters({
  brandOptions,
  regions,
  brands,
  provinceOptions,
  provinces,
  price,
  onToggleRegion,
  onToggleBrand,
  onToggleProvince,
  onPriceChange,
  onReset,
}: ProductFiltersProps) {
  // Trên điện thoại, các bộ lọc được gập lại sau nút "Bộ lọc", để sản phẩm không bị đẩy xuống quá xa.
  // Từ cỡ lg trở lên các bộ lọc luôn mở (xem các class lg: bên dưới).
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = regions.length + brands.length + provinces.length + (price === "all" ? 0 : 1);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="product-filters"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-11 w-full items-center justify-between rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface lg:hidden"
      >
        <span>Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <span aria-hidden="true" className="text-lg leading-none text-ink-muted">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <form
        id="product-filters"
        className={`${isOpen ? "mt-3" : "hidden"} rounded-xl border border-line bg-white p-6 lg:mt-0 lg:block`}
        onReset={(event) => {
          event.preventDefault(); // ta reset state của riêng mình thay vì của trình duyệt
          onReset();
        }}
      >
        <FilterGroup title="Vùng miền">
          {(Object.entries(allRegions) as [Region, (typeof allRegions)[Region]][]).map(([key, region]) => (
            <label key={key} className={optionLabel}>
              <input
                type="checkbox"
                name="region"
                value={key}
                checked={regions.includes(key)}
                onChange={() => onToggleRegion(key)}
                className={optionInput}
              />
              {region.label}
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Tỉnh / thành">
          {provinceOptions.map((province) => (
            <label key={province.name} className={optionLabel}>
              <input
                type="checkbox"
                name="province"
                value={province.name}
                checked={provinces.includes(province.name)}
                onChange={() => onToggleProvince(province.name)}
                className={optionInput}
              />
              <span>
                {province.name} <span className="text-ink-muted">({province.count})</span>
              </span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Thương hiệu">
          {brandOptions.map((brand) => (
            // Dòng nhỏ bên dưới cho biết thương hiệu này làm những sản phẩm nào
            <label key={brand.name} className="flex min-h-11 cursor-pointer items-center gap-3 py-1 text-ink">
              <input
                type="checkbox"
                name="brand"
                value={brand.name}
                checked={brands.includes(brand.name)}
                onChange={() => onToggleBrand(brand.name)}
                className={optionInput}
              />
              <span className="min-w-0">
                <span className="block">
                  {brand.name} <span className="text-ink-muted">({brand.count})</span>
                </span>
                <span className="block text-sm leading-snug text-ink-muted">{brand.productNames}</span>
              </span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Khoảng giá">
          {priceRanges.map((range) => (
            <label key={range.value} className={optionLabel}>
              <input
                type="radio"
                name="price"
                value={range.value}
                checked={price === range.value}
                onChange={() => onPriceChange(range.value)}
                className={optionInput}
              />
              {range.label}
            </label>
          ))}
        </FilterGroup>

        <button type="reset" className={`${btnBase} ${btnGhost} ${btnSmall} mt-6 w-full`}>
          Xóa bộ lọc
        </button>
      </form>
    </div>
  );
}
