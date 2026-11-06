import Image from "next/image";
import Link from "next/link";
import RegionBadge from "@/components/product/RegionBadge";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types";

// Một dòng sản phẩm nhỏ cho Sidebar: ảnh, tên, vùng miền và giá, tất cả là một liên kết tới trang sản phẩm.
// (ProductCard đầy đủ, có "Thêm vào giỏ", quá lớn cho một cột hẹp.)
export default function ProductMiniCard({ product }: { product: Product }) {
  return (
    <Link href={`/san-pham/${product.id}`} className="group flex items-center gap-3 py-3">
      <Image
        src={product.image}
        width={960}
        height={720}
        alt=""
        sizes="64px"
        className="h-16 w-16 shrink-0 rounded-md bg-surface object-cover"
      />
      <span className="min-w-0">
        <span className="block font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary">
          {product.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-primary">{formatVND(product.price)}</span>
          <RegionBadge region={product.region} />
        </span>
      </span>
    </Link>
  );
}
