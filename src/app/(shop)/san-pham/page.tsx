import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageLayout";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import ProductListing from "@/components/products/ProductListing";

export const metadata: Metadata = {
  title: "Sản phẩm — Đặc sản 3 Miền",
  description: "Tất cả sản phẩm của Đặc sản 3 Miền: quà quê Bắc, Trung, Nam.",
};

// Từ khóa và bộ lọc nằm trên địa chỉ trang và do ProductListing đọc (useSearchParams), nên trang không cần đọc searchParams
// và KHÔNG đặt key theo từ khóa: tìm từ khóa mới ở header không làm mất các bộ lọc đang chọn.
// Địa chỉ: ?q=<từ khóa> (ô tìm kiếm ở header), ?region=bac (lặp được: menu "3 Miền", tab miền ở trang chủ),
// ?province=Cà Mau (lặp được: hộ chiếu đặc sản), ?price=under-100|100-200|over-200, ?sort=price-asc|price-desc.
export default function ProductListingPage() {
  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-title">Tất cả sản phẩm</h1>
        <span className="mt-3 block max-w-[560px] text-ink-muted">Đặc sản chọn lọc từ ba miền Bắc, Trung, Nam.</span>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        }
      >
        <ProductListing />
      </Suspense>
    </PageContainer>
  );
}
