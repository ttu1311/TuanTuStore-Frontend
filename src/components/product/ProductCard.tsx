import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import { formatVND } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import { regions } from "@/lib/regions";
import type { Product } from "@/types";

// eager: load the photo right away (for the first cards at the top of a page)
// showRank: show the small "Top 1" label (the homepage best-seller list shows the rank itself, so it turns this off)
export default function ProductCard({
  product,
  eager = false,
  showRank = true,
}: {
  product: Product;
  eager?: boolean;
  showRank?: boolean;
}) {
  const discount = discountPercent(product);
  const detailUrl = `/san-pham/${product.id}`;
  const region = regions[product.region];

  return (
    <article className="group flex flex-1 flex-col">
      <div className="relative overflow-hidden rounded-lg bg-surface">
        {/* The image links to the detail page. The name below is the keyboard-friendly link. */}
        <Link href={detailUrl} tabIndex={-1} aria-hidden="true" className="block">
          {/* Every product photo is shown cropped to a square, so one fixed size works for next/image */}
          <Image
            src={product.image}
            width={960}
            height={720}
            alt={product.name}
            loading={eager ? "eager" : undefined}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 480px) 45vw, 100vw"
            className="block aspect-square h-auto w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
        </Link>
        {showRank && product.rank && (
          <span className="absolute left-3 top-3 rounded bg-paper px-2 py-1 text-xs font-semibold text-ink">
            Top {product.rank}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded bg-sale px-2 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {/* The region dot links this card to the colours of the homepage route */}
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <span className={`h-2 w-2 shrink-0 rounded-full ${region.dotClass}`} aria-hidden="true" />
          <span className="sr-only">{region.label}, </span>
          <span className="min-w-0 truncate">{product.origin}</span>
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug">
          <Link href={detailUrl} className="hover:underline hover:decoration-2 hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>

        <div className="mb-4 mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="whitespace-nowrap text-lg font-bold text-ink">{formatVND(product.price)}</span>
          {product.oldPrice && (
            <span className="whitespace-nowrap text-sm text-ink-muted line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVND(product.oldPrice)}
            </span>
          )}
          <span className="text-sm text-ink-muted">{product.pack}</span>
        </div>

        <AddToCartButton productId={product.id} productName={product.name} />
      </div>
    </article>
  );
}
