"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import SectionHeader from "@/components/ui/SectionHeader";
import { btnBase, btnGhost } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { getFeaturedProducts } from "@/lib/products";

// "Sản phẩm nổi bật": the products the Admin marked as featured
export default function FeaturedProducts() {
  const { isReady, products } = useStore();
  const featured = getFeaturedProducts(products);

  return (
    <section id="san-pham" aria-labelledby="featured-title" className="py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <SectionHeader
          id="featured-title"
          title="Sản phẩm nổi bật"
          action={
            <Link href="/san-pham" className={`${btnBase} ${btnGhost}`}>
              Xem tất cả sản phẩm
            </Link>
          }
        />
        {isReady && featured.length === 0 ? (
          <p className="text-ink-muted">Chưa có sản phẩm nổi bật.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {isReady
              ? featured.map((product) => <ProductCard key={product.id} product={product} />)
              : [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={n} />)}
          </div>
        )}
      </div>
    </section>
  );
}
