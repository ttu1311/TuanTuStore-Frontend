"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";

// Nút "Thêm vào giỏ" của thẻ sản phẩm. Thêm 1 sản phẩm vào giỏ trong localStorage,
// rồi hiện "Đã thêm vào giỏ" trong 2 giây để khách thấy đã thành công.
export default function AddToCartButton({
  productId,
  productName,
  className = "mt-auto w-full",
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          addToCart(productId, 1);
          setAdded(true);
        }}
        className={`${btnBase} ${btnPrimary} ${btnSmall} ${className}`}
      >
        <Icon name={added ? "check" : "plus"} size={16} />
        {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        {/* Trình đọc màn hình đọc được nút này thuộc về sản phẩm nào */}
        <span className="sr-only">: {productName}</span>
      </button>
      {/* Nằm ngoài nút, để được đọc một lần và không trở thành một phần tên của nút */}
      <span className="sr-only" aria-live="polite">
        {added ? `Đã thêm ${productName} vào giỏ hàng` : ""}
      </span>
    </>
  );
}
