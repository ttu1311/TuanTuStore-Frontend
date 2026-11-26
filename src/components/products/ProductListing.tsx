"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import ContentSidebar from "@/components/layout/PageLayout";
import ProductFilters, { priceRanges } from "@/components/products/ProductFilters";
import ProductToolbar, { type FilterChip } from "@/components/products/ProductToolbar";
import { btnBase, btnSecondary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { normalizeProvince } from "@/data/provinces";
import { productProvince, provinceOptionsFor, sortNewestFirst } from "@/lib/products";
import { isRegion, regions as allRegions } from "@/lib/regions";
import { matchesSearch } from "@/lib/search";
import type { Region } from "@/types";

// Thêm giá trị nếu chưa có trong danh sách, bỏ đi nếu đã có
function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function matchesPrice(price: number, range: string) {
  if (range === "under-100") return price < 100000;
  if (range === "100-200") return price >= 100000 && price <= 200000;
  if (range === "over-200") return price > 200000;
  return true; // "tất cả"
}

const PRICE_VALUES = priceRanges.map((range) => range.value);
const SORT_VALUES = ["newest", "price-asc", "price-desc"];

// Trạng thái tìm kiếm / lọc / sắp xếp, đọc từ và ghi lên địa chỉ trang (?q=…&region=…&province=…&price=…&sort=…)
type ListingQuery = { q: string; regions: Region[]; provinces: string[]; price: string; sort: string };

function unique<T>(list: T[]) {
  return [...new Set(list)];
}

// Địa chỉ ứng với một trạng thái; giá trị mặc định (không từ khóa, mọi mức giá, mới nhất) không ghi lên địa chỉ
function toUrl(pathname: string, query: ListingQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  query.regions.forEach((region) => params.append("region", region));
  query.provinces.forEach((province) => params.append("province", province));
  if (query.price !== "all") params.set("price", query.price);
  if (query.sort !== "newest") params.set("sort", query.sort);
  const text = params.toString();
  return text ? `${pathname}?${text}` : pathname;
}

// Giữ tìm kiếm / lọc / sắp xếp (nằm trên địa chỉ trang, nên F5, Back và chia sẻ link giữ nguyên) và hiển thị các sản phẩm
// đã lọc từ localStorage. Từ khóa đến từ ô tìm kiếm ở header (?q=): ở đây không có ô nhập từ khóa.
export default function ProductListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isReady, products } = useStore();

  // Đọc địa chỉ. Giá trị lạ thì bỏ qua; tên tỉnh trước sáp nhập (?province=Sóc Trăng) đổi sang tên tỉnh mới (Cần Thơ).
  const query: ListingQuery = {
    q: (searchParams.get("q") ?? "").trim().slice(0, 100),
    regions: unique(searchParams.getAll("region").filter(isRegion)),
    provinces: unique(searchParams.getAll("province").map((name) => normalizeProvince(name.slice(0, 100))).filter(Boolean)),
    price: PRICE_VALUES.includes(searchParams.get("price") ?? "") ? (searchParams.get("price") as string) : "all",
    sort: SORT_VALUES.includes(searchParams.get("sort") ?? "") ? (searchParams.get("sort") as string) : "newest",
  };
  const { q: search, regions, price, sort } = query;

  // Các ô chọn tỉnh kèm số sản phẩm của tỉnh đó, xếp A đến Z. Có tích miền thì chỉ các tỉnh thuộc các miền đó (src/lib/products.ts).
  const provinceOptions = provinceOptionsFor(products, regions);

  // Chỉ giữ các tỉnh đang có ô trong danh sách. Tên tỉnh trên địa chỉ không có ô (gõ sai, sản phẩm đã bị xóa, hoặc không thuộc
  // miền đang tích, ví dụ ?region=bac&province=Cà Mau) thì bỏ, để không bao giờ lọc theo một tỉnh mà không thấy ô nào được tích.
  const keepShown = (list: string[], options: { name: string }[]) =>
    list.filter((province) => options.some((option) => option.name === province));
  const activeProvinces = isReady ? keepShown(query.provinces, provinceOptions) : query.provinces;

  // Địa chỉ còn tỉnh đã bị bỏ ở trên: viết lại địa chỉ cho khớp (chip và ô tích vốn đã đúng vì dùng activeProvinces)
  const cleanUrl =
    activeProvinces.length !== query.provinces.length ? toUrl(pathname, { ...query, provinces: activeProvinces }) : null;
  useEffect(() => {
    if (cleanUrl) router.replace(cleanUrl, { scroll: false });
  }, [cleanUrl, router]);

  // Đổi một phần trạng thái: ghi lên địa chỉ bằng replace (không thêm mục lịch sử, không cuộn lên đầu)
  function update(patch: Partial<ListingQuery>) {
    router.replace(toUrl(pathname, { ...query, provinces: activeProvinces, ...patch }), { scroll: false });
  }

  // Đổi các miền đang tích: tỉnh đang tích mà không còn ô trong danh sách mới thì bỏ tích luôn (cả trên địa chỉ và chip)
  function setRegions(nextRegions: Region[]) {
    update({ regions: nextRegions, provinces: keepShown(activeProvinces, provinceOptionsFor(products, nextRegions)) });
  }

  // 1. Lọc. Danh sách vùng/tỉnh rỗng nghĩa là "không lọc".
  const filtered = products.filter(
    (product) =>
      matchesSearch(product, search) &&
      (regions.length === 0 || regions.includes(product.region)) &&
      (activeProvinces.length === 0 || activeProvinces.includes(productProvince(product))) &&
      matchesPrice(product.price, price)
  );

  // 2. Sắp xếp. Chỉ sắp xếp theo giá khi khách chọn; mặc định "Mới nhất".
  // (Từ khóa không đổi thứ tự: món khớp tốt nhất đã có ở bảng gợi ý của header.)
  let visible = sortNewestFirst(filtered);
  if (sort === "price-asc") visible = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible = [...filtered].sort((a, b) => b.price - a.price);

  // Các điều kiện đang áp dụng, mỗi cái một chip để bỏ riêng
  const chips: FilterChip[] = [
    ...(search ? [{ key: "q", label: `Từ khóa: «${search}»`, onRemove: () => update({ q: "" }) }] : []),
    ...regions.map((region) => ({
      key: `region-${region}`,
      label: allRegions[region].label,
      onRemove: () => setRegions(regions.filter((item) => item !== region)),
    })),
    ...activeProvinces.map((province) => ({
      key: `province-${province}`,
      label: province,
      onRemove: () => update({ provinces: activeProvinces.filter((item) => item !== province) }),
    })),
    ...(price !== "all"
      ? [{ key: "price", label: priceRanges.find((range) => range.value === price)?.label ?? price, onRemove: () => update({ price: "all" }) }]
      : []),
  ];
  const hasFilters = regions.length > 0 || activeProvinces.length > 0 || price !== "all";

  function resetFilters() {
    update({ regions: [], provinces: [], price: "all" });
  }

  return (
    // Nội dung: thanh công cụ và các sản phẩm. Sidebar (phải): các bộ lọc.
    // Trên điện thoại, các bộ lọc nằm PHÍA TRÊN sản phẩm, gập lại sau nút "Bộ lọc".
    <ContentSidebar
      sidebarLabel="Bộ lọc sản phẩm"
      sidebarFirst
      sticky
      sidebar={
        <ProductFilters
          regions={regions}
          provinceOptions={provinceOptions}
          provinces={activeProvinces}
          price={price}
          onToggleRegion={(region) => setRegions(toggle(regions, region))}
          onToggleProvince={(province) => update({ provinces: toggle(activeProvinces, province) })}
          onPriceChange={(value) => update({ price: value })}
          onReset={resetFilters}
        />
      }
    >
      <section aria-label="Danh sách sản phẩm">
        <ProductToolbar
          total={isReady ? visible.length : 0}
          search={search}
          chips={chips}
          onClearAll={() => update({ q: "", regions: [], provinces: [], price: "all" })}
          sort={sort}
          onSortChange={(value) => update({ sort: value })}
        />

        {!isReady ? (
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface px-6 py-14 text-center">
            <p className="font-semibold text-ink">Không tìm thấy sản phẩm phù hợp{search ? ` cho «${search}»` : ""}.</p>
            {(search || hasFilters) && (
              <>
                <p className="mt-2 text-ink-muted">
                  {hasFilters ? "Thử bỏ bớt bộ lọc" : "Thử một từ khác"}
                  {search ? ", hoặc gõ từ khóa không dấu (ví dụ “nuoc mam”)." : "."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {search && (
                    <button type="button" onClick={() => update({ q: "" })} className={`${btnBase} ${btnSecondary} ${btnSmall}`}>
                      Bỏ từ khóa «{search}»
                    </button>
                  )}
                  {hasFilters && (
                    <button type="button" onClick={resetFilters} className={`${btnBase} ${btnSecondary} ${btnSmall}`}>
                      Bỏ bộ lọc
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {visible.map((product, index) => (
              <ProductCard key={product.id} product={product} eager={index < 3} />
            ))}
          </div>
        )}
      </section>
    </ContentSidebar>
  );
}
