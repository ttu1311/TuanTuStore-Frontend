"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { getBestSellers } from "@/lib/products";

// "Đặc sản bán chạy": danh sách ngắn trong Sidebar trang chủ, Top 1 lên đầu.
// Chỉ gồm các sản phẩm có thứ hạng bán chạy (Admin đặt trong form sản phẩm).
export default function BestSellerSection() {
  const { isReady, products } = useStore();
  const bestSellers = getBestSellers(products);

  return (
    <section id="ban-chay" aria-labelledby="best-title" className="rounded-lg border border-line bg-white p-5">
      <h2 id="best-title" className="font-display text-2xl font-bold leading-none text-ink">
        Đặc sản bán chạy
      </h2>

      {!isReady ? (
        <div aria-hidden="true" className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      ) : bestSellers.length === 0 ? (
        <p className="mt-4 text-ink-muted">Chưa có sản phẩm bán chạy.</p>
      ) : (
        <ol className="mt-3 divide-y divide-line">
          {bestSellers.map((product) => (
            <li key={product.id}>
              <Link href={`/san-pham/${product.id}`} className="group flex items-center gap-3 py-3">
                <Image
                  src={product.image}
                  width={960}
                  height={720}
                  alt=""
                  sizes="64px"
                  className="h-16 w-16 shrink-0 rounded-md bg-surface object-cover"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-ink-muted">Top {product.rank}</span>
                  <span className="block font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary">
                    {product.name}
                  </span>
                  <span className="block text-sm font-bold text-primary">{formatVND(product.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <Link
        href="/san-pham"
        className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline decoration-primary/30 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:decoration-primary"
      >
        Xem tất cả sản phẩm
      </Link>
    </section>
  );
}
