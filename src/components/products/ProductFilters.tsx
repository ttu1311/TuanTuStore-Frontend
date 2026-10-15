"use client";

import { useState } from "react";
import FilterGroup from "@/components/products/FilterGroup";
import { btnBase, btnGhost, btnSmall } from "@/components/ui/buttons";
import { regions as allRegions } from "@/lib/regions";
import type { Region } from "@/types";

// Price ranges (the matching rule is in ProductListing)
const priceRanges = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "under-100", label: "Dưới 100.000₫" },
  { value: "100-200", label: "100.000₫ – 200.000₫" },
  { value: "over-200", label: "Trên 200.000₫" },
];

const optionLabel = "flex min-h-11 cursor-pointer items-center gap-3 text-ink";
const optionInput = "h-5 w-5 shrink-0 cursor-pointer accent-primary";

type ProductFiltersProps = {
  brandOptions: string[]; // all brands that can be ticked
  regions: Region[]; // ticked regions
  brands: string[]; // ticked brands
  price: string; // selected price range value
  onToggleRegion: (region: Region) => void;
  onToggleBrand: (brand: string) => void;
  onPriceChange: (price: string) => void;
  onReset: () => void;
};

// Sidebar filters. The state lives in ProductListing; this component only shows it.
export default function ProductFilters({
  brandOptions,
  regions,
  brands,
  price,
  onToggleRegion,
  onToggleBrand,
  onPriceChange,
  onReset,
}: ProductFiltersProps) {
  // On phones the filters are folded away behind the "Bộ lọc" button, so the products are not pushed far down.
  // From the lg size up the filters are always open (see the lg: classes below).
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = regions.length + brands.length + (price === "all" ? 0 : 1);

  return (
    <aside aria-label="Bộ lọc sản phẩm">
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
          event.preventDefault(); // we reset our own state instead of the browser's
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

        <FilterGroup title="Thương hiệu">
          {brandOptions.map((brand) => (
            <label key={brand} className={optionLabel}>
              <input
                type="checkbox"
                name="brand"
                value={brand}
                checked={brands.includes(brand)}
                onChange={() => onToggleBrand(brand)}
                className={optionInput}
              />
              {brand}
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
    </aside>
  );
}
