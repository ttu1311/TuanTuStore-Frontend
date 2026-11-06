// Khung xám giữ chỗ có kích thước bằng ProductCard, hiển thị trong lúc sản phẩm tải từ localStorage.
// Nó giúp trang không bị giật khi các thẻ thật xuất hiện.
export default function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square w-full animate-pulse rounded-lg bg-surface" />
      <div className="space-y-3 pt-4">
        <div className="h-4 w-1/2 rounded bg-surface" />
        <div className="h-5 w-3/4 rounded bg-surface" />
        <div className="h-6 w-1/3 rounded bg-surface" />
        <div className="h-12 w-full rounded-md bg-surface" />
      </div>
    </div>
  );
}
