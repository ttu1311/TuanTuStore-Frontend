"use client";

import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { productToFormValues } from "@/lib/products";

// /admin/san-pham/[id]/sua: the form filled with the product saved in localStorage
export default function EditProductView({ id }: { id: string }) {
  const { products, updateProduct } = useStore();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="rounded-xl border border-line bg-white px-6 py-12 text-center">
        <p className="font-semibold text-ink">Không tìm thấy sản phẩm</p>
        <p className="mt-2 text-sm text-ink-muted">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link href="/admin/san-pham" className={`${btnBase} ${btnPrimary} ${btnSmall} mt-5`}>
          Về danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      // key: if the product changes in another tab, the form starts again from the saved values
      key={product.id}
      initialValues={productToFormValues(product)}
      submitLabel="Lưu thay đổi"
      onSave={(input) => updateProduct(product.id, input)}
    />
  );
}
