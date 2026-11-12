import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import TopBadge from "@/components/product/TopBadge";
import WishlistButton from "@/components/product/WishlistButton";
import ProductRatingLine from "@/components/reviews/ProductRatingLine";
import { formatVND } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import { regions } from "@/lib/regions";
import type { Product } from "@/types";

// eager: tải ảnh ngay (cho các thẻ đầu tiên ở đầu trang)
export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const discount = discountPercent(product);
  const detailUrl = `/san-pham/${product.id}`;
  const region = regions[product.region];

  return (
    <article className="group flex flex-1 flex-col">
      <div className="relative overflow-hidden rounded-lg bg-surface">
        {/* Ảnh liên kết tới trang chi tiết. Tên bên dưới là liên kết thân thiện với bàn phím. */}
        <Link href={detailUrl} tabIndex={-1} aria-hidden="true" className="block">
          {/* Mọi ảnh sản phẩm được cắt thành hình vuông, nên một kích thước cố định là đủ cho next/image */}
          <Image
            src={product.image}
            width={960}
            height={720}
            alt={product.name}
            loading={eager ? "eager" : undefined}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 480px) 45vw, 100vw"
            className="block aspect-square h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        {/* Nhãn "Top 1/2/3": tự tính từ số lượng đã bán */}
        <TopBadge productId={product.id} />
        {/* Trái tim "Yêu thích" ở góc trên bên phải; nhãn giảm giá nằm ngay dưới nó */}
        <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>
        {discount > 0 && (
          <span className="absolute right-3 top-[3.75rem] rounded bg-sale px-2 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-sm font-semibold uppercase tracking-wide text-white">
            Hết hàng
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {/* Chấm màu của vùng miền (cùng màu với tab miền và bản đồ) */}
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <span className={`h-2 w-2 shrink-0 rounded-full ${region.dotClass}`} aria-hidden="true" />
          <span className="sr-only">{region.label}, </span>
          <span className="min-w-0 truncate">{product.origin}</span>
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug">
          <Link href={detailUrl} className="hover:underline hover:decoration-2 hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        {/* Sao đánh giá và số đã bán (chỉ hiện khi đã có) */}
        <div className="mt-1">
          <ProductRatingLine productId={product.id} />
        </div>

        <div className="mb-4 mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="whitespace-nowrap text-lg font-bold text-ink">{formatVND(product.price)}</span>
          {product.oldPrice && (
            <span className="whitespace-nowrap text-sm text-ink-muted line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVND(product.oldPrice)}
            </span>
          )}
          <span className="text-sm text-ink-muted">{product.pack}</span>
        </div>
        {product.stock > 0 && <p className="-mt-3 mb-3 text-sm text-ink-muted">Còn {product.stock} sản phẩm</p>}

        <AddToCartButton productId={product.id} productName={product.name} />
      </div>
    </article>
  );
}
