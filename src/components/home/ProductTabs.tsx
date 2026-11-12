"use client";

import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import { btnBase, btnSecondary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { getBestSellers, sortNewestFirst } from "@/lib/products";
import { regionKeys, regions } from "@/lib/regions";
import { soldCounts } from "@/lib/reviews";
import type { Region } from "@/types";

const SHOWN = 8; // 2 hàng × 4 thẻ

type TabId = "ban-chay" | "tat-ca" | Region;

const tabs: { id: TabId; label: string; dotClass?: string }[] = [
  { id: "ban-chay", label: "Bán chạy" },
  { id: "tat-ca", label: "Tất cả" },
  ...regionKeys.map((key) => ({ id: key as TabId, label: regions[key].label, dotClass: regions[key].dotClass })),
];

// "Tất cả sản phẩm" ở trang chủ, ngay dưới banner: các tab Bán chạy · Tất cả · Miền Bắc · Miền Trung · Miền Nam,
// mỗi tab một lưới tối đa 8 sản phẩm, và nút "Xem tất cả sản phẩm" ở cuối mở trang Sản phẩm (đã lọc theo miền khi đang ở tab miền).
// - Bán chạy: theo số lượng đã bán (xem getBestSellers); - Tất cả: mới nhất trước; - tab miền: bán chạy trước trong miền đó.
export default function ProductTabs() {
  const { isReady, products, orders, productViews } = useStore();
  const [tab, setTab] = useState<TabId>("ban-chay");

  const sold = soldCounts(orders);
  const region = regionKeys.find((key) => key === tab);
  const regionProducts = region ? products.filter((product) => product.region === region) : products;
  const items =
    tab === "ban-chay"
      ? getBestSellers(products, sold, productViews)
      : tab === "tat-ca"
        ? sortNewestFirst(products).slice(0, SHOWN)
        : getBestSellers(regionProducts, sold, productViews);
  const total = regionProducts.length;

  // Mũi tên trái/phải đổi tab (Home/End: tab đầu/cuối), đưa con trỏ theo tab mới
  function handleKeyDown(event: React.KeyboardEvent) {
    const index = tabs.findIndex((item) => item.id === tab);
    const next =
      event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : -1;
    if (next < 0) return;
    event.preventDefault();
    setTab(tabs[next].id);
    document.getElementById(`tab-${tabs[next].id}`)?.focus();
  }

  return (
    <section id="san-pham" aria-labelledby="products-title">
      <SectionHeader id="products-title" title="Tất cả sản phẩm" description="Chọn theo bán chạy hoặc theo miền. Món nào cũng ghi rõ nơi làm ra." />

      {/* Tab: cuộn ngang được trên điện thoại */}
      <div
        role="tablist"
        aria-label="Lọc sản phẩm"
        onKeyDown={handleKeyDown}
        className="-mt-4 mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="products-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors duration-200 ${
                selected ? "border-primary bg-primary text-white" : "border-line bg-white text-ink hover:border-primary hover:text-primary"
              }`}
            >
              {item.dotClass && <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${item.dotClass}`} aria-hidden="true" />}
              {item.label}
            </button>
          );
        })}
      </div>

      <div id="products-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {isReady && items.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-10 text-center text-ink-muted">Chưa có sản phẩm trong mục này.</p>
        ) : (
          // key: đổi tab thì lưới hiện lại nhẹ nhàng
          <ul key={tab} className="grid animate-fade-up grid-cols-2 gap-x-3 gap-y-8 min-[480px]:gap-x-6 min-[480px]:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            {isReady
              ? items.map((product) => (
                  <li key={product.id} className="flex">
                    <ProductCard product={product} />
                  </li>
                ))
              : [1, 2, 3, 4].map((n) => (
                  <li key={n}>
                    <ProductCardSkeleton />
                  </li>
                ))}
          </ul>
        )}
      </div>

      {/* Cuối khối: số đang hiện, và nút sang trang Sản phẩm */}
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        {isReady && (
          <p className="text-sm text-ink-muted">
            Đang hiện {items.length} trên {total} sản phẩm{region ? ` ${regions[region].label}` : ""}
          </p>
        )}
        <Link href={region ? `/san-pham?region=${region}` : "/san-pham"} className={`${btnBase} ${btnSecondary}`}>
          Xem tất cả sản phẩm{region ? ` ${regions[region].label}` : ""}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </section>
  );
}
