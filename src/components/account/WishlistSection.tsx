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
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Sản phẩm yêu thích</h2>
      <p className="mt-2 text-ink-muted">Bấm ♡ trên một sản phẩm để lưu vào đây. Bấm lại để bỏ.</p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <p className="font-semibold text-ink">Bạn chưa có sản phẩm yêu thích nào</p>
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-4`}>
            Khám phá đặc sản
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
