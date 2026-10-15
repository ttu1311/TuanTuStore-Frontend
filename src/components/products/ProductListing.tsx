"use client";

import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import { useStore } from "@/context/StoreContext";
import { sortNewestFirst } from "@/lib/products";
import { simplifyText } from "@/lib/text";
import type { Product, Region } from "@/types";

// Add the value if it is not in the list, remove it if it is
function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function matchesPrice(price: number, range: string) {
  if (range === "under-100") return price < 100000;
  if (range === "100-200") return price >= 100000 && price <= 200000;
  if (range === "over-200") return price > 200000;
  return true; // "all"
}

// Lower case, and the same Unicode form for every Vietnamese letter
function lowerText(text: string) {
  return text.toLowerCase().normalize("NFC");
}

// Search in the name, origin, brand and short description.
// - Typed WITHOUT accents ("o mai", "tra"): accents are ignored everywhere, so "o mai" finds "Ô mai".
// - Typed WITH accents ("trà"): accents must match, so "trà" finds the tea but not "Sóc Trăng".
function matchesSearch(product: Product, search: string) {
  const term = lowerText(search.trim());
  if (!term) return true;

  const typedWithAccents = simplifyText(term) !== term;
  const fields = [product.name, product.origin, product.brand, product.shortDescription];
  return fields.some((text) =>
    typedWithAccents ? lowerText(text).includes(term) : simplifyText(text).includes(simplifyText(term))
  );
}

type ProductListingProps = {
  initialSearch?: string; // from the header search box: /san-pham?q=...
  initialRegion?: Region; // from the region cards on the homepage: /san-pham?region=bac
};

// Holds the search / filter / sort state and shows the filtered products from localStorage.
export default function ProductListing({ initialSearch = "", initialRegion }: ProductListingProps) {
  const { isReady, products } = useStore();
  const [search, setSearch] = useState(initialSearch);
  const [regions, setRegions] = useState<Region[]>(initialRegion ? [initialRegion] : []);
  const [brands, setBrands] = useState<string[]>([]);
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");

  // Brand checkboxes: every brand found in the products, A to Z
  const brandOptions = Array.from(new Set(products.map((product) => product.brand))).sort((a, b) =>
    a.localeCompare(b, "vi")
  );

  // 1. Filter. An empty region/brand list means "no filter".
  const filtered = products.filter(
    (product) =>
      matchesSearch(product, search) &&
      (regions.length === 0 || regions.includes(product.region)) &&
      (brands.length === 0 || brands.includes(product.brand)) &&
      matchesPrice(product.price, price)
  );

  // 2. Sort
  let visible = sortNewestFirst(filtered);
  if (sort === "price-asc") visible = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible = [...filtered].sort((a, b) => b.price - a.price);

  function resetFilters() {
    setSearch("");
    setRegions([]);
    setBrands([]);
    setPrice("all");
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
      <ProductFilters
        regions={regions}
        brandOptions={brandOptions}
        brands={brands}
        price={price}
        onToggleRegion={(region) => setRegions(toggle(regions, region))}
        onToggleBrand={(brand) => setBrands(toggle(brands, brand))}
        onPriceChange={setPrice}
        onReset={resetFilters}
      />

      <section aria-label="Danh sách sản phẩm">
        <ProductToolbar
          total={isReady ? visible.length : 0}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        {!isReady ? (
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface px-6 py-16 text-center text-ink-muted">
            Không tìm thấy sản phẩm phù hợp. Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {visible.map((product, index) => (
              <ProductCard key={product.id} product={product} eager={index < 3} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
