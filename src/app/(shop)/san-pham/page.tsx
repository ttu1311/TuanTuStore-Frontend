import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageLayout";
import ProductListing from "@/components/products/ProductListing";
import { isRegion } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Sản phẩm — TuanTuStore",
  description: "Tất cả đặc sản ba miền Bắc, Trung, Nam tại TuanTuStore.",
};

type ProductListingPageProps = {
  searchParams: Promise<{ q?: string | string[]; region?: string | string[]; province?: string | string[]; brand?: string | string[] }>;
};

// Giá trị đầu tiên khi một tham số truy vấn xuất hiện nhiều lần
function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ProductListingPage({ searchParams }: ProductListingPageProps) {
  const params = await searchParams;
  // Ô tìm kiếm ở header mở /san-pham?q=<từ khóa>; các thẻ vùng miền mở /san-pham?region=bac
  const initialSearch = firstValue(params.q).trim().slice(0, 100);
  const regionValue = firstValue(params.region);
  const initialRegion = isRegion(regionValue) ? regionValue : undefined;
  // Các mục "Tìm theo tỉnh" ở trang chủ mở /san-pham?province=Cà Mau
  const initialProvince = firstValue(params.province).trim().slice(0, 100);
  // Trang chi tiết sản phẩm mở /san-pham?brand=Hồng Lam để xem mọi sản phẩm của thương hiệu đó
  const initialBrand = firstValue(params.brand).trim().slice(0, 100);

  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-title">Tất cả sản phẩm</h1>
        <span className="mt-3 block max-w-[560px] text-ink-muted">Đặc sản chọn lọc từ ba miền Bắc, Trung, Nam.</span>
      </div>

      {/* key: tìm kiếm mới từ header (một ?q= khác) làm danh sách bắt đầu lại với từ khóa mới */}
      <ProductListing
        key={`${initialSearch}|${initialRegion ?? ""}|${initialProvince}|${initialBrand}`}
        initialSearch={initialSearch}
        initialRegion={initialRegion}
        initialProvince={initialProvince}
        initialBrand={initialBrand}
      />
    </PageContainer>
  );
}
