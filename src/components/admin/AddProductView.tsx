"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useStore } from "@/context/StoreContext";

// /admin/san-pham/them: form trống để thêm sản phẩm mới vào localStorage
export default function AddProductView() {
  const { addProduct } = useStore();
  return <ProductForm submitLabel="Thêm sản phẩm" onSave={addProduct} />;
}
