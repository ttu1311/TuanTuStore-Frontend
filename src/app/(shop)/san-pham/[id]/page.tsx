import type { Metadata } from "next";
import ProductDetailView from "@/components/product/ProductDetailView";

// Tên sản phẩm thật được ProductDetailView đặt lên tab trình duyệt, sau khi đã đọc xong localStorage
export const metadata: Metadata = { title: "Chi tiết sản phẩm — TuanTuStore" };

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return <ProductDetailView id={id} />;
}
