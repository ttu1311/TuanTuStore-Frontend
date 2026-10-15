import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/product/ProductDetailView";

// The real product name is set in the browser tab by ProductDetailView, once localStorage has been read
export const metadata: Metadata = { title: "Chi tiết sản phẩm — TuanTuStore" };

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Header currentPath="/san-pham" />
      <main id="main-content">
        <ProductDetailView id={id} />
      </main>
      <Footer />
    </>
  );
}
