import Link from "next/link";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";

type NotFoundMessageProps = {
  title?: string;
  description?: string;
};

// Thẻ "Lỗi 404". Dùng bởi app/not-found.tsx (địa chỉ không tồn tại) và bởi trang sản phẩm (sản phẩm không tồn tại).
export default function NotFoundMessage({
  title = "Không tìm thấy trang",
  description = "Trang bạn đang tìm không tồn tại hoặc đã được di chuyển. Hãy quay về trang chủ hoặc xem các sản phẩm của cửa hàng.",
}: NotFoundMessageProps) {
  return (
    <div className="rounded-lg bg-surface px-6 py-16 text-center">
      <p className="font-display text-7xl font-bold leading-none text-ink-muted">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-title">{title}</h1>
      <p className="mx-auto mt-3 max-w-[480px] text-ink-muted">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={`${btnBase} ${btnPrimary}`}>
          Về trang chủ
        </Link>
        <Link href="/san-pham" className={`${btnBase} ${btnSecondary}`}>
          Xem sản phẩm
        </Link>
      </div>
    </div>
  );
}
