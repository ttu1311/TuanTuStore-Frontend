import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductListing from "@/components/products/ProductListing";
import { isRegion } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Sản phẩm — TuanTuStore",
  description: "Tất cả đặc sản ba miền Bắc, Trung, Nam tại TuanTuStore.",
};

type ProductListingPageProps = {
  searchParams: Promise<{ q?: string | string[]; region?: string | string[] }>;
};

// The first value when a query parameter appears several times
function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ProductListingPage({ searchParams }: ProductListingPageProps) {
  const params = await searchParams;
  // The header search box opens /san-pham?q=<search term>; the region cards open /san-pham?region=bac
  const initialSearch = firstValue(params.q).trim().slice(0, 100);
  const regionValue = firstValue(params.region);
  const initialRegion = isRegion(regionValue) ? regionValue : undefined;

  return (
    <>
      <Header currentPath="/san-pham" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-title">Tất cả sản phẩm</h1>
            <span className="mt-3 block max-w-[560px] text-ink-muted">Đặc sản chọn lọc từ ba miền Bắc, Trung, Nam.</span>
          </div>

          {/* key: a new header search (another ?q=) starts the listing again with the new term */}
          <ProductListing
            key={`${initialSearch}|${initialRegion ?? ""}`}
            initialSearch={initialSearch}
            initialRegion={initialRegion}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
