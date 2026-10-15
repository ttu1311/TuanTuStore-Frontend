"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import SectionHeader from "@/components/ui/SectionHeader";
import { btnBase, btnGhost } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { getBestSellers } from "@/lib/products";

// "Đặc sản bán chạy": the products that have a best-seller rank (Top 1 first).
// The rank is written large above each card, so the list reads as a ranking.
export default function BestSellerSection() {
  const { isReady, products } = useStore();
  const bestSellers = getBestSellers(products);

  return (
    <section id="ban-chay" aria-labelledby="best-title" className="bg-surface py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <SectionHeader
          id="best-title"
          title="Đặc sản bán chạy"
          action={
            <Link href="/san-pham" className={`${btnBase} ${btnGhost}`}>
              Xem tất cả sản phẩm
            </Link>
          }
        />
        {isReady && bestSellers.length === 0 ? (
          <p className="text-ink-muted">Chưa có sản phẩm bán chạy.</p>
        ) : (
          <ol className="grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {isReady
              ? bestSellers.map((product) => (
                  <li key={product.id} className="flex flex-col">
                    <p className="mb-3 border-b-2 border-ink pb-2 font-display text-5xl font-bold leading-none text-ink">
                      <span className="sr-only">Hạng </span>
                      {product.rank}
                    </p>
                    <ProductCard product={product} showRank={false} />
                  </li>
                ))
              : [1, 2, 3, 4].map((n) => (
                  <li key={n}>
                    <ProductCardSkeleton />
                  </li>
                ))}
          </ol>
        )}
      </div>
    </section>
  );
}
