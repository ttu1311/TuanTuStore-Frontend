import type { Metadata } from "next";
import ProductDetailView from "@/components/product/ProductDetailView";

// Tiêu đề tab do ProductDetailView tự hiển thị bằng thẻ <title> (tên sản phẩm chỉ có sau khi đọc localStorage).
// `title: null`: route này không có <title> từ metadata (kể cả title kế thừa từ layout gốc). Nếu có, sau mỗi lần
// chuyển trang phía client (bấm Link, router.replace) Next.js gắn thẻ <title> đó SAU khi trang đã hiện,
// và React đặt thẻ <title> mới nhất lên đầu <head>, nên tab sẽ đổi thành tiêu đề chung thay vì tên sản phẩm.
export const metadata: Metadata = { title: null };

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return <ProductDetailView id={id} />;
}
