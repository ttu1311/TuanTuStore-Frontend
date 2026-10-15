"use client";

import Image from "next/image";
import { useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductPurchase from "@/components/product/ProductPurchase";
import RegionBadge from "@/components/product/RegionBadge";
import Icon from "@/components/ui/Icon";
import LoadingState from "@/components/ui/LoadingState";
import NotFoundMessage from "@/components/ui/NotFoundMessage";
import SectionHeader from "@/components/ui/SectionHeader";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { descriptionParagraphs, discountPercent, getRelatedProducts } from "@/lib/products";
import { regions } from "@/lib/regions";

const container = "mx-auto w-full max-w-container px-4 md:px-6 lg:px-8";

// Body of /san-pham/[id]. The product is looked up in localStorage, so this runs in the browser.
export default function ProductDetailView({ id }: { id: string }) {
  const { isReady, products } = useStore();
  const product = products.find((item) => item.id === id);

  // The browser tab shows the product name (it is only known after localStorage has been read)
  useEffect(() => {
    if (!isReady) return;
    document.title = product ? `${product.name} — TuanTuStore` : "Không tìm thấy sản phẩm — TuanTuStore";
  }, [isReady, product]);

  if (!isReady) {
    return (
      <div className={container}>
        <LoadingState text="Đang tải sản phẩm…" />
      </div>
    );
  }

  // Unknown id (wrong link, or the Admin deleted the product)
  if (!product) {
    return (
      <div className={`${container} py-10 lg:py-16`}>
        <NotFoundMessage
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa khỏi cửa hàng. Hãy xem các đặc sản khác của TuanTuStore."
        />
      </div>
    );
  }

  const discount = discountPercent(product);
  const relatedProducts = getRelatedProducts(products, product);

  // Rows of the "Thông tin sản phẩm" table
  const productInfo = [
    { label: "Thương hiệu", value: product.brand },
    { label: "Nơi sản xuất", value: product.origin },
    { label: "Vùng miền", value: regions[product.region].label },
    { label: "Quy cách", value: product.pack },
    { label: "Mã sản phẩm", value: product.id },
  ];

  return (
    <>
      {/* Top part: image + main information */}
      <section aria-labelledby="product-name" className="py-10 lg:py-16">
        <div className={`${container} grid items-start gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Image
              src={product.image}
              width={960}
              height={720}
              alt={product.name}
              preload
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
              className="block aspect-square h-auto w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <RegionBadge region={product.region} />
            <h1
              id="product-name"
              className="mt-4 break-words font-display text-3xl font-semibold leading-tight text-ink md:text-title"
            >
              {product.name}
            </h1>

            <dl className="mt-4 space-y-1 text-ink-muted">
              <div className="flex gap-2">
                <dt>Thương hiệu:</dt>
                <dd className="font-medium text-ink">{product.brand}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Nơi sản xuất</dt>
                <Icon name="pin" size={16} />
                <dd>{product.origin}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="whitespace-nowrap text-3xl font-bold text-primary">{formatVND(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="whitespace-nowrap text-lg text-ink-muted line-through">
                    <span className="sr-only">Giá cũ </span>
                    {formatVND(product.oldPrice)}
                  </span>
                  <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">-{discount}%</span>
                </>
              )}
            </div>

            <p className="mt-6 max-w-[520px] text-lg text-ink-muted">{product.shortDescription}</p>

            {/* key: start again from quantity 1 when another product is opened */}
            <ProductPurchase key={product.id} productId={product.id} />
          </div>
        </div>
      </section>

      {/* Description + product information */}
      <section aria-labelledby="detail-title" className="bg-surface py-16 lg:py-24">
        <div className={`${container} grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16`}>
          <div>
            <h2 id="detail-title" className="font-display text-2xl font-semibold text-ink">
              Mô tả chi tiết
            </h2>
            <div className="mt-4 space-y-4 text-ink-muted">
              {descriptionParagraphs(product).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Thông tin sản phẩm</h2>
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
              {productInfo.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 px-6 py-4">
                  <dt className="shrink-0 text-ink-muted">{row.label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-title" className="py-16 lg:py-24">
          <div className={container}>
            <SectionHeader id="related-title" title="Sản phẩm liên quan" />
            <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
