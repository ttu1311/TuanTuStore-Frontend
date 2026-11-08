"use client";

import Image from "next/image";
import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { actionEdit, table, tableWrap, td, th } from "@/components/admin/tableStyles";
import RegionBadge from "@/components/product/RegionBadge";
import { useStore } from "@/context/StoreContext";
import { formatVND } from "@/lib/format";
import { sortNewestFirst } from "@/lib/products";
import { LOW_STOCK } from "@/lib/cart";

// Danh sách sản phẩm của Admin, mới nhất lên đầu, mỗi dòng có "Sửa" và "Xóa"
export default function AdminProductTable() {
  const { products } = useStore();

  return (
    <div className={tableWrap}>
      <table className={`${table} min-w-[820px]`}>
        <thead>
          <tr>
            <th className={th}>Ảnh</th>
            <th className={th}>Tên sản phẩm</th>
            <th className={th}>Vùng miền</th>
            <th className={th}>Thương hiệu</th>
            <th className={th}>Giá</th>
            <th className={th}>Tồn kho</th>
            <th className={th}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className={`${td} py-10 text-center text-ink-muted`}>
                Chưa có sản phẩm nào.
              </td>
            </tr>
          ) : (
            sortNewestFirst(products).map((product) => (
              <tr key={product.id} className="group">
                <td className={td}>
                  <Image
                    src={product.image}
                    width={48}
                    height={48}
                    alt={product.name}
                    className="h-12 w-12 max-w-none rounded-lg object-cover"
                  />
                </td>
                <td className={`${td} font-medium`}>
                  {product.name}
                  <span className="block text-xs font-normal text-ink-muted">
                    {product.pack}
                    {product.isFeatured && " · Ưu tiên nổi bật"}
                    {product.rank && ` · Top ${product.rank}`}
                  </span>
                </td>
                <td className={td}>
                  <RegionBadge region={product.region} />
                </td>
                <td className={td}>{product.brand}</td>
                <td className={`${td} whitespace-nowrap`}>{formatVND(product.price)}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {product.stock <= 0 ? (
                    <span className="font-semibold text-sale">Hết hàng</span>
                  ) : (
                    <span className={product.stock <= LOW_STOCK ? "font-semibold text-gold-ink" : ""}>{product.stock}</span>
                  )}
                </td>
                <td className={td}>
                  <div className="flex items-start gap-2">
                    <Link href={`/admin/san-pham/${product.id}/sua`} aria-label={`Sửa ${product.name}`} className={actionEdit}>
                      Sửa
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
