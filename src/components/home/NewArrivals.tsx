"use client";

import ProductMiniCard from "@/components/product/ProductMiniCard";
import { useStore } from "@/context/StoreContext";
import { sortNewestFirst } from "@/lib/products";

const SHOWN = 3;

// "Mới về": các sản phẩm thêm vào gần đây nhất, trong Sidebar trang chủ
export default function NewArrivals() {
  const { isReady, products } = useStore();
  const newest = sortNewestFirst(products).slice(0, SHOWN);

  return (
    <section aria-labelledby="new-title" className="rounded-lg border border-line bg-white p-5">
      <h2 id="new-title" className="font-display text-2xl font-bold leading-none text-ink">
        Mới về
      </h2>
      {!isReady ? (
        <div aria-hidden="true" className="mt-4 space-y-3">
          {Array.from({ length: SHOWN }, (_, n) => (
            <div key={n} className="h-16 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {newest.map((product) => (
            <li key={product.id}>
              <ProductMiniCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
