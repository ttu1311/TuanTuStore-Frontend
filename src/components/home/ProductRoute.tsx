"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import { btnBase, btnSecondary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import { regions } from "@/lib/regions";
import { buildRoute, formatLatitude } from "@/lib/route";

// The route line sits in the first 48px of each row; its centre is at 16px, and so is the centre of every stop dot.
const lineClass = "absolute left-[14px] w-1";

// The homepage route "Bắc vào Nam": every product is a stop, ordered from north to south.
// Choosing a stop opens its product right there: photo, price and "Thêm vào giỏ".
export default function ProductRoute() {
  const { isReady, products } = useStore();
  const stops = buildRoute(products);
  // undefined = nothing chosen yet, so the first stop is open; null = the customer closed every stop
  const [chosenId, setChosenId] = useState<string | null>();
  const openId = chosenId === undefined ? stops[0]?.product.id : chosenId;

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
    <ol aria-label="Đặc sản từ Bắc vào Nam">
      {stops.map((stop, index) => {
        const { product } = stop;
        const region = regions[product.region];
        const isOpen = product.id === openId;
        const isLast = index === stops.length - 1;
        const startsRegion = index === 0 || stops[index - 1].product.region !== product.region;
        const panelId = `chang-${product.id}`;
        const discount = discountPercent(product);

        return (
          <li key={product.id}>
            {/* Where a new region begins, the line changes colour and the region is named */}
            {startsRegion && (
              <div className={`relative pb-2 pl-12 ${index === 0 ? "" : "pt-6"}`}>
                <span className={`${lineClass} bottom-0 ${index === 0 ? "top-3" : "top-0"} ${region.dotClass}`} />
                <span className={`text-sm font-semibold ${region.textClass}`}>{region.label}</span>
              </div>
            )}

            <div className="relative pl-12">
              <span className={`${lineClass} top-0 ${isLast ? "h-[30px]" : "bottom-0"} ${region.dotClass}`} />
              {/* The stop: a dot on the line. The open stop is larger, with a light centre. */}
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
                  onClick={() => setChosenId(isOpen ? null : product.id)}
                  className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-md py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="font-display text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
                      {stop.place}
                    </span>
                    {stop.area && <span className="ml-2 text-sm text-ink-muted">{stop.area}</span>}
                    <span
                      className={`mt-0.5 block font-medium transition-colors duration-200 ${
                        isOpen ? "text-ink" : "text-ink-muted group-hover:text-ink"
                      }`}
                    >
                      {product.name}
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

              {/* Opens by growing its height. `invisible` keeps a closed stop out of the keyboard order. */}
              <div
                id={panelId}
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${
                  isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-5 pb-8 pt-2 min-[480px]:grid-cols-[10rem_1fr] sm:grid-cols-[12rem_1fr]">
                    <Link href={`/san-pham/${product.id}`} tabIndex={-1} aria-hidden="true" className="block">
                      <Image
                        src={product.image}
                        width={960}
                        height={720}
                        alt=""
                        sizes="(min-width: 640px) 192px, (min-width: 480px) 160px, 100vw"
                        className="block aspect-[4/3] h-auto w-full rounded-lg bg-surface object-cover min-[480px]:aspect-square"
                      />
                    </Link>
                    <div className="flex flex-col">
                      <p className="max-w-[46ch] text-ink-muted">{product.shortDescription}</p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-xl font-bold text-ink">{formatVND(product.price)}</span>
                        {product.oldPrice && (
                          <span className="text-sm text-ink-muted line-through">
                            <span className="sr-only">Giá cũ </span>
                            {formatVND(product.oldPrice)}
                          </span>
                        )}
                        {discount > 0 && <span className="text-sm font-semibold text-sale">Giảm {discount}%</span>}
                        <span className="text-sm text-ink-muted">{product.pack}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <AddToCartButton productId={product.id} productName={product.name} className="" />
                        <Link href={`/san-pham/${product.id}`} className={`${btnBase} ${btnSecondary} ${btnSmall}`}>
                          Xem chi tiết <span className="sr-only">{product.name}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
