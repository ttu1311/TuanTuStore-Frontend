"use client";

import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import ContentSidebar from "@/components/layout/PageLayout";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import { useStore } from "@/context/StoreContext";
import { occasions } from "@/data/occasions";
import { brandSummaries } from "@/lib/brands";
import { groupProducts, productProvince, sortNewestFirst } from "@/lib/products";
import { simplifyText } from "@/lib/text";
import type { Product, Region } from "@/types";

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

// Chữ thường, và cùng một dạng Unicode cho mọi chữ cái tiếng Việt
function lowerText(text: string) {
  return text.toLowerCase().normalize("NFC");
}

// Tách thành từng từ (bỏ dấu câu)
function splitWords(text: string) {
  return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// Các từ liền nhau của `words` có khớp từ khóa không? Từ cuối của từ khóa được phép chưa gõ xong.
function matchesWords(words: string[], termWords: string[]) {
  return words.some((_, start) =>
    termWords.every((termWord, i) => {
      const word = words[start + i];
      if (word === undefined) return false;
      return i === termWords.length - 1 ? word.startsWith(termWord) : word === termWord;
    })
  );
}

// Tìm theo TỪ NGUYÊN VẸN (không phải chuỗi con), từ khóa nhiều từ phải khớp các từ liền nhau.
// - Tên, xuất xứ, thương hiệu: bỏ qua dấu, nên "o mai" tìm ra "Ô mai", "ca mau" tìm ra "Cà Mau".
// - Mô tả ngắn: dấu phải khớp. Nếu bỏ dấu thì "cua" khớp nhầm "của" và "cửa" ("vùng cửa biển"),
//   nên gõ không dấu sẽ không tìm trong mô tả. Gõ có dấu ("trà", "cửa") thì có.
function matchesSearch(product: Product, search: string) {
  const term = lowerText(search.trim());
  if (!term) return true;

  const typedWithAccents = simplifyText(term) !== term;

  const plainTerm = splitWords(simplifyText(term));
  if (plainTerm.length === 0) return true;
  const plainFields = [product.name, product.origin, product.brand];
  if (plainFields.some((text) => matchesWords(splitWords(simplifyText(text)), plainTerm))) return true;

  return typedWithAccents && matchesWords(splitWords(lowerText(product.shortDescription)), splitWords(term));
}

type ProductListingProps = {
  initialSearch?: string; // từ ô tìm kiếm ở header: /san-pham?q=...
  initialRegion?: Region; // từ menu "3 Miền" và các tab miền ở trang chủ: /san-pham?region=bac
  initialProvince?: string; // từ bản đồ (/ban-do) và hộ chiếu đặc sản: /san-pham?province=Cà Mau
  initialBrand?: string; // từ phần "Về thương hiệu" ở trang chi tiết: /san-pham?brand=Hồng Lam
  initialOccasion?: string; // từ các thẻ dịp tặng ở trang chi tiết: /san-pham?dip=qua-tet
};

// Giữ state tìm kiếm / lọc / sắp xếp và hiển thị các sản phẩm đã lọc từ localStorage.
export default function ProductListing({
  initialSearch = "",
  initialRegion,
  initialProvince = "",
  initialBrand = "",
  initialOccasion = "",
}: ProductListingProps) {
  const { isReady, products } = useStore();
  const [search, setSearch] = useState(initialSearch);
  const [regions, setRegions] = useState<Region[]>(initialRegion ? [initialRegion] : []);
  const [brands, setBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [provinces, setProvinces] = useState<string[]>(initialProvince ? [initialProvince] : []);
  // Dịp tặng lạ trên địa chỉ thì bỏ qua ngay (danh sách dịp cố định, không phụ thuộc localStorage)
  const [occasionIds, setOccasionIds] = useState<string[]>(
    occasions.some((occasion) => occasion.id === initialOccasion) ? [initialOccasion] : []
  );
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");

  // Các ô chọn thương hiệu: mọi thương hiệu đang có sản phẩm, kèm số sản phẩm và tên các sản phẩm đó, xếp A đến Z
  const brandOptions = brandSummaries(products);

  // Các ô chọn tỉnh kèm số sản phẩm của tỉnh đó, xếp A đến Z
  const provinceOptions = groupProducts(products, productProvince).map(({ name, items }) => ({
    name,
    count: items.length,
  }));

  // Tên tỉnh trên địa chỉ không có trong dữ liệu (gõ sai, hoặc sản phẩm đã bị xóa) thì bỏ qua, để không lọc ra rỗng mà không thấy ô nào được tích
  const activeProvinces = isReady ? provinces.filter((province) => provinceOptions.some((option) => option.name === province)) : provinces;

  // Tên thương hiệu trên địa chỉ không có trong dữ liệu thì bỏ qua, giống như tỉnh ở trên
  const activeBrands = isReady ? brands.filter((brand) => brandOptions.some((option) => option.name === brand)) : brands;

  // Các ô chọn dịp tặng, kèm số sản phẩm của mỗi dịp
  const occasionOptions = occasions.map((occasion) => ({
    id: occasion.id,
    label: occasion.label,
    count: products.filter((product) => product.occasions?.includes(occasion.id)).length,
  }));

  // 1. Lọc. Danh sách vùng/thương hiệu rỗng nghĩa là "không lọc".
  const filtered = products.filter(
    (product) =>
      matchesSearch(product, search) &&
      (regions.length === 0 || regions.includes(product.region)) &&
      (activeBrands.length === 0 || activeBrands.includes(product.brand)) &&
      (occasionIds.length === 0 || occasionIds.some((id) => product.occasions?.includes(id))) &&
      (activeProvinces.length === 0 || activeProvinces.includes(productProvince(product))) &&
      matchesPrice(product.price, price)
  );

  // 2. Sắp xếp
  let visible = sortNewestFirst(filtered);
  if (sort === "price-asc") visible = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible = [...filtered].sort((a, b) => b.price - a.price);

  function resetFilters() {
    setSearch("");
    setRegions([]);
    setBrands([]);
    setProvinces([]);
    setOccasionIds([]);
    setPrice("all");
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
          brandOptions={brandOptions}
          brands={activeBrands}
          occasionOptions={occasionOptions}
          occasions={occasionIds}
          onToggleOccasion={(id) => setOccasionIds(toggle(occasionIds, id))}
          provinceOptions={provinceOptions}
          provinces={activeProvinces}
          price={price}
          onToggleRegion={(region) => setRegions(toggle(regions, region))}
          onToggleBrand={(brand) => setBrands(toggle(brands, brand))}
          onToggleProvince={(province) => setProvinces(toggle(provinces, province))}
          onPriceChange={setPrice}
          onReset={resetFilters}
        />
      }
    >
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
    </ContentSidebar>
  );
}
