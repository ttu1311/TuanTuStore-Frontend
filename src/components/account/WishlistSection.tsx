"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";

// "Sản phẩm yêu thích" trong trang tài khoản: các món khách đã bấm ♡, món mới thích đứng đầu.
// Lưu theo tài khoản (localStorage của trình duyệt này), nên đăng nhập lại vẫn còn.
export default function WishlistSection() {
  const { products, wishlist } = useStore();
  // Sản phẩm Admin đã xóa thì không hiện nữa
  const items = wishlist.flatMap((id) => products.find((product) => product.id === id) ?? []);

  return (
    // Tiêu đề "Sản phẩm yêu thích" là tiêu đề của cả trang (AccountShell), không lặp lại ở đây
    <div>
      <p className="text-ink-muted">Bấm ♡ trên một sản phẩm để lưu vào đây. Bấm lại để bỏ.</p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <p className="font-semibold text-ink">Bạn chưa có sản phẩm yêu thích nào</p>
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-4`}>
            Khám phá đặc sản
          </Link>
        </div>
      ) : (
        // Thẻ có cỡ như ở trang chủ và trang Sản phẩm (khoảng 210 đến 290px), không bị kéo giãn dù chỉ có 1 hay 2 món:
        // - từ 520px: lưới tự xếp theo bề rộng thẻ (mỗi thẻ tối thiểu 13rem), các ô trống giữ chỗ nên một món vẫn chỉ bằng một ô;
        // - dưới 520px chỉ vừa một cột (auto-fill sẽ kéo cột duy nhất ra hết khung): một cột rộng tối đa 18rem, hẹp hơn thì bằng khung.
        <ul className="mt-6 grid grid-cols-[minmax(0,18rem)] gap-x-6 gap-y-8 min-[520px]:grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
          {items.map((product) => (
            <li key={product.id} className="flex">
              {/* sizes khớp bề rộng thẻ ở đây: tối đa 18rem ở điện thoại (hẹp hơn thì bằng khung trừ lề trang và đệm khung), khoảng 290px từ 520px */}
              <ProductCard product={product} sizes="(min-width: 520px) 290px, min(18rem, calc(100vw - 5rem))" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
