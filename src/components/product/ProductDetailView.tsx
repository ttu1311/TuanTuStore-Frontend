"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import ContentSidebar, { PageContainer } from "@/components/layout/PageLayout";
import ProductMiniCard from "@/components/product/ProductMiniCard";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductStory from "@/components/product/ProductStory";
import { findOccasion } from "@/data/occasions";
import RegionBadge from "@/components/product/RegionBadge";
import ProductRatingLine from "@/components/reviews/ProductRatingLine";
import ProductReviews from "@/components/reviews/ProductReviews";
import Icon from "@/components/ui/Icon";
import LoadingState from "@/components/ui/LoadingState";
import NotFoundMessage from "@/components/ui/NotFoundMessage";
import { useStore } from "@/context/StoreContext";
import { findBrand } from "@/lib/brands";
import { formatVND } from "@/lib/format";
import { descriptionParagraphs, discountPercent, getRelatedProducts } from "@/lib/products";
import { regionKeys, regions } from "@/lib/regions";

// Phần thân của /san-pham/[id]. Sản phẩm được tra trong localStorage, nên phần này chạy ở trình duyệt.
export default function ProductDetailView({ id }: { id: string }) {
  const { isReady, products } = useStore();
  const product = products.find((item) => item.id === id);

  // Tab trình duyệt hiện tên sản phẩm (chỉ biết được sau khi đọc xong localStorage)
  useEffect(() => {
    if (!isReady) return;
    document.title = product ? `${product.name} — TuanTuStore` : "Không tìm thấy sản phẩm — TuanTuStore";
  }, [isReady, product]);

  if (!isReady) {
    return (
      <PageContainer className="py-0">
        <LoadingState text="Đang tải sản phẩm…" />
      </PageContainer>
    );
  }

  // Id không tồn tại (liên kết sai, hoặc Admin đã xóa sản phẩm)
  if (!product) {
    return (
      <PageContainer>
        <NotFoundMessage
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa khỏi cửa hàng. Hãy xem các đặc sản khác của TuanTuStore."
        />
      </PageContainer>
    );
  }

  const discount = discountPercent(product);
  const relatedProducts = getRelatedProducts(products, product);
  // Thương hiệu của sản phẩm: thông tin từ danh mục, và các sản phẩm khác cùng thương hiệu
  const brandInfo = findBrand(product.brand);
  // Dịp tặng của sản phẩm, theo thứ tự trong src/data/occasions.ts; id lạ (đã bị bỏ) thì bỏ qua
  const productOccasions = (product.occasions ?? []).flatMap((id) => findOccasion(id) ?? []);
  const sameBrandProducts = products.filter((item) => item.brand === product.brand && item.id !== product.id);
  const brandHref = `/san-pham?brand=${encodeURIComponent(product.brand)}`;

  // Các dòng của bảng "Thông tin sản phẩm"
  const productInfo = [
    { label: "Thương hiệu", value: product.brand },
    { label: "Nơi sản xuất", value: product.origin },
    { label: "Vùng miền", value: regions[product.region].label },
    { label: "Quy cách", value: product.pack },
    { label: "Mã sản phẩm", value: product.id },
  ];

  return (
    <PageContainer>
      <ContentSidebar
        sidebarLabel="Sản phẩm liên quan và đã xem gần đây"
        sidebar={
          <div className="space-y-6">
            {relatedProducts.length > 0 && (
              <section aria-labelledby="related-title" className="rounded-lg border border-line bg-white p-5">
                <h2 id="related-title" className="font-display text-2xl font-bold leading-none text-ink">
                  Sản phẩm liên quan
                </h2>
                <ul className="mt-3 divide-y divide-line">
                  {relatedProducts.map((item) => (
                    <li key={item.id}>
                      <ProductMiniCard product={item} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <RecentlyViewed key={product.id} currentId={product.id} products={products} />
            <nav aria-labelledby="category-title" className="rounded-lg bg-surface p-5">
              <h2 id="category-title" className="font-display text-2xl font-bold leading-none text-ink">
                Xem theo vùng
              </h2>
              <ul className="mt-3">
                {regionKeys.map((key) => (
                  <li key={key}>
                    <Link
                      href={`/san-pham?region=${key}`}
                      className="flex min-h-11 items-center gap-3 font-medium text-ink transition-colors duration-200 hover:text-primary"
                    >
                      <span className={`h-2 w-2 rounded-full ${regions[key].dotClass}`} aria-hidden="true" />
                      {regions[key].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        }
      >
        {/* Nội dung, phần trên: ảnh + thông tin chính */}
        <section aria-labelledby="product-name" className="grid items-start gap-8 md:grid-cols-2 lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Image
              src={product.image}
              width={960}
              height={720}
              alt={product.name}
              preload
              sizes="(min-width: 1280px) 420px, (min-width: 768px) 40vw, 100vw"
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
            <div className="mt-2">
              <ProductRatingLine productId={product.id} href="#danh-gia" />
            </div>

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

            {/* Dịp tặng phù hợp: bấm để xem các món khác cùng dịp */}
            {productOccasions.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-muted">Hợp làm:</span>
                {productOccasions.map((occasion) => (
                  <Link
                    key={occasion.id}
                    href={`/san-pham?dip=${occasion.id}`}
                    className="inline-flex min-h-8 items-center rounded-full bg-gold-soft px-3 text-sm font-medium text-gold-ink transition-colors duration-200 hover:bg-gold-light/40"
                  >
                    {occasion.label}
                  </Link>
                ))}
              </div>
            )}

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

            {/* key: bắt đầu lại từ số lượng 1 khi mở sản phẩm khác */}
            <ProductPurchase key={product.id} productId={product.id} />
          </div>
        </section>

        {/* Nội dung, phần dưới: mô tả, rồi bảng thông tin sản phẩm */}
        <section aria-labelledby="detail-title" className="mt-12 space-y-10 border-t border-line pt-10">
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

          <ProductStory story={product.story} />

          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Về thương hiệu</h2>
            <div className="mt-4 rounded-xl border border-line bg-white p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-xl font-semibold text-ink">{product.brand}</span>
                {brandInfo && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                    {brandInfo.kind}
                  </span>
                )}
              </div>
              {brandInfo && (
                <>
                  <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                    <Icon name="pin" size={14} />
                    {brandInfo.place}
                  </p>
                  <p className="mt-3 text-ink-muted">{brandInfo.about}</p>
                </>
              )}
              {sameBrandProducts.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-ink">Sản phẩm khác của thương hiệu này</h3>
                  <ul className="mt-1 divide-y divide-line">
                    {sameBrandProducts.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/san-pham/${item.id}`}
                          className="flex min-h-11 items-center justify-between gap-3 text-ink transition-colors duration-200 hover:text-primary"
                        >
                          <span className="min-w-0 break-words">{item.name}</span>
                          <span className="shrink-0 whitespace-nowrap text-sm text-ink-muted">{formatVND(item.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                href={brandHref}
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary transition-colors duration-200 hover:underline"
              >
                Xem tất cả sản phẩm của {product.brand}
              </Link>
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

          <ProductReviews productId={product.id} />
        </section>
      </ContentSidebar>
    </PageContainer>
  );
}
