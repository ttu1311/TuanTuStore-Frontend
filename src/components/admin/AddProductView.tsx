"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useStore } from "@/context/StoreContext";

// /admin/san-pham/them: an empty form that adds a new product to localStorage
export default function AddProductView() {
  const { addProduct } = useStore();
  return <ProductForm submitLabel="Thêm sản phẩm" onSave={addProduct} />;
}
