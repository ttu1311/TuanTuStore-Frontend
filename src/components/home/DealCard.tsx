import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import WishlistButton from "@/components/product/WishlistButton";
import { formatVND } from "@/lib/format";
import { discountPercent, savingAmount } from "@/lib/products";
import { regions } from "@/lib/regions";
import type { Product } from "@/types";

// Thẻ của khối "Sản phẩm đang khuyến mãi": gọn hơn ProductCard (bỏ sao đánh giá và dòng "Còn X sản phẩm"),
// nhấn vào mức giảm: nhãn "-X%" to ở góc ảnh, giá mới to màu sale, giá cũ gạch ngang và số tiền tiết kiệm.
// Rê chuột: thẻ nhấc lên, ảnh phóng nhẹ, chip "Tiết kiệm" đậm lên. Chỉ nhận sản phẩm đang giảm giá và còn hàng (xem TodayDeals).
export default function DealCard({ product }: { product: Product }) {
  const detailUrl = `/san-pham/${product.id}`;
  const region = regions[product.region];

  return (
    <article className="group flex h-full flex-col rounded-xl border border-line bg-white p-3 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card">
      <div className="relative overflow-hidden rounded-lg bg-surface">
        {/* Ảnh liên kết tới trang chi tiết. Tên bên dưới là liên kết thân thiện với bàn phím. */}
        <Link href={detailUrl} tabIndex={-1} aria-hidden="true" className="block">
          <Image
            src={product.image}
            width={960}
            height={720}
            alt={product.name}
            sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 72vw"
            className="block aspect-square h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        {/* Nhãn giảm giá to ở góc trái; một vệt sáng lướt qua mỗi vài giây (tắt khi người dùng bật "giảm chuyển động") */}
        <span className="absolute left-2 top-2 overflow-hidden rounded-md bg-sale px-2.5 py-1 text-base font-bold leading-none text-white shadow-sm">
          -{discountPercent(product)}%
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:animate-shimmer"
          />
        </span>
        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="sr-only">{region.label}, </span>
          <span className="min-w-0 truncate">{product.origin}</span>
        </p>
        {/* Tối đa 2 dòng; min-h giữ chỗ đủ 2 dòng để giá của các thẻ cạnh nhau thẳng hàng */}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-base/[1.375rem] font-semibold text-ink">
          <Link href={detailUrl} className="transition-colors duration-200 hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="whitespace-nowrap text-xl font-bold text-sale">{formatVND(product.price)}</span>
          <span className="whitespace-nowrap text-sm text-ink-muted line-through">
            <span className="sr-only">Giá cũ </span>
            {formatVND(product.oldPrice ?? product.price)}
          </span>
        </div>
        <p className="mt-2 w-fit rounded-full bg-sale/10 px-2.5 py-1 text-xs font-semibold text-sale transition-colors duration-300 group-hover:bg-sale group-hover:text-white">
          Tiết kiệm {formatVND(savingAmount(product))}
        </p>

        <div className="mt-auto pt-3">
          <AddToCartButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </article>
  );
}
