"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import { regions } from "@/lib/regions";
import { buildRoute, formatLatitude } from "@/lib/route";
import { slugify } from "@/lib/text";
import type { Product } from "@/types";

// Đường tuyến nằm trong 48px đầu của mỗi hàng; tâm của nó ở 16px, và tâm của mọi chấm điểm dừng cũng vậy.
const lineClass = "absolute left-[14px] w-1";

// Tuyến "Bắc vào Nam" ở trang chủ: mỗi điểm dừng là MỘT tỉnh/thành, xếp từ Bắc xuống Nam theo vĩ độ.
// Tên tỉnh là tiêu đề lớn; mọi sản phẩm của tỉnh nằm chung trong điểm dừng đó.
// Chọn một tỉnh sẽ mở các sản phẩm ngay tại đó: ảnh, giá và "Thêm vào giỏ".
export default function ProductRoute() {
  const { isReady, products } = useStore();
  const stops = buildRoute(products);
  // undefined = chưa chọn gì, nên tỉnh đầu tiên đang mở; null = khách đã đóng mọi điểm dừng
  const [chosen, setChosen] = useState<string | null>();
  const openProvince = chosen === undefined ? stops[0]?.province : chosen;

  if (!isReady) {
    return (
      <div aria-hidden="true" className="relative space-y-7 pl-12 pt-1">
        <span className={`${lineClass} inset-y-0 rounded-full bg-surface`} />
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="space-y-2">
            <div className="h-7 w-2/5 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/3 rounded bg-surface" />
          </div>
        ))}
      </div>
    );
  }

  if (stops.length === 0) {
    return <p className="text-ink-muted">Cửa hàng chưa có sản phẩm nào. Hãy quay lại sau.</p>;
  }

  return (
    <ol aria-label="Đặc sản từ Bắc vào Nam, theo tỉnh">
      {stops.map((stop, index) => {
        const region = regions[stop.region];
        const isOpen = stop.province === openProvince;
        const isLast = index === stops.length - 1;
        const startsRegion = index === 0 || stops[index - 1].region !== stop.region;
        const panelId = `tinh-${slugify(stop.province)}`;

        return (
          // Các điểm dừng hiện lần lượt từ Bắc vào Nam khi trang mở
          <li key={stop.province} className="animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
            {/* Nơi một vùng mới bắt đầu, đường tuyến đổi màu và tên vùng được ghi ra */}
            {startsRegion && (
              <div className={`relative pb-2 pl-12 ${index === 0 ? "" : "pt-6"}`}>
                <span className={`${lineClass} bottom-0 ${index === 0 ? "top-3" : "top-0"} ${region.dotClass}`} />
                <span className={`text-sm font-semibold ${region.textClass}`}>{region.label}</span>
              </div>
            )}

            <div className="relative pl-12">
              <span className={`${lineClass} top-0 ${isLast ? "h-[30px]" : "bottom-0"} ${region.dotClass}`} />
              {/* Điểm dừng: một chấm trên đường tuyến. Điểm dừng đang mở to hơn, tâm sáng màu. */}
              <span
                aria-hidden="true"
                className={`absolute top-[30px] flex -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-paper transition-all duration-200 ${region.dotClass} ${
                  isOpen ? "left-[5px] h-[22px] w-[22px]" : "left-[9px] h-3.5 w-3.5"
                }`}
              >
                <span
                  className={`rounded-full bg-paper transition-all duration-200 ${isOpen ? "h-2 w-2" : "h-0 w-0"}`}
                />
              </span>

              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setChosen(isOpen ? null : stop.province)}
                  className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-md py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="font-display text-[1.75rem] font-semibold uppercase leading-tight text-ink sm:text-3xl">
                      {stop.province}
                    </span>
                    {/* Tên các sản phẩm của tỉnh; tên địa phương nhỏ (U Minh Hạ, Năm Căn…) nằm trong tên sản phẩm */}
                    <span
                      className={`mt-0.5 block font-medium transition-colors duration-200 ${
                        isOpen ? "text-ink" : "text-ink-muted group-hover:text-ink"
                      }`}
                    >
                      {stop.products.map((product) => product.name).join(" · ")}
                    </span>
                  </span>
                  {stop.latitude !== undefined && (
                    <span className="whitespace-nowrap text-sm tabular-nums text-ink-muted">
                      <span className="sr-only">Vĩ độ </span>
                      {formatLatitude(stop.latitude)}
                    </span>
                  )}
                </button>
              </h3>

              {/* Mở bằng cách tăng dần chiều cao. `invisible` giữ điểm dừng đang đóng ra khỏi thứ tự tab bàn phím. */}
              <div
                id={panelId}
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${
                  isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {/* Một cột: tuyến nằm trong nửa trang, hai cột thì thẻ quá chật */}
                  <ul className="grid gap-3 pb-8 pt-2">
                    {stop.products.map((product) => (
                      <RouteProduct key={product.id} product={product} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Một sản phẩm trong điểm dừng đang mở: ảnh nhỏ, tên, giá và "Thêm vào giỏ"
function RouteProduct({ product }: { product: Product }) {
  const discount = discountPercent(product);
  return (
    <li className="flex gap-3 rounded-lg border border-line bg-white p-3">
      <Link href={`/san-pham/${product.id}`} tabIndex={-1} aria-hidden="true" className="block shrink-0">
        <Image
          src={product.image}
          width={160}
          height={160}
          alt=""
          sizes="80px"
          className="block h-20 w-20 rounded-md bg-surface object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/san-pham/${product.id}`}
          className="font-semibold leading-snug text-ink transition-colors duration-200 hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-bold text-ink">{formatVND(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-ink-muted line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVND(product.oldPrice)}
            </span>
          )}
          {discount > 0 && <span className="text-xs font-semibold text-sale">-{discount}%</span>}
          <span className="text-xs text-ink-muted">{product.pack}</span>
        </div>
        <div className="mt-auto pt-2">
          <AddToCartButton productId={product.id} productName={product.name} className="w-full" />
        </div>
      </div>
    </li>
  );
}
