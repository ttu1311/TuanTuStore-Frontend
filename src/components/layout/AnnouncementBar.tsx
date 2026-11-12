import Link from "next/link";
import { FREE_SHIPPING_MIN } from "@/lib/cart";
import { formatVND } from "@/lib/format";

// Dải thông báo mỏng trên cùng mọi trang cửa hàng (nằm trên Header, cuộn đi theo trang).
// Mức miễn phí vận chuyển lấy từ src/lib/cart.ts, nên luôn khớp với giỏ hàng.
export default function AnnouncementBar() {
  return (
    // Dải màu đặc trưng (đỏ rượu của logo), chữ trắng (≈ 10:1): nổi bật ưu đãi miễn phí vận chuyển
    <div className="bg-primary text-sm text-white">
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-center md:px-6 lg:justify-between lg:px-8">
        <p>
          Miễn phí vận chuyển cho đơn từ <span className="font-bold">{formatVND(FREE_SHIPPING_MIN)}</span>
        </p>
        <nav aria-label="Hỗ trợ nhanh" className="hidden gap-5 lg:flex">
          <Link href="/tra-cuu-don-hang" className="underline-offset-4 hover:underline">
            Tra cứu đơn hàng
          </Link>
          <Link href="/thong-tin/huong-dan-mua-hang" className="underline-offset-4 hover:underline">
            Hướng dẫn mua hàng
          </Link>
          <Link href="/thong-tin/cau-hoi-thuong-gap" className="underline-offset-4 hover:underline">
            Câu hỏi thường gặp
          </Link>
        </nav>
      </div>
    </div>
  );
}
